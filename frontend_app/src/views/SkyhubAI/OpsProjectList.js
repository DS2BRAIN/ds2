import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";
import Dropzone from "react-dropzone";

import {
  askDeleteOpsProjectsReqeustAction,
  askModalRequestAction,
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import {
  postUploadFileRequestAction,
  setObjectlistsSearchedValue,
} from "redux/reducers/labelprojects.js";
import { getOpsProjectsRequestAction } from "redux/reducers/projects";
import { putUserRequestActionWithoutMessage } from "redux/reducers/user";

import * as api from "controller/api";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import { IS_ENTERPRISE } from "variables/common";
import { listPagination } from "components/Function/globalFunc";
import Button from "components/CustomButtons/Button";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import SearchInputBox from "components/Table/SearchInputBox";
import SkyhubIntro from "components/Guide/SkyhubIntro";
import Samples from "components/Templates/Samples.js";

import {
  Checkbox,
  LinearProgress,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
} from "@material-ui/core";
import { CircularProgress, Grid } from "@mui/material";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import CloseIcon from "@material-ui/icons/Close";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import DeleteIcon from "@material-ui/icons/Delete";

const Project = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, projects, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [introOn, setIntroOn] = useState(false);
  const [introOffClicked, setIntroOffClicked] = useState(false);
  const [projectCheckedValue, setProjectCheckedValue] = useState({
    all: false,
  });
  const [isCategoryClicked, setIsCategoryClicked] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const [projectPage, setProjectPage] = useState(0);
  const [projectRowsPerPage, setProjectRowsPerPage] = useState(10);
  const [sortingValue, setSortingValue] = useState("created_at");
  const [searchedValue, setSearchedValue] = useState("");
  const [isSortDesc, setIsSortDesc] = useState(true);
  const [isShared, setIsShared] = useState(false);

  const [isLoadModelModalOpen, setIsLoadModelModalOpen] = useState(false);
  const [isOpenStartModalOpen, setIsOpenStartModalOpen] = useState(false);
  const [openFileModal, setOpenFileModal] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewText, setPreviewText] = useState(null);
  const [files, setFiles] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploadFileChanged, setIsUploadFileChanged] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isFilesUploadLoading, setIsFilesUploadLoading] = useState(false);
  const [isProjectRequested, setIsProjectRequested] = useState(false);

  const url = window.location.href;
  const urlLoc = window.location;
  const urlPath = urlLoc.pathname;
  const urlSearch = urlLoc.search;
  const urlSearchParams = new URLSearchParams(urlSearch);
  const projectCountLimit = IS_ENTERPRISE ? 999999999 : 5; //instance 개수 제한 (n+1)개 까지 가능

  useEffect(() => {
    if (previewText) {
      setIsPreviewLoading(false);
    }
  }, [previewText]);

  useEffect(() => {
    // 배포 skyhub intro 컨텐츠 업데이트 필요 (인트로 페이지 비활성화)
    // if (user.me && !user.me.intro4Checked) {
    //   setIntroOn(true);
    // } else {
    //   setIntroOn(false);
    // }
  }, [user]);

  useEffect(() => {
    if (introOffClicked) {
      setIntroOn(false);
      user.me.intro4Checked = true;
      dispatch(
        putUserRequestActionWithoutMessage({
          intro4Checked: true,
        })
      );
    }
  }, [introOffClicked]);

  useEffect(() => {
    if (url && projects.projects) {
      (async () => {
        await setProjectSettings();
      })();
    }
  }, [projects.projects]);

  useEffect(() => {
    const pagiInfoDict = listPagination(urlLoc);
    setProjectPage(pagiInfoDict.page);
    setProjectRowsPerPage(pagiInfoDict.rows);
    setSortingValue(pagiInfoDict.sorting);
    setIsSortDesc(pagiInfoDict.desc);
    setSearchedValue(pagiInfoDict.search);

    setIsProjectRequested(true);
  }, [urlSearch]);

  useEffect(() => {
    let urlSP = urlSearchParams;
    let searchVal = searchedValue;
    if (searchVal) {
      if (urlSP.has("page")) urlSP.delete("page");
      urlSP.set("search", searchVal);
    }
    handleSearchParams(urlSP);
  }, [searchedValue]);

  useEffect(() => {
    if (isProjectRequested) {
      getProjectByDispatch();
      setIsProjectRequested(false);
    }
  }, [isProjectRequested]);

  const getProjectByDispatch = () => {
    let payloadJson = {
      sorting: sortingValue,
      count: projectRowsPerPage,
      start: projectPage,
      isDesc: isSortDesc,
      searching: searchedValue,
    };
    dispatch(getOpsProjectsRequestAction(payloadJson));
  };

  const handleSearchParams = (searchPar) => {
    history.push(urlPath + "?" + searchPar);
  };

  useEffect(() => {
    if (isCategoryClicked) setIsCategoryClicked(false);
  }, [isCategoryClicked]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsFileUploading(false);
      setCompleted(0);
      setUploadFile(null);
      setOpenFileModal(false);
      setIsLoading(false);
      setIsLoadModelModalOpen(false);
    }
  }, [messages.shouldCloseModal]);

  const setProjectSettings = () => {
    setProjectCheckedValue({ all: false });
    for (let i = 0; i < projects.projects.length; i++) {
      const value = projects.projects[i].id;
      setProjectCheckedValue((prevState) => {
        return { ...prevState, [value]: false };
      });
    }
    setIsLoading(false);
  };

  const openStartProjectModal = () => {
    if (user.cardInfo?.cardName && user.cardInfo?.created) {
      setIsOpenStartModalOpen(true);
    } else {
      setIsOpenStartModalOpen(true);
      return;
    }
  };

  const closeStartProjectModal = () => {
    setIsOpenStartModalOpen(false);
  };

  const closeFileModal = () => {
    dispatch(askModalRequestAction());
  };

  const goClickAI = () => {
    history.push("/admin/project");
  };

  const goProjectDetail = (id) => {
    history.push(`/admin/skyhubai/${id}`);
  };

  const saveFiles = async () => {
    if (!uploadFile || uploadFile.length === 0) {
      openErrorSnackbarRequestAction(t("Upload file"));
      return;
    }
    await setIsFileUploading(true);
    await setCompleted(5);
    await dispatch(
      postUploadFileRequestAction({
        labelprojectId: labelprojects.projectDetail.id,
        files: uploadFile,
      })
    );
    await dispatch(setObjectlistsSearchedValue(null));
  };

  const isEnableToChange = (time, option = null) => {
    let updatedAt = new Date(time).getTime() / 60000;
    let nowTime = new Date();
    nowTime =
      new Date(
        nowTime.getTime() + nowTime.getTimezoneOffset() * 60000
      ).getTime() / 60000;
    if (option == null) return nowTime - updatedAt > 10;
    else return 10 - Math.floor(nowTime - updatedAt);
  };

  const onSetProjectCheckedValue = (project) => {
    let value = project.id;
    setProjectCheckedValue((prevState) => {
      return {
        ...prevState,
        all: false,
        [value]: !projectCheckedValue[value],
      };
    });
  };

  const onSetProjectCheckedValueAll = () => {
    const result = projectCheckedValue["all"] ? false : true;
    const tmpObject = { all: result };
    for (let i = 0; i < projects.projects.length; i++) {
      const id = projects.projects[i].id;
      tmpObject[id] = result;
    }
    setProjectCheckedValue(tmpObject);
  };

  const deleteProject = async () => {
    const deleteProjectsArr = [];
    for (let project in projectCheckedValue) {
      if (project !== "all" && projectCheckedValue[project]) {
        deleteProjectsArr.push(project);
      }
    }
    dispatch(
      askDeleteOpsProjectsReqeustAction({
        projects: deleteProjectsArr,
        sortInfo: {
          sorting: sortingValue,
          count: projectRowsPerPage,
          start: projectPage,
          isDesc: isSortDesc,
        },
      })
    );
  };

  const handleProjectChangePage = (event, newPage) => {
    urlSearchParams.set("page", newPage + 1);
    handleSearchParams(urlSearchParams);
  };

  const handleChangeProjectRowsPerPage = (event) => {
    urlSearchParams.delete("page");
    urlSearchParams.set("rows", event.target.value);
    handleSearchParams(urlSearchParams);
  };

  const onSetSortValue = async (value) => {
    let urlSP = urlSearchParams;
    if (value === sortingValue) {
      urlSP.set("desc", !isSortDesc);
    } else {
      urlSP.set("sorting", value);
      urlSP.delete("desc");
    }
    if (urlSP.has("page")) urlSP.delete("page");
    handleSearchParams(urlSP);
  };

  const showMyProject = () => {
    const tableHeads = [
      // { value: "No.", width: "5%", type: "projectNum" },
      { value: "Project name", width: "75%", type: "projectName" },
      { value: "Date created", width: "20%", type: "created_at" },
    ];

    const pProjects = projects.projects;
    if (!pProjects || pProjects.length === 0) {
      return (
        <div className="emptyListTable">
          {searchedValue
            ? user.language === "ko"
              ? `"${searchedValue}" ` +
                "에 대한 검색 결과가 없습니다. 다시 검색해주세요."
              : `There were no results found for "${searchedValue}"`
            : t(
                "There is no deployed project in process. Please create a new project"
              )}
        </div>
      );
    } else {
      return (
        <div>
          {projects.isLoading ? (
            <GridItem xs={12}>
              <div className={classes.loading} style={{ marginTop: "-29px" }}>
                <CircularProgress />
              </div>
            </GridItem>
          ) : (
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {!isShared && (
                    <TableCell
                      className={classes.tableHead}
                      align="left"
                      style={{ width: "5%" }}
                    >
                      {/* <Checkbox
                        value="all"
                        checked={projectCheckedValue["all"]}
                        onChange={onSetProjectCheckedValueAll}
                      /> */}
                    </TableCell>
                  )}
                  {tableHeads.map((tableHead) => {
                    return (
                      <TableCell
                        className={classes.tableHead}
                        align="center"
                        style={{ width: tableHead.width, cursor: "pointer" }}
                        onClick={() => {
                          if (tableHead.type !== "projectNum")
                            onSetSortValue(tableHead.type);
                        }}
                      >
                        <div className={classes.tableHeader}>
                          {sortingValue === tableHead.type &&
                            (!isSortDesc ? (
                              <ArrowUpwardIcon fontSize="small" />
                            ) : (
                              <ArrowDownwardIcon fontSize="small" />
                            ))}
                          <b>{t(tableHead.value)}</b>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {pProjects.map((project, idx) => (
                  <TableRow
                    key={`tableRow_${idx}`}
                    className={classes.tableRow}
                  >
                    {!isShared && (
                      <TableCell align="left" className={classes.tableRowCell}>
                        <Checkbox
                          value={project.id}
                          checked={
                            projectCheckedValue[project.id] ? true : false
                          }
                          onChange={() => onSetProjectCheckedValue(project)}
                          className={classes.tableCheckBox}
                        />
                      </TableCell>
                    )}
                    {tableHeads.map((tableHead, i) => {
                      return (
                        <TableCell
                          key={`tableRow_${idx}_tableCell_${i}`}
                          className={classes.tableRowCell}
                          align="center"
                          onClick={() => goProjectDetail(project.id)}
                        >
                          <div
                            style={{
                              wordBreak: "break-all",
                            }}
                          >
                            {tableHead.type === "created_at"
                              ? project[tableHead.type].substring(0, 10)
                              : project[tableHead.type]}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Grid container justifyContent="space-between" alignItems="center">
            <Button
              id="deleteProject"
              disabled={!Object.values(projectCheckedValue).includes(true)}
              shape="redOutlined"
              size="sm"
              onClick={deleteProject}
            >
              {t("Delete selection")}
            </Button>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={projects.totalLength["all"]}
              rowsPerPage={projectRowsPerPage}
              page={projectPage}
              backIconButtonProps={{
                "aria-label": "previous projectPage",
              }}
              nextIconButtonProps={{
                "aria-label": "next projectPage",
              }}
              onPageChange={handleProjectChangePage}
              onRowsPerPageChange={handleChangeProjectRowsPerPage}
              style={{ marginLeft: "auto" }}
            />
          </Grid>
        </div>
      );
    }
  };

  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
  };

  const closeLoadModelModal = () => {
    // setIsLoadModelModalOpen(false);
    dispatch(askModalRequestAction());
  };

  const dropFiles = (files) => {
    if (files.length > 1) {
      dispatch(openErrorSnackbarRequestAction(t("Choose one file")));
      return;
    }

    let filename = files[0].name;
    if (
      filename.toLowerCase().indexOf(".pth") === -1 &&
      filename.toLowerCase().indexOf(".zip") === -1
    ) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("Please upload a pth file or a zip file.")
        )
      );
      return;
    }

    setIsPreviewLoading(true);
    setFiles(files[0]);
    dispatch(
      openSuccessSnackbarRequestAction(t("The file(s) has been uploaded"))
    );
    setPreviewText(filename);
  };

  const deleteFiles = () => {
    setProgress(0);
    setFiles(null);
    setPreviewText(null);
    dispatch(
      openSuccessSnackbarRequestAction(t("The file(s) has been deleted"))
    );
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

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const confirmLoadModelModal = async () => {
    if (!files) {
      dispatch(openErrorSnackbarRequestAction(t("Upload file")));
      return;
    }
    setIsFilesUploadLoading(true);
    await api
      .postProjectWithModelFile(files)
      .then((res) => {
        if (res.data) {
          dispatch(
            openSuccessSnackbarRequestAction(t("The model has been uploaded."))
          );
          window.location.href =
            `/admin/newskyhubai/?modelid=` + res.data.model.id;
        }
      })
      .catch((err) => {
        if (err.response?.data?.code === "5030001") {
          dispatch(
            openErrorSnackbarRequestAction(t("This is not a valid model file."))
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(t("Please try again in a moment."))
          );
        }
      })
      .finally(() => {
        setIsFilesUploadLoading(false);
      });
    let oldProgress = progress;
    await setProgress(oldProgress + (100 - oldProgress) / 5);
    await sleep(5000);
    await setProgress(oldProgress + ((100 - oldProgress) * 2) / 5);
    await sleep(5000);
    await setProgress(oldProgress + ((100 - oldProgress) * 3) / 5);
    await sleep(5000);
    await setProgress(oldProgress + ((100 - oldProgress) * 4) / 5);
    await sleep(5000);
    await setProgress(oldProgress + ((100 - oldProgress) * 4.5) / 5);
    await sleep(10000);
  };

  return (
    <div>
      {introOn ? (
        <SkyhubIntro
          setIntroOn={setIntroOn}
          setIntroOffClicked={setIntroOffClicked}
          useTranslation={useTranslation}
          userLang={user.language}
        />
      ) : (
        <>
          <ReactTitle title={"DS2.AI - " + t("Deploy")} />
          <GridItem xs={12} style={currentTheme.titleGridItem}>
            <div className={classes.topTitle}>
              {t("Deploy to an inference server")}
            </div>
            <div className={classes.subTitleText}>
              {t("Deploy models with just one click.")}
            </div>
          </GridItem>
          <GridContainer style={{ display: "flex", alignItems: "center" }}>
            <GridItem
              xs={8}
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <Button
                id="add_project_btn"
                shape="greenContained"
                onClick={() => {
                  if (projects?.projects?.length < projectCountLimit)
                    if (IS_ENTERPRISE) setIsLoadModelModalOpen(true);
                    else openStartProjectModal();
                  else {
                    dispatch(
                      openSuccessSnackbarRequestAction(
                        t(
                          "More than 6 items are available through inquiries from the sales team."
                        )
                      )
                    );
                  }
                }}
              >
                {t("New Project")}
              </Button>
            </GridItem>
            <GridItem xs={4}>
              <SearchInputBox />
            </GridItem>
          </GridContainer>
          <GridContainer>
            {projects.isLoading || projects.projects == null ? (
              <div className={classes.loading} style={{ marginTop: "-29px" }}>
                <CircularProgress />
              </div>
            ) : (
              <GridItem xs={12} sm={12} md={12}>
                {showMyProject()}
                {/*tableData*/}
              </GridItem>
            )}
          </GridContainer>
        </>
      )}
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isTemplateModalOpen}
        onClose={closeTemplateModal}
        className={classes.modalContainer}
      >
        <Samples
          className={classes.predictModalContent}
          closeTemplateModal={closeTemplateModal}
          history={history}
        />
      </Modal>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isLoadModelModalOpen}
        onClose={closeLoadModelModal}
        className={classes.modalContainer}
      >
        {isLoading ? (
          <div className={classes.modalLoading}>
            <LinearProgress variant="determinate" value={progress} />
            <b style={{ alignSelf: "center" }}>{t("Please wait a moment.")}</b>
          </div>
        ) : (
          <div className={classes.modalDataconnectorContent} id="projectModal">
            <div
              className={classes.gridRoot}
              style={{
                height: "100%",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <GridItem xs={11}>
                  <div>
                    {t("Model loading supports Pytorch and tensorflow2.")}
                  </div>
                </GridItem>
                <CloseIcon
                  xs={1}
                  id="deleteLabelIcon"
                  className={classes.pointerCursor}
                  onClick={closeLoadModelModal}
                />
              </div>
              <>
                <div style={{ width: "100%", textAlign: "center" }}>
                  <GridContainer
                    style={{
                      width: "100%",
                      height: "50%",
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <>
                      <div
                        className={classes.uploadContent}
                        style={{ width: "95%" }}
                      >
                        {isPreviewLoading ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              marginTop: "20px",
                            }}
                          >
                            <CircularProgress size={20} style={{ mb: 2 }} />
                            <b className={classes.text87}>
                              {t("Uploading file. Please wait a moment.")}
                            </b>
                          </div>
                        ) : (
                          <Dropzone onDrop={dropFiles}>
                            {({ getRootProps, getInputProps }) => (
                              <>
                                {!files && (
                                  <div className="dropzoneSolidSquareBorder">
                                    <div
                                      {...getRootProps({
                                        className: "container",
                                      })}
                                      style={{ borderRadius: "20px" }}
                                    >
                                      <input {...getInputProps()} />
                                      <p className={classes.dropzoneText}>
                                        {t(
                                          "Drag the file or click the box to upload it!"
                                        )}
                                        <br />
                                        {t(
                                          "Only PTH and ZIP files under 5GB are supported."
                                        )}
                                        <br />
                                      </p>
                                      <CloudUploadIcon fontSize="large" />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </Dropzone>
                        )}
                        {previewText ? (
                          <div
                            style={{
                              marginTop: "40px",
                              marginBottom: "10px",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <div>
                              <FileCopyIcon fontSize="large" />
                              <DeleteIcon
                                fontSize="small"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  deleteFiles();
                                }}
                              />
                            </div>
                            <div>
                              {previewText.split("\n").map((item, key) => {
                                return (
                                  <span key={key} className={classes.text87}>
                                    {item}
                                    <br />
                                    <br />
                                  </span>
                                );
                              })}
                            </div>
                            <div>
                              <span
                                id="uploadFileAgain"
                                style={{
                                  borderBottom:
                                    "2px solid " + currentThemeColor.secondary1,
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  deleteFiles();
                                }}
                              >
                                {t("Re-upload")}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{ marginTop: "40px" }}
                            className={classes.text87}
                            id="informText"
                          >
                            {t(
                              "No files uploaded. Please upload your data file."
                            )}{" "}
                            <br />
                          </div>
                        )}
                      </div>
                    </>
                  </GridContainer>
                </div>
              </>
            </div>
            <GridContainer>
              <GridItem xs={12}>
                <GridContainer style={{ width: "100%" }}>
                  <>
                    <GridItem xs={6}></GridItem>
                    <GridItem xs={3}>
                      <Button
                        id="closeLoadModelModal"
                        style={{ width: "100%", height: "1.7rem" }}
                        className={classes.defaultF0F0OutlineButton}
                        onClick={closeLoadModelModal}
                      >
                        {t("Cancel")}
                      </Button>
                    </GridItem>
                    <GridItem xs={3}>
                      {files && isFilesUploadLoading == false ? (
                        <Button
                          id="nextLoadModelModal"
                          style={{ width: "100%", height: "1.7rem" }}
                          className={classes.defaultGreenOutlineButton}
                          onClick={confirmLoadModelModal}
                        >
                          {t("Confirm")}
                        </Button>
                      ) : (
                        <Tooltip
                          title={
                            <span style={{ fontSize: "11px" }}>
                              {t("Upload file")}
                            </span>
                          }
                          placement="bottom"
                        >
                          <Button
                            id="nextLoadModelModal"
                            style={{ width: "100%", height: "1.7rem" }}
                            className={classes.defaultDisabledButton}
                            disabled
                          >
                            {isFilesUploadLoading == false
                              ? t("Confirm")
                              : t("Loading")}
                          </Button>
                        </Tooltip>
                      )}
                    </GridItem>
                  </>
                </GridContainer>
              </GridItem>
            </GridContainer>
          </div>
        )}
      </Modal>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isOpenStartModalOpen}
        onClose={closeStartProjectModal}
        className={classes.modalContainer}
        style={{ wordBreak: "keep-all" }}
      >
        {isLoading ? (
          <div className={classes.modalLoading}>
            {/* <Tip /> */}
            <LinearProgress variant="determinate" value={progress} />
            <b style={{ alignSelf: "center" }}>{t("Please wait a moment.")}</b>
          </div>
        ) : (
          <div className={classes.modalSkyhubStartContainer}>
            <GridContainer xs={12}>
              <GridItem xs={11} style={{ padding: "0px" }}>
                <div className={classes.modalTitleText}>
                  {t("Start SKYHUB AI")}
                </div>
              </GridItem>
              <GridItem xs={1} style={{ padding: "0px" }}>
                <CloseIcon
                  id="closeStartSkyhubModal"
                  onClick={closeStartProjectModal}
                  className={classes.modalCloseIcon}
                />
              </GridItem>
            </GridContainer>
            <GridContainer style={{ marginTop: "10px" }}>
              <GridItem
                xs={12}
                style={{
                  marginBottom: "5px",
                }}
              >
                <Table
                  className={classes.table}
                  aria-label="simple table"
                  style={{ wordBreak: "keep-all" }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        className={classes.tableHead}
                        align="center"
                        style={{ width: "33%" }}
                      >
                        <div className={classes.tableHeader}>
                          <b>{t("")}</b>
                        </div>
                      </TableCell>
                      <TableCell
                        className={classes.tableHead}
                        align="center"
                        style={{ width: "33%" }}
                      >
                        <div className={classes.tableHeader}>
                          <b>{t("Click AI")}</b>
                        </div>
                      </TableCell>
                      <TableCell
                        className={classes.tableHead}
                        align="center"
                        style={{ width: "33%" }}
                      >
                        <div className={classes.tableHeader}>
                          <b>{t("SKYHUB AI")}</b>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow className={classes.tableRow}>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("Inference function availability")}
                      </TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("O")}
                      </TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("O")}
                      </TableCell>
                    </TableRow>
                    <TableRow className={classes.tableRow}>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("AI model mounted server")}
                      </TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("Public Server (slow)")}
                      </TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("Dedicated Server (fast)")}
                      </TableCell>
                    </TableRow>
                    <TableRow className={classes.tableRow}>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("Data accumulation function for re-training")}
                      </TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("X")}
                      </TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("O")}
                      </TableCell>
                    </TableRow>
                    <TableRow className={classes.tableRow}>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("region")}
                      </TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("Korea")}
                      </TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("Worldwide")}
                      </TableCell>
                    </TableRow>
                    <TableRow className={classes.tableRow}>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("cost")}
                      </TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("Proportional to the number of API calls")}
                      </TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        {t("Proportional to the rental server size")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      ></TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                        onClick={goClickAI}
                      >
                        <Button
                          id="closeStartProject"
                          style={{
                            width: "70%",
                            height: "30%",
                            fontSize: "0.9rem",
                          }}
                          className={classes.defaultGreenOutlineButton}
                        >
                          {t("CLICK AI shortcut")}
                        </Button>
                      </TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ cursor: "default" }}
                      >
                        <Button
                          id="closeStartProject"
                          style={{
                            width: "70%",
                            height: "30%",
                            fontSize: "0.9rem",
                          }}
                          className={classes.defaultGreenOutlineButton}
                          onClick={() => {
                            setIsLoadModelModalOpen(true);
                          }}
                        >
                          {t("Upload model")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </GridItem>
            </GridContainer>
          </div>
        )}
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
            {/* <Tip /> */}
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
                {t("Uploading")} {completed}% {t("완료")}...{" "}
              </p>
            </div>
          </div>
        ) : (
          <div className={classes.cancelModalContent} id="file_upload_modal">
            <Dropzone onDrop={dropFiles}>
              {({ getRootProps, getInputProps }) => (
                <section className="container">
                  <GridItem xs={12} style={{ margin: "10px" }}>
                    <div className={classes.highlightText}>
                      <b>{t("Upload SKYHUB AI model")}</b>
                    </div>
                  </GridItem>
                  {(!uploadFile || uploadFile.length === 0) && (
                    <div
                      {...getRootProps({ className: "dropzoneArea" })}
                      style={{ margin: "10px" }}
                    >
                      <input {...getInputProps()} />
                      <p className={classes.settingFontWhite6}>
                        {t("Drag the file or click the box to upload it!")}
                        <br />
                        {t(
                          "Only image files (png/jpg/jpeg) or image compression files (zip) can be uploaded"
                        )}
                        <br />
                        {t(
                          "You are able to upload up to 100 image files. Please compress your files if you need to upload more than that"
                        )}
                        <br />
                        {t(
                          "Uploading large-size files may take more than 5 minutes"
                        )}
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
                              fontSize: "20px",
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
                                return (
                                  <li style={{ listStyle: "none" }}>.......</li>
                                );
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
                                      className={classes.pointerCursor}
                                      style={{ marginLeft: "10px" }}
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
                </section>
              )}
            </Dropzone>
            <GridContainer style={{ paddingTop: "20px" }}>
              <GridItem xs={6}>
                <Button
                  id="close_modal_btn"
                  style={{ width: "100%" }}
                  className={classes.defaultOutlineButton}
                  onClick={closeFileModal}
                >
                  {t("Cancel")}
                </Button>
              </GridItem>
              <GridItem xs={6}>
                {uploadFile ? (
                  <Button
                    id="submitBtn"
                    style={{ width: "100%" }}
                    className={classes.defaultHighlightButton}
                    onClick={saveFiles}
                  >
                    {t("Next")}
                  </Button>
                ) : (
                  <Button
                    id="submitBtn"
                    style={{ width: "100%" }}
                    className={classes.defaultDisabledButton}
                    disabled
                  >
                    {t("Next")}
                  </Button>
                )}
              </GridItem>
            </GridContainer>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default React.memo(Project);
