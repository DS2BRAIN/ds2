import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useTranslation } from "react-i18next";
import currentTheme from "assets/jss/custom";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages";
import {
  setSubHyperParameters,
  setHyperParameterOptionLists,
} from "redux/reducers/projects";

import produce from "immer";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Switch from "@mui/material/Switch";
import Input from "@mui/material/Input";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

let initialOptionLists = null;

const HyperParametersForm = ({
  preferedMethod,
  algorithmInfo,
  setAlgorithmInfo,
  option,
  trainingMethod,
  isParameterCompressedChecked,
  hyperParamsData,
  projectStatus,
  subParamsKey,
  isSubParam,
  isClickedResetBtn,
  setIsClickedResetBtn,
}) => {
  const { t } = useTranslation();
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { projects } = useSelector(
    (state) => ({ projects: state.projects }),
    []
  );
  const parameterFormContainerRef = useRef();

  const numbInputStyle = (info) => ({
    position: "relative",
    color: "var(--textWhite87)",
    border: "none",
    borderRadius: 8,

    "&.Mui-disabled": {
      color: "var(--textWhite38)",
    },

    "&.Mui-disabled::before": {
      borderBottomStyle: "none",
    },

    "&::before, &:not(.Mui-disabled):hover::before, &::after": {
      height: "100%",
      border: "none",
    },

    "&::after": {
      border: "none",
      transition: "none",
    },
  });
  const rangeInputProps = {
    style: {
      color: "var(--textWhite38)",
      padding: 0,
      marginTop: 0,
    },
  };
  const rangeInputLabelProps = {
    style: {
      top: -10,
      color: "var(--textWhite38)",
      fontSize: 12,
    },
  };
  const rangeInputStyle = {
    height: "100%",
    color: "var(--textWhite87)",
    "& div::before": {
      borderBottom: "1px solid var(--textWhite87)",
    },
    "& div:hover:not(.Mui-disabled)::before": {
      borderBottom: "2px solid var(--textWhite87)",
    },
  };

  const [subListsOpen, setSubListsOpen] = useState(null);
  const [subParams, setSubParams] = useState(null);
  const [valueLists, setValueLists] = useState(null);

  // 숫자, . , - 만 입력되도록 하고 , 스페이스, 엔터는 onkeypress에서 처리
  const onChangeValue = (
    e,
    option,
    key,
    type,
    hasSubParams,
    isItem,
    itemValue
  ) => {
    let value = isItem ? itemValue : e.target.value;

    if (hasSubParams && subParams && !subParams[key].includes(value)) {
      let tmpSelected = {
        ...subParams,
        [key]: [...subParams[key], value],
      };

      setSubParams(tmpSelected);
      dispatch(setSubHyperParameters(tmpSelected));
    }

    if (type === "numb") {
      const lastIdx = value.length - 1;
      const lastChar = value[lastIdx];
      const dots = [".", ","];
      const isValidValue =
        value === "" ||
        (dots.includes(lastChar) && !isNaN(Number(value[lastIdx - 1]))) ||
        (lastChar === "-" && (lastIdx === 0 || value[lastIdx - 1] === ",")) ||
        !isNaN(Number(lastChar));

      if (!isValidValue || value.includes(" ") || value.includes(",")) return;
    }

    if (subParamsKey) {
      setAlgorithmInfo(
        produce((draft) => {
          const info =
            draft[option].parameter[subParamsKey.key].subParameter[
              subParamsKey.key2
            ].parameter[key];

          info.value = value;
        })
      );
    } else {
      setAlgorithmInfo(
        produce((draft) => {
          draft[option].parameter[key].value = value;
        })
      );
    }
    if (type === "option") onAddOptValues(e, key, isItem, itemValue);

    // setDisabled();
  };

  const onDeleteNumValues = (e, option, key, idx) => {
    const valueArr =
      algorithmInfo[subParamsKey ? subParamsKey.key2 : option].parameter[key]
        .valueArr;
    let tmpValueArr = valueArr ? [...valueArr] : [];

    tmpValueArr = tmpValueArr.filter((v, i) => i !== idx);

    if (subParamsKey)
      setAlgorithmInfo(
        produce((draft) => {
          const info =
            draft[option].parameter[subParamsKey.key].subParameter[
              subParamsKey.key2
            ].parameter[key];

          info.valueArr = tmpValueArr;
        })
      );
    else
      setAlgorithmInfo(
        produce((draft) => {
          draft[option].parameter[key].valueArr = tmpValueArr;
        })
      );

    const inputEL = document.querySelector(`input#${key}`);
    inputEL.focus();
  };

  const onAddOptValues = (e, key, isItem, itemValue) => {
    let tmpValueArr = valueLists[key] ? [...valueLists[key]] : [];
    let value = isItem ? itemValue : e.target.value;

    if (!tmpValueArr.includes(value)) {
      tmpValueArr.push(value);

      setValueLists({ ...valueLists, [key]: tmpValueArr });
      dispatch(
        setHyperParameterOptionLists({
          ...projects.hyperParameterOptionLists,
          [key]: tmpValueArr,
        })
      );
    }
  };

  const onDeleteOptValues = (e, key, idx) => {
    let tmpValueArr = valueLists[key] ? [...valueLists[key]] : [];

    tmpValueArr = tmpValueArr.filter((v, i) => i !== idx);

    setValueLists({ ...valueLists, [key]: tmpValueArr });
    dispatch(
      setHyperParameterOptionLists({
        ...projects.hyperParameterOptionLists,
        [key]: tmpValueArr,
      })
    );
  };

  const onKeyDownNumbInput = (e, option, key) => {
    const param =
      algorithmInfo[subParamsKey ? subParamsKey.key2 : option].parameter[key];
    const value = param.value;
    const isEnter = e.key === "Enter" || e.key === "," || e.key === " ";
    const valueArr = param.valueArr;
    let tmpValueArr = valueArr ? [...valueArr] : [];
    const isNaNValue = isNaN(Number(value)) || value === "" || value === " ";
    const hasMinVal = param.hasOwnProperty("min");
    const hasMaxVal = param.hasOwnProperty("max");

    if (tmpValueArr.length > 0 && value === "" && e.key === "Backspace") {
      tmpValueArr.pop();

      if (subParamsKey)
        setAlgorithmInfo(
          produce((draft) => {
            const info =
              draft[option].parameter[subParamsKey.key].subParameter[
                subParamsKey.key2
              ].parameter[key];

            info.valueArr = tmpValueArr;
          })
        );
      else
        setAlgorithmInfo(
          produce((draft) => {
            draft[option].parameter[key].valueArr = tmpValueArr;
          })
        );
    }

    if (isEnter) {
      // 최소, 최대 제한값 중 하나라도 있는 경우
      if (hasMinVal || hasMaxVal) {
        const min = Number(param.min);
        const max = Number(param.max);
        const paramVal = Number(param.value);
        const isNotAllowedRange = param.between
          ? (hasMinVal && min >= paramVal) || (hasMaxVal && max <= paramVal)
          : (hasMinVal && min > paramVal) || (hasMaxVal && max < paramVal);

        // 입력값이 제한값 범위내에 없는 경우 (일반, 범위 둘 다 포함)
        if (isNotAllowedRange) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("Please enter a parameter value suitable for the range.") +
                `( ${key} )`
            )
          );

          return;
        }
      }

      if (isNaNValue) {
        dispatch(
          openErrorSnackbarRequestAction(
            t("Only int and float types can be inputted. please try again.")
          )
        );

        return;
      } else {
        let flag = true;

        tmpValueArr.map((v, i) => {
          if (v === Number(value)) {
            dispatch(
              openErrorSnackbarRequestAction(
                t("Duplicate values cannot be set.")
              )
            );

            flag = false;
          }
        });

        if (flag) {
          tmpValueArr.push(Number(value));

          if (subParamsKey)
            setAlgorithmInfo(
              produce((draft) => {
                const info =
                  draft[option].parameter[subParamsKey.key].subParameter[
                    subParamsKey.key2
                  ].parameter[key];

                info.valueArr = tmpValueArr;
                info.value = "";
              })
            );
          else
            setAlgorithmInfo(
              produce((draft) => {
                draft[option].parameter[key].valueArr = tmpValueArr;
                draft[option].parameter[key].value = "";
              })
            );

          // setDisabled();
        } else if (subParamsKey)
          setAlgorithmInfo(
            produce((draft) => {
              draft[option].parameter[subParamsKey.key].subParameter[
                subParamsKey.key2
              ].parameter[key].value = "";
            })
          );
        else
          setAlgorithmInfo(
            produce((draft) => {
              draft[option].parameter[key].value = "";
            })
          );
      }
    }
  };

  const onChangeIsSetRange = (e, option, key) => {
    setAlgorithmInfo(
      produce((draft) => {
        const param = subParamsKey
          ? draft[option].parameter[subParamsKey.key].subParameter[
              subParamsKey.key2
            ].parameter[key]
          : draft[option].parameter[key];

        param.checked = e.target.checked;

        if (param.dataTypeOptions && param.dataTypeOptions.includes("range")) {
          param.value = e.target.checked ? "" : param.subValue;
        }
      })
    );
  };

  const onChangeRangeValue = (e, option, key, valueType) => {
    const value = e.target.value;
    let tmpType =
      valueType === "Min" ? "min" : valueType === "Max" ? "max" : "split";

    if (subParamsKey)
      setAlgorithmInfo(
        produce((draft) => {
          const info =
            draft[option].parameter[subParamsKey.key].subParameter[
              subParamsKey.key2
            ].parameter[key];

          info.range = info.range ? info.range : {};

          info.range[tmpType] = Number(value);
        })
      );
    else
      setAlgorithmInfo(
        produce((draft) => {
          draft[option].parameter[key].range = draft[option].parameter[key]
            .range
            ? draft[option].parameter[key].range
            : {};

          draft[option].parameter[key].range[tmpType] = Number(value);
        })
      );
  };

  const onClickSubValChkBox = (e, option, key, subValue) => {
    const isChecked = e.target.checked;

    setAlgorithmInfo(
      produce((draft) => {
        const param = subParamsKey
          ? draft[option].parameter[subParamsKey.key].subParameter[
              subParamsKey.key2
            ].parameter[key]
          : draft[option].parameter[key];

        if (isChecked) {
          param.value = subValue;
        } else {
          param.value = param.inputType === "option" ? param.options[0] : "";

          param.valueArr =
            param.inputType === "option"
              ? [param.options[0]]
              : [param.min ? param.min : 0];
        }
      })
    );
  };

  const handleSubListsClick = (key, isOpen) => {
    setSubListsOpen({ ...subListsOpen, [key]: isOpen });
  };

  const deleteSelectedSubParam = (e, key, key2) => {
    e.stopPropagation();

    let tmpSelected = {
      ...subParams,
      [key]: subParams[key].filter((v) => v !== key2),
    };

    setSubParams(tmpSelected);
    dispatch(setSubHyperParameters(tmpSelected));
  };

  useEffect(() => {
    if (algorithmInfo && option) {
      parameterFormContainerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      let tmpOption = subParamsKey ? subParamsKey.key2 : option;
      let tmpValLists = projects.hyperParameterOptionLists
        ? projects.hyperParameterOptionLists
        : {};

      if (algorithmInfo[tmpOption]?.parameter) {
        Object.keys(algorithmInfo[tmpOption].parameter).map((key, i) => {
          const info = algorithmInfo[tmpOption].parameter;

          // drawer isOpen, subParams 세팅
          if (info[key].subParameter) {
            const tmpOpen = {};

            Object.keys(info[key].subParameter).map((key2, j) => {
              tmpOpen[key2] = projectStatus === 0;
            });

            setSubListsOpen(tmpOpen);
          }

          if (
            info[key].inputType === "option" &&
            info[key].dataType !== "dict"
          ) {
            const option = Array.isArray(info[key].options)
              ? info[key].options[0]
              : trainingMethod === "normal_classification"
              ? info[key].options.clf[0]
              : info[key].options.reg[0];

            tmpValLists[key] = [option];
          }
        });

        setValueLists(
          isClickedResetBtn
            ? initialOptionLists
            : {
                ...tmpValLists,
              }
        );
        if (!projects.hyperParameterOptionLists)
          dispatch(
            setHyperParameterOptionLists(
              isClickedResetBtn
                ? initialOptionLists
                : {
                    ...tmpValLists,
                  }
            )
          );
      }

      if (!initialOptionLists && subParamsKey) initialOptionLists = tmpValLists;

      if (isClickedResetBtn) setIsClickedResetBtn(false);
    }
  }, [isClickedResetBtn, option]);

  // 설정된 subHyperParameter 값 적용
  useEffect(() => {
    if (hyperParamsData) {
      const data = hyperParamsData[0];
      let tmpSubData = {};
      let tmpSubParams = {};

      Object.keys(data).map((key, i) => {
        if (data[key][0]?.function_name) {
          data[key].map((v1, j) => {
            Object.keys(v1).map((key2, k) => {
              let funcData = tmpSubData[v1.function_name]
                ? tmpSubData[v1.function_name]
                : {};

              if (funcData) {
                if (funcData[key2]) {
                  if (!funcData[key2].includes(v1[key2]))
                    funcData[key2].push(v1[key2]);
                } else funcData[key2] = [v1[key2]];
              }

              tmpSubData = {
                ...tmpSubData,
                [v1.function_name]: {
                  ...tmpSubData[v1.function_name],
                  ...funcData,
                },
              };
            });
          });

          tmpSubParams = {
            ...tmpSubParams,
            [key]: Object.keys(tmpSubData),
          };

          Object.keys(tmpSubData).map((tmpKey) => {
            setAlgorithmInfo(
              produce((draft) => {
                const info = draft[option].parameter[key].subParameter[tmpKey];

                Object.keys(info.parameter).map((paramKey) => {
                  const subParamsVal = info.parameter[paramKey];
                  const subDataVal = tmpSubData[tmpKey][paramKey];

                  if (subDataVal) {
                    if (subDataVal.length > 1)
                      subParamsVal.valueArr = subDataVal;
                    else
                      subParamsVal.value =
                        subDataVal[0] === null ? "None" : subDataVal[0];
                  }
                });
              })
            );
          });

          if (!projects.subHyperParameters)
            dispatch(setSubHyperParameters(tmpSubParams));
          setSubParams(tmpSubParams);
        }
      });
    }
  }, [hyperParamsData]);

  // 학습 시작 후 설정된 hyperparameter 값 적용
  useEffect(() => {
    if (
      !isSubParam &&
      hyperParamsData &&
      option &&
      projects.project?.trainingMethod &&
      algorithmInfo[option]
    ) {
      const trainingMethod = projects.project.trainingMethod;
      const paramData = hyperParamsData[0];

      setAlgorithmInfo(
        produce((draft) => {
          Object.keys(algorithmInfo[option].parameter).map((key, i) => {
            const param = algorithmInfo[option].parameter;
            const isMethodMatched =
              param[key].method === "clf/reg" ||
              (trainingMethod === "normal_classification" &&
                param[key].method === "clf") ||
              (trainingMethod === "normal_regression" &&
                param[key].method === "reg");

            if (isMethodMatched) {
              if (
                paramData &&
                paramData[key] &&
                paramData[key].length > 0 &&
                typeof paramData[key][0] !== "object"
              ) {
                draft[option].parameter[key].valueArr = paramData[key];

                if (
                  draft[option].parameter[key].dataTypeOptions.includes("range")
                )
                  draft[option].parameter[key].value =
                    paramData[key][0] === null ? "None" : paramData[key][0];
              }
            }
          });
        })
      );
    }
  }, [
    isSubParam,
    hyperParamsData && hyperParamsData[0],
    option,
    projects.project,
  ]);

  useEffect(() => {
    if (projects.subHyperParameters && !hyperParamsData)
      setSubParams(projects.subHyperParameters);
  }, [projects.subHyperParameters, hyperParamsData]);

  // useEffect(() => {
  //   setDisabled();
  // }, [algorithmInfo, option]);

  return (
    <Grid
      ref={parameterFormContainerRef}
      container
      maxHeight={480}
      sx={{ p: 2, overflowY: "auto" }}
    >
      {algorithmInfo[subParamsKey ? subParamsKey.key2 : option]?.parameter &&
        Object.keys(
          algorithmInfo[subParamsKey ? subParamsKey.key2 : option].parameter
        ).map((key, i) => {
          const info =
            algorithmInfo[subParamsKey ? subParamsKey.key2 : option].parameter;
          const subCon = info[key].subCondition;
          const subDomainCon = info[key].subDomainCondition;
          const infoMethod = info[key].method;
          const isMethodMatched =
            infoMethod &&
            (trainingMethod.includes("_ann") ||
              (trainingMethod === "normal" && infoMethod.includes("clf/reg")) ||
              (trainingMethod === "normal_classification" &&
                infoMethod.includes("clf")) ||
              (trainingMethod === "normal_regression" &&
                infoMethod.includes("reg")));
          let subConTxt = "";
          let subDomainConTxt = "";
          const valLists =
            projectStatus !== 0
              ? info[key].valueArr
              : projects.hyperParameterOptionLists
              ? projects.hyperParameterOptionLists[key]
              : valueLists
              ? valueLists[key]
              : [];
          const valChipLists = info[key].valueArr
            ? Array.isArray(info[key].valueArr)
              ? info[key].valueArr
              : trainingMethod === "normal_classification"
              ? info[key].valueArr.clf
              : info[key].valueArr.reg
            : [];

          const switchDisabled =
            info[key].inputType === "option" ||
            (info[key].subDomainCondition &&
              info[key].subDomainCondition.action === "count");

          if (subCon) {
            subConTxt = `${subCon.param} ${
              subCon.value.length === 1
                ? subCon.isMatched
                  ? "=="
                  : "!="
                : subCon.isMatched
                ? "in"
                : "not in"
            } ${subCon.value.length > 1 ? "[" : ""} ${subCon.value.map(
              (v, i) => `'${v}'`
            )} ${subCon.value.length > 1 ? "]" : ""}`;
          }

          if (subDomainCon) {
            subDomainConTxt = `${subDomainCon.text}`;
          }
          const isValListsRequired =
            (valLists &&
              valLists.length > 0 &&
              info[key].inputType === "option" &&
              info[key].dataType !== "dict" &&
              !info[key].disabled &&
              projectStatus === 0) ||
            (info[key].value &&
              info[key].subValue &&
              info[key].value !== info[key].subValue);

          return (
            isMethodMatched && (
              <React.Fragment key={key}>
                {(info[key].dataType !== "dict" ||
                  (info[key].dataType === "dict" && projectStatus === 0)) && (
                  <Grid
                    container
                    sx={{ mt: i > 0 ? 2 : 0 }}
                    alignItems="center"
                    wrap="nowrap"
                    minHeight={60}
                  >
                    {projectStatus === 0 && (
                      <Tooltip
                        title={
                          switchDisabled
                            ? t(
                                "Range setting is not supported for this parameter."
                              )
                            : ""
                        }
                      >
                        <Grid item xs={2} maxWidth={70}>
                          <Switch
                            className={switchDisabled ? "disabled" : "normal"}
                            value="all"
                            checked={info[key].checked}
                            disabled={info[key].disabled || switchDisabled}
                            color="primary"
                            inputProps={{ "aria-label": "primary checkbox" }}
                            onChange={(e) => onChangeIsSetRange(e, option, key)}
                          />
                        </Grid>
                      </Tooltip>
                    )}

                    <Grid item xs={4} sx={{ px: 0.25, wordBreak: "break-all" }}>
                      <Grid container direction="column">
                        {info[key].dataType && (
                          <span
                            style={{
                              display: "block",
                              color: "var(--mainSub)",
                              fontSize: 11,
                              // fontWeight: 400,
                              lineHeight: 1,
                            }}
                          >
                            {info[key].dataTypeOptions && (
                              <>
                                {info[key].dataTypeOptions.includes("list")
                                  ? `list (${info[key].dataType})`
                                  : info[key].dataTypeOptions.includes("range")
                                  ? `range (${info[key].dataType})`
                                  : info[key].dataType}
                              </>
                            )}
                          </span>
                        )}
                        <span style={{ fontSize: 15, fontWeight: 500 }}>
                          {key}
                        </span>

                        {(info[key].hasOwnProperty("min") ||
                          info[key].hasOwnProperty("max")) && (
                          <p
                            style={{
                              margin: 0,
                              color: "var(--primary)",
                              fontSize: 11,
                              fontWeight: 500,
                            }}
                          >
                            ({" "}
                            {info[key].hasOwnProperty("min") &&
                              `Min: ${info[key].min}${
                                info[key].between ? "  ▲" : ""
                              }`}
                            {info[key].hasOwnProperty("min") &&
                              info[key].hasOwnProperty("max") &&
                              " / "}
                            {info[key].hasOwnProperty("max") &&
                              `Max: ${info[key].max}${
                                info[key].between ? "  ▼" : ""
                              }`}{" "}
                            )
                          </p>
                        )}
                      </Grid>
                    </Grid>

                    <Grid item sx={{ ml: "auto" }} xs={6}>
                      <Grid container alignItems="center" wrap="nowrap">
                        <Grid item xs={12}>
                          {info[key].checked ? (
                            <Grid
                              container
                              height={30}
                              style={{ fontSize: 12 }}
                              alignItems="center"
                            >
                              {["Min", "Max"].map((v, i) => {
                                return (
                                  <Grid
                                    key={v}
                                    item
                                    xs={
                                      info[key].dataTypeOptions.includes(
                                        "range"
                                      )
                                        ? 5
                                        : 3.5
                                    }
                                    sx={{ mx: v === "Max" ? 1 : 0 }}
                                  >
                                    <TextField
                                      id="standard-basic"
                                      type="number"
                                      label={v}
                                      disabled={info[key].disabled}
                                      defaultValue={
                                        info[key].range
                                          ? v === "Min"
                                            ? info[key].range.min
                                            : info[key].range.max
                                          : ""
                                      }
                                      inputProps={{
                                        style: {
                                          color: "var(--textWhite87)",
                                        },
                                      }}
                                      fullWidth
                                      variant="standard"
                                      InputProps={rangeInputProps}
                                      InputLabelProps={rangeInputLabelProps}
                                      sx={rangeInputStyle}
                                      onBlur={(e) =>
                                        onChangeRangeValue(e, option, key, v)
                                      }
                                    />
                                  </Grid>
                                );
                              })}
                              {!info[key].dataTypeOptions.includes("range") && (
                                <Grid item xs={3.5}>
                                  <TextField
                                    id="standard-basic"
                                    type="number"
                                    label="Split"
                                    // placeholder="Split"
                                    disabled={info[key].disabled}
                                    fullWidth
                                    variant="standard"
                                    defaultValue={
                                      info[key].range
                                        ? info[key].range.split
                                        : ""
                                    }
                                    inputProps={{
                                      style: {
                                        color: "var(--textWhite87)",
                                      },
                                    }}
                                    InputProps={rangeInputProps}
                                    InputLabelProps={rangeInputLabelProps}
                                    sx={rangeInputStyle}
                                    onBlur={(e) =>
                                      onChangeRangeValue(
                                        e,
                                        option,
                                        key,
                                        "Split"
                                      )
                                    }
                                  />
                                </Grid>
                              )}
                            </Grid>
                          ) : (
                            <>
                              {info[key].inputType === "numb" ? (
                                <Grid
                                  container
                                  alignItems="center"
                                  wrap="nowrap"
                                >
                                  <Grid item xs={12}>
                                    <Grid
                                      container
                                      sx={{
                                        position: "relative",
                                        border: "1px solid var(--textWhite38)",
                                        borderRadius: 1,
                                        p: "4px 12px 2px",
                                      }}
                                    >
                                      <Grid item>
                                        <Grid container alignItems="center">
                                          {info[key].value &&
                                          info[key].subValue &&
                                          info[key].value === info[key].subValue
                                            ? null
                                            : valChipLists &&
                                              valChipLists.map((v, i) => {
                                                return (
                                                  <React.Fragment
                                                    key={`${v}_${i}`}
                                                  >
                                                    <Chip
                                                      label={String(v)}
                                                      onDelete={
                                                        projectStatus === 0
                                                          ? (e) =>
                                                              onDeleteNumValues(
                                                                e,
                                                                option,
                                                                key,
                                                                i
                                                              )
                                                          : null
                                                      }
                                                      size="small"
                                                      sx={{
                                                        color:
                                                          hyperParamsData ||
                                                          [9, 99].indexOf(
                                                            projectStatus
                                                          ) > -1
                                                            ? "var(--textWhite6)"
                                                            : "var(--textWhite87)",
                                                        backgroundColor:
                                                          hyperParamsData ||
                                                          [9, 99].indexOf(
                                                            projectStatus
                                                          ) > -1
                                                            ? "var(--surface2)"
                                                            : "var(--surface1)",
                                                        borderRadius: 2,
                                                        mr: 0.5,
                                                        my: 0.5,
                                                        px: 0.5,
                                                      }}
                                                    />
                                                    {i === 0 &&
                                                      info[
                                                        key
                                                      ].dataTypeOptions.includes(
                                                        "range"
                                                      ) && (
                                                        <span
                                                          style={{
                                                            marginRight: "4px",
                                                          }}
                                                        >
                                                          ~
                                                        </span>
                                                      )}
                                                  </React.Fragment>
                                                );
                                              })}

                                          {(projectStatus === 0 ||
                                            (info[key].subValue &&
                                              info[key].value ===
                                                info[key].subValue)) && (
                                            <Grid item xs>
                                              <Input
                                                id={key}
                                                className="no-dials-input"
                                                value={
                                                  info[key].value ===
                                                  info[key].subValue
                                                    ? ""
                                                    : typeof info[key].value ===
                                                      "object"
                                                    ? info[key].value[
                                                        trainingMethod ===
                                                        "normal_classification"
                                                          ? "clf"
                                                          : "reg"
                                                      ]
                                                    : info[key].value
                                                }
                                                autoComplete="off"
                                                type="text"
                                                onChange={(e) => {
                                                  onChangeValue(
                                                    e,
                                                    option,
                                                    key,
                                                    "numb",
                                                    info[key].hasOwnProperty(
                                                      "subParameter"
                                                    )
                                                  );
                                                }}
                                                onKeyDown={(e) => {
                                                  onKeyDownNumbInput(
                                                    e,
                                                    option,
                                                    key
                                                  );
                                                }}
                                                disabled={
                                                  projectStatus !== 0
                                                    ? projects.project
                                                        .statusText ===
                                                        "중단" ||
                                                      isParameterCompressedChecked
                                                    : info[key].disabled ||
                                                      (!info[key].valueArr &&
                                                        info[key].value ===
                                                          info[key].subValue)
                                                }
                                                inputProps={{
                                                  style: {
                                                    padding: 4,
                                                    WebkitTextFillColor:
                                                      "unset",
                                                  },
                                                }}
                                                style={{
                                                  opacity: hyperParamsData
                                                    ? 0
                                                    : 1,
                                                }}
                                                sx={numbInputStyle(info[key])}
                                              />
                                            </Grid>
                                          )}
                                        </Grid>
                                      </Grid>

                                      <span
                                        style={{
                                          position: "absolute",
                                          top: "50%",
                                          left: 16,
                                          transform: "translateY(-50%)",
                                          fontSize: 14,
                                          color: "var(--textWhite6)",
                                        }}
                                      >
                                        {info[key].value === info[key].subValue
                                          ? info[key].subValue
                                          : ""}
                                      </span>
                                    </Grid>
                                  </Grid>
                                  <Grid item>
                                    {info[key].subValue &&
                                      projectStatus === 0 &&
                                      !info[key].dataTypeOptions.includes(
                                        "range"
                                      ) && (
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              disabled={info[key].disabled}
                                              checked={
                                                info[key].hasOwnProperty(
                                                  "value"
                                                ) &&
                                                info[key].value ===
                                                  info[key].subValue
                                              }
                                              onClick={(e) =>
                                                onClickSubValChkBox(
                                                  e,
                                                  option,
                                                  key,
                                                  info[key].subValue
                                                )
                                              }
                                            />
                                          }
                                          label={
                                            <span style={{ fontSize: 12 }}>
                                              {info[key].subValue}
                                            </span>
                                          }
                                          sx={{
                                            flexDirection: "column-reverse",
                                            mr: 0,
                                            ml: 1.5,
                                            mt: -1,
                                          }}
                                        />
                                      )}
                                  </Grid>
                                </Grid>
                              ) : (
                                info[key].inputType === "option" && (
                                  <>
                                    {projectStatus === 0 ? (
                                      <Grid
                                        container
                                        alignItems="center"
                                        wrap="nowrap"
                                        sx={{ position: "relative" }}
                                      >
                                        <FormControl
                                          className={classes.formControl}
                                          sx={{
                                            "& legend": { display: "none" },
                                            "& fieldset": {
                                              top: 0,
                                              height: "100%",
                                              borderColor:
                                                "var(--textWhite38) !important",
                                            },
                                          }}
                                        >
                                          <Select
                                            labelid="demo-simple-select-outlined-label"
                                            value={
                                              (projectStatus !== 0 &&
                                                info[
                                                  key
                                                ].dataTypeOptions.includes(
                                                  "list"
                                                )) ||
                                              info[key].value ===
                                                info[key].subValue
                                                ? ""
                                                : typeof info[key].value ===
                                                  "object"
                                                ? info[key].value[
                                                    trainingMethod ===
                                                    "normal_classification"
                                                      ? "clf"
                                                      : "reg"
                                                  ]
                                                : info[key].value
                                            }
                                            disabled={
                                              projectStatus !== 0 ||
                                              info[key].disabled ||
                                              info[key].value ===
                                                info[key].subValue
                                            }
                                            onChange={(e) => {
                                              onChangeValue(
                                                e,
                                                option,
                                                key,
                                                "option",
                                                info[key].hasOwnProperty(
                                                  "subParameter"
                                                )
                                              );
                                            }}
                                            id="methodForPredictSelectBox"
                                            SelectDisplayProps={{
                                              style: {
                                                padding: "8px 16px",
                                                color: "var(--textWhite87)",
                                                WebkitTextFillColor: "unset",
                                                position: "relative",
                                              },
                                            }}
                                          >
                                            {info[key].options &&
                                            Array.isArray(info[key].options)
                                              ? info[key].options.map(
                                                  (opt, i) => {
                                                    return (
                                                      <MenuItem
                                                        key={opt}
                                                        value={opt}
                                                        onClick={(e) => {
                                                          onChangeValue(
                                                            e,
                                                            option,
                                                            key,
                                                            "option",
                                                            info[
                                                              key
                                                            ].hasOwnProperty(
                                                              "subParameter"
                                                            ),
                                                            true,
                                                            opt
                                                          );
                                                        }}
                                                      >
                                                        {opt}
                                                      </MenuItem>
                                                    );
                                                  }
                                                )
                                              : info[key].options[
                                                  trainingMethod ===
                                                  "normal_classification"
                                                    ? "clf"
                                                    : "reg"
                                                ].map((opt, i) => {
                                                  return (
                                                    <MenuItem
                                                      key={opt}
                                                      value={opt}
                                                      onClick={(e) => {
                                                        onChangeValue(
                                                          e,
                                                          option,
                                                          key,
                                                          "option",
                                                          info[
                                                            key
                                                          ].hasOwnProperty(
                                                            "subParameter"
                                                          ),
                                                          true,
                                                          opt
                                                        );
                                                      }}
                                                    >
                                                      {opt}
                                                    </MenuItem>
                                                  );
                                                })}
                                          </Select>
                                        </FormControl>

                                        <span
                                          style={{
                                            position: "absolute",
                                            top:
                                              info[key].inputType === "option"
                                                ? 11
                                                : 7,
                                            left: 16,
                                            fontSize: 14,
                                            color: "var(--textWhite6)",
                                          }}
                                        >
                                          {info[key].value ===
                                          info[key].subValue
                                            ? info[key].subValue
                                            : projectStatus !== 0 &&
                                              info[
                                                key
                                              ].dataTypeOptions.includes("list")
                                            ? "-"
                                            : ""}
                                        </span>

                                        {info[key].subValue &&
                                          projectStatus === 0 &&
                                          !info[key].dataTypeOptions.includes(
                                            "range"
                                          ) && (
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  disabled={info[key].disabled}
                                                  checked={
                                                    info[key].value ===
                                                    info[key].subValue
                                                  }
                                                  onClick={(e) =>
                                                    onClickSubValChkBox(
                                                      e,
                                                      option,
                                                      key,
                                                      info[key].subValue
                                                    )
                                                  }
                                                />
                                              }
                                              label={
                                                <span style={{ fontSize: 12 }}>
                                                  {info[key].subValue}
                                                </span>
                                              }
                                              sx={{
                                                flexDirection: "column-reverse",
                                                mr: 0,
                                                ml: 1.5,
                                                mt: -1,
                                              }}
                                            />
                                          )}
                                      </Grid>
                                    ) : (
                                      <Grid
                                        container
                                        alignItems="center"
                                        wrap="nowrap"
                                        sx={{
                                          position: "relative",
                                          maxHeight: "104px",
                                          overflowY: "auto",
                                          overflowX: "hidden",
                                        }}
                                      >
                                        <Grid
                                          item
                                          xs={12}
                                          className={classes.formControl}
                                          sx={{
                                            height: "100%",
                                            border:
                                              "1px solid var(--textWhite38)",
                                            borderRadius: "4px",
                                            padding: "4px 12px 2px",
                                          }}
                                        >
                                          {info[key].value &&
                                          info[key].subValue &&
                                          info[key].value === info[key].subValue
                                            ? null
                                            : valChipLists &&
                                              valChipLists.map((v, i) => {
                                                return (
                                                  <Chip
                                                    key={v + i}
                                                    label={String(v)}
                                                    onDelete={
                                                      projectStatus === 0
                                                        ? (e) =>
                                                            onDeleteOptValues(
                                                              e,
                                                              key,
                                                              i
                                                            )
                                                        : null
                                                    }
                                                    size="small"
                                                    sx={{
                                                      color:
                                                        hyperParamsData ||
                                                        [9, 99].indexOf(
                                                          projectStatus
                                                        ) > -1
                                                          ? "var(--textWhite6)"
                                                          : "var(--textWhite87)",
                                                      backgroundColor:
                                                        hyperParamsData ||
                                                        [9, 99].indexOf(
                                                          projectStatus
                                                        ) > -1
                                                          ? "var(--surface2)"
                                                          : "var(--surface1)",
                                                      borderRadius: 2,
                                                      mr: 0.5,
                                                      my: 0.5,
                                                      px: 0.5,
                                                    }}
                                                  />
                                                );
                                              })}
                                        </Grid>
                                      </Grid>
                                    )}
                                  </>
                                )
                              )}
                            </>
                          )}
                        </Grid>

                        {subCon && (
                          <Tooltip
                            title={
                              <>
                                <span style={{ display: "block" }}>
                                  {t("")} :{" "}
                                </span>
                                <span style={{ fontSize: 12 }}>
                                  {subConTxt}
                                </span>
                              </>
                            }
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

                        {subDomainCon && (
                          <Tooltip
                            title={
                              <>
                                {/* <span style={{ display: "block" }}>
                                  {t("")} :{" "}
                                </span> */}
                                <span style={{ fontSize: 12 }}>
                                  {subDomainConTxt}
                                </span>
                              </>
                            }
                          >
                            <ReportGmailerrorredOutlinedIcon
                              fontSize="small"
                              sx={{
                                marginLeft: 0.5,
                                fill: "var(--primary)",
                                "&:hover": { cursor: "pointer" },
                              }}
                            />
                          </Tooltip>
                        )}
                      </Grid>
                      {info[key].subText && (
                        <span
                          style={{
                            display: "block",
                            fontSize: 11,
                            color: "var(--primary)",
                            marginTop: 10,
                            lineHeight: 1.6,
                          }}
                        >
                          {info[key].subText}
                        </span>
                      )}
                    </Grid>
                  </Grid>
                )}

                {isValListsRequired && (
                  <Grid container alignItems="center" wrap="nowrap">
                    <Grid item width="16%" maxWidth={60} textAlign="center">
                      <span style={{ fontSize: 12 }}>Lists :</span>
                    </Grid>
                    <Grid item xs>
                      {valLists.map((v, i) => {
                        return (
                          <Chip
                            key={v + i}
                            label={String(v)}
                            onDelete={
                              projectStatus === 0
                                ? (e) => onDeleteOptValues(e, key, i)
                                : null
                            }
                            size="small"
                            sx={{
                              color:
                                hyperParamsData ||
                                [9, 99].indexOf(projectStatus) > -1
                                  ? "var(--textWhite6)"
                                  : "var(--textWhite87)",
                              backgroundColor:
                                hyperParamsData ||
                                [9, 99].indexOf(projectStatus) > -1
                                  ? "var(--surface2)"
                                  : "var(--surface1)",
                              borderRadius: 2,
                              mr: 0.5,
                              my: 0.5,
                              px: 0.5,
                            }}
                          />
                        );
                      })}
                    </Grid>
                  </Grid>
                )}

                {info[key].subParameter && (
                  <Grid
                    container
                    width="100%"
                    sx={{ mt: projectStatus === 0 ? 1 : 3 }}
                  >
                    <List
                      sx={{
                        width: "100%",
                        bgcolor: "transparent",
                        border: "2px solid var(--surface2)",
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                      component="nav"
                      aria-labelledby="nested-list-subheader"
                      subheader={
                        <ListSubheader
                          component="div"
                          id="nested-list-subheader"
                          style={{
                            backgroundColor: "var(--surface2)",
                            lineHeight: "inherit",
                            color: "var(--textWhite87)",
                          }}
                        >
                          {key} setting
                        </ListSubheader>
                      }
                    >
                      {subParams &&
                        subParams[key].map((key2, i) => {
                          const subInfo = info[key].subParameter;
                          const subKey = { key, key2 };

                          return (
                            subParams[key] &&
                            subParams[key].includes(key2) && (
                              <React.Fragment key={key2}>
                                <ListItemButton
                                  sx={{
                                    background:
                                      subListsOpen && subListsOpen[key2]
                                        ? "rgba(0,0,0,0.2)"
                                        : "inherit",
                                  }}
                                  onClick={() =>
                                    handleSubListsClick(
                                      key2,
                                      !subListsOpen[key2]
                                    )
                                  }
                                >
                                  {subParams[key].length > 1 &&
                                    projectStatus === 0 && (
                                      <ListItemIcon>
                                        <Tooltip
                                          title={t("Delete")}
                                          placement="left"
                                        >
                                          <RemoveCircleIcon
                                            onClick={(e) =>
                                              deleteSelectedSubParam(
                                                e,
                                                key,
                                                key2
                                              )
                                            }
                                            sx={{ fill: "var(--secondary1)" }}
                                          />
                                        </Tooltip>
                                      </ListItemIcon>
                                    )}

                                  <ListItemText
                                    primary={`${
                                      subParams[key]
                                        ? `${subParams[key].indexOf(key2) + 1}.`
                                        : ""
                                    } ${subInfo[key2].label}`}
                                  />

                                  {subListsOpen && subListsOpen[key2] ? (
                                    <ExpandLess />
                                  ) : (
                                    <ExpandMore />
                                  )}
                                </ListItemButton>

                                <Collapse
                                  in={subListsOpen ? subListsOpen[key2] : false}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <Grid container>
                                    <HyperParametersForm
                                      preferedMethod={preferedMethod}
                                      algorithmInfo={info[key].subParameter}
                                      setAlgorithmInfo={setAlgorithmInfo}
                                      option={option}
                                      trainingMethod={trainingMethod}
                                      isParameterCompressedChecked={
                                        isParameterCompressedChecked
                                      }
                                      hyperParamsData={hyperParamsData}
                                      projectStatus={projectStatus}
                                      // setDisabled={setDisabled}
                                      subParamsKey={subKey}
                                      isSubParam
                                    />
                                  </Grid>
                                </Collapse>
                              </React.Fragment>
                            )
                          );
                        })}
                    </List>
                  </Grid>
                )}
              </React.Fragment>
            )
          );
        })}
    </Grid>
  );
};

export default React.memo(HyperParametersForm);
