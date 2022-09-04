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

class ManageFlowNode:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()

    def createFlowNode(self, token, flow_data):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createFlow \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow_node_raw = self.dbClass.createFlowNode({
            "flow_node_name": flow_data.flow_node_name,
            "flow_node_info": flow_data.flow_node_info,
            "flow_id": flow_data.flow_id,
            "user": user.id,
        })

        return HTTP_200_OK, flow_node_raw.__dict__['__data__']

    def getFlowNodesById(self, token, sorting, page, count, tab, desc, searching, is_verify=False):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageFlowNode.py \n함수 : getFlowNodesById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        shared_flow_nodes = []
        for temp in self.dbClass.getSharedFlowNodeIdByUserId(user['id']):
            if temp.flow_nodesid:
                shared_flow_nodes = list(set(shared_flow_nodes + ast.literal_eval(temp.flow_nodesid)))
        flow_nodes, totalLength = self.dbClass.getAllFlowNodeByUserId(user['id'], shared_flow_nodes, sorting, tab, desc,
                                                                   searching, page, count, is_verify)

        result_flow_nodes = []
        for flow_node in flow_nodes:
            flow_node = model_to_dict(flow_node)
            result_flow_nodes.append(flow_node)

        result = {'flow_nodes': result_flow_nodes, 'totalLength': totalLength}

        return HTTP_200_OK, result

    def deleteFlowNode(self, token, flow_node_id):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteFlowNode \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow_node = self.dbClass.getOneFlowNodeById(flow_node_id, raw=True)

        if flow_node.user != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : deleteFlowNode \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        flow_node.is_deleted = True
        flow_node.status = 0
        flow_node.save()
        if self.utilClass.configOption == 'enterprise':
            try:
                shutil.rmtree(f"{self.utilClass.save_path}/{flow_node.id}")
            except:
                pass

        self.utilClass.sendSlackMessage(
            f"FLOW COMPONENT를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {flow_node.flow_node_name} (ID: {flow_node.id})",
            appLog=True, userInfo=user)

        return HTTP_204_NO_CONTENT, {}

    def deleteFlowNodes(self, token, flow_node_idList):

        failList = []
        successList = []

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteFlowNode \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        for flow_node_id in flow_node_idList:
            try:
                flow_node = self.dbClass.getOneFlowNodeById(flow_node_id, raw=True)

                if flow_node.user != user['id']:
                    self.utilClass.sendSlackMessage(
                        f"파일 : manageUser\n 함수 : deleteFlowNode \n허용되지 않은 토큰 값입니다. token = {token})",
                        appError=True, userInfo=user)
                    return NOT_ALLOWED_TOKEN_ERROR

                flow_node.is_deleted = True
                flow_node.status = 0
                flow_node.save()
                if self.utilClass.configOption == 'enterprise':
                    try:
                        shutil.rmtree(f"{self.utilClass.save_path}/{flow_node.id}")
                    except:
                        pass

                self.utilClass.sendSlackMessage(
                    f"FLOW COMPONENT를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {flow_node.flow_node_name} (ID: {flow_node.id})",
                    appLog=True, userInfo=user)
                successList.append(flow_node_id)
            except:
                failList.append(flow_node_id)
                self.utilClass.sendSlackMessage(
                    f"FLOW COMPONENT 삭제 중 실패하였습니다. {user['email']} (ID: {user['id']}) , {flow_node.flow_node_name} (ID: {flow_node.id})",
                    appLog=True, userInfo=user)

        return HTTP_200_OK, {'successList': successList, 'failList': failList}

    def putFlowNode(self, token, flow_node_info_raw, flow_node_id):
        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putFlowNode \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow_node_info = {**flow_node_info_raw.__dict__}

        flow_node = self.dbClass.getOneFlowNodeById(flow_node_id)

        if flow_node.get('user', 0) != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : putFlowNode \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        flow_node_info = {k: v for k, v in flow_node_info.items() if v is not None}

        self.utilClass.sendSlackMessage(
            f"FLOW COMPONENT 상태가 변경되었습니다. {user['email']} (ID: {user['id']}) , {flow_node['flow_node_name']} (ID: {flow_node_id})\n" +
            json.dumps(flow_node_info, indent=4, ensure_ascii=False, default=str),
            appLog=True, userInfo=user)

        self.dbClass.updateFlowNode(flow_node_id, flow_node_info)
        flow_node_info = self.dbClass.getOneFlowNodeById(flow_node_id)

        monitoring_alerts = [x.__dict__['__data__'] for x in self.dbClass.getMonitoringAlertsByFlowId(
            flow_node_id, isSimplified=True)]
        flow_node_info['monitoring_alerts'] = monitoring_alerts

        return HTTP_200_OK, flow_node_info

    def get_flow_node_status_by_id(self, token, flow_node_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFlowNode.py \n함수 : getFlowNodeById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow_node = self.dbClass.getOneFlowNodeById(flow_node_id)

        if flow_node['user'] != user['id']:
            shared_flow_nodes = []
            for temp in self.dbClass.getSharedFlowNodeIdByUserId(user['id']):
                if temp.flow_nodesid:
                    shared_flow_nodes = list(set(shared_flow_nodes + ast.literal_eval(temp.flow_nodesid)))

            if int(flow_node_id) not in shared_flow_nodes:
                raise ex.NotAllowedTokenEx(user['email'])

        result = {
            "flow_node_id": flow_node_id,
            "status": flow_node['status'],
        }

        return HTTP_200_OK, result

    def getFlowNodeById(self, token, flow_node_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageFlowNode.py \n함수 : getFlowNodeById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        flow_node = self.dbClass.getOneFlowNodeById(flow_node_id)

        if flow_node['is_deleted']:
            return ALREADY_DELETED_OBJECT

        if flow_node['user'] != user['id'] and flow_node['is_sample'] in [False, None]:
            shared_flow_nodes = []
            for temp in self.dbClass.getSharedFlowNodeIdByUserId(user['id']):
                if temp.flow_nodesid:
                    shared_flow_nodes = list(set(shared_flow_nodes + ast.literal_eval(temp.flow_nodesid)))

            if int(flow_node_id) not in shared_flow_nodes:
                raise ex.NotAllowedTokenEx(user['email'])

        monitoring_alerts = [x.__dict__['__data__'] for x in self.dbClass.getMonitoringAlertsByFlowId(
            flow_node_id, isSimplified=True)]
        flow_node['monitoring_alerts'] = monitoring_alerts

        if flow_node.get('user', 0) == user['id']:
            return HTTP_200_OK, flow_node
        elif flow_node.get('is_sample'):
            return HTTP_200_OK, flow_node
        else:
            return SEARCH_PROJECT_ERROR

    def getFlowNodeAsyncById(self, token, flow_node_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFlowNode.py \n함수 : getFlowNodeAsyncById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise NOT_FOUND_USER_ERROR

        flow_node = self.dbClass.getOneFlowNodeAsyncById(flow_node_id).__dict__['__data__']

        if flow_node['user'] != user['id']:
            shared_flow_nodes = []
            for temp in self.dbClass.getSharedFlowNodeIdByUserId(user['id']):
                if temp.flow_nodesid:
                    shared_flow_nodes = list(set(shared_flow_nodes + ast.literal_eval(temp.flow_nodesid)))

            if int(flow_node_id) not in shared_flow_nodes:
                raise ex.NotAllowedTokenEx(user['email'])

        return HTTP_200_OK, flow_node

    async def get_flow_node_status(self, token, flow_node_id, request):
        user = self.dbClass.get_user_or_none_object(token)
        flow_node = self.dbClass.getOneFlowNodeById(flow_node_id)
        flow_node_status = flow_node.get('status', 0)

        if user.get('id') is None:
            raise ex.NotFoundUserEx()
        if flow_node.get('id') is None:
            raise ex.NormalEx()
        if flow_node.get('user') != user.get('id'):
            raise ex.NotAllowedTokenEx()

        yield {
            "event": "new_message",
            "id": "message_id",
            "retry": 30000,
            "data": json.dumps({"status": flow_node_status})
        }

        while True:
            if await request.is_disconnected():
                break

            new_flow_node_status = getattr(self.dbClass.get_flow_node_status_by_id(flow_node_id), 'status', 0)

            if flow_node_status != new_flow_node_status:
                flow_node_status = new_flow_node_status

                yield {
                    "event": "new_message",
                    "id": "message_id",
                    "retry": 30000,
                    "data": json.dumps({"status": flow_node_status})
                }

            # if flow_node_status == 100:
            #     break

            await asyncio.sleep(3)

if __name__ == '__main__':
    ManageFlowNode()
