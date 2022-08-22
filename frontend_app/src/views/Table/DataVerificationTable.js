import React, { useState, useEffect } from "react";
import * as api from "controller/api.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CircularProgress from "@material-ui/core/CircularProgress";
import CheckIcon from "@material-ui/icons/Check";
import Button from "@material-ui/core/Button";
import currentTheme from "assets/jss/custom.js";
import Container from "@material-ui/core/Container";
import Modal from "@material-ui/core/Modal";
import ModalPage from "components/PredictModal/ModalPage.js";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select/Select";
import FormControl from "@material-ui/core/FormControl";
import { useDispatch, useSelector } from "react-redux";
import { askModalRequestAction } from "redux/reducers/messages.js";
import { useTranslation } from "react-i18next";
import { currentThemeColor } from "assets/jss/custom";
import { fileurl } from "controller/api";

const DataVerificationTable = React.memo(
  ({ valueForPredictName, csv, trainingColumnInfo, history }) => {
    const classes = currentTheme();
    const dispatch = useDispatch();
    const { user, projects, models, messages } = useSelector(
      (state) => ({
        user: state.user,
        projects: state.projects,
        models: state.models,
        messages: state.messages,
      }),
      []
    );
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(true);

    return <div className={classes.detailContainer}>여기에 작성 시작하기</div>;
  }
);

export default DataVerificationTable;
