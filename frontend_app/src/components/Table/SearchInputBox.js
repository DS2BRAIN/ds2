import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";

import { InputBase, Paper, Tooltip } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";

import currentTheme from "assets/jss/custom.js";

const SearchInputBox = ({ setSearchedValue }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const classes = currentTheme();
  const dispatch = useDispatch();

  const urlLoc = window.location;
  const urlPath = urlLoc.pathname;
  const urlSearch = urlLoc.search;
  const urlSearchParams = new URLSearchParams(urlSearch);

  const [searchingValue, setSearchingValue] = useState("");
  const [isSearched, setIsSearched] = useState(false);
  const [isTyped, setIsTyped] = useState(false);

  useEffect(() => {
    if (searchingValue) setIsTyped(true);
    else setIsTyped(false);
  }, [searchingValue]);

  const onSubmitSearch = (e) => {
    e.preventDefault();
    setIsSearched(true);
    onSetSearchOutput(searchingValue);
  };

  const onChangeSearch = async (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchingValue(value);
  };

  const onGetDefault = () => {
    if (isSearched) {
      setIsSearched(false);
      onSetSearchOutput("");
    }
    setSearchingValue("");
  };

  const onSetSearchOutput = (value) => {
    if (urlPath.includes("/dataconnector") || urlPath.includes("/labelling")) {
      let urlSP = urlSearchParams;
      if (value === "") {
        urlSP.delete("search");
        if (urlSP.has("page")) urlSP.delete("page");
      } else {
        urlSP.set("search", value);
      }
      history.push(urlPath + "?" + urlSP);
    } else {
      setSearchedValue(value);
    }
  };

  return (
    <Tooltip
      id="search_tooltip"
      title={
        <div style={{ fontSize: "12px" }}>
          {urlPath.includes("/dataconnector")
            ? t("Enter the data name.")
            : t("Enter the project name")}
        </div>
      }
      placement="top"
    >
      <form
        onSubmit={(e) => onSubmitSearch(e)}
        className={classes.form}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginTop: 0,
        }}
        noValidate
      >
        <Paper className={classes.searchBox}>
          <InputBase
            id="search_input"
            className={classes.input}
            placeholder={t("Search")}
            value={searchingValue}
            onChange={onChangeSearch}
            multiline={false}
            style={{
              fontSize: "15px",
              paddingLeft: "10px",
              color: "var(--textWhite87)",
            }}
          />
          {isTyped && (
            <CloseIcon
              id="search_close"
              className={classes.pointerCursor}
              onClick={onGetDefault}
            />
          )}
        </Paper>
        {isTyped && (
          <SearchIcon
            id="search_icon"
            onClick={(e) => onSubmitSearch(e)}
            className={classes.pointerCursor}
          />
        )}
      </form>
    </Tooltip>
  );
};

export default SearchInputBox;
