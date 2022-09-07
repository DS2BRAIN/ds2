import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { checkIsIterable } from "components/Function/globalFunc";

import { Checkbox, FormGroup, FormControlLabel } from "@mui/material";

const SettingGpuOption = ({
  status,
  gpuList,
  isDeviceAllSelected,
  setIsDeviceAllSelected,
  selectedDeviceArr,
  setSelectedDeviceArr,
}) => {
  const { t } = useTranslation();

  const checkedGpuList = checkIsIterable(gpuList) ? [...gpuList] : [];

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
};

export default SettingGpuOption;
