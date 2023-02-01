import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";

import Cookies from "helpers/Cookies";
import * as api from "controller/labelApi.js";
import { getAsynctaskAll } from "controller/api.js";
import { useDispatch, useSelector } from "react-redux";
import { getRecentProjectsRequestAction } from "redux/reducers/projects.js";
import {
  askProjectFromLabelRequestAction,
  askExportCocoRequestAction,
  askExportVocRequestAction,
  askExportDataRequestAction,
  openSuccessSnackbarRequestAction,
  openErrorSnackbarRequestAction,
  askResetMessageRequestAction,
} from "redux/reducers/messages.js";

import { Checkbox, FormControlLabel } from "@material-ui/core";
import { CircularProgress } from "@mui/material";
import RedoIcon from "@material-ui/icons/Redo";

import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import { sendErrorMessage } from "components/Function/globalFunc.js";
import Button from "components/CustomButtons/Button";

const LabelExport = ({ history }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectBtnDisabled, setIsProjectBtnDisabled] = useState(false);
  const [isCocoBtnDisabled, setIsCocoBtnDisabled] = useState(false);
  const [isVocBtnDisabled, setIsVocBtnDisabled] = useState(false);
  const [isDataBtnDisabled, setIsDataBtnDisabled] = useState(false);
  const [asynctask, setAsynctask] = useState(null);
  const [exportCocoStatus, setExportCocoStatus] = useState(-1);
  const [exportVocStatus, setExportVocStatus] = useState(-1);
  const [exportDataStatus, setExportDataStatus] = useState(-1);
  const [cocoDownloadTime, setCocoDownloadTime] = useState(0);
  const [vocDownloadTime, setVocDownloadTime] = useState(0);
  const [dataDownloadTime, setDataDownloadTime] = useState(0);
  const [remainTime, setRemainTime] = useState(0);
  const [cocoIsGetImage, setCocoIsGetImage] = useState(true);
  const [vocIsGetImage, setVocIsGetImage] = useState(true);

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

  // useEffect(() => {
  //   if (cocoDownloadTime > 0) {
  //     setTimeout(() => {
  //       setCocoDownloadTime((prevTime) => prevTime + 1000);
  //       setRemainTime(3600000 - cocoDownloadTime);
  //     }, [1000]);
  //   }
  // }, [cocoDownloadTime]);

  // useEffect(() => {
  //   if (vocDownloadTime > 0) {
  //     setTimeout(() => {
  //       setVocDownloadTime((prevTime) => prevTime + 1000);
  //       setRemainTime(3600000 - vocDownloadTime);
  //     }, [1000]);
  //   }
  // }, [vocDownloadTime]);

  const getAsynctaskData = (type) => {
    let asynctaskInfo = { start: 0, count: 100, tasktype: "exportCoco" };
    if (type === "exportCoco") {
      getAsynctaskAll(asynctaskInfo)
        .then((res) => {
          let shoulStopProcess = false;
          res.data.asynctasks &&
            res.data.asynctasks.length > 0 &&
            res.data.asynctasks.map((asynctask) => {
              if (
                !shoulStopProcess &&
                asynctask.labelproject === labelprojects.projectDetail.id
              ) {
                shoulStopProcess = true;
                setExportCocoStatus(asynctask.status);
                let now = new Date().toISOString();
                var utc_timestamp = Date.parse(now);
                let downloadTime = Date.parse(asynctask.updated_at + ".000Z");
                // setCocoDownloadTime(utc_timestamp - downloadTime);
                setCocoDownloadTime(3600000000000000);
              }
            });
        })
        .then(() => {
          setIsLoading(false);
        });
    } else if (type === "exportVoc") {
      asynctaskInfo = { ...asynctaskInfo, tasktype: "exportVoc" };
      getAsynctaskAll(asynctaskInfo)
        .then((res) => {
          let shoulStopProcess = false;
          res.data.asynctasks &&
            res.data.asynctasks.length > 0 &&
            res.data.asynctasks.map((asynctask) => {
              if (
                !shoulStopProcess &&
                asynctask.labelproject === labelprojects.projectDetail.id
              ) {
                shoulStopProcess = true;
                setExportVocStatus(asynctask.status);
                let now = new Date().toISOString();
                var utc_timestamp = Date.parse(now);
                let downloadTime = Date.parse(asynctask.updated_at + ".000Z");
                // setVocDownloadTime(utc_timestamp - downloadTime);
                setVocDownloadTime(3600000000000000);
              }
            });
        })
        .then(() => {
          setIsLoading(false);
        });
    } else if (type === "exportData") {
      asynctaskInfo = { ...asynctaskInfo, tasktype: "exportData" };
      getAsynctaskAll(asynctaskInfo)
        .then((res) => {
          let shoulStopProcess = false;
          res.data.asynctasks &&
            res.data.asynctasks.length > 0 &&
            res.data.asynctasks.map((asynctask) => {
              if (
                !shoulStopProcess &&
                asynctask.labelproject === labelprojects.projectDetail.id
              ) {
                shoulStopProcess = true;
                setExportDataStatus(asynctask.status);
                let now = new Date().toISOString();
                var utc_timestamp = Date.parse(now);
                let downloadTime = Date.parse(asynctask.updated_at + ".000Z");
                // setDataDownloadTime(utc_timestamp - downloadTime);
                setDataDownloadTime(3600000000000000);
              }
            });
        })
        .then(() => {
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    if (messages.shouldRenderAction) {
      if (messages.requestAction === "exportCoco") {
        setIsLoading(true);
        setIsCocoBtnDisabled(true);
        saveCocoFile();
        dispatch(askResetMessageRequestAction());
      }
      if (messages.requestAction === "exportVoc") {
        setIsLoading(true);
        setIsVocBtnDisabled(true);
        saveVocFile();
        dispatch(askResetMessageRequestAction());
      }
      if (messages.requestAction === "exportData") {
        setIsLoading(true);
        setIsDataBtnDisabled(true);
        saveFile();
        dispatch(askResetMessageRequestAction());
      }
      if (messages.requestAction === "projectFromLabel") {
        setIsLoading(true);
        setIsProjectBtnDisabled(true);
        startProject();
        dispatch(askResetMessageRequestAction());
      }
    }
  }, [messages.shouldRenderAction]);

  const handleCocoIsGetImage = () => {
    const value = cocoIsGetImage;
    setCocoIsGetImage(!value);
  };

  const handleVocIsGetImage = () => {
    const value = vocIsGetImage;
    setVocIsGetImage(!value);
  };

  const startProject = () => {
    api
      .projectfromLabeling(labelprojects.projectDetail.id)
      .then((res) => {
        dispatch(getRecentProjectsRequestAction());
        history.push(`/admin/train/${res.data.id}`);
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("You have been logged out automatically, please log in again")
            )
          );
          setTimeout(() => {
            Cookies.deleteAllCookies();
            history.push("/signin/");
          }, 2000);
          return;
        }
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "An error occurred during the developing process. Please try again in a moment"
              )
            )
          );
        }
      })
      .finally(() => {
        setIsProjectBtnDisabled(false);
        setIsLoading(false);
      });
  };

  const saveCocoFile = () => {
    const requestInfo = {
      id: labelprojects.projectDetail.id,
      is_get_image: cocoIsGetImage,
    };
    api
      .postCocoDataset(requestInfo)
      .then((res) => {
        if (res.status === 200) {
          dispatch(
            openSuccessSnackbarRequestAction(
              t(
                "COCO file conversion has started. Upon completion, it can be downloaded from the Notifications."
              )
            )
          );
        }
      })
      .catch((e) => {
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "An error occurred while requesting the data. Please try again in a few minutes."
              )
            )
          );
        }
      })
      .then(() => {
        getAsynctaskData("exportCoco");
      })
      .finally(() => {
        setIsCocoBtnDisabled(false);
        setIsLoading(false);
      });
  };

  const saveVocFile = () => {
    const requestInfo = {
      id: labelprojects.projectDetail.id,
      is_get_image: vocIsGetImage,
    };
    api
      .postVocDataset(requestInfo)
      .then((res) => {
        if (res.status === 200) {
          dispatch(
            openSuccessSnackbarRequestAction(
              t(
                "VOC file conversion has started. Upon completion, it can be downloaded from the notifications."
              )
            )
          );
        }
      })
      .catch((e) => {
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "An error occurred while requesting the data. Please try again in a few minutes."
              )
            )
          );
        }
      })
      .then(() => {
        getAsynctaskData("exportVoc");
      })
      .finally(() => {
        setIsVocBtnDisabled(false);
        setIsLoading(false);
      });
  };

  const saveFile = () => {
    const requestInfo = {
      id: labelprojects.projectDetail.id,
    };
    api
      .postDataset(requestInfo)
      .then((res) => {
        if (res.status === 200) {
          dispatch(
            openSuccessSnackbarRequestAction(
              t(
                "The file conversion has started. Upon completion, it can be downloaded from the notifications."
              )
            )
          );
        }
      })
      .catch((e) => {
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "An error occurred while requesting the data. Please try again in a few minutes."
              )
            )
          );
        }
      })
      .then(() => {
        getAsynctaskData("exportData");
      })
      .finally(() => {
        setIsDataBtnDisabled(false);
        setIsLoading(false);
      });
  };

  const renderTime = () => {
    let minutes = parseInt(remainTime / 60000);
    let seconds = parseInt((remainTime % 60000) / 1000);

    return user.language === "ko"
      ? `${minutes}분 ${seconds}초 후에 다운로드 가능합니다...`
      : `Download will be available in ${minutes}:${seconds} `;
  };

  const secExportData = (workApp) => {
    const renderExportData = (datatype) => {
      const exportBtn = (type) => {
        let isDisabled = false;
        let saveDataFunc = null;
        let label = "";
        let btnId = "";

        if (type === "coco") {
          if (isCocoBtnDisabled) isDisabled = true;
          saveDataFunc = () => dispatch(askExportCocoRequestAction());
          label = `${type} ${t("Save")}`;
          btnId = "export_coco_btn";
        } else if (type === "voc") {
          if (isVocBtnDisabled) isDisabled = true;
          saveDataFunc = () => dispatch(askExportVocRequestAction());
          label = `${type} ${t("Save")}`;
          btnId = "export_voc_btn";
        } else {
          if (isDataBtnDisabled) isDisabled = true;
          saveDataFunc = () => dispatch(askExportDataRequestAction());
          label = t("Save");
          btnId = "export_btn";
        }

        return (
          <Button
            id={btnId}
            aria-controls="customized-menu"
            aria-haspopup="true"
            shape="greenOutlined"
            size="sm"
            disabled={isDisabled}
            startIcon={<RedoIcon className="secondaryColorIcon" />}
            style={{ minWidth: 136 }}
            onClick={saveDataFunc}
          >
            {label}
          </Button>
        );
      };

      const exportCheckbox = (type) => {
        let isGetImage = false;
        let handleIsGetImage = null;
        let chkboxId = "";

        if (type === "coco") {
          isGetImage = cocoIsGetImage;
          handleIsGetImage = handleCocoIsGetImage;
          chkboxId = "include_img_btn_coco";
        } else if (type === "voc") {
          isGetImage = vocIsGetImage;
          handleIsGetImage = handleVocIsGetImage;
          chkboxId = "include_img_btn_voc";
        }

        return (
          <FormControlLabel
            style={{
              alignSelf: "start",
              color: currentThemeColor.textWhite87,
              margin: "10px",
              alignItems: "center",
            }}
            control={
              <Checkbox
                id={chkboxId}
                value={isGetImage}
                checked={isGetImage}
                onChange={handleIsGetImage}
                color="primary"
                style={{ marginRight: "4px" }}
              />
            }
            label={t("with images")}
          />
        );
      };

      const remainTimeBtn = (type) => (
        <Button
          aria-controls="customized-menu"
          aria-haspopup="true"
          id={`info_${type}remaintime_disabled_btn`}
          disabled
          style={{
            marginBottom: "10px",
            fontSize: "12px",
          }}
        >
          {renderTime()}
        </Button>
      );

      let dataStatus = 0;
      let dataDownloadTime = 0;
      if (datatype === "coco") {
        dataStatus = exportCocoStatus;
        dataDownloadTime = cocoDownloadTime;
      } else if (datatype === "voc") {
        dataStatus = exportVocStatus;
        dataDownloadTime = vocDownloadTime;
      }

      if (datatype) {
        if (dataStatus === 99 || dataStatus === -1) {
          return (
            <>
              {exportBtn(datatype)}
              {exportCheckbox(datatype)}
            </>
          );
        } else {
          if (dataDownloadTime < 3600000) {
            return remainTimeBtn(datatype);
          } else {
            return (
              <>
                {exportBtn(datatype)}
                {exportCheckbox(datatype)}
              </>
            );
          }
        }
      } else return exportBtn();
    };

    if (workApp === "object_detection")
      return (
        <>
          <div>
            {renderExportData("coco")}
            <div className={classes.text87}>
              {t(
                "Click the Save COCO button to save the labeling information in a JSON format."
              )}
            </div>
          </div>

          <div style={{ marginTop: "30px" }}>
            {renderExportData("voc")}
            <div className={classes.text87}>
              {t(
                "Click the Save VOC button to save the labeling information in a XML format."
              )}
            </div>
          </div>
        </>
      );

    else if (workApp === "detection_3d")
      return (
        <>
          <div>
            {renderExportData("")}
            <div className={classes.text87}>
              {t(
                "Click the Save COCO button to save the labeling information in a JSON format."
              )}
            </div>
          </div>
        </>
      );
    else
      return (
        <div>
          {renderExportData()}
          <div className={classes.text87}>
            {t(
              "Click the Save button to save the labeling information in a file format."
            )}
          </div>
        </div>
      );
  };

  return (
    <>
      <ReactTitle title={"DS2.ai - " + t("Labeling")} />
      {labelprojects.isLoading || isLoading ? (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      ) : (
        <div style={{ marginTop: "15px", display: "flex" }}>
          <b
            style={{
              width: "130px",
              fontSize: "16px",
              color: currentThemeColor.textWhite87,
              paddingTop: "8px",
            }}
          >
            Export
          </b>
          <div>
            {labelprojects.projectDetail.workapp !== "voice" && (
              <div>
                {/* <Button
                  aria-controls="customized-menu"
                  aria-haspopup="true"
                  className={classes.defaultGreenOutlineButton}
                  style={{ marginRight: "10px" }}
                  id="startAIdevelopeBtn"
                  disabled={isProjectBtnDisabled}
                  onClick={() => {
                    dispatch(askProjectFromLabelRequestAction());
                  }}
                >
                  {t("AI development")}
                </Button>
                <div className={classes.text87}>
                  {t(
                    "개발 시작하기 버튼을 클릭하면 라벨링된 이미지로 인공지능 개발이 가능합니다."
                  )}
                </div> */}
              </div>
            )}
            {secExportData(labelprojects.projectDetail?.workapp)}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(LabelExport);
