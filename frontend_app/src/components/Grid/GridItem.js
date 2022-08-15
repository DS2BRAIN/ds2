import React from "react";
import { currentTheme } from "assets/jss/material-dashboard-react.js";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

const styles = {
  grid: {
    padding: "0 15px",
  },
};

const useStyles = makeStyles(styles);

export default function GridItem(props) {
  const classes = useStyles();
  const { children, noPadding, ...rest } = props;
  return (
    <Grid item {...rest} className={noPadding ? null : classes.grid}>
      {children}
    </Grid>
  );
}

GridItem.propTypes = {
  children: PropTypes.node,
};
