import ast
import datetime
import glob
import io
import json
import pathlib
import shutil
import time
import asyncio
import traceback
import subprocess
import urllib
import chardet
from xml.etree.ElementTree import parse
import numpy as np

import cv2
import pandas as pd
import os

from io import StringIO
from pandas.errors import ParserError
from playhouse.shortcuts import model_to_dict
from pytz import timezone
from starlette.responses import StreamingResponse
from PIL import Image, ExifTags

from api_wrapper.metabase_wrapper import MetabaseAPI
from src.checkDataset import CheckDataset
from src.collecting.connectorHandler import ConnectorHandler
from src.managePayment import ManagePayment
from src.manageUser import ManageUser
from src.util import Util
from models.helper import Helper, labelprojectsTable, projectsTable
from fastapi.encoders import jsonable_encoder
from starlette.status import HTTP_200_OK, HTTP_204_NO_CONTENT
from starlette.status import HTTP_201_CREATED, HTTP_503_SERVICE_UNAVAILABLE
from starlette.status import HTTP_507_INSUFFICIENT_STORAGE
from src.errorResponseList import NOT_FOUND_USER_ERROR, NOT_ALLOWED_TOKEN_ERROR, NOT_ALLOWED_INPUT_ERROR, \
    PERMISSION_DENIED_CONNECTOR_ERROR, \
    NON_EXISTENT_CONNECTOR_ERROR, MIN_DATA_ERROR, NORMAL_ERROR, ErrorResponseList, KEY_FIlE_INFO_ERROR, PIL_IOERROR, \
    TOO_MANY_ERROR_PROJECT, EXCEED_PROJECT_ERROR, ALREADY_DELETED_OBJECT
from src.errors import exceptions as ex
import random
import urllib.request

errorResponseList = ErrorResponseList()


# TODO: 숫자 헤더면 바꿔줘야됨
class ManageFile:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.manageUserClass = ManageUser()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.payment_class = ManagePayment()
        pd.options.display.float_format = '{:.5f}'.format

    def listObject(self, token, labelprojectId, sorting, page, count, tab, desc, searching, workAssignee=None,
                   is_label_app=None):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : ManageFile\n 함수 : listObject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True)
            return NOT_ALLOWED_TOKEN_ERROR

        labelprojectRaw = self.dbClass.getLabelProjectsById(labelprojectId)

        is_shared = False
        role = None
        if labelprojectRaw.user != user['id']:
            shared_label_projects = []
            for temp in self.dbClass.getSharedLabelprojectIdByUserId(user['id']):
                if temp.labelprojectsid and int(labelprojectId) in ast.literal_eval(temp.labelprojectsid):
                    shared_label_projects = list(set(shared_label_projects + ast.literal_eval(temp.labelprojectsid)))

                    group_user = self.dbClass.getMemberByUserIdAndGroupId(user['id'], temp.id)
                    if group_user and role != 'admin':
                        role = role if role == 'subadmin' and group_user.role != 'admin' else group_user.role

            if int(labelprojectId) not in shared_label_projects:
                raise ex.NotAllowedTokenEx(user['email'])
            is_shared = False if role in ['subadmin', 'admin'] else True

        objectLists = {
            "file": [],
            "workAssignee": [],
        }
        if labelprojectRaw.dataconnectorsList:
            labelprojectRaw.dataconnectorsList = ast.literal_eval(labelprojectRaw.dataconnectorsList)
            objectLists["file"], totalCount = self.dbClass.getSthreeFilesByLabelprojectIdToPagenate(labelprojectRaw.id,
                                                                                                    sorting, tab, desc,
                                                                                                    searching, page,
                                                                                                    count, workAssignee,
                                                                                                    is_label_app,
                                                                                                    is_shared,
                                                                                                    user['email'])
            for file in objectLists["file"]:
                if file.get('rawData'):
                    for key in list(file['rawData'].keys()):
                        if self.utilClass.dot_encode_key in key:
                            file['rawData'][key.replace(self.utilClass.dot_encode_key, '.')] = file['rawData'].pop(key)

            objectLists["workAssignee"] = self.dbClass.getWorkAssigneeByLabelprojectId(labelprojectRaw.id)
            objectLists["workAssignee"] = list(filter(None, objectLists["workAssignee"]))
            objectLists["totalCount"] = totalCount
            objectLists['role'] = role

        return HTTP_200_OK, objectLists

    def certify(self, key, passwd):
        privacy = self.utilClass.privacy
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

    def upload_image_file_to_s3(self, key, password, files):
        self.certify(key, password)

        result = {}

        for file in files:
            timestamp = time.strftime('%y%m%d%H%M%S')
            file_name = file.filename
            file = file.file.read()
            self.s3.put_object(Body=file, Bucket=self.utilClass.bucket_name, Key=f"asset/song/{timestamp}{file_name}")
            s3Url = urllib.parse.quote(
                f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/asset/front/img/{file_name}').replace(
                'https%3A//', 'https://')
            result[file_name] = s3Url

        return HTTP_200_OK, result

    def add_object(self, token, background_tasks, files, labelproject_id, frame_value, has_de_identification):
        status = HTTP_201_CREATED
        status_msg = 'Success'
        user = self.dbClass.getUser(token)
        if not user:
            raise ex.NotFoundUserEx(token)

        user_id = user['id']
        labelproject_raw = self.dbClass.getLabelProjectsById(labelproject_id)

        if labelproject_raw.user != user['id']:
            raise ex.NotAllowedTokenEx(user['email'])

        labelproject_name = labelproject_raw.name
        dataconnectors_list = ast.literal_eval(labelproject_raw.dataconnectorsList)
        main_connector_id = dataconnectors_list[0]
        timestamp = time.strftime('%y%m%d%H%M%S')
        temp_folder = f"{os.getcwd()}/temp/{timestamp}"
        os.mkdir(temp_folder)

        labelproject_id = labelproject_id if type(labelproject_id) == int else int(labelproject_id)

        common_data = {
            "user_id": user_id,
            "labelproject_id": labelproject_id,
            "email": user['email'],
            "labelproject_name": labelproject_name,
            "temp_folder": temp_folder,
            "frame_value": frame_value,
            'workapp': labelproject_raw.workapp,
            'has_de_identification': has_de_identification
        }

        column_info = None

        if labelproject_raw.workapp in ['normal_classification', 'text', 'normal_regression']:
            raw_data = self.dbClass.getOneLabelprojectFileByCondition({'labelproject': labelproject_id})
            column_info = {'labelData': list(raw_data['labelData'].keys()), 'rawData': list(raw_data['rawData'].keys())}
            column_info['columnList'] = column_info['labelData'] + column_info['rawData']

        try:
            base_data_list, total_file_size, file_list = self.check_data(files, common_data)
            if self.utilClass.configOption != 'enterprise':
                amount_dict, _, _ = self.payment_class.get_usage_amount_by_user(user)
                before_amount = amount_dict['total_price']
                add_amount = self.manageUserClass.get_upload_amount(user, total_file_size)
                amount = before_amount + add_amount
                if self.dbClass.isUserHavingExceedDiskUsage(user,
                                                            total_file_size) or self.dbClass.isUserHavingTotaldDiskUsage(
                    user, total_file_size):
                    labelproject_raw.status = 9
                    labelproject_raw.save()
                    raise ex.ExceedDiskusageEx(user_id=user_id)
        except ex.APIException as e:
            status = e.status_code
            status_msg = e.detail
            shutil.rmtree(temp_folder)
        except Exception as e:
            print(traceback.format_exc(e))
            status = e.status
            status_msg = e.msg
            shutil.rmtree(temp_folder)
        else:
            dataconnectors_dict = {}
            for file_dict in file_list:
                if file_dict['file_name'].endswith((".jpg", ".jpeg", ".png")):
                    dataconnector_id = main_connector_id
                else:
                    dataconnector_id = self.create_dataconnector(file_dict['file'], file_dict['file_name'], user,
                                                                 common_data.get('frame_value', 0))
                dataconnectors_dict[file_dict['file_name']] = dataconnector_id
                dataconnectors_list.append(dataconnector_id)
            labelproject_raw.dataconnectorsList = str(dataconnectors_list).replace(' ', '')
            labelproject_raw.save()
            common_data['dataconnectors'] = dataconnectors_dict

            background_tasks.add_task(self.upload_data, base_data_list, common_data, column_info)

        finally:
            return status, {'status_msg': status_msg}

    def check_data(self, files, common_data):
        base_data_list = []
        total_file_size = 0
        file_list = []

        for fileObject in files:
            file = fileObject.file.read()
            file_name = fileObject.filename
            file_list.append({"file": file, "file_name": file_name})
            file_size = len(file)

            temp_file = f"{common_data['temp_folder']}/{file_name}"

            base_data = {}
            base_data['temp_file'] = temp_file
            base_data['file_name'] = file_name
            base_data['file_size'] = file_size
            user_id = common_data['user_id']

            is_zip = True if file_name.split('.')[-1].lower() in self.utilClass.compressionExtensionName else False

            if is_zip:
                with open(temp_file, 'wb') as f:
                    f.write(file)
                self.unzipFile(temp_file)
                base_data['unzipped_dir'] = os.path.splitext(temp_file)[0]
                base_data = self.dataset_separator(base_data, common_data)
                base_data_list.append(base_data)
            else:
                if file_name.lower().endswith((".csv")):
                    base_data['data_type'] = 'table'
                elif file_name.lower().endswith((".jpg", ".jpeg", ".png")):
                    base_data['data_type'] = 'image'
                elif file_name.lower().endswith((".mp4", ".mov")):
                    base_data['data_type'] = 'video'
                    if common_data['frame_value'] is None or common_data['frame_value'] > 600 or common_data[
                        'frame_value'] < 1:
                        raise ex.NotAllowFrameValueEx(user_id=user_id)
                    if file_size > self.utilClass.video_max_size:
                        raise ex.ExceedFileSizeEx(user_id=user_id)
                else:
                    continue
                base_data_list.append(base_data)
                with open(temp_file, "wb") as buffer:
                    buffer.write(file)
            total_file_size += file_size

        return base_data_list, total_file_size, file_list

    def dataset_separator(self, base_data, common_data):

        user_id = common_data['user_id']
        base_data['data_type'] = None
        img_path = None

        for root, dirs, files in os.walk(base_data['unzipped_dir']):
            if '__MACOSX' in root:
                continue
            for file in files:
                if img_path is not None:
                    break
                if file.lower().endswith((".jpg", ".jpeg", ".png")):
                    img_path = root

            if "camera_config" in dirs: #detection_3d separator
                base_data['data_type'] = "detection_3d"
                base_data['root_dir'] = root

            else:
                if len(dirs) > 2:
                    is_voc, voc_path, origin_dirs = self.check_exists_voc(root, dirs, base_data['file_name'],
                                                                          common_data['user_id'])
                    if is_voc:
                        if base_data['data_type'] is None:
                            base_data['data_type'] = 'voc'
                            base_data['voc_path'] = voc_path
                            base_data['origin_dirs'] = origin_dirs
                            break
                        else:
                            raise ex.TooManyExistFileEx(user_id=user_id)

                if len(files) > 0:
                    has_json = False
                    for file in files:
                        if file.lower().endswith(".json"):
                            has_json = True
                    if has_json:
                        is_coco, json_data = self.check_exists_coco(root)
                        # if is_coco is None:
                        #     if base_data['data_type'] is None:
                        #         base_data['data_type'] = "detection_3d"
                        if is_coco:
                            if base_data['data_type'] is None:
                                base_data['data_type'] = 'coco'
                                base_data['json_data'] = json_data
                                break
                            else:
                                raise ex.TooManyExistFileEx(user_id=user_id)

        if base_data['data_type'] is None:
            if img_path is None:
                raise ex.NotExistImageEx(user_id=user_id)
            base_data['data_type'] = 'images'
            base_data['img_path'] = img_path
        elif common_data['workapp'] == 'image':
            base_data['data_type'] = 'images'

        return base_data

    def check_exists_voc(self, voc_path, dirs, file_name, user_id):
        origin_dirs = []
        voc_dirs = ['annotations', 'jpegimages', 'imagesets']
        lower_dirs = [x.lower() for x in dirs]
        has_images = False
        if set(voc_dirs).issubset(set(lower_dirs)):
            for tmp_dir in dirs:
                if tmp_dir.lower() in voc_dirs:
                    if tmp_dir.lower() == voc_dirs[0]:
                        root = f"{voc_path}/{tmp_dir}"
                        label_files = list(pathlib.Path(root).glob('*.xml'))
                        if len(label_files) == 0:
                            raise ex.NotExistFileEx(user_id=user_id, obj=f"{file_name}에 xml")
                    elif tmp_dir.lower() == voc_dirs[1]:
                        root = f"{voc_path}/{tmp_dir}"
                        images = list(pathlib.Path(root).glob('*.jpg')) + list(
                            pathlib.Path(root).glob('*.jpeg')) + list(pathlib.Path(root).glob("*.png"))
                        if len(images) > 0:
                            has_images = True
                    origin_dirs.append(tmp_dir)

            if not has_images:
                raise ex.NotExistFileEx(user_id=user_id, obj=f"{file_name}에 이미지 파일")
            return True, voc_path, origin_dirs
        return False, None, None

    def check_exists_coco(self, root):
        json_file_list = list(pathlib.Path(f"{root}").glob('*.json'))
        if len(json_file_list) > 1:
            return None, None
        elif len(json_file_list) == 0:
            return False, None
        with open(json_file_list[0]) as json_file:
            json_data = json.load(json_file)
            if type(json_data) == list:
                return False, None
            if json_data.get('result'):
                return False, None
            if json_data.get('images', False) and json_data.get('categories', False) and json_data.get('annotations',
                                                                                                       False):
                return True, json_data

    def upload_data(self, base_data_list, common_data, column_info=None):

        print("upload_data")
        user_id = common_data['user_id']
        labelproject_name = common_data['labelproject_name']
        labelproject_id = common_data['labelproject_id']
        temp_folder = common_data['temp_folder']

        data = {
            'taskName': f'{labelproject_name}',
            'taskType': 'addObject',
            'status': 1,
            'labelproject': labelproject_id,
            'user': user_id,
            'outputFilePath': '',
            'isChecked': 0
        }
        self.dbClass.createAsyncTask(data)
        success_file_size = 0
        error_file_list = []

        try:
            for base_data in base_data_list:
                file_name = base_data['file_name']
                data_type = base_data['data_type']
                connector_id = common_data['dataconnectors'][file_name]

                if data_type == "coco":
                    error_file_list = self.upload_coco_folder(base_data, common_data, connector_id,
                                                              is_labelproject=True)
                elif data_type == "voc":
                    error_file_list = self.upload_voc_folder(base_data, common_data, connector_id, is_labelproject=True)
                elif data_type == "images":
                    error_file_list = self.upload_image_folder(base_data, common_data, connector_id,
                                                               is_labelproject=True)
                elif data_type == "image":
                    error_file_list = self.upload_image_file(base_data, common_data, connector_id, is_labelproject=True)
                elif data_type == "video":
                    error_file_list = self.upload_video_file(base_data, common_data, connector_id, is_labelproject=True)
                elif data_type == "table":
                    error_file_list = self.upload_csv_file(base_data, common_data, connector_id, column_info)

                self.dbClass.updateUserTotalDiskUsage(user_id, success_file_size)
                self.dbClass.updateUserCumulativeDiskUsage(user_id, success_file_size)
                # user = self.dbClass.get_user_by_id(user_id)
                # amount = self.manageUserClass.get_upload_amount(user, success_file_size)
                # self.dbClass.updateUserUsedPrice(user_id, amount)

        except:
            print(traceback.format_exc())
            status = 99
        else:
            status = 100
        finally:
            data = {
                'taskName': f'{labelproject_name}',
                'taskType': 'addObject',
                'status': status,
                'labelproject': labelproject_id,
                'user': user_id,
                'isChecked': 0,
                'statusText': json.dumps({'failFileList': error_file_list})
            }
            self.dbClass.createAsyncTask(data)
            if os.path.isdir(temp_folder):
                shutil.rmtree(temp_folder)

    def upload_video_file(self, base_data, common_data, connector_id, is_labelproject=False):
        # TODO: 프레임 이미지 파일 총 용량 계산 후 디스크 사용량 에러 추가

        user_id = common_data['user_id']
        temp_folder = common_data['temp_folder']
        temp_file = base_data["temp_file"]
        file_name = base_data["file_name"]
        frame_value = common_data['frame_value']

        frame_folder = f"{temp_folder}/frames"
        base_data['unzipped_dir'] = frame_folder
        os.mkdir(frame_folder)

        filePath = os.path.join(temp_file)
        if os.path.isfile(filePath):
            cap = cv2.VideoCapture(filePath)
        else:
            raise ex.NotExistFileEx(user_id=user_id, obj="video")

        second = 60 / frame_value
        fps = cap.get(cv2.CAP_PROP_FPS)

        total_frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        frame_count = 1
        pos_frames = 0
        while True:
            retval, frame = cap.read()
            if not (retval):
                break
            cv2.imwrite(f'{frame_folder}/{os.path.splitext(file_name)[0]}_{frame_count}.png', frame)
            frame_count += 1
            pos_frames += (second * fps)
            if pos_frames >= total_frame_count:
                break
            cap.set(cv2.CAP_PROP_POS_FRAMES, pos_frames)
        if cap.isOpened():
            cap.release()
        cv2.destroyAllWindows()

        base_data['img_path'] = frame_folder
        base_data['temp_file'] = frame_folder
        return self.upload_image_folder(base_data, common_data, connector_id, is_labelproject)

    def upload_image_file(self, base_data, common_data, connector_id, is_labelproject=False):
        user_id = common_data["user_id"]
        temp_file = base_data["temp_file"]
        file_name = base_data["file_name"]
        file_size = base_data["file_size"]

        timestamp = time.strftime('%y%m%d%H%M%S')
        file_name, file_ext = os.path.splitext(file_name)
        s3Folder = f"user/{user_id}/{connector_id}/{file_name}"
        newfile_name = f"{file_name}{timestamp}{file_ext}"
        width, height, im = self.getImageSize(f'{temp_file}')
        fail_file_list = []

        try:
            file_name = self.utilClass.unquote_url(file_name)

            if common_data['has_de_identification'] and common_data['workapp'] == 'object_detection':
                im = self.getFaceDetect(im, half=True)
                im.save(f'{temp_file}')

            if self.utilClass.configOption == 'enterprise':
                s3Folder = f"{user_id}/{connector_id}/{file_name}"
                s3key = f'{s3Folder}{timestamp}{file_ext}'
                self.s3.upload_file(temp_file, 'enterprise', s3key)
                s3key = f'{self.utilClass.save_path}/{s3key}'
            else:
                self.s3.upload_file(f"{temp_file}", self.utilClass.bucket_name,
                                    f'{s3Folder}{timestamp}{file_ext}')
                s3key = urllib.parse.quote(
                    f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3Folder}{timestamp}{file_ext}').replace(
                    'https%3A//', 'https://')

            new_object_dict = {
                "fileName": newfile_name,
                "fileSize": file_size,
                "user": user_id,
                "width": width,
                "height": height,
                "s3key": s3key,
                "originalFileName": f'{file_name}{file_ext}',
                "created_at": datetime.datetime.utcnow(),
                "updated_at": datetime.datetime.utcnow(),
                "fileType": common_data['workapp'],
                "dataconnector": connector_id
            }
            self.dbClass.createFile(new_object_dict)

            ds2data_id = new_object_dict['id']
            del new_object_dict['id']
            new_object_dict.update({
                "status": "prepare",
                "workAssignee": None,
                "status_sort_code": 0,
                "isDeleted": False,
                "reviewer": None,
                "ds2data": ds2data_id,
                "labelproject": common_data['labelproject_id']
            })
            self.dbClass.createLabelprojectFile(new_object_dict)
        except Exception as e:
            if not is_labelproject:
                print("=================데이터 커넥터 파일 에러 체크=================")
                print(traceback.format_exc())
                print("=================데이터 커넥터 파일 에러 체크=================")
                raise e
            fail_file_list.append(file_name)

        if not is_labelproject:
            return new_object_dict
        else:
            return fail_file_list

    def upload_csv_file(self, base_data, common_data, connector_id, column_info=None):

        user_id = common_data["user_id"]
        temp_file = base_data["temp_file"]
        file_name = base_data["file_name"]

        timestamp = time.strftime('%y%m%d%H%M%S')
        only_file_name, file_ext = os.path.splitext(file_name)
        s3Folder = f"user/{user_id}/{connector_id}/{only_file_name}"

        if self.utilClass.configOption == 'enterprise':
            s3Folder = f"user/{user_id}/{connector_id}/{file_name}"
            s3key = f'{s3Folder}{timestamp}{file_ext}'
            self.s3.upload_file(temp_file, 'enterprise', s3key)
            s3key = urllib.parse.quote(f'{self.utilClass.save_path}/{s3key}').replace('https%3A//', 'https://')

        else:
            self.s3.upload_file(f"{temp_file}", self.utilClass.bucket_name,
                                f'{s3Folder}{timestamp}{file_ext}')
            s3key = urllib.parse.quote(
                f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3Folder}{timestamp}{file_ext}').replace(
                'https%3A//', 'https://')

        dataframe = pd.read_csv(temp_file, sep=",")

        if column_info:
            for col in dataframe.columns:
                if col not in column_info['columnList']:
                    dataframe.drop(col, axis=1)
            predict_column = column_info['labelData'][0]

            if column_info['labelData'] and column_info['labelData'][0] not in list(dataframe.columns):
                dataframe.loc[:, column_info['labelData'][0]] = None

        record = dataframe.to_dict('records')
        kst = timezone('Asia/Seoul')
        create_objects_list = []
        create_labelproject_objects_list = []
        fail_idx_list = []
        label_class_dict = {x.name: x.id for x in
                            self.dbClass.getLabelClassesByLabelProjectId(common_data['labelproject_id'])}
        structure = self.dbClass.get_csv_structure_by_labelproject_id(common_data['labelproject_id'])

        for idx, data in enumerate(record):

            status = "prepare"
            status_sort_code = 0
            labelData = None
            work_assignee = None
            label_class = None

            has_continue = False

            for key in data.keys():
                if key == predict_column:
                    continue
                if structure.get(key) is None:
                    has_continue = True
                    break
                else:
                    if data.get(key) is None:
                        has_continue = True
                        break
            if has_continue:
                fail_idx_list.append(f'Row {idx + 1}')
                continue

            if predict_column:
                if data.get(predict_column) and not np.isnan(data.get(predict_column)):
                    work_assignee = common_data['email']
                    status = "done"
                    status_sort_code = 20
                    if type(data[predict_column]) == float and data[predict_column] % 1 == 0:
                        class_name = int(data[predict_column])
                    else:
                        class_name = data[predict_column]

                    if not label_class_dict.get(str(class_name)):
                        color = self.get_random_hex_color()
                        class_raw = self.dbClass.createLabelclass(
                            {"name": str(class_name), "color": color, 'labelproject': common_data['labelproject_id'],
                             "user": user_id})
                        label_class = class_raw.id
                        label_class_dict[str(class_name)] = class_raw.id
                    else:
                        label_class = label_class_dict[str(class_name)]
                else:
                    data[predict_column] = None

                labelData = {predict_column: data[predict_column]}
                del data[predict_column]

            create_objects_list.append(
                {
                    "status": status,
                    "status_sort_code": status_sort_code,
                    "user": user_id,
                    "created_at": kst.localize(datetime.datetime.now()),
                    "updated_at": kst.localize(datetime.datetime.now()),
                    "dataconnector": connector_id,
                    "rawData": data,
                    "labelclass": label_class,
                    "labelData": labelData,
                    "workAssignee": work_assignee,
                    "fileType": common_data['workapp']
                }
            )
        if len(create_objects_list) > 0:
            create_objects_list = self.dbClass.createFile(create_objects_list)

            for data in create_objects_list:
                ds2data_id = data['id']
                del data['id']
                data.update({
                    "isDeleted": False,
                    "reviewer": None,
                    "ds2data": ds2data_id,
                    "labelproject": common_data['labelproject_id']
                })
                create_labelproject_objects_list.append(data)
            self.dbClass.createLabelprojectFile(create_labelproject_objects_list)

        return fail_idx_list

    def upload_image_folder(self, base_data, common_data, connector_id, is_labelproject=False):

        user_id = common_data['user_id']
        ds2data = []
        labelproject_ds2data = []
        fail_file_list = []
        if not is_labelproject:
            connector_raw = self.dbClass.getOneDataconnectorById(connector_id)

        uploaded_file_size = 0
        progress = 0
        for root, dirs, images in os.walk(base_data['unzipped_dir']):
            if '__MACOSX' in root:
                continue
            for idx, image in enumerate(images):
                try:
                    if not image.lower().endswith((".jpg", ".jpeg", ".png")):
                        continue
                    temp_file = f"{root}/{image}"
                    image = self.utilClass.unquote_url(image)
                    file_name, file_ext = os.path.splitext(image)
                    file_size = os.path.getsize(temp_file)

                    timestamp = time.strftime('%y%m%d%H%M%S')

                    s3Folder = f"user/{user_id}/{connector_id}/{file_name}"
                    newfile_name = f"{file_name}{timestamp}{file_ext}"
                    width, height, im = self.getImageSize(f'{temp_file}')

                    if common_data.get('has_de_identification'):
                        im = self.getFaceDetect(im, half=True)
                        im.save(f'{temp_file}')

                    if self.utilClass.configOption == 'enterprise':
                        s3Folder = f"user/{user_id}/{connector_id}/{file_name}"
                        s3key = f'{s3Folder}{timestamp}{file_ext}'
                        self.s3.upload_file(temp_file, 'enterprise', s3key)
                        s3key = f'{self.utilClass.save_path}/{s3key}'

                    else:
                        self.s3.upload_file(f"{temp_file}", self.utilClass.bucket_name,
                                            f'{s3Folder}{timestamp}{file_ext}')
                        s3key = urllib.parse.quote(
                            f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3Folder}{timestamp}{file_ext}').replace(
                            'https%3A//', 'https://')

                    new_object_dict = {
                        "fileName": newfile_name,
                        "fileSize": file_size,
                        "user": user_id,
                        "width": width,
                        "height": height,
                        "s3key": s3key,
                        "originalFileName": f'{file_name}{file_ext}',
                        "created_at": datetime.datetime.utcnow(),
                        "updated_at": datetime.datetime.utcnow(),
                        "fileType": common_data['workapp'],
                        "dataconnector": connector_id
                    }
                    ds2data.append(new_object_dict)
                    if not is_labelproject:
                        uploaded_file_size += file_size
                        new_progress = int((idx + 1 / len(images)) * 10) * 10
                        # if base_data.get('file_size'):
                        #     new_progress = int((uploaded_file_size / base_data.get('file_size')) * 10) * 10
                        if progress != new_progress and new_progress != 100:
                            progress = new_progress
                            connector_raw.progress = progress
                            connector_raw.save()

                except Exception as e:
                    # if not is_labelproject:
                    # raise e
                    print(traceback.format_exc())
                    fail_file_list.append(image)
        self.dbClass.createFile(ds2data)
        for data in ds2data:
            ds2data_id = data['id']
            del data['id']
            data.update({
                "status": "prepare",
                "workAssignee": None,
                "status_sort_code": 0,
                "isDeleted": False,
                "reviewer": None,
                "ds2data": ds2data_id,
                "labelproject": common_data['labelproject_id']
            })
            labelproject_ds2data.append(data)
        self.dbClass.createLabelprojectFile(labelproject_ds2data)

        if not is_labelproject:
            connector_raw.progress = 100
            connector_raw.save()

        if len(labelproject_ds2data) == 0:
            raise ex.NotExistFileEx(user_id=user_id, obj="이미지 파일")

        return fail_file_list


    def upload_3d_folder(self, base_data, common_data, connector_id, is_labelproject=False):

        user_id = common_data['user_id']
        user_email = common_data['email']
        labelproject_id = common_data['labelproject_id']
        root_dir = base_data['root_dir']
        categories_dict = {}
        ds2datas = []
        labelproject_ds2datas = []
        labels = []
        preprocessing_json_data = {}
        file_path_dict = {}
        fail_file_list = []


        # 3d

        if not is_labelproject:
            connector_raw = self.dbClass.getOneDataconnectorById(connector_id)

        try:
            total_progress = len(glob.glob(f"{root_dir}/*"))
            progress = 0
            for root, dirs, files in os.walk(root_dir):
                if '__MACOSX' in root:
                    continue
                for idx, file in enumerate(files):
                    try:
                        file_size = os.path.getsize(f"{root}/{file}")
                        # timestamp = time.strftime('%y%m%d%H%M%S')
                        file_name, file_ext = os.path.splitext(file)
                        if not preprocessing_json_data.get(file):
                            preprocessing_json_data[file_name] = {'labels': []}
                        # newfileName = f"{file_name}{timestamp}{file_ext}"
                        filePath = f'{root}/{file}'
                        file_path_dict[file] = filePath

                        s3Folder = f"user/{user_id}/{connector_id}/{root.split('/')[-1]}"
                        # s3key = f'{s3Folder}{timestamp}{file_ext}'
                        # s3key = f'{s3Folder}{file_ext}'
                        # self.s3.upload_file(f'{root}/{file}', 'enterprise', s3key)
                        s3key = urllib.parse.quote(f'{self.utilClass.save_path}/{s3Folder}/{file}').replace(
                            'https%3A//',
                            'https://')
                        self.s3.upload_file(f'{root}/{file}', 'enterprise', s3key)
                        if file.lower().endswith((".pcd")):
                            # if file.lower().endswith((".jpg", ".jpeg", ".png")):
                            data = {
                                "fileName": f"{root.split('/')[-1]}/{file}",  # or f"{s3Folder}/{file}"?
                                "fileSize": file_size,
                                "user": user_id,
                                "s3key": s3key,
                                "originalFileName": file,
                                "created_at": datetime.datetime.utcnow(),
                                "updated_at": datetime.datetime.utcnow(),
                                "fileType": common_data['workapp'],
                                "dataconnector": connector_id,
                            }
                            ds2datas.append(data)
                            preprocessing_json_data[file_name].update(data)
                        elif 'classes.json' in file:
                            with open(filePath, 'r') as r:
                                classes_raw = json.load(r)
                                for category in classes_raw:
                                    is_exist = False
                                    labelclasses = [x.__dict__['__data__'] for x in
                                                    self.dbClass.getLabelClassesByLabelProjectId(labelproject_id)]
                                    for labelclass in labelclasses:
                                        if labelclass['name'] == category['name']:
                                            labelclass_id = labelclass['id']
                                            is_exist = True
                                    if not is_exist:
                                        color = self.get_random_hex_color()
                                        data = {'name': category['name'], 'color': color,
                                                'labelproject': labelproject_id}
                                        new_labelclass = self.dbClass.createLabelclass(data)
                                        labelclass_id = new_labelclass.id
                                    categories_dict[category['id']] = labelclass_id
                    except Exception as e:
                        fail_file_list.append(file)
                        self.utilClass.sendSlackMessage(traceback.format_exc())

            for root, dirs, files in os.walk(root_dir):
                if '__MACOSX' in root:
                    continue
                for idx, file in enumerate(files):
                    try:
                        file_size = os.path.getsize(f"{root}/{file}")
                        # timestamp = time.strftime('%y%m%d%H%M%S')
                        file_name, file_ext = os.path.splitext(file)
                        if not preprocessing_json_data.get(file_name):
                            preprocessing_json_data[file_name] = {'labels': []}
                        # newfileName = f"{file_name}{timestamp}{file_ext}"
                        filePath = f'{root}/{file}'
                        file_path_dict[file] = filePath

                        s3Folder = f"user/{user_id}/{connector_id}/{root.split('/')[-1]}"
                        # s3key = f'{s3Folder}{timestamp}{file_ext}'
                        # s3key = f'{s3Folder}{file_ext}'
                        # self.s3.upload_file(f'{root}/{file}', 'enterprise', s3key)
                        s3key = urllib.parse.quote(f'{self.utilClass.save_path}/{s3Folder}/{file}').replace(
                            'https%3A//',
                            'https://')
                        if 'result' in root:
                            with open(filePath, 'r') as r:
                                classes_raw = json.load(r)

                                for annotation in classes_raw['result']['objects']:

                                    label_data = {
                                        'color': '#ff000',
                                        'status': 'done', 'user': user_id,
                                        'workAssignee': user_id,
                                        'labelclass': categories_dict.get(annotation['classType']) if annotation['classType'] else 0,
                                    }
                                    label_data.update(annotation)
                                    preprocessing_json_data[file_name]['labels'].append(label_data)

                                if not is_labelproject:
                                    new_progress = int(((idx + 1) / (total_progress)) * 8) * 10
                                    if progress != new_progress:
                                        progress = new_progress
                                        connector_raw.progress = progress
                                        connector_raw.save()
                    except Exception as e:
                        fail_file_list.append(file)
                        self.utilClass.sendSlackMessage(traceback.format_exc())

        except Exception as e:
            print(traceback.format_exc())
            fail_file_list.append('json')
            shutil.rmtree(root_dir)
            return fail_file_list

        if not is_labelproject:
            connector_raw.progress = 90
            connector_raw.save()

        if len(ds2datas) > 0:
            self.dbClass.createFile(ds2datas)

            for data in ds2datas:
                ds2data_id = data['id']
                del data['id']
                data.update({
                    "status": "prepare",
                    "status_sort_code": 0,
                    "workAssignee": None,
                    "isDeleted": False,
                    "reviewer": None,
                    "ds2data": ds2data_id,
                    "labelproject": labelproject_id
                })
                labelproject_ds2datas.append(data)
            self.dbClass.createLabelprojectFile(labelproject_ds2datas)

            for data in labelproject_ds2datas:
                json_key = data['originalFileName']
                file_name, file_ext = os.path.splitext(json_key)
                #

                if preprocessing_json_data.get(file_name):
                    [label_info.update({'labelproject': labelproject_id, 'sthreefile': data['id']}) for label_info
                     in preprocessing_json_data[file_name]['labels']]

                    if preprocessing_json_data[file_name]['labels']:
                        labels += preprocessing_json_data[file_name]['labels']
                        update_sthree_data = {'status': 'done', 'workAssignee': user_email}
                        self.dbClass.updateSthreeFileById(data['id'], update_sthree_data)

            if labels:
                self.dbClass.createLabel(labels)

        connector_raw.progress = 100
        connector_raw.save()

        return fail_file_list

    def upload_coco_folder(self, base_data, common_data, connector_id, is_labelproject=False):

        user_id = common_data['user_id']
        user_email = common_data['email']
        labelproject_id = common_data['labelproject_id']
        json_data = base_data['json_data']
        unzipped_dir = base_data['unzipped_dir']
        categories_dict = {}
        ds2datas = []
        labelproject_ds2datas = []
        labels = []
        preprocessing_json_data = {}
        file_path_dict = {}
        fail_file_list = []
        if not is_labelproject:
            connector_raw = self.dbClass.getOneDataconnectorById(connector_id)

        try:
            for category in json_data['categories']:
                is_exist = False
                labelclasses = [x.__dict__['__data__'] for x in
                                self.dbClass.getLabelClassesByLabelProjectId(labelproject_id)]
                for labelclass in labelclasses:
                    if labelclass['name'] == category['name']:
                        labelclass_id = labelclass['id']
                        is_exist = True
                if not is_exist:
                    color = self.get_random_hex_color()
                    data = {'name': category['name'], 'color': color, 'labelproject': labelproject_id}
                    new_labelclass = self.dbClass.createLabelclass(data)
                    labelclass_id = new_labelclass.id
                categories_dict[category['id']] = labelclass_id
            total_progress = len(json_data['images'])
            progress = 0
            for idx, json_image in enumerate(json_data['images']):
                width = json_image['width']
                height = json_image['height']
                preprocessing_json_data[json_image['file_name'].split("/")[-1] if "/" in json_image['file_name'] else json_image['file_name']] = json_image
                preprocessing_json_data[json_image['file_name'].split("/")[-1] if "/" in json_image['file_name'] else json_image['file_name']]['labels'] = []

                for annotation in json_data['annotations']:
                    if annotation.get('iscrowd') == 1:
                        continue
                    if annotation['image_id'] == json_image['id']:
                        # if not annotation.get('segmentation') and annotation['bbox']:
                        #     x1 = annotation['bbox'][0]
                        #     x2 = annotation['bbox'][0] + annotation['bbox'][2]
                        #     y1 = annotation['bbox'][1]
                        #     y2 = annotation['bbox'][1] + annotation['bbox'][3]
                        #     annotation['segmentation'] = [[x1, y1, x2, y1, x2, y2, x1, y2]]
                        bbox = {}
                        points = None

                        # labeltype = 'polygon'
                        labeltype = 'box'

                        if annotation['segmentation']:
                            if type(annotation['segmentation'][0]) != list:
                                points = self.get_coco_segmentation(annotation['segmentation'], width, height)
                            else:
                                points = self.get_coco_segmentation(annotation['segmentation'][0], width, height)

                        if annotation['bbox']:
                            x = annotation['bbox'][0] / width
                            y = annotation['bbox'][1] / height
                            w = annotation['bbox'][2] / width
                            h = annotation['bbox'][3] / height
                            bbox = {
                                "x": x,
                                "y": y,
                                "w": w,
                                "h": h
                            }

                        if points:
                            labeltype = 'polygon'
                        else:
                            if annotation['bbox']:
                                points = json.dumps([[x, y], [x + w, y], [x + w, y + h], [x, y + h]])

                        label_data = {
                                          'labeltype': labeltype,
                                          'color': '#ff000',
                                          'status': 'done', 'user': user_id,
                                          'workAssignee': user_id,
                                          'labelclass': categories_dict.get(annotation['category_id']),
                                          'points': points,
                                          'bbox': bbox
                                      }
                        if labeltype == "box":
                            label_data.update(bbox)

                        preprocessing_json_data[json_image['file_name'].split("/")[-1] if "/" in json_image['file_name'] else json_image['file_name']]['labels'].append(label_data)
                if not is_labelproject:
                    new_progress = int(((idx + 1) / (total_progress)) * 8) * 10
                    if progress != new_progress:
                        progress = new_progress
                        connector_raw.progress = progress
                        connector_raw.save()
        except Exception as e:
            print(traceback.format_exc())
            fail_file_list.append('json')
            shutil.rmtree(unzipped_dir)
            return fail_file_list

        for root, dirs, images in os.walk(unzipped_dir):
            if '__MACOSX' in root:
                continue
            for idx, image in enumerate(images):
                try:
                    if image.lower().endswith((".jpg", ".jpeg", ".png")):
                        file_size = os.path.getsize(f"{root}/{image}")
                        timestamp = time.strftime('%y%m%d%H%M%S')
                        file_name, file_ext = os.path.splitext(image)
                        newfileName = f"{file_name}{timestamp}{file_ext}"
                        filePath = f'{root}/{image}'
                        width, height, im = self.getImageSize(f"{root}/{image}")
                        file_path_dict[newfileName] = filePath

                        if common_data['has_de_identification'] and common_data['workapp'] == 'object_detection':
                            im = self.getFaceDetect(im, half=True)
                            im.save(f'{root}/{image}')

                        s3Folder = f"user/{user_id}/{connector_id}/{file_name}"
                        s3key = f'{s3Folder}{timestamp}{file_ext}'
                        self.s3.upload_file(f'{root}/{image}', 'enterprise', s3key)
                        s3key = urllib.parse.quote(f'{self.utilClass.save_path}/{s3key}').replace('https%3A//',
                                                                                                  'https://')

                        ds2datas.append({
                            "fileName": newfileName,
                            "fileSize": file_size,
                            "user": user_id,
                            "width": width,
                            "height": height,
                            "s3key": s3key,
                            "originalFileName": image,
                            "created_at": datetime.datetime.utcnow(),
                            "updated_at": datetime.datetime.utcnow(),
                            "fileType": common_data['workapp'],
                            "dataconnector": connector_id,
                        })
                    else:
                        continue
                except Exception as e:
                    fail_file_list.append(image)
                    self.utilClass.sendSlackMessage(traceback.format_exc())

        if not is_labelproject:
            connector_raw.progress = 90
            connector_raw.save()

        if len(ds2datas) > 0:
            self.dbClass.createFile(ds2datas)

            for data in ds2datas:
                ds2data_id = data['id']
                del data['id']
                data.update({
                    "status": "prepare",
                    "status_sort_code": 0,
                    "workAssignee": None,
                    "isDeleted": False,
                    "reviewer": None,
                    "ds2data": ds2data_id,
                    "labelproject": labelproject_id
                })
                labelproject_ds2datas.append(data)
            self.dbClass.createLabelprojectFile(labelproject_ds2datas)

            for data in labelproject_ds2datas:
                json_key = data['originalFileName']
                # json_key = file_path_dict[data['fileName']]
                # json_key = json_key[1:] if json_key[0] == '/' else json_key
                # json_key = '/'.join(json_key.split('/')[1:])
                # for temp_folder_name in base_data['file_name'].split('/'):
                #     if json_key.split('/')[0] == temp_folder_name:
                #         json_key = '/'.join(json_key.split('/')[1:])
                #
                # if preprocessing_json_data.get("/" + json_key):
                #     json_key = "/" + json_key

                # json_key = json_key.split('/')[-1]
                #
                if preprocessing_json_data.get(json_key):
                    [label_info.update({'labelproject': labelproject_id, 'sthreefile': data['id']}) for label_info
                     in preprocessing_json_data[json_key]['labels']]

                    if preprocessing_json_data[json_key]['labels']:
                        labels += preprocessing_json_data[json_key]['labels']

                update_sthree_data = {'status': 'done', 'workAssignee': user_email}
                self.dbClass.updateSthreeFileById(data['id'], update_sthree_data)

            if labels:
                self.dbClass.createLabel(labels)

        connector_raw.progress = 100
        connector_raw.save()

        return fail_file_list

    def upload_voc_folder(self, base_data, common_data, connector_id, is_labelproject=False):

        user_id = common_data['user_id']
        user_email = common_data['email']
        labelproject_id = common_data['labelproject_id']
        origin_dirs = base_data['origin_dirs']
        voc_path = base_data['voc_path']

        objects_dicts_list = []
        categories_dict = {}
        categories = set()
        fail_file_list = []

        origin_dirs.sort(key=len, reverse=True)
        root = f"{voc_path}/{origin_dirs[0]}"
        label_files = list(pathlib.Path(root).glob('*.xml'))

        if not is_labelproject:
            connector_raw = self.dbClass.getOneDataconnectorById(connector_id)

        for label_file in label_files:
            objects, object_dicts = self.read_xml(label_file)
            objects_dicts_list.append(object_dicts)
            categories.update(objects)

        for category in categories:
            is_exist = False
            labelclasses = [x.__dict__['__data__'] for x in
                            self.dbClass.getLabelClassesByLabelProjectId(labelproject_id)]
            for labelclass in labelclasses:
                if labelclass['name'] == category:
                    labelclass_id = labelclass['id']
                    is_exist = True
                    break
            if not is_exist:
                color = self.get_random_hex_color()
                data = {'name': category, 'color': color, 'labelproject': labelproject_id}
                new_labelclass = self.dbClass.createLabelclass(data)
                labelclass_id = new_labelclass.id
            categories_dict[category] = labelclass_id

        root = f"{voc_path}/{origin_dirs[1]}"
        images = list(pathlib.Path(root).glob('*.jpg')) + list(pathlib.Path(root).glob('*.jpeg')) + list(
            pathlib.Path(root).glob("*.png"))

        total_progress = len(images)
        progress = 0
        for idx, image in enumerate(images):
            try:

                file_size = os.path.getsize(image)
                image = image.stem + image.suffix
                timestamp = time.strftime('%y%m%d%H%M%S')
                s3Folder = f"user/{user_id}/{connector_id}/{os.path.splitext(image)[0]}"
                file_name, file_ext = os.path.splitext(image)
                newfileName = f"{file_name}{timestamp}{file_ext}"
                width, height, im = self.getImageSize(f"{root}/{image}")

                if common_data['has_de_identification'] and common_data['workapp'] == 'object_detection':
                    im = self.getFaceDetect(im, half=True)
                    im.save(f'{root}/{image}')

                image = self.utilClass.unquote_url(image)

                if self.utilClass.configOption == 'enterprise':
                    s3Folder = f"{user_id}/{connector_id}/{file_name}"
                    s3key = f'{s3Folder}{timestamp}{file_ext}'
                    self.s3.upload_file(os.path.join(root, image), 'enterprise', s3key)
                    s3key = urllib.parse.quote(f'{self.utilClass.save_path}/{s3key}').replace('https%3A//', 'https://')

                else:
                    self.s3.upload_file(f"{os.path.join(root, image)}", self.utilClass.bucket_name,
                                        f'{s3Folder}{timestamp}{file_ext}')
                    s3key = urllib.parse.quote(
                        f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3Folder}{timestamp}{file_ext}').replace(
                        'https%3A//', 'https://')

                new_object_dict = {
                    "fileName": newfileName,
                    "fileSize": file_size,
                    "user": user_id,
                    "width": width,
                    "height": height,
                    "s3key": s3key,
                    "originalFileName": image,
                    "created_at": datetime.datetime.utcnow(),
                    "updated_at": datetime.datetime.utcnow(),
                    "fileType": common_data['workapp'],
                    "dataconnector": connector_id
                }

                new_object_dict = self.dbClass.createFile(new_object_dict)
                if not new_object_dict:
                    continue

                ds2data_id = new_object_dict['id']
                del new_object_dict['id']
                new_object_dict.update({
                    "status": "prepare",
                    "workAssignee": None,
                    "isDeleted": False,
                    "status_sort_code": 0,
                    "reviewer": None,
                    "ds2data": ds2data_id,
                    "labelproject": labelproject_id
                })
                self.dbClass.createLabelprojectFile(new_object_dict)

                for object_dict in objects_dicts_list:
                    if not object_dict:
                        continue
                    if object_dict[0]['filename'] == image:
                        for object_dict_item in object_dict:
                            points = self.get_coco_segmentation(object_dict_item['segmentation'],
                                                                int(object_dict_item['width']),
                                                                int(object_dict_item['height']))
                            label_data = {'labelproject': labelproject_id, 'labeltype': 'polygon',
                                          'color': '#ff000',
                                          'status': 'done', 'sthreefile': new_object_dict['id'], 'user': user_id,
                                          'workAssignee': user_id,
                                          'labelclass': categories_dict[object_dict_item['class']],
                                          'points': points}
                            if object_dict_item.get('bbox'):

                                bbox = {
                                    "x": object_dict_item.get('bbox')[0] / width,
                                    "y": object_dict_item.get('bbox')[1] / height,
                                    "w": object_dict_item.get('bbox')[2] / width,
                                    "h": object_dict_item.get('bbox')[3] / height
                                }
                                label_data['bbox'] = bbox
                                label_data['labeltype'] = 'box'
                                label_data['x'] = bbox['x']
                                label_data['y'] = bbox['y']
                                label_data['w'] = bbox['w']
                                label_data['h'] = bbox['h']
                            self.dbClass.createLabel(label_data)

                            update_sthree_data = {'status': 'done', 'workAssignee': user_email}
                            self.dbClass.updateSthreeFileById(new_object_dict['id'], update_sthree_data)
                    else:
                        continue
                if not is_labelproject:
                    new_progress = int(((idx + 1) / (total_progress)) * 10) * 10
                    if progress != new_progress:
                        progress = new_progress
                        connector_raw.progress = progress
                        connector_raw.save()

            except Exception as e:
                if not is_labelproject:
                    print("=================데이터 커넥터 파일 에러 체크=================")
                    print(traceback.format_exc())
                    print("=================데이터 커넥터 파일 에러 체크=================")
                    raise e
                fail_file_list.append(image)

        return fail_file_list

    def read_xml(self, xml_file: str):

        tree = parse(xml_file)
        root = tree.getroot()

        list_with_all_objects = []
        list_with_all_annotation = []
        file_name = root.find('filename').text
        width = root.find('./size/width').text
        height = root.find('./size/height').text

        for voc_object in root.iter('object'):
            object_dict = {}
            list_with_all_objects.append(voc_object.find('name').text)

            bndbox = voc_object.find('bndbox')
            xmin = int(bndbox.findtext('xmin'))
            ymin = int(bndbox.findtext('ymin'))
            xmax = int(bndbox.findtext('xmax'))
            ymax = int(bndbox.findtext('ymax'))

            object_dict['filename'] = file_name
            object_dict['class'] = voc_object.find('name').text
            object_dict['segmentation'] = [xmin, ymin, xmin, ymax, xmax, ymax, xmax, ymin]
            object_dict['bbox'] = [xmin, ymin, xmax, ymax]
            object_dict['width'] = width
            object_dict['height'] = height

            list_with_all_annotation.append(object_dict)

        return list_with_all_objects, list_with_all_annotation

    def get_random_hex_color(self):
        random_number = random.randint(0, 16777215)
        hex_number = format(random_number, 'x')
        hex_number = '#' + hex_number
        return hex_number

    def get_coco_segmentation(self, segmentation, width, height):
        result = []
        is_x_points = True
        temp = 0
        for point in segmentation:
            if is_x_points:
                temp = point / width
                is_x_points = False
            else:
                result.append([temp, point / height])
                is_x_points = True
        return result

    def addFolder(self, token, folderName='', folder='/'):
        userId = self.dbClass.getId(token)
        if not userId:
            self.utilClass.sendSlackMessage(
                f"파일 : ManageFile\n 함수 : addFolder \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True)
            return NOT_ALLOWED_TOKEN_ERROR
        folder = self.fixFolderName(folder)

        try:
            existFolder = self.dbClass.getOneFolderByFolderNameAndUserName(f"{folder}{folderName}", userId)
            return HTTP_200_OK, existFolder
        except:
            pass

        folderObject = self.dbClass.getOneFolderByFolderNameAndUserName(folder, userId, raw=True)
        subfolder = self.dbClass.createFolder(
            {
                "folderName": f"{folder}{folderName}",
                "user": userId
            }
        )
        self.dbClass.createFolderSub({
            "folderId": folderObject.id,
            "subFolderId": subfolder.id,
        })

        self.s3.put_object(Bucket=self.utilClass.bucket_name, Key=(f'user/{userId}{folder}{folderName}'))

        return HTTP_201_CREATED, subfolder.__dict__['__data__']

    def getTempFileAndSize(self, tempFile, file=None):

        with open(tempFile, 'wb') as open_file:
            open_file.write(file)
        result = self.unzipFile(tempFile)
        # os.remove(tempFile)
        return result

    def renameObject(self, token, oldName='', newName='', folder=''):

        userId = self.dbClass.getId(token)
        if not userId:
            self.utilClass.sendSlackMessage(
                f"파일 : ManageFile\n 함수 : renameObject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True)
            return NOT_ALLOWED_TOKEN_ERROR

        user = self.dbClass.getUser(token)
        isFolder = True if '/' in oldName[-1] else False
        if len(oldName) == 0 or len(newName) == 0:
            self.utilClass.sendSlackMessage(
                f"파일 : ManageFile\n 함수: renameObject \nzip파일 내에 이미지 파일을 못찾음 user = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_INPUT_ERROR

        folder = self.fixFolderName(folder)

        if isFolder:
            listObject = self.s3.list_objects_v2(Bucket=self.utilClass.bucket_name,
                                                 Prefix=f"user/{userId}{folder}{oldName}")
            for content in listObject.get("Contents", []):
                oldNameObject = content['Key'].split(f"user/{userId}{folder}")[1]
                newNameObject = oldNameObject.replace(oldName, newName, 1)
                newNameFile = self.utilClass.replace_right(content['Key'], oldNameObject, newNameObject, 1)
                # newNameFile = content['Key'].replace(oldNameObject,newNameObject, -1)
                self.s3.copy_object(Bucket=self.utilClass.bucket_name,
                                    CopySource={'Bucket': self.utilClass.bucket_name,
                                                'Key': content['Key']},
                                    Key=newNameFile)
                self.s3.delete_object(Bucket=self.utilClass.bucket_name,
                                      Key=content['Key'])

            folderId = self.dbClass.getOneFolderByFolderNameAndUserName(f"{folder}{oldName}", userId).get('id')
            self.dbClass.updateFolder(folderId, {"folderName": f"{folder}{newName}"})
            self.renameSubFolder(folderId, userId, f"{folder}{oldName}", f"{folder}{newName}")

        else:
            self.s3.copy_object(Bucket=self.utilClass.bucket_name, CopySource={'Bucket': self.utilClass.bucket_name,
                                                                               'Key': f"user/{userId}{folder}{oldName}"},
                                Key=f"user/{userId}{folder}{newName}")
            self.s3.delete_object(Bucket=self.utilClass.bucket_name, Key=f"user/{userId}{folder}{oldName}")

            s3file = self.dbClass.getSthreeFileByKey(userId, folder, oldName)
            s3file.s3key = s3file.s3key.split('user/')[0] + f"user/{userId}{folder}{newName}"
            s3file.fileName = newName
            s3file.save()

        return HTTP_200_OK, model_to_dict(s3file)

    #
    # def renameSubFolder(self, folderId, userId, oldName, newName):
    #     for subFolderRaw in self.dbClass.getFolderSubByFolderId(folderId):
    #         subFolder = self.dbClass.getOneFolderById(subFolderRaw.id, raw=True)
    #         subFolder.folderName = subFolder.folderName.replace(oldName, newName)
    #         subFolder.save()
    #         self.renameSubFolder(subFolder.id, userId)

    def fixFolderName(self, folder):
        if folder:
            if len(folder) > 1:
                if folder[0] != "/":
                    folder = "/" + folder
            return folder
        else:
            return "/"

    def getFolderByFolderId(self, token, folderId):

        userId = self.dbClass.getId(token)
        if not userId:
            self.utilClass.sendSlackMessage(
                f"파일 : ManageFile\n 함수 : getFolderByFolderId \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True)
            return NOT_ALLOWED_TOKEN_ERROR
        folderObject = self.dbClass.getOneFolderById(folderId)

        user = self.dbClass.getUser(token)
        if folderObject["user"] != int(userId):
            self.utilClass.sendSlackMessage(
                f"파일 : ManageFile\n 함수 : getFolderByFolderId \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        return HTTP_200_OK, folderObject

    def get_static_local_file(self, file_path_raw, has_asset_file=False):
        try:
            if has_asset_file:
                if not os.path.exists(f'{self.utilClass.save_path}/asset/{file_path_raw}') and not file_path_raw.startswith(
                        'http'):
                    print("download")
                    os.makedirs(f"{self.utilClass.save_path}/asset/{'/'.join(file_path_raw.split('/')[:-1])}",
                                exist_ok=True)
                    urllib.request.urlretrieve(
                        f"https://aimakerdslab.s3.ap-northeast-2.amazonaws.com/asset/{file_path_raw}",
                        f'{self.utilClass.save_path}/asset/{file_path_raw}')
                file_path = f'{self.utilClass.save_path}/asset/{file_path_raw}'
            else:
                file_path = f'{self.utilClass.save_path}/{file_path_raw}'
            if self.utilClass.configOption == "enterprise" and not os.path.exists(file_path):
                file_path = f"/{file_path_raw}"


            if '../' in file_path:
                return NORMAL_ERROR

            path = f'{file_path}'
            image_name = file_path.split("/")[-1]
            file_name, file_ext = os.path.splitext(image_name)
            try:
                data = open(path, 'rb')
            except:
                data = open(urllib.parse.quote(path), 'rb')

            if file_ext == '.svg':
                file_ext = '.svg+xml'
            response = StreamingResponse(data, media_type=f"image/{file_ext[1:]}")
            image_name = urllib.parse.quote(image_name)

            response.headers["Content-Disposition"] = f"attachment; filename={image_name}"

            return HTTP_200_OK, response
        except:
            return NORMAL_ERROR

    def updateSthreeFile(self, token, fileId, fileObject, app_status):

        s3file = self.dbClass.getLabelSthreeFileById(fileId)
        labelproject = model_to_dict(self.dbClass.getOneLabelProjectById(s3file['labelproject']))
        fileObjectDictRaw = fileObject.__dict__

        user = self.dbClass.getUser(token, True)
        if not user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : ManageFile\n 함수 : updateSthreeFile \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user.__dict__['__data__'])
            return NOT_ALLOWED_TOKEN_ERROR
        if fileObjectDictRaw['reviewer'] and user.email != fileObjectDictRaw['reviewer']:
            raise ex.NotFoundUserEx(token)

        AccessAuthority = False

        if labelproject['shareaitrainer'] and user.isAiTrainer:
            AccessAuthority = True

        labelproject['isShared'] = False
        if labelproject['sharedgroup']:
            for temp in ast.literal_eval(labelproject['sharedgroup']):
                member = self.dbClass.getMemberByUserIdAndGroupId(user.id, temp)
                if member:
                    if member.role in ['subadmin', 'member'] and member.acceptcode == 1:
                        AccessAuthority = True

        if s3file['user'] != int(user.id) and not AccessAuthority:
            self.utilClass.sendSlackMessage(
                f"파일 : ManageFile\n 함수 : updateSthreeFile \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user.__dict__['__data__'])
            return NOT_ALLOWED_TOKEN_ERROR

        fileObjectDict = {}
        for key, value in fileObjectDictRaw.items():
            if value and key not in 'fileName':
                fileObjectDict[key] = value

        if fileObjectDictRaw.get('inspectionResult', None) is None:
            if s3file['status'] == 'working' and labelproject['has_review_process']:
                fileObjectDict.update({'workAssignee': user.email})
                status = 'review'
                fileObjectDict['status'] = status
            else:
                status = 'done'
                fileObjectDict.update({'workAssignee': user.email})

            self.dbClass.updateLabelsBySthreefileId(fileId, {"status": status})

        else:
            if fileObjectDictRaw['inspectionResult'] == 1:
                # total_price = 0
                model_types = {"custom": 0, "person": 0, "animal": 0, "road": 0, "facepoint": 0, "keypoint": 0}
                self.dbClass.updateLabelsBySthreefileId(fileId, {"status": "done", "reviewer": user.id})
                fileObjectDict.update({'reviewer': user.email})
                labels = self.dbClass.getLabelsBySthreefileId(fileId, is_autolabeling=True)
                if labels:
                    for label in labels:
                        if label['labeltype'] == 'sementic' or not label['labeltype']:
                            continue

                        # total_price += label['price']
                        if model_types.get(label['autolabelingAiType'], None) is not None:
                            model_types[label['autolabelingAiType']] += 1
                        elif model_types.get(label['generalLabelingType'], None) is not None:
                            model_types[label['generalLabelingType']] += 1
                        else:
                            raise ex.NotExistLabelTypeEx(user.id)
                    for key, value in model_types.items():
                        self.dbClass.updateUserAutoLabelingObjectCount(user.id, value, key)

                # self.dbClass.updateUserUsedPrice(user.id, total_price)

            elif fileObjectDictRaw['inspectionResult'] == 2:
                self.dbClass.removeLabelByStrhreeFile(fileId)

        if fileObjectDict:
            self.dbClass.updateSthreeFileById(s3file['id'], fileObjectDict)
        next_sthreefile = self.dbClass.getOneSthreeFilesByLabelprojectId(labelproject['id'], workAssignee=user.email,
                                                                         app_status=app_status, project={'id': 1})

        next_sthreefile = {"id": next_sthreefile[0]['id']} if next_sthreefile else {"id": None}
        result = {
            "fileObject": fileObjectDict,
            "nextSthreeFile": next_sthreefile
        }
        return HTTP_200_OK, result

    def deleteSthreeFile(self, token, fileIdList):
        user = self.dbClass.getUser(token)
        if not user:
            raise ex.NotFoundUserEx(token)

        if type(fileIdList) == int:
            fileIdList = [fileIdList]
        elif type(fileIdList) != list:
            fileIdList = ast.literal_eval(fileIdList)
            if type(fileIdList) == int:
                fileIdList = [fileIdList]

        successList = []
        failList = []

        for fileId in fileIdList:
            try:
                s3file = self.dbClass.getSthreeFileById(fileId)

                if s3file['user'] != user['id']:
                    self.utilClass.sendSlackMessage(
                        f"파일 : ManageFile\n 함수 : deleteSthreeFile \n허용되지 않은 토큰 값입니다. token = {token})",
                        appError=True, userInfo=user)
                    return NOT_ALLOWED_TOKEN_ERROR

                self.dbClass.updateS3filesIsdeletedByS3Id(fileId)
                self.dbClass.deleteLabelByStrhreeFile(fileId)
                self.utilClass.sendSlackMessage(
                    f"s3파일을 삭제하였습니다. {user['email']} (ID: {user['id']}) ,라벨 클래스 (ID: {fileId})",
                    appLog=True, userInfo=user)
                successList.append(fileId)
            except:
                self.utilClass.sendSlackMessage(
                    f"s3파일 삭제에 실패하였습니다. {user['email']} (ID: {user['id']}) ,라벨 클래스 (ID: {fileId})",
                    appLog=True, userInfo=user)
                failList.append(fileId)
                pass

        return HTTP_200_OK, {'successList': successList, 'failList': failList}

    def getDataconnectortypes(self, token):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : getDataconnectortypes \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True)
            return NOT_FOUND_USER_ERROR

        getDataconnectortypes = [x.__dict__['__data__'] for x in self.dbClass.getDataconnectortypes()]

        return HTTP_200_OK, getDataconnectortypes

    def get_dataconnectors(self, token, sorting, count, start, desc, searching, is_public):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : getDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True)
            return NOT_FOUND_USER_ERROR
        dataconnectors = []

        dataconnector_raws, toatl_length = self.dbClass.get_dataconnectors_by_user_id(user.id, sorting, desc, searching,
                                                                                      start, count, is_public)
        for dataconnectorRaw in dataconnector_raws:
            dataconnector = dataconnectorRaw.__dict__['__data__']
            dataconnector['dataconnectortype'] = dataconnectorRaw.dataconnectortypestable.__dict__['__data__']
            dataconnectors.append(dataconnector)
        result = {'dataconnectors': dataconnectors, 'totalLength': toatl_length}

        return HTTP_200_OK, result

    def getDataconnector(self, token, dataconnector_id):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : getDataconnector \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True)
            return NOT_FOUND_USER_ERROR

        dataconnector = self.dbClass.getOneDataconnectorById(dataconnector_id)
        dataconnector.dataconnectortype = \
            self.dbClass.getOneDataconnectortypeById(dataconnector.dataconnectortype).__dict__['__data__']
        original_labelproject = self.dbClass.getOneLabelProjectById(dataconnector.originalLabelproject).__dict__[
            '__data__']
        dataconnector.dbPassword = None

        if dataconnector.user != user.id:
            raise ex.NotAllowedTokenEx()

        if dataconnector.isDeleted:
            raise ex.DeletedObjectEx()

        if original_labelproject is not None and original_labelproject.get('user') != user.id:
            raise ex.NotAllowedTokenEx()

        dataconnector = dataconnector.__dict__['__data__']

        projects = []
        project_ids = dataconnector.get('project_id')
        if project_ids:
            projects = [{'project_id': x.get('id'), 'project_name': x.get('projectName')} for x in
                        self.dbClass.get_all_project_in_ids(project_ids)]

        labelprojects = []
        labelproject_ids = dataconnector.get('labelproject_id')
        if labelproject_ids:
            labelprojects = [{'labelproject_id': x.get('id'), 'labelproject_name': x.get('name')} for x in
                             self.dbClass.get_all_labelproject_in_ids(labelproject_ids)]

        indicator = []

        if dataconnector['dataconnectortype']['dataconnectortypeName'] in ['ZIP', 'Video']:
            sample_data = []
            label_data_info = {}
            label_data_list = []
            total_cnt = 0

            ds2_data = self.dbClass.get_sthree_files_by_workapp(dataconnector['originalLabelproject'],
                                                                dataconnector['trainingMethod'], count=20)

            data_count = self.dbClass.get_sthreefile_count_by_labelproject_id(dataconnector['originalLabelproject'])

            label_class = [x.__dict__['__data__'] for x in
                           self.dbClass.getLabelClassesByLabelProjectId(dataconnector['originalLabelproject'])]

            completed_label_count_dict = {
                label_count.get('id'): label_count.get('count') for label_count in
                self.dbClass.getCompletedLabelCountBylabelprojectId(dataconnector['originalLabelproject'], original_labelproject['workapp'],
                                                                    False, "")
            }

            if original_labelproject['workapp'] == 'image':
                label_data_info, total_count = self.dbClass.get_image_classification_label_count(original_labelproject['id'])
                labelclass_info = {}
                if label_class:
                    for labelclass_data in label_class:
                        labelclass_info[labelclass_data['name']] = labelclass_data['id']

                for label_data in label_data_info:
                    label_data['labelclass'] = label_data.pop('id', None)
                    label_data['labelclass_id'] = labelclass_info[label_data['labelclass']]
                    label_data['ratio'] = label_data['count'] / total_count * 100
                    s3key_list = [{'file_name': x['originalFileName'], 's3_key': x['s3key']} for x in
                                  self.dbClass.get_image_classification_s3_key(original_labelproject['id'],
                                                                               label_data['labelclass'])]
                    label_data['images'] = s3key_list
                    label_data_list.append(label_data)

            else:
                for label_class_dict in label_class:
                    labe_data = {}
                    labe_data.update({x['id']: x['count'] for x in self.dbClass.get_completed_label_count_group_by_labeltype(label_class_dict['id'])})
                    label_count = completed_label_count_dict.get(str(label_class_dict['id']), 0)
                    labe_data.update({'count': label_count, 'labelclass_id': label_class_dict['id']})
                    label_data_info[label_class_dict['name']] = labe_data
                    total_cnt += label_count

                for key, label_data in label_data_info.items():
                    label_data_info[key].update({
                        'ratio': round(label_data['count']/total_cnt*100, 2) if total_cnt > 0 else 0,
                        'labelclass': key
                    })
                    label_data_list.append(label_data_info[key])


            for image_data in ds2_data:
                sample_data.append({
                    'image_id': image_data['id'],
                    'file_name': image_data['originalFileName'],
                    'status': image_data['status'],
                    's3key': image_data['s3key'],
                    'width': image_data['width'] if image_data.get('width')else 0,
                    'height': image_data['height'] if image_data.get('height') else 0
                })

            dataconnector.update({
                'label_info': label_data_list,
                'sampleData': sample_data,
                'label_class': label_class,
                'projects': projects,
                'labelprojects': labelprojects,
                'total_count': data_count
            })

        else:
            ds2_data = self.dbClass.get_ds2data_by_connector_id(dataconnector_id, True)
            total_count = len(ds2_data)
            df = pd.DataFrame.from_dict(ds2_data)
            for data_column in list(df.columns):
                data_series = df[data_column]

                try:
                    column_format = 'string' if np.isnan(data_series.std()) else 'number'
                except:
                    column_format = 'string'

                indicator.append({
                    'column_name': data_column,
                    'count': data_series.count().item(),
                    'max': data_series.max().item() if column_format == 'number' else None,
                    'min': data_series.min().item() if column_format == 'number' else None,
                    'miss': data_series.isnull().sum().item() if column_format == 'number' else None,
                    'std': data_series.std().item() if column_format == 'number' else None,
                    'mean': data_series.mean().item() if column_format == 'number' else None,
                    'median': data_series.median().item() if column_format == 'number' else None,
                    'unique_count': len(data_series.unique()),
                    'median': data_series.median().item() if column_format == 'number' else None,
                    "type": column_format
                })

            dataconnector.update({
                'data_indicator': indicator,
                'projects': projects,
                'labelprojects': labelprojects,
                'total_count': total_count
            })
        return HTTP_200_OK, dataconnector

    def createDataconnector(self, token, dataconnectorInfoRaw):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : getUser \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True)
            return NOT_FOUND_USER_ERROR

        dataconnectorInfo = {**dataconnectorInfoRaw.__dict__}
        dataconnectortypeName = dataconnectorInfo.get('dataconnectortypeName', '')
        try:
            dataconnectortypeInfo = self.dbClass.getOneDataconnectortypeByDataconnectortypename(dataconnectortypeName)
        except Exception as e:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile\n 함수: createDataconnector \ndataconnector Name이 존재하지 않음 = {dataconnectortypeName})",
                appError=True, userInfo=user.__dict__['__data__'])
            return NON_EXISTENT_CONNECTOR_ERROR

        # 파라미터 검사
        inputKeyInfo = dataconnectorInfo.get('keyFileInfo', {})
        needKeyInfo = dataconnectortypeInfo.dataconnectortypeInfo.get('params', [])
        finalKeyInfo = {}

        for requiredKey in needKeyInfo:
            if requiredKey in inputKeyInfo:
                finalKeyInfo.update({requiredKey: inputKeyInfo[requiredKey]})
            else:
                code, result = KEY_FIlE_INFO_ERROR
                result['message'] = KEY_FIlE_INFO_ERROR[1]['message'].format(requiredKey, needKeyInfo)

                return KEY_FIlE_INFO_ERROR

        dataconnectorInfo['keyFileInfo'] = finalKeyInfo
        connector = ConnectorHandler(
            method='JDBC' if dataconnectorInfo['keyFileInfo'].get('dbType') else dataconnectortypeName,
            dictionary=dataconnectorInfo['keyFileInfo'],
        )

        # Verify
        isVerify, columnInfo, message = connector.verify()
        if not isVerify:
            return errorResponseList.verifyError(message)

        dataconnectorInfo["user"] = user.id
        # TODO: 양방향 암호화로 집어넣기
        # if dataconnectorInfo.get("dbPassword"):
        #     dataconnectorInfo["dbPassword"] = bcrypt.hashpw(dataconnectorInfo["dbPassword"].encode(), salt)

        self.utilClass.sendSlackMessage(f"데이터 커넥터 추가합니다. {user.email} (ID: {user.id}) , {dataconnectortypeName}",
                                        appLog=True, userInfo=user.__dict__['__data__'])

        return HTTP_201_CREATED, self.dbClass.createDataconnector(dataconnectorInfo).__dict__['__data__']

    def putDataconnector(self, token, dataconnectorId, dataconnectorInfoRaw):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : putDataconnector \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True)
            return NOT_FOUND_USER_ERROR

        dataconnector = self.dbClass.getOneDataconnectorById(dataconnectorId)

        if dataconnector.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : ManageFile\n 함수: putDataconnector \nzip파일 내에 이미지 파일을 못찾음 user = {token})",
                appError=True, userInfo=user.__dict__['__data__'])
            return PERMISSION_DENIED_CONNECTOR_ERROR

        dataconnectorInfo = {**dataconnectorInfoRaw.__dict__}
        dataconnectorInfo = {k: v for k, v in dataconnectorInfo.items() if v is not None}
        self.dbClass.updateDataconnectorById(dataconnector.id, dataconnectorInfo)

        return HTTP_200_OK, dataconnectorInfo

    def deleteDataconnector(self, token, dataconnectorId):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : deleteDataconnector \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True)
            return NOT_FOUND_USER_ERROR

        dataconnector = self.dbClass.getOneDataconnectorById(dataconnectorId)

        projectList = []
        for temp in [x.__dict__['__data__'] for x in self.dbClass.getNotStartedProjectsByUserId(user.id)]:
            if temp != None:
                try:
                    for connector in temp['dataconnectorsList']:
                        if connector == int(dataconnectorId) and temp['id'] not in projectList:
                            projectList.append(temp['id'])
                except:
                    pass

        for temp in projectList:
            self.dbClass.updateProjectIsdeletedById(temp)
            if self.utilClass.configOption == 'enterprise':
                try:
                    shutil.rmtree(f"{self.utilClass.save_path}/{temp}")
                except:
                    pass

        if dataconnector.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : ManageFile\n 함수: deleteDataconnector \ndataconnector 유저와 로그인 유저 정보가 불일치 user = {user.id}, dataconnector = {dataconnector.user})",
                appError=True, userInfo=user.__dict__['__data__'])
            return PERMISSION_DENIED_CONNECTOR_ERROR

        self.utilClass.sendSlackMessage(
            f"데이터 커넥터 삭제합니다. {user.email} (ID: {user.id}) , {dataconnector.dataconnectorName} | Id : {dataconnectorId}",
            appLog=True, userInfo=user.__dict__['__data__'])

        dataconnector.isDeleted = True
        dataconnector.save()

        # TODO: 데이터 커넥터 뷰 삭제
        view_name = f"dataconnector_{dataconnector.id}_table"
        self.dbClass.delete_collection_by_name(view_name)

        return HTTP_204_NO_CONTENT, {}

    def deleteDataconnectors(self, token, dataconnectorIdList):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : deleteDataconnector \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True)
            return NOT_FOUND_USER_ERROR

        successList = []
        failList = []

        for dataconnectorId in dataconnectorIdList:
            try:
                dataconnector = self.dbClass.getOneDataconnectorById(dataconnectorId)

                projectList = []
                for temp in [x.__dict__['__data__'] for x in self.dbClass.getNotStartedProjectsByUserId(user.id)]:
                    if temp != None:
                        try:
                            for connector in temp['dataconnectorsList']:
                                if connector == int(dataconnectorId) and temp['id'] not in projectList:
                                    projectList.append(temp['id'])
                        except:
                            pass

                for temp in projectList:
                    self.dbClass.updateProjectIsdeletedById(temp)
                    if self.utilClass.configOption == 'enterprise':
                        try:
                            shutil.rmtree(f"{self.utilClass.save_path}/{temp}")
                        except:
                            pass

                if dataconnector.user != user.id:
                    self.utilClass.sendSlackMessage(
                        f"파일 : ManageFile\n 함수: deleteDataconnector \ndataconnector 유저와 로그인 유저 정보가 불일치 user = {user.id}, dataconnector = {dataconnector.user})",
                        appError=True, userInfo=user.__dict__['__data__'])
                    return PERMISSION_DENIED_CONNECTOR_ERROR

                self.utilClass.sendSlackMessage(
                    f"데이터 커넥터 삭제합니다. {user.email} (ID: {user.id}) , {dataconnector.dataconnectorName} | Id : {dataconnectorId}",
                    appLog=True, userInfo=user.__dict__['__data__'])

                dataconnector.isDeleted = True
                dataconnector.save()
                successList.append(dataconnectorId)
            except:
                self.utilClass.sendSlackMessage(
                    f"데이터 커넥터 삭제합니다. {user.email} (ID: {user.id}) , {dataconnector.dataconnectorName} | Id : {dataconnectorId}",
                    appLog=True, userInfo=user.__dict__['__data__'])
                failList.append(dataconnectorId)
        return HTTP_200_OK, {'successList': successList, 'failList': failList}

    def createProjectFromQuant(self, token, dataconnector, market_project, yClass):

        datacolumns = []
        for x in self.dbClass.getDatacolumnsByDataconnectorId([dataconnector['id']]):
            x = model_to_dict(x)
            del x['created_at']
            del x['updated_at']
            datacolumns.append(x)

        project_raw = self.dbClass.createProject({
            "projectName": market_project.projectName,
            "status": 0,
            "statusText": "0: 예측 준비 중 입니다.",
            "user": 159,
            "dataconnectorsList": [dataconnector['id']],
            "option": None,
            "labelproject": None,
            "fileStructure": json.dumps(datacolumns),
            "yClass": yClass,
            "trainingMethod": market_project.trainingMethod,
            "hasImageData": False,
            "hasTextData": True
        })

        project_dict = project_raw.__dict__['__data__']

        result = {'id': project_dict['id'], 'projectName': project_dict['projectName'],
                  'created_at': datetime.datetime.utcnow(),
                  'updated_at': datetime.datetime.utcnow(), 'status': 0, 'option': None, 'trainingMethod': None}
        return HTTP_200_OK, result

    def createProjectFromDataconnectors(self, token, dataconnectorsList):
        sampleData = None
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createProjectFromDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if self.dbClass.isUserHavingExceedErrorProjectCount(user.__dict__['__data__']):
            self.utilClass.sendSlackMessage(f"유저 ID : {user.id} - 오류 프로젝트를 지나치게 많이 생성하고 있으니 조치바랍니다.", inquiry=True,
                                            userInfo=user)
            return TOO_MANY_ERROR_PROJECT

        # if self.dbClass.isUserHavingExceedProjectCount(user.__dict__['__data__']):
        #     self.utilClass.sendSlackMessage(
        #         f"csv Parse - run() \n프로젝트 사용량 초과입니다 {user['email']} (ID: {user['id']})",
        #         appLog=True, userInfo=user)
        #     return EXCEED_PROJECT_ERROR

        dataconnector_list = [int(dataconnector_id) for dataconnector_id in dataconnectorsList.dataconnectors]
        datacolumns = []
        for x in self.dbClass.getDatacolumnsByDataconnectorId(dataconnector_list):
            x = model_to_dict(x)
            del x['created_at']
            del x['updated_at']
            datacolumns.append(x)

        # availableConnectors = self.dbClass.getOneUsageplanById(user.usageplan['id'])['noOfConnector']
        # availableConnectors = availableConnectors if availableConnectors else 0
        # if availableConnectors < len(dataconnector_list):
        #     return HTTP_507_INSUFFICIENT_STORAGE, None

        yClass = None
        dataconnectors = []
        originalLabelproject = None
        for dataconnector_id in dataconnector_list:
            try:
                dataconnector = self.dbClass.getOneDataconnectorById(dataconnector_id)
                originalLabelproject = dataconnector.originalLabelproject
                dataconnectors.append(dataconnector)
                yClass = dataconnector.yClass
                trainingMethod = dataconnector.trainingMethod
                hasImageData = dataconnector.hasImageData
                hasTextData = dataconnector.hasTextData
                dataconnectortype = self.dbClass.getOneDataconnectortypeById(dataconnector.dataconnectortype)

                if dataconnectortype.authType == 'db' and dataconnector.keyFileInfo:
                    connector = ConnectorHandler(method='JDBC', dictionary=dataconnector.keyFileInfo)

                    # Verify
                    isVerify, columnInfos, message = connector.verify()
                    if not isVerify:
                        self.utilClass.sendSlackMessage(
                            f"파일 : manageFile.py \n함수 : createProjectFromDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                            appError=True, userInfo=user)
                        return NOT_FOUND_USER_ERROR

                    summaries, sampleData = connector.summary()
                    existDatacolumns = self.dbClass.getDatacolumnsByDataconnectorId(dataconnector.id)
                    for existDatacolumn in existDatacolumns:
                        existDatacolumn.delete_instance()

                    for i, column in enumerate(summaries):
                        dataObject = {**column,
                                      # "index": str(i + 1),
                                      "dataconnector": dataconnector.id if dataconnector else None,
                                      }

                        self.dbClass.createDatacolumn(dataObject)

                    dataconnector.sampleData = sampleData
                dataconnector.save()
            except Exception as e:
                print(traceback.format_exc())
                return errorResponseList.verifyError(e.args)

        if sampleData is not None:
            if len(ast.literal_eval(sampleData)) < 100:
                self.utilClass.sendSlackMessage(
                    f"파일 : manageUpload\n함수 : uploadFile \n데이터가 너무 적습니다. {user.email} (ID: {user.id})",
                    appLog=True, userInfo=user)
                return MIN_DATA_ERROR

        if len(dataconnectors) == 1:
            projectName = f"{dataconnectors[0].dataconnectorName}"
        elif len(dataconnectors) == 2:
            projectName = f"{dataconnectors[0].dataconnectorName} with dataconnector"
        else:
            projectName = f"{dataconnectors[0].dataconnectorName} with dataconnectors"

        # option = 'colab' if user.usageplan['planName'] == 'trial' else 'speed'

        project_raw = self.dbClass.createProject({
            "projectName": projectName,
            "status": 0,
            "statusText": "0: 예측 준비 중 입니다.",
            "user": user.id,
            "dataconnectorsList": dataconnector_list,
            "option": None,
            "labelproject": originalLabelproject,
            "fileStructure": json.dumps(datacolumns),
            # "valueForPredictColumnId": imageLabelColumnId,
            # "startTimeseriesDatetime": dataconnectorsList.startTimeseriesDatetime,
            # "endTimeseriesDatetime": dataconnectorsList.endTimeseriesDatetime,
            # "analyticsStandard": dataconnectorsList.analyticsStandard,
            # "timeseriesColumnInfo": dataconnectorsList.timeseriesColumnInfo,
            "yClass": yClass,
            "trainingMethod": trainingMethod,
            "hasImageData": hasImageData,
            "isVerify": dataconnectorsList.isVerify,
            "hasTextData": hasTextData
        })

        project_dict = project_raw.__dict__['__data__']

        ds2data_documents = self.dbClass.getSthreeFilesByDataconnectors(dataconnector_list)
        ds2datas = []
        for ds2data in ds2data_documents:
            ds2data.update({
                "status": "done",
                "isDeleted": False,
                "ds2data": ds2data['id'],
                "project": project_dict['id']
            })
            del ds2data['id']
            ds2datas.append(ds2data)

        result = {'id': project_dict['id'], 'projectName': project_dict['projectName'],
                  'created_at': datetime.datetime.utcnow(),
                  'updated_at': datetime.datetime.utcnow(), 'status': 0, 'option': None, 'trainingMethod': None}

        if len(ds2datas) > 0:
            self.dbClass.create_project_ds2data(ds2datas)
            for dataconnector_raw in self.dbClass.getDataconnectorsByIds(dataconnectors):
                project_list = dataconnector_raw.project_id
                if project_list is None:
                    project_list = [project_dict['id']]
                else:
                    project_list.append(project_dict['id'])
                self.dbClass.updateDataconnectorById(rowId=dataconnector_raw.id, data={'project_id': project_list})

            self.utilClass.sendSlackMessage(
                f"프로젝트를 생성하였습니다. {user.email} (ID: {user.id}) , {projectName} (ID: {result['id']})",
                appLog=True, userInfo=user)

            return HTTP_200_OK, result
        else:
            project_raw.isDeleted = True
            project_raw.save()
            result['status'] = 9
            self.utilClass.sendSlackMessage(
                f"프로젝트 생성에 실패하였습니다. {user.email} (ID: {user.id}) , {projectName} (ID: {result['id']})",
                appLog=True, userInfo=user)

            return HTTP_503_SERVICE_UNAVAILABLE, result

    def getPredictAllTemplate(self, token, projectId, osName='window'):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : getPredictAllTemplate \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        project = self.dbClass.getOneProjectById(projectId, raw=True)

        if project.user != user.id:
            sharedProjects = []
            for temp in self.dbClass.getSharedProjectIdByUserId(user.id):
                if temp.projectsid:
                    sharedProjects = list(set(sharedProjects + ast.literal_eval(temp.projectsid)))

            if int(projectId) not in sharedProjects:
                raise ex.NotAllowedTokenEx(user.email)
        try:
            datacolumnNames = []
            for dataconnectorId in project.dataconnectorsList:
                dataconnector = self.dbClass.getOneDataconnectorById(dataconnectorId)
                for datacolumn in self.dbClass.getDatacolumnsByDataconnectorId(dataconnectorId):
                    if (datacolumn.id != project.valueForPredictColumnId) and project.trainingColumnInfo.get(
                            str(datacolumn.id), False):
                        datacolumnNames.append(datacolumn.columnName + "__" + dataconnector.dataconnectorName)

            stream = io.StringIO()

            encodingCode = 'utf-8' if 'mac' in osName.lower() else 'utf-8'

            pd.DataFrame([], columns=datacolumnNames).to_csv(stream, index=False, encoding=encodingCode)

            response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")

            response.headers["Content-Disposition"] = "attachment; filename=export.csv"

            return HTTP_200_OK, response
        except:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile\n함수 : getPredictAllTemplate \n 예상 못한 에러 발생 {user['email']} (ID: {user['id']})",
                appLog=True, userInfo=user)
            return NORMAL_ERROR
            pass

    def getEnterpriseImageFile(self, filePath):

        # user = self.dbClass.getUser(token, raw=True)
        # print(f"{user.id}번 유저 getEnterpriseImageFile시도")
        # if not user:
        #     self.utilClass.sendSlackMessage(
        #         f"파일 : manageFile.py \n함수 : getPredictAllTemplate \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
        #         appError=True, userInfo=user)
        #     return NOT_FOUND_USER_ERROR
        try:
            path = os.getcwd() + "/data/" + filePath
            print(path + " 경로의 파일 읽기 시작")
            data = open(path, 'rb')
            print(f"파일 읽기 성공")

            fileName = filePath.split("/")[-1]

            print(f"파일 response 저장")
            response = StreamingResponse(data, media_type="image/png")
            print(f"파일 response 성공")
            response.headers["Content-Disposition"] = f"attachment; filename={fileName}"
            print(f"response 반환")
            # response = StreamingResponse(pd.DataFrame([], columns=datacolumnNames))
            return HTTP_200_OK, response
        except:
            print(traceback.format_exc())
            # self.utilClass.sendSlackMessage(
            #     f"파일 : manageFile\n함수 : getPredictAllTemplate \n 예상 못한 에러 발생 {user.email} (ID: {user.id})",
            #     appLog=True, userInfo=user)
            # return NORMAL_ERROR
            pass

    def create_dataconnector(self, file, file_name, user, frame_value=0):
        yClass = None
        folders = []
        rows = []
        file_counts = {}
        file_tops = {}
        has_text_data = False
        training_method = ''
        value_for_predict = ''
        has_image_Data = False
        if ".zip" in file_name.lower():
            temp_file, file_size, new_file_name = self.getConnectorTempFileAndSize(file_name, file=file, isZip=True)
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
                df = pd.DataFrame(rows)
                try:
                    shutil.rmtree(os.getcwd() + "/temp/" + ".".join(file_name.split(".")[:-1]))
                except:
                    pass

                pass
                df = pd.DataFrame(rows)

        elif ".csv" in file_name.lower():  # csv
            has_text_data = True

            df, dataCnt, file_size, req = self.readFile(file)

            temp_file, file_size, new_file_name = self.getConnectorTempFileAndSize(file_name, df=df, file=file)
        else:
            fileCounts = {}
            fileTops = {}
            no_ext_file_name, file_type = os.path.splitext(file_name)

            timestamp = time.strftime('%y%m%d%H%M%S')
            temp_folder = f"{os.getcwd()}/temp"
            temp_file = f'{temp_folder}/{no_ext_file_name}{timestamp}{file_type}'
            new_file_name = f'{no_ext_file_name}{timestamp}{file_type}'

            with open(temp_file, 'wb') as open_file:
                open_file.write(file)

            frame_folder = f"{temp_folder}/frames{timestamp}"
            os.mkdir(frame_folder)

            filePath = os.path.join(temp_file)
            if os.path.isfile(filePath):
                cap = cv2.VideoCapture(filePath)
            else:
                raise ex.NotExistFileEx(user_id=user['id'], obj="video")

            second = 60 / frame_value
            fps = cap.get(cv2.CAP_PROP_FPS)

            total_frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
            frame_count = 1
            pos_frames = 0
            while True:
                retval, frame = cap.read()
                if not (retval):
                    break
                cv2.imwrite(f'{frame_folder}/{no_ext_file_name}_{frame_count}.png', frame)
                frame_count += 1
                pos_frames += (second * fps)
                if pos_frames >= total_frame_count:
                    break
                cap.set(cv2.CAP_PROP_POS_FRAMES, pos_frames)
            if cap.isOpened():
                cap.release()
            cv2.destroyAllWindows()

            for (dirpath, dirnames, filenames) in os.walk(frame_folder):
                if '__MACOSX' in dirpath:
                    continue
                folders.append(dirnames)
                folderName = ""
                try:
                    folderName = dirpath.split(f"/")[-1]
                except:
                    pass
                for filename in filenames:
                    if '.' in filename:
                        if filename.split('.')[-1].lower() in self.utilClass.imageExtensionName:
                            rows.append({
                                'image': f"{folderName}/{filename}",
                                'label': folderName
                            })
                    if len(folders) == 1:
                        for xClass in folders[0]:
                            if f'{xClass}' in dirpath:
                                if not fileCounts.get(xClass):
                                    fileCounts[xClass] = 0
                                fileCounts[xClass] += 1
                                fileTops[xClass] = f'{xClass}/{filename}'
                    else:
                        for xClass in folders[1]:
                            if f'{folders[0][0]}/{xClass}' in dirpath:
                                if not fileCounts.get(xClass):
                                    fileCounts[xClass] = 0
                                fileCounts[xClass] += 1
                                fileTops[xClass] = f'{xClass}/{filename}'
            shutil.rmtree(frame_folder)
            df = pd.DataFrame(rows)
            yClass = [str(x) for x in list(df['label'].unique())]
            file_size = len(file)

        sample_data = json.dumps(df[:120].to_dict('records'))
        sample_data = sample_data.replace("NaN", "null")

        self.dbClass.updateUserCumulativeDiskUsage(user['id'], len(file))
        self.dbClass.updateUserTotalDiskUsage(user['id'], len(file))

        if self.utilClass.configOption == 'enterprise':
            self.s3.upload_file(temp_file, '', f"user/{user['id']}/{new_file_name}")
            s3Url = f"{self.utilClass.save_path}/user/{user['id']}/{new_file_name}"

            if os.path.isfile(temp_file):
                os.remove(temp_file)
        else:
            self.s3.put_object(Body=file, Bucket=self.utilClass.bucket_name, Key=f"user/{user['id']}/{new_file_name}")
            s3Url = urllib.parse.quote(
                f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{user["id"]}/{new_file_name}').replace(
                'https%3A//', 'https://')

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
            dataLen = min(len(filess.split(b'\n')) - 1, 500)
            columnByte = b"\n".join(filess.split(b'\n')[:1])
            dataByte = b"\n".join(filess.split(b'\n')[-dataLen:])
            smallfile = columnByte + b"\n" + dataByte

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
                df = pd.read_csv(io.StringIO(temp), encoding='UTF-8', error_bad_lines=False, warn_bad_lines=False,
                                 engine='python')[-120:]
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

    def getConnectorTempFileAndSize(self, filename, df=None, file=None, isZip=False):

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
            # if not file:
            df.to_csv(tempFile, index=False)
            return tempFile, len(file), newFileName

        return tempFile, fileSize, newFileName

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

    def getSampleImages(self, token, modelId):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : getSampleImages \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        project = self.dbClass.getProjectByModelId(modelId)

        if project.user != user.id:
            sharedProjects = []
            for temp in self.dbClass.getSharedProjectIdByUserId(user.id):
                if temp.projectsid:
                    sharedProjects = list(set(sharedProjects + ast.literal_eval(temp.projectsid)))

            if project.id not in sharedProjects:
                raise ex.NotAllowedTokenEx(user.email)

        sampleData = []
        try:
            sampleData = self.dbClass.getSampleImagesByProject(project)
        except:
            pass
        return HTTP_200_OK, sampleData

    def getImageSize(self, filePath):
        for orientation in ExifTags.TAGS.keys():
            if ExifTags.TAGS[orientation] == 'Orientation':
                break

        im = Image.open(filePath)
        if im.format == 'GIF':
            mypalette = im.getpalette()
            im.putpalette(mypalette)
            new_im = Image.new("RGB", im.size)
            new_im.paste(im)
            new_im.save(filePath)
            im = Image.open(filePath)

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

        return width, height, image

    def getFaceDetect(self, image, info=False, half=False):
        if not os.path.exists('./h.xml'):
            self.s3.download_file("aimakerdslab", 'asset/h.xml', './h.xml')
        xml = './h.xml'
        face_cascade = cv2.CascadeClassifier(xml)
        try:
            if 'PIL' in str(type(image)):
                image = np.array(image)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        except TypeError:
            image = np.array(image)
            gray = cv2.cvtColor(np.array(image), cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(gray, 1.05, 5)
        print("Number of faces detected: " + str(len(faces)))

        if len(faces):
            for (x, y, w, h) in faces:
                if half:
                    h = int(h / 1.6)
                face_img = image[y:y + h, x:x + w]  # 인식된 얼굴 이미지 crop
                face_img = cv2.resize(face_img, dsize=(0, 0), fx=0.04, fy=0.04)  # 축소
                face_img = cv2.resize(face_img, (w, h), interpolation=cv2.INTER_AREA)  # 확대
                image[y:y + h, x:x + w] = face_img  # 인식된 얼굴 영역 모자이크 처리
        if info:
            return faces
        return Image.fromarray(image)

    async def get_dataconnector_list(self, token, sorting, desc, searching, start, count, is_public, request):
        user = self.dbClass.get_user_or_none_object(token)

        dataconnector_raws, total_length = self.dbClass.get_dataconnectors_by_user_id(user['id'], sorting, desc, searching,
                                                                                      start, count, is_public)
        dataconnector_info = {}
        dataconnector_dicts = []
        for dataconnector in dataconnector_raws:
            dataconnector_info[dataconnector.id] = {'progress': dataconnector.progress, 'status': dataconnector.status}
            connector_type = dataconnector.dataconnectortypestable.__dict__['__data__']
            dataconnector = dataconnector.__dict__['__data__']

            # todo get_dataconnectors_by_user_id 함수에서 불러올때부터 커넥터 타입의 아이디는 빼고 가져오면 될듯합니다. 지금은 기존 사용되는 부분을 놔둬야해서 수정하지 않겠습니다.
            del connector_type['id']
            dataconnector.update(connector_type)
            dataconnector['dataconnectortypeId'] = dataconnector.pop('dataconnectortype')
            dataconnector_dicts.append(dataconnector)

        if user.get('id') is None:
            raise ex.NotFoundUserEx()

        yield {
            "event": "new_message",
            "id": "message_id",
            "retry": 50000,
            "data": json.dumps(jsonable_encoder({"dataconnectors": dataconnector_dicts, "total_length": total_length}))
        }

        while True:
            if await request.is_disconnected():
                break
            changed_data = []

            dataconnector_raws, total_length = self.dbClass.get_dataconnectors_by_user_id(user['id'], sorting, desc,
                                                                                          searching,
                                                                                          start, count, is_public)

            for new_dataconnector in dataconnector_raws:
                connector_type = new_dataconnector.dataconnectortypestable.__dict__['__data__']

                # todo get_dataconnectors_by_user_id 함수에서 불러올때부터 커넥터 타입의 아이디는 빼고 가져오면 될듯합니다. 지금은 기존 사용되는 부분을 놔둬야해서 수정하지 않겠습니다.
                del connector_type['id']

                existing_data = dataconnector_info.get(new_dataconnector.id)
                if existing_data is not None and (existing_data['progress'] != new_dataconnector.progress or
                                                  existing_data['status'] != new_dataconnector.status):
                    dataconnector_info[new_dataconnector.id] = {'progress': new_dataconnector.progress,
                                                                'status': new_dataconnector.status}
                    new_dataconnector = new_dataconnector.__dict__['__data__']
                    new_dataconnector.update(connector_type)
                    new_dataconnector['dataconnectortypeId'] = new_dataconnector.pop('dataconnectortype')
                    changed_data.append(new_dataconnector)

            if changed_data:
                yield {
                    "event": "new_message",
                    "id": "message_id",
                    "retry": 50000,
                    "data": json.dumps(jsonable_encoder({"dataconnectors": changed_data, "total_length": total_length}))
                }

            await asyncio.sleep(5)

    async def get_dataconnector_sse(self, request, token, dataconnector_id):

        user = request.state.user if token is None else self.dbClass.getUser(token)
        dataconnector = self.dbClass.getOneDataconnectorById(dataconnector_id)
        if user.get('id') is None:
            raise ex.NotFoundUserEx()
        if dataconnector is None:
            raise ex.NormalEx()
        dataconnector = model_to_dict(dataconnector)
        if dataconnector.get('user') != user.get('id'):
            raise ex.NotAllowedTokenEx()

        # mb = None
        # table_status = 0
        # url = None
        # try:
        #     import asyncio
        #     mb = self.utilClass.get_metabase_client()
        #     if mb is None:
        #         asyncio.sleep(120)
        #         mb = self.utilClass.get_metabase_client()
        # except Exception as e:
            # print(e.args[0].text)
            # pass
        #
        # is_first = True
        # while True:
        #     if await request.is_disconnected():
        #         break
        #     if mb:
        #         new_table_status = 0
        #         try:
        #             # session_id = getattr(mb, 'session_id', None)
        #             model_task = self.dbClass.get_metabase_async_task(user.get('id'), 'dataconnector', dataconnector_id)
        #             if model_task:
        #                 new_table_status = getattr(model_task, 'status', 1)
        #                 view_name = f"dataconnector_{dataconnector_id}_table"
        #                 table_id = mb.get_item_id('table', view_name)
        #                 url = f":{self.utilClass.metabase_port}/auto/dashboard/table/{table_id}"
        #                 if new_table_status == 1:
        #                     if mb.get_item_info('table', table_id).get('initial_sync_status') == 'complete':
        #                         self.dbClass.update_async_task_complete_by_id(model_task.id)
        #                         new_table_status = 100
        #         except:
        #             pass
        #     else:
        #         new_table_status = 99
        #
        #     if (table_status != new_table_status) or is_first:
        #         table_status = new_table_status
        #         metabase = {
        #             'status': table_status,
        #             'url': url
        #             # 'X-Metabase-Session': session_id
        #         }
        #         yield {
        #             "event": "new_message",
        #             "id": "message_id",
        #             "retry": 30000,
        #             "data": json.dumps(metabase)
        #         }
        #         is_first = False if is_first else False
        #
        #     # if mb is None or table_status == 100:
        #     #     break
        #
        #     await asyncio.sleep(3)

if __name__ == "__main__":
    manageFile = ManageFile()
    print(manageFile.listObject("160"))
    # manageFile.run('FL_insurance_sample.csv')
