import ast
import datetime
import random
import traceback
import bcrypt
import peewee
from playhouse.shortcuts import model_to_dict

from models import *
import functools

mongoDb = MongoDb()
class HelperLabel():

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
    def updateLabelProjectIsdeletedByLabelprojectId(self, labelprojectId):
        return labelprojectsTable.update(**{"isDeleted": True}).where(labelprojectsTable.id == labelprojectId).execute()

    @wrapper
    def updateLabelsBySthreefileId(self, sthreefile, data):
        return mongoDb.update_documents(mongoDb.LABELS_COLLECTION_NAME, condition={"sthreefile": sthreefile}, data=data)

    @wrapper
    def updateLabelIsdeletedByLabelId(self, labelIdList, update_data: dict = {}):

        data = {"isDeleted": True}
        if update_data:
            data.update(update_data)

        if type(labelIdList) != list:
            labelIdList = [labelIdList]

        for labelId in labelIdList:
            mongoDb.update_document_by_id(collection_name=mongoDb.LABELS_COLLECTION_NAME, _id=labelId, data=data)

    @wrapper
    def deleteLabelByStrhreeFile(self, sthreefileId):
        data = {"isDeleted": True}
        condition = {"sthreefile":sthreefileId}
        mongoDb.update_documents(collection_name=mongoDb.LABELS_COLLECTION_NAME, condition=condition, data=data)

    @wrapper
    def removeLabelByStrhreeFile(self, sthreefile_id_list, class_id=None):
        if type(sthreefile_id_list) != list:
            sthreefile_id_list = [sthreefile_id_list]
        condition = {"sthreefile": {"$in": sthreefile_id_list}}
        if class_id:
            condition = {"sthreefile": {"$in": sthreefile_id_list}, "labelclass": class_id}
        return mongoDb.delete_documents(collection_name=mongoDb.LABELS_COLLECTION_NAME, condition=condition)

    @wrapper
    def getGroupsByLabelprojectIdAndUserId(self, userId, labelprojectId):
        try:
            commonWhere = (groupUsersTable.user == userId) & (groupUsersTable.role =='admin') & (groupsTable.labelprojectsid.contains(str(labelprojectId)))
            groupId = groupUsersTable.select(groupUsersTable.groupId).join(groupsTable,on=(groupsTable.id == groupUsersTable.groupId)).where(commonWhere).execute()[0].groupId
            return groupUsersTable.select(groupUsersTable.user).where(groupUsersTable.groupId == groupId).execute()
        except:
            return None

    # .join(instancesTable, on=(instancesTable.id == instancesUsersTable.instance_id)) \
    #     .where(instancesTable.instanceName == instanceName)
    @wrapper
    def getLabelWorkage(self, userId, labelprojectId = None):

        common_condition = {"$and": [{"isDeleted": {"$ne": True}}, {"workAssignee": userId}]}
        box_condition = {"labeltype": 'box'}
        polygon_condition = {
            "$and": [{"$or": [{"ismagictool": None}, {"ismagictool": False}]}, {"labeltype": 'polygon'}]}
        magic_condition = {"$and": [{"labeltype": 'polygon'}, {'ismagictool': True}]}

        label_collection_name = mongoDb.LABELS_COLLECTION_NAME

        if labelprojectId:
            labelproject_condition = {"labelproject": labelprojectId}
            polygonCount = mongoDb.get_documents_count(collection_name=label_collection_name, condition={
                "$and": [common_condition, polygon_condition, labelproject_condition]})
            boxCount = mongoDb.get_documents_count(collection_name=label_collection_name, condition={
                "$and": [common_condition, box_condition, labelproject_condition]})
            magicCount = mongoDb.get_documents_count(collection_name=label_collection_name, condition={
                "$and": [common_condition, magic_condition, labelproject_condition]})
        else:
            labelprojectList = [x.id for x in
                                labelprojectsTable.select().where(labelprojectsTable.user == userId).execute()]
            labelproject_condition = {"labelproject": {"$in": labelprojectList}}
            polygonCount = mongoDb.get_documents_count(collection_name=label_collection_name, condition={
                "$and": [common_condition, polygon_condition, labelproject_condition]})
            boxCount = mongoDb.get_documents_count(collection_name=label_collection_name, condition={
                "$and": [common_condition, box_condition, labelproject_condition]})
            magicCount = mongoDb.get_documents_count(collection_name=label_collection_name, condition={
                "$and": [common_condition, magic_condition, labelproject_condition]})

        point_count_lists = self.get_label_point_count(labelproject_condition, userId)
        if point_count_lists:
            point_count = point_count_lists[0]['count']
        else:
            point_count = 0

        return polygonCount, boxCount, magicCount, point_count

    @wrapper
    def get_label_point_count(self, labelproject_condition, user_id):

        pipeline = [{
            '$match': {"$and": [{"isDeleted": {"$ne": True}},
                                {"workAssignee": int(user_id)},
                                labelproject_condition
                                ]
                       }
            },
            {
                '$group': {
                    '_id': '$labelproject',
                    'count': {
                        '$sum': '$pointCount'
                    }
                }
            }
        ]
        collection_name = mongoDb.LABELS_COLLECTION_NAME

        return mongoDb.aggregate(collection_name=collection_name, pipeline=pipeline)

    @wrapper
    def get_worker(self, labelproject_id):

        pipeline = [{
            '$match': {
                'labelproject': labelproject_id
                       }
        },
            {
                '$group': {
                    '_id': '$workAssignee'
                }
            }
        ]
        collection_name = mongoDb.LABELS_COLLECTION_NAME

        return mongoDb.aggregate(collection_name=collection_name, pipeline=pipeline)

    @wrapper
    def getLabelProjectsById(self, labelProjectId):
        try:
            return labelprojectsTable.get(labelprojectsTable.id == labelProjectId)
        except:
            return None

    @wrapper
    def get_labelproject_by_connector_id(self, connector_id, *field):
        condition = (labelprojectsTable.dataconnectorsList.contains(f'[{connector_id},')) | (
                     labelprojectsTable.dataconnectorsList.contains(f', {connector_id},')) | (
                     labelprojectsTable.dataconnectorsList.contains(f', {connector_id}]')) | (
                     labelprojectsTable.dataconnectorsList.contains(f'[{connector_id}]'))

        return labelprojectsTable.select(*field).where(condition).execute()


    @wrapper
    def create_inspection_requests(self, data):
        return inspectionRequestsTable.create(**data)

    @wrapper
    def get_all_inspection_requests_by_user_id(self, user_id):
        return inspectionRequestsTable.select().where(inspectionRequestsTable.userId == user_id).execute()

    @wrapper
    def create_autolabeling_projects(self, data):
        return autolabelingProjectsTable.create(**data)

    @wrapper
    def getLabelProjectByDataconnectorList(self, dataconnectorList):
        try:
            return labelprojectsTable.get(labelprojectsTable.dataconnectorsList == dataconnectorList)
        except:
            return None

    @wrapper
    def getCommissionedLabelProjects(self, sorting, count, start, desc, searching):
        if sorting == 'created_at':
            sorting = labelprojectsTable.created_at
        elif sorting == 'updated_at':
            sorting = labelprojectsTable.updated_at
        elif sorting == 'name':
            sorting = labelprojectsTable.name
        elif sorting == 'workapp':
            sorting = labelprojectsTable.workapp
        elif sorting == 'last_updated_at':
            sorting = labelprojectsTable.last_updated_at
        commonWhere = (((labelprojectsTable.isDeleted == None) | (labelprojectsTable.isDeleted == False)) & (labelprojectsTable.shareaitrainer == True))
        notDeletedWhere = ((labelprojectsTable.status != 9) | (labelprojectsTable.status == None))

        if desc:
            sorting = sorting.desc()

        return labelprojectsTable.select().where(commonWhere & (labelprojectsTable.name.contains(searching))).order_by(sorting).paginate(start,count).execute()

    @wrapper
    def getSharedLabelprojectByAiTrainerUserId(self, userId, sorting, count, start, desc, searching):
        labelprojectList = []
        for x in groupsTable.select(groupsTable.labelprojectsid).join(
                groupUsersTable, on=(groupUsersTable.groupId == groupsTable.id)).where(
            (groupUsersTable.user == userId) & (groupsTable.groupType == 'aiTrainer')):
            labelprojectList = labelprojectList + ast.literal_eval(x.labelprojectsid)

        result = self.getLabelProjectsByUserId(userId, sorting, desc, searching, start, count, labelprojectList)

        return result

    @wrapper
    def getLabelProjectsByUserId(self, userId, sorting = 'created_at', desc = False, searching = '', page = 0, count = 10, labelProjectList = None):
        if sorting == 'updated_at':
            sorting = labelprojectsTable.updated_at
        elif sorting == 'name':
            sorting = labelprojectsTable.name
        elif sorting == 'workapp':
            sorting = labelprojectsTable.workapp
        elif sorting == 'last_updated_at':
            sorting = labelprojectsTable.last_updated_at
        elif sorting == 'status':
            sorting = peewee.Case(labelprojectsTable.status, (
                (100, 1), (99, 2), (1, 3)), 4)
        else:
            sorting = labelprojectsTable.created_at
        commonWhere = (((labelprojectsTable.isDeleted == None) | (labelprojectsTable.isDeleted == False)) & (
                    labelprojectsTable.visible == True) & ((
                               labelprojectsTable.user == userId) | (
                           labelprojectsTable.id.in_(labelProjectList)))) if labelProjectList else (
                ((labelprojectsTable.isDeleted == None) | (labelprojectsTable.isDeleted == False)) & (
                    labelprojectsTable.visible == True) & (
                        labelprojectsTable.user == userId))
        notDeletedWhere = ((labelprojectsTable.status != 9) | (labelprojectsTable.status == None))

        if desc:
            sorting = sorting.desc()

        query = labelprojectsTable.select().where(
            (labelprojectsTable.name.contains(searching)) & notDeletedWhere & commonWhere)

        return query.order_by(sorting).paginate(page,count).execute(), query.count()

    @wrapper
    def updateLabelProject(self, rowId, data):
        return labelprojectsTable.update(**data).where(labelprojectsTable.id == rowId).execute()

    @wrapper
    def update_voice_labeling(self, voice_label_id, data):
        return mongoDb.update_document_by_id(mongoDb.CALLLOG_TEXT_COLLECTION_NAME, voice_label_id, data)

    @wrapper
    def get_exam_voice_labeling(self):
        condition = {'isExam': True}

        pipeline =[
            {
                '$match': condition
            },
            {'$sample': {'size': 1}}
        ]

        return mongoDb.aggregate(mongoDb.CALLLOG_TEXT_COLLECTION_NAME, pipeline=pipeline)

    @wrapper
    def get_voice_label_count(self, user_id):
        collection_name = mongoDb.CALLLOG_TEXT_COLLECTION_NAME
        condition = {'workAssignee_id': user_id, 'status': 'done'}
        return mongoDb.get_documents_count(collection_name, condition)

    @wrapper
    def get_one_voice_labeling(self, voice_label_id):
        collection_name = mongoDb.CALLLOG_TEXT_COLLECTION_NAME
        return mongoDb.get_one_document_by_id(collection_name, voice_label_id)

    @wrapper
    def get_voice_labeling(self, user_id):
        collection_name = mongoDb.CALLLOG_TEXT_COLLECTION_NAME
        condition = {'workAssignee_id': user_id, 'status': 'working'}
        working_labeling = mongoDb.get_one_document_by_condition(collection_name, condition)
        if working_labeling:
            return working_labeling
        else:
            non_labels = []
            condition = {'isModified': {'$ne': True}, 'recordData': {"$ne": None}, 'workAssignee_id': None}
            question = mongoDb.get_one_document_by_condition(collection_name, condition)
            if question is None:
                return []

            condition = {'timestamp': {"$gte": question['timestamp']}, 'recordData': {"$ne": None},
                         'calllog': question['calllog']}
            data_lst = mongoDb.get_documents_to_paginate(collection_name, condition, sorting="timestamp", count=5, page=1)
            if data_lst:
                for data in data_lst:
                    if not data.get('isModified'):
                        non_labels.append(data)
                if non_labels:
                    return non_labels[random.randint(0, len(non_labels)-1)]
                else:
                    return question
            else:
                return question

    @wrapper
    def getLabelsByLabelClassId(self, class_id, limit=None):
        condition = {'$and': [{'$or': [{'isDeleted': None}, {'isDeleted': False}]}, {'labelclass': class_id}]}
        if limit:
            return mongoDb.get_documents(mongoDb.LABELS_COLLECTION_NAME, condition=condition, limit=limit)
        return mongoDb.get_documents(mongoDb.LABELS_COLLECTION_NAME, condition=condition)

    @wrapper
    def getLabelsByLabelProjectId(self, labelprojectId, limit=None):
        if type(labelprojectId) == int:
            condition = {'$and': [{'$or': [{'isDeleted': None}, {'isDeleted': False}]}, {'labelproject': labelprojectId}]}
        else:
            condition = {'$and': [{'$or': [{'isDeleted': None}, {'isDeleted': False}]},
                                  {'labelproject': {'$in': labelprojectId}}]}

        if limit:
            return mongoDb.get_documents(collection_name=mongoDb.LABELS_COLLECTION_NAME, condition=condition, limit=limit)
        return mongoDb.get_documents(collection_name=mongoDb.LABELS_COLLECTION_NAME, condition=condition)

    @wrapper
    def getLabelsByProjectId(self, projectId):
        condition = {'$and': [{'$or': [{'isDeleted': None}, {'isDeleted': False}]}, {'project': projectId}]}

        return mongoDb.get_documents(collection_name=mongoDb.DS2DATA_PROJECT_COLLECTION_NAME, condition=condition)

    @wrapper
    def get_ds2data_by_connector_id(self, connector_id, has_csv=True):
        pipe_line = [
            {
                '$match': {
                    'dataconnector': connector_id
                }
            }
        ]

        if has_csv:
            pipe_line.append({
                '$replaceRoot': {
                    'newRoot': {
                        '$mergeObjects': [
                            '$rawData', '$labelData'
                        ]
                    }
                }
            })

        return mongoDb.aggregate(collection_name=mongoDb.DS2DATA_COLLECTION_NAME, pipeline=pipe_line)

    @wrapper
    def getAutoLabellingProgress(self, labelproject_id):

        condition = {'$and' : [{'labelproject': labelproject_id}, {'$or':[{'isDeleted': False}, {'isDeleted': None}]}]}
        learningFileCount = mongoDb.get_documents_count(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, {"$and":[condition, {'status': 'ready'}]})
        total = 0
        progress = 0
        if autolabelingProjectsTable.realAmount:
            total = autolabelingProjectsTable.select(autolabelingProjectsTable.realAmount).where(
                autolabelingProjectsTable.labelprojectId == labelproject_id).order_by(autolabelingProjectsTable.id.desc()).limit(
                1).first()
            total = total.realAmount if total else 0
        elif autolabelingProjectsTable.requestedAmount:
            total = autolabelingProjectsTable.select(autolabelingProjectsTable.requestedAmount).where(
                autolabelingProjectsTable.labelprojectId == labelproject_id).order_by(
                autolabelingProjectsTable.id.desc()).limit(
                1).first()
            total = total.requestedAmount if total else 0
            progress = int((total - learningFileCount) / total * 100)

        condition = {"$and": [{'labelproject': labelproject_id}, {'status': 'ready'}]}
        next_ds2data = list(
            mongoDb.get_documents_to_paginate(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition,
                                              count=1, page=1, sorting='_id', direction=-1))

        s3Url = None
        if next_ds2data:
            s3Url = next_ds2data[0].get('s3Key')

        s3Url = s3Url if s3Url is not None else "done"
        return total, learningFileCount, progress, s3Url

    @wrapper
    def countDoneLabelsByLabelProjectId(self, labelproject_id):
        condition = {'$and': [{'status': "done"}, {'labelproject': labelproject_id}]}

        return mongoDb.get_documents_count(collection_name=mongoDb.LABELS_COLLECTION_NAME, condition=condition)

    @wrapper
    def getLabelInfosByLabelProjectId(self, labelProjectId):
        return labelinfosTable.select().where(labelinfosTable.labelproject == labelProjectId)

    @wrapper
    def getAutoLabelingProjectById(self, autolabelingProjectId):
        return autolabelingProjectsTable.get(autolabelingProjectsTable.id == autolabelingProjectId)

    @wrapper
    def getAutoLabelingProjectByProjectId(self, projectId):
        return autolabelingProjectsTable.get_or_none(autolabelingProjectsTable.projectId == projectId)

    @wrapper
    def getAutoLabelingProjectsByLabelProjectId(self, labelProjectId):
        return autolabelingProjectsTable.select().where((autolabelingProjectsTable.labelproject == labelProjectId) &
                                            (autolabelingProjectsTable.option == 'labeling'))
    @wrapper
    def getAsynctasksByLabelProjectId(self, labelProjectId):
        # TODO: 로직 변경으로 바뀔 수 있음 지금은 동일 물체인식 프로젝트로 오토라벨링시 개수를 1개로 침 (프로젝트 별 오토라벨링 개수 반환)
        # projectsId = [x.project for x in asynctasksTable.select(asynctasksTable.project).where((asynctasksTable.labelproject == labelProjectId) & (asynctasksTable.taskType == 'autoLabeling'))]
        # asyncId = [x.maxId for x in asynctasksTable.select(peewee.fn.MAX(asynctasksTable.id).alias('maxId')).where(
        #     asynctasksTable.project.in_(projectsId)).group_by(asynctasksTable.project)]
        # return asynctasksTable.select().where(
        #     asynctasksTable.id.in_(asyncId))
        return asynctasksTable.select().where((asynctasksTable.labelproject == labelProjectId) & (asynctasksTable.taskType == 'autoLabeling'))

    @wrapper
    def getProjectsByLabelProjectId(self, labelProjectId):
        return projectsTable.select().where(projectsTable.labelproject == labelProjectId)

    @wrapper
    def get_creating_custom_ai_project_id_by_label_project_id(self, label_project_id):
        status_code = [0, 1, 10, 11, 20, 21, 30, 31, 60, 61, 100]
        inner_where_query = (projectsTable.hasBestModel == None) | (projectsTable.hasBestModel != True)
        where_query = (projectsTable.labelproject == label_project_id) & (projectsTable.status.in_(status_code)) & (inner_where_query)
        return projectsTable.select(projectsTable.id).where(where_query).order_by(projectsTable.id.desc()).first()

    @wrapper
    def get_model_by_labelproject_id(self, labelProjectId):
        inner_query = projectsTable.select(projectsTable.id).where(projectsTable.labelproject == labelProjectId)
        where_query = (modelsTable.project.in_(inner_query) & (modelsTable.isFavorite == 1))
        return modelsTable.select(modelsTable.id, projectsTable.yClass).join(projectsTable, on=(modelsTable.project == projectsTable.id)).where(where_query).dicts()

    @wrapper
    def getLabelsByUserId(self, userId):
        condition = {"$and": [{"user": userId}, {"$or": [{"isDeleted": False}, {"isDeleted": None}]}]}

        return mongoDb.get_documents(collection_name=mongoDb.LABELS_COLLECTION_NAME, condition=condition)

    @wrapper
    def getAllLabelsByUserId(self, userId):
        # 테스트 코드 데이터 지울때 사용
        return labelsTable.select().where(labelsTable.user==userId)

    @wrapper
    def getAllLabelProjectsByUserId(self, userId):
        return labelprojectsTable.select().where(labelprojectsTable.user==userId)

    @wrapper
    def getDoneLabelCountBylabelclassId(self, labelclassId, workapp, has_shared, work_assignee=None):
        condition = {"$and": [{'labelclass': labelclassId}, {'isDeleted': {"$ne": True}}]}
        if has_shared:
            condition = {"$and":[condition, {"workAssignee": work_assignee}]}

        if workapp == 'object_detection':
            return mongoDb.get_documents_count(collection_name=mongoDb.LABELS_COLLECTION_NAME, condition=condition)
        else:
            return mongoDb.get_documents_count(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition)



    @wrapper
    def get_image_classification_label_count(self, labelproject):
        pipeline = [
            {
                '$match': {
                    'fileType': 'image',
                    'labelproject': labelproject,
                    'labelData': {'$exists': True}
                }
            }, {
            '$group': {
                '_id': '$labelData',
                'count': {
                    '$sum': 1
                }
            }
        }
        ]

        count_pipeline = [
            {
                '$match': {
                    'fileType': 'image',
                    'labelproject': labelproject,
                    'labelData': {'$exists': True}
                }
            }, {
            '$count': 'total_count'
        }, {
                '$project': {'_id': 0, 'total_count': 1}
            }
        ]

        label_data = mongoDb.aggregate(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME,
                                 pipeline=pipeline)
        label_data_count = mongoDb.aggregate(
            collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, pipeline=count_pipeline)
        label_count = label_data_count[0].get('total_count', 0) if len(label_data_count) > 0 else 0

        return label_data, label_count

    @wrapper
    def get_image_classification_s3_key(self, labelproject_id, label_data):
        pipeline = [
            {
                '$match': {
                    'fileType': 'image',
                    'labelproject': labelproject_id,
                    'labelData': label_data
                }
            }, {
            '$project': {
                's3key': 1,
                'originalFileName': 1,
                '_id': 0
            }
        }
        ]

        return mongoDb.aggregate(collection_name=mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, pipeline=pipeline)


    @wrapper
    def get_completed_label_count_group_by_labeltype(self, labelclass_id):
        pipeline = [
            {
                '$match': {
                    'labelclass': labelclass_id
                }
            }, {
            '$group': {
                '_id': '$labeltype',
                'count': {
                    '$sum': 1
                }
            }
        }
        ]

        return mongoDb.aggregate(collection_name=mongoDb.LABELS_COLLECTION_NAME, pipeline=pipeline)

    @wrapper
    def getCompletedLabelCountBylabelprojectId(self, labelclassId, workapp, is_shared, workAssignee):
        print('label')
        condition = {
            'labelproject': labelclassId,
            'isDeleted': {"$ne": True},
            'status': {'$in': ['review', 'done']},
            'workAssignee': workAssignee
        } if is_shared else {
                    'labelproject': labelclassId,
                    'isDeleted': {"$ne": True},
                    'status': {'$in': ['review', 'done']}
                }

        pipeline = [{
            '$match': {
                "$and": [condition]
            }
        }]

        pipeline.append({
            '$group': {
                '_id': '$labelclass',
                'count': {'$sum': 1}
            }
        })

        collection_name = mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME
        if workapp == 'object_detection':
            collection_name = mongoDb.LABELS_COLLECTION_NAME
        return mongoDb.aggregate(collection_name=collection_name, pipeline=pipeline)

    @wrapper
    def getBestAccuracyModelByProjectId(self, projectId):
        return modelsTable.select().where(modelsTable.project == projectId).order_by(modelsTable.accuracy.desc(),
                                                                                 modelsTable.rmse.desc()).get().__dict__['__data__']
    @wrapper
    def get_custom_ai_sample_result_by_id(self, custom_ai_sample_results_id):
        return customAiSampleResultsTable.get_or_none(customAiSampleResultsTable.id == custom_ai_sample_results_id)

    @wrapper
    def get_custom_ai_sample_result_by_labelproject_id_and_project_id(self, labelproject_id, project_id):
        where_query = ((customAiSampleResultsTable.labelprojectId == labelproject_id) & (customAiSampleResultsTable.projectId == project_id))
        return customAiSampleResultsTable.select().where(where_query).order_by(customAiSampleResultsTable.step, customAiSampleResultsTable.modelId).execute()

    @wrapper
    def create_custom_ai_sample_result(self, data):
        return customAiSampleResultsTable.create(**data)

    @wrapper
    def get_general_ai_by_model_id(self, model_id):
        where_query = ((marketModelsTable.status == 100) & (marketModelsTable.model == model_id))
        data = marketModelsTable.get_or_none(where_query)
        return data

    @wrapper
    def getAllLabelClassesByProjectId(self, projectId):
        return labelclassesTable.select().where(labelclassesTable.labelproject == projectId)

    @wrapper
    def updatelabelclassesIsdeletedById(self, Id):
        return labelclassesTable.update(**{"isDeleted": True}).where(labelclassesTable.id == Id).execute()

    @wrapper
    def getLabelClassesByLabelProjectId(self, labelProjectId, page=None, count=None):
        if type(labelProjectId) == int:
            project_where = (labelclassesTable.labelproject == labelProjectId)
        else:
            project_where = (labelclassesTable.labelproject.in_(labelProjectId))
        commonWhere = project_where & (
                    (labelclassesTable.isDeleted == None) | (labelclassesTable.isDeleted == False))
        if page is None or count is None or count == -1:
            return labelclassesTable.select().where(commonWhere).execute()
        else:
            return labelclassesTable.select().where(commonWhere).paginate(page, count).order_by(labelclassesTable.id.desc()).execute()

    @wrapper
    def getCoCoLabelClassesByLabelProjectId(self, labelProjectId):
        commonWhere = (labelclassesTable.labelproject == labelProjectId) & (
                    (labelclassesTable.isDeleted == None) | (labelclassesTable.isDeleted == False))

        return labelclassesTable.select().where(commonWhere).execute()


    @wrapper
    def getLabelClassesNameByLabelprojectId(self, labelProjectId):
        commonWhere = ((labelclassesTable.labelproject == labelProjectId) & ((labelclassesTable.isDeleted == False) | (labelclassesTable.isDeleted == None)))
        return labelclassesTable.select(labelclassesTable.id, labelclassesTable.name).where(commonWhere).execute()

    @wrapper
    def getLabelClassesCountByLabelProjectId(self, labelproject_id):
        commonWhere = (labelclassesTable.labelproject == labelproject_id) & (
                    (labelclassesTable.isDeleted == None) | (labelclassesTable.isDeleted == False))
        return labelclassesTable.select().where(commonWhere).count()

    @wrapper
    def createLabelclass(self, data):
        return labelclassesTable.create(**(data))

    @wrapper
    def delete_labelclass_by_id(self, label_class_id):
        return labelclassesTable.delete_by_id(label_class_id)

    @wrapper
    def getLabelclassCountByClassNameAndProjectId(self, className, labelprojectId):
        common_query = (labelclassesTable.name == className) & (labelclassesTable.labelproject == labelprojectId) & ((labelclassesTable.isDeleted == False)|(labelclassesTable.isDeleted == None))
        return labelclassesTable.select().where(common_query).count()

    @wrapper
    def updateLabelclassById(self, rowId, data):
        return labelclassesTable.update(**data).where(labelclassesTable.id == rowId).execute()

    @wrapper
    def getOneLabelclassById(self, rowId):
        return labelclassesTable.get(labelclassesTable.id == rowId)

    @wrapper
    def get_labelclass_id_by_name(self, labelproject_id, class_name):
        return labelclassesTable.get_or_none((labelclassesTable.labelproject == labelproject_id) & (labelclassesTable.name == class_name))

    @wrapper
    def getlabelByLabelclassId(self, labelclassId):
        condition = {'labelclass': labelclassId}

        return mongoDb.get_documents(collection_name=mongoDb.LABELS_COLLECTION_NAME, condition=condition)

    @wrapper
    def get_labels_count_and_price_by_label_project_id_and_label_status_name(self, label_project_id, label_status_name):
        label_count = peewee.fn.COUNT(labelsTable.labeltype).alias("count")

        entries = labelsTable.select(labelsTable.labeltype, label_count)\
            .where((labelsTable.status == label_status_name) & (labelsTable.labelproject == label_project_id))\
            .group_by(labelsTable.labeltype).execute()

        result = {
            "box": {},
            "polygon": {},
            "audio": {},
            "standard": {},
            "natural": {},
            "single_image": {}
        }

        for entry in entries:
            label_type = labelTypesTable.filter(entry.labeltype == labelTypesTable.name).first()
            result[label_type.name] = {
                "count": entry.count,
                "price": label_type.price,
                "total_price": label_type.price * entry.count
            }

        return result

    @wrapper
    def verify_labelclass_by_id_and_user_id(self, labelclass_id, user_id, role=None):
        try:
            result = labelprojectsTable.select().join(labelclassesTable, on=labelclassesTable.labelproject == labelprojectsTable.id).where(labelclassesTable.id == labelclass_id).get()
            if result.user == user_id or role == 'subadmin':
                return True
            else:
                return False
        except:
            return False

    @wrapper
    def getLabelsBySthreefileId(self, sthreefileId, is_autolabeling=False):
        condition = {"$and": [{"isDeleted": {"$ne": True}}, {"sthreefile": sthreefileId}]}
        condition = {"$and": [{"isDeleted": {"last_updated_by": "auto"}}, condition]} if is_autolabeling else condition

        return mongoDb.get_documents(collection_name=mongoDb.LABELS_COLLECTION_NAME, condition=condition)

    @wrapper
    def getLabelsBySthreeId(self, sthreefileId):
        condition = {"sthreefile": int(sthreefileId)}
        return mongoDb.get_documents(collection_name=mongoDb.LABELS_COLLECTION_NAME, condition=condition)

    @wrapper
    def getNotDeletedLabelClassesCountByLabelProjectId(self, labelProjectId):
        return labelclassesTable.select().where((labelclassesTable.labelproject == labelProjectId) & (
                (labelclassesTable.isDeleted == None) | (labelclassesTable.isDeleted == False))).count()

if __name__ == '__main__':
    # idList = [ObjectId('6090ee7e4f699f9b7be7f1bb'), ObjectId('6090eea44f699f9b7be7f1bd'), ObjectId('6090fb8b8272dbffe83133d4')]
    # collection = mongoDb.get_mongo_collection('labels')
    # collection.find({"_id":{'$in':idList}})
    HelperLabel().deleteLabelByStrhreeFile(85835)
    # result = list(HelperLabel().getLabelsByUserId(617))
    # print(result)
