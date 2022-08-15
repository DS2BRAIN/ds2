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

export function getJupyterProjects(jupyterProjectInfo) {
  const token = Cookies.getCookie("jwt");
  let jupyterprojectsUrl = `jupyterprojects/?token=${token}&sorting=${
    jupyterProjectInfo.sorting
  }&count=${jupyterProjectInfo.count}&start=${jupyterProjectInfo.start + 1}`;
  if (jupyterProjectInfo.isDesc) jupyterprojectsUrl += "&desc=True";
  if (jupyterProjectInfo.searching && jupyterProjectInfo.searching !== "")
    jupyterprojectsUrl += `&searching=${encodeURIComponent(
      jupyterProjectInfo.searching
    )}`;
  if (jupyterProjectInfo.isshared) jupyterprojectsUrl += "&isShared=true";
  const query = backendurl.concat(jupyterprojectsUrl);
  return axios.get(query);
}

export function postJupyterProjects(projectInfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`jupyterprojects/?token=${token}`);
  return axios.post(query, projectInfo);
}

export function getJupyterProject(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`jupyterprojects/${id}/?token=${token}`);
  return axios.get(query);
}

export function getProjectsStatus(id) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`projects/${id}/status?token=${token}`);
  return axios.get(query);
}

export function upldateJupyterProject(id, jupyterinfo) {
  const token = Cookies.getCookie("jwt");
  const query = backendurl.concat(`jupyterprojects/${id}/?token=${token}`);
  return axios.put(query, jupyterinfo);
}

export function deleteJupyterProject(ids) {
  var FormData = require("form-data");
  var formData = new FormData();
  ids.forEach((id) => {
    formData.append("jupyterProjectId", id);
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
