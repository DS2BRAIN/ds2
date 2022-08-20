import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import currentTheme from "assets/jss/custom.js";
import * as api from "controller/api.js";
import { askModalRequestAction } from "redux/reducers/messages.js";
import { currentThemeColor } from "assets/jss/custom";
import { fileurl } from "controller/api";
import Button from "components/CustomButtons/Button";
import { IS_ENTERPRISE } from "variables/common";

import { Container, MenuItem, Modal } from "@material-ui/core";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import ModalPage from "components/PredictModal/ModalPage.js";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@material-ui/core/Select/Select";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";

const Analytics = React.memo(({}) => {
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

    const [isLoading, setIsLoading] = useState(true);
    const [modelDetail, setModelDetail] = useState(null);
    const [selectedPage, setSelectedPage] = useState("");
    const [modelGraphs, setModelGraphs] = useState([]);
    const [featureImportance, setFeatureImportance] = useState([]);
    const [prescriptionAnalyticsInfo, setPrescriptionAnalyticsInfo] = useState(
      {}
    );
    const [selectedPAname, setSelectedPAname] = useState({});
    const [selectedPAvalue, setSelectedPAvalue] = useState({});
    const [isModalOpen, setIsOpenModal] = useState(false);
    const [projectAnalyGraphArr, setProjectAnalyGraphArr] = useState([]);
    const [valueForPredictName, setValueForPredictName] = useState("");

    useEffect(() => {
      if (models.chosenModel) {
        api
          .getModelsInfoDetail(models.chosenModel)
          .then((res) => {
            let data = res.data;
            setModelDetail(data);
            getFeatureImportance(data);
            setPrescriptionAnalyticsInfo(data.prescriptionAnalyticsInfo);
            if (data.prescriptionAnalyticsInfo) {
              setSelectedPAname(Object.keys(data.prescriptionAnalyticsInfo)[0]);
              setSelectedPAvalue(
                Object.values(data.prescriptionAnalyticsInfo)[0]
              );
            }
            setModelGraphs(data.analyticsgraphs);
            if (
              (data.analyticsgraphs && data.analyticsgraphs.length > 0) ||
              (data.prescriptionAnalyticsInfo &&
                Object.keys(data.prescriptionAnalyticsInfo).length > 0)
            ) {
              setSelectedPage("model");
            } else {
              setSelectedPage("project");
            }
          })
          .then(() => {
            setIsLoading(false);
          })
          .catch((e) => {
            if (!process.env.REACT_APP_DEPLOY) console.log(e);
          });
      }
    }, [models.chosenModel]);

    useEffect(() => {
      if (messages.shouldCloseModal) setIsOpenModal(false);
    }, [messages.shouldCloseModal]);

    useEffect(() => {
      setProjectAnalyGraphArr(projects.project.analyticsgraphs);
    }, [projects.project.analyticsgraphs]);

    const getFeatureImportance = (modelDetail) => {
      try {
        const featureData = [];
        let feature = modelDetail.featureImportance.replace(/NaN/g, '"NaN"');
        feature = JSON.parse(feature);
        let sum = 0;
        const cols = feature.cols;
        const imp = feature.imp;
        imp.forEach((impOne, idx) => {
          if (typeof impOne === "number") {
            sum += Math.abs(impOne);
            const percentage = ((impOne * 100) / sum).toFixed(2);
            featureData.push({
              name: cols[idx],
              value: parseFloat(percentage),
            });
          }
        });
        featureData.sort((prev, next) => {
          return next["value"] - prev["value"];
        });
        setFeatureImportance(featureData);
      } catch {
        setFeatureImportance(null);
      }
    };

    const onGoToPredictPage = () => {
      setIsOpenModal(true);
    };
    const handleChange = (event) => {
      setSelectedPage(event.target.id);
    };
    const isFloat = (value) => {
      return !isNaN(value) && value.toString().indexOf(".") != -1;
    };
    const valueInfoKeyChange = (e) => {
      setSelectedPAname(Object.keys(prescriptionAnalyticsInfo)[e.target.value]);
      setSelectedPAvalue(
        Object.values(prescriptionAnalyticsInfo)[e.target.value]
      );
    };

    const closeModal = () => {
      dispatch(askModalRequestAction());
    };

    return models.isLoading || isLoading ? (
      <div className={classes.loading} style={{ width: "100%" }}>
        <CircularProgress />
      </div>
    ) : (
      <div className={classes.modalPrescriptiveAnalyticsContent}>
          <div className={classes.titleContainer}>
            <span style={{ fontSize: "20px", fontWeight: "bold" }}>
              {t("Prescriptive Analytics Result")}
            </span>
            <CloseIcon className={classes.closeImg} onClick={closeModal} />
          </div>

        {selectedPage === "model" &&
          ((modelGraphs && modelGraphs.length > 0) ||
            (prescriptionAnalyticsInfo &&
              Object.keys(prescriptionAnalyticsInfo).length > 0)) && (
            <>
              {prescriptionAnalyticsInfo &&
                Object.keys(prescriptionAnalyticsInfo).length > 0 && (
                  <Container
                    component="main"
                    maxWidth="false"
                    className={classes.mainCard}
                  >
                    <GridContainer>
                      <GridItem
                        xs={9}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          margin: 50,
                          padding: "50 !important",
                          borderStyle: "solid",
                          borderWidth: 1,
                          borderColor: "white",
                        }}
                      >
                        {user.language === "ko" ? (
                          <h4>
                            중간값 기준으로
                            {selectedPAvalue &&
                              selectedPAvalue["top3"] &&
                              Object.keys(
                                selectedPAvalue["top3"]["maxUpEachCondition"]
                              ).map((condition, index) => {
                                var selectedCondition =
                                  selectedPAvalue["top3"]["maxUpEachCondition"][
                                    condition
                                  ];
                                if (isFloat(selectedCondition)) {
                                  selectedCondition = parseFloat(
                                    selectedCondition * 100 - 100
                                  ).toFixed(2);
                                }

                                return (
                                  <>
                                    &nbsp;
                                    <span className={classes.highlightBottom}>
                                      {condition.split("__")[0]}
                                    </span>{" "}
                                    값이&nbsp;
                                    <b>
                                      {isFloat(selectedCondition)
                                        ? Math.abs(selectedCondition)
                                        : selectedCondition}
                                    </b>
                                    {index !==
                                    Object.keys(
                                      selectedPAvalue["top3"][
                                        "maxUpEachCondition"
                                      ]
                                    ).length -
                                      1
                                      ? isFloat(selectedCondition)
                                        ? selectedCondition > 0
                                          ? "% 증가하고"
                                          : "% 감소하고"
                                        : " 값으로 선택 되고"
                                      : isFloat(selectedCondition)
                                      ? selectedCondition > 0
                                        ? "% 증가하면"
                                        : "% 감소하면"
                                      : " 값으로 선택 되면"}
                                    ,{" "}
                                  </>
                                );
                              })}
                            {projects.project.trainingMethod &&
                            projects.project.trainingMethod.indexOf(
                              "classification"
                            ) > -1 ? (
                              <>
                                &nbsp;
                                <br />
                                <br />
                                <span className={classes.highlightBottom}>
                                  {valueForPredictName}
                                </span>{" "}
                                값이&nbsp;&nbsp;
                                <Select
                                  defaultValue={0}
                                  onChange={valueInfoKeyChange}
                                >
                                  {Object.keys(prescriptionAnalyticsInfo).map(
                                    (infoKey, index) => {
                                      return (
                                        <MenuItem value={index}>
                                          {infoKey}
                                        </MenuItem>
                                      );
                                    }
                                  )}
                                </Select>
                                &nbsp;으로 될 확률이 &nbsp;
                                <b>
                                  {selectedPAname &&
                                    selectedPAvalue["top3"] &&
                                    Math.round(
                                      selectedPAvalue["top3"][
                                        "maxUpPredictionValueDiff"
                                      ] * 10000
                                    ) / 100}
                                  %
                                </b>
                                &nbsp;
                                {selectedPAname &&
                                selectedPAvalue["top3"] &&
                                selectedPAvalue["top3"][
                                  "maxUpPredictionValueDiff"
                                ] > 0
                                  ? "증가"
                                  : "감소"}
                                합니다.
                              </>
                            ) : (
                              <>
                                &nbsp;
                                <br />
                                <br />
                                <span className={classes.highlightBottom}>
                                  {valueForPredictName}
                                </span>{" "}
                                값이 &nbsp;
                                <b>
                                  {selectedPAname &&
                                    selectedPAvalue["top3"] &&
                                    Math.round(
                                      selectedPAvalue["top3"][
                                        "maxUpPredictionValueDiff"
                                      ] * 10000
                                    ) / 100}
                                </b>
                                &nbsp;
                                {selectedPAname &&
                                selectedPAvalue["top3"] &&
                                selectedPAvalue["top3"][
                                  "maxUpPredictionValueDiff"
                                ] > 0
                                  ? "증가"
                                  : "감소"}
                                할 것으로 예측됩니다.
                              </>
                            )}
                          </h4>
                        ) : (
                          <h4>
                            On a median value basis, if
                            {selectedPAvalue &&
                              selectedPAvalue["top3"] &&
                              Object.keys(
                                selectedPAvalue["top3"]["maxUpEachCondition"]
                              ).map((condition, index) => {
                                var selectedCondition =
                                  selectedPAvalue["top3"]["maxUpEachCondition"][
                                    condition
                                  ];
                                if (isFloat(selectedCondition)) {
                                  selectedCondition = parseFloat(
                                    selectedCondition * 100 - 100
                                  ).toFixed(2);
                                }
                                return (
                                  <>
                                    &nbsp;
                                    <span className={classes.highlightBottom}>
                                      {condition.split("__")[0]}
                                    </span>{" "}
                                    &nbsp;
                                    {index !==
                                    Object.keys(
                                      selectedPAvalue["top3"][
                                        "maxUpEachCondition"
                                      ]
                                    ).length -
                                      1
                                      ? isFloat(selectedCondition)
                                        ? selectedCondition > 0
                                          ? "increases"
                                          : "decreases"
                                        : " "
                                      : isFloat(selectedCondition)
                                      ? selectedCondition > 0
                                        ? "increases"
                                        : "decreases"
                                      : "is chosen as a value"}
                                    <b>
                                      {" "}
                                      to{" "}
                                      {isFloat(selectedCondition)
                                        ? Math.abs(selectedCondition)
                                        : selectedCondition}
                                      {isFloat(selectedCondition) ? "%" : ""}
                                    </b>
                                    ,{" "}
                                  </>
                                );
                              })}
                            {projects.project.trainingMethod &&
                            projects.project.trainingMethod.indexOf(
                              "classification"
                            ) > -1 ? (
                              <>
                                &nbsp;
                                <br />
                                <span className={classes.highlightBottom}>
                                  {valueForPredictName}
                                </span>{" "}
                                the posibility that the value to be&nbsp;&nbsp;
                                <Select
                                  defaultValue={0}
                                  onChange={valueInfoKeyChange}
                                >
                                  {Object.keys(prescriptionAnalyticsInfo).map(
                                    (infoKey, index) => {
                                      return (
                                        <MenuItem value={index}>
                                          {infoKey}
                                        </MenuItem>
                                      );
                                    }
                                  )}
                                </Select>
                                &nbsp; &nbsp;will{" "}
                                <b>
                                  {selectedPAname &&
                                    selectedPAvalue["top3"] &&
                                    Math.round(
                                      selectedPAvalue["top3"][
                                        "maxUpPredictionValueDiff"
                                      ] * 10000
                                    ) / 100}
                                  %
                                </b>
                                &nbsp;
                                {selectedPAname &&
                                selectedPAvalue["top3"] &&
                                selectedPAvalue["top3"][
                                  "maxUpPredictionValueDiff"
                                ] > 0
                                  ? "increase."
                                  : "decrease."}
                              </>
                            ) : (
                              <>
                                &nbsp;
                                <br />
                                <span className={classes.highlightBottom}>
                                  {valueForPredictName}
                                </span>
                                the value is &nbsp;expected to
                                {selectedPAname &&
                                selectedPAvalue["top3"] &&
                                selectedPAvalue["top3"][
                                  "maxUpPredictionValueDiff"
                                ] > 0
                                  ? " increase"
                                  : " decrease"}
                                &nbsp;
                                <b>
                                  {selectedPAname &&
                                    selectedPAvalue["top3"] &&
                                    Math.round(
                                      selectedPAvalue["top3"][
                                        "maxUpPredictionValueDiff"
                                      ] * 10000
                                    ) / 100}
                                  %.
                                </b>
                              </>
                            )}
                          </h4>
                        )}
                      </GridItem>
                      {/*<GridItem xs={3} style={{display: 'flex', alignItems: 'center'}}>*/}
                      {/*    <Button className={classes.defaultOutlineButton}*/}
                      {/*    onClick={onGoToPredictPage}*/}
                      {/*    >{t('Real-time prediction')}</Button>*/}
                      {/*</GridItem>*/}
                    </GridContainer>
                  </Container>
                )}
            </>
          )}
      </div>
    );
  }
);

export default Analytics;
