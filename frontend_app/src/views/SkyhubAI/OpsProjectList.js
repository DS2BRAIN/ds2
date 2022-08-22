import React, { useState, useEffect } from "react";

import * as api from "../../controller/api";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import { askDeleteOpsProjectsReqeustAction, askModalRequestAction, openErrorSnackbarRequestAction, openSuccessSnackbarRequestAction } from "redux/reducers/messages.js";
import { postUploadFileRequestAction, setObjectlistsSearchedValue } from "redux/reducers/labelprojects.js";
import { getOpsProjectsRequestAction } from "redux/reducers/projects";
import { putUserRequestActionWithoutMessage } from "../../redux/reducers/user";
import { IS_ENTERPRISE } from "variables/common";
import Button from "components/CustomButtons/Button";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import SearchInputBox from "components/Table/SearchInputBox";
import SkyhubIntro from "components/Guide/SkyhubIntro";

import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";
import Dropzone from "react-dropzone";
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
import Tooltip from "@material-ui/core/Tooltip";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import DeleteIcon from "@material-ui/icons/Delete";
import { CircularProgress, Grid } from "@mui/material";

function getSteps() {
  return ["데이터 준비", "준비 완료", "인공지능 학습 중", "데이터 분석 / 예측"];
}

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
  const [selectedPage, setSelectedPage] = useState("myproject");
  const [isShared, setIsShared] = useState(false);
  const [isLoadModelModalOpen, setIsLoadModelModalOpen] = useState(false);
  const [isOpenStartModalOpen, setIsOpenStartModalOpen] = useState(false);
  const [openFileModal, setOpenFileModal] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewText, setPreviewText] = useState(null);
  const [files, setFiles] = useState(null);
  const [progress, setProgress] = useState(0);
  const steps = getSteps();
  const url = window.location.href;
  const [completed, setCompleted] = useState(0);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploadFileChanged, setIsUploadFileChanged] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [introOn, setIntroOn] = useState(false);
  const [introOffClicked, setIntroOffClicked] = useState(false);
  const [projectCountLimit, setProjectCountLimit] = useState(IS_ENTERPRISE ? 999999999 : 5); //instance 개수 제한 (n+1)개 까지 가능
  const [isFilesUploadLoading, setIsFilesUploadLoading] = useState(false);
  const [isSearchValSubmitted, setIsSearchValSubmitted] = useState(false);
  const [isProjectRequested, setIsProjectRequested] = useState(false);

  // const [tableData, setTableData] = useState([[]]);  => 어뷰징 남은시간 코드
  // const [timeTick, setTimeTick] = useState(0);

  // useEffect(() => {
  //   let timer = setTimeout(() => {
  //     setTimeTick(timeTick + 1);
  //   }, 6000);
  // }, [timeTick]);

  // useEffect(() => {
  //   setTableData(showMyProject());
  // }, [projects, timeTick, projectCheckedValue,user.language]);

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
    if (url) {
      (async () => {
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
    };
    dispatch(getOpsProjectsRequestAction(payloadJson));
  };

  useEffect(() => {
    if (isCategoryClicked) setIsCategoryClicked(false);
  }, [isCategoryClicked]);

  useEffect(() => {
    // 파일 업로드 모달창 닫아질때마다 초기값 세팅
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
    //프로젝트 체크박스 value 세팅
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
    // if(parseInt(user.me.cumulativeProjectCount) >= parseInt(user.me.usageplan.projects) + parseInt(user.me.remainProjectCount)){
    //   dispatch(openErrorSnackbarRequestAction(`${t('You can’t add a new project. You’ve reached the maximum number of projects allowed for your account')} ${t('계속 진행하시려면 이용플랜을 변경해주세요.')}`));
    //   return;
    // }
    if (user.cardInfo?.cardName && user.cardInfo?.created) {
      setIsOpenStartModalOpen(true);
    } else {
      setIsOpenStartModalOpen(true);
      //window.location.href = "/admin/setting/payment/?cardRequest=true";
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

  const goDataconnector = () => {
    history.push("/admin/dataconnector");
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
    nowTime = new Date(nowTime.getTime() + nowTime.getTimezoneOffset() * 60000).getTime() / 60000;
    if (option == null) return nowTime - updatedAt > 10;
    else return 10 - Math.floor(nowTime - updatedAt);
  };

  const onSetProjectCheckedValue = (data) => {
    let value = data[0];
    //if (isEnableToChange(data[3])) {
    setProjectCheckedValue((prevState) => {
      return {
        ...prevState,
        all: false,
        [value]: !projectCheckedValue[value],
      };
    });
    // } else {
    //   dispatch(
    //     openErrorSnackbarRequestAction(
    //       `${t("")}
    //       ${isEnableToChange(data[3], true)}
    //       ${t("minutes left")}
    //       `
    //     )
    //   );
    // }
  };

  const onSetProjectCheckedValueAll = () => {
    const result = projectCheckedValue["all"] ? false : true;
    const tmpObject = { all: result };
    //let isAllEnabled = true;
    for (let i = 0; i < projects.projects.length; i++) {
      //if (isEnableToChange(projects.projects[i].created_at)) {
      const id = projects.projects[i].id;
      tmpObject[id] = result;
      //} else {
      //  isAllEnabled = false;
      //}
    }
    // if (isAllEnabled == false && result == true) {
    //   dispatch(
    //     openSuccessSnackbarRequestAction(
    //       t("Projects created less than 10 minutes ago are excluded from selection.")
    //     )
    //   );
    // }
    setProjectCheckedValue(tmpObject);
  };

  // useEffect(() => {
  //   setIsLoading(messages.isAskSnackbarOpen);
  // }, [messages.isAskSnackbarOpen]);

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
    setIsLoading(true);
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

    for (let i = 0; projects.projects && i < projects.projects.length; i++) {
      let status = "";
      if (projects.projects[i].status === 0) {
        status = t("Ready");
      } else if (projects.projects[i].status === 100) {
        status = t("Completed");
      } else if (projects.projects[i].status === 99 || projects.projects[i].status === 9 || projects.projects[i].status < 0) {
        status = t("Error");
      } else {
        status = t("In progress");
      }
      const prj = projects.projects[i];
      const project = [
        prj.id,
        projectRowsPerPage * projectPage + (i + 1),
        prj.projectName,
        projects.projects[i].created_at ? projects.projects[i].created_at : "",
        //isEnableToChange(prj.created_at, 1),
      ];
      datas.push(project);
    }
    //if (!isLoading && (!projects.projects || projects.projects.length === 0)) {
    if (!projects.projects || projects.projects.length === 0) {
      return (
        <div className="emptyListTable">{searchedValue ? (user.language === "ko" ? `"${searchedValue}" ` + "에 대한 검색 결과가 없습니다. 다시 검색해주세요." : `There were no results found for "${searchedValue}"`) : t("There is no deployed project in process. Please create a new project")}</div>
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
                    <TableCell className={classes.tableHead} align="left" style={{ width: "5%" }}>
                      {/* <Checkbox
                        value="all"
                        checked={projectCheckedValue["all"]}
                        onChange={onSetProjectCheckedValueAll}
                      /> */}
                    </TableCell>
                  )}
                  <TableCell className={classes.tableHead} style={{ width: "5%" }} align="center">
                    <b style={{ color: currentThemeColor.textMediumGrey }}>No</b>
                  </TableCell>
                  <TableCell className={classes.tableHead} align="center" style={{ width: "40%", cursor: "pointer" }} onClick={() => onSetSortValue("projectName")}>
                    <div className={classes.tableHeader}>
                      {sortingValue === "projectName" && (!isSortDesc ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                      <b>{t("Project name")}</b>
                    </div>
                  </TableCell>
                  <TableCell className={classes.tableHead} align="center" style={{ width: "15%", cursor: "pointer" }} onClick={() => onSetSortValue("created_at")}>
                    <div className={classes.tableHeader}>
                      {sortingValue === "created_at" && (!isSortDesc ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                      <b>{t("Date created")}</b>
                    </div>
                  </TableCell>
                  {/* <TableCell
                    className={classes.tableHead}
                    align="center"
                    style={{ width: "10%" }}
                  >
                    <div className={classes.tableHeader}>
                      <b>{t("Delete Abusing")}</b>
                    </div>
                  </TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {datas.map((data, idx) => (
                  <TableRow
                    key={`tableRow_${idx}`}
                    className={classes.tableRow}
                    style={{
                      background: idx % 2 === 0 ? currentTheme.tableRow1 : currentTheme.tableRow2,
                    }}
                  >
                    {!isShared && (
                      <TableCell align="left" className={classes.tableRowCell}>
                        <Checkbox value={data[0]} checked={projectCheckedValue[data[0]] ? true : false} onChange={() => onSetProjectCheckedValue(data)} className={classes.tableCheckBox} />
                      </TableCell>
                    )}
                    {data.map((d, i) => {
                      if (i > 0) {
                        var statusColor = currentTheme.text1;
                        var isStatus = "";
                        if (typeof d === "string" && d.indexOf(t("Ready")) > -1) {
                          statusColor = "#6B6B6B";
                          isStatus = true;
                        }
                        if (typeof d === "string" && d.indexOf(t("In progress")) > -1) {
                          statusColor = "#1BC6B4";
                          isStatus = true;
                        }
                        if (typeof d === "string" && d.indexOf(t("Error")) > -1) {
                          statusColor = "#BD2020";
                          isStatus = true;
                        }
                        if (typeof d === "string" && d.indexOf(t("Completed")) > -1) {
                          statusColor = "#0A84FF";
                          isStatus = true;
                        }
                        return (
                          <TableCell key={`tableRow_${idx}_tableCell_${i}`} className={classes.tableRowCell} align="center" onClick={() => goProjectDetail(data[0])}>
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
                              {i == 3 ? d.substring(0, 10) : d}
                              {/* {idx == 3
                                ? d.substring(0, 10)
                                : idx == 4
                                ? d <= 0
                                  ? t("Enable")
                                  : d + t("minutes")
                                : d} */}
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
            <Button id="deleteProject" style={{ width: "80px" }} disabled={!Object.values(projectCheckedValue).includes(true)} className={Object.values(projectCheckedValue).includes(true) ? classes.defaultDeleteButton : classes.defaultDisabledButton} onClick={deleteProject}>
              <CloseIcon id={Object.values(projectCheckedValue).includes(true) ? "deleteActivateBtn" : "deleteLabelIcon"} />
              {t("Delete")}
            </Button>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={projects.totalLength ? (projects.totalLength[activeStep] ? projects.totalLength[activeStep] : 0) : 0}
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

  const openTemplate = () => {
    setIsTemplateModalOpen(true);
  };

  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
  };

  const onSetActiveStep = (idx) => {
    switch (idx) {
      case 0:
        history.push("/admin/dataconnector");
        return;
      case 1:
        history.push("/admin/project/?tab=ready");
        return;
      case 2:
        history.push("/admin/project/?tab=developing");
        return;
      case 3:
        history.push("/admin/project/?tab=done");
        return;
      default:
        return;
    }
  };

  const renderStepper = () => {
    let activeStepNum = -1;
    switch (activeStep) {
      case "ready":
        activeStepNum = 1;
        break;
      case "developing":
        activeStepNum = 2;
        break;
      case "done":
        activeStepNum = 3;
        break;
      default:
        break;
    }

    return (
      <div className={classes.defaultContainer}>
        <div className={activeStepNum === 0 || activeStepNum === -1 ? classes.stepperActivedContainer : classes.stepperDeactivatedContainer}>
          <div
            onClick={() => {
              onSetActiveStep(0);
            }}
            className={activeStepNum === 0 || activeStepNum === -1 ? classes.stepperBlueActivatedDiv : classes.stepperBlueOpacityDiv}
          >
            <div>1</div>
          </div>
          <div style={{ fontSize: "10px" }}>{t("Data Preparation")}</div>
        </div>

        <div className={activeStepNum === -1 ? classes.stepperActivatedGreenLine : activeStepNum < 1 ? classes.stepperDeactivatedLine : classes.stepperOpacityGreenLine}></div>

        <div className={activeStepNum === 1 || activeStepNum === -1 ? classes.stepperActivedContainer : classes.stepperDeactivatedContainer}>
          <div
            onClick={() => {
              onSetActiveStep(1);
            }}
            className={activeStepNum === 1 || activeStepNum === -1 ? classes.stepperGreenActivatedDiv : activeStepNum < 1 ? classes.stepperDeactivatedDiv : classes.stepperGreenOpacityDiv}
          >
            <div>2</div>
          </div>
          <div style={{ fontSize: "10px" }}>{t("Data Selection")}</div>
        </div>

        <div className={activeStepNum === -1 ? classes.stepperActivatedBlueLine : activeStepNum < 2 ? classes.stepperDeactivatedLine : classes.stepperOpacityBlueLine}></div>

        <div className={activeStepNum === 2 || activeStepNum === -1 ? classes.stepperActivedContainer : classes.stepperDeactivatedContainer}>
          <div
            onClick={() => {
              onSetActiveStep(2);
            }}
            className={activeStepNum === 2 || activeStepNum === -1 ? classes.stepperBlueActivatedDiv : activeStepNum < 2 ? classes.stepperDeactivatedDiv : classes.stepperBlueOpacityDiv}
          >
            <div>3</div>
          </div>
          <div style={{ fontSize: "10px" }}>{t("In progress")}</div>
        </div>

        <div className={activeStepNum === -1 ? classes.stepperActivatedGreenLine : activeStepNum < 3 ? classes.stepperDeactivatedLine : classes.stepperOpacityGreenLine}></div>

        <div className={activeStepNum === 3 || activeStepNum === -1 ? classes.stepperActivedContainer : classes.stepperDeactivatedContainer}>
          <div
            onClick={() => {
              onSetActiveStep(3);
            }}
            className={activeStepNum === 3 || activeStepNum === -1 ? classes.stepperGreenActivatedDiv : classes.stepperDeactivatedDiv}
          >
            <div>4</div>
          </div>
          <div style={{ fontSize: "10px" }}>{t("Data Analysis/Prediction")}</div>
        </div>
      </div>
    );
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
    if (filename.toLowerCase().indexOf(".pth") === -1 && filename.toLowerCase().indexOf(".zip") === -1) {
      dispatch(openErrorSnackbarRequestAction(t("Please upload a pth file or a zip file.")));
      return;
    }

    setIsPreviewLoading(true);
    setFiles(files[0]);
    dispatch(openSuccessSnackbarRequestAction(t("The file(s) has been uploaded")));
    setPreviewText(filename);
  };

  const deleteFiles = () => {
    setProgress(0);
    setFiles(null);
    setPreviewText(null);
    dispatch(openSuccessSnackbarRequestAction(t("The file(s) has been deleted")));
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
          dispatch(openSuccessSnackbarRequestAction(t("The model has been uploaded.")));
          window.location.href = `/admin/newskyhubai/?modelid=` + res.data.model.id;
        }
      })
      .catch((err) => {
        if (err.response?.data?.code === "5030001") {
          dispatch(openErrorSnackbarRequestAction(t("This is not a valid model file.")));
        } else {
          dispatch(openErrorSnackbarRequestAction(t("Please try again in a moment.")));
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
        <SkyhubIntro setIntroOn={setIntroOn} setIntroOffClicked={setIntroOffClicked} useTranslation={useTranslation} userLang={user.language} />
      ) : (
        <>
          <ReactTitle title={"DS2.AI - " + t("Deploy")} />
          <GridItem xs={12} style={currentTheme.titleGridItem}>
            <div className={classes.topTitle}>{t("Deploy to an inference server")}</div>
            <div className={classes.subTitleText}>{t("Deploy models with just one click.")}</div>
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
                className={`${classes.defaultGreenContainedButton} ${classes.neoBtnH32}`}
                onClick={() => {
                  if (projects?.projects?.length < projectCountLimit)
                    if (IS_ENTERPRISE) setIsLoadModelModalOpen(true);
                    else openStartProjectModal();
                  else {
                    dispatch(openSuccessSnackbarRequestAction(t("More than 6 items are available through inquiries from the sales team.")));
                  }
                }}
              >
                {t("New Project")}
              </Button>
            </GridItem>
            <GridItem xs={4}>
              <SearchInputBox tooltipText={t("Enter the project name")} setSearchedValue={setSearchedValue} />
            </GridItem>
            {/* <GridItem
                  xs={12}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "30px",
                  }}
                >
                  {user.me && (
                    <div className={classes.fullWidthAlignRightContainer}>
                      <div
                        style={{
                          width: "10%",
                          minWidth: "200px",
                          fontSize: "12px",
                        }}
                      >
                        <div style={{ display: "flex" }}>
                          <div>{t("Total projects")}</div>
                          <div
                            id="projectCountText"
                            style={{ marginLeft: "auto" }}
                          >
                            <span id="projectCountText">
                              {(+user.me
                                .cumulativeProjectCount).toLocaleString()}{" "}
                              /{" "}
                              {user.me.usageplan.planName === "trial"
                                ? 0
                                : (
                                    +user.me.remainProjectCount +
                                    +user.me.usageplan.projects *
                                      (user.me.dynos ? +user.me.dynos : 1) +
                                    +user.me.additionalProjectCount
                                  ).toLocaleString()}{" "}
                              {t("")}
                            </span>
                          </div>
                        </div>
                        <LinearProgress
                          variant="determinate"
                          color="blue"
                          value={
                            (+user.me.cumulativeProjectCount /
                              (user.me.usageplan.planName === "trial"
                                ? 0
                                : +user.me.remainProjectCount +
                                  +user.me.usageplan.projects *
                                    (user.me.dynos ? +user.me.dynos : 1) +
                                  +user.me.additionalProjectCount)) *
                            100
                          }
                        />
                      </div>
                    </div>
                  )}
                </GridItem> */}
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
      <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={isTemplateModalOpen} onClose={closeTemplateModal} className={classes.modalContainer}>
        <Samples className={classes.predictModalContent} closeTemplateModal={closeTemplateModal} history={history} />
      </Modal>
      <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={isLoadModelModalOpen} onClose={closeLoadModelModal} className={classes.modalContainer}>
        {isLoading ? (
          <div className={classes.modalLoading}>
            {/* <Tip /> */}
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
                  <div>{t("Model loading supports Pytorch and tensorflow2.")}</div>
                </GridItem>
                <CloseIcon xs={1} id="deleteLabelIcon" className={classes.pointerCursor} onClick={closeLoadModelModal} />
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
                      <div className={classes.uploadContent} style={{ width: "95%" }}>
                        {isPreviewLoading ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              marginTop: "20px",
                            }}
                          >
                            <CircularProgress size={20} style={{ mb: 2 }} />
                            <b className={classes.text87}>{t("Uploading file. Please wait a moment.")}</b>
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
                                        {t("Drag the file or click the box to upload it!")}
                                        <br />
                                        {t("Only PTH and ZIP files under 5GB are supported.")}
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
                                  borderBottom: "2px solid " + currentThemeColor.secondary1,
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
                          <div style={{ marginTop: "40px" }} className={classes.text87} id="informText">
                            {t("No files uploaded. Please upload your data file.")} <br />
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
                      <Button id="closeLoadModelModal" style={{ width: "100%", height: "1.7rem" }} className={classes.defaultF0F0OutlineButton} onClick={closeLoadModelModal}>
                        {t("Cancel")}
                      </Button>
                    </GridItem>
                    <GridItem xs={3}>
                      {files && isFilesUploadLoading == false ? (
                        <Button id="nextLoadModelModal" style={{ width: "100%", height: "1.7rem" }} className={classes.defaultGreenOutlineButton} onClick={confirmLoadModelModal}>
                          {t("Confirm")}
                        </Button>
                      ) : (
                        <Tooltip title={<span style={{ fontSize: "11px" }}>{t("Upload file")}</span>} placement="bottom">
                          <Button id="nextLoadModelModal" style={{ width: "100%", height: "1.7rem" }} className={classes.defaultDisabledButton} disabled>
                            {isFilesUploadLoading == false ? t("Confirm") : t("Loading")}
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
      {/* start project modal */}
      <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={isOpenStartModalOpen} onClose={closeStartProjectModal} className={classes.modalContainer} style={{ wordBreak: "keep-all" }}>
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
                <div className={classes.modalTitleText}>{t("Start SKYHUB AI")}</div>
              </GridItem>
              <GridItem xs={1} style={{ padding: "0px" }}>
                <CloseIcon id="closeStartSkyhubModal" onClick={closeStartProjectModal} className={classes.modalCloseIcon} />
              </GridItem>
            </GridContainer>
            <GridContainer style={{ marginTop: "10px" }}>
              <GridItem
                xs={12}
                style={{
                  marginBottom: "5px",
                }}
              >
                <Table className={classes.table} aria-label="simple table" style={{ wordBreak: "keep-all" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell className={classes.tableHead} align="center" style={{ width: "33%" }}>
                        <div className={classes.tableHeader}>
                          <b>{t("")}</b>
                        </div>
                      </TableCell>
                      <TableCell className={classes.tableHead} align="center" style={{ width: "33%" }}>
                        <div className={classes.tableHeader}>
                          <b>{t("Click AI")}</b>
                        </div>
                      </TableCell>
                      <TableCell className={classes.tableHead} align="center" style={{ width: "33%" }}>
                        <div className={classes.tableHeader}>
                          <b>{t("SKYHUB AI")}</b>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow className={classes.tableRow}>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("Inference function availability")}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("O")}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("O")}
                      </TableCell>
                    </TableRow>
                    <TableRow className={classes.tableRow}>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("AI model mounted server")}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("Public Server (slow)")}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("Dedicated Server (fast)")}
                      </TableCell>
                    </TableRow>
                    <TableRow className={classes.tableRow}>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("Data accumulation function for re-training")}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("X")}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("O")}
                      </TableCell>
                    </TableRow>
                    <TableRow className={classes.tableRow}>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("region")}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("Korea")}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("Worldwide")}
                      </TableCell>
                    </TableRow>
                    <TableRow className={classes.tableRow}>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("cost")}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("Proportional to the number of API calls")}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {t("Proportional to the rental server size")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}></TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }} onClick={goClickAI}>
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
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
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
      {/* model upload modal */}
      <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={openFileModal} onClose={closeFileModal} className={classes.modalContainer}>
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
              <LinearProgress style={{ width: "100%", height: "50px", marginTop: "20px" }} variant="determinate" value={completed} />
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
                    <div {...getRootProps({ className: "dropzoneArea" })} style={{ margin: "10px" }}>
                      <input {...getInputProps()} />
                      <p className={classes.settingFontWhite6}>
                        {t("Drag the file or click the box to upload it!")}
                        <br />
                        {t("Only image files (png/jpg/jpeg) or image compression files (zip) can be uploaded")}
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
                <Button id="close_modal_btn" style={{ width: "100%" }} className={classes.defaultOutlineButton} onClick={closeFileModal}>
                  {t("Cancel")}
                </Button>
              </GridItem>
              <GridItem xs={6}>
                {uploadFile ? (
                  <Button id="submitBtn" style={{ width: "100%" }} className={classes.defaultHighlightButton} onClick={saveFiles}>
                    {t("Next")}
                  </Button>
                ) : (
                  <Button id="submitBtn" style={{ width: "100%" }} className={classes.defaultDisabledButton} disabled>
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
