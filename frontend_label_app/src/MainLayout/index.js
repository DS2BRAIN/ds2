// @flow

import React, { useState, useRef, useEffect } from "react"
import type { Node } from "react"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import Sidebar from "../Sidebar"
import ImageCanvas from "../ImageCanvas"
import Header from "../Header"
import IconTools from "../IconTools"
import styles from "./styles"
import type { MainLayoutState, Action } from "./types"
import useKey from "use-key-hook"
import classnames from "classnames"
import { useSettings } from "../SettingsProvider"
import SettingsDialog from "../SettingsDialog"
import Fullscreen from "../Fullscreen"
import getActiveImage from "../Annotator/reducers/get-active-image"
import useImpliedVideoRegions from "./use-implied-video-regions"
import MySnackbar from "../Snackbar/MySnackbar"
import Snackbar from "@material-ui/core/Snackbar"

const useStyles = makeStyles(styles)

type Props = {
  state: MainLayoutState,
  RegionEditLabel?: Node,
  dispatch: (Action) => any,
  alwaysShowNextButton?: boolean,
  alwaysShowPrevButton?: boolean,
}

export default ({
  state,
  dispatch,
  alwaysShowNextButton = false,
  alwaysShowPrevButton = false,
  RegionEditLabel,
}: Props) => {
  const classes = useStyles()
  const settings = useSettings()

  const memoizedActionFns = useRef({})
  const action = (type: string, ...params: Array<string>) => {
    const fnKey = `${type}(${params.join(",")})`
    if (memoizedActionFns.current[fnKey])
      return memoizedActionFns.current[fnKey]

    const fn = (...args: any) =>
      params.length > 0
        ? dispatch(
            ({
              type,
              ...params.reduce((acc, p, i) => ((acc[p] = args[i]), acc), {}),
            }: any)
          )
        : dispatch({ type, ...args[0] })
    memoizedActionFns.current[fnKey] = fn
    return fn
  }

  const { currentImageIndex, activeImage } = getActiveImage(state)
  let nextImage
  if (currentImageIndex !== null) {
    nextImage = state.images[currentImageIndex + 1]
  }

  useKey(() => dispatch({ type: "CANCEL" }), {
    detectKeys: [27],
  })

  const isAVideoFrame = activeImage && activeImage.frameTime !== undefined

  let impliedVideoRegions = useImpliedVideoRegions(state)

  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
  const [snackbarContent, setSnackbarContent] = React.useState({
    variant: "success",
    message: "",
  })

  const snackbarClose = () => {
    setIsSnackbarOpen(false)
  }

  const setSnackbarOption = async (_variant, _message) => {
    await setIsSnackbarOpen(false)
    await setSnackbarContent({
      variant: _variant,
      message: _message,
    })
    await setIsSnackbarOpen(true)
  }

  return (
    <Fullscreen
      enabled={state.fullScreen}
      onChange={(open) => {
        if (!open) {
          action("HEADER_BUTTON_CLICKED", "buttonName")("Exit Fullscreen")
        }
      }}
    >
      <div
        className={classnames(
          classes.container,
          state.fullScreen && "Fullscreen"
        )}
      >
        <div className={classes.headerContainer}>
          <Header
            images={state.images}
            setSnackbarOption={setSnackbarOption}
            onHeaderButtonClick={action(
              "HEADER_BUTTON_CLICKED",
              "buttonName",
              "url"
            )}
            videoMode={state.annotationType === "video"}
            alwaysShowNextButton={alwaysShowNextButton}
            alwaysShowPrevButton={alwaysShowPrevButton}
            inFullScreen={state.fullScreen}
            isAVideoFrame={isAVideoFrame}
            nextVideoFrameHasRegions={
              !nextImage || (nextImage.regions && nextImage.regions.length > 0)
            }
            videoDuration={state.videoDuration}
            multipleImages={state.images && state.images.length > 1}
            title={
              state.annotationType === "image"
                ? activeImage
                  ? activeImage.name
                  : "No Image Selected"
                : state.videoName || ""
            }
            onChangeCurrentTime={action("CHANGE_VIDEO_TIME", "newTime")}
            videoPlaying={state.videoPlaying}
            currentVideoTime={state.currentVideoTime}
            keyframes={state.keyframes}
          />
        </div>
        <div className={classes.workspace}>
          <div className={classes.iconToolsContainer}>
            <IconTools
              enabledTools={state.enabledTools}
              showTags={state.showTags}
              selectedTool={state.selectedTool}
              onClickTool={action("SELECT_TOOL", "selectedTool")}
            />
          </div>
          <div className={classes.imageCanvasContainer}>
            {state.annotationType === "image" && !state.selectedImage ? (
              <div className={classes.noImageSelected}>No Image Selected</div>
            ) : (
              <div style={{ height: "100%", width: "100%" }}>
                <ImageCanvas
                  {...settings}
                  state={state}
                  image={state.images[0]}
                  key={state.selectedImage}
                  showTags={state.showTags}
                  allowedArea={state.allowedArea}
                  regionClsList={state.regionClsList}
                  regionTagList={state.regionTagList}
                  regions={
                    state.annotationType === "image"
                      ? activeImage.regions || []
                      : impliedVideoRegions
                  }
                  realSize={activeImage ? activeImage.realSize : undefined}
                  videoPlaying={state.videoPlaying}
                  imageSrc={
                    state.annotationType === "image"
                      ? state.selectedImage
                      : null
                  }
                  videoSrc={
                    state.annotationType === "video" ? state.videoSrc : null
                  }
                  pointDistancePrecision={state.pointDistancePrecision}
                  createWithPrimary={
                    state.selectedTool && state.selectedTool.includes("create")
                  }
                  dragWithPrimary={state.selectedTool === "pan"}
                  zoomWithPrimary={state.selectedTool === "zoom"}
                  showPointDistances={state.showPointDistances}
                  pointDistancePrecision={state.pointDistancePrecision}
                  videoTime={
                    state.annotationType === "image"
                      ? state.selectedImageFrameTime
                      : state.currentVideoTime
                  }
                  onMouseMove={action("MOUSE_MOVE")}
                  onMouseDown={action("MOUSE_DOWN")}
                  onMouseUp={action("MOUSE_UP")}
                  onChangeRegion={action("CHANGE_REGION", "region")}
                  onBeginRegionEdit={action("OPEN_REGION_EDITOR", "region")}
                  onCloseRegionEdit={action("CLOSE_REGION_EDITOR", "region")}
                  onDeleteRegion={action("DELETE_REGION", "region")}
                  onBeginBoxTransform={action(
                    "BEGIN_BOX_TRANSFORM",
                    "box",
                    "directions"
                  )}
                  onBeginMovePolygonPoint={action(
                    "BEGIN_MOVE_POLYGON_POINT",
                    "polygon",
                    "pointIndex"
                  )}
                  onDeletePolygonPoint={action(
                    "DELETE_POLYGON_POINT",
                    "polygon",
                    "pointIndex"
                  )}
                  onAddPolygonPoint={action(
                    "ADD_POLYGON_POINT",
                    "polygon",
                    "point",
                    "pointIndex"
                  )}
                  onBeginMovePolylinePoint={action(
                    "BEGIN_MOVE_POLYLINE_POINT",
                    "polyline",
                    "pointIndex"
                  )}
                  onAddPolylinePoint={action(
                    "ADD_POLYLINE_POINT",
                    "polyline",
                    "point",
                    "pointIndex"
                  )}
                  onSelectRegion={action("SELECT_REGION", "region")}
                  onBeginMovePoint={action("BEGIN_MOVE_POINT", "point")}
                  onImageLoaded={action("IMAGE_LOADED", "image")}
                  RegionEditLabel={RegionEditLabel}
                  onImageOrVideoLoaded={action(
                    "IMAGE_OR_VIDEO_LOADED",
                    "metadata"
                  )}
                  onChangeVideoTime={action("CHANGE_VIDEO_TIME", "newTime")}
                  onChangeVideoPlaying={action(
                    "CHANGE_VIDEO_PLAYING",
                    "isPlaying"
                  )}
                  onGetMagicPathDispatch={action(
                    "GET_MAGIC_PATH",
                    "pointsArray",
                    "coords"
                  )}
                  onUpdateMagicPathDispatch={action(
                    "UPDATE_MAGIC_PATH",
                    "pointsArray",
                    "coords",
                    "id"
                  )}
                  onGetBoxPathDispatch={action("GET_BOX_PATH", "region")}
                />
              </div>
            )}
          </div>
          <div className={classes.sidebarContainer}>
            <Sidebar
              state={state}
              debug={window.localStorage.$ANNOTATE_DEBUG_MODE && state}
              taskDescription={state.taskDescription}
              images={state.images}
              regions={activeImage ? activeImage.regions : null}
              history={state.history}
              currentImage={activeImage}
              labelImages={state.labelImages}
              imageClsList={state.imageClsList}
              imageTagList={state.imageTagList}
              keyframes={state.keyframes}
              currentVideoTime={state.currentVideoTime}
              onChangeImage={action("CHANGE_IMAGE", "delta")}
              onSelectRegion={action("SELECT_REGION", "region")}
              onDeleteRegion={action("DELETE_REGION", "region")}
              onChangeLastClass={action("CHANGE_CLASS", "class", "color")}
              onSelectImage={action("SELECT_IMAGE", "image")}
              onChangeRegion={action("CHANGE_REGION", "region")}
              onRestoreHistory={action("RESTORE_HISTORY")}
              onRedoHistory={action("REDO_HISTORY")}
              onUndoHistory={action("UNDO_HISTORY")}
              onChangeVideoTime={action("CHANGE_VIDEO_TIME", "newTime")}
              onDeleteKeyframe={action("DELETE_KEYFRAME", "time")}
              onShortcutActionDispatched={dispatch}
            />
          </div>
        </div>
        <SettingsDialog
          open={state.settingsOpen}
          onClose={() =>
            dispatch({
              type: "HEADER_BUTTON_CLICKED",
              buttonName: "Settings",
            })
          }
        />
      </div>
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={isSnackbarOpen}
        onClose={snackbarClose}
      >
        <MySnackbar
          variant={snackbarContent.variant}
          className={classes.margin}
          message={snackbarContent.message}
        />
      </Snackbar>
    </Fullscreen>
  )
}
