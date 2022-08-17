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
      <div className={classes.subTitleText}>{t("CLICK AI")}</div>
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
                        <span>{t("It visualizes big data in a variety of graphs to improve decision accuracy.")}</span>
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
                        <span>{t("It supports the Automation Process (RPA) so that multiple AI models can be connected and used.")}</span>
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
                        <span>{t("It provides big data DB through clouds that can be used in conjunction with CLICK AI.")}</span>
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
                        <span>{t("It provides big data as an API server for use in conjunction with IOT or other applications.")}</span>
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
                          {t("In marketing, it is important to bring invisible customer behavior to the surface, to more effectively achieve brand goals, analyze them, maximize revenue, minimize costs, and improve corporate ROI.")}{" "}
                          {t("It builds a model that combines analysis and decision making with artificial intelligence (AI) technology to continuously improve marketing effectiveness.")}
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
                          {t("To manage costs and maximize profitable growth, the company can identify customer, channel, product, and market trends and analyze market trends quickly and accurately through the design of deep learning algorithms.")}{" "}
                          {t("By making demand plans and operational cost forecasts linked to revenue forecasts, artificial intelligence (AI) technology can be conveniently utilized to identify and assess potential risks in more detail for complex market and products.")}
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
                          {t("Predicting defects in products produced by manufacturers is critical because they are directly related to profit.")}{" "}
                          {t("The traditional way to identify defective products is to identify them manually, which is expensive and inefficient because there is a high probability of human error and you should hire a lot of people for this manual work.")}{" "}
                          {t("You can predict the defection of products more quickly and accurately by using CLICK AI’s deep learning technology through sensor-based collection of data such as pressure, speed, and temperature that can affect product quality.")}
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
                          {t("Today, most patients have smartphones and can use technology.")} {t("이를 통해 환자 참여를 개선하는 혁신적인 AI 응용 프로그램을 사용 할 수 있습니다.")}{" "}
                          {t("Using CLICK AI, deep learning artificial intelligence enables medical providers to participate in patients through intelligent media that can understand patient behavior, so that they can better understand the patient's condition, and through the distribution of artificial intelligence solutions, they can continuously manage patients in relation to reservations, examinations, and health examinations.")}
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
                          {t("The top priority to start farming is which breed you choose to breed.")} {t("종 선택은 물과 영양소 사용의 효과, 기후 변화에 대한 적응, 질병 저항성, 영향소 함량 혹은 맛을 결정하는 특정 유전자를 찾아야 하는 복잡한 과정입니다.")}{" "}
                          {t("CLICK AI's deep learning model uses decades of field data to analyze crop performance and new characteristics developed in various climates or soil processes.")} {t("이를 바탕으로 어떤 유전자가 식물에 유리한 특성을 부여 할 수 있는 지 예측할 수 있습니다.")}
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
                          {t("CLICK AI transforms one-way industrial structures in various industries into interdependent networks.")}{" "}
                          {t("The supply, distribution, outsourcing, technology, marketing, and sales industries are combined with big data and artificial intelligence to establish the CLICK AI business ecosystem to provide overall participation not only in one industry but also in the industry concerned.")}
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
