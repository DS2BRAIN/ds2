// @flow weak

import React, { Fragment, useEffect, useState } from "react"
import HighlightBox from "../HighlightBox"
import { styled } from "@material-ui/core/styles"
import PreventScrollToParents from "../PreventScrollToParents"
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle"
// import { useEffect } from "@storybook/addons"

const TransformGrabber = styled("div")({
  width: 2,
  height: 2,
  zIndex: 999,
  border: "2px solid rgb(24, 160, 251)",
  position: "absolute",
})

const boxCursorMap = [
  ["nw-resize", "n-resize", "ne-resize"],
  ["w-resize", "grab", "e-resize"],
  ["sw-resize", "s-resize", "se-resize"],
]

export const RegionSelectAndTransformBoxes = ({
  state,
  image,
  regions,
  mouseEvents,
  projectRegionBox,
  dragWithPrimary,
  createWithPrimary,
  zoomWithPrimary,
  onBeginMovePoint,
  onSelectRegion,
  layoutParams,
  mat,
  onBeginBoxTransform,
  onBeginMovePolygonPoint,
  onDeletePolygonPoint,
  onAddPolygonPoint,
  onBeginMovePolylinePoint,
  onAddPolylinePoint,
  onDeleteRegion,
  onGetMagicPathDispatch,
  onUpdateMagicPathDispatch,
  onGetBoxPathDispatch,
}) => {
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [delIdx, setDelIdx] = useState(0)

  const showDeleteIcon = (e) => {
    const targetIdx = parseInt(e.target.dataset.idx)

    if (delIdx !== targetIdx) setDelIdx(targetIdx)
    else return
  }

  useEffect(() => {
    const setDeleteMode = (e) => {
      if (e.key === "Alt") setIsDeleteMode(true)
      else return
    }

    const clearDeleteMode = (e) => {
      if (e.key === "Alt") setIsDeleteMode(false)
      else return
    }

    window.addEventListener("keydown", (e) => setDeleteMode(e))
    window.addEventListener("keyup", (e) => clearDeleteMode(e))
    return () => {
      window.removeEventListener("keydown", (e) => setDeleteMode())
      window.removeEventListener("keyup", (e) => clearDeleteMode(e))
    }
  })

  return regions
    .filter((r) => r.visible || r.visible === undefined)
    .filter((r) => !r.locked)
    .map((r, i) => {
      const pbox = projectRegionBox(r)
      const { iw, ih } = layoutParams.current
      return (
        <Fragment key={r.id}>
          <PreventScrollToParents>
            <HighlightBox
              className="highlightBox"
              state={state}
              image={image}
              region={r}
              mouseEvents={mouseEvents}
              dragWithPrimary={dragWithPrimary}
              createWithPrimary={createWithPrimary}
              zoomWithPrimary={zoomWithPrimary}
              onBeginMovePoint={onBeginMovePoint}
              onSelectRegion={onSelectRegion}
              pbox={pbox}
              onDeleteRegion={onDeleteRegion}
              onGetMagicPathDispatch={onGetMagicPathDispatch}
              onUpdateMagicPathDispatch={onUpdateMagicPathDispatch}
              onGetBoxPathDispatch={onGetBoxPathDispatch}
            />
            {r.type === "box" &&
              !dragWithPrimary &&
              !zoomWithPrimary &&
              !r.locked &&
              r.highlighted &&
              mat.a < 1.2 &&
              [
                [0, 0],
                [0.5, 0],
                [1, 0],
                [1, 0.5],
                [1, 1],
                [0.5, 1],
                [0, 1],
                [0, 0.5],
                [0.5, 0.5],
              ].map(([px, py], i) => (
                <TransformGrabber
                  key={i}
                  {...mouseEvents}
                  onMouseDown={(e) => {
                    if (e.button === 0)
                      return onBeginBoxTransform(r, [px * 2 - 1, py * 2 - 1])
                    mouseEvents.onMouseDown(e)
                  }}
                  style={{
                    left: pbox.x - 4 - 2 + pbox.w * px,
                    top: pbox.y - 4 - 2 + pbox.h * py,
                    cursor: boxCursorMap[py * 2][px * 2],
                    borderRadius: px === 0.5 && py === 0.5 ? 4 : undefined,
                  }}
                />
              ))}
            {r.type === "polyline" &&
              !dragWithPrimary &&
              !zoomWithPrimary &&
              !r.locked &&
              r.highlighted &&
              r.points.map(([px, py], i) => {
                const proj = mat
                  .clone()
                  .inverse()
                  .applyToPoint(px * iw, py * ih)
                return (
                  <TransformGrabber
                    key={i}
                    {...mouseEvents}
                    onMouseDown={(e) => {
                      if (e.button === 0 && (!r.open || i === 0))
                        return onBeginMovePolylinePoint(r, i)
                      mouseEvents.onMouseDown(e)
                    }}
                    style={{
                      cursor: !r.open
                        ? "move"
                        : i === 0
                        ? "pointer"
                        : undefined,
                      pointerEvents:
                        r.open && i === r.points.length - 1
                          ? "none"
                          : undefined,
                      left: proj.x - 4,
                      top: proj.y - 4,
                    }}
                  />
                )
              })}
            {r.type === "polygon" &&
              !dragWithPrimary &&
              !zoomWithPrimary &&
              !r.locked &&
              r.highlighted &&
              r.points.map(([px, py], i) => {
                const proj = mat
                  .clone()
                  .inverse()
                  .applyToPoint(px * iw, py * ih)
                return (
                  <TransformGrabber
                    key={i}
                    data-idx={i}
                    {...mouseEvents}
                    onMouseDown={(e) => {
                      if (e.button === 0 && (!r.open || i === 0)) {
                        if (isDeleteMode) {
                          return onDeletePolygonPoint(r, i)
                        } else {
                          return onBeginMovePolygonPoint(r, i)
                        }
                      }
                      mouseEvents.onMouseDown(e)
                    }}
                    onMouseEnter={(e) => {
                      showDeleteIcon(e)
                    }}
                    onMouseLeave={() => {
                      setDelIdx("")
                    }}
                    style={{
                      cursor:
                        !r.open && isDeleteMode
                          ? "pointer"
                          : !r.open && !isDeleteMode
                          ? "move"
                          : i === 0
                          ? "pointer"
                          : undefined,
                      pointerEvents:
                        r.open && i === r.points.length - 1
                          ? "none"
                          : undefined,
                      left: proj.x - 4,
                      top: proj.y - 4,
                    }}
                  >
                    {!r.open && isDeleteMode && i === delIdx && (
                      <RemoveCircleIcon
                        style={{
                          position: "absolute",
                          top: "-20px",
                          left: "6px",
                          color: "#eb4034",
                          fontSize: "20px",
                          fontWeight: "bold",
                        }}
                      />
                    )}
                  </TransformGrabber>
                )
              })}
            {r.type === "polyline" &&
              r.highlighted &&
              !dragWithPrimary &&
              !zoomWithPrimary &&
              !r.locked &&
              !r.open &&
              r.points.length > 1 &&
              r.points
                .map((p1, i) => [p1, r.points[(i + 1) % r.points.length]])
                .map(([p1, p2]) => [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2])
                .map((pa, i) => {
                  const proj = mat
                    .clone()
                    .inverse()
                    .applyToPoint(pa[0] * iw, pa[1] * ih)
                  return (
                    <TransformGrabber
                      key={i}
                      {...mouseEvents}
                      onMouseDown={(e) => {
                        if (e.button === 0)
                          return onAddPolylinePoint(r, pa, i + 1)
                        mouseEvents.onMouseDown(e)
                      }}
                      style={{
                        cursor: "copy",
                        left: proj.x - 4,
                        top: proj.y - 4,
                        border: "2px dotted #fff",
                        opacity: 0.5,
                      }}
                    />
                  )
                })}
            {r.type === "polygon" &&
              r.highlighted &&
              !dragWithPrimary &&
              !zoomWithPrimary &&
              !r.locked &&
              !r.open &&
              r.points.length > 1 &&
              r.points
                .map((p1, i) => [p1, r.points[(i + 1) % r.points.length]])
                .map(([p1, p2]) => [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2])
                .map((pa, i) => {
                  const proj = mat
                    .clone()
                    .inverse()
                    .applyToPoint(pa[0] * iw, pa[1] * ih)
                  return (
                    <TransformGrabber
                      key={i}
                      {...mouseEvents}
                      onMouseDown={(e) => {
                        if (e.button === 0)
                          return onAddPolygonPoint(r, pa, i + 1)
                        mouseEvents.onMouseDown(e)
                      }}
                      style={{
                        cursor: "copy",
                        left: proj.x - 4,
                        top: proj.y - 4,
                        border: "2px dotted #fff",
                        opacity: 0.5,
                      }}
                    />
                  )
                })}
          </PreventScrollToParents>
        </Fragment>
      )
    })
}

export default RegionSelectAndTransformBoxes
