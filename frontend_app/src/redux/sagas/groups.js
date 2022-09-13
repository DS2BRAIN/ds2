import { put, takeLatest, all, call, fork } from "redux-saga/effects";
import * as api from "controller/api.js";
import {
  GET_GROUPS_REQUEST,
  GET_GROUPS_SUCCESS,
  GET_GROUPS_FAILURE,
  POST_GROUP_REQUEST,
  POST_GROUP_SUCCESS,
  POST_GROUP_FAILURE,
  POST_MEMBER_REQUEST,
  POST_MEMBER_SUCCESS,
  POST_MEMBER_FAILURE,
  POST_ACCEPTGROUP_REQUEST,
  POST_ACCEPTGROUP_SUCCESS,
  POST_ACCEPTGROUP_FAILURE,
  DELETE_MEMBER_REQUEST,
  DELETE_MEMBER_SUCCESS,
  DELETE_MEMBER_FAILURE,
  DELETE_GROUP_REQUEST,
  DELETE_GROUP_SUCCESS,
  DELETE_GROUP_FAILURE,
  LEAVE_GROUP_REQUEST,
  LEAVE_GROUP_SUCCESS,
  LEAVE_GROUP_FAILURE,
  PUT_GROUP_REQUEST,
  PUT_GROUP_SUCCESS,
  PUT_GROUP_FAILURE,
} from "redux/reducers/groups.js";
import {
  REQUEST_SUCCESS_MESSAGE,
  REQUEST_ERROR_MESSAGE,
  CLOSE_MODAL_CONTENT,
} from "redux/reducers/messages.js";
import Cookies from "helpers/Cookies";
import { renderSnackbarMessage } from "components/Function/globalFunc";

function* getGroupsData() {
  try {
    const result = yield api.getGroups();
    yield put({
      type: GET_GROUPS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage("error", err.response),
    });
    yield put({
      type: GET_GROUPS_FAILURE,
    });
  }
}
function* watchGetGroups() {
  yield takeLatest(GET_GROUPS_REQUEST, getGroupsData);
}

function* postGroup(action) {
  try {
    const result = yield api.postGroup(action.data);
    yield put({
      type: POST_GROUP_SUCCESS,
      data: result.data,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "Group registered.",
    });
    yield put({
      type: GET_GROUPS_REQUEST,
    });
    yield put({
      type: CLOSE_MODAL_CONTENT,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage("error", err.response),
    });
    yield put({
      type: POST_GROUP_FAILURE,
    });
  }
}
function* watchPostGroup() {
  yield takeLatest(POST_GROUP_REQUEST, postGroup);
}

function* postMember(action) {
  try {
    const result = yield api.postMember(
      action.data.groupId,
      action.data.memberEmail,
      action.data.lang
    );
    yield put({
      type: POST_MEMBER_SUCCESS,
      data: result.data,
    });
    yield put({
      type: GET_GROUPS_REQUEST,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "Member request sent.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage("error", err.response),
    });
    yield put({
      type: POST_MEMBER_FAILURE,
    });
  }
}
function* watchPostMember() {
  yield takeLatest(POST_MEMBER_REQUEST, postMember);
}

function* postAcceptGroup(action) {
  try {
    const result = yield api.postAcceptGroup(
      action.data.groupId,
      action.data.accept
    );
    yield put({
      type: POST_ACCEPTGROUP_SUCCESS,
      data: result.data,
    });
    yield put({
      type: GET_GROUPS_REQUEST,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: action.data.accept
        ? "Group invitation accepted."
        : "Group invitation declined.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage("error", err.response),
    });
    yield put({
      type: POST_ACCEPTGROUP_FAILURE,
    });
  }
}
function* watchAccptGroup() {
  yield takeLatest(POST_ACCEPTGROUP_REQUEST, postAcceptGroup);
}

function* deleteMember(action) {
  try {
    const result = yield api.deleteMember(
      action.data.banUserId,
      action.data.groupId
    );
    yield put({
      type: DELETE_MEMBER_SUCCESS,
      data: result.data,
    });
    yield put({
      type: GET_GROUPS_REQUEST,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "Member deleted.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage("error", err.response),
    });
    yield put({
      type: DELETE_MEMBER_FAILURE,
    });
  }
}
function* watchDeleteMember() {
  yield takeLatest(DELETE_MEMBER_REQUEST, deleteMember);
}

function* leaveGroup(action) {
  try {
    const result = yield api.leaveGroup(action.data);
    yield put({
      type: LEAVE_GROUP_SUCCESS,
      data: result.data,
    });
    yield put({
      type: GET_GROUPS_REQUEST,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "You have left the group.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage("error", err.response),
    });
    yield put({
      type: LEAVE_GROUP_FAILURE,
    });
  }
}
function* watchLeaveGroup() {
  yield takeLatest(LEAVE_GROUP_REQUEST, leaveGroup);
}

function* deleteGroup(action) {
  try {
    const result = yield api.deleteGroup(action.data);
    yield put({
      type: DELETE_GROUP_SUCCESS,
      data: result.data,
    });
    yield put({
      type: GET_GROUPS_REQUEST,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "Group deleted.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage("error", err.response),
    });
    yield put({
      type: DELETE_GROUP_FAILURE,
    });
  }
}
function* watchDeleteGroup() {
  yield takeLatest(DELETE_GROUP_REQUEST, deleteGroup);
}

function* putGroup(action) {
  try {
    const result = yield api.putGroup(
      action.data.groupName,
      action.data.groupId
    );
    yield put({
      type: PUT_GROUP_SUCCESS,
      data: result.data,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "Group information edited.",
    });
    yield put({
      type: GET_GROUPS_REQUEST,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage("error", err.response),
    });
    yield put({
      type: PUT_GROUP_FAILURE,
    });
  }
}
function* watchPutGroup() {
  yield takeLatest(PUT_GROUP_REQUEST, putGroup);
}

export default function* groupsSaga() {
  yield all([
    fork(watchGetGroups),
    fork(watchPostGroup),
    fork(watchPostMember),
    fork(watchAccptGroup),
    fork(watchDeleteMember),
    fork(watchDeleteGroup),
    fork(watchLeaveGroup),
    fork(watchPutGroup),
  ]);
}
