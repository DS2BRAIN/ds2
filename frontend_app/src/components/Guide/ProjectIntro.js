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
        <p className={classes.P}>{t("From the time you upload the data, you can view the AI model results on a cloud training server in at least three days.")}</p>
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
        <p className={classes.P}>{t("Basic data preprocessing such as missing data, de-identification, batch replacement is simple and easy.")}</p>
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
          {t("Up to 100 artificial intelligence models can be automatically developed and verified for a single dataset, so a highly accurate artificial intelligence can be derived.")}
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
        <p className={classes.P}>{t("The completed artificial intelligence model can be deployed and applied to services right away through API integration. In addition, using sharing service apps allows you to view the artificial intelligence results through the provided URL on the web without separate interworking services.")}</p>
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
          {t("Build a data pipeline for MLOps at DS2.ai with Python. SDK gives you access to all of the processes from uploading and labeling data, to training and deploying the artificial intelligence model.")}
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
                {t("You can develop artificial intelligence with just one click without coding. Open up more diverse future possibilities with CLICK AI, an artificial intelligence auto-development solution.")}
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
                <p className={classes.P}>{t("CLICK AI provides AI development by following the 3 methods below.")}</p>
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
                  <p className={classes.P}>{t("Develop AI directly in a Jupiter environment by leasing the training server with the desired performance")}</p>
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
                  <p className={classes.P}>{t("Using CLICK AI, automatically develop artificial intelligence you want with just a click without any coding")}</p>
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
                  <p className={classes.P}>{t("Consultants provide from data preprocessing to artificial intelligence development using CLICK AI")}</p>
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
                {t("CLICK AI's Custom Training makes it easy to set up a cloud training server and develop artificial intelligence in a Jupyter environment.")}
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
              <p class="small">{t("Without the ability to deploy back-end servers, customized training servers with desired performance can be easily configured.")}</p>
            </div>
            <div class="col-10 col-lg-4 text-center" style={{ margin: "5% 0", padding: "0 12px" }}>
              <img class="img-fluid rounded" src={Img02_02_clickai_jupyter} style={{ maxHeight: "128px", marginBottom: "24px" }} />
              <h4 className={classes.H4}>
                {t("Code with the Jupyter environment")}
                <br />
              </h4>
              <p class="small">{t("In a Jupyter environment, you can code the desired algorithm directly and develop artificial intelligence by tuning the hyper-parameters.")}</p>
            </div>
            <div class="col-10 col-lg-4 text-center" style={{ margin: "5% 0", padding: "0 12px" }}>
              <img class="img-fluid rounded" src={Img02_03_clickai_magiccode} style={{ maxHeight: "128px", marginBottom: "24px" }} />
              <h4 className={classes.H4}>{t("Magic Code Automatically Generated")}</h4>
              <p class="small">{t("Just copy and paste into Jupyter to automatically generate Magic Code that even non-professionals can start developing artificial intelligence.")}</p>
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
                {t("Deep learning-based artificial intelligence can be developed without writing a single line of code.")}
              </h2>
              <p className={classes.P}>
                {t("CLICK AI has automated all of the AI development processes such as data modeling, algorithm tuning and model testing needed for deep learning-based artificial intelligence.")}
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
                {t("With CLICK AI, professional consultants will check the data themselves, provide data preprocessing and develop the artificial intelligence model.")}
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
              <p class="small">{t("A professional consultant reviews the uploaded data and provides consulting on the data.")}</p>
            </div>
            <div class="col-10 col-lg-4 text-center" style={{ margin: "5% 0", padding: "0 12px" }}>
              <img class="img-fluid rounded" src={Img09_02_clickai_consulting_2} style={{ maxHeight: "128px", marginBottom: "24px" }} />
              <h4 className={classes.H4}>
                {t("Customized data preprocessing")}
                <br />
              </h4>
              <p class="small">{t("Perform optimized pre-processing to configure high-level training datasets.")}</p>
            </div>
            <div class="col-10 col-lg-4 text-center" style={{ margin: "5% 0", padding: "0 12px" }}>
              <img class="img-fluid rounded" src={Img09_03_clickai_consulting_3} style={{ maxHeight: "128px", marginBottom: "24px" }} />
              <h4 className={classes.H4}>
                {t("High levels of AI accuracy")}
                <br />
              </h4>
              <p class="small">{t("Based on high-level training datasets, you can derive highly accurate artificial intelligence to develop and validate up to 100 AI models.")}</p>
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
                {t("CLICK AI's AutoML provides the automatic development of artificial intelligence, which is suitable for each type of data.")}
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
                  <p class="small">{t("Automates the creation of advanced deep learning models combined with leading data science expertise.")}</p>
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
                  <p class="small">{t("Automates the development of sophisticated time series models that predict the value of continuous data based on history and trends.")}</p>
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
                  <p class="small">{t("Based on image data, AI recognizes specific objects or defective products.")}</p>
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
                  <p class="small">{t("Understand words, sentences, or voices to recognize the user's feelings or errors in the contract.")}</p>
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
