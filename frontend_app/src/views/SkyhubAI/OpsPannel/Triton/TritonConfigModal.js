import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import TritonConfigModalContent from "./TritonConfigModalContent";
import TritonConfigModalButton from "./TritonConfigModalButton";

import Dialog from "@mui/material/Dialog";
import * as api from "../../../../controller/api";
import {openErrorSnackbarRequestAction, openSuccessSnackbarRequestAction} from "../../../../redux/reducers/messages";
import {checkTritonHealth} from "../../../../controller/api";
import {useDispatch} from "react-redux";

const dummyScript = `
NVIDIA_DRIVER_CAPABILITIES=all NVIDIA_VISIBLE_DEVICES=all NVIDIA_DISABLE_REQUIRE=1 CUDA_VISIBLE_DEVICES=0 sudo docker run --gpus=1 --rm -p8000:8000 -p8001:8001 -p8002:8002 -v/home/yeo/ds2ai/models:/models nvcr.io/nvidia/tritonserver:22.08-py3 tritonserver --model-repository=/models
`;

const TritonConfigModal = ({ isOpen, openModalHandler }) => {
  const { t } = useTranslation();
  const [shellScript, setShellScript] = useState(dummyScript);
  const dispatch = useDispatch();

  const handleClose = () => {
    openModalHandler(false);
  };
  const handleConnect = () => {
      api.checkTritonHealth().then((res) => {
        openModalHandler(false);
        dispatch(
          openSuccessSnackbarRequestAction(t("Triton server is successfully connected."))
        );
      }).catch((e) => {
          console.log(e);
        dispatch(
          openErrorSnackbarRequestAction(t("Triton Connection failed."))
        );
      });
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        style: {
          padding: 16,
          border: "2px solid var(--surface2)",
          borderRadius: 8,
        },
      }}
    >
      <TritonConfigModalContent shellScript={shellScript} />
      <TritonConfigModalButton handleClose={handleClose} handleConnect={handleConnect} />
    </Dialog>
  );
};

export default TritonConfigModal;
