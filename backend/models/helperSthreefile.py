import datetime
import traceback

import peewee

from models import *
import functools

mongoDb = MongoDb()


class HelperSthreefile():

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
    def getNotyetThreefilesByLabelprojectId(self, labelproject_id):
        condition = {"$and": [{"labelproject": labelproject_id}, {"status": "ready"}]}

        return mongoDb.get_documents(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition)
        # return sthreefilesTable.select().where((sthreefilesTable.folder == folderId) & (sthreefilesTable.status == "learning"))

    @wrapper
    def getDonesthreefilesByLabelprojectId(self, labelproject_id):

        condition = {
            "$and": [
                {
                    'labelproject': labelproject_id
                }, {
                    'status': 'done'
                }, {
                    'isDeleted': {
                        '$in': [
                            False, None
                        ]
                    }
                }
            ]
        }

        return mongoDb.get_documents(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition)

    @wrapper
    def getDoneDs2DataAndLabelsByLabelprojectId(self, labelproject_id):
        condition = {
            '$match': {
                "$and": [
                    {'labelproject': labelproject_id},
                    {'status':'done'},
                    {'isDeleted': {'$ne': True}}
                ]
            },
        }

        pipeline = [
            condition,
            {
                '$lookup': {
                    'from': 'ds2data',
                    'let': {'ds2dataId': {'$toObjectId': '$ds2data'}},
                    'pipeline': [
                        {'$match': {'$expr': {'$eq': ['$_id', '$$ds2dataId']}}},
                        {'$project': {'_id': 0, 'id': {'$toString': '$_id'}, 'rawData': 1}},
                    ],
                    'as': 'data'
                }
            },
            {'$unwind': '$data'},
            {'$replaceRoot': {'newRoot': {'$mergeObjects': ['$$ROOT', "$data"]}}},
            {'$project': {'data': 0}},
        ]

        pipeline.append({
            '$lookup': {
                'from': 'labels',
                'let': {'sthreefileId': {'$toString': '$_id'}},
                'pipeline': [{
                    '$match': {
                        '$expr': {
                            '$eq': ['$sthreefile', '$$sthreefileId']
                        },
                        'isDeleted': {'$ne': True}
                    }},
                    {'$addFields': {'id': {'$toString': '$_id'}}},
                    {'$project': {'_id': 0}},
                ],
                'as': 'labels'
            }
        })
        return mongoDb.aggregate(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, pipeline=pipeline)

    @wrapper
    def getDonesthreefilesByProjectId(self, project_id):
        condition = {"$and": [{"project": project_id}, {"status": "done"},
                              {"$or": [{"isDeleted": False}, {"isDeleted": None}]}]}
        return mongoDb.get_documents(collection_name=mongoDb.DS2DATA_PROJECT_COLLECTION_NAME, condition=condition)

    @wrapper
    def getDonesthreefilesByIds(self, ids):
        condition = {"$and": [{"_id": {"$in": ids}}, {"status": "done"},
                              {"$or": [{"isDeleted": False}, {"isDeleted": None}]}]}
        return mongoDb.get_documents(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition)

    @wrapper
    def getAllSthreeFilesByUserId(self, userId):
        # todo : 테스트코드에서 사용
        condition = {'user': userId}
        return mongoDb.get_documents(collection_name=mongoDb.DS2DATA_COLLECTION_NAME, condition=condition)
        # return sthreefilesTable.select().where(sthreefilesTable.user == userId).execute()

    @wrapper
    def delete_all_s3data_by_user_id(self, user_id):
        condition = {'user': user_id}
        return mongoDb.delete_documents(collection_name=mongoDb.DS2DATA_COLLECTION_NAME, condition=condition)

    @wrapper
    def getAllFolderByUserId(self, userId):
        return foldersTable.select().where(foldersTable.user == userId).execute()

    @wrapper
    def createFile(self, data):
        return mongoDb.create_document(collection_name=mongoDb.DS2DATA_COLLECTION_NAME, data=data)

    @wrapper
    def createLabelprojectFile(self, data):
        return mongoDb.create_document(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, data=data)

    @wrapper
    def getAllSubFolderByfolderId(self, folderId):
        return foldersubsTable.select().where(foldersubsTable.folderId == folderId).execute()

    @wrapper
    def updateS3filesIsdeletedByS3Id(self, sthreefileId):
        return mongoDb.update_document_by_id(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                             _id=sthreefileId, data={"isDeleted": True})
        # return sthreefilesTable.update(**{"isDeleted": True}).where(sthreefilesTable.id == sthreefileId).execute()

    @wrapper
    def updateAutoLabelingFileByLabelprojectIdAndLimit(self, labelproject_id, limit):
        condition = {"$and": [{"labelproject": labelproject_id}, {"$or": [{"isDeleted": None}, {"isDeleted": False}]},
                              {"$and": [{"status": "prepare"}]}]}
        data = {"status": "ready"}

        return mongoDb.update_document_to_limit(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                                condition=condition, data=data, limit=limit)

    @wrapper
    def rollback_auto_labeling_file_by_label_project_id(self, labelproject_id):
        condition = {"$and": [{"labelproject": labelproject_id}, {"$or": [{"isDeleted": None}, {"isDeleted": False}]},
                              {"$and": [{"status": "ready"}]}]}
        data = {"status": "prepare"}

        return mongoDb.update_documents(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                                condition=condition, data=data)

    @wrapper
    def getAllSthreeFilesByLabelProjectId(self, labelProjectId):
        not_deleted_condition = {"$or": [{"isDeleted": False}, {"isDeleted": None}]}
        condition = {"$and": [{'labelproject': labelProjectId}, not_deleted_condition]}
        return mongoDb.get_documents(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition)

    @wrapper
    def getDoneSthreeFilesCountByLabelProjectId(self, labelproject_id):
        not_deleted_condition = {"$or": [{"isDeleted": False}, {"isDeleted": None}]}
        condition = {"$and": [{"status": "done"}, {'labelproject': labelproject_id}, not_deleted_condition]}
        return mongoDb.get_documents_count(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                           condition=condition)
        # return sthreefilesTable.select().where((sthreefilesTable.status == 'done') & (sthreefilesTable.folder == folderId) & (
        #             (sthreefilesTable.isDeleted == None) | (sthreefilesTable.isDeleted == False))).count()

    @wrapper
    def getsthreefilesBySthreeFile(self, sthreefileId):
        not_deleted_condition = {"$or": [{"isDeleted": False}, {"isDeleted": None}]}
        condition = {"$and": [{'_id': ObjectId(sthreefileId)}, not_deleted_condition]}
        return mongoDb.get_documents(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition)

    @wrapper
    def getObjectStatusCountByLabelprojectId(self, labelproject_id, is_owner, workAssignee):

        common_condition = {'$and': [{"$or": [{"isDeleted": False}, {"isDeleted": None}]},
                                     {'labelproject': labelproject_id}]}

        if not is_owner:
            common_condition = {'$and': [common_condition, {"workAssignee": workAssignee}]}

        group_query = {'_id': '$status', 'count': {'$sum': 1}}

        result = {'prepare': 0, 'working': 0, 'ready': 0, 'review': 0, 'done': 0, 'reject': 0}
        for document in mongoDb.get_group_documents(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                                    condition=common_condition, group_query=group_query):
            if document['_id'] in ['None', None, '']:
                result['prepare'] += document['count']
                continue
            result[document['_id']] = document['count']
        result['all'] = mongoDb.get_documents_count(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                                    condition=common_condition)
        return result

    @wrapper
    def getWorkAssigneeByLabelprojectId(self, label_project_id):
        condition = {"labelproject": label_project_id}
        return mongoDb.get_distinct_document(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                             field="workAssignee", condition=condition)
        # return sthreefilesTable.select(sthreefilesTable.workAssignee).where(sthreefilesTable.folder == folderId).distinct().execute()

    @wrapper
    def getSthreeFileCountByClass(self, labelproject_id):
        pipeline = [{
            '$match': {"isDeleted": {"$ne": True}, "labelproject": labelproject_id, "status": "done"}
        },
            {
                '$group': {
                    '_id': '$labelData',
                    'count': {
                        '$sum': 1
                    }
                }
            }
        ]

        return mongoDb.aggregate(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, pipeline=pipeline)

    @wrapper
    def get_sthreefile_count_by_labelproject_id(self, labelproject_id):
        condition = {"labelproject": labelproject_id}

        return mongoDb.get_documents_count(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition)

    @wrapper
    def getSthreeFilesByLabelprojectIdToPagenate(self, labelproject_id, sorting='created_at', tab=None, desc=False,
                                                 searching='', page=1, count=10, workAssignee=None, is_label_app=False,
                                                 is_shared=False, email=None):
        desc = 1 if desc else -1
        condition = [
            {"isDeleted": {"$ne": True}},
            {"labelproject": labelproject_id}
        ]

        if is_shared and workAssignee != 'null':
            condition.append({'workAssignee': email})

        if searching:
            condition.append({"originalFileName": {"$regex": f'.*{searching}.*'}})

        condition = {"$and": condition}
        sorting = 'status_sort_code' if sorting == 'status' else sorting
        sorting = '_id' if sorting == 'id' else sorting

        if not workAssignee:
            pass
        elif workAssignee == 'null':
            condition = {"$and": [condition, {"workAssignee": None}]}
        else:
            condition = {"$and": [condition, {"workAssignee": {"$regex": f'.*{workAssignee}.*'}}]}

        if tab != 'all':
            if is_label_app and tab == 'prepare':
                condition = {"$and": [condition, {"status": {"$in": ['prepare', 'working']}}]}
            elif is_label_app and tab == 'review':
                condition = {"$and": [condition, {"status": {"$in": ['review', 'reject']}}]}
            else:
                condition = {"$and": [condition, {"status": tab}]}

        total_count = mongoDb.get_documents_count(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition)

        if sorting == 'status_sort_code':
            add_field = {
                    'new_status_sort_code': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$status', 'prepare'
                                ]
                            }, 16, '$status_sort_code'
                        ]
                    }
                }

            collection = mongoDb.get_mongo_collection(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME)
            result = list(collection.aggregate(
                [{"$match": condition},
                 {'$addFields': add_field},
                 {"$sort": {'new_status_sort_code': desc}},
                 {"$unset": ['new_status_sort_code']},
                 {"$skip": (page - 1) * count},
                 {"$limit": count}],
                allowDiskUse=True))
            for data in result:
                mongoDb.change_id(data)
        else:
            result = mongoDb.get_documents_to_paginate(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition, sorting,
                                                     count, page - 1, desc)
        return result, total_count

    @wrapper
    def getSthreeFilesByLabelprojectId(self, labelproject_id):
        if type(labelproject_id) == int:
            condition = {'labelproject': labelproject_id}
        else:
            condition = {'labelproject': {'$in': labelproject_id}}
        return mongoDb.get_documents(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition)

    @wrapper
    def getSthreeFilesWithoutConditionByLabelprojectId(self, labelproject_id):
        labelproject_condition = {"labelproject": labelproject_id}
        return mongoDb.get_documents(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=labelproject_condition)

    @wrapper
    def getOneLabelprojectFileByCondition(self, condition):
        result = mongoDb.get_one_document_by_condition(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition)
        return result

    @wrapper
    def getOneSthreeFilesByLabelprojectId(self, labelproject, workAssignee=None, app_status=None, project={}):
        has_data = 0

        if app_status in ['prepare', 'working', 'review']:
            status = ['prepare', 'working'] if app_status != 'review' else ['review']

            status_temp = 'working' if app_status != 'review' else 'review'

            has_data = mongoDb.get_documents_count(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, {
                '$and': [{'labelproject': labelproject}, {'status': status_temp}, {'workAssignee': workAssignee}]})
        else:
            status = [app_status]

        condition = {"$and": [{'labelproject': labelproject}, {'isDeleted': {'$ne': True}}]}
        sorting = None

        if workAssignee and app_status in ['prepare', 'working', 'review'] and not has_data:
            sorting = 'status_sort_code'
            direction = -1
            if app_status == 'review':
                condition = {"$and": [{'isDeleted': {'$ne': True}}, {'labelproject': labelproject}]}
            else:
                condition = {"$and": [{'isDeleted': {'$ne': True}}, {'labelproject': labelproject}, {'workAssignee': None}]}
        elif workAssignee:
            condition = {"$and": [{'workAssignee': workAssignee}, {'isDeleted': {'$ne': True}}, {'labelproject': labelproject}]}
        if status:
            condition = {"$and": [condition, {"status": {'$in': status}}]}

        pipeline =[
        {'$match': condition}] if has_data else [
            {
                '$match': condition
            },
            {'$sample': {'size': 1}}
        ]

        if project:
            pipeline.append({'$project': project})

        if sorting:
            result = mongoDb.aggregate(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, pipeline=pipeline, sorting=sorting, direction=direction)
        else:
            result = mongoDb.aggregate(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, pipeline=pipeline)

        return result

    @wrapper
    def get_csv_structure_by_labelproject_id(self, labelproject_id):
        return mongoDb.get_one_document_by_condition(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, {"labelproject": labelproject_id})['rawData']

    @wrapper
    def getSthreeFilesByDataconnectors(self, dataconnectors):
        condition = {'dataconnector': {'$in': dataconnectors}}
        return mongoDb.get_documents(mongoDb.DS2DATA_COLLECTION_NAME, condition=condition)

    @wrapper
    def create_project_ds2data(self, data):
        return mongoDb.create_document(collection_name=mongoDb.DS2DATA_PROJECT_COLLECTION_NAME, data=data)

    @wrapper
    def updateSthreeFileById(self, rowId, data):
        data['updated_at'] = datetime.datetime.utcnow()
        return mongoDb.update_document_by_id(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, _id=rowId,
                                             data=data)
        # return sthreefilesTable.update(**data).where(sthreefilesTable.id == rowId).execute()

    @wrapper
    def updateSthreeFileByCondition(self, condition, data, limit=None):
        status_sort_code = {'prepare': 0, 'none': 0, 'working': 5, 'ready': 10, 'review': 15, 'reject': 19, 'done': 20}
        if data.get('status', False):
            data["status_sort_code"] = status_sort_code[data['status']]
        if not limit:
            return mongoDb.update_documents(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                            condition=condition, data=data)
        else:
            return mongoDb.update_document_to_limit(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                            condition=condition,
                                            data=data, limit=limit)

    @wrapper
    def getSthreeFileById(self, sthreefile_id):
        return mongoDb.get_one_document_by_id(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                              _id=sthreefile_id)
        # return sthreefilesTable.get(sthreefilesTable.id == sthreefile_id)

    @wrapper
    def getLabelSthreeFileById(self, label_sthreefile_id):
        return mongoDb.get_one_document_by_id(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                              _id=label_sthreefile_id)

    @wrapper
    def get_sthree_files_by_workapp(self, labelproject_id, workapp, count=10, page=0):

        condition = {
            '$match': {
                "$and": [
                    {'labelproject': labelproject_id}
                ]
            }
        }

        pipeline = [
            condition,
            {
                '$lookup': {
                    'from': 'ds2data',
                    'let': {'ds2dataId': {'$toObjectId': '$ds2data'}},
                    'pipeline': [
                        {'$match': {'$expr': {'$eq': ['$_id', '$$ds2dataId']}}},
                        {'$project': {'_id': 0, 'id': {'$toString': '$_id'}, 'rawData': 1}},
                    ],
                    'as': 'data'
                }
            },
            {'$unwind': '$data'},
            {'$replaceRoot': {'newRoot': {'$mergeObjects': ['$$ROOT', "$data"]}}},
            {'$project': {'data': 0}},
        ]

        if workapp == 'object_detection':
            pipeline.append({
                '$lookup': {
                    'from': 'labels',
                    'let': {'sthreefileId': {'$toString': '$_id'}},
                    'pipeline': [{
                        '$match': {
                            '$expr': {
                                '$eq': ['$sthreefile', '$$sthreefileId']
                            },
                            'isDeleted': {'$ne': True}
                        }},
                        {'$addFields': {'id': {'$toString': '$_id'}}},
                        {'$project': {'_id': 0}},
                    ],
                    'as': 'labels'
                }
            })

        result = mongoDb.aggregate(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, pipeline=pipeline,
                                   count=count, page=page)
        return result

    @wrapper
    def getSthreeFileByIdWithWorkapp(self, label_sthreefile_id, user_id, user_email, workapp, role=None):

        certify_condition = {'status': {'$nin': ['prepare']}} if role in ['subadmin', 'admin'] else {
            '$and': [{'status': {'$nin': ['prepare']}}, {'$or': [{'workAssignee': user_email}, {'user': user_id}]}, ]}

        condition = {
            '$match': {
                "$and": [
                    {'_id': ObjectId(label_sthreefile_id)},
                    {'isDeleted': {'$ne': True}},
                    {'$or': [
                        certify_condition,
                        {'$and': [{'status': {'$in': ['prepare']}}, {'workAssignee': None}]},
                        {'$and': [{'status': {'$in': ['review']}}, {'reviewer': None}]}
                    ]}
                ]
            }
        }

        pipeline = [
            condition,
            {
                '$lookup': {
                    'from': 'ds2data',
                    'let': {'ds2dataId': {'$toObjectId': '$ds2data'}},
                    'pipeline': [
                        {'$match': {'$expr': {'$eq': ['$_id', '$$ds2dataId']}}},
                        {'$project': {'_id': 0, 'id': {'$toString': '$_id'}, 'rawData': 1}},
                    ],
                    'as': 'data'
                }
            },
            {'$unwind': '$data'},
            {'$replaceRoot': {'newRoot': {'$mergeObjects': ['$$ROOT', "$data"]}}},
            {'$project': {'data': 0}},
        ]

        if workapp == 'object_detection':
            pipeline.append({
                '$lookup': {
                    'from': 'labels',
                    'let': {'sthreefileId': {'$toString': '$_id'}},
                    'pipeline': [{
                        '$match': {
                            '$expr': {
                                '$eq': ['$sthreefile', '$$sthreefileId']
                            },
                            'isDeleted': {'$ne': True}
                        }},
                        {'$addFields': {'id': {'$toString': '$_id'}}},
                        {'$project': {'_id': 0}},
                    ],
                    'as': 'labels'
                }
            })

        result = mongoDb.aggregate(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, pipeline=pipeline)
        return result[0] if result else None

    @wrapper
    def getSthreeFileByLabelProjectWithWorkapp(self, labelproject_ids, workapp):
        condition = {
            '$match': {
                "$and": [
                    {'labelproject': {"$in": labelproject_ids}},
                    {'isDeleted': {'$ne': True}}
                ]
            },
        }

        pipeline = [
            condition,
            {
                '$lookup': {
                    'from': 'ds2data',
                    'let': {'ds2dataId': {'$toObjectId': '$ds2data'}},
                    'pipeline': [
                        {'$match': {'$expr': {'$eq': ['$_id', '$$ds2dataId']}}},
                        {'$project': {'_id': 0, 'id': {'$toString': '$_id'}, 'rawData': 1, 's3key': 1}},
                    ],
                    'as': 'data'
                }
            },
            {'$unwind': '$data'},
            {'$replaceRoot': {'newRoot': {'$mergeObjects': ['$$ROOT', "$data"]}}},
            {'$project': {'data': 0}},
        ]

        if workapp == 'object_detection':
            pipeline.append({
                '$lookup': {
                    'from': 'labels',
                    'let': {'sthreefileId': {'$toString': '$_id'}},
                    'pipeline': [
                        {'$match': {'$expr': {'$eq': ['$sthreefile', '$$sthreefileId']}}},
                        {'$project': {'_id': 0}},
                    ],
                    'as': 'labels'
                }
            })

        result = mongoDb.aggregate(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, pipeline=pipeline)
        return result if result else None

    @wrapper
    def get_sthreefile_by_label_id(self, labelproject_id, class_id, is_count=False):

        pipeline = [
                        {
                            '$match': {
                                'labelproject': labelproject_id,
                                'labelclass': class_id
                            }
                        }, {
                            '$project': {
                                '_id': 0,
                                'sthreefile': 1
                            }
                        }
                    ]
        count_pipe = [
                        {
                            '$group': {
                                '_id': '$sthreefile'
                            }
                        }, {
                            '$count': 'count'
                        }
                    ]
        pipeline = pipeline + count_pipe if is_count else pipeline
        result = mongoDb.aggregate(collection_name=mongoDb.LABELS_COLLECTION_NAME, pipeline=pipeline)
        if result:
            result = result[0]['count'] if is_count else result
        else:
            result = None
        return result

    @wrapper
    def get_sthreefile_with_label_exists(self, label_project_id, is_exists, limit=None, is_count=False):

        pipeline = [
                        {
                            '$match': {
                                'labelproject': label_project_id
                            }
                        }, {
                            '$project': {
                                '_id': 1
                            }
                        }, {
                            '$lookup': {
                                'from': 'labels',
                                'let': {
                                    'sthreefileId': {
                                        '$toString': '$_id'
                                    }
                                },
                                'pipeline': [
                                    {
                                        '$match': {
                                            '$expr': {
                                                '$and': [
                                                    {
                                                        '$eq': [
                                                            '$sthreefile', '$$sthreefileId'
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    }, {
                                        '$project': {
                                            '_id': 1
                                        }
                                    }
                                ],
                                'as': 'labels'
                            }
                        }
                    ]
        if is_exists:
            match = {
                        '$match': {
                            'labels': {
                                '$not': {'$size': 0}
                            }
                        }
                    }
        else:
            match = {
                '$match': {
                    'labels': {
                        '$size': 0
                    }
                }
            }
        pipeline.append(match)
        if limit is not None:
            pipeline.append({
                '$limit': limit
            })

        count_pipe = [
            {
                '$count': 'count'
            }
        ]
        pipeline = pipeline + count_pipe if is_count else pipeline
        result = mongoDb.aggregate(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, pipeline=pipeline)
        if result:
            result = result[0]['count'] if is_count else result
        else:
            result = None
        return result

    @wrapper
    def get_sthreefile_by_labelproject_id_and_status(self, label_project_id, status):

        pipeline = [
            {
                '$match': {
                    'labelproject': label_project_id,
                    'status': status
                }
            }, {
                '$project': {
                    '_id': 1
                }
            }
        ]
        result = mongoDb.aggregate(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, pipeline=pipeline)
        return result if result else None

    @wrapper
    def get_image_count_by_workassignee(self, label_project_id):

        pipeline = [
                        {
                            '$match': {
                                'labelproject': label_project_id,
                                'status': {"$in": ['prepare', 'done']}
                            }
                        },
                        {
                            '$group': {
                                '_id': '$workAssignee',
                                'count': {
                                    '$sum': 1
                                }
                            }
                        }
                    ]
        result = mongoDb.aggregate(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, pipeline=pipeline)

        return result if result else None

    @wrapper
    def get_label_count_by_workassignee(self, label_project_id, user_id, type):
        if type == 'create':
            condition = {
                            '$match': {
                                'labelproject': label_project_id,
                                'workAssignee': user_id,
                                'status': 'done',
                                '$and': [
                                    {
                                        '$or': [
                                            {
                                                'isDeleted': False
                                            }, {
                                                'isDeleted': None
                                            }
                                        ]
                                    }, {
                                        'last_updated_by': {
                                            '$ne': 'auto'
                                        }
                                    }
                                ]
                            }
                        }
        elif type == 'modify':
            condition = {
                            '$match': {
                                'labelproject': label_project_id,
                                'workAssignee': user_id,
                                'status': 'done',
                                '$and': [
                                    {
                                        '$or': [
                                            {
                                                'isDeleted': False
                                            }, {
                                                'isDeleted': None
                                            }
                                        ]
                                    }, {
                                        'last_updated_by': 'auto'
                                    }
                                ]
                            }
                        }
        elif type == 'delete':
            condition = {
                            '$match': {
                                'labelproject': label_project_id,
                                'workAssignee': user_id,
                                'status': 'done',
                                '$and': [
                                    {
                                        'isDeleted': True
                                    }, {
                                        'last_updated_by': 'auto'
                                    }
                                ]
                            }
                        }

        pipeline = [
            condition,
            {
                '$group': {
                    '_id': '$workAssignee',
                    'count': {
                        '$sum': 1
                    }
                }
            }
        ]
        result = mongoDb.aggregate(collection_name=mongoDb.LABELS_COLLECTION_NAME, pipeline=pipeline)
        return result[0] if result else None