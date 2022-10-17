import datetime
import math
import pathlib
import subprocess
import time
import urllib
import random

import chardet
import cv2
from PIL import ExifTags, Image
from bson import json_util

from src.errors.exceptions import APIException
from src.manageFile import ManageFile
from pandas.errors import ParserError

import numpy as np
import xml.etree.ElementTree as ET
import pandas as pd
import traceback
import os
from io import StringIO, BytesIO
import json
import shutil
import peewee
from playhouse.shortcuts import model_to_dict
from pytz import timezone

from src.errors import exceptions as ex
from models.helper import Helper, skyhub
from src.managePayment import ManagePayment
from src.manageUser import ManageUser
from src.util import Util
from src.errorResponseList import ErrorResponseList, NOT_ALLOWED_TOKEN_ERROR, WRONG_VOCDATA_ERROR, MIN_DATA_ERROR, \
    NORMAL_ERROR, EXCEED_DISKUSAGE_ERROR, TOO_MANY_ERROR_PROJECT, EXCEED_PROJECT_ERROR, EXCEED_FILE_SIZE, ENCODE_ERROR, \
    EXITS_FOLDER_ERROR, LABEL_DATA_ERROR, LABEL_FIlE_INFO_ERROR
from src.checkDataset import CheckDataset
from starlette.status import HTTP_200_OK, HTTP_503_SERVICE_UNAVAILABLE
from starlette.status import HTTP_201_CREATED
# from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
from datetime import datetime as DateTime
import struct
from models import rd

import os
from src.service.predictImage import PredictImage
errorResponseList = ErrorResponseList()

class ManageUpload:
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.payment_class = ManagePayment()
        self.utilClass = Util()
        self.manageUserClass = ManageUser()
        self.manageFileClass = ManageFile()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.predictImageClass = None
        if PredictImage:
            self.predictImageClass = PredictImage()

    def certify(self, key, passwd):
        privacy= self.utilClass.privacy
        passwd_dict = self.utilClass.passwd_dict

        if not privacy.get(key):
            message = f"누군가가 Aceess key를 잘못입력하였습니다. |"
            self.utilClass.sendSlackMessage(message, data_part=True)
            raise ex.NotAllowedKeyEx(key)
        else:
            user_name = privacy.get(key)
            if passwd_dict[user_name] != passwd:
                message = f"{user_name}님이 비밀번호를 잘못입력하였습니다. |"
                self.utilClass.sendSlackMessage(message, data_part=True)
                raise ex.NotAllowedPasswdEx(key)
            return user_name

    def check_error_for_upload_file(self, user, token):

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUpload\n 함수 : uploadFile \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        if self.dbClass.isUserHavingExceedErrorProjectCount(user):
            self.utilClass.sendSlackMessage(f"유저 ID : {user.get('id')} - 오류 프로젝트를 지나치게 많이 생성하고 있으니 조치바랍니다.", inquiry=True,
                                            userInfo=user)
            return TOO_MANY_ERROR_PROJECT

        if self.dbClass.isUserHavingExceedProjectCount(user):
            self.utilClass.sendSlackMessage(
                f"csv Parse - run() \n프로젝트 사용량 초과입니다 {user['email']} (ID: {user['id']})",
                appLog=True, userInfo=user)
            return EXCEED_PROJECT_ERROR

        if self.dbClass.isUserHavingExceedDiskUsage(user):
            self.utilClass.sendSlackMessage(
                f"csv Parse - run() \n디스크 사용량 초과입니다. {user['email']} (ID: {user['id']})",
                appLog=True, userInfo=user)
            return EXCEED_DISKUSAGE_ERROR

        if self.dbClass.isUserHavingTotaldDiskUsage(user):
            self.utilClass.sendSlackMessage(
                f"csv Parse - run() \n디스크 사용량 초과입니다. {user['email']} (ID: {user['id']})",
                appLog=True, userInfo=user)
            return EXCEED_DISKUSAGE_ERROR

    def clear_files(self, origin_file, unzipped_dir):
        if os.path.exists(origin_file):
            os.remove(origin_file)
        if unzipped_dir and os.path.exists(unzipped_dir):
            shutil.rmtree(unzipped_dir)

    def uploadFile(self, background_tasks, token, file, filename, frame_value, hasLabelData, predictColumnName,
                   dataconnectorName=None, dataconnectortype=None, has_de_identification=False):
        try:
            user = self.dbClass.getUser(token)
            user_id = self.utilClass.getStrUserId(user)

            self.check_error_for_upload_file(user, token)

            training_method = None
            value_for_predict = None
            y_class = None
            has_text_data = False
            has_image_data = False
            folders = []
            dataconnector = None
            project = None
            data_cnt = 0
            rows = []
            file_counts = {}
            data_column_index = 1
            origin_file = None
            unzipped_dir = None
            base_data = {}

            file_size = len(file)
            timestamp = time.strftime('%y%m%d%H%M%S')
            filename = self.utilClass.unquote_url(filename)
            file_name, file_type = os.path.splitext(filename)
            file_name = file_name[:50] if len(file_name) > 50 else file_name
            new_file_name = f'{timestamp}{file_name}{file_type}'

            if file_type in ['.mp4', '.mov']:
                sample_data = None
                file_type = '.video'
                hasLabelData = False
                has_image_data = True
                training_method = 'image'
                value_for_predict = 'label'

                file_info = {
                    'file': file,
                    'new_file_name': new_file_name,
                    'user_id': user_id,
                    'frame_value': frame_value
                }
                video_info = self.create_video_frames(file_info)
                df = video_info.get('df')
                data_cnt = len(df)
                origin_file = video_info.get('origin_file')
                unzipped_dir = video_info.get('unzipped_dir')
                file_size = video_info.get('total_size')
                base_data['unzipped_dir'] = unzipped_dir
            elif file_type == '.zip':
                origin_file = f'temp/{new_file_name}'
                unzipped_dir = os.path.splitext(origin_file)[0]
                self.get_origin_zip_file(origin_file, file)
                self.unzipFile(origin_file)
                sample_data = None
                has_image_data = True
                training_method = 'object_detection'
                value_for_predict = 'label'

                base_data = {
                    'unzipped_dir': unzipped_dir,
                    'file_name': filename
                }
                common_data = {
                    'user_id': user_id,
                    'workapp': training_method
                }
                base_data = self.manageFileClass.dataset_separator(base_data, common_data)

                if base_data['data_type'] == 'coco':
                    base_data['json_file_name'] = self.getJSONfile(origin_file)
                    response, body = CheckDataset().checkCoCoFile(filePath=base_data['json_file_name'])
                    if response == 503:
                        return response, body
                    df, y_class = self.readObjectDetectionJSONFile(base_data['json_file_name'])
                elif base_data['data_type'] == 'voc':
                    origin_dirs = base_data['origin_dirs']
                    voc_path = base_data['voc_path']
                    origin_dirs.sort(key=len, reverse=True)
                    root = f"{voc_path}/{origin_dirs[0]}"
                    label_files = list(pathlib.Path(root).glob('*.xml'))
                    df, y_class = self.readObjectDetectionVOCFile(label_files)
                else:
                    training_method = 'image'
                    for (root_dir, dir_names, file_names) in os.walk(unzipped_dir):
                        if '__MACOSX' in root_dir:
                            continue
                        folders.append(dir_names)
                        folder_name = ""
                        try:
                            folder_name = root_dir.split(f"/")[-1]
                        except:
                            pass
                        for name in file_names:
                            if '.' in name:
                                if name.lower().endswith(tuple(self.utilClass.imageExtensionName)):
                                    rows.append({
                                        'image': f"{folder_name}/{name}",
                                        'label': folder_name
                                    })
                                    if not file_counts.get(folder_name):
                                        file_counts[folder_name] = 0
                                    file_counts[folder_name] += 1
                    df = pd.DataFrame(rows)
                    y_class = [str(x) for x in list(df['label'].unique())] if y_class is None else y_class
                data_cnt = len(df)
                if unzipped_dir in y_class:
                    y_class.remove(unzipped_dir)
            elif file_type == '.csv':
                has_text_data = True

                df, data_cnt, file_size, req = self.readFile(file)
                sample_data = None
                if df is not None:
                    if not hasLabelData and predictColumnName in df.columns:
                        raise ex.ExistColumnNameEx(user['email'])
                    if predictColumnName not in df.columns:
                        df[predictColumnName] = None
                    else:
                        y_class = [str(x) for x in list(df[predictColumnName].unique())] if y_class is None else y_class
                    sample_data = json.dumps(df[:120].to_dict('records'))
                    sample_data = sample_data.replace("NaN", "null")

                if req == 503:  #csv 파일 크기 확인
                    self.utilClass.sendSlackMessage(
                        f"csv Parse - run() \n파일 용량이 제한을 초과하였습니다. {user['email']} (ID: {user['id']} 업로드 파일 크기 : {file_size})",
                        appLog=True, userInfo=user)
                    return EXCEED_FILE_SIZE

                if req == 500:
                    self.utilClass.sendSlackMessage(
                        f"csv Parse - run() \n파일 인코딩 도중 에러가 발생하였습니다. {user['email']} (ID: {user['id']})",
                        appLog=True, userInfo=user)
                    return ENCODE_ERROR

                origin_file = self.create_origin_csv(new_file_name, df)
            base_data['file_size'] = file_size

            if data_cnt < 10:
                print("MIN_DATA_ERROR")
                self.utilClass.sendSlackMessage(
                    f"파일 : manageUpload\n함수 : uploadFile \n데이터가 너무 적습니다. {user['email']} (ID: {user['id']})",
                    appLog=True, userInfo=user)
                self.clear_files(origin_file, unzipped_dir)

                return MIN_DATA_ERROR

            elif hasLabelData and not y_class:
                print("LABEL_FIlE_INFO_ERROR")
                self.utilClass.sendSlackMessage(
                    f"파일 : manageUpload\n함수 : uploadFile \n라벨 데이터가 없습니다. {user['email']} (ID: {user['id']}), "
                    f"hasLabelData: {hasLabelData}, hasYClass: {False if y_class is None else True}",
                    appLog=True, userInfo=user)
                self.clear_files(origin_file, unzipped_dir)

                return LABEL_FIlE_INFO_ERROR

            if self.utilClass.configOption == 'enterprise':
                s3_url = f'{self.utilClass.save_path}/user/{user_id}/raw/{new_file_name}'
            else:
                s3_url = urllib.parse.quote(f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{user_id}/raw/{new_file_name}').replace('https%3A//','https://')

            if dataconnectorName:
                if not dataconnectortype:
                    if '.csv' in new_file_name:
                        dataconnectortype_name = 'CSV'
                    elif '.zip' in new_file_name:
                        dataconnectortype_name = 'ZIP'
                    else:
                        dataconnectortype_name = 'Video'
                    dataconnectortype = self.dbClass.getOneDataconnectortypeByDataconnectortypename(dataconnectortype_name).id

                data = {
                    "dataconnectorName": self.utilClass.unquote_url(dataconnectorName),
                    "dataconnectortype": dataconnectortype,
                    "originalFileName": filename,
                    "trainingMethod": training_method,
                    "valueForPredict": value_for_predict,
                    "yClass": json.dumps(y_class),
                    "sampleData": sample_data,
                    "filePath": s3_url,
                    "user": user_id,
                    "hasImageData": has_image_data,
                    "hasTextData": has_text_data,
                    "fileSize": file_size,
                    "status": 1,
                    "hasLabelData": hasLabelData
                }

                dataconnector = self.dbClass.createDataconnector(data)
                print("dataconnector")
                print(dataconnector)

                data['id'] = dataconnector.id
                data['datetimeUTC'] = datetime.datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S")
                data['datetimeKST'] = (datetime.datetime.utcnow() + datetime.timedelta(hours=9)).strftime("%Y/%m/%d %H:%M:%S")
                data['log_type'] = 'create-dataconnector-log'

                self.dbClass.create_server_log(data)
                print("create_server_log")

                if background_tasks:
                    print("background_tasks")
                    print(background_tasks)
                    background_tasks.add_task(self.save_origin_data, origin_file, user_id, dataconnector.id)
                    save_data_dict = {
                                        'userId': user_id,
                                        'fileSize': file_size,
                                        'newFileName': new_file_name,
                                        'dataconnector': dataconnector,
                                        'user_email': user['email'],
                                        'hasLabelData': hasLabelData,
                                        'predictColumnName': predictColumnName,
                                        'df': df,
                                        'trainingMethod': training_method,
                                        'base_data': base_data,
                                        'file': file,
                                        'file_type': file_type,
                                        'has_de_identification': has_de_identification,
                                        'total_img_count': data_cnt
                    }
                    background_tasks.add_task(self.save_data, save_data_dict)
                else:
                    print("no background_tasks")
                    self.save_origin_data(origin_file, user_id, dataconnector.id)
                    dataconnector.status = 100
                    dataconnector.save()

                self.utilClass.sendSlackMessage(f"데이터 커넥터 추가합니다. {user['email']} , {self.utilClass.unquote_url(dataconnectorName)}", appLog=True, userInfo=user)

            else:
                self.clear_files(origin_file, unzipped_dir)

                project = self.dbClass.createProject({
                    "projectName": ".".join(filename.split(".")[:-1]),
                    "status": 0,
                    "statusText": "0: 예측 준비 중 입니다.",
                    "originalFileName": filename,
                    "trainingMethod": training_method,
                    "valueForPredict": value_for_predict,
                    "yClass": y_class,
                    "sampleData": sample_data,
                    "filePath": s3_url,
                    "user": user_id,
                    "hasImageData": has_image_data,
                    "hasTextData": has_text_data,
                    "option": "speed",
                    "fileSize": file_size,
                })

            if not self.utilClass.configOption == 'enterprise':
                self.dbClass.updateUserCumulativeDiskUsage(user_id, len(file))
                self.dbClass.updateUserTotalDiskUsage(user_id, len(file))
                # self.dbClass.updateUserUsedPrice(userId, amount)

            for i, column in enumerate(list(df.columns)):
                miss = df[column].isnull().sum()
                # print('컬럼명 : ', columns[i])
                data_object = {}
                if file_size < 300 * 1024 * 1024 * 1024:
                    data_object = self.utilClass.parseColumData(df[column], data_cnt)

                data_object = { **data_object,
                    "columnName": column,
                    "index": data_column_index,
                               "length": data_object.get('unique', 0) if column == 'label' and training_method in [
                                   'image', 'object_detection', 'cycle_gan'] else data_cnt,
                    "dataconnector": dataconnector.id if dataconnector else None,
                }
                data_column_index += 1

                self.dbClass.createDatacolumn(data_object)
            try:
                folder = folders[1] if folders[1] else folders[0]
                for index, xClass in enumerate(folder):
                    self.dbClass.createDatacolumn({
                        "columnName": xClass,
                        "index": data_column_index,
                        "length": file_counts.get(xClass, 0),
                        "miss": miss,
                        "unique": file_counts.get(xClass, 0),
                        "type": "object",
                        "freq": 1,
                        "isForGan": True,
                        "dataconnector": dataconnector.id if dataconnector else None,
                    })
                    data_column_index += 1
            except:
                pass
            print("all process pass")
            if project:
                return HTTP_200_OK, project.__dict__['__data__']
            else:
                return HTTP_200_OK, dataconnector.__dict__['__data__']

        except APIException as e:
            print("APIException")
            print(traceback.format_exc())
            # self.clear_files(origin_file, unzipped_dir)
            raise APIException(status_code=e.status_code, code=e.code, message=e.message, detail=e.detail)

        except peewee.OperationalError:
            print(traceback.format_exc())
            # self.clear_files(origin_file, unzipped_dir)
            skyhub.connect(reuse_if_open=True)
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile\n함수 : uploadFile \n peewee.OperationalError",
                appLog=True)
            return NORMAL_ERROR
            pass
        except KeyboardInterrupt:
            print(traceback.format_exc())
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile\n함수 : uploadFile \n KeyboardInterrupt",
                appLog=True)
            return NORMAL_ERROR
            pass
        except:
            # self.clear_files(origin_file, unzipped_dir)

            print(traceback.format_exc())
            self.utilClass.sendSlackMessage(str(traceback.format_exc()), appError=True)
            return NORMAL_ERROR

    def create_video_frames(self, file_info):

        file = file_info.get('file')
        new_file_name = file_info.get('new_file_name')
        user_id = file_info.get('user_id')
        frame_value = file_info.get('frame_value')
        rows = []

        new_dir_name, file_type = os.path.splitext(new_file_name)
        new_dir = f"{os.getcwd()}/temp/{new_dir_name}"
        os.mkdir(new_dir)
        origin_file = f'{new_dir}/{new_file_name}'

        with open(origin_file, 'wb') as open_file:
            open_file.write(file)

        frame_folder = f"{new_dir}/frames"
        os.mkdir(frame_folder)

        origin_file_path = os.path.join(origin_file)
        if os.path.isfile(origin_file_path):
            cap = cv2.VideoCapture(origin_file_path)
        else:
            raise ex.NotExistFileEx(user_id=user_id, obj="video")

        second = 60 / frame_value
        fps = cap.get(cv2.CAP_PROP_FPS)

        total_frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        frame_count = 1
        pos_frames = 0
        total_file_size = 0
        try:
            while True:
                ret_val, frame = cap.read()
                if not ret_val:
                    break
                cv2.imwrite(f'{frame_folder}/frame_{frame_count}.png', frame)
                frame_count += 1
                pos_frames += (second * fps)
                if pos_frames >= total_frame_count:
                    break
                cap.set(cv2.CAP_PROP_POS_FRAMES, pos_frames)
            if cap.isOpened():
                cap.release()
        except:
            print(traceback.format_exc())
            raise ex.FailedVedioCaptureEx()
        for (root_dir, dir_names, file_names) in os.walk(frame_folder):
            if '__MACOSX' in root_dir:
                continue
            # folders.append(dir_names)
            folder_name = ""
            try:
                folder_name = root_dir.split(f"/")[-1]
            except:
                pass
            for filename in file_names:
                if '.' in filename:
                    if filename.split('.')[-1].lower() in self.utilClass.imageExtensionName:
                        rows.append({
                            'image': f"{folder_name}/{filename}",
                            'label': None
                        })
                        total_file_size += os.path.getsize(f"{frame_folder}/{filename}")
        result = {
            'df': pd.DataFrame(rows),
            'origin_file': origin_file_path,
            'unzipped_dir': frame_folder,
            'total_size': total_file_size
        }

        return result

    def save_origin_data(self, origin_file, user_id, connector_id):

        try:
            if self.utilClass.configOption == 'enterprise':
                save_dir_path = f"{self.utilClass.save_path}/user/{user_id}/raw"
                os.makedirs(save_dir_path, exist_ok=True)
                shutil.move(origin_file, save_dir_path)

        except Exception as e:
            print(traceback.format_exc())
            self.utilClass.sendSlackMessage(
                f"파일 : manageUpload\n함수 : uploadFile \n원본 데이터 업로드 실패 \n 유저ID: {user_id}, 커넥터ID: {connector_id}\n error: {e}",
                appLog=True)

    def save_data(self, save_data_dict):
        print("save_data")

        user_id = save_data_dict.get('userId')
        file_name = save_data_dict.get('newFileName')
        connector_raw = save_data_dict.get('dataconnector')
        email = save_data_dict.get('user_email')
        has_label_data = save_data_dict.get('hasLabelData')
        predict_column_name = save_data_dict.get('predictColumnName')
        data_frame = save_data_dict.get('df')
        training_method = save_data_dict.get('trainingMethod')
        base_data = save_data_dict.get('base_data')
        file_type = save_data_dict.get('file_type')
        has_de_identification = save_data_dict.get('has_de_identification')
        total_img_count = save_data_dict.get('total_img_count')

        unzipped_dir = base_data.get('unzipped_dir')
        try:
            error_file_list = []

            user_id = user_id if type(user_id) == int else int(user_id)
            connector_id = connector_raw.id

            if file_type == '.csv':
                connector_raw.hasLabelData = True
                file_data = data_frame.to_dict('records')
                label_project_info = dict(
                    name=f"original_labelproject_{connector_id}",
                    description="original_data",
                    workapp="csv",
                    user=user_id,
                    last_updated_at=datetime.datetime.now(),
                    dataconnectorsList=str([connector_id]).replace(' ', ''),
                    visible=False
                )
                print("label_project_info")
                print(label_project_info)
                new_label_project = self.dbClass.createLabelProject(label_project_info)
                print("new_label_project")
                print(new_label_project)
                connector_raw.originalLableproject = new_label_project.id
                connector_raw.save()

                is_class = True
                try:
                    column_name_set_list = set()
                    for data in file_data:
                        if type(data[predict_column_name]) in [int, float]:
                            column_name = float(data[predict_column_name])
                        else:
                            column_name = str(data[predict_column_name])
                        column_name_set_list.add(column_name)
                    if len(column_name_set_list) > 100:
                        connector_raw.trainingMethod = "normal_regression"
                        connector_raw.yClass = '[]'
                        is_class = False
                except:
                    pass

                class_dict = {}
                create_ds2data_object = []
                create_label_ds2data_object = []

                if has_label_data and is_class:
                    for class_name in column_name_set_list:
                        if type(class_name) == float and class_name % 1 == 0:
                            class_name = int(class_name)
                        color = self.get_random_hex_color()
                        class_raw = self.dbClass.createLabelclass(
                            {"name": class_name, "color": color, 'labelproject': new_label_project.id,
                             "user": user_id})
                        class_dict[class_name] = class_raw.id

                delete_column = False
                if file_data and predict_column_name in list(file_data[0].keys()):
                    delete_column = True

                total_progress = len(file_data) if file_data else 1
                progress = 0
                for idx, data in enumerate(file_data):
                    for key in list(data.keys()):
                        if '.' in key:
                            data[key.replace('.', self.utilClass.dot_encode_key)] = data.pop(key)

                    label_class_id = None
                    if has_label_data:
                        predict_column_name = predict_column_name.replace('.', self.utilClass.dot_encode_key)
                        labelData = {predict_column_name: data[predict_column_name]}
                        status = "done"
                        status_sort_code = 20
                        if is_class:
                            label_class_id = class_dict[data[predict_column_name]]
                    else:
                        labelData = {predict_column_name: None}
                        status = "prepare"
                        status_sort_code = 0

                    if delete_column:
                        del data[predict_column_name]

                    create_ds2data_object.append({
                                        "user": user_id,
                                        "created_at": datetime.datetime.utcnow(),
                                        "updated_at": datetime.datetime.utcnow(),
                                        "dataconnector": connector_id,
                                        "rawData": data,
                                        "labelData": labelData,
                                        "fileType": "csv",
                                        "status_sort_code": status_sort_code,
                                        "labelclass": label_class_id,
                                        "status": status,
                                        "file_name": file_name,
                                        "original_file_name": file_name[12:]
                                    })

                    new_progress = int((idx + 1) / total_progress * 100 / 10) * 10
                    if progress != new_progress:
                        progress = new_progress
                        connector_raw.progress = progress
                        connector_raw.save()

                self.dbClass.createFile(create_ds2data_object)
                for data in create_ds2data_object:
                    data.update({"reviewer": None,
                        "isDeleted": False,
                        "workAssignee": None,
                        "user": user_id,
                        "labelproject": new_label_project.id,
                        "ds2data": data['id']})
                    create_label_ds2data_object.append(data)

                self.dbClass.createLabelprojectFile(create_label_ds2data_object)
                connector_raw.originalLabelproject = new_label_project.id
                connector_raw.save()

                if os.path.isfile(f'temp/{file_name}'):
                    os.remove(f'temp/{file_name}')
            #   1. 라벨링 있는 이미지 분류
            #   2. 라벨링 없는 이미지 분류
            #   3. 라벨링 있는 물체 인식
            #   4. 영상 파일
            elif file_type in ['.zip', '.video']:
                #   1. 라벨링 있는 이미지 분류
                if has_label_data and training_method != 'object_detection':
                    class_name_list = []
                    class_name_dict = {}

                    label_project_info = dict(
                        name=f"original_labelproject_{connector_id}",
                        description="original_data",
                        workapp=training_method,
                        user=user_id,
                        last_updated_at=datetime.datetime.now(),
                        dataconnectorsList=str([connector_id]).replace(' ', ''),
                        visible=False
                    )
                    new_label_project = self.dbClass.createLabelProject(label_project_info)
                    connector_raw.originalLabelproject = new_label_project.id
                    connector_raw.save()
                    total_progress = total_img_count
                    progress = 0
                    idx = 0
                    for (dir_path, dir_names, image_names) in os.walk(unzipped_dir):
                        if '__MACOSX' in dir_path:
                            continue
                        for image_name in image_names:
                            if not image_name.lower().endswith((".jpg", ".jpeg", ".png")):
                                continue
                            timestamp = time.strftime('%y%m%d%H%M%S')
                            file_name, file_ext = os.path.splitext(image_name)
                            new_image_name = f"{file_name}{timestamp}{file_ext}"
                            s3Folder = f"user/{user_id}/{connector_id}/{file_name}{timestamp}"
                            width, height, im, file_size = self.getImageSize(f'{dir_path}/{image_name}')

                            # image_name = self.utilClass.unquote_url(image_name)
                            if self.utilClass.configOption == 'enterprise':
                                self.s3.upload_file(f'{dir_path}/{image_name}', self.utilClass.bucket_name,
                                                    f'{s3Folder}{file_ext}')
                                s3key = f"{self.utilClass.save_path}/{s3Folder}{file_ext}"
                            else:
                                self.s3.upload_file(f'{dir_path}/{image_name}', self.utilClass.bucket_name,
                                                    f'{s3Folder}{file_ext}')
                                s3key = urllib.parse.quote(
                                    f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3Folder}.{image_name.split(".")[-1]}').replace(
                                    'https%3A//', 'https://')

                            class_name = data_frame['label'][
                                data_frame['image'].apply(lambda x: x.split('/')[-1] == image_name)].values[0]

                            object = {
                                "fileName": new_image_name,
                                "originalFileName": file_name,
                                "fileSize": file_size,
                                "user": user_id,
                                "width": width,
                                "height": height,
                                "s3key": s3key,
                                "created_at": datetime.datetime.utcnow(),
                                "updated_at": datetime.datetime.utcnow(),
                                "fileType": f"{training_method}",
                                "dataconnector": connector_id,
                                "labelData": class_name
                            }

                            self.dbClass.createFile(object)

                            if class_name not in class_name_list:
                                color = self.get_random_hex_color()
                                class_raw = self.dbClass.createLabelclass(
                                    {"name": class_name, "color": color, 'labelproject': new_label_project.id,
                                     "user": user_id})
                                class_name_dict[class_name] = class_raw.id
                                class_name_list.append(class_name)

                            status = "done" if class_name and has_label_data else "prepare"
                            status_sort_code = 20 if status == "done" else 0
                            object.update({"labelproject": new_label_project.id, "status": status,
                                           "status_sort_code": status_sort_code, "ds2data": object['id'],
                                           "labelclass": class_name_dict[class_name]})
                            del object['id']
                            self.dbClass.createLabelprojectFile(object)
                            new_progress = int((idx + 1) / total_progress * 100 / 10) * 10
                            if progress != new_progress:
                                progress = new_progress
                                connector_raw.progress = progress
                                connector_raw.save()
                            idx += 1
                    if os.path.isdir(unzipped_dir):
                        shutil.rmtree(unzipped_dir)
                else:
                    label_project_info = dict(
                        name=f"original_labelproject_{connector_id}",
                        description="original_data",
                        workapp=training_method,
                        user=user_id,
                        last_updated_at=datetime.datetime.utcnow(),
                        dataconnectorsList=str([connector_id]).replace(' ', ''),
                        visible=False
                    )
                    new_label_project = self.dbClass.createLabelProject(label_project_info)

                    common_data = {
                        "user_id": user_id,
                        "labelproject_id": new_label_project.id,
                        "email": email,
                        "labelproject_name": new_label_project.name,
                        'workapp': new_label_project.workapp,
                        'has_de_identification': has_de_identification
                    }
                    #   3. 라벨링 있는 물체 인식
                    if has_label_data and training_method == 'object_detection':
                        if base_data['data_type'] == "coco":
                            error_file_list = self.manageFileClass.upload_coco_folder(base_data, common_data, connector_id)
                        elif base_data['data_type'] == "voc":
                            error_file_list = self.manageFileClass.upload_voc_folder(base_data, common_data, connector_id)
                        connector_raw.originalLabelproject = new_label_project.id
                        connector_raw.save()
                    #   2. 라벨링 없는 이미지 분류
                    #   4. 영상 파일
                    else:
                        common_data['workapp'] = training_method
                        connector_raw.originalLabelproject = new_label_project.id
                        connector_raw.save()
                        error_file_list = self.manageFileClass.upload_image_folder(base_data, common_data, connector_id)

                    if os.path.isdir(base_data['unzipped_dir']):
                        shutil.rmtree(base_data['unzipped_dir'])
            status = 100
            if len(error_file_list):
                if 'json' in error_file_list:
                    status = 99
            connector_raw.status = status
            connector_raw.save()
        except:
            print(traceback.format_exc())
            connector_raw.status = 99
            self.utilClass.sendSlackMessage(f"파일 : manageUpload\n함수 : uploadFile \n user:{user_id} \n dataconnector:{connector_raw.id}\n{str(traceback.format_exc())}", appError=True)
            connector_raw.hasLabelData = False
            connector_raw.save()
            status = 99
        finally:
            data = {
                'taskName': f'{connector_raw.dataconnectorName}',
                'taskType': 'uploadDataConnector',
                'status': status,
                'user': user_id,
                'isChecked': 0,
                'statusText': json.dumps({'failFileList': error_file_list})
            }
            self.dbClass.createAsyncTask(data)

            data = {"dataconnectorName": connector_raw.dataconnectorName,
                    "dataconnectortype": connector_raw.dataconnectortype,
                    "originalFileName": connector_raw.originalFileName, "trainingMethod": connector_raw.trainingMethod,
                    "valueForPredict": connector_raw.valueForPredict, "yClass": connector_raw.yClass,
                    "sampleData": connector_raw.sampleData, "filePath": connector_raw.filePath,
                    "user": connector_raw.user, "hasImageData": connector_raw.hasImageData,
                    "hasTextData": connector_raw.hasTextData, "fileSize": connector_raw.fileSize,
                    "status": connector_raw.status, "hasLabelData": connector_raw.hasLabelData,
                    'datetimeUTC': datetime.datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S"),
                    'datetimeKST': (datetime.datetime.utcnow() + datetime.timedelta(hours=9)).strftime(
                        "%Y/%m/%d %H:%M:%S"), 'log_type': 'create-dataconnector-log'}

            self.dbClass.create_server_log(data)

    def getImageSize(self, filePath):
        for orientation in ExifTags.TAGS.keys():
            if ExifTags.TAGS[orientation] == 'Orientation':
                break

        im = Image.open(filePath)
        file_size = os.path.getsize(filePath)

        if im.format == 'GIF':
            mypalette = im.getpalette()
            im.putpalette(mypalette)
            new_im = Image.new("RGB", im.size)
            new_im.paste(im)
            new_im.save(filePath)
            im = Image.open(filePath)
            file_size = os.path.getsize(filePath)

        exif = im._getexif()
        if exif and exif.get(orientation, False):
            if exif[orientation] == 3:
                image = im.rotate(180, expand=True)
            elif exif[orientation] == 6:
                image = im.rotate(270, expand=True)
            elif exif[orientation] == 8:
                image = im.rotate(90, expand=True)
            else:
                image = im
        else:
            image = im

        width = image.width
        height = image.height

        return width, height, image, file_size

    def projectFromLabeling(self, token, labelprojectId, trainColumnInfo={}):

        user = self.dbClass.getUser(token)
        userId = self.utilClass.getStrUserId(user)

        labelProjectRaw = self.dbClass.getLabelProjectsById(labelprojectId)
        labelclassCount = self.dbClass.getNotDeletedLabelClassesCountByLabelProjectId(labelprojectId)
        sthreefileCount = self.dbClass.getDoneSthreeFilesCountByLabelProjectId(labelprojectId)

        minimumCount = False
        minimumlabelclass = []
        yClass = []

        if labelclassCount <= 0 or sthreefileCount <= 100:
            minimumCount = True
        else:
            for x in self.dbClass.getLabelClassesByLabelProjectId(labelprojectId):
                x = x.__dict__['__data__']
                if len(trainColumnInfo):
                    if trainColumnInfo.get(str(x.id), False):
                        if self.dbClass.getDoneLabelCountBylabelclassId(x['id'], labelProjectRaw.workapp) < 10:
                            minimumlabelclass.append(x['id'])
                            minimumCount = True
                        else:
                            yClass.append(x['name'])
                else:
                    yClass.append(x['name'])

        if minimumCount:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUpload\n함수 : uploadFile \n데이터가 너무 적습니다. {user['email']} (ID: {user['id']})",
                appLog=True, userInfo=user)
            return MIN_DATA_ERROR

        labelprojectInfo = labelProjectRaw.__dict__['__data__']

        try:
            temp = self.dbClass.getOneFolderById(labelprojectInfo['folder'])['folderName']
        except:
            self.utilClass.sendSlackMessage(
                f"csv Parse - runFromLabelling() \n데이터 폴더가 존재하지 않습니다. {user['email']} (ID: {user['id']})",
                appLog=True, userInfo=user)
            return EXITS_FOLDER_ERROR

        project = self.dbClass.createProject({
            "projectName": labelprojectInfo['name'],
            "status": 1,
            "statusText": "1: 인공지능 개발이 시작되었습니다.",
            "trainingMethod": 'object_detection',
            "valueForPredict": 'label',
            "user": userId,
            "hasImageData": True,
            "hasTextData": False,
            "labelproject": labelprojectInfo['id'],
            "yClass": json.dumps(yClass, indent=1, ensure_ascii=False) if yClass else None,
            "option": 'speed'
        })

        project = project.__dict__['__data__']

        CheckDataset().exportCoCoData(labelProjectRaw, None, projectId=project['id'])

        self.utilClass.sendSlackMessage(
            f"오토라벨링 프로젝트가 생성되었습니다. {user['email']} (ID: {user['id']}) , 라벨링 프로젝트 : {labelProjectRaw.name} (ID: {labelProjectRaw.id}) , AI 프로젝트 ID: {project['id']}",
            appLog=True, userInfo=user)

        return HTTP_201_CREATED, project

    def collect_api(self, token, dataconnector_id, data=None, file=None):
        user = self.dbClass.getUser(token)
        kst = timezone('Asia/Seoul')

        if not user:
            raise ex.NotFoundUserEx(token)

        dataconnector_raw = self.dbClass.getOneDataconnectorById(dataconnector_id)

        if not dataconnector_raw or dataconnector_raw.user != user['id']:
            raise ex.NotAllowedTokenEx(user['email'])
        newObjectDict = {
            "user": user['id'],
            "created_at": kst.localize(datetime.datetime.now()),
            "updated_at": kst.localize(datetime.datetime.now()),
            "status": "prepare",
            "isDeleted": False,
            "dataconnector": dataconnector_id,
            "workAssignee": None
        }

        if data:
            #todo : rawData의 key값 인코딩하는걸로 바꿔야 함
            newObjectDict.update({
                "rawData": data,
                "labelData": None,
                "fileType": 'csv'
            })
        elif file:
            file_name = file.filename
            file = file.file.read()
            s3Folder = f"user/{user['id']}/{dataconnector_id}/{os.path.splitext(file_name)[0]}"
            timestamp = time.strftime('%y%m%d%H%M%S')

            with open(f'{os.getcwd()}/temp/{file_name}', 'wb') as open_file:
                open_file.write(file)

            self.s3.put_object(Body=file, Bucket=self.utilClass.bucket_name,
                               Key=f'{s3Folder}{timestamp}.{file_name.split(".")[-1]}')

            s3key = urllib.parse.quote(
                f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3Folder}{timestamp}.{file_name.split(".")[-1]}').replace(
                'https%3A//', 'https://')

            if self.utilClass.configOption == 'enterprise':
                s3key = f'{self.utilClass.save_path}/{s3Folder}{timestamp}.{file_name.split(".")[-1]}'

            for orientation in ExifTags.TAGS.keys():
                if ExifTags.TAGS[orientation] == 'Orientation':
                    break

            im = Image.open(f'{os.getcwd()}/temp/{file_name}')

            exif = im._getexif()
            if exif and exif.get(orientation, False):
                if exif[orientation] == 3:
                    image = im.rotate(180, expand=True)
                elif exif[orientation] == 6:
                    image = im.rotate(270, expand=True)
                elif exif[orientation] == 8:
                    image = im.rotate(90, expand=True)
                else:
                    image = im
            else:
                image = im

            width = image.width
            height = image.height
            newObjectDict.update({
                "fileName": file_name,
                "fileSize": len(file),
                "width": width,
                "height": height,
                "s3key": s3key,
                "originalFileName": file_name,
                "fileType": 'image'
            })

            os.remove(f'{os.getcwd()}/temp/{file_name}')

        else:
            raise ex.NotExistFileEx()

        newObject = self.dbClass.createFile(newObjectDict)

        return HTTP_201_CREATED, newObject

    # def runFromRoute(self, token, route, dataconnectorName=None, dataconnectortype=None):
    #
    #     s3Url = urllib.parse.quote(f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{route}').replace('https%3A//','https://')
    #     fileRoute = f'{self.utilClass.save_path}/{str(round(time.time() * 1000))}_' + s3Url.split("/")[-1]
    #     self.s3.download_file(self.utilClass.bucket_name, "/".join(s3Url.split("/")[3:]), fileRoute)
    #     file = open(fileRoute, 'rb').read()
    #     filename = s3Url.split("/")[-1]
    #     return self.run(token,file, filename, dataconnectorName=dataconnectorName, dataconnectortype=dataconnectortype)

    # def runFromRouteImage(self, token, folder, labelFolders, dataconnectorName=None, dataconnectortype=None):
    #
    #     user = self.dbClass.getUser(token)
    #     userId = self.utilClass.getStrUserId(user)
    #
    #     if not userId:
    #         self.utilClass.sendSlackMessage(
    #             f"csv Parse - runFromRouteImage Error \n허용되지 않은 토큰 값입니다. token : {token})",
    #             appLog=True)
    #         return NOT_ALLOWED_TOKEN_ERROR
    #
    #     if self.dbClass.isUserHavingExceedErrorProjectCount(user):
    #         self.utilClass.sendSlackMessage(f"유저 ID : {userId} - 오류 프로젝트를 지나치게 많이 생성하고 있으니 조치바랍니다.", inquiry=True)
    #         return HTTP_429_TOO_MANY_REQUESTS, {
    #             "statusCode": 429,
    #             "error": "Bad Request",
    #             "message": "에러 프로젝트가 많이 생성되어 하루간 프로젝트 생성이 제한됩니다."
    #         }
    #
    #     if self.dbClass.isUserHavingExceedProjectCount(user):
    #         return EXCEED_PROJECT_ERROR
    #
    #     if self.dbClass.isUserHavingExceedDiskUsage(user):
    #         return EXCEED_DISKUSAGE_ERROR
    #
    #     if self.dbClass.isUserHavingTotaldDiskUsage(user):
    #         return EXCEED_DISKUSAGE_ERROR
    #
    #     df = pd.DataFrame({})
    #     contents = []
    #     dataconnector = None
    #     project = None
    #
    #     tempFileName = f'labels_{str(round(time.time() * 1000))}.csv'
    #     route = "user/" + userId + "/" + folder
    #
    #     for labelFolder in labelFolders:
    #         s3Folder = route + labelFolder
    #
    #         listObject = self.s3.list_objects_v2(Bucket=self.utilClass.bucket_name, Prefix=s3Folder)
    #         contents = [x['Key'].split(route)[1] for x in listObject.get("Contents", [])]
    #         df2 = pd.DataFrame({'image': contents, })
    #         df2['label'] = labelFolder.split('/')[0]
    #         df = df.append(df2, ignore_index=True)
    #
    #     tempFile, fileSize, newFileName = self.getTempFileAndSize(tempFileName, df)
    #
    #     self.s3.upload_file(tempFile, self.utilClass.bucket_name, route + tempFileName)
    #     s3Url = urllib.parse.quote(f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{route}{tempFileName}').replace('https%3A//','https://')
    #     os.remove('temp/' + tempFileName)
    #
    #     self.dbClass.updateUserCumulativeDiskUsage(userId, fileSize)
    #     self.dbClass.updateUserTotalDiskUsage(userId, fileSize)
    #     sampleData = json.dumps(df.sample(frac=1).iloc[0:120].to_dict('records'))
    #
    #     if dataconnectorName:
    #
    #         dataconnector = self.dbClass.createDataconnector({
    #             "dataconnectorName": self.utilClass.unquote_url(dataconnectorName),
    #             "dataconnectortype": dataconnectortype,
    #             "originalFileName": tempFileName,
    #             "sampleData": sampleData,
    #             "filePath": s3Url,
    #             "user": userId,
    #             "trainingMethod": 'image',
    #             "valueForPredict": 'label',
    #             "hasImageData": True,
    #             "fileSize": fileSize,
    #         })
    #
    #     else:
    #
    #         project = self.dbClass.createProject({
    #             "projectName": "인공지능 개발 : 폴더명 " + folder,
    #             "status": 0,
    #             "statusText": "0: 예측 준비 중 입니다.",
    #             "originalFileName": tempFileName,
    #             "sampleData": sampleData,
    #             "filePath": s3Url,
    #             "user": userId,
    #             "trainingMethod": 'image',
    #             "valueForPredict": 'label',
    #             "hasImageData": True,
    #             "fileSize": fileSize,
    #         })
    #
    #     self.dbClass.createDatacolumn({
    #         "columnName" : 'image',
    #         "index" : '1',
    #         "length" : len(contents),
    #         "type" : 'Object',
    #         "dataconnector" : dataconnector.id if dataconnector else None,
    #     })
    #
    #     self.dbClass.createDatacolumn({
    #         "columnName" : 'label',
    #         "index" : '2',
    #         "length" : len(contents),
    #         "type" : 'Object',
    #         "dataconnector" : dataconnector.id if dataconnector else None,
    #     })
    #
    #     return HTTP_200_OK, project.__dict__['__data__']

    def readFile(self, filess=None):
        fileSize = len(filess)

        try:
            dataByte = b"\n".join(filess.split(b'\n'))

            try:
                encodingCode = chardet.detect(dataByte)
                if encodingCode['encoding'] == 'EUC-KR':
                    encodingCode = 'cp949'
                elif encodingCode.get('encoding'):
                    encodingCode = encodingCode['encoding']
                else:
                    encodingCode = 'UTF-8'
            except:
                encodingCode = 'UTF-8'
            temp = dataByte.decode(encodingCode, "ignore").strip()
            df = pd.read_csv(StringIO(temp), encoding='UTF-8', error_bad_lines=False, warn_bad_lines=False)
            if len(df.columns) == 1 and '\t' in temp:
                try:
                    df = pd.read_csv(StringIO(temp), encoding='UTF-8', error_bad_lines=False, warn_bad_lines=False, sep='\t')
                except:
                    pass
            # df = pd.DataFrame(newdata[1:],columns=newdata[0])
        except MemoryError:
            df = None
            return None, None, fileSize, 200
            pass
        except ParserError:
            try:
                df = pd.read_csv(StringIO(temp), encoding='UTF-8', error_bad_lines=False, warn_bad_lines=False, engine='python')
            except:                df = pd.read_csv(StringIO(temp), encoding='cp949', error_bad_lines=False, warn_bad_lines=False)
            pass
        except Exception as e:  # df 리스트 전환 에러
            print(traceback.format_exc())
            return 0, 0, 0, 500
            pass
        # 컬럼 데이터가 없을 경우
        df = df.replace(' ', '')
        df = df.dropna(how='all', axis=1)
        df = df.dropna(how='any', axis=0)
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

    def convertInt64(self, o):
        if isinstance(o, np.int64): return int(o)
        raise TypeError

    def getColumnData(self, df,fileSize=0,dataCnt=0):

        obj = []
        columns = list(df.columns)
        # 컬럼별 확인
        for i in range(0, len(columns)):
            # print('컬럼명 : ', columns[i])
            if fileSize < 300 * 1024 * 1024:
                dataObject = self.utilClass.parseColumData(df[columns[i]],dataCnt)
            else:
                dataObject = {
                "columnName" : '',
                "index" : '',
                "length" :  '',
                "miss" : '',
                "unique" : '',
                "type" : '',
                "min" : '',
                "max" : '',
                "std" : '',
                "mean" : '',
                "top" : '',
                "freq" : '',
                }
            dataObject["columnName"] = columns[i]
            dataObject["index"] = str(i + 1)

            obj.append(dataObject)
        return json.dumps(obj, ensure_ascii=False, default=self.convertInt64)

    def get_origin_zip_file(self, origin_file, file):

        with open(origin_file, 'wb') as open_file:
            open_file.write(file)

    def create_origin_csv(self, new_file_name, df):

        origin_file = f'temp/{new_file_name}'
        df.to_csv(origin_file, index=False)

        return origin_file

    def readObjectDetectionJSONFile(self, filePath):

        with open(filePath) as json_file:
            data = json.load(json_file)

            df = pd.DataFrame({})

            for annotation in data.get('annotations', []):
                new_df = pd.DataFrame.from_dict([{'image': annotation.get('image_id'), 'label': annotation.get('category_id')}])
                df = pd.concat([df, new_df])
            df = df.replace(' ', '').dropna(how='all', axis=1)
            categories = []
            for categoryRaw in data.get('categories', []):
                categories.append(categoryRaw.get('name', ''))

            return df, categories

    def readObjectDetectionVOCFile(self, label_files):

        categories = set()
        df = pd.DataFrame({})
        for label_file in label_files:
            objects, object_dicts = self.manageFileClass.read_xml(label_file)
            categories.update(objects)
            for object_dict in object_dicts:
                df = df.append({'image': object_dict.get('filename'), 'label': object_dict.get('class')},
                               ignore_index=True)
                df = df.replace(' ', '').dropna(how='all', axis=1)

        return df, list(categories)

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

        try:
            if list(df.columns)[-1].strip() == '':
                df.drop(df.columns[-1], axis=1, inplace=True)
        except:
            print(traceback.format_exc())
            pass

        return df

    def unzipFile(self, filePath):

        path_to_zip_file = filePath
        directory_to_extract_to = os.path.splitext(filePath)[0]
        import zipfile
        with zipfile.ZipFile(path_to_zip_file, 'r') as zip_ref:
            zipInfo = zip_ref.infolist()
            for member in zipInfo:
                try:
                    member.filename = member.filename.encode('cp437').decode('utf-8', 'ignore')
                except UnicodeEncodeError:
                    pass
                if ('__MACOSX' in member.filename) or ('.DS_Store' in member.filename):
                    continue
                result = zip_ref.extract(member, directory_to_extract_to)
        return result

    def getJSONfile(self, filePath):
        getFolderPath = os.path.splitext(filePath)[0]
        matchedJSONfile = None
        folderName = None
        for root, dirs, files in os.walk(getFolderPath):
            if '__MACOSX' in root:
                continue
            for file in files:
                if '.json' in file:
                    matchedJSONfile = root + "/" + file
        return matchedJSONfile  #temp/ImageTest/trainval.json

    def get_random_hex_color(self):
        random_number = random.randint(0, 16777215)
        hex_number = format(random_number, 'x')
        hex_number = '#' + hex_number
        return hex_number

    def runMovieAsync(self, modelId, file, filename, appToken, userId,
                      isMarket=False, opsId=None, modeltoken=None, marketProjectId=None, isStandardMovie=False, sync_cut_at=0, creation_time=None):

        filename = self.utilClass.unquote_url(filename)
        ATOM_HEADER_SIZE = 8
        EPOCH_ADJUSTER = 2082844800

        if self.dbClass.isUserHavingExceedPredictCount(modelId):
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "예측 기능 사용량 초과입니다."
            }

        if modeltoken:
            user = self.dbClass.getUserByModelTokenAndModelId(modeltoken, modelId)
            if not user:
                return HTTP_503_SERVICE_UNAVAILABLE, {
                    "statusCode": 503,
                    "error": "Bad Request",
                    "message": "앱 토큰을 잘 못 입력하였습니다."
                }
            appToken = user.appTokenCode

        appToken = self.dbClass.getMasterAppToken(modelId, appToken, userId, isMarket=isMarket, opsId=opsId)

        if not appToken:
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "앱 토큰을 잘 못 입력하였습니다."
            }

        user = self.dbClass.getUserByAppToken(appToken)

        if opsId and not self.utilClass.opsId:
            url = self.getOpsURL(opsId)
            # url = "loadv3-171751883.ap-northeast-1.elb.amazonaws.com" #TODO: TEST
            if url:
                return self.sendToOwnInferenceServer(url, 'inferencemovieasync', modelId, opsId, appToken, userId,
                                                     filename=filename, file=file)

        model = self.getModelInfo(modelId, isMarket=isMarket, opsId=opsId)
        s3Url = None
        try:
            time_stamp = time.strftime('%y%m%d%H%M%S')
            temp_file = os.getcwd() + f'/temp/{time_stamp}{filename}'
            with open(temp_file, 'wb') as open_file:
                open_file.write(file)

            if isMarket:
                market_project_raw = self.dbClass.getMarketProjectsById(marketProjectId)
                if 'offline' in market_project_raw.service_type:
                    video_base_time = 1800
                elif 'training' in market_project_raw.service_type:
                    video_base_time = 600
                vcap = cv2.VideoCapture(temp_file)  # 0=camera
                fps = vcap.get(cv2.CAP_PROP_FPS)
                fps1 = vcap.get(cv2.CAP_PROP_FRAME_COUNT)

                length = round(fps1 / fps) - sync_cut_at
                upload_usage = self.dbClass.get_upload_usage(userId, datetime.datetime.utcnow().date())
                # if user.video_upload_available_usage <= user.video_upload_daily_usage + length:
                if isStandardMovie is False and upload_usage + length >= video_base_time and 'training' in market_project_raw.service_type:
                    return EXCEED_DISKUSAGE_ERROR

                split_count = math.ceil(length/ video_base_time)

                if creation_time is None:
                    with open(temp_file, "rb") as f:
                        while True:
                            atom_header = f.read(ATOM_HEADER_SIZE)
                            if atom_header[4:8] == b'moov':
                                break  # found
                            else:
                                atom_size = struct.unpack('>I', atom_header[0:4])[0]
                                f.seek(atom_size - 8, 1)

                        atom_header = f.read(ATOM_HEADER_SIZE)
                        if atom_header[4:8] == b'cmov':
                            raise RuntimeError('moov atom is compressed')
                        elif atom_header[4:8] != b'mvhd':
                            raise RuntimeError('expected to find "mvhd" header.')
                        else:
                            f.seek(4, 1)
                            creation_time = struct.unpack('>I', f.read(4))[0] - EPOCH_ADJUSTER
                            creation_time = DateTime.fromtimestamp(creation_time)
                            if creation_time.year < 1900:  # invalid or censored data
                                creation_time = None

                            modification_time = struct.unpack('>I', f.read(4))[0] - EPOCH_ADJUSTER
                            modification_time = DateTime.fromtimestamp(modification_time)
                            if modification_time.year < 1900:  # invalid or censored data
                                modification_time = None
                else:
                    creation_time = datetime.datetime.strptime(creation_time, '%Y-%m-%d %H:%M:%S')

                if creation_time is None:
                    raise ex.NotExistCreateTimeEx(userId)

                for count in range(0, split_count):
                    if count == 0 and sync_cut_at:
                        start_min = sync_cut_at
                    elif count == 0:
                        start_min = 0
                    else:
                        start_min = video_base_time * count

                    time_stamp = time.strftime('%y%m%d%H%M%S')
                    export_file = os.getcwd() + f'/temp/{time_stamp}_cut_{filename}'
                    end_min = length if video_base_time * (count+1) > length else video_base_time*(count+1)
                    # ffmpeg_extract_subclip(temp_file, start_min, end_min, targetname=export_file)
                    self.s3.upload_file(export_file, self.utilClass.bucket_name,
                                        f"user/{userId}/{time_stamp}{filename}")
                    s3Url = urllib.parse.quote(
                        f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{userId}/{time_stamp}{filename}').replace(
                        'https%3A//', 'https://')
                    if self.utilClass.configOption == 'enterprise':
                        s3Url = f'{self.utilClass.save_path}/user/{userId}/{time_stamp}{filename}'

                    os.remove(export_file)

                    async_task = self.dbClass.createAsyncTask({
                        "taskName": "runMovie_" + filename,
                        "taskType": "runMovie",
                        "status": 0,
                        "model": modelId,
                        "user": userId,
                        "marketproject": marketProjectId,
                        "isStandardMovie": isStandardMovie,
                        "inputFilePath": s3Url,
                        "sync_cut_at": start_min,
                        "duration": end_min - start_min,
                        "file_creation_time": creation_time if creation_time is not None else modification_time
                    })

                    if rd:
                        rd.publish("broadcast", json.dumps(model_to_dict(async_task), default=json_util.default, ensure_ascii=False))


            else:
                self.s3.upload_file(temp_file, self.utilClass.bucket_name, f"user/{userId}/{time_stamp}{filename}")
                s3Url = urllib.parse.quote(
                    f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{userId}/{time_stamp}{filename}').replace(
                    'https%3A//', 'https://')

                if self.utilClass.configOption == 'enterprise':
                    s3Url = f'{self.utilClass.save_path}/user/{userId}/{time_stamp}{filename}'

                async_task = self.dbClass.createAsyncTask({
                    "taskName": "runMovie_" + filename,
                    "taskType": "runMovie",
                    "status": 0,
                    "model": modelId,
                    "user": userId,
                    "marketproject": marketProjectId,
                    "isStandardMovie": isStandardMovie,
                    "inputFilePath": s3Url,
                })

                if rd:
                    rd.publish("broadcast", json.dumps(model_to_dict(async_task), default=json_util.default, ensure_ascii=False))

            os.remove(temp_file)

            if isStandardMovie:
                market_project = self.dbClass.getMarketProjectsById(marketProjectId)
                market_project.standardFilePath = s3Url
                market_project.save()

            return HTTP_201_CREATED, {}


        except:
            self.utilClass.sendSlackMessage(
                f"유저 id: {model['project'].get('user')}, 프로젝트 id: {model['project'].get('id')}, 모델 id: {model.get('id')}",
                appError=True)
            self.utilClass.sendSlackMessage(
                f"프로젝트 name: {model['project'].get('projectName')}, 모델 name: {model.get('name')}",
                appError=True)
            self.utilClass.sendSlackMessage(str(traceback.format_exc()), appError=True)

    def getModelInfo(self, modelId, isMarket=False, opsId=None):
        if isMarket:
            model = self.dbClass.getOneMarketModelById(modelId).__dict__['__data__']
            model['project'] = self.dbClass.getOneMarketProjectById(model['project'])
        elif opsId:
            model = self.dbClass.getOneLastestOpsModelByOpsProjectId(opsId).__dict__['__data__']
            model['project'] = self.dbClass.getOneOpsProjectById(opsId)
        else:
            model = self.dbClass.getOneModelById(modelId)
            model['project'] = self.dbClass.getOneProjectById(model['project'])
        return model
