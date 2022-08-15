// @flow

import type { MainLayoutState, Action } from "../../MainLayout/types"
import { setIn, updateIn, asMutable, without } from "seamless-immutable"
import moment from "moment"
import getActiveImage from "./get-active-image"

const typesToSaveWithHistory = {
  BEGIN_BOX_TRANSFORM: "Transform/Move Box",
  BEGIN_MOVE_POINT: "Move Point",
  DELETE_REGION: "Delete Region",
}

export const resetToHistory = (state: MainLayoutState, name: string) =>
  updateIn(state, ["history"], (h) => [
    {
      time: moment().toDate(),
      state: without(state, "history"),
      name,
    },
  ])

export const saveToHistory = (state: MainLayoutState, name: string) =>
  updateIn(state, ["history"], (h) =>
    [
      {
        time: moment().toDate(),
        state: without(state, "history"),
        name,
      },
    ].concat(h || [])
  )

export const saveToHistoryIndex = (state: MainLayoutState, index: number) =>
  updateIn(state, ["historyIndex"], () => [index])

export default (reducer) => {
  return (state: MainLayoutState, action: Action) => {
    const prevState = state
    const nextState = reducer(state, action)
    const { currentImageIndex, pathToActiveImage, activeImage } =
      getActiveImage(state)

    if (action.type === "REDO_HISTORY") {
      let historyIndex = state.images[0].historyIndex
      if (historyIndex === 0) {
        return state
      }

      if (
        nextState.history[historyIndex - 1] &&
        nextState.history[historyIndex - 1].name === "Create Box" &&
        nextState.history[historyIndex - 2] &&
        nextState.history[historyIndex - 2].name === "DONE BOX"
      ) {
        state = setIn(
          nextState.history[historyIndex - 2].state,
          ["history"],
          state.history
        )
        state = setIn(
          state,
          [...pathToActiveImage, "historyIndex"],
          historyIndex - 2
        )
      } else {
        state = setIn(
          nextState.history[historyIndex - 1].state,
          ["history"],
          state.history
        )
        state = setIn(
          state,
          [...pathToActiveImage, "historyIndex"],
          historyIndex - 1
        )
      }
      state = setIn(state, [...pathToActiveImage, "isUndoStarted"], true)
      return state
    }

    if (action.type === "UNDO_HISTORY") {
      let historyIndex = state.images[0].historyIndex
      let isLastRegion = false
      if (historyIndex === state.history.length) {
        return state
      }

      if (!state.images[0].isUndoStarted) {
        isLastRegion = true
        state = saveToHistory(state, "Last Region")
      }

      if (
        (nextState.history[historyIndex] &&
          nextState.history[historyIndex].name === "DONE BOX" &&
          nextState.history[historyIndex + 1] &&
          nextState.history[historyIndex + 1].name === "Create Box") ||
        (nextState.history[historyIndex] &&
          nextState.history[historyIndex].name === "DONE MAGIC" &&
          nextState.history[historyIndex + 1] &&
          nextState.history[historyIndex + 1].name === "Create Magic")
      ) {
        state = setIn(
          nextState.history[historyIndex + 1].state,
          ["history"],
          state.history
        )
        state = setIn(
          state,
          [...pathToActiveImage, "historyIndex"],
          historyIndex + 2
        )
      } else {
        state = setIn(
          nextState.history[historyIndex].state,
          ["history"],
          state.history
        )
        state = setIn(
          state,
          [...pathToActiveImage, "historyIndex"],
          historyIndex + 1
        )
      }

      state = setIn(state, [...pathToActiveImage, "isUndoStarted"], true)
      return state
    }

    if (action.type === "RESTORE_HISTORY") {
      if (state.history.length > 0) {
        return setIn(
          nextState.history[0].state,
          ["history"],
          nextState.history.slice(1)
        )
      }
    } else {
      if (
        prevState !== nextState &&
        Object.keys(typesToSaveWithHistory).includes(action.type)
      ) {
        return setIn(
          nextState,
          ["history"],
          [
            {
              time: moment().toDate(),
              state: without(prevState, "history"),
              name: typesToSaveWithHistory[action.type] || action.type,
            },
          ].concat(nextState.history || [])
        )
      }
    }

    return nextState
  }
}
