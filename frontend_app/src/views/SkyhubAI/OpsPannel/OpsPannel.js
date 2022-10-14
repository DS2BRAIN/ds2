import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as api from "../../../controller/api";
import currentTheme, { currentThemeColor } from "../../../assets/jss/custom";
import {
  getOpsProjectRequestAction,
  getProjectRequestAction,
  putProjectServiceAppRequestActionWithoutLoading,
} from "../../../redux/reducers/projects";
import { getModelRequestAction } from "../../../redux/reducers/models";
import { IS_ENTERPRISE } from "variables/common";
import { getCardRequestAction } from "../../../redux/reducers/user";
import {
  askModalRequestAction,
  openSuccessSnackbarRequestAction,
  openErrorSnackbarRequestAction,
} from "../../../redux/reducers/messages";
import Button from "components/CustomButtons/Button";
import GridContainer from "../../../components/Grid/GridContainer";
import GridItem from "../../../components/Grid/GridItem";
import SalesModal from "../SalesModal";
import ModalPage from "../../../components/PredictModal/ModalPage";

//@material-ui
import { makeStyles } from "@material-ui/styles";
import CachedIcon from "@material-ui/icons/Cached";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import Modal from "@material-ui/core/Modal";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TextField from "@material-ui/core/TextField";
import CloseIcon from "@material-ui/icons/Close";
import CircularProgress from "@mui/material/CircularProgress";
import { ChromePicker } from "react-color";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { openChat } from "components/Function/globalFunc";
import TritonConfig from "./Triton/TritonConfig";

const useStyle = makeStyles({
  groupRow: {
    "&:hover": {
      backgroundColor: "#000000",
    },
  },
  sideButton: {
    width: "90%",
    fontSize: "16px",
    height: "40px",
  },
  tableBody: {
    overflow: "scorll",
  },
  bottomServer: {
    borderRight: "1px solid #FFFFFF",
    height: "300px",
  },
  groupModal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalText: {
    height: "20px",
    fontSize: "15px",
    color: "#FFFFFF",
  },
  serverModal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteModalButton: {
    border: "1px solid blue",
    background: "gray",
  },
  renameModalButton: {
    border: "1px solid blue",
    background: "gray",
  },
  deleteModalText: {
    with: "20px",
    color: "#FFFFFF",
    fontSize: "15px",
  },
  renameModalText: {
    with: "20px",
    color: "#FFFFFF",
    fontSize: "15px",
  },
});

const OpsPannel = (props) => {
  const historyRef = useRef();
  const newClasses = useStyle();
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
  let apiRef = useRef();
  const graphIframeRef = useRef();
  const path = window.location.pathname;
  let interval;
  const { t } = useTranslation();
  const classes = currentTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [opsServerGroups, setOpsServerGroups] = useState([]);
  const [inferenceCount, setInferenceCount] = useState(0);
  const [clickedServer, setClickedServer] = useState(null);
  const [statistic, setStatistic] = useState(null);
  const [isPredictModalOpen, setIsPredictModalOpen] = useState(false);
  const [isServiceAppModalOpen, setIsServiceAppModalOpen] = useState(false);
  const [resultJson, setResultJson] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [chosenItem, setChosenItem] = useState(null);
  const [chosenModel, setChosenModel] = useState(0);
  const [trainingColumnInfo, setTrainingColumnInfo] = useState({});
  const [csvDict, setCsvDict] = useState({});
  const [isChangeSizeModalOpen, setIsChangeSizeModalOpen] = useState(false);
  const [seletedServerGroup, setSeletedServerGroup] = useState({});
  const [startServerSizeToChange, setStartServerSizeToChange] = useState(1);
  const [minServerSizeToChange, setMinServerSizeToChange] = useState(1);
  const [maxServerSizeToChange, setMaxServerSizeToChange] = useState(1);
  const [isChangeSizeLoading, setIsChangeSizeLoading] = useState(false);
  const [isDeleteServerGroupLoading, setIsDeleteServerGroupLoading] = useState(
    false
  );
  const [serverSizeSubmitLock, setServerSizeSubmitLock] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);

  const [
    isOpenDeleteServerGroupModal,
    setIsOpenDeleteServerGroupModal,
  ] = useState(false); //삭제 모달창 switch
  const [projectName, setProjectName] = useState(null);
  const [deleteText, setDeleteText] = useState(""); //"삭제" 입력값 확인하는 변수
  const [deleteTextError, setDeleteTextError] = useState(false); //삭제시 오류 switch
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedOpsGroupIndex, setSelectedOpsGroupIndex] = useState(0);
  const [selectedInstanceIndex, setSelectedInstanceIndex] = useState(0);
  const [renameServerModal, setRenameServerModal] = useState(false); //프로젝트명 변경 모달 switch
  const [renameText, setRenameText] = useState(""); //새로운 프로젝트명 입력 변수

  const [deleteProjectModal, setDeleteProjectModal] = useState(false); //삭제 모달창 switch
  const [deleteProjectText, setDeleteProjectText] = useState(""); //"삭제" 입력값 확인하는 변수
  const [deleteProjectTextError, setDeleteProjectTextError] = useState(false); //삭제시 오류 switch
  const [isDeleteProjectLoading, setIsDeleteProjectLoading] = useState(false);
  const [groupModal, setGroupModal] = useState(false);
  const [isLoadingStatistic, setIsLoadingStatistic] = useState(true);
  const [groupCountLimit, setGroupCountLimit] = useState(4); //인스턴스 생성 가능 개수(n+1) 까지 가능
  const [isRenameLoading, setIsRenameLoading] = useState(false);
  const [isDisabledButton, setIsDisabledButton] = useState(true);
  const [timeTick, setTimeTick] = useState(3);
  const [opsRefresh, setOpsRefresh] = useState(0);
  const [existProject, setExistProject] = useState(0);
  const [asyncRefresh, setAsyncRefresh] = useState(0);
  const imgRef = useRef();
  const [currentProjects, setCurrentProjects] = useState(projects.opsProject);
  const [isReloadLoading, setIsReloadLoading] = useState(true);
  const [isFullSizeStatisticModal, setIsFullSizeStatisticModal] = useState(
    false
  );
  const [colorPickerModal, setColorPickerModal] = useState(false);
  const [jsonEditMode, setJsonEditMode] = useState(false);
  const [isRefreshAbuse, setIsRefreshAbuse] = useState(false);
  const [isServerControlModal, setIsServerControlModal] = useState(false);
  const [selectedServerGroup, setSelectedServerGroup] = useState(null);
  const [timeTickAsync, setTimeTickAsync] = useState(0);
  const [timeTickAsyncCount, setTimeTickAsyncCount] = useState(0);

  var monitoring_url = api.frontendurl;
  if (monitoring_url[monitoring_url.length - 1] === "/") {
    monitoring_url = monitoring_url.slice(0, monitoring_url.length - 1);
  }
  monitoring_url = monitoring_url.split(":13000")[0] + ":19999";
  monitoring_url = monitoring_url.replace("https", "http");

  const onLoadStatistic = () => {
    setIsLoadingStatistic(false);
  };
  const onChangeBackgroundColor = (obj) => {
    // setBackgroundColor(obj.color);
    if (obj.hex) {
      setBackgroundColor(obj.hex);
    }
  };

  const deleteProjectModalClose = () => {
    setDeleteProjectModal(false);
    setDeleteProjectTextError(false);
    setDeleteProjectText("");
  };

  // UTC 비교 함수 (대표님 .ver)
  // const isEnableToChange=(time)=>{
  //   let updatedAt= new Date(time);
  //   let nowTime= new Date(new Date().toUTCString().slice(0, -4));
  //   updatedAt.setTime(updatedAt.getTime() + 10);
  //   return nowTime > updatedAt;
  // }

  // UTC 비교 함수 (성락현 .ver)
  const isEnableToChange = (time, option = null) => {
    let updatedAt = new Date(time).getTime() / 60000;
    let nowTime = new Date();
    nowTime =
      new Date(
        nowTime.getTime() + nowTime.getTimezoneOffset() * 60000
      ).getTime() / 60000;
    if (option == null) return nowTime - updatedAt > 10;
    else return 10 - Math.floor(nowTime - updatedAt);
  };

  // useEffect(() => {
  //   console.log("1111")
  //   if(existProject!==-1 && projects.isLoading==false){
  //     console.log("2")
  //     const pathArr = path.split("/");
  //     const id = pathArr[pathArr.length - 1];
  //     dispatch(getOpsProjectRequestAction(id));
  //     const state = props.history.location.state;
  //   }
  //   // if (projects.opsProject !== undefined) {
  //   //   if (props.match.params.id / 1 !== projects?.opsProject?.id) {
  //   //     window.location.reload();
  //   //   } else {
  //   //     window.location.reload();
  //   //     // setExistProject(-1);
  //   //     // setIsDisabledButton(false);
  //   //     // setTimeTick(60);
  //   //     // getSyncTaskData();
  //   //   }
  //   // }
  // }, [existProject]);

  useEffect(() => {
    if (graphIframeRef?.current) graphIframeRef.current.style.zIndex = "0";
  });

  //비동기 처라 useEffect
  useEffect(() => {
    console.log(timeTickAsync);
    if (timeTickAsync == 0) {
      let timer = setTimeout(() => {
        setTimeTickAsync(1);
      }, 15000);
    } else if (timeTickAsync == 1) {
      setTimeTickAsync(0);
      setTimeTickAsyncCount(timeTickAsyncCount + 1);
    }
  }, [timeTickAsync]);

  useEffect(() => {
    //timeTickAsync 돌때마다 실행
    if (
      existProject == -1 &&
      isPredictModalOpen == false &&
      renameServerModal == false &&
      projects?.opsProject !== undefined &&
      props?.match?.params?.id == projects?.opsProject?.id
    ) {
      if (timeTickAsyncCount <= 20) {
        getAsyncTaskData();
      } else if (timeTickAsyncCount <= 240) {
        if (timeTickAsyncCount % 4 == 0) {
          getAsyncTaskData();
        }
      } else {
        if (timeTickAsyncCount % 120 == 0) {
          getAsyncTaskData();
        }
      }
    }
  }, [timeTickAsyncCount]);

  useEffect(() => {
    if (!IS_ENTERPRISE) {
      if (user.cardInfo == null) {
        dispatch(getCardRequestAction());
      } else if (user.cardInfo == null || user.cardInfo.cardName == null) {
        props.history.push(`/admin/setting/payment/?message=need`);
        return;
      }
    }
  }, [user.cardInfo]);

  useEffect(() => {
    if (
      projects?.opsProject?.id == undefined ||
      projects?.opsProject?.id != props.match.params.id
    )
      setIsReloadLoading(false);
  }, []);

  useEffect(() => {
    if (!IS_ENTERPRISE) {
      if (opsServerGroups.length !== 0) {
        let breaker = false;
        for (let i = 0; i < opsServerGroups.length; i++) {
          if (breaker === true) break;
          for (let k = 0; k < opsServerGroups[i].instances?.length; k++) {
            if (opsServerGroups[i]?.instances[k].State.Name == "running") {
              breaker = true;
              break;
            }
          }
        }
        if (breaker == true) setIsDisabledButton(false);
        else setIsDisabledButton(true);
      } else {
        setIsDisabledButton(true);
      }
    } else {
      setIsDisabledButton(false);
    }
  }, [opsServerGroups]);

  useEffect(() => {
    setProjectName(projects?.opsProject?.projectName);
  }, [projects]);

  //////새로고침 로직

  useEffect(() => {
    if (projects?.opsProject?.id / 1 == props.match.params.id / 1) {
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (
      existProject !== -1 &&
      projects.isOpsProjectLoading == false &&
      projects?.opsProject?.id !== props.match.params.id / 1
    ) {
      const pathArr = path.split("/");
      const id = pathArr[pathArr.length - 1];
      dispatch(getOpsProjectRequestAction(props.match.params.id / 1));
      //dispatch(getOpsProjectRequestAction(id));
      const state = props.history.location.state;
    }
  }, [path, opsRefresh, existProject]);

  useEffect(() => {
    if (projects.opsProject) {
      dispatch(getProjectRequestAction(projects.opsProject.project));
      dispatch(getModelRequestAction(projects.opsProject.model.id));
      if (projects.opsProject.background)
        setBackgroundColor(projects.opsProject.background);
      if (projects.opsProject.resultJson)
        setResultJson(projects.opsProject.resultJson);
    }
  }, [opsServerGroups]);

  // useEffect(() => {
  //   if (projects?.opsProject?.opsServerGroups) {
  //     setIsLoading(false);
  //     setDeleteLoading(false);
  //   }
  // }, [projects?.opsProject?.opsServerGroups]);

  useEffect(() => {
    if (projects.opsProject !== undefined) {
      setIsLoading(false);
      setDeleteLoading(false);
    }
  }, [projects.isLoading]);

  //////새로고침 로직

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsPredictModalOpen(false);
      if (existProject == -1) {
        getAsyncTaskData();
      }
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (!IS_ENTERPRISE) {
      if (projects.opsProject && projects.opsProject.opsServerGroups) {
        let opsServerGroupRaw = [];
        projects.opsProject.opsServerGroups.forEach(
          (opsServerGroup, indexOpsServerGroup) => {
            let instancesRaw = [];
            if (opsServerGroup.instances !== null) {
              opsServerGroup.instances.forEach((instance, index) => {
                instancesRaw.push(instance);
              });
            }
            opsServerGroup.instances = instancesRaw;
            opsServerGroupRaw.push(opsServerGroup);
          }
        );
        setOpsServerGroups(opsServerGroupRaw);
        if (projects.opsProject.inferenceCount) {
          setInferenceCount(projects.opsProject.inferenceCount);
        }
      }
    }
    let datacolumnsRaw = [];
    projects.opsProject?.dataconnectorsList &&
      projects.opsProject.dataconnectorsList.map((dataconnector) => {
        dataconnector.datacolumns &&
          dataconnector.datacolumns.map((datacolumn) => {
            datacolumn.dataconnectorName = dataconnector.dataconnectorName;
            datacolumnsRaw.push(datacolumn);
          });
      });
    if (
      !(datacolumnsRaw && datacolumnsRaw.length > 0) &&
      projects.opsProject?.fileStructure
    ) {
      datacolumnsRaw = JSON.parse(projects.opsProject.fileStructure);
    }
    setCsvDict(datacolumnsRaw);
    if (projects.opsProject?.trainingColumnInfo) {
      var trainingColumnInfoRaw = {};
      Object.keys(projects.opsProject.trainingColumnInfo).map((columnInfo) => {
        if (projects.opsProject.trainingColumnInfo[columnInfo]) {
          trainingColumnInfoRaw[columnInfo] = true;
        }
      });
      setTrainingColumnInfo(trainingColumnInfoRaw);
    } else if (projects.opsProject?.fileStructure) {
      var trainingColumnInfoRaw = {};
      JSON.parse(projects.opsProject?.fileStructure).map((columnInfo) => {
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
    // let modelsArr = [];
    // projects.opsProject.models.forEach((model) => {
    //     let tempModel = model;
    //     tempModel.asyncIndex = idx;
    //     modelsArr.push(tempModel);
    // })
  }, [projects.opsProject]);

  useEffect(() => {
    if (opsServerGroups) {
      if (
        opsServerGroups[selectedOpsGroupIndex] !== undefined &&
        opsServerGroups[selectedOpsGroupIndex]?.id !== undefined &&
        opsServerGroups[selectedOpsGroupIndex]?.instances[selectedInstanceIndex]
          ?.InstanceId !== undefined
      ) {
        if (!opsServerGroups) setIsLoadingStatistic(true);
        api
          .getOpsServerStatistic(
            opsServerGroups[selectedOpsGroupIndex]?.id,
            opsServerGroups[selectedOpsGroupIndex]?.instances[
              selectedInstanceIndex
            ]?.InstanceId
          )
          .then((response) => {
            return new Blob([response.data]);
          })
          .then((blob) => {
            const url = window.URL.createObjectURL(new Blob([blob]));
            setStatistic(url);
          });
      }
    }
  }, [opsServerGroups, selectedOpsGroupIndex, selectedInstanceIndex]);

  const getAsyncTaskData = () => {
    if (projects?.opsProject?.id == props.match.params.id / 1) {
      api.getOpsProject(props.match.params.id).then((res) => {
        //요청 끝나기전에 더 보내지않기
        setProjectName(res.data.projectName);
        setInferenceCount(res.data.inferenceCount);
        setOpsServerGroups(res.data.opsServerGroups);
        setExistProject(-1);
      });
    }
  };

  const getSyncTaskData = () => {
    api.getOpsProject(props.match.params.id).then((res) => {
      setInferenceCount(res.data.inferenceCount);
      setOpsServerGroups(res.data.opsServerGroups);
      setProjectName(res.data.projectName);
      setIsChangeSizeLoading(false);
      setIsChangeSizeModalOpen(false);
    });
  };

  useEffect(() => {
    if (existProject == -1) {
      setInferenceCount(projects?.opsProject?.inferenceCount);
    }
  }, [existProject]);

  useEffect(() => {
    if (
      existProject == -1 &&
      isPredictModalOpen == false &&
      renameServerModal == false &&
      projects?.opsProject !== undefined &&
      props?.match?.params?.id == projects?.opsProject?.id
    ) {
      getAsyncTaskData();
    }
  }, [
    // isPredictModalOpen,
    // opsRefresh,
    // asyncRefresh,
    // renameServerModal,
    projects?.opsProject?.id,
  ]);

  useEffect(() => {
    if (projects?.isOpsProjectSuccess == true) {
      setExistProject(-1);
    }
  }, [projects?.isOpsProjectLoading]);

  const reloadButton = (
    <CachedIcon
      style={
        !isRefreshAbuse
          ? {
              marginLeft: "4px",
              width: "1.7rem",
              height: "1.7rem",
              padding: ".15rem",
              border: "1.5px solid var(--primary2)",
              borderRadius: "1.5rem",
              fill: "var(--primary2)",
              cursor: "pointer",
            }
          : {
              marginLeft: "4px",
              width: "1.7rem",
              height: "1.7rem",
              padding: ".15rem",
              border: "1.5px solid gray",
              borderRadius: "1.5rem",
              fill: "gray",
              cursor: "default",
            }
      }
      onClick={() => {
        if (!isRefreshAbuse) {
          setIsRefreshAbuse(true);
          getAsyncTaskData();
          setTimeout(() => {
            setIsRefreshAbuse(false);
          }, 2000);
        }
      }}
    />
  );

  const goToLabelProject = () => {
    props.history.push(`/admin/labelling/${projects.opsProject?.labelproject}`);
  };

  const goToSales = (id) => {
    setIsSalesModalOpen(true);
  };

  const closeModal = () => {
    dispatch(askModalRequestAction());
  };

  const closeColorPickerModal = () => {
    setColorPickerModal(false);
    onSaveServiceAppParameter();
  };

  const openPredictModal = () => {
    dispatch(getModelRequestAction(projects.opsProject?.model.id));
    setIsPredictModalOpen(true);
  };

  const openServiceAppModal = () => {
    setIsServiceAppModalOpen(true);
  };

  const serviceAppModalActionClose = () => {
    setIsServiceAppModalOpen(false);
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

  const onSaveServiceAppParameter = () => {
    dispatch(
      putProjectServiceAppRequestActionWithoutLoading({
        projectInfo: { background: backgroundColor, resultJson: resultJson },
        projectId: projects.project.id,
      })
    );
  };

  const addRegion = () => {
    if (
      opsServerGroups.length <
      (!IS_ENTERPRISE ? groupCountLimit : 9999999999999)
    ) {
      const regions = [];
      opsServerGroups.map((group) => {
        if (regions.indexOf(group.region) == -1) regions.push(group.region);
      });
      props.history.push(
        `/admin/newskyhubai/${
          projects.opsProject?.id
        }/?regions=${JSON.stringify(regions)}`
      );
    } else {
      dispatch(
        openSuccessSnackbarRequestAction(
          t("Additional servers can be added after contacting the sales team.")
        )
      );
      openChat();
    }
  };
  const openChangeServerSizeModal = (opsServerGroup) => {
    setSeletedServerGroup(opsServerGroup);
    setIsChangeSizeModalOpen(true);
    setStartServerSizeToChange(opsServerGroup.startServerSize);
    setMinServerSizeToChange(opsServerGroup.minServerSize);
    setMaxServerSizeToChange(opsServerGroup.maxServerSize);
  };

  const changeSize = (quickMode = null, serverId = null) => {
    setIsChangeSizeLoading(true);
    api
      .editOpsServerGroup(serverId == null ? seletedServerGroup.id : serverId, {
        startServerSize:
          quickMode == null ? startServerSizeToChange : quickMode == 0 ? 0 : 1,
        minServerSize:
          quickMode == null ? minServerSizeToChange : quickMode == 0 ? 0 : 1,
        maxServerSize:
          quickMode == null ? maxServerSizeToChange : quickMode == 0 ? 0 : 1,
      })
      .then(async (res) => {
        if (res.data) {
          dispatch(
            openSuccessSnackbarRequestAction(
              t(
                "Server resizing is in progress. Changes may take a while to complete."
              )
            )
          );
          getSyncTaskData();
        }
      })
      .catch((err) => {
        if (!IS_ENTERPRISE && err.response.data.result === "fail") {
          props.history.push(`/admin/setting/payment/?cardRequest=true`);
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t("Failed to resize server. Please try again later.")
            )
          );
          setIsChangeSizeLoading(false);
          setIsChangeSizeModalOpen(false);
        }
      })
      .finally(() => {
        setIsServerControlModal(false);
      });
  };

  const closeDeleteServerGroupModal = () => {
    setIsOpenDeleteServerGroupModal(false);
    setDeleteText("");
  };

  const shutdownOpsServer = () => {
    setIsDeleteServerGroupLoading(true);
    api
      .removeOpsServerGroup(opsServerGroups[selectedOpsGroupIndex].id)
      .then((res) => {
        if (res.data) {
          window.location.reload();
        }
      })
      .catch((err) => {
        dispatch(
          openErrorSnackbarRequestAction(
            t("Failed to resize server. Please try again later.")
          )
        );
        // setIsDeleteServerGroupLoading(false);
      });
  };

  const tabActiveStyle = {
    width: "200px",
    color: "#1BC6B4",
    borderBottom: "2px solid #1BC6B4",
    margin: "1rem 0 1rem 0",
    padding: ".3rem",
    wordBreak: "keep-all",
  };
  const tabDeactiveStyle = {
    width: "200px",
    color: "#D0D0D0",
    borderBottom: "2px solid #D0D0D0",
    margin: "1rem 0 1rem 0",
    padding: ".3rem",
    wordBreak: "keep-all",
  };

  const openCloudTab = () => {
    return (
      <div
        id="openCloudTab"
        style={tabActiveStyle}
        className={classes.selectedListObject}
      >
        {t("Cloud")}
      </div>
    );
  };

  const openEdgeTab = () => {
    return (
      <div
        id="openEdgeTab"
        style={tabDeactiveStyle}
        className={classes.listObject}
        onClick={() => {
          dispatch(
            openSuccessSnackbarRequestAction(
              t(
                "Connection to edge devices is available after inquiring from the sales team"
              )
            )
          );
          openChat();
        }}
      >
        {t("Edge")}
      </div>
    );
  };

  const openSensorTab = () => {
    return (
      <div
        id="openSensorTab"
        style={tabDeactiveStyle}
        className={classes.listObject}
        onClick={() => {
          dispatch(
            openSuccessSnackbarRequestAction(
              t(
                "Connection with the sensor device is available after contacting the sales team"
              )
            )
          );
          openChat();
        }}
      >
        {t("Sensor")}
      </div>
    );
  };

  const onCopyServiceAppLink = () => {
    dispatch(openSuccessSnackbarRequestAction(t("Link copied")));
  };

  // return isLoading || models.isLoading ? (
  return isReloadLoading ||
    projects?.opsProject == undefined ||
    projects?.opsProject?.id != props?.match?.params?.id ||
    existProject !== -1 ? (
    <div
      style={{
        width: "100%",
        height: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </div>
  ) : (
    <>
      <div>
        <Grid container justifyContent="center" alignItems="center">
          <Grid
            container
            item
            xs={12}
            justifyContent="center"
            alignItems="center"
          >
            <Grid
              container
              item
              xs={12}
              justifyContent="flex-start"
              alignItems="center"
              style={{ padding: "28px 0" }}
            >
              <div
                style={{
                  padding: "2px",
                  borderRadius: "4px",
                  paddingRight: "5px",
                  paddingLeft: "5px",
                  fontSize: 20,
                }}
              >
                {projects !== undefined && `${projectName}`}
              </div>

              <Button
                shape="greenOutlined"
                sx={{ ml: "auto" }}
                onClick={() => setRenameServerModal(true)}
              >
                {t("Change")}
              </Button>

              <Button
                id="skyhubDelete"
                shape="redOutlined"
                sx={{ mx: 1.5 }}
                onClick={() => {
                  if (
                    IS_ENTERPRISE ||
                    isEnableToChange(projects.project.created_at)
                  )
                    setDeleteProjectModal(true);
                  else {
                    dispatch(
                      openErrorSnackbarRequestAction(
                        `${t(
                          "Deleting a project is possible after a certain period of time has passed since creation."
                        )}
                        `
                        // ${isEnableToChange(projects.project.created_at, true)}
                        // ${t("minutes left")}
                      )
                    );
                  }
                }}
              >
                {t("Delete Project")}
              </Button>
              <Tooltip
                title={
                  <text style={{ fontSize: "12px" }}>
                    {t("refresh project")}
                  </text>
                }
                placement="top"
              >
                {reloadButton}
              </Tooltip>
              <Modal
                className={newClasses.serverModal}
                open={deleteProjectModal}
                //onClose={deleteProjectModalClose}
              >
                <div
                  style={{
                    width: "400px",
                    height: "200px",
                    border: "1px solid #373738",
                    borderRadius: "3px",
                    background: "#212121",
                  }}
                >
                  {isDeleteProjectLoading == false ? (
                    <Grid
                      container
                      item
                      xs={12}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Grid
                        container
                        item
                        xs={11}
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        style={{
                          fontSize: "20px",
                          color: "#FFFFFF",
                          marginTop: "10px",
                        }}
                      >
                        {t("Are you sure you want to delete the project?")}
                      </Grid>
                      {deleteProjectTextError == true && (
                        <Grid
                          container
                          item
                          xs={11}
                          justifyContent="flex-start"
                          alignItems="flex-start"
                          style={{
                            fontSize: "15px",
                            color: "red",
                            marginTop: "2px",
                          }}
                        >
                          {t("Enter 'Delete' correctly.")}
                        </Grid>
                      )}
                      <Grid
                        container
                        item
                        xs={11}
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        style={{
                          fontSize: "20px",
                          color: "#FFFFFF",
                          marginTop: "8px",
                        }}
                      >
                        <TextField
                          fullWidth={true}
                          onChange={(e) => setDeleteProjectText(e.target.value)}
                          inputProps={{
                            className: newClasses.deleteModalText,
                          }}
                          variant="outlined"
                          placeholder={t("Enter 'Delete' correctly.")}
                        />
                      </Grid>
                      <Grid
                        container
                        item
                        xs={11}
                        justifyContent="flex-start"
                        alignItems="flex-start"
                      >
                        <div style={{ wordBreak: "break-all" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              className={`${classes.modelTab}
                              analyticsBtn
                              ${classes.modelTabHighlightButton}`}
                              style={{ textAlign: "center" }}
                              onClick={() => {
                                if (deleteProjectText !== "Delete") {
                                  setDeleteProjectTextError(true);
                                } else {
                                  setDeleteProjectTextError(false);
                                  setIsDeleteProjectLoading(true);
                                  api
                                    .deleteOpsProjects([props.match.params.id])
                                    .then((res) => {
                                      if (res?.data?.failList.length == 0) {
                                        dispatch(
                                          openSuccessSnackbarRequestAction(
                                            t(
                                              "The Skyhub AI project has been deleted."
                                            )
                                          )
                                        );
                                        props.history.push("/admin/skyhubai/");
                                      } else {
                                        setIsDeleteProjectLoading(false);
                                        setDeleteProjectModal(false);
                                        setDeleteProjectText("");
                                        dispatch(
                                          openErrorSnackbarRequestAction(
                                            t(
                                              "Failed to delete Skyhub AI project."
                                            )
                                          )
                                        );
                                      }
                                    })
                                    .catch((err) => {
                                      setIsDeleteProjectLoading(false);
                                      setDeleteProjectModal(false);
                                      setDeleteProjectText("");
                                      dispatch(
                                        openErrorSnackbarRequestAction(
                                          t(
                                            "Failed to delete Skyhub AI project."
                                          )
                                        )
                                      );
                                    });
                                }
                              }}
                            >
                              {t("Yes")}
                            </div>
                          </div>
                        </div>
                        <div style={{ wordBreak: "break-all" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              className={`${classes.modelTab}
                              analyticsBtn
                              ${classes.modelTabHighlightButton}`}
                              style={{ textAlign: "center" }}
                              onClick={deleteProjectModalClose}
                            >
                              {t("No")}
                            </div>
                          </div>
                        </div>
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid
                      container
                      item
                      xs={12}
                      justifyContent="center"
                      alignItems="flex-start"
                      style={{
                        backgroundColor: "#212121",
                        borderColor: "#373738",
                      }}
                    >
                      <Grid
                        container
                        item
                        xs={11}
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        style={{
                          fontSize: "20px",
                          color: "#FFFFFF",
                          marginTop: "10px",
                        }}
                      >
                        {t("Deleting project")}
                      </Grid>
                      <Grid
                        container
                        item
                        xs={12}
                        justifyContent="center"
                        alignItems="flex-start"
                      >
                        <div
                          className={classes.loading}
                          style={{ height: "150px" }}
                        >
                          <CircularProgress size={30} />
                        </div>
                      </Grid>
                    </Grid>
                  )}
                </div>
              </Modal>
            </Grid>
            <Modal
              className={newClasses.serverModal}
              open={renameServerModal}
              //onClose={renameServerModalClose}
            >
              <div
                style={{
                  width: "400px",
                  height: "150px",
                  border: "1px solid #373738",
                  borderRadius: "3px",
                  background: "#212121",
                }}
              >
                <Grid container item xs={12} justifyContent="center">
                  <Grid
                    container
                    item
                    xs={11}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    style={{ margin: "10px", color: "white" }}
                  >
                    {t("Submit Project Name")}
                  </Grid>
                  <Grid
                    container
                    item
                    xs={11}
                    justifyContent="center"
                    alignItems="flex-start"
                  >
                    <TextField
                      fullWidth={true}
                      onChange={(e) => setRenameText(e.target.value)}
                      inputProps={{ className: newClasses.renameModalText }}
                      variant="outlined"
                      placeholder={t("Enter a new project name.")}
                    />
                  </Grid>
                  <Grid
                    container
                    item
                    xs={11}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                  >
                    <div style={{ wordBreak: "break-all" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          className={
                            isRenameLoading
                              ? `${classes.modelTab}
                            analyticsBtn
                            ${classes.modelTabDisabledButton}`
                              : `${classes.modelTab}
                        analyticsBtn
                        ${classes.modelTabHighlightButton}`
                          }
                          style={{ textAlign: "center" }}
                          onClick={() => {
                            if (!isRenameLoading) {
                              setIsRenameLoading(true);
                              //이름 변경 API
                              api
                                .putOpsProject(props.match.params.id, {
                                  projectName: renameText,
                                })
                                .then((res) => {
                                  dispatch(
                                    openSuccessSnackbarRequestAction(
                                      t("The project name has been changed.")
                                    )
                                  );
                                  setProjectName(renameText);
                                  setRenameServerModal(false);
                                  setIsRenameLoading(false);
                                })
                                .catch((err) => {
                                  dispatch(
                                    openErrorSnackbarRequestAction(
                                      t("Failed to change project name.")
                                    )
                                  );
                                  setIsRenameLoading(false);
                                });
                            }
                          }}
                        >
                          {isRenameLoading === true
                            ? t("Loading")
                            : t("Submit")}
                        </div>
                      </div>
                    </div>
                    <div style={{ wordBreak: "break-all" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          disabled={isRenameLoading}
                          className={
                            isRenameLoading
                              ? `${classes.modelTab}
                            analyticsBtn
                            ${classes.modelTabDisabledButton}`
                              : `${classes.modelTab}
                        analyticsBtn
                        ${classes.modelTabHighlightButton}`
                          }
                          style={{ textAlign: "center" }}
                          onClick={() => {
                            if (!isRenameLoading) {
                              setRenameServerModal(false);
                            }
                          }}
                        >
                          {t("Cancel")}
                        </div>
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </div>
            </Modal>
          </Grid>
          <Grid
            container
            item
            xs={12}
            justifyContent="center"
            alignItems="center"
          >
            {/*상단 : 그래프, api 호출 수*/}
            <iframe
              ref={graphIframeRef}
              src={monitoring_url + "/tv.html"}
              width="100%"
              height="400"
              style={{ zIndex: 0 }}
            />
            {IS_ENTERPRISE && (
              <>
                <Grid
                  container
                  item
                  xs={9}
                  justifyContent="flex-start"
                  spacing={2}
                  alignItems="center"
                  style={IS_ENTERPRISE ? {} : { height: "300px" }}
                >
                  <div
                    style={{
                      width: "100%",
                      border: "1px solid #FFFFFF",
                      marginBottom: "20px",
                    }}
                  ></div>
                  <Grid
                    container
                    item
                    xs={4}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Button
                      className={`${newClasses.sideButton} ${classes.defaultHighlightButton}`}
                      onClick={() => {
                        var ip = api.frontendurl;
                        if (ip[ip.length - 1] === "/") {
                          ip = ip.slice(0, ip.length - 1);
                        }
                        ip = ip.split(":13000")[0] + ":19999";
                        ip = ip.replace("https", "http");
                        window.open(ip);
                      }}
                    >
                      {t("Monitoring")}
                    </Button>
                  </Grid>
                  <Grid
                    container
                    item
                    xs={4}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Button
                      disabled={isDisabledButton || existProject !== -1}
                      className={
                        isDisabledButton || existProject !== -1
                          ? `${newClasses.sideButton} ${classes.defaultDisabledButton}`
                          : `${newClasses.sideButton} ${classes.defaultHighlightButton}`
                      }
                      onClick={() => openPredictModal()}
                    >
                      {t("Predict")}
                    </Button>
                  </Grid>
                  <Grid
                    container
                    item
                    xs={4}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Tooltip
                      title={t(
                        "Available after data accumulation through forecasting"
                      )}
                      placement="top"
                    >
                      <Button
                        className={
                          inferenceCount == 0 || existProject !== -1
                            ? `${newClasses.sideButton} ${classes.defaultDisabledButton}`
                            : `${newClasses.sideButton} ${classes.defaultF0F0OutlineButton}`
                        }
                        //className={`analyticsBtn ${classes.defaultF0F0OutlineButton} ${newClasses.sideButton}`}
                        onClick={() => {
                          if (inferenceCount == 0 || existProject !== -1) {
                          } else {
                            goToLabelProject();
                          }
                        }}
                      >
                        {t("Retraining Labeling")}
                      </Button>
                    </Tooltip>
                  </Grid>
                  {projects.opsProject?.algorithm?.indexOf("keras") > -1 && (
                    <Grid
                      container
                      item
                      xs={4}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <TritonConfig newClasses={newClasses} />
                    </Grid>
                  )}
                </Grid>
              </>
            )}
            {!IS_ENTERPRISE ? (
              <>
                <Grid
                  container
                  item
                  xs={9}
                  justifyContent="center"
                  alignItems="center"
                  className={classes.Grid_300}
                  style={{ height: "300px" }}
                >
                  <Grid
                    container
                    item
                    xs={12}
                    justifyContent="center"
                    alignItems="center"
                    style={
                      statistic !== null
                        ? { display: "none" }
                        : { display: "block" }
                    }
                  >
                    <div
                      className={classes.loading}
                      style={{ height: "300px" }}
                    >
                      <CircularProgress />
                    </div>
                  </Grid>
                  <Grid
                    container
                    item
                    xs={12}
                    justifyContent="center"
                    alignItems="center"
                    className={classes.Grid_300}
                    style={{ height: "300px" }}
                  >
                    <div
                      style={
                        statistic == null
                          ? { display: "none" }
                          : {
                              marginLeft: "650px",
                              marginBottom: "280px",
                              position: "absolute",
                              zIndex: "3",
                            }
                      }
                    >
                      <FullscreenIcon
                        onClick={() => {
                          setIsFullSizeStatisticModal(true);
                          // let wnd = window.open("","modal");
                          // wnd.document.write(
                          //   `<html><head><title>${t("Skyhub Ai")} ${t(
                          //     "대시보드"
                          //   )}</title></head><body><img src=${statistic} /></script></body></html>`
                          // );
                        }}
                        className={classes.searchIcon}
                      />
                    </div>
                    <div
                      style={{
                        height: "300px",
                        position: "absolute",
                        zIndex: "2",
                      }}
                    >
                      <img
                        ref={imgRef}
                        className={
                          statistic !== null
                            ? classes.statisticImgBlock
                            : classes.statisticImgNone
                        }
                        src={statistic}
                        onLoad={onLoadStatistic}
                      />
                    </div>
                  </Grid>
                </Grid>
              </>
            ) : (
              <></>
            )}
            <Grid
              container
              item
              xs={3}
              justifyContent="center"
              alignItems="center"
              className={classes.Grid_300}
            >
              <Grid
                container
                item
                xs={12}
                justifyContent="center"
                alignItems="flex-start"
              >
                <div style={{ fontSize: "30px", color: "#FFFFFF" }}>
                  {t("API Calls")}
                </div>
              </Grid>
              <div className={classes.div_apiStack}>
                <Grid
                  item
                  container
                  xs={12}
                  justifyContent="center"
                  alignItems="center"
                  className={`${classes.Grid_circle}`}
                >
                  {inferenceCount}
                </Grid>
              </div>
            </Grid>
          </Grid>

          <Grid
            container
            item
            xs={12}
            alignItems="flex-start"
            className={IS_ENTERPRISE ? "" : classes.Grid_bottom}
            style={{ marginTop: 20 }}
          >
            {/*하단 : 서버 인터페이스 */}
            {!IS_ENTERPRISE && (
              <>
                <Grid container item xs={12}>
                  <GridItem
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {openCloudTab()}
                    {openEdgeTab()}
                    {openSensorTab()}
                  </GridItem>
                </Grid>
                <Grid
                  container
                  item
                  xs={9}
                  justifyContent="center"
                  alignItems="flex-start"
                  className={classes.Grid_bottomServer}
                  // style={{border: "2px solid #3991CD", borderRadius: "7px"}}
                  style={{ border: "2px solid #00AABE", borderRadius: "7px" }}
                >
                  <div
                    style={{
                      margin: "0px",
                      width: "100%",
                    }}
                  >
                    <Table
                      className={classes.table}
                      style={{ width: "100%" }}
                      aria-label="simple table"
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell
                            className={classes.tableHead}
                            style={{ width: "7.5%" }}
                            align="center"
                          >
                            <b
                              style={{
                                color: currentThemeColor.textMediumGrey,
                              }}
                            >
                              No
                            </b>
                          </TableCell>
                          <TableCell
                            className={classes.tableHead}
                            align="center"
                            style={{ width: "20%", cursor: "pointer" }}
                          >
                            <div className={classes.tableHeader}>
                              <b>{t("region")}</b>
                            </div>
                          </TableCell>
                          <TableCell
                            className={classes.tableHead}
                            align="center"
                            style={{ width: "20%", cursor: "pointer" }}
                          >
                            <div className={classes.tableHeader}>
                              <b>{t("Instance ID")}</b>
                            </div>
                          </TableCell>
                          <TableCell
                            className={classes.tableHead}
                            align="center"
                            style={{ width: "15%", cursor: "pointer" }}
                          >
                            <div className={classes.tableHeader}>
                              <b>{t("Instance Type")}</b>
                            </div>
                          </TableCell>
                          <TableCell
                            className={classes.tableHead}
                            align="center"
                            style={{ width: "20%", cursor: "pointer" }}
                          >
                            <div className={classes.tableHeader}>
                              <b>{t("Status")}</b>
                            </div>
                          </TableCell>
                          <TableCell
                            className={classes.tableHead}
                            align="center"
                            style={{ width: "15%", cursor: "pointer" }}
                          >
                            <div className={classes.tableHeader}></div>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                    </Table>
                  </div>
                  <div
                    style={{
                      height: "260px",
                      overflow: "scroll",
                      margin: "0px",
                      width: "100%",
                    }}
                  >
                    <Table
                      className={classes.table}
                      style={{ width: "100%" }}
                      aria-label="simple table"
                    >
                      <TableBody>
                        {opsServerGroups.map((opsServerGroup, opsGroupIdx) => (
                          <>
                            <TableRow
                              key={opsGroupIdx}
                              // className={
                              //   selectedOpsGroupIndex === opsGroupIdx
                              //     ? classes.tableFocused
                              //     : classes.tableRow
                              // }
                            >
                              <TableCell
                                className={classes.tableRowCellGroup}
                                align="center"
                                style={{ width: "7.5%" }}
                              >
                                <div style={{ wordBreak: "break-all" }}>
                                  {opsGroupIdx}
                                </div>
                              </TableCell>
                              <TableCell
                                className={classes.tableRowCellGroup}
                                style={{ width: "20%" }}
                                align="center"
                              >
                                <div style={{ wordBreak: "break-all" }}>
                                  {opsServerGroup.region}
                                </div>
                              </TableCell>
                              <TableCell
                                className={classes.tableRowCellGroup}
                                align="center"
                                style={{ width: "20%" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContentContent: "center",
                                  }}
                                >
                                  <div
                                    className={`${classes.modelTab} analyticsBtn ${classes.modelTabHighlightButton}`}
                                    onClick={() => {
                                      if (isChangeSizeLoading == true) {
                                        return;
                                      }
                                      if (
                                        isEnableToChange(
                                          opsServerGroup.updated_at
                                        )
                                      )
                                        openChangeServerSizeModal(
                                          opsServerGroup
                                        );
                                      else {
                                        dispatch(
                                          openErrorSnackbarRequestAction(
                                            `${t(
                                              "Server size can be changed after a certain period of time."
                                            )}
                                        `
                                            // ${isEnableToChange(
                                            //   opsServerGroup.updated_at,
                                            //   true
                                            // )}
                                            // ${t("minutes left")}
                                          )
                                        );
                                      }
                                    }}
                                  >
                                    {t("Edit Server")}
                                  </div>
                                  <div
                                    className={`${classes.modelTab} analyticsBtn ${classes.modelTabHighlightButton}`}
                                    onClick={() => {
                                      //openChangeServerSizeModal(opsServerGroup); 변경하기
                                      if (isChangeSizeLoading == true) {
                                        return;
                                      }
                                      if (
                                        isEnableToChange(
                                          opsServerGroup.updated_at
                                        )
                                      ) {
                                        setIsServerControlModal(true);
                                        setSelectedServerGroup(opsServerGroup);
                                      } else {
                                        dispatch(
                                          openErrorSnackbarRequestAction(
                                            `${t(
                                              "Server size can be changed after a certain period of time."
                                            )}
                                        `
                                            // ${isEnableToChange(
                                            //   opsServerGroup.updated_at,
                                            //   true
                                            // )}
                                            // ${t("minutes left")}
                                          )
                                        );
                                      }
                                    }}
                                  >
                                    {isChangeSizeLoading == true &&
                                    opsGroupIdx == selectedOpsGroupIndex
                                      ? t("Loading")
                                      : opsServerGroup.maxServerSize == 0
                                      ? t("resume")
                                      : t("stop")}
                                  </div>
                                  {/* <div
                                className={`${classes.modelTab} analyticsBtn ${classes.modelTabHighlightButton}`}
                                style={{ color: "red", borderColor: "red" }}
                                onClick={() => {
                                  openDeleteServerGroupModal(opsGroupIdx);
                                }}
                              >
                                {t("Exit")}
                              </div> */}
                                  <Modal
                                    className={classes.modalContainer}
                                    open={isOpenDeleteServerGroupModal}
                                    //onClose={closeDeleteServerGroupModal}
                                  >
                                    <div
                                      className={
                                        classes.modalDataconnectorContent
                                      }
                                      id="projectModal"
                                    >
                                      <div
                                        className={classes.gridRoot}
                                        style={{ height: "100%" }}
                                      >
                                        {deleteLoading == false ? (
                                          <Grid
                                            container
                                            item
                                            xs={12}
                                            justifyContent="center"
                                            alignItems="center"
                                          >
                                            <Grid
                                              container
                                              item
                                              xs={11}
                                              justifyContent="flex-start"
                                              alignItems="flex-start"
                                              style={{
                                                fontSize: "20px",
                                                color: "#FFFFFF",
                                                marginTop: "10px",
                                              }}
                                            >
                                              {t(
                                                "Are you sure you want to delete that server group?"
                                              )}
                                            </Grid>
                                            {deleteTextError == true && (
                                              <Grid
                                                container
                                                item
                                                xs={11}
                                                justifyContent="flex-start"
                                                alignItems="flex-start"
                                                style={{
                                                  fontSize: "15px",
                                                  color: "red",
                                                  marginTop: "2px",
                                                }}
                                              >
                                                {t("Enter 'Delete' correctly.")}
                                              </Grid>
                                            )}
                                            <Grid
                                              container
                                              item
                                              xs={11}
                                              justifyContent="flex-start"
                                              alignItems="flex-start"
                                              style={{
                                                fontSize: "20px",
                                                color: "#FFFFFF",
                                                marginTop: "8px",
                                              }}
                                            >
                                              <TextField
                                                fullWidth={true}
                                                onChange={(e) =>
                                                  setDeleteText(e.target.value)
                                                }
                                                inputProps={{
                                                  className:
                                                    newClasses.deleteModalText,
                                                }}
                                                variant="outlined"
                                                placeholder={t(
                                                  "Enter 'Delete' correctly."
                                                )}
                                              />
                                            </Grid>
                                            <Grid
                                              container
                                              item
                                              xs={11}
                                              justifyContent="flex-start"
                                              alignItems="flex-start"
                                            >
                                              <div
                                                style={{
                                                  wordBreak: "break-all",
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <div
                                                    className={`
                                                      ${classes.modelTab}
                                                      analyticsBtn
                                                      ${classes.modelTabHighlightButton}
                                                    `}
                                                    style={{
                                                      textAlign: "center",
                                                    }}
                                                    onClick={() => {
                                                      if (
                                                        deleteText ==
                                                          "Delete" &&
                                                        deleteLoading == false
                                                      ) {
                                                        setDeleteLoading(true);
                                                        //shutdownOpsServer();
                                                        setDeleteTextError(
                                                          false
                                                        );
                                                        //loading lock
                                                        api
                                                          .removeOpsServerGroup(
                                                            opsServerGroups[
                                                              selectedOpsGroupIndex
                                                            ].id
                                                          )
                                                          .then((res) => {
                                                            getAsyncTaskData(); //sync로 바꾸고 sync에 모달창 닫기 추가 필요
                                                            setDeleteTextError(
                                                              false
                                                            );
                                                            getAsyncTaskData();
                                                            dispatch(
                                                              openSuccessSnackbarRequestAction(
                                                                t(
                                                                  "The server group has been deleted."
                                                                )
                                                              )
                                                            );
                                                          })
                                                          .catch(() => {
                                                            setDeleteLoading(
                                                              false
                                                            );
                                                            setDeleteTextError(
                                                              false
                                                            );
                                                            dispatch(
                                                              openErrorSnackbarRequestAction(
                                                                t(
                                                                  "Failed to delete server group."
                                                                )
                                                              )
                                                            );
                                                            setIsOpenDeleteServerGroupModal(
                                                              false
                                                            );
                                                          });
                                                      } else {
                                                        setDeleteTextError(
                                                          true
                                                        );
                                                      }
                                                    }}
                                                  >
                                                    {t("Yes")}
                                                  </div>
                                                </div>
                                              </div>
                                              <div
                                                style={{
                                                  wordBreak: "break-all",
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <div
                                                    className={`
                                                      ${classes.modelTab}
                                                      analyticsBtn
                                                      ${classes.modelTabHighlightButton}
                                                    `}
                                                    style={{
                                                      textAlign: "center",
                                                    }}
                                                    onClick={
                                                      closeDeleteServerGroupModal
                                                    }
                                                  >
                                                    {t("No")}
                                                  </div>
                                                </div>
                                              </div>
                                            </Grid>
                                          </Grid>
                                        ) : (
                                          <>
                                            <Grid
                                              container
                                              item
                                              xs={11}
                                              justifyContent="flex-start"
                                              alignItems="flex-start"
                                              style={{
                                                fontSize: "20px",
                                                color: "#FFFFFF",
                                                marginTop: "10px",
                                              }}
                                            >
                                              {t("The group is being deleted.")}
                                            </Grid>
                                            <Grid
                                              container
                                              item
                                              xs={12}
                                              justifyContent="center"
                                              alignItems="flex-start"
                                            >
                                              <div
                                                className={classes.loading}
                                                style={{ height: "150px" }}
                                              >
                                                <CircularProgress size={30} />
                                              </div>
                                            </Grid>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </Modal>
                                </div>
                              </TableCell>
                              <TableCell
                                className={classes.tableRowCellGroup}
                                style={{ width: "15%" }}
                                align="center"
                              >
                                {opsServerGroup.instances[0] == undefined &&
                                  opsServerGroup.maxServerSize !== 0 &&
                                  t("Pending")}
                              </TableCell>
                              <TableCell
                                className={classes.tableRowCellGroup}
                                align="center"
                                style={{ width: "10%" }}
                              ></TableCell>
                              <TableCell
                                className={classes.tableRowCellGroup}
                                style={{ width: "15%" }}
                                align="center"
                              ></TableCell>
                            </TableRow>
                            {opsServerGroup.instances.map(
                              (instance, instanceIdx) => (
                                <TableRow
                                  onClick={() => {
                                    if (
                                      instanceIdx !== selectedInstanceIndex ||
                                      opsGroupIdx !== selectedOpsGroupIndex
                                    ) {
                                      setStatistic(null);
                                      setSelectedOpsGroupIndex(opsGroupIdx);
                                      setSelectedInstanceIndex(instanceIdx);
                                    }
                                  }}
                                  key={instanceIdx}
                                  className={
                                    instanceIdx === selectedInstanceIndex &&
                                    opsGroupIdx === selectedOpsGroupIndex
                                      ? classes.tableFocused
                                      : classes.tableRow
                                  }
                                >
                                  <TableCell
                                    className={classes.tableRowCell}
                                    style={{ width: "7.5%" }}
                                    align="center"
                                  ></TableCell>
                                  <TableCell
                                    className={classes.tableRowCell}
                                    style={{ width: "20%" }}
                                    align="center"
                                  ></TableCell>
                                  <TableCell
                                    className={classes.tableRowCell}
                                    style={{ width: "20%" }}
                                    align="center"
                                  >
                                    <div style={{ wordBreak: "break-all" }}>
                                      {instance.InstanceId}
                                    </div>
                                  </TableCell>
                                  <TableCell
                                    className={classes.tableRowCell}
                                    style={{ width: "15%" }}
                                    align="center"
                                  >
                                    <div style={{ wordBreak: "break-all" }}>
                                      {instance.InstanceType}
                                    </div>
                                  </TableCell>
                                  <TableCell
                                    className={classes.tableRowCell}
                                    style={{ width: "20%" }}
                                    align="center"
                                  >
                                    <div
                                      id="instanceStatus"
                                      style={{ wordBreak: "break-all" }}
                                    >
                                      {instance?.State?.Name !== "running"
                                        ? t("pending")
                                        : t("running")}
                                    </div>
                                  </TableCell>
                                  <TableCell
                                    className={classes.tableRowCell}
                                    align="center"
                                    style={{ width: "15%" }}
                                  >
                                    <div style={{ wordBreak: "break-all" }}>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <div
                                          id="selectedInstance"
                                          className={`${classes.modelTab} analyticsBtn ${classes.modelTabHighlightButton}`}
                                          // onClick={() => {
                                          //   setSelectedOpsGroupIndex(
                                          //     opsGroupIdx
                                          //   );
                                          //   setSelectedInstanceIndex(
                                          //     instanceIdx
                                          //   );
                                          // }}
                                        >
                                          {opsGroupIdx ===
                                            selectedOpsGroupIndex &&
                                          instanceIdx === selectedInstanceIndex
                                            ? t("Selected")
                                            : t("Choose")}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Grid>
              </>
            )}
            <Grid
              container
              item
              xs={3}
              justifyContent="center"
              alignItems="center"
            >
              {!IS_ENTERPRISE && (
                <>
                  <Grid
                    container
                    item
                    xs={12}
                    justifyContent="space-evenly"
                    alignItems="center"
                    direction="column"
                    style={{ height: "300px" }}
                  >
                    <Button
                      disabled={isDisabledButton || existProject !== -1}
                      className={
                        isDisabledButton || existProject !== -1
                          ? `${newClasses.sideButton} ${classes.defaultDisabledButton}`
                          : `${newClasses.sideButton} ${classes.defaultHighlightButton}`
                      }
                      onClick={() => openPredictModal()}
                    >
                      {t("Predict")}
                    </Button>
                    {projects.project?.option?.indexOf("load") === -1 &&
                      projects.project?.option?.indexOf("recommender") === -1 &&
                      !IS_ENTERPRISE && (
                        <Button
                          id="share_serviceapp_btn"
                          shape="greenOutlined"
                          disabled={isDisabledButton || existProject !== -1}
                          onClick={() => openServiceAppModal()}
                        >
                          {t("Sharing a service app")}
                        </Button>
                      )}
                    <Button
                      className={`analyticsBtn ${classes.defaultF0F0OutlineButton} ${newClasses.sideButton}`}
                      onClick={() => addRegion()}
                    >
                      {t("Add Server Group")}
                    </Button>
                    <Tooltip
                      title={t(
                        "Available after data accumulation through forecasting"
                      )}
                      placement="top"
                    >
                      <Button
                        className={
                          inferenceCount == 0 || existProject !== -1
                            ? `${newClasses.sideButton} ${classes.defaultDisabledButton}`
                            : `${newClasses.sideButton} ${classes.defaultF0F0OutlineButton}`
                        }
                        //className={`analyticsBtn ${classes.defaultF0F0OutlineButton} ${newClasses.sideButton}`}
                        onClick={() => {
                          if (inferenceCount == 0 || existProject !== -1) {
                          } else {
                            goToLabelProject();
                          }
                        }}
                      >
                        {t("Retraining Labeling")}
                      </Button>
                    </Tooltip>
                    <Button
                      className={`analyticsBtn ${classes.defaultF0F0OutlineButton} ${newClasses.sideButton}`}
                      onClick={() => goToSales()}
                    >
                      {t("API sales")}
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </div>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isPredictModalOpen}
        onClose={closeModal}
        className={classes.modalContainer}
      >
        <ModalPage
          closeModal={closeModal}
          chosenItem={
            projects.opsProject?.trainingMethod !== "object_detection" &&
            projects.opsProject?.trainingMethod !== "cycle_gan" &&
            projects.opsProject?.trainingMethod !== "image"
              ? "api"
              : "apiImage"
          }
          isMarket={false}
          csv={csvDict}
          trainingColumnInfo={trainingColumnInfo}
          history={props.history}
          opsId={projects.opsProject?.id}
          chosenItem={
            projects.opsProject?.trainingMethod !== "object_detection" &&
            projects.opsProject?.trainingMethod !== "cycle_gan" &&
            projects.opsProject?.trainingMethod !== "image"
              ? projects?.project?.option?.indexOf("load") === -1
                ? "api"
                : "apiLoaded"
              : "apiImage"
          }
          isMarket={false}
          opsId={projects.opsProject?.id}
          csv={csvDict}
          trainingColumnInfo={trainingColumnInfo}
          history={props.history}
        />
      </Modal>
      {!IS_ENTERPRISE && (
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isChangeSizeModalOpen}
          //onClose={() => {
          //  setIsChangeSizeModalOpen(false);
          //}}
          className={classes.modalContainer}
        >
          <div className={classes.modalDataconnectorContent} id="projectModal">
            <div className={classes.gridRoot} style={{ height: "100%" }}>
              <>
                <div style={{ width: "100%", textAlign: "center" }}>
                  <GridContainer
                    style={{
                      width: "100%",
                      height: "50%",
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Grid
                      container
                      item
                      xs={12}
                      justifyContent="center"
                      alignItems="flex-start"
                    >
                      <Grid
                        container
                        item
                        xs={11}
                        justifyContent="flex-start"
                        alignItems="center"
                        style={{
                          height: "50px",
                          fontSize: "30px",
                          marginBottom: "15px",
                        }}
                      >
                        {t("Resize")}
                      </Grid>
                      <Grid
                        container
                        item
                        xs={11}
                        justifyContent="flex-start"
                        style={{
                          marginBottom: "3px",
                          fontSize: "15px",
                        }}
                      >
                        {t(
                          "You specify the size of your Auto Scaling group by changing the desired capacity."
                        )}
                      </Grid>
                      <Grid
                        container
                        item
                        xs={11}
                        justifyContent="flex-start"
                        style={{
                          marginBottom: "3px",
                          fontSize: "15px",
                        }}
                      >
                        {t(
                          "You can specify maximum and minimum capacity limits."
                        )}
                      </Grid>
                      <Grid
                        container
                        item
                        xs={11}
                        justifyContent="flex-start"
                        style={{
                          marginBottom: "50px",
                          fontSize: "15px",
                        }}
                      >
                        {t(
                          "If the maximum capacity limit is set to 0, group use will be stopped."
                        )}
                      </Grid>
                      <Grid
                        container
                        item
                        xs={11}
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                      >
                        <Grid
                          container
                          item
                          xs={11}
                          direction="column"
                          justifyContent="flex-start"
                          alignItems="flex-start"
                        >
                          {t("Current Volume")}
                          <TextField
                            variant="outlined"
                            type="number"
                            style={{ margin: 10 }}
                            InputProps={{
                              style: { color: "white", fontWeight: "400" },
                            }}
                            defaultValue={seletedServerGroup.startServerSize}
                            onChange={(e) => {
                              if (+e.target.value > 4) {
                                setServerSizeSubmitLock(true);
                                dispatch(
                                  openSuccessSnackbarRequestAction(
                                    t(
                                      "More than 5 items are available through inquiries from the sales team."
                                    )
                                  )
                                );
                                openChat();
                                setStartServerSizeToChange(5);
                              } else {
                                if (
                                  maxServerSizeToChange < 5 &&
                                  minServerSizeToChange < 5 &&
                                  startServerSizeToChange < 5
                                )
                                  setServerSizeSubmitLock(false);
                                setStartServerSizeToChange(+e.target.value);
                              }
                            }}
                          />
                        </Grid>
                        <Grid
                          container
                          item
                          xs={11}
                          direction="column"
                          justifyContent="flex-start"
                          alignItems="flex-start"
                        >
                          {t("Minimum Volume")}
                          <TextField
                            variant="outlined"
                            type="number"
                            style={{ margin: 10 }}
                            InputProps={{
                              style: { color: "white", fontWeight: "400" },
                            }}
                            defaultValue={seletedServerGroup.minServerSize}
                            onChange={(e) => {
                              if (+e.target.value > 4) {
                                setServerSizeSubmitLock(true);
                                dispatch(
                                  openSuccessSnackbarRequestAction(
                                    t(
                                      "More than 5 items are available through inquiries from the sales team."
                                    )
                                  )
                                );
                                openChat();
                                setMinServerSizeToChange(5);
                              } else {
                                if (
                                  maxServerSizeToChange < 5 &&
                                  minServerSizeToChange < 5 &&
                                  startServerSizeToChange < 5
                                )
                                  setServerSizeSubmitLock(false);
                                setMinServerSizeToChange(+e.target.value);
                              }
                            }}
                          />
                        </Grid>
                        <Grid
                          container
                          item
                          xs={11}
                          direction="column"
                          justifyContent="flex-start"
                          alignItems="flex-start"
                        >
                          {t("Maximum Volume")}
                          <TextField
                            variant="outlined"
                            type="number"
                            style={{ margin: 10 }}
                            InputProps={{
                              style: { color: "white", fontWeight: "400" },
                            }}
                            defaultValue={seletedServerGroup.maxServerSize}
                            onChange={(e) => {
                              if (+e.target.value > 4) {
                                setServerSizeSubmitLock(true);
                                dispatch(
                                  openSuccessSnackbarRequestAction(
                                    t(
                                      "More than 5 items are available through inquiries from the sales team."
                                    )
                                  )
                                );
                                openChat();
                                setMaxServerSizeToChange(5);
                              } else {
                                if (
                                  maxServerSizeToChange < 5 &&
                                  minServerSizeToChange < 5 &&
                                  startServerSizeToChange < 5
                                )
                                  setServerSizeSubmitLock(false);
                                setMaxServerSizeToChange(+e.target.value);
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </GridContainer>
                </div>
              </>
            </div>
            <GridContainer>
              <GridItem xs={12}>
                <GridContainer style={{ width: "100%" }}>
                  <>
                    <GridItem xs={3}></GridItem>
                    <GridItem xs={3}></GridItem>
                    <GridItem xs={3}>
                      <Button
                        id="closeLoadModelModal"
                        style={{ width: "100%" }}
                        // className={classes.defaultOutlineButton}
                        className={
                          isChangeSizeLoading === true
                            ? classes.defaultDisabledButton
                            : classes.defaultOutlineButton
                        }
                        disabled={isChangeSizeLoading}
                        onClick={() => {
                          setIsChangeSizeModalOpen(false);
                          setMaxServerSizeToChange(1);
                          setMinServerSizeToChange(1);
                          setStartServerSizeToChange(1);
                        }}
                      >
                        {t("Cancel")}
                      </Button>
                    </GridItem>
                    <GridItem xs={3}>
                      <Button
                        id="nextLoadModelModal"
                        style={{ width: "100%" }}
                        className={
                          isChangeSizeLoading === false
                            ? serverSizeSubmitLock === true
                              ? classes.defaultDisabledButton
                              : classes.defaultHighlightButton
                            : classes.defaultDisabledButton
                        }
                        disabled={isChangeSizeLoading || serverSizeSubmitLock}
                        onClick={() => {
                          if (
                            minServerSizeToChange <= startServerSizeToChange &&
                            startServerSizeToChange <= maxServerSizeToChange
                          ) {
                            if (isEnableToChange(seletedServerGroup.updated_at))
                              changeSize();
                            else {
                              openErrorSnackbarRequestAction(
                                t(
                                  "This server has recently changed. Please try again later."
                                )
                              );
                            }
                          } else {
                            dispatch(
                              openErrorSnackbarRequestAction(
                                t("Invalid input.")
                              )
                            );
                          }
                        }}
                      >
                        {isChangeSizeLoading === false
                          ? t("Confirm")
                          : t("Loading")}
                      </Button>
                    </GridItem>
                  </>
                </GridContainer>
              </GridItem>
            </GridContainer>
          </div>
        </Modal>
      )}
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isFullSizeStatisticModal}
        // onClose={() => {
        //   setIsFullSizeStatisticModal(false);
        // }}
        className={classes.modalContainer}
      >
        <Grid
          item
          container
          xs={12}
          justifyContent="center"
          alignItems="center"
        >
          <Grid
            item
            container
            xs={10}
            justifyContent="center"
            alignItems="center"
          >
            <div
              style={{
                marginLeft: `${(100 * 5) / 6}vw`,
                paddingRight: "30px",
                marginBottom: `${(((100 * 5) / 6) * 300) / 675}vw`,
                paddingTop: "30px",
                position: "absolute",
                zIndex: "3",
              }}
            >
              <FullscreenIcon
                onClick={() => {
                  setIsFullSizeStatisticModal(false);
                }}
                className={classes.searchIconClose}
              />
            </div>
            <img src={statistic} width="100%" />
          </Grid>
        </Grid>
      </Modal>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isServiceAppModalOpen}
        onClose={serviceAppModalActionClose}
        className={classes.modalContainer}
      >
        <div className={classes.shareModalContent} id="projectModal">
          <div className={classes.gridRoot} style={{ margin: "0 20px" }}>
            <div className={classes.titleContainer} style={{ width: "100%" }}>
              <b>{t("Sharing a service app")}</b>
              <CloseIcon
                className={classes.closeImg}
                id="planModalCloseBtn"
                onClick={serviceAppModalActionClose}
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
              {/* <GridItem xs={12}>
                {((models.model?.yClass && models.model?.yClass.length > 0) ||
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
                        ? `https://ko.ds2.ai//skyhub_app.html/?modeltoken=${models.model?.token}&opsid=${projects.opsProject?.id}`
                        : `https://ds2.ai/skyhub_app.html/?modeltoken=${models.model?.token}&opsid=${projects.opsProject?.id}`
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
                        ? `https://ko.ds2.ai//skyhub_app.html/?modeltoken=${models.model?.token}&opsid=${projects.opsProject?.id}`
                        : `https://ds2.ai/skyhub_app.html/?modeltoken=${models.model?.token}&opsid=${projects.opsProject?.id}`}
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
                      ? `https://ko.ds2.ai//skyhub_app.html/?modeltoken=${models.model?.token}&opsid=${projects.opsProject?.id}`
                      : `https://ds2.ai/skyhub_app.html/?modeltoken=${models.model?.token}&opsid=${projects.opsProject?.id}`
                  }
                >
                  <Button
                    className={classes.defaultHighlightButton}
                    style={{
                      height: "1.7rem",
                      width: "8vw",
                      minWidth: "90px",
                      margin: "1rem 0",
                    }}
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
      <SalesModal
        isSalesModalOpen={isSalesModalOpen}
        setIsSalesModalOpen={setIsSalesModalOpen}
        api_type="Ops"
        model_id={projects.opsProject?.id}
      />
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isServerControlModal}
        className={classes.modalContainer}
      >
        <div
          style={{
            width: "350px",
            height: "130px",
            backgroundColor: "#212121",
            border: "1px solid #383738",
            borderRadius: "4px",
          }}
        >
          <Grid
            container
            item
            xs={12}
            justifyContent="flex-end"
            alignItems="center"
            style={{
              marginTop: "5px",
              paddingRight: "5px",
              marginBottom: "10px",
            }}
          >
            <CloseIcon
              onClick={() => {
                setIsServerControlModal(false);
              }}
              className={classes.closeImg}
              id="planModalCloseBtn"
            />
          </Grid>
          {isChangeSizeLoading ? (
            <div
              style={{
                height: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={30} />
            </div>
          ) : (
            <>
              <Grid
                container
                item
                xs={12}
                justifyContent="center"
                alignItems="center"
              >
                {selectedServerGroup?.maxServerSize == 0
                  ? t("Do you want to resume the server?")
                  : t("Do you want to stop the server?")}
              </Grid>
              <Grid
                container
                item
                xs={12}
                justifyContent="space-evenly"
                alignItems="center"
                style={{ marginTop: "5px" }}
              >
                <Button
                  style={{ color: "#FFFFFF" }}
                  onClick={() => {
                    changeSize(
                      selectedServerGroup?.maxServerSize == 0 ? 1 : 0,
                      selectedServerGroup?.id
                    );
                  }}
                >
                  {t("Yes")}
                </Button>
                <Button
                  style={{ color: "#FFFFFF" }}
                  onClick={() => {
                    setIsServerControlModal(false);
                  }}
                >
                  {t("No")}
                </Button>
              </Grid>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
export default OpsPannel;
