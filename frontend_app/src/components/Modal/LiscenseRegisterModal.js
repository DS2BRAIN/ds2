import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import * as api from "controller/api.js";
import currentTheme from "assets/jss/custom";
import { setIsValidUserRequestAction } from "redux/reducers/user";
import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages";
import Language from "components/Language/Language";
import Button from "components/CustomButtons/Button";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import CloseIcon from "@mui/icons-material/Close";

const LiscenseRegisterModal = () => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => ({ user: state.user }), []);
  const { t } = useTranslation();

  const [sendKeyLoading, setSendKeyLoading] = useState(false);
  const [isKeyError, setIsKeyError] = useState(false);
  const [keyValue, setKeyValue] = useState(null);

  const sendKeyValue = () => {
    api
      .postRegisterKey(keyValue)
      .then((res) => {
        dispatch(setIsValidUserRequestAction(true));

        dispatch(
          openSuccessSnackbarRequestAction(
            user.language == "ko" ? res?.data?.message : res?.data?.message_en
          )
        );
      })
      .catch((err) => {
        dispatch(
          openErrorSnackbarRequestAction(
            err.response?.data?.message
              ? user.language == "ko"
                ? err.response?.data?.message
                : err.response?.data?.message_en
              : t("Verification failed")
          )
        );
      })
      .finally(() => {
        setSendKeyLoading(false);
      });
  };

  const sendTrialRequest = () => {
    api
      .postRegisterTrial()
      .then((res) => {
        dispatch(setIsValidUserRequestAction(true));
        dispatch(
          openSuccessSnackbarRequestAction(
            user.language == "ko" ? res?.data?.message : res?.data?.message_en
          )
        );
      })
      .catch((err) => {
        dispatch(
          openErrorSnackbarRequestAction(
            err.response?.data?.message
              ? user.language == "ko"
                ? err.response?.data?.message
                : err.response?.data?.message_en
              : t("Registration failed")
          )
        );
      })
      .finally(() => {
        setSendKeyLoading(false);
      });
  };

  const onCloseLicenseModal = () => {
    dispatch(setIsValidUserRequestAction(null));
  };

  return (
    <Modal
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={user.isValidUser === false}
      //   onClose={onCloseLicenseModal}
      className={classes.modalContainer}
    >
      <div
        style={{
          width: !isKeyError ? "50vh" : "30vh",
          height: !isKeyError ? "50vh" : "20vh",
          border: "3px solid var(--secondary1)",
          borderRadius: "5px",
          backgroundColor: "#1D1F1F",
        }}
      >
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          style={{
            paddingTop: "10px",
            color: "var(--secondary1)",
            textAlign: "center",
          }}
        >
          <Grid
            item
            container
            justifyContent="space-between"
            alignItems="center"
            xs={11}
            style={
              !isKeyError ? { marginBottom: "4vh" } : { marginBottom: "2vh" }
            }
          >
            <Box
              component="div"
              style={{ borderBottom: "2px solid var(--secondary1)" }}
            >
              <Language languageColor="var(--secondary1)" />
            </Box>
            <CloseIcon
              aria-label="close_button"
              onClick={onCloseLicenseModal}
              sx={{
                fill: "var(--secondary1)",
                fontSize: 30,
                cursor: "pointer",
              }}
            />
          </Grid>

          {!isKeyError ? (
            <Grid container justifyContent="center">
              <Grid item xs={10} style={{ margin: "5px", fontSize: "15px" }}>
                {t("Please enter your license key")}.
              </Grid>
              <Grid item xs={8} style={{ marginTop: "30px" }}>
                <div
                  style={{
                    borderBottom: "1px solid " + "var(--secondary1)",
                    width: "100%",
                    marginBottom: "16px",
                    padding: "4px 8px",
                  }}
                >
                  <InputBase
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="enterpriseKey"
                    placeholder={t("")}
                    label={t("public KEY")}
                    type="password"
                    id="enterpriseKey"
                    autoComplete="current-password"
                    onChange={(e) => {
                      setKeyValue(e.target.value);
                    }}
                    value={keyValue}
                    style={{
                      color: "var(--secondary1)",
                      caretColor: "var(--secondary1)",
                    }}
                  />
                </div>
              </Grid>
              <Grid item xs={10} style={{ marginTop: "48px" }}>
                <Button
                  id="verify_licensekey_btn"
                  shape="greenOutlinedSquare"
                  disabled={sendKeyLoading !== false}
                  onClick={() => {
                    setSendKeyLoading(true);
                    sendKeyValue();
                  }}
                >
                  {t("certification")}
                </Button>
                <Button
                  id="use_free30days_btn"
                  shape="greenContainedSquare"
                  sx={{
                    ml: 2,
                  }}
                  onClick={() => sendTrialRequest()}
                >
                  {t("30 days free trial")}
                </Button>
              </Grid>
              <Grid item xs={10} style={{ marginTop: "30px" }}>
                <Typography
                  variant={"body2"}
                  style={{ color: "var(--secondary1)" }}
                >
                  {t("Available after purchasing the liscense")}.
                </Typography>
              </Grid>
              <Grid
                item
                xs={10}
                style={{ marginTop: "10px", fontSize: "15px" }}
              >
                <Link
                  target="_blank"
                  color="inherit"
                  href="https://ds2.ai/buy-license/"
                  style={{ color: "var(--secondary1)" }}
                >
                  <u>{t("Buy License")}</u>
                </Link>
              </Grid>
            </Grid>
          ) : (
            <Grid container xs={12} justifyContent="center">
              <Grid
                item
                xs={10}
                container
                justifyContent="center"
                style={{ marginTop: "5px" }}
              >
                <Button
                  className={classes.defaultGreenOutlineButton_key}
                  startIcon={
                    <AutorenewIcon style={{ fill: "var(--secondary1)" }} />
                  }
                  style={{
                    border: "1px solid var(--secondary1)",
                    color: "var(--secondary1)",
                  }}
                  onClick={() => {
                    window.location.href = window.location.href;
                  }}
                >
                  <span style={{ padding: "2px 0" }}>{t("Refresh App")}</span>
                </Button>
              </Grid>
            </Grid>
          )}
        </Grid>
      </div>
    </Modal>
  );
};

export default LiscenseRegisterModal;
