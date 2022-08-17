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
import codeClickaiSDKPythonImg from "assets/intro/assets/img/code/code_clickai_SDKPython.png";
import { fileurl } from "controller/api";
import Button from "components/CustomButtons/Button";

const ProjectIntro = (props) => {
  const classes = introStyles();
  const { t } = props.useTranslation();
  const userLang = props.userLang;

  const closeIntro = () => {
    props.setIntroOn(false);
    props.setIntroOffClicked(true);
  };

  const Img02_01_customServer = fileurl + "asset/img_customServer.jpg";
  const Img02_02_clickai_jupyter = fileurl + "asset/img_clickai_jupyter.jpg";
  const Img02_03_clickai_magiccode = fileurl + "asset/img_clickai_magiccode.jpg";
  const Img03_clickai_automl_1 = userLang === "ko" ? fileurl + "asset/img_clickai_automl_1.jpg" : fileurl + "asset/img_clickai_automl_1_en.jpg";
  const Img03_clickai_automl_1_mobile = userLang === "ko" ? fileurl + "asset/img_clickai_automl_1_mobile.jpg" : fileurl + "asset/img_clickai_automl_1_en_mobile.jpg";
  const Img04_clickai_project = fileurl + "asset/img_clickai_project.jpg";
  const Img05_dataset_preprocessing = userLang === "ko" ? fileurl + "asset/img_dataset_preprocessing.jpg" : fileurl + "asset/img_dataset_preprocessing_en.jpg";
  const Img06_clickai_modelist = fileurl + "asset/img_clickai_modellist.jpg";
  const Img07_serviceapp = userLang === "ko" ? fileurl + "asset/img_serviceapp.jpg" : fileurl + "asset/img_serviceapp_en.jpg";
  const Img08_codeSDKPython = codeClickaiSDKPythonImg;
  const Img09_01_clickai_consulting_1 = fileurl + "asset/img_clickai_consulting_1.jpg";
  const Img09_02_clickai_consulting_2 = userLang === "ko" ? fileurl + "asset/img_clickai_consulting_2.jpg" : fileurl + "asset/img_clickai_consulting_2_en.jpg";
  const Img09_03_clickai_consulting_3 = userLang === "ko" ? fileurl + "asset/img_clickai_consulting_3.jpg" : fileurl + "asset/img_clickai_consulting_3_en.jpg";
  const Img10_01_icon_clickaitabular = fileurl + "asset/icon_clickaitabular.jpg";
  const Img10_02_icon_clickaitimeseries = fileurl + "asset/icon_clickaitimeseries.jpg";
  const Img10_03_icon_clickaivision = fileurl + "asset/icon_clickaivision.jpg";
  const Img10_04_icon_clickaitextvoice = fileurl + "asset/icon_clickaitextvoice.jpg";

  const ImgFrame04_clickai_project = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center">
      <img class="img-fluid rounded" src={Img04_clickai_project} />
    </div>
  );

  const Text04_clickai_project = (
    <div class="col-12 col-lg-4 col-xl-5 d-flex justify-content-center">
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Rapid development of AI models within 3 days")}
          <br />
        </h4>
        <p className={classes.P}>{t("데이터 업로드만으로도 클라우드 학습 서버에서 모델을 개발하기에 최소 3일 이내에 인공지능 모델 결과를 확인할 수 있습니다.")}</p>
      </div>
    </div>
  );

  const ImgFrame05_dataset_preprocessing = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center">
      <img class="img-fluid rounded" src={Img05_dataset_preprocessing} />
    </div>
  );

  const Text05_dataset_preprocessing = (
    <div class="col-12 col-lg-4 col-xl-5 d-flex justify-content-center">
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Automate basic data preprocessing")}
        </h4>
        <p className={classes.P}>{t("데이터 공백값 혹은 비식별화, 일괄치환 등 기본적인 데이터 전처리를 간편하게 수행할 수 있습니다.")}</p>
      </div>
    </div>
  );

  const ImgFrame06_clickai_modelist = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center">
      <img class="img-fluid rounded" src={Img06_clickai_modelist} />
    </div>
  );

  const Text06_clickai_modelist = (
    <div class="col-12 col-lg-4 col-xl-5 d-flex justify-content-center">
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Verified accuracy of artificial intelligence")}
          <br />
        </h4>
        <p className={classes.P}>
          {t("하나의 데이터셋에 대하여 최대 100여 개의 인공지능 모델을 자동 개발하고 검증할 수 있기에 높은 수준의 인공지능 정확도를 도출할 수 있습니다.")}
          <br />
        </p>
      </div>
    </div>
  );

  const ImgFrame07_serviceapp = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center" style={{ margin: "20px 0" }}>
      <img class="img-fluid rounded" src={Img07_serviceapp} />
    </div>
  );

  const Text07_serviceapp = (
    <div class="col-12 col-lg-4 col-xl-5 d-flex justify-content-center" style={{ padding: "8px 24px" }}>
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Easy deployment and sharing of service apps")}
        </h4>
        <p className={classes.P}>{t("개발된 인공지능은 API만으로 바로 배포하고 서비스에 적용할 수 있습니다. 또한, 별도의 서비스 연동 없이 서비스앱 공유하기를 통해 URL만으로 인공지능을 웹서비스화할 수 있습니다.")}</p>
      </div>
    </div>
  );

  const ImgFrame08_codeSDKPython = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center" style={{ margin: "20px 0" }}>
      <img class="img-fluid rounded" src={Img08_codeSDKPython} />
    </div>
  );

  const Text08_codeSDKPython = (
    <div class="col-12 col-lg-5 d-flex justify-content-start justify-content-lg-center" style={{ margin: "20px 0" }}>
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("SDK support for convenient programming development")}
        </h4>
        <p className={classes.P} style={{ marginBottom: "8px" }}>
          {t("DS2.ai의 MLOps를 위한 데이터 파이프라인을 Python 코드로 구축할 수 있습니다. SDK를 통해 데이터의 업로드부터 라벨링 생성, 인공지능 학습 및 배포까지 모든 기능을 사용할 수 있습니다.")}
        </p>
      </div>
    </div>
  );

  return (
    <div className={classes.Body}>
      <section class="marketBlock top">
        <div class="container">
          <div class="row justify-content-center rowTop">
            <div class="col-12 text-center">
              <h1 className={classes.H1}>
                {t("Convenient way to develop AI")}
                <br />
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
                {t("코딩없이 한 번의 클릭으로 인공지능을 개발할 수 있습니다. 인공지능 자동개발 솔루션 CLICK AI와 더욱 다양한 미래의 가능성을 열어보세요.")}
                <br />
              </p>
              <Button id="projectintro_top_start_btn" shape="blueContained" size="xl" onClick={closeIntro}>
                {t("Start Service")}
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className={classes.Section}>
        <div class="container bodyContainer">
          <div class="row justify-content-center align-items-center">
            <div class="col-12 col-lg-12 d-flex justify-content-center" style={{ marginBottom: "36px" }}>
              <div class="text-center" style={{ marginBottom: "24px" }}>
                <h2 className={classes.H2} style={{ marginBottom: "16px", color: "#525557" }}>
                  {t("Simpler for experts, easier for nonexperts")}
                </h2>
                <p className={classes.P}>{t("CLICK AI는 3가지 방식 중 적합한 방식을 선택하여 인공지능을 개발할 수 있도록 제공합니다.")}</p>
              </div>
            </div>
          </div>
          <div class="row justify-content-center align-items-start small">
            <div class="col-10 col-lg-4" style={{ marginBottom: "24px" }}>
              <div class="text-center modelingComparison">
                <div>
                  <h5 className={classes.H5}>{t("Custom training")}</h5>
                </div>
                <div class="modelingComparisonContent">
                  <p className={classes.P}>{t("원하는 성능의 학습서버를 임대하여 Jupyter 환경에서 직접 인공지능 코딩 개발")}</p>
                  <ul class="text-left" style={{ listStyle: "none", paddingLeft: "0px" }}>
                    <li className={classes.Li}>
                      <i class="fa fa-check"></i>
                      <span>{t("Tune Algorithms freely")}</span>
                    </li>
                    <li className={classes.Li}>
                      <i class="fa fa-check"></i>
                      <span>{t("Set up customized servers for your budget")}</span>
                    </li>
                    <li className={classes.Li}>
                      <i class="fa fa-check"></i>
                      <span>{t("Requires expertise on data and artificial intelligence")}</span>
                    </li>
                    <li>
                      <span>&nbsp;</span>
                    </li>
                  </ul>
                  {/* <hr /> */}
                </div>
                {/* <button
                  class="btn buttonBlue"
                  type="button"
                  style={{ fontSize: "14px", margin: "24px 0" }}
                >
                  {t("Start")}
                </button> */}
              </div>
            </div>
            <div class="col-10 col-lg-4" style={{ marginBottom: "24px" }}>
              <div class="text-center modelingComparison">
                <div>
                  <h5 className={classes.H5}>AutoML</h5>
                </div>
                <div class="modelingComparisonContent">
                  <p className={classes.P}>{t("CLICK AI를 활용하여 코딩없이 클릭만으로 원하는 인공지능을 자동 개발")}</p>
                  <ul class="text-left" style={{ listStyle: "none", paddingLeft: "0px" }}>
                    <li className={classes.Li}>
                      <i class="fa fa-check"></i>
                      <span>{t("Automated artificial intelligence development")}</span>
                    </li>
                    <li className={classes.Li}>
                      <i class="fa fa-check"></i>
                      <span>{t("Get AI models rapidly within 3 days")}</span>
                    </li>
                    <li className={classes.Li}>
                      <i class="fa fa-check"></i>
                      <span>{t("Provides basic data preprocessing functionalities")}</span>
                    </li>
                    <li className={classes.Li}>
                      <i class="fa fa-check"></i>
                      <span>{t("Kaggle's Top 1% AI Accuracy")}</span>
                    </li>
                  </ul>
                  {/* <hr /> */}
                </div>
                {/* <button
                  class="btn buttonBlue"
                  type="button"
                  style={{ fontSize: "14px", margin: "24px 0" }}
                >
                  {t("Start")}
                </button> */}
              </div>
            </div>
            <div class="col-10 col-lg-4" style={{ marginBottom: "24px" }}>
              <div class="text-center modelingComparison">
                <div>
                  <h5 className={classes.H5} style={{ marginBottom: "24px" }}>
                    AutoML + Consulting
                  </h5>
                </div>
                <div class="modelingComparisonContent">
                  <p className={classes.P}>{t("CLICK AI를 활용하여 컨설턴트가 데이터 전처리부터 인공지능 개발까지 제공")}</p>
                  <ul class="text-left" style={{ listStyle: "none", paddingLeft: "0px" }}>
                    <li className={classes.Li}>
                      <i class="fa fa-check"></i>
                      <span>{t("Automated artificial intelligence development")}</span>
                    </li>
                    <li className={classes.Li}>
                      <i class="fa fa-check"></i>
                      <span>{t("Gain customized models by professional consultant")}</span>
                    </li>
                    <li className={classes.Li}>
                      <i class="fa fa-check"></i>
                      <span>{t("Customized data preprocessing services")}</span>
                    </li>
                    <li className={classes.Li}>
                      <i class="fa fa-check"></i>
                      <span>{t("Kaggle's Top 1% AI Accuracy")}</span>
                    </li>
                  </ul>
                  {/* <hr /> */}
                </div>
                {/* <button
                  class="btn buttonBlue"
                  type="button"
                  style={{ fontSize: "14px", margin: "24px 0" }}
                >
                  {t("Request")}
                </button> */}
              </div>
            </div>
          </div>
        </div>
        <div class="container bodyContainer">
          <div class="row justify-content-center align-items-center">
            <div class="col-12 text-center">
              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    color: "var(--main)",
                    border: "2px solid var(--main)",
                    fontWeight: "600",
                    borderRadius: "5rem",
                    padding: "4px 12px",
                    fontSize: "14px",
                  }}
                >
                  {t("Custom training")}
                </span>
              </div>
              <h2 className={classes.H2} style={{ marginBottom: "16px" }}>
                {t("It is easy to configure servers and develop your own models.")}
              </h2>
              <p className={classes.P}>
                {t("CLICK AI의 커스텀 학습을 활용하면 클라우드 학습 서버를 간편하게 설정할 수 있으며, 익숙한 Jupyter 환경에서 인공지능을 개발할 수 있습니다.")}
                <br />
              </p>
            </div>
          </div>
          <div
            class="row no-gutters justify-content-around align-items-start"
            style={{
              background: "rgba(0,0,0,0.025)",
              borderRadius: "0.5rem",
              paddingLeft: "24px",
              paddingRight: "24px",
            }}
          >
            <div class="col-10 col-lg-4 text-center" style={{ margin: "5% 0", padding: "0 12px" }}>
              <img class="img-fluid" src={Img02_01_customServer} style={{ maxHeight: "128px", marginBottom: "24px" }} />
              <h4 className={classes.H4}>
                {t("Customized Training Server Configuration")}
                <br />
              </h4>
              <p class="small">{t("백엔드 서버 구축 역량이 없어도 원하는 성능의 맞춤형 학습 서버를 간편하게 직접 구성할 수 있습니다.")}</p>
            </div>
            <div class="col-10 col-lg-4 text-center" style={{ margin: "5% 0", padding: "0 12px" }}>
              <img class="img-fluid rounded" src={Img02_02_clickai_jupyter} style={{ maxHeight: "128px", marginBottom: "24px" }} />
              <h4 className={classes.H4}>
                {t("Code with the Jupyter environment")}
                <br />
              </h4>
              <p class="small">{t("Jupyter 환경에서 원하는 알고리즘을 직접 코딩하고 하이퍼 파라미터 튜닝을 통해 인공지능을 개발할 수 있습니다.")}</p>
            </div>
            <div class="col-10 col-lg-4 text-center" style={{ margin: "5% 0", padding: "0 12px" }}>
              <img class="img-fluid rounded" src={Img02_03_clickai_magiccode} style={{ maxHeight: "128px", marginBottom: "24px" }} />
              <h4 className={classes.H4}>{t("Magic Code Automatically Generated")}</h4>
              <p class="small">{t("Jupyter로의 복사 및 붙여넣기만으로 비전문가도 인공지능 개발을 시작할 수 있는 Magic Code를 자동으로 생성합니다.")}</p>
            </div>
          </div>
        </div>
        <div class="container bodyContainer">
          <div class="row justify-content-center align-items-center">
            <div class="col-12 col-lg-12 text-center justify-content-center" style={{ marginBottom: "60px" }}>
              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    color: "var(--main)",
                    border: "2px solid var(--main)",
                    fontWeight: "600",
                    borderRadius: "5rem",
                    padding: "4px 12px",
                    fontSize: "14px",
                  }}
                >
                  AutoML
                </span>
              </div>
              <h2 className={classes.H2} style={{ marginBottom: "16px" }}>
                {t("단 한 줄의 코드 작성없이도 딥러닝 기반 인공지능을 개발할 수 있습니다.")}
              </h2>
              <p className={classes.P}>
                {t("CLICK AI는 딥러닝 기반 인공지능을 위해 필요한 데이터 모델링, 알고리즘 튜닝과 모델 테스트 등 인공지능 개발 프로세스를 모두 자동화하였습니다.")}
                <br />
              </p>
            </div>
            <div class="col-10 d-none d-md-block">
              <img class="img-fluid" src={Img03_clickai_automl_1} />
            </div>
            <div class="col-8 d-block d-md-none">
              <img class="img-fluid" src={Img03_clickai_automl_1_mobile} />
            </div>
          </div>
        </div>
        <div class="container d-none d-lg-block bodyContainer">
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "10%" }}>
            {Text04_clickai_project}
            {ImgFrame04_clickai_project}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "10%" }}>
            {ImgFrame05_dataset_preprocessing}
            {Text05_dataset_preprocessing}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "10%" }}>
            {Text06_clickai_modelist}
            {ImgFrame06_clickai_modelist}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "10%" }}>
            {ImgFrame07_serviceapp}
            {Text07_serviceapp}
          </div>
          <div class="row justify-content-around align-items-center" style={{ marginBottom: "10%" }}>
            {Text08_codeSDKPython}
            {ImgFrame08_codeSDKPython}
          </div>
        </div>
        <div class="container d-block d-lg-none bodyContainer">
          <div class="row justify-content-center align-items-center" style={{ marginBottom: "20%" }}>
            {Text04_clickai_project}
            {ImgFrame04_clickai_project}
          </div>
          <div class="row justify-content-center align-items-center" style={{ marginBottom: "20%" }}>
            {Text05_dataset_preprocessing}
            {ImgFrame05_dataset_preprocessing}
          </div>
          <div class="row justify-content-center align-items-center" style={{ marginBottom: "20%" }}>
            {Text06_clickai_modelist}
            {ImgFrame06_clickai_modelist}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "20%" }}>
            {Text07_serviceapp}
            {ImgFrame07_serviceapp}
          </div>
          <div class="row" style={{ marginBottom: "20%" }}>
            {Text08_codeSDKPython}
            {ImgFrame08_codeSDKPython}
          </div>
        </div>
        <div class="container bodyContainer">
          <div class="row justify-content-center align-items-center">
            <div class="col-12 text-center">
              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    color: "var(--main)",
                    border: "2px solid var(--main)",
                    fontWeight: "600",
                    borderRadius: "5rem",
                    padding: "4px 12px",
                    fontSize: "14px",
                  }}
                >
                  AutoML + Consulting
                </span>
              </div>
              <h2 className={classes.H2} style={{ marginBottom: "16px" }}>
                {t("Request the AI development only with data.")}
              </h2>
              <p className={classes.P}>
                {t("CLICK AI를 활용하여 전문 컨설턴트가 직접 데이터를 확인하고 데이터 전처리부터 인공지능 모델 개발까지 제공하여 드립니다.")}
                <br />
              </p>
            </div>
          </div>
          <div
            class="row no-gutters justify-content-around align-items-start"
            style={{
              background: "rgba(0,0,0,0.025)",
              borderRadius: "0.5rem",
              paddingLeft: "24px",
              paddingRight: "24px",
            }}
          >
            <div class="col-10 col-lg-4 text-center" style={{ margin: "5% 0", padding: "0 12px" }}>
              <img class="img-fluid" src={Img09_01_clickai_consulting_1} style={{ maxHeight: "128px", marginBottom: "24px" }} />
              <h4 className={classes.H4}>
                {t("Reviewed data from professional consultants")}
                <br />
              </h4>
              <p class="small">{t("업로드된 데이터에 대해서 전문 컨설턴트가 직접 검토하고 데이터에 대한 컨설팅을 제공합니다.")}</p>
            </div>
            <div class="col-10 col-lg-4 text-center" style={{ margin: "5% 0", padding: "0 12px" }}>
              <img class="img-fluid rounded" src={Img09_02_clickai_consulting_2} style={{ maxHeight: "128px", marginBottom: "24px" }} />
              <h4 className={classes.H4}>
                {t("Customized data preprocessing")}
                <br />
              </h4>
              <p class="small">{t("데이터에 최적화된 데이터 전처리를 수행하여 높은 수준의 학습용 데이터셋을 구성합니다.")}</p>
            </div>
            <div class="col-10 col-lg-4 text-center" style={{ margin: "5% 0", padding: "0 12px" }}>
              <img class="img-fluid rounded" src={Img09_03_clickai_consulting_3} style={{ maxHeight: "128px", marginBottom: "24px" }} />
              <h4 className={classes.H4}>
                {t("High levels of AI accuracy")}
                <br />
              </h4>
              <p class="small">{t("높은 수준의 학습용 데이터셋을 토대로 최대 100여 개의 인공지능을 개발하고 검증하기에 높은 수준의 인공지능 정확도를 도출할 수 있습니다.")}</p>
            </div>
          </div>
        </div>
        <div class="container bodyContainer">
          <div class="row" style={{ marginBottom: "10%" }}>
            <div class="col-12 text-center">
              <div style={{ marginBottom: "16px" }}></div>
              <h2 className={classes.H2} style={{ marginBottom: "16px" }}>
                {t("Teach AI suitable for each type of data.")}
              </h2>
              <p className={classes.P}>
                {t("CLICK AI의 AutoML은 다양한 형태의 데이터 별로 적합한 기능의 인공지능 자동 개발을 제공합니다.")}
                <br />
              </p>
            </div>
            <div class="col-md-4 col-lg-3" style={{ padding: "16px" }}>
              <div class="box shadow hover" style={{ height: "100%" }}>
                <div style={{ marginBottom: "24px" }}>
                  <img src={Img10_01_icon_clickaitabular} width="20%" />
                </div>
                <div class="productBox">
                  <h5 className={classes.h5} style={{ color: "#525557" }}>
                    CLICK AI
                    <br />
                    TABULAR™
                  </h5>
                  <p class="small">{t("최상의 데이터 과학 전문성과 결합된 고급 딥러닝 모델 생성을 자동화합니다.")}</p>
                </div>
              </div>
            </div>
            <div class="col-md-4 col-lg-3" style={{ padding: "16px" }}>
              <div class="box shadow hover" style={{ height: "100%" }}>
                <div style={{ marginBottom: "24px" }}>
                  <img src={Img10_02_icon_clickaitimeseries} width="20%" />
                </div>
                <div class="productBox">
                  <h5 className={classes.h5} style={{ color: "#525557" }}>
                    CLICK AI
                    <br />
                    TIME SERIES™
                  </h5>
                  <p class="small">{t("이력과 추이를 기반으로 연속적인 데이터의 가치를 예측하는 정교한 시계열 모델 개발을 자동화합니다.")}</p>
                </div>
              </div>
            </div>
            <div class="col-md-4 col-lg-3" style={{ padding: "16px" }}>
              <div class="box shadow hover" style={{ height: "100%" }}>
                <div style={{ marginBottom: "24px" }}>
                  <img src={Img10_03_icon_clickaivision} width="20%" />
                </div>
                <div class="productBox">
                  <h5 className={classes.h5} style={{ color: "#525557" }}>
                    CLICK AI
                    <br />
                    VISION™
                  </h5>
                  <p class="small">{t("이미지 데이터를 기반으로 특정 물체나 불량품을 AI를 활용하여 인식합니다.")}</p>
                </div>
              </div>
            </div>
            <div class="col-md-4 col-lg-3" style={{ padding: "16px" }}>
              <div class="box shadow hover" style={{ height: "100%" }}>
                <div style={{ marginBottom: "24px" }}>
                  <img src={Img10_04_icon_clickaitextvoice} width="20%" />
                </div>
                <div class="productBox">
                  <h5 className={classes.h5} style={{ color: "#525557" }}>
                    CLICK AI
                    <br />
                    TEXT™
                  </h5>
                  <p class="small">{t("단어나 문장을 이해하여 사용자의 감정이나 계약서의 오류를 인식합니다.")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <Button id="projectintro_bottom_start_btn" shape="blueContained" size="xl" onClick={closeIntro}>
            {t("Start Service")}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ProjectIntro;
