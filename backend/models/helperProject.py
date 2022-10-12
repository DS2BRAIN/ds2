import traceback
import datetime
import peewee
from dateutil.relativedelta import relativedelta
from internal.base_object import noneObject

from models import *
import functools

mongoDb = MongoDb()
class HelperProject():

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
            elif kwargs.get('has_object', True) is False:
                result = result.__dict__['__data__']

            return result
        return wrapper

    @wrapper
    def getOneProjectById(self, rowId, raw=False):
        project = projectsTable.get_or_none(projectsTable.id == rowId)
        if project:
            return project.__dict__['__data__'] if not raw else project
        return project

    @wrapper
    def get_project_by_model_id(self, model_id, raw=False):
        sub_query = modelsTable.select(modelsTable.project).where(modelsTable.id == model_id)
        data = projectsTable.get_or_none(projectsTable.id == sub_query)
        if data:
            return data.__dict__['__data__'] if not raw else data
        else:
            return data

    @wrapper
    def get_all_project_in_ids(self, ids, raw=False):
        result = projectsTable.select().where(projectsTable.id.in_(ids)).execute()
        if raw:
            return [raw for raw in result]
        else:
            return [raw.__dict__['__data__'] for raw in result]

    @wrapper
    def get_all_labelproject_in_ids(self, ids, raw=False):
        result = labelprojectsTable.select().where(labelprojectsTable.id.in_(ids)).execute()
        if raw:
            return [raw for raw in result]
        else:
            return [raw.__dict__['__data__'] for raw in result]

    @wrapper
    def get_project_by_model_id(self, model_id, raw=False):
        sub_query = modelsTable.select(modelsTable.project).where(modelsTable.id == model_id)
        data = projectsTable.get_or_none(projectsTable.id == sub_query)
        if data:
            return data.__dict__['__data__'] if not raw else data
        else:
            return data

    @wrapper
    def getOneProjectByLabelprojectId(self, rowId, raw=False):
        return projectsTable.get_or_none(projectsTable.labelproject == rowId).__dict__[
            '__data__'] if not raw else projectsTable.get_or_none(projectsTable.labelproject == rowId)

    @wrapper
    def get_project_by_labelproject_id(self, labelproject_id, raw=False):
        data = projectsTable.get_or_none(projectsTable.labelproject == labelproject_id)
        if data:
            return data.__dict__['__data__'] if not raw else data
        else:
            return data

    @wrapper
    def get_project_status_by_id(self, row_id):
        return projectsTable.select(projectsTable.status, projectsTable.hasBestModel).where(
            projectsTable.id == row_id).limit(1).first()

    @wrapper
    def getOneMarketProjectById(self, row_id, raw=False):

        result = marketProjectsTable.get_or_none(marketProjectsTable.id == row_id)

        return result if raw else \
            result.__dict__['__data__'] if result is not None else None

    @wrapper
    def update_marketproject_by_id(self, row_id, data):
        return marketProjectsTable.update(**data).where(marketProjectsTable.id == row_id).execute()

    @wrapper
    def update_marketproject_by_condition(self, condition, data):
        return marketProjectsTable.update(**data).where(condition).execute()

    @wrapper
    def update_marketproject_price(self, project_id):

        query = marketProjectsTable.update(
            price=marketProjectsTable.next_price,
            pricing_agreement=False,
            next_price=None,
            next_price_date=None,
        ).where(marketProjectsTable.id == project_id)
        query.execute()
        row = self.get_one_market_project_by_id(project_id, raw=True)

        return row

    @wrapper
    def get_wide_field_market_project(self, user_id):
        market_names = ['wide_field_deploy', 'wide_field_search', 'wide_field']
        return marketProjectsTable.select(marketProjectsTable.id).where((marketProjectsTable.option.in_(market_names)) & (marketProjectsTable.user == user_id)).execute()

    @wrapper
    def getOneOpsProjectById(self, rowId, raw=False):
        return opsProjectsTable.get(opsProjectsTable.id == rowId).__dict__['__data__'] if not raw else opsProjectsTable.get(opsProjectsTable.id == rowId)

    @wrapper
    def getOneOpsModelById(self, rowId, raw=False):
        return opsModelsTable.get(opsModelsTable.id == rowId).__dict__['__data__'] if not raw else opsModelsTable.get(
            opsModelsTable.id == rowId)

    @wrapper
    def getOpsProjects(self):
        return opsProjectsTable.select()

    @wrapper
    def getOpsProjectsByUserId(self, rowId):
        return opsProjectsTable.select().where(opsProjectsTable.user == rowId)

    @wrapper
    def getOpsServerGroupsByOpsProjectId(self, opsProjectId):
        return opsServerGroupsTable.select().where(opsServerGroupsTable.opsProject == opsProjectId)

    @wrapper
    def getServerPricingByServerTypeAndRegion(self, serverType, region):
        return serverPricingTable.get((serverPricingTable.serverType == serverType) & (serverPricingTable.region == region))

    @wrapper
    def getOneProjectFileByCondition(self, condition):
        result = mongoDb.get_one_document_by_condition(mongoDb.DS2DATA_PROJECT_COLLECTION_NAME, condition)
        return result

    @wrapper
    def get_server_pricing_distinct_by_country_code(self, country_code):
        return serverPricingTable.select(serverPricingTable.region, serverPricingTable.displayName)\
            .where(serverPricingTable.region.contains(country_code)).distinct().execute()

    @wrapper
    def get_server_pricing_by_region(self, region):
        return serverPricingTable.select().where(serverPricingTable.region == region).execute()

    @wrapper
    def get_server_pricings(self, fields=()):

        return serverPricingTable.select().dicts()

    @wrapper
    def get_pricings(self, fields=()):

        return pricingTable.select().dicts()

    @wrapper
    def get_server_country_codes(self):
        return serverPricingTable.select(serverPricingTable.countryCode).distinct().execute()

    @wrapper
    def getOneProjectAsyncById(self, rowId):
        return projectsTable.select(projectsTable.id, projectsTable.status, projectsTable.user).where(projectsTable.id == rowId).get()

    @wrapper
    def getProjectsByStatus(self, status):
        return projectsTable.select().where(projectsTable.status == status).execute()

    @wrapper
    def getSharedProjectsByUserId(self,userId, projectId = [], sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = projectsTable.created_at
        elif sorting == 'updated_at':
            sorting = projectsTable.updated_at
        elif sorting == 'option':
            sorting = projectsTable.option
        elif sorting == 'projectName':
            sorting = projectsTable.projectName
        elif sorting == 'trainingMethod':
            sorting = projectsTable.trainingMethod
        elif sorting == 'status':
            sorting = projectsTable.status

        if desc:
            sorting = sorting.desc()
        commonWhere = ((projectsTable.isDeleted == None) | (projectsTable.isDeleted == False)) & (projectsTable.user != userId)
        projectQuery = projectsTable.select(projectsTable.id, projectsTable.projectName, projectsTable.created_at,
                                            projectsTable.updated_at, projectsTable.status, projectsTable.option,
                                            projectsTable.trainingMethod)

        if tab == 'ready':
            statusList = [0]
        elif tab == 'done':
            statusList = [100, 99, 9]
        elif tab == 'developing':
            statusList = [1, 10, 11, 20, 21, 31, 60, 61]
        elif tab == 'all':
            return projectQuery.where(
                (projectsTable.projectName.contains(searching)) & (
                        commonWhere) & (projectsTable.id.in_(projectId))).order_by(sorting).paginate(start, count).execute()

        return projectQuery.where(
            (projectsTable.projectName.contains(searching)) & (projectsTable.id.in_(projectId)) & (projectsTable.status.in_(statusList)
                                                               ) & (
                commonWhere)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def get_project_ds2data_by_project_id(self, project_id, count=False):
        condition = {'project': project_id}
        if count:
            return mongoDb.get_documents_count(mongoDb.DS2DATA_PROJECT_COLLECTION_NAME, condition=condition)
        else:
            return mongoDb.get_documents(mongoDb.DS2DATA_PROJECT_COLLECTION_NAME, condition=condition)

    @wrapper
    def get_labelproject_ds2data_by_project_id(self, labelproject_id):
        condition = {'labelproject': labelproject_id}
        return mongoDb.get_documents(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition)

    @wrapper
    def get_labelproject_ds2data_count_by_project_id(self, labelproject_id):
        condition = {'labelproject': labelproject_id}
        return mongoDb.get_documents_count(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition)

    @wrapper
    def get_ds2data_count_by_id(self, connector_id):
        condition = {'dataconnector': connector_id}
        return mongoDb.get_documents_count(mongoDb.DS2DATA_COLLECTION_NAME, condition=condition)

    @wrapper
    def getAllProjectByUserId(self, user_id, project_ids, sorting='created_at', tab='all', desc=False, searching='',
                              page=0, count=10, isVerify=False):
        if sorting == 'created_at':
            sorting = projectsTable.created_at
        elif sorting == 'updated_at':
            sorting = projectsTable.updated_at
        elif sorting == 'option':
            sorting = projectsTable.option
        elif sorting == 'projectName':
            sorting = projectsTable.projectName
        elif sorting == 'trainingMethod':
            sorting = projectsTable.trainingMethod
        elif sorting == 'status':
            sorting = peewee.Case(projectsTable.status, (
            (100, 1), (9, 2), (99, 3), (1, 4), (10, 5), (11, 6), (20, 7), (21, 8), (30, 9), (31, 10), (60, 11),
            (61, 12)), 0)

        if desc and sorting != 'status':
            sorting = sorting.desc()
        commonWhere = ((projectsTable.isDeleted == None) | (projectsTable.isDeleted == False)) & (
                    (projectsTable.user == user_id) | (projectsTable.id.in_(project_ids)))
        if isVerify:
            commonWhere = commonWhere & (projectsTable.isVerify == True)
        else:
            commonWhere = commonWhere & ((projectsTable.isVerify == False) | (projectsTable.isVerify == None))
        projectQuery = projectsTable.select(projectsTable.id, projectsTable.projectName, projectsTable.created_at,
                                            projectsTable.updated_at, projectsTable.status, projectsTable.option,
                                            projectsTable.trainingMethod)

        if tab == 'ready':
            statusList = [0]
        elif tab == 'done':
            statusList = [100, 99, 9]
        elif tab == 'developing':
            statusList = [1, 10, 11, 20, 21, 30, 31, 40, 41, 60, 61]
        elif tab == 'all':
            query = projectQuery.where((projectsTable.projectName.contains(searching)) & (commonWhere))
            return query.order_by(sorting).paginate(page, count).execute(), query.count()
        query = projectQuery.where(
            (projectsTable.projectName.contains(searching)) & (projectsTable.status.in_(statusList)) & (commonWhere))
        return query.order_by(sorting).paginate(page, count).execute(), query.count()

    @wrapper
    def getProjectsByUserId(self, tableInstance, userId, sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = tableInstance.created_at
        elif sorting == 'updated_at':
            sorting = tableInstance.updated_at
        elif sorting == 'option':
            sorting = tableInstance.option
        elif sorting == 'projectName':
            sorting = tableInstance.projectName
        elif sorting == 'trainingMethod':
            sorting = tableInstance.trainingMethod
        elif sorting == 'status':
            sorting = tableInstance.status

        if desc:
            sorting = sorting.desc()
        commonWhere = (tableInstance.isDeleted == None) | (tableInstance.isDeleted == False)
        projectQuery = tableInstance.select(tableInstance.id, tableInstance.projectName, tableInstance.created_at,tableInstance.updated_at, tableInstance.status, tableInstance.option,tableInstance.trainingMethod)

        if tab == 'ready':
            statusList = [0]
        elif tab == 'done':
            statusList = [100, 99, 9]
        elif tab == 'developing':
            statusList = [1, 10, 11, 20, 21, 30, 31, 60, 61]
        elif tab == 'all':
            return projectQuery.where((tableInstance.projectName.contains(searching)) & (tableInstance.user == userId) & (
                        (tableInstance.isDeleted == None) | (tableInstance.isDeleted == False))).order_by(sorting).paginate(start,count).execute()

        return projectQuery.where((tableInstance.projectName.contains(searching)) & (tableInstance.status.in_(statusList)
                        ) & (tableInstance.user == userId) & (
                commonWhere)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def getProjectsPriorityByUserId(self, userId):
        orderBy = peewee.Case(projectsTable.status,
                        ((31, 0), (21, 1), (11, 2), (10, 3), (1, 4), (0, 5))).asc(nulls='LAST')
        commonWhere = (projectsTable.status.not_in([100, 0, 99, 9])) & (projectsTable.user == userId) & ((projectsTable.isDeleted == None) | (projectsTable.isDeleted == False))

        projectsInfo = [x.__dict__['__data__'] for x in
                        projectsTable.select(projectsTable.id, projectsTable.projectName, projectsTable.status,
                                            projectsTable.updated_at, projectsTable.trainingMethod,
                                             projectsTable.option).where(commonWhere).order_by(orderBy,
                                                                                               projectsTable.created_at.desc()).limit(3).execute()]
        for x in projectsInfo:
            totalModelCount = modelsTable.select().where(modelsTable.project == x['id']).count()
            completedModelCount = modelsTable.select().where(
                (modelsTable.project == x['id']) & (modelsTable.status == 100)).count()
            try:
                x['modelProgress'] = round(completedModelCount/totalModelCount, 2)
            except:
                x['modelProgress'] = 0
        return projectsInfo

    @wrapper
    def getProjectStatusCountByFolderId(self, tableInstance, userId, searching, shared = [], isShared = False):
        result = {}
        if isShared:
            commonWhere = ((tableInstance.isDeleted == None) | (tableInstance.isDeleted == False)) & tableInstance.user != userId
            result['ready'] = tableInstance.select().where(
                    (tableInstance.projectName.contains(searching)) & (tableInstance.user != userId) & (tableInstance.status == 'ready') & (tableInstance.id.in_(shared)) & (
                                commonWhere)).count()
            result['developing'] = tableInstance.select().where(
                    (tableInstance.projectName.contains(searching)) & (tableInstance.user != userId) & (tableInstance.id.in_(shared)) & (tableInstance.status.in_([1, 10, 11, 20, 21, 30, 31])) & (
                                commonWhere)).count()
            result['done'] = tableInstance.select().where(
                    (tableInstance.projectName.contains(searching)) & (tableInstance.user != userId) & (tableInstance.id.in_(shared)) & (tableInstance.status.in_([9,99,100])) & (
                                commonWhere)).count()
            result['all'] = tableInstance.select().where((tableInstance.user != userId) & (tableInstance.id.in_(shared)) & (tableInstance.projectName.contains(searching)) & (
                            commonWhere)).count()
        else:
            commonWhere = (tableInstance.isDeleted == None) | (tableInstance.isDeleted == False)
            result['ready'] = tableInstance.select().where(
                (tableInstance.projectName.contains(searching)) & (tableInstance.status == 'ready') & (
                            tableInstance.user == userId) & (
                        (tableInstance.isDeleted == None) | (tableInstance.isDeleted == False))).count()
            result['developing'] = tableInstance.select().where(
                (tableInstance.projectName.contains(searching)) & (tableInstance.status.in_([1, 10, 11, 20, 21, 30, 31])) & (
                            tableInstance.user == userId) & (
                        (tableInstance.isDeleted == None) | (tableInstance.isDeleted == False))).count()
            result['done'] = tableInstance.select().where(
                (tableInstance.projectName.contains(searching)) & (tableInstance.status.in_([9,99,100])) & (
                            tableInstance.user == userId) & (
                        (tableInstance.isDeleted == None) | (tableInstance.isDeleted == False))).count()
            result['all'] = tableInstance.select().where(
                (tableInstance.user == userId) & (tableInstance.projectName.contains(searching)) & (
                        (tableInstance.isDeleted == None) | (tableInstance.isDeleted == False))).count()
        return result

    @wrapper
    def getNotStartedProjectsByUserId(self, userId):
        return projectsTable.select().where((projectsTable.user == userId) & (projectsTable.status == 0)).execute()

    @wrapper
    def getProjectsByStatus(self, status):
        return projectsTable.select().where(projectsTable.status == status)

    @wrapper
    def getProjectsById(self, projectId):
        return projectsTable.select().where(projectsTable.id == projectId).execute()

    @wrapper
    def getProjectsByDatasetId(self, datasetId):
        return projectsTable.select().where(projectsTable.dataset == datasetId).execute()

    @wrapper
    def getOneUserById(self, rowId ,raw=False):
        result = usersTable.get_or_none(usersTable.id == rowId)
        if not raw and result is not None:
            return result.__dict__['__data__']
        else:
            return result

    @wrapper
    def get_one_team_user_by_id(self, row_id, raw=False):
        result = teamUsersTable.get_or_none(teamUsersTable.id == row_id)
        if not raw and result is not None:
            return result.__dict__['__data__']
        else:
            return result

    @wrapper
    def get_one_team_by_id(self, row_id, raw=False):
        result = teamsTable.get_or_none(teamsTable.id == row_id)
        if not raw and result is not None:
            return result.__dict__['__data__']
        else:
            return result

    @wrapper
    def get_one_market_project_by_id(self, row_id, raw=False):
        condition = (marketProjectsTable.id == row_id) & (
                    (marketProjectsTable.isDeleted == False) | (marketProjectsTable.isDeleted == None))

        result = marketProjectsTable.get_or_none(condition)
        if not raw and result is not None:
            return result.__dict__['__data__']
        else:
            return result


    @wrapper
    def get_one_amount_histories_by_id(self, row_id, raw=False):
        result = usedamounthistoriesTable.get_or_none(usedamounthistoriesTable.id == row_id)
        if not raw and result is not None:
            return result.__dict__['__data__']
        else:
            return result

    @wrapper
    def getAsnycTaskByProjectId(self, projectId):
        return asynctasksTable.get(asynctasksTable.project == projectId)

    @wrapper
    def updateProjectStatusById(self, rowId, status, statusText):
        project = self.getOneProjectById(rowId, raw=True)
        task_type = 'train'
        if project.isVerify:
            task_type = 'verify'
        elif project.option == "labeling":
            task_type = 'labeling'

        if status == 99:
            user = self.getOneUserById(project.user, raw=True)
            user.cumulativeProjectCount = user.cumulativeProjectCount - 1
            user.save()
        # if status > 0:
        #     asynctasksTable.create(**{
        #         "taskName": project.projectName,
        #         "taskNameEn": project.projectName,
        #         "taskType": task_type,
        #         "status": status,
        #         'labelproject': project.labelproject,
        #         "user": project.user,
        #         "project": rowId,
        #         'isChecked': 0
        #     })
        try:
            asyncTaskId = self.getAsnycTaskByProjectId(rowId)
            asyncTaskId.status = status
            asyncTaskId.save()
        except:
            asynctasksTable.create(**{
                "taskName": project.projectName,
                "taskType": "train",
                "status": status,
                "user": project.user,
                "project": rowId
            })
            pass

        return projectsTable.update(**{"status": status, "statusText": statusText}) \
            .where(projectsTable.id == rowId).execute()

    @wrapper
    def updateProjectIsdeletedById(self, projectId):
        return projectsTable.update(**{"isDeleted": True}).where(
            projectsTable.id == projectId).execute()

    @wrapper
    def updateProject(self, rowId, data):
        data["updated_at"] = datetime.datetime.utcnow()
        # if data.get("status") != None:
        #     projectData = self.getOneProjectById(rowId)
        #     projectData.update(data)
        #     projecthistoriesTable.create(**(projectData))
        return projectsTable.update(**data).where(projectsTable.id == rowId).execute()

    @wrapper
    def getCountProjectsByStatusAndPlan(self, status, plan):
        return projectsTable.select() \
            .join(usersTable, on=(projectsTable.user == usersTable.id)) \
            .join(usageplansTable, on=(usersTable.usageplan == usageplansTable.id)) \
            .where(((projectsTable.status == status) | (projectsTable.status == status + 20)) & (projectsTable.option != 'colab') & (usageplansTable.planName == plan))

    @wrapper
    def get_train_params_by_project_id(self, project_id):
        condition = {'project': project_id, 'is_original': False}

        return mongoDb.get_documents(collection_name=mongoDb.DS2AI_PROJECT_HYPER_PARAMS, condition=condition)

    @wrapper
    def get_train_param_by_id(self, param_id):
        return mongoDb.get_one_document_by_id(collection_name=mongoDb.DS2AI_PROJECT_HYPER_PARAMS, _id=param_id)

    @wrapper
    def get_hyper_params_by_project_id(self, project_id):
        condition = {'project': project_id, 'is_original': True}

        return mongoDb.get_documents(collection_name=mongoDb.DS2AI_PROJECT_HYPER_PARAMS, condition=condition)

    @wrapper
    def create_train_params(self, data):
        return mongoDb.create_document(collection_name=mongoDb.DS2AI_PROJECT_HYPER_PARAMS, data=data)

    @wrapper
    def delete_train_params_by_project_id(self, project_id):
        condition = {'project': project_id}
        return mongoDb.delete_documents(collection_name=mongoDb.DS2AI_PROJECT_HYPER_PARAMS, condition=condition)

    @wrapper
    def getUserByModelId(self, modelid, isMarket=False):
        if isMarket:
            return usersTable.select() \
                .join(marketProjectsTable, on=(marketProjectsTable.user == usersTable.id)) \
                .join(marketModelsTable, on=(marketModelsTable.project == marketProjectsTable.id)) \
                .where(marketModelsTable.model == modelid).get()
        else:
            return usersTable.select() \
                .join(projectsTable, on=(projectsTable.user == usersTable.id)) \
                .join(modelsTable, on=(modelsTable.project == projectsTable.id)) \
                .where(modelsTable.id == modelid).get()

    @exchange_none_object
    @wrapper
    def getProjectByModelId(self, modelid, isMarket=False, opsId=None, has_object=True):
        if opsId:
            return opsProjectsTable.select() \
                .join(opsModelsTable, on=(opsModelsTable.id == opsProjectsTable.opsModel)) \
                .where(opsModelsTable.id == modelid).get()
        else:
            if isMarket:
                return marketProjectsTable.select() \
                    .join(marketModelsTable, on=(marketModelsTable.project == marketProjectsTable.id)) \
                    .where(marketModelsTable.id == modelid).get()
            else:
                return projectsTable.select() \
                    .join(modelsTable, on=(modelsTable.project == projectsTable.id)) \
                    .where(modelsTable.id == modelid).limit(1).first()

    @wrapper
    def getProjectsByCategoryId(self, categoryId):
        return projectsTable.select().where(projectsTable.projectcategory == categoryId).execute()

    @wrapper
    def getprojectById(self, id):
        return projectsTable.get(projectsTable.id == id)

    @wrapper
    def getAutoLabelingProjectCountByLabelProjectId(self, labelProjectId):
        return asynctasksTable.select().where((asynctasksTable.labelproject == labelProjectId) & (asynctasksTable.taskType == 'autoLabeling')).count()

    @wrapper
    def get_user_by_jupyter_and_ops(self, isForTest=False, withBlock=True):

        jupyter_result = jupyterProjectsTable.select(jupyterProjectsTable.user).distinct()

        ops_result = opsProjectsTable.select(opsProjectsTable.user).distinct()

        union = (jupyter_result | ops_result)

        project_user = union.select_from(union.c.user)

        where_query = (usersTable.confirmed == 1) & (usersTable.id.in_(project_user))

        if isForTest:
            where_query = where_query & (usersTable.isTest == True)
        if not withBlock:
            where_query = where_query & ((usersTable.blocked == None) | (usersTable.blocked == False))

        result = usersTable.select().where(where_query).execute()

        return result

    @wrapper
    def getOneJupyterProjectById(self, rowId, raw=False):
        return jupyterProjectsTable.get(jupyterProjectsTable.id == rowId).__dict__['__data__'] if not raw else jupyterProjectsTable.get(jupyterProjectsTable.id == rowId)

    @wrapper
    def getJupyterProjects(self):
        return jupyterProjectsTable.select()

    @wrapper
    def getJupyterProjectsByUserId(self, userId):
        return jupyterProjectsTable.select().where(jupyterProjectsTable.user == userId)

    @wrapper
    def getJupyterProjectsPort(self):
        return jupyterServersTable.select(jupyterServersTable.port).where(jupyterServersTable.status >= 1).execute()

    @wrapper
    def getJupyterAliveServersCountByPort(self, port):
        return jupyterServersTable.select().where((jupyterServersTable.status > -1) & (jupyterServersTable.port == port)).count()

    @wrapper
    def getJupyterServerById(self, jupyter_server_id):
        return jupyterServersTable.get_or_none(jupyterServersTable.id == jupyter_server_id)

    @wrapper
    def getJupyterServersByJupyterProjectId(self, jupyter_project_id):
        return jupyterServersTable.select().where(jupyterServersTable.jupyterProject == jupyter_project_id).execute()

    @wrapper
    def getJupyterPricingByServerType(self, serverType):
        return jupyterPricingTable.get(jupyterPricingTable.serverType == serverType)

    @wrapper
    def getJupyterJobsByJupyterProjectId(self, jupyterProjectId):
        return jupyterJobsTable.select().where(jupyterJobsTable.jupyterProject == jupyterProjectId)

    @wrapper
    def getJupyterJobsByJupyterServerId(self, jupyterServerId):
        return jupyterJobsTable.select().where(jupyterJobsTable.jupyterServer == jupyterServerId)

    @wrapper
    def getNotStartedJupyterJobsByJupyterServerId(self, jupyterServerId):
        return jupyterJobsTable.select().where((jupyterJobsTable.jupyterServer == jupyterServerId) & (jupyterJobsTable.status == 0))

    @wrapper
    def getAliveJupyterServersByUserId(self, userId):
        return jupyterServersTable.select().join(jupyterProjectsTable, on=(jupyterProjectsTable.id == jupyterServersTable.jupyterProject))\
            .where((jupyterProjectsTable.user == userId) & (jupyterServersTable.status > 0))

    @wrapper
    def updateMarketProjectIsdeletedByMarketprojectId(self, marketprojectId):
        return marketProjectsTable.update(**{"isDeleted": True}).where(marketProjectsTable.id == marketprojectId).execute()

    @wrapper
    def getMarketProjectsById(self, projectId):
        return marketProjectsTable.get_or_none(marketProjectsTable.id == projectId)

    @wrapper
    def get_market_projects_by_model_id(self, model_id, user_id, start, count, sorting, desc, searching, *field):
        sorting_dict = {
            "stock_type": marketProjectsTable.stock_type,
            "projectName": marketProjectsTable.projectName,
            "thumbnail": marketProjectsTable.thumbnail,
            "created_at": marketProjectsTable.created_at,
            "status": marketProjectsTable.status,
            "goal": marketProjectsTable.goal,
            "trainingMethod": marketProjectsTable.trainingMethod
        }

        sorting = sorting_dict[sorting].desc() if desc else sorting_dict[sorting]

        condition = (marketProjectsTable.user == user_id) & (marketProjectsTable.marketmodel == model_id) & (
                    (marketProjectsTable.isDeleted == None) | (marketProjectsTable.isDeleted == False))
        if searching:
            condition = condition & (marketProjectsTable.projectName.contains(searching))
        if count == -1:
            return marketProjectsTable.select(*field).where(condition).execute()
        else:
            query = marketProjectsTable.select(*field).where(condition)
            return query.order_by(sorting).paginate(start, count).execute(), query.count()


    @wrapper
    def get_market_projects_by_user_id(self, user_id, provider='DS2.ai', only_active=True):

        where_query = (marketProjectsTable.user == user_id) & \
                      ((marketProjectsTable.isDeleted == False) | (marketProjectsTable.isDeleted == None))

        if only_active:
            where_query = where_query &\
                          ((marketProjectsTable.is_blocked == False) | (marketProjectsTable.is_blocked == None))

        return marketProjectsTable.select().where(where_query).execute()

    @wrapper
    def get_market_projects_count_by_user_id(self, user_id, service_type):
        return marketProjectsTable.select().where(
            (marketProjectsTable.user == user_id) & (marketProjectsTable.service_type == service_type)).count()


    @wrapper
    def get_market_plans_by_id(self, plan_id):
        return marketPlansTable.get_or_none(marketPlansTable.id == plan_id)
