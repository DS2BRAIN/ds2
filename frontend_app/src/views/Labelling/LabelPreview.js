import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "axios";

import * as api from "controller/labelApi.js";
import { fileurl } from "controller/api";
import { getLabelclassesRequestAction } from "redux/reducers/labelprojects.js";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";
import Cookies from "helpers/Cookies";
import currentTheme from "assets/jss/custom.js";
import GridItem from "../../components/Grid/GridItem.js";
import GridContainer from "../../components/Grid/GridContainer.js";
import {
  sendErrorMessage,
  getLabelAppUrl,
} from "components/Function/globalFunc.js";
import { LABEL_FILE_STATUS } from "variables/labeling.js";
import { IS_DEPLOY, IS_ENTERPRISE } from "variables/common.js";

import Grid from "@mui/material/Grid";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import Button from "components/CustomButtons/Button";

const LabelPreview = ({
  history,
  selectedPreviewId,
  onClosePreviewModal,
  isMarketProject,
  isDetailAnalysis,
  onSetSelectedPage,
}) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );
  const { t } = useTranslation();

  const [isPreviewModalLoading, setIsPreviewModalLoading] = useState(true);
  const [labelFileDetail, setLabelFileDetail] = useState(null);
  const [labelData, setLabelData] = useState(null);
  const [clientIp, setClientIp] = useState("");

  const imageRef = React.createRef();
  let ref = useRef();

  const routes = {
    voice: "lv",
    normal_classification: "ls",
    normal_regression: "ls",
    text: "ln",
    image: "li",
  };

  let fileDownloadUrl;
  if (IS_DEPLOY) {
    fileDownloadUrl = process.env.REACT_APP_ASSET_URL + "";
  } else {
    fileDownloadUrl = "https://astoredslab.s3.ap-northeast-2.amazonaws.com/";
  }

  const getPath = () => {
    try {
      if (labelprojects.projectDetail?.labelclasses.length === 0) return;

      const labels = labelFileDetail.labels;
      const labelClasses = labelprojects.projectDetail.labelclasses;
      const width = document.getElementById("previewImage").width
        ? document.getElementById("previewImage").width
        : (labelFileDetail.height * width) / labelFileDetail.height;
      const height = document.getElementById("previewImage").height
        ? document.getElementById("previewImage").height
        : (labelFileDetail.height * width) / labelFileDetail.width;

      let c = ref.current;

      if (c) {
        c.width = width;
        c.height = height;

        let ctx = c.getContext("2d");
        if (labels && labels.length !== 0) {
          for (let idx = 0; idx < labels.length; idx++) {
            try {
              const label = labels[idx];
              let labelName;
              let labelColor;
              labelClasses.forEach((each) => {
                if (label.labelclass === each.id) {
                  labelName = each.name;
                  labelColor = each.color;
                }
              });
              if (label.labeltype === "box") {
                ctx.strokeStyle = labelColor;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(label.x * width, label.y * height);
                ctx.lineTo((label.x + label.w) * width, label.y * height);
                ctx.lineTo(
                  (label.x + label.w) * width,
                  (label.y + label.h) * height
                );
                ctx.lineTo(label.x * width, (label.y + label.h) * height);
                ctx.lineTo(label.x * width, label.y * height);
                ctx.stroke();
                ctx.closePath();
                ctx.font = "20px Verdana";
                ctx.fillStyle = labelColor;
                ctx.fillText(labelName, label.x * width, label.y * height);
              } else {
                let points = label.points;
                let x = 0;
                let y = 0;
                ctx.strokeStyle = labelColor;
                ctx.lineWidth = 3;
                ctx.beginPath();
                for (let jdx = 0; jdx < points.length; jdx++) {
                  if (jdx === 0) {
                    x = points[jdx][0] * width;
                    y = points[jdx][1] * height;
                    ctx.moveTo(x, y);
                  } else {
                    ctx.lineTo(points[jdx][0] * width, points[jdx][1] * height);
                  }
                }
                if (label.labeltype === "polygon") {
                  ctx.lineTo(points[0][0] * width, points[0][1] * height);
                }
                ctx.stroke();
                ctx.closePath();
                ctx.font = "20px Verdana";
                ctx.fillStyle = labelColor;
                ctx.fillText(labelName, x, y);
              }
            } catch (e) {
              if (!IS_DEPLOY) console.log(e);
            }
          }
        }
      }
    } catch (e) {
      if (!IS_DEPLOY) console.log(e);
    }
  };

  useEffect(() => {
    dispatch(
      getLabelclassesRequestAction({
        id: labelprojects.projectDetail.id,
        page: 1,
        count: -1,
      })
    );
  }, []);

  useEffect(() => {
    if (selectedPreviewId) {
      getPreviewData();
    }
  }, [selectedPreviewId]);

  useEffect(() => {
    window.addEventListener("resize", getPath);

    return function cleanup() {
      window.removeEventListener("resize", getPath);
    };
  }, [imageRef]);

  useEffect(() => {
    (async () => {
      const previewImgEl = document.getElementById("previewImage");

      if (
        !isPreviewModalLoading &&
        labelFileDetail?.s3key &&
        previewImgEl &&
        labelprojects.projectDetail
      ) {
        await getPath();
      }
    })();
  }, [
    isPreviewModalLoading,
    labelFileDetail,
    imageRef,
    labelprojects.projectDetail?.labelclasses,
  ]);

  const getPreviewData = async () => {
    await api
      .getLabelFile(
        selectedPreviewId,
        labelprojects.projectDetail.id,
        labelprojects.projectDetail.workapp
      )
      .then((res) => {
        const fileDetail = res.data;
        setLabelFileDetail(fileDetail);
        setLabelData(fileDetail.labelData);
        setIsPreviewModalLoading(false);
      })
      .catch((err) => {
        dispatch(
          openErrorSnackbarRequestAction(
            err.response?.data.message
              ? sendErrorMessage(
                  err.response?.data.message,
                  err.response?.data.message_en,
                  user.language
                )
              : t("A temporary error has occurred.")
          )
        );
        onClosePreviewModal();
      });
  };

  const getIpClient = async () => {
    try {
      const response = await axios.get("https://extreme-ip-lookup.com/json");
      const ip = response.data.query;

      setClientIp(ip);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getIpClient();
  }, []);

  const goToLabellingPageFromPreview = (id, status, workAssignee, ownerId) => {
    const labelStatus = status === "working" ? "prepare" : status;
    if (status === "ready") {
      dispatch(
        openErrorSnackbarRequestAction(
          t("You cannot edit the labeling of files that are training auto-labeling.")
        )
      );
      return;
    }
    if (
      (status === "done" || status === "working") &&
      (workAssignee !== user.me.email && user.me.id != ownerId) &&
      labelprojects.role !== "subadmin"
    ) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("You cannot label a file started by another user.")
        )
      );
      return;
    }
    if (!status || status.length === 0) {
      api.setObjectStatus(id).catch((e) => {
        if (!IS_DEPLOY) console.log(e);
      });
    }

    const token = Cookies.getCookie("jwt");
    const category = labelprojects.projectDetail.workapp;
    const labelClasses = labelprojects.projectDetail.labelclasses;

    let tempLabellingUrl = getLabelAppUrl(category);

    if (category) {
      if (category === "normal_regression") {
        window.open(
          `${tempLabellingUrl}admin/${routes[category]}/${
            labelprojects.projectDetail.id
          }/${id}/?token=${token}&start=true&appStatus=${labelStatus}&timeStamp=${Date.now()}`,
          "_blank"
        );
      } else {
        if (!labelClasses || labelClasses.length === 0) {
          if (
            labelprojects.projectDetail &&
            labelprojects.projectDetail.isShared
          ) {
            dispatch(
              openErrorSnackbarRequestAction(
                t(
                  "등록된 클래스가 없어 라벨링을 진행할 수 없습니다. 그룹장을 통해 클래스를 등록하세요."
                )
              )
            );
            return;
          } else if (
            labelprojects.projectDetail &&
            !labelprojects.projectDetail.isShared
          ) {
            dispatch(
              openErrorSnackbarRequestAction(
                t(
                  "라벨리스트는 클래스를 최소 1개 이상 등록한 뒤 볼 수 있습니다."
                )
              )
            );
            onSetSelectedPage("class");

            history.push(
              `/admin/labelling/${labelprojects.projectDetail.id}?class_required=true`
            );
            return;
          }
          if (user.me && user.me.isAiTrainer) {
            dispatch(
              openErrorSnackbarRequestAction(
                t(
                  "등록된 클래스가 없어 라벨링을 진행할 수 없습니다. 문의하기를 통해 문의해주세요."
                )
              )
            );
            return;
          }
        } else {
          if (category !== "object_detection") {
            window.open(
              `${tempLabellingUrl}admin/${routes[category]}/${
                labelprojects.projectDetail.id
              }/${id}/?token=${token}&start=true&appStatus=${labelStatus}&timeStamp=${Date.now()}`,
              "_blank"
            );
          } else {
            window.open(
              `${tempLabellingUrl}${
                labelprojects.projectDetail.id
              }/${id}/?token=${token}&start=true&appStatus=${labelStatus}&timeStamp=${Date.now()}`,
              "_blank"
            );
          }
        }
      }
    }
  };

  const renderMarketPreview = () => (
    <>
      {!isDetailAnalysis ? (
        <GridContainer style={{ height: "100%", justifyContent: "center" }}>
          <GridItem
            xs={12}
            style={{ marginBottom: "20px", textAlign: "center" }}
          >
            <span style={{ fontSize: "20px" }}>
              {labelFileDetail.originalFileName}
            </span>
          </GridItem>
          <GridItem xs={8} style={{ height: "90%" }}>
            <div className={classes.imageCard} id="imageCard">
              <img
                src={getS3key(labelFileDetail.s3key)}
                id="previewImage"
                ref={imageRef}
                style={{ width: "100%", left: 0, top: 0 }}
              />
              {(labelprojects.projectDetail?.labelclasses ||
                labelprojects.projectDetail.labelclasses.length > 0) && (
                <canvas
                  ref={ref}
                  className={classes.labelCanvas}
                  id="labelCanvas"
                  style={{ width: "100%" }}
                ></canvas>
              )}
            </div>
          </GridItem>
        </GridContainer>
      ) : (
        <div
          className={classes.imageCard}
          id="imageCard"
          style={{ overflow: "visible" }}
        >
          <img
            src={getS3key(labelFileDetail.s3key)}
            id="previewImage"
            ref={imageRef}
            style={{ width: "calc(100% + 30px)", left: 0, top: 0 }}
          />
          {(labelprojects.projectDetail?.labelclasses ||
            labelprojects.projectDetail.labelclasses.length > 0) && (
            <canvas
              ref={ref}
              className={classes.labelCanvas}
              id="labelCanvas"
              style={{ width: "calc(100% + 30px)" }}
            ></canvas>
          )}
        </div>
      )}
    </>
  );

  // const getS3key = (key) => {
  //   const keyArr = key.split("/");
  //   let parseUrl = "";
  //   keyArr.forEach((key) => {
  //     parseUrl += encodeURIComponent(key) + "/";
  //   });
  //   parseUrl = encodeURI(parseUrl);
  //   return process.env.REACT_APP_ENTERPRISE
  //     ? process.env.REACT_APP_BACKEND_URL + parseUrl
  //     : key;
  // };
  const getS3key = (key) => {
    if (key) {
      return IS_ENTERPRISE ? `${fileurl}static${key}` : key;
    }
  };

  const renderClasses = () => {
    const tempClasses = [];
    const tempClassName = [];
    const labelClasses = labelprojects.projectDetail.labelclasses;
    const labels = labelFileDetail.labels ? labelFileDetail.labels : [];

    labelClasses.forEach((labelClass) => {
      labels.forEach((tempLabel) => {
        if (
          labelClass.id === tempLabel.labelclass &&
          tempClassName.indexOf(labelClass.name) === -1
        ) {
          tempClassName.push(labelClass.name);
          tempClasses.push(labelClass);
        }
      });
    });

    return (
      <Typography
        className={classes.mapContent}
        style={{ maxHeight: 100, overflowY: "auto" }}
      >
        {labelprojects.projectDetail &&
        labelprojects.projectDetail.workapp &&
        labelprojects.projectDetail.workapp === "object_detection" ? (
          <>
            {tempClasses.length > 0 ? (
              tempClasses.map((item) => {
                return (
                  <span
                    key={item.id}
                    className={`${classes.items} classNames`}
                    style={{
                      border: `2px solid ${item.color}`,
                      color: "var(--textWhite87)",
                    }}
                  >
                    {item.name}
                  </span>
                );
              })
            ) : (
              <span style={{ color: "var(--textWhite87)", fontSize: 15 }}>
                {t("None")}
              </span>
            )}
          </>
        ) : (
          <>
            {labelData && <span className={classes.content}>{labelData}</span>}
          </>
        )}
      </Typography>
    );
  };

  return isPreviewModalLoading ? (
    <div className={classes.previewContainer} style={{ position: "relative" }}>
      <b
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          width: "100%",
          textAlign: "center",
        }}
      >
        {t("Preparing preview. Just a moment, please")}
      </b>
    </div>
  ) : isMarketProject ? (
    renderMarketPreview()
  ) : (
    <div className={classes.previewContainer}>
      <Grid
        container
        justifyContent="center"
        height="100%"
        // style={{ height: "100%", justifyContent: "space-evenly" }}
      >
        <Grid item xs={12} style={{ marginBottom: "36px" }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid
              item
              xs={10}
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: "24px", fontWeight: 600 }}>
                {labelFileDetail.originalFileName}
              </span>
            </Grid>
            <Grid item>
              <CloseIcon
                id="exit_button"
                onClick={onClosePreviewModal}
                style={{
                  cursor: "pointer",
                  fontSize: 28,
                  fill: "var(--textWhite87)",
                }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          sx={{
            maxHeight: { lg: "600px", xs: "280px" },
            mb: { lg: 0, xs: 4 },
            overflow: "auto",
          }}
        >
          <div className={classes.imageCard} id="imageCard">
            <img
              src={getS3key(labelFileDetail.s3key)}
              height="100%"
              id="previewImage"
              ref={imageRef}
              style={{
                position: "relative",
                left: 0,
                top: 0,
              }}
            />
            {(labelprojects.projectDetail?.labelclasses ||
              labelprojects.projectDetail.labelclasses.length > 0) && (
              <canvas
                ref={ref}
                className={classes.labelCanvas}
                id="labelCanvas"
              ></canvas>
            )}
          </div>
        </Grid>
        <Grid
          item
          xs={9}
          lg={4}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 12,
            paddingLeft: 20,
          }}
        >
          <div style={{ overflowY: "auto", overflowX: "hidden" }}>
            <div
              style={{
                marginBottom: "28px",
                color: "var(--secondary1)",
                fontSize: "20px",
                fontWeight: 500,
              }}
            >
              FILE INFOMATION
            </div>
            <Grid
              container
              className={classes.mainCard}
              alignItems="center"
              style={{ marginBottom: "20px", padding: "0 12px" }}
            >
              <Grid item xs={4}>
                <Typography
                  className={classes.content}
                  style={{ fontWeight: 600, marginRight: 16 }}
                >
                  {t("Class")}
                </Typography>
              </Grid>
              {renderClasses()}
            </Grid>
            <Grid
              container
              className={classes.mainCard}
              style={{ padding: "0 12px" }}
            >
              <Typography
                className={classes.content}
                gutterBottom
                style={{ fontWeight: 600 }}
              >
                {t("Details")}
              </Typography>
              <Grid container className={classes.text87}>
                <Grid container className={classes.textContainer}>
                  <Grid item xs={4} className={classes.text}>
                    {t("Type")}
                  </Grid>
                  <Grid item xs={8} className={classes.text}>
                    <div id="classType">
                      {labelFileDetail?.fileType === "object_detection"
                        ? t("Object Detection")
                        : t("Image Classification")}
                    </div>
                  </Grid>
                  <Grid item xs={4} className={classes.text}>
                    {t("Status")}
                  </Grid>
                  <Grid item xs={8} className={classes.text}>
                    <div id="classStatus">
                      {LABEL_FILE_STATUS[labelFileDetail.status]
                        ? t(LABEL_FILE_STATUS[labelFileDetail.status])
                        : "-"}
                    </div>
                  </Grid>
                  <Grid item xs={4} className={classes.text}>
                    {t("Assignee ")}
                  </Grid>
                  <Grid item xs={8} className={classes.text}>
                    <div
                      id="classStatus"
                      className={classes.ellipsisText}
                      style={{ wordBreak: "break-all" }}
                    >
                      {labelFileDetail?.workAssignee
                        ? labelFileDetail.workAssignee
                        : labelFileDetail?.last_updated_by === "auto"
                        ? "Auto Labeling"
                        : "-"}
                    </div>
                  </Grid>
                  <Grid item xs={4} className={classes.text}>
                    {t("checker")}
                  </Grid>
                  <Grid item xs={8} className={classes.text}>
                    <div id="classStatus" style={{ wordBreak: "break-all" }}>
                      {labelFileDetail?.reviewer
                        ? labelFileDetail.reviewer
                        : "-"}
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "flex-end",
              marginTop: 60,
            }}
          >
            {/* <Button
              id="exitBtn"
              className={classes.defaultGreenOutlineButton}
              onClick={onClosePreviewModal}
            >
              {t("Cancel")}
            </Button> */}
            {labelFileDetail.status === "ready" ? (
              <Tooltip
                title={
                  <span style={{ fontSize: "11px" }}>
                    {t(
                      "오토라벨링 학습 중인 파일은 라벨링을 수정하실 수 없습니다."
                    )}
                  </span>
                }
                placement="top"
              >
                <Button
                  id="startBtn"
                  className={classes.defaultDisabledButton}
                  disabled
                  fullWidth
                  style={{ height: 32, fontWeight: 600 }}
                >
                  {t("EDIT LABEL")}
                </Button>
              </Tooltip>
            ) : (
              <Button
                id="startBtn"
                fullWidth
                className={classes.defaultGreenContainedButton}
                onClick={() => {
                  goToLabellingPageFromPreview(
                    selectedPreviewId,
                    labelFileDetail.status,
                    labelFileDetail.workAssignee,
                    labelFileDetail.user
                  );
                }}
                style={{ height: 32, fontWeight: 600 }}
              >
                {labelFileDetail.status === "prepare" ||
                labelFileDetail.status === "working" ? (
                  <>{t("EDIT LABEL")}</>
                ) : (
                  <>{t("INSPECT LABEL")}</>
                )}
              </Button>
            )}
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default React.memo(LabelPreview);
