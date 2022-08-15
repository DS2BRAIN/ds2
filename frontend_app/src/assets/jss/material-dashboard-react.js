/*!

 =========================================================
 * Material Dashboard React - v1.8.0 based on Material Dashboard - v1.2.0
 =========================================================

 * Product Page: http://www.creative-tim.com/product/material-dashboard-react
 * Copyright 2019 Creative Tim (http://www.creative-tim.com)
 * Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 */

import { white } from "material-ui/styles/colors";

// ##############################
// // // Function that converts from hex color to rgb color
// // // Example: input = #9c27b0 => output = 156, 39, 176
// // // Example: input = 9c27b0 => output = 156, 39, 176
// // // Example: input = #999 => output = 153, 153, 153
// // // Example: input = 999 => output = 153, 153, 153
// #############################
const hexToRgb = (input) => {
  input = input + "";
  input = input.replace("#", "");
  let hexRegex = /[0-9A-Fa-f]/g;
  if (!hexRegex.test(input) || (input.length !== 3 && input.length !== 6)) {
    throw new Error("input is not a valid hex color.");
  }
  if (input.length === 3) {
    let first = input[0];
    let second = input[1];
    let last = input[2];
    input = first + first + second + second + last + last;
  }
  input = input.toUpperCase(input);
  let first = input[0] + input[1];
  let second = input[2] + input[3];
  let last = input[4] + input[5];
  return (
    parseInt(first, 16) +
    ", " +
    parseInt(second, 16) +
    ", " +
    parseInt(last, 16)
  );
};

// ##############################
// // // Variables - Styles that are used on more than one component
// #############################

const drawerWidth = 260;

const transition = {
  transition: "all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)",
};

const container = {
  paddingRight: "15px",
  paddingLeft: "15px",
  marginRight: "auto",
  marginLeft: "auto",
};

const defaultFont = {
  fontFamily: '"Noto Sans", "Helvetica", "Arial", sans-serif',
  fontWeight: "400",
  lineHeight: "1.5em",
};

const primaryColor = ["#9c27b0", "#ab47bc", "#8e24aa", "#af2cc5"];
const warningColor = ["#ff9800", "#ffa726", "#fb8c00", "#ffa21a"];
const dangerColor = ["#f44336", "#ef5350", "#e53935", "#f55a4e"];
const successColor = ["#4caf50", "#66bb6a", "#43a047", "#5cb860"];
const infoColor = ["#00acc1", "#26c6da", "#00acc1", "#00d3ee"];
const roseColor = ["#e91e63", "#ec407a", "#d81b60", "#eb3573"];
const grayColor = [
  "#999",
  "#777",
  "#3C4858",
  "#AAAAAA",
  "#D2D2D2",
  "#DDD",
  "#b4b4b4",
  "#171B2D",
  "#333",
  "#a9afbb",
  "#eee",
  "#e7e7e7",
];
const blackColor = "#000";
const whiteColor = "#FFF";
const darkColor = "#212121";

const boxShadow = {
  boxShadow:
    "0 10px 30px -12px rgba(" +
    hexToRgb(blackColor) +
    ", 0.42), 0 4px 25px 0px rgba(" +
    hexToRgb(blackColor) +
    ", 0.12), 0 8px 10px -5px rgba(" +
    hexToRgb(blackColor) +
    ", 0.2)",
};

const primaryBoxShadow = {
  boxShadow:
    "0 4px 20px 0 rgba(" +
    hexToRgb(blackColor) +
    ",.14), 0 7px 10px -5px rgba(" +
    hexToRgb(primaryColor[0]) +
    ",.4)",
};
const infoBoxShadow = {
  boxShadow:
    "0 4px 20px 0 rgba(" +
    hexToRgb(blackColor) +
    ",.14), 0 7px 10px -5px rgba(" +
    hexToRgb(infoColor[0]) +
    ",.4)",
};
const successBoxShadow = {
  boxShadow:
    "0 4px 20px 0 rgba(" +
    hexToRgb(blackColor) +
    ",.14), 0 7px 10px -5px rgba(" +
    hexToRgb(successColor[0]) +
    ",.4)",
};
const warningBoxShadow = {
  boxShadow:
    "0 4px 20px 0 rgba(" +
    hexToRgb(blackColor) +
    ",.14), 0 7px 10px -5px rgba(" +
    hexToRgb(warningColor[0]) +
    ",.4)",
};
const dangerBoxShadow = {
  boxShadow:
    "0 4px 20px 0 rgba(" +
    hexToRgb(blackColor) +
    ",.14), 0 7px 10px -5px rgba(" +
    hexToRgb(dangerColor[0]) +
    ",.4)",
};
const roseBoxShadow = {
  boxShadow:
    "0 4px 20px 0 rgba(" +
    hexToRgb(blackColor) +
    ",.14), 0 7px 10px -5px rgba(" +
    hexToRgb(roseColor[0]) +
    ",.4)",
};

const warningCardHeader = {
  background:
    "linear-gradient(60deg, " + warningColor[1] + ", " + warningColor[2] + ")",
  ...warningBoxShadow,
};
const successCardHeader = {
  background:
    "linear-gradient(60deg, " + successColor[1] + ", " + successColor[2] + ")",
  ...successBoxShadow,
};
const dangerCardHeader = {
  background:
    "linear-gradient(60deg, " + dangerColor[1] + ", " + dangerColor[2] + ")",
  ...dangerBoxShadow,
};
const infoCardHeader = {
  background:
    "linear-gradient(60deg, " + infoColor[1] + ", " + infoColor[2] + ")",
  ...infoBoxShadow,
};
const primaryCardHeader = {
  background:
    "linear-gradient(60deg, " + primaryColor[1] + ", " + primaryColor[2] + ")",
  ...primaryBoxShadow,
};
const roseCardHeader = {
  background:
    "linear-gradient(60deg, " + roseColor[1] + ", " + roseColor[2] + ")",
  ...roseBoxShadow,
};

const cardActions = {
  margin: "0 20px 10px",
  paddingTop: "10px",
  borderTop: "1px solid " + grayColor[10],
  height: "auto",
  ...defaultFont,
};

const cardHeader = {
  margin: "-20px 15px 0",
  borderRadius: "3px",
  padding: "15px",
};

const card = {
  display: "inline-block",
  position: "relative",
  width: "100%",
  margin: "25px 0",
  boxShadow: "0 1px 4px 0 rgba(" + hexToRgb(blackColor) + ", 0.14)",
  borderRadius: "3px",
  color: "rgba(" + hexToRgb(blackColor) + ", 0.87)",
  background: darkColor,
};

const defaultBoxShadow = {
  border: "0",
  borderRadius: "3px",
  boxShadow:
    "0 10px 20px -12px rgba(" +
    hexToRgb(blackColor) +
    ", 0.42), 0 3px 20px 0px rgba(" +
    hexToRgb(blackColor) +
    ", 0.12), 0 8px 10px -5px rgba(" +
    hexToRgb(blackColor) +
    ", 0.2)",
  padding: "10px 0",
  transition: "all 150ms ease 0s",
};

const title = {
  color: grayColor[2],
  textDecoration: "none",
  fontWeight: "400",
  marginTop: "30px",
  marginBottom: "25px",
  minHeight: "32px",
  fontFamily: "'Noto Sans', 'Helvetica', 'Arial', sans-serif",
  "& small": {
    color: grayColor[1],
    fontWeight: "400",
    lineHeight: "1",
  },
};

const cardTitle = {
  ...title,
  marginTop: "0",
  marginBottom: "3px",
  minHeight: "auto",
  "& a": {
    ...title,
    marginTop: ".625rem",
    marginBottom: "0.75rem",
    minHeight: "auto",
  },
};

const cardSubtitle = {
  marginTop: "-.375rem",
};

const cardLink = {
  "& + $cardLink": {
    marginLeft: "1.25rem",
  },
};

const whiteTheme = {
  text1: "rgb(58, 71, 78)",
  text21: "rgba(255, 255, 255, 0.5)",
  text22: "white",
  background1: "#f6f9ff",
  background2: "white",
  //   'background1': 'rgb(248, 249, 252)',
  // 'background2': 'rgb(248, 249, 252)',
  background3: "#091936",
  // 'background3': 'rgb(29, 36, 47)',
  subText: "rgba(125, 130, 133,1)",
  deactivateButtonBackground: "rgba(125, 130, 133,0.5)",
  border1: "#999999",
  border2: "white",
  container2: "rgba(47, 170, 247, 0.2)",
  container3: "white",
  tableBorderBottom: "rgba(224,224,224,1)",
  /*'tableRow1': 'rgba(47, 170, 247, 0.04)',
    'tableRow2': 'rgba(47, 170, 247, 0.0)',

    'tableRow2': 'rgba(76, 80, 82, 0.04)',*/
  highlight1: "rgb(41, 121, 255)",
  highlightSemiTransparents: "rgb(41, 121, 255, 0.5)",
  highlightSide: "rgba(58,112,170,1)",
};
/*
const whiteTheme = {
  'text1': 'rgb(58, 71, 78)',
  'text21': 'rgba(255, 255, 255, 0.8)',
  'text22': 'white',
  'background1': 'rgba(64, 143, 255, 0.05)',
  'background2': 'rgba(64, 143, 255, 0.05)',
  'background3': '#2979ff',
  'border1': '#999999',
  'border2': 'white',
  'container2': 'rgba(47, 170, 247, 0.2)',
  'container3': 'white',
  'highlight1': '#2979ff',
} */

const darkTheme = {
  background1: "#161616",
  background2: "#2F3236",
  gradientBackground1: "linear-gradient(0deg, #212121, #212121)",
  gradientBackground2: "linear-gradient(180deg, #2F3236 0%, #161616 64.44%)",
  backgroundSidebar: "#363636",
  backgroundNeo: "#303030",
  backgroundWhite: "#ffffff",
  surface1: "#212121",
  surface2: "#585C61",
  hovering: "#3A3B3C",
  primary1: "#18A0FB",
  primary2: "#2979FF",
  textWhite: "#FFFFFF",
  textWhite87: "rgba(255, 255, 255, 0.87)",
  textWhite6: "rgba(255, 255, 255, 0.6)",
  textWhite38: "rgba(255, 255, 255, 0.38)",
  textLightGrey: "#AAAAAA",
  textMediumGrey: "#818181",
  textMediumGrey2: "rgba(129, 129, 129, 0.87)",
  textBlack: "#000000",
  textDarkgrey: "#3D3D3D",
  gradientColor1: "#1A9CE8",
  gradientColor2: "#2979FF",
  boxshadowColor1: "rgba(41, 121, 255, 0.4)",
  highlightSemiTransparents: "rgba(41, 121, 255, 0.5)",
  highlightFocusTransparents: "rgba(41, 121, 255, 0.3)",
  tableBorderBottom: "#3A3B3C",
  deactivateButtonBackground: "rgba(125, 130, 133,0.1)",
  deactivateButtonBackgroundBorder: "rgba(125, 130, 133,0.01)",
};

const currentTheme = darkTheme;

export {
  currentTheme,
  whiteTheme,
  darkTheme,
  hexToRgb,
  //variables
  drawerWidth,
  transition,
  container,
  boxShadow,
  card,
  defaultFont,
  primaryColor,
  warningColor,
  dangerColor,
  successColor,
  infoColor,
  roseColor,
  grayColor,
  blackColor,
  whiteColor,
  darkColor,
  primaryBoxShadow,
  infoBoxShadow,
  successBoxShadow,
  warningBoxShadow,
  dangerBoxShadow,
  roseBoxShadow,
  warningCardHeader,
  successCardHeader,
  dangerCardHeader,
  infoCardHeader,
  primaryCardHeader,
  roseCardHeader,
  cardActions,
  cardHeader,
  defaultBoxShadow,
  title,
  cardTitle,
  cardSubtitle,
  cardLink,
};
