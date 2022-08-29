import React, { useState } from "react";

import { WORKSPACES_MOCKUP } from "./Mockups";

import { Button, Grid } from "@mui/material";

const WorkSpaceList = () => {
  const mockupFlows = WORKSPACES_MOCKUP;

  return (
    <Grid>
      <Grid>
        {mockupFlows.map((mockupFlow) => (
          <div>{mockupFlow.title}</div>
        ))}
      </Grid>
    </Grid>
  );
};

export default WorkSpaceList;
