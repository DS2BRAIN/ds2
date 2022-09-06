import React from "react";

import PublishPredict from "./PublishPredict";
import PublishResult from "./PublishResult";
import PredictButtonContainer from "./PredictButtonContainer";

import Grid from "@mui/material/Grid";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

const PublishContents = ({ model }) => {
  return (
    <Grid
      container
      justifyContent="center"
      flexGrow={1}
      sx={{ px: 4, pt: 4, pb: 10 }}
    >
      <Grid item xs={8}>
        <PublishPredict model={model} />

        {/* <Grid item xs={12}>
        <KeyboardDoubleArrowRightIcon />
      </Grid> */}
        <PredictButtonContainer />
        <Grid item xs={12}>
          <PublishResult />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PublishContents;
