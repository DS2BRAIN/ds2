import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import * as api from "controller/api.js";
import currentTheme from "assets/jss/custom.js";
import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import { getUserCountRequestAction } from "redux/reducers/user.js";
import API from "components/PredictModal/API.js";
import Button from "components/CustomButtons/Button";
import { sendErrorMessage } from "components/Function/globalFunc";
import { IS_ENTERPRISE } from "variables/common";

import { useTranslation } from "react-i18next";
import { DropzoneArea } from "material-ui-dropzone";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@mui/material";
import LinearProgress from "@material-ui/core/LinearProgress";
import CloseIcon from "@material-ui/icons/Close";

const mainColor = currentTheme.background2;

const ModalPage = React.memo(
  ({
    isStandard,
    closeModal,
    chosenItem,
    isMarket,
    opsId,
    csv,
    trainingColumnInfo,
    history,
    marketProjectId,
    isStandardMovie,
  }) => {
    const classes = currentTheme();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { projects, models, user } = useSelector(
      (state) => ({
        projects: state.projects,
        models: state.models,
        user: state.user,
      }),
      []
    );

    const [isLoading, setIsLoading] = useState(true);
    const [isAPILoading, setIsAPILoading] = useState(false);
    const [modelDetail, setModelDetail] = useState(null);
    const [files, setFiles] = useState([]);
    const [isPredictAllSuccess, setIsPredictAllSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [completed, setCompleted] = useState(0);

    useEffect(() => {
      if (models.model) {
        setModelDetail(models.model);
        setIsLoading(false);
      }
    }, [models.model]);

    useEffect(() => {
      if (completed && isAPILoading) {
        const tempCompleted = completed + 5;
        if (completed >= 95) {
          return;
        }
        if (completed < 90) {
          setTimeout(() => {
            setCompleted(tempCompleted);
          }, 5000);
        } else {
          setTimeout(() => {
            setCompleted(tempCompleted);
          }, 10000);
        }
      }
    }, [completed]);

    const handelFileChange = (files) => {
      setFiles(files);
    };

    const dropFilesReject = () => {
      dispatch(
        openErrorSnackbarRequestAction(
          t("Invalid file type. Only .csv file can be uploaded")
        )
      );
    };

    const dropFiles = (files) => {
      setFiles(files);
      dispatch(
        openSuccessSnackbarRequestAction(t("The file(s) has been uploaded"))
      );
    };

    const deleteFiles = () => {
      setFiles(null);
      dispatch(openSuccessSnackbarRequestAction(t("The file(s) has been deleted")));
    };

    const goToAlarmHistory = () => {
      window.location.href = "/admin/setting/notilist";
    };

    const onClickPredictAll = () => {
      if (files.length < 1) {
        dispatch(
          openErrorSnackbarRequestAction(t("Please upload the file and proceed"))
        );
        return;
      }

      setCompleted(5);
      setIsAPILoading(true);
      if (chosenItem === "predict") {
        api.getModelsInfoDetail(models.chosenModel).then((res) => {
          if (res.data.visionModel || res.data.objectDetectionModel) {
            api
              .predictAllImage(models.chosenModel, files, isMarket, opsId)
              .then((response) => {
                return new Blob([response.data]);
              })
              .then((blob) => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `result.csv`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                //files && addPredictCount(files.length);
                closeModal();
                dispatch(
                  openSuccessSnackbarRequestAction(
                    t("Successfully predicted.")
                  )
                );
              })
              .then(() => {
                dispatch(getUserCountRequestAction());
              })
              .catch((e) => {
                if (!IS_ENTERPRISE && e.response && e.response.status === 402) {
                  window.location.href =
                    "/admin/setting/payment/?cardRequest=true";
                  return;
                }
                const message = e.response
                  ? user.language === "ko"
                    ? e.response.data.message
                    : e.response.data.message_en
                  : t("Data error");
                setErrorMessage(message);
              })
              .finally(() => {
                setFiles([]);
                setCompleted(0);
                setIsAPILoading(false);
              });
          } else {
            api
              .predictAll(models.chosenModel, files, isMarket, opsId)
              .then((response) => {
                if (response.status === 201) {
                  setIsPredictAllSuccess(true);
                }
              })
              .then(() => {
                dispatch(getUserCountRequestAction());
              })
              .catch((e) => {
                const message = e.response
                  ? user.language === "ko"
                    ? e.response.data.message
                    : e.response.data.message_en
                  : t("Data error");
                setErrorMessage(message);
              })
              .finally(() => {
                setFiles([]);
                setCompleted(0);
                setIsAPILoading(false);
              });
          }
        });
      } else {
        api
          .predictLabelingAsync(models.chosenModel, files, isMarket, opsId)
          .then((response) => {
            if (response.status === 201) {
              setIsPredictAllSuccess(true);
            }
          })
          .then(() => {
            dispatch(getUserCountRequestAction());
          })
          .catch((e) => {
            const message = e.response
              ? user.language === "ko"
                ? e.response.data.message
                : e.response.data.message_en
              : t("Data error");
            setErrorMessage(message);
          })
          .finally(() => {
            setFiles([]);
            setCompleted(0);
            setIsAPILoading(false);
          });
      }
    };
    const goToUploadPage = () => {
      setIsPredictAllSuccess(false);
      setErrorMessage(null);
    };

    const closeModalAction = () => {
      closeModal();
      setIsAPILoading(false);
      setErrorMessage(null);
      setIsPredictAllSuccess(false);
    };

    const downloadTemplate = () => {
      setIsAPILoading(true);
      api
        .getTemplateFile(modelDetail.project, window.navigator.platform)
        .then((res) => {
          return new Blob([res.data]);
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `template.csv`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        })
        .catch((e) => {
          if (!process.env.REACT_APP_DEPLOY) console.log(e);
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
                  "죄송합니다, 일시적 오류로 인하여 탬플릿 다운에 실패하였습니다."
                )
              )
            );
          }
        })
        .finally(() => {
          setIsAPILoading(false);
        });
    };

    const renderItem = () => {
      let category = "";
      if (chosenItem === "predict") category = "일괄예측";
      if (chosenItem === "autolabelling") category = "오토라벨링";

      if (chosenItem === "predict" || chosenItem === "autolabelling") {
        if (completed > 0 && isAPILoading) {
          return (
            <div className={classes.fileModalContainer}>
              <div className={classes.loading}>
                <CircularProgress size={28} />
                <LinearProgress
                  style={{ width: "100%", marginTop: "20px" }}
                  variant="determinate"
                  value={completed}
                />
                <p className={classes.text}>
                  {t("Predicting")} {completed}% {t("완료")}...{" "}
                </p>
              </div>
            </div>
          );
        } else {
          if (isPredictAllSuccess) {
            return (
              <div
                className={classes.fileModalContainer}
                style={{ minHeight: "250px" }}
              >
                <CloseIcon
                  className={classes.closeImg}
                  onClick={closeModalAction}
                />
                <div style={{ fontSize: "25px", marginBottom: "30px" }}>
                  {modelDetail.name.toUpperCase()} ({t(category)})
                </div>
                <div className={classes.predictContainer}>
                  <div style={{ fontSize: "20px", margin: "20px 0" }}>
                    <div>
                      {t(`${category}이 시작되었습니다.`)}
                      <br />
                      {t("You’ll be notified in the notification window when it is completed")}
                    </div>
                  </div>
                  <div style={{ alignSelf: "flex-end" }}>
                    <Button
                      style={{
                        width: "240px",
                        alignSelf: "flex-end",
                        margin: "30px 15px 15px",
                      }}
                      id="uploadPredictAgain"
                      className={`${classes.defaultF0F0OutlineButton} ${classes.neoBtnH30}`}
                      onClick={goToAlarmHistory}
                    >
                      {t("See all notifications")}
                    </Button>
                    <Button
                      style={{
                        width: "240px",
                        alignSelf: "flex-end",
                        margin: "30px 15px 15px",
                      }}
                      id="uploadPredictAgain"
                      className={`${classes.defaultGreenOutlineButton} ${classes.neoBtnH30}`}
                      onClick={goToUploadPage}
                    >
                      {t("Re-upload")}
                    </Button>
                  </div>
                </div>
              </div>
            );
          } else if (errorMessage) {
            return (
              <div
                className={classes.fileModalContainer}
                style={{ minHeight: "250px" }}
              >
                <CloseIcon
                  className={classes.closeImg}
                  onClick={closeModalAction}
                />
                <div style={{ fontSize: "25px", marginBottom: "30px" }}>
                  {modelDetail.name.toUpperCase()} ({t(category)})
                </div>
                <div className={classes.predictContainer}>
                  <div style={{ fontSize: "20px", marginTop: "20px" }}>
                    <div>{t("Collective prediction failed due to an error.")}</div>
                    <p
                      className={classes.text}
                      style={{ wordBreak: "break-all" }}
                    >
                      {t("Cause")} : {t(errorMessage)}
                    </p>
                  </div>
                  <Button
                    style={{
                      width: "240px",
                      alignSelf: "flex-end",
                      margin: "30px 15px 15px",
                    }}
                    id="uploadPredictAgain"
                    className={`${classes.defaultGreenOutlineButton} ${classes.neoBtnH30}`}
                    onClick={goToUploadPage}
                  >
                    {t("Re-upload")}
                  </Button>
                </div>
              </div>
            );
          } else {
            return (
              <div className={classes.fileModalContainer}>
                <CloseIcon
                  className={classes.closeImg}
                  onClick={closeModalAction}
                />
                <div style={{ fontSize: "25px", marginBottom: "30px" }}>
                  {modelDetail.name.toUpperCase()} ({t(category)})
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <Button
                    style={{ width: "200px " }}
                    className={`${classes.defaultF0F0OutlineButton} ${classes.neoBtnH30}`}
                    onClick={downloadTemplate}
                  >
                    {t("Download template")}
                  </Button>
                  <span style={{ marginLeft: "20px" }}>
                    {t(
                      "템플릿 파일을 다운로드하여 데이터를 채운 뒤 파일을 업로드해주시길 바랍니다."
                    )}
                  </span>
                </div>

                <div className={classes.predictAllContainer} id="predictModal">
                  <DropzoneArea
                    onChange={handelFileChange}
                    acceptedFiles={[".csv"]}
                    showPreviews={true}
                    showPreviewsInDropzone={false}
                    maxFileSize={2147483648}
                    dialogTitle={t("Batch upload")}
                    dropzoneText={t(
                      "드래그 앤 드롭으로 csv 파일을 업로드해주세요."
                    )}
                    onDropRejected={dropFilesReject}
                    onDrop={dropFiles}
                    onDelete={deleteFiles}
                    showAlerts={false}
                    filesLimit={1}
                  />
                  <Button
                    id="clickPredict"
                    className={
                      files.length < 1
                        ? `${classes.defaultDisabledButton} ${classes.neoBtnH30}`
                        : `${classes.defaultGreenOutlineButton} ${classes.neoBtnH30}`
                    }
                    style={{
                      width: "240px",
                      alignSelf: "flex-end",
                      cursor: "default",
                      marginTop: "30px",
                    }}
                    onClick={onClickPredictAll}
                  >
                    {t("Next")}
                  </Button>
                </div>
              </div>
            );
          }
        }
      } else {
        return (
          <div className={classes.modalPredictContainer}>
            <div className={classes.alignRight}>
              <CloseIcon
                className={classes.closeImg}
                onClick={closeModalAction}
              />
            </div>
            <div className={classes.apiContainer}>
              <API
                isStandard={isStandard}
                chosenItem={chosenItem}
                csv={csv}
                trainingColumnInfo={trainingColumnInfo}
                modelDetail={modelDetail}
                history={history}
                isMarket={isMarket}
                opsId={opsId}
                marketProjectId={marketProjectId}
                isStandardMovie={isStandardMovie}
                closeModal={closeModalAction}
              />
            </div>
          </div>
        );
      }
    };
    return models.isLoading || isLoading ? (
      <div className={classes.fileModalContainer}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </div>
      </div>
    ) : (
      renderItem()
    );
  }
);

export default ModalPage;
