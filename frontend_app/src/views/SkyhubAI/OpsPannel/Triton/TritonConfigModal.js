import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import TritonConfigModalContent from "./TritonConfigModalContent";
import TritonConfigModalButton from "./TritonConfigModalButton";

import Dialog from "@mui/material/Dialog";

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

const TritonConfigModal = ({ isOpen, openModalHandler }) => {
  const { t } = useTranslation();
  const [shellScript, setShellScript] = useState(dummyScript);

  const handleClose = () => {
    openModalHandler(false);
  };

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
      <TritonConfigModalButton handleClose={handleClose} />
    </Dialog>
  );
};

export default TritonConfigModal;
