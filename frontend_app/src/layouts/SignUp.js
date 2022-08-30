import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";
import GoogleLogin from "react-google-login";
import amplitude from "amplitude-js";

import * as api from "controller/api.js";
import { fileurl } from "controller/api";
import Cookies from "helpers/Cookies";
import { changeUserLanguageRequestAction } from "redux/reducers/user.js";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";

import {
  Box,
  Checkbox,
  Container,
  CssBaseline,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputBase,
  Link,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { CircularProgress } from "@mui/material";

import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import checkHttps, {
  sendErrorMessage,
} from "components/Function/globalFunc.js";
import MySnackbar from "components/MySnackbar/MySnackbar.js";
import GridItem from "components/Grid/GridItem.js";
import Language from "components/Language/Language";
import ParTermsOfService from "components/User/ParTermsOfService";
import ParPrivacyPolicy from "components/User/ParPrivacyPolicy";
import Copyright from "components/Footer/Copyright";
import Button from "components/CustomButtons/Button";
import { openChat } from "components/Function/globalFunc";
import { toHome } from "components/Function/globalFunc";

// const emailRegExp = /^[0-9a-z]([-_\.]?[0-9a-z])*@[0-9a-z]([-_\.]?[0-9a-z])*\.[a-z]/;
//const emailRegExp = /[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]$/i;
// const emailRegExp = /^[a-zA-Z0-9][a-zA-Z0-9\w\.\_\-]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]{2,8}$/i;
// const emailRegExp= /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3$/i;
const emailRegExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
// const emailRegExp = /^([\w\.\_\-])*[a-zA-Z0-9]+([\w\.\_\-])*([a-zA-Z0-9])+([\w\.\_\-])+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,8}$/;
const koreanRegExp = /[가-힣]/g;

const emailCheck = (email) => {
  return emailRegExp.test(email);
};

const cliedId =
  "1033414311470-pjcodotllde5c91klbml7ecjs32kk3rl.apps.googleusercontent.com";

export default function SignUp() {
  const classes = currentTheme();
  const history = useHistory();
  const dispatch = useDispatch();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [isAbleEmail, setIsAbleEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [company, setCompany] = useState("");
  const [promotionCode, setPromotionCode] = useState("");
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [adultPolicy, setAdultPolicy] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState({
    variant: "success",
    message: "",
  });
  const [canSeeLoginForm, setCanSeeLoginForm] = useState(true);
  const [isAgreetoMarketing, setIsAgreetoMarketing] = useState(false);
  const [isAgreedBehaviorStatistics, setIsAgreedBehaviorStatistics] = useState(
    false
  );
  const [isAgreeAll, setIsAgreeAll] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [joiningPurpose, setJoiningPurpose] = useState("general");
  const { t, i18n } = useTranslation();

  const [isRememberChecked, setIsRememberChecked] = useState(false);
  const [signUpWithEmail, setSignUpWithEmail] = useState(true);
  const [agreePolicy, setAgreePolicy] = useState(false);
  let lang = user.language ? user.language : Cookies.getCookie("language");
  const logo = fileurl + "asset/front/img/logo_transparent.png";
  const google = fileurl + "asset/front/img/google.png";

  useEffect(() => {
    if (user.me) {
      lang = user.language;
    }
  }, [user]);

  useEffect(() => {
    if (Cookies.getCookie("jwt")) {
      toHome(history);
    }

    if (!process.env.REACT_APP_ENTERPRISE) {
      checkHttps();
    }
    // const url = window.location.href;
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

  const signUpSubmit = (e) => {
    // skyhub admin 로그인 로직 이용할 예정  // 회원가입시 입력값 확인까지 진행
    e.preventDefault();
    if (email === "") {
      // 예외 체크
      setSnackbarOption("error", t("Please enter your e-mail address."));
    } else if (emailCheck(email) == false) {
      setSnackbarOption("error", t("The e-mail address is not valid"));
    }
    // else if (email.match(emailRegExp) === null) {
    //   setSnackbarOption(
    //     "error",
    //     t("The e-mail address is not valid")
    //   );
    // }
    else if (!isAbleEmail) {
      setSnackbarOption(
        "error",
        t("Please check the duplicate email before proceeding.")
      );
    } else if (password === "") {
      setSnackbarOption("error", t("Please enter your password."));
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
    } else if (passwordCheck === "") {
      setSnackbarOption("error", t("Please re-enter your password."));
    } else if (password !== passwordCheck) {
      setSnackbarOption(
        "error",
        t(
          "The password you entered is incorrect. Please re-enter your password."
        )
      );
    } else if (!acceptPolicy) {
      setSnackbarOption(
        "error",
        t("Please accept the Terms and Conditions if you want to proceed.")
      );
    } else if (!adultPolicy) {
      openChat();
      setSnackbarOption(
        "error",
        t(
          "만 19세 미만의 경우 법정대리인의 동의가 필요합니다. 영업팀에 문의해주세요."
        )
      );
    } else {
      const isAiTrainer = joiningPurpose === "aitrainer" ? true : false;

      if (isAgreetoMarketing) {
        amplitude.getInstance().init("446d673fc8928366cc815f058ba93381");
        amplitude.getInstance().logEvent("Agreed to Marketing : " + email);
      }

      const userInfo = {
        email: email,
        password: password,
        promotionCode: promotionCode,
        company: company,
        isAiTrainer: isAiTrainer,
        utmSource: Cookies.getCookie("utm_source"),
        utmMedium: Cookies.getCookie("utm_medium"),
        utmCampaign: Cookies.getCookie("utm_campaign"),
        utmTerm: Cookies.getCookie("utm_term"),
        utmContent: Cookies.getCookie("utm_content"),
        languageCode: user.language ? user.language : "ko",
        isAgreedMarketing: isAgreetoMarketing,
        isAgreedBehaviorStatistics: isAgreedBehaviorStatistics,
        provider: "DS2.ai",
      };

      // if (process.env.REACT_APP_ENTERPRISE) {
      //   setIsLoading(true);
      //   api
      //     .postSignUp(userInfo)
      //     .then(() => {
      //       setSnackbarOption("success", t("Thank you for creating an account"));
      //       setTimeout(() => {
      //         history.push("/signin/");
      //       }, 5000);
      //     })
      //     .catch((e) => {
      //       if (!process.env.REACT_APP_DEPLOY) console.log(e);
      //       if (e.response && e.response.data.message) {
      //         setSnackbarOption(
      //           "error",
      //           sendErrorMessage(
      //             e.response.data.message,
      //             e.response.data.message_en,
      //             user.language
      //           )
      //         );
      //       } else {
      //         setSnackbarOption(
      //           "error",
      //           t("Please sign up again.")
      //         );
      //       }
      //       setIsLoading(false);
      //     });
      // } else {
      setIsLoading(true);
      api
        .postSignUp(userInfo)
        .then(() => {
          if (process.env.REACT_APP_ENTERPRISE !== "true") {
            setSnackbarOption(
              "success",
              `${t("Thank you for creating an account")} ${t(
                "이메일 인증 후 이용이 가능합니다."
              )} ${t(
                "The e-mail may take up to 10 minutes to arrive in your inbox"
              )}`
            );
            setTimeout(() => {
              history.push("/signin/");
            }, 5000);
          } else {
            setSnackbarOption(
              "success",
              t("Thank you for creating an account")
            );
            setTimeout(() => {
              history.push("/signin/");
            }, 5000);
          }
        })
        .catch((e) => {
          if (!process.env.REACT_APP_DEPLOY) console.log(e);
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
            setSnackbarOption("error", t("Please sign up again."));
          }
          setIsLoading(false);
        });
      // const IMP = window.IMP; // 생략해도 괜찮습니다.
      // IMP.init("imp06953793"); // "imp00000000" 대신 발급받은 "가맹점 식별코드"를 사용합니다.
      //   // IMP.certification(param, callback) 호출
      // IMP.certification({ // param
      //     merchant_uid: "ORD20180131-0000011"
      //   }, function (rsp) { // callback
      //     if (rsp.success) {
      //         setIsLoading(true);
      //         api.verifyPhone(rsp.imp_uid)
      //         .then((response)=>{
      //           const userInfo = {
      //             email : email,
      //             password : password,
      //             promotionCode: promotionCode,
      //             company : company,
      //             utmSource : Cookies.getCookie('utm_source'),
      //             utmMedium : Cookies.getCookie('utm_medium'),
      //             utmCampaign : Cookies.getCookie('utm_campaign'),
      //             utmTerm : Cookies.getCookie('utm_term'),
      //             utmContent : Cookies.getCookie('utm_content'),
      //             name : response.data.name,
      //             birth : response.data.birth,
      //             gender : response.data.gender,
      //           }
      //           api.postSignUp(userInfo)
      //           .then(()=>{
      //             setSnackbarOption('success', `${t('Thank you for creating an account')} ${t('이메일 인증 후 이용이 가능합니다.')} ${t('메일발송까지 5-10분 정도 소요될 수 있습니다.')}`);
      //             setTimeout(()=>{
      //               history.push('/signin/');
      //             }, 5000);
      //           })
      //           .catch((e)=>{
      //             if(!process.env.REACT_APP_DEPLOY) console.log(e);
      //             if(e.response && e.response.data.message){
      //               setSnackbarOption('error', e.response.data.message);
      //             }else{
      //               setSnackbarOption('error', t('Please sign up again.'));
      //             }
      //             setIsLoading(false);
      //           })
      //         })
      //         .catch(e=>{
      //             setSnackbarOption('error', t('User ID already exists'));
      //             setIsLoading(false);
      //         })
      //     } else {
      //       setSnackbarOption('error', t('Verification failed'));
      //     }
      //   });
      // }
    }
  };

  const checkIsCompanyEmail = () => {
    const emailList = [
      // "@outlook.com",
      // "@gmail.com",
      // "@yahoo.com",
      // "@hotmail.com",
      // "@aol.com",
      // "@hotmail.co.uk",
      // "@hotmail.fr",
      // "@msn.com",
      // "@yahoo.fr",
      // "@naver.com",
      // "@hanmail.net",
    ];
    let isAbleEmail = true;
    // emailList.forEach((each) => {
    //   if (email.includes(each)) {
    //     setSnackbarOption("error", t("Please enter your school or company e-mail."));
    //     isAbleEmail = false;
    //   }
    // });
    return isAbleEmail;
  };

  const checkValidEmail = async (e) => {
    // 중복 확인 했을때 사용가능한 아이디인지 검사
    e.preventDefault();
    if (email === "") {
      setSnackbarOption("error", t("Please enter your e-mail address."));
      return;
    }
    if (emailCheck(email) === false) {
      setSnackbarOption("error", t("The e-mail address is not valid"));
      return;
    }
    // if (email.match(emailRegExp) === null) {
    //   setSnackbarOption(
    //     "error",
    //     t("The e-mail address is not valid")
    //   );
    //   return;
    // }
    const checkEmailResut = await checkIsCompanyEmail();
    if (checkEmailResut) {
      api
        .checkValidEmail(email)
        .then((res) => {
          setSnackbarOption(
            "success",
            user.language == "ko" ? res.data.message : res.data.message_en
          );
          setIsAbleEmail(true);
        })
        .catch((err) => {
          if (err?.response == undefined || err?.response.status == 500) {
            setSnackbarOption(
              "error",
              user.language == "ko"
                ? "이미 가입된 이메일입니다."
                : "This email is already in use."
            );
          } else {
            setSnackbarOption(
              "error",
              user.language == "ko"
                ? err?.response?.data.message
                : err?.response?.data.message_en
            );
          }
        });
    }
  };

  const onSetNextStep = () => {
    if (!acceptPolicy) {
      setSnackbarOption(
        "error",
        t("Please accept the Terms and Conditions if you want to proceed.")
      );
      return;
    }
    setCanSeeLoginForm(true);
  };

  const changeAcceptPolicy = (e) => {
    e.preventDefault();
    setAcceptPolicy((prevAcceptPolicy) => !prevAcceptPolicy);
    setIsAgreeAll(false);
  };

  const snackbarClose = () => {
    setIsSnackbarOpen(false);
  };

  const setSnackbarOption = async (_variant, _message) => {
    await setSnackbarContent({
      variant: _variant,
      message: _message,
    });
    await setIsSnackbarOpen(true);
  };

  const onSuccessGoogle = async (response) => {
    const {
      googleId,
      tokenId,
      profileObj: { email, name },
    } = response;
    const RegisterInfo = {
      email: email,
      password: tokenId,
      socialID: googleId,
      socialType: "google",
      isAgreedMarketing: true,
      birth: "2001-01-01T01:01:01",
    };
    await tryRegister(RegisterInfo);
  };

  const onFailure = (error) => {
    if (!process.env.REACT_APP_DEPLOY) console.log(error);
  };

  const tryRegister = async (RegisterInfo) => {
    await setIsLoading(true);
    return api
      .postSignUp(RegisterInfo)
      .then(() => {
        const User = {
          id: RegisterInfo.email,
          password: RegisterInfo.socialID + "!",
          socialType: "google",
        };
        tryLogin(User);
      })
      .catch((e) => {
        setIsLoading(false);
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
        }
      });
  };

  const tryLogin = async (user) => {
    await setIsLoading(true);
    return api
      .Login(user)
      .then((res) => {
        Cookies.setCookie("user", JSON.stringify(res.data.user), 90);
        Cookies.setCookie(
          "apptoken",
          JSON.stringify(res.data.user.appTokenCode),
          90
        );
        Cookies.setCookie("jwt", res.data.jwt, 90);
        return res.data.user.isAgreedWithPolicy;
      })
      .then((isAgreed) => {
        history.push("");
      })
      .then(() => {
        localStorage.setItem("userId", email);
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
                  user.language
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
          setSnackbarOption("error", t("Failed to log in. Please try again."));
        }
      });
  };

  const signUpWithEmailTrue = () => {
    setSignUpWithEmail(true);
  };

  const setAgreePolicyTrue = () => {
    setAgreePolicy(true);
  };

  const formEmailSignup = () => {
    const signInPurpose = () => {
      const onChangeJoiningPurpose = (e) => {
        e.preventDefault();
        setJoiningPurpose(e.target.value);
      };

      return (
        <Grid item xs={12}>
          <FormControl
            component="fieldset"
            style={{ margin: "0px !important" }}
          >
            <FormLabel
              component="legend"
              id="signUpLegend"
              style={{
                paddingTop: "20px",
                color: currentTheme.textWhite87,
              }}
            >
              {t("Please select signup purpose")}
            </FormLabel>
            <RadioGroup
              row
              aria-label="position"
              name="position"
              defaultValue="normal"
              onChange={onChangeJoiningPurpose}
              value={joiningPurpose}
            >
              <FormControlLabel
                value="general"
                control={<Radio color="primary" />}
                label={t("General user")}
              />
              <FormControlLabel
                value="aitrainer"
                control={<Radio color="primary" />}
                label={t("Labeling AI Trainer")}
              />
            </RadioGroup>
          </FormControl>
        </Grid>
      );
    };

    const commonInput = (typeKey) => {
      const inputUserName = (e) => {
        e.preventDefault();
        setUserName(e.target.value);
      };

      const inputEmailValue = (e) => {
        e.preventDefault();
        setEmail(e.target.value);
        setIsAbleEmail(false); // 중복 확인한 후에 아이디 값 바꾸면 다시 IsAbleEmail False로 바꾸기
      };

      const inputPasswordValue = (e) => {
        e.preventDefault();
        setPassword(e.target.value);
      };

      const inputPasswordCheckValue = (e) => {
        e.preventDefault();
        setPasswordCheck(e.target.value);
      };

      const inputCompanyValue = (e) => {
        e.preventDefault();
        setCompany(e.target.value);
      };

      const inputPromotionCodeValue = (e) => {
        e.preventDefault();
        setPromotionCode(e.target.value);
      };

      const comps = {
        userName: {
          label: "사용자 이름을 입력해주세요.",
          type: "text",
          value: userName,
          func: inputUserName,
          tip: false,
        },
        email: {
          label: "이메일을 입력해주세요.",
          type: "text",
          value: email,
          func: inputEmailValue,
          tip: false,
        },
        password: {
          label: "비밀번호를 입력해주세요.",
          type: "password",
          value: password,
          func: inputPasswordValue,
          tip: true,
          tipTitle:
            "비밀번호는 영문, 숫자, 특수문자 3종류를 조합하여 최소 8자리 이상의 길이로 구성하여야합니다.",
        },
        passwordCheck: {
          label: "비밀번호 확인",
          type: "password",
          value: passwordCheck,
          func: inputPasswordCheckValue,
          tip: false,
        },
        company: {
          label: "재직중인 회사를 입력해주세요. (선택사항)",
          type: "text",
          value: company,
          func: inputCompanyValue,
          tip: false,
        },
        promotionCode: {
          label: "프로모션 코드가 있을 시에 입력해주세요. (선택사항)",
          type: "text",
          value: promotionCode,
          func: inputPromotionCodeValue,
          tip: false,
        },
      };
      let selected = comps[typeKey];

      const innerInput = (id, selec) => (
        <InputBase
          required
          fullWidth
          id={id}
          name={id}
          autoComplete={id}
          label={t(selec.label)}
          placeholder={t(selec.label)}
          type={selec.type}
          autoFocus={id === "email"}
          value={selec.value}
          onChange={selec.func}
          style={{ color: currentThemeColor.textWhite87 }}
        />
      );

      return (
        <div
          style={{
            borderBottom: "1px solid " + currentThemeColor.textWhite87,
            width: "100%",
            marginBottom: "16px",
            padding: "4px 8px",
          }}
        >
          {selected.tip ? (
            <Tooltip
              title={
                <span style={{ fontSize: "12px" }}>{t(selected.tipTitle)}</span>
              }
              placement="bottom"
            >
              {innerInput(typeKey, selected)}
            </Tooltip>
          ) : (
            innerInput(typeKey, selected)
          )}
        </div>
      );
    };

    const checkTermsConditions = () => {
      const changeIsAgreeAll = (e) => {
        setIsAgreeAll(e.target.checked);
        setAcceptPolicy(e.target.checked);
        setAdultPolicy(e.target.checked);
        setIsAgreetoMarketing(e.target.checked);
        setIsAgreedBehaviorStatistics(e.target.checked);
      };

      const changeAdultPolicy = (e) => {
        e.preventDefault();
        setAdultPolicy((prevAdultPolicy) => !prevAdultPolicy);
        setIsAgreeAll(false);
      };

      const changeIsAgreetoMarketing = (e) => {
        setIsAgreetoMarketing(e.target.checked);
        setIsAgreeAll(false);
      };

      const changeIsAgreedBehaviorStatistics = (e) => {
        setIsAgreedBehaviorStatistics(e.target.checked);
        setIsAgreeAll(false);
      };

      return (
        <>
          <Grid
            container
            style={{
              marginBottom: "15px",
              paddingLeft: "20px",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  id="agreeBtn3"
                  value="isAgreetoMarketing"
                  color="primary"
                  size="small"
                  checked={isAgreeAll}
                  style={{ marginBottom: "-5px" }}
                  onChange={changeIsAgreeAll}
                />
              }
              style={{ marginRight: "8px" }}
              label={""}
            />
            <span>{t("All agree")}</span>
          </Grid>
          <Grid
            container
            style={{
              marginBottom: "10px",
              paddingLeft: "20px",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  id="agreeBtn1"
                  value="acceptPolicy"
                  color="primary"
                  size="small"
                  checked={acceptPolicy}
                  style={{ marginBottom: "-5px" }}
                  onChange={changeAcceptPolicy}
                />
              }
              style={{ marginRight: "8px" }}
              label={""}
            />
            <span
              style={{
                cursor: "pointer",
                textUnderlinePosition: "under",
                textDecoration: "underline",
              }}
              onClick={() => {
                window.open(
                  lang === "en"
                    ? "https://ds2.ai/terms_of_services.html"
                    : "https://ko.ds2.ai//terms_of_services.html",
                  "_blank"
                );
              }}
            >
              {t("Terms of Service")}
            </span>
            <span>{" / "}</span>
            <span
              style={{
                cursor: "pointer",
                textUnderlinePosition: "under",
                textDecoration: "underline",
              }}
              onClick={() => {
                window.open(
                  lang === "en"
                    ? "https://ds2.ai/privacy.html"
                    : "https://ko.ds2.ai//privacy.html",
                  "_blank"
                );
              }}
            >
              {t("Privacy Policy")}{" "}
            </span>
            <span
              style={{
                cursor: "default",
              }}
            >
              {t("I agree to the terms.")}
            </span>
          </Grid>
          <Grid
            container
            style={{
              marginBottom: "10px",
              paddingLeft: "20px",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  id="agreeBtn2"
                  value="adultPolicy"
                  color="primary"
                  size="small"
                  checked={adultPolicy}
                  style={{ marginBottom: "-5px" }}
                  onChange={changeAdultPolicy}
                />
              }
              style={{ marginRight: "8px" }}
              label={""}
            />
            <span>{t("I am over the age of 18.")}</span>
          </Grid>
          <Grid
            container
            style={{
              marginBottom: "10px",
              paddingLeft: "20px",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  id="agreeBtn3"
                  value="isAgreetoMarketing"
                  color="primary"
                  size="small"
                  checked={isAgreetoMarketing}
                  style={{ marginBottom: "-5px" }}
                  onChange={changeIsAgreetoMarketing}
                />
              }
              style={{ marginRight: "8px" }}
              label={""}
            />
            <span>
              {t("Agree to receive and use marketing information (optional)")}
            </span>
          </Grid>
          <Grid
            style={{
              marginBottom: "10px",
              paddingLeft: "20px",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  id="agreeBtn3"
                  value="isAgreetoMarketing"
                  color="primary"
                  size="small"
                  checked={isAgreedBehaviorStatistics}
                  style={{ marginBottom: "-5px" }}
                  onChange={changeIsAgreedBehaviorStatistics}
                />
              }
              style={{ marginRight: "8px" }}
              label={""}
            />
            <span>{t("Agree to collection of activity data")}</span>
          </Grid>
        </>
      );
    };

    return (
      <form onSubmit={signUpSubmit} className={classes.form} noValidate>
        <Grid container spacing={2}>
          {/* {signInPurpose()} */}
          {/* <Grid item xs={12}>
            {commonInput("userName")}
          </Grid> */}
          <Grid item xs={user.language === "ko" ? 9 : 7}>
            {commonInput("email")}
          </Grid>
          <Grid
            item
            xs={user.language === "ko" ? 3 : 5}
            style={{ display: "flex", alignItems: "center" }}
          >
            <Button
              fullWidth
              id="checkBtn"
              shape="greenOutlined"
              disabled={isAbleEmail}
              style={{
                fontSize:
                  user.language === "ko" && !mobileOpen ? "13px" : "11px",
              }}
              onClick={checkValidEmail}
            >
              {isAbleEmail ? t("Checked") : t("중복 확인")}
            </Button>
          </Grid>
          <Grid item xs={12}>
            {commonInput("password")}
          </Grid>
          <Grid item xs={12}>
            {commonInput("passwordCheck")}
          </Grid>
          {/* <Grid item xs={12}>
            {commonInput("company")}
          </Grid>
          <Grid item xs={12}>
            {commonInput("promotionCode")}
          </Grid> */}
          {checkTermsConditions()}

          <Button
            id="signUpBtn"
            type="submit"
            fullWidth
            shape="greenOutlined"
            size="xl"
            sx={{
              mt: !mobileOpen ? 5 : 2.5,
              mb: 3,
            }}
            onClick={signUpSubmit}
          >
            {t("Sign up")}
          </Button>
        </Grid>
      </form>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        background: "linear-gradient(180deg, #2F3236 0%, #161616 47.33%)",
      }}
    >
      <ReactTitle title={"DS2.ai - " + t("Sign up")} />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        {isLoading ? (
          <div className={classes.loading}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <div
              className={classes.paper}
              style={{
                color: currentThemeColor.textWhite87,
              }}
            >
              <div
                id="signupBar"
                style={{
                  width: "100%",
                  display: "flex",
                  marginBottom: !mobileOpen ? "40px" : "10px",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <img
                  src={logo}
                  alt={"logo"}
                  className={classes.logo}
                  style={{ width: "140px" }}
                />
                <Language />
              </div>
              {!canSeeLoginForm ? (
                <Grid container>
                  <Grid item xs={12}>
                    <FormControlLabel
                      style={{
                        marginLeft: "0px",
                        fontSize: mobileOpen && "10px",
                      }}
                      control={
                        <Checkbox
                          id="agreeBtn"
                          value="allowExtraEmails"
                          color="primary"
                          checked={acceptPolicy}
                          onChange={changeAcceptPolicy}
                        />
                      }
                      label={t(
                        "I agree with terms of service and privacy policy"
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={{ marginTop: "14px", marginBottom: "6px" }}
                  >
                    <span>{t("Terms of Service")}</span>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={{
                      height: "200px",
                      overflowY: "auto",
                      marginBottom: "20px",
                      border: "1px solid gray",
                    }}
                  >
                    <ParTermsOfService lang={user.language} />
                  </Grid>
                  <Grid item xs={12} style={{ marginBottom: "6px" }}>
                    <span>{t("Privacy Policy")}</span>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={{
                      height: "200px",
                      overflowY: "auto",
                      border: "1px solid gray",
                    }}
                  >
                    <ParPrivacyPolicy lang={user.language} />
                  </Grid>
                  <Button
                    id="signUpBtn"
                    fullWidth
                    className={classes.signUpOutlineButton}
                    style={{ height: "32px" }}
                    onClick={onSetNextStep}
                  >
                    {t("Next")}
                  </Button>
                </Grid>
              ) : (
                <>
                  {signUpWithEmail ? (
                    formEmailSignup()
                  ) : (
                    <>
                      <strong
                        style={{ fontSize: "18px", marginBottom: "20px" }}
                      >
                        {t("Sign up")}
                      </strong>
                      {/* <div
                        className={classes.socialLogin}
                        style={{ padding: "15px 0", margin: "0" }}
                      >
                        <GoogleLogin
                          clientId={cliedId}
                          render={(renderProps) => (
                            <div
                              onClick={renderProps.onClick}
                              className={classes.googleLogin}
                              style={{ marginBottom: "0" }}
                            >
                              <img
                                className={classes.googleImgColor}
                                src={google}
                                alt={"google"}
                              />
                              <span>{t("Sign Up with Google")}</span>
                            </div>
                          )}
                          buttonText={t("Sign Up with Google")}
                          responseType={"id_token"}
                          onSuccess={onSuccessGoogle}
                          onFailure={onFailure}
                          style={{ borderRadius: "6px" }}
                        />
                      </div> */}
                      <div
                        className={classes.socialLogin}
                        style={{ padding: "15px 0", margin: "0" }}
                      >
                        <Button
                          id="signup_email"
                          onClick={signUpWithEmailTrue}
                          className={classes.googleLogin}
                        >
                          {t("Sign Up with Email")}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            {process.env.REACT_APP_ENTERPRISE !== "true" && (
              <Grid container justifyContent="center">
                <Grid item>
                  <Link
                    href="../signin"
                    variant="body2"
                    style={{ color: "#F0F0F0" }}
                  >
                    {t("Login")}
                  </Link>
                </Grid>
              </Grid>
            )}
          </>
        )}
        <Box mt={5}>
          <Copyright isKor={lang === "ko"} />
        </Box>
        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          key={Math.random().toString()}
          open={isSnackbarOpen}
          onClose={snackbarClose}
        >
          <MySnackbar
            variant={snackbarContent.variant}
            className={classes.margin}
            message={snackbarContent.message}
          />
        </Snackbar>
      </Container>
    </div>
  );
}
