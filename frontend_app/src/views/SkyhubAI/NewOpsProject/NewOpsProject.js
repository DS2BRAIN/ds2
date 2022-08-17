import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

//API
import { getServerPricing } from "../../../controller/api";
import * as api from "../../../controller/api";
import { openErrorSnackbarRequestAction, openSuccessSnackbarRequestAction } from "redux/reducers/messages.js";
import { IS_ENTERPRISE } from "variables/common";

//@material-ui
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Section_1 from "./Section_1/Section_1";
import Section_2 from "./Section_2/Section_2";
import { useTranslation } from "react-i18next";

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
};

const NewOpsProject = (props) => {
  const { user } = useSelector((state) => ({ user: state.user }), []);
  const classes = useStyle();
  const [warning, setWarning] = useState("");
  const [projectName, setProjectName] = useState(
    `${Math.random()
      .toString(36)
      .substr(2, 8)}_${new Date().getTime()}`
  );
  const [cloudRegion, setCloudRegion] = useState({}); //Section_1 선택의 최종 결과물
  const [cloudDetail, setCloudDetail] = useState(null); //Section_2 선택의 최종 결과물
  const [projectId, setProjectId] = useState(null);
  const [cloudContinents, setCloudContinents] = useState(null); //국가 코드 배열
  const [cloudContinentsDetail, setCloudContinentsDetail] = useState(null); //국가 코드 JSON
  const [loading, setLoading] = useState(false);
  const portRef = useRef();
  const path = window.location.pathname;
  const [finish, setFinish] = useState(null);
  const [modelId, setModelId] = useState(null);
  const { t } = useTranslation();

  const dispatch = useDispatch();
  //skyhun

  useEffect(() => {
    if (finish !== null) {
      props.history.push("/admin/skyhubai/" + finish);
      //window.location.reload();
    }
  }, [finish]);

  useEffect(() => {
    let deniedRegion;
    if (getQueryParams(document.location.search).regions !== undefined) {
      deniedRegion = JSON.parse(getQueryParams(document.location.search).regions);
    }
    let transAsync = async () => {
      let pricingData = await getServerPricing();
      let pricingName = Object.entries(pricingData.data)
        .sort((a, b) => b[1].length - a[1].length)
        .map((a) => a[0]);
      if (getQueryParams(document.location.search).regions !== undefined) {
        pricingName.forEach((name) => {
          pricingData.data[name] = pricingData.data[name].filter((r) => deniedRegion.indexOf(r.region) == -1);
        });
      }
      //setCloudContinents(Object.entries(TEST_REGION).sort((a,b)=>b[1].length-a[1].length).map(a=>a[0]));
      setCloudContinents(pricingName); //API 수정후 적용할곳
      setCloudContinentsDetail(pricingData.data);
    };
    transAsync();
  }, []);

  useEffect(() => {
    const pathArr = path.split("/");
    if (getQueryParams(document.location.search).regions === undefined) {
      if (pathArr[pathArr.length - 1].indexOf("newskyhubai") === -1) {
        setProjectId(pathArr[pathArr.length - 1]);
      }
    } else {
      if (pathArr[pathArr.length - 2].indexOf("newskyhubai") === -1) {
        setProjectId(pathArr[pathArr.length - 2]);
      }
    }
    var query = getQueryParams(document.location.search);
    setModelId(query.modelid);
  }, [path]);

  const getQueryParams = (qs) => {
    qs = qs.split("+").join(" ");

    var params = {},
      tokens,
      re = /[?&]?([^=]+)=([^&]*)/g;

    while ((tokens = re.exec(qs))) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
  };

  const createProject = () => {
    if (projectId) {
      if (cloudRegion.display_name === undefined) {
        dispatch(openErrorSnackbarRequestAction(t("Select Region.")));
      } else if (cloudDetail === null) {
        dispatch(openErrorSnackbarRequestAction(t("Select Server Tier.")));
      } else {
        setLoading(true);
        setWarning("");
        //생성 API 호출부분
        // window.alert("프로젝트 생성 API 호출(추가내용)");
        // if (user.cardInfo == null || user.cardInfo.cardName == null) {
        //   if (!IS_ENTERPRISE) {
        //     props.history.push(`/admin/setting/payment/?message=need`);
        //     return;
        //   }
        // }
        api
          .postOpsServerGroup({
            opsProjectId: +projectId,
            region: cloudRegion.region,
            serverType: cloudDetail?.serverType,
          })
          .then((res) => {
            dispatch(openSuccessSnackbarRequestAction(t("The inference server has been created.")));
            setFinish(projectId);
            // window.setTimeout(()=>{
            //   props.history.push("/admin/skyhubai/"+projectId)
            // },1000);
          })
          .catch((error) => {
            if (error?.response?.data?.result == "fail") {
              //서버쪽 기존 크레딧 오류 핸들링
              if (!IS_ENTERPRISE) {
                props.history.push(`/admin/setting/payment/?message=need`);
              } else {
                //엔터프라이즈 에러 처리
              }
            } else {
              dispatch(
                openErrorSnackbarRequestAction(
                  t(error?.response.data?.msg !== undefined ? error?.response?.data.msg : error.response.data.message !== undefined ? (user.language === "ko" ? error.response.data.message : error.response.data.message_en) : "오류가 발생했습니다. 잠시 후에 다시 시도해주시길 바랍니다")
                )
              );
            }
            setLoading(false);
          });
      }
    } else {
      if (projectName === "") {
        dispatch(openErrorSnackbarRequestAction(t("Input Your Project Name.")));
      } else if (cloudRegion === null) {
        dispatch(openErrorSnackbarRequestAction(t("Select Region.")));
      } else if (cloudDetail === null && !IS_ENTERPRISE) {
        dispatch(openErrorSnackbarRequestAction(t("Select Server Tier.")));
      } else {
        setWarning("");
        //생성 API 호출부분
        // window.alert("프로젝트 생성 API 호출(추가내용)");
        setLoading(true);
        // if (user.cardInfo == null || user.cardInfo.cardName == null) {
        //   if (!IS_ENTERPRISE) {
        //     props.history.push(`/admin/setting/payment/?message=need`);
        //     return;
        //   }
        // }
        api
          .postOpsProject({
            projectName: projectName,
            region: IS_ENTERPRISE ? "" : cloudRegion.region,
            serverType: IS_ENTERPRISE ? "" : cloudDetail?.serverType,
            modelId: modelId,
          })
          .then((res) => {
            dispatch(openSuccessSnackbarRequestAction(t("A new project has been created.")));
            setFinish(res.data.id);
            // window.setTimeout(()=>{
            //   props.history.push("/admin/skyhubai/"+res.data.id)
            // },1000);
            //props.history.push("/admin/skyhubai/" + res.data.id);
          })
          .catch((error) => {
            if (error.response.data.result == "fail") {
              if (!IS_ENTERPRISE) {
                props.history.push(`/admin/setting/payment/?message=need`);
              } else {
                //엔터프라이즈 에러 처리
              }
            } else {
              dispatch(
                openErrorSnackbarRequestAction(
                  t(error?.response?.data?.msg !== undefined ? error.response.data.msg : error?.response?.data?.message !== undefined ? (user.language === "ko" ? error.response.data.message : error.response.data.message_en) : "오류가 발생했습니다. 잠시 후에 다시 시도해주시길 바랍니다")
                )
              );
            }
            setLoading(false);
          });
      }
    }
  };
  //skyhub
  useEffect(() => {
    setCloudDetail(null);
    return;
  }, [cloudRegion]);

  return (
    <div>
      <div style={defaultStyles.div_title}>{t("Create a Inference Server")}</div>
      <div style={defaultStyles.div_detail}>{!IS_ENTERPRISE && t("가장 인기있는 몇 가지 옵션을 권장하지만 필요에 따라 서버를 자유롭게 맞춤 설정할 수 있습니다.")}</div>
      {/* Cloud Provider & Region   :  Section_1 */}
      <div>
        <Grid container item xs={12} justify="space-between" alignItems="center">
          <Grid item container xs={5} alignItems="center" style={defaultStyles.Grid_menuTitle}>
            {!IS_ENTERPRISE && t("Cloud Provider & Region")}
          </Grid>
          {cloudRegion && <Grid item container justify="flex-end" xs={6} style={defaultStyles.Grid_selectedTitle}>{`${cloudRegion.display_name !== undefined ? cloudRegion.display_name : ""}`}</Grid>}
        </Grid>
        {cloudContinents !== null && (
          <Section_1
            setWarning={setWarning}
            regionParam={props.match.params.regions}
            onlyInstance={projectId}
            project={[projectName, setProjectName]}
            cloudRegion={[cloudRegion, setCloudRegion]}
            cloudContinents={[cloudContinents, setCloudContinents]}
            cloudContinentsDetail={[cloudContinentsDetail, setCloudContinentsDetail]}
            projectId={projectId}
          />
        )}
      </div>

      {/* Cluster Tierr    :  Section_2   */}

      {Object.keys(cloudRegion).length !== 0 && (
        <div style={{ marginTop: "20px" }}>
          <Grid container item xs={12} justify="space-between" alignItems="center">
            <Grid item container xs={3} alignItems="center" style={defaultStyles.Grid_menuTitle}>
              {t("Server Tier")}
            </Grid>
            {cloudDetail && <Grid item container justify="flex-end" xs={9} style={defaultStyles.Grid_selectedTitle}>{`${cloudDetail.serverType}(${cloudDetail.memory} Memory, ${cloudDetail.storage} Storage, ${cloudDetail.vCPU} vCPU)`}</Grid>}
          </Grid>
          {cloudContinents !== null && cloudRegion !== null && (
            <Section_2 setWarning={setWarning} cloudDetail={[cloudDetail, setCloudDetail]} cloudContinents={[cloudContinents, setCloudContinents]} cloudContinentsDetail={[cloudContinentsDetail, setCloudContinentsDetail]} cloudRegion={[cloudRegion, setCloudRegion]} />
          )}
        </div>
      )}
      {!IS_ENTERPRISE ? (
        <>
          <Grid container item xs={12} alignItems="left" style={{ marginTop: 15, marginBottom: 15 }}>
            {t("종량제입니다. 시간당 비용이 청구되며 언제든지 서버를 종료 할 수 있습니다.")}
            {t("Excludes variable data Transfer, backup, and taxes.")}
            {warning !== "" && (
              <Grid className={classes.Grid_warning} container item xs={4} justify="center" alignItems="center">
                {t(warning)}
              </Grid>
            )}
          </Grid>

          <Grid container item xs={12} alignItems="left" style={{ marginTop: 15, marginBottom: 15 }}>
            {t("Total Cost") + ` : ${cloudDetail !== null ? (user.language == "ko" ? (cloudDetail?.pricePerHourSkyhubAi * 1200 - 0.5).toFixed(0) : (cloudDetail?.pricePerHourSkyhubAi - 0.005).toFixed(2)) : 0}${user.language == "ko" ? " KRW" : "$"}/hour`}
          </Grid>
        </>
      ) : null}
      <Grid container item xs={12} alignItems="left" style={{ marginTop: 15, marginBottom: 15 }}>
        <Button
          onClick={createProject}
          // onClick={() => {
          //   dispatch(
          //     openSuccessSnackbarRequestAction(
          //       t("To use the Skyhub Ai, please contact the sales team.")
          //     )
          //   );
          // }}
          disabled={loading}
          className={loading === false ? classes.submitButton : classes.submitButtonLoading}
        >
          {loading === false ? t("Create Server") : t("로딩중입니다.")}
        </Button>
      </Grid>
    </div>
  );
};

export default NewOpsProject;
