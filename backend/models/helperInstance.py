import datetime
import traceback
import bcrypt
import peewee

from models import *
import functools

mongoDb = MongoDb()

class HelperInstance():
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
    def getInstanceDataByInstanceName(self, instanceName, raw=False):
        where = ((instancesTable.instanceName == instanceName) & ((instancesTable.isDeleted == False) | (instancesTable.isDeleted == None)))
        return instancesTable.select().where(where).get().__dict__['__data__'] if not raw \
            else instancesTable.select().where(where).get()

    @wrapper
    def getInstanceUserById(self, rowId):
        return instancesUsersTable.get(instancesUsersTable.id == rowId).__dict__['__data__']

    @wrapper
    def getInstanceUserCount(self):
        return instancesUsersTable.select().where((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None)).count()
    @wrapper
    def getInstanceUserByInstanceId(self, instanceId):
        return instancesUsersTable.select().where((instancesUsersTable.instance_id == instanceId) & ((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None)))

    @wrapper
    def getCountInstanceUserByUserId(self, rowId):
        return instancesUsersTable.select().where((instancesUsersTable.user_id == rowId) & ((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None))).count()

    @wrapper
    def createInstanceUser(self, instanceId, userId, isTest=None, ps_id=None):
        return instancesUsersTable.create(**{"instance_id": instanceId, "user_id": userId, "isTest": isTest,
                                             "updated_at": datetime.datetime.utcnow(), "ps_id": ps_id})

    @wrapper
    def updateInstanceUser(self, rowId, data):
        return instancesUsersTable.update(**data).where(instancesUsersTable.id == rowId).execute()

    @wrapper
    def updateInstance(self, rowId, data):
        return instancesTable.update(**data).where(instancesTable.id == rowId).execute()

    @wrapper
    def updateInstanceByInstanceName(self, instanceName, data):
        return instancesTable.update(**data).where(instancesTable.instanceName == instanceName).execute()

    @wrapper
    def getFreezedUserInstances(self):
        where = ((instancesUsersTable.updated_at < peewee.datetime.datetime.utcnow() - peewee.datetime.timedelta(hours=72)) & (((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None))))
        return instancesUsersTable.select().where(where)

    @wrapper
    def getInstances(self):
        return instancesTable.select()

    @wrapper
    def getFreezedInstances(self):
        where = ((instancesTable.updated_at < peewee.datetime.datetime.utcnow() - peewee.datetime.timedelta(hours=72)) & (instancesTable.isDeleted != True))
        return instancesTable.select().where(where)

    @wrapper
    def createInstance(self, data):
        return instancesTable.create(**(data))

    @wrapper
    def createInstanceHistory(self, data):
        return instanceHistoriesTable.create(**(data))

    @wrapper
    def createServerBillingHistory(self, data):
        return serverBillingHistoriesTable.create(**(data))

    @wrapper
    def getInstanceModelByProjectId(self, projectId):
        where = ((instancesUsersTable.project_id == projectId) & (((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None))))
        return instancesUsersTable.select(instancesUsersTable.model_id).where(where)

    @wrapper
    def updateInstanceTerminatedDateByInstanceName(self, terminatedDate, instanceName):
        instancesTable.update(**{"terminatedDate": terminatedDate}).where(
            instancesTable.instanceName == instanceName).execute()

    @wrapper
    def getCountInstanceByPlan(self, plan):
        where = (((instancesTable.planType == plan) & (instancesTable.terminatedDate.is_null())) & ((instancesTable.isDeleted == False) | (instancesTable.isDeleted == None)))
        return instancesTable.select().where(where).count()

    @wrapper
    def getInstanceUsers(self):
        where = ((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None))
        return instancesUsersTable.select().where(where)

    @wrapper
    def getInstanceUsersByUserId(self, userId):
        where = ((instancesUsersTable.user_id == userId) & ((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None)))
        return instancesUsersTable.select().where(where).execute()

    @wrapper
    def getNotTerminatedInstances(self):
        where = ((instancesTable.terminatedDate.is_null()) & (instancesTable.isDeleted != True))
        return instancesTable.select().where(where)

    @wrapper
    def getInstanceUserNotReturnedAfterStarting24hours(self):
        return instancesUsersTable.select() \
            .join(instancesTable, on=(instancesTable.id == instancesUsersTable.instance_id)) \
            .where((instancesTable.instanceName != "dslab") & (instancesTable.terminatedDate.is_null())
                   & ((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None))
                   & (instancesTable.created_at < datetime.datetime.utcnow() - datetime.timedelta(hours=24))).count()

    @wrapper
    def getInstanceUserNotReturnedAfterTerminated(self):
        return instancesUsersTable.select() \
            .join(instancesTable, on=(instancesTable.id == instancesUsersTable.instance_id)) \
            .where((instancesTable.instanceName != "dslab")
                   & (((instancesUsersTable.isDeleted == False) | (instancesUsersTable.isDeleted == None))) & (instancesTable.terminatedDate.is_null(False)))

    @wrapper
    def getNotStartedOpsServerGroups(self):
        return opsServerGroupsTable.select().where(opsServerGroupsTable.status == 0)

    @wrapper
    def updateOpsServerGroupByInstanceName(self, instanceName, data):
        return opsServerGroupsTable.update(**data).where(opsServerGroupsTable.instanceId == instanceName).execute()

    @wrapper
    def getOneOpsServerGroupById(self, opsServerGroupId):
        return opsServerGroupsTable.select().where(opsServerGroupsTable.id == opsServerGroupId).get()

    @wrapper
    def getOneOpsServerGroupByInstanceId(self, instanceId):
        return opsServerGroupsTable.select().where(opsServerGroupsTable.instanceId == instanceId).get()

    @wrapper
    def getNotStartedJupyterServers(self):
        return jupyterServersTable.select().where(jupyterServersTable.status == 1)

    @wrapper
    def getStartedJupyterServers(self):
        return jupyterServersTable.select().where(jupyterServersTable.status > 0)

    @wrapper
    def updateJupyterServerByInstanceId(self, instanceId, data):
        return jupyterServersTable.update(**data).where(jupyterServersTable.instanceId == instanceId).execute()

    @wrapper
    def updateJupyterServerByInstanceId(self, instanceId, data):
        return jupyterServersTable.update(**data).where(jupyterServersTable.instanceId == instanceId).execute()


    @wrapper
    def getOneJupyterServerById(self, jupyterServerId):
        return jupyterServersTable.select().where(jupyterServersTable.id == jupyterServerId).get()

    @wrapper
    def getOneJupyterServerByInstanceId(self, instanceId):
        return jupyterServersTable.select().where(jupyterServersTable.instanceId == instanceId).get()

    @wrapper
    def createInstanceLog(self, data):
        return mongoDb.create_document(collection_name=mongoDb.INSTANCE_LOG_COLLECTION_NAME, data=data)




