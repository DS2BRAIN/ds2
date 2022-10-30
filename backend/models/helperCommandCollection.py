import traceback
import datetime
import peewee
from dateutil.relativedelta import relativedelta
from internal.base_object import noneObject

from models import *
import functools

mongoDb = MongoDb()
class HelperCommandCollection():

    def __init__(self, init=False):
        ""
        # if init:
        #     skyhub.connect(reuse_if_open=True)

    def __exit__(self, exc_type, exc_value, traceback):

        if not skyhub.is_closed():
            skyhub.close()

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
    def getOneCommandCollectionById(self, rowId, raw=False):
        command_collection = commandCollectionTable.get_or_none(commandCollectionTable.id == rowId)
        if command_collection:
            return command_collection.__dict__['__data__'] if not raw else command_collection
        return command_collection
    @wrapper
    def getOneCommandCollectionByCommandIdAndUserId(self, command_id, user_id, raw=False):
        command_collection = commandCollectionTable.get_or_none((commandCollectionTable.command == command_id) & ((commandCollectionTable.is_deleted == None) | (commandCollectionTable.is_deleted == False)) &(commandCollectionTable.user == user_id))
        if command_collection:
            return command_collection.__dict__['__data__'] if not raw else command_collection
        return command_collection

    @wrapper
    def getCommandCollectionsByUserId(self, user_id, command_collection_ids, sorting='created_at', tab='all', desc=False, searching='',
                              page=0, count=10, isVerify=False):
        if sorting == 'created_at':
            sorting = commandTable.created_at
        elif sorting == 'updated_at':
            sorting = commandTable.updated_at

        if desc and sorting != 'status':
            sorting = sorting.desc()
        common_where = ((commandCollectionTable.is_deleted == None) | (commandCollectionTable.is_deleted == False)) &\
                       ((commandCollectionTable.user == user_id))
        command_collection_query = commandTable.select()

        query = command_collection_query.join(commandCollectionTable, on=(commandCollectionTable.command == commandTable.id)).where(common_where)
        return query.order_by(sorting).paginate(page, count).execute(), query.count()

    @wrapper
    def updateCommandCollection(self, rowId, data):
        data["updated_at"] = datetime.datetime.utcnow()
        # if data.get("status") != None:
        #     command_collectionData = self.getOneCommandCollectionById(rowId)
        #     command_collectionData.update(data)
        #     command_collectionhistoriesTable.create(**(command_collectionData))
        return commandCollectionTable.update(**data).where(commandCollectionTable.id == rowId).execute()