import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";

import {
  askLabelProjectDetailRequestAction,
  askDeleteLabelProjectReqeustAction,
} from "redux/reducers/messages.js";
import { setIsProjectRefreshed } from "redux/reducers/labelprojects";
import currentTheme, { currentThemeColor } from "assets/jss/custom";
import * as api from "controller/api.js";
import { linkDownloadUrl, openChat } from "components/Function/globalFunc";
import { getNotificationText } from "components/Notifications/NotiText";
import Button from "components/CustomButtons/Button";

import {
  Grid,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Pagination from "@material-ui/lab/Pagination";
import Create from "@material-ui/icons/Create";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

const LabelSetting = ({ history, onSetSelectedPage }) => {
  let nameRef = useRef();
  let descriptionRef = useRef();

  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, labelprojects } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );
  const { t, i18n } = useTranslation();

  const initialGetAsyncTaskCondition = {
    start: 1,
    count: 5,
    id: labelprojects.projectDetail.id,
  };

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
  const [hasReviewProcess, setHasReviewProcess] = useState(false);

  const changeProjectName = (e) => {
    e.preventDefault();
    setProjectName(e.target.value);
  };

  const changeProjectDescription = (e) => {
    e.preventDefault();
    setProjectDescription(e.target.value);
  };

  const changeHasReviewProcess = (e) => {
    setHasReviewProcess(e.target.checked);
  };

  const deleteProject = (id) => {
    const deleteFilesArr = [id];
    dispatch(
      askDeleteLabelProjectReqeustAction({
        labelProjects: deleteFilesArr,
        sortInfo: {
          sorting: "created_at",
          count: 10,
          start: 0,
          isDesc: true,
        },
      })
    );

    // api
    //   .deleteLabelProject(deleteFilesArr)
    //   .then((res) => {
    //     dispatch(
    //       openSuccessSnackbarRequestAction(t("The project has been deleted."))
    //     );
    //     history.push(
    //       "/admin/labelling?page=1&sorting=created_at&desc=true&rows=10"
    //     );
    //   })
    //   .catch((e) => {
    //     console.log(e, "e");
    //     if (e.response && e.response.data.message) {
    //       dispatch(
    //         openErrorSnackbarRequestAction(
    //           sendErrorMessage(
    //             e.response.data.message,
    //             e.response.data.message_en,
    //             user.language
    //           )
    //         )
    //       );
    //     } else {
    //       dispatch(
    //         openErrorSnackbarRequestAction(
    //           t(
    //             "마켓프로젝트로 자동 생성된 라벨프로젝트는 삭제하실 수 없습니다."
    //           )
    //         )
    //       );
    //     }
    //   });
  };

  const updateProject = async () => {
    await dispatch(
      askLabelProjectDetailRequestAction({
        message: t("Are you sure you want to edit project information?"),
        requestAction: "putLabelProject",
        data: {
          type: "info",
          params: {
            name: projectName,
            description: projectDescription,
            has_review_process: hasReviewProcess,
          },
        },
      })
    );
    await setIsUnableToChangeName(true);
    await setIsUnableTochangeDescription(true);
  };

  // useEffect(() => {
  //   if (
  //     messages.requestAction === "putLabelProject" &&
  //     messages.datas === null
  //   ) {
  //     if (
  //       messages.message === "프로젝트 정보를 수정하시겠습니까?" ||
  //       messages.message ===
  //         "Are you sure you want to edit project information?"
  //     ) {
  //       setProjectName(labelprojects.projectDetail.name);
  //       setProjectDescription(labelprojects.projectDetail.description);
  //       setHasReviewProcess(labelprojects.projectDetail.description);
  //     }
  //   }
  // }, [messages.datas]);

  const tableHeads = [
    { value: "No", width: "10%" },
    { value: "content", width: "40%" },
    { value: "date", width: "25%" },
    { value: "action", width: "25%" },
  ];

  const tableBodys = [
    { value: "taskType", name: "content" },
    { value: "created_at", name: "date" },
  ];

  const taskTypes = {
    exportCoco: "COCO파일 변환",
    exportVoc: "VOC파일 변환",
    exportData: "파일 변환",
    autoLabeling: "라벨링프로젝트",
    add_object: "데이터 업로드",
    customAI: "커스텀 AI 프로젝트",
    runObjectDetectionLabeling: "라벨링프로젝트",
    runAll: "일괄예측",
    runMovie: "영상예측",
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

  const buttonText = [
    "파일 다운받기",
    "파일 다운받기",
    "파일 다운받기",
    "라벨링 확인하기",
    "데이터 확인하기",
    "도움 요청하기",
  ];

  const workapp = {
    object_detection: "물체인식",
    voice: "음성",
    normal_classification: "정형화 분류",
    normal_regression: "정형화 회귀",
    text: "자연어",
    image: "이미지 분류",
  };

  useEffect(() => {
    setIsLoading(true);
    getAsynctaskData({
      start: historyPage,
      count: 5,
      id: labelprojects.projectDetail.id,
    });
    setProjectName(labelprojects.projectDetail.name);
    setProjectDescription(labelprojects.projectDetail.description);
    setProjectCategory(labelprojects.projectDetail.workapp);
    setHasReviewProcess(labelprojects.projectDetail.has_review_process);
  }, []);

  useEffect(() => {
    if (!isUnableToChangeDescription) {
      descriptionRef.current.focus();
    }
  }, [isUnableToChangeDescription]);

  useEffect(() => {
    if (labelprojects.isDeleteLabelprojectsSuccess) {
      history.push(
        "/admin/labelling?page=1&sorting=created_at&desc=true&rows=10"
      );
    }
  }, [labelprojects.isDeleteLabelprojectsSuccess]);

  useEffect(() => {
    if (labelprojects.isProjectRefreshed) {
      getAsynctaskData(initialGetAsyncTaskCondition);

      dispatch(setIsProjectRefreshed(false));
    }
  }, [labelprojects.isProjectRefreshed]);

  const getAsynctaskData = (data) => {
    api
      .getAsynctaskAll(data, true)
      .then((res) => {
        setAsynctasks(res.data.asynctasks);
        setTotalLength(res.data.totalLength);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const changePage = (e, page) => {
    setIsLoading(true);
    setHistoryPage(page);
    getAsynctaskData({
      start: page,
      count: 5,
      id: labelprojects.projectDetail.id,
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
    //     id: labelprojects.projectDetail.id,
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
        //도움 요청하기 기능
        break;
    }
  };

  const onClickRunDownload = (fileUrl) => {
    linkDownloadUrl(fileUrl);
  };

  const onLetAbleToChangeName = async () => {
    await setIsUnableTochangeDescription(true);
    await setIsUnableToChangeName(false);
    await nameRef.current.focus();
  };

  const onLetAbleToChangeDetail = async () => {
    await setIsUnableToChangeName(true);
    await setIsUnableTochangeDescription(false);
    await descriptionRef.current.focus();
  };

  const renderProjectUpdateOrDelete = () => {
    return (
      <>
        <div className={classes.title} style={{ marginBottom: "12px" }}>
          {t("Project Information")}
        </div>
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
                fontSize: 16,
                width: "135px",
                marginLeft: "10px",
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
                width: "calc(100% - 160px)",
              }}
              disabled={isUnableToChangeName}
              // autoFocus={true}
              onFocus={(e) =>
                e.currentTarget.setSelectionRange(
                  e.currentTarget.value.length,
                  e.currentTarget.value.length
                )
              }
              onBlur={() => setIsUnableToChangeName(true)}
              inputRef={nameRef}
              onClick={onLetAbleToChangeName}
            />
            {isUnableToChangeName && (
              <IconButton
                style={{ width: "15px", padding: "0" }}
                onClick={onLetAbleToChangeName}
              >
                <Create />
              </IconButton>
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
                fontSize: 16,
                width: "135px",
                marginLeft: "10px",
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
              style={{
                color: currentThemeColor.textWhite87,
                width: "calc(100% - 160px)",
              }}
              disabled={isUnableToChangeDescription}
              // autoFocus={true}
              onFocus={(e) =>
                e.currentTarget.setSelectionRange(
                  e.currentTarget.value.length,
                  e.currentTarget.value.length
                )
              }
              onBlur={() => setIsUnableTochangeDescription(true)}
              inputRef={descriptionRef}
              multiline={true}
              maxRows={5}
              onClick={onLetAbleToChangeDetail}
            />
            {isUnableToChangeDescription && (
              <IconButton
                style={{ width: "15px", padding: "0" }}
                onClick={onLetAbleToChangeDetail}
              >
                <Create />
              </IconButton>
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
              cursor: "default",
            }}
          >
            <div
              style={{
                display: "inline-block",
                width: "135px",
                fontSize: 16,
                marginLeft: "10px",
              }}
            >
              {t("Category")}
            </div>
            <span
              style={{ fontSize: "16px", color: currentThemeColor.textWhite6 }}
            >
              {t(workapp[projectCategory])}
            </span>
            {/* <FormControlLabel
              value={projectCategory}
              label={t(workapp[projectCategory])}
              control={<Radio color="primary" />}
              checked
              style={{ cursor: "default", marginBottom: "0" }}
            /> */}
          </div>
        </Grid>

        <Grid item xs={9}>
          <div style={{ margin: "0 0 10px 5px", textAlign: "right" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={hasReviewProcess}
                  onChange={changeHasReviewProcess}
                />
              }
              label={
                <span style={{ fontSize: 16, fontWeight: 600 }}>{`${t(
                  "검수진행여부"
                )}`}</span>
              }
              style={{ margin: 0 }}
            />

            <Tooltip
              title={t("It is decided whether to proceed with the inspection of the manual labeling case.")}
            >
              <HelpOutlineOutlinedIcon
                fontSize="small"
                sx={{ fill: "var(--primary)", marginLeft: "4px" }}
              />
            </Tooltip>
          </div>
        </Grid>

        <Grid item xs={9}>
          <div
            style={{
              width: "100%",
              margin: "24px 0 16px",
              padding: "4px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              shape="redOutlined"
              onClick={() => deleteProject(labelprojects.projectDetail.id)}
            >
              {t("Delete Project")}
            </Button>
            <Button
              shape="whiteOutlined"
              onClick={() => updateProject(labelprojects.projectDetail.id)}
            >
              {t("Edit")}
            </Button>
          </div>
        </Grid>
      </>
    );
  };

  const renderProjectAsyncTaskHistory = () => {
    return (
      <>
        <div className={classes.title} style={{ marginBottom: "12px" }}>
          {t("Notification history")}
        </div>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              {tableHeads.map((tableHead, idx) => {
                return (
                  <TableCell
                    id="mainHeader"
                    key={idx}
                    className={classes.tableHead}
                    align="center"
                    width={tableHead.width}
                  >
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
                  <TableRow
                    key={asynctask.created_at + idx}
                    className={classes.tableRow}
                  >
                    <TableCell className={classes.tableRowCell} align="center">
                      <div className={classes.wordBreakDiv}>
                        {totalLength - (idx + 5 * (historyPage - 1))}
                      </div>
                    </TableCell>
                    {tableBodys.map((tableBody, idx) => {
                      return (
                        <TableCell
                          key={tableBody.value}
                          className={classes.tableRowCell}
                          align={
                            tableBody.name === "content" ? "left" : "center"
                          }
                        >
                          <div>
                            {tableBody.value === "taskType" ? (
                              <>
                                {asynctask.taskName +
                                  " " +
                                  getNotificationText(
                                    asynctask.status,
                                    asynctask.taskType,
                                    asynctask.statusText,
                                    i18n?.language
                                  )}
                              </>
                            ) : (
                              <>{asynctask[tableBody.value].substring(0, 10)}</>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell
                      key={idx}
                      className={classes.tableRowCell}
                      align="center"
                    >
                      <div className={classes.wordBreakDiv}>
                        {buttonTask.indexOf(asynctask.taskType) > -1 ? (
                          <>
                            {buttonTask.indexOf(asynctask.taskType) < 4 ? (
                              <>
                                {asynctask.status === 100 && (
                                  <Button
                                    shape="greenOutlined"
                                    onClick={() => {
                                      onClickButtonAction(
                                        asynctask.taskType,
                                        asynctask.outputFilePath
                                      );
                                    }}
                                  >
                                    {t(
                                      buttonText[
                                        buttonTask.indexOf(asynctask.taskType)
                                      ]
                                    )}
                                  </Button>
                                )}
                                {asynctask.status === 99 && (
                                  <Tooltip
                                    title={
                                      <span style={{ fontSize: "12px" }}>
                                        {t(
                                          "문의 시 에러 생성일과 파일명을 말씀해 주세요."
                                        )}
                                      </span>
                                    }
                                    placement="bottom"
                                  >
                                    <div>
                                      <Button
                                        shape="greenOutlined"
                                        onClick={() => openChat()}
                                      >
                                        {t("Contact us")}
                                      </Button>
                                    </div>
                                  </Tooltip>
                                )}
                              </>
                            ) : (
                              <>
                                {asynctask.status === 99 && (
                                  <Button
                                    shape="greenOutlined"
                                    onClick={() =>
                                      onClickButtonAction(asynctask.taskType)
                                    }
                                  >
                                    {t(
                                      buttonText[
                                        buttonTask.indexOf(asynctask.taskType)
                                      ]
                                    )}
                                  </Button>
                                )}
                              </>
                            )}
                          </>
                        ) : (
                          "-"
                        )}
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
          <Pagination
            count={totalLength ? Math.ceil(totalLength / 5) : 0}
            page={historyPage}
            onChange={changePage}
            classes={{ ul: classes.paginationNum }}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <ReactTitle title={"DS2.ai - " + t("Labeling")} />
      {isLoading ? (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <div style={{ marginTop: "30px" }}>
            {renderProjectUpdateOrDelete()}
          </div>
          <div style={{ marginTop: "50px", width: "75%" }}>
            {renderProjectAsyncTaskHistory()}
          </div>
        </>
      )}
    </>
  );
};

export default React.memo(LabelSetting);
