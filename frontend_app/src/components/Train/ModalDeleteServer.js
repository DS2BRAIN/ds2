import React from "react";

import currentTheme from "assets/jss/custom.js";
import Button from "components/CustomButtons/Button";

import { Box, Grid, IconButton, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ModalDeleteServer = ({
  isDeleteServerModalOpen,
  closeDeleteServerModal,
  selectedServer,
}) => {
  const classes = currentTheme();

  const submitDelete = () => {
    console.log("server_id", selectedServer.server_id);
    console.log("server_name", selectedServer.server_name);
  };

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
              Delete server
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
          <Grid>
            <span style={{ marginRight: "8px", fontWeight: 700 }}>
              server :
            </span>
            <span style={{ fontSize: "18px", fontWeight: 700 }}>
              {selectedServer.server_name}
            </span>
          </Grid>
          <Grid>Are you sure you want to delete the server?</Grid>
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
              No
            </Button>
          </Grid>
          <Grid item>
            <Button
              id="delete_server_btn"
              shape="greenOutlinedSquare"
              sx={{ minWidth: "80px" }}
              onClick={submitDelete}
            >
              Yes
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ModalDeleteServer;
