import traceback
import datetime
import peewee
from dateutil.relativedelta import relativedelta
from internal.base_object import noneObject

from models import *
import functools

mongoDb = MongoDb()
class HelperFlow():

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
    def getOneFlowById(self, rowId, raw=False):
        flow = flowTable.get_or_none(flowTable.id == rowId)
        if flow:
            return flow.__dict__['__data__'] if not raw else flow
        return flow

    @wrapper
    def get_all_flow_in_ids(self, ids, raw=False):
        result = flowTable.select().where(flowTable.id.in_(ids)).execute()
        if raw:
            return [raw for raw in result]
        else:
            return [raw.__dict__['__data__'] for raw in result]

    @wrapper
    def get_flow_status_by_id(self, row_id):
        return flowTable.select(flowTable.status, flowTable.hasBestModel).where(
            flowTable.id == row_id).limit(1).first()

    @wrapper
    def getOneFlowAsyncById(self, rowId):
        return flowTable.select(flowTable.id, flowTable.status, flowTable.user).where(flowTable.id == rowId).get()

    @wrapper
    def getFlowsByStatus(self, status):
        return flowTable.select().where(flowTable.status == status).execute()

    @wrapper
    def getSharedFlowsByUserId(self,user_id, flowId = [], sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = flowTable.created_at
        elif sorting == 'updated_at':
            sorting = flowTable.updated_at
        elif sorting == 'option':
            sorting = flowTable.option
        elif sorting == 'flow_name':
            sorting = flowTable.flow_name
        elif sorting == 'status':
            sorting = flowTable.status

        if desc:
            sorting = sorting.desc()
        common_where = ((flowTable.is_deleted == None) | (flowTable.is_deleted == False)) & (flowTable.user != user_id)
        flow_query = flowTable.select(flowTable.id, flowTable.flow_name, flowTable.created_at,
                                            flowTable.updated_at, flowTable.status, flowTable.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 31, 60, 61]
        elif tab == 'all':
            return flow_query.where(
                (flowTable.flow_name.contains(searching)) & (
                        common_where) & (flowTable.id.in_(flowId))).order_by(sorting).paginate(start, count).execute()

        return flow_query.where(
            (flowTable.flow_name.contains(searching)) & (flowTable.id.in_(flowId)) & (flowTable.status.in_(status_list)
                                                               ) & (
                common_where)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def getAllFlowByUserId(self, user_id, flow_ids, sorting='created_at', tab='all', desc=False, searching='',
                              page=0, count=10, isVerify=False):
        if sorting == 'created_at':
            sorting = flowTable.created_at
        elif sorting == 'updated_at':
            sorting = flowTable.updated_at
        elif sorting == 'option':
            sorting = flowTable.option
        elif sorting == 'flow_name':
            sorting = flowTable.flow_name
        elif sorting == 'status':
            sorting = peewee.Case(flowTable.status, (
            (100, 1), (9, 2), (99, 3), (1, 4), (10, 5), (11, 6), (20, 7), (21, 8), (30, 9), (31, 10), (60, 11),
            (61, 12)), 0)

        if desc and sorting != 'status':
            sorting = sorting.desc()
        common_where = ((flowTable.is_deleted == None) | (flowTable.is_deleted == False)) & (
                    (flowTable.user == user_id) | (flowTable.id.in_(flow_ids)))
        if isVerify:
            common_where = common_where & (flowTable.isVerify == True)
        else:
            common_where = common_where & ((flowTable.isVerify == False) | (flowTable.isVerify == None))
        flow_query = flowTable.select(flowTable.id, flowTable.flow_name, flowTable.created_at,
                                            flowTable.updated_at, flowTable.status, flowTable.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 40, 41, 60, 61]
        elif tab == 'all':
            query = flow_query.where((flowTable.flow_name.contains(searching)) & (common_where))
            return query.order_by(sorting).paginate(page, count).execute(), query.count()
        query = flow_query.where(
            (flowTable.flow_name.contains(searching)) & (flowTable.status.in_(status_list)) & (common_where))
        return query.order_by(sorting).paginate(page, count).execute(), query.count()

    @wrapper
    def getFlowsByUserId(self, tableInstance, user_id, sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = tableInstance.created_at
        elif sorting == 'updated_at':
            sorting = tableInstance.updated_at
        elif sorting == 'option':
            sorting = tableInstance.option
        elif sorting == 'flow_name':
            sorting = tableInstance.flow_name
        elif sorting == 'status':
            sorting = tableInstance.status

        if desc:
            sorting = sorting.desc()
        common_where = (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)
        flow_query = tableInstance.select(tableInstance.id, tableInstance.flow_name, tableInstance.created_at,tableInstance.updated_at, tableInstance.status, tableInstance.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 60, 61]
        elif tab == 'all':
            return flow_query.where((tableInstance.flow_name.contains(searching)) & (tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).order_by(sorting).paginate(start,count).execute()

        return flow_query.where((tableInstance.flow_name.contains(searching)) & (tableInstance.status.in_(status_list)
                        ) & (tableInstance.user == user_id) & (
                common_where)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def getFlowsPriorityByUserId(self, user_id):
        orderBy = peewee.Case(flowTable.status,
                        ((31, 0), (21, 1), (11, 2), (10, 3), (1, 4), (0, 5))).asc(nulls='LAST')
        common_where = (flowTable.status.not_in([100, 0, 99, 9])) & (flowTable.user == user_id) & ((flowTable.is_deleted == None) | (flowTable.is_deleted == False))

        flowsInfo = [x.__dict__['__data__'] for x in
                        flowTable.select(flowTable.id, flowTable.flow_name, flowTable.status,
                                            flowTable.updated_at,
                                             flowTable.option).where(common_where).order_by(orderBy,
                                                                                               flowTable.created_at.desc()).limit(3).execute()]

        return flowsInfo

    @wrapper
    def getFlowStatusCountByFolderId(self, tableInstance, user_id, searching, shared = [], isShared = False):
        result = {}
        if isShared:
            common_where = ((tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)) & tableInstance.user != user_id
            result['ready'] = tableInstance.select().where(
                    (tableInstance.flow_name.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.status == 'ready') & (tableInstance.id.in_(shared)) & (
                                common_where)).count()
            result['developing'] = tableInstance.select().where(
                    (tableInstance.flow_name.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.status.in_([1, 10, 11, 20, 21, 30, 31])) & (
                                common_where)).count()
            result['done'] = tableInstance.select().where(
                    (tableInstance.flow_name.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.status.in_([9,99,100])) & (
                                common_where)).count()
            result['all'] = tableInstance.select().where((tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.flow_name.contains(searching)) & (
                            common_where)).count()
        else:
            common_where = (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)
            result['ready'] = tableInstance.select().where(
                (tableInstance.flow_name.contains(searching)) & (tableInstance.status == 'ready') & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['developing'] = tableInstance.select().where(
                (tableInstance.flow_name.contains(searching)) & (tableInstance.status.in_([1, 10, 11, 20, 21, 30, 31])) & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['done'] = tableInstance.select().where(
                (tableInstance.flow_name.contains(searching)) & (tableInstance.status.in_([9,99,100])) & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['all'] = tableInstance.select().where(
                (tableInstance.user == user_id) & (tableInstance.flow_name.contains(searching)) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
        return result

    @wrapper
    def getNotStartedFlowsByUserId(self, user_id):
        return flowTable.select().where((flowTable.user == user_id) & (flowTable.status == 0)).execute()

    @wrapper
    def getFlowsByStatus(self, status):
        return flowTable.select().where(flowTable.status == status)

    @wrapper
    def getFlowsById(self, flowId):
        return flowTable.select().where(flowTable.id == flowId).execute()

    @wrapper
    def getFlowsByDatasetId(self, datasetId):
        return flowTable.select().where(flowTable.dataset == datasetId).execute()

    @wrapper
    def getAsnycTaskByFlowId(self, flowId):
        return asynctasksTable.get(asynctasksTable.flow == flowId)

    @wrapper
    def updateFlowStatusById(self, rowId, status, statusText):
        flow = self.getOneFlowById(rowId, raw=True)
        task_type = 'flow'

        if status == 99:
            user = self.getOneUserById(flow.user, raw=True)
            user.cumulativeFlowCount = user.cumulativeFlowCount - 1
            user.save()
        if status > 0:
            asynctasksTable.create(**{
                "taskName": flow.flow_name,
                "taskNameEn": flow.flow_name,
                "taskType": task_type,
                "status": status,
                "user": flow.user,
                "flow": rowId,
                'isChecked': 0
            })
            # try:
            #     asyncTaskId = self.getAsnycTaskByFlowId(rowId)
            #     asyncTaskId.status = status
            #     asyncTaskId.save()
            # except:
            #     asynctasksTable.create(**{
            #         "taskName": flow.flow_name,
            #         "taskType": "develop",
            #         "status": status,
            #         "user": flow.user,
            #         "flow": rowId
            #     })
            #     pass

        return flowTable.update(**{"status": status, "statusText": statusText}) \
            .where(flowTable.id == rowId).execute()

    @wrapper
    def updateFlowIsdeletedById(self, flowId):
        return flowTable.update(**{"is_deleted": True}).where(
            flowTable.id == flowId).execute()

    @wrapper
    def updateFlow(self, rowId, data):
        data["updated_at"] = datetime.datetime.utcnow()
        # if data.get("status") != None:
        #     flowData = self.getOneFlowById(rowId)
        #     flowData.update(data)
        #     flowhistoriesTable.create(**(flowData))
        return flowTable.update(**data).where(flowTable.id == rowId).execute()

    @wrapper
    def getCountFlowsByStatusAndPlan(self, status, plan):
        return flowTable.select() \
            .join(usersTable, on=(flowTable.user == usersTable.id)) \
            .join(usageplansTable, on=(usersTable.usageplan == usageplansTable.id)) \
            .where(((flowTable.status == status) | (flowTable.status == status + 20)) & (flowTable.option != 'colab') & (usageplansTable.planName == plan))
