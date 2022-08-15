export const initialState = {
    isLoading : false,
    parentsGroup : null,
    childrenGroup : null,
    isSuccess : false,
};

export const GET_GROUPS_REQUEST = 'GET_GROUPS_REQUEST';
export const GET_GROUPS_SUCCESS = 'GET_GROUPS_SUCCESS';
export const GET_GROUPS_FAILURE = 'GET_GROUPS_FAILURE';

export const POST_GROUP_REQUEST = 'POST_GROUP_REQUEST';
export const POST_GROUP_SUCCESS = 'POST_GROUP_SUCCESS';
export const POST_GROUP_FAILURE = 'POST_GROUP_FAILURE';

export const POST_MEMBER_REQUEST = 'POST_MEMBER_REQUEST';
export const POST_MEMBER_SUCCESS = 'POST_MEMBER_SUCCESS';
export const POST_MEMBER_FAILURE = 'POST_MEMBER_FAILURE';

export const POST_ACCEPTGROUP_REQUEST = 'POST_ACCEPTGROUP_REQUEST';
export const POST_ACCEPTGROUP_SUCCESS = 'POST_ACCEPTGROUP_SUCCESS';
export const POST_ACCEPTGROUP_FAILURE = 'POST_ACCEPTGROUP_FAILURE';

export const DELETE_MEMBER_REQUEST = 'DELETE_MEMBER_REQUEST';
export const DELETE_MEMBER_SUCCESS = 'DELETE_MEMBER_SUCCESS';
export const DELETE_MEMBER_FAILURE = 'DELETE_MEMBER_FAILURE';

export const DELETE_GROUP_REQUEST = 'DELETE_GROUP_REQUEST';
export const DELETE_GROUP_SUCCESS = 'DELETE_GROUP_SUCCESS';
export const DELETE_GROUP_FAILURE = 'DELETE_GROUP_FAILURE';

export const LEAVE_GROUP_REQUEST = 'LEAVE_GROUP_REQUEST';
export const LEAVE_GROUP_SUCCESS = 'LEAVE_GROUP_SUCCESS';
export const LEAVE_GROUP_FAILURE = 'LEAVE_GROUP_FAILURE';

export const PUT_GROUP_REQUEST = 'PUT_GROUP_REQUEST';
export const PUT_GROUP_SUCCESS = 'PUT_GROUP_SUCCESS';
export const PUT_GROUP_FAILURE = 'PUT_GROUP_FAILURE';
export const GROUPS_RESET = 'GROUPS_RESET';


export const getGroupsRequestAction = () => ({
    type: GET_GROUPS_REQUEST,
})

export const postGroupRequestAction = (data) => ({
    type: POST_GROUP_REQUEST,
    data,
});

export const postMemberRequestAction = (data) => ({
    type: POST_MEMBER_REQUEST,
    data,
});

export const acceptGroupRequestAction = (data) => ({
    type: POST_ACCEPTGROUP_REQUEST,
    data,
});

export const deleteMemberRequestAction = (data) => ({
    type: DELETE_MEMBER_REQUEST,
    data,
});

export const deleteGroupRequestAction = (data) => ({
    type: DELETE_GROUP_REQUEST,
    data,
});

export const leaveGroupRequestAction = (data) => ({
    type: LEAVE_GROUP_REQUEST,
    data,
});

export const putGroupRequestAction = (data) => ({
    type: PUT_GROUP_REQUEST,
    data,
});
export const groupsResetRequestAction = () => ({
    type: GROUPS_RESET,
});


const reducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_GROUPS_REQUEST:
            return {...state, isLoading: true};
        case GET_GROUPS_SUCCESS:
            return {...state, isLoading: false, parentsGroup: action.data.parentsGroup, childrenGroup: action.data.childrenGroup, isSuccess: true};
        case GET_GROUPS_FAILURE:
            return {...state, isLoading: false, isSuccess: false};

        case POST_GROUP_REQUEST:
            return {...state, isLoading: true};
        case POST_GROUP_SUCCESS:
            return {...state, isLoading: false, parentsGroup: [...state.parentsGroup, action.data], isSuccess: true};
        case POST_GROUP_FAILURE:
            return {...state, isLoading: false, isSuccess: false};

        case POST_MEMBER_REQUEST:
            return {...state, isLoading: true};
        case POST_MEMBER_SUCCESS:
            return {...state, isLoading: false, isSuccess: true};
        case POST_MEMBER_FAILURE:
            return {...state, isLoading: false, isSuccess: false};

        case POST_ACCEPTGROUP_REQUEST:
            return {...state, isLoading: true};
        case POST_ACCEPTGROUP_SUCCESS:
            return {...state, isLoading: false, isSuccess: true};
        case POST_ACCEPTGROUP_FAILURE:
            return {...state, isLoading: false, isSuccess: false};           

        case DELETE_MEMBER_REQUEST:
            return {...state, isLoading: true};
        case DELETE_MEMBER_SUCCESS:
            return {...state, isLoading: false, isSuccess: true};
        case DELETE_MEMBER_FAILURE:
            return {...state, isLoading: false, isSuccess: false};           

        case DELETE_GROUP_REQUEST:
            return {...state, isLoading: true};
        case DELETE_GROUP_SUCCESS:
            return {...state, isLoading: false, isSuccess: true};
        case DELETE_GROUP_FAILURE:
            return {...state, isLoading: false, isSuccess: false};    

        case LEAVE_GROUP_REQUEST:
            return {...state, isLoading: true};
        case LEAVE_GROUP_SUCCESS:
            return {...state, isLoading: false, isSuccess: true};
        case LEAVE_GROUP_FAILURE:
            return {...state, isLoading: false, isSuccess: false};   

        case PUT_GROUP_REQUEST:
            return {...state, isLoading: true};
        case PUT_GROUP_SUCCESS:
            return {...state, isLoading: false, isSuccess: true};
        case PUT_GROUP_FAILURE:
            return {...state, isLoading: false, isSuccess: false};
        case GROUPS_RESET:
            return initialState;
        
        default:
            return state;
    }
};

export default reducer;
