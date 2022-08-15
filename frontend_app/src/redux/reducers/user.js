export const initialState = {
  isLoading: false,
  main: null,
  me: null,
  cardInfo: null,
  allPlans: null,
  category: null,
  dataconnectortype: null,
  isSuccess: false,
  isWidthDrawDone: false,
  maximumFileSize: 2147483648,
  allWorkage: null,
  externalAiModels: null,
  isAsynctaskDone: false,
  language: "ko",
  asynctasks: null,
  usages: null,
  isValidUser: null,
  isGetKeyStatusLoading: false,
};

export const GET_MAINPAGE_REQUEST = "GET_MAINPAGE_REQUEST";
export const GET_MAINPAGE_SUCCESS = "GET_MAINPAGE_SUCCESS";
export const GET_MAINPAGE_FAILURE = "GET_MAINPAGE_FAILURE";

export const GET_ME_REQUEST = "GET_ME_REQUEST";
export const GET_ME_SUCCESS = "GET_ME_SUCCESS";
export const GET_ME_FAILURE = "GET_ME_FAILURE";

export const GET_CARD_REQUEST = "GET_CARD_REQUEST";
export const GET_CARD_SUCCESS = "GET_CARD_SUCCESS";
export const GET_CARD_FAILURE = "GET_CARD_FAILURE";

export const GET_ALLUSAGEPLAN_REQUEST = "GET_ALLUSAGEPLAN_REQUEST";
export const GET_ALLUSAGEPLAN_SUCCESS = "GET_ALLUSAGEPLAN_SUCCESS";
export const GET_ALLUSAGEPLAN_FAILURE = "GET_ALLUSAGEPLAN_FAILURE";

export const POST_APPCODE_REQUEST = "POST_APPCODE_REQUEST";
export const POST_APPCODE_SUCCESS = "POST_APPCODE_SUCCESS";
export const POST_APPCODE_FAILURE = "POST_APPCODE_FAILURE";

export const POST_RESETPASSWORD_REQUEST = "POST_RESETPASSWORD_REQUEST";
export const POST_RESETPASSWORD_SUCCESS = "POST_RESETPASSWORD_SUCCESS";
export const POST_RESETPASSWORD_FAILURE = "POST_RESETPASSWORD_FAILURE";

export const POST_WITHDRAW_REQUEST = "POST_WITHDRAW_REQUEST";
export const POST_WITHDRAW_SUCCESS = "POST_WITHDRAW_SUCCESS";
export const POST_WITHDRAW_FAILURE = "POST_WITHDRAW_FAILURE";

export const POST_COMPANYLOGO_REQUEST = "POST_COMPANYLOGO_REQUEST";
export const POST_COMPANYLOGO_SUCCESS = "POST_COMPANYLOGO_SUCCESS";
export const POST_COMPANYLOGO_FAILURE = "POST_COMPANYLOGO_FAILURE";

export const DELETE_COMPANYLOGO_REQUEST = "DELETE_COMPANYLOGO_REQUEST";
export const DELETE_COMPANYLOGO_SUCCESS = "DELETE_COMPANYLOGO_SUCCESS";
export const DELETE_COMPANYLOGO_FAILURE = "DELETE_COMPANYLOGO_FAILURE";

export const PUT_USER_REQUEST = "PUT_USER_REQUEST";
export const PUT_USER_REQUEST_WITHOUT_MESSAGE =
  "PUT_USER_REQUEST_WITHOUT_MESSAGE";
export const PUT_USER_SUCCESS = "PUT_USER_SUCCESS";
export const PUT_USER_FAILURE = "PUT_USER_FAILURE";

export const POST_CANCELPLAN_REQUEST = "POST_CANCELPLAN_REQUEST";
export const POST_CANCELPLAN_SUCCESS = "POST_CANCELPLAN_SUCCESS";
export const POST_CANCELPLAN_FAILURE = "POST_CANCELPLAN_FAILURE";

export const POST_CANCELNEXTPLAN_REQUEST = "POST_CANCELNEXTPLAN_REQUEST";
export const POST_CANCELNEXTPLAN_SUCCESS = "POST_CANCELNEXTPLAN_SUCCESS";
export const POST_CANCELNEXTPLAN_FAILURE = "POST_CANCELNEXTPLAN_FAILURE";

export const POST_CHECKASYNCTASKS_REQUEST = "POST_CHECKASYNCTASKS_REQUEST";
export const POST_CHECKASYNCTASKS_SUCCESS = "POST_CHECKASYNCTASKS_SUCCESS";
export const POST_CHECKASYNCTASKS_FAILURE = "POST_CHECKASYNCTASKS_FAILURE";

export const POST_CHECKALLASYNCTASKS_REQUEST =
  "POST_CHECKALLASYNCTASKS_REQUEST";
export const POST_CHECKALLASYNCTASKS_SUCCESS =
  "POST_CHECKALLASYNCTASKS_SUCCESS";
export const POST_CHECKALLASYNCTASKS_FAILURE =
  "POST_CHECKALLASYNCTASKS_FAILURE";

export const GET_ASYNCTASKS_REQUEST = "GET_ASYNCTASKS_REQUEST";
export const GET_ASYNCTASKS_SUCCESS = "GET_ASYNCTASKS_SUCCESS";
export const GET_ASYNCTASKS_FAILURE = "GET_ASYNCTASKS_FAILURE";

export const GET_CATEGORY_REQUEST = "GET_CATEGORY_REQUEST";
export const GET_CATEGORY_SUCCESS = "GET_CATEGORY_SUCCESS";
export const GET_CATEGORY_FAILURE = "GET_CATEGORY_FAILURE";

export const UPDATE_PREDICTCOUNT_REQUEST = "UPDATE_PREDICTCOUNT_REQUEST";
export const GET_USERCOUNT_REQUEST = "GET_USERCOUNT_REQUEST";
export const GET_USERCOUNT_SUCCESS = "GET_USERCOUNT_SUCCESS";
export const GET_USERCOUNT_FAILURE = "GET_USERCOUNT_FAILURE";

export const STOP_USERLOADING_REQUEST = "STOP_USERLOADING_REQUEST";
export const CHANGE_USER_LANGUAGE = "CHANGE_USER_LANGUAGE";
export const UPDATE_NOTIFICATION = "UPDATE_NOTIFICATION";

export const GET_ALLWORKAGE_REQUEST = "GET_ALLWORKAGE_REQUEST";
export const GET_ALLWORKAGE_SUCCESS = "GET_ALLWORKAGE_SUCCESS";
export const GET_ALLWORKAGE_FAILURE = "GET_ALLWORKAGE_FAILURE";

export const GET_EXTERNALAI_REQUEST = "GET_EXTERNALAI_REQUEST";
export const GET_EXTERNALAI_SUCCESS = "GET_EXTERNALAI_SUCCESS";
export const GET_EXTERNALAI_FAILURE = "GET_EXTERNALAI_FAILURE";

export const USER_RESET = "USER_RESET";

export const SET_IS_VALID_USER = "SET_IS_VALID_USER";

export const SET_IS_GET_KEY_STATUS_LOADING = "SET_IS_GET_KEY_STATUS_LOADING";

export const getMainPageRequestAction = () => ({
  type: GET_MAINPAGE_REQUEST,
});
export const getMeRequestAction = () => ({
  type: GET_ME_REQUEST,
});
export const getCardRequestAction = () => ({
  type: GET_CARD_REQUEST,
});
export const getAllUsagePlanRequestAction = () => ({
  type: GET_ALLUSAGEPLAN_REQUEST,
});
export const postAppCodeRequest = () => ({
  type: POST_APPCODE_REQUEST,
});
export const postResetPasswordRequestAction = (data) => ({
  type: POST_RESETPASSWORD_REQUEST,
  data,
});
export const postWithdrawRequestAction = (data) => ({
  type: POST_WITHDRAW_REQUEST,
  data,
});
export const postCompanyLogoRequestAction = (data) => ({
  type: POST_COMPANYLOGO_REQUEST,
  data,
});
export const deleteCompanyLogoRequestAction = () => ({
  type: DELETE_COMPANYLOGO_REQUEST,
});
export const putUserRequestAction = (data) => ({
  type: PUT_USER_REQUEST,
  data,
});
export const putUserRequestActionWithoutMessage = (data) => ({
  type: PUT_USER_REQUEST_WITHOUT_MESSAGE,
  data,
});
export const postCancelPlanRequestAction = (data) => ({
  type: POST_CANCELPLAN_REQUEST,
  data,
});
export const postCancelNextPlanRequestAction = () => ({
  type: POST_CANCELNEXTPLAN_REQUEST,
});
export const postCheckAsynctasksRequestAction = (data) => ({
  type: POST_CHECKASYNCTASKS_REQUEST,
  data,
});
export const postChecAllkAsynctasksRequestAction = (data) => ({
  type: POST_CHECKALLASYNCTASKS_REQUEST,
  data,
});
export const getAsynctasksRequestAction = () => ({
  type: GET_ASYNCTASKS_REQUEST,
});
export const getCategoryRequestAction = () => ({
  type: GET_CATEGORY_REQUEST,
});
export const updatePredictCountRequestAction = () => ({
  type: UPDATE_PREDICTCOUNT_REQUEST,
});
export const getUserCountRequestAction = () => ({
  type: GET_USERCOUNT_REQUEST,
});
export const stopUserLoadingRequestAction = () => ({
  type: STOP_USERLOADING_REQUEST,
});
export const changeUserLanguageRequestAction = (data) => ({
  type: CHANGE_USER_LANGUAGE,
  data,
});
export const updateNotification = (data) => ({
  type: UPDATE_NOTIFICATION,
  data,
});
export const getAllWorkageRequestAction = () => ({
  type: GET_ALLWORKAGE_REQUEST,
});
export const getExternalAiRequestAction = () => ({
  type: GET_EXTERNALAI_REQUEST,
});
export const userResetRequestAction = () => ({
  type: USER_RESET,
});
export const setIsValidUserRequestAction = (data) => ({
  type: SET_IS_VALID_USER,
  data,
});
export const setIsGetKeyStatusLoadingRequestAction = (data) => ({
  type: SET_IS_GET_KEY_STATUS_LOADING,
  data,
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_MAINPAGE_REQUEST:
      return { ...state, isLoading: true };
    case GET_MAINPAGE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        main: action.data,
        me: action.data.me,
        cardInfo: Object.keys(action.data.pgregistration).length
          ? {
              cardName: action.data.pgregistration.CardNo,
              created: action.data.pgregistration.CreatedAt,
            }
          : null,
        category: action.data.projectcategories,
        usages: action.data.usages,
        isSuccess: true,
      };
    case GET_MAINPAGE_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };
    case GET_ME_REQUEST:
      return { ...state, isLoading: true };
    case GET_ME_SUCCESS:
      return {
        ...state,
        isLoading: false,
        me: action.data,
        isSuccess: true,
      };
    case GET_ME_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };
    case GET_CARD_REQUEST:
      return { ...state, isLoading: true };
    case GET_CARD_SUCCESS:
      return {
        ...state,
        isLoading: false,
        cardInfo: action.data,
        isSuccess: true,
      };
    case GET_CARD_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case GET_ALLUSAGEPLAN_REQUEST:
      return { ...state, isLoading: true };
    case GET_ALLUSAGEPLAN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        allPlans: action.data,
        isSuccess: true,
      };
    case GET_ALLUSAGEPLAN_FAILURE:
      return {
        ...state,
        isLoading: false,
        allPlans: action.data,
        isSuccess: false,
      };

    case POST_APPCODE_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case POST_APPCODE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        me: { ...state.me, appTokenCode: action.data.appTokenCode },
        isSuccess: true,
      };
    case POST_APPCODE_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case POST_RESETPASSWORD_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case POST_RESETPASSWORD_SUCCESS:
      return { ...state, isLoading: false, isSuccess: true };
    case POST_RESETPASSWORD_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case POST_WITHDRAW_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case POST_WITHDRAW_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isSuccess: true,
        isWidthDrawDone: true,
      };
    case POST_WITHDRAW_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case POST_COMPANYLOGO_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case POST_COMPANYLOGO_SUCCESS:
      return {
        ...state,
        isLoading: false,
        me: { ...state.me, companyLogoUrl: action.data.companyLogoUrl },
        isSuccess: true,
      };
    case POST_COMPANYLOGO_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case DELETE_COMPANYLOGO_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case DELETE_COMPANYLOGO_SUCCESS:
      return {
        ...state,
        isLoading: false,
        me: { ...state.me, companyLogoUrl: null },
        isSuccess: true,
      };
    case DELETE_COMPANYLOGO_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case PUT_USER_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case PUT_USER_REQUEST_WITHOUT_MESSAGE:
      return { ...state, isLoading: true, isSuccess: false };
    case PUT_USER_SUCCESS:
      for (let key in action.data) {
        if (action.data[key] !== undefined && action.data[key] !== null)
          state.me[key] = action.data[key];
      }

      return {
        ...state,
        isLoading: false,
        me: {
          ...state.me,
        },
        isSuccess: true,
      };
    case PUT_USER_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case POST_CANCELPLAN_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case POST_CANCELPLAN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        me: { ...state.me, nextPlan: action.data },
        isSuccess: true,
      };
    case POST_CANCELPLAN_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case POST_CANCELNEXTPLAN_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case POST_CANCELNEXTPLAN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        me: { ...state.me, nextPlan: action.data, nextDynos: action.data },
        isSuccess: true,
      };
    case POST_CANCELNEXTPLAN_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case POST_CHECKASYNCTASKS_REQUEST:
      return {
        ...state,
        isLoading: true,
        isAsynctaskDone: false,
        isSuccess: false,
      };
    case POST_CHECKASYNCTASKS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        asynctasks: state.asynctasks.filter((task) => task.id !== action.data),
        isAsynctaskDone: true,
        isSuccess: true,
      };
    case POST_CHECKASYNCTASKS_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAsynctaskDone: true,
        isSuccess: false,
      };

    case POST_CHECKALLASYNCTASKS_REQUEST:
      return {
        ...state,
        isLoading: true,
        isAsynctaskDone: false,
        isSuccess: false,
      };
    case POST_CHECKALLASYNCTASKS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        asynctasks: null,
        isAsynctaskDone: true,
        isSuccess: true,
      };
    case POST_CHECKALLASYNCTASKS_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAsynctaskDone: true,
        isSuccess: false,
      };

    case GET_ASYNCTASKS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_ASYNCTASKS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        asynctasks: action.data,
        isSuccess: true,
      };
    case GET_ASYNCTASKS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case UPDATE_NOTIFICATION:
      return { ...state, asynctasks: action.data };

    case GET_CATEGORY_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_CATEGORY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        category: action.data,
        isSuccess: true,
      };
    case GET_CATEGORY_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case UPDATE_PREDICTCOUNT_REQUEST:
      return {
        ...state,
        me: {
          ...state.me,
          cumulativePredictCount: state.me.cumulativePredictCount + 100,
        },
      };

    case GET_USERCOUNT_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_USERCOUNT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        me: {
          ...state.me,
          cumulativePredictCount: action.data.cumulativePredictCount,
        },
        isSuccess: true,
      };
    case GET_USERCOUNT_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case STOP_USERLOADING_REQUEST:
      return { ...state, isLoading: false, isSuccess: false };
    case CHANGE_USER_LANGUAGE:
      return { ...state, language: action.data };

    case GET_ALLWORKAGE_REQUEST:
      return { ...state, isLoading: true };
    case GET_ALLWORKAGE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        allWorkage: action.data,
        isSuccess: true,
      };
    case GET_ALLWORKAGE_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case GET_EXTERNALAI_REQUEST:
      return { ...state, isLoading: true };
    case GET_EXTERNALAI_SUCCESS:
      return {
        ...state,
        isLoading: false,
        externalAiModels: action.data,
        isSuccess: true,
      };
    case GET_EXTERNALAI_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case USER_RESET:
      return initialState;

    case SET_IS_VALID_USER:
      return { ...state, isValidUser: action.data };

    case SET_IS_GET_KEY_STATUS_LOADING:
      return { ...state, isGetKeyStatusLoading: action.data };

    default:
      return state;
  }
};

export default reducer;
