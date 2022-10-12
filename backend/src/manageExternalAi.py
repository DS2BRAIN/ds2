import os
import time
import traceback
import urllib
import cv2
import pandas as pd
import numpy as np

from models import externalaisTable
from src.manage_machine_learning import ManageMachineLearning
import json

from api_wrapper.metabase_wrapper import MetabaseAPI
from src.util import Util
from models.helper import Helper
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR, HTTP_201_CREATED, HTTP_204_NO_CONTENT
from src.errors import exceptions as ex
from src.errorResponseList import ErrorResponseList, NOT_FOUND_USER_ERROR, NOT_FOUND_AI_ERROR, NOT_ALLOWED_TOKEN_ERROR, \
    WRONG_ACCESS_ERROR, NORMAL_ERROR

errorResponseList = ErrorResponseList()

class ManageExternalAi:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.ml_class = ManageMachineLearning()
        self.s3 = self.utilClass.getBotoClient('s3')
        pd.options.display.float_format = '{:.5f}'.format

    def getEngineAis(self, token):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageExternalAI.py \n함수 : getExternalAis \n잘못된 토큰으로 에러 입력한 토큰 : {token}", appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        externalAis = [x.__dict__['__data__'] for x in self.dbClass.getEngineais()]

        return HTTP_200_OK, externalAis

    def getExternalAis(self, token):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageExternalAI.py \n함수 : getExternalAis \n잘못된 토큰으로 에러 입력한 토큰 : {token}", appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        externalAis = [x.__dict__['__data__'] for x in self.dbClass.getExternalais()]

        return HTTP_200_OK, externalAis

    def certify(self, key, passwd):
        privacy= self.utilClass.privacy
        passwd_dict = self.utilClass.passwd_dict

        if not privacy.get(key):
            message = f"누군가가 Aceess key를 잘못입력하였습니다. |"
            self.utilClass.sendSlackMessage(message, data_part=True)
            raise ex.NotAllowedKeyEx(key)
        else:
            user_name = privacy.get(key)
            if passwd_dict[user_name] != passwd:
                message = f"{user_name}님이 비밀번호를 잘못입력하였습니다. |"
                self.utilClass.sendSlackMessage(message, data_part=True)
                raise ex.NotAllowedPasswdEx(key)
            return user_name

    def uploadModel(self, apptoken, model_name, file, version, isExampleModel, model_summary, model_description, display_name):
        user = self.dbClass.getUserByAppToken(apptoken)
        user_id = user['id']

        data = {
                "externalAiName": model_name,
                "externalAiType": "model",
                "imageUrl": None,
                "requirePredictUnit": None,
                "externalAiDescription": model_description,
                "Name": model_name,
                "displayName": display_name,
                "externalAiSummary": model_summary,
                "hasPredictAll": 0,
                "provider": "dslab",
                "developedaimodels": None
            }

        status = 100 if file else 0

        ai_raw = externalaisTable.create(data)

        aiName = self.utilClass.unquote_url(ai_raw.externalAiName)
        subUrl = f'user/{user_id}/{aiName}'
        self.s3.put_object(Body=file, Bucket=self.utilClass.bucket_name, Key=subUrl)
        s3Url = urllib.parse.quote(
            f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{subUrl}').replace(
            'https%3A//', 'https://')

        data = {'model': '', 'modeltype': ai_raw.id, 'modelName': model_name, 'user': user_id, 'status': status,
                'modelpath': s3Url, 'modelVersion': version, 'isExampleModel': isExampleModel}

        return HTTP_201_CREATED, self.dbClass.createDevelopedAi(data).__dict__['__data__']

    def predictByDevelopedModel(self, apptoken, modelId, file, textdata):

        from src.service.aidev.dslabai.models.modelPredictor import ModelPredictor
        import src.service.aidev.dslabai as dslabai

        if file:
            predictModelType = 'image'
        elif textdata:
            predictModelType = 'csv'
        developedModelInfo = self.dbClass.getOneDevelopedAiById(modelId)

        user = self.dbClass.getUserByAppToken(apptoken)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageExternalAI.py \n함수 : uploadModel \n유저 정보를 찾을 수 없 토큰 : {apptoken}", appError=True,
                userInfo=user)
            return NOT_FOUND_USER_ERROR

        if not developedModelInfo.isExampleModel and developedModelInfo.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageExternalAI.py \n함수 : uploadModel \n잘못된 토큰으로 에러 입력한 토큰 : {apptoken}", appError=True,
                userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        modelName = self.dbClass.getExternalaiById(developedModelInfo.modeltype).externalAiName
        s3url = developedModelInfo.modelpath
        s3url = s3url.split('.com/')[1]
        self.s3.download_file(self.utilClass.bucket_name, s3url, f'{os.getcwd()}/temp/{user.id}{modelName}')

        try:
            self.utilClass.sendSlackMessage(
                f"함수 : predictByDevelopedModel \n developedModel 예측하기 수행\n submodule Info - version : {dslabai.__version__}", appLog=True,
                userInfo=user)
            model = ModelPredictor(modelName, path=f'{os.getcwd()}/temp/{user.id}{modelName}', version=developedModelInfo.modelVersion)
            modelType = model.getInputType()

            assert predictModelType == modelType, WRONG_ACCESS_ERROR

            if predictModelType == 'image':
                image = np.fromstring(file, dtype='uint8')
                data = cv2.imdecode(image, cv2.IMREAD_COLOR)
            elif predictModelType == 'csv':
                data = textdata

            result = model.inference([data])

            code = HTTP_200_OK
            result = {'result' : result[0]}
        except Exception as e:
            print(traceback.format_exc())
            code, result = NORMAL_ERROR
        finally:
            os.remove(f'{os.getcwd()}/temp/{user.id}{modelName}')
            return code, result

    def create_metabase(self, background_tasks, token: str, source_type: str, source_id: int):

        user = self.dbClass.getUser(token)
        if not user:
            raise ex.NotFoundUserEx(token=token, email=user.get('email'))
        user_id = user.get('id')

        table_name = f"dataconnector_{source_id}_table" if source_type == 'dataconnector' else f"model_{source_id}_table"

        if self.dbClass.check_collection_exists(table_name):
            self.dbClass.delete_collection_by_name(table_name)

        # collection_name = None
        if source_type == 'dataconnector':
            if self.dbClass.create_dataconnector_view(view_name=table_name, dataconnector_id=source_id) is None:
                raise ex.FailMongoQueryEx(user_id, table_name)
        elif source_type == 'model':
            # collection_name = f"model_{source_id}_collection"
            data_list = self.ml_class.get_df_with_predict(source_id).to_dict('records')
            try:
                self.dbClass.create_model_collection(collection_name=table_name, data=data_list)
                # self.dbClass.create_model_collection(collection_name=collection_name, data=data_list)
                # self.dbClass.create_model_view(collection_name, table_name)
            except:
                raise ex.FailMongoQueryEx(user_id, table_name)
        data = {
            'taskName': source_id,
            'taskType': source_type,
            'provider': 'metabase',
            'status': 1,
            'user': user_id
        }
        meta_task = self.dbClass.createAsyncTask(data)
        task_id = meta_task.id
        background_tasks.add_task(self.set_table_permission, user_id, table_name, task_id)

        return HTTP_204_NO_CONTENT

    def set_table_permission(self, user_id: int, table_name: str, task_id: int):

        try:
            mb = self.utilClass.get_metabase_client()
            database_id = mb.get_item_id('database', self.utilClass.metabase_database_name)
            table_id = None
            for i in range(300):
                mb.sync_database(database_id)
                try:
                    table_id = mb.get_item_id('table', table_name)
                except:
                    time.sleep(1)
                else:
                    break
            # 1분 동기화 실패, 뷰 실패
            if table_id is None:
                print('timeout error')
                raise Exception
            else:
                group_id = mb.get_group_id(str(user_id))
                # 권한 추가 최대 5번 재시도
                for i in range(5):
                    try:
                        permission_body = mb.get_permission()

                        if permission_body['groups'].get(str(group_id)) is None:
                            permission_body['groups'][str(group_id)] = {
                                str(database_id): {
                                    'data': {
                                        'schemas': {
                                            '': {
                                                str(table_id): 'all'
                                            }
                                        }
                                    }
                                }
                            }
                        elif permission_body['groups'][str(group_id)].get(str(database_id)) is None:
                            permission_body['groups'][str(group_id)][str(database_id)] = {
                                'data': {
                                    'schemas': {
                                        '': {
                                            str(table_id): 'all'
                                        }
                                    }
                                }
                            }
                        elif permission_body['groups'][str(group_id)][str(database_id)]['data']['schemas'][''].get(str(table_id)) is None:
                            permission_body['groups'][str(group_id)][str(database_id)]['data']['schemas'][''] = {
                                str(table_id): 'all'
                            }
                        else:
                            permission_body['groups'][str(group_id)][str(database_id)]['data']['schemas'][''][str(table_id)] = 'all'
                        mb.put_permission(permission_body)
                        return None
                    except ValueError:
                        print('permission error')
                        continue
        except Exception as e:
            print(e.args[0].text)
            self.dbClass.delete_collection_by_name(table_name)
            # if collection_name:
            #     self.dbClass.delete_collection_by_name(collection_name)
            self.dbClass.delete_async_task_by_id(task_id)
