// @flow

import React, { createContext, useContext, memo } from "react"
import Cookies from "../helpers/Cookies"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import { blue } from "@material-ui/core/colors"

export const SelectedTool = createContext()

export const SmallToolButton = ({
  id,
  name,
  icon,
  selected,
  togglable,
  alwaysShowing = false,
}: {
  id: string,
  name: string,
  icon: any,
  alwaysShowing?: boolean,
  selected?: boolean,
  togglable?: boolean,
}) => {
  const { enabledTools, selectedTool, onClickTool } = useContext(SelectedTool)
  if (!enabledTools.includes(id) && !alwaysShowing) return null
  selected = selected || selectedTool === id
  return (
    <Tooltip placement="right" title={name}>
      <div>
        <IconButton
          disabled={!togglable ? selected : undefined}
          aria-label={name}
          onClick={() => {
            onClickTool(id)
            Cookies.setCookie("lastSelectedTool", id, 1)
          }}
          size="small"
          style={{
            width: 50,
            height: 50,
            margin: 1,
            color: selected ? blue[500] : undefined,
          }}
        >
          {icon}
        </IconButton>
      </div>
    </Tooltip>
  )
}

export default memo(
  SmallToolButton,
  (prevProps, nextProps) =>
    prevProps.togglable === nextProps.togglable &&
    prevProps.selected === nextProps.selected &&
    prevProps.name === nextProps.name &&
    prevProps.id === nextProps.id
)
