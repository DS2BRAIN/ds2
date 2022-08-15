import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import currentTheme from "assets/jss/custom";
import { fileurl } from "controller/api";
import * as api from "controller/labelApi";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages";
import { IS_ENTERPRISE } from "variables/common";

import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import Button from "@material-ui/core/Button";
import CancelIcon from "@mui/icons-material/Cancel";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

const ExpandedImageModal = ({
  sampleListDict,
  step,
  selectedSampleResultArr,
  closerModalSelectedImageIndex,
  isImageCloserModalOpen,
  setIsImageCloserModalOpen,
}) => {
  const classes = currentTheme();

  return (
    <Modal
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={isImageCloserModalOpen}
      onClose={() => {
        setIsImageCloserModalOpen(false);
      }}
    >
      <Grid container justifyContent="center" alignItems="center" height="100%">
        <div style={{ position: "relative", width: "60vw", maxWidth: "900px" }}>
          <img
            src={`${IS_ENTERPRISE ? fileurl + "static" : ""}${sampleListDict?.[
              `step${step}`
            ]?.[selectedSampleResultArr?.[closerModalSelectedImageIndex]] &&
              sampleListDict[`step${step}`][
                selectedSampleResultArr[closerModalSelectedImageIndex]
              ]["s3path"]}
              `}
            width="100%"
          />
          <CancelIcon
            fontSize="large"
            onClick={() => {
              setIsImageCloserModalOpen(false);
            }}
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              zIndex: 10,
              fontSize: 40,
              cursor: "pointer",
              fill: "var(--textWhite87)",
            }}
          />
        </div>
      </Grid>
    </Modal>
  );
};

const BestCustomAISelectModal = (props) => {
  const {
    isSampleModelModalOpen,
    setIsSampleModelModalOpen,
    setIsAbleToAutoLabeling,
    setIsAutoLabelingLoading,
    creatingCustomAiProjectId,
    setCreatingCustomAiProjectId,
    customAiModels,
    setCustomAiModels,
  } = props;

  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );
  const { t } = useTranslation();
  const project = labelprojects.projectDetail;

  const [step, setStep] = useState(0);
  const [lastStep, setLastStep] = useState(0);
  const [isReadyToShowModels, setIsReadyToShowModels] = useState(false);
  const [selectedSampleResultArr, setSelectedSampleResultArr] = useState([]);
  const [isImageCloserModalOpen, setIsImageCloserModalOpen] = useState(false);
  const [
    closerModalSelectedImageIndex,
    setCloserModalSelectedImageIndex,
  ] = useState(0);
  const [isSampleModelLoading, setIsSampleModelLoading] = useState(false);
  const [sampleListDict, setSampleListDict] = useState({});
  const [selectedSampleResultDict, setSelectedSampleResultDict] = useState({});
  const [selectedSampleResultCnt, setSelectedSampleResultCnt] = useState(0);

  const putSelectedSampleResult = () => {
    setIsSampleModelModalOpen(false);
    setStep(0);
    setIsReadyToShowModels(false);

    api
      .selectSampleModel({
        labelproject_id: labelprojects.projectDetail.id,
        project_id: creatingCustomAiProjectId,
        sample_info: selectedSampleResultDict,
      })
      .then((res) => {
        if (res.status === 200) {
          setIsAbleToAutoLabeling(true);
          setIsAutoLabelingLoading(false);
          setCustomAiModels([
            ...customAiModels,
            {
              id: res.data.best_model_id,
              class: res.data.class,
              stage: res.data.stage,
            },
          ]);
          setCreatingCustomAiProjectId(null);
        }
      })
      .catch((e) => {
        dispatch(
          openErrorSnackbarRequestAction(
            t("There was an error selecting the Best Custom Ai.")
          )
        );
      });
  };

  const selectSampleModel = (e) => {
    const tempDict = JSON.parse(JSON.stringify(selectedSampleResultDict));
    const id = e.target.id;
    const value = e.target.value;
    const checked = e.target.checked;
    for (const key in tempDict[`step${step}`]) {
      if (key === id) {
        tempDict[`step${step}`][key] = checked;
        if (checked) {
          setSelectedSampleResultCnt(
            (prevSelectedSampleResultCnt) => prevSelectedSampleResultCnt + 1
          );
        } else {
          setSelectedSampleResultCnt(
            (prevSelectedSampleResultCnt) => prevSelectedSampleResultCnt - 1
          );
        }
      }
    }
    setSelectedSampleResultDict(tempDict);
  };

  const nextSelectModelStep = () => {
    if (selectedSampleResultCnt > 0) {
      setStep((prevstep) => prevstep + 1);
      setSelectedSampleResultCnt(0);
    } else {
      dispatch(openErrorSnackbarRequestAction(t("Please select a model.")));
    }
  };

  const renderModelContent = (key, idx) => {
    return (
      <Box
        component="div"
        sx={{
          position: "relative",
          borderRadius: "8px",
          overflow: "hidden",
          "&::before": {
            content: "''",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 5,
            background: "transparent",
            width: "100%",
            height: "100%",
            transition: "all 0.2s",
            background: "rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <FullscreenIcon
          className={classes.closer_image_icon_up}
          fontSize="large"
          onClick={(e) => {
            e.preventDefault();
            setIsImageCloserModalOpen(true);
            setCloserModalSelectedImageIndex(idx);
          }}
          style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            zIndex: 10,
            cursor: "pointer",
            fill: "var(--textWhite87)",
          }}
        />
        <ExpandedImageModal
          sampleListDict={sampleListDict}
          step={step}
          selectedSampleResultArr={selectedSampleResultArr}
          closerModalSelectedImageIndex={closerModalSelectedImageIndex}
          isImageCloserModalOpen={isImageCloserModalOpen}
          setIsImageCloserModalOpen={setIsImageCloserModalOpen}
        />
        <img
          src={`${IS_ENTERPRISE ? fileurl + "static" : ""}${sampleListDict[
            `step${step}`
          ][key] && sampleListDict[`step${step}`][key]["s3path"]}`}
          style={{
            width: "100%",
            position: "relative",
          }}
        />
      </Box>
    );
  };

  useEffect(() => {
    if (isSampleModelModalOpen) {
      setIsSampleModelLoading(true);

      api
        .getSampleList(
          labelprojects.projectDetail.id,
          creatingCustomAiProjectId
        )
        .then((res) => {
          setSampleListDict(res.data);

          const modelsByStep = res.data;
          let tmpDict = {};
          Object.keys(modelsByStep).forEach((data, idx) => {
            tmpDict[`step${idx + 1}`] = {};
          });
          setLastStep(Object.keys(modelsByStep).length);
          for (let i = 1; i < Object.keys(modelsByStep).length + 1; i++) {
            if (modelsByStep[`step${i}`]) {
              const modelsArr = Object.keys(modelsByStep[`step${i}`]);
              if (modelsArr.length > 0) {
                for (let j = 1; j < modelsArr.length + 1; j++) {
                  tmpDict[`step${i}`] = {
                    ...tmpDict[`step${i}`],
                    [`model${j}`]: false,
                  };
                }
              }
            }
          }
          setSelectedSampleResultDict(tmpDict);
          setIsReadyToShowModels(true);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          setIsSampleModelLoading(false);
        });
    } else {
      setIsReadyToShowModels(false);
    }
  }, [isSampleModelModalOpen]);

  useEffect(() => {
    if (Object.keys(sampleListDict).length && step === 0) {
      setStep((prevstep) => prevstep + 1);
    }
  }, [sampleListDict]);

  useEffect(() => {
    if (Object.keys(sampleListDict).length) {
      if (step > 0 && sampleListDict[`step${step}`]) {
        let tmp = Object.keys(sampleListDict[`step${step}`]);
        setSelectedSampleResultArr(tmp);
      }
    }
  }, [step]);

  return (
    <>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isSampleModelModalOpen}
        onClose={() => {
          setIsSampleModelModalOpen(false);
          setIsReadyToShowModels(false);
        }}
        style={{
          width: "1080px",
          height: "700px",
          position: "absolute",
          left: "50%",
          top: "50%",
          marginLeft: "-540px",
          marginTop: "-350px",
        }}
        className={classes.modalContainer}
      >
        <div
          className={classes.autoLabelingContent}
          style={{
            width: "100%",
            height: "100%",
            border: "2px solid var(--surface2)",
          }}
        >
          {isSampleModelLoading ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                minHeight: "220px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </div>
          ) : (
            <>
              {step > lastStep ? (
                <div
                  className={classes.defaultGreenContainedButton}
                  style={{ margin: "auto" }}
                >
                  <Grid item xs={6}>
                    <Button
                      id="closeCancelModalBtn"
                      className={classes.defaultOutlineButton}
                      style={{ width: "100%" }}
                      onClick={() => {
                        putSelectedSampleResult();
                      }}
                    >
                      {t("Selection complete")}
                    </Button>
                  </Grid>
                </div>
              ) : (
                <>
                  <div>
                    <span style={{ fontSize: 24, fontWeight: 600 }}>
                      {t("Choose Best Custom AI")}
                    </span>
                    <Grid container style={{ margin: "16px 0 24px" }}>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 500,
                          marginRight: 8,
                          verticalAlign: "baseline",
                        }}
                      >{`(${step}/${lastStep})`}</span>
                      <Grid item>
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: 600,
                            marginRight: 8,
                          }}
                        >
                          {t(
                            "샘플 오토라벨링을 가장 잘한 모델을 선택해주세요."
                          )}
                        </span>
                        <span>({t("Multiple selection possible")})</span>
                        <div
                          className={classes.subHighlightText}
                          style={{ marginTop: 8 }}
                        >
                          *
                          {t(
                            "선택이 완료되면 가장 최적화된 모델로 오토라벨링이 진행됩니다."
                          )}
                        </div>
                      </Grid>
                    </Grid>

                    {selectedSampleResultArr.length > 0 && isReadyToShowModels && (
                      <Grid
                        container
                        alignItems="flex-start"
                        justifyContent={
                          selectedSampleResultArr.length === 1
                            ? "flext-start"
                            : "center"
                        }
                        style={{
                          overflow: "auto",
                          maxHeight: "500px",
                          marginTop: "16px",
                          alignItems: "flex-start",
                        }}
                      >
                        {selectedSampleResultArr.map((key, idx) => {
                          return (
                            <Grid
                              item
                              xs={12}
                              lg={6}
                              key={key}
                              style={{ padding: "12px" }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={
                                      selectedSampleResultDict[`step${step}`][
                                        key
                                      ]
                                    }
                                    onChange={selectSampleModel}
                                    value={
                                      selectedSampleResultDict[`step${step}`][
                                        key
                                      ]
                                    }
                                    id={key}
                                    sx={{
                                      position: "absolute",
                                      top: "8px",
                                      left: "8px",
                                      zIndex: 10,
                                      border: "var(--secondary1)",
                                      "& .MuiSvgIcon-root": { fontSize: 28 },
                                    }}
                                  />
                                }
                                label={renderModelContent(key, idx)}
                                style={{ position: "relative", margin: 0 }}
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                    )}
                  </div>

                  <Grid container className={classes.buttonContainer}>
                    <Grid item xs={6} sx={{ pr: 1 }}>
                      <Button
                        id="closeCancelModalBtn"
                        className={classes.defaultF0F0OutlineButton}
                        style={{ width: "100%", height: 32 }}
                        onClick={() => {
                          setIsSampleModelModalOpen(false);
                          setStep(0);
                          setIsReadyToShowModels(false);
                        }}
                      >
                        {t("Cancel")}
                      </Button>
                    </Grid>

                    <Grid item xs={6} sx={{ pl: 1 }}>
                      <Button
                        id="closeCancelModalBtn"
                        className={
                          step !== lastStep
                            ? classes.defaultGreenOutlineButton
                            : classes.defaultGreenContainedButton
                        }
                        style={{ width: "100%", height: 32 }}
                        onClick={() => {
                          if (step !== lastStep) {
                            nextSelectModelStep();
                          } else {
                            putSelectedSampleResult();
                          }
                        }}
                      >
                        {step !== lastStep ? t("Choose") : t("선택완료")}
                      </Button>
                    </Grid>
                  </Grid>
                </>
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default BestCustomAISelectModal;
