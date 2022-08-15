import React, { useEffect, useState } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import ReactCountryFlag from "react-country-flag";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import { changeUserLanguageRequestAction } from "redux/reducers/user.js";
import { useTranslation } from "react-i18next";
import Cookies from "helpers/Cookies";
import {
  putUserRequestAction,
  putUserRequestActionWithoutMessage,
} from "../../redux/reducers/user";
import "assets/css/material-control.css";

export default function Language(props) {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );
  const { t, i18n } = useTranslation();
  const [defaultLang, setDefaultLang] = useState("KOR");

  const languageChange = (e) => {
    Cookies.setCookie("language", e.target.value, 90);
    if (user.me && user.me.lang !== e.target.value) {
      dispatch(
        putUserRequestActionWithoutMessage({
          lang: e.target.value,
        })
      );
    }
    dispatch(changeUserLanguageRequestAction(e.target.value));
    i18n.changeLanguage(e.target.value);
  };

  useEffect(() => {
    const url = window.location.href;
    var language = "ko";
    const navigatorLanguage = (
      window.navigator.userLanguage || window.navigator.language
    ).toLowerCase();

    if (url.indexOf("?lang=en") >= 0) {
      language = "en";
    } else if (user.me && user.me.lang) {
      language = user.me.lang;
    } else if (Cookies.getCookie("language")) {
      language = Cookies.getCookie("language");
    } else {
      if (
        navigatorLanguage.indexOf("ko") >= 0 ||
        navigatorLanguage.indexOf("kr") >= 0
      ) {
        language = "ko";
      } else {
        language = "en";
      }
    }

    i18n.changeLanguage(language);
    dispatch(changeUserLanguageRequestAction(language));
    Cookies.setCookie("language", language, 90);
  }, [user.me?.lang]);

  return (
    <div id="languageSelector">
      <Select
        id="languageSelectForm"
        className={classes.colorBDhoverFF}
        labelId="langLabel"
        style={{
          color:
            props.languageColor == undefined
              ? currentThemeColor.textWhite87
              : props.languageColor,
        }}
        value={user.language}
        disableUnderline={true}
        onChange={languageChange}
      >
        <MenuItem
          style={{
            color:
              props.languageColor == undefined
                ? currentThemeColor.textWhite87
                : props.languageColor,
          }}
          value="en"
        >
          ENG
        </MenuItem>
        <MenuItem
          style={{
            color:
              props.languageColor == undefined
                ? currentThemeColor.textWhite87
                : props.languageColor,
          }}
          value="ko"
        >
          KOR
        </MenuItem>
      </Select>
    </div>
  );
}
