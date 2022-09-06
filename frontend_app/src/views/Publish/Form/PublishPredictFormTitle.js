import React from "react";
import { useTranslation } from "react-i18next";

import Button from "components/CustomButtons/Button.js";

import Grid from "@mui/material/Grid";

const PublishPredictFormTitle = ({ type }) => {
  const { t } = useTranslation();

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ mt: 4, mb: 8, position: "relative" }}
    >
      <span
        style={{ fontSize: 28, fontWeight: 700, color: "var(--gray-dark)" }}
      >
        {t("Input Data")}
      </span>
      <Button
        id="auto_fill_btn"
        shape="greenOutlined"
        onClick={() => null}
        style={{ position: "absolute", right: 0 }}
      >
        {t("Auto Fill")}
      </Button>
    </Grid>
  );
};

export default PublishPredictFormTitle;
