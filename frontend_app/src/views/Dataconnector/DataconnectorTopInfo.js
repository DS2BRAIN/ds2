import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import * as api from "controller/api.js";

import currentTheme from "assets/jss/custom.js";
import { useTranslation } from "react-i18next";
import {
  convertToLocalDateStr,
  setMemoryUnit,
} from "../../components/Function/globalFunc.js";

import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";

import MetabaseButton from "components/CustomButtons/MetabaseButton.js";

const DataconnectorTopInfo = ({ connectorInfo }) => {
  const { t } = useTranslation();
  const classes = currentTheme();
  const { user } = useSelector((state) => ({ user: state.user }), []);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedLabelproject, setSelectedLabelproject] = useState("");
  const [urlDataId, setUrlDataId] = useState(-1);

  useEffect(() => {
    let urlLoc = window.location.pathname;
    let splitedUrl = urlLoc.split("/");
    let urlDataIndex = splitedUrl.indexOf("dataconnector");
    setUrlDataId(splitedUrl[urlDataIndex + 1]);
  }, []);

  const handleChangeSelectedProject = (e) => {
    if (e.target.value === null) return;

    setSelectedProject(e.target.value);
  };

  const handleChangeSelectedLabelproject = (e) => {
    if (e.target.value === null) return;

    setSelectedLabelproject(e.target.value);
  };

  return (
    <Grid
      container
      sx={{ mt: 4 }}
      justifyContent="center"
      alignItems="center"
      direction="column"
    >
      <Grid item sx={{ mx: "auto", mb: 2 }}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <span
            id="dataconnectorName"
            style={{
              fontSize: 36,
              fontWeight: 500,
              lineHeight: 1.5,
              maxWidth: "80%",
              textAlign: "center",
            }}
          >
            {connectorInfo.dataconnectorName}
          </span>
          {connectorInfo.dataconnectortype?.dataconnectortypeName === "CSV" &&
            urlDataId > 0 && (
              <Grid item sx={{ my: 1.5 }}>
                <MetabaseButton
                  id={urlDataId}
                  type="data"
                  isKor={user.language === "ko"}
                />
              </Grid>
            )}
        </Grid>
        <Grid container justifyContent="center" sx={{ fontSize: 15, mb: 2 }}>
          <Grid item sx={{ mr: 4 }}>
            <span>{t("Registration date")} : </span>
            <span
              style={{
                fontSize: 17,
                fontWeight: 500,
                verticalAlign: "middle",
              }}
            >
              {convertToLocalDateStr(connectorInfo.created_at)}
            </span>
          </Grid>
          <Grid item sx={{ mr: 4 }}>
            <span>{t("Data type")} : </span>
            <span
              style={{
                fontSize: 17,
                fontWeight: 500,
                verticalAlign: "middle",
              }}
            >
              {connectorInfo.dataconnectortype?.dataconnectortypeName}
            </span>
          </Grid>
          <Grid item>
            <span>{t("File size")} : </span>
            <span
              style={{
                fontSize: 17,
                fontWeight: 500,
                verticalAlign: "bottom",
              }}
            >
              {connectorInfo.fileSize && setMemoryUnit(connectorInfo.fileSize)}
            </span>
          </Grid>
        </Grid>
      </Grid>
      <Grid item sx={{ mx: 2, mb: 2 }}>
        <Grid container sx={{ mb: 2 }}>
          <Grid item sx={{ mr: 3 }}>
            <Grid
              container
              direction="column"
              alignItems="center"
              minHeight={48}
            >
              <Grid item sx={{ mb: 1 }}>
                <span style={{ fontSize: 15 }}>{t("Project list")}</span>
              </Grid>
              <Grid item minWidth={300}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel
                    sx={{
                      fontSize: 14,
                      color: "var(--textWhite6)",
                      top: -7,
                      transform:
                        selectedProject === ""
                          ? "translate(14px, 16px) scale(1)"
                          : "translate(14px, 0px) scale(0.75)",
                      "&.Mui-focused": {
                        transform: "translate(14px, 0px) scale(0.75)",
                      },
                    }}
                  >
                    {t("Go to the Click AI project associated with your data")}
                  </InputLabel>
                  <Select
                    className="no-background-color"
                    value={selectedProject}
                    label={t("Go to the Click AI project associated with your data")}
                    onChange={handleChangeSelectedProject}
                    SelectDisplayProps={{
                      style: {
                        height: "100%",
                        padding: "6px 12px",
                        boxSizing: "border-box",
                        color: "var(--textWhite87)",
                      },
                    }}
                    sx={{ height: "36px" }}
                  >
                    {connectorInfo.projects &&
                    connectorInfo.projects.length > 0 ? (
                      connectorInfo.projects.map((v, i) => {
                        return (
                          <MenuItem
                            key={v.project_id}
                            value={v.project_name}
                            onClick={() =>
                              window.open(`/admin/train/${v.project_id}`)
                            }
                          >
                            {v.project_name}
                          </MenuItem>
                        );
                      })
                    ) : (
                      <MenuItem value={null} disabled sx={{ fontSize: 14 }}>
                        {t("No project created")}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid
              container
              direction="column"
              alignItems="center"
              minHeight={48}
            >
              <Grid item sx={{ mb: 1 }}>
                <span style={{ fontSize: 15 }}>
                  {t("Label project list")}
                </span>
              </Grid>
              <Grid item minWidth={300}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel
                    sx={{
                      fontSize: 14,
                      color: "var(--textWhite6)",
                      top: -7,
                      transform:
                        selectedLabelproject === ""
                          ? "translate(14px, 16px) scale(1)"
                          : "translate(14px, 0px) scale(0.75)",
                      "&.Mui-focused": {
                        transform: "translate(14px, 0px) scale(0.75)",
                      },
                    }}
                  >
                    {t("Go to the label project associated with your data")}
                  </InputLabel>
                  <Select
                    className="no-background-color"
                    value={selectedLabelproject}
                    label={t("Go to the label project associated with your data")}
                    onChange={handleChangeSelectedLabelproject}
                    SelectDisplayProps={{
                      style: {
                        height: "100%",
                        padding: "6px 12px",
                        boxSizing: "border-box",
                        color: "var(--textWhite87)",
                      },
                    }}
                    inputProps={{ style: { padding: "2px 4px" } }}
                    sx={{ height: "36px" }}
                  >
                    {connectorInfo.labelprojects &&
                    connectorInfo.labelprojects.length > 0 ? (
                      connectorInfo.labelprojects.map((v, i) => {
                        return (
                          <MenuItem
                            key={v.labelproject_id}
                            value={v.labelproject_name}
                            onClick={() =>
                              window.open(
                                `/admin/labelling/${v.labelproject_id}`
                              )
                            }
                          >
                            {v.labelproject_name}
                          </MenuItem>
                        );
                      })
                    ) : (
                      <MenuItem value={null} disabled sx={{ fontSize: 14 }}>
                        {t("No project created")}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DataconnectorTopInfo;
