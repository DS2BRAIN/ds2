import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ChromePicker } from "react-color";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-powershell";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

import { putProjectServiceAppRequestActionWithoutLoading } from "redux/reducers/projects.js";
import { openSuccessSnackbarRequestAction } from "redux/reducers/messages.js";
import currentTheme from "assets/jss/custom.js";
import { currentThemeColor } from "assets/jss/custom.js";
import { IS_ENTERPRISE } from "variables/common";
import Cookies from "helpers/Cookies";
import Button from "components/CustomButtons/Button";
import Chart from "components/Chart/Chart.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";

import InputBase from "@material-ui/core/InputBase";
import Modal from "@material-ui/core/Modal";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import CloseIcon from "@material-ui/icons/Close";
import CheckIcon from "@material-ui/icons/Check";

const Detail = React.memo(({ datacolumns }) => {
  const classes = currentTheme();
  let apiRef = useRef();
  const dispatch = useDispatch();
  const { user, projects, models } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
      models: state.models,
    }),
    []
  );
  const { t } = useTranslation();

  const backendurl = `${
    process.env.REACT_APP_BACKEND_URL
      ? process.env.REACT_APP_BACKEND_URL
      : "https://dslabaa.clickai.ai/"
  }`;
  const [isLoading, setIsLoading] = useState(true);
  const [modelDetail, setModelDetail] = useState(null);
  const [chosenChart, setChosenChart] = useState("detail");
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [confusionMatrixSum, setConfusionMatrixSum] = useState(1000);
  const [apiUrl, setApiUrl] = useState("");
  const [chosenLanguage, setChosenLanguage] = useState("javascript");
  const [apiContent, setApiContent] = useState("");
  const [apptoken, setApptoken] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [resultJson, setResultJson] = useState("");
  const [colorPickerModal, setColorPickerModal] = useState(false);
  const [jsonEditMode, setJsonEditMode] = useState(false);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [hyperParams, setHyperParams] = useState(null);

  useEffect(() => {
    if (models.model) {
      setIsLoading(true);
      if (
        projects.project.trainingMethod.indexOf("normal") > -1 ||
        projects.project.trainingMethod.indexOf("text") > -1 ||
        projects.project.trainingMethod.indexOf("time_series") > -1
      ) {
        setApiUrl(
          `${backendurl}predict/${JSON.parse(Cookies.getCookie("user"))["id"]}`
        );
      } else {
        setApiUrl(
          `${backendurl}predictimage/${
            JSON.parse(Cookies.getCookie("user"))["id"]
          }`
        );
      }
      let data = models.model;
      try {
        let confusionString = "";
        let confusionArr = [];
        if (data.confusionMatrix) {
          confusionString = data.confusionMatrix.replace(/\\n/g, "");
          confusionArr = JSON.parse(confusionString);
          if (typeof confusionArr !== "object") {
            confusionArr = JSON.parse(confusionArr);
          }
        } else if (JSON.parse(models.response).confusionMatrix) {
          confusionString = JSON.parse(models.response).confusionMatrix.replace(
            /\\n/g,
            ""
          );
          confusionArr = JSON.parse(confusionString);
          if (typeof confusionArr !== "object") {
            confusionArr = JSON.parse(confusionArr);
          }
        }
        var confusionMatrixSumRaw = 0;
        confusionArr.map((col) => {
          col.map((num) => {
            confusionMatrixSumRaw += num;
          });
        });
        setConfusionMatrix(confusionArr);
        setConfusionMatrixSum(confusionMatrixSumRaw);
      } catch (error) {
        data.confusionMatrix = [];
      }
      try {
        data.yClass = JSON.parse(data.yClass.replace(/\'/g, '"'));
      } catch (error) {
        data.yClass = [];
      }
      if (data.yClass && data.yClass.length > 0) {
        let yClassString = "{";
        data.yClass.forEach((yclass, idx) => {
          if (idx === data.yClass.length - 1) {
            yClassString += `"${yclass}":"Result value is ${yclass}"}`;
          } else {
            yClassString += `"${yclass}":"Result value is ${yclass}",`;
          }
        });
        setResultJson(yClassString);
      }
      setModelDetail(data);
      getFeatureImportance(data);
      setLanguage();
    }
  }, [models.model]);

  useEffect(() => {
    if (projects.project) {
      if (projects.project.background)
        setBackgroundColor(projects.project.background);
      if (projects.project.resultJson)
        setResultJson(projects.project.resultJson);
    }
  }, [projects.project]);

  useEffect(() => {
    if (modelDetail) {
      // Setting the state of the parameter value set for each model training
      if (modelDetail.hyper_param) {
        const params = modelDetail.hyper_param;
        const excepted = ["id", "user", "project", "is_original"];
        const tmpHyperParams = {};

        Object.keys(params).map((key) => {
          if (excepted.indexOf(key) === -1) tmpHyperParams[key] = params[key];
        });

        setHyperParams(tmpHyperParams);
      }

      setIsLoading(false);
    }
  }, [modelDetail]);

  useEffect(() => {
    const apptoken = Cookies.getCookie("apptoken");
    setApptoken(apptoken);
  }, []);

  useEffect(() => {
    setLanguage();
  }, [chosenLanguage]);

  const setLanguage = () => {
    var user = JSON.parse(Cookies.getCookie("user"));
    var userId = user["id"];
    var parameterColumns = {};
    var apptoken = Cookies.getCookie("apptoken");
    var trainingColumnInfoRaw = {};
    if (projects.project.trainingColumnInfo) {
      Object.keys(projects.project.trainingColumnInfo).map((columnInfo) => {
        // console.log("columnInfo.columnName trainingColumnInfo");
        // console.log(projects.project.trainingColumnInfo);
        // console.log(columnInfo);
        trainingColumnInfoRaw[+columnInfo] =
          projects.project.trainingColumnInfo[columnInfo];
      });
    } else if (projects.project.fileStructure) {
      JSON.parse(projects.project.fileStructure).map((columnInfo) => {
        // console.log("columnInfo.columnName fileStructure");
        // console.log(columnInfo.columnName);
        // console.log(columnInfo);
        trainingColumnInfoRaw[+columnInfo.id] = JSON.parse(columnInfo.use);
      });
    }

    datacolumns.map((columnRaw) => {
      var columnName =
        columnRaw["columnName"].indexOf(columnRaw["dataconnectorName"]) > -1
          ? columnRaw["columnName"]
          : columnRaw["columnName"] + "__" + columnRaw["dataconnectorName"];
      if (
        columnRaw["id"] !== projects.project.valueForPredictColumnId &&
        trainingColumnInfoRaw[columnRaw["id"]] !== false
      ) {
        if (columnRaw["type"] == "number") {
          parameterColumns[columnName] = 0;
        } else {
          parameterColumns[columnName] = "";
        }
      }
    });
    parameterColumns = JSON.stringify(parameterColumns);
    if (!models.model) return;
    if (
      projects.project.trainingMethod.indexOf("normal") > -1 ||
      projects.project.trainingMethod.indexOf("text") > -1 ||
      projects.project.trainingMethod.indexOf("time_series") > -1
    ) {
      switch (chosenLanguage) {
        case "javascript":
          setApiContent(
            `
                    var data = JSON.stringify({"modelid": ${
                      models.model.id
                    },"apptoken": ${apptoken},"parameter": ${parameterColumns}});

                    var xhr = new XMLHttpRequest();
                    xhr.withCredentials = true;

                    xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {
                        console.log(this.responseText);
                    }
                    });

                    xhr.open("POST", "${
                      process.env.REACT_APP_BACKEND_URL
                        ? process.env.REACT_APP_BACKEND_URL
                        : "https://dslabaa.clickai.ai/"
                    }predict/${userId}/");
                    xhr.setRequestHeader("content-type", "application/json");

                    xhr.send(data);`
          );
          break;
        case "python":
          setApiContent(`
                    import requests
                    import json

                    url = "${
                      process.env.REACT_APP_BACKEND_URL
                        ? process.env.REACT_APP_BACKEND_URL
                        : "https://dslabaa.clickai.ai/"
                    }predict/${userId}/"

                    payload = {"modelid":${
                      models.model.id
                    },"apptoken":${apptoken},"parameter": ${parameterColumns}}
                    headers = {
                        'content-type': "application/json",
                        'cache-control': "no-cache",
                        }

                    response = requests.request("POST", url, data=json.dumps(payload), headers=headers)

                    print(response.text)`);
          break;
        case "wget":
          setApiContent(`
                    wget \\
                    --method POST \\
                    --header 'content-type: application/json' \\
                    --body-data '{"modelid":${
                      models.model.id
                    },"apptoken":${apptoken},"parameter": ${parameterColumns}'} \\
                    -O predict_result.txt \\
                    - ${
                      process.env.REACT_APP_BACKEND_URL
                        ? process.env.REACT_APP_BACKEND_URL
                        : "https://dslabaa.clickai.ai/"
                    }predict/${userId}/`);
          break;
        case "java":
          setApiContent(`
                    OkHttpClient client = new OkHttpClient();

                    MediaType mediaType = MediaType.parse("application/json");
                    RequestBody body = RequestBody.create(mediaType, "{\"modelid\":${
                      models.model.id
                    },\"apptoken\":${apptoken},\"parameter\":${parameterColumns}}");
                    Request request = new Request.Builder()
                    .url("${
                      process.env.REACT_APP_BACKEND_URL
                        ? process.env.REACT_APP_BACKEND_URL
                        : "https://dslabaa.clickai.ai/"
                    }predict/${userId}/")
                    .post(body)
                    .addHeader("content-type", "application/json")
                    .build();

                    Response response = client.newCall(request).execute();`);
          break;
        default:
          return null;
      }
    } else {
      switch (
        chosenLanguage // 코드 일단 하드코딩으로 채워넣었습니다! // 이미지인지 구분은 projects.project.trainingMethod로 할 수 있습니다!
      ) {
        case "javascript":
          setApiContent(
            `
                    var data = JSON.stringify({"modelid": ${
                      models.model.id
                    },"apptoken": ${apptoken},"file": "${t(
              "Please upload the file data."
            )}""filename": "${t("Please write down the file name here.")}"});

                    var xhr = new XMLHttpRequest();
                    xhr.withCredentials = true;

                    xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {
                        console.log(this.responseText);
                    }
                    });

                    xhr.open("POST", "${
                      process.env.REACT_APP_BACKEND_URL
                        ? process.env.REACT_APP_BACKEND_URL
                        : "https://dslabaa.clickai.ai/"
                    }${userId}/predictimage/");

                    xhr.send(data);`
          );
          break;
        case "python":
          setApiContent(`
                        import requests

                        url = f"${
                          process.env.REACT_APP_BACKEND_URL
                            ? process.env.REACT_APP_BACKEND_URL
                            : "https://dslabaa.clickai.ai/"
                        }${userId}/predictimage/"
                        files = [('file', open("${t(
                          "파일경로를 여기에 적어주세요."
                        )}", 'rb'))]  
                        payload = {"modelid":${
                          models.model.id
                        },"apptoken":${apptoken}, "filename": "${t(
            "Please write down the file name here."
          )}"}
                        headers = {}

                        response = requests.request("POST", url, data=payload, headers=headers, files=files)

                        print(response.text)`);
          break;
        case "wget":
          setApiContent(`
                        wget \\
                        --method POST \\
                        --body-data '{"modelid":${
                          models.model.id
                        },"apptoken":${apptoken},"parameter": ${parameterColumns}',"file": "${t(
            "Please upload the file data."
          )}","filename": "${t("Please write down the file name here.")}" \\
                        -O predict_result.txt \\
                        - ${
                          process.env.REACT_APP_BACKEND_URL
                            ? process.env.REACT_APP_BACKEND_URL
                            : "https://dslabaa.clickai.ai/"
                        }${userId}/predictimage/`);
          break;
        case "java":
          setApiContent(`
                        OkHttpClient client = new OkHttpClient();

                        MediaType mediaType = MediaType.parse("application/json");
                        RequestBody body = RequestBody.create(mediaType, "{\"modelid\":${
                          models.model.id
                        },\"apptoken\":${apptoken},\"file\": \"${t(
            "Please upload the file data."
          )}\",\"filename\": \"${t(
            "Please write down the file name here."
          )}\"}");
                        Request request = new Request.Builder()
                        .url("${
                          process.env.REACT_APP_BACKEND_URL
                            ? process.env.REACT_APP_BACKEND_URL
                            : "https://dslabaa.clickai.ai/"
                        }${userId}/predictimage/")
                        .post(body)
                        .build();

                        Response response = client.newCall(request).execute();`);
          break;
        default:
          return null;
      }
    }
    if (apiRef.current) {
      apiRef.current.focus();
    }
  };

  const shareModalActionOpen = () => {
    setIsShareModalOpen(true);
  };
  const shareModalActionClose = () => {
    setIsShareModalOpen(false);
  };

  const closeColorPickerModal = () => {
    setColorPickerModal(false);
    onSaveServiceAppParameter();
  };

  const onChangeApiContent = (newValue) => {
    setApiContent(newValue);
  };

  // const onSetJsonEditMode = () => {
  //   if (jsonEditMode) {
  //     onSaveServiceAppParameter();
  //     setJsonEditMode(false);
  //   } else {
  //     setJsonEditMode(true);
  //   }
  // };

  // const onChangeYClassString = (e) => {
  //   setResultJson(e.target.value);
  // };

  const onChangeBackgroundColor = (obj) => {
    // setBackgroundColor(obj.color);
    if (obj.hex) {
      setBackgroundColor(obj.hex);
    }
  };

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

  const renderStatistics = () => {
    if (modelDetail.cmStatistics !== null) {
      const statistics = JSON.parse(modelDetail.cmStatistics);
      const class_stat = statistics["class_stat"];
      const overall_stat = statistics["overall_stat"];

      const classArr = [];
      const classColumn = [""];
      let classNum = 0;
      for (let row in class_stat) {
        const rowArr = [];
        rowArr.push(row);
        const each = class_stat[row];
        for (let e in each) {
          rowArr.push(each[e]);
          if (classNum === 0) {
            classColumn.push(e);
          }
        }
        classArr.push(rowArr);
        classNum++;
      }
      const overallArr = [];
      for (let row in overall_stat) {
        const rowArr = [];
        rowArr.push(row);
        let each = overall_stat[row];
        if (typeof each === "object") {
          each = JSON.stringify(each);
        }
        rowArr.push(each);
        overallArr.push(rowArr);
      }
      return (
        <div className={classes.statDiv}>
          {overallArr.length > 0 && (
            <div style={{ paddingTop: "20px" }}>
              <p>Overall_Statistics</p>
              <table className={classes.statTable}>
                {overallArr.map((rowArr, idx) => {
                  return (
                    <tr
                      className={classes.statTr}
                      style={{
                        background:
                          idx % 2 === 0
                            ? currentTheme.tableRow1
                            : currentTheme.tableRow2,
                      }}
                    >
                      {rowArr.map((each, idx) => {
                        return <td className={classes.statTd}>{each}</td>;
                      })}
                    </tr>
                  );
                })}
              </table>
            </div>
          )}
          {classArr.length > 0 && (
            <div style={{ padding: "20px" }}>
              <p>Class_Statistics</p>
              <table className={classes.statTable}>
                <tr>
                  {classColumn.map((column, idx) => {
                    return <td className={classes.statTd}>{column}</td>;
                  })}
                </tr>
                {classArr.map((rowArr, idx) => {
                  return (
                    <tr
                      className={classes.statTr}
                      style={{
                        background:
                          idx % 2 === 0
                            ? currentTheme.tableRow1
                            : currentTheme.tableRow2,
                      }}
                    >
                      {rowArr.map((each, idx) => {
                        return <td className={classes.statTd}>{each}</td>;
                      })}
                    </tr>
                  );
                })}
              </table>
            </div>
          )}
        </div>
      );
    }
  };

  const renderItem = () => {
    let isLoss = false;
    let isPrecisionRecall = false;
    let isKappaCoeff = false;
    let isAurocFBeta = false;
    let isFeatureImportance = false;
    let isGChart = false;
    let isDChart = false;
    let isIdtChart = false;
    let isCycleChart = false;
    let isDetail = false;

    if (
      projects.project.trainingMethod === "normal_regression" ||
      projects.project.trainingMethod === "time_series_regression"
    ) {
      if (modelDetail.mase || modelDetail.errorRate || modelDetail.rmse)
        isDetail = true;
    } else if (projects.project.trainingMethod === "cycle_gan") {
      if (modelDetail.dice || modelDetail.errorRate || modelDetail.totalLoss)
        isDetail = true;
    } else {
      if (modelDetail.dice || modelDetail.errorRate || modelDetail.accuracy)
        isDetail = true;
    }

    for (let idx = 0; idx < modelDetail.modelcharts.length; idx++) {
      const chart = modelDetail.modelcharts[idx];
      if (chart.training_loss && chart.valid_loss) isLoss = true;
      if (chart.precision && chart.recall) isPrecisionRecall = true;
      if (chart.kappa_score && chart.matthews_correff) isKappaCoeff = true;
      if (chart.auroc && chart.f_beta) isAurocFBeta = true;
      if (chart.lossGA && chart.lossGB) isGChart = true;
      if (chart.lossDA && chart.lossDB) isDChart = true;
      if (chart.lossIdtA && chart.lossIdtB) isIdtChart = true;
      if (chart.lossCycleA && chart.lossCycleB) isCycleChart = true;
    }

    let tmpFeature = modelDetail.featureImportance;
    if (tmpFeature) {
      tmpFeature = JSON.stringify(tmpFeature.replace(/NaN/g, '"NaN"'));
      let featureData = JSON.parse(tmpFeature);
      if (featureData.imp) {
        if (featureData.cols) {
          if (featureData.cols.length !== 0 && featureData.imp.length !== 0)
            isFeatureImportance = true;
        }
      }
    }

    return (
      <div className={classes.detailContainer}>
        <div style={{ margin: "32px 8px 16px" }}>
          <span style={{ fontSize: "24px", fontWeight: 500 }}>
            {modelDetail.name.toUpperCase()}
          </span>

          {!IS_ENTERPRISE &&
            projects.project.trainingMethod.indexOf("load") === -1 &&
            projects.project.trainingMethod.indexOf("recommender") === -1 && (
              <Button
                id="shareAIApp"
                shape="greenOutlined"
                sx={{ ml: 2 }}
                onClick={() => shareModalActionOpen()}
              >
                {t("Sharing a service app")}
              </Button>
            )}
        </div>

        {hyperParams && (
          <Grid container sx={{ my: 1.5 }}>
            <Grid container>
              <span
                style={{
                  margin: "0 8px",
                  fontSize: 17,
                  fontWeight: 500,
                  color: "var(--secondary1)",
                }}
              >
                Hyperparameter settings
              </span>
            </Grid>
            <Grid
              container
              sx={{
                m: 1,
                p: "24px 32px",
                border: "2px solid var(--surface2)",
                borderRadius: "8px",
                backgroundColor: "var(--surface1)",
              }}
            >
              <Grid container>
                {Object.keys(hyperParams).map((key) => {
                  if (key === "optimizer") return;

                  return (
                    <Grid key={key} item sx={{ mr: 2.5 }}>
                      <Grid container>
                        <span
                          style={{ display: "inline-block", marginRight: 8 }}
                        >
                          {key} :
                        </span>
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: 500,
                            color: "var(--secondary1)",
                            verticalAlign: "middle",
                          }}
                        >
                          {String(hyperParams[key])}
                        </span>
                      </Grid>
                    </Grid>
                  );
                })}
              </Grid>

              {hyperParams.optimizer && (
                <Grid container sx={{ mt: 1.5 }}>
                  <Grid
                    item
                    sx={{ mr: 4, fontWeight: 500, textDecoration: "underline" }}
                  >
                    *Optimizer
                  </Grid>

                  {Object.keys(hyperParams.optimizer).map((key) => {
                    return (
                      <Grid key={key} item sx={{ mr: 2.5 }}>
                        <Grid container>
                          <span
                            style={{ display: "inline-block", marginRight: 8 }}
                          >
                            {key} :
                          </span>
                          <span
                            style={{
                              fontSize: 18,
                              fontWeight: 500,
                              color: "var(--secondary1)",
                              verticalAlign: "middle",
                            }}
                          >
                            {String(hyperParams.optimizer[key])}
                          </span>
                        </Grid>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Grid>
          </Grid>
        )}

        <div className={classes.chartContainer} style={{ marginLeft: "5px" }}>
          <div style={{ display: "flex", flexShrink: "0" }}>
            {isDetail && (
              <div
                id="detailTab"
                onClick={() => {
                  setChosenChart("detail");
                }}
                className={
                  chosenChart === "detail"
                    ? classes.selectedListObject
                    : classes.listObject
                }
              >
                Detail
              </div>
            )}
            {projects.project.trainingMethod === "cycle_gan" && (
              <>
                {isDChart && (
                  <div
                    id="dchartTab"
                    onClick={() => {
                      setChosenChart("dChart");
                    }}
                    className={
                      chosenChart === "dChart"
                        ? classes.selectedListObject
                        : classes.listObject
                    }
                  >
                    D-Chart
                  </div>
                )}
                {isGChart && (
                  <div
                    id="gchartTab"
                    onClick={() => {
                      setChosenChart("gChart");
                    }}
                    className={
                      chosenChart === "gChart"
                        ? classes.selectedListObject
                        : classes.listObject
                    }
                  >
                    G-Chart
                  </div>
                )}
                {isIdtChart && (
                  <div
                    id="idtChartTab"
                    onClick={() => {
                      setChosenChart("idtChart");
                    }}
                    className={
                      chosenChart === "idtChart"
                        ? classes.selectedListObject
                        : classes.listObject
                    }
                  >
                    IDT-Chart
                  </div>
                )}
                {isCycleChart && (
                  <div
                    id="cycleChartTab"
                    onClick={() => {
                      setChosenChart("cycleChart");
                    }}
                    className={
                      chosenChart === "cycleChart"
                        ? classes.selectedListObject
                        : classes.listObject
                    }
                  >
                    Cycle-Chart
                  </div>
                )}
              </>
            )}
            {projects.project.trainingMethod !== "cycle_gan" && (
              <>
                {isFeatureImportance &&
                  projects.project.trainingMethod !== "normal_regression" && (
                    <div
                      onClick={() => {
                        setChosenChart("featureImportance");
                      }}
                      className={
                        chosenChart === "featureImportance"
                          ? classes.selectedListObject
                          : classes.listObject
                      }
                    >
                      Feature Importance
                    </div>
                  )}
                {modelDetail.cmStatistics &&
                  modelDetail.cmStatistics !== "null" && (
                    <div
                      id="statisticsTab"
                      onClick={() => {
                        setChosenChart("statistics");
                      }}
                      className={
                        chosenChart === "statistics"
                          ? classes.selectedListObject
                          : classes.listObject
                      }
                    >
                      {t("Precise analysis")}
                    </div>
                  )}
                {confusionMatrix &&
                  confusionMatrix.length !== 0 &&
                  (modelDetail.yClass && modelDetail.yClass.length < 10) && (
                    <div
                      id="confusionMatrixTab"
                      onClick={() => {
                        setChosenChart("matrix");
                      }}
                      className={
                        chosenChart === "matrix"
                          ? classes.selectedListObject
                          : classes.listObject
                      }
                    >
                      Confusion Matrix
                    </div>
                  )}
                {isLoss && (
                  <div
                    id="lossTab"
                    onClick={() => {
                      setChosenChart("loss");
                    }}
                    className={
                      chosenChart === "loss"
                        ? classes.selectedListObject
                        : classes.listObject
                    }
                  >
                    Loss
                  </div>
                )}
                {isPrecisionRecall && (
                  <div
                    id="precisionRecallTab"
                    onClick={() => {
                      setChosenChart("precision-recall");
                    }}
                    className={
                      chosenChart === "precision-recall"
                        ? classes.selectedListObject
                        : classes.listObject
                    }
                  >
                    Precision-Recall
                  </div>
                )}
                {isKappaCoeff && (
                  <div
                    id="kappaCoeffTab"
                    onClick={() => {
                      setChosenChart("kappa-coeff");
                    }}
                    className={
                      chosenChart === "kappa-coeff"
                        ? classes.selectedListObject
                        : classes.listObject
                    }
                  >
                    Kappa-Coeff
                  </div>
                )}
                {isAurocFBeta && (
                  <div
                    id="aurocFbetaTab"
                    onClick={() => {
                      setChosenChart("auroc-fbeta");
                    }}
                    className={
                      chosenChart === "auroc-fbeta"
                        ? classes.selectedListObject
                        : classes.listObject
                    }
                  >
                    Auroc-FBeta
                  </div>
                )}
              </>
            )}
            {modelDetail.records && modelDetail.records !== "null" && (
              <div
                id="recordsTab"
                onClick={() => {
                  setChosenChart("records");
                }}
                className={
                  chosenChart === "records"
                    ? classes.selectedListObject
                    : classes.listObject
                }
              >
                Records
              </div>
            )}
            {featureImportance && featureImportance.length > 0 && (
              <div
                id="featureImportanceTab"
                onClick={() => {
                  setChosenChart("featureImportance");
                }}
                className={
                  chosenChart === "featureImportance"
                    ? classes.selectedListObject
                    : classes.listObject
                }
              >
                Feature Importance
              </div>
            )}
            <div
              id="apiTab"
              onClick={() => {
                setChosenChart("export");
              }}
              className={
                chosenChart === "export"
                  ? classes.selectedListObject
                  : classes.listObject
              }
            >
              API
            </div>
          </div>
          <div className={classes.chartDiv}>
            {chosenChart === "matrix" && (
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <table
                  id="matrixTable"
                  style={{
                    width: "70%",
                    marginLeft: "20px",
                    marginRight: "20px",
                    borderCollapse: "collapse",
                  }}
                >
                  <tr>
                    <th style={{ paddingBottom: "10px" }}>
                      {t("Actual values")} ↓ | {t("예측값")} →
                    </th>
                    {modelDetail.yClass.map((yclass, index) => {
                      return (
                        <th style={{ paddingBottom: "10px" }}>
                          {modelDetail.yClass[index]}
                        </th>
                      );
                    })}
                  </tr>
                  {confusionMatrix.map((rows, index) => {
                    return (
                      <tr style={{ height: "100px" }}>
                        {
                          <th
                            style={{
                              paddingRight: "10px",
                              width: Math.round(100 / (rows.length + 1)) + "%",
                            }}
                          >
                            {modelDetail.yClass[index]}
                          </th>
                        }
                        {rows.map((num) => {
                          return (
                            <td
                              style={{
                                border: "1px solid" + currentThemeColor.textSub,
                                width:
                                  Math.round(100 / (rows.length + 1)) + "%",
                                backgroundColor:
                                  "rgba(27, 198, 180," +
                                  Math.round((num / confusionMatrixSum) * 100) /
                                    100 +
                                  ")",
                              }}
                            >
                              {num}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </table>
              </div>
            )}
            {chosenChart === "export" && (
              <>
                <GridContainer style={{ height: "40px" }}></GridContainer>
                <GridContainer
                  style={{ padding: "0 15px", alignItems: "center" }}
                >
                  <GridItem xs={10}>
                    <div
                      className={classes.titleContainer}
                      style={{ fontSize: 20 }}
                    >
                      <b style={{ width: "10%" }}>POST</b>
                      <div className={classes.inputContainer}>{apiUrl}</div>
                    </div>
                  </GridItem>
                </GridContainer>
                <GridContainer style={{ height: "10px" }}></GridContainer>
                <GridContainer style={{ alignItems: "center" }}>
                  <GridItem
                    xs={12}
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className={classes.alignCenterDiv}>
                      <div
                        className={classes.languageTab}
                        id="javaScriptTab"
                        onClick={() => {
                          setChosenLanguage("javascript");
                        }}
                        style={
                          chosenLanguage === "javascript"
                            ? {
                                color: "var(--secondary1)",
                                fontWeight: "bold",
                                textDecoration: "underline",
                              }
                            : null
                        }
                      >
                        JavaScript
                      </div>
                      <div
                        className={classes.languageTab}
                        id="pythonTab"
                        onClick={() => {
                          setChosenLanguage("python");
                        }}
                        style={
                          chosenLanguage === "python"
                            ? {
                                color: "var(--secondary1)",
                                fontWeight: "bold",
                                textDecoration: "underline",
                              }
                            : null
                        }
                      >
                        Python
                      </div>
                      <div
                        className={classes.languageTab}
                        id="wgetTab"
                        onClick={() => {
                          setChosenLanguage("wget");
                        }}
                        style={
                          chosenLanguage === "wget"
                            ? {
                                color: "var(--secondary1)",
                                fontWeight: "bold",
                                textDecoration: "underline",
                              }
                            : null
                        }
                      >
                        wget
                      </div>
                      <div
                        className={classes.languageTab}
                        id="javaTab"
                        onClick={() => {
                          setChosenLanguage("java");
                        }}
                        style={
                          chosenLanguage === "java"
                            ? {
                                color: "var(--secondary1)",
                                fontWeight: "bold",
                                textDecoration: "underline",
                              }
                            : null
                        }
                      >
                        Java
                      </div>
                    </div>
                  </GridItem>
                </GridContainer>
                <hr className={classes.line} />
                <GridContainer>
                  <GridItem xs={12}>
                    <div className={classes.content}>
                      <AceEditor
                        width="100%"
                        mode={
                          chosenLanguage === "wget"
                            ? "powershell"
                            : chosenLanguage
                        }
                        theme="monokai"
                        onChange={onChangeApiContent}
                        value={apiContent}
                        editorProps={{ $blockScrolling: true }}
                        showPrintMargin={false}
                        setOptions={{
                          enableBasicAutocompletion: true,
                          enableLiveAutocompletion: true,
                          showLineNumbers: true,
                        }}
                        readOnly
                      />
                    </div>
                  </GridItem>
                </GridContainer>
              </>
            )}
            {chosenChart === "featureImportance" && (
              <>
                <GridContainer style={{ height: "40px" }}></GridContainer>
                <>
                  <GridContainer style={{ marginBottom: "20px" }}>
                    <GridItem
                      xs={12}
                      style={{
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        color: currentThemeColor.textWhite87,
                      }}
                    >
                      <CheckIcon style={{ marginRight: "8px" }} />
                      <span style={{ fontSize: "18px" }}>
                        {t(
                          "The top 5 highly relevant columns found by explainable AI"
                        )}
                      </span>
                    </GridItem>
                    {featureImportance.map((data, idx) => {
                      if (idx < 5) {
                        const rgba = 1 - 0.2 * idx;
                        return (
                          <GridItem xs={6}>
                            <Button className={classes.mainCard}>
                              <GridItem xs={6}>
                                <span className={classes.wordBreakDiv}>
                                  {idx + 1}. {data.name}
                                </span>
                              </GridItem>
                              <GridItem xs={6}>
                                <div
                                  style={{ justifyContent: "center" }}
                                  className={classes.defaultF0F0OutlineButton}
                                >
                                  {data.value}%
                                </div>
                              </GridItem>
                            </Button>
                          </GridItem>
                        );
                      }
                    })}
                  </GridContainer>
                  <hr
                    className={classes.line}
                    style={{ marginBottom: "20px" }}
                  />
                </>
              </>
            )}
            {chosenChart === "statistics" && renderStatistics()}
            {chosenChart !== null && (
              <Chart chosenChart={chosenChart} modelDetail={modelDetail} />
            )}
          </div>
        </div>
      </div>
    );
  };

  const onSaveServiceAppParameter = () => {
    dispatch(
      putProjectServiceAppRequestActionWithoutLoading({
        projectInfo: { background: backgroundColor, resultJson: resultJson },
        projectId: projects.project.id,
      })
    );
  };

  const onCopyServiceAppLink = () => {
    dispatch(openSuccessSnackbarRequestAction(t("Link copied")));
  };

  return isLoading || models.isLoading ? (
    <div
      style={{
        width: "100%",
        height: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </div>
  ) : (
    <>
      {renderItem()}
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isShareModalOpen}
        onClose={shareModalActionClose}
        className={classes.modalContainer}
      >
        <div className={classes.shareModalContent} id="projectModal">
          <div className={classes.gridRoot} style={{ margin: "0 20px" }}>
            <div className={classes.titleContainer} style={{ width: "100%" }}>
              <b>{t("Sharing a service app")}</b>
              <CloseIcon
                className={classes.closeImg}
                id="planModalCloseBtn"
                onClick={shareModalActionClose}
              />
            </div>
            <GridContainer style={{ margin: "0 20px", width: "100%" }}>
              <GridItem xs={12}>
                <div style={{ display: "flex", paddingBottom: "20px" }}>
                  <span
                    style={{
                      color: "var(--secondary1)",
                      fontSize: "16px",
                      fontWeight: "700",
                    }}
                  >
                    {t("배경")}
                  </span>
                  <div
                    style={{
                      width: "60px",
                      height: "24px",
                      margin: "2px 0 0 20px",
                      borderRadius: "4px",
                      background: backgroundColor,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setColorPickerModal(true);
                    }}
                  ></div>
                </div>
              </GridItem>
              {/* <GridItem xs={12} style={{ marginBottom: "20px" }}>
                {((modelDetail.yClass && modelDetail.yClass.length > 0) ||
                  resultJson) && (
                  <>
                    <div style={{ display: "flex", paddingBottom: "10px" }}>
                      <span
                        style={{
                          color: "var(--secondary1)",
                          fontSize: "16px",
                          fontWeight: "700",
                        }}
                      >
                        {t("JSON 결과")}
                      </span>
                      <div
                        style={{
                          minWidth: "45px",
                          height: "25px",
                          margin: "1px 0 0 10px",
                          padding: "0 5px 3px 5px",
                          border: "1px solid #D0D0D0",
                          borderRadius: "6px",
                          color: "#D0D0D0",
                          fontSize: "13px",
                          fontWeight: "500",
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                        onClick={onSetJsonEditMode}
                      >
                        {jsonEditMode ? t("Completed") : t("수정")}
                      </div>
                    </div>
                    <div
                      style={
                        jsonEditMode
                          ? {
                              height: "200px",
                              overflow: "scroll",
                            }
                          : {}
                      }
                    >
                      {jsonEditMode ? (
                        <InputBase
                          value={resultJson}
                          onChange={onChangeYClassString}
                          autoFocus={true}
                          inputRef={apiRef}
                          multiline={true}
                          className={classes.serviceAppInput}
                          style={{
                            background: "#4C4C4C",
                            border: "1px solid #D0D0D0",
                            borderRadius: "4px",
                            color: "white",
                            fontFamily: "Noto Sans KR",
                            fontSize: "14px",
                            lineHeight: "20px",
                          }}
                        />
                      ) : (
                        <JSONPretty
                          id="json-pretty"
                          data={resultJson}
                          className={classes.predictResultJson}
                          onChange={onChangeYClassString}
                          mainStyle="color:#ffffff"
                          keyStyle="color:#1BC6B4"
                          valueStyle="color:#0A84FF"
                          style={{
                            height: "200px",
                            overflow: "scroll",
                            padding: "10px 15px",
                            background: "#4C4C4C",
                            border: "1px solid #D0D0D0",
                            borderRadius: "4px",
                            fontSize: "16px",
                            lineHeight: "20px",
                          }}
                        />
                      )}
                    </div>
                  </>
                )}
              </GridItem> */}
              <GridItem xs={12} style={{ width: "100%" }}>
                <span
                  style={{
                    marginTop: "10px",
                    color: "var(--secondary1)",
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  {t("Sharing")} URL
                </span>
                <br />
                <div
                  style={{
                    width: "100%",
                    height: "40px",
                    marginTop: "10px",
                    padding: "5px 0 0 15px",
                    border: "1px solid #D0D0D0",
                    borderRadius: "4px",
                    background: "#4C4C4C",
                    overflow: "hidden",
                  }}
                >
                  <a
                    style={{
                      color: "white",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      overflow: "hidden",
                    }}
                    target={"_blank"}
                    href={
                      user.language === "ko"
                        ? `https://ko.ds2.ai//instant_use.html/?modeltoken=${models.model.token}&modelid=${models.model.id}`
                        : `https://ds2.ai/instant_use.html/?modeltoken=${models.model.token}&modelid=${models.model.id}`
                    }
                  >
                    <u
                      style={{
                        textDecoration: "none",
                        wordBreak: "keep-all",
                        overflow: "hidden",
                      }}
                    >
                      {user.language === "ko"
                        ? `https://ko.ds2.ai//instant_use.html/?modeltoken=${models.model.token}&modelid=${models.model.id}`
                        : `https://ds2.ai/instant_use.html/?modeltoken=${models.model.token}&modelid=${models.model.id}`}
                    </u>
                  </a>
                </div>
              </GridItem>
              <GridItem xs={12}>
                <div
                  style={{
                    margin: "10px 0 0 15px",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "400",
                  }}
                >
                  {t(
                    "Please note that you will consume the same amount of prediction counting when you share link."
                  )}
                </div>
              </GridItem>
              <GridItem xs={9}></GridItem>
              <GridItem xs={3} style={{ textAlign: "right" }}>
                <CopyToClipboard
                  text={
                    user.language === "ko"
                      ? `https://ko.ds2.ai//instant_use.html/?modeltoken=${models.model.token}&modelid=${models.model.id}`
                      : `https://ds2.ai/instant_use.html/?modeltoken=${models.model.token}&modelid=${models.model.id}`
                  }
                >
                  <Button
                    id="copy_serviceappurl_btn"
                    shape="greenOutlined"
                    sx={{ minWidth: "160px" }}
                    onClick={onCopyServiceAppLink}
                  >
                    {t("Copy link")}
                  </Button>
                </CopyToClipboard>
              </GridItem>
            </GridContainer>
          </div>
        </div>
      </Modal>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={colorPickerModal}
        onClose={closeColorPickerModal}
        className={classes.modalContainer}
      >
        <div style={{ height: "200px" }}>
          <ChromePicker
            color={backgroundColor}
            onChangeComplete={onChangeBackgroundColor}
            disableAlpha={true}
          />
          <CloseIcon
            className={classes.closeImg}
            id="planModalCloseBtn"
            onClick={closeColorPickerModal}
          />
        </div>
      </Modal>
    </>
  );
});

export default Detail;
