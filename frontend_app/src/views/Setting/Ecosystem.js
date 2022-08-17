import React, { useState, useEffect } from "react";

// api
import * as api from "controller/api.js";
import currentTheme from "assets/jss/custom.js";
import { fileurl } from "controller/api";
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import { IS_ENTERPRISE } from "variables/common";

import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TablePagination from "@material-ui/core/TablePagination";
import Loading from "components/Loading/Loading.js";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import HelpOutlineIcon from "@material-ui/core/SvgIcon/SvgIcon";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import CheckIcon from "@material-ui/icons/Check";

const Ecosystem = ({ history, checkAsyncTasksChanged, asyncTasksFromProps, setSnackbarOption }) => {
  const classes = currentTheme();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const rpa_screenshot = fileurl + "asset/front/img/ecosystem/rpa_screenshot.png";
  const db_screenshot = fileurl + "asset/front/img/ecosystem/db_screenshot.png";
  const api_screenshot = fileurl + "asset/front/img/ecosystem/api_screenshot.png";
  const bi_screenshot = fileurl + "asset/front/img/ecosystem/bi_screenshot.png";

  return (
    <div>
      <div className={classes.subTitleText}>{t("CLICK AI를 효율적으로 사용하기 위한 다양한 에코시스템을 제공합니다.")}</div>
      {/*<Divider className={classes.titleDivider} />*/}
      <div>
        {isLoading ? (
          <div className={classes.loading}>
            <Loading size={400} />
          </div>
        ) : (
          <div>
            <GridContainer>
              <GridContainer xs={1} lg={1}></GridContainer>
              <GridContainer xs={5} lg={5} style={{ height: "100%" }}>
                <>
                  <GridItem xs={12} lg={12} style={{ marginTop: "20px", textAlign: "center" }}>
                    <h4>{t("Technical Ecosystem")}</h4>
                  </GridItem>
                  <GridItem xs={12} lg={12}>
                    <Container component="main" maxWidth="false" className={classes.mainCard}>
                      <Typography className={classes.labelTitle} gutterBottom>
                        {/* <PlaylistAddCheckIcon style={{marginRight: '8px', color: 'black'}} /> */}
                        <b>{t("Data Visualization")}</b>
                      </Typography>
                      <Typography className={classes.content}>
                        <img src={bi_screenshot} alt={"bi_screenshot"} className={classes.logo} style={{ width: "100%" }} />
                        <br />
                        <span>{t("빅데이터를 다양한 종류의 그래프로 시각화하여 보여줌으로써 의사 결정의 정확도를 높여줍니다.")}</span>
                        <br />
                        {!IS_ENTERPRISE && (
                          <Button
                            onClick={() => {
                              window.ChannelIO("show");
                            }}
                            className={classes.defaultOutlineButton}
                            style={{ width: "100px", borderRadius: "10px" }}
                          >
                            {t("Contact us")}
                          </Button>
                        )}
                      </Typography>
                    </Container>
                  </GridItem>
                  <GridItem xs={12} lg={12}>
                    <Container component="main" maxWidth="false" className={classes.mainCard}>
                      <Typography className={classes.labelTitle} gutterBottom>
                        {/* <PlaylistAddCheckIcon style={{marginRight: '8px', color: 'black'}} /> */}
                        <b>Event Driven RPA</b>
                      </Typography>
                      <Typography className={classes.content}>
                        <img src={rpa_screenshot} alt={"rpa_screenshot"} className={classes.logo} style={{ width: "100%" }} />
                        <br />
                        <span>{t("여러가지 AI 모델을 연결하여 사용할 수 있도록 자동화 프로세스 (RPA) 를 지원합니다.")}</span>
                        <br />
                        {!IS_ENTERPRISE && (
                          <Button
                            onClick={() => {
                              window.ChannelIO("show");
                            }}
                            className={classes.defaultOutlineButton}
                            style={{ width: "100px", borderRadius: "10px" }}
                          >
                            {t("Contact us")}
                          </Button>
                        )}
                      </Typography>
                    </Container>
                  </GridItem>
                  <GridItem xs={12} lg={12}>
                    <Container component="main" maxWidth="false" className={classes.mainCard}>
                      <Typography className={classes.labelTitle} gutterBottom>
                        {/* <PlaylistAddCheckIcon style={{marginRight: '8px', color: 'black'}} /> */}
                        <b>{t("Big Data DB")}</b>
                      </Typography>
                      <Typography className={classes.content}>
                        <img src={db_screenshot} alt={"rpa_screenshot"} className={classes.logo} style={{ width: "100%" }} />
                        <br />
                        <span>{t("CLICK AI와 연동하여 사용할 수 있는 빅데이터 DB를 클라우드를 통해 제공합니다.")}</span>
                        <br />
                        {!IS_ENTERPRISE && (
                          <Button
                            onClick={() => {
                              window.ChannelIO("show");
                            }}
                            className={classes.defaultOutlineButton}
                            style={{ width: "100px", borderRadius: "10px" }}
                          >
                            {t("Contact us")}
                          </Button>
                        )}
                      </Typography>
                    </Container>
                  </GridItem>

                  <GridItem xs={12} lg={12}>
                    <Container component="main" maxWidth="false" className={classes.mainCard}>
                      <Typography className={classes.labelTitle} gutterBottom>
                        {/* <PlaylistAddCheckIcon style={{marginRight: '8px', color: 'black'}} /> */}
                        <b>{t("API Server")}</b>
                      </Typography>
                      <Typography className={classes.content}>
                        <img src={api_screenshot} alt={"api_screenshot"} className={classes.logo} style={{ width: "100%" }} />
                        <br />
                        <span>{t("빅데이터를 IOT나 다른 어플리케이션과 연계 사용할 수 있도록 API 서버로 제공합니다.")}</span>
                        <br />
                        {!IS_ENTERPRISE && (
                          <Button
                            onClick={() => {
                              window.ChannelIO("show");
                            }}
                            className={classes.defaultOutlineButton}
                            style={{ width: "100px", borderRadius: "10px" }}
                          >
                            {t("Contact us")}
                          </Button>
                        )}
                      </Typography>
                    </Container>
                  </GridItem>
                </>
              </GridContainer>
              <GridContainer xs={1} lg={1}></GridContainer>
              <GridContainer xs={5} lg={5} style={{ height: "100%" }}>
                <>
                  <GridItem xs={12} lg={12} style={{ marginTop: "20px", textAlign: "center" }}>
                    <h4>{t("Business Ecosystem")}</h4>
                  </GridItem>

                  <GridItem xs={12} lg={12}>
                    <Container component="main" maxWidth="false" className={classes.mainCard}>
                      <Typography className={classes.labelTitle} gutterBottom>
                        {/* <PlaylistAddCheckIcon style={{marginRight: '8px', color: 'black'}} /> */}
                        <b>{t("Marketing")}</b>
                      </Typography>
                      <Typography className={classes.content}>
                        <video style={{ width: "100%" }} autoPlay loop>
                          <source src={fileurl + "asset/ecosystem/marketing.mov"} type="video/mp4" />
                        </video>
                        <br />
                        <span>
                          {t("마케팅에서 중요한 것은 보이지 않는 고객의 행동을 표면화 시켜 브랜드의 목표를 보다 효과적으로 달성하여 분석하여 수익을 최대화 하고 비용을 최소화시키면서 기업의 ROI를 향상 시키는 것입니다.")}{" "}
                          {t("인공 지능 (AI) 기술을 사용하여 분석과 의사 결정을 결합하는 모델을 구축하여 마케팅 효과를 지속적으로 개선 할 수 있습니다.")}
                        </span>
                        <br />
                        {!IS_ENTERPRISE && (
                          <Button
                            onClick={() => {
                              window.ChannelIO("show");
                            }}
                            className={classes.defaultOutlineButton}
                            style={{ width: "100px", borderRadius: "10px" }}
                          >
                            {t("Contact us")}
                          </Button>
                        )}
                      </Typography>
                    </Container>
                  </GridItem>
                  <GridItem xs={12} lg={12}>
                    <Container component="main" maxWidth="false" className={classes.mainCard}>
                      <Typography className={classes.labelTitle} gutterBottom>
                        {/* <PlaylistAddCheckIcon style={{marginRight: '8px', color: 'black'}} /> */}
                        <b>{t("Business")}</b>
                      </Typography>
                      <Typography className={classes.content}>
                        <video style={{ width: "100%" }} autoPlay loop>
                          <source src={fileurl + "asset/ecosystem/business.mov"} type="video/mp4" />
                        </video>
                        <br />
                        <span>
                          {t("비용을 관리하고 수익성있는 성장을 극대화하기 위해 고객, 채널, 제품, 시장 동향을 파악해 딥러닝 알고리즘 설계를 통해 빠르고 정확하게 시장 추세를 분석 할 수 있습니다.")}{" "}
                          {t("이를 반영한 수익 예측에 연결된 수요 계획, 운영 비용 예측을 함으로써 시장과 상품의 복잡한 상황에서 더욱 세밀하게 잠재적인 위험을 식별해 평가하기 위해 인공 지능 (AI)기술을 편리하게 활용할 수 있습니다.")}
                        </span>
                        <br />
                        {!IS_ENTERPRISE && (
                          <Button
                            onClick={() => {
                              window.ChannelIO("show");
                            }}
                            className={classes.defaultOutlineButton}
                            style={{ width: "100px", borderRadius: "10px" }}
                          >
                            {t("Contact us")}
                          </Button>
                        )}
                      </Typography>
                    </Container>
                  </GridItem>
                  <GridItem xs={12} lg={12}>
                    <Container component="main" maxWidth="false" className={classes.mainCard}>
                      <Typography className={classes.labelTitle} gutterBottom>
                        {/* <PlaylistAddCheckIcon style={{marginRight: '8px', color: 'black'}} /> */}
                        <b>{t("Manufacturing Industry")}</b>
                      </Typography>
                      <Typography className={classes.content}>
                        <video style={{ width: "100%" }} autoPlay loop>
                          <source src={fileurl + "asset/ecosystem/manufactoring.mov"} type="video/mp4" />
                        </video>
                        <br />
                        <span>
                          {t("제조회사에서 생산되는 제품의 불량을 예측하는 것은 기업의 이익과 직접적으로 관련되기 때문에 매우 중요합니다.")}{" "}
                          {t("불량품을 판별하는 전통적인 방법은 사람이 수작업으로 불량품을 식별하는 것인데, 이는 인적 오류에 의한 오류 발생의 가능성이 크고 많은 사람에게 의존해야 하므로 고비용이며, 사후처방법에 불과합니다.")}{" "}
                          {t("제품 품질에 영향을 미칠 수 있는 압력, 속도, 온도 등의 데이터를 센서를 이용한 수집을 통해 CLICK AI의 딥러닝 기술을 활용한다면 제품의 불량을 신속하고 정확하게 예측할 수 있습니다.")}
                        </span>
                        <br />
                        {!IS_ENTERPRISE && (
                          <Button
                            onClick={() => {
                              window.ChannelIO("show");
                            }}
                            className={classes.defaultOutlineButton}
                            style={{ width: "100px", borderRadius: "10px" }}
                          >
                            {t("Contact us")}
                          </Button>
                        )}
                      </Typography>
                    </Container>
                  </GridItem>
                  <GridItem xs={12} lg={12}>
                    <Container component="main" maxWidth="false" className={classes.mainCard}>
                      <Typography className={classes.labelTitle} gutterBottom>
                        {/* <PlaylistAddCheckIcon style={{marginRight: '8px', color: 'black'}} /> */}
                        <b>{t("Medical Industry")}</b>
                      </Typography>
                      <Typography className={classes.content}>
                        <video style={{ width: "100%" }} autoPlay loop>
                          <source src={fileurl + "asset/ecosystem/medical.mov"} type="video/mp4" />
                        </video>
                        <br />
                        <span>
                          {t("오늘날 대부분의 환자는 스마트 폰을 가지고 있으며 기술을 사용할 수 있습니다.")} {t("이를 통해 환자 참여를 개선하는 혁신적인 AI 응용 프로그램을 사용 할 수 있습니다.")}{" "}
                          {t("CLICK AI를 활용한 딥러닝 인공지능은 의료 제공자가 환자 행동을 이해할 수 있는 지능형 매체를 통해 환자를 참여 시킬 수 있도록 하여 환자의 상태를 더 잘 파악할 수 있으며, 인공지능 솔루션 배포를 통해 예약, 검사 및 건강 검진과 관련하여 환자를 지속적으로 관리 할 수 있습니다.")}
                        </span>
                        <br />
                        {!IS_ENTERPRISE && (
                          <Button
                            onClick={() => {
                              window.ChannelIO("show");
                            }}
                            className={classes.defaultOutlineButton}
                            style={{ width: "100px", borderRadius: "10px" }}
                          >
                            {t("Contact us")}
                          </Button>
                        )}
                      </Typography>
                    </Container>
                  </GridItem>
                  <GridItem xs={12} lg={12}>
                    <Container component="main" maxWidth="false" className={classes.mainCard}>
                      <Typography className={classes.labelTitle} gutterBottom>
                        {/* <PlaylistAddCheckIcon style={{marginRight: '8px', color: 'black'}} /> */}
                        <b>{t("Agricultural Industry")}</b>
                      </Typography>
                      <Typography className={classes.content}>
                        <video style={{ width: "100%" }} autoPlay loop>
                          <source src={fileurl + "asset/ecosystem/farm.mp4"} type="video/mp4" />
                        </video>
                        <br />
                        <span>
                          {t("농업을 시작하기에 최우선적으로 고려되는 것은 어떤 품종을 선택하여 육종하느냐는 것입니다.")} {t("종 선택은 물과 영양소 사용의 효과, 기후 변화에 대한 적응, 질병 저항성, 영향소 함량 혹은 맛을 결정하는 특정 유전자를 찾아야 하는 복잡한 과정입니다.")}{" "}
                          {t("CLICK AI의 딥러닝 모델은 수십년의 현장 데이터를 사용하여 다양한 기후 혹은 토양에서의 작물 성능과 프로세스에서 개발 된 새로운 특성을 분석할 수 있습니다.")} {t("이를 바탕으로 어떤 유전자가 식물에 유리한 특성을 부여 할 수 있는 지 예측할 수 있습니다.")}
                        </span>
                        <br />
                        {!IS_ENTERPRISE && (
                          <Button
                            onClick={() => {
                              window.ChannelIO("show");
                            }}
                            className={classes.defaultOutlineButton}
                            style={{ width: "100px", borderRadius: "10px" }}
                          >
                            {t("Contact us")}
                          </Button>
                        )}
                      </Typography>
                    </Container>
                  </GridItem>
                  <GridItem xs={12} lg={12}>
                    <Container component="main" maxWidth="false" className={classes.mainCard}>
                      <Typography className={classes.labelTitle} gutterBottom>
                        {/* <PlaylistAddCheckIcon style={{marginRight: '8px', color: 'black'}} /> */}
                        <b>{t("Others")}</b>
                      </Typography>
                      <Typography className={classes.content}>
                        <video style={{ width: "100%" }} autoPlay loop>
                          <source src={fileurl + "asset/ecosystem/etc.mov"} type="video/mp4" />
                        </video>
                        <br />
                        <span>
                          {t("CLICK AI는 다양한 산업군에서 단방향의 산업구조를 상호 의존적인 네트워크의 구축으로 변화시킵니다.")}{" "}
                          {t("공급업, 유통업, 아웃소싱업, 기술업, 마케팅업 그리고 판매업까지 빅데이터와 인공지능을 통한 결합으로 CLICK AI 비지니스 에코 시스템 구축으로 하나의 산업분야만이 아닌 해당 산업에 전반적인 참여를 제공합니다.")}
                        </span>
                        <br />
                        {!IS_ENTERPRISE && (
                          <Button
                            onClick={() => {
                              window.ChannelIO("show");
                            }}
                            className={classes.defaultOutlineButton}
                            style={{ width: "100px", borderRadius: "10px" }}
                          >
                            {t("Contact us")}
                          </Button>
                        )}
                      </Typography>
                    </Container>
                  </GridItem>
                </>
              </GridContainer>
            </GridContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Ecosystem);
