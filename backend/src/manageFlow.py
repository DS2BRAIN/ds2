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

class ManageFlow:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()

    def createFlow(self, token, flow_data):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createFlow \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow_raw = self.dbClass.createFlow({
            "flow_name": flow_data.flow_name,
            "flow_node_info": flow_data.flow_node_info,
            "flow_token": uuid4(),
            "user": user.id,
        })

        return HTTP_200_OK, flow_raw.__dict__['__data__']

    def getFlowsById(self, token, sorting, page, count, tab, desc, searching, is_verify=False):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageFlow.py \n함수 : getFlowsById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        shared_flows = []
        for temp in self.dbClass.getSharedFlowIdByUserId(user['id']):
            if temp.flowsid:
                shared_flows = list(set(shared_flows + ast.literal_eval(temp.flowsid)))
        flows, totalLength = self.dbClass.getAllFlowByUserId(user['id'], shared_flows, sorting, tab, desc,
                                                                   searching, page, count, is_verify)

        result_flows = []
        for flow in flows:
            flow = model_to_dict(flow)
            flow['role'] = 'member' if flow['id'] in shared_flows else 'admin'
            result_flows.append(flow)

        result = {'flows': result_flows, 'totalLength': totalLength}

        return HTTP_200_OK, result

    def deleteFlow(self, token, flow_id):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteFlow \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow = self.dbClass.getOneFlowById(flow_id, raw=True)

        if flow.user != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : deleteFlow \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        flow.is_deleted = True
        flow.status = 0
        flow.save()
        if self.utilClass.configOption == 'enterprise':
            try:
                shutil.rmtree(f"{self.utilClass.save_path}/{flow.id}")
            except:
                pass

        self.utilClass.sendSlackMessage(
            f"FLOW를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {flow.flow_name} (ID: {flow.id})",
            appLog=True, userInfo=user)

        return HTTP_204_NO_CONTENT, {}

    def deleteFlows(self, token, flow_idList):

        failList = []
        successList = []

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteFlow \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        for flow_id in flow_idList:
            try:
                flow = self.dbClass.getOneFlowById(flow_id, raw=True)

                if flow.user != user['id']:
                    self.utilClass.sendSlackMessage(
                        f"파일 : manageUser\n 함수 : deleteFlow \n허용되지 않은 토큰 값입니다. token = {token})",
                        appError=True, userInfo=user)
                    return NOT_ALLOWED_TOKEN_ERROR

                flow.is_deleted = True
                flow.status = 0
                flow.save()
                if self.utilClass.configOption == 'enterprise':
                    try:
                        shutil.rmtree(f"{self.utilClass.save_path}/{flow.id}")
                    except:
                        pass

                self.utilClass.sendSlackMessage(
                    f"FLOW를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {flow.flow_name} (ID: {flow.id})",
                    appLog=True, userInfo=user)
                successList.append(flow_id)
            except:
                failList.append(flow_id)
                self.utilClass.sendSlackMessage(
                    f"FLOW 삭제 중 실패하였습니다. {user['email']} (ID: {user['id']}) , {flow.flow_name} (ID: {flow.id})",
                    appLog=True, userInfo=user)

        return HTTP_200_OK, {'successList': successList, 'failList': failList}

    def putFlow(self, token, flow_info_raw, flow_id):
        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putFlow \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow_info = {**flow_info_raw.__dict__}

        flow = self.dbClass.getOneFlowById(flow_id)

        if flow.get('user', 0) != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : putFlow \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        flow_info = {k: v for k, v in flow_info.items() if v is not None}

        self.utilClass.sendSlackMessage(
            f"FLOW 상태가 변경되었습니다. {user['email']} (ID: {user['id']}) , {flow['flow_name']} (ID: {flow_id})\n" +
            json.dumps(flow_info, indent=4, ensure_ascii=False, default=str),
            appLog=True, userInfo=user)

        self.dbClass.updateFlow(flow_id, flow_info)

        flow_nodes = [x.__dict__['__data__'] for x in self.dbClass.getFlowNodesByFlowId(flow_id, isSimplified=True)]
        flow_info['flow_nodes'] = flow_nodes
        monitoring_alerts = [x.__dict__['__data__'] for x in self.dbClass.getMonitoringAlertsByFlowNodeId(flow_id, isSimplified=True)]
        flow_info['monitoring_alerts'] = monitoring_alerts
        
        return HTTP_200_OK, flow_info

    def get_flow_status_by_id(self, token, flow_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFlow.py \n함수 : getFlowById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow = self.dbClass.getOneFlowById(flow_id)

        if flow['user'] != user['id']:
            shared_flows = []
            for temp in self.dbClass.getSharedFlowIdByUserId(user['id']):
                if temp.flowsid:
                    shared_flows = list(set(shared_flows + ast.literal_eval(temp.flowsid)))

            if int(flow_id) not in shared_flows:
                raise ex.NotAllowedTokenEx(user['email'])

        result = {
            "flow_id": flow_id,
            "status": flow['status'],
        }

        return HTTP_200_OK, result

    def getFlowById(self, token, flow_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageFlow.py \n함수 : getFlowById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow = self.dbClass.getOneFlowById(flow_id)

        if flow['is_deleted']:
            return ALREADY_DELETED_OBJECT

        if flow['user'] != user['id'] and flow['is_sample'] in [False, None]:
            shared_flows = []
            for temp in self.dbClass.getSharedFlowIdByUserId(user['id']):
                if temp.flowsid:
                    shared_flows = list(set(shared_flows + ast.literal_eval(temp.flowsid)))

            if int(flow_id) not in shared_flows:
                raise ex.NotAllowedTokenEx(user['email'])
            
        flow['is_shared'] = False
        if flow['sharedgroup']:
            for temp in ast.literal_eval(flow['sharedgroup']):
                groupMember = self.dbClass.getMemberByUserIdAndGroupId(user['id'], temp)
                if groupMember:
                    if groupMember.role == 'member' and groupMember.acceptcode == 1:
                        flow['is_shared'] = True

        flow = self.dbClass.getOneFlowById(flow_id)
        flow_nodes = [x.__dict__['__data__'] for x in self.dbClass.getFlowNodesByFlowId(flow_id, isSimplified=True)]
        flow['flow_nodes'] = flow_nodes
        monitoring_alerts = [x.__dict__['__data__'] for x in self.dbClass.getMonitoringAlertsByFlowNodeId(flow_id, isSimplified=True)]
        flow['monitoring_alerts'] = monitoring_alerts

        if flow['is_shared']:
            return HTTP_200_OK, flow
        elif flow.get('user', 0) == user['id']:
            return HTTP_200_OK, flow
        elif flow.get('is_sample'):
            return HTTP_200_OK, flow
        else:
            return SEARCH_PROJECT_ERROR

    def getFlowAsyncById(self, token, flow_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFlow.py \n함수 : getFlowAsyncById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise NOT_FOUND_USER_ERROR

        flow = self.dbClass.getOneFlowAsyncById(flow_id).__dict__['__data__']

        if flow['user'] != user['id']:
            shared_flows = []
            for temp in self.dbClass.getSharedFlowIdByUserId(user['id']):
                if temp.flowsid:
                    shared_flows = list(set(shared_flows + ast.literal_eval(temp.flowsid)))

            if int(flow_id) not in shared_flows:
                raise ex.NotAllowedTokenEx(user['email'])

        return HTTP_200_OK, flow

    async def get_flow_status(self, token, flow_id, request):
        user = self.dbClass.get_user_or_none_object(token)
        flow = self.dbClass.getOneFlowById(flow_id)
        flow_status = flow.get('status', 0)

        if user.get('id') is None:
            raise ex.NotFoundUserEx()
        if flow.get('id') is None:
            raise ex.NormalEx()
        if flow.get('user') != user.get('id'):
            raise ex.NotAllowedTokenEx()

        yield {
            "event": "new_message",
            "id": "message_id",
            "retry": 30000,
            "data": json.dumps({"status": flow_status})
        }

        while True:
            if await request.is_disconnected():
                break

            new_flow_status = getattr(self.dbClass.get_flow_status_by_id(flow_id), 'status', 0)

            if flow_status != new_flow_status:
                flow_status = new_flow_status

                yield {
                    "event": "new_message",
                    "id": "message_id",
                    "retry": 30000,
                    "data": json.dumps({"status": flow_status})
                }

            # if flow_status == 100:
            #     break

            await asyncio.sleep(3)

    def get_flow_by_token_and_id(self, flow_token, flow_id):

        flow = self.dbClass.getOneFlowById(flow_id)

        if flow.flow_token != flow_token:
            return NOT_ALLOWED_TOKEN_ERROR

        if flow['is_deleted']:
            return ALREADY_DELETED_OBJECT

        flow = self.dbClass.getOneFlowById(flow_id)
        flow_nodes = [x.__dict__['__data__'] for x in self.dbClass.getFlowNodesByFlowId(flow_id, isSimplified=True)]
        flow['flow_nodes'] = flow_nodes
        monitoring_alerts = [x.__dict__['__data__'] for x in self.dbClass.getMonitoringAlertsByFlowNodeId(flow_id, isSimplified=True)]
        flow['monitoring_alerts'] = monitoring_alerts

        if flow['is_shared']:
            return HTTP_200_OK, flow
        elif flow.get('is_sample'):
            return HTTP_200_OK, flow
        else:
            return SEARCH_PROJECT_ERROR



if __name__ == '__main__':
    ManageFlow()
