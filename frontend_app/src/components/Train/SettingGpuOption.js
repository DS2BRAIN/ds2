import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "components/CustomButtons/Button";
import { serverDataList } from "./mockupGPUData";

import { Checkbox, Grid } from "@mui/material";
import LagacySettingGpuOption from "./LegacySettingGpuOption";
import ModalAddServer from "./ModalAddServer";
import ModalDeleteServer from "./ModalDeleteServer";
import {
  openErrorSnackbarRequestAction,
  setPlanModalOpenRequestAction,
} from "../../redux/reducers/messages";
import * as api from "../../controller/api";
import { useDispatch, useSelector } from "react-redux";
import { IS_ENTERPRISE } from "../../variables/common";
import { checkIsValidKey } from "../Function/globalFunc";
import LicenseRegisterModal from "../Modal/LicenseRegisterModal";

const SettingGpuOption = ({
  status,
  gpuList,
  isDeviceAllSelected,
  setIsDeviceAllSelected,
  selectedDeviceArr,
  setSelectedDeviceArr,
  checkedDict,
  setCheckedDict,
}) => {
  const { t } = useTranslation();
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
  const isStatusZero = status === 0;
  const [isPastVersion, setIsPastVersion] = useState(false);
  const [isAddServerModalOpen, setIsAddServerModalOpen] = useState(false);
  const [isDeleteServerModalOpen, setIsDeleteServerModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState({});
  const [hostValue, setHostValue] = useState("");
  const [tokenValue, setTokenValue] = useState("");
  const [availableGpuListTotal, setAvailableGpuListTotal] = useState(gpuList);

  const submitAddServer = () => {
    console.log("hostValue", hostValue);
    console.log("tokenValue", tokenValue);
    if (!hostValue) {
      dispatch(openErrorSnackbarRequestAction(t("Please enter the host.")));
      return;
    }
    if (!tokenValue) {
      dispatch(openErrorSnackbarRequestAction(t("Please enter the token.")));
      return;
    }

    api
      .postAddServer({
        ip: hostValue,
        access_token: tokenValue,
      })
      .then((res) => {
        if (res.data?.gpu_info) {
          setAvailableGpuListTotal(
            Object.assign({}, availableGpuListTotal, {
              [res.data.name]: res.data.gpu_info,
            })
          );
          closeAddServerModal();
        } else {
          dispatch(
            openErrorSnackbarRequestAction(t("Please check the connection."))
          );
        }
      });
  };

  const submitDelete = () => {
    console.log("selectedServer");
    console.log(selectedServer);
    api.deleteAddServer(selectedServer).then((res) => {
      window.location.reload();
    });
  };

  const openAddServerModal = () => {
    setIsAddServerModalOpen(true);
  };

  const closeAddServerModal = () => {
    setIsAddServerModalOpen(false);
  };

  const openDeleteServerModal = (hostName) => {
    setSelectedServer(hostName);
    setIsDeleteServerModalOpen(true);
  };

  const closeDeleteServerModal = () => {
    setSelectedServer("");
    setIsDeleteServerModalOpen(false);
  };

  const handleServerCheck = (e, isChecked) => {
    let is_valid = true;
    if (IS_ENTERPRISE) {
      checkIsValidKey(user, dispatch, t).then((result) => {
        if (
          (result !== undefined && result === false) ||
          projects.project.status !== 0
        ) {
          is_valid = false;
        }
      });
    }
    if (!is_valid) {
      return;
    }
    let serverName = e.target.value;
    let tmpCheckedDict = checkedDict;
    if (isChecked) {
      let filteredServer = gpuList[serverName];
      tmpCheckedDict[serverName] = [...filteredServer];
    } else {
      if (tmpCheckedDict[serverName]) delete tmpCheckedDict[serverName];
    }
    setCheckedDict({ ...tmpCheckedDict });
  };

  const handleGpuCheck = (e, isChecked, serverName, gpuDict) => {
    let is_valid = true;
    if (IS_ENTERPRISE) {
      checkIsValidKey(user, dispatch, t).then((result) => {
        if (
          (result !== undefined && result === false) ||
          projects.project.status !== 0
        ) {
          is_valid = false;
        }
      });
    }
    if (!is_valid) {
      return;
    }

    let tmpCheckedDict = checkedDict;
    let gpuList = tmpCheckedDict[serverName];

    if (isChecked) {
      if (gpuList) {
        gpuList.push(gpuDict);
      } else {
        gpuList = [gpuDict];
      }
      tmpCheckedDict[serverName] = gpuList;
    } else {
      let gpuIndex = gpuList.indexOf(gpuDict);
      if (gpuIndex > -1) {
        gpuList.splice(gpuIndex, 1);
      }
      tmpCheckedDict[serverName] = gpuList;
    }
    setCheckedDict({ ...tmpCheckedDict });
  };

  const disabledTextStyle = {
    color: "darkgray",
    marginBottom: "0px",
    fontSize: "16px",
    fontWeight: 400,
  };

  // if (isPastVersion)
  //   return (
  //     <LagacySettingGpuOption
  //       status={status}
  //       gpuList={gpuList}
  //       isDeviceAllSelected={isDeviceAllSelected}
  //       setIsDeviceAllSelected={setIsDeviceAllSelected}
  //       selectedDeviceArr={selectedDeviceArr}
  //       setSelectedDeviceArr={setSelectedDeviceArr}
  //     />
  //   );
  // else
  return (
    <>
      <Grid sx={{ p: 1.5 }}>
        {serverDataList ? (
          <>
            {isStatusZero && (
              <Grid container justifyContent="flex-end">
                <Grid sx={{ mt: -5 }}>
                  <Button
                    id="add_server_btn"
                    shape="greenOutlined"
                    size="sm"
                    onClick={openAddServerModal}
                  >
                    {t("Add training server")}
                  </Button>
                </Grid>
              </Grid>
            )}
            <Grid container rowSpacing={1}>
              {Object.keys(availableGpuListTotal).map((serverName) => {
                let serverId = serverName;
                let serverDict = availableGpuListTotal[serverName];
                // let serverName = serverDict.name;
                let isLocalServer = serverName === "localhost";
                let isChecked =
                  serverDict?.length === checkedDict[serverName]?.length;

                return (
                  <Grid item key={serverName} xs={12}>
                    <Grid container sx={{ mb: 1 }}>
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          textTransform: "capitalize",
                        }}
                      >
                        {serverName}
                      </span>
                      {isStatusZero && (
                        <Checkbox
                          id={`server_${serverId}_checkbox`}
                          value={serverName}
                          checked={isChecked}
                          size="small"
                          sx={{ mx: 1 }}
                          onChange={handleServerCheck}
                        />
                      )}
                      {isStatusZero && !isLocalServer && (
                        <Button
                          id={`delete_server${serverId}_btn`}
                          shape="redOutlined"
                          size="xs"
                          sx={{ ml: 1 }}
                          onClick={() => openDeleteServerModal(serverName)}
                        >
                          {t("Delete")}
                        </Button>
                      )}
                    </Grid>
                    <Grid sx={{ pl: 1 }}>
                      {serverDict.map((gpuDict) => {
                        let gpuId = gpuDict.idx;
                        let gpuName = gpuDict.name;
                        const isChecked =
                          checkedDict[serverName] &&
                          checkedDict[serverName].includes(gpuDict)
                            ? true
                            : false;

                        return (
                          <Grid container key={serverName} sx={{ mb: 0.5 }}>
                            {isStatusZero && (
                              <Checkbox
                                id={`gpu_${gpuId}_checkbox`}
                                value={gpuName}
                                checked={isChecked}
                                size="small"
                                sx={{ mr: 1 }}
                                onChange={(e, checked) =>
                                  handleGpuCheck(
                                    e,
                                    checked,
                                    serverName,
                                    gpuDict
                                  )
                                }
                              />
                            )}
                            <span style={{ fontSize: "15px" }}>{gpuName}</span>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
            <ModalAddServer
              isAddServerModalOpen={isAddServerModalOpen}
              closeAddServerModal={closeAddServerModal}
              setHostValue={setHostValue}
              setTokenValue={setTokenValue}
              submitAddServer={submitAddServer}
            />
            <ModalDeleteServer
              isDeleteServerModalOpen={isDeleteServerModalOpen}
              closeDeleteServerModal={closeDeleteServerModal}
              selectedServer={selectedServer}
              submitDelete={submitDelete}
            />
          </>
        ) : (
          <p style={disabledTextStyle}>
            {t("There is no GPU to choose from.")}
          </p>
        )}
      </Grid>
      <LicenseRegisterModal />
    </>
  );
};

export default SettingGpuOption;
