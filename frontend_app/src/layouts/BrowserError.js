import React, { useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import currentTheme from "assets/jss/custom.js";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";
import Language from "components/Language/Language";
import Button from "components/CustomButtons/Button";
import Cookies from "helpers/Cookies";
import { ReactTitle } from "react-meta-tags";
import { currentThemeColor } from "assets/jss/custom";
import checkHttps from "components/Function/globalFunc.js";
import { fileurl } from "controller/api";
import Copyright from "components/Footer/Copyright";

const onLogOut = () => {
  Cookies.deleteAllCookies();
  window.location.href = "/signin";
};

export default function BrowserError() {
  const classes = currentTheme();
  const { t } = useTranslation();
  const logo = fileurl + "asset/front/img/logo_title.png";

  useEffect(() => {
    if (!process.env.REACT_APP_ENTERPRISE) {
      checkHttps();
    }
  }, []);

  const copyrightBox = () => {
    let lang = Cookies.getCookie("language");
    return (
      <Box mt={8}>
        <Copyright isKor={lang ? lang === "ko" : false} />
      </Box>
    );
  };

  return (
    <div className={classes.signInContainer} style={{ height: "100vh" }}>
      <ReactTitle title={"DS2.ai - " + t("Mobile")} />
      <Container component="main" maxWidth="xs" className="forgetPasswordContainer">
        <div className={classes.paper}>
          <div
            id="navbar"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <img src={logo} alt={"logo"} className={classes.logo} style={{ width: "160px" }} />
            <Language />
          </div>
          <div className={classes.description}>{t("CLICK AI 서비스는 PC 환경의 크롬(Chrome) 브라우저에서 이용할 수 있습니다.")}</div>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button style={{ color: currentThemeColor.primary1, fontSize: "10px" }} onClick={onLogOut}>
              {t("Login")}
            </Button>
          </div>
        </div>
        {copyrightBox()}
      </Container>
    </div>
  );
}
