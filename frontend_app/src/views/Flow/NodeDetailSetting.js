import React, { useState, useEffect } from "react";

import { Grid, List } from "@mui/material";

const NodeDetailSetting = ({ selectedNode }) => {
  const headerHeight = 8 * 8;

  return (
    <Grid
      sx={{
        width: "300px",
        height: "100%",
        pt: `${headerHeight}px`,
        backgroundColor: "var(--background2)",
      }}
    >
      <span style={{ color: "var(--textWhite87)" }}>
        {selectedNode.content}
      </span>
    </Grid>
  );
};

export default NodeDetailSetting;
