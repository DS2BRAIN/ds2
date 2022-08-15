import datetime
import io
import json
import shutil
import time
import urllib.parse

from bson import json_util
from playhouse.shortcuts import model_to_dict

from src.errors import exceptions as ex

import pandas as pd
import os
from starlette.responses import StreamingResponse
from models import jupyterProjectsTable
from src.util import Util
from models.helper import Helper
from starlette.status import HTTP_200_OK, HTTP_204_NO_CONTENT
from starlette.status import HTTP_201_CREATED
from src.errorResponseList import NOT_FOUND_USER_ERROR, NOT_ALLOWED_TOKEN_ERROR, NOT_ALLOWED_INPUT_ERROR, \
    PERMISSION_DENIED_CONNECTOR_ERROR, \
    NON_EXISTENT_CONNECTOR_ERROR, MIN_DATA_ERROR, NORMAL_ERROR, ErrorResponseList, KEY_FIlE_INFO_ERROR, PIL_IOERROR, \
    TOO_MANY_ERROR_PROJECT, EXCEED_PROJECT_ERROR, USER_ERROR, EXCEED_SERVER_ERROR, ALREADY_DELETED_OBJECT
from models import rd

errorResponseList = ErrorResponseList()

#TODO: 숫자 헤더면 바꿔줘야됨
class ManageJupyter:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.jupyterClass = None
        if os.path.exists('src/creating/jupyter.py'):
            from src.creating.jupyter import Jupyter
            self.jupyterClass = Jupyter()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.ec2 = self.utilClass.getBotoClient('ec2')
        self.cloudwatch = self.utilClass.getBotoClient('cloudwatch')
        pd.options.display.float_format = '{:.5f}'.format

    def get_used_jupyter_port(self, token):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : createJupyterProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        return HTTP_200_OK, [x.port for x in self.dbClass.getJupyterProjectsPort()]

    def createJupyterProject(self, token, jupyter_project_object):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : createJupyterProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if self.dbClass.isUserHavingExceedErrorProjectCount(user.__dict__['__data__']):
            self.utilClass.sendSlackMessage(f"유저 ID : {user.id} - 오류 프로젝트를 지나치게 많이 생성하고 있으니 조치바랍니다.", inquiry=True, userInfo=user)
            return TOO_MANY_ERROR_PROJECT

        if self.dbClass.isUserHavingExceedProjectCount(user.__dict__['__data__']):
            self.utilClass.sendSlackMessage(
                f"csv Parse - run() \n프로젝트 사용량 초과입니다 {user.email} (ID: {user.id})",
                appLog=True, userInfo=user)
            return EXCEED_PROJECT_ERROR

        # serverPricingInfo = self.dbClass.getServerPricingByServerTypeAndRegion(jupyter_project_object.serverType, jupyter_project_object.region)
        # priceForThreeMonths = serverPricingInfo.pricePerHourSelfModeling * 24 * 30 * 3

        # if user.deposit - user.usedPrice - priceForThreeMonths <= 0:
        if self.utilClass.configOption != 'enterprise':

            aliveCount = 0
            jupyter_projects = self.dbClass.getJupyterProjectsByUserId(user.id)
            for jupyter_project in jupyter_projects:
                if jupyter_project.status and jupyter_project.status > -1 and not jupyter_project.isDeleted:
                    aliveCount += 1

            if aliveCount > 4:
                raise ex.ExceedServerAmountEx

            jupyter_project = self.dbClass.createJupyterProject({
                "projectName": jupyter_project_object.projectName,
                "user": user.id
            })

            jupyter_server = self.jupyterClass.createJupyterServer({
                "user": user.id,
                "apptoken": user.appTokenCode,
                "jupyterProject": jupyter_project.id,
                "region": jupyter_project_object.region,
                "serverType": jupyter_project_object.serverType
            })
            result = jupyter_project.__dict__['__data__']
            result["instances"] = jupyter_server.__dict__['__data__']

        else:
            jupyter_project = self.dbClass.createJupyterProject({
                "projectName": jupyter_project_object.projectName,
                "user": user.id,
            })

            if self.dbClass.getJupyterAliveServersCountByPort(jupyter_project_object.port) > 0:
                raise ex.NotAvailableServerStatusEx

            jupyter_server = self.dbClass.createJupyterServer({
                "status": 0,
                "jupyterProject": jupyter_project.id,
                "created_at": datetime.datetime.utcnow(),
                "port": jupyter_project_object.port,
                "gpu": jupyter_project_object.gpu,
            })

        result = jupyter_project.__dict__['__data__']

        if rd:
            data = jupyter_server.__dict__['__data__']
            data['appTokenCode'] = user.appTokenCode
            rd.publish("broadcast",
                       json.dumps(data, default=json_util.default, ensure_ascii=False))

        result["instances"] = jupyter_server.__dict__['__data__']

        self.utilClass.sendSlackMessage(
            f"JUPYTER 프로젝트를 생성하였습니다. {user.email} (ID: {user.id}) ,(OPS ID: {jupyter_project.id})",
            appLog=True, userInfo=user)

        return HTTP_200_OK, result

    def getJupyterServersStatusByJupyterProjectId(self, token, jupyter_project_id):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : getJupyterServersStatusByJupyterProjectId \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        jupyter_project = self.dbClass.getOneJupyterProjectById(jupyter_project_id, raw=True)
        if jupyter_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : getJupyterServersStatusByJupyterProjectId \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR


        return HTTP_200_OK, self.jupyterClass.monitoringJupyterServerByJupyterProject(jupyter_project, user)

    def getJupyterProject(self, token, jupyter_project_id):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : getJupyterProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if self.dbClass.isUserHavingExceedErrorProjectCount(user.__dict__['__data__']):
            self.utilClass.sendSlackMessage(f"유저 ID : {user.id} - 오류 프로젝트를 지나치게 많이 생성하고 있으니 조치바랍니다.", inquiry=True, userInfo=user)
            return TOO_MANY_ERROR_PROJECT

        if self.dbClass.isUserHavingExceedProjectCount(user.__dict__['__data__']):
            self.utilClass.sendSlackMessage(
                f"csv Parse - run() \n프로젝트 사용량 초과입니다 {user['email']} (ID: {user['id']})",
                appLog=True, userInfo=user)
            return EXCEED_PROJECT_ERROR

        jupyter_project = self.dbClass.getOneJupyterProjectById(jupyter_project_id, raw=True)
        if jupyter_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : getJupyterProject \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        if jupyter_project.isDeleted:
            return ALREADY_DELETED_OBJECT

        jupyter_project_dict = jupyter_project.__dict__['__data__']

        jupyter_project_dict['instances'] = self.jupyterClass.getInstancesStatus(jupyter_project, user)
        jupyter_project_dict['jupyterServers'] = [x.__dict__['__data__'] for x in self.dbClass.getJupyterServersByJupyterProjectId(jupyter_project_dict['id'])]

        return HTTP_200_OK, jupyter_project_dict

    def putJupyterProject(self, token, jupyter_project_id, jupyter_project_object):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : putJupyterProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        jupyter_project = self.dbClass.getOneJupyterProjectById(jupyter_project_id, raw=True)
        if jupyter_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : putJupyterProject \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        jupyter_project.projectName = jupyter_project_object.projectName
        jupyter_project.save()

        return HTTP_200_OK, jupyter_project.__dict__['__data__']

    def deleteJupyterProject(self, token, jupyter_project_id):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : deleteJupyterProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        jupyter_project = self.dbClass.getOneJupyterProjectById(jupyter_project_id, raw=True)
        if jupyter_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : deleteJupyterProject \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        if self.utilClass.configOption != 'enterprise':
            if jupyter_project.updated_at + datetime.timedelta(minutes=10) > datetime.datetime.utcnow():
                raise ex.NotAvailableServerStatusEx

        if self.utilClass.configOption != "enterprise":

            jupyter_servers = self.dbClass.getJupyterServersByJupyterProjectId(jupyter_project.id)
            for jupyter_server in jupyter_servers:
                jupyter_server.status = -1
                jupyter_server.updated_at = datetime.datetime.utcnow()
                jupyter_server.save()
        else:
            self.jupyterClass.removeJupyter(jupyter_project)

        jupyter_project.server_size_changed_at = datetime.datetime.utcnow()
        jupyter_project.isDeleted = True
        jupyter_project.status = -1
        jupyter_project.updated_at = datetime.datetime.utcnow()
        jupyter_project.save()

        return HTTP_204_NO_CONTENT, {}

    def deleteJupyterProjects(self, token, projectIdList):

        failList = []
        successList = []

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        for projectId in projectIdList:
            try:
                jupyterProject = self.dbClass.getOneJupyterProjectById(projectId, raw=True)

                if self.utilClass.configOption != 'enterprise':
                    if jupyterProject.updated_at + datetime.timedelta(minutes=10) > datetime.datetime.utcnow():
                        raise ex.NotAvailableServerStatusEx

                if jupyterProject.user != user['id']:
                    self.utilClass.sendSlackMessage(
                        f"파일 : manageUser\n 함수 : deleteProject \n허용되지 않은 토큰 값입니다. token = {token})",
                        appError=True, userInfo=user)
                    return NOT_ALLOWED_TOKEN_ERROR

                self.jupyterClass.removeJupyter(jupyterProject)

                jupyterProject.isDeleted = True
                jupyterProject.status = -1
                jupyterProject.updated_at = datetime.datetime.utcnow()
                jupyterProject.save()
                if self.utilClass.configOption == 'enterprise':
                    try:
                        shutil.rmtree(f"{self.utilClass.save_path}/{jupyterProject.id}")
                    except:
                        pass

                self.utilClass.sendSlackMessage(
                    f"Jupyter 프로젝트를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {jupyterProject.projectName} (ID: {jupyterProject.id})",
                    appLog=True, userInfo=user)
                successList.append(projectId)
            except:
                failList.append(projectId)
                self.utilClass.sendSlackMessage(
                    f"Jupyter 프로젝트 삭제 중 실패하였습니다. {user['email']} (ID: {user['id']}) , {jupyterProject.projectName} (ID: {jupyterProject.id})",
                    appLog=True, userInfo=user)

        return HTTP_200_OK, {'successList':successList, 'failList':failList}

    def getJupyterServerStatistic(self, token, instanceId):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createProjectFromDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        jupyter_server = self.dbClass.getOneJupyterServerByInstanceId(instanceId)
        jupyter_project = self.dbClass.getOneJupyterProjectById(jupyter_server.jupyterProject, raw=True)

        if jupyter_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : addjupyterserver \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        image_data = self.jupyterClass.getServerStatisticImage(jupyter_server, instanceId)
        return HTTP_200_OK, StreamingResponse(io.BytesIO(image_data), media_type="image/png")

    def createJupyterServer(self, token, jupyter_server_raw):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : addjupyterserver \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        if self.utilClass.configOption != 'enterprise' and user.isTest:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : addjupyterserver \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        serverPricingInfo = self.dbClass.getServerPricingByServerTypeAndRegion(jupyter_server_raw.serverType, jupyter_server_raw.region)
        # priceForThreeMonths = serverPricingInfo.pricePerHourSelfModeling * 24 * 30 * 3


        jupyter_project = self.dbClass.getOneJupyterProjectById(jupyter_server_raw.jupyterProjectId, raw=True)

        if jupyter_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : addjupyterserver \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        if self.utilClass.configOption != 'enterprise':

            result = self.jupyterClass.addServer(jupyter_server_raw, jupyter_project, user)

        else:

            if self.dbClass.getJupyterAliveServersCountByPort(jupyter_server_raw.port) > 0:
                raise ex.NotAvailableServerStatusEx

            result = self.dbClass.createJupyterServer({
                "status": 1,
                "jupyterProject": jupyter_project.id,
                "created_at": datetime.datetime.utcnow(),
                "port": jupyter_server_raw.port,
                "gpu": jupyter_server_raw.gpu,
            })



        return HTTP_201_CREATED, result

    def removeJupyterServer(self, token, instanceId):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : removeJupyterServer \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        jupyter_server = self.dbClass.getOneJupyterServerByInstanceId(instanceId)
        jupyter_project = self.dbClass.getOneJupyterProjectById(jupyter_server.jupyterProject, raw=True)

        if jupyter_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : removeJupyterServer \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        if jupyter_server.status == -1:
            raise ex.NotAvailableServerStatusEx

        try:
            ec2 = self.utilClass.getBotoClient('ec2', region_name=jupyter_server.region)
            ec2.terminate_instances(InstanceIds=[instanceId])
            self.dbClass.createInstanceLog({"execute_from": "backend", "instanceId": instanceId,
                                            "action": "terminate_jupyter", "region": jupyter_server.region,
                                            "jupyterServer": jupyter_server.id, "jupyterProject": jupyter_project.id,
                                            "user": user.id})
            self.utilClass.sendSlackMessage(
                f"{jupyter_server.region} {instanceId} : Jupyter 서버를 종료합니다. ({user.id})",
                server_status=True)
        except:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : removeJupyterServer \nec2 제거 실패 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            pass

        jupyter_server.status = -1
        jupyter_server.updated_at = datetime.datetime.utcnow()
        jupyter_server.save()
        jupyter_project.server_size_changed_at = datetime.datetime.utcnow()
        jupyter_project.save()

        return HTTP_204_NO_CONTENT, {}

    def stopJupyterServer(self, token, instanceId):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : stopJupyterServer \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        jupyter_server = self.dbClass.getOneJupyterServerByInstanceId(instanceId)
        jupyter_project = self.dbClass.getOneJupyterProjectById(jupyter_server.jupyterProject, raw=True)

        if jupyter_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : stopJupyterServer \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        if jupyter_server.status != 1:
            raise ex.NotAvailableServerStatusEx

        try:
            ec2 = self.utilClass.getBotoClient('ec2', region_name=jupyter_server.region)
            ec2.stop_instances(InstanceIds=[instanceId])
            self.dbClass.createInstanceLog({"execute_from": "backend", "instanceId": instanceId,
                                            "action": "stop_jupyter", "region": jupyter_server.region,
                                            "jupyterServer": jupyter_server.id, "jupyterProject": jupyter_project.id,
                                            "user": user.id})
            self.utilClass.sendSlackMessage(
                f"{jupyter_server.region} {instanceId} : Jupyter 서버를 정지합니다. ({user.id})",
                server_status=True)
        except:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : stopJupyterServer \nec2 제거 실패 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            pass

        jupyter_server.status = 0
        jupyter_server.updated_at = datetime.datetime.utcnow()
        jupyter_server.save()
        jupyter_project.server_size_changed_at = datetime.datetime.now()
        jupyter_project.save()

        return HTTP_204_NO_CONTENT, {}

    def resumeJupyterServer(self, token, instanceId):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : resumeJupyterServer \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        jupyter_server = self.dbClass.getOneJupyterServerByInstanceId(instanceId)
        jupyter_project = self.dbClass.getOneJupyterProjectById(jupyter_server.jupyterProject, raw=True)

        if jupyter_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : resumeJupyterServer \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        if jupyter_server.status != 0:
            raise ex.NotAvailableServerStatusEx

        if self.utilClass.configOption != 'enterprise':
            if jupyter_server.updated_at + datetime.timedelta(minutes=10) > datetime.datetime.utcnow():
                raise ex.NotAvailableServerStatusEx

        try:
            ec2 = self.utilClass.getBotoClient('ec2', region_name=jupyter_server.region)
            ec2.start_instances(InstanceIds=[instanceId])
            self.dbClass.createInstanceLog({"execute_from": "backend", "instanceId": instanceId,
                                            "action": "start_jupyter", "region": jupyter_server.region,
                                            "jupyterServer": jupyter_server.id, "jupyterProject": jupyter_project.id,
                                            "user": user.id})
            self.utilClass.sendSlackMessage(
                f"{jupyter_server.region} {instanceId} : Jupyter 서버를 시작합니다. ({user.id})",
                server_status=True)
        except:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : resumeJupyterServer \nec2 제거 실패 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            pass

        jupyter_server.status = 1
        jupyter_server.updated_at = datetime.datetime.utcnow()
        jupyter_server.save()
        jupyter_project.server_size_changed_at = datetime.datetime.utcnow()
        jupyter_project.save()

        return HTTP_204_NO_CONTENT, {}

    def addJupyterJob(self, token, file, filename, jupyter_server_id):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : createJupyterJob \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        jupyter_project = self.dbClass.getOneJupyterProjectById(jupyter_server_id, raw=True)

        if jupyter_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageJupyter.py \n함수 : createJupyterJob \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        self.s3.put_object(Body=file, Bucket=self.utilClass.bucket_name, Key=f"user/{user['id']}/{filename}")
        s3Url = urllib.parse.quote(
            f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{user["id"]}/{filename}').replace(
            'https%3A//', 'https://')

        if self.utilClass.configOption == 'enterprise':
            s3Url = f"{self.utilClass.save_path}/user/{user['id']}/{filename}"

        data = {
            "name": "jupyter job",
            "status": 0,
            "filePath": s3Url,
            "jupyterProject": jupyter_project.id,
            "jupyterServer": jupyter_server_id,
        }

        return HTTP_201_CREATED, self.dbClass.createJupyterJob(data).__dict__['__data__']

    def getJupyterProjectsById(self, token, sorting, start, count, tab, desc, searching, isShared = False):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageJupyter.py \n함수 : getJupyterProjectsById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        projects = [x.__dict__['__data__'] for x in
                    self.dbClass.getProjectsByUserId(jupyterProjectsTable, user['id'], sorting, tab, desc, searching, start, count)]
        totalLength = self.dbClass.getProjectStatusCountByFolderId(jupyterProjectsTable, user['id'], searching)
        for project in projects:
            project['jupyterServers'] = [x.__dict__['__data__'] for x in self.dbClass.getJupyterServersByJupyterProjectId(project['id'])]


        result = {'projects' : projects, 'totalLength' : totalLength}

        return HTTP_200_OK, result

if __name__ == "__main__" :
    manageJupyter = ManageJupyter()
    # manageJupyter.run('FL_insurance_sample.csv')


