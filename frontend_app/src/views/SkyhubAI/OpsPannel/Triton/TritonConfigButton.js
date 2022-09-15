import React from "react";
import { useTranslation } from "react-i18next";

import currentTheme from "assets/jss/custom";
import Button from "components/CustomButtons/Button";

const TritonConfigButton = ({ newClasses, openModalHandler }) => {
  const { t } = useTranslation();
  const classes = currentTheme();

  return (
    <Button
      className={`${newClasses.sideButton} ${classes.defaultHighlightButton}`}
      onClick={() => openModalHandler(true)}
    >
      {t("Triton Config")}
    </Button>
  );
};

export default TritonConfigButton;
