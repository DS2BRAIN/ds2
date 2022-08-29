import { put, takeLatest, all, call, fork } from "redux-saga/effects";
import * as api from "controller/api.js";
import {
  GET_DATACONNECTORTYPE_REQUEST,
  GET_DATACONNECTORTYPE_SUCCESS,
  GET_DATACONNECTORTYPE_FAILURE,
  GET_DATACONNECTORS_REQUEST,
  GET_DATACONNECTORS_SUCCESS,
  GET_DATACONNECTORS_FAILURE,
  GET_PROJECTS_REQUEST,
  GET_PROJECTS_SUCCESS,
  GET_PROJECTS_FAILURE,
  GET_JUPYTERPROJECTS_REQUEST,
  GET_JUPYTERPROJECTS_SUCCESS,
  GET_JUPYTERPROJECTS_FAILURE,
  GET_OPSPROJECTS_REQUEST,
  GET_RECENTPROJECTS_REQUEST,
  GET_RECENTPROJECTS_SUCCESS,
  GET_RECENTPROJECTS_FAILURE,
  DELETE_PROJECTS_REQUEST,
  DELETE_PROJECTS_SUCCESS,
  DELETE_PROJECTS_FAILURE,
  DELETE_DATACONNECTORS_REQUEST,
  DELETE_DATACONNECTORS_SUCCESS,
  DELETE_DATACONNECTORS_FAILURE,
  POST_DATACONNECTOR_REQUEST,
  POST_DATACONNECTOR_SUCCESS,
  POST_DATACONNECTOR_FAILURE,
  POST_CONNECTORWITHAUTHFILE_REQUEST,
  POST_CONNECTORWITHAUTHFILE_SUCCESS,
  POST_CONNECTORWITHAUTHFILE_FAILURE,
  POST_CONNECTORWITHFILE_REQUEST,
  POST_CONNECTORWITHFILE_SUCCESS,
  POST_CONNECTORWITHFILE_FAILURE,
  POST_PURCHASEMODEL_REQUEST,
  POST_PURCHASEMODEL_SUCCESS,
  POST_PURCHASEMODEL_FAILURE,
  GET_PROJECT_REQUEST,
  GET_PROJECT_SUCCESS,
  GET_PROJECT_FAILURE,
  PUT_PROJECTNAME_REQUEST,
  PUT_PROJECTNAME_SUCCESS,
  PUT_PROJECTNAME_FAILURE,
  PUT_PROJECTDESCRIPTION_REQUEST,
  PUT_PROJECTDESCRIPTION_SUCCESS,
  PUT_PROJECTDESCRIPTION_FAILURE,
  GET_ASYNCPROJECT_REQUEST,
  GET_ASYNCPROJECT_SUCCESS,
  GET_ASYNCPROJECT_FAILURE,
  START_PROJECT_REQUEST,
  START_COLAB_PROJECT_SUCCESS,
  START_PROJECT_SUCCESS,
  START_PROJECT_FAILURE,
  STOP_PROJECT_REQUEST,
  STOP_PROJECT_SUCCESS,
  STOP_PROJECT_FAILURE,
  POST_FAVORITEMODEL_REQUEST,
  POST_FAVORITEMODEL_SUCCESS,
  POST_FAVORITEMODEL_FAILURE,
  PUT_PROJECTWEBHOOKS_REQUEST,
  PUT_PROJECTWEBHOOKS_SUCCESS,
  PUT_PROJECTWEBHOOKS_FAILURE,
  UPDATE_SHAREGROUP_REQUEST,
  UPDATE_SHAREGROUP_SUCCESS,
  UPDATE_SHAREGROUP_FAILURE,
  PUT_PROJECTSTATUS_REQUEST,
  PUT_PROJECTSTATUS_SUCCESS,
  PUT_PROJECTSTATUS_FAILURE,
  PUT_PROJECTSERVICEAPP_REQUEST,
  PUT_PROJECTSERVICEAPP_REQUEST_WITHOUT_LOADING,
  PUT_PROJECTSERVICEAPP_SUCCESS,
  PUT_PROJECTSERVICEAPP_FAILURE,
  DELETE_OPSPROJECTS_REQUEST,
  GET_OPSPROJECT_REQUEST,
  GET_OPSPROJECT_SUCCESS,
  POST_OPSPROJECTSELLPRICE_REQUEST,
  POST_OPSPROJECTSELLPRICE_SUCCESS,
  POST_OPSPROJECTSELLPRICE_FAILURE,
  GET_JUPYTERPROJECT_REQUEST,
  GET_MARKETPROJECT_REQUEST,
  SET_OPSPROJECT_LOADING,
  SET_JUPYTERPROJECT_LOADING,
  PUT_MARKETPROJECT_REQUEST,
  PUT_MARKETPROJECT_SUCCESS,
  PUT_MARKETPROJECT_FAILURE,
  GET_DATACONNECTOR_INFO_REQUEST,
  GET_DATACONNECTOR_INFO_SUCCESS,
  GET_DATACONNECTOR_INFO_FAILURE,
} from "redux/reducers/projects.js";
import {
  REQUEST_SUCCESS_MESSAGE,
  REQUEST_ERROR_MESSAGE,
  CLOSE_MODAL_CONTENT,
} from "redux/reducers/messages.js";
import {
  DELETE_JUPYTERPROJECTS_REQUEST,
  GET_RECENTJUPYTERPROJECTS_REQUEST,
  GET_RECENTJUPYTERPROJECTS_SUCCESS,
  GET_RECENTJUPYTERPROJECTS_FAILURE,
  GET_MARKETPROJECT_FAILURE,
  GET_MARKETPROJECT_SUCCESS,
} from "../reducers/projects";
import { renderSnackbarMessage } from "components/Function/globalFunc";

function* getDataconnectortypes() {
  try {
    const result = yield api.getDataconnectortypes();
    yield put({
      type: GET_DATACONNECTORTYPE_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_DATACONNECTORTYPE_FAILURE,
    });
  }
}

function* watchGetDataconnectortypes() {
  yield takeLatest(GET_DATACONNECTORTYPE_REQUEST, getDataconnectortypes);
}

function* getDataconnectors(action) {
  try {
    const result = yield api.getDataconnectors(action.data);
    yield put({
      type: GET_DATACONNECTORS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_DATACONNECTORS_FAILURE,
    });
  }
}
function* watchGetDataconnectors() {
  yield takeLatest(GET_DATACONNECTORS_REQUEST, getDataconnectors);
}

function* getProjects(action) {
  try {
    const result = yield api.getProjects(action.data);
    yield put({
      type: GET_PROJECTS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_PROJECTS_FAILURE,
    });
  }
}
function* watchGetProjects() {
  yield takeLatest(GET_PROJECTS_REQUEST, getProjects);
}

function* getOpsProjects(action) {
  try {
    const result = yield api.getOpsProjects(action.data);
    yield put({
      type: GET_PROJECTS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_PROJECTS_FAILURE,
    });
  }
}
function* watchGetOpsProjects() {
  yield takeLatest(GET_OPSPROJECTS_REQUEST, getOpsProjects);
}

function* getJupyterProjects(action) {
  try {
    const result = yield api.getJupyterProjects(action.data);
    yield put({
      type: GET_JUPYTERPROJECTS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_JUPYTERPROJECTS_FAILURE,
    });
  }
}
function* watchGetJupyterProjects() {
  yield takeLatest(GET_JUPYTERPROJECTS_REQUEST, getJupyterProjects);
}

function* getRecentProjects(action) {
  try {
    const result = yield api.getProjects(action.data);
    yield put({
      type: GET_RECENTPROJECTS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_RECENTPROJECTS_FAILURE,
    });
  }
}
function* watchGetRecentProjects() {
  yield takeLatest(GET_RECENTPROJECTS_REQUEST, getRecentProjects);
}

function* getRecentJupyterProjects(action) {
  try {
    const result = yield api.getRecentJupyterProjects(action.data);
    yield put({
      type: GET_RECENTJUPYTERPROJECTS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_RECENTJUPYTERPROJECTS_FAILURE,
    });
  }
}
function* watchGetRecentJupyterProjects() {
  yield takeLatest(GET_RECENTJUPYTERPROJECTS_REQUEST, getRecentJupyterProjects);
}

function* deleteProjects(action) {
  try {
    const result = yield api.deleteProject(action.data.projects);

    if (
      result.data.failList.length === 0 &&
      result.data.successList.length > 0
    ) {
      yield put({
        type: DELETE_PROJECTS_SUCCESS,
        data: result.data.successList,
      });
      yield put({
        type: REQUEST_SUCCESS_MESSAGE,
        data: "프로젝트가 삭제되었습니다.",
      });
    } else if (
      result.data.failList.length > 0 &&
      result.data.successList.length > 0
    ) {
      yield put({
        type: DELETE_PROJECTS_SUCCESS,
        data: result.data.successList,
      });
      yield put({
        type: REQUEST_SUCCESS_MESSAGE,
        data: "선택한 프로젝트중 일부가 삭제되었습니다.",
      });
    } else if (
      result.data.failList.length > 0 &&
      result.data.successList.length === 0
    ) {
      yield put({
        type: DELETE_PROJECTS_FAILURE,
      });
      yield put({
        type: REQUEST_ERROR_MESSAGE,
        data:
          "선택한 모든 프로젝트가 삭제를 실패했습니다. 프로젝트는 생성한 이후 일정 시간이 경과되어야 삭제 가능합니다.",
      });
    }
    yield put({
      type: GET_PROJECTS_REQUEST,
      data: action.data.sortInfo,
    });
    // yield put({
    //     type: GET_RECENTPROJECTS_REQUEST,
    //     data: {sorting: 'created_at', count: 5, start: 0, tab: 'all', isDesc: true}
    // });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 모델정보를 불러오는데 실패했습니다. 잠시후 다시 시도해주세요."
      ),
    });
    yield put({
      type: DELETE_PROJECTS_FAILURE,
    });
  }
}
function* watchDeleteProjects() {
  yield takeLatest(DELETE_PROJECTS_REQUEST, deleteProjects);
}

function* deleteOpsProjects(action) {
  try {
    yield put({
      type: SET_OPSPROJECT_LOADING,
    });
    const result = yield api.deleteOpsProjects(action.data.projects);
    if (result.data.failList.length + result.data.successList.length == 1) {
      //프로젝트 1개 삭제할 경우
      if (result.data.successList.length > 0) {
        //성공
        yield put({
          type: DELETE_PROJECTS_SUCCESS,
          data: result.data.successList,
        });
        yield put({
          type: REQUEST_SUCCESS_MESSAGE,
          data: "프로젝트가 삭제되었습니다.",
        });
        yield put({
          type: GET_OPSPROJECTS_REQUEST,
          data: action.data.sortInfo,
        });
      } else {
        //실패
        yield put({
          type: REQUEST_ERROR_MESSAGE,
          data: process.env.REACT_APP_ENTERPRISE
            ? "선택한 프로젝트 삭제중 오류가 발생했습니다."
            : "프로젝트 삭제는 생성한 이후 일정 시간 경과 후 가능합니다.",
        });
        yield put({
          type: DELETE_PROJECTS_FAILURE,
        });
        // yield put({
        //   type: GET_OPSPROJECTS_REQUEST,
        //   data: action.data.sortInfo,
        // });
      }
    } else {
      //2개 이상일 경우
      if (
        result.data.successList.length > 0 &&
        result.data.failList.length > 0
      ) {
        //일부 프로젝트는 삭제 실패
        yield put({
          type: DELETE_PROJECTS_SUCCESS,
          data: result.data.successList,
        });
        yield put({
          type: REQUEST_SUCCESS_MESSAGE,
          data: process.env.REACT_APP_ENTERPRISE
            ? "선택한 프로젝트중 일부가 삭제되었습니다."
            : "선택한 프로젝트중 일부가 삭제되었습니다. 프로젝트는 생성한 이후 일정 시간이 경과되어야 삭제 가능합니다.",
        });
        yield put({
          type: GET_OPSPROJECTS_REQUEST,
          data: action.data.sortInfo,
        });
      } else if (result.data.successList.length > 0) {
        //전체 삭제 성공
        yield put({
          type: DELETE_PROJECTS_SUCCESS,
          data: result.data.successList,
        });
        yield put({
          type: REQUEST_SUCCESS_MESSAGE,
          data: "선택한 모든 프로젝트가 삭제되었습니다.",
        });
        yield put({
          type: GET_OPSPROJECTS_REQUEST,
          data: action.data.sortInfo,
        });
      } else {
        //전체 삭제 실패
        yield put({
          type: REQUEST_ERROR_MESSAGE,
          data: process.env.REACT_APP_ENTERPRISE
            ? "선택한 모든 프로젝트가 삭제중 오류가 발생했습니다."
            : "선택한 모든 프로젝트가 삭제를 실패했습니다. 프로젝트는 생성한 이후 일정 시간이 경과되어야 삭제 가능합니다.",
        });
        yield put({
          type: DELETE_PROJECTS_FAILURE,
        });
        yield put({
          type: GET_OPSPROJECTS_REQUEST,
          data: action.data.sortInfo,
        });
      }
    }

    /////////
    // yield put({
    //   type: DELETE_PROJECTS_SUCCESS,
    //   data: result.data.successList,
    // });
    // yield put({
    //   type: REQUEST_SUCCESS_MESSAGE,
    //   data: "프로젝트가 삭제되었습니다.",
    // });
    // yield put({
    //   type: GET_OPSPROJECTS_REQUEST,
    //   data: action.data.sortInfo,
    // });
    // yield put({
    //     type: GET_RECENTPROJECTS_REQUEST,
    //     data: {sorting: 'created_at', count: 5, start: 0, tab: 'all', isDesc: true}
    // });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 프로젝트 삭제중 오류가 발생하였습니다. 다시 시도해주세요."
      ),
    });
    yield put({
      type: DELETE_PROJECTS_FAILURE,
    });
  }
}
function* watchDeleteOpsProjects() {
  yield takeLatest(DELETE_OPSPROJECTS_REQUEST, deleteOpsProjects);
}

function* deleteJupyterProjects(action) {
  try {
    yield put({
      type: SET_JUPYTERPROJECT_LOADING,
    });
    const result = yield api.deleteJupyterProjects(action.data.projects);
    if (result.data.failList.length + result.data.successList.length == 1) {
      //프로젝트 1개 삭제할 경우
      if (result.data.successList.length > 0) {
        //성공
        yield put({
          type: DELETE_PROJECTS_SUCCESS,
          data: result.data.successList,
        });
        yield put({
          type: REQUEST_SUCCESS_MESSAGE,
          data: process.env.REACT_APP_ENTERPRISE
            ? "프로젝트가 삭제되었습니다. 컴퓨터 재시작 시 적용됩니다."
            : "프로젝트가 삭제되었습니다.",
        });
        yield put({
          type: GET_JUPYTERPROJECTS_REQUEST,
          data: action.data.sortInfo,
        });
      } else {
        //실패
        yield put({
          type: REQUEST_ERROR_MESSAGE,
          data: process.env.REACT_APP_ENTERPRISE
            ? "선택한 프로젝트 삭제중 오류가 발생했습니다."
            : "프로젝트 삭제는 생성한 이후 일정 시간 경과 후 가능합니다.",
        });
        yield put({
          type: DELETE_PROJECTS_FAILURE,
        });
        yield put({
          type: GET_JUPYTERPROJECTS_REQUEST,
          data: action.data.sortInfo,
        });
      }
    } else {
      //2개 이상일 경우
      if (
        result.data.successList.length > 0 &&
        result.data.failList.length > 0
      ) {
        //일부 프로젝트는 삭제 실패
        yield put({
          type: DELETE_PROJECTS_SUCCESS,
          data: result.data.successList,
        });
        yield put({
          type: REQUEST_SUCCESS_MESSAGE,
          data: process.env.REACT_APP_ENTERPRISE
            ? "선택한 프로젝트중 일부가 삭제되었습니다."
            : "선택한 프로젝트중 일부가 삭제되었습니다. 프로젝트는 생성한 이후 일정 시간이 경과되어야 삭제 가능합니다.",
        });
        yield put({
          type: GET_JUPYTERPROJECTS_REQUEST,
          data: action.data.sortInfo,
        });
      } else if (result.data.successList.length > 0) {
        //전체 삭제 성공
        yield put({
          type: DELETE_PROJECTS_SUCCESS,
          data: result.data.successList,
        });
        yield put({
          type: REQUEST_SUCCESS_MESSAGE,
          data: process.env.REACT_APP_ENTERPRISE
            ? "선택한 모든 프로젝트가 삭제되었습니다. 컴퓨터 재시작 시 적용됩니다."
            : "선택한 모든 프로젝트가 삭제되었습니다.",
        });
        yield put({
          type: GET_JUPYTERPROJECTS_REQUEST,
          data: action.data.sortInfo,
        });
      } else {
        //전체 삭제 실패
        yield put({
          type: REQUEST_ERROR_MESSAGE,
          data: process.env.REACT_APP_ENTERPRISE
            ? "선택한 모든 프로젝트가 삭제중 오류가 발생했습니다."
            : "선택한 모든 프로젝트가 삭제를 실패했습니다. 프로젝트는 생성한 이후 일정 시간이 경과되어야 삭제 가능합니다.",
        });
        yield put({
          type: DELETE_PROJECTS_FAILURE,
        });
        yield put({
          type: GET_JUPYTERPROJECTS_REQUEST,
          data: action.data.sortInfo,
        });
      }
    }
    // yield put({
    //     type: GET_RECENTPROJECTS_REQUEST,
    //     data: {sorting: 'created_at', count: 5, start: 0, tab: 'all', isDesc: true}
    // });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 프로젝트 삭제중 오류가 발생하였습니다. 다시 시도해주세요."
      ),
    });
    yield put({
      type: DELETE_PROJECTS_FAILURE,
    });
  }
}
function* watchDeleteJupyterProjects() {
  yield takeLatest(DELETE_JUPYTERPROJECTS_REQUEST, deleteJupyterProjects);
}

function* deleteDataConnectors(action) {
  try {
    const result = yield api.deleteDataconnector(action.data.connectors);
    yield put({
      type: DELETE_DATACONNECTORS_SUCCESS,
      data: result.data.successList,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "데이터커넥터가 삭제되었습니다.",
    });
    yield put({
      type: GET_DATACONNECTORS_REQUEST,
      data: action.data.sortInfo,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 데이터커넥터 삭제중 오류가 발생하였습니다. 다시 시도해주세요."
      ),
    });
    yield put({
      type: DELETE_DATACONNECTORS_FAILURE,
    });
  }
}
function* watchDeleteDataConnectors() {
  yield takeLatest(DELETE_DATACONNECTORS_REQUEST, deleteDataConnectors);
}

function* startProjectFunc(data) {
  try {
    const result = yield api.postProjectFromDataconnectors({
      dataconnectors: [data.id],
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "데이터커넥터 등록후 프로젝트가 생성되었습니다.",
    });
    yield (window.location.href = `/admin/train/` + result.data.id);
  } catch (err) {
    if (JSON.stringify(err).indexOf("507") > -1) {
      yield put({
        type: REQUEST_ERROR_MESSAGE,
        data: "데이터 중첩 개수 한도 초과입니다.",
      });
    } else {
      yield put({
        type: REQUEST_ERROR_MESSAGE,
        data: renderSnackbarMessage(
          "error",
          err.response,
          "죄송합니다. 데이터커넥터 등록후 프로젝트 생성중 오류가 발생하였습니다. 다시 시도해주세요."
        ),
      });
      yield put({
        type: POST_DATACONNECTOR_SUCCESS,
        data: data,
      });
      yield put({
        type: CLOSE_MODAL_CONTENT,
      });
    }
  }
}

function* postDataConnector(action) {
  try {
    const result = yield api.postDataconnector(action.data.dataconnectorInfo);
    if (action.data.isProjectStartAtOnce) {
      yield startProjectFunc(result.data);
    } else {
      yield put({
        type: POST_DATACONNECTOR_SUCCESS,
        data: result.data,
      });
      yield put({
        type: REQUEST_SUCCESS_MESSAGE,
        data: "데이터커넥터가 등록되었습니다.",
      });
      yield put({
        type: CLOSE_MODAL_CONTENT,
      });
    }
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 데이터커넥터 등록중 오류가 발생하였습니다. 다시 시도해주세요."
      ),
    });
    yield put({
      type: POST_DATACONNECTOR_FAILURE,
    });
  }
}
function* watchPostDataConnector() {
  yield takeLatest(POST_DATACONNECTOR_REQUEST, postDataConnector);
}

function* postConnectorWithAuthFile(action) {
  try {
    const result = yield api.postDataconnectorWithAuthFile(
      action.data.file,
      action.data.dataconnectorInfo
    );
    if (action.data.isProjectStartAtOnce) {
      yield startProjectFunc(result.data);
    } else {
      yield put({
        type: POST_DATACONNECTOR_SUCCESS,
        data: result.data,
      });
      yield put({
        type: REQUEST_SUCCESS_MESSAGE,
        data: "데이터커넥터가 등록되었습니다.",
      });
      yield put({
        type: CLOSE_MODAL_CONTENT,
      });
    }
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 데이터커넥터 등록중 오류가 발생하였습니다. 입력 정보를 확인해주세요."
      ),
    });
    yield put({
      type: POST_DATACONNECTOR_FAILURE,
    });
  }
}
function* watchPostConnectorWithAuthFile() {
  yield takeLatest(
    POST_CONNECTORWITHAUTHFILE_REQUEST,
    postConnectorWithAuthFile
  );
}

function* postPurchaseModel(action) {
  try {
    const result = yield api.postPurchaseModel(action.data);
    yield put({
      type: POST_PURCHASEMODEL_SUCCESS,
      data: result.data,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "모델 사용권을 구매하였습니다.",
    });
    // yield put({
    //   type: CLOSE_MODAL_CONTENT,
    // });
  } catch (err) {
    if (
      process.env.REACT_APP_ENTERPRISE !== "true" &&
      err.response &&
      err.response.status === 402
    ) {
      window.location.href = "/admin/setting/payment/?cardRequest=true";
      return;
    }
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류 발생으로 인하여 모델 사용권을 구매하지 못하였습니다."
      ),
    });
    yield put({
      type: POST_PURCHASEMODEL_FAILURE,
    });
  }
}
function* watchPostPurchaseModel() {
  yield takeLatest(POST_PURCHASEMODEL_REQUEST, postPurchaseModel);
}

function* postOpsProjectSellPrice(action) {
  try {
    const result = yield api.postOpsProjectSellPrice(action.data);
    yield put({
      type: POST_OPSPROJECTSELLPRICE_SUCCESS,
      data: result.data,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "판매요청이 등록되었습니다.",
    });
    yield put({
      type: CLOSE_MODAL_CONTENT,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 판매요청 등록중 오류가 발생하였습니다. 입력 정보를 확인해주세요."
      ),
    });
    yield put({
      type: POST_OPSPROJECTSELLPRICE_FAILURE,
    });
  }
}
function* watchPostOpsProjectSellPrice() {
  yield takeLatest(POST_OPSPROJECTSELLPRICE_REQUEST, postOpsProjectSellPrice);
}

function* postConnectorWithFile(action) {
  try {
    const result = yield api.postDataconnectorWithFile(
      action.data.file,
      action.data.dataconnectorInfo
    );

    if (action.data.isProjectStartAtOnce) {
      yield startProjectFunc(result.data);
    } else {
      yield put({
        type: POST_DATACONNECTOR_SUCCESS,
        data: result.data,
      });
      yield put({
        type: REQUEST_SUCCESS_MESSAGE,
        data: "데이터커넥터가 등록되었습니다.",
      });
      yield put({
        type: CLOSE_MODAL_CONTENT,
      });
    }
  } catch (err) {
    if (
      process.env.REACT_APP_ENTERPRISE !== "true" &&
      err.response &&
      err.response.status === 402
    ) {
      window.location.href = "/admin/setting/payment/?cardRequest=true";
      return;
    }
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 데이터커넥터 등록중 오류가 발생하였습니다. 다시 시도해주세요."
      ),
    });
    yield put({
      type: POST_DATACONNECTOR_FAILURE,
    });
  }
}
function* watchPostConnectorWithFile() {
  yield takeLatest(POST_CONNECTORWITHFILE_REQUEST, postConnectorWithFile);
}

function* getProject(action) {
  try {
    const result = yield api.getProject(action.data);
    yield put({
      type: GET_PROJECT_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류로 인하여, 샘플 정보를 가져오는데 실패하였습니다."
      ),
    });
    yield put({
      type: GET_PROJECT_FAILURE,
    });
  }
}
function* watchGetProject() {
  yield takeLatest(GET_PROJECT_REQUEST, getProject);
}

function* getOpsProject(action) {
  try {
    const result = yield api.getOpsProject(action.data);
    yield put({
      type: GET_OPSPROJECT_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "프로젝트 정보 갱신중",
      // data: err.response.data.message
      //   ? err.response.data.message
      //   : "죄송합니다. 일시적인 오류로 인하여, 샘플 정보를 가져오는데 실패하였습니다.",
    });
    yield put({
      type: GET_PROJECT_FAILURE,
    });
  }
}
function* watchGetOpsProject() {
  yield takeLatest(GET_OPSPROJECT_REQUEST, getOpsProject);
}

function* getMarketProject(action) {
  try {
    const result = yield api.getMarketProject(action.data);
    yield put({
      type: GET_PROJECT_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류로 인하여, 샘플 정보를 가져오는데 실패하였습니다."
      ),
    });
    yield put({
      type: GET_PROJECT_FAILURE,
    });
  }
}
function* watchGetMarketProject() {
  yield takeLatest(GET_MARKETPROJECT_REQUEST, getMarketProject);
}

function* getJupyterProject(action) {
  try {
    const result = yield api.getJupyterProject(action.data);
    yield put({
      type: GET_PROJECT_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "프로젝트 정보 갱신중",
      // type: REQUEST_ERROR_MESSAGE,
      // data: err.response.data.message
      //   ? err.response.data.message
      //   : "죄송합니다. 일시적인 오류로 인하여, 샘플 정보를 가져오는데 실패하였습니다.",
    });
    yield put({
      type: GET_PROJECT_FAILURE,
    });
  }
}
function* watchGetJupyterProject() {
  yield takeLatest(GET_JUPYTERPROJECT_REQUEST, getJupyterProject);
}

function* putProjectName(action) {
  try {
    const projectInfo = { projectName: action.data.name };
    const result = yield api.updateProject(projectInfo, action.data.id);
    yield put({
      type: PUT_PROJECTNAME_SUCCESS,
      data: action.data.name,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "프로젝트명이 정상적으로 변경되었습니다.",
    });
    // yield put({
    //     type: GET_RECENTPROJECTS_REQUEST,
    //     data: {sorting: 'created_at', count: 5, start: 0, tab: 'all', isDesc: true}
    // });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류로 인하여, 프로젝트명 변경에 실패하였습니다."
      ),
    });
    yield put({
      type: PUT_PROJECTNAME_FAILURE,
    });
  }
}
function* watchPutProjectName() {
  yield takeLatest(PUT_PROJECTNAME_REQUEST, putProjectName);
}

function* putProjectDescription(action) {
  try {
    const projectInfo = { description: action.data.description };
    const result = yield api.updateProject(projectInfo, action.data.id);
    yield put({
      type: PUT_PROJECTDESCRIPTION_SUCCESS,
      data: action.data.description,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "프로젝트 설명이 정상적으로 변경되었습니다.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류로 인하여, 프로젝트 설명 변경에 실패하였습니다."
      ),
    });
    yield put({
      type: PUT_PROJECTDESCRIPTION_FAILURE,
    });
  }
}
function* watchPutProjectDescription() {
  yield takeLatest(PUT_PROJECTDESCRIPTION_REQUEST, putProjectDescription);
}

function* getAsyncProject(action) {
  const originalProjects = action.data.originalProjects;
  let modelsDict = {};
  originalProjects.models.forEach((model) => {
    modelsDict[model.id] = model;
  });
  try {
    const result = yield api.getProjectsAsync(action.data.id);
    let isUpdated = false;
    if (originalProjects.status !== result.data.status) isUpdated = true;
    if (originalProjects.models.length !== result.data.models.length)
      isUpdated = true;
    if (!isUpdated) {
      result.data.models.forEach((model) => {
        if (model.status !== modelsDict[model.id].status) isUpdated = true;
      });
    }
    if (isUpdated) {
      yield put({
        type: GET_ASYNCPROJECT_SUCCESS,
        data: result.data,
      });
    }
  } catch (err) {
    yield put({
      type: GET_ASYNCPROJECT_FAILURE,
    });
  }
}
function* watchGetAsyncProject() {
  yield takeLatest(GET_ASYNCPROJECT_REQUEST, getAsyncProject);
}

function* stopProject(action) {
  try {
    const project = {
      id: action.data.id,
      // isStart: false,
      status: 0,
      priority_flag: false,
      option: action.data.option,
      statusText: "중단",
    };
    const result = yield api.putProject(project);
    yield put({
      type: STOP_PROJECT_SUCCESS,
      data: result.data,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "프로젝트가 성공적으로 중단되었습니다.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류가 발생하였습니다. AI개발을 다시 중단해주세요."
      ),
    });
    yield put({
      type: STOP_PROJECT_FAILURE,
    });
  }
}
function* watchStopProject() {
  yield takeLatest(STOP_PROJECT_REQUEST, stopProject);
}

function* startProject(action) {
  try {
    const result = yield api.putProject(action.data);
    if (action.data.option === "colab") {
      yield put({
        type: START_COLAB_PROJECT_SUCCESS,
        data: result.data,
      });
    } else {
      yield put({
        type: START_PROJECT_SUCCESS,
        data: result.data,
      });
    }
    // yield put({
    //     type: GET_RECENTPROJECTS_REQUEST,
    //     data: {sorting: 'created_at', count: 5, start: 0, tab: 'all', isDesc: true}
    // });
    if (action.data.option !== "colab") {
      yield put({
        type: REQUEST_SUCCESS_MESSAGE,
        data:
          "AI 개발이 시작되었습니다. 개발이 완료되면 이메일로 알려드리겠습니다.",
      });
    }
  } catch (err) {
    yield put({
      type: START_PROJECT_FAILURE,
    });
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류가 발생하였습니다. AI개발을 다시 시작해주세요."
      ),
    });
  }
}
function* watchStartProject() {
  yield takeLatest(START_PROJECT_REQUEST, startProject);
}

function* postFavoriteModel(action) {
  try {
    const result = yield api.setFavoriteModel(
      action.data.isFavorite,
      action.data.id
    );
    yield put({
      type: POST_FAVORITEMODEL_SUCCESS,
      data: action.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 즐겨찾기 추가에 실패했습니다. 잠시후 다시 시도해주세요."
      ),
    });
    yield put({
      type: POST_FAVORITEMODEL_FAILURE,
    });
  }
}
function* watchPostFavoriteModel() {
  yield takeLatest(POST_FAVORITEMODEL_REQUEST, postFavoriteModel);
}

function* putProjectWebhooks(action) {
  try {
    const projectInfo = {
      webhookURL: action.data.webhookURL,
      webhookMethod: action.data.webhookMethod,
    };
    const result = yield api.updateProject(projectInfo, action.data.id);
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "웹훅 정보가 정상적으로 변경되었습니다.",
    });
    yield put({
      type: PUT_PROJECTWEBHOOKS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류가 발생하였습니다. 다시 시도해주세요."
      ),
    });
    yield put({
      type: PUT_PROJECTWEBHOOKS_FAILURE,
    });
  }
}
function* watchPutProjectWebhooks() {
  yield takeLatest(PUT_PROJECTWEBHOOKS_REQUEST, putProjectWebhooks);
}

function* putProjectStatus(action) {
  try {
    const projectInfo = { priority_flag: action.data.priority_flag };
    const result = yield api.updateProject(projectInfo, action.data.projectId);
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: action.data.priority_flag
        ? "프로젝트가 우선적으로 학습될 예정입니다."
        : "프로젝트 우선적 학습을 취소하였습니다.",
    });
    yield put({
      type: PUT_PROJECTSTATUS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류가 발생하였습니다. 다시 시도해주세요."
      ),
    });
    yield put({
      type: PUT_PROJECTSTATUS_FAILURE,
    });
  }
}
function* watchPutProjectStatus() {
  yield takeLatest(PUT_PROJECTSTATUS_REQUEST, putProjectStatus);
}

function* updateShareGroup(action) {
  try {
    const result = yield api.updateShareGroup(action.data);
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: action.data.isUpdate
        ? "프로젝트 공유를 하였습니다."
        : "프로젝트 공유를 취소했습니다.",
    });
    yield put({
      type: UPDATE_SHAREGROUP_SUCCESS,
      data: result.data.sharedgroup,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류가 발생하였습니다. 다시 시도해주세요."
      ),
    });
    yield put({
      type: UPDATE_SHAREGROUP_FAILURE,
    });
  }
}
function* watchUpdateShareGroup() {
  yield takeLatest(UPDATE_SHAREGROUP_REQUEST, updateShareGroup);
}

function* putProjectServiceApp(action) {
  try {
    const result = yield api.updateProject(
      action.data.projectInfo,
      action.data.projectId
    );
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "서비스앱 파라미터가 저장되었습니다.",
    });
    yield put({
      type: PUT_PROJECTSERVICEAPP_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류가 발생하였습니다. 다시 시도해주세요."
      ),
    });
    yield put({
      type: PUT_PROJECTSERVICEAPP_FAILURE,
    });
  }
}
function* watchPutProjectServiceApp() {
  yield takeLatest(PUT_PROJECTSERVICEAPP_REQUEST, putProjectServiceApp);
  yield takeLatest(
    PUT_PROJECTSERVICEAPP_REQUEST_WITHOUT_LOADING,
    putProjectServiceApp
  );
}

function* putMarketProject(action) {
  try {
    const result = yield api.updateMarketProject(
      action.data.id,
      action.data.data.params
    );
    yield put({
      type: PUT_MARKETPROJECT_SUCCESS,
      data: action.data.data,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "프로젝트 정보가 정상적으로 변경되었습니다.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류 발생으로 프로젝트 정보 변경에 실패하였습니다."
      ),
    });
    yield put({
      type: PUT_MARKETPROJECT_FAILURE,
    });
  }
}
function* watchputMarketProject() {
  yield takeLatest(PUT_MARKETPROJECT_REQUEST, putMarketProject);
}

function* getDataconnectorInfo(action) {
  try {
    const result = yield api.getDataconnectorInfo(action.data.id);
    yield put({
      type: GET_DATACONNECTOR_INFO_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    const { history } = action.data;

    yield put({
      type: GET_DATACONNECTOR_INFO_FAILURE,
    });
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "죄송합니다. 일시적인 오류 발생으로 데이터커넥터 정보 조회에 실패하였습니다."
      ),
    });

    history.goBack();
  }
}

function* watchGetDataconnectorInfo() {
  yield takeLatest(GET_DATACONNECTOR_INFO_REQUEST, getDataconnectorInfo);
}

export default function* projectsSaga() {
  yield all([
    fork(watchGetDataconnectortypes),
    fork(watchGetDataconnectors),
    fork(watchGetProjects),
    fork(watchGetJupyterProjects),
    fork(watchGetOpsProjects),
    fork(watchGetRecentProjects),
    fork(watchGetRecentJupyterProjects),
    fork(watchDeleteProjects),
    fork(watchDeleteOpsProjects),
    fork(watchDeleteJupyterProjects),
    fork(watchDeleteDataConnectors),
    fork(watchPostDataConnector),
    fork(watchPostConnectorWithAuthFile),
    fork(watchPostConnectorWithFile),
    fork(watchPostPurchaseModel),
    fork(watchPostOpsProjectSellPrice),
    fork(watchGetProject),
    fork(watchGetOpsProject),
    fork(watchGetJupyterProject),
    fork(watchGetMarketProject),
    fork(watchPutProjectName),
    fork(watchPutProjectDescription),
    fork(watchGetAsyncProject),
    fork(watchStartProject),
    fork(watchStopProject),
    fork(watchPostFavoriteModel),
    fork(watchPutProjectWebhooks),
    fork(watchUpdateShareGroup),
    fork(watchPutProjectStatus),
    fork(watchPutProjectServiceApp),
    fork(watchputMarketProject),
    fork(watchGetDataconnectorInfo),
  ]);
}
