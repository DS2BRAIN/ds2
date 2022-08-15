import {
  currentTheme,
  primaryColor,
  dangerColor,
  successColor,
  grayColor,
  defaultFont,
} from "assets/jss/material-dashboard-react.js";

const mainColor = currentTheme.highlight1;

const customInputStyle = {
  disabled: {
    "&:before": {
      backgroundColor: "transparent !important",
    },
  },
  underline: {
    "&:hover:not($disabled):before,&:before": {
      borderColor: mainColor + " !important",
      borderWidth: "1px !important",
    },
    "&:after": {
      borderColor: mainColor,
    },
  },
  underlineError: {
    "&:after": {
      borderColor: mainColor,
    },
  },
  underlineSuccess: {
    "&:after": {
      borderColor: mainColor,
    },
  },
  labelRoot: {
    ...defaultFont,
    color: mainColor + " !important",
    fontWeight: "400",
    fontSize: "14px",
    lineHeight: "1.42857",
    letterSpacing: "unset",
  },
  labelRootError: {
    color: mainColor,
  },
  labelRootSuccess: {
    color: mainColor,
  },
  feedback: {
    position: "absolute",
    top: "18px",
    right: "0",
    zIndex: "2",
    display: "block",
    width: "24px",
    height: "24px",
    textAlign: "center",
    pointerEvents: "none",
  },
  marginTop: {
    marginTop: "16px",
  },
  formControl: {
    paddingBottom: "10px",
    margin: "27px 0 0 0",
    position: "relative",
    verticalAlign: "unset",
  },
};

export default customInputStyle;
