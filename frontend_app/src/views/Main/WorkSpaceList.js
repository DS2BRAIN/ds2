import React, { useState } from "react";

import { WORKSPACES_MOCKUP } from "./Mockups";
import WorkSpaceCard from "./WorkSpaceCard";
import SearchInputBox from "components/Table/SearchInputBox";
import Button from "components/CustomButtons/Button";

import { Checkbox, Grid } from "@mui/material";

const WorkSpaceList = ({ setSelectedTabId }) => {
  const mockupFlows = WORKSPACES_MOCKUP;

  const onSetTemplateTab = () => {
    setSelectedTabId(1);
  };

  return (
    <Grid>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ py: 1.5 }}
      >
        <Grid sx={{ ml: -1.25 }}>
          <SearchInputBox />
        </Grid>
        <Button
          id="build_flow_btn"
          shape="greenContainedSquare"
          size="lg"
          onClick={onSetTemplateTab}
        >
          Build a flow
        </Button>
      </Grid>
      <Grid container sx={{ p: 2, mb: 1 }}>
        <Checkbox />
        <Grid sx={{ ml: 1.5, fontWeight: 600, fontSize: "18px" }}>
          All Flows
        </Grid>
      </Grid>
      {mockupFlows.map((flow) => (
        <WorkSpaceCard key={`workspace_card_${flow.id}`} flow={flow} />
      ))}
    </Grid>
  );
};

export default WorkSpaceList;
