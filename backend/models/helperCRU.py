import datetime
import traceback
import bcrypt
import peewee
from internal.base_object import noneObject

from models import *
import functools
mongoDb = MongoDb()
none_object = noneObject()

class HelperCRU():

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

    @wrapper
    def createLabel(self, data):
        return mongoDb.create_document(collection_name=mongoDb.LABELS_COLLECTION_NAME, data=data)

    @wrapper
    def updateLabelById(self, row_id, data):
        return mongoDb.update_document_by_id(collection_name=mongoDb.LABELS_COLLECTION_NAME, _id=row_id,
                                                    data=data)

    @wrapper
    def getOneLabelById(self, rowId):
        result = mongoDb.get_one_document_by_id(collection_name=mongoDb.LABELS_COLLECTION_NAME, _id=rowId)
        return result

    @wrapper
    def getOneLabelProjectById(self, rowId):
        return labelprojectsTable.get_or_none(labelprojectsTable.id == rowId) or none_object

    @wrapper
    def getCustomAiStageByLabelprojectId(self, labelprojectId, labelingClass):
        commonWhere = (autolabelingProjectsTable.labelprojectId == labelprojectId) & (
                    autolabelingProjectsTable.autolabelingAiType == 'custom') & (
                                  autolabelingProjectsTable.labelingClass == labelingClass)
        selectColumn = peewee.fn.Max(autolabelingProjectsTable.customAiStage).alias('stage')
        return autolabelingProjectsTable.select(selectColumn).where(
            commonWhere).group_by(autolabelingProjectsTable.labelingClass).limit(1).first()

    @wrapper
    def createLabelProject(self, data):
        return labelprojectsTable.create(**(data))

    @wrapper
    def get_datacolumns_by_column_id(self, column_id):
        return datacolumnsTable.select().where(datacolumnsTable.id.in_(column_id)).dicts()

    @wrapper
    def get_datacolumn_by_column_id(self, column_id):
        result = datacolumnsTable.get_or_none(datacolumnsTable.id == column_id)
        return result

    @wrapper
    def getDatacolumnsByDataconnectorId(self, dataconnectorId, is_dicts=False):
        if type(dataconnectorId) == list:
            common_where_query = datacolumnsTable.dataconnector.in_(dataconnectorId)
        else:
            common_where_query = datacolumnsTable.dataconnector == dataconnectorId
        if is_dicts:
            return datacolumnsTable.select().where(common_where_query).dicts()
        else:
            return datacolumnsTable.select().where(common_where_query).execute()

    @wrapper
    def getOneDatacolumnById(self, id):
        return datacolumnsTable.get(datacolumnsTable.id == id)

    @wrapper
    def createDatacolumn(self, data):
        return datacolumnsTable.create(**(data))

    @wrapper
    def updateDatacolumnById(self, rowId, data):
        return datacolumnsTable.update(**data).where(datacolumnsTable.id == rowId).execute()

    @wrapper
    def getAdditionalunitinfos(self):
        return additionalunitinfoTable.select().execute()

    @wrapper
    def getOneAdditionalunitinfoByName(self, name):
        return additionalunitinfoTable.get(additionalunitinfoTable.additionalUnitName == name)

    @wrapper
    def updateDatacolumn(self, rowId, data):
        return datacolumnsTable.update(**data).where(datacolumnsTable.id == rowId).execute()

    @wrapper
    def create_transaction(self, data, is_for_real_time_mock=False, is_for_real_time_trade=False):

        collection_name = mongoDb.TRANSACTION_COLLECTION_NAME
        if is_for_real_time_mock:
            collection_name = mongoDb.MOCK_TRANSACTION_COLLECTION_NAME
        if is_for_real_time_trade:
            collection_name = mongoDb.REAL_TRANSACTION_COLLECTION_NAME

        return mongoDb.create_document(collection_name=collection_name, data=data, db_name='quent')

    @wrapper
    def create_dataconnector_view(self, view_name, dataconnector_id):

        pipeline = [
            {
                '$match': {
                    # 'dataconnector': {
                    #     '$in': dataconnector_list
                    # },
                    'dataconnector': dataconnector_id,
                    'rawData': {
                        '$ne': None
                    }
                }
            }, {
                '$replaceRoot': {
                    'newRoot': {
                        '$mergeObjects': [
                            '$rawData', '$labelData'
                        ]
                    }
                }
            }
        ]
        return mongoDb.create_view(view_name=view_name, collection_name=mongoDb.DS2DATA_COLLECTION_NAME, pipeline=pipeline)

    @wrapper
    def check_collection_exists(self, col_name):
        return True if col_name in mongoDb.get_collection_list() else False

    @wrapper
    def create_model_view(self, collection_name, view_name):

        pipeline = [
            {
                '$project': {
                    '_id': 0
                }
            }
        ]
        return mongoDb.create_view(view_name=view_name, collection_name=collection_name,
                                   pipeline=pipeline)

    @wrapper
    def create_model_collection(self, collection_name, data):
        return mongoDb.create_collection(collection_name=collection_name, data=data)

    @wrapper
    def get_ds2data_by_dataconnector(self, dataconnector_list, with_label=False):

        new_root = '$rawData'
        if with_label:
            new_root = {
                        '$mergeObjects': [
                            '$rawData', '$labelData'
                        ]
                    }

        pipeline = [
            {
                '$match': {
                    'dataconnector': {
                        '$in': dataconnector_list
                    },
                    'rawData': {
                        '$ne': None
                    }
                }
            }, {
                '$replaceRoot': {
                    'newRoot': new_root
                }
            }
        ]
        return mongoDb.get_raw_data_from_document(collection_name=mongoDb.DS2DATA_COLLECTION_NAME,
                                   pipeline=pipeline)

    @wrapper
    def delete_collection_by_name(self, view_name):
        return mongoDb.delete_collection(view_name)

if __name__ == '__main__':
    result = HelperCRU().getOneLabelById('6090ee7e4f699f9b7be7f1bb')
    print(result)
