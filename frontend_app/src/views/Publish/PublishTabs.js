import React from "react";
import { useTranslation } from "react-i18next";

import Grid from "@mui/material/Grid";

const PublishTabs = ({ clickTabHandler, selectedTab }) => {
  const { t } = useTranslation();
  const TABS = [
    { value: "predict", label: "Predict" },
    // { value: "tab2", label: "Tab2" },
  ];

  return (
    <Grid item xs={12}>
      <Grid container justifyContent="center">
        {TABS.map((v) => {
          return (
            <Grid
              key={v.value}
              item
              xs={12}
              onClick={() => clickTabHandler(v.value)}
              sx={{
                p: 1,
                background:
                  selectedTab === v.value
                    ? "linear-gradient(45deg,#3B82F7,#5EC3B5)"
                    : "var(--surface2)",
                textAlign: "center",
                // cursor: "pointer",
              }}
            >
              <span
                style={{
                  color:
                    selectedTab === v.value
                      ? "var(--textWhite87)"
                      : "var(--textWhite6)",
                  fontWeight: selectedTab === v.value ? 700 : 500,
                }}
              >
                {t(v.label)}
              </span>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
};

export default PublishTabs;
