import React, { useEffect, useState } from "react";
import { currentTheme } from "assets/jss/material-dashboard-react.js";
// nodejs library that concatenates classes
import classNames from "classnames";
// nodejs library to set properties for components
import PropTypes from "prop-types";

// material-ui components
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

import styles from "assets/jss/material-dashboard-react/components/buttonStyle.js";
import { useSelector } from "react-redux";
import { getAnalytics, logEvent } from "firebase/analytics";
import amplitude from "amplitude-js";

const useStyles = makeStyles(styles);

export default function RegularButton(props) {
  const classes = useStyles();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );
  const [isAgreedBehaviorStatistics, setIsAgreedBehaviorStatistics] = useState(
    false
  );
  const {
    color,
    round,
    children,
    disabled,
    simple,
    size,
    block,
    link,
    justIcon,
    className,
    muiClasses,
    ...rest
  } = props;

  if (isAgreedBehaviorStatistics) {
    const analytics = getAnalytics();
    logEvent(analytics, "select_button", {
      content_type: "button",
      content_id: "1",
      items: [children],
    });
    amplitude.getInstance().logEvent("Click_Button_" + children);
  }

  const btnClasses = classNames({
    [classes.button]: true,
    [classes[size]]: size,
    [classes[color]]: color,
    [classes.round]: round,
    [classes.disabled]: disabled,
    [classes.simple]: simple,
    [classes.block]: block,
    [classes.link]: link,
    [classes.justIcon]: justIcon,
    [className]: className,
  });
  return (
    <Button {...rest} classes={muiClasses} className={btnClasses}>
      {children}
    </Button>
  );
}

RegularButton.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "info",
    "success",
    "warning",
    "danger",
    "rose",
    "currentTheme.text1",
    "transparent",
  ]),
  size: PropTypes.oneOf(["sm", "lg"]),
  simple: PropTypes.bool,
  round: PropTypes.bool,
  disabled: PropTypes.bool,
  block: PropTypes.bool,
  link: PropTypes.bool,
  justIcon: PropTypes.bool,
  className: PropTypes.string,
  // use this to pass the classes props from Material-UI
  muiClasses: PropTypes.object,
  children: PropTypes.node,
};
