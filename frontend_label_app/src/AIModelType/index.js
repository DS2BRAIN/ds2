// @flow

import React, { memo, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import * as api from "../api.js"
import Cookies from "../helpers/Cookies"
import SidebarBoxContainer from "../SidebarBoxContainer"
import { makeStyles } from "@material-ui/core/styles"

import Radio from "@material-ui/core/Radio"
import RadioGroup from "@material-ui/core/RadioGroup"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import FormControl from "@material-ui/core/FormControl"
import FormLabel from "@material-ui/core/FormLabel"
import LabelIcon from "@material-ui/icons/Label"
import { grey } from "@material-ui/core/colors"

const useStyles = makeStyles({
  radio: {
    "&$checked": {
      color: "#3f51b5",
    },
  },
  checked: {},
})

export const AIModelType = () => {
  const { t } = useTranslation()
  const [value, setValue] = useState("0")
  const classes = useStyles()

  const handleChange = (event) => {
    setValue(event.target.value)
    Cookies.deleteCookie("AIModelType")
    Cookies.setCookie("AIModelType", event.target.value, 90)
  }

  return (
    <SidebarBoxContainer
      title={t("매직툴 모델 타입")}
      icon={<LabelIcon style={{ color: grey[700] }} />}
      expandedByDefault
    >
      <FormControl component="fieldset" style={{ width: "100%" }}>
        {/* <FormLabel component="legend">Gender</FormLabel> */}
        <RadioGroup
          aria-label="model-types"
          name="model-types"
          value={value}
          onChange={handleChange}
          row
          style={{ justifyContent: "space-evenly" }}
        >
          <FormControlLabel
            value="0"
            control={
              <Radio
                classes={{ root: classes.radio, checked: classes.checked }}
              />
            }
            label="Type1"
            labelPlacement="top"
          />
          <FormControlLabel
            value="1"
            control={
              <Radio
                classes={{ root: classes.radio, checked: classes.checked }}
              />
            }
            label="Type2"
            labelPlacement="top"
          />
          <FormControlLabel
            value="2"
            control={
              <Radio
                classes={{ root: classes.radio, checked: classes.checked }}
              />
            }
            label="Type3"
            labelPlacement="top"
          />
        </RadioGroup>
      </FormControl>
    </SidebarBoxContainer>
  )
}

export default memo(AIModelType)
