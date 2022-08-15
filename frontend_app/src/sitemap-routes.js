import React from "react";
import { Route, Switch } from "react-router";

export default (
  <Switch>
    <Route path="/error" />
    <Route path="/signout" />
    <Route path="/signin" />
    <Route path="/signup" />
    <Route path="/admin" />
    <Route path="/admin/projectList" />
    <Route path="/admin/newProject" />
    <Route path="/admin/train" />
    <Route path="/admin/project" />
    <Route path="/admin/modellists" />
    <Route path="/admin/dataconnector" />
    <Route path="/admin/labelling" />
    <Route path="/admin/ecosystem" />
    <Route path="/admin/setting/userinfo" />
    <Route path="/admin/setting/usageplan" />
    <Route path="/admin/setting/usercount" />
    <Route path="/admin/setting/notilist" />
    <Route path="/admin/setting/share" />
    <Route path="/forgetpassword" />
    <Route path="/resetpassword" />
  </Switch>
);
