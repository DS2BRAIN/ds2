import traceback
import datetime
import peewee
from dateutil.relativedelta import relativedelta
from internal.base_object import noneObject

from models import *
import functools

mongoDb = MongoDb()
class HelperCommand():

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
    def getOneCommandById(self, rowId, raw=False):
        command = commandTable.get_or_none(commandTable.id == rowId)
        if command:
            return command.__dict__['__data__'] if not raw else command
        return command

    @wrapper
    def get_all_command_in_ids(self, ids, raw=False):
        result = commandTable.select().where(commandTable.id.in_(ids)).execute()
        if raw:
            return [raw for raw in result]
        else:
            return [raw.__dict__['__data__'] for raw in result]

    @wrapper
    def get_command_status_by_id(self, row_id):
        return commandTable.select(commandTable.status).where(
            commandTable.id == row_id).limit(1).first()

    @wrapper
    def getOneCommandAsyncById(self, rowId):
        return commandTable.select(commandTable.id, commandTable.status, commandTable.user).where(commandTable.id == rowId).get()

    @wrapper
    def getCommandsByStatus(self, status):
        return commandTable.select().where(commandTable.status == status).execute()

    @wrapper
    def getSharedCommandsByUserId(self,user_id, commandId = [], sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = commandTable.created_at
        elif sorting == 'updated_at':
            sorting = commandTable.updated_at
        elif sorting == 'option':
            sorting = commandTable.option
        elif sorting == 'command':
            sorting = commandTable.command
        elif sorting == 'status':
            sorting = commandTable.status

        if desc:
            sorting = sorting.desc()
        common_where = ((commandTable.is_deleted == None) | (commandTable.is_deleted == False)) & (commandTable.user != user_id)
        command_query = commandTable.select(commandTable.id, commandTable.command, commandTable.created_at,
                                            commandTable.updated_at, commandTable.status, commandTable.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 31, 60, 61]
        elif tab == 'all':
            return command_query.where(
                (commandTable.command.contains(searching)) & (
                        common_where) & (commandTable.id.in_(commandId))).order_by(sorting).paginate(start, count).execute()

        return command_query.where(
            (commandTable.command.contains(searching)) & (commandTable.id.in_(commandId)) & (commandTable.status.in_(status_list)
                                                               ) & (
                common_where)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def getAllCommand(self, sorting='created_at', tab='all', desc=False, searching='',
                              page=0, count=10):
        if sorting == 'created_at':
            sorting = commandTable.created_at
        elif sorting == 'updated_at':
            sorting = commandTable.updated_at
        elif sorting == 'option':
            sorting = commandTable.option
        elif sorting == 'command':
            sorting = commandTable.command
        elif sorting == 'status':
            sorting = peewee.Case(commandTable.status, (
            (100, 1), (9, 2), (99, 3), (1, 4), (10, 5), (11, 6), (20, 7), (21, 8), (30, 9), (31, 10), (60, 11),
            (61, 12)), 0)
        else:
            sorting = commandTable.watch

        # if desc and sorting == 'status':
        sorting = sorting.desc()
        common_where = ((commandTable.is_deleted == None) | (commandTable.is_deleted == False)) & (commandTable.status != "Under Review")
        command_query = commandTable.select()
        status_list = []
        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 40, 41, 60, 61]
        elif tab == 'all':
            status_list = []

        if not status_list:
            query = command_query
        else:
            query = command_query.where(
                (commandTable.command.contains(searching)) & (commandTable.status.in_(status_list)) & (common_where))
        return query.order_by(commandTable.is_accept_iframe.desc(), sorting).paginate(page, count).execute(), query.count()

    @wrapper
    def getAllCommandByUserId(self, user_id, command_ids, sorting='created_at', tab='all', desc=False, searching='',
                              page=0, count=10):
        if sorting == 'created_at':
            sorting = commandTable.created_at
        elif sorting == 'updated_at':
            sorting = commandTable.updated_at
        elif sorting == 'option':
            sorting = commandTable.option
        elif sorting == 'command':
            sorting = commandTable.command
        elif sorting == 'status':
            sorting = peewee.Case(commandTable.status, (
            (100, 1), (9, 2), (99, 3), (1, 4), (10, 5), (11, 6), (20, 7), (21, 8), (30, 9), (31, 10), (60, 11),
            (61, 12)), 0)

        if desc and sorting != 'status':
            sorting = sorting.desc()
        common_where = ((commandTable.is_deleted == None) | (commandTable.is_deleted == False)) & (
                    (commandTable.user == user_id) | (commandTable.id.in_(command_ids)))
        command_query = commandTable.select()

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 40, 41, 60, 61]
        elif tab == 'all':
            query = command_query.where((commandTable.command.contains(searching)) & (common_where))
            return query.order_by(sorting).paginate(page, count).execute(), query.count()
        query = command_query.where(
            (commandTable.command.contains(searching)) & (commandTable.status.in_(status_list)) & (common_where))
        return query.order_by(sorting).paginate(page, count).execute(), query.count()

    @wrapper
    def getCommandsByUserId(self, tableInstance, user_id, sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = tableInstance.created_at
        elif sorting == 'updated_at':
            sorting = tableInstance.updated_at
        elif sorting == 'option':
            sorting = tableInstance.option
        elif sorting == 'command':
            sorting = tableInstance.command
        elif sorting == 'status':
            sorting = tableInstance.status

        if desc:
            sorting = sorting.desc()
        common_where = (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)
        command_query = tableInstance.select(tableInstance.id, tableInstance.command, tableInstance.created_at,tableInstance.updated_at, tableInstance.status, tableInstance.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 60, 61]
        elif tab == 'all':
            return command_query.where((tableInstance.command.contains(searching)) & (tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).order_by(sorting).paginate(start,count).execute()

        return command_query.where((tableInstance.command.contains(searching)) & (tableInstance.status.in_(status_list)
                        ) & (tableInstance.user == user_id) & (
                common_where)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def getCommandsPriorityByUserId(self, user_id):
        orderBy = peewee.Case(commandTable.status,
                        ((31, 0), (21, 1), (11, 2), (10, 3), (1, 4), (0, 5))).asc(nulls='LAST')
        common_where = (commandTable.status.not_in([100, 0, 99, 9])) & (commandTable.user == user_id) & ((commandTable.is_deleted == None) | (commandTable.is_deleted == False))

        commandsInfo = [x.__dict__['__data__'] for x in
                        commandTable.select(commandTable.id, commandTable.command, commandTable.status,
                                            commandTable.updated_at,
                                             commandTable.option).where(common_where).order_by(orderBy,
                                                                                               commandTable.created_at.desc()).limit(3).execute()]

        return commandsInfo

    @wrapper
    def getCommandStatusCountByFolderId(self, tableInstance, user_id, searching, shared = [], isShared = False):
        result = {}
        if isShared:
            common_where = ((tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)) & tableInstance.user != user_id
            result['ready'] = tableInstance.select().where(
                    (tableInstance.command.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.status == 'ready') & (tableInstance.id.in_(shared)) & (
                                common_where)).count()
            result['developing'] = tableInstance.select().where(
                    (tableInstance.command.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.status.in_([1, 10, 11, 20, 21, 30, 31])) & (
                                common_where)).count()
            result['done'] = tableInstance.select().where(
                    (tableInstance.command.contains(searching)) & (tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.status.in_([9,99,100])) & (
                                common_where)).count()
            result['all'] = tableInstance.select().where((tableInstance.user != user_id) & (tableInstance.id.in_(shared)) & (tableInstance.command.contains(searching)) & (
                            common_where)).count()
        else:
            common_where = (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)
            result['ready'] = tableInstance.select().where(
                (tableInstance.command.contains(searching)) & (tableInstance.status == 'ready') & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['developing'] = tableInstance.select().where(
                (tableInstance.command.contains(searching)) & (tableInstance.status.in_([1, 10, 11, 20, 21, 30, 31])) & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['done'] = tableInstance.select().where(
                (tableInstance.command.contains(searching)) & (tableInstance.status.in_([9,99,100])) & (
                            tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
            result['all'] = tableInstance.select().where(
                (tableInstance.user == user_id) & (tableInstance.command.contains(searching)) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).count()
        return result

    @wrapper
    def getNotStartedCommandsByUserId(self, user_id):
        return commandTable.select().where((commandTable.user == user_id) & (commandTable.status == 0)).execute()

    @wrapper
    def getCommandsByStatus(self, status):
        return commandTable.select().where(commandTable.status == status)

    @wrapper
    def getCommandsById(self, commandId):
        return commandTable.select().where(commandTable.id == commandId).execute()

    @wrapper
    def getCommandsByDatasetId(self, datasetId):
        return commandTable.select().where(commandTable.dataset == datasetId).execute()

    @wrapper
    def getAsnycTaskByCommandId(self, commandId):
        return asynctasksTable.get(asynctasksTable.command == commandId)

    @wrapper
    def updateCommandStatusById(self, rowId, status, statusText):
        command = self.getOneCommandById(rowId, raw=True)
        task_type = 'command'

        if status == 99:
            user = self.getOneUserById(command.user, raw=True)
            user.cumulativeCommandCount = user.cumulativeCommandCount - 1
            user.save()
        if status > 0:
            asynctasksTable.create(**{
                "taskName": command.command,
                "taskNameEn": command.command,
                "taskType": task_type,
                "status": status,
                "user": command.user,
                "command": rowId,
                'isChecked': 0
            })
            # try:
            #     asyncTaskId = self.getAsnycTaskByCommandId(rowId)
            #     asyncTaskId.status = status
            #     asyncTaskId.save()
            # except:
            #     asynctasksTable.create(**{
            #         "taskName": command.command,
            #         "taskType": "develop",
            #         "status": status,
            #         "user": command.user,
            #         "command": rowId
            #     })
            #     pass

        return commandTable.update(**{"status": status, "statusText": statusText}) \
            .where(commandTable.id == rowId).execute()

    @wrapper
    def updateCommandIsdeletedById(self, commandId):
        return commandTable.update(**{"is_deleted": True}).where(
            commandTable.id == commandId).execute()

    @wrapper
    def updateCommand(self, rowId, data):
        data["updated_at"] = datetime.datetime.utcnow()
        # if data.get("status") != None:
        #     commandData = self.getOneCommandById(rowId)
        #     commandData.update(data)
        #     commandhistoriesTable.create(**(commandData))
        return commandTable.update(**data).where(commandTable.id == rowId).execute()

    @wrapper
    def getCountCommandsByStatusAndPlan(self, status, plan):
        return commandTable.select() \
            .join(usersTable, on=(commandTable.user == usersTable.id)) \
            .join(usageplansTable, on=(usersTable.usageplan == usageplansTable.id)) \
            .where(((commandTable.status == status) | (commandTable.status == status + 20)) & (commandTable.option != 'colab') & (usageplansTable.planName == plan))
