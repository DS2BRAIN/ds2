import axios from "axios"
import Cookies from "./helpers/Cookies"

const isEnterprise = process.env.REACT_APP_ENTERPRISE === "true"
const isDeploy = process.env.REACT_APP_DEPLOY === "true"
const isDev = process.env.REACT_APP_DEV === "true"

// << 로컬 (개발 테스트 용도) >>
export var frontendurl = `http://localhost:${isEnterprise ? 13001 : 3001}/`
export var backendurl = "https://dslabaa.ds2.ai/"

// << 로컬에서 운영 테스트 시 활성화 >>
//! console.ds2.ai
// backendurl = "https://api.ds2.ai/";
//! enterprisedev.ds2.ai
// backendurl = "http://enterprisedev.ds2.ai:13002/";

// << 디플로이 된 경우 (운영 or 엔터프라이즈) >>
if (isDeploy) {
  //! console.ds2.ai
  frontendurl = process.env.REACT_APP_LABELAPP_URL
  backendurl = process.env.REACT_APP_BACKEND_URL

  if (isEnterprise) {
    frontendurl = isDev
      ? //! refactoring.ds2.ai
        "http://enterprisedev.ds2.ai:13001/"
      : //! enterprisedev.ds2.ai
        "http://" + window.location.host.split(":")[0] + ":13001/"

    backendurl = isDev
      ? "https://dslabaa.ds2.ai/"
      : "http://" + window.location.host.split(":")[0] + ":13002/"
  }
}

export function getLabelAppData(labelProjectId, labelFileId) {
  const token = Cookies.getCookie("jwt")
  const query = backendurl.concat(
    `label-app/${labelProjectId}/${labelFileId}/?token=${token}`
  )
  return axios.get(query)
}

export function getUserData() {
  const token = Cookies.getCookie("jwt")
  const query = backendurl.concat(`me/?token=${token}`)
  return axios.get(query)
}

export function deleteLabelProject(id) {
  const token = Cookies.getCookie("jwt")
  const query = backendurl.concat(`labelprojects/${id}/?token=${token}`)
  return axios.delete(query)
}

export function getLabelDetail(id) {
  const token = Cookies.getCookie("jwt")
  const query = backendurl.concat(`labelprojects/${id}/?token=${token}`)
  return axios.get(query)
}

export function deleteLabelList(id) {
  const token = Cookies.getCookie("jwt")
  const query = backendurl.concat(`sthreefiles/${id}/?token=${token}`)
  return axios.delete(query)
}

export function getLabelFile(id, workapp) {
  const token = Cookies.getCookie("jwt")
  const query = backendurl.concat(
    `sthreefiles/${id}/?token=${token}&workapp=${workapp}`
  )
  return axios.get(query)
}

export function postLabels(labels) {
  const token = Cookies.getCookie("jwt")
  const query = backendurl.concat(`labels/?token=${token}`)
  return axios.post(query, labels)
}

export function deleteLabels(idArr) {
  const token = Cookies.getCookie("jwt")
  const query = backendurl.concat(`labels/?token=${token}`)
  return axios.delete(query, {
    data: idArr,
  })
}

export function putLabels(labels) {
  const token = Cookies.getCookie("jwt")
  const query = backendurl.concat(`labels/?token=${token}`)
  return axios.put(query, labels)
}

export function setObjectStatus(id, status, isReview, appStatus) {
  const token = Cookies.getCookie("jwt")
  // const workAssignee = Cookies.getCookie("assignee")

  const query = backendurl.concat(
    `sthreefiles/${id}/?token=${token}&app_status=${appStatus}`
  )

  if (isReview) {
    const inspectionResult =
      Cookies.getCookie("inspectionResult") === null ||
      Cookies.getCookie("inspectionResult") === "null"
        ? 1
        : parseInt(Cookies.getCookie("inspectionResult"))
    // const reviewer = JSON.parse(Cookies.getCookie("user")).email
    // const reviewer = Cookies.getCookie("assignee")

    return axios.put(query, {
      status: inspectionResult === 1 ? "done" : "reject",
      inspectionResult,
    })
  } else {
    return axios.put(query, {
      status,
    })
  }
}

export function getListObjects(objectsInfo) {
  const token = Cookies.getCookie("jwt")
  let listObjectsUrl = `listobjects/?token=${token}&sorting=${objectsInfo.sorting}&tab=${objectsInfo.tab}&count=${objectsInfo.count}&page=${objectsInfo.page}&labelprojectId=${objectsInfo.labelprojectId}&workapp=${objectsInfo.workapp}&is_label_app=${objectsInfo.is_label_app}`
  if (objectsInfo.isDesc) listObjectsUrl += "&desc=True"
  if (objectsInfo.workAssignee)
    listObjectsUrl += `&workAssignee=${objectsInfo.workAssignee}`
  const query = backendurl.concat(listObjectsUrl)
  let result = axios.get(query)
  return result
}

export const getContourPoints = async (
  id,
  x1,
  y1,
  x2,
  y2,
  width,
  height,
  labeProjectId
) => {
  const token = Cookies.getCookie("jwt")
  const sensitivityValue = parseFloat(Cookies.getCookie("sensitivityValue"))
  const contourType = parseInt(Cookies.getCookie("AIModelType"))
  const query = backendurl.concat(`predict/contour/?token=${token}`)

  const result = await axios
    .post(
      query,
      {
        file_id: id,
        x1: Math.round(x1 * width),
        y1: Math.round(y1 * height),
        x2: Math.round(x2 * width),
        y2: Math.round(y2 * height),
        threshold: sensitivityValue,
        contour_type: contourType,
        pre_threshold: 0.7,
        labelproject_id: labeProjectId,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "access-control-allow-methods": "POST",
        },
      }
    )
    .catch((e) => {
      console.log(e)
    })
  return result.data
}

export const putContourPoints = async ({
  id,
  x1,
  y1,
  x2,
  y2,
  contour_points,
  positive_points,
  negative_points,
  width,
  height,
  priority,
  labelProjectId,
}) => {
  const token = Cookies.getCookie("jwt")
  const reqData = {
    file_id: id,
    threshold: parseFloat(Cookies.getCookie("sensitivityValue")),
    x1: Math.round(x1 * width),
    y1: Math.round(y1 * height),
    x2: Math.round(x2 * width),
    y2: Math.round(y2 * height),
    contour_points: contour_points,
    positive_points: positive_points,
    negative_points: negative_points,
    priority,
    labelproject_id: labelProjectId,
  }
  const query = backendurl.concat(`predict/contour/?token=${token}`)
  const result = await axios
    .put(query, reqData, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "access-control-allow-methods": "PUT",
      },
    })
    .catch((e) => {
      console.log(e)
    })
  return result.data
}

export function getWorkage(id) {
  const token = Cookies.getCookie("jwt")
  const query = backendurl.concat(
    `workage/?token=${token}&labelprojectId=${id}`
  )
  return axios.get(query)
}
