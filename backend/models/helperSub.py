import bcrypt
from playhouse.shortcuts import model_to_dict
from models import *
import functools

class HelperSub():

    def __init__(self, init=False):
        ""
        # if init:
        #     skyhub.connect(reuse_if_open=True)

    def __exit__(self, exc_type, exc_value, traceback):

        if not skyhub.is_closed():
            skyhub.close()

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
    def getOneUsageplanById(self, id):
        return usageplansTable.get(usageplansTable.id == id).__dict__['__data__']

    @wrapper
    def getProjectsByStatusAndPlan(self, status, planOption, checkAvailablity=False):
        projectsRaw = projectsTable.select().where(projectsTable.status == status).execute()
        projects = []
        for projectRaw in projectsRaw:
            project = projectRaw.__dict__['__data__']
            try:
                if project.get('option', '') == 'colab':
                    continue
                if checkAvailablity:
                    projects.append(project)
                    continue
                try:
                    user = usersTable.get(usersTable.id == project['user']).__dict__['__data__']
                except:
                    projectRaw.status = 99
                    projectRaw.save()
                    continue
                    pass
                # if not user['usageplan']:
                #     user['usageplan'] = usageplansTable.get(usageplansTable.planName == 'basic').__dict__['__data__']['id']
                # user_usagePlan = usageplansTable.get(usageplansTable.id == user['usageplan']).__dict__['__data__']
                # instancesCount = instancesUsersTable.select().where((instancesUsersTable.user_id == user['id']) & ((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None))).count()
                # userInstanceCount = 1 if "basic" in user_usagePlan['planName'] else user['dynos']
                # if userInstanceCount > instancesCount and planOption in user_usagePlan['planName']:
                projects.append(project)
            except:
                projects.append(project)
                pass

        return projects

    @wrapper
    def getTotalDyno(self, planOption):

        dyno = 0

        if planOption == 'basic':
            dyno = 0

        else:
            alreadyAllocatedUsers = instancesUsersTable.select().where(
                (instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None)).execute()

            userArray = []

            alreadyAllocatedUsersDict = {}

            for alreadyAllocatedUser in alreadyAllocatedUsers:
                if not alreadyAllocatedUsersDict.get(alreadyAllocatedUser.user_id):
                    alreadyAllocatedUsersDict[alreadyAllocatedUser.user_id] = 0
                alreadyAllocatedUsersDict[alreadyAllocatedUser.user_id] += 1

            projectsRaw = projectsTable.select(projectsTable.id, projectsTable.status, projectsTable.user,
                                               projectsTable.option).distinct().where(
                (projectsTable.status == 31) |
                (projectsTable.status == 51) |
                (projectsTable.status == 61) |
                (projectsTable.status == 21) |
                (projectsTable.status == 11) |
                (projectsTable.status == 1)).execute()
            for projectRaw in projectsRaw:
                try:
                    project = projectRaw.__dict__['__data__']
                    if 'colab' in project.get('option', ''):
                        continue
                    if project["status"] == 11 or project["status"] == 31 or project["status"] == 61:
                        if not modelsTable.get_or_none((modelsTable.status == 0) & (modelsTable.project == project["id"])):
                            continue
                    user = usersTable.get(usersTable.id == project['user']).__dict__['__data__']
                    if not user['usageplan']:
                        continue
                    # if user['isTest']:
                    #     continue

                    user_usagePlan = usageplansTable.get(usageplansTable.id == user['usageplan']).__dict__['__data__']
                    if "business" in user_usagePlan['planName'] and user['id'] not in userArray:
                        dyno += user['dynos']
                        dyno -= alreadyAllocatedUsersDict.get(user['id'], 0)
                        userArray.append(user['id'])
                except:
                    print(f"프로젝트 유저 할당 에러 : {projectRaw.id}")
                    print(traceback.format_exc())
                    projectRaw.status = 99
                    projectRaw.save()
                    pass

        return dyno

    @wrapper
    def deleteTestrows(self):
        usersTable.delete().where(usersTable.isTest == 1).execute()
        projectsTable.delete().where(projectsTable.isTest == 1).execute()
        instancesTable.delete().where(instancesTable.isTest == 1).execute()
        instancesUsersTable.delete().where(instancesUsersTable.isTest == 1).execute()

    @wrapper
    def checkValidEmail(self, email):
        return usersTable.get_or_none(usersTable.email == email)

    @wrapper
    def getPromotionByPromotionId(self, promotionId):
        return promotionsTable.get(promotionsTable.id == promotionId).__dict__['__data__']

    @wrapper
    def getPromotionIdByPromotionCode(self, userDict):
        for promotion in promotionsTable.select():
            try:
                if bcrypt.checkpw((userDict['email'] + "_" + promotion.promotionCode).encode(),
                                  userDict['promotionCode'].encode()):
                    return promotion
            except:
                pass
        return None

    @wrapper
    def getInstanceUserByInstanceName(self, instanceName):
        where = ((instancesTable.instanceName == instanceName) & (((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None))))
        return instancesUsersTable.select() \
            .join(instancesTable, on=(instancesTable.id == instancesUsersTable.instance_id)) \
            .where(where)

    @wrapper
    def getInstanceUserCountByInstanceName(self, instanceName):
        where = ((instancesUsersTable.instance_id == instanceName) & (((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None))))
        return instancesUsersTable.select().where(where).count()

    @wrapper
    def getInstanceUserNotReturnedAfterStarting1hourByInstanceName(self, instanceName):
        return instancesUsersTable.select() \
            .join(instancesTable, on=(instancesTable.id == instancesUsersTable.instance_id)) \
            .where((instancesTable.instanceName == instanceName)
                   & (((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None)))
                   & (instancesUsersTable.updated_at < datetime.datetime.utcnow() - datetime.timedelta(hours=1)))

    @wrapper
    def getFolderSubByFolderId(self, folderId):
        return foldersubsTable.select().where(foldersubsTable.folderId == folderId).execute()

    @wrapper
    def getFolderSubBySubFolderId(self, subFolderId):
        return foldersubsTable.select().where(foldersubsTable.subFolderId == subFolderId)

    @wrapper
    def getFolderSubDetailByFolderId(self, folderId):
        return foldersTable.select() \
            .join(foldersubsTable, on=(foldersubsTable.subFolderId == foldersTable.id)) \
            .where(foldersubsTable.folderId == folderId)

    def getDailyAutoCreateProjectDatasets(self):
        return datasetsTable.select() \
            .where((datasetsTable.lastGenerateProjectDatetime + datetime.timedelta(days=1) < datetime.datetime.utcnow()) &
                   (datasetsTable.repeatAmpm.is_null(False)) &
                   (datasetsTable.repeatHour.is_null(False)))

    def getWeeklyAutoCreateProjectDatasets(self):
        return datasetsTable.select() \
            .where(
            (datasetsTable.lastGenerateProjectDatetime + datetime.timedelta(days=7) < datetime.datetime.utcnow()) &
            (datasetsTable.repeatAmpm.is_null(False)) &
            (datasetsTable.repeatHour.is_null(False)) &
            (datasetsTable.repeatDays.is_null(False))
        )

    def get_user_count(self):
        count = usersTable.select().where((usersTable.isDeleteRequested == None) | (usersTable.isDeleteRequested == 0)).count()
        return count

    def getUserCountInfo(self, token):
        return usersTable.select(usersTable.cumulativePredictCount,
            usersTable.cumulativeProjectCount,
            usersTable.cumulativeDiskUsage,
            usersTable.totalDiskUsage,
            usersTable.additionalApiRate,
            usersTable.additionalShareUser,
            usersTable.additionalProjectCount,
            usersTable.additionalPredictCount,
            usersTable.additionalDiskUsage,
            usersTable.additionalLabelCount,
            usersTable.cumulativeLabelCount,
            usersTable.remainProjectCount,
            usersTable.remainPredictCount,
            usersTable.remainDiskUsage).where(usersTable.token == token).execute()

    def getUserSettingInfofromToken(self, token):
        return usersTable.select(usersTable.id,
        usersTable.company,
        usersTable.companyLogoUrl,
        usersTable.dynos,
        usersTable.nextDynos,
        usersTable.nextPlan,
        usersTable.nextPaymentDate).where(usersTable.token == token).execute()

    def removeNotStartedModels(self, projectInfo):
        for model in modelsTable.select().where((modelsTable.status == 0) & (modelsTable.project == projectInfo['id'])):
            model.delete_instance()

    def getAllProjectsByUserId(self, userId):
        return projectsTable.select().where(projectsTable.user == userId).execute()

    @wrapper
    def isUserHavingExceedPredictCountByAppToken(self, appToken, cnt = 0):
        user = usersTable.get(usersTable.appTokenCode == appToken).__dict__['__data__']
        additionalPredictCount = user['additionalPredictCount'] if user['additionalPredictCount'] else 0
        if isinstance(user['usageplan'], int):
            user['usageplan'] = self.getOneUsageplanById(user['usageplan'])
        predictCount = int(user['usageplan']['noOfPrediction']) if "basic" in user['usageplan']['planName'] \
            else int(user['usageplan']['noOfPrediction']) * user['dynos']

        return user['cumulativePredictCount'] + cnt > predictCount + user['remainPredictCount'] + additionalPredictCount

    @wrapper
    def get_voucher_users_by_user_id(self, user_id, is_recharge=None, is_used=True, order_by='id'):
        today = datetime.datetime.today()

        if user_id is None:
            where = (1 == 1)
        else:
            where = (voucherUsersTable.user == user_id)

        if is_used is None:
            pass
        elif is_used:
            where = where & (voucherUsersTable.start_date <= today) & (voucherUsersTable.end_date >= today)
        elif not is_used:
            where = where & (voucherUsersTable.start_date > today) | (voucherUsersTable.end_date < today)

        if is_recharge is not None:
            where = where & (voucherUsersTable.is_recharge == is_recharge)

        if order_by == 'id':
            return voucherUsersTable.select().where(where).order_by(voucherUsersTable.id.asc()).execute()
        elif order_by == 'voucher_type':
            return voucherUsersTable.select().where(where).order_by(voucherUsersTable.voucher_type.asc(), voucherUsersTable.id.asc()).execute()
        elif order_by == 'start_date':
            return voucherUsersTable.select().where(where).order_by(voucherUsersTable.start_date.asc(), voucherUsersTable.id.asc()).execute()
        elif order_by == 'end_date':
            return voucherUsersTable.select().where(where).order_by(voucherUsersTable.end_date.asc(), voucherUsersTable.id.asc()).execute()
        else:
            return voucherUsersTable.select().where(where).execute()

    @wrapper
    def get_one_voucher_user_by_id(self, id):

        return voucherUsersTable.get_or_none(voucherUsersTable.id == id)

    @wrapper
    def get_one_voucher_user_by_email(self, email):

        return voucherUsersTable.select().join(usersTable, on=(voucherUsersTable.user == usersTable.id)).where(usersTable.email == email).execute()

    @wrapper
    def isUserHavingExceedPredictCount(self, modelId):
        users = usersTable.select() \
            .join(projectsTable, on=(projectsTable.user == usersTable.id)) \
            .join(modelsTable, on=(modelsTable.project == projectsTable.id)) \
            .where(modelsTable.id == modelId).execute()
        user = users[0].__dict__['__data__']
        if isinstance(user['usageplan'], int):
            user['usageplan'] = self.getOneUsageplanById(user['usageplan'])
        additionalPredictCount = user['additionalPredictCount'] if user['additionalPredictCount'] else 0
        predictCount = int(user['usageplan']['noOfPrediction']) if "basic" in user['usageplan']['planName'] \
            else int(user['usageplan']['noOfPrediction']) * user['dynos']

        return user['cumulativePredictCount'] + 1 > predictCount + user['remainProjectCount'] + additionalPredictCount

    @wrapper
    def isUserHavingExceedLabelCount(self, user):
        if isinstance(user['usageplan'], int):
            user['usageplan'] = self.getOneUsageplanById(user['usageplan'])
        labelCount = int(user['usageplan']['noOfLabelling']) + int(user['additionalLabelCount'] if user['additionalLabelCount'] else 0)\
            if "basic" in user['usageplan']['planName'] \
            else (int(user['usageplan']['noOfLabelling'])  * user['dynos']) + int(user['additionalLabelCount'] if user['additionalLabelCount'] else 0)
        if not user['cumulativeLabelCount']:
            user['cumulativeLabelCount'] = 0
        return user['cumulativeLabelCount'] + 1 > labelCount + user['remainLabelCount']


    @wrapper
    def isUserHavingExceedDiskUsage(self, user, filesize = 0):
        if isinstance(user['usageplan'], int):
            user['usageplan'] = self.getOneUsageplanById(user['usageplan'])
        diskUsage = int(user['usageplan']['storage']) if "basic" in user['usageplan']['planName'] \
            else int(user['usageplan']['storage']) * user['dynos']
        return user['cumulativeDiskUsage'] + filesize > diskUsage + user['remainDiskUsage']

    @wrapper
    def isUserHavingTotaldDiskUsage(self, user, filesize = 0):
        additionalDiskUsage = user['additionalDiskUsage'] if user['additionalDiskUsage'] else 0

        if isinstance(user['usageplan'], int):
            user['usageplan'] = self.getOneUsageplanById(user['usageplan'])
        diskUsage = int(user['usageplan']['storage']) * 1073741824 if "basic" in user['usageplan']['planName'] \
            else int(user['usageplan']['storage']) * 1073741824 * user['dynos']

        return user['totalDiskUsage']+ filesize > diskUsage  + user['remainDiskUsage'] + additionalDiskUsage

    @wrapper
    def isUserHavingExceedProjectCount(self, user):
        if isinstance(user['usageplan'], int):
            user['usageplan'] = self.getOneUsageplanById(user['usageplan'])
        projectCount = int(user['usageplan']['projects']) + int(user['additionalProjectCount'] if user['additionalProjectCount'] else 0)\
            if "basic" in user['usageplan']['planName'] \
            else (int(user['usageplan']['projects'])  * user['dynos']) + int(user['additionalProjectCount'] if user['additionalProjectCount'] else 0)
        return user['cumulativeProjectCount'] + 1 > projectCount + user['remainProjectCount']

    @wrapper
    def getErrorProjectCountInOneDay(self, user):
        return projecthistoriesTable.select().where((projecthistoriesTable.status == 99) & (projecthistoriesTable.user == user["id"]) & (projecthistoriesTable.updated_at > datetime.datetime.utcnow() - datetime.timedelta(days=1))).count()

    @wrapper
    def isUserHavingExceedErrorProjectCount(self, user):
        errorProjectCountInOneDay = self.getErrorProjectCountInOneDay(user)
        return errorProjectCountInOneDay > 10

    @wrapper
    def getOnetimestampfromUserId(self, userId):
        return pgpaymenthistoriesTable.select().where(pgpaymenthistoriesTable.user == userId).order_by(pgpaymenthistoriesTable.id.desc()).get().__dict__['__data__']

    @wrapper
    def createNotionTask(self, data):
        return notiontasksTable.create(**(data))

    @wrapper
    def getNotiontaskByPidAndAssign(self, pid, assign):
        return notiontasksTable.select().where((notiontasksTable.pid == pid) * (notiontasksTable.assign == assign)).get()

    @wrapper
    def get_price_with_pricing_id(self, pricing_id, raw=False):
        data = pricingTable.get_or_none(pricingTable.id == pricing_id)
        return data if raw else model_to_dict(data)

    @wrapper
    def get_price_with_pricing_name(self, pricing_name, raw=False):
        data = pricingTable.get_or_none(pricingTable.name == pricing_name)
        return data if raw else model_to_dict(data)

    @wrapper
    def get_market_usages(self, user_id, raw=True):
        if raw:
            datas = marketUsagesTable.select().where(marketUsagesTable.user == user_id).execute()
        else:
            datas = marketUsagesTable.select().where(marketUsagesTable.user == user_id).dics()
        return datas

    @wrapper
    def get_market_usage(self, user_id, model_id, req_id=None, raw=False):
        where = ((marketUsagesTable.user == user_id) & (marketUsagesTable.marketModelId == model_id))
        if req_id:
            where = ((marketUsagesTable.user == user_id) & (marketUsagesTable.marketModelId == model_id) & (marketUsagesTable.marketReqId == req_id))
        data = marketUsagesTable.get_or_none(where)
        if not data:
            data = marketUsagesTable.create(**{
                "user": user_id,
                "marketModelId": model_id,
                "marketReqId": req_id,
                "inferenceCount": 0,
            })
        return data if raw else model_to_dict(data)

    @wrapper
    def get_Amount_history_by_user_id(self, user_id, year, month):
        where = ((usedamounthistoriesTable.user == user_id) &
                 (usedamounthistoriesTable.paidYear == year) &
                 (usedamounthistoriesTable.paidMonth == month))
        data = usedamounthistoriesTable.get_or_none(where)
        if data:
            return model_to_dict(data)
        else:
            return data

    @wrapper
    def get_postpaid_payment_history_by_user_id(self, user_id, year, month):
        where = ((pgpaymenthistoriesTable.user == user_id) &
                 (pgpaymenthistoriesTable.PCD_PAY_YEAR == year) &
                 (pgpaymenthistoriesTable.PCD_PAY_MONTH == month) &
                 (pgpaymenthistoriesTable.PCD_PAY_TYPE == 'postpaid'))
        data = pgpaymenthistoriesTable.get_or_none(where)
        if data:
            return model_to_dict(data)
        else:
            return data

    @wrapper
    def get_Amount_history_by_id(self, id):
        where = (usedamounthistoriesTable.id == id)
        data = usedamounthistoriesTable.get_or_none(where)
        return data

    @wrapper
    def get_movie_statistics(self, marketprojectId):
        return movieStatisticsTable.select().where(movieStatisticsTable.marketproject == marketprojectId)

    @wrapper
    def getTrainingSubServers(self):
        return trainingServerTable.select().where(((trainingServerTable.is_main == None) | (trainingServerTable.is_main == False)) & ((trainingServerTable.is_deleted == None) | (trainingServerTable.is_deleted == False)))

    @wrapper
    def getOneTrainingServer(self, rowId, raw=False):
        data = trainingServerTable.get_or_none(trainingServerTable.id == rowId)
        if data:
            return data.__dict__['__data__'] if not raw else data
        return data


    @wrapper
    def getOneTrainingServerByName(self, name, raw=False):
        data = trainingServerTable.get_or_none((trainingServerTable.name == name & trainingServerTable.is_deleted != True))
        if data:
            return data.__dict__['__data__'] if not raw else data
        return data

    @wrapper
    def getOneTrainingServerByIP(self, ip, raw=False):
        data = trainingServerTable.get_or_none((trainingServerTable.ip == ip & trainingServerTable.is_deleted != True))
        if data:
            return data.__dict__['__data__'] if not raw else data
        return data

    @wrapper
    def getGenKeywordHistories(self):
        return genKeywordHistoriesTable.select().execute()

    @wrapper
    def getLastNotification(self):
        return notificationTable.select().order_by(notificationTable.id.desc()).get_or_none()

    @wrapper
    def getSystemInfo(self):
        return systemInfoTable.select().order_by(systemInfoTable.id.desc()).get_or_none()
