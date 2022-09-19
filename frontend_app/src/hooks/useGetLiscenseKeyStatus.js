import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import * as api from "controller/api.js";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages";
import { renderSnackbarMessage } from "components/Function/globalFunc";
import { IS_ENTERPRISE } from "variables/common";

import { useTranslation } from "react-i18next";

const useGetLicenseKeyStatus = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [key, setKey] = useState(null);

  useEffect(() => {
    if (IS_ENTERPRISE) {
      api
        .getKeyStatus()
        .then((res) => {
          setKey(res.data);
        })
        .catch((err) => {
          const errMsg = renderSnackbarMessage(
            "error",
            err.response,
            t("Key value authentication failed. Return to the signIn screen.")
          );

          dispatch(openErrorSnackbarRequestAction(errMsg));
        });
    }
  }, []);

  return key;
};

export default useGetLicenseKeyStatus;
