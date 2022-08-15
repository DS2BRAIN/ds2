// @flow

import type { MainLayoutState, Action } from "../../MainLayout/types"
import { moveRegion } from "../../ImageCanvas/region-tools.js"
import { getIn, setIn, updateIn } from "seamless-immutable"
import moment from "moment"
import isEqual from "lodash/isEqual"
import getActiveImage from "./get-active-image"
import { saveToHistory, resetToHistory } from "./history-handler.js"
import axios from "axios"
import getTimeString from "../../KeyframeTimeline/get-time-string"
import * as api from "../../api.js"
import Cookies from "../../helpers/Cookies"
import { useTranslation } from "react-i18next"

function timeout(delay) {
  return new Promise((res) => setTimeout(res, delay))
}

const lang = Cookies.getCookie("language")

const getRandomId = () => Math.random().toString().split(".")[1]

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
let positivePoints = {}
let negativePoints = {}
const getRandomColor = () => {
  const h = getRandomInt(0, 360)
  const s = 100
  const l = 50
  return `hsl(${h},${s}%,${l}%)`
}

const deleteOriginalLabels = async (idArr) => {
  let isSuccess = true
  await api.deleteLabels(idArr).catch((e) => {
    isSuccess = false
  })
  return isSuccess
}

let checkSaveNum = 0
let saveLabelsErrCnt = 0

const saveLabels = async (state, clickedButton) => {
  const currentUrl = window.location.href
  const isEnterprise = process.env.REACT_APP_ENTERPRISE === "true"
  const isDeploy = process.env.REACT_APP_DEPLOY === "true"
  const isDev = process.env.REACT_APP_DEV === "true"
  var tempUrl = `http://localhost:${isEnterprise ? "13001" : "3001"}/`

  if (isDeploy) {
    tempUrl = process.env.REACT_APP_LABELAPP_URL

    if (isEnterprise) {
      tempUrl = isDev
        ? "https://staginglabelapp.ds2.ai/"
        : "http://" + window.location.host.split(":")[0] + ":13001/"
    }
  }

  let path = currentUrl.replace(tempUrl, "")
  const pathArr = path.split("/")
  let labelProjectId = parseInt(pathArr[0])
  let labelFileId = pathArr[1]

  let retVal = {
    isSavingSuccess: true,
    isCardRequestError: false,
    url: "",
  }
  let classId = 0
  let label
  let labelsToPost = []
  let labelsToPut = []
  const image = state.images[0]
  const regions = image.regions
  const changedRegions = image.changedRegions
  const reviewer = image.reviewer
  const userEmail = Cookies.getCookie("assignee")
  const isReview =
    image.status === "review" ||
    image.status === "reject" ||
    Cookies.getCookie("inspectionResult") !== "null"
  const appStatusForRequestValue =
    image.appStatus === "prepare" || image.appStatus === "working"
      ? "prepare"
      : image.appStatus === "review"
      ? "review"
      : image.appStatus === "done"
      ? "done"
      : image.appStatus === "reject"
      ? "reject"
      : "none"

  await regions.forEach(async (region, idx) => {
    const id = region.id

    image.clsInfo.forEach((each) => {
      if (each.name === region.cls) {
        classId = each.id
      }
    })

    if (region.type === "box") {
      label = {
        id,
        status: "done",
        labeltype: region.type,
        color: region.color,
        labelclass: region.cls,
        x: region.x,
        y: region.y,
        h: region.h,
        w: region.w,
        highlighted: false,
        editingLabels: region.editingLabels,
        labelclass: classId,
        locked: true,
        pointCount: 4,
      }
    } else {
      label = {
        id,
        status: "done",
        labeltype: region.type,
        color: region.color,
        points: region.points,
        labelclass: region.cls,
        highlighted: false,
        editingLabels: region.editingLabels,
        labelclass: classId,
        locked: true,
        pointCount: region.points.length,
      }
    }
    label["sthreefile"] = image.labelFileId
    label["labelproject"] = image.labelProjectId
    label["ismagictool"] = region.isMagictool

    if (changedRegions[id] === "none") {
      return
    } else if (changedRegions[id] === "modify") {
      labelsToPut.push(label)
    } else {
      labelsToPost.push(label)
    }
  })

  if (labelsToPut.length > 0) {
    await api
      .putLabels(labelsToPut)
      .then(() => {})
      .catch(() => {
        retVal.isSavingSuccess = false
      })
  }

  if (labelsToPost.length > 0) {
    await api
      .postLabels(labelsToPost)
      .then(async () => {
        if (clickedButton === "save") {
          await api
            .setObjectStatus(
              image.id,
              "done",
              isReview,
              appStatusForRequestValue
            )
            .then(() => {
              checkSaveNum = 0
            })
            .catch((e) => {
              retVal.isSavingSuccess = false
              checkSaveNum = 0
            })
        }
        saveLabelsErrCnt = 0
      })
      .catch((e) => {
        saveLabelsErrCnt++

        if (saveLabelsErrCnt < 3) {
          retVal.isSavingSuccess = "retry"
        } else {
          retVal.isSavingSuccess = false
          saveLabelsErrCnt = 0
        }

        if (
          e.response &&
          e.response.status === 402 &&
          !process.env.REACT_APP_ENTERPRISE
        ) {
          if (e.response.data.role === "member") {
            alert(
              lang === "en"
                ? "You can use the service after credit is charged. Contact your group administrator."
                : "크레딧 충전 후 서비스 이용이 가능합니다. 그룹 관리자에게 문의하세요."
            )
          } else {
            var tempUrl = `http://localhost:3000/`

            if (process.env.REACT_APP_DEPLOY) {
              tempUrl = `${process.env.REACT_APP_FRONTEND_URL}`
            }

            window.open(
              `${tempUrl}admin/setting/payment/?cardRequest=true`,
              "_blank"
            )
          }

          retVal.isCardRequestError = true
          return
        }
        checkSaveNum = 0
      })
  } else if (labelsToPost.length === 0) {
    if (clickedButton === "save") {
      await api
        .setObjectStatus(image.id, "done", isReview, appStatusForRequestValue)
        .then(() => {
          checkSaveNum = 0
        })
        .catch((e) => {
          retVal.isSavingSuccess = false
          checkSaveNum = 0
        })
    }
  }

  return retVal
}

export default (state: MainLayoutState, action: Action) => {
  const lang = Cookies.getCookie("language")
  // Throttle certain actions
  if (action.type === "MOUSE_MOVE") {
    if (Date.now() - ((state: any).lastMouseMoveCall || 0) < 16) return state
    state = setIn(state, ["lastMouseMoveCall"], Date.now())
  }
  if (!action.type.includes("MOUSE")) {
    state = setIn(state, ["lastAction"], action)
  }

  const { currentImageIndex, pathToActiveImage, activeImage } =
    getActiveImage(state)

  const getRegionIndex = (region) => {
    const regionId =
      typeof region === "string" || typeof region === "number"
        ? region
        : region.id
    if (!activeImage) return null
    const regionIndex = (activeImage.regions || []).findIndex(
      (r) => r.id === regionId
    )
    return regionIndex === -1 ? null : regionIndex
  }
  const getRegion = (regionId) => {
    if (!activeImage) return null
    const regionIndex = getRegionIndex(regionId)
    if (regionIndex === null) return [null, null]
    const region = activeImage.regions[regionIndex]
    return [region, regionIndex]
  }
  const modifyRegion = (regionId, obj) => {
    const [region, regionIndex] = getRegion(regionId)
    if (!region) return state
    if (obj !== null) {
      return setIn(state, [...pathToActiveImage, "regions", regionIndex], {
        ...region,
        ...obj,
      })
    } else {
      // delete region
      const regions = activeImage.regions
      return setIn(
        state,
        [...pathToActiveImage, "regions"],
        (regions || []).filter((r) => r.id !== region.id)
      )
    }
    // state = setIn(
    //   state,
    //   [...pathToActiveImage, "lastClassColor"],
    //   action.color
    // )
  }
  const unselectRegions = (state: MainLayoutState) => {
    if (!activeImage) return state
    return setIn(
      state,
      [...pathToActiveImage, "regions"],
      (activeImage.regions || []).map((r) => ({
        ...r,
        highlighted: false,
        editingLabels: false,
      }))
    )
  }

  const closeEditors = (state: MainLayoutState) => {
    if (currentImageIndex === null) return state
    return setIn(
      state,
      [...pathToActiveImage, "regions"],
      (activeImage.regions || []).map((r) => ({
        ...r,
        editingLabels: false,
      }))
    )
  }

  const setNewImage = (img: string | Object) => {
    let { src, frameTime } = typeof img === "object" ? img : { src: img }
    return setIn(
      setIn(state, ["selectedImage"], src),
      ["selectedImageFrameTime"],
      frameTime
    )
  }

  switch (action.type) {
    case "@@INIT": {
      return state
    }
    case "SELECT_IMAGE": {
      state = resetToHistory(state, "Select Image")
      return setNewImage(action.image)
    }
    case "CHANGE_CLASS": {
      state = setIn(
        state,
        [...pathToActiveImage, "lastClassColor"],
        action.color
      )
      return setIn(state, [...pathToActiveImage, "lastClass"], action.class)
    }
    case "CHANGE_REGION": {
      const regionIndex = getRegionIndex(action.region)

      if (regionIndex === null) return state
      const oldRegion = activeImage.regions[regionIndex]

      if (action.region.lockAction) {
        let tempRegion = { ...oldRegion, locked: action.region.locked }
        return setIn(
          state,
          [...pathToActiveImage, "regions", regionIndex],
          tempRegion
        )
      }

      if (action.region.visibleAction) {
        let tempRegion = { ...oldRegion, visible: action.region.visible }
        return setIn(
          state,
          [...pathToActiveImage, "regions", regionIndex],
          tempRegion
        )
      }

      if (oldRegion.cls !== action.region.cls) {
        const clsInfo = state.images[0].clsInfo
        clsInfo.forEach((each) => {
          if (each.name === action.region.cls) action.region.color = each.color
        })

        // if(state.images[0].isUndoStarted){
        //   state = setIn(
        //     state,
        //     [...pathToActiveImage, "historyIndex"],
        //     0
        //   )
        //   state = setIn(
        //     state,
        //     [...pathToActiveImage, "isUndoStarted"],
        //     false
        //   )
        //   state = resetToHistory(state, "Change Region Classification")
        // }else{
        //   state = saveToHistory(state, "Change Region Classification")
        // }
      }
      if (!isEqual(oldRegion.tags, action.region.tags)) {
        //state = saveToHistory(state, "Change Region Tags")
      }
      state = setIn(
        state,
        [...pathToActiveImage, "regions", regionIndex],
        action.region
      )
      const tempRegions = { ...state.images[0].changedRegions }
      const id = action.region.id
      let isOriginalLabel = false

      state.images[0].originalRegions.forEach((region) => {
        if (region.id === id) isOriginalLabel = true
      })

      if (isOriginalLabel) tempRegions[id] = "modify"
      state = setIn(
        state,
        [...pathToActiveImage, "changedRegions"],
        tempRegions
      )
      return state
    }

    case "CHANGE_IMAGE": {
      if (!activeImage) return state
      const { delta } = action
      for (const key of Object.keys(delta)) {
        if (key === "cls") {
          if (state.images[0].isUndoStarted) {
            state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
            state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
            resetToHistory(state, "Change Image Class")
          } else {
            saveToHistory(state, "Change Image Class")
          }
        }
        if (key === "tags") {
          if (state.images[0].isUndoStarted) {
            state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
            state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
            resetToHistory(state, "Change Image Tags")
          } else {
            saveToHistory(state, "Change Image Tags")
          }
        }
        state = setIn(state, [...pathToActiveImage, key], delta[key])
      }
      return state
    }
    case "SELECT_REGION": {
      const { region } = action
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) return state
      const regions = [...(activeImage.regions || [])].map((r) => ({
        ...r,
        highlighted: r.id === region.id,
        editingLabels: r.id === region.id,
      }))
      return setIn(state, [...pathToActiveImage, "regions"], regions)
    }
    case "BEGIN_MOVE_POINT": {
      state = closeEditors(state)
      return setIn(state, ["mode"], {
        mode: "MOVE_REGION",
        regionId: action.point.id,
      })
    }
    case "BEGIN_BOX_TRANSFORM": {
      const { box, directions } = action
      state = closeEditors(state)
      if (directions[0] === 0 && directions[1] === 0) {
        return setIn(state, ["mode"], { mode: "MOVE_REGION", regionId: box.id })
      } else {
        return setIn(state, ["mode"], {
          mode: "RESIZE_BOX",
          regionId: box.id,
          freedom: directions,
          original: { x: box.x, y: box.y, w: box.w, h: box.h },
        })
      }
    }
    case "BEGIN_MOVE_POLYLINE_POINT": {
      const { polyline, pointIndex } = action
      state = closeEditors(state)
      if (
        state.mode &&
        state.mode.mode === "DRAW_POLYLINE" &&
        pointIndex === 0
      ) {
        if (state.images[0].isUndoStarted) {
          state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
          state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
          state = resetToHistory(state, "Done Polyline Point")
        } else {
          state = saveToHistory(state, "Done Polyline Point")
        }
        return setIn(
          modifyRegion(polyline, {
            points: polyline.points.slice(0, -1),
            open: false,
            editingLabels: false,
            highlighted: false,
          }),
          ["mode"],
          null
        )
      } else {
        if (state.images[0].isUndoStarted) {
          state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
          state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
          state = resetToHistory(state, "Move Polyline Point")
        } else {
          state = saveToHistory(state, "Move Polyline Point")
        }
      }
      const tempRegions = { ...state.images[0].changedRegions }
      const id = action.polyline.id
      if (!isNaN(Number(id))) {
        tempRegions[id] = "new"
      } else {
        tempRegions[id] = "modify"
      }

      state = setIn(
        state,
        [...pathToActiveImage, "changedRegions"],
        tempRegions
      )

      return setIn(state, ["mode"], {
        mode: "MOVE_POLYLINE_POINT",
        regionId: polyline.id,
        pointIndex,
      })
    }
    case "BEGIN_MOVE_POLYGON_POINT": {
      const { polygon, pointIndex } = action
      state = closeEditors(state)
      if (
        state.mode &&
        state.mode.mode === "DRAW_POLYGON" &&
        pointIndex === 0
      ) {
        if (state.images[0].isUndoStarted) {
          state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
          state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
          state = resetToHistory(state, "Done Polygon Point")
        } else {
          state = saveToHistory(state, "Done Polygon Point")
        }
        return setIn(
          modifyRegion(polygon, {
            points: polygon.points.slice(0, -1),
            open: false,
            editingLabels: false,
            highlighted: false,
          }),
          ["mode"],
          null
        )
      } else {
        if (state.images[0].isUndoStarted) {
          state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
          state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
          state = resetToHistory(state, "Move Polygon Point")
        } else {
          state = saveToHistory(state, "Move Polygon Point")
        }
      }
      const tempRegions = { ...state.images[0].changedRegions }
      const id = action.polygon.id

      if (!isNaN(Number(id))) {
        tempRegions[id] = "new"
      } else {
        tempRegions[id] = "modify"
      }

      state = setIn(
        state,
        [...pathToActiveImage, "changedRegions"],
        tempRegions
      )

      return setIn(state, ["mode"], {
        mode: "MOVE_POLYGON_POINT",
        regionId: polygon.id,
        pointIndex,
      })
    }
    case "DELETE_POLYGON_POINT": {
      const { polygon, pointIndex } = action
      const regionIndex = getRegionIndex(polygon)
      if (regionIndex === null) return state
      const points = [...polygon.points]
      points.splice(pointIndex, 1)

      if (
        state.mode &&
        state.mode.mode === "DRAW_POLYGON" &&
        pointIndex === 0
      ) {
        if (state.images[0].isUndoStarted) {
          state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
          state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
          state = resetToHistory(state, "Done Polygon Point")
        } else {
          state = saveToHistory(state, "Done Polygon Point")
        }
        return setIn(
          modifyRegion(polygon, {
            points: polygon.points.slice(0, -1),
            open: false,
            editingLabels: false,
            highlighted: false,
          }),
          ["mode"],
          null
        )
      } else {
        if (state.images[0].isUndoStarted) {
          state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
          state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
          state = resetToHistory(state, "Delete Polygon Point")
        } else {
          state = saveToHistory(state, "Delete Polygon Point")
        }
      }

      return setIn(state, [...pathToActiveImage, "regions", regionIndex], {
        ...polygon,
        points,
      })
    }
    case "ADD_POLYLINE_POINT": {
      const { polyline, point, pointIndex } = action
      const regionIndex = getRegionIndex(polyline)
      if (regionIndex === null) return state
      const points = [...polyline.points]
      points.splice(pointIndex, 0, point)

      return setIn(state, [...pathToActiveImage, "regions", regionIndex], {
        ...polyline,
        points,
      })
    }
    case "ADD_POLYGON_POINT": {
      const { polygon, point, pointIndex } = action
      const regionIndex = getRegionIndex(polygon)
      if (regionIndex === null) return state
      const points = [...polygon.points]
      points.splice(pointIndex, 0, point)

      return setIn(state, [...pathToActiveImage, "regions", regionIndex], {
        ...polygon,
        points,
      })
    }
    case "MOUSE_MOVE": {
      const { x, y } = action
      if (!state.mode) return state
      if (!activeImage) return state
      switch (state.mode.mode) {
        case "MOVE_POLYLINE_POINT": {
          const { pointIndex, regionId } = state.mode
          const regionIndex = getRegionIndex(regionId)
          if (regionIndex === null) return state
          return setIn(
            state,
            [
              ...pathToActiveImage,
              "regions",
              regionIndex,
              "points",
              pointIndex,
            ],
            [x, y]
          )
        }
        case "MOVE_POLYGON_POINT": {
          const { pointIndex, regionId } = state.mode
          const regionIndex = getRegionIndex(regionId)
          if (regionIndex === null) return state
          return setIn(
            state,
            [
              ...pathToActiveImage,
              "regions",
              regionIndex,
              "points",
              pointIndex,
            ],
            [x, y]
          )
        }
        case "MOVE_REGION": {
          const { regionId } = state.mode
          const regionIndex = getRegionIndex(regionId)
          if (regionIndex === null) return state

          const tempRegions = { ...state.images[0].changedRegions }

          if (!isNaN(Number(regionId))) {
            tempRegions[regionId] = "new"
          } else {
            tempRegions[regionId] = "modify"
          }

          state = setIn(
            state,
            [...pathToActiveImage, "changedRegions"],
            tempRegions
          )
          return setIn(
            state,
            [...pathToActiveImage, "regions", regionIndex],
            moveRegion(activeImage.regions[regionIndex], x, y)
          )
        }
        case "RESIZE_BOX": {
          const {
            regionId,
            freedom: [xFree, yFree],
            original: { x: ox, y: oy, w: ow, h: oh },
            isNew,
          } = state.mode
          const regionIndex = getRegionIndex(regionId)
          if (regionIndex === null) return state
          const box = activeImage.regions[regionIndex]

          const dx = xFree === 0 ? ox : xFree === -1 ? Math.min(ox + ow, x) : ox
          const dw =
            xFree === 0
              ? ow
              : xFree === -1
              ? ow + (ox - dx)
              : Math.max(0, ow + (x - ox - ow))
          const dy = yFree === 0 ? oy : yFree === -1 ? Math.min(oy + oh, y) : oy
          const dh =
            yFree === 0
              ? oh
              : yFree === -1
              ? oh + (oy - dy)
              : Math.max(0, oh + (y - oy - oh))

          // determine if we should switch the freedom
          if (dw <= 0.001) {
            state = setIn(state, ["mode", "freedom"], [xFree * -1, yFree])
          }
          if (dh <= 0.001) {
            state = setIn(state, ["mode", "freedom"], [xFree, yFree * -1])
          }

          const tempRegions = { ...state.images[0].changedRegions }

          if (isNew || !isNaN(Number(regionId))) {
            tempRegions[regionId] = "new"
          } else {
            tempRegions[regionId] = "modify"
          }
          state = setIn(
            state,
            [...pathToActiveImage, "changedRegions"],
            tempRegions
          )

          return setIn(state, [...pathToActiveImage, "regions", regionIndex], {
            ...box,
            x: dx,
            w: dw,
            y: dy,
            h: dh,
            tempRegions,
          })
        }
        case "DRAW_POLYLINE": {
          const { regionId } = state.mode
          const [region, regionIndex] = getRegion(regionId)
          if (!region) return setIn(state, ["mode"], null)
          return setIn(
            state,
            [
              ...pathToActiveImage,
              "regions",
              regionIndex,
              "points",
              (region: any).points.length - 1,
            ],
            [x, y]
          )
        }
        case "DRAW_POLYGON": {
          const { regionId } = state.mode
          const [region, regionIndex] = getRegion(regionId)
          if (!region) return setIn(state, ["mode"], null)
          return setIn(
            state,
            [
              ...pathToActiveImage,
              "regions",
              regionIndex,
              "points",
              (region: any).points.length - 1,
            ],
            [x, y]
          )
        }
        case "DRAW_MAGIC": {
          const {
            regionId,
            freedom: [xFree, yFree],
            original: { x: ox, y: oy, w: ow, h: oh },
          } = state.mode
          const regionIndex = getRegionIndex(regionId)
          if (regionIndex === null) return state
          const box = activeImage.regions[regionIndex]

          const dx = xFree === 0 ? ox : xFree === -1 ? Math.min(ox + ow, x) : ox
          const dw =
            xFree === 0
              ? ow
              : xFree === -1
              ? ow + (ox - dx)
              : Math.max(0, ow + (x - ox - ow))
          const dy = yFree === 0 ? oy : yFree === -1 ? Math.min(oy + oh, y) : oy
          const dh =
            yFree === 0
              ? oh
              : yFree === -1
              ? oh + (oy - dy)
              : Math.max(0, oh + (y - oy - oh))

          // determine if we should switch the freedom
          if (dw <= 0.001) {
            state = setIn(state, ["mode", "freedom"], [xFree * -1, yFree])
          }
          if (dh <= 0.001) {
            state = setIn(state, ["mode", "freedom"], [xFree, yFree * -1])
          }

          return setIn(state, [...pathToActiveImage, "regions", regionIndex], {
            ...box,
            x: dx,
            w: dw,
            y: dy,
            h: dh,
          })
        }
      }
      return state
    }
    case "GET_BOX_PATH": {
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) return state
      state = setIn(
        state,
        [...pathToActiveImage, "regions"],
        (activeImage.regions || []).filter((r) => r.id !== action.region.id)
      )
      return state
    }
    case "GET_MAGIC_PATH": {
      let newRegion = {
        type: "polygon",
        points: action.pointsArray,
        coords: action.coords,
        open: false,
        highlighted: true,
        editingLabels: true,
        color: state.images[0].lastClassColor
          ? state.images[0].lastClassColor
          : getRandomColor(),
        cls: state.images[0].lastClass,
        id: getRandomId(),
        isMagictool: true,
      }
      state = unselectRegions(state)
      let regions = [...(activeImage.regions || [])]
        .map((r) => ({
          ...r,
          editingLabels: false,
          highlighted: false,
        }))
        .concat(newRegion ? [newRegion] : [])
        .filter((r) => r.type !== "magic") // remove magic tool, add polygon
      state = setIn(state, ["mode"], null)
      state = setIn(state, [...pathToActiveImage, "regions"], regions)
      return state
    }
    case "UPDATE_MAGIC_PATH": {
      return setIn(
        modifyRegion(action.id, {
          points: action.pointsArray,
          open: false,
          editingLabels: false,
          highlighted: true,
          isMagicUpdateDone: false,
        }),
        ["mode"],
        null
      )
    }
    case "MOUSE_DOWN": {
      if (!activeImage) return state
      const { x, y } = action
      if (x < 0 || y < 0 || x > 1 || y > 1) {
        alert(
          lang === "en"
            ? "Labeling is allowed within the picture borders only."
            : "이미지 범위안에서 라벨링이 가능합니다."
        )
        break
      }
      let newRegion
      if (state.allowedArea) {
        const aa = state.allowedArea
        if (x < aa.x || x > aa.x + aa.w || y < aa.y || y > aa.y + aa.h) {
          return state
        }
      }

      let color
      switch (state.selectedTool) {
        case "create-point": {
          if (state.images[0].isUndoStarted) {
            state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
            state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
            state = resetToHistory(state, "Create Point")
          } else {
            state = saveToHistory(state, "Create Point")
          }

          newRegion = {
            type: "point",
            x,
            y,
            highlighted: true,
            editingLabels: true,
            color: state.images[0].lastClassColor
              ? state.images[0].lastClassColor
              : getRandomColor(),
            id: getRandomId(),
            cls: state.images[0].lastClass,
          }
          break
        }
        case "create-box": {
          if (state.images[0].isUndoStarted) {
            state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
            state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
            state = resetToHistory(state, "Create Box")
          } else {
            state = saveToHistory(state, "Create Box")
          }

          newRegion = {
            type: "box",
            x: x,
            y: y,
            w: 0.01,
            h: 0.01,
            highlighted: true,
            editingLabels: false,
            color: state.images[0].lastClassColor
              ? state.images[0].lastClassColor
              : getRandomColor(),
            id: getRandomId(),
            cls: state.images[0].lastClass,
          }
          state = unselectRegions(state)
          state = setIn(state, ["mode"], {
            mode: "RESIZE_BOX",
            editLabelEditorAfter: true,
            regionId: newRegion.id,
            freedom: [1, 1],
            original: { x, y, w: newRegion.w, h: newRegion.h },
            isNew: true,
          })
          break
        }
        case "create-polyline": {
          if (state.mode && state.mode.mode === "DRAW_POLYLINE") break
          if (state.images[0].isUndoStarted) {
            state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
            state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
            state = resetToHistory(state, "Create Polyline")
          } else {
            state = saveToHistory(state, "Create Polyline")
          }
          newRegion = {
            type: "polyline",
            points: [
              [x, y],
              [x, y],
            ],
            open: true,
            highlighted: true,
            color: state.images[0].lastClassColor
              ? state.images[0].lastClassColor
              : getRandomColor(),
            id: getRandomId(),
            cls: state.images[0].lastClass,
          }
          state = setIn(state, ["mode"], {
            mode: "DRAW_POLYLINE",
            regionId: newRegion.id,
          })
          break
        }
        case "create-polygon": {
          if (state.mode && state.mode.mode === "DRAW_POLYGON") break
          if (state.images[0].isUndoStarted) {
            state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
            state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
            state = resetToHistory(state, "Create Polygon")
          } else {
            state = saveToHistory(state, "Create Polygon")
          }
          newRegion = {
            type: "polygon",
            points: [
              [x, y],
              [x, y],
            ],
            open: true,
            highlighted: true,
            color: state.images[0].lastClassColor
              ? state.images[0].lastClassColor
              : getRandomColor(),
            id: getRandomId(),
            cls: state.images[0].lastClass,
          }
          state = setIn(state, ["mode"], {
            mode: "DRAW_POLYGON",
            regionId: newRegion.id,
          })
          break
        }
        case "create-magic": {
          if (state.mode && state.mode.mode === "DRAW_MAGIC") break

          if (state.images[0].isUndoStarted) {
            state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
            state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
            state = resetToHistory(state, "Create Magic")
          } else {
            state = saveToHistory(state, "Create Magic")
          }

          newRegion = {
            type: "magic",
            x: x,
            y: y,
            w: 0.01,
            h: 0.01,
            highlighted: true,
            editingLabels: false,
            color: state.images[0].lastClassColor
              ? state.images[0].lastClassColor
              : getRandomColor(),
            id: getRandomId(),
            cls: state.images[0].lastClass,
          }
          state = setIn(state, ["mode"], {
            mode: "DRAW_MAGIC",
            editLabelEditorAfter: true,

            regionId: newRegion.id,
            freedom: [1, 1],
            original: { x, y, w: newRegion.w, h: newRegion.h },
            isNew: true,
          })
          break
        }
        case "create-magic-positive": {
          const selectedRegions = state.images[0].regions.filter(
            (v) => v.highlighted
          )
          if (selectedRegions.length === 0) {
            alert(
              lang === "en" ? "Please select a label." : "라벨을 선택해주세요."
            )
            break
          } else if (selectedRegions.length === 1) {
            if (!selectedRegions[0].isMagictool) {
              alert(
                lang === "en"
                  ? "Applicable only to labels created with the magic tool."
                  : "매직툴로 생성한 라벨에만 적용 가능합니다."
              )
              break
            } else {
              const { x1, y1, x2, y2 } = selectedRegions[0].coords
              if (!(x > x1 && x < x2 && y > y1 && y < y2)) {
                alert(
                  lang === "en"
                    ? "Applicable only within the dragged area."
                    : "드래그한 영역 내에서만 적용 가능합니다."
                )
                break
              }
            }
          } else {
            alert(
              lang === "en"
                ? "Applicable to only one label."
                : "한 개의 라벨에서만 적용 가능합니다."
            )
            break
          }

          state = setIn(state, ["mode"], {
            mode: "DRAW_MAGIC_POSITIVE",
            editLabelEditorAfter: true,
            regionId: selectedRegions[0].id,
            freedom: [1, 1],
            // isNew: true,
          })

          positivePoints = {
            ...positivePoints,
            [selectedRegions[0].id]: positivePoints[selectedRegions[0].id]
              ? positivePoints[selectedRegions[0].id].concat([
                  [
                    Math.round(x * state.images[0].width),
                    Math.round(y * state.images[0].height),
                  ],
                ])
              : [].concat([
                  [
                    Math.round(x * state.images[0].width),
                    Math.round(y * state.images[0].height),
                  ],
                ]),
          }
          state = setIn(state, ["positivePoints"], {
            ...positivePoints,
          })

          // state = setIn(state, ["magicToolClicked"], {
          //   positive: true,
          //   negative: false,
          // })
          state = setIn(state, ["magicToolClicked"], true)
          // positivePoints[selectedRegions[0].id].push([x, y])
          break
        }
        case "create-magic-negative": {
          const selectedRegions = state.images[0].regions.filter(
            (v) => v.highlighted
          )
          if (selectedRegions.length === 0) {
            alert(
              lang === "en" ? "Please select a label." : "라벨을 선택해주세요."
            )
            break
          } else if (selectedRegions.length === 1) {
            if (!selectedRegions[0].isMagictool) {
              alert(
                lang === "en"
                  ? "Available only for labels created with the Magic Tool."
                  : "매직툴로 생성한 라벨에만 사용 가능합니다"
              )
              break
            } else {
              const { x1, y1, x2, y2 } = selectedRegions[0].coords
              if (!(x > x1 && x < x2 && y > y1 && y < y2)) {
                alert(
                  lang === "en"
                    ? "It can be applied only within the area created with the magic tool."
                    : "매직툴로 생성한 영역 내에서만 적용 가능합니다."
                )
                break
              }
            }
          } else {
            alert(
              lang === "en"
                ? "Applicable to only one label."
                : "한 개의 라벨에서만 적용 가능합니다."
            )
            break
          }

          state = setIn(state, ["mode"], {
            mode: "DRAW_MAGIC_NEGATIVE",
            editLabelEditorAfter: true,
            regionId: selectedRegions[0].id,
            freedom: [1, 1],
            // isNew: true,
          })

          negativePoints = {
            ...negativePoints,
            [selectedRegions[0].id]: negativePoints[selectedRegions[0].id]
              ? negativePoints[selectedRegions[0].id].concat([
                  [
                    Math.round(x * state.images[0].width),
                    Math.round(y * state.images[0].height),
                  ],
                ])
              : [].concat([
                  [
                    Math.round(x * state.images[0].width),
                    Math.round(y * state.images[0].height),
                  ],
                ]),
          }
          state = setIn(state, ["negativePoints"], {
            ...negativePoints,
          })
          state = setIn(state, ["magicToolClicked"], true)
          // positivePoints[selectedRegions[0].id].push([x, y])
          break
        }
      }

      if (newRegion) {
        state = unselectRegions(state)
      }

      if (state.mode) {
        switch (state.mode.mode) {
          case "DRAW_POLYLINE": {
            const [polyline, regionIndex] = getRegion(state.mode.regionId)
            if (!polyline) break

            if (state.images[0].isUndoStarted) {
              state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
              state = setIn(
                state,
                [...pathToActiveImage, "isUndoStarted"],
                false
              )
              state = resetToHistory(state, "DONE POLYLINE")
            } else {
              state = saveToHistory(state, "DONE POLYLINE")
            }
            return setIn(
              state,
              [...pathToActiveImage, "regions", regionIndex],
              { ...polyline, points: polyline.points.concat([[x, y]]) }
            )
          }

          case "DRAW_POLYGON": {
            const [polygon, regionIndex] = getRegion(state.mode.regionId)
            if (!polygon) break

            if (state.images[0].isUndoStarted) {
              state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
              state = setIn(
                state,
                [...pathToActiveImage, "isUndoStarted"],
                false
              )
              state = resetToHistory(state, "DONE POLYGON")
            } else {
              state = saveToHistory(state, "DONE POLYGON")
            }
            return setIn(
              state,
              [...pathToActiveImage, "regions", regionIndex],
              { ...polygon, points: polygon.points.concat([[x, y]]) }
            )
          }
        }
      }

      const regions = [...(activeImage.regions || [])]
        .map((r) => ({
          ...r,
          editingLabels: false,
          highlighted: false,
        }))
        .concat(newRegion ? [newRegion] : [])

      return setIn(state, [...pathToActiveImage, "regions"], regions)
    }
    case "MOUSE_UP": {
      let newRegion
      const { x, y } = action
      if (!state.mode) return state
      if (x < 0 || y < 0 || x > 1 || y > 1) {
        alert(
          lang === "en"
            ? "Labeling is allowed within the picture borders only."
            : "이미지 범위안에서 라벨링이 가능합니다."
        )
        break
      }

      // state = setIn(
      //   state,
      //   [...pathToActiveImage, "regions"],
      //   (activeImage.regions || []).map((r) => {
      //     if (r.type === "magic") {
      //       return {
      //         ...r,
      //         highlighted: false,
      //       }
      //     }
      //   })
      // )
      switch (state.mode.mode) {
        case "RESIZE_BOX": {
          if (state.mode.isNew) {
            if (
              Math.abs(state.mode.original.x - x) < 0.01 &&
              Math.abs(state.mode.original.y - y) < 0.01
            ) {
              if (state.images[0].isUndoStarted) {
                state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
                state = setIn(
                  state,
                  [...pathToActiveImage, "isUndoStarted"],
                  false
                )
                state = resetToHistory(state, "DONE BOX")
              } else {
                state = saveToHistory(state, "DONE BOX")
              }
              return setIn(
                modifyRegion(state.mode.regionId, null),
                ["mode"],
                null
              )
            }
          }
          if (state.mode.editLabelEditorAfter) {
            if (state.images[0].isUndoStarted) {
              state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
              state = setIn(
                state,
                [...pathToActiveImage, "isUndoStarted"],
                false
              )
              state = resetToHistory(state, "DONE BOX")
            } else {
              state = saveToHistory(state, "DONE BOX")
            }
            state = {
              ...modifyRegion(state.mode.regionId, {
                editingLabels: true,
                highlighted: true,
              }),
              mode: null,
            }
            return state
          }

          if (state.images[0].isUndoStarted) {
            state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
            state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
            state = resetToHistory(state, "DONE BOX")
          } else {
            state = saveToHistory(state, "DONE BOX")
          }
        }
        case "MOVE_REGION":
        case "MOVE_POLYLINE_POINT":
        case "MOVE_POLYGON_POINT": {
          return { ...state, mode: null }
        }
        case "DRAW_MAGIC": {
          if (state.mode.isNew) {
            if (
              Math.abs(state.mode.original.x - x) < 0.01 &&
              Math.abs(state.mode.original.y - y) < 0.01
            ) {
              return setIn(
                modifyRegion(state.mode.regionId, null),
                ["mode"],
                null
              )
            }
          }

          if (state.mode.editLabelEditorAfter) {
            if (state.images[0].isUndoStarted) {
              state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
              state = setIn(
                state,
                [...pathToActiveImage, "isUndoStarted"],
                false
              )
              state = resetToHistory(state, "DONE MAGIC")
            } else {
              state = saveToHistory(state, "DONE MAGIC")
            }
            return {
              ...modifyRegion(state.mode.regionId, {
                editingLabels: true,
                highlighted: true,
                isMagicDone: true,
              }),
              mode: null,
              // showTags: true,
              // isDone: true,
            }
          }
        }
        case "DRAW_MAGIC_POSITIVE": {
          return {
            ...modifyRegion(state.mode.regionId, {
              editingLabels: true,
              highlighted: true,
              isMagicUpdateDone: true,
            }),
            mode: null,
            showTags: true,
            isDone: true,
          }
          break
        }
        case "DRAW_MAGIC_NEGATIVE": {
          return {
            ...modifyRegion(state.mode.regionId, {
              editingLabels: false,
              highlighted: true,
              isMagicUpdateDone: true,
            }),
            mode: null,
            showTags: true,
            isDone: true,
          }
          break
        }
      }
      return state
    }
    case "CHANGE_REGION": {
      const { region } = action
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) return state
      return setIn(
        state,
        [...pathToActiveImage, "regions", regionIndex],
        region
      )
    }
    case "OPEN_REGION_EDITOR": {
      const { region } = action
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) return state
      const newRegions = setIn(
        activeImage.regions.map((r) => ({
          ...r,
          highlighted: false,
          editingLabels: false,
        })),
        [regionIndex],
        {
          ...(activeImage.regions || [])[regionIndex],
          highlighted: true,
          editingLabels: true,
        }
      )
      return setIn(state, [...pathToActiveImage, "regions"], newRegions)
    }
    case "CLOSE_REGION_EDITOR": {
      const { region } = action
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) return state
      return setIn(state, [...pathToActiveImage, "regions", regionIndex], {
        ...(activeImage.regions || [])[regionIndex],
        highlighted: false,
        editingLabels: false,
      })
    }
    case "DELETE_REGION": {
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) return state
      const id = action.region.id
      let isOriginalRegion = false
      const originalRegions = state.images[0].originalRegions
      originalRegions.forEach((region) => {
        if (id === region.id) isOriginalRegion = true
      })
      const tempRegions = [...state.images[0].deletedRegions]
      if (isOriginalRegion) tempRegions.push(id)
      state = setIn(
        state,
        [...pathToActiveImage, "deletedRegions"],
        tempRegions
      )
      state = setIn(
        state,
        [...pathToActiveImage, "regions"],
        (activeImage.regions || []).filter((r) => r.id !== action.region.id)
      )
      if (state.images[0].isUndoStarted) {
        state = setIn(state, [...pathToActiveImage, "historyIndex"], 0)
        state = setIn(state, [...pathToActiveImage, "isUndoStarted"], false)
        state = resetToHistory(state, "DELETE_REGION")
      } else {
        state = saveToHistory(state, "DELETE_REGION")
      }
      return state
    }
    case "HEADER_BUTTON_CLICKED": {
      const buttonName = action.buttonName.toLowerCase()
      switch (buttonName) {
        case "prev": {
          if (checkSaveNum === 0) {
            checkSaveNum++
            const image = state.images[0]
            const deletedRegions = image.deletedRegions
            let isSavingSuccess = true
            let url = ""
            const currentUrl = window.location.href

            const isEnterprise = process.env.REACT_APP_ENTERPRISE === "true"
            const isDeploy = process.env.REACT_APP_DEPLOY === "true"
            const isDev = process.env.REACT_APP_DEV === "true"
            var tempUrl = `http://localhost:${isEnterprise ? "13001" : "3001"}/`

            if (isDeploy) {
              tempUrl = process.env.REACT_APP_LABELAPP_URL

              if (isEnterprise) {
                tempUrl = isDev
                  ? "https://staginglabelapp.ds2.ai/"
                  : "http://" + window.location.host.split(":")[0] + ":13001/"
              }
            }

            let path = currentUrl.replace(tempUrl, "")
            const pathArr = path.split("/")
            let labelProjectId = parseInt(pathArr[0])
            let labelFileId = pathArr[1]
            let labelsToDelete = []
            const reviewer = image.reviewer
            const userEmail = Cookies.getCookie("assignee")
            const isReview =
              image.status === "review" ||
              image.status === "reject" ||
              Cookies.getCookie("inspectionResult") !== "null"
            const appStatusForRequestValue =
              image.appStatus === "prepare" || image.appStatus === "working"
                ? "prepare"
                : image.appStatus === "review"
                ? "review"
                : image.appStatus === "done"
                ? "done"
                : image.appStatus === "reject"
                ? "reject"
                : "none"

            try {
              ;(async () => {
                await deletedRegions.forEach(async (regionId) => {
                  labelsToDelete.push(regionId)
                })
                if (labelsToDelete.length > 0) {
                  await deleteOriginalLabels(labelsToDelete)
                }
                let retVal = await saveLabels(state, "prev")
                isSavingSuccess = retVal.isSavingSuccess

                if (isSavingSuccess) {
                  await api
                    .setObjectStatus(
                      image.id,
                      "done",
                      isReview,
                      appStatusForRequestValue
                    )
                    .then((res) => {
                      let fileIdArr = Cookies.getCookie(
                        `fileHistoryBy${labelProjectId}At${image.timeStamp}`
                      ).split(",")
                      let currentFileIdx = fileIdArr.indexOf(labelFileId)
                      let prevFileId = fileIdArr[currentFileIdx - 1]

                      const isEnterprise =
                        process.env.REACT_APP_ENTERPRISE === "true"
                      const isDeploy = process.env.REACT_APP_DEPLOY === "true"
                      const isDev = process.env.REACT_APP_DEV === "true"
                      var tempUrl = `http://localhost:${
                        isEnterprise ? "13001" : "3001"
                      }/`

                      if (isDeploy) {
                        tempUrl = process.env.REACT_APP_LABELAPP_URL

                        if (isEnterprise) {
                          tempUrl = isDev
                            ? "https://staginglabelapp.ds2.ai/"
                            : "http://" +
                              window.location.host.split(":")[0] +
                              ":13001/"
                        }
                      }

                      url =
                        fileIdArr[currentFileIdx - 1] !== undefined
                          ? `${tempUrl}${labelProjectId}/${prevFileId}`
                          : "none"

                      checkSaveNum = 0
                    })
                    .catch((e) => {
                      isSavingSuccess = false
                      checkSaveNum = 0
                    })
                }

                if (url === "none") {
                  await setTimeout(() => {
                    if (isSavingSuccess) {
                      alert(
                        lang === "en"
                          ? "Saved. No files are available for labeling."
                          : "저장했습니다. 라벨링 가능한 파일이 없습니다."
                      )
                      window.location.reload()
                    } else {
                      alert(
                        lang === "en"
                          ? "Sorry, please try again."
                          : "죄송합니다. 다시 시도해주세요."
                      )
                    }
                  }, [100])
                } else {
                  // await timeout(2000);
                  await setTimeout(() => {
                    if (isSavingSuccess) {
                      // alert(
                      //   lang === "en"
                      //     ? "Saved. The page Will be moved to next image."
                      //     : "저장했습니다. 이전 이미지로 이동합니다."
                      // )
                      window.location.assign(
                        `${url}/?token=${Cookies.getCookie("jwt")}&appStatus=${
                          image.appStatus
                        }&timeStamp=${image.timeStamp}`,
                        "_self"
                      )
                    } else {
                      if (!retVal.isCardRequestError) {
                        alert(
                          lang === "en"
                            ? "Sorry, please try again."
                            : "죄송합니다. 다시 시도해주세요."
                        )
                        window.location.reload()
                      }
                    }
                  }, [100])
                }
              })()
            } catch (e) {
              alert(
                lang === "en"
                  ? "Sorry, please try again."
                  : "죄송합니다. 다시 시도해주세요."
              )
            }
          }
        }
        case "next": {
          if (checkSaveNum === 0) {
            checkSaveNum++
            const image = state.images[0]
            const deletedRegions = image.deletedRegions
            let isSavingSuccess = true
            let url = ""
            const currentUrl = window.location.href

            const isEnterprise = process.env.REACT_APP_ENTERPRISE === "true"
            const isDeploy = process.env.REACT_APP_DEPLOY === "true"
            const isDev = process.env.REACT_APP_DEV === "true"
            var tempUrl = `http://localhost:${isEnterprise ? "13001" : "3001"}/`

            if (isDeploy) {
              tempUrl = process.env.REACT_APP_LABELAPP_URL

              if (isEnterprise) {
                tempUrl = isDev
                  ? "https://staginglabelapp.ds2.ai/"
                  : "http://" + window.location.host.split(":")[0] + ":13001/"
              }
            }

            let path = currentUrl.replace(tempUrl, "")
            const pathArr = path.split("/")
            let labelProjectId = parseInt(pathArr[0])
            let labelFileId = pathArr[1]
            let labelsToDelete = []
            const reviewer = image.reviewer
            const userEmail = Cookies.getCookie("assignee")
            const isReview =
              image.status === "review" ||
              image.status === "reject" ||
              Cookies.getCookie("inspectionResult") !== "null"
            const appStatusForRequestValue =
              image.appStatus === "prepare" || image.appStatus === "working"
                ? "prepare"
                : image.appStatus === "review"
                ? "review"
                : image.appStatus === "done"
                ? "done"
                : image.appStatus === "reject"
                ? "reject"
                : "none"

            try {
              ;(async () => {
                await deletedRegions.forEach(async (regionId) => {
                  labelsToDelete.push(regionId)
                })
                if (labelsToDelete.length > 0) {
                  await deleteOriginalLabels(labelsToDelete)
                }
                let retVal = await saveLabels(state, "next")
                isSavingSuccess = retVal.isSavingSuccess

                if (isSavingSuccess) {
                  await api
                    .setObjectStatus(
                      image.id,
                      "done",
                      isReview,
                      appStatusForRequestValue
                    )
                    .then(async (res) => {
                      let fileIdArr = Cookies.getCookie(
                        `fileHistoryBy${labelProjectId}At${image.timeStamp}`
                      ).split(",")
                      let currentFileIdx = fileIdArr.indexOf(labelFileId)
                      let nextFileId = ""

                      if (
                        currentFileIdx !== -1 &&
                        currentFileIdx === fileIdArr.length - 1
                      ) {
                        nextFileId = res.data.nextSthreeFile.id
                        // console.log(
                        //   "현재 아이디가 포함되어 있으면서 마지막 파일인 경우"
                        // )
                      } else {
                        nextFileId = fileIdArr[currentFileIdx + 1]
                        // console.log(
                        //   "현재 아이디가 포함되어 있지 않거나 마지막 파일이 아닌 경우"
                        // )
                      }

                      if (
                        fileIdArr[currentFileIdx + 1] === undefined &&
                        res.data.nextSthreeFile.id === null
                      )
                        url = "none"

                      if (url !== "none")
                        url = `${tempUrl}${labelProjectId}/${nextFileId}`

                      checkSaveNum = 0
                    })
                    .catch((e) => {
                      isSavingSuccess = false
                      checkSaveNum = 0
                    })
                }

                if (url === "none") {
                  await setTimeout(() => {
                    if (isSavingSuccess) {
                      alert(
                        lang === "en"
                          ? "Saved. No files are available for labeling."
                          : "저장했습니다. 라벨링 가능한 파일이 없습니다."
                      )
                      window.location.reload()
                    } else {
                      alert(
                        lang === "en"
                          ? "Sorry, please try again."
                          : "죄송합니다. 다시 시도해주세요."
                      )
                    }
                  }, [100])
                } else {
                  await setTimeout(() => {
                    if (isSavingSuccess) {
                      // alert(
                      //   lang === "en"
                      //     ? "Saved. The page Will be moved to next image."
                      //     : "저장했습니다. 다음 이미지로 이동합니다."
                      // )
                      window.location.assign(
                        `${url}/?token=${Cookies.getCookie("jwt")}&appStatus=${
                          image.appStatus
                        }&timeStamp=${image.timeStamp}`,
                        "_self"
                      )
                    } else {
                      if (!retVal.isCardRequestError) {
                        alert(
                          lang === "en"
                            ? "Sorry, please try again."
                            : "죄송합니다. 다시 시도해주세요."
                        )
                        window.location.reload()
                      }
                    }
                  }, [100])
                }
              })()
            } catch (e) {
              alert(
                lang === "en"
                  ? "Sorry, please try again."
                  : "죄송합니다. 다시 시도해주세요."
              )
            }
          }
        }
        case "clone": {
          if (currentImageIndex === null) return state
          if (currentImageIndex === state.images.length - 1) return state
          return setIn(
            setNewImage(state.images[currentImageIndex + 1]),
            ["images", currentImageIndex + 1, "regions"],
            activeImage.regions
          )
        }
        case "settings": {
          return setIn(state, ["settingsOpen"], !state.settingsOpen)
        }
        case "help": {
          return state
        }
        case "fullscreen": {
          return setIn(state, ["fullScreen"], true)
        }
        case "exit fullscreen":
        case "window": {
          return setIn(state, ["fullScreen"], false)
        }
        case "hotkeys": {
          return state
        }
        case "save": {
          if (checkSaveNum === 0) {
            checkSaveNum++
            const image = state.images[0]
            const deletedRegions = image.deletedRegions
            let retVal = null
            let isSavingSuccess = true
            let labelsToDelete = []
            const reviewer = image.reviewer
            const userEmail = Cookies.getCookie("assignee")
            const isReview =
              image.status === "review" ||
              image.status === "reject" ||
              Cookies.getCookie("inspectionResult") !== "null"

            try {
              ;(async () => {
                await deletedRegions.forEach(async (regionId) => {
                  labelsToDelete.push(regionId)
                })
                if (labelsToDelete.length > 0) {
                  await deleteOriginalLabels(labelsToDelete)
                }

                retVal = await saveLabels(state, "save")
                isSavingSuccess = retVal.isSavingSuccess

                while (isSavingSuccess === "retry") {
                  retVal = await saveLabels(state, "save")
                  isSavingSuccess = retVal.isSavingSuccess
                }

                await setTimeout(() => {
                  if (
                    isSavingSuccess !== "retry" &&
                    isSavingSuccess !== false
                  ) {
                    alert(lang === "en" ? "Saved." : "저장했습니다.")
                    // checkSaveNum = 0
                    window.location.reload()
                  } else {
                    if (!retVal.isCardRequestError) {
                      alert(
                        lang === "en"
                          ? "Sorry, please try again."
                          : "죄송합니다. 다시 시도해주세요."
                      )
                    }
                  }
                }, [100])
              })()
            } catch (e) {
              alert(
                lang === "en"
                  ? "Sorry, please try again."
                  : "죄송합니다. 다시 시도해주세요."
              )
            }
          }
        }
        case "exit":
        case "done": {
          return state
        }
      }
      return state
    }
    case "SELECT_TOOL": {
      state = setIn(state, ["mode"], null)
      if (action.selectedTool === "show-tags") {
        return setIn(state, ["showTags"], !state.showTags)
      }
      return setIn(state, ["selectedTool"], action.selectedTool)
    }
    case "CANCEL": {
      const { mode } = state
      if (mode) {
        switch (mode.mode) {
          case "DRAW_POLYLINE": {
            const region = state.images[0].regions
            state = setIn(
              modifyRegion(mode.regionId, {
                points: region[region.length - 1].points.slice(
                  0,
                  region[region.length - 1].points.length - 1
                ),
                open: false,
                editingLabels: true,
                highlighted: true,
              }),
              ["mode"],
              null
            )
            return setIn(state, ["mode"], null)
          }
          case "DRAW_POLYGON": {
            const region = state.images[0].regions
            state = setIn(
              modifyRegion(mode.regionId, {
                points: region[region.length - 1].points.slice(
                  0,
                  region[region.length - 1].points.length - 1
                ),
                open: false,
                editingLabels: true,
                highlighted: true,
              }),
              ["mode"],
              null
            )
            return setIn(state, ["mode"], null)
          }
          case "MOVE_POLYLINE_POINT":
          case "MOVE_POLYGON_POINT":
          case "DELETE_POLYGON_POINT":
          case "RESIZE_BOX":
          case "DRAW_MAGIC":
          case "MOVE_REGION": {
            return setIn(state, ["mode"], null)
          }
        }
      }
      // Close any open boxes
      const regions: any = activeImage.regions
      if (regions.some((r) => r.editingLabels)) {
        return setIn(
          state,
          [...pathToActiveImage, "regions"],
          regions.map((r) => ({
            ...r,
            editingLabels: false,
          }))
        )
      } else {
        return setIn(
          state,
          [...pathToActiveImage, "regions"],
          regions.map((r) => ({
            ...r,
            highlighted: false,
          }))
        )
      }
    }
  }
  return state
}
