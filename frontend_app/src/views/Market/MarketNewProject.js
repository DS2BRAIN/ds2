import React, { useEffect, useState } from "react";
import produce from "immer";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "../../redux/reducers/messages";
import { dynamicSort } from "components/Function/globalFunc";
import { getMeRequestAction } from "../../redux/reducers/user";
import * as api from "../../controller/api";
import {
  Grid,
  RadioGroup,
  InputBase,
  FormControl,
  FormLabel,
  Radio,
} from "@material-ui/core";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import currentTheme from "assets/jss/custom.js";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Block } from "@material-ui/icons";
import { Box, Chip } from "@mui/material";
import TextField from "@mui/material/TextField";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import Tooltip from "@mui/material/Tooltip";
import HelpIcon from "@mui/icons-material/Help";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CancelIcon from "@mui/icons-material/Cancel";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "components/CustomButtons/Button";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  backButton: {
    marginRight: theme.spacing(1),
    backgroundColor: "pink",
  },
  // instructions: {
  //   marginTop: theme.spacing(1),
  //   marginBottom: theme.spacing(1),
  // },
  startProjectUploadBtn: {
    cursor: "pointer",
  },
  modalLoading: {
    position: "absolute",
    width: "42%",
    minWidth: "560px",
    height: "30%",
    minHeight: "450px",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "16px 32px 24px",
  },
  alignCenterDiv: {
    position: "relative",
    "& svg": {
      position: "absolute",
      right: "10px",
    },
  },
  step: {
    "& $alternativeLabel": {
      color: "var(--textWhite38)",
    },
    "& $active": {
      color: "var(--textWhite)",
    },
  },
  active: {},
  alternativeLabel: {},
}));

const MarketNewProject = (props) => {
  const dispatch = useDispatch();
  const theme = currentTheme();
  const stepperClasses = useStyles();
  const { user, project, model, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      messages: state.messages,
    }),
    []
  );
  const classes = currentTheme();
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState(["1", "8", "24"]);
  const steps = [
    "인공지능 개발 조건 설정",
    "백테스트 조건 설정",
    "프로젝트 생성",
  ];
  const factorsObj = {
    financials: {
      name: "Financials",
      data: {
        incomeStatement: {
          name: "Income Statement",
          data: {
            totalRevenue: { name: "Total Revenue", checked: true },
            costOfRevenue: { name: "Cost of Revenue", checked: true },
            grossProfit: { name: "Gross Profit", checked: true },
            operatingExpense: { name: "Operating Expense", checked: true },
            operatingIncome: { name: "Operating Income", checked: true },
            netNonOperatingInterestIncomeExpense: {
              name: "Net Non Operating Interest Income Expense",
              checked: true,
            },
            otherIncomeExpense: { name: "Other Income Expense", checked: true },
            pretaxIncome: { name: "Pretax Income", checked: true },
            taxProvision: { name: "Tax Provision", checked: true },
            netIncomeCommonStockholders: {
              name: "Net Income Common Stockholders",
              checked: true,
            },
            dilutedNIAvailableToComStockholders: {
              name: "Diluted Average Shares",
              checked: true,
            },
            basicEPS: { name: "Basic EPS", checked: true },
            dilutedEPS: { name: "Diluted EPS", checked: true },
            basicAverageShares: { name: "Basic Average Shares", checked: true },
            dilutedAverageShares: {
              name: "Diluted Average Shares",
              checked: true,
            },
            totalOperatingIncomeAsReported: {
              name: "Total Operating Income as Reported",
              checked: true,
            },
            totalExpenses: { name: "Total Expenses", checked: true },
            netIncomefromContinuingAndDiscontinuedOperation: {
              name: "Net Income from Continuing & Discontinued Operation",
              checked: true,
            },
            normalizedIncome: { name: "Normalized Income", checked: true },
            interestExpense: { name: "Interest Expense", checked: true },
            netInterestIncome: { name: "Net Interest Income", checked: true },
            ebit: { name: "EBIT", checked: true },
            ebitda: { name: "EBITDA", checked: true },
            reconciledCostOfRevenue: {
              name: "Reconciled Cost of Revenue",
              checked: true,
            },
            reconciledDepreciation: {
              name: "Reconciled Depreciation",
              checked: true,
            },
            netIncomeFromContinuingOperationNetMinorityInterest: {
              name:
                "Net Income from Continuing Operation Net Minority Interest",
              checked: true,
            },
            totalUnusualItemsExcludingGoodwill: {
              name: "Total Unusual Items Excluding Goodwill",
              checked: true,
            },
            totalUnusualItems: { name: "Total Unusual Items", checked: true },
            normalizedEBITDA: { name: "Normalized EBITDA", checked: true },
            taxRateForCalcs: { name: "Tax Rate for Calcs", checked: true },
            taxEffectPfUnusualItems: {
              name: "Tax Effect of Unusual Items",
              checked: true,
            },
          },
        },
        balanceSheet: {
          name: "Balance Sheet",
          data: {
            totalAssets: { name: "Total Assets", checked: true },

            totalLiabilitiesNetMinorityInterest: {
              name: "Total Liabilities Net Minority Interest",
              checked: true,
            },
            totalEquityGrossMinorityInterest: {
              name: "Total Equity Gross Minority Interest",
              checked: true,
            },
            totalCapitalization: {
              name: "Total Capitalization",
              checked: true,
            },
            commonStockEquity: { name: "Common Stock Equity", checked: true },
            capitalLeaseObligations: {
              name: "Capital Lease Obligations",
              checked: true,
            },
            netTangibleAssets: { name: "Net Tangible Assets", checked: true },
            workingCapital: { name: "Working Capital", checked: true },
            investedCapital: { name: "Invested Capital", checked: true },
            tangibleBookValue: { name: "Tangible Book Value", checked: true },
            totalDebt: { name: "Total Debt", checked: true },
            netDebt: { name: "Net Debt", checked: true },
            shareIssued: { name: "Share Issued", checked: true },
            ordinarySharesNumber: {
              name: "Ordinary Shares Number",
              checked: true,
            },
          },
        },
        cashFlow: {
          name: "Cash Flow",
          data: {
            operatingCashFlow: { name: "Operating Cash Flow", checked: true },
            investingCashFlow: { name: "Investing Cash Flow", checked: true },
            financingCashFlow: { name: "Financing Cash Flow", checked: true },
            endCashPosition: { name: "End Cash Position", checked: true },
            incomeTaxPaidSupplementalData: {
              name: "Income Tax Paid Supplemental Data",
              checked: true,
            },
            interestPaidSupplementalData: {
              name: "Interest Paid Supplemental Data",
              checked: true,
            },
            capitalExpenditure: { name: "Capital Expenditure", checked: true },
            issuanceOfCapitalStock: {
              name: "Issuance of Capital Stock",
              checked: true,
            },
            issuanceOfDebt: { name: "Issuance of Debt", checked: true },
            repaymentOfDebt: { name: "Repayment of Debt", checked: true },
            repurchaseOfCapitalStock: {
              name: "Repurchase of Capital Stock",
              checked: true,
            },
            freeCashFlow: { name: "Free Cash Flow", checked: true },
          },
        },
      },
    },
    analysis: {
      name: "Holders",
      data: {
        earningsEstimate: {
          name: "Earnings Estimate",
          data: {
            noOfAnalysts: { name: "No. of Analysts", checked: true },
            avgEstimate: { name: "Avg. Estimate", checked: true },
            lowEstimate: { name: "Low Estimate", checked: true },
            highEstimate: { name: "High Estimate", checked: true },
            yearAgoEPS: { name: "Year Ago EPS", checked: true },
          },
        },
        revenueEstimate: {
          name: "Revenue Estimate",
          data: {
            noOfAnalysts: { name: "No. of Analysts", checked: true },
            avgEstimate: { name: "Avg. Estimate", checked: true },
            lowEstimate: { name: "Low Estimate", checked: true },
            highEstimate: { name: "High Estimate", checked: true },
            yearAgoSales: { name: "Year Ago Sales", checked: true },
            salesGrowth: { name: "Sales Growth (year/est)", checked: true },
          },
        },
        earningsHistory: {
          name: "Earnings History",
          data: {
            EPSEst: { name: "EPS Est.", checked: true },
            EPSActual: { name: "EPS Actual", checked: true },
            difference: { name: "Difference", checked: true },
            surprisePercent: { name: "Surprise %", checked: true },
          },
        },
        EPSTrend: {
          name: "EPS Trend",
          data: {
            currentEstimate: { name: "Current Estimate", checked: true },
            daysAgo7: { name: "7 Days Ago", checked: true },
            daysAgo30: { name: "30 Days Ago", checked: true },
            daysAgo60: { name: "60 Days Ago", checked: true },
            daysAgo90: { name: "90 Days Ago", checked: true },
          },
        },
        EPSRevisions: {
          name: "EPS Revisions",
          data: {
            upLast7Days: { name: "Up Last 7 Days", checked: true },
            upLast30Days: { name: "Up Last 30 Days", checked: true },
            downLast7Days: { name: "Down Last 7 Days", checked: true },
            downLast30Days: { name: "Down Last 30 Days", checked: true },
          },
        },
        growthEstimates: {
          name: "Growth Estimates",
          data: {
            currentQtr: { name: "Current Qtr.", checked: true },
            nextQtr: { name: "Next Qtr.", checked: true },
            currentYear: { name: "Current Year", checked: true },
            nextYear: { name: "Next Year", checked: true },
            next5Years: { name: "Next 5 Years (per annum)", checked: true },
            past5Years: { name: "Past 5 Years (per annum)", checked: true },
          },
        },
      },
    },
    holders: {
      name: "Holders",
      data: {
        majorHolders: { name: "Major Holders", checked: true },
        topInstitutionalHolders: {
          name: "Top Institutional Holders",
          checked: true,
        },
        topMutualFundHolders: {
          name: "Top Mutual Fund Holders",
          checked: true,
        },
      },
    },
    sustainability: {
      name: "Sustainability",
      data: {
        totalESGRiskScore: { name: "Total ESG Risk Score", checked: true },
        environmentRiskScore: { name: "Environment Risk Score", checked: true },
        socialRiskScore: { name: "Social Risk Score", checked: true },
        governanceRiskScore: { name: "Governance Risk Score", checked: true },
      },
    },
  };
  const initialBacktestCondition = {
    period: { start: "2017-05-24T10:30", end: "2017-05-24T10:30" },
    stockItemCnt: 0,
    timingOfBuying: {
      time: 0,
      amount: 0,
    },
    timingOfSelling: {
      time: 0,
      amount: 0,
    },
    HPMSellTimingArr: [
      {
        time: 0,
        amount: 0,
      },
    ],
    riskTimingArr: [0],
    MinimumHoldingTime: 0,
    riskManagement: {
      escape: 0,
      frozenEscapeHour: 0,
      holdHour: 0,
    },
  };
  const trainingMethodArr = [
    {
      value: "normal_regression",
      name: "Normal Regression",
    },
    {
      value: "classification",
      name: "Classification",
    },
    {
      value: "py_file",
      name: "py 파일_지원예정",
    },
    {
      value: "complex_model",
      name: "복합모델 (앙상블 모델)_지원예정",
    },
  ];
  const stockTypeArr = [
    {
      value: "cryptos",
      name: "가상 자산",
    },
    {
      value: "ko",
      name: "한국 주식",
    },
    {
      value: "en",
      name: "미국 주식",
    },
  ];
  const goalsArr = [
    {
      name: "5분 후",
      value: "avg_diff_5m",
    },
    {
      name: "1시간 후",
      value: "avg_diff_60m",
    },
    {
      name: "이틀 후",
      value: "avg_diff_2d",
    },
    {
      name: "일주일 후",
      value: "avg_diff_7d",
    },
    {
      name: "1개월 후",
      value: "avg_diff_28d",
    },
    {
      name: "3개월 후",
      value: "avg_diff_91d",
    },
  ];
  const indicesArr = [
    "^GSPC",
    "^DJI",
    "^IXIC",
    "^NYA",
    "^XAX",
    "^BUK100P",
    "^RUT",
    "^VIX",
    "^FTSE",
    "^GDAXI",
    "^FCHI",
    "^STOXX50E",
    "^N100",
    "^BFX",
    "IMOEX.ME",
    "^N225",
    "^HSI",
    "000001.SS",
    "399001.SZ",
    "^STI",
    "^AXJO",
    "^AORD",
    "^BSESN",
    "^JKSE",
    "^KLSE",
    "^NZ50",
    "^KS11",
    "^TWII",
    "^GSPTSE",
    "^BVSP",
    "^MXX",
    "^IPSA",
    "^MERV",
    "^TA125.TA",
    "^CASE30",
    "^JN0U.JO",
  ];
  const commoditiesArr = [
    "ES=F",
    "YM=F",
    "NQ=F",
    "RTY=F",
    "ZB=F",
    "ZN=F",
    "ZF=F",
    "ZT=F",
    "GC=F",
    "MGC=F",
    "SI=F",
    "SIL=F",
    "PL=F",
    "HG=F",
    "PA=F",
    "CL=F",
    "HO=F",
    "NG=F",
    "RB=F",
    "BZ=F",
    "B0=F",
    "ZC=F",
    "ZO=F",
    "KE=F",
    "ZR=F",
    "ZM=F",
    "ZL=F",
    "ZS=F",
    "GF=F",
    "HE=F",
    "LE=F",
    "CC=F",
    "KC=F",
    "CT=F",
    "LBS=F",
    "OJ=F",
    "SB=F",
  ];
  const currenciesArr = ["KRW=X", "JPY=X", "CNY=X", "EUR=X"];

  // dummy
  const tickersArr = [
    {
      name: "Digital World Acquisition Corp.",
      symbol: "DWAC",
      minVolume: 3.562,
      maxVolume: 28.332,
      checked: false,
      marketCap: 5000,
    },
    {
      name: "Snowflake Inc.",
      symbol: "SNOW",
      minVolume: 5.782,
      maxVolume: 36.323,
      checked: false,
      marketCap: 4000,
    },
    {
      name: "Square, Inc.",
      symbol: "SQ",
      minVolume: 13.43,
      maxVolume: 236.232,
      checked: false,
      marketCap: 1200,
    },
    {
      name: "CrowdStrike Holdings, Inc.",
      symbol: "CRWD",
      minVolume: 8.014,
      maxVolume: 87.234,
      checked: false,
      marketCap: 3500,
    },
    {
      name: "Arbutus Biopharma Corporation",
      symbol: "ABUS",
      minVolume: 322.127,
      maxVolume: 500.1,
      checked: false,
      marketCap: 300,
    },
    {
      name: "Phunware, Inc.",
      symbol: "PHUN",
      minVolume: 43.762,
      maxVolume: 120.332,
      checked: false,
      marketCap: 400,
    },
  ];

  const [projectNameValue, setProjectNameValue] = useState("");
  const [projectDescriptionValue, setProjectDescriptionValue] = useState("");
  const [dataCategory, setDataCategory] = useState(null);
  const [queryParams, setQueryParams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirst, setIsFirst] = useState(false);
  const [isDiscount, setIsDiscount] = useState(false);
  const [isSelectedDiscount, setIsSelectedDiscount] = useState(false);
  const [modelData, setModelData] = useState(null);
  const [rawPlanData, setRawPlanData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isPlanReady, setIsPlanReady] = useState(false);
  const [maxHour, setMaxHour] = useState(0);
  const [perHourPrice, setPerHourPrice] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isQuantProject, setIsQuantProject] = useState(false);
  const [listOpenObj, setListOpenObj] = useState({
    financials: {
      incomeStatement: false,
      balanceSheet: false,
      cashFlow: false,
    },
    analysis: {
      earningsEstimate: false,
      revenueEstimate: false,
      earningsHistory: false,
      EPSTrend: false,
      EPSRevisions: false,
      growthEstimates: false,
    },
  });
  const [factors, setFactors] = useState(factorsObj);
  const [backtestCnt, setBacktestCnt] = useState(1);
  const [backtestSettingArr, setBacktestSettingArr] = useState([
    initialBacktestCondition,
  ]);
  const [trainingMethod, setTrainingMethod] = useState("normal_regression");
  const [stockType, setStockType] = useState("cryptos");
  const [startTime, setStartTime] = useState("2017-05-24T10:30");
  const [endTime, setEndTime] = useState("2017-05-24T10:30");
  const [timeMemory, setTimeMemory] = useState(50);
  const [isUsingMlops, setIsUsingMlops] = useState(false);
  const [goal, setGoal] = useState("avg_diff_60m");
  const [isCheckedFactorsCategory, setIsCheckedFactorsCategory] = useState({
    financials: true,
    analysis: true,
    holders: true,
    sustainability: true,
  });
  const [factorsOpen, setFactorsOpen] = useState(false);
  const [indicesOpen, setIndicesOpen] = useState(false);
  const [commoditiesOpen, setCommoditiesOpen] = useState(false);
  const [indices, setIndices] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [
    isFactorConditionDialogOpen,
    setIsFactorConditionDialogOpen,
  ] = useState(false);
  const [factorConditionType, setFactorConditionType] = useState("number");
  const [industrySector, setIndustrySector] = useState("");
  const [isEditFactorCondition, setIsEditFactorCondition] = useState(false);
  const [industrySectorArr, setIndustrySectorArr] = useState([]);
  const [
    factorConditionMinPercentage,
    setFactorConditionMinPercentage,
  ] = useState(null);
  const [
    factorConditionMaxPercentage,
    setFactorConditionMaxPercentage,
  ] = useState(null);
  const [FCMinPercentageChecked, setFCMinPercentageChecked] = useState(false);
  const [FCMaxPercentageChecked, setFCMaxPercentageChecked] = useState(false);
  const [selectedFCTargetInfo, setSelectedFCTargetInfo] = useState(null);
  const [
    conditionHigherThanPercentage,
    setConditionHigherThanPercentage,
  ] = useState({});
  const [
    conditionLowerThanPercentage,
    setConditionLowerThanPercentage,
  ] = useState({});
  const [tickers, setTickers] = useState([]);
  const [
    conditionVolumeHigherThanPercentage,
    setConditionVolumeHigherThanPercentage,
  ] = useState(null);
  const [
    conditionVolumeLowerThanPercentage,
    setConditionVolumeLowerThanPercentage,
  ] = useState(null);
  const [tickersInfoArr, setTickersInfoArr] = useState(tickersArr);
  const [searchedTickerValue, setSearchedTickerValue] = useState("");
  const [searchedTickersInfoArr, setSearchedTickersInfoArr] = useState([]);
  const [isDisplaySearchedLists, setIsDisplaySearchedLists] = useState(false);
  const [isMarketCapDesc, setIsMarketCapDesc] = useState(true);
  const [settingCondition, setSettingCondition] = useState("direct");
  const [volumeValue, setVolumeValue] = useState([30, 80]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    api.getMarketPlans({ modelId: id }).then((res) => {
      let tmp = Object.entries(res.data);
      setIsDiscount(tmp.pop()[1]);
      setPlanData(tmp);
      setRawPlanData(res.data);
      setIsPlanReady(true);
    });
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");

    api.getMarketModelsInfoDetail(id).then((res) => {
      setModelData(res.data);
      if (res.data.service_type === "quant") setIsQuantProject(true);
      setIsModelReady(true);
    });
  }, []);

  useEffect(() => {
    let tmpIndices = [];
    let tmpCommodities = [];
    let tmpCurrencies = [];

    indicesArr.map((v, i) => {
      tmpIndices.push({ name: v, checked: true });
    });

    commoditiesArr.map((v, i) => {
      tmpCommodities.push({ name: v, checked: true });
    });

    currenciesArr.map((v, i) => {
      tmpCurrencies.push({ name: v, checked: true });
    });

    setIndices(tmpIndices);
    setCommodities(tmpCommodities);
    setCurrencies(tmpCurrencies);
  }, []);

  useEffect(() => {
    if (isModelReady == false) return;
    if (user.me == null) {
      dispatch(getMeRequestAction());
    } else {
      let key = `first_${modelData.service_type}_expiration_date`;
      if (user.me[key] == null) {
        setIsFirst(true);
      } else {
        setIsFirst(false);
      }
    }
  }, [isModelReady, user.me]);

  useEffect(() => {
    if (user.isLoading == false) {
      setIsLoading(false);
    }
  }, [user.isLoading]);

  useEffect(() => {
    if (activeStep === 1 && messages.category === "success") {
      setIsLoading(false);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }, [messages]);

  useEffect(() => {
    handlePrice();
  }, [dataCategory]);

  const handlePrice = () => {
    if (!(rawPlanData && dataCategory)) return;
    let tempTotal = 0;
    let tempPricePerHour = 0;
    let tempCategory = rawPlanData[dataCategory];
    let tempSalePrice = tempCategory?.sale_price_per_month;
    let tempPrice = tempCategory?.price_per_month;
    let tempHour = parseFloat(dataCategory) * 30;

    if (isDiscount && tempSalePrice) tempTotal = tempSalePrice;
    else tempTotal = tempPrice;
    tempTotal = parseFloat(tempTotal);

    if (user.language === "ko") tempTotal = tempTotal * 1200;
    tempTotal = parseInt(tempTotal.toFixed(0));
    tempPricePerHour = parseFloat((tempTotal / tempHour).toFixed(2));

    setRetailPrice(tempTotal);
    setMaxHour(tempHour);
    setPerHourPrice(tempPricePerHour);
  };

  const changeProjectNameValue = (e) => {
    setProjectNameValue(e.target.value);
  };

  const changeProjectDescriptionValue = (e) => {
    setProjectDescriptionValue(e.target.value);
  };

  const handleListClick = (category, key, value) => {
    // console.log(category, key, value);
    setListOpenObj(() => ({
      ...listOpenObj,
      [category]: { ...listOpenObj[category], [key]: !value },
    }));
  };

  const changeDataCategory = (event) => {
    let tempSelected = event.target.value;
    planData.map((data) => {
      if (data[0] === tempSelected) {
        if (data[1].sale_price_per_month) setIsSelectedDiscount(true);
        else setIsSelectedDiscount(false);
      }
    });
    setDataCategory(tempSelected);
  };

  const handleNext = () => {
    if (
      user.cardInfo == null ||
      user.cardInfo.cardName == null ||
      (user.cardInfo.cardType == "payple" && user.language !== "ko") ||
      (user.cardInfo.cardType == "eximbay" && user.language !== "en")
    ) {
      if (process.env.REACT_APP_ENTERPRISE !== "true") {
        props.history.push(`/admin/setting/payment/?message=need`);
      }
    } else {
      if (projectNameValue == "") {
        dispatch(
          openErrorSnackbarRequestAction(t("Please enter a project name."))
        );
      } else if (!dataCategory) {
        dispatch(
          openErrorSnackbarRequestAction(t("Please enter your daily upload time."))
        );
      } else {
        setIsLoading(true);
        if (isFirst) {
          api
            .postMarketProject({
              modelId: modelData.id,
              projectName: projectNameValue,
              projectDescription: projectDescriptionValue,
              timeLimit: parseInt(dataCategory),
              planId: rawPlanData[dataCategory].id,
            })
            .then((res) => {
              props.history.push(
                `/admin/market/${res.data.id}/${res.data.service_type}`
              );
              dispatch(getMeRequestAction());
            })
            .catch((err) => {
              dispatch(
                openErrorSnackbarRequestAction(
                  t(
                    "죄송합니다, 프로젝트 생성 중 오류가 발생하였습니다. 다시 시도해주세요."
                  )
                )
              );
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          api
            .postPurchaseMarketModel({
              isSelectedDiscount,
              sale_amount_kr:
                rawPlanData[dataCategory].sale_price_per_month * 1200,
              sale_amount_en: rawPlanData[dataCategory].sale_price_per_month,
              amount_kr: rawPlanData[dataCategory].price_per_month * 1200,
              amount_en: rawPlanData[dataCategory].price_per_month,
              currency: user.language == "ko" ? "krw" : "usd",
              planId: rawPlanData[dataCategory].id,
            })
            .then((response) => {
              if (response.data.result == "success") {
                api
                  .postMarketProject({
                    modelId: modelData.id,
                    projectName: projectNameValue,
                    projectDescription: projectDescriptionValue,
                    timeLimit: parseInt(dataCategory),
                    planId: rawPlanData[dataCategory].id,
                  })
                  .then((res) => {
                    props.history.push(
                      `/admin/market/${res.data.id}/${res.data.service_type}`
                    );
                    dispatch(getMeRequestAction());
                  })
                  .catch((err) => {
                    dispatch(
                      openErrorSnackbarRequestAction(
                        t(
                          "죄송합니다, 프로젝트 생성 중 오류가 발생하였습니다. 다시 시도해주세요."
                        )
                      )
                    );
                  })
                  .finally(() => {
                    setIsLoading(false);
                  });
              } else {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t("We could not process your payment. Please try again.")
                  )
                );
              }
            })
            .catch((err) => {
              dispatch(
                openErrorSnackbarRequestAction(
                  t(
                    "죄송합니다, 프로젝트 생성 중 오류가 발생하였습니다. 다시 시도해주세요."
                  )
                )
              );
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      }
    }
  };

  const handleNextStep = () => {
    if (activeStep === 0) {
      if (projectNameValue == "") {
        dispatch(
          openErrorSnackbarRequestAction(t("Please enter a project name."))
        );
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    } else if (activeStep === 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else if (activeStep === 2) {
      props.history.push(`/admin/quantProject`);
    } else {
      props.history.push(`/admin/marketPurchaseList`);
    }
    // if (activeStep === 0) {
    //   if (projectNameValue && dataCategory) {
    //     if (skipStepper) {
    //       dispatch(
    //         postLabelProjectRequestAction({
    //           name: projectNameValue,
    //           description: projectDescriptionValue,
    //           workapp: dataCategory,
    //           files: uploadFile,
    //           filesForLabelProject: skipStepper,
    //         })
    //       );
    //       setIsLoading(true);
    //     }
    //     setActiveStep((prevActiveStep) => prevActiveStep + 1);
    //   } else {
    //     dispatch(
    //       openErrorSnackbarRequestAction(
    //         t("Project name and category are required.")
    //       )
    //     );
    //   }
    // } else if (activeStep === 1) {
    //   if (uploadFile && uploadFile.length > 0) {
    //     if (shouldUpdateFrame && !frameValue) {
    //       dispatch(
    //         openErrorSnackbarRequestAction(
    //           t(
    //             "동영상 파일을 업로드하기 위해서는 분당 프레임 수를 입력해야합니다."
    //           )
    //         )
    //       );
    //       return;
    //     }
    //     if (frameValue !== null && (frameValue < 1 || frameValue > 60)) {
    //       dispatch(
    //         openErrorSnackbarRequestAction(
    //           t("The number of frames must be between 1 and 600")
    //         )
    //       );
    //       return;
    //     }
    //     dispatch(
    //       postLabelProjectRequestAction({
    //         name: projectNameValue,
    //         description: projectDescriptionValue,
    //         workapp: dataCategory,
    //         files: uploadFile,
    //         frame_value: frameValue,
    //       })
    //     );
    //     setIsLoading(true);
    //   } else {
    //     dispatch(openErrorSnackbarRequestAction(t("Upload file")));
    //   }
    // } else {
    //   history.push(
    //     `/admin/labelling?page=1&sorting=created_at&desc=true&rows=10`
    //   );
    // }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      props.history.push(`/admin/marketList`);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const onChangeBacktestConditions = (
    value,
    target,
    subTarget,
    idx,
    subIdx
  ) => {
    const convertedTypeVal = target !== "period" ? parseInt(value) : value;

    if (subTarget) {
      if (subIdx !== undefined)
        setBacktestSettingArr(
          produce((draft) => {
            draft[idx][target][subIdx][subTarget] = convertedTypeVal;
          })
        );
      else
        setBacktestSettingArr(
          produce((draft) => {
            draft[idx][target][subTarget] = convertedTypeVal;
          })
        );
    } else {
      if (subIdx !== undefined)
        setBacktestSettingArr(
          produce((draft) => {
            draft[idx][target][subIdx] = convertedTypeVal;
          })
        );
      else
        setBacktestSettingArr(
          produce((draft) => {
            draft[idx][target] = convertedTypeVal;
          })
        );
    }
  };

  const renderNumberInput = (
    value,
    min,
    max,
    target,
    subTarget,
    idx,
    subIdx
  ) => {
    return (
      <TextField
        type="number"
        variant="standard"
        onChange={(e) =>
          onChangeBacktestConditions(
            e.target.value,
            target,
            subTarget,
            idx,
            subIdx
          )
        }
        // defaultValue={defaultValue}
        value={value}
        inputProps={{
          style: {
            color: "white",
            fontWeight: "400",
            borderColor: "white",
            paddingLeft: "10px",
            boxSizing: "border-box",
          },
          min: min,
          max: max,
        }}
        style={{ width: "60px" }}
      />
    );
  };

  const addBacktestCondition = () => {
    // setBacktestSettingArr(backtestSettingArr.concat(0));
    setBacktestSettingArr(
      produce((draft) => {
        draft.push(initialBacktestCondition);
      })
    );
  };

  const removeBacktestCondition = (idx) => {
    // setBacktestSettingArr(backtestSettingArr.filter((v, i) => i !== idx));
    setBacktestSettingArr(
      produce((draft) => {
        draft.splice(idx, 1);
      })
    );
  };

  const addHPMSellTimingCondition = (idx) => {
    setBacktestSettingArr(
      produce((draft) => {
        draft[idx].HPMSellTimingArr.push({ time: 0, amount: 0 });
      })
    );
  };

  const removeHPMSellTimingCondition = (idx, subIdx) => {
    setBacktestSettingArr(
      produce((draft) => {
        draft[idx].HPMSellTimingArr.splice(subIdx, 1);
      })
    );
  };

  const addRiskTimingCondition = (idx) => {
    setBacktestSettingArr(
      produce((draft) => {
        draft[idx].riskTimingArr.push(0);
      })
    );
  };

  const removeRiskTimingCondition = (idx, subIdx) => {
    setBacktestSettingArr(
      produce((draft) => {
        draft[idx].riskTimingArr.splice(subIdx, 1);
      })
    );
  };

  const onChangeFactorsCategoryChecked = (e, target) => {
    const isChecked = e.target.checked
      ? e.target.checked
      : e.currentTarget.checked;
    const targetData = factors[target].data;

    setIsCheckedFactorsCategory({
      ...isCheckedFactorsCategory,
      [target]: isChecked,
    });

    // 카테고리별 개별 토글 버튼 제어
    Object.keys(targetData).map((k, i) => {
      if (targetData[k].hasOwnProperty("data")) {
        Object.keys(targetData[k].data).map((k2, i) => {
          setFactors(
            produce((draft) => {
              draft[target].data[k].data[k2].checked = isChecked;
            })
          );
        });
      } else {
        setFactors(
          produce((draft) => {
            draft[target].data[k].checked = isChecked;
          })
        );
      }
    });
  };

  const onChangeEachFactorChecked = (e, key, key2, key3) => {
    const isChecked = e.target.checked
      ? e.target.checked
      : e.currentTarget.checked;

    // 카테고리별 전체 토글 버튼 제어
    if (isChecked) {
      let toggleFlag = true;
      const targetData = factors[key].data;

      Object.keys(targetData).map((k, i) => {
        if (key3) {
          Object.keys(targetData[k].data).map((k2, i) => {
            if (!targetData[k].data[k2].checked && k2 !== key3) {
              toggleFlag = false;
              return;
            }
          });
        } else {
          if (!targetData[k].checked && k !== key2) {
            toggleFlag = false;
            return;
          }
        }
      });

      if (toggleFlag)
        setIsCheckedFactorsCategory({
          ...isCheckedFactorsCategory,
          [key]: true,
        });
    } else {
      setIsCheckedFactorsCategory({
        ...isCheckedFactorsCategory,
        [key]: false,
      });
    }

    setFactors(
      produce((draft) => {
        const t = key3
          ? draft[key].data[key2].data[key3]
          : key2
          ? draft[key].data[key2]
          : draft[key];

        t.checked = isChecked;
      })
    );

    // console.log(key, key2, key3);
  };

  const onChangeEachCheckBox = (e, i, type) => {
    const isChecked = e.target.checked
      ? e.target.checked
      : e.currentTarget.checked;
    const updater =
      type === "currency"
        ? setCurrencies
        : type === "indice"
        ? setIndices
        : setCommodities;

    updater(
      produce((draft) => {
        draft[i].checked = isChecked;
      })
    );
  };

  const handleFactorConditionDialogOpen = (targetInfo) => {
    const { key1, key2, key3 } = targetInfo;
    const target = key3
      ? factors[key1].data[key2].data[key3]
      : key2
      ? factors[key1].data[key2]
      : factors[key1];

    if (target.condition_higher_than_percentage !== undefined) {
      setFCMinPercentageChecked(true);
      setFactorConditionMinPercentage(target.condition_higher_than_percentage);
    }

    if (target.condition_lower_than_percentage !== undefined) {
      setFCMaxPercentageChecked(true);
      setFactorConditionMaxPercentage(target.condition_lower_than_percentage);
    }

    setSelectedFCTargetInfo(targetInfo);
    setIsFactorConditionDialogOpen(true);
  };

  const resetFactorConditionDialog = () => {
    setIndustrySectorArr([]);
    setIndustrySector("");
    setFactorConditionMinPercentage(null);
    setFactorConditionMaxPercentage(null);
    setFCMinPercentageChecked(false);
    setFCMaxPercentageChecked(false);
  };

  const handleFactorConditionDialogClose = () => {
    setIsFactorConditionDialogOpen(false);
    resetFactorConditionDialog();
  };

  const addIndustrySector = (e) => {
    e.preventDefault();

    setIndustrySectorArr(industrySectorArr.concat(industrySector));

    setIndustrySector("");
  };

  const removeIndustrySector = (name) => {
    setIndustrySectorArr(industrySectorArr.filter((v, i) => v !== name));
  };

  const onChangeIndustrySector = (e) => {
    setIndustrySector(e.currentTarget.value);
  };

  const registerFactorCondition = () => {
    const { key1, key2, key3 } = selectedFCTargetInfo;
    // const targetKey = key3 ? key3 : key2 ? key2 : key1;
    const targetName = key3
      ? factors[key1].data[key2].data[key3].name
      : key2
      ? factors[key1].data[key2].name
      : factors[key1].name;

    setFactors(
      produce((draft) => {
        const t = key3
          ? draft[key1].data[key2].data[key3]
          : key2
          ? draft[key1].data[key2]
          : draft[key1];

        if (FCMinPercentageChecked)
          t.condition_higher_than_percentage =
            factorConditionMinPercentage === 0
              ? 0
              : factorConditionMinPercentage;
        else {
          if (t.condition_higher_than_percentage !== undefined)
            delete t.condition_higher_than_percentage;
        }

        if (FCMaxPercentageChecked)
          t.condition_lower_than_percentage =
            factorConditionMaxPercentage === 0
              ? 0
              : factorConditionMaxPercentage;
        else {
          if (t.condition_lower_than_percentage !== undefined)
            delete t.condition_lower_than_percentage;
        }
      })
    );

    if (FCMinPercentageChecked)
      setConditionHigherThanPercentage({
        ...conditionHigherThanPercentage,
        [targetName]:
          factorConditionMinPercentage === 0
            ? 0
            : factorConditionMinPercentage / 100,
      });
    else {
      if (conditionHigherThanPercentage[targetName] !== undefined)
        setConditionHigherThanPercentage(
          produce((draft) => {
            delete conditionHigherThanPercentage[targetName];
          })
        );
    }

    if (FCMaxPercentageChecked)
      setConditionLowerThanPercentage({
        ...conditionLowerThanPercentage,
        [targetName]:
          factorConditionMaxPercentage === 0
            ? 0
            : factorConditionMaxPercentage / 100,
      });
    else {
      if (conditionLowerThanPercentage[targetName] !== undefined)
        setConditionLowerThanPercentage(
          produce((draft) => {
            delete conditionLowerThanPercentage[targetName];
          })
        );
    }

    handleFactorConditionDialogClose();
  };

  const onClickFCPercentageCheck = (type) => {
    if (type === "min") {
      setFactorConditionMinPercentage(FCMinPercentageChecked ? null : 0);
      setFCMinPercentageChecked(!FCMinPercentageChecked);
    } else {
      setFactorConditionMaxPercentage(FCMaxPercentageChecked ? null : 0);
      setFCMaxPercentageChecked(!FCMaxPercentageChecked);
    }
  };

  const renderEachFactorCondition = (key1, key2, key3) => {
    const target = key3
      ? factors[key1].data[key2].data[key3]
      : key2
      ? factors[key1].data[key2]
      : factors[key1];
    const minPerVal = target.condition_higher_than_percentage;
    const maxPerVal = target.condition_lower_than_percentage;
    const isExistMinPerVal = minPerVal !== undefined;
    const isExistMaxPerVal = maxPerVal !== undefined;

    return isExistMinPerVal || isExistMaxPerVal ? (
      <Grid container>
        <span
          style={{
            display: "inline-block",
            marginTop: "-16px",
            fontSize: "12px",
            marginLeft: "14px",
          }}
        >
          {t("Setting conditions")} : {isExistMinPerVal && t("최소") + ` ${minPerVal}%`}
          {isExistMinPerVal && isExistMaxPerVal && " , "}
          {isExistMaxPerVal && t("maximum") + ` ${maxPerVal}%`}
        </span>
      </Grid>
    ) : null;
  };

  const FactorConditionOpenBtn = (props) => {
    const targetInfo = props.targetInfo;
    return (
      <span
        className="cursorPointer"
        onClick={() => handleFactorConditionDialogOpen(targetInfo)}
        style={{
          display: "inline-block",
          width: "auto",
          fontSize: "12px",
          textDecoration: "underline",
          color: "var(--mainSub)",
          margin: "0 0 0 -6px",
        }}
      >
        {t("Settings")}
      </span>
    );
  };

  const onChangeSearchTickerLists = (e) => {
    const targetValue = e.currentTarget.value;
    setSearchedTickerValue(targetValue);

    if (targetValue !== "") setIsDisplaySearchedLists(true);
    else setIsDisplaySearchedLists(false);

    setSearchedTickersInfoArr(
      tickersInfoArr
        .filter(
          (v, i) =>
            v.name.toLowerCase().includes(targetValue.toLowerCase()) ||
            v.symbol.toLowerCase().includes(targetValue.toLowerCase())
        )
        // .sort((a, b) =>
        //   isMarketCapDesc
        //     ? b.marketCap - a.marketCap
        //     : a.marketCap - b.marketCap
        // )
        // .sort((a, b) => (isMarketCapDesc ? b.name - a.name : a.name - b.name))
        .sort(dynamicSort(isMarketCapDesc ? "-name" : "name"))
    );
  };

  const handleToggleTickerChecked = (value) => {
    const prevStateArr = [tickersInfoArr, searchedTickersInfoArr];
    const nextState = [];

    prevStateArr.map((v, i) => {
      nextState.push(
        produce(v, (draft) => {
          let idx = -1;

          draft.map((val, i) => {
            if (val.symbol === value) idx = i;
          });

          draft[idx].checked = !draft[idx].checked;
        })
      );
    });

    setTickersInfoArr(nextState[0]);
    setSearchedTickersInfoArr(nextState[1]);
    setTickers(
      produce((draft) => {
        const idx = draft.indexOf(value);

        if (idx === -1) draft.push(value);
        else draft.splice(idx, 1);
      })
    );
  };

  const resetSearchedTickerValue = () => {
    setSearchedTickerValue("");
    setIsDisplaySearchedLists(false);
  };

  const reverseMarketCapDesc = () => {
    // setSearchedTickersInfoArr(
    //   produce((draft) => {
    //     draft.sort((a, b) =>
    //       isMarketCapDesc
    //         ? a.marketCap - b.marketCap
    //         : b.marketCap - a.marketCap
    //     );
    //   })
    // );
    setSearchedTickersInfoArr(
      produce((draft) => {
        draft.sort(dynamicSort(isMarketCapDesc ? "name" : "-name"));
      })
    );
    setIsMarketCapDesc((prev) => !prev);
  };

  const minVolumeDistance = 50;

  const handleVolumeChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    // console.log(activeThumb, newValue[0], newValue[1]);
    if (activeThumb === 0) {
      const clamped = Math.min(newValue[0], 100 - minVolumeDistance);

      setVolumeValue([
        Math.floor(clamped),
        Math.floor(clamped) + minVolumeDistance,
      ]);
    } else {
      const clamped = Math.max(newValue[1], minVolumeDistance);

      setVolumeValue([
        Math.floor(clamped) - minVolumeDistance,
        Math.floor(clamped),
      ]);
    }
  };

  return (
    <>
      {isQuantProject && (
        <div className={stepperClasses.root}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  classes={{
                    root: stepperClasses.step,
                    active: stepperClasses.active,
                    alternativeLabel: stepperClasses.alternativeLabel,
                  }}
                >
                  {t(label)}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>
      )}
      <Grid
        container
        justifyContent="center"
        alignItems="stretch"
        style={{ marginTop: "20px" }}
      >
        {isModelReady && isPlanReady ? (
          <Grid
            xs={8}
            item
            container
            justifyContent="center"
            alignItems="stretch"
            style={{ marginTop: "20px" }}
          >
            {activeStep !== 2 && (
              <Grid
                container
                item
                xs={12}
                justifyContent="center"
                style={{ marginBottom: "20px" }}
              >
                {user.language == "ko"
                  ? `마켓 서비스: ${modelData.name_kr}`
                  : `Market Service: ${modelData.name_en}`}
              </Grid>
            )}
            <Grid container item xs={12}>
              {isLoading == true ? (
                <Grid
                  container
                  justifyContent="center"
                  alignItems="center"
                  item
                  xs={12}
                  style={{ minHeight: "400px" }}
                >
                  <div className={classes.loading} style={{ height: "300px" }}>
                    {t("Loading")}
                    <CircularProgress />
                  </div>
                </Grid>
              ) : (
                <Grid container item xs={12}>
                  <Grid container item xs={12}>
                    {isQuantProject && activeStep === 0 && (
                      <Grid item>
                        <span
                          style={{
                            fontSize: "22px",
                            color: "var(--textWhite)",
                            fontWeight: 600,
                          }}
                        >
                          {t("Project Information")}
                        </span>
                      </Grid>
                    )}
                    {(!isQuantProject || activeStep === 0) && (
                      <>
                        <Grid
                          container
                          item
                          xs={12}
                          justifyContent="center"
                          style={{ marginBottom: "20px" }}
                        >
                          <InputBase
                            className={classes.marketInput}
                            style={{
                              marginTop: "10px",
                              borderBottom: "2px solid #999999",
                              color: "var(--textWhite)",
                              width: "100%",
                              fontSize: "16px",
                            }}
                            autoFocus
                            value={projectNameValue}
                            onChange={changeProjectNameValue}
                            placeholder={t("Please enter a project name.*")}
                            id="projectNameInput"
                          />
                        </Grid>
                        <Grid
                          container
                          item
                          xs={12}
                          justifyContent="center"
                          style={{ marginBottom: "30px" }}
                        >
                          <InputBase
                            className={classes.marketInput}
                            style={{
                              borderBottom: "2px solid #999999",
                              color: "var(--textWhite)",
                              width: "100%",
                              fontSize: "16px",
                            }}
                            value={projectDescriptionValue}
                            onChange={changeProjectDescriptionValue}
                            placeholder={t("Please enter a project description.")}
                            id="projectDescriptionInput"
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                  {isQuantProject ? (
                    <>
                      {activeStep === 0 ? (
                        <Grid container>
                          <Grid item xs={12}>
                            <Grid container direction="column">
                              <Grid item style={{ margin: "36px 0 24px" }}>
                                <span
                                  style={{
                                    fontSize: "22px",
                                    color: "var(--textWhite)",
                                    fontWeight: 600,
                                  }}
                                >
                                  {t("Artificial Intelligence Development Conditions")}
                                </span>
                              </Grid>
                              <Grid item style={{ marginBottom: "24px" }}>
                                <FormControl component="fieldset">
                                  <FormLabel
                                    component="legend"
                                    style={{
                                      marginRight: "12px",
                                      fontSize: "20px",
                                      color: "var(--textWhite)",
                                      fontWeight: 600,
                                      paddingLeft: "16px",
                                    }}
                                  >
                                    {t("how to learn")}
                                  </FormLabel>
                                  <RadioGroup
                                    aria-label="training_method"
                                    name="controlled-radio-buttons-group"
                                    value={trainingMethod}
                                    onChange={(e) =>
                                      setTrainingMethod(e.target.value)
                                    }
                                    row
                                    style={{ padding: "0 24px" }}
                                  >
                                    {trainingMethodArr.map((v, i) => (
                                      <FormControlLabel
                                        value={v.value}
                                        control={<Radio color="primary" />}
                                        label={v.name}
                                        disabled={i > 1}
                                      />
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                              </Grid>
                              <Grid item style={{ marginBottom: "24px" }}>
                                <FormControl component="fieldset">
                                  <FormLabel
                                    component="legend"
                                    style={{
                                      marginRight: "12px",
                                      fontSize: "20px",
                                      color: "var(--textWhite)",
                                      fontWeight: 600,
                                      paddingLeft: "16px",
                                    }}
                                  >
                                    {t("stock type")}
                                  </FormLabel>
                                  <RadioGroup
                                    aria-label="stock_type"
                                    name="controlled-radio-buttons-group"
                                    value={stockType}
                                    onChange={(e) =>
                                      setStockType(e.target.value)
                                    }
                                    row
                                    style={{ padding: "0 24px" }}
                                  >
                                    {stockTypeArr.map((v) => (
                                      <FormControlLabel
                                        value={v.value}
                                        control={<Radio color="primary" />}
                                        label={v.name}
                                      />
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                              </Grid>
                              <Grid item style={{ marginBottom: "24px" }}>
                                <Grid container>
                                  <Grid
                                    item
                                    xs={12}
                                    style={{ marginBottom: "24px" }}
                                  >
                                    <span
                                      style={{
                                        marginRight: "12px",
                                        fontSize: "20px",
                                        color: "var(--textWhite)",
                                        fontWeight: 600,
                                        paddingLeft: "16px",
                                      }}
                                    >
                                      {t("period setting")}
                                    </span>
                                  </Grid>
                                  <Grid
                                    item
                                    xs={12}
                                    lg={5}
                                    style={{ padding: "0 24px" }}
                                  >
                                    <Grid container alignItems="center">
                                      <Grid
                                        item
                                        style={{ marginRight: "45px" }}
                                      >
                                        {t("starting point")} :
                                      </Grid>
                                      <Grid item>
                                        <TextField
                                          id="datetime-local"
                                          variant="standard"
                                          type="datetime-local"
                                          // defaultValue="2017-05-24T10:30"
                                          onChange={(e) =>
                                            setStartTime(e.target.value)
                                          }
                                          value={startTime}
                                          sx={{ width: 250 }}
                                          InputLabelProps={{
                                            shrink: true,
                                          }}
                                          InputProps={{
                                            style: {
                                              color: "white",
                                            },
                                          }}
                                        />
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid
                                    item
                                    xs={12}
                                    lg={5}
                                    style={{ padding: "0 24px" }}
                                  >
                                    <Grid container alignItems="center">
                                      <Grid
                                        item
                                        style={{ marginRight: "45px" }}
                                      >
                                        {t("end point")} :
                                      </Grid>
                                      <Grid item>
                                        <TextField
                                          id="datetime-local"
                                          variant="standard"
                                          type="datetime-local"
                                          // defaultValue="2017-05-24T10:30"
                                          onChange={(e) =>
                                            setEndTime(e.target.value)
                                          }
                                          value={endTime}
                                          sx={{ width: 250 }}
                                          InputLabelProps={{
                                            shrink: true,
                                          }}
                                          InputProps={{
                                            style: {
                                              color: "white",
                                            },
                                          }}
                                        />
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                              <Grid item style={{ marginBottom: "24px" }}>
                                <Grid container alignItems="center">
                                  <Grid item>
                                    <span
                                      style={{
                                        marginRight: "36px",
                                        fontSize: "20px",
                                        color: "var(--textWhite)",
                                        fontWeight: 600,
                                        paddingLeft: "16px",
                                      }}
                                    >
                                      {t("time memory")}
                                    </span>
                                  </Grid>
                                  <Grid item>
                                    <TextField
                                      type="number"
                                      variant="standard"
                                      onChange={(e) =>
                                        setTimeMemory(e.target.value)
                                      }
                                      value={timeMemory}
                                      inputProps={{
                                        style: {
                                          color: "white",
                                          fontWeight: "400",
                                          borderColor: "white",
                                          paddingLeft: "10px",
                                          boxSizing: "border-box",
                                        },
                                      }}
                                      style={{
                                        width: "80px",
                                        marginRight: "12px",
                                      }}
                                    />
                                  </Grid>
                                  <Grid item>
                                    <Tooltip
                                      title={t(
                                        "얼마나 많은 과거 데이터를 함께 학습할건지 설정합니다."
                                      )}
                                      placement="right"
                                    >
                                      <HelpIcon className="cursorPointer" />
                                    </Tooltip>
                                  </Grid>
                                </Grid>
                              </Grid>

                              <Box
                                component="div"
                                style={{
                                  padding: "12px 12px 24px",
                                  border: "1px solid var(--textWhite6)",
                                  borderRadius: "4px",
                                  margin: "20px 16px 50px",
                                }}
                              >
                                <Grid item>
                                  <FormControl
                                    component="div"
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                    }}
                                  >
                                    <FormLabel
                                      component="span"
                                      style={{
                                        display: "inline-block",
                                        paddingLeft: "16px",
                                        fontSize: "14px",
                                        color: "var(--textWhite)",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {t("Setting conditions")} :
                                    </FormLabel>
                                    <RadioGroup
                                      aria-label="setting_condition"
                                      name="controlled-radio-buttons-group"
                                      value={settingCondition}
                                      onChange={(e) => {
                                        setSettingCondition(e.target.value);
                                        setIsDisplaySearchedLists(false);
                                      }}
                                      row
                                      style={{ padding: "0 10px" }}
                                    >
                                      <FormControlLabel
                                        value="direct"
                                        control={
                                          <Radio color="primary" size="small" />
                                        }
                                        label={
                                          <span style={{ fontSize: "14px" }}>
                                            {t("Custom")}
                                          </span>
                                        }
                                        sx={{
                                          margin: "0 10px 0 0",
                                        }}
                                      />
                                      <FormControlLabel
                                        value="boundary"
                                        control={
                                          <Radio color="primary" size="small" />
                                        }
                                        label={
                                          <span style={{ fontSize: "14px" }}>
                                            {t("Boundary settings")}
                                          </span>
                                        }
                                        sx={{ margin: 0 }}
                                      />
                                    </RadioGroup>
                                  </FormControl>
                                </Grid>

                                {settingCondition === "direct" ? (
                                  <Grid item>
                                    <Grid container alignItems="flex-start">
                                      <Grid item>
                                        <span
                                          style={{
                                            fontSize: "20px",
                                            color: "var(--textWhite)",
                                            fontWeight: 600,
                                            paddingLeft: "16px",
                                          }}
                                        >
                                          {t("")}
                                        </span>
                                      </Grid>
                                      <Grid item>
                                        <Grid container direction="column">
                                          <Grid item>
                                            <Grid container alignItems="center">
                                              <Grid
                                                item
                                                xs
                                                style={{
                                                  position: "relative",
                                                  width: "400px",
                                                }}
                                              >
                                                <TextField
                                                  variant="standard"
                                                  placeholder={t(
                                                    "검색할 symbol 또는 기업명을 입력해주세요."
                                                  )}
                                                  fullWidth
                                                  InputProps={{
                                                    style: {
                                                      height: "35px",
                                                      fontSize: "16px",
                                                      color: "var(--textGrey)",
                                                      marginLeft: "16px",
                                                      padding: "0 10px",
                                                      position: "absolute",
                                                      top: 0,
                                                      left: 0,
                                                      zIndex: 9999,
                                                    },
                                                  }}
                                                  style={{ paddingTop: "0" }}
                                                  value={searchedTickerValue}
                                                  onChange={
                                                    onChangeSearchTickerLists
                                                  }
                                                />
                                                {isDisplaySearchedLists && (
                                                  <>
                                                    <CancelIcon
                                                      fontSize="small"
                                                      onClick={
                                                        resetSearchedTickerValue
                                                      }
                                                      style={{
                                                        position: "absolute",
                                                        top: "50%",
                                                        right: "-16px",
                                                        transform:
                                                          "translateY(-50%)",
                                                        cursor: "pointer",
                                                        zIndex: 9999,
                                                      }}
                                                    />
                                                    <Box
                                                      component="div"
                                                      style={{
                                                        position: "absolute",
                                                        top:
                                                          "calc(100% + 10px)",
                                                        left: "16px",
                                                        zIndex: 9999,
                                                      }}
                                                    >
                                                      <List
                                                        className={
                                                          classes.dashboardMain
                                                        }
                                                        sx={{
                                                          width: "400px",
                                                          minHeight: 0,
                                                          maxHeight: "300px",
                                                          overflowY: "auto",
                                                          paddingBottom:
                                                            searchedTickersInfoArr.length >
                                                            0
                                                              ? "36px"
                                                              : null,
                                                        }}
                                                      >
                                                        {searchedTickersInfoArr && (
                                                          <>
                                                            {searchedTickersInfoArr.length >
                                                            0 ? (
                                                              <>
                                                                <Box
                                                                  component="div"
                                                                  style={{
                                                                    textAlign:
                                                                      "right",
                                                                  }}
                                                                >
                                                                  <Button
                                                                    variant="text"
                                                                    endIcon={
                                                                      isMarketCapDesc ? (
                                                                        <KeyboardArrowUpIcon />
                                                                      ) : (
                                                                        <KeyboardArrowDownIcon />
                                                                      )
                                                                    }
                                                                    style={{
                                                                      color:
                                                                        "var(--textWhite87)",
                                                                      marginRight:
                                                                        "12px",
                                                                      padding:
                                                                        "0 8px",
                                                                    }}
                                                                    onClick={
                                                                      reverseMarketCapDesc
                                                                    }
                                                                  >
                                                                    {/* {t(
                                                                isMarketCapDesc
                                                                  ? "Market Cap 기준 오름차순 정렬"
                                                                  : "Market Cap 기준 내림차순 정렬"
                                                              )} */}
                                                                    {t(
                                                                      isMarketCapDesc
                                                                        ? "오름차순 정렬"
                                                                        : "내림차순 정렬"
                                                                    )}
                                                                  </Button>
                                                                </Box>
                                                                {searchedTickersInfoArr.map(
                                                                  (v) => {
                                                                    const labelId = `checkbox-list-label-${v}`;

                                                                    return (
                                                                      <ListItem
                                                                        key={
                                                                          v.symbol
                                                                        }
                                                                        disablePadding
                                                                        style={{
                                                                          padding:
                                                                            "2px 16px",
                                                                        }}
                                                                      >
                                                                        <ListItemButton
                                                                          onClick={() =>
                                                                            handleToggleTickerChecked(
                                                                              v.symbol
                                                                            )
                                                                          }
                                                                          dense
                                                                        >
                                                                          <ListItemIcon
                                                                            style={{
                                                                              minWidth:
                                                                                "35px",
                                                                            }}
                                                                          >
                                                                            <Checkbox
                                                                              checked={
                                                                                v.checked
                                                                              }
                                                                              disableRipple
                                                                              inputProps={{
                                                                                "aria-labelledby": labelId,
                                                                              }}
                                                                              size="small"
                                                                            />
                                                                          </ListItemIcon>
                                                                          <ListItemText
                                                                            id={
                                                                              labelId
                                                                            }
                                                                            // primary={`${v.name} (${v.symbol})`}
                                                                          >
                                                                            <span
                                                                              style={{
                                                                                fontWeight: 600,
                                                                              }}
                                                                            >
                                                                              {
                                                                                v.symbol
                                                                              }
                                                                            </span>
                                                                            <span>
                                                                              {` (
                                                                          ${v.name}
                                                                          )`}
                                                                            </span>
                                                                          </ListItemText>
                                                                        </ListItemButton>
                                                                      </ListItem>
                                                                    );
                                                                  }
                                                                )}
                                                              </>
                                                            ) : (
                                                              <span
                                                                style={{
                                                                  padding:
                                                                    "10px 20px",
                                                                  fontSize:
                                                                    "14px",
                                                                }}
                                                              >
                                                                {t(
                                                                  "검색 결과가 없습니다."
                                                                )}
                                                              </span>
                                                            )}
                                                          </>
                                                        )}
                                                      </List>
                                                    </Box>
                                                    <Box
                                                      component="div"
                                                      className="date_picker_overlay"
                                                      style={{
                                                        position: "fixed",
                                                        top: 0,
                                                        left: 0,
                                                        zIndex: 9998,
                                                        width: "100vw",
                                                        height: "100vh",
                                                      }}
                                                      onClick={() =>
                                                        setIsDisplaySearchedLists(
                                                          false
                                                        )
                                                      }
                                                    />
                                                  </>
                                                )}
                                              </Grid>
                                              {/* <Grid item>
                                              <span
                                                className="cursorPointer"
                                                // onClick={() => handleFactorConditionDialogOpen(targetInfo)}
                                                style={{
                                                  display: "inline-block",
                                                  width: "auto",
                                                  fontSize: "16px",
                                                  textDecoration: "underline",
                                                  color: "var(--mainSub)",
                                                  margin: "0 16px 0",
                                                }}
                                              >
                                                {t("Search options")}
                                              </span>
                                            </Grid> */}
                                              <Grid
                                                item
                                                style={{ marginLeft: "24px" }}
                                              >
                                                <Tooltip
                                                  title={t(
                                                    "특정 ticker를 선택하지 않을 경우 전체 ticker로 반영됩니다."
                                                  )}
                                                  placement="right"
                                                >
                                                  <HelpIcon className="cursorPointer" />
                                                </Tooltip>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                          {tickers.length > 0 && (
                                            <Grid
                                              item
                                              style={{ margin: "16px" }}
                                            >
                                              <Stack
                                                direction="row"
                                                spacing={1}
                                              >
                                                {tickers.map((v, i) => (
                                                  <Chip
                                                    key={v}
                                                    label={v}
                                                    onDelete={() =>
                                                      handleToggleTickerChecked(
                                                        v
                                                      )
                                                    }
                                                    style={{
                                                      backgroundColor:
                                                        "var(--gradientColor1)",
                                                      color:
                                                        "var(--textWhite87)",
                                                      fontWeight: 600,
                                                    }}
                                                    deleteIcon={
                                                      <CancelIcon
                                                        sx={{
                                                          fill:
                                                            "var(--textWhite87)",
                                                        }}
                                                      />
                                                    }
                                                  />
                                                ))}
                                              </Stack>
                                            </Grid>
                                          )}
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                ) : (
                                  <>
                                    <Grid item>
                                      <Grid container direction="column">
                                        <Grid item>
                                          <Grid container>
                                            <Grid
                                              item
                                              style={{
                                                margin: "0 16px 16px",
                                                fontSize: "20px",
                                                color: "var(--textWhite)",
                                                fontWeight: 600,
                                              }}
                                            >
                                              Volume
                                            </Grid>
                                            <Grid item>
                                              <span
                                                style={{ fontSize: "14px" }}
                                              >
                                                {user.language === "ko"
                                                  ? `볼륨이 ${
                                                      volumeValue[0]
                                                    }% 이하, ${
                                                      volumeValue[1]
                                                    }% 이상인 ticker 제외`
                                                  : ``}
                                              </span>
                                            </Grid>
                                          </Grid>
                                        </Grid>
                                        <Grid item>
                                          <Grid
                                            container
                                            justifyContent="center"
                                          >
                                            <Grid item xs={11}>
                                              <Slider
                                                getAriaLabel={() =>
                                                  "Minimum distance shift"
                                                }
                                                value={volumeValue}
                                                onChange={handleVolumeChange}
                                                valueLabelDisplay="auto"
                                                valueLabelFormat={(value) =>
                                                  `${value}%`
                                                }
                                                disableSwap
                                                min={0}
                                                max={100}
                                                step={0.0001}
                                              />
                                            </Grid>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                    <Grid item>
                                      <List
                                        sx={{
                                          width: "100%",
                                          padding: 0,
                                        }}
                                        component="div"
                                      >
                                        <ListItemButton
                                          onClick={() =>
                                            setFactorsOpen(!factorsOpen)
                                          }
                                        >
                                          <ListItemText
                                            primary={
                                              <span
                                                style={{
                                                  marginRight: "12px",
                                                  fontSize: "20px",
                                                  color: "var(--textWhite)",
                                                  fontWeight: 600,
                                                }}
                                              >
                                                Factors
                                              </span>
                                            }
                                          />
                                          {factorsOpen ? (
                                            <ExpandLess />
                                          ) : (
                                            <ExpandMore />
                                          )}
                                        </ListItemButton>
                                        <Collapse
                                          in={factorsOpen}
                                          timeout="auto"
                                          unmountOnExit
                                        >
                                          <Grid
                                            container
                                            direction="column"
                                            style={{ paddingLeft: "16px" }}
                                          >
                                            <Grid
                                              item
                                              style={{
                                                marginBottom: "24px",
                                                paddingLeft: "16px",
                                              }}
                                            >
                                              <Grid
                                                container
                                                direction="column"
                                              >
                                                <Grid item xs={12}>
                                                  <Grid
                                                    container
                                                    alignItems="center"
                                                  >
                                                    <span
                                                      style={{
                                                        marginRight: "12px",
                                                        fontSize: "18px",
                                                        color:
                                                          "var(--textWhite)",
                                                        fontWeight: 500,
                                                      }}
                                                    >
                                                      Financials
                                                    </span>
                                                    <FormControlLabel
                                                      control={
                                                        <Switch
                                                          checked={
                                                            isCheckedFactorsCategory[
                                                              "financials"
                                                            ]
                                                          }
                                                          color="primary"
                                                          inputProps={{
                                                            "aria-label":
                                                              "primary checkbox",
                                                          }}
                                                          onChange={(e) =>
                                                            onChangeFactorsCategoryChecked(
                                                              e,
                                                              "financials"
                                                            )
                                                          }
                                                        />
                                                      }
                                                      label=""
                                                      sx={{ margin: 0 }}
                                                    />
                                                  </Grid>
                                                </Grid>
                                                <Grid item xs>
                                                  <Grid container>
                                                    <List
                                                      sx={{
                                                        width: "100%",
                                                        padding: 0,
                                                      }}
                                                      component="div"
                                                    >
                                                      {Object.keys(
                                                        factors["financials"]
                                                          .data
                                                      ).map((key) => (
                                                        <>
                                                          <ListItemButton
                                                            onClick={() =>
                                                              handleListClick(
                                                                "financials",
                                                                key,
                                                                listOpenObj[
                                                                  "financials"
                                                                ][key]
                                                              )
                                                            }
                                                          >
                                                            <ListItemText
                                                              primary={
                                                                factors[
                                                                  "financials"
                                                                ].data[key].name
                                                              }
                                                            />
                                                            {listOpenObj[
                                                              "financials"
                                                            ][key] ? (
                                                              <ExpandLess />
                                                            ) : (
                                                              <ExpandMore />
                                                            )}
                                                          </ListItemButton>
                                                          <Collapse
                                                            in={
                                                              listOpenObj[
                                                                "financials"
                                                              ][key]
                                                            }
                                                            timeout="auto"
                                                            unmountOnExit
                                                          >
                                                            <Grid
                                                              container
                                                              style={{
                                                                padding:
                                                                  "6px 24px",
                                                                maxHeight:
                                                                  "300px",
                                                                overflowY:
                                                                  "auto",
                                                              }}
                                                            >
                                                              {Object.keys(
                                                                factors[
                                                                  "financials"
                                                                ].data[key].data
                                                              ).map((k, i) => (
                                                                <Grid
                                                                  key={k + i}
                                                                  item
                                                                  xs={12}
                                                                  xl={6}
                                                                >
                                                                  <Grid
                                                                    container
                                                                    alignItems="baseline"
                                                                    wrap="nowrap"
                                                                  >
                                                                    <Grid
                                                                      item
                                                                      xs={10}
                                                                    >
                                                                      <FormControlLabel
                                                                        control={
                                                                          <Switch
                                                                            checked={
                                                                              factors[
                                                                                "financials"
                                                                              ]
                                                                                .data[
                                                                                key
                                                                              ]
                                                                                .data[
                                                                                k
                                                                              ]
                                                                                .checked
                                                                            }
                                                                            color="primary"
                                                                            inputProps={{
                                                                              "aria-label":
                                                                                "primary checkbox",
                                                                            }}
                                                                            onChange={(
                                                                              e
                                                                            ) => {
                                                                              onChangeEachFactorChecked(
                                                                                e,
                                                                                "financials",
                                                                                key,
                                                                                k
                                                                              );
                                                                            }}
                                                                          />
                                                                        }
                                                                        label={
                                                                          factors[
                                                                            "financials"
                                                                          ]
                                                                            .data[
                                                                            key
                                                                          ]
                                                                            .data[
                                                                            k
                                                                          ].name
                                                                        }
                                                                        style={{
                                                                          margin:
                                                                            "6px 0",
                                                                        }}
                                                                      />
                                                                    </Grid>
                                                                    {/* <FactorConditionOpenBtn
                                                                      targetInfo={{
                                                                        key1:
                                                                          "financials",
                                                                        key2: key,
                                                                        key3: k,
                                                                      }}
                                                                    /> */}
                                                                  </Grid>
                                                                  {renderEachFactorCondition(
                                                                    "financials",
                                                                    key,
                                                                    k
                                                                  )}
                                                                </Grid>
                                                              ))}
                                                            </Grid>
                                                          </Collapse>
                                                        </>
                                                      ))}
                                                    </List>
                                                  </Grid>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                            <Grid
                                              item
                                              style={{
                                                marginBottom: "24px",
                                                paddingLeft: "16px",
                                              }}
                                            >
                                              <Grid
                                                container
                                                direction="column"
                                              >
                                                <Grid item xs={12}>
                                                  <Grid
                                                    container
                                                    alignItems="center"
                                                  >
                                                    <span
                                                      style={{
                                                        marginRight: "12px",
                                                        fontSize: "18px",
                                                        color:
                                                          "var(--textWhite)",
                                                        fontWeight: 500,
                                                      }}
                                                    >
                                                      Analysis
                                                    </span>
                                                    <FormControlLabel
                                                      control={
                                                        <Switch
                                                          checked={
                                                            isCheckedFactorsCategory[
                                                              "analysis"
                                                            ]
                                                          }
                                                          color="primary"
                                                          inputProps={{
                                                            "aria-label":
                                                              "primary checkbox",
                                                          }}
                                                          onChange={(e) =>
                                                            onChangeFactorsCategoryChecked(
                                                              e,
                                                              "analysis"
                                                            )
                                                          }
                                                        />
                                                      }
                                                      label=""
                                                      sx={{ margin: 0 }}
                                                    />
                                                  </Grid>
                                                </Grid>
                                                <Grid item xs>
                                                  <Grid container>
                                                    <List
                                                      sx={{
                                                        width: "100%",
                                                        padding: 0,
                                                      }}
                                                      component="div"
                                                    >
                                                      {Object.keys(
                                                        factors["analysis"].data
                                                      ).map((key, i) => (
                                                        <div key={key + i}>
                                                          <ListItemButton
                                                            onClick={() =>
                                                              handleListClick(
                                                                "analysis",
                                                                key,
                                                                listOpenObj[
                                                                  "analysis"
                                                                ][key]
                                                              )
                                                            }
                                                          >
                                                            <ListItemText
                                                              primary={
                                                                factors[
                                                                  "analysis"
                                                                ].data[key].name
                                                              }
                                                            />
                                                            {listOpenObj[
                                                              "analysis"
                                                            ][key] ? (
                                                              <ExpandLess />
                                                            ) : (
                                                              <ExpandMore />
                                                            )}
                                                          </ListItemButton>
                                                          <Collapse
                                                            in={
                                                              listOpenObj[
                                                                "analysis"
                                                              ][key]
                                                            }
                                                            timeout="auto"
                                                            unmountOnExit
                                                          >
                                                            <Grid
                                                              container
                                                              style={{
                                                                padding:
                                                                  "6px 24px",
                                                                maxHeight:
                                                                  "300px",
                                                                overflowY:
                                                                  "auto",
                                                              }}
                                                            >
                                                              {Object.keys(
                                                                factors[
                                                                  "analysis"
                                                                ].data[key].data
                                                              ).map((k, i) => (
                                                                <Grid
                                                                  key={k + i}
                                                                  item
                                                                  xs={12}
                                                                  lg={6}
                                                                  xl={4}
                                                                >
                                                                  <Grid
                                                                    container
                                                                    alignItems="baseline"
                                                                    wrap="nowrap"
                                                                  >
                                                                    <Grid
                                                                      item
                                                                      xs={10}
                                                                    >
                                                                      <FormControlLabel
                                                                        control={
                                                                          <Switch
                                                                            checked={
                                                                              factors[
                                                                                "analysis"
                                                                              ]
                                                                                .data[
                                                                                key
                                                                              ]
                                                                                .data[
                                                                                k
                                                                              ]
                                                                                .checked
                                                                            }
                                                                            color="primary"
                                                                            inputProps={{
                                                                              "aria-label":
                                                                                "primary checkbox",
                                                                            }}
                                                                            onChange={(
                                                                              e
                                                                            ) => {
                                                                              onChangeEachFactorChecked(
                                                                                e,
                                                                                "analysis",
                                                                                key,
                                                                                k
                                                                              );
                                                                            }}
                                                                          />
                                                                        }
                                                                        label={
                                                                          factors[
                                                                            "analysis"
                                                                          ]
                                                                            .data[
                                                                            key
                                                                          ]
                                                                            .data[
                                                                            k
                                                                          ].name
                                                                        }
                                                                        style={{
                                                                          margin:
                                                                            "6px 0",
                                                                        }}
                                                                      />
                                                                    </Grid>
                                                                    {/* <FactorConditionOpenBtn
                                                                      targetInfo={{
                                                                        key1:
                                                                          "analysis",
                                                                        key2: key,
                                                                        key3: k,
                                                                      }}
                                                                    /> */}
                                                                  </Grid>
                                                                  {renderEachFactorCondition(
                                                                    "analysis",
                                                                    key,
                                                                    k
                                                                  )}
                                                                </Grid>
                                                              ))}
                                                            </Grid>
                                                          </Collapse>
                                                        </div>
                                                      ))}
                                                    </List>
                                                  </Grid>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                            <Grid
                                              item
                                              style={{
                                                marginBottom: "24px",
                                                paddingLeft: "16px",
                                              }}
                                            >
                                              <Grid
                                                container
                                                direction="column"
                                              >
                                                <Grid item xs={12}>
                                                  <Grid
                                                    container
                                                    alignItems="center"
                                                  >
                                                    <span
                                                      style={{
                                                        display: "Block",
                                                        marginRight: "12px",
                                                        marginBottom: "12px",
                                                        fontSize: "18px",
                                                        color:
                                                          "var(--textWhite)",
                                                        fontWeight: 500,
                                                      }}
                                                    >
                                                      Holders
                                                    </span>
                                                    <FormControlLabel
                                                      control={
                                                        <Switch
                                                          checked={
                                                            isCheckedFactorsCategory[
                                                              "holders"
                                                            ]
                                                          }
                                                          color="primary"
                                                          inputProps={{
                                                            "aria-label":
                                                              "primary checkbox",
                                                          }}
                                                          onChange={(e) =>
                                                            onChangeFactorsCategoryChecked(
                                                              e,
                                                              "holders"
                                                            )
                                                          }
                                                        />
                                                      }
                                                      label=""
                                                      sx={{ marginLeft: 0 }}
                                                    />
                                                  </Grid>
                                                </Grid>
                                                <Grid item xs>
                                                  <Grid container>
                                                    {Object.keys(
                                                      factors["holders"].data
                                                    ).map((key, i) => (
                                                      <Grid
                                                        key={key + i}
                                                        item
                                                        xs={12}
                                                        lg={6}
                                                        xl={4}
                                                      >
                                                        <Grid
                                                          container
                                                          alignItems="baseline"
                                                          wrap="nowrap"
                                                        >
                                                          <Grid item xs={10}>
                                                            <FormControlLabel
                                                              control={
                                                                <Switch
                                                                  checked={
                                                                    factors[
                                                                      "holders"
                                                                    ].data[key]
                                                                      .checked
                                                                  }
                                                                  color="primary"
                                                                  inputProps={{
                                                                    "aria-label":
                                                                      "primary checkbox",
                                                                  }}
                                                                  onChange={(
                                                                    e
                                                                  ) => {
                                                                    onChangeEachFactorChecked(
                                                                      e,
                                                                      "holders",
                                                                      key
                                                                    );
                                                                  }}
                                                                />
                                                              }
                                                              label={
                                                                factors[
                                                                  "holders"
                                                                ].data[key].name
                                                              }
                                                              style={{
                                                                margin: "6px 0",
                                                              }}
                                                            />
                                                          </Grid>
                                                          {/* <FactorConditionOpenBtn
                                                            targetInfo={{
                                                              key1: "holders",
                                                              key2: key,
                                                            }}
                                                          /> */}
                                                        </Grid>
                                                        {renderEachFactorCondition(
                                                          "holders",
                                                          key
                                                        )}
                                                      </Grid>
                                                    ))}
                                                  </Grid>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                            <Grid
                                              item
                                              style={{
                                                marginBottom: "24px",
                                                paddingLeft: "16px",
                                              }}
                                            >
                                              <Grid
                                                container
                                                direction="column"
                                              >
                                                <Grid item xs={12}>
                                                  <Grid
                                                    container
                                                    alignItems="center"
                                                  >
                                                    <span
                                                      style={{
                                                        display: "Block",
                                                        marginRight: "12px",
                                                        marginBottom: "12px",
                                                        fontSize: "18px",
                                                        color:
                                                          "var(--textWhite)",
                                                        fontWeight: 500,
                                                      }}
                                                    >
                                                      Sustainability
                                                    </span>
                                                    <FormControlLabel
                                                      control={
                                                        <Switch
                                                          checked={
                                                            isCheckedFactorsCategory[
                                                              "sustainability"
                                                            ]
                                                          }
                                                          color="primary"
                                                          inputProps={{
                                                            "aria-label":
                                                              "primary checkbox",
                                                          }}
                                                          onChange={(e) =>
                                                            onChangeFactorsCategoryChecked(
                                                              e,
                                                              "sustainability"
                                                            )
                                                          }
                                                        />
                                                      }
                                                      label=""
                                                      sx={{ marginLeft: 0 }}
                                                    />
                                                  </Grid>
                                                </Grid>
                                                <Grid item xs>
                                                  <Grid container>
                                                    {Object.keys(
                                                      factors["sustainability"]
                                                        .data
                                                    ).map((key, i) => (
                                                      <Grid
                                                        key={key + i}
                                                        item
                                                        xs={12}
                                                        lg={6}
                                                        xl={4}
                                                      >
                                                        <Grid
                                                          container
                                                          alignItems="baseline"
                                                          wrap="nowrap"
                                                        >
                                                          <Grid item xs={10}>
                                                            <FormControlLabel
                                                              control={
                                                                <Switch
                                                                  checked={
                                                                    factors[
                                                                      "sustainability"
                                                                    ].data[key]
                                                                      .checked
                                                                  }
                                                                  color="primary"
                                                                  inputProps={{
                                                                    "aria-label":
                                                                      "primary checkbox",
                                                                  }}
                                                                  onChange={(
                                                                    e
                                                                  ) => {
                                                                    onChangeEachFactorChecked(
                                                                      e,
                                                                      "sustainability",
                                                                      key
                                                                    );
                                                                  }}
                                                                />
                                                              }
                                                              label={
                                                                factors[
                                                                  "sustainability"
                                                                ].data[key].name
                                                              }
                                                              style={{
                                                                margin: "6px 0",
                                                              }}
                                                            />
                                                          </Grid>
                                                          <Grid item>
                                                            {/* <FactorConditionOpenBtn
                                                              targetInfo={{
                                                                key1:
                                                                  "sustainability",
                                                                key2: key,
                                                              }}
                                                            /> */}
                                                          </Grid>
                                                        </Grid>
                                                        {renderEachFactorCondition(
                                                          "sustainability",
                                                          key
                                                        )}
                                                      </Grid>
                                                    ))}
                                                  </Grid>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </Collapse>
                                      </List>
                                    </Grid>
                                    <Grid item>
                                      <List
                                        sx={{
                                          width: "100%",
                                          padding: 0,
                                        }}
                                        component="div"
                                      >
                                        <ListItemButton
                                          onClick={() =>
                                            setIndicesOpen(!indicesOpen)
                                          }
                                        >
                                          <ListItemText
                                            primary={
                                              <span
                                                style={{
                                                  marginRight: "12px",
                                                  fontSize: "20px",
                                                  color: "var(--textWhite)",
                                                  fontWeight: 600,
                                                }}
                                              >
                                                Indice
                                              </span>
                                            }
                                          />
                                          {indicesOpen ? (
                                            <ExpandLess />
                                          ) : (
                                            <ExpandMore />
                                          )}
                                        </ListItemButton>
                                        <Collapse
                                          in={indicesOpen}
                                          timeout="auto"
                                          unmountOnExit
                                        >
                                          <Grid
                                            container
                                            direction="column"
                                            style={{ paddingLeft: "16px" }}
                                          >
                                            <FormControl
                                              component="fieldset"
                                              variant="standard"
                                            >
                                              <Grid
                                                container
                                                style={{ padding: "0 36px" }}
                                              >
                                                {indices.map((v, i) => (
                                                  <Grid item xs={4} lg={2}>
                                                    <FormControlLabel
                                                      control={
                                                        <Checkbox
                                                          checked={v.checked}
                                                          onChange={(e) =>
                                                            onChangeEachCheckBox(
                                                              e,
                                                              i,
                                                              "indice"
                                                            )
                                                          }
                                                          value={v.name}
                                                          sx={{ mr: 1 }}
                                                        />
                                                      }
                                                      label={v.name}
                                                      key={v.name}
                                                      sx={{ mr: 4 }}
                                                    />
                                                  </Grid>
                                                ))}
                                              </Grid>
                                            </FormControl>
                                          </Grid>
                                        </Collapse>
                                      </List>
                                    </Grid>
                                    <Grid item>
                                      <List
                                        sx={{
                                          width: "100%",
                                          padding: 0,
                                        }}
                                        component="div"
                                      >
                                        <ListItemButton
                                          onClick={() =>
                                            setCommoditiesOpen(!commoditiesOpen)
                                          }
                                        >
                                          <ListItemText
                                            primary={
                                              <span
                                                style={{
                                                  marginRight: "12px",
                                                  fontSize: "20px",
                                                  color: "var(--textWhite)",
                                                  fontWeight: 600,
                                                }}
                                              >
                                                Commodity
                                              </span>
                                            }
                                          />
                                          {commoditiesOpen ? (
                                            <ExpandLess />
                                          ) : (
                                            <ExpandMore />
                                          )}
                                        </ListItemButton>
                                        <Collapse
                                          in={commoditiesOpen}
                                          timeout="auto"
                                          unmountOnExit
                                        >
                                          <Grid
                                            container
                                            direction="column"
                                            style={{ paddingLeft: "16px" }}
                                          >
                                            <FormControl
                                              component="fieldset"
                                              variant="standard"
                                            >
                                              <Grid
                                                container
                                                style={{ padding: "0 36px" }}
                                              >
                                                {commodities.map((v, i) => (
                                                  <Grid item xs={4} md={2}>
                                                    <FormControlLabel
                                                      control={
                                                        <Checkbox
                                                          checked={v.checked}
                                                          onChange={(e) =>
                                                            onChangeEachCheckBox(
                                                              e,
                                                              i,
                                                              "commodity"
                                                            )
                                                          }
                                                          value={v.name}
                                                          sx={{ mr: 1 }}
                                                        />
                                                      }
                                                      label={v.name}
                                                      key={v.name}
                                                      sx={{ mr: 4 }}
                                                    />
                                                  </Grid>
                                                ))}
                                              </Grid>
                                            </FormControl>
                                          </Grid>
                                        </Collapse>
                                      </List>
                                    </Grid>
                                    <Grid item style={{ marginBottom: "24px" }}>
                                      <Grid container direction="column">
                                        <FormControl
                                          component="fieldset"
                                          variant="standard"
                                        >
                                          <FormLabel
                                            component="legend"
                                            style={{
                                              marginRight: "12px",
                                              fontSize: "20px",
                                              color: "var(--textWhite)",
                                              fontWeight: 600,
                                              padding: "16px 16px 0",
                                            }}
                                          >
                                            Currency
                                          </FormLabel>
                                          <FormGroup
                                            style={{ paddingLeft: "36px" }}
                                            row
                                          >
                                            {currencies.map((v, i) => (
                                              <FormControlLabel
                                                control={
                                                  <Checkbox
                                                    checked={v.checked}
                                                    onChange={(e) =>
                                                      onChangeEachCheckBox(
                                                        e,
                                                        i,
                                                        "currency"
                                                      )
                                                    }
                                                    value={v.name}
                                                    sx={{ mr: 1 }}
                                                  />
                                                }
                                                label={v.name}
                                                key={v.name}
                                                sx={{ mr: 4 }}
                                              />
                                            ))}
                                          </FormGroup>
                                        </FormControl>
                                      </Grid>
                                    </Grid>
                                  </>
                                )}
                              </Box>

                              <Grid item style={{ marginBottom: "24px" }}>
                                <Grid container direction="column">
                                  <Grid item>
                                    <Grid container>
                                      <FormControl component="fieldset">
                                        <FormLabel
                                          component="legend"
                                          style={{
                                            marginRight: "12px",
                                            fontSize: "20px",
                                            color: "var(--textWhite)",
                                            fontWeight: 600,
                                            paddingLeft: "16px",
                                          }}
                                        >
                                          {t("Set the time of stock forecasting")}
                                        </FormLabel>
                                        <RadioGroup
                                          aria-label="stock_type"
                                          name="controlled-radio-buttons-group"
                                          value={goal}
                                          onChange={(e) =>
                                            setGoal(e.target.value)
                                          }
                                          row
                                          style={{ padding: "0 24px" }}
                                        >
                                          {goalsArr.map((v) => (
                                            <FormControlLabel
                                              value={v.value}
                                              control={
                                                <Radio color="primary" />
                                              }
                                              label={v.name}
                                              key={v.value}
                                            />
                                          ))}
                                        </RadioGroup>
                                      </FormControl>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>

                              <Grid item style={{ marginBottom: "45px" }}>
                                <Grid container alignItems="center">
                                  <Grid item>
                                    <span
                                      style={{
                                        marginRight: "20px",
                                        fontSize: "20px",
                                        color: "var(--textWhite6)",
                                        fontWeight: 600,
                                        paddingLeft: "16px",
                                      }}
                                    >
                                      {t("Using MLOps_Coming soon")}
                                    </span>
                                  </Grid>
                                  <Grid item>
                                    <Checkbox
                                      checked={isUsingMlops}
                                      onChange={(e) =>
                                        setIsUsingMlops(e.target.checked)
                                      }
                                      disabled
                                      sx={{
                                        "& .MuiSvgIcon-root": { fontSize: 28 },
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      ) : activeStep === 1 ? (
                        <Grid container justifyContent="center">
                          <Grid
                            item
                            xs={12}
                            xl={10}
                            style={{ marginBottom: "20px" }}
                          >
                            <Grid
                              container
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Grid item>
                                <span
                                  style={{
                                    fontSize: "20px",
                                    color: "var(--textWhite)",
                                    fontWeight: 500,
                                  }}
                                >
                                  {t("Backtest condition setting")}
                                </span>
                              </Grid>
                              <Grid item>
                                <Button
                                  id="startLabellingBtn"
                                  className={`${classes.defaultGreenOutlineButton} ${classes.neoBtnH32}`}
                                  onClick={addBacktestCondition}
                                  // disabled={isUnAbleToSeeStartBtn}
                                >
                                  {t("Add backtest +")}
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                          {backtestSettingArr.map((v, i) => (
                            <>
                              <Grid
                                item
                                xs={12}
                                xl={10}
                                style={{ margin: "0 12px 10px" }}
                              >
                                <Grid container alignItems="center">
                                  <span
                                    style={{
                                      fontSize: "18px",
                                      color: "var(--textWhite87)",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {t("backtest")} {i + 1}
                                  </span>
                                  {i > 0 && (
                                    <Button
                                      id="startLabellingBtn"
                                      className={`${classes.defaultDeleteButton}`}
                                      // disabled={isUnAbleToSeeStartBtn}
                                      onClick={() => removeBacktestCondition(i)}
                                      style={{
                                        width: "auto",
                                        fontSize: "12px",
                                        margin: "0 0 0 12px",
                                        borderWidth: "1px",
                                        minWidth: 0,
                                      }}
                                    >
                                      {t("Delete")}
                                    </Button>
                                  )}
                                </Grid>
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                xl={10}
                                style={{
                                  padding: "20px 40px",
                                  border: "1px solid var(--textWhite38)",
                                  borderRadius: "4px",
                                  fontSize: "15px",
                                  marginBottom: "24px",
                                }}
                              >
                                <Grid container spacing={2}>
                                  <Grid item xs={12}>
                                    <Grid container>
                                      <Grid
                                        item
                                        xs={4}
                                        style={{ marginRight: "16px" }}
                                      >
                                        <span>{t("period")}</span>
                                      </Grid>
                                      <Grid item xs>
                                        <Grid container>
                                          <Grid item>
                                            <Grid container alignItems="center">
                                              <Grid
                                                item
                                                style={{
                                                  marginRight: "16px",
                                                }}
                                              >
                                                {t("starting point")}:
                                              </Grid>
                                              <Grid item>
                                                <TextField
                                                  id="datetime-local"
                                                  variant="standard"
                                                  type="datetime-local"
                                                  // defaultValue="2017-05-24T10:30"
                                                  onChange={(e) =>
                                                    onChangeBacktestConditions(
                                                      e.target.value,
                                                      "period",
                                                      "start",
                                                      i
                                                    )
                                                  }
                                                  value={v.period.start}
                                                  sx={{ width: 250 }}
                                                  InputLabelProps={{
                                                    shrink: true,
                                                  }}
                                                  InputProps={{
                                                    style: {
                                                      color: "white",
                                                    },
                                                  }}
                                                />
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                          <Grid item>
                                            <Grid container alignItems="center">
                                              <Grid
                                                item
                                                style={{
                                                  marginRight: "16px",
                                                }}
                                              >
                                                {t("end point")}:
                                              </Grid>
                                              <Grid item>
                                                <TextField
                                                  id="datetime-local"
                                                  variant="standard"
                                                  type="datetime-local"
                                                  // defaultValue="2017-05-24T10:30"
                                                  onChange={(e) =>
                                                    onChangeBacktestConditions(
                                                      e.target.value,
                                                      "period",
                                                      "end",
                                                      i
                                                    )
                                                  }
                                                  value={v.period.end}
                                                  sx={{ width: 250 }}
                                                  InputLabelProps={{
                                                    shrink: true,
                                                  }}
                                                  InputProps={{
                                                    style: {
                                                      color: "white",
                                                    },
                                                  }}
                                                />
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Grid container>
                                      <Grid
                                        item
                                        xs={4}
                                        style={{ marginRight: "16px" }}
                                      >
                                        <span>
                                          {t("Number of items under management (up to 100)")}
                                        </span>
                                      </Grid>
                                      <Grid item xs>
                                        {renderNumberInput(
                                          v.stockItemCnt,
                                          0,
                                          100,
                                          "stockItemCnt",
                                          null,
                                          i
                                        )}{" "}
                                        {t("")}
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Grid container>
                                      <Grid
                                        item
                                        xs={4}
                                        style={{ marginRight: "16px" }}
                                      >
                                        <span>{t("Buy Timing")}</span>
                                      </Grid>
                                      <Grid item xs>
                                        {renderNumberInput(
                                          v.timingOfBuying.time,
                                          0,
                                          24,
                                          "timingOfBuying",
                                          "time",
                                          i
                                        )}
                                        {t("within time")}
                                        {renderNumberInput(
                                          v.timingOfBuying.amount,
                                          0,
                                          100,
                                          "timingOfBuying",
                                          "amount",
                                          i
                                        )}
                                        {t("% Increase")}
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Grid container>
                                      <Grid
                                        item
                                        xs={4}
                                        style={{ marginRight: "16px" }}
                                      >
                                        <span>{t("Sell Timing")}</span>
                                      </Grid>
                                      <Grid item xs>
                                        {renderNumberInput(
                                          v.timingOfSelling.time,
                                          0,
                                          24,
                                          "timingOfSelling",
                                          "time",
                                          i
                                        )}
                                        {t("within time")}
                                        {renderNumberInput(
                                          v.timingOfSelling.amount,
                                          0,
                                          100,
                                          "timingOfSelling",
                                          "amount",
                                          i
                                        )}
                                        {t("% drop")}
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  {/* <Grid item xs={12}>
                                      <Grid
                                        container={
                                          v.HPMSellTimingArr.length === 1
                                            ? "center"
                                            : "flex-start"
                                        }
                                      >
                                        <Grid
                                          item
                                          xs={4}
                                          style={{ marginRight: "16px" }}
                                        >
                                          <Grid container alignItems="center">
                                            <span>
                                              {t("Bond Selling Timing")}
                                            </span>
                                            <Button
                                              id="startLabellingBtn"
                                              className={`${classes.defaultGreenOutlineButton}`}
                                              onClick={() =>
                                                addHPMSellTimingCondition(i)
                                              }
                                              style={{
                                                width: "auto",
                                                fontSize: "12px",
                                                margin: "0 0 0 8px",
                                              }}
                                            >
                                              {t("Next")} +
                                            </Button>
                                          </Grid>
                                        </Grid>
                                        <Grid item xs>
                                          <Grid container direction="column">
                                            {v.HPMSellTimingArr.map(
                                              (HPMVal, HPMIdx) => (
                                                <Grid item key={HPMIdx}>
                                                  <Grid
                                                    container
                                                    alignItems="center"
                                                  >
                                                    <Grid
                                                      item
                                                      style={{
                                                        marginRight: "6px",
                                                      }}
                                                    >
                                                      {renderNumberInput(
                                                        v.HPMSellTimingArr[
                                                          HPMIdx
                                                        ].time,
                                                        0,
                                                        24,
                                                        "HPMSellTimingArr",
                                                        "time",
                                                        i,
                                                        HPMIdx
                                                      )}
                                                      {t("for time")}{" "}
                                                      {renderNumberInput(
                                                        v.HPMSellTimingArr[
                                                          HPMIdx
                                                        ].amount,
                                                        -100,
                                                        100,
                                                        "HPMSellTimingArr",
                                                        "amount",
                                                        i,
                                                        HPMIdx
                                                      )}
                                                      {t(
                                                        " % 이상 일 경우 매도"
                                                      )}
                                                    </Grid>
                                                    {HPMIdx > 0 && (
                                                      <RemoveCircleIcon
                                                        fontSize="small"
                                                        style={{
                                                          color:
                                                            "red !important",
                                                          cursor: "pointer",
                                                        }}
                                                        onClick={() =>
                                                          removeHPMSellTimingCondition(
                                                            i,
                                                            HPMIdx
                                                          )
                                                        }
                                                      />
                                                    )}
                                                  </Grid>
                                                </Grid>
                                              )
                                            )}
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Grid
                                        container
                                        alignItems={
                                          v.riskTimingArr.length === 1
                                            ? "center"
                                            : "flex-start"
                                        }
                                      >
                                        <Grid
                                          item
                                          xs={4}
                                          style={{ marginRight: "16px" }}
                                        >
                                          <Grid container alignItems="center">
                                            <span>
                                              {t("Risk Management Timing")}
                                            </span>
                                            <Button
                                              id="startLabellingBtn"
                                              className={`${classes.defaultGreenOutlineButton}`}
                                              onClick={() =>
                                                addRiskTimingCondition(i)
                                              }
                                              // disabled={isUnAbleToSeeStartBtn}
                                              style={{
                                                width: "auto",
                                                fontSize: "12px",
                                                marginLeft: "8px",
                                                margin: "0 0 0 8px",
                                              }}
                                            >
                                              {t("Next")} +
                                            </Button>
                                          </Grid>
                                        </Grid>
                                        <Grid item xs>
                                          {v.riskTimingArr.map(
                                            (riskVal, ristIdx) => (
                                              <Grid item key={ristIdx}>
                                                <Grid
                                                  container
                                                  alignItems="center"
                                                >
                                                  <Grid
                                                    item
                                                    style={{
                                                      marginRight: "6px",
                                                    }}
                                                  >
                                                    {renderNumberInput(
                                                      v.riskTimingArr[ristIdx],
                                                      -100,
                                                      100,
                                                      "riskTimingArr",
                                                      null,
                                                      i,
                                                      ristIdx
                                                    )}{" "}
                                                    {t(
                                                      " % 일 경우 무조건 매도"
                                                    )}
                                                  </Grid>
                                                  {ristIdx > 0 && (
                                                    <RemoveCircleIcon
                                                      fontSize="small"
                                                      style={{
                                                        color: "red !important",
                                                        cursor: "pointer",
                                                      }}
                                                      onClick={() =>
                                                        removeRiskTimingCondition(
                                                          i,
                                                          ristIdx
                                                        )
                                                      }
                                                    />
                                                  )}
                                                </Grid>
                                              </Grid>
                                            )
                                          )}
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Grid container>
                                        <Grid
                                          item
                                          xs={4}
                                          style={{ marginRight: "16px" }}
                                        >
                                          <span>{t("Minimum holding time")}</span>
                                        </Grid>
                                        <Grid item xs>
                                          {renderNumberInput(
                                            v.MinimumHoldingTime,
                                            0,
                                            24,
                                            "MinimumHoldingTime",
                                            null,
                                            i
                                          )}{" "}
                                          {t("hour")}
                                        </Grid>
                                      </Grid>
                                    </Grid> */}

                                  <Grid item xs={12}>
                                    <Grid container>
                                      <Grid
                                        item
                                        xs={4}
                                        style={{ marginRight: "16px" }}
                                      >
                                        <span>{t("risk management")}</span>
                                      </Grid>
                                      <Grid item xs>
                                        <Grid container direction="column">
                                          <Grid
                                            item
                                            style={{ marginBottom: "12px" }}
                                          >
                                            {renderNumberInput(
                                              v.riskManagement.escape,
                                              0,
                                              100,
                                              "riskManagement",
                                              "escape",
                                              i
                                            )}
                                            <span
                                              style={{ paddingLeft: "10px" }}
                                            >
                                              {t(
                                                "% 이상 내려갔을 경우 즉시 매도"
                                              )}
                                            </span>
                                          </Grid>
                                          <Grid
                                            item
                                            style={{ marginBottom: "12px" }}
                                          >
                                            {renderNumberInput(
                                              v.riskManagement.frozenEscapeHour,
                                              0,
                                              24,
                                              "riskManagement",
                                              "frozenEscapeHour",
                                              i
                                            )}
                                            <span
                                              style={{ paddingLeft: "10px" }}
                                            >
                                              {t(
                                                "시간 동안 변동없는 경우 매도"
                                              )}
                                            </span>
                                          </Grid>
                                          <Grid
                                            item
                                            style={{ marginBottom: "12px" }}
                                          >
                                            <span
                                              style={{ paddingRight: "10px" }}
                                            >
                                              {t("Minimum holding time")} {" : "}
                                            </span>
                                            {renderNumberInput(
                                              v.riskManagement.holdHour,
                                              0,
                                              24,
                                              "riskManagement",
                                              "holdHour",
                                              i
                                            )}{" "}
                                            {t("hour")}
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </>
                          ))}
                        </Grid>
                      ) : (
                        <Grid
                          container
                          justifyContent="center"
                          style={{ margin: "60px 0 80px" }}
                        >
                          <Grid item>
                            {t("Quant project creation is complete.")}
                          </Grid>
                        </Grid>
                      )}
                    </>
                  ) : (
                    <Grid
                      item
                      xs={12}
                      style={{
                        padding: "18px",
                        marginBottom: "25px",
                        border: "2px solid #999999",
                      }}
                    >
                      <FormControl component="fieldset">
                        <FormLabel component="legend">
                          {t("Maximum upload time per day")} &#42;
                        </FormLabel>
                        <RadioGroup
                          aria-label="dataCategory"
                          name="dataCategory"
                          value={dataCategory}
                          onChange={changeDataCategory}
                          row
                        >
                          {planData.map((plan) => (
                            <FormControlLabel
                              key={`${plan[0]}_hour_button`}
                              id={`${plan[0]}_hour_button`}
                              value={plan[0]}
                              control={<Radio color="primary" />}
                              label={`${plan[0]}${t("hour")}`}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  )}
                  <Grid
                    container
                    justifyContent="space-between"
                    item
                    xs={12}
                    xl={11}
                    style={{
                      marginBottom: "25px",
                    }}
                  >
                    {!isQuantProject && (
                      <>
                        <Grid
                          item
                          container
                          justifyContent="flex-end"
                          style={{
                            fontFamily: "Noto Sans KR",
                            fontSize: "18px",
                          }}
                        >
                          {`${t("Price")}: ${retailPrice.toLocaleString()}${
                            user.language == "ko"
                              ? `원/월 (최대 ${maxHour}시간, 시간당 ${perHourPrice}원)`
                              : `$/Month (Max ${maxHour}hour, Price/hour $${perHourPrice})`
                          }
                    `}
                        </Grid>
                        {isSelectedDiscount ? (
                          <Grid
                            xs={12}
                            container
                            item
                            justifyContent="flex-end"
                            style={{
                              fontSize: "12px",
                              color: "yellow",
                              paddingLeft: "5px",
                            }}
                          >
                            {t("Promotional discount applied") + " *"}
                          </Grid>
                        ) : (
                          <Grid style={{ height: "27px" }}></Grid>
                        )}
                      </>
                    )}
                    {isQuantProject ? (
                      <Grid container justifyContent="flex-end" spacing={2}>
                        <Grid item>
                          {activeStep < 2 && (
                            <Button
                              onClick={handleBack}
                              className={theme.defaultF0F0OutlineButton}
                            >
                              {activeStep === 0 ? t("Cancel") : t("뒤로가기")}
                            </Button>
                          )}
                        </Grid>
                        <Grid item>
                          <Button
                            className={theme.defaultF0F0OutlineButton}
                            onClick={handleNextStep}
                            style={
                              activeStep === steps.length - 1
                                ? { width: "200px" }
                                : {}
                            }
                          >
                            {activeStep === steps.length - 1
                              ? t("Go to project list")
                              : t("Next")}
                          </Button>
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container justifyContent="flex-end" spacing={2}>
                        <Grid item>
                          <Button
                            id="back_button"
                            className={classes.defaultF0F0OutlineButton}
                            onClick={() => {
                              props.history.goBack();
                            }}
                            style={{ minWidth: "150px", height: "30px" }}
                          >
                            {t("Cancel")}
                          </Button>
                        </Grid>
                        <Grid item>
                          <Button
                            id="create_project_button"
                            disabled={user.me == null}
                            className={
                              user.me == null
                                ? classes.defaultDisabledButton
                                : classes.defaultGreenOutlineButton
                            }
                            onClick={handleNext}
                            style={{
                              minWidth:
                                user.language === "ko" ? "150px" : "180px",
                              height: "30px",
                            }}
                          >
                            {user.me == null
                              ? t("Loading")
                              : isFirst
                              ? t("2 weeks free trial")
                              : t("Next")}
                          </Button>
                        </Grid>
                        {isFirst ? (
                          <Grid
                            xs={12}
                            container
                            item
                            justifyContent="flex-end"
                          >
                            <p
                              style={{
                                width:
                                  user.language === "ko" ? "150px" : "220px",
                                fontSize: "12px",
                                color: "var(--secondary1)",
                                textAlign: "right",
                              }}
                            >
                              {"* " +
                                t(
                                  "2주 무료 사용 후 자동으로 결제가 진행됩니다."
                                )}
                            </p>
                          </Grid>
                        ) : (
                          <></>
                        )}
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              )}
            </Grid>
            <Dialog
              open={isFactorConditionDialogOpen}
              onClose={handleFactorConditionDialogClose}
              style={{ minWidth: "360px" }}
              maxWidth="xs"
            >
              <DialogTitle style={{ color: "var(--textWhite87)" }}>
                {isEditFactorCondition === "edit"
                  ? t("Modifying the setting conditions")
                  : t("Setting conditions")}
              </DialogTitle>
              <DialogContent
                style={{ color: "var(--textWhite87)", minWidth: "400px" }}
              >
                {factorConditionType === "name" ? (
                  <form onSubmit={addIndustrySector}>
                    <TextField
                      autoFocus
                      fullWidth
                      variant="standard"
                      placeholder={t(
                        "산업군을 입력 후 엔터를 눌러 추가해주세요."
                      )}
                      value={industrySector}
                      onChange={onChangeIndustrySector}
                      inputProps={{
                        style: {
                          color: "var(--textWhite87)",
                          padding: "4px 8px",
                        },
                      }}
                      style={{ color: "var(--textWhite87)" }}
                    />
                  </form>
                ) : (
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    direction="column"
                  >
                    <Grid item>
                      <Grid container alignItems="center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={FCMinPercentageChecked}
                              onClick={() => onClickFCPercentageCheck("min")}
                              sx={{ mr: 1 }}
                            />
                          }
                          label={t("Set 'Minimum' Percentage")}
                          style={{ marginBottom: 0 }}
                        />
                        <TextField
                          type="number"
                          variant="standard"
                          onChange={(e) =>
                            setFactorConditionMinPercentage(
                              e.currentTarget.value
                            )
                          }
                          value={factorConditionMinPercentage}
                          inputProps={{
                            style: {
                              color: "white",
                              fontWeight: "400",
                              borderColor: "white",
                              paddingLeft: "10px",
                              boxSizing: "border-box",
                            },
                            min: 0,
                            max: 100,
                          }}
                          disabled={!FCMinPercentageChecked}
                          style={{ width: "60px", marginRight: "10px" }}
                        />
                        %
                      </Grid>
                    </Grid>
                    <Grid item>
                      <Grid container alignItems="center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={FCMaxPercentageChecked}
                              onClick={() => onClickFCPercentageCheck("max")}
                              sx={{ mr: 1 }}
                            />
                          }
                          label={t("Set 'Max' Percentage")}
                          style={{ marginBottom: 0 }}
                        />
                        <TextField
                          type="number"
                          variant="standard"
                          onChange={(e) =>
                            setFactorConditionMaxPercentage(
                              e.currentTarget.value
                            )
                          }
                          value={factorConditionMaxPercentage}
                          inputProps={{
                            style: {
                              color: "white",
                              fontWeight: "400",
                              borderColor: "white",
                              paddingLeft: "10px",
                              boxSizing: "border-box",
                            },
                            min: 0,
                            max: 100,
                          }}
                          disabled={!FCMaxPercentageChecked}
                          style={{ width: "60px", marginRight: "10px" }}
                        />
                        %
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </DialogContent>
              {factorConditionType === "name" && (
                <Grid
                  container
                  spacing={1}
                  style={{ marginBottom: "20px", padding: "0 20px" }}
                >
                  {industrySectorArr.map((v) => (
                    <Grid item key={v}>
                      <Chip
                        color="primary"
                        label={v}
                        onDelete={() => removeIndustrySector(v)}
                        deleteIcon={
                          <CancelIcon
                            sx={{
                              fill: "white",
                            }}
                          />
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
              <DialogActions>
                <Button
                  onClick={handleFactorConditionDialogClose}
                  style={{ color: "var(--textWhite87)" }}
                >
                  {t("Cancel")}
                </Button>
                <Button
                  onClick={registerFactorCondition}
                  style={{ color: "var(--textWhite87)" }}
                  // disabled={
                  //   (factorConditionType === "name" &&
                  //     industrySectorArr.length === 0) ||
                  //   (factorConditionType === "number" &&
                  //     !FCMinPercentageChecked &&
                  //     !FCMaxPercentageChecked)
                  // }
                >
                  {t("Confirm")}
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        ) : (
          <Grid
            item
            container
            xs={12}
            justifyContent="center"
            alignItems="center"
            style={{ paddingTop: "150px" }}
          >
            <CircularProgress />
          </Grid>
        )}
      </Grid>
    </>
  );
};
export default MarketNewProject;
