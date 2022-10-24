import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

import Cookies from "helpers/Cookies";
import * as api from "controller/api.js";
import { fileurl } from "controller/api";
import {
  askModalRequestAction,
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import {
  postFavoriteModelRequestAction,
  putProjectWebhooksRequest,
  postPurchaseModelRequestAction,
} from "redux/reducers/projects.js";
import { setModelSSEDictRequestAction } from "redux/reducers/models";
import { getModelRequestAction } from "redux/reducers/models.js";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import { IS_ENTERPRISE } from "variables/common";
import { openChat } from "components/Function/globalFunc";

import {
  Divider,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  LinearProgress,
  Popover,
  Tooltip,
} from "@mui/material";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import ReportProblem from "@material-ui/icons/ReportProblem";
import CloseIcon from "@mui/icons-material/Close";
import ModalPage from "components/PredictModal/ModalPage.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import ModalTooltip from "components/Tooltip/Tooltip.js";
import SalesModal from "../SkyhubAI/SalesModal";
import MetabaseButton from "components/CustomButtons/MetabaseButton";
import Button from "components/CustomButtons/Button";
import Analytics from "./Analytics";

let sortObj = {
  name: "down",
  status: "down",
  accuracy: "down",
  rmse: "up",
  mase: "up",
  dice: "down",
  errorRate: "up",
  totalLoss: "up",
  "Overall ACC": "down",
  Kappa: "down",
  "Overall RACC": "down",
  "SOA1(Landis & Koch)": "down",
  "SOA2(Fleiss)": "down",
  "SOA3(Altman)": "down",
  "SOA4(Cicchetti)": "down",
  "SOA5(Cramer)": "down",
};

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: "18px !important",
    borderRadius: "3px",
    border: "1px solid rgba(240, 240, 240, 0.5)",
    boxSizing: "border-box",
  },
  colorPrimary: {
    backgroundColor:
      theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
  },
  bar: {
    height: "105% !important",
    borderRadius: "3px",
    backgroundColor: "#1a90ff",
    border: "1px solid rgba(208, 208, 208, 0.5)",
    boxSizing: "border-box",
  },
}))(LinearProgress);

const ModelTable = React.memo(
  ({
    category,
    csv,
    trainingColumnInfo,
    history,
    projectStatus,
    price,
    isAnyModelFinished,
    isVerify,
    selectedPage,
  }) => {
    const classes = currentTheme();
    const dispatch = useDispatch();
    const { user, projects, messages } = useSelector(
      (state) => ({
        user: state.user,
        projects: state.projects,
        messages: state.messages,
      }),
      []
    );
    const { t, i18n } = useTranslation();

    const [sortedModels, setSortedModels] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modelPage, setModelPage] = useState(0);
    const [rowsPerModelPage, setRowsPerModelPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [
      isPrescriptiveAnalyticsModalOpen,
      setIsPrescriptiveAnalyticsModalOpen,
    ] = useState(false);
    const [chosenItem, setChosenItem] = useState(null);

    const [sortValue, setSortValue] = useState("");
    const [isSortObjChanged, setIsSortObjChanged] = useState(false);
    const [hasDataObj, setHasDataObj] = useState({});

    const [openWebhooksModal, setOpenWebhooksModal] = useState(false);
    const [webhooksUrl, setWebhooksUrl] = useState("");
    const [webhooksMethod, setWebhooksMethod] = useState("post");
    const [modelStatus, setModelStatus] = useState(null);
    const [isTooltipModalOpen, setIsTooltipModalOpen] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isBuyingJetson, setisBuyingJetson] = useState(false);
    const [isCheckedTerm, setIsCheckedTerm] = useState(false);
    const [selectedModelId, setSelectedModelId] = useState(null);
    const [tooltipCategory, setTooltipCategory] = useState("");
    const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
    const [downloadOff, setDownloadOff] = useState(false);
    const [updatedSSEDict, setUpdatedSSEDict] = useState({});
    const [modelSSEDict, setModelSSEDict] = useState({});
    const [anchorRmse, setAnchorRmse] = useState(null);
    const [anchorTotalLoss, setAnchorTotalLoss] = useState(null);
    const [anchorAccuracy, setAnchorAccuracy] = useState(null);
    const [anchorErrorRate, setAnchorErrorRate] = useState(null);
    const [anchorDice, setAnchorDice] = useState(null);
    const [anchorR2Score, setAnchorR2Score] = useState(null);
    const [anchorMase, setAnchorMase] = useState(null);
    const [anchorMAE, setAnchorMAE] = useState(null);
    const [defaultStatKeys, setDefaultStatKeys] = useState([]);
    const [cmStatKeys, setCmStatKeys] = useState([]);
    const [substituteHead, setSubsituteHead] = useState({});
    const [isSseInitiated, setIsSseInitiated] = useState(false);

    const sortValueRef = useRef(sortValue);
    sortValueRef.current = sortValue;
    let lang = i18n.language;
    const modelDone = fileurl + "asset/front/img/modelIcon/modelDone.png";
    const modelError = fileurl + "asset/front/img/modelIcon/modelError.png";
    const modelPause = fileurl + "asset/front/img/modelIcon/modelPause.png";
    const modelProcessing =
      fileurl + "asset/front/img/modelIcon/modelProcessing.png";

    useEffect(() => {
      if (
        !isSseInitiated &&
        projects.project?.id &&
        (projects.project?.status > 0 || isAnyModelFinished) &&
        projects.project.models.length
      ) {
        setIsLoading(true);
        function getModelsInfo(event) {
          setIsSseInitiated(true);
          const response = JSON.parse(event.data);
          if (typeof response === "object" && Object.keys(response).length) {
            setUpdatedSSEDict(response);
          }
        }

        const SSEapi = api.getModelsInfoViaSSE(projects.project?.id);
        SSEapi.addEventListener("new_message", getModelsInfo);
        return () => {
          SSEapi.close();
          setIsSseInitiated(false);
        };
      }
    }, [
      projects.project?.id,
      projects.project?.models,
      projects.project?.status,
    ]);

    useEffect(() => {
      getModelSSEDict(updatedSSEDict);
    }, [updatedSSEDict]);

    useEffect(() => {
      let tempDefKeys = defaultStatKeys;
      if (Object.keys(hasDataObj).length) {
        Object.keys(hasDataObj).forEach((hasData) => {
          if (hasDataObj[hasData] && !tempDefKeys.includes(hasData)) {
            tempDefKeys.push(hasData);
          }
        });
        setDefaultStatKeys(tempDefKeys);
      }
    }, [hasDataObj]);

    useEffect(() => {
      if (user.me) {
        lang = user.me.lang;
      }
    }, [user.me]);

    useEffect(() => {
      if (projects.project.trainingMethod) {
        let value = "";
        if (
          projects.project.trainingMethod === "normal_regression" ||
          projects.project.trainingMethod === "time_series_regression"
        ) {
          value = "rmse";
          sortObj["rmse"] = "down";
        } else if (projects.project.trainingMethod === "cycle_gan") {
          value = "totalLoss";
          sortObj["totalLoss"] = "down";
          // } else if (projects.project.trainingMethod === "object_detection") {
          //   value = "mAP";
          //   sortObj["mAP"] = "down";
        } else {
          value = "accuracy";
          sortObj["accuracy"] = "up";
        }
        if (projects.project.trainingMethod.indexOf("load") > -1) {
          setDownloadOff(true);
        } else {
          setDownloadOff(false);
        }
        setSortValue(value);
      }
    }, [projects.project && projects.project.trainingMethod]);

    useEffect(() => {
      if (projects.project.webhookMethod)
        setWebhooksMethod(projects.project.webhookMethod);
    }, [projects.project && projects.project.webhookMethod]);

    useEffect(() => {
      if (projects.project.webhookURL)
        setWebhooksUrl(projects.project.webhookURL);
    }, [projects.project && projects.project.webhookURL]);

    useEffect(() => {
      if (isSortObjChanged) setIsSortObjChanged(false);
    }, [isSortObjChanged]);

    useEffect(() => {
      if (messages.shouldCloseModal) {
        setIsModalOpen(false);
        setOpenWebhooksModal(false);
        setIsPrescriptiveAnalyticsModalOpen(false);
      }
    }, [messages.shouldCloseModal]);

    const getModelSSEDict = (updatedDict) => {
      let tempModel = { ...modelSSEDict };
      Object.keys(updatedDict).forEach((updatedKey) => {
        tempModel[updatedKey] = updatedDict[updatedKey];
      });
      setModelSSEDict(tempModel);
      getModelSSEArr(tempModel);

      dispatch(setModelSSEDictRequestAction(tempModel));
    };

    const getModelSSEArr = (modelsDict) => {
      let msdValues = Object.values(modelsDict);
      let tempSSEArr = [];
      if (msdValues.length) {
        msdValues.forEach((msdValue) => {
          tempSSEArr.push(msdValue);
        });
        getInitModelData(tempSSEArr);
      }
    };

    const getInitModelData = (modelsArr) => {
      async function wait(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }
      (async () => {
        if (modelsArr.length) {
          setIsLoading(true);
          if (category === "process") {
            await initModelData(modelsArr);
            setIsLoading(false);
          } else if (category === "sample") {
            if (projectStatus < 99) await wait(10000);
            await initModelData(modelsArr);
            setIsLoading(false);
          }
        }
      })();
    };

    const initModelData = async (modelsArr) => {
      // const models = projects.project.models;
      const models = modelsArr;
      const tempModels = [];
      const currentDate = new Date();
      let modelStatus = {
        waiting: 0,
        processing: 0,
        pausing: 0,
        error: 0,
        done: 0,
        total: models.length,
      };

      for (let idx = 0; idx < models.length; idx++) {
        const model = models[idx];
        let updatedDate = new Date(model.updated_at);
        let diffDate = currentDate.getTime() - updatedDate.getTime();
        let diffDays = diffDate / (1000 * 3600 * 24);
        let isModelHidden = diffDays > 3 && model.status < 99;

        if (model.status === 0)
          modelStatus["waiting"] = modelStatus["waiting"] + 1;
        if (model.status === 1)
          modelStatus["processing"] = modelStatus["processing"] + 1;
        if (model.status === 9)
          modelStatus["pausing"] = modelStatus["pausing"] + 1;
        if (model.status === 99)
          modelStatus["error"] = modelStatus["error"] + 1;
        if (model.status === 100) {
          modelStatus["done"] = modelStatus["done"] + 1;
        }
        // if (model.status !== 99) tempModels.push(model);
        if (!isModelHidden) tempModels.push(model);
      }
      setModelStatus(modelStatus);
      if (sortObj[sortValueRef.current] === "up") {
        if (sortValueRef.current === "name") {
          tempModels.sort((prev, next) => {
            return next[sortValueRef.current].localeCompare(
              prev[sortValueRef.current],
              undefined,
              {
                numeric: true,
                sensitivity: "base",
              }
            );
          });
        } else {
          tempModels.sort((prev, next) => {
            return next[sortValueRef.current] - prev[sortValueRef.current];
          });
          if (sortValueRef.current !== "status") {
            tempModels.sort((prev, next) => {
              return next["status"] - prev["status"];
            });
          }
        }
      } else {
        if (sortValueRef.current === "name") {
          tempModels.sort((prev, next) => {
            return prev[sortValueRef.current].localeCompare(
              next[sortValueRef.current],
              undefined,
              {
                numeric: true,
                sensitivity: "base",
              }
            );
          });
        } else {
          tempModels.sort((prev, next) => {
            return prev[sortValueRef.current] - next[sortValueRef.current];
          });
          if (sortValueRef.current !== "status") {
            tempModels.sort((prev, next) => {
              return next["status"] - prev["status"];
            });
          }
        }
      }
      let checkYclass = false;
      let checkRmse = false;

      for (let idx = 0; idx < tempModels.length; idx++) {
        if (tempModels[idx].yClass) checkYclass = true;
        if (tempModels[idx].rmse) checkRmse = true;
      }
      // if(projects.project.trainingMethod === 'normal_regression' || projects.project.trainingMethod === 'time_series_regression') {
      //     setIsForRegression(true);
      //     checkRegression();
      // }

      let statArr = [];
      let statStr = "";
      if (tempModels.length) {
        tempModels.forEach((model, idx) => {
          let tmpModel = model;
          if (model.cm_statistics) {
            statStr = model.cm_statistics;
            const statistics = JSON.parse(statStr);
            const overall_stat = statistics["overall_stat"];
            const overallArr = [];
            for (let row in overall_stat) {
              const rowArr = [];
              rowArr.push(row);
              let each = overall_stat[row];
              if (typeof each === "object") {
                each = JSON.stringify(each);
              }
              rowArr.push(each);
              overallArr.push(rowArr);
            }
            if (!statArr.length) {
              overallArr.forEach((OAstat) => {
                statArr.push(OAstat[0]);
                sortObj[OAstat[0]] = "down";
              });
              setCmStatKeys(statArr);
            }
            overallArr.forEach((OAstat) => {
              tmpModel[OAstat[0]] = OAstat[1];
            });
            tempModels[idx] = tmpModel;
          }
        });
      }
      setSortedModels(tempModels);
      checkHasData(tempModels);
      setIsLoading(false);
    };

    const checkHasData = (models) => {
      let rmseData = false;
      let totalLossData = false;
      let accuracyData = false;
      let maseData = false;
      let mapeData = false;
      let diceData = false;
      let errorRateData = false;
      let mAPData = false;
      let AP50Data = false;
      let AP75Data = false;
      let r2scoreData = false;

      for (let idx = 0; idx < models.length; idx++) {
        if (projects.project.trainingMethod === "time_series_regression") {
          if (models[idx].rmse) rmseData = true;
          if (models[idx].r2score) r2scoreData = true;
          if (models[idx].mase) maseData = true;
          if (models[idx].mape) mapeData = true;
        } else if (projects.project.trainingMethod === "normal_regression") {
          if (models[idx].r2score !== null) r2scoreData = true;
          if (models[idx].mase) maseData = true;
          if (models[idx].mape) mapeData = true;
        } else if (projects.project.trainingMethod === "cycle_gan") {
          if (models[idx].totalLoss) totalLossData = true;
          if (models[idx].errorRate || models[idx].errorRate === 0)
            errorRateData = true;
          if (models[idx].dice) diceData = true;
        } else if (projects.project.trainingMethod === "object_detection") {
          if (models[idx].ap_info?.APm) mAPData = true;
          if (models[idx].ap_info?.AP50) AP50Data = true;
          if (models[idx].ap_info?.AP75) AP75Data = true;
        } else {
          if (models[idx].accuracy || models[idx].accuracy === 0)
            accuracyData = true;
          if (models[idx].errorRate || models[idx].errorRate === 0)
            errorRateData = true;
          if (models[idx].dice) diceData = true;
        }
      }

      const tempObj = {
        rmse: rmseData,
        totalLoss: totalLossData,
        accuracy: accuracyData,
        mase: maseData,
        mape: mapeData,
        dice: diceData,
        errorRate: errorRateData,
        mAP: mAPData,
        AP50: AP50Data,
        AP75: AP75Data,
        r2score: r2scoreData,
      };
      setHasDataObj(tempObj);
    };

    const initiateMetabase = (id) => {
      let sortedArr = [...sortedModels];
      sortedArr.forEach((model, idx) => {
        if (model.id === id) {
          sortedArr[idx].metabase.status = 1;
        }
      });
      setSortedModels(sortedArr);
      api
        .getModelMetabase(id)
        .then((res) => {
          console.log(res);
          dispatch(
            openSuccessSnackbarRequestAction(
              t("Metabase analysis has started.")
            )
          );
        })
        .catch((e) => {
          console.log("error", e);
          dispatch(
            openErrorSnackbarRequestAction(
              t("An error occurred during the metabase analysis.")
            )
          );
        });
    };

    const onSortObjChange = (value) => {
      const tempModels = sortedModels;
      if (sortObj[value] === "up") {
        for (let index in sortObj) {
          if (index === value) {
            sortObj[index] = "down";
          }
        }
        if (value === "name") {
          tempModels.sort((prev, next) => {
            return prev[value].localeCompare(next[value], undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });
        } else {
          tempModels.sort((prev, next) => {
            return prev[value] - next[value];
          });
          if (sortValueRef.current !== "status") {
            tempModels.sort((prev, next) => {
              return next["status"] - prev["status"];
            });
          }
        }
      } else {
        for (let index in sortObj) {
          if (index === value) {
            sortObj[index] = "up";
          }
        }
        if (value === "name") {
          tempModels.sort((prev, next) => {
            return next[value].localeCompare(prev[value], undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });
        } else {
          tempModels.sort((prev, next) => {
            return next[value] - prev[value];
          });
          if (sortValueRef.current !== "status") {
            tempModels.sort((prev, next) => {
              return next["status"] - prev["status"];
            });
          }
        }
      }
      setSortedModels(tempModels);
      setSortValue(value);
    };

    const onClickForFavorite = (isTrue, id) => {
      dispatch(postFavoriteModelRequestAction({ id: id, isFavorite: isTrue }));
    };

    const openPrescriptiveAnalyticsModal = async (id, item) => {
      await dispatch(getModelRequestAction(id));
      setIsPrescriptiveAnalyticsModalOpen(true);
      setChosenItem(item);
    };

    const onOpenTooltipModal = (category) => {
      setTooltipCategory(category);
      setIsTooltipModalOpen(true);
    };

    const showModelTable = () => {
      const project = projects.project;
      const projectTrainMethod = project.trainingMethod;
      const data = hasDataObj;

      const tableHead = (data) => {
        const onSetSortValue = (value) => {
          setIsLoading(true);
          onSortObjChange(value);
          setIsSortObjChanged(true);
          setIsLoading(false);
        };

        const headCellsBase = () => {
          return (
            <>
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "5%", padding: "16px 40px 16px 16px" }}
              >
                <b style={{ color: currentThemeColor.textMediumGrey }}>NO</b>
              </TableCell>
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "30%", cursor: "pointer" }}
                onClick={() => onSetSortValue("name")}
              >
                <div className={classes.tableHeader}>
                  {sortValue === "name" &&
                    (sortObj[sortValue] === "down" ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                  <b>{t("Model name")}</b>
                </div>
              </TableCell>
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "10%", cursor: "pointer" }}
                onClick={() => onSetSortValue("status")}
              >
                <div className={classes.tableHeader}>
                  {sortValue === "status" &&
                    (sortObj[sortValue] === "down" ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                  <b>{t("Status")}</b>
                </div>
              </TableCell>
            </>
          );
        };

        const headCellsDataObj = (data) => {
          const renderDataHead = (defaultKey, apKey) => {
            let popoverHeight = 200;
            let popoverWidth = 150;

            const defKeyInfo = {
              rmse: {
                name: "RMSE",
                anchor: anchorRmse,
                setAnchor: setAnchorRmse,
                tooltip:
                  "평균 제곱근 오차로써 연속값을 예측할때 사용되는 지표입니다. RMSE 값이 낮을수록 근접하게 예측합니다.",
              },
              totalLoss: {
                name: "Total_loss",
                anchor: anchorTotalLoss,
                setAnchor: setAnchorTotalLoss,
                tooltip: "Total_loss 입니다.",
              },
              accuracy: {
                name: "Accuracy",
                anchor: anchorAccuracy,
                setAnchor: setAnchorAccuracy,
                tooltip:
                  "모델의 정확도를 나타냅니다. ACCURACY 값이 높을수록 정확하게 예측합니다.",
              },
              errorRate: {
                name: "Error Rate",
                anchor: anchorErrorRate,
                setAnchor: setAnchorErrorRate,
                tooltip:
                  "샘플링을 할 때 생긴 오류의 비율을 나타냅니다. 값이 낮을수록 예측 오류가 나올 확률이 낮아집니다.",
              },
              dice: {
                name: "Dice",
                anchor: anchorDice,
                setAnchor: setAnchorDice,
                tooltip:
                  "실제 값과 예측 값의 유사성을 측정하기 위해 사용되는 샘플 계수입니다. DICE 값이 높을수록 유사성이 높습니다.",
              },
              r2score: {
                name: "R2",
                anchor: anchorR2Score,
                setAnchor: setAnchorR2Score,
                tooltip:
                  "모델이 데이터를 얼마나 잘 설명하는지 나타내는 지표입니다. 0~1 값을 가질 수 있으며, 1에 가까울수록 모델이 데이터와 연관성이 높다고 할 수 있습니다.",
              },
              mase: {
                name: "MSE",
                anchor: anchorMase,
                setAnchor: setAnchorMase,
                tooltip:
                  "예측값과 실제값의 제곱을 취하여 해당 평가 예측에 대한 오차를 측정합니다.",
              },
              mape: {
                name: "MAE",
                anchor: anchorMAE,
                setAnchor: setAnchorMAE,
                tooltip:
                  "예측값과 실제값의 차이의 절대 값을 취하여 해당 평가 예측에 대한 오차를 측정합니다.",
              },
            };

            const popoverStatBtnList = (defKey) => {
              let integArr = [...defaultStatKeys, ...cmStatKeys];
              return (
                <Grid>
                  {integArr.map((statKey) => (
                    <Button
                      id={`change_${statKey}_btn`}
                      key={`popoverStatBtn_${statKey}`}
                      shape="white"
                      style={{
                        justifyContent: "flex-start",
                        width: `${popoverWidth - 10}px`,
                        background: "var(--background2)",
                        borderRadius: 0,
                      }}
                      onClick={() => {
                        let tempSubs = substituteHead;
                        tempSubs[defKey] = statKey;
                        setSubsituteHead(tempSubs);
                        onSetSortValue(statKey);
                        defKeyInfo[defaultKey].setAnchor(null);
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          textAlign: "left",
                          color: "var(--textWhite87)",
                        }}
                      >
                        {statKey}
                      </span>
                    </Button>
                  ))}
                </Grid>
              );
            };

            let resKey = substituteHead[defaultKey]
              ? substituteHead[defaultKey]
              : defaultKey;

            if (resKey)
              return (
                <TableCell
                  className={classes.tableHead}
                  align="center"
                  style={{ width: "10%" }}
                >
                  <Grid className={classes.tableHeader}>
                    {sortValue === resKey &&
                      (sortObj[sortValue] === "down" ? (
                        <ArrowUpwardIcon
                          fontSize="small"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            // sortObj[sortValue] = "up";
                            onSetSortValue(resKey);
                          }}
                        />
                      ) : (
                        <ArrowDownwardIcon
                          fontSize="small"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            // sortObj[sortValue] = "down";
                            onSetSortValue(resKey);
                          }}
                        />
                      ))}
                    <b
                      style={{ cursor: "pointer" }}
                      onClick={(e) =>
                        defKeyInfo[defaultKey]?.setAnchor(e.currentTarget)
                      }
                    >
                      {defKeyInfo[resKey]?.name
                        ? t(defKeyInfo[resKey].name)
                        : resKey}
                    </b>
                    {defKeyInfo[resKey]?.tooltip && (
                      <Tooltip
                        title={
                          <span style={{ fontSize: "11px" }}>
                            {t(defKeyInfo[resKey].tooltip)}
                          </span>
                        }
                        placement="top-start"
                      >
                        <HelpOutlineIcon
                          id="helpIcon"
                          style={{
                            marginLeft: "5px",
                            marginBottom: "10px",
                            width: "15px",
                          }}
                          fontSize="small"
                        />
                      </Tooltip>
                    )}
                  </Grid>
                  <Popover
                    open={Boolean(defKeyInfo[defaultKey]?.anchor)}
                    anchorEl={defKeyInfo[defaultKey]?.anchor}
                    onClose={() => defKeyInfo[defaultKey]?.setAnchor(null)}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "center",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    sx={{
                      height: `${popoverHeight}px`,
                      width: `${popoverWidth + 20}px`,
                    }}
                  >
                    {popoverStatBtnList(defaultKey)}
                  </Popover>
                </TableCell>
              );
            else if (apKey)
              return (
                <TableCell
                  className={classes.tableHead}
                  align="center"
                  style={{ width: "10%" }}
                >
                  <div className={classes.tableHeader}>
                    <b>{apKey}</b>
                  </div>
                </TableCell>
              );
          };

          return (
            <>
              {data.rmse && renderDataHead("rmse")}
              {data.totalLoss && renderDataHead("totalLoss")}
              {data.accuracy &&
                projectTrainMethod !== "object_detection" &&
                renderDataHead("accuracy")}
              {data.errorRate &&
                projectTrainMethod !== "object_detection" &&
                projectTrainMethod !== "normal_regression" &&
                renderDataHead("errorRate")}
              {data.dice && renderDataHead("dice")}
              {data.r2score &&
                (projectTrainMethod === "normal_regression" ||
                  projectTrainMethod === "time_series_regression") &&
                renderDataHead("r2score")}
              {data.mase && renderDataHead("mase")}
              {data.mape && renderDataHead("mape")}
              {data.mAP && renderDataHead(null, "mAP")}
              {data.AP50 && renderDataHead(null, "AP50")}
              {data.AP75 && renderDataHead(null, "AP75")}
            </>
          );
        };

        return (
          <TableHead>
            <TableRow>
              {headCellsBase()}
              {headCellsDataObj(data)}
              <TableCell className={classes.tableHead} align="center">
                <div className={classes.tableHeader}>ACTION</div>
              </TableCell>
            </TableRow>
          </TableHead>
        );
      };

      const tableBody = (models, page, rows, data) => {
        return (
          <TableBody>
            {models.slice(page * rows, page * rows + rows).map((model, idx) => {
              const id = model.id;

              const bodyCellsBase = (model, modelDict, rowNum) => (
                <>
                  <TableCell
                    className="tableRowCell"
                    id="modelTable"
                    align="center"
                  >
                    {rowNum}
                  </TableCell>
                  <TableCell
                    className="tableRowCell"
                    id="modelTable"
                    align="center"
                  >
                    {model.name ? model.name : "-"}
                  </TableCell>
                  <TableCell
                    className="tableRowCell"
                    id="modelTable"
                    align="center"
                  >
                    {model.status === 0 && t("preparing")}
                    {model.status === 9 && t("Pending")}
                    {model.status === 100 && t("Completed")}
                    {model.status === 99 && t("Error")}
                    {model.status === 1 && (
                      <LinearProgress
                        className={classes.linearProgressLightBackground}
                        variant="determinate"
                        value={
                          modelDict[model.id]?.progress
                            ? modelDict[model.id].progress
                            : model.progress
                        }
                      />
                    )}
                  </TableCell>
                </>
              );

              const bodyCellsDataObj = (model, data) => {
                const renderDataBody = (defaultKey, defaultValue, model) => {
                  let resValue = substituteHead[defaultKey]
                    ? model[substituteHead[defaultKey]]
                    : defaultValue;
                  return (
                    <TableCell className="tableRowCell" align="center">
                      {model.status === 100 ? resValue : "-"}
                    </TableCell>
                  );
                };

                let rmse = model.rmse
                  ? model.rmse.toFixed(4)
                  : model.rmse === 0
                  ? 0
                  : "-";
                let totalLoss =
                  model.totalLoss || model.totalLoss === 0
                    ? model.totalLoss
                    : "-";
                let accuracy = model.accuracy
                  ? `${(model.accuracy * 100).toFixed(4)}%`
                  : model.accuracy === 0
                  ? 0
                  : "-";
                let errorRate = model.errorRate
                  ? model.errorRate
                  : model.errorRate === 0
                  ? 0
                  : "-";
                let dice = model.dice ? model.dice : model.dice === 0 ? 0 : "-";
                let r2score = model.r2score
                  ? model.r2score
                  : model.r2score === 0
                  ? 0
                  : "-";
                let mase = model.mase ? model.mase : model.mase === 0 ? 0 : "-";
                let mae = model.mape ? model.mape : model.mape === 0 ? 0 : "-";

                return (
                  <>
                    {data.rmse && renderDataBody("rmse", rmse, model)}
                    {data.totalLoss &&
                      renderDataBody("totalLoss", totalLoss, model)}
                    {data.accuracy &&
                      projectTrainMethod !== "object_detection" &&
                      renderDataBody("accuracy", accuracy, model)}
                    {data.errorRate &&
                      projectTrainMethod !== "object_detection" &&
                      projectTrainMethod !== "normal_regression" &&
                      renderDataBody("errorRate", errorRate, model)}
                    {data.dice && renderDataBody("dice", dice, model)}
                    {data.r2score &&
                      (projectTrainMethod === "normal_regression" ||
                        projectTrainMethod === "time_series_regression") &&
                      renderDataBody("r2score", r2score, model)}
                    {data.mase && renderDataBody("mase", mase, model)}
                    {data.mape && renderDataBody("mae", mae, model)}
                    {data.mAP && (
                      <TableCell className="tableRowCell" align="center">
                        {model?.ap_info?.APm ? model.ap_info?.APm : "-"}
                      </TableCell>
                    )}
                    {data.AP50 && (
                      <TableCell className="tableRowCell" align="center">
                        {model?.ap_info?.AP50 ? model?.ap_info?.AP50 : "-"}
                      </TableCell>
                    )}
                    {data.AP75 && (
                      <TableCell className="tableRowCell" align="center">
                        {model?.ap_info?.AP75 ? model.ap_info.AP75 : "-"}
                      </TableCell>
                    )}
                  </>
                );
              };

              const bodyCellStatus100 = (project) => {
                const openDetailPage = (page, modelId, projectId) => {
                  if (!Cookies.getCookie("user")) {
                    dispatch(
                      openErrorSnackbarRequestAction(
                        t("User information not found.")
                      )
                    );
                    return;
                  }
                  if (category === "process") {
                    let basePath = isVerify ? "verifyproject" : "train";
                    history.push({
                      pathname: `/admin/${basePath}/${projectId}?model=${modelId}&page=${page}`,
                      state: { modelid: modelId, page: page },
                    });
                    return;
                  }
                  if (category === "sample") {
                    history.push({
                      pathname: `/admin/sample/${projectId}?model=${modelId}&page=${page}`,
                      state: { modelid: modelId, page: page },
                    });
                    return;
                  }
                };

                const secPredictBtns = (method, id) => {
                  let isImage =
                    method === "object_detection" ||
                    method === "cycle_gan" ||
                    method === "image";
                  let isVideo =
                    method === "object_detection" || method === "cycle_gan";
                  let isRecommender = method === "recommender";

                  const openModal = async (id, item) => {
                    await dispatch(getModelRequestAction(id));
                    setIsModalOpen(true);
                    setChosenItem(item);
                  };

                  return (
                    <>
                      {isImage ? (
                        <Button
                          id={`model${id}_image_prediction_btn`}
                          shape="blueOutlined"
                          size="sm"
                          sx={{ mx: 0.5 }}
                          onClick={() => openModal(id, "apiImage")}
                        >
                          {t("Image prediction")}
                        </Button>
                      ) : (
                        <>
                          <Button
                            id={`model${id}_single_prediction_btn`}
                            shape="blueOutlined"
                            size="sm"
                            sx={{ mx: 0.5 }}
                            onClick={() =>
                              openModal(
                                id,
                                project.option?.indexOf("load") === -1
                                  ? "api"
                                  : "apiLoaded"
                              )
                            }
                          >
                            {t("Single prediction")}
                          </Button>
                          {!isRecommender && (
                            <Button
                              id={`model${id}_collective_prediction_btn`}
                              shape="blueOutlined"
                              size="sm"
                              sx={{ mx: 0.5 }}
                              onClick={() => openModal(id, "predict")}
                            >
                              {t("Collective prediction")}
                            </Button>
                          )}
                        </>
                      )}
                      {isVideo && (
                        <Button
                          id={`model${id}_video_prediction_btn`}
                          shape="blueOutlined"
                          size="sm"
                          sx={{ mx: 0.5 }}
                          onClick={() => openModal(id, "apiVideo")}
                        >
                          {t("Video prediction")}
                        </Button>
                      )}
                    </>
                  );
                };

                const secActionBtns = (metabase, id) => {
                  let hasModelAnalytics = false;
                  if (metabase && metabase.url && metabase.status === 100) {
                    hasModelAnalytics = true;
                  }

                  const deploy = (id) => {
                    // if (user.cardInfo.cardName === null && user.cardInfo.created === null) {
                    //   window.location.href = "/admin/setting/payment/?cardRequest=true";
                    //   return;
                    // } else {
                    //   history.push(`/admin/newskyhubai/?modelid=${id}`);
                    //   return;
                    // }
                    history.push(`/admin/newskyhubai/?modelid=${id}`);
                    return;
                  };

                  const sales = (id) => {
                    setIsSalesModalOpen(true);
                  };

                  return (
                    <>
                      {/* {((project.analyticsgraphs &&
                          project.analyticsgraphs.length > 0) ||
                          hasModelAnalytics) && (
                          <div
                            id="modeltable_analysis_btn"
                            shape="blueOutlined"
                            size="sm"
                            onClick={() => openDetailPage("analytics", id)}
                          >
                            {t("Analyze")}
                          </div>
                        )} */}
                      {metabase && (
                        <MetabaseButton
                          id={id}
                          type="model"
                          metabase={metabase}
                          initiateMetabase={initiateMetabase}
                        />
                      )}
                      {/* {(project.option !== "colab" &&
                        (downloadOff || project.isShared)) ||
                      process.env.REACT_APP_ENTERPRISE === "true" ? null : (
                        <Button
                          id="modeltable_download_btn"
                          shape="blueOutlined"
                          size="sm"
                          sx={{ ml: 1 }}
                          onClick={() => {
                            setIsDownloadModalOpen(true);
                            setSelectedModelId(id);
                          }}
                        >
                          {t("Download")}
                        </Button>
                      )} */}
                      {(category !== "sample" || hasModelAnalytics) &&
                        !project.isShared && (
                          <Button
                            id={`model${id}_deploy_btn`}
                            shape="blueOutlined"
                            size="sm"
                            sx={{ mx: 0.5 }}
                            onClick={() => deploy(id)}
                          >
                            {lang === "ko" ? "배포하기" : "Deploy"}
                          </Button>
                        )}
                      {/* {(category !== "sample" || hasModelAnalytics) &&
                        !project.isShared &&
                        process.env.REACT_APP_ENTERPRISE !== "true" && (
                          <Button
                            id="modeltable_sale_btn"
                            shape="blueOutlined"
                            size="sm"
                            sx={{ ml: 1 }}
                            onClick={() => sales(id)}
                          >
                            {t("Sell")}
                          </Button>
                        )} */}
                    </>
                  );
                };

                return (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        id={`model${id}_details_btn`}
                        shape="blueOutlined"
                        size="sm"
                        sx={{ mx: 0.5 }}
                        onClick={() => openDetailPage("detail", id, project.id)}
                      >
                        {t("Details")}
                      </Button>
                      {secPredictBtns(projectTrainMethod, id)}
                      {secActionBtns(model.metabase, id)}
                    </div>
                    {model?.prescriptionAnalyticsInfo && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          id={`model${id}_prescription_analysis_btn`}
                          shape="greenContained"
                          size="sm"
                          sx={{ mx: 0.5 }}
                          onClick={() => openPrescriptiveAnalyticsModal(id)}
                        >
                          {t("Prescriptive Analyze")}
                        </Button>
                      </div>
                    )}
                  </>
                );
              };

              return (
                <TableRow className={classes.tableRow} key={model.name + idx}>
                  {bodyCellsBase(model, modelSSEDict, page * rows + idx + 1)}
                  {bodyCellsDataObj(model, data)}
                  <TableCell
                    className="tableRowCell"
                    id="modelTable"
                    align="center"
                  >
                    {model.status === 99 && "-"}
                    {model.status === 100 &&
                      project &&
                      bodyCellStatus100(project)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        );
      };

      const tablePagination = (modelLen, page, rows) => {
        const changeModelPage = (event, newPage) => {
          setModelPage(newPage);
        };
        const changeRowsPerModelPage = (event) => {
          setRowsPerModelPage(+event.target.value);
          setModelPage(0);
        };

        return (
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={modelLen}
            rowsPerPage={rows}
            page={page}
            backIconButtonProps={{
              "aria-label": "previous page",
            }}
            nextIconButtonProps={{
              "aria-label": "next page",
            }}
            onPageChange={changeModelPage}
            onRowsPerPageChange={changeRowsPerModelPage}
            style={{ marginLeft: "auto" }}
          />
        );
      };

      return (
        <>
          <Table
            className={classes.table}
            style={{ marginTop: "60px", width: "98%" }}
            stickyheader="true"
            aria-label="sticky table"
          >
            {tableHead(data)}
            {tableBody(sortedModels, modelPage, rowsPerModelPage, data)}
          </Table>
          {tablePagination(sortedModels.length, modelPage, rowsPerModelPage)}
        </>
      );
    };

    const onChangeBuyingJetson = () => {
      setisBuyingJetson(!isBuyingJetson);
    };

    const onChangeCheckingTerm = (event) => {
      setIsCheckedTerm(!isCheckedTerm);
    };

    const onChangeWebhooksUrl = (event) => {
      event.preventDefault();
      setWebhooksUrl(event.target.value);
    };
    const onWebhooksMethodChange = (event) => {
      setWebhooksMethod(event.target.value);
    };
    const onSendWebhooks = () => {
      if (!webhooksUrl) {
        dispatch(openErrorSnackbarRequestAction(t("Please enter the URL.")));
        return;
      }
      const urlRegExp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      if (webhooksUrl.match(urlRegExp) === null) {
        dispatch(
          openErrorSnackbarRequestAction(t("Please enter the correct URL."))
        );
        return;
      }
      dispatch(
        putProjectWebhooksRequest({
          id: projects.project.id,
          webhookURL: webhooksUrl,
          webhookMethod: webhooksMethod,
        })
      );
    };

    const closeModal = () => {
      dispatch(askModalRequestAction());
    };

    const closePrescriptiveAnalyticsModal = () => {
      dispatch(askModalRequestAction());
    };

    const closeTooltipModalOpen = () => {
      setIsTooltipModalOpen(false);
    };
    const closeWebhooksModal = () => {
      setOpenWebhooksModal(false);
    };

    const getResult = (response) => {
      if (!process.env.REACT_APP_DEPLOY) console.log(response);
      dispatch(openSuccessSnackbarRequestAction(t("Payment successful.")));
    };

    const buyDownloadLicense = () => {
      dispatch(
        postPurchaseModelRequestAction({
          projectID: projects.project.id,
          modelID: selectedModelId,
          amount: price,
        })
      );
    };

    if (selectedPage !== "model") return null;

    const sectionModelProgress = () => {
      let progressDenominator = modelStatus["total"];
      let progressNumerator = modelStatus["done"] + modelStatus["error"];
      let progressPercentage = (progressNumerator / progressDenominator) * 100;

      const statusList = [
        {
          id: "error",
          label: "Error",
          img: modelError,
        },
        {
          id: "processing",
          label: "In progress",
          img: modelProcessing,
        },
        {
          id: "pausing",
          label: "Waiting",
          img: modelPause,
        },
        {
          id: "done",
          label: "Completed",
          img: modelDone,
        },
      ];

      return (
        <GridContainer
          style={{
            display: "flex",
            alignItems: "flex-end",
            flexWrap: "nowrap",
          }}
        >
          <GridItem
            xs={9}
            style={{
              display: "flex",
              marginTop: "15px",
              padding: "0",
            }}
          >
            {modelStatus && (
              <>
                <div className={classes.modelCard}>
                  <div
                    style={{
                      width: "100%",
                      margin: " 5px 0 15px 0",
                      position: "relative",
                    }}
                  >
                    <BorderLinearProgress
                      variant="determinate"
                      value={
                        modelStatus["total"] === 0 ? 0 : progressPercentage
                      }
                    />
                    <b className={classes.modelProgressbar}>
                      {modelStatus["total"] === 0
                        ? "0 %"
                        : progressPercentage.toFixed(1) + " %"}
                    </b>
                  </div>
                  <GridContainer>
                    {statusList.map((stat) => (
                      <GridItem xs={3} key={stat.id}>
                        <div className={classes.modelIconContainer}>
                          <div style={{ display: "flex" }}>
                            <img
                              src={stat.img}
                              className={classes.modelIconImg}
                            />
                            <b>{t(stat.label)}</b>
                          </div>
                          <div style={{ display: "flex" }}>
                            <span className={classes.progressFont}>
                              {modelStatus[stat.id]}
                            </span>
                            <span className={classes.progressSamllFont}>
                              /{progressDenominator}
                            </span>
                          </div>
                        </div>
                      </GridItem>
                    ))}
                  </GridContainer>
                </div>
                <div style={{ maxWidth: "40px" }}>
                  <HelpOutlineIcon
                    fontSize="small"
                    style={{ marginLeft: "4px", cursor: "pointer" }}
                    id="helpIcon"
                    onClick={() => {
                      onOpenTooltipModal("modelStatus");
                    }}
                  />
                </div>
              </>
            )}
          </GridItem>
          <GridItem xs={3}>
            {!projects.project.isSample && (
              <Button
                id="use_webhooks_btn"
                shape="whiteOutlined"
                onClick={() => {
                  setOpenWebhooksModal(true);
                }}
              >
                {t("Use WEBHOOKS")}
              </Button>
            )}
          </GridItem>
        </GridContainer>
      );
    };

    return (
      <div style={{ width: "100%" }}>
        <div style={{ overflow: "auto" }}>
          {isLoading || (category === "sample" && projectStatus !== 100) ? (
            <div
              style={{
                width: "100%",
                height: "280px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={35} />
            </div>
          ) : (
            <>
              {sortedModels.length > 0 &&
                (projects.project.status !== 99 ||
                  (projects.project.status === 99 && isAnyModelFinished)) &&
                sectionModelProgress()}
              <GridContainer>
                {projects.project.status !== 99 ||
                (projects.project.status === 99 && isAnyModelFinished) ? (
                  showModelTable()
                ) : (
                  <>
                    {(projects.project.status === 99 ||
                      projects.project.status === 100) && (
                      <div style={{ marginLeft: "20px", marginTop: "24px" }}>
                        {projects.project.errorCountMemory >= 8 ? (
                          <b>
                            [ERROR]{" "}
                            {t(
                              "The project has been stopped due to exceeded GPU memory. Please reduce the size of your training data and try again with a new project"
                            )}
                          </b>
                        ) : (
                          <b>
                            [ERROR]{" "}
                            {t(
                              "The project has been stopped due to an error. Please try again with a new project."
                            )}
                          </b>
                        )}
                        <div
                          style={{
                            marginTop: "40px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <ReportProblem style={{ marginRight: "8px" }} />{" "}
                          {t(
                            "There are four main situations in which an error can occur"
                          )}
                        </div>
                        <br />
                        <div>
                          <b>
                            1.{" "}
                            {t(
                              "When training data is inserted in a wrong format, an error may occur"
                            )}
                          </b>
                        </div>
                        <div>
                          ⇒{" "}
                          {user.language === "ko" ? (
                            <>
                              <span>
                                학습 데이터를 어떻게 넣어야 하는지에 대해서는{" "}
                              </span>
                              <span>
                                <a
                                  title="사용자 가이드"
                                  href="https://krdocs.ds2.ai/"
                                  target="_blank"
                                  style={{ textDecoration: "underline" }}
                                >
                                  사용자 가이드
                                </a>
                              </span>
                              <span>를 꼭 참고해주세요.</span>
                            </>
                          ) : (
                            <>
                              <span>Please refer to </span>
                              <span>
                                <a
                                  title="the user guide"
                                  href="https://docs.ds2.ai/"
                                  target="_blank"
                                >
                                  the user guide
                                </a>
                              </span>
                              <span>
                                {" "}
                                for information on how to insert learning data.
                              </span>
                            </>
                          )}
                        </div>
                        <br />
                        <div>
                          <b>
                            2.{" "}
                            {t(
                              "There is no association between training data and labeling data (what you want to analyze/predict)"
                            )}
                          </b>
                        </div>
                        <div>
                          ⇒{" "}
                          {t(
                            "Artificial intelligence is not created if there is no correlation between the data"
                          )}{" "}
                          (
                          {t(
                            "For example, if you put Korean electricity bills as training data and Colombian housing prices as labeling data, these are almost irrelevant, so you get an error."
                          )}
                          )
                        </div>
                        <br />
                        <div>
                          <b>
                            3.{" "}
                            {t(
                              "When an error occurs due to too large data size"
                            )}
                          </b>
                        </div>
                        <div>
                          ⇒{" "}
                          {t(
                            "Error may occur during AI training when the training data is large compared to the capacity of the GPU server."
                          )}
                        </div>
                        <br />
                        <div>
                          <b>
                            4.{" "}
                            {t(
                              "When training is not possible because there is not enough data,"
                            )}
                          </b>
                        </div>
                        <div>
                          ⇒{" "}
                          {t(
                            "A sufficient amount of training data is required for AI training."
                          )}{" "}
                          {t(
                            "When the correlation between the dataset is low, you will need more data to make AI training more likely to succeed."
                          )}
                        </div>
                        <br />
                        <div>
                          <b>
                            {t(
                              "If your error is not listed, please contact us via chatbot and we will get back to you as soon as possible."
                            )}
                          </b>
                        </div>
                      </div>
                    )}
                    {projects.project.status === 9 && (
                      <div style={{ marginLeft: "20px" }}>
                        <div
                          style={{
                            marginTop: "40px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <ReportProblem style={{ marginRight: "8px" }} />{" "}
                          {t(
                            "During pre-training data processing, all training data has been deleted and therefore won’t be processed."
                          )}
                        </div>
                        <br />
                        <div>
                          <b>
                            1.{" "}
                            {t(
                              "If the preprocessing option deletes all training data"
                            )}
                          </b>
                        </div>
                        <div>
                          ⇒{" "}
                          {t(
                            "If the preprocessing option deletes all training data, the training will not proceed."
                          )}{" "}
                          {t(
                            "Please change the preprocessing option and proceed."
                          )}
                        </div>
                        <br />
                        <div>
                          <b>
                            2. {t("In case linked information is inconsistent")}
                          </b>
                        </div>
                        <div>
                          ⇒{" "}
                          {t(
                            "If there is a mismatch in linked information between training data, training may not proceed."
                          )}{" "}
                          {t(
                            "Please change the linked information option and proceed."
                          )}
                        </div>
                        <br />
                      </div>
                    )}
                    {/* {projects.project.status !== 99 &&
                      projects.project.status != 9 && (
                        <div
                          style={{
                            width: "100%",
                            height: "280px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress />
                        </div>
                      )} */}
                  </>
                )}
              </GridContainer>
            </>
          )}
        </div>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isModalOpen}
          onClose={closeModal}
          className={classes.modalContainer}
        >
          <ModalPage
            closeModal={closeModal}
            chosenItem={chosenItem}
            isMarket={false}
            opsId={null}
            csv={csv}
            trainingColumnInfo={trainingColumnInfo}
            history={history}
          />
        </Modal>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isPrescriptiveAnalyticsModalOpen}
          onClose={closePrescriptiveAnalyticsModal}
          className={classes.modalContainer}
        >
          <Analytics />
        </Modal>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isDownloadModalOpen}
          onClose={() => {
            setSelectedModelId(null);
            setIsDownloadModalOpen(false);
          }}
          className={classes.modalContainer}
        >
          <div className={classes.predictModalContent}>
            <Grid sx={{ display: "flex", justifyContent: "flex-end" }}>
              <CloseIcon
                className={classes.closeImg}
                sx={{ mt: 2, mr: 2 }}
                onClick={() => {
                  setSelectedModelId(null);
                  setIsDownloadModalOpen(false);
                }}
              />
            </Grid>
            <Grid sx={{ fontSize: "24px", ml: 3, mb: 1 }}>
              {t("Purchase a model license")}
            </Grid>
            <Divider
              className={classes.titleDivider}
              style={{ border: "1px solid white" }}
            />
            <GridContainer
              style={{
                paddingLeft: 30,
                paddingRight: 30,
                paddingBottom: 20,
                maxHeight: 230,
                overflowY: "scroll",
                width: "100%",
              }}
            >
              <span
                style={{ fontSize: "16px", lineHeight: "2em", paddingTop: 15 }}
              >
                *{" "}
                {t(
                  "When you purchase the license for the deep learning model, you can download the model."
                )}
                <br />*{" "}
                {t(
                  "The model used an open source framework based on deep learning, and when you purchase the model license, you will receive an email with the deep learning model file and the code to use the inference function in Jupyter."
                )}
                <br />*{" "}
                {t(
                  "When purchasing a license, a link to download the model will be emailed to you within 2 business days, and if you have requested a consultation to purchase a hardware kit, you will receive a consultation schedule via email."
                )}
                <br />*{" "}
                {t(
                  "The license of the model is owned by DS Lab Global Co., Ltd., and when you purchase a license, you only have the right to use the model. You do not gain ownership of the model. (Not for resale)"
                )}
                <br />*{" "}
                {t(
                  "In order to prevent leakage of proprietary AutoDL technology, hyperparameters of the model downloaded when purchasing a model license are downloaded as a calibration model that guarantees 99% similarity to the existing model."
                )}
                <br />*{" "}
                {t(
                  "For other details, please check the integrated terms of use before purchasing."
                )}
              </span>
            </GridContainer>
            <Divider
              className={classes.titleDivider}
              style={{ border: "1px solid white" }}
            />
            <GridContainer
              style={{
                paddingLeft: 50,
                paddingRight: 50,
                paddingTop: 20,
                paddingBottom: 10,
              }}
            >
              <FormControlLabel
                style={{
                  alignSelf: "start",
                  color: currentThemeColor.textWhite87,
                  fontSize: "18px",
                }}
                control={
                  <Checkbox
                    value={isBuyingJetson}
                    checked={isBuyingJetson}
                    onChange={onChangeBuyingJetson}
                    color="primary"
                    style={{ marginRight: "10px" }}
                  />
                }
                label={`${t("Option")} : ${t(
                  "Jetson Nano 2GB Developer Kit 에 함께 구매 및 설치 상담 받기 (별도 금액)"
                )}`}
              />
              <a
                target={"_blank"}
                href={
                  "https://developer.nvidia.com/embedded/jetson-nano-2gb-developer-kit"
                }
                style={{ fontSize: "16px" }}
              >
                [{t("Links to Jetson Nano 2GB Developer Kit")}]
              </a>
            </GridContainer>
            <GridContainer
              style={{
                paddingLeft: 50,
                paddingRight: 50,
                paddingTop: 10,
                paddingBottom: 10,
              }}
            >
              <FormControlLabel
                style={{
                  alignSelf: "start",
                  color: currentThemeColor.textWhite87,
                  fontSize: "18px",
                }}
                control={
                  <Checkbox
                    value={isCheckedTerm}
                    checked={isCheckedTerm}
                    onChange={onChangeCheckingTerm}
                    color="primary"
                    style={{ marginRight: "10px" }}
                  />
                }
                label={`${t(
                  "I have confirmed the above and the integrated terms of use."
                )}`}
              />
              <a
                target={"_blank"}
                href={
                  lang === "en"
                    ? "https://ds2.ai/terms_of_services.html"
                    : "https://ko.ds2.ai//terms_of_services.html"
                }
                style={{ fontSize: "16px" }}
              >
                [{t("Link to the Unified Terms of Use")}]
              </a>
            </GridContainer>
            <GridContainer
              style={{
                paddingLeft: 50,
                paddingRight: 50,
                paddingTop: 10,
                paddingBottom: 10,
                alignSelf: "flex-end",
              }}
            >
              <br />
              {price > 0 ? (
                <span style={{ fontSize: "20px" }}>
                  <small>{t("Price")} :</small> {price.toLocaleString()}{" "}
                  <small>{t("Credit")}</small>
                </span>
              ) : (
                <span style={{ fontSize: "16px", color: "red" }}>
                  {t("An error has occurred during pricing. Please contact us")}
                </span>
              )}
            </GridContainer>
            <GridContainer
              style={{
                paddingLeft: 50,
                paddingRight: 50,
                paddingTop: 10,
                paddingBottom: 10,
              }}
            >
              <GridItem xs={6}>
                <Button
                  id="close_purchasemodal_btn"
                  shape="whiteOutlined"
                  style={{ width: "80%" }}
                  onClick={() => {
                    setSelectedModelId(null);
                    setIsDownloadModalOpen(false);
                  }}
                >
                  {t("Return")}
                </Button>
              </GridItem>
              <GridItem xs={6}>
                {price > 0 ? (
                  <Button
                    id="purchase_model_btn"
                    shape="greenOutlined"
                    style={{ width: "80%" }}
                    disabled={!isCheckedTerm}
                    onClick={() => buyDownloadLicense()}
                  >
                    {t("Buy")}
                  </Button>
                ) : (
                  !IS_ENTERPRISE && (
                    <Button
                      id="contact_cs_btn"
                      shape="greenContained"
                      style={{ width: "80%" }}
                      onClick={openChat}
                    >
                      {t("Contact us")}
                    </Button>
                  )
                )}
              </GridItem>
            </GridContainer>
          </div>
        </Modal>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={openWebhooksModal}
          onClose={closeWebhooksModal}
          className={classes.modalContainer}
        >
          <div className={classes.modalContent}>
            <GridContainer xs={12}>
              <GridItem xs={11} style={{ padding: "0px" }}>
                <div className={classes.modalTitleText}>{t("Webhooks")}</div>
              </GridItem>
              <GridItem xs={1} style={{ padding: "0px" }}>
                <CloseIcon
                  id="closeWebhooksModal"
                  className={classes.modalCloseIcon}
                  onClick={closeWebhooksModal}
                />
              </GridItem>
            </GridContainer>
            <GridContainer style={{ marginTop: "20px" }}>
              <GridItem xs={3}>
                <div>METHOD</div>
              </GridItem>
              <GridItem xs={4}>
                <FormControl style={{ width: "100%" }}>
                  <Select
                    labelid="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    value={webhooksMethod}
                    onChange={onWebhooksMethodChange}
                  >
                    <MenuItem value="post">POST</MenuItem>
                    <MenuItem value="get">GET</MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
            </GridContainer>
            <GridContainer style={{ marginTop: "15px" }}>
              <GridItem xs={3}>URL</GridItem>
              <GridItem xs={9}>
                <TextField
                  id="url"
                  placeholder={t("Please enter the URL.")}
                  value={webhooksUrl}
                  style={{ width: "100%" }}
                  onChange={onChangeWebhooksUrl}
                />
              </GridItem>
            </GridContainer>
            <GridContainer style={{ marginTop: "30px" }}>
              <GridItem xs={6}>
                <Button
                  id="close_webhookmodal_btn"
                  shape="whiteOutlined"
                  style={{ width: "100%" }}
                  onClick={closeWebhooksModal}
                >
                  {t("Cancel")}
                </Button>
              </GridItem>
              <GridItem xs={6}>
                <Button
                  id="send_webhook_btn"
                  shape="greenOutlined"
                  style={{ width: "100%" }}
                  onClick={onSendWebhooks}
                >
                  {t("Confirm")}
                </Button>
              </GridItem>
            </GridContainer>
          </div>
        </Modal>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isTooltipModalOpen}
          onClose={closeTooltipModalOpen}
          className={classes.modalContainer}
        >
          <ModalTooltip
            tooltipCategory={tooltipCategory}
            closeTooltipModalOpen={closeTooltipModalOpen}
          />
        </Modal>
        <SalesModal
          isSalesModalOpen={isSalesModalOpen}
          setIsSalesModalOpen={setIsSalesModalOpen}
          api_type="AI"
          model_id={projects.project?.id}
        />
      </div>
    );
  }
);

export default ModelTable;

ModelTable.propTypes = {
  category: PropTypes.string,
  models: PropTypes.array,
  trainingColumnInfo: PropTypes.object,
  projectStatus: PropTypes.number,
  // isStatusChanged: PropTypes.boolean,
};
