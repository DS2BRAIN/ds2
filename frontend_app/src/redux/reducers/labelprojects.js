import { REQUEST_SUCCESS_MESSAGE } from "./messages";

export const initialState = {
  isLabelClassAddLoading: false,
  isLabelClassDeleteLoading: false,
  isWorkappLoading: false,
  isLabelLoading: false,
  isLoading: false,
  projects: [],
  recentProjects: null,
  totalLength: null,
  selectedProject: null,
  projectDetail: null,
  objectLists: null,
  chart: null,
  workAssignee: null,
  projectPage: 0,
  projectRowsPerPage: 10,
  sortingValue: "id",
  valueForStatus: "all",
  valueForAsingee: "all",
  searchedValue: null,
  isSortDesc: true,
  workage: null,
  isSuccess: false,
  isGroupError: false,
  isProjectStarted: false,
  isAsyncRequested: false,
  autoLabelStatus: false,
  isPreviewOpened: false,
  isPostSuccess: false,
  isProjectRefreshed: false,
  isDeleteLabelprojectsLoading: false,
  isDeleteLabelprojectsSuccess: false,
  isDeleteLabelprojectsFailure: false,
  isGetLabelclassesLoading: false,
  isGetLabelclassesSuccess: false,
  isGetLabelclassesFailure: false,
};

export const GET_LABELPROJECTS_REQUEST = "GET_LABELPROJECTS_REQUEST";
export const GET_LABELPROJECTS_SUCCESS = "GET_LABELPROJECTS_SUCCESS";
export const GET_LABELPROJECTS_FAILURE = "GET_LABELPROJECTS_FAILURE";

export const GET_RECENTLABELPROJECTS_REQUEST =
  "GET_RECENTLABELPROJECTS_REQUEST";
export const GET_RECENTLABELPROJECTS_SUCCESS =
  "GET_RECENTLABELPROJECTS_SUCCESS";
export const GET_RECENTLABELPROJECTS_FAILURE =
  "GET_RECENTLABELPROJECTS_FAILURE";

export const DELETE_LABELPROJECTS_REQUEST = "DELETE_LABELPROJECTS_REQUEST";
export const DELETE_LABELPROJECTS_SUCCESS = "DELETE_LABELPROJECTS_SUCCESS";
export const DELETE_LABELPROJECTS_FAILURE = "DELETE_LABELPROJECTS_FAILURE";

export const POST_LABELPROJECT_REQUEST = "POST_LABELPROJECT_REQUEST";
export const POST_LABELPROJECT_SUCCESS = "POST_LABELPROJECT_SUCCESS";
export const POST_LABELPROJECT_FAILURE = "POST_LABELPROJECT_FAILURE";

export const SET_SELECTEDPROJECT_REQUEST = "SET_SELECTEDPROJECT_REQUEST";
export const GET_LABELPROJECT_REQUEST = "GET_LABELPROJECT_REQUEST";
export const GET_LABELPROJECT_SUCCESS = "GET_LABELPROJECT_SUCCESS";
export const GET_LABELPROJECT_FAILURE = "GET_LABELPROJECT_FAILURE";

export const PUT_LABELPROJECT_REQUEST = "PUT_LABELPROJECT_REQUEST";
export const PUT_LABELPROJECT_SUCCESS = "PUT_LABELPROJECT_SUCCESS";
export const PUT_LABELPROJECT_FAILURE = "PUT_LABELPROJECT_FAILURE";

export const GET_OBJECTLISTS_REQUEST = "GET_OBJECTLISTS_REQUEST";
export const GET_OBJECTLISTS_SUCCESS = "GET_OBJECTLISTS_SUCCESS";
export const GET_OBJECTLISTS_FAILURE = "GET_OBJECTLISTS_FAILURE";

export const POST_LABELCLASS_REQUEST = "POST_LABELCLASS_REQUEST";
export const POST_LABELCLASS_SUCCESS = "POST_LABELCLASS_SUCCESS";
export const POST_LABELCLASS_FAILURE = "POST_LABELCLASS_FAILURE";

export const PUT_LABELCLASS_REQUEST = "PUT_LABELCLASS_REQUEST";
export const PUT_LABELCLASS_SUCCESS = "PUT_LABELCLASS_SUCCESS";
export const PUT_LABELCLASS_FAILURE = "PUT_LABELCLASS_FAILURE";

export const DELETE_LABELCLASS_REQUEST = "DELETE_LABELCLASS_REQUEST";
export const DELETE_LABELCLASS_SUCCESS = "DELETE_LABELCLASS_SUCCESS";
export const DELETE_LABELCLASS_FAILURE = "DELETE_LABELCLASS_FAILURE";

export const POST_OBJECTLISTS_REQUEST = "POST_OBJECTLISTS_REQUEST";
export const POST_OBJECTLISTS_SUCCESS = "POST_OBJECTLISTS_SUCCESS";
export const REQUEST_RESET_ISPOSTSUCCESS = "REQUEST_RESET_ISPOSTSUCCESS";
export const POST_OBJECTLISTS_FAILURE = "POST_OBJECTLISTS_FAILURE";

export const DELETE_OBJECTLISTS_REQUEST = "DELETE_OBJECTLISTS_REQUEST";
export const DELETE_OBJECTLISTS_SUCCESS = "DELETE_OBJECTLISTS_SUCCESS";
export const DELETE_OBJECTLISTS_FAILURE = "DELETE_OBJECTLISTS_FAILURE";

export const SET_OBJECTLISTS_PAGE = "SET_OBJECTLISTS_PAGE";
export const SET_OBJECTLISTS_ROWS = "SET_OBJECTLISTS_ROWS";
export const SET_OBJECTLISTS_SORTVALUE = "SET_OBJECTLISTS_SORTVALUE";
export const SET_OBJECTLISTS_ISDESC = "SET_OBJECTLISTS_ISDESC";
export const SET_OBJECTLISTS_VALUEFORSTATUS = "SET_OBJECTLISTS_VALUEFORSTATUS";
export const SET_OBJECTLISTS_VALUEFORASIGNEE =
  "SET_OBJECTLISTS_VALUEFORASIGNEE";
export const SET_OBJECTLISTS_SEARCHEDVALUE = "SET_OBJECTLISTS_SEARCHEDVALUE";
export const UPDATE_OBJECTLISTS_REQUEST = "UPDATE_OBJECTLISTS_REQUEST";

export const STOP_LABELPROJECTSLOADING_REQUEST =
  "STOP_LABELPROJECTSLOADING_REQUEST";
export const UPDATE_LABELSHAREGROUP_REQUEST = "UPDATE_LABELSHAREGROUP_REQUEST";
export const UPDATE_LABELSHAREGROUP_SUCCESS = "UPDATE_LABELSHAREGROUP_SUCCESS";
export const UPDATE_LABELSHAREGROUP_FAILURE = "UPDATE_LABELSHAREGROUP_FAILURE";

export const GET_AITRAINERLABELPROJECT_REQUEST =
  "GET_AITRAINERLABELPROJECT_REQUEST";
export const GET_AITRAINERLABELPROJECT_SUCCESS =
  "GET_AITRAINERLABELPROJECT_SUCCESS";
export const GET_AITRAINERLABELPROJECT_FAILURE =
  "GET_AITRAINERLABELPROJECT_FAILURE";

export const POST_AITRAINERLABELPROJECT_REQUEST =
  "POST_AITRAINERLABELPROJECT_REQUEST";
export const POST_AITRAINERLABELPROJECT_SUCCESS =
  "POST_AITRAINERLABELPROJECT_SUCCESS";
export const POST_AITRAINERLABELPROJECT_FAILURE =
  "POST_AITRAINERLABELPROJECT_FAILURE";

export const GET_WORKAGE_REQEUST = "GET_WORKAGE_REQEUST";
export const GET_WORKAGE_SUCCESS = "GET_WORKAGE_SUCCESS";
export const GET_WORKAGE_FAILURE = "GET_WORKAGE_FAILURE";
export const LABELPROJECTS_RESET = "LABELPROJECTS_RESET";
export const LABELPROJECT_RESET = "LABELPROJECT_RESET";
export const SET_LABELPROJECT_STARTED = "SET_LABELPROJECT_STARTED";
export const SET_ISPREVIEW_OPENED = "SET_ISPREVIEW_OPENED";
export const SET_ISPREVIEW_CLOSED = "SET_ISPREVIEW_CLOSED";

export const GET_LABELPROJECTASYNC_REQUEST = "GET_LABELPROJECTASYNC_REQUEST";
export const GET_LABELPROJECTASYNC_SUCCESS = "GET_LABELPROJECTASYNC_SUCCESS";
export const GET_LABELPROJECTASYNC_FAILURE = "GET_LABELPROJECTASYNC_FAILURE";

export const GET_AUTOLABELSTATUS_REQUEST = "GET_AUTOLABELSTATUS_REQUEST";
export const GET_AUTOLABELCHART = "GET_AUTOLABELCHART";
export const GET_AUTOLABELSTATUS_SUCCESS = "GET_AUTOLABELSTATUS_SUCCESS";
export const GET_AUTOLABELSTATUS_FAILURE = "GET_AUTOLABELSTATUS_FAILURE";

export const RESET_LABELPROJECTASYNC = "RESET_LABELPROJECTASYNC";
export const SET_LABELPROJECTASYNC = "SET_LABELPROJECTASYNC";

export const GET_LABELCLASSES_REQUEST = "GET_LABELCLASSES_REQUEST";
export const GET_LABELCLASSES_SUCCESS = "GET_LABELCLASSES_SUCCESS";
export const GET_LABELCLASSES_FAILURE = "GET_LABELCLASSES_FAILURE";

export const SET_IS_PROJECT_REFRESHED = "SET_IS_PROJECT_REFRESHED";

export const getLabelProjectsRequestAction = (data) => ({
  type: GET_LABELPROJECTS_REQUEST,
  data,
});
export const getRecentLabelProjectsRequestAction = (data) => ({
  type: GET_RECENTLABELPROJECTS_REQUEST,
  data,
});
export const deleteLabelProjectRequestAction = (data) => ({
  type: DELETE_LABELPROJECTS_REQUEST,
  data: data,
});
export const postLabelProjectRequestAction = (data) => ({
  type: POST_LABELPROJECT_REQUEST,
  data: data,
});
export const getLabelProjectRequestAction = (data) => ({
  type: GET_LABELPROJECT_REQUEST,
  data: data,
});
export const getLabelProjectAsyncRequestAction = (data) => ({
  type: GET_LABELPROJECTASYNC_REQUEST,
  data: data,
});
export const getObjectListsRequestAction = (data) => ({
  type: GET_OBJECTLISTS_REQUEST,
  data: data,
});
export const putLabelProjectRequestAction = (data) => ({
  type: PUT_LABELPROJECT_REQUEST,
  data: data,
});
export const getLabelclassesRequestAction = (data) => ({
  type: GET_LABELCLASSES_REQUEST,
  data,
});
export const postLabelClassRequestAction = (data) => ({
  type: POST_LABELCLASS_REQUEST,
  data: data,
});
export const putLabelClassRequestAction = (data) => ({
  type: PUT_LABELCLASS_REQUEST,
  data: data,
});
export const deleteLabelClassRequestAction = (data) => ({
  type: DELETE_LABELCLASS_REQUEST,
  data: data,
});
export const postUploadFileRequestAction = (data) => ({
  type: POST_OBJECTLISTS_REQUEST,
  data: data,
});
export const deleteObjectListsRequestAction = (data) => ({
  type: DELETE_OBJECTLISTS_REQUEST,
  data: data,
});
export const setObjectlistsPage = (data) => ({
  type: SET_OBJECTLISTS_PAGE,
  data: data,
});
export const setObjectlistsRows = (data) => ({
  type: SET_OBJECTLISTS_ROWS,
  data: data,
});
export const setObjectlistsSortingValue = (data) => ({
  type: SET_OBJECTLISTS_SORTVALUE,
  data: data,
});
export const setObjectlistsIsDesc = (data) => ({
  type: SET_OBJECTLISTS_ISDESC,
  data: data,
});
export const setObjectlistsValueForStatus = (data) => ({
  type: SET_OBJECTLISTS_VALUEFORSTATUS,
  data: data,
});
export const setObjectlistsValueForAsignee = (data) => ({
  type: SET_OBJECTLISTS_VALUEFORASIGNEE,
  data: data,
});
export const setObjectlistsSearchedValue = (data) => ({
  type: SET_OBJECTLISTS_SEARCHEDVALUE,
  data: data,
});
export const updateObjectListsRequestAction = (data) => ({
  type: UPDATE_OBJECTLISTS_REQUEST,
  data: data,
});
export const stopLabelProjectsLoadingRequestAction = () => ({
  type: STOP_LABELPROJECTSLOADING_REQUEST,
});
export const updateLabelShareGroupRequestAction = (data) => ({
  type: UPDATE_LABELSHAREGROUP_REQUEST,
  data,
});
export const getAiTrainerLabelprojectRequestAction = (data) => ({
  type: GET_AITRAINERLABELPROJECT_REQUEST,
  data,
});
export const postAiTrainerLabelprojectRequestAction = (data) => ({
  type: POST_AITRAINERLABELPROJECT_REQUEST,
  data,
});
export const getLabelWorkageRequestAction = (data) => ({
  type: GET_WORKAGE_REQEUST,
  data,
});
export const labelprojectsResetRequestAction = () => ({
  type: LABELPROJECTS_RESET,
});
export const labelprojectResetRequestAction = () => ({
  type: LABELPROJECT_RESET,
});
export const setLabelProjectStarted = () => ({
  type: SET_LABELPROJECT_STARTED,
});
export const resetLabelProjectAsync = () => ({
  type: RESET_LABELPROJECTASYNC,
});
export const setLabelProjectAsync = () => ({
  type: SET_LABELPROJECTASYNC,
});
export const getAutolabelStatusRequestAction = (data) => ({
  type: GET_AUTOLABELSTATUS_REQUEST,
  data,
});
export const setIsPreviewOpened = () => ({
  type: SET_ISPREVIEW_OPENED,
});
export const setIsPreviewClosed = () => ({
  type: SET_ISPREVIEW_CLOSED,
});
export const setIsProjectRefreshed = (data) => ({
  type: SET_IS_PROJECT_REFRESHED,
  data,
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_LABELPROJECTS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_LABELPROJECTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        projects: action.data.projects,
        totalLength: action.data.totalLength,
        isSuccess: true,
        isDeleteLabelprojectsSuccess: false,
      };
    case GET_LABELPROJECTS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };
    case GET_RECENTLABELPROJECTS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_RECENTLABELPROJECTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        recentProjects: action.data.projects,
        isSuccess: true,
      };
    case GET_RECENTLABELPROJECTS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };
    case GET_AITRAINERLABELPROJECT_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_AITRAINERLABELPROJECT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        projects: action.data,
        totalLength: action.data.length,
        isSuccess: true,
      };
    case GET_AITRAINERLABELPROJECT_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };
    case DELETE_LABELPROJECTS_REQUEST:
      return {
        ...state,
        isLoading: true,
        isSuccess: false,
        isDeleteLabelprojectsLoading: true,
        isDeleteLabelprojectsSuccess: false,
        isDeleteLabelprojectsFailure: false,
      };
    case DELETE_LABELPROJECTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isSuccess: true,
        isDeleteLabelprojectsLoading: false,
        isDeleteLabelprojectsSuccess: true,
        isDeleteLabelprojectsFailure: false,
      };
    case DELETE_LABELPROJECTS_FAILURE:
      return {
        ...state,
        isLoading: false,
        isSuccess: false,
        isDeleteLabelprojectsLoading: false,
        isDeleteLabelprojectsSuccess: false,
        isDeleteLabelprojectsFailure: true,
      };

    case POST_LABELPROJECT_REQUEST:
      return {
        ...state,
        isProjectStarted: false,
        isLoading: true,
        isSuccess: false,
      };
    case POST_LABELPROJECT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        projects: [...state.projects, action.data],
        selectedProject: action.data,
        isProjectStarted: true,
        isSuccess: true,
      };
    case POST_LABELPROJECT_FAILURE:
      return {
        ...state,
        isLoading: false,
        isProjectStarted: false,
        isSuccess: false,
      };

    case GET_LABELPROJECT_REQUEST:
      return {
        ...state,
        isLoading: true,
        isSuccess: false,
        isLabelLoading: true,
      };
    case GET_LABELPROJECT_SUCCESS:
      return {
        ...state,
        projectDetail: action.data,
        isLoading: false,
        isSuccess: true,
        isLabelLoading: false,
        isLabelClassDeleteLoading: false,
        isLabelClassAddLoading: false,
      };
    case GET_LABELPROJECT_FAILURE:
      return {
        ...state,
        isLoading: false,
        isSuccess: false,
        isLabelLoading: false,
        isLabelClassDeleteLoading: false,
        isLabelClassAddLoading: false,
      };

    case GET_LABELPROJECTASYNC_REQUEST:
      return { ...state, isSuccess: false, isAsyncRequested: true };
    case GET_LABELPROJECTASYNC_SUCCESS:
      return { ...state, projectDetail: action.data, isSuccess: true };
    case GET_LABELPROJECTASYNC_FAILURE:
      return { ...state, isSuccess: false };

    case GET_OBJECTLISTS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_OBJECTLISTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        objectLists: action.data.file,
        totalCount: action.data.totalCount,
        chart: action.data.chart,
        workAssignee: action.data.workAssignee,
        isSuccess: true,
        role: action.data.role,
      };
    case GET_OBJECTLISTS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case PUT_LABELPROJECT_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case PUT_LABELPROJECT_SUCCESS:
      if (action.data.type === "name") {
        return {
          ...state,
          isLoading: false,
          projectDetail: {
            ...state.projectDetail,
            name: action.data.params.name,
          },
          isSuccess: true,
        };
      } else if (action.data.type === "description") {
        return {
          ...state,
          isLoading: false,
          projectDetail: {
            ...state.projectDetail,
            description: action.data.params.description,
          },
          isSuccess: true,
        };
      } else if (action.data.type === "info") {
        return {
          ...state,
          isLoading: false,
          projectDetail: {
            ...state.projectDetail,
            name: action.data.params.name,
            description: action.data.params.description,
            has_review_process: action.data.params.has_review_process,
          },
          isSuccess: true,
        };
      }
    case PUT_LABELPROJECT_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case POST_LABELCLASS_REQUEST:
      return {
        ...state,
        isLoading: true,
        isSuccess: false,
        isLabelClassAddLoading: true,
      };
    case POST_LABELCLASS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        projectDetail: {
          ...state.projectDetail,
          labelclasses: [...state.projectDetail.labelclasses, action.data],
        },
        isSuccess: true,
      };
    case POST_LABELCLASS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case PUT_LABELCLASS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case PUT_LABELCLASS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        projectDetail: {
          ...state.projectDetail,
          labelclasses: state.projectDetail.labelclasses.map((labelclass, i) =>
            labelclass.id === action.data.id
              ? {
                  ...labelclass,
                  name: action.data.name,
                  color: action.data.color,
                }
              : labelclass
          ),
        },
        isSuccess: true,
      };
    case PUT_LABELCLASS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case DELETE_LABELCLASS_REQUEST:
      return {
        ...state,
        isLoading: true,
        isSuccess: false,
        isLabelClassDeleteLoading: true,
      };
    case DELETE_LABELCLASS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        projectDetail: {
          ...state.projectDetail,
          labelclasses: state.projectDetail.labelclasses.filter(
            (labelclass, i) => labelclass.id !== action.data
          ),
        },
        isSuccess: true,
      };
    case DELETE_LABELCLASS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case POST_OBJECTLISTS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case POST_OBJECTLISTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isSuccess: true,
        isPostSuccess: true,
      };
    case REQUEST_RESET_ISPOSTSUCCESS:
      return { ...state, isPostSuccess: false };
    case POST_OBJECTLISTS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case DELETE_OBJECTLISTS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case DELETE_OBJECTLISTS_SUCCESS:
      return { ...state, isLoading: false, isSuccess: true };
    case DELETE_OBJECTLISTS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case SET_OBJECTLISTS_PAGE:
      return { ...state, projectPage: action.data };
    case SET_OBJECTLISTS_ROWS:
      return { ...state, projectRowsPerPage: action.data };
    case SET_OBJECTLISTS_SORTVALUE:
      return { ...state, sortingValue: action.data };
    case SET_OBJECTLISTS_ISDESC:
      return { ...state, isSortDesc: action.data };
    case SET_OBJECTLISTS_VALUEFORSTATUS:
      return { ...state, valueForStatus: action.data };
    case SET_OBJECTLISTS_VALUEFORASIGNEE:
      return { ...state, valueForAsingee: action.data };
    case SET_OBJECTLISTS_SEARCHEDVALUE:
      return { ...state, searchedValue: action.data };
    case UPDATE_OBJECTLISTS_REQUEST:
      return {
        ...state,
        objectLists: state.objectLists.map((objectlist, i) =>
          objectlist.id === action.data.id ? action.data : objectlist
        ),
      };

    case STOP_LABELPROJECTSLOADING_REQUEST:
      return { ...state, isLoading: false, isSuccess: false };

    case UPDATE_LABELSHAREGROUP_REQUEST:
      return { ...state, isLoading: true, isGroupError: false };
    case UPDATE_LABELSHAREGROUP_SUCCESS:
      return {
        ...state,
        isLoading: false,
        projectDetail: { ...state.projectDetail, sharedgroup: action.data },
        isSuccess: true,
      };
    case UPDATE_LABELSHAREGROUP_FAILURE:
      return {
        ...state,
        isLoading: false,
        isSuccess: false,
        isGroupError: true,
      };

    case POST_AITRAINERLABELPROJECT_REQUEST:
      return { ...state, isLoading: true, isGroupError: false };
    case POST_AITRAINERLABELPROJECT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        projectDetail: { ...state.projectDetail, shareaitrainer: action.data },
        isSuccess: true,
      };
    case POST_AITRAINERLABELPROJECT_FAILURE:
      return {
        ...state,
        isLoading: false,
        isSuccess: false,
        isGroupError: true,
      };

    case GET_WORKAGE_REQEUST:
      return { ...state, isLoading: true, isWorkappLoading: true };
    case GET_WORKAGE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        workage: action.data,
        isSuccess: true,
        isWorkappLoading: false,
      };
    case GET_WORKAGE_FAILURE:
      return {
        ...state,
        isLoading: false,
        isSuccess: false,
        isWorkappLoading: false,
      };

    case GET_AUTOLABELSTATUS_REQUEST:
      return {
        ...state,
        //  isLoading: true
      };
    case GET_AUTOLABELCHART:
      return {
        ...state,
        projectDetail: {
          ...state.projectDetail,
          chart: {
            ...state.projectDetail.chart,
            ready: action.data.ready,
            review: action.data.progress,
          },
        },
      };
    case GET_AUTOLABELSTATUS_SUCCESS:
      return {
        ...state,
        // isLoading: false,
        autoLabelStatus: action.data,
        isSuccess: true,
      };
    case GET_AUTOLABELSTATUS_FAILURE:
      return {
        ...state,
        // isLoading: false,
        isSuccess: false,
      };

    case GET_LABELCLASSES_REQUEST:
      return {
        ...state,
        isGetLabelclassesLoading: true,
        isGetLabelclassesSuccess: false,
        isGetLabelclassesFailure: false,
      };
    case GET_LABELCLASSES_SUCCESS:
      return {
        ...state,
        projectDetail: {
          ...state.projectDetail,
          labelclasses: action.data.labelclass,
        },
        isGetLabelclassesLoading: false,
        isGetLabelclassesSuccess: true,
        isGetLabelclassesFailure: false,
      };
    case GET_LABELCLASSES_FAILURE:
      return {
        ...state,
        isGetLabelclassesLoading: false,
        isGetLabelclassesSuccess: false,
        isGetLabelclassesFailure: true,
      };
    case LABELPROJECTS_RESET:
      return initialState;
    case LABELPROJECT_RESET:
      return { ...state, projectDetail: null };
    case SET_LABELPROJECT_STARTED:
      return { ...state, isProjectStarted: false };
    case RESET_LABELPROJECTASYNC:
      return { ...state, isAsyncRequested: false };
    case SET_LABELPROJECTASYNC:
      return { ...state, isAsyncRequested: true };
    case SET_ISPREVIEW_OPENED:
      return { ...state, isPreviewOpened: true };
    case SET_ISPREVIEW_CLOSED:
      return { ...state, isPreviewOpened: false };
    case SET_IS_PROJECT_REFRESHED:
      return { ...state, isProjectRefreshed: action.data };

    default:
      return state;
  }
};

export default reducer;
