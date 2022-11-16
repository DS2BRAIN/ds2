// @flow
import React, { useState, useEffect } from "react"
import axios from "axios"
import ReactDOM from "react-dom"
import Editor from "./Editor"
import Annotator from "../Annotator"
import ErrorBoundaryDialog from "./ErrorBoundaryDialog.js"
import Cookies from "../helpers/Cookies"
import Loading from "../Loading/Loading.js"

export default () => {
  const [annotatorOpen, changeAnnotatorOpen] = useState(false)
  const [annotatorProps, changeAnnotatorProps] = useState([])
  const [lastOutput, changeLastOutput] = useState()
  const [labelProjectId, setLabelProjectId] = useState(null)
  const [labelFileId, setLabelFileId] = useState(null)
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [appStatus, setAppStatus] = useState("")
  const [timeStamp, setTimeStamp] = useState("")
  const [clientIp, setClientIp] = useState("")
  const url = window.location.href

  const getIpClient = async () => {
    try {
      const response = await axios.get("https://extreme-ip-lookup.com/json")
      const ip = response.data.query

      setClientIp(ip)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getIpClient()
  }, [])

  useEffect(() => {
    Cookies.setCookie("client_ip", clientIp, 90)
  }, [clientIp])

  useEffect(() => {
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

    let path = url.replace(tempUrl, "")
    let fileIdArr = []
    const pathArr = path.split("/")
    const token = url.split("?token=")[1].split("&")[0]
    let timeStampTmp = url.split("timeStamp=")[1]
    let tmp = url.split("appStatus=")[1].split("&")[0]

    setTimeStamp(timeStampTmp)
    setAppStatus(tmp)

    if (path.includes("start=true")) {
      Cookies.setCookie(
        `fileHistoryBy${labelProjectId}At${timeStamp}`,
        pathArr[1],
        90
      )
      let fileHistoryCookie = Cookies.getCookie(
        `fileHistoryBy${labelProjectId}At${timeStamp}`
      )

      fileIdArr = fileHistoryCookie.split(",")

      if (fileIdArr[fileIdArr.indexOf(pathArr[1]) - 1] === undefined) {
        Cookies.setCookie("prevButtonDisabled", true, 90)
      } else {
        Cookies.setCookie("prevButtonDisabled", false, 90)
      }
    } else {
      let fileHistoryCookie = Cookies.getCookie(
        `fileHistoryBy${labelProjectId}At${timeStamp}`
      )

      fileIdArr = fileHistoryCookie.split(",")

      if (
        fileIdArr.indexOf(pathArr[1]) === -1 &&
        pathArr[1] !== "" &&
        pathArr[1] !== "null" &&
        pathArr[1] !== "undefined"
      ) {
        if (fileIdArr.length >= 10) {
          fileIdArr.shift()
        }
        fileIdArr.push(pathArr[1])
        Cookies.setCookie(
          `fileHistoryBy${labelProjectId}At${timeStamp}`,
          fileIdArr,
          90
        )
      }

      if (fileIdArr[fileIdArr.indexOf(pathArr[1]) - 1] === undefined) {
        Cookies.setCookie("prevButtonDisabled", true, 90)
      } else {
        Cookies.setCookie("prevButtonDisabled", false, 90)
      }
    }

    setLabelProjectId(parseInt(pathArr[0]))
    setLabelFileId(pathArr[1])

    Cookies.setCookie("jwt", token, 90)

    if (pathArr[0] && pathArr[1] && token && appStatus !== "") {
      setIsValidUrl(true) //after token validation
    }
  }, [url && appStatus && timeStamp && labelProjectId])

  return isValidUrl ? (
    <div>
      {annotatorOpen ? (
        // <ErrorBoundaryDialog
        //   onClose={() => {
        //     changeAnnotatorOpen(false)
        //   }}
        // >
        //   <Annotator
        //     {...annotatorProps}
        //     onExit={(output) => {
        //       delete output["lastAction"]
        //       changeLastOutput(output)
        //       changeAnnotatorOpen(false)
        //     }}
        //   />
        // </ErrorBoundaryDialog>
        <Annotator
          {...annotatorProps}
          onExit={(output) => {
            delete output["lastAction"]
            changeLastOutput(output)
            changeAnnotatorOpen(false)
          }}
        />
      ) : (
        <Editor
          labelProjectId={labelProjectId}
          labelFileId={labelFileId}
          appStatus={appStatus}
          timeStamp={timeStamp}
          lastOutput={lastOutput}
          onOpenAnnotator={(props) => {
            changeAnnotatorProps(props)
            changeAnnotatorOpen(true)
          }}
        />
      )}
    </div>
  ) : (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Loading />
    </div>
  )
}
