import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PublishTitle from "./PublishTitle";
import PublishTabs from "./PublishTabs";
import PublishPredictForm from "./PublishPredictForm";

import Grid from "@mui/material/Grid";

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const Publish = ({ history }) => {
  const { t } = useTranslation();
  let query = useQuery();

  const [selectedTab, setSelectedTab] = useState("predict");

  const clickTabHandler = (value) => {
    setSelectedTab(value);
  };

  useEffect(() => {
    console.log(query.get("model_id"));
  }, []);

  return (
    <main>
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        sx={{ minHeight: "100vh", backgroundColor: "var(--white)" }}
      >
        <PublishTitle />
        <PublishTabs
          clickTabHandler={clickTabHandler}
          selectedTab={selectedTab}
        />
        <PublishPredictForm />
      </Grid>
    </main>
  );
};

export default Publish;
