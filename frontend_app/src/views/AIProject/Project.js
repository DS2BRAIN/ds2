import React, { useState, useEffect } from "react";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import TablePagination from "@material-ui/core/TablePagination";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Modal from "@material-ui/core/Modal";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import LinearProgress from "@material-ui/core/LinearProgress";
import Loading from "components/Loading/Loading.js";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import Samples from "components/Templates/Samples.js";
import CloseIcon from "@material-ui/icons/Close";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from "@material-ui/icons/Add";
import currentTheme from "assets/jss/custom.js";
import { currentThemeColor } from "assets/jss/custom.js";
import Container from "@material-ui/core/Container";
import { useDispatch, useSelector } from "react-redux";
import {
  askDeleteProjectsReqeustAction,
  askModalRequestAction,
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import { useTranslation } from "react-i18next";
import {
  getProjectsRequestAction,
  getRecentJupyterProjectsRequestAction,
} from "redux/reducers/projects";
import { ReactTitle } from "react-meta-tags";
import Tip from "../../components/Loading/Tip";
import TextField from "@material-ui/core/TextField";
import Dropzone from "react-dropzone";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import DeleteIcon from "@material-ui/icons/Delete";
import * as api from "../../controller/api";
import Typography from "@material-ui/core/Typography";
import {
  PieChart,
  Pie,
  Legend,
  Tooltip as rechartsTooltip,
  Cell,
} from "recharts";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import ProjectIntro from "components/Guide/ProjectIntro";
import { putUserRequestActionWithoutMessage } from "../../redux/reducers/user";
import {
  convertToLocalDateStr,
  openChat,
} from "../../components/Function/globalFunc.js";
import { fileurl } from "controller/api";
import "assets/css/material-control.css";
import TrainTutorial from "components/Guide/TrainTutorial";

function getSteps() {
  return ["데이터 준비", "준비 완료", "인공지능 학습 중", "데이터 분석 / 예측"];
}

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

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectCheckedValue, setProjectCheckedValue] = useState({
    all: false,
  });
  const [isCategoryClicked, setIsCategoryClicked] = useState(false);
  const [searchedValue, setSearchedValue] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [sortingValue, setSortingValue] = useState("created_at");
  const [isSortDesc, setIsSortDesc] = useState(true);
  const [projectPage, setProjectPage] = useState(0);
  const [projectRowsPerPage, setProjectRowsPerPage] = useState(10);
  const [selectedPage, setSelectedPage] = useState("myproject");
  const [isShared, setIsShared] = useState(false);
  const [isLoadModelModalOpen, setIsLoadModelModalOpen] = useState(false);
  const [isNewStartModelModalOpen, setIsNewStartModelModalOpen] = useState(
    false
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewText, setPreviewText] = useState(null);
  const [files, setFiles] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const steps = getSteps();
  const url = window.location.href;
  const [introOn, setIntroOn] = useState(false);
  const [introOffClicked, setIntroOffClicked] = useState(false);
  const logoBlue = fileurl + "asset/front/img/logo_title.png";
  const etcs = fileurl + "asset/front/img/mainIcon/etcs.png";
  const finance = fileurl + "asset/front/img/mainIcon/finance.png";
  const insurance = fileurl + "asset/front/img/mainIcon/insurance.png";
  const manufacture = fileurl + "asset/front/img/mainIcon/manufacture.png";
  const marketing = fileurl + "asset/front/img/mainIcon/marketing.png";

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
    if (url && projects.recentJupyterProjects && projects.priority) {
      (async () => {
        // await setProjectSettings();
        await setIsLoading(false);
      })();
    }
  }, [projects]);

  useEffect(() => {
    if (url) {
      (async () => {
        await setIsLoading(true);
        setSearchedValue(null);
        setSortingValue("created_at");
        setIsSortDesc(true);
        //       const projectTab = url.split("?tab=")[1]; // tab이 바뀜에 따라 projectRequest 해주기
        //       if (projectTab) {
        //         setActiveStep(projectTab);
        //         dispatch(
        //           getProjectsRequestAction({
        //             sorting: "created_at",
        //             count: projectRowsPerPage,
        //             start: projectPage,
        //             tab: projectTab,
        //             isDesc: true,
        //             isshared: isShared,
        //           })
        //         );
        //         dispatch(
        //           getRecentProjectsRequestAction({
        //             sorting: "created_at",
        //             count: 3,
        //             start: 0,
        //             tab: "all",
        //             isDesc: true,
        //           })
        //         );
        //         dispatch(
        //           getRecentJupyterProjectsRequestAction({
        //             sorting: "created_at",
        //             count: 3,
        //             start: projectPage,
        //             tab: projectTab,
        //             isDesc: true,
        //             isshared: isShared,
        //           })
        //         );
        //       } else {
        //         setActiveStep("all");
        dispatch(
          getProjectsRequestAction({
            sorting: "created_at",
            count: 3,
            page: 0,
            tab: "all",
            isDesc: true,
          })
        );
        dispatch(
          getRecentJupyterProjectsRequestAction({
            sorting: "created_at",
            count: 3,
            start: projectPage,
            tab: "all",
            isDesc: true,
            isshared: isShared,
          })
        );
        // }
      })();
    }
  }, [url]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsLoadModelModalOpen(false);
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (isCategoryClicked) setIsCategoryClicked(false);
  }, [isCategoryClicked]);

  const goSamplePage = (id) => {
    history.push(`/admin/sample/${id}`);
  };

  // const setProjectSettings = () => {
  //   //프로젝트 체크박스 value 세팅
  //   setProjectCheckedValue({ all: false });
  //   for (let i = 0; i < projects.projects.length; i++) {
  //     const value = projects.projects[i].id;
  //     setProjectCheckedValue((prevState) => {
  //       return { ...prevState, [value]: false };
  //     });
  //   }
  // };

  const renderProcessingProject = () => {
    return projects.priority.map((project, idx) => {
      let trainingMethod = "없음";

      const data = [
        { name: "시작전", value: 1 - project.modelProgress },
        { name: "완료", value: project.modelProgress },
      ];

      const COLORS = ["#3A3B3C", "#41D4D7"];

      switch (project.trainingMethod) {
        case "normal":
          trainingMethod = "정형 데이터 분류";
          break;
        case "text":
          trainingMethod = "자연어";
          break;
        case "image":
          trainingMethod = "이미지 분류";
          break;
        case "object_detection":
          trainingMethod = "물체 인식";
          break;
        case "cycle_gan":
          trainingMethod = "이미지 생성(GAN)";
          break;
        case "normal_classification":
          trainingMethod = "정형 데이터 분류";
          break;
        case "normal_regression":
          trainingMethod = "정형 데이터 분류";
          break;
        case "time_series":
          trainingMethod = "시계열 예측";
          break;
      }

      let option = "없음";
      switch (project.option) {
        case "colab":
          option = "매직코드";
          break;
        case "accuracy":
          option = "정확도가 높게";
          break;
        case "speed":
          option = "학습속도가 빠르게";
          break;
        case "labeling":
          option = "오토라벨링";
          break;
      }

      return (
        <div
          className={classes.mainChartDiv}
          id={`myAIProject${idx}`}
          onClick={() => {
            history.push(`/admin/train/${project.id}`);
          }}
          style={{ marginRight: "30px" }}
        >
          <div
            className={classes.modalContainer}
            style={{ flexDirection: "column" }}
          >
            <PieChart width={66} height={66}>
              <Pie
                dataKey="value"
                data={data}
                innerRadius={25}
                outerRadius={30}
              >
                {data.map((entry, index) => (
                  <Cell fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <div className={classes.smallFontWhite87}>
              {project.status === 0
                ? t("On Queue")
                : t("In Progress ") +
                  (project.modelProgress * 100).toFixed(0) +
                  "%"}
            </div>
          </div>
          <div style={{ paddingLeft: "18px" }}>
            <div className={classes.text}>
              <b>
                {project.projectName && project.projectName.length > 20
                  ? project.projectName.substring(0, 18) + " ..."
                  : project.projectName}
              </b>
            </div>
            <div className={classes.upgradePlanSubTitle}>
              {t(trainingMethod)}
            </div>
            <div className={classes.upgradePlanSubTitle}>{t(option)}</div>
            <div className={classes.upgradePlanSubTitle}>
              {convertToLocalDateStr(project.updated_at)}
            </div>
          </div>
        </div>
      );
    });
  };

  const onGotoLabelingPage = () => {
    history.push("/admin/labelling");
  };

  const goCustomTraining = () => {
    history.push("/admin/jupyterproject");
  };

  const goAutoML = () => {
    history.push("/admin/train");
  };

  const goConsultant = () => {
    openChat();
    closeNewStartModelModal();
  };

  const goProjectDetail = (id) => {
    history.push(`/admin/train/${id}`);
  };

  const goJupyterProjectDetail = (id) => {
    history.push(`/admin/jupyterproject/${id}`);
  };

  // const onSetProjectCheckedValue = (value) => {
  //   setProjectCheckedValue((prevState) => {
  //     return { ...prevState, all: false, [value]: !projectCheckedValue[value] };
  //   });
  // };

  // const onSetProjectCheckedValueAll = () => {
  //   const result = projectCheckedValue["all"] ? false : true;
  //   const tmpObject = { all: result };
  //   for (let i = 0; i < projects.projects.length; i++) {
  //     const id = projects.projects[i].id;
  //     tmpObject[id] = result;
  //   }
  //   setProjectCheckedValue(tmpObject);
  // };

  // const deleteProject = async () => {
  //   const deleteProjectsArr = [];
  //   for (let project in projectCheckedValue) {
  //     if (project !== "all" && projectCheckedValue[project]) {
  //       deleteProjectsArr.push(project);
  //     }
  //   }
  //   dispatch(
  //     askDeleteProjectsReqeustAction({
  //       projects: deleteProjectsArr,
  //       sortInfo: {
  //         sorting: sortingValue,
  //         count: projectRowsPerPage,
  //         start: projectPage,
  //         tab: activeStep,
  //         isDesc: isSortDesc,
  //       },
  //     })
  //   );
  //   setSearchedValue(null);
  // };

  // const handleProjectChangePage = (event, newPage) => {
  //   setIsLoading(true);
  //   setProjectPage(newPage);
  //   dispatch(
  //     getProjectsRequestAction({
  //       sorting: sortingValue,
  //       count: projectRowsPerPage,
  //       start: newPage,
  //       tab: activeStep,
  //       isDesc: isSortDesc,
  //       searching: searchedValue,
  //       isshared: isShared,
  //     })
  //   );
  // };

  // const handleChangeProjectRowsPerPage = (event) => {
  //   setIsLoading(true);
  //   setProjectRowsPerPage(+event.target.value);
  //   setProjectPage(0);
  //   dispatch(
  //     getProjectsRequestAction({
  //       sorting: sortingValue,
  //       count: event.target.value,
  //       start: 0,
  //       tab: activeStep,
  //       isDesc: isSortDesc,
  //       searching: searchedValue,
  //       isshared: isShared,
  //     })
  //   );
  // };

  // const onSetSortValue = async (value) => {
  //   await setIsLoading(true);
  //   if (value === sortingValue) {
  //     let tempIsSortDesc = isSortDesc;
  //     setIsSortDesc(!tempIsSortDesc);
  //     setProjectPage(0);
  //     dispatch(
  //       getProjectsRequestAction({
  //         sorting: value,
  //         count: projectRowsPerPage,
  //         start: 0,
  //         tab: activeStep,
  //         isDesc: !tempIsSortDesc,
  //         searching: searchedValue,
  //         isshared: isShared,
  //       })
  //     );
  //     dispatch(
  //       getRecentJupyterProjectsRequestAction({
  //         sorting: value,
  //         count: projectRowsPerPage,
  //         start: 0,
  //         tab: activeStep,
  //         isDesc: !tempIsSortDesc,
  //         searching: searchedValue,
  //         isshared: isShared,
  //       })
  //     );
  //   } else {
  //     setIsSortDesc(true);
  //     setSortingValue(value);
  //     setProjectPage(0);
  //     dispatch(
  //       getProjectsRequestAction({
  //         sorting: value,
  //         count: projectRowsPerPage,
  //         start: 0,
  //         tab: activeStep,
  //         isDesc: true,
  //         searching: searchedValue,
  //         isshared: isShared,
  //       })
  //     );
  //     dispatch(
  //       getRecentJupyterProjectsRequestAction({
  //         sorting: value,
  //         count: projectRowsPerPage,
  //         start: 0,
  //         tab: activeStep,
  //         isDesc: true,
  //         searching: searchedValue,
  //         isshared: isShared,
  //       })
  //     );
  //   }
  // };

  // const showMyProject = () => {
  //   let datas = [];
  //   const optionObj = {
  //     speed: t("Speed"),
  //     accuracy: t("Accuracy"),
  //     colab: t("Magic Code"),
  //   };
  //   const methodObj = {
  //     normal: t("General"),
  //     text: t("Natural Language Processing (NLP)"),
  //     image: t("Image"),
  //     normal_regression: t("General Regression"),
  //     normal_classification: t("General Category Classification"),
  //     object_detection: t("Object Detection"),
  //     cycle_gan: t("Generative Adversarial Network (GAN)"),
  //     time_series: t("Time Series Prediction"),
  //     time_series_classification: t("Time Series Prediction"),
  //     time_series_regression: t("Time Series Prediction"),
  //     recommender: t("Recommendation system (matrix)"),
  //   };

  //   for (let i = 0; i < projects.projects.length; i++) {
  //     let status = "";
  //     if (projects.projects[i].status === 0) {
  //       status = t("Ready");
  //     } else if (projects.projects[i].status === 100) {
  //       status = t("Completed");
  //     } else if (
  //       projects.projects[i].status === 99 ||
  //       projects.projects[i].status === 9 ||
  //       projects.projects[i].status < 0
  //     ) {
  //       status = t("Error");
  //     } else {
  //       status = t("In progress");
  //     }
  //     const prj = projects.projects[i];
  //     const project = [
  //       prj.id,
  //       projectRowsPerPage * projectPage + (i + 1),
  //       prj.projectName,
  //       optionObj[prj.option],
  //       methodObj[prj.trainingMethod],
  //       projects.projects[i].created_at
  //         ? projects.projects[i].created_at.substring(0, 10)
  //         : "",
  //       status,
  //     ];
  //     datas.push(project);
  //   }
  //   if (!projects.projects || projects.projects.length === 0) {
  //     return (
  //       <div style={{ margin: "20px 10px" }}>
  //         {t("There are no shared projects to display.")}
  //       </div>
  //     );
  //   } else {
  //     return (
  //       <div>
  //         <Button
  //           id="deleteProject"
  //           style={{ width: "80px" }}
  //           disabled={!Object.values(projectCheckedValue).includes(true)}
  //           className={
  //             Object.values(projectCheckedValue).includes(true)
  //               ? classes.defaultDeleteButton
  //               : classes.defaultDisabledButton
  //           }
  //           onClick={deleteProject}
  //         >
  //           <CloseIcon
  //             id={
  //               Object.values(projectCheckedValue).includes(true)
  //                 ? "deleteActivateBtn"
  //                 : "deleteLabelIcon"
  //             }
  //           />
  //           {t("Delete")}
  //         </Button>
  //         <Table className={classes.table} aria-label="simple table">
  //           <TableHead>
  //             <TableRow>
  //               {!isShared && (
  //                 <TableCell
  //                   className={classes.tableHead}
  //                   align="left"
  //                   style={{ width: "5%" }}
  //                 >
  //                   <Checkbox
  //                     value="all"
  //                     checked={projectCheckedValue["all"]}
  //                     onChange={onSetProjectCheckedValueAll}
  //                   />
  //                 </TableCell>
  //               )}
  //               <TableCell
  //                 className={classes.tableHead}
  //                 style={{ width: "5%" }}
  //                 align="center"
  //               >
  //                 <b style={{ color: currentThemeColor.textMediumGrey }}>No</b>
  //               </TableCell>
  //               <TableCell
  //                 className={classes.tableHead}
  //                 align="center"
  //                 style={{ width: "40%", cursor: "pointer" }}
  //                 onClick={() => onSetSortValue("projectName")}
  //               >
  //                 <div className={classes.tableHeader}>
  //                   {sortingValue === "projectName" &&
  //                     (!isSortDesc ? (
  //                       <ArrowUpwardIcon fontSize="small" />
  //                     ) : (
  //                       <ArrowDownwardIcon fontSize="small" />
  //                     ))}
  //                   <b>{t("Project name")}</b>
  //                 </div>
  //               </TableCell>
  //               <TableCell
  //                 className={classes.tableHead}
  //                 align="center"
  //                 style={{ width: "7.5%", cursor: "pointer" }}
  //                 onClick={() => onSetSortValue("option")}
  //               >
  //                 <div className={classes.tableHeader}>
  //                   {sortingValue === "option" &&
  //                     (!isSortDesc ? (
  //                       <ArrowUpwardIcon fontSize="small" />
  //                     ) : (
  //                       <ArrowDownwardIcon fontSize="small" />
  //                     ))}
  //                   <b>{t("Option")}</b>
  //                 </div>
  //               </TableCell>
  //               <TableCell
  //                 className={classes.tableHead}
  //                 align="center"
  //                 style={{ width: "17.5%", cursor: "pointer" }}
  //                 onClick={() => onSetSortValue("trainingMethod")}
  //               >
  //                 <div className={classes.tableHeader}>
  //                   {sortingValue === "trainingMethod" &&
  //                     (!isSortDesc ? (
  //                       <ArrowUpwardIcon fontSize="small" />
  //                     ) : (
  //                       <ArrowDownwardIcon fontSize="small" />
  //                     ))}
  //                   <b>{t("Training Method")}</b>
  //                 </div>
  //               </TableCell>
  //               <TableCell
  //                 className={classes.tableHead}
  //                 align="center"
  //                 style={{ width: "15%", cursor: "pointer" }}
  //                 onClick={() => onSetSortValue("created_at")}
  //               >
  //                 <div className={classes.tableHeader}>
  //                   {sortingValue === "created_at" &&
  //                     (!isSortDesc ? (
  //                       <ArrowUpwardIcon fontSize="small" />
  //                     ) : (
  //                       <ArrowDownwardIcon fontSize="small" />
  //                     ))}
  //                   <b>{t("Date created")}</b>
  //                 </div>
  //               </TableCell>
  //               <TableCell
  //                 className={classes.tableHead}
  //                 align="center"
  //                 style={{ width: "10%", cursor: "pointer" }}
  //                 onClick={() => onSetSortValue("status")}
  //               >
  //                 <div className={classes.tableHeader}>
  //                   {sortingValue === "status" &&
  //                     (!isSortDesc ? (
  //                       <ArrowUpwardIcon fontSize="small" />
  //                     ) : (
  //                       <ArrowDownwardIcon fontSize="small" />
  //                     ))}
  //                   <b>{t("Status")}</b>
  //                 </div>
  //               </TableCell>
  //             </TableRow>
  //           </TableHead>
  //           <TableBody>
  //             {datas.map((data, idx) => (
  //               <TableRow
  //                 key={idx}
  //                 className={classes.tableRow}
  //                 style={{
  //                   background:
  //                     idx % 2 === 0
  //                       ? currentTheme.tableRow1
  //                       : currentTheme.tableRow2,
  //                 }}
  //               >
  //                 {!isShared && (
  //                   <TableCell align="left" className={classes.tableRowCell}>
  //                     <Checkbox
  //                       value={data[0]}
  //                       checked={projectCheckedValue[data[0]] ? true : false}
  //                       onChange={() => onSetProjectCheckedValue(data[0])}
  //                       className={classes.tableCheckBox}
  //                     />
  //                   </TableCell>
  //                 )}
  //                 {data.map((d, idx) => {
  //                   if (idx > 0) {
  //                     var statusColor = currentTheme.text1;
  //                     var isStatus = "";
  //                     if (
  //                       typeof d === "string" &&
  //                       d.indexOf(t("Ready")) > -1
  //                     ) {
  //                       statusColor = "#6B6B6B";
  //                       isStatus = true;
  //                     }
  //                     if (
  //                       typeof d === "string" &&
  //                       d.indexOf(t("In progress")) > -1
  //                     ) {
  //                       statusColor = "#1BC6B4";
  //                       isStatus = true;
  //                     }
  //                     if (typeof d === "string" && d.indexOf(t("Error")) > -1) {
  //                       statusColor = "#BD2020";
  //                       isStatus = true;
  //                     }
  //                     if (
  //                       typeof d === "string" &&
  //                       d.indexOf(t("Completed")) > -1
  //                     ) {
  //                       statusColor = "#0A84FF";
  //                       isStatus = true;
  //                     }
  //                     return (
  //                       <TableCell
  //                         className={classes.tableRowCell}
  //                         align="center"
  //                         onClick={() => goProjectDetail(data[0])}
  //                       >
  //                         <div
  //                           style={{
  //                             wordBreak: "break-all",
  //                             color: statusColor,
  //                           }}
  //                         >
  //                           <div
  //                             style={{ display: isStatus ? "inline" : "none" }}
  //                           >
  //                             ⦁
  //                           </div>{" "}
  //                           {d}
  //                         </div>
  //                       </TableCell>
  //                     );
  //                   }
  //                 })}
  //               </TableRow>
  //             ))}
  //           </TableBody>
  //         </Table>
  //         <TablePagination
  //           rowsPerPageOptions={[10, 20, 50]}
  //           component="div"
  //           count={projects.totalLength ? projects.totalLength[activeStep] : 0}
  //           rowsPerPage={projectRowsPerPage}
  //           page={projectPage}
  //           backIconButtonProps={{
  //             "aria-label": "previous projectPage",
  //           }}
  //           nextIconButtonProps={{
  //             "aria-label": "next projectPage",
  //           }}
  //           onChangePage={handleProjectChangePage}
  //           onChangeRowsPerPage={handleChangeProjectRowsPerPage}
  //         />
  //       </div>
  //     );
  //   }
  // };

  // const onSearchProject = async (e) => {
  //   e.preventDefault();
  //   const value = e.target.value;
  //   setSearchedValue(value);
  // };

  const openTemplate = () => {
    setIsTemplateModalOpen(true);
  };

  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
  };

  // const onSetActiveStep = (idx) => {
  //   switch (idx) {
  //     case 0:
  //       history.push("/admin/dataconnector");
  //       return;
  //     case 1:
  //       history.push("/admin/project/?tab=ready");
  //       return;
  //     case 2:
  //       history.push("/admin/project/?tab=developing");
  //       return;
  //     case 3:
  //       history.push("/admin/project/?tab=done");
  //       return;
  //     default:
  //       return;
  //   }
  // };

  // const renderStepper = () => {
  //   let activeStepNum = -1;
  //   switch (activeStep) {
  //     case "ready":
  //       activeStepNum = 1;
  //       break;
  //     case "developing":
  //       activeStepNum = 2;
  //       break;
  //     case "done":
  //       activeStepNum = 3;
  //       break;
  //     default:
  //       break;
  //   }

  //   return (
  //     <div className={classes.defaultContainer}>
  //       <div
  //         className={
  //           activeStepNum === 0 || activeStepNum === -1
  //             ? classes.stepperActivedContainer
  //             : classes.stepperDeactivatedContainer
  //         }
  //       >
  //         <div
  //           onClick={() => {
  //             onSetActiveStep(0);
  //           }}
  //           className={
  //             activeStepNum === 0 || activeStepNum === -1
  //               ? classes.stepperBlueActivatedDiv
  //               : classes.stepperBlueOpacityDiv
  //           }
  //         >
  //           <div>1</div>
  //         </div>
  //         <div style={{ fontSize: "10px" }}>{t("Data Preparation")}</div>
  //       </div>

  //       <div
  //         className={
  //           activeStepNum === -1
  //             ? classes.stepperActivatedGreenLine
  //             : activeStepNum < 1
  //             ? classes.stepperDeactivatedLine
  //             : classes.stepperOpacityGreenLine
  //         }
  //       ></div>

  //       <div
  //         className={
  //           activeStepNum === 1 || activeStepNum === -1
  //             ? classes.stepperActivedContainer
  //             : classes.stepperDeactivatedContainer
  //         }
  //       >
  //         <div
  //           onClick={() => {
  //             onSetActiveStep(1);
  //           }}
  //           className={
  //             activeStepNum === 1 || activeStepNum === -1
  //               ? classes.stepperGreenActivatedDiv
  //               : activeStepNum < 1
  //               ? classes.stepperDeactivatedDiv
  //               : classes.stepperGreenOpacityDiv
  //           }
  //         >
  //           <div>2</div>
  //         </div>
  //         <div style={{ fontSize: "10px" }}>{t("Data Selection")}</div>
  //       </div>

  //       <div
  //         className={
  //           activeStepNum === -1
  //             ? classes.stepperActivatedBlueLine
  //             : activeStepNum < 2
  //             ? classes.stepperDeactivatedLine
  //             : classes.stepperOpacityBlueLine
  //         }
  //       ></div>

  //       <div
  //         className={
  //           activeStepNum === 2 || activeStepNum === -1
  //             ? classes.stepperActivedContainer
  //             : classes.stepperDeactivatedContainer
  //         }
  //       >
  //         <div
  //           onClick={() => {
  //             onSetActiveStep(2);
  //           }}
  //           className={
  //             activeStepNum === 2 || activeStepNum === -1
  //               ? classes.stepperBlueActivatedDiv
  //               : activeStepNum < 2
  //               ? classes.stepperDeactivatedDiv
  //               : classes.stepperBlueOpacityDiv
  //           }
  //         >
  //           <div>3</div>
  //         </div>
  //         <div style={{ fontSize: "10px" }}>{t("In progress")}</div>
  //       </div>

  //       <div
  //         className={
  //           activeStepNum === -1
  //             ? classes.stepperActivatedGreenLine
  //             : activeStepNum < 3
  //             ? classes.stepperDeactivatedLine
  //             : classes.stepperOpacityGreenLine
  //         }
  //       ></div>

  //       <div
  //         className={
  //           activeStepNum === 3 || activeStepNum === -1
  //             ? classes.stepperActivedContainer
  //             : classes.stepperDeactivatedContainer
  //         }
  //       >
  //         <div
  //           onClick={() => {
  //             onSetActiveStep(3);
  //           }}
  //           className={
  //             activeStepNum === 3 || activeStepNum === -1
  //               ? classes.stepperGreenActivatedDiv
  //               : classes.stepperDeactivatedDiv
  //           }
  //         >
  //           <div>4</div>
  //         </div>
  //         <div style={{ fontSize: "10px" }}>{t("Data Analysis/Prediction")}</div>
  //       </div>
  //     </div>
  //   );
  // };

  // const onGetSearchedProject = () => {
  //   setProjectPage(0);
  //   dispatch(
  //     getProjectsRequestAction({
  //       sorting: sortingValue,
  //       count: projectRowsPerPage,
  //       start: 0,
  //       tab: activeStep,
  //       isDesc: isSortDesc,
  //       searching: searchedValue,
  //       isshared: isShared,
  //     })
  //   );
  // };

  // const onGetDefaultProject = () => {
  //   setSearchedValue(null);
  //   setProjectPage(0);
  //   dispatch(
  //     getProjectsRequestAction({
  //       sorting: sortingValue,
  //       count: projectRowsPerPage,
  //       start: 0,
  //       tab: activeStep,
  //       isDesc: isSortDesc,
  //       isshared: isShared,
  //     })
  //   );
  // };

  // const onSetSelectedPage = (value) => {
  //   dispatch(
  //     getProjectsRequestAction({
  //       sorting: sortingValue,
  //       count: projectRowsPerPage,
  //       start: 0,
  //       tab: activeStep,
  //       isDesc: isSortDesc,
  //       isshared: value,
  //     })
  //   );
  //   setIsShared(value);
  // };

  const onOpenStartProject = () => {
    if (
      parseInt(user.me.cumulativeProjectCount) >=
      parseInt(+user.me.remainProjectCount + +user.me.usageplan.projects)
    ) {
      dispatch(
        openErrorSnackbarRequestAction(
          `${t(
            "You can’t add a new project. You’ve reached the maximum number of projects allowed for your account"
          )} ${t("To continue, please upgrade your plan")}`
        )
      );
      return;
    }
    setIsNewStartModelModalOpen(true);
    // history.push('/admin/dataconnector');
  };

  const goLabelProjectDetail = (id) => {
    history.push(`/admin/labelling/${id}`);
  };

  const closeLoadModelModal = () => {
    dispatch(askModalRequestAction());
  };

  const closeNewStartModelModal = () => {
    setIsNewStartModelModalOpen(false);
  };

  // const renderRecentLabelProject = () => {
  //   return (
  //     <Table className={classes.table} aria-label="simple table">
  //       <TableHead>
  //         <TableRow>
  //           <TableCell
  //             id="mainHeader"
  //             className={classes.tableHead}
  //             align="center"
  //             width="35%"
  //           >
  //             <b>{t("Project name")}</b>
  //           </TableCell>
  //           <TableCell
  //             id="mainHeader"
  //             className={classes.tableHead}
  //             align="center"
  //             width="15%"
  //           >
  //             <b>{t("Type")}</b>
  //           </TableCell>
  //           <TableCell
  //             id="mainHeader"
  //             className={classes.tableHead}
  //             align="center"
  //             width="25%"
  //           >
  //             <b>{t("Date created")}</b>
  //           </TableCell>
  //           <TableCell
  //             id="mainHeader"
  //             className={classes.tableHead}
  //             align="center"
  //             width="25%"
  //           >
  //             <b>{t("Date updated")}</b>
  //           </TableCell>
  //         </TableRow>
  //       </TableHead>
  //       <TableBody>
  //         {labelprojects.recentProjects.map((project, idx) => (
  //           <TableRow
  //             key={idx}
  //             className={classes.tableRow}
  //             style={{
  //               background:
  //                 idx % 2 === 0
  //                   ? currentTheme.tableRow1
  //                   : currentTheme.tableRow2,
  //             }}
  //           >
  //             <TableCell
  //               className={classes.tableRowCell}
  //               align="center"
  //               onClick={() => goLabelProjectDetail(project.id)}
  //             >
  //               <div className={classes.wordBreakDiv}>{project.name}</div>
  //             </TableCell>
  //             <TableCell
  //               className={classes.tableRowCell}
  //               align="center"
  //               onClick={() => goLabelProjectDetail(project.id)}
  //             >
  //               <div className={classes.wordBreakDiv}>{project.workapp}</div>
  //             </TableCell>
  //             <TableCell
  //               className={classes.tableRowCell}
  //               align="center"
  //               onClick={() => goLabelProjectDetail(project.id)}
  //             >
  //               <div className={classes.wordBreakDiv}>
  //                 {project.created_at.substring(0, 10)}
  //               </div>
  //             </TableCell>
  //             <TableCell
  //               className={classes.tableRowCell}
  //               align="center"
  //               onClick={() => goLabelProjectDetail(project.id)}
  //             >
  //               <div className={classes.wordBreakDiv}>
  //                 {project.updated_at.substring(0, 10)}
  //               </div>
  //             </TableCell>
  //           </TableRow>
  //         ))}
  //       </TableBody>
  //     </Table>
  //   );
  // }

  const renderRecentProject = () => {
    let datas = [];
    if (projects && projects.recentJupyterProjects) {
      for (let i = 0; i < projects.recentJupyterProjects.length; i++) {
        let status = "";
        if (projects.recentJupyterProjects[i].status === 0) {
          status = t("Ready");
        } else if (projects.recentJupyterProjects[i].status === 100) {
          status = t("Completed");
        } else if (
          projects.recentJupyterProjects[i].status === 99 ||
          projects.recentJupyterProjects[i].status === 9 ||
          projects.recentJupyterProjects[i].status < 0
        ) {
          status = t("Error");
        } else {
          status = t("In progress");
        }
        const prj = projects.recentJupyterProjects[i];
        const project = [
          prj.id,
          prj.projectName,
          projects.recentJupyterProjects[i].created_at
            ? projects.recentJupyterProjects[i].created_at.substring(0, 10)
            : "",
          status,
        ];
        datas.push(project);
      }
    }

    return (
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell
              id="mainHeader"
              className={classes.tableHead}
              align="left"
              width="40%"
            >
              <b
                style={{
                  paddingLeft: "15px",
                  color: currentThemeColor.textWhite6,
                }}
              >
                {t("Project name")}
              </b>
            </TableCell>
            <TableCell
              id="mainHeader"
              className={classes.tableHead}
              align="center"
              width="20%"
            >
              <b style={{ color: currentThemeColor.textWhite6 }}>
                {t("Date created")}
              </b>
            </TableCell>
            <TableCell
              id="mainHeader"
              className={classes.tableHead}
              align="center"
              width="20%"
            >
              <b style={{ color: currentThemeColor.textWhite6 }}>
                {t("Status")}
              </b>
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
              {data.map((d, idx) => {
                if (idx > 0) {
                  var statusColor = currentTheme.text1;
                  var isStatus = "";
                  if (typeof d === "string" && d.indexOf(t("Ready")) > -1) {
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
                  if (typeof d === "string" && d.indexOf(t("Error")) > -1) {
                    statusColor = "#BD2020";
                    isStatus = true;
                  }
                  if (typeof d === "string" && d.indexOf(t("Completed")) > -1) {
                    statusColor = "#0A84FF";
                    isStatus = true;
                  }
                  return (
                    <TableCell
                      className={classes.tableRowCell}
                      align={idx === 1 ? "left" : "center"}
                      onClick={() => goJupyterProjectDetail(data[0])}
                    >
                      <div
                        style={
                          idx === 1
                            ? {
                                paddingLeft: "15px",
                                wordBreak: "break-all",
                                color: statusColor,
                              }
                            : { wordBreak: "break-all", color: statusColor }
                        }
                      >
                        <div style={{ display: isStatus ? "inline" : "none" }}>
                          ⦁
                        </div>{" "}
                        {d}
                      </div>
                    </TableCell>
                  );
                }
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
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
      <ReactTitle title={"DS2.ai - " + t("AI development")} />
      {introOn ? (
        <ProjectIntro
          setIntroOn={setIntroOn}
          setIntroOffClicked={setIntroOffClicked}
          useTranslation={useTranslation}
          userLang={user.language}
        />
      ) : (
        <>
          <GridContainer style={{ alignItems: "center" }}>
            <GridItem xs={12} style={currentTheme.titleGridItem}>
              <div className={classes.topTitle}>{t("AI development")}</div>
              <div className={classes.subTitleText}>
                {t(
                  "Create new projects and develop your own AI models. Analyze your data and make predictions."
                )}
              </div>
            </GridItem>
            {isLoading || projects.isLoading ? (
              <GridItem xs={12}>
                <div className={classes.loading}>
                  <Loading size={400} />
                </div>
              </GridItem>
            ) : (
              <>
                <GridItem xs={12} style={{ padding: "30px 15px 0 10px" }}>
                  <GridContainer>
                    {/* {user.me?.isAiTrainer ? (
                        <>
                          <GridItem xs={3} lg={2}>
                            <b className={classes.subTitle}>
                              {t("My label project")}
                            </b>
                          </GridItem>
                          <GridItem xs={9} lg={10}>
                            <div className={classes.alignRight}>
                              <Button
                                id="startProjectButton"
                                className={classes.defaultHighlightButton}
                                onClick={onGotoLabelingPage}
                                style={{
                                  width: "160px",
                                  alignSelf: "flex-end",
                                }}
                              >
                                <b>{t("Start labeling")}</b>
                              </Button>
                            </div>
                            {/* {labelprojects.recentProjects &&
                            labelprojects.recentProjects.length > 0 ? (
                              renderRecentLabelProject()
                            ) : (
                            <div
                              style={{
                                height: "140px",
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  width: "60%",
                                }}
                              >
                                <span className={classes.startTriggerBtn}>
                                  {t(
                                    "우측 상단의 버튼을 눌러 라벨링을 시작해보세요."
                                  )}
                                </span>
                                <div style={{ cursor: "pointer" }}>
                                  <span
                                    className={classes.manualTriggerBtn}
                                    onClick={() => {
                                      window.open(
                                        user.language === "en"
                                          ? "https://www.notion.so/dslabglobal/Guide-to-CLICK-AI-1286524a5302472ebdf2eb546f113462"
                                          : "https://www.notion.so/dslabglobal/3939509423664e94b88a3703f5e4e605",
                                        "_blank"
                                      );
                                    }}
                                  >
                                    {t("Go to Manual")}
                                  </span>
                                  <ArrowForwardIosIcon
                                    id="manualIcon"
                                    fontSize="xs"
                                    className={classes.manualTriggerBtn}
                                  />
                                </div>
                              </div>
                            </div>
                            )}
                          </GridItem>
                        </>
                      ) : (
                      */}

                    <>
                      <GridItem xs={3} lg={2}>
                        <b className={classes.subTitle}>
                          {t("Recent Custom Training")}
                        </b>
                      </GridItem>
                      <GridItem xs={9} lg={10}>
                        <div className={classes.alignRight}>
                          <Button
                            id="startProjectButton"
                            className={`${classes.defaultGreenOutlineButton} ${classes.neoBtnH35}`}
                            onClick={onOpenStartProject}
                          >
                            {t("Create a new project")}
                          </Button>
                          <Button
                            id="startProjectButton"
                            className={`${classes.defaultGreenOutlineButton} ${classes.neoBtnH35}`}
                            onClick={() => {
                              setIsLoadModelModalOpen(true);
                            }}
                          >
                            {t("Load Model")}
                          </Button>
                        </div>
                        {projects.recentJupyterProjects &&
                        projects.recentJupyterProjects.length > 0 ? (
                          renderRecentProject()
                        ) : (
                          <div
                            style={{
                              height: "140px",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                              }}
                            >
                              <span
                                className={classes.startTriggerBtn}
                                id="newProjectDiv"
                              >
                                {t(
                                  "You can start a project by clicking the top right button."
                                )}
                              </span>
                              <div style={{ cursor: "pointer" }}>
                                <span
                                  className={classes.manualTriggerBtn}
                                  onClick={() => {
                                    window.open(
                                      user.language === "en"
                                        ? "https://www.notion.so/dslabglobal/Guide-to-CLICK-AI-1286524a5302472ebdf2eb546f113462"
                                        : "https://www.notion.so/dslabglobal/CLICK-AI-de9396dd36be46609fb5ffbef2ec1007",
                                      "_blank"
                                    );
                                  }}
                                >
                                  {t("Go to Manual")}
                                </span>
                                <ArrowForwardIosIcon
                                  id="manualIcon"
                                  fontSize="xs"
                                  className={classes.manualTriggerBtn}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </GridItem>
                    </>
                    {/* )} */}
                  </GridContainer>
                  <GridContainer style={{ height: "40px" }}></GridContainer>
                  <GridContainer>
                    <GridItem xs={3} lg={2}>
                      <b className={classes.subTitle}>
                        {t("AutoML Training Status")}
                      </b>
                    </GridItem>
                    <GridItem
                      xs={9}
                      lg={10}
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                      }}
                    >
                      {projects.priority?.length > 0 ? (
                        renderProcessingProject()
                      ) : (
                        <div
                          className={classes.subContent}
                          style={{ width: "100%", alignSelf: "flex-start" }}
                        >
                          {t(
                            "There is no training project in progress at the moment."
                          )}
                        </div>
                      )}
                    </GridItem>
                  </GridContainer>
                  {user.language === "ko" && (
                    <TrainTutorial history={history} />
                  )}
                </GridItem>
              </>
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
            {/* <Tip /> */}
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
                            <Loading size={200} />
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
                      {files ? (
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
                            {t("Confirm")}
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
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isNewStartModelModalOpen}
        onClose={closeNewStartModelModal}
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
                <div>
                  <b>{t("New Project")}</b>
                </div>
                <CloseIcon
                  id="deleteLabelIcon"
                  className={classes.pointerCursor}
                  onClick={closeNewStartModelModal}
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
                      <Table
                        className={classes.table}
                        aria-label="simple table"
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell
                              className={classes.tableHead}
                              align="center"
                              style={{ width: "16%" }}
                            >
                              <div className={classes.tableHeader}>
                                <b>{""}</b>
                              </div>
                            </TableCell>
                            <TableCell
                              className={classes.tableHead}
                              align="center"
                              style={{ width: "28%" }}
                            >
                              <div className={classes.tableHeader}>
                                <b>{"Custom Training"}</b>
                              </div>
                            </TableCell>
                            <TableCell
                              className={classes.tableHead}
                              align="center"
                              style={{ width: "28%" }}
                            >
                              <div className={classes.tableHeader}>
                                <b>{"AutoML"}</b>
                              </div>
                            </TableCell>
                            {process.env.REACT_APP_ENTERPRISE !== "true" && (
                              <TableCell
                                className={classes.tableHead}
                                align="center"
                                style={{ width: "28%" }}
                              >
                                <div className={classes.tableHeader}>
                                  <b>{t("Consultant Development Agency")}</b>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow className={classes.tableRow}>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              {t("Content")}
                            </TableCell>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              {t(
                                "Develop by renting a training server and coding directly in the Jupyter environment"
                              )}
                            </TableCell>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              {t(
                                "Service that automatically develops artificial intelligence without coding"
                              )}
                            </TableCell>
                            {process.env.REACT_APP_ENTERPRISE !== "true" && (
                              <TableCell
                                className={classes.tableRowCell}
                                align="center"
                                style={{ cursor: "default" }}
                              >
                                {t(
                                  "Service for developing artificial intelligence after data pre-processing through direct consultation with a consultant"
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              {t("Develop Period")}
                            </TableCell>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              {t("Depends on code and server size")}
                            </TableCell>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              {t("Fastest of options (within 3 days)")}
                            </TableCell>
                            {process.env.REACT_APP_ENTERPRISE !== "true" && (
                              <TableCell
                                className={classes.tableRowCell}
                                align="center"
                                style={{ cursor: "default" }}
                              >
                                {t("Depends on data type")}
                              </TableCell>
                            )}
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              {t("Cost")}
                            </TableCell>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              {t(
                                "Charge according to the term of the server lease"
                              )}
                            </TableCell>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              {t("Depends on data size")}
                            </TableCell>
                            {process.env.REACT_APP_ENTERPRISE !== "true" && (
                              <TableCell
                                className={classes.tableRowCell}
                                align="center"
                                style={{ cursor: "default" }}
                              >
                                {"$ 2000"}
                              </TableCell>
                            )}
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              {t("Data Preprocessing")}
                            </TableCell>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              {t("Requires direct preprocessing")}
                            </TableCell>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              {t("Provides basic pre-processing function")}
                            </TableCell>
                            {process.env.REACT_APP_ENTERPRISE !== "true" && (
                              <TableCell
                                className={classes.tableRowCell}
                                align="center"
                                style={{ cursor: "default" }}
                              >
                                {t("Customized pretreatment available")}
                              </TableCell>
                            )}
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
                            >
                              <Button
                                id="closeNewStartModelModal"
                                style={{
                                  width: "70%",
                                  height: "30%",
                                  fontSize: "0.9rem",
                                }}
                                className={classes.defaultGreenOutlineButton}
                                onClick={goCustomTraining}
                              >
                                {t("Start")}
                              </Button>
                            </TableCell>
                            <TableCell
                              className={classes.tableRowCell}
                              align="center"
                              style={{ cursor: "default" }}
                            >
                              <Button
                                id="closeNewStartModelModal"
                                style={{
                                  width: "70%",
                                  height: "30%",
                                  fontSize: "0.9rem",
                                }}
                                className={classes.defaultGreenOutlineButton}
                                onClick={goAutoML}
                              >
                                {t("Start")}
                              </Button>
                            </TableCell>
                            {process.env.REACT_APP_ENTERPRISE !== "true" && (
                              <TableCell
                                className={classes.tableRowCell}
                                align="center"
                                style={{ cursor: "default" }}
                              >
                                <Button
                                  id="closeNewStartModelModal"
                                  style={{
                                    width: "70%",
                                    height: "30%",
                                    fontSize: "0.9rem",
                                  }}
                                  className={classes.defaultGreenOutlineButton}
                                  onClick={goConsultant}
                                >
                                  {t("Request")}
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </>
                  </GridContainer>
                </div>
              </>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default React.memo(Project);
