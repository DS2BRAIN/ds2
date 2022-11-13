import traceback
import datetime
import peewee
from dateutil.relativedelta import relativedelta
from internal.base_object import noneObject

from models import *
import functools

mongoDb = MongoDb()
class HelperPost():

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
    def getOnePostById(self, rowId, raw=False):
        post = postTable.get_or_none(postTable.id == rowId)
        if post:
            return post.__dict__['__data__'] if not raw else post
        return post

    @wrapper
    def get_all_post_in_ids(self, ids, raw=False):
        result = postTable.select().where(postTable.id.in_(ids)).execute()
        if raw:
            return [raw for raw in result]
        else:
            return [raw.__dict__['__data__'] for raw in result]

    @wrapper
    def get_post_status_by_id(self, row_id):
        return postTable.select(postTable.status).where(
            postTable.id == row_id).limit(1).first()

    @wrapper
    def getOnePostAsyncById(self, rowId):
        return postTable.select(postTable.id, postTable.status, postTable.user).where(postTable.id == rowId).get()


    @wrapper
    def getPostsByStatus(self, status):
        return postTable.select().where(postTable.status == status).execute()

    @wrapper
    def getRelatedPostByPostId(self, post_id):
        return postTable.select().where(postTable.related_post == post_id).execute()

    @wrapper
    def getAllPost(self, sorting='created_at', tab='all', desc=False, searching='',
                              page=0, count=10, post_type=''):
        if sorting == 'created_at':
            sorting = postTable.created_at
        elif sorting == 'updated_at':
            sorting = postTable.updated_at
        elif sorting == 'option':
            sorting = postTable.option
        elif sorting == 'post':
            sorting = postTable.post
        elif sorting == 'status':
            sorting = peewee.Case(postTable.status, (
            (100, 1), (9, 2), (99, 3), (1, 4), (10, 5), (11, 6), (20, 7), (21, 8), (30, 9), (31, 10), (60, 11),
            (61, 12)), 0)
        else:
            sorting = postTable.watch

        # if desc and sorting == 'status':
        sorting = sorting.desc()
        common_where = ((postTable.is_deleted == None) | (postTable.is_deleted == False)) & (postTable.status != "Under Review")
        if post_type:
            common_where = common_where & (postTable.post_type == post_type)
        post_query = postTable.select()
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
            query = post_query
        else:
            query = post_query.where(
                (postTable.post.contains(searching)) & (postTable.status.in_(status_list)) & (common_where))
        return query.order_by(postTable.is_accept_iframe.desc(), sorting).paginate(page, count).execute(), query.count()

    @wrapper
    def getAllPostByUserId(self, user_id, post_ids, sorting='created_at', tab='all', desc=False, searching='',
                              page=0, count=10, post_type=""):
        if sorting == 'created_at':
            sorting = postTable.created_at
        elif sorting == 'updated_at':
            sorting = postTable.updated_at
        elif sorting == 'option':
            sorting = postTable.option
        elif sorting == 'post':
            sorting = postTable.post
        elif sorting == 'status':
            sorting = peewee.Case(postTable.status, (
            (100, 1), (9, 2), (99, 3), (1, 4), (10, 5), (11, 6), (20, 7), (21, 8), (30, 9), (31, 10), (60, 11),
            (61, 12)), 0)

        if desc and sorting != 'status':
            sorting = sorting.desc()
        common_where = ((postTable.is_deleted == None) | (postTable.is_deleted == False)) & (
                    (postTable.user == user_id) | (postTable.id.in_(post_ids)))
        if post_type:
            common_where = common_where & (postTable.post_type == post_type)
        post_query = postTable.select()

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 40, 41, 60, 61]
        elif tab == 'all':
            query = post_query.where((postTable.post.contains(searching)) & (common_where))
            return query.order_by(sorting).paginate(page, count).execute(), query.count()
        query = post_query.where(
            (postTable.post.contains(searching)) & (postTable.status.in_(status_list)) & (common_where))
        return query.order_by(sorting).paginate(page, count).execute(), query.count()

    @wrapper
    def getPostsByUserId(self, tableInstance, user_id, sorting = 'created_at', tab = 'all', desc = False, searching = '', start = 0, count = 10, post_type=""):
        if sorting == 'created_at':
            sorting = tableInstance.created_at
        elif sorting == 'updated_at':
            sorting = tableInstance.updated_at
        elif sorting == 'option':
            sorting = tableInstance.option
        elif sorting == 'post':
            sorting = tableInstance.post
        elif sorting == 'status':
            sorting = tableInstance.status

        if desc:
            sorting = sorting.desc()
        common_where = (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False)
        if post_type:
            common_where = common_where & (postTable.post_type == post_type)
        post_query = tableInstance.select(tableInstance.id, tableInstance.post, tableInstance.created_at,tableInstance.updated_at, tableInstance.status, tableInstance.option)

        if tab == 'ready':
            status_list = [0]
        elif tab == 'done':
            status_list = [100, 99, 9]
        elif tab == 'developing':
            status_list = [1, 10, 11, 20, 21, 30, 31, 60, 61]
        elif tab == 'all':
            return post_query.where((tableInstance.post.contains(searching)) & (tableInstance.user == user_id) & (
                        (tableInstance.is_deleted == None) | (tableInstance.is_deleted == False))).order_by(sorting).paginate(start,count).execute()

        return post_query.where((tableInstance.post.contains(searching)) & (tableInstance.status.in_(status_list)
                        ) & (tableInstance.user == user_id) & (
                common_where)).order_by(sorting).paginate(start, count).execute()
    @wrapper
    def getPostsById(self, postId):
        return postTable.select().where(postTable.id == postId).execute()

    @wrapper
    def updatePostIsdeletedById(self, postId):
        return postTable.update(**{"is_deleted": True}).where(
            postTable.id == postId).execute()

    @wrapper
    def updatePost(self, rowId, data):
        data["updated_at"] = datetime.datetime.utcnow()
        # if data.get("status") != None:
        #     postData = self.getOnePostById(rowId)
        #     postData.update(data)
        #     posthistoriesTable.create(**(postData))
        return postTable.update(**data).where(postTable.id == rowId).execute()