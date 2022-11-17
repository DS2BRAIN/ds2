from models import *
import functools

mongoDb = MongoDb()


class HelperClient():

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

    def get_certified_contents_by_user_id(self, user_id):
        return CertifiedContentsTable.select().where(CertifiedContentsTable.user_id == user_id).dicts()

    def get_content_category_by_certified_lst(self, certified_keyword_id_lst):
        return ContentCategoryTable.select(ContentCategoryTable.classification).where(
            ContentCategoryTable.certified_content_id.in_(
                certified_keyword_id_lst)).execute()

    def get_content_category_by_classifications(self, classifications):
        return ContentCategoryTable.select(ContentCategoryTable.content_id.distinct()).where(
            (ContentCategoryTable.classification.in_(classifications)) &
            (ContentCategoryTable.content_id != None))

    def get_widefield_user(self, user_id):
        return WideFieldUserTable.get_or_none(WideFieldUserTable.id == user_id)

    def get_user_statistics_by_user_info(self, age, gender):
        return UserStatisticsTable.get_or_none((UserStatisticsTable.age_group == age) & (UserStatisticsTable.gender == gender))

    def get_contents(self):
        return ContentsTable.select().order_by(ContentsTable.id.desc()).dicts()

    @wrapper
    def get_t_query(self, dataconnector_id, conditions=None, lang_code=None, sort=None, limit=None, db_name=None):
        return mongoDb.get_t_documents(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                   dataconnector_id=dataconnector_id, conditions=conditions, lang_code=lang_code, sort=sort, limit=limit, db_name=db_name)