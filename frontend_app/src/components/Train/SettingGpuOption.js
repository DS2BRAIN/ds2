import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "components/CustomButtons/Button";
import { serverDataList } from "./mockupGPUData";

import { Checkbox, Grid } from "@mui/material";
import LagacySettingGpuOption from "./LegacySettingGpuOption";
import ModalAddServer from "./ModalAddServer";
import ModalDeleteServer from "./ModalDeleteServer";

const SettingGpuOption = ({
  status,
  gpuList,
  isDeviceAllSelected,
  setIsDeviceAllSelected,
  selectedDeviceArr,
  setSelectedDeviceArr,
}) => {
  const { t } = useTranslation();
  const isStatusZero = status === 0;

  const [isPastVersion, setIsPastVersion] = useState(false);
  const [isAddServerModalOpen, setIsAddServerModalOpen] = useState(false);
  const [isDeleteServerModalOpen, setIsDeleteServerModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState({});
  const [checkedDict, setCheckedDict] = useState({});

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
    let serverName = e.target.value;
    let tmpCheckedDict = checkedDict;
    if (isChecked) {
      let filteredServer = serverDataList.filter((serverDict) => {
        return serverDict.server_name === serverName;
      });
      tmpCheckedDict[serverName] = [...filteredServer[0].gpu_list];
    } else {
      if (tmpCheckedDict[serverName]) delete tmpCheckedDict[serverName];
    }
    setCheckedDict({ ...tmpCheckedDict });
  };

  const handleGpuCheck = (e, isChecked, serverName, gpuDict) => {
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

  if (isPastVersion)
    return (
      <LagacySettingGpuOption
        status={status}
        gpuList={gpuList}
        isDeviceAllSelected={isDeviceAllSelected}
        setIsDeviceAllSelected={setIsDeviceAllSelected}
        selectedDeviceArr={selectedDeviceArr}
        setSelectedDeviceArr={setSelectedDeviceArr}
      />
    );
  else
    return (
      <Grid sx={{ p: 1.5 }}>
        {serverDataList ? (
          <>
            {!isStatusZero && (
              <Grid container justifyContent="flex-end">
                <Grid sx={{ mt: -5 }}>
                  <Button
                    id="add_server_btn"
                    shape="greenOutlined"
                    size="sm"
                    onClick={openAddServerModal}
                  >
                    Add training server
                  </Button>
                </Grid>
              </Grid>
            )}
            <Grid container rowSpacing={1}>
              {serverDataList?.map((serverDict) => {
                let serverId = serverDict.server_id;
                let serverName = serverDict.server_name;
                let isLocalServer = serverName === "localhost";
                let isChecked =
                  serverDict.gpu_list?.length ===
                  checkedDict[serverName]?.length;

                return (
                  <Grid item xs={12}>
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
                      {!isStatusZero && (
                        <Checkbox
                          id={`server_${serverId}_checkbox`}
                          value={serverName}
                          checked={isChecked}
                          size="small"
                          sx={{ mx: 1 }}
                          onChange={handleServerCheck}
                        />
                      )}
                      {!isStatusZero && !isLocalServer && (
                        <Button
                          id={`delete_server${serverId}_btn`}
                          shape="redOutlined"
                          size="xs"
                          sx={{ ml: 1 }}
                          onClick={() => openDeleteServerModal(serverDict)}
                        >
                          Delete
                        </Button>
                      )}
                    </Grid>
                    <Grid sx={{ pl: 1 }}>
                      {serverDict.gpu_list?.map((gpuDict) => {
                        let gpuId = gpuDict.gpu_id;
                        let gpuName = gpuDict.gpu_name;
                        const isChecked =
                          checkedDict[serverName] &&
                          checkedDict[serverName].includes(gpuDict)
                            ? true
                            : false;

                        return (
                          <Grid container sx={{ mb: 0.5 }}>
                            {!isStatusZero && (
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
                            <span style={{ fontSize: "15px" }}>
                              {gpuDict.gpu_name}
                            </span>
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
            />
            <ModalDeleteServer
              isDeleteServerModalOpen={isDeleteServerModalOpen}
              closeDeleteServerModal={closeDeleteServerModal}
              selectedServer={selectedServer}
            />
          </>
        ) : (
          <p style={disabledTextStyle}>
            {t("There is no GPU to choose from.")}
          </p>
        )}
      </Grid>
    );
};

export default SettingGpuOption;
