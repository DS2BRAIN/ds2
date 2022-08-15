import {
  currentTheme,
  drawerWidth,
  transition,
  boxShadow,
  defaultFont,
  primaryColor,
  primaryBoxShadow,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  whiteColor,
  darkColor,
  grayColor,
  blackColor,
  hexToRgb,
} from "assets/jss/material-dashboard-react.js";
import { white } from "material-ui/styles/colors";
import { TetrahedronGeometry } from "three";

const sidebarStyle = (theme) => ({
  drawerPaper: {
    border: "none",
    position: "fixed",
    top: "0",
    bottom: "0",
    left: "0",
    zIndex: "1030",
    background: currentTheme.backgroundSidebar + "!important",
    width: drawerWidth,
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      position: "fixed",
      height: "100%",
    },
    [theme.breakpoints.down("sm")]: {
      width: drawerWidth,
      position: "fixed",
      display: "block",
      top: "0",
      height: "100vh",
      right: "0",
      left: "auto",
      zIndex: "1032",
      visibility: "visible",
      overflowY: "visible",
      borderTop: "none",
      textAlign: "left",
      paddingRight: "0px",
      paddingLeft: "0",
      transform: `translate3d(${drawerWidth}px, 0, 0)`,
      ...transition,
    },
  },
  drawerPaperRTL: {
    [theme.breakpoints.up("md")]: {
      left: "auto !important",
      right: "0 !important",
    },
    [theme.breakpoints.down("sm")]: {
      left: "0  !important",
      right: "auto !important",
    },
  },
  logo: {
    position: "relative",
    padding: "15px 15px",
    zIndex: "4",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: "0",

      height: "1px",
      right: "15px",
      width: "calc(100% - 30px)",
    },
  },
  logoLink: {
    ...defaultFont,
    textTransform: "uppercase",
    padding: "5px 0",
    display: "block",
    fontSize: "18px",
    textAlign: "left",
    fontWeight: "400",
    lineHeight: "30px",
    textDecoration: "none",
    backgroundColor: "transparent",
    "&,&:hover": {
      color: darkColor,
    },
  },
  logoLinkRTL: {
    textAlign: "right",
  },
  logoImage: {
    width: "80%",
    display: "inline-block",
    maxHeight: "30px",
    marginLeft: "10px",
    marginRight: "15px",
  },
  img: {
    width: "65%",
  },
  background: {
    position: "absolute",
    zIndex: "1",
    height: "100%",
    width: "100%",
    display: "block",
    top: "0",
    left: "0",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    "&:after": {
      position: "absolute",
      zIndex: "3",
      width: "100%",
      height: "100%",
      content: '""',
      display: "block",
      opacity: ".8",
    },
  },
  list: {
    // height: "calc(100vh - 95px)",
    marginTop: "20px",
    paddingLeft: "0",
    paddingTop: "0",
    paddingBottom: "0",
    marginBottom: "0",
    listStyle: "none",
    position: "unset",
    // overflow: "auto",
  },
  item: {
    position: "relative",
    display: "block",
    textDecoration: "none",
    "&:hover,&:focus,&:visited,&": {
      color: whiteColor,
    },
  },
  itemGroup: {
    width: "auto",
    margin: "15px",
    backgroundColor: "transparent",
    lineHeight: "23px",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#fff",
    cursor: "default",
  },
  itemLink: {
    width: "auto",
    height: "50px",
    // "&:hover,&:focus": {
    //   backgroundColor: "rgba(0,75,168,0.8)",
    // },
    transition: "all 300ms linear",
    position: "relative",
    display: "block",
    padding: "15px 25px",
    backgroundColor: "transparent",
    ...defaultFont,
  },
  itemIcon: {
    width: "24px",
    height: "30px",
    fontSize: "24px",
    lineHeight: "30px",
    float: "left",
    marginRight: "15px",
    textAlign: "center",
    verticalAlign: "middle",
    color: currentTheme.text22,
  },
  itemIconRTL: {
    marginRight: "3px",
    marginLeft: "15px",
    float: "right",
  },
  itemText: {
    ...defaultFont,
    margin: "0",
    lineHeight: "18px",
    fontSize: "15px",
    color: currentTheme.text22,
    transition: "all 300ms linear",
  },
  itemTextRTL: {
    textAlign: "right",
  },
  whiteFont: {
    color: whiteColor,
  },
  purple: {
    backgroundColor: primaryColor[0],
    ...primaryBoxShadow,
    "&:hover,&:focus": {
      backgroundColor: primaryColor[0],
      ...primaryBoxShadow,
    },
  },
  blue: {
    backgroundColor: "rgba(0,75,168,0.8)",
    "&:hover,&:focus": {
      backgroundColor: "rgba(0,75,168,0.8)",
    },
  },
  green: {
    backgroundColor: successColor[0],
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(successColor[0]) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(successColor[0]) +
      ",.2)",
    "&:hover,&:focus": {
      backgroundColor: successColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(successColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(successColor[0]) +
        ",.2)",
    },
  },
  orange: {
    backgroundColor: warningColor[0],
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(warningColor[0]) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(warningColor[0]) +
      ",.2)",
    "&:hover,&:focus": {
      backgroundColor: warningColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(warningColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(warningColor[0]) +
        ",.2)",
    },
  },
  red: {
    backgroundColor: dangerColor[0],
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(dangerColor[0]) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(dangerColor[0]) +
      ",.2)",
    "&:hover,&:focus": {
      backgroundColor: dangerColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(dangerColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(dangerColor[0]) +
        ",.2)",
    },
  },
  sidebarWrapper: {
    position: "relative",
    height: "calc(100vh)",
    width: "260px",
    zIndex: "4",
    overflow: "auto",
    overflowScrolling: "touch",
  },
  activePro: {
    [theme.breakpoints.up("md")]: {
      position: "absolute",
      width: "100%",
      bottom: "13px",
    },
  },
  recentProject: {
    color: currentTheme.text21,
    border: "none",
    transition: "all 300ms linear",
    "&:hover,&:focus": {
      color: currentTheme.text22,
    },
  },
  showVideo: {
    cursor: "pointer",
    width: "auto",
    margin: "10px 15px 0",
    display: "flex",
    alignItems: "center",
    padding: "10px 15px",
    transition: "all 300ms linear",
    fontSize: "14px",
    lineHeight: "1.5em",
    borderRadius: "3px",
    backgroundColor: "transparent",
  },
  freeLink: {
    cursor: "pointer",
    width: "auto",
    margin: "10px 15px 0",
    display: "flex",
    alignItems: "center",
    padding: "10px 15px",
    fontSize: "14px",
    lineHeight: "1.5em",
    borderRadius: "3px",
    backgroundColor: "transparent",
    color: currentTheme.textWhite,
    transition: "all 300ms linear",
    "&:hover,&:focus": {
      color: currentTheme.textWhite,
    },
  },
  videoContainer: {
    display: "flex",
    justifyContent: "flex-end",
  },
  videoModal: {
    display: "flex",
    justifyContent: "flex-end",
  },
  videoList: {
    width: "200px",
    position: "absolute",
    bottom: "150px",
    backgroundColor: currentTheme.background2,
    padding: "10px",
    borderRadius: "10px",
    border: "2px solid " + currentTheme.border1,
  },
  videoItem: {
    padding: "10px",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  modalContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    position: "absolute",
    width: "50%",
    minWidth: "550px",
    height: "40%",
    minHeight: "650px",
    backgroundColor: currentTheme.background2,
    borderRadius: "20px",
    border: "2px solid " + currentTheme.border1,
    padding: "20px",
  },
  closeImg: {
    cursor: "pointer",
    float: "right",
  },
  dataLink: {
    zIndex: "9999",
    position: "absolute",
    top: "24px",
    right: "64px",
    textDecoration: "underline !important",
  },
});

export default sidebarStyle;
