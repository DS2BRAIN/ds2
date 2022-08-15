import ast
import datetime
import io
import json
import random
import shutil
import time
import traceback

import pandas as pd
import os

from pytz import timezone
import requests
from playhouse.shortcuts import model_to_dict
from starlette.responses import StreamingResponse
from models import opsProjectsTable
from src.collecting.connectorHandler import ConnectorHandler
from src.util import Util
from models.helper import Helper, serverPricingTable
from starlette.status import HTTP_200_OK, HTTP_204_NO_CONTENT, HTTP_201_CREATED
from src.errorResponseList import NOT_FOUND_USER_ERROR, NOT_ALLOWED_TOKEN_ERROR, NOT_ALLOWED_INPUT_ERROR, \
    PERMISSION_DENIED_CONNECTOR_ERROR, \
    NON_EXISTENT_CONNECTOR_ERROR, MIN_DATA_ERROR, NORMAL_ERROR, ErrorResponseList, KEY_FIlE_INFO_ERROR, PIL_IOERROR, \
    TOO_MANY_ERROR_PROJECT, EXCEED_PROJECT_ERROR, USER_ERROR, GET_MODEL_ERROR, EXCEED_SERVER_ERROR, \
    ALREADY_DELETED_OBJECT
from src.errors import exceptions as ex

errorResponseList = ErrorResponseList()

#TODO: 숫자 헤더면 바꿔줘야됨
class ManageOps:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.opsClass = None
        if os.path.exists('src/creating/ops.py'):
            from src.creating.ops import Ops
            self.opsClass = Ops()

        self.s3 = self.utilClass.getBotoClient('s3')
        self.ec2 = self.utilClass.getBotoClient('ec2')
        self.cloudwatch = self.utilClass.getBotoClient('cloudwatch')
        pd.options.display.float_format = '{:.5f}'.format

    def createOpsProject(self, token, ops_project_object):
        if self.utilClass.configOption != 'enterprise' and not 'g4dn' in ops_project_object.serverType:
            raise ex.NotAllowedServerSizeEx
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageOps.py \n함수 : createOpsProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        # if self.utilClass.configOption != 'enterprise' and user.isTest:
        #     self.utilClass.sendSlackMessage(
        #         f"파일 : manageOps.py \n함수 : createOpsProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
        #         appError=True, userInfo=user)
        #     return NOT_ALLOWED_TOKEN_ERROR

        if self.dbClass.isUserHavingExceedErrorProjectCount(user.__dict__['__data__']):
            self.utilClass.sendSlackMessage(f"유저 ID : {user.id} - 오류 프로젝트를 지나치게 많이 생성하고 있으니 조치바랍니다.", inquiry=True, userInfo=user)
            return TOO_MANY_ERROR_PROJECT

        if self.dbClass.isUserHavingExceedProjectCount(user.__dict__['__data__']):
            self.utilClass.sendSlackMessage(
                f"csv Parse - run() \n프로젝트 사용량 초과입니다 {user['email']} (ID: {user['id']})",
                appLog=True, userInfo=user)
            return EXCEED_PROJECT_ERROR

        # return  # EBS

        if self.utilClass.configOption != 'enterprise':

            serverPricingInfo = self.dbClass.getServerPricingByServerTypeAndRegion(ops_project_object.serverType, ops_project_object.region)

            aliveCount = 0
            ops_projects = self.dbClass.getOpsProjectsByUserId(user.id)
            for ops_project in ops_projects:
                if ops_project.status and ops_project.status > -1 and not ops_project.isDeleted:
                    aliveCount += 1

            if aliveCount > 4:
                raise ex.ExceedProjectAmountEx

        model_raw = self.dbClass.getOneModelById(ops_project_object.modelId)
        project_raw = self.dbClass.getOneProjectById(model_raw['project'])
        project_raw['project'] = project_raw['id']
        project_raw['model'] = model_raw['id']
        del model_raw['id']
        del project_raw['id']

        project_raw['projectName'] = ops_project_object.projectName
        project_raw['updated_at'] = datetime.datetime.utcnow()
        # project_raw['serverType'] = "t2.xlarge" #TEST
        # # project_raw['serverType'] = ops_project_object.serverType
        # # project_raw['region'] = ops_project_object.region
        # project_raw['region'] = "ap-northeast-2" #TEST
        # project_raw['minServerSize'] = ops_project_object.minServerSize if ops_project_object.minServerSize else 1
        # project_raw['maxServerSize'] = ops_project_object.maxServerSize if ops_project_object.maxServerSize else 1
        # project_raw['startServerSize'] = ops_project_object.startServerSize if ops_project_object.startServerSize else 1

        ops_project = self.dbClass.createOpsProject(project_raw)
        model_raw['opsProject'] = ops_project.id
        model_raw['status'] = 0
        ops_model = self.dbClass.createOpsModel(model_raw)
        ops_project.opsModel = ops_model.id

        ops_sever_group_raw = {
            'serverType': ops_project_object.serverType,
            'region':  ops_project_object.region,
            'minServerSize': ops_project_object.minServerSize if ops_project_object.minServerSize else 1,
            'maxServerSize': ops_project_object.maxServerSize if ops_project_object.maxServerSize else 1,
            'startServerSize': ops_project_object.startServerSize if ops_project_object.startServerSize else 1,
            'opsProject': ops_project.id,
            'status': 100,
        }

        if self.utilClass.configOption != 'enterprise':
            ops_server_group = self.dbClass.createOpsServerGroup(ops_sever_group_raw)
            self.opsClass.createOps(ops_server_group, user.id, ops_project=ops_project)

        # if not ops_project.labelproject:
        ops_dataconnector = self.dbClass.createDataconnector({
            "dataconnectorName": f"Dataconnector for Ops {ops_project.id}",
            "user": user.id,
        })
        # folder_id = self.add_folder(user['id'], f"Label project for Ops {ops_project.id}")
        ops_label_project = self.dbClass.createLabelProject({
            "user": user.id,
            # "folder": folder_id,
            "status": 100,
            "dataconnectorsList": [ops_dataconnector.id],
            "workapp": ops_project.trainingMethod,
            "last_updated_at": datetime.datetime.utcnow(),
            "name": f"Label project for Ops {ops_project.id}",
        })

        label_classes_raw = ops_project.yClass

        try:
            label_classes_raw = ast.literal_eval(label_classes_raw)
        except:
            pass

        if label_classes_raw:
            for label_class_raw in label_classes_raw:
                color = self.get_random_hex_color()
                data = {'name': label_class_raw, 'color': color, 'labelproject': ops_label_project.id}
                self.dbClass.createLabelclass(data)

        ops_project.labelproject = ops_label_project.id
        ops_project.dataconnector = ops_dataconnector.id
        ops_project.save()

        result = ops_project.__dict__['__data__']
        result["model"] = ops_model.__dict__['__data__']
        # result["server"] = ops_server.__dict__['__data__']

        self.utilClass.sendSlackMessage(
            f"OPS 프로젝트를 생성하였습니다. {user.email} (ID: {user.id}) ,(OPS ID: {ops_project.id})",
            appLog=True, userInfo=user, server_status=True)

        return HTTP_200_OK, result

    def get_random_hex_color(self):
        random_number = random.randint(0, 16777215)
        hex_number = format(random_number, 'x')
        hex_number = '#' + hex_number
        return hex_number

    def temp(self):

        ec2 = self.utilClass.getBotoClient('ec2')
        client = self.utilClass.getBotoClient('ce', region_name=None)
        # cost_categories = client.get_cost_categories(TimePeriod={
        #         'Start': '2021-05-10',
        #         'End': '2021-05-21'
        #     },)
        # tags = client.get_tags(TimePeriod={
        #         'Start': '2021-05-22',
        #         'End': '2021-05-22'
        #     })

        response = client.get_cost_and_usage(
            TimePeriod={
                'Start': '2021-05-10',
                'End': '2021-05-21'
            },
            Metrics=['AmortizedCost','UsageQuantity','UnblendedCost'],
            Granularity='MONTHLY',
            # GroupBy=[
            #         {
            #             'Type': 'TAG',
            #             'Key': 'userId'
            #         },
            #     ],
            Filter={
                'Dimensions': {
                                 'Key': 'SERVICE',
                                 'Values': [
                                     'Amazon Elastic Compute Cloud - Compute',
                                 ],
                             },
                # 'Tags': {
                #     'Key': 'SERVICE',
                #     'Values': [
                #         'Amazon Elastic Compute Cloud - Compute',
                #     ],
                # },
                # 'CostCategories': {
                #     'Key': 'grouptypeCostCategory',
                #     'Values': [
                #         'gpu',
                #     ],
                #     # 'MatchOptions': [
                #     #     'CONTAINS',
                #     # ]
                # }
            }
        )
        print(response)
        #TODO: autoscaling, ... 모두 userId 태그를 매겨야됨

    def getOpsServerGroupsStatusByOpsProjectId(self, token, ops_project_id):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createProjectFromDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        ops_project = self.dbClass.getOneOpsProjectById(ops_project_id, raw=True)
        if ops_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageOps.py \n함수 : addopsservergroup \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        ops_project_dict = ops_project.__dict__['__data__']
        ops_project_dict['opsServerGroups'] = []

        for ops_server_group in self.dbClass.getOpsServerGroupsByOpsProjectId(ops_project.id):
            if ops_server_group.status != -1 or ops_server_group.updated_at + datetime.timedelta(minutes=10) > datetime.datetime.utcnow():
                ops_server_group_dict = ops_server_group.__dict__['__data__']
                ops_server_group_dict['instances'] = self.opsClass.getInstancesStatus(ops_server_group)

                ec2 = self.utilClass.getBotoClient('ec2', region_name=ops_server_group.region)
                instances = []
                instancesRaw = []
                for instanceRaw in ops_server_group_dict['instances']:
                    instancesRaw.append(instanceRaw['InstanceId'])

                if instancesRaw:

                    ec2instances = ec2.describe_instances(InstanceIds=instancesRaw)

                    for instanceInfoRaw in ec2instances["Reservations"]:
                        for instance in instanceInfoRaw["Instances"]:
                            if instance.get('PublicIpAddress'):
                                try:
                                    if requests.get(f"http://{instance['PublicIpAddress']}/inference/inferenceops{ops_project.id}/", timeout=10).status_code != 200:
                                        instance['State']['Name'] = 'pending'
                                except:
                                    instance['State']['Name'] = 'pending'
                                    pass
                            else:
                                instance['State']['Name'] = 'pending'

                            instances.append(instance)
                ops_server_group_dict['instances'] = instances
                ops_project_dict['opsServerGroups'].append(ops_server_group_dict)

        return HTTP_200_OK, ops_project_dict

        # instances = []
        # allInstances = self.ec2.describe_instances()
        # for instanceRaw in allInstances.get("Reservations", []):
        #     instance = instanceRaw.get("Instances", [{}])[0]
        #     tags = instance.get("Tags", [])
        #     isOpsInstance = False
        #     isUserInstance = False
        #     for tag in tags:
        #         if tag.get("Key") == "opsId" and tag.get("Value") == ops_project_id:
        #             isOpsInstance = True
        #         if tag.get("Key") == "userId" and tag.get("Value") == user.id:
        #             isUserInstance = True
        #     if not isOpsInstance or not isUserInstance:
        #         continue
        #
        #     instances.append(instance)
        # return HTTP_200_OK, instances

    def getOpsProject(self, token, ops_project_id):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createProjectFromDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
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

        ops_project = self.dbClass.getOneOpsProjectById(ops_project_id, raw=True)
        if ops_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageOps.py \n함수 : addopsservergroup \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        if ops_project.isDeleted:
            return ALREADY_DELETED_OBJECT

        ops_project_dict = ops_project.__dict__['__data__']
        ops_project_dict['opsServerGroups'] = []

        for ops_server_group in self.dbClass.getOpsServerGroupsByOpsProjectId(ops_project.id):
            if ops_server_group.status != -1 or ops_server_group.updated_at + datetime.timedelta(minutes=10) > datetime.datetime.utcnow():
                ops_server_group_dict = ops_server_group.__dict__['__data__']
                instances_temp = self.opsClass.getInstancesStatus(ops_server_group)
                # ops_server_group_dict['instances'] = self.opsClass.getInstancesStatus(ops_server_group)
                ec2 = self.utilClass.getBotoClient('ec2', region_name=ops_server_group.region)
                instances = []
                instancesRaw = []
                is_need_to_reboot = False

                for instanceRaw in instances_temp:
                    instancesRaw.append(instanceRaw['InstanceId'])

                if instancesRaw:

                    ec2instances = ec2.describe_instances(InstanceIds=instancesRaw)
                    for instanceInfoRaw in ec2instances["Reservations"]:
                        for instance in instanceInfoRaw["Instances"]:

                            try:
                                if instance.get('State', {}).get('Name') == 'running' and ops_server_group.lifecycleState == None:
                                    is_need_to_reboot = True
                            except:
                                print(traceback.format_exc())
                                pass

                            if instance.get('PublicIpAddress'):
                                try:
                                    if requests.get(f"http://{instance['PublicIpAddress']}/inference/inferenceops{ops_project.id}/", timeout=10).status_code != 200:
                                        instance['State']['Name'] = 'pending'
                                except:
                                    instance['State']['Name'] = 'pending'
                                    pass
                            else:
                                instance['State']['Name'] = 'pending'

                            instances.append(instance)

                if is_need_to_reboot and not ops_server_group.lifecycleState:
                    ops_server_group.lifecycleState = 1
                    ops_server_group.save()
                    try:
                        time.sleep(240)
                        ops_server_group = self.dbClass.getOneOpsServerGroupById(ops_server_group.id)
                        if not ops_server_group.lifecycleState:
                            ec2.reboot_instances(InstanceIds=instancesRaw)
                    except:
                        print(traceback.format_exc())
                        pass

                ops_server_group_dict['instances'] = instances
                ops_project_dict['opsServerGroups'].append(ops_server_group_dict)



        # ops_project['servers'] = self.dbClass.getOpsServerGroupsByOpsProjectId(ops_project.id).__dict__ #TODO: 비용 부과 방식에 따라 OPSserver를 살릴지 여부 결정

        dataconnectorsList = []
        if ops_project_dict['valueForPredict'] != 'label' and ops_project_dict['dataconnectorsList']:
            for dataconnectorId in ops_project_dict['dataconnectorsList']:
                # dataconnector = self.dbClass.getOneDataconnectorById(dataconnectorId).__dict__['__data__']
                dataconnector = self.dbClass.getOneDataconnectorById(dataconnectorId)
                dataconnector.dataconnectortype = self.dbClass.getOneDataconnectortypeById(
                    dataconnector.dataconnectortype)
                # dataconnector['dataconnectortype'] = \
                # self.dbClass.getOneDataconnectortypeById(dataconnector['dataconnectortype']).__dict__['__data__']

                if ops_project_dict['status'] == 0:  # 프로젝트 시작 전
                    # Column 정보 업데이트 필요
                    if dataconnector.dataconnectortype.authType == 'db' and dataconnector.keyFileInfo:
                        connector = ConnectorHandler(method='JDBC', dictionary=dataconnector.keyFileInfo)

                        # Verify
                        isVerify, columnInfos, message = connector.verify()
                        if not isVerify:
                            self.utilClass.sendSlackMessage(
                                f"파일 : manageProject.py \n함수 : getProjectById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                appError=True, userInfo=user)
                            return NOT_FOUND_USER_ERROR

                        try:
                            summaries, sampleData = connector.summary()
                            existDatacolumns = self.dbClass.getDatacolumnsByDataconnectorId(dataconnector.id)
                            for existDatacolumn in existDatacolumns:
                                existDatacolumn.delete_instance()

                            for i, column in enumerate(summaries):
                                dataObject = {**column,
                                              # "index": str(i + 1),
                                              "dataconnector": dataconnector.id if dataconnector else None,
                                              }

                                self.dbClass.createDatacolumn(dataObject)

                            dataconnector.sampleData = sampleData

                        except Exception as e:
                            return errorResponseList.verifyError(e.args)
                # 업데이트한 정보 저장
                dataconnector.save()
                dataconnector = dataconnector.__dict__['__data__']
                del dataconnector['dbPassword']
                dataconnector['datacolumns'] = [x.__dict__['__data__'] for x in
                                                self.dbClass.getDatacolumnsByDataconnectorId(dataconnector['id'])]
                dataconnector['sampleData'] = dataconnector['sampleData'].replace("NaN", "None")
                if dataconnector['datacolumns']:
                    for column in dataconnector['datacolumns']:
                        if not column["uniqueValues"]:
                            continue
                        for uniqueValues in column["uniqueValues"]:
                            if uniqueValues != uniqueValues:
                                column["uniqueValues"][column["uniqueValues"].index(uniqueValues)] = None
                dataconnectorsList.append(dataconnector)

                ops_project_dict['dataconnectorsList'] = dataconnectorsList

        ops_project_dict['model'] = self.dbClass.getOneModelById(ops_project.model)
        ops_project_dict['opsModelInfo'] = self.dbClass.getOneOpsModelById(ops_project.opsModel)
        ops_project_dict['opsServerGroupsInfo'] = [x.__dict__['__data__'] for x in self.dbClass.getOpsServerGroupsByOpsProjectId(ops_project_dict['id'])]

        return HTTP_200_OK, ops_project_dict


    def getOpsModelById(self, token, modelId):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject.py \n함수 : getModelById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        model = self.dbClass.getOneOpsModelById(modelId)
        project = self.dbClass.getOneOpsProjectById(model['opsProject'])

        if project['option'] == 'colab':
            for keyName in ['visionModel','lossFunction', 'usingBert', 'objectDetectionModel','filePath']:
                del model[keyName]
        else:
            for keyName in ['epoch', 'learningRateFromFit', 'layerDeep', 'layerWidth', 'dropOut', 'visionModel',
                            'lossFunction', 'usingBert', 'objectDetectionModel', 'filePath']:
                del model[keyName]

        model['valueForPredict'] = project['valueForPredict']
        model['trainingMethod'] = project['trainingMethod']
        model['hasTextData'] = project['hasTextData']
        model['hasImageData'] = project['hasImageData']
        model['hasTimeSeriesData'] = project['hasTimeSeriesData']

        if project['user'] == user['id']:
            return HTTP_200_OK, model
        elif project.get('isSample'):
            return HTTP_200_OK, model
        else:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject\n 함수: getModelById \ngetModelById이 존재하지 않음 = 모델 : {modelId} token: {token})",
                appError=True,userInfo=user)
            return GET_MODEL_ERROR

    def putOpsProject(self, token, ops_project_id, ops_project_object):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createProjectFromDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        ops_project = self.dbClass.getOneOpsProjectById(ops_project_id, raw=True)
        if ops_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageOps.py \n함수 : addopsservergroup \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        ops_project.projectName = ops_project_object.projectName
        ops_project.save()

        # ops_project = self.opsClass.editOps(ops_project, ops_project_object)

        return HTTP_200_OK, ops_project.__dict__['__data__']

    # def deleteOpsProject(self, token, ops_project_id):
    #     user = self.dbClass.getUser(token, raw=True)
    #     if not user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageFile.py \n함수 : createProjectFromDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
    #             appError=True, userInfo=user)
    #         return NOT_FOUND_USER_ERROR
    #
    #     if self.dbClass.isUserHavingExceedErrorProjectCount(user.__dict__['__data__']):
    #         self.utilClass.sendSlackMessage(f"유저 ID : {user.id} - 오류 프로젝트를 지나치게 많이 생성하고 있으니 조치바랍니다.", inquiry=True, userInfo=user)
    #         return TOO_MANY_ERROR_PROJECT
    #
    #     if self.dbClass.isUserHavingExceedProjectCount(user.__dict__['__data__']):
    #         self.utilClass.sendSlackMessage(
    #             f"csv Parse - run() \n프로젝트 사용량 초과입니다 {user['email']} (ID: {user['id']})",
    #             appLog=True, userInfo=user)
    #         return EXCEED_PROJECT_ERROR
    #
    #     ops_project = self.dbClass.getOneOpsProjectById(ops_project_id, raw=True)
    #     if ops_project.user != user.id:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageOps.py \n함수 : addopsservergroup \n권한 없는 유저 | 입력한 토큰 : {token}",
    #             appError=True, userInfo=user)
    #         return USER_ERROR
    #
    #     self.opsClass.removeOps(ops_project)
    #
    #     ops_project.delete_instance()
    #
    #     return HTTP_204_NO_CONTENT, {}

    def deleteOpsProjects(self, token, projectIdList):

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
                opsProject = self.dbClass.getOneOpsProjectById(projectId, raw=True)

                if opsProject.user != user['id']:
                    self.utilClass.sendSlackMessage(
                        f"파일 : manageUser\n 함수 : deleteProject \n허용되지 않은 토큰 값입니다. token = {token})",
                        appError=True, userInfo=user)
                    return NOT_ALLOWED_TOKEN_ERROR

                if self.utilClass.configOption != 'enterprise':
                    if opsProject.updated_at + datetime.timedelta(minutes=10) > datetime.datetime.utcnow():
                        raise ex.NotAvailableServerStatusEx

                if opsProject.status == -1:
                    raise ex.NotAvailableServerStatusEx

                opsServerGroups = self.dbClass.getOpsServerGroupsByOpsProjectId(projectId)

                for opsServerGroup in opsServerGroups:

                    self.opsClass.removeOps(opsServerGroup, opsProject)
                opsProject.isDeleted = True
                opsProject.status = -1
                opsProject.updated_at = datetime.datetime.utcnow()
                opsProject.save()
                if self.utilClass.configOption == 'enterprise':
                    try:
                        shutil.rmtree(f"{self.utilClass.save_path}/{opsProject.id}")
                    except:
                        pass

                self.utilClass.sendSlackMessage(
                    f"OPS 프로젝트를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {opsProject.projectName} (ID: {opsProject.id})",
                    appLog=True, userInfo=user, server_status=True)
                successList.append(projectId)
            except:
                failList.append(projectId)
                self.utilClass.sendSlackMessage(
                    f"OPS 프로젝트 삭제 중 실패하였습니다. {user['email']} (ID: {user['id']}) , {opsProject.projectName} (ID: {opsProject.id})",
                    appLog=True, userInfo=user, server_status=True)

        return HTTP_200_OK, {'successList':successList, 'failList':failList}

    def deleteOpsProject(self, token, opsProjectId):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        opsProject = self.dbClass.getOneOpsProjectById(opsProjectId, raw=True)

        if opsProject.user != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : deleteProject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        if self.utilClass.configOption != 'enterprise':
            if opsProject.updated_at + datetime.timedelta(minutes=10) > datetime.datetime.utcnow():
                raise ex.NotAvailableServerStatusEx

        if opsProject.status == -1:
            raise ex.NotAvailableServerStatusEx

        try:

            opsServerGroups = self.dbClass.getOpsServerGroupsByOpsProjectId(opsProjectId)

            for opsServerGroup in opsServerGroups:
                self.opsClass.removeOps(opsServerGroup, opsProject)
            if self.utilClass.configOption == 'enterprise':
                try:
                    shutil.rmtree(f"{self.utilClass.save_path}/{opsProject.id}")
                except:
                    pass

            self.utilClass.sendSlackMessage(
                f"OPS 프로젝트를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {opsProject.projectName} (ID: {opsProject.id})",
                appLog=True, userInfo=user, server_status=True)
        except:
            self.utilClass.sendSlackMessage(
                f"OPS 프로젝트 삭제 중 실패하였습니다. {user['email']} (ID: {user['id']}) , {opsProject.projectName} (ID: {opsProject.id})",
                appLog=True, userInfo=user, server_status=True)
            pass

        opsProject.isDeleted = True
        opsProject.status = -1
        opsProject.updated_at = datetime.datetime.utcnow()
        opsProject.save()

        return HTTP_204_NO_CONTENT, {}

    def getOpsServerGroupStatistic(self, token, ops_project_group_id, instance_id):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createProjectFromDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        ops_server_group = self.dbClass.getOneOpsServerGroupById(ops_project_group_id)
        ops_project = self.dbClass.getOneOpsProjectById(ops_server_group.opsProject, raw=True)

        if ops_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageOps.py \n함수 : addopsservergroup \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        image_data = self.opsClass.getServerStatisticImage(ops_server_group, ops_project, instance_id)
        return HTTP_200_OK, StreamingResponse(io.BytesIO(image_data), media_type="image/png")

    def createOpsServerGroup(self, token, ops_server):
        if not 'g4dn' in ops_server.serverType:
            raise ex.NotAllowedServerSizeEx

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageOps.py \n함수 : addopsservergroup \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        serverPricingInfo = self.dbClass.getServerPricingByServerTypeAndRegion(ops_server.serverType, ops_server.region)

        ops_project = self.dbClass.getOneOpsProjectById(ops_server.opsProjectId, raw=True)

        if ops_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageOps.py \n함수 : addopsservergroup \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR
        ops_servers_raw = self.dbClass.getOpsServerGroupsByOpsProjectId(ops_server.opsProjectId)
        ops_servers_count = 0
        for ops_server_raw in ops_servers_raw:
            if ops_server_raw.status != -1 or ops_server_raw.updated_at + datetime.timedelta(minutes=10) > datetime.datetime.utcnow():
                ops_servers_count += 1
        if ops_servers_count > 4:
            return EXCEED_SERVER_ERROR

        ops_sever_group_raw = {
            # 'serverType': ops_server.serverType,
            'serverType': 'g4dn.2xlarge',  # TEST
            'region': ops_server.region,
            'minServerSize': ops_server.minServerSize if ops_server.minServerSize and 0 < ops_server.minServerSize < 6 else 1,
            'maxServerSize': ops_server.maxServerSize if ops_server.maxServerSize and 0 < ops_server.maxServerSize < 6 else 1,
            'startServerSize': ops_server.startServerSize if ops_server.startServerSize and 0 < ops_server.startServerSize < 6 else 1,
            'opsProject': ops_server.opsProjectId,
        }
        ops_server_group = self.dbClass.createOpsServerGroup(ops_sever_group_raw)
        self.opsClass.createOps(ops_server_group, user.id)

        return HTTP_201_CREATED, ops_server_group.__dict__['__data__']

    def editOpsServerGroup(self, token, ops_server_group_id, ops_server_object):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createProjectFromDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR


        ops_server_group = self.dbClass.getOneOpsServerGroupById(ops_server_group_id)
        ops_project = self.dbClass.getOneOpsProjectById(ops_server_group.opsProject, raw=True)
        if ops_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageOps.py \n함수 : addopsservergroup \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        serverPricingInfo = self.dbClass.getServerPricingByServerTypeAndRegion(ops_server_group.serverType, ops_server_group.region)

        if ops_project.updated_at + datetime.timedelta(minutes=10) > datetime.datetime.utcnow():
            raise ex.NotAllowedChangeServerRightAfterRemoveEx

        ops_server_group = self.opsClass.editOps(ops_server_group, ops_server_object, user)

        return HTTP_200_OK, ops_server_group.__dict__['__data__']

    def removeOpsServerGroup(self, token, ops_server_group_id):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageOps.py \n함수 : removeOpsServerGroup \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        ops_server = self.dbClass.getOneOpsServerGroupById(ops_server_group_id)
        ops_project = self.dbClass.getOneOpsProjectById(ops_server.opsProject, raw=True)

        if ops_project.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageOps.py \n함수 : removeOpsServerGroup \n권한 없는 유저 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return USER_ERROR

        self.opsClass.removeOps(ops_server, ops_project)

        ops_server.status = -1
        ops_server.updated_at = datetime.datetime.utcnow()
        ops_server.save()

        return HTTP_204_NO_CONTENT, {}

    def getOpsProjectsById(self, token, sorting, start, count, tab, desc, searching, isShared = False):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageOps.py \n함수 : getOpsProjectsById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        projects = [x.__dict__['__data__'] for x in
                    self.dbClass.getProjectsByUserId(opsProjectsTable, user['id'], sorting, tab, desc, searching, start, count)]
        totalLength = self.dbClass.getProjectStatusCountByFolderId(opsProjectsTable, user['id'], searching)
        for project in projects:
            project['opsServerGroupsInfo'] = [x.__dict__['__data__'] for x in self.dbClass.getOpsServerGroupsByOpsProjectId(project['id'])]

        result = {'projects' : projects, 'totalLength' : totalLength}

        return HTTP_200_OK, result

    def get_server_pricing(self, token):

        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageOps.py \n함수 : getOpsProjectsById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        country_codes = self.dbClass.get_server_country_codes()

        result = {country_code.countryCode: [] for country_code in country_codes}
        temp_dict = {}
        for price_info in self.dbClass.get_server_pricings():
            if not temp_dict.get(price_info['region'], False):
                temp_dict[price_info['region']] = {
                    'countryCode': price_info['countryCode'],
                    'display_name': price_info['displayName'],
                    'region': price_info['region'], 'cluster': []
                }

            temp_region = price_info['region']
            del price_info['region']
            del price_info['displayName']
            del price_info['id']
            del price_info['countryCode']
            del price_info['provider']
            del price_info['localZone']
            # del price_info['isLock']
            temp_dict[temp_region]['cluster'].append(price_info)

        for key, value in temp_dict.items():
            result[temp_dict[key]['countryCode']].append(value)

        return HTTP_200_OK, result

    def sell_api(self, token, sell_api_object):
        user = self.dbClass.getUser(token, True)
        if not user:
            raise ex.NotFoundUserEx(token)

        api_price = sell_api_object.api_price
        model_price = sell_api_object.model_price
        chipset_price = sell_api_object.chipset_price
        currency = sell_api_object.currency
        api_type = sell_api_object.api_type
        model_id = sell_api_object.model_id

        message = ''
        if api_price:
            message += f"api: {api_price}{currency}, "
        if model_price:
            message += f"model: {model_price}{currency}, "
        if chipset_price:
            message += f"chipset: {chipset_price}{currency}"
        if message[-2:] == ', ':
            message = message[:-2]

        kst = timezone('Asia/Seoul')
        data = {
            f"name": f"판매요청: {api_type} Model ID: {model_id}",
            "email": user.email,
            "message": {message},
            "created_at": kst.localize(datetime.datetime.now()),
            "updated_at": kst.localize(datetime.datetime.now())
        }
        contact = self.dbClass.createContact(data)

        self.utilClass.sendSlackMessage(
            f"API 판매 의뢰가 도착했습니다. {user.email} (User ID: {user.id}), ({api_type} Model ID: {model_id}, Contact ID: {contact.id}) \n Price: {message}",
            sales=True, userInfo=user)

        return HTTP_201_CREATED, model_to_dict(contact)


if __name__ == "__main__":
    manageOps = ManageOps()
