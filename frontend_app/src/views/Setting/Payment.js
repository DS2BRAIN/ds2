import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import * as api from "controller/api.js";
import { getCardRequestAction } from "redux/reducers/user.js";
import { openSuccessSnackbarRequestAction, openErrorSnackbarRequestAction } from "redux/reducers/messages.js";
import Cookies from "helpers/Cookies";
import currentTheme from "assets/jss/custom.js";
import { convertToLocalDateStr } from "components/Function/globalFunc.js";
import Button from "components/CustomButtons/Button";
import { IS_ENTERPRISE } from "variables/common";

import axios from "axios";
import { useTranslation } from "react-i18next";
import { Modal, Table, TableBody, TableCell, TableHead, TableRow, TablePagination } from "@material-ui/core";
import { CircularProgress, Container, Grid } from "@mui/material";

const TEST_CLIENT = "AXhvfOLCYT3v9RdqL4xlEAtsFNhjS9EfxJjqVwasDH4S-YunYHroWdWRflCWfsBhSHO9FJH03xu__pTH";
const CONSOLE_CLIENT = "AW0HlGqynLRhTTNBk23S-_o3hkzqhimbU32Uq6S56n0Hk7HEVHxvOuqMXQBHqomTjSGbEcwh-i36lMnZ";

const Payment = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => ({ user: state.user }), []);
  const [isLoading, setIsLoading] = useState(true);
  const [prePaymentBillings, setPrePaymentBillings] = useState([]);
  const [postPaymentBillings, setPostPaymentBillings] = useState([]);
  const [prePaymentHistoryPage, setPrePaymentHistoryPage] = useState(0);
  const [postPaymentHistoryPage, setPostPaymentHistoryPage] = useState(0);
  const [rowsPerPrePaymentHistoryPage, setRowsPerPrePaymentHistoryPage] = useState(10);
  const [rowsPerPostPaymentHistoryPage, setRowsPerPostPaymentHistoryPage] = useState(10);
  const [cardRequestModalOpen, setCardRequestModalOpen] = useState(false);
  const [eximbayParamsNames, setEximbayParamsNames] = useState(null);
  const [eximbayParams, setEximbayParams] = useState(null);
  const [eximbayUrl, setEximbayUrl] = useState(null);
  const [country, setCountry] = useState(null);

  const { t } = useTranslation();

  const origin = window.location.origin;
  const pathname = window.location.pathname;

  const prePaymentTableHeads = [
    { value: "No", width: "10%", name: "" },
    { value: "결제 날짜", width: "20%", name: "created_at" },
    { value: "결제 금액", width: "30%", name: "price" },
    { value: "결제 수단", width: "20%", name: "PCD_PAY_CARDNAME" },
    { value: "카드전표", width: "20%", name: "receipt" },
  ];

  const postPaymentTableHeads = [
    { value: "No", width: "10%", name: "" },
    { value: "사용 년월", width: "10%", name: "name" },
    { value: "결제 날짜", width: "14%", name: "created_at" },
    { value: "유형", width: "8%", name: "paymentType" },
    { value: "결제 금액", width: "15%", name: "price" },
    { value: "승인 여부", width: "8%", name: "PCD_PAY_RST" },
    { value: "결제 수단", width: "15%", name: "PCD_PAY_CARDNAME" },
    { value: "세부내역", width: "10%", name: "detail" },
    { value: "카드전표", width: "10%", name: "receipt" },
  ];

  let lang = user.language ? user.language : Cookies.getCookie("language");

  useEffect(() => {
    if (user.me) {
      lang = user.me.lang;
    }
  }, [user.me]);

  useEffect(() => {
    if (!IS_ENTERPRISE) {
      (async () => {
        setIsLoading(true);
        await getIpClient();
        makeNotice();
        await dispatch(getCardRequestAction());
        getAllBillingInfo();
      })();
    }
  }, []);

  useEffect(() => {
    if (user.language === "en") {
      setIsLoading(true);
      api.PostEximbay().then((res) => {
        setEximbayParamsNames(Object.keys(res.data.params));
        setEximbayParams(res.data.params);
        setEximbayUrl(res.data.url);
        setIsLoading(false);
      });
    }
  }, [user.language]);

  const changePrePaymentHistoryPage = (event, newPage) => {
    setPrePaymentHistoryPage(newPage);
  };

  const changePostPaymentHistoryPage = (event, newPage) => {
    setPostPaymentHistoryPage(newPage);
  };

  const changeRowsPerPrePaymentHistoryPage = (event) => {
    setRowsPerPrePaymentHistoryPage(+event.target.value);
    setPrePaymentHistoryPage(0);
  };

  const changeRowsPerPostPaymentHistoryPage = (event) => {
    setRowsPerPostPaymentHistoryPage(+event.target.value);
    setPostPaymentHistoryPage(0);
  };

  const makeNotice = () => {
    const url = window.location.href;
    const queryString = require("query-string");
    const parsed = queryString.parse(window.location.search);
    if (url.indexOf("?paid=true") !== -1) {
      dispatch(openSuccessSnackbarRequestAction(t("Charging succeeded.")));
    }
    if (url.indexOf("?paid=false") !== -1) {
      dispatch(openSuccessSnackbarRequestAction(t("Charging failed.")));
    }
    if (url.indexOf("?message=true") !== -1) {
      dispatch(openSuccessSnackbarRequestAction(t("You have successfully registered your card.")));
    }
    if (url.indexOf("?message=duplicate") !== -1) {
      dispatch(openErrorSnackbarRequestAction(t("This card has already been registered. Please try a different card.")));
    }
    if (url.indexOf("?message=false") !== -1) {
      dispatch(openErrorSnackbarRequestAction(t("Failed to register the card.")));
    }
    if (url.indexOf("?message=need") !== -1) {
      dispatch(openSuccessSnackbarRequestAction(t("You can use the service after registering your card.")));
      setCardRequestModalOpen(true);
    }
    if (url.indexOf("?cardRequest=true") !== -1) {
      dispatch(openErrorSnackbarRequestAction(`${t("")} ${t(parsed.message)}`));

      // dispatch(
      //   openErrorSnackbarRequestAction(
      //     `${t("You can use the service after credit is charged.")} ${t(
      //       parsed.message
      //     )}`
      //   )
      // );
      // setIsPaypalModalOpen(true);
    }
  };

  const getCardInfo = () => {
    setTimeout(() => dispatch(getCardRequestAction()), 5000);
  };

  const getAllBillingInfo = () => {
    api
      .getPgPayment()
      .then((res) => {
        const prePaymentHistoryArr = res.data.prePaymentHistory;
        const postPaymentHistoryArr = res.data.postPaymentHistory;

        prePaymentHistoryArr.sort((prev, next) => {
          return next["id"] - prev["id"];
        });
        postPaymentHistoryArr.sort((prev, next) => {
          return next["id"] - prev["id"];
        });

        setPrePaymentBillings(prePaymentHistoryArr);
        setPostPaymentBillings(postPaymentHistoryArr);
      })
      .then(() => {
        setIsLoading(false);
      });
  };

  const handleChange = (event, year, month) => {
    event.preventDefault();
    history.push(`/admin/setting/${event.currentTarget.id}?year=${year}&month=${month}`);
    window.scrollTo(0, 0);
  };

  async function getIpClient() {
    try {
      const response = await axios.get("https://extreme-ip-lookup.com/json");
      const country = response.data.countryCode;
      setCountry(country);
      if (country != "KR") {
        api.PostEximbay().then((res) => {
          setEximbayParamsNames(Object.keys(res.data.params));
          setEximbayParams(res.data.params);
          setEximbayUrl(res.data.url);
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  const getResult = (response) => {
    if (!process.env.REACT_APP_DEPLOY) console.log(response, "res");
  };

  const renderCardInfoInKR = () => {
    Cookies.setCookieSecure("Samesite", "None");
    const user = JSON.parse(Cookies.getCookie("user"));
    const userid = user["id"];
    var obj = new Object();

    obj.PCD_CPAY_VER = "1.0.1";
    obj.PCD_PAY_TYPE = "card";
    // obj.PCD_PAY_WORK = "PAY";
    obj.PCD_PAY_WORK = "AUTH";
    obj.PCD_CARD_VER = "01";
    /* (필수) 가맹점 인증요청 파일 (Node.JS : auth => [app.js] app.post('/pg/auth', ...) */
    obj.payple_auth_file = api.backendurl + "payple-auth-file/"; // 절대경로 포함 파일명 (예: /절대경로/payple_auth_file)
    obj.PCD_RST_URL = api.backendurl + "pgregistration/"; // 절대경로 포함 파일명 (예: /절대경로/payple_auth_file)
    /* 결과를 콜백 함수로 받고자 하는 경우 함수 설정 추가 */
    obj.callbackFunction = getResult; // getResult : 콜백 함수명
    /* End : 결과를 콜백 함수로 받고자 하는 경우 함수 설정 추가 */
    obj.PCD_PAYER_NO = userid;
    obj.PCD_PAYER_NAME = user.username;
    obj.PCD_PAYER_EMAIL = user.email;
    obj.PCD_PAY_GOODS = user.email + " 카드등록";
    obj.PCD_PAY_TOTAL = "100";
    obj.PCD_PAY_ISTAX = "Y";
    obj.PCD_PAY_TAXTOTAL = "10";
    obj.PCD_PAY_OID = "register_" + api.frontendurl + "_" + `${Date.now()}`;
    obj.PCD_SIMPLE_FLAG = "Y";
    obj.PCD_USER_DEFINE1 = origin + pathname;
    const PaypleCpayAuthCheck = window.PaypleCpayAuthCheck;
    PaypleCpayAuthCheck(obj);

    return;
  };

  const renderCardInfoInAbroad = (text) =>
    eximbayParams &&
    eximbayParamsNames &&
    eximbayUrl && (
      <form name="regForm" method="post" action={eximbayUrl}>
        {eximbayParamsNames.map((name) => (
          <input type="hidden" name={name} value={eximbayParams[name]} />
        ))}
        <Button type="submit" shape="whiteOutlined">
          {t(text)}
        </Button>
      </form>
    );

  return isLoading ? (
    <div className={classes.loading}>
      <CircularProgress />
    </div>
  ) : (
    <Container component="main" maxWidth="false" disableGutters className={classes.mainCard}>
      {/* <CreditChargeButton history={history} setIsLoading={setIsLoading} /> */}
      <Grid
        container
        sx={{
          py: 3,
          alignItems: "center",
        }}
      >
        <Grid item sx={{ mr: 3 }}>
          <div className={classes.title}>{t("My payment method")}</div>
        </Grid>
        <Grid item>
          {user.language === "ko" ? (
            <Button id="addCardInfo" shape="whiteOutlined" onClick={renderCardInfoInKR}>
              {!user.cardInfo || Object.keys(user.cardInfo).length === 0 || (user.cardInfo.cardName === null && user.cardInfo.created === null) ? t("Register payment card") : t("Modify payment card")}
            </Button>
          ) : (
            renderCardInfoInAbroad(!user.cardInfo || Object.keys(user.cardInfo).length === 0 || (user.cardInfo.cardName === null && user.cardInfo.created === null) ? t("Register payment card") : t("Modify payment card"))
          )}
        </Grid>
        <Grid
          item
          xs={12}
          style={{
            margin: "12px 0 24px",
            fontSize: "15px",
            color: "var(--secondary1)",
          }}
        >
          * {t("If the service language is set to Korean, the card registration is carried out in Payple, if it is in English, EXIMBAY.")}
        </Grid>
        <Grid
          container
          style={{
            borderTop: "2px solid #D0D0D0",
            borderBottom: "1px solid #D0D0D0",
            width: "100%",
            padding: "24px 0",
          }}
        >
          {!user.cardInfo || Object.keys(user.cardInfo).length === 0 || (user.cardInfo.cardName === null && user.cardInfo.created === null) ? (
            <Grid
              item
              xs={12}
              style={{
                height: "100px",
                lineHeight: "100px",
                textAlign: "center",
                fontSize: 16,
              }}
            >
              {t("There is no registered information.")}
            </Grid>
          ) : (
            <>
              <Grid item xs={3} style={{ height: "50px", lineHeight: "50px" }}>
                {t("Card number")}
              </Grid>
              <Grid item xs={9} style={{ height: "50px", lineHeight: "50px" }}>
                <div id="userCardNumber">{user.cardInfo.cardName}</div>
              </Grid>
              <Grid item xs={3} style={{ height: "50px", lineHeight: "50px" }}>
                {t("Date of Registration")}
              </Grid>
              <Grid item xs={9} style={{ height: "50px", lineHeight: "50px" }}>
                <div id="userCardCreateDate">{user.cardInfo.created}</div>
              </Grid>
            </>
          )}
          {user.language === "en" && (
            <Grid item xs={12} style={{ color: "red" }}>
              Note: Please note that the billing descriptor will be listed as EXIMBAY.COM.
            </Grid>
          )}
        </Grid>
      </Grid>

      <Grid
        sx={{
          pt: 2.5,
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className={classes.title}>{t("Prepaid Recharge History")}</div>
      </Grid>
      <Grid container justifyContent="center" style={{ minHeight: 100, marginBottom: 3 }}>
        <hr className={classes.line} />
        {prePaymentBillings && prePaymentBillings.length ? (
          <div style={{ width: "100%" }}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {prePaymentTableHeads.map((tableHead, idx) => (
                    <TableCell
                      id="paymentCell"
                      key={idx}
                      align="center"
                      width={tableHead.width}
                      style={{
                        color: "white",
                      }}
                    >
                      {t(tableHead.value)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {prePaymentBillings.slice(prePaymentHistoryPage * rowsPerPrePaymentHistoryPage, prePaymentHistoryPage * rowsPerPrePaymentHistoryPage + rowsPerPrePaymentHistoryPage).map((data, idx) => (
                  <TableRow
                    key={data.cardName + data.id}
                    className={classes.tableRow}
                    style={{
                      background: idx % 2 === 0 ? currentTheme.tableRow1 : currentTheme.tableRow2,
                    }}
                  >
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {prePaymentHistoryPage * rowsPerPrePaymentHistoryPage + idx + 1}
                    </TableCell>
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {data.created_at === null ? "" : convertToLocalDateStr(data.created_at)}
                    </TableCell>
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {data.currency === "usd" && "$"}
                      {data.price.toLocaleString()}
                      {data.currency === "krw" && t("KRW")}
                    </TableCell>
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {data.PCD_PAY_RST === "success" ? `${data.PCD_PAY_CARDNUM}(${data.PCD_PAY_CARDNAME})` : ""}{" "}
                    </TableCell>
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {data.PCD_PAY_RST === "success" ? (
                        <a href={data.PCD_PAY_CARDRECEIPT} target="_blank">
                          {t("See receipt")}
                        </a>
                      ) : (
                        ""
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={prePaymentBillings.length}
              rowsPerPage={rowsPerPrePaymentHistoryPage}
              page={prePaymentHistoryPage}
              backIconButtonProps={{
                "aria-label": "previous page",
              }}
              nextIconButtonProps={{
                "aria-label": "next page",
              }}
              onChangePage={changePrePaymentHistoryPage}
              onChangeRowsPerPage={changeRowsPerPrePaymentHistoryPage}
            />
          </div>
        ) : (
          <div style={{ fontSize: 16 }}>{user.language === "ko" ? "선불 충전 내역이 없습니다." : "No history"}</div>
        )}
      </Grid>
      <Grid
        container
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          paddingTop: "20px",
        }}
      >
        <div className={classes.title}>{t("Postpaid Bill History")}</div>
      </Grid>
      <Grid container justifyContent="center" style={{ minHeight: 100 }}>
        <hr className={classes.line} />
        {postPaymentBillings && postPaymentBillings.length ? (
          <div style={{ width: "100%" }}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {postPaymentTableHeads.map((tableHead, idx) => (
                    <TableCell
                      id="paymentCell"
                      key={idx}
                      align="center"
                      width={tableHead.width}
                      style={{
                        color: "white",
                      }}
                    >
                      {t(tableHead.value)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {postPaymentBillings.slice(postPaymentHistoryPage * rowsPerPostPaymentHistoryPage, postPaymentHistoryPage * rowsPerPostPaymentHistoryPage + rowsPerPostPaymentHistoryPage).map((data, idx) => (
                  <TableRow
                    key={data.cardName + data.id}
                    className={classes.tableRow}
                    style={{
                      background: idx % 2 === 0 ? currentTheme.tableRow1 : currentTheme.tableRow2,
                    }}
                  >
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {postPaymentHistoryPage * rowsPerPostPaymentHistoryPage + idx + 1}
                    </TableCell>
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {data.PCD_PAY_YEAR}.{data.PCD_PAY_MONTH - 1}
                    </TableCell>
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {data.created_at === null ? "" : convertToLocalDateStr(data.created_at)}
                    </TableCell>
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {data.PCD_PAY_TYPE === "prepaid" ? t("Prepaid Recharge") : t("Postpay Payment")}
                    </TableCell>
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {data.currency === "usd" && "$"}
                      {data.price !== null && data.price.toLocaleString()}
                      {data.currency === "krw" && t("KRW")}
                    </TableCell>
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {data.PCD_PAY_RST === "success" ? t("Approval") : t("실패")}{" "}
                    </TableCell>
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {data.PCD_PAY_RST === "success" ? `${data.PCD_PAY_CARDNUM}(${data.PCD_PAY_CARDNAME})` : ""}{" "}
                    </TableCell>
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {data.PCD_PAY_TYPE === "prepaid" ? (
                        <span>{t("Check details")}</span>
                      ) : (
                        <a href="#" onClick={(e) => handleChange(e, data.PCD_PAY_YEAR, data.PCD_PAY_MONTH)} id="usagehistory">
                          {t("Check details")}
                        </a>
                      )}
                    </TableCell>
                    <TableCell id="paymentCell" align="center" style={{ color: "white" }}>
                      {data.PCD_PAY_RST === "success" ? (
                        <a href={data.PCD_PAY_CARDRECEIPT} target="_blank">
                          {t("See receipt")}
                        </a>
                      ) : (
                        ""
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={postPaymentBillings.length}
              rowsPerPage={rowsPerPostPaymentHistoryPage}
              page={postPaymentHistoryPage}
              backIconButtonProps={{
                "aria-label": "previous page",
              }}
              nextIconButtonProps={{
                "aria-label": "next page",
              }}
              onChangePage={changePostPaymentHistoryPage}
              onChangeRowsPerPage={changeRowsPerPostPaymentHistoryPage}
            />
          </div>
        ) : (
          <div style={{ fontSize: 16 }}>{user.language === "ko" ? "후불결제 내역이 없습니다." : "No history"}</div>
        )}
      </Grid>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={cardRequestModalOpen}
        className={classes.modalContainer}
        onClose={() => {
          setCardRequestModalOpen(false);
        }}
      >
        <div className={classes.defaultModalContent} style={{ width: "500px" }}>
          <h6 id="cardNeedText">{t("You can continue to use the card after registering it on the account management page.")}</h6>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <>
              {user.language === "ko" ? (
                <Button id="registCard" shape="greenOutlined" onClick={renderCardInfoInKR}>
                  {t("Go to card registration")}
                </Button>
              ) : (
                eximbayParams &&
                eximbayParamsNames &&
                eximbayUrl && (
                  <form name="regForm" method="post" action={eximbayUrl}>
                    {eximbayParamsNames.map((name) => (
                      <input type="hidden" name={name} value={eximbayParams[name]} />
                    ))}
                    <Button id="registCard_en" type="submit" shape="greenOutlined">
                      {t("Go to card registration")}
                    </Button>
                  </form>
                )
              )}
            </>
          </div>
        </div>
      </Modal>
    </Container>
  );
};

export default React.memo(Payment);
