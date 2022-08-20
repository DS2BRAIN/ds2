import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import * as api from "controller/api.js";
import {
  askModalRequestAction,
  openErrorSnackbarRequestAction,
} from "redux/reducers/messages.js";

import { Grid, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import Cookies from "helpers/Cookies";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import Button from "components/CustomButtons/Button";

const CreditChargeButton = ({ history, setIsLoading }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const classes = currentTheme();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );

  const [isPaypalModalOpen, setIsPaypalModalOpen] = useState(false);
  const [firstCnt, setFirstCnt] = useState(0);
  const [secondCnt, setSecondCnt] = useState(0);

  const cntArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let lang = i18n.language;

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsPaypalModalOpen(false);
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (!isPaypalModalOpen) {
      setFirstCnt(0);
      setSecondCnt(0);
    }
  }, [isPaypalModalOpen]);

  const handleIsPaypalModal = (bool) => {
    if (bool) {
      setIsPaypalModalOpen(bool);
    } else {
      dispatch(askModalRequestAction());
    }
  };

  const handleFirstCnt = (e) => {
    setFirstCnt(Number(e.target.value));
  };

  const handleSecondCnt = (e) => {
    setSecondCnt(Number(e.target.value));
  };

  const purchaseCredit = () => {
    if (firstCnt + secondCnt === 0) {
      dispatch(openErrorSnackbarRequestAction(t("Please choose a product.")));
      return;
    }
    if (user.cardInfo.cardName === null && user.cardInfo.created === null) {
      // 카드 없는 경우
      window.location.href = "/admin/setting/payment/?message=need";
      return;
    } else {
      // 카드 있는 경우
      setIsLoading(true);
      let tempPrice =
        lang === "ko"
          ? firstCnt * 9900 + secondCnt * 99000
          : firstCnt * 9.9 + secondCnt * 99;
      api
        .postPurchaseCredit({
          amount: tempPrice,
          currency: lang === "ko" ? "krw" : "usd",
          front_url: api.frontendurl + "admin/setting/payment",
          items: [
            {
              name: "first",
              quantity: firstCnt,
              price: lang === "ko" ? 9900 : 9.9,
            },
            {
              name: "second",
              quantity: secondCnt,
              price: lang === "ko" ? 99000 : 99,
            },
          ],
        })
        .then((res) => {
          setIsLoading(false);
        })
        .catch((e) => {
          console.log(e, "e");
          history.push("/admin/setting/payment?=false");
          dispatch(
            openErrorSnackbarRequestAction(
              t("We could not process your payment. Please try again.")
            )
          );
          setIsLoading(false);
        });
    }
    return;
  };

  return (
    <>
      <Grid container>
        <Button
          id="modifyCardInfo"
          style={{
            height: "32px",
            width: "160px",
            backgroundColor: "#0a84ff",
            borderRadius: "50px",
            padding: " 6px 30px",
            fontSize: "16px",
            fontWeight: "bold",
            lineHeight: "19px",
            color: "#FFFFFF",
          }}
          onClick={() => handleIsPaypalModal(true)}
        >
          {t("Charge Credit")}
        </Button>
        <Grid
          item
          xs={12}
          style={{ marginTop: "16px", fontSize: "14px", padding: "0" }}
          noPadding
        >
          {t("Credit recharge is a prepayment system.")}
        </Grid>
      </Grid>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isPaypalModalOpen}
        onClose={() => {
          dispatch(askModalRequestAction());
        }}
        className={classes.modalContainer}
      >
        <div
          className={classes.defaultModalContent}
          style={{
            width: "800px",
            height: "662px",
            justifyContent: "space-around",
          }}
        >
          <div className={classes.titleContainer}>
            <span style={{ fontSize: "20px", fontWeight: "bold" }}>
              {t("Charge Credit")}
            </span>
            <CloseIcon
              className={classes.modalCloseIcon}
              onClick={() => handleIsPaypalModal(false)}
            />
          </div>
          <div style={{ padding: "0 15px" }}>
            <span>{t("Select Product")}</span>
            <div
              className={classes.titleContainer}
              style={{ padding: "0 15px", margin: "24px 0" }}
            >
              <div>
                <span>1) {lang === "ko" ? t("9,900 KRW") : "$ 9.9"}</span>
                <span className={classes.defaultGreenOutlineButton}>
                  {lang === "ko" ? t("charge 7.5 credit") : t("9 크레딧 충전")}
                </span>
              </div>

              <select
                onChange={handleFirstCnt}
                value={firstCnt}
                name="selectPrice"
                id="selectPrice1"
                style={{
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  border: "1px solid #ACB5BD",
                  color: "#f2f2f2",
                  width: "100px",
                }}
              >
                {cntArr.map((cnt) => (
                  <option value={cnt} style={{ background: "#2F3236" }}>
                    {cnt}
                  </option>
                ))}
              </select>
            </div>
            <div
              className={classes.titleContainer}
              style={{ padding: "0 15px" }}
            >
              <div>
                <span>
                  2) {lang === "ko" ? <>{t("99,000 KRW")}</> : <>{t("$ 99")}</>}
                </span>
                <span className={classes.defaultGreenOutlineButton}>
                  {lang === "ko"
                    ? t("charge 78.75 credit")
                    : t("charge 94.5 credit")}
                </span>
              </div>
              <select
                onChange={handleSecondCnt}
                value={secondCnt}
                name="selectPrice"
                id="selectPrice2"
                style={{
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  border: "1px solid #ACB5BD",
                  color: "#f2f2f2",
                  width: "100px",
                }}
              >
                {cntArr.map((cnt) => (
                  <option value={cnt} style={{ background: "#2F3236" }}>
                    {cnt}
                  </option>
                ))}
              </select>
            </div>
            <span className={classes.input} style={{ padding: "0 30px" }}>
              ({t("Offer 5% extra credit")})
            </span>
          </div>
          <div
            style={{
              borderTop: "1px solid #828282",
              borderBottom: "1px solid #828282",
              padding: "30px",
            }}
          >
            <div
              className={classes.fullWidthAlignRightContainer}
              style={{ margin: "5px 0" }}
            >
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      color: currentThemeColor.secondary1,
                    }}
                  >
                    {t("Total Credit")}
                  </span>
                </div>
                <span
                  id="totalCredit"
                  style={{
                    fontSize: "22px",
                    color: currentThemeColor.secondary1,
                  }}
                >
                  {lang === "ko"
                    ? firstCnt * 7.5 + secondCnt * 75 * 1.05
                    : firstCnt * 9 + secondCnt * 90 * 1.05}
                </span>
              </div>
            </div>
            <div
              className={classes.fullWidthAlignRightContainer}
              style={{ margin: "5px 0" }}
            >
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <span id="totalCount">
                    {t("Total Quantity")} {firstCnt + secondCnt}
                    {lang === "ko" ? "개" : ""}
                  </span>
                </div>
                <span id="rawPrice">
                  {lang === "ko" ? (
                    <>
                      {(firstCnt * 9000 + secondCnt * 90000).toLocaleString()}{" "}
                      {t("KRW")}
                    </>
                  ) : (
                    <>$ {(firstCnt * 9 + secondCnt * 90).toLocaleString()} </>
                  )}
                </span>
              </div>
            </div>
            <div
              className={classes.fullWidthAlignRightContainer}
              style={{ margin: "5px 0" }}
            >
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <span>{t("Surtax")}</span>
                </div>
                <span id="totalVat">
                  {lang === "ko" ? (
                    <>
                      {(firstCnt * 900 + secondCnt * 9000).toLocaleString()}{" "}
                      {t("KRW")}
                    </>
                  ) : (
                    <>$ {(firstCnt * 0.9 + secondCnt * 9).toLocaleString()} </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className={classes.titleContainer} style={{ padding: "0 30px" }}>
            <span>{t("Total Payment Amount")}</span>
            <span id="totalPrice">
              {lang === "ko" ? (
                <>
                  <span style={{ fontSize: "25px" }}>
                    {(
                      firstCnt * 9000 +
                      secondCnt * 90000 +
                      firstCnt * 900 +
                      secondCnt * 9000
                    ).toLocaleString()}{" "}
                  </span>
                  {t("KRW")}
                </>
              ) : (
                <>
                  ${" "}
                  <span style={{ fontSize: "25px" }}>
                    {(
                      firstCnt * 9 +
                      secondCnt * 90 +
                      (firstCnt * 0.9 + secondCnt * 9)
                    ).toLocaleString()}{" "}
                  </span>
                </>
              )}
            </span>
          </div>
          <div style={{ paddingRight: "30px", alignSelf: "flex-end" }}>
            <Button
              id="purchaseCredit"
              className={classes.defaultGreenOutlineButton}
              style={{ height: "35px", width: "140px" }}
              onClick={purchaseCredit}
            >
              {t("Buy")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CreditChargeButton;
