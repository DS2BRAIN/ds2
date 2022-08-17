import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as api from "controller/api.js";
import currentTheme from "assets/jss/custom.js";
import { openErrorSnackbarRequestAction, openSuccessSnackbarRequestAction, askModalRequestAction } from "redux/reducers/messages.js";
import { getMeRequestAction } from "../../redux/reducers/user";
import "assets/css/material-control.css";
import Button from "components/CustomButtons/Button";
import { IS_ENTERPRISE } from "variables/common";

import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";
import JSONPretty from "react-json-pretty";
import { DropzoneArea } from "material-ui-dropzone";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Pagination from "@material-ui/lab/Pagination";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import TablePagination from "@material-ui/core/TablePagination";
import Modal from "@material-ui/core/Modal";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CloseIcon from "@material-ui/icons/Close";
import TextField from "@material-ui/core/TextField";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import Checkbox from "@material-ui/core/Checkbox";
import LinearProgress from "@material-ui/core/LinearProgress";
import Tooltip from "@material-ui/core/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

export default function MarketPurchaseList({ history }) {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { user, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [marketPurchaseList, setMarketPurchaseList] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [totalLength, setTotalLength] = useState(0);
  const [pageNum, setPageNum] = useState(0);
  const [rowsPerModelPage, setRowsPerModelPage] = useState(10);
  const [isPredictModalOpen, setIsPredictModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState({});
  const [predictKeyValue, setPredictKeyValue] = useState({});
  const [predictResultJson, setPredictResultJson] = useState({});
  const [predictResultLoading, setPredictResultLoading] = useState(false);
  const [predictFilesInOrder, setPredictFilesInOrder] = useState({});
  const [isInputFileForm, setIsInputFileForm] = useState(false);
  const [predictResultFile, setPredictResultFile] = useState(null);
  const [resultFileLink, setResultFileLink] = useState(null);

  const [tableBodys, setTableBodys] = useState([
    { value: "thumbnail", name: "미리보기" },
    { value: "projectName", name: "프로젝트 이름" },
    { value: "name_kr", name: "종류" },
    { value: "created_at", name: "신청한 날짜" },
    { value: "nextPaymentDate", name: "결제 상황" },
    { value: "status", name: "작업 상황" },
  ]);

  const tableHeads = [
    { value: "No", width: "5%" },
    { value: "미리보기", width: "10%" },
    { value: "프로젝트 이름", width: "15%" },
    { value: "종류", width: "25%" },
    { value: "신청한 날짜", width: "15%" },
    { value: "결제 상황", width: "10%" },
    { value: "작업 상황", width: "15%" },
    { value: "Action", width: "15%" },
  ];

  const status = {
    0: "대기중",
    10: "진행중",
    100: "완료",
  };

  const renderTableRow = (type, value) => {
    switch (type) {
      case "thumbnail":
        return "";
      // return <img src={value} style={{ width: "80px", height: "80px" }} />;
      case "projectName":
        return value;
      case "name_kr":
        return value;
      case "name_en":
        return value;
      case "created_at":
        return value.substring(0, 10);
      case "nextPaymentDate":
        let expired_at = new Date(value);
        expired_at = (expired_at.getTime() + expired_at.getTimezoneOffset() * 60000) / 60000;
        let nowTime = new Date();
        nowTime = (nowTime.getTime() + nowTime.getTimezoneOffset() * 60000) / 60000;
        return expired_at > nowTime ? "결제 완료" : "미결제";
      case "status":
        return status[value];
    }
  };

  useEffect(() => {
    changeLang();
    const data = {
      start: 1,
      count: 10,
    };
    getMarketPurchaseList(data);
  }, []);

  useEffect(() => {
    changeLang();
  }, [user.language]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsPredictModalOpen(false);
      resetPredictModalInputData();
    }
  }, [messages.shouldCloseModal]);

  const resetPredictModalInputData = () => {
    setSelectedPurchase({});
    setPredictKeyValue({});
    setPredictFilesInOrder({});
    setIsInputFileForm(false);
    setPredictResultFile(null);
    setResultFileLink(null);
  };

  const changeLang = () => {
    let tmp;
    if (user.language === "en") {
      tmp = [{ value: "thumbnail", name: "미리보기" }, { value: "projectName", name: "프로젝트 이름" }, { value: "name_en", name: "종류" }, { value: "created_at", name: "신청한 날짜" }, { value: "nextPaymentDate", name: "결제 상황" }, { value: "status", name: "작업 상황" }];
    } else {
      tmp = [{ value: "thumbnail", name: "미리보기" }, { value: "projectName", name: "프로젝트 이름" }, { value: "name_kr", name: "종류" }, { value: "created_at", name: "신청한 날짜" }, { value: "nextPaymentDate", name: "결제 상황" }, { value: "status", name: "작업 상황" }];
    }
    setTableBodys(tmp);
  };

  const getMarketPurchaseList = (data) => {
    setIsLoading(true);
    api
      .getMarketPurchaseList(data)
      .then((res) => {
        setIsLoading(false);
        setMarketPurchaseList(res.data.market_list);
        // setMarketPurchaseList(res.data.market_list.reverse());
        setTotalLength(res.data.total_length);
      })
      .catch((e) => {
        console.log(e, "e");
      });
  };

  const changeSearchValue = (e) => {
    setSearchValue(e.target.value);
  };

  const getSearchResult = () => {
    if (!searchValue) {
      dispatch(openErrorSnackbarRequestAction(t("Please enter a search term.")));
      return;
    }
    getMarketPurchaseList({
      start: pageNum,
      count: 10,
      searching: searchValue,
    });
  };

  useEffect(() => {
    if (user.me == null) dispatch(getMeRequestAction());
  }, []);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setPredictResultJson(null);
    }
  }, [messages.shouldCloseModal]);

  //service_type으로 변경
  const onClickButtonAction = (purchase) => {
    let key = `first_${purchase.service_type}_expiration_date`;
    let expired_at = new Date(user.me[key]).getTime() / 60000;
    let nowTime = new Date();
    nowTime = new Date(nowTime.getTime() + nowTime.getTimezoneOffset() * 60000).getTime() / 60000;
    if (user.me[key] == null) expired_at = nowTime - 1;
    if (nowTime < expired_at) {
      history.push(`/admin/market/${purchase.marketproject}/${purchase.service_type}`);
    } else if (user.cardInfo?.cardName == null) {
      if (!IS_ENTERPRISE) {
        history.push(`/admin/setting/payment/?message=need`);
      }
    } else {
      history.push(`/admin/market/${purchase.marketproject}/${purchase.service_type}`);
    }

    //이름으로 구분
    // let tmp = purchase.name_en.toLowerCase().split(" ");
    // let key = `first_${tmp[0]}_${tmp[1]}_created_at`;
    // let created_at = new Date(user.me[key]).getTime() / 60000;
    // let nowTime = new Date();
    // nowTime =
    //   new Date(
    //     nowTime.getTime() + nowTime.getTimezoneOffset() * 60000
    //   ).getTime() / 60000;
    //   console.log(created_at)
    // if (user.me[key] == null) created_at = nowTime;
    // if (nowTime - created_at > 20160) {
    // history.push("/admin/market/" + purchase.marketproject);
    // } else {
    //   history.push(`/admin/setting/payment/?message=need`);
    // }
  };

  const changePage = (e, page) => {
    getMarketPurchaseList({
      start: page + 1,
      count: 10,
    });
    setPageNum(page);
  };

  const changeRowsPerModelPage = (event) => {
    setIsLoading(true);
    setRowsPerModelPage(+event.target.value);
    setPageNum(0);
    getMarketPurchaseList({
      start: 1,
      count: event.target.value,
    });
  };

  const openPredictModal = (selected) => {
    setSelectedPurchase(selected);
    setIsPredictModalOpen(true);
    let tempFileStructureDict = {};
    let tempIsInputFileForm = false;
    Object.keys(selected.file_structure).map((structure) => {
      if (selected.file_structure[structure].indexOf("_") !== -1) {
        tempIsInputFileForm = true;
      } else if (selected.file_structure[structure] === "boolean") tempFileStructureDict[structure] = false;
      else tempFileStructureDict[structure] = null;
    });
    setPredictKeyValue(tempFileStructureDict);
    setIsInputFileForm(tempIsInputFileForm);
  };

  const closePredictModal = () => {
    dispatch(askModalRequestAction());
  };

  const predictValueCheck = (cKey) => {
    let tempPredictKV = predictKeyValue;
    if (tempPredictKV[cKey]) tempPredictKV[cKey] = false;
    else tempPredictKV[cKey] = true;
    setPredictKeyValue(tempPredictKV);
  };

  const predictValueInput = (inputText, iKey) => {
    let tempKeyValue = predictKeyValue;
    if (selectedPurchase.file_structure[iKey] === "integer") {
      inputText = parseInt(inputText);
    }
    if (selectedPurchase.file_structure[iKey] === "float") {
      if (inputText > 1) {
        dispatch(openErrorSnackbarRequestAction(t("Maximum value") + " 1"));
        return;
      }
      if (inputText < 0) {
        dispatch(openErrorSnackbarRequestAction(t("Minimum value") + " 0"));
        return;
      }
      inputText = parseFloat(inputText);
    }
    tempKeyValue[iKey] = inputText;
    setPredictKeyValue(tempKeyValue);
  };

  const determineType = (typeString) => {
    if (typeString === "integer" || typeString === "float") return "number";
    else return "text";
  };

  const allDataCheck = (dataType) => {
    let tempKeyValue = {};
    let tempNullDataExist = false;
    if (dataType === "json") tempKeyValue = predictKeyValue;
    else if (dataType === "file") tempKeyValue = predictFilesInOrder;
    else return false;

    Object.values(tempKeyValue).map((value) => {
      if (!tempNullDataExist && (value === null || value === "")) {
        dispatch(openErrorSnackbarRequestAction(t("Please fill in all the data and proceed.")));
        tempNullDataExist = true;
      }
    });
    if (tempNullDataExist) return false;
    else return true;
  };

  const startPredict = (purchase) => {
    if (!allDataCheck("json")) return;

    setPredictResultLoading(true);
    api
      .postMarketCustomApi(predictKeyValue, purchase.marketproject)
      .then((res) => {
        setPredictResultJson(res);
        setPredictResultLoading(false);
      })
      .catch((err) => {
        console.log("err", err);
        setPredictResultLoading(false);
        dispatch(openErrorSnackbarRequestAction(t("A temporary error has occurred. Please try again.")));
      });
  };

  const startPredictWithFiles = (purchase) => {
    if (!allDataCheck("file")) return;
    let resultArr = [];
    let resultDict = predictFilesInOrder;
    Object.values(resultDict).map((value) => {
      resultArr.push(value);
    });

    setPredictResultLoading(true);
    api
      .postMarketCustomApiWithFile(resultArr, purchase.marketproject)
      .then((res) => {
        setPredictResultFile(res.data);
        const csvFile = new Blob([res.data], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(csvFile);
        link.download = user.language === "ko" ? `예측결과_${selectedPurchase.projectName}` : `predictResult_${selectedPurchase.projectName}`;
        setResultFileLink(link);
        setPredictResultLoading(false);
      })
      .catch((err) => {
        console.log("err", err);
        setPredictResultLoading(false);
        dispatch(openErrorSnackbarRequestAction(t("A temporary error has occurred. Please try again.")));
      });
  };

  const dropFiles = (file, order) => {
    let tempFileDict = predictFilesInOrder;
    tempFileDict[order] = file;
    setPredictFilesInOrder(tempFileDict);
    dispatch(openSuccessSnackbarRequestAction(t("The file(s) has been uploaded")));
  };

  const deleteFiles = (file, order) => {
    let tempFileDict = predictFilesInOrder;
    tempFileDict[order] = null;
    setPredictFilesInOrder(tempFileDict);
    dispatch(openSuccessSnackbarRequestAction(t("The file(s) has been deleted")));
  };

  const predictModalInputSection = () => {
    let tempSelected = selectedPurchase;
    let selectedKeys = Object.keys(tempSelected);
    if (!selectedKeys.length) return;
    let tempFileStructure = tempSelected.file_structure;
    let selectedFileStructureKeys = Object.keys(tempFileStructure);

    return (
      <>
        {selectedFileStructureKeys.map((header, idx) => {
          return (
            <div style={{ marginTop: "8px", display: "flex" }}>
              <GridItem xs={6} style={{ padding: "0px" }}>
                {header}
              </GridItem>
              <GridItem xs={6} style={{ padding: "0px" }}>
                {isInputFileForm ? <>{setUpDropzoneArea(tempSelected, header)}</> : <>{setUpInputArea(tempSelected, header)}</>}
              </GridItem>
            </div>
          );
        })}
      </>
    );
  };

  const setUpInputArea = (selected, header) => {
    let tempSelected = selected;
    let tempFileHeader = tempSelected.file_structure[header];
    return (
      <>
        {tempFileHeader === "boolean" ? (
          <Checkbox
            id="valueCheck"
            style={{ float: "right" }}
            onChange={() => {
              predictValueCheck(header);
            }}
          />
        ) : (
          <TextField
            id={"input_" + header}
            type={determineType(tempFileHeader)}
            inputProps={
              tempFileHeader === "float" && {
                min: "0",
                max: "1",
                step: "0.01",
              }
            }
            placeholder={user.language === "ko" ? tempFileHeader + " " + t("Enter the value.") : tempFileHeader}
            style={{ marginTop: "-3px", width: "100%" }}
            onChange={(e) => {
              predictValueInput(e.target.value, header);
            }}
          />
        )}
      </>
    );
  };

  const setUpDropzoneArea = (selected, header) => {
    let tempSelected = selected;
    let tempFileHeader = tempSelected.file_structure[header];
    let fileTypeArr = defineFileTypeOrder(tempFileHeader, "type");
    let fileOrderNum = defineFileTypeOrder(tempFileHeader, "order");
    let fileTypeArrToStr = fileTypeArr.toString();
    let isFileUploaded = false;
    let uploadedFile = predictFilesInOrder[fileOrderNum];
    let uploadedFileName = "";
    let editedFileName = "";
    if (uploadedFile) {
      isFileUploaded = true;
      uploadedFileName = uploadedFile.name;
      if (uploadedFileName.length > 15) {
        editedFileName = uploadedFileName.slice(0, 16) + "...";
      } else editedFileName = uploadedFileName;
    }
    return (
      <>
        {isFileUploaded ? (
          <div
            key={fileOrderNum}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Tooltip title={uploadedFileName} placement="bottom">
              <span style={{ fontSize: "14px" }}>{editedFileName}</span>
            </Tooltip>
            <div>
              <span style={{ fontSize: "14px", cursor: "pointer" }} onClick={(uploadedFile) => deleteFiles(uploadedFile, fileOrderNum)}>
                삭제
              </span>
            </div>
          </div>
        ) : (
          <div className="predictDropzoneContainer">
            <DropzoneArea
              id={`${tempFileHeader}_DropZone`}
              onDrop={(e) => dropFiles(e, fileOrderNum)}
              onDelete={(e) => deleteFiles(e, fileOrderNum)}
              acceptedFiles={fileTypeArr}
              showPreviews={false}
              showPreviewsInDropzone={true}
              maxFileSize={2147483648}
              dropzoneText={isFileUploaded ? <></> : <text style={{ fontSize: "12px" }}>{user.language === "ko" ? `${fileTypeArrToStr} 파일을 업로드해주세요.` : `${fileTypeArrToStr} file to upload`}</text>}
              filesLimit={1}
              // maxWidth={"xs"}
              // fullWidth={false}
              // showAlerts={false}
            />
          </div>
        )}
      </>
    );
  };

  const defineFileTypeOrder = (fileType_num, valType) => {
    let tempAccepted = [];
    let tempText = fileType_num;
    let underBarLoc = tempText.indexOf("_");

    if (valType === "type") {
      let tempType = tempText.slice(0, underBarLoc);
      tempType = `.${tempType}`;
      tempAccepted.push(tempType);
      return tempAccepted;
    } else if (valType === "order") {
      let tempOrder = parseInt(tempText.slice(-1));
      return tempOrder;
    }
  };

  const onDownloadResultFile = () => {
    let tempLink = resultFileLink;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  };

  return (
    <>
      <ReactTitle title={"DS2.AI - " + t("My Item")} />
      {isLoading ? (
        <div className={classes.loading}>
          <CircularProgress size={20} sx={{ mb: 2 }} />
          <p id="loadingText" className={classes.settingFontWhite87}>
            {t("Retrieving the list of purchases. Please wait.")}
          </p>
        </div>
      ) : (
        <>
          <Grid container justify="space-between" alignItems="center" style={{ margin: "55px 0" }}>
            <span className={classes.topTitle} style={{ margin: 0 }}>
              {t("Purchase Product List(Custom AI)")}
            </span>
            <form onSubmit={getSearchResult}>
              <InputBase
                placeholder={t("")}
                value={searchValue}
                onChange={changeSearchValue}
                multiline={false}
                id="search_file_input"
                style={{
                  width: "200px",
                  height: "32px",
                  border: "1px solid #B5C4E1",
                  color: "white",
                  fontSize: "15px",
                  paddingLeft: "5px",
                }}
              />
            </form>
          </Grid>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                {tableHeads.map((tableHead, idx) => {
                  return (
                    <TableCell id="mainHeader" key={idx} className={classes.tableHead} align="center" width={tableHead.width}>
                      <b>{t(tableHead.value)}</b>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {marketPurchaseList.map((purchase, idx) => (
                <TableRow key={purchase.id} className={classes.tableRow}>
                  <TableCell key={idx} className={classes.tableRowCell} align="center">
                    <div className={classes.wordBreakDiv}>{totalLength - (idx + 10 * pageNum)}</div>
                  </TableCell>
                  {tableBodys.map((tableBody, idx) => {
                    return (
                      <TableCell key={purchase.id} className={classes.tableRowCell} align="center">
                        <div className={classes.wordBreakDiv}>
                          {tableBody.value == "thumbnail" && <img src={purchase[tableBody.value]} style={{ width: "80px", height: "80px" }} />}
                          {t(renderTableRow(tableBody.value, purchase[tableBody.value]))}
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell className={classes.tableRowCell} align="center">
                    {purchase.service_type === "client_model" ? (
                      <Button
                        className={purchase.status === 100 ? classes.defaultGreenOutlineButton : classes.defaultDisabledButton}
                        onClick={() => {
                          openPredictModal(purchase);
                        }}
                        disabled={purchase.status !== 100}
                      >
                        {t("Predict")}
                      </Button>
                    ) : (
                      <Button
                        className={purchase.status === 100 ? classes.defaultGreenOutlineButton : classes.defaultDisabledButton}
                        onClick={() => {
                          onClickButtonAction(purchase);
                        }}
                        disabled={purchase.status !== 100}
                      >
                        {t("Start")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "15px",
            }}
          >
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={totalLength ? totalLength : 0}
              rowsPerPage={rowsPerModelPage}
              page={pageNum}
              backIconButtonProps={{
                "aria-label": "previous page",
              }}
              nextIconButtonProps={{
                "aria-label": "next page",
              }}
              onChangePage={changePage}
              onChangeRowsPerPage={changeRowsPerModelPage}
            />
          </div>
          <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={isPredictModalOpen} onClose={closePredictModal} className={classes.modalContainer}>
            <div className={classes.modalPredictContainer} style={{ maxWidth: "1000px", maxHeight: "80%" }}>
              <GridContainer>
                <GridItem xs={11} style={{ padding: "0px" }}>
                  <div className={classes.modalTitleText}>
                    <b>{selectedPurchase.name_en === "deploy" ? selectedPurchase.projectName : selectedPurchase.projectName + " " + t("Predict")}</b>
                  </div>
                </GridItem>
                <GridItem xs={1} style={{ padding: "0px" }}>
                  <CloseIcon id="closePredictModalBtn" onClick={closePredictModal} style={{ float: "right", cursor: "pointer" }} />
                </GridItem>
              </GridContainer>
              <GridContainer
                style={{
                  marginTop: "30px",
                  height: "80%",
                  overflowX: "hidden",
                  overflowY: "auto",
                }}
              >
                <GridItem xs={isInputFileForm ? 8 : 5} style={{ paddingRight: "0px" }}>
                  <div>
                    <b>{t("Input")}</b>
                  </div>
                  <GridItem style={{ marginTop: "15px" }}>{predictModalInputSection()}</GridItem>
                </GridItem>
                <GridItem xs={1} style={{ padding: "0", marginRight: "-2rem" }}>
                  <div style={{ height: "40%" }}></div>
                  <div style={{ margin: "auto" }}>
                    <ArrowForwardIosIcon style={{ fontSize: "40px" }} />
                  </div>
                </GridItem>
                <GridItem xs={isInputFileForm ? 3 : 6} style={{ paddingLeft: "0" }}>
                  <div>
                    <b>{t("Output")}</b>
                  </div>
                  <GridItem style={{ marginTop: "15px", height: "78%", width: "108%" }}>
                    {predictResultLoading ? (
                      <LinearProgress />
                    ) : (
                      <>
                        {isInputFileForm ? (
                          <>
                            {resultFileLink && (
                              <Button
                                className={classes.neoBtnH32}
                                style={{
                                  color: "white",
                                  border: "1px solid white",
                                  margin: "8px 30px",
                                }}
                                onClick={onDownloadResultFile}
                              >
                                {t("Download")}
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            {predictResultJson && Object.keys(predictResultJson)?.length ? (
                              <JSONPretty
                                id="predictResult_json"
                                data={predictResultJson.data}
                                className={classes.predictResultJson}
                                mainStyle="color:#ffffff"
                                keyStyle="color:#1BC6B4"
                                valueStyle="color:#0A84FF"
                                style={{
                                  height: "100%",
                                  maxHeight: "400px",
                                  overflowY: "scroll",
                                  padding: "10px 15px",
                                  border: "1px solid #D0D0D0",
                                  borderRadius: "4px",
                                  fontSize: "16px",
                                  lineHeight: "20px",
                                }}
                              />
                            ) : (
                              <></>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </GridItem>
                </GridItem>
              </GridContainer>
              <GridContainer
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "flex-end",
                  paddingTop: "40px",
                }}
              >
                <GridItem xs={4}></GridItem>
                <GridItem xs={4}>
                  <Button
                    id="cancelBtn"
                    className={classes.defaultF0F0OutlineButton}
                    style={{
                      width: "100%",
                      height: "35px",
                      marginRight: "20px",
                    }}
                    onClick={closePredictModal}
                  >
                    {t("Cancel")}
                  </Button>
                </GridItem>
                <GridItem xs={4}>
                  <Button
                    id="startPredictBtn"
                    className={classes.defaultGreenOutlineButton}
                    style={{ width: "100%", height: "35px" }}
                    onClick={() => {
                      isInputFileForm ? startPredictWithFiles(selectedPurchase) : startPredict(selectedPurchase);
                    }}
                  >
                    {t("Run")}
                  </Button>
                </GridItem>
              </GridContainer>
            </div>
          </Modal>
        </>
      )}
    </>
  );
}
