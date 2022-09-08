import React, { useState } from "react";

import currentTheme from "assets/jss/custom.js";
import Button from "components/CustomButtons/Button";

import { Box, Divider, Grid, IconButton, Modal, Input } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ModalAddServer = ({ isAddServerModalOpen, closeAddServerModal }) => {
  const classes = currentTheme();

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
              Add new server
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
              Host
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Input
                placeholder="Enter the host"
                sx={{ color: "var(--textWhite6)" }}
              />
            </Grid>
            {customDivider}
            <Grid item xs={6} textAlign="center">
              DS2.ai Admin Token
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Input
                placeholder="Enter the token"
                sx={{ color: "var(--textWhite6)" }}
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
            >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              shape="greenOutlinedSquare"
              size="lg"
              sx={{ minWidth: "100px" }}
            >
              Register
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ModalAddServer;
