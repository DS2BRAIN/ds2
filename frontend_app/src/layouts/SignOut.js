import React from "react";
import Cookies from "helpers/Cookies";
import { Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userResetRequestAction } from "redux/reducers/user.js";
import { projectsResetRequestAction } from "redux/reducers/projects.js";
import { modelsReseetRequestAction } from "redux/reducers/models.js";
import { messagesResetRequestAction } from "redux/reducers/messages.js";
import { groupsResetRequestAction } from "redux/reducers/groups.js";
import { labelprojectsResetRequestAction } from "redux/reducers/labelprojects.js";

export default function SignOut(props) {
  const search = window.location.search;
  const dispatch = useDispatch();
  Cookies.deleteAllCookies();
  dispatch(userResetRequestAction());
  dispatch(projectsResetRequestAction());
  dispatch(modelsReseetRequestAction());
  dispatch(messagesResetRequestAction());
  dispatch(groupsResetRequestAction());
  dispatch(labelprojectsResetRequestAction());

  return <Redirect to={`/signin${search}`} />;
}
