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
  const dataset =
    fileurl+"asset/front/img/tip1_dataset_connector.jpeg";
  const dataset_en =
    fileurl+"asset/front/img/tip1_dataset_connector_en.jpeg";
  const labelingAI =
    fileurl+"asset/front/img/tip2_labeling_feature.jpeg";
  const labelingAI_en =
    fileurl+"asset/front/img/tip2_labeling_feature_en.jpeg";
  const clickAI =
    fileurl+"asset/front/img/tip3_clickai_project.jpeg";
  const clickAI_en =
    fileurl+"asset/front/img/tip3_clickai_project_en.jpeg";
  const skyhubAI =
    fileurl+"asset/front/img/tip4_skyhub_deploy.jpeg";
  const marketPlace =
    fileurl+"asset/front/img/tip5_market_selling.jpeg";
  const marketPlace_en =
    fileurl+"asset/front/img/tip5_market_selling_en.jpeg";
  const labelingAI2 =
    fileurl+"asset/front/img/tip6_labeling_feature_2.jpeg";
  const labelingAI2_en =
    fileurl+"asset/front/img/tip6_labeling_feature_2_en.jpeg";

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
                {t(
                  "데이터를 직접 업로드하거나 DB 연동 불러오기를 통해 기존 데이터를 간편하게 학습용 데이터셋으로 구성해 보세요!"
                )}
              </span>
            </p>
            <div
              className={classes.imageContainer}
              style={{ marginBottom: "20px" }}
            >
              <img
                src={lang === "ko" ? dataset : dataset_en}
                alt={t("Preparing image. Please wait.")}
                className={classes.image}
              />
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
                {t(
                  "최초 10개의 수동 라벨링 학습을 시작으로 Auto-Labeling 결과물의 검수/보정 및 재학습을 반복적으로 진행하여 LABELING AI의 성능을 더욱 높혀보세요!"
                )}
              </span>
            </p>
            <div
              className={classes.imageContainer}
              style={{ marginBottom: "20px" }}
            >
              <img
                src={lang === "ko" ? labelingAI : labelingAI_en}
                alt={t("Preparing image. Please wait.")}
                className={classes.image}
              />
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
                {t(
                  "데이터 업로드 이후 3일 이내에 클라우드 학습서버에서 개발된 인공지능 모델을 확인하실 수 있습니다."
                )}
              </span>
            </p>
            <div
              className={classes.imageContainer}
              style={{ marginBottom: "20px" }}
            >
              <img
                src={lang === "ko" ? clickAI : clickAI_en}
                alt={t("Preparing image. Please wait.")}
                className={classes.image}
              />
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
                {t(
                  "DS2.ai의 외부에서 별도 개발한 인공지능 또한 SKYHUB AI를 활용하여 배포 및 관리해 보세요!"
                )}
              </span>
            </p>
            <div
              className={classes.imageContainer}
              style={{ marginBottom: "20px" }}
            >
              <img
                src={skyhubAI}
                alt={t("Preparing image. Please wait.")}
                className={classes.image}
              />
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
                {t(
                  "직접 만든 우수한 인공지능을 AI Market을 통해 간편하게 판매하고 수익을 창출해보세요!"
                )}
              </span>
            </p>
            <div
              className={classes.imageContainer}
              style={{ marginBottom: "20px" }}
            >
              <img
                src={lang === "ko" ? marketPlace : marketPlace_en}
                alt={t("Preparing image. Please wait.")}
                className={classes.image}
              />
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
                {t(
                  "대시보드를 통해 진행중인 라벨링 프로젝트의 작업현황을 한 눈에 확인하고 관리할 수 있습니다."
                )}
              </span>
            </p>
            <div
              className={classes.imageContainer}
              style={{ marginBottom: "20px" }}
            >
              <img
                src={lang === "ko" ? labelingAI2 : labelingAI2_en}
                alt={t("Preparing image. Please wait.")}
                className={classes.image}
              />
            </div>
          </div>
        );
    }
  };

  return <div>{renderPage()}</div>;
};

export default React.memo(Tip);
