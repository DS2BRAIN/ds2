import React, { useState, useEffect, useRef } from "react";
import { currentTheme } from "assets/jss/material-dashboard-react.js";
import BorderColorIcon from "@material-ui/icons/BorderColor";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import Cookies from "helpers/Cookies";

import { useTranslation } from "react-i18next";
import { currentThemeColor } from "assets/jss/custom";
import { fileurl } from "controller/api";
const styles = {
  canvas: {
    boxShadow: "0 0 2px #111",
    borderRadius: "250px",
  },
  image: {
    position: "absolute",
    width: "auto",
    height: "100%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // maxWidth: "720px",
  },
  container: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignitems: "center",
    color: "#FFFFFF",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "300px",
    overflow: "hidden",
  },
};

const useStyles = makeStyles(styles);

const Tip = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { user } = useSelector((state) => ({ user: state.user }), []);
  const [pageNumber, setPageNumber] = useState(0);
  let lang = user.language ? user.language : Cookies.getCookie("language");
  const dataset = fileurl + "asset/front/img/tip1_dataset_connector.jpeg";
  const dataset_en = fileurl + "asset/front/img/tip1_dataset_connector_en.jpeg";
  const labelingAI = fileurl + "asset/front/img/tip2_labeling_feature.jpeg";
  const labelingAI_en = fileurl + "asset/front/img/tip2_labeling_feature_en.jpeg";
  const clickAI = fileurl + "asset/front/img/tip3_clickai_project.jpeg";
  const clickAI_en = fileurl + "asset/front/img/tip3_clickai_project_en.jpeg";
  const skyhubAI = fileurl + "asset/front/img/tip4_skyhub_deploy.jpeg";
  const marketPlace = fileurl + "asset/front/img/tip5_market_selling.jpeg";
  const marketPlace_en = fileurl + "asset/front/img/tip5_market_selling_en.jpeg";
  const labelingAI2 = fileurl + "asset/front/img/tip6_labeling_feature_2.jpeg";
  const labelingAI2_en = fileurl + "asset/front/img/tip6_labeling_feature_2_en.jpeg";

  useEffect(() => {
    if (user.me) {
      lang = user.me.lang;
    }
  }, [user.me]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextNumber = (pageNumber + 1) % 6;
      setPageNumber(nextNumber);
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [pageNumber]);

  const renderPage = () => {
    switch (pageNumber) {
      case 0:
        return (
          <div className={classes.container}>
            <p>
              <BorderColorIcon fontSize="large" />
              <b
                style={{
                  fontSize: "2rem",
                  margin: "0 12px",
                  color: currentThemeColor.textWhite87,
                }}
              >
                TIP {pageNumber + 1}.
              </b>
              <span
                style={{
                  color: currentThemeColor.textWhite87,
                  wordBreak: "keep-all",
                }}
              >
                {t("Existing data can be configured as a data set for training by directly uploading data and importing it through DB server.")}
              </span>
            </p>
            <div className={classes.imageContainer} style={{ marginBottom: "20px" }}>
              <img src={lang === "ko" ? dataset : dataset_en} alt={t("Preparing image. Please wait.")} className={classes.image} />
            </div>
          </div>
        );
      case 1:
        return (
          <div className={classes.container}>
            <p>
              <BorderColorIcon fontSize="large" />
              <b
                style={{
                  fontSize: "2rem",
                  margin: "0 12px",
                  color: currentThemeColor.textWhite87,
                }}
              >
                TIP {pageNumber + 1}.
              </b>
              <span
                style={{
                  color: currentThemeColor.textWhite87,
                  wordBreak: "keep-all",
                }}
              >
                {t("Starting with the first 10 manual labeling, Improve your LABELING AI model performance by repeating the inspection/correction and re-training Auto-Labeling outputs.")}
              </span>
            </p>
            <div className={classes.imageContainer} style={{ marginBottom: "20px" }}>
              <img src={lang === "ko" ? labelingAI : labelingAI_en} alt={t("Preparing image. Please wait.")} className={classes.image} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className={classes.container}>
            <p>
              <BorderColorIcon fontSize="large" />
              <b
                style={{
                  fontSize: "2rem",
                  margin: "0 12px",
                  color: currentThemeColor.textWhite87,
                }}
              >
                TIP {pageNumber + 1}.
              </b>
              <span
                style={{
                  color: currentThemeColor.textWhite87,
                  wordBreak: "keep-all",
                }}
              >
                {t("From the time you uploaded the data, you can check your developed AI model on a cloud training server with in only 3 days.")}
              </span>
            </p>
            <div className={classes.imageContainer} style={{ marginBottom: "20px" }}>
              <img src={lang === "ko" ? clickAI : clickAI_en} alt={t("Preparing image. Please wait.")} className={classes.image} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className={classes.container}>
            <p>
              <BorderColorIcon fontSize="large" />
              <b
                style={{
                  fontSize: "2rem",
                  margin: "0 12px",
                  color: currentThemeColor.textWhite87,
                }}
              >
                TIP {pageNumber + 1}.
              </b>
              <span
                style={{
                  color: currentThemeColor.textWhite87,
                  wordBreak: "keep-all",
                }}
              >
                {t("Artificial intelligence developed outside of DS2.ai can also be deployed or managed by using SKYHUB AI.")}
              </span>
            </p>
            <div className={classes.imageContainer} style={{ marginBottom: "20px" }}>
              <img src={skyhubAI} alt={t("Preparing image. Please wait.")} className={classes.image} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className={classes.container}>
            <p>
              <BorderColorIcon fontSize="large" />
              <b
                style={{
                  fontSize: "2rem",
                  margin: "0 12px",
                  color: currentThemeColor.textWhite87,
                }}
              >
                TIP {pageNumber + 1}.
              </b>
              <span
                style={{
                  color: currentThemeColor.textWhite87,
                  wordBreak: "keep-all",
                }}
              >
                {t("All artificial intelligence developed through DS2.ai Studio can be commercialized, sold, and monetized through the AI MARKET by simply selecting the desired selling price and sales method.")}
              </span>
            </p>
            <div className={classes.imageContainer} style={{ marginBottom: "20px" }}>
              <img src={lang === "ko" ? marketPlace : marketPlace_en} alt={t("Preparing image. Please wait.")} className={classes.image} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className={classes.container}>
            <p>
              <BorderColorIcon fontSize="large" />
              <b
                style={{
                  fontSize: "2rem",
                  margin: "0 12px",
                  color: currentThemeColor.textWhite87,
                }}
              >
                TIP {pageNumber + 1}.
              </b>
              <span
                style={{
                  color: currentThemeColor.textWhite87,
                  wordBreak: "keep-all",
                }}
              >
                {t("You can check and manage work status of your labeling projects at a glance through the dashboard.")}
              </span>
            </p>
            <div className={classes.imageContainer} style={{ marginBottom: "20px" }}>
              <img src={lang === "ko" ? labelingAI2 : labelingAI2_en} alt={t("Preparing image. Please wait.")} className={classes.image} />
            </div>
          </div>
        );
    }
  };

  return <div>{renderPage()}</div>;
};

export default React.memo(Tip);
