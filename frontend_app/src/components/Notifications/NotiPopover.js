import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";

import Cookies from "helpers/Cookies";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import { linkDownloadUrl } from "components/Function/globalFunc";
import Button from "components/CustomButtons/Button.js";
import { getNotificationText } from "components/Notifications/NotiText";
import {
  getAsynctasksRequestAction,
  postCheckAsynctasksRequestAction,
  postChecAllkAsynctasksRequestAction,
} from "redux/reducers/user.js";
import { IS_ENTERPRISE } from "variables/common";

import { Popover, Tooltip } from "@material-ui/core";
import { Badge, CircularProgress, Grid, IconButton } from "@mui/material";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import NotificationsIcon from "@material-ui/icons/Notifications";

const NotiPopover = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = currentTheme();
  const { user } = useSelector((state) => ({ user: state.user }), []);
  const { t, i18n } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [isNotiLoading, setIsNotiLoading] = useState(false);

  useEffect(() => {
    window.ChannelIO("onShow", function() {
      handleNotiPopClose();
    });
  }, []);

  useEffect(() => {
    if (user.isAsynctaskDone) {
      getAsyncTaskData();
    }
  }, [user.isAsynctaskDone]);

  useEffect(() => {
    setIsNotiLoading(user.isLoading);
  }, [user.isLoading]);

  const handleNotiPopClose = () => {
    setAnchorEl(null);
  };

  const getAsyncTaskData = () => {
    if (!Cookies.getCookie("jwt")) {
      return;
    }
    dispatch(getAsynctasksRequestAction());
  };

  const partNotiIcon = (notis) => {
    const handleNotiPopOpen = (event) => {
      getAsyncTaskData();
      setAnchorEl(event.currentTarget);
      if (!IS_ENTERPRISE) {
        window.ChannelIO("hide");
      }
    };
    return (
      <IconButton
        id="notice_icon_btn"
        color="inherit"
        onClick={handleNotiPopOpen}
      >
        <Badge
          badgeContent={
            notis && !isNotiLoading
              ? notis.length >= 30
                ? "30+"
                : notis.length
              : 0
          }
          color="error"
        >
          <NotificationsIcon className={classes.fillBDhoverFF} />
        </Badge>
      </IconButton>
    );
  };

  const partNotiPop = (notis) => {
    let isNotiLenPositive = notis && notis.length > 0 ? true : false;

    const secPopoverHead = (isLen) => {
      const goToAlarmHistory = () => {
        setAnchorEl(null);
        window.location.href = "/admin/setting/notilist";
      };

      const btnViewAllNoti = () => (
        <Button
          id="view_allnoti_btn"
          shape="whiteOutlined"
          onClick={goToAlarmHistory}
        >
          {t("View all")}
        </Button>
      );

      const onMarkedAsAll = async () => {
        setIsNotiLoading(true);
        await dispatch(postChecAllkAsynctasksRequestAction());
      };

      return isLen ? (
        <Grid
          sx={{
            display: "flex",
            alignItems: "center",
            px: 3,
            pt: 0,
            pb: 1.5,
          }}
        >
          {btnViewAllNoti()}
          <Button
            id="check_notiallread_btn"
            shape="greenOutlined"
            sx={{ ml: 1.5 }}
            onClick={onMarkedAsAll}
          >
            {t("Check as full read")}
          </Button>
        </Grid>
      ) : (
        <Grid>
          <Grid sx={{ display: "flex", px: 3, pt: 0, pb: 1.5 }}>
            {btnViewAllNoti()}
          </Grid>
          <Grid sx={{ mx: 2, px: 1, py: 5, borderTop: "1px solid #4F4F4F" }}>
            {t("There are currently no unread notifications.")}
          </Grid>
        </Grid>
      );
    };

    const secPopoverBody = (isLoading, isLen, notis) => {
      const onClickRunDownload = async (id, fileUrl) => {
        setAnchorEl(null);
        await dispatch(postCheckAsynctasksRequestAction(id));
        await linkDownloadUrl(fileUrl);
      };

      const onClickLabellingProject = async (id, project) => {
        setAnchorEl(null);
        await dispatch(postCheckAsynctasksRequestAction(id));
        history.push(`/admin/labelling/${project}`);
      };

      const onClickDevelopProject = async (id, project) => {
        setAnchorEl(null);
        await dispatch(postCheckAsynctasksRequestAction(id));
        history.push(`/admin/train/${project}`);
      };

      const onCheckNavbarAlarm = async (id) => {
        setIsNotiLoading(true);
        await dispatch(postCheckAsynctasksRequestAction(id));
      };

      const divNotiLoading = () => (
        <Grid
          sx={{
            width: "100%",
            py: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
          <div>{t("Refreshing notifications.")}..</div>
        </Grid>
      );

      const divNotiList = (tasks) =>
        tasks.map((task, idx) => {
          if (task.isChecked) return;

          let tempType = task.taskType;
          let isButton = false;
          let isDownload = false;
          let isLabelling = false;
          let isDevelop = false;
          if (
            tempType === "runAll" ||
            tempType === "runMovie" ||
            tempType === "exportCoco" ||
            tempType === "exportVoc" ||
            tempType === "exportData"
          )
            isDownload = true;
          else if (
            tempType === "autoLabeling" ||
            tempType === "uploadLabelProjectData"
          )
            isLabelling = true;
          else if (
            (tempType === tempType) === "develop" ||
            tempType === "runAnalyzing"
          )
            isDevelop = true;
          isButton = isDownload || isDownload || isDevelop;

          let notiBtnText = "";
          if (isDownload) notiBtnText = "Download file";
          else if (isLabelling) notiBtnText = "to Labeling projects";
          else if (isDevelop) notiBtnText = "to Projects";

          return (
            <Grid
              key={`noti_${task.id}`}
              sx={{
                px: 1.5,
                background: currentThemeColor.background1,
              }}
            >
              <Grid
                container
                key={`notification_${task.id}`}
                id={`notification_${idx}`}
                sx={{
                  px: 1,
                  py: 1.5,
                  borderTop: "1px solid #4F4F4F",
                }}
              >
                <Grid item xs={7}>
                  <span style={{ wordBreak: "break-all" }}>
                    {"[ " +
                      task.taskName +
                      " ]" +
                      " " +
                      getNotificationText(
                        task.status,
                        tempType,
                        task.statusText,
                        i18n?.language
                      )}
                  </span>
                </Grid>
                <Grid
                  item
                  xs={5}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  {task.status === 100 && isButton ? (
                    <Button
                      id={`notification_${task.id}_btn`}
                      shape="greenOutlined"
                      size="sm"
                      onClick={() => {
                        if (isDownload)
                          onClickRunDownload(task.id, task.outputFilePath);
                        else if (isLabelling)
                          onClickLabellingProject(task.id, task.labelproject);
                        else if (isDevelop)
                          onClickDevelopProject(task.id, task.project);
                      }}
                    >
                      {t(notiBtnText)}
                    </Button>
                  ) : (
                    <Button
                      id={`notification_${task.id}_btn`}
                      shape="greenOutlined"
                      size="sm"
                      onClick={() => {
                        onCheckNavbarAlarm(task.id);
                      }}
                    >
                      {t("Mark as read")}
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          );
        });

      return isLoading ? divNotiLoading() : isLen && divNotiList(notis);
    };

    return (
      <Popover
        id={Boolean(anchorEl) ? "popover" : undefined}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleNotiPopClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Grid
          id="popoverContent"
          className={classes.text87}
          sx={{
            width: "360px",
            height: "100%",
            maxHeight: "400px",
            py: 2,
            background: currentThemeColor.background1,
          }}
        >
          {secPopoverHead(isNotiLenPositive)}
          {secPopoverBody(isNotiLoading, isNotiLenPositive, notis)}
        </Grid>
      </Popover>
    );
  };

  return (
    <Grid id="notification_popover" sx={{ mt: 0.25 }}>
      {partNotiIcon(user.asynctasks)}
      {partNotiPop(user.asynctasks)}
    </Grid>
  );
};

export default React.memo(NotiPopover);
