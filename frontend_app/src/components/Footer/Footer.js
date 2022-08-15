/*eslint-disable*/
import React, { useState, useEffect } from "react";
// @material-ui/core components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
// core components
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "helpers/Cookies";
import {
  putUserRequestActionWithoutMessage,
  changeUserLanguageRequestAction,
} from "redux/reducers/user.js";

import Copyright from "components/Footer/Copyright";

export default function Footer({ footerHeight, containerWidth }) {
  const { user } = useSelector((state) => ({ user: state.user }), []);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  let sec2Height = 80;

  const [isKor, setIsKor] = useState(false);

  useEffect(() => {
    if (i18n?.language) {
      if (i18n.language === "ko") setIsKor(true);
      else if (i18n.language === "en") setIsKor(false);
    }
  }, [i18n?.language]);

  const divider = <span style={{ margin: "0 16px" }}>|</span>;

  const section1 = () => {
    const section1Arr = [
      "주식회사 디에스랩글로벌",
      "대표자 여승기",
      "contact@dslab.global",
      "1670-1728",
    ];

    const handleLanguageBtns = () => {
      const handleLanguage = (targetLang) => {
        if (user.me && user.me.lang !== targetLang) {
          dispatch(
            putUserRequestActionWithoutMessage({
              lang: targetLang,
            })
          );
        }
        Cookies.setCookie("language", targetLang, 90);
        dispatch(changeUserLanguageRequestAction(targetLang));
        i18n.changeLanguage(targetLang);
      };

      return (
        <Grid
          id="language_select_form"
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 1,
            fontSize: "12px",
          }}
        >
          <Button
            id="language_ko_btn"
            style={{
              padding: 0,
              minWidth: 0,
              border: "none",
              background: "none",
              cursor: isKor ? "default" : "pointer",
            }}
            onClick={() => {
              if (!isKor) handleLanguage("ko");
            }}
          >
            <span
              className={
                isKor
                  ? "font13 weightBold"
                  : "font13 weight400 noUnderlineHoverUnderline"
              }
              style={{
                whiteSpace: "nowrap",
                color: "var(--textWhite87)",
              }}
            >
              한국어
            </span>
          </Button>
          {divider}
          <Button
            id="language_en_btn"
            style={{
              padding: 0,
              minWidth: 0,
              border: "none",
              background: "none",
              cursor: isKor ? "pointer" : "default",
            }}
            onClick={() => {
              if (isKor) handleLanguage("en");
            }}
          >
            <span
              className={
                isKor
                  ? "font13 weight400 noUnderlineHoverUnderline"
                  : "font13 weightBold"
              }
              style={{
                whiteSpace: "nowrap",
                color: "var(--textWhite87)",
              }}
            >
              ENG
            </span>
          </Button>
        </Grid>
      );
    };

    return (
      <Grid
        sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}
      >
        <Grid
          container
          justifyContent="flex-start"
          sx={{
            width: "500px",
            fontSize: "12px",
            color: "var(--textWhite6)",
          }}
        >
          <Grid container>
            <Grid>
              <span>{t("DSLAB GLOBAL Inc.")}</span>
              {divider}
            </Grid>
            <Grid>
              <span>1670-1728</span>
              {divider}
            </Grid>
            <Grid>
              <span>contact@dslab.global</span>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item>
              <span style={{ marginRight: "4px" }}>
                {t(
                  "서울특별시 영등포구 의사당대로 83, 오투타워 5층 위워크 05-103호"
                )}
              </span>
            </Grid>
          </Grid>
          <Grid container>
            <Grid>
              <span>{t("Business registration number")} 422-88-01717</span>
            </Grid>
            {divider}
            <Grid>
              <span>{t("CEO Seungki Yeo")}</span>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          container
          flexDirection="column"
          justifyContent="space-between"
          width="auto"
          sx={{ mr: 1.5 }}
        >
          {handleLanguageBtns()}
          <Button
            id="footer_priceguide_btn"
            className="hoverOutlineGreen"
            style={{
              width: "100%",
              minHeight: "25px",
              color: "var(--secondary1)",
              fontSize: "12px",
              fontWeight: "bold",
              padding: "0 12px",
              borderRadius: 4,
              boxSizing: "border-box",
            }}
            onClick={() =>
              window.open(
                isKor
                  ? "https://ko.ds2.ai//pricing_detail.html"
                  : "https://ds2.ai/pricing_detail.html",
                "_blank"
              )
            }
          >
            {t("Price Guide")}
          </Button>
        </Grid>
      </Grid>
    );
  };

  const section2 = () => {
    const terms = (
      <span
        className="noUnderlineHoverUnderline"
        style={{ cursor: "pointer", fontWeight: "bold" }}
        onClick={() => {
          window.open(
            !isKor
              ? "https://ds2.ai/terms_of_services.html"
              : "https://ko.ds2.ai//terms_of_services.html",
            "_blank"
          );
        }}
      >
        {t("Terms of Service")}
      </span>
    );

    const privacy = (
      <span
        className="noUnderlineHoverUnderline"
        style={{ cursor: "pointer", fontWeight: "bold" }}
        onClick={() => {
          window.open(
            !isKor
              ? "https://ds2.ai/privacy.html"
              : "https://ko.ds2.ai//privacy.html",
            "_blank"
          );
        }}
      >
        {t("Privacy Policy")}
      </span>
    );

    return (
      <Grid
        container
        sx={{ width: "auto", justifyContent: "flex-start", fontSize: "12px" }}
      >
        <Grid item>
          {terms}
          {divider}
        </Grid>
        <Grid item>
          {privacy}
          {divider}
        </Grid>
        <Grid item sx={{ mr: 0.5 }}>
          <Grid className="flex itemsCenter">
            <Copyright isKor={isKor} />
          </Grid>
        </Grid>
        <Grid item>
          <span>all rights reserved.</span>
        </Grid>
      </Grid>
    );
  };

  return (
    <footer
      style={{
        padding: 0,
        width: "100%",
        height: `${footerHeight}px`,
        background: "var(--background)",
        overflowX: "hidden",
        borderTop: "1px solid #4F4F4F",
      }}
    >
      <Container
        className="fontFamilyPretendardInnerSpan"
        maxWidth="false"
        sx={{
          height: `calc(100% - ${sec2Height}px)`,
          maxWidth: `${containerWidth}px`,
          display: "flex",
          alignItems: "center",
        }}
      >
        {section1()}
      </Container>
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          background: "var(--background2)",
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: `${sec2Height}px`,
        }}
      >
        <Container maxWidth="false" style={{ maxWidth: `${containerWidth}px` }}>
          {section2()}
        </Container>
      </Grid>
    </footer>
  );
}
