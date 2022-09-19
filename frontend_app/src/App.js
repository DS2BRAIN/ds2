import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import * as api from "controller/api";
// core components
import Admin from "layouts/Admin.js";
import SignOut from "layouts/SignOut.js";
import SignIn from "layouts/SignIn.js";
import SignUp from "layouts/SignUp.js";
import ForgetPassword from "layouts/ForgetPassword.js";
import ResetPassword from "layouts/ResetPassword.js";
import BrowserError from "layouts/BrowserError.js";
import EmailConfirm from "layouts/EmailConfirm.js";
import Page404 from "views/Error/Page404";
import { IS_ENTERPRISE } from "variables/common";

import MinimalFeedback from "minimal-feedback";

import "minimal-feedback/dist/index.css";
import "assets/css/material-dashboard-react-dark.css?v=1.8.0";
//import "assets/css/material-dashboard-react-white.css?v=1.8.0";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import "perfect-scrollbar/css/perfect-scrollbar.css";
import "assets/css/control-index.css";
import "assets/css/control-custom.css";

const versionStyle = {
  display: "inline-block",
  padding: "0 16px",
  border: "1px solid white",
  backgroundColor: "rgba(0,0,0,0.6)",
  color: "white",
  fontSize: 14,
  fontWeight: 600,
  position: "fixed",
  bottom: 0,
  left: 0,
  zIndex: 999999,
};

const App = () => {
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );

  const host = window.location.host;
  const devHost = [
    "localhost:13000",
    "refactoring.ds2.ai",
    "enterprisedev.ds2.ai",
  ];
  const isDevEnv = devHost.indexOf(host) > -1;

  const [text, settext] = useState({ feedback: "" });
  const [isPostFeedbackLoading, setIsPostFeedbackLoading] = useState(false);

  const postFeedback = () => {
    // logic here
    // console.log(text);
    const feedbackInfo = {
      feedback_email: user.me ? user.me.email : window.location.pathname,
      feedback_type: text.type,
      feedback_content: text.feedback,
    };

    setIsPostFeedbackLoading(true);

    api
      .postFeedback(feedbackInfo)
      .then((res) => {
        // console.log(res.data);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setIsPostFeedbackLoading(false);
      });
  };

  useEffect(() => {
    if (!IS_ENTERPRISE) {
      window.ChannelIO(
        "updateUser",
        {
          language: user.language,
        },
        function onUpdateUser(error, user) {
          if (error) {
            if (!process.env.REACT_APP_DEPLOY) console.error(error);
          } else {
            if (!process.env.REACT_APP_DEPLOY)
              console.log("updateUser success", user);
          }
        }
      );
      // window.ChannelIO("boot", {
      //   pluginKey: "0215031b-7a8b-4225-a5f0-f59a49968e66",
      // });
    }
  }, [user.language]);

  return (
    <div id="app_container">
      <BrowserRouter>
        <Switch>
          <Route path="/error" component={BrowserError} />
          <Route path="/signout" component={SignOut} />
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <Route exact path="/" component={Admin} />
          <Route path="/admin" component={Admin} />
          <Route path="/forgetpassword" component={ForgetPassword} />
          <Route path="/resetpassword" component={ResetPassword} />
          <Route path="/emailconfirm" component={EmailConfirm} />
          <Route component={Page404} />
        </Switch>
      </BrowserRouter>

      {IS_ENTERPRISE && (
        <div id="feedback_container">
          <MinimalFeedback
            id="feedback_box"
            save={() => {
              if (!isPostFeedbackLoading) postFeedback();
            }}
            value={text}
            onChange={(e) => settext(e)}
            style={{ color: "var(--surface1)" }}
          />
        </div>
      )}

      {isDevEnv && (
        <span style={versionStyle}>{process.env.REACT_APP_GIT_SHA}</span>
      )}
    </div>
  );
};

export default App;
