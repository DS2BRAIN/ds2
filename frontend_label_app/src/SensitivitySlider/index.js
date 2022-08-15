// @flow

import React, { memo, useEffect, useState } from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import DescriptionIcon from "@material-ui/icons/Description"
import { makeStyles, styled } from "@material-ui/core/styles"
import { grey } from "@material-ui/core/colors"
import Markdown from "react-markdown"
import { useTranslation } from "react-i18next"
import * as api from "../api.js"
import Grid from "@material-ui/core/Grid"
import Slider from "@material-ui/core/Slider"
import Input from "@material-ui/core/Input"
import ExposureIcon from "@material-ui/icons/Exposure"
import { action } from "@storybook/addon-actions"
import Cookies from "../helpers/Cookies"

const MarkdownContainer = styled("div")({
  paddingLeft: 16,
  paddingRight: 16,
  fontSize: 12,
  marginTop: 10,
  marginBottom: 10,
  "& h1": { fontSize: 18 },
  "& h2": { fontSize: 14 },
  "& h3": { fontSize: 12 },
  "& h4": { fontSize: 12 },
  "& h5": { fontSize: 12 },
  "& h6": { fontSize: 12 },
  "& p": { fontSize: 12 },
  "& a": {},
  "& img": { width: "100%" },
})

export const TaskDescriptionSidebarBox = () => {
  const { t } = useTranslation()
  Cookies.deleteCookie("sensitivityValue")
  Cookies.setCookie("sensitivityValue", 0.35, 90)

  const [sensitivityValue, setSensitivityValue] = useState(0.35)
  const changeSliderValueBySlider = (event, newValue) => {
    setSensitivityValue(newValue)
    Cookies.setCookie("sensitivityValue", newValue, 90)
  }
  const changeSliderValueByText = (event) => {
    setSensitivityValue(
      event.target.value === "" ? "" : parseFloat(event.target.value)
    )
    Cookies.setCookie(
      "sensitivityValue",
      event.target.value === "" ? "" : parseFloat(event.target.value),
      90
    )
  }
  const handleBlur = () => {
    if (sensitivityValue <= 0) {
      setSensitivityValue(0.1)
      Cookies.setCookie("sensitivityValue", 0.1, 90)
    } else if (sensitivityValue >= 1) {
      setSensitivityValue(0.9)
      Cookies.setCookie("sensitivityValue", 0.9, 90)
    }
  }

  return (
    <SidebarBoxContainer
      title={t("매직툴 민감도")}
      icon={<ExposureIcon style={{ color: grey[700] }} />}
      expandedByDefault
    >
      <MarkdownContainer>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Slider
              value={
                typeof sensitivityValue === "number" ? sensitivityValue : 0
              }
              min={0.1}
              max={0.9}
              step={0.01}
              onChange={changeSliderValueBySlider}
              aria-labelledby="input-slider"
            />
          </Grid>
          <Grid item>
            <Input
              value={sensitivityValue}
              margin="dense"
              onChange={changeSliderValueByText}
              onBlur={handleBlur}
              inputProps={{
                step: 0.1,
                min: 0.1,
                max: 0.9,
                type: "number",
                "aria-labelledby": "input-slider",
              }}
            />
          </Grid>
        </Grid>
      </MarkdownContainer>
    </SidebarBoxContainer>
  )
}

export default memo(TaskDescriptionSidebarBox)
