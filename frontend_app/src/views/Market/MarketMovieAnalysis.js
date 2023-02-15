import React, { useEffect, useState, useRef } from "react";
import RedoIcon from "@material-ui/icons/Redo";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import * as api from "controller/api.js";
import { getAsynctaskAll, getAsynctaskAllByMarketProjectId } from "controller/api.js";
import Cookies from "helpers/Cookies";
import Container from "@material-ui/core/Container";
import currentTheme from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import { getRecentProjectsRequestAction } from "redux/reducers/projects.js";
import { askProjectFromLabelRequestAction, askExportCocoRequestAction, askExportVocRequestAction, openSuccessSnackbarRequestAction, openErrorSnackbarRequestAction, askMarketProjectDetailRequestAction } from "redux/reducers/messages.js";
import { useTranslation } from "react-i18next";
import { currentThemeColor } from "assets/jss/custom";
import { ReactTitle } from "react-meta-tags";
import { renderPayplePageReqeustAction } from "redux/reducers/messages";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Pagination from "@material-ui/lab/Pagination";
import InputBase from "@material-ui/core/InputBase";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Create from "@material-ui/icons/Create";
import CircularProgress from "@mui/material/CircularProgress";
import { linkDownloadUrl } from "components/Function/globalFunc";
import { use } from "chai";
import MarketMovieAnalysisResult from "./MarketMovieAnalysisResult";
import Button from "components/CustomButtons/Button";
import { openChat } from "components/Function/globalFunc";

const MarketMovieAnalysis = ({ history, onSetSelectedPage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [asynctasks, setAsynctasks] = useState(null);
  const [totalLength, setTotalLength] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [isUnableToChangeName, setIsUnableToChangeName] = useState(true);
  const [isUnableToChangeDescription, setIsUnableTochangeDescription] = useState(true);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [standardMovieTask, setStandardMovieTask] = useState([]);
  const [serviceType, setServiceType] = useState("");
  const [isRefreshAbuse, setIsRefreshAbuse] = useState(false);
  let nameRef = useRef();
  let descriptionRef = useRef();

  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, labelprojects, projects, messages } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );
  const { t } = useTranslation();

  const changeProjectName = (e) => {
    e.preventDefault();
    setProjectName(e.target.value);
  };

  const changeProjectDescription = (e) => {
    e.preventDefault();
    setProjectDescription(e.target.value);
  };

  const status = {
    0: t("Pending"),
    1: t("In process"),
    11: t("In process"),
    99: t("Error"),
    100: t("Completed"),
  };

  const deleteProject = (id) => {
    const deleteFilesArr = [id];
    // dispatch(
    //   askDeleteLabelProjectReqeustAction({
    //     labelProjects: deleteFilesArr,
    //     sortInfo: null,
    //   })
    // );
    api
      .deleteMarketProject(deleteFilesArr)
      .then((res) => {
        dispatch(openSuccessSnackbarRequestAction(t("The project has been deleted.")));
        history.push("/admin/marketPurchaseList");
      })
      .catch((e) => {
        console.log(e, "e");
      });
  };

  const updateProject = async () => {
    await dispatch(
      askMarketProjectDetailRequestAction({
        message: t("Are you sure you want to edit project information?"),
        requestAction: "putMarketProject",
        data: {
          type: "info",
          params: { name: projectName, description: projectDescription },
        },
      })
    );
    await setIsUnableToChangeName(true);
    await setIsUnableTochangeDescription(true);
  };

  useEffect(() => {
    if (messages.requestAction === "putMarketProject" && messages.datas === null) {
      if (messages.message === "프로젝트 정보를 수정하시겠습니까?" || messages.message === "Are you sure you want to edit project information?") {
        setProjectName(projects.project.name);
        setProjectDescription(projects.project.description);
      }
    }
  }, [messages.datas]);

  const tableHeads = [{ value: "No", width: "10%" }, { value: "content", width: "25%" }, { value: "date", width: "15%" }, { value: "status", width: "10%" }, { value: "division", width: "15%" }, { value: "action", width: "25%" }];

  const tableBodys = [{ value: "taskType", name: "content" }, { value: "created_at", name: "date" }];

  const taskTypes = {
    exportCoco: "COCO파일 변환",
    exportVoc: "VOC파일 변환",
    exportData: "파일 변환",
    runAll: "일괄예측",
    runMovie: "영상예측",
    autoLabeling: "라벨링프로젝트",
    add_object: "데이터 업로드",
    customAI: "커스텀 AI 프로젝트",
    runObjectDetectionLabeling: "라벨링프로젝트",
    runLabeling: "오토라벨링",
    develop: "인공지능 개발",
    runAnalyzing: "코랩 인공지능 분석",
    importCoco: "COCO파일 업로드",
    importVoc: "VOC파일 업로드",
  };

  const taskContents = {
    "0": "시작되었습니다",
    "1": "시작되었습니다",
    "99": "에러가 발생하였습니다",
    "100": "완료되었습니다",
  };

  const buttonTask = Object.keys(taskTypes).slice(0, 6);

  const buttonText = ["파일 다운받기", "파일 다운받기", "파일 다운받기", "파일 다운받기", "파일 다운받기", "라벨링 확인하기", "데이터 확인하기", "도움 요청하기"];

  const workapp = {
    object_detection: "물체인식",
    detection_3d: "3D 물체인식",
    voice: "음성",
    normal_classification: "정형화 분류",
    normal_regression: "정형화 회귀",
    text: "자연어",
    image: "이미지 분류",
  };

  useEffect(() => {
    setIsLoading(true);

    if (projects.project) {
      getAsynctaskData({
        start: historyPage,
        count: 5,
        id: projects.project?.id,
      });
      setProjectName(projects.project.projectName);
      setProjectDescription(projects.project.description);
      setServiceType(projects.project.service_type);
    }
  }, [projects.project]);

  useEffect(() => {
    if (!isUnableToChangeDescription) {
      descriptionRef.current.focus();
    }
  }, [isUnableToChangeDescription]);

  const getAsynctaskData = (data) => {
    getAsynctaskAllByMarketProjectId(data)
      .then((res) => {
        setAsynctasks(res.data.asynctasks);
        setTotalLength(res.data.totalLength);
      })
      .then(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (messages.message == t("The file(s) has been uploaded")) setIsLoading(true);

    if (projects.project) {
      getAsynctaskAllByMarketProjectId({
        start: 1,
        count: 5,
        id: projects.project?.id,
      })
        .then((res) => {
          const standard = res.data.asynctasks.filter((task) => task.isStandardMovie);

          setAsynctasks(res.data.asynctasks);
          setStandardMovieTask(standard);
          setTotalLength(res.data.totalLength);
        })
        .then(() => {
          setIsLoading(false);
        });
    }
  }, [messages.message, projects.project]);

  const changePage = (e, page) => {
    setIsLoading(true);
    setHistoryPage(page);
    getAsynctaskData({
      start: page,
      count: 5,
      id: projects.project.id,
    });
    // if (user.me?.isAiTrainer && !isShared) {
    //     dispatch(
    //       getAiTrainerLabelprojectRequestAction({
    //         sorting: sortingValue,
    //         count: projectRowsPerPage,
    //         start: page - 1,
    //         isDesc: isSortDesc,
    //         searching: searchedValue,
    //       })
    //     );
    //   return;
    // } else {
    //   getAsynctaskData({
    //     start: page,
    //     count: 5,
    //     id: projects.project.id,
    //   });
    // }
  };

  const onClickButtonAction = (type, path) => {
    switch (type) {
      case "exportCoco":
      case "exportVoc":
      case "runMovie":
      case "runAll":
      case "exportData":
        onClickRunDownload(path);
        break;
      case "autoLabeling":
        onSetSelectedPage("list");
        break;
      case "add_object":
        onSetSelectedPage("list");
        break;
      case "customAI":
        //도움 요청하기 기능
        break;
    }
  };

  const onClickRunDownload = (fileUrl) => {
    linkDownloadUrl(fileUrl);
  };

  //service_type으로 변경
  const goToAnalysisResultPage = (idx) => {
    history.push(history.location.pathname + `?list=${idx + 1}`);
  };

  const renderProjectAsyncTaskHistory = () => {
    return (
      <>
        <Button
          onClick={() => {
            if (!isRefreshAbuse) {
              setIsRefreshAbuse(true);
              setTimeout(() => {
                getAsynctaskData({
                  start: historyPage,
                  count: 5,
                  id: projects.project?.id,
                });
                setIsRefreshAbuse(false);
              }, 2000);
            }
          }}
          style={{
            height: "35px",
            width: user.language === "ko" ? "130px" : "150px",
            fontSize: "13px",
            borderRadius: "50px",
            border: isRefreshAbuse === false ? "1px solid #F0F0F0" : "1px solid gray",
            color: isRefreshAbuse === false ? "#F0F0F0" : "gray",
            cursor: isRefreshAbuse === false ? "pointer" : "default",
          }}
        >
          {t("Refresh Video")}
          <AutorenewIcon
            id="notificationRefreshBtn"
            className={isRefreshAbuse === false ? classes.refreshIconActive : classes.refreshIconDefault}
            style={{
              width: "25px",
              height: "25px",
              border: "none",
              marginRight: "-7px",
            }}
          />
        </Button>
        {projects.project?.service_type.includes("offline_") && (
          <div
            style={{
              color: "var(--textWhite87)",
              fontSize: "14px",
              marginBottom: "10px",
            }}
          >
            * {t("Checking and downloading the analysis video is only available for 30 seconds.")}
          </div>
        )}

        {/*<span>{t("Notification history")}</span>*/}
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
            {asynctasks && (
              <>
                {asynctasks.map((asynctask, idx) => (
                  <TableRow key={idx} className={classes.tableRow}>
                    <TableCell key={idx} className={classes.tableRowCell} align="center">
                      <div className={classes.wordBreakDiv}>{totalLength - (idx + 5 * (historyPage - 1))}</div>
                    </TableCell>
                    {tableBodys.map((tableBody, idx) => {
                      return (
                        <TableCell key={idx} className={classes.tableRowCell} align="center">
                          <div className={classes.wordBreakDiv}>{tableBody.value === "taskType" ? <>{user.language === "ko" ? <>{asynctask.taskName}</> : <>{asynctask.taskNameEn ? asynctask.taskNameEn : asynctask.taskName}</>}</> : <>{asynctask[tableBody.value].substring(0, 10)}</>}</div>
                        </TableCell>
                      );
                    })}
                    <TableCell key={idx} className={classes.tableRowCell} align="center">
                      <div className={classes.wordBreakDiv}>{status[asynctask.status]}</div>
                    </TableCell>
                    <TableCell key={idx} className={classes.tableRowCell} align="center">
                      <div className={classes.wordBreakDiv}>{asynctask.isStandardMovie == true ? t("Standard") : t("Comparison")}</div>
                    </TableCell>
                    <TableCell key={idx} className={classes.tableRowCell} align="center">
                      <div className={classes.wordBreakDiv}>
                        {buttonTask.indexOf(asynctask.taskType) > -1 ? (
                          <>
                            {buttonTask.indexOf(asynctask.taskType) < 6 ? (
                              <>
                                {asynctask.status === 100 && (
                                  <>
                                    {!asynctask.isStandardMovie && (
                                      <Button className={classes.defaultGreenOutlineButton} onClick={() => goToAnalysisResultPage(idx)} style={{ margin: "6px 0" }}>
                                        {t("Check the analyzed video")}
                                      </Button>
                                    )}
                                    <Button className={classes.defaultGreenOutlineButton} onClick={() => onClickRunDownload(asynctask.outputFilePath)} style={{ margin: "6px 0" }}>
                                      {t("Download")}
                                    </Button>
                                  </>
                                )}
                                {asynctask.status === 99 && (
                                  <Button className={classes.defaultGreenOutlineButton} onClick={openChat} style={{ margin: "6px 0" }}>
                                    {t("Contact us")}
                                  </Button>
                                )}
                              </>
                            ) : (
                              <>
                                {asynctask.status === 99 && (
                                  <Button className={classes.defaultGreenOutlineButton} onClick={() => onClickButtonAction(asynctask.taskType)}>
                                    {t(buttonText[buttonTask.indexOf(asynctask.taskType)])}
                                  </Button>
                                )}
                              </>
                            )}
                          </>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "15px",
          }}
        >
          <Pagination count={totalLength ? Math.ceil(totalLength / 5) : 0} page={historyPage} onChange={changePage} classes={{ ul: classes.paginationNum }} />
        </div>
      </>
    );
  };

  return (
    <>
      <ReactTitle title={"DS2.ai - " + t("Video Analysis")} />
      {isLoading ? (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <div style={{ marginTop: "50px" }}>{history.location.search.includes("list=") ? <MarketMovieAnalysisResult history={history} asynctasks={asynctasks} standardMovieTask={standardMovieTask} serviceType={serviceType} /> : renderProjectAsyncTaskHistory()}</div>
        </>
      )}
    </>
  );
};

export default React.memo(MarketMovieAnalysis);
