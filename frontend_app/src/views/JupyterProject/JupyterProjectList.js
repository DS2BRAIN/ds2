import React, { useState, useEffect } from "react";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import TablePagination from "@material-ui/core/TablePagination";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import Modal from "@material-ui/core/Modal";
import LinearProgress from "@material-ui/core/LinearProgress";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import Samples from "components/Templates/Samples.js";
import CloseIcon from "@material-ui/icons/Close";
import currentTheme from "assets/jss/custom.js";
import { currentThemeColor } from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import {
  askModalRequestAction,
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import { useTranslation } from "react-i18next";
import { getJupyterProjectsRequestAction } from "redux/reducers/projects";
import { ReactTitle } from "react-meta-tags";
import Dropzone from "react-dropzone";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import DeleteIcon from "@material-ui/icons/Delete";
import * as api from "../../controller/api";
import { askDeleteJupyterProjectsReqeustAction } from "../../redux/reducers/messages";
import ProjectIntro from "components/Guide/ProjectIntro";
import { putUserRequestActionWithoutMessage } from "../../redux/reducers/user";
import { fileurl } from "controller/api";
import { CircularProgress, Grid } from "@mui/material";
import SearchInputBox from "components/Table/SearchInputBox";
import Button from "components/CustomButtons/Button";

const Project = ({ history }) => {
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

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectCheckedValue, setProjectCheckedValue] = useState({
    all: false,
  });
  const [isCategoryClicked, setIsCategoryClicked] = useState(false);
  const [searchedValue, setSearchedValue] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [sortingValue, setSortingValue] = useState("created_at");
  const [isSortDesc, setIsSortDesc] = useState(true);
  const [projectPage, setProjectPage] = useState(0);
  const [projectRowsPerPage, setProjectRowsPerPage] = useState(10);
  const [isShared, setIsShared] = useState(false);
  const [isLoadModelModalOpen, setIsLoadModelModalOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewText, setPreviewText] = useState(null);
  const [files, setFiles] = useState(null);
  const [progress, setProgress] = useState(0);
  const url = window.location.href;
  const [introOn, setIntroOn] = useState(false);
  const [introOffClicked, setIntroOffClicked] = useState(false);
  const [projectCountLimit, setProjectCountLimit] = useState(
    process.env.REACT_APP_ENTERPRISE ? 99999999999 : 5
  );
  const [isProjectRequested, setIsProjectRequested] = useState(false);

  const logoBlue = fileurl + "asset/front/img/logo_title.png";

  useEffect(() => {
    const state = history.location.state;
    if (state && state.projectModalOpen) {
      setIsModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (previewText) {
      setIsPreviewLoading(false);
    }
  }, [previewText]);

  useEffect(() => {
    if (user.me && !user.me.intro3Checked) {
      setIntroOn(true);
    } else {
      setIntroOn(false);
    }
  }, [user]);

  useEffect(() => {
    if (introOffClicked) {
      setIntroOn(false);
      user.me.intro3Checked = true;
      dispatch(
        putUserRequestActionWithoutMessage({
          intro3Checked: true,
        })
      );
    }
  }, [introOffClicked]);

  useEffect(() => {
    if (url && projects.jupyterProjects) {
      (async () => {
        await setProjectSettings();
      })();
    }
  }, [projects.jupyterProjects]);

  useEffect(() => {
    if (url) {
      (async () => {
        await setIsLoading(true);
        setSearchedValue("");
        setSortingValue("created_at");
        setIsSortDesc(true);
        const projectTab = url.split("?tab=")[1]; // tab이 바뀜에 따라 projectRequest 해주기
        if (projectTab) {
          setActiveStep(projectTab);
          setIsProjectRequested(true);
        } else {
          setActiveStep("all");
          setIsProjectRequested(true);
        }
      })();
    }
  }, [url]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsLoading(false);
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (isCategoryClicked) setIsCategoryClicked(false);
  }, [isCategoryClicked]);

  useEffect(() => {
    setProjectPage(0);
    setIsProjectRequested(true);
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
      tab: activeStep,
      isDesc: isSortDesc,
      searching: searchedValue,
      isshared: isShared,
    };
    dispatch(getJupyterProjectsRequestAction(payloadJson));
  };

  const setProjectSettings = () => {
    setProjectCheckedValue({ all: false });
    for (let i = 0; i < projects.jupyterProjects.length; i++) {
      const value = projects.jupyterProjects[i].id;
      setProjectCheckedValue((prevState) => {
        return { ...prevState, [value]: false };
      });
    }
    setIsLoading(false);
  };

  const openStartProject = () => {
    history.push("/admin/newjupyterproject/");
  };

  const goProjectDetail = (id) => {
    history.push(`/admin/jupyterproject/${id}`);
  };

  const onSetProjectCheckedValue = (data) => {
    const value = data[0];
    setProjectCheckedValue((prevState) => {
      return {
        ...prevState,
        all: false,
        [value]: !projectCheckedValue[value],
      };
    });
  };

  const deleteProject = async () => {
    const deleteProjectsArr = [];
    for (let project in projectCheckedValue) {
      if (project !== "all" && projectCheckedValue[project]) {
        deleteProjectsArr.push(project);
      }
    }
    dispatch(
      askDeleteJupyterProjectsReqeustAction({
        projects: deleteProjectsArr,
        sortInfo: {
          sorting: sortingValue,
          count: projectRowsPerPage,
          start: projectPage,
          tab: activeStep,
          isDesc: isSortDesc,
        },
      })
    );
    setSearchedValue("");
  };

  const handleProjectChangePage = (event, newPage) => {
    setIsLoading(true);
    setProjectPage(newPage);
    setIsProjectRequested(true);
  };

  const handleChangeProjectRowsPerPage = (event) => {
    setIsLoading(true);
    setProjectRowsPerPage(+event.target.value);
    setProjectPage(0);
    setIsProjectRequested(true);
  };

  const onSetSortValue = async (value) => {
    await setIsLoading(true);
    if (value === sortingValue) {
      let tempIsSortDesc = isSortDesc;
      setIsSortDesc(!tempIsSortDesc);
      setProjectPage(0);
      setIsProjectRequested(true);
    } else {
      setIsSortDesc(true);
      setSortingValue(value);
      setProjectPage(0);
      setIsProjectRequested(true);
    }
  };

  const tableHeads = [
    { value: "No", width: "10%", name: "" },
    { value: "프로젝트명", width: "40%", name: "projectName" },
    //{ value: "역할", width: "10%", name: "role" },
    { value: "", width: "10%", name: "" },
    { value: "생성일", width: "20%", name: "created_at" },
    // { value: "진행상태", width: "20%", name: "status" },
  ];

  const tableBodys = ["projectName", "role", "created_at", "status"];

  const showMyProject = () => {
    let datas = [];
    const optionObj = {
      speed: t("Speed"),
      accuracy: t("Accuracy"),
      colab: t("Generate code"),
    };
    const methodObj = {
      normal: t("General"),
      text: t("Natural Language Processing (NLP)"),
      image: t("Image"),
      normal_regression: t("General Regression"),
      normal_classification: t("General Category Classification"),
      object_detection: t("Object Detection"),
      cycle_gan: t("Generative Adversarial Network (GAN)"),
      time_series: t("Time Series Prediction"),
      time_series_classification: t("Time Series Prediction"),
      time_series_regression: t("Time Series Prediction"),
      recommender: t("Recommendation system (matrix)"),
    };

    for (
      let i = 0;
      projects.jupyterProjects && i < projects.jupyterProjects.length;
      i++
    ) {
      let status = "";
      if (projects.jupyterProjects[i].status === 0) {
        status = t("Ready");
      } else if (projects.jupyterProjects[i].status === 100) {
        status = t("Completed");
      } else if (
        projects.jupyterProjects[i].status === 99 ||
        projects.jupyterProjects[i].status === 9 ||
        projects.jupyterProjects[i].status < 0
      ) {
        status = t("Error");
      } else {
        status = t("In progress");
      }
      const prj = projects.jupyterProjects[i];
      const project = [
        prj.id,
        projectRowsPerPage * projectPage + (i + 1),
        prj.projectName,
        prj.role,
        projects.jupyterProjects[i].created_at
          ? projects.jupyterProjects[i].created_at
          : "",
        (status = ""),
      ];
      datas.push(project);
    }
    if (
      !isLoading &&
      (!projects.jupyterProjects || projects.jupyterProjects.length === 0)
    ) {
      return (
        <div className="emptyListTable">
          {searchedValue
            ? user.language === "ko"
              ? `"${searchedValue}" ` +
                "에 대한 검색 결과가 없습니다. 다시 검색해주세요."
              : `There were no results found for "${searchedValue}"`
            : t(
                "There is no jupyter project in process. Please create a new project"
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
                    ></TableCell>
                  )}
                  {tableHeads.map((tableHead, idx) => {
                    return (
                      <TableCell
                        id="mainHeader"
                        key={idx}
                        className={classes.tableHead}
                        align="center"
                        width={tableHead.width}
                        style={{
                          cursor:
                            tableHead.value !== "No" ? "pointer" : "default",
                        }}
                        onClick={() =>
                          tableHead.value !== "No" &&
                          onSetSortValue(tableHead.name)
                        }
                      >
                        <div className={classes.tableHeader}>
                          {sortingValue === tableHead.name &&
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
                  <TableCell
                    className={classes.tableHead}
                    align="center"
                    style={{ width: "10%" }}
                  >
                    {/* <div className={classes.tableHeader}>
                      <b>{t("Delete Abusing")}</b>
                    </div> */}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datas.map((data, idx) => (
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
                    {!isShared && (
                      <TableCell align="left" className={classes.tableRowCell}>
                        <Checkbox
                          value={data[0]}
                          checked={projectCheckedValue[data[0]] ? true : false}
                          onChange={() => onSetProjectCheckedValue(data)}
                          className={classes.tableCheckBox}
                        />
                      </TableCell>
                    )}
                    {data.map((d, i) => {
                      if (i > 0) {
                        var statusColor = currentTheme.text1;
                        var isStatus = "";
                        if (
                          typeof d === "string" &&
                          d.indexOf(t("Ready")) > -1
                        ) {
                          statusColor = "#6B6B6B";
                          isStatus = true;
                        }
                        if (
                          typeof d === "string" &&
                          d.indexOf(t("In progress")) > -1
                        ) {
                          statusColor = "#1BC6B4";
                          isStatus = true;
                        }
                        if (
                          typeof d === "string" &&
                          d.indexOf(t("Error")) > -1
                        ) {
                          statusColor = "#BD2020";
                          isStatus = true;
                        }
                        if (
                          typeof d === "string" &&
                          d.indexOf(t("Completed")) > -1
                        ) {
                          statusColor = "#0A84FF";
                          isStatus = true;
                        }
                        return (
                          <TableCell
                            key={`row_${idx}_cell_${i}`}
                            className={classes.tableRowCell}
                            align="center"
                            onClick={() => goProjectDetail(data[0])}
                          >
                            <div
                              style={{
                                wordBreak: "break-all",
                                color: statusColor,
                              }}
                            >
                              <div
                                style={{
                                  display: isStatus ? "inline" : "none",
                                }}
                              >
                                ⦁
                              </div>{" "}
                              {i == 4
                                ? d.substring(0, 10)
                                : i == 6
                                ? d <= 0
                                  ? t("Enable")
                                  : d + t("minutes")
                                : d}
                            </div>
                          </TableCell>
                        );
                      }
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Grid container justifyContent="space-between" alignItems="center">
            <Button
              id="deleteProject"
              shape="redOutlined"
              size="sm"
              disabled={!Object.values(projectCheckedValue).includes(true)}
              onClick={deleteProject}
            >
              {t("Delete selection")}
            </Button>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={
                projects.jupyterTotalLength
                  ? projects.jupyterTotalLength[activeStep]
                  : 0
              }
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

    await api
      .postProjectWithModelFile(files)
      .then((res) => {
        if (res.data) {
          dispatch(
            openSuccessSnackbarRequestAction(t("The model has been uploaded."))
          );
          window.location.href = `/admin/train/` + res.data.id;
        }
      })
      .catch((err) => {
        if (err.response.data.code === "5030001") {
          dispatch(
            openErrorSnackbarRequestAction(t("This is not a valid model file."))
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(t("Please try again in a moment."))
          );
        }
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
        <ProjectIntro
          setIntroOn={setIntroOn}
          setIntroOffClicked={setIntroOffClicked}
          useTranslation={useTranslation}
        />
      ) : (
        <>
          <ReactTitle title={"DS2.AI - " + t("Lease Training Server")} />
          <GridItem xs={12} style={currentTheme.titleGridItem}>
            <div className={classes.topTitle}>{t("Lease Training Server")}</div>
            <div className={classes.subTitleText}>
              {t(
                "Create a new project to lease a cloud training server and start custom development."
              )}
            </div>
          </GridItem>
          <>
            <GridContainer
              style={{
                display: "flex",
                alignItems: "center",
                margin: "1.5rem 0",
              }}
            >
              <GridItem
                xs={8}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Button
                  id="add_project_btn"
                  className={`${classes.defaultGreenContainedButton} ${classes.neoBtnH32}`}
                  onClick={() => {
                    if (projects?.jupyterProjects?.length < projectCountLimit)
                      openStartProject();
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
                <SearchInputBox
                  tooltipText={t("Enter the project name")}
                  setSearchedValue={setSearchedValue}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              {projects.isLoading || projects.jupyterProjects == null ? (
                <>
                  <div className={classes.loading}>
                    <CircularProgress />
                  </div>
                </>
              ) : (
                <GridItem xs={12} sm={12} md={12}>
                  {showMyProject()}
                </GridItem>
              )}
            </GridContainer>
          </>
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
            <div className={classes.gridRoot} style={{ height: "100%" }}>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <img
                  style={{ width: "124px" }}
                  src={logoBlue}
                  alt={"logo"}
                  className={classes.logo}
                />
                <CloseIcon id="deleteLabelIcon" onClick={closeLoadModelModal} />
              </div>
              <>
                <GridItem xs={12}>
                  <div>
                    {t("Model loading supports Pytorch and tensorflow2.")}
                  </div>
                </GridItem>
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
                        {projects.isLoading ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              marginTop: "20px",
                            }}
                          >
                            <CircularProgress size={20} sx={{ mb: 2 }} />
                            <b className={classes.text87}>
                              {t("Uploading file. Please wait a moment.")}
                            </b>
                          </div>
                        ) : (
                          <Dropzone onDrop={dropFiles}>
                            {({ getRootProps, getInputProps }) => (
                              <>
                                {!files && (
                                  <div className="container fileUploadArea dropzoneArea">
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
                    <GridItem xs={3}></GridItem>
                    <GridItem xs={3}></GridItem>
                    <GridItem xs={3}>
                      <Button
                        id="closeLoadModelModal"
                        style={{ width: "100%" }}
                        className={classes.defaultOutlineButton}
                        onClick={closeLoadModelModal}
                      >
                        {t("Cancel")}
                      </Button>
                    </GridItem>
                    <GridItem xs={3}>
                      <Button
                        id="nextLoadModelModal"
                        style={{ width: "100%" }}
                        className={classes.defaultHighlightButton}
                        onClick={confirmLoadModelModal}
                      >
                        {t("Confirm")}
                      </Button>
                    </GridItem>
                  </>
                </GridContainer>
              </GridItem>
            </GridContainer>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default React.memo(Project);
