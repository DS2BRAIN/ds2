import React, { useRef, useEffect, useState } from "react";
import { Grid, IconButton, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import StopIcon from "@material-ui/icons/Stop";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import VolumeMuteIcon from "@material-ui/icons/VolumeMute";

const styles = {
  controlContainer: {
    "& .controls": {
      width: "100%",
      height: "30px" /* of figure's height */,
      position: "relative",
      margin: "36px 0 60px",
    },
    "& .controls[data-state=hidden]": {
      display: "none",
    },

    "& .controls[data-state=visible]": {
      display: "block",
    },

    "& .controls > * ": {
      float: "left",
      // width: "3.90625%",
      height: "100%",
      marginLeft: "0.1953125%",
      display: "block",
    },

    "& .controls > *:first-child": {
      marginLeft: 0,
    },

    "& .controls .progress": {
      position: "relative",
      cursor: "pointer",
      width: "100%",
      marginBottom: "16px",
      overflow: "visible",
    },
    "& .controls #progress": {
      display: "block",
      width: "100%",
      height: "30px",
      border: "none",
      // -moz-border-radius:"2px",
      // -webkit-border-radius:"2px",
      borderRadius: "2px",
    },
    "& .controls #start-point": {
      position: "absolute",
      top: "-4px",
      zIndex: "100",
      display: "block",
      width: "10px",
      height: "38px",
      border: "none",
      backgroundColor: "#fff",
      // -moz-border-radius:"2px",
      // -webkit-border-radius:"2px",
      borderRadius: "2px",
      textIndent: "-10px",
      lineHeight: "100px",
    },
    "& .controls #progress-blind": {
      position: "absolute",
      top: "0",
      left: "0",
      zIndex: "100",
      display: "block",
      height: "30px",
      border: "none",
      backgroundColor: "#7d7d7d",
      // -moz-border-radius:"2px",
      // -webkit-border-radius:"2px",
      borderRadius: "2px",
    },
    "& .controls #progress[data-state='fake']": {
      background: "#e6e6e6",
      height: "16px",
    },
    "& .controls #progress::-moz-progress-bar": {
      backgroundColor: "var(--mainSub)",
    },

    "& .controls #progress::-webkit-progress-value": {
      backgroundColor: "var(--mainSub)",
    },
  },
};
const useStyles = makeStyles(styles);

const MarketMovieAnalysisResult = ({
  history,
  asynctasks,
  standardMovieTask,
  serviceType,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // const standardVid = useRef();
  // const comparedVid = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [startPointWidth, setStartPointWidth] = useState(0);
  // const [isStartPointMoving, setIsStartPointMoving] = useState(false);
  const [startPointTime, setStartPointTime] = useState("0.000");
  const [currentTime, setCurrentTime] = useState("0.000");
  const [duration, setDuration] = useState("0.000");
  const [asynctask, setAsyncTask] = useState(null);
  const [movieAnalysisValues, setMovieAnalysisValues] = useState([]);
  const [isOfflineService, setIsOfflineService] = useState(false);

  useEffect(() => {
    const idx = history.location.search.split("list=")[1] - 1;

    setAsyncTask(asynctasks[idx]);
  }, [asynctasks]);

  useEffect(() => {
    if (serviceType && serviceType.includes("offline_"))
      setIsOfflineService(true);
    else setIsOfflineService(false);
  }, [serviceType]);

  useEffect(() => {
    // console.log(asynctask, standardMovieTask);
    if (asynctask) {
      const totalScore =
        asynctask.total_score !== null ? asynctask.total_score : 0;
      const angleScore =
        asynctask.angle_score !== null ? asynctask.angle_score : 0;
      const distanceScore =
        asynctask.distance_score !== null ? asynctask.distance_score : 0;

      setMovieAnalysisValues([
        {
          name: "동작 유사도",
          value: totalScore,
        },
        {
          name: "각도 유사도",
          value: angleScore,
        },
        {
          name: "거리 유사도",
          value: distanceScore,
        },
      ]);
    }
  }, [asynctask]);

  // useEffect(() => {
  //   console.log(movieAnalysisValues);
  // }, [movieAnalysisValues]);

  useEffect(() => {
    var videoControls = document.getElementById("video-controls");
    var progress = document.getElementById("progress");
    var startPoint = document.getElementById("start-point");
    var comparedVid = document.getElementById("comparedVid");
    var standardVid = document.getElementById("standardVid");
    var playpause = document.getElementById("playpause");
    var stop = document.getElementById("stop");
    const supportsProgress =
      document.createElement("progress").max !== undefined;
    let mouseDowned = false;
    let isStartPointMoving = false;

    comparedVid.onloadedmetadata = () => {
      setDuration(comparedVid.duration.toFixed(3));
    };

    // const totalDuration = comparedVid.duration;
    const changePosition = (e) => {
      var viewportOffset = progress.getBoundingClientRect();
      var pos = (e.pageX - viewportOffset.left) / progress.offsetWidth;

      // console.log(
      //   pos,
      //   startPointWidth / 100,
      //   startPoint.offsetLeft,
      //   progress.offsetWidth
      // );
      if (pos <= startPointWidth / 100) return;
      comparedVid.currentTime = pos * comparedVid.duration;
      standardVid.currentTime = pos * comparedVid.duration;
      // console.log(comparedVid.duration);
      setProgressValue(comparedVid.currentTime / comparedVid.duration);
      pos * standardVid.duration <= 0
        ? setCurrentTime("0.000")
        : setCurrentTime((pos * comparedVid.duration).toFixed(3));
      // console.log((comparedVid.currentTime / comparedVid.duration) * 100);
    };

    const changeStartPosition = (e) => {
      var viewportOffset = progress.getBoundingClientRect();
      var pos = (e.pageX - viewportOffset.left) / progress.offsetWidth;

      // console.log(e.pageX, viewportOffset.left);
      if (
        e.pageX <= viewportOffset.left - 5 ||
        e.pageX >= viewportOffset.left + progress.offsetWidth - 5
      )
        return;

      setStartPointWidth(pos * 100);
      pos * comparedVid.duration <= 0
        ? setStartPointTime("0.000")
        : setStartPointTime((pos * comparedVid.duration).toFixed(3));

      comparedVid.currentTime = (pos * comparedVid.duration).toFixed(3);
      standardVid.currentTime = (pos * comparedVid.duration).toFixed(3);
      progress.value = (startPointWidth / 100) * comparedVid.duration;
      pos * standardVid.duration <= 0
        ? setCurrentTime("0.000")
        : setCurrentTime((pos * comparedVid.duration).toFixed(3));
      // comparedVid.currentTime = pos * comparedVid.duration;
      // standardVid.currentTime = pos * standardVid.duration;
      // setProgressValue(comparedVid.currentTime / comparedVid.duration);
      // console.log((comparedVid.currentTime / comparedVid.duration) * 100);
    };

    const onTimeUpdate = () => {
      setProgressValue(comparedVid.currentTime / comparedVid.duration);
      setCurrentTime(comparedVid.currentTime.toFixed(3));
    };

    const onClickStopBtn = (e) => {
      comparedVid.pause();
      standardVid.pause();
      comparedVid.currentTime = 0;
      standardVid.currentTime = 0;

      setProgressValue(0);
      setCurrentTime("0.000");
      setStartPointTime("0.000");
      setStartPointWidth(0);
      setIsPlaying(false);
    };

    const onClickPlayPauseBtn = () => {
      if (comparedVid.paused || comparedVid.ended) {
        setIsPlaying(true);
        comparedVid.play();
        standardVid.play();
      } else {
        setIsPlaying(false);
        comparedVid.pause();
        standardVid.pause();
      }
    };

    const onMousedownProgress = (e) => {
      mouseDowned = true;
      changePosition(e);
    };

    const onMousemoveProgress = (e) => {
      if (isStartPointMoving) {
        return;
      }
      if (mouseDowned) {
        changePosition(e);
      }
    };

    const onMousedownStartPoint = (e) => {
      isStartPointMoving = true;
    };

    const onMousemoveStartPoint = (e) => {
      if (isStartPointMoving) {
        changeStartPosition(e);
      }
    };

    const onMouseup = () => {
      mouseDowned = false;
      isStartPointMoving = false;
      progress.onmousemove = null;
      // setIsStartPointMoving(false);
    };

    // console.log(
    //   parseInt(comparedVid.duration * 1),
    //   typeof comparedVid.duration
    // );
    // setDuration(parseFloat(comparedVid.duration).toFixed(3));
    videoControls.setAttribute("data-state", "visible");

    if (!supportsProgress) progress.setAttribute("data-state", "fake");

    comparedVid.addEventListener("timeupdate", onTimeUpdate, false);
    comparedVid.addEventListener("ended", (e) =>
      setTimeout(() => {
        onClickStopBtn(e);
      }, [500])
    );
    stop.addEventListener("click", (e) => onClickStopBtn(e));
    playpause.addEventListener("click", onClickPlayPauseBtn);
    progress.addEventListener("mousedown", (e) => onMousedownProgress(e));
    progress.addEventListener("mousemove", (e) => onMousemoveProgress(e));
    startPoint.addEventListener("mousedown", (e) => onMousedownStartPoint(e));
    document.addEventListener("mousemove", (e) => onMousemoveStartPoint(e));
    document.addEventListener("mouseup", onMouseup);

    return () => {
      comparedVid.removeEventListener("timeupdate", onTimeUpdate, false);
      comparedVid.removeEventListener("ended", (e) =>
        setTimeout(() => {
          onClickStopBtn(e);
        }, [500])
      );
      stop.removeEventListener("click", (e) => onClickStopBtn(e));
      playpause.removeEventListener("click", onClickPlayPauseBtn);
      progress.removeEventListener("mousedown", (e) => onMousedownProgress(e));
      progress.removeEventListener("mousemove", (e) => onMousemoveProgress(e));
      startPoint.removeEventListener("mousedown", (e) =>
        onMousedownStartPoint(e)
      );
      document.removeEventListener("mousemove", (e) =>
        onMousemoveStartPoint(e)
      );
      document.removeEventListener("mouseup", onMouseup);
    };
  }, []);

  return (
    <Grid container>
      {isOfflineService ? (
        <Grid item xs={10}>
          <figure>
            <figcaption
              style={{
                marginBottom: "12px",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              {asynctask?.taskName}
            </figcaption>
            <video
              className={classes.video}
              style={{ width: "100%" }}
              id="comparedVid"
              preload="metadata"
              controls
            >
              <source type="video/mp4" src={asynctask?.outputFilePath}></source>
            </video>
          </figure>
        </Grid>
      ) : (
        <>
          <Grid item xs={12}>
            <Grid container>
              {movieAnalysisValues.map((v, i) => {
                return (
                  <Grid
                    item
                    style={
                      i === movieAnalysisValues.length - 1
                        ? {
                            padding: "16px 24px",
                            border: "1px solid #fff",
                            fontSize: "16px",
                          }
                        : {
                            padding: "16px 24px",
                            marginRight: "24px",
                            border: "1px solid #fff",
                            fontSize: "16px",
                          }
                    }
                  >
                    <Grid container>
                      <Grid item xs={12}>
                        {t(`${v.name}`)}
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        style={{ fontSize: "18px", fontWeight: "bold" }}
                      >
                        {v.value * 100} %
                      </Grid>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
          <Grid item xs={12} style={{ marginTop: "50px" }}>
            {/* {!isOfflineService  ( */}
            <Grid container>
              <Grid item xs={6}>
                <figure>
                  <figcaption
                    style={{
                      marginBottom: "12px",
                      textAlign: "center",
                      fontSize: "14px",
                    }}
                  >
                    {asynctask?.taskName}
                  </figcaption>
                  <video
                    className={classes.video}
                    style={{ width: "100%" }}
                    id="comparedVid"
                    preload="metadata"
                  >
                    <source
                      type="video/mp4"
                      src={asynctask?.outputFilePath}
                    ></source>
                  </video>
                </figure>
              </Grid>
              <Grid item xs={6}>
                <figure>
                  <figcaption
                    style={{
                      marginBottom: "12px",
                      textAlign: "center",
                      fontSize: "14px",
                    }}
                  >
                    {standardMovieTask && standardMovieTask[0]?.taskName}
                  </figcaption>
                  <video
                    style={{ width: "100%" }}
                    id="standardVid"
                    preload="metadata"
                  >
                    <source
                      type="video/mp4"
                      src={
                        standardMovieTask &&
                        standardMovieTask[0]?.outputFilePath
                      }
                    ></source>
                  </video>
                </figure>
              </Grid>
            </Grid>
            <Grid container className={classes.controlContainer}>
              <div id="video-controls" className="controls" data-state="hidden">
                <div className="progress" draggable="false">
                  <progress id="progress" value={progressValue} min="0" />
                  <span
                    id="progress-blind"
                    style={{ width: startPointWidth + "%" }}
                    draggable="false"
                  />
                  <span
                    id="start-point"
                    style={{ left: startPointWidth + "%" }}
                    draggable="false"
                  >
                    {startPointTime}
                  </span>
                </div>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton id="playpause" aria-label="play">
                        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <IconButton id="stop" aria-label="stop">
                        <StopIcon />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <span>
                        {currentTime} / {duration}
                      </span>
                    </Grid>
                  </Grid>
                </Grid>
              </div>
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default MarketMovieAnalysisResult;
