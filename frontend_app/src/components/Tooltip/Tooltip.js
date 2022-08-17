import React from "react";
import CloseIcon from "@material-ui/icons/Close";
import currentTheme from "assets/jss/custom.js";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fileurl } from "controller/api";
const Tooltip = ({ tooltipCategory, closeTooltipModalOpen }) => {
  const classes = currentTheme();
  const { t } = useTranslation();
  const { user, projects } = useSelector((state) => ({ user: state.user, projects: state.projects }), []);

  const renderTooltip = () => {
    switch (tooltipCategory) {
      case "method":
        return (
          <>
            <div className={classes.title} style={{ marginBottom: "20px" }}>
              {t("Training Method")}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <b>{t("If you upload a .csv file")}</b>
              <div>
                - {t("Structured Data Regression")} : {t("Categories and continuous values are automatically classified.")}{" "}
              </div>
              <div>
                - {t("Structured Data Category Classification")} : {t("Categories and similar non-continuous values are predicted.")}
              </div>
              <div>
                - {t("Structured Data Regression")} : {t("Continuous numeric values are predicted.")}
              </div>
              <div>
                - {t("Natural Language Processing (NLP)")} : {t("텍스트의 감정을 분석합니다.")}
              </div>
              <div>
                - {t("Recommendation system (matrix)")} : {t("We recommend products by analyzing the association between users.")}
              </div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <b>{t("If you upload a .zip file")}</b>
              <div>
                - {t("Image Classification")} : {t("카테고리 별로 분류된 이미지를 활용하여 이미지의 카테고리를 예측합니다.")}{" "}
              </div>
              <div>
                - {t("Object Detection")} : {t("이미지 내 여러 물체에 대해 어떤 물체인지와 위치를 분류하고 예측합니다.")}
                {t("사전 라벨링 작업이 필요합니다. 라벨링은 메인메뉴에 물체인식 라벨링을 통해서 작업하실 수 있습니다.")}
              </div>
              {/* <div>
                - GAN :{" "}
                {t(
                  "서로 다른 두 카테고리 이미지를 활용하여 이미지를 변형할 수 있습니다."
                )}{" "}
                (E.g.{t("horse→zebra, summer→winter")})
              </div> */}
            </div>
          </>
        );
      case "option":
        return (
          <>
            <div className={classes.title} style={{ marginBottom: "20px" }}>
              {t("Preferred Method")}
            </div>
            <div style={{ marginBottom: "20px" }}>
              <b>{t("Generate Code")}</b>
              <div>{t("주피터 환경에서 바로 실행이 가능한 딥러닝 개발 코드를 생성합니다.")}</div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <b>{t("Higher accuracy")}</b>
              <div>
                {t("인공지능 모델 중 정확도가 높은 모델을 위주로  모델을 생성합니다.")} <br /> {t("However, training can take a long time.")}
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <b>{t("Faster training speed")}</b>
              <div>
                {t("Fast AI models are prioritized during model generation.")} <br /> {t("However, the accuracy may be lower.")}
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <b>{t("Manual setting")}</b>
              <div>{t("원하는 머신러닝/딥러닝 라이브러리와 하이퍼파라미터를 직접 설정하여 사용할 수 있습니다.")}</div>
            </div>
          </>
        );
      case "predictValue":
        return (
          <>
            <div className={classes.title} style={{ marginBottom: "20px" }}>
              {t("Target Variable")}
            </div>
            <div>{t("Select the final value you want to predict.")}</div>
          </>
        );
      case "modelStatus":
        return (
          <div>
            <div className={classes.modelStatusContainer}>
              <div className={classes.modelStatusImgContainer} style={user.language === "en" ? { minWidth: "140px" } : { minWidth: "60px" }}>
                <img src={fileurl + "asset/front/img/modelIcon/modelError.png"} className={classes.modelStatusImg} />
                <b>{t("Error")}</b>
              </div>
              <div className={classes.modelStatusFont}>{t("Number of models where errors occurred during training.")}</div>
            </div>
            <div className={classes.modelStatusContainer}>
              <div className={classes.modelStatusImgContainer} style={user.language === "en" ? { minWidth: "140px" } : { minWidth: "60px" }}>
                <img src={fileurl + "asset/front/img/modelIcon/modelProcessing.png"} className={classes.modelStatusImg} />
                <b>{t("Train")}</b>
              </div>
              <div className={classes.modelStatusFont}>{t("Number of models with training currently in progress.")}</div>
            </div>
            <div className={classes.modelStatusContainer}>
              <div className={classes.modelStatusImgContainer} style={user.language === "en" ? { minWidth: "140px" } : { minWidth: "60px" }}>
                <img src={fileurl + "asset/front/img/modelIcon/modelPause.png"} className={classes.modelStatusImg} />
                <b>{t("Pending")}</b>
              </div>
              <div className={classes.modelStatusFont}>{t("인공지능 학습 순서 상 대기 중인 모델의 수를 표시합니다. 잠시 후 학습은 재게될 예정입니다.")}</div>
            </div>
            <div className={classes.alignCenterContainer}>
              <div className={classes.modelStatusImgContainer} style={user.language === "en" ? { minWidth: "140px" } : { minWidth: "60px" }}>
                <img src={fileurl + "asset/front/img/modelIcon/modelDone.png"} className={classes.modelStatusImg} />
                <b>{t("Completed")}</b>
              </div>
              <div className={classes.modelStatusFont}>{t("Number of models that have completed training.")}</div>
            </div>
          </div>
        );
      case "trainingPriority":
        return (
          <>
            <div className={classes.title} style={{ marginBottom: "20px" }}>
              {t("AI Training Priority")}
            </div>
            <div>{t("Select whether or not you want to start training for this project first.")}</div>
          </>
        );
      case "isVerify":
        return (
          <>
            <div className={classes.title} style={{ marginBottom: "20px" }}>
              {t("Whether to use the validation function")}
            </div>
            <div>{t("해당 프로젝트를 통해 만든 인공지능으로 더 상세한 데이터 검증을 사용할지 여부를 체크합니다.")}</div>
          </>
        );
      case "algorithm":
        return (
          <>
            <div className={classes.title} style={{ marginBottom: "20px" }}>
              {t("Algorithm Option")}
            </div>
            <div style={{ marginBottom: "20px" }}>
              <div>{t("Please select a library in which to train.")}</div>
            </div>
          </>
        );
      case "device":
        return (
          <>
            <div className={classes.title} style={{ marginBottom: "20px" }}>
              {t("Training GPU Option")}
            </div>
            <div style={{ marginBottom: "20px" }}>
              <div>{t("특정 GPU 로 학습을 지정하고 싶은 경우에 원하는 GPU 로 선택하여 학습할 수 있습니다.")}</div>
            </div>
          </>
        );

      default:
        return;
    }
  };

  return (
    <div className={classes.modalContent}>
      <div className={classes.alignRight}>
        <CloseIcon className={classes.closeImg} onClick={closeTooltipModalOpen} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: "160px",
          padding: "0 16px 24px",
        }}
      >
        {renderTooltip()}
      </div>
    </div>
  );
};

export default React.memo(Tooltip);
