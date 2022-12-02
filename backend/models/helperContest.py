import traceback
import datetime
import peewee
from dateutil.relativedelta import relativedelta
from internal.base_object import noneObject

from models import *
import functools

mongoDb = MongoDb()
class HelperContest():

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
    def getOneContestById(self, rowId, raw=False):
        contest = contestsTable.get_or_none(contestsTable.id == rowId)
        if contest:
            return contest.__dict__['__data__'] if not raw else contest
        return contest

    @wrapper
    def get_all_contest_in_ids(self, ids, raw=False):
        result = contestsTable.select().where(contestsTable.id.in_(ids)).execute()
        if raw:
            return [raw for raw in result]
        else:
            return [raw.__dict__['__data__'] for raw in result]

    @wrapper
    def get_contest_status_by_id(self, row_id):
        return contestsTable.select(contestsTable.status).where(
            contestsTable.id == row_id).limit(1).first()

    @wrapper
    def getOneContestAsyncById(self, rowId):
        return contestsTable.select(contestsTable.id, contestsTable.status, contestsTable.user).where(contestsTable.id == rowId).get()


    @wrapper
    def getContestsByStatus(self, status):
        return contestsTable.select().where(contestsTable.status == status).execute()

    @wrapper
    def getRelatedContestByContestId(self, contest_id):
        return contestsTable.select().where(contestsTable.related_contest == contest_id).execute()

    @wrapper
    def getAllContest(self, sorting='created_at', tab='all', desc=False, searching='',
                              page=0, count=10, contest_type='', item_type=''):
        if sorting == 'created_at':
            sorting = contestsTable.created_at
        elif sorting == 'updated_at':
            sorting = contestsTable.updated_at
        elif sorting == 'option':
            sorting = contestsTable.option
        elif sorting == 'title':
            sorting = contestsTable.title
        elif sorting == 'upvote':
            sorting = contestsTable.upvote
        elif sorting == 'status':
            sorting = peewee.Case(contestsTable.status, (
            (100, 1), (9, 2), (99, 3), (1, 4), (10, 5), (11, 6), (20, 7), (21, 8), (30, 9), (31, 10), (60, 11),
            (61, 12)), 0)
        else:
            sorting = contestsTable.watch

        # if desc and sorting == 'status':
        sorting = sorting.desc()
        common_where = ((contestsTable.is_deleted == False) | (contestsTable.is_deleted == None))
                       # & (contestsTable.status != "Under Review") #TODO: TEST
        if item_type:
            common_where = common_where & (contestsTable.item_type == item_type)

        contest_query = contestsTable.select(contestsTable, usersTable) \
            .join(usersTable, on=(contestsTable.user == usersTable.id))

        if searching:
            common_where = common_where & (
                        (contestsTable.title.contains(searching)) | (contestsTable.title.contains(searching)))

        query = contest_query.where(common_where)
        return query.order_by(sorting).paginate(page, count).execute(), query.count()

    @wrapper
    def getContestsById(self, contestId):
        return contestsTable.select().where(contestsTable.id == contestId).execute()

    @wrapper
    def updateContestIsdeletedById(self, contestId):
        return contestsTable.update(**{"is_deleted": True}).where(
            contestsTable.id == contestId).execute()

    @wrapper
    def updateContest(self, rowId, data):
        data["updated_at"] = datetime.datetime.utcnow()
        # if data.get("status") != None:
        #     contestData = self.getOneContestById(rowId)
        #     contestData.update(data)
        #     contesthistoriesTable.create(**(contestData))
        return contestsTable.update(**data).where(contestsTable.id == rowId).execute()

    @wrapper
    def getPostsByContestId(self, rowId):
        return postsTable.select().where(postsTable.contest == rowId).execute()