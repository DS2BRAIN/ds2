import React from "react";
import { useTranslation } from "react-i18next";

import currentTheme from "assets/jss/custom";
import Button from "components/CustomButtons/Button";
import { IS_ENTERPRISE } from "variables/common";
import { checkIsValidKey } from "components/Function/globalFunc";
import {useDispatch, useSelector} from "react-redux";
import LicenseRegisterModal from "../../../../components/Modal/LicenseRegisterModal";

const TritonConfigButton = ({ newClasses, openModalHandler }) => {
  const { t } = useTranslation();
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, projects, messages, models, groups } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
      messages: state.messages,
      models: state.models,
      groups: state.groups,
    }),
    []
  );

  const clickTritonConfig = () => {

    if (IS_ENTERPRISE) {
      checkIsValidKey(user, dispatch, t).then((result) => {
        if (
          (result !== undefined && result === false)
        ) {} else {
            openModalHandler(true);
        }
      });
    }
  }

  return (
    <>
      <Button
        className={`${newClasses.sideButton} ${classes.defaultHighlightButton}`}
        onClick={clickTritonConfig}
      >
        {t("Triton Config")}
      </Button>
      <LicenseRegisterModal />
    </>
  );
};

export default TritonConfigButton;
