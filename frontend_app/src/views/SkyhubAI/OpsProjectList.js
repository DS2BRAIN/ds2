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
import { getOpsProjectsRequestAction } from "redux/reducers/projects";
import { putUserRequestActionWithoutMessage } from "redux/reducers/user";

import * as api from "controller/api";
import currentTheme from "assets/jss/custom.js";
import { IS_ENTERPRISE } from "variables/common";
import { listPagination } from "components/Function/globalFunc";
import Button from "components/CustomButtons/Button";
import SearchInputBox from "components/Table/SearchInputBox";
import SkyhubIntro from "components/Guide/SkyhubIntro";

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

const Project = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, projects, messages } = useSelector(
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

  const [projectPage, setProjectPage] = useState(0);
  const [projectRowsPerPage, setProjectRowsPerPage] = useState(10);
  const [sortingValue, setSortingValue] = useState("created_at");
  const [searchedValue, setSearchedValue] = useState("");
  const [isSortDesc, setIsSortDesc] = useState(true);

  const [isLoadModelModalOpen, setIsLoadModelModalOpen] = useState(false);
  const [isOpenStartModalOpen, setIsOpenStartModalOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewText, setPreviewText] = useState(null);
  const [files, setFiles] = useState(null);
  const [progress, setProgress] = useState(0);
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
      setProjectSettings();
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

  const goClickAI = () => {
    history.push("/admin/project");
  };

  const goProjectDetail = (id) => {
    history.push(`/admin/skyhubai/${id}`);
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
            <div className={classes.loading} style={{ marginTop: "-29px" }}>
              <CircularProgress />
            </div>
          ) : (
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
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
                  {tableHeads.map((tableHead) => {
                    return (
                      <TableCell
                        key={`tablehead_${tableHead.type}`}
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
                    <TableCell align="left" className={classes.tableRowCell}>
                      <Checkbox
                        value={project.id}
                        checked={projectCheckedValue[project.id] ? true : false}
                        onChange={() => onSetProjectCheckedValue(project)}
                        className={classes.tableCheckBox}
                      />
                    </TableCell>
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
    setProgress(oldProgress + (100 - oldProgress) / 5);
    await sleep(5000);
    setProgress(oldProgress + ((100 - oldProgress) * 2) / 5);
    await sleep(5000);
    setProgress(oldProgress + ((100 - oldProgress) * 3) / 5);
    await sleep(5000);
    setProgress(oldProgress + ((100 - oldProgress) * 4) / 5);
    await sleep(5000);
    setProgress(oldProgress + ((100 - oldProgress) * 4.5) / 5);
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
          <Grid style={currentTheme.titleGridItem}>
            <div className={classes.topTitle}>
              {t("Deploy to an inference server")}
            </div>
            <div className={classes.subTitleText}>
              {t("Deploy models with just one click.")}
            </div>
          </Grid>
          <Grid container alignItems="center">
            <Grid
              item
              xs={8}
              sx={{
                display: "flex",
                alignItems: "center",
                mt: 3.75,
                mb: 3,
              }}
            >
              <Button
                id="add_project_btn"
                shape="greenContained"
                onClick={() => {
                  if (projects?.projects?.length < projectCountLimit)
                    if (IS_ENTERPRISE) setIsLoadModelModalOpen(true);
                    else openStartProjectModal();
                  else
                    dispatch(
                      openSuccessSnackbarRequestAction(
                        t(
                          "More than 6 items are available through inquiries from the sales team."
                        )
                      )
                    );
                }}
              >
                {t("New Project")}
              </Button>
            </Grid>
            <Grid item xs={4}>
              <SearchInputBox />
            </Grid>
          </Grid>
          {projects.isLoading || projects.projects == null ? (
            <div className={classes.loading} style={{ marginTop: "-29px" }}>
              <CircularProgress />
            </div>
          ) : (
            <Grid>{showMyProject()}</Grid>
          )}
        </>
      )}
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
          <Grid
            sx={{
              p: 3,
              backgroundColor: "var(--surface1)",
              borderRadius: "4px",
              width: "50%",
              minWidth: "550px",
            }}
          >
            <Grid container justifyContent="space-between" sx={{ mb: 3 }}>
              <Grid sx={{ px: 1 }}>
                <span style={{ fontWeight: 600, fontSize: "18px" }}>
                  {t("Model loading supports Pytorch and tensorflow2.")}
                </span>
              </Grid>
              <CloseIcon
                id="deleteLabelIcon"
                className={classes.pointerCursor}
                onClick={closeLoadModelModal}
              />
            </Grid>
            <Grid sx={{ px: 3, textAlign: "center" }}>
              {isPreviewLoading ? (
                <Grid sx={{ textAlign: "center", py: 5 }}>
                  <CircularProgress size={40} sx={{ mb: 1 }} />
                  <Grid>
                    <b className={classes.text87}>
                      {t("Uploading file. Please wait a moment.")}
                    </b>
                  </Grid>
                </Grid>
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
                            <p
                              className={classes.dropzoneText}
                              style={{ marginTop: "8px", marginBottom: "8px" }}
                            >
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
                <Grid sx={{ mt: 4, mb: 2 }}>
                  <FileCopyIcon fontSize="large" />
                  <Grid>
                    <span className={classes.text87}>{previewText}</span>
                  </Grid>
                  <Button
                    id="uploadFileAgain"
                    shape="green"
                    sx={{ mt: 1.5 }}
                    onClick={() => {
                      deleteFiles();
                    }}
                  >
                    <span style={{ textDecoration: "underline" }}>
                      {t("Re-upload")}
                    </span>
                  </Button>
                </Grid>
              ) : (
                <Grid sx={{ my: 2 }} id="informText">
                  <span className={classes.text87}>
                    {t("No files uploaded. Please upload your data file.")}
                  </span>
                </Grid>
              )}
            </Grid>
            <Grid container justifyContent="flex-end" spacing={1} sx={{ p: 1 }}>
              <Grid item>
                <Button
                  id="closeLoadModelModal"
                  shape="whiteOutlined"
                  onClick={closeLoadModelModal}
                >
                  {t("Cancel")}
                </Button>
              </Grid>
              <Grid item>
                {files && isFilesUploadLoading == false ? (
                  <Button
                    id="nextLoadModelModal"
                    shape="greenOutlined"
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
                    <div>
                      <Button id="nextLoadModelModal" disabled>
                        {isFilesUploadLoading == false
                          ? t("Confirm")
                          : t("Loading")}
                      </Button>
                    </div>
                  </Tooltip>
                )}
              </Grid>
            </Grid>
          </Grid>
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
        <div className={classes.modalSkyhubStartContainer}>
          <Grid container justifyContent="space-between">
            <div className={classes.modalTitleText}>{t("Start SKYHUB AI")}</div>
            <CloseIcon
              id="closeStartSkyhubModal"
              onClick={closeStartProjectModal}
              className={classes.modalCloseIcon}
            />
          </Grid>
          <Table
            className={classes.table}
            aria-label="simple table"
            style={{ margin: "24px 0" }}
          >
            <TableHead>
              <TableRow>
                {["", "Click AI", "SKYHUB AI"].map((label) => (
                  <TableCell
                    className={classes.tableHead}
                    align="center"
                    style={{ width: "33%" }}
                  >
                    <div className={classes.tableHeader}>
                      <b>{t(label)}</b>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ["Inference function availability", "O", "O"],
                [
                  "AI model mounted server",
                  "Public Server (slow)",
                  "Dedicated Server (fast)",
                ],
                ["Data accumulation function for re-training", "X", "O"],
                ["region", "Korea", "Worldwide"],
                [
                  "cost",
                  "Proportional to the number of API calls",
                  "Proportional to the rental server size",
                ],
              ].map((labelArr) => (
                <TableRow className={classes.tableRow}>
                  {labelArr.map((label) => (
                    <TableCell
                      className={classes.tableRowCell}
                      align="center"
                      style={{ cursor: "default" }}
                    >
                      {t(label)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
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
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(Project);
