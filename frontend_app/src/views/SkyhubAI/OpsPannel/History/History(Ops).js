import React, { useEffect, useState } from "react";

//components
import ServerForm from "./ServerForm/ServerForm";

//@material-ui
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import Button from "components/CustomButtons/Button";
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
import { fileurl } from "controller/api";
//redux
import { useDispatch } from "react-redux";
import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";

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
    height: "300px",
    marginRight: "4px",
    marginLeft: "4px",
  },
  Grid_bottomServer: {
    borderRight: "1px solid #FFFFFF",
    height: "300px",
  },
};

const History = (props) => {
  const dispatch = useDispatch();
  const classes = currentTheme();
  const newClasses = useStyle();
  const { t } = useTranslation();
  const { history, project, ...other } = props;

  const [instances, setInstances] = useState([]); //더미데이터: 초기에 아무것도 없는 여러개 이것 때문에 뜸
  const [inferenceCount, setInferenceCount] = useState(0);
  const [statistic, setStatistic] = useState(loader);

  const [groupModal, setGroupModal] = useState(false); //opsPannel에 필요한 요소
  //sample dataaa
  const loader = fileurl + "asset/front/img/loader.svg";

  useEffect(() => {
    if (project?.id) {
      api.getJupyterServerStatus(project?.id).then((res) => {
        setInstances(res.data);
      });
    }
  }, [project]);

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

  const shutdownOps = (instanceId) => {
    api
      .shutdownOpsServerGroup({ instanceId: instanceId })
      .then((response) => {
        dispatch(
          openSuccessSnackbarRequestAction(t("Server deletion successful."))
        );
        window.location.reload();
      })
      .catch((e) => {
        setDeleteLoading(false);
        dispatch(
          openErrorSnackbarRequestAction(t("Deletion of server failed."))
        );
      });
  };
  useEffect(() => {
    if (project) {
      let instancesRaw = [];
      project.instances.forEach((instance, index) => {
        instance.isSelected = index === 0;
        instancesRaw.push(instance);
      });
      setInstances(instancesRaw);
      if (project.inferenceCount) {
        setInferenceCount(project.inferenceCount);
      }
    }
  }, [project]);

  useEffect(() => {
    api
      .getOpsServerStatistic(instances[selectedIndex]?.InstanceId)
      .then((response) => {
        return new Blob([response.data]);
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        setStatistic(url);
      });
  }, [selectedIndex]);

  const getAsyncTaskData = () => {
    if (project?.id) {
      api.getOpsServerStatus(project?.id).then((res) => {
        setInstances(res.data);
      });
    }
    if (instances) {
      api
        .getOpsServerStatistic(instances[selectedIndex]?.InstanceId)
        .then((response) => {
          return new Blob([response.data]);
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          setStatistic(url);
        });
    }
  };

  useEffect(() => {
    // const timer = setInterval(getAsyncTaskData, 60); // 알림 정보 60초 단위로 가져오기
    const timer = setInterval(getAsyncTaskData, 60 * 1000); // 알림 정보 60초 단위로 가져오기
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Grid container item xs={12} justify="center" alignItems="center">
      <Grid
        container
        item
        xs={12}
        justify="center"
        alignItems="center"
        style={defaultStyles.Grid_border}
      >
        {/*상단 : 그래프, api 호출 수*/}
        <Grid
          container
          item
          xs={8}
          justify="center"
          alignItems="center"
          style={defaultStyles.Grid_300}
        >
          <img src={statistic} width="100%" height="300px" />
        </Grid>
        <Grid
          container
          item
          xs={4}
          justify="center"
          alignItems="center"
          style={defaultStyles.Grid_300}
        >
          <Grid container item xs={12} justify="center" alignItems="flex-start">
            <div style={{ fontSize: "30px", color: "#FFFFFF" }}>
              {t("API Calls")}
            </div>
          </Grid>
          <div style={defaultStyles.div_apiStack}>
            <Grid
              item
              container
              xs={12}
              justify="center"
              alignItems="center"
              style={defaultStyles.Grid_circle}
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
        justify="center"
        alignItems="center"
        style={defaultStyles.Grid_bottom}
      >
        {/*하단 : 서버 인터페이스 */}
        <Grid
          container
          item
          xs={7}
          justify="center"
          alignItems="flex-start"
          style={defaultStyles.Grid_bottomServer}
        >
          <Table
            style={{ width: "98%", marginTop: "10px" }}
            className={classes.table}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                <TableCell
                  className={classes.tableHead}
                  style={{ width: "7.5%" }}
                  align="center"
                >
                  <b style={{ color: currentThemeColor.textMediumGrey }}>No</b>
                </TableCell>
                <TableCell
                  className={classes.tableHead}
                  align="center"
                  style={{ width: "30%", cursor: "pointer" }}
                >
                  <div className={classes.tableHeader}>
                    <b>{t("Instance ID")}</b>
                  </div>
                </TableCell>
                <TableCell
                  className={classes.tableHead}
                  align="center"
                  style={{ width: "30%", cursor: "pointer" }}
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
                  style={{ width: "20%", cursor: "pointer" }}
                >
                  <div className={classes.tableHeader}></div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {instances.map((instance, idx) => (
                <TableRow
                  key={idx}
                  className={
                    idx.isSelected ? classes.tableFocused : classes.tableRow
                  }
                >
                  <TableCell className={classes.tableRowCell} align="center">
                    <div style={{ wordBreak: "break-all" }}>{idx}</div>
                  </TableCell>
                  <TableCell className={classes.tableRowCell} align="center">
                    <div style={{ wordBreak: "break-all" }}>
                      {instance.InstanceId}
                    </div>
                  </TableCell>
                  <TableCell className={classes.tableRowCell} align="center">
                    <div style={{ wordBreak: "break-all" }}>
                      {instance.InstanceType}
                    </div>
                  </TableCell>
                  <TableCell className={classes.tableRowCell} align="center">
                    <div style={{ wordBreak: "break-all" }}>
                      {instance.HealthStatus}
                    </div>
                  </TableCell>
                  <TableCell className={classes.tableRowCell} align="center">
                    <div style={{ wordBreak: "break-all" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          className={`${classes.modelTab} analyticsBtn ${classes.modelTabHighlightButton}`}
                        >
                          {instance.isSelected ? t("Selected") : t("선택하기")}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
        <Grid container item xs={5} justify="center" alignItems="center">
          <Grid
            container
            item
            xs={12}
            justify="space-evenly"
            alignItems="center"
            direction="column"
            style={{ height: "300px" }}
          >
            <Button className={classes.bottomButton}>{t("Predict")}</Button>
            <Button className={classes.bottomButton}>
              {t("Instance Change")}
            </Button>
            <Button
              className={classes.bottomButton}
              onClick={() => goToLabelProject()}
            >
              {t("Retraining Labeling")}
            </Button>
            <Button className={classes.bottomButton}>
              {t("API sales")}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default History;
