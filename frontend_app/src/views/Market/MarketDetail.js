import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as api from "controller/api.js";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import Cookies from "helpers/Cookies";
import { getMeRequestAction } from "redux/reducers/user";
import { getMarketProjectRequestAction } from "redux/reducers/projects";
import {
  getLabelProjectRequestAction,
  getObjectListsRequestAction,
  postUploadFileRequestAction,
} from "../../redux/reducers/labelprojects";
import { getMarketModelRequestAction } from "../../redux/reducers/models";
import {
  askModalRequestAction,
  openSuccessSnackbarRequestAction,
  openErrorSnackbarRequestAction,
} from "../../redux/reducers/messages";
import LabelPreview from "views/Labelling/LabelPreview";
import Button from "components/CustomButtons/Button";
import { IS_ENTERPRISE } from "variables/common";
import ModalPage from "../../components/PredictModal/ModalPage";
import MarketDetailSetting from "./MarketDetailSetting";
import MarketMovieAnalysis from "./MarketMovieAnalysis";
import LabelClass from "../Labelling/LabelClass";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";
import Dropzone from "react-dropzone";
import { useDropzone } from "react-dropzone";
import { Grid } from "@material-ui/core";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Modal from "@material-ui/core/Modal";
import Typography from "@material-ui/core/Typography";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TextField from "@material-ui/core/TextField";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CloseIcon from "@material-ui/icons/Close";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { LinearProgress } from "@mui/material";

const MarketDetail = ({ history, match }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, labelprojects, projects, messages, groups } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
      labelprojects: state.labelprojects,
      messages: state.messages,
      groups: state.groups,
    }),
    []
  );
  const { t } = useTranslation();
  const path = window.location.pathname;
  const chartWidth =
    window.innerWidth < 1100 ? 600 : window.innerWidth < 1500 ? 800 : 1000;
  const COLOR_MINT = "#1BC6B4";
  const COLOR_BLUE = currentThemeColor.primary1;
  const COLOR_GRAY = "#999999";
  const COLOR_WHITE = "#FFFFFF";
  const COLOR_LIGHT = "#D0D0D0";
  const COLOR_DARK = "#4F4F4F";
  const COLOR_YELLOW = "#FFD43B";
  const BACKGROUND_COLOR = currentThemeColor.background2;
  const COLORS = [COLOR_MINT, COLOR_DARK];

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*, zip/*",
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState("overview");
  const [marketProjectId, setMarketProjectId] = useState(null);
  const [refreshProject, setRefreshProject] = useState(0);
  const [isModalOpen, setIsOpenModal] = useState(false);
  const [isOpenFileModal, setIsOpenFileModal] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploadFileChanged, setIsUploadFileChanged] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [chosenItem, setChosenItem] = useState(null);
  const [isStandardMovie, setIsStandardMovie] = useState(false);
  const [isStandard, setIsStandard] = useState(true);
  const [settingAreaImgFiles, setSettingAreaImgFiles] = useState([]);
  const [totalPerDate, setTotalPerDate] = useState([]);
  const [maxTotalPerDate, setMaxTotalPerDate] = useState(10000);
  const [totalPerHour, setTotalPerHour] = useState([]);
  const [maxTotalPerHour, setMaxTotalPerHour] = useState(10000);
  const [totalPerGender, setTotalPerGender] = useState([]);
  const [totalPerAge, setTotalPerAge] = useState([]);
  const [maxTotalPerAge, setMaxTotalPerAge] = useState(null);
  const [totalPerSection, setTotalPerSection] = useState([]);
  const [maxTotalPerSection, setMaxTotalPerSection] = useState(null);
  const [periodType, setPeriodType] = useState("");
  const [periodText, setPeriodText] = useState("");
  const [totalFloatCount, setTotalFloatCount] = useState(null);
  const [totalVisitCount, setTotalVisitCount] = useState(null);
  const [totalPurchaseCount, setTotalPurchaseCount] = useState(null);
  const [totalDurationCount, setTotalDurationCount] = useState(null);
  const [checkedType, setCheckedType] = useState("float");
  const [selectedSection, setSelectedSection] = useState("all");
  const [recentLookup, setRecentLookup] = useState(false);
  const [offlineType, setOfflineType] = useState("");
  const [isLabelProjectLoading, setIsLabelProjectLoading] = useState(false);
  const [isMarketProjectLoading, setIsMarketProjectLoading] = useState(false);
  const [isValidLabelProject, setIsValidLabelProject] = useState(null);
  const [isValidMarketProject, setIsValidMarketProject] = useState(null);
  const [isNeedLabel, setIsNeedLabel] = useState(true);
  const [isPreviewImgExisted, setIsPreviewImgExisted] = useState(false);
  const [totalVisitCountPerClass, setTotalVisitCountPerClass] = useState(null);
  const [visitPerLabelClassData, setVisitPerLabelClassData] = useState([]);
  const [allVisitCount, setAllVisitCount] = useState(0);
  const [isRefreshAbuse, setIsRefreshAbuse] = useState(false);
  const graphContents = {
    float: {
      name: offlineType === "offline_shop" ? "유동인구" : "차량 유동량",
    },
    visit: { name: "매장 방문" },
    purchase: { name: "구매도달" },
    duration: {
      name: offlineType === "offline_shop" ? "체류시간" : "총 광고 노출시간",
    },
  };
  const token = Cookies.getCookie("jwt");
  const date = new Date();
  const l_date = new Date(date.setDate(date.getDate() - 1));

  let l_year = l_date.getFullYear().toString();
  let l_month = (l_date.getMonth() + 1).toString();
  let l_day = l_date.getDate().toString();
  let l_dateString = `${l_year}-${
    parseInt(l_month) < 10 ? "0" + l_month : l_month
  }-${parseInt(l_day) < 10 ? "0" + l_day : l_day}`;
  const lastDate = l_dateString;

  const l7_date = new Date(l_date.setDate(l_date.getDate() - 6));
  let l7_year = l7_date.getFullYear().toString();
  let l7_month = (l7_date.getMonth() + 1).toString();
  let l7_day = l7_date.getDate().toString();
  let l7_dateString = `${l7_year}-${
    parseInt(l7_month) < 10 ? "0" + l7_month : l7_month
  }-${parseInt(l7_day) < 10 ? "0" + l7_day : l7_day}`;
  const last7Date = l7_dateString;

  const lm_date = new Date(date.setMonth(date.getMonth() - 1));
  let lm_year = lm_date.getFullYear().toString();
  let lm_month = (lm_date.getMonth() + 1).toString();
  let lm_day = lm_date.getDate().toString();
  let lm_dateString = `${lm_year}-${
    parseInt(lm_month) < 10 ? "0" + lm_month : lm_month
  }-${parseInt(lm_day) < 10 ? "0" + lm_day : lm_day}`;
  const lastMDate = lm_dateString;

  const [startDate, setStartDate] = useState(last7Date);
  const [endDate, setEndDate] = useState(lastDate);

  let tempLabellingUrl = "http://localhost:3001/";
  if (process.env.REACT_APP_DEPLOY) {
    tempLabellingUrl = process.env.REACT_APP_LABELAPP_URL;
  }

  const openModal = async (id, item, isStandardMovie, isStandard) => {
    await dispatch(getMarketModelRequestAction(id));
    await setIsStandardMovie(isStandardMovie);
    await setIsOpenModal(true);
    await setChosenItem(item);
    await setIsStandard(isStandard);
  };

  const closeFileModal = () => {
    // dispatch(askModalRequestAction());
    setIsOpenFileModal(false);
  };

  const saveFiles = async () => {
    if (!uploadFile || uploadFile.length === 0) {
      openErrorSnackbarRequestAction(t("Upload file"));
      return;
    }

    await setIsFileUploading(true);
    await setIsLoading(true);
    await dispatch(
      postUploadFileRequestAction({
        labelprojectId: labelprojects.projectDetail.id,
        files: uploadFile,
        frameValue: null,
      })
    );
    await setIsFileUploading(false);
    await setIsOpenFileModal(false);
    await setUploadFile(null);
    await setIsLoading(false);
  };

  const deleteUploadedFile = (files) => {
    const tempFiles = uploadFile;
    for (let idx = 0; idx < uploadFile.length; idx++) {
      if (uploadFile[idx].path === files) {
        tempFiles.splice(idx, 90);
      }
    }
    setUploadFile(tempFiles);
    setIsUploadFileChanged(true);
  };

  const dropFiles = (files) => {
    setIsUploadLoading(true);
    const tmpFiles = [];
    let maximum = user.maximumFileSize;
    for (let idx = 0; idx < files.length; idx++) {
      if (files[idx].size > maximum) {
        dispatch(
          openErrorSnackbarRequestAction(
            t(`${maximum / 1073741824}GB 크기이상의 파일은 업로드 불가합니다.`)
          )
        );
      } else {
        const name = files[idx].name;
        if (/\.(jpg|jpeg|png)$/g.test(name.toLowerCase())) {
          tmpFiles.push(files[idx]);
        }
      }
    }
    if (tmpFiles.length === 0) {
      dispatch(
        openErrorSnackbarRequestAction(t(" Please upload file again"))
      );
      setIsUploadLoading(false);
      return;
    }
    setUploadFile(tmpFiles);
    setIsUploadLoading(false);
  };

  const dataTypeText = () => {
    return <>{t("Only one image file (png/jpg/jpeg) can be uploaded.")}</>;
  };

  const goToSettingAreaPage = () => {
    const { id, status } = settingAreaImgFiles[0];

    if (
      labelprojects.projectDetail &&
      labelprojects.projectDetail.labelclasses.length === 0
    ) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("There is no class registered. Please add class")
        )
      );
      return;
    }

    window.open(
      `${tempLabellingUrl}${
        labelprojects.projectDetail.id
      }/${id}/?token=${token}&start=true&appStatus=${status}&timeStamp=${Date.now()}`,
      "_blank"
    );
  };

  useEffect(() => {
    if (user.me && user.me.usageplan) {
      const id = match.params.id;

      setMarketProjectId(id);

      projects.project?.service_type?.includes("offline_")
        ? setSelectedPage("overview")
        : setSelectedPage("movieAnalysis");

      setOfflineType(projects.project?.service_type);
    }
  }, [user.me && path, projects.project]);

  useEffect(() => {
    if (
      (selectedPage === "overview" || selectedPage === "movieAnalysis") &&
      marketProjectId
    ) {
      setIsLoading(true);
      dispatch(getMarketProjectRequestAction(marketProjectId));
    }
    // if (selectedPage === "list" && projects.projectDetail) {
    //   let workAssignee =
    //     user.me?.id === parseInt(projects.projectDetail.user)
    //       ? "all"
    //       : user.me?.email;
    // }
  }, [selectedPage && marketProjectId, refreshProject]);

  useEffect(() => {
    if (
      labelprojects?.projectDetail &&
      labelprojects.projectDetail.labelclasses
    ) {
      let tmp = [];
      labelprojects.projectDetail.labelclasses.map((labelClass, i) => {
        let visitPerClass = { name: labelClass.name };

        tmp.push(visitPerClass);
      });
      setVisitPerLabelClassData(tmp);
    }
  }, [labelprojects.projectDetail]);

  const CustomizedLabel = (props) => {
    const { x, y, stroke, value, allVisitCount } = props;

    return (
      <text fill={"#FFF"} fontSize={14} textAnchor="middle">
        <tspan x={x} y={y - 20} dx={15} dy={-10}>
          {(allVisitCount * (value / 100)).toLocaleString()}명
        </tspan>
        <tspan x={x} y={y} dx={15} dy={-10}>
          {value}%
        </tspan>
      </text>
    );
  };

  useEffect(() => {
    if (
      selectedPage !== "movieAnalysis" &&
      history.location.search.includes("?list=")
    ) {
      let path = history.location.pathname;
      history.push(path);
    }
    if (selectedPage === "list") applyDates("visit", "all");
  }, [selectedPage]);

  useEffect(() => {
    if (user.me == null) dispatch(getMeRequestAction());
    else {
      setIsValid(true);
    }
  }, [user.me]);

  useEffect(() => {
    if (isValid == true) {
      const key = `first_${match.params.key}_expiration_date`;
      let expired_at = new Date(user.me[key]);
      expired_at =
        (expired_at.getTime() + expired_at.getTimezoneOffset() * 60000) / 60000;
      let nowTime = new Date();
      nowTime =
        (nowTime.getTime() + nowTime.getTimezoneOffset() * 60000) / 60000;
      if (user.me[key] == null) expired_at = nowTime;
      if (
        nowTime > expired_at &&
        (user.cardInfo == null || user.cardInfo.cardName == null)
      ) {
        if (!IS_ENTERPRISE) {
          history.push(`/admin/setting/payment/?message=need`);
        }
      } else {
        if (key.indexOf("_training") != -1) {
          setIsNeedLabel(false);
        }
        setIsChecking(false);
      }
    }
  }, [isValid]);

  useEffect(() => {
    if (
      projects.project !== null &&
      projects.project.service_type !== undefined
    ) {
      if (projects.project.labelproject !== null) {
        dispatch(getLabelProjectRequestAction(projects.project?.labelproject));
      } else if (projects.project?.service_type.indexOf("offline_") !== -1) {
        history.goBack();
        dispatch(
          openErrorSnackbarRequestAction(t(""))
        );
      } else {
        setIsValidLabelProject(true);
      }
    }
  }, [projects.project, projects.project?.labelproject]);

  useEffect(() => {
    if (projects.isLoading && isMarketProjectLoading == false) {
      setIsMarketProjectLoading(true);
    }
    if (projects.isLoading == false && isMarketProjectLoading == true) {
      if (projects.isSuccess == true) {
        setIsValidMarketProject(true);
        setIsMarketProjectLoading(false);
        setIsLoading(false);
      } else {
        setIsValidMarketProject(false);
        setIsMarketProjectLoading(false);
      }
    }
  }, [projects.isLoading]);

  useEffect(() => {
    if (labelprojects.isLabelLoading && isLabelProjectLoading == false) {
      setIsLabelProjectLoading(true);
    }
    if (
      labelprojects.isLabelLoading == false &&
      isLabelProjectLoading == true
    ) {
      if (labelprojects.isSuccess == true) {
        setIsValidLabelProject(true);
        setIsLabelProjectLoading(false);
      } else {
        setIsValidLabelProject(false);
        setIsLabelProjectLoading(false);
      }
    }
  }, [labelprojects.isLabelLoading]);

  useEffect(() => {
    if (isValidLabelProject == false) {
      if (isNeedLabel == false) {
        setIsValidLabelProject(true);
        setIsLoading(false);
      } else {
        history.goBack();
        dispatch(
          openSuccessSnackbarRequestAction(
            t("The label project does not exist.")
          )
        );
      }
    }
    if (isValidMarketProject == false) {
      history.goBack();
      dispatch(
        openSuccessSnackbarRequestAction(
          t("This service has not been paid for on a regular basis.")
        )
      );
    }
  }, [isValidLabelProject, isValidMarketProject, isNeedLabel]);

  useEffect(() => {
    if (labelprojects.projectDetail !== undefined) {
      setIsLoading(false);
    }
  }, [labelprojects.projectDetail]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsOpenModal(false);
      // setIsAutoLabelingModalOpen(false);
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (isUploadFileChanged) setIsUploadFileChanged(false);
  }, [isUploadFileChanged]);

  useEffect(() => {
    setIsUploadLoading(false);
  }, [uploadFile]);

  useEffect(() => {
    if (
      (selectedPage === "class" ||
        selectedPage === "list" ||
        labelprojects.isPostSuccess) &&
      labelprojects.projectDetail
    ) {
      dispatch(
        getObjectListsRequestAction({
          sorting: labelprojects.sortingValue,
          count: 1,
          page: 0,
          labelprojectId: labelprojects.projectDetail.id,
          tab: labelprojects.valueForStatus,
          isDesc: false,
          searching: labelprojects.searchedValue,
          workAssignee: labelprojects.valueForAsingee,
          workapp: labelprojects.projectDetail.workapp,
        })
      );
    }
  }, [labelprojects.isPostSuccess, selectedPage]);

  useEffect(() => {
    if (labelprojects?.objectLists && labelprojects.objectLists.length === 0) {
      setIsPreviewImgExisted(false);
    } else {
      setSettingAreaImgFiles(labelprojects?.objectLists);
      setIsPreviewImgExisted(true);
    }
  }, [labelprojects?.objectLists]);

  useEffect(() => {
    // 페이지 첫 진입시 일주일 적용 로딩, 최근 버튼 클릭시 바로 조회
    if (projects && projects.project?.id) {
      applyDates(checkedType, selectedSection);
      setRecentLookup(false);
    }
  }, [projects?.project?.id, recentLookup]);

  const onSetSelectedPage = (page) => {
    setSelectedPage(page);
  };
  const closeModal = () => {
    dispatch(askModalRequestAction());
  };
  let renderLabel = function(entry) {
    return entry.value * 100 + "%";
  };

  const getMarketStat = (data, id, type, section) => {
    // setIsLoading(true);
    api
      .getMarketMovieStatistics(data, id)
      .then((res) => {
        // setIsLoading(false);
        dataProcessing(res.data, type, section);
      })
      .catch((e) => {
        console.log(e, "e");
      });
  };

  const dataProcessing = (responseData, type, section) => {
    let dateType = "";
    let stats = responseData;
    let class_date = {};
    let class_hour = {};
    let class_age = {};
    let class_gender = {};
    let statYear = "";
    let statMonth = "";
    let statDay = "";
    let totalFloat = 0;
    let totalVisit = 0;
    let totalPurchase = 0;
    let totalDuration = 0;
    let visitPerClass = {};

    stats.map((stat) => {
      let avgCounts = stat.avgObjectCount;
      let avgDuration = stat.avgObjectDuration;
      let hourGroup = stat.statisticHour;
      let ageGroup = stat.ageGroup;
      let genGroup = stat.genderGroup;
      let areaGroup = stat.areaName;
      let tempCounts = 0;
      if (!section || areaGroup === section || section === "all") {
        totalFloat = totalFloat + avgCounts;
        if (areaGroup && areaGroup !== "all")
          totalVisit = totalVisit + avgCounts;
        if (areaGroup === "Checkout") totalPurchase = totalPurchase + avgCounts;
        totalDuration = totalDuration + avgDuration;
        statYear = String(stat.statisticYear);
        if (stat.statisticMonth)
          statMonth =
            stat.statisticMonth < 10
              ? "0" + String(stat.statisticMonth)
              : String(stat.statisticMonth);
        else dateType = "year";
        if (stat.statisticDay)
          statDay =
            stat.statisticDay < 10
              ? "0" + String(stat.statisticDay)
              : String(stat.statisticDay);
        else dateType = "month";

        if (type === "visit") {
          if (areaGroup && areaGroup !== "all") tempCounts = avgCounts;
        } else if (type === "purchase") {
          if (areaGroup && areaGroup === "Checkout") tempCounts = avgCounts;
        } else tempCounts = avgCounts;

        let dateGroup = statYear + "/" + statMonth + "/" + statDay;
        if (dateGroup) {
          if (class_date[dateGroup]) {
            class_date[dateGroup] = class_date[dateGroup] + tempCounts;
          } else {
            class_date[dateGroup] = tempCounts;
          }
        }
        if (hourGroup) {
          if (class_hour[hourGroup]) {
            class_hour[hourGroup] = class_hour[hourGroup] + tempCounts;
          } else {
            class_hour[hourGroup] = tempCounts;
          }
        }
        if (ageGroup) {
          if (class_age[ageGroup]) {
            class_age[ageGroup] = class_age[ageGroup] + tempCounts;
          } else {
            class_age[ageGroup] = tempCounts;
          }
        }
        if (genGroup) {
          if (class_gender[genGroup]) {
            class_gender[genGroup] = class_gender[genGroup] + tempCounts;
          } else {
            class_gender[genGroup] = tempCounts;
          }
        }
        if (areaGroup) {
          if (visitPerClass[areaGroup]) {
            visitPerClass[areaGroup] += tempCounts;
          } else {
            visitPerClass[areaGroup] = tempCounts;
          }
        }
      }
    });

    if (visitPerClass && section === "all") {
      let tmpArr = [...visitPerLabelClassData];

      tmpArr.map((data, i) => {
        if (visitPerClass[data.name]) {
          data.visitPerClassAmt = (visitPerClass[data.name] / totalVisit) * 100;
        } else {
          data.visitPerClassAmt = 0;
        }
      });
      setVisitPerLabelClassData(tmpArr);
      setTotalVisitCountPerClass(visitPerClass);
      setAllVisitCount(totalVisit);
    }

    dateProcessing(class_date, dateType);
    hourProcessing(class_hour);
    ageProcessing(class_age);
    genderProcessing(class_gender);
    setTotalFloatCount(totalFloat);
    setTotalVisitCount(totalVisit);
    setTotalDurationCount(totalDuration.toFixed(0));
    setTotalPurchaseCount(totalPurchase);
  };

  const dateProcessing = (dateData, dateType) => {
    let dates = dateData;
    let tempDateRange = [];
    let tempMax = 0;
    Object.keys(dates).map((date) => {
      let dateBaseDict = {};
      if (dateType === "month") dateBaseDict["x"] = date.slice(2, 7);
      else if (dateType === "year") dateBaseDict["x"] = date.slice(0, 4);
      else dateBaseDict["x"] = date.slice(-5);
      dateBaseDict["y1"] = dates[date];
      if (dates[date] > tempMax) {
        tempMax = dates[date];
      }
      tempDateRange.push(dateBaseDict);
    });
    setTotalPerDate(tempDateRange);
    setMaxTotalPerDate(onSetYHeight(tempMax));
  };

  const hourProcessing = (hourDate) => {
    let hours = hourDate;
    let tempHourRange = [];
    let tempHourText = "";
    let tempMax = 0;
    let startHour = 0;
    let endHour = 0;
    Object.keys(hours).map((hour) => {
      if (hour !== "undefined") {
        let hourBaseDict = {};
        startHour = parseInt(hour);
        endHour = startHour + 1;
        tempHourText = String(startHour) + "-" + String(endHour);
        hourBaseDict["x"] = tempHourText;
        hourBaseDict["y1"] = hours[hour];
        if (hours[hour] > tempMax) {
          tempMax = hours[hour];
        }
        tempHourRange.push(hourBaseDict);
      }
    });
    setTotalPerHour(tempHourRange);
    setMaxTotalPerHour(onSetYHeight(tempMax));
  };

  const ageProcessing = (ageData) => {
    let ages = ageData;
    let tempAgeRange = [];
    let tempMax = 0;
    Object.keys(ages).map((age) => {
      if (age !== "undefined") {
        let ageBaseDict = {};
        ageBaseDict["x"] = age + t("");
        ageBaseDict["y1"] = ages[age];
        ageBaseDict["y1Label"] = ages[age] + t("");
        if (ages[age] > tempMax) {
          tempMax = ages[age];
        }
        tempAgeRange.push(ageBaseDict);
      }
    });
    setTotalPerAge(tempAgeRange);
    setMaxTotalPerAge(onSetYHeight(tempMax));
  };

  const genderProcessing = (genderData) => {
    let tempTotalPerGender = [];
    let genders = genderData;
    let countTotal = 0;
    Object.keys(genders).map((gender) => {
      if (gender !== "undefined") {
        countTotal = countTotal + genders[gender];
      }
    });
    Object.keys(genders).map((gender) => {
      if (gender !== "undefined") {
        let genderBaseDict = {};
        genderBaseDict["name"] = gender;
        genderBaseDict["value"] = parseFloat(genders[gender].toFixed(2));
        if (genderBaseDict.name == "F" || genderBaseDict.name == "M") {
          tempTotalPerGender.push(genderBaseDict);
        }
      }
    });
    if (tempTotalPerGender.length == 1) {
      if (tempTotalPerGender[0].name == "M") {
        tempTotalPerGender.push({ name: "F", value: 0 });
      } else {
        tempTotalPerGender.unshift({ name: "M", value: 0 });
      }
    }
    setTotalPerGender(tempTotalPerGender);
  };

  const onSetYHeight = (maxVal) => {
    let tempY = 1;
    let tempOdd = 1;
    while (maxVal > tempY) {
      if (tempOdd) {
        tempY = tempY * 5;
        tempOdd = tempOdd - 1;
      } else {
        tempY = tempY * 2;
        tempOdd = tempOdd + 1;
      }
    }
    return tempY;
  };

  const onChangeStartDateFunc = (val) => {
    const year = val?.slice(0, 4);
    if (val) {
      if (year < 1970) {
        setStartDate("1970-01-01");
        dispatch(
          openErrorSnackbarRequestAction(
            t("The starting year can be set after 1970.")
          )
        );
        return;
      } else {
        setStartDate(val);
      }
    }
  };

  const onChangeEndDateFunc = (val) => {
    if (val) {
      setEndDate(val);
    }
  };

  const checkedBox = (type) => {
    setCheckedType(type);
    applyDates(type, selectedSection);
  };

  const applyDates = (type, section) => {
    let tempType = periodType;
    let startDateInt = parseInt(startDate.slice(8, 10));
    let endDateInt = parseInt(endDate.slice(8, 10));
    let startMonthInt = parseInt(startDate.slice(5, 7));
    let endMonthInt = parseInt(endDate.slice(5, 7));
    let startYearInt = parseInt(startDate.slice(0, 4));
    let endYearInt = parseInt(endDate.slice(0, 4));
    let diffYear = endYearInt - startYearInt;
    let diffMonth = endMonthInt - startMonthInt + 12 * diffYear;
    let diffDate = endDateInt - startDateInt + 30 * diffMonth;
    if (diffMonth > 60) tempType = "year";
    else if (diffDate > 100) tempType = "month";
    else tempType = "day";
    if (startDate > lastDate) {
      setStartDate(lastDate);
      dispatch(
        openErrorSnackbarRequestAction(
          t("You can search up to the day before the date of inquiry.")
        )
      );
      return;
    } else if (endDate > lastDate) {
      setEndDate(lastDate);
      dispatch(
        openErrorSnackbarRequestAction(
          t("You can search up to the day before the date of inquiry.")
        )
      );
      return;
    } else if (startDate > endDate) {
      setStartDate(endDate);
      dispatch(
        openErrorSnackbarRequestAction(
          t("종료일이 시작일보다 빠를 수 없습니다.")
        )
      );
      return;
    }
    getMarketStat(
      {
        period_type: tempType,
        start_date: startDate,
        end_date: endDate,
      },
      projects.project?.id,
      type,
      section
    );
    setPeriodType(tempType);
    if (tempType === "day") {
      setPeriodText("일별");
    } else if (tempType === "month") {
      setPeriodText("월별");
    } else if (tempType === "year") {
      setPeriodText("연도별");
    }
  };

  const selectSection = (section) => {
    let tempSec = section.target.value;
    setSelectedSection(tempSec);
    applyDates(checkedType, tempSec, true);
  };

  const recentDates = (period) => {
    if (period === "week") {
      setEndDate(lastDate);
      setStartDate(last7Date);
    } else {
      setEndDate(lastDate);
      setStartDate(lastMDate);
    }
    setRecentLookup(true);
  };

  const statBox = {
    minWidth: "150px",
    width: "20%",
    minHeight: "100px",
    margin: "20px",
    padding: "15px",
    border: "1px solid #D0D0D0",
    cursor: "pointer",
  };

  const blurBlackBox = {
    width: "100%",
    height: "400px",
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    zIndex: "5",
  };
  const blurBlackBox_300 = {
    width: "100%",
    height: "220px",
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    zIndex: "5",
  };

  return (
    <>
      <ReactTitle title={"DS2.ai - " + t("service")} />
      <>
        {isLoading ||
        isChecking ||
        !isValidMarketProject ||
        !isValidLabelProject ? (
          <div className={classes.loading}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <GridContainer>
              <GridItem>
                <div className={classes.topTitle}>
                  {projects.project?.projectName}
                  <Button
                    style={{
                      width: "120px",
                      height: "30px",
                      alignSelf: "flex-end",
                      marginLeft: "20px",
                      fontSize: user.language === "ko" ? "14px" : "12px",
                    }}
                    id="uploadPredictAgain"
                    // onClick={() =>
                    //   openModal(projects.project?.marketmodel, "apiVideo", false)
                    // }
                    className={classes.defaultF0F0OutlineButton}
                  >
                    {t("Reading Guide")}
                  </Button>
                </div>
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem>
                <Button
                  style={{
                    width: "155px",
                    height: "35px",
                    marginRight: "8px",
                    wordBreak: "keep-all",
                    fontWeight: "400",
                    fontSize: user.language === "ko" ? "16px" : "14px",
                  }}
                  id="uploadPredictAgain"
                  onClick={() => {
                    let isStandard;
                    api
                      .getAsynctaskAllByMarketProjectId({
                        start: 1,
                        count: 1,
                        id: match.params.id,
                      })
                      .then((res) => {
                        if (res.data.asynctasks.length > 0) {
                          if (res.data.asynctasks[0].isStandardMovie == true) {
                            //isStandard에 res.data.asynctasks[0].S3? 넣어주면 됨
                            isStandard = res.data.asynctasks[0].inputFilePath;
                          } else {
                            isStandard = false;
                          }
                        } else {
                          isStandard = false;
                        }
                        openModal(
                          projects.project?.marketmodel,
                          "apiVideo",
                          false,
                          isStandard
                        );
                      });
                  }}
                  className={classes.defaultGreenOutlineButton}
                >
                  {t("Video Upload")}
                </Button>
                {projects.project?.service_type.indexOf("_training") > -1 && (
                  <Button
                    style={{
                      width: user.language === "ko" ? "180px" : "240px",
                      alignSelf: "flex-end",
                      marginLeft: "10px",
                      height: "35px",
                      marginRight: "8px",
                      wordBreak: "keep-all",
                      fontWeight: "400",
                      fontSize: user.language === "ko" ? "16px" : "14px",
                    }}
                    id="uploadPredictAgain"
                    onClick={() =>
                      openModal(
                        projects.project?.marketmodel,
                        "apiVideo",
                        true,
                        false
                      )
                    }
                    className={classes.defaultF0F0OutlineButton}
                  >
                    {t("Standard Video Upload")}
                  </Button>
                )}
              </GridItem>
            </GridContainer>
            <GridContainer
              className={classes.pageList}
              style={{ width: "100%", margin: "0 0 15px 15px" }}
              wrap="nowrap"
            >
              {projects.project?.service_type.indexOf("offline_") > -1 && (
                <Grid
                  onClick={() => onSetSelectedPage("overview")}
                  id="labelDashboardTab"
                  className={
                    selectedPage === "overview"
                      ? classes.selectedListObject
                      : classes.listObject
                  }
                >
                  {t("Dashboard")}
                </Grid>
              )}
              {projects.project?.service_type.indexOf("offline_") > -1 && (
                <Grid
                  onClick={() => onSetSelectedPage("list")}
                  id="labelListTab"
                  className={
                    selectedPage === "list"
                      ? classes.selectedListObject
                      : classes.listObject
                  }
                >
                  {t("Detailed analysis")}
                </Grid>
              )}
              {projects.project?.service_type.indexOf("offline_") > -1 && (
                <Grid
                  onClick={() => onSetSelectedPage("class")}
                  id="labelClassTab"
                  className={
                    selectedPage === "class"
                      ? classes.selectedListObject
                      : classes.listObject
                  }
                >
                  {t("Zoning")}
                </Grid>
              )}
              {projects.project?.trainingMethod === "object_detection" && (
                <Grid
                  onClick={() => onSetSelectedPage("movieAnalysis")}
                  id="labelMovieAnalysisTab"
                  className={
                    selectedPage === "movieAnalysis"
                      ? classes.selectedListObject
                      : classes.listObject
                  }
                >
                  {t("Video list")}
                </Grid>
              )}
              <Grid
                onClick={() => onSetSelectedPage("setting")}
                id="labelMemberTab"
                className={
                  selectedPage === "setting"
                    ? classes.selectedListObject
                    : classes.listObject
                }
              >
                {t("General settings")}
              </Grid>
            </GridContainer>

            {(selectedPage === "overview" || selectedPage === "list") && (
              <GridContainer>
                <GridItem
                  style={{
                    display: "flex",
                    marginBottom: "24px",
                    padding: "0px",
                  }}
                >
                  <form className={classes.container} noValidate>
                    <TextField
                      id="startPeriod"
                      type="date"
                      defaultValue={last7Date}
                      value={startDate}
                      className={classes.textField}
                      InputLabelProps={{ shrink: true }}
                      style={{
                        // backgroundColor: COLOR_LIGHT,
                        // color: COLOR_DARK,
                        borderRadius: "2px",
                        underline: "none",
                      }}
                      onChange={(e) => onChangeStartDateFunc(e.target.value)}
                    />
                  </form>
                  <span style={{ margin: "" }}>~</span>
                  <form className={classes.container} noValidate>
                    <TextField
                      id="endPeriod"
                      type="date"
                      defaultValue={lastDate}
                      value={endDate}
                      className={classes.textField}
                      InputLabelProps={{ shrink: true }}
                      style={{
                        // backgroundColor: COLOR_LIGHT,
                        // color: COLOR_DARK,
                        borderRadius: "2px",
                        underline: "none",
                      }}
                      onChange={(e) => onChangeEndDateFunc(e.target.value)}
                    />
                  </form>
                  <Button
                    id="dateApplyBtn"
                    style={{
                      margin: "0 10px",
                      border: `1px solid ${COLOR_LIGHT}`,
                      width: "120px",
                      height: "30px",
                      fontWeight: "600",
                      color: COLOR_DARK,
                      backgroundColor: COLOR_LIGHT,
                    }}
                    onClick={() => {
                      // applyDates(checkedType, selectedSection);
                      applyDates("float", "all");
                      setSelectedSection("all");
                    }}
                  >
                    {t("Apply")}
                  </Button>
                  <Button
                    id="recentWeekBtn"
                    style={{
                      margin: "0 10px",
                      border: `1px solid ${COLOR_LIGHT}`,
                      width: "120px",
                      height: "30px",
                      fontWeight: "600",
                      color: COLOR_LIGHT,
                    }}
                    onClick={() => {
                      recentDates("week");
                    }}
                  >
                    {t("Last 1 week")}
                  </Button>
                  <Button
                    id="recentMonthBtn"
                    style={{
                      margin: "0 10px",
                      border: `1px solid ${COLOR_LIGHT}`,
                      width: "120px",
                      height: "30px",
                      fontWeight: "600",
                      color: COLOR_LIGHT,
                    }}
                    onClick={() => {
                      recentDates("month");
                    }}
                  >
                    {t("Last month")}
                  </Button>
                </GridItem>
                {selectedPage === "list" && (
                  <div
                    style={{
                      padding: "30px 30px 48px",
                      borderBottom: "1px solid var(--textWhite38)",
                    }}
                  >
                    <GridItem
                      xs={12}
                      style={{ display: "flex", justifyContent: "center" }}
                      justify="space-between"
                      alignItems="center"
                    >
                      <GridContainer
                        style={{
                          alignItems: "center",
                        }}
                      >
                        <GridItem
                          xs={5}
                          style={{ height: "250px", overflow: "hidden" }}
                        >
                          {labelprojects?.objectLists &&
                            labelprojects.objectLists.length > 0 && (
                              <LabelPreview
                                history={history}
                                selectedPreviewId={
                                  labelprojects.objectLists[0].id
                                }
                                onClosePreviewModal={() => null}
                                isMarketProject
                                isDetailAnalysis
                              />
                            )}
                        </GridItem>
                        <GridItem xs={7}>
                          <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                              data={visitPerLabelClassData}
                              margin={{
                                top: 40,
                                right: 30,
                                left: 0,
                                bottom: 5,
                              }}
                              style={{ width: "100%" }}
                            >
                              <XAxis dataKey="name" />
                              <YAxis type="number" domain={[0, 100]} />
                              <Bar
                                dataKey="visitPerClassAmt"
                                fill="var(--mainSub)"
                                barSize={30}
                                isAnimationActive={false}
                                label={
                                  <CustomizedLabel
                                    allVisitCount={allVisitCount}
                                  />
                                }
                              ></Bar>
                            </BarChart>
                          </ResponsiveContainer>
                          <div
                            style={{
                              width: "100%",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {t("Reach to Visits")}
                          </div>
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                  </div>
                )}
                <GridItem xs={12}>
                  {selectedPage === "list" && (
                    <Grid
                      container
                      justifyContent="flex-end"
                      style={{ margin: "40px 0 24px" }}
                    >
                      <Grid item xs={12}>
                        <Select
                          id="sectionSelect"
                          onChange={selectSection}
                          defaultValue="all"
                          value={selectedSection}
                          style={{
                            width: "160px",
                            height: "32px",
                            left: "0",
                            border: `1px solid ${COLOR_LIGHT}`,
                            borderRadius: "2px",
                          }}
                        >
                          <MenuItem id="menuItem_all" value="all">
                            {t("All")}
                          </MenuItem>
                          {labelprojects?.projectDetail?.labelclasses?.map(
                            (label) => {
                              return (
                                <MenuItem
                                  id={`menuItem_${label.name}`}
                                  value={label.name}
                                >
                                  {label.name}
                                </MenuItem>
                              );
                            }
                          )}
                        </Select>
                      </Grid>
                    </Grid>
                  )}
                </GridItem>
                <GridItem xs={12}>
                  <Grid
                    container
                    justifyContent="center"
                    style={{ flexWrap: "nowrap" }}
                  >
                    <div
                      id="floatSelect"
                      style={
                        checkedType === "float"
                          ? {
                              ...statBox,
                              color: COLOR_DARK,
                              backgroundColor: COLOR_WHITE,
                              cursor: "default",
                            }
                          : statBox
                      }
                      onClick={() => {
                        checkedBox("float");
                      }}
                    >
                      <div style={{ width: "100%", marginBottom: "10px" }}>
                        <b style={{ fontSize: "16px" }}>
                          {t(graphContents.float.name)}
                        </b>
                      </div>
                      <div>
                        <b style={{ fontSize: "36px" }}>{totalFloatCount}</b>
                        <b style={{ fontSize: "16px" }}>
                          {offlineType === "offline_shop"
                            ? " " + t("")
                            : " " + t("")}
                        </b>
                      </div>
                    </div>
                    {offlineType === "offline_shop" && totalVisitCount ? (
                      <div
                        id="visitSelect"
                        style={
                          checkedType === "visit"
                            ? {
                                ...statBox,
                                color: COLOR_DARK,
                                backgroundColor: COLOR_WHITE,
                                cursor: "default",
                              }
                            : statBox
                        }
                        onClick={() => {
                          checkedBox("visit");
                        }}
                      >
                        <div style={{ width: "100%", marginBottom: "10px" }}>
                          <b style={{ fontSize: "16px" }}>
                            {t(graphContents.visit.name)}
                          </b>
                        </div>
                        <div>
                          <b style={{ fontSize: "36px" }}>{totalVisitCount}</b>
                          <b style={{ fontSize: "16px" }}>{" " + t("")}</b>
                        </div>
                      </div>
                    ) : null}
                    {offlineType === "offline_shop" && totalPurchaseCount ? (
                      <div
                        id="purchaseSelect"
                        style={
                          checkedType === "purchase"
                            ? {
                                ...statBox,
                                color: COLOR_DARK,
                                backgroundColor: COLOR_WHITE,
                                cursor: "default",
                              }
                            : statBox
                        }
                        onClick={() => {
                          checkedBox("purchase");
                        }}
                      >
                        <div style={{ width: "100%", marginBottom: "10px" }}>
                          <b style={{ fontSize: "16px" }}>
                            {t(graphContents.purchase.name)}
                          </b>
                        </div>
                        <div>
                          <b style={{ fontSize: "36px" }}>
                            {totalPurchaseCount}
                          </b>
                          <b style={{ fontSize: "16px" }}>{" " + t("")}</b>
                        </div>
                      </div>
                    ) : null}
                    <div
                      id="durationSelect"
                      style={
                        checkedType === "duration"
                          ? {
                              ...statBox,
                              color: COLOR_DARK,
                              backgroundColor: COLOR_WHITE,
                            }
                          : { ...statBox, cursor: "default" }
                      }
                      // onClick={() => {
                      //   checkedBox("duration");
                      // }}
                    >
                      <div style={{ width: "100%", marginBottom: "10px" }}>
                        <b style={{ fontSize: "16px" }}>
                          {t(graphContents.duration.name)}
                        </b>
                      </div>
                      <div style={{ display: "flex" }}>
                        {totalDurationCount &&
                        parseInt(totalDurationCount / 60) ? (
                          <>
                            <b style={{ fontSize: "36px" }}>
                              {parseInt(totalDurationCount / 60)}
                            </b>
                            <b style={{ fontSize: "16px" }}>{t("minutes")}</b>
                          </>
                        ) : null}
                        {totalDurationCount &&
                        parseInt(totalDurationCount % 60) ? (
                          <>
                            <b style={{ fontSize: "36px" }}>
                              {parseInt(totalDurationCount % 60)}
                            </b>
                            <b style={{ fontSize: "16px" }}>{t("Sec")}</b>
                          </>
                        ) : (
                          <>
                            <b style={{ fontSize: "36px" }}>0</b>
                            <b style={{ fontSize: "16px" }}>{t("Sec")}</b>
                          </>
                        )}
                      </div>
                    </div>
                  </Grid>
                </GridItem>
                {projects.workage && (
                  <GridItem xs={12}>
                    <div className={classes.dashboardMain}>
                      <Typography
                        className={classes.dashbordTitle}
                        gutterBottom
                      >
                        {t("Label Trainers")}
                      </Typography>
                      <Typography className={classes.content}>
                        <GridContainer className={classes.textContainer}>
                          <Table
                            className={classes.table}
                            style={{ margin: "10px" }}
                            aria-label="simple table"
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  className={classes.tableHead}
                                  style={{ width: "5%" }}
                                  align="center"
                                >
                                  <b>{t("")}</b>
                                </TableCell>
                                <TableCell
                                  className={classes.tableHead}
                                  style={{ width: "35%" }}
                                  align="center"
                                >
                                  <b>{t("Assignee ")}</b>
                                </TableCell>
                                {projects.project &&
                                  projects.project.workapp ===
                                    "object_detection" && (
                                    <>
                                      <TableCell
                                        className={classes.tableHead}
                                        style={{ width: "15%" }}
                                        align="center"
                                      >
                                        <b>{t("")}</b>
                                      </TableCell>
                                      <TableCell
                                        className={classes.tableHead}
                                        style={{ width: "15%" }}
                                        align="center"
                                      >
                                        <b>{t("")}</b>
                                      </TableCell>
                                      <TableCell
                                        className={classes.tableHead}
                                        style={{ width: "15%" }}
                                        align="center"
                                      >
                                        <b>{t("")}</b>
                                      </TableCell>
                                    </>
                                  )}
                                <TableCell
                                  className={classes.tableHead}
                                  style={{ width: "15%" }}
                                  align="center"
                                >
                                  <b>{t("")}</b>
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {[projects.workage]
                                .concat(projects.workage.aiTrainerWorkage)
                                .map((workage, idx) => (
                                  <TableRow
                                    key={
                                      workage.aiTrainerId
                                        ? workage.aiTrainerId
                                        : user.me.email
                                    }
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
                                    <TableCell
                                      className={classes.tableRowCell}
                                      align="center"
                                    >
                                      {workage.aiTrainerId
                                        ? workage.aiTrainerId
                                        : user.me.email}
                                    </TableCell>
                                    {projects.project &&
                                      projects.project.workapp ===
                                        "object_detection" && (
                                        <>
                                          <TableCell
                                            className={classes.tableRowCell}
                                            align="center"
                                          >
                                            {workage.box}
                                          </TableCell>
                                          <TableCell
                                            className={classes.tableRowCell}
                                            align="center"
                                          >
                                            {workage.polygon}
                                          </TableCell>
                                          <TableCell
                                            className={classes.tableRowCell}
                                            align="center"
                                          >
                                            {workage.magic}
                                          </TableCell>
                                        </>
                                      )}
                                    <TableCell
                                      className={classes.tableRowCell}
                                      align="center"
                                    >
                                      {workage.box +
                                        workage.polygon +
                                        workage.magic}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </GridContainer>
                      </Typography>
                    </div>
                  </GridItem>
                )}
                <Grid
                  container
                  style={{
                    borderBottom: "1px solid var(--textWhite38)",
                    justifyContent: "center",
                  }}
                >
                  <Grid
                    item
                    xs={11}
                    style={{ position: "relative", marginTop: "40px" }}
                  >
                    {totalPerDate.length === 0 && (
                      <div id="dateBlackBox" style={blurBlackBox}>
                        <b>{t("There is no data for the period you searched for.")}</b>
                      </div>
                    )}
                    <div style={{ margin: "0 36px 24px", fontWeight: "bold" }}>
                      {user.language === "ko"
                        ? (periodText ? t(periodText) : t("by period")) +
                          " " +
                          t(graphContents[checkedType].name)
                        : t(graphContents[checkedType].name) +
                          " " +
                          (periodText ? t(periodText) : t("by period"))}
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        id="dateChart"
                        width={chartWidth}
                        height={400}
                        data={totalPerDate}
                        margin={{ top: 5, right: 90, left: 0, bottom: 5 }}
                      >
                        <Tooltip />
                        {/* <Legend verticalAlign="top" height={36} /> */}
                        <Line
                          name={
                            user.language === "ko"
                              ? (periodText ? t(periodText) : t("by period")) +
                                " " +
                                t(graphContents[checkedType].name)
                              : t(graphContents[checkedType].name) +
                                " " +
                                (periodText ? t(periodText) : t("by period"))
                          }
                          type="monotone"
                          dataKey="y1"
                          stroke={COLOR_MINT}
                          activeDot={{ r: 8 }}
                        />
                        <CartesianGrid
                          stroke="rgba(208, 208, 208, 0.4)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="x"
                          interval={0}
                          height={100}
                          stroke={"#fff"}
                        />
                        <YAxis domain={[0, maxTotalPerDate]} stroke={"#fff"} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>
                {periodType === "day" ? (
                  <Grid
                    container
                    style={{
                      borderBottom: "1px solid var(--textWhite38)",
                      justifyContent: "center",
                    }}
                  >
                    <Grid
                      item
                      xs={11}
                      style={{ position: "relative", marginTop: "40px" }}
                    >
                      {totalPerHour.length === 0 && (
                        <div id="dateBlackBox" style={blurBlackBox}>
                          <b>
                            {t("There is no data for the period you searched for.")}
                          </b>
                        </div>
                      )}
                      <div
                        style={{ margin: "0 50px 24px", fontWeight: "bold" }}
                      >
                        {user.language === "ko"
                          ? t("per hour") +
                            " " +
                            t(graphContents[checkedType].name)
                          : t(graphContents[checkedType].name) +
                            " " +
                            t("per hour")}
                      </div>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                          id="HourChart"
                          width={chartWidth}
                          height={400}
                          data={totalPerHour}
                          margin={{ top: 5, right: 90, left: 0, bottom: 5 }}
                        >
                          <Tooltip />
                          {/* <Legend verticalAlign="top" height={36} /> */}
                          <Line
                            name={
                              user.language === "ko"
                                ? t("per hour") +
                                  " " +
                                  t(graphContents[checkedType].name)
                                : t(graphContents[checkedType].name) +
                                  " " +
                                  t("per hour")
                            }
                            type="monotone"
                            dataKey="y1"
                            stroke={COLOR_MINT}
                            activeDot={{ r: 8 }}
                          />
                          <CartesianGrid
                            stroke="rgba(208, 208, 208, 0.4)"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="x"
                            interval={0}
                            height={100}
                            stroke={"#fff"}
                          />
                          <YAxis
                            domain={[0, maxTotalPerHour]}
                            stroke={"#fff"}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Grid>
                  </Grid>
                ) : null}
                <Grid
                  container
                  style={{
                    borderBottom: "1px solid var(--textWhite38)",
                    justifyContent: "center",
                  }}
                >
                  <Grid
                    item
                    xs={11}
                    style={{ position: "relative", marginTop: "40px" }}
                  >
                    {totalPerAge.length === 0 && (
                      <div id="dateBlackBox" style={blurBlackBox}>
                        <b>{t("There is no data for the period you searched for.")}</b>
                      </div>
                    )}
                    <div style={{ margin: "0 50px 24px", fontWeight: "bold" }}>
                      {user.language === "ko"
                        ? t("by age group") +
                          " " +
                          t(graphContents[checkedType].name)
                        : t(graphContents[checkedType].name) +
                          " " +
                          t("by age group")}
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        id="ageChart"
                        width={chartWidth}
                        height={400}
                        data={totalPerAge}
                        margin={{ top: 5, right: 90, left: 0, bottom: 5 }}
                      >
                        {/* <CartesianGrid vertical={false} /> */}
                        <XAxis
                          dataKey="x"
                          interval={0}
                          height={100}
                          stroke={COLOR_LIGHT}
                        />
                        <YAxis
                          domain={[0, maxTotalPerAge]}
                          stroke={COLOR_LIGHT}
                        />
                        {/* <Tooltip /> */}
                        <Bar
                          dataKey="y1"
                          fill="var(--mainSub)"
                          barSize={30}
                          isAnimationActive={false}
                        >
                          <LabelList
                            dataKey="y1Label"
                            position="top"
                            style={{ fill: "white", fontSize: "14px" }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>
                {/* <div style={{ display: "flex", marginTop: "40px" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Grid item xs={12} style={{ flexGrow: 1 }}>
                      <BorderLinearProgress
                        variant="determinate"
                        value={((deposit - totalUsage) / deposit) * 100}
                      />
                    </Grid>
                    <PieChart id="genderChart" width={730} height={250}>
                      <Legend verticalAlign="top" height={36} />
                      <Pie
                        data={totalPerGender}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#82ca9d"
                        label={renderLabel}
                      >
                        {totalPerGender.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>
                </div> */}
                {/* <div style={{ display: "flex", marginTop: "40px" }}> */}
                {/* <div style={{ display: "flex", flexDirection: "column" }}> */}
                <Grid
                  container
                  style={{
                    height: "300px",
                    justifyContent: "center",
                  }}
                >
                  <Grid
                    item
                    xs={11}
                    style={{ position: "relative", marginTop: "40px" }}
                  >
                    <Grid container>
                      {totalPerGender.length === 0 && (
                        <div id="hourBlackBox" style={blurBlackBox_300}>
                          <b>
                            {t("There is no data for the period you searched for.")}
                          </b>
                        </div>
                      )}
                      <div
                        style={{ margin: "0 50px 24px", fontWeight: "bold" }}
                      >
                        {t("floating population gender")}
                      </div>
                      <Grid item xs={11} style={{ margin: "0 50px" }}>
                        <Grid
                          container
                          style={{ justifyContent: "space-between" }}
                        >
                          <Grid item>
                            <span
                              style={{
                                fontSize: "14px",
                                color: "#D0D0D0",
                                fontWeight: "normal",
                              }}
                            >
                              {t("전체")}
                            </span>
                            <span
                              style={{
                                fontSize: "24px",
                                color: "#D0D0D0",
                                fontWeight: "bold",
                              }}
                            >
                              {" " +
                                (
                                  totalPerGender.length > 1 &&
                                  totalPerGender[0].value +
                                    totalPerGender[1].value
                                ).toLocaleString("ko-KR") +
                                t("")}
                            </span>
                          </Grid>
                          <Grid item>
                            <Grid container alignItems="flex-start" spacing={1}>
                              <Grid item>
                                <div
                                  style={{
                                    borderRadius: "10px",
                                    width: "30px",
                                    height: "5px",
                                    marginTop: "12px",
                                    backgroundColor: "#748FFC",
                                  }}
                                />
                              </Grid>
                              <Grid item>
                                <Grid container>
                                  <Grid
                                    item
                                    xs={12}
                                    style={{ fontSize: "14px" }}
                                  >
                                    {t("male")}
                                  </Grid>
                                  <Grid item xs={12}>
                                    <span
                                      style={{
                                        fontSize: "16px",
                                        color: "#D0D0D0",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {" " + totalPerGender.length > 1 &&
                                        totalPerGender[0].value.toLocaleString(
                                          "ko-KR"
                                        ) + t("")}
                                    </span>
                                  </Grid>
                                </Grid>
                              </Grid>
                              <Grid item style={{ marginLeft: "24px" }}>
                                <div
                                  style={{
                                    borderRadius: "10px",
                                    width: "30px",
                                    height: "5px",
                                    marginTop: "12px",
                                    backgroundColor: "#FF6B6B",
                                  }}
                                />
                              </Grid>
                              <Grid item>
                                <Grid container>
                                  <Grid
                                    item
                                    xs={12}
                                    style={{ fontSize: "14px" }}
                                  >
                                    {t("female")}
                                  </Grid>
                                  <Grid item xs={12}>
                                    <span
                                      style={{
                                        fontSize: "16px",
                                        color: "#D0D0D0",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {" " + totalPerGender.length > 1 &&
                                        totalPerGender[1].value.toLocaleString(
                                          "ko-KR"
                                        ) + t("")}
                                    </span>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={11} style={{ margin: "0 50px" }}>
                        <Grid
                          container
                          justify="flex-start"
                          style={{ position: "relative", marginTop: "16px" }}
                        >
                          <div
                            style={{
                              borderRadius: "10px",
                              width: "100%",
                              height: "20px",
                              backgroundColor: "#FF6B6B",
                              zIndex: "2",
                              position: "absolute",
                            }}
                          />
                          <div
                            style={{
                              borderRadius: "10px",
                              width: `${
                                totalPerGender.length > 1
                                  ? (100 * totalPerGender[0].value) /
                                    (totalPerGender[0].value +
                                      totalPerGender[1].value)
                                  : 50
                              }%`,
                              height: "20px",
                              backgroundColor: "#748FFC",
                              zIndex: "3",
                              position: "absolute",
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {/* </div> */}
                {/* </div> */}
              </GridContainer>
            )}
            {/*{selectedPage === "list" && (*/}
            {/*  <GridItem xs={12}>*/}
            {/*    <LabelList history={history} />*/}
            {/*  </GridItem>*/}
            {/*)}*/}
            {/*{selectedPage === "export" && (*/}
            {/*  <GridItem xs={12}>*/}
            {/*    <LabelExport history={history} />*/}
            {/*  </GridItem>*/}
            {/*)}*/}
            {/*{selectedPage === "labelai" && (*/}
            {/*  <GridItem xs={12}>*/}
            {/*    <LabelAI*/}
            {/*      history={history}*/}
            {/*      isFromAutoLabelBtn={isFromAutoLabelBtn}*/}
            {/*    />*/}
            {/*  </GridItem>*/}
            {/*)}*/}
            {selectedPage === "movieAnalysis" && (
              <GridItem xs={12}>
                <MarketMovieAnalysis
                  history={history}
                  onSetSelectedPage={onSetSelectedPage}
                />
              </GridItem>
            )}
            {selectedPage === "setting" && (
              <GridItem xs={12}>
                <MarketDetailSetting
                  history={history}
                  onSetSelectedPage={onSetSelectedPage}
                />
              </GridItem>
            )}
            {selectedPage === "class" && (
              <GridContainer>
                <GridItem xs={12} style={{ marginTop: "20px" }}>
                  <Button
                    style={{
                      marginRight: "15px",
                      width: user.language === "ko" ? "180px" : "240px",
                      height: "35px",
                      alignSelf: "flex-end",
                      display: "inline",
                    }}
                    id="goToSettingAreaPageBtn"
                    onClick={() => {
                      goToSettingAreaPage();
                    }}
                    className={
                      !isPreviewImgExisted
                        ? classes.defaultDisabledButton
                        : classes.defaultGreenOutlineButton
                    }
                    disabled={!isPreviewImgExisted}
                  >
                    {t("Labeling zoning settings")}
                  </Button>
                  <Button
                    aria-controls="customized-menu"
                    aria-haspopup="true"
                    id="uploadImgForSettingAreaBtn"
                    style={{
                      width: user.language === "ko" ? "200px" : "240px",
                      height: "35px",
                      alignSelf: "flex-end",
                      marginRight: "15px",
                    }}
                    onClick={() => {
                      setIsOpenFileModal(true);
                    }}
                    className={classes.defaultF0F0OutlineButton}
                  >
                    {t("Upload image for zoning")}
                  </Button>
                  <Button
                    onClick={() => {
                      if (!isRefreshAbuse) {
                        setIsRefreshAbuse(true);
                        setTimeout(() => {
                          dispatch(
                            getLabelProjectRequestAction(
                              projects.project?.labelproject
                            )
                          );
                          setIsRefreshAbuse(false);
                        }, 2000);
                      }
                    }}
                    style={{
                      height: "35px",
                      width: user.language === "ko" ? "130px" : "150px",
                      fontSize: "13px",
                      borderRadius: "50px",
                      border:
                        isRefreshAbuse === false
                          ? "1px solid #F0F0F0"
                          : "1px solid gray",
                      color: isRefreshAbuse === false ? "#F0F0F0" : "gray",
                      cursor: isRefreshAbuse === false ? "pointer" : "default",
                    }}
                  >
                    {t("Refresh Zone")}
                    <AutorenewIcon
                      id="notificationRefreshBtn"
                      className={
                        isRefreshAbuse === false
                          ? classes.refreshIconActive
                          : classes.refreshIconDefault
                      }
                      style={{
                        width: "25px",
                        height: "25px",
                        border: "none",
                        marginRight: "-7px",
                      }}
                    />
                  </Button>
                </GridItem>
                {labelprojects?.objectLists &&
                labelprojects.objectLists.length > 0 ? (
                  <GridItem
                    xs={12}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "36px",
                    }}
                    justify="space-between"
                    alignItems="center"
                  >
                    <LabelPreview
                      history={history}
                      selectedPreviewId={labelprojects.objectLists[0].id}
                      onClosePreviewModal={() => null}
                      isMarketProject
                    />
                  </GridItem>
                ) : (
                  <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    style={{
                      height: "240px",
                    }}
                  >
                    <Grid item>
                      {t("There are no images for zoning uploaded.")}
                    </Grid>
                  </Grid>
                )}
                <GridItem xs={12} style={{ marginTop: "60px" }}>
                  <LabelClass history={history} isMarketProject={true} />
                </GridItem>
              </GridContainer>
            )}
            {/*{selectedPage === "member" && (*/}
            {/*  <GridItem xs={12}>*/}
            {/*    <LabelMember history={history} />*/}
            {/*  </GridItem>*/}
            {/*)}*/}
          </>
        )}
      </>

      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isModalOpen}
        onClose={closeModal}
        className={classes.modalContainer}
      >
        <ModalPage
          isStandard={isStandard}
          closeModal={closeModal}
          chosenItem={chosenItem}
          isMarket={true}
          opsId={null}
          marketProjectId={projects.project?.id}
          csv={{}}
          trainingColumnInfo={{}}
          isStandardMovie={isStandardMovie}
          history={history}
        />
      </Modal>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isOpenFileModal}
        onClose={closeFileModal}
        className={classes.modalContainer}
      >
        {isFileUploading || isUploadLoading ? (
          <div className={classes.cancelModalContent}>
            {/* <Tip /> */}
            <LinearProgress />
          </div>
        ) : (
          <div className={classes.cancelModalContent} id="fileModal">
            <Dropzone onDrop={dropFiles}>
              {({ getRootProps, getInputProps }) => (
                <section className="container">
                  {(!uploadFile || uploadFile.length === 0) && (
                    <div
                      {...getRootProps({ className: "dropzoneArea" })}
                      style={{ padding: "36px 0" }}
                    >
                      <input
                        {...getInputProps()}
                        accept="image/jpeg, image/jpg, image/png"
                      />
                      <p className={classes.settingFontWhite6}>
                        {t(
                          "파일을 드래그하거나 박스를 클릭해서 업로드해주세요!"
                        )}
                        <br />
                        {dataTypeText()}
                      </p>
                      <CloudUploadIcon fontSize="large" />
                    </div>
                  )}
                  <aside>
                    {!isUploadLoading &&
                      (uploadFile && uploadFile.length > 0 && (
                        <>
                          <p
                            style={{
                              marginTop: "20px",
                              fontSize: "20px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: currentThemeColor.textWhite87,
                            }}
                          >
                            <span>
                              {t("Upload file")} : {t("총")} {uploadFile.length}
                              {t("")}
                            </span>
                          </p>
                          <ul>
                            {uploadFile.map((file, idx) => {
                              if (idx === 10) {
                                return (
                                  <li style={{ listStyle: "none" }}>.......</li>
                                );
                              }
                              if (idx >= 10) {
                                return null;
                              }
                              return (
                                <li key={file.name}>
                                  <div className={classes.alignCenterDiv}>
                                    <div
                                      style={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        color: currentThemeColor.textWhite6,
                                      }}
                                    >
                                      {file.name}
                                    </div>
                                    <CloseIcon
                                      style={{
                                        marginLeft: "10px",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => {
                                        deleteUploadedFile(file.path);
                                      }}
                                    />
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                          <span
                            id="uploadFileAgain"
                            className={classes.labelUploadBtn}
                            onClick={() => {
                              setUploadFile(null);
                            }}
                          >
                            {t("Re-upload")}
                          </span>
                        </>
                      ))}
                  </aside>
                </section>
              )}
            </Dropzone>
            <GridContainer style={{ paddingTop: "20px" }}>
              <GridItem xs={6}>
                <Button
                  id="closeModal"
                  style={{ width: "100%" }}
                  className={classes.defaultF0F0OutlineButton}
                  onClick={closeFileModal}
                >
                  {t("Cancel")}
                </Button>
              </GridItem>
              {uploadFile ? (
                <GridItem xs={6}>
                  <Button
                    id="submitBtn"
                    style={{ width: "100%" }}
                    className={classes.defaultGreenOutlineButton}
                    onClick={saveFiles}
                  >
                    {t("Next")}
                  </Button>
                </GridItem>
              ) : (
                <GridItem xs={6}>
                  <Button
                    id="submitBtn"
                    style={{ width: "100%" }}
                    className={classes.defaultDisabledButton}
                    disabled
                  >
                    {t("Next")}
                  </Button>
                </GridItem>
              )}
            </GridContainer>
          </div>
        )}
      </Modal>
    </>
  );
};

export default React.memo(MarketDetail);
