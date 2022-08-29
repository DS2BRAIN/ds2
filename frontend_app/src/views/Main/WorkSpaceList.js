import React, { useState } from "react";

import { WORKSPACES_MOCKUP } from "./Mockups";
import WorkSpaceCard from "./WorkSpaceCard";

import { Button, Checkbox, Grid } from "@mui/material";

const WorkSpaceList = () => {
  const mockupFlows = WORKSPACES_MOCKUP;

  return (
    <Grid>
      <Grid container sx={{ p: 2, mb: 1 }}>
        <Checkbox />
        <Grid sx={{ ml: 1.5, fontWeight: 600, fontSize: "18px" }}>
          All Flows
        </Grid>
      </Grid>
      {mockupFlows.map((flow) => (
        <WorkSpaceCard flow={flow} />
      ))}
    </Grid>
  );
};

export default WorkSpaceList;
