import { put, takeLatest, all, call, fork } from "redux-saga/effects";
import * as api from "controller/api.js";
import {
  GET_MODEL_REQUEST,
  GET_MODEL_SUCCESS,
  GET_MODEL_FAILURE,
  GET_OPSMODEL_REQUEST,
  GET_MARKETMODEL_REQUEST,
} from "redux/reducers/models.js";
import {
  REQUEST_SUCCESS_MESSAGE,
  REQUEST_ERROR_MESSAGE,
  CLOSE_MODAL_CONTENT,
} from "redux/reducers/messages.js";
import { renderSnackbarMessage } from "components/Function/globalFunc";

function* getModel(action) {
  try {
    const result = yield api.getModelsInfoDetail(action.data);
    yield put({
      type: GET_MODEL_SUCCESS,
      data: result,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "The model information could not be retrieved. Please try again in a moment."
      ),
    });
    yield put({
      type: GET_MODEL_FAILURE,
    });
  }
}

function* getOpsModel(action) {
  try {
    const result = yield api.getOPSModelsInfoDetail(action.data);
    yield put({
      type: GET_MODEL_SUCCESS,
      data: result,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "The model information could not be retrieved. Please try again in a moment."
      ),
    });
    yield put({
      type: GET_MODEL_FAILURE,
    });
  }
}

function* getMarketModel(action) {
  try {
    const result = yield api.getMarketModelsInfoDetail(action.data);
    yield put({
      type: GET_MODEL_SUCCESS,
      data: result,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "The model information could not be retrieved. Please try again in a moment."
      ),
    });
    yield put({
      type: GET_MODEL_FAILURE,
    });
  }
}

function* watchGetModel() {
  yield takeLatest(GET_MODEL_REQUEST, getModel);
}
function* watchGetOpsModel() {
  yield takeLatest(GET_OPSMODEL_REQUEST, getOpsModel);
}
function* watchGetMarketModel() {
  yield takeLatest(GET_MARKETMODEL_REQUEST, getMarketModel);
}

export default function* modelsSaga() {
  yield all([
    fork(watchGetModel),
    fork(watchGetOpsModel),
    fork(watchGetMarketModel),
  ]);
}
