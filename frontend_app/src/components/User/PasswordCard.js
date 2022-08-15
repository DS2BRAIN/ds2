import React, { useState, useEffect } from "react";
import { ReactTitle } from "react-meta-tags";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import * as api from "controller/api.js";
import { fileurl } from "controller/api";

import {
  Box,
  Container,
  InputBase,
  Link,
  Snackbar,
  Typography,
} from "@material-ui/core";
import { CircularProgress, Grid } from "@mui/material";

import currentTheme, { currentThemeColor } from "assets/jss/custom";
import MySnackbar from "components/MySnackbar/MySnackbar.js";
import Language from "components/Language/Language";
import { sendErrorMessage } from "components/Function/globalFunc.js";
import Copyright from "components/Footer/Copyright";
import Button from "components/CustomButtons/Button";

const PasswordCard = ({ type, props }) => {
  const classes = currentTheme();
  const { user } = useSelector((state) => ({ user: state.user }), []);
  const { t } = useTranslation();
  const logo = fileurl + "asset/front/img/logo_transparent.png";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordCheck, setPasswordCheck] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState({
    variant: "success",
    message: "",
  });

  useEffect(() => {
    if (!process.env.REACT_APP_ENTERPRISE) {
      window.ChannelIO(
        "updateUser",
        {
          language: user.language,
        },
        function onUpdateUser(error, user) {
          if (error) {
            if (!process.env.REACT_APP_DEPLOY) console.error(error);
          } else {
            if (!process.env.REACT_APP_DEPLOY)
              console.log("updateUser success", user);
          }
        }
      );
      window.ChannelIO("boot", {
        pluginKey: "0215031b-7a8b-4225-a5f0-f59a49968e66",
      });
    }
  }, [user.language]);

  const resetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (password === "") {
      setSnackbarOption("error", t("Please enter your password."));
    } else if (passwordCheck === "") {
      setSnackbarOption("error", t("Please re-enter your password."));
    } else if (password !== passwordCheck) {
      setSnackbarOption("error", t("Passwords do not match."));
    } else if (
      !/[A-Za-z0-9!@#$%^&+=]{8,}/.test(password) ||
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&+=]/.test(password)
    ) {
      setSnackbarOption(
        "error",
        t(
          "비밀번호는 영문, 숫자, 특수문자 3종류를 조합하여 최소 8자리 이상의 길이로 구성하여야합니다."
        )
      );
    } else {
      let code = "";
      let query = props.location.search;
      let parameters = query
        .slice(query.indexOf("?") + 1, query.length)
        .split("&");
      for (var i = 0; i < parameters.length; i++) {
        let parameter = parameters[i].split("=");
        let name = parameter[0];
        if (name === "code") {
          code = parameter[1];
          break;
        }
      }
      // let code = props.location.search.split();
      // code = code.split("=")[1];
      // code = code.substring(6, code.length);
      setIsLoading(true);
      api
        .resetPassword(code, password, passwordCheck)
        .then((res) => {
          setSnackbarOption(
            "success",
            user.language == "ko" ? res.data.message : res.data.message_en
          );
          props.history.push("/signout?passwordChange=true");
        })
        .catch((e) => {
          if (e.response && e.response.data.message) {
            setSnackbarOption(
              "error",
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            );
          } else {
            setSnackbarOption(
              "error",
              t(
                "죄송합니다, 일시적인 오류가 발생하였습니다. 다시 시도해주세요."
              )
            );
          }
          if (!process.env.REACT_APP_DEPLOY) console.log(e);
          setIsLoading(false);
        });
    }
  };

  const inputEmailValue = (e) => {
    e.preventDefault();
    setEmail(e.target.value);
  };
  const inputPasswordValue = (e) => {
    e.preventDefault();
    setPassword(e.target.value);
  };
  const inputPasswordCheckValue = (e) => {
    e.preventDefault();
    setPasswordCheck(e.target.value);
  };

  const setSnackbarOption = async (_variant, _message) => {
    setIsSnackbarOpen(false);
    setSnackbarContent({
      variant: _variant,
      message: _message,
    });
    setIsSnackbarOpen(true);
  };

  const signInSubmit = async (e) => {
    e.preventDefault();
    const emailRegExp = /[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z]*.[0-9a-zA-Z.]*)/gi;
    if (email === "") {
      onSetSnackbarOption("error", t("Please enter your e-mail address."));
    } else if (email.match(emailRegExp) === null) {
      onSetSnackbarOption("error", t("The e-mail address is not valid"));
    } else {
      setIsLoading(true);
      api
        .forgetPassword({ email, lang: user.language })
        .then((res) => {
          if (res.status === 200) {
            onSetSnackbarOption("success", t(res.data.message));
          } else {
            onSetSnackbarOption(
              "success",
              `${t(
                "유저 이메일 정보와 일치할 경우 비밀번호 찾기 링크가 발송됩니다."
              )} ${t("The e-mail may take up to 10 minutes to arrive in your inbox")}`
            );
          }
          setEmail("");
        })
        .then(() => {
          setIsLoading(false);
        })
        .catch((e) => {
          if (e.response && e.response.data.message) {
            onSetSnackbarOption(
              "error",
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            );
          } else {
            onSetSnackbarOption(
              "error",
              t(
                "죄송합니다, 일시적인 에러가 발생하여 메일전송에 실패하였습니다."
              )
            );
          }
          setIsLoading(false);
          if (!process.env.REACT_APP_DEPLOY) console.log(e);
        });
    }
  };

  const onSetSnackbarOption = async (_variant, _message) => {
    setIsSnackbarOpen(false);
    setSnackbarContent({
      variant: _variant,
      message: _message,
    });
    setIsSnackbarOpen(true);
  };

  const toLoginPage = (
    <Grid style={{ textAlign: "center" }}>
      <Link
        id="goToSignIn"
        href="../signin"
        variant="body2"
        style={{ color: "#F0F0F0", fontSize: "14px" }}
      >
        {t("Login")}
      </Link>
    </Grid>
  );

  const secFormCard = () => {
    const commonInput = (id) => {
      const comps = {
        email: {
          label: "이메일",
          type: "text",
          focus: true,
          value: email,
          func: inputEmailValue,
        },
        password: {
          label: "비밀번호",
          type: "password",
          focus: true,
          value: password,
          func: inputPasswordValue,
        },
        passwordCheck: {
          label: "비밀번호 확인",
          type: "password",
          focus: false,
          value: passwordCheck,
          func: inputPasswordCheckValue,
        },
      };
      let selec = comps[id];

      return (
        <div
          style={{
            borderBottom: "1px solid " + currentThemeColor.textWhite87,
            width: "100%",
            margin: id === "passwordCheck" ? "0 0 36px 0" : "36px 0",
          }}
        >
          {id === "email" && (
            <span style={{ fontSize: "12px" }}>
              {t("Please check your mailbox after entering your email.")}
            </span>
          )}
          <InputBase
            required
            fullWidth
            id={id}
            name={id}
            autoComplete={id}
            label={t(selec.label)}
            placeholder={t(selec.label)}
            type={selec.type}
            autoFocus={selec.focus}
            value={selec.value}
            onChange={selec.func}
            style={{ color: currentThemeColor.textWhite87 }}
          />
        </div>
      );
    };

    return (
      <form
        onSubmit={type === "reset" ? resetPasswordSubmit : signInSubmit}
        style={{ flexDirection: "column" }}
        className={classes.form}
        noValidate
      >
        {type === "reset" ? (
          <>
            {commonInput("password")}
            {commonInput("passwordCheck")}
          </>
        ) : (
          commonInput("email")
        )}
        <Button
          id="signInBtn"
          type="submit"
          fullWidth
          shape="greenOutlined"
          size="lg"
          sx={{ mb: 2 }}
          onClick={type === "reset" ? resetPasswordSubmit : signInSubmit}
        >
          {t(type === "reset" ? "비밀번호 재설정" : "비밀번호 찾기")}
        </Button>
        {toLoginPage}
      </form>
    );
  };

  const snackbarClose = () => {
    setIsSnackbarOpen(false);
  };

  return (
    <>
      <Container component="main" maxWidth="xs">
        <Grid className="forgetPasswordContainer">
          <div className={classes.paper}>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <img
                src={logo}
                alt={"logo"}
                className={classes.logo}
                style={{ width: "120px" }}
              />
              <Language />
            </div>
            {isLoading ? (
              <div className={classes.loading}>
                <CircularProgress sx={{ mb: 2 }} />
                {t("Sending e-mail. Please wait.")}
              </div>
            ) : (
              secFormCard()
            )}
            <Box mt={8}>
              <Copyright isKor={user.language === "ko"} />
            </Box>
          </div>
        </Grid>
      </Container>
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

export default PasswordCard;
