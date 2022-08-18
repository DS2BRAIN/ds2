import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { openErrorSnackbarRequestAction, openSuccessSnackbarRequestAction } from "redux/reducers/messages";
import { getRecentProjectsRequestAction } from "redux/reducers/projects";
import * as api from "controller/labelApi.js";
import Cookies from "helpers/Cookies";
import currentTheme from "assets/jss/custom";
import { IS_ENTERPRISE } from "variables/common";
import { checkIsValidKey, sendErrorMessage } from "components/Function/globalFunc.js";
import Button from "components/CustomButtons/Button";

import { Grid, Modal, Typography, FormControl, FormControlLabel, RadioGroup, Radio, Tooltip, CircularProgress, Checkbox } from "@mui/material";

const CustomAICreateModal = ({ history, isCustomAIModalOpen, setIsCustomAIModalOpen, dataColumns, isSendingAPI, setIsSendingAPI, predictColumnName, totalLabelClasses, setIsCustomAiLoading, getProjectsStatus, setIsAbleToAutoLabeling, setCreatingCustomAiProjectId }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, labelprojects } = useSelector((state) => ({ user: state.user, labelprojects: state.labelprojects }), []);
  const { t } = useTranslation();

  const [customAIType, setCustomAIType] = useState("box");
  const [useClass, setUseClass] = useState({});
  const [useColumn, setUseColumn] = useState({});
  const [isAbleToCustomAI, setIsAbleToCustomAI] = useState(false);

  const customAIModalClose = () => {
    if (!isSendingAPI) setIsCustomAIModalOpen(false);
  };

  const onChangeCustomAIType = (e) => {
    setCustomAIType(e.target.value);
  };

  const onChangeUseColumn = (e) => {
    if (e.target.name !== predictColumnName) {
      setUseColumn({
        ...useColumn,
        [e.target.value]: e.target.checked,
      });
    }
  };

  const onClickPredictColumn = (e) => {
    if (e.target.name === predictColumnName) {
      dispatch(openErrorSnackbarRequestAction(t("Prediction columns cannot be used as training data.")));
      e.target.checked = false;
    }
  };

  const onChangeUseClass = (e) => {
    setUseClass({
      ...useClass,
      [e.target.value]: e.target.checked,
    });
  };

  const startBuildingCustomAI = (type) => {
    const isAvailableCustomAI = (IS_ENTERPRISE && user.isValidUser) || !IS_ENTERPRISE;

    if (isAvailableCustomAI) {
      const useClassArray = Object.keys(useClass);
      const useColumnArray = Object.keys(useColumn);
      const predictColumn = dataColumns.filter((dataColumn) => dataColumn.columnName === predictColumnName);
      let predictColumnId = null;

      if (predictColumn.length > 0) {
        predictColumnId = predictColumn[0]?.id;
      }
      if (type !== "normal_regression" && useClassArray.length === 0) {
        dispatch(openErrorSnackbarRequestAction(t("Please select at least one class.")));
        return;
      }
      if (type !== "image" && type !== "object_detection" && useColumnArray.length === 0) {
        dispatch(openErrorSnackbarRequestAction(t("Please select one or more data columns.")));
        return;
      }

      setIsSendingAPI(true);
      postCustomAI(predictColumnId);
    }
  };

  const postCustomAI = (predictColumnId) => {
    api
      .postCustomAI({
        labelproject_id: labelprojects.projectDetail.id,
        custom_ai_type: customAIType,
        use_class_info: useClass,
        trainingColumnInfo: useColumn,
        valueForPredictColumnId: predictColumnId,
      })
      .then((res) => {
        getProjectsStatus();
        setIsCustomAiLoading(true);
        setIsAbleToAutoLabeling(false);
        dispatch(openSuccessSnackbarRequestAction(t("Creating Custom AI. You will be notified via email when completed.")));
        setCreatingCustomAiProjectId(res.data.id);
        dispatch(getRecentProjectsRequestAction());
      })
      .catch((e) => {
        setIsCustomAiLoading(false);
        setIsAbleToAutoLabeling(true);
        if (e.response && e.response.status === 401) {
          dispatch(openErrorSnackbarRequestAction(t("You have been logged out automatically, please log in again")));
          setTimeout(() => {
            Cookies.deleteAllCookies();
            history.push("/signin/");
          }, 2000);
          return;
        }
        if (IS_ENTERPRISE && e.response && e.response.status === 402) {
          window.location.href = "/admin/setting/payment/?cardRequest=true";
          return;
        }

        if (e.response && e.response.data.message) {
          dispatch(openErrorSnackbarRequestAction(sendErrorMessage(e.response.data.message, e.response.data.message_en, user.language)));
        } else {
          dispatch(openErrorSnackbarRequestAction(t("An error occurred during the developing process. Please try again in a moment")));
        }
      })
      .finally(() => {
        setIsCustomAIModalOpen(false);
        setIsSendingAPI(false);
      });
  };

  useEffect(() => {
    let tmpObj = {};
    let flag = false;
    {
      dataColumns &&
        dataColumns.map((dataColumn) => {
          if (dataColumn) {
            tmpObj = {
              ...tmpObj,
              [dataColumn.id]: dataColumn.columnName !== predictColumnName,
            };
            flag = true;
          }
        });
    }
    setUseColumn(tmpObj);
  }, [dataColumns, predictColumnName]);

  useEffect(() => {
    let tmpObj = {};
    let flag = false;
    {
      totalLabelClasses &&
        totalLabelClasses.map((labelClass) => {
          if (labelClass) {
            if (labelClass.completedLabelCount >= 10) {
              tmpObj = { ...tmpObj, [labelClass.name]: true };
              flag = true;
            }
          }
        });
    }
    setUseClass(tmpObj);
  }, [totalLabelClasses]);

  useEffect(() => {
    let cnt = 0;
    Object.keys(useClass).map((key) => {
      if (useClass[key]) {
        cnt++;
      }
    });

    const workapp = labelprojects.projectDetail?.workapp;

    // 커스텀 ai 생성가능 여부 설정
    if (workapp === "image" || workapp === "normal_classification") {
      // 분류이므로 클래스가 2개 이상 등록되어 있는 경우에만 가능
      setIsAbleToCustomAI(cnt >= 2);
    } else if (workapp === "normal_regression") {
      setIsAbleToCustomAI(true);
    } else {
      // object_detection, text,
      setIsAbleToCustomAI(cnt >= 1);
    }
  }, [useClass, labelprojects.projectDetail]);

  return (
    <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={isCustomAIModalOpen} onClose={customAIModalClose} className={classes.modalContainer}>
      <div className={classes.autoLabelingContent}>
        <div>
          {labelprojects.projectDetail && labelprojects.projectDetail.workapp === "object_detection" && (
            <>
              <Grid item xs={12} sx={{ fontWeight: 600 }}>
                {t("Select Custom AI Type")}
              </Grid>
              <div
                style={{
                  maxHeight: "200px",
                  overflow: "auto",
                }}
              >
                <FormControl component="fieldset" style={{ margin: "16px 20px 24px" }}>
                  {/*<FormLabel component="legend" style={{paddingTop: '20px', color:currentTheme.text1 + ' !important'}}>{t('Analyze Unit')}</FormLabel>*/}
                  <RadioGroup row aria-label="position" name="position" defaultValue="box" onChange={onChangeCustomAIType}>
                    <FormControlLabel value="box" label={t("General (Box)")} control={<Radio color="primary" />} />
                    <FormControlLabel value="polygon" label={t("Polygon")} control={<Radio color="primary" />} />
                  </RadioGroup>
                </FormControl>
              </div>
              <br />
            </>
          )}

          {labelprojects.projectDetail && labelprojects.projectDetail.workapp !== "image" && labelprojects.projectDetail.workapp !== "object_detection" && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontWeight: 600 }}>{t("Select the data column to use")}</span>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                <FormControl
                  component="fieldset"
                  style={{
                    width: "100%",
                    padding: 20,
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  {dataColumns &&
                    dataColumns.map((dataColumn) => {
                      return (
                        <FormControlLabel
                          control={<Checkbox onClick={onChangeUseColumn} value={dataColumn.id} defaultChecked={dataColumn.columnName !== predictColumnName} label={dataColumn.columnName} name={dataColumn.columnName} style={{ marginRight: 4 }} />}
                          label={dataColumn.columnName}
                          onClick={onClickPredictColumn}
                          style={
                            dataColumn.columnName === predictColumnName
                              ? {
                                  minWidth: "30%",
                                  margin: 10,
                                  opacity: 0.6,
                                }
                              : { minWidth: "30%", margin: 10 }
                          }
                        />
                      );
                    })}
                </FormControl>
              </div>
            </div>
          )}

          {labelprojects.projectDetail && labelprojects.projectDetail.workapp !== "normal_regression" && (
            <>
              <div style={{ fontWeight: 600 }}>{t("Choose the class to use")}</div>
              <span className={classes.subHighlightText}>* {t("Only classes with at least 10 labeled data can be selected.")}</span>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                <FormControl
                  component="fieldset"
                  style={{
                    width: "100%",
                    padding: 20,
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  {totalLabelClasses &&
                    totalLabelClasses.map((labelClass) => {
                      return (
                        <FormControlLabel
                          className={labelClass.completedLabelCount < 10 ? "disabled" : "active"}
                          disabled={labelClass.completedLabelCount < 10}
                          control={<Checkbox onClick={onChangeUseClass} value={labelClass.name} defaultChecked={labelClass.completedLabelCount >= 10} label={labelClass.name} style={{ marginRight: 4 }} />}
                          label={
                            <span>
                              <span
                                style={{
                                  fontWeight: 600,
                                  marginRight: 8,
                                  verticalAlign: "middle",
                                }}
                              >
                                {labelClass.name}
                              </span>
                              <span style={{ fontSize: 14 }}>
                                {/* {` [ ${labelClass.completedLabelCount} / 10 ]`} */}
                                {`[ ${labelClass.completedLabelCount ? labelClass.completedLabelCount.toLocaleString() : 0} ]`}
                              </span>
                            </span>
                          }
                          style={{ minWidth: "30%", margin: 10 }}
                        />
                      );
                    })}
                </FormControl>
              </div>
            </>
          )}

          <Typography component="div" style={{ marginTop: "36px", fontSize: 16, fontWeight: 500 }}>
            {t("Create a custom AI based on the training data labeled so far. You can proceed with auto-labeling with the created AI.")}
          </Typography>
        </div>

        <Grid container justifyContent="space-between" alignItems="center" width="100%" style={{ margin: "16px 0 24px" }} columnSpacing={2}>
          <Grid item xs={6} style={{ padding: 0 }}>
            <Button
              id="close_customaimodal_btn"
              shape="greenOutlined"
              style={{ width: "100%" }}
              onClick={() => {
                setIsCustomAIModalOpen(false);
              }}
            >
              {t("Cancel")}
            </Button>
          </Grid>
          <Grid item xs={6}>
            {isAbleToCustomAI ? (
              <>
                <Button
                  id="start_customai_btn"
                  shape="greenContained"
                  style={{ width: "100%" }}
                  onClick={() => {
                    if (!isSendingAPI) {
                      checkIsValidKey(user, dispatch, t).then(() => {
                        startBuildingCustomAI(labelprojects.projectDetail?.workapp);
                      });
                    } else return;
                  }}
                >
                  <span>{t("Getting Started with AI Development")}</span>
                  {isSendingAPI && (
                    <CircularProgress
                      color="inherit"
                      size={16}
                      sx={{
                        color: "var(--textWhite87)",
                        verticalAlign: "middle",
                        marginLeft: "8px",
                      }}
                    />
                  )}
                </Button>
              </>
            ) : (
              <>
                <Tooltip title={<span style={{ fontSize: "11px" }}>{t("클래스당 라벨링 10개 이상 있어야 Custom AI 를 만들 수 있습니다.")}</span>} placement="top">
                  <div>
                    <Button id="start_customai_disabled_btn" shape="Contained" disabled style={{ width: "100%", textAlign: "center" }}>
                      {t("Getting Started with AI Development")}
                    </Button>
                  </div>
                </Tooltip>
              </>
            )}
          </Grid>
        </Grid>
      </div>
    </Modal>
  );
};

export default CustomAICreateModal;
