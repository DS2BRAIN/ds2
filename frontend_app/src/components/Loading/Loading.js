import React, { useState, useEffect, useRef } from "react";
import { currentTheme } from "assets/jss/material-dashboard-react.js";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import { fileurl } from "controller/api";
const styles = {
  canvas: {
    boxShadow: "0 0 2px #111",
    borderRadius: "250px",
  },
};

const useStyles = makeStyles(styles);

const Loading = ({ size }) => {
  return <img src={fileurl + "asset/front/img/q6.svg"} alt="logo" />;
};

export default React.memo(Loading);
