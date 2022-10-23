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

class ManageCommand:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()

    def createCommand(self, token, command_data):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createCommand \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        command_raw = self.dbClass.createCommand({
            "command": command_data.command,
            "url": command_data.url,
            "short_description": command_data.short_description,
            "description": command_data.description,
            "is_private": command_data.is_private,
            "user": user.id,
        })

        return HTTP_200_OK, command_raw.__dict__['__data__']

    def getCommandsById(self, token, sorting, page, count, tab, desc, searching, is_verify=False):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageCommand.py \n함수 : getCommandsById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        shared_commands = []
        for temp in self.dbClass.getSharedCommandIdByUserId(user['id']):
            if temp.commandsid:
                shared_commands = list(set(shared_commands + ast.literal_eval(temp.commandsid)))
        commands, totalLength = self.dbClass.getAllCommandByUserId(user['id'], shared_commands, sorting, tab, desc,
                                                                   searching, page, count, is_verify)

        result_commands = []
        for command in commands:
            command = model_to_dict(command)
            command['role'] = 'member' if command['id'] in shared_commands else 'admin'
            result_commands.append(command)

        result = {'commands': result_commands, 'totalLength': totalLength}

        return HTTP_200_OK, result

    def deleteCommand(self, token, command_id):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteCommand \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        command = self.dbClass.getOneCommandById(command_id, raw=True)

        if command.user != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : deleteCommand \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        command.is_deleted = True
        command.status = 0
        command.save()
        if self.utilClass.configOption == 'enterprise':
            try:
                shutil.rmtree(f"{self.utilClass.save_path}/{command.id}")
            except:
                pass

        self.utilClass.sendSlackMessage(
            f"Command를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {command.name} (ID: {command.id})",
            appLog=True, userInfo=user)

        return HTTP_204_NO_CONTENT, {}

    def deleteCommands(self, token, command_idList):

        failList = []
        successList = []

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteCommand \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        for command_id in command_idList:
            try:
                command = self.dbClass.getOneCommandById(command_id, raw=True)

                if command.user != user['id']:
                    self.utilClass.sendSlackMessage(
                        f"파일 : manageUser\n 함수 : deleteCommand \n허용되지 않은 토큰 값입니다. token = {token})",
                        appError=True, userInfo=user)
                    return NOT_ALLOWED_TOKEN_ERROR

                command.is_deleted = True
                command.status = 0
                command.save()
                if self.utilClass.configOption == 'enterprise':
                    try:
                        shutil.rmtree(f"{self.utilClass.save_path}/{command.id}")
                    except:
                        pass

                self.utilClass.sendSlackMessage(
                    f"Command를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {command.name} (ID: {command.id})",
                    appLog=True, userInfo=user)
                successList.append(command_id)
            except:
                failList.append(command_id)
                self.utilClass.sendSlackMessage(
                    f"Command 삭제 중 실패하였습니다. {user['email']} (ID: {user['id']}) , {command.name} (ID: {command.id})",
                    appLog=True, userInfo=user)

        return HTTP_200_OK, {'successList': successList, 'failList': failList}

    def putCommand(self, token, command_info_raw, command_id):
        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putCommand \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        command_info = {**command_info_raw.__dict__}

        command = self.dbClass.getOneCommandById(command_id)

        if command.get('user', 0) != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : putCommand \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        command_info = {k: v for k, v in command_info.items() if v is not None}

        self.utilClass.sendSlackMessage(
            f"Command 상태가 변경되었습니다. {user['email']} (ID: {user['id']}) , {command['name']} (ID: {command_id})\n" +
            json.dumps(command_info, indent=4, ensure_ascii=False, default=str),
            appLog=True, userInfo=user)

        self.dbClass.updateCommand(command_id, command_info)

        return HTTP_200_OK, command_info

    def get_command_status_by_id(self, token, command_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageCommand.py \n함수 : getCommandById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        command = self.dbClass.getOneCommandById(command_id)

        if command['user'] != user['id']:
            shared_commands = []
            for temp in self.dbClass.getSharedCommandIdByUserId(user['id']):
                if temp.commandsid:
                    shared_commands = list(set(shared_commands + ast.literal_eval(temp.commandsid)))

            if int(command_id) not in shared_commands:
                raise ex.NotAllowedTokenEx(user['email'])

        result = {
            "command_id": command_id,
            "status": command['status'],
        }

        return HTTP_200_OK, result

    def getCommandById(self, token, command_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageCommand.py \n함수 : getCommandById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        command = self.dbClass.getOneCommandById(command_id)

        if command['is_deleted']:
            return ALREADY_DELETED_OBJECT

        if command['user'] != user['id'] and command['is_sample'] in [False, None]:
            shared_commands = []
            for temp in self.dbClass.getSharedCommandIdByUserId(user['id']):
                if temp.commandsid:
                    shared_commands = list(set(shared_commands + ast.literal_eval(temp.commandsid)))

            if int(command_id) not in shared_commands:
                raise ex.NotAllowedTokenEx(user['email'])
            
        command['is_shared'] = False
        if command['sharedgroup']:
            for temp in ast.literal_eval(command['sharedgroup']):
                groupMember = self.dbClass.getMemberByUserIdAndGroupId(user['id'], temp)
                if groupMember:
                    if groupMember.role == 'member' and groupMember.acceptcode == 1:
                        command['is_shared'] = True

        command = self.dbClass.getOneCommandById(command_id)

        if command['is_shared']:
            return HTTP_200_OK, command
        elif command.get('user', 0) == user['id']:
            return HTTP_200_OK, command
        elif command.get('is_sample'):
            return HTTP_200_OK, command
        else:
            return SEARCH_PROJECT_ERROR

    def getCommandAsyncById(self, token, command_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageCommand.py \n함수 : getCommandAsyncById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise NOT_FOUND_USER_ERROR

        command = self.dbClass.getOneCommandAsyncById(command_id).__dict__['__data__']

        if command['user'] != user['id']:
            shared_commands = []
            for temp in self.dbClass.getSharedCommandIdByUserId(user['id']):
                if temp.commandsid:
                    shared_commands = list(set(shared_commands + ast.literal_eval(temp.commandsid)))

            if int(command_id) not in shared_commands:
                raise ex.NotAllowedTokenEx(user['email'])

        return HTTP_200_OK, command

    async def get_command_status(self, token, command_id, request):
        user = self.dbClass.get_user_or_none_object(token)
        command = self.dbClass.getOneCommandById(command_id)
        command_status = command.get('status', 0)

        if user.get('id') is None:
            raise ex.NotFoundUserEx()
        if command.get('id') is None:
            raise ex.NormalEx()
        if command.get('user') != user.get('id'):
            raise ex.NotAllowedTokenEx()

        yield {
            "event": "new_message",
            "id": "message_id",
            "retry": 30000,
            "data": json.dumps({"status": command_status})
        }

        while True:
            if await request.is_disconnected():
                break

            new_command_status = getattr(self.dbClass.get_command_status_by_id(command_id), 'status', 0)

            if command_status != new_command_status:
                command_status = new_command_status

                yield {
                    "event": "new_message",
                    "id": "message_id",
                    "retry": 30000,
                    "data": json.dumps({"status": command_status})
                }

            # if command_status == 100:
            #     break

            await asyncio.sleep(3)

    def get_command_by_token_and_id(self, command_token, command_id):

        command = self.dbClass.getOneCommandById(command_id)

        if command.command_token != command_token:
            return NOT_ALLOWED_TOKEN_ERROR

        if command['is_deleted']:
            return ALREADY_DELETED_OBJECT

        command = self.dbClass.getOneCommandById(command_id)

        if command['is_shared']:
            return HTTP_200_OK, command
        elif command.get('is_sample'):
            return HTTP_200_OK, command
        else:
            return SEARCH_PROJECT_ERROR

    def run_command(self, command_token, command_id):

        command = self.dbClass.getOneCommandById(command_id)

        if command.command_token != command_token:
            return NOT_ALLOWED_TOKEN_ERROR

        if command['is_deleted']:
            return ALREADY_DELETED_OBJECT

        #TODO: Develop when get a sample JSON is ready

        result = None

        return HTTP_200_OK, result

if __name__ == '__main__':
    ManageCommand()
