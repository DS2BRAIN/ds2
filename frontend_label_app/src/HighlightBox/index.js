// @flow

import React, { useState, useEffect } from "react"
import classnames from "classnames"
import { makeStyles } from "@material-ui/core/styles"
import * as api from "../api.js"
import Modal from "@material-ui/core/Modal"
import Loading from "../Loading/Loading.js"
import Cookies from "../helpers/Cookies"

const useStyles = makeStyles({
  "@keyframes borderDance": {
    from: { strokeDashoffset: 0 },
    to: { strokeDashoffset: 100 },
  },
  highlightBox: {
    zIndex: 2,
    transition: "opacity 500ms",
    "&.highlighted": {
      zIndex: 3,
    },
    "&:not(.highlighted)": {
      opacity: 0,
    },
    "&:not(.highlighted):hover": {
      opacity: 0.6,
    },
    "& path": {
      vectorEffect: "non-scaling-stroke",
      strokeWidth: 2,
      stroke: "#FFF",
      fill: "none",
      strokeDasharray: 5,
      animationName: "$borderDance",
      animationDuration: "4s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
      animationPlayState: "running",
    },
  },
})

export const HighlightBox = ({
  state,
  image,
  mouseEvents,
  dragWithPrimary,
  zoomWithPrimary,
  createWithPrimary,
  onBeginMovePoint,
  onSelectRegion,
  region: r, //region.points
  pbox,
  onDeleteRegion,
  onGetMagicPathDispatch,
  onUpdateMagicPathDispatch,
  onGetBoxPathDispatch,
}: {
  state: any,
  mouseEvents: any,
  dragWithPrimary: boolean,
  zoomWithPrimary: boolean,
  createWithPrimary: boolean,
  onBeginMovePoint: Function,
  onSelectRegion: Function,
  region: any,
  pbox: { x: number, y: number, w: number, h: number },
  onGetMagicPathDispatch: any,
  onUpdateMagicPathDispatch: any,
  onGetBoxPathDispatch: any,
}) => {
  const classes = useStyles()
  const lang = Cookies.getCookie("language")
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  // const [positiveClicked, setPositiveClicked] = useState(
  //   state.magicToolClicked.positive ? state.magicToolClicked.positive
  // )
  // const [negativeClicked, setNegativeClicked] = useState(false)
  const getConvertedArray = async (points, x1, y1) => {
    let tempArr = []
    for (let x = 0; x < points.length; x++) {
      let insideTempArr = []
      let eachPointArr = points[x]
      insideTempArr.push(eachPointArr[0] / image.width)
      insideTempArr.push(eachPointArr[1] / image.height)
      tempArr.push(insideTempArr)
    }
    return tempArr
  }
  const getOriginalPoints = async (points) => {
    let tempArr = []
    for (let x = 0; x < points.length; x++) {
      let insideTempArr = []
      let eachPointArr = points[x]
      insideTempArr.push(Math.round(eachPointArr[0] * image.width))
      insideTempArr.push(Math.round(eachPointArr[1] * image.height))
      tempArr.push(insideTempArr)
    }
    return tempArr
  }

  useEffect(() => {
    if (r.type === "magic" && r.isMagicDone) {
      ;(async () => {
        try {
          await setIsLoadingModalOpen(true)
          const points = await api.getContourPoints(
            image.id,
            r.x,
            r.y,
            r.x + r.w,
            r.y + r.h,
            image.width,
            image.height,
            image.labelProjectId
          )
          const convertedPoints = await getConvertedArray(points, r.x, r.y)
          const coords = { x1: r.x, y1: r.y, x2: r.x + r.w, y2: r.y + r.h }
          await onGetMagicPathDispatch(convertedPoints, coords)
          await setIsLoadingModalOpen(false)
        } catch (e) {
          await onGetBoxPathDispatch(r)
          await alert(
            lang === "en"
              ? "Object recognition failed. Please label it manually."
              : "물체인식에 실패했습니다. 직접 라벨링 해주세요."
          )
          await setIsLoadingModalOpen(false)
        }
      })()
    }
  }, [r.isMagicDone])

  // useEffect(() => {
  //   if (state.magicToolClicked && state.magicToolClicked.positive) {
  //     setIsChanged(true)
  //   }
  // }, [state.magicToolClicked])
  // useEffect(() => {
  //   if (
  //     state.magicToolClicked &&
  //     state.magicToolClicked.positive &&
  //     !isChanged
  //   ) {
  //     setIsChanged(true)
  //   }
  // }, [state.magicToolClicked, isChanged])

  useEffect(() => {
    if (r.type === "polygon" && r.isMagicUpdateDone) {
      const positivePoints = state.positivePoints
        ? state.positivePoints[r.id]
        : []
      const negativePoints = state.negativePoints
        ? state.negativePoints[r.id]
        : []
      const priority = state.selectedTool.includes("positive")
        ? "positive"
        : "negative"
      ;(async () => {
        try {
          await setIsLoadingModalOpen(true)
          const originalPoints = await getOriginalPoints(r.points)
          const points = await api.putContourPoints({
            id: image.id,
            x1: r.coords.x1,
            y1: r.coords.y1,
            x2: r.coords.x2,
            y2: r.coords.y2,
            contour_points: originalPoints,
            positive_points: positivePoints,
            negative_points: negativePoints,
            width: image.width,
            height: image.height,
            priority,
            labelProjectId: image.labelProjectId,
          })
          const convertedPoints = await getConvertedArray(
            points,
            r.coords.x1,
            r.coords.y1
          )
          // const coords = { x1: r.x, y1: r.y, x2: r.x + r.w, y2: r.y + r.h }
          await onUpdateMagicPathDispatch(convertedPoints, r.coords, r.id)
          await setIsLoadingModalOpen(false)
          await setIsChanged(false)
        } catch (e) {
          await onGetBoxPathDispatch(r)
          await alert(
            lang === "en"
              ? "Object recognition failed. Please label it manually."
              : "물체인식에 실패했습니다. 직접 라벨링 해주세요."
          )
          await setIsLoadingModalOpen(false)
        }
      })()
    }
  }, [r.isMagicUpdateDone])

  return (
    <>
      <svg
        key={r.id}
        className={classnames(classes.highlightBox, {
          highlighted: r.highlighted,
        })}
        {...mouseEvents}
        {...(!zoomWithPrimary && !dragWithPrimary
          ? {
              onMouseDown: (e) => {
                if (
                  !r.locked &&
                  r.type === "point" &&
                  r.highlighted &&
                  e.button === 0
                ) {
                  return onBeginMovePoint(r)
                }
                if (e.button === 0 && !createWithPrimary)
                  return onSelectRegion(r)
                mouseEvents.onMouseDown(e)
              },
            }
          : {})}
        style={{
          ...(r.highlighted
            ? {
                pointerEvents: r.type !== "point" ? "none" : undefined,
                cursor: "grab",
              }
            : {
                cursor: !(
                  zoomWithPrimary ||
                  dragWithPrimary ||
                  createWithPrimary
                )
                  ? "pointer"
                  : undefined,
                pointerEvents:
                  zoomWithPrimary ||
                  dragWithPrimary ||
                  (createWithPrimary && !r.highlighted)
                    ? "none"
                    : undefined,
              }),
          position: "absolute",
          left: pbox.x - 5,
          top: pbox.y - 5,
          width: pbox.w + 10,
          height: pbox.h + 10,
        }}
      >
        <path
          d={`M5,5 L${pbox.w + 5},5 L${pbox.w + 5},${pbox.h + 5} L5,${
            pbox.h + 5
          } Z`}
        />
      </svg>

      <Modal
        open={isLoadingModalOpen}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loading />
      </Modal>
    </>
  )
}

export default HighlightBox
