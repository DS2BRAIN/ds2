import asyncio
import math
import random
import shutil
import urllib
import ast
import copy
import time
import subprocess

from io import StringIO
import chardet
from bson import ObjectId, json_util
from pandas.errors import ParserError
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import traceback
import pandas as pd
import os
import json

from models import dataconnectorsTable
from src.checkDataset import CheckDataset
from src.errors import exceptions as ex

from starlette.responses import JSONResponse
from playhouse.shortcuts import model_to_dict

from src.errors.exceptions import APIException
from src.manageUser import ManageUser
from src.util import Util
from models.helper import Helper
from starlette.status import HTTP_200_OK, HTTP_204_NO_CONTENT, HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_201_CREATED
from PIL import Image as PILImage
import cv2
import io
from src.rcf.main import RCF
import numpy as np
from src.errorResponseList import NOT_FOUND_USER_ERROR, NOT_ALLOWED_TOKEN_ERROR, \
    EXCEED_LABEL_ERROR, NOT_AITRAINER_ERROR, NOT_ALLOWED_WORKASSIGNEE_ERROR, EXCEED_PROJECT_ERROR, PRICING_ERROR, \
    ALREADY_DELETED_OBJECT
import datetime
from src.manageFile import ManageFile
from models import rd

class ManageLabeling:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.manageUserClass = ManageUser()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.manage_file = ManageFile()
        pd.options.display.float_format = '{:.5f}'.format

    class modelArgs():
        phase = 'train'
        epoch = 100
        dataset = 'my_data'
        model = 'contour.pth'
        result = 'my_data'

    def getContour(self, file, x1, y1, x2, y2):

        im = PILImage.open(io.BytesIO(file)).convert('RGB')

        if not os.path.exists('./src/rcf/ckpt/contour.pth'):
            self.s3.download_file("astoredslab", 'contour.pth', './src/rcf/ckpt/contour.pth')

        result = RCF(self.modelArgs()).predict(im)

        # _, binary = cv2.threshold(result, self.thresh, self.maxval, cv2.THRESH_BINARY_INV)
        _, binary = cv2.threshold(result, 200, 230, cv2.THRESH_BINARY_INV)
        # th2 = cv2.adaptiveThreshold(result, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 155, 1)
        # th3 = cv2.adaptiveThreshold(result, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 155, 1)
        # ret3, th4 = cv2.threshold(cv2.GaussianBlur(result, (5, 5), 0), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        contours, hierarchy = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        final_contour = self.filter(contours, x1, y1, x2 - x1, y2 - y1)

        return HTTP_200_OK, JSONResponse(content=final_contour[0].tolist())

    def filter(self, contours, x, y, width, height):
        filtered_contours = []
        final_contour = []
        for index, contour in enumerate(contours):
            is_include = True

            for point in contour:
                contour_x = point[0][0]
                contour_y = point[0][1]

                if (contour_x < x or contour_x > x + width) or (contour_y < y or contour_y > y + height):
                    is_include = False

            # if is_include and self.hierarchy[0][index][2] != -1:
            if is_include:
                filtered_contours.append(contour)

        if len(filtered_contours) > 0:
            final_contour = [filtered_contours[0]]
            max_area = self.calcPolygonArea(np.reshape(final_contour, (-1, 2)))

            if len(filtered_contours) > 1:
                for index, contour in enumerate(filtered_contours):
                    area = self.calcPolygonArea(np.reshape(contour, (-1, 2)))
                    if max_area < area:
                        max_area = area
                        final_contour = [contour]

        return final_contour

    def calcPolygonArea(self, points):
        return 0.5 * np.abs(np.dot(points[:, 0], np.roll(points[:, 1], 1))
                            - np.dot(points[:, 1], np.roll(points[:, 0], 1)))

    def autolabeling(self, token, autolabeling_object):
        labelproject_id = autolabeling_object.labelproject_id
        autolabeling_ai_type = autolabeling_object.autolabeling_ai_type
        autolabeling_type = autolabeling_object.autolabeling_type
        custom_ai_stage = autolabeling_object.custom_ai_stage
        general_ai_type = autolabeling_object.general_ai_type
        inference_ai_type = autolabeling_object.inference_ai_type
        preprocessing_ai_type = autolabeling_object.preprocessing_ai_type
        autolabeling_amount = autolabeling_object.autolabeling_amount
        model_id = autolabeling_object.model_id

        user = self.dbClass.getUser(token)
        if not user:
            raise ex.NotFoundUserEx(token)
        user_id = user['id']

        labelproject_raw = self.dbClass.getLabelProjectsById(labelproject_id)
        labelproject_dict = labelproject_raw.__dict__['__data__']
        if labelproject_dict['user'] != user_id:
            raise ex.NotAllowedTokenEx(user['email'])

        pricing_name = "OD"
        if autolabeling_type == "sementic":
            pricing_name = "LabelSem"
        else:
            if autolabeling_ai_type == 'custom':
                if labelproject_raw.workapp != 'object_detection':
                    pricing_name = "CR"
                model_dict = self.dbClass.getOneModelById(model_id, raw=True)
                project_id = model_dict.project
                project = self.dbClass.getOneProjectById(project_id, raw=True)
                labeling_class = None
                if project.yClass:
                    labeling_class = project.yClass.replace(' ', '')
            else:
                if general_ai_type == "facepoint":
                    pricing_name = "LabelFace"
                elif general_ai_type == "keypoint":
                    pricing_name = "LabelKey"
                project_id = None
                labeling_class = autolabeling_object.labeling_class

                for selectedY in labeling_class:
                    isMatched = False
                    for labelclass in self.dbClass.getLabelClassesByLabelProjectId(labelproject_id):
                        if labelclass.name == selectedY:
                            isMatched = True
                            print(f"generalAI labelclass is matched : {selectedY}")
                    if not isMatched:
                        color = self.get_random_hex_color()
                        data = {'name': selectedY, 'color': color, 'labelproject': labelproject_id}
                        self.dbClass.createLabelclass(data)
                        print(f"generalAI labelclass is created : {selectedY}")
                        labeling_class.append(selectedY)

        if self.utilClass.configOption != 'enterprise':
            price = self.dbClass.get_price_with_pricing_name(pricing_name)
            per_price = price['autolabelingPerCount']
            amount = autolabeling_amount * per_price

        self.dbClass.updateAutoLabelingFileByLabelprojectIdAndLimit(labelproject_dict['id'], autolabeling_amount)

        data = self.dbClass.create_autolabeling_projects({
            "status": 1,
            "modelId": model_id,
            "projectId": project_id,
            "labelprojectId": labelproject_id,
            "user": user_id,
            "autolabelingAiType": autolabeling_ai_type,
            "customAiStage": custom_ai_stage,
            "generalLabelingType": general_ai_type,
            "inferenceLabelingType": inference_ai_type,
            "labelingClass": labeling_class,
            "preprocessingAiType": preprocessing_ai_type,
            "requestedAmount": autolabeling_amount,
            "labelType": autolabeling_type
        })

        async_task = self.dbClass.createAsyncTask({
            "taskName": f'{labelproject_dict["name"]}',
            "taskNameEn": f'{labelproject_dict["name"]}',
            "taskType": "autoLabeling",
            "status": 0,
            "labelproject": labelproject_id,
            "model": model_id,
            "user": user_id,
            "autolabelingproject": data.id,
            "autolabelingCount": autolabeling_amount
        })

        if rd:
            rd.publish("broadcast", json.dumps(model_to_dict(async_task), default=json_util.default, ensure_ascii=False))

        self.utilClass.sendSlackMessage(
            f"오토라벨링 프로젝트가 생성되었습니다. {user['email']} (ID: {user['id']}) , 오토 라벨링 프로젝트 (ID: {data.id}) , 모델 ID: {model_id}",
            appLog=True, userInfo=user)

        return HTTP_201_CREATED, model_to_dict(async_task)

    def getSthreeFile(self, token, sthreefile_id, labelprojectId, workapp):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : getSthreeFile \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        role = None
        for temp in self.dbClass.getSharedLabelprojectIdByUserId(user['id']):
            if temp.labelprojectsid and int(labelprojectId) in ast.literal_eval(temp.labelprojectsid):
                group_user = self.dbClass.getMemberByUserIdAndGroupId(user['id'], temp.id)
                if group_user and role != 'admin':
                    role = role if role == 'subadmin' and group_user.role != 'admin' else group_user.role

        sthreefile_data = self.dbClass.getSthreeFileByIdWithWorkapp(sthreefile_id, user['id'], user['email'], workapp, role)
        if not sthreefile_data:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : getSthreeFile \n다른작업자가 접근함. sthreeFile = {sthreefile_id})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        if sthreefile_data['labelproject'] != labelprojectId:
            raise ex.NotAllowedLabelProjectIdEx(labelprojectId)

        if sthreefile_data.get('inspectionResult', None) is None:
            sthreefile_data['inspectionResult'] = None

        return HTTP_200_OK, sthreefile_data

    def upload_labelproject_data(self, labelproject_list, new_label_project, categories, user_dict, trainingMethod):
        class_id_name_dict = {}
        class_name_id_dict = {}
        class_name_list = []
        class_color_list = []
        try:
            if categories in ['object_detection', 'image', 'text', 'normal_classification', 'detection_3d']:
                labelclass_list = self.dbClass.getLabelClassesByLabelProjectId(labelproject_list)

                for labelclass in labelclass_list:
                    labelclass = model_to_dict(labelclass)
                    class_id_name_dict[labelclass['id']] = labelclass['name']
                    if labelclass['name'] in class_name_list:
                        continue
                    else:
                        class_name_list.append(labelclass['name'])
                        del labelclass['id']
                        color = self.get_random_hex_color()
                        while color in class_color_list:
                            color = self.get_random_hex_color()
                        labelclass['color'] = color
                        class_color_list.append(color)
                        labelclass['labelproject'] = new_label_project.id
                        result = self.dbClass.createLabelclass(labelclass)
                        class_name_id_dict[labelclass['name']] = result.id

            create_labelproject_files = []
            ds2data_list = self.dbClass.getSthreeFileByLabelProjectWithWorkapp(labelproject_list, categories)
            ds2data_list = [] if not ds2data_list else ds2data_list
            label_id_dict = {}
            label_list = []

            for labelproject_ds2data in ds2data_list:
                if trainingMethod == 'image' and categories == 'object_detection':
                    labelproject_ds2data['status'] = 'prepare'
                    labelproject_ds2data['labelclass'] = None
                workAssignee = None if labelproject_ds2data['status'] == 'prepare' else user_dict['email']
                class_name = class_id_name_dict.get(labelproject_ds2data.get('labelclass'))
                class_id = class_name_id_dict.get(class_name)
                labelproject_ds2data.update({
                    "user": user_dict['id'],
                    "workAssignee": workAssignee,
                    "isDeleted": False,
                    "reviewer": None,
                    "ds2data": labelproject_ds2data['ds2data'],
                    "labelproject": new_label_project.id,
                    "labelclass": class_id
                })

                if labelproject_ds2data.get('labels'):
                    label_id_dict[labelproject_ds2data['ds2data']] = labelproject_ds2data['labels']
                    del labelproject_ds2data['labels']
                del labelproject_ds2data['id']

                create_labelproject_files.append(labelproject_ds2data)

            self.dbClass.createLabelprojectFile(create_labelproject_files)

            if categories == 'object_detection' or categories == "detection_3d":
                for ds2data in create_labelproject_files:
                    if label_id_dict.get(ds2data['ds2data']):
                        labels = label_id_dict[ds2data['ds2data']]
                        for label in labels:
                            class_name = class_id_name_dict.get(label.get('labelclass'))
                            class_id = class_name_id_dict.get(class_name)
                            label['labelproject'] = new_label_project.id
                            label['user'] = user_dict['id']
                            label['workAssignee'] = user_dict['id']
                            label['labelclass'] = class_id
                            label['sthreefile'] = ds2data['id']
                            if categories == "detection_3d":
                                label['classAttributes']['classId'] = class_id
                            label_list.append(label)
                    else:
                        continue

                if label_list:
                    self.dbClass.createLabel(label_list)

            new_label_project.status = 100
            new_label_project.save()
            status = 100
        except:
            print(traceback.format_exc())
            new_label_project.status = 99
            new_label_project.save()
            status = 99
        data = {
            'taskName': f'{new_label_project.name}',
            'taskType': 'uploadLabelProjectData',
            'status': status,
            'labelproject': new_label_project.id,
            'user': new_label_project.user,
            'outputFilePath': '',
            'isChecked': 0
        }
        self.dbClass.createAsyncTask(data)

    def create_labelproject_from_dataconnectors(self, token, create_labelproject_request_object, background_tasks):
        categories = create_labelproject_request_object.workapp
        dataconnectors = create_labelproject_request_object.dataconnectors

        user_dict = self.dbClass.getUser(token)
        if not user_dict:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : getSthreeFile \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user_dict)
            return NOT_ALLOWED_TOKEN_ERROR

        user_dict['id'] = int(user_dict['id']) if type(user_dict['id']) == str else user_dict['id']
        labelclasses = []
        labelproject_list = []
        is_first = True
        dataconnector_raws = self.dbClass.getDataconnectorsByIds(dataconnectors)
        for x in dataconnector_raws:
            labelproject_list.append(x.originalLabelproject)
            if is_first:
                is_first = False
                copy_dataconnectors = model_to_dict(x)
                datacolumns = [column.__dict__['__data__'] for column in self.dbClass.getDatacolumnsByDataconnectorId(copy_dataconnectors['id'])]
                del copy_dataconnectors['id']
                del copy_dataconnectors['filePath']
                del copy_dataconnectors['updated_at']
                del copy_dataconnectors['created_at']
                copy_dataconnectors['user'] = user_dict['id']
                copy_dataconnectors['isSample'] = None
                copy_dataconnectors['description'] = None
                copy_dataconnectors['reference'] = None
                copy_dataconnectors['referenceUrl'] = None
                copy_dataconnectors['license'] = None
                copy_dataconnectors['licenseUrl'] = None
                copy_dataconnectors['sampleImageUrl'] = None
                copy_dataconnectors['isVisible'] = False
                new_dataconnector = self.dbClass.createDataconnector(copy_dataconnectors)
                for column in datacolumns:
                    del column['id']
                    column['dataconnector'] = new_dataconnector.id
                    self.dbClass.createDatacolumn(column)

                for labelclass in self.dbClass.getLabelClassesByLabelProjectId(x.originalLabelproject):
                    labelclasses.append(labelclass)

        for data in self.dbClass.getSthreeFilesByDataconnectors(dataconnectors):
            del data['id']
            data['dataconnector'] = new_dataconnector.id

        if set(labelproject_list) == {None}:
            raise ex.NotExitsFolderEx(user_dict['email'], dataconnectorsTable.originalLabelproject)

        label_project_info = {
            'workapp': categories,
            'description': create_labelproject_request_object.description,
            'name': create_labelproject_request_object.name,
            "user": user_dict['id'],
            "folder": None,
            "last_updated_at": datetime.datetime.now(),
            "dataconnectorsList": str([new_dataconnector.id]).replace(' ', ''),
            "status": 1
        }
        new_label_project = self.dbClass.createLabelProject(label_project_info)

        for labelclass in labelclasses:
            copy_labelclass = model_to_dict(labelclass)
            copy_labelclass['labelproject'] = new_label_project.id
            del copy_labelclass['id']
            self.dbClass.createLabelclass(copy_labelclass)

        data = {
            'taskName': f'{create_labelproject_request_object.name}',
            'taskNameEn': f'{create_labelproject_request_object.name}',
            'taskType': 'uploadLabelProjectData',
            'status': 0,
            'labelproject': new_label_project.id,
            'user': new_label_project.user,
            'outputFilePath': '',
            'isChecked': 0
        }
        self.dbClass.createAsyncTask(data)

        for dataconnector_raw in dataconnector_raws:
            project_list = dataconnector_raw.labelproject_id
            if project_list is None:
                project_list = [new_label_project.id]
            else:
                project_list.append(new_label_project.id)
            self.dbClass.updateDataconnectorById(rowId=dataconnector_raw.id, data={'labelproject_id': project_list})

        background_tasks.add_task(self.upload_labelproject_data, labelproject_list, new_label_project, categories,
                                  user_dict, copy_dataconnectors['trainingMethod'])

        return HTTP_201_CREATED, model_to_dict(new_label_project)


    def getLabels(self, token):

        user = self.dbClass.getUser(token)
        userId = self.dbClass.getId(token)
        if not userId:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : getLabels \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        return HTTP_200_OK, self.dbClass.getLabelsByUserId(userId)

    def update_voice_label_data(self, update_voice_labeling_object):
        token = update_voice_labeling_object.token
        voice_label_id = update_voice_labeling_object.voice_label_id
        transcript = update_voice_labeling_object.transcript

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : get_voice_label_data \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if user.isAiTrainer != True:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : get_voice_label_data \n음성 라벨링을 진행할 수 없는 계정 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise ex.NotAllowedVoiceLabelingEx(user.email)

        calllog_text_updated = self.dbClass.get_calllog_text_by_id(voice_label_id)

        if calllog_text_updated.get('isExam'):
            sentence = (calllog_text_updated['transcript'], transcript)

            tfidf_vectorizer = TfidfVectorizer()
            tfidf_matrix = tfidf_vectorizer.fit_transform(sentence)

            cos_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])

            if cos_sim[0][0] > 0.9:
                result = self.dbClass.get_voice_labeling(user.id)
            else:
                self.dbClass.updateUser(user.id, {'isAiTrainer': False})
                self.utilClass.sendSlackMessage(
                    f"음성 라벨링 정확도가 낮아 해당 계정의 라벨링이 금지됩니다. | 계정 : {user.email} | 정답 : {calllog_text_updated['transcript']} | 라벨링 한 값 : {transcript} |",
                    appLog=True, userInfo=user)
                raise ex.LowScoreErrorEx(user.email)
        else:
            if not calllog_text_updated.get('transcriptHistory'):
                calllog_text_updated['transcriptHistory'] = []
            calllog_text_updated['transcriptHistory'].append({
                "timestamp": datetime.datetime.utcnow().timestamp(),
                "transcript": transcript,
            })

            update_data = {
                "originalTranscript": calllog_text_updated['transcript'],
                "transcript": transcript,
                "transcriptHistory": calllog_text_updated['transcriptHistory'],
                "status": "done"
            }

            update_result = self.dbClass.update_voice_labeling(voice_label_id, update_data)

            if not update_result:
                raise ex.NormalEx()

            label_count = self.dbClass.get_voice_label_count(user.id)
            if label_count % 4 == 0:
                result = self.dbClass.get_exam_voice_labeling()
                result[0]['transcript'] = None
                result = result[0]
            else:
                result = self.dbClass.get_voice_labeling(user.id)

        return HTTP_200_OK, result

    def get_voice_label_data(self, token):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageLabeling.py \n함수 : get_voice_label_data \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if user.isAiTrainer != True:
            self.utilClass.sendSlackMessage(f"파일 : manageLabeling.py \n함수 : get_voice_label_data \n음성 라벨링을 진행할 수 없는 계정 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            raise ex.NotAllowedVoiceLabelingEx(user.email)

        label_count = self.dbClass.get_voice_label_count(user.id)

        if label_count % 4 == 0:
            result = self.dbClass.get_exam_voice_labeling()
            result[0]['transcript'] = None
            return HTTP_200_OK, result[0]
        else:
            result = self.dbClass.get_voice_labeling(user.id)
            update_data = {
                "status": "working",
                "workAssignee_id": user.id,
                "workAssignee_email": user.email
            }

            update_result = self.dbClass.update_voice_labeling(result['id'], update_data)
            if not update_result:
                raise ex.NormalEx()

            return HTTP_200_OK, result

    def get_one_voice_label_data(self, token, voice_id):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : get_voice_label_data \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if user.isAiTrainer != True:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : get_voice_label_data \n음성 라벨링을 진행할 수 없는 계정 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise ex.NotAllowedVoiceLabelingEx(user.email)


        result = self.dbClass.get_one_voice_labeling(voice_id)

        if (result.get('workAssignee_id') and result.get('workAssignee_id') != user.id) and result.get('isExam') != True:
            raise ex.NotAllowedVoiceLabelingEx(user.email)
        if result.get('isExam'):
            result['transcript'] = None

        return HTTP_200_OK, result

    def getLabel(self, token, labelId):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageLabeling.py \n함수 : getLabel \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        label = self.dbClass.getOneLabelById(labelId)

        label['labelclass'] = self.dbClass.getOneLabelclassById(label['labelclass']).__dict__['__data__']

        return HTTP_200_OK, label

    def get_labels_by_labelproject_id(self, token, labelproject_id):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageLabeling.py \n함수 : getLabel \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        labelproject = self.dbClass.getOneLabelProjectById(labelproject_id)

        if labelproject.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : appendShareGroup \n허용되지 않은 토큰 값입니다. token = {user.appTokenCode})",
                appError=True, userInfo=user.__dict__['__data__'])
            return NOT_ALLOWED_TOKEN_ERROR

        labels = self.dbClass.getLabelsByLabelProjectId(labelproject.id)

        return HTTP_200_OK, labels

    def get_prepare_labels_count_and_price(self, token, label_project_id):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            raise ex.NotFoundUserEx(token)

        if self.dbClass.getOneLabelProjectById(label_project_id).user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : updateLabelclass \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            raise ex.NotAllowedTokenEx(user.email)
        result = self.dbClass.get_labels_count_and_price_by_label_project_id_and_label_status_name(label_project_id, "prepare")

        return HTTP_200_OK, result

    def create_labels(self, token, label_info_raws, info=False):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : createLabel \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        labels = []
        amount = 0
        user_id = user.id
        sthreefile = self.dbClass.getSthreeFileById(label_info_raws[0].sthreefile)
        if sthreefile['user'] != user.id:
            sthreefile_user = self.dbClass.getOneUserById(sthreefile['user'], raw=True)
            user_id = sthreefile['user']
        count = len(label_info_raws)

        if label_info_raws[0].labeltype in ['box', 'polygon', 'polyline']:
            model_type = "OD"
        else:
            model_type = "CR"

        for label_info_raw in label_info_raws:
            labelprojectRaw = self.dbClass.getOneLabelProjectById(label_info_raw.labelproject)
            labelprojectUser = self.dbClass.getOneUserById(labelprojectRaw.user)

            if self.dbClass.isUserHavingExceedLabelCount(labelprojectUser):
                self.utilClass.sendSlackMessage(
                    f"파일 : manageLabeling\n 함수 : createLabel \n 예측 기능 사용량 초과입니다. \nuser = {user})",
                    appError=True, userInfo=user)
                return EXCEED_LABEL_ERROR

            labelprojectRaw.updated_at = datetime.datetime.now()
            labelprojectRaw.save()

            ismember = False
            if labelprojectRaw.sharedgroup:
                for groupId in ast.literal_eval(labelprojectRaw.sharedgroup):
                    if self.dbClass.checkSignedGroup(user.id, groupId):
                        ismember = True
                        break

            if sthreefile['user'] != user.id and not ismember:
                if not user.isAiTrainer:
                    self.utilClass.sendSlackMessage(
                        f"파일 : manageLabeling\n 함수 : createLabel \n트레이너가 아닌 유저의 공유된 프로젝트 조회 userID = {user.id})",
                        appError=True, userInfo=user)
                    return NOT_AITRAINER_ERROR

            labelInfo = {**label_info_raw.__dict__}
            del labelInfo['id']
            if labelInfo['labeltype'] in ['image']:
                labelclass_raw = self.dbClass.getOneLabelclassById(labelInfo['labelclass'])
                self.dbClass.updateSthreeFileById(labelInfo['sthreefile'], {'labelData': labelclass_raw.name, 'labelclass': labelInfo['labelclass']})
            elif labelInfo['labeltype'] in ['normal_regression', 'text', 'normal_classification']:
                self.dbClass.updateSthreeFileById(labelInfo['sthreefile'], {'labelData': labelInfo['structuredData'], 'labelclass': labelInfo['labelclass']})
            elif labelInfo['labeltype'] == 'voice':
                self.dbClass.updateSthreeFileById(labelInfo['sthreefile'], {'labelData': labelInfo['voiceLabel']})
            else:
                if not self.check_valid_point(labelInfo):
                    continue

                labelInfo["user"] = labelprojectRaw.user
                if sthreefile['status'] == 'review':
                    labelInfo["workAssignee"] = None
                    labelInfo['reviewer'] = user.id
                else:
                    labelInfo["workAssignee"] = user.id
                    labelInfo['reviewer'] = None

                labelInfo['isDeleted'] = False
                labelInfo['created_at'] = datetime.datetime.now()
                labelInfo['updated_at'] = None
                labels.append(self.dbClass.createLabel(labelInfo))

        if model_type == 'OD':
            self.dbClass.updateUserManualLabelCount(user_id, count)
        if sthreefile['status'] == 'working':
            self.dbClass.updateUserManualLabelImageCount(user_id, 1, model_type)
        # self.dbClass.updateUserUsedPrice(user_id, amount)

        if info:
            return HTTP_201_CREATED, labels
        else:
            return HTTP_201_CREATED, {'result': 'success'}

    def check_valid_point(self, label_info):

        is_valid = True
        label_type = label_info.get('labeltype')
        if label_type == 'box':
            temp_list = [label_info.get('x'), label_info.get('y'), label_info.get('w'), label_info.get('h')]
            if None in temp_list:
                is_valid = False
        elif label_type == 'polygon':
            for point in label_info.get('points'):
                if None in point:
                    is_valid = False
                    break
        else:
            is_valid = False

        return is_valid

    def createLabel(self, token, labelInfoRaw):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageLabeling.py \n함수 : createLabel \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        sthreefile = self.dbClass.getSthreeFileById(labelInfoRaw.sthreefile)
        labelprojectRaw = self.dbClass.getOneLabelProjectById(sthreefile['labelproject'])
        labelprojectUser = self.dbClass.getOneUserById(labelprojectRaw.user)

        if self.dbClass.isUserHavingExceedLabelCount(labelprojectUser):
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : createLabel \n 예측 기능 사용량 초과입니다. \nuser = {user})",
                appError=True, userInfo=user)
            return EXCEED_LABEL_ERROR

        update_sthree_data = {'workAssignee': user.email}
        self.dbClass.updateSthreeFileById(sthreefile['id'], update_sthree_data)
        labelprojectRaw.updated_at = datetime.datetime.now()
        labelprojectRaw.save()

        ismember = False
        if labelprojectRaw.sharedgroup:
            for groupId in ast.literal_eval(labelprojectRaw.sharedgroup):
                if self.dbClass.checkSignedGroup(user.id, groupId):
                    ismember = True
                    break

        if sthreefile['user'] != user.id and not ismember:
            if not user.isAiTrainer:
                self.utilClass.sendSlackMessage(
                    f"파일 : manageLabeling\n 함수 : createLabel \n트레이너가 아닌 유저의 공유된 프로젝트 조회 userID = {user.id})",
                    appError=True, userInfo=user)
                return NOT_AITRAINER_ERROR

        labelInfo = {**labelInfoRaw.__dict__}
        labelInfo["user"] = labelprojectRaw.user
        labelInfo["workAssignee"] = user.id
        labelInfo['isDeleted'] = False
        self.dbClass.updateUserCumulativeLabelCount(labelprojectRaw.user, 1)

        return HTTP_201_CREATED, self.dbClass.createLabel(labelInfo)

    def updateLabels(self, token, label_info_raws):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : updateLabel \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        sthreefile = None
        for label_info_raw in label_info_raws:
            if label_info_raw.labeltype in ['voice', 'normal_regression', 'normal_classification', 'text', 'image']:
                sthreefile = self.dbClass.getSthreeFileById(label_info_raw.id)
                label_data = ''
                workAssignee = user.email

                if label_info_raw.labeltype in ['normal_regression', 'normal_classification', 'text']:
                    label_data = label_info_raw.structuredData
                elif label_info_raw.labeltype in ['image']:
                    class_raw = self.dbClass.getOneLabelclassById(label_info_raw.labelclass)
                    label_data = class_raw.name
                elif label_info_raw.labeltype == 'voice':
                    label_data = label_info_raw.voiceLabel

                # if sthreefile.get('workAssignee', None) and sthreefile['workAssignee'] != workAssignee:
                #     self.utilClass.sendSlackMessage(
                #         f"파일 : manageLabeling.py \n함수 : updateLabel \n최종 작업자가 아닌 사람이 라벨수정 | 입력한 토큰 : {token}, 수정하려한 라벨 :  {sthreefile['id']}|",
                #         appError=True, userInfo=user)
                #     return NOT_ALLOWED_WORKASSIGNEE_ERROR

                data = {'status': 'done',
                        'labelData': label_data,
                        'labelclass': label_info_raw.labelclass,
                        'updated_at': datetime.datetime.utcnow()
                        }
                if sthreefile['status'] == 'review':
                    data['reviewer'] = workAssignee
                else:
                    data['workAssignee'] = workAssignee

                self.dbClass.updateSthreeFileById(sthreefile['id'], data)
                sthreefile.update(data)
                labelInfo = sthreefile

            else:
                sthreefile = self.dbClass.getSthreeFileById(label_info_raw.sthreefile)
                # label = self.dbClass.getOneLabelById(label_info_raw.id)

                # if label.get('workAssignee', None) and int(label['workAssignee']) != user.id:
                #     self.utilClass.sendSlackMessage(
                #         f"파일 : manageLabeling.py \n함수 : updateLabel \n최종 작업자가 아닌 사람이 라벨수정 | 입력한 토큰 : {token}, 수정하려한 라벨 :  {label['id']}|",
                #         appError=True, userInfo=user)
                #     return NOT_ALLOWED_WORKASSIGNEE_ERROR

                label_info = {**label_info_raw.__dict__}
                del label_info['id']
                label_info['updated_at'] = datetime.datetime.utcnow()
                if sthreefile['status'] == 'review':
                    label_info['reviewer'] = user.id
                else:
                    label_info['workAssignee'] = user.id
                label_info = {k: v for k, v in label_info.items() if v is not None}

                self.dbClass.updateLabelById(label_info_raw.id, label_info)

        if sthreefile:
            labelprojectRaw = self.dbClass.getOneLabelProjectById(sthreefile['labelproject'])
            labelprojectRaw.updated_at = datetime.datetime.now()
            labelprojectRaw.save()

        return HTTP_200_OK, {'result': 'success'}

    # def updateLabel(self, token, labelId, labelInfoRaw):
    #
    #     user = self.dbClass.getUser(token, raw=True)
    #     if not user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageLabeling.py \n함수 : updateLabel \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
    #             appError=True, userInfo=user)
    #         return NOT_FOUND_USER_ERROR
    #
    #     if labelInfoRaw.labeltype in ['voice', 'normal_regression', 'normal_classification', 'text', 'image']:
    #         sthreefile = self.dbClass.getSthreeFileById(labelId)
    #         label_data = ''
    #         workAssignee = user.email
    #
    #         if labelInfoRaw.labeltype in ['normal_regression', 'normal_classification', 'text']:
    #             label_data = labelInfoRaw.structuredData
    #         elif labelInfoRaw.labeltype in ['image']:
    #             class_raw = self.dbClass.getOneLabelclassById(labelInfoRaw.labelclass)
    #             label_data = class_raw.name
    #         elif labelInfoRaw.labeltype == 'voice':
    #             label_data = labelInfoRaw.voiceLabel
    #
    #         # if sthreefile.get('workAssignee', None) and sthreefile['workAssignee'] != workAssignee:
    #         #     self.utilClass.sendSlackMessage(
    #         #         f"파일 : manageLabeling.py \n함수 : updateLabel \n최종 작업자가 아닌 사람이 라벨수정 | 입력한 토큰 : {token}, 수정하려한 라벨 :  {sthreefile['id']}|",
    #         #         appError=True, userInfo=user)
    #         #     return NOT_ALLOWED_WORKASSIGNEE_ERROR
    #
    #         data = {'workAssignee': workAssignee,
    #                 'status':'done',
    #                 'labelData':label_data,
    #                 'labelclass':labelInfoRaw.labelclass
    #                 }
    #
    #         self.dbClass.updateSthreeFileById(sthreefile['id'], data)
    #         sthreefile.update(data)
    #         labelInfo = sthreefile
    #
    #     else:
    #         sthreefile = self.dbClass.getSthreeFileById(labelInfoRaw.sthreefile)
    #         label = self.dbClass.getOneLabelById(labelId)
    #
    #         # if label.get('workAssignee', None) and int(label['workAssignee']) != user.id:
    #         #     self.utilClass.sendSlackMessage(
    #         #         f"파일 : manageLabeling.py \n함수 : updateLabel \n최종 작업자가 아닌 사람이 라벨수정 | 입력한 토큰 : {token}, 수정하려한 라벨 :  {label['id']}|",
    #         #         appError=True, userInfo=user)
    #         #     return NOT_ALLOWED_WORKASSIGNEE_ERROR
    #
    #         labelInfo = {**labelInfoRaw.__dict__}
    #
    #         labelInfo['updated_at'] = datetime.datetime.now()
    #         labelInfo['workAssignee'] = user.id
    #
    #         labelInfo = {k: v for k, v in labelInfo.items() if v is not None}
    #
    #         self.dbClass.updateLabelById(labelId, labelInfo)
    #
    #     labelprojectRaw = self.dbClass.getOneLabelProjectById(sthreefile['labelproject'])
    #     labelprojectRaw.updated_at = datetime.datetime.now()
    #     labelprojectRaw.save()
    #
    #     return HTTP_200_OK, labelInfo

    def deleteLabels(self, token, label_id_list):

        failList = []
        successList = []

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : deleteLabel \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        for label_id in label_id_list:
            try:
                label = self.dbClass.getOneLabelById(label_id)
                data = {'reviewer': user.id} if label.get('workAssignee') != user.id else {}

                if label:
                    self.dbClass.updateLabelIsdeletedByLabelId(label_id, update_data=data)
                    if label.get('last_updated_by') and label['last_updated_by'] == 'auto':
                        user.deposit += 10
                successList.append(label_id)
            except:
                failList.append(label_id)
        user.save()

        return HTTP_200_OK, {'successList': successList, 'failList': failList}

    # def deleteLabel(self, token, labelIdList):
    #
    #     if type(labelIdList) == str:
    #         labelIdList = [labelIdList]
    #     elif type(labelIdList) != list:
    #         labelIdList = ast.literal_eval(labelIdList)
    #         if type(labelIdList) == int:
    #             labelIdList = [labelIdList]
    #
    #     failList = []
    #     successList = []
    #
    #     user = self.dbClass.getUser(token, raw=True)
    #     if not user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageLabeling.py \n함수 : deleteLabel \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
    #             appError=True, userInfo=user)
    #         return NOT_FOUND_USER_ERROR
    #
    #     has_labelproject = False
    #     labelproject_user = None
    #
    #     for labelId in labelIdList:
    #         try:
    #             label = self.dbClass.getOneLabelById(labelId)
    #             if not has_labelproject:
    #                 labelproject_user = self.dbClass.getOneLabelProjectById(label['labelproject']).user
    #                 has_labelproject = True
    #
    #             if label:
    #                 # if labelproject_user != user.id and label.get('workAssignee') and int(label['workAssignee']) != user.id:
    #                 #     self.utilClass.sendSlackMessage(
    #                 #         f"파일 : manageLabeling.py \n함수 : deleteLabel \n최종 작업자가 아닌 사람이 라벨삭 | 입력한 토큰 : {token}, 수정하려한 라벨 :  {label['id']}|",
    #                 #         appError=True, userInfo=user)
    #                 #     return NOT_ALLOWED_WORKASSIGNEE_ERROR
    #                 self.dbClass.updateLabelIsdeletedByLabelId(labelId)
    #                 if label.get('last_updated_by') and label['last_updated_by'] == 'auto':
    #                     user.deposit += 10
    #             successList.append(labelId)
    #         except:
    #             failList.append(labelId)
    #     user.save()
    #
    #     return HTTP_200_OK, {'successList':successList, 'failList':failList}

    # def getCommissionedlabelprojects(self, token, sorting, count, start, desc, searching):
    #
    #     user = self.dbClass.getUser(token, True)
    #     if not user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageLabeling\n 함수 : getCommissionedlabelprojects \n허용되지 않은 토큰 값입니다. token = {user.id})",
    #             appError=True, userInfo=user)
    #         return NOT_ALLOWED_TOKEN_ERROR
    #
    #     if not user.isAiTrainer:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageLabeling\n 함수 : getCommissionedlabelprojects \n트레이너가 아닌 유저의 공유된 프로젝트 조회 userID = {user.id})",
    #             appError=True, userInfo=user)
    #         return NOT_AITRAINER_ERROR
    #
    #     result = [x.__dict__['__data__'] for x in self.dbClass.getSharedLabelprojectByAiTrainerUserId(user.id, sorting, count, start, desc, searching)]
    #
    #     return HTTP_200_OK, result

    # def appendCommissionedlabelprojects(self, token, labelprojectId, isShared):
    #
    #     user = self.dbClass.getUser(token)
    #     if not user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageLabeling\n 함수 : getLabelProjects \n허용되지 않은 토큰 값입니다. token = {token})",
    #             appError=True, userInfo=user)
    #         return NOT_ALLOWED_TOKEN_ERROR
    #
    #     labelProject = self.dbClass.getLabelProjectsById(labelprojectId)
    #
    #     if user['id'] != labelProject.user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageLabeling\n 함수 : appendCommissionedlabelprojects \n허용되지 않은 토큰 값입니다. token = {token})",
    #             appError=True, userInfo=user)
    #         return NOT_ALLOWED_TOKEN_ERROR
    #
    #     labelProject.shareaitrainer = isShared
    #     labelProject.save()
    #
    #     return HTTP_200_OK, labelProject.__dict__['__data__']


    def getLabelProjects(self, token, sorting, count, page, desc, searching):

        result = {}
        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : getLabelProjects \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR
        userId = user['id']

        result['projects'] = []

        sharedProjects = []
        for temp in self.dbClass.getSharedLabelprojectIdByUserId(user['id']):
            if temp.labelprojectsid:
                sharedProjects = list(set(sharedProjects + ast.literal_eval(temp.labelprojectsid)))

        labelprojects, totalLength = self.dbClass.getLabelProjectsByUserId(userId, sorting, desc, searching, page, count, sharedProjects)

        for labelproject in labelprojects:
            labelproject = model_to_dict(labelproject)
            labelproject['role'] = 'admin' if labelproject['user'] == user['id'] else 'member'
            result['projects'].append(labelproject)

        if sorting == 'role':
            tmp_sorted = result['projects']
            if desc:
                tmp_sorted = sorted(tmp_sorted, key=(lambda x: x['created_at']))
            result['projects'] = sorted(tmp_sorted, key=(lambda x: x['role']), reverse=desc)

        result['totalLength'] = totalLength

        return HTTP_200_OK, result

    def create_label_project(self, token, background_tasks, label_project_info, files, frame_value, has_de_identification):
        result = {}
        status = HTTP_201_CREATED
        status_msg = 'Success'
        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : createLabelProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise NOT_FOUND_USER_ERROR

        if self.dbClass.isUserHavingExceedProjectCount(user):
            self.utilClass.sendSlackMessage(
                f"csv Parse - run() \n프로젝트 사용량 초과입니다 {user['email']} (ID: {user['id']})",
                appLog=True, userInfo=user)
            raise EXCEED_PROJECT_ERROR

        label_project_info["last_updated_at"] = datetime.datetime.now()
        label_project_info["user"] = user['id']

        timestamp = time.strftime('%y%m%d%H%M%S')
        temp_folder = f"{os.getcwd()}/temp/{timestamp}"
        os.mkdir(temp_folder)

        common_data = {
            "user_id": user['id'],
            "email": user['email'],
            "temp_folder": temp_folder,
            "frame_value": frame_value
        }

        try:
            base_data_list, total_file_size, file_list = self.manage_file.check_data(files, common_data)
            if self.dbClass.isUserHavingExceedDiskUsage(user, total_file_size) or self.dbClass.isUserHavingTotaldDiskUsage(user, total_file_size):
                raise ex.ExceedDiskusageEx(user_id=user['id'])
        except ex.APIException as e:
            shutil.rmtree(temp_folder)
            status = e.status_code
            status_msg = e.detail
        except Exception as e:
            shutil.rmtree(temp_folder)
            status = e.status
            status_msg = e.msg
        else:
            dataconnectors_dict = {}
            dataconnectors_list = []
            for file_dict in file_list:
                dataconnector_id = self.create_dataconnector(file_dict['file'], file_dict['file_name'], user)
                dataconnectors_dict[file_dict['file_name']] = dataconnector_id
                dataconnectors_list.append(dataconnector_id)

            label_project_info["user"] = user['id']
            label_project_info["folder"] = None
            label_project_info["last_updated_at"] = datetime.datetime.now()
            label_project_info["dataconnectorsList"] = str(dataconnectors_list).replace(' ', '')
            new_label_project = self.dbClass.createLabelProject(label_project_info).__dict__['__data__']

            result['id'] = new_label_project['id']
            common_data["labelproject_id"] = new_label_project['id']
            common_data["labelproject_name"] = new_label_project['name']
            common_data['dataconnectors'] = dataconnectors_dict
            common_data['workapp'] = new_label_project['workapp']
            common_data['has_de_identification'] = has_de_identification
            background_tasks.add_task(self.manage_file.upload_data, base_data_list, common_data)

            self.utilClass.sendSlackMessage(
                f"라벨링 프로젝트를 생성하였습니다. {user['email']} (ID: {user['id']}) , {json.dumps(label_project_info, indent=4, ensure_ascii=False, default=str)}",
                appLog=True, userInfo=user)
        finally:
            result['status_msg'] = status_msg
            result['labelproject'] = new_label_project
            return status, result

    def get_ds2data_url(self, file_name, labelproject_id=None, project_id=None):
        if labelproject_id:
            result = self.dbClass.getOneLabelprojectFileByCondition({'$and': [{'fileName': file_name}, {'labelproject': labelproject_id}]})
        elif project_id:
            result = self.dbClass.getOneProjectFileByCondition({'$and': [{'fileName': file_name}, {'project': project_id}]})
        else:
            raise ex.NormalEx()

        if result.get('s3key'):
            return result['s3key']
        else:
            raise ex.NormalEx()

    def create_dataconnector(self, file, file_name, user):
        yClass = None
        folders = []
        rows = []
        file_counts = {}
        file_tops = {}
        has_text_data = False
        training_method = ''
        value_for_predict = ''
        has_image_Data = False
        if ".zip" in file_name:
            temp_file, file_size, new_file_name = self.getTempFileAndSize(file_name, file=file, isZip=True)
            has_image_Data = True

            try:
                training_method = 'object_detection'
                value_for_predict = 'label'

                jsonFileName = self.getJSONfile(temp_file)
                response, body = CheckDataset().checkCoCoFile(filePath=jsonFileName)
                if response == 503:
                    return response, body
                df, yClass = self.readObjectDetectionJSONFile(jsonFileName)

                try:
                    shutil.rmtree(os.getcwd() + "/temp/" + ".".join(file_name.split(".")[:-1]))
                except:
                    pass

            except:
                value_for_predict = 'label'
                for (dir_path, dir_names, file_names) in os.walk(
                        os.path.splitext(temp_file)[0]):

                    if '__MACOSX' in dir_path:
                        continue

                    folders.append(dir_names)
                    folder_name = ""
                    try:
                        folder_name = dir_path.split(f"/")[-1]
                    except:
                        pass
                    for file_name in file_names:
                        if '.' in temp_file:
                            if file_name.split('.')[1].lower() in self.utilClass.imageExtensionName:
                                rows.append({
                                    'image': f"{folder_name}/{file_name}",
                                    'label': folder_name
                                })
                        if file_size <= 300 * 1024 * 1024:
                            if len(folders) == 1:
                                for xClass in folders[0]:
                                    if f'{xClass}' in dir_path:
                                        if not file_counts.get(xClass):
                                            file_counts[xClass] = 0
                                        file_counts[xClass] += 1
                                        file_tops[xClass] = f'{xClass}/{file_name}'
                            else:
                                for xClass in folders[1]:
                                    if f'{folders[0][0]}/{xClass}' in dir_path:
                                        if not file_counts.get(xClass):
                                            file_counts[xClass] = 0
                                        file_counts[xClass] += 1
                                        file_tops[xClass] = f'{xClass}/{file_name}'
                try:
                    shutil.rmtree(os.getcwd() + "/temp/" + ".".join(file_name.split(".")[:-1]))
                except:
                    pass

                pass
                df = pd.DataFrame(rows)

        elif '.csv' in file_name:  # csv
            has_text_data = True

            # fileSize = os.path.getsize(tempFile)
            df, dataCnt, file_size, req = self.readFile(file)

            tempFile, file_size, new_file_name = self.getTempFileAndSize(file_name, df=df, file=file)
        else:
            file_size = len(file)
            rows.append({
                'image': f"image/{file_name}",
                'label': 'image'
            })
            file_tops['image'] = f'{file_name}'
            df = pd.DataFrame(rows)
            timestamp = time.time()
            new_file_name = f"{timestamp}{file_name}"

        sample_data = json.dumps(df[:120].to_dict('records'))
        sample_data = sample_data.replace("NaN", "null")

        self.dbClass.updateUserCumulativeDiskUsage(user['id'], len(file))
        self.dbClass.updateUserTotalDiskUsage(user['id'], len(file))

        self.s3.put_object(Body=file, Bucket=self.utilClass.bucket_name, Key=f"user/{user['id']}/{new_file_name}")
        s3Url = urllib.parse.quote(
            f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{user["id"]}/{new_file_name}').replace(
            'https%3A//', 'https://')
        if self.utilClass.configOption == 'enterprise':
            s3Url = f"{self.utilClass.save_path}/user/{user['id']}/{new_file_name}"

        dataconnector_name = f"{file_name} label - dataconnector"
        dataconnector_type = "labeling"

        dataconnector = self.dbClass.createDataconnector({
            "dataconnectorName": self.utilClass.unquote_url(dataconnector_name),
            "dataconnectortype": dataconnector_type,
            "originalFileName": file_name,
            "trainingMethod": training_method,
            "valueForPredict": value_for_predict,
            "yClass": yClass,
            "sampleData": sample_data,
            "filePath": s3Url,
            "user": user['id'],
            "hasImageData": has_image_Data,
            "hasTextData": has_text_data,
            "fileSize": file_size,
        })

        self.utilClass.sendSlackMessage(
            f"데이터 커넥터 추가합니다. {user['email']} , {self.utilClass.unquote_url(dataconnector_name)}", appLog=True,
            userInfo=user)

        return dataconnector.id

    def readFile(self, filess=None):
        fileSize = len(filess)

        if fileSize > self.utilClass.maxsize or fileSize > self.utilClass.csvmaxsize:
            return 0, 0, 0, 503

        try:
            dataLen = min(len(filess.split(b'\n'))-1, 500)
            columnByte = b"\n".join(filess.split(b'\n')[:1])
            dataByte = b"\n".join(filess.split(b'\n')[-dataLen:])
            smallfile = columnByte+b"\n"+dataByte

            try:
                encodingCode = chardet.detect(smallfile)
                if encodingCode['encoding'] == 'EUC-KR':
                    encodingCode = 'cp949'
                else:
                    encodingCode = encodingCode['encoding']
            except:
                encodingCode = 'UTF-8'
            temp = smallfile.decode(encodingCode, "ignore").strip()
            df = pd.read_csv(StringIO(temp), encoding='UTF-8', error_bad_lines=False, warn_bad_lines=False)[-120:]
            # df = pd.DataFrame(newdata[1:],columns=newdata[0])
        except ParserError:
            try:
                df = pd.read_csv(io.StringIO(temp), encoding='UTF-8', error_bad_lines=False, warn_bad_lines=False, engine='python')[-120:]
            except:
                df = pd.read_csv(StringIO(temp), encoding='cp949', error_bad_lines=False, warn_bad_lines=False)[-120:]
            pass
        except Exception as e:  # df 리스트 전환 에러
            print(traceback.format_exc())
            return 0, 0, 0, 500
            pass
        # 컬럼 데이터가 없을 경우
        df = df.replace(' ', '')
        df = df.dropna(how='all', axis=1)
        # df = df.dropna(how='any', axis=0)
        # df.columns = df.columns.str.strip()
        columns = df.columns

        for column in columns:
            try:
                float(column)
                df['column__' + column] = df[column]
                df = df.drop(column, 1)
            except:
                # print(traceback.format_exc())
                pass
        # 불필요한 컬럼 삭제
        df = self.removeNotUsedTable(df)
        return df, df.shape[0], fileSize, 200

    def removeNotUsedTable(self, df):
        columns = list(df.columns)
        isBlankColumnDeleted = False

        for i in range(0, len(columns)):

            # 아무 것도 없을 경우
            if columns[i] == 'Unnamed: ' + str(i):
                del df['Unnamed: ' + str(i)]

            # 공백일 경우
            if columns[i].strip() == '':
                if not isBlankColumnDeleted:
                    df.drop(df.columns[i], axis=1, inplace=True)
                    isBlankColumnDeleted = True
                # del df[columns[i]]
        if list(df.columns)[-1].strip() == '':
            df.drop(df.columns[-1], axis=1, inplace=True)
        return df

    def getTempFileAndSize(self, filename, df=None, file=None, isZip=False):

        newFileName = filename
        tempFile = f'temp/{newFileName}'
        fileSize = len(file)

        if isZip:
            with open(tempFile, 'wb') as open_file:
                open_file.write(file)
            self.unzipFile(tempFile)
            return tempFile, fileSize, newFileName
        else:
            # df.to_csv(tempFile, index=False)
            if not file:
                df.to_csv(tempFile, index=False)
            return tempFile, len(file), newFileName

        return tempFile, fileSize, newFileName

    def unzipFile(self, filePath):

        pathToZip = filePath
        pathToOut = os.path.splitext(filePath)[0]
        if os.path.isdir(pathToOut):
            shutil.rmtree(pathToOut)
        unzip = ['unzip', '-qq', '-o', pathToZip, '-d', pathToOut]
        return subprocess.call(unzip)

    def updateLabelProject(self, token, labelProjectId, labelProjectInfo):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : updateLabelProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        labelProject = self.dbClass.getLabelProjectsById(labelProjectId)

        if labelProject.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : updateLabelProject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        labelProjectInfo = {**labelProjectInfo.__dict__}
        labelProjectInfo = {k: v for k, v in labelProjectInfo.items() if v is not None}

        self.utilClass.sendSlackMessage(
            f"라벨링 프로젝트 정보가 변경되었습니다. {user.email} (ID: {user.id}) , {json.dumps(labelProjectInfo, indent=4, ensure_ascii=False, default=str)}",
            appLog=True, userInfo=user)

        labelProjectInfo["user"] = user.id
        self.dbClass.updateLabelProject(labelProjectId, labelProjectInfo)

        return HTTP_200_OK, labelProjectInfo

    def deleteLabelProject(self, token, labelProjectId):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : deleteLabelProjects \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        labelProject = self.dbClass.getLabelProjectsById(labelProjectId)

        if labelProject.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : deleteLabelProjects \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        if labelProject.market_project_flag:
            raise ex.NotDeletedMarketLabelProject(labelProjectId)

        if labelProject:
            self.dbClass.updateLabelProjectIsdeletedByLabelprojectId(labelProjectId)

        self.utilClass.sendSlackMessage(
            f"라벨링 프로젝트가 삭제되었습니다. {user.email} (ID: {user.id}) , {labelProject.name} (ID: {labelProject.id})",
            appLog=True, userInfo=user)

        return HTTP_204_NO_CONTENT, {}

    def deleteLabelProjects(self, token, labelProjectIdList):

        successList = []
        failList = []

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : deleteLabelProjects \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        for id in labelProjectIdList:
            try:
                labelProject = self.dbClass.getLabelProjectsById(id)

                if labelProject.user != user.id:
                    self.utilClass.sendSlackMessage(
                        f"파일 : manageLabeling\n 함수 : deleteLabelProjects \n허용되지 않은 토큰 값입니다. token = {token})",
                        appError=True, userInfo=user)
                    return NOT_ALLOWED_TOKEN_ERROR

                if labelProject.market_project_flag:
                    raise ex.NotDeletedMarketLabelProject()

                if labelProject:
                    self.dbClass.updateLabelProjectIsdeletedByLabelprojectId(id)
                self.utilClass.sendSlackMessage(
                    f"라벨링 프로젝트가 삭제되었습니다. {user.email} (ID: {user.id}) , {labelProject.name} (ID: {labelProject.id})",
                    appLog=True, userInfo=user)
                successList.append(labelProject.name)

            except APIException:
                message = f'마켓프로젝트로 자동 생상된 라벨프로젝트는 삭제하실 수 없습니다. \n삭제된 라벨프로젝트 : {successList}' if len(
                    successList) else '마켓프로젝트로 자동 생상된 라벨프로젝트는 삭제하실 수 없습니다.'

                message_en = f'You cannot delete the label project automatically created as a market project. \nDeleted label project : {successList}' if len(
                    successList) else 'You cannot delete the label project automatically created as a market project.'
                return HTTP_500_INTERNAL_SERVER_ERROR, {"status_code": 500, "message":message, "message_en": message_en}

            except:
                failList.append(id)
                pass

        return HTTP_200_OK, {'successList':successList, 'failList':failList}

    def getWorkageAitraner(self, token, labelprojectId = None):

        try:
            user = self.dbClass.getUser(token, raw=True)
            userId = user.id
            if not userId:
                raise AssertionError
        except:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : getLabelProject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        result = {}

        if labelprojectId:
            labelproject = self.dbClass.getOneLabelProjectById(labelprojectId)
            aiTrainerWorkage = []
            if labelproject.user == userId:
                trainerUser = self.dbClass.getGroupsByLabelprojectIdAndUserId(userId, labelprojectId)
                if trainerUser:
                    for userTemp in trainerUser:
                        if userTemp.user == userId:
                            continue
                        try:
                            userTemp = self.dbClass.getOneUserById(userTemp.user, True)
                            polygon, box, magic, point_count = self.dbClass.getLabelWorkage(userTemp.id ,labelprojectId)
                            temp = {'aiTrainerId': userTemp.email, 'polygon': polygon, 'box': box, 'magic': magic, 'pointCount': point_count}
                            aiTrainerWorkage.append(temp)
                        except:
                            pass

            result['polygon'], result['box'], result['magic'], result['pointCount'] = self.dbClass.getLabelWorkage(userId, labelprojectId)
            result['aiTrainerWorkage'] = aiTrainerWorkage
        else:
            result['polygon'], result['box'], result['magic'], result['pointCount'] = self.dbClass.getLabelWorkage(userId)

        return HTTP_200_OK, result

    def getLabelProject(self, token, labelProjectId):
        try:
            user = self.dbClass.getUser(token, raw=True)
            userId = user.id
            if not userId:
                raise AssertionError
        except:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : getLabelProject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        labelProjectRaw = self.dbClass.getLabelProjectsById(labelProjectId)

        if labelProjectRaw.isDeleted:
            return ALREADY_DELETED_OBJECT

        dataconnectors = ast.literal_eval(labelProjectRaw.dataconnectorsList) if labelProjectRaw.dataconnectorsList else []
        labelProject = labelProjectRaw.__dict__['__data__']

        is_admin = False
        labelProject['isShared'] = False
        if labelProject['sharedgroup']:
            for temp in ast.literal_eval(labelProject['sharedgroup']):
                member = self.dbClass.getMemberByUserIdAndGroupId(userId, temp)
                if member:
                    if (member.role == 'aiTrainer') or (member.role == 'member' and member.acceptcode == 1):
                        labelProject['isShared'] = True
                    elif (member.role in ['admin', 'subadmin'] and member.acceptcode == 1):
                        is_admin = True

        if labelProjectRaw.user != userId and not labelProject['isShared'] and is_admin is False:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : getLabelProject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        totalcnt = 0
        labelclassList = []
        workAssignee = user.id if labelProject['workapp'] == 'object_detection' else user.email

        completed_label_count_dict = {
            label_count['id']: label_count['count'] for label_count in
            self.dbClass.getCompletedLabelCountBylabelprojectId(labelProjectId, labelProjectRaw.workapp, labelProject['isShared'], workAssignee)
        }

        for x in self.dbClass.getLabelClassesByLabelProjectId(labelProjectId):
            labelclassDict = model_to_dict(x)
            label_count = completed_label_count_dict.get(str(labelclassDict['id']), 0)
            if labelProject['workapp'] == "detection_3d":
                label_count = completed_label_count_dict.get(str(labelclassDict['name']), 0)
            labelclassDict['completedLabelCount'] = label_count
            totalcnt += label_count
            labelclassList.append(labelclassDict)

        labelProject['labelclasses'] = labelclassList
        labelProject['asynctasks'] = [x.__dict__['__data__'] for x in self.dbClass.getAsynctasksByLabelProjectId(labelProjectId)]
        labelProject['aiTrainer'] = user.isAiTrainer
        labelProject["chart"] = self.dbClass.getObjectStatusCountByLabelprojectId(labelProjectId, userId == labelProject['user'] or is_admin, user.email)
        labelProject['dataColumns'] = [x.__dict__['__data__'] for x in self.dbClass.getDatacolumnsByDataconnectorId(
            dataconnectors[0])] if dataconnectors else []

        if labelProject['shareaitrainer'] and user.isAiTrainer:
            return HTTP_200_OK, labelProject

        model_dict_list = []
        for model in self.dbClass.get_model_by_labelproject_id(labelProjectId):
            model_dict = {}
            class_list = "[]"
            model_dict['id'] = model['id']
            if "normal_regression" not in labelProject.get("workapp", ""):
                if model.get('yClass'):
                    class_list = model['yClass'].replace('\n', '').replace('\\', '').replace(' ', '')
            model_dict['class'] = ast.literal_eval(class_list)
            model_dict['stage'] = self.dbClass.getCustomAiStageByLabelprojectId(labelProjectId, class_list)
            model_dict['stage'] = model_dict['stage'] if model_dict.get('stage') else 0
            model_dict_list.append(model_dict)

        labelProject['customAiModels'] = model_dict_list
        labelProject['predictColumnName'] = None

        prepare_files = self.dbClass.getOneSthreeFilesByLabelprojectId(labelProject['id'], workAssignee=user.email, app_status='prepare')
        review_files = self.dbClass.getOneSthreeFilesByLabelprojectId(labelProject['id'], workAssignee=user.email, app_status='review')
        done_files = self.dbClass.getOneSthreeFilesByLabelprojectId(labelProject['id'], workAssignee=user.email, app_status='done')
        prepare_files_own = self.dbClass.getOneSthreeFilesByLabelprojectId(labelProject['id'], app_status='prepare')
        done_files_own = self.dbClass.getOneSthreeFilesByLabelprojectId(labelProject['id'], app_status='done')

        if len(done_files) > 0:
            ds2data = done_files[0]
        elif len(review_files) > 0:
            ds2data = review_files[0]
        elif len(prepare_files) > 0:
            ds2data = prepare_files[0]
        elif len(done_files_own) > 0:
            ds2data = done_files_own[0]
        else:
            ds2data = prepare_files_own[0]


        if not labelProject['predictColumnName'] and ds2data.get('labelData'):
            if type(ds2data['labelData']) == str:
                labelProject['predictColumnName'] = ds2data['labelData']
            else:
                labelProject['predictColumnName'] = list(ds2data['labelData'].keys())[0]

        s3UrlIds = {'prepare': None, 'working': None, 'ready': None, 'review': None, 'done': None, 'reject': None}
        if len(prepare_files) > 0:
            s3UrlIds['prepare'] = prepare_files[0]['id']
        if len(review_files) > 0:
            s3UrlIds['review'] = review_files[0]['id']

        labelProject['s3UrlID'] = s3UrlIds
        custom_ai_project = self.dbClass.get_creating_custom_ai_project_id_by_label_project_id(labelProjectId)
        labelProject['creatingCustomAiProjectId'] = custom_ai_project.id if custom_ai_project is not None else None

        worker_lists = self.dbClass.get_worker(labelProjectId)
        if worker_lists:
            workage_list = []
            for worker_list in worker_lists:
                if worker_list.get('id'):
                    worker_id = int(worker_list['id'])
                    polygonCount, boxCount, magicCount, point_count = self.dbClass.getLabelWorkage(worker_id, labelProjectId)
                    worker_email = self.dbClass.get_user_by_id(worker_id)
                    if worker_email is None:
                        continue
                    else:
                        worker_email = worker_email['email']
                    workage_dict = {
                        'workAssinee': worker_email,
                        'polygonCount': polygonCount,
                        'boxCount': boxCount,
                        'magicCount': magicCount,
                        'pointCount': point_count
                    }
                    workage_list.append(workage_dict)

            labelProject['workage'] = workage_list
        else:
            labelProject['workage'] = None

        return HTTP_200_OK, labelProject

    def get_label_app_info(self, token, labelproject_id, sthreefile_id):
        try:
            user = self.dbClass.getUser(token)
            if not user['id']:
                raise AssertionError
        except:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : getLabelProject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        labelclass_list = []
        totalcnt = 0
        work_assignee = user['id']
        labelproject_raw = self.dbClass.getLabelProjectsById(labelproject_id)

        if not labelproject_raw:
            return NOT_ALLOWED_TOKEN_ERROR

        labelproject_dict = labelproject_raw.__dict__['__data__']
        completed_label_count_dict = {
            label_count['id']: label_count['count'] for label_count in
            self.dbClass.getCompletedLabelCountBylabelprojectId(labelproject_id, labelproject_dict['workapp'],
                                                                labelproject_dict['user'] != user['id'], work_assignee)
        }

        for x in self.dbClass.getLabelClassesByLabelProjectId(labelproject_id):
            labelclass_dict = model_to_dict(x)
            label_count = completed_label_count_dict.get(str(labelclass_dict['id']), 0)
            labelclass_dict['completedLabelCount'] = label_count
            totalcnt += label_count
            labelclass_list.append(labelclass_dict)

        role = None
        for temp in self.dbClass.getSharedLabelprojectIdByUserId(user['id']):
            if temp.labelprojectsid and int(labelproject_id) in ast.literal_eval(temp.labelprojectsid):
                group_user = self.dbClass.getMemberByUserIdAndGroupId(user['id'], temp.id)
                if group_user and role != 'admin':
                    role = role if role == 'subadmin' and group_user.role != 'admin' else group_user.role

        sthreefile_data = self.dbClass.getSthreeFileByIdWithWorkapp(sthreefile_id, user['id'], user['email'],
                                                                    labelproject_dict['workapp'], role=role)
        if not sthreefile_data:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : getSthreeFile \n다른작업자가 접근함. sthreeFile = {sthreefile_id})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        if sthreefile_data['labelproject'] != labelproject_id:
            raise ex.NotAllowedLabelProjectIdEx(labelproject_id)

        sthreefile_status = sthreefile_data['status']
        sthreefile_work_assignee = sthreefile_data['workAssignee']
        if sthreefile_data['workAssignee'] is None:
            if sthreefile_status == 'prepare':
                sthreefile_status = 'working'
                sthreefile_work_assignee = user['email']
                sthreefile_dict = {
                    'status': sthreefile_status,
                    'workAssignee': sthreefile_work_assignee
                }
                self.dbClass.updateSthreeFileById(sthreefile_id, sthreefile_dict)
            elif sthreefile_status == 'review':
                sthreefile_dict = {
                    'reviewer': user['email']
                }
                self.dbClass.updateSthreeFileById(sthreefile_id, sthreefile_dict)
                sthreefile_status = 'working'

        if sthreefile_data.get('inspectionResult', None) is None:
            sthreefile_data['inspectionResult'] = None

        if labelproject_dict['workapp'] != 'object_detection':
            sthreefile_result = {
                'id': sthreefile_data.get('id', None),
                'fileType': sthreefile_data.get('fileType', None),
                'inspectionResult': sthreefile_data.get('inspectionResult', None),
                'labelprojectID': sthreefile_data.get('labelproject', None),
                'labelprojectName': labelproject_dict['name'],
                'originalFileName': sthreefile_data.get('originalFileName', None),
                'reviewer': sthreefile_data.get('reviewer', None),
                's3key': sthreefile_data.get('s3key', None),
                'status': sthreefile_status,
                'workAssignee': sthreefile_work_assignee,
                'labelData': sthreefile_data.get('labelData', None),
                'rawData': sthreefile_data.get('rawData', None),
                'workapp': labelproject_dict['workapp']
            }
            result = {'sthreefile': sthreefile_result,
                      'labelclass': labelclass_list}

            return HTTP_200_OK, result


        if labelproject_dict['shareaitrainer'] and user['isAiTrainer']:
            return HTTP_200_OK, labelproject_dict

        chart_data = self.dbClass.getObjectStatusCountByLabelprojectId(labelproject_id, user['id'] == labelproject_dict[
            'user'] or role == 'subadmin', user['email'])

        labelproject_result = {
            'id': labelproject_dict['id'],
            'name': labelproject_dict['name'],
            'description': labelproject_dict['description'],
            'isDeleted': labelproject_dict['isDeleted'],
            'workapp': labelproject_dict['workapp'],
            'labelclasses': labelclass_list,
            'aiTrainer': user['isAiTrainer'],
            'chart': chart_data,
        }

        polygon_data, box_data, magic_data, point_count = self.dbClass.getLabelWorkage(user['id'], labelproject_id)

        workage_result = {
            'polygon': polygon_data,
            'box': box_data,
            'magic': magic_data,
            'pointCount': point_count
        }

        sthreefile_result = {
            'id': sthreefile_data['id'],
            's3key': sthreefile_data['s3key'],
            'originalFileName': sthreefile_data['originalFileName'],
            'fileName': sthreefile_data['fileName'],
            'fileSize': sthreefile_data['fileSize'],
            'fileType': sthreefile_data['fileType'],
            'height': sthreefile_data['height'],
            'width': sthreefile_data['width'],
            'status': sthreefile_status,
            'isDeleted': sthreefile_data['isDeleted'],
            'labels': sthreefile_data['labels'],
            'reviewer': sthreefile_data['reviewer'],
            'workAssignee': sthreefile_work_assignee,
            'inspectionResult': sthreefile_data.get('inspectionResult', None)
        }

        result = {
            'user': user['id'],
            'email': user['email'],
            'labelproject': labelproject_result,
            'workage': workage_result,
            'sthreefile': sthreefile_result
                  }

        return HTTP_200_OK, result

    def getAutoLabelingProgress(self, labelprojectId, token):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject.py \n함수 : getModelByIdAndAppToken \n잘못된 앱 토큰으로 에러 | 입력한 앱 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        labelProjectInfo = self.dbClass.getOneLabelProjectById(labelprojectId)

        role = None
        for temp in self.dbClass.getSharedLabelprojectIdByUserId(user.id):
            if temp.labelprojectsid and int(labelprojectId) in ast.literal_eval(temp.labelprojectsid):
                group_user = self.dbClass.getMemberByUserIdAndGroupId(user.id, temp.id)
                if group_user and role != 'admin':
                    role = role if role == 'subadmin' and group_user.role != 'admin' else group_user.role

        if labelProjectInfo.user != user.id and role != 'subadmin':
            raise ex.NotAllowedTokenEx(user.email)

        totalCount, learningFileCount, progress, s3Url = self.dbClass.getAutoLabellingProgress(labelProjectInfo.id)
        result = {'total': totalCount, 'ready': learningFileCount, 'progress': progress, 'image_s3_url': s3Url}

        return HTTP_200_OK, result

    def getLabelclass(self, token, labelclassId):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : getLabelclass \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        labelclass = self.dbClass.getOneLabelclassById(labelclassId)
        label_project_id = labelclass.labelproject
        label_project_raw = self.dbClass.getOneLabelProjectById(label_project_id)

        if label_project_raw.user != user.id:
            shared_label_projects = []
            for temp in self.dbClass.getSharedLabelprojectIdByUserId(user.id):
                if temp.labelprojectsid:
                    shared_label_projects = list(set(shared_label_projects + ast.literal_eval(temp.labelprojectsid)))

            if int(label_project_id) not in shared_label_projects:
                raise ex.NotAllowedTokenEx(user.email)

        return HTTP_200_OK, labelclass.__dict__['__data__']

    def getLabelclasses(self, token, labelproject_id, page, count):

        user = self.dbClass.getUser(token, raw=True)
        has_shared = False
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : getLabelclass \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        label_project_raw = self.dbClass.getOneLabelProjectById(labelproject_id)

        if label_project_raw.user != user.id:
            shared_label_projects = []
            for temp in self.dbClass.getSharedLabelprojectIdByUserId(user.id):
                group_user = self.dbClass.getMemberByUserIdAndGroupId(user.id, temp.id)
                if group_user and group_user.role not in ['subadmin', 'admin']:
                    has_shared = True

                if temp.labelprojectsid:
                    shared_label_projects = list(set(shared_label_projects + ast.literal_eval(temp.labelprojectsid)))

            if int(labelproject_id) not in shared_label_projects:
                raise ex.NotAllowedTokenEx(user.email)

        work_assignee = user.id if label_project_raw.workapp == 'object_detection' else user.email
        labelclass_result = []
        total_count = 0
        for labelclass_raw in self.dbClass.getLabelClassesByLabelProjectId(labelproject_id, page, count):
            labelclass_dict = model_to_dict(labelclass_raw)
            label_count_temp = self.dbClass.getDoneLabelCountBylabelclassId(labelclass_dict['id'], label_project_raw.workapp,
                                                                            has_shared, work_assignee, labelproject_id=labelproject_id, labelclass_name = labelclass_dict['name'])
            labelclass_dict['completedLabelCount'] = label_count_temp
            total_count += label_count_temp
            labelclass_result.append(labelclass_dict)

        labelclass_count = self.dbClass.getLabelClassesCountByLabelProjectId(labelproject_id)

        result = {"labelclass": labelclass_result, "total_labelclass_count": labelclass_count, "total_completed_label_count": total_count}

        return HTTP_200_OK, result

    def createLabelclass(self, token, labelclassInfoRaw):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : createLabelclass \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        role = None
        for temp in self.dbClass.getSharedLabelprojectIdByUserId(user.id):
            if temp.labelprojectsid and int(labelclassInfoRaw.labelproject) in ast.literal_eval(temp.labelprojectsid):
                group_user = self.dbClass.getMemberByUserIdAndGroupId(user.id, temp.id)
                if group_user and role != 'admin':
                    role = role if role == 'subadmin' and group_user.role != 'admin' else group_user.role

        if self.dbClass.getOneLabelProjectById(labelclassInfoRaw.labelproject).user != user.id and role != 'subadmin':
            raise ex.NotAllowedTokenEx(user.email)

        if self.dbClass.getLabelclassCountByClassNameAndProjectId(labelclassInfoRaw.name, labelclassInfoRaw.labelproject):
            raise ex.ExistLabelclassNameEx(user.email)

        labelclassInfo = {**labelclassInfoRaw.__dict__}
        labelclassInfo["user"] = user.id

        return HTTP_201_CREATED, self.dbClass.createLabelclass(labelclassInfo).__dict__['__data__']

    def updateLabelclasses(self, token, labelclassInfoList, labelproject_id):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : updateLabelclass \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise ex.NotFoundUserEx

        role = None
        for temp in self.dbClass.getSharedLabelprojectIdByUserId(user.id):
            if temp.labelprojectsid and int(labelproject_id) in ast.literal_eval(temp.labelprojectsid):
                group_user = self.dbClass.getMemberByUserIdAndGroupId(user.id, temp.id)
                if group_user and role != 'admin':
                    role = role if role == 'subadmin' and group_user.role != 'admin' else group_user.role

        if self.dbClass.getOneLabelProjectById(labelproject_id).user != user.id and role != 'subadmin':
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : updateLabelclass \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            raise ex.NotAllowedTokenEx

        result = []
        for labelclass_info_raw in labelclassInfoList:
            labelclass_info = {**labelclass_info_raw.__dict__}
            if not self.dbClass.verify_labelclass_by_id_and_user_id(labelclass_info['labelclassId'], user.id, role):
                continue
            labelclass_id = labelclass_info['labelclassId']
            labelclass_info = {k: v for k, v in labelclass_info.items() if v is not None}
            del labelclass_info['labelclassId']

            self.dbClass.updateLabelclassById(labelclass_id, labelclass_info)
            result.append(labelclass_info)

        return HTTP_200_OK, result

    def updateLabelclass(self, token, labelclassId, labelclassObject):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : updateLabelclass \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise ex.NotFoundUserEx

        labelclass = self.dbClass.getOneLabelclassById(labelclassId)

        if self.dbClass.getOneLabelProjectById(labelclass.labelproject).user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : updateLabelclass \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            raise ex.NotAllowedTokenEx

        if labelclassObject.name:
            labelclass.name = labelclassObject.name

        if labelclassObject.color:
            labelclass.color = labelclassObject.color

        labelclass.save()

        return HTTP_200_OK, labelclass.__dict__['__data__']

    def deleteLabelclasses(self, token, labelclass_ids, labelproject_id):

        successList = []
        failList = []

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : deleteLabelclass \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        role = None
        for temp in self.dbClass.getSharedLabelprojectIdByUserId(user.id):
            if temp.labelprojectsid and int(labelproject_id) in ast.literal_eval(temp.labelprojectsid):
                group_user = self.dbClass.getMemberByUserIdAndGroupId(user.id, temp.id)
                if group_user and role != 'admin':
                    role = role if role == 'subadmin' and group_user.role != 'admin' else group_user.role

        for labelclass_id in labelclass_ids:
            try:
                if not self.dbClass.verify_labelclass_by_id_and_user_id(labelclass_id, user.id, role):
                    raise ex.NotAllowedTokenEx(user.email)

                # todo: 조건에 맞으면 바로 삭제 업데이트 하는 구문으로 변경
                labelList = [x['id'] for x in self.dbClass.getlabelByLabelclassId(labelclass_id)]
                if labelList:
                    self.dbClass.updateLabelIsdeletedByLabelId(labelList)

                self.dbClass.updatelabelclassesIsdeletedById(labelclass_id)
                self.utilClass.sendSlackMessage(
                    f"라벨클래스를 삭제하였습니다. {user.email} (ID: {user.id}) ,라벨 클래스 (ID: {labelclass_id})",
                    appLog=True, userInfo=user)
                successList.append(labelclass_id)
            except:
                self.utilClass.sendSlackMessage(
                    f"라벨클래스 삭제에 실패하였습니다. {user.email} (ID: {user.id}) ,라벨 클래스 (ID: {labelclass_id})",
                    appLog=True, userInfo=user)
                failList.append(labelclass_id)
                pass

        return HTTP_200_OK, {'successList': successList, 'failList': failList}

    def deleteLabelclass(self, token, labelclass_id):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : deleteLabelclass \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if not self.dbClass.verify_labelclass_by_id_and_user_id(labelclass_id, user.id):
            raise ex.NotAllowedTokenEx(user.email)

        # todo: 조건에 맞으면 바로 삭제 업데이트 하는 구문으로 변경
        labelList = [x['id'] for x in self.dbClass.getlabelByLabelclassId(labelclass_id)]
        if labelList:
            self.dbClass.updateLabelIsdeletedByLabelId(labelList)

        self.dbClass.updatelabelclassesIsdeletedById(labelclass_id)
        self.utilClass.sendSlackMessage(
            f"라벨클래스를 삭제하였습니다. {user.email} (ID: {user.id}) ,라벨 클래스 (ID: {labelclass_id})",
            appLog=True, userInfo=user)

        return HTTP_204_NO_CONTENT, {}

    def update_best_custom_ai(self, token, model_info):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : update_best_custom_ai \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise ex.NotFoundUserEx(token)

        labelproject_id = model_info.labelproject_id
        project_id = model_info.project_id
        sample_info = model_info.sample_info
        labelproject_raw = self.dbClass.getOneLabelProjectById(labelproject_id)

        if labelproject_raw.user != user.id:
            raise ex.NotAllowedTokenEx(user.email)

        custom_ai_samples = self.dbClass.get_custom_ai_sample_result_by_labelproject_id_and_project_id(labelproject_id, project_id)
        model_count_list = self.get_and_update_selected_sample(custom_ai_samples, sample_info)
        best_model_id = self.get_and_update_best_model(user, custom_ai_samples, model_count_list)

        project_raw = self.dbClass.getOneProjectById(project_id, raw=True)
        project_raw.hasBestModel = True
        project_raw.save()

        result = {'best_model_id': best_model_id}

        class_list = project_raw.yClass.replace('\n', '').replace('\\', '').replace(' ', '')

        result['class'] = ast.literal_eval(class_list)
        result['stage'] = self.dbClass.getCustomAiStageByLabelprojectId(labelproject_id, class_list)
        result['stage'] = result['stage'].stage if result['stage'] else 0

        return HTTP_200_OK, result

    def get_and_update_selected_sample(self, custom_ai_samples, sample_info):

        step_keys = list(sample_info.keys())
        len(custom_ai_samples)

        for step_idx, step_key in enumerate(list(step_keys)):
            tmp_count_list = []
            model_keys = list(sample_info[step_key].keys())
            for model_idx, model_key in enumerate(model_keys):
                db_idx = step_idx * len(model_keys) + model_idx
                if sample_info[step_key][model_key]:
                    tmp_count_list.append(1)
                    custom_ai_samples[db_idx].hasSelected = 1
                    custom_ai_samples[db_idx].save()
                else:
                    tmp_count_list.append(0)
            if step_idx == 0:
                model_count_list = copy.deepcopy(tmp_count_list)
            else:
                model_count_list = [model_count_list + tmp_count_list for model_count_list, tmp_count_list in
                                    zip(model_count_list, tmp_count_list)]

        return model_count_list

    def get_and_update_best_model(self, user, custom_ai_samples, model_count_list):

        max_idx_list = self.find_index(model_count_list)
        model_performance_list = []
        performances = ['all', 'ap', 'rmse', 'accuracy']

        for idx, max_idx in enumerate(max_idx_list):
            best_model_id = custom_ai_samples[max_idx].modelId
            if idx == 0:
                best_model_raw = self.dbClass.get_model_performace_by_id(best_model_id, performances[0])
                if best_model_raw.ap is not None:
                    performance = performances[1]
                    model_performance_list.append(best_model_raw.ap)
                elif best_model_raw.rmse is not None:
                    performance = performances[2]
                    model_performance_list.append(best_model_raw.rmse)
                elif best_model_raw.accuracy is not None:
                    performance = performances[3]
                    model_performance_list.append(best_model_raw.accuracy)
                else:
                    self.utilClass.sendSlackMessage(
                        f"파일 : manageLabeling.py \n함수 : get_and_update_best_model \n모델 성능컬럼 없음으로 에러 | 모델 ID : {best_model_id}",
                        appError=True, userInfo=user)
                    raise ex.NotExistModelPerformanceEx(user.id)
            else:
                best_model_raw = self.dbClass.get_model_performace_by_id(best_model_id, performance)
                if performance == performances[1]:
                    model_performance_list.append(best_model_raw.ap)
                elif performance == performances[2]:
                    model_performance_list.append(best_model_raw.rmse)
                elif performance == performances[3]:
                    model_performance_list.append(best_model_raw.accuracy)

        if performance == 'rmse':
            best_performance_index = model_performance_list.index(min(model_performance_list))
        else:
            best_performance_index = model_performance_list.index(max(model_performance_list))

        best_sample_idx = max_idx_list[best_performance_index]
        final_best_model_id = custom_ai_samples[best_sample_idx].modelId
        final_best_model_raw = self.dbClass.get_model_is_best_by_id(final_best_model_id)

        final_best_model_raw.isFavorite = True
        final_best_model_raw.save()

        return final_best_model_id

    def find_index(self, target_list):

        res = []
        lis = target_list
        target = max(lis)
        while True:
            try:
                res.append(lis.index(target) + (res[-1] + 1 if len(res) != 0 else 0))
                lis = target_list[res[-1] + 1:]
            except:
                break
        return res

    def create_custom_ai_project(self, token, background_tasks, labelproject_id, custom_ai_type, use_class_info,
                                 valueForPredictColumnId, trainingColumnInfo):

        user = self.dbClass.getUser(token)
        if not user:
            raise ex.NotFoundUserEx(token)

        labelproject_raw = self.dbClass.getLabelProjectsById(labelproject_id)

        custom_ai_project_id = self.dbClass.get_creating_custom_ai_project_id_by_label_project_id(labelproject_id)
        if custom_ai_project_id:
            self.dbClass.updateProject(custom_ai_project_id, {'status': 9})

        role = None
        for temp in self.dbClass.getSharedLabelprojectIdByUserId(user['id']):
            if temp.labelprojectsid and int(labelproject_id) in ast.literal_eval(temp.labelprojectsid):
                group_user = self.dbClass.getMemberByUserIdAndGroupId(user['id'], temp.id)
                if group_user and role != 'admin':
                    role = role if role == 'subadmin' and group_user.role != 'admin' else group_user.role

        if labelproject_raw.user != user['id'] and role != 'subadmin':
            raise ex.NotAllowedTokenEx(user['email'])

        labelclass_count = self.dbClass.getNotDeletedLabelClassesCountByLabelProjectId(labelproject_id)
        sthreefile_count = self.dbClass.getDoneSthreeFilesCountByLabelProjectId(labelproject_id)

        yClass = []

        if (labelproject_raw.workapp not in ['object_detection', 'normal_regression'] and labelclass_count <= 0) or sthreefile_count < 10:
            raise ex.MinDataEx(user['email'], labelproject_id)

        if 'regression' not in labelproject_raw.workapp:
            for labelclass in self.dbClass.getLabelClassesByLabelProjectId(labelproject_id):
                if use_class_info.get(str(labelclass.name), False):
                    if self.dbClass.getDoneLabelCountBylabelclassId(labelclass.id, labelproject_raw.workapp, has_shared=False, labelproject_id=labelproject_id, labelclass_name=labelclass.name) < 10:
                        raise ex.MinDataEx(email=user['email'], labelproject_id=labelproject_id)
                    else:
                        yClass.append(labelclass.name)

        background_tasks.add_task(self._create_custom_ai_project, labelproject_raw, custom_ai_type,
                                 valueForPredictColumnId, trainingColumnInfo, yClass, user, labelproject_raw.workapp)

        return HTTP_201_CREATED, {}

    def get_sample(self, token, labelproject_id, project_id):

        result = {}
        step_txt = 'step1'
        model_num = 0
        model_dic = {}

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling.py \n함수 : get_sample \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise ex.NotFoundUserEx(token)

        project_raw = self.dbClass.getOneProjectById(project_id, True)
        label_project_raw = self.dbClass.getLabelProjectsById(labelproject_id)

        if project_raw.user != user.id or label_project_raw.user != user.id:
            raise ex.NotAllowedTokenEx(user.email)

        custom_ai_sample_results = self.dbClass.get_custom_ai_sample_result_by_labelproject_id_and_project_id(labelproject_id, project_id)

        for sample in custom_ai_sample_results:
            new_step_txt = f'step{sample.step}'
            if step_txt == new_step_txt:
                model_num += 1
            else:
                model_num = 1
                result[step_txt] = model_dic.copy()
                step_txt = new_step_txt
                model_dic.clear()
            model_txt = f'model{model_num}'
            tmp_sample = json.loads(sample.sampleResult.replace("'", '"'))
            model_dic[model_txt] = tmp_sample
        result[step_txt] = model_dic

        return HTTP_200_OK, result

    def request_inspection(self, token, request_info):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            raise ex.NotFoundUserEx(token)

        labelproject_raw = self.dbClass.getOneLabelProjectById(request_info.labelprojectId)

        if labelproject_raw.user != user.id:
            raise ex.NotAllowedTokenEx(user.email)

        request_info = dict(request_info)
        request_info["userId"] = user.id
        request_info["status"] = 0

        result = model_to_dict(self.dbClass.create_inspection_requests(request_info))
        self.utilClass.sendSlackMessage(
            f"라벨링 검수 의뢰가 도착했습니다. {user.email} (ID: {user.id}), (ID: {labelproject_raw.id}), Request ID: {result['id']}",
            contact=True, userInfo=user)

        return HTTP_201_CREATED, result

    def get_industry_ais(self, token):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            raise ex.NotFoundUserEx(token)

        industry_ais = [model_to_dict(industry_ai) for industry_ai in self.dbClass.get_industry_ais()]

        return HTTP_200_OK, industry_ais

    def label_types_prices(self, token):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            raise ex.NotFoundUserEx(token)

        result = {}
        for label_type in self.dbClass.get_label_types():
            result[label_type.name] = label_type.price

        return HTTP_200_OK, result

    def zip_folder(self, folder_name, data_path):

        commands = f'cd {data_path}; zip -r {folder_name}.zip {folder_name}/*'
        process = subprocess.Popen('/bin/bash', stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        out, err = process.communicate(commands.encode('utf-8'))

    def zip_file(self, zip_path, data_path, is_get_image=False):

        commands = f'cd {data_path}; zip {zip_path} coco.json'
        if is_get_image:
            commands += ' images/*'
        process = subprocess.Popen('/bin/bash', stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        out, err = process.communicate(commands.encode('utf-8'))

    def _create_custom_ai_project(self, labelproject_raw, custom_ai_type,
                                 valueForPredictColumnId, trainingColumnInfo, yClass, user, workapp):

        hasImageData = False
        hasTextData = False
        if workapp in ['object_detection', 'image']:
            hasImageData = True
        else:
            hasTextData = True

        labelproject_dict = labelproject_raw.__dict__['__data__']

        project_name = labelproject_dict['name']


        dataconnector_id = json.loads(labelproject_dict['dataconnectorsList'])[0]
        dataconnector_raw = self.dbClass.getOneDataconnectorById(dataconnector_id).__dict__['__data__']
        dataconnector_raw.pop('id')
        dataconnector_raw['isVisible'] = False
        new_dataconnector = self.dbClass.createDataconnector(dataconnector_raw)
        new_trainingColumnInfo = {}
        datacolumns = []

        for datacolumnRaw in self.dbClass.getDatacolumnsByDataconnectorId(dataconnector_id):
            datacolumn = datacolumnRaw.__dict__['__data__']
            if datacolumn.get('created_at'):
                del datacolumn['created_at']
            if datacolumn.get('updated_at'):
                del datacolumn['updated_at']
            datacolumns.append(datacolumn)
            datacolumn['dataconnector'] = new_dataconnector.id
            datacolumn_id = datacolumn['id']
            datacolumn.pop('id')
            new_datacolumn = self.dbClass.createDatacolumn(datacolumn)
            if datacolumn_id == valueForPredictColumnId:
                valueForPredictColumnId = new_datacolumn.id
            new_trainingColumnInfo[str(new_datacolumn.id)] = trainingColumnInfo[str(datacolumn_id)]

        try:

            ds2data = self.dbClass.getDonesthreefilesByLabelprojectId(labelproject_raw.id)
            s3Url = self.getS3FileFromData(labelproject_raw, ds2data)
            new_dataconnector.filePath = s3Url
            new_dataconnector.save()
        except:
            print(traceback.format_exc())
            pass

        project = self.dbClass.createProject({
            "projectName": project_name,
            "status": 1,
            "statusText": "1: 인공지능 개발이 시작되었습니다.",
            "trainingMethod": labelproject_dict['workapp'],
            "valueForPredict": 'label',
            "user": user['id'],
            "hasImageData": hasImageData,
            "fileStructure": json.dumps(datacolumns),
            "hasTextData": hasTextData,
            "labelproject": labelproject_dict['id'],
            "yClass": json.dumps(yClass, indent=1, ensure_ascii=False) if yClass else None,
            "option": 'labeling',
            "valueForPredictColumnId":valueForPredictColumnId,
            "trainingColumnInfo": new_trainingColumnInfo,
            'labelType': custom_ai_type,
            "dataconnectorsList": [new_dataconnector.id],
            "isCustomAi": True
        })

        for temp_data in ds2data:
            del temp_data['labelproject']
            temp_data['project'] = project.id
        self.dbClass.create_project_ds2data(ds2data)

        project = project.__dict__['__data__']
        self.utilClass.sendSlackMessage(
            f"Custom AI 프로젝트가 생성되었습니다. {user['email']} (ID: {user['id']}) , 라벨링 프로젝트 : {labelproject_raw.name} (ID: {labelproject_raw.id}) , AI 프로젝트 ID: {project['id']}",
            appLog=True, userInfo=user)

        data = {
            'taskName': f'{project_name}',
            'taskNameEn': f'{project_name}',
            'taskType': 'customAi',
            'status': 0,
            'labelproject': labelproject_dict['id'],
            'project': project['id'],
            'user': user['id'],
            'outputFilePath': '',
            'isChecked': 0
        }
        async_task = self.dbClass.createAsyncTask(data)

        if rd:
            rd.publish("broadcast", json.dumps(model_to_dict(async_task), default=json_util.default, ensure_ascii=False))


    def getS3FileFromData(self, labelproject_raw, ds2data):
        s3Url = None
        timestamp = str(round(time.time() * 1000))

        if labelproject_raw.workapp in ['normal_classification', 'normal_regression', 'text']:
            csv_data = []
            for data in ds2data:
                data['rawData'].update(data['labelData'])
                csv_data.append(data['rawData'])
            df = pd.DataFrame.from_records(csv_data)
            if not os.path.exists(f'temp/{labelproject_raw.id}_{timestamp}'):
                os.mkdir(f'temp/{labelproject_raw.id}_{timestamp}')

            df.to_csv(f'temp/{labelproject_raw.id}_{timestamp}/{labelproject_raw.id}_{timestamp}.csv', index=False)
            self.s3.upload_file(f'temp/{labelproject_raw.id}_{timestamp}/{labelproject_raw.id}_{timestamp}.csv',
                                self.utilClass.bucket_name,
                                f'user/{labelproject_raw.user}/{labelproject_raw.id}_{timestamp}.csv')
            s3Url = urllib.parse.quote(
                f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{labelproject_raw.user}/{labelproject_raw.id}_{timestamp}.csv').replace(
                'https%3A//', 'https://')

            if self.utilClass.configOption == 'enterprise':
                s3Url = f"{self.utilClass.save_path}/user/{labelproject_raw.user}/{labelproject_raw.id}_{timestamp}.csv"

            shutil.rmtree(f'{os.getcwd()}/temp/{labelproject_raw.id}_{timestamp}')

        if labelproject_raw.workapp in ['image']:
            if not os.path.isdir(f'{self.utilClass.save_path}/{labelproject_raw.id}_{timestamp}'):
                os.mkdir(f'{self.utilClass.save_path}/{labelproject_raw.id}_{timestamp}')
            for data in ds2data:

                s3key = data['s3key'] if self.utilClass.configOption == "enterprise" else \
                    urllib.parse.unquote(data['s3key'].split('amazonaws.com/')[1])

                class_name = data['labelData']
                if not os.path.isdir(f'{self.utilClass.save_path}/{labelproject_raw.id}_{timestamp}/{class_name}'):
                    os.mkdir(f'{self.utilClass.save_path}/{labelproject_raw.id}_{timestamp}/{class_name}')

                self.s3.download_file(self.utilClass.bucket_name, s3key,
                                      f'{self.utilClass.save_path}/{labelproject_raw.id}_{timestamp}/{class_name}/{data["fileName"]}')

            self.zip_folder(f'{labelproject_raw.id}_{timestamp}', 'data')

            s3Folder = f"user/{labelproject_raw.user}/{labelproject_raw.id}/{labelproject_raw.id}_{timestamp}.zip"

            self.s3.upload_file(f'{self.utilClass.save_path}/{labelproject_raw.id}_{timestamp}.zip', self.utilClass.bucket_name,
                                f'{s3Folder}')

            s3Url = urllib.parse.quote(
                f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3Folder}').replace(
                'https%3A//', 'https://')

            if self.utilClass.configOption == 'enterprise':
                s3Url = f"{self.utilClass.save_path}/{s3Folder}"

            shutil.rmtree(f'{self.utilClass.save_path}/{labelproject_raw.id}_{timestamp}')

        return s3Url


    def get_random_hex_color(self):
        random_number = random.randint(0, 16777215)
        hex_number = format(random_number, 'x')
        hex_number = '#' + hex_number
        return hex_number
