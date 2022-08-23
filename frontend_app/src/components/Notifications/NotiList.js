import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import * as api from "controller/api.js";
import { fileurl } from "controller/api";
import { getAsynctasksRequestAction } from "redux/reducers/user.js";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import { convertToLocalDateStr, openChat } from "../Function/globalFunc.js";
import Button from "components/CustomButtons/Button.js";
import { getNotificationText } from "components/Notifications/NotiText";
import { IS_ENTERPRISE } from "variables/common.js";

import {
  FormControl,
  MenuItem,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
} from "@material-ui/core";
import { CircularProgress, Container, Grid } from "@mui/material";
import CheckCircleOutlinedIcon from "@material-ui/icons/CheckCircleOutlined";
import CloseIcon from "@material-ui/icons/Close";

const NotiList = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();

  const { t, i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [asyncTasks, setAsyncTasks] = useState(null);
  const [alarmListPage, setAlarmListPage] = useState(0);
  const [rowsPerAlarmListPage, setRowsPerAlarmListPage] = useState(10);
  const [totalLength, setTotalLength] = useState(10);
  const [asynctaskType, setAsynctaskType] = useState("all");
  const [openErrorFileList, setOpenErrorFileList] = useState(false);
  const [selectedTask, setSelectedTask] = useState({});

  useEffect(() => {
    getAsynctasksAll(alarmListPage, rowsPerAlarmListPage);
  }, []);

  const getAsynctasksAll = (start, count, rawType) => {
    const type = rawType ? rawType : asynctaskType;
    const asynctaskInfo = { start: start, count: count, tasktype: type };
    api
      .getAsynctaskAll(asynctaskInfo)
      .then((res) => {
        setAsyncTasks(res.data.asynctasks);
        setTotalLength(res.data.totalLength);
      })
      .then(() => {
        setIsLoading(false);
      });
  };

  const checkAsynctask = async (id) => {
    // await setIsLoading(true);
    await api
      .checkAsynctask(id)
      .then(() => {
        getAsynctasksAll(alarmListPage, rowsPerAlarmListPage);
      })
      .then(() => {
        dispatch(getAsynctasksRequestAction());
      });
  };

  const changeAlarmListPage = (event, newPage) => {
    setAlarmListPage(newPage);
    getAsynctasksAll(newPage, rowsPerAlarmListPage);
  };

  const changeRowsPerAlarmListPage = (event) => {
    setRowsPerAlarmListPage(+event.target.value);
    setAlarmListPage(0);
    getAsynctasksAll(0, +event.target.value);
  };

  const onClickRunDownload = async (isChecked, id, downloadUrl) => {
    let url = "";
    let urlArr = downloadUrl?.split("/");
    let downloadName = urlArr.length && urlArr[urlArr.length - 1];
    const linkEl = document.createElement("a");
    if (IS_ENTERPRISE) url = fileurl + "static" + downloadUrl;
    else url = downloadUrl;
    linkEl.href = url;
    linkEl.download = downloadName;
    linkEl.dispatchEvent(new MouseEvent("click"));

    if (!isChecked) await checkAsynctask(id);
  };

  const onClickDataconnector = async (isChecked, id) => {
    if (isChecked) {
      await history.push("/admin/dataconnector");
    } else {
      await checkAsynctask(id);
      await history.push("/admin/dataconnector");
    }
  };

  const onClickLabellingProject = async (isChecked, id, project) => {
    if (isChecked) {
      await history.push(`/admin/labelling/${project}`);
    } else {
      await checkAsynctask(id);
      await history.push(`/admin/labelling/${project}`);
    }
  };

  const onClickDevelopProject = async (isChecked, id, project) => {
    if (isChecked) {
      await history.push(`/admin/train/${project}`);
    } else {
      await checkAsynctask(id);
      await history.push(`/admin/train/${project}`);
    }
  };

  const onSetAsynctaskType = (e) => {
    setAsynctaskType(e.target.value);
    getAsynctasksAll(0, rowsPerAlarmListPage, e.target.value);
    setAlarmListPage(0);
  };

  const divNotiActionBtn = (task) => {
    let status = task.status;
    let taskType = task.taskType;
    let statusText = task.statusText;

    let isDone = status === 100;
    let isError = status === 99;
    let isHeld = status === 9;

    let isShortcut =
      taskType === "develop" ||
      taskType === "runAnalyzing" ||
      taskType === "customAi";
    let isLabel =
      taskType === "autoLabeling" || taskType === "uploadLabelProjectData";
    let isPredict = taskType === "runAll" || taskType === "runMovie";
    let isDownload =
      taskType === "exportCoco" ||
      taskType === "exportVoc" ||
      taskType === "exportData";

    const renderErrorOpenChatbotBtn = (task) => {
      return (
        <Tooltip
          title={
            <span style={{ fontSize: "12px" }}>
              {t(
                "When inquiring, please tell us the date of creation of the error and the name of the file."
              )}
            </span>
          }
          placement="bottom"
        >
          <div>
            <Button
              id="contact_cs_btn"
              shape="greenOutlined"
              onClick={() => openChat()}
            >
              {t("Contact us")}
            </Button>
          </div>
        </Tooltip>
      );
    };

    const errorOpenList = (task) => (
      <Button
        id="check_errorlist_btn"
        shape="greenOutlined"
        onClick={() => {
          setOpenErrorFileList(true);
          setSelectedTask(task);
        }}
      >
        {t("Check the list")}
      </Button>
    );

    const onClickToPayment = () => {
      history.push("/admin/setting/payment");
    };

    return (
      <TableCell
        className={classes.tableRowCellNoPointer}
        align="center"
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {(isHeld || isError) &&
          taskType !== "planPayment" &&
          !IS_ENTERPRISE &&
          renderErrorOpenChatbotBtn(task)}
        {isDone &&
          statusText &&
          statusText?.failFileList?.length > 0 &&
          errorOpenList(task)}
        {!isHeld && !isError && isShortcut && (
          <Button
            id="go_project_btn"
            shape="greenOutlined"
            onClick={() =>
              onClickDevelopProject(task.isChecked, task.id, task.project)
            }
          >
            {t("to Projects")}
          </Button>
        )}
        {isDone && (isLabel || isPredict || isDownload) && (
          <Button
            id="download_file_btn"
            shape="greenOutlined"
            onClick={() => {
              if (isLabel)
                onClickLabellingProject(
                  task.isChecked,
                  task.id,
                  task.labelproject
                );
              else if (isPredict || isDownload)
                onClickRunDownload(
                  task.isChecked,
                  task.id,
                  task.outputFilePath
                );
            }}
          >
            {isLabel && t("to Labeling projects")}
            {isPredict && taskType === "runAll" && t("Download")}
            {isPredict && taskType === "runMovie" && t("Download")}
            {isDownload && t("Download file")}
          </Button>
        )}
        {isDone &&
          statusText?.failFileList?.length === 0 &&
          taskType === "uploadDataConnector" && (
            <Button
              id="go_failfilelist_btn"
              shape="greenOutlined"
              onClick={() => onClickDataconnector(task.isChecked, task.id)}
            >
              {t("to the list")}
            </Button>
          )}
        {!IS_ENTERPRISE && taskType === "planPayment" && (
          <Button
            id="check_payment_btn"
            shape="greenOutlined"
            onClick={() => onClickToPayment()}
          >
            {isDone ? t("To payment history") : t("Modify payment")}
          </Button>
        )}
      </TableCell>
    );
  };

  return (
    <Container
      component="main"
      maxWidth="false"
      disableGutters
      className={classes.mainCard}
    >
      <Grid
        container
        justifyContent="space-between"
        className={classes.settingTitle}
        sx={{ mt: 5, mb: 4 }}
      >
        <Grid item>{"Notifications"}</Grid>
        <Grid item>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                fontSize: 16,
                marginRight: "20px",
                color: currentThemeColor.textWhite87,
              }}
            >
              TYPE:{" "}
            </div>
            <FormControl style={{ width: "200px" }}>
              <Select
                labelid="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={asynctaskType}
                className={classes.selectForm}
                onChange={onSetAsynctaskType}
              >
                <MenuItem value="all">{t("All")}</MenuItem>
                <MenuItem value="ds2Dataset">{t("Dataset")}</MenuItem>
                <MenuItem value="labelingAi">{t("Labeling")}</MenuItem>
                <MenuItem value="clickAi">{t("Modeling")}</MenuItem>
                {!IS_ENTERPRISE && (
                  <MenuItem value="payment">{t("Payment")}</MenuItem>
                )}
              </Select>
            </FormControl>
          </div>
        </Grid>
      </Grid>
      {isLoading ? (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      ) : (
        <div style={{ width: "100%", marginTop: "20px" }}>
          {asyncTasks && asyncTasks.length > 0 ? (
            <>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      className={classes.tableHead}
                      style={{ width: "30%" }}
                      align="center"
                    >
                      <b style={{ color: "var(--textWhite87)" }}>
                        {t("Notification content")}
                      </b>
                    </TableCell>
                    <TableCell
                      className={classes.tableHead}
                      style={{ width: "15%" }}
                      align="center"
                    >
                      <b style={{ color: "var(--textWhite87)" }}>
                        {t("Date created")}
                      </b>
                    </TableCell>
                    <TableCell
                      className={classes.tableHead}
                      style={{ width: "5%" }}
                      align="center"
                    >
                      <b style={{ color: "var(--textWhite87)" }}>
                        {t("Read/Unread")}
                      </b>
                    </TableCell>
                    {/* <TableCell
                      className={classes.tableHead}
                      style={{ width: "15%" }}
                      align="center"
                    >
                      <Tooltip
                        title={
                          <span style={{ fontSize: "11px" }}>
                            {t("Mark all notifications as read.")}
                          </span>
                        }
                        placement="top-start"
                      >
                        <img
                          src={ableAlarm}
                          className={classes.alarmIconImg}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            checkAsynctask(-1);
                          }}
                        />
                      </Tooltip>
                    </TableCell> */}
                    <TableCell
                      className={classes.tableHead}
                      style={{ width: "15%" }}
                      align="center"
                    >
                      <b style={{ color: "var(--textWhite87)" }}>Action</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody id="noticeTable">
                  {asyncTasks &&
                    asyncTasks.map((task, idx) => (
                      <TableRow
                        key={task.taskName + task.id}
                        className={classes.tableRow}
                        style={{
                          background:
                            idx % 2 === 0
                              ? currentTheme.tableRow1
                              : currentTheme.tableRow2,
                        }}
                      >
                        <TableCell
                          className={classes.tableRowCellNoPointer}
                          align="left"
                        >
                          <div style={{ marginLeft: "15px" }}>
                            <span>
                              {"[ " +
                                task.taskName +
                                " ]" +
                                " " +
                                getNotificationText(
                                  task.status,
                                  task.taskType,
                                  task.statusText,
                                  i18n?.language
                                )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className={classes.tableRowCellNoPointer}
                          align="center"
                        >
                          {task.created_at
                            ? convertToLocalDateStr(task.created_at)
                            : ""}
                        </TableCell>
                        <TableCell
                          className={classes.tableRowCellNoPointer}
                          align="center"
                        >
                          {task.isChecked ? (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <CheckCircleOutlinedIcon />
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <CheckCircleOutlinedIcon
                                style={{
                                  fill: "white",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  checkAsynctask(task.id);
                                }}
                              />
                            </div>
                          )}
                        </TableCell>
                        {divNotiActionBtn(task)}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[10, 20, 50]}
                component="div"
                count={totalLength}
                rowsPerPage={rowsPerAlarmListPage}
                page={alarmListPage}
                backIconButtonProps={{
                  "aria-label": "previous page",
                }}
                nextIconButtonProps={{
                  "aria-label": "next page",
                }}
                onPageChange={changeAlarmListPage}
                onRowsPerPageChange={changeRowsPerAlarmListPage}
                style={{ marginTop: 16 }}
              />
            </>
          ) : (
            <div style={{ padding: "20px" }}>
              {t("No notifications history.")}
            </div>
          )}
        </div>
      )}
      <div className={classes.settingTitle}></div>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openErrorFileList}
        onClose={() => {
          setOpenErrorFileList(false);
        }}
        className={classes.modalContainer}
      >
        <div
          className={classes.defaultModalContainer}
          style={{
            background: "#212121",
            position: "absolute",
            width: "50%",
            minWidth: "800px",
            minHeight: "200px",
            maxHeight: "540px",
            flexDirection: "column",
            overflowY: "scroll",
          }}
        >
          <Grid
            container
            className={classes.gridRoot}
            style={{ height: "100%", width: "100%", padding: "40px 20px" }}
          >
            <Grid item xs={10}>
              <div
                style={{
                  margin: "5px 0 20px 0",
                  fontSize: "20px",
                  lineHeight: "29px",
                }}
              >
                <b>{t("error file list")}</b>
              </div>
            </Grid>
            <Grid item xs={1}>
              <CloseIcon
                id="deleteLabelIcon"
                onClick={() => {
                  setOpenErrorFileList(false);
                }}
                style={{
                  float: "right",
                  cursor: "pointer",
                }}
              />
            </Grid>
            <Grid item xs={11}>
              {selectedTask?.statusText &&
                selectedTask.statusText?.failFileList.map((fileList) => (
                  <span
                    style={{
                      margin: "15px 0 0 -10px",
                      fontSize: "16px",
                      wordBreak: "break-all",
                      display: "flex",
                    }}
                  >
                    {"• "}
                    <div style={{ marginLeft: "10px" }}>{fileList}</div>
                    <br />
                  </span>
                ))}
            </Grid>
          </Grid>
        </div>
      </Modal>
    </Container>
  );
};

export default React.memo(NotiList);
