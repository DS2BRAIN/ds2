import React, { useState, useEffect } from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import { setIn } from "seamless-immutable"
import ShortcutField from "./ShortcutField"
import Cookies from "../helpers/Cookies"
import { useTranslation } from "react-i18next"
import Modal from "@material-ui/core/Modal"
import Loading from "../Loading/Loading.js"

let defaultShortcuts = {
  select: {
    action: {
      type: "SELECT_TOOL",
    },
    name: "선택",
    key: "t",
  },
  zoom: {
    action: {
      type: "SELECT_TOOL",
    },
    name: "확대/축소",
    key: "z",
  },
  undo: {
    action: {
      type: "UNDO_HISTORY",
    },
    name: "작업취소",
    key: "x",
  },
  redo: {
    action: {
      type: "REDO_HISTORY",
    },
    name: "작업복구",
    key: "c",
  },
  // "create-point": {
  //   action: {
  //     type: "SELECT_TOOL",
  //   },
  //   name: "키포인트 생성",
  //   key: "g",
  // },
  "create-box": {
    action: {
      type: "SELECT_TOOL",
    },
    name: "박스 라벨링 생성",
    key: "q",
  },
  // pan: {
  //   action: {
  //     type: "SELECT_TOOL",
  //   },
  //   name: "Pan",
  // },
  "create-polyline": {
    action: {
      type: "SELECT_TOOL",
    },
    name: "폴리라인 라벨링 생성",
    key: "w",
  },
  "create-polygon": {
    action: {
      type: "SELECT_TOOL",
    },
    name: "폴리건 라벨링 생성",
    key: "e",
  },
  "delete-polygon-point": {
    action: {
      type: "DELETE_POLYGON_POINT",
    },
    name: "폴리건 포인트 삭제",
    key: "Alt + Point Click",
  },
  // "create-keypoint": {
  //   action: {
  //     type: "SELECT_TOOL",
  //   },
  //   name: "키포인트 생성",
  //   key: "g",
  // },
  "create-magic": {
    action: {
      type: "SELECT_TOOL",
    },
    name: "매직 라벨링 생성",
    key: "r",
  },
  // "create-pixel": {
  //   action: {
  //     type: "SELECT_TOOL",
  //   },
  //   name: "Create Pixel",
  // },
  "prev-image": {
    action: {
      type: "HEADER_BUTTON_CLICKED",
      buttonName: "Prev",
      url: null,
    },
    name: "저장 후 이전이미지로 이동",
    key: "a",
  },
  "save-image": {
    action: {
      type: "HEADER_BUTTON_CLICKED",
      buttonName: "save",
    },
    name: "저장",
    key: "s",
  },
  "next-image": {
    action: {
      type: "HEADER_BUTTON_CLICKED",
      buttonName: "Next",
      url: null,
    },
    name: "저장 후 다음이미지로 이동",
    key: "d", //"ArrowRight"
  },
  "change-class": {
    action: {
      type: "CHANGE_CLASS",
    },
    name: "클래스 변경",
    key: "1,2 ... 0 + Shift (ex) !: 11, @: 12",
  },
}

export default ({
  onShortcutActionDispatched,
  image,
  onChangeLastClass,
  changeClassFromShortcut,
}) => {
  const [shortcuts, setShortcuts] = useState({}) // useLocalStorage
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const newShortcuts = { ...shortcuts }
    for (const actionId of Object.keys(defaultShortcuts)) {
      if (!newShortcuts[actionId]) {
        newShortcuts[actionId] = defaultShortcuts[actionId]
      }
    }
    setShortcuts(newShortcuts)
  }, [])

  const onChangeShortcut = (actionId, keyName) => {
    setShortcuts(setIn(shortcuts, [actionId, "key"], keyName))
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      let key = parseInt(e.key)
      let koreanKey = ""
      switch (e.key) {
        case "0":
          key = 10
          break
        case "!":
          key = 11
          break
        case "@":
          key = 12
          break
        case "#":
          key = 13
          break
        case "$":
          key = 14
          break
        case "%":
          key = 15
          break
        case "^":
          key = 16
          break
        case "&":
          key = 17
          break
        case "*":
          key = 18
          break
        case "(":
          key = 19
          break
        case ")":
          key = 20
          break
        case "ㅋ": // 한글일 경우 영어로 변환
          koreanKey = "z"
          break
        case "ㅌ":
          koreanKey = "x"
          break
        case "ㅊ":
          koreanKey = "c"
          break
        case "ㅂ":
          koreanKey = "q"
          break
        case "ㅔ":
          koreanKey = "p"
          break
        case "ㅈ":
          koreanKey = "w"
          break
        case "ㄷ":
          koreanKey = "e"
          break
        case "ㄱ":
          koreanKey = "r"
          break
        case "ㅅ":
          koreanKey = "t"
          break
        case "ㅁ":
          koreanKey = "a"
          break
        case "ㄴ":
          koreanKey = "s"
          break
        case "ㅇ":
          koreanKey = "d"
          break
        // case "ㅎ":
        //   koreanKey = "g"
        //   break
      }
      const clsInfo = image.clsInfo
      if ((key >= 1 || key <= 20) && key <= clsInfo.length) {
        onChangeLastClass(clsInfo[key - 1].name, clsInfo[key - 1].color)
        changeClassFromShortcut(clsInfo[key - 1].name, clsInfo[key - 1].color)
        Cookies.setCookie("lastClass", clsInfo[key - 1].name, 90)
        Cookies.setCookie("lastClassColor", clsInfo[key - 1].color, 90)
      }

      for (const actionId in shortcuts) {
        const shortcut = shortcuts[actionId]
        if (!shortcut || !shortcut.key) {
          continue
        }
        if (e.key === shortcut.key || koreanKey === shortcut.key) {
          if (
            shortcut.key === "a" ||
            shortcut.key === "s" ||
            shortcut.key === "d"
          ) {
            setIsLoadingModalOpen(true)
          }

          onShortcutActionDispatched({
            ...shortcut.action,
            selectedTool: actionId,
          })
        }
      }
    }

    window.addEventListener("keypress", handleKeyPress)

    return () => {
      window.removeEventListener("keypress", handleKeyPress)
      document.activeElement.blur()
    }
  }, [shortcuts])

  return (
    <>
      <SidebarBoxContainer title={t("단축키")}>
        {Object.keys(shortcuts)
          .map((actionId, index) => {
            if (!shortcuts[actionId]) return null
            return (
              <ShortcutField
                key={actionId}
                actionId={actionId}
                actionName={shortcuts[actionId].name}
                keyName={shortcuts[actionId].key || ""}
                onChangeShortcut={onChangeShortcut}
              />
            )
          })
          .filter(Boolean)}
      </SidebarBoxContainer>
      <Modal
        open={isLoadingModalOpen}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loading />
      </Modal>
    </>
  )
}
