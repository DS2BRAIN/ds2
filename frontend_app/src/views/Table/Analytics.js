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
  const { t, i18n } = useTranslation();

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
                      [{projects?.project?.valueForPredict.split("__")[0]}] {t("Goal Value")} :
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
                    <GridContainer>
                      <GridItem
                        xs={12}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          margin: 20,
                          padding: 10,
                          borderStyle: "solid",
                          borderWidth: 1,
                          borderColor: "white",
                        }}
                      >
                          <div dangerouslySetInnerHTML={ {__html: i18n.language === "en" ? prescriptionAnalyticsInfo[selectedPAname]["sentence_en"] : prescriptionAnalyticsInfo[selectedPAname]["sentence_ko"]} }>
                        </div>

                      </GridItem>
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
