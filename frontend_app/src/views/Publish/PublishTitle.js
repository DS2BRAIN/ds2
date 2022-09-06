import React from "react";
import { useTranslation } from "react-i18next";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const PublishTitle = ({ model }) => {
  const { t } = useTranslation();

  return (
    <Grid
      item
      xs={12}
      sx={{ p: 4.5, textAlign: "center", backgroundColor: "var(--surface2)" }}
    >
      <h1 style={{ fontSize: 36, fontWeight: 700 }}>{t("Try AI Model")}</h1>
      <Typography
        sx={{
          mb: 1,
          fontSize: 30,
          color: "var(--textWhite87)",
        }}
      >
        {model.name}
      </Typography>
      <Typography sx={{ mt: 5 }}>
        <span
          style={{ marginRight: 8, fontSize: 12, color: "var(--textWhite6)" }}
        >
          powered by
        </span>{" "}
        <img alt="ds2 logo" width={100} src="/images/logo_transparent.png" />
      </Typography>
    </Grid>
  );
};

export default PublishTitle;
