import peewee

from models import *
import functools
class HelperDataconnector():

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
    def getDataconnectortypes(self):
        return dataconnectortypesTable.select().order_by(dataconnectortypesTable.orderByCode).execute()


    @wrapper
    def getOneDataconnectortypeByDataconnectortypename(self, dataconnectortypeName):
        return dataconnectortypesTable.get(dataconnectortypesTable.dataconnectortypeName == dataconnectortypeName)


    @wrapper
    def getOneDataconnectortypeById(self, id):
        return dataconnectortypesTable.get_or_none(dataconnectortypesTable.id == id)

    @wrapper
    def createDataconnectortype(self, data):
        return dataconnectortypesTable.create(**(data))

    @wrapper
    def createDataconnector(self, data):
        return dataconnectorsTable.create(**(data))

    @wrapper
    def getDataconnectorsByIds(self, ids, *fields):
        return dataconnectorsTable.select(*fields).where(dataconnectorsTable.id.in_(ids)).execute()

    @wrapper
    def getPublicDataconnectors(self):
        return dataconnectorsTable.select().where(dataconnectorsTable.isSample == 1).execute()

    @wrapper
    def getDataconnectorsByDatasetId(self, datasetId):
        return dataconnectorsTable.select().where(dataconnectorsTable.dataset == datasetId).execute()

    @wrapper
    def get_dataconnectors_by_user_id(self, userId, sorting = 'created_at', desc = False, searching = '', start = 0, count = 10, is_public = False):
        if sorting == 'created_at':
            sorting = dataconnectorsTable.created_at
        elif sorting == 'dataconnectorName':
            sorting = dataconnectorsTable.dataconnectorName
        elif sorting == 'dataconnectortype':
            sorting = dataconnectorsTable.dataconnectortype
        elif sorting == 'hasLabelData':
            sorting = dataconnectorsTable.hasLabelData
        elif sorting == 'status':
            sorting = dataconnectorsTable.status

        if desc:
            sorting = sorting.desc()

        where_query = (dataconnectorsTable.isVisible == True) & (dataconnectorsTable.dataconnectorName.contains(searching)) & \
                      ((dataconnectorsTable.isDeleted == None) | (dataconnectorsTable.isDeleted == False))
        if is_public:
            where_query = where_query & (dataconnectorsTable.isSample == True)
            query = dataconnectorsTable.select(dataconnectorsTable.id,
                                              dataconnectorsTable.dataconnectorName,
                                              dataconnectorsTable.dataconnectortype,
                                              dataconnectorsTable.created_at,
                                              dataconnectorsTable.trainingMethod,
                                              dataconnectorsTable.updated_at,
                                              dataconnectorsTable.status,
                                              dataconnectorsTable.hasLabelData,
                                              dataconnectorsTable.sampleImageUrl,
                                              dataconnectorsTable.reference,
                                              dataconnectorsTable.progress,
                                              dataconnectorsTable.referenceUrl,
                                              dataconnectorsTable.license,
                                              dataconnectorsTable.licenseUrl,
                                              dataconnectorsTable.progress,
                                              dataconnectorsTable.description,
                                              dataconnectorsTable.filePath,
                                              dataconnectortypesTable.id,
                                              dataconnectortypesTable.dataconnectortypeName
                                              ) \
                .join(dataconnectortypesTable, on=(dataconnectortypesTable.id == dataconnectorsTable.dataconnectortype)) \
                .where(where_query)
        else:
            where_query = where_query & (dataconnectorsTable.user == userId)
            query = dataconnectorsTable.select(dataconnectorsTable.id,
                                              dataconnectorsTable.dataconnectorName,
                                              dataconnectorsTable.dataconnectortype,
                                              dataconnectorsTable.created_at,
                                              dataconnectorsTable.trainingMethod,
                                              dataconnectorsTable.updated_at,
                                              dataconnectorsTable.status,
                                              dataconnectorsTable.hasLabelData,
                                              dataconnectorsTable.progress,
                                              dataconnectortypesTable.id,
                                              dataconnectortypesTable.dataconnectortypeName
                                              ) \
                .join(dataconnectortypesTable, on=(dataconnectortypesTable.id == dataconnectorsTable.dataconnectortype)) \
                .where(where_query)

        return query.order_by(sorting).paginate(start,count).execute(), query.count()

    @wrapper
    def getOneDataconnectorById(self, rowId):
        return dataconnectorsTable.get_or_none(dataconnectorsTable.id == rowId)


    @wrapper
    def updateDataconnectorById(self, rowId, data):
        return dataconnectorsTable.update(**data).where(dataconnectorsTable.id == rowId).execute()

    @wrapper
    def getAllDataconnectorsByUserId(self, userId):
        return dataconnectorsTable.select().where(dataconnectorsTable.user == userId).execute()
