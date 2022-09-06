import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import PublishPredictNormalForm from "./Form/PublishPredictNormalForm";
import PublishPredictImageForm from "./Form/PublishPredictImageForm";

import Grid from "@mui/material/Grid";

const PublishPredict = ({ model }) => {
  const trainingMethod = model.trainingMethod?.includes("normal")
    ? "normal"
    : "image";

  return (
    <Grid item xs={12}>
      {trainingMethod === "normal" ? (
        <PublishPredictNormalForm model={model} />
      ) : (
        <PublishPredictImageForm model={model} />
      )}
    </Grid>
  );
};

export default PublishPredict;
