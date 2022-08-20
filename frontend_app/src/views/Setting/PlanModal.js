import React, { useState, useEffect, useRef, createRef } from "react";
import GridItem from "components/Grid/GridItem.js";
import CategoryIcon from "@material-ui/icons/Category";
import Modal from "@material-ui/core/Modal";
import Cookies from "helpers/Cookies";
import CloseIcon from "@material-ui/icons/Close";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import * as api from "controller/api.js";
import currentTheme from "assets/jss/custom.js";
import { currentThemeColor } from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import {
  openErrorSnackbarRequestAction,
  askModalRequestAction,
  askChangPlanRequestAction,
} from "redux/reducers/messages.js";
import { stopUserLoadingRequestAction } from "redux/reducers/user.js";
import { useTranslation } from "react-i18next";
import { sendErrorMessage } from "components/Function/globalFunc.js";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "components/CustomButtons/Button";
import { openChat } from "components/Function/globalFunc";

const PlanModal = ({ isFromSetting, onClosePlanModal }) => {
  const classes = currentTheme();
  const mainPanel = createRef();
  const dispatch = useDispatch();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );

  const [checkedPlan, setCheckedPlan] = useState({
    id: null,
    name: null,
    price: 0,
  });
  const [dynosValue, setDynosValue] = useState(1);
  const [modalContents, setModalContents] = useState("");
  const [isPayCheckModalOpen, setIsPayCheckModalOpen] = useState(false);
  const [isPlanChangeLoading, setIsPlanChangeLoading] = useState(false);
  const dynosRange = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const { t } = useTranslation();

  useEffect(() => {
    try {
      setCheckedPlan({
        id: user.me.usageplan.id,
        name: user.me.usageplan.planName,
        price: user.me.usageplan.price,
      });
      // if(user.me.isFirstplanDone){
      //     setCheckedPlan({id: user.me.usageplan.id, name: user.me.usageplan.planName, price: user.me.usageplan.price});
      // }
    } catch {
      setCheckedPlan({ id: null, name: null });
    }
    setDynosValue(user.me.dynos);
  }, []);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsPayCheckModalOpen(false);
      dispatch(stopUserLoadingRequestAction());
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (messages.shouldRenderPayple) renderCardInfo();
  }, [messages.shouldRenderPayple]);

  useEffect(() => {
    resizeFunction();
    window.addEventListener("resize", resizeFunction);
    return function cleanup() {
      window.removeEventListener("resize", resizeFunction);
    };
  }, [mainPanel]);

  const resizeFunction = () => {
    if (window.innerWidth < 1600) {
      const titleFonts = document.getElementsByClassName("planTitle");
      for (let idx = 0; idx < titleFonts.length; idx++) {
        titleFonts[idx].style.fontSize = "12px";
      }
      const contentFont = document.getElementsByClassName("contentFont");
      for (let idx = 0; idx < contentFont.length; idx++) {
        contentFont[idx].style.fontSize = "12px";
      }
    } else {
      const titleFonts = document.getElementsByClassName("planTitle");
      for (let idx = 0; idx < titleFonts.length; idx++) {
        titleFonts[idx].style.fontSize = "15px";
      }
      const contentFont = document.getElementsByClassName("contentFont");
      for (let idx = 0; idx < contentFont.length; idx++) {
        contentFont[idx].style.fontSize = "14px";
      }
    }
  };

  const dynosChange = (e) => {
    setDynosValue(e.target.value);
  };

  const onChangeCheckedPlan = (id, name, price) => {
    if (name === "enterprise") {
      dispatch(
        openErrorSnackbarRequestAction(
          t(
            "Please contact us in order to make changes to your Enterprise account"
          )
        )
      );
      return;
    }
    setCheckedPlan({ id: id, name: name, price: price });
  };

  const onClickUsagePlan = () => {
    const date = user.me.nextPaymentDate
      ? user.me.nextPaymentDate.substring(0, 10)
      : t("Next month");
    const myUsagePlan = user.me.usageplan;

    if (!checkedPlan) {
      dispatch(openErrorSnackbarRequestAction(t("Choose plan")));
      return;
    }

    if (myUsagePlan && myUsagePlan.planName.indexOf("canceled") > -1) {
      if (checkedPlan.name.indexOf("basic") > -1) {
        dispatch(
          askChangPlanRequestAction({
            message: `베이직 플랜으로 결제가 진행되며, 총 결제하실 금액은 ${checkedPlan.price.toLocaleString()}원 입니다. 선택하신 이용플랜으로 등록하시겠습니까?`,
            requestAction: "firstpay",
          })
        );
        return;
      }
      if (checkedPlan.name.indexOf("business") > -1) {
        dispatch(
          askChangPlanRequestAction({
            message: `비지니스 플랜으로 결제가 진행되며, 총 결제하실 금액은 ${(
              checkedPlan.price * dynosValue
            ).toLocaleString()}원 입니다. 선택하신 이용플랜으로 등록하시겠습니까?`,
            requestAction: "firstpay",
          })
        );
        return;
      }
    } else {
      const price =
        checkedPlan.name === "basic"
          ? checkedPlan.price
          : checkedPlan.price * dynosValue;
      if (
        myUsagePlan.planName.indexOf("basic") > -1 &&
        myUsagePlan.planName === checkedPlan.name
      ) {
        setModalContents(
          `현재 이용플랜 재결재시 현재 남은 이용권은 ${date} 까지 사용가능하며, 총 결제하실 금액은 ${price.toLocaleString()}원입니다. 계속 진행하시겠습니까?`
        );
        setIsPayCheckModalOpen(true);
        return;
      }
      if (
        myUsagePlan.planName.indexOf("business") > -1 &&
        myUsagePlan.planName === checkedPlan.name
      ) {
        if (user.me.dynos > dynosValue) {
          setModalContents(
            `GPU를 줄이는 경우(${
              user.me.dynos
            } -> ${dynosValue})는 ${date}부터 적용되며, ${date}부터 결제하실 금액은 ${price.toLocaleString()}원입니다. 계속 진행하시겠습니까?`
          );
          setIsPayCheckModalOpen(true);
          return;
        } else {
          setModalContents(
            `총 결제하실 금액은 ${price.toLocaleString()}원입니다. 남은 이용권은 ${date} 까지 이용 가능하며, 이후 소멸됩니다. 결제시 현재까지 사용 누적량은 초기화 되며, 추가 구매량에서 차감 됩니다. 계속 진행하시겠습니까?`
          );
          setIsPayCheckModalOpen(true);
          return;
        }
      }
      if (
        myUsagePlan.planName.indexOf("business") > -1 &&
        checkedPlan.name.indexOf("basic") > -1
      ) {
        setModalContents(
          `하위플랜(베이직) 이용시 ${date}부터 적용되며, ${date}부터 결제하실 금액은 ${price.toLocaleString()}원입니다. 계속 진행하시겠습니까?`
        );
        setIsPayCheckModalOpen(true);
        return;
      }
      if (
        myUsagePlan.planName.indexOf("basic") > -1 &&
        checkedPlan.name.indexOf("business") > -1
      ) {
        setModalContents(
          `총 결제하실 금액은 ${price}원입니다. 현재 남은 베이직 이용권은 ${date}까지 이용 가능하며, 이후 소멸됩니다. 결제시 현재까지 사용 누적량은 초기화 되며, 추가 구매량에서 차감 됩니다. 계속 진행하시겠습니까?`
        );
        setIsPayCheckModalOpen(true);
        return;
      }
      setModalContents(
        `선택하신 이용플랜은 ${
          checkedPlan.name
        }이며, 총 결제하실 금액은 ${price.toLocaleString()}원입니다. 계속 진행하시겠습니까?`
      );
      setIsPayCheckModalOpen(true);
      return;
    }

    dispatch(
      openErrorSnackbarRequestAction(
        t(
          "죄송합니다. 이용플랜 변경에 오류가 발생하였습니다. 고객센터로 문의 바랍니다."
        )
      )
    );
    return;
  };

  // const onChangeUsagePlan = async () => {
  //   //2주 후에 카드 등록하면서 플랜결제하는 로직 & 페이플 거치지 않고 이용플랜 변경하는 로직
  //   await setIsPayCheckModalOpen(false);
  //   await setIsPlanChangeLoading(true);
  //   await api
  //     .postUsagePlan(checkedPlan.name, dynosValue)
  //     .then((res) => {
  //       setTimeout(() => {
  //         window.location.href = "/admin/setting/usageplan/?changed=true";
  //       }, 3000);
  //     })
  //     .catch((e) => {
  //       if (!process.env.REACT_APP_DEPLOY) console.log(e);
  //       if (e.response && e.response.data.message) {
  //         dispatch(
  //           openErrorSnackbarRequestAction(
  //             sendErrorMessage(
  //               e.response.data.message,
  //               e.response.data.message_en,
  //               user.language
  //             )
  //           )
  //         );
  //       } else {
  //         dispatch(
  //           openErrorSnackbarRequestAction(
  //             t(
  //               "죄송합니다. 일시적인 오류로 인하여 이용플랜 변경에 실패하였습니다."
  //             )
  //           )
  //         );
  //       }
  //       setTimeout(() => {
  //         window.location.reload();
  //       }, 3000);
  //     });
  // };

  const renderCardInfo = () => {
    const nextPrice =
      checkedPlan.name === "basic"
        ? checkedPlan.price
        : checkedPlan.price * dynosValue;
    //const price = Math.round(+nextPrice - myUsagePlan.price * (30 - Math.round((new Date(nextPaymentDate) - new Date()) / (1000*60*60*24))) / 30) - 1;
    const price = parseInt(checkedPlan.price);
    const priceDisplay = price.toLocaleString();
    const dynos = checkedPlan.name === "basic" ? 1 : dynosValue;
    Cookies.setCookieSecure("Samesite", "None");
    const user = JSON.parse(Cookies.getCookie("user"));
    const userid = user["id"];
    const date = new Date();
    var obj = new Object();

    obj.PCD_CPAY_VER = "1.0.1";
    obj.PCD_PAY_TYPE = "card";
    obj.PCD_PAY_WORK = "AUTH";
    obj.PCD_CARD_VER = "01";
    obj.payple_auth_file = api.backendurl + "payple-auth-file/"; // 절대경로 포함 파일명 (예: /절대경로/payple_auth_file)
    obj.PCD_RST_URL = api.backendurl + "pgpayment/"; // 절대경로 포함 파일명 (예: /절대경로/payple_auth_file)
    // obj.callbackFunction = onChangeUsagePlan; // getResult : 콜백 함수명
    obj.PCD_PAYER_NO = "" + userid;
    obj.PCD_PAYER_NAME = user.username;
    obj.PCD_PAYER_EMAIL = user.email;
    obj.PCD_PAY_GOODS = checkedPlan.name;
    obj.PCD_PAY_TOTAL = price; // price
    obj.PCD_PAY_ISTAX = "Y";
    obj.PCD_PAY_TAXTOTAL = "10";
    obj.PCD_PAY_OID = "payment_" + api.frontendurl + "_" + date.getTime();
    obj.PCD_SIMPLE_FLAG = "Y";
    obj.PCD_USER_DEFINE1 = api.frontendurl;
    obj.PCD_USER_DEFINE2 = dynos; // dynos
    const PaypleCpayAuthCheck = window.PaypleCpayAuthCheck;
    PaypleCpayAuthCheck(obj);
  };

  const onOpenChatbot = () => {
    onClosePlanModal();
    openChat();
  };

  return user.isLoading || isPlanChangeLoading ? (
    <div className={classes.planRoot}>
      <CircularProgress />
    </div>
  ) : (
    <div ref={mainPanel}>
      <GridItem
        xs={12}
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "12px",
        }}
      >
        <div className={classes.title}>{t("Plan")}</div>
      </GridItem>
      <GridItem xs={12}>
        <div className={classes.planRoot}>
          <div className={classes.planInfo}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ height: "8px" }}></div>
              <div className="planTitle">{t("Prediction")}</div>
              <div className="planTitle">{t("Total usage capacity")}</div>
              <div className="planTitle">{t("Number of projects")}</div>
              <div className="planTitle">{t("API provision")}</div>
              <div className="planTitle">{t("Model developing speed")}</div>
              <div className="planTitle">
                {t("Simultaneous modeling number")}
              </div>
              <div className="planTitle">{t("Technical support")}</div>
              <div className="planTitle">
                {t("API provision velocity (single prediction, Real-time)")}
              </div>
              <div className="planTitle">
                {t(
                  "API provision velocity (collective prediction, asynchronous processing)"
                )}
              </div>
              <div className="planTitle">{t("Datasets count limit")}</div>
              <div className="planTitle">
                {t("Number of data concurrently used")}
              </div>
              <div className="planTitle">{t("Number of Labeling")}</div>
              <div className="planTitle">{t("Shared user")}</div>
            </div>
          </div>
          {user.allPlans &&
            user.allPlans.map((plan, idx) => {
              if (plan.planName !== "basic" && plan.planName !== "business")
                return;
              return (
                <div
                  className={classes.planCard}
                  id={plan.planName}
                  onClick={() =>
                    onChangeCheckedPlan(plan.id, plan.planName, plan.price)
                  }
                  style={{
                    border:
                      checkedPlan.id === plan.id
                        ? "2px solid " + currentThemeColor.highlight1
                        : null,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "68px",
                    }}
                  >
                    <CategoryIcon fontSize="large" />
                    <div style={{ fontSize: "25px", fontWeight: "bold" }}>
                      {plan.planName.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div className="contentFont">
                      {plan.noOfPrediction
                        ? plan.noOfPrediction.toLocaleString() + t("")
                        : "X"}
                    </div>
                    <div className="contentFont">
                      {plan.storage
                        ? (plan.storage / 1073741824).toLocaleString() + "GB"
                        : "X"}
                    </div>
                    <div className="contentFont">
                      {plan.projects
                        ? plan.projects.toLocaleString() + t("")
                        : "X"}
                    </div>
                    <div className="contentFont">
                      {plan.isApiAbled ? "YES" : "NO"}
                    </div>
                    <div className="contentFont">
                      {plan.modelSpeed ? t(plan.modelSpeed) : "X"}
                    </div>
                    <div className="contentFont">
                      {plan.noOfModeling ? plan.noOfModeling + t("") : "X"}
                    </div>
                    <div className="contentFont">
                      {plan.technicalSupport ? plan.technicalSupport : "X"}
                    </div>
                    <div className="contentFont">
                      {plan.apiSpeedForOne
                        ? plan.apiSpeedForOne + "requests / sec"
                        : t("No limit")}
                    </div>
                    <div className="contentFont">
                      {plan.apiSpeedForAll
                        ? plan.apiSpeedForAll + "requests / sec"
                        : t("No limit")}
                    </div>
                    <div className="contentFont">
                      {plan.noOfDataset
                        ? plan.noOfDataset.toLocaleString() + t("")
                        : t("No limit")}
                    </div>
                    <div className="contentFont">
                      {plan.noOfConnector
                        ? plan.noOfConnector.toLocaleString() + t("")
                        : t("No limit")}
                    </div>
                    <div className="contentFont">
                      {plan.noOfLabelling
                        ? plan.noOfLabelling.toLocaleString() + t("")
                        : "X"}
                    </div>
                    <div className="contentFont">
                      {plan.noOfSharing
                        ? plan.noOfSharing.toLocaleString() + t("")
                        : "X"}
                    </div>
                  </div>
                  <div className={classes.alignCenterContainer}>
                    {plan.planName === "business" ? (
                      <div>
                        <Button
                          id="askEnterprise"
                          className={classes.defaultOutlineButton}
                          style={
                            plan.name === "enterprise"
                              ? {
                                  background:
                                    currentThemeColor.highlight1 +
                                    " !important",
                                }
                              : null
                          }
                        >
                          <span style={{ marginRight: "8px" }}>
                            {t("per month")}{" "}
                            {(plan.price * dynosValue).toLocaleString()}
                            {t("KRW")}
                          </span>
                          <Select
                            labelid="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={dynosValue}
                            onChange={dynosChange}
                            className={classes.selectForm}
                            id="valueForDynosSelectBox"
                          >
                            {dynosRange.map((num) => {
                              return <MenuItem value={num}>{num}</MenuItem>;
                            })}
                          </Select>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        id="askEnterprise"
                        className={classes.defaultOutlineButton}
                        style={
                          plan.name === "enterprise"
                            ? {
                                background:
                                  currentThemeColor.highlight1 + " !important",
                              }
                            : null
                        }
                      >
                        {plan.planName === "trial"
                          ? t("Switch to BASIC after 2 weeks of free trial")
                          : `${t(
                              "per month"
                            )} ${plan.price.toLocaleString()}${t("원")}`}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </GridItem>
      <GridItem xs={12} style={{ margin: "10px" }}>
        <div className={classes.content}>
          <span>
            ** {t("Please contact us if you don't have enough storage space")}
          </span>
          {!isFromSetting && (
            <span style={{ marginLeft: "40px" }}>
              ** {t("Please choose your plan to go to the main page")}
            </span>
          )}
        </div>
      </GridItem>
      <GridItem xs={12}>
        <a
          href="https://clickai.ai/pricing.html"
          target="_blank"
          className={classes.priceLink}
        >
          {t(" Learn more about the pricing ")}
        </a>
      </GridItem>
      <GridItem xs={12}>
        <div className={classes.alignCenterContainer}>
          {isFromSetting && (
            <GridItem xs={6}>
              <Button
                id="cancelPlan"
                style={{ selfAlign: "flex-end" }}
                className={classes.defaultOutlineButton}
                onClick={() => {
                  dispatch(askModalRequestAction());
                }}
              >
                {t("Cancel")}
              </Button>
            </GridItem>
          )}
          {
            <GridItem xs={6}>
              <Button
                id="payBtn"
                className={classes.defaultHighlightButton}
                onClick={onOpenChatbot}
              >
                {t("Contact us")}
              </Button>
              {/* {
                        checkedPlan.id &&
                        <Button
                            id='selectPlan'
                            style={{selfAlign: 'flex-end'}}
                            className={classes.defaultHighlightButton}
                            onClick={onClickUsagePlan}
                                >
                            {t('Select')}
                        </Button>
                        } */}
            </GridItem>
          }
        </div>
      </GridItem>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isPayCheckModalOpen}
        onClose={() => {
          setIsPayCheckModalOpen(false);
        }}
        className={classes.modalContainer}
      >
        <div className={classes.payModalContent}>
          <div style={{ textAlign: "center", fontSize: "20px" }}>
            <b> [ {t(" Change Plan")} ] </b>
          </div>
          <div>{modalContents}</div>
          <div className={classes.buttonContainer}>
            <GridItem xs={6}>
              <Button
                id="closeCancelModalBtn"
                className={classes.defaultOutlineButton}
                onClick={() => {
                  setIsPayCheckModalOpen(false);
                }}
              >
                {t("Return")}
              </Button>
            </GridItem>
            <GridItem xs={6}>
              <Button
                id="payBtn"
                className={classes.defaultHighlightButton}
                onClick={onOpenChatbot}
                disabled={isPlanChangeLoading}
              >
                {t("Contact us")}
              </Button>
              {/* {
                            <Button
                            id='payBtn'
                            className={classes.defaultHighlightButton}
                            onClick={onChangeUsagePlan}
                            disabled={isPlanChangeLoading}
                            >
                                {t(' Billing')}
                            </Button>
                            } */}
            </GridItem>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(PlanModal);
