import React from "react";
// import "./KakaoLoginButton.css";
import * as api from "controller/api.js";

class KakaoLoginButton extends React.Component {
  componentDidMount() {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init("91529c0f48a8e8329c8f2c1701b2b13b");
    }

    const {
      tryLogin,
      registerUser,
      checked,
      signUp,
      setFailValidIdAlarm,
    } = this.props;

    window.Kakao.Auth.createLoginButton({
      container: "#kakao-login-btn",
      success: function(authObj) {
        // 로그인 성공시, API를 호출합니다.
        window.Kakao.API.request({
          url: "/v2/user/me",
          success: function(res) {
            if (signUp) {
              let User = {
                email: res.kakao_account.email,
                password: res.id + "!",
                provider: "talknote",
                socialID: res.id,
                tokenType: "kakao",
                accessToken: authObj.access_token,
              };
              api.checkValidEmail(res.kakao_account.email).then((res) => {
                if (res) {
                  registerUser(User);
                } else {
                  setFailValidIdAlarm();
                }
              });
            } else {
              let User = {
                id: res.kakao_account.email,
                password: res.id + "!",
              };
              tryLogin(User);
            }
          },
          fail: function(error) {
            if (!process.env.REACT_APP_DEPLOY) console.log(error);
          },
        });
      },
      fail: function(error) {
        if (!process.env.REACT_APP_DEPLOY) console.log(error);
      },
    });
  }

  render() {
    return (
      <div id="kakaoContainer">
        <div id="kakao-login-btn"></div>
      </div>
    );
  }
}

export default KakaoLoginButton;
