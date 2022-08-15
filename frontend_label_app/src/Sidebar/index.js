// @flow

import React, { useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import TaskDescription from "../TaskDescriptionSidebarBox"
import ImageSelector from "../ImageSelectorSidebarBox"
import RegionSelector from "../RegionSelectorSidebarBox"
import SensitivitySlider from "../SensitivitySlider"
import History from "../HistorySidebarBox"
import DebugBox from "../DebugSidebarBox"
import TagsSidebarBox from "../TagsSidebarBox"
import KeyframesSelector from "../KeyframesSelectorSidebarBox"
import AIModelType from "../AIModelType"
import type { Region } from "../ImageCanvas/region-tools.js"
import Shortcuts from "../Shortcuts"
import Paper from "@material-ui/core/Paper"
import { grey } from "@material-ui/core/colors"
import { useSettings } from "../SettingsProvider"
import Button from "@material-ui/core/Button"
import Survey from "material-survey/components/Survey"
import VisibilityIcon from "@material-ui/icons/Visibility"
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff"
import { useTranslation } from "react-i18next"
import { InspectionResults } from "../InspectionResults"
import Cookies from "../helpers/Cookies"

const useStyles = makeStyles({
  container: { margin: 8 },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingLeft: 16,
    paddingRight: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    flexGrow: 1,
    paddingLeft: 8,
    color: grey[800],
    "& span": {
      color: grey[600],
      fontSize: 12,
    },
  },
  content: {
    fontSize: 14,
    flexGrow: 1,
    padding: "0 8px",
    color: grey[800],
    "& span": {
      color: grey[800],
      fontSize: 14,
    },
    "& svg": {
      color: grey[600],
    },
  },
  labelcontent: {
    display: "flex",
    fontSize: 14,
    padding: "4px 16px",
  },
})

type Image = {
  name: string,
  src: string,
  cls?: string,
  tags?: Array<string>,
  thumbnailSrc?: string,
  regions?: Array<Region>,
}

type Props = {
  debug: any,
  taskDescription: string,
  images?: Array<Image>,
  regions: Array<Region>,
  history: Array<{ state: Object, name: string, time: Date }>,

  labelImages?: boolean,
  currentImage?: Image,
  imageClsList?: Array<string>,
  imageTagList?: Array<string>,

  onChangeImage: (Image) => any,
  onSelectRegion: (Region) => any,
  onSelectImage: (Image) => any,
  onChangeRegion: (Region) => any,
  onDeleteRegion: (Region) => any,
  onRestoreHistory: () => any,
  onRedoHistory: () => any,
  onUndoHistory: () => any,
  onShortcutActionDispatched: (action: any) => any,
}

const emptyArr = []

export const Sidebar = ({
  state,
  debug,
  taskDescription,
  keyframes,
  images,
  regions,
  history,
  labelImages,
  currentImage,
  currentVideoTime,
  imageClsList,
  imageTagList,
  onChangeImage,
  onSelectRegion,
  onSelectImage,
  onChangeRegion,
  onDeleteRegion,
  onRestoreHistory,
  onRedoHistory,
  onUndoHistory,
  onChangeVideoTime,
  onDeleteKeyframe,
  onShortcutActionDispatched,
  onChangeLastClass,
}: Props) => {
  const classes = useStyles()
  const settings = useSettings()
  const { t } = useTranslation()
  const [classNameFromShortcut, setClassNameFromShortcut] = useState(null)
  const [classColorFromShortcut, setClassColorFromShortcut] = useState(null)
  const [isClassChanged, setIsClassChanged] = useState(false)
  const [isActiveShowCrosshair, setIsActiveShowCrosshair] = useState(true)
  const reviewer = images[0].reviewer
  // const userEmail = JSON.parse(Cookies.getCookie("user")).email
  const userEmail = Cookies.getCookie("assignee")

  if (!regions) regions = emptyArr

  const changeSetting = (q, a) => {
    settings.changeSetting(q, a)
    if (a) {
      setIsActiveShowCrosshair(true)
    } else {
      setIsActiveShowCrosshair(false)
    }
  }

  const changeClassFromShortcut = (className, classColor) => {
    setClassNameFromShortcut(className)
    setClassColorFromShortcut(classColor)
    setIsClassChanged(true)
  }

  useEffect(() => {
    if (isClassChanged) setIsClassChanged(false)
  }, [isClassChanged])

  useEffect(() => {
    changeSetting("showCrosshairs", false)
  }, [])

  return (
    <div>
      {debug && <DebugBox state={debug} lastAction={debug.lastAction} />}
      {(images[0].status === "review" ||
        images[0].status === "reject" ||
        images[0].inspectionResult ||
        userEmail === reviewer) && (
        <InspectionResults
          inspectionResult={
            images[0].inspectionResult ? images[0].inspectionResult : 0
          }
        />
      )}
      {state.selectedTool && state.selectedTool.includes("create-magic") && (
        <>
          <AIModelType />
          <SensitivitySlider />
        </>
      )}
      {(taskDescription || "").length > 1 && (
        <TaskDescription
          description={taskDescription}
          labelProjectId={images[0].labelProjectId}
          chart={images[0].chart}
        />
      )}
      {labelImages && (
        <TagsSidebarBox
          currentImage={currentImage}
          imageClsList={imageClsList}
          imageTagList={imageTagList}
          onChangeImage={onChangeImage}
          expandedByDefault
        />
      )}
      {images && images.length > 1 && (
        <ImageSelector onSelect={onSelectImage} images={images} />
      )}
      {!isClassChanged && (
        <RegionSelector
          state={state}
          images={images}
          regions={regions}
          onSelectRegion={onSelectRegion}
          onChangeRegion={onChangeRegion}
          onDeleteRegion={onDeleteRegion}
          onChangeLastClass={onChangeLastClass}
          classNameFromShortcut={classNameFromShortcut}
          classColorFromShortcut={classColorFromShortcut}
        />
      )}
      {keyframes && (
        <KeyframesSelector
          currentVideoTime={currentVideoTime}
          keyframes={keyframes}
          onChangeVideoTime={onChangeVideoTime}
          onDeleteKeyframe={onDeleteKeyframe}
        />
      )}
      <History
        history={history}
        onRestoreHistory={() => onRestoreHistory()}
        onRedoHistory={() => onRedoHistory()}
        onUndoHistory={() => onUndoHistory()}
        historyIndex={images[0].historyIndex}
      />
      <Shortcuts
        onShortcutActionDispatched={onShortcutActionDispatched}
        image={images[0]}
        onChangeLastClass={onChangeLastClass}
        changeClassFromShortcut={changeClassFromShortcut}
      />
      <Paper className={classes.container}>
        <div style={{ padding: "16px 8px" }} id="crosshairContainer">
          <div className={classes.title} style={{ padding: "0 16px 8px" }}>
            {t("눈금선")}
          </div>
          <div className={classes.content}>
            <Button onClick={() => changeSetting("showCrosshairs", true)}>
              <VisibilityIcon
                style={
                  isActiveShowCrosshair
                    ? { color: "#3f51b5" }
                    : { color: "inherit" }
                }
              />
              {t("보이기")}
            </Button>
            <Button onClick={() => changeSetting("showCrosshairs", false)}>
              <VisibilityOffIcon
                style={
                  !isActiveShowCrosshair
                    ? { color: "#3f51b5" }
                    : { color: "inherit" }
                }
              />
              {t("숨기기")}
            </Button>
          </div>
        </div>
      </Paper>
      {}
      <Paper className={classes.container}>
        <div style={{ padding: "16px 8px" }} id="crosshairContainer">
          <div className={classes.title} style={{ padding: "0 16px 8px" }}>
            {t("내가 한 라벨링")}
          </div>
          {/* <div className={classes.labelcontent}>
            <div style={{ width: "50%" }}>KEY POINT</div>
            <div style={{ width: "50%" }}>
              {images[0].workage && images[0].workage.point
                ? images[0].workage.point
                : 0}
            </div>
          </div> */}
          <div className={classes.labelcontent}>
            <div style={{ width: "50%" }}>BOX</div>
            <div style={{ width: "50%" }}>
              {images[0].workage && images[0].workage.box}
            </div>
          </div>
          <div className={classes.labelcontent}>
            <div style={{ width: "50%" }}>POLYGON</div>
            <div style={{ width: "50%" }}>
              {images[0].workage && images[0].workage.polygon}
            </div>
          </div>
          <div className={classes.labelcontent}>
            <div style={{ width: "50%" }}>MAGIC TOOL</div>
            <div style={{ width: "50%" }}>
              {images[0].workage && images[0].workage.magic}
            </div>
          </div>
          <div className={classes.labelcontent}>
            <div style={{ width: "50%" }}>TOTAL POINT</div>
            <div style={{ width: "50%" }}>
              {images[0].workage && images[0].workage.pointCount}
            </div>
          </div>
        </div>
      </Paper>
      {images[0] && images[0].isAiTrainer && (
        <Paper className={classes.container}>
          <div style={{ padding: "16px 8px" }} id="crosshairContainer">
            <div className={classes.title} style={{ padding: "0 16px 8px" }}>
              {t("나의 진행률")}
            </div>
            <div className={classes.labelcontent}>
              <div style={{ width: "50%" }}>{t("미완료")}</div>
              <div style={{ width: "50%" }}>
                {images[0].workage && images[0].workage.progress}
              </div>
            </div>
            <div className={classes.labelcontent}>
              <div style={{ width: "50%" }}>{t("완료")}</div>
              <div style={{ width: "50%" }}>
                {images[0].workage && images[0].workage.completion}
              </div>
            </div>
            <div className={classes.labelcontent}>
              <div style={{ width: "50%" }}>{t("진행률")}</div>
              <div style={{ width: "50%" }}>
                {images[0].workage &&
                  (
                    (images[0].workage.completion /
                      (images[0].workage.progress +
                        images[0].workage.completion)) *
                    100
                  ).toFixed(2)}
                %
              </div>
            </div>
          </div>
        </Paper>
      )}
    </div>
  )
}

export default Sidebar
