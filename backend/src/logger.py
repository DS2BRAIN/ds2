import json
import logging
from time import time
from src.util import Util
from models import *
from models.helper import Helper
from starlette.requests import Request

# logger.setLevel(logging.INFO)
utilClass = Util()
dbClass = Helper()
mongodbClass = MongoDb()

from datetime import timedelta, datetime

async def api_logger(request: Request, response=None, error=None, body_param=None):
    time_format = "%Y/%m/%d %H:%M:%S"
    t = time() - request.state.start
    status_code = error.status_code if error else response.status_code
    error_log = None
    token = None
    apptoken = None
    userId = None
    query_param = str(request.query_params) if request.query_params else None
    path_param = str(request.path_params) if request.path_params else None

    if request.query_params._dict.get('token'):
        token = request.query_params._dict.get('token')
    elif request.query_params._dict.get('apptoken'):
        apptoken = request.query_params._dict.get('apptoken')
    elif request.query_params._dict.get('apptokenCode'):
        apptoken = request.query_params._dict.get('apptokenCode')
    elif request.query_params._dict.get('appTokenCode'):
        apptoken = request.query_params._dict.get('apptokenCode')
    elif request.path_params.get('userId'):
        userId = request.path_params['userId']

    if token:
        user = dbClass.getUser(token, raw=True)
    elif apptoken:
        user = dbClass.getUserByAppToken(apptoken)
    elif userId:
        user = dbClass.getOneUserById(userId, raw=True)
    else:
        user = request.state.user
    if error:
        if request.state.inspect:
            frame = request.state.inspect
            error_file = frame.f_code.co_filename
            error_func = frame.f_code.co_name
            error_line = frame.f_lineno
        elif hasattr(request, 'errorMessage') and request.errorMessage:
            error.ex = request.errorMessage
            error_line = error_func = error_file = "UNKNOWN"
        elif hasattr(error, 'message') and error.message:
            error.ex = error.message
            error_line = error_func = error_file = "UNKNOWN"
        else:
            error_func = error_file = error_line = "UNKNOWN"

        error_log = dict(
            errorFunc=error_func,
            location="{} line in {}".format(str(error_line), error_file),
            raised=str(error.__class__.__name__),
            msg=str(error.ex),
        )


    if user is not None and type(user) != dict:
        user = user.__dict__['__data__']

    email = user['email'].split("@") if user and user['email'] else None
    user_log = dict(
        client=request.state.ip,
        user=user['id'] if user and user['id'] else None,
        email= email[0][:4] + "*" * len(email[0][4:]) + "@" + email[1] if user and user['email'] else None,
    )

    log_dict = dict(
        url=request.url.hostname + request.url.path,
        method=str(request.method),
        statusCode=status_code,
        errorDetail=error_log,
        client=user_log,
        processedTime=str(round(t * 1000, 5)) + "ms",
        datetimeUTC=datetime.utcnow().strftime(time_format),
        datetimeKST=(datetime.utcnow() + timedelta(hours=9)).strftime(time_format),
        query_param=query_param,
        path_param=path_param,
        body_data=str(body_param)
    )
    code = log_dict['statusCode']
    mongodbClass.create_document(mongodbClass.SERVER_LOG_COLLECTION_NAME, log_dict)
    if error and error.status_code >= 400 or code >= 400:
        if log_dict["errorDetail"] and log_dict["errorDetail"].get("raised"):
            data = f'| EndPoint : {log_dict["url"]} ({log_dict["method"]}) - Result : {log_dict["statusCode"]}, {log_dict["errorDetail"]["raised"]} |\n | errorFunc : {log_dict["errorDetail"]["errorFunc"]}, location : {log_dict["errorDetail"]["location"]} |\n| client : {log_dict["client"]}, ProcessedTime : {log_dict["processedTime"]}, DateTime : {log_dict["datetimeKST"]} |'
        else:
            data = f'| EndPoint : {log_dict["url"]} ({log_dict["method"]}) - Result : {log_dict["statusCode"]} |\n| client : {log_dict["client"]}, ProcessedTime : {log_dict["processedTime"]}, DateTime : {log_dict["datetimeKST"]} |'
        utilClass.sendSlackMessage(data, autoAppLog=True)
    else:
        data = f'| EndPoint : {log_dict["url"]} ({log_dict["method"]}) - Result : {log_dict["statusCode"]}, {log_dict["errorDetail"]} |\n| client : {log_dict["client"]}, ProcessedTime : {log_dict["processedTime"]}, DateTime : {log_dict["datetimeKST"]} |'
    log_dict = json.dumps(log_dict)
    logging.info(log_dict)