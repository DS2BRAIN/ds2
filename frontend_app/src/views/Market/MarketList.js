import React, { useState, useEffect } from "react";
import Modal from "@material-ui/core/Modal";
import currentTheme from "assets/jss/custom.js";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import InputBase from "@material-ui/core/InputBase";
import { currentThemeColor } from "assets/jss/custom";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Dropzone from "react-dropzone";
import { useDropzone } from "react-dropzone";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CloseIcon from "@material-ui/icons/Close";
import { NavLink } from "react-router-dom";
import Cookies from "helpers/Cookies";
import Link from "@material-ui/core/Link";
import * as api from "controller/api.js";
import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
  askGoToMainPageRequestAction,
  askChangeProjectNameRequestAction,
  askChangeProjectDescriptionRequestAction,
  askStopProjectRequestAction,
  askStartProjectRequestAction,
  setMainPageSettingRequestAction,
  setPlanModalOpenRequestAction,
  askModalRequestAction,
} from "redux/reducers/messages.js";
import TextField from "@material-ui/core/TextField";
import Pagination from "@material-ui/lab/Pagination";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { getMarketModelRequestAction, getModelRequestAction } from "../../redux/reducers/models";
import ModalPage from "components/PredictModal/ModalPage";
import { getMarketProjectRequestAction } from "../../redux/reducers/projects";
import TablePagination from "@material-ui/core/TablePagination";
import { ReactTitle } from "react-meta-tags";
import { CircularProgress } from "@mui/material";
import Button from "components/CustomButtons/Button";
import { openChat } from "components/Function/globalFunc";

export default function MarketList({ history }) {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { user, projects, models, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
      models: state.models,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );
  const regExp = /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/g;

  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState("카테고리 선택");
  const [marketModels, setMarketModels] = useState([]);
  const [totalLength, setTotalLength] = useState(0);
  const [pageNum, setPageNum] = useState(1);

  const [requestAITitle, setRequestAITitle] = useState("");
  const [requestMarketModelId, setRequestMarketModelId] = useState(null);
  const [isRequestIndustryAIModalOpen, setIsRequestIndustryAIModalOpen] = useState(false);
  const [requestContent, setRequestContent] = useState("");
  const [requestPhoneNumber, setRequestPhoneNumber] = useState("");

  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploadFileChanged, setIsUploadFileChanged] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [selectedPreviewId, setSelectedPreviewId] = useState(null);
  const [isPredictModalOpen, setIsPredictModalOpen] = useState(false);
  const [selectedMarketModel, setSelectedMarketModel] = useState(null);
  const [chosenItem, setChosenItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [rowsPerModelPage, setRowsPerModelPage] = useState(10);
  const [isKor, setIsKor] = useState(false);

  const tableHeads = [
    { value: "Category", width: "15%" },
    { value: "Preview", width: "7.5%" },
    { value: "Title", width: "20%" },
    { value: "Input data", width: "20%" },
    { value: "Output data", width: "20%" },
    // { value: "Price", width: "11%" },
    { value: "Type", width: "10%" },
    { value: "Action", width: "7.5%" },
  ];

  const tableBodys = [
    { value: "category", name: "카테고리" },
    { value: "thumbnail", name: "미리보기" },
    { value: isKor ? "name_kr" : "name_en", name: "제목" },
    {
      value: isKor ? "inputData_kr" : "inputData_en",
      name: "Input Data",
    },
    {
      value: isKor ? "outputData_kr" : "outputData_en",
      name: "Output data",
    },
    // { value: "price", name: "price" },
    { value: "type", name: "type" },
  ];

  useEffect(() => {
    setIsLoading(true);
    api
      .getMarketCategory()
      .then((res) => {
        setCategories(res.data);
      })
      .catch((e) => {
        console.log(e, "e");
      });
    getMarketModelsRequest({
      start: pageNum,
      count: rowsPerModelPage,
      category: "전체",
    });
  }, []);

  useEffect(() => {
    if (i18n?.language) {
      if (i18n.language === "ko") setIsKor(true);
      else if (i18n.language === "en") setIsKor(false);
    }
  }, [i18n?.language]);

  useEffect(() => {
    if (!isRequestIndustryAIModalOpen) {
      setIsFileUploading(false);
      setCompleted(0);
      setUploadFile(null);
      setRequestPhoneNumber("");
      setRequestContent("");
    }
  }, [isRequestIndustryAIModalOpen]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsPredictModalOpen(false);
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (completed && isFileUploading) {
      const tempCompleted = completed + 5;
      if (completed >= 95) {
        return;
      }
      if (completed < 80) {
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

  useEffect(() => {
    if (isUploadFileChanged) setIsUploadFileChanged(false);
  }, [isUploadFileChanged]);

  useEffect(() => {
    setIsUploadLoading(false);
  }, [uploadFile]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*, zip/*, video/*, csv/*",
  });

  const changeCategory = (e) => {
    const selectedCategory = e.target.value;
    if (selectedCategory === "카테고리 선택") {
      setCategory(selectedCategory);
      return;
    }
    const newPage = 1;
    setCategory(selectedCategory);
    setPageNum(newPage);
    setIsLoading(true);
    getMarketModelsRequest({
      start: newPage,
      count: rowsPerModelPage,
      category: selectedCategory,
    });
  };

  const goNewPage = (val, url) => {
    if (val === "name_kr" || val === "name_en") {
      window.open(url, "_blank");
      return;
    }
  };

  const getMarketModelsRequest = (data) => {
    api
      .getMarketModels(data)
      .then((res) => {
        setMarketModels(res.data.market_models);
        setTotalLength(res.data.total_length);
        setIsLoading(false);
      })
      .catch((e) => {
        dispatch(openErrorSnackbarRequestAction(t("A temporary error has occured. Please try again.")));
      });
  };

  const changePage = (event, page) => {
    setIsLoading(true);
    setPageNum(page + 1);
    getMarketModelsRequest({
      start: page + 1,
      count: rowsPerModelPage,
      category: category === "카테고리 선택" ? "전체" : category,
    });
  };

  const changeRowsPerModelPage = (event) => {
    setIsLoading(true);
    setRowsPerModelPage(+event.target.value);
    setPageNum(1);
    getMarketModelsRequest({
      start: 1,
      count: event.target.value,
      category: category === "카테고리 선택" ? "전체" : category,
    });
  };

  const renderMarketProjects = () => {
    return (
      <>
        <div style={{ minHeight: "400px", borderBottom: "1px solid #F0F0F0" }}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead style={{ borderTop: "1px solid #F0F0F0" }}>
              <TableRow>
                {tableHeads.map((tableHead, idx) => {
                  return (
                    <TableCell key={idx} className={classes.tableHeadMarketList} align="center" width={tableHead.width}>
                      {t(tableHead.value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody id="marketTable">
              {marketModels.map((marketModel, idx) => (
                <TableRow key={idx} className={classes.tableRow}>
                  {tableBodys.map((tableBody, idx) => {
                    return (
                      <TableCell
                        key={marketModel.id}
                        className={classes.tableRowCell}
                        align="center"
                        // onClick={() => {
                        //   goNewPage(tableBody.value, user.language == "ko" ? marketModel.url : marketModel.url_en);
                        // }}
                        style={{
                          cursor: "default",
                          padding: tableBody.value === "thumbnail" && "0 !important",
                        }}
                      >
                        <div
                          className={classes.wordBreakDiv}
                          style={{
                            textDecoration: (tableBody.value === "name_kr" || tableBody.value === "name_en") && "underline",
                            textUnderlinePosition: (tableBody.value === "name_kr" || tableBody.value === "name_en") && "under",
                            cursor: "default",
                          }}
                        >
                          <>
                            {tableBody.value === "thumbnail" ? (
                              <>
                                <img src={marketModel[tableBody.value]} style={{ width: "80px", height: "80px" }} />
                              </>
                            ) : (
                              <>
                                {tableBody.value === "type" ? (
                                  <span
                                    style={{
                                      border: "1px solid #B5C4E1",
                                      borderRadius: "28px",
                                      padding: "4px 8px",
                                    }}
                                  >
                                    {marketModel.service_type ? <>Service</> : marketModel[tableBody.value] !== "CustomAi" ? <>Quick Start</> : <>Custom AI</>}
                                  </span>
                                ) : (
                                  <>{tableBody.value == "category" ? t(marketModel[tableBody.value]) : user.language == "ko" ? marketModel[tableBody.value] : marketModel[`${tableBody.value.split("_")[0]}_en`]}</>
                                )}
                                {tableBody.value === "price" ? t("KRW") : ""}
                              </>
                            )}
                          </>
                        </div>
                        {/* {tableBody.value === "section" && (
                        <Button
                          onClick={() => {
                            window.open(marketModel.url, "_blank");
                          }}
                        >
                          상세보기
                        </Button>
                      )} */}
                      </TableCell>
                    );
                  })}
                  <TableCell className={classes.tableRowCell} align="center">
                    <Button
                      id={`${idx}_start_button`}
                      className={(classes.wordBreakDiv, classes.defaultHighlightButton)}
                      onClick={() => {
                        if (marketModel["service_type"] && marketModel["service_type"].indexOf("offline_") !== -1) {
                          dispatch(openSuccessSnackbarRequestAction(t("please contact the sales team.")));
                          openChat();
                        } else {
                          onClickButtonAction(marketModel);
                        }
                      }}
                      style={{
                        width: "auto",
                        borderRadius: "12px",
                        border: "1px solid transparent",
                        backgroundImage: "linear-gradient(94.02deg, #0A84FF 1.34%, #1BC6B4 98.21%)",
                        backgroundOrigin: "border-box",
                        boxShadow: marketModel["type"] === "CustomAi" && "2px 1000px 1px #161616 inset",
                      }}
                    >
                      {marketModel["service_type"] ? (
                        <span>{t("Start")}</span>
                      ) : marketModel["type"] !== "CustomAi" ? (
                        <span>{t("Predict")}</span>
                      ) : (
                        <span
                          id="requestBtn"
                          style={{
                            background: "linear-gradient(94.02deg, #0A84FF 1.34%, #1BC6B4 98.21%)",
                            webkitBackgroundClip: "text",
                            webkitTextFillColor: "transparent",
                          }}
                        >
                          {t("Apply")}
                        </span>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
            page={pageNum - 1}
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
      </>
    );
  };

  const onClickButtonAction = async (marketModel) => {
    await setSelectedMarketModel(null);
    await setChosenItem(null);
    console.log(marketModel);
    if (marketModel["service_type"]) {
      history.push(`/admin/marketNewProject?id=${marketModel["id"]}`);
    } else if (marketModel["type"] !== "CustomAi") {
      await setRequestMarketModelId(marketModel.id);
      await dispatch(getMarketProjectRequestAction(marketModel.project.id));
      await dispatch(getMarketModelRequestAction(marketModel.id)); //id => model
      // await setSelectedMarketModel(marketModel);
      if (models.model?.externalAiType?.indexOf("image") > -1 ) {
        await setChosenItem("apiImage");
      } else if (models.model?.externalAiType?.indexOf("audio") > -1 ) {
        await setChosenItem("ApiSpeechToText");
      } else {
        await setChosenItem("api");
      }

      await setIsPredictModalOpen(true);
    } else {
      await setRequestAITitle(isKor ? marketModel.name_kr : marketModel.name_en);
      await setRequestMarketModelId(marketModel.id); //id => model
      await setIsRequestIndustryAIModalOpen(true);
    }
  };

  const dropFiles = (files) => {
    setIsUploadLoading(true);
    const tmpFiles = [];
    for (let idx = 0; idx < files.length; idx++) {
      if (files[idx].size > user.maximumFileSize) {
        dispatch(openErrorSnackbarRequestAction(`${t(user.maximumFileSize / 1073741824 + "GB 크기이상의 파일은 업로드 불가합니다.")}`));
      } else {
        const name = files[idx].name;
        if (idx < 100 && /\.(jpg|jpeg|png|zip|csv|mp4|quicktime|mov)$/g.test(name.toLowerCase())) {
          tmpFiles.push(files[idx]);
        }
      }
    }
    if (tmpFiles.length === 0) {
      dispatch(openErrorSnackbarRequestAction(t(" Please upload file again")));
      setIsUploadLoading(false);
      return;
    }
    setUploadFile(tmpFiles);
    setIsUploadLoading(false);
    dispatch(openSuccessSnackbarRequestAction(t("The file(s) has been uploaded")));
  };

  const deleteUploadedFile = (files) => {
    const tempFiles = uploadFile;
    for (let idx = 0; idx < uploadFile.length; idx++) {
      if (uploadFile[idx].path === files) {
        tempFiles.splice(idx, 1);
      }
    }
    setUploadFile(tempFiles);
    setIsUploadFileChanged(true);
  };

  const saveFiles = async () => {
    if (!uploadFile || uploadFile.length === 0) {
      dispatch(openErrorSnackbarRequestAction(t("Upload file")));
      return;
    }
    await setIsFileUploading(true);
    await setCompleted(5);

    // await dispatch(
    //   postUploadFileRequestAction({
    //     labelprojectId: labelprojects.projectDetail.id,
    //     files: uploadFile,
    //   })
    // );
    // await dispatch(setObjectlistsSearchedValue(null));
  };

  const changeRequestPhoneNumber = (e) => {
    setRequestPhoneNumber(e.target.value);
  };

  const changeRequestContent = (e) => {
    setRequestContent(e.target.value);
  };

  const closeIsRequestIndustryAIModal = () => {
    setIsRequestIndustryAIModalOpen(false);
  };

  const postRequestMarketModelAI = () => {
    if (!uploadFile || uploadFile.length === 0) {
      dispatch(openErrorSnackbarRequestAction(t("Upload file")));
      return;
    }
    if (!requestPhoneNumber) {
      dispatch(openErrorSnackbarRequestAction(t("Please enter your mobile number.")));
      return;
    }
    if (regExp.test(requestPhoneNumber) === false) {
      dispatch(openErrorSnackbarRequestAction(t("Please enter your mobile number in the correct format.")));
      return;
    }
    setIsRequestIndustryAIModalOpen(false);
    setIsLoading(true);
    api
      .requestMarketModel(uploadFile, requestMarketModelId, requestPhoneNumber, requestContent)
      .then((res) => {
        setIsLoading(false);
        dispatch(openSuccessSnackbarRequestAction(`${t(requestAITitle)} ${t("AI application has been completed.")}`));
      })
      .catch((e) => {
        setIsLoading(false);
        dispatch(openErrorSnackbarRequestAction(t("A temporary error has occured. Please try again.")));
      });
    return;
  };

  const closeModal = () => {
    dispatch(askModalRequestAction());
  };

  return (
    <>
      <ReactTitle title={"DS2.AI - " + "AI " + t("Market")} />
      <div>
        <div className={classes.topTitle} style={{ margin: "30px 0 30px" }}>
          {t("Market Product List")}
        </div>
        <div>
        </div>

        {/*{!isLoading && (*/}
        {/*  <div*/}
        {/*    id="category_select_container"*/}
        {/*    style={{*/}
        {/*      margin: "50px 0 20px",*/}
        {/*      display: "flex",*/}
        {/*      justifyContent: "flex-start",*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <Select*/}
        {/*      id="category_select"*/}
        {/*      disabled={isLoading}*/}
        {/*      variant="outlined"*/}
        {/*      style={{*/}
        {/*        height: "36px",*/}
        {/*        color: currentThemeColor.textWhite87,*/}
        {/*        minWidth: "200px",*/}
        {/*        borderRadius: "0px",*/}
        {/*        fontSize: 15,*/}
        {/*      }}*/}
        {/*      value={category}*/}
        {/*      onChange={changeCategory}*/}
        {/*    >*/}
        {/*      <MenuItem value={"Select Category"}>{t("Select Category")}</MenuItem>*/}
        {/*      <MenuItem value={"All"}>{t("All")}</MenuItem>*/}
        {/*      {categories.map((category) => (*/}
        {/*        <MenuItem value={category}>{t(category)}</MenuItem>*/}
        {/*      ))}*/}
        {/*    </Select>*/}
        {/*  </div>*/}
        {/*)}*/}

        {isLoading ? (
          <div className={classes.smallLoading} style={{ height: 460 }}>
            <CircularProgress sx={{ mb: 3.5 }} />
            <p id="loadingText" className={classes.settingFontWhite87}>
              {t("We are retrieving the list of market products. Please wait.")}
            </p>
          </div>
        ) : marketModels.length > 0 ? (
          renderMarketProjects()
        ) : (
          <div style={{ margin: "auto" }}> {t("There is no product list.")} </div>
        )}

        <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={isRequestIndustryAIModalOpen} onClose={closeIsRequestIndustryAIModal} className={classes.modalContainer}>
          <div
            style={{
              width: "800px",
              height: "650px",
              background: "#363636",
              border: "1px solid #828282",
              borderRadius: "8px",
              padding: "40px 60px",
              overflow: "auto",
            }}
          >
            {isLoading ? (
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
                <div>
                  {t(`${requestAITitle}`)} {t("Select AI")}
                  <div style={{ margin: "30px 0" }}>
                    <span>{t("Upload training data")}</span>
                    <Dropzone onDrop={dropFiles}>
                      {({ getRootProps, getInputProps }) => (
                        <>
                          {(!uploadFile || uploadFile.length === 0) && (
                            <div {...getRootProps({ className: "dropzoneArea" })}>
                              <input {...getInputProps()} />
                              <p className={classes.settingFontWhite6}>
                                {t("Drag the file or click the box to upload it!")}
                                <br />
                                {t("이미지 파일(png/jpg/jpeg), csv파일, 이미지 압축파일(zip)만 업로드 가능합니다.")}
                                <br />
                                {t(" You are able to upload up to 100 image files. Please compress your files if you need to upload more than that")}
                                <br />
                                {t("Uploading large-size files may take more than 5 minutes")}
                              </p>
                              <CloudUploadIcon fontSize="large" />
                            </div>
                          )}
                          <aside>
                            {!isUploadLoading &&
                              (uploadFile && uploadFile.length > 0 && (
                                <>
                                  <p
                                    style={{
                                      marginTop: "10px",
                                      fontSize: "15px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      color: currentThemeColor.textWhite87,
                                    }}
                                  >
                                    <span>
                                      {t("Upload file")} : {t("총")} {uploadFile.length}
                                      {t("")}
                                    </span>
                                  </p>
                                  <ul>
                                    {uploadFile.map((file, idx) => {
                                      if (idx === 10) {
                                        return <li style={{ listStyle: "none" }}>.......</li>;
                                      }
                                      if (idx >= 10) {
                                        return null;
                                      }
                                      return (
                                        <li key={file.name}>
                                          <div className={classes.alignCenterDiv}>
                                            <div
                                              style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                color: currentThemeColor.textWhite6,
                                              }}
                                            >
                                              {file.name}
                                            </div>
                                            <CloseIcon
                                              style={{
                                                marginLeft: "10px",
                                                cursor: "pointer",
                                              }}
                                              onClick={() => {
                                                deleteUploadedFile(file.path);
                                              }}
                                            />
                                          </div>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                  <span
                                    id="uploadFileAgain"
                                    className={classes.labelUploadBtn}
                                    onClick={() => {
                                      setUploadFile(null);
                                    }}
                                  >
                                    {t("Re-upload")}
                                  </span>
                                </>
                              ))}
                          </aside>
                        </>
                      )}
                    </Dropzone>
                  </div>
                  <div>
                    <label
                      for="requestContent"
                      style={{
                        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                        fontSize: "18px",
                        display: "block",
                        marginBottom: "10px",
                      }}
                    >
                      {t("Enter the details of your request")}
                    </label>
                    <TextField
                      id="requestContent"
                      placeholder={t("ex. 신청한 라벨클래스 중 car, pannel은 각각 자동차와 보행자를 의미합니다.\n라벨링을 할 때 잘리는 부분이나 겹치는 부분이있다면 다른물체와 겹치더라도 풀 샷으로 라벨링 부탁드립니다.")}
                      style={{
                        wordBreak: "keep-all",
                        padding: "16px 26px",
                        border: "1px solid #999999",
                        color: "var(--textWhite87)",
                        height: "100px",
                        overflow: "auto",
                      }}
                      fullWidth={true}
                      value={requestContent}
                      onChange={changeRequestContent}
                      multiline={true}
                    />
                  </div>
                  <div style={{ margin: "30px 0" }}>
                    <label
                      for="requestPhoneNumber"
                      style={{
                        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                        fontSize: "18px",
                        display: "block",
                        marginBottom: "10px",
                      }}
                    >
                      {t("Enter your phone number*")}
                    </label>
                    <InputBase
                      label={t("Enter your phone number*")}
                      value={requestPhoneNumber}
                      onChange={changeRequestPhoneNumber}
                      placeholder={t("")}
                      id="requestPhoneNumber"
                      fullWidth
                      style={{
                        padding: "16px 26px",
                        border: "1px solid #999999",
                        color: "var(--textWhite87)",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button id="requestModalCancelBtn" className={classes.defaultGreenOutlineButton} onClick={closeIsRequestIndustryAIModal} style={{ marginRight: "10px" }}>
                      {t("cancel")}
                    </Button>
                    <Button id="requestModalRequestBtn" onClick={postRequestMarketModelAI} className={classes.defaultGreenOutlineButton}>
                      {t("Apply")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Modal>
        <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={isPredictModalOpen} onClose={closeModal} className={classes.modalContainer}>
          <ModalPage closeModal={closeModal} chosenItem={chosenItem} isMarket={true} opsId={null} csv={{}} trainingColumnInfo={projects?.project?.trainingColumnInfo} history={history} />
        </Modal>
      </div>
    </>
  );
}
