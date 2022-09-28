import urllib
import ast
import subprocess

from bson import ObjectId
import traceback
import os
import json

from src.errors import exceptions as ex

from playhouse.shortcuts import model_to_dict

from src.util import Util
from models.helper import Helper
from starlette.status import HTTP_200_OK
import numpy as np


class DataAnalyze:
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.s3 = self.utilClass.getBotoClient('s3')

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

    def grant_workAssignee(self, key, passwd, label_project_id, grant_user, is_grant, count, target_file_status):
        user_name = self.certify(key, passwd)

        message = f"{user_name}님이 작업물 할당/회수 작업을 요청하셨습니다.\n 라벨프로젝트 아이디 : {label_project_id} | 작업자 : {grant_user} | 할당 여부 {is_grant} | 할당 개수 {count}"
        self.utilClass.sendSlackMessage(message, data_part=True)

        if not self.dbClass.getUserByEmail(grant_user):
            raise ex.NotFoundUserEx(grant_user)

        if is_grant:
            condition = {"$and":[{"labelproject":label_project_id}, {"status": target_file_status}, {"workAssignee": None}]}
            target_file_status = 'working' if target_file_status == 'prepare' else target_file_status
            data = {"workAssignee": grant_user, "status": target_file_status}
        else:
            condition = {"$and":[{"labelproject": label_project_id}, {"status": target_file_status}, {"workAssignee": grant_user}]}
            target_file_status = 'prepare' if target_file_status == 'working' else target_file_status
            data = {"workAssignee": None, "status": target_file_status}

        self.dbClass.updateSthreeFileByCondition(condition, data, count)

        return HTTP_200_OK, {"message": "작업물 분배/회수 작업이 완료되었습니다."}

    def export_coco_for_data_scientist(self, key, passwd, label_project_id, is_download_image=False):
        user_name = self.certify(key, passwd)

        message = f"{user_name}님이 라벨프로젝트 coco변환 작업을 요청하셨습니다.\n 라벨프로젝트 아이디 : {label_project_id} | 이미지 다운 여부 {is_download_image}"
        self.utilClass.sendSlackMessage(message, data_part=True)

        try:
            label_project_dict = model_to_dict(self.dbClass.getLabelProjectsById(label_project_id))

            annotations = []
            result_class_names = []
            labelclasses = self.dbClass.getCoCoLabelClassesByLabelProjectId(label_project_id)
            progress = 1

            for labelclass in labelclasses:
                label_project_dict['labelclasses'] = model_to_dict(labelclass)
                message = f"{user_name}님이 요청하신 {label_project_id}번 라벨프로젝트 {labelclass.name} 클래스({progress}/{len(labelclasses)})의 라벨 변환이 시작되었습니다.\n"
                progress += 1
                self.utilClass.sendSlackMessage(message, data_part=True)

                label_project_dict['labels'] = self.dbClass.getLabelsByLabelClassId(labelclass.id)
                sthreefiles_ids = [ObjectId(label['sthreefile']) for label in label_project_dict['labels']]
                label_project_dict['sthreefile'] = self.dbClass.getDonesthreefilesByIds(sthreefiles_ids)

                if is_download_image:
                    label_project_dict['sthreefile'], label_project_dict['labels'] = self.download_sthreefile(
                        label_project_dict['sthreefile'], label_project_dict['labels'], label_project_dict['id'],
                        labelclass.name)

                images = []
                int_id_dict = {}
                labels_count = 1
                images_count = 1

                for sthreefile in label_project_dict['sthreefile']:
                    fileName = '/images/' + sthreefile['fileName']
                    int_id_dict[sthreefile['id']] = images_count
                    images_count += 1
                    images.append({
                        "id": int_id_dict[sthreefile['id']],
                        "file_name": fileName,
                        "width": int(sthreefile['width']),
                        "height": int(sthreefile['height'])
                    })

                for label in label_project_dict['labels']:

                    if label['status'] != 'done' or label['labelclass'] != label_project_dict['labelclasses']['id']:
                        continue

                    if not int_id_dict.get(label['sthreefile']):
                        continue

                    label_project_dict['temp'] = self.dbClass.getsthreefilesBySthreeFile(label['sthreefile'])

                    width = label_project_dict['temp'][0]['width']
                    height = label_project_dict['temp'][0]['height']
                    if label['labeltype'] == 'box':
                        points = [[round(width * label['x']), round(height * label['y']),
                                   round(width * label['x']), round(height * (label['y'] + label['h'])),
                                   round(width * (label['x'] + label['w'])), round(height * (label['y'] + label['h'])),
                                   round(width * (label['x'] + label['w'])), round(height * label['y'])]]
                        numpyarray = np.array(points).reshape((-1, 2))
                        npmin = np.min(numpyarray, axis=0)
                        npmax = np.max(numpyarray, axis=0)
                        area = (int(npmax[0]) - int(npmin[0])) * (int(npmax[1]) - int(npmin[1]))
                    elif label['labeltype'] == 'polygon':
                        basiclist = ast.literal_eval(label['points']) if type(label['points']) == str else label[
                            'points']
                        for basictemp in basiclist:
                            basictemp[0] = round(basictemp[0] * width)
                            basictemp[1] = round(basictemp[1] * height)
                        numpyarray = np.array(basiclist)
                        points = ast.literal_eval(str(basiclist).replace('], [', ', '))
                        area = int(self.calcPolygonArea(numpyarray))
                    npmin = np.min(numpyarray, axis=0)
                    npmax = np.max(numpyarray, axis=0)
                    bbox = [int(npmin[0]), int(npmin[1]), int(npmax[0]) - int(npmin[0]), int(npmax[1]) - int(npmin[1])]

                    data = {
                        "segmentation": points,
                        "area": area,
                        "iscrowd": 0,
                        "ignore": 0,
                        "image_id": int_id_dict[label['sthreefile']],
                        "bbox": bbox,
                        "category_id": label['labelclass'],
                        "id": labels_count
                    }
                    labels_count += 1

                    annotations.append(data)

                categories = [{
                    "supercategory": "none",
                    "id": label_project_dict['labelclasses']['id'],
                    "name": label_project_dict['labelclasses']['name']
                }]

                result = {"images": images, "type": "instances", "annotations": annotations,
                                 "categories": categories}

                with open(f'{os.getcwd()}/temp/{label_project_dict["id"]}/{labelclass.name}/coco.json', 'w') as outfile:
                    json.dump(result, outfile, indent=4)

                result_class_names.append(labelclass.name)

                images = []
                annotations = []
                categories = []

            zip_file_path = f"{os.getcwd()}/temp/{label_project_dict['id']}/coco.zip"
            data_path = f"{os.getcwd()}/temp/{label_project_dict['id']}"
            self.zip_file(zip_file_path, data_path=data_path, is_get_image=is_download_image, class_names=result_class_names)

            self.s3.upload_file(zip_file_path, self.utilClass.bucket_name,
                                f'user/{label_project_dict["user"]}/labelproject/{label_project_dict["id"]}/coco.zip')
            s3Url = urllib.parse.quote(
                f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{label_project_dict["user"]}/labelproject/{label_project_dict["id"]}/coco.zip').replace(
                'https%3A//', 'https://')

            if self.utilClass.configOption == 'enterprise':
                s3Url = f'user/{label_project_dict["user"]}/labelproject/{label_project_dict["id"]}/coco.zip'

        except:
            message = f"{user_name}님이 요청하신 {label_project_id}번 라벨프로젝트 coco변환 작업에 에러가 발생하였습니다.\n{traceback.format_exc()}"
            self.utilClass.sendSlackMessage(message, data_part=True)

        # result = json.dumps(result, ensure_ascii=False)
        message = f"{user_name}님이 요청하신 {label_project_id}번 라벨프로젝트 coco변환 작업이 완료되었습니다.\n"
        self.utilClass.sendSlackMessage(message, data_part=True)
        return HTTP_200_OK, {"result": s3Url}

    def zip_file(self, zip_path, data_path, is_get_image, class_names:list=[]):

        commands = f'cd {data_path}; zip {zip_path} coco.json'
        if is_get_image:
            for class_name in class_names:
                commands += f' {class_name}/*'
                commands += f' {class_name}/images/*'
        process = subprocess.Popen('/bin/bash', stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        out, err = process.communicate(commands.encode('utf-8'))

    def download_sthreefile(self, sthreefiles, labels, labelproject_id, labelclass_name):
        for sthreefile in sthreefiles:
            folder_path = f'{os.getcwd()}/temp/{labelproject_id}/{labelclass_name}/images'

            if not os.path.isdir(folder_path):
                os.makedirs(folder_path)
            download_path = f"{folder_path}/{sthreefile['fileName']}"

            try:
                s3_download_url = urllib.parse.unquote_plus(f"user/{sthreefile['s3key'].split('/user/')[1]}")
                self.s3.download_file(self.utilClass.bucket_name, s3_download_url, download_path)
            except:
                self.utilClass.sendSlackMessage(
                    f"파일 : checkDataset\n 함수 : exportCoCo \n exportCoCo 파일 다운로드 에러 발생 - {sthreefile['fileName']}\n 에러 내용 = {traceback.format_exc()})",
                    appError=True)
                print(traceback.format_exc())
                pass
            if not os.path.isfile(download_path):
                [labels.remove(x) for x in self.dbClass.getLabelsBySthreefileId(sthreefile['id'])]
                sthreefiles.remove(self.dbClass.getSthreeFileById(sthreefile['id']))
        return sthreefiles, labels

    def calcPolygonArea(self, points):
        return 0.5 * np.abs(np.dot(points[:, 0], np.roll(points[:, 1], 1))
                            - np.dot(points[:, 1], np.roll(points[:, 0], 1)))

    def get_count_by_label(self, key, passwd, label_project_id, label_class):

        user_name = self.certify(key, passwd)
        message = f"{user_name}님이 이미지 개수 조회 작업을 요청하셨습니다.\n 라벨프로젝트 아이디 : {label_project_id} 라벨 클래스 : {label_class}"
        self.utilClass.sendSlackMessage(message, data_part=True)

        sthree_count_with_label = self.dbClass.get_sthreefile_with_label_exists(label_project_id, True, is_count=True)
        sthree_count_by_label_class = None
        if label_class:
            class_id = self.dbClass.get_labelclass_id_by_name(label_project_id, label_class).id
            if class_id is None:
                return HTTP_200_OK, {'msg': '해당 라벨 클래스가 없습니다.'}
            sthree_count_by_label_class = self.dbClass.get_sthreefile_by_label_id(label_project_id, class_id, is_count=True)

        result = {
            'count_with_label': sthree_count_with_label,
            'count_by_label_class': sthree_count_by_label_class
        }

        return HTTP_200_OK, result


    def update_file_status(self, key, passwd, label_project_id, pre_status, post_status, only_no_label, is_delete_label, label_class, count):
        # if pre_status == post_status:
        #     return HTTP_200_OK, {'result': 'Fail',
        #                          'msg': '파일의 변경 전 상태와 변경 후 상태가 같을 수 없습니다.'}

        user_name = self.certify(key, passwd)
        no_label_text = '없음' if only_no_label else '전체'
        count_text = '전체' if count is None else count
        message = f"{user_name}님이 작업물 상태 변경 작업을 요청하셨습니다.\n 라벨프로젝트 아이디 : {label_project_id} | 변경 전 상태 : {pre_status} | 변경 후 상태 : {post_status} \n" \
                  f"| 라벨 클래스 : {label_class} | 라벨 유무 : {no_label_text} | 라벨 삭제 여부 : {is_delete_label} | 변경할 파일 수 : {count_text}"
        self.utilClass.sendSlackMessage(message, data_part=True)

        sthree_id_list = []
        object_sthree_id_list = []
        class_id = None
        label_project_raw = self.dbClass.getLabelProjectsById(label_project_id)
        # 라벨링이 없는 경우
        if only_no_label:
            is_delete_label = False
            label_class = None
            if label_project_raw.workapp == 'object_detection':
                sthree_result = self.dbClass.get_sthreefile_with_label_exists(label_project_id, False)
                if sthree_result is None:
                    message = f"{user_name}님의 작업물 상태 변경 결과 : \n해당 조건의 파일이 없습니다."
                    self.utilClass.sendSlackMessage(message, data_part=True)
                    return HTTP_200_OK, {'modified_file_count': 0}
                for sthree in sthree_result:
                    object_sthree_id_list.append(ObjectId(sthree['id']))
                condition = {
                    "$and": [{"labelproject": label_project_id}, {"status": pre_status}, {"_id": {"$in": object_sthree_id_list}}]}
            else:
                condition = {
                    "$and": [{"labelproject": label_project_id}, {"status": pre_status},
                             {"labelData": None}]}
        else:
            # 특정 라벨 클래스일 경우
            if label_class:
                if label_project_raw.workapp == 'object_detection':
                    class_id = self.dbClass.get_labelclass_id_by_name(label_project_id, label_class).id
                    sthree_result = self.dbClass.get_sthreefile_by_label_id(label_project_id, class_id)
                    if sthree_result is None:
                        message = f"{user_name}님의 작업물 상태 변경 결과 : \n해당 라벨 클래스에 속하는 파일이 없습니다."
                        self.utilClass.sendSlackMessage(message, data_part=True)
                        return HTTP_200_OK, {'result': 'Fail',
                                             'msg': '해당 라벨 클래스에 속하는 파일이 없습니다.',
                                             'modified_file_count': 0}
                    for idx, sthree in enumerate(sthree_result):
                        sthree_id_list.append(sthree['sthreefile'])
                        object_sthree_id_list.append(ObjectId(sthree['sthreefile']))
                        if idx + 1 == count:
                            break
                    condition = {
                        "$and": [{"labelproject": label_project_id}, {"status": pre_status}, {"_id": {"$in": object_sthree_id_list}}]}
                else:
                    condition = {
                        "$and": [{"labelproject": label_project_id}, {"status": pre_status},
                                 {"labelData": label_class}]}
            else:
                condition = {
                    "$and": [{"labelproject": label_project_id}, {"status": pre_status}]}

        data = {"status": post_status}

        result = {}

        # 라벨링 삭제
        if is_delete_label:
            if label_project_raw.workapp == 'object_detection':
                if len(sthree_id_list) == 0:
                    sthree_result = self.dbClass.get_sthreefile_by_labelproject_id_and_status(label_project_id, pre_status)
                    if sthree_result is None:
                        return HTTP_200_OK, {'modified_file_count': 0}
                    for idx, sthree in enumerate(sthree_result):
                        sthree_id_list.append(sthree['id'])
                        object_sthree_id_list.append(ObjectId(sthree['id']))
                        if idx + 1 == count:
                            break
                    condition = {"_id": {"$in": object_sthree_id_list}}
                # 해당 클래스를 가진 파일의 모든 라벨 삭제 -> 해당 라벨에 대한 라벨만 삭제하도록 변경해야 함
                delete_result = self.dbClass.removeLabelByStrhreeFile(sthree_id_list, class_id)
                if type(delete_result) == list:
                    deleted_count = 0
                else:
                    deleted_count = delete_result.deleted_count
                result['deleted_label_count'] = deleted_count
            elif label_project_raw.workapp == 'image':
                data = {"status": post_status, "labelclass": None, "labelData": None}
            else:
                data = {"status": post_status, "labelData": None}

        # 상태 변경
        update_result = self.dbClass.updateSthreeFileByCondition(condition, data, count)
        if type(update_result) == list:
            modified_count = 0
        else:
            modified_count = update_result.modified_count

        result['modified_file_count'] = modified_count
        if result.get('deleted_label_count', None) is None:
            result['deleted_label_count'] = modified_count

        if not is_delete_label:
            result['deleted_label_count'] = 0

        message = f"{user_name}님의 작업물 상태 변경 결과 : \n변경된 파일 수 : {result['modified_file_count']}, 삭제된 라벨 수 : {result['deleted_label_count']}"
        self.utilClass.sendSlackMessage(message, data_part=True)

        return HTTP_200_OK, result

    def get_amount(self, key, passwd, label_project_id, calculate_type, price_per_image, price_per_label_create, price_per_label_modify, price_per_label_delete):
        user_name = self.certify(key, passwd)
        message = f"{user_name}님이 라벨링 정산 작업을 요청하셨습니다.\n 라벨프로젝트 아이디 : {label_project_id} 정산 라벨링 타입 : {calculate_type}"
        self.utilClass.sendSlackMessage(message, data_part=True)

        result = []

        type_list = ['create', 'modify', 'delete']
        price_per_type_list = [price_per_label_create, price_per_label_modify, price_per_label_delete]

        image_count_dict = self.dbClass.get_image_count_by_workassignee(label_project_id)
        if image_count_dict:
            for count_dict in image_count_dict:
                if count_dict['id']:
                    worker_dict = {}
                    worker_dict['work_assignee'] = count_dict['id']
                    image_count = count_dict['count']
                    worker_dict['image_count'] = image_count
                    worker_dict['image_amount'] = image_count * price_per_image

                    user_id = self.dbClass.getUserByEmail(count_dict['id'])['id']

                    if user_id:
                        total_label_amount = 0
                        for idx, type in enumerate(type_list):
                            label_count_dict = self.dbClass.get_label_count_by_workassignee(label_project_id, user_id, type)
                            label_count = 0
                            if label_count_dict:
                                label_count = label_count_dict['count']
                            per_price = price_per_type_list[idx]
                            worker_dict_key = f'label_{type}_count'
                            worker_dict[worker_dict_key] = label_count
                            worker_dict_key = f'label_{type}_amount'
                            worker_dict[worker_dict_key] = label_count * per_price
                            total_label_amount += worker_dict[worker_dict_key]
                        worker_dict['total_label_amount'] = total_label_amount
                    if calculate_type == 'all':
                        total_price = worker_dict['image_amount'] + worker_dict['total_label_amount']
                    elif calculate_type == 'image':
                        total_price = worker_dict['image_amount']
                    elif calculate_type == 'label':
                        total_price = worker_dict['total_label_amount']
                    worker_dict['total_price'] = total_price
                    result.append(worker_dict)

        return HTTP_200_OK, result
