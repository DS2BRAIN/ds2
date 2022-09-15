import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-powershell";

import Button from "components/CustomButtons/Button";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";

const dummyScript = `
echo "Enter directory name"
read ndir
if [ -d "$ndir" ]
then
echo "Directory exist"
else
"mkdir $ndir"
echo "Directory created"
fi
`;

const TritonConfigModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [shellScript, setShellScript] = useState(dummyScript);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      //   open={open}
      open={true}
      //   onClose={handleClose}
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
      <DialogContent>
        <DialogContentText sx={{ mb: 3, color: "var(--textWhite87)" }}>
          {t(`Triton Inference Server, part of the NVIDIA AI platform, streamlines
          AI inference by enabling teams to deploy, run, and scale trained AI
          models from any framework on any GPU- or CPU-based infrastructure. It
          provides AI researchers and data scientists the freedom to choose the
          right framework for their projects without impacting production
          deployment. It also helps developers deliver high-performance
          inference across cloud, on-prem, edge, and embedded devices. Please
          run the code to connect with Triton server.`)}
        </DialogContentText>
        <AceEditor
          width="100%"
          mode="powershell"
          theme="monokai"
          value={shellScript}
          editorProps={{ $blockScrolling: true }}
          showPrintMargin={false}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            showLineNumbers: true,
          }}
          readOnly
          style={{ height: 240, border: "1px solid var(--surface2)" }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 4 }}>
        <Button shape="greenOutlined" onClick={handleClose}>
          {t("Cancel")}
        </Button>
        <Button shape="greenContained" onClick={handleClose}>
          {t("Connect")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TritonConfigModal;
