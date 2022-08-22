import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import * as api from "controller/api.js";
import { backendurl } from "controller/api.js";

import { Modal } from "@material-ui/core";
import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import Cookies from "helpers/Cookies";
import currentTheme from "assets/jss/custom.js";
import Button from "components/CustomButtons/Button";

const MetabaseButton = ({ id, type, metabase, initiateMetabase }) => {
  const classes = currentTheme();
  const { t, i18n } = useTranslation();
  const isKor = i18n.language === "ko";

  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedMetabase, setSelectedMetabase] = useState({});
  const [isMetabaseGuideDisagree, setIsMetabaseGuideDisagree] = useState(false);
  const [metabaseInfo, setMetabaseInfo] = useState({});
  const [metabaseStatus, setMetabaseStatus] = useState(99);

  useEffect(() => {
    if (type === "data") {
      function getDataInfo(event) {
        const response = JSON.parse(event.data);
        if (typeof response === "object" && Object.keys(response).length) {
          setMetabaseInfo(response);
          setMetabaseStatus(response.status);
        }
      }
      const SSEapi = api.getDataInfoViaSSE(id);

      SSEapi.addEventListener("new_message", getDataInfo);
      return () => {
        SSEapi.close();
      };
    }
  }, [id, type]);

  useEffect(() => {
    if (type === "model" && metabase) {
      setMetabaseInfo(metabase);
      setMetabaseStatus(metabase.status);
    }
  }, [metabase]);

  useEffect(() => {
    if (!isAnalysisModalOpen) {
      setSelectedMetabase(null);
    }
  }, [isAnalysisModalOpen]);

  const openMetabaseResult = (metabase) => {
    let isCookieMetabaseGuide = Cookies.getCookie("metabaseGuide");
    if (isCookieMetabaseGuide === "disagree") openMetabaseTab(metabase.url);
    else {
      setSelectedMetabase(metabase);
      setIsAnalysisModalOpen(true);
    }
  };

  const closeAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    if (isMetabaseGuideDisagree) {
      Cookies.setCookie("metabaseGuide", "disagree", 180);
    }
  };

  const initiateDataMetabase = (id) => {
    setMetabaseStatus(1);
    api
      .getDataMetabase(id)
      .then((res) => {
        console.log(res);
      })
      .catch((e) => {
        console.log("error", e);
      });
  };

  const openMetabaseTab = (metabaseUrl) => {
    let newUrl = new URL(backendurl);
    let fullUrl = "http://" + newUrl.hostname + metabaseUrl;
    window.open(fullUrl);
  };

  return (
    <>
      {metabaseStatus === 0 || metabaseStatus === 100 ? (
        <div
          id={`metabase_${type}_${
            metabaseStatus === 100 ? "check" : "start"
          }_btn`}
          className={`${classes.modelTab} apiBtn ${classes.modelTabButton}`}
          style={{
            fontWeight: metabaseStatus === 100 && "bold",
          }}
          onClick={() => {
            if (metabaseStatus === 100) openMetabaseResult(metabaseInfo);
            else {
              if (type === "data") initiateDataMetabase(id);
              else if (type === "model") initiateMetabase(id);
            }
          }}
        >
          {type === "data" && isKor ? "데이터 " : null}
          {metabaseStatus === 100 ? t("Check analysis") : t("Start analysis")}
          {type === "data" && !isKor ? " on data" : null}
          {type === "data" ? " (Prod.By METABASE)" : null}
        </div>
      ) : metabaseStatus === 1 || metabaseStatus === 99 ? (
        <Tooltip
          title={
            <span style={{ fontSize: "11px" }}>
              {metabaseStatus === 1
                ? t("Analyzing...")
                : t("Not available now.")}
            </span>
          }
          placement="bottom"
        >
          <div>
            <div
              id={`metabase_${type}_${
                metabaseStatus === 1 ? "processing" : "start"
              }_btn`}
              disabled
              className={`${classes.modelTab} apiBtn ${classes.modelTabButton}`}
            >
              {metabaseStatus === 1 ? (
                <CircularProgress
                  size={15}
                  color="inherit"
                  sx={{
                    ml: -0.5,
                    mr: 0.5,
                    color: "var(--gray)",
                  }}
                />
              ) : null}
              {type === "data" && isKor ? "데이터 " : null}
              {metabaseStatus === 1 ? t("Analyzing") : t("Start analysis")}
              {type === "data" && !isKor
                ? metabaseStatus === 1
                  ? " data"
                  : " on data"
                : null}
              {type === "data" ? " (Prod.By METABASE)" : null}
            </div>
          </div>
        </Tooltip>
      ) : null}
      <Modal
        open={isAnalysisModalOpen}
        onClose={closeAnalysisModal}
        className={classes.modalContainer}
      >
        <Grid
          sx={{
            backgroundColor: "var(--background2)",
            borderRadius: "4px",
            width: "500px",
            p: 4,
          }}
        >
          <Grid
            sx={{
              mt: -2,
              mr: -2,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <CloseIcon
              style={{ cursor: "pointer" }}
              onClick={closeAnalysisModal}
            />
          </Grid>
          <Grid sx={{ mb: 3 }}>
            {isKor ? (
              <span style={{ fontSize: "16px" }}>
                분석 결과는 <b>Metabase</b> 에서 확인 가능하며, ds2.ai와 동일한
                계정으로 <b>Metabase</b> 이용이 가능합니다.
              </span>
            ) : (
              <span style={{ fontSize: "16px" }}>
                Analysis results can be checked in <b>Metabase</b>, and{" "}
                <b>Metabase</b> can be used with the same account as ds2.ai.
              </span>
            )}
          </Grid>
          <Grid sx={{ mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={isMetabaseGuideDisagree}
                  sx={{ mr: 0.5 }}
                  onClick={() =>
                    setIsMetabaseGuideDisagree(!isMetabaseGuideDisagree)
                  }
                />
              }
              sx={{ ml: 0 }}
              label={
                <span style={{ fontSize: "14px" }}>
                  {isKor
                    ? "Metabase 이용 안내 다시 보지 않기 (180일간)"
                    : "Check not to see Metabase usage guide again (180 days)"}
                </span>
              }
            />
          </Grid>
          <Grid sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              id="open_metabasetab_btn"
              shape="greenOutlinedSquare"
              onClick={() => openMetabaseTab(selectedMetabase.url)}
            >
              {isKor ? "Metabase 바로가기" : "Go to Metabase"}
            </Button>
          </Grid>
        </Grid>
      </Modal>
    </>
  );
};

export default MetabaseButton;
