import React from "react";
import { useTranslation } from "react-i18next";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-powershell";

import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "../../../../components/CustomButtons/Button";
import {openErrorSnackbarRequestAction, openSuccessSnackbarRequestAction} from "../../../../redux/reducers/messages";
import {useDispatch} from "react-redux";

const TritonConfigModalContent = ({ shellScript }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onCopyTritonCode = () => {
    navigator.clipboard.writeText(shellScript).then(function() {
          dispatch(openSuccessSnackbarRequestAction(t("Code copied")));
        }, function(err) {
          dispatch(
        openErrorSnackbarRequestAction(t("Please copy the code yourself."))
      );
        });
  };

  return (
    <DialogContent>
      <DialogContentText sx={{ mb: 3, color: "var(--textWhite87)" }}>
        {t(`Triton Inference Server, part of the NVIDIA AI platform, streamlines
          AI inference by enabling teams to deploy, run, and scale trained AI
          models from any framework on any GPU- or CPU-based infrastructure. It
          provides AI researchers and data scientists the freedom to choose the
          right framework for their projects without impacting production
          deployment. It also helps developers deliver high-performance
          inference across cloud, on-prem, edge, and embedded devices.`)}
      </DialogContentText><DialogContentText sx={{ mb: 3, color: "var(--secondary1)" }}>
        {t(`Please
          run the code to connect with Triton server.`)}
      </DialogContentText>
        <Button
          id="copy_triton_code_btn"
          shape="greenContained"
          onClick={onCopyTritonCode}
        >
          {t("Copy")}
        </Button>
      <AceEditor
        width="100%"
        mode="powershell"
        theme="monokai"
        id="tritonCode"
        value={shellScript}
        editorProps={{ $blockScrolling: true }}
        showPrintMargin={false}
        setOptions={{
          useWrapMode: true,   // wrap text to view
          indentedSoftWrap: false,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          showLineNumbers: true,
        }}
        readOnly
        style={{ height: 100, marginTop: 15, border: "1px solid var(--surface2)" }}
      />
    </DialogContent>
  );
};

export default TritonConfigModalContent;
