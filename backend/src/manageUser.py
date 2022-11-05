import ast
import math
import re
import shutil
import time
import traceback
import uuid

from playhouse.shortcuts import model_to_dict
from pytz import timezone

import requests
import os
import json
import bcrypt
import jwt
from starlette.responses import RedirectResponse

from models import usersTable
from src.util import Util
from src.managePayment import ManagePayment
from src.errors import exceptions as ex
from models.helper import Helper
import datetime
from starlette.status import HTTP_200_OK, HTTP_204_NO_CONTENT, HTTP_301_MOVED_PERMANENTLY
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from starlette.status import HTTP_400_BAD_REQUEST
from starlette.status import HTTP_423_LOCKED
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_507_INSUFFICIENT_STORAGE
import urllib
import urllib.parse
from dateutil.relativedelta import relativedelta
from src.errorResponseList import ErrorResponseList, NOT_FOUND_USER_ERROR, NOT_ALLOWED_TOKEN_ERROR, WRONG_ACCESS_ERROR, \
    DELETE_USER_ERROR, NOT_CONFIRM_EMAIL_ERROR, NOT_ALLOWED_TO_BASIC_ERROR, EXCEED_FILE_SIZE, \
    EXCEED_USER_ERROR, ALREADY_REGISTER_EMAIL_ERROR, ALREADY_REGISTER_USER_ERROR, CHANGE_APPTOKEN_ERROR, \
    MISMATCH_PASSWORD_ERROR, NOT_MATCH_FORM_PASSWORD_ERROR, EXPAIRE_DATE_TIME_ERROR, CHANGE_PASSWORD_ERROR, \
    WRONG_PASSWORD_ERROR, NOT_ACCESS_ERROR, NOT_FOUND_GROUP_ERROR, ALREADY_REGISTER_GROUP_MEMBER, NOT_VALID_EMAIL, \
    NOT_HOST_USER_ERROR, PERMISSION_DENIED_GROUP_ERROR, LEAVE_ADMIN_USER_ERROR, EXCEED_PROJECT_ERROR, \
    NOT_EXISTENT_GROUP_ERROR, NOT_FOUND_AI_ERROR, TOO_MANY_INVITE_ERROR, ALREADY_INVITATION_USER_ERROR, PRICING_ERROR, \
    DO_NOT_EXIT_ADMIN_USER, SEARCH_PROJECT_ERROR, ALREADY_DELETED_OBJECT

errorResponseList = ErrorResponseList()

#TODO: 숫자 헤더면 바꿔줘야됨
class ManageUser:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.paymentClass = ManagePayment()
        self.s3 = self.utilClass.getBotoClient('s3')

    def registerUser(self, userInfoRaw):

        userInfo = userInfoRaw.__dict__
        userInfo['confirmed'] = False

        # if userInfo['socialType'] == 'kakao':
        #     userInfo['socialToken'] = userInfo["password"]
        #     userInfo['confirmed'] = True
        #     url = "https://kapi.kakao.com/v1/user/unlink"
        #     headers = {
        #         'Authorization': f'Bearer {userInfo["socialToken"]}'
        #     }
        #     req = requests.request("POST", url, headers=headers)
        #
        #     if req.status_code != 200:
        #         raise ex.AleadyRegisterEx(userInfo['email'])

        if userInfo['socialType'] == 'google':
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={userInfo['socialToken']}"
            req = requests.get(url)
            if req.status_code != 200:
                raise ex.AleadyRegisterEx(userInfo['email'])
            user_data = self.dbClass.checkValidEmail(userInfo["email"])

            if user_data and user_data.socialID:
                return ALREADY_REGISTER_USER_ERROR
            elif user_data:
                self.dbClass.updateUser(user_data.id,
                                        {'socialToken': userInfo["password"], 'socialID': userInfo["password"]})
            else:
                userInfo['socialToken'] = userInfo["password"]
                userInfo['socialID'] = userInfo["password"]
                userInfo['confirmed'] = True


        if len(re.findall("[A-Za-z]", userInfo["password"])) == 0 or len(re.findall("[0-9]", userInfo["password"])) == 0 or len(re.findall("[!@#$%^&+=]", userInfo["password"])) == 0:
            return WRONG_PASSWORD_ERROR

        if not re.match(r'[A-Za-z0-9!@#$%^&+=]{8,}', userInfo["password"]):
            return NOT_MATCH_FORM_PASSWORD_ERROR

        if not re.match(r'[\w!_.\-]{1,}', userInfo["email"]):
            raise ex.NotAllowedEmailFormatEx(userInfo['email'])

        salt = bcrypt.gensalt(10)
        languageCode = userInfo['languageCode']

        if self.dbClass.checkValidEmail(userInfo["email"]):
            return ALREADY_REGISTER_USER_ERROR

        if '@dslab.global' in userInfo['email']:
            userInfo['isTest'] = True
            userInfo['deposit'] = 3000
            userInfo['usageplan'] = 6

        userInfo["nextPaymentDate"] = datetime.datetime.now().date() + relativedelta(months=1)
        raw_password = userInfo.copy()["password"]
        userInfo["password"] = bcrypt.hashpw(userInfo["password"].encode(), salt)

        usagePlan = self.dbClass.getOneUsageplanByPlanName('business')
        if self.utilClass.configOption == 'enterprise':
            key = self.dbClass.getAdminKey()
            if key and self.utilClass.isValidKey(key):
                key_info = self.utilClass.get_key_info(key)
                if self.dbClass.getUserCount() >= key_info["maxuser"] and not self.utilClass.is_prod_server:
                    return EXCEED_USER_ERROR
            else:
                if self.dbClass.getUserCount() > 1 and not self.utilClass.is_prod_server:
                    return EXCEED_USER_ERROR

            userInit = {
                "confirmed": True,
                "emailTokenCode": uuid.uuid4().hex,
                "appTokenCode": uuid.uuid4().hex,
                "appTokenCodeUpdatedAt": datetime.datetime.utcnow(),
                'isFirstplanDone': True,
                'isDeleteRequested': 0,
                'usageplan': usagePlan["id"],
                'dynos': 1,
                'is_admin': 1
            }

        else:
            userInit = {
                "confirmed": userInfo['confirmed'],
                "emailTokenCode": uuid.uuid4().hex,
                "appTokenCode": uuid.uuid4().hex,
                "appTokenCodeUpdatedAt": datetime.datetime.utcnow(),
                'isFirstplanDone': True,
                'isDeleteRequested': 0,
                'usageplan': usagePlan["id"],
                'dynos': 1,
                'isAiTrainer': userInfo['isAiTrainer']
            }
            if not userInit['confirmed']:
                userInit['confirmed'] = userInfo['isTest']

        try:
            userInfoRaw = self.dbClass.createUser(userInfo)
            userInfo = userInfoRaw.__dict__['__data__']
            del userInfo["password"]
        except:
            print(traceback.format_exc())
            return ALREADY_REGISTER_EMAIL_ERROR

        userInfo = {**userInfo, **userInit}

        self.dbClass.updateUser(userInfo['id'], userInit)

        teamInfo = {'name': f"{userInfo['email']}'s Personal Team", 'teamType': 'Personal', 'languageCode': 'ko', 'usageplan': 3}
        # team = self.dbClass.createTeam(teamInfo)

        data = {'user': userInfo['id'], 'acceptcode': 1, 'email': userInfo['email'], 'role': 'admin',
                'teamUserCount': 1, 'created_at': datetime.datetime.now(), 'userType': 'Personal'}

        # self.dbClass.createTeamUser(data)
        # self.dbClass.createTeamUserHistory(data)

        # if not userInfo['socialID'] and self.utilClass.configOption != 'enterprise':
        if not userInfo['socialID']:
            self.utilClass.sendRegistrationEmail(userInfo, 'en')
        try:
            self.register_metabase_user(userInfo, raw_password)
            self.utilClass.sendSlackMessage(f"회원 가입하였습니다. {userInfo['email']} (ID: {userInfo['id']})",
                                            appLog=True, is_agreed_behavior_statistics=True)
        except Exception as e:
            print(e.args[0].text)
            self.utilClass.sendSlackMessage(f"회원가입 중 메타베이스 계정 생성에 실패했습니다. {userInfo['email']} (ID: {userInfo['id']})", appLog=True)

        return HTTP_201_CREATED, userInfo

    def register_metabase_user(self, user: dict, raw_password: str):

        meta_email = user.get('email')
        meta_names = meta_email.split('@')
        meta_first_name = meta_names[0]
        meta_last_name = meta_names[1]
        try:
            mb = self.utilClass.get_metabase_client()
            if mb:
                new_group = mb.add_group(user.get('id'))
                new_meta_user = mb.add_user(meta_first_name, meta_last_name, meta_email, raw_password)
                mb.add_user_to_group(new_meta_user.get('id'), new_group.get('id'))
        except:
            pass

    def admin_delete_user(self, token, user_id):

        user_raw = self.dbClass.getUser(token, raw=True)
        user = model_to_dict(user_raw)
        if not user or not user.get('is_admin'):
            raise ex.NotFoundAdminEx(token)

        user_info = self.dbClass.get_user_by_id(user_id, raw=True)
        if not user_info:
            raise ex.NotFoundUserEx()

        self.dbClass.deleteOneRow(user_info)

        return HTTP_200_OK, {}

    def admin_retrieve_users(self, token, sorting, count, page, desc, searching):

        user = self.dbClass.getUser(token)
        if not user or not user.get('is_admin'):
            raise ex.NotFoundAdminEx(token)

        user_info_list, user_count = self.dbClass.get_users_by_admin(sorting, desc, searching, page, count)

        result = {
            'user_count': user_count,
            'users': user_info_list
        }

        return HTTP_200_OK, result

    def admin_register_user(self, token, userInfoRaw):

        user = self.dbClass.getUser(token)
        if not user or not user.get('is_admin'):
            raise ex.NotFoundAdminEx(token)

        userInfo = userInfoRaw.__dict__
        userInfo['confirmed'] = True
        raw_password = userInfo.copy()["password"]

        if len(re.findall("[A-Za-z]", userInfo["password"])) == 0 or len(re.findall("[0-9]", userInfo["password"])) == 0 or len(re.findall("[!@#$%^&+=]", userInfo["password"])) == 0:
            return WRONG_PASSWORD_ERROR

        if not re.match(r'[A-Za-z0-9!@#$%^&+=]{8,}', userInfo["password"]):
            return NOT_MATCH_FORM_PASSWORD_ERROR

        if not re.match(r'[\w!_.\-]{1,}', userInfo["email"]):
            raise ex.NotAllowedEmailFormatEx(userInfo['email'])

        salt = bcrypt.gensalt(10)

        if self.dbClass.checkValidEmail(userInfo["email"]):
            return ALREADY_REGISTER_USER_ERROR

        userInfo["nextPaymentDate"] = datetime.datetime.now().date() + relativedelta(months=1)
        userInfo["password"] = bcrypt.hashpw(userInfo["password"].encode(), salt)
        try:
            userInfoRaw = self.dbClass.createUser(userInfo)
            userInfo = userInfoRaw.__dict__['__data__']
            del userInfo["password"]
        except:
            print(traceback.format_exc())
            return ALREADY_REGISTER_EMAIL_ERROR

        usagePlan = self.dbClass.getOneUsageplanByPlanName('business')
        userInit = {
            "confirmed": userInfo['confirmed'],
            "emailTokenCode": uuid.uuid4().hex,
            "appTokenCode": uuid.uuid4().hex,
            "appTokenCodeUpdatedAt": datetime.datetime.utcnow(),
            'isFirstplanDone': True,
            'isDeleteRequested': 0,
            'usageplan': usagePlan["id"],
            'dynos': 1,
            'isAiTrainer': userInfo['isAiTrainer']
        }
        userInfo = {**userInfo, **userInit}

        self.dbClass.updateUser(userInfo['id'], userInit)
        try:
            self.register_metabase_user(userInfo, raw_password)
            self.utilClass.sendSlackMessage(f"회원 가입하였습니다. {userInfo['email']} (ID: {userInfo['id']})",
                                            appLog=True, is_agreed_behavior_statistics=True)
        except Exception as e:
            print(e.args[0].text)
            self.utilClass.sendSlackMessage(f"회원가입 중 메타베이스 계정 생성에 실패했습니다. {userInfo['email']} (ID: {userInfo['id']})",
                                            appLog=True)
        return HTTP_201_CREATED, userInfo

    def getUserSettingInfo(self, token):
        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : getUserSettingInfo \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR
        userSettingInfo =[x.__dict__['__data__'] for x in self.dbClass.getUserSettingInfofromToken(token)][0]
        # userSettingInfo['usageplan'] = self.dbClass.getOneUsageplanById(user['usageplan'])
        try:
            userSettingInfo['promotion'] = self.dbClass.getPromotionByPromotionId(user['promotion'])
        except:
            userSettingInfo['promotion'] = {}
        return HTTP_200_OK, userSettingInfo

    def retrieve_user_count(self):

        user_count = self.dbClass.get_user_count()
        result = {
            'userCount':  user_count
        }
        return HTTP_200_OK, result

    def loginUser(self, userLoginInfo):

        userInfo = {}
        user = None

        if userLoginInfo.socialType == 'DS2.ai':
            user = self.dbClass.loginUser(userLoginInfo.identifier, userLoginInfo.password, raw=True)
            if user:
                userInfo['user'] = user.__dict__['__data__']
        elif userLoginInfo.socialType == 'google':
            user_data = self.dbClass.loginUserBySocialId(userLoginInfo.identifier, userLoginInfo.password)

            if not user_data:
                raise ex.LoginEx()

            userInfo['user'] = model_to_dict(user_data)
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={userLoginInfo.googleIdToken}"

            req = requests.get(url)

            if req.status_code != 200:
                raise ex.NotAllowedTokenEx(userLoginInfo['identifier'])
        if not user:
            user = self.dbClass.getOneUserByEmail(userLoginInfo.identifier, raw=True)
            if user and user.blocked:
                self.utilClass.sendSlackMessage(f'blocked 된 회원이 로그인을 시도하였습니다. {user.email}',
                                                appLog=True)
                raise ex.BlockUserEx(userLoginInfo.identifier)

        if userInfo.get('user') is not None:

            del userInfo['user']["password"]
            self.dbClass.updateUser(userInfo['user']["id"], {
                'oauthToken': userLoginInfo.tokenObj.get('access_token') if userLoginInfo.tokenObj else None,
                'oauthTokenExpiresAt': userLoginInfo.tokenObj.get('expires_at') if userLoginInfo.tokenObj else None,

             })

            userInfo['jwt'] = userInfo['user']["token"]
            if not userInfo['user']["token"]:
                token = jwt.encode({'email': userInfo['user']["email"]}, 'aistorealwayswinning', algorithm='HS256')
                self.dbClass.updateUser(userInfo['user']["id"], {
                    'token': token
                })
                userInfo['user']["token"] = token
                userInfo['jwt'] = token
            del userInfo['user']['socialToken']

            if userInfo['user']['blocked']:
                self.utilClass.sendSlackMessage(f'blocked 된 회원이 로그인을 시도하였습니다. {userInfo["user"]["email"]}',
                                                appLog=True)
                raise ex.BlockUserEx(userLoginInfo.identifier)
            elif userInfo['user']['isDeleteRequested']:
                self.utilClass.sendSlackMessage(f"삭제된 회원의 로그인 시도입니다. " + json.dumps(userLoginInfo.identifier, indent=4, ensure_ascii=False),
                                                appLog=True)
                raise ex.DeleteUserEx(userLoginInfo.identifier)
            elif self.utilClass.configOption == 'enterprise' or userInfo['user']['confirmed']:
                user.number_of_login_attempts = 0
                user.save()
                self.utilClass.sendSlackMessage(f"로그인하였습니다. {userInfo['user']['email']} (ID: {userInfo['user']['id']})", appLog=True)
                appTokenCode = userInfo['user']['appTokenCode']
                isAgreedWithPolicy = userInfo['user']['isAgreedWithPolicy']
                userInfo['user'] = {"id": userInfo['user']['id'], 'tokenCode': userInfo['user']['token'], 'appTokenCode': appTokenCode, 'isAgreedWithPolicy': isAgreedWithPolicy}
                return HTTP_200_OK, userInfo
            else:
                self.utilClass.sendSlackMessage(f"이메일 확인되지 않은 로그인 시도입니다. " + json.dumps(userLoginInfo.identifier, indent=4, ensure_ascii=False),
                                                appLog=True)
                raise ex.NotConfirmEmailEx(userLoginInfo.identifier)
        else:
            if user:
                if not user.number_of_login_attempts:
                    user.number_of_login_attempts = 0
                user.number_of_login_attempts += 1
                if user.number_of_login_attempts >= 5:
                    user.blocked = 1
                user.save()
                if user.blocked:
                    self.utilClass.sendSlackMessage(f'blocked 되었습니다. {user.email}',
                                                    appLog=True)
                    raise ex.SetBlockUserEx(userLoginInfo.identifier)

            self.utilClass.sendSlackMessage(f"로그인 시도 실패입니다. " + json.dumps(userLoginInfo.__dict__.get('identifier'), indent=4, ensure_ascii=False),
                                            appLog=True)
            raise ex.LoginEx()

    def auth(self, appToken):

        user = self.dbClass.getUserByAppToken(appToken)

        if not user:
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "앱 토큰을 잘 못 입력하였습니다."
            }

        userInfo = user.__dict__['__data__']

        if userInfo:

            del userInfo["password"]
            del userInfo['socialToken']

            if userInfo['blocked']:
                self.utilClass.sendSlackMessage(f'blocked 된 회원이 로그인을 시도하였습니다. {userInfo["email"]}',
                                                appLog=True)
                raise ex.BlockUserEx(userInfo['email'])
            elif userInfo['isDeleteRequested']:
                self.utilClass.sendSlackMessage(f"삭제된 회원의 로그인 시도입니다. " + json.dumps(userInfo['email'], indent=4, ensure_ascii=False),
                                                appLog=True)
                raise ex.DeleteUserEx(userInfo['email'])
            elif self.utilClass.configOption == 'enterprise' or userInfo['confirmed']:
                self.utilClass.sendSlackMessage(f"로그인하였습니다. {userInfo['email']} (ID: {userInfo['id']})", appLog=True)
                return HTTP_200_OK, userInfo
            else:
                self.utilClass.sendSlackMessage(f"이메일 확인되지 않은 로그인 시도입니다. " + json.dumps(userInfo['email'], indent=4, ensure_ascii=False),
                                                appLog=True)
                raise ex.NotConfirmEmailEx(userInfo['email'])
        else:
            self.utilClass.sendSlackMessage(f"로그인 시도 실패입니다. " + json.dumps(userInfo['email'], indent=4, ensure_ascii=False),
                                            appLog=True)
            return HTTP_400_BAD_REQUEST, userInfo

    def verifyEmailConfirm(self, token, userid, provider):

        user = self.dbClass.verifyEmailConfirm(token, userid)

        if user:
            is_verfied = 'true'
            code = HTTP_301_MOVED_PERMANENTLY
        else:
            is_verfied = 'false'
            code = HTTP_503_SERVICE_UNAVAILABLE

        redirect = RedirectResponse(url=self.utilClass.frontendURL + f"/signin?email_confirm={is_verfied}")

        return code, redirect

    def getUserCount(self):

        return HTTP_200_OK, self.dbClass.getUserCount()

    # def registerExternalAisKey(self, token, modelName, key, isShareProvider, additionalKey, accessfile):
    #     user = self.dbClass.getUser(token, raw=True)
    #
    #     if not user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageUser.py \n함수 : registerExternalAisKey \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
    #             appError=True, userInfo=user)
    #         return NOT_FOUND_USER_ERROR
    #
    #     if isShareProvider:
    #         modelNameList = [x.externalAiName for x in self.dbClass.getExternalAisByProviderName(modelName)]
    #     else:
    #         modelNameList = [modelName]
    #
    #     for temp in modelNameList:
    #         externalAiModelInfo = self.dbClass.getExternalaiByAiName(temp)
    #
    #         if not externalAiModelInfo:
    #             self.utilClass.sendSlackMessage(
    #                 f"파일 : manageUser.py \n함수 : registerExternalAisKey \n모델명이나 api공유자 이름이 정확하지 않음 | 입력한 토큰 : {token} | isShareProvider : {isShareProvider}| modelName : {modelName} |",
    #                 appError=True, userInfo=user)
    #             return NOT_FOUND_AI_ERROR
    #
    #         if externalAiModelInfo.provider == 'google':
    #             self.s3.put_object(Body=accessfile, Bucket=self.utilClass.bucket_name, Key=f"user/{user.id}/{externalAiModelInfo.externalAiName}")
    #             additionalKey = f'user/{user.id}/{externalAiModelInfo.externalAiName}'
    #
    #         keyInfo = {'modelName': externalAiModelInfo.externalAiName,
    #                    'modeltype': externalAiModelInfo.id,
    #                    'user': user.id,
    #                    'status': 100,
    #                    'modelpath': externalAiModelInfo.provider,
    #                    'apiKey': key,
    #                    'additionalKey': additionalKey
    #                    }
    #         developedModelInfo = self.dbClass.getDevelopedAisByUserIdAndModeltype(user.id, externalAiModelInfo.id)
    #         if developedModelInfo:
    #             self.dbClass.updateDevelopedAiModelsTableById(developedModelInfo.id, keyInfo)
    #         else:
    #             self.dbClass.createDevelopedAiModels(keyInfo)
    #
    #     return HTTP_200_OK, {'user' : user.id, 'modelName' : modelName, 'key' : key}

    # def getUsageplans(self, token):
    #
    #     user = self.dbClass.getUser(token)
    #
    #     if not user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageUser.py \n함수 : getUsageplans \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
    #             appError=True, userInfo=user)
    #         return NOT_FOUND_USER_ERROR
    #
    #     usageplansRaw = self.dbClass.getUsageplans()
    #     usageplans = []
    #     for usageplanRaw in usageplansRaw:
    #         usageplan = usageplanRaw.__dict__['__data__']
    #
    #         if user['promotionCode']:
    #             promotion = self.dbClass.getPromotionIdByPromotionCode(user)
    #             if promotion:
    #                 if promotion.planName:
    #                     if promotion.planName == usageplan["planName"]:
    #                         usageplan["price"] = usageplan["price"] * (1 - 0.01 * promotion.discountPercent) if usageplan["price"] else 0
    #                 else:
    #                     usageplan["price"] = usageplan["price"] * (1 - 0.01 * promotion.discountPercent) if usageplan["price"] else 0
    #
    #         usageplans.append(usageplan)
    #
    #     return HTTP_200_OK, usageplans

    def checkValidEmail(self, email, socialType):

        user = self.dbClass.checkValidEmail(email)
        if user and user.isDeleteRequested:
            raise ex.DeletedUserEx(user.email)
        elif (user and socialType != 'google') or (user and socialType == 'google' and user.socialID):
            raise ex.AleadyRegisterEx(user.email)
        else:
            return HTTP_200_OK, {"status_code": 200, "message": "사용가능한 이메일입니다.",
                                 "message_en": "This email is available.",
                                 "detail": f"사용가능한 이메일입니다.",
                                 "code": f"{HTTP_200_OK}{'1'.zfill(4)}"}

    def putUserLogo(self,token, file, filename):
        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putUserLogo \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if filename is not None:
            filename = filename.replace(" ", '')
            if self.utilClass.configOption == 'enterprise':
                timestamp = time.strftime('%y%m%d%H%M%S')
                temp_file = f'{self.utilClass.save_path}/user/{user["id"]}/{timestamp}{filename}'
                os.makedirs(f'{self.utilClass.save_path}/user/{user["id"]}', exist_ok=True)
                with open(temp_file, 'wb') as open_file:
                    open_file.write(file)
                s3Url = f'{self.utilClass.save_path}/user/{user["id"]}/{timestamp}{filename}'
            else:
                self.s3.put_object(Body=file, Bucket=self.utilClass.bucket_name, Key=f'user/{user["id"]}/logo/{filename}')
                s3Url = urllib.parse.quote(f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{user["id"]}/logo/{filename}').replace('https%3A//','https://')

            userChangableInfo = {'companyLogoUrl' : s3Url}
        else:
            userChangableInfo = {'companyLogoUrl': None}

        self.utilClass.sendSlackMessage(
            f"유저 로고가 변경되었습니다. {user['email']} (ID: {user['id']}) , {json.dumps(userChangableInfo,indent=4, ensure_ascii=False, default=str)}",
            appLog=True, userInfo=user)

        if userChangableInfo:
            self.dbClass.updateUser(user.get('id'), userChangableInfo)
            return HTTP_200_OK, userChangableInfo
        else:
            return HTTP_200_OK, userChangableInfo


    def putUserByApptoken(self, apptoken, userChangableInfoRaw):
        user = self.dbClass.getUserByAppToken(apptoken)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putUser \n잘못된 토큰으로 에러 | 입력한 토큰 : {apptoken}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        user = model_to_dict(user)
        userChangableInfo = {**userChangableInfoRaw.__dict__}

        if userChangableInfo.get('promotionCode'):
            try:
                userChangableInfo['promotion'] = self.dbClass.getPromotionIdByPromotionCode(userChangableInfo.get('promotionCode'))
            except:
                userChangableInfo['promotion'] = {}
                pass

        userChangableInfo = {k: v for k, v in userChangableInfo.items() if v is not None}
        self.utilClass.sendSlackMessage(
            f"유저 정보가 변경되었습니다. {user['email']} (ID: {user['id']}) , {json.dumps(userChangableInfo,indent=4, ensure_ascii=False, default=str)}",
            appLog=True, userInfo=user)

        if userChangableInfo:
            self.dbClass.updateUser(user.get('id'), userChangableInfo)
            return HTTP_200_OK, userChangableInfoRaw.__dict__
        else:
            return HTTP_200_OK, userChangableInfoRaw.__dict__

    def putUser(self, token, userChangableInfoRaw):
        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putUser \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        isDeleteRequested = userChangableInfoRaw.isDeleteRequested
        userChangableInfo = {**userChangableInfoRaw.__dict__}

        if userChangableInfo.get('promotionCode'):
            try:
                userChangableInfo['promotion'] = self.dbClass.getPromotionIdByPromotionCode(userChangableInfo.get('promotionCode'))
            except:
                userChangableInfo['promotion'] = {}
                pass

        userChangableInfo = {k: v for k, v in userChangableInfo.items() if v is not None}


        self.utilClass.sendSlackMessage(
            f"유저 정보가 변경되었습니다. {user['email']} (ID: {user['id']}) , {json.dumps(userChangableInfo,indent=4, ensure_ascii=False, default=str)}",
            appLog=True, userInfo=user)

        if userChangableInfo:
            self.dbClass.updateUser(user.get('id'), userChangableInfo)
            return HTTP_200_OK, userChangableInfoRaw.__dict__
        else:
            return HTTP_200_OK, userChangableInfoRaw.__dict__

    # def postUsagehistory(self, token, usagehistoryInfoRaw):
    #     user = self.dbClass.getUser(token)
    #     if not user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageUser.py \n함수 : postUsagehistory \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
    #             appError=True, userInfo=user)
    #         return NOT_FOUND_USER_ERROR
    #
    #     usagehistoryInfo = {**usagehistoryInfoRaw.__dict__}
    #     usagehistoryInfo['user'] = user['id']
    #     return HTTP_201_CREATED, self.dbClass.createUsagehistory(usagehistoryInfo)

    def getMe(self, token, provider=None):

        try:
            user = self.dbClass.getUser(token)

            user["billings"] = []
            user['hasFirstTrialTeam'] = self.dbClass.getFirstTrialTeamByUserId(user['id'])
            user['user_properties'] = self.dbClass.getUserPropertiesByUserId(user['id'])

            try:
                user["usageplan"] = self.dbClass.getOneUsageplanById(user["usageplan"])
                if user['promotionCode']:
                    promotion = self.dbClass.getPromotionIdByPromotionCode(user)
                    if promotion:
                        if promotion.planName:
                            if promotion.planName == user["usageplan"]["planName"]:
                                user["usageplan"]["price"] = user["usageplan"]["price"] * (1 - 0.01 * promotion.discountPercent)
                        else:
                            user["usageplan"]["price"] = user["usageplan"]["price"] * (1 - 0.01 * promotion.discountPercent)

            except:
                pass
            del user['cardInfo']
            del user['password']
            del user['resetPasswordVerifyTokenID']
            del user['resetPasswordVerifyLink']

            userUsage = self.dbClass.getUserUsageByUserId(user['id'])
            userUsage['ClickAi'] = user['cumulativePredictCount']
            user['usage'] = userUsage

            return HTTP_200_OK, user
        except:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : getMe \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

    def forgotPassword(self, reset_info):

        email = reset_info.email
        provider = reset_info.provider
        language_code = reset_info.languageCode

        user = self.dbClass.getUserByEmail(email)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : forgotPassword \n잘못된 유저 (isDeletedREquested) | 입력한 토큰 : {user}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if user['isDeleteRequested']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : forgotPassword \n삭제된 유저 (isDeletedREquested) | 입력한 토큰 : {user}",
                appError=True, userInfo=user)
            return DELETE_USER_ERROR

        code = jwt.encode({'email': email + str(datetime.datetime.utcnow())}, 'aistorealwayswinning',
                           algorithm='HS256')

        self.utilClass.sendResetPasswordEmail(email, code, provider, 'en')

        self.dbClass.updateUser(user["id"], {
            "resetPasswordVerifyTokenID": code,
            "resetPasswordRequestDatetime": datetime.datetime.utcnow()
        })

        # if languageCode == 'ko':
        #     filePath = "./src/emailContent/password_reset.html"
        #     titleName = '[DS2.ai] 비밀번호 초기화'
        # else:
        #     filePath = "./src/emailContent/password_reset_en.html"
        #     titleName = '[DS2.ai] Reset Password'
        #
        # with open(filePath, "r") as r:
        #     token = jwt.encode({'email': email + str(datetime.datetime.utcnow())}, 'aistorealwayswinning', algorithm= 'HS256')
        #     content = r.read().replace("<%= TOKEN %>", token).replace("<%= Backend URL %>", self.utilClass.frontendURL)
        #     result = self.utilClass.sendEmail(email, f'{titleName}', content)
        #     self.dbClass.updateUser(user["id"], {
        #         "resetPasswordVerifyTokenID": token,
        #         "resetPasswordRequestDatetime": datetime.datetime.utcnow()
        #     })

        self.utilClass.sendSlackMessage(f"비밀번호 리셋 요청합니다. {user['email']} (ID: {user['id']})", appLog=True, userInfo=user)
        result = {
            "message": "고객님의 메일로 링크를 보내드렸습니다. 메일발송까지 5-10분 정도 소요될 수 있습니다.",
            "message_en": "The link has been sent via email. It may take 5-10 minutes for the email to arrive."
        }

        return HTTP_200_OK, result

    def reset_password_by_admin(self, token, user_id, password, password_confirm):

        admin_user = self.dbClass.getUser(token)

        if not admin_user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : resetPassword \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=admin_user)
            return NOT_FOUND_USER_ERROR

        if not admin_user.get('is_admin'):
            raise ex.NotFoundAdminEx()

        user = self.dbClass.get_user_by_id(user_id)

        if password != password_confirm:
            return MISMATCH_PASSWORD_ERROR

        if not re.match(r'[A-Za-z0-9!@#$%^&+=]{7,}', password):
            return NOT_MATCH_FORM_PASSWORD_ERROR

        if len(re.findall("[a-z]", password)) == 0 or len(re.findall("[0-9]", password)) == 0 or len(re.findall("[!@#$%^&+=]", password)) == 0:
            return WRONG_PASSWORD_ERROR

        salt = bcrypt.gensalt(10)
        password = bcrypt.hashpw(password.encode(), salt)

        self.dbClass.updateUser(user["id"], {
            "password": password,
            "token": None,
            "appTokenCode": uuid.uuid4().hex
        })

        self.utilClass.sendSlackMessage(f"비밀번호 리셋 완료합니다. {user['email']} (ID: {user['id']})", appLog=True, userInfo=user)

        return HTTP_200_OK, user

    def resetPassword(self, token, password, passwordConfirmation):

        if password != passwordConfirmation:
            return MISMATCH_PASSWORD_ERROR

        if not re.match(r'[A-Za-z0-9!@#$%^&+=]{7,}', password):
            return NOT_MATCH_FORM_PASSWORD_ERROR

        if len(re.findall("[a-z]", password)) == 0 or len(re.findall("[0-9]", password)) == 0 or len(re.findall("[!@#$%^&+=]", password)) == 0:
            return WRONG_PASSWORD_ERROR

        user = self.dbClass.getUserByForgetEmailToken(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : resetPassword \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if user['resetPasswordRequestDatetime']:
            if user["resetPasswordRequestDatetime"] + datetime.timedelta(days=1) < datetime.datetime.utcnow():
                return EXPAIRE_DATE_TIME_ERROR

        salt = bcrypt.gensalt(10)
        password = bcrypt.hashpw(password.encode(), salt)

        self.dbClass.updateUser(user["id"],{
            "password": password,
            "token": None,
            "appTokenCode": uuid.uuid4().hex
        })

        self.utilClass.sendSlackMessage(f"비밀번호 리셋 완료합니다. {user['email']} (ID: {user['id']})", appLog=True, userInfo=user)

        return CHANGE_PASSWORD_ERROR

    def getGroupByappToken(self, apptoken):
        user = self.dbClass.getUserByAppToken(apptoken)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : getGroupDataByAdminId \n허용되지 않은 앱 토큰 값입니다. token = {apptoken})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR


        userId = user.__dict__['__data__']['id']
        adminGroup = [x.__dict__['__data__'] for x in self.dbClass.getGroupsByUserIdAndRoles(userId, 'admin')]

        for group in adminGroup:
            group['member'] = [x.__dict__['__data__'] for x in self.dbClass.getMembersByGroupId(group['id'], True)]

        memberGroup = []
        memberGroup_raw = [x.__dict__['__data__'] for x in self.dbClass.getGroupsByUserIdAndRoles(userId)]

        for group in memberGroup_raw:
            group['member'] = [x.__dict__['__data__'] for x in self.dbClass.getMembersByGroupId(group['id'], False)]
            group['hostuserList'] = self.dbClass.getHostUsersByGroupId(group['id']).__dict__['__data__']
            group['acceptcode'] = self.dbClass.getMemberByUserIdAndGroupId(userId, group['id']).__dict__['__data__']['acceptcode']
            host_user = self.dbClass.getOneUserById(group['hostuserList']['user'], raw=True)
            if host_user and host_user.isDeleteRequested != True:
                memberGroup.append(group)

        result = {'parentsGroup' : adminGroup, 'childrenGroup' : memberGroup}

        return HTTP_200_OK, result

    def get_groups(self, token, labelproject_id):
        user = self.dbClass.getUser(token)
        if not user:
            raise ex.NotFoundUserEx(token=token)

        labelproject_raw = self.dbClass.getOneLabelProjectById(labelproject_id)

        if labelproject_raw.user != user['id']:
            shared_label_projects = []
            for temp in self.dbClass.getSharedLabelprojectIdByUserId(user['id']):
                if temp.labelprojectsid:
                    shared_label_projects = list(set(shared_label_projects + ast.literal_eval(temp.labelprojectsid)))

            if int(labelproject_id) not in shared_label_projects:
                raise ex.NotAllowedTokenEx(user['email'])

        group_ids = ast.literal_eval(labelproject_raw.sharedgroup) if labelproject_raw.sharedgroup else []

        result = []
        for group_id in group_ids:
            group = self.dbClass.getOneGroupById(group_id, raw=True)
            if group is not None:
                group_dict = model_to_dict(group)
                memberGroup = [model_to_dict(x) for x in self.dbClass.getMembersByGroupId(group_id, isAdmin=True)]
                result.append({"groupInfo":group_dict, "member":memberGroup})

        return HTTP_200_OK, result

    def createGroup(self, apptoken, groupName, teamId=None, provider='clickAi'):

        user = self.dbClass.getUserByAppToken(apptoken)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : deletgetGroupsByChildrenIdeProject \n허용되지 않은 앱 토큰 값입니다. token = {apptoken})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        userId = user.__dict__['__data__']['id']
        userEmail = user.__dict__['__data__']['email']
        adminGroup = [x.__dict__['__data__'] for x in self.dbClass.getGroupsByUserIdAndRoles(userId, 'admin')]
        for group in adminGroup:
            if groupName == group['groupname']:
                raise ex.NotValidGroupNameEx()

        group = {'groupname': groupName, 'created_at': datetime.datetime.now(), 'updated_at': datetime.datetime.now(), 'provider': provider}

        if teamId:
            group['teamId'] = teamId

        group = self.dbClass.createGroup(group).__dict__['__data__']

        admin = {'groupId': group['id'], 'groupType': 'normal', 'user': userId, 'useremail': userEmail, 'role': 'admin', 'acceptcode': 1}

        self.dbClass.createGroupUser(admin)
        group['admin'] = admin

        return HTTP_201_CREATED, group

    def inviteGroupByEmail(self, apptoken, groupId, email, languageCode = 'ko'):
        user = self.dbClass.getUserByAppToken(apptoken)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : inviteGroupByEmail \n일치하는 앱 토큰가진 사용자가 없습니다. token = {apptoken})",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        else:
            user = user.__dict__['__data__']

        group = self.dbClass.getOneGroupById(groupId, True)
        member = self.dbClass.getMemberByUserIdAndGroupId(user['id'], groupId)

        if not group:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : inviteGroupByEmail \n존재 하지 않는 groupId 입니다. groupId = {groupId})",
                appError=True, userInfo=user)
            return NOT_FOUND_GROUP_ERROR
        else:
            group = group.__dict__['__data__']

        if not member:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : inviteGroupByEmail \n그룹의 멤버가 아닙니다. groupId = {groupId}, userId = {user['id']})",
                appError=True, userInfo=user)
            return PERMISSION_DENIED_GROUP_ERROR
        else:
            member = member.__dict__['__data__']

        if member['role'] != 'admin':
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : inviteGroupByEmail \n유저Id와 그룹 user가 다릅니다. user = {user['id']} groupId = {groupId})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        inviteUser = self.dbClass.getUserByEmail(email)

        if not inviteUser or inviteUser['isDeleteRequested']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : inviteGroupByEmail \n초대하려는 이메일이 유효하지 않습니다. user = {user['id']} groupId = {groupId} email = {email})",
                appError=True, userInfo=user)
            return NOT_VALID_EMAIL

        if self.dbClass.checkSignedGroup(inviteUser['id'], groupId) > 0:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : inviteGroupByEmail \n이미 그룹에 가입된 user입니다. user = {user['id']} groupId = {groupId})",
                appError=True, userInfo=user)
            return ALREADY_REGISTER_GROUP_MEMBER
        result = {}

        acceptcode = 0

        invitedMember = self.dbClass.getMemberByUserIdAndGroupId(inviteUser['id'], groupId)
        if not invitedMember:
            data = {'useremail' : email, 'groupId' : group['id'], 'role' : 'member' ,'user' : inviteUser['id'], 'acceptcode' : acceptcode}
            result = self.dbClass.createGroupUser(data).__dict__['__data__']
            self.utilClass.sendEmailAfterInviteGroup(group, inviteUser, user, languageCode)
        elif invitedMember.acceptcode == 0:
            return ALREADY_INVITATION_USER_ERROR
        elif invitedMember.invitationcount < 3:
            data = {'acceptcode' : 0}
            self.dbClass.updateGroupUserByGroupIdAndUserId(groupId, inviteUser['id'], data)
            self.utilClass.sendEmailAfterInviteGroup(group, inviteUser, user, languageCode)
        else:
            return TOO_MANY_INVITE_ERROR

        return HTTP_201_CREATED, result

    def updateShareGroup(self, apptoken, projectId, groupId, isAdd = True, isLabelProject = False):

        groupId = -1 if groupId == -1 else [groupId]

        user = self.dbClass.getUserByAppToken(apptoken)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageProject.py \n함수 : getProjectsById \n잘못된 토큰으로 에러 | 입력한 토큰 : {apptoken}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        else:
            user = user.__dict__['__data__']

        if type(groupId) == int and groupId == -1:
            groupId = [x.__dict__['__data__']['id'] for x in self.dbClass.getGroupsByUserIdAndRoles(user['id'], 'admin')]

        if not isLabelProject:
            project = self.dbClass.getOneProjectById(projectId, True)

            if project.user != user['id']:
                self.utilClass.sendSlackMessage(
                    f"파일 : manageUser\n 함수 : appendShareGroup \n허용되지 않은 토큰 값입니다. token = {apptoken})",
                    appError=True, userInfo=user)
                return NOT_ALLOWED_TOKEN_ERROR
        else:
            project = self.dbClass.getOneLabelProjectById(projectId)

            if project.user != user['id']:
                self.utilClass.sendSlackMessage(
                    f"파일 : manageUser\n 함수 : appendShareGroup \n허용되지 않은 토큰 값입니다. token = {apptoken})",
                    appError=True, userInfo=user)
                return NOT_ALLOWED_TOKEN_ERROR

        if not project.sharedgroup:
            project.sharedgroup = '[]'

        project.sharedgroup = ast.literal_eval(project.sharedgroup)

        if isAdd:
            project.sharedgroup = list(set(project.sharedgroup + groupId))
        else:
            [project.sharedgroup.remove(id) for id in groupId if id in project.sharedgroup]
        project.save()

        for id in groupId:
            group = self.dbClass.getOneGroupById(id, True)
            if not group:
                self.utilClass.sendSlackMessage(
                    f"파일 : manageUser\n 함수 : appendShareGroup \n허용되지 않은 토큰 값입니다. token = {apptoken}, groupId = {groupId})",
                    appError=True, userInfo=user)
                return NOT_EXISTENT_GROUP_ERROR

            member = self.dbClass.getMemberByUserIdAndGroupId(user['id'], id)
            if not isLabelProject:
                if not group.projectsid:
                    group.projectsid = '[]'
                group.projectsid = ast.literal_eval(group.projectsid)
                if isAdd:
                    group.projectsid = list(set(group.projectsid + [int(projectId)]))
                else:
                    if int(projectId) in group.projectsid:
                        group.projectsid.remove(int(projectId))
            else:
                if not group.labelprojectsid:
                    group.labelprojectsid = '[]'
                group.labelprojectsid = ast.literal_eval(group.labelprojectsid)
                if isAdd:
                    group.labelprojectsid = list(set(group.labelprojectsid + [int(projectId)]))
                else:
                    if int(projectId) in group.labelprojectsid:
                        group.labelprojectsid.remove(int(projectId))

            if member.role != 'admin':
                self.utilClass.sendSlackMessage(
                    f"파일 : manageUser\n 함수 : appendShareGroup \n그룹장이 아닌 계정으로 프로젝트 공유 user = {user['id']}, group = {group.id}, projectId = {projectId})",
                    appError=True, userInfo=user)
                return NOT_HOST_USER_ERROR
            else:
                group.save()

            result = {'sharedgroup': self.dbClass.getOneLabelProjectById(projectId).sharedgroup if isLabelProject else self.dbClass.getOneProjectById(projectId, True).sharedgroup}

        return HTTP_200_OK, result

    def deleteGroup(self, apptoken, groupId):
        user = self.dbClass.getUserByAppToken(apptoken)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putUser \n잘못된 토큰으로 에러 | 입력한 토큰 : {apptoken}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        else:
            user = user.__dict__['__data__']

        role = self.dbClass.getMemberByUserIdAndGroupId(user['id'], groupId).role

        if role != 'admin':
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : deleteGroup \n그룹장이 아닌 계정으로 프로젝트 공유 user = {user['id']}, group = {groupId})",
                appError=True, userInfo=user)
            return NOT_HOST_USER_ERROR

        group = self.dbClass.getOneGroupById(groupId, True)
        if group.labelprojectsid:
            labelprojects = ast.literal_eval(group.labelprojectsid)

            for labelproject in labelprojects:
                labelprojectRaw = self.dbClass.getOneLabelProjectById(labelproject)
                sharedGroup = ast.literal_eval(labelprojectRaw.sharedgroup)
                sharedGroup.remove(group.id)
                labelprojectRaw.sharedgroup = sharedGroup
                labelprojectRaw.save()
        if group.projectsid:
            projectsid = ast.literal_eval(group.projectsid)

            for project in projectsid:
                projectRaw = self.dbClass.getOneProjectById(project, raw=True)
                sharedGroup = ast.literal_eval(projectRaw.sharedgroup)
                sharedGroup.remove(group.id)
                projectRaw.sharedgroup = sharedGroup
                projectRaw.save()

        [x.delete_instance() for x in self.dbClass.getMembersByGroupId(groupId, True)]
        group.delete_instance()

        return HTTP_204_NO_CONTENT, {}

    def leaveGroup(self, apptoken, groupId):
        user = self.dbClass.getUserByAppToken(apptoken)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putUser \n잘못된 토큰으로 에러 | 입력한 앱토큰 : {apptoken}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        else:
            user = user.__dict__['__data__']

        member = self.dbClass.getMemberByUserIdAndGroupId(user['id'], groupId)

        if member is None:
            return PERMISSION_DENIED_GROUP_ERROR

        if member.role == 'admin':
            return DO_NOT_EXIT_ADMIN_USER

        member.delete_instance()
        member.save()
        return HTTP_200_OK, member.__dict__['__data__']

    def putGroup(self, apptoken, groupId, groupname):
        user = self.dbClass.getUserByAppToken(apptoken)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putUser \n잘못된 토큰으로 에러 | 입력한 토큰 : {apptoken}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        else:
            user = user.__dict__['__data__']

        groupUser = self.dbClass.getMemberByUserIdAndGroupId(user['id'], groupId)

        if groupUser is None or groupUser.role != 'admin':
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : banGroupUser \n그룹장이 아닌 계정으로 그룹명 변경 user = {user['id']}, group = {groupId})",
                appError=True, userInfo=user)
            return NOT_HOST_USER_ERROR

        if groupname:
            self.dbClass.updateGroupNameByGroupId(groupId, groupname)

        return HTTP_200_OK, {'groupname':groupname}

    def banGroupUser(self, apptoken, banUserId, groupId):
        user = self.dbClass.getUserByAppToken(apptoken)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : inviteGroupByEmail \n일치하는 앱 토큰가진 사용자가 없습니다. token = {apptoken})",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        else:
            user = user.__dict__['__data__']

        group = self.dbClass.getOneGroupById(groupId, True)
        groupUser = self.dbClass.getMemberByUserIdAndGroupId(user['id'], groupId)

        if groupUser is None:
            return PERMISSION_DENIED_GROUP_ERROR

        if groupUser.role != 'admin':
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : banGroupUser \n그룹장이 아닌 계정으로 유저 퇴출 user = {user['id']}, group = {group.id})",
                appError=True, userInfo=user)
            return NOT_HOST_USER_ERROR

        banUser = self.dbClass.getMemberByUserIdAndGroupId(banUserId, groupId)

        if banUser is None:
            return NOT_FOUND_USER_ERROR

        new_accept_code = 99 if group.groupType == 'aiTrainer' else banUser.delete_instance()
        data = {'acceptcode': new_accept_code}
        self.dbClass.updateGroupUserByGroupIdAndUserId(groupId, banUser.id, data)

        return HTTP_200_OK, {}

    def acceptInvited(self, apptoken, groupId, accept):
        user = self.dbClass.getUserByAppToken(apptoken)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : inviteGroupByEmail \n일치하는 앱 토큰가진 사용자가 없습니다. token = {apptoken})",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        else:
            user = user.__dict__['__data__']

        group = self.dbClass.getMemberByUserIdAndGroupId(user['id'], groupId)

        if not group:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : inviteGroupByEmail \n존재 하지 않는 groupId 입니다. groupId = {groupId})",
                appError=True, userInfo=user)
            return NOT_FOUND_GROUP_ERROR

        if accept:
            group.acceptcode = 1
            group.invitationcount = 0
        else:
            if not group.invitationcount:
                group.invitationcount = 0
            group.invitationcount += 1
            group.acceptcode = 2
        group.save()

        return HTTP_200_OK, group.__dict__['__data__']

    def regenerateAppToken(self, token):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : regenerateAppToken \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        appTokenCodeUpdatedAt = user["appTokenCodeUpdatedAt"]

        if appTokenCodeUpdatedAt:
            if appTokenCodeUpdatedAt + datetime.timedelta(days=1) > datetime.datetime.utcnow():
                return CHANGE_APPTOKEN_ERROR

        self.dbClass.updateUser(user['id'], {
            "appTokenCode": uuid.uuid4().hex,
            "appTokenCodeUpdatedAt": datetime.datetime.utcnow(),
        })
        user = self.dbClass.getUser(token)

        return HTTP_200_OK, {"appTokenCode": user['appTokenCode'] }

    # def getDevelopedMeodels(self, token):
    #     user = self.dbClass.getUser(token, True)
    #     if not user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageUser.py \n함수 : regenerateAppToken \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
    #             appError=True, userInfo=user)
    #         return NOT_FOUND_USER_ERROR
    #
    #     result = []
    #     for x in self.dbClass.getDeveloperModelsByUserId(user.id):
    #         x = x.__dict__['__data__']
    #         x['modeltype'] = self.dbClass.getExternalaiById(x['modeltype']).__dict__['__data__']
    #         result.append(x)
    #
    #     return HTTP_200_OK, result

    def get_upload_amount(self, user, file_size):
        if type(user) != dict:
            user = user.__dict__['__data__']
        before_gb = math.ceil(user['cumulativeDiskUsage'] / (1 * 1024 * 1024 * 1024))
        after_gb = math.ceil((user['cumulativeDiskUsage'] + file_size) / (1 * 1024 * 1024 * 1024))
        price_per_gb = self.dbClass.get_price_with_pricing_name("DataUp", raw=True).price
        amount = (after_gb - before_gb) * price_per_gb

        return amount

    def get_user_usage(self, token):
        #TODO: 모델생성 요금 추가

        user = self.dbClass.getUser(token, True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : regenerateAppToken \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if self.utilClass.configOption == 'enterprise':
            return HTTP_200_OK, {}

        amount_dict, start_date, end_date = self.paymentClass.get_usage_amount_by_user(user)
        amount_dict['deposit'] = round(user.deposit, 3)
        results = []
        for amount_name, amount_key in amount_dict.items():
            result = {
                'name': amount_name,
                'value': amount_key
            }
            results.append(result)

        return HTTP_200_OK, results

    def createUserProperty(self, token, flow_data):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createFlow \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        user_property_raw = self.dbClass.createUserProperty({
            "user_property": flow_data.user_property,
            "user_property_info": flow_data.user_property_info,
            "user": user.id,
        })

        return HTTP_200_OK, user_property_raw.__dict__['__data__']

    def getUserPropertysById(self, token, sorting, page, count, tab, desc, searching, is_verify=False):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageUser.py \n함수 : getUserPropertysById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        shared_user_properties = []
        for temp in self.dbClass.getSharedUserPropertyIdByUserId(user['id']):
            if temp.user_propertiesid:
                shared_user_properties = list(set(shared_user_properties + ast.literal_eval(temp.user_propertiesid)))
        user_properties, totalLength = self.dbClass.getAllUserPropertyByUserId(user['id'], shared_user_properties, sorting, tab, desc,
                                                                   searching, page, count, is_verify)

        result_user_properties = []
        for user_property in user_properties:
            user_property = model_to_dict(user_property)
            result_user_properties.append(user_property)

        result = {'user_properties': result_user_properties, 'totalLength': totalLength}

        return HTTP_200_OK, result

    def deleteUserProperty(self, token, user_property_id):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteUserProperty \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        user_property = self.dbClass.getOneUserPropertyById(user_property_id, raw=True)

        if user_property.user != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : deleteUserProperty \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        user_property.is_deleted = True
        user_property.status = 0
        user_property.save()
        if self.utilClass.configOption == 'enterprise':
            try:
                shutil.rmtree(f"{self.utilClass.save_path}/{user_property.id}")
            except:
                pass

        self.utilClass.sendSlackMessage(
            f"USER PROPERTY를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {user_property.user_property_name} (ID: {user_property.id})",
            appLog=True, userInfo=user)

        return HTTP_204_NO_CONTENT, {}

    def deleteUserPropertys(self, token, user_property_idList):

        failList = []
        successList = []

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteUserProperty \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        for user_property_id in user_property_idList:
            try:
                user_property = self.dbClass.getOneUserPropertyById(user_property_id, raw=True)

                if user_property.user != user['id']:
                    self.utilClass.sendSlackMessage(
                        f"파일 : manageUser\n 함수 : deleteUserProperty \n허용되지 않은 토큰 값입니다. token = {token})",
                        appError=True, userInfo=user)
                    return NOT_ALLOWED_TOKEN_ERROR

                user_property.is_deleted = True
                user_property.status = 0
                user_property.save()
                if self.utilClass.configOption == 'enterprise':
                    try:
                        shutil.rmtree(f"{self.utilClass.save_path}/{user_property.id}")
                    except:
                        pass

                self.utilClass.sendSlackMessage(
                    f"USER PROPERTY를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {user_property.user_property_name} (ID: {user_property.id})",
                    appLog=True, userInfo=user)
                successList.append(user_property_id)
            except:
                failList.append(user_property_id)
                self.utilClass.sendSlackMessage(
                    f"USER PROPERTY 삭제 중 실패하였습니다. {user['email']} (ID: {user['id']}) , {user_property.user_property_name} (ID: {user_property.id})",
                    appLog=True, userInfo=user)

        return HTTP_200_OK, {'successList': successList, 'failList': failList}

    def putUserProperty(self, token, user_property_info_raw, user_property_id):
        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putUserProperty \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        user_property_info = {**user_property_info_raw.__dict__}

        user_property = self.dbClass.getOneUserPropertyById(user_property_id)

        if user_property.get('user', 0) != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : putUserProperty \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        user_property_info = {k: v for k, v in user_property_info.items() if v is not None}

        self.utilClass.sendSlackMessage(
            f"USER PROPERTY 상태가 변경되었습니다. {user['email']} (ID: {user['id']}) , {user_property['user_property_name']} (ID: {user_property_id})\n" +
            json.dumps(user_property_info, indent=4, ensure_ascii=False, default=str),
            appLog=True, userInfo=user)

        self.dbClass.updateUserProperty(user_property_id, user_property_info)
        user_property_info = self.dbClass.getOneUserPropertyById(user_property_id)

        return HTTP_200_OK, user_property_info

    def get_user_property_status_by_id(self, token, user_property_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : getUserPropertyById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        user_property = self.dbClass.getOneUserPropertyById(user_property_id)

        if user_property['user'] != user['id']:
            shared_user_properties = []
            for temp in self.dbClass.getSharedUserPropertyIdByUserId(user['id']):
                if temp.user_propertiesid:
                    shared_user_properties = list(set(shared_user_properties + ast.literal_eval(temp.user_propertiesid)))

            if int(user_property_id) not in shared_user_properties:
                raise ex.NotAllowedTokenEx(user['email'])

        result = {
            "user_property_id": user_property_id,
            "status": user_property['status'],
        }

        return HTTP_200_OK, result

    def getUserPropertyById(self, token, user_property_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageUser.py \n함수 : getUserPropertyById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        user_property = self.dbClass.getOneUserPropertyById(user_property_id)

        if user_property['is_deleted']:
            return ALREADY_DELETED_OBJECT

        if user_property['user'] != user['id'] and user_property['is_sample'] in [False, None]:
            shared_user_properties = []
            for temp in self.dbClass.getSharedUserPropertyIdByUserId(user['id']):
                if temp.user_propertiesid:
                    shared_user_properties = list(set(shared_user_properties + ast.literal_eval(temp.user_propertiesid)))

            if int(user_property_id) not in shared_user_properties:
                raise ex.NotAllowedTokenEx(user['email'])


        if user_property.get('user', 0) == user['id']:
            return HTTP_200_OK, user_property
        elif user_property.get('is_sample'):
            return HTTP_200_OK, user_property
        else:
            return SEARCH_PROJECT_ERROR