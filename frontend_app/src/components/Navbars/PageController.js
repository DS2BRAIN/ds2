import React from "react";
import currentTheme from "assets/jss/custom.js";
import KeyboardArrowLeftOutlinedIcon from "@material-ui/icons/KeyboardArrowLeftOutlined";
import KeyboardArrowRightOutlinedIcon from "@material-ui/icons/KeyboardArrowRightOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

const PageController = ({ history }) => {
  const classes = currentTheme();

  const onClickForceRefreshBtn = () => {
    // window.location.reload(true); -> force reload deprecated
    window.location.href = window.location.href;
  };

  return (
    <>
      <KeyboardArrowLeftOutlinedIcon
        className={
          classes.browserIcon +
          " " +
          classes.backforwardIcon +
          " " +
          classes.fillBDhoverFF
        }
        onClick={() => {
          history.goBack();
        }}
      />
      <KeyboardArrowRightOutlinedIcon
        className={
          classes.browserIcon +
          " " +
          classes.backforwardIcon +
          " " +
          classes.fillBDhoverFF
        }
        onClick={() => {
          history.goForward();
        }}
      />
      <RefreshIcon
        className={
          classes.browserIcon +
          " " +
          classes.backforwardIcon +
          " " +
          classes.fillBDhoverFF
        }
        style={{ height: "30px", width: "30px", padding: "3px" }}
        onClick={onClickForceRefreshBtn}
      />
    </>
  );
};
export default React.memo(PageController);
