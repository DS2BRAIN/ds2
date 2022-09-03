import ast
import asyncio
import json
import os
import shutil
import subprocess
import time
import datetime
import traceback
import numpy as np
from uuid import uuid4

import pandas as pd
from bson import json_util
from pydantic import BaseModel

from random import *

from playhouse.shortcuts import model_to_dict
from src.collecting.connectorHandler import ConnectorHandler
from src.util import Util
from src.checkDataset import CheckDataset
from src.managePayment import ManagePayment
from models.helper import Helper
from src.errors import exceptions as ex
from starlette.status import HTTP_200_OK, HTTP_204_NO_CONTENT
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from src.errorResponseList import ErrorResponseList, NOT_FOUND_USER_ERROR, GET_MODEL_ERROR, SEARCH_PROJECT_ERROR, \
    WRONG_ACCESS_ERROR, NOT_ALLOWED_TOKEN_ERROR, TOO_MANY_ERROR_PROJECT, \
    EXCEED_PROJECT_ERROR, ALREADY_DELETED_OBJECT
import urllib
from models import rd

errorResponseList = ErrorResponseList()

#TODO: 숫자 헤더면 바꿔줘야됨

class ManageMonitoringAlert:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()

    def getMonitoringAlertsById(self, token, sorting, page, count, tab, desc, searching, is_verify=False):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageMonitoringAlert.py \n함수 : getMonitoringAlertsById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        shared_monitoring_alerts = []
        for temp in self.dbClass.getSharedMonitoringAlertIdByUserId(user['id']):
            if temp.monitoring_alertsid:
                shared_monitoring_alerts = list(set(shared_monitoring_alerts + ast.literal_eval(temp.monitoring_alertsid)))
        monitoring_alerts, totalLength = self.dbClass.getAllMonitoringAlertByUserId(user['id'], shared_monitoring_alerts, sorting, tab, desc,
                                                                   searching, page, count, is_verify)

        result_monitoring_alerts = []
        for monitoring_alert in monitoring_alerts:
            monitoring_alert = model_to_dict(monitoring_alert)
            result_monitoring_alerts.append(monitoring_alert)

        result = {'monitoring_alerts': result_monitoring_alerts, 'totalLength': totalLength}

        return HTTP_200_OK, result

    def deleteMonitoringAlert(self, token, monitoring_alert_id):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteMonitoringAlert \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        monitoring_alert = self.dbClass.getOneMonitoringAlertById(monitoring_alert_id, raw=True)

        if monitoring_alert.user != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : deleteMonitoringAlert \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        monitoring_alert.is_deleted = True
        monitoring_alert.status = 0
        monitoring_alert.save()
        if self.utilClass.configOption == 'enterprise':
            try:
                shutil.rmtree(f"{self.utilClass.save_path}/{monitoring_alert.id}")
            except:
                pass

        self.utilClass.sendSlackMessage(
            f"FLOW COMPONENT를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {monitoring_alert.monitoring_alert_name} (ID: {monitoring_alert.id})",
            appLog=True, userInfo=user)

        return HTTP_204_NO_CONTENT, {}

    def deleteMonitoringAlerts(self, token, monitoring_alert_idList):

        failList = []
        successList = []

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteMonitoringAlert \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        for monitoring_alert_id in monitoring_alert_idList:
            try:
                monitoring_alert = self.dbClass.getOneMonitoringAlertById(monitoring_alert_id, raw=True)

                if monitoring_alert.user != user['id']:
                    self.utilClass.sendSlackMessage(
                        f"파일 : manageUser\n 함수 : deleteMonitoringAlert \n허용되지 않은 토큰 값입니다. token = {token})",
                        appError=True, userInfo=user)
                    return NOT_ALLOWED_TOKEN_ERROR

                monitoring_alert.is_deleted = True
                monitoring_alert.status = 0
                monitoring_alert.save()
                if self.utilClass.configOption == 'enterprise':
                    try:
                        shutil.rmtree(f"{self.utilClass.save_path}/{monitoring_alert.id}")
                    except:
                        pass

                self.utilClass.sendSlackMessage(
                    f"FLOW COMPONENT를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {monitoring_alert.monitoring_alert_name} (ID: {monitoring_alert.id})",
                    appLog=True, userInfo=user)
                successList.append(monitoring_alert_id)
            except:
                failList.append(monitoring_alert_id)
                self.utilClass.sendSlackMessage(
                    f"FLOW COMPONENT 삭제 중 실패하였습니다. {user['email']} (ID: {user['id']}) , {monitoring_alert.monitoring_alert_name} (ID: {monitoring_alert.id})",
                    appLog=True, userInfo=user)

        return HTTP_200_OK, {'successList': successList, 'failList': failList}

    def putMonitoringAlert(self, token, monitoring_alert_info_raw, monitoring_alert_id):
        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putMonitoringAlert \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        monitoring_alert_info = {**monitoring_alert_info_raw.__dict__}

        monitoring_alert = self.dbClass.getOneMonitoringAlertById(monitoring_alert_id)

        if monitoring_alert.get('user', 0) != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : putMonitoringAlert \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        monitoring_alert_info = {k: v for k, v in monitoring_alert_info.items() if v is not None}

        self.utilClass.sendSlackMessage(
            f"FLOW COMPONENT 상태가 변경되었습니다. {user['email']} (ID: {user['id']}) , {monitoring_alert['monitoring_alert_name']} (ID: {monitoring_alert_id})\n" +
            json.dumps(monitoring_alert_info, indent=4, ensure_ascii=False, default=str),
            appLog=True, userInfo=user)

        self.dbClass.updateMonitoringAlert(monitoring_alert_id, monitoring_alert_info)
        monitoring_alert_info = self.dbClass.getOneMonitoringAlertById(monitoring_alert_id)

        return HTTP_200_OK, monitoring_alert_info

    def get_monitoring_alert_status_by_id(self, token, monitoring_alert_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageMonitoringAlert.py \n함수 : getMonitoringAlertById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        monitoring_alert = self.dbClass.getOneMonitoringAlertById(monitoring_alert_id)

        if monitoring_alert['user'] != user['id']:
            shared_monitoring_alerts = []
            for temp in self.dbClass.getSharedMonitoringAlertIdByUserId(user['id']):
                if temp.monitoring_alertsid:
                    shared_monitoring_alerts = list(set(shared_monitoring_alerts + ast.literal_eval(temp.monitoring_alertsid)))

            if int(monitoring_alert_id) not in shared_monitoring_alerts:
                raise ex.NotAllowedTokenEx(user['email'])

        result = {
            "monitoring_alert_id": monitoring_alert_id,
            "status": monitoring_alert['status'],
        }

        return HTTP_200_OK, result

    def getMonitoringAlertById(self, token, monitoring_alert_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageMonitoringAlert.py \n함수 : getMonitoringAlertById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        monitoring_alert = self.dbClass.getOneMonitoringAlertById(monitoring_alert_id)

        if monitoring_alert['is_deleted']:
            return ALREADY_DELETED_OBJECT

        if monitoring_alert['user'] != user['id'] and monitoring_alert['is_sample'] in [False, None]:
            shared_monitoring_alerts = []
            for temp in self.dbClass.getSharedMonitoringAlertIdByUserId(user['id']):
                if temp.monitoring_alertsid:
                    shared_monitoring_alerts = list(set(shared_monitoring_alerts + ast.literal_eval(temp.monitoring_alertsid)))

            if int(monitoring_alert_id) not in shared_monitoring_alerts:
                raise ex.NotAllowedTokenEx(user['email'])


        if monitoring_alert.get('user', 0) == user['id']:
            return HTTP_200_OK, monitoring_alert
        elif monitoring_alert.get('is_sample'):
            return HTTP_200_OK, monitoring_alert
        else:
            return SEARCH_PROJECT_ERROR

    def getMonitoringAlertAsyncById(self, token, monitoring_alert_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageMonitoringAlert.py \n함수 : getMonitoringAlertAsyncById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise NOT_FOUND_USER_ERROR

        monitoring_alert = self.dbClass.getOneMonitoringAlertAsyncById(monitoring_alert_id).__dict__['__data__']

        if monitoring_alert['user'] != user['id']:
            shared_monitoring_alerts = []
            for temp in self.dbClass.getSharedMonitoringAlertIdByUserId(user['id']):
                if temp.monitoring_alertsid:
                    shared_monitoring_alerts = list(set(shared_monitoring_alerts + ast.literal_eval(temp.monitoring_alertsid)))

            if int(monitoring_alert_id) not in shared_monitoring_alerts:
                raise ex.NotAllowedTokenEx(user['email'])

        return HTTP_200_OK, monitoring_alert

    async def get_monitoring_alert_status(self, token, monitoring_alert_id, request):
        user = self.dbClass.get_user_or_none_object(token)
        monitoring_alert = self.dbClass.getOneMonitoringAlertById(monitoring_alert_id)
        monitoring_alert_status = monitoring_alert.get('status', 0)

        if user.get('id') is None:
            raise ex.NotFoundUserEx()
        if monitoring_alert.get('id') is None:
            raise ex.NormalEx()
        if monitoring_alert.get('user') != user.get('id'):
            raise ex.NotAllowedTokenEx()

        yield {
            "event": "new_message",
            "id": "message_id",
            "retry": 30000,
            "data": json.dumps({"status": monitoring_alert_status})
        }

        while True:
            if await request.is_disconnected():
                break

            new_monitoring_alert_status = getattr(self.dbClass.get_monitoring_alert_status_by_id(monitoring_alert_id), 'status', 0)

            if monitoring_alert_status != new_monitoring_alert_status:
                monitoring_alert_status = new_monitoring_alert_status

                yield {
                    "event": "new_message",
                    "id": "message_id",
                    "retry": 30000,
                    "data": json.dumps({"status": monitoring_alert_status})
                }

            # if monitoring_alert_status == 100:
            #     break

            await asyncio.sleep(3)

if __name__ == '__main__':
    ManageMonitoringAlert()
