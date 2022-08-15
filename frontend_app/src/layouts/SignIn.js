import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";

import * as api from "controller/api.js";
import { fileurl } from "controller/api";
import Cookies from "helpers/Cookies";

import {
  Box,
  Checkbox,
  CssBaseline,
  FormControlLabel,
  InputBase,
  Link,
  Modal,
  Snackbar,
} from "@material-ui/core";
import { CircularProgress, Grid } from "@mui/material";
import MySnackbar from "components/MySnackbar/MySnackbar.js";
import CachedIcon from "@material-ui/icons/Cached";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import Language from "components/Language/Language";
import checkHttps, {
  sendErrorMessage,
} from "components/Function/globalFunc.js";
import Copyright from "components/Footer/Copyright";
import Button from "components/CustomButtons/Button";

const cliedId =
  "1033414311470-pjcodotllde5c91klbml7ecjs32kk3rl.apps.googleusercontent.com";

export default function SignIn(props) {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState({
    variant: "success",
    message: "",
  });
  const [userId, setUserId] = useState(null);
  const [isRememberChecked, setIsRememberChecked] = useState(false);
  const [isMainForTrial, setIsMainForTrial] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryString = require("query-string");
  const parsed = queryString.parse(props.location.search);
  const koreanRegExp = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g;
  const [lang, setLang] = useState("");
  // const [endDate, setEndDate] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { t, i18n } = useTranslation();
  const logo = fileurl + "asset/front/img/logo_transparent.png";
  const visualization = fileurl + "asset/front/img/visualization.gif";
  const google = fileurl + "asset/front/img/google.png";
  const mainImage = fileurl + "asset/front/img/img_mainCircle.png";
  const date = new Date();

  let year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  let dateString = `${year}-${parseInt(month) < 10 ? "0" + month : month}-${
    parseInt(day) < 10 ? "0" + day : day
  }`;
  const currentDate = dateString;

  //키값 인증 스낵바 알림
  // useEffect(() => {
  //   if (process.env.REACT_APP_ENTERPRISE) {
  //     let query = window.location.search.substr(1).split("=");
  //     if (query[0] == "key") {
  //       switch (query[1]){
  //         case "expired":
  //           setSnackbarOption(
  //             "error",
  //             t(
  //               "기존 Key값 인증이 만료되었습니다. 새로운 키값의 인증이 필요합니다."
  //             )
  //           );
  //           break;
  //         case "null":
  //           break;
  //         case "error":
  //           break;
  //       }
  //       if (query[1] == "expired") {

  //       } else if (query[1] == "fail") {
  //         setSnackbarOption(
  //           "error",
  //           t("Key value authentication failed. Please try license authentication again.")
  //         );
  //       }
  //     }
  //   }
  // }, []);

  useEffect(() => {
    if (Cookies.getCookie("jwt")) {
      props.history.push("/admin");
    } else {
      api.getUserCountInfo().then((res) => {
        if (!res.data) {
          props.history.push("/signup");
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

  useEffect(() => {
    setLang(user.language);
  }, [user.language]);

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
      window.location.href = "/error";
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

  const onFailure = (error) => {
    if (!process.env.REACT_APP_DEPLOY) console.log(error);
  };

  const tryLogin = async (user) => {
    await setIsLoading(true);
    return api
      .Login(user)
      .then((res) => {
        setUserId(res.data.user.id);
        Cookies.setCookie("jwt", res.data.jwt, 90);
        Cookies.setCookie("user", JSON.stringify(res.data.user), 90);
        Cookies.setCookie(
          "apptoken",
          JSON.stringify(res.data.user.appTokenCode),
          90
        );
        return res.data.user.isAgreedWithPolicy;
      })
      .then((isAgreed) => {
        window.location.href = "/admin";
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
            }
          } else {
            setSnackbarOption(
              "error",
              t("Failed to log in. Please try again.")
            );
          }
        } else {
          setSnackbarOption(
            "error",
            t("Failed to log in. Please try again.")
          );
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

  const onChangeMainContent = () => {
    setIsMainForTrial(!isMainForTrial);
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
      // 로그인시 입력값 확인까지 진행
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

    const onSuccessGoogle = async (response) => {
      const {
        googleId,
        tokenId,
        profileObj: { email, name },
      } = response;
      let User = {
        id: email,
        password: googleId + "!",
        socialType: "google",
      };
      await tryLogin(User);
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
              label={
                <span style={{ fontSize: "14px" }}>{t("Save ID")}</span>
              }
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
        {/* <div className={classes.socialLogin}>
          <GoogleLogin
            clientId={cliedId}
            render={(renderProps) => (
              <div
                onClick={renderProps.onClick}
                className={classes.googleLogin}
              >
                <img
                  className={classes.googleImgColor}
                  src={google}
                  alt={"google"}
                />
                <span>{t("Sign in with Google")}</span>
              </div>
            )}
            buttonText={t("Sign in with Google")}
            responseType={"id_token"}
            onSuccess={onSuccessGoogle}
            onFailure={onFailure}
          />
        </div> */}

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
            {t("")},<br />
          </div>
          <div
            style={{
              fontSize: "16px",
              color: currentThemeColor.textWhite,
              margin: "20px 0 50px",
            }}
          >
            {t(
              "DS2.ai는 Auto-Labeling부터 클라우드 배포에 이르기까지 맞춤형 AI를 구축하기 위한 모든 프로세스를 제공하는 인공지능 자동개발 플랫폼입니다."
            )}
          </div>
          <div className={classes.settingFontWhite87}>
            {/* <video
              style={{ width: "100%", borderRadius: "10px", marginTop: "20px" }}
              autoPlay
              loop
            >
              <source
                src=fileurl+"asset/ecosystem/etc.mov"
                type="video/mp4"
              />
            </video> */}
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
