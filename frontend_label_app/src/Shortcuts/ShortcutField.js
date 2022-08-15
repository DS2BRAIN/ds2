import React from "react"
import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/core/styles"
import { useTranslation } from "react-i18next";


const useStyles = makeStyles({
  shortcutKeyFieldWrapper: {
    paddingTop: 8,
    display: "inline-flex",
    width: "100%",
  },
  shortcutKeyText: {
    lineHeight: 0,
  },
  shortcutTextfield: {
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
    color: "#424242"
  },
})

const ShortcutField = ({ actionId, actionName, keyName, onChangeShortcut }) => {
  const classes = useStyles()
  const { t } = useTranslation();

  return (
    <div className={classes.shortcutKeyFieldWrapper}>
      <TextField
        variant="outlined"
        disabled={true}
        label={t(actionName)}
        className={classes.shortcutTextfield}
        value={keyName}
        onKeyPress={(e) => {
          onChangeShortcut(actionId, e.key)
          e.stopPropagation()
        }}
      />
    </div>
  )
}

export default ShortcutField
