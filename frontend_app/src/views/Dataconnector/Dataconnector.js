import React, { useState, useEffect } from "react";
import { ReactTitle } from "react-meta-tags";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import * as api from "controller/api.js";
import { putUserRequestActionWithoutMessage } from "redux/reducers/user";
import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
  askDeleteConnectorRequestAction,
} from "redux/reducers/messages.js";
import {
  getDataconnectortypeRequestAction,
  getDataconnectorsRequestAction,
  addIdListForLabelProjectRequestAction,
} from "redux/reducers/projects.js";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import "assets/css/material-control.css";
import { listPagination } from "components/Function/globalFunc";
import DataIntro from "components/Guide/DataIntro.js";
import Templates from "components/Templates/Templates.js";
import SearchInputBox from "components/Table/SearchInputBox";
import Button from "components/CustomButtons/Button";
import DataModalPublicData from "./DataModalPublicdata";
import DataModalsFileAdd from "./DataModalsFileAdd";

import {
  Checkbox,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from "@material-ui/core";
import {
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Modal,
  Tooltip,
} from "@mui/material";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import AutorenewIcon from "@material-ui/icons/Autorenew";

const Dataconnector = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { user, projects, messages } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
      messages: state.messages,
    }),
    []
  );

  const urlLoc = window.location;
  const urlPath = urlLoc.pathname;
  const urlSearch = urlLoc.search;
  const urlSearchParams = new URLSearchParams(urlSearch);

  const [isLoading, setIsLoading] = useState(true);
  const [isProjectStartLoading, setIsProjectStartLoading] = useState(false);
  const [introOn, setIntroOn] = useState(false);
  const [introOffClicked, setIntroOffClicked] = useState(false);

  const [isDataRequested, setIsDataRequested] = useState(false);
  const [datatablePage, setDatatablePage] = useState(0);
  const [datatableRowsPerPage, setDatatableRowsPerPage] = useState(10);
  const [sortDataValue, setSortDataValue] = useState("created_at");
  const [isSortDesc, setIsSortDesc] = useState(true);
  const [isPublicData, setIsPublicData] = useState(false);
  const [searchedDataValue, setSearchedDataValue] = useState("");
  const [isSearchHiddenForRefresh, setIsSearchHiddenForRefresh] = useState(
    false
  );

  const [datasetList, setDatasetList] = useState([]);
  const [publicDatasetList, setPublicDatasetList] = useState([]);
  const [selectedDataIdList, setSelectedDataIdList] = useState([]);
  const [selectedDataDict, setSelectedDataDict] = useState({});
  const [selectedPublicData, setSelectedPublicData] = useState({});
  const [allSelected, setAllSelected] = useState(false);

  const [countNotCsvSelected, setCountNotCsvSelected] = useState(0);
  const [countNotCompSelected, setCountNotCompSelected] = useState(0);
  const [countImpossLearnSelected, setCountImpossLearnSelected] = useState(0);
  const [isAbleToUploadLabelFiles, setIsAbleToUploadLabelFiles] = useState(
    true
  );

  const [isDatatypeModalOpen, setIsDatatypeModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPublicDataModalOpen, setIsPublicDataModalOpen] = useState(false);

  const [timeTick, setTimeTick] = useState(0);
  const [timeTickAsync, setTimeTickAsync] = useState(0);
  const [timeTickAsyncCount, setTimeTickAsyncCount] = useState(0);
  const [isReloadAsync, setIsReloadAsync] = useState(false);
  const [isRefreshAbuse, setIsRefreshAbuse] = useState(false);

  useEffect(() => {
    dispatch(getDataconnectortypeRequestAction());
    getDataByDispatch();
  }, []);

  useEffect(() => {
    const pagiInfoDict = listPagination(urlLoc);
    setDatatablePage(pagiInfoDict.page);
    setDatatableRowsPerPage(pagiInfoDict.rows);
    setSortDataValue(pagiInfoDict.sorting);
    setIsSortDesc(pagiInfoDict.desc);
    setSearchedDataValue(pagiInfoDict.search);
    setIsPublicData(pagiInfoDict.public);

    setIsDataRequested(true);
  }, [urlSearch]);

  useEffect(() => {
    if (isDataRequested) {
      getDataByDispatch();
      setIsDataRequested(false);
    }
  }, [isDataRequested]);

  useEffect(() => {
    if (isSearchHiddenForRefresh) setIsSearchHiddenForRefresh(false);
  }, [isSearchHiddenForRefresh]);

  useEffect(() => {
    let urlSP = urlSearchParams;
    let searchVal = searchedDataValue;
    if (searchVal) {
      if (urlSP.has("page")) urlSP.delete("page");
      urlSP.set("search", searchVal);
    }
    handleSearchParams(urlSP);
  }, [searchedDataValue]);

  useEffect(() => {
    if (timeTick >= 0) {
    } else if (timeTick == -2) {
      setTimeTick(0);
    }
  }, [timeTick]);

  useEffect(() => {
    if (timeTickAsync == 0) {
      let timer = setTimeout(() => {
        setTimeTickAsync(1);
      }, 15000);
    } else if (timeTickAsync == 1) {
      setTimeTickAsync(0);
      setTimeTickAsyncCount(timeTickAsyncCount + 1);
    }
  }, [timeTickAsync]);

  useEffect(() => {
    if (timeTickAsyncCount <= 20) {
      setIsReloadAsync(true);
    } else if (timeTickAsyncCount <= 240) {
      if (timeTickAsyncCount % 4 == 0) {
        setIsReloadAsync(true);
      }
    } else {
      if (timeTickAsyncCount % 120 == 0) {
        setIsReloadAsync(true);
      }
    }
  }, [timeTickAsyncCount]);

  useEffect(() => {
    if (projects.isDatasetSuccess == true) {
      setIsReloadAsync(false);
    }
  }, [projects.isDatasetLoading]);

  useEffect(() => {
    if (
      isDatatypeModalOpen == false &&
      isFileModalOpen == false &&
      isTemplateModalOpen == false &&
      isPublicDataModalOpen == false &&
      (timeTick == -2 || isReloadAsync == true)
    ) {
      getDataByDispatch();
      const state = history.location.state;
      if (state && state.dataconnectorModalOpen) {
        setIsDatatypeModalOpen(true);
      }
      if (state && state.projectModalOpen) {
        setIsFileModalOpen(true);
      }
    }
  }, [timeTick, isReloadAsync]);

  useEffect(() => {
    if (user.me && !user.me.intro1Checked) {
      setIntroOn(true);
    } else {
      setIntroOn(false);
    }
  }, [user]);

  useEffect(() => {
    if (introOffClicked) {
      setIntroOn(false);
      user.me.intro1Checked = true;
      dispatch(
        putUserRequestActionWithoutMessage({
          intro1Checked: true,
        })
      );
    }
  }, [introOffClicked]);

  useEffect(() => {
    if (projects.isDatasetDeleted) {
      setSelectedDataIdList([]);
      setSelectedDataDict({});
      projects.isDatasetDeleted = false;
    }
  }, [projects.isDatasetDeleted]);

  useEffect(() => {
    if (
      projects.idListForLabelProject.length &&
      projects.categoryForLabelProject
    ) {
      history.push("/admin/newProject/?file=ready");
    }
  }, [projects.idListForLabelProject]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsLoading(false);
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (projects.isDatasetPosted) {
      setIsSearchHiddenForRefresh(true);
      let urlSP = urlSearchParams;
      if (urlSP.has("page")) urlSP.delete("page");
      if (urlSP.has("sorting")) urlSP.delete("sorting");
      if (urlSP.has("desc")) urlSP.delete("desc");
      if (urlSP.has("search")) urlSP.delete("search");
      handleSearchParams(urlSP);
    }
  }, [projects.isDatasetPosted]);

  useEffect(() => {
    let reduxDataset = projects.dataconnectors;
    if (reduxDataset) {
      if (reduxDataset.length) {
        if (isPublicData) setPublicDatasetList(reduxDataset);
        else setDatasetList(reduxDataset);
      } else {
        if (datatablePage) {
          urlSearchParams.set("page", 1);
          handleSearchParams(urlSearchParams);
          setTimeTick(-2);
        }
      }
      if (!isProjectStartLoading) setIsLoading(false);
    }
  }, [projects.dataconnectors]);

  useEffect(() => {
    checkNewPageAllSelected(datasetList, selectedDataIdList);
  }, [datasetList, selectedDataIdList]);

  const getDataByDispatch = (valueChangeObject) => {
    if (projects.isDatasetLoading) return;

    let payloadJson = {
      sorting: sortDataValue,
      count: datatableRowsPerPage,
      start: datatablePage,
      isDesc: isSortDesc,
      is_public: isPublicData,
      searching: searchedDataValue,
    };
    if (valueChangeObject) {
      Object.keys(valueChangeObject).forEach((changeKey) => {
        payloadJson[changeKey] = valueChangeObject[changeKey];
      });
    }

    dispatch(getDataconnectorsRequestAction(payloadJson));
  };

  const handleSearchParams = (searchPar) => {
    history.push(urlPath + "?" + searchPar);
  };

  const checkNewPageAllSelected = (dataset, selIdList) => {
    let isAllSelected = true;
    if (selIdList.length < dataset.length) isAllSelected = false;
    dataset.forEach((data) => {
      if (!selIdList.includes(data.id)) isAllSelected = false;
    });
    setAllSelected(isAllSelected);
  };

  const privateTableHeads = [
    // { value: "No.", width: "5%", type: "dataNum" },
    { value: "Data name", width: "50%", type: "dataconnectorName" },
    { value: "Data type", width: "10%", type: "dataconnectortype" },
    { value: "Training availability", width: "10%", type: "hasLabelData" },
    { value: "Date created", width: "15%", type: "created_at" },
    { value: "Status", width: "10%", type: "status" },
  ];
  const dataStatusToText = {
    1: { name: "Uploading", color: "var(--secondary1)" },
    99: { name: "Error", color: "var(--error)" },
    100: { name: "Completed", color: "var(--primary1)" },
  };
  const privateDataTable = () => {
    const privateDataTableBody = (priDataArr) =>
      priDataArr.map((data, idx) => {
        let dataId = data.id;
        let dataNum =
          projects.connectorTotalLength -
          (datatableRowsPerPage * datatablePage + idx);
        let dataProgress = data.progress;

        if (idx < datatableRowsPerPage)
          return (
            <TableRow
              key={`tablebodyrow_${idx}`}
              id={`tablebodyrow_${idx}`}
              className={
                selectedDataIdList.includes(dataId)
                  ? classes.tableFocused
                  : classes.tableRow
              }
              onClick={() => {
                if (dataProgress === 100)
                  history.push(`/admin/dataconnector/${dataId}`);
                else {
                  dispatch(
                    openErrorSnackbarRequestAction(
                      t(
                        "Only data in the completed status can be viewed in detail."
                      )
                    )
                  );
                }
              }}
            >
              <TableCell
                className={classes.tableRowCell}
                align="center"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  id={`dataconnector_chkbox_${idx}`}
                  value={dataId}
                  checked={selectedDataIdList.includes(dataId)}
                  onChange={(e) => {
                    onChangeSelectedData(data);
                  }}
                />
              </TableCell>
              {privateTableHeads.map((privateHead) => {
                let tmpType = privateHead.type;
                let rawValue = data[tmpType];
                let tmpValue = "";
                let isStatus = false;
                let isProgressBar = false;

                if (tmpType === "dataNum") tmpValue = dataNum;
                else if (tmpType === "dataconnectortype")
                  tmpValue = rawValue.dataconnectortypeName;
                else if (tmpType === "hasLabelData")
                  tmpValue = rawValue ? t("Possible") : t("Impossible");
                else if (tmpType === "created_at")
                  tmpValue = rawValue?.substring(0, 10);
                else if (tmpType === "status") {
                  isStatus = true;
                  if (rawValue === 1) {
                    isProgressBar = true;
                    tmpValue = data.progress;
                  } else tmpValue = rawValue;
                } else tmpValue = rawValue;

                return (
                  <TableCell
                    key={`datatablecell_page${datatablePage}row${idx}_${tmpType}`}
                    id={`datatablecell_page${datatablePage}row${idx}_${tmpType}`}
                    className={classes.tableRowCell}
                    align="center"
                  >
                    {isStatus ? (
                      isProgressBar ? (
                        <LinearProgress
                          className={classes.linearProgressLightBackground}
                          variant="determinate"
                          value={dataProgress ? dataProgress : 0}
                        />
                      ) : (
                        <span
                          className="nowrap"
                          style={{ color: dataStatusToText[tmpValue].color }}
                        >
                          {"⦁ " + t(dataStatusToText[tmpValue].name)}
                        </span>
                      )
                    ) : tmpValue ? (
                      tmpValue
                    ) : (
                      "-"
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          );
      });

    return (
      <Table
        id="privateDataTable"
        className={classes.table}
        aria-label="simple table"
      >
        <TableHead id="privateDataTableHead">
          <TableRow>
            <TableCell
              className={classes.tableHead}
              align="center"
              style={{ width: "3%" }}
            >
              <Checkbox
                value="all"
                checked={allSelected}
                onChange={onChangeSelectedAll}
              />
            </TableCell>
            {privateTableHeads.map((tableHead, idx) => (
              <TableCell
                id={`privateDataHeaderCell_${tableHead.type}`}
                key={`tableHeadCell_${idx}`}
                className={classes.tableHead}
                align="center"
                width={tableHead.width}
                style={{
                  cursor: tableHead.value !== "No." ? "pointer" : "default",
                }}
                onClick={() =>
                  tableHead.value !== "No." &&
                  onSetSortDataValue(tableHead.type)
                }
              >
                <div className={classes.tableHeader}>
                  {sortDataValue === tableHead.type &&
                    (!isSortDesc ? (
                      <ArrowUpwardIcon
                        id={`ascend_${tableHead.type}`}
                        className="arrow_ascend"
                        fontSize="small"
                      />
                    ) : (
                      <ArrowDownwardIcon
                        id={`descend_${tableHead.type}`}
                        className="arrow_descend"
                        fontSize="small"
                      />
                    ))}
                  <b className="capitalize">{t(tableHead.value)}</b>
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody id="privateDataTableBody">
          {datasetList?.length ? privateDataTableBody(datasetList) : null}
        </TableBody>
      </Table>
    );
  };

  const publicTableHeads = [
    { value: "No.", width: "5%", type: "dataNum", align: "center" },
    {
      value: "Preview",
      width: "12.5%",
      type: "sampleImageData",
      align: "center",
    },
    {
      value: "Data name",
      width: "15%",
      type: "dataconnectorName",
      align: "center",
    },
    { value: "Summary", width: "37.5%", type: "description", align: "left" },
    {
      value: "Reference",
      width: "15%",
      type: "reference",
      subUrl: "referenceUrl",
      align: "left",
    },
    {
      value: "License",
      width: "15%",
      type: "license",
      subUrl: "licenseUrl",
      align: "left",
    },
  ];
  const publicDataTable = () => {
    const publicDataTableBody = (pubDatasetList) => {
      const openPublicDataModal = (pubData) => {
        setSelectedPublicData(pubData);
        onChangeSelectedData(pubData);
        setIsPublicDataModalOpen(true);
      };

      return pubDatasetList.map((data, idx) => {
        let dataId = data.id;
        let dataNum =
          projects.connectorTotalLength -
          (datatableRowsPerPage * datatablePage + idx);
        let imgUrl = data.sampleImageUrl;

        return (
          <TableRow
            key={idx}
            className={
              selectedDataIdList.includes(dataId)
                ? classes.tableFocused
                : classes.tableRow
            }
            onClick={() => openPublicDataModal(data)}
          >
            {publicTableHeads.map((tableHead) => {
              let tmpType = tableHead.type;
              let tmpValue = "";
              let rawValue = data[tmpType];
              if (tmpType === "description")
                tmpValue =
                  rawValue?.length > 135
                    ? rawValue.substring(0, 136) + "..."
                    : rawValue;
              else tmpValue = rawValue;

              return (
                <TableCell
                  key={`publicDataHeaderCell_${tableHead.type}`}
                  className={classes.tableRowCell}
                  align={tableHead.align}
                >
                  <div className="breakAll">
                    {tableHead.type === "dataNum" ? (
                      dataNum
                    ) : tableHead.type === "sampleImageData" ? (
                      <img
                        src={imgUrl}
                        style={{
                          width: "150px",
                          height: "90px",
                          borderRadius: "4px",
                        }}
                      />
                    ) : (
                      tmpValue
                    )}
                  </div>
                  {tableHead.subUrl ? (
                    <small className="breakAll">{data[tableHead.subUrl]}</small>
                  ) : null}
                </TableCell>
              );
            })}
          </TableRow>
        );
      });
    };

    return (
      <Table
        id="publicDataTable"
        className={classes.table}
        aria-label="simple table"
      >
        <TableHead>
          <TableRow>
            {publicTableHeads.map((tableHead, idx) => (
              <TableCell
                id="mainHeader"
                key={idx}
                className={classes.tableHead}
                align="center"
                width={tableHead.width}
                style={{
                  cursor:
                    tableHead.type === "dataconnectorName"
                      ? "pointer"
                      : "default",
                }}
                onClick={() =>
                  tableHead.type === "dataconnectorName" &&
                  onSetSortDataValue(tableHead.type)
                }
              >
                <div className={classes.tableHeader} style={{ margin: "15px" }}>
                  {sortDataValue === tableHead.type &&
                    (!isSortDesc ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                  <b>{t(tableHead.value)}</b>
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {publicDatasetList?.length
            ? publicDataTableBody(publicDatasetList)
            : null}
        </TableBody>
      </Table>
    );
  };

  const showDataconnector = () => {
    const btnDeleteData = () => {
      const deleteDataconnector = () => {
        dispatch(
          askDeleteConnectorRequestAction({
            connectors: selectedDataIdList,
            sortInfo: {
              sorting: sortDataValue,
              count: datatableRowsPerPage,
              start: datatablePage,
              isDesc: isSortDesc,
              is_public: isPublicData,
            },
          })
        );
      };

      let lenSelectedData = selectedDataIdList.length;
      let isDeleteButtonDisabled = lenSelectedData === 0;

      return (
        <Button
          id="delete_data_btn"
          shape="redOutlined"
          size="sm"
          disabled={isDeleteButtonDisabled}
          style={{
            marginTop: ".2rem",
            zIndex: "5",
          }}
          onClick={deleteDataconnector}
        >
          {t("Delete selection")}
        </Button>
      );
    };

    const dataTablePagination = () => {
      const handleDataconnectorChangePage = (event, newPage) => {
        urlSearchParams.set("page", newPage + 1);
        handleSearchParams(urlSearchParams);
      };

      const handleChangeDatatableRowsPerPage = (event) => {
        urlSearchParams.delete("page");
        urlSearchParams.set("rows", event.target.value);
        handleSearchParams(urlSearchParams);
      };

      return (
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={
            projects.connectorTotalLength ? projects.connectorTotalLength : 0
          }
          rowsPerPage={datatableRowsPerPage}
          page={datatablePage}
          SelectProps={{ id: "pagerow_select" }}
          backIconButtonProps={{
            id: "datatable_prevpage",
            "aria-label": "previous datatablePage",
          }}
          nextIconButtonProps={{
            id: "datatable_nextpage",
            "aria-label": "next datatablePage",
          }}
          style={{ margin: "-.7rem -.7rem" }}
          onPageChange={handleDataconnectorChangePage}
          onRowsPerPageChange={handleChangeDatatableRowsPerPage}
        />
      );
    };

    let dataconnectors = projects.dataconnectors;
    let isSearchedDataNotExist =
      !isLoading && searchedDataValue && dataconnectors.length === 0;
    let isDataNotUploaded =
      !isLoading &&
      (!dataconnectors || (dataconnectors.length === 0 && datatablePage === 0));
    let isDataLoading =
      isLoading ||
      (projects.isDatasetLoading && timeTick == 0 && isReloadAsync == false);
    if (isSearchedDataNotExist)
      return (
        <Grid id="divNoDataSearchAgain" className="emptyListTable">
          {i18n.language === "ko"
            ? `"${searchedDataValue}" ` +
              "에 대한 검색 결과가 없습니다. 다시 검색해주세요."
            : `There were no results found for "${searchedDataValue}"`}
        </Grid>
      );
    else if (isDataNotUploaded)
      return (
        <Grid id="divNoDataAddNewData" className="emptyListTable">
          {t("No data in process. Please generate new data.")}
        </Grid>
      );
    else
      return (
        <div
          id="div_tablesection"
          style={{
            transform: `translateY(${
              Object.keys(selectedDataDict).length > 0 && !isPublicData
                ? "10px"
                : 0
            })`,
            transition: "all 0.2s",
          }}
        >
          {isDataLoading ? (
            <div id="data_loading" className={classes.loading}>
              <CircularProgress />
            </div>
          ) : isPublicData ? (
            publicDataTable()
          ) : (
            privateDataTable()
          )}

          <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
            {isPublicData ? <div /> : btnDeleteData()}
            {dataTablePagination()}
          </Grid>
        </div>
      );
  };

  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
  };

  const closePublicDataModal = (pubData) => {
    setSelectedPublicData({});
    onChangeSelectedData(pubData);
    setIsPublicDataModalOpen(false);
  };

  const onChangeSelectedData = (data) => {
    let dataId = data.id;
    let idList = [...selectedDataIdList];
    let idIndex = idList.indexOf(dataId);
    let selectedDict = selectedDataDict;

    if (idIndex === -1) {
      idList.push(dataId);
      selectedDict[dataId] = data;
    } else {
      idList.splice(idIndex, 1);
      delete selectedDict[dataId];
    }

    setSelectedDataIdList(idList);
    handleSelectedData(selectedDict);
  };

  const onChangeSelectedAll = () => {
    let isChecked = !allSelected;
    let idList = [...selectedDataIdList];
    let selectedDict = selectedDataDict;

    datasetList.forEach((data) => {
      let dataId = data.id;
      let idIndex = idList.indexOf(dataId);

      if (isChecked) {
        if (idIndex === -1) {
          idList.push(dataId);
          selectedDict[dataId] = data;
        } else {
          idList.splice(idIndex, 1);
          idList.push(dataId);
        }
      } else {
        if (idIndex > -1) {
          idList.splice(idIndex, 1);
          delete selectedDict[dataId];
        }
      }
    });

    setAllSelected(isChecked);
    setSelectedDataIdList(idList);
    handleSelectedData(selectedDict);
  };

  const handleSelectedData = (selDataDict) => {
    setSelectedDataDict(selDataDict);
    checkPossibleData(selDataDict);
    checkAbleToLabel(selDataDict);
  };

  const checkAbleToLabel = (selectedDict) => {
    const selectedIdArr = Object.keys(selectedDict);
    if (selectedIdArr.length === 0) setIsAbleToUploadLabelFiles(false);
    else {
      const firstDataType =
        selectedDict[selectedIdArr[0]].dataconnectortype.dataconnectortypeName;

      let flag = true;
      const shouldAlone = ["CSV", "MySQL", "Oracle", "MSSQL", "PostgreSQL"];
      Object.values(selectedDict).forEach((selectedData) => {
        let typeName = selectedData.dataconnectortype.dataconnectortypeName;

        if (firstDataType === "ZIP" || firstDataType === "Video") {
          if (shouldAlone.indexOf(typeName) > -1) flag = false;
        } else {
          flag = false;
        }
      });
      setIsAbleToUploadLabelFiles(flag);
    }
  };

  const checkPossibleData = (selectedDict) => {
    let countOtherType = 0;
    let countNotCompletedStatus = 0;
    let countImpossibleLearning = 0;

    selectedDict &&
      Object.keys(selectedDict).forEach((dataId) => {
        let dataInfo = selectedDict[dataId];
        let dataType = dataInfo.dataconnectortype.dataconnectortypeName;
        let isLearnable = dataInfo.hasLabelData;
        let dataStatus = dataInfo.status;

        if (!(dataType === "CSV")) {
          countOtherType = countOtherType + 1;
        }
        if (!isLearnable) {
          countImpossibleLearning = countImpossibleLearning + 1;
        }
        if (!(dataStatus === 100)) {
          countNotCompletedStatus = countNotCompletedStatus + 1;
        }
      });

    setCountNotCsvSelected(countOtherType);
    setCountNotCompSelected(countNotCompletedStatus);
    setCountImpossLearnSelected(countImpossibleLearning);
  };

  const showSelectedData = () => {
    const idLists = selectedDataIdList;
    const isListed = idLists.length > 0;

    return (
      !isPublicData &&
      !isProjectStartLoading && (
        <div
          style={{
            transform: `translateY(${isListed ? 0 : -10})`,
            height: isListed ? 32 : 0,
            transition: "all 0.4s",
            overflowX: "auto",
          }}
        >
          {isListed &&
            idLists.map((id, idx) => {
              let data = selectedDataDict[id];
              let dataName = data?.dataconnectorName;

              return (
                <Chip
                  key={`selectedDataTag_${id}`}
                  id={`selected_tag_${idx}`}
                  size="small"
                  label={
                    dataName.length > 20
                      ? dataName.substring(0, 21) + "..."
                      : dataName
                  }
                  onDelete={() => {
                    onChangeSelectedData(data);
                  }}
                  sx={{
                    color: "var(--textWhite87)",
                    backgroundColor: "var(--surface1)",
                    borderRadius: 2,
                    mr: 0.5,
                    my: 0.5,
                    px: 0.5,
                  }}
                />
              );
            })}
        </div>
      )
    );
  };

  const tabActiveStyle = {
    width: "200px",
    color: currentThemeColor.secondary1,
    borderBottom: "2px solid " + currentThemeColor.secondary1,
    padding: ".3rem",
    wordBreak: "keep-all",
  };
  const tabDeactiveStyle = {
    width: "200px",
    color: "#D0D0D0",
    borderBottom: "2px solid #D0D0D0",
    padding: ".3rem",
    wordBreak: "keep-all",
  };
  const privateDataTab = (
    <div
      id="privateDataTab"
      style={!isPublicData ? tabActiveStyle : tabDeactiveStyle}
      className={
        !isPublicData ? classes.selectedListObject : classes.listObject
      }
      onClick={() => {
        if (isPublicData) switchData("private");
      }}
    >
      {t("My Data")}
    </div>
  );
  const publicDataTab = (
    <div
      id="publicDataTab"
      style={isPublicData ? tabActiveStyle : tabDeactiveStyle}
      className={isPublicData ? classes.selectedListObject : classes.listObject}
      onClick={() => {
        if (!isPublicData) switchData("public");
      }}
    >
      {t("Open Data")}
    </div>
  );

  const switchData = (data) => {
    setSelectedDataDict({});
    setSelectedDataIdList([]);
    setAllSelected(false);
    setIsSearchHiddenForRefresh(true);

    let urlSP = urlSearchParams;
    if (urlSP.has("page")) urlSP.delete("page");
    if (urlSP.has("rows")) urlSP.delete("rows");
    if (urlSP.has("sorting")) urlSP.delete("sorting");
    if (urlSP.has("search")) urlSP.delete("search");

    if (data === "private") {
      urlSP.delete("public");
    } else if (data === "public") {
      urlSP.set("public", true);
    }
    handleSearchParams(urlSP);
  };

  const onSetSortDataValue = (value) => {
    let urlSP = urlSearchParams;
    if (value === sortDataValue) {
      urlSP.set("desc", !isSortDesc);
    } else {
      urlSP.set("sorting", value);
      urlSP.delete("desc");
    }
    if (urlSP.has("page")) urlSP.delete("page");
    handleSearchParams(urlSP);
  };

  const startLabeling = () => {
    let idList = selectedDataIdList;
    let dataDict = selectedDataDict;
    let firstSelected = dataDict[idList[0]];
    let firstSelectedType =
      firstSelected.dataconnectortype?.dataconnectortypeName;
    let firstSelectedCategory = firstSelected.trainingMethod;

    dispatch(
      addIdListForLabelProjectRequestAction({
        idListForLabeling: idList,
        firstSelectedCategory,
        firstSelectedType,
      })
    );
  };

  const partControlBtns = () => {
    const btnLabelingStart = () => {
      let lenSelectedData = Object.values(selectedDataDict).length;

      const textLabellingTooltip = (lenData, cntNotComp, cntOther) => {
        let tipText = "";
        if (lenData) {
          if (cntNotComp === 0) {
            if (lenData > 1) {
              if (cntOther === 0)
                tipText =
                  "If you select a csv file, only 1 csv file is allowed to start labelling.";
              else
                tipText =
                  "If you select a csv file, labelling with files with other extensions is not possible.";
            }
          } else
            tipText =
              "You can only create a labeling project from files that are complete.";
        } else tipText = "Please select data to start labelling!";
        return tipText;
      };

      if (
        countNotCompSelected === 0 &&
        ((lenSelectedData > 1 && isAbleToUploadLabelFiles) ||
          lenSelectedData === 1)
      )
        return (
          <Button
            id="start_labelling_btn"
            shape="greenOutlined"
            disabled={isProjectStartLoading}
            style={{ minWidth: 150 }}
            onClick={startLabeling}
          >
            {t("Start labeling")}
          </Button>
        );
      else
        return (
          <Tooltip
            title={
              <div style={{ fontSize: "12px" }}>
                {t(
                  textLabellingTooltip(
                    lenSelectedData,
                    countNotCompSelected,
                    countNotCsvSelected
                  )
                )}
              </div>
            }
            placement="bottom"
          >
            <div>
              <Button
                id="start_labelling_disabled_btn"
                disabled
                style={{ minWidth: 150 }}
              >
                {t("Start labeling")}
              </Button>
            </div>
          </Tooltip>
        );
    };

    const btnProjectStart = (type) => {
      let isAllCompLearnable =
        countNotCompSelected === 0 && countImpossLearnSelected === 0;
      let isSingleOrSame =
        selectedDataIdList.length === 1 ||
        (selectedDataIdList.length > 1 && countNotCsvSelected === 0);
      let isTypeDev = type === "develop";
      let btnActionText = isTypeDev
        ? "Start AI developing"
        : "Start AI verification";

      const startProject = async (type) => {
        // var isError = false;
        // if(parseInt(user.me.cumulativeProjectCount) >= parseInt(user.me.usageplan.projects) + parseInt(user.me.remainProjectCount)){
        //   dispatch(openErrorSnackbarRequestAction(`${t('You can’t add a new project. You’ve reached the maximum number of projects allowed for your account')} ${t('계속 진행하시려면 이용플랜을 변경해주세요.')}`));
        //   isError = true;
        // }
        setIsProjectStartLoading(true);
        setIsLoading(true);
        let postProjectInfo = { dataconnectors: selectedDataIdList };
        if (type === "verify") postProjectInfo["isVerify"] = true;
        await api
          .postProjectFromDataconnectors(postProjectInfo)
          .then((res) => {
            setIsLoading(false);
            dispatch(
              openSuccessSnackbarRequestAction(
                t("A new project has been created.")
              )
            );
            if (type === "develop") history.push(`/admin/train/` + res.data.id);
            else if (type === "verify")
              history.push(`/admin/verifyproject/` + res.data.id);
          })
          .catch((error) => {
            if (
              process.env.REACT_APP_ENTERPRISE !== "true" &&
              error.response &&
              error.response.status === 402
            ) {
              window.location.href = "/admin/setting/payment/?cardRequest=true";
              return;
            }
            if (JSON.stringify(error).indexOf("507") > -1)
              dispatch(
                openErrorSnackbarRequestAction(
                  t("The total number of data exceeded.")
                )
              );
            else
              dispatch(
                openErrorSnackbarRequestAction(
                  t(
                    "The project was not created due to a temporary error. Please try again."
                  )
                )
              );
            setIsProjectStartLoading(false);
          });
      };

      const btnTooltipDisabled = (text) => (
        <Tooltip
          title={<div style={{ fontSize: "12px" }}>{t(text)}</div>}
          placement="bottom"
        >
          <div>
            <Button id={`start_${type}_btn`} disabled style={{ minWidth: 150 }}>
              {t(btnActionText)}
            </Button>
          </div>
        </Tooltip>
      );

      if (isAllCompLearnable) {
        if (isSingleOrSame) {
          return (
            <Button
              id={`start_${type}_btn`}
              shape="greenOutlined"
              disabled={isProjectStartLoading}
              style={{ minWidth: 150 }}
              onClick={() => startProject(type)}
            >
              {t(btnActionText)}
            </Button>
          );
        } else {
          let tooltipText =
            countNotCsvSelected === 0
              ? `Please select data to start ${
                  isTypeDev ? "developing" : "verifying"
                } your AI!`
              : `If you select a csv file, ${
                  isTypeDev ? "developing" : "verifying"
                } with files with other extensions is not possible.`;
          return btnTooltipDisabled(tooltipText);
        }
      } else {
        let tooltipText =
          countNotCompSelected === 0
            ? `You can only create a AI ${
                isTypeDev ? "" : "verification" + " "
              }project from files that are learnable.`
            : `You can only create a AI ${
                isTypeDev ? "" : "verification" + " "
              }project from files that are complete.`;
        return btnTooltipDisabled(tooltipText);
      }
    };

    const btnDataAdd = () => {
      const openStartDataconnector = () => {
        setIsDatatypeModalOpen(true);
      };

      let dataconnectors = projects.dataconnectors;
      return (
        <>
          <Button
            id="add_dataset_btn"
            shape="greenContained"
            disabled={!dataconnectors}
            style={{ minWidth: 150 }}
            onClick={openStartDataconnector}
          >
            {t("Upload data")}
          </Button>
        </>
      );
    };

    const btnSampleTemplate = () => {
      const openTemplate = () => {
        setIsTemplateModalOpen(true);
      };

      const openTemplateButton = (
        <Button
          id="sampleTemplateBtn"
          shape="greenOutlined"
          onClick={openTemplate}
          style={{ minWidth: 150 }}
        >
          {t("Sample template")}
        </Button>
      );

      if (isTemplateModalOpen) return openTemplateButton;
      else
        return (
          <Tooltip
            title={
              <div style={{ fontSize: "12px" }}>{`${t(
                "Example templates are provided with brief explanations for each training type."
              )} / ${t(
                "Example templates are provided for each industry group."
              )}`}</div>
            }
            placement="bottom"
          >
            <div>{openTemplateButton}</div>
          </Tooltip>
        );
    };

    const reloadButton = (
      <Tooltip
        title={<div style={{ fontSize: "12px" }}>{t("Refresh data list")}</div>}
        placement="top"
      >
        <IconButton
          id="dataset_refresh_btn"
          sx={{ p: 0 }}
          disabled={isRefreshAbuse}
          onClick={() => {
            if (!isRefreshAbuse) {
              setIsRefreshAbuse(true);
              setTimeTick(-2);
              setTimeout(() => {
                setIsRefreshAbuse(false);
              }, 1000);
            }
          }}
        >
          <AutorenewIcon
            style={{
              fill: isRefreshAbuse
                ? "var(--textMediumGrey)"
                : "var(--textWhite87)",
            }}
          />
        </IconButton>
      </Tooltip>
    );

    return (
      <>
        <Grid item>{btnDataAdd()}</Grid>
        <Grid item>{btnSampleTemplate()}</Grid>
        <Grid item>{btnLabelingStart()}</Grid>
        <Grid item>{btnProjectStart("develop")}</Grid>
        <Grid item>{btnProjectStart("verify")}</Grid>
        <Grid item>{reloadButton}</Grid>
      </>
    );
  };

  return (
    <>
      <ReactTitle title={"DS2.ai - " + t("Dataset")} />
      {introOn ? (
        <DataIntro
          setIntroOn={setIntroOn}
          setIntroOffClicked={setIntroOffClicked}
          useTranslation={useTranslation}
          userLang={user.language}
        />
      ) : (
        <>
          <Grid sx={{ mb: 2 }}>
            <div className={classes.topTitle}>{t("Data Storage")}</div>
            <div className={classes.subTitleText}>
              {t("Begin your AI model development with your own dataset.")}
            </div>
          </Grid>
          <Grid container sx={{ mb: 2 }}>
            <Grid item xs={8} className="flex itemsCenter">
              {privateDataTab}
              {publicDataTab}
            </Grid>
            <Grid item xs={4}>
              {isSearchHiddenForRefresh ? null : <SearchInputBox />}
            </Grid>
          </Grid>
          <Grid
            container
            alignItems="center"
            columnSpacing={1}
            sx={{ mb: 2, minWidth: "850px" }}
          >
            {!isPublicData && partControlBtns()}
          </Grid>
          <Grid>
            {showSelectedData()}
            {showDataconnector()}
          </Grid>
        </>
      )}
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isPublicDataModalOpen}
        onClose={() => {
          closePublicDataModal(selectedPublicData);
        }}
        className={classes.modalContainer}
      >
        <DataModalPublicData
          closePublicDataModal={closePublicDataModal}
          selectedData={selectedPublicData}
          tableHeads={publicTableHeads}
        />
      </Modal>
      <DataModalsFileAdd
        isDatatypeModalOpen={isDatatypeModalOpen}
        setIsDatatypeModalOpen={setIsDatatypeModalOpen}
        isFileModalOpen={isFileModalOpen}
        setIsFileModalOpen={setIsFileModalOpen}
      />
      <Modal
        open={isTemplateModalOpen}
        onClose={closeTemplateModal}
        className={classes.modalContainer}
      >
        <>
          <Templates closeTemplateModal={closeTemplateModal} />
        </>
      </Modal>
    </>
  );
};

export default React.memo(Dataconnector);
