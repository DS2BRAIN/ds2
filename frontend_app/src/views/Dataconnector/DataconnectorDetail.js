import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as api from "controller/api";
import { fileurl } from "controller/api";
import { useTranslation } from "react-i18next";
import { getDataConnectorInfoRequestAction } from "redux/reducers/projects";
import { addIdListForLabelProjectRequestAction } from "redux/reducers/projects.js";
import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";

import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";

import currentTheme from "assets/jss/custom";
import Button from "components/CustomButtons/Button";
import DataconnectorPreview from "./DataconnectorPreview.js";
import DataconnectorSummary from "./DataconnectorSummary.js";
import DataconnectorTopInfo from "./DataconnectorTopInfo.js";

const DataconnectorDetail = ({ history, match }) => {
  const { t } = useTranslation();
  const classes = currentTheme();
  const { projects } = useSelector((state) => ({ projects: state.projects }));
  const dispatch = useDispatch();

  const dataconnectorStatus = {
    1: t("Uploading"),
    99: t("Error"),
    100: t("Completed"),
  };
  const startBtnStyle = {
    width: "auto",
    height: 32,
    px: 2,
    py: 0.25,
    ml: 1.5,
    fontSize: 14,
    color: "var(--secondary1)",
    border: "1px solid var(--secondary1)",
    borderRadius: "20px",
  };

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("preview");
  const [dataConnectorId, setDataConnectorId] = useState(
    Number(match.params.id)
  );
  const [connectorInfo, setConnectorInfo] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [isStartLoading, setIsStartLoading] = useState({
    labeling: false,
    normal: false,
    verify: false,
  });
  const [isDisabledStartBtn, setIsDisabledStartBtn] = useState(false);

  const handleChangeTab = (tab) => {
    setSelectedTab(tab);
  };

  const onDownloadRawData = (filepathurl) => {
    let url = "";
    if (process.env.REACT_APP_ENTERPRISE === "true")
      url = fileurl + "static" + filepathurl;
    else url = filepathurl;

    const link = document.createElement("a");
    link.href = url;
    link.download = "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startLabeling = () => {
    const tmpCI = { ...connectorInfo };
    const idList = [tmpCI.id];
    const firstSelectedType = tmpCI.dataconnectortype?.dataconnectortypeName;
    const firstSelectedCategory = tmpCI.trainingMethod;

    dispatch(
      addIdListForLabelProjectRequestAction({
        idListForLabeling: idList,
        firstSelectedType,
        firstSelectedCategory,
      })
    );
  };

  const startProject = async (id, type) => {
    setIsDisabledStartBtn(true);
    setIsStartLoading({ ...isStartLoading, [type]: true });
    await api
      .postProjectFromDataconnectors({
        dataconnectors: [id],
        isVerify: type === "verify",
      })
      .then((res) => {
        dispatch(
          openSuccessSnackbarRequestAction(
            t("A new project has been created.")
          )
        );
        history.push(`/admin/train/` + res.data.id);
      })
      .catch((error) => {
        if (
          process.env.REACT_APP_ENTERPRISE !== "true" &&
          error.response &&
          error.response.status === 402
        ) {
          window.location.href = "/admin/setting/payment/?cardRequest=true";
          return;
        }
        if (JSON.stringify(error).indexOf("507") > -1) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("The total number of data exceeded.")
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "죄송합니다, 프로젝트 생성 중 오류가 발생하였습니다. 다시 시도해주세요."
              )
            )
          );
        }
      })
      .finally(() => {
        setIsDisabledStartBtn(false);
        setIsStartLoading({ ...isStartLoading, [type]: true });
      });
  };

  const renderTabs = () => {
    return (
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{
          width: "100% !important",
          borderTop: "1px solid " + currentTheme.border2,
          mb: 3,
        }}
      >
        <Grid item>
          <Grid container>
            <Grid
              item
              onClick={() => handleChangeTab("preview")}
              id="preview_tab"
              className={
                selectedTab === "preview"
                  ? classes.selectedTab
                  : classes.notSelectedTab
              }
              style={{ fontSize: "14px" }}
            >
              {t("Data preview")}
            </Grid>
            {((connectorInfo.hasLabelData &&
              connectorInfo.label_info &&
              Object.keys(connectorInfo.label_info).length > 0) ||
              (connectorInfo.data_indicator &&
                connectorInfo.data_indicator.length > 0)) && (
              <Grid
                item
                onClick={() => handleChangeTab("summary")}
                id="summary_tab"
                className={
                  selectedTab === "summary"
                    ? classes.selectedTab
                    : classes.notSelectedTab
                }
                style={{ fontSize: "14px" }}
              >
                {t("Summary")}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const renderSubDesc = () => {
    return (
      <Grid
        container
        alignItems="center"
        sx={{
          pb: 1,
          mb: 3.5,
          fontSize: 14,
          borderBottom: "1px solid var(--surface2)",
        }}
      >
        <span>
          {connectorInfo.total_count && (
            <span style={{ fontSize: 15 }}>
              {t("Total number of datas")} :{" "}
              <b>{connectorInfo.total_count.toLocaleString()}</b>{" "}
              {t(
                connectorInfo.dataconnectortype?.dataconnectortypeName === "CSV"
                  ? "행"
                  : "개"
              )}
            </span>
          )}
          {selectedTab === "preview" && (
            <span style={{ marginLeft: 8 }}>
              [{" "}
              {t(
                connectorInfo.dataconnectortype?.dataconnectortypeName === "CSV"
                  ? "샘플 데이터(120개행 이내)로 보여집니다."
                  : "샘플 데이터(20장 이내)로 보여집니다."
              )}{" "}
              ]
            </span>
          )}
        </span>
        <Button
          aria-controls="customized-menu"
          aria-haspopup="true"
          id="dataDownloadBtn"
          shape="greenOutlined"
          disabled={!connectorInfo.filePath}
          style={{
            width: "auto",
            px: 1.5,
            py: 0.25,
            marginLeft: "auto",
            fontSize: 12,
            color: "var(--secondary1)",
            border: "1px solid var(--secondary1)",
            borderRadius: "20px",
          }}
          onClick={() => onDownloadRawData(connectorInfo.filePath)}
        >
          RAW DATA DOWNLOAD
        </Button>
      </Grid>
    );
  };

  useEffect(() => {
    if (dataConnectorId && projects.dataconnector?.id !== dataConnectorId) {
      dispatch(
        getDataConnectorInfoRequestAction({
          id: Number(dataConnectorId),
          history,
        })
      );
    }

    if (projects.dataconnector) {
      const connector = projects.dataconnector;
      let sampleDataRaw = {};

      setConnectorInfo(connector ? connector : {});

      if (
        connector &&
        connector.dataconnectortype?.dataconnectortypeName === "CSV"
      ) {
        sampleDataRaw[connector.dataconnectorName] = JSON.parse(
          connector.sampleData
        );
      }
      setSampleData(sampleDataRaw);
    }
  }, [dataConnectorId, projects.dataconnector]);

  useEffect(() => {
    if (projects.isDatasetLoading) setIsLoading(true);
    else setIsLoading(false);
  }, [projects.isDatasetLoading]);

  useEffect(() => {
    if (
      projects.idListForLabelProject.length &&
      projects.categoryForLabelProject
    ) {
      history.push("/admin/newProject/?file=ready&detail=true");
    }
  }, [projects.idListForLabelProject]);

  return isLoading || !connectorInfo ? (
    <div className={classes.smallLoading}>
      <CircularProgress size={50} sx={{ mb: 3.5 }} />
      <p id="loadingText" className={classes.settingFontWhite87}>
        {t("Loading data connector information. please wait for a moment.")}
      </p>
    </div>
  ) : (
    <div>
      <Grid container justifyContent="flex-end" sx={{ px: 2, mt: 2.5 }}>
        <Grid item>
          <Button
            id="startLabellingBtn"
            shape="greenOutlined"
            disabled={isDisabledStartBtn}
            sx={startBtnStyle}
            onClick={startLabeling}
          >
            <span>{t("Start labeling")}</span>
            {isStartLoading["labeling"] && (
              <CircularProgress
                size={15}
                color="inherit"
                sx={{
                  color: "var(--secondary1)",
                  verticalAlign: "middle",
                  ml: 1,
                }}
              />
            )}
          </Button>
        </Grid>
        {connectorInfo.hasLabelData && (
          <>
            <Grid item>
              <Button
                id="start_develop_btn"
                shape="greenOutlined"
                disabled={isDisabledStartBtn}
                sx={startBtnStyle}
                onClick={() => startProject(connectorInfo.id, "normal")}
              >
                <span>{t("Start AI Modeling")}</span>
                {isStartLoading["normal"] && (
                  <CircularProgress
                    size={15}
                    color="inherit"
                    sx={{
                      color: "var(--secondary1)",
                      verticalAlign: "middle",
                      ml: 1,
                    }}
                  />
                )}
              </Button>
            </Grid>
            <Grid item>
              <Button
                id="start_verify_btn"
                shape="greenOutlined"
                disabled={isDisabledStartBtn}
                sx={startBtnStyle}
                onClick={() => startProject(connectorInfo.id, "verify")}
              >
                <span>{t("Start AI Verification")}</span>
                {isStartLoading["verify"] && (
                  <CircularProgress
                    size={15}
                    color="inherit"
                    sx={{
                      color: "var(--secondary1)",
                      verticalAlign: "middle",
                      ml: 1,
                    }}
                  />
                )}
              </Button>
            </Grid>
          </>
        )}
      </Grid>

      <DataconnectorTopInfo connectorInfo={connectorInfo} />

      {renderTabs()}

      <Grid container sx={{ px: 2 }}>
        {renderSubDesc()}

        {selectedTab === "preview" ? (
          <DataconnectorPreview
            connectorInfo={connectorInfo}
            sampleData={sampleData}
            isDataConnectorPage
          />
        ) : (
          <DataconnectorSummary connectorInfo={connectorInfo} />
        )}
      </Grid>
    </div>
  );
};

export default DataconnectorDetail;
