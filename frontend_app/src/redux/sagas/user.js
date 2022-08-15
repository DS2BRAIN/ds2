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
        err.response.data.message,
        err.response.data.message_en,
        "죄송합니다. 일시적인 오류가 발생하였습니다."
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
        err.response.data.message,
        err.response.data.message_en,
        "죄송합니다. 일시적인 오류가 발생하였습니다."
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
          err.response.data.message,
          err.response.data.message_en,
          "죄송합니다. 일시적인 오류 발생으로 카드정보를 불러오는데 실패하였습니다."
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
        data: "앱코드가 성공적으로 재발급 되었습니다.",
      });
    } else {
      yield put({
        type: REQUEST_ERROR_MESSAGE,
        data:
          "죄송합니다. 일시적인 오류가 발생으로 인하여 앱코드 발행에 실패하였습니다.",
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
        err.response.data.message,
        err.response.data.message_en,
        "죄송합니다. 일시적인 오류 발생으로 인하여 앱코드 발행에 실패하였습니다."
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
      data: "고객님의 메일로 링크를 보내드렸습니다.",
    });
    yield put({
      type: CLOSE_MODAL_CONTENT,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response.data.message,
        err.response.data.message_en,
        "죄송합니다, 일시적인 오류 발생으로 인하여 메일전송에 실패하였습니다."
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
            err.response.data.message,
            err.response.data.message_en,
            "죄송합니다, 다시한번 시도해주세요."
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
      errorMessage = "비밀번호를 다시 한번 확인해 주세요.";
    } else {
      errorMessage = err.response.data.message
        ? err.response.data.message
        : "죄송합니다, 다시 한번 시도해 주세요.";
    }
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response.data.message,
        err.response.data.message_en,
        errorMessage
      ),
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
      data: "로고를 업로드 하였습니다.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response.data.message,
        err.response.data.message_en,
        "죄송합니다, 로고 업로드에 실패하였습니다. 다시 시도해주세요."
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
      data: "로고를 삭제 하였습니다.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response.data.message,
        err.response.data.message_en,
        "죄송합니다, 로고 삭제에 실패하였습니다. 다시 시도해주세요."
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
      data: "회원님의 정보가 성공적으로 변경되었습니다.",
    });
    yield put({
      type: CLOSE_MODAL_CONTENT,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response.data.message,
        err.response.data.message_en,
        "죄송합니다, 일시적 오류로 인하여, 회원정보 변경에 실패하였습니다. 다시 시도해주세요."
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
        err.response.data.message,
        err.response.data.message_en,
        "소개 페이지 및 언어 설정 오류입니다. 새로고침 후 다시 시도해주세요."
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
        err.response.data.message,
        err.response.data.message_en,
        "죄송합니다, 일시적인 오류로 인하여 구독취소에 실패하였습니다. 다시 시도해주세요."
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
      data: "다음달 부터 적용될 플랜을 정상적으로 취소하였습니다.",
    });
    yield put({
      type: CLOSE_MODAL_CONTENT,
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response.data.message,
        err.response.data.message_en,
        "죄송합니다, 일시적인 오류로 인하여 이용플랜 취소에 실패하였습니다. 다시 시도해주세요."
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
        err.response.data.message,
        err.response.data.message_en,
        "죄송합니다. 일시적인 오류가 발생하였습니다. 다시 시도해주세요."
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
      REQUEST_SUCCESS_MESSAGE,
      data: "전체 알림을 읽음 처리하였습니다.",
    });
  } catch (err) {
    yield put({
      type: REQUEST_ERROR_MESSAGE,
      data: renderSnackbarMessage(
        "error",
        err.response.data.message,
        err.response.data.message_en,
        "죄송합니다. 일시적인 오류가 발생하였습니다. 다시 시도해주세요."
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
