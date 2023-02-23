import json
import logging
import os
import shutil
import subprocess
import time
import traceback
import xml.etree.ElementTree as ET
import numpy as np
import ast
import zipfile
import random
from src.errors import exceptions as ex
from xml.etree.ElementTree import Element, SubElement, ElementTree

from sklearn.model_selection import train_test_split
from tqdm import tqdm
import urllib.request

import pandas as pd
from playhouse.shortcuts import model_to_dict

from PIL import ExifTags
from PIL.Image import Image

from src.util import Util
from models import MongoDb
from random import shuffle
from models.helper import Helper
from starlette.status import HTTP_200_OK
from src.errorResponseList import ErrorResponseList, MISSING_FILE_ERROR, READ_JSON_FILE_ERROR, WRONG_COCODATA_ERROR, \
    NOT_ALLOWED_TOKEN_ERROR, WRONG_VOCDATA_ERROR
import urllib.parse

errorResponseList = ErrorResponseList()
mongoDb = MongoDb()

class CheckDataset():
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.s3 = self.utilClass.getBotoClient('s3')

    def checkCoCoFile(self, filePath=None, file_data: bytes = None, json_data=None):
        data = None
        if filePath == None and file_data == None and json_data:  # 파일 경로나 바이너리 데이터를 모두 못받아왔을 때
            return MISSING_FILE_ERROR

        if filePath != None:  # 파일 경로를 받아왔을 때   (주로 csv.Parse)
            with open(filePath) as json_file:
                try:
                    data = json.load(json_file)
                except:
                    try:
                        shutil.rmtree(os.getcwd() + "/temp/" + ".".join(filePath.split(".")[:-1]))
                    except:
                        try:
                            shutil.rmtree(os.getcwd() + ".".join(filePath.split(".")[:-1]))
                        except:
                            pass
                        pass
                    print(traceback.format_exc())
                    return READ_JSON_FILE_ERROR

        elif file_data != None:  # 문자열 데이터를 받았을 때 (주로 main.py)
            try:
                data = json.loads(str(file_data)[2:-1])

            except:
                return READ_JSON_FILE_ERROR

        elif json_data != None:
            data = json_data
        if not data:
            return 400, False
        categorie_names = []
        file_name = []
        segmentations = []
        try:
            for i in range(0, len(data["images"])):
                file_name.append(data["images"][i]["file_name"])
            for i in range(0, len(data["categories"])):
                categorie_names.append(data["categories"][i]["name"])
            for i in range(0, len(data["annotations"])):
                if data["annotations"][i].get("segmentation"):
                    segmentations.append(data["annotations"][i]["segmentation"])
                elif data["annotations"][i].get("bbox"):
                    segmentations.append(data["annotations"][i]["bbox"])
                else:
                    raise Exception("Error")
        except:
            return READ_JSON_FILE_ERROR

        if len(categorie_names) == 0 or len(file_name) == 0 or len(segmentations) == 0:
            return WRONG_COCODATA_ERROR
        return HTTP_200_OK, {
            "statusCode": 200
        }

    def checkVocFile(self, filePath=None, file_data: bytes = None):
        if filePath == None and file_data == None:
            return MISSING_FILE_ERROR
        if filePath != None:
            try:
                tree = ET.parse('{}'.format(filePath))
                root = tree.getroot()

            except:
                return WRONG_VOCDATA_ERROR
        elif file_data != None:
            try:
                xmlfile = str(file_data)[2:-1]

                if "<filename>" not in xmlfile or "<name>" not in xmlfile:
                    return WRONG_VOCDATA_ERROR
                if "<width>" not in xmlfile or "<height>" not in xmlfile:
                    return WRONG_VOCDATA_ERROR
                if "<xmin>" not in xmlfile or "<xmax>" not in xmlfile or "<ymin>" not in xmlfile or "<ymax>" not in xmlfile:
                    return WRONG_VOCDATA_ERROR

            except:
                return WRONG_VOCDATA_ERROR
        return HTTP_200_OK, {
            "statusCode": 201
        }

    def asyncExportCoCo(self, token, background_tasks, labelProjectId, is_get_image):
        userId = self.dbClass.getId(token, raw=True)

        # if self.dbClass.check_export_coco(userId, 'exportCoco'):
        #     raise ex.TooManyRequestsExportCocoEx(token)

        if not userId:
            self.utilClass.sendSlackMessage(
                f"파일 : checkDataset\n 함수 : exportCoCo \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True)
            return NOT_ALLOWED_TOKEN_ERROR

        user = self.dbClass.getUser(token)
        labelProjectRaw = self.dbClass.getLabelProjectsById(labelProjectId)

        role = None
        for temp in self.dbClass.getSharedLabelprojectIdByUserId(user['id']):
            if temp.labelprojectsid and int(labelProjectId) in ast.literal_eval(temp.labelprojectsid):
                group_user = self.dbClass.getMemberByUserIdAndGroupId(user['id'], temp.id)
                if group_user and role != 'admin':
                    role = role if role == 'subadmin' and group_user.role != 'admin' else group_user.role

        if labelProjectRaw.user != userId and role != 'subadmin':
            self.utilClass.sendSlackMessage(
                f"파일 : checkDataset\n 함수 : exportCoCo \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        data = {
            'taskName': f'{labelProjectRaw.name}',
            'taskNameEn': f'{labelProjectRaw.name}',
            'taskType': 'exportCoco',
            'status': 0,
            'labelproject': labelProjectRaw.id,
            'user': labelProjectRaw.user,
            'outputFilePath': '',
            'isChecked': 0
        }
        asynctask = self.dbClass.createAsyncTask(data)

        background_tasks.add_task(self.exportCoCoData, labelProjectRaw, isAsync=True, is_get_image=is_get_image, is_train_data=False, asynctask=asynctask)
        return HTTP_200_OK, asynctask.__dict__['__data__']

    def async_export_data(self, token, background_tasks, labelProjectId):
        userId = self.dbClass.getId(token, raw=True)

        if not userId:
            self.utilClass.sendSlackMessage(
                f"파일 : checkDataset\n 함수 : exportCoCo \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True)
            return NOT_ALLOWED_TOKEN_ERROR

        user = self.dbClass.getUser(token)
        labelproject_raw = self.dbClass.getLabelProjectsById(labelProjectId)

        if labelproject_raw.user != userId:
            self.utilClass.sendSlackMessage(
                f"파일 : checkDataset\n 함수 : exportCoCo \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR
        data = {
            'taskName': f'{labelproject_raw.name}',
            'taskNameEn': f'{labelproject_raw.name}',
            'taskType': 'exportData',
            'status': 0,
            'labelproject': labelproject_raw.id,
            'user': labelproject_raw.user,
            'outputFilePath': '',
            'isChecked': 0
        }
        asynctask = self.dbClass.createAsyncTask(data)
        background_tasks.add_task(self.export_data, labelproject_raw, asynctask=asynctask, is_for_client=True)
        return HTTP_200_OK, asynctask.__dict__['__data__']

    def export_data(self, labelproject_raw, asynctask=None, is_for_client=False):

        df, s3Url = None, None
        try:
            if is_for_client:
                ds2data = self.dbClass.getSthreeFilesByLabelprojectId(labelproject_raw.id)
            else:
                ds2data = self.dbClass.getDonesthreefilesByLabelprojectId(labelproject_raw.id)
            if labelproject_raw.workapp in ['detection_3d']:
                result, outputFilePath = self.export3dData(labelproject_raw, isAsync = True, is_train_data = False, asynctask = asynctask)
                status = 100

            if labelproject_raw.workapp in ['normal_classification', 'text', 'normal_regression', 'time_series', 'csv']:
                csv_data = []
                label_column = list(ds2data[0]['labelData'])[0].replace(self.utilClass.dot_encode_key, '.')
                original_file_name = None
                for data in ds2data:
                    if data['status'] == 'done':
                        if not original_file_name:
                            original_file_name = self.dbClass.getOneDataconnectorById(data['dataconnector']).dataconnectorName
                        data['rawData'].update(data['labelData'])
                        csv_data.append(data['rawData'])
                csv_data = ast.literal_eval(str(csv_data).replace(self.utilClass.dot_encode_key, '.'))

                df = pd.DataFrame.from_records(csv_data)
                target = df[label_column]
                is_suffle = True
                is_stratify = target
                if labelproject_raw.workapp in ['csv', 'text', 'normal_regression', 'time_series']:
                    is_stratify = None
                    is_suffle = False if labelproject_raw.workapp == 'time_series' else True
                if not is_for_client:
                    new_column_list = [f"{x}__{original_file_name}" for x in df.columns]
                    df.columns = new_column_list
                    df_train, df_test = train_test_split(df, test_size=0.2, random_state=42, shuffle=is_suffle,
                                                         stratify=is_stratify)

                    df = pd.concat([df_train, df_test])

                labelproject_path = f'{self.utilClass.save_path}/{labelproject_raw.id}' if self.utilClass.configOption == 'enterprise' \
                else f'temp/{labelproject_raw.id}'

                if not os.path.isdir(labelproject_path):
                    os.makedirs(labelproject_path)

                df.to_csv(f'{labelproject_path}/{labelproject_raw.name}.csv')

                s3_path = f'user/{labelproject_raw.user}/{labelproject_raw.name}.csv'
                self.s3.upload_file(f'{labelproject_path}/{labelproject_raw.name}.csv', self.utilClass.bucket_name, s3_path)

                if self.utilClass.configOption != 'enterprise':
                    s3Url = urllib.parse.quote(
                        f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3_path}').replace(
                        'https%3A//', 'https://')

                    shutil.rmtree(f'{os.getcwd()}/{labelproject_path}')
                else:
                    s3Url = f'{self.utilClass.save_path}/{s3_path}'
                outputFilePath = s3Url
                status = 100

            if labelproject_raw.workapp in ['image']:
                if not is_for_client:
                    sthreefile_count_by_class = self.dbClass.getSthreeFileCountByClass(labelproject_raw.id)
                    test_data_count = {'non_class': 0}
                    for data_set in sthreefile_count_by_class:
                        test_data_count[data_set['id']] = int(data_set['count'] * 0.2)
                    random.shuffle(ds2data)
                    train_row = []
                    test_row = []

                timestamp = time.strftime('%y%m%d%H%M%S')
                zip_dir_path = f'{self.utilClass.save_path}/user/{labelproject_raw.user}/{timestamp}{labelproject_raw.id}'
                for data in ds2data:
                    s3key = urllib.parse.unquote_plus(data['s3key']) if self.utilClass.configOption == "enterprise" else \
                            urllib.parse.unquote_plus(data['s3key'].split('amazonaws.com/')[1])
                    s3key = urllib.parse.unquote_plus(s3key)
                    class_name = data.get('labelData', 'non_class')
                    dir_name = f'{self.utilClass.save_path}/user/{labelproject_raw.user}/{timestamp}{labelproject_raw.id}/{class_name}'
                    if not is_for_client:
                        if test_data_count[class_name] > 0:
                            test_data_count[class_name] -= 1
                            test_row.append({
                                'image': f"{dir_name}/{data['fileName']}",
                                'label': dir_name
                            })
                            # print(test_row)
                        else:
                            train_row.append({
                                'image': f"{dir_name}/{data['fileName']}",
                                'label': dir_name
                            })
                    os.makedirs(dir_name, exist_ok=True)
                    self.s3.download_file(self.utilClass.bucket_name, s3key, f'{dir_name}/{data["fileName"]}')

                if not is_for_client:
                    train_df = pd.DataFrame(train_row)
                    test_df = pd.DataFrame(test_row)
                    df = pd.concat([train_df, test_df])

                zip_file_path = f'{self.utilClass.save_path}/user/{labelproject_raw.user}/{timestamp}{labelproject_raw.id}'
                self.make_archive(zip_file_path, f'{zip_dir_path}.zip')

                s3Folder = f"user/{labelproject_raw.user}/{timestamp}{labelproject_raw.name}.zip"

                self.s3.upload_file(f'{zip_file_path}.zip',
                                    self.utilClass.bucket_name, f'{s3Folder}')
                if self.utilClass.configOption == 'enterprise':
                    s3Url = f'{self.utilClass.save_path}/{s3Folder}'
                else:
                    s3Url = urllib.parse.quote(
                    f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3Folder}').replace(
                    'https%3A//', 'https://')

                outputFilePath = s3Url
                status = 100
                try:
                    shutil.rmtree(f"{self.utilClass.save_path}/user/{labelproject_raw.user}/{timestamp}{labelproject_raw.name}")
                except:
                    pass
        except:
            print(traceback.format_exc())
            status = 99
            outputFilePath = ''
        if asynctask:

            asynctask.status = status
            asynctask.outputFilePath = outputFilePath
            asynctask.save()
        return df, s3Url

    def exportCoCo(self, token, labelProjectId):
        userId = self.dbClass.getId(token, raw=True)

        if not userId:
            self.utilClass.sendSlackMessage(
                f"파일 : checkDataset\n 함수 : exportCoCo \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True)
            return NOT_ALLOWED_TOKEN_ERROR

        user = self.dbClass.getUser(token)
        labelProjectRaw = self.dbClass.getLabelProjectsById(labelProjectId)
        if labelProjectRaw.user != userId:
            self.utilClass.sendSlackMessage(
                f"파일 : checkDataset\n 함수 : exportCoCo \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        cocodata = self.exportCoCoData(labelProjectRaw)

        return HTTP_200_OK, cocodata

    def exportCoCoData(self, labelProjectInfo, projectId=None, isAsync=False, is_get_image=False,
                       has_project_data=False, has_median_data=False, is_suffle=True, is_train_data=True,
                       asynctask=None):
        print("exportCoCoData")
        trainannotation = []
        testannotations = []
        status = 0
        class_ids = []

        try:
            labelProject = labelProjectInfo.__dict__['__data__']
            if isAsync:
                if not asynctask:
                    data = {
                        'taskName': f'{labelProject["name"]}',
                        'taskNameEn': f'{labelProject["name"]}',
                        'taskType': 'exportCoco',
                        'status': status,
                        'labelproject': labelProject['id'],
                        'user': labelProject['user'],
                        'outputFilePath': '',
                        'isChecked': 0
                    }
                    self.dbClass.createAsyncTask(data)

            if not os.path.isdir(f'{os.getcwd()}/temp/{labelProject["id"]}'):
                os.makedirs(f'{os.getcwd()}/temp/{labelProject["id"]}')


            if has_median_data:
                class_label_count_dict = {}
                group_query = {'_id': '$labelclass', 'count': {'$sum': 1}}
                condition = {"$and": [{"labelproject": labelProjectInfo.id}, {"$or": [{"isDeleted": False}, {"isDeleted": None}]}]}
                labelProject['labelclasses'] = []
                labelProject['labels'] = []
                label_count = [x['count'] for x in
                               mongoDb.get_group_documents(collection_name=mongoDb.LABELS_COLLECTION_NAME,
                                                           condition=condition, group_query=group_query)]

                if len(label_count) >= 5:
                    label_count.remove(max(label_count))
                    label_count.remove(max(label_count))

                label_limit = int(np.median(label_count)) * 2

                for labelclass in self.dbClass.getCoCoLabelClassesByLabelProjectId(labelProjectInfo.id):
                    labelclass = model_to_dict(labelclass)
                    class_label_count_dict[labelclass['id']] = 0
                    labelProject['labelclasses'].append(labelclass)

                done_label_class_count = 0
                label_class_count = len(labelProject['labelclasses'])

            else:
                labelProject['labelclasses'] = [x.__dict__['__data__'] for x in
                                                self.dbClass.getCoCoLabelClassesByLabelProjectId(labelProjectInfo.id)]
            labelProject['sthreefile'] = self.dbClass.getDoneDs2DataAndLabelsByLabelprojectId(labelProject['id'])

            if projectId:
                class_temps = []
                class_ids = []

                project_dict = self.dbClass.getOneProjectById(projectId)
                project_dict['yClass'] = ast.literal_eval(project_dict['yClass'])
                for label_class_info in labelProject['labelclasses']:
                    if label_class_info['name'] in project_dict['yClass']:
                        class_temps.append(label_class_info)
                        class_ids.append(label_class_info['id'])

                labelProject['labelclasses'] = class_temps

            else:
                for label_class in labelProject['labelclasses']:
                    if label_class['id'] not in class_ids:
                        class_ids.append(label_class['id'])

            if projectId or is_get_image:
                labelProject['sthreefile'] = self.download_sthreefile(
                    labelProject['sthreefile'], labelProject['id'], project_id=projectId)

            images = []
            labels_count = 1
            images_count = 1
            image_point = 0

            if is_suffle:
                shuffle(labelProject['sthreefile'])

            train_image_count = int(len(labelProject['sthreefile']) * 0.8) if is_train_data else len(labelProject['sthreefile'])

            for sthreefile in tqdm(labelProject['sthreefile']):
                if has_median_data and label_class_count == done_label_class_count:
                    break
                # fileName = 'images/' + sthreefile['fileName'] if isAsync else sthreefile['fileName']
                fileName = sthreefile['fileName'] if isAsync else sthreefile['fileName']
                images_count += 1
                images.append({
                    "id": images_count,
                    "file_name": fileName,
                    "width": int(sthreefile['width']),
                    "height": int(sthreefile['height'])
                })

                image_point += 1

                for label in sthreefile['labels']:
                    if has_median_data:
                        if class_label_count_dict[label['labelclass']] < label_limit:
                            class_label_count_dict[label['labelclass']] += 1
                        elif class_label_count_dict[label['labelclass']] == label_limit:
                            done_label_class_count += 1
                            class_label_count_dict[label['labelclass']] += 1
                            continue
                        elif class_label_count_dict[label['labelclass']] > label_limit:
                            continue

                    if label['labelclass'] not in class_ids:
                        continue

                    width = sthreefile['width']
                    height = sthreefile['height']
                    bbox = None
                    if label['labeltype'] == 'box':
                        # points = [[round(width * label['x']), round(height * label['y']),
                        #            round(width * label['x']), round(height * (label['y'] + label['h'])),
                        #            round(width * (label['x'] + label['w'])), round(height * (label['y'] + label['h'])),
                        #            round(width * (label['x'] + label['w'])), round(height * label['y'])]]
                        points = [[round(width * label['x']), round(height * label['y']),
                                   round(width * (label['x'] + label['w'])), round(height * label['y']),
                                   round(width * (label['x'] + label['w'])), round(height * (label['y'] + label['h'])),
                                   round(width * label['x']), round(height * (label['y'] + label['h']))
                                   ]]
                        numpyarray = np.array(points).reshape((-1, 2))
                        npmin = np.min(numpyarray, axis=0)
                        npmax = np.max(numpyarray, axis=0)
                        area = label['w'] * label['h']
                        bbox = [int(npmin[0]), int(npmin[1]), int(npmax[0]) - int(npmin[0]), int(npmax[1]) - int(npmin[1])]
                    elif label['labeltype'] == 'polygon':
                        basiclist = ast.literal_eval(label['points']) if type(label['points']) == str else label[
                            'points']
                        for basictemp in basiclist:
                            basictemp[0] = round(basictemp[0] * width)
                            basictemp[1] = round(basictemp[1] * height)
                        numpyarray = np.array(basiclist)
                        points = ast.literal_eval(str(basiclist).replace('], [', ', '))
                        area = int(self.calcPolygonArea(numpyarray))
                        numpyarray = np.array(points).reshape((-1, 2))
                        npmin = np.min(numpyarray, axis=0)
                        npmax = np.max(numpyarray, axis=0)
                        bbox = [int(npmin[0]), int(npmin[1]), int(npmax[0]) - int(npmin[0]), int(npmax[1]) - int(npmin[1])]

                    data = {
                        "segmentation": points,
                        "area": area,
                        "iscrowd": 0,
                        "ignore": 0,
                        "image_id": images_count,
                        "category_id": label['labelclass'],
                        "id": labels_count
                    }

                    if label['labeltype'] == 'box' and not is_train_data:
                        data["segmentation"] = []
                    
                    data["bbox"] = bbox

                    labels_count += 1

                    trainannotation.append(data) if image_point < train_image_count else testannotations.append(
                        data)

            categories = []
            new_project_yClass = []
            for x in labelProject['labelclasses']:
                categories.append({"supercategory": "none", "id": x['id'], "name": x['name']})
                new_project_yClass.append(x['name'])

            if projectId:
                self.dbClass.updateProject(projectId, {'yClass': new_project_yClass})

            trainCocodata = {"images": images[:train_image_count], "type": "instances", "annotations": trainannotation,
                             "categories": categories}
            testCocodata = {"images": images[train_image_count:], "type": "instances", "annotations": testannotations,
                            "categories": categories}


            result = {'trainCocodata': trainCocodata, 'testCocodata': testCocodata} if is_train_data else trainCocodata
            # print(result)
            # result = json.dumps(result, ensure_ascii=False)
        except:
            print(traceback.format_exc())
            result = {}
            outputFilePath = ''
            status = 99
            pass
        if isAsync:
            try:
                if status == 0:
                    label_project_dir = f'{self.utilClass.save_path}/labelproject/{labelProject["id"]}'
                    os.makedirs(label_project_dir, exist_ok=True)
                    with open(f'{label_project_dir}/coco.json', 'w') as outfile:
                        json.dump(result, outfile, indent=4)
                    timestamp = time.strftime('%y%m%d%H%M%S')
                    os.makedirs(f'{self.utilClass.save_path}/user/{labelProject["user"]}/', exist_ok=True)
                    zip_file_path = f'{self.utilClass.save_path}/user/{labelProject["user"]}/{labelProject["id"]}'
                    self.make_archive(label_project_dir, f'{zip_file_path}.zip')
                    self.s3.upload_file(f'{zip_file_path}.zip', self.utilClass.bucket_name,
                                        f'user/{labelProject["user"]}/labelproject/{labelProject["id"]}/{timestamp}/coco.zip')
                    outputFilePath = f'{self.utilClass.save_path}/user/{labelProject["user"]}/labelproject/{labelProject["id"]}/{timestamp}/coco.zip'
                    status = 100
                    shutil.rmtree(f'{os.getcwd()}/temp/{labelProject["id"]}')
                    os.remove(f'{label_project_dir}/coco.json')
                    # if os.path.isdir(label_project_dir):
                    #     shutil.rmtree(label_project_dir)
            except:
                print(traceback.format_exc())
                outputFilePath = ''
                status = 99
                pass
            if asynctask:
                asynctask.outputFilePath = outputFilePath
                asynctask.status = status
                asynctask.save()
            else:
                data = {
                    'taskName': f'{labelProject["name"]}',
                    'taskType': 'exportCoco',
                    'status': status,
                    'labelproject': labelProject['id'],
                    'user': labelProject['user'],
                    'outputFilePath': outputFilePath,
                    'isChecked': 0
                }
                self.dbClass.createAsyncTask(data)
            return result
        else:
            return result

    def export3dData(self, labelProjectInfo, projectId=None, isAsync=False, is_get_image=False,
                       has_project_data=False, has_median_data=False, is_suffle=True, is_train_data=True,
                       asynctask=None):
        print("exportCoCoData")
        trainannotation = []
        testannotations = []
        status = 0
        class_ids = []
        try:
            labelProject = labelProjectInfo.__dict__['__data__']
            if isAsync:
                if not asynctask:
                    data = {
                        'taskName': f'{labelProject["name"]}',
                        'taskNameEn': f'{labelProject["name"]}',
                        'taskType': 'export3D',
                        'status': status,
                        'labelproject': labelProject['id'],
                        'user': labelProject['user'],
                        'outputFilePath': '',
                        'isChecked': 0
                    }
                    self.dbClass.createAsyncTask(data)
            timestamp = time.strftime('%y%m%d%H%M%S')
            label_project_temp_dir = f'{os.getcwd()}/temp/{labelProject["id"]}_{timestamp}'
            # os.makedirs(outputFilePath, exist_ok=True)
            #TODO: 데이터 커넥터 업로드 시 압축 푼걸 풀어놓은 후 재시도 필요 (혹은 이미 풀린 곳 다시 찾기 - 데이터 커넥터 아이디와 주소 매칭 안될 시 확인 필요)
            current_dataconnector_id = ast.literal_eval(labelProject['dataconnectorsList'])[0]
            current_dataconnector = self.dbClass.getOneDataconnectorById(current_dataconnector_id)
            original_labelproject = self.dbClass.getOneLabelProjectById(current_dataconnector.originalLabelproject)
            try:
                shutil.copytree(f"{self.utilClass.save_path}/user/{labelProject['user']}/{ast.literal_eval(original_labelproject.dataconnectorsList)[0]}/",
                         label_project_temp_dir, dirs_exist_ok=True)
            except:
                pass
            # imgae0 -> training/image_2 test/image_2
            # result -> training/label_2 test/label_2
            # point_cloud -> training/velodyne testing/velodyne
            os.makedirs(f'{label_project_temp_dir}/result', exist_ok=True)
            if has_median_data:
                class_label_count_dict = {}
                group_query = {'_id': '$labelclass', 'count': {'$sum': 1}}
                condition = {"$and": [{"labelproject": labelProjectInfo.id},
                                      {"$or": [{"isDeleted": False}, {"isDeleted": None}]}]}
                labelProject['labelclasses'] = []
                labelProject['labels'] = []
                label_count = [x['count'] for x in
                               mongoDb.get_group_documents(collection_name=mongoDb.LABELS_COLLECTION_NAME,
                                                           condition=condition, group_query=group_query)]

                if len(label_count) >= 5:
                    label_count.remove(max(label_count))
                    label_count.remove(max(label_count))

                label_limit = int(np.median(label_count)) * 2

                for labelclass in self.dbClass.getCoCoLabelClassesByLabelProjectId(labelProjectInfo.id):
                    labelclass = model_to_dict(labelclass)
                    class_label_count_dict[labelclass['id']] = 0
                    labelProject['labelclasses'].append(labelclass)

                done_label_class_count = 0
                label_class_count = len(labelProject['labelclasses'])

            else:
                labelProject['labelclasses'] = [x.__dict__['__data__'] for x in
                                                self.dbClass.getCoCoLabelClassesByLabelProjectId(labelProjectInfo.id)]
            ds2data = self.dbClass.getSthreeFilesByLabelprojectId(labelProject['id'])
            labelProject['sthreefile'] = ds2data
            # labelProject['sthreefile'] = self.dbClass.getDoneDs2DataAndLabelsByLabelprojectId(labelProject['id'])

            if projectId:
                class_temps = []
                class_ids = []

                project_dict = self.dbClass.getOneProjectById(projectId)
                project_dict['yClass'] = ast.literal_eval(project_dict['yClass'])
                for label_class_info in labelProject['labelclasses']:
                    if label_class_info['name'] in project_dict['yClass']:
                        class_temps.append(label_class_info)
                        class_ids.append(label_class_info['id'])

                labelProject['labelclasses'] = class_temps

            else:
                for label_class in labelProject['labelclasses']:
                    if label_class['id'] not in class_ids:
                        class_ids.append(label_class['id'])

            if projectId or is_get_image:
                labelProject['sthreefile'] = self.download_sthreefile(
                    labelProject['sthreefile'], labelProject['id'], project_id=projectId)

            images = []
            labels_count = 1
            images_count = 1
            image_point = 0

            if is_suffle:
                shuffle(labelProject['sthreefile'])

            train_image_count = int(len(labelProject['sthreefile']) * 0.8) if is_train_data else len(
                labelProject['sthreefile'])

            for sthreefile in tqdm(labelProject['sthreefile']):
                if has_median_data and label_class_count == done_label_class_count:
                    break
                # fileName = 'images/' + sthreefile['fileName'] if isAsync else sthreefile['fileName']
                fileName = sthreefile['fileName'] if isAsync else sthreefile['fileName']
                images_count += 1
                images.append({
                    "id": images_count,
                    "file_name": fileName,
                })

                image_point += 1

                sthreefile['labels'] = self.dbClass.getLabelsBySthreeId(sthreefile['id'])

                for label in sthreefile['labels']:
                    if has_median_data:
                        if class_label_count_dict[label['labelclass']] < label_limit:
                            class_label_count_dict[label['labelclass']] += 1
                        elif class_label_count_dict[label['labelclass']] == label_limit:
                            done_label_class_count += 1
                            class_label_count_dict[label['labelclass']] += 1
                            continue
                        elif class_label_count_dict[label['labelclass']] > label_limit:
                            continue

                    labels_count += 1
                    if image_point < train_image_count:
                        trainannotation.append(label)
                    else:
                        testannotations.append(label)

                # annotation_text = ""
                annotations= {"result": {"objects": []}}
                objects = []
                for annotation in trainannotation:
                    try:
                        # annotation_text += f"{annotation['classAttributes']['className']} 0 0 0 {annotation['min_x']} {annotation['min_y']} {annotation['max_x']} {annotation['max_y']} {annotation['classAttributes']['size3D']['x']} {annotation['classAttributes']['size3D']['y']} {annotation['classAttributes']['size3D']['z']} {annotation['classAttributes']['center3D']['x']} {annotation['classAttributes']['center3D']['y']} {annotation['classAttributes']['center3D']['z']} {annotation['classAttributes']['rotation3D']['y']}\n"
                        if sthreefile['id'] == annotation['sthreefile']:
                            objects.append(annotation)
                    except:
                        print(traceback.format_exc())
                        pass
                annotations["result"]["objects"] = objects

                # label_file_path = f'{os.getcwd()}/temp/{labelProject["id"]}/{fileName.replace(".pcd", ".txt").replace("point_cloud", "result")}'
                # if image_point < train_image_count:
                #     label_file_path = f'{os.getcwd()}/temp/{labelProject["id"]}/{fileName.replace(".pcd", ".txt").replace("point_cloud", "result")}'
                label_file_path = f'{label_project_temp_dir}/{fileName.replace(".pcd", ".json").replace("point_cloud", "result")}'
                if image_point < train_image_count:
                    label_file_path = f'{label_project_temp_dir}/{fileName.replace(".pcd", ".json").replace("point_cloud", "result")}'

                base_path = os.path.dirname(label_file_path)
                os.makedirs(base_path, exist_ok=True)

                with open(label_file_path, 'w') as f:
                    json.dump(annotations, f)

            categories = []
            new_project_yClass = []
            for x in labelProject['labelclasses']:
                categories.append({"supercategory": "none", "id": x['id'], "name": x['name']})
                new_project_yClass.append(x['name'])

            if projectId:
                self.dbClass.updateProject(projectId, {'yClass': new_project_yClass})

            trainCocodata = {"images": images[:train_image_count], "type": "instances", "annotations": trainannotation,
                             "categories": categories}
            testCocodata = {"images": images[train_image_count:], "type": "instances", "annotations": testannotations,
                            "categories": categories}

            result = {'trainCocodata': trainCocodata, 'testCocodata': testCocodata} if is_train_data else trainCocodata
            # print(result)
            # result = json.dumps(result, ensure_ascii=False)
        except:
            print(traceback.format_exc())
            result = {}
            outputFilePath = ''
            status = 99
            pass
        try:
            if status == 0:

                # os.makedirs(label_project_dir, exist_ok=True)
                # with open(f'{label_project_dir}/annotation.json', 'w') as outfile:
                #     json.dump(result, outfile, indent=4, default=str)

                self.zip_folder(f"{labelProject['id']}_{timestamp}", f"{os.getcwd()}/temp/")
                os.makedirs(f'{self.utilClass.save_path}/user/{labelProject["user"]}/labelproject/{labelProject["id"]}/{timestamp}', exist_ok=True)
                self.s3.upload_file(f'{os.getcwd()}/temp/{labelProject["id"]}_{timestamp}/{labelProject["id"]}_{timestamp}.zip', self.utilClass.bucket_name,
                                    f'user/{labelProject["user"]}/labelproject/{labelProject["id"]}/{timestamp}/export.zip')
                outputFilePath = f'{self.utilClass.save_path}/user/{labelProject["user"]}/labelproject/{labelProject["id"]}/{timestamp}/export.zip'
                status = 100
                # shutil.rmtree(f'{os.getcwd()}/temp/{labelProject["id"]}')
                # os.remove(f'{label_project_dir}/{zip_file_path}.zip')
                # if os.path.isdir(label_project_dir):
                #     shutil.rmtree(label_project_dir)
                if isAsync:
                    shutil.rmtree(f"{os.getcwd()}/temp/{labelProject['id']}_{timestamp}")
        except:
            print(traceback.format_exc())
            outputFilePath = ''
            status = 99
            pass

        if not isAsync:
            outputFilePath = label_project_temp_dir
        if asynctask:
            asynctask.outputFilePath = outputFilePath
            asynctask.status = status
            asynctask.save()
        else:
            data = {
                'taskName': f'{labelProject["name"]}',
                'taskType': 'export3D',
                'status': status,
                'labelproject': labelProject['id'],
                'user': labelProject['user'],
                'outputFilePath': outputFilePath,
                'isChecked': 0
            }
            self.dbClass.createAsyncTask(data)
        return result, outputFilePath
        # else:
        #     return result, outputFilePath
    def zip_folder(self, folder_name, data_path):

        commands = f'cd {data_path}/{folder_name}; zip -r {folder_name}.zip ./*'
        process = subprocess.Popen('/bin/bash', stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        out, err = process.communicate(commands.encode('utf-8'))

    def zip_file(self, zip_path, data_path, is_get_image=False):

        commands = f'cd {data_path}; zip {zip_path} coco.json'
        if is_get_image:
            commands += ' images/*'
        process = subprocess.Popen('/bin/bash', stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        out, err = process.communicate(commands.encode('utf-8'))

    def download_sthreefile(self, sthreefiles, labelproject_id, project_id=None, is_voc=False):
        for sthreefile in tqdm(sthreefiles):

            if project_id:
                folder_path = f'{self.utilClass.save_path}/{project_id}'
            elif is_voc:
                folder_path = f'{self.utilClass.save_path}/labelproject/{labelproject_id}/JPEGImages'
            elif self.utilClass.configOption == 'enterprise':
                folder_path = f'{self.utilClass.save_path}/labelproject/{labelproject_id}'
            else:
                folder_path = f'{self.utilClass.save_path}/labelproject/{labelproject_id}'
            folder_path = f'{folder_path}'
            if not os.path.isdir(folder_path):
                os.makedirs(folder_path)
            download_path = f"{folder_path}/{sthreefile['fileName']}"

            try:
                temp_url = f'{sthreefile["s3key"]}' if self.utilClass.configOption == 'enterprise' else f"user/{sthreefile['s3key'].split('/user/')[1]}"
                if self.utilClass.save_path in temp_url:
                    s3_download_url = urllib.parse.unquote_plus(temp_url)
                    self.s3.download_file(self.utilClass.bucket_name, s3_download_url, download_path)
                else:
                    try:
                        s3_download_url = urllib.parse.unquote_plus(temp_url)
                        cloud_file_path = "/".join(s3_download_url.split("/")[3:])
                        self.utilClass.s3_cloud.download_file('aimakerdslab', cloud_file_path, download_path)
                    except:
                        pass

            except:
                self.utilClass.sendSlackMessage(
                    f"파일 : checkDataset\n 함수 : exportCoCo \n exportCoCo 파일 다운로드 에러 발생 - {sthreefile['fileName']}\n 에러 내용 = {traceback.format_exc()})",
                    appError=True)
                print(traceback.format_exc())
                pass
            # if not os.path.isfile(download_path):
            #     sthreefiles.remove(sthreefile)
        return sthreefiles

    def calcPolygonArea(self, points):
        return 0.5 * np.abs(np.dot(points[:, 0], np.roll(points[:, 1], 1))
                            - np.dot(points[:, 1], np.roll(points[:, 0], 1)))

    def async_export_voc(self, token, background_tasks, label_project_id, is_get_image):
        user = self.dbClass.getUser(token)
        label_project_info = self.dbClass.getLabelProjectsById(label_project_id)

        # if self.dbClass.check_export_coco(user['id'], 'exportVoc'):
        #     raise ex.TooManyRequestsExportCocoEx(token)

        role = None
        for temp in self.dbClass.getSharedLabelprojectIdByUserId(user['id']):
            if temp.labelprojectsid and int(label_project_id) in ast.literal_eval(temp.labelprojectsid):
                group_user = self.dbClass.getMemberByUserIdAndGroupId(user['id'], temp.id)
                if group_user and role != 'admin':
                    role = role if role == 'subadmin' and group_user.role != 'admin' else group_user.role

        if not user or not label_project_info or (label_project_info.user != user['id'] and role != 'subadmin'):
            self.utilClass.sendSlackMessage(
                f"파일 : checkDataset\n 함수 : exportVOC \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        background_tasks.add_task(self.export_voc_data, label_project_info, user, is_get_image, is_async=True)
        return HTTP_200_OK, {}

    def export_voc_data(self, label_project_info, user, is_get_image, is_async):
        try:


            label_project = label_project_info.__dict__['__data__']
            if is_async:
                data = {
                    'taskName': f'{label_project["name"]}',
                    'taskNameEn': f'{label_project["name"]}',
                    'taskType': 'exportVoc',
                    'status': 0,
                    'labelproject': label_project['id'],
                    'user': label_project['user'],
                    'outputFilePath': '',
                    'isChecked': 0
                }
                self.dbClass.createAsyncTask(data)
            label_project['sthreefile'] = self.dbClass.getDoneDs2DataAndLabelsByLabelprojectId(label_project_info.id)

            folder_url = f'{self.utilClass.save_path}/labelproject/{label_project["id"]}'
            if os.path.isdir(folder_url):
                shutil.rmtree(folder_url)

            os.makedirs(f"{folder_url}/Annotations")

            if is_get_image:
                os.makedirs(f"{folder_url}/JPEGImages", exist_ok=True)
                os.makedirs(f"{folder_url}/ImageSets/Main", exist_ok=True)
                os.makedirs(f"{folder_url}/Annotations/", exist_ok=True)
                shuffle(label_project['sthreefile'])
                image_sets_idx = (len(label_project["sthreefile"]) // 5) + 1
                test_filenames = []
                trainval_filenames = []
                current_idx = 0

            if label_project_info.workapp == "detection_3d":
                label_project['sthreefile'] = self.dbClass.getSthreeFilesByLabelprojectId(label_project['id'])

            for img in tqdm(label_project['sthreefile']):
                if is_get_image:
                    if self.utilClass.configOption != 'enterprise':
                        temp_url = f'{img["s3key"]}' if self.utilClass.configOption == 'enterprise' else f"user/{img['s3key'].split('/user/')[1]}"
                        s3_download_url = urllib.parse.unquote_plus(temp_url)
                        self.s3.download_file(self.utilClass.bucket_name, s3_download_url, f"{folder_url}/JPEGImages/{img['originalFileName']}")
                    else:
                        self.s3.upload_file(img['s3key'], self.utilClass.bucket_name,
                                        f'labelproject/{label_project["id"]}/JPEGImages/{img["originalFileName"]}')
                    if current_idx < image_sets_idx:
                        test_filenames.append(img['originalFileName'] + "\n")
                    else:
                        trainval_filenames.append(img['originalFileName'] + "\n")

                    current_idx += 1

                root = Element('annotation')

                SubElement(root, "folder").text = "VOC2007"
                SubElement(root, "filename").text = img['fileName']

                source = SubElement(root, "source")
                SubElement(source, "database").text = "The VOC2007 Database"
                SubElement(source, "annotation").text = "PASCAL VOC2007"
                SubElement(source, "image").text = "none"
                SubElement(source, "flickrid").text = "none"

                owner = SubElement(root, "owner")
                SubElement(owner, "flickrid").text = "none"
                SubElement(owner, "name").text = user['email']

                size = SubElement(root, "size")
                if label_project_info.workapp == "detection_3d":
                    img['labels'] = self.dbClass.getLabelsBySthreeId(img['id'])
                else:
                    SubElement(size, "width").text = str(int(img['width']))
                    SubElement(size, "height").text = str(int(img['height']))
                SubElement(size, "depth").text = "3"

                SubElement(root, "segmented").text = "0"

                for label in img['labels']:
                    obj = SubElement(root, "object")
                    if label_project_info.workapp == "detection_3d":
                        bndbox = SubElement(obj, "bndbox")
                        SubElement(bndbox, 'size_x').text = f"{label['classAttributes']['contour']['size3D']['x']}"
                        SubElement(bndbox, 'size_y').text = f"{label['classAttributes']['contour']['size3D']['y']}"
                        SubElement(bndbox, 'size_z').text = f"{label['classAttributes']['contour']['size3D']['z']}"
                        SubElement(bndbox, 'center_x').text = f"{label['classAttributes']['contour']['center3D']['x']}"
                        SubElement(bndbox, 'center_y').text = f"{label['classAttributes']['contour']['center3D']['y']}"
                        SubElement(bndbox, 'center_z').text = f"{label['classAttributes']['contour']['center3D']['z']}"
                        SubElement(bndbox, 'lotate_y').text = f"{label['classAttributes']['contour']['rotation3D']['y']}"

                    else:
                        if label['labeltype'] == 'box':
                            numpyarray = np.reshape((
                                round(img['width'] * label['x']),
                                round(img['height'] * label['y']),
                                round(img['width'] * label['x']),
                                round(img['height'] * (label['y'] + label['h'])),
                                round(img['width'] * (label['x'] + label['w'])),
                                round(img['height'] * (label['y'] + label['h'])),
                                round(img['width'] * (label['x'] + label['w'])),
                                round(img['height'] * label['y'])
                            ), (4, 2))

                        if label['labeltype'] == 'polygon':
                            basiclist = ast.literal_eval(label['points']) if type(label['points']) == str else label['points']
                            for basictemp in basiclist:
                                basictemp[0] = round(basictemp[0] * img['width'])
                                basictemp[1] = round(basictemp[1] * img['height'])
                            numpyarray = np.array(basiclist)

                        npmin = np.min(numpyarray, axis=0)
                        npmax = np.max(numpyarray, axis=0)

                        bndbox_info = {
                            "xmin": str(int(npmin[0]) + 1),
                            "ymin": str(int(npmin[1]) + 1),
                            "xmax": str(int(npmax[0])),
                            'ymax': str(int(npmax[1])),
                        }

                        points = [[round(img['width'] * label['x']), round(img['height'] * label['y']),
                                   round(img['width'] * (label['x'] + label['w'])), round(img['height'] * label['y']),
                                   round(img['width'] * (label['x'] + label['w'])), round(img['height'] * (label['y'] + label['h'])),
                                   round(img['width'] * label['x']), round(img['height'] * (label['y'] + label['h']))
                                   ]]
                        numpyarray = np.array(points).reshape((-1, 2))
                        npmin = np.min(numpyarray, axis=0)
                        npmax = np.max(numpyarray, axis=0)
                        area = label['w'] * label['h']
                        bbox = [int(npmin[0]), int(npmin[1]), int(npmax[0]) - int(npmin[0]), int(npmax[1]) - int(npmin[1])]
                        bndbox = SubElement(obj, "bndbox")
                        SubElement(bndbox, 'xmin').text = f"{bbox[0]}"
                        SubElement(bndbox, 'ymin').text = f"{bbox[1]}"
                        SubElement(bndbox, 'xmax').text = f"{bbox[2]}"
                        SubElement(bndbox, 'ymax').text = f"{bbox[3]}"

                    if label_project_info.workapp == "detection_3d":
                        SubElement(obj, 'name').text = label['classAttributes']['className']
                    else:
                        label_class = self.dbClass.getOneLabelclassById(label['labelclass']).__dict__['__data__']
                        SubElement(obj, 'name').text = label_class['name']
                    # SubElement(obj, 'pose').text = "Unspecified"
                    SubElement(obj, 'truncated').text = "0"
                    SubElement(obj, 'difficult').text = "0"

                only_file_name, file_ext = os.path.splitext(img['originalFileName'])
                ElementTree(root).write(f"{folder_url}/Annotations/{only_file_name}.xml")

            if is_get_image:
                with open(f"{folder_url}/ImageSets/Main/test.txt", "w") as text:
                    text.writelines(test_filenames)

                with open(f"{folder_url}/ImageSets/Main/trainval.txt", "w") as text:
                    text.writelines(trainval_filenames)


            if label_project['id'] or is_get_image:
                label_project['sthreefile'] = self.download_sthreefile(
                    label_project['sthreefile'], label_project['id'], is_voc=True)


            self.make_archive(folder_url, f'{folder_url}.zip')

            timestamp = time.strftime('%y%m%d%H%M%S')
            self.s3.upload_file(f"{folder_url}.zip", self.utilClass.bucket_name,
                                f'user/{user["id"]}/labelproject/{label_project["id"]}/{timestamp}/xml.zip')

            output_file_path = f'{self.utilClass.save_path}/user/{user["id"]}/labelproject/{label_project["id"]}/{timestamp}/xml.zip'

            if os.path.isdir(f"{folder_url}/JPEGImages"):
                shutil.rmtree(f"{folder_url}/JPEGImages")
            if os.path.isdir(f"{folder_url}/ImageSets"):
                shutil.rmtree(f"{folder_url}/ImageSets")
            if os.path.isdir(f"{folder_url}/Annotations"):
                shutil.rmtree(f"{folder_url}/Annotations")

            status = 100
        except:
            print(traceback.format_exc())
            output_file_path = ''
            status = 99

        # if os.path.isdir(folder_url):
        #     shutil.rmtree(folder_url)

        if os.path.isfile(f"{folder_url}.zip"):
            os.remove(f"{folder_url}.zip")

        if is_async:
            data = {
                'taskName': f'{label_project["name"]}',
                'taskType': 'exportVoc',
                'status': status,
                'labelproject': label_project['id'],
                'user': label_project['user'],
                'outputFilePath': output_file_path,
                'isChecked': 0
            }
            self.dbClass.createAsyncTask(data)

        result = {}
        return result

    def make_archive(self, source, destination):
        base = os.path.basename(destination)
        name = base.split('.')[0]
        format = base.split('.')[1]
        archive_from = os.path.dirname(source)
        archive_to = os.path.basename(source.strip(os.sep))
        shutil.make_archive(name, format, archive_from, archive_to)
        shutil.move('%s.%s' % (name, format), destination)

if __name__ == '__main__':
    mongoDb
    group_query = {'_id': '$labelclass', 'count': {'$sum': 1}}
    condition = {"labelproject": 4533}

    labelproject_raw=CheckDataset().dbClass.getOneLabelProjectById(4533)
    print(CheckDataset().exportCoCoData(labelproject_raw, 15484, has_median_data=True))

