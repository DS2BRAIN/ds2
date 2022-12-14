import React, { useEffect, useState, useRef } from "react";
import RedoIcon from "@material-ui/icons/Redo";
import * as api from "controller/api.js";
import {
  getAsynctaskAll,
  getAsynctaskAllByMarketProjectId,
} from "controller/api.js";
import Cookies from "helpers/Cookies";
import Container from "@material-ui/core/Container";
import currentTheme from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import { getRecentProjectsRequestAction } from "redux/reducers/projects.js";
import {
  askProjectFromLabelRequestAction,
  askExportCocoRequestAction,
  askExportVocRequestAction,
  openSuccessSnackbarRequestAction,
  openErrorSnackbarRequestAction,
  askMarketProjectDetailRequestAction,
} from "redux/reducers/messages.js";
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
import Button from "components/CustomButtons/Button";

const MarketDetailSetting = ({ history, onSetSelectedPage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [asynctasks, setAsynctasks] = useState(null);
  const [totalLength, setTotalLength] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [isUnableToChangeName, setIsUnableToChangeName] = useState(true);
  const [
    isUnableToChangeDescription,
    setIsUnableTochangeDescription,
  ] = useState(true);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

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
        dispatch(
          openSuccessSnackbarRequestAction(t("The project has been deleted."))
        );
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
          params: {
            projectName,
            description: projectDescription,
          },
        },
      })
    );
    await setIsUnableToChangeName(true);
    await setIsUnableTochangeDescription(true);
  };

  // useEffect(() => {
  //   if (
  //     messages.requestAction === "putMarketProject" &&
  //     messages.datas === null
  //   ) {
  //     if (
  //       messages.message === "???????????? ????????? ?????????????????????????" ||
  //       messages.message ===
  //         "Are you sure you want to edit project information?"
  //     ) {
  //       setProjectName(projects.project.projectName);
  //       setProjectDescription(projects.project.description);
  //     }
  //   }
  // }, [messages.datas]);

  const tableHeads = [
    { value: "No", width: "10%" },
    { value: "content", width: "40%" },
    { value: "date", width: "25%" },
    { value: "-", width: "25%" },
  ];

  const tableBodys = [
    { value: "taskType", name: "content" },
    { value: "created_at", name: "date" },
  ];

  const taskTypes = {
    exportCoco: "COCO?????? ??????",
    exportVoc: "VOC?????? ??????",
    exportData: "?????? ??????",
    autoLabeling: "?????????????????????",
    add_object: "????????? ?????????",
    customAI: "????????? AI ????????????",
    runObjectDetectionLabeling: "?????????????????????",
    runAll: "????????????",
    runMovie: "????????????",
    runLabeling: "???????????????",
    develop: "???????????? ??????",
    runAnalyzing: "?????? ???????????? ??????",
    importCoco: "COCO?????? ?????????",
    importVoc: "VOC?????? ?????????",
  };

  const taskContents = {
    "0": "?????????????????????",
    "1": "?????????????????????",
    "99": "????????? ?????????????????????",
    "100": "?????????????????????",
  };

  const buttonTask = Object.keys(taskTypes).slice(0, 6);

  const buttonText = [
    "?????? ????????????",
    "?????? ????????????",
    "?????? ????????????",
    "????????? ????????????",
    "????????? ????????????",
    "?????? ????????????",
  ];

  const workapp = {
    object_detection: "????????????",
    voice: "??????",
    normal_classification: "????????? ??????",
    normal_regression: "????????? ??????",
    text: "?????????",
    image: "????????? ??????",
  };

  useEffect(() => {
    setIsLoading(true);
    getAsynctaskData({
      start: historyPage,
      count: 5,
      id: projects.project.id,
    });
    setProjectName(projects.project.projectName);
    setProjectDescription(projects.project.description);
  }, []);

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
        //?????? ???????????? ??????
        break;
    }
  };

  const onClickRunDownload = (fileUrl) => {
    linkDownloadUrl(fileUrl);
  };

  const onLetAbleToChangeName = async () => {
    await setIsUnableToChangeName(false);
    await nameRef.current.focus();
  };

  const onLetAbleToChangeDetail = async () => {
    await setIsUnableTochangeDescription(false);
    await descriptionRef.current.focus();
  };

  const renderProjectUpdateOrDelete = () => {
    return (
      <>
        <Grid item xs={9}>
          <div
            style={{
              borderBottom: "1px solid " + currentThemeColor.textWhite87,
              width: "100%",
              marginBottom: "16px",
              padding: "4px 8px",
            }}
          >
            <div
              style={{
                display: "inline-block",
                marginRight: "20px",
                fontWeight: "bold",
                width: "135px",
              }}
            >
              {t("Project Name")}*
            </div>
            <InputBase
              variant="outlined"
              margin="normal"
              required
              name="projectName"
              placeholder={projectName}
              label={projectName}
              id="projectName"
              autoComplete="projectName"
              type="projectName"
              onChange={changeProjectName}
              value={projectName}
              style={{
                color: currentThemeColor.textWhite87,
                width: "80%",
              }}
              disabled={isUnableToChangeName}
              autoFocus={true}
              inputRef={nameRef}
              onClick={onLetAbleToChangeName}
            />
            {isUnableToChangeName && (
              <Button
                className={classes.changeButton}
                onClick={onLetAbleToChangeName}
              >
                <Create />
              </Button>
            )}
          </div>
        </Grid>

        <Grid item xs={9}>
          <div
            style={{
              borderBottom: "1px solid " + currentThemeColor.textWhite87,
              width: "100%",
              marginBottom: "16px",
              padding: "4px 8px",
            }}
          >
            <div
              style={{
                display: "inline-block",
                marginRight: "20px",
                fontWeight: "bold",
                width: "135px",
              }}
            >
              {t("Project Description")}
            </div>
            <InputBase
              variant="outlined"
              margin="normal"
              required
              name="projectDescription"
              placeholder={projectDescription}
              label={projectDescription}
              id="projectDescription"
              autoComplete="projectDescription"
              type="projectDescription"
              onChange={changeProjectDescription}
              value={projectDescription}
              style={{ color: currentThemeColor.textWhite87, width: "80%" }}
              disabled={isUnableToChangeDescription}
              autoFocus={true}
              inputRef={descriptionRef}
              multiline={true}
              maxRows={5}
              onClick={onLetAbleToChangeDetail}
            />
            {isUnableToChangeDescription && (
              <Button
                className={classes.changeButton}
                onClick={onLetAbleToChangeDetail}
              >
                <Create />
              </Button>
            )}
          </div>
        </Grid>

        <Grid item xs={9}>
          <div
            style={{
              width: "100%",
              marginBottom: "16px",
              padding: "4px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              className={classes.defaultDeleteButton}
              onClick={() => deleteProject(projects.project.id)}
            >
              {t("Delete Project")}
            </Button>
            <Button
              className={classes.defaultF0F0OutlineButton}
              onClick={() => updateProject(projects.project.id)}
            >
              {t("Edit")}
            </Button>
          </div>
        </Grid>
      </>
    );
  };

  return (
    <>
      <ReactTitle title={"DS2.ai - " + t("Settings")} />
      {isLoading ? (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <div style={{ marginTop: "30px" }}>
            {renderProjectUpdateOrDelete()}
          </div>
        </>
      )}
    </>
  );
};

export default React.memo(MarketDetailSetting);
