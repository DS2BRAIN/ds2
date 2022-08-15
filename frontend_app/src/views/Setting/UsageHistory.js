import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import * as api from "controller/api.js";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";
import { IS_ENTERPRISE } from "variables/common";

import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import { CircularProgress, Container, Grid } from "@mui/material";
import Button from "components/CustomButtons/Button";

const UsageHistory = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isChangedPeriod, setIsChangedPeriod] = useState(false);
  const [pgPaymentDetail, setPgPaymentDetail] = useState({});
  const connectorInfo = { diskUsage: "Disk Usage" };
  const annotationInfo = {
    manuallabelingCR: "Manuallabeling Classification/Regression",
    manuallabelingOD: "Manuallabeling Object Detection",
    autolabelingCR: "Autolabeling Classification/Regression",
    autolabelingOD: "Autolabeling Object Detection",
    autolabelingKeypoint: "Autolabeling Keypoint",
    autolabelingPedestrian: "Autolabeling Transformation Detection",
    autolabelingSementic: "Autolabeling Sementic Segmentation",
    autolabelingFace: "Autolabeling Face Landmark",
    autolabelingDI: "Autolabeling De-identification",
    autolabelingOCR: "Autolabeling OCR",
  };
  const modelInfo = {
    trainingUsage: "Model Training",
    inferenceCR: "Inference Classification/Regression",
    inferenceOD: "Inference Object Detection",
    magicCode: "Magic Code",
  };
  const deployInfo = {
    usedAWSPrice: "Learning / Inference Cloud Server Rental",
  };
  const marketInfo = {
    inferenceKeypoint: "Inference Keypoint",
    inferencePedestrian: "Inference Human",
    inferenceSementic: "Inference Sementic Segmentation",
    inferenceFace: "Inference Face Landmark",
    inferenceDI: "Inference De-identification",
    inferenceOCR: "Inference OCR",
    usedMarketPrice: "Market etc.",
  };
  const depositInfo = { usedDeposit: "Used Free Deposit" };

  const yearCreatedAt = new Date(user.me?.created_at).getFullYear();
  const monthCreatedAt = new Date(user.me?.created_at).getMonth() + 1;

  useEffect(() => {
    // console.log(pgPaymentDetail);
    const url = window.location.href;
    const regex = /\?year\=(\d{4})\&month\=(\d{1,2})/;
    const result = url.match(regex);

    if (result !== null) {
      setYear(parseInt(result[1]));
      setMonth(parseInt(result[2]));
    } else {
      setYear(new Date().getFullYear());
      setMonth(new Date().getMonth() + 1);
    }

    // console.log(url, result); // null 반환
  }, []);

  useEffect(() => {
    if (!IS_ENTERPRISE) {
      (async () => {
        await setIsLoading(true);

        if (user.me) {
          await getAllBillingInfo();
        }
      })();
    }
  }, [user.me, month]);

  const getAllBillingInfo = () => {
    api
      .getPgPaymentDetail(year, month)
      .then(async (res) => {
        await setPgPaymentDetail(res.data);
        await setIsLoading(false);
        await history.push(
          `/admin/setting/usagehistory?year=${year}&month=${month}`
        );
      })
      .catch((e) => {
        dispatch(
          openErrorSnackbarRequestAction("결제 정보를 불러오는데 실패했습니다.")
        );
      });
    setIsChangedPeriod(false);
  };

  const clickPrev = () => {
    if (month === 1) {
      setYear((prev) => prev - 1);
      setMonth((prev) => prev + 11);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const clickNext = () => {
    if (month === 12) {
      setYear((prev) => prev + 1);
      setMonth((prev) => prev - 11);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  return isLoading ? (
    <div className={classes.loading}>
      <CircularProgress />
    </div>
  ) : (
    <Container
      component="main"
      maxWidth="false"
      disableGutters
      className={classes.mainCard}
    >
      <Grid
        container
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          textAlign: "center",
          padding: 10,
        }}
      >
        <Grid item xs={2}></Grid>
        <Grid item xs={8}>
          <Grid container alignItems="center">
            <Grid item xs={2}>
              <Button
                id="switch_prevmonth_btn"
                shape="white"
                size="lg"
                disabled={year === yearCreatedAt && month === monthCreatedAt}
                style={{ border: 0, fontSize: "20px" }}
                onClick={clickPrev}
              >
                {"<"}
              </Button>
            </Grid>
            <Grid item xs={8}>
              <Typography
                id="dateTime"
                variant={"body1"}
                style={{ fontSize: "20px", color: "#fff" }}
              >
                {`${year}.${month}`}
              </Typography>
              <Typography
                variant={"body1"}
                style={{ fontSize: "14px", color: currentThemeColor.textSub }}
              >
                {pgPaymentDetail
                  ? `( ${pgPaymentDetail.usedFromDate} - ${pgPaymentDetail.usedToDate} )`
                  : t("No payment information.")}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Button
                id="switch_nextmonth_btn"
                shape="white"
                size="lg"
                disabled={
                  year === new Date().getFullYear() &&
                  month === new Date().getMonth() + 1
                }
                style={{ border: 0, fontSize: "20px" }}
                onClick={clickNext}
              >
                {">"}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>
      <Grid
        container
        style={{
          width: "100%",
          display: "flex",
        }}
      >
        <hr className={classes.line} />
        <Grid item xs={12} style={{ textAlign: "center", margin: 30 }}>
          <Grid
            container
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              padding: 5,
            }}
          >
            <Grid item xs={6} style={{ textAlign: "left" }}>
              <Typography variant={"h6"} style={{ marginBottom: "16px" }}>
                {t(`${month}월 총 결제 금액`)}
              </Typography>
              <Typography style={{ color: "inherit" }}>
                {t("Card Payment Amount")}:
              </Typography>
              <Typography style={{ color: "inherit" }}>
                {t("Credit Payment Amount")}:
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ textAlign: "right" }}>
              <Typography variant={"h6"} style={{ marginBottom: "16px" }}>
                ${pgPaymentDetail ? pgPaymentDetail.usedTotalPrice : 0}
              </Typography>
              <Typography style={{ color: "inherit" }}>
                ${pgPaymentDetail ? pgPaymentDetail.usedPrice : 0}
              </Typography>
              <Typography style={{ color: "inherit" }}>
                ${pgPaymentDetail ? pgPaymentDetail.usedDeposit : 0}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              style={{
                marginTop: "8px",
                fontSize: "14px",
                textAlign: "right",
                color: "var(--mainSub)",
              }}
            >
              {pgPaymentDetail
                ? pgPaymentDetail.isPaid
                  ? "* " + t("The payment of that amount has been completed.")
                  : "* " + t("The amount to be charged will be displayed on the payment date.")
                : null}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <hr className={classes.line} />
      <Grid
        container
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          paddingTop: "20px",
        }}
      >
        <Grid item xs={12}>
          <div className={classes.title} style={{ marginBottom: 20 }}>
            {t("Detailed payment status")}
          </div>
          <div style={{ width: "100%", padding: 20 }}>
            <Typography
              variant={"body1"}
              style={{ marginBottom: 20, fontWeight: "bold", color: "#fff" }}
            >
              {t("Dataset")}
            </Typography>
            {Object.keys(connectorInfo).map((key) => (
              <Grid
                container
                key={`dataset_${key}`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  padding: 5,
                }}
              >
                <>
                  <Grid item xs={6} style={{ textAlign: "left" }}>
                    <Typography
                      variant={"body1"}
                      style={{
                        fontWeight: "bold",
                        color: currentThemeColor.textSub,
                      }}
                    >
                      {connectorInfo[key]}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} style={{ textAlign: "right" }}>
                    <Typography
                      variant={"body2"}
                      style={{ color: currentThemeColor.textSub }}
                    >
                      ${pgPaymentDetail !== null ? pgPaymentDetail[key] : 0}
                    </Typography>
                  </Grid>
                </>
              </Grid>
            ))}

            <hr
              className={classes.line}
              style={{ marginTop: 20, marginBottom: 20 }}
            />
            <Typography
              variant={"body1"}
              style={{
                marginTop: 20,
                marginBottom: 20,
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {t("Labeling")}
            </Typography>
            {Object.keys(annotationInfo).map((key) => (
              <Grid
                container
                key={`labeling_${key}`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  padding: 5,
                }}
              >
                <Grid item xs={6} style={{ textAlign: "left" }}>
                  <Typography
                    variant={"body1"}
                    style={{
                      fontWeight: "bold",
                      color: currentThemeColor.textSub,
                    }}
                  >
                    {annotationInfo[key]}
                  </Typography>
                </Grid>
                <Grid item xs={6} style={{ textAlign: "right" }}>
                  <Typography
                    variant={"body2"}
                    style={{ color: currentThemeColor.textSub }}
                  >
                    ${pgPaymentDetail !== null ? pgPaymentDetail[key] : 0}
                  </Typography>
                </Grid>
              </Grid>
            ))}

            <hr
              className={classes.line}
              style={{ marginTop: 20, marginBottom: 20 }}
            />
            <Typography
              variant={"body1"}
              style={{
                marginTop: 20,
                marginBottom: 20,
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {t("Modeling")}
            </Typography>
            {Object.keys(modelInfo).map((key) => (
              <Grid
                container
                key={`modeling_${key}`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  padding: 5,
                }}
              >
                <Grid item xs={6} style={{ textAlign: "left" }}>
                  <Typography
                    variant={"body1"}
                    style={{
                      fontWeight: "bold",
                      color: currentThemeColor.textSub,
                    }}
                  >
                    {modelInfo[key]}
                  </Typography>
                </Grid>
                <Grid item xs={6} style={{ textAlign: "right" }}>
                  <Typography
                    variant={"body2"}
                    style={{ color: currentThemeColor.textSub }}
                  >
                    ${pgPaymentDetail !== null ? pgPaymentDetail[key] : 0}
                  </Typography>
                </Grid>
              </Grid>
            ))}

            <hr
              className={classes.line}
              style={{ marginTop: 20, marginBottom: 20 }}
            />
            <Typography
              variant={"body1"}
              style={{
                marginTop: 20,
                marginBottom: 20,
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {t("Renting a custom training/inference server")}
            </Typography>
            {Object.keys(deployInfo).map((key) => (
              <Grid
                container
                key={`custom_${key}`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  padding: 5,
                }}
              >
                <Grid item xs={6} style={{ textAlign: "left" }}>
                  <Typography
                    variant={"body1"}
                    style={{
                      fontWeight: "bold",
                      color: currentThemeColor.textSub,
                    }}
                  >
                    {deployInfo[key]}
                  </Typography>
                </Grid>
                <Grid item xs={6} style={{ textAlign: "right" }}>
                  <Typography
                    variant={"body2"}
                    style={{ color: currentThemeColor.textSub }}
                  >
                    ${pgPaymentDetail !== null ? pgPaymentDetail[key] : 0}
                  </Typography>
                </Grid>
              </Grid>
            ))}

            <hr
              className={classes.line}
              style={{ marginTop: 20, marginBottom: 20 }}
            />
            <Typography
              variant={"body1"}
              style={{
                marginTop: 20,
                marginBottom: 20,
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {t("Market")}
            </Typography>
            {Object.keys(marketInfo).map((key) => (
              <Grid
                container
                key={`market_${key}`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  padding: 5,
                }}
              >
                <Grid item xs={6} style={{ textAlign: "left" }}>
                  <Typography
                    variant={"body1"}
                    style={{
                      fontWeight: "bold",
                      color: currentThemeColor.textSub,
                    }}
                  >
                    {marketInfo[key]}
                  </Typography>
                </Grid>
                <Grid item xs={6} style={{ textAlign: "right" }}>
                  <Typography
                    variant={"body2"}
                    style={{ color: currentThemeColor.textSub }}
                  >
                    ${pgPaymentDetail !== null ? pgPaymentDetail[key] : 0}
                  </Typography>
                </Grid>
              </Grid>
            ))}

            {/* <hr
              className={classes.line}
              style={{ marginTop: 20, marginBottom: 20 }}
            />
            <Typography
              variant={"body1"}
              style={{
                marginTop: 20,
                marginBottom: 20,
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {t("Free Benefits")}
            </Typography>
            {Object.keys(depositInfo).map((key) => (
              <Grid container
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  padding: 5,
                }}
              >
                <Grid item xs={6} style={{ textAlign: "left" }}>
                  <Typography
                    variant={"body1"}
                    style={{
                      fontWeight: "bold",
                      color: currentThemeColor.textSub,
                    }}
                  >
                    {depositInfo[key]}
                  </Typography>
                </Grid>
                <Grid item xs={6} style={{ textAlign: "right" }}>
                  <Typography
                    variant={"body2"}
                    style={{ color: currentThemeColor.textSub }}
                  >
                    ${pgPaymentDetail !== null ? pgPaymentDetail[key] : 0}
                  </Typography>
                </Grid>
              </Grid>
            ))} */}
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default React.memo(UsageHistory);
