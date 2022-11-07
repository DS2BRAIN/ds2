// @flow

import React, { useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import HeaderButton, { HeaderButtonContext } from "../HeaderButton"
import BackIcon from "@material-ui/icons/KeyboardArrowLeft"
import NextIcon from "@material-ui/icons/KeyboardArrowRight"
import PlayIcon from "@material-ui/icons/PlayArrow"
import PauseIcon from "@material-ui/icons/Pause"
import SettingsIcon from "@material-ui/icons/Settings"
import HelpIcon from "@material-ui/icons/Help"
import FullscreenIcon from "@material-ui/icons/Fullscreen"
import ExitIcon from "@material-ui/icons/ExitToApp"
import QueuePlayNextIcon from "@material-ui/icons/QueuePlayNext"
import HotkeysIcon from "@material-ui/icons/Keyboard"
import ListIcon from "@material-ui/icons/List"
import styles from "./styles"
import KeyframeTimeline from "../KeyframeTimeline"
import classnames from "classnames"
import { useTranslation } from "react-i18next"
import Language from "../lang/Language"
import ExitToAppIcon from "@material-ui/icons/ExitToApp"
import SaveAltIcon from "@material-ui/icons/SaveAlt"

const useStyles = makeStyles(styles)

type Props = {
  onHeaderButtonClick: (string) => any,
  title: string,
  inFullScreen?: boolean,
  multipleImages?: boolean,
  isAVideoFrame?: boolean,
  nextVideoFrameHasRegions?: boolean,
  videoDuration?: number,
  videoPlaying?: boolean,

  onChangeCurrentTime?: (newTime: number) => any,
  onPlayVideo?: Function,
  onPauseVideo?: Function,
}

export const Header = ({
  images,
  setSnackbarOption,
  onHeaderButtonClick,
  title,
  inFullScreen,
  videoMode,
  isAVideoFrame = false,
  nextVideoFrameHasRegions = false,
  videoDuration,
  currentVideoTime,
  multipleImages,
  videoPlaying,
  onChangeCurrentTime,
  keyframes,
  alwaysShowPrevButton,
  alwaysShowNextButton,
}: Props) => {
  const classes = useStyles()
  const { t } = useTranslation()

  return (
    <div className={classes.header}>
      <div className={classnames(classes.fileInfo, videoMode && "videoMode")}>
        {title}
      </div>
      {videoMode && (
        <KeyframeTimeline
          key="keyframeTimeline"
          currentTime={currentVideoTime}
          duration={videoDuration}
          onChangeCurrentTime={onChangeCurrentTime}
          keyframes={keyframes}
        />
      )}
      <div className={classes.headerActions} style={{ display: "flex" }}>
        <Language />
        <HeaderButtonContext.Provider value={{ onHeaderButtonClick }}>
          {/* {(multipleImages || alwaysShowPrevButton) && (
            <HeaderButton name="Prev" Icon={BackIcon} />
          )}
          {(multipleImages || alwaysShowNextButton) && (
            <>
              <HeaderButton name="Next" Icon={NextIcon} />
              <HeaderButton
                name="Clone"
                disabled={nextVideoFrameHasRegions}
                Icon={QueuePlayNextIcon}
              />
            </>
          )} */}
          {videoMode && (
            <>
              {!videoPlaying ? (
                <HeaderButton
                  images={images}
                  action="play"
                  key="play"
                  name="Play"
                  Icon={PlayIcon}
                />
              ) : (
                <HeaderButton
                  images={images}
                  action="pause"
                  key="pause"
                  name="Pause"
                  Icon={PauseIcon}
                />
              )}
            </>
          )}
          <HeaderButton
            images={images}
            action="list"
            name={t("리스트")}
            id="listBtn"
            Icon={ListIcon}
          />
          {/* <HeaderButton images={images} action="Settings" name="세팅" Icon={SettingsIcon} /> */}
          {/* <HeaderButton name="Help" Icon={HelpIcon} /> */}
          {/* {inFullScreen ? (
            <HeaderButton images={images} action="window" name="윈도우" Icon={FullscreenIcon} />
          ) : (
            <HeaderButton images={images} action="fullscreen" name="풀스크린" Icon={FullscreenIcon} />
          )} */}
          {/* <HeaderButton name="Hotkeys" Icon={HotkeysIcon} /> */}
          <HeaderButton
            images={images}
            action="prev"
            name={`${t("이전")} (a)`}
            id="previousBtn"
            Icon={BackIcon}
          />
          <HeaderButton
            images={images}
            action="save"
            name={`${t("저장")} (s)`}
            id="saveBtn"
            Icon={SaveAltIcon}
          />
          <HeaderButton
            images={images}
            action="next"
            name={`${t("다음")} (d)`}
            id="nextBtn"
            Icon={NextIcon}
          />
          <HeaderButton
            images={images}
            action="exit"
            name={`${t("종료")}`}
            id="exitBtn"
            Icon={ExitToAppIcon}
          />
        </HeaderButtonContext.Provider>
      </div>
    </div>
  )
}

export default Header
