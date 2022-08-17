import React, { useEffect, useState, useRef } from "react";
import Cookies from "helpers/Cookies";
//components
import ServerForm from "./ServerForm/ServerForm";

//@material-ui
import Tooltip from "@material-ui/core/Tooltip";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import Modal from "@material-ui/core/Modal";
import TextField from "@material-ui/core/TextField";
import { SERVER_DATA } from "../../TestJSON";
import { API_CALL } from "../../TestJSON";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import currentTheme, { currentThemeColor } from "../../../../assets/jss/custom";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import { useTranslation } from "react-i18next";
import * as api from "../../../../controller/api";
import { fileurl, backendurl } from "controller/api";
//redux
import { useDispatch, useSelector } from "react-redux";
import { openErrorSnackbarRequestAction, openSuccessSnackbarRequestAction } from "redux/reducers/messages.js";
import { getCardRequestAction } from "../../../../redux/reducers/user";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "components/CustomButtons/Button";
import { openChat } from "components/Function/globalFunc";

const useStyle = makeStyles({
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
    backgroundColor: "inherit",
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

const defaultStyles = {
  div_apiStack: {
    width: "220px",
    height: "220px",
    margin: "auto",
  },
  Grid_circle: {
    height: "220px",
    borderRadius: "70%",
    fontSize: "30px",
    background: "linear-gradient(45deg,#3B82F7,#5EC3B5)",
    border: "2px solid #3B82F7",
    color: "#FFFFFF",
  },
  Grid_300: {
    height: "300px",
  },
  Grid_border: {
    border: "1px solid #FFFFFF",
    marginBottom: "10px",
  },
  Grid_bottom: {
    border: "1px solid #FFFFFF",
    height: "500",
    marginRight: "4px",
    marginLeft: "4px",
  },
};

const History = (props) => {
  const dispatch = useDispatch();
  const classes = currentTheme();
  const { user } = useSelector(
    (state) => ({
      user: state.user,
    }),
    []
  );
  const newClasses = useStyle();
  const { t } = useTranslation();
  const { history, project, ...other } = props;
  const [isReadyToShow, setIsReadyToShow] = useState(false);
  const [instances, setInstances] = useState([]); //더미데이터: 초기에 아무것도 없는 여러개 이것 때문에 뜸
  const [inferenceCount, setInferenceCount] = useState(0);

  const [projectName, setProjectName] = useState(null);

  const [statistic, setStatistic] = useState(null);
  const [groupModal, setGroupModal] = useState(false); //opsPannel에 필요한 요소

  const [deleteServerModal, setDeleteServerModal] = useState(false); //삭제 모달창 switch
  const [deleteText, setDeleteText] = useState(""); //"삭제" 입력값 확인하는 변수
  const [deleteTextError, setDeleteTextError] = useState(false); //삭제시 오류 switch

  const [deleteProjectModal, setDeleteProjectModal] = useState(false); //삭제 모달창 switch
  const [deleteProjectText, setDeleteProjectText] = useState(""); //"삭제" 입력값 확인하는 변수
  const [deleteProjectTextError, setDeleteProjectTextError] = useState(false); //삭제시 오류 switch
  const [isDeleteProjectLoading, setIsDeleteProjectLoading] = useState(false); //프로젝트 삭제 로딩 switch
  const [isGettingStatus, setIsgettingStatus] = useState(false); //삭제 완료시 새로운 인스턴스들 받아오는지 확인하는 변수
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [renameServerModal, setRenameServerModal] = useState(false); //프로젝트명 변경 모달 switch
  const [renameText, setRenameText] = useState(""); //새로운 프로젝트명 입력 변수
  const [intervalRefresh, setIntervalRefresh] = useState(0); //60초마다 받아오는 로직 상태(instances값 입력 없이 interval 실행되면 계속 undefined값으로 확인하는것 방지)
  const [instanceCountLimit, setInstanceCountLimit] = useState(process.env.REACT_APP_ENTERPRISE ? 99999999999 : 4); //instance 개수 제한 (n)개 까지 가능
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [switchStatus, setSwitchStatus] = useState("");
  const [serverStatusModal, setServerStatusModal] = useState(false);
  const [isRefreshAbuse, setIsRefreshAbuse] = useState(false);
  const [isFullSizeStatisticModal, setIsFullSizeStatisticModal] = useState(false);
  const [timeTickAsync, setTimeTickAsync] = useState(0);
  const [timeTickAsyncCount, setTimeTickAsyncCount] = useState(0);
  const imgRef = useRef();
  //sample dataaa
  const loader = fileurl + "asset/front/img/loader.svg"; //사용 x
  var monitoring_url = api.frontendurl;
  if (monitoring_url[monitoring_url.length - 1] === "/") {
    monitoring_url = monitoring_url.slice(0, monitoring_url.length - 1);
  }
  monitoring_url = monitoring_url.split(":13000")[0] + ":13003";
  monitoring_url = monitoring_url.replace("https", "http");

  //비동기 처라 useEffect
  useEffect(() => {
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
  }, [timeTickAsyncCount]);

  useEffect(() => {
    setProjectName(project?.projectName);
  }, [project]);
  useEffect(() => {
    setStatistic(null);
  }, [selectedIndex]);

  useEffect(() => {
    if (isReadyToShow == true) setSelectedIndex(0);
  }, [isReadyToShow]);

  useEffect(() => {
    if (project?.id) {
      api.getJupyterServerStatus(props.match.params.id).then((res) => {
        setIsReadyToShow(true);
        setInstances(res.data);
      });
    }
  }, [project, props.location]);

  const serverStatusModalClose = () => {
    setServerStatusModal(false);
  };

  const renameServerModalClose = () => {
    setRenameServerModal(false);
    setRenameText("");
  };

  const deleteProjectModalClose = () => {
    setDeleteProjectModal(false);
    setDeleteProjectTextError(false);
    setDeleteProjectText("");
  };

  const deleteServerModalClose = () => {
    setDeleteServerModal(false);
    setDeleteTextError(false);
    setDeleteText("");
  };

  const groupModalClose = () => {
    setGroupModal(false);
  };

  const goToLabelProject = () => {
    // if(parseInt(user.me.cumulativeProjectCount) >= parseInt(user.me.usageplan.projects) + parseInt(user.me.remainProjectCount)){
    //   dispatch(openErrorSnackbarRequestAction(`${t('You can’t add a new project. You’ve reached the maximum number of projects allowed for your account')} ${t('계속 진행하시려면 이용플랜을 변경해주세요.')}`));
    //   return;
    // }
    props.history.push("/admin/labelling/3171");
  };

  const isEnableToChange = (time, option = null) => {
    let updatedAt = new Date(time).getTime() / 60000;
    let nowTime = new Date();
    nowTime = new Date(nowTime.getTime() + nowTime.getTimezoneOffset() * 60000).getTime() / 60000;
    if (option == null) return nowTime - updatedAt > 10;
    else return 10 - Math.floor(nowTime - updatedAt);
  };

  const executeJupyter = (ip, port = null) => {
    if (ip[ip.length - 1] === "/") {
      ip = ip.slice(0, ip.length - 1);
    }
    window.open(`http://${ip}:${port == null ? 9999 : port}/?token=${JSON.parse(Cookies.getCookie("apptoken"))}`, "_blank").focus();
  };

  const shutdownJupyter = (instance) => {
    api
      .shutdownJupyterServer(instance.InstanceId)
      .then((response) => {
        dispatch(openSuccessSnackbarRequestAction(t("Server deletion successful.")));
        setIsgettingStatus(true);
        api.getJupyterServerStatus(props.match.params.id).then((res) => {
          setDeleteServerModal(false);
          setInstances(res.data);
          setDeleteText("");
          setIsgettingStatus(false);
          setDeleteLoading(false);
        });
      })
      .catch((e) => {
        setDeleteServerModal(false);
        setDeleteLoading(false);
        setDeleteText("");
        dispatch(openErrorSnackbarRequestAction(t("Deletion of server failed.")));
      });
  };

  const addServer = () => {
    if (instances && instances.length < instanceCountLimit) {
      history.push(`/admin/newjupyterproject/${project.id}`);
    } else {
      dispatch(openSuccessSnackbarRequestAction(t("Additional servers can be added after contacting the sales team.")));
      openChat();
    }
  };

  useEffect(() => {
    if (process.env.REACT_APP_ENTERPRISE !== "true") {
      if (user.cardInfo == null) {
        dispatch(getCardRequestAction());
      } else if (user.cardInfo == null || user.cardInfo.cardName == null) {
        props.history.push(`/admin/setting/payment/?message=need`);
        return;
      }
    }
  }, [user.cardInfo]);

  useEffect(() => {
    if (project) {
      let instancesRaw = [];
      if (project.instances !== undefined && project.instances.length > 0) {
        project.instances.forEach((instance, index) => {
          instance.isSelected = index === 0;
          instancesRaw.push(instance);
        });
      }
      if (JSON.stringify(instances) !== JSON.stringify(instancesRaw)) setIntervalRefresh(intervalRefresh + 1);
      setInstances(instancesRaw);
      if (project.inferenceCount) {
        setInferenceCount(project.inferenceCount);
      }
    }
  }, [project]);

  useEffect(() => {
    if (process.env.REACT_APP_ENTERPRISE !== "true") {
      api
        .getJupyterServerStatistic(instances[selectedIndex]?.InstanceId)
        .then((response) => {
          return new Blob([response.data]);
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          setStatistic(url);
        });
    }
  }, [selectedIndex]);

  const getAsyncTaskData = () => {
    if (instances[selectedIndex]?.InstanceId == undefined) setIntervalRefresh(intervalRefresh + 1);
    api.getJupyterServerStatus(props.match.params.id).then((res) => {
      setInstances(res.data);
    });
    if (instances) {
      if (process.env.REACT_APP_ENTERPRISE !== "true") {
        api
          .getJupyterServerStatistic(instances[selectedIndex]?.InstanceId)
          .then((response) => {
            return new Blob([response.data]);
          })
          .then((blob) => {
            const url = window.URL.createObjectURL(new Blob([blob]));
            setStatistic(url);
          });
      }
    }
  };

  const reloadButton = (
    <AutorenewIcon
      id="jupyterRefreshBtn"
      className={isRefreshAbuse === false ? classes.refreshIconActive : classes.refreshIconDefault}
      style={{ marginLeft: "4px" }}
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

  const tableHeads = [
    { label: "No", condition: true },
    { label: "지역", condition: process.env.REACT_APP_ENTERPRISE !== "true" },
    {
      label: "인스턴스 ID",
      condition: process.env.REACT_APP_ENTERPRISE !== "true",
    },
    {
      label: "인스턴스 타입",
      condition: process.env.REACT_APP_ENTERPRISE !== "true",
    },
    {
      label: "포트번호",
      condition: process.env.REACT_APP_ENTERPRISE === "true",
    },
    { label: "GPU", condition: process.env.REACT_APP_ENTERPRISE === "true" },
    { label: "상태", condition: true },
    // { label: "서버 모니터링", condition: process.env.REACT_APP_ENTERPRISE === "true"},
    // { label: "선택", condition:  process.env.REACT_APP_ENTERPRISE !== "true"},
    {
      label: "상태관리",
      condition: process.env.REACT_APP_ENTERPRISE !== "true",
    },
    { label: "Jupyter", condition: true },
    { label: "종료", condition: process.env.REACT_APP_ENTERPRISE !== "true" },
  ];

  // useEffect(() => {
  //   // const timer = setInterval(getAsyncTaskData, 60); // 알림 정보 60초 단위로 가져오기
  //   const timer = setInterval(getAsyncTaskData, 60 * 1000); // 알림 정보 60초 단위로 가져오기
  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [intervalRefresh]);

  return (
    <>
      {isReadyToShow === true ? (
        <Grid container item xs={12} justifyContent="center" alignItems="center">
          <Grid container item xs={12} justifyContent="center" alignItems="center">
            {/*상단 : 그래프, api 호출 수*/}
            <Grid container item xs={12} justifyContent="center" alignItems="center">
              <Grid container item xs={12} justifyContent="flex-start" alignItems="center">
                <div
                  id="projectName"
                  style={{
                    padding: "2px",
                    borderRadius: "2px",
                    paddingRight: "5px",
                    paddingLeft: "5px",
                  }}
                >
                  {project !== null && `${projectName}`}
                </div>
                <Button id="changeJupyterPorjectName" className={classes.defaultF0F0OutlineButton} style={{ fontSize: "12px", margin: "0 10px" }} onClick={() => setRenameServerModal(true)}>
                  {t("Change")}
                </Button>
                <Button
                  id="jupyterDelete"
                  className={classes.defaultDeleteButton}
                  style={{ fontSize: "12px" }}
                  onClick={() => {
                    if (process.env.REACT_APP_ENTERPRISE === "true" || isEnableToChange(props.project.created_at)) setDeleteProjectModal(true);
                    else {
                      dispatch(
                        openErrorSnackbarRequestAction(
                          `${t("Deleting a project is possible after a certain period of time has passed since creation.")}
                          `
                          // ${isEnableToChange(props.project.created_at, true)}
                          // ${t("minutes left")}
                        )
                      );
                    }
                  }}
                >
                  {t("Delete Project")}
                </Button>
                <Tooltip title={<text style={{ fontSize: "12px" }}>{t("refresh project")}</text>} placement="top">
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
                      <Grid container item xs={12} justifyContent="center" alignItems="center">
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
                            id="inputDeleteMethod"
                            fullWidth={true}
                            onChange={(e) => setDeleteProjectText(e.target.value)}
                            inputProps={{
                              className: newClasses.deleteModalText,
                            }}
                            variant="outlined"
                            placeholder={t("Enter 'Delete' correctly.")}
                          />
                        </Grid>
                        <Grid container item xs={11} justifyContent="flex-start" alignItems="flex-start">
                          <div style={{ wordBreak: "break-all" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Button
                                id="confirmJupyterDelete"
                                className={classes.defaultGreenOutlineButton}
                                style={{ textAlign: "center" }}
                                onClick={() => {
                                  if (deleteProjectText !== "Delete") {
                                    setDeleteProjectTextError(true);
                                  } else {
                                    setDeleteProjectTextError(false);
                                    setIsDeleteProjectLoading(true);
                                    api
                                      .deleteJupyterProjects([props.match.params.id])
                                      .then((res) => {
                                        if (res?.data?.failList.length == 0) {
                                          setDeleteProjectModal(false);
                                          dispatch(openSuccessSnackbarRequestAction(t("The Jupyter project has been deleted.") + (process.env.REACT_APP_ENTERPRISE ? " " + t("컴퓨터 재시작 시 적용됩니다.") : "")));
                                          props.history.push("/admin/jupyterproject/");
                                        } else {
                                          setIsDeleteProjectLoading(false);
                                          setDeleteProjectModal(false);
                                          dispatch(openErrorSnackbarRequestAction(t("Failed to delete Jupyter project.")));
                                        }
                                      })
                                      .catch((err) => {
                                        setIsDeleteProjectLoading(false);
                                        setDeleteProjectModal(false);
                                        dispatch(openErrorSnackbarRequestAction(t("Failed to delete Jupyter project.")));
                                      });
                                  }
                                }}
                              >
                                {t("Yes")}
                              </Button>
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
                              <Button id="cancelJupyterDelete" className={classes.defaultGreenOutlineButton} style={{ textAlign: "center" }} onClick={deleteProjectModalClose}>
                                {t("No")}
                              </Button>
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
                        <Grid container item xs={12} justifyContent="center" alignItems="flex-start">
                          <div className={classes.loading} style={{ height: "150px" }}>
                            <CircularProgress size={20} />
                          </div>
                        </Grid>
                      </Grid>
                    )}
                  </div>
                </Modal>
              </Grid>
              <Modal className={newClasses.serverModal} open={renameServerModal} onClose={renameServerModalClose}>
                <div
                  style={{
                    minWidth: "400px",
                    minHeight: "150px",
                    padding: "12px 24px",
                    border: "1px solid #373738",
                    borderRadius: "3px",
                    background: "#212121",
                  }}
                >
                  <Grid style={{ margin: "10px" }}>{t("Submit Project Name")}</Grid>
                  <Grid>
                    <TextField id="inputJupyterNewName" fullWidth={true} onChange={(e) => setRenameText(e.target.value)} inputProps={{ className: newClasses.renameModalText }} variant="outlined" placeholder={t("Enter a new project name.")} />
                  </Grid>
                  <Grid container justifyContent="center">
                    <Button
                      id="confirmJupyterNewName"
                      className={classes.defaultGreenOutlineButton}
                      style={{ marginRight: "10px" }}
                      onClick={() => {
                        //이름 변경 API
                        api
                          .putJupyterProject(props.match.params.id, {
                            projectName: renameText,
                          })
                          .then((res) => {
                            dispatch(openSuccessSnackbarRequestAction(t("The project name has been changed.")));
                            setProjectName(renameText);
                          })
                          .catch((err) => {
                            dispatch(openErrorSnackbarRequestAction(t("Failed to change project name.")));
                          });

                        setRenameServerModal(false);
                      }}
                    >
                      {t("Change name")}
                    </Button>
                    <Button id="cancelJupyterNewName" className={classes.defaultF0F0OutlineButton} onClick={() => setRenameServerModal(false)}>
                      {t("Cancel")}
                    </Button>
                  </Grid>
                </div>
              </Modal>
            </Grid>
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              style={{
                height: process.env.REACT_APP_ENTERPRISE ? "0px" : "400px",
                margin: 20,
              }}
            >
              {process.env.REACT_APP_ENTERPRISE !== "true" && (
                <Grid container justifyContent="center" alignItems="center" style={{ height: "400px" }}>
                  {statistic !== null ? (
                    <>
                      <div
                        style={{
                          position: "absolute",
                          marginLeft: "870px",
                          marginBottom: "370px",
                          zIndex: "3",
                        }}
                      >
                        <FullscreenIcon
                          onClick={() => {
                            setIsFullSizeStatisticModal(true);
                            // let wnd = window.open("");
                            // wnd.document.write(
                            //   `<html><head><title>${t("Custom training")} ${t(
                            //     "대시보드"
                            //   )}</title></head><body><img src=${statistic}></body></html>`
                            // );
                          }}
                          className={classes.searchIcon}
                        />
                      </div>
                      <div
                        style={{
                          height: "400px",
                          position: "absolute",
                          zIndex: "2",
                        }}
                      >
                        <img ref={imgRef} className={statistic !== null ? classes.statisticImgBlock : classes.statisticImgNone} src={statistic} />
                      </div>
                    </>
                  ) : (
                    <div className={classes.loading}>
                      <CircularProgress />
                    </div>
                  )}
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid container item xs={12} justifyContent="center" alignItems="flex-start" style={defaultStyles.Grid_bottom}>
            {/*하단 : 서버 인터페이스 */}

            <iframe src={monitoring_url + "/tv.html"} width="100%" height="400" />
            <Grid container item xs={12} justifyContent="center" alignItems="flex-start" className={process.env.REACT_APP_ENTERPRISE ? classes.bottomServer_enterprise : classes.bottomServer}>
              <Grid container item xs={12} justifyContent="center" alignItems="center">
                <Table
                  style={{
                    width: "100%",
                  }}
                  className={classes.table}
                  aria-label="simple table"
                >
                  <TableHead>
                    <TableRow>
                      {tableHeads.map((head, idx) => {
                        if (head.condition)
                          return (
                            <TableCell key={`tableHeadCell_${idx}`} className={classes.tableHead} align="center" style={{ cursor: "default" }}>
                              <div className={classes.tableHeader}>
                                <b>{t(head.label)}</b>
                              </div>
                            </TableCell>
                          );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody
                    style={{
                      height: process.env.REACT_APP_ENTERPRISE ? "58px" : "240px",
                      overflow: "scroll",
                    }}
                  >
                    {instances.map((instance, idx) => (
                      <TableRow
                        key={idx}
                        className={selectedIndex === idx ? classes.tableFocused : classes.tableRow}
                        onClick={() => {
                          if (deleteServerModal === false && idx !== selectedIndex) {
                            setSelectedIndex(idx);
                          }
                        }}
                      >
                        <TableCell className={classes.tableRowCell} align="center" style={{ width: "10%" }}>
                          <div style={{ wordBreak: "break-all" }}>{idx}</div>
                        </TableCell>
                        {process.env.REACT_APP_ENTERPRISE !== "true" ? (
                          <>
                            <TableCell className={classes.tableRowCell} align="center" style={{ width: "10%" }}>
                              <div style={{ wordBreak: "break-all" }}>{instance.Placement?.AvailabilityZone}</div>
                            </TableCell>
                            <TableCell className={classes.tableRowCell} align="center" style={{ width: "10%" }}>
                              <div style={{ wordBreak: "break-all" }}>{instance.InstanceId}</div>
                            </TableCell>
                            <TableCell className={classes.tableRowCell} align="center" style={{ width: "10%" }}>
                              <div style={{ wordBreak: "break-all" }}>{instance.InstanceType}</div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className={classes.tableRowCell} align="center" style={{ width: "10%" }}>
                              <div style={{ wordBreak: "break-all" }}>{instance.port}</div>
                            </TableCell>
                            <TableCell className={classes.tableRowCell} align="center" style={{ width: "10%" }}>
                              <div style={{ wordBreak: "break-all" }}>{instance.gpu == "" ? t("All") : instance.gpu}</div>
                            </TableCell>
                          </>
                        )}

                        <TableCell className={classes.tableRowCell} align="center" style={{ width: "10%" }}>
                          <div id="instanceStatus" style={{ wordBreak: "break-all" }}>
                            {instance?.State?.Name == "running" ? t("running") : instance?.State?.Name == "pending" ? t("pending") : instance?.State?.Name == "stopping" ? t("stopping") : instance?.State?.Name == "stopped" ? t("stopped") : t("terminating") //terminated
                            }
                          </div>
                        </TableCell>
                        {/* <TableCell
                          className={classes.tableRowCell}
                          align="center"
                          style={{ width: "10%" }}
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
                                className={`${classes.modelTab} ${classes.modelTabHighlightButton}`}
                                onClick={() => {
                                  if (process.env.REACT_APP_ENTERPRISE) {
                                    window.open(
                                      backendurl.split(":13002")[0] + ":13003"
                                    );
                                  } else {
                                    setSelectedIndex(idx);
                                  }
                                }}
                              >
                                {process.env.REACT_APP_ENTERPRISE
                                  ? t("Monitoring")
                                  : selectedIndex === idx
                                  ? t("Selected")
                                  : t("Choose")}
                              </div>
                            </div>
                          </div>
                        </TableCell> */}
                        {process.env.REACT_APP_ENTERPRISE !== "true" && (
                          <TableCell className={classes.tableRowCell} align="center" style={{ width: "10%" }}>
                            <Button
                              className={classes.defaultGreenOutlineButton}
                              onClick={() => {
                                if (["running", "stopped"].indexOf(instance?.State?.Name) !== -1) {
                                  setServerStatusModal(true);
                                }
                              }}
                            >
                              {instance?.State?.Name == "running" ? t("stop") : instance?.State?.Name == "stopping" ? t("stopping") : instance?.State?.Name == "stopped" ? t("resume") : instance?.State?.Name == "pending" ? t("pending") : t("terminating")}
                            </Button>
                            <Modal
                              className={newClasses.serverModal}
                              open={isSwitchLoading}
                              style={{ backgroundColor: "#11ffee00;" }}
                              //onClose={deleteServerModalClose}
                            >
                              <div
                                style={{
                                  paddingTop: "10px",
                                  textAlign: "center",
                                  alignItems: "center",
                                  width: "400px",
                                  height: "200px",
                                  border: "1px solid #FFFFFF",
                                  borderRadius: "3px",
                                  backgroundColor: "#212121",
                                  borderColor: "#373738",
                                }}
                              >
                                {t(switchStatus)}
                                <div className={classes.loading} style={{ height: "150px" }}>
                                  <CircularProgress size={20} />
                                </div>
                              </div>
                            </Modal>
                          </TableCell>
                        )}
                        <TableCell className={classes.tableRowCell} align="center" style={{ width: "10%" }}>
                          <Button
                            className={instance?.State?.Name === "running" ? classes.defaultGreenOutlineButton : classes.defaultDisabledButton}
                            onClick={() => {
                              instance?.State?.Name === "running" && (process.env.REACT_APP_ENTERPRISE !== "true" ? executeJupyter(instance.PublicIpAddress) : executeJupyter(backendurl.split("//")[1].split(":")[0], instance.port));
                            }}
                          >
                            {instance?.State?.Name == "running" ? t("Jupyter") : instance?.State?.Name == "pending" ? t("pending") : instance?.State?.Name == "stopping" ? t("stopping") : instance?.State?.Name == "stopped" ? t("stopped") : t("terminating") //terminated
                            }
                          </Button>
                        </TableCell>
                        {process.env.REACT_APP_ENTERPRISE !== "true" && (
                          <TableCell className={classes.tableRowCell} align="center" style={{ width: "10%" }}>
                            <Button
                              id="jupyterDelete"
                              className={classes.defaultDeleteButton}
                              onClick={() => {
                                ["pending", "terminated"].indexOf(instance?.State.Name) == -1 && setDeleteServerModal(true);
                              }}
                              style={{ color: "red", borderColor: "red" }}
                            >
                              {instance?.State?.Name == "pending" ? t("pending") : instance?.State?.Name == "terminated" ? t("terminating") : t("Terminate")}
                            </Button>
                            <Modal
                              className={newClasses.serverModal}
                              open={deleteServerModal}
                              //onClose={deleteServerModalClose}
                            >
                              <div
                                style={{
                                  width: "400px",
                                  height: "200px",
                                  border: "1px solid #FFFFFF",
                                  borderRadius: "3px",
                                  backgroundColor: "#212121",
                                  borderColor: "#373738",
                                }}
                              >
                                {deleteLoading !== true ? (
                                  <Grid container item xs={12} justifyContent="center" alignItems="center">
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
                                      {t("Are you sure you want to delete the server?")}
                                    </Grid>
                                    {/* <Grid
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
                                        Instance ID : ${instance?.InstanceId}
                                      </Grid> */}
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
                                        onChange={(e) => {
                                          setDeleteText(e.target.value);
                                        }}
                                        inputProps={{
                                          className: newClasses.deleteModalText,
                                        }}
                                        variant="outlined"
                                        placeholder={t("Enter 'Delete' correctly.")}
                                      />
                                    </Grid>
                                    <Grid container item xs={11} justifyContent="flex-start" alignItems="flex-start">
                                      <div style={{ wordBreak: "break-all" }}>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <Button
                                            className={classes.defaultGreenOutlineButton}
                                            style={{ textAlign: "center" }}
                                            onClick={() => {
                                              if (deleteText == "Delete" && deleteLoading == false && instance.State.Name !== "shutting-down") {
                                                setDeleteLoading(true);
                                                shutdownJupyter(instances[selectedIndex]);
                                                instances[selectedIndex].State.Name = "shutting-down";
                                                setDeleteTextError(false);
                                                //setDeleteServerModal(false); 로딩 끝나면 닫기
                                              } else {
                                                setDeleteTextError(true);
                                              }
                                            }}
                                          >
                                            {t("Yes")}
                                          </Button>
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
                                          <Button className={classes.defaultF0F0OutlineButton} style={{ textAlign: "center" }} onClick={deleteServerModalClose}>
                                            {t("No")}
                                          </Button>
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
                                      {t("Deleting the server.")}
                                    </Grid>
                                    {isGettingStatus === true && (
                                      <Grid
                                        container
                                        item
                                        xs={11}
                                        justifyContent="flex-start"
                                        alignItems="flex-start"
                                        style={{
                                          fontSize: "15px",
                                          color: "#FFFFFF",
                                          marginTop: "5px",
                                        }}
                                      >
                                        {t("Updating project information")}
                                      </Grid>
                                    )}
                                    <Grid container item xs={12} justifyContent="center" alignItems="flex-start">
                                      <div className={classes.loading} style={{ height: "150px" }}>
                                        <CircularProgress size={20} />
                                      </div>
                                    </Grid>
                                  </Grid>
                                )}
                              </div>
                            </Modal>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {project && process.env.REACT_APP_ENTERPRISE !== "true" && (
                      <TableRow className={classes.tableRow}>
                        <TableCell className={classes.tableRowCell} align="center">
                          <Button
                            id="jupyterInstanceCreate"
                            className={classes.defaultGreenOutlineButton}
                            onClick={() => {
                              addServer();
                            }}
                          >
                            {t("Add Server")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
            <Modal
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
              open={isFullSizeStatisticModal}
              // onClose={() => {
              //   setIsFullSizeStatisticModal(false);
              // }}
              className={classes.modalContainer}
            >
              <Grid item container xs={12} justifyContent="center" alignItems="center">
                <Grid item container xs={10} justifyContent="center" alignItems="center">
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
            <Modal className={newClasses.serverModal} style={{ backgroundColor: "#11ffee00;" }} open={serverStatusModal}>
              <div
                style={{
                  width: "400px",
                  height: "130px",
                  border: "1px solid #FFFFFF",
                  borderRadius: "3px",
                  backgroundColor: "#212121",
                  borderColor: "#373738",
                }}
              >
                <Grid container item xs={12} justifyContent="center" alignItems="center">
                  <Grid
                    container
                    item
                    xs={11}
                    justifyContent="center"
                    style={{
                      fontSize: "20px",
                      color: "#FFFFFF",
                      marginTop: "30px",
                      marginBottom: "20px",
                    }}
                  >
                    {instances[selectedIndex]?.State?.Name === "running" ? t("Do you want to stop the server?") : t("Do you want to resume the server?")}
                  </Grid>
                  <Grid container item xs={11} justifyContent="center" alignItems="flex-start">
                    <div style={{ wordBreak: "break-all" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Grid container item xs={12} justifyContent="space-evenly" alignItems="center" style={{ marginTop: "5px" }}>
                          <Button
                            style={{ color: "#FFFFFF", marginRight: "10px" }}
                            onClick={() => {
                              if (instances[selectedIndex]?.State?.Name === "running") {
                                setIsSwitchLoading(true);
                                setSwitchStatus("서버를 중지중입니다.");
                                api
                                  .stopJupyterServer(instances[selectedIndex].InstanceId)
                                  .then(() => {
                                    api
                                      .getJupyterServerStatus(props.match.params.id)
                                      .then((res) => {
                                        setInstances(res.data);
                                        setIsSwitchLoading(false);
                                        setServerStatusModal(false);
                                      })
                                      .catch((err) => {
                                        dispatch(openErrorSnackbarRequestAction(user.language == "ko" ? err?.response?.data?.message : err?.response?.data?.message_en));
                                        setIsSwitchLoading(false);
                                      });
                                  })
                                  .catch((err) => {
                                    dispatch(openErrorSnackbarRequestAction(user.language == "ko" ? err?.response?.data?.message : err?.response?.data?.message_en));
                                    setIsSwitchLoading(false);
                                  });
                              } else if (instances[selectedIndex]?.State?.Name === "stopped") {
                                setIsSwitchLoading(true);
                                setSwitchStatus("서버를 재개중입니다.");
                                api
                                  .resumeJupyterServer(instances[selectedIndex].InstanceId)
                                  .then(() => {
                                    api
                                      .getJupyterServerStatus(props.match.params.id)
                                      .then((res) => {
                                        setInstances(res.data);
                                        setIsSwitchLoading(false);
                                        setServerStatusModal(false);
                                      })
                                      .catch((err) => {
                                        dispatch(openErrorSnackbarRequestAction(user.language == "ko" ? err?.response?.data?.message : err?.response?.data?.message_en));
                                        setIsSwitchLoading(false);
                                      });
                                  })
                                  .catch((err) => {
                                    dispatch(openErrorSnackbarRequestAction(user.language == "ko" ? err?.response?.data?.message : err?.response?.data?.message_en));
                                    setIsSwitchLoading(false);
                                  });
                              } else {
                              }
                            }}
                          >
                            {t("Yes")}
                          </Button>
                          <Button style={{ color: "#FFFFFF", marginLeft: "10px" }} onClick={serverStatusModalClose}>
                            {t("No")}
                          </Button>
                        </Grid>
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </div>
            </Modal>
          </Grid>
        </Grid>
      ) : (
        <Grid container item xs={12} justifyContent="center" alignItems="center">
          <div className={classes.loading}>
            <CircularProgress />
          </div>
        </Grid>
      )}
    </>
  );
};
export default History;
