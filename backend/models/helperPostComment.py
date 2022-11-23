import traceback
import datetime
import peewee
from dateutil.relativedelta import relativedelta
from internal.base_object import noneObject

from models import *
import functools

mongoDb = MongoDb()
class HelperPostComment():

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
    def getOnePostCommentsById(self, rowId, raw=False):
        collection = postCommentsTable.get_or_none(postCommentsTable.id == rowId)
        if collection:
            return collection.__dict__['__data__'] if not raw else collection
        return collection

    @wrapper
    def getPostCommentsByUserId(self, tableInstance, user_id, sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10):
        if sorting == 'created_at':
            sorting = tableInstance.created_at
        elif sorting == 'updated_at':
            sorting = tableInstance.updated_at
        elif sorting == 'option':
            sorting = tableInstance.option
        elif sorting == 'collection_name':
            sorting = tableInstance.collection_name
        elif sorting == 'status':
            sorting = tableInstance.status

        if desc:
            sorting = sorting.desc()
        common_where = (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)
        collection_query = tableInstance.select(tableInstance.id, tableInstance.collection_name, tableInstance.created_at,tableInstance.updated_at, tableInstance.status, tableInstance.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 60, 61]
        elif tab == 'all':
            return collection_query.where((tableInstance.collection_name.contains(searching)) & (tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).order_by(sorting).paginate(start,count).execute()

        return collection_query.where((tableInstance.collection_name.contains(searching)) & (tableInstance.status.in_(status_list)
                        ) & (tableInstance.user == user_id) & (
                common_where)).order_by(sorting).paginate(start, count).execute()

    @wrapper
    def updatePostComments(self, rowId, data):
        data["updated_at"] = datetime.datetime.utcnow()
        # if data.get("status") != None:
        #     collectionData = self.getOnePostCommentsById(rowId)
        #     collectionData.update(data)
        #     collectionhistoriesTable.create(**(collectionData))
        return postCommentsTable.update(**data).where(postCommentsTable.id == rowId).execute()

    @wrapper
    def getOnePostCommentById(self, comment_id):
        return postCommentsTable.get_or_none(postCommentsTable.id == comment_id)

    @wrapper
    def getPostCommentsByPostId(self, post_id):
        return postCommentsTable.select(postCommentsTable, usersTable) \
                .join(usersTable, on=(postCommentsTable.user == usersTable.id))\
                .where(postCommentsTable.post == post_id).execute()

    @wrapper
    def getAllReviewPostComment(self, post_ids, sorting='created_at', tab='all', desc=False, searching='',
                           page=0, count=10, post_type=""):
        if sorting == 'created_at':
            sorting = postCommentsTable.created_at
        elif sorting == 'updated_at':
            sorting = postCommentsTable.updated_at
        elif sorting == 'status':
            sorting = peewee.Case(postCommentsTable.status, (
                (100, 1), (9, 2), (99, 3), (1, 4), (10, 5), (11, 6), (20, 7), (21, 8), (30, 9), (31, 10), (60, 11),
                (61, 12)), 0)

        if desc and sorting != 'status':
            sorting = sorting.desc()
        common_where = ((postCommentsTable.is_deleted == None) | (postCommentsTable.is_deleted == False))
        if post_ids:
            common_where = common_where & (postCommentsTable.id.in_(post_ids))

        common_where = common_where & (postCommentsTable.status == 'Under Review')
        
        post_query = postCommentsTable.select(postCommentsTable)
        query = post_query.where(common_where)

        return query.order_by(sorting).paginate(page, count).execute(), query.count()