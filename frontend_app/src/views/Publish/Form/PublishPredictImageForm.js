import React from "react";

import PublishPredictFormTitle from "./PublishPredictFormTitle";

import Grid from "@mui/material/Grid";

const PublishPredictImageForm = ({ model }) => {
  return (
    <Grid container sx={{ p: 5 }}>
      <PublishPredictFormTitle type="normal" />
    </Grid>
  );
};

export default PublishPredictImageForm;
