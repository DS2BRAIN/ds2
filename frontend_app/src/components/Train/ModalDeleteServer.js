import React from "react";
import { useTranslation } from "react-i18next";

import currentTheme from "assets/jss/custom.js";
import Button from "components/CustomButtons/Button";

import { Box, Grid, IconButton, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ModalDeleteServer = ({
  isDeleteServerModalOpen,
  closeDeleteServerModal,
  selectedServer,
  submitDelete,
}) => {
  const classes = currentTheme();
  const { t } = useTranslation();

  return (
    <Modal
      open={isDeleteServerModalOpen}
      onClose={closeDeleteServerModal}
      className={classes.modalContainer}
    >
      <Box
        sx={{
          borderRadius: "4px",
          backgroundColor: "var(--background2)",
          minWidth: "500px",
          minHeight: "200px",
        }}
      >
        <Grid container justifyContent="space-between" sx={{ py: 2, px: 2 }}>
          <Grid sx={{ pt: 1, pl: 1 }}>
            <span style={{ fontSize: "18px", fontWeight: 700 }}>
              {t("Delete server")}
            </span>
          </Grid>
          <IconButton
            id="close_deletemodal_btn"
            onClick={closeDeleteServerModal}
          >
            <CloseIcon />
          </IconButton>
        </Grid>
        <Grid sx={{ px: 8 }}>
          <Grid sx={{ mb: 0.5 }}>
            <span style={{ marginRight: "8px", fontWeight: 700 }}>
              server :
            </span>
            <span style={{ fontSize: "18px", fontWeight: 700 }}>
              {selectedServer.server_name}
            </span>
          </Grid>
          <Grid>{t("Are you sure you want to delete the server?")}</Grid>
        </Grid>
        <Grid
          container
          justifyContent="center"
          columnSpacing={5}
          sx={{ my: 4 }}
        >
          <Grid item>
            <Button
              id="close_deletemodal_btn"
              shape="whiteOutlinedSquare"
              sx={{ minWidth: "80px" }}
              onClick={closeDeleteServerModal}
            >
              {t("No")}
            </Button>
          </Grid>
          <Grid item>
            <Button
              id="delete_server_btn"
              shape="greenOutlinedSquare"
              sx={{ minWidth: "80px" }}
              onClick={submitDelete}
            >
              {t("Yes")}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ModalDeleteServer;
