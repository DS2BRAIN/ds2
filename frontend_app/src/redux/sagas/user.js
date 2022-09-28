import { put, takeLatest, all, call, fork } from "redux-saga/effects";
import * as api from "controller/api.js";
import {
  GET_MAINPAGE_REQUEST,
  GET_MAINPAGE_SUCCESS,
  GET_MAINPAGE_FAILURE,
  GET_ME_REQUEST,
  GET_ME_SUCCESS,
  GET_ME_FAILURE,
  GET_CARD_REQUEST,
  GET_CARD_SUCCESS,
  GET_CARD_FAILURE,
  GET_ALLUSAGEPLAN_REQUEST,
  GET_ALLUSAGEPLAN_SUCCESS,
  GET_ALLUSAGEPLAN_FAILURE,
  GET_CATEGORY_REQUEST,
  GET_CATEGORY_SUCCESS,
  GET_CATEGORY_FAILURE,
  POST_APPCODE_REQUEST,
  POST_APPCODE_SUCCESS,
  POST_APPCODE_FAILURE,
  POST_RESETPASSWORD_REQUEST,
  POST_RESETPASSWORD_SUCCESS,
  POST_RESETPASSWORD_FAILURE,
  POST_WITHDRAW_REQUEST,
  POST_WITHDRAW_SUCCESS,
  POST_WITHDRAW_FAILURE,
  POST_COMPANYLOGO_REQUEST,
  POST_COMPANYLOGO_SUCCESS,
  POST_COMPANYLOGO_FAILURE,
  DELETE_COMPANYLOGO_REQUEST,
  DELETE_COMPANYLOGO_SUCCESS,
  DELETE_COMPANYLOGO_FAILURE,
  PUT_USER_REQUEST,
  PUT_USER_REQUEST_WITHOUT_MESSAGE,
  PUT_USER_SUCCESS,
  PUT_USER_FAILURE,
  POST_CANCELPLAN_REQUEST,
  POST_CANCELPLAN_SUCCESS,
  POST_CANCELPLAN_FAILURE,
  POST_CANCELNEXTPLAN_REQUEST,
  POST_CANCELNEXTPLAN_SUCCESS,
  POST_CANCELNEXTPLAN_FAILURE,
  POST_CHECKASYNCTASKS_REQUEST,
  POST_CHECKASYNCTASKS_SUCCESS,
  POST_CHECKASYNCTASKS_FAILURE,
  POST_CHECKALLASYNCTASKS_REQUEST,
  POST_CHECKALLASYNCTASKS_SUCCESS,
  POST_CHECKALLASYNCTASKS_FAILURE,
  GET_ASYNCTASKS_REQUEST,
  GET_ASYNCTASKS_SUCCESS,
  GET_ASYNCTASKS_FAILURE,
  GET_USERCOUNT_REQUEST,
  GET_USERCOUNT_SUCCESS,
  GET_USERCOUNT_FAILURE,
  GET_ALLWORKAGE_REQUEST,
  GET_ALLWORKAGE_SUCCESS,
  GET_ALLWORKAGE_FAILURE,
  GET_EXTERNALAI_REQUEST,
  GET_EXTERNALAI_SUCCESS,
  GET_EXTERNALAI_FAILURE,
} from "redux/reducers/user.js";
import { GET_MEFORPROJECTS_SUCCESS } from "redux/reducers/projects.js";
import {
  REQUEST_SUCCESS_MESSAGE,
  REQUEST_ERROR_MESSAGE,
  CLOSE_MODAL_CONTENT,
} from "redux/reducers/messages.js";
import { tempUsagePlans } from "assets/usageplans.js";
import Cookies from "helpers/Cookies";
import { renderSnackbarMessage } from "components/Function/globalFunc";

function* getMainPageData() {
  try {
    const result = yield api.getMainPageData();
    yield put({
      type: GET_MAINPAGE_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "A temporary error has occurred."
      ),
    });
    yield put({
      type: GET_MAINPAGE_FAILURE,
    });
  }
}
function* watchGetMainPage() {
  yield takeLatest(GET_MAINPAGE_REQUEST, getMainPageData);
}

function* getMeData() {
  try {
    const result = yield api.getUserData();
    yield put({
      type: GET_ME_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "A temporary error has occurred."
      ),
    });
    yield put({
      type: GET_ME_FAILURE,
    });
  }
}
function* getCardData() {
  if (process.env.REACT_APP_ENTERPRISE !== "true") {
    try {
      const result = yield api.getPgRegistration();
      const cardInfo = result.data;
      yield put({
        type: GET_CARD_SUCCESS,
        data: cardInfo
          ? { cardName: cardInfo.CardNo, created: cardInfo.CreatedAt }
          : null,
      });
    } catch (err) {
      yield put({
        type: REQUEST_ERROR_MESSAGE,
        data: renderSnackbarMessage(
          "error",
          err.response,
          "Card information retrieval failed due to a temporary error."
        ),
      });
      yield put({
        type: GET_CARD_FAILURE,
      });
    }
  }
}
function* getAllUsagePlanData() {
  try {
    const result = yield api.getUsagePlans();
    yield put({
      type: GET_ALLUSAGEPLAN_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_ALLUSAGEPLAN_FAILURE,
      data: tempUsagePlans,
    });
  }
}
function* getCategoryData() {
  try {
    const result = yield api.getProjectCategories();
    yield put({
      type: GET_CATEGORY_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_CATEGORY_FAILURE,
    });
  }
}

function* watchGetMe() {
  yield takeLatest(GET_ME_REQUEST, getMeData);
  yield takeLatest(GET_CARD_REQUEST, getCardData);
  yield takeLatest(GET_ALLUSAGEPLAN_REQUEST, getAllUsagePlanData);
  yield takeLatest(GET_CATEGORY_REQUEST, getCategoryData);
}

function* postAppCode() {
  try {
    const result = yield api.getReToken();
    if (result.data) {
      yield put({
        type: POST_APPCODE_SUCCESS,
        data: result.data,
      });
      yield Cookies.setCookie(
        "apptoken",
        JSON.stringify(result.data.appTokenCode),
        90
      );
      yield put({
        type: REQUEST_SUCCESS_MESSAGE,
        data: "App code has been successfully reissued.",
      });
    } else {
      yield put({
        type: REQUEST_ERROR_MESSAGE,
        data: "App code was not issued due to a temporary error.",
      });
      yield put({
        type: POST_APPCODE_FAILURE,
      });
    }
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "App code was not issued due to a temporary error."
      ),
    });
    yield put({
      type: POST_APPCODE_FAILURE,
    });
  }
}
function* watchPostAppCode() {
  yield takeLatest(POST_APPCODE_REQUEST, postAppCode);
}

function* postResetPassword(action) {
  try {
    const result = yield api.forgetPassword(action.data);
    yield put({
      type: POST_RESETPASSWORD_SUCCESS,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "The link has been sent to your e-mail.",
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
        "E-mail sending failed due to a temporary error."
      ),
    });
    yield put({
      type: POST_RESETPASSWORD_FAILURE,
    });
  }
}
function* watchPostResetPassword() {
  yield takeLatest(POST_RESETPASSWORD_REQUEST, postResetPassword);
}

function* postWidthdraw(action) {
  try {
    const result = yield api.Login(action.data);
    if (result.status === 200) {
      try {
        const widthDrawRes = yield api.makeUserUnable();
        yield put({
          type: POST_WITHDRAW_SUCCESS,
        });
      } catch (err) {
        yield put({
          type: REQUEST_ERROR_MESSAGE,
          data: renderSnackbarMessage(
            "error",
            err.response,
            "Please try again."
          ),
        });
        yield put({
          type: POST_WITHDRAW_FAILURE,
        });
      }
    }
  } catch (err) {
    let errorMessage = "";
    if (err.response.status === 400) {
      errorMessage = "Please check your password again.";
    } else {
      errorMessage = err.response.data.message
        ? err.response.data.message
        : "Please try again.";
    }
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage("error", err.response, errorMessage),
    });
    yield put({
      type: POST_WITHDRAW_FAILURE,
    });
  }
}
function* watchWithdraw() {
  yield takeLatest(POST_WITHDRAW_REQUEST, postWidthdraw);
}

function* postCompanyLogo(action) {
  try {
    const result = yield api.putLogo(action.data);
    yield put({
      type: POST_COMPANYLOGO_SUCCESS,
      data: result.data,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "Logo uploaded.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "Logo upload failed. Please try again."
      ),
    });
    yield put({
      type: POST_COMPANYLOGO_FAILURE,
    });
  }
}
function* watchPostCompanyLogo() {
  yield takeLatest(POST_COMPANYLOGO_REQUEST, postCompanyLogo);
}

function* deleteCompanyLogo(action) {
  try {
    const result = yield api.deleteLogo();
    yield put({
      type: DELETE_COMPANYLOGO_SUCCESS,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "The logo has been deleted.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "Logo deleting failed. Please try again."
      ),
    });
    yield put({
      type: DELETE_COMPANYLOGO_FAILURE,
    });
  }
}
function* watchDeleteCompanyLogo() {
  yield takeLatest(DELETE_COMPANYLOGO_REQUEST, deleteCompanyLogo);
}

function* putUser(action) {
  try {
    const result = yield api.userInfoChange(action.data);
    yield put({
      type: PUT_USER_SUCCESS,
      data: result.data,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "Your information has been successfully edited.",
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
        "Information editing failed due to a temporary error. Please try again."
      ),
    });
    yield put({
      type: PUT_USER_FAILURE,
    });
  }
}
function* watchPutUser() {
  yield takeLatest(PUT_USER_REQUEST, putUser);
}
function* putUserWithoutMessage(action) {
  try {
    const result = yield api.userInfoChange(action.data);
    yield put({
      type: PUT_USER_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "Error setting the introduction page and language. Please refresh and try again."
      ),
    });
    yield put({
      type: PUT_USER_FAILURE,
    });
  }
}
function* watchPutUserWithoutMessage() {
  yield takeLatest(PUT_USER_REQUEST_WITHOUT_MESSAGE, putUserWithoutMessage);
}

function* postCancelPlan(action) {
  try {
    const result = yield api.cancelUsage();
    yield put({
      type: POST_CANCELPLAN_SUCCESS,
      data: result.data,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: `${
        action.data ? action.data.substring(0, 10) : "다음달"
      }부터 구독이 취소됩니다.`,
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
        "Unsubscribing failed due to a temporary error. Please try again."
      ),
    });
    yield put({
      type: POST_CANCELPLAN_FAILURE,
    });
  }
}
function* watchPostCancelPlan() {
  yield takeLatest(POST_CANCELPLAN_REQUEST, postCancelPlan);
}

function* postCancelNextPlan() {
  try {
    const result = yield api.deleteFuturePlan();
    yield put({
      type: POST_CANCELNEXTPLAN_SUCCESS,
      data: null,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data:
        "The plan that will be applied from next month has been canceled successfully.",
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
        "The plan was not canceled due to a temporary error. Please try again."
      ),
    });
    yield put({
      type: POST_CANCELNEXTPLAN_FAILURE,
    });
  }
}
function* watchPostCancelNextPlan() {
  yield takeLatest(POST_CANCELNEXTPLAN_REQUEST, postCancelNextPlan);
}

function* postCheckAsynctasks(action) {
  try {
    const result = yield api.checkAsynctask(action.data);
    yield put({
      type: POST_CHECKASYNCTASKS_SUCCESS,
      data: action.data,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "A temporary error has occurred. Please try again."
      ),
    });
    yield put({
      type: POST_CHECKASYNCTASKS_FAILURE,
    });
  }
}
function* watchPostCheckAsynctasks() {
  yield takeLatest(POST_CHECKASYNCTASKS_REQUEST, postCheckAsynctasks);
}

function* postCheckAllAsynctasks(action) {
  try {
    yield api.checkAsynctask(-1);
    yield put({
      type: POST_CHECKALLASYNCTASKS_SUCCESS,
    });
    yield put({
      type: REQUEST_SUCCESS_MESSAGE,
      data: "All notifications have been marked as read.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response,
        "A temporary error has occurred. Please try again."
      ),
    });
    yield put({
      type: POST_CHECKALLASYNCTASKS_FAILURE,
    });
  }
}

function* watchPostCheckAllAsynctasks() {
  yield takeLatest(POST_CHECKALLASYNCTASKS_REQUEST, postCheckAllAsynctasks);
}

function* getAsynctasks() {
  try {
    const result = yield api.getAsynctask();
    yield put({
      type: GET_ASYNCTASKS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_ASYNCTASKS_FAILURE,
    });
  }
}
function* watchGetAsynctasks() {
  yield takeLatest(GET_ASYNCTASKS_REQUEST, getAsynctasks);
}

function* getUserCount() {
  try {
    const result = yield api.getUserCountInfo();
    yield put({
      type: GET_USERCOUNT_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_USERCOUNT_FAILURE,
    });
  }
}
function* watchGetUserCount() {
  yield takeLatest(GET_USERCOUNT_REQUEST, getUserCount);
}

function* getAllWorkage() {
  try {
    const result = yield api.getAllWorkage();
    yield put({
      type: GET_ALLWORKAGE_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_ALLWORKAGE_FAILURE,
    });
  }
}
function* watchGetAllWorkage() {
  yield takeLatest(GET_ALLWORKAGE_REQUEST, getAllWorkage);
}

function* getExternalAi() {
  try {
    const result = yield api.getDevelopedAiModels();
    yield put({
      type: GET_EXTERNALAI_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: GET_EXTERNALAI_FAILURE,
    });
  }
}
function* watchGetExternalAi() {
  yield takeLatest(GET_EXTERNALAI_REQUEST, getExternalAi);
}

export default function* userSaga() {
  yield all([
    fork(watchGetMainPage),
    fork(watchGetMe),
    fork(watchPostAppCode),
    fork(watchPostResetPassword),
    fork(watchWithdraw),
    fork(watchPostCompanyLogo),
    fork(watchDeleteCompanyLogo),
    fork(watchPutUser),
    fork(watchPutUserWithoutMessage),
    fork(watchPostCancelPlan),
    fork(watchPostCancelNextPlan),
    fork(watchPostCheckAsynctasks),
    fork(watchPostCheckAllAsynctasks),
    fork(watchGetAsynctasks),
    fork(watchGetUserCount),
    fork(watchGetAllWorkage),
    fork(watchGetExternalAi),
  ]);
}
