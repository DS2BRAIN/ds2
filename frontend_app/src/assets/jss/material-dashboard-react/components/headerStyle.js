import {
  currentTheme,
  container,
  defaultFont,
  primaryColor,
  defaultBoxShadow,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  whiteColor,
  grayColor,
} from "assets/jss/material-dashboard-react.js";

const headerStyle = () => ({
  appBar: {
    backgroundColor: "transparent",
    boxShadow: "none",
    borderBottom: "0",
    marginBottom: "0",
    position: "absolute",
    width: "100%",
    height: "5%",
    paddingTop: "10px",
    zIndex: "1029",
    border: "0",
    borderRadius: "3px",
    padding: "10px 0",
    transition: "all 150ms ease 0s",
    minHeight: "50px",
    display: "block",
  },
  container: {
    minHeight: "50px",
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: "15px",
    paddingRight: "15px",
  },
  flex: {
    flex: 1,
    flexWrap: "nowrap",
  },
  title: {
    letterSpacing: "unset",
    lineHeight: "30px",
    fontSize: "30px",
    borderRadius: "3px",
    textTransform: "none",
    marginLeft: "20px",
    color: "rgb(58, 71, 78)",
    "&:hover,&:focus": {
      backgroundColor: "transparent",
      color: "rgb(58, 71, 78)",
    },
  },
  appResponsive: {
    top: "8px",
  },
  alarmButton: {
    cursor: "pointer",
    width: "100%",
    zIndex: "999999",
    color: "#2979ff",
    border: "2px solid #2979ff",
    borderRadius: "5px !important",
  },
  readAll: {
    width: "100%",
    textAlign: "right",
    marginBottom: "20px",
    cursor: "pointer",
  },
  readNone: {
    width: "100%",
    marginBottom: "10px",
    borderBottom: "1px solid gray",
  },
});

export default headerStyle;
