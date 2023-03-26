import ast
import asyncio
import json

from src.util import Util
from fastapi.encoders import jsonable_encoder
from src.managePayment import ManagePayment
from models.helper import Helper
from src.errors import exceptions as ex
from starlette.status import HTTP_200_OK, HTTP_204_NO_CONTENT
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_507_INSUFFICIENT_STORAGE
from src.errorResponseList import ErrorResponseList, NOT_FOUND_USER_ERROR, NOT_ALLOWED_TOKEN_ERROR, \
    EXCEED_CONNECTOR_ERROR, ASYNC_TASK_USER_ERROR

errorResponseList = ErrorResponseList()

#TODO: 숫자 헤더면 바꿔줘야됨
class ManageTask:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.paymentClass = ManagePayment()
        self.s3 = self.utilClass.getBotoClient('s3')

    def getAsyncTask(self, token, asynctaskId):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageTask.py \n함수 : putAsyncTasks \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}", appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
            pass

        asynctask = self.dbClass.getOneAsnycTaskById(asynctaskId)

        return HTTP_200_OK, asynctask.__dict__['__data__']

    def putAsyncTasks(self, token, asynctaskId, asyncTaskModel):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageTask.py \n함수 : putAsyncTasks \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}", appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
            pass
        if not asyncTaskModel.status and not asyncTaskModel.working_on:
            asynctask = self.dbClass.updateCheckAsynctaskByUserId(user.id, asynctaskId)
            if asynctask == 0:
                return HTTP_500_INTERNAL_SERVER_ERROR, {'asynctaskId': asynctaskId, 'result': asynctask}

            return HTTP_200_OK, {'asynctaskId': asynctaskId, 'result': asynctask}
        else:
            async_task = self.dbClass.getOneAsnycTaskById(asynctaskId)
            if asyncTaskModel.status:
                async_task.status = asyncTaskModel.status
            if asyncTaskModel.working_on:
                async_task.working_on = asyncTaskModel.working_on
            async_task.save()
            return HTTP_200_OK, {'result': async_task}


    def deleteAsyncTask(self, token, asynctaskId):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageTask.py \n함수 : putAsyncTasks \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}", appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
            pass

        asynctask = self.dbClass.getOneAsnycTaskById(asynctaskId)
        asynctask.delete_instance()
        asynctask.save()


        return HTTP_204_NO_CONTENT, {}

    def getAsyncTasks(self, token, provider):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageTask.py \n함수 : getAsyncTasks \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        asynctasks = []
        for asynctaskRaw in self.dbClass.getCurrentAsnycTasksByUserId(user["id"], provider):
            async_dict = asynctaskRaw.__dict__['__data__']
            status_text = async_dict.get('statusText')
            if status_text is not None:
                try:
                    async_dict['statusText'] = json.loads(status_text)
                except:
                    pass
            asynctasks.append(async_dict)

        return HTTP_200_OK, asynctasks

    def get_async_task(self, user_id, provider):
        asynctasks = []

        for asynctask_raw in self.dbClass.getCurrentAsnycTasksByUserId(user_id, provider):
            async_dict = jsonable_encoder(asynctask_raw.__dict__['__data__'])
            status_text = async_dict.get('statusText')
            if status_text is not None:
                try:
                    async_dict['statusText'] = json.loads(status_text)
                except:
                    pass
            asynctasks.append(async_dict)

        return asynctasks

    async def get_async_tasks(self, token, provider, request):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageTask.py \n함수 : getAsyncTasks \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            raise ex.NotFoundUserEx()

        asynctasks = self.get_async_task(user['id'], provider)

        yield {
            "event": "new_message",
            "id": "message_id",
            "retry": 50000,
            "data": json.dumps({"result": asynctasks})
        }

        while True:
            if await request.is_disconnected():
                break

            asynctasks = self.get_async_task(user['id'], provider)

            yield {
                "event": "new_message",
                "id": "message_id",
                "retry": 50000,
                "data": json.dumps({"result": asynctasks})
            }

            await asyncio.sleep(5)

    def getAsyncAllTasks(self, token, provider, start=0, count=0, tasktype='all', label_project_id=None, market_project_id=None):

        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageTask.py \n함수 : getAsyncTasks \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if label_project_id is not None:
            role = None
            for temp in self.dbClass.getSharedLabelprojectIdByUserId(user['id']):
                if temp.labelprojectsid and int(label_project_id) in ast.literal_eval(temp.labelprojectsid):
                    group_user = self.dbClass.getMemberByUserIdAndGroupId(user['id'], temp.id)
                    if group_user and role != 'admin':
                        role = role if role == 'subadmin' and group_user.role != 'admin' else group_user.role

            label_project_raw = self.dbClass.getLabelProjectsById(label_project_id)
            if label_project_raw.user != user['id'] and role != 'subadmin':
                raise ex.NotAllowedTokenEx(user['email'])

            asynctasks = [x.__dict__['__data__'] for x in
                          self.dbClass.getAsnycTasksWithProjectByUserId(user["id"], label_project_id, "labelproject", start, count)]
            totalLength = self.dbClass.getAsyncTasksTotalCountWithProjectByUserID(user['id'], label_project_id, "labelproject")
        elif market_project_id is not None:
            market_project_raw = self.dbClass.getMarketProjectsById(market_project_id)
            if market_project_raw.user != user['id']:
                raise ex.NotAllowedTokenEx(user['email'])

            asynctasks = [x.__dict__['__data__'] for x in
                          self.dbClass.getAsnycTasksWithProjectByUserId(user["id"], market_project_id, "marketproject", start, count)]
            totalLength = self.dbClass.getAsyncTasksTotalCountWithProjectByUserID(user['id'], market_project_id, "marketproject")
        else:
            asynctasks = []
            for x in self.dbClass.getAsnycTasksByUserId(user["id"], start, count, tasktype, provider):
                if x.statusText is not None:
                    x.statusText = json.loads(x.statusText)
                asynctasks.append(x.__dict__['__data__'])
            totalLength = self.dbClass.getAsyncTasksTotalCountByUserID(user['id'], tasktype, provider)

        return HTTP_200_OK, {'asynctasks': asynctasks, 'totalLength': totalLength}

    # def setTestProject(self, userId, projectName='test_project', status=1, method="normal_classification"):
    #     rootPath = "https://astoredslab.s3.ap-northeast-2.amazonaws.com/user/164"
    #     userId = 164
    #     if self.utilClass.configOption in 'prod':
    #         rootPath = "https://aimakerdslab.s3.ap-northeast-2.amazonaws.com/user/159"
    #         userId = 159
    #
    #     if "normal" == method:
    #
    #         return self.dbClass.createProject(
    #         {
    #             "projectName":"test_clssification",
    #             "isTest": 1,
    #            "status": 1,
    #            "valueForPredict": "과금 여부",
    #            "option": "accuracy",
    #            "trainingMethod": "normal",
    #            "statusText": "1: 모델링이 시작됩니다.",
    #             "originalFileName": "test_clssification.csv",
    #             "fileStructure": "[{\"columnName\":\"나이\",\"index\":\"1\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"77\",\"type\":\"number\",\"min\":\"18.0\",\"max\":\"95.0\",\"std\":\"10.618762040975431\",\"mean\":\"40.93621021432837\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"직업\",\"index\":\"2\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"12\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"blue-collar\",\"freq\":9732,\"use\":\"true\"},{\"columnName\":\"혼인여부\",\"index\":\"3\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"3\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"married\",\"freq\":27214,\"use\":\"true\"},{\"columnName\":\"학업\",\"index\":\"4\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"4\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"secondary\",\"freq\":23202,\"use\":\"true\"},{\"columnName\":\"신용카드 소지 여부\",\"index\":\"5\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"2\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"no\",\"freq\":44396,\"use\":\"true\"},{\"columnName\":\"연봉\",\"index\":\"6\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"7168\",\"type\":\"number\",\"min\":\"-8019.0\",\"max\":\"102127.0\",\"std\":\"3044.7658291686002\",\"mean\":\"1362.2720576850766\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"집담보 대출\",\"index\":\"7\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"2\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"yes\",\"freq\":25130,\"use\":\"true\"},{\"columnName\":\"기타 대출\",\"index\":\"8\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"2\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"no\",\"freq\":37967,\"use\":\"true\"},{\"columnName\":\"연락 방법\",\"index\":\"9\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"3\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"cellular\",\"freq\":29285,\"use\":\"true\"},{\"columnName\":\"최근 연락한 날 (일)\",\"index\":\"10\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"31\",\"type\":\"number\",\"min\":\"1.0\",\"max\":\"31.0\",\"std\":\"8.322476153044185\",\"mean\":\"15.80641879188693\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"최근 연락한 날 (월)\",\"index\":\"11\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"12\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"may\",\"freq\":13766,\"use\":\"true\"},{\"columnName\":\"최근 연락 기간\",\"index\":\"12\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"1573\",\"type\":\"number\",\"min\":\"0.0\",\"max\":\"4918.0\",\"std\":\"257.52781226517095\",\"mean\":\"258.1630797814691\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"최근 켐페인 참가 여부\",\"index\":\"13\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"48\",\"type\":\"number\",\"min\":\"1.0\",\"max\":\"63.0\",\"std\":\"3.0980208832802205\",\"mean\":\"2.763840658246887\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"최근 켐페인 이후 시간 소요 (일)\",\"index\":\"14\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"559\",\"type\":\"number\",\"min\":\"-1.0\",\"max\":\"871.0\",\"std\":\"100.1287459906047\",\"mean\":\"40.19782796222158\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"최근 켐페인 이후 연락 횟수\",\"index\":\"15\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"41\",\"type\":\"number\",\"min\":\"0.0\",\"max\":\"275.0\",\"std\":\"2.3034410449314233\",\"mean\":\"0.5803233726305546\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"이전 마케팅 성공 여부 \",\"index\":\"16\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"4\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"unknown\",\"freq\":36959,\"use\":\"true\"},{\"columnName\":\"과금 여부\",\"index\":\"17\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"2\",\"type\":\"number\",\"min\":\"1.0\",\"max\":\"2.0\",\"std\":\"0.321405732615653\",\"mean\":\"1.1169848045829556\",\"top\":\"\",\"freq\":\"\",\"use\":\"false\"}]",
    #             "fileStructureGAN": None,
    #             "yClass": None,
    #             "filePath":f"{rootPath}/test_clssification.csv",
    #             "user": userId,
    #             "hasImageData": False,
    #             "hasTextData": True,
    #         }
    #         )
    #     elif 'normal_classification' in method:
    #         return self.dbClass.createProject(
    #             {
    #                 "projectName": "test_clssification",
    #                 "isTest": 1,
    #                 "status": 1,
    #                 "valueForPredict": "과금 여부",
    #                 "option": "accuracy",
    #                 "trainingMethod": "normal_classification",
    #                 "statusText": "1: 모델링이 시작됩니다.",
    #                 "originalFileName": "test_clssification.csv",
    #                 "fileStructure": "[{\"columnName\":\"나이\",\"index\":\"1\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"77\",\"type\":\"number\",\"min\":\"18.0\",\"max\":\"95.0\",\"std\":\"10.618762040975431\",\"mean\":\"40.93621021432837\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"직업\",\"index\":\"2\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"12\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"blue-collar\",\"freq\":9732,\"use\":\"true\"},{\"columnName\":\"혼인여부\",\"index\":\"3\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"3\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"married\",\"freq\":27214,\"use\":\"true\"},{\"columnName\":\"학업\",\"index\":\"4\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"4\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"secondary\",\"freq\":23202,\"use\":\"true\"},{\"columnName\":\"신용카드 소지 여부\",\"index\":\"5\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"2\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"no\",\"freq\":44396,\"use\":\"true\"},{\"columnName\":\"연봉\",\"index\":\"6\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"7168\",\"type\":\"number\",\"min\":\"-8019.0\",\"max\":\"102127.0\",\"std\":\"3044.7658291686002\",\"mean\":\"1362.2720576850766\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"집담보 대출\",\"index\":\"7\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"2\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"yes\",\"freq\":25130,\"use\":\"true\"},{\"columnName\":\"기타 대출\",\"index\":\"8\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"2\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"no\",\"freq\":37967,\"use\":\"true\"},{\"columnName\":\"연락 방법\",\"index\":\"9\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"3\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"cellular\",\"freq\":29285,\"use\":\"true\"},{\"columnName\":\"최근 연락한 날 (일)\",\"index\":\"10\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"31\",\"type\":\"number\",\"min\":\"1.0\",\"max\":\"31.0\",\"std\":\"8.322476153044185\",\"mean\":\"15.80641879188693\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"최근 연락한 날 (월)\",\"index\":\"11\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"12\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"may\",\"freq\":13766,\"use\":\"true\"},{\"columnName\":\"최근 연락 기간\",\"index\":\"12\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"1573\",\"type\":\"number\",\"min\":\"0.0\",\"max\":\"4918.0\",\"std\":\"257.52781226517095\",\"mean\":\"258.1630797814691\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"최근 켐페인 참가 여부\",\"index\":\"13\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"48\",\"type\":\"number\",\"min\":\"1.0\",\"max\":\"63.0\",\"std\":\"3.0980208832802205\",\"mean\":\"2.763840658246887\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"최근 켐페인 이후 시간 소요 (일)\",\"index\":\"14\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"559\",\"type\":\"number\",\"min\":\"-1.0\",\"max\":\"871.0\",\"std\":\"100.1287459906047\",\"mean\":\"40.19782796222158\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"최근 켐페인 이후 연락 횟수\",\"index\":\"15\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"41\",\"type\":\"number\",\"min\":\"0.0\",\"max\":\"275.0\",\"std\":\"2.3034410449314233\",\"mean\":\"0.5803233726305546\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"이전 마케팅 성공 여부 \",\"index\":\"16\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"4\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"unknown\",\"freq\":36959,\"use\":\"true\"},{\"columnName\":\"과금 여부\",\"index\":\"17\",\"length\":\"45211\",\"miss\":\"0\",\"unique\":\"2\",\"type\":\"number\",\"min\":\"1.0\",\"max\":\"2.0\",\"std\":\"0.321405732615653\",\"mean\":\"1.1169848045829556\",\"top\":\"\",\"freq\":\"\",\"use\":\"false\"}]",
    #                 "fileStructureGAN": None,
    #                 "yClass": None,
    #                 "filePath": f"{rootPath}/test_clssification.csv",
    #                 "user": userId,
    #                 "hasImageData": False,
    #                 "hasTextData": True,
    #             }
    #         )
    #     elif 'normal_regression' in method:
    #         return self.dbClass.createProject(
    #             {
    #                 "isTest": 1,
    #                 "projectName":"test_regression",
    #                 "status":1,
    #                 "statusText":"1: 모델링이 시작됩니다.",
    #                 "originalFileName":"test_regression.csv",
    #                 "fileStructure": "[{\"columnName\":\"나이\",\"index\":\"1\",\"length\":\"1338\",\"miss\":\"0\",\"unique\":\"47\",\"type\":\"number\",\"min\":\"18.0\",\"max\":\"64.0\",\"std\":\"14.049960379216172\",\"mean\":\"39.20702541106129\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"성별\",\"index\":\"2\",\"length\":\"1338\",\"miss\":\"0\",\"unique\":\"2\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"male\",\"freq\":676,\"use\":\"true\"},{\"columnName\":\"체지방\",\"index\":\"3\",\"length\":\"1338\",\"miss\":\"0\",\"unique\":\"548\",\"type\":\"number\",\"min\":\"15.96\",\"max\":\"53.13\",\"std\":\"6.098186911679017\",\"mean\":\"30.663396860986538\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"자식 수\",\"index\":\"4\",\"length\":\"1338\",\"miss\":\"0\",\"unique\":\"6\",\"type\":\"number\",\"min\":\"0.0\",\"max\":\"5.0\",\"std\":\"1.2054927397819095\",\"mean\":\"1.0949177877429\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"흡연 여부\",\"index\":\"5\",\"length\":\"1338\",\"miss\":\"0\",\"unique\":\"2\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"no\",\"freq\":1064,\"use\":\"true\"},{\"columnName\":\"지역\",\"index\":\"6\",\"length\":\"1338\",\"miss\":\"0\",\"unique\":\"4\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"southeast\",\"freq\":364,\"use\":\"true\"},{\"columnName\":\"의료 비용\",\"index\":\"7\",\"length\":\"1338\",\"miss\":\"0\",\"unique\":\"1337\",\"type\":\"number\",\"min\":\"1121.8739\",\"max\":\"63770.42801\",\"std\":\"12110.011236693994\",\"mean\":\"13270.422265141257\",\"top\":\"\",\"freq\":\"\",\"use\":\"false\"},{\"columnName\":\"의료비용_nor\",\"index\":\"8\",\"length\":\"1338\",\"miss\":\"0\",\"unique\":\"1334\",\"type\":\"number\",\"min\":\"0.017829753\",\"max\":\"1.0\",\"std\":\"0.19724666161540047\",\"mean\":\"0.21436689047608393\",\"top\":\"\",\"freq\":\"\",\"use\":\"false\"}]",
    #                 "fileStructureGAN":None,
    #                 "trainingMethod":"normal_regression",
    #                 "valueForPredict": "의료 비용",
    #                 "option": "accuracy",
    #                 "filePath":f"{rootPath}/test_regression.csv",
    #                 "user":"userId",
    #                 "hasImageData":False,
    #                 "hasTextData":True
    #              }
    #         )
    #     elif "image" in method:
    #         return self.dbClass.createProject({
    #                 "isTest": 1,
    #             "projectName":"53313",
    #             "status":1,
    #             "created_at":"2020-03-22T06:58:33","updated_at":"2020-03-22T06:58:33",
    #             "user":userId,
    #             "trainingMethod": "image",
    #             "valueForPredict":"label",
    #             "option":"accuracy",
    #             "fileStructure":"[{\"columnName\":\"image\",\"index\":\"1\",\"length\":\"12440\",\"miss\":\"0\",\"unique\":\"12440\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"7/57188.png\",\"freq\":1,\"use\":\"true\"},{\"columnName\":\"label\",\"index\":\"2\",\"length\":\"12440\",\"miss\":\"0\",\"unique\":\"4\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"7\",\"freq\":6265,\"use\":\"false\"}]",
    #             "filePath":f"{rootPath}/test_image_new.zip",
    #             "statusText":"0: 예측 준비 중 입니다.",
    #             "originalFileName":"53313.png",
    #             "hasTextData":False,
    #             "hasImageData":True,
    #             "models":[]})
    #     elif "text" in method:
    #         return self.dbClass.createProject({
    #             "isTest": 1,
    #             "projectName":"test_text_short",
    #             "status":1,
    #             "user":userId,
    #             "trainingMethod": "text",
    #             "valueForPredict": "label",
    #             "option":"speed",
    #             "fileStructure": "[{\"columnName\":\"reviews\",\"index\":\"1\",\"length\":\"3222\",\"miss\":\"0\",\"unique\":\"3211\",\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"최고\",\"freq\":5,\"use\":\"true\"},{\"columnName\":\"label\",\"index\":\"2\",\"length\":\"3222\",\"miss\":\"0\",\"unique\":\"2\",\"type\":\"number\",\"min\":\"0.0\",\"max\":\"1.0\",\"std\":\"0.5000351209309358\",\"mean\":\"0.5065176908752328\",\"top\":\"\",\"freq\":\"\",\"use\":\"false\"}]",
    #             "filePath":f"{rootPath}/test_text_short.csv",
    #             "statusText":"1: 모델링이 시작됩니다.",
    #             "originalFileName":"test_text_short.csv",
    #             "hasTextData":True,
    #             "hasImageData":False,
    #             "models":[]})
    #     elif "object_detection" in method:
    #         return self.dbClass.createProject({
    #             "isTest": 1,
    #             "projectName": "car_object_detection",
    #             "status": 1, "created_at": "2020-03-22T07:29:59",
    #          "updated_at": "2020-03-22T07:29:59",
    #             "user": userId,
    #             "valueForPredict": "label",
    #             "option": "speed",
    #          "fileStructure": "[{\"columnName\":\"image\",\"index\":\"1\",\"length\":\"49\",\"miss\":\"0\",\"unique\":\"9\",\"type\":\"number\",\"min\":\"0.0\",\"max\":\"8.0\",\"std\":\"2.4693701860284656\",\"mean\":\"4.163265306122449\",\"top\":\"\",\"freq\":\"\",\"use\":\"true\"},{\"columnName\":\"label\",\"index\":\"2\",\"length\":\"49\",\"miss\":\"0\",\"unique\":\"3\",\"type\":\"number\",\"min\":\"0.0\",\"max\":\"2.0\",\"std\":\"0.5337264707490452\",\"mean\":\"0.9183673469387755\",\"top\":\"\",\"freq\":\"\",\"use\":\"false\"}]",
    #          "filePath": f"{rootPath}/car_object_detection.zip",
    #          "statusText": "1: 모델링이 시작됩니다.",
    #         "originalFileName": "car_object_detection.zip",
    #          "trainingMethod": "object_detection",
    #          "errorCountConflict": 0,
    #         "errorCountMemory": 0,
    #         "errorCountNotExpected": 0,
    #         "successCount": 0,
    #          "yClass": "[\"bus\", \"car\", \"truck\"]",
    #         "hasTextData": False,
    #          "hasImageData": True,
    #         "models": []})
    #     elif "cycle_gan" in method:
    #         return self.dbClass.createProject({
    #             "isTest": 1,
    #             "projectName":"._n02391049_46",
    #             "status":1,
    #             "user":userId,
    #             "valueForPredict": "zebra_image_dir",
    #             "trainingMethod": "cycle_gan",
    #             "option": "accuracy",
    #             "fileStructure": "[{\"columnName\":\"horse_image_dir\",\"index\":0,\"length\":96,\"miss\":0,\"unique\":96,\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"\",\"freq\":1,\"use\":\"true\"},{\"columnName\":\"zebra_image_dir\",\"index\":1,\"length\":96,\"miss\":0,\"unique\":96,\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"\",\"freq\":1,\"use\":\"false\"},{\"columnName\":\"__MACOSX\",\"index\":2,\"length\":49,\"miss\":0,\"unique\":49,\"type\":\"object\",\"min\":\"\",\"max\":\"\",\"std\":\"\",\"mean\":\"\",\"top\":\"\",\"freq\":1,\"use\":\"false\"}]",
    #             "filePath":f"{rootPath}/horse_zebra.zip",
    #             "statusText":"1: 모델링이 시작됩니다.",
    #             "originalFileName":"._n02391049_46.jpg",
    #            "hasTextData":False,
    #             "hasImageData":True,
    #             "models":[]})
    #
    # def getDataconnectorCntByUser(self, token):
    #
    #
    #     user = self.dbClass.getUser(token)
    #     if not user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageTask\n 함수 : getDataconnectorCntByUser \n허용되지 않은 토큰 값입니다. token = {token})",
    #             appError=True)
    #         return NOT_ALLOWED_TOKEN_ERROR
    #
    #     currentDynos = user['dynos']
    #
    #     currentUsageplan = self.dbClass.getOneUsageplanById(user['usageplan'])
    #
    #     cnt = self.dbClass.getDataconnectorConutByUserId(user['id'])
    #     if currentUsageplan["planName"] == "basic" and cnt >= 5:
    #         return EXCEED_CONNECTOR_ERROR
    #     elif currentUsageplan['planName'] == 'business' and cnt >= 15:
    #         return EXCEED_CONNECTOR_ERROR
    #     return HTTP_200_OK,cnt
