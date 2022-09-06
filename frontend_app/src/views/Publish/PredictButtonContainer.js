import React from "react";
import { useTranslation } from "react-i18next";

import Button from "components/CustomButtons/Button.js";

import Grid from "@mui/material/Grid";

const PredictButtonContainer = () => {
  const { t } = useTranslation();

  return (
    <Grid
      container
      justifyContent="flex-end"
      alignItems="center"
      sx={{ mt: 3 }}
    >
      <Button shape="greenOutlined" sx={{ mr: 2 }}>
        {t("New Prediction")}
      </Button>
      <Button shape="greenContained">{t("Run")}</Button>
    </Grid>
  );
};

export default PredictButtonContainer;
