// @flow

import React, { memo, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Cookies from "../helpers/Cookies"
import SidebarBoxContainer from "../SidebarBoxContainer"
import { makeStyles } from "@material-ui/core/styles"

import Radio from "@material-ui/core/Radio"
import RadioGroup from "@material-ui/core/RadioGroup"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import FormControl from "@material-ui/core/FormControl"
import { grey } from "@material-ui/core/colors"
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck"
import { Box } from "@material-ui/core"

const useStyles = makeStyles({
  radio: {
    "&$checked": {
      color: "#3f51b5",
    },
  },
  checked: {},
})

export const InspectionResults = ({ inspectionResult = "0" }) => {
  const { t } = useTranslation()
  const [value, setValue] = useState(`${inspectionResult}`)
  const classes = useStyles()

  const handleChange = (event) => {
    setValue(event.target.value)
    Cookies.deleteCookie("inspectionResult")
    Cookies.setCookie("inspectionResult", event.target.value, 90)
  }

  return (
    <SidebarBoxContainer
      title={t("검수 결과")}
      icon={<PlaylistAddCheckIcon style={{ color: grey[700] }} />}
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
            value="1"
            control={
              <Radio
                classes={{ root: classes.radio, checked: classes.checked }}
              />
            }
            // checked={inspectionResult === 1}
            label={t("통과")}
            labelPlacement="top"
          />
          <FormControlLabel
            value="2"
            control={
              <Radio
                classes={{ root: classes.radio, checked: classes.checked }}
              />
            }
            label={t("반려")}
            // checked={inspectionResult === 2}
            labelPlacement="top"
          />
        </RadioGroup>
      </FormControl>
      <Box style={{ padding: "16px", fontSize: "12px", color: "red" }}>
        {t(
          "* '반려'할 경우 기존의 라벨 데이터가 모두 삭제되며, 복구 불가능한 점 유의바랍니다."
        )}
      </Box>
    </SidebarBoxContainer>
  )
}

export default memo(InspectionResults)
