export const initialState = {
  isAskSnackbarOpen: false,
  isInformSnackbarOpen: false,
  category: null,
  message: null,
  requestAction: null,
  shouldCloseModal: false,
  shouldRenderPayple: false,
  shouldRenderAction: true,
  shouldGoToMainPage: false,
  isPlanAlertOpen: false,
  datas: null,
};

export const CLOSE_INFORM_SNACKBAR = "CLOSE_INFORM_SNACKBAR";
export const CLOSE_ASK_SNACKBAR = "CLOSE_ASK_SNACKBAR";
export const CLOSE_MODAL_CONTENT = "CLOSE_MODAL_CONTENT";
export const OPEN_MODAL_CONTENT = "OPEN_MODAL_CONTENT";

export const REQUEST_SUCCESS_MESSAGE = "REQUEST_SUCCESS_MESSAGE";
export const REQUEST_ERROR_MESSAGE = "REQUEST_ERROR_MESSAGE";

export const ASK_MODAL_REQUEST = "ASK_MODAL_REQUEST";
export const ASK_APPCODE_POST = "ASK_APPCODE_POST";
export const ASK_COMPANYLOGO_DELETE = "ASK_COMPANYLOGO_DELETE";

export const ASK_CANCEL_PLAN = "ASK_CANCEL_PLAN";
export const ASK_NEXTCANCEL_PLAN = "ASK_NEXTCANCEL_PLAN";

export const ASK_CHANGE_PLAN = "ASK_CHANGE_PLAN";
export const RENDER_PAYPLE_PAGE = "RENDER_PAYPLE_PAGE";

export const ASK_DELETE_LABELPROJECT = "ASK_DELETE_LABELPROJECT";
export const ASK_START_NEWLABELPROJECT = "ASK_START_NEWLABELPROJECT";
export const ASK_PUT_LABELPROJECT = "ASK_PUT_LABELPROJECT";
export const ASK_PUT_MARKETPROJECT = "ASK_PUT_MARKETPROJECT";
export const ASK_DELETE_LABELCLASS = "ASK_DELETE_LABELCLASS";

export const ASK_PROJECT_FROMLABEL = "ASK_PROJECT_FROMLABEL";
export const ASK_EXPORT_COCO = "ASK_EXPORT_COCO";
export const ASK_EXPORT_VOC = "ASK_EXPORT_VOC";
export const ASK_EXPORT_DATA = "ASK_EXPORT_DATA";
export const RESET_MESSAGE = "RESET_MESSAGE";
export const RENDER_REQUEST_ACTION = "RENDER_REQUEST_ACTION";
export const ASK_DELETE_OBJECTLISTS = "ASK_DELETE_OBJECTLISTS";
export const ASK_DELETE_PROJECTS = "ASK_DELETE_PROJECTS";
export const ASK_DELETE_OPSPROJECTS = "ASK_DELETE_OPSPROJECTS";
export const ASK_DELETE_JUPYTERPROJECTS = "ASK_DELETE_JUPYTERPROJECTS";
export const ASK_DELETE_DATACONNECTORS = "ASK_DELETE_DATACONNECTORS";

export const ASK_CHANGE_PROJECTNAME = "ASK_CHANGE_PROJECTNAME";
export const ASK_CHANGE_PROJECTDESCRIPTION = "ASK_CHANGE_PROJECTDESCRIPTION";
export const ASK_START_PROJECT = "ASK_START_PROJECT";
export const ASK_STOP_PROJECT = "ASK_STOP_PROJECT";

export const ASK_GOTO_MAINPAGE = "ASK_GOTO_MAINPAGE";
export const GOTO_MAINPAGE_REQUEST = "GOTO_MAINPAGE_REQUEST";
export const SET_MAINPAGE_DEFAULT = "SET_MAINPAGE_DEFAULT";
export const OPEN_PLANALERT_MODAL = "OPEN_PLANALERT_MODAL";
export const CLOSE_PLANALERT_MODAL = "CLOSE_PLANALERT_MODAL";

export const ASK_ACCEPT_GROUP = "ASK_ACCEPT_GROUP";
export const ASK_REFUSE_GROUP = "ASK_REFUSE_GROUP";
export const ASK_DELETE_MEMBER = "ASK_DELETE_MEMBER";
export const ASK_DELETE_GROUP = "ASK_DELETE_GROUP";
export const ASK_LEAVE_GROUP = "ASK_LEAVE_GROUP";
export const MESSAGES_RESEET = "MESSAGES_RESEET";

export const openSuccessSnackbarRequestAction = (data) => ({
  type: REQUEST_SUCCESS_MESSAGE,
  data,
});
export const openErrorSnackbarRequestAction = (data) => ({
  type: REQUEST_ERROR_MESSAGE,
  data,
});
export const closeInformSnackbarRequestAction = () => ({
  type: CLOSE_INFORM_SNACKBAR,
});
export const closeAskSnackbarRequestAction = () => ({
  type: CLOSE_ASK_SNACKBAR,
});
export const closeModalRequestAction = () => ({
  type: CLOSE_MODAL_CONTENT,
});
export const openModalRequestAction = () => ({
  type: OPEN_MODAL_CONTENT,
});

export const askModalRequestAction = () => ({
  type: ASK_MODAL_REQUEST,
});
export const askAppCodeRequestAction = () => ({
  type: ASK_APPCODE_POST,
});
export const askDeleteLogoRequestAction = () => ({
  type: ASK_COMPANYLOGO_DELETE,
});
export const askCancelPlanRequestAction = () => ({
  type: ASK_CANCEL_PLAN,
});
export const askCancelNextPlanReqeustAction = () => ({
  type: ASK_NEXTCANCEL_PLAN,
});

export const askChangPlanRequestAction = (data) => ({
  type: ASK_CHANGE_PLAN,
  data,
});
export const renderPayplePageReqeustAction = () => ({
  type: RENDER_PAYPLE_PAGE,
});

export const askDeleteLabelProjectReqeustAction = (data) => ({
  type: ASK_DELETE_LABELPROJECT,
  data,
});
export const askLabelProjectDetailRequestAction = (data) => ({
  type: ASK_PUT_LABELPROJECT,
  data: data,
});
export const askDeleteLabelClassRequestAction = (data) => ({
  type: ASK_DELETE_LABELCLASS,
  data: data,
});

export const askMarketProjectDetailRequestAction = (data) => ({
  type: ASK_PUT_MARKETPROJECT,
  data: data,
});
export const askProjectFromLabelRequestAction = () => ({
  type: ASK_PROJECT_FROMLABEL,
});
export const askExportCocoRequestAction = () => ({
  type: ASK_EXPORT_COCO,
});
export const askExportVocRequestAction = () => ({
  type: ASK_EXPORT_VOC,
});
export const askExportDataRequestAction = () => ({
  type: ASK_EXPORT_DATA,
});
export const askResetMessageRequestAction = () => ({
  type: RESET_MESSAGE,
});
export const renderLabelExportRequestAction = () => ({
  type: RENDER_REQUEST_ACTION,
});

export const askDeleteObjectListsReqeustAction = (data) => ({
  type: ASK_DELETE_OBJECTLISTS,
  data: data,
});
export const askDeleteProjectsReqeustAction = (data) => ({
  type: ASK_DELETE_PROJECTS,
  data: data,
});
export const askDeleteOpsProjectsReqeustAction = (data) => ({
  type: ASK_DELETE_OPSPROJECTS,
  data: data,
});
export const askDeleteJupyterProjectsReqeustAction = (data) => ({
  type: ASK_DELETE_JUPYTERPROJECTS,
  data: data,
});
export const askDeleteConnectorRequestAction = (data) => ({
  type: ASK_DELETE_DATACONNECTORS,
  data: data,
});
export const askChangeProjectNameRequestAction = (data) => ({
  type: ASK_CHANGE_PROJECTNAME,
  data: data,
});
export const askChangeProjectDescriptionRequestAction = (data) => ({
  type: ASK_CHANGE_PROJECTDESCRIPTION,
  data: data,
});
export const askStartProjectRequestAction = (data) => ({
  type: ASK_START_PROJECT,
  data: data,
});
export const askStopProjectRequestAction = (data) => ({
  type: ASK_STOP_PROJECT,
  data: data,
});
export const askGoToMainPageRequestAction = () => ({
  type: ASK_GOTO_MAINPAGE,
});
export const goToMainPageRequestAction = () => ({
  type: GOTO_MAINPAGE_REQUEST,
});
export const setMainPageSettingRequestAction = () => ({
  type: SET_MAINPAGE_DEFAULT,
});
export const setPlanModalOpenRequestAction = () => ({
  type: OPEN_PLANALERT_MODAL,
});
export const setPlanModalCloseRequestAction = () => ({
  type: CLOSE_PLANALERT_MODAL,
});
export const askAcceptGroupRequestAction = (data) => ({
  type: ASK_ACCEPT_GROUP,
  data,
});
export const askRefuseGroupRequestAction = (data) => ({
  type: ASK_REFUSE_GROUP,
  data,
});
export const askDeleteMemberFromGroup = (data) => ({
  type: ASK_DELETE_MEMBER,
  data,
});
export const askDeleteGroupRequestAction = (data) => ({
  type: ASK_DELETE_GROUP,
  data,
});
export const askLeaveGroupRequestAction = (data) => ({
  type: ASK_LEAVE_GROUP,
  data,
});
export const messagesResetRequestAction = () => ({
  type: MESSAGES_RESEET,
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CLOSE_INFORM_SNACKBAR:
      return { ...state, isInformSnackbarOpen: false };
    case CLOSE_ASK_SNACKBAR:
      return { ...state, isAskSnackbarOpen: false, datas: null };
    case CLOSE_MODAL_CONTENT:
      return { ...state, shouldCloseModal: true, datas: null };
    case OPEN_MODAL_CONTENT:
      return { ...state, shouldCloseModal: false, datas: null };

    case REQUEST_SUCCESS_MESSAGE:
      return {
        ...state,
        isAskSnackbarOpen: false,
        isInformSnackbarOpen: true,
        category: "success",
        message: action.data,
        shouldCloseModal: false,
      };
    case REQUEST_ERROR_MESSAGE:
      return {
        ...state,
        isAskSnackbarOpen: false,
        isInformSnackbarOpen: true,
        category: "error",
        message: action.data,
      };

    case ASK_MODAL_REQUEST:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "창을 닫으시겠습니까?",
        requestAction: "closeModal",
        shouldCloseModal: false,
      };
    case ASK_APPCODE_POST:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "앱코드를 재발급 하시겠습니까?",
        requestAction: "postAppCode",
      };
    case ASK_PUT_MARKETPROJECT:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: action.data.message,
        requestAction: action.data.requestAction,
        datas: action.data.data,
      };
    case ASK_COMPANYLOGO_DELETE:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "로고를 삭제하시겠습니까?",
        requestAction: "deleteCompanyLogo",
      };
    case ASK_CANCEL_PLAN:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "해당 플랜을 이번 달까지만 이용하시겠습니까?",
        requestAction: "cancelPlan",
      };
    case ASK_NEXTCANCEL_PLAN:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "다음달부터 적용될 플랜을 취소하시겠습니까?",
        requestAction: "cancelNextPlan",
      };

    case ASK_CHANGE_PLAN:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: action.data.message,
        requestAction: action.data.requestAction,
      };
    case RENDER_PAYPLE_PAGE:
      return { ...state, shouldRenderPayple: true };

    case ASK_DELETE_LABELPROJECT:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "선택하신 라벨링프로젝트를 삭제하시겠습니까?",
        requestAction: "deleteLabelProject",
        datas: action.data,
      };
    case ASK_PUT_LABELPROJECT:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: action.data.message,
        requestAction: action.data.requestAction,
        datas: action.data.data,
      };
    case ASK_DELETE_LABELCLASS:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message:
          action.data.language === "en"
            ? `Are you sure you want to delete classes? If you delete it, label information for that classes will be reset.`
            : " 정말 삭제 하시겠습니까? 삭제하시면 선택하신 클래스에 대한 모든 라벨 정보가 초기화 됩니다.",
        requestAction: "deleteLabelClass",
        datas: { id: action.data.id, arr: action.data.arr },
      };

    case ASK_PROJECT_FROMLABEL:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "라벨링 프로젝트로 개발하기를 시작하시겠습니까?",
        requestAction: "projectFromLabel",
        shouldRenderAction: false,
      };
    case ASK_EXPORT_COCO:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "COCO 양식으로 export 하시겠습니까?",
        requestAction: "exportCoco",
        shouldRenderAction: false,
      };
    case ASK_EXPORT_VOC:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "VOC 양식으로 export 하시겠습니까?",
        requestAction: "exportVoc",
        shouldRenderAction: false,
      };
    case ASK_EXPORT_DATA:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "라벨링 정보를 파일로 export 하시겠습니까?",
        requestAction: "exportData",
        shouldRenderAction: false,
      };
    case RESET_MESSAGE:
      return {
        ...state,
        requestAction: null,
      };
    case RENDER_REQUEST_ACTION:
      return { ...state, shouldRenderAction: true };
    case ASK_DELETE_OBJECTLISTS:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "선택하신 파일을 삭제 하시겠습니까?",
        requestAction: "deleteListObjects",
        datas: action.data,
      };
    case ASK_DELETE_PROJECTS:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "선택하신 프로젝트를 삭제 하시겠습니까?",
        requestAction: "deleteProjects",
        datas: action.data,
      };
    case ASK_DELETE_OPSPROJECTS:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "선택하신 프로젝트를 삭제 하시겠습니까?",
        requestAction: "deleteOpsProjects",
        datas: action.data,
      };
    case ASK_DELETE_JUPYTERPROJECTS:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "선택하신 프로젝트를 삭제 하시겠습니까?",
        requestAction: "deleteJupyterProjects",
        datas: action.data,
      };
    case ASK_DELETE_DATACONNECTORS:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message:
          "선택하신 데이터커넥터를 삭제하면, 시작되지 않은 프로젝트도 같이 삭제됩니다. 계속 진행 하시겠습니까?",
        requestAction: "deleteConnectors",
        datas: action.data,
      };

    case ASK_CHANGE_PROJECTNAME:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "프로젝트명을 바꾸시겠습니까?",
        requestAction: "putProjectName",
        datas: action.data,
      };
    case ASK_CHANGE_PROJECTDESCRIPTION:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "프로젝트 설명을 바꾸시겠습니까?",
        requestAction: "putProjectDescription",
        datas: action.data,
      };
    case ASK_START_PROJECT:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: action.data.message,
        requestAction: "startProject",
        datas: action.data.project,
      };
    case ASK_STOP_PROJECT:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: action.data.message,
        requestAction: "stopProject",
        datas: action.data,
      };

    case ASK_GOTO_MAINPAGE:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message:
          "작업하지 않은 작업은 초기화 됩니다. 메인화면으로 돌아가시겠습니까?",
        requestAction: "goToMainPage",
      };
    case GOTO_MAINPAGE_REQUEST:
      return {
        ...state,
        isAskSnackbarOpen: false,
        isInformSnackbarOpen: false,
        shouldGoToMainPage: true,
      };
    case SET_MAINPAGE_DEFAULT:
      return {
        ...state,
        isAskSnackbarOpen: false,
        isInformSnackbarOpen: false,
        shouldGoToMainPage: false,
      };

    case OPEN_PLANALERT_MODAL:
      return { ...state, isPlanAlertOpen: true };
    case CLOSE_PLANALERT_MODAL:
      return { ...state, isPlanAlertOpen: false };

    case ASK_ACCEPT_GROUP:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "그룹초대에 수락하시겠습니까?",
        requestAction: "acceptGroup",
        datas: action.data,
      };
    case ASK_REFUSE_GROUP:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "그룹초대를 거절하시겠습니까?",
        requestAction: "refuseGroup",
        datas: action.data,
      };
    case ASK_DELETE_MEMBER:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "멤버를 삭제시키겠습니까?",
        requestAction: "deleteMember",
        datas: action.data,
      };
    case ASK_DELETE_GROUP:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "해당 그룹을 삭제시키겠습니까?",
        requestAction: "deleteGroup",
        datas: action.data,
      };
    case ASK_LEAVE_GROUP:
      return {
        ...state,
        isAskSnackbarOpen: true,
        isInformSnackbarOpen: false,
        category: "warning",
        message: "해당 그룹을 탈퇴하시겠습니까?",
        requestAction: "leaveGroup",
        datas: action.data,
      };
    case MESSAGES_RESEET:
      return initialState;

    default:
      return state;
  }
};

export default reducer;
