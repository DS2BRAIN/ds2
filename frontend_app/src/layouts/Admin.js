import React, { useState, useEffect, createRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Route, Redirect } from "react-router-dom";

import * as api from "controller/api.js";
import { fileurl } from "controller/api";
import {
  getMainPageRequestAction,
  getAsynctasksRequestAction,
  changeUserLanguageRequestAction,
} from "redux/reducers/user.js";
import {
  closeInformSnackbarRequestAction,
  closeAskSnackbarRequestAction,
  openErrorSnackbarRequestAction,
  setPlanModalCloseRequestAction,
} from "redux/reducers/messages.js";
import { getGroupsRequestAction } from "redux/reducers/groups.js";
import routes from "routes.js";
import styles from "assets/jss/material-dashboard-react/layouts/adminStyle.js";
import Cookies from "helpers/Cookies";
import Page404 from "views/Error/Page404";
import Navbar from "components/Navbars/Navbar.js";
import Footer from "components/Footer/Footer.js";
import MySnackbar from "components/MySnackbar/MySnackbar.js";
import MySnackbarAction from "components/MySnackbar/MySnackbarAction.js";
import checkHttps, {
  sendErrorMessage,
} from "components/Function/globalFunc.js";
import Setting from "views/Setting/Setting";
import OpsPannel from "views/SkyhubAI/OpsPannel/OpsPannel";
import NewOpsProject from "views/SkyhubAI/NewOpsProject/NewOpsProject";
import Process from "views/AIProject/Process.js";
import Sample from "views/AIProject/Sample.js";
import LabelDetail from "views/Labelling/LabelDetail.js";
import Main from "views/Main/Main.js";
import MarketNewProject from "views/Market/MarketNewProject";
import MarketList from "views/Market/MarketList";
import NewProject from "views/Project/NewProject";
import JupyterProject from "views/JupyterProject/JupyterProjectList";
import NewJupyterProject from "views/JupyterProject/NewJupyterProject/NewJupyterProject";
import JupyterPannel from "views/JupyterProject/JupyterPannel/JupyterPannel";
import AutoMLProject from "views/AIProject/AutoMLProject";
import LabelVoice from "views/Labelling/LabelVoice.js";
import LabelStructure from "views/Labelling/LabelStructure.js";
import LabelNatural from "views/Labelling/LabelNatural.js";
import LabelImage from "views/Labelling/LabelImage.js";
import DataconnectorDetail from "views/Dataconnector/DataconnectorDetail";
import LabelprojectList from "views/Labelling/LabelprojectList";
import MarketDetail from "../views/Market/MarketDetail";
import Flow from "views/Main/Flow";
import Button from "components/CustomButtons/Button";
import { IS_ENTERPRISE } from "variables/common";

import { useTranslation } from "react-i18next";
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { makeStyles } from "@material-ui/core/styles";
import { Modal, Snackbar } from "@material-ui/core";
import { Container } from "@mui/material";
import CloseIcon from "@material-ui/icons/Close";

import amplitude from "amplitude-js";
import { openChat } from "components/Function/globalFunc";
import i18n from "language/i18n";
import DiagramPage from "views/Main/DiagramPage";

let ps;
const useStyles = makeStyles(styles);
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const Admin = ({ history, ...rest }) => {
  const dispatch = useDispatch();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );
  const classes = useStyles();
  const mainPanel = createRef();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProcessPage, setIsProcessPage] = useState(false);
  const [isAgreedBehaviorStatistics, setIsAgreedBehaviorStatistics] = useState(
    false
  );

  const { t } = useTranslation();

  // const containerWidth = isProcessPage ? 1600 : 1400;
  const containerWidth = 1600;
  const headerHeight = 64;
  const footerHeight = 210;

  const logo = fileurl + "asset/front/img/logo_transparent.png";
  const logoBlue = fileurl + "asset/front/img/logo_title.png";
  const upgradePlanModels =
    fileurl + "asset/front/img/mainIcon/upgradePlanModels.png";
  const path = window.location.pathname;
  const isLabelApp =
    path.includes("/ls/") || path.includes("/ln/") || path.includes("/li/");
  const switchRoutes = (
    <Switch>
      {routes.map((prop, key) => {
        const queryString = require("query-string");
        const parsed = queryString.parse(window.location.search);
        if (parsed.utm_source) {
          Cookies.setCookie("utm_source", parsed.utm_source, 90);
        }
        if (parsed.utm_medium) {
          Cookies.setCookie("utm_medium", parsed.utm_medium, 90);
        }
        if (parsed.utm_campaign) {
          Cookies.setCookie("utm_campaign", parsed.utm_campaign, 90);
        }
        if (parsed.utm_term) {
          Cookies.setCookie("utm_term", parsed.utm_term, 90);
        }
        if (parsed.utm_content) {
          Cookies.setCookie("utm_content", parsed.utm_content, 90);
        }
        if (
          (prop.path !== "/signin" && !Cookies.getCookie("jwt")) ||
          (prop.path !== "/signin" && !Cookies.getCookie("apptoken"))
        ) {
          return <Redirect to="/signin" />;
        }
        if (prop.layout === "/admin") {
          return (
            <Route
              exact
              path={prop.layout + prop.path}
              render={(props) => <prop.component {...props} />}
              key={key}
            />
          );
        }
        return null;
      })}
      <Route exact path="/" {...rest} render={(props) => <Main {...props} />} />
      <Route
        exact
        path="/admin"
        {...rest}
        render={(props) => <Main {...props} />}
      />
      <Route
        path="/admin/flow"
        {...rest}
        render={(props) => <Flow {...props} />}
      />
      <Route
        path="/admin/diagram"
        {...rest}
        render={(props) => <DiagramPage {...props} />}
      />
      <Route
        path="/admin/setting"
        {...rest}
        render={(props) => <Setting {...props} />}
      />
      <Route
        exact
        path="/admin/train/:id"
        {...rest}
        render={(props) => <Process {...props} />}
      />
      <Route
        exact
        path="/admin/verifyproject/:id"
        {...rest}
        render={(props) => <Process {...props} />}
      />
      <Route
        exact
        path="/admin/labelling/:id"
        {...rest}
        render={(props) => <LabelDetail {...props} />}
      />
      <Route
        exact
        path="/admin/labelling"
        {...rest}
        render={(props) => <LabelprojectList {...props} />}
      />
      <Route
        exact
        path="/admin/sample/:id"
        {...rest}
        render={(props) => <Sample {...props} />}
      />
      <Route
        exact
        path="/admin/marketNewProject/"
        {...rest}
        render={(props) => <MarketNewProject {...props} />}
      />
      <Route
        exact
        path="/admin/marketList"
        {...rest}
        render={(props) => <MarketList {...props} />}
      />
      <Route
        exact
        path="/admin/market/:id/:key"
        {...rest}
        render={(props) => <MarketDetail {...props} />}
      />
      <Route
        exact
        path="/admin/skyhubai/:id"
        {...rest}
        render={(props) => <OpsPannel {...props} />}
      />
      <Route
        exact
        path="/admin/newskyhubai"
        {...rest}
        render={(props) => <NewOpsProject {...props} />}
      />
      <Route
        exact
        path="/admin/newskyhubai/:id"
        {...rest}
        render={(props) => <NewOpsProject {...props} />}
      />
      <Route
        exact
        path="/admin/jupyterproject"
        {...rest}
        render={(props) => <JupyterProject {...props} />}
      />
      <Route
        exact
        path="/admin/jupyterproject/:id"
        {...rest}
        render={(props) => <JupyterPannel {...props} />}
      />
      <Route
        exact
        path="/admin/train"
        {...rest}
        render={(props) => <AutoMLProject {...props} route="train" />}
      />
      <Route
        exact
        path="/admin/verifyproject"
        {...rest}
        render={(props) => <AutoMLProject {...props} route="verifyproject" />}
      />
      <Route
        exact
        path="/admin/newjupyterproject"
        {...rest}
        render={(props) => <NewJupyterProject {...props} />}
      />
      <Route
        exact
        path="/admin/newjupyterproject/:id"
        {...rest}
        render={(props) => <NewJupyterProject {...props} />}
      />
      <Route
        exact
        path="/admin/newProject"
        {...rest}
        render={(props) => <NewProject {...props} />}
      />
      <Route
        exact
        path="/admin/lv/:id/:s3Url"
        {...rest}
        render={(props) => <LabelVoice {...props} />}
      />
      <Route
        exact
        path="/admin/ls/:id/:s3Url"
        {...rest}
        render={(props) => <LabelStructure {...props} />}
      />
      <Route
        exact
        path="/admin/ln/:id/:s3Url"
        {...rest}
        render={(props) => <LabelNatural {...props} />}
      />
      <Route
        exact
        path="/admin/li/:id/:s3Url"
        {...rest}
        render={(props) => <LabelImage {...props} />}
      />
      <Route
        exact
        path="/admin/dataconnector/:id"
        {...rest}
        render={(props) => <DataconnectorDetail {...props} />}
      />
      <Route render={() => <Page404 isAdminPage />} />
    </Switch>
  );

  // useEffect(() => {
  //   if (navigator.platform.indexOf("Win") > -1) {
  //     ps = new PerfectScrollbar(mainPanel.current, {
  //       suppressScrollX: true,
  //       suppressScrollY: false,
  //     });
  //     document.body.style.overflow = "hidden";
  //   }
  //   window.addEventListener("resize", resizeFunction);
  //   // Specify how to clean up after this effect:
  //   return function cleanup() {
  //     if (navigator.platform.indexOf("Win") > -1) {
  //       ps.destroy();
  //     }
  //     window.removeEventListener("resize", resizeFunction);
  //   };
  // }, [mainPanel]);

  useEffect(() => {
    console.log("amplitude init");
    amplitude.getInstance().init("446d673fc8928366cc815f058ba93381");

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
      apiKey: "AIzaSyCjk54mY3iqMHXg7p6aVsiYVPVbRqqX4uE",
      authDomain: "ds21-15cd3.firebaseapp.com",
      projectId: "ds21-15cd3",
      storageBucket: "ds21-15cd3.appspot.com",
      messagingSenderId: "925415753610",
      appId: "1:925415753610:web:b50087f87c1d7ad17c6a73",
      measurementId: "G-MZLTW963QY",
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    if (!IS_ENTERPRISE) {
      checkHttps();
    }
    // checkHttps();
    const userBrowser = navigator.userAgent.toLowerCase();
    var isChrome =
      /chrome/.test(userBrowser) &&
      userBrowser.indexOf("whale") === -1 &&
      userBrowser.indexOf("edg") === -1;
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userBrowser
    );

    if ((!isChrome || isMobile) && Cookies.getCookie("jwt")) {
      window.location.href = "/error";
    }
    const url = window.location.href;
    if (!IS_ENTERPRISE) {
      if (url.indexOf("?pg=true") !== -1) {
        window.location.href = "/admin/setting/payment/?message=true";
      }
      if (url.indexOf("?pg=duplicate") !== -1) {
        window.location.href = "/admin/setting/payment/?message=duplicate";
      }
      if (url.indexOf("?pg=false") !== -1) {
        window.location.href = "/admin/setting/payment/?message=false";
      }
      if (url.indexOf("?paid=true") !== -1) {
        window.location.href = "/admin/setting/payment/?pay=true";
      }
    }

    let lang = Cookies.getCookie("language");
    if (lang) {
      i18n.changeLanguage(lang);
    }
  }, []);

  useEffect(() => {
    if (user.me && user.me.isAgreedBehaviorStatistics) {
      setIsAgreedBehaviorStatistics(true);
      const analytics = getAnalytics();
      amplitude.getInstance().logEvent(window.location.pathname);
      logEvent(analytics, "select_content", {
        content_type: "page",
        content_id: "1",
        items: [{ name: "window.location.pathname" }],
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAgreedBehaviorStatistics) {
      const analytics = getAnalytics();
      logEvent(analytics, "select_content", {
        content_type: "page",
        content_id: "1",
        items: [{ name: window.location.pathname }],
      });
      amplitude.getInstance().logEvent(window.location.pathname);
    }
    window.scrollTo(0, 0);

    if (path.includes("admin/train/") || path.includes("admin/verifyproject/"))
      setIsProcessPage(true);
    else setIsProcessPage(false);
  }, [path]);

  useEffect(() => {
    if (user.me?.lang) {
      let lang = user.me.lang;
      i18n.changeLanguage(lang);
      Cookies.setCookie("language", lang, 90);
      dispatch(changeUserLanguageRequestAction(lang));
    }
  }, [user.me?.lang]);

  useEffect(() => {
    (async () => {
      if (!Cookies.getCookie("jwt")) {
        return;
      }
      await dispatch(getMainPageRequestAction());
      dispatch(getAsynctasksRequestAction());
      dispatch(getGroupsRequestAction());
    })();
  }, []);

  useEffect(() => {
    const isLogined =
      Cookies.getCookie("jwt") &&
      Cookies.getCookie("apptoken") &&
      Cookies.getCookie("jwt") !== "null" &&
      Cookies.getCookie("apptoken") !== "null";

    if (!isLogined) history.push("/signout");
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const resizeFunction = () => {
    if (window.innerWidth >= 960) {
      setMobileOpen(false);
    }
  };

  const onLogOut = () => {
    Cookies.deleteAllCookies();
    window.location.reload();
  };

  const onSetFirstTrialUsagePlan = () => {
    api
      .updateFirstPlanDone(true)
      .then(() => {
        setTimeout(async () => {
          await window.location.reload();
        }, 3000);
      })
      .catch((e) => {
        if (!process.env.REACT_APP_DEPLOY) console.log(e);
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "죄송합니다. 일시적인 오류가 발생하였습니다. 다시 시도해주세요."
              )
            )
          );
        }
      });
  };

  const onOpenChatbot = () => {
    dispatch(setPlanModalCloseRequestAction());
    openChat();
  };

  return (
    <div className={classes.wrapper}>
      {/* {!isLabelApp && (
        <Sidebar
          routes={routes}
          logo={logo}
          image={image}
          handleDrawerToggle={handleDrawerToggle}
          open={mobileOpen}
          color={color}
          {...rest}
        />
      )} */}
      <div
        className={classes.mainPanel}
        ref={mainPanel}
        style={isLabelApp ? { width: "100%" } : {}}
      >
        {!isLabelApp && (
          <Navbar
            logo={logo}
            routes={routes}
            handleDrawerToggle={handleDrawerToggle}
            headerHeight={headerHeight}
            containerWidth={containerWidth}
            {...rest}
          />
        )}
        <Container
          className={classes.content}
          maxWidth="false"
          sx={
            isLabelApp
              ? { padding: "0px" }
              : {
                  padding: `${headerHeight}px 0 80px 0`,
                  minHeight: `calc(100vh - ${footerHeight}px)`,
                  maxWidth: `${containerWidth}px`,
                }
          }
        >
          {switchRoutes}
        </Container>
        {!isLabelApp ? (
          <Footer footerHeight={footerHeight} containerWidth={containerWidth} />
        ) : null}
      </div>
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        key={messages.message}
        open={messages.isInformSnackbarOpen}
        onClose={() => {
          dispatch(closeInformSnackbarRequestAction());
        }}
      >
        <MySnackbar
          variant={messages.category}
          className={classes.margin}
          message={t(messages.message)}
        />
      </Snackbar>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={messages.isAskSnackbarOpen}
        onClose={() => {
          dispatch(closeAskSnackbarRequestAction());
        }}
        className={classes.modalContainer}
      >
        <MySnackbarAction
          classFrom="sample"
          variant={messages.category}
          className={classes.margin}
          message={t(messages.message)}
        />
      </Modal>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={messages.isPlanAlertOpen}
        onClose={() => {
          dispatch(setPlanModalCloseRequestAction());
        }}
        className={classes.modalContainer}
      >
        <div className={classes.planAlertModalContent}>
          <div style={{ padding: "26px 30px 12px 40px", width: "60%" }}>
            <img
              style={{ width: "124px" }}
              src={logoBlue}
              alt={"logo"}
              className={classes.logo}
            />
            <div style={{ padding: "50px 0" }}>
              <div className={classes.upgradePlanModalTitle}>
                <div style={{ marginBottom: "10px" }}>
                  {t("According to the way you prefer,")}
                </div>
                <div>{t("Develop artificial intelligence.")}</div>
              </div>
              <div className={classes.upgradePlanModalContent}>
                <div style={{ marginBottom: "-8px" }}>
                  {t(
                    "Multiple AI models focused on accuracy and training speed"
                  )}
                </div>
                <div>{t("You can develop using DS2.AI solution.")}</div>
              </div>
              <div className={classes.upgradePlanSubTitle}>
                {t("This option is only available on the Enterprise plan.")}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Button
                style={{ width: "220px", height: "36px" }}
                className={classes.defaultHighlightButton}
                onClick={onOpenChatbot}
              >
                {t("Enterprise plan inquiry")}
              </Button>
              <a
                href="https://clickai.ai/pricing.html"
                target="_blank"
                className={classes.planPolicyBtn}
              >
                {t("CLICK AI Pricing")}
              </a>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <CloseIcon
              className={classes.closeImg}
              id="planModalCloseBtn"
              style={{ margin: "8px" }}
              onClick={() => {
                dispatch(setPlanModalCloseRequestAction());
              }}
            />
            <img
              style={{ height: "400px" }}
              src={upgradePlanModels}
              alt={"logo"}
              className={classes.logo}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(Admin);
