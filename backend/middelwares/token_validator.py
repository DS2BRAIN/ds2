import base64
import hmac
import json
import time
import traceback
import typing
import re

import jwt
import sqlalchemy.exc

from fastapi import Request
from jwt.exceptions import ExpiredSignatureError, DecodeError
from starlette.responses import JSONResponse

from models import usersTable
from src.errors import exceptions as ex
import datetime

from models.helper import Helper
from src.errorResponseList import NORMAL_ERROR
from src.errors.exceptions import APIException
from src.logger import api_logger
from src.util import Util
utilClass = Util()

db_class = Helper()
EXCEPT_PATH_REGEX = "^(/docs|/redoc|/api/auth)"
EXCEPT_PATH_LIST = ["/", "/register-key/", "/openapi.json"]

def to_dict(data):
    return data.__dict__['__data__']

async def access_control(request: Request, call_next):
    request.state.req_time = datetime.date.today()
    request.state.start = time.time()
    request.state.inspect = None
    request.state.user = None
    request.state.service = None
    # body_param = await request.body()
    # try:
    #     body_param = json.loads(body_param)
    # except:
    #     body_param = None
    body_param = None

    ip = request.headers["x-forwarded-for"] if "x-forwarded-for" in request.headers.keys() else request.client.host
    request.state.ip = ip.split(",")[0] if "," in ip else ip
    headers = request.headers
    cookies = request.cookies

    url = request.url.path

    # try:
    #     if url not in ["/asset/front/img/img_mainCircle.png", "/register-key/", "/key-status/", "/check/version/", "/asset/front/img/logo_title.png"] and utilClass.configOption == 'enterprise':
    #         key = db_class.getAdminKey()
    #         utilClass.isValidKey(key)
    # except APIException as e:
    #     response = await test_exception_handler(e)
    #     await api_logger(request=request, response=response, body_param=body_param, error=e)
    #     return response
    # except Exception as e:
    #     print(traceback.format_exc(e))

    if await url_pattern_check(url, EXCEPT_PATH_REGEX) or url in EXCEPT_PATH_LIST:
        response = await call_next(request)
        if url != "/":
            await api_logger(request=request, response=response, body_param=body_param)
        return response

    try:

        response = await call_next(request)
        await api_logger(request=request, response=response, body_param=body_param)
    except APIException as e:
        print(traceback.format_exc())
        response = await test_exception_handler(e)
        await api_logger(request=request, response=response, body_param=body_param, error=e)

    except Exception as e:

        print(traceback.format_exc())
        error = await exception_handler(e)
        error.status_code, content = NORMAL_ERROR
        response = JSONResponse(status_code=error.status_code, content=content)
        try:
            request.errorMessage = e.args
        except:
            print(traceback.format_exc())
        await api_logger(request=request, error=error, body_param=body_param)

    if not response:
        _, content = NORMAL_ERROR
        response = JSONResponse(status_code=500, content=content)

    return response

async def token_decode(url, access_token):
    """
    :param access_token:
    :return:
    """
    try:
        token = access_token.replace("Bearer ", "")
        if url == '/quant/main-page/':
            fields = [usersTable.id,
                      usersTable.username,
                      usersTable.email,
                      usersTable.provider,
                      usersTable.role,
                      usersTable.socialID,
                      usersTable.name,
                      usersTable.created_at,
                      usersTable.updated_at,
                      usersTable.isAgreedWithPolicy,
                      usersTable.isFirstplanDone,
                      usersTable.usageplan,
                      usersTable.cumulativeDiskUsage,
                      usersTable.totalDiskUsage,
                      usersTable.count,
                      usersTable.dynos,
                      usersTable.nextPaymentDate,
                      usersTable.cumulativeProjectCount,
                      usersTable.cumulativePredictCount,
                      usersTable.company,
                      usersTable.nextDynos,
                      usersTable.nextPlan,
                      usersTable.promotion,
                      usersTable.appTokenCode,
                      usersTable.isDeleteRequested,
                      usersTable.appTokenCodeUpdatedAt,
                      usersTable.promotionCode,
                      usersTable.remainProjectCount,
                      usersTable.token,
                      usersTable.remainPredictCount,
                      usersTable.gender,
                      usersTable.remainDiskUsage,
                      usersTable.additionalProjectCount,
                      usersTable.additionalPredictCount,
                      usersTable.additionalDiskUsage,
                      usersTable.additionalLabelCount,
                      usersTable.cumulativeLabelCount,
                      usersTable.companyLogoUrl,
                      usersTable.remainLabelCount,
                      usersTable.utmSource,
                      usersTable.utmMedium,
                      usersTable.utmCampaign,
                      usersTable.utmTerm,
                      usersTable.utmContent,
                      usersTable.remainVoucher,
                      usersTable.isAiTrainer,
                      usersTable.isBetaUser,
                      usersTable.isAgreedMarketing,
                      usersTable.lang,
                      usersTable.socialToken,
                      usersTable.deposit,
                      usersTable.usedPrice,
                      usersTable.paymentDay,
                      usersTable.accessToken,
                      usersTable.oauthToken,
                      usersTable.oauthTokenExpiresAt,
                      usersTable.tradier_access_token,
                      usersTable.is_invalid_tradier_token,
                      usersTable.is_admin,
                      usersTable.tradier_name,
                      usersTable.otp_key
                      ]
            user = db_class.getUser(token, fields=fields)
        else:
            user = db_class.getUser(token)

        if user is None:
            raise ex.NotAllowedTokenEx()

    except ExpiredSignatureError:
        raise ex.TokenExpiredEx()
    except DecodeError:
        raise ex.TokenDecodeEx()
    except:
        print(traceback.format_exc())
        raise ex.NotAllowedTokenEx()
    return user

async def url_pattern_check(path, pattern):
    result = re.match(pattern, path)
    if result:
        return True
    return False

async def exception_handler(error: Exception):
    print(error)
    return error

async def test_exception_handler(error: APIException):
    error_dict = dict(status=error.status_code, message_en=error.message_en, message=error.message, detail=error.detail, obj=error.obj, code=error.code, mac=error.mac)
    res = JSONResponse(status_code=error.status_code,content=error_dict)
    return res
