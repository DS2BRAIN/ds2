import axios from "axios";
import Cookies from "helpers/Cookies";

const isEnterprise = process.env.REACT_APP_ENTERPRISE === "true";
const isDeploy = process.env.REACT_APP_DEPLOY === "true";
const isDev = process.env.REACT_APP_DEV === "true";

// << 로컬 (개발 테스트 용도) >>
export var frontendurl = `http://localhost:${isEnterprise ? 13000 : 3000}/`;
export var backendurl = "https://dslabaa.ds2.ai/";

// << 디플로이 된 경우 (운영 or 엔터프라이즈) >>
if (isDeploy) {
  //! console.ds2.ai
  frontendurl = process.env.REACT_APP_FRONTEND_URL;
  backendurl = process.env.REACT_APP_BACKEND_URL;

  if (isEnterprise) {
    frontendurl = isDev
      ? //! refactoring.ds2.ai
        "https://refactoring.ds2.ai/"
      : //! enterprisedev.ds2.ai
        "http://" + window.location.host.split(":")[0] + ":13000/";

    backendurl = isDev
      ? "https://dslabaa.ds2.ai/"
      : "http://" + window.location.host.split(":")[0] + ":13002/";
  }
}

// << 로컬에서 운영 테스트 시 활성화 >>
//! console.ds2.ai
// backendurl = "https://api.ds2.ai/";
//! enterprisedev.ds2.ai
// backendurl = "http://enterprisedev.ds2.ai:13002/";

export function getLabelProjects(labelProjectInfo) {
  const token = Cookies.getCookie("jwt");
  let labelprojectsUrl = `labelprojects/?token=${token}&sorting=${
    labelProjectInfo.sorting
  }&page=${labelProjectInfo.count}&start=${labelProjectInfo.start + 1}`;
  if (labelProjectInfo.isDesc) labelprojectsUrl += "&desc=True";
  if (labelProjectInfo.searching && labelProjectInfo.searching !== "")
    labelprojectsUrl += `&searching=${encodeURIComponent(
      labelProjectInfo.searching
    )}`;
  if (labelProjectInfo.isshared) labelprojectsUrl += "&isShared=true";
  const query = backendurl.concat(labelprojectsUrl);
  return axios.get(query);
}

export async function postLabelProjects(projectInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`labelprojects/?token=${token}`);
  let formData = new FormData();
  formData.append("name", projectInfo.name);
  formData.append("description", projectInfo.description);
  formData.append("has_review_process", projectInfo.has_review_process);
  formData.append("workapp", projectInfo.workapp);
  // projectInfo.files.forEach((file) => {
  //   const blobFile = new Blob([file]);
  //   formData.append("files", blobFile, file.name);
  // });
  projectInfo.files.forEach((file) => {
    formData.append("files", file, file.name);
  });
  if (projectInfo.frame_value) {
    formData.append("frame_value", projectInfo.frame_value);
  }
  return await axios.post(query, formData, {
    timeout: 600000,
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function getLabelProject(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`labelprojects/${id}/?token=${token}`);
  return axios.get(query);
}

export function getProjectsStatus(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`projects/${id}/status?token=${token}`);
  return axios.get(query);
}

export function upldateLabelProject(id, labelinfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`labelprojects/${id}/?token=${token}`);
  return axios.put(query, labelinfo);
}

export function deleteLabelProject(ids) {
  let FormData = require("form-data");
  let formData = new FormData();
  ids.forEach((id) => {
    formData.append("labelProjectIds", id);
  });
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`labelprojects/?token=${token}`);
  const config = {
    method: "delete",
    url: query,
    data: formData,
  };
  return axios(config);
}

export function getLabelFile(id, labelprojectId, workapp) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `sthreefiles/${id}/?token=${token}&labelprojectId=${labelprojectId}&workapp=${workapp}`
  );
  return axios.get(query);
}

export function deleteLabelFile(ids) {
  var FormData = require("form-data");
  var formData = new FormData();
  ids.forEach((id) => {
    formData.append("sthreefilesId", id);
  });
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`sthreefiles/?token=${token}`);
  var config = {
    method: "delete",
    url: query,
    data: formData,
  };
  return axios(config);
}

export function getLabels() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`labels/?token=${token}`);
  return axios.get(query);
}

export function getLabel(id) {
  // should be changed
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`labels/${id}/?token=` + token);
  return axios.get(query);
}

export function getLabelByLabelprojectId(id) {
  // should be changed
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`labelsbyprojectid/${id}/?token=` + token);
  return axios.get(query);
}

export function postCocoDataset(requestInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `export-coco/${requestInfo.id}/?token=${token}&is_get_image=${requestInfo.is_get_image}`
  );
  return axios.post(query);
}

export function postVocDataset(requestInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `export-voc/${requestInfo.id}/?token=${token}&is_get_image=${requestInfo.is_get_image}`
  );
  return axios.post(query);
}

export function postDataset(requestInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `export-data/${requestInfo.id}/?token=${token}`
  );
  return axios.post(query);
}

export function updateLabelClass(updateLabelClass, labelprojectId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `labelclasses/?token=${token}&labelProjectId=${labelprojectId}`
  );
  return axios.put(query, updateLabelClass);
}

export function postLabelClass(labelClass) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`labelclasses/?token=` + token);
  return axios.post(query, labelClass);
}

export function deleteLabelClass(deleteLabelClasses, projectId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `labelclasses/?token=${token}&labelproject_id=${projectId}`
  );
  return axios.delete(query, { data: deleteLabelClasses });
}

export function deleteLabels(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`labels/${id}/?token=` + token);
  return axios.delete(query);
}

export async function postUploadFile(
  files,
  labelprojectId,
  has_de_identification,
  frameValue
) {
  let formData = new FormData();
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat("add-object/");
  // files.forEach((file) => {
  //   const blobFile = new Blob([file]);
  //   formData.append("files", blobFile, file.name);
  // });
  files.forEach((file) => {
    formData.append("files", file, file.name);
  });
  formData.append("token", token);
  formData.append("labelprojectId", labelprojectId);
  formData.append("has_de_identification", has_de_identification);
  if (frameValue) formData.append("frame_value", frameValue);

  return await axios.post(query, formData, {
    timeout: 600000,
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function getListObjects(objectsInfo) {
  const token = Cookies.getCookie("jwt");
  let listObjectsUrl = `listobjects/?token=${token}&sorting=${
    objectsInfo.sorting
  }&tab=${objectsInfo.tab}&count=${objectsInfo.count}&page=${objectsInfo.page +
    1}&labelprojectId=${objectsInfo.labelprojectId}&workapp=${
    objectsInfo.workapp
  }`;
  if (objectsInfo.isDesc === true || objectsInfo.isDesc === false)
    listObjectsUrl += `&desc=${objectsInfo.isDesc}`;
  if (objectsInfo.searching && objectsInfo.searching !== "")
    listObjectsUrl += `&searching=${encodeURIComponent(objectsInfo.searching)}`;
  if (objectsInfo.workAssignee && objectsInfo.workAssignee !== "all")
    listObjectsUrl += `&workAssignee=${objectsInfo.workAssignee}`;
  const query = backendurl.concat(listObjectsUrl);
  let result = axios.get(query);
  return result;
}

export function setObjectStatus(
  id,
  status,
  // workAssignee,
  appStatus,
  isReview,
  inspectionResult
) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `sthreefiles/${id}/?token=${token}&app_status=${appStatus}`
  );

  if (isReview) {
    let inspectionResultTmp =
      inspectionResult === null || inspectionResult === "null"
        ? 1
        : parseInt(inspectionResult);
    // const reviewer = workAssignee;

    return axios.put(query, {
      status: inspectionResultTmp === 1 ? "done" : "reject",
      inspectionResult: inspectionResultTmp,
    });
  } else {
    return axios.put(query, {
      status,
    });
  }
}

export function postFolder(folderInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`addfolder/?token=` + token);
  return axios.post(query, folderInfo);
}

export function projectfromLabeling(labelId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `projectfromlabeling/${labelId}/?token=${token}`
  );
  return axios.post(query);
}

export function postCustomAI(metadata) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`customai/?token=` + token);
  return axios.post(query, metadata);
}

export function getSampleList(labelProjectId, projectId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `list-sample/?token=${token}&labelproject_id=${labelProjectId}&project_id=${projectId}`
  );
  return axios.get(query);
}

export function selectSampleModel(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`selected-sample-result/?token=` + token);
  return axios.put(query, data);
}

export function postAutoLabeling(metadata) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`autolabeling/?token=` + token);
  return axios.post(query, metadata);
}

export function updateShareGroup(sharegroupInfo) {
  const apptoken = JSON.parse(Cookies.getCookie("apptoken"));
  const query = backendurl.concat(`updatesharegroup/?appTokenCode=${apptoken}`);
  var formData = new FormData();
  formData.append("projectId", sharegroupInfo.projectId);
  formData.append("isLabelProject", true);
  formData.append("isUpdate", sharegroupInfo.isUpdate);
  sharegroupInfo.groupId.forEach((id) => {
    formData.append("groupId", id);
  });
  return axios.post(query, formData);
}

// export function getAiTrainerLabelprojects(labelProjectInfo) {
//   const token = Cookies.getCookie("jwt");
//   let labelprojectsUrl = `commissionedlabelprojects/?token=${token}&sorting=${
//     labelProjectInfo.sorting
//   }&count=${labelProjectInfo.count}&start=${labelProjectInfo.start + 1}`;
//   if (labelProjectInfo.isDesc) labelprojectsUrl += "&desc=True";
//   if (labelProjectInfo.searching && labelProjectInfo.searching !== "")
//     labelprojectsUrl += `&searching=${encodeURIComponent(
//       labelProjectInfo.searching
//     )}`;
//   const query = backendurl.concat(labelprojectsUrl);
//   return axios.get(query);
// }

export function shareToAiTrainer(labelId, isshared) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `commissionedlabelprojects/${labelId}/?token=${token}&isshared=${isshared}`
  );
  return axios.post(query);
}

export function getWorkage(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `workage/?token=${token}&labelprojectId=${id}`
  );
  return axios.get(query);
}

export function getAutolabelStatus(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `autolabeling/progress/${id}/?token=${token}`
  );
  return axios.get(query);
}

export async function getPrepareLabelsByLabelprojectId(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `prepare-labels-count-and-price?token=${token}&label_project_id=${id}`
  );
  return axios.get(query);
}

export async function postRequestInspect(requestInspectInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`request-labeling/?token=${token}`);
  return axios.post(query, requestInspectInfo);
}

export async function getLabelTypesPrice() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`get-label-type-prices/?token=${token}`);
  return axios.get(query);
}

export async function getLabelClassesPerPage({ id, page = 1, count = 10 }) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `labelclasses/?token=${token}&labelproject_Id=${id}&page=${page}&count=${count}`
  );
  return axios.get(query);
}

export function postLabelProjectsFromDataconnector(projectInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `labelproject-from-dataconnectors/?token=${token}`
  );
  return axios.post(query, projectInfo);
}

export function postLabels(labels) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`labels/?token=${token}`);
  return axios.post(query, labels);
}

export function putLabels(labels) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`labels/?token=${token}`);
  return axios.put(query, labels);
}

export function getLabelAppData(labelProjectId, labelFileId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `label-app/${labelProjectId}/${labelFileId}/?token=${token}`
  );
  return axios.get(query);
}

export function getKeyStatus() {
  const query = backendurl.concat(`key-status/`);
  return axios.get(query);
}

export function postRegisterKey(key) {
  const query = backendurl.concat(`register-key/`);
  return axios.post(query, { key });
}

export function postRegisterTrial(key) {
  const query = backendurl.concat(`register-trial/`);
  return axios.post(query);
}
