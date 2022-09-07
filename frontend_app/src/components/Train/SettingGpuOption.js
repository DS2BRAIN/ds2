import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import currentTheme from "assets/jss/custom.js";
import Button from "components/CustomButtons/Button";
import { checkIsIterable } from "components/Function/globalFunc";
import { gpuOptionData } from "./mockupGPUData";

import {
  Box,
  Checkbox,
  Divider,
  FormGroup,
  FormControlLabel,
  Grid,
  IconButton,
  Modal,
  Input,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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
  const checkedGpuList = checkIsIterable(gpuList) ? [...gpuList] : [];

  const [isPastVersion, setIsPastVersion] = useState(false);
  const [isAddServerModalOpen, setIsAddServerModalOpen] = useState(false);

  const openAddServerModal = () => {
    setIsAddServerModalOpen(true);
  };

  const closeAddServerModal = () => {
    setIsAddServerModalOpen(false);
  };

  const handleDeviceCheckAll = (e) => {
    let tmpVal = e.target.value;
    if (tmpVal === "all") {
      if (isDeviceAllSelected) {
        setSelectedDeviceArr([]);
      } else {
        setSelectedDeviceArr(checkedGpuList);
      }
      setIsDeviceAllSelected(!isDeviceAllSelected);
      return;
    }
  };

  const handleDeviceCheck = (e) => {
    let tmpVal = e.target.value;
    let selectArr = [...selectedDeviceArr];
    let exIndex = selectArr.indexOf(tmpVal);
    if (exIndex > -1) selectArr.splice(exIndex, 1);
    else selectArr.push(tmpVal);
    if (selectArr.length < checkedGpuList.length) setIsDeviceAllSelected(false);
    else setIsDeviceAllSelected(true);
    setSelectedDeviceArr(selectArr);
  };

  const disabledTextStyle = {
    color: "darkgray",
    marginBottom: "0px",
    fontSize: "16px",
    fontWeight: 400,
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
    return gpuList?.length ? (
      status === 0 ? (
        <>
          {gpuList.length > 1 && (
            <FormGroup onChange={handleDeviceCheckAll}>
              <FormControlLabel
                label={"전체 선택"}
                control={
                  <Checkbox
                    value="all"
                    size="small"
                    checked={isDeviceAllSelected}
                    style={{ marginRight: "4px" }}
                  />
                }
                style={{ marginLeft: 0 }}
              />
            </FormGroup>
          )}
          <FormGroup
            style={{
              display: "flex",
              flexDirection: "row",
              maxHeight: "100px",
              overflowY: "auto",
            }}
            onChange={handleDeviceCheck}
          >
            {gpuList.map((gpu) => (
              <FormControlLabel
                key={`checkform_${gpu.idx}`}
                label={gpu.name}
                control={
                  <Checkbox
                    value={gpu.idx}
                    size="small"
                    checked={selectedDeviceArr.includes(gpu.idx)}
                    style={{ marginRight: "4px" }}
                  />
                }
                style={{ marginLeft: 0 }}
              />
            ))}
          </FormGroup>
        </>
      ) : (
        gpuList.map((gpu) => (
          <p key={`gpu_${gpu.idx}`} style={disabledTextStyle}>
            {gpu.name}
          </p>
        ))
      )
    ) : (
      <p style={disabledTextStyle}>{t("There is no GPU to choose from.")}</p>
    );
  else
    return (
      <Grid sx={{ p: 2 }}>
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
        {Object.keys(gpuOptionData).map((hostOption) => (
          <Grid sx={{ mb: 3 }}>
            <Grid container sx={{ mb: 1 }}>
              <span style={{ fontSize: "18px", fontWeight: 700 }}>
                {hostOption}
              </span>
              <Checkbox size="small" sx={{ mx: 1 }} />
              {hostOption !== "localhost" && (
                <Button shape="redOutlined" size="xs" sx={{ ml: 1 }}>
                  Delete
                </Button>
              )}
            </Grid>
            <Grid sx={{ pl: 2 }}>
              {gpuOptionData[hostOption].map((gpu) => (
                <Grid container sx={{ mb: 0.5 }}>
                  <Checkbox size="small" sx={{ mr: 1 }} />
                  <span>{gpu}</span>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
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
            <Grid container sx={{ pb: 4 }}>
              <Grid item xs={2}></Grid>
              <Grid item xs={4} textAlign="center">
                <Button shape="whiteSquare" size="lg">
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={4} textAlign="center">
                <Button shape="greenSquare" size="lg">
                  Register
                </Button>
              </Grid>
              <Grid item xs={2}></Grid>
            </Grid>
          </Box>
        </Modal>
      </Grid>
    );
};

export default SettingGpuOption;
