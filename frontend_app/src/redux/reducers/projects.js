export const initialState = {
  // common
  isLoading: false,
  isSuccess: false,
  isDeleted: false,
  totalLength: null,
  // dataset
  isDatasetLoading: false,
  isDatasetSuccess: false,
  isDatasetDeleted: false,
  isDatasetPosted: false,
  dataconnector: null,
  dataconnectors: null,
  dataconnectortype: null,
  columnsForCSV: null,
  filesForQuickStart: null,
  categoryForQuickStart: null,
  connectorTotalLength: null,
  // label
  idListForLabelProject: [],
  categoryForLabelProject: "",
  categoryRestrict: "",
  // project
  isProjectStarted: false,
  isGroupError: false,
  projects: null,
  project: null,
  priority: null,
  recentProjects: null,
  subHyperParameters: null,
  hyperParameterOptionLists: null,
  // skyhubai
  isOpsProjectLoading: false,
  isOpsProjectSuccess: false,
  opsProjects: null,
  // jupyter
  jupyterProjects: null,
  recentJupyterProjects: null,
  // market
  isMarketProjectLoading: false,
};

export const GET_DATACONNECTORTYPE_REQUEST = "GET_DATACONNECTORTYPE_REQUEST";
export const GET_DATACONNECTORTYPE_SUCCESS = "GET_DATACONNECTORTYPE_SUCCESS";
export const GET_DATACONNECTORTYPE_FAILURE = "GET_DATACONNECTORTYPE_FAILURE";

export const GET_DATACONNECTORS_REQUEST = "GET_DATACONNECTORS_REQUEST";
export const GET_DATACONNECTORS_SUCCESS = "GET_DATACONNECTORS_SUCCESS";
export const GET_DATACONNECTORS_FAILURE = "GET_DATACONNECTORS_FAILURE";

export const GET_PROJECTS_REQUEST = "GET_PROJECTS_REQUEST";
export const GET_PROJECTS_SUCCESS = "GET_PROJECTS_SUCCESS";
export const GET_PROJECTS_FAILURE = "GET_PROJECTS_FAILURE";
export const GET_JUPYTERPROJECTS_REQUEST = "GET_JUPYTERPROJECTS_REQUEST";
export const GET_JUPYTERPROJECTS_SUCCESS = "GET_JUPYTERPROJECTS_SUCCESS";
export const GET_JUPYTERPROJECTS_FAILURE = "GET_JUPYTERPROJECTS_FAILURE";
export const GET_OPSPROJECTS_REQUEST = "GET_OPSPROJECTS_REQUEST";

export const GET_RECENTJUPYTERPROJECTS_REQUEST =
  "GET_RECENTJUPYTERPROJECTS_REQUEST";
export const GET_RECENTJUPYTERPROJECTS_SUCCESS =
  "GET_RECENTJUPYTERPROJECTS_SUCCESS";
export const GET_RECENTJUPYTERPROJECTS_FAILURE =
  "GET_RECENTJUPYTERPROJECTS_FAILURE";
export const GET_RECENTPROJECTS_REQUEST = "GET_RECENTPROJECTS_REQUEST";
export const GET_RECENTPROJECTS_SUCCESS = "GET_RECENTPROJECTS_SUCCESS";
export const GET_RECENTPROJECTS_FAILURE = "GET_RECENTPROJECTS_FAILURE";

export const DELETE_PROJECTS_REQUEST = "DELETE_PROJECTS_REQUEST";
export const DELETE_PROJECTS_SUCCESS = "DELETE_PROJECTS_SUCCESS";
export const DELETE_PROJECTS_FAILURE = "DELETE_PROJECTS_FAILURE";

export const DELETE_DATACONNECTORS_REQUEST = "DELETE_DATACONNECTORS_REQUEST";
export const DELETE_DATACONNECTORS_SUCCESS = "DELETE_DATACONNECTORS_SUCCESS";
export const DELETE_DATACONNECTORS_FAILURE = "DELETE_DATACONNECTORS_FAILURE";

export const POST_DATACONNECTOR_REQUEST = "POST_DATACONNECTOR_REQUEST";
export const POST_CONNECTORWITHAUTHFILE_REQUEST =
  "POST_CONNECTORWITHAUTHFILE_REQUEST";
export const POST_CONNECTORWITHFILE_REQUEST = "POST_CONNECTORWITHFILE_REQUEST";
export const POST_DATACONNECTOR_SUCCESS = "POST_DATACONNECTOR_SUCCESS";
export const POST_DATACONNECTOR_FAILURE = "POST_DATACONNECTOR_FAILURE";

export const POST_PURCHASEMODEL_REQUEST = "POST_PURCHASEMODEL_REQUEST";
export const POST_PURCHASEMODEL_SUCCESS = "POST_PURCHASEMODEL_SUCCESS";
export const POST_PURCHASEMODEL_FAILURE = "POST_PURCHASEMODEL_FAILURE";

export const GET_PROJECT_REQUEST = "GET_PROJECT_REQUEST";
export const GET_PROJECT_SUCCESS = "GET_PROJECT_SUCCESS";
export const GET_PROJECT_FAILURE = "GET_PROJECT_FAILURE";

export const PUT_PROJECTNAME_REQUEST = "PUT_PROJECTNAME_REQUEST";
export const PUT_PROJECTNAME_SUCCESS = "PUT_PROJECTNAME_SUCCESS";
export const PUT_PROJECTNAME_FAILURE = "PUT_PROJECTNAME_FAILURE";

export const PUT_PROJECTDESCRIPTION_REQUEST = "PUT_PROJECTDESCRIPTION_REQUEST";
export const PUT_PROJECTDESCRIPTION_SUCCESS = "PUT_PROJECTDESCRIPTION_SUCCESS";
export const PUT_PROJECTDESCRIPTION_FAILURE = "PUT_PROJECTDESCRIPTION_FAILURE";

export const GET_ASYNCPROJECT_REQUEST = "GET_ASYNCPROJECT_REQUEST";
export const GET_ASYNCPROJECT_SUCCESS = "GET_ASYNCPROJECT_SUCCESS";
export const GET_ASYNCPROJECT_FAILURE = "GET_ASYNCPROJECT_FAILURE";

export const SET_PROJECTSTATUS = "SET_PROJECTSTATUS";

export const GET_MARKETPROJECT_REQUEST = "GET_MARKETPROJECT_REQUEST";
export const GET_MARKETPROJECT_SUCCESS = "GET_MARKETPROJECT_SUCCESS";
export const GET_MARKETPROJECT_FAILURE = "GET_MARKETPROJECT_FAILURE";

export const PUT_TRAININGMETHOD_REQUEST = "PUT_TRAININGMETHOD_REQUEST";
export const PUT_ISVERIFY_REQUEST = "PUT_ISVERIFY_REQUEST";
export const PUT_INSTANCETYPE_REQUEST = "PUT_INSTANCETYPE_REQUEST";
export const PUT_ALGORITHMTYPE_REQUEST = "PUT_ALGORITHMTYPE_REQUEST";
export const PUT_OPTION_REQUEST = "PUT_OPTION_REQUEST";
export const PUT_VALUEFORPREDICT_REQUEST = "PUT_VALUEFORPREDICT_REQUEST";

export const START_PROJECT_REQUEST = "START_PROJECT_REQUEST";
export const START_COLAB_PROJECT_SUCCESS = "START_COLAB_PROJECT_SUCCESS";
export const START_PROJECT_SUCCESS = "START_PROJECT_SUCCESS";
export const START_PROJECT_FAILURE = "START_PROJECT_FAILURE";

export const STOP_PROJECT_REQUEST = "STOP_PROJECT_REQUEST";
export const STOP_PROJECT_SUCCESS = "STOP_PROJECT_SUCCESS";
export const STOP_PROJECT_FAILURE = "STOP_PROJECT_FAILURE";

export const POST_FAVORITEMODEL_REQUEST = "POST_FAVORITEMODEL_REQUEST";
export const POST_FAVORITEMODEL_SUCCESS = "POST_FAVORITEMODEL_SUCCESS";
export const POST_FAVORITEMODEL_FAILURE = "POST_FAVORITEMODEL_FAILURE";

export const PUT_PROJECTS_REQUEST = "PUT_PROJECTS_REQUEST";
export const STOP_PROJECTLOADING_REQUEST = "STOP_PROJECTLOADING_REQUEST";
export const PUT_ISPROJECTSTARTED_REQUSEST = "PUT_ISPROJECTSTARTED_REQUSEST";

export const PUT_PROJECTWEBHOOKS_REQUEST = "PUT_PROJECTWEBHOOKS_REQUEST";
export const PUT_PROJECTWEBHOOKS_SUCCESS = "PUT_PROJECTWEBHOOKS_SUCCESS";
export const PUT_PROJECTWEBHOOKS_FAILURE = "PUT_PROJECTWEBHOOKS_FAILURE";

export const UPDATE_SHAREGROUP_REQUEST = "UPDATE_SHAREGROUP_REQUEST";
export const UPDATE_SHAREGROUP_SUCCESS = "UPDATE_SHAREGROUP_SUCCESS";
export const UPDATE_SHAREGROUP_FAILURE = "UPDATE_SHAREGROUP_FAILURE";

export const PUT_PROJECTSTATUS_REQUEST = "PUT_PROJECTSTATUS_REQUEST";
export const PUT_PROJECTSTATUS_SUCCESS = "PUT_PROJECTSTATUS_SUCCESS";
export const PUT_PROJECTSTATUS_FAILURE = "PUT_PROJECTSTATUS_FAILURE";

export const PUT_PROJECTSERVICEAPP_REQUEST = "PUT_PROJECTSERVICEAPP_REQUEST";
export const PUT_PROJECTSERVICEAPP_REQUEST_WITHOUT_LOADING =
  "PUT_PROJECTSERVICEAPP_REQUEST_WITHOUT_LOADING";
export const PUT_PROJECTSERVICEAPP_SUCCESS = "PUT_PROJECTSERVICEAPP_SUCCESS";
export const PUT_PROJECTSERVICEAPP_FAILURE = "PUT_PROJECTSERVICEAPP_FAILURE";

export const DELETE_OPSPROJECTS_REQUEST = "DELETE_OPSPROJECTS_REQUEST";
export const DELETE_OPSPROJECTS_SUCCESS = "DELETE_OPSPROJECTS_SUCCESS";
export const DELETE_OPSPROJECTS_FAILURE = "DELETE_OPSPROJECTS_FAILURE";

export const POST_OPSPROJECT_REQUEST = "POST_OPSPROJECT_REQUEST";
export const POST_OPSPROJECT_SUCCESS = "POST_OPSPROJECT_SUCCESS";
export const POST_OPSPROJECT_FAILURE = "POST_OPSPROJECT_FAILURE";

export const GET_OPSPROJECT_REQUEST = "GET_OPSPROJECT_REQUEST";
export const GET_OPSPROJECT_SUCCESS = "GET_OPSPROJECT_SUCCESS";
export const GET_OPSPROJECT_FAILURE = "GET_OPSPROJECT_FAILURE";

export const PUT_OPSPROJECT_REQUEST = "PUT_OPSPROJECT_REQUEST";
export const PUT_OPSPROJECT_SUCCESS = "PUT_OPSPROJECT_SUCCESS";
export const PUT_OPSPROJECT_FAILURE = "PUT_OPSPROJECT_FAILURE";

export const POST_OPSPROJECTSELLPRICE_REQUEST =
  "POST_OPSPROJECTSELLPRICE_REQUEST";
export const POST_OPSPROJECTSELLPRICE_SUCCESS =
  "POST_OPSPROJECTSELLPRICE_SUCCESS";
export const POST_OPSPROJECTSELLPRICE_FAILURE =
  "POST_OPSPROJECTSELLPRICE_FAILURE";

export const SET_OPSPROJECT_LOADING = "SET_OPSPROJECT_LOADING";
export const SET_OPSPROJECT_UNLOADING = "SET_OPSPROJECT_UNLOADING";

export const DELETE_JUPYTERPROJECTS_REQUEST = "DELETE_JUPYTERPROJECTS_REQUEST";
export const DELETE_JUPYTERPROJECTS_SUCCESS = "DELETE_JUPYTERPROJECTS_SUCCESS";
export const DELETE_JUPYTERPROJECTS_FAILURE = "DELETE_JUPYTERPROJECTS_FAILURE";

export const POST_JUPYTERPROJECT_REQUEST = "POST_JUPYTERPROJECT_REQUEST";
export const POST_JUPYTERPROJECT_SUCCESS = "POST_JUPYTERPROJECT_SUCCESS";
export const POST_JUPYTERPROJECT_FAILURE = "POST_JUPYTERPROJECT_FAILURE";

export const GET_JUPYTERPROJECT_REQUEST = "GET_JUPYTERPROJECT_REQUEST";
export const GET_JUPYTERPROJECT_SUCCESS = "GET_JUPYTERPROJECT_SUCCESS";
export const GET_JUPYTERPROJECT_FAILURE = "GET_JUPYTERPROJECT_FAILURE";

export const PUT_JUPYTERPROJECT_REQUEST = "PUT_JUPYTERPROJECT_REQUEST";
export const PUT_JUPYTERPROJECT_SUCCESS = "PUT_JUPYTERPROJECT_SUCCESS";
export const PUT_JUPYTERPROJECT_FAILURE = "PUT_JUPYTERPROJECT_FAILURE";

export const SET_JUPYTERPROJECT_LOADING = "SET_JUPYTERPROJECT_LOADING";
export const SET_JUPYTERPROJECT_UNLOADING = "SET_JUPYTERPROJECT_UNLOADING";

export const PROJECTS_RESET = "PROJECTS_RESET";

export const ADD_IDLIST_FOR_LABELPROJECT = "ADD_IDLIST_FOR_LABELPROJECT";
export const DELETE_IDLIST_FOR_LABELPROJECT = "DELETE_IDLIST_FOR_LABELPROJECT";

export const ADD_FILES_FOR_QUICK_START = "ADD_FILES_FOR_QUICK_START";
export const DELETE_FILES_FOR_QUICK_START = "DELETE_FILES_FOR_QUICK_START";

export const PUT_MARKETPROJECT_REQUEST = "PUT_MARKETPROJECT_REQUEST";
export const PUT_MARKETPROJECT_SUCCESS = "PUT_MARKETPROJECT_SUCCESS";
export const PUT_MARKETPROJECT_FAILURE = "PUT_MARKETPROJECT_FAILURE";

export const SET_LISTS_SEARCHED_VALUE = "SET_LISTS_SEARCHED_VALUE";

export const GET_DATACONNECTOR_INFO_REQUEST = "GET_DATACONNECTOR_INFO_REQUEST";
export const GET_DATACONNECTOR_INFO_SUCCESS = "GET_DATACONNECTOR_INFO_SUCCESS";
export const GET_DATACONNECTOR_INFO_FAILURE = "GET_DATACONNECTOR_INFO_FAILURE";

export const SET_SUB_HYPER_PARAMETERS = "SET_SUB_HYPER_PARAMETERS";

export const SET_HYPER_PARAMETER_OPTION_LISTS =
  "SET_HYPER_PARAMETER_OPTION_LISTS";

export const getOpsProjectsRequestAction = (data) => ({
  type: GET_OPSPROJECTS_REQUEST,
  data,
});
export const postOpsProjectRequestAction = (data) => ({
  type: POST_OPSPROJECT_REQUEST,
  data: data,
});
export const postOpsProjectSellPriceRequestAction = (data) => ({
  type: POST_OPSPROJECTSELLPRICE_REQUEST,
  data: data,
});
export const getJupyterProjectRequestAction = (data) => ({
  type: GET_JUPYTERPROJECT_REQUEST,
  data: data,
});
export const getJupyterProjectsRequestAction = (data) => ({
  type: GET_JUPYTERPROJECTS_REQUEST,
  data,
});
export const deleteJupyterProjectRequestAction = (data) => ({
  type: DELETE_JUPYTERPROJECTS_REQUEST,
  data: data,
});
export const postJupyterProjectRequestAction = (data) => ({
  type: POST_JUPYTERPROJECT_REQUEST,
  data: data,
});

export const getDataconnectortypeRequestAction = () => ({
  type: GET_DATACONNECTORTYPE_REQUEST,
});
export const getDataconnectorsRequestAction = (data) => ({
  type: GET_DATACONNECTORS_REQUEST,
  data,
});
export const getProjectsRequestAction = (data) => ({
  type: GET_PROJECTS_REQUEST,
  data,
});
export const getRecentProjectsRequestAction = (data) => ({
  type: GET_RECENTPROJECTS_REQUEST,
  data,
});
export const getRecentJupyterProjectsRequestAction = (data) => ({
  type: GET_RECENTJUPYTERPROJECTS_REQUEST,
  data,
});
export const deleteProjectsRequestAction = (data) => ({
  type: DELETE_PROJECTS_REQUEST,
  data,
});
export const deleteOpsProjectsRequestAction = (data) => ({
  type: DELETE_OPSPROJECTS_REQUEST,
  data,
});
export const deleteJupyterProjectsRequestAction = (data) => ({
  type: DELETE_JUPYTERPROJECTS_REQUEST,
  data,
});
export const deleteDataConnectorsRequestAction = (data) => ({
  type: DELETE_DATACONNECTORS_REQUEST,
  data,
});
export const setJupyterProjectLoadingRequestAction = (data) => ({
  type: SET_JUPYTERPROJECT_LOADING,
  data,
});
export const setJupyterProjectUnloadingRequestAction = (data) => ({
  type: SET_JUPYTERPROJECT_UNLOADING,
  data,
});
export const postDataConnectorRequestAction = (data) => ({
  type: POST_DATACONNECTOR_REQUEST,
  data,
});
export const postConnectorWithAuthFileRequestAction = (data) => ({
  type: POST_CONNECTORWITHAUTHFILE_REQUEST,
  data,
});
export const postConnectorWithFileRequestAction = (data) => ({
  type: POST_CONNECTORWITHFILE_REQUEST,
  data,
});
export const postPurchaseModelRequestAction = (data) => ({
  type: POST_PURCHASEMODEL_REQUEST,
  data,
});
export const getProjectRequestAction = (data) => ({
  type: GET_PROJECT_REQUEST,
  data,
});
export const getOpsProjectRequestAction = (data) => ({
  type: GET_OPSPROJECT_REQUEST,
  data,
});
export const setOpsProjectLoadingRequestAction = (data) => ({
  type: SET_OPSPROJECT_LOADING,
  data,
});
export const setOpsProjectUnloadingRequestAction = (data) => ({
  type: SET_OPSPROJECT_UNLOADING,
  data,
});
export const getMarketProjectRequestAction = (data) => ({
  type: GET_MARKETPROJECT_REQUEST,
  data,
});
export const putProjectNameRequestAction = (data) => ({
  type: PUT_PROJECTNAME_REQUEST,
  data,
});
export const putProjectDescriptionRequestAction = (data) => ({
  type: PUT_PROJECTDESCRIPTION_REQUEST,
  data,
});
export const getAsyncProjectRequestAction = (data) => ({
  type: GET_ASYNCPROJECT_REQUEST,
  data,
});
export const setProjectStatusAction = (data) => ({
  type: SET_PROJECTSTATUS,
  data,
});
export const putTrainingMethodRequestAction = (data) => ({
  type: PUT_TRAININGMETHOD_REQUEST,
  data,
});
export const putIsVerifydRequestAction = (data) => ({
  type: PUT_ISVERIFY_REQUEST,
  data,
});
export const putInstanceTypeRequestAction = (data) => ({
  type: PUT_INSTANCETYPE_REQUEST,
  data,
});
export const putAlgorithmTypeRequestAction = (data) => ({
  type: PUT_ALGORITHMTYPE_REQUEST,
  data,
});
export const putOptionRequestAction = (data) => ({
  type: PUT_OPTION_REQUEST,
  data,
});
export const putValueForPredictRequestAction = (data) => ({
  type: PUT_VALUEFORPREDICT_REQUEST,
  data,
});

export const startProjectRequestAction = (data) => ({
  type: START_PROJECT_REQUEST,
  data,
});
export const stopProjectRequestAction = (data) => ({
  type: STOP_PROJECT_REQUEST,
  data,
});
export const postFavoriteModelRequestAction = (data) => ({
  type: POST_FAVORITEMODEL_REQUEST,
  data,
});
export const putProjectsRequestAction = (data) => ({
  type: PUT_PROJECTS_REQUEST,
  data,
});
export const stopProjectsLoadingRequestAction = () => ({
  type: STOP_PROJECTLOADING_REQUEST,
});
export const putIsProjectStartedRequest = () => ({
  type: PUT_ISPROJECTSTARTED_REQUSEST,
});
export const putProjectWebhooksRequest = (data) => ({
  type: PUT_PROJECTWEBHOOKS_REQUEST,
  data,
});

export const updateShareGroupRequestAction = (data) => ({
  type: UPDATE_SHAREGROUP_REQUEST,
  data,
});
export const projectsResetRequestAction = () => ({
  type: PROJECTS_RESET,
});
export const putProjectStatusRequestAction = (data) => ({
  type: PUT_PROJECTSTATUS_REQUEST,
  data,
});
export const putProjectServiceAppRequestAction = (data) => ({
  type: PUT_PROJECTSERVICEAPP_REQUEST,
  data,
});
export const putProjectServiceAppRequestActionWithoutLoading = (data) => ({
  type: PUT_PROJECTSERVICEAPP_REQUEST_WITHOUT_LOADING,
  data,
});
export const addIdListForLabelProjectRequestAction = (data) => ({
  type: ADD_IDLIST_FOR_LABELPROJECT,
  data,
});

export const deleteIdListForLabelProjectRequestAction = () => ({
  type: DELETE_IDLIST_FOR_LABELPROJECT,
});

export const addFilesForQuickStart = (data) => ({
  type: ADD_FILES_FOR_QUICK_START,
  data,
});

export const deleteFilesForQuickStart = () => ({
  type: DELETE_FILES_FOR_QUICK_START,
});

export const putMarketProjectRequestAction = (data) => ({
  type: PUT_MARKETPROJECT_REQUEST,
  data: data,
});

export const setListsSearchedValue = (data) => ({
  type: SET_LISTS_SEARCHED_VALUE,
  data: data,
});

export const getDataConnectorInfoRequestAction = (data) => ({
  type: GET_DATACONNECTOR_INFO_REQUEST,
  data: data,
});

export const setSubHyperParameters = (data) => ({
  type: SET_SUB_HYPER_PARAMETERS,
  data: data,
});

export const setHyperParameterOptionLists = (data) => ({
  type: SET_HYPER_PARAMETER_OPTION_LISTS,
  data: data,
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_DATACONNECTORTYPE_REQUEST:
      return { ...state, isDatasetLoading: true, isDatasetSuccess: false };
    case GET_DATACONNECTORTYPE_SUCCESS:
      return {
        ...state,
        isDatasetLoading: false,
        isDatasetSuccess: true,
        dataconnectortype: action.data,
      };
    case GET_DATACONNECTORTYPE_FAILURE:
      return { ...state, isDatasetLoading: false, isDatasetSuccess: false };

    case GET_DATACONNECTORS_REQUEST:
      return { ...state, isDatasetLoading: true, isDatasetSuccess: false };
    case GET_DATACONNECTORS_SUCCESS:
      return {
        ...state,
        isDatasetLoading: false,
        isDatasetSuccess: true,
        dataconnectors: action.data.dataconnectors,
        connectorTotalLength: action.data.totalLength,
      };
    case GET_DATACONNECTORS_FAILURE:
      return { ...state, isDatasetLoading: false, isDatasetSuccess: false };
    case GET_PROJECTS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_PROJECTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        projects: action.data.projects,
        // priority: action.data.priority,
        totalLength: action.data.totalLength,
        isSuccess: true,
      };
    case GET_PROJECTS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };
    case GET_JUPYTERPROJECTS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_JUPYTERPROJECTS_SUCCESS:
      return {
        ...state,
        jupyterProjects: action.data.projects,
        jupyterTotalLength: action.data.totalLength,
        isLoading: false,
        isSuccess: true,
      };
    case SET_JUPYTERPROJECT_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case SET_JUPYTERPROJECT_UNLOADING:
      return {
        ...state,
        isLoading: false,
      };
    case GET_JUPYTERPROJECTS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };
    case GET_OPSPROJECTS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_OPSPROJECT_REQUEST:
      return {
        ...state,
        isLoading: true,
        isSuccess: false,
        isOpsProjectLoading: true,
      };
    case GET_RECENTPROJECTS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_RECENTJUPYTERPROJECTS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_RECENTJUPYTERPROJECTS_SUCCESS:
      return {
        ...state,
        recentJupyterProjects: action.data.projects,
        isLoading: false,
        isSuccess: true,
      };
    case GET_RECENTJUPYTERPROJECTS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };
    case GET_RECENTPROJECTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        recentProjects: action.data.projects,
        // priority: action.data.priority,
        isSuccess: true,
      };
    case GET_RECENTPROJECTS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case DELETE_PROJECTS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case DELETE_PROJECTS_SUCCESS:
      return { ...state, isLoading: false, isSuccess: true };
    case DELETE_PROJECTS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case DELETE_DATACONNECTORS_REQUEST:
      return { ...state, isDatasetLoading: true, isDatasetSuccess: false };
    case DELETE_DATACONNECTORS_SUCCESS:
      return {
        ...state,
        isDatasetLoading: false,
        isDatasetSuccess: true,
        isDatasetDeleted: true,
      };
    case DELETE_DATACONNECTORS_FAILURE:
      return {
        ...state,
        isDatasetLoading: false,
        isDatasetSuccess: false,
        isDatasetDeleted: false,
      };

    case POST_DATACONNECTOR_REQUEST:
      return {
        ...state,
        isDatasetLoading: true,
        isDatasetPosted: false,
        isDatasetSuccess: false,
      };
    case POST_CONNECTORWITHAUTHFILE_REQUEST:
      return {
        ...state,
        isDatasetLoading: true,
        isDatasetPosted: false,
        isDatasetSuccess: false,
      };
    case POST_CONNECTORWITHFILE_REQUEST:
      return {
        ...state,
        isDatasetLoading: true,
        isDatasetPosted: false,
        isDaatsetSuccess: false,
      };
    case POST_DATACONNECTOR_SUCCESS:
      return {
        ...state,
        isDatasetLoading: false,
        isDatasetPosted: true,
        isDatasetSuccess: true,
        dataconnectors: [action.data, ...state.dataconnectors],
      };
    case POST_DATACONNECTOR_FAILURE:
      return { ...state, isDatasetLoading: false, isDatasetSuccess: false };
    case POST_PURCHASEMODEL_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case POST_PURCHASEMODEL_SUCCESS:
      return { ...state, isLoading: false, isSuccess: true };
    case POST_PURCHASEMODEL_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };
    case POST_OPSPROJECTSELLPRICE_REQUEST:
      return {
        ...state,
        isLoading: true,
        isOpsProjectSellPricePosted: false,
        isSuccess: false,
      };
    case POST_OPSPROJECTSELLPRICE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isOpsProjectSellPricePosted: true,
        isSuccess: true,
      };
    case POST_OPSPROJECTSELLPRICE_FAILURE:
      return {
        ...state,
        isLoading: false,
        isSuccess: false,
      };

    case GET_MARKETPROJECT_REQUEST:
      return {
        ...state,
        isLoading: true,
        isSuccess: false,
        isMarketProjectLoading: true,
      };
    case GET_MARKETPROJECT_SUCCESS:
      return {
        ...state,
        projectDetail: action.data,
        isLoading: false,
        isSuccess: true,
        isMarketProjectLoading: false,
      };
    case GET_MARKETPROJECT_FAILURE:
      return {
        ...state,
        isLoading: false,
        isSuccess: false,
        isMarketProjectLoading: false,
      };

    case GET_PROJECT_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case GET_PROJECT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        project: action.data,
        isSuccess: true,
      };
    case GET_OPSPROJECT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        opsProject: action.data,
        project: action.data,
        isSuccess: true,
        isOpsProjectLoading: false,
        isOpsProjectSuccess: true,
      };
    case SET_OPSPROJECT_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case SET_OPSPROJECT_UNLOADING:
      return {
        ...state,
        isLoading: false,
      };
    case GET_PROJECT_FAILURE:
      return {
        ...state,
        isLoading: false,
        isSuccess: false,
        isOpsProjectLoading: false,
        isOpsProjectSuccess: false,
      };

    case PUT_PROJECTNAME_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case PUT_PROJECTNAME_SUCCESS:
      return {
        ...state,
        isLoading: false,
        project: { ...state.project, projectName: action.data },
        isSuccess: true,
      };
    case PUT_PROJECTNAME_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case PUT_PROJECTDESCRIPTION_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case PUT_PROJECTDESCRIPTION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        project: { ...state.project, description: action.data },
        isSuccess: true,
      };
    case PUT_PROJECTDESCRIPTION_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case GET_ASYNCPROJECT_REQUEST:
      return { ...state, isSuccess: false };
    case GET_ASYNCPROJECT_SUCCESS:
      return {
        ...state,
        project: {
          ...state.project,
          analyticsgraphs: action.data.analyticsgraphs,
          models: action.data.models,
          status: action.data.status,
        },
        isSuccess: true,
      };
    case GET_ASYNCPROJECT_FAILURE:
      return { ...state, isSuccess: false };

    case SET_PROJECTSTATUS:
      return {
        ...state,
        project: {
          ...state.project,
          status: action.data.status,
        },
        isSuccess: true,
      };

    case PUT_TRAININGMETHOD_REQUEST:
      return {
        ...state,
        project: { ...state.project, trainingMethod: action.data },
      };

    case PUT_ISVERIFY_REQUEST:
      return {
        ...state,
        project: { ...state.project, isVerify: action.data },
      };
    case PUT_INSTANCETYPE_REQUEST:
      return {
        ...state,
        project: { ...state.project, instanceType: action.data },
      };
    case PUT_ALGORITHMTYPE_REQUEST:
      return {
        ...state,
        project: { ...state.project, algorithmType: action.data },
      };
    case PUT_OPTION_REQUEST:
      return { ...state, project: { ...state.project, option: action.data } };
    case PUT_VALUEFORPREDICT_REQUEST:
      return {
        ...state,
        project: { ...state.project, valueForPredictColumnId: action.data },
      };

    case START_PROJECT_REQUEST:
      return {
        ...state,
        isLoading: true,
        isProjectStarted: false,
        isSuccess: false,
      };
    case START_COLAB_PROJECT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        project: action.data,
        isProjectStarted: true,
        isSuccess: true,
      };
    case START_PROJECT_SUCCESS:
      return {
        ...state,
        isLoading: true,
        project: action.data,
        isProjectStarted: true,
        isSuccess: true,
      };
    case START_PROJECT_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case STOP_PROJECT_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case STOP_PROJECT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        project: {
          ...state.project,
          status: action.data.status,
          statusText: action.data.statusText,
        },
        isSuccess: true,
      };
    case STOP_PROJECT_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case POST_FAVORITEMODEL_REQUEST:
      return { ...state, isSuccess: false };
    case POST_FAVORITEMODEL_SUCCESS:
      return {
        ...state,
        project: {
          ...state.project,
          models: state.project.models.map((model, i) =>
            model.id === action.data.id
              ? { ...model, isFavorite: action.data.isFavorite }
              : model
          ),
        },
        isSuccess: true,
      };
    case POST_FAVORITEMODEL_FAILURE:
      return { ...state, isSuccess: false };

    case PUT_PROJECTS_REQUEST:
      return { ...state, projects: [...state.projects, action.data] };
    case STOP_PROJECTLOADING_REQUEST:
      return { ...state, isLoading: false, isSuccess: false };
    case PUT_ISPROJECTSTARTED_REQUSEST:
      return { ...state, isProjectStarted: false };

    case PUT_PROJECTWEBHOOKS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case PUT_PROJECTWEBHOOKS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        project: {
          ...state.project,
          webhookMethod: action.data.webhookMethod,
          webhookURL: action.data.webhookURL,
        },
        isSuccess: true,
      };
    case PUT_PROJECTWEBHOOKS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case PUT_PROJECTSTATUS_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case PUT_PROJECTSTATUS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        project: { ...state.project, status: action.data.status },
        isSuccess: true,
      };
    case PUT_PROJECTSTATUS_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case UPDATE_SHAREGROUP_REQUEST:
      return { ...state, isLoading: true, isGroupError: false };
    case UPDATE_SHAREGROUP_SUCCESS:
      return {
        ...state,
        isLoading: false,
        project: { ...state.project, sharedgroup: action.data },
        isSuccess: true,
      };
    case UPDATE_SHAREGROUP_FAILURE:
      return {
        ...state,
        isLoading: false,
        isSuccess: false,
        isGroupError: true,
      };

    case PUT_PROJECTSERVICEAPP_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case PUT_PROJECTSERVICEAPP_REQUEST_WITHOUT_LOADING:
      return { ...state, isSuccess: false };
    case PUT_PROJECTSERVICEAPP_SUCCESS:
      return {
        ...state,
        isLoading: false,
        project: {
          ...state.project,
          background: action.data.background,
          resultJson: action.data.resultJson,
        },
        isSuccess: true,
      };
    case PUT_PROJECTSERVICEAPP_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };
    case ADD_IDLIST_FOR_LABELPROJECT:
      return {
        ...state,
        idListForLabelProject: action.data.idListForLabeling,
        categoryForLabelProject: action.data.firstSelectedType,
        categoryRestrict: action.data.firstSelectedCategory,
      };
    case DELETE_IDLIST_FOR_LABELPROJECT:
      return {
        ...state,
        idListForLabelProject: [],
        categoryForLabelProject: "",
        categoryRestrict: "",
      };
    case ADD_FILES_FOR_QUICK_START:
      return {
        ...state,
        filesForQuickStart: action.data.file,
        categoryForQuickStart: action.data.category,
        columnsForCSV: action.data.columnsForCSV,
      };
    case DELETE_FILES_FOR_QUICK_START:
      return {
        ...state,
        filesForQuickStart: null,
        categoryForQuickStart: null,
        columnsForCSV: null,
      };
    case PROJECTS_RESET:
      return initialState;
    case PUT_MARKETPROJECT_REQUEST:
      return { ...state, isLoading: true, isSuccess: false };
    case PUT_MARKETPROJECT_SUCCESS:
      if (action.data.type === "name") {
        return {
          ...state,
          isLoading: false,
          project: {
            ...state.project,
            name: action.data.params.projectName,
            projectName: action.data.params.projectName,
          },
          isSuccess: true,
        };
      } else if (action.data.type === "description") {
        return {
          ...state,
          isLoading: false,
          project: {
            ...state.project,
            description: action.data.params.description,
          },
          isSuccess: true,
        };
      } else if (action.data.type === "info") {
        return {
          ...state,
          isLoading: false,
          project: {
            ...state.project,
            name: action.data.params.projectName,
            projectName: action.data.params.projectName,
            description: action.data.params.description,
          },
          isSuccess: true,
        };
      }
    case PUT_MARKETPROJECT_FAILURE:
      return { ...state, isLoading: false, isSuccess: false };

    case SET_LISTS_SEARCHED_VALUE:
      return { ...state, searchedValue: action.data };

    case GET_DATACONNECTOR_INFO_REQUEST:
      return {
        ...state,
        isDatasetLoading: true,
        isDatasetSuccess: false,
      };
    case GET_DATACONNECTOR_INFO_SUCCESS:
      return {
        ...state,
        dataconnector: action.data,
        isDatasetLoading: false,
        isDatasetSuccess: true,
      };
    case GET_DATACONNECTOR_INFO_FAILURE:
      return {
        ...state,
        isDatasetLoading: false,
        isDatasetSuccess: false,
      };

    case SET_SUB_HYPER_PARAMETERS:
      return { ...state, subHyperParameters: action.data };

    case SET_HYPER_PARAMETER_OPTION_LISTS:
      return { ...state, hyperParameterOptionLists: action.data };

    default:
      return state;
  }
};

export default reducer;
