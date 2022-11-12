import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";

import * as api from "controller/api.js";
import { fileurl } from "controller/api";
import Cookies from "helpers/Cookies";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import Language from "components/Language/Language";
import checkHttps, {
  sendErrorMessage,
  toHome,
} from "components/Function/globalFunc.js";
import Copyright from "components/Footer/Copyright";
import Button from "components/CustomButtons/Button";

import {
  Box,
  Checkbox,
  CssBaseline,
  FormControlLabel,
  InputBase,
  Link,
  Snackbar,
} from "@material-ui/core";
import { CircularProgress, Grid } from "@mui/material";
import MySnackbar from "components/MySnackbar/MySnackbar.js";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

export default function SignIn() {
  const classes = currentTheme();
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const { user } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState({
    variant: "success",
    message: "",
  });
  const [isRememberChecked, setIsRememberChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const lang = i18n.language;
  const queryString = require("query-string");
  const parsed = queryString.parse(window.location.search);
  const koreanRegExp = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g;
  const logo = fileurl + "asset/front/img/logo_transparent.png";
  const mainImage = fileurl + "asset/front/img/img_mainCircle.png";

  useEffect(() => {
    if (Cookies.getCookie("jwt")) {
      toHome(history);
    } else {
      api.getUserCountInfo().then((res) => {
        if (!res.data) {
          history.push("/signup");
        }
      });
    }

    if (!process.env.REACT_APP_ENTERPRISE) {
      checkHttps();
    }
    checkUtm();
    checkUserBrowser();
    checkEmailVerify();
    checkPasswordChange();
  }, []);

  const checkUtm = () => {
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
  };

  const checkUserBrowser = () => {
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
      history.push("/error");
    }

    if (localStorage.userId) {
      setEmail(localStorage.userId);
      setIsRememberChecked(true);
    }
  };

  const checkEmailVerify = () => {
    if (parsed.email_confirm) {
      if (parsed.email_confirm.indexOf("true") > -1) {
        setSnackbarOption("success", t("Your e-mail has been verified."));
      } else {
        setSnackbarOption(
          "error",
          t("Error or expired email verification attempt.")
        );
      }
    }
  };

  const checkPasswordChange = () => {
    if (parsed.passwordChange) {
      if (parsed.passwordChange.indexOf("true") > -1) {
        setSnackbarOption(
          "success",
          t("Your password has been changed. Please log in again.")
        );
      }
    }
  };

  const tryLogin = async (user) => {
    setIsLoading(true);
    return api
      .Login(user)
      .then((res) => {
        Cookies.setCookie("jwt", res.data.jwt, 3);
        Cookies.setCookie("user", JSON.stringify(res.data.user), 3);
        Cookies.setCookie(
          "apptoken",
          JSON.stringify(res.data.user.appTokenCode),
          3
        );
        return res.data.user.isAgreedWithPolicy;
      })
      .then(() => {
        toHome(history);
      })
      .then(() => {
        if (isRememberChecked) {
          localStorage.setItem("userId", email);
        } else {
          localStorage.removeItem("userId");
        }
      })
      .catch((e) => {
        setIsLoading(false);
        if (e.response) {
          if (e.response.data.message) {
            if (e.response.data.message.indexOf("not confirmed") > -1) {
              setSnackbarOption("error", t("Please verify your e-mail."));
            } else {
              setSnackbarOption(
                "error",
                sendErrorMessage(
                  e.response.data.message,
                  e.response.data.message_en,
                  lang
                )
              );
              setPassword("");
            }
          } else {
            setSnackbarOption(
              "error",
              t("Failed to log in. Please try again.")
            );
          }
        } else {
          setSnackbarOption("error", t("Failed to log in. Please try again."));
        }
      });
  };

  const setSnackbarOption = async (_variant, _message) => {
    setSnackbarContent({
      variant: _variant,
      message: _message,
    });
    setIsSnackbarOpen(true);
  };

  const compLoading = () => (
    <div className={classes.loading}>
      <CircularProgress size={50} sx={{ mb: 2 }} />
      <p id="loadingText" className={classes.settingFontWhite87}>
        {t("Logging in. Please wait.")}
      </p>
    </div>
  );

  const formSignin = () => {
    const signInSubmit = async (e) => {
      e.preventDefault();
      if (email === "") {
        await setSnackbarOption("error", t("Please enter your email address."));
        return;
      } else if (password === "") {
        await setSnackbarOption("error", t("Please enter your password."));
        return;
      } else {
        let User = {
          id: email,
          password: password,
        };
        await tryLogin(User);
      }
    };

    const handleEmailValue = (e) => {
      if (koreanRegExp.test(e.target.value)) {
        setSnackbarOption(
          "error",
          t("Please enter a valid email. (Only English input is allowed)")
        );
        return;
      }
      setEmail(e.target.value);
    };

    const handlePasswordValue = (e) => {
      setPassword(e.target.value);
    };

    const changeRemember = () => {
      const tempRemember = isRememberChecked;
      setIsRememberChecked(!tempRemember);
    };

    const onClickForgotPassword = (e) => {
      if (process.env.REACT_APP_ENTERPRISE) {
        e.preventDefault();
        setSnackbarOption("error", t("Please contact the administrator."));
      }
    };

    return (
      <form
        onSubmit={signInSubmit}
        style={{ flexDirection: "column", padding: "0 32px" }}
        className={classes.form}
        noValidate
      >
        <div
          style={{
            borderBottom: "1px solid " + currentThemeColor.textWhite87,
            width: "100%",
            marginBottom: "24px",
            padding: "4px 8px",
          }}
        >
          <InputBase
            variant="outlined"
            required
            fullWidth
            id="email"
            placeholder={t("E-mail")}
            label={t("E-mail")}
            name="email"
            autoComplete="email"
            autoFocus
            onChange={handleEmailValue}
            value={email}
            style={{
              color: currentThemeColor.textWhite87,
              caretColor: currentThemeColor.textWhite87,
            }}
          />
        </div>
        <div
          style={{
            borderBottom: "1px solid " + currentThemeColor.textWhite87,
            width: "100%",
            marginBottom: "16px",
            padding: "4px 8px",
            display: "flex",
          }}
        >
          <InputBase
            variant="outlined"
            required
            fullWidth
            name="password"
            placeholder={t("Password")}
            label={t("Password")}
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            onChange={handlePasswordValue}
            value={password}
            style={{
              color: currentThemeColor.textWhite87,
              caretColor: currentThemeColor.textWhite87,
              width: "95%",
            }}
          />
          {password && (
            <div className={classes.visibilityIconHolder}>
              {showPassword ? (
                <VisibilityOffIcon
                  className={classes.visibilityIcon}
                  onClick={() => {
                    setShowPassword(false);
                  }}
                />
              ) : (
                <VisibilityIcon
                  className={classes.visibilityIcon}
                  onClick={() => {
                    setShowPassword(true);
                  }}
                />
              )}
            </div>
          )}
        </div>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 5 }}
        >
          <Grid item>
            <FormControlLabel
              style={{
                alignSelf: "start",
                marginLeft: 0,
                marginBottom: 0,
                color: currentThemeColor.textWhite87,
              }}
              control={
                <Checkbox
                  id="rememberEmailCheckBox"
                  value={isRememberChecked}
                  checked={isRememberChecked}
                  onChange={changeRemember}
                  color="primary"
                  size="small"
                  style={{ marginRight: "4px" }}
                />
              }
              label={<span style={{ fontSize: "14px" }}>{t("Save ID")}</span>}
            />
          </Grid>
          <Grid item>
            <Link
              href="../forgetpassword"
              variant="body2"
              id="findPasswordPage"
              style={{ color: "#F0F0F0" }}
              onClick={(e) => {
                onClickForgotPassword(e);
              }}
            >
              {t("Forgot password")}
            </Link>
          </Grid>
        </Grid>

        <Button
          id="signInBtn"
          type="submit"
          style={{
            width: "100%",
            marginBottom: "25px",
            padding: "12px",
            border: "1px solid var(--secondary1)",
            borderRadius: "50px",
            color: "var(--secondary1)",
            fontSize: "18px",
          }}
          onClick={signInSubmit}
        >
          <b>{t("Log in")}</b>
        </Button>

        <Grid container justifyContent="center">
          {process.env.REACT_APP_ENTERPRISE !== "true" && (
            <Grid item>
              <Link
                href="../signup"
                variant="body2"
                id="signupPage"
                style={{ color: "#F0F0F0" }}
              >
                {t("Signup")}
              </Link>
            </Grid>
          )}
        </Grid>
      </form>
    );
  };

  const headerSignin = () => (
    <Grid
      id="signInbar"
      container
      justifyContent="space-between"
      alignItems="center"
      sx={{ p: 4 }}
    >
      <img
        src={logo}
        alt={"logo"}
        className={classes.logo}
        style={{ width: "140px" }}
      />
      <Language />
    </Grid>
  );

  const footerSignin = () => {
    const snackbarClose = () => {
      setIsSnackbarOpen(false);
    };

    return (
      <>
        <Box mt={8}>
          <Copyright isKor={lang === "ko"} />
        </Box>
        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          key={snackbarContent.message}
          open={isSnackbarOpen}
          onClose={snackbarClose}
        >
          <MySnackbar
            variant={snackbarContent.variant}
            className={classes.margin}
            message={snackbarContent.message}
          />
        </Snackbar>
      </>
    );
  };

  const pageSigninMobile = () => (
    <div className={classes.mobileContainer}>
      <CssBaseline />
      {headerSignin()}
      <div
        className={classes.paper}
        style={{ width: "100%", padding: "0 30px" }}
      >
        {isLoading ? compLoading() : formSignin()}
      </div>
      {footerSignin()}
    </div>
  );

  const pageSignin = () => (
    <div className={classes.signInContainer}>
      <div className={classes.mainContentCard}>
        <Grid item xs={8} style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "36px",
              color: currentThemeColor.textWhite,
            }}
          >
            {t("All processes of building your customized AI")}
            <br />
          </div>
          <div
            style={{
              fontSize: "16px",
              color: currentThemeColor.textWhite,
              margin: "20px 0 50px",
            }}
          >
            {t(
              "DS2.ai is the MLOps platform that serves all processes of building your customized AI from automatic annotation to cloud deployment."
            )}
          </div>
          <div className={classes.settingFontWhite87}>
            <img
              src={mainImage}
              alt={"logo"}
              style={{ width: "80%", height: "50%" }}
            />
          </div>
        </Grid>
      </div>
      <div className={classes.signInMainCard}>
        <CssBaseline />
        {headerSignin()}
        <div className={classes.paper}>
          {isLoading ? compLoading() : formSignin()}
        </div>
        {footerSignin()}
      </div>
    </div>
  );

  return (
    <>
      <ReactTitle title={"DS2.ai - " + t("Log in")} />
      {mobileOpen ? pageSigninMobile() : pageSignin()}
    </>
  );
}
