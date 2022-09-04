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

class ManageFlowComponent:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()

    def createFlowComponent(self, token, flow_data):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createFlow \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow_component_raw = self.dbClass.createFlowComponent({
            "flow_component_name": flow_data.flow_component_name,
            "flow_component_info": flow_data.flow_component_info,
            "flow_id": flow_data.flow_id,
            "user": user.id,
        })

        return HTTP_200_OK, flow_component_raw.__dict__['__data__']

    def getFlowComponentsById(self, token, sorting, page, count, tab, desc, searching, is_verify=False):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageFlowComponent.py \n함수 : getFlowComponentsById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        shared_flow_components = []
        for temp in self.dbClass.getSharedFlowComponentIdByUserId(user['id']):
            if temp.flow_componentsid:
                shared_flow_components = list(set(shared_flow_components + ast.literal_eval(temp.flow_componentsid)))
        flow_components, totalLength = self.dbClass.getAllFlowComponentByUserId(user['id'], shared_flow_components, sorting, tab, desc,
                                                                   searching, page, count, is_verify)

        result_flow_components = []
        for flow_component in flow_components:
            flow_component = model_to_dict(flow_component)
            result_flow_components.append(flow_component)

        result = {'flow_components': result_flow_components, 'totalLength': totalLength}

        return HTTP_200_OK, result

    def deleteFlowComponent(self, token, flow_component_id):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteFlowComponent \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow_component = self.dbClass.getOneFlowComponentById(flow_component_id, raw=True)

        if flow_component.user != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : deleteFlowComponent \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        flow_component.is_deleted = True
        flow_component.status = 0
        flow_component.save()
        if self.utilClass.configOption == 'enterprise':
            try:
                shutil.rmtree(f"{self.utilClass.save_path}/{flow_component.id}")
            except:
                pass

        self.utilClass.sendSlackMessage(
            f"FLOW COMPONENT를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {flow_component.flow_component_name} (ID: {flow_component.id})",
            appLog=True, userInfo=user)

        return HTTP_204_NO_CONTENT, {}

    def deleteFlowComponents(self, token, flow_component_idList):

        failList = []
        successList = []

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteFlowComponent \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        for flow_component_id in flow_component_idList:
            try:
                flow_component = self.dbClass.getOneFlowComponentById(flow_component_id, raw=True)

                if flow_component.user != user['id']:
                    self.utilClass.sendSlackMessage(
                        f"파일 : manageUser\n 함수 : deleteFlowComponent \n허용되지 않은 토큰 값입니다. token = {token})",
                        appError=True, userInfo=user)
                    return NOT_ALLOWED_TOKEN_ERROR

                flow_component.is_deleted = True
                flow_component.status = 0
                flow_component.save()
                if self.utilClass.configOption == 'enterprise':
                    try:
                        shutil.rmtree(f"{self.utilClass.save_path}/{flow_component.id}")
                    except:
                        pass

                self.utilClass.sendSlackMessage(
                    f"FLOW COMPONENT를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {flow_component.flow_component_name} (ID: {flow_component.id})",
                    appLog=True, userInfo=user)
                successList.append(flow_component_id)
            except:
                failList.append(flow_component_id)
                self.utilClass.sendSlackMessage(
                    f"FLOW COMPONENT 삭제 중 실패하였습니다. {user['email']} (ID: {user['id']}) , {flow_component.flow_component_name} (ID: {flow_component.id})",
                    appLog=True, userInfo=user)

        return HTTP_200_OK, {'successList': successList, 'failList': failList}

    def putFlowComponent(self, token, flow_component_info_raw, flow_component_id):
        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putFlowComponent \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow_component_info = {**flow_component_info_raw.__dict__}

        flow_component = self.dbClass.getOneFlowComponentById(flow_component_id)

        if flow_component.get('user', 0) != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : putFlowComponent \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        flow_component_info = {k: v for k, v in flow_component_info.items() if v is not None}

        self.utilClass.sendSlackMessage(
            f"FLOW COMPONENT 상태가 변경되었습니다. {user['email']} (ID: {user['id']}) , {flow_component['flow_component_name']} (ID: {flow_component_id})\n" +
            json.dumps(flow_component_info, indent=4, ensure_ascii=False, default=str),
            appLog=True, userInfo=user)

        self.dbClass.updateFlowComponent(flow_component_id, flow_component_info)
        flow_component_info = self.dbClass.getOneFlowComponentById(flow_component_id)

        monitoring_alerts = [x.__dict__['__data__'] for x in self.dbClass.getMonitoringAlertsByFlowId(
            flow_component_id, isSimplified=True)]
        flow_component_info['monitoring_alerts'] = monitoring_alerts

        return HTTP_200_OK, flow_component_info

    def get_flow_component_status_by_id(self, token, flow_component_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFlowComponent.py \n함수 : getFlowComponentById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow_component = self.dbClass.getOneFlowComponentById(flow_component_id)

        if flow_component['user'] != user['id']:
            shared_flow_components = []
            for temp in self.dbClass.getSharedFlowComponentIdByUserId(user['id']):
                if temp.flow_componentsid:
                    shared_flow_components = list(set(shared_flow_components + ast.literal_eval(temp.flow_componentsid)))

            if int(flow_component_id) not in shared_flow_components:
                raise ex.NotAllowedTokenEx(user['email'])

        result = {
            "flow_component_id": flow_component_id,
            "status": flow_component['status'],
        }

        return HTTP_200_OK, result

    def getFlowComponentById(self, token, flow_component_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageFlowComponent.py \n함수 : getFlowComponentById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow_component = self.dbClass.getOneFlowComponentById(flow_component_id)

        if flow_component['is_deleted']:
            return ALREADY_DELETED_OBJECT

        if flow_component['user'] != user['id'] and flow_component['is_sample'] in [False, None]:
            shared_flow_components = []
            for temp in self.dbClass.getSharedFlowComponentIdByUserId(user['id']):
                if temp.flow_componentsid:
                    shared_flow_components = list(set(shared_flow_components + ast.literal_eval(temp.flow_componentsid)))

            if int(flow_component_id) not in shared_flow_components:
                raise ex.NotAllowedTokenEx(user['email'])

        monitoring_alerts = [x.__dict__['__data__'] for x in self.dbClass.getMonitoringAlertsByFlowId(
            flow_component_id, isSimplified=True)]
        flow_component['monitoring_alerts'] = monitoring_alerts

        if flow_component.get('user', 0) == user['id']:
            return HTTP_200_OK, flow_component
        elif flow_component.get('is_sample'):
            return HTTP_200_OK, flow_component
        else:
            return SEARCH_PROJECT_ERROR

    def getFlowComponentAsyncById(self, token, flow_component_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFlowComponent.py \n함수 : getFlowComponentAsyncById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise NOT_FOUND_USER_ERROR

        flow_component = self.dbClass.getOneFlowComponentAsyncById(flow_component_id).__dict__['__data__']

        if flow_component['user'] != user['id']:
            shared_flow_components = []
            for temp in self.dbClass.getSharedFlowComponentIdByUserId(user['id']):
                if temp.flow_componentsid:
                    shared_flow_components = list(set(shared_flow_components + ast.literal_eval(temp.flow_componentsid)))

            if int(flow_component_id) not in shared_flow_components:
                raise ex.NotAllowedTokenEx(user['email'])

        return HTTP_200_OK, flow_component

    async def get_flow_component_status(self, token, flow_component_id, request):
        user = self.dbClass.get_user_or_none_object(token)
        flow_component = self.dbClass.getOneFlowComponentById(flow_component_id)
        flow_component_status = flow_component.get('status', 0)

        if user.get('id') is None:
            raise ex.NotFoundUserEx()
        if flow_component.get('id') is None:
            raise ex.NormalEx()
        if flow_component.get('user') != user.get('id'):
            raise ex.NotAllowedTokenEx()

        yield {
            "event": "new_message",
            "id": "message_id",
            "retry": 30000,
            "data": json.dumps({"status": flow_component_status})
        }

        while True:
            if await request.is_disconnected():
                break

            new_flow_component_status = getattr(self.dbClass.get_flow_component_status_by_id(flow_component_id), 'status', 0)

            if flow_component_status != new_flow_component_status:
                flow_component_status = new_flow_component_status

                yield {
                    "event": "new_message",
                    "id": "message_id",
                    "retry": 30000,
                    "data": json.dumps({"status": flow_component_status})
                }

            # if flow_component_status == 100:
            #     break

            await asyncio.sleep(3)

if __name__ == '__main__':
    ManageFlowComponent()
