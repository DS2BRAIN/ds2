import React, { useEffect, useState } from "react";
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
import codeLabellingCocoJsonImg from "assets/intro/assets/img/code/code_labelling_COCOJSON.png";
import codeLabellingVocImg from "assets/intro/assets/img/code/code_labelling_VOC.png";
import codeLabellingSDKPythonImg from "assets/intro/assets/img/code/code_labelling_SDKPython.png";
import { fileurl } from "controller/api";
import Button from "components/CustomButtons/Button";

const LabelIntro = (props) => {
  const classes = introStyles();
  const { t } = props.useTranslation();
  const userLang = props.userLang;

  const [selectedNav, setSelectedNav] = useState(0);
  const language = ["COCO JSON", "VOC"];
  const langImgs = [codeLabellingCocoJsonImg, codeLabellingVocImg];
  const barColor = ["rgba(41,121,255,0.25)", "rgba(41,121,255,0.5)", "rgba(41,121,255,0.75)", "rgba(41,121,255,1)"];
  const barCost = ["인공지능 개발 비용", "라벨링 검수 비용", "수동 라벨링 비용", "라벨링 도구 비용"];
  const normalBarHeight = ["30%", "10%", "45%", "15%"];
  const aiBarHeight = ["0%", "15%", "5%", "25%"];

  const closeIntro = () => {
    props.setIntroOn(false);
    props.setIntroOffClicked(true);
  };

  const Img01_header_dashboard = userLang === "ko" ? fileurl + "asset/labelingai_header.mp4" : fileurl + "asset/labelingai_header_en.mp4";
  const Img02_mainprocess = fileurl + "asset/img_labelingai_mainprocess.jpg";
  const Img02_mainprocess_mobile = fileurl + "asset/img_labelingai_mainprocess_mobile.jpg";
  const Img03_video_magictool = fileurl + "asset/video_magictool.mp4";
  const Img04_01_sementic = fileurl + "asset/img_labeling_sementic.jpg";
  const Img04_02_skeleton = fileurl + "asset/img_labeling_skeleton.jpg";
  const Img05_Ex = fileurl + "asset/img_labelingEx.jpg";
  const Img06_feature_1 = userLang === "ko" ? fileurl + "asset/img_labeling_feature_1.jpg" : fileurl + "asset/img_labeling_feature_1_en.jpg";
  const Img07_feature_2 = userLang === "ko" ? fileurl + "asset/img_labeling_feature_2.jpg" : fileurl + "asset/img_labeling_feature_2_en.jpg";
  const Img08_select = userLang === "ko" ? fileurl + "asset/img_labeling_select.jpg" : fileurl + "asset/img_labeling_select_en.jpg";
  const Img09_codeSDKPython = codeLabellingSDKPythonImg;

  const ImgFrame06_feature_1 = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center">
      <img class="img-fluid" src={Img06_feature_1} />
    </div>
  );

  const Text06_feature_1 = (
    <div class="col-12 col-lg-5 d-flex justify-content-center" style={{ padding: "8px 24px" }}>
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Auto-Labeling for continuous training")}
          <br />
        </h4>
        <p className={classes.P}>
          {t("Starting with the first 10 manual labeling, the performance of LABELING AI is further improved by repeating the inspection/correction and re-training of Auto-Labeling results.")}
          <br />
        </p>
      </div>
    </div>
  );

  const ImgFrame07_feature_2 = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center">
      <img class="img-fluid" src={Img07_feature_2} />
    </div>
  );

  const Text07_feature_2 = (
    <div class="col-12 col-lg-5 d-flex justify-content-center" style={{ padding: "8px 24px" }}>
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Project management through dashboard")}
        </h4>
        <p className={classes.P}>{t("Check and manage work status at a glance through the dashboard for the labeling project.")}</p>
        <ul class="list-unstyled" style={{ fontSize: "14px" }}>
          <li className={classes.Li}>✓ {t("Data labeling progress")}</li>
          <li className={classes.Li}>✓ {t("Status by labeling class")}</li>
          <li className={classes.Li}>✓ {t("Work status of shared workers")}</li>
        </ul>
      </div>
    </div>
  );

  const ImgFrame08_select = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center">
      <img
        class="img-fluid"
        src={Img08_select}
        style={{
          borderRadius: "0.25rem",
          boxShadow: "0 0 5px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );

  const Text08_select = (
    <div class="col-12 col-lg-5 d-flex justify-content-center" style={{ padding: "8px 24px" }}>
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Auto-Labeling using various artificial intelligence")}
        </h4>
        <p className={classes.P}>{t("LABELING AI supports various methods to perform Auto-Labeling.")}</p>
        <ul class="list-unstyled" style={{ fontSize: "14px" }}>
          <li className={classes.Li}>✓ Custom AI: {t("Custom AI: Perform Auto-Labeling by training manually labeled data")}</li>
          <li className={classes.Li}>✓ General AI: {t("General AI: Auto-Labeling immediately without training")}</li>
          {/* <li className={classes.Li}>
        ✓{" "}
        {t(
          "Inference AI: 학습없이 바로 클래스 식별 및 데이터 전처리 수행"
        )}
      </li> */}
        </ul>
      </div>
    </div>
  );

  const ImgFrame09_codeSDKPython = (
    <div class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center" style={{ width: "520px", padding: "20px" }}>
      <img class="img-fluid" src={Img09_codeSDKPython} style={{ width: "520px", padding: "20px" }} />
    </div>
  );

  const Text09_codeSDKPython = (
    <div class="col-12 col-lg-5 d-flex justify-content-start justify-content-lg-center" style={{ padding: "8px 24px" }}>
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("SDK support for convenient programming development")}
        </h4>
        <p className={classes.P}>{t("Build a data pipeline for MLOps at DS2.ai with Python. SDK gives you access to all of the processes from uploading and labeling data, to training and deploying the artificial intelligence model.")}</p>
      </div>
    </div>
  );

  return (
    <div className={classes.Body}>
      <section class="marketBlock top">
        <div class="container">
          <div class="row justify-content-center rowTop">
            <div class="col-12 text-center">
              <h1 className={classes.H1} style={{ wordBreak: "break-all" }}>
                {t("Data labeling automated with 10 annotation")}
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
                {t("LABELING AI is a deep learning-based Auto-Labeling technology that utilizes AI to automate and quickly label large amounts of data, after labeling only a small amount of data manually.")}
                <br />
              </p>
              <Button id="labelintro_top_start_btn" shape="blueContained" size="xl" onClick={closeIntro}>
                {t("Start Service")}
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className={classes.Section}>
        <div class="container bodyContainer">
          <div class="row justify-content-center" style={{ marginBottom: "10%" }}>
            <div class="col-12 tab-content">
              <h2 className={classes.H2} style={{ textAlign: "center" }}>
                {t("Easier data labeling with just inspection")}
              </h2>
              <p className={classes.P} style={{ textAlign: "center" }}>
                {t("Auto-Labeling is performed with artificial intelligence and a large amount of data can be labeled only by inspecting the results.")}
              </p>
            </div>
            <div class="col-10 d-flex justify-content-center align-items-center">
              <div class="d-flex justify-content-center align-items-center mainVideo">
                <video style={{ maxWidth: "100%" }} autoPlay loop muted>
                  <source src={Img01_header_dashboard} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
        <div class="container bodyContainer">
          <h2 className={classes.H2} style={{ textAlign: "center" }}>
            {t("The most efficient way to label your data")}
          </h2>
          <p className={classes.P} style={{ textAlign: "center" }}>
            {t("Deep learning-based Auto-Labeling can be performed with only 10 labels, and a large amount of data can be labeled only by inspecting and correcting the result of Auto-Labeling.")}
          </p>
          <div class="row justify-content-center" style={{ marginBottom: "10%" }}>
            <div class="col text-center">
              <div class="d-none d-lg-flex justify-content-center align-items-center" style={{ margin: "60px 0" }}>
                <img class="img-fluid" src={Img02_mainprocess} />
              </div>
              <div class="d-flex d-lg-none justify-content-center align-items-center" style={{ margin: "60px 0" }}>
                <img class="img-fluid" src={Img02_mainprocess_mobile} style={{ marginBottom: "30px" }} />
              </div>
            </div>
          </div>
          <div class="row justify-content-center" style={{ marginBottom: "10%" }}>
            <div class="col-2 col-md-5 processLine"></div>
            <div class="col-12 col-md-4" style={{ marginBottom: "24px" }}>
              <div class="labelingProcessBox">
                <h5 className={classes.H5} style={{ color: "#525557" }}>
                  1. Labeling Manually
                </h5>
                <p className={classes.P} style={{ fontSize: "small" }}>
                  {t("Manually generate 10 labeled data.")}
                </p>
              </div>
            </div>
            <div class="col-12 col-md-4" style={{ marginBottom: "24px" }}>
              <div class="labelingProcessBox">
                <h5 className={classes.H5} style={{ color: "#525557" }}>
                  2. Traing Model
                </h5>
                <p className={classes.P} style={{ fontSize: "small" }}>
                  {t("Train an auto labeling AI with the 10 pre-labeled data. Review and correct the results to enhance auto labeling performance.")}
                </p>
              </div>
            </div>
            <div class="col-12 col-md-4" style={{ marginBottom: "24px" }}>
              <div class="labelingProcessBox">
                <h5 className={classes.H5} style={{ color: "#525557" }}>
                  3. Deploy the best AI
                </h5>
                <p className={classes.P} style={{ fontSize: "small" }}>
                  {t("Repeat the previous step to generate 1,000, 10,000, or 100,000 auto labeled data. Transform your auto labeling AI into an object detection AI model to perform object detection as needed.")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="container bodyContainer">
          <h2 className={classes.H2} style={{ textAlign: "center" }}>
            {t("Convenient labeling inspection and modification with smart magic tool")}
          </h2>
          <p className={classes.P} style={{ textAlign: "center" }}>
            {t("Labeling inspection and modification are also easily performed through the magic tool that can quickly label even complex-shaped objects.")}
          </p>
          <div class="row justify-content-center">
            <div class="col-12 col-md-10 col-lg-8 text-center" style={{ marginBottom: "24px" }}>
              <div class="d-flex justify-content-center align-items-center mainVideo" style={{ margin: "60px 0" }}>
                <video
                  autoPlay
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "0.25rem",
                  }}
                  loop
                  muted
                >
                  <source src={Img03_video_magictool} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
          <div
            class="row no-gutters justify-content-around align-items-start"
            style={{
              background: "rgba(0,0,0,0.025)",
              borderRadius: "0.5rem",
              padding: "5% 24px 0 24px",
            }}
          >
            <div class="col-10 text-center">
              <h4 className={classes.H4} style={{ textAlign: "left" }}>
                {t("We offer a variety of smart labeling tools.")}
                <br />
              </h4>
              <p className={classes.P} style={{ textAlign: "left", fontSize: "small" }}>
                {t("We provide a variety of labeling tools such as Bounding Box, Polyline, and Polygon magic tool.")}
              </p>
            </div>
            <div class="col-10 col-lg-4 text-center" style={{ margin: "5% 0", padding: "0 12px" }}>
              <img class="img-fluid rounded" src={Img04_01_sementic} style={{ maxHeight: "128px", marginBottom: "24px" }} />
              <h4 className={classes.H4}>
                Semantic Segmentation
                <br />
              </h4>
              <p className={classes.P} style={{ textAlign: "left", fontSize: "small" }}>
                {t("It recognizes and classifies the entire image by region, and is actively used in autonomous driving technology.")}
              </p>
            </div>
            <div class="col-10 col-lg-4 text-center" style={{ margin: "5% 0", padding: "0 12px" }}>
              <img class="img-fluid rounded" src={Img04_02_skeleton} style={{ maxHeight: "128px", marginBottom: "24px" }} />
              <h4 className={classes.H4}>
                Skeleton
                <br />
              </h4>
              <p className={classes.P} style={{ textAlign: "left", fontSize: "small" }}>
                {t("It recognizes and tracks human motion by detecting the skeleton, and is used in motion detection fields such as sports or security.")}
              </p>
            </div>
          </div>
        </div>
        <div class="container bodyContainer">
          <h2 className={classes.H2} style={{ textAlign: "center" }}>
            {t("Free data import/export")}
          </h2>
          <p className={classes.P} style={{ textAlign: "center" }}>
            {t("Regardless of the labeling work environment, various coordinate data can be imported to LABELING AI to perform labeling, and the processed labeling coordinate data can be extracted in various formats.")}
          </p>
          <div class="row justify-content-center">
            <div class="col text-center" style={{ marginBottom: "24px" }}>
              <div id="minimal-tabs">
                <ul class="nav nav-tabs d-flex justify-content-center" role="tablist">
                  {language.map((lang, i) => {
                    return (
                      <li class="nav-item" role="presentation" style={{ width: "50%" }}>
                        {i === selectedNav ? (
                          <a class="nav-link active">{lang}</a>
                        ) : (
                          <a
                            class="nav-link"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedNav(i);
                            }}
                          >
                            {lang}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div class="tab-content" style={{ marginBottom: "0" }}>
                  {/* <div class="tab-pane active" role="tabpanel"> */}
                  <div class="row justify-content-center codeLabelingBox" style={{ background: "rgba(0,0,0,0.05)" }}>
                    <div
                      class="col-12 col-lg-6 d-flex justify-content-center align-items-center"
                      style={{
                        height: "300px",
                        width: "100%",
                        overflow: "hidden",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <img className={classes.Code} src={langImgs[selectedNav]} />
                    </div>
                    <div class="col-12 col-lg-6 text-center d-flex justify-content-center align-items-center" style={{ margin: "20px" }}>
                      <img class="img-fluid" src={Img05_Ex} style={{ height: "240px" }} />
                    </div>
                  </div>
                  {/* </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="container d-flex justify-content-center bodyContainer">
          <div class="row justify-content-center whyLabeling" style={{ width: "100%" }}>
            <div class="col-12 col-lg-4 align-self-center" style={{ margin: "24px 0px" }}>
              {userLang === "ko" ? (
                <h6 className={classes.H6} style={{ marginBottom: "0px" }}>
                  {t("Contrast")}
                </h6>
              ) : null}
              <h1
                className={classes.H1}
                style={{
                  marginTop: "0px",
                  marginBottom: "16px",
                  wordBreak: "break-all",
                }}
              >
                {t("80% cost reduction")}
              </h1>
              <p className={classes.P} style={{ color: "var(--bg)" }}>
                {t("The entire process from training data preparation to AI deployment can be solved with LABELING AI, saving the cost and duration of the project.")}
              </p>
            </div>
            <div class="col-10 col-md-7 col-lg-4 d-flex justify-content-center align-items-center" style={{ marginBottom: "36px" }}>
              <div
                style={{
                  height: "240px",
                  width: "40%",
                  marginRight: "16px",
                  opacity: "0.50",
                }}
              >
                {barColor.map((color, idx) => {
                  return (
                    <div
                      style={{
                        width: "100%",
                        height: normalBarHeight[idx],
                        background: color,
                      }}
                    />
                  );
                })}
                <div></div>
                <div>
                  <h5 className={classes.H5} style={{ textAlign: "center", margin: "16px 0px" }}>
                    {t("Traditional labeling")}
                  </h5>
                </div>
              </div>
              <div style={{ height: "240px", width: "40%", marginLeft: "16px" }}>
                <div
                  style={{
                    width: "100%",
                    height: "55%",
                    background: "transparent",
                  }}
                ></div>
                {barColor.map((color, idx) => {
                  return (
                    <div
                      style={{
                        width: "100%",
                        height: aiBarHeight[idx],
                        background: color,
                      }}
                    />
                  );
                })}
                <div>
                  <h5 className={classes.H5} style={{ textAlign: "center", margin: "16px 0px" }}>
                    LABELING AI
                  </h5>
                </div>
              </div>
            </div>
            <div class="col-10 col-md-5 col-lg-3 d-flex justify-content-center align-items-center" style={{ paddingTop: "90px" }}>
              <div style={{ maxWidth: "196px" }}>
                {barColor.map((color, idx) => {
                  return (
                    <div class="d-flex align-items-center">
                      <div style={{ padding: "15px", background: color }} />
                      <p
                        className={classes.P}
                        style={{
                          margin: "0px",
                          marginLeft: "12px",
                          color: "var(--bg)",
                        }}
                      >
                        {t(barCost[idx])}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div class="col-12 d-lg-flex justify-content-center align-items-start" style={{ marginTop: "36px" }}>
              <div class="d-sm-flex justify-content-sm-center">
                <div>
                  <div class="text-nowrap text-center" style={{ color: "white", marginBottom: "8px" }}>
                    * {t("Only the auto-labeling results")}&nbsp;
                  </div>
                </div>
                <div class="d-flex justify-content-center">
                  <div
                    class="text-nowrap"
                    style={{
                      color: "white",
                      borderBottom: "4px solid " + barColor[3],
                      marginBottom: "8px",
                    }}
                  >
                    <b>{t("that passes the inspection")}</b>
                  </div>
                </div>
              </div>
              <div>
                <div class="text-nowrap text-center" style={{ color: "white", marginBottom: "8px" }}>
                  {userLang === "ko" ? null : <span>&nbsp;</span>}
                  {t("will be processed for payment.")};
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="container d-none d-lg-block bodyContainer">
          <div class="row justify-content-around align-items-center" style={{ marginBottom: "10%" }}>
            {Text06_feature_1}
            {ImgFrame06_feature_1}
          </div>
          <div class="row justify-content-around align-items-center" style={{ marginBottom: "10%" }}>
            {ImgFrame07_feature_2}
            {Text07_feature_2}
          </div>
          <div class="row justify-content-around align-items-center" style={{ marginBottom: "10%" }}>
            {Text08_select}
            {ImgFrame08_select}
          </div>
          <div class="row justify-content-between align-items-center" style={{ marginBottom: "10%" }}>
            {ImgFrame09_codeSDKPython}
            {Text09_codeSDKPython}
          </div>
        </div>
        <div class="container-fluid d-lg-none bodyContainer">
          <div class="row justify-content-center align-items-center" style={{ marginBottom: "20%" }}>
            {Text06_feature_1}
            {ImgFrame06_feature_1}
          </div>
          <div class="row justify-content-center align-items-center" style={{ marginBottom: "20%" }}>
            {Text07_feature_2}
            {ImgFrame07_feature_2}
          </div>
          <div class="row justify-content-center align-items-center" style={{ marginBottom: "20%" }}>
            {Text08_select}
            {ImgFrame08_select}
          </div>
          <div class="row" style={{ marginBottom: "10%" }}>
            {Text09_codeSDKPython}
            {ImgFrame09_codeSDKPython}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <Button id="labelintro_bottom_start_btn" shape="blueContained" size="xl" onClick={closeIntro}>
            {t("Start Service")}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LabelIntro;
