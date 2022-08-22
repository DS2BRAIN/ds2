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
                {t("Pre-labeling is required. Labeling can be done through object recognition labeling in the main menu.")}
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
              <b>{t("Generate code")}</b>
              <div>{t("Generate ready-to-run deep learning development code in Jupyter environment.")}</div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <b>{t("Higher accuracy")}</b>
              <div>
                {t("AI models with higher accuracy are prioritized when generating models.")} <br /> {t("However, training can take a long time.")}
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
              <div>{t("Set and use your preferred machine learning/deep learning library and hyperparameter.")}</div>
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
              <div className={classes.modelStatusFont}>{t("Number of models pending. Training will start again.")}</div>
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
            <div>{t("Check whether to use more detailed data validation with the artificial intelligence created through the project.")}</div>
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
              <div>{t("To utilize a specific GPU, select and train with the desired GPU.")}</div>
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
