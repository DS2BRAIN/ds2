import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import currentTheme from "assets/jss/custom.js";
import Button from "components/CustomButtons/Button";
import { serverDataList } from "./mockupGPUData";

import {
  Box,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  Modal,
  Input,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LagacySettingGpuOption from "./LegacySettingGpuOption";

const SettingGpuOption = ({
  status,
  gpuList,
  isDeviceAllSelected,
  setIsDeviceAllSelected,
  selectedDeviceArr,
  setSelectedDeviceArr,
}) => {
  const { t } = useTranslation();
  const classes = currentTheme();

  const [isPastVersion, setIsPastVersion] = useState(false);
  const [isAddServerModalOpen, setIsAddServerModalOpen] = useState(false);
  const [isDeleteServerModalOpen, setIsDeleteServerModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState("");
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

  const customDivider = (
    <Divider
      sx={{
        borderColor: "rgba(255, 255, 255, 0.1)",
        width: "100%",
        mt: 1.5,
        mb: 0.5,
      }}
    />
  );

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
        <Grid container justifyContent="flex-end">
          <Grid sx={{ mt: -5.5 }}>
            <Button
              shape="greenOutlined"
              size="sm"
              onClick={openAddServerModal}
            >
              Add training server
            </Button>
          </Grid>
        </Grid>
        <Grid container rowSpacing={1}>
          {serverDataList.map((serverDict) => {
            let serverId = serverDict.server_id;
            let serverName = serverDict.server_name;
            let isLocalServer = serverName === "localhost";
            let isChecked =
              serverDict.gpu_list?.length === checkedDict[serverName]?.length;

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
                  <Checkbox
                    id={`server_${serverId}_checkbox`}
                    value={serverName}
                    checked={isChecked}
                    size="small"
                    sx={{ mx: 1 }}
                    onChange={handleServerCheck}
                  />
                  {!isLocalServer && (
                    <Button
                      shape="redOutlined"
                      size="xs"
                      sx={{ ml: 1 }}
                      onClick={() => openDeleteServerModal(serverName)}
                    >
                      Delete
                    </Button>
                  )}
                </Grid>
                <Grid sx={{ pl: 1 }}>
                  {serverDict.gpu_list.map((gpuDict) => {
                    let gpuId = gpuDict.gpu_id;
                    let gpuName = gpuDict.gpu_name;
                    const isChecked =
                      checkedDict[serverName] &&
                      checkedDict[serverName].includes(gpuDict)
                        ? true
                        : false;

                    return (
                      <Grid container sx={{ mb: 0.5 }}>
                        <Checkbox
                          id={`gpu_${gpuId}_checkbox`}
                          value={gpuName}
                          checked={isChecked}
                          size="small"
                          sx={{ mr: 1 }}
                          onChange={(e, checked) =>
                            handleGpuCheck(e, checked, serverName, gpuDict)
                          }
                        />
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
        <Modal
          open={isAddServerModalOpen}
          onClose={closeAddServerModal}
          className={classes.modalContainer}
        >
          <Box
            sx={{
              borderRadius: "4px",
              backgroundColor: "var(--background2)",
              minWidth: "700px",
              minHeight: "300px",
            }}
          >
            <Grid
              container
              justifyContent="space-between"
              sx={{ py: 2, px: 2 }}
            >
              <Grid sx={{ pt: 1, pl: 1 }}>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>
                  Add new server
                </span>
              </Grid>
              <IconButton onClick={closeAddServerModal}>
                <CloseIcon />
              </IconButton>
            </Grid>
            <Grid sx={{ my: 4, px: 5 }}>
              <Grid container justifyContent="center" rowSpacing={2}>
                {customDivider}
                <Grid item xs={6} textAlign="center">
                  Host
                </Grid>
                <Grid item xs={6} textAlign="center">
                  <Input
                    placeholder="Enter the host"
                    sx={{ color: "var(--textWhite6)" }}
                  />
                </Grid>
                {customDivider}
                <Grid item xs={6} textAlign="center">
                  DS2.ai Admin Token
                </Grid>
                <Grid item xs={6} textAlign="center">
                  <Input
                    placeholder="Enter the token"
                    sx={{ color: "var(--textWhite6)" }}
                  />
                </Grid>
                {customDivider}
              </Grid>
            </Grid>
            <Grid
              container
              justifyContent="center"
              columnSpacing={10}
              sx={{ pt: 2, pb: 4 }}
            >
              <Grid item>
                <Button
                  shape="whiteOutlinedSquare"
                  size="lg"
                  sx={{ minWidth: "100px" }}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  shape="greenOutlinedSquare"
                  size="lg"
                  sx={{ minWidth: "100px" }}
                >
                  Register
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Modal>
        <Modal
          open={isDeleteServerModalOpen}
          onClose={closeDeleteServerModal}
          className={classes.modalContainer}
        >
          <Box
            sx={{
              borderRadius: "4px",
              backgroundColor: "var(--background2)",
              minWidth: "500px",
              minHeight: "200px",
            }}
          >
            <Grid
              container
              justifyContent="space-between"
              sx={{ py: 2, px: 2 }}
            >
              <Grid sx={{ pt: 1, pl: 1 }}>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>
                  Delete server
                </span>
              </Grid>
              <IconButton onClick={closeDeleteServerModal}>
                <CloseIcon />
              </IconButton>
            </Grid>
            <Grid sx={{ px: 8 }}>
              <Grid>
                <span style={{ marginRight: "8px", fontWeight: 700 }}>
                  server :
                </span>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>
                  {selectedServer}
                </span>
              </Grid>
              <Grid>Are you sure you want to delete the server?</Grid>
            </Grid>
            <Grid
              container
              justifyContent="center"
              columnSpacing={5}
              sx={{ my: 4 }}
            >
              <Grid item>
                <Button shape="whiteOutlinedSquare" sx={{ minWidth: "80px" }}>
                  No
                </Button>
              </Grid>
              <Grid item>
                <Button shape="greenOutlinedSquare" sx={{ minWidth: "80px" }}>
                  Yes
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Modal>
      </Grid>
    );
};

export default SettingGpuOption;
