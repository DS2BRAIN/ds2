from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY, HTTP_503_SERVICE_UNAVAILABLE, \
    HTTP_500_INTERNAL_SERVER_ERROR, HTTP_429_TOO_MANY_REQUESTS
from starlette.status import HTTP_200_OK, HTTP_204_NO_CONTENT, HTTP_500_INTERNAL_SERVER_ERROR, HTTP_423_LOCKED
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_412_PRECONDITION_FAILED
from starlette.status import HTTP_400_BAD_REQUEST
from starlette.status import HTTP_406_NOT_ACCEPTABLE
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from starlette.status import HTTP_507_INSUFFICIENT_STORAGE


USER_ERROR = HTTP_423_LOCKED, {
        "statusCode": 423,
        "error": "Bad Request",
        "message": "프로젝트 계정과 유저 계정이 일치하지 않습니다.",
        "message_en": "The project account and user account do not match."
}

ASYNC_TASK_USER_ERROR = HTTP_423_LOCKED,{
    "statusCode": 423,
    "error": "Bad Request",
    "message": "알람 내역과 유저 계정이 일치하지 않습니다.",
    "message_en": "The alarm details and user account do not match."
}

PIL_IOERROR = HTTP_503_SERVICE_UNAVAILABLE, {
    "statusCode": 503,
    "error": "Bad Request",
    "message": "이미지 파일을 읽는 도중 에러가 발생하였습니다.",
    "message_en": "An error occurred while reading the image file."
    }

NOT_ACCESS_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "trial 계정은 colab만 이용할 수 있습니다.",
            "message_en": "trial account is for colab only."
    }

NOT_FOUND_USER_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "유저 정보를 찾을 수 없습니다.",
            "message_en": "User information not found."
}

NO_PAYMENT_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "결제 대상이 아닙니다.",
            "message_en": "No outstanding balance."
}

PAYMENT_FAIL_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "결제에 실패했습니다.",
            "message_en": "payment fail."
}

ALREADY_EXIST_WORD = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "이미 해당 계정에 동일한 단어가 저장되어있습니다.",
            "message_en": "The same word is already stored in this account."
        }

DO_NOT_EXIT_ADMIN_USER = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "관리자 계정은 탈퇴하실 수 없습니다.",
            "message_en": "You cannot delete an administrator account."
        }


NOT_FOUND_AI_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "ai모델 정보를 찾을 수 없습니다.",
            "message_en": "The ai model information could not be found."
        }

LEAVE_ADMIN_USER_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "최종 admin은 팀원이 없기 전까지 탈퇴할 수 없습니다.",
            "message_en": "The final admin cannot leave the team until there are no team members."
        }

NOT_HOST_USER_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "해당 그룹의 그룹장이 아닙니다.",
            "message_en": "You are not the group leader."
        }

NOT_AITRAINER_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "ai트레이너만 해당 기능을 사용할 수 있습니다.",
            "message_en": "Only ai trainers can use this feature."
        }

NOT_ALLOWED_TOKEN_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "허용되지 않은 토큰 값입니다.",
            "message_en": "Token value not allowed."
}

NOT_ALLOWED_PERMISSION_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Requests",
            "message": "해당 기능을 수행할 권한이 없습니다.",
            "message_en": "You are not authorized to perform this function."
}

EXCEED_LABEL_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "라벨 사용량 초과입니다.",
            "message_en": "Label usage exceeded."
        }

PRICING_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "가격 정책이 없습니다.",
            "message_en": "There is no pricing policy."
        }

EXCEED_PREDICT_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "예측 기능 사용량 초과입니다.",
            "message_en": "Prediction usage exceeded."
        }

EXCEED_DISKUSAGE_ERROR = HTTP_507_INSUFFICIENT_STORAGE, {
            "statusCode": 507,
            "error": "Bad Request",
            "message": "디스크 사용량 초과입니다.",
            "message_en": "Disk usage exceeded."
        }

ALREADY_USE_TRIAL_TEAM_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "이미 trial 팀이 있습니다.",
            "message_en": "There is already a trial team."
    }

ALREADY_CANCELED_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "이미 취소 요청된 상태입니다.",
            "message_en": "Cancellation has already been requested."
        }

ALREADY_SHARED_CALLLOG_ERROR = HTTP_400_BAD_REQUEST, {
            "statusCode": 400,
            "error": "Bad Request",
            "message": "이미 공유되어 있는 CallLog입니다.",
            "message_en": "CallLog already shared."
}

ALREADY_REFUND_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "이미 환불요청이 된 상태입니다.",
            "message_en": "Your refund request has already been made."
        }

SAVE_FILE_ERROR = HTTP_412_PRECONDITION_FAILED, {
        "statusCode": 412,
        "error": "Bad Request",
        "message": "파일을 저장하는데 실패하였습니다.",
        "message_en": "Failed to save file."
    }

IMAGE_IN_ZIP_ERROR = HTTP_412_PRECONDITION_FAILED, {
        "statusCode": 412,
        "error": "Bad Request",
        "message": "zip 파일 내에 이미지가 없습니다.",
        "message_en": "There are no images in the zip file."
    }

NOT_ALLOWED_PERMISSION_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
    "statusCode": 503,
    "error": "Bad Requests",
    "message": "해당 기능을 수행할 권한이 없습니다.",
    "message_en": "You are not authorized to perform this function."
}

NOT_EXIST_PAYMENTCARD = HTTP_503_SERVICE_UNAVAILABLE, {
    "statusCode": 503,
    "error": "Bad Requests",
    "message": "결제에 사용될 카드가 등록되지 않았습니다.",
    "message_en": "The card to be used for payment is not registered."
}

NOT_ALLOWED_WORKASSIGNEE_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
    "statusCode": 503,
    "error": "Bad Requests",
    "message": "다른 작업자의 라벨링 정보를 수정할 수 없습니다.",
    "message_en": "You cannot edit another operator's labeling information."
}

NOT_ALLOWED_INPUT_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
        "statusCode": 503,
        "error": "Bad Request",
        "message": "허용되지 않은 입력 값입니다.",
        "message_en": "Input not allowed."
    }

PERMISSION_DENIED_CONNECTOR_ERROR = HTTP_423_LOCKED, {
        "statusCode": 423,
        "error": "Bad Request",
        "message": "데이터 커넥터 계정과 유저 계정이 일치하지 않습니다.",
        "message_en": "Data connector account and user account do not match."
    }

NON_EXISTENT_CONNECTOR_ERROR = HTTP_400_BAD_REQUEST, {
        "statusCode": 400,
        "error": "Bad Request",
        "message": "존재하지 않는 dataconnectortype Name 입니다.",
        "message_en": "dataconnectortype Name does not exist."
    }

NOT_EXISTENT_GROUP_ERROR = HTTP_400_BAD_REQUEST, {
        "statusCode": 400,
        "error": "Bad Requests",
        "message": "존재하지 않는 그룹입니다.",
        "message_en": "This group does not exist."
}

MIN_DATA_ERROR = HTTP_406_NOT_ACCEPTABLE, {
            "statusCode": 406,
            "error": "Bad Request",
            "message": "데이터가 너무 적습니다.",
            "message_en": "There is too little data."
        }

LABEL_FIlE_INFO_ERROR = HTTP_400_BAD_REQUEST, {
            "statusCode": 400,
            "error": "Bad Request",
            "message": '압축파일 내 라벨링 데이터가 존재하지 않습니다.',
            "message_en": 'There is no label data in zip file.'
    }

NORMAL_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "잠시 후 다시 시도해 주시길 바랍니다.",
            "message_en": "Please try again later."
        }

KEY_FIlE_INFO_ERROR = HTTP_400_BAD_REQUEST, {
            "statusCode": 400,
            "error": "Bad Request",
            "message": '필수 입력 값이 존재하지 않습니다.',
            "message_en": 'The required input value does not exist.'
    }

GET_MODEL_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "모델 정보를 가져오던 도중 에러가 발생하였습니다.",
            "message_en": "An error occurred while retrieving model information."
        }

NOT_FOUND_ERROR = HTTP_503_SERVICE_UNAVAILABLE, { #### 에러마세지 반환 필
            "statusCode": 503,
            "error": "Bad Request",
            "message": "모델을 찾을 수 없습니다.",
            "message_en": "Model not found."
        }

EXTENSION_NAME_ERROR = HTTP_422_UNPROCESSABLE_ENTITY, {
            "statusCode": 422,
            "error": "Invaild File type",
            "message": "허용되지 않는 파일 확장자입니다.",
            "message_en": "The file extension is not allowed."
        }

MISSING_FILE_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "파일이 존재하지 않습니다.",
            "message_en": "The file does not exist."
        }

READ_JSON_FILE_ERROR = HTTP_503_SERVICE_UNAVAILABLE,{
            "statusCode": 503,
            "error": "Bad Request",
            "message": "json 파일을 읽는 중 오류가 발생하였습니다.",
            "message_en": "An error occurred while reading json file."
            }

WRONG_COCODATA_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "coco 데이터 형식에 맞지않습니다.",
            "message_en": "Invalid coco data type."
            }

WRONG_VOCDATA_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "xml 파일을 읽는 중 오류가 발생하였습니다.",
            "message_en": "An error occurred while reading xml file."
}

UPLOAD_FILE_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "파일이 업로드 되지 않았습니다.",
            "message_en": "The file was not uploaded."
        }

SEARCH_PROJECT_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "프로젝트 조회중 에러가 발생하였습니다.",
            "message_en": "An error occurred while viewing the project."
        }

WRONG_ACCESS_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "잘못된 접근입니다.",
            "message_en": "Invalid access."
        }

DELETE_USER_ERROR = HTTP_400_BAD_REQUEST, {
            "status_code": 400,
            "message": "삭제된 회원입니다.",
            "message_en": "This member has been deleted."
        }

NOT_CONFIRM_EMAIL_ERROR = HTTP_400_BAD_REQUEST, {
            "status_code": 400,
            "message": "이메일 인증이 완료되지 않았습니다.",
            "message_en": "Email verification is not confirmed."
        }

NOT_ALLOWED_TO_BASIC_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "베이직 플랜은 이용하실 수 없습니다.",
            "message_en": "Basic plan is not available."
        }

EXCEED_CONNECTOR_ERROR = HTTP_507_INSUFFICIENT_STORAGE, {
            "statusCode": 507,
            "error": "Body Requests",
            "message": "사용 가능한 커넥터를 모두 사용하고 계십니다.",
            "message_en": "You are using all available connectors."
        }

TOO_MANY_ERROR_PROJECT = HTTP_429_TOO_MANY_REQUESTS, {
            "statusCode": 429,
            "error": "Bad Request",
            "message": "에러 프로젝트가 많이 생성되어 하루간 프로젝트 생성이 제한됩니다.",
            "message_en": "There are a lot of error projects created, limiting project creation for one day."
        }

EXCEED_PROJECT_ERROR = HTTP_507_INSUFFICIENT_STORAGE, {
            "statusCode": 507,
            "error": "Bad Request",
            "message": "프로젝트 사용량 초과입니다. 코랩&주피터를 이용해주세요.",
            "message_en": "Project usage exceeded. Please use Colab & Jupyter."
}

EXCEED_SERVER_ERROR = HTTP_507_INSUFFICIENT_STORAGE, {
            "statusCode": 507,
            "error": "Bad Request",
            "message": "서버 개수 초과입니다. 영업팀에 문의해주세요.",
            "message_en": "Exceeded number of servers. Please contact sales."
        }

EXCEED_FILE_SIZE = HTTP_507_INSUFFICIENT_STORAGE, {
            "statusCode": 507,
            "error": "Bad Request",
            "message": "파일 크기가 제한을 초과하였습니다.",
            "message_en": "The file size exceeds the limit."
        }

ENCODE_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "파일 인코딩 도중 에러가 발생하였습니다.",
            "message_en": "An error occurred while encoding the file."
        }

EXITS_FOLDER_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "데이터 폴더가 존재하지 않습니다.",
            "message_en": "The data folder does not exist."
        }

LABEL_DATA_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "라벨링 데이터를 확인해주십시오.",
            "message_en": "Please check the labeling data."
        }

EXCEED_USER_ERROR = HTTP_507_INSUFFICIENT_STORAGE, {
            "statusCode": 507,
            "error": "Bad Request",
            "message": "사용하시는 플랜보다 더 많은 유저 가입은 불가합니다.",
            "message_en": "You cannot sign up for more users than your plan."
        }

ALREADY_REGISTER_EMAIL_ERROR = HTTP_400_BAD_REQUEST, {
            "statusCode": 400,
            "error": "Bad Request",
            "message": "이미 가입된 이메일입니다.",
            "message_en": "This email is already signed up."
        }

ALREADY_REGISTER_USER_ERROR = HTTP_400_BAD_REQUEST, {
            "statusCode": 400,
            "error": "Bad Request",
            "message": "이미 존재하는 사용자입니다.",
            "message_en": "This user already exists."
        }

CHANGE_APPTOKEN_ERROR = HTTP_400_BAD_REQUEST, {
            "statusCode": 400,
            "error": "Bad Request",
            "message": "24시간 내에 한 번만 앱토큰 변경이 가능합니다.",
            "message_en": "You can only change the App Token once within 24 hours."
        }

NOT_FOUND_EXTERNALAI_KEY = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode" : 500,
            "error": "Bad Request",
            "message": "API key가 등록되어 있지 않습니다.",
            "message_en": "The API key is not registered."
}

NOT_EXISTENT_EXTERNALAI_KEY = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode" : 500,
            "error": "Bad Request",
            "message": "유효하지 않은 API KEY 입니다",
            "message_en": "Invalid API KEY"
}

NOT_VALID_EMAIL = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "이메일이 존재하지 않습니다.",
            "message_en": "This email does not exist."
}

MISMATCH_PASSWORD_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "비밀번호가 일치하지 않습니다. 다시 시도하여 주시길 바랍니다.",
            "message_en": "The passwords do not match. Please try again."
        }

NOT_MATCH_FORM_PASSWORD_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "비밀번호가 양식에 맞지 않습니다. 다시 시도하여 주시길 바랍니다.",
            "message_en": "The password does not match the form. Please try again."
        }

PAYMENT_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "결제에 실패하였습니다. 다른 카드를 등록 후 다시 시도 바랍니다.",
            "message_en": "Payment failed. Please register another card and try again."
        }

NOT_FOUND_PGREGISTER_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "결제정보를 불러오던 도중 에러가 발생하였습니다.",
            "message_en": "An error occurred while loading payment information."
        }

EXPAIRE_DATE_TIME_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "갱신기한이 지났습니다. 비밀번호 찾기 페이지부터 다시 진행해주시길 바랍니다.",
            "message_en": "The renewal deadline has passed. Please start again from the password recovery page."
        }

CHANGE_PASSWORD_ERROR = HTTP_200_OK, {
            "statusCode": 200,
            "message": "비밀번호가 변경되었습니다. 다시 로그인해주시길 바랍니다.",
            "message_en": "Your password has been changed. Please log in again."
        }

WRONG_PASSWORD_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "영어, 숫자, 특수기호가 최소 1개이상 포함되어야 합니다.",
            "message_en": "Must contain at least one English letter, number, and special symbol."
        }

PERMISSION_DENIED_GROUP_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Reqiests",
            "message": "그룹의 멤버가 아닙니다.",
            "message_en": "You are not a member of a group."
}

PERMISSION_DENIED_TEAM_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Reqiests",
            "message": "해당 팀의 멤버가 아닙니다.",
            "message_en": "You are not a member of this team."
}

NOT_FOUND_GROUP_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "그룹 정보를 찾을 수 없습니다.",
            "message_en": "Group information not found."
        }

ALREADY_INVITATION_USER_ERROR = HTTP_500_INTERNAL_SERVER_ERROR,{
            "statusCode":500,
            "error": "Bad Requests",
            "message": "초대 응답 대기 중인 유저입니다.",
            "message_en": "User waiting for invitation response."
}

ALREADY_REGISTER_TEAM_MEMBER = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "이미 팀 회원입니다.",
            "message_en": "You are already a member of the team."
}

TOO_MANY_INVITE_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Requests",
            "message": "초대 거절을 3번하여 더 이상 초대하지 못합니다.",
            "message_en": "You've declined invites 3 times and you can't invite any more."
}

ALREADY_REGISTER_GROUP_MEMBER = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "이미 그룹 회원입니다.",
            "message_en": "This user is already a member of the group."
}

ALREADY_DELETED_OBJECT = HTTP_400_BAD_REQUEST, {
    "status_code": 500,
    "error": "Bad Request",
    "message": "삭제된 정보입니다.",
    "message_en": "This information was deleted."
}

EXCEED_TODAY_CALLLOG_LIMIT = HTTP_500_INTERNAL_SERVER_ERROR, {
    "statusCode": 500,
    "error": "Bad Request",
    "message": "하루 사용량 20회를 초과하였습니다.",
    "message_en": "Exceeded 20 usage per day."
}

EXCEED_TODAY_PLAYBOOK_LIMIT = HTTP_500_INTERNAL_SERVER_ERROR, {
    "statusCode": 500,
    "error": "Bad Request",
    "message": "하루 사용량 100회를 초과하였습니다.",
    "message_en": "Exceeded 100 usage per day."
}

NO_SUPPORT_FOR_OPENSOURCE = HTTP_500_INTERNAL_SERVER_ERROR, {
    "statusCode": 500,
    "error": "Bad Request",
    "message": "오픈소스에서 제공하지 않는 기능입니다.",
    "message_en": "This function is not supported for open-source."
}

EXCEED_POST_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "사용량 초과입니다.",
            "message_en": "Exceeded 100 usage per day."
        }

EXCEED_SELL_POST_ERROR = HTTP_503_SERVICE_UNAVAILABLE, {
            "statusCode": 503,
            "error": "Bad Request",
            "message": "사용량 초과입니다.",
            "message_en": "Exceeded 20 usage to sell."
        }

DUPLICATE_USER_NAME_ERROR = HTTP_500_INTERNAL_SERVER_ERROR, {
            "statusCode": 500,
            "error": "Bad Request",
            "message": "다른 사용자가 해당 유저 이름을 사용하고 있습니다. 다른 이름으로 다시 시도해주시길 바랍니다.",
            "message_en": "Someone is using this user name. Please try another one."
}

class ErrorResponseList:
    def verifyError(self, message):
        return HTTP_400_BAD_REQUEST, {
            "statusCode": 400,
            "error": "Bad Request",
            "message": message
        }
