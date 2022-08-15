import React from "react";

import { useTranslation } from "react-i18next";
import { fileurl } from "controller/api";
import { Link } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

const Page404 = ({ history, isAdminPage }) => {
  const { t } = useTranslation();
  const logo = fileurl + "asset/front/img/logo_transparent.png";

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      sx={{ height: isAdminPage ? "calc(100vh - 144px)" : "100vh" }}
    >
      <Grid item xs={10}>
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Grid item sx={{ mb: 6 }}>
            <Link to="/">
              <img alt="ds2ai logo" src={logo} width={280} />
            </Link>
          </Grid>
          <Grid item sx={{ mb: 2, fontSize: 30, fontWeight: 600 }}>
            <span>404 - Page not found</span>
          </Grid>
          <Grid item sx={{ fontSize: 16 }}>
            <span style={{ wordBreak: "keep-all" }}>
              {t(
                "죄송합니다. 찾으시는 페이지가 삭제되었거나 일시적으로 사용할 수 없습니다."
              )}
            </span>
          </Grid>
          <Grid item sx={{ mt: 8 }}>
            <Button onClick={() => history.push("/")}>
              <span
                style={{
                  color: "##007bff",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                {t("")}
              </span>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Page404;
