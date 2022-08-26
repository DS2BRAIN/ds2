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

export var fileurl = isEnterprise
  ? backendurl
  : "https://aimakerdslab.s3.ap-northeast-2.amazonaws.com/";

console.log(
  process.env.REACT_APP_ENTERPRISE,
  process.env.REACT_APP_DEPLOY,
  process.env.DEV
);

export function getMainPageData() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`main-page/?token=${token}`);
  return axios.get(query);
}

export function getUserData() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`me/?token=${token}`);
  return axios.get(query);
}

export function postProjectFile(files) {
  const user = JSON.parse(Cookies.getCookie("user"));
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat("projectfiles/"); //TODO: TEST
  const file = new Blob([files]);
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files.name));
  formData.append("filename", encodeURIComponent(files.name));
  formData.append("token", token);
  let result = axios.post(query, formData, {
    timeout: 600000,
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
  return result;
}

export function getServerPricing() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`server-pricing/?token=` + token);
  return axios.get(query);
}

export function getModelsInfoDetail(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`models/${id}/?token=` + token);
  return axios.get(query);
}

export function getDataMetabase(data_id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `dataconnector/${data_id}/metabase/?token=` + token
  );
  return axios.get(query);
}

export function getModelMetabase(model_id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `models/${model_id}/metabase/?token=` + token
  );
  return axios.get(query);
}

export function getNotificationViaSSE() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`sse/asynctask/?token=${token}`);
  const sse = new EventSource(query);
  return sse;
}

export function getDatasetViaSSE(dataconnectorInfo) {
  const token = Cookies.getCookie("jwt");
  let connectorsUrl = `sse/dataconnector/?token=${token}&sorting=${
    dataconnectorInfo.sorting
  }&count=${dataconnectorInfo.count}&start=${dataconnectorInfo.start +
    1}&is_public=${dataconnectorInfo.is_public}`;
  if (dataconnectorInfo.isDesc) connectorsUrl += "&desc=true";
  if (dataconnectorInfo.searching && dataconnectorInfo.searching !== "")
    connectorsUrl += `&searching=${encodeURIComponent(
      dataconnectorInfo.searching
    )}`;
  const query = backendurl.concat(connectorsUrl);
  const sse = new EventSource(query);
  return sse;
}

export function getDataInfoViaSSE(data_id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `dataconnector/${data_id}/sse/?token=${token}`
  );
  const sse = new EventSource(query);
  return sse;
}

export function getModelsInfoViaSSE(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`sse/model-info/${id}/?token=${token}`);
  const sse = new EventSource(query);
  return sse;
}

export function getProjectStatusViaSSE(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`sse/project-status/${id}/?token=${token}`);
  const sse = new EventSource(query);
  return sse;
}

export function getOPSModelsInfoDetail(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`opsmodels/${id}/?token=` + token);
  return axios.get(query);
}

export function getMarketModelsInfoDetail(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`marketmodels/${id}/?token=` + token);
  return axios.get(query);
}

export function getSampleDataByModelId(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`sampleimages/${id}/?token=` + token);
  return axios.get(query);
}

export function getProjects(projectsInfo) {
  const token = Cookies.getCookie("jwt");
  let projectsUrl = `projects/?token=${token}&sorting=${
    projectsInfo.sorting
  }&count=${projectsInfo.count}&page=${projectsInfo.page + 1}&tab=${
    projectsInfo.tab
  }`;
  if (projectsInfo.isDesc) projectsUrl += "&desc=true";
  if (projectsInfo.isVerify) projectsUrl += "&isVerify=true";
  if (projectsInfo.searching && projectsInfo.searching !== "")
    projectsUrl += `&searching=${encodeURIComponent(projectsInfo.searching)}`;
  if (projectsInfo.isshared) projectsUrl += "&isshared=true";
  const query = backendurl.concat(projectsUrl);
  return axios.get(query);
}

export function getJupyterProjects(projectsInfo) {
  const token = Cookies.getCookie("jwt");
  let projectsUrl = `jupyterprojects/?token=${token}&sorting=${
    projectsInfo.sorting
  }&count=${projectsInfo.count}&start=${projectsInfo.start + 1}&tab=${
    projectsInfo.tab
  }`;
  if (projectsInfo.isDesc) projectsUrl += "&desc=true";
  if (projectsInfo.searching && projectsInfo.searching !== "")
    projectsUrl += `&searching=${encodeURIComponent(projectsInfo.searching)}`;
  if (projectsInfo.isshared) projectsUrl += "&isshared=true";
  const query = backendurl.concat(projectsUrl);
  return axios.get(query);
}

export function getRecentJupyterProjects(projectsInfo) {
  const token = Cookies.getCookie("jwt");
  let projectsUrl = `jupyterprojects/?token=${token}&sorting=${
    projectsInfo.sorting
  }&count=${projectsInfo.count}&start=${projectsInfo.start + 1}&tab=${
    projectsInfo.tab
  }`;
  if (projectsInfo.isDesc) projectsUrl += "&desc=true";
  if (projectsInfo.searching && projectsInfo.searching !== "")
    projectsUrl += `&searching=${encodeURIComponent(projectsInfo.searching)}`;
  if (projectsInfo.isshared) projectsUrl += "&isshared=true";
  const query = backendurl.concat(projectsUrl);
  return axios.get(query);
}

export function getUsedJupyterPorts() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`used-jupyter-port/?token=` + token);
  return axios.get(query);
}

export function getOpsProjects(projectsInfo) {
  const token = Cookies.getCookie("jwt");
  let projectsUrl = `opsprojects/?token=${token}&sorting=${
    projectsInfo.sorting
  }&count=${projectsInfo.count}&start=${projectsInfo.start + 1}`;
  if (projectsInfo.tab) projectsUrl += `&tab=${projectsInfo.tab}`;
  if (projectsInfo.isDesc) projectsUrl += "&desc=true";
  if (projectsInfo.searching && projectsInfo.searching !== "")
    projectsUrl += `&searching=${encodeURIComponent(projectsInfo.searching)}`;
  if (projectsInfo.isshared) projectsUrl += "&isshared=true";
  const query = backendurl.concat(projectsUrl);
  return axios.get(query);
}

export function putProject(projectInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`projects/${projectInfo.id}/?token=` + token);
  return axios.put(query, projectInfo);
}

export async function updateProject(projectInfo, id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`projects/${id}/?token=` + token);
  return axios.put(query, projectInfo);
}

export function getProjectCategories() {
  const query = backendurl.concat(`projectcategories/`);
  return axios.get(query);
}

export function getProject(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`projects/${id}/?token=` + token);
  return axios.get(query);
}

export function getOpsProject(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`opsprojects/${id}/?token=` + token);
  return axios.get(query);
}

export function getMarketProject(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`marketprojects/${id}/?token=` + token);
  return axios.get(query);
}

export function getJupyterProject(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`jupyterprojects/${id}/?token=` + token);
  return axios.get(query);
}

export function deleteProject(ids) {
  var FormData = require("form-data");
  var formData = new FormData();
  ids.forEach((id) => {
    formData.append("projectId", id);
  });
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`projects/?token=${token}`);
  var config = {
    method: "delete",
    url: query,
    data: formData,
  };
  return axios(config);
}

export function deleteMarketProject(ids) {
  var FormData = require("form-data");
  var formData = new FormData();
  ids.forEach((id) => {
    formData.append("marketProjectIds", id);
  });
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`marketprojects/?token=${token}`);
  var config = {
    method: "delete",
    url: query,
    data: formData,
  };
  return axios(config);
}

export function deleteOpsProjects(ids) {
  var FormData = require("form-data");
  var formData = new FormData();
  ids.forEach((id) => {
    formData.append("projectId", id);
  });
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`opsprojects/?token=${token}`);
  var config = {
    method: "delete",
    url: query,
    data: formData,
  };
  return axios(config);
}

export function deleteJupyterProjects(ids) {
  var FormData = require("form-data");
  var formData = new FormData();
  ids.forEach((id) => {
    formData.append("projectId", id);
  });
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`jupyterprojects/?token=${token}`);
  var config = {
    method: "delete",
    url: query,
    data: formData,
  };
  return axios(config);
}

export function deleteJupyterProject(ids) {
  var FormData = require("form-data");
  var formData = new FormData();
  ids.forEach((id) => {
    formData.append("projectId", id);
  });
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`jupyterprojects/?token=${token}`);
  var config = {
    method: "delete",
    url: query,
    data: formData,
  };
  return axios(config);
}

export function postAPI(params, isMarket, opsId) {
  const user = JSON.parse(Cookies.getCookie("user"));
  const apptoken = Cookies.getCookie("apptoken");
  params["apptoken"] = JSON.parse(apptoken);
  let query = backendurl.concat(`predict/${user["id"]}/`);
  if (isMarket) {
    query = backendurl.concat("market/predict/");
    params["userId"] = user["id"];
  }
  if (opsId) {
    query = backendurl.concat(`inference/inferenceops${opsId}/`);
    params["userId"] = user["id"];
  }
  let result = axios.post(query, params, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
  return result;
}

export async function predictImageForTextReturn(
  modelId,
  files,
  isMarket,
  opsId
) {
  const user = JSON.parse(Cookies.getCookie("user"));
  let query = backendurl.concat(`predictimage/${user["id"]}/`);
  if (isMarket) {
    query = backendurl.concat("market/predictimage/");
  }
  if (opsId) {
    query = backendurl.concat(`inferenceimage/inferenceops${opsId}/`);
  }
  const file = new Blob(files);
  const apptoken = Cookies.getCookie("apptoken");
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files[0].name));
  formData.append("filename", encodeURIComponent(files[0].name));
  formData.append("modelid", modelId);
  formData.append("apptoken", JSON.parse(apptoken));
  if (isMarket || opsId) {
    formData.append("userId", user["id"]);
  }

  return await axios.post(query, formData, {
    responseType: "json",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function predictImageForTextReturnXai(
  modelId,
  files,
  isMarket,
  opsId
) {
  const user = JSON.parse(Cookies.getCookie("user"));
  let query = backendurl.concat(`predictimagexai/${user["id"]}/`);
  if (isMarket) {
    query = backendurl.concat("market/predictimagexai/");
  }
  if (opsId) {
    query = backendurl.concat(`inferenceimagexai/inferenceops${opsId}/`);
  }
  const file = new Blob(files);
  const apptoken = Cookies.getCookie("apptoken");
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files[0].name));
  formData.append("filename", encodeURIComponent(files[0].name));
  formData.append("modelid", modelId);
  formData.append("apptoken", JSON.parse(apptoken));
  if (isMarket || opsId) {
    formData.append("userId", user["id"]);
  }

  return await axios.post(query, formData, {
    responseType: "blob",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function predictImageByURL(
  modelid,
  url,
  responseType,
  isMarket,
  opsId
) {
  const user = JSON.parse(Cookies.getCookie("user"));
  let query = backendurl.concat(`predictimagebyurl/${user["id"]}/`);
  if (isMarket) {
    query = backendurl.concat("market/predictimagebyurl/");
  }
  if (opsId) {
    query = backendurl.concat(`inferenceimagebyurl/inferenceops${opsId}/`);
  }
  const apptoken = Cookies.getCookie("apptoken");
  let data = {
    apptoken: JSON.parse(apptoken),
    url: url,
    modelid: modelid,
  };
  if (isMarket || opsId) {
    data["userId"] = user["id"];
  }

  return await axios.post(query, data, {
    responseType: responseType,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function predictImage(modelId, files, isMarket, opsId) {
  const user = JSON.parse(Cookies.getCookie("user"));
  let query = backendurl.concat(`predictimage/${user["id"]}/`);
  if (isMarket) {
    query = backendurl.concat("market/predictimage/");
  }
  if (opsId) {
    query = backendurl.concat(`inferenceimage/inferenceops${opsId}/`);
  }

  const file = new Blob(files);
  const apptoken = Cookies.getCookie("apptoken");
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files[0].name));
  formData.append("filename", encodeURIComponent(files[0].name));
  formData.append("modelid", modelId);
  formData.append("apptoken", JSON.parse(apptoken));
  if (isMarket || opsId) {
    formData.append("userId", user["id"]);
  }

  return await axios.post(query, formData, {
    responseType: "blob",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function predictVideo(
  modelId,
  files,
  isMarket,
  opsId,
  marketProjectId,
  isStandardMovie,
  sync_cut_at = 0,
  vidCreatedDateTime
) {
  const user = JSON.parse(Cookies.getCookie("user"));
  let query = backendurl.concat(`predictmovieasync/${user["id"]}/`);
  if (isMarket) {
    query = backendurl.concat("market/predictmovieasync/");
  }
  if (opsId) {
    query = backendurl.concat(`inferencemovieasync/inferenceops${opsId}/`);
  }
  const file = new Blob(files);
  const apptoken = Cookies.getCookie("apptoken");
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files[0].name));
  formData.append("filename", encodeURIComponent(files[0].name));
  formData.append("modelid", modelId);
  formData.append("apptoken", JSON.parse(apptoken));
  formData.append("marketProjectId", marketProjectId);
  if (isMarket || opsId) {
    formData.append("userId", user["id"]);
  }
  if (isMarket) {
    formData.append("sync_cut_at", sync_cut_at);
    formData.append("isStandardMovie", isStandardMovie);

    if (vidCreatedDateTime) {
      formData.append("creation_time", vidCreatedDateTime);
    }
  }

  return await axios.post(query, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function predictImageInfo(modelId, files, isMarket, opsId) {
  const user = JSON.parse(Cookies.getCookie("user"));
  let query = backendurl.concat(`predictimageinfo/${user["id"]}/`);
  if (isMarket) {
    query = backendurl.concat("market/predictimageinfo/");
  }
  if (opsId) {
    query = backendurl.concat(`inferenceimageinfo/inferenceops${opsId}/`);
  }
  const file = new Blob(files);
  const apptoken = Cookies.getCookie("apptoken");
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files[0].name));
  formData.append("filename", encodeURIComponent(files[0].name));
  formData.append("modelid", modelId);
  formData.append("apptoken", JSON.parse(apptoken));
  if (isMarket || opsId) {
    formData.append("userId", user["id"]);
  }

  return await axios.post(query, formData, {
    responseType: "json",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function predictRandomImageInfo(modelId, file, isMarket, opsId) {
  const user = JSON.parse(Cookies.getCookie("user"));
  let query = backendurl.concat(`predictimageinfo/${user["id"]}/`);
  if (isMarket) {
    query = backendurl.concat("market/predictimageinfo/");
  }
  if (opsId) {
    query = backendurl.concat(`inferenceimageinfo/inferenceops${opsId}/`);
  }
  const apptoken = Cookies.getCookie("apptoken");
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(file));
  formData.append("filename", encodeURIComponent("image.jpg"));
  formData.append("modelid", modelId);
  formData.append("apptoken", JSON.parse(apptoken));
  if (isMarket || opsId) {
    formData.append("userId", user["id"]);
  }

  return await axios.post(query, formData, {
    responseType: "json",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function predictAll(modelId, files, isMarket, opsId) {
  const user = JSON.parse(Cookies.getCookie("user"));
  let query = backendurl.concat(`predictallasync/${user["id"]}/`);
  if (isMarket) {
    query = backendurl.concat("market/predictallasync/");
  }
  if (opsId) {
    query = backendurl.concat(`inferenceallasync/inferenceops${opsId}/`);
  }
  const file = new Blob([files]);
  const apptoken = Cookies.getCookie("apptoken");
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files.name));
  formData.append("filename", encodeURIComponent(files.name));
  formData.append("modelid", modelId);
  formData.append("apptoken", JSON.parse(apptoken));
  if (isMarket || opsId) {
    formData.append("userId", user["id"]);
  }

  return await axios.post(query, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function predictLabelingAsync(modelId, files, isMarket, opsId) {
  const user = JSON.parse(Cookies.getCookie("user"));
  let query = backendurl.concat(`labelingasync/${user["id"]}/`);
  if (isMarket) {
    query = backendurl.concat("market/labelingasync/");
  }
  if (opsId) {
    query = backendurl.concat(`labelingasync/inferenceops${opsId}/`);
  }
  const file = new Blob([files]);
  const apptoken = Cookies.getCookie("apptoken");
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files.name));
  formData.append("filename", encodeURIComponent(files.name));
  formData.append("modelid", modelId);
  formData.append("apptoken", JSON.parse(apptoken));
  if (isMarket || opsId) {
    formData.append("userId", user["id"]);
  }

  return await axios.post(query, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function predictAllImage(modelId, files, isMarket, opsId) {
  const user = JSON.parse(Cookies.getCookie("user"));
  let query = backendurl.concat(user["id"] + "/predictallimage/");
  if (isMarket) {
    query = backendurl.concat("market/predictallimage/");
  }
  if (opsId) {
    query = backendurl.concat(`inferenceallimage/inferenceops${opsId}/`);
  }
  const file = new Blob(files);
  const apptoken = Cookies.getCookie("apptoken");
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files[0].name));
  formData.append("filename", encodeURIComponent(files[0].name));
  formData.append("modelid", modelId);
  formData.append("apptoken", JSON.parse(apptoken));
  if (isMarket || opsId) {
    formData.append("userId", user["id"]);
  }

  return await axios.post(query, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function getSampleData() {
  const query = backendurl.concat("sampledata");
  return axios.get(query);
}

export function forgetPassword(data) {
  const query = backendurl.concat(`forgot-password/`);
  return axios.post(query, {
    email: data.email,
    provider: "DS2.ai",
    languageCode: data.lang,
  });
}

// export function resetPassword(_code, _password, _passwordCheck) {
//   const query = backendurl.concat("reset-password/");
//   return axios.post(query, {
//     code: _code,
//     password: _password,
//     passwordConfirmation: _passwordCheck,
//   });
// }
export function resetPassword(userPasswordInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat("reset-password/");
  let tempInfo = userPasswordInfo;
  tempInfo["token"] = token;
  return axios.post(query, tempInfo);
}

export function emailConfirm(data) {
  const query = backendurl.concat(
    `email-confirm/?token=${data.token}&user=${data.user}`
  );
  return axios.get(query);
}

export function getUserInfo(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `users/?token=${token}&page=${data.page}&count=${data.count}&desc=${data.desc}&sorting=${data.sorting}&searching=${data.searching}`
  );
  return axios.get(query);
}

export function postUserInfo(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`users/?token=${token}`);
  return axios.post(query, {
    name: data.name,
    email: data.email,
    password: data.password,
  });
}

export function deleteUserInfo(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`users/?token=${token}&user_id=${id}`);

  return axios.delete(query);
}

export function updateFirstPlanDone(_isFirstPlanDone) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`user/?token=${token}`);
  return axios.put(query, {
    isFirstplanDone: _isFirstPlanDone,
  });
}

export function userInfoChange(userInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`user/?token=${token}`);
  return axios.put(query, userInfo, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "PUT",
    },
  });
}

export function makeUserUnable() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`user/?token=${token}`);
  return axios.put(query, {
    isDeleteRequested: true,
  });
}

export function getListObjects(folderName) {
  const token = Cookies.getCookie("jwt");
  const query =
    folderName === ""
      ? backendurl.concat(`listobjects/?token=${token}`)
      : backendurl.concat(`listobjects/?token=${token}&folder=${folderName}`);
  let result = axios.get(query);
  return result;
}

export async function postUploadFile(files, rootDirectory, width, height) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat("addobject/");

  const file = new Blob([files]);
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files.name));
  width && formData.append("width", width);
  height && formData.append("height", height);
  formData.append("token", token);
  // formData.append("filename", encodeURIComponent(files.name));
  // formData.append("folder", rootDirectory);
  return await axios.post(query, formData, {
    timeout: 600000,
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function postFolder(folderInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`addfolder/?token=` + token);
  return axios.post(query, folderInfo);
}

export function getUsagePlans() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`usageplans/?token=` + token);
  return axios.get(query);
}

export function requestRefund() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`requestRefund/?token=` + token);
  return axios.post(query);
}

export function cancelUsage() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`cancelUsage/?token=` + token);
  return axios.post(query);
}

// export function postUsagePlan(_usagePlan, _dynos) {
//   let plan = {};
//   if (_usagePlan === "basic" || _usagePlan === "trial") {
//     plan = { usageplan: _usagePlan, dynos: 1 };
//   } else {
//     plan = { usageplan: _usagePlan, dynos: _dynos };
//   }
//   const token = Cookies.getCookie("jwt");
//   const query = backendurl.concat(`usageplan/?token=` + token);
//   return axios.put(query, plan);
// }

export function postAddtionalUnit(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`pay-additional-unit/?token=` + token);
  return axios.put(query, data);
}

export function deleteFuturePlan() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`deletefutureplan/?token=` + token);
  return axios.delete(query);
}

export function checkValidEmail(_email) {
  const query = backendurl.concat(`check-vaild-email/?email=${_email}`);
  return axios.get(query);
  // const result = await axios
  //   .get(query)
  //   .then((res) => {
  //     return res.data;
  //   })
  //   .catch((e) => {
  //     if (!isDeploy) console.log(e);
  //   });
  //return result;
}

export function postSignUp(userInfo) {
  const query = backendurl.concat(`register/`);
  return axios.post(query, userInfo);
}

export function Login(User) {
  const query = backendurl.concat("login/");
  return axios.post(query, {
    identifier: User.id,
    password: User.password,
    socialType: User.socialType,
  });
}

export function verifyPhone(imp_uid) {
  const query = backendurl.concat("verifyphone/");
  return axios.post(query, {
    imp_uid: imp_uid,
  });
}

export function getReToken() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat("regenerate-app-token/");
  return axios.post(query + `?token=${token}`);
}

export function getPgRegistration() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`pgregistration/?token=${token}`);
  return axios.get(query);
}

export function getPgPayment() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat("pgpayment/");
  return axios.get(query + `?token=${token}`);
}

export function getPgPaymentDetail(year, month) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat("pgpayment-detail/");
  return axios.get(query + `?token=${token}&year=${year}&month=${month}`);
}

export function getSessionId(pathInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`session-start/?token=${token}`);
  let formdata = new FormData();
  formdata.append("url", pathInfo.url);
  return axios.post(query, formdata);
}

export function getSessionResult() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`session-end/?token=${token}`);
  return axios.get(query);
}

export function getAsynctask() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat("asynctask/");
  return axios.get(query + `?token=${token}`);
}

export function getAsynctaskAll(asynctaskInfo, forLabelProject) {
  const token = Cookies.getCookie("jwt");
  let query;
  if (forLabelProject) {
    query = backendurl.concat(
      `asynctaskall/?token=${token}&start=${asynctaskInfo.start}&count=${asynctaskInfo.count}&label_project_id=${asynctaskInfo.id}`
    );
  } else {
    query = backendurl.concat(
      `asynctaskall/?token=${token}&count=${
        asynctaskInfo.count
      }&start=${asynctaskInfo.start + 1}&taskType=${asynctaskInfo.tasktype}`
    );
  }
  return axios.get(query);
}

export function getAsynctaskAllByMarketProjectId(asynctaskInfo) {
  const token = Cookies.getCookie("jwt");
  let query;
  query = backendurl.concat(
    `asynctaskall/?token=${token}&start=${asynctaskInfo.start}&count=${asynctaskInfo.count}&market_project_id=${asynctaskInfo.id}`
  );
  return axios.get(query);
}

export function checkAsynctask(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`asynctask/${id}/`);
  return axios.put(query + `?token=${token}`);
}

export function getFavoriteModels() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat("models/favorite/");
  return axios.get(query + `?token=${token}`);
}

export function getTemplates() {
  const query = backendurl.concat("templates/");
  return axios.get(query);
}

export function setFavoriteModel(isTrue, id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`models/favorite/${id}/`);
  return axios.put(query + `?token=${token}`, { isFavorite: isTrue });
}

export function getDataset(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`datasets/${id}/?token=` + token);
  return axios.get(query);
}

export function postDataconnector(dataconnectorInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`dataconnectors/?token=` + token);
  return axios.post(query, dataconnectorInfo);
}

export function postProjectWithModelFile(files) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`projectswithmodelfile/?token=` + token); //TODO: TEST
  const file = new Blob([files]);
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files.name));
  formData.append("filename", encodeURIComponent(files.name));
  let result = axios.post(query, formData, {
    timeout: 600000,
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
  return result;
}

export function postDataconnectorWithAuthFile(files, dataconnectorInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`dataconnectorswithauthfile/?token=` + token); //TODO: TEST
  const file = new Blob([files]);
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files.name));
  formData.append("filename", encodeURIComponent(files.name));
  formData.append("dataconnectorName", dataconnectorInfo.dataconnectorName);
  formData.append("dataconnectortype", dataconnectorInfo.dataconnectortype);
  formData.append(
    "dataconnectortypeName",
    dataconnectorInfo.dataconnectortypeName
  );
  formData.append("profileId", dataconnectorInfo.profileId);
  let result = axios.post(query, formData, {
    timeout: 600000,
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
  return result;
}

export function postDataconnectorWithFile(files, dataconnectorInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat("dataconnectorswithfile/"); //TODO: TEST
  // const file = new Blob([files]);
  // formData.append("file", file, encodeURIComponent(files.name));

  var formData = new FormData();
  formData.append("token", token);
  formData.append("dataconnectorName", dataconnectorInfo.dataconnectorName);
  formData.append("dataconnectortype", dataconnectorInfo.dataconnectortype);
  formData.append("file", files);
  formData.append("filename", files.name);
  formData.append(
    "frame_value",
    dataconnectorInfo.frameValue ? dataconnectorInfo.frameValue : 60
  );
  formData.append("hasLabelData", dataconnectorInfo.hasLabelData);
  formData.append("predictColumnName", dataconnectorInfo.predictColumnName);
  formData.append(
    "has_de_identification",
    dataconnectorInfo.has_de_identification
  );

  let result = axios.post(query, formData, {
    // timeout: 600000,
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
  return result;
}

export function postProjectFromDataconnectors(dataconnectors) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`projectfromdataconnectors/?token=` + token);
  return axios.post(query, dataconnectors);
}

export function putDataconnector(dataconnectorInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `dataconnectors/${dataconnectorInfo.id}/?token=` + token
  );
  return axios.put(query, dataconnectorInfo);
}

export function getDataconnectors(dataconnectorInfo) {
  const token = Cookies.getCookie("jwt");
  let connectorsUrl = `dataconnectors/?token=${token}&sorting=${
    dataconnectorInfo.sorting
  }&count=${dataconnectorInfo.count}&start=${dataconnectorInfo.start +
    1}&is_public=${dataconnectorInfo.is_public}`;
  if (dataconnectorInfo.isDesc) connectorsUrl += "&desc=true";
  if (dataconnectorInfo.searching && dataconnectorInfo.searching !== "")
    connectorsUrl += `&searching=${encodeURIComponent(
      dataconnectorInfo.searching
    )}`;
  const query = backendurl.concat(connectorsUrl);
  return axios.get(query);
}

export function getDataconnector(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`dataconnectors/${id}/?token=` + token);
  return axios.get(query);
}

export function deleteDataconnector(ids) {
  var FormData = require("form-data");
  var formData = new FormData();
  ids.forEach((id) => {
    formData.append("dataconnectorId", id);
  });
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`dataconnectors/?token=` + token);
  var config = {
    method: "delete",
    url: query,
    data: formData,
  };
  return axios(config);
}

export function getDataconnectortypes(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`dataconnectortypes/?token=` + token);
  return axios.get(query);
}

export function getEngineAi() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`engineais/?token=` + token);
  return axios.get(query);
}

export function getExternalAi() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`externalais/?token=` + token);
  return axios.get(query);
}

export function postTextApi(text, apiAddress) {
  const user = JSON.parse(Cookies.getCookie("user"));
  const apptoken = Cookies.getCookie("apptoken");
  const query = backendurl.concat(`predict/${apiAddress}/`);
  var formData = new FormData();
  formData.append("text", text);
  formData.append("apptoken", JSON.parse(apptoken));

  return axios.post(query, formData, {
    responseType: "json",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function postTextAllApi(files, apiAddress) {
  const user = JSON.parse(Cookies.getCookie("user"));
  const apptoken = Cookies.getCookie("apptoken");
  const query = backendurl.concat(`predictall/${apiAddress}/`);
  const file = new Blob([files]);
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files.name));
  formData.append("filename", encodeURIComponent(files.name));
  formData.append("apptoken", JSON.parse(apptoken));
  return axios.post(query, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function postDevelopedAiText(modelId, textdata) {
  const apptoken = Cookies.getCookie("apptoken");
  const query = backendurl.concat(`predict/developedAiModel/`);
  var formData = new FormData();
  formData.append("modelId", modelId);
  formData.append("apptoken", JSON.parse(apptoken));
  formData.append("textdata", JSON.stringify(textdata));
  return axios.post(query, formData, {
    responseType: "json",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function postDevelopedAiFile(modelId, files) {
  const apptoken = Cookies.getCookie("apptoken");
  const query = backendurl.concat(`predict/developedAiModel/`);
  const file = new Blob([files]);
  var formData = new FormData();
  formData.append("modelId", modelId);
  formData.append("apptoken", JSON.parse(apptoken));
  formData.append("file", file, encodeURIComponent(files.name));
  return axios.post(query, formData, {
    responseType: "json",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function postImageApi(files, apiAddress) {
  const user = JSON.parse(Cookies.getCookie("user"));
  const apptoken = Cookies.getCookie("apptoken");
  const query = backendurl.concat(`predict/${apiAddress}/`);
  const file = new Blob([files]);
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files.name));
  formData.append("filename", encodeURIComponent(files.name));
  formData.append("apptoken", JSON.parse(apptoken));
  return axios.post(query, formData, {
    responseType: "json",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function postMarketImageApi(files, modelid) {
  const user = JSON.parse(Cookies.getCookie("user"));
  const apptoken = Cookies.getCookie("apptoken");
  const query = backendurl.concat(`market/predictimage/`);
  const file = new Blob([files]);
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files.name));
  formData.append("filename", encodeURIComponent(files.name));
  formData.append("apptoken", JSON.parse(apptoken));
  formData.append("modelid", modelid);
  formData.append("userId", user["id"]);
  return axios.post(query, formData, {
    responseType: "json",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}
export function postMarketTextApi(text, modelid) {
  const user = JSON.parse(Cookies.getCookie("user"));
  const apptoken = Cookies.getCookie("apptoken");
  const query = backendurl.concat(`market/predict/`);
  var formData = new FormData();
  formData.append("text", text);
  formData.append("modelid", modelid);
  formData.append("userId", user["id"]);
  formData.append("apptoken", JSON.parse(apptoken));

  return axios.post(query, formData, {
    responseType: "json",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function postMarketCustomApi(inputData, marketProjectId) {
  const apptoken = JSON.parse(Cookies.getCookie("apptoken"));
  const query = backendurl.concat(
    `recommand/external/model/${marketProjectId}`
  );
  var formData = { app_token: apptoken, input_data: inputData };
  return axios.post(query, formData, {
    responseType: "json",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function postMarketCustomApiWithFile(files, marketProjectId) {
  const apptoken = JSON.parse(Cookies.getCookie("apptoken"));
  const query = backendurl.concat(
    `recommand/external/file/model/${marketProjectId}?app_token=${apptoken}`
  );

  var formData = new FormData();

  files.forEach((file) => {
    formData.append("file_list", file, file.name);
  });

  return axios.post(query, formData, {
    timeout: 100000000,
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function getTemplateFile(projectId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`templatefile/${projectId}/?token=${token}`);
  return axios.get(query);
}

export function putLogo(files) {
  const query = backendurl.concat(`userlogo/`);
  const token = Cookies.getCookie("jwt");
  const file = new Blob([files]);
  var formData = new FormData();
  formData.append("file", file, encodeURIComponent(files.name));
  formData.append("filename", files.name);
  formData.append("token", token);
  return axios.put(query, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "PUT",
    },
  });
}

export function deleteLogo() {
  const query = backendurl.concat(`userlogo/`);
  const token = Cookies.getCookie("jwt");
  var formData = new FormData();
  formData.append("token", token);
  return axios.put(query, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "PUT",
    },
  });
}

export function getUserCountInfo() {
  const query = backendurl.concat(`user-count/`);
  return axios.get(query);
}

export function getUserCountInfoWithToken() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`usercountinfo/?token=${token}`);
  return axios.get(query);
}

export function getUserSettingInfo() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`usersettinginfo/?token=${token}`);
  return axios.get(query);
}

export function getProjectsAsync(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`projectsasync/${id}/?token=${token}`);
  return axios.get(query);
}

export function getColabCode(id, colabInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`trainmodelfromcolab/${id}/?token=${token}`);
  return axios.post(query, colabInfo);
}

export function getGroups() {
  const apptoken = JSON.parse(Cookies.getCookie("apptoken"));
  const query = backendurl.concat(`group/?appTokenCode=${apptoken}`);
  return axios.get(query);
}

export function getGroupsByLabelProject(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`group/${id}/?token=${token}`);
  return axios.get(query);
}

export function postGroup(groupName) {
  const apptoken = JSON.parse(Cookies.getCookie("apptoken"));
  const query = backendurl.concat(`group/?appTokenCode=${apptoken}`);
  var formData = new FormData();
  formData.append("groupName", groupName);
  return axios.post(query, formData);
}

export function postMember(groupId, memberEmail, lang) {
  const apptoken = JSON.parse(Cookies.getCookie("apptoken"));
  const query = backendurl.concat(
    `invitegroup/?appTokenCode=${apptoken}&languageCode=${lang}`
  );
  var formData = new FormData();
  formData.append("groupId", groupId);
  formData.append("email", memberEmail);
  return axios.post(query, formData);
}

export function postAcceptGroup(groupId, accept) {
  const apptoken = JSON.parse(Cookies.getCookie("apptoken"));
  const query = backendurl.concat(`acceptinvited/?appTokenCode=${apptoken}`);
  var formData = new FormData();
  formData.append("groupId", groupId);
  formData.append("accept", accept);
  return axios.post(query, formData);
}

export function deleteMember(banUserId, groupId) {
  const apptoken = JSON.parse(Cookies.getCookie("apptoken"));
  const query = backendurl.concat(`bangroupuser/?appTokenCode=${apptoken}`);
  var formData = new FormData();
  formData.append("banUserId", banUserId);
  formData.append("groupId", groupId);
  return axios.post(query, formData);
}

export function deleteGroup(groupId) {
  const apptoken = JSON.parse(Cookies.getCookie("apptoken"));
  const query = backendurl.concat(
    `deletegroup/?appTokenCode=${apptoken}&groupId=${groupId}`
  );
  return axios.delete(query);
}

export function leaveGroup(groupId) {
  const apptoken = JSON.parse(Cookies.getCookie("apptoken"));
  const query = backendurl.concat(
    `leavegroup/?appTokenCode=${apptoken}&groupId=${groupId}`
  );
  return axios.put(query);
}

export function putGroup(groupName, groupId) {
  const apptoken = JSON.parse(Cookies.getCookie("apptoken"));
  const query = backendurl.concat(`group/?appTokenCode=${apptoken}`);
  var formData = new FormData();
  formData.append("groupId", groupId);
  formData.append("groupname", groupName);
  return axios.put(query, formData);
}

export function updateShareGroup(sharegroupInfo) {
  const apptoken = JSON.parse(Cookies.getCookie("apptoken"));
  const query = backendurl.concat(`updatesharegroup/?appTokenCode=${apptoken}`);
  var formData = new FormData();
  formData.append("projectId", sharegroupInfo.projectId);
  formData.append("isUpdate", sharegroupInfo.isUpdate);
  sharegroupInfo.groupId.forEach((id) => {
    formData.append("groupId", id);
  });
  return axios.post(query, formData);
}

export function postAutoLabeling(labelId, projectId, modelId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`autolabeling/?token=` + token);
  return axios.post(query, {
    labelprojectId: parseInt(labelId),
    modelId: modelId,
    projectId: projectId,
  });
}

export function getAllWorkage() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`workage/?token=${token}`);
  return axios.get(query);
}

export function getDevelopedAiModels() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`developedaimeodels/?token=${token}`);
  return axios.get(query);
}

export function postAmazonExternalAiKey(key, additionalKey) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`externalais/addkey/?token=${token}`);
  var formData = new FormData();
  formData.append("modelName", "amazon");
  formData.append("key", key);
  formData.append("additionalKey", additionalKey);
  formData.append("isShareProvider", true);
  return axios.post(query, formData);
}

export function postAzureExternalAiKey(key, additionalKey) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`externalais/addkey/?token=${token}`);
  var formData = new FormData();
  formData.append("modelName", "azure");
  formData.append("key", key);
  formData.append("additionalKey", additionalKey);
  formData.append("isShareProvider", true);
  return axios.post(query, formData);
}

export function postGoogleExternalAiKey(file) {
  const token = Cookies.getCookie("jwt");
  const blobFile = new Blob([file]);
  const query = backendurl.concat(`externalais/addkey/?token=${token}`);
  var formData = new FormData();
  formData.append("key", file.name);
  formData.append("modelName", "google");
  formData.append("accessfile", blobFile, file.name);
  formData.append("isShareProvider", true);
  return axios.post(query, formData);
}

export function postProjectData(id, connectorId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `projects/data/${id}/${connectorId}/?token=` + token
  );
  return axios.post(query);
}

export function postTimeSeriesSampleData(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `predict/fillAutomaticData/${id}/?token=${token}`
  );
  return axios.post(query);
}

export function getNews(type) {
  const query = backendurl.concat(`news/?type=${type}`);
  return axios.get(query);
}

export function getMarketCategory() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`market-categories/?token=${token}`);
  return axios.get(query);
}

export function getMarketPlans(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `market-plans/?token=${token}&market_model_id=${data.modelId}`
  );
  return axios.get(query);
}

export function getMarketModels(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `market-models/?token=${token}&start=${data.start}&count=${data.count}&select_category=${data.category}&is_quick_model=true`
  );
  return axios.get(query);
}

export function requestMarketModel(files, modelId, phoneNumber, content) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`request-market-model/?token=${token}`);
  let formData = new FormData();
  if (files) {
    files.forEach((file) => {
      const blobFile = new Blob([file]);
      formData.append("file", blobFile, encodeURIComponent(file.name));
      formData.append("filename", encodeURIComponent(file.name));
    });
    formData.append("token", token);
    formData.append("modelId", modelId);
  }
  formData.append("market_model_id", modelId);
  formData.append("phone_number", phoneNumber);
  formData.append("description", content);
  return axios.post(query, formData, {
    responseType: "json",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function getMarketPurchaseList(data) {
  const token = Cookies.getCookie("jwt");
  let query;
  query = backendurl.concat(
    `market-purchase-list/?token=${token}&start=${data.start}&count=${
      data.count
    }&desc=${true}&sorting=${`created_at`}`
  );
  if (data.searching) {
    query = backendurl.concat(
      `market-purchase-list/?token=${token}&start=${data.start}&count=${
        data.count
      }&searching=${data.searching}&desc=${true}&sorting=${`created_at`}`
    );
  }
  return axios.get(query);
}

export function getMarketMovieStatistics(data, id) {
  const token = Cookies.getCookie("jwt");
  let query;
  query = backendurl.concat(
    `moviestatistics/${id}/?token=${token}&period_type=${data.period_type}&start_date=${data.start_date}&end_date=${data.end_date}`
  );
  return axios.get(query);
}

export async function postOpsProject(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`opsprojects/?token=${token}`);

  return await axios.post(query, data, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function postOpsProjectSellPrice(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`sell-api/?token=${token}`);

  return await axios.post(query, data, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function postPurchaseModel(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`purchase-model/?token=${token}`);
  let formData = new FormData();
  formData.append("projectID", data.projectID);
  formData.append("modelID", data.modelID);
  formData.append("amount", data.amount);
  return axios.post(query, formData, {
    responseType: "json",
    headers: {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function putJupyterProject(id, data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`jupyterprojects/${id}/?token=${token}`);

  return await axios.put(query, data, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "PUT",
    },
  });
}

export async function putOpsProject(id, data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`opsprojects/${id}/?token=${token}`);

  return await axios.put(query, data, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "PUT",
    },
  });
}

export async function postOpsServerGroup(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`opsservergroups/?token=${token}`);

  return await axios.post(query, data, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function editOpsServerGroup(id, data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`opsservergroups/${id}/?token=${token}`);

  return await axios.put(query, data, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "PUT",
    },
  });
}

export async function removeOpsServerGroup(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`opsservergroups/${id}/?token=${token}`);
  return await axios.delete(query, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "DELETE",
    },
  });
}

export async function getOpsServerStatistic(projectId, instanceId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `ops-server-group-statistic/?token=${token}&opsServerGroupId=${projectId}&instanceId=${instanceId}`
  );

  return await axios.get(query, {
    responseType: "blob",
    headers: {
      // "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "GET",
    },
  });
}

export async function getOpsServerStatus(projectId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `ops-servers-status/?token=${token}&opsProjectId=${projectId}`
  );
  return await axios.get(query, {
    responseType: "blob",
    headers: {
      //"Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "GET",
    },
  });
}

export async function postJupyterProject(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`jupyterprojects/?token=${token}`);

  return await axios.post(query, data, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function postJupyterServer(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`jupyterservers/?token=${token}`);

  return await axios.post(query, data, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function getJupyterServerStatistic(instanceId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `jupyter-server-statistic/?token=${token}&instanceId=${instanceId}`
  );

  return await axios.get(query, {
    responseType: "blob",
    headers: {
      // "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "GET",
    },
  });
}

export async function getJupyterServerStatus(projectId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `jupyter-servers-status/?token=${token}&jupyterProjectId=${projectId}`
  );

  return await axios.get(query, {
    responseType: "json",
    headers: {
      // "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "GET",
    },
  });
}

export async function shutdownJupyterServer(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`jupyterservers/${id}/?token=${token}`);
  return await axios.delete(query, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "DELETE",
    },
  });
}

export async function stopJupyterServer(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`jupyterservers/${id}/stop/?token=${token}`);
  return await axios.post(query, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export async function resumeJupyterServer(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `jupyterservers/${id}/resume/?token=${token}`
  );
  return await axios.post(query, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function getServiceProject(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`serviceprojects/${id}/?token=${token}`);
  return axios.get(query);
}

export function getUsages() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`usages/?token=${token}`);
  return axios.get(query);
}

export function PostEximbay() {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`eximbay-registration-start/?token=${token}`);
  return axios.post(query);
}

export function postPurchaseCredit(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`purchase-credit/?token=${token}`);
  return axios.post(query, data);
}

export function postPurchaseMarketModel(data) {
  const token = Cookies.getCookie("jwt");
  let requestData = {};
  const query = backendurl.concat(`purchase-model-plan/?token=${token}`);
  if (data.isSelectedDiscount) {
    if (data.currency == "krw") {
      requestData.currency = "krw";
      requestData.amount = data.sale_amount_kr;
    } else {
      requestData.currency = "usd";
      requestData.amount = data.sale_amount_en;
    }
  } else {
    if (data.currency == "krw") {
      requestData.currency = "krw";
      requestData.amount = data.amount_kr;
    } else {
      requestData.currency = "usd";
      requestData.amount = data.amount_en;
    }
  }
  requestData.planId = data.planId;
  return axios.post(query, requestData);
}

export async function postMarketProject(data) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`marketprojects/?token=${token}`);

  return await axios.post(query, data, {
    responseType: "json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "access-control-allow-methods": "POST",
    },
  });
}

export function updateMarketProject(id, marketProjectInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`marketprojects/${id}/?token=${token}`);
  return axios.put(query, marketProjectInfo);
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

export function postCreateReport(project_id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `create_report/?token=${token}&project_id=${project_id}`
  );

  return axios.post(query);
}

export function getDataconnectorInfo(dataconnectorId) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(
    `dataconnector/${dataconnectorId}/?token=${token}`
  );

  return axios.get(query);
}

export function postFeedback(feedbackInfo) {
  const query = backendurl.concat(`feedback/`);

  return axios.post(query, feedbackInfo);
}
