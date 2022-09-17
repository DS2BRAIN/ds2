import datetime
from typing import List

from fastapi import APIRouter, Form, File, UploadFile
from src.manageLabeling import ManageLabeling
from src.managePayment import ManagePayment
from src.manageUser import ManageUser
from pydantic import BaseModel
from starlette.responses import Response
from src.util import Util
from src.errorResponseList import ErrorResponseList, EXTENSION_NAME_ERROR

router = APIRouter()
utilClass = Util()
manageLabelingClass = ManageLabeling()
manageUserClass = ManageUser()
manage_payment = ManagePayment()
errorResponseList = ErrorResponseList()

@router.get("/userCount/")
def get_user_count(response: Response):

    response.status_code, result = manageUserClass.retrieve_user_count()

    return result

@router.get("/usersettinginfo/")
def userSettingInfo(token: str, response: Response):

    response.status_code, result = manageUserClass.getUserSettingInfo(token)

    return result

# usageplan 변경시 basic -> business 는 바로 변경, business -> basic 은 nextPaymentDate 불러와서 +1 시켜줘야됨
class UsagePlan(BaseModel):
    usageplan: str = None
    dynos: int = None


# @router.put("/usageplan/")
# def updateUsageplan(item: UsagePlan, token: str, response: Response):
#
#     response.status_code, result = manageUser.ManageUser().updateUsagePlan(token, item.usageplan, item.dynos)
#
#     return result

@router.post("/cancelUsage/")
def cancelUsage(token: str, response: Response):

    response.status_code, result = manage_payment.cancelUsage(token)

    return result

class UserInfo(BaseModel):
    email: str
    password: str
    name: str = None
    provider: str = None
    socialID: str = None
    birth: str = None
    gender: str = None
    company: str = None
    isAiTrainer: bool = False
    isTest: bool = False
    isBetaUser: bool = False
    promotionCode: str = None
    utmSource: str = None
    utmMedium: str = None
    utmCampaign: str = None
    utmTerm: str = None
    utmContent: str = None
    isAgreedWithPolicy: bool = True
    isAgreedMarketing: bool = False
    isAgreedBehaviorStatistics: bool = False
    isAgreedDataAcquisition: bool = False
    languageCode: str = 'ko'
    socialType: str = 'DS2.ai'
    googleIdToken: str = None
    tokenType: str = None

@router.post("/register/")
def register(userInfo: UserInfo, response: Response):

    if userInfo.birth:
        userInfo.birth = datetime.datetime.strptime(userInfo.birth, "%Y-%m-%dT%H:%M:%S")

    response.status_code, result = manageUserClass.registerUser(userInfo)

    return result

@router.post("/users/")
def admin_user_register(token: str, userInfo: UserInfo, response: Response):

    if userInfo.birth:
        userInfo.birth = datetime.datetime.strptime(userInfo.birth, "%Y-%m-%dT%H:%M:%S")

    response.status_code, result = manageUserClass.admin_register_user(token, userInfo)

    return result

@router.get("/users/")
def admin_users_retrieve(response: Response,
                         token: str,
                         sorting: str = 'created_at',
                         page: int = 0,
                         count: int = 10,
                         desc: bool = False,
                         searching: str = ''):

    response.status_code, result = manageUserClass.admin_retrieve_users(token,
                                                                                sorting,
                                                                                count,
                                                                                page,
                                                                                desc,
                                                                                searching)

    return result

@router.delete("/users/")
def delete_admin_users(response: Response,
                         token: str,
                         user_id: int):

    response.status_code, result = manageUserClass.admin_delete_user(token, user_id)

    return result

class UserLoginInfo(BaseModel):
    identifier: str
    password: str
    googleIdToken: str = None
    tokenObj: dict = None
    socialType: str = "DS2.ai"

@router.post("/login/")
def login(userLoginInfo: UserLoginInfo, response: Response):

    response.status_code, result = manageUserClass.loginUser(userLoginInfo)

    return result

@router.get("/auth/")
def login_auth(apptoken, response: Response):

    response.status_code, result = manageUserClass.auth(apptoken)

    return result

class ResetInfo(BaseModel):
    email: str
    provider: str = 'DS2.ai'
    languageCode: str = 'ko'

@router.post("/forgot-password/")
def forgotPassword(reset_info: ResetInfo, response: Response):

    response.status_code, result = manageUserClass.forgotPassword(reset_info)

    return result

class ResetPasswordInfo(BaseModel):
    token: str
    user_id: int
    password: str
    password_confirm: str

@router.post("/reset-password/")
def post_reset_password(reset_password_info: ResetPasswordInfo, response: Response):

    response.status_code, result = manageUserClass.reset_password_by_admin(reset_password_info.token, reset_password_info.user_id, reset_password_info.password, reset_password_info.password_confirm)

    return result

@router.get("/email-confirm/")
def emailConfirm(token: str, user: str, provider: str, response: Response):

    response.status_code, result = manageUserClass.verifyEmailConfirm(token, user, provider)

    return result

@router.get("/user-count/")
def emailConfirm(response: Response):

    response.status_code, result = manageUserClass.getUserCount()

    return result

class UserChangableInfo(BaseModel):
    name: str = None
    isBetaUser: bool = None
    promotionCode: str = None
    isAgreedWithPolicy: bool = None
    isFirstplanDone: bool = None
    phoneNumber: str = None
    company: str = None
    isDeleteRequested: bool = None
    isKeepUserData: bool = None
    deleteReason: str = None
    invitedCode: str = None
    lang: str = None
    provider: str = None
    meetingType: str = None
    intro1Checked: bool = None
    intro2Checked: bool = None
    intro3Checked: bool = None
    intro4Checked: bool = None
    isUsingDiscoveryByManual: bool = None

@router.put("/user/")
def putUser(token: str, userChangableInfo: UserChangableInfo, response: Response):

    response.status_code, result = manageUserClass.putUser(token, userChangableInfo)

    return result

@router.put("/user-apptoken/")
def putUserApptoken(token: str, userChangableInfo: UserChangableInfo, response: Response):

    response.status_code, result = manageUserClass.putUserByApptoken(token, userChangableInfo)

    return result

@router.put("/userlogo/")
def putUserLogo(response: Response, token: str = Form(...), file: UploadFile = File(None)):

    if file:
        filename = file.filename
        if filename.split('.')[-1].lower() not in utilClass.imageExtensionName:
            response.status_code, result = EXTENSION_NAME_ERROR
            return result
        file = file.file.read()
    else:
        file, filename = None, None

    response.status_code, result = manageUserClass.putUserLogo(token, file, filename)

    return result

@router.get("/me/")
def getMe(token: str, response: Response):
    response.status_code, result = manageUserClass.getMe(token)
    return result

@router.post("/regenerate-app-token/")
def regenerateAppToken(token: str,  response: Response):
    response.status_code, result = manageUserClass.regenerateAppToken(token)
    return result

# class PhoneVerification(BaseModel):
#     imp_uid: str = None
#
# @router.post("/verifyphone/")
# def verifyPhone(phoneVerification:PhoneVerification, response: Response):
#     response.status_code, result = manageUserClass.verifyPhone(phoneVerification.imp_uid)
#     return result

# @router.get("/usageplans/")
# async def readUsageplans(token: str, response: Response):
#     response.status_code, result = manageUserClass.getUsageplans(token)
#     return result

@router.get("/check-vaild-email/")
async def checkVaildEmail(email: str, response: Response, socialType: str = "DS2.ai"):
    response.status_code, result = manageUserClass.checkValidEmail(email, socialType)
    return result

class UsagehistoryInfo(BaseModel):
    dynos: int = None
    nextDynos: int = None
    nextPlan: int = None

# @router.post("/usagehistory/")
# async def createUsagehistory(token: str, usagehistoryInfo: UsagehistoryInfo, response: Response):
#     response.status_code, result = manageUserClass.postUsagehistory(token, usagehistoryInfo)
#     return result

@router.get("/group/")
def get_groups_by_app_token(response: Response, appTokenCode : str):
    response.status_code, result = manageUserClass.getGroupByappToken(appTokenCode)

    return result

@router.get("/group/{labelproject_id}/")
def get_groups_by_label_project_id(response: Response, labelproject_id, token: str):
    response.status_code, result = manageUserClass.get_groups(token, labelproject_id)

    return result

@router.post("/group/")
def createGroup(response: Response, appTokenCode : str, groupName : str = Form(...)):
    response.status_code, result = manageUserClass.createGroup(appTokenCode, groupName)

    return result

@router.post("/invitegroup/")
def inviteGroup(response: Response, appTokenCode : str, languageCode: str, email : str = Form(...), groupId : str = Form(...)):
    response.status_code, result = manageUserClass.inviteGroupByEmail(appTokenCode, groupId, email, languageCode)

    return result

@router.post("/acceptinvited/")
def acceptInvited(response: Response, appTokenCode : str, groupId : int = Form(...), accept : bool = Form(...)):
    response.status_code, result = manageUserClass.acceptInvited(appTokenCode, groupId, accept)

    return result

@router.post("/updatesharegroup/")
def updateShareGroup(response: Response, appTokenCode : str, projectId : str = Form(...), groupId : int = Form(...), isUpdate : bool = Form(...), isLabelProject : bool = Form(False)):
    response.status_code, result = manageUserClass.updateShareGroup(appTokenCode, projectId, groupId, isUpdate, isLabelProject)
    return result

@router.post("/bangroupuser/")
def banGroupUser(response: Response, appTokenCode: str, banUserId: str = Form(...), groupId: str = Form(...)):
    response.status_code, result = manageUserClass.banGroupUser(appTokenCode, banUserId, groupId)
    return result

@router.put("/group/")
def putGroup(response: Response, appTokenCode: str, groupId: str = Form(...), groupname: str = Form(...)):
    response.status_code, result = manageUserClass.putGroup(appTokenCode, groupId, groupname)
    return result

@router.put("/leavegroup/")
def leaveGroup(response: Response, appTokenCode: str, groupId: str):
    response.status_code, result = manageUserClass.leaveGroup(appTokenCode, groupId)
    return result


@router.delete("/deletegroup/")
def deleteGroup(response:Response, appTokenCode: str, groupId: str):
    response.status_code, result = manageUserClass.deleteGroup(appTokenCode, groupId)
    return  result

# @router.get("/developedaimeodels/")
# def getDevelopedMeodels(response: Response, token: str):
#     response.status_code, result = manageUserClass.getDevelopedMeodels(token)
#     return result

@router.get("/usages/")
def get_usages(token: str, response: Response):

    response.status_code, result = manageUserClass.get_user_usage(token)

    return result

class UserPropertyData(BaseModel):
    user_property_name: str = None
    user_property_info: dict = None

@router.post("/user-properties/")
def createFlow(response: Response, user_property_data: UserPropertyData, token: str):
    response.status_code, result = manageUserClass.createUserProperty(token, user_property_data)

    return result

@router.get("/user-properties/")
def readUserPropertys(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = '', isVerify: bool = False):
    response.status_code, result = manageUserClass.getUserPropertysById(token, sorting, page, count, tab,
                                                                      desc, searching, isVerify)
    return result

@router.get("/user-properties/{user_property_id}/")
async def readUserProperty(user_property_id: int, token: str, response: Response):
    response.status_code, result = manageUserClass.getUserPropertyById(token, user_property_id)
    return result

@router.get("/user-properties/{user_property_id}/status")
async def read_user_property_status(response: Response, token: str, user_property_id: str):
    response.status_code, result = manageUserClass.get_user_property_status_by_id(token, user_property_id)
    return result
    flow_id: int = None
    flow_node_id: int = None

@router.get("/user-properties-async/{user_property_id}/")
async def readUserPropertyasync(user_property_id: str, token: str, response: Response):
    response.status_code, result = manageUserClass.getUserPropertyAsyncById(token, user_property_id)
    return result

@router.put("/user-properties/{user_property_id}/")
async def updateUserProperty(user_property_id: str, token: str, user_propertyInfo: UserPropertyData, response: Response):
    response.status_code, result = manageUserClass.putUserProperty(token, user_propertyInfo, user_property_id)

    return result

@router.delete("/user-properties/")
async def deleteUserProperty(token: str, response: Response, user_property_id: List[str] = Form(...)):
    response.status_code, result = manageUserClass.deleteUserPropertys(token, user_property_id)
    return result

@router.delete("/user-properties/{user_property_id}/")
async def deleteUserProperty(token: str, response: Response, user_property_id):
    response.status_code, result = manageUserClass.deleteUserProperty(token, user_property_id)
    return result
