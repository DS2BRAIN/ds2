import React, { PureComponent, useState, useEffect } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Grid from "@mui/material/Grid";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";
import DoubleScrollbar from "react-double-scrollbar";
import currentTheme from "assets/jss/custom.js";
import { currentThemeColor } from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

class CustomizedAxisTick extends PureComponent {
  render() {
    const { x, y, stroke, payload } = this.props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" stroke="white" height={100}>
          {payload.value}
        </text>
      </g>
    );
  }
}

const Chart = React.memo(({ chosenChart, modelDetail }) => {
  const classes = currentTheme();
  const { projects, models } = useSelector(
    (state) => ({ projects: state.projects, models: state.models }),
    []
  );
  const { t } = useTranslation();

  const COLOR_ORANGE = "#ff6c00";
  const COLOR_BLUE = currentThemeColor.primary1;
  const COLOR_GRAY = "#999999";
  const BACKGROUND_COLOR = currentThemeColor.background2;

  const [detailData, setDetailData] = useState(null);
  const [trainingValidLoss, setTrainingValidLoss] = useState(null);
  const [precisionRecall, setPrecisionRecall] = useState(null);
  const [aurocFBeta, setAurocFBeta] = useState(null);
  const [kappaMatthew, setKappaMatthew] = useState(null);
  const [featureImportance, setFeatureImportance] = useState(null);
  const [featureMaxMin, setFeatureMaxMin] = useState(null);
  const [records, setRecords] = useState(null);
  const [recordsHeader, setRecordsHeader] = useState(null);
  const [lossG, setLossG] = useState(null);
  const [lossD, setLossD] = useState(null);
  const [lossIdt, setLossIdt] = useState(null);
  const [lossCycle, setLossCycle] = useState(null);
  const [isMinusInDetailData, setIsMinusInDetailData] = useState(false);

  useEffect(() => {
    try {
      const yclass = modelDetail.yClass;
      let _records = modelDetail.records;
      _records = _records
        .replace(/__pred__/g, "predict_value")
        .replace(/"false"/gi, '"거짓"')
        .replace(/"true"/gi, '"참"');

      _records = JSON.parse(_records);
      for (let idx = 0; idx < _records.length; idx++) {
        const record = _records[idx];
        const classIdx = parseInt(record["Class"]);
        record["Class"] = yclass[classIdx];
      }
      setRecords(_records);
      let _recordsHeader = [];
      for (let header in _records[0]) {
        _recordsHeader.push(header);
      }
      setRecordsHeader(_recordsHeader);
    } catch {
      setRecords(null);
      setRecordsHeader(null);
    }

    try {
      const featureData = [];
      const featureMaxMin = { max: 0, min: 0 };
      let feature = modelDetail.featureImportance.replace(/NaN/g, '"NaN"');
      feature = JSON.parse(feature);
      let sum = 0;
      const cols = feature.cols;
      const imp = feature.imp;
      const length = imp.length;
      for (let idx = 0; idx < length; idx++) {
        if (typeof imp[idx] === "number") {
          sum += Math.abs(imp[idx]);
        }
      }
      for (let idx = 0; idx < length; idx++) {
        if (typeof imp[idx] === "number") {
          const percentage = ((imp[idx] * 100) / sum).toFixed(2);
          featureData.push({ name: cols[idx], value: parseFloat(percentage) });
          if (parseInt(percentage) > featureMaxMin.max)
            featureMaxMin.max = parseInt(percentage);
          if (parseInt(percentage) < featureMaxMin.min)
            featureMaxMin.min = parseInt(percentage);
        }
      }
      setFeatureImportance(featureData);
      setFeatureMaxMin(featureMaxMin);
    } catch {
      setFeatureImportance(null);
    }

    try {
      const tempArr = [];
      if (modelDetail.accuracy)
        tempArr.push({ name: "Accuracy", value: modelDetail.accuracy });
      if (modelDetail.errorRate)
        tempArr.push({ name: "ErrorRate", value: modelDetail.errorRate });
      if (modelDetail.dice)
        tempArr.push({ name: "Dice", value: modelDetail.dice });
      if (tempArr.length > 0) setDetailData(tempArr);
    } catch {
      setDetailData(null);
    }

    let _training_valid = [];
    let _precision_recall = [];
    let _auroc_f_beta = [];
    let _kappa_matthews = [];
    let _lossG = [];
    let _lossD = [];
    let _lossIdt = [];
    let _lossCycle = [];

    try {
      const chartDatas = modelDetail.modelcharts;
      for (let idx = 0; idx < chartDatas.length; idx++) {
        if (chartDatas[idx].training_loss && chartDatas[idx].valid_loss) {
          _training_valid.push({
            x: chartDatas[idx].epoch,
            y1: chartDatas[idx].training_loss,
            y2: chartDatas[idx].valid_loss,
          });
        }
        if (chartDatas[idx].precision && chartDatas[idx].recall) {
          _precision_recall.push({
            x: chartDatas[idx].epoch,
            y1: chartDatas[idx].precision,
            y2: chartDatas[idx].recall,
          });
        }
        if (chartDatas[idx].auroc && chartDatas[idx].f_beta) {
          _auroc_f_beta.push({
            x: chartDatas[idx].epoch,
            y1: chartDatas[idx].auroc,
            y2: chartDatas[idx].f_beta,
          });
        }
        if (chartDatas[idx].kappa_score && chartDatas[idx].matthews_correff) {
          _kappa_matthews.push({
            x: chartDatas[idx].epoch,
            y1: chartDatas[idx].kappa_score,
            y2: chartDatas[idx].matthews_correff,
          });
        }
        if (chartDatas[idx].lossGA && chartDatas[idx].lossGB) {
          _lossG.push({
            x: chartDatas[idx].epoch,
            y1: chartDatas[idx].lossGA,
            y2: chartDatas[idx].lossGB,
          });
        }
        if (chartDatas[idx].lossDA && chartDatas[idx].lossDB) {
          _lossD.push({
            x: chartDatas[idx].epoch,
            y1: chartDatas[idx].lossDA,
            y2: chartDatas[idx].lossDB,
          });
        }
        if (chartDatas[idx].lossIdtA && chartDatas[idx].lossIdtB) {
          _lossIdt.push({
            x: chartDatas[idx].epoch,
            y1: chartDatas[idx].lossIdtA,
            y2: chartDatas[idx].lossIdtB,
          });
        }
        if (chartDatas[idx].lossCycleA && chartDatas[idx].lossCycleB) {
          _lossCycle.push({
            x: chartDatas[idx].epoch,
            y1: chartDatas[idx].lossCycleA,
            y2: chartDatas[idx].lossCycleB,
          });
        }
      }
      setTrainingValidLoss(_training_valid);
      setPrecisionRecall(_precision_recall);
      setAurocFBeta(_auroc_f_beta);
      setKappaMatthew(_kappa_matthews);
      setLossG(_lossG);
      setLossD(_lossD);
      setLossIdt(_lossIdt);
      setLossCycle(_lossCycle);
    } catch {
      setTrainingValidLoss(null);
      setPrecisionRecall(null);
      setAurocFBeta(null);
      setKappaMatthew(null);
      setLossG(null);
      setLossD(null);
      setLossIdt(null);
      setLossCycle(null);
    }
  }, [modelDetail]);

  useEffect(() => {
    if (projects.project.trainingMethod) {
      if (projects.project.trainingMethod === "time_series_regression") {
        try {
          const tempArr = [];
          if (modelDetail.rmse)
            tempArr.push({ name: "RMSE", value: modelDetail.rmse });
          if (modelDetail.errorRate)
            tempArr.push({ name: "Error Rate", value: modelDetail.errorRate });
          if (modelDetail.mase)
            tempArr.push({ name: "MAE", value: modelDetail.mase });
          if (tempArr.length > 0) setDetailData(tempArr);
        } catch {
          setDetailData(null);
        }
      }
    }
  }, [projects.project.trainingMethod]);

  useEffect(() => {
    if (projects.project.trainingMethod) {
      if (projects.project.trainingMethod === "normal_regression") {
        try {
          const tempArr = [];
          if (modelDetail.rmse)
            tempArr.push({ name: "RMSE", value: modelDetail.rmse });
          if (modelDetail.r2score !== null)
            tempArr.push({ name: "R2", value: modelDetail.r2score });
          if (modelDetail.mase)
            tempArr.push({ name: "MAE", value: modelDetail.mase });
          if (tempArr.length > 0) setDetailData(tempArr);
        } catch {
          setDetailData(null);
        }
      }
    }
  }, [projects.project.trainingMethod]);

  useEffect(() => {
    if (
      projects.project.trainingMethod &&
      projects.project.trainingMethod === "cycle_gan"
    ) {
      try {
        const tempArr = [];
        if (modelDetail.totalLoss)
          tempArr.push({ name: "Total_Loss", value: modelDetail.totalLoss });
        if (modelDetail.errorRate)
          tempArr.push({ name: "ErrorRate", value: modelDetail.errorRate });
        if (modelDetail.dice)
          tempArr.push({ name: "Dice", value: modelDetail.dice });
        if (tempArr.length > 0) setDetailData(tempArr);
      } catch {
        setDetailData(null);
      }
    }
  }, [projects.project.trainingMethod]);

  useEffect(() => {
    if (
      projects.project.trainingMethod &&
      projects.project.trainingMethod === "object_detection" &&
      modelDetail.ap_info
    ) {
      try {
        const tempArr = [];
        if (modelDetail.ap_info.AP)
          tempArr.push({ name: "AP", value: modelDetail.ap_info.AP });
        if (modelDetail.ap_info.AP50)
          tempArr.push({ name: "AP50", value: modelDetail.ap_info.AP50 });
        if (modelDetail.ap_info.AP75)
          tempArr.push({ name: "AP75", value: modelDetail.ap_info.AP75 });
        if (modelDetail.ap_info.APl)
          tempArr.push({ name: "APl", value: modelDetail.ap_info.APl });
        if (modelDetail.ap_info.APm)
          tempArr.push({ name: "APm", value: modelDetail.ap_info.APm });
        if (modelDetail.ap_info.APs)
          tempArr.push({ name: "APs", value: modelDetail.ap_info.APs });
        if (tempArr.length > 0) setDetailData(tempArr);
      } catch {
        setDetailData(null);
      }
    }
  }, [projects.project.trainingMethod]);

  useEffect(() => {
    if (detailData) {
      let isMinusExist = false;
      detailData.forEach((datum) => {
        if (datum.value < 0) isMinusExist = true;
      });
      setIsMinusInDetailData(isMinusExist);
    }
  }, [detailData]);

  const renderChart = (chosenChart) => {
    const colorpalatte = [
      currentThemeColor.primary1,
      currentThemeColor.secondary1,
      COLOR_ORANGE,
    ];
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length !== 0) {
        return (
          <div
            className="custom-tooltip"
            style={{ background: "white", color: COLOR_GRAY }}
          >
            <p className="label" style={{ padding: "10px" }}>
              {/* {`${label} : ${payload[0].value}`} */}
              {`${payload[0].value}`}
            </p>
          </div>
        );
      }
      return null;
    };

    const TwoLineTooltip = ({ active, payload, label }) => {
      let y1 = "";
      let y2 = "";

      if (chosenChart === "loss") {
        y1 = "Training_Loss";
        y2 = "Valid_Loss";
      } else if (chosenChart === "precision-recall") {
        y1 = "Precision";
        y2 = "Recall";
      } else if (chosenChart === "kappa-coeff") {
        y1 = "Kappa_Score";
        y2 = "Matthews_Correff";
      } else if (chosenChart === "auroc-fbeta") {
        y1 = "AUROC";
        y2 = "F_Beta";
      } else if (chosenChart === "dChart") {
        y1 = "LossDA";
        y2 = "LossDB";
      } else if (chosenChart === "gChart") {
        y1 = "LossGA";
        y2 = "LossGB";
      } else if (chosenChart === "idtChart") {
        y1 = "LossIdtA";
        y2 = "LossIdtB";
      } else if (chosenChart === "cycleChart") {
        y1 = "LossCycleA";
        y2 = "LossCycleB";
      }

      if (active && payload && payload.length !== 0) {
        return (
          <div
            className="custom-tooltip"
            style={{ background: BACKGROUND_COLOR, color: COLOR_BLUE }}
          >
            <p
              className="label"
              style={{ padding: "10px 10px 0 10px" }}
            >{`EPOCH : ${payload[0].payload.x}`}</p>
            <p
              className="label"
              style={{ padding: "0 10px" }}
            >{`${y1} : ${payload[0].value}`}</p>
            <p
              className="label"
              style={{ padding: "0 10px 10px 10px" }}
            >{`${y2} : ${payload[1].value}`}</p>
          </div>
        );
      }
      return null;
    };

    const chartWidth =
      window.innerWidth < 1100 ? 600 : window.innerWidth < 1500 ? 900 : 1300;
    switch (chosenChart) {
      case "detail":
        return (
          <GridContainer style={{ display: "flex" }}>
            <div style={{ width: "100%", height: "40px" }}></div>
            <GridItem xs={12} style={{ marginTop: "20px" }}>
              {isMinusInDetailData ? (
                <Grid style={{ display: "flex" }}>
                  {detailData.map((detailDatum) => (
                    <BarChart
                      width={1000 / detailData.length}
                      height={400}
                      data={[detailDatum]}
                    >
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: BACKGROUND_COLOR }}
                      />
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" interval={0} height={100} />
                      {detailDatum.value < 0 ? (
                        <YAxis
                          domain={[detailDatum.value.toFixed(0) * 1.5, 0]}
                        />
                      ) : (
                        <YAxis domain={[0, detailDatum.value.toFixed(0) * 2]} />
                      )}
                      <Bar
                        dataKey="value"
                        type="monotone"
                        barSize={50}
                        fill={currentThemeColor.primary2}
                      />
                    </BarChart>
                  ))}
                </Grid>
              ) : (
                <BarChart width={600} height={400} data={detailData}>
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: BACKGROUND_COLOR }}
                  />
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} height={100} />
                  <YAxis domain={[0, 1]} />
                  <Bar
                    dataKey="value"
                    type="monotone"
                    barSize={50}
                    fill={currentThemeColor.primary2}
                  />
                </BarChart>
              )}
              {projects.project.trainingMethod === "time_series_regression" ? (
                <div style={{ marginLeft: "40px" }}>
                  <div>
                    RMSE :{" "}
                    {t(
                      "This is an index used when predicting continuous values ​​(e.g., between 1 and 1000) as the root mean square error. The lower the RMSE value, the more accurate the prediction is."
                    )}{" "}
                    <a
                      href={
                        "https://en.wikipedia.org/wiki/Root-mean-square_deviation"
                      }
                      target={"_blank"}
                      style={{ fontSize: "1rem" }}
                    >
                      ({t("See details")})
                    </a>
                  </div>
                  <div>
                    Error Rate :{" "}
                    {t(
                      "Indicates the percentage of errors that occurred when sampling."
                    )}{" "}
                    <a
                      href={
                        "https://en.wikipedia.org/wiki/Generalization_error"
                      }
                      target={"_blank"}
                      style={{ fontSize: "1rem" }}
                    >
                      ({t("See details")})
                    </a>
                  </div>
                  <div>
                    MAE :{" "}
                    {t(
                      "It is the difference between the predicted value and the actual value divided by the average variation."
                    )}{" "}
                    <a
                      href={"https://en.wikipedia.org/wiki/Mean_absolute_error"}
                      target={"_blank"}
                      style={{ fontSize: "1rem" }}
                    >
                      ({t("See details")})
                    </a>
                  </div>
                </div>
              ) : projects.project.trainingMethod === "normal_regression" ? (
                <div style={{ marginLeft: "40px" }}>
                  <div>
                    R2 :{" "}
                    {t(
                      "It is an indicator of how well the model explains the data. It can have a value of 0 to 1, and the closer it is to 1, the higher the model is related to the data."
                    )}{" "}
                    <a
                      href={
                        "https://en.wikipedia.org/wiki/Coefficient_of_determination"
                      }
                      target={"_blank"}
                      style={{ fontSize: "1rem" }}
                    >
                      ({t("See details")})
                    </a>
                  </div>
                  <div>
                    MAE :{" "}
                    {t(
                      "It is the difference between the predicted value and the actual value divided by the average variation."
                    )}{" "}
                    <a
                      href={"https://en.wikipedia.org/wiki/Mean_absolute_error"}
                      target={"_blank"}
                      style={{ fontSize: "1rem" }}
                    >
                      ({t("See details")})
                    </a>
                  </div>
                </div>
              ) : projects.project.trainingMethod === "cycle_gan" ? (
                <div style={{ marginLeft: "40px" }}>
                  <div>
                    Total Loss :{" "}
                    {t(
                      "Loss in Image Generation (GAN) is an auto parameter, so it is not an evaluation index for image similarity."
                    )}
                  </div>
                  <div>
                    Error Rate :{" "}
                    {t(
                      "Indicates the percentage of errors that occurred when sampling."
                    )}{" "}
                    <a
                      href={
                        "https://en.wikipedia.org/wiki/Generalization_error"
                      }
                      target={"_blank"}
                      style={{ fontSize: "1rem" }}
                    >
                      ({t("See details")})
                    </a>
                  </div>
                  <div>
                    Dice :{" "}
                    {t(
                      "A sample coefficient used to measure the similarity between the actual and predicted values."
                    )}{" "}
                    <a
                      href={
                        "https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient"
                      }
                      target={"_blank"}
                      style={{ fontSize: "1rem" }}
                    >
                      ({t("See details")})
                    </a>
                  </div>
                </div>
              ) : projects.project.trainingMethod ===
                "object_detection" ? null : (
                <div style={{ marginLeft: "40px" }}>
                  <div>
                    Accuracy : {t("Indicates how accurate the model is.")}{" "}
                    <a
                      href={
                        "https://en.wikipedia.org/wiki/Accuracy_and_precision"
                      }
                      target={"_blank"}
                      style={{ fontSize: "1rem" }}
                    >
                      ({t("See details")})
                    </a>
                  </div>
                  <div>
                    Error Rate :{" "}
                    {t(
                      "Indicates the percentage of errors that occurred when sampling."
                    )}{" "}
                    <a
                      href={
                        "https://en.wikipedia.org/wiki/Generalization_error"
                      }
                      target={"_blank"}
                      style={{ fontSize: "1rem" }}
                    >
                      ({t("See details")})
                    </a>
                  </div>
                  <div>
                    Dice :{" "}
                    {t(
                      "A sample coefficient used to measure the similarity between the actual and predicted values."
                    )}{" "}
                    <a
                      href={
                        "https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient"
                      }
                      target={"_blank"}
                      style={{ fontSize: "1rem" }}
                    >
                      ({t("See details")})
                    </a>
                  </div>
                </div>
              )}
            </GridItem>
          </GridContainer>
        );
      case "featureImportance":
        const height =
          featureImportance.length > 6 ? featureImportance.length * 50 : 400;
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "40px",
              overflowX: "scroll",
            }}
          >
            <BarChart
              width={chartWidth + 150}
              height={height}
              data={featureImportance}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              layout="vertical"
            >
              <Legend verticalAlign="top" height={36} />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: BACKGROUND_COLOR }}
              />
              <CartesianGrid stroke={COLOR_GRAY} strokeDasharray="3 3" />
              <YAxis
                dataKey="name"
                stroke={currentThemeColor.textWhite87}
                interval={0}
                width={600}
                height={100}
                type="category"
              />
              <XAxis
                type="number"
                stroke={currentThemeColor.textWhite87}
                domain={[featureMaxMin.min, featureMaxMin.max]}
              />
              <ReferenceLine
                x={0}
                stroke="rgb(24, 160, 251)"
                label="0"
                strokeWidth={3}
                alwaysShow={true}
              />
              <Bar
                dataKey="value"
                type="monotone"
                barSize={25}
                fill={COLOR_BLUE}
              />
            </BarChart>
          </div>
        );
      case "loss":
        return (
          <div style={{ display: "flex", marginTop: "40px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <LineChart
                width={chartWidth}
                height={400}
                data={trainingValidLoss}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <Tooltip content={<TwoLineTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="Training_Loss"
                  type="monotone"
                  dataKey="y1"
                  stroke={COLOR_ORANGE}
                  activeDot={{ r: 8 }}
                />
                <Line
                  name="Valid_Loss"
                  type="monotone"
                  dataKey="y2"
                  stroke={COLOR_BLUE}
                  activeDot={{ r: 8 }}
                />
                <CartesianGrid stroke={COLOR_GRAY} strokeDasharray="3 3" />
                <XAxis dataKey="x" interval={0} height={100} />
                <YAxis />
              </LineChart>
              <div style={{ marginLeft: "40px" }}>
                Loss :{" "}
                {t(
                  "Loss function is used for deep learning. As learning progresses, the lower the values are the better model becomes."
                )}{" "}
                <a
                  href={"https://en.wikipedia.org/wiki/Loss_function"}
                  target={"_blank"}
                  style={{ fontSize: "1rem" }}
                >
                  ({t("See details")})
                </a>
              </div>
            </div>
          </div>
        );
      case "precision-recall":
        return (
          <div style={{ display: "flex", marginTop: "40px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <LineChart
                width={chartWidth}
                height={400}
                data={precisionRecall}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <Tooltip content={<TwoLineTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="Precision"
                  type="monotone"
                  dataKey="y1"
                  stroke={COLOR_ORANGE}
                  activeDot={{ r: 8 }}
                />
                <Line
                  name="Recall"
                  type="monotone"
                  dataKey="y2"
                  stroke={COLOR_BLUE}
                  activeDot={{ r: 8 }}
                />
                <CartesianGrid stroke={COLOR_GRAY} strokeDasharray="3 3" />
                <XAxis dataKey="x" interval={0} height={100} />
                <YAxis domain={[0, 1]} />
              </LineChart>
              <div style={{ marginLeft: "40px" }}>
                <div>
                  Precision :{" "}
                  {t(
                    "The ratio of the actual value being true when the predicted value is true. The closer the ratio is to 1, the better the model is."
                  )}{" "}
                  <a
                    href={
                      "https://en.wikipedia.org/wiki/Precision_and_recall#Precision"
                    }
                    target={"_blank"}
                    style={{ fontSize: "1rem" }}
                  >
                    ({t("See details")})
                  </a>
                </div>
                <div>
                  Recall :{" "}
                  {t(
                    "The ratio of the predicted value being true when the actual value is true. The closer the ratio is to 1, the better the model is."
                  )}{" "}
                  <a
                    href={
                      "https://en.wikipedia.org/wiki/Precision_and_recall#Recall"
                    }
                    target={"_blank"}
                    style={{ fontSize: "1rem" }}
                  >
                    ({t("See details")})
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      case "kappa-coeff":
        return (
          <div style={{ display: "flex", marginTop: "40px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <LineChart
                width={chartWidth}
                height={400}
                data={kappaMatthew}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <Tooltip content={<TwoLineTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="Kappa_score"
                  type="monotone"
                  dataKey="y1"
                  stroke={COLOR_ORANGE}
                  activeDot={{ r: 8 }}
                />
                <Line
                  name="Matthews_corrcoef"
                  type="monotone"
                  dataKey="y2"
                  stroke={COLOR_BLUE}
                  activeDot={{ r: 8 }}
                />
                <CartesianGrid stroke={COLOR_GRAY} strokeDasharray="3 3" />
                <XAxis dataKey="x" interval={0} height={100} />
                <YAxis domain={[0, 1]} />
              </LineChart>
              <div style={{ marginLeft: "40px" }}>
                <div>
                  Kappa_score :{" "}
                  {t(
                    "This is the statistic used to measure model reliability. The closer the value is to 1, the more reliable the model is."
                  )}{" "}
                  <a
                    href={"https://en.wikipedia.org/wiki/Cohen%27s_kappa"}
                    target={"_blank"}
                    style={{ fontSize: "1rem" }}
                  >
                    ({t("See details")})
                  </a>
                </div>
                <div>
                  Matthews_corrcoef :{" "}
                  {t(
                    "This is the statistic used to measure model reliability. The closer the value is to 1, the more reliable the model is."
                  )}{" "}
                  <a
                    href={
                      "https://en.wikipedia.org/wiki/Matthews_correlation_coefficient"
                    }
                    target={"_blank"}
                    style={{ fontSize: "1rem" }}
                  >
                    ({t("See details")} )
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      case "auroc-fbeta":
        return (
          <div style={{ display: "flex", marginTop: "40px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <LineChart
                width={chartWidth}
                height={400}
                data={aurocFBeta}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <Tooltip content={<TwoLineTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="Auroc"
                  type="monotone"
                  dataKey="y1"
                  stroke={COLOR_ORANGE}
                  activeDot={{ r: 8 }}
                />
                <Line
                  name="F_beta"
                  type="monotone"
                  dataKey="y2"
                  stroke={COLOR_BLUE}
                  activeDot={{ r: 8 }}
                />
                <CartesianGrid stroke={COLOR_GRAY} strokeDasharray="3 3" />
                <XAxis dataKey="x" interval={0} height={100} />
                <YAxis domain={[0, 1]} />
              </LineChart>
              <div style={{ marginLeft: "40px" }}>
                <div>
                  AUROC :{" "}
                  {t(
                    "Calculate the area value of the generated curve by plotting the True Positive Rate (TPR) against the False Positive Rate (FPR). The closer the value is to 1, the more reliable the model is."
                  )}{" "}
                  <a
                    href={
                      "https://en.wikipedia.org/wiki/Receiver_operating_characteristic"
                    }
                    target={"_blank"}
                    style={{ fontSize: "1rem" }}
                  >
                    ({t("See details")})
                  </a>
                </div>
                <div>
                  F_beta :{" "}
                  {t(
                    "This is the statistic used to measure model reliability. The closer the value is to 1, the more reliable the model is."
                  )}{" "}
                  <a
                    href={"https://en.wikipedia.org/wiki/F1_score"}
                    target={"_blank"}
                    style={{ fontSize: "1rem" }}
                  >
                    ({t("See details")})
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      case "records":
        return (
          <div style={{ display: "flex", marginTop: "40px", width: "100%" }}>
            <div style={{ width: "100%" }} id="recordContent">
              <DoubleScrollbar>
                <Table
                  className={classes.table}
                  aria-label="sticky table"
                  stickyHeader
                >
                  <TableHead>
                    <TableRow>
                      {recordsHeader.map((r, idx) => {
                        if (idx === 0) {
                          return (
                            <>
                              <TableCell
                                align="center"
                                className={classes.tableHead}
                              >
                                <b>NO</b>
                              </TableCell>
                              <TableCell
                                align="center"
                                className={classes.tableHead}
                              >
                                <div>
                                  <b>{r}</b>
                                </div>
                              </TableCell>
                            </>
                          );
                        }
                        return (
                          <TableCell
                            align="center"
                            className={classes.tableHead}
                          >
                            <div
                              className={
                                r.length > 30
                                  ? classes.breakText
                                  : classes.textInLine
                              }
                            >
                              <b>{r}</b>
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((record, idx) => {
                      return (
                        <TableRow
                          className={classes.tableRow}
                          style={{
                            background:
                              idx % 2 === 0
                                ? currentTheme.tableRow1
                                : currentTheme.tableRow2,
                          }}
                        >
                          <TableCell
                            className={classes.tableRowCell}
                            align="center"
                          >
                            {idx + 1}
                          </TableCell>
                          {recordsHeader.map((r, idx) => {
                            if (record[r] === true) record[r] = "참";
                            if (record[r] === false) record[r] = "거짓";
                            return (
                              <TableCell
                                className={classes.tableRowCell}
                                align="center"
                              >
                                <div className={classes.breakText}>
                                  {record[r]}
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </DoubleScrollbar>
            </div>
          </div>
        );
      case "dChart":
        return (
          <div style={{ display: "flex", marginTop: "40px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <LineChart
                width={chartWidth}
                height={400}
                data={lossD}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <Tooltip content={<TwoLineTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="LossDA"
                  type="monotone"
                  dataKey="y1"
                  stroke={COLOR_ORANGE}
                  activeDot={{ r: 8 }}
                />
                <Line
                  name="LossDB"
                  type="monotone"
                  dataKey="y2"
                  stroke={COLOR_BLUE}
                  activeDot={{ r: 8 }}
                />
                <CartesianGrid stroke={COLOR_GRAY} strokeDasharray="3 3" />
                <XAxis dataKey="x" interval={0} height={100} />
                {/* <YAxis domain={[0, 1]}/> */}
              </LineChart>
              <div style={{ marginLeft: "40px" }}>
                <div>
                  Loss :{" "}
                  {t(
                    "Loss in Image Generation (GAN) is an auto parameter, so it is not an evaluation index for image similarity."
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case "gChart":
        return (
          <div style={{ display: "flex", marginTop: "40px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <LineChart
                width={chartWidth}
                height={400}
                data={lossG}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <Tooltip content={<TwoLineTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="LossGA"
                  type="monotone"
                  dataKey="y1"
                  stroke={COLOR_ORANGE}
                  activeDot={{ r: 8 }}
                />
                <Line
                  name="LossGB"
                  type="monotone"
                  dataKey="y2"
                  stroke={COLOR_BLUE}
                  activeDot={{ r: 8 }}
                />
                <CartesianGrid stroke={COLOR_GRAY} strokeDasharray="3 3" />
                <XAxis dataKey="x" interval={0} height={100} />
                {/* <YAxis domain={[0, 1]}/> */}
              </LineChart>
              <div style={{ marginLeft: "40px" }}>
                <div>
                  Loss :{" "}
                  {t(
                    "Loss in Image Generation (GAN) is an auto parameter, so it is not an evaluation index for image similarity."
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case "idtChart":
        return (
          <div style={{ display: "flex", marginTop: "40px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <LineChart
                width={chartWidth}
                height={400}
                data={lossIdt}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <Tooltip content={<TwoLineTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="LossIdtA"
                  type="monotone"
                  dataKey="y1"
                  stroke={COLOR_ORANGE}
                  activeDot={{ r: 8 }}
                />
                <Line
                  name="LossIdtB"
                  type="monotone"
                  dataKey="y2"
                  stroke={COLOR_BLUE}
                  activeDot={{ r: 8 }}
                />
                <CartesianGrid stroke={COLOR_GRAY} strokeDasharray="3 3" />
                <XAxis dataKey="x" interval={0} height={100} />
                {/* <YAxis domain={[0, 1]}/> */}
              </LineChart>
              <div style={{ marginLeft: "40px" }}>
                <div>
                  Loss :{" "}
                  {t(
                    "Loss in Image Generation (GAN) is an auto parameter, so it is not an evaluation index for image similarity."
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case "cycleChart":
        return (
          <div style={{ display: "flex", marginTop: "40px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <LineChart
                width={chartWidth}
                height={400}
                data={lossCycle}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <Tooltip content={<TwoLineTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="LossCycleA"
                  type="monotone"
                  dataKey="y1"
                  stroke={COLOR_ORANGE}
                  activeDot={{ r: 8 }}
                />
                <Line
                  name="LossCycleB"
                  type="monotone"
                  dataKey="y2"
                  stroke={COLOR_BLUE}
                  activeDot={{ r: 8 }}
                />
                <CartesianGrid stroke={COLOR_GRAY} strokeDasharray="3 3" />
                <XAxis dataKey="x" interval={0} height={100} />
                {/* <YAxis domain={[0, 1]}/> */}
              </LineChart>
              <div style={{ marginLeft: "40px" }}>
                <div>
                  Loss :{" "}
                  {t(
                    "Loss in Image Generation (GAN) is an auto parameter, so it is not an evaluation index for image similarity."
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      {renderChart(chosenChart)}
    </div>
  );
});

export default Chart;
