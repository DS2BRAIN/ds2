import React from "react";
import "assets/intro/assets/bootstrap/css/bootstrap.min.css";
import "assets/intro/assets/fonts/font-awesome.min.css";
import "assets/intro/assets/css/blogPost.css";
import "assets/intro/assets/css/cardgroup.css";
import "assets/intro/assets/css/consulting.css";
import "assets/intro/assets/css/consume.css";
import "assets/intro/assets/css/Faq-by-pomdre.css";
import "assets/intro/assets/css/Footer-Clean-1.css";
import "assets/intro/assets/css/Footer-Clean.css";
import "assets/intro/assets/css/icon.css";
import "assets/intro/assets/css/images.css";
import "assets/intro/assets/css/industryai.css";
import "assets/intro/assets/css/Labeling-tabs.css";
import "assets/intro/assets/css/labeling.css";
import "assets/intro/assets/css/marketlist.css";
import "assets/intro/assets/css/marketplace-1.css";
import "assets/intro/assets/css/Minimal-tabs.css";
import "assets/intro/assets/css/modeling.css";
import "assets/intro/assets/css/nav-sub.css";
import "assets/intro/assets/css/Navigation-Clean.css";
import "assets/intro/assets/css/Navigation-with-Button.css";
import "assets/intro/assets/css/pricing.css";
import "assets/intro/assets/css/styles.css";
import "assets/intro/assets/css/success-story.css";
import "assets/intro/assets/css/Vertical-menu.css";
import "assets/intro/assets/css/Vertical-tabs.css";
import introStyles from "assets/intro/assets/intro.js";
import codeDatasetSDKPythonImg from "assets/intro/assets/img/code/code_dataset_SDKPython.png";
import { fileurl } from "controller/api";
import Button from "components/CustomButtons/Button";

const DataconnectorIntro = (props) => {
  const classes = introStyles();
  const { t } = props.useTranslation();
  const userLang = props.userLang;

  const closeIntro = () => {
    props.setIntroOn(false);
    props.setIntroOffClicked(true);
  };

  const Img01_dataset_connector = userLang === "ko" ? fileurl + "asset/img_dataset_connector.jpg" : fileurl + "asset/img_dataset_connector_en.jpg";
  const Img02_dataset_public = fileurl + "asset/img_dataset_public.jpg";
  const Img03_dataset_preprocessing = userLang === "ko" ? fileurl + "asset/img_dataset_preprocessing.jpg" : fileurl + "asset/img_dataset_preprocessing_en.jpg";
  const Img04_retraining = fileurl + "asset/img_retraining.jpg";
  const Img05_codeSDKPython = codeDatasetSDKPythonImg;

  const ImgFrame01_dataset_connector = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center">
      <img class="img-fluid shadow rounded" src={Img01_dataset_connector} />
    </div>
  );

  const Text01_dataset_connector = (
    <div class="col-12 col-lg-4 col-xl-5 d-flex justify-content-center">
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Easy integration of existing data")}
        </h4>
        <p className={classes.P}>{t("데이터의 직접 업로드, DB 연동을 통한 불러오기를 통해 기존 데이터를 학습용 데이터셋으로 구성할 수 있습니다.")}</p>
        <p class="justify-content-center align-items-xl-center" style={{ fontSize: "12px" }}>
          * {t("To import your data through DB server, please submit an inquiry.")}
          <br />
        </p>
      </div>
    </div>
  );

  const ImgFrame02_dataset_public = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center">
      <img class="img-fluid shadow rounded" src={Img02_dataset_public} />
    </div>
  );

  const Text02_dataset_public = (
    <div class="col-12 col-lg-4 col-xl-5 d-flex justify-content-center">
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Composition of training data using public data")}
        </h4>
        <p className={classes.P}>
          {t("기존 보유 데이터가 없더라도 Public Data로 바로 학습용 데이터셋을 구성하고 인공지능 개발에 활용할 수 있습니다.")}
          <br />
        </p>
      </div>
    </div>
  );

  const ImgFrame03_dataset_preprocessing = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center">
      <img class="img-fluid" src={Img03_dataset_preprocessing} />
    </div>
  );

  const Text03_dataset_preprocessing = (
    <div class="col-12 col-lg-4 col-xl-5 d-flex justify-content-center">
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Easy to configure training dataset")}
        </h4>
        <p className={classes.P}>
          {t("기존 데이터를 활용하거나, Public Data를 활용할 때 복수의 데이터를 결합하여 학습용 데이터셋을 구축하거나 자동 데이터 전처리 기능을 활용하여 기본적인 전처리 작업을 수행할 수 있습니다.")}
        </p>
      </div>
    </div>
  );

  const ImgFrame04_retraining = (
    <div class="col-12 col-lg-5 col-xl-6" style={{ padding: "15px" }}>
      <img class="img-fluid" src={Img04_retraining} />
    </div>
  );

  const Text04_retraining = (
    <div class="col-12 col-lg-4 col-xl-5 d-flex justify-content-center">
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Data for re-training for the advancement of artificial intelligence")}
        </h4>
        <p class="justify-content-center align-items-xl-center">
          {t("인공지능을 지속적으로 고도화할 수 있도록 인공지능 운영을 통해 발생하는 데이터를 초기 학습 데이터에 추가하고 재학습할 수 있도록 축적합니다.")}
          <br />
        </p>
        <p class="justify-content-center align-items-xl-center" style={{ fontSize: "12px" }}>
          *{t("인공지능 재학습을 위한 데이터 축적은 SKYHUB AI를 활용하는 경우에만 사용할 수 있습니다.")}
          <br />
        </p>
      </div>
    </div>
  );

  const ImgFrame05_codeSDKPython = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center">
      <img class="img-fluid" src={Img05_codeSDKPython} />
    </div>
  );

  const Text05_codeSDKPython = (
    <div class="col-12 col-lg-5 d-flex justify-content-start justify-content-lg-center" style={{ padding: "8px 24px" }}>
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("SDK support for convenient programming development")}
        </h4>
        <p className={classes.P}>
          {t("DS2.ai의 MLOps를 위한 데이터 파이프라인을 Python 코드로 구축할 수 있습니다. SDK를 통해 데이터의 업로드부터 라벨링 생성, 인공지능 학습 및 배포까지 모든 기능을 사용할 수 있습니다.")}
        </p>
      </div>
    </div>
  );

  return (
    <div className={classes.Body}>
      <section class="marketBlock top">
        <div class="container">
          <div class="row rowTop">
            <div class="col-12 text-center">
              <h1 id="dataIntroOpenText" className={classes.H1}>
                {t("An easy way to organize your training dataset")}
              </h1>
              <p
                className={classes.P}
                style={{
                  fontSize: "20px",
                  opacity: "0.80",
                  lineHeight: "2em",
                  color: "var(--bg)",
                }}
              >
                {t("DS2 DATASET을 활용하면 인공지능 개발 준비단계인 학습용 데이터셋 구성을 간편하게 수행할 수 있습니다.")}
                <br />
              </p>
              <Button id="dataintro_top_start_btn" shape="blueContained" size="xl" onClick={closeIntro}>
                {t("Start Service")}
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className={classes.Section} style={{ marginTop: "0" }}>
        <div class="container d-none d-lg-block bodyContainer" style={{ marginTop: "48px" }}>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "10%" }}>
            {Text01_dataset_connector}
            {ImgFrame01_dataset_connector}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "10%" }}>
            {ImgFrame02_dataset_public}
            {Text02_dataset_public}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "10%" }}>
            {Text03_dataset_preprocessing}
            {ImgFrame03_dataset_preprocessing}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "10%" }}>
            {ImgFrame04_retraining}
            {Text04_retraining}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "10%" }}>
            {Text05_codeSDKPython}
            {ImgFrame05_codeSDKPython}
          </div>
        </div>
        <div class="container d-block d-lg-none bodyContainer" style={{ marginTop: "48px" }}>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "20%" }}>
            {Text01_dataset_connector}
            {ImgFrame01_dataset_connector}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "20%" }}>
            {Text02_dataset_public}
            {ImgFrame02_dataset_public}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "20%" }}>
            {Text03_dataset_preprocessing}
            {ImgFrame03_dataset_preprocessing}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "20%" }}>
            {Text04_retraining}
            {ImgFrame04_retraining}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "10%" }}>
            {Text05_codeSDKPython}
            {ImgFrame05_codeSDKPython}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <Button id="dataintro_bottom_start_btn" shape="blueContained" size="xl" onClick={closeIntro}>
            {t("Start Service")}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default DataconnectorIntro;
