import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import Cookies from "helpers/Cookies";
import * as api from "controller/api.js";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import { fileurl } from "controller/api";
import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import { addFilesForQuickStart } from "redux/reducers/projects.js";
import TrainTutorial from "components/Guide/TrainTutorial";
import { IS_ENTERPRISE } from "variables/common";
import "assets/css/material-control.css";

import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import { CSVReader } from "react-papaparse";
import { ReactTitle } from "react-meta-tags";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { withStyles } from "@material-ui/core/styles";
import {
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from "@material-ui/core";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import { CircularProgress } from "@mui/material";

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: "20px !important",
    borderRadius: "50px",
    border: "1px solid rgba(240, 240, 240, 0.5)",
    boxSizing: "border-box",
  },
  colorPrimary: {
    backgroundColor:
      theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
  },
  bar: {
    height: "105% !important",
    borderRadius: "50px",
    backgroundColor: "#1a90ff",
    border: "1px solid rgba(208, 208, 208, 0.5)",
    boxSizing: "border-box",
  },
}))(LinearProgress);

const Main = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, projects } = useSelector(
    (state) => ({ user: state.user, projects: state.projects }),
    []
  );
  const { t } = useTranslation();
  const [newsLists, setNewsLists] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploadFileChanged, setIsUploadFileChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usages, setUsages] = useState([]);
  const [deposit, setDeposit] = useState(0);
  const [nowDeposit, setNowDeposit] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);

  const defaultAmt = 10;
  const usageInfoDict = [
    {
      title: "Connector",
      ko_src: "https://krdocs.ds2.ai/dataset_00_overview/",
      en_src: "https://docs.ds2.ai/dataset_00_overview_en/",
      color: "#F2994A",
      guide_name: "DS2 DATASET",
    },
    {
      title: "Annotation",
      ko_src: "https://krdocs.ds2.ai/label_00_overview/",
      en_src: "https://docs.ds2.ai/label_00_overview_en/",
      color: "#6FCF97",
      guide_name: "LABELING AI",
    },
    {
      title: "Model",
      ko_src: "https://krdocs.ds2.ai/click_00_overview/",
      en_src: "https://docs.ds2.ai/click_00_overview_en/",
      color: "#2F80ED",
      guide_name: "CLICK AI",
    },
    {
      title: "Deploy",
      ko_src: "https://krdocs.ds2.ai/deploy_00_overview/",
      en_src: "https://docs.ds2.ai/deploy_00_overview_en/",
      color: "#BB6BD9",
      guide_name: "SKYHUB AI",
    },
    {
      title: "Market",
      ko_src: "https://krdocs.ds2.ai/ds2_aimarket/",
      en_src: "https://docs.ds2.ai/ds2_aimarket_en/",
      color: "#56CCF2",
      guide_name: "AI Market",
    },
  ];

  const marketServiceFive = {
    233517: {
      id: 233517,
      name: "오프라인 매장 분석",
      img: fileurl + "asset/img_market_common_2.jpg",
    },
    233518: {
      id: 233518,
      name: "전광판 노출도 분석",
      img: fileurl + "asset/car_billboard.jpg",
    },
    233519: {
      id: 233519,
      name: "스포츠 훈련 분석",
      img: fileurl + "asset/img_market_common_4.jpg",
    },
    233520: {
      id: 233520,
      name: "재활 훈련 분석",
      img: fileurl + "asset/recovery_training.jpg",
    },
    233521: {
      id: 233521,
      name: "안무 분석",
      img: fileurl + "asset/kpop.jpg",
    },
  };

  useEffect(() => {
    if (!Cookies.getCookie("jwt")) {
      return;
    }
    const userBrowser = navigator.userAgent.toLowerCase();
    var isChrome =
      /chrome/.test(userBrowser) &&
      userBrowser.indexOf("whale") === -1 &&
      userBrowser.indexOf("edg") === -1;
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent.toLowerCase()
    );
    if (isMobile || !isChrome) {
      window.location.href = "/error";
    }
  }, []);

  // // Key값 인증 훅
  // useEffect(() => {
  //   if (IS_ENTERPRISE) {
  //     api
  //       .getKeyStatus()
  //       .then((res) => {})
  //       .catch((err) => {
  //         history.push("/signout");
  //       });
  //   }
  // }, []);

  useEffect(() => {
    if (projects.filesForQuickStart && projects.categoryForQuickStart) {
      setIsLoading(false);
      history.push("/admin/dataconnector/?quickStart=ready");
    }
  }, [projects.filesForQuickStart]);

  useEffect(() => {
    if (!IS_ENTERPRISE) {
      api
        .getNews("ds2Ai")
        .then((res) => {
          setNewsLists(res.data);
        })
        .catch((e) => {
          dispatch(
            openErrorSnackbarRequestAction(t("Failed to fetch notice."))
          );
        });
    }
    // setIsLoading(true);
    // api
    //   .getUsages()
    //   .then((res) => {
    //     let responseUsages = res.data;
    //     let newUsage = [...usageInfoDict];
    //     responseUsages.map((responseUsage) => {
    //       let usageName = responseUsage.name.toLowerCase();
    //       let price = responseUsage.value;
    //       newUsage.map((usage, idx) => {
    //         let usageTitle = usage.title.toLowerCase();
    //         if (usageName.indexOf(usageTitle) >= 0) {
    //           newUsage[idx].value = price;
    //         }
    //       });

    //       if (usageName.indexOf("total") >= 0) {
    //         setTotalUsage(price > 0 ? price : 0);
    //       }

    //       if (usageName.indexOf("deposit") >= 0) {
    //         setDeposit(price);
    //       }
    //     });

    //     setUsages(newUsage);
    //     setIsLoading(false);
    //   })
    //   .catch((e) => {
    //     setIsLoading(false);
    //     console.log(e, "e");
    //   });
  }, []);

  useEffect(() => {
    if (!IS_ENTERPRISE) {
      if (user?.usages) {
        let responseUsages = user.usages;
        let newUsage = [...usageInfoDict];
        responseUsages.map((responseUsage) => {
          let usageName = responseUsage.name.toLowerCase();
          let price = responseUsage.value;
          newUsage.map((usage, idx) => {
            let usageTitle = usage.title.toLowerCase();
            if (usageName.indexOf(usageTitle) >= 0) {
              newUsage[idx].value = price;
            }
          });

          if (usageName.indexOf("total") >= 0) {
            setTotalUsage(price > 0 ? price : 0);
          }

          if (usageName.indexOf("deposit") >= 0) {
            setDeposit(price);
          }
        });
        setUsages(newUsage);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [user?.usages]);

  useEffect(() => {
    const nowDeposit = Math.max(deposit - totalUsage, 0);
    setNowDeposit(nowDeposit);
  }, [deposit, totalUsage]);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: "csv/*, zip/*, video/*, pth/*",
  });

  const dropFiles = async (files, columns) => {
    if (!files) {
      dispatch(openErrorSnackbarRequestAction(t("Please upload a file")));
      return;
    }
    if (files.length > 1) {
      dispatch(
        openErrorSnackbarRequestAction(t(`1개의 파일만 업로드 가능합니다.`))
      );
      return;
    }
    if (files[0].size > user.maximumFileSize) {
      dispatch(
        openErrorSnackbarRequestAction(
          t(
            `${user.maximumFileSize /
              1073741824}GB 크기이상의 파일은 업로드 불가합니다.`
          )
        )
      );
    } else {
      const name = files[0].name;
      const dataType = {
        csv: 2,
        zip: 3,
        mp4: 8,
        quicktime: 8,
        mov: 8,
      };
      const type = name
        .split(".")
        .pop()
        .toLowerCase();
      if (/\.(csv|zip|mp4|quicktime|mov)$/g.test(name.toLowerCase())) {
        setIsLoading(true);
        dispatch(
          addFilesForQuickStart({
            file: files,
            category: type,
            columnsForCSV: columns,
          })
        );
        return;
      } else if (/\.(pth)$/g.test(name.toLowerCase())) {
        setIsLoading(true);
        api
          .postProjectWithModelFile(files[0])
          .then((res) => {
            if (res.data) {
              dispatch(
                openSuccessSnackbarRequestAction(
                  t("The model has been uploaded.")
                )
              );
              setIsLoading(false);
              window.location.href =
                `/admin/newskyhubai/?modelid=` + res.data.model.id;
            }
          })
          .catch((err) => {
            if (err.response.data.code === "5030001") {
              dispatch(
                openErrorSnackbarRequestAction(
                  t("This is not a valid model file.")
                )
              );
            } else {
              dispatch(
                openErrorSnackbarRequestAction(
                  t("Please try again in a moment.")
                )
              );
            }
          });
      } else {
        dispatch(openErrorSnackbarRequestAction(t("Please upload file again")));
        return;
      }
    }
  };

  let fileCnt = 0;
  const handleReadCSV = (csv_string, file) => {
    fileCnt++;
    if (fileCnt > 1) {
      if (fileCnt === 2) {
        dispatch(openErrorSnackbarRequestAction(t("Choose one file")));
      }
      return;
    } else {
      if (file.name.indexOf(".csv") > -1) {
        const header = csv_string[0].data;
        dropFiles([file], header);
      } else {
        dropFiles([file], null);
      }
    }
  };

  const handleOnError = (err, file, inputElem, reason) => {
    const error = err;
    if (error) {
      console.log(error);
    }
  };

  const deleteFiles = () => {
    dispatch(
      openSuccessSnackbarRequestAction(t("The file(s) has been deleted"))
    );
  };

  const deleteUploadedFile = (files) => {
    const tempFiles = uploadFile;
    for (let idx = 0; idx < uploadFile.length; idx++) {
      if (uploadFile[idx].path === files) {
        tempFiles.splice(idx, 1);
      }
    }
    setUploadFile(tempFiles);
    setIsUploadFileChanged(true);
  };

  const csvReaderForQuickStart = () => (
    <CSVReader
      id="quickStartDropzone"
      accept="text/csv, .csv, application/vnd.ms-excel, video/*, .zip"
      onFileLoad={handleReadCSV}
      onError={handleOnError}
      onRemoveFile={deleteFiles}
      addRemoveButton
      style={{ width: "100%" }}
    >
      <ArrowDownwardIcon fontSize="large" />
      <div
        id="quickStartDropzoneContainer"
        style={{
          fontSize: "16px",
          marginTop: 12,
        }}
      >
        {t("Drag a file or click here to upload it.")}
        <div style={{ textAlign: "center" }}>
          <div>
            {"(" +
              ".csv .zip .mp4 .mov - " +
              t("Only 1 upload is allowed") +
              ")"}
          </div>
        </div>
      </div>
    </CSVReader>
  );

  const pageMainEnterprise = () => (
    <div
      className={classes.dashboardMain}
      style={{ width: "100%", minHeight: "500px", marginTop: "40px" }}
    >
      <Grid container>
        <Grid item xs={12}>
          <b className={classes.mainSubTitle} style={{ marginBottom: "10px" }}>
            {t("Quick Start")}
          </b>
        </Grid>
        <div
          className="dropzoneContainerNoBorder"
          style={{
            minHeight: "330px",
            width: "100%",
            justifyContent: "center",
          }}
        >
          {csvReaderForQuickStart()}
        </div>
      </Grid>
    </div>
  );

  const pageMainLoaded = () => {
    const dashboardMarketFive = (
      <Grid container style={{ marginTop: "50px" }}>
        <Grid
          item
          xs={6}
          md={4}
          lg={2}
          style={{
            marginBottom: "10px",
            padding: "0 5px",
          }}
        >
          <div
            id="market_newServices"
            className={classes.dashboardMarket}
            style={{
              background:
                "linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), linear-gradient(0deg, #2F80ED, #2F80ED)",
              fontSize: "24px",
            }}
          >
            <b
              style={{
                fontSize: "24px",
                margin: "auto",
                opacity: "1",
              }}
            >
              {"New Services"}
            </b>
          </div>
        </Grid>
        {Object.keys(marketServiceFive).map((idNum) => (
          <Grid
            item
            xs={6}
            md={4}
            lg={2}
            key={`market_${idNum}`}
            style={{
              marginBottom: "10px",
              padding: "0 5px",
            }}
          >
            <div
              id={"marketImg_" + idNum}
              className={classes.dashboardMarket}
              style={{
                fontSize: "18px",
                position: "relative",
                backgroundImage: `url(${marketServiceFive[idNum].img})`,
                backgroundSize: "cover",
                zIndex: "0",
              }}
            >
              <b style={{ margin: "auto" }}>
                {t(marketServiceFive[idNum].name)}
              </b>
              <div
                id={"marketLink_" + idNum}
                className={
                  classes.dashboardMarket + " " + classes.hoverOpacity07
                }
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  height: "100%",
                  width: "100%",
                  background: currentThemeColor.background2,
                  zIndex: "5",
                  cursor: "pointer",
                }}
                onClick={() => {
                  history.push("/admin/marketNewProject/?id=" + String(idNum));
                }}
              >
                <b style={{ margin: "auto" }}>
                  {t(marketServiceFive[idNum].name)}
                </b>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>
    );

    const dashboardCreditStatusBar = (
      <Grid item xs={12} md={6} style={{ padding: "0 5px" }}>
        <div
          className={classes.dashboardMain}
          style={{
            height: "300px",
          }}
        >
          <Grid container>
            <Grid item xs={12}>
              <b className={classes.mainSubTitle}>{t("Credit")}</b>
            </Grid>
            <Grid item xs={12} style={{ margin: "70px 15px" }}>
              <BorderLinearProgress
                variant="determinate"
                value={((deposit - totalUsage) / deposit) * 100}
              />
              <Grid
                container
                justifyContent="space-between"
                style={{
                  padding: "0 10px",
                  marginTop: "25px",
                }}
              >
                <Grid item style={{ fontSize: "14px" }}>
                  {t("Remaining Balance")}
                </Grid>
                <Grid item style={{ fontSize: "14px" }}>
                  {t("Deposited Amount")}
                </Grid>
              </Grid>
              <Grid
                container
                justifyContent="space-between"
                style={{
                  padding: "0 10px",
                  marginTop: "-3px",
                  fontSize: "16px",
                  fontWeight: "700",
                }}
              >
                <Grid item>
                  <span>
                    {(deposit - totalUsage).toLocaleString()}{" "}
                    <span style={{ fontSize: "14px" }}>{t("Credit")}</span>
                  </span>
                </Grid>
                <Grid item>
                  <span>
                    {deposit.toLocaleString()}{" "}
                    <span style={{ fontSize: "14px" }}>{t("Credit")}</span>
                  </span>
                </Grid>
              </Grid>
              {/* <Grid item xs={12}>
                    <Grid
                      container
                      justify="space-between"
                      style={{ padding: "0 15px" }}
                    >
                      <Grid item>
                        <span>
                          {t(
                            `사용량 ${(defaultUsedAmt / defaultAmt) * 100}%`
                          )}
                        </span>
                      </Grid>
                      <Grid item>
                        <span>{t(`전체 100%`)}</span>
                      </Grid>
                    </Grid>
                  </Grid> */}
              {/* <Grid item xs={12} style={{ padding: "20px 10px 0" }}>
                    <Typography
                      style={{ fontSize: "14px", wordBreak: "keep-all" }}
                    >
                      {t(`** AU : API UNIT 1 CR API = 1 AU, 1 OD(물체인식) API =
                      10 AU, 인물골격추출 API = 50 AU, 시멘틱 세그멘테이션 =
                      500 AU, 1 GB DATA = 2.5AU, 1 초 학습시간 = 2 AU ,
                      0.005 AU = 1 transaction)`)}
                    </Typography>
                  </Grid> */}
            </Grid>
          </Grid>
        </div>
      </Grid>
    );

    const dashboardQuickStart = () => (
      <Grid item xs={12} md={deposit > 0 ? 6 : 12} style={{ padding: "0 5px" }}>
        <div
          className={classes.dashboardMain}
          style={{
            height: "300px",
          }}
        >
          <Grid container style={{ height: "100%" }}>
            <Grid item xs={12}>
              <b className={classes.mainSubTitle}>{t("Quick Start")}</b>
            </Grid>
            <div
              className="dropzoneContainerNoBorder"
              style={{
                width: "100%",
                height: "90%",
                justifyContent: "center",
              }}
            >
              {csvReaderForQuickStart()}
            </div>
          </Grid>
        </div>
      </Grid>
    );

    const dashboardMagicCode = () => (
      <Grid item xs={12} lg={deposit > 0 ? 4 : 8}>
        <div
          className={classes.dashboardMain}
          style={{
            height: "300px",
          }}
        >
          <Grid container style={{ height: "100%" }}>
            <Grid item xs={12}>
              <b className={classes.mainSubTitle}>{t("Magic Code")}</b>
            </Grid>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CSVReader
                disable={true}
                // onFileLoad={handleReadCSV}
                // onError={handleOnError}
                // onRemoveFile={deleteFiles}
                // addRemoveButton
              >
                <ArrowDownwardIcon fontSize="large" />
                <div
                  style={{
                    fontSize: "14px",
                  }}
                >
                  {t("Drag a file or click here to upload it.")}
                  <br />
                  <br />
                </div>
              </CSVReader>
            </div>
          </Grid>
        </div>
      </Grid>
    );

    const dashboardServiceGuide = () => (
      <Grid item xs={12} lg={deposit > 0 ? 4 : 8}>
        <div
          className={classes.dashboardMain}
          style={{ height: "300px", display: "flex" }}
        >
          <Grid container>
            <Grid item xs={12}>
              <b className={classes.mainSubTitle}>
                {t(`서비스 가이드 바로가기`)}
              </b>
            </Grid>
            <Grid item xs={12}>
              <List
                style={{
                  width: "100%",
                }}
              >
                {usages.map(
                  (usage, i) =>
                    usage.guide_name && (
                      <ListItem
                        style={
                          i === usageInfoDict.length - 1
                            ? {
                                padding: "7px 8px",
                              }
                            : {
                                padding: "8px",
                                borderBottom:
                                  "1px dashed rgba(255, 255, 255, .4)",
                              }
                        }
                      >
                        <a
                          href={
                            user.language === "ko" ? usage.ko_src : usage.en_src
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "block",
                            width: "100%",
                            color: "inherit",
                          }}
                        >
                          <ListItemText
                            primary={
                              usage.title === "market"
                                ? `\u00B7 ${usage.guide_name}`
                                : `\u00B7 ${usage.guide_name}`
                            }
                          />
                        </a>
                      </ListItem>
                    )
                )}
              </List>
            </Grid>
          </Grid>
        </div>
      </Grid>
    );

    const dashboardServiceUsage = (
      <Grid item xs={12} md={8} style={{ padding: "0 5px" }}>
        <div
          className={classes.dashboardMain}
          style={{ minHeight: "415px", display: "flex" }}
        >
          <Grid container>
            <Grid item xs={12} style={{ marginBottom: "15px" }}>
              <div className={classes.mainSubTitle}>
                <span>{t(`서비스 별 사용 현황(무료 제공량 포함)`)}</span>
                <span
                  onClick={() => {
                    history.push("/admin/setting/payment");
                  }}
                  style={{
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "400",
                  }}
                >
                  {t("More")}
                </span>
              </div>
            </Grid>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={6} style={{ position: "relative" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={usages}
                        innerRadius={95}
                        outerRadius={115}
                        startAngle={90}
                        endAngle={-270}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                      >
                        {usages.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={usages[index % usages.length].color}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    <b style={{ display: "block", fontSize: "20px" }}>
                      {totalUsage.toLocaleString()} {t("Credit")}
                    </b>
                    <span>({t(`총 사용량`)})</span>
                  </div>
                </Grid>
                <Grid item xs={5}>
                  <Grid
                    container
                    style={{
                      paddingBottom: "10px",
                      borderBottom: "1px solid #fff",
                    }}
                  >
                    {usages.map((usage, i) => (
                      <React.Fragment key={`usage_usageIdxs_${i}`}>
                        {(i === 0 || i === 4) && (
                          <Grid
                            item
                            xs={12}
                            key={usage.name}
                            style={{
                              marginBottom: "8px",
                              marginTop: i === 0 ? "0" : "10px",
                              fontWeight: "700",
                            }}
                          >
                            {i === 0 ? "Studio" : "Market"}
                          </Grid>
                        )}
                        <Grid item key={usage.name} xs={12}>
                          <Grid
                            container
                            alignItems="center"
                            spacing={2}
                            style={{
                              padding: "0 10px",
                              marginBottom: "2px",
                            }}
                          >
                            <Grid
                              item
                              style={{
                                width: "25px",
                                height: "25px",
                                backgroundColor: `${usage.color}`,
                              }}
                            />
                            <Grid
                              item
                              style={{
                                paddingRight: 0,
                                fontSize: "16px",
                              }}
                            >
                              {t(`${usage.title}`)}
                            </Grid>
                            <Grid
                              item
                              xs
                              style={{
                                textAlign: "right",
                                paddingRight: 0,
                                fontSize: "16px",
                              }}
                            >
                              {usage.value.toLocaleString()}{" "}
                              <span style={{ fontSize: "14px" }}>
                                {t("Credit")}
                              </span>
                            </Grid>
                          </Grid>
                        </Grid>
                      </React.Fragment>
                    ))}
                  </Grid>
                  <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    style={{
                      padding: "10px 5px",
                      fontSize: "16px",
                    }}
                  >
                    <Grid item>
                      <b>{t(`총 사용량`)}</b>
                    </Grid>
                    <Grid item>
                      <b>
                        {totalUsage.toLocaleString()}{" "}
                        <span style={{ fontSize: "14px" }}>{t("Credit")}</span>
                      </b>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Grid>
    );

    const dashboardNotice = (
      <Grid item xs={12} md={4} style={{ padding: "0 5px" }}>
        <div className={classes.dashboardMain} style={{ minHeight: "415px" }}>
          <Grid style={{ marginBottom: "18px" }}>
            <b className={classes.mainSubTitle}>{t("Notice")}</b>
          </Grid>
          <List
            style={{
              width: "100%",
              padding: "0",
              fontSize: "16px",
            }}
          >
            {newsLists && newsLists.length > 0 ? (
              newsLists.map((v, i) => (
                <ListItem key={v.id} style={{ padding: "0 0 0 8px" }}>
                  <a
                    href="/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: "100%", color: "inherit" }}
                  >
                    <ListItemText primary={v.newsTitle} />
                    <ListItemSecondaryAction>
                      {v.newsDate.substr(0, 10)}
                    </ListItemSecondaryAction>
                  </a>
                </ListItem>
              ))
            ) : (
              <div style={{ fontSize: 16 }}>
                {t("There are no registered notices.")}
              </div>
            )}
          </List>
        </div>
      </Grid>
    );

    return (
      <>
        {dashboardMarketFive}
        <Grid container>
          {deposit > 0 && dashboardCreditStatusBar}
          {dashboardQuickStart()}
          {/* {dashboardMagicCode()} */}
          {/* {dashboardServiceGuide()} */}
        </Grid>
        <Grid container>
          {dashboardServiceUsage}
          {dashboardNotice}
        </Grid>
      </>
    );
  };

  return (
    <>
      <ReactTitle title={"DS2.ai - " + t("Main")} />
      {isLoading || !user?.me ? (
        <div className={classes.smallLoading}>
          <CircularProgress size={50} sx={{ mb: 3.5 }} />
          <p id="loadingText" className={classes.settingFontWhite87}>
            {t("Loading. Please wait for a moment.")}
          </p>
        </div>
      ) : (
        <>{IS_ENTERPRISE ? pageMainEnterprise() : pageMainLoaded()}</>
      )}
    </>
  );
};

export default React.memo(Main);
