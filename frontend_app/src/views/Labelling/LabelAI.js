import React, { useEffect, useState, useRef } from "react";
import * as api from "controller/api.js";
import Cookies from "helpers/Cookies";
import currentTheme from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import {
  postFavoriteModelRequestAction,
  getProjectRequestAction,
} from "redux/reducers/projects.js";
import { getModelRequestAction } from "redux/reducers/models.js";
import {
  askModalRequestAction,
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import { useTranslation } from "react-i18next";
import { currentThemeColor } from "assets/jss/custom";
import { ReactTitle } from "react-meta-tags";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import Tooltip from "@material-ui/core/Tooltip";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import IconButton from "@material-ui/core/IconButton";
import StarIcon from "@material-ui/icons/Star";
import Modal from "@material-ui/core/Modal";
import GridItem from "components/Grid/GridItem.js";
import ModalPage from "components/PredictModal/ModalPage.js";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "components/CustomButtons/Button";

let sortObj = {
  asyncIndex: "down",
  name: "down",
  status: "down",
  accuracy: "down",
  dice: "down",
  errorRate: "up",
};

const LabelAI = ({ history, isFromAutoLabelBtn }) => {
  const [isLoading, setIsLoading] = useState(true);
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, labelprojects, projects, messages } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      projects: state.projects,
      messages: state.messages,
    }),
    []
  );
  const { t } = useTranslation();
  const [sortedModels, setSortedModels] = useState([]);
  const [sortValue, setSortValue] = useState("asyncIndex");
  const [isSortObjChanged, setIsSortObjChanged] = useState(false);
  const [modelPage, setModelPage] = useState(0);
  const [rowsPerModelPage, setRowsPerModelPage] = useState(10);
  const [isModalOpen, setIsOpenModal] = useState(false);
  const [labelClasses, setLabelClasses] = useState([]);
  const [labelClassDict, setLabelClassDict] = useState({});
  const [isAutoLabelingModalOpen, setIsAutoLabelingModalOpen] = useState(false);
  const [isAutoLabelingLoading, setIsAutoLabelingLoading] = useState(false);
  const [chosenItem, setChosenItem] = useState(null);
  const [chosenProjectIndex, setChosenProjectIndex] = useState(0);
  const [csvDict, setCsvDict] = useState({});
  const [trainingColumnInfoDict, setTrainingColumnInfo] = useState({});
  const [projectIdDict, setProjectIdDict] = useState({});
  const [hasAnalyticsDict, setHasAnalyticsDict] = useState({});
  const [chosenModel, setChosenModel] = useState(0);
  const [isAutoLabelDetailOpen, setIsAutoLabelDetailOpen] = useState(false);
  const sortValueRef = useRef(sortValue);
  sortValueRef.current = sortValue;

  useEffect(() => {
    if (labelprojects.projectDetail && labelprojects.projectDetail.asynctasks) {
      (async () => {
        await setIsLoading(true);
        await getLabelprojectModels();
        await getLabelClasses();
        await setIsLoading(false);
      })();
    }
  }, []);

  useEffect(() => {
    if (isFromAutoLabelBtn) setIsAutoLabelDetailOpen(true);
  }, [isFromAutoLabelBtn]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsOpenModal(false);
      setIsAutoLabelingModalOpen(false);
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (isSortObjChanged) setIsSortObjChanged(false);
  }, [isSortObjChanged]);

  const getLabelClasses = () => {
    const labelClasses = labelprojects.projectDetail.labelclasses;
    const tempClasses = [];
    const labelClassDictRaw = {};
    for (let idx = 0; idx < labelClasses.length; idx++) {
      const name = labelClasses[idx].name;
      labelClassDictRaw[labelClasses[idx].id] =
        labelClasses[idx].completedLabelCount;
      if (tempClasses.indexOf(name) === -1) tempClasses.push(labelClasses[idx]);
    }
    setLabelClassDict(labelClassDictRaw);
    setLabelClasses(tempClasses);
  };

  const getLabelprojectModels = async () => {
    let modelsArr = [];
    await labelprojects.projectDetail.asynctasks.forEach(async (async, idx) => {
      await api.getProject(async.project).then(async (res) => {
        let datacolumnsRaw = [];
        res.data.dataconnectorsList &&
          res.data.dataconnectorsList.map((dataconnector) => {
            dataconnector.datacolumns &&
              dataconnector.datacolumns.map((datacolumn) => {
                datacolumn.dataconnectorName = dataconnector.dataconnectorName;
                datacolumnsRaw.push(datacolumn);
              });
          });

        if (
          !(datacolumnsRaw && datacolumnsRaw.length > 0) &&
          res.data.fileStructure
        ) {
          datacolumnsRaw = JSON.parse(res.data.fileStructure);
        }
        await setCsvDict((prevState) => ({
          ...prevState,
          [idx]: datacolumnsRaw,
        }));

        await setProjectIdDict((prevState) => ({
          ...prevState,
          [idx]: res.data.id,
        }));

        let hasAnalyticsGraphs = false;
        if (res.data.analyticsgraphs && res.data.analyticsgraphs.length > 0)
          hasAnalyticsGraphs = true;
        await setHasAnalyticsDict((prevState) => ({
          ...prevState,
          [idx]: hasAnalyticsGraphs,
        }));

        if (res.data.trainingColumnInfo) {
          var trainingColumnInfoRaw = {};
          Object.keys(res.data.trainingColumnInfo).map((columnInfo) => {
            if (res.data.trainingColumnInfo[columnInfo]) {
              trainingColumnInfoRaw[columnInfo] = true;
            }
          });
          await setTrainingColumnInfo((prevState) => ({
            ...prevState,
            [idx]: trainingColumnInfoRaw,
          }));
        } else if (res.data.fileStructure) {
          var trainingColumnInfoRaw = {};
          JSON.parse(res.data.fileStructure).map((columnInfo) => {
            if (columnInfo.use) {
              trainingColumnInfoRaw[columnInfo.columnName] = JSON.parse(
                columnInfo.use
              );
            }
          });
          await setTrainingColumnInfo((prevState) => ({
            ...prevState,
            [idx]: trainingColumnInfoRaw,
          }));
        } else {
          await setTrainingColumnInfo((prevState) => ({
            ...prevState,
            [idx]: {},
          }));
        }

        await res.data.models.forEach((model) => {
          let tempModel = model;
          tempModel.asyncIndex = idx;
          modelsArr.push(tempModel);
        });
      });
    });
    setSortedModels(modelsArr);
  };

  const onClickForFavorite = (isTrue, id) => {
    dispatch(postFavoriteModelRequestAction({ id: id, isFavorite: isTrue }));
  };

  const onOpenAutoLabellingForObjectDetect = (id, index) => {
    if (!has100LabelingPerLabelClasses()) {
      dispatch(
        openErrorSnackbarRequestAction(
          t(
            "오토 라벨링을 시작하기 위해서는 학습 데이터로 쓰일 라벨 클래스당 100개의 라벨이 필요합니다."
          )
        )
      );
      return;
    }
    // if(isAutoLabelingRunning){
    //     dispatch(openErrorSnackbarRequestAction(t('Auto-labeling is currently in progress. We’ll e-mail you when auto-labeling is completed')));
    //     return;
    // }
    setChosenModel(id);
    setChosenProjectIndex(index);
    setIsAutoLabelingModalOpen(true);
  };

  const has100LabelingPerLabelClasses = () => {
    var hasLessThan100LabelInLabelClass = false;
    labelClassDict &&
      Object.values(labelClassDict).map((value) => {
        if (value < 100) {
          hasLessThan100LabelInLabelClass = true;
        }
      });
    return !hasLessThan100LabelInLabelClass;
  };

  const openModal = async (id, item, index) => {
    // if (
    //   user.me &&
    //   parseInt(user.me.cumulativePredictCount) >=
    //     parseInt(
    //       +user.me.remainPredictCount + +user.me.usageplan.noOfPrediction
    //     )
    // ) {
    //   dispatch(
    //     openErrorSnackbarRequestAction(
    //       t(
    //         "예측횟수를 초과하여 새로운 프로젝트를 추가할 수 없습니다. 계속 진행하시려면 이용플랜을 변경해주세요."
    //       )
    //     )
    //   );
    //   return;
    // }
    await dispatch(getProjectRequestAction(projectIdDict[index]));
    await dispatch(getModelRequestAction(id));
    await setIsOpenModal(true);
    await setChosenItem(item);
    await setChosenModel(id);
    await setChosenProjectIndex(index);
  };
  // 모델 테이블 페이징
  const changeModelPage = (event, newPage) => {
    setModelPage(newPage);
  };
  const changeRowsPerModelPage = (event) => {
    setRowsPerModelPage(+event.target.value);
    setModelPage(0);
  };

  const onSetSortValue = async (value) => {
    await setIsLoading(true);
    await onSortObjChange(value);
    await setIsSortObjChanged(true);
    await setIsLoading(false);
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

  const openDetailPage = (page, id, index) => {
    history.push({
      pathname: `/admin/train/${projectIdDict[index]}?model=${id}&page=${page}`,
      state: { modelid: id, page: page },
    });
    return;
  };

  const closeModal = () => {
    dispatch(askModalRequestAction());
  };

  const startAutoLabelling = async () => {
    await setIsAutoLabelingLoading(true);
    await api
      .postAutoLabeling(
        labelprojects.projectDetail.id,
        projectIdDict[chosenProjectIndex],
        chosenModel
      )
      .then((res) => {
        dispatch(
          openSuccessSnackbarRequestAction(
            t("Auto-labeling will start now. We’ll e-mail you when auto-labeling is complete")
          )
        );
      })
      .then(() => {
        window.location.reload();
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
        if (e.response && e.response.data[1].message) {
          dispatch(
            openErrorSnackbarRequestAction(t(e.response.data[1].message))
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "학습을 시작하는 과정에서 오류가 발생했습니다. 잠시후 다시 시도해주세요."
              )
            )
          );
        }
      })
      .finally(() => {
        setIsAutoLabelingModalOpen(false);
        setIsAutoLabelingLoading(false);
      });
  };

  const showModelTable = () => {
    return (
      <>
        <Table
          className={classes.table}
          style={{ marginTop: "60px", width: "98%" }}
          stickyheader="true"
          aria-label="sticky table"
        >
          <TableHead>
            <TableRow>
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
                style={{ width: "10%", cursor: "pointer" }}
                onClick={() => onSetSortValue("asyncIndex")}
              >
                <div className={classes.tableHeader}>
                  {sortValue === "asyncIndex" &&
                    (sortObj[sortValue] === "down" ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                  <b>{t("Auto-labeling")}</b>
                </div>
              </TableCell>
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "20%", cursor: "pointer" }}
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
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "10%", cursor: "pointer" }}
                onClick={() => onSetSortValue("accuracy")}
              >
                <Tooltip
                  title={
                    <text style={{ fontSize: "11px" }}>
                      {t(
                        "모델의 정확도를 나타냅니다. ACCURACY 값이 높을수록 정확하게 예측합니다."
                      )}
                    </text>
                  }
                  placement="top-end"
                >
                  <div className={classes.tableHeader}>
                    {sortValue === "accuracy" &&
                      (sortObj[sortValue] === "down" ? (
                        <ArrowUpwardIcon fontSize="small" />
                      ) : (
                        <ArrowDownwardIcon fontSize="small" />
                      ))}
                    <b>{t("Accuracy")}</b>
                    <HelpOutlineIcon
                      id="helpIcon"
                      style={{
                        marginLeft: "5px",
                        marginBottom: "10px",
                        width: "15px",
                      }}
                      fontSize="small"
                    />
                  </div>
                </Tooltip>
              </TableCell>
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "10%", cursor: "pointer" }}
                onClick={() => onSetSortValue("errorRate")}
              >
                <Tooltip
                  title={
                    <text style={{ fontSize: "11px" }}>
                      {t(
                        "샘플링을 할 때 생긴 오류의 비율을 나타냅니다. 값이 낮을수록 예측 오류가 나올 확률이 낮아집니다."
                      )}
                    </text>
                  }
                  placement="top-end"
                >
                  <div className={classes.tableHeader}>
                    {sortValue === "errorRate" &&
                      (sortObj[sortValue] === "down" ? (
                        <ArrowUpwardIcon fontSize="small" />
                      ) : (
                        <ArrowDownwardIcon fontSize="small" />
                      ))}
                    <b>Error Rate</b>
                    <HelpOutlineIcon
                      id="helpIcon"
                      style={{
                        marginLeft: "5px",
                        marginBottom: "10px",
                        width: "15px",
                      }}
                      fontSize="small"
                    />
                  </div>
                </Tooltip>
              </TableCell>
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "10%", cursor: "pointer" }}
                onClick={() => onSetSortValue("dice")}
              >
                <Tooltip
                  title={
                    <text style={{ fontSize: "11px" }}>
                      {t(
                        "실제 값과 예측 값의 유사성을 측정하기 위해 사용되는 샘플 계수입니다. DICE 값이 높을수록 유사성이 높습니다."
                      )}
                    </text>
                  }
                  placement="top-end"
                >
                  <div className={classes.tableHeader}>
                    {sortValue === "dice" &&
                      (sortObj[sortValue] === "down" ? (
                        <ArrowUpwardIcon fontSize="small" />
                      ) : (
                        <ArrowDownwardIcon fontSize="small" />
                      ))}
                    <b>Dice</b>
                    <HelpOutlineIcon
                      id="helpIcon"
                      style={{
                        marginLeft: "5px",
                        marginBottom: "10px",
                        width: "15px",
                      }}
                      fontSize="small"
                    />
                  </div>
                </Tooltip>
              </TableCell>
              <TableCell className={classes.tableHead}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!sortedModels || sortedModels.length === 0) && (
              <TableRow className={classes.tableRow}>
                <TableCell
                  className={classes.tableRowCell}
                  id="modelTable"
                  align="center"
                  colSpan={9}
                >
                  {t("There is no autolabeling AI model.")}
                </TableCell>
              </TableRow>
            )}
            {sortedModels
              .slice(
                modelPage * rowsPerModelPage,
                modelPage * rowsPerModelPage + rowsPerModelPage
              )
              .map((model, idx) => {
                const id = model.id;
                let hasModelAnalytics = false;
                if (model.analyticsgrphs || model.prescriptionAnalyticsInfo) {
                  hasModelAnalytics = true;
                }
                return (
                  <TableRow
                    className={classes.tableRow}
                    key={model.name + idx}
                    style={{
                      background:
                        idx % 2 === 0
                          ? currentTheme.tableRow1
                          : currentTheme.tableRow2,
                    }}
                  >
                    <TableCell
                      className={classes.tableRowCell}
                      id="modelTable"
                      align="center"
                    >
                      {modelPage * rowsPerModelPage + idx + 1}
                    </TableCell>
                    <TableCell
                      className={classes.tableRowCell}
                      id="modelTable"
                      align="center"
                    >
                      {model.asyncIndex + 1}th AutoLabeling
                    </TableCell>
                    <TableCell
                      className={classes.tableRowCell}
                      id="modelTable"
                      align="center"
                    >
                      {model.name}
                    </TableCell>
                    <TableCell
                      className={classes.tableRowCell}
                      id="modelTable"
                      align="center"
                    >
                      {model.status === 0 && t("preparing")}
                      {model.status === 9 && t("Pending")}
                      {model.status === 100 && t("Completed")}
                      {model.status === 99 && t("Error")}
                      {model.status === 1 &&
                        t("In Progress") + `(${model.progress}%)`}
                    </TableCell>
                    <TableCell
                      className={classes.tableRowCell}
                      id="modelTable"
                      align="center"
                    >
                      {model.accuracy
                        ? `${(model.accuracy * 100).toFixed(4)}%`
                        : ""}
                    </TableCell>
                    <TableCell
                      className={classes.tableRowCell}
                      id="modelTable"
                      align="center"
                    >
                      {model.errorRate ? model.errorRate : ""}
                    </TableCell>
                    <TableCell
                      className={classes.tableRowCell}
                      id="modelTable"
                      align="center"
                    >
                      {model.dice ? model.dice : ""}
                    </TableCell>
                    <TableCell
                      className={classes.tableRowCell}
                      id="modelTable"
                      align="center"
                    >
                      {model.status === 100 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            onClick={() =>
                              openModal(id, "apiImage", model.asyncIndex)
                            }
                            className={`${classes.modelTab} imageBtn ${classes.modelTabButton}`}
                          >
                            {t("Image prediction")}
                          </div>
                          <div
                            onClick={() =>
                              openModal(id, "apiVideo", model.asyncIndex)
                            }
                            className={`${classes.modelTab} videoBtn ${classes.modelTabButton}`}
                          >
                            {t("Video prediction")}
                          </div>
                          {(hasAnalyticsDict[model.asyncIndex] ||
                            hasModelAnalytics) && (
                            <div
                              onClick={() =>
                                openDetailPage(
                                  "analytics",
                                  id,
                                  model.asyncIndex
                                )
                              }
                              className={`${classes.modelTab} analyticsBtn ${classes.modelTabHighlightButton}`}
                            >
                              {t("Analyze")}
                            </div>
                          )}
                          <>
                            <div
                              onClick={() =>
                                onOpenAutoLabellingForObjectDetect(
                                  id,
                                  model.asyncIndex
                                )
                              }
                              className={
                                has100LabelingPerLabelClasses
                                  ? `${classes.modelTab} autoLabellingForObjectDetectBtn ${classes.modelTabHighlightButton}`
                                  : `${classes.modelTab} autoLabellingForObjectDetectBtn ${classes.defaultDisabledButton}`
                              }
                            >
                              {t("Auto-labeling")}
                            </div>
                          </>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={sortedModels.length}
          rowsPerPage={rowsPerModelPage}
          page={modelPage}
          backIconButtonProps={{
            "aria-label": "previous page",
          }}
          nextIconButtonProps={{
            "aria-label": "next page",
          }}
          onChangePage={changeModelPage}
          onChangeRowsPerPage={changeRowsPerModelPage}
        />
      </>
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
        <div style={{ marginTop: "20px" }}>
          <div>{showModelTable()}</div>
          <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={isAutoLabelingModalOpen}
            onClose={closeModal}
            className={classes.modalContainer}
          >
            <div className={classes.autoLabelingContent}>
              {isAutoLabelingLoading ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "220px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </div>
              ) : (
                <>
                  <div style={{ textAlign: "center", fontSize: "20px" }}>
                    <b> [ {t("Start auto-labeling")} ] </b>
                  </div>
                  <div>
                    <br />
                    {t(
                      "오토라벨링은 준비, 1차, 2차, 3차로 순으로 진행되며, 단계가 올라갈 수록 정확도가 높아집니다."
                    )}
                    <br />
                    {t(
                      "오토라벨링 준비단계는 오토라벨링 진행시 정확한 라벨링을 위하여 준비하는 단계로 생각할 수 있습니다."
                    )}
                    <br />
                    {t(
                      "2차 오토라벨링은 평균 정확도 80%이상, 3차 오토라벨링은 평균 정확도 90% 이상을 기대할 수 있습니다."
                    )}
                    <br />
                    <br />
                    {t("** step by step")}
                    <br />
                    {t("Ready=Test the feasibility of 100 labeling data")}
                    <br />
                    {t(
                      "1차= 100개 라벨링 데이터로 인공지능 개발 및 900개 라벨링 데이터 결과 확인 및 검수"
                    )}
                    <br />
                    {t(
                      "2차= 1,000개 라벨링 데이터로 인공지능 개발 및 9,000개 라벨링 데이터 결과 확인 및 검수"
                    )}
                    <br />
                    {t(
                      "2차= 1,000개 라벨링 데이터로 인공지능 개발 및 9,000개 라벨링 데이터 결과 확인 및 검수"
                    )}
                    <br />
                    <br />
                    {t(
                      "오토라벨링 결과를 검수하면 그의 10배 라벨링을 다시 오토라벨링을 통해 하실 수 있습니다. 진행하시겠습니까?"
                    )}
                  </div>
                  <div className={classes.buttonContainer}>
                    <GridItem xs={6}>
                      <Button
                        id="closeCancelModalBtn"
                        className={classes.defaultOutlineButton}
                        onClick={closeModal}
                      >
                        {t("Return")}
                      </Button>
                    </GridItem>
                    <GridItem xs={6}>
                      <Button
                        id="payBtn"
                        className={classes.defaultHighlightButton}
                        onClick={startAutoLabelling}
                      >
                        {t("Start auto-labeling")}
                      </Button>
                    </GridItem>
                  </div>
                </>
              )}
            </div>
          </Modal>
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
              csv={csvDict[chosenProjectIndex]}
              trainingColumnInfo={trainingColumnInfoDict[chosenProjectIndex]}
              history={history}
            />
          </Modal>
          <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={isAutoLabelDetailOpen}
            onClose={() => setIsAutoLabelDetailOpen(false)}
            className={classes.modalContainer}
          >
            <div className={classes.autoLabelingContent}>
              <div style={{ textAlign: "center", fontSize: "20px" }}>
                <b> [ {t("Auto-labeling")} ] </b>
              </div>
              <div>
                {t("Select one of the models and start autolabeling.")}
                <br />
                {t(
                  "각 모델은 물체를 잡는 방식이나 면적이 조금씩 차이가 있을 수 있으니 확인 후에 선택해주세요."
                )}
              </div>
              <div className={classes.buttonContainer}>
                <Button
                  id="closeCancelModalBtn"
                  className={classes.defaultOutlineButton}
                  style={{ width: "100%" }}
                  onClick={() => {
                    setIsAutoLabelDetailOpen(false);
                  }}
                >
                  {t("Confirm")}
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default React.memo(LabelAI);
