import traceback
import datetime
import peewee
from dateutil.relativedelta import relativedelta
from internal.base_object import noneObject

from models import *
import functools

mongoDb = MongoDb()
class HelperMonitoringAlert():

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
    def getOneMonitoringAlertById(self, rowId, raw=False):
        monitoring_alert = monitoringAlertTable.get_or_none(monitoringAlertTable.id == rowId)
        if monitoring_alert:
            return monitoring_alert.__dict__['__data__'] if not raw else monitoring_alert
        return monitoring_alert

    @wrapper
    def get_all_monitoring_alert_in_ids(self, ids, raw=False):
        result = monitoringAlertTable.select().where(monitoringAlertTable.id.in_(ids)).execute()
        if raw:
            return [raw for raw in result]
        else:
            return [raw.__dict__['__data__'] for raw in result]

    @wrapper
    def get_monitoring_alert_status_by_id(self, row_id):
        return monitoringAlertTable.select(monitoringAlertTable.status, monitoringAlertTable.hasBestModel).where(
            monitoringAlertTable.id == row_id).limit(1).first()

    @wrapper
    def getOneMonitoringAlertAsyncById(self, rowId):
        return monitoringAlertTable.select(monitoringAlertTable.id, monitoringAlertTable.status, monitoringAlertTable.user).where(monitoringAlertTable.id == rowId).get()

    @wrapper
    def getMonitoringAlertsByStatus(self, status):
        return monitoringAlertTable.select().where(monitoringAlertTable.status == status).execute()

    @wrapper
    def getSharedMonitoringAlertsByUserId(self,user_id, monitoring_alertId = [], sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = monitoringAlertTable.created_at
        elif sorting == 'updated_at':
            sorting = monitoringAlertTable.updated_at
        elif sorting == 'option':
            sorting = monitoringAlertTable.option
        elif sorting == 'monitoring_alert_name':
            sorting = monitoringAlertTable.monitoring_alert_name
        elif sorting == 'status':
            sorting = monitoringAlertTable.status

        if desc:
            sorting = sorting.desc()
        common_where = ((monitoringAlertTable.is_deleted == None) | (monitoringAlertTable.is_deleted == False)) & (monitoringAlertTable.user != user_id)
        monitoring_alert_query = monitoringAlertTable.select(monitoringAlertTable.id, monitoringAlertTable.monitoring_alert_name, monitoringAlertTable.created_at,
                                            monitoringAlertTable.updated_at, monitoringAlertTable.status, monitoringAlertTable.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 31, 60, 61]
        elif tab == 'all':
            return monitoring_alert_query.where(
                (monitoringAlertTable.monitoring_alert_name.contains(searching)) & (
                        common_where) & (monitoringAlertTable.id.in_(monitoring_alertId))).order_by(sorting).paginate(start, count).execute()

        return monitoring_alert_query.where(
            (monitoringAlertTable.monitoring_alert_name.contains(searching)) & (monitoringAlertTable.id.in_(monitoring_alertId)) & (monitoringAlertTable.status.in_(status_list)
                                                               ) & (
                common_where)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def getAllMonitoringAlertByUserId(self, user_id, monitoring_alert_ids, sorting='created_at', tab='all', desc=False, searching='',
                              page=0, count=10, isVerify=False):
        if sorting == 'created_at':
            sorting = monitoringAlertTable.created_at
        elif sorting == 'updated_at':
            sorting = monitoringAlertTable.updated_at
        elif sorting == 'option':
            sorting = monitoringAlertTable.option
        elif sorting == 'monitoring_alert_name':
            sorting = monitoringAlertTable.monitoring_alert_name
        elif sorting == 'status':
            sorting = peewee.Case(monitoringAlertTable.status, (
            (100, 1), (9, 2), (99, 3), (1, 4), (10, 5), (11, 6), (20, 7), (21, 8), (30, 9), (31, 10), (60, 11),
            (61, 12)), 0)

        if desc and sorting != 'status':
            sorting = sorting.desc()
        common_where = ((monitoringAlertTable.is_deleted == None) | (monitoringAlertTable.is_deleted == False)) & (
                    (monitoringAlertTable.user == user_id) | (monitoringAlertTable.id.in_(monitoring_alert_ids)))
        if isVerify:
            common_where = common_where & (monitoringAlertTable.isVerify == True)
        else:
            common_where = common_where & ((monitoringAlertTable.isVerify == False) | (monitoringAlertTable.isVerify == None))
        monitoring_alert_query = monitoringAlertTable.select(monitoringAlertTable.id, monitoringAlertTable.monitoring_alert_name, monitoringAlertTable.created_at,
                                            monitoringAlertTable.updated_at, monitoringAlertTable.status, monitoringAlertTable.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 40, 41, 60, 61]
        elif tab == 'all':
            query = monitoring_alert_query.where((monitoringAlertTable.monitoring_alert_name.contains(searching)) & (common_where))
            return query.order_by(sorting).paginate(page, count).execute(), query.count()
        query = monitoring_alert_query.where(
            (monitoringAlertTable.monitoring_alert_name.contains(searching)) & (monitoringAlertTable.status.in_(status_list)) & (common_where))
        return query.order_by(sorting).paginate(page, count).execute(), query.count()

    @wrapper
    def getMonitoringAlertsByUserId(self, tableInstance, user_id, sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = tableInstance.created_at
        elif sorting == 'updated_at':
            sorting = tableInstance.updated_at
        elif sorting == 'option':
            sorting = tableInstance.option
        elif sorting == 'monitoring_alert_name':
            sorting = tableInstance.monitoring_alert_name
        elif sorting == 'status':
            sorting = tableInstance.status

        if desc:
            sorting = sorting.desc()
        common_where = (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)
        monitoring_alert_query = tableInstance.select(tableInstance.id, tableInstance.monitoring_alert_name, tableInstance.created_at,tableInstance.updated_at, tableInstance.status, tableInstance.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 60, 61]
        elif tab == 'all':
            return monitoring_alert_query.where((tableInstance.monitoring_alert_name.contains(searching)) & (tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).order_by(sorting).paginate(start,count).execute()

        return monitoring_alert_query.where((tableInstance.monitoring_alert_name.contains(searching)) & (tableInstance.status.in_(status_list)
                        ) & (tableInstance.user == user_id) & (
                common_where)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def getMonitoringAlertsPriorityByUserId(self, user_id):
        orderBy = peewee.Case(monitoringAlertTable.status,
                        ((31, 0), (21, 1), (11, 2), (10, 3), (1, 4), (0, 5))).asc(nulls='LAST')
        common_where = (monitoringAlertTable.status.not_in([100, 0, 99, 9])) & (monitoringAlertTable.user == user_id) & ((monitoringAlertTable.is_deleted == None) | (monitoringAlertTable.is_deleted == False))

        monitoring_alerts_info = [x.__dict__['__data__'] for x in
                        monitoringAlertTable.select(monitoringAlertTable.id, monitoringAlertTable.monitoring_alert_name, monitoringAlertTable.status,
                                            monitoringAlertTable.updated_at,
                                             monitoringAlertTable.option).where(common_where).order_by(orderBy,
                                                                                               monitoringAlertTable.created_at.desc()).limit(3).execute()]

        return monitoring_alerts_info

    @wrapper
    def getMonitoringAlertStatusCountByFolderId(self, tableInstance, user_id, searching, shared = [], isShared = False):
        result = {}
        if isShared:
            common_where = ((tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)) & tableInstance.user != user_id
            result['ready'] = tableInstance.select().where(
                    (tableInstance.monitoring_alert_name.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.status == 'ready') & (tableInstance.id.in_(shared)) & (
                                common_where)).count()
            result['developing'] = tableInstance.select().where(
                    (tableInstance.monitoring_alert_name.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.status.in_([1, 10, 11, 20, 21, 30, 31])) & (
                                common_where)).count()
            result['done'] = tableInstance.select().where(
                    (tableInstance.monitoring_alert_name.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.status.in_([9,99,100])) & (
                                common_where)).count()
            result['all'] = tableInstance.select().where((tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.monitoring_alert_name.contains(searching)) & (
                            common_where)).count()
        else:
            common_where = (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)
            result['ready'] = tableInstance.select().where(
                (tableInstance.monitoring_alert_name.contains(searching)) & (tableInstance.status == 'ready') & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['developing'] = tableInstance.select().where(
                (tableInstance.monitoring_alert_name.contains(searching)) & (tableInstance.status.in_([1, 10, 11, 20, 21, 30, 31])) & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['done'] = tableInstance.select().where(
                (tableInstance.monitoring_alert_name.contains(searching)) & (tableInstance.status.in_([9,99,100])) & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['all'] = tableInstance.select().where(
                (tableInstance.user == user_id) & (tableInstance.monitoring_alert_name.contains(searching)) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
        return result

    @wrapper
    def getNotStartedMonitoringAlertsByUserId(self, user_id):
        return monitoringAlertTable.select().where((monitoringAlertTable.user == user_id) & (monitoringAlertTable.status == 0)).execute()

    @wrapper
    def getMonitoringAlertsByStatus(self, status):
        return monitoringAlertTable.select().where(monitoringAlertTable.status == status)

    @wrapper
    def getMonitoringAlertsById(self, monitoring_alertId):
        return monitoringAlertTable.select().where(monitoringAlertTable.id == monitoring_alertId).execute()

    @wrapper
    def getMonitoringAlertsByDatasetId(self, datasetId):
        return monitoringAlertTable.select().where(monitoringAlertTable.dataset == datasetId).execute()

    @wrapper
    def getAsnycTaskByMonitoringAlertId(self, monitoring_alertId):
        return asynctasksTable.get(asynctasksTable.monitoring_alert == monitoring_alertId)

    @wrapper
    def updateMonitoringAlertStatusById(self, rowId, status, statusText):
        monitoring_alert = self.getOneMonitoringAlertById(rowId, raw=True)
        task_type = 'monitoring_alert'

        if status == 99:
            user = self.getOneUserById(monitoring_alert.user, raw=True)
            user.cumulativeMonitoringAlertCount = user.cumulativeMonitoringAlertCount - 1
            user.save()
        if status > 0:
            asynctasksTable.create(**{
                "taskName": monitoring_alert.monitoring_alert_name,
                "taskNameEn": monitoring_alert.monitoring_alert_name,
                "taskType": task_type,
                "status": status,
                "user": monitoring_alert.user,
                "monitoring_alert": rowId,
                'isChecked': 0
            })

        return monitoringAlertTable.update(**{"status": status, "statusText": statusText}) \
            .where(monitoringAlertTable.id == rowId).execute()

    @wrapper
    def updateMonitoringAlertIsdeletedById(self, monitoring_alertId):
        return monitoringAlertTable.update(**{"is_deleted": True}).where(
            monitoringAlertTable.id == monitoring_alertId).execute()

    @wrapper
    def updateMonitoringAlert(self, rowId, data):
        data["updated_at"] = datetime.datetime.utcnow()
        # if data.get("status") != None:
        #     monitoring_alertData = self.getOneMonitoringAlertById(rowId)
        #     monitoring_alertData.update(data)
        #     monitoring_alerthistoriesTable.create(**(monitoring_alertData))
        return monitoringAlertTable.update(**data).where(monitoringAlertTable.id == rowId).execute()

    @wrapper
    def getCountMonitoringAlertsByStatusAndPlan(self, status, plan):
        return monitoringAlertTable.select() \
            .join(usersTable, on=(monitoringAlertTable.user == usersTable.id)) \
            .join(usageplansTable, on=(usersTable.usageplan == usageplansTable.id)) \
            .where(((monitoringAlertTable.status == status) | (monitoringAlertTable.status == status + 20)) & (monitoringAlertTable.option != 'colab') & (usageplansTable.planName == plan))

    @wrapper
    def getMonitoringAlertsByFlowId(self, flow_id, isSimplified = False):
        return monitoringAlertTable.select().where(monitoringAlertTable.flow_id == flow_id).order_by(monitoringAlertTable.status).execute()

    @wrapper
    def getMonitoringAlertsByFlowNodeId(self, flow_node_id, isSimplified = False):
        return monitoringAlertTable.select().where(monitoringAlertTable.flow_node_id == flow_node_id).order_by(monitoringAlertTable.status).execute()