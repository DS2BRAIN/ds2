import React, { useState, useEffect } from "react";
import { ReactTitle } from "react-meta-tags";
import { useTranslation } from "react-i18next";

import currentTheme, { currentThemeColor } from "assets/jss/custom";
import checkHttps from "components/Function/globalFunc.js";
import PasswordCard from "components/User/PasswordCard";

export default function ResetPassword(props) {
  const classes = currentTheme();

  const [mobileOpen, setMobileOpen] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (!process.env.REACT_APP_ENTERPRISE) {
      checkHttps();
    }
    // const url = window.location.href;
    // const navigatorLanguage = (
    //   window.navigator.userLanguage || window.navigator.language
    // ).toLowerCase();
    const userBrowser = navigator.userAgent.toLowerCase();
    var isChrome =
      /chrome/.test(userBrowser) &&
      userBrowser.indexOf("whale") === -1 &&
      userBrowser.indexOf("edg") === -1;
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent.toLowerCase()
    );
    if (isMobile) {
      setMobileOpen(true);
    } else if (!isChrome) {
      window.location.href = "/error";
    }

    // if (
    //   url.indexOf("?lang=en") !== -1 ||
    //   (navigatorLanguage.indexOf("ko") === -1 &&
    //     navigatorLanguage.indexOf("kr") === -1)
    // ) {
    //   i18n.changeLanguage("en");
    //   dispatch(changeUserLanguageRequestAction("en"));
    //   Cookies.setCookie("language", "en", 90);
    // } else if (url.indexOf("?lang=ko") !== -1) {
    //   i18n.changeLanguage("ko");
    //   dispatch(changeUserLanguageRequestAction("ko"));
    //   Cookies.setCookie("language", "ko", 90);
    // } else if (Cookies.getCookie("language")) {
    //   i18n.changeLanguage(Cookies.getCookie("language"));
    //   dispatch(changeUserLanguageRequestAction(Cookies.getCookie("language")));
    // }
  }, []);

  return (
    <div className={classes.signInContainer} style={{ height: "100vh" }}>
      <ReactTitle title={"DS2.ai - " + t("Reset Password")} />
      <PasswordCard type="reset" props={props} />
    </div>
  );
}
