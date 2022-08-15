// @flow

import React, { useState, useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Loading from "../Loading/Loading.js"
import * as api from "../api.js"
import Cookies from "../helpers/Cookies"
import { useTranslation } from "react-i18next"
import { backendurl, frontendurl } from "../api"

const useStyles = makeStyles({
  editBar: {
    padding: 10,
    borderBottom: "1px solid #ccc",
    backgroundColor: "#f8f8f8",
    display: "flex",
    alignItems: "center",
    "& .button": { margin: 5 },
  },
  select: { width: 240, fontSize: 14 },
  contentArea: {
    padding: 10,
  },
  specificationArea: {
    padding: 10,
  },
})

const Editor = ({
  labelProjectId,
  labelFileId,
  appStatus,
  timeStamp,
  onOpenAnnotator,
  lastOutput,
}: any) => {
  const c = useStyles()
  const { t } = useTranslation()
  const workapp = "object_detection"
  const lang = Cookies.getCookie("language")

  useEffect(() => {
    let labelInfos = []
    let cls = []
    let taskDescription = ""
    let userId = 0
    let lastClass = Cookies.getCookie("lastClass")
    let language = Cookies.getCookie("language")
    let lastClassColor = "#808080"
    let changedRegions = {}
    let labelCharts = {}
    let workage = {}
    let isAiTrainer = false

    ;(async () => {
      await api
        .getLabelAppData(labelProjectId, labelFileId)
        .then((res) => {
          const { user, email, labelproject, sthreefile } = res.data
          taskDescription = `${labelproject.name} : ${
            labelproject.description
              ? labelproject.description
              : language === "en"
              ? "No Description"
              : "프로젝트 상세설명이 없습니다."
          }`
          labelInfos = labelproject.labelclasses
          labelInfos.sort((prev, next) => {
            let n = next["name"]
            let p = prev["name"]
            return p.localeCompare(n)
          })
          isAiTrainer = labelproject.aiTrainer ? true : false
          userId = labelproject.user
          if (labelproject.chart) labelCharts = labelproject.chart
          let hasClassIn = false
          labelInfos.forEach((each) => {
            if (each.name === lastClass) hasClassIn = true
          })
          labelInfos.forEach((each, idx) => {
            if (idx === 0 && !hasClassIn) {
              lastClass = each.name
              lastClassColor = each.color
            }
            if (each.name === lastClass) {
              lastClassColor = each.color
            }
            cls.push(each.name)
          })

          Cookies.deleteCookie("lastClass")
          Cookies.deleteCookie("lastClassColor")
          Cookies.deleteCookie("AIModelType")
          Cookies.deleteCookie("inspectionResult")

          Cookies.setCookie("lastClass", lastClass, 90)
          Cookies.setCookie("lastClassColor", lastClassColor, 90)
          Cookies.setCookie("AIModelType", 0, 90)

          let assignee = "null"
          assignee = email

          Cookies.deleteCookie("assignee")
          Cookies.setCookie("assignee", assignee, 90)
          Cookies.setCookie("inspectionResult", sthreefile.inspectionResult, 90)

          workage = res.data.workage

          const labels = sthreefile.labels ? sthreefile.labels : []
          let labelColor = "#808080"
          let regions = []
          Math.floor(Math.random() * 16)
          for (let idx = 0; idx < labels.length; idx++) {
            let labelObj = labels[idx]
            let clsName = ""
            labelInfos.forEach((each) => {
              if (each.id === labelObj.labelclass) {
                clsName = each.name
                labelColor = each.color
              }
            })

            // if(labelObj.sthreefile === parseInt(labelFileId)){
            if (labelObj.sthreefile === labelFileId) {
              if (labelObj.labeltype === "box") {
                const tempRegion = {
                  type: labelObj.labeltype,
                  x: labelObj.x,
                  y: labelObj.y,
                  w: labelObj.w,
                  h: labelObj.h,
                  highlighted: labelObj.highlighted,
                  editingLabels: labelObj.editingLabels,
                  color: labelColor,
                  id: labelObj.id,
                  cls: clsName,
                  clsId: labelObj.labelclass,
                }
                regions.push(tempRegion)
              } else {
                const tempRegion = {
                  type: labelObj.labeltype,
                  // points: JSON.parse(labelObj.points),
                  points: labelObj.points,
                  highlighted: labelObj.highlighted,
                  editingLabels: labelObj.editingLabels,
                  color: labelColor,
                  id: labelObj.id,
                  cls: clsName,
                  clsId: labelObj.labelclass,
                }
                regions.push(tempRegion)
              }
              regions.forEach((region) => {
                const id = region.id
                changedRegions[id] = "none"
              })
            }
          }

          const getEnterpriseS3key = (key) => {
            let parseUrl = api.backendurl + "static" + key

            return parseUrl
          }

          let examples = {
            Default: () => ({
              taskDescription: taskDescription,
              regionTagList: [],
              regionClsList: cls,
              enabledTools: [
                "select",
                "create-box",
                "create-polyline",
                "create-polygon",
                "create-magic",
              ], //default
              showTags: true,
              images: [
                {
                  id: sthreefile.id,
                  src: process.env.REACT_APP_ENTERPRISE
                    ? getEnterpriseS3key(sthreefile.s3key)
                    : sthreefile.s3key,
                  name: sthreefile.originalFileName,
                  width: sthreefile.width,
                  height: sthreefile.height,
                  regions: regions,
                  originalRegions: regions,
                  changedRegions: changedRegions,
                  deletedRegions: [],
                  labelProjectId: parseInt(labelProjectId),
                  labelFileId: labelFileId,
                  originalLabels: sthreefile.labels,
                  clsInfo: labelInfos,
                  labelCharts: labelCharts,
                  lastClass: lastClass,
                  lastClassColor: lastClassColor,
                  workage: workage,
                  assignee: assignee,
                  historyIndex: 0,
                  isUndoStarted: false,
                  isAiTrainer: isAiTrainer,
                  chart: labelCharts,
                  status: sthreefile.status,
                  // status: "review",
                  inspectionResult: sthreefile.inspectionResult,
                  reviewer: sthreefile.reviewer,
                  appStatus: appStatus,
                  timeStamp: timeStamp,
                },
              ],
            }),
          }
          return examples
        })
        .then((examples) => {
          onOpenAnnotator(examples["Default"])
        })
        .catch((e) => {
          alert(
            lang === "en"
              ? "Sorry, please try again."
              : "죄송합니다. 다시 시도해주세요."
          )
        })
    })()
  }, [])

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Loading />
    </div>
  )
}

export default Editor
