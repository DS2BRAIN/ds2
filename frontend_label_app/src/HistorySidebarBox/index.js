// @flow

import React, { setState, memo, useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { useTranslation } from "react-i18next"

import SidebarBoxContainer from "../SidebarBoxContainer"
import HistoryIcon from "@material-ui/icons/History"
import IconButton from "@material-ui/core/IconButton"
import UndoIcon from "@material-ui/icons/Undo"
import RedoIcon from "@material-ui/icons/Redo"
import { grey } from "@material-ui/core/colors"
import isEqual from "lodash/isEqual"

const useStyles = makeStyles({
  emptyText: {
    fontSize: 14,
    fontWeight: "bold",
    color: grey[500],
    textAlign: "center",
    padding: 20,
  },
})

export const HistorySidebarBox = ({
  history,
  historyIndex,
  onRestoreHistory,
  onRedoHistory,
  onUndoHistory,
}: {
  history: Array<{ name: string, time: Date }>,
}) => {
  const classes = useStyles()
  const { t } = useTranslation()

  return (
    <SidebarBoxContainer
      title={t("되돌리기/재실행")}
      icon={<HistoryIcon style={{ color: grey[700] }} />}
      expandedByDefault
    >
      <div style={{ padding: "0 10px" }}>
        <IconButton
          onClick={() => onUndoHistory()}
          disabled={history.length === 0 ? true : false}
        >
          <div style={{ fontSize: "12px" }}>{t("되돌리기 (x)")}</div>
          <UndoIcon />
        </IconButton>
        <IconButton
          onClick={() => onRedoHistory()}
          disabled={history.length === 0 ? true : false}
        >
          <RedoIcon />
          <div style={{ fontSize: "12px" }}>{t("재실행 (c)")}</div>
        </IconButton>
      </div>

      {/* <List>
        {history.length === 0 ?
          <div className={classes.emptyText}>히스토리가 아직 없습니다.</div>
          :
          <>
          <ListItem button dense >
            <ListItemText
               primary={'작업'}
             />
            <ListItemSecondaryAction onClick={() => onRedoHistory()} >
              <IconButton>
                <RedoIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          </>
        }
        {history.map(({ name, time }, i) => (
          <ListItem button dense key={i}>
            <ListItemText
              primary={name}
              secondary={moment(time).format("LT")}
            />
            {i === 0 && (
              <ListItemSecondaryAction onClick={() => onUndoHistory()}>
                <IconButton>
                  <UndoIcon />
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        ))}
      </List> */}
    </SidebarBoxContainer>
  )
}

export default memo(HistorySidebarBox, (prevProps, nextProps) =>
  isEqual(
    prevProps.history.map((a) => [a.name, a.time]),
    nextProps.history.map((a) => [a.name, a.time])
  )
)
