import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import currentTheme from "assets/jss/custom";
import { useTranslation } from "react-i18next";
import { setSubHyperParameters } from "redux/reducers/projects";

import produce from "immer";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Button from "components/CustomButtons/Button";
import HyperParametersForm from "./HyperParametersForm";
import ColabInfoForm from "./ColabInfoForm";

const HyperParameters = ({
  preferedMethod,
  algorithmInfo,
  setAlgorithmInfo,
  option,
  trainingMethod,
  colabInfo,
  onChangeColabInfo,
  isParameterCompressedChecked,
  projectStatus,
  hyperParamsData,
  initialInfo,
}) => {
  const { t } = useTranslation();
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { projects } = useSelector(
    (state) => ({
      projects: state.projects,
    }),
    []
  );

  const [selectedSubParams, setSelectedSubParams] = useState(null);
  const [isClickedResetBtn, setIsClickedResetBtn] = useState(false);

  const resetSubHyperParams = () => {
    if (algorithmInfo && option) {
      if (algorithmInfo[option]?.parameter) {
        Object.keys(algorithmInfo[option].parameter).map((key, i) => {
          const info = algorithmInfo[option].parameter;

          // selectedSubParams 세팅
          if (info[key].subParameter) {
            const tmpSelected = {};

            Object.keys(info[key].subParameter).map((key2, j) => {
              if (j === 0) tmpSelected[key] = [key2];
            });

            setSelectedSubParams(tmpSelected);

            if (!projects.subHyperParameters)
              dispatch(setSubHyperParameters(tmpSelected));
          }
        });
      }
    }
  };

  const resetCondition = () => {
    setAlgorithmInfo(initialInfo);
    resetSubHyperParams();
    setIsClickedResetBtn(true);
  };

  useEffect(() => {
    resetSubHyperParams();
  }, [algorithmInfo && option]);

  // useEffect(() => {
  //   if (projects.project?.statusText === "중단") resetSubHyperParams();
  // }, [projects.project]);

  return (
    <Grid
      container
      height="100%"
      sx={{
        p: 2,
        color: "var(--textWhite87)",
        pl: 3,
      }}
    >
      <Grid item>
        <Grid container alignItems="center" sx={{ mb: 2 }}>
          <span className={classes.text87size16} style={{ marginRight: 8 }}>
            {t("Hyperparameter setting")}
          </span>
          {preferedMethod === "custom" && projectStatus === 0 && (
            <Button
              id="intialize_hyperparametersetting_btn"
              shape="greenOutlined"
              size="sm"
              sx={{ ml: 0.5, mr: 3 }}
              onClick={resetCondition}
            >
              {t("Reset settings")}
            </Button>
          )}
          {preferedMethod && preferedMethod !== "colab" && (
            <span className={classes.text87size12} style={{ display: "block" }}>
              * {t("Model generation limit")} : 300{t("개")} (
              {t("cross product of the number of set values for each parameter")})
            </span>
          )}
        </Grid>
        <Grid
          container
          alignItems="center"
          sx={{
            mt: 1.5,
            py: 0.5,
            pr: 2,
            fontSize: 14,
            color: "var(--textWhite87)",
            border: "2px solid var(--surface2)",
            borderBottom: "none",
            background: "var(--surface2)",
          }}
        >
          {preferedMethod && preferedMethod !== "colab" && projectStatus === 0 && (
            <Grid item xs={2} maxWidth={70} textAlign="center">
              {t("Range setting")}
            </Grid>
          )}
          <Grid item xs={4} textAlign="center">
            {t("Parameter name")}
          </Grid>
          <Grid item sx={{ ml: "auto" }} xs={6} textAlign="center">
            <span>{t("Value")}</span>
            {option &&
              option !== "auto" &&
              preferedMethod !== "colab" &&
              projectStatus === 0 && (
                <Tooltip
                  title={t(
                    "int, float 타입의 경우 콤마, 스페이스, 엔터키를 이용하여 다중값을 설정할 수 있습니다."
                  )}
                  placement="right"
                >
                  <HelpOutlineIcon
                    fontSize="small"
                    sx={{
                      ml: 0.5,
                      fill: "var(--primary)",
                      "&:hover": { cursor: "pointer" },
                    }}
                  />
                </Tooltip>
              )}
          </Grid>
        </Grid>

        <Grid container sx={{ border: "2px solid var(--surface2)" }}>
          {preferedMethod === "colab" ? (
            <ColabInfoForm
              colabInfo={colabInfo}
              onChangeColabInfo={onChangeColabInfo}
              projectStatus={projectStatus}
            />
          ) : (
            <HyperParametersForm
              preferedMethod={preferedMethod}
              algorithmInfo={algorithmInfo}
              setAlgorithmInfo={setAlgorithmInfo}
              option={option}
              trainingMethod={trainingMethod}
              isParameterCompressedChecked={isParameterCompressedChecked}
              hyperParamsData={hyperParamsData}
              projectStatus={projectStatus}
              selectedSubParams={selectedSubParams}
              isClickedResetBtn={isClickedResetBtn}
              setIsClickedResetBtn={setIsClickedResetBtn}
            />
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default React.memo(HyperParameters);
