import traceback
import datetime
import peewee
from dateutil.relativedelta import relativedelta
from internal.base_object import noneObject

from models import *
import functools

mongoDb = MongoDb()
class HelperFlowComponent():

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
    def getOneFlowComponentById(self, rowId, raw=False):
        flow_component = flowComponentTable.get_or_none(flowComponentTable.id == rowId)
        if flow_component:
            return flow_component.__dict__['__data__'] if not raw else flow_component
        return flow_component

    @wrapper
    def get_all_flow_component_in_ids(self, ids, raw=False):
        result = flowComponentTable.select().where(flowComponentTable.id.in_(ids)).execute()
        if raw:
            return [raw for raw in result]
        else:
            return [raw.__dict__['__data__'] for raw in result]

    @wrapper
    def get_flow_component_status_by_id(self, row_id):
        return flowComponentTable.select(flowComponentTable.status, flowComponentTable.hasBestModel).where(
            flowComponentTable.id == row_id).limit(1).first()

    @wrapper
    def getOneFlowComponentAsyncById(self, rowId):
        return flowComponentTable.select(flowComponentTable.id, flowComponentTable.status, flowComponentTable.user).where(flowComponentTable.id == rowId).get()

    @wrapper
    def getFlowComponentsByStatus(self, status):
        return flowComponentTable.select().where(flowComponentTable.status == status).execute()

    @wrapper
    def getSharedFlowComponentsByUserId(self,user_id, flow_componentId = [], sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = flowComponentTable.created_at
        elif sorting == 'updated_at':
            sorting = flowComponentTable.updated_at
        elif sorting == 'option':
            sorting = flowComponentTable.option
        elif sorting == 'flow_component_name':
            sorting = flowComponentTable.flow_component_name
        elif sorting == 'status':
            sorting = flowComponentTable.status

        if desc:
            sorting = sorting.desc()
        common_where = ((flowComponentTable.is_deleted == None) | (flowComponentTable.is_deleted == False)) & (flowComponentTable.user != user_id)
        flow_component_query = flowComponentTable.select(flowComponentTable.id, flowComponentTable.flow_component_name, flowComponentTable.created_at,
                                            flowComponentTable.updated_at, flowComponentTable.status, flowComponentTable.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 31, 60, 61]
        elif tab == 'all':
            return flow_component_query.where(
                (flowComponentTable.flow_component_name.contains(searching)) & (
                        common_where) & (flowComponentTable.id.in_(flow_componentId))).order_by(sorting).paginate(start, count).execute()

        return flow_component_query.where(
            (flowComponentTable.flow_component_name.contains(searching)) & (flowComponentTable.id.in_(flow_componentId)) & (flowComponentTable.status.in_(status_list)
                                                               ) & (
                common_where)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def getAllFlowComponentByUserId(self, user_id, flow_component_ids, sorting='created_at', tab='all', desc=False, searching='',
                              page=0, count=10, isVerify=False):
        if sorting == 'created_at':
            sorting = flowComponentTable.created_at
        elif sorting == 'updated_at':
            sorting = flowComponentTable.updated_at
        elif sorting == 'option':
            sorting = flowComponentTable.option
        elif sorting == 'flow_component_name':
            sorting = flowComponentTable.flow_component_name
        elif sorting == 'status':
            sorting = peewee.Case(flowComponentTable.status, (
            (100, 1), (9, 2), (99, 3), (1, 4), (10, 5), (11, 6), (20, 7), (21, 8), (30, 9), (31, 10), (60, 11),
            (61, 12)), 0)

        if desc and sorting != 'status':
            sorting = sorting.desc()
        common_where = ((flowComponentTable.is_deleted == None) | (flowComponentTable.is_deleted == False)) & (
                    (flowComponentTable.user == user_id) | (flowComponentTable.id.in_(flow_component_ids)))
        if isVerify:
            common_where = common_where & (flowComponentTable.isVerify == True)
        else:
            common_where = common_where & ((flowComponentTable.isVerify == False) | (flowComponentTable.isVerify == None))
        flow_component_query = flowComponentTable.select(flowComponentTable.id, flowComponentTable.flow_component_name, flowComponentTable.created_at,
                                            flowComponentTable.updated_at, flowComponentTable.status, flowComponentTable.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 40, 41, 60, 61]
        elif tab == 'all':
            query = flow_component_query.where((flowComponentTable.flow_component_name.contains(searching)) & (common_where))
            return query.order_by(sorting).paginate(page, count).execute(), query.count()
        query = flow_component_query.where(
            (flowComponentTable.flow_component_name.contains(searching)) & (flowComponentTable.status.in_(status_list)) & (common_where))
        return query.order_by(sorting).paginate(page, count).execute(), query.count()

    @wrapper
    def getFlowComponentsByUserId(self, tableInstance, user_id, sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = tableInstance.created_at
        elif sorting == 'updated_at':
            sorting = tableInstance.updated_at
        elif sorting == 'option':
            sorting = tableInstance.option
        elif sorting == 'flow_component_name':
            sorting = tableInstance.flow_component_name
        elif sorting == 'status':
            sorting = tableInstance.status

        if desc:
            sorting = sorting.desc()
        common_where = (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)
        flow_component_query = tableInstance.select(tableInstance.id, tableInstance.flow_component_name, tableInstance.created_at,tableInstance.updated_at, tableInstance.status, tableInstance.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 60, 61]
        elif tab == 'all':
            return flow_component_query.where((tableInstance.flow_component_name.contains(searching)) & (tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).order_by(sorting).paginate(start,count).execute()

        return flow_component_query.where((tableInstance.flow_component_name.contains(searching)) & (tableInstance.status.in_(status_list)
                        ) & (tableInstance.user == user_id) & (
                common_where)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def getFlowComponentsPriorityByUserId(self, user_id):
        orderBy = peewee.Case(flowComponentTable.status,
                        ((31, 0), (21, 1), (11, 2), (10, 3), (1, 4), (0, 5))).asc(nulls='LAST')
        common_where = (flowComponentTable.status.not_in([100, 0, 99, 9])) & (flowComponentTable.user == user_id) & ((flowComponentTable.is_deleted == None) | (flowComponentTable.is_deleted == False))

        flow_components_info = [x.__dict__['__data__'] for x in
                        flowComponentTable.select(flowComponentTable.id, flowComponentTable.flow_component_name, flowComponentTable.status,
                                            flowComponentTable.updated_at,
                                             flowComponentTable.option).where(common_where).order_by(orderBy,
                                                                                               flowComponentTable.created_at.desc()).limit(3).execute()]

        return flow_components_info

    @wrapper
    def getFlowComponentStatusCountByFolderId(self, tableInstance, user_id, searching, shared = [], isShared = False):
        result = {}
        if isShared:
            common_where = ((tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)) & tableInstance.user != user_id
            result['ready'] = tableInstance.select().where(
                    (tableInstance.flow_component_name.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.status == 'ready') & (tableInstance.id.in_(shared)) & (
                                common_where)).count()
            result['developing'] = tableInstance.select().where(
                    (tableInstance.flow_component_name.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.status.in_([1, 10, 11, 20, 21, 30, 31])) & (
                                common_where)).count()
            result['done'] = tableInstance.select().where(
                    (tableInstance.flow_component_name.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.status.in_([9,99,100])) & (
                                common_where)).count()
            result['all'] = tableInstance.select().where((tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.flow_component_name.contains(searching)) & (
                            common_where)).count()
        else:
            common_where = (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)
            result['ready'] = tableInstance.select().where(
                (tableInstance.flow_component_name.contains(searching)) & (tableInstance.status == 'ready') & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['developing'] = tableInstance.select().where(
                (tableInstance.flow_component_name.contains(searching)) & (tableInstance.status.in_([1, 10, 11, 20, 21, 30, 31])) & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['done'] = tableInstance.select().where(
                (tableInstance.flow_component_name.contains(searching)) & (tableInstance.status.in_([9,99,100])) & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['all'] = tableInstance.select().where(
                (tableInstance.user == user_id) & (tableInstance.flow_component_name.contains(searching)) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
        return result

    @wrapper
    def getNotStartedFlowComponentsByUserId(self, user_id):
        return flowComponentTable.select().where((flowComponentTable.user == user_id) & (flowComponentTable.status == 0)).execute()

    @wrapper
    def getFlowComponentsByStatus(self, status):
        return flowComponentTable.select().where(flowComponentTable.status == status)

    @wrapper
    def getFlowComponentsById(self, flow_componentId):
        return flowComponentTable.select().where(flowComponentTable.id == flow_componentId).execute()

    @wrapper
    def getFlowComponentsByDatasetId(self, datasetId):
        return flowComponentTable.select().where(flowComponentTable.dataset == datasetId).execute()

    @wrapper
    def getAsnycTaskByFlowComponentId(self, flow_componentId):
        return asynctasksTable.get(asynctasksTable.flow_component == flow_componentId)

    @wrapper
    def updateFlowComponentStatusById(self, rowId, status, statusText):
        flow_component = self.getOneFlowComponentById(rowId, raw=True)
        task_type = 'flow_component'

        if status == 99:
            user = self.getOneUserById(flow_component.user, raw=True)
            user.cumulativeFlowComponentCount = user.cumulativeFlowComponentCount - 1
            user.save()
        if status > 0:
            asynctasksTable.create(**{
                "taskName": flow_component.flow_component_name,
                "taskNameEn": flow_component.flow_component_name,
                "taskType": task_type,
                "status": status,
                "user": flow_component.user,
                "flow_component": rowId,
                'isChecked': 0
            })
            # try:
            #     asyncTaskId = self.getAsnycTaskByFlowComponentId(rowId)
            #     asyncTaskId.status = status
            #     asyncTaskId.save()
            # except:
            #     asynctasksTable.create(**{
            #         "taskName": flow_component.flow_component_name,
            #         "taskType": "develop",
            #         "status": status,
            #         "user": flow_component.user,
            #         "flow_component": rowId
            #     })
            #     pass

        return flowComponentTable.update(**{"status": status, "statusText": statusText}) \
            .where(flowComponentTable.id == rowId).execute()

    @wrapper
    def updateFlowComponentIsdeletedById(self, flow_componentId):
        return flowComponentTable.update(**{"is_deleted": True}).where(
            flowComponentTable.id == flow_componentId).execute()

    @wrapper
    def updateFlowComponent(self, rowId, data):
        data["updated_at"] = datetime.datetime.utcnow()
        # if data.get("status") != None:
        #     flow_componentData = self.getOneFlowComponentById(rowId)
        #     flow_componentData.update(data)
        #     flow_componenthistoriesTable.create(**(flow_componentData))
        return flowComponentTable.update(**data).where(flowComponentTable.id == rowId).execute()

    @wrapper
    def getCountFlowComponentsByStatusAndPlan(self, status, plan):
        return flowComponentTable.select() \
            .join(usersTable, on=(flowComponentTable.user == usersTable.id)) \
            .join(usageplansTable, on=(usersTable.usageplan == usageplansTable.id)) \
            .where(((flowComponentTable.status == status) | (flowComponentTable.status == status + 20)) & (flowComponentTable.option != 'colab') & (usageplansTable.planName == plan))

    @wrapper
    def getFlowComponentsByFlowId(self, flow_id, isSimplified = False):
        return flowComponentTable.select().where(flowComponentTable.flow_id == flow_id).order_by(flowComponentTable.status).execute()