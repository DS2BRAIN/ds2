import traceback
import datetime
import peewee
from dateutil.relativedelta import relativedelta
from internal.base_object import noneObject

from models import *
import functools

mongoDb = MongoDb()
class HelperPostBookmark():

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
    def getOnePostBookmarkById(self, rowId, raw=False):
        post_bookmarks = postBookmarksTable.get_or_none(postBookmarksTable.id == rowId)
        if post_bookmarks:
            return post_bookmarks.__dict__['__data__'] if not raw else post_bookmarks
        return post_bookmarks
    @wrapper
    def getOnePostBookmarkByPostIdAndUserId(self, post_id, user_id, raw=False):
        post_bookmarks = postBookmarksTable.get_or_none((postBookmarksTable.post == post_id) & ((postBookmarksTable.is_deleted == None) | (postBookmarksTable.is_deleted == False)) &(postBookmarksTable.user == user_id))
        if post_bookmarks:
            return post_bookmarks.__dict__['__data__'] if not raw else post_bookmarks
        return post_bookmarks

    @wrapper
    def getPostBookmarksByUserId(self, user_id, post_bookmarks_ids, sorting='created_at', tab='all', desc=False, searching='',
                              page=0, count=10, isVerify=False):
        if sorting == 'created_at':
            sorting = postsTable.created_at
        elif sorting == 'updated_at':
            sorting = postsTable.updated_at

        if desc and sorting != 'status':
            sorting = sorting.desc()
        common_where = ((postBookmarksTable.is_deleted == None) | (postBookmarksTable.is_deleted == False)) &\
                       ((postBookmarksTable.user == user_id))
        post_bookmarks_query = postsTable.select()

        query = post_bookmarks_query.join(postBookmarksTable, on=(postBookmarksTable.post == postsTable.id)).where(common_where)
        return query.order_by(sorting).paginate(page, count).execute(), query.count()

    @wrapper
    def updatePostBookmark(self, rowId, data):
        data["updated_at"] = datetime.datetime.utcnow()
        # if data.get("status") != None:
        #     post_bookmarksData = self.getOnePostBookmarkById(rowId)
        #     post_bookmarksData.update(data)
        #     post_bookmarkshistoriesTable.create(**(post_bookmarksData))
        return postBookmarksTable.update(**data).where(postBookmarksTable.id == rowId).execute()