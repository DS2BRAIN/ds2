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
  const { user, project, model, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      project: state.project,
      model: state.model,
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
  const [categories, setCategories] = useState([]);
  const [rowsPerModelPage, setRowsPerModelPage] = useState(10);

  const isKor = i18n.language === "ko";

  const tableHeads = [
    { label: "Category", width: "15%" },
    { label: "Preview", width: "7.5%" },
    { label: "Title", width: "20%" },
    { label: "Input data content", width: "20%" },
    { label: "Output data content", width: "20%" },
    // { label: "Price", width: "11%" },
    { label: "Type", width: "10%" },
    { label: "Action", width: "7.5%" },
  ];

  const tableBodys = [
    { value: "category", label: "Category" },
    { value: "thumbnail", label: "Preview" },
    { value: isKor ? "name_kr" : "name_en", label: "Title" },
    {
      value: isKor ? "inputData_kr" : "inputData_en",
      label: "Input data content",
    },
    {
      value: isKor ? "outputData_kr" : "outputData_en",
      label: "Output data content",
    },
    // { value: "price", label: "Price" },
    { value: "type", label: "Type" },
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
    if (selectedCategory === "Select Category") {
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
    if (val.includes("name_")) {
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
      category: category === "Select Category" ? "All" : category,
    });
  };

  const changeRowsPerModelPage = (event) => {
    setIsLoading(true);
    setRowsPerModelPage(+event.target.value);
    setPageNum(1);
    getMarketModelsRequest({
      start: 1,
      count: event.target.value,
      category: category === "Select Category" ? "All" : category,
    });
  };

  const renderMarketProjects = () => {
    return (
      <>
        <div style={{ minHeight: "400px", borderBottom: "1px solid #F0F0F0" }}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead style={{ borderTop: "1px solid #F0F0F0" }}>
              <TableRow>
                {tableHeads.map((tableHead, idx) => (
                  <TableCell key={idx} className={classes.tableHeadMarketList} align="center" width={tableHead.width}>
                    {t(tableHead.label)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody id="marketTable">
              {marketModels.map((marketModel, idx) => (
                <TableRow key={idx} className={classes.tableRow}>
                  {tableBodys.map((tableBody) => (
                    <TableCell
                      key={marketModel.id}
                      className={classes.tableRowCell}
                      align="center"
                      onClick={() => {
                        goNewPage(tableBody.value, isKor ? marketModel.url : marketModel.url_en);
                      }}
                      style={{
                        cursor: !tableBody.value.includes("name_") ? "default" : "pointer",
                        padding: tableBody.value === "thumbnail" && "0 !important",
                      }}
                    >
                      <div
                        className={classes.wordBreakDiv}
                        style={{
                          textDecoration: tableBody.value.includes("name_") && "underline",
                          textUnderlinePosition: tableBody.value.includes("name_") && "under",
                          cursor: tableBody.value.includes("name_") ? "pointer" : "default",
                        }}
                      >
                        {tableBody.value === "thumbnail" ? (
                          <img src={marketModel[tableBody.value]} style={{ width: "80px", height: "80px" }} />
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
                                {marketModel.service_type ? "Service" : marketModel[tableBody.value] === "Quickstart" ? "Quick Start" : "Custom AI"}
                              </span>
                            ) : (
                              <>{tableBody.value === "category" ? t(marketModel[tableBody.value]) : isKor ? marketModel[tableBody.value] : marketModel[`${tableBody.value.split("_")[0]}_en`]}</>
                            )}
                            {tableBody.value === "price" ? t("KRW") : ""}
                          </>
                        )}
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
                  ))}
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
                        boxShadow: marketModel["type"] !== "Quickstart" && "2px 1000px 1px #161616 inset",
                      }}
                    >
                      {marketModel["service_type"] ? (
                        <span>{t("Start")}</span>
                      ) : marketModel["type"] === "Quickstart" ? (
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
    if (marketModel["service_type"]) {
      history.push(`/admin/marketNewProject?id=${marketModel["id"]}`);
    } else if (marketModel["type"] === "Quickstart") {
      await setRequestMarketModelId(marketModel.id);
      await dispatch(getMarketProjectRequestAction(marketModel.project));
      await dispatch(getMarketModelRequestAction(marketModel.id)); //id => model
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
        dispatch(openErrorSnackbarRequestAction(`${isKor ? user.maximumFileSize / 1073741824 + "GB 크기이상의 파일은 업로드 불가합니다." : `Files larger than ${user.maximumFileSize / 1073741824}GB cannot be uploaded`}`));
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
        <div className={classes.topTitle} style={{ margin: "30px 0 16px" }}>
          {t("Market Product List(Quick Start + Custom AI)")}
        </div>
        <div>
          <div style={{ fontSize: "16px" }}>
            {t("Custom AI Application process")} {" : "}
            {t("Data review for AI creation > Check availability > After the installation fee is paid, the project proceeds > Use the generated AI according to the deferred payment system")}
          </div>
          <div style={{ fontSize: "14px" }}>{t("*The amount may change depending on the size of the training data or whether it is pre-processed, and for details, it is possible to guide the progress and accurate quotation through a consultant.")}</div>
        </div>

        {!isLoading && (
          <div
            id="category_select_container"
            style={{
              margin: "50px 0 20px",
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <Select
              id="category_select"
              disabled={isLoading}
              variant="outlined"
              style={{
                height: "36px",
                color: currentThemeColor.textWhite87,
                minWidth: "200px",
                borderRadius: "0px",
                fontSize: 15,
              }}
              value={category}
              onChange={changeCategory}
            >
              <MenuItem value={"Select Category"}>{t("Select Category")}</MenuItem>
              <MenuItem value={"All"}>{t("All")}</MenuItem>
              {categories.map((category) => (
                <MenuItem value={category}>{t(category)}</MenuItem>
              ))}
            </Select>
          </div>
        )}

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
                                {t("You can only upload image files (png/jpg/jpeg), csv files, image compression files (zip).")}
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
                      placeholder={t("Ex. Among the applied label classes, car and pannel refer to cars and pedestrians, respectively.\nIf there is a part that is cut or overlapped when labeling, please label it with a full shot even if it overlaps with other objects.")}
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
                      {t("Cancel")}
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
          <ModalPage closeModal={closeModal} chosenItem={model?.externalAiType?.indexOf("image") === -1 ? "api" : "apiImage"} isMarket={true} opsId={null} csv={{}} trainingColumnInfo={{}} history={history} />
        </Modal>
      </div>
    </>
  );
}
