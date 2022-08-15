import {
  currentTheme,
  defaultFont,
  container,
  primaryColor,
  grayColor,
} from "assets/jss/material-dashboard-react.js";

import { currentThemeColor } from "assets/jss/custom";

const footerStyle = {
  footer: {
    background: currentThemeColor.backgroundNeo,
    minWidth: "768px",
    overflowX: "hidden",
    bottom: "0",
    borderTop: "1px solid " + "#4F4F4F",
    padding: "15px 0",
    ...defaultFont,
  },
  footerTextBasic: {
    color: currentThemeColor.gray4,
    fontFamily: "Noto Sans KR",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "20px",
  },
};
export default footerStyle;
