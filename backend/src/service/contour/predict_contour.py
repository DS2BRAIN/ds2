import os
import traceback
import uuid

import cv2
import pandas as pd
import numpy as np
import requests
from PIL import Image as PILImage

import torch
import platform

if "1.4.0" not in torch.__version__ and 'Darwin' not in platform.system():
    from detectron2.config import get_cfg
    from detectron2.engine import DefaultPredictor
    from detectron2.utils.visualizer import GenericMask
from fastai.vision import *
from starlette.responses import JSONResponse, StreamingResponse
from starlette.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_503_SERVICE_UNAVAILABLE
from torch.utils.data import DataLoader

from src.errors.exceptions import NotExistFileEx, FailedPredictEx
from src.service.contour.contour import Contour
from src.service.contour.contour.config import ContourMethodType
from src.util import Util
from models.helper import Helper
from src.rcf.main import RCF
import urllib.parse
import io

class PredictContour:
    def __init__(self):

        pd.options.display.float_format = '{:.5f}'.format

        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.s3 = self.utilClass.getBotoClient('s3')

    def init_model(self):
        # TODO:: 미리 모델을 생성한 후, 이미지 불러올때마다 모델 수행하는 것이 맞는가?
        pass

    def get_image_by_s3key(self, s3key):
        if len(s3key) == 0:
            raise NotExistFileEx()

        if self.utilClass.configOption != 'enterprise':
            try:
                # 파일 읽기
                # file = self.s3.get_object(Bucket=self.utilClass.bucket_name, Key=parse.unquote(file_path))['Body'].read()
                content = requests.get(s3key).content
                image = np.frombuffer(content, dtype='uint8')
                image = cv2.imdecode(image, cv2.IMREAD_COLOR)
                return image
            except Exception as e:
                raise e
        else:
            image = cv2.imread(s3key)
        return image

    def get_contour_by_s3_file(
            self,
            sthree_file_info: dict,
            x1: int,
            y1: int,
            x2: int,
            y2: int,
            threshold: float = 0.35,
            contour_type: int = ContourMethodType.U2NET,
            pre_threshold: float = 0.7,
    ):
        """
        contour_type 1 : ContourMethodType.U2NET
        contour_type 2 : ContourMethodType.BDCN
        contour_type 3 : ContourMethodType.COMBINED

        """

        # s3key값 가져오기 및 체크
        s3key = sthree_file_info.get('s3key', '')

        # 파일 읽기
        image = self.get_image_by_s3key(s3key)
        try:
            # 윤곽선 좌표 정보
            status, result = self.get_contour(image, x1, y1, x2, y2, threshold, contour_type, pre_threshold)
        except Exception as e:
            print(traceback.format_exc())
            self.utilClass.sendSlackMessage(
                f"매직툴 예측을 실패하였습니다.\n" + str(traceback.format_exc()) +
                f'\nfileId: {sthree_file_info["id"]}'
                f'\ns3key: {s3key}',
                appLog=True)

            # 에러메시지
            raise FailedPredictEx(model_name='magic tool', ex=e)
        else:
            self.utilClass.sendSlackMessage(f"매직툴 예측을 수행하였습니다.", appLog=True)

        return status, result

    def get_contour(
            self,
            image: np.ndarray,
            x1: int,
            y1: int,
            x2: int,
            y2: int,
            threshold: float = 0.35,
            contour_type: int = ContourMethodType.U2NET,
            pre_threshold: float = 0.7,
            device='cpu',
            return_type='json'
    ) -> (int, list):
        if (x1 == x2 and y1 == y2) and (0 <= threshold <= 1.0) and contour_type in ContourMethodType.get_type_list():
            return HTTP_400_BAD_REQUEST, []

        # 이미지 불러오기 및 이미지 크기 설정
        # image = np.frombuffer(file, dtype='uint8')
        # image = cv2.imdecode(image, cv2.IMREAD_COLOR)
        width = x2 - x1
        height = y2 - y1

        # polygon = self.get_contour_by_detectron2(im_crop, width, height)

        contour_type_info = Contour.get_contour_type(contour_type)
        model_name = contour_type_info.get('model_name', 'u2net')
        pre_model_name = contour_type_info.get('pre_model_name', None)
        is_apply_pre_model = contour_type_info.get('is_apply_pre_model', False)
        # ContourMethodType.U2NET: {'model_name': 'u2net', 'pre_model_name': None, 'is_apply_pre_model': False},

        # 결과 변수 초기화
        # https://aimakerdslab.s3.ap-northeast-2.amazonaws.com/asset/u2netp.pth
        model = self.load_model(model_name=model_name, pre_model_name=pre_model_name, device=device)
        contour_points = model.get_contour_point(
            image=image,
            x=x1,
            y=y1,
            width=width,
            height=height,
            thresh=threshold,
            is_apply_pre_model=is_apply_pre_model,
            pre_threshold=pre_threshold,
        )

        if return_type == "contour":
            return contour_points

        if contour_points is not None:
            contour_points = [contour_point.tolist() for contour_point in contour_points]
            return HTTP_200_OK, JSONResponse(content=contour_points)
        else:
            return HTTP_400_BAD_REQUEST, []

    def load_model(
            self,
            model_name: str = 'u2net',
            pre_model_name: str = None,
            device: str = 'cpu'
    ) -> Contour:
        for filepath in (pre_model_name, model_name):
            if filepath is None:
                continue

            model_path = Contour.get_model_path(filepath)
            if not os.path.exists(model_path):
                self.util_class = Util()
                self.s3 = self.util_class.getBotoClient('s3')
                filename = os.path.split(model_path)[-1]
                server_filepath = f'asset/{filename}'
                bucket_name = 'aimakerdslab'  # self.util_class.bucket_name

                os.makedirs(os.path.dirname(model_path), exist_ok=True)
                self.s3.download_file(bucket_name, server_filepath, model_path)

        return Contour(model_name=model_name, pre_model_name=pre_model_name, device=device)

    def update_contour_with_points(
            self,
            sthree_file_info: dict,
            x1: int,
            y1: int,
            x2: int,
            y2: int,
            contour_points: list,
            positive_points: list = (),
            negative_points: list = (),
            threshold: float = 0.35,
            priority: str = 'negative',
    ):
        # s3key로 파일 가져오기 및 이미지로 변환
        s3key = sthree_file_info.get('s3key', '')
        image = self.get_image_by_s3key(s3key)
        width = x2 - x1
        height = y2 - y1

        # Get updated contour
        model = self.load_model(model_name='bdcn')
        update_contour = model.update_contour_with_points(
            image=image,
            x=x1,
            y=y1,
            width=width,
            height=height,
            contour_points=contour_points,
            positive_points=positive_points,
            negative_points=negative_points,
            thresh=threshold,
            priority=priority,
        )

        if update_contour is not None:
            update_contour = update_contour.tolist()
            return HTTP_200_OK, JSONResponse(content=update_contour)
        else:
            return HTTP_400_BAD_REQUEST, []

    def get_object_area(
            self,
            sthree_file_info: dict,
            x1: int,
            y1: int,
            x2: int,
            y2: int,
            threshold: float = 0.4
    ):
        s3key = sthree_file_info.get('s3key', '')
        image = self.get_image_by_s3key(s3key)
        crop_image = image[y1:y2, x1:x2].copy()

        model_name = 'bdcn'
        model = self.load_model(model_name=model_name)
        output = model.get_object_area(crop_image, model_name=model_name, threshold=threshold) * 255
        success, encoded_image = cv2.imencode('.png', output)
        output_bytes = encoded_image.tobytes()
        return HTTP_200_OK, StreamingResponse(io.BytesIO(output_bytes), media_type="image/png")

    def get_contour_by_detectron2(self, image, width, height):
        # 좌표점 값 초기화
        polygon = []

        # detectron 모델 및 설정 파일 경로
        detectron_model_path = r"/opt/objectDetectModelFile/COCO-InstanceSegmentation/mask_rcnn_R_50_C4_3x/137849525/model_final_4ce675.pkl"
        cfg_file_path = os.getcwd() + r"/asset/object_detection_configs/COCO-InstanceSegmentation/mask_rcnn_R_50_C4_3x.yaml"

        # 모델 설정
        cfg = get_cfg()
        cfg.merge_from_file(cfg_file_path)
        cfg.MODEL.WEIGHTS = detectron_model_path
        cfg.SOLVER.IMS_PER_BATCH = 2
        cfg.SOLVER.BASE_LR = 0.02
        cfg.SOLVER.MAX_ITER = 300  # 300 iterations seems good enough, but you can certainly train longer
        cfg.MODEL.ROI_HEADS.BATCH_SIZE_PER_IMAGE = 128  # faster, and good enough for this toy dataset
        cfg.OUTPUT_DIR = './'
        cfg.MODEL.WEIGHTS = os.path.join(cfg.OUTPUT_DIR, detectron_model_path)
        cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5  # set the testing threshold for this model

        # 이미지 인식
        predictor = DefaultPredictor(cfg)
        outputs = predictor(image)

        # mask 가져오기
        predictions = outputs["instances"].to("cpu")
        masks = np.asarray(predictions.pred_masks)
        masks = [GenericMask(x, height, width) for x in masks]

        # 인식된 이미지가 있는 경우에만 진행
        if len(masks) != 0:
            # 면적이 가장 넓은 다각형 선택
            polygon = self.maskToPolygon(masks[0].mask)
            if len(masks) > 1:
                max_area = self.calc_polygon_area(polygon)
                for mask in masks[1:]:
                    # cur_polygon = np.asarray(mask.polygons).reshape(-1, 2)
                    cur_polygon = self.maskToPolygon(mask.mask)
                    area = self.calc_polygon_area(cur_polygon)
                    if max_area < area:
                        polygon = cur_polygon
                        max_area = area

    def filter(self, binary_img, contours, hierarchy, bound):
        # 변수 초기화
        filtered_contours = []
        hierarchy_index_list = []
        final_contour = []
        x, y, width, height = bound

        if width == 0 or height == 0:
            for contour in contours:
                calibrate_contour = self.__calibrate(binary_img, contour, bound)
                if 400 < self.calc_polygon_area(np.reshape(calibrate_contour, (-1, 2))):
                    final_contour.append(calibrate_contour)
        else:
            # 윤곽선이 박스 내에 존재하는지 체크
            for index, contour in enumerate(contours):
                is_include = True

                # 모든 좌표점들이 박스 내에 존재하는지 체크
                for point in contour:
                    # 좌표 정보 가져오기
                    contour_x = point[0][0]
                    contour_y = point[0][1]

                    # # 좌표가 이미지 시작지점에 있는 경우
                    # if contour_x == 0 or contour_y == 0:
                    #     is_include = False
                    #     break

                    # 좌표가 박스 내에 존재하는지 체크
                    if (contour_x < x or contour_x > x + width) or (contour_y < y or contour_y > y + height):
                        is_include = False
                        break

                # 모든 좌표점들이 박스에 포함된 경우, 추가하기
                if is_include:
                    filtered_contours.append(contour)
                    hierarchy_index_list.append(index)

            # 추가된 선들 중 넓이가 가장 큰 것 선택
            if len(filtered_contours) > 0:
                final_contour = filtered_contours[0]
                max_area = self.calc_polygon_area(np.reshape(final_contour, (-1, 2)))
                hierarchy_index = hierarchy_index_list[0]

                if len(filtered_contours) > 1:
                    for index, contour in enumerate(filtered_contours):
                        area = self.calc_polygon_area(np.reshape(contour, (-1, 2)))
                        if max_area < area:
                            max_area = area
                            final_contour = contour
                            hierarchy_index = hierarchy_index_list[index]

                # 최적의 크기 적용
                print('hierarchy', hierarchy[0][hierarchy_index])
                if len(final_contour) > 0:
                    final_contour = self.__calibrate(binary_img, final_contour, bound)

        return final_contour

    def __calibrate(self, binary_img, contour, bound, max_distance=10, maxval=230):
        binary_img = cv2.GaussianBlur(binary_img, (3, 3), 10)
        moment = cv2.moments(contour)
        if moment['m00'] == 0:
            return contour

        # 중심점
        centroid = (int(moment['m10'] / moment['m00']), int(moment['m01'] / moment['m00']))

        # 리스트 구조 변경 (-1, 2)
        contour = contour.reshape(-1, 2)

        # 최대 좌표 가져오기
        shape = binary_img.shape[:2]
        max_y, max_x = shape[0] - 1, shape[1] - 1

        # 좌표 조정
        new_contour = np.copy(contour)
        move_zero = 0
        distance_list = []
        for point in new_contour:
            # 현재 좌표
            x = point[0]
            y = point[1]

            find_zero = False
            new_x, new_y = x, y
            move_zero = 0
            move_not_find_zero = 0
            move = 0

            pre_x, pre_y = x, y
            while move <= max_distance:
                # 이동 거리 구하기
                width, height = self.calc_next_point(pre_x, pre_y, centroid, move_distance=1)

                # 이동한 좌료
                new_x = int(round(new_x + width if new_x > centroid[0] else new_x - width))
                new_y = int(round(new_y + height if new_y > centroid[1] else new_y - height))

                # 좌표 범위 체크 (이미지 크기 고려)
                new_x = 0 if new_x < 0 else max_x if new_x > max_x else new_x
                new_y = 0 if new_y < 0 else max_y if new_y > max_y else new_y

                # 다음 포인트로 이동하지 않은 경우 (이미지 크기 초과)
                if (pre_x == new_x and pre_y == new_y) \
                        and (new_x == max_x or new_y == max_y or new_x == 0 or new_y == 0):
                    break

                if not find_zero:
                    find_zero = binary_img[new_y, new_x] == 0
                    move_not_find_zero += 1

                elif binary_img[new_y, new_x] == maxval:
                    break
                elif move_zero > max_distance:
                    find_zero = False
                    break
                else:
                    move_zero += 1

                move += 1
                pre_x, pre_y = new_x, new_y

            distance_list.append(move)

            # 이동
            if find_zero:
                point[0] = new_x
                point[1] = new_y

        return new_contour

    def calc_polygon_area(self, points):
        return 0.5 * np.abs(np.dot(points[:, 0], np.roll(points[:, 1], 1))
                            - np.dot(points[:, 1], np.roll(points[:, 0], 1)))

    def calc_next_point(self, x, y, centroid, move_distance=1):
        # 최적의 이동 거리 구하기
        if x == centroid[0]:
            width = 0
            height = move_distance
        elif y == centroid[1]:
            width = move_distance
            height = 0
        else:
            gradient = (centroid[1] - y) / (x - centroid[0])
            width = np.sqrt(move_distance ** 2 / (gradient ** 2 + 1))
            height = abs(gradient * width)

        return width, height

    def maskToPolygon(self, mask):
        # cv2.RETR_CCOMP flag retrieves all the contours and arranges them to a 2-level
        # hierarchy. External contours (boundary) of the object are placed in hierarchy-1.
        # Internal contours (holes) are placed in hierarchy-2.
        # cv2.CHAIN_APPROX_NONE flag gets vertices of polygons from contours.
        mask = np.ascontiguousarray(mask)  # some versions of cv2 does not support incontiguous arr
        res = cv2.findContours(mask.astype("uint8"), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        hierarchy = res[-1]
        if hierarchy is None:  # empty mask
            return [], False

        has_holes = (hierarchy.reshape(-1, 4)[:, 3] >= 0).sum() > 0
        res = res[-2]
        contoursArea = [cv2.contourArea(x) for x in res]
        polygon = np.reshape(res[contoursArea.index(np.max(contoursArea))], (-1, 2))

        # res = [x.flatten() for x in res]
        # res = [x for x in res if len(x) >= 6]
        return polygon


def __test__(token, file_id, x1, y1, x2, y2):
    from src.manageLabeling import ManageLabeling
    import matplotlib.pyplot as plt
    import ast

    _, file_info = ManageLabeling().getSthreeFile(token, file_id)
    contour = PredictContour()
    _, polygon = contour.get_contour_by_s3_file(file_info, x1, y1, x2, y2)

    s3key = file_info.get('s3key', '')
    # file_path = s3key[s3key.index('user/'):]
    # file = contour.s3.get_object(Bucket=contour.utilClass.bucket_name, Key=file_path)['Body'].read()

    import requests
    file = requests.get(s3key).content
    im = np.fromstring(file, dtype='uint8')
    im = cv2.imdecode(im, cv2.IMREAD_COLOR)
    im = im[y1:y2, x1:x2]

    polygon = ast.literal_eval(polygon.body.decode())
    polygon = np.reshape(polygon, (-1, 1, 2))
    contour = np.expand_dims(polygon, 0)
    drawIm = cv2.drawContours(im, contour, -1, (255, 255, 255), 2)
    plt.imshow(drawIm)
    plt.show()

    print(polygon.shape)


if __name__ == '__main__':
    file_id = 46514
    token = 'dudgns'
    x1, y1, x2, y2 = 81, 497, 285, 670

    # Test
    __test__(token, file_id, x1, y1, x2, y2)

    request_dict = {
        "file_id": 46514,
        "x1": 81,
        "y1": 497,
        "x2": 285,
        "y2": 670,
        "threshold": 0.35,
        "contour_type": 0,
        "pre_threshold": 0.7
    }

    p_negative_points = [[141, 527]]
