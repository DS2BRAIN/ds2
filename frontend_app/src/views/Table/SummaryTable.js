import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import GridItem from "components/Grid/GridItem.js";
import Checkbox from "@material-ui/core/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@material-ui/core/Modal";
import GridContainer from "components/Grid/GridContainer.js";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import currentTheme from "assets/jss/custom.js";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import Tooltip from "@material-ui/core/Tooltip";
import InfoIcon from "@material-ui/icons/Info";
import Switch from "@material-ui/core/Switch";
import { useDispatch, useSelector } from "react-redux";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages";
import { useTranslation } from "react-i18next";
import { currentThemeColor } from "assets/jss/custom.js";
import Button from "components/CustomButtons/Button";

let columns = [];

const SummaryTable = React.memo(({ category, csv, getTimeSeriesCheckedValue, getCheckedValue, getProcessingInfo, getProcessingInfoValue, trainingColumnInfo, timeSeriesColumnInfo, preprocessingInfoParent, preprocessingInfoValueParent, handleIsTimeSeries }) => {
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
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [summaryCheckedValue, setSummaryCheckedValue] = useState(null);
  const [preprocessingCheckedValue, setPreprocessingCheckedValue] = useState({});
  const [isAllpreprocessingChecked, setIsAllpreprocessingChecked] = useState(false);
  const [timeSeriesCheckedValue, setTimeSeriesCheckedValue] = useState({});
  const [isTimeSeriesCheckedValueChanged, setIsTimeSeriesCheckedValueChanged] = useState(false);
  const [timeSeriesCheckedDict, setTimeSeriesCheckedDict] = useState(false);
  const [isPreprocessingInfoChanged, setIsPreprocessingInfoChanged] = useState(false);
  const [isPreprocessingInfoValueChanged, setIsPreprocessingInfoValueChanged] = useState(false);
  const [preprocessingInfo, setPreprocessingInfo] = useState({});
  const [tempPreprocessingInfo, setTempPreprocessingInfo] = useState({});
  const [preprocessingInfoValue, setPreprocessingInfoValue] = useState({});
  const [tempPreprocessingInfoValue, setTempPreprocessingInfoValue] = useState({});
  const [isPreprocessingModalOpen, setIsPreprocessingModalOpen] = useState(false);
  const [selectedRowForPreprocessing, setSelectedRowForPreprocessing] = useState([]);
  const [preprocessingDoneValue, setPreprocessingDoneValue] = useState({});
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      if (csv) {
        await setIsLoading(true);
        await makeTable();
        await makeCheckValue();
        await checkDateTime();
        await setIsLoading(false);
      }
    })();
  }, [csv]);

  const checkDateTime = () => {
    let dateTimeTypeCnt = 0;
    csv.map((dataColumn) => {
      if (dataColumn.type === "datetime") {
        dateTimeTypeCnt++;
      }
    });
    if (handleIsTimeSeries !== false) {
      if (dateTimeTypeCnt > 0) {
        handleIsTimeSeries(true);
      } else {
        handleIsTimeSeries(false);
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (projects.project.valueForPredictColumnId) {
        setIsLoading(true);
        makeCheckValue();
        setIsLoading(false);
      }
    })();
  }, [projects.project && projects.project.valueForPredictColumnId]);

  useEffect(() => {
    (async () => {
      if (projects.isProjectStarted) {
        setIsLoading(true);
        setSummaryCheckedValue(projects.project.trainingColumnInfo);
        setIsLoading(false);
      }
    })();
  }, [projects.isProjectStarted]);

  useEffect(() => {
    setIsTimeSeriesCheckedValueChanged(false);
    getTimeSeriesCheckedValue(timeSeriesCheckedValue);
  }, [isTimeSeriesCheckedValueChanged]);

  useEffect(() => {
    if (isPreprocessingInfoChanged) {
      setIsPreprocessingInfoChanged(false);
      getProcessingInfo(preprocessingInfo);
    }
  }, [isPreprocessingInfoChanged]);

  useEffect(() => {
    if (isPreprocessingInfoValueChanged) {
      setIsPreprocessingInfoValueChanged(false);
      getProcessingInfoValue(preprocessingInfoValue);
    }
  }, [isPreprocessingInfoValueChanged]);

  useEffect(() => {
    if (summaryCheckedValue) getCheckedValue(summaryCheckedValue);
  }, [summaryCheckedValue]);

  const makeCheckValue = () => {
    var preprocessingInfoRaw = {};
    var preprocessingInfoValueRaw = {};
    var timeSeriesCheckedDictRaw = {};

    if (projects.isProjectStarted) return;

    if (timeSeriesColumnInfo) {
      setTimeSeriesCheckedValue(timeSeriesColumnInfo);
    }

    if (trainingColumnInfo && Object.keys(trainingColumnInfo).length > 0) {
      setSummaryCheckedValue(trainingColumnInfo);
    } else {
      setSummaryCheckedValue({});
      if (csv) {
        for (let i = 0; i < csv.length; i++) {
          const value = csv[i].id;
          if (csv[i].type && csv[i].type.indexOf("datetime") > -1) {
            if (!timeSeriesCheckedDictRaw[csv[i].dataconnector]) {
              timeSeriesCheckedDictRaw[csv[i].dataconnector] = value;
              setTimeSeriesCheckedValue((prevState) => {
                return { ...prevState, [value]: true };
              });
            } else {
              setTimeSeriesCheckedValue((prevState) => {
                return { ...prevState, [value]: false };
              });
            }
          }
          if (value === projects.project.valueForPredictColumnId) {
            setSummaryCheckedValue((prevState) => {
              return { ...prevState, [value]: false };
            });
          } else {
            // if (trainingColumnInfo[value]){
            setSummaryCheckedValue((prevState) => {
              return { ...prevState, [value]: true };
            });
            // }
          }
        }
      }
    }
    if (preprocessingInfoParent && Object.keys(preprocessingInfoParent).length === 0) {
      for (let i = 0; i < csv.length; i++) {
        const value = csv[i].id;
        preprocessingInfoRaw[+value] = {};
        preprocessingInfoValueRaw[+value] = {};
      }
    }

    setIsTimeSeriesCheckedValueChanged(true);
    setTimeSeriesCheckedDict(timeSeriesCheckedDictRaw);
    setIsLoading(false);

    let tempPreprocessingCheckedValue = {};
    if (preprocessingInfoParent && Object.keys(preprocessingInfoParent).length !== 0) {
      setPreprocessingInfo(preprocessingInfoParent);
      setTempPreprocessingInfo(preprocessingInfoParent);
      setPreprocessingInfoValue(preprocessingInfoValueParent);
      setTempPreprocessingInfoValue(preprocessingInfoValueParent);
      for (let value in preprocessingInfoParent) {
        if (Object.keys(preprocessingInfoParent[value]).length > 0) {
          tempPreprocessingCheckedValue[value] = true;
        } else {
          tempPreprocessingCheckedValue[value] = false;
        }
      }
    } else {
      setPreprocessingInfo(preprocessingInfoRaw);
      setTempPreprocessingInfo(preprocessingInfoRaw);
      setPreprocessingInfoValue(preprocessingInfoValueRaw);
      setTempPreprocessingInfoValue(preprocessingInfoValueRaw);
      for (let value in preprocessingInfoRaw) {
        if (Object.keys(preprocessingInfoRaw[value]).length > 0) {
          tempPreprocessingCheckedValue[value] = true;
        } else {
          tempPreprocessingCheckedValue[value] = false;
        }
      }
    }
    setPreprocessingCheckedValue(tempPreprocessingCheckedValue);
    setPreprocessingDoneValue(tempPreprocessingCheckedValue);
  };

  const onSetSummaryCheckedValue = async (value) => {
    if (projects.project.isShared) {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to shared projects")));
      return;
    }
    if (category === "sample") {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to 'Training data usage' when using sample data.")));
      return;
    }
    if (projects.project.status === 100) {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to a completed project")));
      return;
    }
    if (projects.project.status !== 0) {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to an ongoing project")));
      return;
    }
    if (projects.project.statusText === "중단") {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to suspended projects")));
      return;
    }
    if (value === projects.project.valueForPredictColumnId) {
      dispatch(openErrorSnackbarRequestAction(t("Values ​​you want to analyze/predict cannot be used as training data.")));
      return;
    }
    await setSummaryCheckedValue((prevState) => {
      return { ...prevState, [value]: !summaryCheckedValue[value] };
    });
  };

  const onSetPreprocessingCheckAll = async (value) => {
    if (projects.project.isShared) {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to shared projects")));
      return;
    }
    if (category === "sample") {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to sample projects")));
      return;
    }
    if (projects.project.status === 100) {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to completed projects")));
      return;
    }
    if (projects.project.status !== 0) {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to ongoing projects")));
      return;
    }
    if (projects.project.statusText === "중단") {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to suspended projects")));
      return;
    }
    var preprocessingCheckedValueAll = {};
    rows.map((row, idx) => {
      preprocessingCheckedValueAll[row[row.length - 1]] = !isAllpreprocessingChecked;
    });
    setPreprocessingCheckedValue(preprocessingCheckedValueAll);
    setIsAllpreprocessingChecked(!isAllpreprocessingChecked);
  };

  const onSetPreprocessingCheckedValue = async (value) => {
    if (projects.project.isShared) {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to shared projects")));
      return;
    }
    if (category === "sample") {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to sample projects")));
      return;
    }
    if (projects.project.status === 100) {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to completed projects")));
      return;
    }
    if (projects.project.status !== 0) {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to ongoing projects")));
      return;
    }
    if (projects.project.statusText === "중단") {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to suspended projects")));
      return;
    }
    await setPreprocessingCheckedValue((prevState) => {
      return { ...prevState, [value]: !preprocessingCheckedValue[value] };
    });
    await setIsAllpreprocessingChecked(false);
  };

  const onSetTimeSeriesCheckedValue = async (value, dataconnectorId) => {
    if (timeSeriesCheckedValue[value]) {
      return;
    }
    if (timeSeriesCheckedDict[dataconnectorId] === value) {
      dispatch(openErrorSnackbarRequestAction(t("The time series criterion requires one column per data.")));
      return;
    } else {
      await setTimeSeriesCheckValueFunc(value);
      await setIsTimeSeriesCheckedValueChanged(true);
    }
  };

  const setTimeSeriesCheckValueFunc = (value) => {
    if (projects.project.isShared) {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to shared projects")));
      return;
    }
    if (category === "sample") {
      dispatch(openErrorSnackbarRequestAction(t("You can’t make changes to sample projects")));
      return;
    }
    if (projects.project.status === 100) {
      dispatch(openErrorSnackbarRequestAction(t("You can't change time series criteria for completed projects")));
      return;
    }
    if (projects.project.status !== 0) {
      dispatch(openErrorSnackbarRequestAction(t("You can't change time series criteria for ongoing projects")));
      return;
    }
    if (projects.project.statusText === "중단") {
      dispatch(openErrorSnackbarRequestAction(t("You can't change time series criteria for suspended projects")));
      return;
    }
    if (!timeSeriesCheckedValue.hasOwnProperty(value)) {
      dispatch(openErrorSnackbarRequestAction(t("This column cannot be used as a reference for time series forecasting.")));
      return;
    }

    const tempCheckedValue = {};
    for (let key in timeSeriesCheckedValue) {
      if (+key === value) {
        tempCheckedValue[key] = true;
      } else {
        tempCheckedValue[key] = false;
      }
    }
    setTimeSeriesCheckedValue(tempCheckedValue);
  };

  const onSetPreprocessingValue = async (value) => {
    setSelectedRowForPreprocessing(Object.keys(preprocessingCheckedValue).filter((infoValue) => preprocessingCheckedValue[infoValue] === true));
    setIsPreprocessingModalOpen(true);
  };

  const makeTable = () => {
    projects.project.trainingMethod === "image" || projects.project.trainingMethod === "object_detection"
      ? (columns = [{ id: "index", label: t("Index") }, { id: "dataconnectorName", label: t("Data") }, { id: "columnName", label: t("Column name") }, { id: "data_count", label: t("Number of data") }])
      : (columns = [
          { id: "index", label: t("Index") },
          { id: "dataconnectorName", label: t("Data") },
          { id: "columnName", label: t("Column name") },
          { id: "data_count", label: t("Number of data") },
          { id: "miss", label: t("Missing value") },
          { id: "unique", label: t("Unique key") },
          { id: "type", label: t("Type") },
          { id: "min", label: t("Minimum value") },
          { id: "max", label: t("Maximum value") },
          { id: "std", label: t("Standard value") },
          { id: "mean", label: t("Average value") },
          { id: "top", label: t("Top-level") },
          { id: "freq", label: t("Frequency ") },
          { id: "id", label: "ID" },
        ]);
    var rowsRaw = [];
    csv.map((dataColumn) => {
      if (projects.project.trainingMethod === "image" || projects.project.trainingMethod === "object_detection") {
        if (dataColumn.isForGan) return;
      } else if (projects.project.trainingMethod === "cycle_gan") {
        if (!dataColumn.isForGan) return;
      }
      var row = [];
      columns.map((headColumn) => {
        row.push(dataColumn[headColumn.id]);
      });
      rowsRaw.push(row);
    });
    setRows(rowsRaw);
  };

  const PreprocessingModalActionClose = () => {
    setPreprocessingInfo(tempPreprocessingInfo);
    setPreprocessingInfoValue(tempPreprocessingInfoValue);
    setIsPreprocessingInfoValueChanged(false);
    setIsPreprocessingInfoChanged(false);
    setIsPreprocessingModalOpen(false);
    let tempCheckedValue = {};
    for (let value in preprocessingCheckedValue) {
      tempCheckedValue[value] = false;
    }
    setPreprocessingCheckedValue(tempCheckedValue);
    setIsAllpreprocessingChecked(false);
  };
  const PreprocessingSaveClose = () => {
    setTempPreprocessingInfo(preprocessingInfo);
    setTempPreprocessingInfoValue(preprocessingInfoValue);
    setIsPreprocessingModalOpen(false);
    let tempCheckedValue = {};
    let tempDoneValue = preprocessingDoneValue;
    for (let value in preprocessingCheckedValue) {
      if (preprocessingCheckedValue[value]) tempDoneValue[value] = true;
      tempCheckedValue[value] = false;
    }
    setPreprocessingDoneValue(tempDoneValue);
    setPreprocessingCheckedValue(tempCheckedValue);
    setIsAllpreprocessingChecked(false);
  };

  const onClickpreprocessingInfoValueValue = async (rowId, proprocessingOptionId) => {
    var preprocessingCheckedValueTrue = Object.keys(preprocessingCheckedValue).filter((infoValue) => preprocessingCheckedValue[infoValue] === true);
    preprocessingCheckedValueTrue.map(async (targetId) => {
      if (preprocessingCheckedValueTrue.length > 1) {
        await setPreprocessingInfo((prevState) => {
          return {
            ...prevState,
            [+targetId]: {
              [proprocessingOptionId]: true,
            },
          };
        });
      } else {
        await setPreprocessingInfo((prevState) => {
          return {
            ...prevState,
            [+targetId]: {
              ...prevState[+targetId],
              [proprocessingOptionId]: !preprocessingInfo[targetId][proprocessingOptionId],
            },
          };
        });
      }
    });
    await setPreprocessingInfoValueByValues(proprocessingOptionId, null);
    await setIsPreprocessingInfoChanged(true);
  };

  const onClickpreprocessingInfoValueDict = async (e) => {
    const num = e.target.value;
    const type = e.target.id !== undefined ? e.target.id : "";
    // %는 최소 0, 개수는 최소 1
    if (type.indexOf("cleaningClassification") !== -1) {
      if (num < 1) {
        dispatch(openErrorSnackbarRequestAction(t("Data cleansing has a minimum of 1.")));
        return;
      }
    }
    // else if (type.indexOf("deidentifying") !== -1) {
    //   if (num < 0) {
    //     dispatch(
    //       openErrorSnackbarRequestAction(t("De-identifying has a minimum of 1."))
    //     );
    //     return;
    //   }
    // }
    else if (type.indexOf("cleaningRegression") !== -1) {
      if (num < 0) {
        dispatch(openErrorSnackbarRequestAction(t("Data cleansing has a minimum of zero.")));
        return;
      }
    }

    if (e.target) {
      var idSplit = null;
      if (e.target.id) {
        idSplit = e.target.id.split("_");
      } else {
        idSplit = e.target.name.split("_");
      }
      var targetId = +idSplit[0];
      var targetOption = idSplit[1];
      var targetValue = e.target.value;
      setPreprocessingInfoValueByValues(targetOption, targetValue);
    }
  };

  const setPreprocessingInfoValueByValues = (targetOption, targetValue) => {
    if (!targetValue) {
      if (targetOption === "cleaningClassification") {
        targetValue = 5;
      }
      if (targetOption === "cleaningRegression") {
        targetValue = 99.9;
      }
      if (targetOption === "deidentifying") {
        targetValue = 80;
      }
      if (targetOption === "fulfilling") {
        targetValue = 0;
      }
    }
    Object.keys(preprocessingCheckedValue).map((targetId) => {
      if (preprocessingCheckedValue[targetId]) {
        setPreprocessingInfoValue((prevState) => {
          return {
            ...prevState,
            [+targetId]: {
              ...prevState[+targetId],
              [targetOption]: targetValue,
            },
          };
        });
      }
    });
    setIsPreprocessingInfoValueChanged(true);
  };

  const renderRow = (row) => {
    return row.map((column, idx) => {
      return (
        <TableCell className={classes.tableRowCell} key={`${column}_${idx}`} align="center">
          <div
            style={{
              color: currentThemeColor.textWhite87,
              whiteSpace: "nowrap",
            }}
          >
            {column ? (column.format && typeof column === "number" ? column.format(column) : column) : "-"}
          </div>
        </TableCell>
      );
    });
  };

  return isLoading ? (
    <div
      style={{
        width: "100%",
        height: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </div>
  ) : (
    <GridItem xs={12} style={{ marginTop: "20px" }}>
      <GridContainer style={{ display: "flex", alignItems: "center" }}>
        <GridItem xs={4} lg={3} style={{ padding: "0px" }}>
          {projects.project.status === 0 && projects.project.trainingMethod && !(projects.project.trainingMethod.indexOf("image") > -1 || projects.project.trainingMethod.indexOf("object_detection") > -1 || projects.project.trainingMethod.indexOf("cycle_gan") > -1) && (
            <div style={{ display: "flex" }}>
              <Button id="preCleansingAllBtn" shape="greenOutlined" disabled={Object.values(preprocessingCheckedValue).filter((infoValue) => infoValue === true).length === 0} onClick={onSetPreprocessingValue}>
                {t("Preprocessing")}
              </Button>
              <Tooltip title={<span style={{ fontSize: "12px" }}>{t("There are three kinds of preprocessing : data cleansing, normalization and replacement. You can choose as needed")}</span>} placement="right">
                <HelpOutlineIcon style={{ marginLeft: "4px", cursor: "pointer" }} id="helpIcon" />
              </Tooltip>
            </div>
          )}
        </GridItem>
        <GridItem xs={8} lg={9} />
      </GridContainer>
      <div className={classes.tableWrapper}>
        <Table stickyheader="true" className={classes.table} aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns &&
                columns.map((column, idx) =>
                  idx === 0 ? (
                    <React.Fragment key={`column_${idx}`}>
                      {projects.project.trainingMethod && !(projects.project.trainingMethod.indexOf("image") > -1 || projects.project.trainingMethod.indexOf("object_detection") > -1 || projects.project.trainingMethod.indexOf("cycle_gan") > -1) && (
                        <>
                          <TableCell className={classes.tableHead} align="center">
                            <div
                              style={{
                                color: currentThemeColor.textMediumGrey,
                                wordBreak: "keep-all",
                                minWidth: "160px",
                              }}
                            >
                              {t("Training data usage")}
                              <Tooltip title={<span style={{ fontSize: "11px" }}>{t("Select the final value you want to predict.")}</span>} placement="top">
                                <HelpOutlineIcon
                                  fontSize="small"
                                  style={{
                                    marginLeft: "4px",
                                    cursor: "pointer",
                                  }}
                                  id="helpIcon"
                                />
                              </Tooltip>
                            </div>
                          </TableCell>
                          <TableCell className={classes.tableHead} align="center">
                            <div
                              style={{
                                color: currentThemeColor.textMediumGrey,
                                wordBreak: "keep-all",
                                minWidth: "100px",
                                display: "flex",
                                justifyContent: "center",
                              }}
                              id="cleansingContainer"
                            >
                              {projects.project.status < 1 && projects.project.statusText !== "중단" && (
                                <Checkbox name="cleansingAll" id="cleansingAllCheckbox" checked={isAllpreprocessingChecked} disabled={projects.project.status !== 0 || projects.project.statusText === "중단"} onClick={onSetPreprocessingCheckAll} style={{ marginRight: "4px" }} />
                              )}
                              {t("Preprocessing")}
                            </div>
                          </TableCell>
                        </>
                      )}
                      {projects.project.trainingMethod && projects.project.trainingMethod.indexOf("time_series") > -1 && (
                        <TableCell align="center">
                          <div
                            style={{
                              color: currentThemeColor.textMediumGrey,
                              wordBreak: "keep-all",
                              minWidth: "140px",
                            }}
                          >
                            {t("Time series criteria")}
                            <Tooltip title={<span style={{ fontSize: "11px" }}>{t("Time series prediction is an AI model that predicts what value the data will have in the future by training given data that changes over time.")}</span>} placement="top">
                              <HelpOutlineIcon
                                fontSize="small"
                                style={{
                                  marginLeft: "4px",
                                  cursor: "pointer",
                                }}
                                id="helpIcon"
                              />
                            </Tooltip>
                          </div>
                        </TableCell>
                      )}
                      <TableCell style={{ wordBreak: "keep-all" }} key={column.label + column.id + idx} align="center" className={classes.tableHead}>
                        <div style={{ color: currentThemeColor.textMediumGrey }}>{t(column.label)}</div>
                      </TableCell>
                    </React.Fragment>
                  ) : (
                    <TableCell style={{ wordBreak: "keep-all" }} key={column.label + column.id + idx} align="center" className={classes.tableHead}>
                      <div style={{ color: currentThemeColor.textMediumGrey }}>{t(column.label)}</div>
                    </TableCell>
                  )
                )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => {
              var isChecked = summaryCheckedValue[row[row.length - 1]] ? true : false;
              var isPreprocessingChecked = preprocessingCheckedValue[row[row.length - 1]] ? true : false;
              var isTimeSeriesChecked = timeSeriesCheckedValue[row[row.length - 1]] ? true : false;
              var isPreprocessingDone = projects.project.status < 1 && projects.project.statusText !== "중단" ? preprocessingDoneValue[row[row.length - 1]] : isPreprocessingChecked;
              return (
                <TableRow
                  key={`sumtablerow_${idx}`}
                  className={classes.tableRow}
                  hover
                  tabIndex={-1}
                  style={{
                    background: idx % 2 === 0 ? currentTheme.tableRow1 : currentTheme.tableRow2,
                  }}
                >
                  {projects.project.trainingMethod && !(projects.project.trainingMethod.indexOf("image") > -1 || projects.project.trainingMethod.indexOf("object_detection") > -1 || projects.project.trainingMethod.indexOf("cycle_gan") > -1) && (
                    <>
                      <TableCell className={classes.tableRowCell} align="center">
                        <Switch value={typeof row[2] === "number" ? row[2] - 1 : 0} checked={isChecked} color="primary" inputProps={{ "aria-label": "primary checkbox" }} onClick={() => onSetSummaryCheckedValue(row[row.length - 1])} />
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center">
                        <div className={classes.defaultContainer}>
                          {projects.project.status < 1 && projects.project.statusText !== "중단" && (
                            <Checkbox
                              // value={row[2] - 1}
                              className="cleansingBtn"
                              checked={isPreprocessingChecked}
                              onClick={() => onSetPreprocessingCheckedValue(row[row.length - 1])}
                            />
                          )}
                          {isPreprocessingDone ? <div className={classes.highlightSpan}>{t("Completed")}</div> : projects.project.status < 1 ? null : <div>-</div>}
                        </div>
                      </TableCell>
                    </>
                  )}
                  {projects.project.trainingMethod && projects.project.trainingMethod.indexOf("time_series") > -1 && (
                    <TableCell className={classes.tableRowCell} align="center">
                      <Checkbox value={row[2] - 1} checked={isTimeSeriesChecked} onClick={() => onSetTimeSeriesCheckedValue(row[row.length - 1], row[3])} />
                    </TableCell>
                  )}
                  {renderRow(row)}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={isPreprocessingModalOpen} onClose={PreprocessingModalActionClose} className={classes.modalContainer}>
        <div className={classes.preprocessingmodalContent} id="projectModal">
          <div className={classes.gridRoot}>
            <GridContainer style={{ width: "100%" }}>
              <GridItem xs={12} style={{ margin: "0px !important", marginBottom: "30px" }}>
                <h5>{t("Preprocessing")}</h5>
              </GridItem>
            </GridContainer>
            <GridContainer style={{ width: "100%", paddingBottom: "50px" }}>
              {selectedRowForPreprocessing[6] !== "number" && (
                <GridItem xs={12} style={{ display: "inline", width: "100%" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="checkedB"
                        color="primary"
                        disabled={projects.project.status !== 0}
                        checked={preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["cleaningClassification"]}
                        onClick={() => onClickpreprocessingInfoValueValue(selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1], "cleaningClassification")}
                      />
                    }
                    label={
                      preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["cleaningClassification"]
                        ? t("Data cleansing")
                        : `${t("Data cleansing")} : ${t("데이터 개수 n개 미만인 유니크 값을 가지고 있는 행들을 삭제합니다.")}`
                    }
                  />
                  {(preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && !preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["cleaningClassification"]) || Object.keys(preprocessingInfo).length === 0 ? (
                    <></>
                  ) : (
                    <b>
                      <TextField
                        style={{ textAlign: "right", width: "80px" }}
                        id={selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1] + "_" + "cleaningClassification"}
                        onChange={onClickpreprocessingInfoValueDict}
                        value={preprocessingInfoValue && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["cleaningClassification"]}
                        type="number"
                      />{" "}
                      : {t("데이터 수")}{" "}
                      <u>
                        {preprocessingInfoValue && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["cleaningClassification"]}
                        {preprocessingInfoValue && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && !preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["cleaningClassification"] ? "5" : ""}
                      </u>
                      {t("Rows with less than () unique values will be deleted")}
                    </b>
                  )}
                </GridItem>
              )}
              {selectedRowForPreprocessing[6] === "number" && (
                <>
                  <GridItem xs={12} style={{ display: "inline", width: "100%" }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="checkedB"
                          color="primary"
                          disabled={projects.project.status !== 0}
                          checked={preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["cleaningRegression"]}
                          onClick={() => onClickpreprocessingInfoValueValue(selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1], "cleaningRegression")}
                        />
                      }
                      label={
                        preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["cleaningRegression"]
                          ? t("Data cleansing")
                          : t("Data Cleansing : Delete rows that exceed n% of the total standard distribution.")
                      }
                    />
                    {(preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && !preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["cleaningRegression"]) || Object.keys(preprocessingInfo).length === 0 ? (
                      <></>
                    ) : (
                      <b>
                        <TextField
                          style={{ textAlign: "right", width: "80px" }}
                          id={selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1] + "_" + "cleaningRegression"}
                          onChange={onClickpreprocessingInfoValueDict}
                          value={preprocessingInfoValue && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["cleaningRegression"]}
                          type="number"
                        />{" "}
                        % : {t("All")}
                        {t("Of standard distribution,")}{" "}
                        <u>
                          {" "}
                          {preprocessingInfoValue && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["cleaningRegression"]}
                          {preprocessingInfoValue && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && !preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["cleaningRegression"] ? "99.9" : ""}
                        </u>{" "}
                        % {t(" Rows larger than () will be deleted")}
                      </b>
                    )}
                  </GridItem>
                  <GridItem xs={12} style={{ display: "inline", width: "100%" }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="checkedB"
                          color="primary"
                          disabled={projects.project.status !== 0}
                          checked={preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["normalization"]}
                          onClick={() => onClickpreprocessingInfoValueValue(selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1], "normalization")}
                        />
                      }
                      label={`${t("Normalization")} : ${t("Normalizes the entire value.")}`}
                    />
                  </GridItem>
                </>
              )}
              <GridItem xs={12} style={{ display: "inline", width: "100%" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="checkedB"
                      color="primary"
                      disabled={projects.project.status !== 0}
                      checked={preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["deidentifying"]}
                      onClick={() => onClickpreprocessingInfoValueValue(selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1], "deidentifying")}
                    />
                  }
                  label={
                    preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["deidentifying"]
                      ? `${t("Remove outliers")} ${t("reference figure")} -`
                      : `${t("Remove outliers")} : ${t("Delete columns in which unique values account for n% or more of the total number of data.")}`
                  }
                />
                {(preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && !preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["deidentifying"]) || Object.keys(preprocessingInfo).length === 0 ? (
                  <></>
                ) : (
                  <b>
                    <TextField
                      style={{ textAlign: "right", width: "80px" }}
                      id={selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1] + "_" + "deidentifying"}
                      onChange={onClickpreprocessingInfoValueDict}
                      value={preprocessingInfoValue && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["deidentifying"]}
                      type="number"
                    />{" "}
                    % : {t("Deletes columns where unique values ")}{" "}
                    <u>
                      {" "}
                      {preprocessingInfoValue && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["deidentifying"]}
                      {preprocessingInfoValue && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && !preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["deidentifying"] ? "80" : ""}
                    </u>{" "}
                    % {t("account for more than the total number of data.")}
                  </b>
                )}
              </GridItem>
              <GridItem xs={12} style={{ display: "inline", width: "100%" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="checkedB"
                      color="primary"
                      disabled={projects.project.status !== 0}
                      checked={preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["fulfilling"]}
                      onClick={() => onClickpreprocessingInfoValueValue(selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1], "fulfilling")}
                    />
                  }
                  label={
                    preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["fulfilling"] ? t("Data replacement") : `${t("Data replacement")} : ${t("Fill empty values with n.")}`
                  }
                />
                {(preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && !preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["fulfilling"]) || Object.keys(preprocessingInfo).length === 0 ? (
                  <></>
                ) : (
                  <b>
                    <FormControl className={classes.formControl} style={{ textAlign: "right", width: "80px" }}>
                      {/*<InputLabel id="demo-simple-select-label">Age</InputLabel>*/}
                      <Select
                        labelId="demo-simple-select-label"
                        name={selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1] + "_" + "fulfilling"}
                        onChange={onClickpreprocessingInfoValueDict}
                        defaultValue={"0"}
                        value={preprocessingInfoValue && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["fulfilling"]}
                      >
                        <MenuItem name={selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1] + "_" + "fulfilling"} value={"0"}>
                          0
                        </MenuItem>
                        <MenuItem name={selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1] + "_" + "fulfilling"} value={t("Average value")}>
                          {t("Average value")}
                        </MenuItem>
                        <MenuItem name={selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1] + "_" + "fulfilling"} value={t("Median value")}>
                          {t("Median value")}
                        </MenuItem>
                      </Select>
                    </FormControl>{" "}
                    : {t("Fill empty values with")} <u> {preprocessingInfoValue && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfoValue[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["fulfilling"]}</u> {t("")}
                  </b>
                )}
              </GridItem>
              {(preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["fulfilling"]) || Object.keys(preprocessingInfo).length === 0 ? (
                <></>
              ) : (
                <>
                  <GridItem xs={12} style={{ display: "inline", width: "100%" }}>
                    <FormControlLabel
                      control={<Checkbox name="checkedB" checked={preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && !preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["fulfilling"]} />}
                      label={`${t("Data replacement")} : ${t("Delete rows with empty values.")}`}
                    />
                  </GridItem>
                  {projects.project.trainingMethod && projects.project.trainingMethod.indexOf("time_series") > -1 && (
                    <GridItem xs={12} style={{ display: "inline", width: "100%" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="checkedB"
                            color="primary"
                            disabled={projects.project.status !== 0}
                            checked={preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]] && preprocessingInfo[selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1]]["timeSeriesMean"]}
                            onClick={() => onClickpreprocessingInfoValueValue(selectedRowForPreprocessing[selectedRowForPreprocessing.length - 1], "timeSeriesMean")}
                          />
                        }
                        label={`${t("Time series average")} : ${t("When converting, time series statistics are calculated from the average value, not the sum value.")}`}
                      />
                    </GridItem>
                  )}
                </>
              )}
              <GridItem xs={12} style={{ textAlign: "left" }}></GridItem>
            </GridContainer>
            <GridContainer style={{ width: "100%" }}>
              <GridItem xs={4}></GridItem>
              <GridItem xs={4}>
                <Button id="close_modal_btn" shape="greenContained" style={{ width: "100%" }} onClick={PreprocessingSaveClose}>
                  {t("Confirm")}
                </Button>
              </GridItem>
              <GridItem xs={4}></GridItem>
            </GridContainer>
          </div>
        </div>
      </Modal>
    </GridItem>
  );
});

export default SummaryTable;

SummaryTable.propTypes = {
  category: PropTypes.string,
  csv: PropTypes.array,
  getTimeSeriesCheckedValue: PropTypes.func,
  getCheckedValue: PropTypes.func,
  getProcessingInfo: PropTypes.func,
  getProcessingInfoValue: PropTypes.func,
  trainingColumnInfo: PropTypes.object,
  timeSeriesColumnInfo: PropTypes.object,
  preprocessingInfoParent: PropTypes.object,
  preprocessingInfoValueParent: PropTypes.object,
};
