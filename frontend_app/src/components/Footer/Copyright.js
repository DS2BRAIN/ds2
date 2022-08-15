import React from "react";
import { Grid, Link } from "@material-ui/core";

const Copyright = ({ isKor }) => {
  return (
    <Grid
      style={{
        fontSize: "12px",
        color: "rgba(255, 255, 255, 0.87)",
        textAlign: "center",
      }}
    >
      {"ⓒ 2020. "}
      <Link
        target="_blank"
        color="inherit"
        href={isKor ? "https://ko.ds2.ai/" : "https://ds2.ai/"}
      >
        DSLAB GLOBAL
      </Link>{" "}
    </Grid>
  );
};

export default Copyright;
