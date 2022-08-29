import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { NavLink } from "react-router-dom";
import classNames from "classnames";
import PropTypes from "prop-types";

import * as api from "controller/api.js";
import { toHome } from "components/Function/globalFunc";
import { updateNotification } from "redux/reducers/user";
import currentTheme from "assets/jss/custom.js";
import NotiPopover from "components/Notifications/NotiPopover";
import PageController from "./PageController";
import NavMenu from "./NavMenu";

import { AppBar, Toolbar } from "@material-ui/core";
import { Container, Grid, IconButton } from "@mui/material";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

export default function Header(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = currentTheme();
  const { user } = useSelector((state) => ({ user: state.user }), []);
  const { logo, color } = props;
  const appBarClasses = classNames({
    [" " + classes[color]]: color,
  });

  useEffect(() => {
    function getNotiInfo(event) {
      const response = JSON.parse(event.data);
      dispatch(updateNotification(response.result));
    }
    const SSEapi = api.getNotificationViaSSE();

    SSEapi.addEventListener("new_message", getNotiInfo);
    return () => {
      SSEapi.close();
    };
  }, []);

  return (
    <AppBar
      className={classes.appBar + appBarClasses}
      style={{ height: `${props.headerHeight}px`, minWidth: 1400, left: 0 }}
    >
      <Container
        maxWidth="false"
        style={{ maxWidth: `${props.containerWidth}px` }}
      >
        <Toolbar className="contentSpaceBtw" disableGutters id="navToolbar">
          <Grid container>
            <Grid
              item
              id="logoToAdmin"
              onClick={() => {
                toHome(history);
              }}
              style={{ cursor: "pointer", lineHeight: "60px", marginRight: 48 }}
            >
              <img src="/images/logo_transparent.png" alt="logo" width={120} />
            </Grid>

            <NavMenu />
          </Grid>
          <Toolbar disableGutters>
            <a
              key="setting"
              href="/admin/setting/userinfo"
              className={classes.freeLink}
              id="setting_link"
              style={{ alignItems: "center" }}
            >
              <AccountCircleOutlinedIcon
                style={{ marginTop: "3px", marginRight: "10px" }}
                id="navPersonIcon"
              />
              {user?.me && (
                <b
                  className={classes.navUser + " " + classes.colorBDhoverFF}
                  style={{
                    display: "inline-block",
                    width: "auto",
                    maxWidth: "150px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.me.name ? user.me.name : user.me.email}
                </b>
              )}
            </a>
            <NotiPopover />
            <IconButton
              id="logoutLink"
              sx={{ ml: 1, mr: 2, mt: 0.25 }}
              onClick={() => {
                window.location.pathname = "signout/";
              }}
            >
              <ExitToAppIcon className={classes.fillBDhoverFF} />
            </IconButton>

            <Grid className="itemsCenter">
              <PageController />
            </Grid>
          </Toolbar>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

Header.propTypes = {
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  routes: PropTypes.arrayOf(PropTypes.object),
};
