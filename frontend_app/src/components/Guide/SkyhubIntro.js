import React, { useState } from "react";
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
import codeSkyhubJavascriptImg from "assets/intro/assets/img/code/code_skyhub_Javascript.png";
import codeSkyhubJavascriptImg_en from "assets/intro/assets/img/code/code_skyhub_Javascript_en.png";
import codeSkyhubPythonImg from "assets/intro/assets/img/code/code_skyhub_Python.png";
import codeSkyhubPythonImg_en from "assets/intro/assets/img/code/code_skyhub_Python_en.png";
import codeSkyhubWgetImg from "assets/intro/assets/img/code/code_skyhub_Wget.png";
import codeSkyhubWgetImg_en from "assets/intro/assets/img/code/code_skyhub_Wget_en.png";
import codeSkyhubJavaImg from "assets/intro/assets/img/code/code_skyhub_Java.png";
import codeSkyhubJavaImg_en from "assets/intro/assets/img/code/code_skyhub_Java_en.png";
import codeSkyhubSDKPythonImg from "assets/intro/assets/img/code/code_skyhub_SDKPython.png";
import { fileurl } from "controller/api";
import Button from "components/CustomButtons/Button";

const SkyhubIntro = (props) => {
  const classes = introStyles();
  const { t } = props.useTranslation();
  const userLang = props.userLang;

  const [selectedNav, setSelectedNav] = useState(0);
  const language = ["JavaScript", "Python", "wget", "Java"];
  const langImgs =
    userLang === "ko"
      ? [
          codeSkyhubJavascriptImg,
          codeSkyhubPythonImg,
          codeSkyhubWgetImg,
          codeSkyhubJavaImg,
        ]
      : [
          codeSkyhubJavascriptImg_en,
          codeSkyhubPythonImg_en,
          codeSkyhubWgetImg_en,
          codeSkyhubJavaImg_en,
        ];

  const Img01_customServer_big = fileurl + "asset/img_customServer_big.jpg";
  const Img02_01_icon_deploy_1 = fileurl + "asset/icon_deploy_1.png";
  const Img02_02_icon_deploy_2 = fileurl + "asset/icon_deploy_2.png";
  const Img02_03_icon_deploy_3 = fileurl + "asset/icon_deploy_3.png";
  const Img02_04_icon_deploy_4 = fileurl + "asset/icon_deploy_4.png";
  const Img02_05_icon_deploy_5 = fileurl + "asset/icon_deploy_5.png";
  const Img03_customServer_mid = fileurl + "asset/img_customServer_mid.jpg";
  const Img04_01_logo_pytorch = fileurl + "asset/logo_pytorch.jpg";
  const Img04_02_logo_tensorflow = fileurl + "asset/logo_tensorflow.jpg";
  const Img04_skyhub_deploy =
    userLang === "ko"
      ? fileurl + "asset/img_skyhub_deploy.jpg"
      : fileurl + "asset/img_skyhubai_deploy_en.jpg";
  const Img05_retraining = fileurl + "asset/img_retraining.jpg";
  const Img06_01_logo_clickai = fileurl + "asset/logo_clickai.jpg";
  const Img06_02_logo_skyhubai = fileurl + "asset/logo_skyhub.jpg";
  const Img07_skyhub_monitoring =
    userLang === "ko"
      ? fileurl + "asset/img_skyhub_monitoring.jpg"
      : fileurl + "asset/img_skyhub_monitoring_en.jpg";
  const Img09_serviceapp =
    userLang === "ko"
      ? fileurl + "asset/img_serviceapp.jpg"
      : fileurl + "asset/img_serviceapp_en.jpg";
  const Img10_skyhub_edge = fileurl + "asset/img_skyhub_edge.jpg";
  const Img11_skyhub_sensor = fileurl + "asset/img_skyhub_sensor.jpg";
  const Img12_codeSDKPython = codeSkyhubSDKPythonImg;

  const whyLabTitle = [
    "최적화 클라우드 추론 서버",
    "인공지능 재학습",
    "외부 인공지능 연동",
    "API를 활용한 신속한 배포",
    "실시간 서버 시각화 대시보드",
  ];
  const whyLabContents = [
    "인공지능 운영 환경에 적절한 서버를 간편하게 구성할 수 있습니다.",
    "인공지능 운영 중 수집되는 데이터를 지속 활용하여 인공지능을 재학습하고 고도화합니다.",
    "DS2.ai 외부 인공지능 또한 간편하게 업로드하여 최적의 환경에서 운영할 수 있습니다.",
    "자동 생성되는 API를 활용하여 신속하고 간편하게 인공지능을 배포할 수 있습니다.",
    "실시간으로 서버를 모니터링하고 이슈에 대응할 수 있습니다.",
  ];
  const whyLabImg = [
    Img02_01_icon_deploy_1,
    Img02_02_icon_deploy_2,
    Img02_03_icon_deploy_3,
    Img02_04_icon_deploy_4,
    Img02_05_icon_deploy_5,
  ];

  const ImgFrame03_customServer_mid = (
    <div class="col-12 col-lg-5 col-xl-6" style={{ margin: "20px 0px" }}>
      <div
        class="d-flex justify-content-center align-items-center"
        style={{ padding: "40px 0px" }}
      >
        <img class="img-fluid rounded" src={Img03_customServer_mid} />
      </div>
    </div>
  );

  const Text03_customServer_mid = (
    <div class="col-12 col-lg-4 col-xl-5">
      <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
        {t("Maximize AI's Efficiency with Reasoning Cloud Servers")}
      </h4>
      <p className={classes.P}>
        {t(
          "서버 성능을 설정하거나, 지역 설정 등 인공지능 운영 환경에 최적화된 서버를 맞춤 구성하여 효율적으로 운영/관리할 수 있습니다."
        )}
      </p>
      <p
        class="justify-content-center align-items-xl-center"
        style={{ fontSize: "12px" }}
      >
        * {t("Server configuration other than AWS can be accommodated via individual inquiries.")}
      </p>
    </div>
  );

  const ImgFrame04_skyhub_deploy = (
    <div class="col-12 col-lg-5 col-xl-6" style={{ margin: "20px 0px" }}>
      <div
        class="d-flex justify-content-center align-items-center"
        style={{ padding: "40px 0px" }}
      >
        <img class="img-fluid rounded" src={Img04_skyhub_deploy} />
      </div>
    </div>
  );

  const Text04_skyhub_deploy = (
    <div class="col-12 col-lg-4 col-xl-5">
      <div style={{ marginBottom: "10%" }}>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Easy deployment of AI by a simple upload")}
        </h4>
        <p className={classes.P}>
          {t(
            "DS2.ai의 외부에서 별도 개발한 인공지능 또한 SKYHUB AI를 활용하여 배포하거나 관리할 수 있습니다."
          )}
        </p>
      </div>
      <div class="text-center">
        <h6
          className={classes.H6}
          style={{ marginBottom: "24px", color: "#525557" }}
        >
          {t("Framework uploadable to SKYHUB AI")}
        </h6>
        <ul
          class="d-flex justify-content-center"
          style={{ listStyle: "none", paddingLeft: "0" }}
        >
          <li
            class="d-flex justify-content-center align-items-center shadow"
            style={{ padding: "8px 16px", borderRadius: "5rem" }}
          >
            <img
              class="img-fluid"
              src={Img04_01_logo_pytorch}
              style={{ height: "20px" }}
            />
          </li>
          <li
            class="d-flex justify-content-center align-items-center shadow"
            style={{
              marginLeft: "36px",
              padding: "8px 16px",
              borderRadius: "5rem",
            }}
          >
            <img
              class="img-fluid"
              src={Img04_02_logo_tensorflow}
              style={{ height: "20px" }}
            />
          </li>
        </ul>
      </div>
    </div>
  );

  const ImgFrame05_retraining = (
    <div class="col-12 col-lg-5 col-xl-6" style={{ padding: "15px" }}>
      <img class="img-fluid" src={Img05_retraining} />
    </div>
  );

  const Text05_retraining = (
    <div class="col-12 col-lg-4 col-xl-5">
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Advanced artificial intelligence through continuous training")}
        </h4>
        <p class="justify-content-center align-items-xl-center">
          {t(
            "인공지능의 운영을 통해 발생하는 데이터를 초기 학습 데이터에 추가하고 재학습하여 인공지능을 지속적으로 고도화할 수 있습니다."
          )}
        </p>
        <p
          class="justify-content-center align-items-xl-center"
          style={{ fontSize: "12px" }}
        >
          *{" "}
          {t(
            "인공지능 재학습을 위한 데이터 축적은 SKYHUB AI를 활용하는 경우에만 사용할 수 있습니다."
          )}
        </p>
      </div>
    </div>
  );

  const Table06_customServer = (
    <div class="col-12 col-lg-5 col-xl-6" style={{ padding: "15px" }}>
      <div class="table-responsive serverComparison shadow">
        <table class="table">
          <thead>
            <tr>
              <th className={classes.Th}></th>
              <th className={classes.Th}>
                <img src={Img06_01_logo_clickai} style={{ height: "12px" }} />
              </th>
              <th className={classes.Th}>
                <img src={Img06_02_logo_skyhubai} style={{ height: "12px" }} />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="back">
              <td className={classes.Td}>
                <b>Server Setting</b>
              </td>
              <td className={classes.Td}>{t("using DS2.ai's server")}</td>
              <td className={classes.Td}>{t("configure your own server")}</td>
            </tr>
            <tr>
              <td className={classes.Td}>
                <b>Model Delay</b>
              </td>
              <td className={classes.Td}>{t("occurs when downloading AI models")}</td>
              <td className={classes.Td}>{t("download model when booting")}</td>
            </tr>
            <tr>
              <td></td>
              <td>
                <text class="small">{t("(with delay)")}</text>
              </td>
              <td>
                <text class="small">{t("(no delay)")}</text>
              </td>
            </tr>
            <tr class="back">
              <td className={classes.Td}>
                <b>API Rate</b>
              </td>
              <td className={classes.Td}>{t("5 times/1sec")}</td>
              <td className={classes.Td}>{t("depends on the server")}</td>
            </tr>
            <tr>
              <td className={classes.Td}>
                <b>Billing</b>
              </td>
              <td className={classes.Td}>{t("per API call")}</td>
              <td className={classes.Td}>{t("Hourly Server Usage")}</td>
            </tr>
            <tr class="back">
              <td className={classes.Td}>
                <b>Region</b>
              </td>
              <td className={classes.Td}>Korea only</td>
              <td className={classes.Td}>Available Worldwide</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const Text06_customServer = (
    <div class="col-12 col-lg-4 col-xl-5">
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Optimized server configuration for AI")}
        </h4>
        <p class="justify-content-center align-items-xl-center">
          {t(
            "운영 환경에 맞춰 CLICK AI 서버를 사용하거나, 최적화된 클라우드 서버를 직접 구성하여 인공지능을 배포하고 운영할 수 있습니다."
          )}
        </p>
      </div>
    </div>
  );

  const ImgFrame07_skyhub_monitoring = (
    <div
      class="col-12 col-lg-5 col-xl-6 justify-content-center"
      style={{ margin: "20px 0px" }}
    >
      <div class="d-flex justify-content-center align-items-center">
        <img class="img-fluid rounded shadow" src={Img07_skyhub_monitoring} />
      </div>
    </div>
  );

  const Text07_skyhub_monitoring = (
    <div class="col-12 col-lg-4 col-xl-5">
      <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
        {t("Real-time monitoring of AI operating environments")}
      </h4>
      <p className={classes.P} style={{ marginBottom: "24px" }}>
        {t(
          "구축된 인공지능 파이프라인의 서버를 실시간으로 모니터링하고 이슈에 대해 신속하게 대응할 수 있습니다."
        )}
      </p>
    </div>
  );

  const Tab08_codeTab = (
    <div
      class="col-12 col-lg-5 col-xl-6 justify-content-center"
      style={{ margin: "20px 0" }}
    >
      <div id="minimal-tabs">
        <ul
          class="nav nav-tabs d-flex justify-content-center"
          role="tablist"
          style={{ marginBottom: "16px" }}
        >
          {language.map((lang, i) => {
            return (
              <li
                class="nav-item"
                role="presentation"
                style={{ width: "20%", fontSize: "12px" }}
              >
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
          <div class="row justify-content-center">
            <div
              class="col d-flex justify-content-center align-items-center"
              style={{
                height: "300px",
                width: "100%",
                overflow: "hidden",
                borderRadius: "0.5rem",
              }}
            >
              <img className={classes.Code} src={langImgs[selectedNav]} />
            </div>
          </div>
          {/* </div> */}
        </div>
      </div>
    </div>
  );

  const Text08_codeTab = (
    <div class="col-12 col-lg-4 col-xl-5" style={{ padding: "8px 24px" }}>
      <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
        {t("Rapid AI deployment using APIs")}
      </h4>
      <p className={classes.P} style={{ marginBottom: "24px" }}>
        {t(
          "DS2.ai의 SKYHUB AI는 완성된 AI를 신속하게 배포하고 사용할 수 있도록 4가지 언어의 API를 자동 생성합니다."
        )}
      </p>
    </div>
  );

  const ImgFrame09_serviceapp = (
    <div
      class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center"
      style={{ margin: "20px 0" }}
    >
      <img class="img-fluid rounded" src={Img09_serviceapp} />
    </div>
  );

  const Text09_serviceapp = (
    <div
      class="col-12 col-lg-4 col-xl-5 d-flex justify-content-center"
      style={{ padding: "8px 24px" }}
    >
      <div>
        <div style={{ marginBottom: "16px" }}>
          <span
            style={{
              color: "var(--main)",
              border: "2px solid var(--main)",
              fontWeight: "600",
              borderRadius: "5rem",
              padding: "1px 16px",
              fontSize: "14px",
            }}
          >
            Cloud
          </span>
        </div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Easy deployment and sharing of service apps")}
        </h4>
        <p className={classes.P}>
          {t(
            "개발된 인공지능은 API만으로 바로 배포하고 서비스에 적용할 수 있습니다. 또한, 별도의 서비스 연동 없이 서비스앱 공유하기를 통해 URL만으로 인공지능을 웹서비스화할 수 있습니다."
          )}
        </p>
      </div>
    </div>
  );

  const ImgFrame10_skyhub_edge = (
    <div
      class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center"
      style={{ margin: "20px 0" }}
    >
      <img class="img-fluid rounded" src={Img10_skyhub_edge} />
    </div>
  );

  const Text10_skyhub_edge = (
    <div
      class="col-12 col-lg-4 col-xl-5 d-flex justify-content-center"
      style={{ padding: "8px 24px" }}
    >
      <div>
        <div style={{ marginBottom: "16px" }}>
          <span
            style={{
              color: "var(--main)",
              border: "2px solid var(--main)",
              fontWeight: "600",
              borderRadius: "5rem",
              padding: "1px 16px",
              fontSize: "14px",
            }}
          >
            Edge
          </span>
        </div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Introduction of edge system and support of artificial intelligence data hub")}
        </h4>
        <p className={classes.P}>
          {t(
            "DS2.ai로 개발한 인공지능을 엣지 디바이스에 탑재하고 SKYHUB AI와의 연동을 통해 엣지 디바이스의 추론 결과를 통합 환경에서 관리할 수 있습니다. 또한, 이를 바탕으로 인공지능 정확도 향상을 위한 재학습을 지원합니다."
          )}
        </p>
      </div>
    </div>
  );

  const ImgFrame11_skyhub_sensor = (
    <div
      class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center"
      style={{ margin: "20px 0" }}
    >
      <img class="img-fluid rounded" src={Img11_skyhub_sensor} />
    </div>
  );

  const Text11_skyhub_sensor = (
    <div
      class="col-12 col-lg-4 col-xl-5 d-flex justify-content-center"
      style={{ padding: "8px 24px" }}
    >
      <div>
        <div style={{ marginBottom: "16px" }}>
          <span
            style={{
              color: "var(--main)",
              border: "2px solid var(--main)",
              fontWeight: "600",
              borderRadius: "5rem",
              padding: "1px 16px",
              fontSize: "14px",
            }}
          >
            Sensor
          </span>
        </div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("Supports sensor-based artificial intelligence hub for anomaly detection")}
        </h4>
        <p className={classes.P}>
          {t(
            "다양한 센서를 통해 수집되는 수치 데이터를 활용하여 인공지능을 개발하기 위한 허브를 구성하고 이상탐지 및 인공지능 기반의 다양한 추론 환경을 구성할 수 있습니다."
          )}
        </p>
      </div>
    </div>
  );

  const ImgFrame12_codeSDKPython = (
    <div
      class="col-12 col-lg-5 col-xl-6 d-flex justify-content-center align-items-center"
      style={{ margin: "20px 0" }}
    >
      <img
        class="img-fluid"
        src={Img12_codeSDKPython}
        style={{ width: "520px", padding: "20px" }}
      />
    </div>
  );

  const Text12_codeSDKPython = (
    <div
      class="col-12 col-lg-5 d-flex justify-content-start justify-content-lg-center"
      style={{ padding: "8px 24px" }}
    >
      <div>
        <h4 className={classes.H4} style={{ marginBottom: "16px" }}>
          {t("SDK support for convenient programming development")}
        </h4>
        <p className={classes.P}>
          {t(
            "DS2.ai의 MLOps를 위한 데이터 파이프라인을 Python 코드로 구축할 수 있습니다. SDK를 통해 데이터의 업로드부터 라벨링 생성, 인공지능 학습 및 배포까지 모든 기능을 사용할 수 있습니다."
          )}
        </p>
      </div>
    </div>
  );

  const closeIntro = () => {
    props.setIntroOn(false);
    props.setIntroOffClicked(true);
  };

  return (
    <div className={classes.Body}>
      <div class="marketBlock top">
        <div class="container">
          <div class="row justify-content-center rowTop">
            <div class="col-12 text-center">
              <h1 className={classes.H1}>{t("Cloud MLOps at DS2.ai")}</h1>
              <p
                className={classes.P}
                style={{
                  fontSize: "20px",
                  opacity: "0.80",
                  lineHeight: "2em",
                  color: "var(--bg)",
                }}
              >
                {t(
                  "SKYHUB AI는 인공지능의 배포 및 운영, 관리를 위한 통합 MLOps를 제공합니다. DS2.ai에서 개발한 인공지능 뿐만 아니라 자체 개발 혹은 운영 중인 인공지능 또한 SKYHUB AI로 관리할 수 있습니다."
                )}
                <br />
              </p>
              <Button
                id="skyhubintro_top_start_btn"
                shape="blueContained"
                size="xl"
                onClick={closeIntro}
              >
                {t("Start Service")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <section className={classes.Section}>
        <div class="container bodyContainer">
          <div class="row justify-content-center">
            <div class="col-12 text-center" style={{ padding: "8px 24px" }}>
              <div>
                <h2 className={classes.H2} style={{ textAlign: "center" }}>
                  {t("Optimal environment for using artificial intelligence")}
                </h2>
                <p class="text-center justify-content-center align-items-xl-center">
                  {t(
                    "SKYHUB AI는 인공지능의 배포부터 운영/관리 및 고도화까지 제공하는 진정한 MLOps 서비스입니다."
                  )}
                  <br />
                </p>
              </div>
            </div>
            <div class="col-10">
              <img class="img-fluid rounded" src={Img01_customServer_big} />
            </div>
          </div>
        </div>
        <div class="container whyLabeling" style={{ marginTop: "10%" }}>
          <div class="row no-gutters container">
            {whyLabTitle.map((title, i) => {
              return (
                <div class="col-md-2 mx-auto">
                  <div style={{ height: "100%" }}>
                    <div
                      class="d-flex justify-content-start align-items-center"
                      style={{ marginBottom: "1rem" }}
                    >
                      <img
                        class="img-fluid"
                        src={whyLabImg[i]}
                        style={{ maxHeight: "24px", marginRight: "12px" }}
                      />
                      <h6
                        className={classes.H6}
                        style={{ letterSpacing: "-1px", marginBottom: "0" }}
                      >
                        {t(title)}
                      </h6>
                    </div>
                    <div style={{ marginBottom: "2rem" }}>
                      <p
                        class="small"
                        style={{
                          opacity: "0.80",
                          margin: "0px",
                          lineHeight: "1.5",
                          color: "white",
                        }}
                      >
                        {t(whyLabContents[i])}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* PC version */}
        <div class="container d-none d-lg-block bodyContainer">
          <div
            class="row d-xl-flex justify-content-between align-items-center"
            style={{ marginTop: "10%" }}
          >
            {ImgFrame03_customServer_mid}
            {Text03_customServer_mid}
          </div>
          <div
            class="row d-xl-flex justify-content-between align-items-center"
            style={{ marginTop: "10%" }}
          >
            {Text04_skyhub_deploy}
            {ImgFrame04_skyhub_deploy}
          </div>
          <div
            class="row justify-content-between align-items-center"
            style={{ marginTop: "10%" }}
          >
            {ImgFrame05_retraining}
            {Text05_retraining}
          </div>
          <div
            class="row justify-content-between align-items-center"
            style={{ marginTop: "10%" }}
          >
            {Text06_customServer}
            {Table06_customServer}
          </div>
          <div
            class="row justify-content-between align-items-center"
            style={{ marginTop: "10%" }}
          >
            {ImgFrame07_skyhub_monitoring}
            {Text07_skyhub_monitoring}
          </div>
          <div
            class="row justify-content-between align-items-center"
            style={{ marginTop: "10%" }}
          >
            {Text08_codeTab}
            {Tab08_codeTab}
          </div>
          <div
            class="row justify-content-between align-items-center"
            id="section-cloud"
            style={{ marginTop: "10%" }}
          >
            {ImgFrame09_serviceapp}
            {Text09_serviceapp}
          </div>
          <div
            class="row justify-content-between align-items-center"
            id="section-edge"
            style={{ marginTop: "10%" }}
          >
            {Text10_skyhub_edge}
            {ImgFrame10_skyhub_edge}
          </div>
          <div
            class="row justify-content-between align-items-center"
            id="section-sensor"
            style={{ marginTop: "10%" }}
          >
            {ImgFrame11_skyhub_sensor}
            {Text11_skyhub_sensor}
          </div>
          <div class="row justify-content-between align-items-center">
            {Text12_codeSDKPython}
            {ImgFrame12_codeSDKPython}
          </div>
        </div>
        {/* Mobile version */}
        <div class="container d-block d-lg-none bodyContainer">
          <div class="row" style={{ marginTop: "20%" }}>
            {Text03_customServer_mid}
            {ImgFrame03_customServer_mid}
          </div>
          <div class="row" style={{ marginTop: "20%" }}>
            {Text04_skyhub_deploy}
            {ImgFrame04_skyhub_deploy}
          </div>
          <div class="row" style={{ marginTop: "20%" }}>
            {Text05_retraining}
            {ImgFrame05_retraining}
          </div>
          <div class="row" style={{ marginTop: "20%" }}>
            {Text06_customServer}
            {Table06_customServer}
          </div>
          <div class="row" style={{ marginTop: "20%" }}>
            {Text07_skyhub_monitoring}
            {ImgFrame07_skyhub_monitoring}
          </div>
          <div class="row" style={{ marginTop: "20%" }}>
            {Text08_codeTab}
            {Tab08_codeTab}
          </div>
          <div class="row" style={{ marginTop: "20%" }}>
            {Text09_serviceapp}
            {ImgFrame09_serviceapp}
          </div>
          <div class="row" style={{ marginTop: "20%" }}>
            {Text10_skyhub_edge}
            {ImgFrame10_skyhub_edge}
          </div>
          <div class="row" style={{ marginTop: "20%" }}>
            {Text11_skyhub_sensor}
            {ImgFrame11_skyhub_sensor}
          </div>
          <div class="row" style={{ marginTop: "10%" }}>
            {Text12_codeSDKPython}
            {ImgFrame12_codeSDKPython}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <Button
            id="skyhubintro_bottom_start_btn"
            shape="blueContained"
            size="xl"
            onClick={closeIntro}
          >
            {t("Start Service")}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SkyhubIntro;
