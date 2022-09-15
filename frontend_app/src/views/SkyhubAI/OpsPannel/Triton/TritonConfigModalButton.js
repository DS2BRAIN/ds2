import React from "react";
import { useTranslation } from "react-i18next";

import Button from "components/CustomButtons/Button";

import DialogActions from "@mui/material/DialogActions";

const TritonConfigModalButton = ({ handleClose }) => {
  const { t } = useTranslation();

  return (
    <DialogActions sx={{ px: 2, py: 4 }}>
      <Button shape="greenOutlined" onClick={handleClose}>
        {t("Cancel")}
      </Button>
      <Button shape="greenContained" onClick={handleClose}>
        {t("Connect")}
      </Button>
    </DialogActions>
  );
};

export default TritonConfigModalButton;
