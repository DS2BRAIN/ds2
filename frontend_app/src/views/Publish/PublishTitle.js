import React from "react";
import { useTranslation } from "react-i18next";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const PublishTitle = () => {
  const { t } = useTranslation();

  return (
    <Grid
      item
      xs={12}
      sx={{ p: 4.5, textAlign: "center", backgroundColor: "var(--surface2)" }}
    >
      <Typography
        sx={{
          mb: 1,
          fontSize: 24,
          color: "var(--textWhite87)",
        }}
      >
        File Name
      </Typography>
      <h1 style={{ fontWeight: 700 }}>Model Name</h1>
      <Typography sx={{ mt: 5 }}>
        <span style={{ marginRight: 8, color: "var(--textWhite6)" }}>
          powered by
        </span>{" "}
        <img alt="ds2 logo" width={120} src="/images/logo_transparent.png" />
      </Typography>
    </Grid>
  );
};

export default PublishTitle;
