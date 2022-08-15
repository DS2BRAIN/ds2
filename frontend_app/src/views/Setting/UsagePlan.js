import React, { useState, useEffect } from "react";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Modal from "@material-ui/core/Modal";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import PlanModal from "./PlanModal";
import CircularProgress from "@mui/material/CircularProgress";
import currentTheme from "assets/jss/custom.js";
import Container from "@material-ui/core/Container";
import { useDispatch, useSelector } from "react-redux";
import {
  askModalRequestAction,
  openSuccessSnackbarRequestAction,
  askCancelPlanRequestAction,
  askCancelNextPlanReqeustAction,
} from "redux/reducers/messages.js";
import { stopUserLoadingRequestAction } from "redux/reducers/user.js";
import { useTranslation } from "react-i18next";
import CloseIcon from "@material-ui/icons/Close";
import Plans from "components/Plans/Plans.js";
import { currentThemeColor } from "assets/jss/custom.js";
import Button from "components/CustomButtons/Button";
import { openChat } from "components/Function/globalFunc";

const UsagePlan = () => {
  const dispatch = useDispatch();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );
  const classes = currentTheme();
  const url = window.location.href;
  const { t } = useTranslation();

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [planName, setPlanName] = useState(null);

  useEffect(() => {
    if (url.indexOf("?changed=true") !== -1) {
      dispatch(
        openSuccessSnackbarRequestAction(t("Plan has been changed"))
      );
    }
    if (url.indexOf("?additionalPay=true") !== -1) {
      dispatch(
        openSuccessSnackbarRequestAction(t("The additional payment was successful"))
      );
    }
  }, []);

  useEffect(() => {
    if (user.allPlans) {
      try {
        const allPlans = user.allPlans;
        const PLAN_NAME = {};
        for (let idx = 0; idx < allPlans.length; idx++) {
          const plan = allPlans[idx];
          PLAN_NAME[plan.id] = plan.planName;
        }
        setPlanName(PLAN_NAME);
      } catch (e) {
        if (!process.env.REACT_APP_DEPLOY) console.log(e);
      }
    }
  }, [user.allPlans]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsCancelModalOpen(false);
      setIsPlanModalOpen(false);
      dispatch(stopUserLoadingRequestAction());
    }
  }, [messages.shouldCloseModal]);

  const onOpenPlanModal = () => {
    setIsPlanModalOpen(true);
  };
  const onClosePlanModal = () => {
    setIsPlanModalOpen(false);
  };

  const onOpenChatbot = () => {
    setIsPlanModalOpen(false);
    openChat();
  };

  return (
    user.me &&
    planName && (
      <>
        <div className={classes.settingTitle} style={{ marginBottom: "36px" }}>
          Membership Info
        </div>
        <GridContainer style={{ width: "100%", display: "flex" }}>
          <GridItem xs={2}>
            <div className={classes.accountNameTitle}>{t("My Plan")}</div>
          </GridItem>
          <GridItem xs={8}>
            {user.me.usageplan &&
            Object.keys(user.me.usageplan).length !== 0 ? (
              <>
                <div style={{ marginBottom: "24px" }}>
                  <div className={classes.settingFontWhite6}>{t("Plan name")}</div>
                  <div className={classes.settingFontWhite87} id="planName">
                    {user.me.usageplan.planName &&
                      user.me.usageplan.planName.toUpperCase()}
                  </div>
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <div className={classes.settingFontWhite6}>
                    {user.me.usageplan &&
                    user.me.usageplan.planName === "business"
                      ? "GPU"
                      : "CPU"}
                  </div>
                  <div className={classes.settingFontWhite87} id="dynos">
                    {user.me.dynos}
                  </div>
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <div className={classes.settingFontWhite6}>{t("Price")}</div>
                  <div className={classes.settingFontWhite87} id="dynos">
                    {(user.me.dynos * user.me.usageplan.price).toLocaleString()}{" "}
                    {t("KRW")}
                  </div>
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <div className={classes.settingFontWhite6}>
                    {t("Next payment date")}
                  </div>
                  <div
                    className={classes.settingFontWhite87}
                    id="planNextPaymentText"
                  >
                    {user.me.nextPaymentDate &&
                      user.me.nextPaymentDate.substring(0, 10)}
                  </div>
                </div>
              </>
            ) : (
              <div>{t("You have no plan registered")}</div>
            )}
          </GridItem>
          <GridItem
            xs={2}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            {!user.me.usageplan ||
            Object.keys(user.me.usageplan).length === 0 ? (
              <Button
                id="addPlan"
                style={{ width: "120px", height: "25px" }}
                className={classes.defaultOutlineButton}
                onClick={onOpenPlanModal}
              >
                {t("Register plan")}
              </Button>
            ) : (
              <>
                <Button
                  id="modifyPlan"
                  style={{
                    marginBottom: "8px",
                    width: "120px",
                    height: "25px",
                  }}
                  className={classes.modelTabHighlightButton}
                  onClick={onOpenPlanModal}
                >
                  {t("Change plan")}
                </Button>
                <Button
                  id="cancelPlan"
                  className={classes.defaultF0F0OutlineButton}
                  onClick={() => {
                    setIsCancelModalOpen(true);
                  }}
                >
                  {t("Cancel")}
                </Button>
              </>
            )}
          </GridItem>
        </GridContainer>
        <div className={classes.settingTitle}></div>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isPlanModalOpen}
          onClose={() => {
            dispatch(askModalRequestAction());
          }}
          className={classes.modalContainer}
        >
          <div className={classes.planModalContent}>
            <div className={classes.planModalTitle}>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <div id="gradientTitle" className={classes.planModalTitleFont}>
                  {user.me &&
                  user.me.usageplan &&
                  user.me.usageplan.planName === "trial"
                    ? t("Upgrade your plan!")
                    : t("Would you like to change your plan?")}
                </div>
                <CloseIcon
                  className={classes.closeImg}
                  style={{ margin: "8px" }}
                  onClick={onClosePlanModal}
                />
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: currentThemeColor.textWhite87,
                }}
              >
                {user.me &&
                user.me.usageplan &&
                user.me.usageplan.planName === "trial"
                  ? t(
                      "Enterpirse 플랜으로 변경하여 제한 없이 CLICKAI를 이용해보세요."
                    )
                  : t(
                      "Enterpirse 플랜으로 계속 제한 없이 CLICKAI를 이용해보세요."
                    )}
              </div>
            </div>
            <Plans onOpenChatbot={onOpenChatbot} />
          </div>
        </Modal>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isCancelModalOpen}
          onClose={() => {
            dispatch(askModalRequestAction());
          }}
          className={classes.modalContainer}
        >
          <div className={classes.cancelModalContent}>
            <div className={classes.title}>{t("Cancel")}</div>
            {user.isLoading ? (
              <div
                style={{
                  overflowY: "auto",
                  width: "100%",
                  height: "240px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </div>
            ) : (
              <div>
                <div style={{ paddingTop: "20px", paddingLeft: "10px" }}>
                  {t("If you cancel, your plan will be changed to Free plan.")} <br />
                  {t("Please click the 'CANCEL' button if you want to continue.")}
                </div>
                <div className={classes.buttonContainer}>
                  <GridItem xs={5}>
                    <Button
                      id="closeCancelModalBtn"
                      style={{ width: "100%" }}
                      className={classes.defaultHighlightButton}
                      onClick={() => {
                        dispatch(askModalRequestAction());
                      }}
                    >
                      {t("Return")}
                    </Button>
                  </GridItem>
                  <GridItem xs={2}></GridItem>
                  <GridItem xs={5}>
                    <Button
                      id="reqeustRefundBtn"
                      style={{ width: "100%" }}
                      className={classes.defaultOutlineButton}
                      onClick={() => {
                        dispatch(askCancelPlanRequestAction());
                      }}
                    >
                      {t("Cancel")}
                    </Button>
                  </GridItem>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </>
    )
  );
};

export default React.memo(UsagePlan);
