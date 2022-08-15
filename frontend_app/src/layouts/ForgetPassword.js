import React, { useState, useEffect } from "react";
import { ReactTitle } from "react-meta-tags";
import { useTranslation } from "react-i18next";

import currentTheme, { currentThemeColor } from "assets/jss/custom";
import checkHttps from "components/Function/globalFunc.js";
import PasswordCard from "components/User/PasswordCard";

export default function ForgetPassword(props) {
  const classes = currentTheme();

  const [mobileOpen, setMobileOpen] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (process.env.REACT_APP_ENTERPRISE) {
      props.history.push("/signin");
    } else {
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
  }, []);

  return (
    <div className={classes.signInContainer} style={{ height: "100vh" }}>
      <ReactTitle title={"DS2.ai - " + t("Forgot password")} />
      <PasswordCard type="forget" props={props} />
    </div>
  );
}
