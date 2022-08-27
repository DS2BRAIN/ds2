import datetime
import traceback
import bcrypt
import peewee
from peewee import Case
from internal.base_object import noneObject

from models import *
import functools
class HelperModel():

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

    def exchange_none_object(func):
        def wrapper(self, *args, **kwargs):
            result = func(self, *args, **kwargs)

            if result is None:
                result = noneObject()
            elif kwargs.get('raw', False) is False:
                result = result.__dict__['__data__']

            return result
        return wrapper

    @wrapper
    def getQuickAiModels(self):
        return marketModelsTable.select().where((marketModelsTable.service_type is None) & (marketModelsTable.isQuickstart == True)).execute()

    @wrapper
    def getEngineais(self):
        return marketModelsTable.select().where(marketModelsTable.isEngineAI == True).execute()

    @wrapper
    def get_industry_ais(self):
        return marketModelsTable.select().where(marketModelsTable.isIndustryAI == True).execute()

    @wrapper
    def get_label_types(self):
        return labelTypesTable.select()

    @wrapper
    def getExternalais(self):
        return externalaisTable.select().execute()

    @wrapper
    def getExternalaiKeyByUserIdAndModelName(self, userId, modelName, usageplan, isVoucher = False):
        externalAiProvider = externalaisTable.get(externalaisTable.externalAiName == modelName).provider
        if (usageplansTable.get(usageplansTable.id == usageplan).planName == 'trial') or isVoucher:
            if externalAiProvider == 'azure':
                return aistore_configs['subscription_key'], aistore_configs['azure_endpoint']
            elif externalAiProvider == 'amazon':
                return aistore_configs['aws_secret_access_key'], aistore_configs['aws_access_key_id']
        try:
            keyData = developedAiModelsTable.get((developedAiModelsTable.user == userId) & (developedAiModelsTable.modelName == modelName))
            return keyData.apiKey, keyData.additionalKey
        except:
            return None

    @wrapper
    def getExternalaiById(self, row):
        return externalaisTable.get(externalaisTable.id == row)

    @wrapper
    def getExternalaiByAiName(self, aiName):
        try:
            return externalaisTable.get(externalaisTable.externalAiName == aiName)
        except:
            None

    @wrapper
    def createDevelopedAi(self, data):
        return developedAiModelsTable.create(**(data))

    @wrapper
    def getOneDevelopedAiById(self, rawId):
        return developedAiModelsTable.get(developedAiModelsTable.id == rawId)

    @wrapper
    def getDevelopedAisByUserIdAndModeltype(self, userId, modeltype):
        try:
            return developedAiModelsTable.get((developedAiModelsTable.user == userId) & (developedAiModelsTable.modeltype == modeltype))
        except:
            return None

    @wrapper
    def updateDevelopedAiModelsTableById(self, rowId, data):
        return developedAiModelsTable.update(**data).where(
            developedAiModelsTable.id == rowId).execute()

    @wrapper
    def createDevelopedAiModels(self, data):
        return developedAiModelsTable.create(**data)

    @wrapper
    def getExternalAisByProviderName(self, providerName):
        return externalaisTable.select().where(externalaisTable.provider == providerName).execute()

    @wrapper
    def getInstanceUserByModelId(self, modelId):
        where = ((instancesTable.model_id == modelId) & (instancesTable.isDeleted != True))
        return instancesUsersTable.where(where).get()

    @wrapper
    def getModelsStarted(self):
        return modelsTable.select().where((modelsTable.status == 1) | (modelsTable.status == 11) | (modelsTable.status == 21) | (modelsTable.status == 31)).execute()

    @wrapper
    def getModelsNotStartedByProjectId(self, projectId):
        return modelsTable.select().where((modelsTable.status == 0) & (modelsTable.project == projectId)).execute()

    @wrapper
    def getModelsNotFinishedByProjectId(self, project_id):
        return modelsTable.select().where(((modelsTable.status == 0) | (modelsTable.status == 1) | (
                                                       modelsTable.status == 11) | (
                                                       modelsTable.status == 31)) & (
                                                      modelsTable.project == project_id)).execute()

    @wrapper
    def getBestModelByProjectId(self, rowId, byAccuracy=True):
        if byAccuracy:
            return modelsTable.select().where(modelsTable.project == rowId).order_by(modelsTable.accuracy.desc(),
                                                                                     modelsTable.rmse).get()
        else:
            return modelsTable.select().where(modelsTable.project == rowId).order_by(modelsTable.rmse,
                                                                                     modelsTable.accuracy.desc()).get()
    @wrapper
    def createModel(self, data):
        return modelsTable.create(**(data))

    @exchange_none_object
    @wrapper
    def getOneModelById(self, rowId, raw=False):
        return modelsTable.get_or_none(modelsTable.id == rowId)

    @wrapper
    def createMarketModel(self, data):
        return marketModelsTable.create(**data)

    @wrapper
    def getOneMarketModelByModelId(self, rowId, raw=False):
        return marketModelsTable.get_or_none(marketModelsTable.model == rowId)

    @wrapper
    def getOneMarketModelById(self, rowId, raw=False):
        return marketModelsTable.get_or_none(marketModelsTable.id == rowId)

    @wrapper
    def getOneMarketModelBySlugName(self, slug_name, raw=False):
        return marketModelsTable.get_or_none(marketModelsTable.slug == slug_name)

    @wrapper
    def getOneMarketModelByName(self, rowId, raw=False):
        return marketModelsTable.get_or_none(marketModelsTable.name_kr == rowId)

    @wrapper
    def getOneLastestOpsModelByOpsProjectId(self, opsProjectId, raw=False):
        return opsModelsTable.select().where(opsModelsTable.opsProject == opsProjectId).order_by(opsModelsTable.id.desc()).get()

    @wrapper
    def getModelsByProjectId(self, projectId, isSimplified = False):
        prescriptionAnalyticsInfo = peewee.Case(None,
            [(peewee.fn.LENGTH(modelsTable.prescriptionAnalyticsInfo) > 5, '1')], '0').alias('prescriptionAnalyticsInfo') \
            if isSimplified else modelsTable.prescriptionAnalyticsInfo

        return modelsTable.select(
                modelsTable.id,
                modelsTable.name,
                modelsTable.status,
                modelsTable.statusText,
                modelsTable.progress,
                modelsTable.rmse,
                modelsTable.totalLoss,
                modelsTable.accuracy,
                modelsTable.errorRate,
                modelsTable.dice,
                modelsTable.mase,
                modelsTable.isFavorite,
                modelsTable.token,
                prescriptionAnalyticsInfo,
                modelsTable.updated_at,
                modelsTable.r2score,
                modelsTable.hyper_param_id,
                modelsTable.cm_statistics,
                modelsTable.cmStatistics
                ).where(modelsTable.project == projectId).order_by(modelsTable.status).execute()

    @wrapper
    def getModelsByProjectIdAndStatus(self, projectId, status):
        return modelsTable.select(
                modelsTable.id,
                modelsTable.name,
                modelsTable.status,
                modelsTable.project,
                modelsTable.updated_at,
                ).where((modelsTable.project == projectId) & (modelsTable.status == status))\
                 .order_by(modelsTable.rmse, modelsTable.accuracy.desc())

    @wrapper
    def get_one_model_for_report(self, project_id):
        return modelsTable.select().where((modelsTable.status == 100) & (modelsTable.project == project_id))\
            .order_by(modelsTable.rmse, modelsTable.accuracy.desc()).execute()

    @wrapper
    def get_model_is_best_by_id(self, row_id):
        return modelsTable.select(
            modelsTable.id,
            modelsTable.isFavorite
        ).where(modelsTable.id == row_id).limit(1).first()

    @wrapper
    def get_model_performace_by_id(self, row_id, performance_type):
        if performance_type == 'all':
            return modelsTable.select(
                modelsTable.ap,
                modelsTable.rmse,
                modelsTable.accuracy
            ).where(modelsTable.id == row_id).limit(1).first()
        elif performance_type == 'ap':
            return modelsTable.select(
                modelsTable.ap
                ).where(modelsTable.id == row_id).limit(1).first()
        elif performance_type == 'rmse':
            return modelsTable.select(
                modelsTable.rmse
                ).where(modelsTable.id == row_id).limit(1).first()
        elif performance_type == 'accuracy':
            return modelsTable.select(
                modelsTable.accuracy
                ).where(modelsTable.id == row_id).limit(1).first()
    @wrapper
    def getOneFavortieModelsByUserIdAndModelId(self, userId, modelId):
        try:
            return favoriteModelsTable.get((favoriteModelsTable.user_id == userId) & (favoriteModelsTable.model_id == modelId))
        except:
            return None

    @wrapper
    def createFavoriteModelsByUserIdAndModelId(self, data):
        return favoriteModelsTable.create(**(data))

    @wrapper
    def getFavortieModelsByUserIdAndProjectId(self, userId, projectId, *fields):
        return favoriteModelsTable.select(*fields).where((favoriteModelsTable.user_id == userId) & (favoriteModelsTable.projectId == projectId)).execute()

    @wrapper
    def getFavoriteModelsByUserId(self, userId):
        favoriteModelList = []
        for x in favoriteModelsTable.select(favoriteModelsTable.model_id).where(favoriteModelsTable.user_id == userId):
            favoriteModelList.append(x.model_id)

        return modelsTable.select(
            modelsTable.id,
            modelsTable.name,
            modelsTable.status,
            modelsTable.progress,
            modelsTable.rmse,
            modelsTable.totalLoss,
            modelsTable.accuracy,
            modelsTable.errorRate,
            modelsTable.dice,
            modelsTable.mase,
            modelsTable.isFavorite,
            modelsTable.project,
            modelsTable.token,
            projectsTable.id,
            projectsTable.projectName,
            projectsTable.user,
        ) \
            .join(projectsTable, on=(modelsTable.project == projectsTable.id)) \
            .where((modelsTable.id.in_(favoriteModelList)) | ((modelsTable.isFavorite) & (projectsTable.user == userId))).execute()

    @wrapper
    def updateModelStatusById(self, rowId, status, statusText):
        return modelsTable.update(**{"status": status, "statusText": statusText})\
                            .where(modelsTable.id == rowId).execute()

    @wrapper
    def updateModelsProgress(self, modelId, progress, accuracy, rmse):
        modelsTable.update(**{ "progress": progress, "accuracy": accuracy, "rmse": rmse}).where(modelsTable.id == modelId).execute()

    @wrapper
    def updateModel(self, modelId, data):
        modelsTable.update(**data).where(modelsTable.id == modelId).execute()

    @wrapper
    def createModelChart(self, data):
        return modelchartsTable.create(**(data))

    @wrapper
    def removeAllModelsByProjectId(self, projectId):
        modelsTable.delete().where(modelsTable.project == projectId).execute()

    @wrapper
    def getBestModelByLabelprojectId(self, labelprojectId):
        whereQuery = (modelsTable.isBestModel == True) & (modelsTable.labelprojectId == labelprojectId)
        return modelsTable.select().where(whereQuery).order_by(modelsTable.id.desc()).limit(1).first()

    @wrapper
    def getBestModelCountByLabelprojectId(self, labelprojectId):
        whereQuery = (modelsTable.isBestModel == True) & (modelsTable.labelprojectId == labelprojectId)
        return modelsTable.select().where(whereQuery).count()

    @wrapper
    def get_market_models(self, start, count, select_category, is_quick_model=False):
        not_list = ['offline_shop', 'offline_ad', 'sport_training', 'recovery_training', 'dance_training', 'quant']
        if is_quick_model:
            common_where_query = (marketModelsTable.isQuickstart == True) & (marketModelsTable.visible_flag == True) & (marketModelsTable.service_type.not_in(not_list) | (marketModelsTable.service_type == None))
        else:
            common_where_query = ((marketModelsTable.isQuickstart == True) | (
                        (marketModelsTable.isCustomAi == True) & (marketModelsTable.user == None))) & (
                                             marketModelsTable.visible_flag == True) & (
                                             marketModelsTable.service_type.not_in(not_list) | (marketModelsTable.service_type == None))
        if select_category == '전체':
            category_list = ["", "금융", "보험", "제조", "물류", "마케팅", "경영", "농축산업", "에너지", "법", "공공", "기타"]
            sorting_tuple = tuple([(name, idx) for idx, name in enumerate(category_list)])
            sorting_by = Case(marketModelsTable.category, sorting_tuple, 99)
            query = marketModelsTable.select().where(common_where_query).order_by(marketModelsTable.priority_flag.desc(), marketModelsTable.isQuickstart.desc(), sorting_by)
        elif select_category == '기타':
            others_categories = ["기타"]
            sorting_tuple = tuple([(name, idx) for idx, name in enumerate(others_categories)])
            sorting_by = Case(marketModelsTable.category, sorting_tuple, 99)
            where_query = (marketModelsTable.category.in_(others_categories) & common_where_query)
            query = marketModelsTable.select().where(where_query).order_by(marketModelsTable.priority_flag.desc(), marketModelsTable.isQuickstart.desc(), sorting_by)
        else:
            where_query = ((marketModelsTable.category == select_category) & common_where_query)
            query = marketModelsTable.select().where(where_query).order_by(marketModelsTable.priority_flag.desc(), marketModelsTable.isQuickstart.desc())

        return query.paginate(start, count).execute(), query.count()

    @wrapper
    def create_market_requests(self, data):
        return marketRequests.create(**data)

    @wrapper
    def get_market_plans_by_model_id(self, market_model_id):
        return marketPlansTable.select().where(marketPlansTable.market_models == market_model_id).execute()

    @wrapper
    def get_one_market_requests_by_model_id(self, uesr_id, market_model_id):
        return marketRequests.get_or_none((marketRequests.userId == uesr_id) & (marketRequests.marketmodel == market_model_id))

    @wrapper
    def get_market_requests_by_user_id(self, user_id, start=1, count=10, searching='', sorting='created_at', desc=True):
        if sorting == 'created_at':
            sorting = marketRequests.created_at
        elif sorting == 'projectName':
            sorting = marketProjectsTable.projectName
        elif sorting == 'nextPaymentDate':
            sorting = marketProjectsTable.nextPaymentDate
        elif sorting == 'status':
            sorting = marketRequests.status

        if desc:
            sorting = sorting.desc()

        common_query = (marketRequests.userId == user_id) & (
                marketRequests.isDeleted == False)

        query = marketRequests.select(marketRequests.id,
                                      marketRequests.userId,
                                      marketRequests.marketmodel,
                                      marketRequests.marketproject,
                                      marketRequests.created_at,
                                      marketRequests.updated_at,
                                      marketRequests.status,
                                      marketRequests.created_ai_datetime,
                                      marketRequests.phoneNumber,
                                      marketRequests.s3key,
                                      marketRequests.description,
                                      marketModelsTable.name_kr,
                                      marketModelsTable.name_en,
                                      marketModelsTable.thumbnail,
                                      marketProjectsTable.service_type,
                                      marketProjectsTable.projectName,
                                      marketProjectsTable.nextPaymentDate,
                                      marketProjectsTable.fileStructure,
                                      ) \
                .join(marketModelsTable, join_type='LEFT', on=(marketRequests.marketmodel == marketModelsTable.id)).join(marketProjectsTable, on=(marketProjectsTable.id == marketRequests.marketproject)).where(common_query)
        return query.order_by(sorting).paginate(start, count).execute(), query.count()

    @wrapper
    def get_custom_ai_by_id(self, market_model_id):
        return marketModelsTable.get_or_none((marketModelsTable.id == market_model_id) & (marketModelsTable.isCustomAi == True))
