import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReactTitle } from "react-meta-tags";
import { useTranslation } from "react-i18next";

import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
  askChangeProjectNameRequestAction,
  askChangeProjectDescriptionRequestAction,
  askStopProjectRequestAction,
  askStartProjectRequestAction,
  setMainPageSettingRequestAction,
  setPlanModalOpenRequestAction,
} from "redux/reducers/messages.js";
import {
  getProjectRequestAction,
  setProjectStatusAction,
  putTrainingMethodRequestAction,
  putOptionRequestAction,
  putValueForPredictRequestAction,
  putIsProjectStartedRequest,
  updateShareGroupRequestAction,
  putInstanceTypeRequestAction,
  putAlgorithmTypeRequestAction,
} from "redux/reducers/projects.js";
import {
  setChosenModelRequestAction,
  getModelRequestAction,
} from "redux/reducers/models.js";
import * as api from "controller/api.js";
import { fileurl } from "controller/api";
import currentTheme, { currentThemeColor } from "assets/jss/custom";
import { checkIsValidKey } from "components/Function/globalFunc";
import { IS_ENTERPRISE } from "variables/common";
import { INITIAL_ALGORITHM_INFO } from "variables/hyperparameters";
import { checkIsIterable } from "components/Function/globalFunc";
import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";
import ProcessCircle from "components/Circle/ProcessCircle";
import StartCircle from "components/Circle/StartCircle";
import Tooltip from "components/Tooltip/Tooltip";
import { sendErrorMessage } from "components/Function/globalFunc";
import Button from "components/CustomButtons/Button";
import HyperParameters from "views/Setting/HyperParameters";
import ModelTable from "views/Table/ModelTable";
import Analytics from "views/Table/Analytics";
import SummaryTable from "views/Table/SummaryTable";
import RawDataTable from "views/Table/RawDataTable";
import LiscenseRegisterModal from "components/Modal/LiscenseRegisterModal";
import Detail from "views/Table/Detail";

import {
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputBase,
  Menu,
  MenuItem,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import Create from "@material-ui/icons/Create";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import {
  CircularProgress,
  FormGroup,
  Grid,
  IconButton,
  Tooltip as MuiTooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const PREFER_TYPE = [
  { value: "custom", label: "Manual Setting" },
  { value: "colab", label: "Code Generation" },
  { value: "speed", label: "Faster training speed" },
  { value: "accuracy", label: "Higher accuracy" },
  { value: "labeling", label: "Auto Labeling" },
];

const INITIAL_ALGORITHM_TYPE = Object.keys(INITIAL_ALGORITHM_INFO)[0];

const Process = (props) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, projects, messages, models, groups } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
      messages: state.messages,
      models: state.models,
      groups: state.groups,
    }),
    []
  );
  let nameRef = useRef();
  let detailRef = useRef();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [sampleData, setSampleData] = useState(null);
  const [hasStructuredData, setHasStructureData] = useState(false);
  const [hasImageLabelData, setHasImageLabelData] = useState(false);
  const [hasTimeSeriesData, setHasTimeSeriesData] = useState(false);
  const [timeSeriesColumnInfo, setTimeSeriesColumnInfo] = useState({});
  const [startTimeSeriesDatetime, onChangeStartTimeSeriesDatetime] = useState(
    null
  );
  const [endTimeSeriesDatetime, onChangeEndTimeSeriesDatetime] = useState(null);
  const [analyticsStandard, setAnalyticsStandard] = useState("auto");

  const [selectedPage, setSelectedPage] = useState("summary");
  const [datacolumns, setdatacolumns] = useState([]);
  const [trainingColumnInfo, setTrainingColumnInfo] = useState([]);
  const [isOpenWarningModal, setIsOpenWarningModal] = useState(false);
  const [warningMethod, setWarningMethod] = useState(null);
  const [isUnableToChangeName, setIsUnableToChangeName] = useState(true);
  const [isUnableToChangeDetail, setIsUnableTochangeDetail] = useState(true);
  const [nextProjectName, setNextProjectName] = useState("");
  const [nextProjectDetail, setNextProjectDetail] = useState("");

  const [mainConnector, setMainConnector] = useState([]);
  const [subConnectors, setSubConnectors] = useState([]);
  const [joinInfo, setjoinInfo] = useState([]);
  const [preprocessingInfo, setPreprocessingInfo] = useState({});
  const [preprocessingInfoValue, setPreprocessingInfoValue] = useState({});
  const [modelPercentage, setModelPercentage] = useState(0);
  const [isTooltipModalOpen, setIsTooltipModalOpen] = useState(false);
  const [tooltipCategory, setTooltipCategory] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [hasMissingValue, setHasMissingValue] = useState(false);
  const [valueForPredictName, setValueForPredictName] = useState("");
  const [trainingValueForStart, setTrainingValueForStart] = useState(null);
  const [colabInfo, setColabInfo] = useState({
    epoch: 2,
    learningRate: 0.01,
    layerDeep: 100,
    layerWidth: 200,
    dropOut: 0.8,
  });
  const [isParameterChanged, setIsParameterChanged] = useState(false);
  const [colabModalOpen, setColabModalOpen] = useState(false);
  const [colabCode, setColabCode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [groupCheckboxDict, setGroupCheckboxDict] = useState({});
  const [isVerify, setIsVerify] = useState(false);
  const [
    isParameterCompressedChecked,
    setIsParameterCompressedChecked,
  ] = useState(false);
  const [valueForPredictColumnId, setValueForPredictColumnId] = useState(null);
  const [valueForUserColumnId, setValueForUserColumnId] = useState(null);
  const [valueForItemColumnId, setValueForItemColumnId] = useState(null);
  const [price, setPrice] = useState(0);
  const [sampleDataId, setSampleDataId] = useState(null);
  const [date, setDate] = useState(null);
  const [isTimeSeries, setIsTimeSeries] = useState(false);
  const [isMagicCodePossible, setIsMagicCodePossible] = useState(false);
  const [trainMethod, setTrainMethod] = useState("");
  const [instanceType, setInstanceType] = useState("");
  const [algorithmType, setAlgorithmType] = useState(INITIAL_ALGORITHM_TYPE);
  const [isAnyModelFinished, setIsAnyModelFinished] = useState(false);
  const [isDownloadReportLoading, setIsDownloadReportLoading] = useState(false);
  const [algorithmInfo, setAlgorithmInfo] = useState(INITIAL_ALGORITHM_INFO);
  const [isRequiredHyperParameters, setIsRequiredHyperParameters] = useState(
    false
  );
  const [hyperParamsData, setHyperParamsData] = useState(null);
  const [selectedDeviceArr, setSelectedDeviceArr] = useState([]);
  const [isDeviceAllSelected, setIsDeviceAllSelected] = useState(false);
  const [isGetColabCodeLoading, setIsGetColabCodeLoading] = useState(false);
  const [isModelPageAccessible, setIsModelPageAccessible] = useState(false);

  const path = window.location.pathname;

  useEffect(() => {
    const url = window.location.href;

    if (url.indexOf("verifyproject/") !== -1) {
      setIsVerify(true);
    }
  }, []);

  useEffect(() => {
    if (hasStructuredData) setTrainMethod("normal");
    else if (hasImageLabelData) setTrainMethod("image");
  }, [hasStructuredData, hasImageLabelData]);

  useEffect(() => {
    if (projects?.project?.available_gpu_list?.length) {
      let firstDevice = projects.project.available_gpu_list[0]?.idx;
      setSelectedDeviceArr([firstDevice]);
    }
  }, [projects?.project?.available_gpu_list]);

  useEffect(() => {
    let date = new Date();
    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    let hours = date.getHours().toString();
    let minutes = date.getMinutes().toString();
    let dateString = `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }T${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    }`;
    setDate(dateString);
    projects.project = null;
  }, []);

  useEffect(() => {
    if (
      !messages.isAskSnackbarOpen &&
      projects.project?.projectName !== nextProjectName
    ) {
      setNextProjectName(projects.project?.projectName);
    }
  }, [!messages.isAskSnackbarOpen && projects.project?.projectName]);

  useEffect(() => {
    if (
      !messages.isAskSnackbarOpen &&
      projects.project?.description !== nextProjectDetail
    ) {
      let detailText =
        projects.project?.description !== null
          ? projects.project?.description
          : "";
      setNextProjectDetail(detailText);
    }
  }, [!messages.isAskSnackbarOpen && projects.project?.description]);

  useEffect(() => {
    setIsLoading(true);
    const pathArr = path.split("/");
    const id = pathArr[pathArr.length - 1];
    dispatch(getProjectRequestAction(id));
    const state = props.history.location.state;
    if (state) {
      state.page && setSelectedPage(state.page);
      if (state.modelid !== models.chosenModel) {
        state.modelid && dispatch(getModelRequestAction(state.modelid));
      }
    }
  }, [path]);

  useEffect(() => {
    const state = props.history.location.state;
    if (state) {
      state.page && setSelectedPage(state.page);
      if (state.modelid !== models.chosenModel) {
        state.modelid && dispatch(getModelRequestAction(state.modelid));
      }
    }
  }, [props.history.location.pathname]);

  useEffect(() => {
    if (projects.project) {
      (async () => {
        const project = projects.project;

        setIsLoading(true);
        setValueForUserColumnId(project.valueForUserColumnId);
        setValueForItemColumnId(project.valueForItemColumnId);
        setPreprocessingInfo(
          project.preprocessingInfo == null ? {} : project.preprocessingInfo
        );
        setPreprocessingInfoValue(
          project.preprocessingInfoValue == null
            ? {}
            : project.preprocessingInfoValue
        );
        onSetSampleData();
        setIsVerify(project.isVerify);
        if (groups.parentsGroup) onSetShareGroupDict();
        setHyperParamsData(
          project.hyper_params?.length > 0 ? project.hyper_params : null
        );

        const algorithm = projects.project?.algorithm;
        const projectAlgorithm =
          algorithm && algorithm !== "auto"
            ? algorithm.includes("_clf")
              ? algorithm.split("_clf")[0]
              : algorithm.includes("_reg")
              ? algorithm.split("_reg")[0]
              : algorithm
            : (!project.option &&
                project.trainingMethod &&
                !project.trainingMethod.includes("normal")) ||
              project.option === "colab"
            ? "auto"
            : "keras_ann";

        setAlgorithmType(projectAlgorithm);
        dispatch(putAlgorithmTypeRequestAction(projectAlgorithm));

        setIsLoading(false);
      })();

      if (projects.project.id) {
        function getProjectStatus(event) {
          const response = JSON.parse(event.data);

          if (response.status) {
            dispatch(setProjectStatusAction(response));
          }
        }

        const project_status_sse = api.getProjectStatusViaSSE(
          projects.project.id
        );

        project_status_sse.addEventListener("new_message", getProjectStatus);

        return () => {
          project_status_sse.close();
        };
      }
    }
  }, [projects.project && projects.project.id]);

  useEffect(() => {
    if (projects.project && price === 0) {
      // getIpClient();
      priceSetting();
    }
  }, [projects.project && price]);

  useEffect(() => {
    const project = projects.project;

    dispatch(
      putOptionRequestAction(
        project?.option
          ? project?.option
          : project?.trainingMethod === "object_detection"
          ? "colab"
          : ["image", "text", "recommender"].indexOf(project?.trainingMethod) >
            -1
          ? "not selected"
          : "custom"
      )
    );
  }, [projects.project?.trainingMethod]);

  // // 학습 시작 후 설정된 값 적용
  // useEffect(() => {
  //   if (hyperParamsData && algorithmType && projects.project?.trainingMethod) {
  //     const trainingMethod = projects.project.trainingMethod;
  //     const paramData = hyperParamsData[0];

  //     setAlgorithmInfo(
  //       produce((draft) => {
  //         Object.keys(algorithmInfo[algorithmType].parameter).map((key, i) => {
  //           const param = algorithmInfo[algorithmType].parameter;
  //           const isMethodMatched =
  //             param[key].method === "clf/reg" ||
  //             trainingMethod.includes("_ann") ||
  //             (trainingMethod === "normal_classification" &&
  //               param[key].method === "clf") ||
  //             (trainingMethod === "normal_regression" &&
  //               param[key].method === "reg");

  //           if (isMethodMatched) {
  //             // console.log(paramData[key]);
  //             if (
  //               paramData &&
  //               paramData[key] &&
  //               paramData[key].length > 0 &&
  //               typeof paramData[key][0] !== "object"
  //             ) {
  //               if (paramData[key].length > 1) {
  //                 draft[algorithmType].parameter[key].valueArr = paramData[key];
  //               } else {
  //                 draft[algorithmType].parameter[key].value =
  //                   paramData[key][0] === null ? "None" : paramData[key][0];
  //               }
  //             }
  //           }
  //         });
  //       })
  //     );
  //   }
  // }, [hyperParamsData, algorithmType, projects.project]);

  // async function getIpClient() {
  //   try {
  //     const response = await axios.get("https://extreme-ip-lookup.com/json");
  //     const country = response.data.countryCode;
  //     if (country === "KR") {
  //       setPrice(projects.project.extractKrw);
  //     } else {
  //       setPrice(projects.project.extractUsd);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  const priceSetting = () => {
    setPrice(projects.project.extractUsd);
  };

  useEffect(() => {
    if (groups.parentsGroup && projects.project) {
      (async () => {
        // await setIsLoading(true);
        await onSetShareGroupDict();
        // await setIsLoading(false);
      })();
    }
  }, [groups.parentsGroup]);

  useEffect(() => {
    if (nameRef.current) setNameInputSize();
  }, [nextProjectName]);

  // useEffect(() => {
  //   if (detailRef.current) setNameDetailSize();
  // }, [nextProjectDetail]);

  useEffect(() => {
    if (!isLoading && nameRef.current) {
      setNameInputSize();
      // setNameDetailSize();
    }
  }, [isLoading]);

  useEffect(() => {
    datacolumns.map((column) => {
      if (column.id === projects.project.valueForPredictColumnId) {
        setValueForPredictName(`${column.columnName}`);
      }
    });
  }, [projects.project && projects.project.valueForPredictColumnId]);

  useEffect(() => {
    if (!isUnableToChangeName) {
      nameRef.current.focus();
    }
  }, [isUnableToChangeName]);

  useEffect(() => {
    if (!isUnableToChangeDetail) {
      detailRef.current.focus();
    }
  }, [isUnableToChangeDetail]);

  useEffect(() => {
    if (projects.project?.projectName)
      setNextProjectName(projects.project.projectName);

    // if (projects.project?.algorithm) {
    //   const projectAlgorithm = projects.project.algorithm;
    //   const algorithm = projectAlgorithm.includes("_clf")
    //     ? projectAlgorithm.split("_clf")[0]
    //     : projectAlgorithm.includes("_reg")
    //     ? projectAlgorithm.split("_reg")[0]
    //     : projectAlgorithm;

    //   setAlgorithmType(algorithm);
    // }
  }, [projects.project]);

  useEffect(() => {
    if (projects.project && projects.project.description) {
      let detailText =
        projects.project.description !== null
          ? projects.project.description
          : "";

      setNextProjectDetail(detailText);
    }
  }, [projects.project && projects.project.description]);

  useEffect(() => {
    if (messages.shouldGoToMainPage) {
      dispatch(setMainPageSettingRequestAction());
      props.history.push("/admin/project/");
    }
  }, [messages.shouldGoToMainPage]);

  useEffect(() => {
    if (projects.isProjectStarted && projects.project?.option === "colab") {
      getColabCode();
      setColabModalOpen(true);
    }
    if (projects.isProjectStarted && projects.project?.option !== "colab") {
      window.location.reload();
    }
  }, [projects.isProjectStarted]);

  useEffect(() => {
    if (isParameterChanged) setIsParameterChanged(false);
  }, [isParameterChanged]);

  // useEffect(()=>{
  //     if(groups.parentsGroup && projects.project) {
  //         onSetShareGroupDict();
  //     }
  // }, [projects.project])

  useEffect(() => {
    if (projects.isGroupError) onSetShareGroupDict();
  }, [projects.isGroupError]);

  useEffect(() => {
    let tempTM = "";
    const option = projects.project?.option;
    const trainingMethod = projects.project?.trainingMethod;

    tempTM = trainingMethod ? trainingMethod : trainMethod;

    if (projects.project?.hasTextData) {
      if (
        tempTM === "normal" ||
        tempTM === "normal_classification" ||
        tempTM === "normal_regression"
      ) {
        setIsMagicCodePossible(true);
      } else {
        setIsMagicCodePossible(false);
      }
    } else if (projects.project?.hasImageData) {
      if (tempTM === "object_detection") {
        setIsMagicCodePossible(true);
      } else {
        setIsMagicCodePossible(false);
      }
    }

    if (
      trainingMethod &&
      !["image", "text", "recommender"].includes(trainingMethod) &&
      (!option || option === "colab" || option === "custom")
    )
      setIsRequiredHyperParameters(true);
    else setIsRequiredHyperParameters(false);

    // // 학습형태 변경되면 값 초기화
    // if (trainingMethod) {
    //   if (trainingMethod === "normal") {
    //     setAlgorithmType(Object.keys(INITIAL_ALGORITHM_INFO)[3]);
    //     dispatch(
    //       putAlgorithmTypeRequestAction(Object.keys(INITIAL_ALGORITHM_INFO)[3])
    //     );
    //   }
    // }

    // 학습 중단하면 저장된 하이퍼파라미터 정보 초기화
    if (projects.project?.status === 0) setHyperParamsData(null);
  }, [projects.project]);

  const onSetShareGroupDict = async () => {
    let origianlSharedgroup;
    try {
      origianlSharedgroup = JSON.parse(projects.project.sharedgroup);
    } catch {
      origianlSharedgroup = [];
    }

    let tempGroupDict = {};
    let isAllTrue = true;
    let sharedgroup = origianlSharedgroup ? origianlSharedgroup : [];
    // try{
    //     if(projects.project.sharedgroup && projects.project.sharedgroup.length > 0){
    //         sharedgroup = projects.project.sharedgroup;
    //     }
    // }catch{
    //     sharedgroup = [];
    // }
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
    await setGroupCheckboxDict(tempGroupDict);
  };

  // const intervalAction = async () => {
  //   dispatch(
  //     getAsyncProjectRequestAction({
  //       originalProjects: projects.project,
  //       id: projects.project.id,
  //     })
  //   );
  // };

  const onSetSampleData = () => {
    const project = projects.project;
    if (!project) return;

    let sampleDataRaw = {};
    let sampleDataIdDict = {};
    let detailText =
      projects.project.description !== null ? projects.project.description : "";
    setNextProjectName(projects.project.projectName);
    setNextProjectDetail(detailText);
    projects.project.timeSeriesColumnInfo &&
      setTimeSeriesColumnInfo(projects.project.timeSeriesColumnInfo);
    projects.project.preprocessingInfo &&
      setPreprocessingInfo(projects.project.preprocessingInfo);
    projects.project.preprocessingInfoValue &&
      setPreprocessingInfoValue(projects.project.preprocessingInfoValue);

    if (project.joinInfo) {
      setjoinInfo(project.joinInfo);
      var subConnectorsRaw = [];
      project.dataconnectorsList &&
        project.dataconnectorsList.map((connector) => {
          var isMainConnector = true;
          Object.keys(project.joinInfo).map((joinInfoValue) => {
            if (+connector.id === +joinInfoValue) {
              isMainConnector = false;
              subConnectorsRaw.push(connector);
            }
          });
          if (isMainConnector) {
            setMainConnector(connector);
          }
        });
      setSubConnectors(subConnectorsRaw);
    } else if (
      projects.project.dataconnectorsList &&
      projects.project.dataconnectorsList.length > 1
    ) {
      var subConnectorsRaw = [];
      var joinInfoRaw = {};
      var mainConnectorRaw = {};

      project &&
        project.dataconnectorsList &&
        project.dataconnectorsList.map((connector, idx) => {
          if (idx === 0) {
            setMainConnector(connector);
            mainConnectorRaw = connector;
          } else {
            subConnectorsRaw.push(connector);
            joinInfoRaw[connector.id] = {};
            joinInfoRaw[connector.id]["mainConnector"] = {};
            joinInfoRaw[connector.id]["subConnector"] = {};
            joinInfoRaw[connector.id]["isJoinReady"] = false;
            mainConnectorRaw.datacolumns.map((row) => {
              joinInfoRaw[connector.id]["mainConnector"][row.id] = false;
            });
            connector.datacolumns.map((row) => {
              joinInfoRaw[connector.id]["subConnector"][row.id] = false;
            });
          }
        });
      setSubConnectors(subConnectorsRaw);
      setjoinInfo(joinInfoRaw);
    } else if (
      projects.project.dataconnectorsList &&
      projects.project.dataconnectorsList.length === 1
    ) {
      setSubConnectors([]);
      setjoinInfo([]);
    }

    projects.project.analyticsStandard &&
      setAnalyticsStandard(projects.project.analyticsStandard);

    const state = props.history.location.state;
    if (state) {
      state.modelid && dispatch(setChosenModelRequestAction(state.modelid));
      state.page && setSelectedPage(state.page);
    } else {
      if (project.status === 0 && !isAnyModelFinished) {
        if (project.trainingMethod === "cycle_gan") {
          setSelectedPage("rawdata");
        } else {
          setSelectedPage("summary");
        }
      }
      let models = project.models;
      let tempFinished = false;
      if (models)
        for (let idx = 0; idx < models.length; idx++) {
          let model = models[idx];
          if (model.status === 100) {
            if (!isAnyModelFinished) tempFinished = true;
          }
        }
      setIsAnyModelFinished(tempFinished);

      if (
        [9, 99].indexOf(projects.project.status) > -1 ||
        (projects.project.status > 0 &&
          [9, 99].indexOf(projects.project.status) === -1 &&
          models?.length > 0) ||
        tempFinished
      ) {
        setIsModelPageAccessible(true);
        setSelectedPage("model");
      }
    }

    if (projects.project.startTimeSeriesDatetime) {
      var startTimeSeriesDatetimeSplit = projects.project.startTimeSeriesDatetime.split(
        " "
      );
      onChangeStartTimeSeriesDatetime(
        new Date(
          Date.parse(
            `${startTimeSeriesDatetimeSplit[0]}T${
              startTimeSeriesDatetimeSplit[1]
            }Z`
          )
        )
      );
    }
    if (projects.project.endTimeSeriesDatetime) {
      var endTimeSeriesDatetimeSplit = projects.project.endTimeSeriesDatetime.split(
        " "
      );
      onChangeEndTimeSeriesDatetime(
        new Date(
          Date.parse(
            `${endTimeSeriesDatetimeSplit[0]}T${endTimeSeriesDatetimeSplit[1]}Z`
          )
        )
      );
    }

    if (project.trainingColumnInfo) {
      var trainingColumnInfoRaw = {};
      Object.keys(project.trainingColumnInfo).map((columnInfo) => {
        if (project.trainingColumnInfo[columnInfo]) {
          trainingColumnInfoRaw[columnInfo] = true;
        }
      });
      setTrainingColumnInfo(trainingColumnInfoRaw);
    } else if (project.fileStructure) {
      var trainingColumnInfoRaw = {};
      JSON.parse(project.fileStructure).map((columnInfo) => {
        if (columnInfo.use) {
          trainingColumnInfoRaw[columnInfo.columnName] = JSON.parse(
            columnInfo.use
          );
        }
      });
      setTrainingColumnInfo(trainingColumnInfoRaw);
    } else {
      setTrainingColumnInfo({});
    }

    var datacolumnsRaw = [];

    var fileSizeRaw = 0;
    if (project.sampleData) {
      sampleDataRaw["전체"] = project.sampleData;
    }

    var isImageLabelData = false;
    project.dataconnectorsList &&
      project.dataconnectorsList.map((dataconnector) => {
        if (dataconnector.hasTextData) {
          setHasStructureData(true);
          setHasTimeSeriesData(true);
          setHasImageLabelData(false);
        } else if (dataconnector.hasImageData) {
          setHasStructureData(false);
          setHasTimeSeriesData(false);
          setHasImageLabelData(true);
          isImageLabelData = true;
        }
        dataconnector.datacolumns &&
          dataconnector.datacolumns.map((datacolumn) => {
            datacolumn.dataconnectorName = dataconnector.dataconnectorName;
            datacolumn.length =
              dataconnector.yClass && dataconnector.yClass.length;
            datacolumnsRaw.push(datacolumn);
          });
        sampleDataRaw[dataconnector.dataconnectorName] =
          dataconnector.sampleData;
        sampleDataIdDict[dataconnector.dataconnectorName] = dataconnector.id;
        if (dataconnector.fileSize) fileSizeRaw += dataconnector.fileSize;
      });
    if (project.hasImageData) {
      setHasStructureData(false);
      setHasTimeSeriesData(false);
      setHasImageLabelData(true);
    }
    if (project.hasTextData) {
      setHasStructureData(true);
      setHasTimeSeriesData(true);
      setHasImageLabelData(false);
    }
    if (
      !projects.project.dataconnectorsList &&
      projects.project.hasTimeSeriesData
    ) {
      setHasStructureData(true);
      setHasTimeSeriesData(true);
      setHasImageLabelData(false);
    }
    setFileSize(fileSizeRaw);
    setSampleData(sampleDataRaw);
    setSampleDataId(sampleDataIdDict);
    if (
      !(datacolumnsRaw && datacolumnsRaw.length > 0) &&
      projects.project.fileStructure
    ) {
      datacolumnsRaw = JSON.parse(projects.project.fileStructure);
    }
    setdatacolumns(datacolumnsRaw);
    datacolumnsRaw.forEach((datacolumn) => {
      if (datacolumn.miss > 0) setHasMissingValue(true);
    });

    if (project.trainingMethod) {
      if (project.trainingMethod.indexOf("time_series") > -1) {
        //dispatch(putTrainingMethodRequestAction('time_series'))
        setHasTimeSeriesData(true);
        setHasImageLabelData(false);
      }
    } else {
      if (isImageLabelData) {
        dispatch(putTrainingMethodRequestAction("image"));
      } else if (
        projects.project.hasImageData &&
        !projects.project.hasTextData
      ) {
        dispatch(putTrainingMethodRequestAction("image"));
      } else {
        dispatch(putTrainingMethodRequestAction("normal"));
      }
    }

    let total = 0;
    let done = 0;
    project.models &&
      project.models.forEach((model) => {
        total++;
        if (model.status === 100) done++;
      });
    const percentage = parseInt((done / total) * 100)
      ? parseInt((done / total) * 100)
      : 0;
    setModelPercentage(
      projects.project.status === 9 || projects.project.status === 99
        ? -1
        : percentage
    );
  };

  const setNameInputSize = () => {
    if (!nextProjectName) return;
    let size = 0;
    for (let idx = 0; idx < nextProjectName.length; idx++) {
      if (nextProjectName[idx].match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g)) {
        size += 28;
      } else if (nextProjectName[idx].match(/[A-Z]/g)) {
        const font = idx < 10 ? 22 : 21;
        size += font;
      } else if (nextProjectName[idx].match(/[a-z]/g)) {
        const font = idx < 10 ? 17 : 16;
        size += font;
      } else {
        size += 19;
      }
    }
    nameRef.current.style.width = size + "px";
  };
  const setNameDetailSize = () => {
    if (!nextProjectDetail) {
      detailRef.current.style.width = "100%";
    } else {
      let size = 0;
      for (let idx = 0; idx < nextProjectDetail.length; idx++) {
        if (nextProjectDetail[idx].match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g)) {
          size += 15;
        } else if (nextProjectDetail[idx].match(/[A-Z]/g)) {
          const font = idx < 10 ? 12 : 11;
          size += font;
        } else if (nextProjectDetail[idx].match(/[a-z]/g)) {
          const font = idx < 10 ? 9 : 8;
          size += font;
        } else {
          size += 10;
        }
      }
      detailRef.current.style.width = size + "px";
    }
  };

  const changeValueForPredict = (e) => {
    if (projects.project.isShared) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("You can’t make changes to shared projects")
        )
      );
      return;
    }
    const columnId = e.target.value;
    setValueForPredictColumnId(columnId);
    setValueForUserColumnId(null);
    setValueForItemColumnId(null);
    var columnInfo = null;
    datacolumns.map((column) => {
      if (column.id === columnId) {
        columnInfo = column;
      }
    });
    dispatch(putValueForPredictRequestAction(columnInfo.id));
    if (
      columnInfo.type === "object" &&
      projects.project.trainingMethod === "normal_regression"
    ) {
      dispatch(putTrainingMethodRequestAction("normal_classification"));
    }
    var subConnectorsRaw = [];
    var joinInfoRaw = {};
    var mainConnectorRaw = {};

    projects.project?.dataconnectorsList &&
      projects.project.dataconnectorsList.map((connector) => {
        if (connector.id === columnInfo.dataconnector) {
          setMainConnector(connector);
          mainConnectorRaw = connector;
        } else {
          subConnectorsRaw.push(connector);
          joinInfoRaw[connector.id] = {};
          joinInfoRaw[connector.id]["mainConnector"] = {};
          joinInfoRaw[connector.id]["subConnector"] = {};
          joinInfoRaw[connector.id]["isJoinReady"] = false;
          mainConnectorRaw.datacolumns.map((row) => {
            joinInfoRaw[connector.id]["mainConnector"][row.id] = false;
          });
          connector.datacolumns.map((row) => {
            joinInfoRaw[connector.id]["subConnector"][row.id] = false;
          });
        }
      });

    setSubConnectors(subConnectorsRaw);
    setjoinInfo(joinInfoRaw);
  };

  const changeValueForUser = (e) => {
    if (projects.project.isShared) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("You can’t make changes to shared projects")
        )
      );
      return;
    }
    const columnId = e.target.value;
    setValueForUserColumnId(columnId);
  };

  const changeValueForItem = (e) => {
    if (projects.project.isShared) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("You can’t make changes to shared projects")
        )
      );
      return;
    }
    const columnId = e.target.value;
    setValueForItemColumnId(columnId);
  };

  const optionChange = (e) => {
    const value = e.target.value;

    if (projects.project && projects.project.isShared) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("You can’t make changes to shared projects")
        )
      );
      return;
    }

    if (
      IS_ENTERPRISE &&
      ["speed", "accuracy", "labeling"].indexOf(value) > -1
    ) {
      checkIsValidKey(user, dispatch, t).then((result) => {
        if (
          (result !== undefined && result === false) ||
          projects.project.status !== 0
        )
          return;

        if (
          user.me &&
          user.me.usageplan &&
          user.me.usageplan.planName === "trial"
        ) {
          dispatch(setPlanModalOpenRequestAction());
          return;
        }

        if (value === "custom") setAlgorithmType(INITIAL_ALGORITHM_TYPE);
        else setAlgorithmType("auto");

        dispatch(putOptionRequestAction(value));
      });
    } else {
      if (value === "custom") setAlgorithmType(INITIAL_ALGORITHM_TYPE);
      else setAlgorithmType("auto");

      dispatch(putOptionRequestAction(value));
    }
  };

  const methodChange = (e) => {
    const value = e.target.value;
    const algorithmType =
      ["object_detection", "cycle_gan", "recommender"].indexOf(value) > -1 ||
      (projects.project.option === "colab" && !value.includes("normal"))
        ? "auto"
        : INITIAL_ALGORITHM_TYPE;
    setTrainMethod(value);

    if (projects.project.isShared) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("You can’t make changes to shared projects")
        )
      );
      return;
    }
    let hasNoError = true;
    if (value === "object_detection" || value === "cycle_gan") {
      if (value === "cycle_gan") {
        dispatch(putValueForPredictRequestAction(""));
        dispatch(putTrainingMethodRequestAction("cycle_gan"));
      } else {
        dispatch(putValueForPredictRequestAction("label"));
        dispatch(putTrainingMethodRequestAction("object_detection"));
        dispatch(putOptionRequestAction("colab"));
      }

      return;
    } else {
      if (["image", "text", "recommender"].indexOf(value) > -1)
        dispatch(putOptionRequestAction("not selected"));
      else if (value.includes("normal"))
        dispatch(putOptionRequestAction("custom"));
      else dispatch(putOptionRequestAction("colab"));
    }

    if (hasNoError) {
      dispatch(putTrainingMethodRequestAction(value));
    }

    setAlgorithmInfo(INITIAL_ALGORITHM_INFO);
    setAlgorithmType(algorithmType);
    dispatch(putAlgorithmTypeRequestAction(algorithmType));
  };

  const instanceTypeChange = (e) => {
    setInstanceType(e.target.value);
    if (projects.project.isShared) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("You can’t make changes to shared projects")
        )
      );
      return;
    }
    dispatch(putInstanceTypeRequestAction(e.target.value));
  };

  const changeAlgorithmType = (e) => {
    setAlgorithmType(e.target.value);
    if (projects.project.isShared) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("You can’t make changes to shared projects")
        )
      );
      return;
    }
    dispatch(putAlgorithmTypeRequestAction(e.target.value));
  };
  // const closeWarningModal = () => {
  //   setIsOpenWarningModal(false);
  // };

  const isInt = (n) => {
    return Number(n) === n && n % 1 === 0;
  };

  const isFloat = (n) => {
    // return Number(n) === n && n % 1 !== 0;
    return !isNaN(Number(n));
  };

  let listKeys = null;
  let subKeyVal = "";
  let tmpParameter = {};
  let tmpSubParameter = {};

  function combos(list, n = 0, result = [], current = {}, key, subKey) {
    const listValues = Array.isArray(list) ? list : Object.values(list);

    if (!Array.isArray(list)) {
      listKeys = Object.keys(list);
    }

    if (
      projects.subHyperParameters[key] &&
      projects.subHyperParameters[key].includes(subKey)
    ) {
      subKeyVal = subKey;
    }

    if (n === listValues.length) {
      result.push({ ...current, function_name: subKeyVal });
    } else
      listValues[n].forEach((item, i) =>
        combos(listValues, n + 1, result, { ...current, [listKeys[n]]: item })
      );

    return result;
  }

  const processSubParameterDatas = (param, key) => {
    let resultVal = [];
    let results = null;

    Object.keys(param.subParameter).map((subKey, j) => {
      if (
        projects.subHyperParameters &&
        projects.subHyperParameters[key] &&
        projects.subHyperParameters[key].includes(subKey)
      ) {
        results = processParameterDatas(param.subParameter[subKey], true);

        if (results) resultVal.push(...combos(results, 0, [], {}, key, subKey));
      }
    });

    return resultVal;
  };

  let resultData = true;

  const processParameterDatas = (info, isSubParamsData) => {
    const trainingMethod = projects.project?.trainingMethod;
    const params = info.parameter;

    if (params && resultData) {
      Object.keys(params).map((key, i) => {
        const param = params[key];
        const isMethodMatched =
          param.method === "clf/reg" ||
          (trainingMethod === "normal_classification" &&
            param.method === "clf") ||
          (trainingMethod === "normal_regression" && param.method === "reg");
        const hasMinVal = param.hasOwnProperty("min");
        const hasMaxVal = param.hasOwnProperty("max");
        const hasValArr = param.hasOwnProperty("valueArr");
        const hasRange = param.hasOwnProperty("range");
        const hasSubDomainCon = param.hasOwnProperty("subDomainCondition");

        let valueToPost = [];
        let range = {};
        let resultDomainCon = null;

        if (isMethodMatched) {
          if (param.checked) {
            // 범위설정 한 경우
            if (hasRange) {
              // min, max, split 중 하나라도 입력한 경우
              range = param.range;
              const { min, max, split } = param.range;
              let value = Number(min);
              // const isFalsy = undefined || "";
              const isEmpty =
                min === undefined ||
                max === undefined ||
                split === undefined ||
                min === "" ||
                max === "" ||
                split === "";

              // min, max, split 중 하나라도 빈 값인 경우
              if (isEmpty) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    "모든 파라미터 값을 입력해주세요."
                  )
                );

                resultData = null;
              } else {
                // min, max, split 값이 모두 입력된 경우
                const valLen = String(value).split(".")[1]
                  ? String(value).split(".")[1].length
                  : 0;
                const splitLen = String(split).split(".")[1]
                  ? String(split).split(".")[1].length
                  : 0;
                const toFixedCnt = valLen >= splitLen ? valLen : splitLen;

                if (split === 0) {
                  valueToPost.push(Number(min), Number(max));
                } else {
                  while (value <= Number(max)) {
                    valueToPost.push(value);
                    value = Number((value + Number(split)).toFixed(toFixedCnt));
                  }
                }
              }
            } else {
              // min, max, split 값이 모두 입력되지 않은 경우
              dispatch(
                openErrorSnackbarRequestAction(
                  "모든 파라미터 값을 입력해주세요."
                )
              );

              resultData = null;
            }
          } else {
            // 범위설정 안한 경우
            if (hasValArr) {
              // 다중값 지정한 경우
              const tmpValueArr = param.valueArr
                ? Array.isArray(param.valueArr)
                  ? param.valueArr
                  : trainingMethod === "normal_classification"
                  ? param.valueArr.clf
                  : param.valueArr.reg
                : [];
              valueToPost = [...tmpValueArr];

              if (valueToPost.length === 0) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    "모든 파라미터 값을 입력해주세요."
                  )
                );

                resultData = null;
              } else {
                valueToPost.map((v, i) => {
                  if (v === "") {
                    // 빈 값이 하나라도 들어온 경우
                    dispatch(
                      openErrorSnackbarRequestAction(
                        "모든 파라미터 값을 입력해주세요."
                      )
                    );

                    resultData = null;
                  } else {
                    // 값이 모두 있는 경우
                    if (
                      param.inputType === "option" &&
                      param.dataType !== "dict"
                    ) {
                      valueToPost =
                        projects.hyperParameterOptionLists[key] &&
                        projects.hyperParameterOptionLists[key].length > 0
                          ? projects.hyperParameterOptionLists[key]
                          : [param.value];
                    } else {
                      valueToPost[i] = param.dataType === "str" ? v : Number(v);
                    }
                  }
                });
              }
            } else {
              // 단일값 입력한 경우
              if (param.value === "") {
                // 빈 값이 들어온 경우
                dispatch(
                  openErrorSnackbarRequestAction(
                    "모든 파라미터 값을 입력해주세요."
                  )
                );

                resultData = null;
              } else {
                // 값이 있는 경우
                if (param.inputType === "option" && param.dataType !== "dict") {
                  valueToPost =
                    projects.hyperParameterOptionLists[key] &&
                    projects.hyperParameterOptionLists[key].length > 0
                      ? projects.hyperParameterOptionLists[key]
                      : [param.value];
                } else
                  valueToPost.push(
                    param.dataType === "bool"
                      ? param.value === "true"
                        ? true
                        : false
                      : param.dataType === "int" || param.dataType === "float"
                      ? Number(
                          typeof param.value === "object"
                            ? param.value[
                                projects.project?.trainingMethod ===
                                "normal_classification"
                                  ? "clf"
                                  : "reg"
                              ]
                            : param.value
                        )
                      : param.value
                  );
              }
            }
          }

          // 최소, 최대 제한값 중 하나라도 있는 경우
          if (hasMinVal || hasMaxVal) {
            const min = Number(param.min);
            const rangeMin = Number(range.min);
            const max = Number(param.max);
            const rangeMax = Number(range.max);
            let isNotAllowedRange = false;

            if (param.valueArr) {
              param.valueArr.map((v, i) => {
                isNotAllowedRange = param.between
                  ? (hasMinVal && min >= v) || (hasMaxVal && max <= v)
                  : (hasMinVal && min > v) || (hasMaxVal && max < v);

                // 다중값 설정하고 단일 인풋 입력한 경우
                if (
                  i === param.valueArr.length - 1 &&
                  param.inputType === "numb" &&
                  param.value &&
                  param.value !== ""
                ) {
                  const paramVal = Number(param.value);

                  isNotAllowedRange = param.between
                    ? (hasMinVal && min >= paramVal) ||
                      (hasMaxVal && max <= paramVal)
                    : (hasMinVal && min > paramVal) ||
                      (hasMaxVal && max < paramVal);
                }
              });
            } else {
              if (param.value !== "") {
                const paramVal = Number(param.value);

                isNotAllowedRange = param.between
                  ? (hasMinVal &&
                      (min >= paramVal || (hasRange && min >= rangeMin))) ||
                    (hasMaxVal &&
                      (max <= paramVal || (hasRange && max <= rangeMax)))
                  : (hasMinVal &&
                      (min > paramVal || (hasRange && min > rangeMin))) ||
                    (hasMaxVal &&
                      (max < paramVal || (hasRange && max < rangeMax)));

                // 범위를 설정했는데 최대값이 최소값보다 작게 설정된 경우
                if (hasRange && rangeMin >= rangeMax) {
                  dispatch(
                    openErrorSnackbarRequestAction(
                      "최대값을 최소값보다 크게 설정해주세요."
                    )
                  );

                  resultData = null;
                }
              }
            }

            // 입력값이 제한값 범위내에 없는 경우 (일반, 범위, 다중값 모두 포함)
            if (isNotAllowedRange) {
              dispatch(
                openErrorSnackbarRequestAction(
                  `${t(
                    "Please enter a parameter value suitable for the range."
                  )} (${key})`
                )
              );

              resultData = null;
            }
          }

          // subValue가 없거나, subValue가 있어도 선택되지 않은 경우에만 타입 판별 -> subValue는 None or str => 타입 판별 필요 없음
          if (
            !param.subValue ||
            (param.subValue && param.subValue !== param.value)
          ) {
            if (param.dataType === "int" || param.dataType === "float") {
              // dataType 체크
              let isValidType = true;

              valueToPost.map((v, i) => {
                switch (param.dataType) {
                  case "int":
                    isValidType = isInt(v);
                    break;
                  case "float":
                    isValidType = isFloat(v);
                    break;

                  default:
                    break;
                }

                if (
                  i === valueToPost.length - 1 &&
                  param.inputType === "numb" &&
                  param.value &&
                  param.value !== ""
                )
                  switch (param.dataType) {
                    case "int":
                      isValidType = isInt(Number(param.value));
                      break;
                    case "float":
                      isValidType = isFloat(Number(param.value));
                      break;

                    default:
                      break;
                  }
              });

              if (!isValidType) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t("Please check the data type of the entered value.") +
                      ` ( ${key} )`
                  )
                );

                resultData = null;
              }
            }

            if (hasSubDomainCon) {
              const subDomCon = param.subDomainCondition;

              // 설정한 다중값들의 총 합 조건 판별
              if (subDomCon.action === "sum") {
                resultDomainCon = valueToPost.reduce(
                  (prev, current) => prev + current,
                  0
                );

                if (
                  (resultDomainCon === Number(subDomCon.value)) !==
                  subDomCon.isMatched
                ) {
                  dispatch(
                    openErrorSnackbarRequestAction(
                      t(
                        "Please check the setting value of the corresponding parameter."
                      ) + ` (${key}) `
                    )
                  );

                  resultData = null;
                }
              } else if (subDomCon.action === "count") {
                // 설정값 개수 제약 판별
                const value = subDomCon.value;

                if (param.value !== param.subValue) {
                  const count = param.valueArr ? param.valueArr.length : 1;

                  let compCount = 0;

                  if (typeof value === "string") {
                    compCount = params[value]?.valueArr
                      ? params[value].valueArr.length
                      : Number(params[value].value);
                  }

                  const notAllowed =
                    (typeof value === "string" && count !== compCount) || // value에 key값이 들어있을 경우
                    (typeof value === "number" && count !== value); // value에 count값 들어있을 경우

                  if (notAllowed) {
                    dispatch(
                      openErrorSnackbarRequestAction(
                        t(
                          "Please set as many values as the number that meets the conditions."
                        ) + ` (${key}) `
                      )
                    );

                    resultData = null;
                  }
                }
              }
            }
          }

          valueToPost.map((v, i) => {
            // 학습형태별 값 있는 경우 처리
            if (
              typeof v === "object" &&
              v.hasOwnProperty("clf") &&
              v.hasOwnProperty("reg")
            )
              valueToPost[i] =
                projects.project?.trainingMethod === "normal_classification"
                  ? v.clf
                  : v.reg;

            // 요청값 세팅 전 타입 변환
            if (
              !param.subValue ||
              (param.subValue && param.subValue !== param.value)
            ) {
              switch (param.dataType) {
                case "int":
                  valueToPost[i] = parseInt(v);
                  break;
                case "float":
                  valueToPost[i] = parseFloat(v);
                  break;
                case "bool":
                  valueToPost[i] = v === "true" ? true : false;
                  break;

                default:
                  break;
              }

              if (
                i === valueToPost.length - 1 &&
                param.inputType === "numb" &&
                param.value &&
                param.value !== ""
              )
                if (!valueToPost.includes(Number(param.value)))
                  valueToPost.push(
                    param.dataType === "int"
                      ? parseInt(param.value)
                      : param.dataType === "float"
                      ? parseFloat(param.value)
                      : param.value
                  );
            }

            if (param.subValue && param.value && param.subValue === param.value)
              valueToPost[i] = param.value === "None" ? null : "auto";
          });

          if (isSubParamsData) {
            tmpSubParameter[key] = valueToPost;
          } else {
            tmpParameter[key] = param.subParameter
              ? processSubParameterDatas(param, key)
              : ["moms", "metrics", "ps", "y_range"].includes(key) &&
                valueToPost[0] !== null
              ? [valueToPost]
              : valueToPost;
          }
        }
      });
    }

    resultData = resultData
      ? isSubParamsData
        ? tmpSubParameter
        : tmpParameter
      : null;

    return resultData;
  };

  const startProcess = async () => {
    const project = projects.project;

    if (project.option === "not selected") {
      dispatch(
        openErrorSnackbarRequestAction(
          t(
            "'선호하는 방식'을 선택해주세요. AutoML 옵션의 경우 라이센스 구매 후 이용 가능합니다."
          )
        )
      );
      return;
    }

    if (
      project?.available_gpu_list?.length > 0 &&
      trainMethod === "object_detection" &&
      !isDeviceAllSelected &&
      selectedDeviceArr.length === 0
    ) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("Please set at least one training GPU.")
        )
      );
      return;
    }

    if (
      project?.available_gpu_list?.length > 0 &&
      trainMethod === "object_detection" &&
      !isDeviceAllSelected &&
      selectedDeviceArr.length === 0
    ) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("Please set at least one training GPU.")
        )
      );
      return;
    }

    if (project?.option?.indexOf("load") > -1) {
      await api
        .updateProject(
          {
            trainingMethod: project.trainingMethod,
            status: 100,
            statusText: "100: 로드가 완료되었습니다.",
          },
          project.id
        )
        .then((res) => {
          dispatch(
            openSuccessSnackbarRequestAction(t("Model loading is complete."))
          );
          project = res.data;
          setIsModelPageAccessible(true);
          setSelectedPage("model");
        })
        .catch((e) => {
          dispatch(
            openErrorSnackbarRequestAction(t("Please try again in a moment."))
          );
        });

      return;
    }

    if (project.isShared) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("You can’t make changes to shared projects")
        )
      );
      return;
    }

    if (hasImageLabelData && project.trainingMethod.indexOf("normal") > -1) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("Please reselect your training method.")
        )
      );
      return;
    }

    if (project.trainingMethod.length < 1) {
      dispatch(
        openErrorSnackbarRequestAction(t("Please select a training method."))
      );
      return;
    }

    if (
      project.trainingMethod.indexOf("time_series") > -1 &&
      startTimeSeriesDatetime > endTimeSeriesDatetime &&
      analyticsStandard !== "auto"
    ) {
      dispatch(
        openErrorSnackbarRequestAction(
          t(
            "The end point cannot be set earlier than the starting point. Please reset the analysis period to continue."
          )
        )
      );
      return;
    }

    if (project.trainingMethod.indexOf("time_series") > -1) {
      if (Object.keys(timeSeriesColumnInfo).length === 0) {
        dispatch(
          openErrorSnackbarRequestAction(
            t("Set the standard row of time series for each data.")
          )
        );
        return;
      }
    }

    if (
      !(
        project.trainingMethod.indexOf("image") > -1 ||
        project.trainingMethod.indexOf("object_detection") > -1
      ) &&
      !project.valueForPredictColumnId
    ) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("Select the value you want to analyze/predict.")
        )
      );
      return;
    }

    var joinInfoValueCount = 0;
    joinInfo &&
      Object.keys(joinInfo).map((joinInfoValue) => {
        if (joinInfo[joinInfoValue]["isJoinReady"]) {
          joinInfoValueCount += 1;
        }
      });
    if (subConnectors.length !== joinInfoValueCount) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("Please enter all the linkage information.")
        )
      );
      return;
    }
    let valueForPredictInfo = {};
    let hasMuchUniqueObject = false;
    datacolumns.map((datacolumn) => {
      if (datacolumn["id"] === project.valueForPredict) {
        valueForPredictInfo = datacolumn;
      }
      if (
        datacolumn["unique"] > 250 &&
        datacolumn["type"] === "object" &&
        trainingColumnInfo[datacolumn["id"]]
      ) {
        hasMuchUniqueObject = true;
      }
    });
    if (
      hasMuchUniqueObject &&
      (project.trainingMethod === "normal_classification" ||
        (project.trainingMethod === "normal" &&
          valueForPredictInfo["type"] === "object"))
    ) {
      dispatch(
        openErrorSnackbarRequestAction(
          `${t(
            "The number of unique values ​​of strings that can be used in tabular data is limited to 250."
          )} ${t(
            "계속진행 하시려면 유일값이 250개가 초과하는 칼럼의 학습데이터사용여부 체크를 해제하세요."
          )}`
        )
      );
      return;
    }

    if (
      project.status === 0 &&
      ((!project.option && isMagicCodePossible) ||
        project?.option === "colab") &&
      project.statusText !== "중단"
    ) {
      for (let value in colabInfo) {
        colabInfo[value] =
          colabInfo[value] === "" ? "" : parseFloat(colabInfo[value]);

        if (!colabInfo[value]) {
          dispatch(
            openErrorSnackbarRequestAction(
              "올바른 파라미터를 채운 후 실행해주세요."
            )
          );
          return;
        }
      }
    }

    // if (!IS_ENTERPRISE) {
    //   if (user.usages && user.usages.length > 0) {
    //     let totalDeposit = 0;
    //     let totalUsage = 0;
    //     let tempUsage = user.usages;
    //     tempUsage.forEach((usage) => {
    //       if (usage.name === "deposit") totalDeposit = usage.value;
    //       else totalUsage = totalUsage + usage.value;
    //     });
    //     if (totalDeposit - totalUsage <= 0) {
    //       dispatch(
    //         openErrorSnackbarRequestAction(
    //           "크레딧 충전 후 서비스 이용이 가능합니다."
    //         )
    //       );
    //       return;
    //     }
    //   } else {
    //     dispatch(
    //       openErrorSnackbarRequestAction("유저 정보를 찾을 수 없습니다.")
    //     );
    //     return;
    //   }
    // }

    let tmpParameter;

    if (
      (!project?.option && project.trainingMethod.includes("normal")) ||
      project?.option === "custom"
    ) {
      tmpParameter = processParameterDatas(
        algorithmInfo[!algorithmType ? INITIAL_ALGORITHM_TYPE : algorithmType]
      );

      if (!tmpParameter) return;
      else {
        let totalModelLength = 1;
        Object.values(tmpParameter).map(
          (v, i) => (totalModelLength *= v.length)
        );

        if (totalModelLength > 300) {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "모델 생성은 최대 300개 까지 가능합니다. 파라미터들의 설정값 개수를 확인해주세요."
              )
            )
          );

          return;
        }
      }
    }

    let projectInfo = {
      valueForPredictColumnId: project.valueForPredictColumnId,
      id: project.id,
      // isStart: true,
      status: 1,
      statusText: "1: 모델링이 시작됩니다.",
      option: project?.option
        ? project?.option
        : isMagicCodePossible
        ? "custom"
        : "speed",
      trainingMethod: project.trainingMethod,
      joinInfo: joinInfo,
      fileSize: fileSize,
      trainingColumnInfo: trainingValueForStart,
      timeSeriesColumnInfo: timeSeriesColumnInfo,
      preprocessingInfo: preprocessingInfo,
      preprocessingInfoValue: preprocessingInfoValue,
      analyticsStandard: analyticsStandard,
      startTimeSeriesDatetime: startTimeSeriesDatetime,
      endTimeSeriesDatetime: endTimeSeriesDatetime,
      valueForItemColumnId: valueForItemColumnId,
      valueForUserColumnId: valueForUserColumnId,
      instanceType: instanceType,
      isParameterCompressed:
        project.status === 0 &&
        project?.option === "colab" &&
        project.statusText !== "중단" &&
        hasStructuredData,
    };

    if (
      !isDeviceAllSelected &&
      project.available_gpu_list?.length > selectedDeviceArr.length
    )
      projectInfo["require_gpus"] = selectedDeviceArr;

    if (!project?.option || project?.option === "custom") {
      projectInfo.algorithm = !algorithmType
        ? INITIAL_ALGORITHM_TYPE
        : algorithmType.includes("_ann") || project?.trainingMethod === "normal"
        ? algorithmType
        : project?.trainingMethod === "normal_classification"
        ? algorithmType + "_clf"
        : algorithmType + "_reg";
      projectInfo.hyper_params = tmpParameter;
    }

    if (project?.option === "colab" && project.models.length === 0) {
      projectInfo.models = [
        {
          algorithmType: algorithmType,
          epoch: colabInfo.epoch,
          learningRate: colabInfo.learningRate,
          layerDeep: colabInfo.layerDeep,
          layerWidth: colabInfo.layerWidth,
          dropOut: colabInfo.dropOut,
        },
      ];
    }

    console.log(projectInfo);
    if (
      valueForPredictInfo["unique"] > 250 &&
      (project.trainingMethod === "text" ||
        project.trainingMethod === "image" ||
        project.trainingMethod === "object_detection" ||
        project.trainingMethod === "normal_classification")
    ) {
      dispatch(
        openErrorSnackbarRequestAction(
          t(
            "The unique value of the classification you are trying to predict is more than 250. Please predict other values or reduce the classification value."
          )
        )
      );
      return;
    } else if (
      hasMissingValue &&
      valueForPredictInfo["unique"] > 25 &&
      valueForPredictInfo["type"] === "object"
    ) {
      await dispatch(
        askStartProjectRequestAction({
          message: `${t(
            "If there are more than 25 unique values that you want to predict, the accuracy may decrease. If preprocessing is not performed, the rows with missing values will be removed."
          )} ${t("Would you like to proceed?")}`,
          project: projectInfo,
        })
      );
    } else if (
      hasMissingValue &&
      !(
        valueForPredictInfo["unique"] > 25 &&
        valueForPredictInfo["type"] === "object"
      )
    ) {
      await dispatch(
        askStartProjectRequestAction({
          message: `${t(
            "If preprocessing is not performed, the rows with missing values will be removed."
          )} ${t("Would you like to proceed?")}`,
          project: projectInfo,
        })
      );
    } else if (
      !hasMissingValue &&
      valueForPredictInfo["unique"] > 25 &&
      valueForPredictInfo["type"] === "object"
    ) {
      await dispatch(
        askStartProjectRequestAction({
          message: `${t(
            "If there are more than 25 unique values that you want to predict, the accuracy may decrease."
          )} ${t("Would you like to proceed?")}`,
          project: projectInfo,
        })
      );
    } else {
      await dispatch(
        askStartProjectRequestAction({
          message: "Would you like to start modeling your project with the selected options?",
          project: projectInfo,
        })
      );
    }
  };

  const changeSelectedPage = (value) => {
    setSelectedPage(value);
    if (isVerify) {
      props.history.push(`/admin/verifyproject/${projects.project.id}`);
    } else {
      props.history.push(`/admin/train/${projects.project.id}`);
    }
  };

  const getTimeSeriesCheckedValue = (value) => {
    setTimeSeriesColumnInfo(value);
  };
  const getCheckedValue = (value) => {
    setTrainingValueForStart(value);
  };
  const getProcessingInfo = (value) => {
    setPreprocessingInfo(value);
  };
  const getProcessingInfoValue = (value) => {
    setPreprocessingInfoValue(value);
  };

  const onMakeCircleOpacity = () => {
    document.getElementById("opacityDiv").style.visibility = "hidden";
  };
  const onBackCircleOpacity = () => {
    document.getElementById("opacityDiv").style.visibility = "visible";
  };

  const onCheckedValueAlarm = (value) => {
    if (projects.project.isShared) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("You can’t make changes to shared projects")
        )
      );
      return;
    }

    if (
      projects.project.statusText === "중단" &&
      ((projects.project.option && projects.project.option !== "custom") ||
        (projects.project.option === "custom" &&
          ["학습 인스턴스", "선호하는 방식"].includes(value)))
    ) {
      dispatch(
        openErrorSnackbarRequestAction(
          t(`중단되었던 프로젝트는 ${value}을 변경할 수 없습니다.`)
        )
      );
      return;
    }
    return;
  };

  const onClickjoinInfoValueValue = async (
    connectorId,
    connectorType,
    columnName
  ) => {
    var isJoinReady = false;
    var otherConnectorType = "mainConnector";
    if (!joinInfo[connectorId][connectorType][columnName]) {
      if (connectorType === "mainConnector") {
        otherConnectorType = "subConnector";
      }
      await Object.keys(joinInfo[connectorId][otherConnectorType]).map(
        async (columnName) => {
          if (joinInfo[connectorId][otherConnectorType][columnName]) {
            isJoinReady = true;
          }
        }
      );
    } else {
      await setjoinInfo((prevState) => {
        return {
          ...prevState,
          [connectorId]: {
            ...prevState[connectorId],
            ["isJoinReady"]: false,
          },
        };
      });
    }
    if (isJoinReady) {
      await setjoinInfo((prevState) => {
        return {
          ...prevState,
          [connectorId]: {
            ...prevState[connectorId],
            ["isJoinReady"]: true,
          },
        };
      });
    }
    await setjoinInfo((prevState) => {
      return {
        ...prevState,
        [connectorId]: {
          ...prevState[connectorId],
          [connectorType]: {
            ...prevState[connectorId][connectorType],
            [columnName]: !joinInfo[connectorId][connectorType][columnName],
          },
        },
      };
    });
    await Object.keys(joinInfo[connectorId][connectorType]).map(
      async (otherColumnName) => {
        if (
          columnName !== otherColumnName &&
          joinInfo[connectorId][connectorType][otherColumnName]
        ) {
          await setjoinInfo((prevState) => {
            return {
              ...prevState,
              [connectorId]: {
                ...prevState[connectorId],
                [connectorType]: {
                  ...prevState[connectorId][connectorType],
                  [otherColumnName]: false,
                },
              },
            };
          });
        }
      }
    );
  };

  const closeTooltipModalOpen = () => {
    setIsTooltipModalOpen(false);
  };

  const onSetAskStopProject = () => {
    let stopMessage = "Do you want to stop the process?";
    // if (projects.project.models && projects.project.models.length > 0) {
    //   stopMessage =
    //     "모델 학습이 시작된 경우, 프로젝트를 중단하여도 학습된 시간만큼의 크레딧이 차감됩니다. 프로세스를 중단하시겠습니까?";
    // }
    dispatch(
      askStopProjectRequestAction({
        message: stopMessage,
        id: projects.project.id,
        option: projects.project?.option,
      })
    );
  };

  const onChangeColabInfo = (e, paramName) => {
    let tempColabInfo = colabInfo;
    let tempValue = e.target.value;
    if (tempValue === "Na") tempValue = "";
    if (tempValue && !isFinite(tempValue)) return;
    if (tempValue < 0) return;

    if (
      paramName === "epoch" ||
      paramName === "layerDeep" ||
      paramName === "layerWidth"
    )
      if (!tempValue) tempValue = "";
      else tempValue = parseInt(tempValue);
    if (paramName === "learningRate" || paramName === "dropOut") {
      if (tempValue >= 1) tempValue = 0.99;
      else if (tempValue === "0.") tempValue = "0.";
      else if (tempValue === "0.0") tempValue = "0.0";
      else if (tempValue === "0.00") tempValue = "0.00";
      else if (tempValue === "0.000") tempValue = "0.000";
      else if (tempValue !== 0 && !tempValue) tempValue = "";
      else tempValue = parseFloat(tempValue);
    }
    for (let value in tempColabInfo) {
      if (value === paramName) tempColabInfo[value] = tempValue;
    }
    setColabInfo(tempColabInfo);
    setIsParameterChanged(true);
  };

  const onCloseColabModal = () => {
    dispatch(putIsProjectStartedRequest());
    setIsGetColabCodeLoading(false);
    setColabModalOpen(false);
  };

  const getColabCode = (parameters) => {
    if (isGetColabCodeLoading) return;

    setIsGetColabCodeLoading(true);

    const colabParameters = parameters ? parameters : colabInfo;
    api
      .getColabCode(projects.project.id, colabParameters)
      .then((res) => {
        setColabCode(res.data);
      })
      .catch((e) => {
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t("A temporary error has occured. Please try again.")
            )
          );
        }
      })
      .finally(() => {
        setIsGetColabCodeLoading(false);
      });
  };

  const onSetColabOpen = async (e, colabParameters) => {
    await getColabCode(colabParameters);
    await setColabModalOpen(true);
  };

  const handleClickForShare = (event) => {
    if (!(groups.parentsGroup && groups.parentsGroup.length > 0)) {
      dispatch(
        openErrorSnackbarRequestAction(
          t(
            "Please create a group before sharing a project. You can create a group in Settings -> Sharing tab."
          )
        )
      );
      return;
    }
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
          if (value !== "all") tempGroupDict[value] = false;
        }
        await setGroupCheckboxDict(tempGroupDict);
        await dispatch(
          updateShareGroupRequestAction({
            projectId: projects.project.id,
            groupId: ["-1"],
            isUpdate: false,
          })
        );
      } else {
        let tempGroupDict = { all: true };
        for (let value in groupCheckboxDict) {
          if (value !== "all") tempGroupDict[value] = true;
        }
        await setGroupCheckboxDict(tempGroupDict);
        await dispatch(
          updateShareGroupRequestAction({
            projectId: projects.project.id,
            groupId: ["-1"],
            isUpdate: true,
          })
        );
      }
    } else {
      await setGroupCheckboxDict((prevState) => {
        return { ...prevState, all: false, [value]: !groupCheckboxDict[value] };
      });
      tempGroupArr.push(value);
      await dispatch(
        updateShareGroupRequestAction({
          projectId: projects.project.id,
          groupId: tempGroupArr,
          isUpdate: !groupCheckboxDict[value],
        })
      );
    }
    await onCloseShareMenu();
  };

  const onCopyColabCode = () => {
    try {
      var text = document.getElementById("colabCode");
      text.focus();
      text.select();
      document.execCommand("copy");
      dispatch(openSuccessSnackbarRequestAction(t("Code copied")));
    } catch (e) {
      dispatch(
        openErrorSnackbarRequestAction(t("Please copy the code yourself."))
      );
    }
  };

  // const onChangeProjectStatus = (e) => {
  //   if (projects.project.status === 0) {
  //     setIsProjectPriority(e.target.checked);
  //     return;
  //   } else if (
  //     projects.project.status === 60 ||
  //     projects.project.status === 61
  //   ) {
  //     dispatch(
  //       openErrorSnackbarRequestAction(
  //         t("This is a testing project, so training cannot be prioritized.")
  //       )
  //     );
  //     return;
  //   } else if (projects.project.status === 100) {
  //     dispatch(
  //       openErrorSnackbarRequestAction(t("Training for this project has already been completed."))
  //     );
  //     return;
  //   } else {
  //     dispatch(
  //       putProjectStatusRequestAction({
  //         projectId: projects.project.id,
  //         priority_flag: e.target.checked,
  //       })
  //     );
  //     setIsProjectPriority(e.target.checked);
  //     return;
  //   }
  // };

  const handleIsTimeSeries = (res) => {
    setIsTimeSeries(res);
  };

  const handleHelpIconTip = (category) => {
    const onOpenTooltipModal = (category) => {
      setTooltipCategory(category);
      setIsTooltipModalOpen(true);
    };

    return (
      <HelpOutlineIcon
        fontSize="small"
        style={{
          marginLeft: "4px",
          cursor: "pointer",
          verticalAlign: "sub",
        }}
        id="helpIcon"
        onClick={() => {
          onOpenTooltipModal(category);
        }}
      />
    );
  };

  const downloadReport = () => {
    dispatch(
      openSuccessSnackbarRequestAction(
        t("This operation may take more than 10 seconds. Please wait.")
      )
    );

    setIsDownloadReportLoading(true);

    api
      .postCreateReport(projects.project.id)
      .then((res) => {
        const linkEl = document.createElement("a");
        let url = "";
        if (IS_ENTERPRISE) url = fileurl + "static" + res.data.result;
        else url = res.data.result;
        linkEl.href = url;
        linkEl.download = "project_report.pdf";
        linkEl.dispatchEvent(new MouseEvent("click"));
      })
      .catch((e) => {
        console.error(e);

        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              e.response.data.message,
              e.response.data.message_en,
              user.language
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "Sorry. A temporary error occurred while downloading the report. please try again."
              )
            )
          );
        }
      })
      .finally(() => {
        setIsDownloadReportLoading(false);
      });
  };

  const secProjectTitle = () => {
    const onChangeNameInput = (e) => {
      e.preventDefault();
      let tempNameInput = e.target.value;
      if (tempNameInput.length > 255) {
        dispatch(
          openErrorSnackbarRequestAction(
            t(
              "The maximum number of characters that can be entered has been exceeded."
            )
          )
        );
        tempNameInput = tempNameInput.substring(0, 255);
      }
      setNextProjectName(tempNameInput);
    };

    const onChangeDetailInput = (e) => {
      e.preventDefault();
      let tempDetailInput = e.target.value;
      if (tempDetailInput.length > 255) {
        dispatch(
          openErrorSnackbarRequestAction(
            t(
              "The maximum number of characters that can be entered has been exceeded."
            )
          )
        );
        tempDetailInput = tempDetailInput.substring(0, 255);
      }
      setNextProjectDetail(tempDetailInput);
    };

    const onCancelChangeName = () => {
      setNextProjectName(projects.project.projectName);
      setIsUnableToChangeName(true);
    };

    const onCancelChangeDetail = () => {
      let detailText =
        projects.project.description !== null
          ? projects.project.description
          : "";
      setNextProjectDetail(detailText);
      setIsUnableTochangeDetail(true);
    };

    const saveProjectName = () => {
      setIsUnableToChangeName(true);
      dispatch(
        askChangeProjectNameRequestAction({
          id: projects.project.id,
          name: nextProjectName,
        })
      );
    };

    const saveProjectDetail = () => {
      setIsUnableTochangeDetail(true);
      dispatch(
        askChangeProjectDescriptionRequestAction({
          id: projects.project.id,
          description: nextProjectDetail,
        })
      );
    };

    return (
      <Grid container className={classes.projectTitle} sx={{ mb: 3.5 }}>
        <Grid item xs={12} lg={isRequiredHyperParameters ? 7.5 : 6}>
          <Grid container alignItems="center" justifyContent="space-between">
            <InputBase
              id="projectName"
              className={classes.titleInput}
              value={nextProjectName}
              disabled={isUnableToChangeName}
              autoFocus={true}
              inputRef={nameRef}
              onChange={onChangeNameInput}
              style={{
                color: currentThemeColor.textWhite87,
                fontSize: 24,
              }}
            />
            {!projects.project.isShared &&
              (isUnableToChangeName ? (
                <IconButton
                  id="edit_projectname_btn"
                  className={classes.changeButton}
                  onClick={() => {
                    setIsUnableToChangeName(false);
                  }}
                >
                  <Create />
                </IconButton>
              ) : (
                <div>
                  <Button
                    id="save_projectname_btn"
                    shape="blue"
                    size="sm"
                    onClick={saveProjectName}
                  >
                    {t("Save")}
                  </Button>
                  <Button
                    id="cancel_projectname_btn"
                    shape="blue"
                    size="sm"
                    onClick={onCancelChangeName}
                  >
                    {t("Cancel")}
                  </Button>
                </div>
              ))}
          </Grid>
          <Grid container alignItems="flex-end" justifyContent="space-between">
            <InputBase
              id="projectComment"
              className={classes.detailInput}
              placeholder={t(
                "There is no detailed description for this project."
              )}
              value={nextProjectDetail}
              disabled={isUnableToChangeDetail}
              autoFocus={true}
              inputRef={detailRef}
              onChange={onChangeDetailInput}
              multiline={true}
              maxRows={5}
              style={{
                color: currentThemeColor.textWhite87,
              }}
            />
            {!projects.project.isShared &&
              (isUnableToChangeDetail ? (
                <IconButton
                  id="edit_projectdescription_btn"
                  className={classes.changeButton}
                  sx={{ p: 0.25 }}
                  onClick={() => {
                    setIsUnableTochangeDetail(false);
                  }}
                >
                  <Create fontSize={"small"} />
                </IconButton>
              ) : (
                <div>
                  <Button
                    id="save_projectdescription_btn"
                    shape="blue"
                    size="xs"
                    onClick={saveProjectDetail}
                  >
                    {t("Save")}
                  </Button>
                  <Button
                    id="cancel_projectdescription_btn"
                    shape="blue"
                    size="xs"
                    onClick={onCancelChangeDetail}
                  >
                    {t("Cancel")}
                  </Button>
                </div>
              ))}
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const partSelectTab = (project) => {
    let isMethodCsv = !(
      project.trainingMethod === "image" ||
      project.trainingMethod === "object_detection"
    );

    const handleChangeTab = (event) => {
      setSelectedPage(event.target.id);
      if (isVerify) {
        props.history.push(`/admin/verifyproject/${project.id}`);
      } else {
        props.history.push(`/admin/train/${project.id}`);
      }
    };

    return (
      <GridContainer
        style={{
          width: "100% !important",
          borderTop: "1px solid " + currentTheme.border2,
        }}
      >
        <GridItem xs={8} lg={10} style={{ marginTop: "20px", display: "flex" }}>
          {isMethodCsv &&
            Object.keys(sampleData).indexOf("undefined") === -1 &&
            Object.keys(sampleData).length > 0 && (
              <div
                onClick={handleChangeTab}
                id="rawdata"
                className={
                  selectedPage === "rawdata"
                    ? classes.selectedTab
                    : classes.notSelectedTab
                }
                style={{ fontSize: "14px" }}
              >
                {t("Data")}
              </div>
            )}
          {project?.dataconnectorsList && (
            <div
              onClick={handleChangeTab}
              id="summary"
              className={
                selectedPage === "summary"
                  ? classes.selectedTab
                  : classes.notSelectedTab
              }
              style={{ fontSize: "14px" }}
            >
              {t("Summary")}
            </div>
          )}
          {subConnectors.map((subConnector, idx) => (
            <div
              id={"join_" + subConnector.id}
              key={`sysLinkInfo_${subConnector.id}`}
              className={
                selectedPage === "join_" + subConnector.id
                  ? classes.selectedTab
                  : classes.notSelectedTab
              }
              onClick={handleChangeTab}
              style={{ fontSize: "14px" }}
            >
              {t("Linkage information")} {idx + 1}
            </div>
          ))}
          {([9, 99].indexOf(project.status) > -1 ||
            (project.status > 0 &&
              [9, 99].indexOf(project.status) === -1 &&
              project.models?.length > 0) ||
            isAnyModelFinished) && (
            <div
              onClick={handleChangeTab}
              id="model"
              className={
                selectedPage === "model"
                  ? classes.selectedTab
                  : selectedPage === "detail" || selectedPage === "analytics"
                  ? classes.notSelectedTab
                  : classes.notSelectedTab
              }
              style={{ fontSize: "14px" }}
            >
              {t("Model")}
            </div>
          )}
          {selectedPage === "detail" && (
            <div
              id="detail"
              className={classes.selectedTab}
              style={{ fontSize: "14px" }}
            >
              {t("Details")}
            </div>
          )}
          {selectedPage === "analytics" && (
            <div
              id="analytics"
              className={classes.selectedTab}
              style={{ fontSize: "14px" }}
            >
              {t("Analysis")}
            </div>
          )}
        </GridItem>
        <GridItem xs={4} lg={2} style={{ marginTop: "20px", display: "flex" }}>
          <div className={classes.predictCountDiv}>
            {/* {user.me && (
            <div style={{ width: "100%" }}>
              <div>{t("Total number of predictions")}</div>
              <LinearProgress
                variant="determinate"
                color="blue"
                value={
                  (+user.me.cumulativePredictCount /
                    (+user.me.remainPredictCount +
                      +user.me.usageplan.noOfPrediction *
                        (user.me.dynos ? +user.me.dynos : 1) +
                      +user.me.additionalPredictCount)) *
                  100
                }
              />
              <div id="predictCountDiv" className="predictCountDiv">
                {user.me.cumulativePredictCount.toLocaleString()} /{" "}
                {(
                  +user.me.remainPredictCount +
                  +user.me.usageplan.noOfPrediction *
                    (user.me.dynos ? +user.me.dynos : 1) +
                  +user.me.additionalPredictCount
                ).toLocaleString()}{" "}
                {t("")}
              </div>
            </div>
          )} */}
          </div>
        </GridItem>
      </GridContainer>
    );
  };

  const partTimeSeriesSetting = () => {
    const divTSStandardSetting = () => {
      const onChangeStartDateFunc = (type, val) => {
        const year = val?.slice(0, 4);
        if (val) {
          if (year < 1970) {
            return;
          } else {
            onChangeStartTimeSeriesDatetime(val);
          }
        }
      };

      const onChangeEndDateFunc = (type, val) => {
        onChangeEndTimeSeriesDatetime(val);
      };

      return (
        <>
          {t("Analysis Start Time")} :{" "}
          {/* <DateTimePicker
          onChange={onChangeStartDateFunc}
          value={startTimeSeriesDatetime}
          disabled={
            projects.project.status !== 0 ||
            projects.project.statusText === "중단"
          }
          disableClock
        /> */}
          <form className={classes.container} noValidate>
            <TextField
              id="datetime-local"
              type="datetime-local"
              defaultValue={date}
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) =>
                onChangeStartDateFunc("datetime-local", e.target.value)
              }
            />
          </form>
          <br />
          {t("Analysis End Time")} :{" "}
          {/* <DateTimePicker
          onChange={onChangeEndTimeSeriesDatetime}
          value={endTimeSeriesDatetime}
          disabled={
            projects.project.status !== 0 ||
            projects.project.statusText === "중단"
          }
          disableClock
        /> */}
          <form className={classes.container} noValidate>
            <TextField
              id="datetime-local"
              type="datetime-local"
              defaultValue={date}
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) =>
                onChangeEndDateFunc("datetime-local", e.target.value)
              }
            />
          </form>
          <br />
        </>
      );
    };

    const divTSUnitSetting = () => {
      let isProjectStopped =
        projects.project.status !== 0 || projects.project.statusText === "중단";

      const onChangeAnalyticsStandard = (e) => {
        if (projects.project.isShared) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("You can’t make changes to shared projects")
            )
          );
          return;
        }
        const targetValue = e.target.value;
        if (
          projects.project.status !== 0 ||
          projects.project.statusText === "중단"
        )
          return;
        setAnalyticsStandard(targetValue);
        if (endTimeSeriesDatetime) {
          var changedDateTime = new Date(endTimeSeriesDatetime);
          if (targetValue && targetValue.indexOf("month") > -1) {
            changedDateTime.setUTCFullYear(
              changedDateTime.getUTCFullYear() - 10
            );
            onChangeStartTimeSeriesDatetime(changedDateTime);
          } else if (targetValue && targetValue.indexOf("day") > -1) {
            changedDateTime.setUTCMonth(changedDateTime.getUTCMonth() - 4);
            onChangeStartTimeSeriesDatetime(changedDateTime);
          } else if (targetValue && targetValue.indexOf("hour") > -1) {
            changedDateTime.setUTCDate(changedDateTime.getUTCDate() - 7);
            onChangeStartTimeSeriesDatetime(changedDateTime);
          } else if (targetValue && targetValue.indexOf("min") > -1) {
            changedDateTime.setUTCHours(changedDateTime.getUTCHours() - 2);
            onChangeStartTimeSeriesDatetime(changedDateTime);
          }
        }
      };

      return (
        <FormControl
          component="fieldset"
          onClick={() => {
            onCheckedValueAlarm("Analyze unit");
          }}
          disabled={isProjectStopped}
        >
          <FormLabel
            component="legend"
            style={{
              paddingTop: "20px",
              color: currentTheme.text1 + " !important",
            }}
          >
            {t("Analyze unit")}
          </FormLabel>
          <RadioGroup
            row
            aria-label="position"
            name="position"
            defaultValue="auto"
            onChange={onChangeAnalyticsStandard}
            value={analyticsStandard}
            disabled={isProjectStopped}
          >
            <FormControlLabel
              value="auto"
              control={<Radio color="primary" />}
              disabled={isProjectStopped}
              label={t("Auto")}
            />
            <FormControlLabel
              value="month"
              control={<Radio color="primary" />}
              disabled={isProjectStopped}
              label={t("Month")}
            />
            <FormControlLabel
              value="day"
              control={<Radio color="primary" />}
              disabled={isProjectStopped}
              label={t("Day")}
            />
            <FormControlLabel
              value="hour"
              control={<Radio color="primary" />}
              disabled={isProjectStopped}
              label={t("Hour")}
            />
            <FormControlLabel
              value="min"
              control={<Radio color="primary" />}
              disabled={isProjectStopped}
              label={t("Min")}
            />
          </RadioGroup>
        </FormControl>
      );
    };

    return (
      <>
        {analyticsStandard &&
          analyticsStandard.indexOf("auto") === -1 &&
          divTSStandardSetting()}
        {divTSUnitSetting()}
        <br />
        <p style={{ fontSize: "14px", color: "#F0F0F0" }}>
          {t("Caution")} :{" "}
          {t(
            "데이터들의 데이터 보유에 따라 분석 기간은 자동으로 조정될 수 있고, 분석 기준에 맞춰 통계값으로 가공됩니다."
          )}
        </p>
      </>
    );
  };

  const onSetTrainingDevice = (type, project) => {
    let isDisabled = project.status !== 0 || project.statusText === "중단";
    let tmpGpuList = checkIsIterable(project.available_gpu_list)
      ? [...project.available_gpu_list]
      : [];

    const handleDeviceCheckAll = (e) => {
      let tmpVal = e.target.value;
      if (tmpVal === "all") {
        if (isDeviceAllSelected) {
          setSelectedDeviceArr([]);
        } else {
          setSelectedDeviceArr(tmpGpuList);
        }
        setIsDeviceAllSelected(!isDeviceAllSelected);
        return;
      }
    };

    const handleDeviceCheck = (e) => {
      let tmpVal = e.target.value;
      let selectArr = [...selectedDeviceArr];
      let exIndex = selectArr.indexOf(tmpVal);
      if (exIndex > -1) selectArr.splice(exIndex, 1);
      else selectArr.push(tmpVal);
      if (selectArr.length < tmpGpuList.length) setIsDeviceAllSelected(false);
      else setIsDeviceAllSelected(true);
      setSelectedDeviceArr(selectArr);
    };

    const disabledTextStyle = {
      color: "darkgray",
      marginBottom: "0px",
      fontSize: "16px",
      fontWeight: 400,
    };

    let gpuList = project.available_gpu_list;

    return (
      <GridItem xs={12} style={{ marginTop: "16px" }}>
        <p className={classes.text87size16}>
          {type === "instance" && t("Training Instance Option")}
          {type === "gpu" && t("Training GPU Option")}
          {type === "gpu" && handleHelpIconTip("device")}
        </p>
        <FormControl
          className={classes.formControl}
          onClick={() => {
            if (type === "instance") onCheckedValueAlarm("Training instance");
            // if (type === "gpu") onCheckedValueAlarm("Training GPU");
          }}
        >
          {type === "instance" && (
            <Select
              labelid="demo-simple-select-outlined-label"
              value={project.instanceType ? project.instanceType : "normal"}
              onChange={instanceTypeChange}
              defaultValue={"normal"}
              disabled={isDisabled}
              id={
                isDisabled ? "disabledSelectBox" : "methodForPredictSelectBox"
              }
            >
              <MenuItem value="normal">{t("Auto setup")}</MenuItem>
              <MenuItem value="g4dn.2xlarge">{t("g4dn.2xlarge")}</MenuItem>
              <MenuItem value="g4dn.4xlarge">{t("g4dn.4xlarge")}</MenuItem>
              <MenuItem value="g4dn.8xlarge">{t("g4dn.8xlarge")}</MenuItem>
              <MenuItem value="g4dn.16xlarge">{t("g4dn.16xlarge")}</MenuItem>
              <MenuItem value="g4dn.32xlarge">{t("g4dn.32xlarge")}</MenuItem>
              <MenuItem value="g4dn.64xlarge">{t("g4dn.64xlarge")}</MenuItem>
            </Select>
          )}
          {type === "gpu" &&
            (gpuList?.length ? (
              project.status === 0 ? (
                <>
                  {gpuList.length > 1 && (
                    <FormGroup onChange={handleDeviceCheckAll}>
                      <FormControlLabel
                        label={"전체 선택"}
                        control={
                          <Checkbox
                            value="all"
                            size="small"
                            checked={isDeviceAllSelected}
                            style={{ marginRight: "4px" }}
                          />
                        }
                        style={{ marginLeft: 0 }}
                      />
                    </FormGroup>
                  )}
                  <FormGroup
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      maxHeight: "100px",
                      overflowY: "auto",
                    }}
                    onChange={handleDeviceCheck}
                  >
                    {gpuList.map((gpu) => (
                      <FormControlLabel
                        key={`checkform_${gpu.idx}`}
                        label={gpu.name}
                        control={
                          <Checkbox
                            value={gpu.idx}
                            size="small"
                            checked={selectedDeviceArr.includes(gpu.idx)}
                            style={{ marginRight: "4px" }}
                          />
                        }
                        style={{ marginLeft: 0 }}
                      />
                    ))}
                  </FormGroup>
                </>
              ) : (
                gpuList.map((gpu) => (
                  <p key={`gpu_${gpu.idx}`} style={disabledTextStyle}>
                    {gpu.name}
                  </p>
                ))
              )
            ) : (
              <p style={disabledTextStyle}>
                {t("There is no GPU to choose from.")}
              </p>
            ))}
        </FormControl>
      </GridItem>
    );
  };

  useEffect(() => {
    if (messages.message === "프로젝트가 성공적으로 중단되었습니다.")
      setAlgorithmInfo(INITIAL_ALGORITHM_INFO);
  }, [messages.message]);

  return (
    <div style={{ marginTop: "30px" }}>
      <ReactTitle title={"DS2.ai - " + t(isVerify ? "Verification" : "Train")} />
      {isLoading || !projects || projects.isLoading || !user.me ? (
        <div className={classes.smallLoading}>
          <CircularProgress size={50} sx={{ mb: 3.5 }} />
          <div style={{ fontSize: 15 }}>
            {t("Loading project. Please wait.")}
          </div>
        </div>
      ) : (
        <>
          {secProjectTitle()}
          <Grid container style={{ mb: 3 }}>
            <Grid
              item
              xs={12}
              lg={isRequiredHyperParameters ? 7.5 : 6}
              sx={{ order: { xs: 2, lg: 0 } }}
            >
              <Grid
                container
                className={classes.processMainCard}
                id="ProcessMainCard"
                style={{
                  maxHeight: "2000px",
                  background: currentTheme.background2,
                  border: "2px solid var(--surface2)",
                }}
              >
                {projects?.project?.option?.indexOf("load") > -1 ? (
                  <GridContainer>
                    <GridItem xs={12} lg={10}>
                      <p className={classes.text87size16}>
                        {t("Input data type")}
                        {handleHelpIconTip("method")}
                      </p>
                      <FormControl className={classes.formControl}>
                        <Select
                          labelid="demo-simple-select-outlined-label"
                          value={projects.project.trainingMethod}
                          onChange={methodChange}
                          disabled={projects.project.status !== 0}
                          id={
                            projects.project.status !== 0
                              ? "disabledSelectBox"
                              : "methodForPredictSelectBox"
                          }
                        >
                          <MenuItem value="normal">{t("General")}</MenuItem>
                          <MenuItem value="image">{t("Image")}</MenuItem>
                        </Select>
                      </FormControl>
                      {projects.project.trainingMethod &&
                        projects.project.trainingMethod.indexOf("time_series") >
                          -1 &&
                        partTimeSeriesSetting()}
                    </GridItem>
                  </GridContainer>
                ) : (
                  <>
                    {/* button area */}
                    <Grid item xs={12} sx={{ mb: 1.5 }}>
                      <Grid
                        container
                        justifyContent={
                          projects.project.status > 0 &&
                          projects.project.option === "colab"
                            ? "space-between"
                            : "flex-end"
                        }
                        alignItems="center"
                      >
                        {projects.project.status > 0 &&
                          projects.project.option === "colab" && (
                            <Button
                              id="check_colabcode_btn"
                              shape="greenOutlined"
                              onClick={(e) => onSetColabOpen(e)}
                            >
                              {t("View generated code")}
                            </Button>
                          )}
                        <div style={{ textAlign: "right" }}>
                          {!projects.project.isShared &&
                            [0, 9, 99, 100].indexOf(projects.project.status) ===
                              -1 && (
                              <Button
                                id="stop_project_btn"
                                shape="greenOutlined"
                                onClick={onSetAskStopProject}
                              >
                                {t("Abort the process")}
                              </Button>
                            )}
                          {!projects.project.isShared &&
                            isVerify &&
                            projects.project.status === 100 && (
                              <Button
                                id="download_report_btn"
                                shape="greenOutlined"
                                sx={{ ml: 1 }}
                                onClick={downloadReport}
                              >
                                <span>
                                  {t(
                                    "Download the training data verification report"
                                  )}
                                </span>
                                {isDownloadReportLoading && (
                                  <CircularProgress
                                    size={13}
                                    color="inherit"
                                    sx={{
                                      ml: 1,
                                      color: "var(--mainSub)",
                                      verticalAlign: "middle",
                                    }}
                                  />
                                )}
                              </Button>
                            )}
                          {user.me &&
                            user.me.usageplan.planName !== "trial" &&
                            parseInt(user.me.id) ===
                              parseInt(projects.project.user) && (
                              <>
                                <Button
                                  id="share_project_btn"
                                  shape="whiteOutlined"
                                  sx={{ ml: 1 }}
                                  onClick={handleClickForShare}
                                >
                                  {t("Share your project")}
                                </Button>
                                <Menu
                                  id="simple-menu"
                                  anchorEl={anchorEl}
                                  keepMounted
                                  open={Boolean(anchorEl)}
                                  onClose={onCloseShareMenu}
                                >
                                  <MenuItem
                                    style={{ padding: "4px 24px 4px 16px" }}
                                  >
                                    <div className={classes.defaultContainer}>
                                      <Switch
                                        value="all"
                                        checked={
                                          groupCheckboxDict["all"]
                                            ? true
                                            : false
                                        }
                                        color="primary"
                                        inputProps={{
                                          "aria-label": "primary checkbox",
                                        }}
                                        onChange={onChangeShareGroup}
                                      />
                                      <b>Share to All Group</b>
                                    </div>
                                  </MenuItem>
                                  {groups.parentsGroup &&
                                    groups.parentsGroup.map((group) => {
                                      var isChecked = groupCheckboxDict[
                                        group.id
                                      ]
                                        ? true
                                        : false;
                                      return (
                                        <MenuItem
                                          key={`parentGroup_${group.id}`}
                                          style={{
                                            padding: "4px 24px 4px 16px",
                                          }}
                                        >
                                          <div
                                            className={classes.defaultContainer}
                                          >
                                            <Switch
                                              className="shareGroupSwitch"
                                              value={group.id}
                                              checked={isChecked}
                                              color="primary"
                                              inputProps={{
                                                "aria-label":
                                                  "primary checkbox",
                                              }}
                                              onChange={onChangeShareGroup}
                                            />
                                            <b>Share to {group.groupname}</b>
                                          </div>
                                        </MenuItem>
                                      );
                                    })}
                                </Menu>
                              </>
                            )}
                        </div>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      lg={isRequiredHyperParameters ? 5.5 : 12}
                      sx={{ mb: 1 }}
                    >
                      <Grid container direction="column" wrap="nowrap">
                        {/* <GridItem
                          xs={12}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <p className={classes.text87size16}>
                            {t("AI Training Priority")}
                            {handleHelpIconTip("trainingPriority")}
                          </p>
                          <FormControl
                            component="fieldset"
                            id="optionForPrimary"
                            style={{ marginLeft: 12 }}
                          >
                            <Switch
                              value="priority"
                              checked={isProjectPriority}
                              color="primary"
                              inputProps={{ "aria-label": "primary checkbox" }}
                              onChange={onChangeProjectStatus}
                            />
                          </FormControl>
                        </GridItem> */}

                        {projects.project &&
                          onSetTrainingDevice("gpu", projects.project)}
                        <GridItem xs={12} style={{ marginTop: "16px" }}>
                          <p className={classes.text87size16}>
                            {t("Training Method")}
                            {handleHelpIconTip("method")}
                          </p>
                          <FormControl className={classes.formControl}>
                            <Select
                              id={
                                projects.project.status !== 0
                                  ? "disabledSelectBox"
                                  : "methodForPredictSelectBox"
                              }
                              labelid="demo-simple-select-outlined-label"
                              disabled={
                                projects.project.status !== 0 ||
                                projects.project?.option === "labeling"
                              }
                              value={projects.project.trainingMethod}
                              defaultValue={trainMethod}
                              onChange={methodChange}
                            >
                              {hasStructuredData && (
                                <MenuItem value="normal">
                                  {t(
                                    "Structured Data Automatic Classification"
                                  )}
                                </MenuItem>
                              )}
                              {hasStructuredData && (
                                <MenuItem value="normal_classification">
                                  {t("Structured Data Category Classification")}
                                </MenuItem>
                              )}
                              {hasStructuredData && (
                                <MenuItem value="normal_regression">
                                  {t("Structured Data Regression")}
                                </MenuItem>
                              )}
                              {hasStructuredData && (
                                <MenuItem value="text">
                                  {t("Natural Language Processing (NLP)")}
                                </MenuItem>
                              )}
                              {hasStructuredData && (
                                <MenuItem value="recommender">
                                  {t("Recommendation system (matrix)")}
                                </MenuItem>
                              )}
                              {hasImageLabelData && (
                                <MenuItem value="image">
                                  {t("Image Classification")}
                                </MenuItem>
                              )}
                              {/* {(!IS_ENTERPRISE && hasImageLabelData) && <MenuItem value='cycle_gan' >{t('Generative Adversarial Network (GAN)')}</MenuItem>} */}
                              {/* {!IS_ENTERPRISE && */}
                              {hasImageLabelData && (
                                <MenuItem value="object_detection">
                                  {t("Object Detection")}
                                </MenuItem>
                              )}
                              {/* {hasTimeSeriesData && (
                            <MenuItem value="time_series">
                              {t("Time Series Prediction")}
                            </MenuItem>
                          )}
                          {hasTimeSeriesData &&
                            (projects.project.status !== 0 ||
                              projects.project.statusText === "중단") && (
                              <MenuItem value="time_series_regression">
                                {t("Time Series Prediction")}
                              </MenuItem>
                            )}
                          {hasTimeSeriesData &&
                            (projects.project.status !== 0 ||
                              projects.project.statusText === "중단") && (
                              <MenuItem value="time_series_classification">
                                {t("Time Series Prediction")}
                              </MenuItem>
                            )} */}
                            </Select>
                          </FormControl>
                          {projects.project.trainingMethod &&
                            projects.project.trainingMethod.indexOf(
                              "time_series"
                            ) > -1 &&
                            partTimeSeriesSetting()}
                        </GridItem>
                        <GridItem xs={12} style={{ marginTop: "16px" }}>
                          <p className={classes.text87size16}>
                            {t("Preferred method")}
                            {handleHelpIconTip("option")}
                          </p>
                          <FormControl
                            component="fieldset"
                            disabled={
                              projects.project.status !== 0 ||
                              projects.project?.option === "labeling"
                            }
                            id="optionForPredictSelectBox"
                          >
                            <RadioGroup
                              row
                              aria-label="position"
                              name="position"
                              onChange={optionChange}
                              value={
                                projects.project?.option
                                  ? projects.project?.option
                                  : isMagicCodePossible
                                  ? projects.project.trainingMethod ===
                                    "object_detection"
                                    ? "colab"
                                    : "custom"
                                  : "speed"
                              }
                              disabled={projects.project.status !== 0}
                            >
                              {PREFER_TYPE.map((v, i) => {
                                const trainingMethod =
                                  projects.project?.trainingMethod;
                                const option = projects.project?.option;
                                const isRequired =
                                  ["accuracy", "speed"].indexOf(v.value) > -1 ||
                                  (v.value === "colab" &&
                                    isMagicCodePossible) ||
                                  (v.value === "custom" &&
                                    trainingMethod?.includes("normal")) ||
                                  (v.value === "labeling" &&
                                    option === "labeling");

                                return (
                                  isRequired && (
                                    <FormControlLabel
                                      key={`radiogroup_${v.label}`}
                                      value={v.value}
                                      control={<Radio color="primary" />}
                                      disabled={
                                        projects.project.status !== 0 ||
                                        option === "labeling"
                                      }
                                      label={
                                        ["speed", "accuracy"].includes(
                                          v.value
                                        ) ? (
                                          <span>
                                            {t(v.label)}{" "}
                                            <span
                                              style={{
                                                fontSize: 10,
                                                color: "var(--primary)",
                                                verticalAlign: "text-top",
                                              }}
                                            >
                                              {t("Auto setup")} (AutoML)
                                            </span>
                                          </span>
                                        ) : (
                                          t(v.label)
                                        )
                                      }
                                    />
                                  )
                                );
                              })}
                            </RadioGroup>
                          </FormControl>
                        </GridItem>
                        {projects.project.trainingMethod &&
                          !(
                            projects.project.trainingMethod.indexOf("image") >
                              -1 ||
                            projects.project.trainingMethod.indexOf(
                              "object_detection"
                            ) > -1
                          ) && (
                            <GridItem xs={12} style={{ marginTop: "16px" }}>
                              <p className={classes.text87size16}>
                                {t("Target Variable")}
                                {handleHelpIconTip("predictValue")}
                              </p>
                              <FormControl className={classes.formControl}>
                                <Select
                                  labelid="demo-simple-select-outlined-label"
                                  value={
                                    projects.project.valueForPredictColumnId
                                      ? projects.project.valueForPredictColumnId
                                      : "placeholder"
                                  }
                                  onChange={changeValueForPredict}
                                  disabled={
                                    projects.project.status !== 0 ||
                                    (projects.project.statusText === "중단" &&
                                      projects.project.option !== "custom") ||
                                    (projects.project.trainingMethod.indexOf(
                                      "image"
                                    ) > -1 ||
                                      projects.project.trainingMethod.indexOf(
                                        "object_detection"
                                      ) > -1)
                                  }
                                  className={classes.selectForm}
                                  id={
                                    projects.project.status !== 0 ||
                                    (projects.project.statusText === "중단" &&
                                      projects.project.option !== "custom")
                                      ? "disabledSelectBox"
                                      : "valueForPredictSelectBox"
                                  }
                                >
                                  <MenuItem
                                    value="placeholder"
                                    disabled
                                    style={{ fontSize: 14 }}
                                  >
                                    {t(
                                      "Select the value you want to analyze/predict."
                                    )}
                                  </MenuItem>
                                  {datacolumns &&
                                    datacolumns.map(
                                      (column) =>
                                        !column.isForGan && (
                                          <MenuItem
                                            key={column.id}
                                            value={column.id}
                                          >
                                            {column.columnName} -{" "}
                                            {column.dataconnectorName}
                                          </MenuItem>
                                        )
                                    )}
                                </Select>
                              </FormControl>
                            </GridItem>
                          )}
                        {projects.project.trainingMethod &&
                          projects.project.trainingMethod.indexOf(
                            "recommender"
                          ) > -1 && (
                            <GridItem xs={12} style={{ marginTop: "16px" }}>
                              <p className={classes.text87size16}>
                                {t("User Info (User ID column)")}
                                {/*<HelpOutlineIcon fontSize="xs" style={{marginLeft: '4px', cursor: 'pointer'}} id="helpIcon"*/}
                                {/*    onClick={()=>{onOpenTooltipModal('predictValue')}} />*/}
                              </p>
                              <FormControl
                                className={classes.formControl}
                                onClick={() => {
                                  onCheckedValueAlarm(
                                    "유저 정보 (유저 ID 칼럼)"
                                  );
                                }}
                              >
                                <Select
                                  labelid="demo-simple-select-outlined-label"
                                  value={valueForUserColumnId}
                                  onChange={changeValueForUser}
                                  disabled={
                                    projects.project.status !== 0 ||
                                    projects.project.statusText === "중단" ||
                                    (projects.project.trainingMethod.indexOf(
                                      "image"
                                    ) > -1 ||
                                      projects.project.trainingMethod.indexOf(
                                        "object_detection"
                                      ) > -1)
                                  }
                                  className={classes.selectForm}
                                  id={
                                    projects.project.status !== 0 ||
                                    projects.project.statusText === "중단"
                                      ? "disabledSelectBox"
                                      : "valueForPredictSelectBox"
                                  }
                                >
                                  {datacolumns.map(
                                    (column, idx) =>
                                      column.id !== valueForItemColumnId &&
                                      column.id !== valueForPredictColumnId && (
                                        <MenuItem value={column.id}>
                                          {column.columnName} -{" "}
                                          {column.dataconnectorName}
                                        </MenuItem>
                                      )
                                  )}
                                </Select>
                              </FormControl>
                            </GridItem>
                          )}
                        {projects.project.trainingMethod &&
                          projects.project.trainingMethod.indexOf(
                            "recommender"
                          ) > -1 && (
                            <GridItem xs={12} style={{ marginTop: "16px" }}>
                              <p className={classes.text87size16}>
                                {t("Item information (Item ID column)")}
                                {/*<HelpOutlineIcon fontSize="xs" style={{marginLeft: '4px', cursor: 'pointer'}} id="helpIcon"*/}
                                {/*    onClick={()=>{onOpenTooltipModal('predictValue')}} />*/}
                              </p>
                              <FormControl
                                className={classes.formControl}
                                onClick={() => {
                                  onCheckedValueAlarm(
                                    "아이템 정보 (아이템 ID 칼럼)"
                                  );
                                }}
                              >
                                <Select
                                  labelid="demo-simple-select-outlined-label"
                                  value={valueForItemColumnId}
                                  onChange={changeValueForItem}
                                  disabled={
                                    projects.project.status !== 0 ||
                                    projects.project.statusText === "중단" ||
                                    (projects.project.trainingMethod.indexOf(
                                      "image"
                                    ) > -1 ||
                                      projects.project.trainingMethod.indexOf(
                                        "object_detection"
                                      ) > -1)
                                  }
                                  className={classes.selectForm}
                                  id={
                                    projects.project.status !== 0 ||
                                    projects.project.statusText === "중단"
                                      ? "disabledSelectBox"
                                      : "valueForPredictSelectBox"
                                  }
                                >
                                  {datacolumns.map(
                                    (column, idx) =>
                                      column.id !== valueForUserColumnId &&
                                      column.id !== valueForPredictColumnId && (
                                        <MenuItem value={column.id}>
                                          {column.columnName} -{" "}
                                          {column.dataconnectorName}
                                        </MenuItem>
                                      )
                                  )}
                                </Select>
                              </FormControl>
                            </GridItem>
                          )}

                        {((!projects.project?.option &&
                          [
                            "object_detection",
                            "normal",
                            "normal_regression",
                            "normal_classification",
                          ].indexOf(projects.project?.trainingMethod) > -1) ||
                          ["colab", "custom"].includes(
                            projects.project?.option
                          )) && (
                          <GridItem xs={12} style={{ marginTop: "16px" }}>
                            <p className={classes.text87size16}>
                              {t("Algorithm Option")}
                              {handleHelpIconTip("algorithm")}
                            </p>
                            <FormControl className={classes.formControl}>
                              <Select
                                labelid="demo-simple-select-outlined-label"
                                value={algorithmType}
                                onChange={changeAlgorithmType}
                                disabled={
                                  projects.project.status !== 0 ||
                                  (projects.project.statusText === "중단" &&
                                    projects.project.option !== "custom") ||
                                  projects.project?.option === "colab"
                                }
                                id={
                                  projects.project.status !== 0 ||
                                  (projects.project.statusText === "중단" &&
                                    projects.project.option !== "custom") ||
                                  projects.project?.option === "colab"
                                    ? "disabledSelectBox"
                                    : "methodForPredictSelectBox"
                                }
                              >
                                {projects.project?.option === "colab" ? (
                                  <MenuItem value="auto">
                                    {t("Deep Learning")}
                                  </MenuItem>
                                ) : (
                                  Object.keys(INITIAL_ALGORITHM_INFO).map(
                                    (key, i) => {
                                      const method =
                                        INITIAL_ALGORITHM_INFO[key].method;
                                      const trainingMethod =
                                        projects.project?.trainingMethod;
                                      const isMethodMatched =
                                        (method &&
                                          (trainingMethod === "normal" &&
                                            method.includes("clf/reg"))) ||
                                        (trainingMethod ===
                                          "normal_classification" &&
                                          method.includes("clf")) ||
                                        (trainingMethod ===
                                          "normal_regression" &&
                                          method.includes("reg"));

                                      return (
                                        isMethodMatched &&
                                        (!projects.project.option ||
                                          (projects.project &&
                                            projects.project.option ===
                                              "custom" &&
                                            key !== "auto")) && (
                                          <MenuItem key={key} value={key}>
                                            <span style={{ marginRight: 8 }}>
                                              {t(
                                                INITIAL_ALGORITHM_INFO[key]
                                                  .label
                                              )}
                                            </span>
                                            <span
                                              style={{
                                                fontSize: 14,
                                                verticalAlign: "middle",
                                              }}
                                            >{`( ${INITIAL_ALGORITHM_INFO[key].version} )`}</span>
                                          </MenuItem>
                                        )
                                      );
                                    }
                                  )
                                )}
                              </Select>
                            </FormControl>
                          </GridItem>
                        )}
                      </Grid>
                    </Grid>

                    {isRequiredHyperParameters &&
                      ((projects.project?.option &&
                        projects.project?.option !== "colab") ||
                        ((!projects.project?.option ||
                          projects.project?.option === "colab") &&
                          isMagicCodePossible)) && (
                        <Grid item xs={12} lg={6.5}>
                          <HyperParameters
                            algorithmInfo={algorithmInfo}
                            setAlgorithmInfo={setAlgorithmInfo}
                            option={algorithmType}
                            preferedMethod={
                              projects.project?.option
                                ? projects.project?.option
                                : projects.project.trainingMethod ===
                                  "object_detection"
                                ? "colab"
                                : "custom"
                            }
                            trainingMethod={projects.project?.trainingMethod}
                            colabInfo={colabInfo}
                            onChangeColabInfo={onChangeColabInfo}
                            isParameterCompressedChecked={
                              isParameterCompressedChecked
                            }
                            projectStatus={projects.project?.status}
                            hyperParamsData={hyperParamsData}
                            initialInfo={INITIAL_ALGORITHM_INFO}
                          />
                        </Grid>
                      )}
                  </>
                )}
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              lg={isRequiredHyperParameters ? 4.5 : 6}
              sx={{
                display: "flex",
                alignItems: "center",
                order: { xs: 1, lg: 0 },
              }}
            >
              <Container
                maxWidth={false}
                component="main"
                style={{ minHeight: 360, margin: 16 }}
              >
                <div className={classes.addressContainer}>
                  {projects.project.status === 0 ? (
                    <>
                      <div
                        className={classes.opacityDiv}
                        id="opacityDiv"
                        style={{ marginTop: "-6px" }}
                      ></div>
                      <div className={classes.circleDiv}>
                        <b
                          className={classes.textDiv}
                          onMouseEnter={onMakeCircleOpacity}
                          onMouseLeave={onBackCircleOpacity}
                          onClick={startProcess}
                        >
                          START
                        </b>
                        <StartCircle
                          projectStatus={projects.project.status}
                          id="startProcess"
                        />
                      </div>
                    </>
                  ) : projects.project.status === 100 ? (
                    projects.project.models.filter(
                      (model) => model.status === 100
                    ).length === 0 ? (
                      <div className={classes.circleDiv}>
                        <ProcessCircle modelPercentage={-1} />
                      </div>
                    ) : (
                      <div className={classes.circleDiv}>
                        <StartCircle projectStatus={100} id="startProcess" />
                      </div>
                    )
                  ) : [99, 9].indexOf(projects.project.status) !== -1 ? (
                    <div className={classes.circleDiv}>
                      <ProcessCircle modelPercentage={-1} />
                    </div>
                  ) : (
                    <div className={classes.circleDiv}>
                      <ProcessCircle modelPercentage={modelPercentage} />
                    </div>
                  )}
                </div>
              </Container>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12} lg={10}>
              {subConnectors.map((subConnector, idx) => {
                let isReady =
                  joinInfo &&
                  joinInfo[subConnector.id] &&
                  joinInfo[subConnector.id]["isJoinReady"];

                return (
                  <div
                    key={`sysLink_${subConnector.id}`}
                    style={{ marginTop: "10px" }}
                  >
                    <Button
                      id="join_subconnector_btn"
                      shape="whiteOutlinedSquare"
                      style={{
                        background: isReady
                          ? "rgba(24, 160, 251, 0.5)"
                          : "rgba(24, 160, 251, 1)",
                      }}
                      onClick={() =>
                        changeSelectedPage("join_" + subConnector.id)
                      }
                    >
                      {isReady
                        ? t("Linkage complete")
                        : t("Linkage") + " " + (idx + 1)}
                    </Button>
                    <span style={{ marginLeft: "10px" }}>
                      {mainConnector.dataconnectorName}&nbsp;&lt;-&gt;&nbsp;
                      {subConnector.dataconnectorName}
                    </span>
                  </div>
                );
              })}
            </Grid>
          </Grid>
          {projects.project.status === 0 &&
            (!projects.project.option ||
              projects.project?.option === "colab") &&
            projects.project.statusText !== "중단" && (
              <Container
                component="main"
                className={classes.mainCard}
                style={{ maxHeight: "2000px" }}
              >
                <GridContainer
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* {isMagicCodePossible && (
                    <>
                      <GridItem xs={2}>epoch</GridItem>
                      <GridItem xs={2}>
                        <TextField
                          id="epoch"
                          placeholder={t("Please enter parameter.")}
                          disabled={
                            projects.project.status !== 0 ||
                            projects.project.statusText === "중단" ||
                            isParameterCompressedChecked
                          }
                          value={colabInfo["epoch"]}
                          onChange={(e) => {
                            onChangeColabInfo(e, "epoch");
                          }}
                          className={classes.textField}
                          margin="normal"
                        />
                      </GridItem>
                      <GridItem xs={2}>learningRate</GridItem>
                      <GridItem xs={2}>
                        <TextField
                          id="learningRate"
                          placeholder={t("Please enter parameter.")}
                          disabled={
                            projects.project.status !== 0 ||
                            projects.project.statusText === "중단" ||
                            isParameterCompressedChecked
                          }
                          value={colabInfo["learningRate"]}
                          onChange={(e) => {
                            onChangeColabInfo(e, "learningRate");
                          }}
                          className={classes.textField}
                          margin="normal"
                        />
                      </GridItem>
                      <GridItem xs={2}>layerDeep</GridItem>
                      <GridItem xs={2}>
                        <TextField
                          id="layerDeep"
                          placeholder={t("Please enter parameter.")}
                          disabled={
                            projects.project.status !== 0 ||
                            projects.project.statusText === "중단" ||
                            isParameterCompressedChecked
                          }
                          value={colabInfo["layerDeep"]}
                          onChange={(e) => {
                            onChangeColabInfo(e, "layerDeep");
                          }}
                          className={classes.textField}
                          margin="normal"
                        />
                      </GridItem>
                      <GridItem xs={2}>layerWidth</GridItem>
                      <GridItem xs={2}>
                        <TextField
                          id="layerWidth"
                          placeholder={t("Please enter parameter.")}
                          disabled={
                            projects.project.status !== 0 ||
                            projects.project.statusText === "중단" ||
                            isParameterCompressedChecked
                          }
                          value={colabInfo["layerWidth"]}
                          onChange={(e) => {
                            onChangeColabInfo(e, "layerWidth");
                          }}
                          className={classes.textField}
                          margin="normal"
                        />
                      </GridItem>
                    </>
                  )} */}
                </GridContainer>
              </Container>
            )}
          {partSelectTab(projects.project)}
          <GridContainer>
            <Container
              maxWidth={false}
              style={{
                display: selectedPage === "rawdata" ? "block" : "none",
                padding: "0px",
              }}
            >
              <RawDataTable
                category="sample"
                sampleData={sampleData}
                sampleDataId={sampleDataId}
              />
            </Container>
            <Container
              maxWidth={false}
              style={{
                display: selectedPage === "summary" ? "block" : "none",
                padding: "0px",
              }}
            >
              <SummaryTable
                category="process"
                csv={datacolumns}
                getTimeSeriesCheckedValue={getTimeSeriesCheckedValue}
                getCheckedValue={getCheckedValue}
                getProcessingInfo={getProcessingInfo}
                getProcessingInfoValue={getProcessingInfoValue}
                trainingColumnInfo={trainingColumnInfo}
                timeSeriesColumnInfo={timeSeriesColumnInfo}
                preprocessingInfoParent={preprocessingInfo}
                preprocessingInfoValueParent={preprocessingInfoValue}
                handleIsTimeSeries={handleIsTimeSeries}
              />
            </Container>
            {subConnectors.map(
              (subConnector) =>
                selectedPage === "join_" + subConnector.id && (
                  <>
                    <GridItem xs={6} style={{ marginTop: "20px" }}>
                      <div style={{ textAlign: "center", margin: "10px" }}>
                        {mainConnector.dataconnectorName}
                      </div>
                      <div className={classes.tableWrapper}>
                        <Table
                          stickyheader="true"
                          className={classes.table}
                          aria-label="sticky table"
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell
                                className={classes.tableHead}
                                align="center"
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    wordBreak: "keep-all",
                                  }}
                                >
                                  <b>{t("Linkage standard")}</b>
                                </div>
                              </TableCell>
                              <TableCell
                                className={classes.tableHead}
                                style={{ wordBreak: "keep-all" }}
                                key="columnName"
                                align="center"
                              >
                                <b>{t("Column name")}</b>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mainConnector.datacolumns.map((row, idx) => {
                              return (
                                <TableRow
                                  className={classes.tableRow}
                                  hover
                                  tabIndex={-1}
                                  key={row.columnName}
                                  style={{
                                    background:
                                      idx % 2 === 0
                                        ? "rgba(23, 27, 45, 0.5)"
                                        : "rgba(128, 128, 128, 0.1)",
                                  }}
                                >
                                  <TableCell
                                    align="center"
                                    onClick={() => onCheckedValueAlarm(row[0])}
                                  >
                                    <Checkbox
                                      disabled={
                                        projects.project.status !== 0 ||
                                        (joinInfo &&
                                          joinInfo[subConnector.id] &&
                                          joinInfo[subConnector.id][
                                            "mainConnector"
                                          ][row.id]) ===
                                          projects.project
                                            .valueForPredictColumnId ||
                                        projects.project.statusText === "중단"
                                      }
                                      checked={
                                        joinInfo &&
                                        joinInfo[subConnector.id] &&
                                        joinInfo[subConnector.id][
                                          "mainConnector"
                                        ] &&
                                        joinInfo[subConnector.id][
                                          "mainConnector"
                                        ][row.id]
                                      }
                                      onClick={() =>
                                        onClickjoinInfoValueValue(
                                          subConnector.id,
                                          "mainConnector",
                                          row.id
                                        )
                                      }
                                      className="mainConnectorCheckbox"
                                    />
                                  </TableCell>
                                  <TableCell
                                    key={row.columnName + idx}
                                    align="center"
                                  >
                                    <div style={{ whiteSpace: "nowrap" }}>
                                      {row.columnName}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </GridItem>
                    <GridItem xs={6} style={{ marginTop: "20px" }}>
                      <div style={{ textAlign: "center", margin: "10px" }}>
                        {subConnector.dataconnectorName}
                      </div>
                      <div className={classes.tableWrapper}>
                        <Table
                          stickyheader="true"
                          className={classes.table}
                          aria-label="sticky table"
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell
                                className={classes.tableHead}
                                align="center"
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    wordBreak: "keep-all",
                                  }}
                                >
                                  <b>{t("Linkage standard")}</b>
                                </div>
                              </TableCell>
                              <TableCell
                                className={classes.tableHead}
                                style={{ wordBreak: "keep-all" }}
                                key="columnName"
                                align="center"
                              >
                                <b>{t("Column name")}</b>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {subConnector.datacolumns.map((row, idx) => (
                              <TableRow
                                className={classes.tableRow}
                                hover
                                tabIndex={-1}
                                key={row.columnName}
                                style={{
                                  background:
                                    idx % 2 === 0
                                      ? "rgba(23, 27, 45, 0.5)"
                                      : "rgba(128, 128, 128, 0.1)",
                                }}
                              >
                                <TableCell
                                  align="center"
                                  onClick={() =>
                                    onCheckedValueAlarm(
                                      joinInfo &&
                                        joinInfo[subConnector.id] &&
                                        joinInfo[subConnector.id][
                                          "subConnector"
                                        ][row.id]
                                    )
                                  }
                                >
                                  <Checkbox
                                    disabled={
                                      projects.project.status !== 0 ||
                                      (joinInfo &&
                                        joinInfo[subConnector.id] &&
                                        joinInfo[subConnector.id][
                                          "subConnector"
                                        ][row.id]) ===
                                        projects.project.valueForPredict ||
                                      projects.project.statusText === "중단"
                                    }
                                    checked={
                                      joinInfo &&
                                      joinInfo[subConnector.id] &&
                                      joinInfo[subConnector.id]["subConnector"][
                                        row.id
                                      ]
                                    }
                                    onClick={() =>
                                      onClickjoinInfoValueValue(
                                        subConnector.id,
                                        "subConnector",
                                        row.id
                                      )
                                    }
                                    className="subConnectorCheckbox"
                                  />
                                </TableCell>
                                <TableCell
                                  key={row.columnName + idx}
                                  align="center"
                                >
                                  <div style={{ whiteSpace: "nowrap" }}>
                                    {row.columnName}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </GridItem>
                  </>
                )
            )}
            {isModelPageAccessible && (
              <GridItem xs={12}>
                <ModelTable
                  category="process"
                  csv={datacolumns}
                  trainingColumnInfo={trainingColumnInfo}
                  onSetColabOpen={onSetColabOpen}
                  history={props.history}
                  price={price}
                  isAnyModelFinished={isAnyModelFinished}
                  isVerify={isVerify}
                  selectedPage={selectedPage}
                />
              </GridItem>
            )}
            {selectedPage === "detail" && <Detail datacolumns={datacolumns} />}
            {selectedPage === "analytics" && (
              <Analytics
                valueForPredictName={valueForPredictName}
                csv={datacolumns}
                trainingColumnInfo={trainingColumnInfo}
                history={props.history}
              />
            )}
          </GridContainer>
          {/* </Container>
          </GridContainer> */}
          <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={isTooltipModalOpen}
            onClose={closeTooltipModalOpen}
            className={classes.modalContainer}
          >
            <Tooltip
              tooltipCategory={tooltipCategory}
              closeTooltipModalOpen={closeTooltipModalOpen}
            />
          </Modal>
          <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={colabModalOpen}
            onClose={onCloseColabModal}
            className={classes.modalContainer}
          >
            <div className={classes.modalContent}>
              <h5>
                <b>{t("How to use the generated code")}</b>
              </h5>
              <div style={{ padding: 12 }}>
                <div>
                  1.{" "}
                  {IS_ENTERPRISE ? (
                    t("Turn on Jupyter with custom training.")
                  ) : (
                    <>
                      <a
                        href="https://colab.research.google.com/"
                        target="_blank"
                      >
                        {t("Colab")}
                      </a>{" "}
                      {t("or launch Jupyter.")}
                    </>
                  )}
                </div>
                <div>2. {t("Copy the code.")}</div>
                <div>3. {t("Paste the copied code and run it.")}</div>
                <div>
                  4.{" "}
                  {t(
                    "After completion, you can view the results on the current page."
                  )}{" "}
                  <br />{" "}
                  <span style={{ fontSize: 14 }}>
                    (
                    {t(
                      "If the result does not come out, please click Refresh."
                    )}
                    )
                  </span>
                </div>
                <br />
                <div>
                  <b className={classes.subHighlightText}>
                    *{" "}
                    {t(
                      "Please note that after installing the library, press the 'restart runtime' button and run it again otherwise you may get an error."
                    )}
                  </b>
                </div>
                <br />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <h5 style={{ marginBottom: 0 }}>CODE</h5>
                <div className={classes.alignRight}>
                  {colabCode && (
                    <Button
                      id="copy_colabcode_btn"
                      shape="greenContained"
                      onClick={onCopyColabCode}
                    >
                      {t("Copy")}
                    </Button>
                  )}
                  <MuiTooltip title={t("Refresh")} placement="top">
                    <IconButton
                      color="primary"
                      aria-label="refresh"
                      component="span"
                      onClick={(e) => {
                        onSetColabOpen(e);
                      }}
                      size="small"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </MuiTooltip>
                </div>
              </div>
              <div>
                {!colabCode || isGetColabCodeLoading ? (
                  <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    height="300px"
                    direction="column"
                    style={{
                      background: currentThemeColor.surface1,
                    }}
                  >
                    <CircularProgress
                      size={40}
                      color="inherit"
                      sx={{ mb: 2, color: "var(--secondary1)" }}
                    />
                    <div style={{ fontSize: 14, textAlign: "center" }}>
                      {t("Please wait a moment.")}
                    </div>
                  </Grid>
                ) : (
                  <textarea
                    style={{
                      background: currentThemeColor.surface1,
                      width: "100%",
                      height: "300px",
                      fontSize: 14,
                      padding: "0 16px",
                    }}
                    readOnly
                    id="colabCode"
                  >
                    {colabCode}
                  </textarea>
                )}
              </div>
            </div>
          </Modal>

          <LiscenseRegisterModal />

          {/* <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={isOpenWarningModal}
            onClose={closeWarningModal}
            className={classes.modalContainer}
          >
            <div className={classes.modalContent}>
              {warningMethod === "object_detection" ? (
                <GridContainer>
                  <GridItem xs={12}>
                    <div style={{ margin: "10px 0 40px 0" }}>
                      <div>
                        {t(
                          "물체인식은 GPU기반으로 진행되기 때문에 Basic 플랜으로는 이용불가합니다."
                        )}
                      </div>
                      <div>
                        {t(
                          "계속 진행하고 싶다면 이용플랜을 업그레이드 해주세요."
                        )}
                      </div>
                      <div>
                        {t(
                          "물체인식에 대해 잘 모르신다면 샘플데이터로 이용해보실수 있습니다."
                        )}
                      </div>
                    </div>
                  </GridItem>
                  <GridItem xs={4}>
                    <Button
                      className={classes.modalButton}
                      onClick={closeWarningModal}
                    >
                      {t("Cancel")}
                    </Button>
                  </GridItem>
                  <GridItem xs={4}>
                    <Button
                      className={classes.modalButton}
                      onClick={() => {
                        props.history.push("/admin/setting/usageplan");
                      }}
                    >
                      {t("Go to Plan")}
                    </Button>
                  </GridItem>
                  <GridItem xs={4}>
                    <Button
                      className={classes.modalButton}
                      onClick={() => {
                        props.history.push("/admin/sample/116");
                      }}
                    >
                      {t("Use sample")}
                    </Button>
                  </GridItem>
                </GridContainer>
              ) : (
                <GridContainer>
                  <GridItem xs={12}>
                    <div style={{ margin: "10px 0 40px 0" }}>
                      <div>
                        {t(
                          "이미지 생성(GAN)은 GPU기반으로 진행되기 때문에 Basic 플랜으로는 이용불가합니다."
                        )}
                      </div>
                      <div>
                        {t(
                          "계속 진행하고 싶다면 이용플랜을 업그레이드 해주세요."
                        )}
                      </div>
                      <div>
                        {t(
                          "이미지 생성(GAN)에 대해 잘 모르신다면 샘플데이터로 이용해보실수 있습니다."
                        )}
                      </div>
                    </div>
                  </GridItem>
                  <GridItem xs={4}>
                    <Button
                      className={classes.modalButton}
                      onClick={closeWarningModal}
                    >
                      {t("Cancel")}
                    </Button>
                  </GridItem>
                  <GridItem xs={4}>
                    <Button
                      className={classes.modalButton}
                      onClick={() => {
                        props.history.push("/admin/setting/usageplan");
                      }}
                    >
                      {t("Go to Plan")}
                    </Button>
                  </GridItem>
                  <GridItem xs={4}>
                    <Button
                      className={classes.modalButton}
                      onClick={() => {
                        props.history.push("/admin/sample/128");
                      }}
                    >
                      {t("Use sample")}
                    </Button>
                  </GridItem>
                </GridContainer>
              )}
            </div>
          </Modal> */}
        </>
      )}
    </div>
  );
};

export default React.memo(Process);
