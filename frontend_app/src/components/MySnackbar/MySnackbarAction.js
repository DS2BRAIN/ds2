import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Button from "components/CustomButtons/Button";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import WarningIcon from "@material-ui/icons/Warning";
import { makeStyles } from "@material-ui/core/styles";
import { currentThemeColor } from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import {
  postAppCodeRequest,
  deleteCompanyLogoRequestAction,
  postCancelPlanRequestAction,
  postCancelNextPlanRequestAction,
} from "redux/reducers/user.js";
import {
  closeModalRequestAction,
  closeAskSnackbarRequestAction,
  renderPayplePageReqeustAction,
  renderLabelExportRequestAction,
  goToMainPageRequestAction,
} from "redux/reducers/messages.js";
import {
  deleteLabelProjectRequestAction,
  putLabelProjectRequestAction,
  deleteLabelClassRequestAction,
  deleteObjectListsRequestAction,
} from "redux/reducers/labelprojects.js";
import {
  deleteProjectsRequestAction,
  deleteOpsProjectsRequestAction,
  deleteJupyterProjectsRequestAction,
  deleteDataConnectorsRequestAction,
  putProjectNameRequestAction,
  putProjectDescriptionRequestAction,
  startProjectRequestAction,
  stopProjectRequestAction,
  putMarketProjectRequestAction,
} from "redux/reducers/projects.js";
import {
  acceptGroupRequestAction,
  deleteMemberRequestAction,
  deleteGroupRequestAction,
  leaveGroupRequestAction,
} from "redux/reducers/groups.js";
import { useTranslation } from "react-i18next";

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const useStyles1 = makeStyles((theme) => ({
  success: {
    backgroundColor: currentThemeColor.primary1 + " !important",
    color: currentThemeColor.textWhite87,
  },
  error: {
    backgroundColor: currentThemeColor.error + " !important",
    color: currentThemeColor.textWhite87,
  },
  warning: {
    backgroundColor: currentThemeColor.surface1 + " !important",
    border: "1px solid rgba(58, 59, 60, 0.87)",
    color: currentThemeColor.textWhite87,
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: "flex",
    alignItems: "center",
  },
  yesAction: {
    color: currentThemeColor.textWhite87,
    "&:hover": {
      fontWeight: "bold",
      backgroundColor: currentThemeColor.primary1,
    },
  },
  noAction: {
    color: currentThemeColor.textWhite87,
    "&:hover": {
      fontWeight: "bold",
      backgroundColor: currentThemeColor.primary1,
    },
  },
}));

function MySnackbarAction(props) {
  const classes = useStyles1();
  const dispatch = useDispatch();
  const { user, labelprojects, messages, projects } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
      projects: state.projects,
    }),
    []
  );
  const {
    classFrom,
    className,
    message,
    onYesAction,
    variant,
    ...other
  } = props;
  const Icon = variantIcon[variant];

  const { t } = useTranslation();

  const renderAction = () => {
    dispatch(closeAskSnackbarRequestAction());
    switch (messages.requestAction) {
      case "closeModal":
        dispatch(closeModalRequestAction());
        break;
      case "postAppCode":
        dispatch(postAppCodeRequest());
        break;
      case "deleteCompanyLogo":
        dispatch(deleteCompanyLogoRequestAction());
        break;
      case "cancelPlan":
        dispatch(postCancelPlanRequestAction(user.me.nextPaymentDate));
        break;
      case "cancelNextPlan":
        dispatch(postCancelNextPlanRequestAction());
        break;
      case "firstpay":
        dispatch(renderPayplePageReqeustAction());
        break;
      case "deleteLabelProject":
        dispatch(deleteLabelProjectRequestAction(messages.datas));
        break;
      case "putLabelProject":
        dispatch(
          putLabelProjectRequestAction({
            id: labelprojects.projectDetail.id,
            data: messages.datas,
          })
        );
        break;
      case "deleteLabelClass":
        dispatch(deleteLabelClassRequestAction(messages.datas));
        break;
      case "projectFromLabel":
        dispatch(renderLabelExportRequestAction());
        break;
      case "exportCoco":
      case "exportVoc":
      case "exportData":
        dispatch(renderLabelExportRequestAction());
        break;
      case "deleteListObjects":
        dispatch(deleteObjectListsRequestAction(messages.datas));
        break;
      case "deleteProjects":
        dispatch(deleteProjectsRequestAction(messages.datas));
        break;
      case "deleteOpsProjects":
        dispatch(deleteOpsProjectsRequestAction(messages.datas));
        break;
      case "deleteJupyterProjects":
        dispatch(deleteJupyterProjectsRequestAction(messages.datas));
        break;
      case "deleteConnectors":
        dispatch(deleteDataConnectorsRequestAction(messages.datas));
        break;
      case "putProjectName":
        dispatch(putProjectNameRequestAction(messages.datas));
        break;
      case "putProjectDescription":
        dispatch(putProjectDescriptionRequestAction(messages.datas));
        break;
      case "startProject":
        dispatch(startProjectRequestAction(messages.datas));
        break;
      case "stopProject":
        dispatch(stopProjectRequestAction(messages.datas));
        break;
      case "goToMainPage":
        dispatch(goToMainPageRequestAction(messages.datas));
        break;
      case "acceptGroup":
        dispatch(acceptGroupRequestAction(messages.datas));
        break;
      case "refuseGroup":
        dispatch(acceptGroupRequestAction(messages.datas));
        break;
      case "deleteMember":
        dispatch(deleteMemberRequestAction(messages.datas));
        break;
      case "deleteGroup":
        dispatch(deleteGroupRequestAction(messages.datas));
        break;
      case "leaveGroup":
        dispatch(leaveGroupRequestAction(messages.datas));
        break;
      case "putMarketProject":
        dispatch(
          putMarketProjectRequestAction({
            id: projects.project.id,
            data: messages.datas,
          })
        );
        break;
      default:
        break;
    }
  };

  return (
    <SnackbarContent
      className={clsx(classes[variant], className)}
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          {t(message)}
        </span>
      }
      action={[
        <Button
          key={`close${classFrom}yes`}
          aria-label="close"
          className={classes.yesAction}
          onClick={renderAction}
          id="yesBtn"
        >
          {t("Yes")}
        </Button>,
        <Button
          key={`close${classFrom}no`}
          aria-label="close"
          className={classes.noAction}
          onClick={() => {
            dispatch(closeAskSnackbarRequestAction());
          }}
          id="noBtn"
        >
          {t("No")}
        </Button>,
      ]}
      {...other}
    />
  );
}

export default MySnackbarAction;

MySnackbarAction.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(["error", "info", "success", "warning"]).isRequired,
};
