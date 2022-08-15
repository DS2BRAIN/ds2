import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

//API
import { getServerPricing } from "../../../controller/api";

//@material-ui
import CloseIcon from "@material-ui/icons/Close";
import TextField from "@material-ui/core/TextField";
import StarIcon from "@material-ui/icons/Star";
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import Modal from "@material-ui/core/Modal";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CircularProgress from "@mui/material/CircularProgress";

import Section_1 from "./Section_1/Section_1";
import Section_2 from "./Section_2/Section_2";
import * as api from "../../../controller/api";
import { getProjectRequestAction } from "../../../redux/reducers/projects";
import { getModelRequestAction } from "../../../redux/reducers/models";
import Button from "components/CustomButtons/Button";

//@material-ui style-form
//none

//css

//redux
import { useDispatch } from "react-redux";
import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import { useTranslation } from "react-i18next";
import { sendErrorMessage } from "components/Function/globalFunc.js";

const useStyle = makeStyles({
  submitButton: {
    background: "linear-gradient(45deg,#3B82F7,#5EC3B5)",
    marginTop: "10px",
    color: "#E2E2E2",
  },
  submitButtonLoading: {
    backgroundColor: "gray",
    marginTop: "10px",
    color: "#E2E2E2",
  },
  Grid_warning: {
    color: "red",
    fontSize: "25px",
    fontWeight: "500",
    marginLeft: "10px",
    marginTop: "10px",
    border: "1px solid red",
    borderRadius: "7px",
    padding: "5px",
  },
});

const defaultStyles = {
  div_title: {
    fontSize: "30px",
    marginBottom: "30px",
    marginTop: "40px",
  },
  div_detail: {
    fontSize: "15px",
    marginBottom: "30px",
    paddingLeft: "10px",
  },
  div_menuBox: {
    marginBottom: "5px",
    marginTop: "5px",
    border: "1px solid #E2E2E2",
  },
  Grid_menuTitle: {
    color: "#E2E2E2",
    fontSize: "20px",
    paddingLeft: "10px",
    height: "50px",
  },
  Grid_selectedTitle: {
    color: "#4FA75C",
    fontSize: "20px",
    paddingLeft: "10px",
    height: "50px",
  },
  Grid_smallText: {
    color: "#E2E2E2",
    fontSize: "12px",
  },
  Grid_smallText_choice: {
    marginTop: "5px",
    paddingLeft: "12px",
    color: "#E2E2E2",
    fontSize: "12px",
  },
};

const NewJupyterProject = (props) => {
  const { user } = useSelector((state) => ({ user: state.user }), []);
  const classes = useStyle();
  const accrodionRef = useRef();
  const [warning, setWarning] = useState("");
  const [projectName, setProjectName] = useState(
    `${Math.random()
      .toString(36)
      .substr(2, 8)}_${new Date().getTime()}`
  ); //프로젝트 이름
  const [cloudRegion, setCloudRegion] = useState({}); //Section_1 선택의 최종 결과물
  const [cloudDetail, setCloudDetail] = useState(null); //Section_2 선택의 최종 결과물
  const [projectId, setProjectId] = useState(null);
  const [cloudContinents, setCloudContinents] = useState(null); //국가 코드 배열
  const [cloudContinentsDetail, setCloudContinentsDetail] = useState(null); //국가 코드 JSON
  const [loading, setLoading] = useState(false);
  const portRef = useRef();
  const gpuRef = useRef();
  const path = window.location.pathname;
  const [finish, setFinish] = useState(null);
  const [validPorts, setValidPorts] = useState([]);
  const [isPortLoading, setIsPortLoading] = useState(false);
  const [isPortModal, setIsPortModal] = useState(false);
  const { t } = useTranslation();

  const dispatch = useDispatch();

  useEffect(() => {
    setCloudDetail(null);
  }, [cloudRegion]);
  useEffect(() => {
    if (finish !== null) {
      props.history.push("/admin/jupyterproject/" + finish);
      //window.location.reload();
    }
  }, [finish]);

  useEffect(() => {
    let transAsync = async () => {
      let pricingData = await getServerPricing();
      setCloudContinents(
        Object.entries(pricingData.data)
          .sort((a, b) => b[1].length - a[1].length)
          .map((a) => a[0])
      ); //API 수정후 적용할곳
      //setCloudContinents(Object.entries(TEST_REGION).sort((a,b)=>b[1].length-a[1].length).map(a=>a[0]));
      setCloudContinentsDetail(pricingData.data);
    };
    transAsync();
  }, []);

  // useEffect(() => {
  //   accrodionRef.current.click();
  // }, []);

  useEffect(() => {
    api.getServerPricing().then((res) => console.log(res));
    const pathArr = path.split("/");
    if (pathArr[pathArr.length - 1].indexOf("newjupyterproject") === -1) {
      setProjectId(pathArr[pathArr.length - 1]);
    }
  }, [path]);

  const getPortModal = () => {
    setIsPortLoading(true);
    setIsPortModal(true);
    api
      .getUsedJupyterPorts()
      .then((res) => {
        let tmpPorts = [];
        for (let i = 13010; i < 13030; i++) {
          if (res.data.indexOf(i) == -1) {
            tmpPorts.push(i);
          }
        }
        setValidPorts(tmpPorts);
      })
      .catch((err) => {
        dispatch(
          openErrorSnackbarRequestAction(
            t("An error occurred while searching for the port number in use.")
          )
        );
        setIsPortModal(false);
      })
      .finally(() => {
        setIsPortLoading(false);
      });
  };

  const setSelectedPort = (port) => {
    portRef.current.value = port;
    setIsPortModal(false);
  };

  const createProject = () => {
    if (projectId) {
      if (
        process.env.REACT_APP_ENTERPRISE !== "true" &&
        cloudRegion.display_name === undefined
      ) {
        dispatch(openErrorSnackbarRequestAction(t("Select Region.")));
      } else if (
        process.env.REACT_APP_ENTERPRISE !== "true" &&
        cloudDetail === null
      ) {
        dispatch(
          openErrorSnackbarRequestAction(t("Select Server Tier."))
        );
      } else if (
        process.env.REACT_APP_ENTERPRISE == "true" &&
        !portRef?.current?.value
      ) {
        dispatch(
          openErrorSnackbarRequestAction(t("Select Port Number"))
        );
      } else if (
        process.env.REACT_APP_ENTERPRISE == "true" &&
        (13010 > parseInt(portRef?.current?.value) ||
          parseInt(portRef?.current?.value) > 13029)
      ) {
        dispatch(
          openErrorSnackbarRequestAction(
            t("Only port numbers in the range of 13010 to 13029 are available.")
          )
        );
      } else {
        setWarning("");
        if (
          process.env.REACT_APP_ENTERPRISE !== "true" &&
          (user.cardInfo == null || user.cardInfo.cardName == null)
        ) {
          if (process.env.REACT_APP_ENTERPRISE !== "true") {
            props.history.push(`/admin/setting/payment/?message=need`);
            return;
          }
        }
        setLoading(true);
        api
          .postJupyterServer({
            jupyterProjectId: projectId,
            region: cloudRegion?.region,
            serverType: cloudDetail?.serverType,
            port:
              process.env.REACT_APP_ENTERPRISE == "true"
                ? parseInt(portRef.current.value)
                : 0,
            gpu:
              process.env.REACT_APP_ENTERPRISE == "true"
                ? gpuRef?.current?.value
                : "",
          })
          .then((res) => {
            dispatch(
              openSuccessSnackbarRequestAction(
                t("A new server has been created in the project.")
              )
            );
            setFinish(projectId);
          })
          .catch((error) => {
            if (error?.response?.data?.result == "fail") {
              if (process.env.REACT_APP_ENTERPRISE !== "true") {
                props.history.push(`/admin/setting/payment/?message=need`);
              } else {
                //카드등록에러 처리(엔터프라이즈)
              }
            } else {
              dispatch(
                openErrorSnackbarRequestAction(
                  t(
                    error?.response.data?.msg !== undefined
                      ? error?.response?.data.msg
                      : error.response.data.message !== undefined
                      ? user.language === "ko"
                        ? error.response.data.message
                        : error.response.data.message_en
                      : "오류가 발생했습니다. 잠시 후에 다시 시도해주시길 바랍니다"
                  )
                )
              );
            }
            setLoading(false);
          });
        return;
      }
    } else {
      if (projectName === "") {
        dispatch(
          openErrorSnackbarRequestAction(t("Input Your Project Name."))
        );
      } else if (
        process.env.REACT_APP_ENTERPRISE !== "true" &&
        cloudRegion.display_name === undefined
      ) {
        dispatch(openErrorSnackbarRequestAction(t("Select Region.")));
      } else if (
        process.env.REACT_APP_ENTERPRISE !== "true" &&
        cloudDetail === null
      ) {
        dispatch(
          openErrorSnackbarRequestAction(t("Select Server Tier."))
        );
      } else if (
        process.env.REACT_APP_ENTERPRISE == "true" &&
        !portRef?.current?.value
      ) {
        dispatch(
          openErrorSnackbarRequestAction(t("Select Port Number"))
        );
      } else if (
        process.env.REACT_APP_ENTERPRISE == "true" &&
        (13010 > parseInt(portRef?.current?.value) ||
          parseInt(portRef?.current?.value) > 13029)
      ) {
        dispatch(
          openErrorSnackbarRequestAction(
            t("Only port numbers in the range of 13010 to 13029 are available.")
          )
        );
      } else {
        setWarning("");
        //생성 API 호출부분
        // window.alert("프로젝트 생성 API 호출(추가내용)");
        setLoading(true);
        if (
          process.env.REACT_APP_ENTERPRISE !== "true" &&
          (user.cardInfo == null || user.cardInfo.cardName == null)
        ) {
          if (process.env.REACT_APP_ENTERPRISE !== "true") {
            props.history.push(`/admin/setting/payment/?message=need`);
            return;
          }
        }
        api
          .postJupyterProject({
            projectName: projectName,
            region: cloudRegion?.region ? cloudRegion?.region : "",
            serverType: cloudDetail?.serverType ? cloudDetail?.serverType : "",
            port:
              process.env.REACT_APP_ENTERPRISE == "true"
                ? parseInt(portRef?.current?.value)
                : 0,
            gpu:
              process.env.REACT_APP_ENTERPRISE == "true"
                ? gpuRef?.current?.value
                : "",
          })
          .then((res) => {
            dispatch(
              openSuccessSnackbarRequestAction(
                t("A new project has been created.")
              )
            );
            setFinish(res.data.id);
          })
          .catch((error) => {
            if (error?.response?.data?.result == "fail") {
              if (process.env.REACT_APP_ENTERPRISE !== "true") {
                props.history.push(`/admin/setting/payment/?message=need`);
              } else {
                //카드등록에러 처리(엔터프라이즈)
              }
            } else {
              dispatch(
                openErrorSnackbarRequestAction(
                  t(
                    error?.response.data?.msg !== undefined
                      ? error?.response?.data.msg
                      : error.response.data.message !== undefined
                      ? user.language === "ko"
                        ? error.response.data.message
                        : error.response.data.message_en
                      : "오류가 발생했습니다. 잠시 후에 다시 시도해주시길 바랍니다"
                  )
                )
              );
            }
            setLoading(false);
          });
      }
    }
  };

  return (
    <div>
      <div style={defaultStyles.div_title}>{t("Create a Training Server")}</div>
      <div style={defaultStyles.div_detail}>
        {process.env.REACT_APP_ENTERPRISE !== "true" &&
          t(
            "가장 인기있는 몇 가지 옵션을 권장하지만 필요에 따라 서버를 자유롭게 맞춤 설정할 수 있습니다."
          )}
      </div>
      {/* Cloud Provider & Region   :  Section_1 */}
      <div>
        <Grid
          container
          item
          xs={12}
          justify="space-between"
          alignItems="center"
        >
          <Grid
            ref={accrodionRef}
            item
            container
            xs={process.env.REACT_APP_ENTERPRISE !== "true" ? 5 : 12}
            alignItems="center"
            style={defaultStyles.Grid_menuTitle}
          >
            {process.env.REACT_APP_ENTERPRISE !== "true"
              ? t("Cloud Provider & Region")
              : t("Choose a cloud-provided port and GPU.")}
          </Grid>
          {cloudRegion && (
            <Grid
              id="cloudRegionConfirm"
              item
              container
              justify="flex-end"
              xs={6}
              style={defaultStyles.Grid_selectedTitle}
            >{`${
              cloudRegion.display_name !== undefined
                ? cloudRegion.display_name
                : ""
            }`}</Grid>
          )}
        </Grid>
        {cloudContinents !== null && (
          <Section_1
            setWarning={setWarning}
            project={[projectName, setProjectName]}
            cloudRegion={[cloudRegion, setCloudRegion]}
            cloudContinents={[cloudContinents, setCloudContinents]}
            cloudContinentsDetail={[
              cloudContinentsDetail,
              setCloudContinentsDetail,
            ]}
            projectId={projectId}
          />
        )}
      </div>

      {/* Cluster Tierr    :  Section_2   */}

      {Object.keys(cloudRegion).length !== 0 && (
        <div style={{ marginTop: "20px" }}>
          <Grid
            container
            item
            xs={12}
            justify="space-between"
            alignItems="center"
          >
            <Grid
              item
              container
              xs={3}
              alignItems="center"
              style={defaultStyles.Grid_menuTitle}
            >
              {t("Server Tier")}
            </Grid>
            {cloudDetail && (
              <Grid
                id="cloudServerConfirm"
                item
                container
                justify="flex-end"
                xs={9}
                style={defaultStyles.Grid_selectedTitle}
              >{`${cloudDetail.serverType}(${cloudDetail.memory} Memory, ${cloudDetail.storage} Storage, ${cloudDetail.vCPU} vCPU)`}</Grid>
            )}
          </Grid>
          {cloudContinents !== null && cloudRegion !== null && (
            <Section_2
              setWarning={setWarning}
              cloudDetail={[cloudDetail, setCloudDetail]}
              cloudContinents={[cloudContinents, setCloudContinents]}
              cloudContinentsDetail={[
                cloudContinentsDetail,
                setCloudContinentsDetail,
              ]}
              cloudRegion={[cloudRegion, setCloudRegion]}
            />
          )}
        </div>
      )}
      {process.env.REACT_APP_ENTERPRISE !== "true" ? (
        <>
          <Grid
            container
            item
            xs={12}
            alignItems="left"
            style={{ marginTop: 15, marginBottom: 15 }}
          >
            {t(
              "종량제입니다. 시간당 비용이 청구되며 언제든지 서버를 종료 할 수 있습니다."
            )}
            {t("Excludes variable data Transfer, backup, and taxes.")}
            {warning !== "" && (
              <Grid
                className={classes.Grid_warning}
                container
                item
                xs={4}
                justify="center"
                alignItems="center"
              >
                {t(warning)}
              </Grid>
            )}
          </Grid>

          <Grid
            container
            item
            xs={12}
            alignItems="left"
            style={{ marginTop: 15, marginBottom: 15 }}
          >
            {t("Total Cost") +
              ` : ${
                cloudDetail !== null
                  ? user.language == "ko"
                    ? (
                        cloudDetail?.pricePerHourSelfModeling * 1200 -
                        0.5
                      ).toFixed(0)
                    : (cloudDetail?.pricePerHourSelfModeling - 0.005).toFixed(2)
                  : 0
              }${user.language == "ko" ? " KRW" : "$"}/hour`}
          </Grid>
        </>
      ) : (
        <>
          <Grid container item xs={12} justify="center" alignItems="flex-start">
            <Grid
              container
              item
              xs={12}
              justify="flex-start"
              alignItems="center"
              style={defaultStyles.Grid_smallText}
            >
              <Grid>
                <StarIcon style={{ fontSize: "16px", marginRigth: "2px" }} />
                {t("Port Number") + " (13010~13029)"}
              </Grid>
              <Grid
                alignItems="center"
                style={{
                  fontSize: "14px",
                  color: "#3B8BF7",
                  alignItems: "center",
                  marginLeft: "5px",
                  cursor: "pointer",
                  fontWeight: "800",
                }}
                onClick={getPortModal}
              >
                {t("Select an available port")}
              </Grid>
            </Grid>
            <Grid
              container
              item
              xs={12}
              justify="flex-start"
              alignItems="center"
              style={{ paddingLeft: "10px", marginBottom: "10px" }}
            >
              <TextField
                inputRef={portRef}
                className={classes.text_projectName}
                onChange={(e) => {
                  if (/^[0-9]*$/.test(e.target.value)) {
                    portRef.current.value = e.target.value;
                  } else {
                    dispatch(
                      openErrorSnackbarRequestAction(
                        t("Only numbers can be entered for the port number.")
                      )
                    );
                    portRef.current.value = null;
                  }
                }}
                InputProps={{ disableUnderline: true }}
                placeholder="port number"
                // value={project[0]}
              />
            </Grid>
            <Grid
              container
              item
              xs={12}
              justify="flex-start"
              alignItems="center"
              style={defaultStyles.Grid_smallText_choice}
            >
              {t("GPU Allocation") + " (ex: 0,1)"}
            </Grid>
            <Grid
              container
              item
              xs={12}
              justify="flex-start"
              alignItems="center"
              style={{ paddingLeft: "10px" }}
            >
              <TextField
                inputRef={gpuRef}
                className={classes.text_projectName}
                onChange={(e) => {
                  if (/^[0-9,\,]*$/.test(e.target.value)) {
                    gpuRef.current.value = e.target.value;
                  } else {
                    dispatch(
                      openErrorSnackbarRequestAction(
                        t('Only number or "," can be entered for the GPU.')
                      )
                    );
                    gpuRef.current.value = null;
                  }
                }}
                InputProps={{ disableUnderline: true }}
                placeholder="GPU"
              />
            </Grid>
            <Grid
              container
              item
              xs={12}
              justify="flex-start"
              alignItems="center"
              style={defaultStyles.Grid_smallText_choice}
            >
              {"* " + t("If not entered, all GPUs will be allocated.")}
            </Grid>
          </Grid>
        </>
      )}
      <Grid
        container
        item
        xs={12}
        alignItems="left"
        style={{ marginTop: 15, marginBottom: 15 }}
      >
        <Button
          id="createJupyterButton"
          // onClick={
          //   () => {
          //     dispatch(
          //       openSuccessSnackbarRequestAction(
          //         t("To use the Custom Training, please contact the sales team.")
          //       )
          //     );
          //   }
          // }
          onClick={createProject}
          disabled={loading}
          className={
            loading === false
              ? classes.submitButton
              : classes.submitButtonLoading
          }
        >
          {loading === false ? t("Create Server") : t("로딩중입니다.")}
        </Button>
      </Grid>
      <Modal
        open={isPortModal}
        style={{
          backgroundColor: "#11ffee00;",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClose={() => setIsPortModal(false)}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "10px",
            width: "400px",
            height: "50vh",
            border: "1px solid #FFFFFF",
            borderRadius: "3px",
            backgroundColor: "#212121",
            borderColor: "#373738",
          }}
        >
          {isPortLoading ? (
            <Grid
              container
              justify="center"
              alignItems="center"
              className={classes.loading}
            >
              <CircularProgress size={20} />
            </Grid>
          ) : (
            <Grid container item xs={12} style={{ overflow: "scroll" }}>
              <Grid
                container
                item
                xs={12}
                alignItems="flex-start"
                justify="center"
              >
                {validPorts.length > 0 ? (
                  <Grid
                    container
                    item
                    xs={11}
                    justify="flex-start"
                    alignItems="flex-start"
                    style={{
                      marginBottom: "15px",
                      paddingLeft: "40px",
                      paddingTop: "25px",
                    }}
                  >
                    {t("Select an available port")}
                  </Grid>
                ) : (
                  <Grid
                    container
                    item
                    xs={11}
                    justify="flex-start"
                    alignItems="flex-start"
                    style={{
                      marginBottom: "15px",
                      paddingLeft: "40px",
                      paddingTop: "25px",
                    }}
                  >
                    {t("No ports available.")}
                  </Grid>
                )}
                <div style={{ paddingRight: "4px" }}>
                  <CloseIcon onClick={() => setIsPortModal(false)} />
                </div>
                {validPorts.length > 0 &&
                  validPorts.map((port) => (
                    <Grid
                      container
                      item
                      xs={12}
                      alignItems="center"
                      justify="center"
                    >
                      <Button
                        onClick={() => {
                          setSelectedPort(port);
                        }}
                        style={{
                          color: "#1BC6B4",
                          width: "300px",
                          border: "1px solid #1BC6B4",
                          marginBottom: "4px",
                        }}
                      >
                        {port}
                      </Button>
                    </Grid>
                  ))}
              </Grid>
            </Grid>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default NewJupyterProject;
