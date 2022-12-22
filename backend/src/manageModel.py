import ast
import asyncio
import json
import time
from fastapi import status
import pandas as pd
from fastapi.encoders import jsonable_encoder

from api_wrapper.metabase_wrapper import MetabaseAPI
from src.util import Util
from src.managePayment import ManagePayment
from src.errors import exceptions as ex
from models.helper import Helper
from starlette.status import HTTP_200_OK
from src.errorResponseList import ErrorResponseList, NOT_FOUND_USER_ERROR, NOT_ALLOWED_TOKEN_ERROR

errorResponseList = ErrorResponseList()

#TODO: 숫자 헤더면 바꿔줘야됨
class ManageModel:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.paymentClass = ManagePayment()
        self.s3 = self.utilClass.getBotoClient('s3')

    def updateFavoriteModel(self, token, modelId, isFavorite):
        user = self.dbClass.getUser(token, raw=True)
        model = self.dbClass.getOneModelById(modelId, raw=True)

        isShared = False

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : updateFavoriteModel \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        for x in self.dbClass.getGroupsByUserIdAndRoles(user.id, 'member'):
            x.projectsid = x.projectsid if x.projectsid else "[]"
            if model.project in ast.literal_eval(x.projectsid):
                isShared = True
                break

        if self.dbClass.getUserByModelId(modelId).id != user.id and not isShared:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : getUserCountInfo \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        favoriteInfo = self.dbClass.getOneFavortieModelsByUserIdAndModelId(user.id, modelId)

        if isFavorite and not favoriteInfo:
            data = {'user_id': user.id, 'model_id': modelId}
            self.dbClass.createFavoriteModelsByUserIdAndModelId(data)
        elif not isFavorite and favoriteInfo:
            favoriteInfo.delete_instance()
            favoriteInfo.save()
        result = {'modelId': modelId, 'isFavorite': isFavorite}

        return HTTP_200_OK, result

    async def get_model_info(self, project_id, request, token=None):
        user = request.state.user if token is None else self.dbClass.getUser(token)
        project = self.dbClass.getOneProjectById(project_id)
        model_status_info = {}

        if user.get('id') is None:
            raise ex.NotFoundUserEx()
        if project.get('id') is None:
            raise ex.NormalEx()
        if project.get('user') != user.get('id'):
            raise ex.NotAllowedTokenEx()

        # mb = None
        # try:
        #     import asyncio
        #     mb = self.utilClass.get_metabase_client()
        #     if mb is None:
        #         asyncio.sleep(120)
        #         mb = self.utilClass.get_metabase_client()
        # except Exception as e:
        #     print(e.args[0].text)
        while True:
            if await request.is_disconnected():
                break

            change_model_info = {}
            for idx, model in enumerate(self.dbClass.getModelsByProjectId(project_id)):
                model = model.__dict__['__data__']
                url = None
                # session_id = None
                table_status = 0
                # if mb:
                try:
                    # session_id = mb.session_id
                    model_task = self.dbClass.get_metabase_async_task(user.get('id'), 'model', model.get('id'))
                    if model_task:
                        view_name = f"model_{model['id']}_table"
                        # table_id = mb.get_item_id('table', view_name)
                        # url = f":{self.utilClass.metabase_port}/auto/dashboard/table/{table_id}"
                        # table_status = model_task.status
                        # if table_status == 1:
                            # if mb.get_item_info('table', table_id).get('initial_sync_status') == 'complete':
                            #     self.dbClass.update_async_task_complete_by_id(model_task.id)
                            #     table_status = 100
                except:
                    table_status = 1
                # elif mb is None:
                #     table_status = 99
                model['metabase'] = {
                    'status': table_status,
                    'url': url,
                    # 'X-Metabase-Session': session_id
                }
                if model.get('cm_statistics') is None:
                    model['cm_statistics'] = model.pop('cmStatistics', None)
                else:
                    model.pop('cmStatistics', None)

                if model_status_info.get(model['id']) is None:
                    model_status_info[model['id']] = model
                    change_model_info[model['id']] = model
                elif model_status_info.get(model['id']) != model:
                    model_status_info[model['id']] = model
                    change_model_info[model['id']] = model

            if change_model_info:
                yield {
                    "event": "new_message",
                    "id": "message_id",
                    "retry": 30000,
                    "data": json.dumps(jsonable_encoder(change_model_info))
                }

            # if len(model_status_info.keys()) == 0:
            #     break

            await asyncio.sleep(1)

    def getFavoriteModels(self, token):
        user = self.dbClass.getUser(token, raw=True)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : updateFavoriteModel \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        models = []

        for x in self.dbClass.getFavoriteModelsByUserId(user.id):
            x2 = x.__dict__['__data__']
            x2['isFavorite'] = True
            x2['projectName'] = x.projectstable.projectName
            models.append(x2)
        return HTTP_200_OK, models