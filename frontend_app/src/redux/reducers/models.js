export const initialState = {
  isLoading: false,
  chosenModel: null,
  model: null,
  response: null,
  isSuccess: false,
  modelSSEDict: null,
};

export const SET_CHOSENMODEL_REQUEST = "SET_CHOSENMODEL_REQUEST";
export const GET_MODEL_REQUEST = "GET_MODEL_REQUEST";
export const GET_OPSMODEL_REQUEST = "GET_OPSMODEL_REQUEST";
export const GET_MARKETMODEL_REQUEST = "GET_MARKETMODEL_REQUEST";
export const GET_MODEL_SUCCESS = "GET_MODEL_SUCCESS";
export const GET_MODEL_FAILURE = "GET_MODEL_FAILURE";

export const MODELS_RESET = "MODELS_RESET";

export const SET_MODEL_SSE_DICT = "SET_MODEL_SSE_DICT";

export const setChosenModelRequestAction = (data) => ({
  type: SET_CHOSENMODEL_REQUEST,
  data,
});
export const getModelRequestAction = (data) => ({
  type: GET_MODEL_REQUEST,
  data,
});
export const modelsReseetRequestAction = () => ({
  type: MODELS_RESET,
});
export const getOPSModelRequestAction = (data) => ({
  type: GET_OPSMODEL_REQUEST,
  data,
});
export const getMarketModelRequestAction = (data) => ({
  type: GET_MARKETMODEL_REQUEST,
  data,
});
export const setModelSSEDictRequestAction = (data) => ({
  type: SET_MODEL_SSE_DICT,
  data,
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CHOSENMODEL_REQUEST:
      return { ...state, chosenModel: action.data };

    case GET_MODEL_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_MODEL_SUCCESS:
      return {
        ...state,
        isLoading: false,
        chosenModel: action.data.data.id,
        model: action.data.data,
        response: action.data.request.response,
        isSuccess: true,
      };
    case GET_MODEL_SUCCESS:
      return { ...state, isLoading: false, isSuccess: false };

    case SET_MODEL_SSE_DICT:
      return { ...state, modelSSEDict: action.data };

    case MODELS_RESET:
      return initialState;

    default:
      return state;
  }
};

export default reducer;
