import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";

import currentTheme from "assets/jss/custom.js";
import Button from "components/CustomButtons/Button";
import { Box, Divider, Grid, IconButton, Modal, Input } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ModalAddServer = ({ isAddServerModalOpen, closeAddServerModal }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [hostValue, setHostValue] = useState("");
  const [tokenValue, setTokenValue] = useState("");

  const customDivider = (
    <Divider
      sx={{
        borderColor: "rgba(255, 255, 255, 0.1)",
        width: "100%",
        mt: 1.5,
        mb: 0.5,
      }}
    />
  );

  const handleHostInput = (e) => {
    let tmpValue = e.target.value;
    setHostValue(tmpValue);
  };

  const handleTokenInput = (e) => {
    let tmpValue = e.target.value;
    setTokenValue(tmpValue);
  };

  const submitRegister = () => {
    console.log("hostValue", hostValue);
    console.log("tokenValue", tokenValue);
    if (!hostValue) {
      dispatch(openErrorSnackbarRequestAction(t("Please enter the host.")));
      return;
    }
    if (!tokenValue) {
      dispatch(openErrorSnackbarRequestAction(t("Please enter the token.")));
      return;
    }
  };

  return (
    <Modal
      open={isAddServerModalOpen}
      onClose={closeAddServerModal}
      className={classes.modalContainer}
    >
      <Box
        sx={{
          borderRadius: "4px",
          backgroundColor: "var(--background2)",
          minWidth: "700px",
          minHeight: "300px",
        }}
      >
        <Grid container justifyContent="space-between" sx={{ py: 2, px: 2 }}>
          <Grid sx={{ pt: 1, pl: 1 }}>
            <span style={{ fontSize: "18px", fontWeight: 700 }}>
              {t("Add new server")}
            </span>
          </Grid>
          <IconButton onClick={closeAddServerModal}>
            <CloseIcon />
          </IconButton>
        </Grid>
        <Grid sx={{ my: 4, px: 5 }}>
          <Grid container justifyContent="center" rowSpacing={2}>
            {customDivider}
            <Grid item xs={6} textAlign="center">
              {t("Host")}
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Input
                placeholder={t("Enter the host")}
                sx={{ color: "var(--textWhite6)" }}
                onChange={handleHostInput}
              />
            </Grid>
            {customDivider}
            <Grid item xs={6} textAlign="center">
              DS2.ai {t("Admin token")}
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Input
                placeholder={t("Enter the token")}
                sx={{ color: "var(--textWhite6)" }}
                onChange={handleTokenInput}
              />
            </Grid>
            {customDivider}
          </Grid>
        </Grid>
        <Grid
          container
          justifyContent="center"
          columnSpacing={10}
          sx={{ pt: 2, pb: 4 }}
        >
          <Grid item>
            <Button
              shape="whiteOutlinedSquare"
              size="lg"
              sx={{ minWidth: "100px" }}
              onClick={closeAddServerModal}
            >
              {t("Cancel")}
            </Button>
          </Grid>
          <Grid item>
            <Button
              shape="greenOutlinedSquare"
              size="lg"
              sx={{ minWidth: "100px" }}
              onClick={submitRegister}
            >
              {t("Register")}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ModalAddServer;
