import React, { useEffect, useState, useRef } from "react";

//@material-ui
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import History from "./History/History";
import { useDispatch, useSelector } from "react-redux";
import {
  getJupyterProjectRequestAction,
  getProjectRequestAction,
} from "../../../redux/reducers/projects";
import { getModelRequestAction } from "../../../redux/reducers/models";
import { useTranslation } from "react-i18next";

const defaultStyles = {
  div_menuBox: {
    marginBottom: "5px",
    marginTop: "5px",
    border: "1px solid #E2E2E2",
  },
  Grid_menuTitle: {
    color: "#E2E2E2",
    fontSize: "15px",
    paddingLeft: "10px",
    height: "25px",
  },
};

const JupyterPannel = (props) => {
  const dispatch = useDispatch();
  const { user, projects, messages, models, groups } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
      messages: state.messages,
      models: state.models,
      groups: state.groups,
    }),
    []
  );
  const path = window.location.pathname;
  let interval;
  const { t } = useTranslation();

  useEffect(() => {
    const pathArr = path.split("/");
    const id = pathArr[pathArr.length - 1];
    dispatch(getJupyterProjectRequestAction(id));
    const state = props.history.location.state;
  }, [path]);

  return (
    <>
      <History {...props} project={projects.project} />
    </>
  );
};
export default JupyterPannel;
