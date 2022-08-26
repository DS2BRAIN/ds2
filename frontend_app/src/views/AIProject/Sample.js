import React, { useState, useEffect } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Modal from "@material-ui/core/Modal";
import ModelTable from "../Table/ModelTable";
import Detail from "../Table/Detail";
import SummaryTable from "views/Table/SummaryTable";
import LinearProgress from "@material-ui/core/LinearProgress";
import Tooltip from "components/Tooltip/Tooltip.js";
import StartCircle from "components/Circle/StartCircle.js";
import ProcessCircle from "components/Circle/ProcessCircle.js";
import RawDataTable from "views/Table/RawDataTable";
import currentTheme from "assets/jss/custom.js";
import Container from "@material-ui/core/Container";
import Analytics from "../Table/Analytics";
import HelpIcon from "@material-ui/icons/Help";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { useDispatch, useSelector } from "react-redux";
import { openErrorSnackbarRequestAction, openSuccessSnackbarRequestAction, setMainPageSettingRequestAction } from "redux/reducers/messages.js";
import { getProjectRequestAction } from "redux/reducers/projects.js";
import { getModelRequestAction } from "redux/reducers/models.js";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const Sample = React.memo((props) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, projects, models, messages } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
      models: state.models,
      messages: state.messages,
    }),
    []
  );
  const { t } = useTranslation();

  const [projectStatus, setProjectStatus] = useState(0);
  const [selectedPage, setSelectedPage] = useState("summary");
  const [isLoading, setIsLoading] = useState(true);
  const [isPredictDone, setIsPredictDone] = useState(false);
  const [sampleData, setSampleData] = useState(null);
  const [datacolumns, setdatacolumns] = useState([]);
  const [trainingColumnInfo, setTrainingColumnInfo] = useState({});
  const [modelPercentage, setModelPercentage] = useState(0);
  const [timeSeriesColumnInfo, setTimeSeriesColumnInfo] = useState({});
  const [preprocessingInfo, setPreprocessingInfo] = useState({});
  const [preprocessingInfoValue, setPreprocessingInfoValue] = useState({});
  const [isTooltipModalOpen, setIsTooltipModalOpen] = useState(false);
  const [tooltipCategory, setTooltipCategory] = useState("");
  const [isTimeSeries, setIsTimeSeries] = useState(false);
  const [isAnyModelFinished, setIsAnyModelFinished] = useState(false);

  const path = window.location.pathname;

  useEffect(() => {
    const pathArr = path.split("/");
    const id = pathArr[pathArr.length - 1];
    dispatch(getProjectRequestAction(id));

    const state = props.history.location.state;
    if (state) {
      state.page && setSelectedPage(state.page);
      if (state.modelid !== models.chosenModel) {
        state.modelid && dispatch(getModelRequestAction(state.modelid));
      }
    }
  }, [path]);

  useEffect(() => {
    const state = props.history.location.state;
    if (state) {
      state.page && setSelectedPage(state.page);
      if (state.modelid !== models.chosenModel) {
        state.modelid && dispatch(getModelRequestAction(state.modelid));
      }
    }
  }, [props.history.location.pathname]);

  useEffect(() => {
    (async () => {
      if (projects.project) {
        await setIsLoading(true);
        await onSetSampleData();
        await setIsLoading(false);
      }
    })();
  }, [projects.project]);

  useEffect(() => {
    if (modelPercentage && modelPercentage < 100) {
      setTimeout(() => {
        const newPercentage = modelPercentage + 10;
        setModelPercentage(newPercentage);
      }, [1000]);
    }
  }, [modelPercentage]);

  useEffect(() => {
    if (messages.shouldGoToMainPage) {
      dispatch(setMainPageSettingRequestAction());
      props.history.push("/admin/project/");
    }
  }, [messages.shouldGoToMainPage]);

  const onSetSampleData = () => {
    let sampleDataRaw = {};

    if (projects.project.trainingMethod === "image" || projects.project.trainingMethod === "object_detection" || projects.project.trainingMethod === "cycle_gan") {
      setSelectedPage("rawdata");
    }

    projects.project && projects.project.timeSeriesColumnInfo && setTimeSeriesColumnInfo(projects.project.timeSeriesColumnInfo);
    projects.project && projects.project.preprocessingInfo && setPreprocessingInfo(projects.project.preprocessingInfo);
    projects.project && projects.project.preprocessingInfoValue && setPreprocessingInfoValue(projects.project.preprocessingInfoValue);

    if (projects.project.trainingColumnInfo) {
      var trainingColumnInfoRaw = {};
      Object.keys(projects.project.trainingColumnInfo).map((columnInfo) => {
        if (projects.project.trainingColumnInfo[columnInfo]) {
          trainingColumnInfoRaw[columnInfo] = true;
        }
      });
      setTrainingColumnInfo(trainingColumnInfoRaw);
    } else if (projects.project.fileStructure) {
      var trainingColumnInfoRaw = {};
      JSON.parse(projects.project.fileStructure).map((columnInfo) => {
        if (columnInfo.use) {
          trainingColumnInfoRaw[columnInfo.columnName] = JSON.parse(columnInfo.use);
        }
      });
      setTrainingColumnInfo(trainingColumnInfoRaw);
    }

    var datacolumnsRaw = [];
    var fileSizeRaw = 0;
    if (projects.project.sampleData) {
      sampleDataRaw["전체"] = projects.project.sampleData;
    }
    projects.project.dataconnectorsList &&
      projects.project.dataconnectorsList.map((dataconnector) => {
        dataconnector.datacolumns &&
          dataconnector.datacolumns.map((datacolumn) => {
            datacolumn.dataconnectorName = dataconnector.dataconnectorName;
            datacolumn.length = dataconnector.yClass && dataconnector.yClass.length;
            datacolumnsRaw.push(datacolumn);
          });
        sampleDataRaw[dataconnector.dataconnectorName] = dataconnector.sampleData;
        if (dataconnector.fileSize) fileSizeRaw += dataconnector.fileSize;
      });
    setSampleData(sampleDataRaw);

    if (!(datacolumnsRaw && datacolumnsRaw.length > 0) && projects.project.fileStructure) {
      datacolumnsRaw = JSON.parse(projects.project.fileStructure);
    }
    setdatacolumns(datacolumnsRaw);
  };

  const startProcess = () => {
    document.getElementById("opacityDiv").style.visibility = "visible";
    dispatch(openSuccessSnackbarRequestAction(t("AI modeling is imported using sample data.")));
    setSelectedPage("model");
    setProjectStatus(1);
    setModelPercentage(10);
    setTimeout(() => {
      setProjectStatus(100);
      setIsPredictDone(true);
    }, 10000);
  };

  const handleChange = (event) => {
    setSelectedPage(event.target.id);
    props.history.push(`/admin/sample/${projects.project.id}`);
  };
  const getCheckedValue = (value) => {
    setTrainingColumnInfo(value);
  };
  const getTimeSeriesCheckedValue = (value) => {
    setTimeSeriesColumnInfo(value);
  };
  const getProcessingInfo = (value) => {
    setPreprocessingInfo(value);
  };
  const getProcessingInfoValue = (value) => {
    setPreprocessingInfoValue(value);
  };
  const onMakeCircleOpacity = () => {
    document.getElementById("opacityDiv").style.visibility = "hidden";
  };
  const onBackCircleOpacity = () => {
    document.getElementById("opacityDiv").style.visibility = "visible";
  };
  const onOpenTooltipModal = (category) => {
    setTooltipCategory(category);
    setIsTooltipModalOpen(true);
  };
  const closeTooltipModalOpen = () => {
    setIsTooltipModalOpen(false);
  };

  const handleIsTimeSeries = (res) => {
    setIsTimeSeries(res);
  };

  const handleHelpIconTip = (category) => {
    const onOpenTooltipModal = (category) => {
      setTooltipCategory(category);
      setIsTooltipModalOpen(true);
    };

    return (
      <HelpOutlineIcon
        fontSize="small"
        style={{
          marginLeft: "4px",
          cursor: "pointer",
          verticalAlign: "sub",
        }}
        id="helpIcon"
        onClick={() => {
          onOpenTooltipModal(category);
        }}
      />
    );
  };

  return (
    <div>
      <ReactTitle title={"DS2.ai - " + t("Sample Project")} />
      {isLoading || projects.isLoading ? (
        <div className={classes.smallLoading}>
          <CircularProgress size={50} sx={{ mb: 3.5 }} />
          <div style={{ fontSize: 15 }}>{t("Loading sample data. Please wait.")}</div>
        </div>
      ) : (
        <Grid container sx={{ mt: "30px" }}>
          <Grid container className={classes.projectTitle}>
            <Grid item xs={12} sx={{ px: 2 }}>
              {projects.project.projectName}
            </Grid>
          </Grid>
          <div className={classes.titleContainer}>
            <div style={{ margin: "10px 10px 0 10px" }}>
              {projects.project.description &&
                (projects.project.description.includes("\\n")
                  ? projects.project.description.split("\\n").map((sentence, idx) => {
                      return <div key={idx}>{sentence}</div>;
                    })
                  : projects.project.description)}
            </div>
            {/* <Button id='goBackToProject' className={classes.backButton} onClick={()=>{dispatch(askGoToMainPageRequestAction());}}>
                    {t('Return to project list')}
                </Button> */}
          </div>
          {projects.project.license && (
            <div style={{ margin: "10px 10px 0 10px" }}>
              <span>{t("Dataset License")} : </span>
              {projects.project.license.licenseName === "기타" ? (
                <span>{projects.project.license.licenseName}</span>
              ) : (
                <a
                  href={projects.project.license.licenseURL}
                  target="_blank"
                  style={{
                    marginLeft: "4px",
                    borderBottom: "1px solid #00d69e",
                  }}
                >
                  {projects.project.license.licenseName}
                </a>
              )}
            </div>
          )}
          <GridContainer
            style={{
              margin: "24px 0",
              display: "flex",
              alignItems: "center",
            }}
          >
            <GridItem xs={6}>
              <Container component="main" maxWidth="false" className={classes.processMainCard} style={{ padding: 24 }}>
                <GridContainer>
                  <GridItem xs={12} lg={10} style={{ marginBottom: 20 }}>
                    <p className={classes.text87size16}>
                      {t("Target Variable")}
                      {handleHelpIconTip("predictValue")}
                    </p>
                    <FormControl
                      onClick={() => {
                        dispatch(openErrorSnackbarRequestAction(t("You cannot make changes to sample data.")));
                      }}
                      className={classes.formControl}
                    >
                      <Select labelid="demo-simple-select-outlined-label" id="disabledSelectBox" value={projects.project.valueForPredict} disabled={true} className={classes.selectForm}>
                        {projects.project && <MenuItem value={projects.project.valueForPredict}>{projects.project.valueForPredict}</MenuItem>}
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem xs={12} lg={10} style={{ marginBottom: 20 }}>
                    <p className={classes.text87size16}>
                      {t("Preferred method")}
                      {handleHelpIconTip("option")}
                    </p>
                    <FormControl component="fieldset" id="optionForPredictSelectBox">
                      <RadioGroup
                        onChange={() => {
                          dispatch(openErrorSnackbarRequestAction(t("You cannot make changes to sample data.")));
                        }}
                        row
                        aria-label="position"
                        name="position"
                        defaultValue="colab"
                        value={projects.project.option}
                      >
                        {/*<FormControlLabel value="colab" control={<Radio color="primary" />} label={t('Magic Code')} /><br/>*/}
                        <FormControlLabel value="accuracy" control={<Radio color="primary" style={{ marginRight: "0px" }} />} label={t("Higher accuracy")} style={{ margin: 0, marginRight: "8px" }} />
                        <span style={{ fontSize: "10px", marginRight: "24px" }} className={classes.modelTabFirstButton}>
                          Enterprise
                        </span>
                        <FormControlLabel value="speed" control={<Radio color="primary" />} label={t("Faster training speed")} style={{ margin: 0, marginRight: "8px" }} />
                        <span style={{ fontSize: "10px", marginRight: "24px" }} className={classes.modelTabFirstButton}>
                          Enterprise
                        </span>
                        {projects.project.option === "labeling" && <FormControlLabel value="labeling" control={<Radio color="primary" />} label={t("Auto-labeling")} style={{ margin: 0, marginRight: "8px" }} />}
                      </RadioGroup>
                    </FormControl>
                  </GridItem>
                  <GridItem xs={12} lg={10}>
                    <p className={classes.text87size16}>
                      {t("Training Method")}
                      {handleHelpIconTip("method")}
                    </p>
                    <FormControl
                      onClick={() => {
                        dispatch(openErrorSnackbarRequestAction(t("You cannot make changes to sample data.")));
                      }}
                      className={classes.formControl}
                    >
                      <Select labelid="demo-simple-select-outlined-label" value={projects.project.trainingMethod} disabled={true} id="disabledSelectBox" style={{ marginBottom: "8px" }}>
                        <MenuItem value="normal">{t("structured data classification")}</MenuItem>
                        <MenuItem value="normal_classification">{t("Structured Data Category Classification")}</MenuItem>
                        <MenuItem value="normal_regression">{t("Structured Data Regression")}</MenuItem>
                        <MenuItem value="text">{t("Natural Language Processing (NLP)")}</MenuItem>
                        <MenuItem value="image">{t("Image Classification")}</MenuItem>
                        <MenuItem value="object_detection">{t("Object Detection")}</MenuItem>
                        {/* <MenuItem value='cycle_gan' >{t('Generative Adversarial Network (GAN)')}</MenuItem> */}
                        <MenuItem value="time_series">{t("Time Series Prediction")}</MenuItem>
                        <MenuItem value="recommender">{t("Recommendation system (matrix)")}</MenuItem>
                      </Select>
                      {projects.project.trainingMethod === "normal" && (
                        <p className={classes.settingFontWhite6}>
                          {t("Training Method")} - {t("정형 데이터 분류")}
                        </p>
                      )}
                      {projects.project.trainingMethod === "text" && (
                        <p className={classes.settingFontWhite6}>
                          {t("Training Method")} - {t("자연어")}
                        </p>
                      )}
                      {projects.project.trainingMethod === "image" && (
                        <p className={classes.settingFontWhite6}>
                          {t("Training Method")} - {t("이미지 분류")}
                        </p>
                      )}
                      {projects.project.trainingMethod === "object_detection" && (
                        <p className={classes.settingFontWhite6}>
                          {t("Training Method")} - {t("물체 인식")}
                        </p>
                      )}
                      {/* {projects.project.trainingMethod === "cycle_gan" && (
                        <p className={classes.settingFontWhite6}>
                          {t("Training Method")} - {t("이미지 생성(GAN)")}
                        </p>
                      )} */}
                      {projects.project.trainingMethod === "normal_classification" && <p className={classes.settingFontWhite6}>{t("This function predicts each category such as 'dog', 'cat', etc.")}</p>}
                      {projects.project.trainingMethod === "normal_regression" && <p className={classes.settingFontWhite6}>{t("This function predicts continuous values, such as values between 1 and 10")} </p>}
                      {projects.project.trainingMethod === "time_series" && (
                        <p className={classes.settingFontWhite6}>
                          {t("Training Method")} - {t("시계열 예측")}
                        </p>
                      )}
                      {projects.project.trainingMethod === "recommender" && (
                        <p className={classes.settingFontWhite6}>
                          {t("Training Method")} - {t("추천 시스템 (매트릭스)")}
                        </p>
                      )}
                    </FormControl>
                  </GridItem>
                </GridContainer>
              </Container>
            </GridItem>
            <GridItem xs={6} style={{ display: "flex", alignItems: "center" }}>
              <Container component="main" maxWidth="false">
                <div className={classes.addressContainer} style={{ minHeight: "360px" }}>
                  {projectStatus === 0 ? (
                    <>
                      <div className={classes.opacityDiv} id="opacityDiv"></div>
                      <div className={classes.circleDiv}>
                        <b className={classes.textDiv} onMouseEnter={onMakeCircleOpacity} onMouseLeave={onBackCircleOpacity} onClick={startProcess}>
                          START
                        </b>
                        <StartCircle projectStatus={projectStatus} id="startProcess" />
                      </div>
                    </>
                  ) : isPredictDone ? (
                    <div className={classes.circleDiv}>
                      <StartCircle projectStatus={projectStatus} id="startProcess" />
                    </div>
                  ) : (
                    <div className={classes.circleDiv}>
                      <ProcessCircle modelPercentage={modelPercentage} />
                    </div>
                  )}
                </div>
              </Container>
            </GridItem>
          </GridContainer>
          <GridContainer style={{ height: "20px" }}></GridContainer>
          <GridContainer style={{ borderTop: "1px solid " + currentTheme.border2 }}>
            <GridItem xs={8} lg={10} style={{ marginTop: "20px", display: "flex" }}>
              {/*<div*/}
              {/*  onClick={handleChange}*/}
              {/*  id="rawdata"*/}
              {/*  className={*/}
              {/*    selectedPage === "rawdata"*/}
              {/*      ? classes.selectedTab*/}
              {/*      : classes.notSelectedTab*/}
              {/*  }*/}
              {/*>*/}
              {/*  {t("Data")}*/}
              {/*</div>*/}
              {!(projects.project.trainingMethod === "image" || projects.project.trainingMethod === "object_detection" || projects.project.trainingMethod === "cycle_gan") && (
                <div onClick={handleChange} id="summary" className={selectedPage === "summary" ? classes.selectedTab : classes.notSelectedTab}>
                  {t("Summary")}
                </div>
              )}
              {(projectStatus > 0 || isAnyModelFinished) && (
                <div onClick={handleChange} id="model" className={selectedPage === "model" ? classes.selectedTab + " " : selectedPage === "detail" || selectedPage === "analytics" ? classes.notSelectedTab : classes.notSelectedTab}>
                  {t("Model")}
                </div>
              )}
              {selectedPage === "detail" && (
                <div onClick={handleChange} id="detail" className={classes.selectedTab}>
                  {t("Details")}
                </div>
              )}
              {selectedPage === "analytics" && (
                <div id="analytics" className={classes.selectedTab + " " + classes.lastTab}>
                  {t("Analysis")}
                </div>
              )}
            </GridItem>
            <GridItem xs={4} lg={2} style={{ marginTop: "20px", display: "flex" }}>
              <div className={classes.predictCountDiv}>
                {/* {user.me && (
                  <div style={{ width: "100%" }}>
                    <div>{t("Total number of predictions")}</div>
                    <LinearProgress
                      variant="determinate"
                      color="blue"
                      value={
                        (+user.me.cumulativePredictCount /
                          (+user.me.remainPredictCount +
                            +user.me.usageplan.noOfPrediction *
                              (user.me.dynos ? +user.me.dynos : 1) +
                            +user.me.additionalPredictCount)) *
                        100
                      }
                    />
                    <div id="predictCountDiv" className="predictCountDiv">
                      {user.me.cumulativePredictCount.toLocaleString()} /{" "}
                      {(
                        +user.me.remainPredictCount +
                        +user.me.usageplan.noOfPrediction *
                          (user.me.dynos ? +user.me.dynos : 1) +
                        +user.me.additionalPredictCount
                      ).toLocaleString()}{" "}
                      {t("")}
                    </div>
                  </div>
                )} */}
              </div>
            </GridItem>
          </GridContainer>
          <Container component="main" maxWidth="false" className={classes.mainCard}>
            <GridContainer>
              {/*{selectedPage === "rawdata" && (*/}
              {/*  <RawDataTable category="sample" sampleData={sampleData} />*/}
              {/*)}*/}
              {selectedPage === "summary" && (
                <SummaryTable
                  category="sample"
                  csv={datacolumns}
                  getTimeSeriesCheckedValue={getTimeSeriesCheckedValue}
                  getCheckedValue={getCheckedValue}
                  getProcessingInfo={getProcessingInfo}
                  getProcessingInfoValue={getProcessingInfoValue}
                  trainingColumnInfo={trainingColumnInfo}
                  timeSeriesColumnInfo={timeSeriesColumnInfo}
                  preprocessingInfoParent={preprocessingInfo}
                  preprocessingInfoValueParent={preprocessingInfoValue}
                  handleIsTimeSeries={handleIsTimeSeries}
                />
              )}
              {selectedPage === "model" && <ModelTable category="sample" projectStatus={projectStatus} csv={datacolumns} trainingColumnInfo={trainingColumnInfo} history={props.history} isAnyModelFinished={isAnyModelFinished} setIsAnyModelFinished={setIsAnyModelFinished} />}
              {selectedPage === "detail" && <Detail datacolumns={datacolumns} />}
              {selectedPage === "analytics" && <Analytics valueForPredictName={projects.project.valueForPredict} csv={datacolumns} trainingColumnInfo={trainingColumnInfo} history={props.history} />}
            </GridContainer>
          </Container>
        </Grid>
      )}
      <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={isTooltipModalOpen} onClose={closeTooltipModalOpen} className={classes.modalContainer}>
        <Tooltip tooltipCategory={tooltipCategory} closeTooltipModalOpen={closeTooltipModalOpen} />
      </Modal>
    </div>
  );
});

export default Sample;
