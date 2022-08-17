import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CSVReader, readRemoteFile } from "react-papaparse";
import Dropzone from "react-dropzone";

import { fileurl } from "controller/api";
import { askModalRequestAction, openErrorSnackbarRequestAction, openSuccessSnackbarRequestAction } from "redux/reducers/messages.js";
import { postConnectorWithFileRequestAction, stopProjectsLoadingRequestAction, deleteFilesForQuickStart } from "redux/reducers/projects.js";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button";

import { Checkbox, FormControl, FormControlLabel, InputBase, InputLabel, RadioGroup, Radio, LinearProgress, Modal, Select, TextField } from "@material-ui/core";
import { CircularProgress, Grid, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@material-ui/icons/Close";

const DataModalFileAdd = ({ isDatatypeModalOpen, setIsDatatypeModalOpen, isFileModalOpen, setIsFileModalOpen }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, projects, messages } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
      messages: state.messages,
    }),
    []
  );

  const [files, setFiles] = useState(null);
  const [datatypeCheckedId, setDatatypeCheckedId] = useState(null);
  const [datatypeDict, setDatatypeDict] = useState({});
  const [datatypeArr, setDatatypeArr] = useState([]);
  const [isAbleToSeeNextBtn, setIsAbleToSeeNextBtn] = useState(false);
  const [datatypeCheckedValue, setDatatypeCheckedValue] = useState({
    all: false,
  });
  const [previewText, setPreviewText] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dataAuthType, setDataAuthType] = useState("");
  const [columnNameList, setColumnNameList] = useState([]);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [inputSelfText, setInputSelfText] = useState("");

  const [hasLabelData, setHasLabelData] = useState(false);
  const [frameValue, setFrameValue] = useState(null);
  const [fileSizeArr, setFileSizeArr] = useState([]);
  const [isAbleToSeeEnterBtn, setIsAbleToSeeEnterBtn] = useState(false);

  const dataModalBtnStyle = { minWidth: "120px" };

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setDatatypeCheckedValue({ all: false });
      setIsDatatypeModalOpen(false);
      setIsFileModalOpen(false);
      resetDataAddSettings();
      dispatch(stopProjectsLoadingRequestAction());
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (projects.isDatasetPosted) {
      setProgress(0);
    }
  }, [projects.isDatasetPosted]);

  useEffect(() => {
    if (projects.dataconnectortype) {
      let datatypeDictRaw = {};
      let datatypeArrRaw = [];
      projects.dataconnectortype.map((dataconnector) => {
        datatypeArrRaw.push(dataconnector);
        datatypeDictRaw[dataconnector.id] = dataconnector;
      });
      setDatatypeDict(datatypeDictRaw);
      setDatatypeArr(datatypeArrRaw);
    }
  }, [projects.dataconnectortype]);

  const getfileSize = (files) => {
    let tmp = [];
    const s = ["bytes", "kB", "MB", "GB", "TB", "PB"];
    files.map((file) => {
      const e = Math.floor(Math.log(file.size) / Math.log(1024));
      tmp = [...tmp, (file.size / Math.pow(1024, e)).toFixed(2) + " " + s[e]];
    });
    setFileSizeArr(tmp);
  };

  useEffect(() => {
    if (previewText) {
      setIsPreviewLoading(false);
    }
  }, [previewText]);

  useEffect(() => {
    if (datatypeCheckedId === 2) {
      if (csvUploaded && selectedRadio) {
        setIsAbleToSeeEnterBtn(true);
      } else {
        setIsAbleToSeeEnterBtn(false);
      }
    } else {
      if (files) {
        setIsAbleToSeeEnterBtn(true);
      } else {
        setIsAbleToSeeEnterBtn(false);
      }
    }
  });

  useEffect(() => {
    const AuthTypeForCategory = {
      csv: "csv",
      zip: "zip",
      video: "video",
      mp4: "video",
      mov: "video",
      quicktime: "video",
    };

    const idForCategory = {
      csv: 2,
      zip: 3,
      video: 7,
      mp4: 7,
      mov: 7,
      quicktime: 7,
    };

    const url = window.location.href;
    if (Object.keys(datatypeDict).length > 0) {
      if (url.indexOf("?quickStart=ready") !== -1 && projects.filesForQuickStart && projects.categoryForQuickStart) {
        const category = projects.categoryForQuickStart;

        setDataAuthType(AuthTypeForCategory[category]);
        setDatatypeCheckedId(idForCategory[category]);
        if (projects.columnsForCSV) {
          setCsvUploaded(true);
          let columnList = projects.columnsForCSV;
          let refinedColumnList = deleteEmptyColumn(columnList);
          setColumnNameList(refinedColumnList);
        }
      }
    }
  }, [datatypeDict]);

  useEffect(() => {
    const url = window.location.href;
    if (url.indexOf("?quickStart=ready") !== -1 && projects.filesForQuickStart && projects.categoryForQuickStart && dataAuthType && datatypeCheckedId) {
      setIsFileModalOpen(true);
      dropFiles(projects.filesForQuickStart);
      dispatch(deleteFilesForQuickStart());
    }
  }, [dataAuthType && datatypeCheckedId]);

  const dropFiles = (files) => {
    if (!files) {
      return;
    }
    if (files?.length > 1) {
      dispatch(openErrorSnackbarRequestAction(t("Choose one file")));
      return;
    }
    let filename = files[0].name;
    let authType = datatypeDict[datatypeCheckedId].authType.toLowerCase();
    let isAuthIncluded = authType.includes("zip") || authType.includes("csv") || authType.includes("video") || authType.includes("mp4") || authType.includes("mov");

    if (dataAuthType === "video") {
      if (files[0].type.toLowerCase().indexOf(authType) === -1) {
        dispatch(openErrorSnackbarRequestAction(t(`${authType} 파일을 업로드해주세요.`)));
        return;
      }
    } else {
      if (isAuthIncluded && filename.toLowerCase().indexOf(authType) === -1) {
        setCsvUploaded(false);
        dispatch(openErrorSnackbarRequestAction(t(`${authType} 파일을 업로드해주세요.`)));
        return;
      } else if (authType.includes("csv") && filename.toLowerCase().indexOf(authType) !== -1) {
        setCsvUploaded(true);
      }
    }
    if (!isAuthIncluded && filename.toLowerCase().indexOf(".json") === -1) {
      dispatch(openErrorSnackbarRequestAction(t("Upload .json file")));
      return;
    }

    // if(files[0].size> maxFileSize){
    //   dispatch(openErrorSnackbarRequestAction(`${maxFileSize/1073741824}GB 크기이상의 파일은 업로드 불가합니다.`));
    //   return;
    // }

    setIsPreviewLoading(true);
    setFiles(files);
    getfileSize(files);
    dispatch(openSuccessSnackbarRequestAction(t("The file(s) has been uploaded")));
    setPreviewText(filename);
  };

  const prevDataconnectorModal = () => {
    setDatatypeCheckedValue({ all: false });
    setIsAbleToSeeNextBtn(false);
    setIsDatatypeModalOpen(true);
    setIsFileModalOpen(false);
    resetDataAddSettings();
  };

  const nextDataconnectorModal = async () => {
    let checkedTypeInfo = datatypeDict[datatypeCheckedId];
    let checkedTypeAuth = datatypeDict[datatypeCheckedId].authType;

    if (checkedTypeInfo) {
      if (checkedTypeAuth && (checkedTypeAuth.includes("csv") || checkedTypeAuth.includes("zip") || checkedTypeAuth.includes("video") || checkedTypeAuth.includes("mp4") || checkedTypeAuth.includes("mov"))) {
        handleChangeTab();
        setIsDatatypeModalOpen(false);
        setIsFileModalOpen(true);
      }
    }
  };

  const handleChangeTab = () => {
    resetDataAddSettings();
  };

  const closeDataconnectorModal = () => {
    setDatatypeCheckedValue({ all: false });
    setIsDatatypeModalOpen(false);
    resetDataAddSettings();
  };

  const closeFileModal = () => {
    dispatch(askModalRequestAction());
  };

  const resetDataAddSettings = () => {
    setFiles(null);
    setProgress(0);
    setFileSizeArr([]);
    setIsPreviewLoading(false);
    setPreviewText(null);
    setCsvUploaded(false);
    setColumnNameList([]);
    setSelectedRadio("");
    setSelectedColumn("");
    setInputSelfText("");
    setHasLabelData(false);
    setFrameValue(null);
    setIsAbleToSeeNextBtn(false);
  };

  const setDataconnectortypeSettings = () => {
    setDatatypeCheckedValue({ all: false });
    for (let i = 0; i < projects.dataconnectors.length; i++) {
      const value = projects.dataconnectors[i].id;
      setDatatypeCheckedValue((prevState) => {
        return { ...prevState, [value]: false };
      });
    }
  };

  const deleteFiles = () => {
    resetDataAddSettings();
    dispatch(openSuccessSnackbarRequestAction(t("The file(s) has been deleted")));
  };

  const deleteEmptyColumn = (columnList) => {
    let refinedColumnList = [];
    columnList.forEach((column) => {
      if (column) refinedColumnList.push(column);
    });
    return refinedColumnList;
  };

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const saveFiles = async () => {
    let labelDataPass = false;
    let predictColumnName = "";
    if (dataAuthType === "csv") {
      if (selectedRadio === null || selectedRadio === "") {
        dispatch(openErrorSnackbarRequestAction(t("Please select column on data settings if you want to proceed.")));
        return;
      } else if (selectedRadio === "selectColumn") {
        labelDataPass = true;
        if (selectedColumn === null || selectedColumn === "") {
          dispatch(openErrorSnackbarRequestAction(t("")));
          return;
        }
        predictColumnName = selectedColumn;
      } else if (selectedRadio === "inputSelf") {
        labelDataPass = false;
        if (inputSelfText === null || inputSelfText === "") {
          dispatch(openErrorSnackbarRequestAction(t("Please enter the result column.")));
          return;
        }
        let nameDuplicateError = false;
        columnNameList.map((column) => (column === inputSelfText ? (nameDuplicateError = true) : null));
        if (nameDuplicateError) {
          dispatch(openErrorSnackbarRequestAction(t("이미 동일한 이름의 칼럼명이 존재합니다. 새로운 칼럼명을 입력해주세요.")));
          return;
        }

        predictColumnName = inputSelfText;
      }
    } else if (dataAuthType === "zip") {
      labelDataPass = hasLabelData;
    } else if (datatypeCheckedId === 7 && frameValue === 0) {
      dispatch(openErrorSnackbarRequestAction(t("The number of frames must be between 1 and 600")));
      return;
    }

    if (
      (datatypeDict[datatypeCheckedId].authType.indexOf("csv") > -1 ||
        datatypeDict[datatypeCheckedId].authType.indexOf("zip") > -1 ||
        datatypeDict[datatypeCheckedId].authType.indexOf("video") > -1 ||
        datatypeDict[datatypeCheckedId].authType.indexOf("mp4") > -1 ||
        datatypeDict[datatypeCheckedId].authType.indexOf("mov") > -1) &&
      (!files || files.length === 0)
    ) {
      dispatch(openErrorSnackbarRequestAction(t("Upload file")));
      return;
    }

    if (
      (datatypeDict[datatypeCheckedId].authType.indexOf("csv") > -1 ||
        datatypeDict[datatypeCheckedId].authType.indexOf("zip") > -1 ||
        datatypeDict[datatypeCheckedId].authType.indexOf("video") > -1 ||
        datatypeDict[datatypeCheckedId].authType.indexOf("mp4") > -1 ||
        datatypeDict[datatypeCheckedId].authType.indexOf("mov") > -1) &&
      files
    ) {
      if (process.env.REACT_APP_ENTERPRISE !== "true") {
        if (+user.me.remainDiskUsage + user.me.usageplan.storage + +user.me.additionalDiskUsage < user.me.usageplan.storage) {
          dispatch(openErrorSnackbarRequestAction(`${t("누적 사용량이 초과하여 파일 업로드가 불가능합니다.")} ${"이용플랜을 업그레이드 후 다시 시도해주세요."}`));
          return;
        }
      }

      if (files) {
        if (datatypeCheckedId === 7) {
          let tempFrame = frameValue === null ? 60 : frameValue;
          await dispatch(
            postConnectorWithFileRequestAction({
              file: files[0],
              dataconnectorInfo: {
                dataconnectorName: encodeURIComponent(files[0].name),
                dataconnectortype: datatypeCheckedId,
                filename: encodeURIComponent(files[0].name),
                hasLabelData: labelDataPass,
                has_de_identification: false,
                predictColumnName: predictColumnName,
                frameValue: tempFrame,
              },
            })
          );
        } else {
          await dispatch(
            postConnectorWithFileRequestAction({
              file: files[0],
              dataconnectorInfo: {
                dataconnectorName: encodeURIComponent(files[0].name),
                dataconnectortype: datatypeCheckedId,
                hasLabelData: labelDataPass,
                has_de_identification: false,
                predictColumnName: predictColumnName,
                frameValue: 0,
              },
            })
          );
        }

        let sleepTime = datatypeDict[datatypeCheckedId].authType.indexOf("csv") ? 2000 : 5000;
        let oldProgress = progress;
        setProgress(oldProgress + (100 - oldProgress) / 5);
        await sleep(sleepTime);
        setProgress(oldProgress + ((100 - oldProgress) * 2) / 5);
        await sleep(sleepTime);
        setProgress(oldProgress + ((100 - oldProgress) * 3) / 5);
        await sleep(sleepTime);
        setProgress(oldProgress + ((100 - oldProgress) * 4) / 5);
        await sleep(sleepTime);
        setProgress(oldProgress + ((100 - oldProgress) * 4.5) / 5);
        await sleep(10000);
      }
    }
    setSelectedRadio("");
    setSelectedColumn("");
    setInputSelfText("");
  };

  const modalDataconnector = () => {
    const gridDataTypes = (typeArr) => {
      const onSetDatatypeCheckedValue = (value, type) => {
        if (!datatypeCheckedValue[value]) {
          setIsAbleToSeeNextBtn(true);
        } else {
          setIsAbleToSeeNextBtn(false);
        }
        setDataconnectortypeSettings();
        setDatatypeCheckedId(value);
        setDatatypeCheckedValue((prevState) => {
          return {
            ...prevState,
            [value]: !datatypeCheckedValue[value],
          };
        });
        setDataAuthType(type);
      };

      return (
        <Grid container columnSpacing={2} rowSpacing={5} sx={{ p: 4 }}>
          {typeArr.length > 0 &&
            typeArr.map((tile) => (
              <Grid item xs={4} key={`typeTile_${tile.id}`}>
                <div
                  className={classes.dataconnectorTile}
                  id={tile.dataconnectortypeName + "_container"}
                  style={{
                    border: datatypeCheckedValue[tile.id] ? "1px solid " + currentThemeColor.secondary1 : "1px solid " + currentThemeColor.background2,
                    cursor: "pointer",
                  }}
                  onClick={() => onSetDatatypeCheckedValue(tile.id, tile.authType)}
                >
                  <img
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "4px",
                    }}
                    src={process.env.REACT_APP_ENTERPRISE ? fileurl + tile.logoUrl : tile.logoUrl}
                    alt={tile.dataconnectortypeName}
                  />
                  <Grid container justifyContent="center" alignItems="center" style={{ height: "56px", color: "var(--textWhite87)" }}>
                    {t(tile.dataconnectortypeName)}
                  </Grid>
                </div>
              </Grid>
            ))}
        </Grid>
      );
    };

    return (
      <Grid id="modalDataconnectorContainer" className="dataModalContainer" justifyContent="space-between" sx={{ flexDirection: "column" }}>
        <Grid>
          <Grid container justifyContent="space-between" sx={{ p: 2 }}>
            <div className={classes.modalTitleText}>
              <b>{t("Add data - 1. Select data type")}</b>
            </div>
            <IconButton id="deleteLabelIcon" sx={{ p: 0 }} onClick={closeDataconnectorModal}>
              <CloseIcon />
            </IconButton>
          </Grid>
          {gridDataTypes(datatypeArr)}
        </Grid>
        <Grid container justifyContent="flex-end">
          <Grid sx={{ p: 2.5, mr: 1.5 }}>
            {isAbleToSeeNextBtn ? (
              <Button id="nextDataModal_btn" shape="greenOutlined" size="lg" style={dataModalBtnStyle} onClick={nextDataconnectorModal}>
                {t("Next")}
              </Button>
            ) : (
              <Button id="disabled_nextDataModal_btn" disabled size="lg" style={dataModalBtnStyle}>
                {t("Next")}
              </Button>
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const modalFileAdd = (files) => {
    const secFileUploadZone = (isCsv) => {
      const resetCsv = () => {
        if (csvUploaded) {
          return true;
        } else {
          return false;
        }
      };

      let csvFileCnt = 0;
      const handleReadCSV = (csv_string, csv_file) => {
        csvFileCnt++;
        if (csvFileCnt > 1) {
          if (csvFileCnt === 2) {
            dispatch(openErrorSnackbarRequestAction(t("Choose one file")));
          }
          return;
        } else {
          let stepNum = 0;
          readRemoteFile(csv_file, {
            step: (row) => {
              if (stepNum === 0) {
                let columnList = row.data;
                let refinedColumnList = deleteEmptyColumn(columnList);
                setColumnNameList(refinedColumnList);
              }
              stepNum += 1;
            },
          });
          dropFiles([csv_file]);
        }
      };

      const handleOnError = (err, file, inputElem, reason) => {
        const error = err;
        if (error) {
          console.log(error);
        }
      };

      const dataTypeText = (type) => {
        if (process.env.REACT_APP_ENTERPRISE === "true") {
          if (type === "csv") {
            return t("Each column requires at least 10 rows of data.") + " " + t("(Only 1 upload is allowed)");
          } else if (type === "zip") {
            return t("최소 10장 이상의 이미지가 있어야합니다. 압축된 이미지 파일은 PNG/JPG/JPEG/GIF 형식만 지원합니다. (1개만 업로드 가능)");
          } else if (type === "video") {
            return t("Only MP4 and MOV files are supported. (Only 1 upload is allowed)");
          }
        } else {
          if (type === "csv") {
            return t("Each column requires at least 10 rows of data.") + " " + t("Only CSV files of 2GB or less are supported. (Only 1 upload is allowed)");
          } else if (type === "zip") {
            return t("최소 10장 이상의 이미지가 있어야합니다. 1GB 이하의 ZIP 파일만 업로드 가능하고, 압축된 이미지 파일은 PNG/JPG/JPEG/GIF 형식만 지원합니다. (1개만 업로드 가능)");
          } else if (type === "video") {
            return t("5GB 이하의 MP4, MOV 파일만 지원합니다. (1개만 업로드 가능)");
          }
        }
      };

      return isCsv ? (
        <div className="dropzoneContainerSolidSquareBorder">
          <CSVReader isReset={resetCsv} noDrag={csvUploaded} noClick={csvUploaded} noProgressBar={csvUploaded} onFileLoad={handleReadCSV} onError={handleOnError}>
            <p
              className={classes.dropzoneText}
              style={{
                marginBottom: "10px",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              {t("Drag a file or click the button below to upload it.")}
              <br />
              {dataTypeText("csv")}
            </p>
            <Button id="data_upload_button" shape="whiteOutlinedSquare">
              {t("Find File")}
            </Button>
          </CSVReader>
        </div>
      ) : (
        <Dropzone onDrop={dropFiles}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div
                {...getRootProps({
                  className: "dropzoneSolidSquareBorder",
                })}
              >
                <input {...getInputProps()} />
                <p
                  className={classes.dropzoneText}
                  style={{
                    marginBottom: "10px",
                    textAlign: "center",
                    fontSize: "14px",
                  }}
                >
                  {t("Drag a file or click the button below to upload it.")}
                  <br />
                  {dataTypeText(dataAuthType)}
                </p>
                <span
                  id="data_upload_button"
                  style={{
                    display: "inline-block",
                    cursor: "pointer",
                    color: "#F0F0F0",
                    width: "auto",
                    border: "1px solid #F0F0F0",
                    padding: "4px 16px",
                    margin: "4px 0",
                    fontSize: "15px",
                    fontWeight: 600,
                    borderRadius: "4px",
                  }}
                >
                  {t("Find File")}
                </span>
              </div>
            </section>
          )}
        </Dropzone>
      );
    };

    const secUploadedFile = (files) => {
      const getImage = (dataAuthType) => {
        const CSV = fileurl + "asset/front/img/csv.png";
        const Video = fileurl + "asset/front/img/video.png";
        const ZIP = fileurl + "asset/front/img/zip.png";

        switch (dataAuthType) {
          case "csv":
            return CSV;
          case "video":
            return Video;
          case "zip":
            return ZIP;
        }
      };

      return Boolean(files) ? (
        files.map((file, idx) => (
          <div
            key={idx}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex" }}>
              <img
                style={{
                  width: "55px",
                  height: "60px",
                }}
                src={getImage(dataAuthType)}
              />
              <div
                id="uploadedFileInfo"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                  marginLeft: "15px",
                }}
              >
                <span>{file.name}</span>
                <span>{fileSizeArr[idx]}</span>
              </div>
            </div>
            <div style={{ display: "table" }}>
              <span
                id="deleteFilesBtn"
                style={{
                  cursor: "pointer",
                  textUnderlinePosition: "under",
                  textDecoration: "underline",
                  display: "table-cell",
                  verticalAlign: "middle",
                  fontSize: "14px",
                }}
                onClick={() => deleteFiles()}
              >
                {t("Delete")}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div
          id="informText"
          className={classes.text87}
          style={{
            fontSize: "15px",
          }}
        >
          {t("No file has been uploaded.")} <br />
        </div>
      );
    };

    const secDataSetting = (type) => {
      const csvSetTargetColumn = () => {
        const handleHeaderRadio = (e) => {
          e.preventDefault();
          let tempSelected = e.target.value;
          if (tempSelected === "selectColumn") {
            setSelectedColumn(columnNameList[0]);
          } else {
            setSelectedColumn("");
          }
          setSelectedRadio(tempSelected);
        };

        const radioSelectColumn = (isColumnNameExist) => (
          <>
            <FormControlLabel id="selectColumnRadio" value="selectColumn" label={t("Select result column")} disabled={!isColumnNameExist} control={<Radio color="primary" />} style={{ marginTop: "-10px" }} />
            <FormControl variant="outlined" style={{ margin: "-10px 0 10px 0" }}>
              {csvUploaded && selectedRadio === "selectColumn" ? (
                <>
                  <InputLabel htmlFor="outlined-column-native-simple" style={{ color: "#D0D0D0", marginBottom: "10px" }}>
                    {t("Item")}
                  </InputLabel>
                  <Select
                    id="selectColumnTag"
                    className="selectColumn"
                    native
                    label={t("Item")}
                    style={{ color: "#D0D0D0", borderRadius: "0px" }}
                    onChange={(e) => {
                      e.preventDefault();
                      if (e.target.value) setSelectedColumn(e.target.value);
                    }}
                  >
                    {isColumnNameExist
                      ? columnNameList.map((colName) => (
                          <option
                            key={"option_" + colName}
                            id={"option_" + colName}
                            value={colName}
                            style={{
                              fontSize: "18px",
                              background: "#212121",
                            }}
                          >
                            {colName}
                          </option>
                        ))
                      : null}
                  </Select>
                </>
              ) : (
                <>
                  <InputLabel htmlFor="outlined-column-native-simple" style={{ color: "darkgray", padding: "0" }}>
                    {t("Item")}
                  </InputLabel>
                  <Select className="selectColumn" disabled label={t("Item")}></Select>
                </>
              )}
            </FormControl>
          </>
        );

        const radioInputSelf = () => (
          <>
            <FormControlLabel id="inputColumnRadio" value="inputSelf" label={t("Direct column name input")} disabled={!csvUploaded} control={<Radio color="primary" />} />
            <form noValidate autoComplete="off" style={{ color: "#D0D0D0", margin: "-10px 0 -10px 0" }}>
              {csvUploaded && selectedRadio === "inputSelf" ? (
                <input
                  id="input_self"
                  placeholder={t("Column Name")}
                  type="search"
                  style={{
                    width: "100%",
                    padding: "10px 10px",
                    background: "none",
                    border: "1px solid #D0D0D0",
                    borderRadius: "4px",
                    color: "#D0D0D0",
                    fontSize: "1rem",
                  }}
                  onChange={(e) => {
                    e.preventDefault();
                    setInputSelfText(e.target.value);
                  }}
                />
              ) : (
                <input
                  disabled
                  placeholder={t("Column Name")}
                  type="search"
                  style={{
                    width: "100%",
                    padding: "10px 10px",
                    background: "none",
                    border: "1px solid #D0D0D0",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                />
              )}
            </form>
          </>
        );

        return (
          <GridItem style={{ width: "100%", padding: "0" }}>
            <RadioGroup disabled={!csvUploaded} aria-label="csv_set_option" onChange={handleHeaderRadio} value={selectedRadio}>
              {radioSelectColumn(Object.keys(columnNameList).length > 0)}
              {radioInputSelf()}
            </RadioGroup>
          </GridItem>
        );
      };

      const zipSetLabelData = () => (
        <>
          <FormControlLabel
            id="zipLabellingCheckbox"
            className="dataUploadModalCheckLabel"
            style={{
              color: currentThemeColor.textWhite87,
              fontSize: "14px",
            }}
            control={<Checkbox id="label_data_chkbox" value={hasLabelData} checked={hasLabelData} onChange={() => setHasLabelData(!hasLabelData)} color="primary" style={{ marginRight: "10px" }} />}
            label={t("Include labeling data in compressed file")}
          />
        </>
      );

      const videoSetLabelData = () => {
        const handleFrameValue = (e) => {
          let tempFrame = e.target.value;
          if (isFinite(tempFrame)) {
            if (tempFrame > 600) {
              setFrameValue(600);
            } else if (tempFrame < 0) {
              setFrameValue(0);
            } else {
              setFrameValue(tempFrame);
            }
          } else {
            setFrameValue(60);
          }
        };

        return (
          <>
            <InputLabel id="frameValue_label" style={{ margin: "10px 0 15px 0", color: "white" }}>
              {t("Frame Value")}
            </InputLabel>
            <InputBase
              required
              id="frameValue"
              variant="outlined"
              placeholder={t("1 ~ 600 사이의 분당 프레임 값을 입력해주세요(기본값: 60)")}
              fullWidth
              label={t("Frame Value")}
              name="frameValue"
              type="text"
              onChange={handleFrameValue}
              value={frameValue}
              style={{
                padding: "5px 10px 5px 10px",
                border: "1px solid #D0D0D0",
                borderRadius: "4px",
                color: "#D0D0D0",
              }}
            />
          </>
        );
      };

      if (type === "csv") return csvSetTargetColumn();
      else if (type === "zip") return zipSetLabelData();
      else if (type === "video") return videoSetLabelData();
    };

    return (
      <Grid id="modalDataconnectorContainer" className="dataModalContainer" justifyContent="space-between" sx={{ flexDirection: "column" }}>
        <div>
          <Grid container justifyContent="space-between" sx={{ p: 2.5 }}>
            <div className={classes.modalTitleText}>
              <b>{t("Adding data - 2. Uploading and setting data")}</b>
            </div>
            <IconButton id="closeDataUploadModal" onClick={closeFileModal} sx={{ p: 0 }}>
              <CloseIcon />
            </IconButton>
          </Grid>
          <Grid sx={{ maxWidth: "680px", mx: "auto", p: 2 }}>
            <Grid
              sx={{
                p: 3,
                borderBottom: "1px solid #D0D0D0",
              }}
            >
              {isPreviewLoading ? (
                <div>
                  <CircularProgress size={20} />
                  <b className={classes.text87}>{t("Uploading file. Please wait a moment.")}</b>
                </div>
              ) : files ? null : (
                secFileUploadZone(datatypeDict[datatypeCheckedId] && datatypeDict[datatypeCheckedId].authType === "csv")
              )}
            </Grid>
            <Grid sx={{ px: 2, py: 3, borderBottom: "1px solid #D0D0D0" }}>
              <b style={{ fontSize: "16px" }}>{t("Uploaded File")}</b>
              <Grid sx={{ p: 2 }}>{secUploadedFile(files)}</Grid>
            </Grid>
            <Grid sx={{ px: 2, py: 3 }}>
              <b style={{ fontSize: "16px" }}>{t("Data Settings")}</b>
              <Grid sx={{ p: 2 }}>{secDataSetting(dataAuthType)}</Grid>
            </Grid>
          </Grid>
        </div>
        <Grid container justifyContent="flex-end" sx={{ p: 2.5 }}>
          <Grid className="flex" sx={{ mr: 2.5 }}>
            <Button id="previousDataconnectorModal" shape="whiteOutlined" size="lg" sx={{ mr: 2 }} style={dataModalBtnStyle} onClick={prevDataconnectorModal}>
              {t("Previous")}
            </Button>
            {isAbleToSeeEnterBtn ? (
              <Button id="startSaveFilesBtn" shape="greenOutlined" size="lg" style={dataModalBtnStyle} onClick={saveFiles}>
                {t("Confirm")}
              </Button>
            ) : (
              <Tooltip title={<span style={{ fontSize: "14px" }}>{files === null ? t("Please upload the file and proceed") : csvUploaded && selectedRadio === "" ? t("칼럼명을 지정해야 합니다. 데이터 설정을 진행해주세요.") : null}</span>} placement="top">
                <div>
                  <Button id="nextDataconnectorModal" size="lg" disabled style={dataModalBtnStyle}>
                    {t("Confirm")}
                  </Button>
                </div>
              </Tooltip>
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  };

  return (
    <>
      <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={isDatatypeModalOpen} onClose={closeDataconnectorModal} className={classes.modalContainer}>
        {projects.isDatasetLoading ? (
          <div className={classes.modalLoading}>
            <LinearProgress />
            <b style={{ alignSelf: "center" }}>{t("Please wait a moment.")}</b>
          </div>
        ) : (
          modalDataconnector()
        )}
      </Modal>
      <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={isFileModalOpen} onClose={closeFileModal} className={classes.modalContainer}>
        {projects.isDatasetLoading ? (
          <div className={classes.modalLoading}>
            <LinearProgress variant="determinate" value={progress} />
            <b style={{ alignSelf: "center" }}>{t("Please wait a moment.")}</b>
          </div>
        ) : (
          modalFileAdd(files)
        )}
      </Modal>
    </>
  );
};

export default DataModalFileAdd;
