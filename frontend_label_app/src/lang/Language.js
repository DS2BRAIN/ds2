import React, { useEffect, useState } from "react"
import MenuItem from "@material-ui/core/MenuItem"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import ReactCountryFlag from "react-country-flag"
import { useTranslation } from "react-i18next"
import Cookies from "../helpers/Cookies"

export default function Language(props) {
  const { t, i18n } = useTranslation()
  const [language, setLanguage] = useState("")
  const lang = Cookies.getCookie("language")

  useEffect(() => {
    if (lang) {
      setLanguage(lang)
      i18n.changeLanguage(lang)
    }
  }, [lang])

  const languageChange = (e) => {
    Cookies.setCookie("language", e.target.value, 90)
    i18n.changeLanguage(e.target.value)
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <FormControl>
        <Select
          labelid="demo-simple-select-outlined-label"
          value={language}
          onChange={languageChange}
        >
          <MenuItem value="en">
            <ReactCountryFlag
              countryCode="US"
              svg
              style={{
                width: "2em",
                height: "2em",
                color: "black",
              }}
              title="US"
            />
          </MenuItem>
          <MenuItem value="ko">
            <ReactCountryFlag
              countryCode="KR"
              svg
              style={{
                width: "2em",
                height: "2em",
                color: "black",
              }}
              title="KR"
            />
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  )
}
