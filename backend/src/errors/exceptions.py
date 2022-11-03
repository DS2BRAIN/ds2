from uuid import getnode as get_mac
class StatusCode:
    HTTP_507 = 507
    HTTP_503 = 503
    HTTP_500 = 500
    HTTP_400 = 400
    HTTP_401 = 401
    HTTP_402 = 402
    HTTP_403 = 403
    HTTP_404 = 404
    HTTP_405 = 405
    HTTP_415 = 415
    HTTP_204 = 204
    HTTP_200 = 200


class APIException(Exception):
    status_code: int
    code: str
    message: str
    message_en: str
    detail: str
    mac: str

    def __init__(
        self,
        *,
        status_code: int = StatusCode.HTTP_503,
        code: str = "000000",
        obj: str = None,
        message: str = None,
        message_en: str = None,
        detail: str = None,
        mac: str = None,
        ex: Exception = None,
        ):
        self.status_code = status_code
        self.code = code
        self.obj = obj
        self.message = message
        self.message_en = message_en
        self.mac = mac
        self.detail = detail
        super().__init__(ex)

class NotFoundAdminEx(APIException):
    def __init__(self, token: str = None, email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_500,
            message="관리자 계정 정보를 찾을 수 없습니다.",
            message_en="Admin User information not found.",
            detail=f"Not Found Admin User | token : {token} | email : {email}",
            code=f"{StatusCode.HTTP_500}{'1'.zfill(4)}",
            ex=ex,
        )

class NotFoundDataconnectorEx(APIException):
    def __init__(self, dataconnector_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_500,
            message="데이터커넥터를 찾을 수 없습니다.",
            message_en="Dataconnector not found.",
            detail=f"Not Found Dataconnector | dataconnector_id : {dataconnector_id}",
            code=f"{StatusCode.HTTP_500}{'1'.zfill(4)}",
            ex=ex,
        )

class NotFoundUserEx(APIException):
    def __init__(self, token: str = None, email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_500,
            message="유저 정보를 찾을 수 없습니다.",
            message_en="User information not found.",
            detail=f"Not Found User | token : {token} | email : {email}",
            code=f"{StatusCode.HTTP_500}{'1'.zfill(4)}",
            ex=ex,
        )

class ExistOtpCode(APIException):
    def __init__(self, token: str = None, email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_500,
            message="이미 OTP 발급내역이 존재합니다.",
            message_en="OTP issuance history already exists.",
            detail=f"OTP issuance history already exists. | token : {token} | email : {email}",
            code=f"{StatusCode.HTTP_500}{'1'.zfill(4)}",
            ex=ex,
        )

class NotFoundTradierUserEx(APIException):
    def __init__(self, tradier_id: str = None, tradier_token: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_500,
            message="Tradier 유저 정보를 찾을 수 없습니다.",
            message_en="Tradier User information not found.",
            detail=f"Not Found Tradier User | tradier_id : {tradier_id} | tradier_token : {tradier_token}",
            code=f"{StatusCode.HTTP_500}{'1'.zfill(4)}",
            ex=ex,
        )

class NotFoundAiEx(APIException):
    def __init__(self, token: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_500,
            message="ai모델 정보를 찾을 수 없습니다.",
            message_en="The ai model information could not be found.",
            detail=f"The ai model information could not be found. | token : {token}",
            code=f"{StatusCode.HTTP_500}{'1'.zfill(4)}",
            ex=ex,
        )

class TooManyRequestsExportCocoEx(APIException):
    def __init__(self, token: str = None, email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_500,
            message="24시간 내에 최대 6번까지만 다운로드가 가능합니다.",
            message_en="You can download it up to 6 times within 24 hours.",
            detail=f"You can download it up to 6 times within 24 hours. | token : {token} | email : {email}",
            code=f"{StatusCode.HTTP_500}{'1'.zfill(4)}",
            ex=ex,
        )

class FailWideFieldDeployeEx(APIException):
    def __init__(self, last_updated_at, version, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_200,
            message="아직 24시간이 지나지 않아 디플로이가 불가능합니다.",
            message_en="It has not been 24 hours yet, so it is impossible to be updated.",
            detail=f"최종 디플로이 시간 : {last_updated_at} | 최종 디플로이 버전 : {version}",
            code=f"{StatusCode.HTTP_200}{'1'.zfill(4)}",
            ex=ex,
        )

class LoginEx(APIException):
    def __init__(self, token: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_400,
            message="이메일 또는 비밀번호가 잘못되었습니다. 회원이 아니시라면 회원가입을 진행해주세요.",
            message_en="Invalid email or password. If you are not a member, please proceed with the membership registration.",
            detail=f"Invalid email or password. | Token : {token}",
            code=f"{StatusCode.HTTP_400}{'1'.zfill(4)}",
            ex=ex,
        )

class FailUserDepositEx(APIException):
    def __init__(self, id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_500,
            message="유저 Deposit 작업 중 에러가 발생하였습니다.",
            message_en="An error occurred during the user deposit operation.",
            detail=f"User Deposit Error | id : {id}",
            code=f"{StatusCode.HTTP_500}{'1'.zfill(4)}",
            ex=ex,
        )

class FailAWSUserEx(APIException):
    def __init__(self, user_id: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_500,
            message="AWS 유저 정보를 추가할 수 없습니다.",
            message_en="Could not add AWS user information.",
            detail=f"Fail Create AWS User | user ID : {user_id}",
            code=f"{StatusCode.HTTP_500}{'1'.zfill(4)}",
            ex=ex,
        )

class ExceedDiskusageEx(APIException):
    def __init__(self, user_id: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_507,
            message="디스크 사용량 초과입니다.",
            message_en="Exceeded disk usage limit.",
            detail=f"디스크 사용량 초과입니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_507}{'1'.zfill(4)}",
            ex=ex,
        )

class ExceedUploadUsageEx(APIException):
    def __init__(self, user_id: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_507,
            message="동영상 업로드 사용량 초과입니다.",
            message_en="Exceeded disk usage limit.",
            detail=f"동영상 업로드 사용량 초과입니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_507}{'1'.zfill(4)}",
            ex=ex,
        )

class ExceedFileSizeEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_507,
            message="파일 용량 초과입니다.",
            message_en="Exceeded file size limit.",
            detail=f"파일 용량 초과입니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_507}{'1'.zfill(4)}",
            ex=ex,
        )

class SaveFileEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_507,
            message="파일을 저장하는데 실패하였습니다.",
            message_en="Failed to save file.",
            detail=f"파일을 저장하는데 실패하였습니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_507}{'1'.zfill(4)}",
            ex=ex,
        )

class NotExistFileEx(APIException):
    def __init__(self, user_id: int = None, obj: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_415,
            message=f"{obj}(이)가 없습니다.",
            message_en=f"{obj} does not exist.",
            obj=obj,
            detail=f"{obj}(이)가 없습니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_415}{'1'.zfill(4)}",
            ex=ex,
        )

class NotExistCreateTimeEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_400,
            message=f"동영상 녹화 날짜와 시간을 입력해주세요.",
            message_en=f"Please enter the video recording date and time.",
            detail=f"creation_time(이)가 없습니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_400}{'1'.zfill(4)}",
            ex=ex,
        )

class NotExistLabelTypeEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_415,
            message=f"검수완료 하려는 파일의 라벨 타입에 에러가 있습니다.",
            message_en="There is an error in the label type of the file to be inspected.",
            detail=f"검수완료 하려는 파일의 라벨 타입에 에러가 있습니다. | user : {user_id}",
            code=f"{StatusCode.HTTP_415}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowedModelFileEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message=f"올바르지 않은 모델 파일입니다.",
            message_en="Invalid model file.",
            detail=f"올바르지 않은 모델 파일입니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class InvalidPreprocessingMethodEx(APIException):
    def __init__(self, user_id: int = None, deidentifying: float = None, cleaningClassification:float = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message=f"데이터 클렌징이나 비식별화는 음수값을 입력하실 수 없습니다.",
            message_en="Negative values cannot be entered for data cleansing or de-identification.",
            detail=f"데이터 클렌징이나 비식별화는 음수값을 입력하실 수 없습니다. | UserId : {user_id} | 비식별화 : {deidentifying} | 데이터 클렌징 : {cleaningClassification}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class InvalidStopProjectConditionEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message=f"마지막 모델 학습중에는 프로세스를 중단할 수 없습니다.",
            message_en="The process cannot be interrupted during the last model training.",
            detail=f"마지막 모델 학습중에는 프로세스를 중단할 수 없습니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowFrameValueEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message=f"올바르지 않은 프레임 카운트입니다.",
            message_en="Invalid frame count.",
            detail=f"올바르지 않은 프레임 카운트입니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotExistModelPerformanceEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_415,
            message=f"모델 성능지표가 없습니다.",
            message_en="There are no model performance indicators.",
            detail=f"모델 성능지표가 없습니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class TooManyExistFileEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_415,
            message=f"파일이 2개 이상입니다.",
            message_en="More than one file exists.",
            detail=f"파일이 2개 이상입니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_415}{'1'.zfill(4)}",
            ex=ex,
        )

class TooManyHyperParams(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_415,
            message=f"하이퍼 파라미터 조합값이 300개 이상입니다.",
            message_en="Hyper parameter combination value of 300 or more.",
            detail=f"파일이 2개 이상입니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_415}{'1'.zfill(4)}",
            ex=ex,
        )

class TeamDeleteReservationEx(APIException):
    def __init__(self, delete_date: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_204,
            message=f"팀 삭제 예약이 완료되었습니다. | 삭제예정일 : {delete_date}",
            message_en="The conference room is currently full.",
            detail=f"팀 삭제 예약이 완료되었습니다. | 삭제예정일 : {delete_date}",
            code=f"{StatusCode.HTTP_415}{'1'.zfill(4)}",
            ex=ex,
        )

class DeletedObjectEx(APIException):
    def __init__(self, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_400,
            message=f"삭제된 정보입니다.",
            message_en="This information was deleted.",
            detail=f"삭제된 정보입니다.",
            code=f"{StatusCode.HTTP_400}{'1'.zfill(4)}",
            ex=ex,
        )

class TooManyMarketProjectEx(APIException):
    def __init__(self, user_id: int = None, service_type: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_415,
            message=f"기존에 이미 10개 이상의 {service_type} 마켓프로젝트가 있습니다.",
            message_en="More than ten projects exists.",
            detail=f"기존에 이미 10개 이상의 {service_type} 마켓프로젝트가 있습니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_415}{'1'.zfill(4)}",
            ex=ex,
        )

class NotExistImageEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_415,
            message="zip 파일 내에 이미지가 없습니다.",
            message_en="There are no images in the zip file.",
            detail=f"zip 파일 내에 이미지가 없습니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_415}{'1'.zfill(4)}",
            ex=ex,
        )

class NotExistJsonFileEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="zip 파일 내 json 파일이 존재하지 않습니다.",
            message_en="The json file in the zip file does not exist.",
            detail=f"zip 파일 내 json 파일이 존재하지 않습니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotExistLabelDataFileEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_415,
            message="zip 파일 내 coco 또는 voc 파일이 존재하지 않습니다. 데이터 양식이나 파일을 한 번 더 확인해주세요.",
            message_en="The coco or voc file in the zip file does not exist. Please check the data form or file again.",
            detail=f"zip 파일 내 coco 또는 voc 파일이 존재하지 않습니다. 데이터 양식이나 파일을 한 번 더 확인해주세요. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_415}{'1'.zfill(4)}",
            ex=ex,
        )

class TooManyJsonFileEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="zip파일 내 json 파일이 2개 이상입니다.",
            message_en="There are more than one json file in the zip file.",
            detail=f"zip파일 내 json 파일이 2개 이상입니다. | UserId : {user_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class AleadyRegisterEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="이미 가입된 이메일입니다.",
            message_en="This email is already registered.",
            detail=f"이미 가입된 이메일입니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class DeletedUserEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="탈퇴된 유저입니다. 회원가입을 원할시 문의 부탁드립니다.",
            message_en="This is a deactivated account. Please contact us if you wish to sign up.",
            detail=f"탈퇴된 유저입니다. 회원가입을 원할시 문의 부탁드립니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotConfirmEmailEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="이메일 인증이 되지 않은 계정입니다.",
            message_en="This account has not been verified by email.",
            detail=f"이메일 인증이 되지 않은 계정입니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class BlockUserEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="block 상태인 회원입니다. 로그인이 제한됩니다.",
            message_en="You are a member in block status. Login is restricted.",
            detail=f"block 상태인 회원입니다. 로그인이 제한됩니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class DeleteUserEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="삭제된 회원입니다.",
            message_en="This member has been deleted.",
            detail=f"삭제된 회원입니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class PricingErrorEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="가격 정책이 없습니다.",
            message_en="There is no pricing policy.",
            detail=f"가격 정책이 없습니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotInvitePersonalTeam(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="개인팀에는 다른 사용자를 초대하실 수 없습니다.",
            message_en="Token value not allowed.",
            detail=f"개인팀에는 다른 사용자를 초대하실 수 없습니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowedMemberPermissionEx(APIException):
    def __init__(self, email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="멤버는 해당 기능을 사용할 수 없습니다.",
            message_en="You do not have access to this functionality.",
            detail=f"멤버는 해당 기능을 사용할 수 없습니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowedTokenEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="허용되지 않은 토큰 값입니다.",
            message_en="Token value not allowed.",
            detail=f"허용되지 않은 토큰 값입니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )


class NotAgreeShareEx(APIException):
    def __init__(self, email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="공유에 동의하지 않은 계정은 기록을 공유할 수 없습니다.",
            message_en="Accounts that do not agree to share cannot share records.",
            detail=f"공유에 동의하지 않은 계정은 기록을 공유할 수 없습니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class ExistShareCallLogEx(APIException):
    def __init__(self, email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="이미 대상에게 회의기록 및 녹음기록이 공유되어 있습니다.",
            message_en="The meeting records and recordings are already shared with the user.",
            detail=f"이미 대상에게 회의기록 및 녹음기록이 공유되어 있습니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class ShareToInvalidTeamEx(APIException):
    def __init__(self, email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="회의기록 및 녹음기록은 다른팀에게 공유 하실 수 없습니다.",
            message_en="Meeting records and recordings cannot be shared with other teams.",
            detail=f"회의기록 및 녹음기록은 다른팀에게 공유 하실 수 없습니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class ShareToInvalidGroupEx(APIException):
    def __init__(self, email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="회의기록 및 녹음기록은 다른팀의 그룹에게 공유 하실 수 없습니다.",
            message_en="Meeting records and recordings cannot be shared with groups from other teams.",
            detail=f"회의기록 및 녹음기록은 다른팀의 그룹에게 공유 하실 수 없습니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotTeamMemberEx(APIException):
    def __init__(self, email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="공유하고자 하는 팀의 팀원이 아닙니다.",
            message_en="The user you requested to share is not a team member.",
            detail=f"공유하고자 하는 팀의 팀원이 아닙니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAgreeShareEx(APIException):
    def __init__(self, email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="공유에 동의하지 않은 계정은 기록을 공유할 수 없습니다.",
            message_en="Accounts that have not agreed to share cannot share records.",
            detail=f"공유에 동의하지 않은 계정은 기록을 공유할 수 없습니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowedPermissionEx(APIException):
    def __init__(self, user_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="해당 기능을 수행할 권한이 없습니다.",
            message_en="You are not authorized to perform this function.",
            detail=f"해당 기능을 수행할 권한이 없습니다. | user_id : {user_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotValidGroupNameEx(APIException):
    def __init__(self, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="해당 그룹명을 가진 그룹이 이미 존재하거나 다른 사용자에서 해당 그룹명을 이미 사용중입니다.",
            message_en="A group with that group name already exists, or the group name is already in use by another user.",
            detail=f"해당 그룹명을 가진 그룹이 이미 존재하거나 다른 사용자에서 해당 그룹명을 이미 사용중입니다.",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowedVoiceLabelingEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="해당 계정은 음성 라벨링을 진행하실 수 없습니다.",
            message_en="Token value not allowed.",
            detail=f"해당 계정은 음성 라벨링을 진행하실 수 없습니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class LowScoreErrorEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="음성 라벨링 정확도가 너무 낮아서 더 이상 라벨링을 진행하실 수 없습니다.",
            message_en="Token value not allowed.",
            detail=f"음성 라벨링 정확도가 너무 낮아서 더 이상 라벨링을 진행하실 수 없습니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotDeletedMarketLabelProject(APIException):
    def __init__(self, success_list: list = [], ex: Exception = None):
        message = f'마켓프로젝트로 생상한 라벨프로젝트는 삭제하실 수 없습니다. \n 삭제된 라벨프로젝트 : {success_list}' if type(success_list) == list and len(
            success_list) else '마켓프로젝트로 생상한 라벨프로젝트는 삭제하실 수 없습니다'
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message=message,
            message_en="Token value not allowed.",
            detail=f"마켓프로젝트로 생상한 라벨프로젝트는 삭제하실 수 없습니다. | UserEmail : {success_list}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class CanNotUpdateCustomAiEx(APIException):
    def __init__(self, project_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="custom ai 프로젝트는 수정, 삭제, 중단이 불가능합니다.",
            message_en="Custom ai project cannot be modified, deleted, or stopped.",
            detail=f"custom ai 프로젝트는 수정, 삭제, 중단이 불가능합니다. | UserEmail : {project_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowedLabelProjectIdEx(APIException):
    def __init__(self, labelproject_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="해당 라벨프로젝트의 이미지가 아닙니다.",
            message_en="This is not an image of the label project.",
            detail=f"해당 라벨프로젝트의 이미지가 아닙니다. | UserEmail : {labelproject_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotExistsVoucherErrorEx(APIException):
    def __init__(self, id: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="바우처 고객 계정이 존재하지 않습니다.",
            message_en="The Voucher User is not exists.",
            detail=f"바우처 고객 계정이 존재하지 않습니다. | 입력한 id : {id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotValidDateErrorEx(APIException):
    def __init__(self, date: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="날짜 형식이 올바르지 않습니다.",
            message_en="The Format of Date is incorrect.",
            detail=f"날짜 형식이 올바르지 않습니다. | 입력한 날짜 : {date}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotValidOtpCode(APIException):
    def __init__(self, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="otp 코드가 올바르지 않습니다.",
            message_en="The OTP Code is incorrect.",
            detail=f"otp 코드가 올바르지 않습니다.",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotValidVoucherEmailErrorEx(APIException):
    def __init__(self, Email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="바우처 고객 계정의 이메일이 올바르지 않습니다.",
            message_en="The Voucher Client's Email is incorrect.",
            detail=f"바우처 고객 계정의 이메일이 올바르지 않습니다. | 입력한 Email : {Email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotValidVoucherIdErrorEx(APIException):
    def __init__(self, id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="바우처 고객 계정의 ID가 올바르지 않습니다.",
            message_en="The Voucher Client's ID is incorrect.",
            detail=f"바우처 고객 계정의 ID가 올바르지 않습니다. | 입력한 Email : {id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotValidManagerEmailErrorEx(APIException):
    def __init__(self, Email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="Manager의 이메일이 올바르지 않습니다.",
            message_en="The Manager's Email is incorrect.",
            detail=f"Manager의 이메일이 올바르지 않습니다. | 입력한 Email : {Email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowedKeyEx(APIException):
    def __init__(self, key: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="허용되지 않은 key 값입니다.",
            message_en="Key value not allowed.",
            detail=f"허용되지 않은 key 값입니다. | 입력한 key : {key}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class ExpiredKeyEx(APIException):
    def __init__(self, key: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_400,
            message="만료된 key 값을 입력하셨습니다.",
            message_en="You have entered an expired key value.",
            detail=f"만료된 key 값을 입력하셨습니다. | 입력한 key : {key}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            mac=get_mac(),
            ex=ex,
        )

class WrongPasswordEx(APIException):
    def __init__(self, key: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_400,
            message="유효하지 않은 password 값을 입력하셨습니다.",
            message_en="You entered an invalid password value. You entered an invalid password value.",
            detail=f"유효하지 않은 key 값을 입력하셨습니다. | 입력한 key : {key}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            mac=get_mac(),
            ex=ex,
        )

class WrongKeyEx(APIException):
    def __init__(self, key: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_400,
            message="유효하지 않은 key 값을 입력하셨습니다.",
            message_en="You entered an invalid key value You entered an invalid key value",
            detail=f"유효하지 않은 key 값을 입력하셨습니다. | 입력한 key : {key}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            mac=get_mac(),
            ex=ex,
        )

class WrongMacIdEx(APIException):
    def __init__(self, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_400,
            message="잘못된 Mac ID를 가진 기기로 접근하였습니다.",
            message_en="You have accessed with the wrong Mac ID device.",
            detail=f"잘못된 Mac ID 기기로 접근하였습니다.",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            mac=get_mac(),
            ex=ex,
        )

class WrongHyperParameterEx(APIException):
    def __init__(self, column: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_400,
            message="잘못된 하이퍼 파라미터입니다.",
            message_en="Invalid hyper parameter format.",
            detail=f"잘못된 하이퍼 파라미터입니다. | 입력한 하이퍼 파라미터 : {column}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class WrongObjectiveParameterDetailEx(APIException):
    def __init__(self, training_method, training_method_en, objective_value: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_400,
            message=f"{training_method}의 경우 Objective 값에 '{objective_value}' 입력이 불가능합니다.",
            message_en=f"If the training method is {training_method_en}, you cannot enter: '{objective_value}' in the Objective value of the hyperparameter.",
            detail=f"{training_method}의 경우 Objective 값에 '{objective_value}' 입력이 불가능합니다.",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotUsedColumnEx(APIException):
    def __init__(self, column: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_400,
            message=f"입력해주신 \"{column}\" 컬럼은 학습에 사용되지 않았습니다.",
            message_en=f"The \"{column}\" you entered was not used for learning.",
            detail=f"입력해주신 \"{column}\" 컬럼은 학습에 사용되지 않았습니다.",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowedEmailFormatEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="잘못된 이메일 형식입니다.",
            message_en="Invalid email format.",
            detail=f"잘못된 이메일 형식입니다. | 입력한 email : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowedPasswdEx(APIException):
    def __init__(self, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="잘못된 password 값입니다.",
            message_en="Invalid password format.",
            detail="잘못된 password 값입니다.",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class ExistLabelclassNameEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="이미 존재하는 클래스명입니다.",
            message_en="This class name already exists.",
            detail=f"이미 존재하는 클래스명입니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class ExistColumnNameEx(APIException):
    def __init__(self, email: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="이미 존재하는 컬럼명입니다.",
            message_en="This column name already exists.",
            detail=f"이미 존재하는 컬럼명입니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class MinDataEx(APIException):
    def __init__(self, email: int = None, labelproject_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="학습하고자 하는 라벨 클래스의 라벨링 개수가 모두 10개 이상이면서 완료 이미지 개수가 10개 이상이어야 합니다.",
            message_en="The number of label classes you want to train must be at least 10.",
            detail=f"학습하고자 하는 라벨 클래스의 라벨링 개수가 모두 10개 이상이면서 완료 이미지 개수가 10개 이상이어야 합니다. | UserEmail : {email} | labelProject Id : {labelproject_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotExitsFolderEx(APIException):
    def __init__(self, email: int = None, labelproject_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="해당 라벨프로젝트에 데이터가 존재하지 않습니다.",
            message_en="Data does not exist in the label project.",
            detail=f"해당 라벨프로젝트에 데이터가 존재하지 않습니다. | UserEmail : {email} | labelProject Id : {labelproject_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotExistCostomAiEx(APIException):
    def __init__(self, email: int = None, labelproject_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="해당 라벨프로젝트에 학습된 CostomAi가 존재하지 않습니다.",
            message_en="The Custom AI trained in the label project does not exist.",
            detail=f"해당 라벨프로젝트에 학습된 CostomAi가 존재하지 않습니다. | UserEmail : {email} | labelProject Id : {labelproject_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )


class NotExistSelectedModelEx(APIException):
    def __init__(self, email: int = None, labelproject_id: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="해당 라벨프로젝트에 선택된 모델정보가 존재하지 않습니다.",
            message_en="The selected model information does not exist in the label project.",
            detail=f"해당 라벨프로젝트에 선택된 모델정보가 존재하지 않습니다. | UserEmail : {email} | labelProject Id : {labelproject_id}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )
class FailedVedioCaptureEx(APIException):
    def __init__(self, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_507,
            message="영상 캡처에 실패했습니다.",
            message_en="Video Catpure failed.",
            detail=f"영상 캡처에 실패했습니다.",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class FailedPredictEx(APIException):
    def __init__(self, email: int = None, model_name: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_507,
            message="모델 예측이 실패했습니다.",
            message_en="Model prediction failed.",
            detail=f"모델 예측이 실패했습니다. | UserEmail : {email} | model_name : {model_name}",
            code=f"{StatusCode.HTTP_507}{'1'.zfill(4)}",
            ex=ex,
        )
class FailedCreateServerGroupEx(APIException):
    def __init__(self, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="서버그룹 생성에 실패했습니다.",
            message_en="Failed to create server group.",
            detail=f"서버그룹 생성에 실패했습니다.",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowedServerSizeEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="허용되지 않은 서버크기 값입니다.",
            message_en="Server size not allowed.",
            detail=f"허용되지 않은 서버크기 값입니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowedAlgorithmEx(APIException):
    def __init__(self, algorithm: str = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="허용되지 않은 알고리즘입니다..",
            message_en="Invalid algorithm.",
            detail=f"허용되지 않은 알고리즘입니다. | algorithm : {algorithm}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAllowedChangeServerRightAfterRemoveEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="어뷰징 방지를 위해 나중에 변경이 가능합니다.",
            message_en="To prevent abusing, the server changes can be made later.",
            detail=f"어뷰징 방지를 위해 나중에 변경이 가능합니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class ExceedProjectAmountEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="생성 가능한 프로젝트 개수를 초과하였습니다. 추가 생성을 하고싶다면 영업팀에 문의해주세요.",
            message_en="To prevent abusing, the server can be created later.",
            detail=f"생성 가능한 프로젝트 개수를 초과하였습니다. 추가 생성을 하고싶다면 영업팀에 문의해주세요. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class ExceedServerAmountEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_507,
            message="생성 가능한 서버 개수를 초과하였습니다. 추가 생성을 하고싶다면 영업팀에 문의해주세요.",
            message_en="The number of servers that can be created has exceeded. If you want to create more, please contact our sales team.",
            detail=f"생성 가능한 서버 개수를 초과하였습니다. 추가 생성을 하고싶다면 영업팀에 문의해주세요. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_507}{'1'.zfill(4)}",
            ex=ex,
        )

class NotAvailableServerStatusEx(APIException):
    def __init__(self, email: int = None, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_503,
            message="실행 가능한 상태가 아닙니다.",
            message_en="Not executable.",
            detail=f"실행 가능한 상태가 아닙니다. | UserEmail : {email}",
            code=f"{StatusCode.HTTP_503}{'1'.zfill(4)}",
            ex=ex,
        )

class NormalEx(APIException):
    def __init__(self, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_500,
            message="잠시 후 다시 시도해 주시길 바랍니다.",
            message_en="Please try again later.",
            detail=f"잠시 후 다시 시도해 주시길 바랍니다.",
            code=f"{StatusCode.HTTP_500}{'1'.zfill(4)}",
            ex=ex,
        )

class NotEqualAmountEx(APIException):
    def __init__(self, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_500,
            message="구매 금액이 결제 금액과 일치하지 않습니다.",
            message_en="The purchase amount does not match the payment amount.",
            detail=f"구매 금액이 결제 금액과 일치하지 않습니다.",
            code=f"{StatusCode.HTTP_500}{'1'.zfill(4)}",
            ex=ex,
        )

class NotValideAmountEx(APIException):
    def __init__(self, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_400,
            message="결제 금액이 올바르지 않습니다.",
            message_en="The purchase amount is not valide.",
            detail=f"결제 금액이 올바르지 않습니다.",
            code=f"{StatusCode.HTTP_400}{'1'.zfill(4)}",
            ex=ex,
        )

class SendFeedbackFailedEx(APIException):
    def __init__(self, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_500,
            message="피드백을 전송할 수 없습니다.",
            message_en="Feedback could not be sent.",
            detail=f"Feedback could not be sent.",
            code=f"{StatusCode.HTTP_500}{'1'.zfill(4)}",
            ex=ex,
        )

class LicenseErrorEx(APIException):
    def __init__(self, ex: Exception = None):
        super().__init__(
            status_code=StatusCode.HTTP_402,
            message="라이센스 키 입력 후 사용 가능합니다.",
            message_en="It can be used after entering the license key.",
            detail=f"라이센스 키 입력 후 사용 가능합니다",
            code=f"{StatusCode.HTTP_402}{'1'.zfill(4)}",
            ex=ex,
        )