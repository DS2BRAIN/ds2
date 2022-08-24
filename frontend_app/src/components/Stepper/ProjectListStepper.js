import React from "react";
import { useTranslation } from "react-i18next";

import currentTheme from "assets/jss/custom.js";

const ProjectListStepper = ({ history, step, page }) => {
  const classes = currentTheme();
  const { t } = useTranslation();

  let activeStepNum = -1;
  switch (step) {
    case "ready":
      activeStepNum = 1;
      break;
    case "developing":
      activeStepNum = 2;
      break;
    case "done":
      activeStepNum = 3;
      break;
    default:
      break;
  }

  const onSetActiveStep = (idx) => {
    switch (idx) {
      case 0:
        history.push("/admin/dataconnector");
        return;
      case 1:
        history.push(`/admin/${page}?tab=ready`);
        return;
      case 2:
        history.push(`/admin/${page}?tab=developing`);
        return;
      case 3:
        history.push(`/admin/${page}?tab=done`);
        return;
      default:
        return;
    }
  };

  return (
    <div className={classes.defaultContainer}>
      <div
        className={
          activeStepNum === 0 || activeStepNum === -1
            ? classes.stepperActivedContainer
            : classes.stepperDeactivatedContainer
        }
      >
        <div
          id="activeStep_0"
          onClick={() => {
            onSetActiveStep(0);
          }}
          className={
            activeStepNum === 0 || activeStepNum === -1
              ? classes.stepperBlueActivatedDiv
              : classes.stepperBlueOpacityDiv
          }
        >
          <div>1</div>
        </div>
        <div className={classes.stepperTextStyle}>{t("Data Preparation")}</div>
      </div>

      <div
        className={
          activeStepNum === -1
            ? classes.stepperActivatedGreenLine
            : activeStepNum < 1
            ? classes.stepperDeactivatedLine
            : classes.stepperOpacityGreenLine
        }
      />

      <div
        className={
          activeStepNum === 1 || activeStepNum === -1
            ? classes.stepperActivedContainer
            : classes.stepperDeactivatedContainer
        }
      >
        <div
          id="activeStep_1"
          onClick={() => {
            onSetActiveStep(1);
          }}
          className={
            activeStepNum === 1 || activeStepNum === -1
              ? classes.stepperGreenActivatedDiv
              : activeStepNum < 1
              ? classes.stepperDeactivatedDiv
              : classes.stepperGreenOpacityDiv
          }
        >
          <div>2</div>
        </div>
        <div className={classes.stepperTextStyle}>{t("Data Selection")}</div>
      </div>

      <div
        className={
          activeStepNum === -1
            ? classes.stepperActivatedBlueLine
            : activeStepNum < 2
            ? classes.stepperDeactivatedLine
            : classes.stepperOpacityBlueLine
        }
      />

      <div
        className={
          activeStepNum === 2 || activeStepNum === -1
            ? classes.stepperActivedContainer
            : classes.stepperDeactivatedContainer
        }
      >
        <div
          id="activeStep_2"
          onClick={() => {
            onSetActiveStep(2);
          }}
          className={
            activeStepNum === 2 || activeStepNum === -1
              ? classes.stepperBlueActivatedDiv
              : activeStepNum < 2
              ? classes.stepperDeactivatedDiv
              : classes.stepperBlueOpacityDiv
          }
        >
          <div>3</div>
        </div>
        <div className={classes.stepperTextStyle}>{t("In Progress")}</div>
      </div>

      <div
        className={
          activeStepNum === -1
            ? classes.stepperActivatedGreenLine
            : activeStepNum < 3
            ? classes.stepperDeactivatedLine
            : classes.stepperOpacityGreenLine
        }
      ></div>

      <div
        className={
          activeStepNum === 3 || activeStepNum === -1
            ? classes.stepperActivedContainer
            : classes.stepperDeactivatedContainer
        }
      >
        <div
          id="activeStep_3"
          onClick={() => {
            onSetActiveStep(3);
          }}
          className={
            activeStepNum === 3 || activeStepNum === -1
              ? classes.stepperGreenActivatedDiv
              : classes.stepperDeactivatedDiv
          }
        >
          <div>4</div>
        </div>
        <div className={classes.stepperTextStyle}>{t("Data Analysis/Prediction")}</div>
      </div>
    </div>
  );
};

export default ProjectListStepper;
