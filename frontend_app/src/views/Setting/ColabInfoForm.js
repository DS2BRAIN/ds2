import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useTranslation } from "react-i18next";
import currentTheme from "assets/jss/custom";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages";

import Grid from "@mui/material/Grid";
import Input from "@mui/material/Input";

const ColabInfoForm = ({ colabInfo, onChangeColabInfo, projectStatus }) => {
  const { t } = useTranslation();
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { projects } = useSelector(
    (state) => ({ projects: state.projects }),
    []
  );

  const numbInputStyle = () => ({
    position: "relative",
    color: "var(--textWhite87)",
    border: "none",
    borderRadius: 8,

    "&.Mui-disabled": {
      color: "var(--textWhite38)",
    },

    "&.Mui-disabled::before": {
      borderBottomStyle: "none",
    },

    "&::before, &:not(.Mui-disabled):hover::before, &::after": {
      height: "100%",
      border: "none",
    },

    "&::after": {
      border: "none",
      transition: "none",
    },
  });

  return (
    <Grid container sx={{ px: 4, py: 3, overflowY: "auto" }}>
      {Object.keys(colabInfo).map((key, i) => {
        const info = colabInfo;

        return (
          <Grid
            container
            key={key}
            sx={{ mt: i > 0 ? 1 : 0 }}
            alignItems="center"
            wrap="nowrap"
            minHeight={60}
          >
            <Grid item xs={4} sx={{ px: 0.25, wordBreak: "break-all" }}>
              <Grid container direction="column">
                <span style={{ fontSize: 15, fontWeight: 500 }}>{key}</span>
              </Grid>
            </Grid>

            <Grid item sx={{ ml: "auto" }} xs={6}>
              <Grid
                container
                sx={{
                  position: "relative",
                  border: "1px solid var(--textWhite38)",
                  borderRadius: 1,
                  p: "4px 12px 2px",
                }}
              >
                <Input
                  id={key}
                  className="no-dials-input"
                  value={colabInfo[key]}
                  type="text"
                  onChange={(e) => onChangeColabInfo(e, key)}
                  disabled={projectStatus !== 0}
                  inputProps={{
                    style: {
                      padding: 4,
                      WebkitTextFillColor: "unset",
                    },
                  }}
                  sx={numbInputStyle(info[key])}
                />
              </Grid>
            </Grid>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ColabInfoForm;
