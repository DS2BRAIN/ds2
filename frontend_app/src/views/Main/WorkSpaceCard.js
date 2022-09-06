import React, { useState } from "react";
import { useHistory } from "react-router";

import BarChartIcon from "@mui/icons-material/BarChart";
import LaunchIcon from "@mui/icons-material/Launch";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import { Checkbox, Grid, IconButton } from "@mui/material";

const WorkSpaceCard = ({ flow }) => {
  const history = useHistory();

  const blockFinishedNum = (
    <Grid sx={{ textAlign: "center" }}>
      <Grid>
        <span
          style={{
            color: "var(--textWhite6)",
            fontSize: "12px",
            textTransform: "uppercase",
          }}
        >
          Finished
        </span>
      </Grid>
      <Grid>
        <span
          style={{
            color: "var(--textWhite87)",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          {flow.finished}
        </span>
      </Grid>
    </Grid>
  );

  const iconButtonAnalysis = (
    <IconButton onClick={() => history.push("/admin/flow/analyze")}>
      <BarChartIcon />
    </IconButton>
  );

  const iconButtonPublish = (
    <IconButton onClick={() => history.push("/admin/publish")}>
      <LaunchIcon />
    </IconButton>
  );

  const openDropdown = () => {};

  const iconButtonSetting = (
    <IconButton onClick={openDropdown}>
      <MoreHorizIcon />
    </IconButton>
  );

  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: "var(--background2)",
      }}
    >
      <Grid sx={{ display: "flex", alignItems: "center" }}>
        <Checkbox />
        <Grid
          sx={{
            mx: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "10px",
            fontWeight: 300,
            borderRadius: "4px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            minWidth: "80px",
            minHeight: "60px",
          }}
        >
          Thumbnail
        </Grid>
        <Grid>
          <Grid sx={{ fontWeight: 600 }}>{flow.title}</Grid>
          <Grid sx={{ color: "var(--textWhite6)", fontSize: "12px" }}>
            {`Created ${flow.created} / Updated ${flow.updated}, by ${flow.owner}`}
          </Grid>
        </Grid>
      </Grid>
      <Grid
        container
        alignItems="center"
        columnSpacing={1}
        sx={{ width: "auto" }}
      >
        <Grid item>{blockFinishedNum}</Grid>
        <Grid item>{iconButtonAnalysis}</Grid>
        <Grid item>{iconButtonPublish}</Grid>
        <Grid item>{iconButtonSetting}</Grid>
      </Grid>
    </Grid>
  );
};

export default WorkSpaceCard;
