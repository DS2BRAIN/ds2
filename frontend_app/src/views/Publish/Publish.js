import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import * as api from "controller/api";
import currentTheme from "assets/jss/custom";
import { renderSnackbarMessage } from "components/Function/globalFunc";
import PublishTitle from "./PublishTitle";
import PublishTabs from "./PublishTabs";
import PublishContents from "./PublishContents";

import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

const Publish = ({ history }) => {
  const { t } = useTranslation();
  const classes = currentTheme();
  let query = useQuery();

  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [selectedTab, setSelectedTab] = useState("predict");

  const clickTabHandler = (value) => {
    setSelectedTab(value);
  };

  useEffect(() => {
    const modelId = query.get("model_id");

    setIsLoading(true);

    api
      .getModelsInfoDetail(modelId)
      .then((res) => {
        console.log(res.data);
        setModel(res.data);
      })
      .catch((e) => {
        console.error(e);

        renderSnackbarMessage(
          "error",
          e.response,
          "An error occurred while loading model information."
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <main>
      {isLoading || !model ? (
        <div className={classes.fullLoading}>
          <CircularProgress
            disableShrink
            color="inherit"
            size={50}
            sx={{ color: "var(--secondary1)", mb: 3.5 }}
          />
          <p id="loadingText" className={classes.settingFontWhite87}>
            {t("Loading model information. Please wait for a moment.")}
          </p>
        </div>
      ) : (
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          sx={{ minHeight: "100vh", backgroundColor: "var(--white)" }}
        >
          <PublishTitle model={model} />
          <PublishTabs
            clickTabHandler={clickTabHandler}
            selectedTab={selectedTab}
          />
          <PublishContents model={model} />
        </Grid>
      )}
    </main>
  );
};

export default Publish;
