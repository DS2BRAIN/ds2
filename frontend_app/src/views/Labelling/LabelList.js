import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";
import axios from "axios";
import Dropzone, { useDropzone } from "react-dropzone";

import Cookies from "helpers/Cookies";
import * as api from "controller/labelApi.js";
import { fileurl } from "controller/api";
import {
  askModalRequestAction,
  openErrorSnackbarRequestAction,
  askDeleteObjectListsReqeustAction,
} from "redux/reducers/messages.js";
import {
  getObjectListsRequestAction,
  postUploadFileRequestAction,
  setObjectlistsPage,
  setObjectlistsRows,
  setObjectlistsSearchedValue,
  setObjectlistsValueForAsignee,
  setIsPreviewOpened,
  setIsPreviewClosed,
  stopLabelProjectsLoadingRequestAction,
  setObjectlistsSortingValue,
  setObjectlistsIsDesc,
  setObjectlistsValueForStatus,
  setIsProjectRefreshed,
} from "redux/reducers/labelprojects.js";
import { getLabelAppUrl } from "components/Function/globalFunc";
import { IS_DEPLOY, IS_ENTERPRISE } from "variables/common.js";

import {
  Checkbox,
  Container,
  InputBase,
  InputLabel,
  LinearProgress,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
} from "@material-ui/core";
import { CircularProgress, Grid } from "@mui/material";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CloseIcon from "@material-ui/icons/Close";

import "assets/css/material-control.css";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button";
import LabelPreview from "./LabelPreview.js";

const LabelList = ({
  history,
  onSetSelectedPage,
  labelProjectId,
  labelChart,
}) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );
  const { t, i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [projectCheckedValue, setProjectCheckedValue] = useState({
    all: false,
  });
  const [anchorElForOption, setAnchorElForOption] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [openFileModal, setOpenFileModal] = useState(false);

  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploadFileChanged, setIsUploadFileChanged] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [selectedPreviewId, setSelectedPreviewId] = useState(null);
  const [shouldUpdateFrame, setShouldUpdateFrame] = useState(false);
  const [frameValue, setFrameValue] = useState(null);
  const [csvColumns, setCsvColumns] = useState(null);
  const [predictVal, setPredictVal] = useState("");
  const [isDeIdentificationChecked, setIsDeIdentificationChecked] = useState(
    false
  );
  const [clientIp, setClientIp] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*, zip/*",
  });
  const [searchedValue, setSearchedValue] = useState("");
  const [isSearchValSubmitted, setIsSearchValSubmitted] = useState(false);
  const [valueForStatus, setValueForStatus] = useState("all");
  const [valueForAssignee, setValueForAssignee] = useState("all");

  useEffect(() => {
    setIsLoading(labelprojects.isLoading);
  }, [labelprojects.isLoading]);

  const statusValue = {
    prepare: "In queue",
    working: "In process",
    review: "Under review",
    ready: "Autolabeling",
    reject: "Reject",
    done: "Completed",
    all: "All",
  };

  const routes = {
    voice: "lv",
    normal_classification: "ls",
    normal_regression: "ls",
    text: "ln",
    image: "li",
  };

  const FileTypeByworkapp = {
    normal_classification: "csv",
    normal_regression: "csv",
    text: "csv",
    image: "image",
    object_detection: "image",
  };

  useEffect(() => {
    setShouldUpdateFrame(false);
    dispatch(setIsPreviewClosed());
  }, []);

  const workapp = labelprojects.projectDetail.workapp;
  const initialPaginationCondition = {
    sorting: labelChart.review ? "status" : "id",
    count: 10,
    page: 0,
    isDesc:
      Boolean(labelChart.review) ||
      (workapp !== "object_detection" && workapp !== "image"),
    labelprojectId: labelProjectId,
    tab: "all",
    workAssignee: "all",
    workapp: workapp,
  };

  useEffect(() => {
    if (labelprojects.isProjectRefreshed) {
      dispatch(getObjectListsRequestAction(initialPaginationCondition));
      dispatch(setIsProjectRefreshed(false));
    }
  }, [labelprojects.isProjectRefreshed]);

  useEffect(() => {
    if (
      labelprojects.projectDetail &&
      (!labelprojects.objectLists ||
        labelprojects.objectLists?.[0]?.labelproject !==
          parseInt(labelProjectId))
    ) {
      let workAssignee =
        user.me?.id === parseInt(labelprojects.projectDetail.user)
          ? "all"
          : user.me?.email;

      dispatch(setObjectlistsValueForAsignee(workAssignee));
      dispatch(getObjectListsRequestAction(initialPaginationCondition));
    }
  }, [labelprojects.projectDetail]);

  useEffect(() => {
    (async () => {
      if (labelprojects.objectLists) {
        if (
          labelprojects.objectLists.length > 0 &&
          FileTypeByworkapp[labelprojects.projectDetail.workapp] === "csv"
        ) {
          const tmp = Object.keys(labelprojects.objectLists[0]);
          if (tmp.indexOf("rawData") > -1 && tmp.indexOf("labelData") > -1) {
            let columns = Object.keys(labelprojects.objectLists[0].rawData);
            if (labelprojects.objectLists[0].labelData) {
              const predictValue = Object.keys(
                labelprojects.objectLists[0].labelData
              );
              setPredictVal(predictValue);
            }
            setCsvColumns(columns);
          }
        }
        await setProjectSettings();
      }
    })();
  }, [labelprojects.objectLists]);

  useEffect(() => {
    if (labelprojects.isPostSuccess) {
      dispatch(
        getObjectListsRequestAction({
          sorting: labelprojects.sortingValue,
          count: labelprojects.projectRowsPerPage,
          page: 0,
          labelprojectId: labelprojects.projectDetail.id,
          tab: labelprojects.valueForStatus,
          isDesc: labelprojects.isSortDesc,
          searching: isSearchValSubmitted ? labelprojects.searchedValue : null,
          workAssignee: labelprojects.valueForAsingee,
          workapp: labelprojects.projectDetail.workapp,
        })
      );
    }
  }, [labelprojects.isPostSuccess]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsFileUploading(false);
      setCompleted(0);
      setUploadFile(null);
      setOpenFileModal(false);
      setIsLoading(false);
      setIsDeIdentificationChecked(false);
      dispatch(stopLabelProjectsLoadingRequestAction());
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
    if (!uploadFile || uploadFile.length === 0) {
      setShouldUpdateFrame(false);
    }
  }, [uploadFile]);

  const setProjectSettings = () => {
    setProjectCheckedValue({ all: false });
    for (let i = 0; i < labelprojects.objectLists.length; i++) {
      const value = labelprojects.objectLists[i].id;
      setProjectCheckedValue((prevState) => {
        return { ...prevState, [value]: false };
      });
    }
  };

  const onSetProjectCheckedValue = (value) => {
    Object.values(projectCheckedValue);
    setProjectCheckedValue((prevState) => {
      return { ...prevState, all: false, [value]: !projectCheckedValue[value] };
    });
  };

  const onSetProjectCheckedValueAll = () => {
    const result = projectCheckedValue["all"] ? false : true;
    const tmpObject = { all: result };
    for (let i = 0; i < labelprojects.objectLists.length; i++) {
      const id = labelprojects.objectLists[i].id;
      tmpObject[id] = result;
    }
    setProjectCheckedValue(tmpObject);
  };

  const onSetSortValue = async (value) => {
    dispatch(setIsPreviewClosed());
    await setIsLoading(true);
    if (value === labelprojects.sortingValue) {
      let tempIsSortDesc = labelprojects.isSortDesc;
      dispatch(setObjectlistsIsDesc(!tempIsSortDesc));
      dispatch(setObjectlistsPage(0));
      dispatch(
        getObjectListsRequestAction({
          sorting: value,
          count: labelprojects.projectRowsPerPage,
          page: 0,
          labelprojectId: labelprojects.projectDetail.id,
          tab: labelprojects.valueForStatus,
          isDesc: !tempIsSortDesc,
          searching: isSearchValSubmitted ? labelprojects.searchedValue : null,
          workAssignee: labelprojects.valueForAsingee,
          workapp: labelprojects.projectDetail.workapp,
        })
      );
    } else {
      dispatch(setObjectlistsIsDesc(true));
      dispatch(setObjectlistsSortingValue(value));
      dispatch(setObjectlistsPage(0));
      dispatch(
        getObjectListsRequestAction({
          sorting: value,
          count: labelprojects.projectRowsPerPage,
          page: 0,
          labelprojectId: labelprojects.projectDetail.id,
          tab: labelprojects.valueForStatus,
          isDesc: true,
          searching: isSearchValSubmitted ? labelprojects.searchedValue : null,
          workAssignee: labelprojects.valueForAsingee,
          workapp: labelprojects.projectDetail.workapp,
        })
      );
    }
  };

  const handleProjectChangePage = (event, newPage) => {
    dispatch(setIsPreviewClosed());
    setIsLoading(true);
    dispatch(setObjectlistsPage(newPage));
    dispatch(
      getObjectListsRequestAction({
        sorting: labelprojects.sortingValue,
        count: labelprojects.projectRowsPerPage,
        page: newPage,
        labelprojectId: labelprojects.projectDetail.id,
        tab: labelprojects.valueForStatus,
        isDesc: labelprojects.isSortDesc,
        searching: isSearchValSubmitted ? labelprojects.searchedValue : null,
        workAssignee: labelprojects.valueForAsingee,
        workapp: labelprojects.projectDetail.workapp,
      })
    );
  };

  const handleChangeProjectRowsPerPage = (event) => {
    dispatch(setIsPreviewClosed());
    setIsLoading(true);
    dispatch(setObjectlistsRows(+event.target.value));
    dispatch(setObjectlistsPage(0));
    dispatch(
      getObjectListsRequestAction({
        sorting: labelprojects.sortingValue,
        count: event.target.value,
        page: 0,
        labelprojectId: labelprojects.projectDetail.id,
        tab: labelprojects.valueForStatus,
        isDesc: labelprojects.isSortDesc,
        searching: isSearchValSubmitted ? labelprojects.searchedValue : null,
        workAssignee: labelprojects.valueForAsingee,
        workapp: labelprojects.projectDetail.workapp,
      })
    );
  };

  const goProjectDetail = async (id) => {
    await setSelectedPreviewId(id);
    await setIsPreviewModalOpen(true);
    await dispatch(setIsPreviewOpened());
  };

  const handleClickForOption = (event) => {
    setAnchorElForOption(event.currentTarget);
  };

  const handleCloseForOption = () => {
    setAnchorElForOption(null);
  };

  const getIpClient = async () => {
    try {
      const response = await axios.get("https://extreme-ip-lookup.com/json");
      const ip = response.data.query;

      setClientIp(ip);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getIpClient();
  }, []);

  const goToLabellingPage = () => {
    let id = "";
    let isAbleToProceed = true;
    const category = labelprojects.projectDetail.workapp;
    const labelClasses = labelprojects.projectDetail.labelclasses;
    const token = Cookies.getCookie("jwt");

    let tempLabellingUrl = getLabelAppUrl(category);

    for (let value in projectCheckedValue) {
      if (value !== "all" && projectCheckedValue[value]) {
        id = value;
      }
    }

    let labelStatus = "";
    labelprojects.objectLists.forEach((data) => {
      if (data.id === id) {
        labelStatus = data.status === "working" ? "prepare" : data.status;
        if (
          (data.status === "done" || data.status === "working") &&
          data.workAssignee !== user.me.email &&
          labelprojects.role !== "subadmin"
        ) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("You cannot label a file started by another user.")
            )
          );
          isAbleToProceed = false;
          return;
        }
        if (data.status === "ready") {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "You cannot edit the labeling of files that are training auto-labeling."
              )
            )
          );
          return;
        }
        if (!data.status || data.status.length === 0) {
          api.setObjectStatus(id).catch((e) => {
            if (!IS_DEPLOY) console.log(e);
          });
        }
      }
    });
    if (!isAbleToProceed) return;
    if (category) {
      if (category === "normal_regression") {
        window.open(
          `${tempLabellingUrl}admin/${routes[category]}/${
            labelprojects.projectDetail.id
          }/${id}/?token=${token}&start=true&appStatus=${labelStatus}&timeStamp=${Date.now()}`,
          "_blank"
        );
      } else {
        if (!labelClasses || labelClasses.length === 0) {
          if (
            labelprojects.projectDetail &&
            labelprojects.projectDetail.isShared
          ) {
            dispatch(
              openErrorSnackbarRequestAction(
                t(
                  "Labeling cannot proceed because there is no registered class. Register a class through the group leader."
                )
              )
            );
            return;
          } else if (
            labelprojects.projectDetail &&
            !labelprojects.projectDetail.isShared
          ) {
            dispatch(
              openErrorSnackbarRequestAction(
                t(
                  "You can view the label list after registering at least one label class"
                )
              )
            );
            onSetSelectedPage("class");
            history.push(
              `/admin/labelling/${labelprojects.projectDetail.id}?class_required=true`
            );

            return;
          }
          if (user.me && user.me.isAiTrainer) {
            dispatch(
              openErrorSnackbarRequestAction(
                t(
                  "Labeling cannot proceed because there is no registered class. Please contact us for further information."
                )
              )
            );
            return;
          }
        } else {
          if (category !== "object_detection") {
            window.open(
              `${tempLabellingUrl}admin/${routes[category]}/${
                labelprojects.projectDetail.id
              }/${id}/?token=${token}&start=true&appStatus=${labelStatus}&timeStamp=${Date.now()}`,
              "_blank"
            );
          } else {
            window.open(
              `${tempLabellingUrl}${
                labelprojects.projectDetail.id
              }/${id}/?token=${token}&start=true&appStatus=${labelStatus}&timeStamp=${Date.now()}`,
              "_blank"
            );
          }
        }
      }
    }
  };

  const onOpenPreviewModal = () => {
    for (let value in projectCheckedValue) {
      if (value !== "all" && projectCheckedValue[value]) {
        setSelectedPreviewId(value);
        setIsPreviewModalOpen(true);
        dispatch(setIsPreviewOpened());
      }
    }
  };

  const renderMenuButton = () => {
    let count = 0;
    for (let value in projectCheckedValue) {
      if (projectCheckedValue[value] && value !== "all") count++;
    }
    let projectDetail = labelprojects.projectDetail;
    if (projectDetail.isShared) {
      return (
        <div>
          {count === 1 &&
            (projectDetail.workapp === "object_detection" ||
              projectDetail.workapp === "image") && (
              <Button
                aria-controls="customized-menu"
                aria-haspopup="true"
                id="previewBtn"
                shape="greenOutlined"
                sx={{ mr: 1 }}
                onClick={onOpenPreviewModal}
              >
                {t("Preview")}
              </Button>
            )}
          {count === 1 && (
            <Button
              aria-controls="customized-menu"
              aria-haspopup="true"
              id="startLabelBtn"
              shape="greenOutlined"
              onClick={goToLabellingPage}
            >
              {t("Start labeling")}
            </Button>
          )}
        </div>
      );
    }
    return (
      <>
        <Button
          aria-controls="customized-menu"
          aria-haspopup="true"
          id="add_label_file_btn"
          shape="greenOutlined"
          sx={{ mr: 1 }}
          onClick={() => {
            setOpenFileModal(true);
          }}
        >
          {t("Add Files")}
        </Button>
        {count === 1 && (
          <Button
            aria-controls="customized-menu"
            aria-haspopup="true"
            id="startLabelBtn"
            shape="greenOutlined"
            onClick={goToLabellingPage}
          >
            {t("Start labeling")}
          </Button>
        )}

        <Menu
          id="addPopup"
          anchorEl={anchorElForOption}
          keepMounted
          open={Boolean(anchorElForOption)}
          onClose={handleCloseForOption}
        >
          {count > 0 && (
            <>
              <MenuItem id="deleteMenu" onClick={onDeleteObjectLists}>
                <DeleteForeverIcon fontSize="small" />
                <ListItemText
                  primary={t("Delete")}
                  style={{ marginLeft: "10px" }}
                />
              </MenuItem>
            </>
          )}
        </Menu>
      </>
    );
  };

  const onDeleteObjectLists = async () => {
    const deleteFilesArr = [];
    for (let file in projectCheckedValue) {
      if (file !== "all" && projectCheckedValue[file])
        deleteFilesArr.push(file);
    }
    if (deleteFilesArr.length > 0) {
      await handleCloseForOption();
      const sortingInfo = {
        sorting: labelprojects.sortingValue,
        count: labelprojects.projectRowsPerPage,
        page: labelprojects.projectPage,
        labelprojectId: labelprojects.projectDetail.id,
        tab: labelprojects.valueForStatus,
        isDesc: labelprojects.isSortDesc,
        workAssignee: labelprojects.valueForAsingee,
      };
      await dispatch(
        askDeleteObjectListsReqeustAction({
          sortingInfo: sortingInfo,
          file: deleteFilesArr,
        })
      );
      await dispatch(setObjectlistsSearchedValue(null));
    } else {
      dispatch(
        openErrorSnackbarRequestAction(t("Please select a file to delete."))
      );
    }
  };

  const closeFileModal = () => {
    dispatch(askModalRequestAction());
  };

  const dropFiles = (files) => {
    setIsUploadLoading(true);
    const tmpFiles = [];
    let maximum = user.maximumFileSize;
    for (let idx = 0; idx < files.length; idx++) {
      if (files[idx].size > maximum) {
        dispatch(
          openErrorSnackbarRequestAction(
            t(
              `${
                i18n.language === "ko"
                  ? maximum / 1073741824 +
                    "GB 크기이상의 파일은 업로드 불가합니다."
                  : `Files larger than ${maximum /
                      1073741824}GB cannot be uploaded`
              }`
            )
          )
        );
      } else {
        const name = files[idx].name;
        if (
          labelprojects.projectDetail.workapp === "object_detection" ||
          labelprojects.projectDetail.workapp === "image"
        ) {
          if (
            idx < 100 &&
            /\.(jpg|jpeg|png|zip|mp4|quicktime|mov)$/g.test(name.toLowerCase())
          ) {
            tmpFiles.push(files[idx]);
          }
          if (
            files[idx].type === "video/mp4" ||
            files[idx].type === "video/quicktime" ||
            files[idx].type === "video/mov"
          ) {
            setShouldUpdateFrame(true);
            maximum = 5000000000;
          }
        } else {
          if (idx < 1 && /\.(csv)$/g.test(name.toLowerCase())) {
            tmpFiles.push(files[idx]);
          }
        }
      }
    }
    if (tmpFiles.length === 0) {
      dispatch(openErrorSnackbarRequestAction(t("Please upload file again")));
      setIsUploadLoading(false);
      return;
    }
    setUploadFile(tmpFiles);
    setIsUploadLoading(false);
  };

  const deleteUploadedFile = useCallback(
    (files) => {
      const tempFiles = [...uploadFile];
      for (let idx = 0; idx < uploadFile.length; idx++) {
        if (uploadFile[idx].path === files) {
          tempFiles.splice(idx, 1);
        }
      }

      setUploadFile(tempFiles);
      setIsUploadFileChanged(true);
      let flag = true;
      tempFiles.map((tempFile) => {
        const name = tempFile.name;
        if (/\.(mp4|quicktime|mov)$/g.test(name.toLowerCase())) {
          flag = false;
        }
      });
      if (tempFiles.length === 0 || flag) {
        setShouldUpdateFrame(false);
      }
    },
    [uploadFile, setUploadFile, setIsUploadFileChanged]
  );

  const getS3key = (key) => {
    if (key) {
      // const keyArr = key.split("/");
      // let parseUrl = "";
      // keyArr.forEach((key) => {
      //   parseUrl += encodeURIComponent(key) + "/";
      // });
      // const newKey = key.split(".com/")[1];
      // parseUrl = encodeURI(parseUrl);
      return IS_ENTERPRISE && key.indexOf("http") === -1
        ? `${fileurl}static${key}`
        : key;
      // return key;
    }
  };
  const saveFiles = async () => {
    if (!uploadFile || uploadFile.length === 0) {
      openErrorSnackbarRequestAction(t("Upload file"));
      return;
    }
    if (shouldUpdateFrame && !frameValue) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("You must enter frames per minute to upload a video file.")
        )
      );
      return;
    }
    if (frameValue !== null && (frameValue < 1 || frameValue > 600)) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("The number of frames must be between 1 and 600")
        )
      );
      return;
    }
    await setIsFileUploading(true);
    await setCompleted(5);
    await setIsLoading(true);
    await dispatch(
      postUploadFileRequestAction({
        labelprojectId: labelprojects.projectDetail.id,
        files: uploadFile,
        has_de_identification: isDeIdentificationChecked,
        frameValue: Number(frameValue),
      })
    );
    await setIsFileUploading(false);
    await dispatch(setObjectlistsSearchedValue(null));
    await setOpenFileModal(false);
    await setUploadFile(null);
  };

  const handleFrameValue = (e) => {
    const frame = e.target.value;
    setFrameValue(frame);
  };

  const onClosePreviewModal = () => {
    setIsPreviewModalOpen(false);
  };

  const onChangeSearchedValue = async (e) => {
    e.preventDefault();
    const value = e.target.value;

    setSearchedValue(value);
    dispatch(setIsPreviewClosed());
    // dispatch(setObjectlistsSearchedValue(value));
  };

  const onChangeDeIDCheckBox = (e) => {
    setIsDeIdentificationChecked(e.target.checked);
  };

  const renderProjectTable = () => {
    if (!labelprojects.objectLists?.length)
      return (
        <div className="emptyListTable">
          {labelprojects.searchedValue
            ? user.language === "ko"
              ? `"${labelprojects.searchedValue}" ` +
                "에 대한 검색 결과가 없습니다. 다시 검색해주세요."
              : `There were no results found for "${labelprojects.searchedValue}"`
            : t("There is no labeling data.")}
        </div>
      );

    const partTableBottom = () => (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          id="delete_data_btn"
          shape="redOutlined"
          size="sm"
          disabled={!Object.values(projectCheckedValue).includes(true)}
          onClick={onDeleteObjectLists}
        >
          {t("Delete selection")}
        </Button>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={labelprojects.totalCount}
          rowsPerPage={labelprojects.projectRowsPerPage}
          page={labelprojects.projectPage}
          backIconButtonProps={{
            "aria-label": "previous projectPage",
          }}
          nextIconButtonProps={{
            "aria-label": "next projectPage",
          }}
          onPageChange={handleProjectChangePage}
          onRowsPerPageChange={handleChangeProjectRowsPerPage}
        />
      </div>
    );

    let tmpWorkapp = labelprojects.projectDetail.workapp;
    if (tmpWorkapp) {
      if (tmpWorkapp === "object_detection" || tmpWorkapp === "image") {
        return (
          <>
            <div
              style={{
                width: "100%",
                overflow: "auto",
              }}
            >
              <Table className={classes.table} aria-label="simple table">
                <TableHead style={{ height: "80px" }}>
                  <TableRow>
                    <TableCell
                      className={classes.tableHead}
                      align="center"
                      style={{ width: "5%" }}
                    >
                      {user.me &&
                        !user.me.isAiTrainer &&
                        labelprojects.projectDetail &&
                        !labelprojects.projectDetail.isShared && (
                          <Checkbox
                            value="all"
                            checked={projectCheckedValue["all"]}
                            onChange={onSetProjectCheckedValueAll}
                          />
                        )}
                    </TableCell>
                    <TableCell
                      className={classes.tableHead}
                      style={{ width: "5%" }}
                      align="center"
                    >
                      <b style={{ color: currentThemeColor.textMediumGrey }}>
                        No
                      </b>
                    </TableCell>
                    <TableCell
                      className={classes.tableHead}
                      style={{ width: "10%" }}
                      align="center"
                    >
                      <b style={{ color: currentThemeColor.textMediumGrey }}>
                        {t("Image")}
                      </b>
                    </TableCell>
                    <TableCell
                      className={classes.tableHead}
                      align="center"
                      style={{ width: "30%", cursor: "pointer" }}
                      onClick={() => onSetSortValue("originalFileName")}
                    >
                      <div className={classes.tableHeader}>
                        {labelprojects.sortingValue === "originalFileName" &&
                          (!labelprojects.isSortDesc ? (
                            <ArrowUpwardIcon fontSize="small" />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" />
                          ))}
                        <b>{t("File name")}</b>
                      </div>
                    </TableCell>
                    {labelprojects.projectDetail.workapp === "image" && (
                      <TableCell
                        className={classes.tableHead}
                        align="center"
                        style={{ width: "15%", cursor: "pointer" }}
                        onClick={() => onSetSortValue("class")}
                      >
                        <div className={classes.tableHeader}>
                          <b>{t("Class")}</b>
                        </div>
                      </TableCell>
                    )}
                    <TableCell
                      className={classes.tableHead}
                      align="center"
                      style={{ width: "10%", cursor: "pointer" }}
                      onClick={() => onSetSortValue("created_at")}
                    >
                      <div className={classes.tableHeader}>
                        {labelprojects.sortingValue === "created_at" &&
                          (!labelprojects.isSortDesc ? (
                            <ArrowUpwardIcon fontSize="small" />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" />
                          ))}
                        <b>{t("Date created")}</b>
                      </div>
                    </TableCell>
                    <TableCell
                      className={classes.tableHead}
                      align="center"
                      style={{ width: "20%", cursor: "pointer" }}
                      onClick={() => onSetSortValue("workAssignee")}
                    >
                      <div className={classes.tableHeader}>
                        {labelprojects.sortingValue === "workAssignee" &&
                          (!labelprojects.isSortDesc ? (
                            <ArrowUpwardIcon fontSize="small" />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" />
                          ))}
                        <b>{t("Assignee ")}</b>
                      </div>
                    </TableCell>
                    <TableCell
                      className={classes.tableHead}
                      align="center"
                      style={{ width: "10%", cursor: "pointer" }}
                      onClick={() => onSetSortValue("status")}
                    >
                      <div className={classes.tableHeader}>
                        {labelprojects.sortingValue === "status" &&
                          (!labelprojects.isSortDesc ? (
                            <ArrowUpwardIcon fontSize="small" />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" />
                          ))}
                        <b>{t("Status")}</b>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {labelprojects.objectLists &&
                    labelprojects.objectLists.map((objectData, idx) => (
                      <TableRow
                        key={idx}
                        className={classes.tableRow}
                        style={{
                          background:
                            idx % 2 === 0
                              ? currentTheme.tableRow1
                              : currentTheme.tableRow2,
                        }}
                      >
                        <TableCell
                          className={classes.tableRowCell}
                          align="center"
                        >
                          <Checkbox
                            value={objectData.id}
                            checked={
                              projectCheckedValue[objectData.id] ? true : false
                            }
                            onChange={() =>
                              onSetProjectCheckedValue(objectData.id)
                            }
                          />
                        </TableCell>
                        <TableCell
                          className={classes.tableRowCell}
                          align="center"
                          onClick={() => goProjectDetail(objectData.id)}
                        >
                          {labelprojects.totalCount -
                            (labelprojects.projectRowsPerPage *
                              labelprojects.projectPage +
                              idx)}
                        </TableCell>
                        <TableCell
                          className={classes.tableRowCell}
                          align="center"
                          onClick={() => goProjectDetail(objectData.id)}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: "80px",
                              height: "80px",
                              overflow: "hidden",
                              background: `center/cover no-repeat url(${getS3key(
                                encodeURIComponent(objectData.s3key)
                              )})`,
                            }}
                          ></span>
                        </TableCell>
                        <TableCell
                          className={classes.tableRowCell}
                          align="center"
                          onClick={() => goProjectDetail(objectData.id)}
                        >
                          <div className={classes.defaultContainer}>
                            <div
                              style={{
                                wordBreak: "break-all",
                                marginLeft: "10px",
                              }}
                            >
                              {objectData.originalFileName
                                ? objectData.originalFileName
                                : "-"}
                            </div>
                          </div>
                        </TableCell>
                        {labelprojects.projectDetail.workapp === "image" && (
                          <TableCell
                            className={classes.tableRowCell}
                            align="center"
                            onClick={() => goProjectDetail(objectData.id)}
                          >
                            <div className={classes.defaultContainer}>
                              <div
                                style={{
                                  wordBreak: "break-all",
                                  marginLeft: "10px",
                                }}
                              >
                                {objectData.labelData
                                  ? objectData.labelData
                                  : "-"}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        <TableCell
                          className={classes.tableRowCell}
                          align="center"
                          onClick={() => goProjectDetail(objectData.id)}
                        >
                          <div className={classes.wordBreakDiv}>
                            {objectData.created_at &&
                              objectData.created_at.substring(0, 10)}
                          </div>
                        </TableCell>
                        <TableCell
                          className={classes.tableRowCell}
                          align="center"
                          onClick={() => goProjectDetail(objectData.id)}
                        >
                          <div className={classes.wordBreakDiv}>
                            {objectData?.workAssignee
                              ? objectData.workAssignee
                              : objectData?.last_updated_by === "auto"
                              ? "Auto Labeling"
                              : t("None")}
                          </div>
                        </TableCell>
                        <TableCell
                          className={classes.tableRowCell}
                          align="center"
                          onClick={() => goProjectDetail(objectData.id)}
                        >
                          <div className={classes.wordBreakDiv}>
                            {t(
                              statusValue[
                                objectData.status
                                  ? objectData.status
                                  : "prepare"
                              ]
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            {partTableBottom()}
          </>
        );
      } else {
        return (
          <>
            <div
              style={{
                width: "100%",
                overflow: "auto",
              }}
            >
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow style={{ height: "80px" }}>
                    <TableCell
                      className={classes.tableHead}
                      align="center"
                      style={{ width: "5%" }}
                    >
                      {user.me &&
                        !user.me.isAiTrainer &&
                        labelprojects.projectDetail &&
                        !labelprojects.projectDetail.isShared && (
                          <Checkbox
                            value="all"
                            checked={projectCheckedValue["all"]}
                            onChange={onSetProjectCheckedValueAll}
                          />
                        )}
                    </TableCell>
                    <TableCell
                      className={classes.tableHead}
                      style={{ width: "5%" }}
                      align="center"
                    >
                      <b style={{ color: currentThemeColor.textMediumGrey }}>
                        No
                      </b>
                    </TableCell>
                    <TableCell
                      className={classes.tableHead}
                      align="center"
                      style={{ width: "5%", cursor: "pointer" }}
                      onClick={() => onSetSortValue("status")}
                    >
                      <div className={classes.tableHeader}>
                        {labelprojects.sortingValue === "status" &&
                          (!labelprojects.isSortDesc ? (
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
                      style={{ width: "10%" }}
                    >
                      <div className={classes.tableHeader}>
                        {predictVal && <b>{predictVal}</b>}
                      </div>
                    </TableCell>
                    {csvColumns &&
                      csvColumns.map((csvColumn) => {
                        return (
                          <TableCell
                            key={csvColumn}
                            className={classes.tableHead}
                            align="center"
                            style={{ width: "10%" }}
                          >
                            <div className={classes.tableHeader}>
                              <b>{csvColumn}</b>
                            </div>
                          </TableCell>
                        );
                      })}
                    <TableCell
                      className={classes.tableHead}
                      align="center"
                      style={{ width: "10%", cursor: "pointer" }}
                      onClick={() => onSetSortValue("workAssignee")}
                    >
                      <div className={classes.tableHeader}>
                        {labelprojects.sortingValue === "workAssignee" &&
                          (!labelprojects.isSortDesc ? (
                            <ArrowUpwardIcon fontSize="small" />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" />
                          ))}
                        <b>{t("Assignee ")}</b>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {labelprojects.objectLists &&
                    labelprojects.objectLists.map((project, idx) => {
                      return (
                        <>
                          <TableRow
                            key={idx}
                            className={classes.tableRow}
                            style={{
                              background:
                                idx % 2 === 0
                                  ? currentTheme.tableRow1
                                  : currentTheme.tableRow2,
                            }}
                          >
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                            >
                              <Checkbox
                                value={project.id}
                                checked={
                                  projectCheckedValue[project.id] ? true : false
                                }
                                onChange={() =>
                                  onSetProjectCheckedValue(project.id)
                                }
                              />
                            </TableCell>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                            >
                              {labelprojects.totalCount -
                                (labelprojects.projectRowsPerPage *
                                  labelprojects.projectPage +
                                  idx)}
                            </TableCell>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                            >
                              <div className={classes.defaultContainer}>
                                <div
                                  style={{
                                    wordBreak: "break-all",
                                    marginLeft: "10px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <>
                                    {!project.status ? (
                                      <>{t("In queue")}</>
                                    ) : (
                                      <>{t(statusValue[project["status"]])}</>
                                    )}
                                  </>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ width: "10%" }}
                            >
                              {project.labelData && (
                                <>{project.labelData[predictVal]}</>
                              )}
                            </TableCell>
                            {csvColumns &&
                              csvColumns.map((csvColumn, idx) => {
                                return (
                                  <TableCell
                                    key={csvColumn}
                                    className={classes.tableRowCell}
                                    align="center"
                                    style={{
                                      width: "10%",
                                    }}
                                  >
                                    <div className={classes.defaultContainer}>
                                      <div
                                        style={{
                                          wordBreak: "break-all",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          display: "-webkit-box",
                                          WebkitLineClamp: "3",
                                          WebkitBoxOrient: "vertical",
                                          wordWrap: "break-word",
                                          lineHeight: "1.2em",
                                          maxHeight: "3.6em",
                                        }}
                                      >
                                        {project.rawData[csvColumn]}
                                      </div>
                                    </div>
                                  </TableCell>
                                );
                              })}
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ width: "10%" }}
                            >
                              <div className={classes.defaultContainer}>
                                <span>
                                  {project["workAssignee"]
                                    ? project["workAssignee"]
                                    : project.last_updated_by === "auto"
                                    ? "Auto Labeling"
                                    : t("None")}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        </>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
            {partTableBottom()}
          </>
        );
      }
    }
  };

  const onSetValueForStatus = (e) => {
    setIsLoading(true);
    setValueForStatus(e.target.value);

    dispatch(setIsPreviewClosed());
    dispatch(setObjectlistsValueForStatus(e.target.value));
    dispatch(setObjectlistsPage(0));
    dispatch(
      getObjectListsRequestAction({
        sorting: labelprojects.sortingValue,
        count: labelprojects.projectRowsPerPage,
        page: 0,
        labelprojectId: labelprojects.projectDetail.id,
        tab: e.target.value,
        isDesc: labelprojects.isSortDesc,
        searching: isSearchValSubmitted ? labelprojects.searchedValue : null,
        workAssignee: labelprojects.valueForAsingee,
        workapp: labelprojects.projectDetail.workapp,
      })
    );
  };

  const onSetValueForAssignee = (e) => {
    setIsLoading(true);
    setValueForAssignee(e.target.value);
    dispatch(setIsPreviewClosed());
    dispatch(setObjectlistsValueForAsignee(e.target.value));
    dispatch(setObjectlistsPage(0));
    dispatch(
      getObjectListsRequestAction({
        sorting: labelprojects.sortingValue,
        count: labelprojects.projectRowsPerPage,
        page: 0,
        labelprojectId: labelprojects.projectDetail.id,
        tab: labelprojects.valueForStatus,
        isDesc: labelprojects.isSortDesc,
        searching: isSearchValSubmitted ? labelprojects.searchedValue : null,
        workAssignee: e.target.value,
        workapp: labelprojects.projectDetail.workapp,
      })
    );
  };

  const onGetSearchedFile = (e) => {
    e.preventDefault();

    if (searchedValue && searchedValue.length > 0) {
      dispatch(setObjectlistsPage(0));
      setIsSearchValSubmitted(true);

      dispatch(
        getObjectListsRequestAction({
          sorting: labelprojects.sortingValue,
          count: labelprojects.projectRowsPerPage,
          page: 0,
          labelprojectId: labelprojects.projectDetail.id,
          isDesc: labelprojects.isSortDesc,
          tab: labelprojects.valueForStatus,
          searching: searchedValue,
          workAssignee: labelprojects.valueForAsingee,
          workapp: labelprojects.projectDetail.workapp,
        })
      );
      dispatch(setObjectlistsSearchedValue(searchedValue));
    } else {
      dispatch(
        openErrorSnackbarRequestAction(t("Please enter a search term."))
      );
      return;
    }
  };

  const onGetDefaultFile = () => {
    setSearchedValue("");
    dispatch(setObjectlistsSearchedValue(""));
    setIsSearchValSubmitted(false);
    dispatch(setObjectlistsPage(0));
    dispatch(
      getObjectListsRequestAction({
        sorting: labelprojects.sortingValue,
        count: labelprojects.projectRowsPerPage,
        page: 0,
        labelprojectId: labelprojects.projectDetail.id,
        tab: labelprojects.valueForStatus,
        isDesc: labelprojects.isSortDesc,
        workAssignee: labelprojects.valueForAsingee,
        workapp: labelprojects.projectDetail.workapp,
      })
    );
  };

  const dataTypeText = (type) => {
    if (type === "object_detection" || type === "image") {
      return (
        <>
          {t(
            "Only image files (png/jpg/jpeg), compressed image files (zip), and video files (mp4) can be uploaded."
          )}
          <br />
          {t(
            "You are able to upload up to 100 image files. Please compress your files if you need to upload more than that"
          )}
        </>
      );
    } else {
      return t("Only csv files with the same field values ​​can be uploaded.");
    }
  };

  return isLoading ? (
    <div className={classes.loading}>
      <CircularProgress />

      {isFileUploading && (
        <p>{t("The file is being uploaded. please wait for a moment.")}</p>
      )}
    </div>
  ) : (
    <>
      <ReactTitle title={"DS2.ai - " + t("Labeling")} />
      <Container
        component="main"
        maxWidth={false}
        className={classes.mainCard}
        style={{ padding: 0 }}
      >
        <GridContainer>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>{renderMenuButton()}</Grid>
            <Grid item>
              <Grid container>
                <Grid item sx={{ position: "relative" }}>
                  <select
                    id="work_asignee_select_box"
                    onChange={onSetValueForAssignee}
                    value={valueForAssignee}
                    name="demo-simple-select-outlined-label"
                    className={classes.select}
                    style={{
                      width: "190px",
                      background: "#424242",
                      border: "none",
                    }}
                  >
                    {user.me &&
                    (parseInt(user.me.id) ===
                      parseInt(labelprojects.projectDetail.user) ||
                      labelprojects.role === "subadmin") && ( // 오이스터에이블 관련 임시 권한 추가
                        <option
                          value="all"
                          style={{
                            background: "#2F3236",
                            border: "none",
                          }}
                        >
                          {t("All")}
                        </option>
                      )}
                    {user.me && !user.me.isAiTrainer && (
                      <option
                        value="null"
                        style={{ background: "#2F3236", border: "none" }}
                      >
                        {t("None")}
                      </option>
                    )}
                    {user.me &&
                      labelprojects.workAssignee &&
                      labelprojects.workAssignee.map((asignee) => {
                        if (
                          parseInt(user.me.id) ===
                            parseInt(labelprojects.projectDetail.user) ||
                          user.me.email === asignee ||
                          labelprojects.role === "subadmin" // 오이스터에이블 관련 임시 권한 추가
                        ) {
                          return (
                            <option
                              key={asignee}
                              value={asignee}
                              style={{ background: "#2F3236", border: "none" }}
                            >
                              {asignee}
                            </option>
                          );
                        }
                      })}
                  </select>
                  <span
                    style={{
                      fontSize: 12,
                      position: "absolute",
                      top: -24,
                      left: 0,
                    }}
                  >
                    {t("Assignee ")}
                  </span>
                </Grid>
                <Grid item sx={{ position: "relative" }}>
                  <select
                    id="status_select_box"
                    onChange={onSetValueForStatus}
                    value={valueForStatus}
                    name="demo-simple-select-outlined-label"
                    className={classes.select}
                    style={{
                      width: "190px",
                      margin: "0 10px",
                      background: "#424242",
                      border: "none",
                      position: "relative",
                    }}
                  >
                    {Object.keys(statusValue).map((status) => (
                      <option key={status} value={status}>
                        {t(statusValue[status])}
                      </option>
                    ))}
                  </select>
                  <span
                    style={{
                      fontSize: 12,
                      position: "absolute",
                      top: -24,
                      left: 10,
                    }}
                  >
                    {t("Status")}
                  </span>
                </Grid>
                <Grid item sx={{ ml: 3 }}>
                  {(labelprojects.projectDetail?.workapp ===
                    "object_detection" ||
                    labelprojects.projectDetail?.workapp === "image") && (
                    <form
                      id="label_file_search_form"
                      style={{
                        background: "#424242",
                        width: "190px",
                        borderRadius: "50px",
                        height: "32px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0 5px",
                      }}
                      //noValidate
                    >
                      <input
                        style={{
                          background: "transparent",
                          color: currentThemeColor.textWhite87,
                          border: "none",
                          width: "100%",
                          fontSize: "15px",
                          padding: "0 12px",
                        }}
                        placeholder={t("Search")}
                        value={searchedValue}
                        onChange={onChangeSearchedValue}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            onGetSearchedFile(e);
                          }
                        }}
                        id="search_file_input"
                      />
                      {searchedValue && searchedValue.length > 0 && (
                        <CloseIcon
                          id="delete_searching_value_btn"
                          onClick={onGetDefaultFile}
                          className={classes.pointerCursor}
                        />
                      )}
                    </form>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </GridContainer>
        {renderProjectTable()}
      </Container>

      <Modal
        id="label_preivew_modal"
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isPreviewModalOpen}
        onClose={onClosePreviewModal}
        className={classes.modalContainer}
      >
        <div className="label_preivew_container">
          <LabelPreview
            history={history}
            selectedPreviewId={selectedPreviewId}
            onClosePreviewModal={onClosePreviewModal}
            onSetSelectedPage={onSetSelectedPage}
          />
        </div>
      </Modal>

      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openFileModal}
        onClose={closeFileModal}
        className={classes.modalContainer}
      >
        {isFileUploading || isUploadLoading ? (
          <div className={classes.cancelModalContent}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LinearProgress
                style={{ width: "100%", height: "50px", marginTop: "20px" }}
                variant="determinate"
                value={completed}
              />
              <p className={classes.settingFontWhite6}>
                {t("Uploading")} {completed}% {t("Completed")}...{" "}
              </p>
            </div>
          </div>
        ) : (
          <div className={classes.cancelModalContent} id="file_upload_modal">
            <Dropzone onDrop={dropFiles}>
              {({ getRootProps, getInputProps }) => (
                <section className="container">
                  {(!uploadFile || uploadFile.length === 0) && (
                    <div
                      {...getRootProps({
                        className: "dropzoneSolidSquareBorder",
                      })}
                      style={{ padding: "36px" }}
                    >
                      <input {...getInputProps()} />
                      <p className={classes.settingFontWhite6}>
                        {t("Drag the file or click the box to upload it!")}
                        <br />
                        {dataTypeText(labelprojects.projectDetail.workapp)}
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
                              marginTop: "20px",
                              fontSize: "18px",
                              fontweight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: currentThemeColor.textWhite87,
                            }}
                          >
                            <span>
                              {t("Uploaded File")} :{" "}
                              <span style={{ fontSize: 20, fontWeight: 600 }}>
                                {uploadFile.length &&
                                  uploadFile.length.toLocaleString()}
                              </span>
                            </span>
                          </p>
                          <ul
                            style={{
                              maxHeight: 200,
                              overflowY: "auto",
                              listStyle: "decimal-leading-zero",
                            }}
                          >
                            {uploadFile.map((file, idx) => {
                              return (
                                <li
                                  key={file.name + idx}
                                  style={{ marginBottom: 8 }}
                                >
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
                                        marginLeft: "12px",
                                        cursor: "pointer",
                                        fill: "var(--textWhite87)",
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
                          {/* {(labelprojects.projectDetail?.workapp ===
                            "object_detection" ||
                            labelprojects.projectDetail?.workapp ===
                              "image") && (
                            <FormControlLabel
                              style={{
                                color: currentThemeColor.textWhite87,
                                fontSize: "14px",
                                margin: "36px 0 12px",
                              }}
                              control={
                                <Checkbox
                                  checked={isDeIdentificationChecked}
                                  onChange={(e) => onChangeDeIDCheckBox(e)}
                                  color="primary"
                                  style={{ marginRight: "10px" }}
                                />
                              }
                              label={t("Human face pixelization (De-identification)")}
                            />
                          )} */}
                          {shouldUpdateFrame && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                margin: "32px 0 48px",
                                padding: "0 12px",
                              }}
                            >
                              <InputLabel
                                id="demo-simple-select-label"
                                style={{ marginBottom: 0 }}
                              >
                                {t("Enter frames per minute")}
                              </InputLabel>
                              <InputBase
                                variant="outlined"
                                required
                                id="frameValue"
                                placeholder={t(
                                  "Enter only numbers from 1 to 600"
                                )}
                                label={t("Enter frames per minute")}
                                name="frameValue"
                                autoComplete="frameValue"
                                autoFocus
                                type="number"
                                onChange={handleFrameValue}
                                value={frameValue}
                                style={{
                                  width: "70%",
                                  border: "1px solid var(--textWhite87)",
                                  borderRadius: "4px",
                                  color: "var(--textWhite87)",
                                  padding: "4px 12px",
                                }}
                              />
                            </div>
                          )}
                          <GridContainer justifyContent="flex-end">
                            <GridItem>
                              <span
                                id="uploadFileAgain"
                                className={classes.labelUploadBtn}
                                onClick={() => {
                                  setUploadFile(null);
                                  setIsDeIdentificationChecked(false);
                                }}
                              >
                                {t("Re-upload")}
                              </span>
                            </GridItem>
                          </GridContainer>
                        </>
                      ))}
                  </aside>
                </section>
              )}
            </Dropzone>
            <GridContainer style={{ marginTop: "36px" }}>
              <GridItem xs={6}>
                <Button
                  id="close_modal_btn"
                  shape="whiteOutlined"
                  style={{ width: "100%" }}
                  onClick={closeFileModal}
                >
                  {t("Cancel")}
                </Button>
              </GridItem>
              <GridItem xs={6}>
                <Button
                  id="submit_file_btn"
                  shape={
                    uploadFile && uploadFile.length > 0
                      ? "greenContained"
                      : "greenOutlined"
                  }
                  disabled={!uploadFile || uploadFile?.length === 0}
                  style={{ width: "100%" }}
                  onClick={saveFiles}
                >
                  {t("Next")}
                </Button>
              </GridItem>
            </GridContainer>
          </div>
        )}
      </Modal>
    </>
  );
};

export default React.memo(LabelList);
