import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";
import { ChromePicker } from "react-color";
import { PieChart, Pie, Tooltip as RechartsTooltip, Cell } from "recharts";
import "rc-color-picker/assets/index.css";

import {
  getLabelProjectRequestAction,
  postLabelClassRequestAction,
  putLabelClassRequestAction,
  stopLabelProjectsLoadingRequestAction,
  updateLabelShareGroupRequestAction,
  postAiTrainerLabelprojectRequestAction,
  setLabelProjectAsync,
  setObjectlistsIsDesc,
  setObjectlistsSortingValue,
} from "redux/reducers/labelprojects.js";
import {
  askModalRequestAction,
  openSuccessSnackbarRequestAction,
  openErrorSnackbarRequestAction,
  askLabelProjectDetailRequestAction,
  askDeleteLabelClassRequestAction,
  openModalRequestAction,
} from "redux/reducers/messages.js";
import * as api from "controller/labelApi.js";
import Cookies from "helpers/Cookies";
import currentTheme from "assets/jss/custom.js";
import { currentThemeColor } from "assets/jss/custom.js";
import { getAsynctaskAll } from "controller/api.js";
import { fileurl } from "controller/api";
import { IS_ENTERPRISE } from "variables/common";
import {
  LABELAPP_ROUTES,
  GENERAL_AI_GROUPS,
  GENERAL_AI_MODELS,
  WORKAGE_TABLE_HEADER,
  WORKAGE_TABLE_BODY,
} from "variables/labeling";
import {
  getLabelAppUrl,
  sendErrorMessage,
} from "components/Function/globalFunc.js";
import { getNotificationText } from "components/Notifications/NotiText";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import RequestLabeling from "./RequestLabeling";
import RequestInspecting from "./RequestInspecting";
import LabelList from "./LabelList.js";
import LabelExport from "./LabelExport.js";
import LabelAI from "./LabelAI.js";
import LabelSetting from "./LabelSetting.js";
import LabelClass from "./LabelClass.js";
import LabelMember from "./LabelMember.js";
import BestCustomAISelectModal from "../../components/Modal/BestCustomAISelectModal";
import LicenseRegisterModal from "components/Modal/LicenseRegisterModal";
import Button from "components/CustomButtons/Button";

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputBase,
  Modal,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import { CircularProgress, Grid, Tooltip } from "@mui/material";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import CustomAICreateModal from "components/Modal/CustomAICreateModal";
import { setIsProjectRefreshed } from "redux/reducers/labelprojects";

const LabelDetail = ({ history, match }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, labelprojects, messages, groups } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
      groups: state.groups,
    }),
    []
  );
  const { t, i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [labelClasses, setLabelClasses] = useState([]);
  const [totalLabelClasses, setTotalLabelClasses] = useState([]);
  const [dataColumns, setDataColumns] = useState([]);
  const [predictColumnName, setPredictColumnName] = useState("");
  const [selectedPage, setSelectedPage] = useState("overview");
  const [isUnableToChangeDetail, setIsUnableToChangeDetail] = useState(true);
  const [isUnableToChangeName, setIsUnableToChangeName] = useState(true);
  const [nextProjectDetail, setNextProjectDetail] = useState("");
  const [nextProjectName, setNextProjectName] = useState("");
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState({ id: 0, name: "" });
  const [inputClassChangeValue, setInputClassChangeValue] = useState("");
  const [color, setColor] = useState("#fff");
  const [labelClassDict, setLabelClassDict] = useState({});
  const [isAutoLabelingModalOpen, setIsAutoLabelingModalOpen] = useState(false);
  const [isCustomAIModalOpen, setIsCustomAIModalOpen] = useState(false);
  const [isAddCustomAIModalOpen, setIsAddCustomAIModalOpen] = useState(false);
  const [autoLabelingAiType, setAutoLabelingAiType] = useState("");
  const [autoLabelingType, setAutoLabelingType] = useState("box");
  const [modelId, setModelId] = useState(null);
  const [customAIStage, setCustomAIStage] = useState(1);
  const [generalAIType, setGeneralAIType] = useState("");
  const [generalAIClasses, setGeneralAIClasses] = useState([]);
  const [generalAIClassChecked, setGeneralAIClassChecked] = useState({});
  const [inferenceAIType, setInferenceAIType] = useState("");
  const [autoLabeingProjects, setAutoLabeingProjects] = useState([]);
  const [isAutoLabelingLoading, setIsAutoLabelingLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [groupCheckboxDict, setGroupCheckboxDict] = useState({});
  const [labelChart, setLabelChart] = useState({});
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [isAbleToAutoLabeling, setIsAbleToAutoLabeling] = useState(true);
  const [isFromAutoLabelBtn, setIsFromAutoLabelBtn] = useState(false);
  const [isDeleteLabelClasses, setIsDeleteLabelClasses] = useState(false);
  const [isUpdateLabelClasses, setIsUpdateLabelClasses] = useState(false);
  const [selectedDeleteDict, setSelectedDeleteDict] = useState({});
  const [autoLabelingAmount, setAutoLabelingAmount] = useState(100);
  const [preprocessingAIClass, setPreprocessingAIClass] = useState({});
  const [isCustomAiLoading, setIsCustomAiLoading] = useState(false);
  const [isSampleModelModalOpen, setIsSampleModelModalOpen] = useState(false);
  const [customAiModels, setCustomAiModels] = useState([]);
  const [creatingCustomAiProjectId, setCreatingCustomAiProjectId] = useState(
    null
  );
  const [customAiProjectIdStatus, setCustomAiProjectIdStatus] = useState(-1);
  const [isAbleToChangeAmount, setIsAbleToChangeAmount] = useState(false);
  const [selectedUpdateDict, setSelectedUpdateDict] = useState([]);
  const [requestLabelingModalOpen, setRequestLabelingModalOpen] = useState(
    false
  );
  const [requestInspectingModalOpen, setRequestInspectingModalOpen] = useState(
    false
  );
  const [noticeHistory, setNoticeHistory] = useState([]);
  const [labelProjectId, setLabelProjectId] = useState(null);
  const [timeTickAsync, setTimeTickAsync] = useState(0);
  const [timeTickAsyncCount, setTimeTickAsyncCount] = useState(0);
  const [isRefreshAbuse, setIsRefreshAbuse] = useState(false);
  const [
    isAutoLabelingButtonLoading,
    setIsAutoLabelingButtonLoading,
  ] = useState(false);
  const [isSendingAPI, setIsSendingAPI] = useState(false);
  const [totalPointCount, setTotalPointCount] = useState(0);
  const [clientIp, setClientIp] = useState("");
  const [isNewCustomAI, setIsNewCustomAI] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState({ customAI: false });
  const [autolabelingState, setAutolabelingState] = useState({});

  const path = window.location.pathname;
  let titleRef = useRef();
  let detailRef = useRef();
  let labelingCountRef = useRef();
  let timer;
  let fileDownloadUrl;

  if (process.env.REACT_APP_DEPLOY) {
    fileDownloadUrl = fileurl + "static/";
  } else {
    fileDownloadUrl = IS_ENTERPRISE
      ? fileurl + "static"
      : "https://astoredslab.s3.ap-northeast-2.amazonaws.com/";
  }

  useEffect(() => {
    const qs = history.location.search;

    if (qs.includes("class_required=true") && selectedPage !== "class")
      history.push(`/admin/labelling/${labelProjectId}`);
  }, [selectedPage]);

  useEffect(() => {
    if (
      labelProjectId &&
      parseInt(labelProjectId) !== labelprojects.projectDetail?.id
    ) {
      setIsLoading(true);
      dispatch(getLabelProjectRequestAction(labelProjectId));
    }
  }, [labelProjectId]);

  useEffect(() => {
    if (labelprojects?.projectDetail?.isShared) setIsShared(true);
    else setIsShared(false);
  }, [labelprojects?.projectDetail?.isShared]);

  useEffect(() => {
    if (labelprojects?.projectDetail?.chart?.ready == 0) {
      setIsAutoLabelingLoading(false);
    } else {
      setIsAutoLabelingLoading(true);
    }
  }, [labelprojects?.projectDetail]);

  useEffect(() => {
    if (Object.keys(labelChart).length > 0) {
      const prepare = labelChart.prepare;
      const done = labelChart.done;
      const stage = customAIStage;

      let customMaxLimit = 1000000;
      let basis = 100000;

      if (stage < 3) {
        customMaxLimit = 1000 * 10 ** stage;
        basis = 100 * 10 ** stage;
      }

      if (autoLabelingAiType === "custom") {
        setIsAbleToChangeAmount(false);

        if (done < basis) {
          customMaxLimit = customMaxLimit / 10;
        }

        if (customMaxLimit < prepare) {
          setAutoLabelingAmount(customMaxLimit);
        } else {
          setAutoLabelingAmount(prepare);
        }
      } else {
        if (100 >= prepare) {
          setIsAbleToChangeAmount(false);
          setAutoLabelingAmount(prepare);
        } else {
          setIsAbleToChangeAmount(true);
        }
      }
    }
  }, [autoLabelingAiType, labelChart.prepare]);

  useEffect(() => {
    if (labelprojects.projectDetail) {
      if (creatingCustomAiProjectId) {
        getProjectsStatus();
      }
    }
  }, [creatingCustomAiProjectId]);

  useEffect(() => {
    if (labelprojects.projectDetail) {
      if (customAiProjectIdStatus < 100) {
        timer = setInterval(getProjectsStatus, 20000);
        return () => {
          clearInterval(timer);
        };
      } else setIsNewCustomAI(true);
    }
  }, [customAiProjectIdStatus]);

  const getProjectsStatus = () => {
    if (!Cookies.getCookie("jwt") || isShared) {
      return;
    }
    // if (customAiProjectIdStatus < 100) {
    if (creatingCustomAiProjectId) {
      api
        .getProjectsStatus(creatingCustomAiProjectId)
        .then((res) => {
          setCustomAiProjectIdStatus(res.data.status);
          // setHasBestModel(res.data.hasBestModel);
        })
        .catch((e) => {
          console.log(e, "e");
        });
    }
    // }
  };

  useEffect(() => {
    let tmp = 0;
    if (labelprojects.projectDetail && labelprojects.projectDetail.workage) {
      labelprojects.projectDetail.workage.map((w) => {
        tmp += w.pointCount;
      });
      setTotalPointCount(tmp);
    }
  }, [labelprojects.projectDetail && labelprojects.projectDetail.workage]);

  useEffect(() => {
    if (user.me && user.me.usageplan) {
      const pathArr = path.split("/");
      const id = pathArr[pathArr.length - 1];

      setLabelProjectId(id);
    }
  }, [user.me && path]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsClassModalOpen(false);
      dispatch(stopLabelProjectsLoadingRequestAction());
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (labelprojects.isGroupError) onSetShareGroupDict();
  }, [labelprojects.isGroupError]);

  useEffect(() => {
    if (isFromAutoLabelBtn) setIsFromAutoLabelBtn(false);
  }, [isFromAutoLabelBtn]);

  useEffect(() => {
    if (shouldUpdate && !isShared && isAutoLabelingLoading == true) {
      if (labelprojects.isAsyncRequested) {
        return;
      } else {
        dispatch(setLabelProjectAsync());
        setIsAbleToAutoLabeling(true);
        setIsAutoLabelingLoading(false);
      }
    }
  }, [shouldUpdate, labelprojects.isAsyncRequested, isAutoLabelingLoading]);

  useEffect(() => {
    if (labelprojects.projectDetail) {
      const isDesc =
        Boolean(labelChart.review) ||
        (labelprojects.projectDetail.workapp !== "object_detection" &&
          labelprojects.projectDetail.workapp !== "image");
      dispatch(setObjectlistsIsDesc(isDesc));
      dispatch(setObjectlistsSortingValue(labelChart.review ? "status" : "id"));
      setCustomAiModels(labelprojects.projectDetail.customAiModels);
      setCreatingCustomAiProjectId(
        labelprojects.projectDetail.creatingCustomAiProjectId
      );
      setNextProjectName(labelprojects.projectDetail.name);
      setNextProjectDetail(labelprojects.projectDetail.description);
      setLabelChart(labelprojects.projectDetail.chart);
      const labelclassesData = labelprojects.projectDetail.labelclasses;
      setTotalLabelClasses(labelclassesData);
      const classesLength =
        labelclassesData.length > 4 ? 5 : labelclassesData.length;
      let tmpClass = [];
      for (let i = 0; i < classesLength; i++) {
        tmpClass = [...tmpClass, labelclassesData[i]];
      }
      // if (isAutoLabelingLoading == false) {
      setLabelClasses(tmpClass);
      // }
      setDataColumns(labelprojects.projectDetail.dataColumns);
      setPredictColumnName(labelprojects.projectDetail.predictColumnName);

      // const labelClasses = labelprojects.projectDetail.labelclasses;
      const autolabelingprojects = labelprojects.projectDetail.asynctasks;

      // let shouldUpdate = false;
      let shouldUpdate = true;
      autolabelingprojects.forEach((project) => {
        if (
          project.status !== 99 &&
          project.status !== 9 &&
          project.status !== 100 &&
          project.status !== 0
        )
          shouldUpdate = true;
      });
      if (!shouldUpdate) {
        //dispatch(resetLabelProjectAsync());
      } else {
        dispatch(setLabelProjectAsync());
      }
      setShouldUpdate(shouldUpdate);

      const tempClasses = [];
      const labelClassDictRaw = {};
      for (let idx = 0; idx < totalLabelClasses.length; idx++) {
        const name = totalLabelClasses[idx].name;
        labelClassDictRaw[totalLabelClasses[idx].id] =
          totalLabelClasses[idx].completedLabelCount;
        if (tempClasses.indexOf(name) === -1)
          tempClasses.push(totalLabelClasses[idx]);
      }
      setLabelClassDict(labelClassDictRaw);
      // setLabelClasses(tempClasses);
      setSelectedDeleteDict(labelClassDictRaw);

      // autolabelingprojects && autolabelingprojects.map( (autolabelingproject) => {
      //     if (!isAutoLabelingRunning && (autolabelingproject.status === 1 || autolabelingproject.status === 11 )){
      //         setIsAutoLabelingRunning(true);
      //     }
      // });
      setAutoLabeingProjects(autolabelingprojects);
    }
  }, [labelprojects.projectDetail, totalLabelClasses]);

  useEffect(() => {
    if (labelprojects.projectDetail?.id)
      getNoticeHistory({
        start: 1,
        count: 5,
        id: labelprojects.projectDetail?.id,
      });
  }, [labelprojects.projectDetail]);

  useEffect(() => {
    if (groups.parentsGroup && labelprojects.projectDetail) {
      onSetShareGroupDict();
    }
  }, [labelprojects.projectDetail]);

  const onSetShareGroupDict = () => {
    let origianlSharedgroup;
    try {
      origianlSharedgroup = JSON.parse(labelprojects.projectDetail.sharedgroup);
    } catch {
      origianlSharedgroup = [];
    }

    let tempGroupDict = {};
    let isAllTrue = true;
    let sharedgroup = origianlSharedgroup ? origianlSharedgroup : [];

    groups.parentsGroup.forEach((group) => {
      if (sharedgroup.indexOf(group.id) > -1) {
        tempGroupDict[group.id] = true;
      } else {
        tempGroupDict[group.id] = false;
        isAllTrue = false;
      }
    });

    if (isAllTrue) {
      tempGroupDict["all"] = true;
    } else {
      tempGroupDict["all"] = false;
    }
    setGroupCheckboxDict(tempGroupDict);
  };

  const openAutoLabelingModal = () => {
    setIsAutoLabelingModalOpen(true);
  };

  const startAutoLabeling = () => {
    let tmpArray = [];

    generalAIClasses.map((generalClass) => {
      if (generalAIClassChecked[generalClass]) {
        tmpArray.push(generalClass);
      }
    });

    if (autoLabelingAiType === "general" && tmpArray.length < 1) {
      dispatch(
        openErrorSnackbarRequestAction(t("Please select one or more classes"))
      );
      return;
    }

    if (labelChart.prepare > 100 && autoLabelingAmount < 100) {
      dispatch(
        openErrorSnackbarRequestAction(
          t(
            `최소 100장 이상 최대 ${labelChart.prepare}장으로 오토라벨링을 해야 합니다.`
          )
        )
      );
      return;
    }
    let customAIStageValue = customAIStage;
    if (typeof customAIStage === "object") {
      customAIStageValue = customAIStage.stage;
    }
    setIsAutoLabelingButtonLoading(true);
    setIsLoading(true);
    api
      .postAutoLabeling({
        labelproject_id: labelprojects.projectDetail.id,
        autolabeling_type: autoLabelingType,
        autolabeling_ai_type: autoLabelingAiType, //custom, general, inference
        model_id: modelId,
        custom_ai_stage: customAIStageValue,
        general_ai_type: generalAIType,
        inference_ai_type: inferenceAIType,
        preprocessing_ai_type: preprocessingAIClass,
        autolabeling_amount: autoLabelingAmount,
        labeling_class: tmpArray,
      })
      .then((res) => {
        setShouldUpdate(true); //점검
        setIsAutoLabelingLoading(true);

        dispatch(
          openSuccessSnackbarRequestAction(
            t(
              "Auto-labeling will start now. We’ll e-mail you when auto-labeling is complete"
            )
          )
        );
        dispatch(getLabelProjectRequestAction(labelProjectId));
      })
      .catch((e) => {
        setIsAutoLabelingLoading(false);
        if (IS_ENTERPRISE && e.response && e.response.status === 402) {
          window.location.href = "/admin/setting/payment/?cardRequest=true";
          return;
        }
        if (e.response && e.response.status === 401) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("You have been logged out automatically, please log in again")
            )
          );
          setTimeout(() => {
            Cookies.deleteAllCookies();
            history.push("/signin/");
          }, 2000);
          return;
        }
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                i18n?.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "An error occurred during the developing process. Please try again in a moment"
              )
            )
          );
        }
      })
      .finally(() => {
        setIsAutoLabelingButtonLoading(false);
        setIsAutoLabelingModalOpen(false);
      });
  };

  const openInspectingModal = () => {
    setRequestInspectingModalOpen(true);
    dispatch(openModalRequestAction());
  };

  const openLabelingModal = () => {
    setRequestLabelingModalOpen(true);
  };

  const getIpClient = async () => {
    try {
      const response = await axios.get("https://extreme-ip-lookup.com/json");
      const ip = response.data.query;

      setClientIp(ip);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getIpClient();
  }, []);

  const openStartProject = () => {
    const category = labelprojects.projectDetail.workapp;
    const token = Cookies.getCookie("jwt");

    let tempLabellingUrl = getLabelAppUrl(category);

    if (category) {
      if (category === "normal_regression") {
        window.open(
          `${tempLabellingUrl}admin/${LABELAPP_ROUTES[category]}/${
            labelprojects.projectDetail.id
          }/${
            labelprojects.projectDetail.s3UrlID["prepare"]
          }/?token=${token}&start=true&appStatus=prepare&timeStamp=${Date.now()}`,
          "_blank"
        );
      } else {
        if (!labelClasses || labelClasses.length === 0) {
          if (isShared) {
            dispatch(
              openErrorSnackbarRequestAction(
                t(
                  "Labeling cannot proceed because there is no registered class. Register a class through the group leader."
                )
              )
            );
            return;
          } else if (!isShared) {
            dispatch(
              openErrorSnackbarRequestAction(
                t(
                  "You can view the label list after registering at least one label class"
                )
              )
            );
            onSetSelectedPage("class");
            history.push(
              `/admin/labelling/${labelprojects.projectDetail.id}?class_required=true`
            );

            return;
          }
          if (user.me && user.me.isAiTrainer) {
            dispatch(
              openErrorSnackbarRequestAction(
                t(
                  "Labeling cannot proceed because there is no registered class. Please contact us for further information."
                )
              )
            );
            return;
          }
          setSelectedClass({ id: -1, name: "" });
          setColor(generateRandomHexColor());
          setInputClassChangeValue("");
          setIsClassModalOpen(true);
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "You can view the label list after registering at least one label class"
              )
            )
          );
          onSetSelectedPage("class");
          return;
        }
        // if (
        //   !labelprojects.objectLists ||
        //   labelprojects.objectLists.length === 0
        // ) {
        //   dispatch(
        //     openErrorSnackbarRequestAction(
        //       t("There is no labeling file available. Please proceed after confirmation.")
        //     )
        //   );
        //   return;
        // }
        // if (labelChart.prepare + labelChart.working + labelChart.review < 1) {
        //   dispatch(
        //     openErrorSnackbarRequestAction(
        //       t("Cannot find an incomplete label file")
        //     )
        //   );
        // return;
        // }
        if (category === "object_detection") {
          window.open(
            `${tempLabellingUrl}${labelprojects.projectDetail.id}/${
              labelprojects.projectDetail.s3UrlID["prepare"]
            }/?token=${token}&start=true&appStatus=prepare&timeStamp=${Date.now()}`,
            "_blank"
          );
        } else {
          window.open(
            `${tempLabellingUrl}admin/${LABELAPP_ROUTES[category]}/${
              labelprojects.projectDetail.id
            }/${
              labelprojects.projectDetail.s3UrlID["prepare"]
            }/?token=${token}&start=true&appStatus=prepare&timeStamp=${Date.now()}`,
            "_blank"
          );
        }
      }
    }
  };

  const openInspectProject = () => {
    const category = labelprojects.projectDetail.workapp;
    const token = Cookies.getCookie("jwt");

    let tempLabellingUrl = getLabelAppUrl(category);

    if (category) {
      if (category === "normal_regression") {
        window.open(
          `${tempLabellingUrl}admin/${LABELAPP_ROUTES[category]}/${
            labelprojects.projectDetail.id
          }/${
            labelprojects.projectDetail.s3UrlID["review"]
          }/?token=${token}&start=true&appStatus=review&timeStamp=${Date.now()}`,
          "_blank"
        );
      } else {
        if (!labelClasses || labelClasses.length === 0) {
          if (isShared) {
            dispatch(
              openErrorSnackbarRequestAction(
                t(
                  "Labeling cannot proceed because there is no registered class. Register a class through the group leader."
                )
              )
            );
            return;
          } else if (!isShared) {
            dispatch(
              openErrorSnackbarRequestAction(
                t(
                  "You can view the label list after registering at least one label class"
                )
              )
            );
            onSetSelectedPage("class");
            return;
          }
          if (user.me && user.me.isAiTrainer) {
            dispatch(
              openErrorSnackbarRequestAction(
                t(
                  "Labeling cannot proceed because there is no registered class. Please contact us for further information."
                )
              )
            );
            return;
          }
          setSelectedClass({ id: -1, name: "" });
          setColor(generateRandomHexColor());
          setInputClassChangeValue("");
          setIsClassModalOpen(true);
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "You can view the label list after registering at least one label class"
              )
            )
          );
          onSetSelectedPage("class");
          return;
        }
        // if (
        //   !labelprojects.objectLists ||
        //   labelprojects.objectLists.length === 0
        // ) {
        //   dispatch(
        //     openErrorSnackbarRequestAction(
        //       t("There is no labeling file available. Please proceed after confirmation.")
        //     )
        //   );
        //   return;
        // }

        // if (labelChart.prepare + labelChart.working + labelChart.review < 1) {
        //   dispatch(
        //     openErrorSnackbarRequestAction(
        //       t("Cannot find an incomplete label file")
        //     )
        //   );
        // } else {

        // }
        if (category === "object_detection") {
          window.open(
            `${tempLabellingUrl}${labelprojects.projectDetail.id}/${
              labelprojects.projectDetail.s3UrlID["review"]
            }/?token=${token}&start=true&appStatus=review&timeStamp=${Date.now()}`,
            "_blank"
          );
        } else {
          window.open(
            `${tempLabellingUrl}admin/${LABELAPP_ROUTES[category]}/${
              labelprojects.projectDetail.id
            }/${
              labelprojects.projectDetail.s3UrlID["review"]
            }/?token=${token}&start=true&appStatus=review&timeStamp=${Date.now()}`,
            "_blank"
          );
        }
      }
    }
  };

  const goBackToProjectLists = () => {
    history.push("/admin/labelling");
  };

  const has100LabelingPerLabelClasses = () => {
    var hasLessThan100LabelInLabelClass = false;
    labelClassDict &&
      Object.values(labelClassDict).map((value) => {
        if (value < 100) {
          hasLessThan100LabelInLabelClass = true;
        }
      });
    return !hasLessThan100LabelInLabelClass;
  };

  const renderStatusChart = () => {
    const dataList = [
      { name: "In queue", value: labelChart.prepare, color: "#585c61" },
      { name: "In process", value: labelChart.working, color: "#41D4D7" },
      { name: "Autolabeling", value: labelChart.ready, color: "#6610f2" },
      { name: "Under review", value: labelChart.review, color: "#5DFDCB" },
      { name: "Reject", value: labelChart.reject, color: "#ff6c00" },
      { name: "Completed", value: labelChart.done, color: "#1A70E8" },
    ];

    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length !== 0) {
        return (
          <div
            className="custom-tooltip"
            style={{
              background: "var(--surface1)",
              border: `1px solid var(--textWhite87)`,
            }}
          >
            <span
              style={{
                padding: "8px 16px",
                fontSize: 14,
                color: "var(--textWhite87)",
              }}
            >
              {`${t(payload[0].name)} : ${
                payload[0].value ? payload[0].value.toLocaleString() : 0
              }`}
            </span>
          </div>
        );
      }
      return null;
    };

    return (
      <div
        id="labelStatusChart"
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          color: currentThemeColor.textWhite87,
          justifyContent: "space-around",
        }}
      >
        <PieChart width={180} height={180}>
          <Pie
            dataKey="value"
            data={dataList}
            innerRadius={50}
            outerRadius={80}
            startAngle={90}
            endAngle={-450}
          >
            {dataList.map((entry, index) => (
              <Cell
                key={entry.name}
                className={classes.pieAnimation}
                fill={entry.color}
              />
            ))}
          </Pie>
          <RechartsTooltip
            content={<CustomTooltip />}
            position={{ x: "-50%", y: "50%" }}
          />
        </PieChart>

        <div style={{ width: "40%" }} className={classes.settingFontWhite87}>
          {dataList.map((data) => {
            return (
              <div key={data.name + data.value} style={{ display: "flex" }}>
                <div style={{ minWidth: "64px", width: "50%" }}>
                  {t(data.name)}
                </div>
                {`: ${data.value ? data.value.toLocaleString() : 0}`}
              </div>
            );
          })}
          <div
            style={{
              display: "flex",
              borderTop: "0.5px solid" + currentThemeColor.secondary1,
              marginTop: "8px",
              paddingTop: "8px",
            }}
          >
            <div style={{ minWidth: "64px", width: "50%" }}>{t("Total")}</div>
            {`: ${labelChart.all ? labelChart.all.toLocaleString() : 0}`}
          </div>
        </div>
      </div>
    );
  };

  const onSetSelectedPage = (page) => {
    setSelectedPage(page);
  };

  const onLetAbleToChangeDetail = async () => {
    await setIsUnableToChangeDetail(false);
    await detailRef.current.focus();
  };
  const onLetAbleToChangeName = async () => {
    await setIsUnableToChangeName(false);
    await titleRef.current.focus();
  };

  const saveProjectDetail = async () => {
    await dispatch(
      askLabelProjectDetailRequestAction({
        message: t("Do you want to edit the project description?"),
        requestAction: "putLabelProject",
        data: {
          type: "description",
          params: { description: nextProjectDetail },
        },
      })
    );
    await setIsUnableToChangeDetail(true);
  };
  const saveProjectName = async () => {
    await dispatch(
      askLabelProjectDetailRequestAction({
        message: t("Do you want to change the project name?"),
        requestAction: "putLabelProject",
        data: { type: "name", params: { name: nextProjectName } },
      })
    );
    await setIsUnableToChangeName(true);
  };
  useEffect(() => {
    if (
      messages.requestAction === "putLabelProject" &&
      messages.datas === null
    ) {
      if (
        messages.message === "프로젝트명을 바꾸시겠습니까?" ||
        messages.message === "Do you want to change the project name?"
      ) {
        setNextProjectName(labelprojects.projectDetail?.name);
      } else if (
        messages.message === "프로젝트 설명을 바꾸시겠습니까?" ||
        messages.message === "Do you want to edit the project description?"
      ) {
        setNextProjectDetail(labelprojects.projectDetail?.description);
      }
    }
  }, [messages.datas]);

  const onCancelChangeDetail = () => {
    setNextProjectDetail(labelprojects.projectDetail.description);
    setIsUnableToChangeDetail(true);
  };
  const onCancelChangeName = () => {
    setNextProjectName(labelprojects.projectDetail.name);
    setIsUnableToChangeName(true);
  };
  const onChangeDetailInput = (e) => {
    if (e.target.value.length > 500) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("Please enter a description of less than 500 characters.")
        )
      );
      return;
    }
    setNextProjectDetail(e.target.value);
  };
  const onChangeNameInput = (e) => {
    setNextProjectName(e.target.value);
  };

  const onChangeClasses = (label) => {
    setSelectedClass(label);
    setColor(label.color);
    setInputClassChangeValue(label.name);
    setIsClassModalOpen(true);
  };
  const onSetNewClass = () => {
    setSelectedClass({ id: -1, name: "" });
    setColor(generateRandomHexColor());
    setInputClassChangeValue("");
    setIsClassModalOpen(true);
  };

  const changeInputNameChangeValue = (e) => {
    setInputClassChangeValue(e.target.value);
  };

  const onSetChangeClassName = () => {
    if (!inputClassChangeValue.match(/^[a-zA-Z]+[a-zA-Z0-9_]*$/)) {
      dispatch(
        openErrorSnackbarRequestAction(
          t(
            "Class names can only contain characters that start with an English letter (numbers and _ can be included)"
          )
        )
      );
      return;
    }

    let hasSameClassName = false;

    totalLabelClasses.forEach((each) => {
      if (each.id !== selectedClass.id && inputClassChangeValue === each.name) {
        dispatch(
          openErrorSnackbarRequestAction(t("Class name already exists"))
        );
        hasSameClassName = true;
        return;
      }
    });

    if (hasSameClassName) return;

    setIsClassModalOpen(false);

    if (selectedClass && selectedClass.id === -1) {
      const labelClass = {
        name: inputClassChangeValue,
        color: color,
        labelproject: labelprojects.projectDetail.id,
      };
      dispatch(postLabelClassRequestAction(labelClass));
    } else {
      setSelectedUpdateDict([
        ...selectedUpdateDict,
        {
          labelclassId: selectedClass.id,
          name: inputClassChangeValue,
          color: color,
        },
      ]);
    }
  };

  const onChangeColor = (obj) => {
    // setColor(obj.color);
    if (obj.hex) {
      setColor(obj.hex);
    }
  };

  const generateRandomHexColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  const autoLabelingModalClose = () => {
    setIsAutoLabelingModalOpen(false);
    if (isAutoLabelingLoading) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("Auto labeling is in progress. Please wait.")
        )
      );
      return;
    }
  };

  const addCustomAIModalClose = () => {
    setIsAddCustomAIModalOpen(false);
  };

  const handleClickForShare = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const onCloseShareMenu = () => {
    setAnchorEl(null);
  };

  const onChangeShareGroup = async (e) => {
    const value = e.target.value;
    let tempGroupArr = [];
    if (value === "all") {
      if (groupCheckboxDict["all"]) {
        let tempGroupDict = { all: false };
        for (let value in groupCheckboxDict) {
          tempGroupDict[value] = false;
        }
        await setGroupCheckboxDict(tempGroupDict);
        await dispatch(
          updateLabelShareGroupRequestAction({
            projectId: labelprojects.projectDetail.id,
            groupId: ["-1"],
            isUpdate: false,
          })
        );
      } else {
        let tempGroupDict = { all: true };
        for (let value in groupCheckboxDict) {
          tempGroupDict[value] = true;
        }
        await setGroupCheckboxDict(tempGroupDict);
        await dispatch(
          updateLabelShareGroupRequestAction({
            projectId: labelprojects.projectDetail.id,
            groupId: ["-1"],
            isUpdate: true,
          })
        );
      }
    } else if (value === "aitrainer") {
      const isShareToAiTrainer = labelprojects.projectDetail.shareaitrainer;
      await dispatch(
        postAiTrainerLabelprojectRequestAction({
          labelId: labelprojects.projectDetail.id,
          isshared: !isShareToAiTrainer,
        })
      );
    } else {
      await setGroupCheckboxDict((prevState) => {
        return { ...prevState, all: false, [value]: !groupCheckboxDict[value] };
      });
      tempGroupArr.push(value);
      await dispatch(
        updateLabelShareGroupRequestAction({
          projectId: labelprojects.projectDetail.id,
          groupId: tempGroupArr,
          isUpdate: !groupCheckboxDict[value],
        })
      );
    }
    await onCloseShareMenu();
  };

  const onChangeAutoLabelingAiType = (e) => {
    const autolabeingType = e.target.name;
    setAutoLabelingAiType(autolabeingType);
    setModelId(null);
    setGeneralAIType("");

    if (autolabeingType == "custom" && customAiModels?.length > 0) {
      setModelId(customAiModels[0].id);
    } else if (autolabeingType === "general") {
      let genralAiModel = GENERAL_AI_GROUPS[0];
      onChangeGeneralAIType(genralAiModel.name);
      onChangeAutoLabelingType("box");
    }
  };

  const onChangeGeneralAIType = (generalAiModelName) => {
    setAutoLabelingAiType("general");
    setGeneralAIType(generalAiModelName);
    setModelId(null);

    if (
      generalAiModelName === "facepoint" ||
      generalAiModelName === "keypoint"
    ) {
      onChangeAutoLabelingType(generalAiModelName);
    } else {
      onChangeAutoLabelingType("box");
    }

    const generalClasses = GENERAL_AI_MODELS[generalAiModelName];
    setGeneralAIClasses(generalClasses);
    let tmpChecked = {};
    generalClasses.map((generalClass) => {
      tmpChecked = { ...tmpChecked, [generalClass]: true };
    });
    setGeneralAIClassChecked(tmpChecked);
  };

  const handleGeneralAIClassChecked = (generalClass) => {
    setGeneralAIClassChecked((prevState) => {
      return {
        ...prevState,
        [generalClass]: !generalAIClassChecked[generalClass],
      };
    });
  };

  const onChangeAutoLabelingType = (type) => {
    setAutoLabelingType(type);
  };

  const onChangeInferenceAIType = (e) => {
    setAutoLabelingAiType("inference");
    setGeneralAIType("");
    setInferenceAIType(e);
  };
  const onChangePreprocessingAIType = (e) => {
    setPreprocessingAIClass({
      ...preprocessingAIClass,
      [e.target.value]: e.target.checked,
    });
  };

  const onChangeCustomAIModel = (e) => {
    setAutoLabelingAiType("custom");
    setInferenceAIType("");
    setGeneralAIType("");
    setModelId(Number(e.target.value));
    customAiModels.map((customAiModel) => {
      if (customAiModel.id === Number(e.target.value)) {
        setCustomAIStage(customAiModel.stage);
      }
    });
  };

  const onChangeAutoLabelingAmount = (e) => {
    const amount = e.target.value / 1;
    const prepare = labelChart.prepare;
    const tmpAmount = amount > prepare ? prepare : amount < 0 ? 1 : amount;

    setAutoLabelingAmount(tmpAmount);
    labelingCountRef.current.value = tmpAmount;
  };

  const reloadButton = (
    <Tooltip
      title={<span style={{ fontSize: "12px" }}>{t("refresh project")}</span>}
      placement="top"
    >
      <AutorenewIcon
        id="projectRefreshBtn"
        className={
          !isRefreshAbuse
            ? classes.refreshIconActive
            : classes.refreshIconDefault
        }
        onClick={() => {
          dispatch(setIsProjectRefreshed(true));
        }}
      />
    </Tooltip>
  );

  // const getS3key = (key) => {
  //   const keyArr = key.split("/");
  //   let parseUrl = "";
  //   keyArr.forEach((key) => {
  //     parseUrl += encodeURIComponent(key) + "/";
  //   });
  //   parseUrl = encodeURI(parseUrl);
  //   return IS_ENTERPRISE
  //     ? process.env.REACT_APP_BACKEND_URL + parseUrl
  //     : key;
  // };
  const getS3key = (key) => {
    if (key) {
      return IS_ENTERPRISE && key.indexOf("http") === -1
        ? `${fileurl}static/${key}`
        : key;
      // return key;
    }
  };

  const selectDeleteClasses = (e) => {
    selectedDeleteDict[e.target.value] = Number(
      !selectedDeleteDict[e.target.value]
    );
  };

  const deleteLabelClasses = () => {
    let list = [];
    for (let prop in selectedDeleteDict) {
      if (selectedDeleteDict[prop]) {
        list.push(Number(prop));
      }
    }
    setIsDeleteLabelClasses(false);
    const pathArr = path.split("/");
    const id = pathArr[pathArr.length - 1];
    dispatch(
      askDeleteLabelClassRequestAction({
        id: id,
        arr: list,
        language: i18n?.language,
      })
    );
  };

  const cancelSelectLabelClasses = () => {
    for (let prop in selectedDeleteDict) {
      selectedDeleteDict[prop] = 0;
    }
    setIsDeleteLabelClasses(false);
  };

  const startSelectLabelClasses = () => {
    for (let prop in selectedDeleteDict) {
      selectedDeleteDict[prop] = 0;
    }
    setIsDeleteLabelClasses(true);
  };

  const cancelUpdateLabelClasses = () => {
    setSelectedUpdateDict([]);
    setIsUpdateLabelClasses(false);
  };

  const updateLabelClasses = () => {
    dispatch(
      putLabelClassRequestAction({
        labelClass: selectedUpdateDict,
        labelProjectId: labelprojects.projectDetail.id,
      })
    );
  };

  const startUpdateLabelClasses = () => {
    setIsUpdateLabelClasses(true);
  };

  const getNoticeHistory = (data) => {
    if (!isShared) {
      getAsynctaskAll(data, true)
        .then((res) => {
          setNoticeHistory(res.data.asynctasks);
          setIsLoading(false);
        })
        .catch((e) => {
          console.log(e, "e");
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  };

  const tableBodys = [
    { value: "taskType", name: "content" },
    { value: "created_at", name: "date" },
  ];
  const classCondition = [0, 9, 99, 100];
  const disabledCondition = [1, 10, 11, 21, 31, 61];
  const customAiStatusTypes = {
    error: [9, 99],
    develope: [0, 1, 10, 11, 20, 21, 30, 31, 51, 61],
    done: [100],
  };

  const createCustomAIBtn = (isAdd) => {
    let isAbledToStartCustomAI = false;
    let isLastStatusExist = false;
    let isLabelProjectNotExist = false;
    let isLabelChartDoneMoreTen = false;
    let isNormalProject = false;
    let isObjectDetection = false;
    let labelClassLen = labelClasses.length;
    const workapp = labelprojects.projectDetail?.workapp;

    if (
      classCondition.indexOf(
        autoLabeingProjects[autoLabeingProjects.length - 1]?.status
      ) > -1
    )
      isLastStatusExist = true;
    if (autoLabeingProjects.length === 0) isLabelProjectNotExist = true;

    // 최소 10개 이상의 라벨링된 데이터가 존재해야 커스텀ai 개발 시작 가능
    if (labelChart.done >= 10) isLabelChartDoneMoreTen = true;

    // !6/24 모델 배포하며 생성된 라벨프로젝트일 경우 임시적으로 normal 타입으로 설정
    if (!workapp || workapp.includes("normal")) isNormalProject = true;
    if (workapp === "object_detection") isObjectDetection = true;

    if (
      (isLastStatusExist || isLabelProjectNotExist) &&
      isLabelChartDoneMoreTen &&
      (workapp === "normal_regression" ||
        (isObjectDetection && labelClassLen > 0) ||
        labelClassLen > 1) // 클래스 지정은 normal_regression 이 아닌 타입 중 물체인식은 최소 1개, 그 외는 분류이므로 최소 2개 필요
    )
      isAbledToStartCustomAI = true;

    if (isAbledToStartCustomAI)
      return (
        <Button
          id="create_customai_btn"
          shape="greenContained"
          style={{
            margin: 0,
            marginLeft: "auto",
          }}
          onClick={() => {
            if (isAdd) setIsAddCustomAIModalOpen(true);
            else setIsCustomAIModalOpen(true);
          }}
        >
          {isCustomAiLoading || creatingCustomAiProjectId
            ? t("Create New CUSTOM AI")
            : t("Create CUSTOM AI")}
        </Button>
      );
    else
      return (
        <Tooltip
          title={
            isAbleToAutoLabeling && isAutoLabelingLoading ? (
              <span>
                {t("Custom AI cannot be created during autolabeling.")}
              </span>
            ) : (
              <>
                {workapp !== "normal_regression" &&
                  ((isObjectDetection && labelClassLen === 0) ||
                    (!isObjectDetection && labelClassLen < 2)) && (
                    <span style={{ display: "block", marginRight: "8px" }}>
                      {"- " + t("Please specify the label class.")}
                      {!isObjectDetection &&
                        labelClassLen < 2 &&
                        `(${t("at least")} 2)`}
                      <br />
                    </span>
                  )}
                {!isLabelChartDoneMoreTen && (
                  <span style={{ display: "block", marginRight: "8px" }}>
                    {"- " + t("More than 10 completed data is required.")}
                    <br />
                  </span>
                )}
              </>
            )
          }
          placement="bottom"
        >
          <div
            style={{
              margin: 0,
              marginLeft: "auto",
            }}
          >
            <Button id="create_customai_disabled_btn" disabled>
              {t("Create CUSTOM AI")}
            </Button>
          </div>
        </Tooltip>
      );
  };

  const setAutoLabelingDisabledText = () => {
    const tooltipTexts = [];

    if (autolabelingState.hasNoAutoLabelingData)
      tooltipTexts.push("'시작전' 또는 '진행중' 데이터 없음");

    if (autolabelingState.hasReviewData) tooltipTexts.push("데이터 검수 필요");

    if (autolabelingState.isRequiredCustomAIModel)
      tooltipTexts.push("Custom AI 생성 필요");

    if (
      disabledCondition.indexOf(
        autoLabeingProjects[autoLabeingProjects.length - 1]?.status
      ) > -1
    )
      tooltipTexts.push(
        "진행중인 오토라벨링이 있어서 오토라벨링을 새로 시작할 수 없습니다."
      );

    return tooltipTexts;
  };

  const startAutoLabelingBtn = () => {
    const isDisabledToAutoLabeling =
      disabledCondition.indexOf(
        autoLabeingProjects[autoLabeingProjects.length - 1]?.status
      ) > -1 ||
      labelChart.prepare < 1 ||
      labelChart.review > 0 ||
      Object.keys(autolabelingState).filter(
        (key) =>
          key !== "canOnlyUseGeneralAI" && autolabelingState[key] === true
      ).length > 0;
    const tooltipTexts = setAutoLabelingDisabledText();

    return (
      !(isCustomAiLoading || creatingCustomAiProjectId) &&
      (isDisabledToAutoLabeling ? (
        <Tooltip
          title={
            <>
              {tooltipTexts.map((text, i) => (
                <span style={{ display: "block" }}>{"- " + t(text)}</span>
              ))}
            </>
          }
          placement="bottom"
        >
          <div>
            <Button
              id="start_autolabeling_disabled_btn"
              disabled
              style={{ marginLeft: 15 }}
            >
              {t("Start auto-labeling")}
            </Button>
          </div>
        </Tooltip>
      ) : (
        <Button
          id="start_autolabeling_btn"
          shape="greenOutlined"
          style={{
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 15,
          }}
          onClick={openAutoLabelingModal}
        >
          {t("Start auto-labeling")}
        </Button>
      ))
    );
  };

  const upperLabelingButtons = [
    {
      id: "start_labelling",
      name: "prepare",
      onClickFunc: openStartProject,
      label: "Start manual labeling",
    },
    {
      id: "review_labelling",
      name: "review",
      onClickFunc: openInspectProject,
      label: "Review labeling",
    },
  ];

  useEffect(() => {
    const project = labelprojects.projectDetail;
    const customAIDisabled =
      disabledCondition.indexOf(
        autoLabeingProjects[autoLabeingProjects.length - 1]?.status
      ) > -1 ||
      labelChart.done < 10 ||
      project?.workapp === "voice";

    setBtnDisabled({ ...btnDisabled, customAI: customAIDisabled });

    const hasNoAutoLabelingData =
      labelChart.prepare === 0 && labelChart.working === 0;
    const hasReviewData = labelChart.review > 0;
    const canOnlyUseGeneralAI =
      (hasNoAutoLabelingData ||
        (!isCustomAiLoading && !creatingCustomAiProjectId)) &&
      project?.workapp === "object_detection";
    const isRequiredCustomAIModel =
      project?.customAiModels?.length === 0 &&
      project?.workapp !== "object_detection";

    setAutolabelingState({
      hasNoAutoLabelingData,
      hasReviewData,
      canOnlyUseGeneralAI,
      isRequiredCustomAIModel,
    });
  }, [
    autoLabeingProjects,
    labelChart,
    labelprojects.projectDetail,
    isCustomAiLoading,
    creatingCustomAiProjectId,
  ]);

  useEffect(() => {
    if (labelprojects.isProjectRefreshed) {
      if (selectedPage === "overview")
        dispatch(getLabelProjectRequestAction(labelProjectId));

      dispatch(setIsProjectRefreshed(false));
    }
  }, [labelprojects.isProjectRefreshed]);

  // useEffect(() => {
  //   const tmpCondition =
  //     (labelChart?.prepare !== 0 || labelChart?.working !== 0) &&
  //     (labelprojects.projectDetail?.workapp === "object_detection" ||
  //       labelChart?.done >= 10);

  //   setIsAbleToAutoLabeling(tmpCondition);
  // }, [labelChart, labelprojects.projectDetail]);

  return (
    <div>
      <ReactTitle title={"DS2.ai - " + t("Labeling")} />
      <div>
        {(((labelprojects.isLoading || isLoading) &&
          !labelprojects.isAsyncRequested &&
          !labelprojects.isPreviewOpened) ||
          labelprojects.isWorkappLoading == true ||
          labelprojects.isLabelLoading == true ||
          labelprojects.projectDetail == null) &&
        (!labelprojects.isLabelClassDeleteLoading &&
          !labelprojects.isLabelClassAddLoading) ? (
          <div className={classes.smallLoading}>
            <CircularProgress size={50} sx={{ mb: 3.5 }} />
            <div style={{ fontSize: 15 }}>
              {t("Loading project. Please wait.")}
            </div>
          </div>
        ) : (
          <div>
            <Grid container alignItems="center" sx={{ margin: "40px 0 28px" }}>
              <Grid item className={classes.topTitle}>
                {labelprojects.projectDetail?.name}
              </Grid>
              <Grid item xs style={{ marginLeft: "30px" }}>
                <Grid container alignItems="center">
                  {/* {user.me &&
                !user.me.isAiTrainer &&
                !isShared && (
                  <Tooltip
                    title={
                      !has100LabelingPerLabelClasses()
                        ? t(
                            "오토 라벨링을 시작하기 위해서는 학습 데이터로 쓰일 라벨 클래스당 100개의 라벨이 필요합니다."
                          )
                        : (labelChart && labelChart.prepare) === 0
                        ? t("There are no more labels to process")
                        : (labelChart && labelChart.review) > 0
                        ? t(
                            "앞서 실행한 오토라벨링 검수가 끝나면 다음 단계의 오토 라벨링(검수 완료 기준 라벨의 10배)이 가능합니다."
                          )
                        : t(
                            "오토 라벨링을 통해 현재 완료된 라벨링 개수의 10배를 자동으로 라벨링합니다."
                          )
                    }
                    placement="top"
                  >
                    <HelpOutlineIcon
                      fontSize="xs"
                      style={{ marginLeft: "4px", cursor: "pointer" }}
                      id="helpIcon"
                    />
                  </Tooltip>
                )} */}
                  {/* <Button
                  style={{
                    width: "160px",
                    marginRight: "24px",
                    height: "25px",
                    fontSize: user.language === "en" ? "9px" : "10px",
                  }}
                  id="requestInspecting"
                  className={classes.defaultOutlineButton}
                  onClick={openInspectingModal}
                >
                  {t("Request an inspection")}
                </Button>
                <Button
                  style={{
                    width: "160px",
                    marginRight: "24px",
                    height: "25px",
                    fontSize: user.language === "en" ? "9px" : "10px",
                  }}
                  id="requestLabeling"
                  className={classes.defaultOutlineButton}
                  onClick={openLabelingModal}
                >
                  {t("Request manual labeling")}
                </Button> */}

                  {upperLabelingButtons.map((btnComp) => (
                    <Button
                      key={btnComp.id}
                      id={`${btnComp.id}_btn`}
                      shape="greenOutlined"
                      disabled={
                        !labelprojects.projectDetail?.s3UrlID ||
                        !labelprojects.projectDetail?.s3UrlID[btnComp.name]
                      }
                      style={{
                        minWidth: "160px",
                        marginRight: "10px",
                      }}
                      onClick={btnComp.onClickFunc}
                    >
                      {t(btnComp.label)}
                    </Button>
                  ))}
                  {reloadButton}
                  {createCustomAIBtn(
                    creatingCustomAiProjectId &&
                      customAiStatusTypes["error"].indexOf(
                        customAiProjectIdStatus
                      ) === -1 &&
                      "add"
                  )}
                </Grid>
              </Grid>
            </Grid>
            <div
              className={classes.titleContainer}
              style={{ width: "100%", marginBottom: "36px" }}
            >
              <Grid container className={classes.pageList} wrap="nowrap">
                <Grid
                  item
                  onClick={() => onSetSelectedPage("overview")}
                  id="dashboard_tab"
                  className={
                    selectedPage === "overview"
                      ? classes.selectedListObject
                      : classes.listObject
                  }
                >
                  {t("Dashboard")}
                </Grid>
                <Grid
                  item
                  onClick={() => onSetSelectedPage("list")}
                  id="data_list_tab"
                  className={
                    selectedPage === "list"
                      ? classes.selectedListObject
                      : classes.listObject
                  }
                >
                  {t("Data List")}
                </Grid>
                {labelprojects.projectDetail?.workapp !==
                  "normal_regression" && (
                  <Grid
                    item
                    onClick={() => onSetSelectedPage("class")}
                    id="class_tab"
                    className={
                      selectedPage === "class"
                        ? classes.selectedListObject
                        : classes.listObject
                    }
                  >
                    {isShared ? t("My class") : t("Class")}
                  </Grid>
                )}
                <Grid
                  item
                  onClick={() => onSetSelectedPage("member")}
                  id="member_tab"
                  className={
                    selectedPage === "member"
                      ? classes.selectedListObject
                      : classes.listObject
                  }
                >
                  {t("Members")}
                </Grid>
                {user.me && !user.me.isAiTrainer && !isShared && (
                  <>
                    <Grid
                      onClick={() => onSetSelectedPage("export")}
                      id="export_tab"
                      className={
                        selectedPage === "export"
                          ? classes.selectedListObject
                          : classes.listObject
                      }
                    >
                      {t("Export")}
                    </Grid>
                    <Grid
                      item
                      onClick={() => onSetSelectedPage("setting")}
                      id="setting_tab"
                      className={
                        selectedPage === "setting"
                          ? classes.selectedListObject
                          : classes.listObject
                      }
                    >
                      {t("Settings")}
                    </Grid>
                  </>
                )}
              </Grid>
            </div>
            {/* {user.me &&
              user.me.usageplan.planName !== "trial" &&
              parseInt(user.me.id) ===
                parseInt(labelprojects.projectDetail.user) && (
                <div className={classes.alignRight}>
                  <Button
                    id="sharProjectBtn"
                    className={classes.defaultOutlineButton}
                    style={{ width: "160px", borderWidth: "1.5px" }}
                    onClick={handleClickForShare}
                  >
                    SHARE
                  </Button>
                  <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={onCloseShareMenu}
                  >
                    <MenuItem>
                      <div className={classes.defaultContainer}>
                        <b>Share to AlTrainer</b>
                        <Switch
                          className="shareGroupSwitch"
                          value="aitrainer"
                          checked={
                            labelprojects.projectDetail.shareaitrainer
                              ? true
                              : false
                          }
                          color="primary"
                          inputProps={{ "aria-label": "primary checkbox" }}
                          onChange={onChangeShareGroup}
                        />
                      </div>
                    </MenuItem>
                    <MenuItem>
                      <div className={classes.defaultContainer}>
                        <b>Share to All Group</b>
                        <Switch
                          value="all"
                          checked={groupCheckboxDict["all"] ? true : false}
                          color="primary"
                          inputProps={{ "aria-label": "primary checkbox" }}
                          onChange={onChangeShareGroup}
                        />
                      </div>
                    </MenuItem>
                    {groups.parentsGroup &&
                      groups.parentsGroup.map((group) => {
                        var isChecked = groupCheckboxDict[group.id]
                          ? true
                          : false;
                        return (
                          <MenuItem>
                            <div className={classes.defaultContainer}>
                              <b>Share to {group.groupname}</b>
                              <Switch
                                value={group.id}
                                checked={isChecked}
                                color="primary"
                                inputProps={{
                                  "aria-label": "primary checkbox",
                                }}
                                onChange={onChangeShareGroup}
                              />
                            </div>
                          </MenuItem>
                        );
                      })}
                  </Menu>
                </div>
              )} */}
            {selectedPage === "overview" && (
              <GridContainer>
                {/* {(isAbleToAutoLabeling || isAutoLabelingLoading) && ( */}
                <GridItem xs={12} lg={12} style={{ padding: "0 5px" }}>
                  <div
                    className={classes.dashboardMain}
                    style={{ minHeight: 0 }}
                  >
                    <GridContainer
                      justifyContent="space-between"
                      alignItems="center"
                      style={{ paddingTop: 0 }}
                    >
                      <GridItem
                        style={{
                          textAlign: "left",
                          alignItems: "left",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          component="div"
                          style={{
                            color: currentThemeColor.textWhite87,
                            fontSize: 18,
                            fontWeight: 500,
                          }}
                        >
                          {`${t("Auto-labeling Status")}: `}
                          {isCustomAiLoading || creatingCustomAiProjectId
                            ? customAiProjectIdStatus === 100
                              ? t("CUSTOM AI Training Completed")
                              : t("Creating CUSTOM AI.")
                            : isAbleToAutoLabeling &&
                              (isAutoLabelingLoading
                                ? t("Autolabelling.")
                                : autolabelingState.hasNoAutoLabelingData
                                ? t("No data 'In queue' or 'In process'")
                                : autolabelingState.hasReviewData
                                ? t("Data Inspection Required")
                                : autolabelingState.canOnlyUseGeneralAI
                                ? t("General AI available")
                                : autolabelingState.isRequiredCustomAIModel
                                ? t("Custom AI creation required")
                                : t("Data Selection"))}
                        </Typography>
                      </GridItem>
                      <GridItem
                        style={{
                          textAlign: "right",
                          alignItems: "right",
                          justifyContent: "center",
                        }}
                      >
                        {creatingCustomAiProjectId &&
                        customAiStatusTypes["error"].indexOf(
                          customAiProjectIdStatus
                        ) === -1
                          ? customAiProjectIdStatus === 100 &&
                            labelprojects.projectDetail?.workapp ===
                              "object_detection" && (
                              <Button
                                id="select_bestcustomai_btn"
                                shape="greenOutlined"
                                disabled={
                                  disabledCondition.indexOf(
                                    autoLabeingProjects[
                                      autoLabeingProjects.length - 1
                                    ]?.status
                                  ) > -1 || labelChart.done < 1
                                }
                                onClick={() => {
                                  setIsSampleModelModalOpen(true);
                                }}
                              >
                                {t("Choose Best Custom AI")}
                              </Button>
                            )
                          : !isAutoLabelingLoading && startAutoLabelingBtn()}
                      </GridItem>
                    </GridContainer>
                  </div>
                </GridItem>
                {/* )} */}

                <GridItem xs={12} md={6} style={{ padding: "0 5px" }}>
                  <div className={classes.dashboardMain}>
                    <Typography
                      component="div"
                      className={classes.dashbordTitle}
                      gutterBottom
                    >
                      {t("Project Information")}
                    </Typography>
                    <Typography
                      component="div"
                      className={classes.content}
                      style={{ padding: "0 16px" }}
                    >
                      <Grid container>
                        <Grid container alignItems="center" sx={{ mb: 2 }}>
                          <Grid item xs={4} className={classes.mainCardTitle}>
                            {t("Project name")}
                          </Grid>
                          <Grid item xs style={{ wordBreak: "break-all" }}>
                            <InputBase
                              className={classes.settingFontWhite87}
                              id="label_project_name"
                              style={
                                isUnableToChangeName
                                  ? {
                                      width: "100%",
                                    }
                                  : {
                                      width: "100%",
                                      borderBottom: "1px solid gray",
                                    }
                              }
                              value={nextProjectName}
                              disabled={isUnableToChangeName}
                              // autoFocus={true}
                              onChange={onChangeNameInput}
                              onFocus={(e) =>
                                e.currentTarget.setSelectionRange(
                                  e.currentTarget.value.length,
                                  e.currentTarget.value.length
                                )
                              }
                              multiline={true}
                              inputRef={titleRef}
                            />
                          </Grid>
                        </Grid>
                        <Grid container alignItems="center" sx={{ mb: 2 }}>
                          <Grid item xs={4} className={classes.mainCardTitle}>
                            {t("Description")}
                          </Grid>
                          <Grid item xs style={{ wordBreak: "break-all" }}>
                            <InputBase
                              id="label_project_detail"
                              className={classes.settingFontWhite87}
                              style={
                                isUnableToChangeDetail
                                  ? { width: "100%" }
                                  : {
                                      width: "100%",
                                      borderBottom: "1px solid gray",
                                    }
                              }
                              value={nextProjectDetail}
                              disabled={isUnableToChangeDetail}
                              // autoFocus={true}
                              onChange={onChangeDetailInput}
                              onFocus={(e) =>
                                e.currentTarget.setSelectionRange(
                                  e.currentTarget.value.length,
                                  e.currentTarget.value.length
                                )
                              }
                              multiline={true}
                              placeholder={
                                user.me &&
                                !user.me.isAiTrainer &&
                                !isShared &&
                                t("Please enter a description.")
                              }
                              inputRef={detailRef}
                            />
                          </Grid>
                        </Grid>
                        <Grid container alignItems="center" sx={{ mb: 2 }}>
                          <Grid item xs={4} className={classes.mainCardTitle}>
                            {t("Date created")}
                          </Grid>
                          <Grid item xs>
                            <div
                              id="labelProjectCreatedDate"
                              className={classes.settingFontWhite87}
                            >
                              {labelprojects.projectDetail &&
                                labelprojects.projectDetail.created_at.substring(
                                  0,
                                  10
                                )}
                            </div>
                          </Grid>
                        </Grid>
                        <Grid container alignItems="center" sx={{ mb: 2 }}>
                          <Grid item xs={4} className={classes.mainCardTitle}>
                            {t("Date updated")}
                          </Grid>
                          <Grid item xs>
                            <div
                              id="labelProjectUpdatedDate"
                              className={classes.settingFontWhite87}
                            >
                              {labelprojects.projectDetail &&
                                labelprojects.projectDetail.updated_at.substring(
                                  0,
                                  10
                                )}
                            </div>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Typography>
                  </div>
                </GridItem>
                <GridItem xs={12} md={6} style={{ padding: "0 5px" }}>
                  <div className={classes.dashboardMain}>
                    <Typography
                      component="div"
                      className={classes.dashbordTitle}
                      style={{ marginBottom: 4 }}
                    >
                      {isShared ? t("My status") : t("Status")}
                    </Typography>
                    <Typography component="div" className={classes.content}>
                      {labelChart && renderStatusChart()}
                    </Typography>
                  </div>
                </GridItem>
                {labelprojects.projectDetail?.workapp !==
                  "normal_regression" && (
                  <GridItem
                    xs={12}
                    md={isShared ? 12 : 6}
                    style={{ padding: "0 5px" }}
                  >
                    <div className={classes.dashboardMain}>
                      <Grid
                        container
                        style={{ justifyContent: "space-between" }}
                      >
                        <Grid item>
                          <Typography
                            component="div"
                            className={classes.dashbordTitle}
                            gutterBottom
                          >
                            {isShared ? t("My class") : t("Class")}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Button
                            id="more_labelclasses_btn"
                            shape="blue"
                            size="sm"
                            onClick={() => {
                              setSelectedPage("class");
                            }}
                          >
                            {t("More")}
                          </Button>
                        </Grid>
                      </Grid>

                      <Typography component="div" className={classes.content}>
                        <GridContainer className={classes.textContainer}>
                          <GridItem xs={12} className={classes.text}>
                            <div>
                              {labelClasses &&
                                labelClasses.map((label, idx) => {
                                  if (label) {
                                    const labelCount =
                                      label.completedLabelCount ||
                                      label.completedLabelCount === 0
                                        ? `${label.completedLabelCount.toLocaleString()}`
                                        : "";
                                    return (
                                      <Grid
                                        container
                                        key={label.name + label.id}
                                      >
                                        <Grid item xs={6}>
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <div
                                              style={{
                                                width: "10px",
                                                height: "10px",
                                                border:
                                                  "1px solid var(--textWhite87)",
                                                borderRadius: "50%",
                                                marginRight: "8px",
                                                background: label.color,
                                              }}
                                            ></div>
                                            <div
                                              className="className"
                                              style={{ wordBreak: "break-all" }}
                                            >
                                              {label.name}
                                            </div>
                                          </div>
                                        </Grid>
                                        <Grid item xs={3}>
                                          <div>{labelCount}</div>
                                        </Grid>
                                        <Grid
                                          item
                                          xs={3}
                                          style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                          }}
                                        >
                                          {user.me &&
                                            !user.me.isAiTrainer &&
                                            !isShared && (
                                              <>
                                                {isUpdateLabelClasses && (
                                                  <Button
                                                    id={`modify_labelclass${label.id}_btn`}
                                                    shape="blue"
                                                    size="xs"
                                                    onClick={() => {
                                                      onChangeClasses(label);
                                                    }}
                                                  >
                                                    {t("Edit")}
                                                  </Button>
                                                )}
                                                {isDeleteLabelClasses && (
                                                  <input
                                                    type="checkbox"
                                                    id="deleteClasses"
                                                    name="deleteClasses"
                                                    value={label.id}
                                                    onChange={
                                                      selectDeleteClasses
                                                    }
                                                  />
                                                )}
                                              </>
                                            )}
                                        </Grid>
                                      </Grid>
                                    );
                                  }
                                })}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                {labelClasses.length === 0 ? (
                                  <div id="noClassInformText">
                                    {t(
                                      "There is no class registered. Please add class"
                                    )}
                                  </div>
                                ) : (
                                  <div></div>
                                )}
                              </div>
                            </div>
                          </GridItem>
                        </GridContainer>
                      </Typography>
                    </div>
                  </GridItem>
                )}
                <GridItem
                  xs={12}
                  md={
                    labelprojects.projectDetail?.workapp === "normal_regression"
                      ? 12
                      : 6
                  }
                  style={{ padding: "0 5px" }}
                >
                  {user.me && (user.me.isAiTrainer || isShared) ? null : (
                    // <div className={classes.dashboardMain}>
                    //   <Typography component="div"
                    //     className={classes.dashbordTitle}
                    //     gutterBottom
                    //   >
                    //     {t("")}
                    //   </Typography>
                    //   <Typography component="div" className={classes.content}>
                    //     {labelprojects.workage && renderMyLabelingChart()}
                    //   </Typography>
                    // </div>
                    <div className={classes.dashboardMain}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          component="div"
                          className={classes.dashbordTitle}
                          gutterBottom
                        >
                          {t("Notification history")}
                        </Typography>
                        <Grid item>
                          <Button
                            id="more_labelnotifications_btn"
                            shape="blue"
                            size="sm"
                            onClick={() => onSetSelectedPage("setting")}
                          >
                            {t("More")}
                          </Button>
                        </Grid>
                      </div>
                      <Typography
                        component="div"
                        className={classes.content}
                        style={{ padding: "0 16px" }}
                      >
                        {noticeHistory &&
                          noticeHistory.map((asynctask, idx) => (
                            <div
                              key={`notice_${idx}`}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                margin: "5px 0",
                              }}
                            >
                              {tableBodys.map((tableBody, i) => {
                                return (
                                  <div
                                    key={`tablerow_${i}`}
                                    className={classes.wordBreakDiv}
                                    style={
                                      tableBody.value === "taskType"
                                        ? {
                                            width: "80%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }
                                        : {}
                                    }
                                  >
                                    {tableBody.value === "taskType" ? (
                                      <>
                                        <span
                                          style={{
                                            fontWeight: 700,
                                            marginRight: 8,
                                          }}
                                        >
                                          &middot;
                                        </span>
                                        {asynctask.taskName +
                                          " " +
                                          getNotificationText(
                                            asynctask.status,
                                            asynctask.taskType,
                                            asynctask.statusText,
                                            i18n?.language
                                          )}
                                      </>
                                    ) : (
                                      <>
                                        {asynctask[tableBody.value].substring(
                                          0,
                                          10
                                        )}
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                      </Typography>
                    </div>
                  )}
                </GridItem>
                {labelprojects.projectDetail?.workage?.length > 0 &&
                  labelprojects.projectDetail.workapp ===
                    "object_detection" && (
                    <GridItem xs={12} style={{ padding: "0 5px" }}>
                      <div className={classes.dashboardMain}>
                        <Typography
                          component="div"
                          className={classes.dashbordTitle}
                          gutterBottom
                        >
                          {t("Work Status by Member")}
                        </Typography>
                        <Typography component="div" className={classes.content}>
                          <GridContainer className={classes.textContainer}>
                            <Table
                              className={classes.table}
                              style={{ margin: "10px" }}
                              aria-label="simple table"
                            >
                              <TableHead>
                                <TableRow>
                                  {WORKAGE_TABLE_HEADER.map((v, i) => {
                                    return (
                                      <TableCell
                                        key={v.title + i}
                                        className={classes.tableHead}
                                        style={{ width: v.width }}
                                        align="center"
                                      >
                                        <b
                                          style={{
                                            color: "var(--textWhite87)",
                                          }}
                                        >
                                          {t(v.title)}
                                        </b>
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {labelprojects.projectDetail.workage.map(
                                  (workage, idx) => (
                                    <TableRow
                                      key={workage.workAssinee}
                                      className={classes.tableRow}
                                      style={{
                                        background:
                                          idx % 2 === 0
                                            ? currentTheme.tableRow1
                                            : currentTheme.tableRow2,
                                      }}
                                    >
                                      {WORKAGE_TABLE_BODY.map((v, i) => {
                                        let value = workage[v]
                                          ? workage[v].toLocaleString()
                                          : v === "workAssinee"
                                          ? ""
                                          : 0;

                                        if (v === "idx") value = idx + 1;
                                        if (v === "totalCount")
                                          value = (
                                            workage.boxCount +
                                            workage.polygonCount +
                                            workage.magicCount
                                          ).toLocaleString();

                                        return (
                                          <TableCell
                                            key={v}
                                            className={classes.tableRowCell}
                                            align="center"
                                          >
                                            {value}
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  )
                                )}
                                <TableRow
                                  className={classes.tableRow}
                                  style={{
                                    background:
                                      labelprojects.projectDetail.workage %
                                        2 !==
                                      0
                                        ? currentTheme.tableRow1
                                        : currentTheme.tableRow2,
                                  }}
                                >
                                  <TableCell
                                    className={classes.tableRowCell}
                                    align="left"
                                    colSpan={2}
                                    style={{ textIndent: "5px" }}
                                  >
                                    Total Point
                                  </TableCell>
                                  <TableCell
                                    className={classes.tableRowCell}
                                    colSpan={4}
                                  />
                                  <TableCell
                                    className={classes.tableRowCell}
                                    align="center"
                                  >
                                    {totalPointCount
                                      ? totalPointCount.toLocaleString()
                                      : 0}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </GridContainer>
                        </Typography>
                      </div>
                    </GridItem>
                  )}
              </GridContainer>
            )}
            {selectedPage === "list" && (
              <GridItem xs={12}>
                <LabelList
                  history={history}
                  onSetSelectedPage={onSetSelectedPage}
                  labelProjectId={labelProjectId}
                  labelChart={labelChart}
                />
              </GridItem>
            )}
            {selectedPage === "export" && (
              <GridItem xs={12}>
                <LabelExport history={history} />
              </GridItem>
            )}
            {selectedPage === "labelai" && (
              <GridItem xs={12}>
                <LabelAI
                  history={history}
                  isFromAutoLabelBtn={isFromAutoLabelBtn}
                />
              </GridItem>
            )}
            {selectedPage === "setting" && (
              <GridItem xs={12}>
                <LabelSetting
                  history={history}
                  onSetSelectedPage={onSetSelectedPage}
                />
              </GridItem>
            )}
            {selectedPage === "class" && (
              <GridItem xs={12}>
                <LabelClass history={history} />
              </GridItem>
            )}
            {selectedPage === "member" && (
              <GridItem xs={12}>
                <LabelMember history={history} />
              </GridItem>
            )}
          </div>
        )}
      </div>

      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isClassModalOpen}
        onClose={() => {
          dispatch(askModalRequestAction());
        }}
        className={classes.modalContainer}
      >
        <div
          className={classes.defaultModalContent}
          style={{ width: "30%", minWidth: "500px" }}
        >
          <GridContainer>
            <GridItem xs={6}>
              <b>{t("Class name")} : </b>
              <InputBase
                className={classes.input}
                autoFocus
                value={inputClassChangeValue}
                onChange={changeInputNameChangeValue}
                placeholder={t("Please enter the class name")}
                multiline={true}
                maxRows={5}
                id="labelclass_name_input"
              />
            </GridItem>
            <GridItem
              xs={6}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", paddingBottom: "20px" }}>
                <b>{t("Class color")} : </b>
                <div
                  style={{
                    width: "60px",
                    height: "20px",
                    marginLeft: "10px",
                    background: color,
                  }}
                ></div>
              </div>
              <div style={{ height: "250px" }}>
                <ChromePicker
                  color={color}
                  onChangeComplete={onChangeColor}
                  disableAlpha={true}
                />
              </div>
            </GridItem>
            <GridItem xs={12}>
              <GridContainer>
                <GridItem xs={6}>
                  <Button
                    id="close_labelclassmodel_btn"
                    shape="whiteOutlined"
                    style={{ width: "100%" }}
                    onClick={() => {
                      dispatch(askModalRequestAction());
                    }}
                  >
                    {t("Cancel")}
                  </Button>
                </GridItem>
                <GridItem xs={6}>
                  <Button
                    id="next_labelclassmodal_btn"
                    shape="greenOutlined"
                    disabled={!inputClassChangeValue}
                    style={{ width: "100%" }}
                    onClick={onSetChangeClassName}
                  >
                    {t("Next")}
                  </Button>
                </GridItem>
              </GridContainer>
            </GridItem>
          </GridContainer>
        </div>
      </Modal>

      <CustomAICreateModal
        history={history}
        isCustomAIModalOpen={isCustomAIModalOpen}
        setIsCustomAIModalOpen={setIsCustomAIModalOpen}
        dataColumns={dataColumns}
        isSendingAPI={isSendingAPI}
        setIsSendingAPI={setIsSendingAPI}
        predictColumnName={predictColumnName}
        totalLabelClasses={totalLabelClasses}
        setIsCustomAiLoading={setIsCustomAiLoading}
        getProjectsStatus={getProjectsStatus}
        setIsAbleToAutoLabeling={setIsAbleToAutoLabeling}
        setCreatingCustomAiProjectId={setCreatingCustomAiProjectId}
      />

      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isAddCustomAIModalOpen}
        onClose={addCustomAIModalClose}
        className={classes.modalContainer}
      >
        <Grid
          sx={{ py: 3, px: 4 }}
          style={{
            background: "var(--background2)",
            borderRadius: "4px",
          }}
        >
          <Grid container maxWidth={240} sx={{ mb: 3, fontSize: 16 }}>
            <Grid item xs={12} sx={{ mb: 0.5, wordBreak: "keep-all" }}>
              {t(
                isNewCustomAI
                  ? "A previously created CUSTOM AI model exists and is waiting for Best Custom AI selection."
                  : "Creating CUSTOM AI."
              )}
            </Grid>
            <Grid>{t("Do you want to restart?")}</Grid>
          </Grid>
          <Grid
            container
            justifyContent="space-between"
            sx={{ fontWeight: 600 }}
          >
            <Grid item xs={5.5}>
              <Button
                id="restart_customai_btn"
                shape="greenOutlinedSquare"
                style={{ width: "100%" }}
                onClick={() => {
                  addCustomAIModalClose();
                  setIsCustomAIModalOpen(true);
                }}
              >
                <span style={{ color: "var(--secondary1)" }}>{t("Yes")}</span>
              </Button>
            </Grid>
            <Grid item xs={5.5}>
              <Button
                id="close_restartcustomaimodal_btn"
                shape="whiteOutlinedSquare"
                style={{ width: "100%" }}
                onClick={addCustomAIModalClose}
              >
                <span style={{ color: "var(--textWhite87)" }}>{t("No")}</span>
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Modal>

      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isAutoLabelingModalOpen}
        onClose={!isAutoLabelingButtonLoading && autoLabelingModalClose}
        className={classes.modalContainer}
      >
        <div className={classes.autoLabelingContent}>
          {isAutoLabelingLoading ? (
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
              <div
                style={{
                  maxHeight: 500,
                  overflowX: "hidden",
                  overflowY: "auto",
                }}
              >
                {labelprojects.projectDetail && (
                  <>
                    <div style={{ fontWeight: 600, margin: "16px 0" }}>
                      {t("Select AI Type [Required]")}
                    </div>
                    <FormControl
                      component="fieldset"
                      style={{ margin: "16px 20px 24px", display: "flex" }}
                    >
                      {/*<FormLabel component="legend" style={{paddingTop: '20px', color:currentTheme.text1 + ' !important'}}>{t('Analyze Unit')}</FormLabel>*/}
                      <RadioGroup
                        row
                        aria-label="position"
                        name="position"
                        defaultValue={
                          customAiModels?.length > 0 ? "custom" : null
                        }
                        onChange={onChangeAutoLabelingAiType}
                      >
                        <FormControlLabel
                          name="custom"
                          checked={autoLabelingAiType === "custom"}
                          disabled={
                            customAiModels?.length === 0 ||
                            (labelprojects.projectDetail?.workapp ===
                              "object_detection" &&
                              labelChart.review > 1)
                          }
                          label={`Custom AI : ${t(
                            "Create and label AI based on labeled training data"
                          )}`}
                          control={<Radio color="primary" />}
                        />
                        {customAiModels?.length > 0 && (
                          <FormControl
                            component="fieldset"
                            className={classes.formControl}
                            style={{
                              display: "inline",
                              marginLeft: 30,
                            }}
                          >
                            <RadioGroup
                              row
                              aria-label="position"
                              checked={autoLabelingAiType === "custom"}
                              name="position"
                              onChange={onChangeCustomAIModel}
                            >
                              {customAiModels?.length > 0 &&
                                customAiModels.map((customAiModel, idx) => {
                                  return (
                                    <>
                                      <FormControlLabel
                                        name={customAiModel.id}
                                        value={customAiModel.id}
                                        checked={modelId === customAiModel.id}
                                        label={
                                          <>
                                            <span>model{idx + 1}: </span>
                                            {customAiModel.class?.map(
                                              (customAiModelClass) => {
                                                return (
                                                  <span>
                                                    {customAiModelClass}{" "}
                                                  </span>
                                                );
                                              }
                                            )}
                                          </>
                                        }
                                        control={<Radio color="primary" />}
                                      />
                                    </>
                                  );
                                })}
                            </RadioGroup>
                          </FormControl>
                        )}
                        {customAiModels?.length === 0 && (
                          <Typography
                            component="div"
                            style={{
                              display: "flex",
                              alignItems: "center",
                            }}
                            variant={"body2"}
                          >
                            {btnDisabled.customAI ? (
                              <>
                                {labelprojects.projectDetail?.workapp ===
                                  "object_detection" && (
                                  <div style={{ marginRight: 12 }}>
                                    <AnnouncementIcon
                                      fontSize="small"
                                      style={{
                                        fill: "var(--secondary1)",
                                        marginRight: 4,
                                      }}
                                    />{" "}
                                    <span
                                      className={classes.subHighlightText}
                                    >{`${t("important")}: ${t(
                                      "In case of insufficient labeled data, auto-labeling is possible only through General AI."
                                    )}`}</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div style={{ marginRight: 12 }}>
                                  <AnnouncementIcon
                                    fontSize="small"
                                    style={{
                                      fill: "var(--secondary1)",
                                      marginRight: 4,
                                    }}
                                  />{" "}
                                  <span
                                    className={classes.subHighlightText}
                                  >{`${t("important")}: ${t(
                                    "Available after creating a Custom AI."
                                  )}`}</span>
                                </div>
                                <Button
                                  id="create_customai_btn"
                                  shape="greenContained"
                                  onClick={() => {
                                    setIsAutoLabelingModalOpen(false);
                                    setIsCustomAIModalOpen(true);
                                  }}
                                >
                                  {t("Create CUSTOM AI")}
                                </Button>
                              </>
                            )}
                          </Typography>
                        )}
                        {labelprojects.projectDetail?.workapp ===
                          "object_detection" && (
                          <>
                            <FormControlLabel
                              name="general"
                              checked={autoLabelingAiType === "general"}
                              label={`General AI : ${t(
                                "Labeling with AI of Labeling AI already created"
                              )}`}
                              control={<Radio color="primary" />}
                              style={{ marginTop: 24 }}
                            />
                            <FormControl
                              component="fieldset"
                              className={classes.formControl}
                              style={{
                                margin: 0,
                                marginLeft: 30,
                                display: "inline",
                              }}
                            >
                              <RadioGroup
                                row
                                aria-label="position"
                                checked={autoLabelingAiType === "custom"}
                                name="position"
                                onChange={(e) => {
                                  onChangeGeneralAIType(e.target.name);
                                }}
                              >
                                {GENERAL_AI_GROUPS.map((group, idx) => {
                                  return (
                                    <FormControlLabel
                                      name={group.name}
                                      checked={generalAIType === group.name}
                                      label={t(`${group.label}`)}
                                      control={<Radio color="primary" />}
                                    />
                                  );
                                })}
                              </RadioGroup>
                            </FormControl>
                          </>
                        )}
                      </RadioGroup>
                    </FormControl>
                    {autoLabelingAiType === "general" && (
                      <>
                        <Grid item xs={12}>
                          <span style={{ fontWeight: 600, marginRight: 8 }}>
                            {t("Choose a class")}
                          </span>
                          <span className={classes.subHighlightText}>
                            *{t("at least 1 required")}
                          </span>
                        </Grid>
                        <FormControl
                          component="fieldset"
                          className={classes.formControl}
                          style={{ margin: "16px 8px 24px", display: "inline" }}
                        >
                          {generalAIClasses.map((generalAIClass) => {
                            return (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    onClick={() =>
                                      handleGeneralAIClassChecked(
                                        generalAIClass
                                      )
                                    }
                                    checked={
                                      generalAIClassChecked[generalAIClass]
                                    }
                                    value={generalAIClass}
                                    style={{ marginRight: 4 }}
                                  />
                                }
                                label={generalAIClass}
                                style={{ margin: 10, minWidth: "15%" }}
                              />
                            );
                          })}
                        </FormControl>

                        {generalAIType !== "facepoint" &&
                          generalAIType !== "keypoint" && (
                            <>
                              <Grid item xs={12} style={{ fontWeight: 600 }}>
                                {t("Select Autolabeling Type")}
                              </Grid>
                              <FormControl
                                component="fieldset"
                                style={{ margin: "20px 20px 0" }}
                              >
                                {/*<FormLabel component="legend" style={{paddingTop: '20px', color:currentTheme.text1 + ' !important'}}>{t('Analyze Unit')}</FormLabel>*/}
                                <RadioGroup
                                  row
                                  aria-label="position"
                                  name="position"
                                  defaultValue="box"
                                  onChange={(e) =>
                                    onChangeAutoLabelingType(e.target.value)
                                  }
                                >
                                  <FormControlLabel
                                    value="box"
                                    label={t("General (Box)")}
                                    control={<Radio color="primary" />}
                                  />
                                  <FormControlLabel
                                    value="polygon"
                                    label={t("Polygon")}
                                    control={<Radio color="primary" />}
                                  />
                                  {/* {generalAIType === "road" && (
                                    <FormControlLabel
                                      value="sementic"
                                      label={t("Sementic")}
                                      control={<Radio color="primary" />}
                                    />
                                  )} */}
                                </RadioGroup>
                              </FormControl>
                            </>
                          )}
                      </>
                    )}
                    {/* {labelprojects.projectDetail &&
                      labelprojects.projectDetail.workapp ===
                        "object_detection" && (
                        <>
                          <Grid item xs={12} style={{ fontWeight: 600 }}>
                            {t("Preprocessing Options")}
                          </Grid>
                          <GridItem xs={12}>
                            <FormControl
                              component="fieldset"
                              className={classes.formControl}
                              style={{ display: "inline" }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    onClick={onChangePreprocessingAIType}
                                    value="faceblur"
                                    style={{ marginRight: 4 }}
                                  />
                                }
                                label={t("face de-identification")}
                                style={{ margin: "16px 0" }}
                              />
                            </FormControl>
                          </GridItem>
                        </>
                      )} */}
                  </>
                )}

                <Grid
                  container
                  alignItems="center"
                  style={{ margin: "24px 0" }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {t("Number of AutoLabeling")}
                  </span>
                  <span> : </span>
                  {isAbleToChangeAmount ? (
                    <TextField
                      placeholder={t("Enter the value.")}
                      type="number"
                      style={{
                        width: "80%",
                        wordBreak: "keep-all",
                        minWidth: "160px",
                        margin: 16,
                      }}
                      inputRef={labelingCountRef}
                      fullWidth={true}
                      disabled={
                        !isAbleToChangeAmount || autoLabelingAiType == ""
                      }
                      defaultValue={autoLabelingAmount}
                      onChange={onChangeAutoLabelingAmount}
                    />
                  ) : (
                    <span style={{ fontWeight: 600 }}>
                      {autoLabelingAmount
                        ? autoLabelingAmount.toLocaleString()
                        : 0}
                    </span>
                  )}
                </Grid>

                {autoLabelingAiType === "custom" && (
                  <Typography
                    component="div"
                    style={{ margin: "24px", marginLeft: 30, fontSize: 15 }}
                    variant={"body2"}
                  >
                    <AnnouncementIcon fontSize="small" /> {t("important")}:{" "}
                    {t(
                      "In the case of Custom AI, the number of auto-labeling is limited only to the number of images and auto-labeling before labeling starts."
                    )}
                  </Typography>
                )}
              </div>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                style={{ margin: "16px 0 24px" }}
                columnSpacing={2}
              >
                <Grid item xs={6} style={{ padding: 0 }}>
                  <Button
                    id="close_startautolabelingmodal_btn"
                    shape="greenOutlined"
                    style={{ width: "100%" }}
                    onClick={() => {
                      autoLabelingModalClose(false);
                    }}
                  >
                    {t("Return")}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  {(labelprojects.projectDetail &&
                    labelprojects.projectDetail.workapp !==
                      "object_detection") ||
                  autoLabelingAiType ? (
                    <>
                      <Button
                        id="start_autolabeling_btn"
                        shape="greenContained"
                        disabled={
                          !autoLabelingAiType || isAutoLabelingButtonLoading
                        }
                        style={{ width: "100%" }}
                        onClick={startAutoLabeling}
                      >
                        <span> {t("Start auto-labeling")} </span>
                        {isAutoLabelingButtonLoading && (
                          <CircularProgress
                            color="inherit"
                            size={16}
                            sx={{
                              color: "var(--textWhite87)",
                              verticalAlign: "middle",
                              marginLeft: "8px",
                            }}
                          />
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Tooltip
                        title={
                          <span style={{ fontSize: "11px" }}>
                            {t("Please select an AI type.")}
                          </span>
                        }
                      >
                        <div>
                          <Button
                            id="start_autolabeling_disabled_btn"
                            shape="Contained"
                            disabled
                            style={{ width: "100%" }}
                          >
                            {t("Start auto-labeling")}
                          </Button>
                        </div>
                      </Tooltip>
                    </>
                  )}
                </Grid>
              </Grid>
            </>
          )}
        </div>
      </Modal>

      <BestCustomAISelectModal
        isSampleModelModalOpen={isSampleModelModalOpen}
        setIsSampleModelModalOpen={setIsSampleModelModalOpen}
        customAiModels={customAiModels}
        setCustomAiModels={setCustomAiModels}
        setIsAbleToAutoLabeling={setIsAbleToAutoLabeling}
        setIsAutoLabelingLoading={setIsAutoLabelingLoading}
        creatingCustomAiProjectId={creatingCustomAiProjectId}
        setCreatingCustomAiProjectId={setCreatingCustomAiProjectId}
      />

      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={classes.modalContainer}
        open={requestLabelingModalOpen}
        onClose={() => {
          dispatch(askModalRequestAction());
        }}
      >
        <RequestLabeling
          history={history}
          labelClasses={labelClasses}
          close={() => {
            setRequestLabelingModalOpen(false);
          }}
        />
      </Modal>

      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={classes.modalContainer}
        open={requestInspectingModalOpen}
        onClose={() => {
          dispatch(askModalRequestAction());
        }}
      >
        <RequestInspecting
          history={history}
          labelClasses={labelClasses}
          close={() => {
            setRequestInspectingModalOpen(false);
          }}
        />
      </Modal>

      <LicenseRegisterModal />
    </div>
  );
};

export default React.memo(LabelDetail);
