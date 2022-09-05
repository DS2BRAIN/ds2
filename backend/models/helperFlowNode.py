import traceback
import datetime
import peewee
from dateutil.relativedelta import relativedelta
from internal.base_object import noneObject

from models import *
import functools

mongoDb = MongoDb()
class HelperFlowNode():

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
    def getOneFlowNodeById(self, rowId, raw=False):
        flow_node = flowNodeTable.get_or_none(flowNodeTable.id == rowId)
        if flow_node:
            return flow_node.__dict__['__data__'] if not raw else flow_node
        return flow_node

    @wrapper
    def get_all_flow_node_in_ids(self, ids, raw=False):
        result = flowNodeTable.select().where(flowNodeTable.id.in_(ids)).execute()
        if raw:
            return [raw for raw in result]
        else:
            return [raw.__dict__['__data__'] for raw in result]

    @wrapper
    def get_flow_node_status_by_id(self, row_id):
        return flowNodeTable.select(flowNodeTable.status, flowNodeTable.hasBestModel).where(
            flowNodeTable.id == row_id).limit(1).first()

    @wrapper
    def getOneFlowNodeAsyncById(self, rowId):
        return flowNodeTable.select(flowNodeTable.id, flowNodeTable.status, flowNodeTable.user).where(flowNodeTable.id == rowId).get()

    @wrapper
    def getFlowNodesByStatus(self, status):
        return flowNodeTable.select().where(flowNodeTable.status == status).execute()

    @wrapper
    def getSharedFlowNodesByUserId(self,user_id, flow_nodeId = [], sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = flowNodeTable.created_at
        elif sorting == 'updated_at':
            sorting = flowNodeTable.updated_at
        elif sorting == 'option':
            sorting = flowNodeTable.option
        elif sorting == 'flow_node_name':
            sorting = flowNodeTable.flow_node_name
        elif sorting == 'status':
            sorting = flowNodeTable.status

        if desc:
            sorting = sorting.desc()
        common_where = ((flowNodeTable.is_deleted == None) | (flowNodeTable.is_deleted == False)) & (flowNodeTable.user != user_id)
        flow_node_query = flowNodeTable.select(flowNodeTable.id, flowNodeTable.flow_node_name, flowNodeTable.created_at,
                                            flowNodeTable.updated_at, flowNodeTable.status, flowNodeTable.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 31, 60, 61]
        elif tab == 'all':
            return flow_node_query.where(
                (flowNodeTable.flow_node_name.contains(searching)) & (
                        common_where) & (flowNodeTable.id.in_(flow_nodeId))).order_by(sorting).paginate(start, count).execute()

        return flow_node_query.where(
            (flowNodeTable.flow_node_name.contains(searching)) & (flowNodeTable.id.in_(flow_nodeId)) & (flowNodeTable.status.in_(status_list)
                                                               ) & (
                common_where)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def getAllFlowNodeByUserId(self, user_id, flow_node_ids, sorting='created_at', tab='all', desc=False, searching='',
                              page=0, count=10, isVerify=False):
        if sorting == 'created_at':
            sorting = flowNodeTable.created_at
        elif sorting == 'updated_at':
            sorting = flowNodeTable.updated_at
        elif sorting == 'option':
            sorting = flowNodeTable.option
        elif sorting == 'flow_node_name':
            sorting = flowNodeTable.flow_node_name
        elif sorting == 'status':
            sorting = peewee.Case(flowNodeTable.status, (
            (100, 1), (9, 2), (99, 3), (1, 4), (10, 5), (11, 6), (20, 7), (21, 8), (30, 9), (31, 10), (60, 11),
            (61, 12)), 0)

        if desc and sorting != 'status':
            sorting = sorting.desc()
        common_where = ((flowNodeTable.is_deleted == None) | (flowNodeTable.is_deleted == False)) & (
                    (flowNodeTable.user == user_id) | (flowNodeTable.id.in_(flow_node_ids)))
        if isVerify:
            common_where = common_where & (flowNodeTable.isVerify == True)
        else:
            common_where = common_where & ((flowNodeTable.isVerify == False) | (flowNodeTable.isVerify == None))
        flow_node_query = flowNodeTable.select(flowNodeTable.id, flowNodeTable.flow_node_name, flowNodeTable.created_at,
                                            flowNodeTable.updated_at, flowNodeTable.status, flowNodeTable.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 40, 41, 60, 61]
        elif tab == 'all':
            query = flow_node_query.where((flowNodeTable.flow_node_name.contains(searching)) & (common_where))
            return query.order_by(sorting).paginate(page, count).execute(), query.count()
        query = flow_node_query.where(
            (flowNodeTable.flow_node_name.contains(searching)) & (flowNodeTable.status.in_(status_list)) & (common_where))
        return query.order_by(sorting).paginate(page, count).execute(), query.count()

    @wrapper
    def getFlowNodesByUserId(self, tableInstance, user_id, sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = tableInstance.created_at
        elif sorting == 'updated_at':
            sorting = tableInstance.updated_at
        elif sorting == 'option':
            sorting = tableInstance.option
        elif sorting == 'flow_node_name':
            sorting = tableInstance.flow_node_name
        elif sorting == 'status':
            sorting = tableInstance.status

        if desc:
            sorting = sorting.desc()
        common_where = (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)
        flow_node_query = tableInstance.select(tableInstance.id, tableInstance.flow_node_name, tableInstance.created_at,tableInstance.updated_at, tableInstance.status, tableInstance.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 60, 61]
        elif tab == 'all':
            return flow_node_query.where((tableInstance.flow_node_name.contains(searching)) & (tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).order_by(sorting).paginate(start,count).execute()

        return flow_node_query.where((tableInstance.flow_node_name.contains(searching)) & (tableInstance.status.in_(status_list)
                        ) & (tableInstance.user == user_id) & (
                common_where)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def getFlowNodesPriorityByUserId(self, user_id):
        orderBy = peewee.Case(flowNodeTable.status,
                        ((31, 0), (21, 1), (11, 2), (10, 3), (1, 4), (0, 5))).asc(nulls='LAST')
        common_where = (flowNodeTable.status.not_in([100, 0, 99, 9])) & (flowNodeTable.user == user_id) & ((flowNodeTable.is_deleted == None) | (flowNodeTable.is_deleted == False))

        flow_nodes_info = [x.__dict__['__data__'] for x in
                        flowNodeTable.select(flowNodeTable.id, flowNodeTable.flow_node_name, flowNodeTable.status,
                                            flowNodeTable.updated_at,
                                             flowNodeTable.option).where(common_where).order_by(orderBy,
                                                                                               flowNodeTable.created_at.desc()).limit(3).execute()]

        return flow_nodes_info

    @wrapper
    def getFlowNodeStatusCountByFolderId(self, tableInstance, user_id, searching, shared = [], isShared = False):
        result = {}
        if isShared:
            common_where = ((tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)) & tableInstance.user != user_id
            result['ready'] = tableInstance.select().where(
                    (tableInstance.flow_node_name.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.status == 'ready') & (tableInstance.id.in_(shared)) & (
                                common_where)).count()
            result['developing'] = tableInstance.select().where(
                    (tableInstance.flow_node_name.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.status.in_([1, 10, 11, 20, 21, 30, 31])) & (
                                common_where)).count()
            result['done'] = tableInstance.select().where(
                    (tableInstance.flow_node_name.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.status.in_([9,99,100])) & (
                                common_where)).count()
            result['all'] = tableInstance.select().where((tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.flow_node_name.contains(searching)) & (
                            common_where)).count()
        else:
            common_where = (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)
            result['ready'] = tableInstance.select().where(
                (tableInstance.flow_node_name.contains(searching)) & (tableInstance.status == 'ready') & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['developing'] = tableInstance.select().where(
                (tableInstance.flow_node_name.contains(searching)) & (tableInstance.status.in_([1, 10, 11, 20, 21, 30, 31])) & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['done'] = tableInstance.select().where(
                (tableInstance.flow_node_name.contains(searching)) & (tableInstance.status.in_([9,99,100])) & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['all'] = tableInstance.select().where(
                (tableInstance.user == user_id) & (tableInstance.flow_node_name.contains(searching)) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
        return result

    @wrapper
    def getNotStartedFlowNodesByUserId(self, user_id):
        return flowNodeTable.select().where((flowNodeTable.user == user_id) & (flowNodeTable.status == 0)).execute()

    @wrapper
    def getFlowNodesByStatus(self, status):
        return flowNodeTable.select().where(flowNodeTable.status == status)

    @wrapper
    def getFlowNodesById(self, flow_nodeId):
        return flowNodeTable.select().where(flowNodeTable.id == flow_nodeId).execute()

    @wrapper
    def getFlowNodesByDatasetId(self, datasetId):
        return flowNodeTable.select().where(flowNodeTable.dataset == datasetId).execute()

    @wrapper
    def getAsnycTaskByFlowNodeId(self, flow_nodeId):
        return asynctasksTable.get(asynctasksTable.flow_node == flow_nodeId)

    @wrapper
    def updateFlowNodeStatusById(self, rowId, status, statusText):
        flow_node = self.getOneFlowNodeById(rowId, raw=True)
        task_type = 'flow_node'

        if status == 99:
            user = self.getOneUserById(flow_node.user, raw=True)
            user.cumulativeFlowNodeCount = user.cumulativeFlowNodeCount - 1
            user.save()
        if status > 0:
            asynctasksTable.create(**{
                "taskName": flow_node.flow_node_name,
                "taskNameEn": flow_node.flow_node_name,
                "taskType": task_type,
                "status": status,
                "user": flow_node.user,
                "flow_node": rowId,
                'isChecked': 0
            })
            # try:
            #     asyncTaskId = self.getAsnycTaskByFlowNodeId(rowId)
            #     asyncTaskId.status = status
            #     asyncTaskId.save()
            # except:
            #     asynctasksTable.create(**{
            #         "taskName": flow_node.flow_node_name,
            #         "taskType": "develop",
            #         "status": status,
            #         "user": flow_node.user,
            #         "flow_node": rowId
            #     })
            #     pass

        return flowNodeTable.update(**{"status": status, "statusText": statusText}) \
            .where(flowNodeTable.id == rowId).execute()

    @wrapper
    def updateFlowNodeIsdeletedById(self, flow_nodeId):
        return flowNodeTable.update(**{"is_deleted": True}).where(
            flowNodeTable.id == flow_nodeId).execute()

    @wrapper
    def updateFlowNode(self, rowId, data):
        data["updated_at"] = datetime.datetime.utcnow()
        # if data.get("status") != None:
        #     flow_nodeData = self.getOneFlowNodeById(rowId)
        #     flow_nodeData.update(data)
        #     flow_nodehistoriesTable.create(**(flow_nodeData))
        return flowNodeTable.update(**data).where(flowNodeTable.id == rowId).execute()

    @wrapper
    def getCountFlowNodesByStatusAndPlan(self, status, plan):
        return flowNodeTable.select() \
            .join(usersTable, on=(flowNodeTable.user == usersTable.id)) \
            .join(usageplansTable, on=(usersTable.usageplan == usageplansTable.id)) \
            .where(((flowNodeTable.status == status) | (flowNodeTable.status == status + 20)) & (flowNodeTable.option != 'colab') & (usageplansTable.planName == plan))

    @wrapper
    def getFlowNodesByFlowId(self, flow_id, isSimplified = False):
        return flowNodeTable.select().where(flowNodeTable.flow_id == flow_id).order_by(flowNodeTable.status).execute()