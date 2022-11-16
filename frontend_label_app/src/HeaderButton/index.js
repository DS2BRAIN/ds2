// @flow

import React, {
  memo,
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
} from "react"
import { makeStyles } from "@material-ui/core/styles"
import { styled } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"
import Modal from "@material-ui/core/Modal"
import useEventCallback from "use-event-callback"
import * as api from "../api.js"
import Cookies from "../helpers/Cookies"
import { useSettings } from "../SettingsProvider"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogContent from "@material-ui/core/DialogContent"
import DialogActions from "@material-ui/core/DialogActions"
import Survey from "material-survey/components/Survey"
import Loading from "../Loading/Loading.js"
import { useTranslation } from "react-i18next"
import Pagination from "@material-ui/lab/Pagination"

const useStyles = makeStyles({
  modalContainer: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-end",
  },
  modalContent: {
    position: "absolute",
    width: "300px",
    height: "100vh",
    background: "#e1e4e8",
    padding: "0 12px",
  },
  title: {
    height: "8%",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
  },
  lists: {
    height: "84%",
    overflowY: "auto",
  },
  imageContainer: {
    display: "flex",
    cursor: "pointer",
    height: "40px",
    alignItems: "center",
    marginBottom: "12px",
    padding: "8px",
  },
})

const StyledButton = styled(Button)({
  width: 100,
  margin: 2,
})

const IconName = styled("div")({
  fontWeight: "bold",
})

export const HeaderButtonContext = createContext()

const MemoizedHeaderButton = memo(
  ({ name, disabled, Icon, onClick }) => {
    const prevButtonDisabled =
      Cookies.getCookie("prevButtonDisabled") === "true" ? true : false
    return (
      <StyledButton
        disabled={name === "이전 (a)" ? prevButtonDisabled : disabled}
        onClick={onClick}
      >
        <div>
          <Icon />
          <IconName>{name}</IconName>
        </div>
      </StyledButton>
    )
  },
  (prevProps, nextProps) =>
    prevProps.name === nextProps.name &&
    prevProps.disabled === nextProps.disabled
)

export const HeaderButton = ({ images, action, name, disabled, Icon }) => {
  const classes = useStyles()
  const { onHeaderButtonClick } = useContext(HeaderButtonContext)
  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const [projectId, setProjectId] = useState(null)
  const [labelFiles, setLabelFiles] = useState([])
  const [isListPageChanged, setIsListPageChanged] = useState(false)
  const [labelFileId, setLabelFileId] = useState(null)
  const [isPrevBtnClicked, setIsPrevBtnClicked] = useState(false)
  const [isNextBtnClicked, setIsNextBtnClicked] = useState(false)
  const [fileDownloadUrl, setFileDownloadUrl] = useState("")
  const [selectedLabelFile, setSelectedLabelFile] = useState({})
  const [open, setOpen] = useState(false)
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const [totalLength, setTotalLength] = useState(0)
  const [page, setPage] = useState(1)
  const settings = useSettings()
  const { t } = useTranslation()
  const url = window.location.href
  const listCnt = 10
  const workapp = "object_detection"

  const onChangeListPage = (e, page) => {
    setPage(page)
    setIsListPageChanged(true)
  }

  useEffect(() => {
    if (isLoadingModalOpen) {
      setTimeout(() => {
        setIsLoadingModalOpen(false)
      }, [5000])
    }
  }, [isLoadingModalOpen])

  useEffect(() => {
    if (isPrevBtnClicked) {
      onHeaderButtonClick("prev")
    }
  }, [isPrevBtnClicked])

  useEffect(() => {
    if (isNextBtnClicked) {
      onHeaderButtonClick("next")
    }
  }, [isNextBtnClicked])

  const onClick = useEventCallback(() => onHeaderButtonClick(action))
  const customizedClick = () => {
    switch (action) {
      case "prev":
        setIsPrevBtnClicked(true)
        setIsLoadingModalOpen(true)
        break
      case "next":
        setIsNextBtnClicked(true)
        setIsLoadingModalOpen(true)
        break
      case "exit":
        window.close()
        break
      case "play":
        break
      case "pause":
        break
      case "list":
        setIsLoadingModalOpen(true)
        setPage(1)
        if (labelFiles.length === 0) {
          api
            .getListObjects({
              sorting: "created_at",
              count: listCnt,
              page: 1,
              labelprojectId: images[0].labelProjectId,
              tab: images[0].appStatus,
              isDesc: false,
              workapp: workapp,
              is_label_app: true,
              // workAssignee: Cookies.getCookie("assignee"),
            })
            .then((res) => {
              const tempFiles = res.data.file
              let labelFilesRaw = []

              setTotalLength(res.data.totalCount)
              tempFiles.forEach((file) => {
                if (/\.(jpg|jpeg|png)$/g.test(file.fileName.toLowerCase())) {
                  labelFilesRaw.push(file)
                  if (images[0].labelFileId === file.id)
                    setSelectedLabelFile(file)
                }
              })
              setLabelFiles(labelFilesRaw)
              setIsLoadingModalOpen(false)
            })
          setIsListModalOpen(true)
        }
        break
      case "save":
        onClick()
        setIsLoadingModalOpen(true)
        break
      case "Settings":
        setOpen(true)
        break
      case "fullscreen":
        onClick()
        break
      case "window":
        onClick()
        break
      default:
        break
    }
  }

  useEffect(() => {
    if (isListPageChanged) {
      setIsLoadingModalOpen(true)
      api
        .getListObjects({
          sorting: "created_at",
          count: listCnt,
          page: page,
          labelprojectId: images[0].labelProjectId,
          tab: images[0].appStatus,
          isDesc: false,
          workapp: workapp,
          is_label_app: true,
          // workAssignee: Cookies.getCookie("assignee"),
        })
        .then((res) => {
          const tempFiles = res.data.file
          let labelFilesRaw = []

          setTotalLength(res.data.totalCount)
          tempFiles.forEach((file) => {
            if (/\.(jpg|jpeg|png)$/g.test(file.fileName.toLowerCase())) {
              labelFilesRaw.push(file)
              if (images[0].labelFileId === file.id) setSelectedLabelFile(file)
            }
          })
          setLabelFiles(labelFilesRaw)
          setIsLoadingModalOpen(false)
          setIsListPageChanged(true)
        })
    }
  }, [isListPageChanged, page])

  const onClose = () => {
    setOpen(false)
  }

  const closeListModal = () => {
    setIsListModalOpen(false)
  }

  const onGoToSelectedPage = (id) => {
    if (
      window.confirm(
        t(
          "진행중이던 라벨링 정보는 초기화 됩니다. 선택하신 이미지로 이동하시겠습니까?"
        )
      )
    ) {
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

      tempUrl = `${tempUrl}${images[0].labelProjectId}/${id}`

      window.location.assign(
        `${tempUrl}/?token=${Cookies.getCookie("jwt")}&appStatus=${
          images[0].appStatus
        }&timeStamp=${images[0].timeStamp}`,
        "_self"
      )
    }
  }

  const getEnterpriseS3key = (key) => {
    let parseUrl = api.backendurl + "static" + key

    return parseUrl
  }

  return (
    <>
      <MemoizedHeaderButton
        name={name}
        disabled={disabled}
        Icon={Icon}
        onClick={customizedClick}
      />
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isListModalOpen}
        onClose={closeListModal}
        className={classes.modalContainer}
      >
        <div className={classes.modalContent}>
          <div className={classes.title}>
            <div>{t("파일 목록")}</div>
          </div>
          {/* <div>** {t('상태가 시작전인 파일들만 보입니다.')}</div> */}
          <div className={classes.lists} style={{ height: "77%" }}>
            {labelFiles &&
              labelFiles.map((file) => {
                return (
                  <div
                    className={classes.imageContainer}
                    onClick={() => {
                      onGoToSelectedPage(file.id)
                    }}
                    // style = {parseInt(file.id) === parseInt(labelFileId) ? {fontWeight: 'bold', background: 'rgba(33, 150, 243, 0.2)'} : null}
                    style={
                      file.id === images[0].labelFileId
                        ? {
                            fontWeight: "bold",
                            background: "rgba(33, 150, 243, 0.2)",
                          }
                        : null
                    }
                  >
                    <img
                      src={
                        process.env.REACT_APP_ENTERPRISE
                          ? getEnterpriseS3key(file.s3key)
                          : file.s3key
                      }
                      style={{ width: "40px", marginRight: "8px" }}
                    />
                    <div>{file.originalFileName}</div>
                  </div>
                )
              })}
          </div>
          {/* {totalLength && ( */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "15px",
              zIndex: "1000",
            }}
          >
            <Pagination
              count={totalLength ? Math.ceil(totalLength / listCnt) : 0}
              page={page}
              size="small"
              onChange={onChangeListPage}
              classes={{ ul: classes.paginationNum }}
            />
          </div>
          {/* )} */}
          <div className={classes.title} style={{ justifyContent: "flex-end" }}>
            <Button onClick={closeListModal}>CLOSE</Button>
          </div>
        </div>
      </Modal>
      <Dialog open={open || false} onClose={onClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <Survey
            variant="flat"
            noActions
            defaultAnswers={settings}
            onQuestionChange={(q, a, answers) => settings.changeSetting(q, a)}
            form={{
              questions: [
                {
                  type: "boolean",
                  title: "눈금선",
                  name: "showCrosshairs",
                },
              ],
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
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

export default HeaderButton
