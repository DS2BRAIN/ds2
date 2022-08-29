import React, { useState } from "react";

import { Checkbox, Grid } from "@mui/material";

const WorkSpaceCard = ({ flow }) => {
  return (
    <Grid
      container
      alignItems="center"
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: "var(--background2)",
      }}
    >
      <Checkbox />
      <Grid
        sx={{
          mx: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "10px",
          fontWeight: 300,
          border: "1px solid var(--textWhite6)",
          borderRadius: "4px",
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
  );
};

export default WorkSpaceCard;
