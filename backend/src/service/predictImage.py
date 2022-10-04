# -*- coding: utf-8 -*-

import datetime
import gc
import urllib

import tqdm
from skimage.io import imsave
from starlette.responses import FileResponse, StreamingResponse, JSONResponse
from fastai.vision.all import *
from fastai.tabular.all import *
from models.helper import Helper
from src.util import Util
from src.processing import Processing
import ast
import traceback
import time
from starlette.status import HTTP_200_OK
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
import dateutil.parser
import cv2
from PIL import Image as PILImage
from torch.utils.data import Dataset
from torch.utils.data import DataLoader
from src.rcf.main import RCF
from PIL import Image as pil_image
from httplib2 import Http
import fasttext
import platform
import tensorflow as tf
from tensorflow.python.saved_model import tag_constants
import math

import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel, ViTFeatureExtractor, AutoTokenizer

if "1.4.0" not in torch.__version__ and 'Darwin' not in platform.system():
    from detectron2.data.catalog import Metadata
    from detectron2.structures.instances import Instances
    from detectron2.utils.video_visualizer import VideoVisualizer
    from detectron2.data import MetadataCatalog, DatasetCatalog
    from detectron2.utils.visualizer import ColorMode
    from detectron2.config import CfgNode as CN
    from detectron2.data.datasets import register_coco_instances
    import detectron2
    from detectron2 import model_zoo
    from detectron2.utils.colormap import random_color
    from detectron2.utils.logger import setup_logger
    from detectron2.utils.visualizer import Visualizer, _create_text_labels, GenericMask
    import matplotlib.font_manager as fm
    import matplotlib.pyplot as plt
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
    from detectron2.config import get_cfg
    from detectron2.engine import DefaultPredictor
    from detectron2.model_zoo import model_zoo


class PredictImage:

    class modelArgs():
        phase = 'train'
        epoch = 100
        dataset = 'my_data'
        model = 'contour.pth'
        result = 'my_data'

    def __init__(self):

        pd.options.display.float_format = '{:.5f}'.format

        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.processingClass = Processing()
        # self.predictFaceClass = PredictFace()
        self.app = None
        self.cfg = None
        self.f = None
        if not os.path.exists('./logo_258_94.png'):
            self.s3.download_file("aimakerdslab", 'asset/logo_258_94.png','./logo_258_94.png')
        self.logo_image = cv2.imread('logo_258_94.png')
        self.models = {}

    def getKeypoint(self, image, info=False, isVideo=False, predictor=None, isAngleLabel=False, isGetPredictor=False,
                    isSkip=False, image_standard=None, keypoint_compare_results=None):
        is_loaded_predictor = False
        start_time = datetime.now()
        # print(f"start getKeypoint isSkip:{isSkip}: {datetime.now()}")
        if predictor:
            is_loaded_predictor = True
        else:
            self.cfg = get_cfg()
            self.cfg.merge_from_file(model_zoo.get_config_file("COCO-Keypoints/keypoint_rcnn_R_50_FPN_3x.yaml"))
            self.cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.7  # set threshold for this model
            self.cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url("COCO-Keypoints/keypoint_rcnn_R_50_FPN_3x.yaml")
            predictor = DefaultPredictor(self.cfg)
            if isGetPredictor:
                return predictor, None

        # print(f"load self.cfg : {datetime.now() - start_time}")
        # with torch.no_grad():
        #     outputs = predictor(image)
        #     self.f = outputs["instances"].to("cpu")

        if not isSkip or not self.f:
            with torch.no_grad():
                outputs = predictor(image)
                self.f = outputs["instances"].to("cpu")

        # print(f"load self.f : {datetime.now() - start_time}")

        #TODO: v2 에서 시간이 많이 끄므로 선 긋고 나면 나머지 포인트를 제거 하고 선만 보여주게 해서 속도 개선되는지 확인
        # print(f"load v : {datetime.now() - start_time}")
        outputImage = image
        # if not isSkip:
        #     if self.cfg:
        #         v = Visualizer(image[:, :, ::-1], MetadataCatalog.get(self.cfg.DATASETS.TRAIN[0]))
        #     else:
        #         v = Visualizer(image[:, :, ::-1])
        #     v2 = v.draw_instance_predictions(self.f)
        #     print(f"load v2 : {datetime.now() - start_time}")
        #     get_image = v2.get_image()
        #     outputImage = get_image[:, :, ::-1]
        #     print(f"load outputImage : {datetime.now() - start_time}")
        #     v, v2 = None, None
        original_h, original_w, _ = image.shape

        boxes = self.f.pred_boxes.tensor.numpy()
        # print(f"get boxes : {datetime.now() - start_time}")
        outputs = None
        if not is_loaded_predictor:
            predictor = None
        # print(f"gc collect : {datetime.now() - start_time}")
        # if isVideo:
        #     return outputImage
        if info:
            fieldRaw = self.f._fields if self.f._fields else {}

            field = {}
            for key, values in fieldRaw.items():
                try:
                    field[key] = values.tensor.tolist()
                except:
                    field[key] = values.tolist()
                    pass

            return field, None

        if isAngleLabel:
            keypoints = self.f.pred_keypoints.numpy()
            # print(f"iter : {datetime.now() - start_time}")
            outputImage, angle_data, _ = self.process_keypoint(image, boxes, keypoints)

            if image_standard is not None and not isSkip:
                with torch.no_grad():
                    f_standard = predictor(image_standard)
                    image_standard_h, image_standard_w, _ = image_standard.shape
                    f_standard_output = f_standard["instances"].to("cpu")
                    boxes_standard = f_standard_output.pred_boxes.tensor.numpy()
                    keypoints_standard = f_standard_output.pred_keypoints.numpy()

                    if len(keypoints) != len(keypoints_standard):
                        return outputImage, None

                    output_standard, angle_data_standard, _ = self.process_keypoint(image_standard, boxes_standard,
                                                                                    keypoints_standard)

                    distance_score = 1
                    angle_score = 1
                    distance_offset_x = 0
                    distance_offset_y = 0
                    person_count = len(angle_data.keys())

                    for index, person in angle_data.items():
                        bbox = person['bbox']
                        bbox_standard = angle_data_standard[index]['bbox']

                        bbox_center_x = (bbox[0] + bbox[2]) / 2 / original_w
                        bbox_center_y = (bbox[1] + bbox[3]) / 2 / original_h
                        bbox_standard_center_x = (bbox_standard[0] + bbox_standard[2]) / 2 / image_standard_w
                        bbox_standard_center_y = (bbox_standard[1] + bbox_standard[3]) / 2 / image_standard_h

                        if index == 0:
                            distance_offset_x = bbox_center_x - bbox_standard_center_x
                            distance_offset_y = bbox_center_y - bbox_standard_center_y

                        bbox_diff = abs(bbox_center_x - bbox_standard_center_x - distance_offset_x)
                        distance_score -= bbox_diff / person_count

                        angle = person['angle']
                        angle_standard = angle_data_standard[index]['angle']
                        angle_diff = 0
                        if not len(angle.keys()):
                            continue
                        for index_angle, angle_value in angle.items():
                            if not angle_standard.get(index_angle):
                                continue
                            angle_standard_value = angle_standard[index_angle]
                            angle_diff += abs(angle_value - angle_standard_value) / 180

                        angle_score = 1 - angle_diff / len(angle.keys())

                    if math.isnan(angle_score):
                        angle_score = keypoint_compare_results['angle_score']
                    keypoint_compare_result = {
                        "total_score": (distance_score + angle_score) / 2,
                        "distance_score": distance_score,
                        "angle_score": angle_score,
                    }

                    total_scores = keypoint_compare_results['total_score']
                    distance_scores = keypoint_compare_results['distance_score']
                    angle_scores = keypoint_compare_results['angle_score']
                    total_num = keypoint_compare_results['num']

                    total_score = round((total_scores * total_num + keypoint_compare_result['total_score']) / (total_num + 1), 5)
                    distance_score = round((distance_scores * total_num + keypoint_compare_result['distance_score']) / (total_num + 1), 5)
                    angle_score = round((angle_scores * total_num + keypoint_compare_result['angle_score']) / (total_num + 1), 5)

                    self.draw_text(outputImage, f"total : {round(total_score * 100, 3)}%, distance : {round(distance_score * 100, 3)}%, angle : {round(angle_score * 100, 3)}%,", font_scale=0.5,
                                   pos=(50, original_h - 50))
                    print(f"finish : {datetime.now() - start_time}")
                    return outputImage, keypoint_compare_result

        else:
            if self.cfg:
                v = Visualizer(image[:, :, ::-1], MetadataCatalog.get(self.cfg.DATASETS.TRAIN[0]))
            else:
                v = Visualizer(image[:, :, ::-1])
            v2 = v.draw_instance_predictions(self.f)
            print(f"load v2 : {datetime.now() - start_time}")
            get_image = v2.get_image()
            outputImage = get_image[:, :, ::-1]
            print(f"load outputImage : {datetime.now() - start_time}")
            v, v2 = None, None

        # print(f"skipped : {datetime.now() - start_time}")
        if keypoint_compare_results is not None:
            total_score = round(keypoint_compare_results['total_score'], 5)
            distance_score = round(keypoint_compare_results['distance_score'], 5)
            angle_score = round(keypoint_compare_results['angle_score'], 5)

            if image_standard is not None:
                self.draw_text(outputImage,
                           f"total : {round(total_score * 100, 3)}, distance : {round(distance_score * 100, 3)}, angle : {round(angle_score * 100, 3)},",
                           font_scale=0.5,
                           pos=(50, original_h - 50))

        # print(f"finish - skipped : {datetime.now() - start_time}")
        return outputImage, None

    def getPanoptic(self, image, info=False, predictor=None, isGetPredictor=False):
        is_loaded_predictor = False
        if predictor:
            is_loaded_predictor = True
        else:
            self.cfg = get_cfg()
            self.cfg.merge_from_file(model_zoo.get_config_file("COCO-PanopticSegmentation/panoptic_fpn_R_101_3x.yaml"))
            self.cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url("COCO-PanopticSegmentation/panoptic_fpn_R_101_3x.yaml")
            predictor = DefaultPredictor(self.cfg)
            if isGetPredictor:
                return predictor
        with torch.no_grad():
            panoptic_seg, segments_info = predictor(image)["panoptic_seg"]
            v = Visualizer(image[:, :, ::-1], MetadataCatalog.get(self.cfg.DATASETS.TRAIN[0]))
            v2 = v.draw_panoptic_seg_predictions(panoptic_seg.to("cpu"), segments_info)
            outputImage = v2.get_image()[:, :, ::-1]
            output = v.output
            v, v2, outputs = None, None, None
            gc.collect()
            torch.cuda.empty_cache()
            if info:
                fieldRaw = detectron2.structures.Instances(image_size=(output.height, output.width))
                fieldRaw.set('pred_masks', segments_info)
                return fieldRaw
            return outputImage

    def getFaceDetect(self, image, info=False, half=False):
        if not os.path.exists('./h.xml'):
            self.s3.download_file("aimakerdslab", 'asset/h.xml','./h.xml')
        xml = './h.xml'
        face_cascade = cv2.CascadeClassifier(xml)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(gray, 1.05, 5)
        print("Number of faces detected: " + str(len(faces)))

        if len(faces):
            for (x, y, w, h) in faces:
                if half:
                    h = int(h / 2)
                face_img = image[y:y + h, x:x + w]  # 인식된 얼굴 이미지 crop
                face_img = cv2.resize(face_img, dsize=(0, 0), fx=0.04, fy=0.04)  # 축소
                face_img = cv2.resize(face_img, (w, h), interpolation=cv2.INTER_AREA)  # 확대
                image[y:y + h, x:x + w] = face_img  # 인식된 얼굴 영역 모자이크 처리
        if info:
            return faces
        outputImage = image
        return outputImage

    def getOCR(self, file, image, info=False):

        if not self.models.get("OCR"):
            self.models["OCR"] = {
                "processor": TrOCRProcessor.from_pretrained('microsoft/trocr-base-printed'),
                "model": VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-printed')
            }

        pixel_values = self.models["OCR"]["processor"](images=image, return_tensors="pt").pixel_values
        generated_ids = self.models["OCR"]["model"].generate(pixel_values)
        generated_text = self.models["OCR"]["processor"].batch_decode(generated_ids, skip_special_tokens=True)[0]

        result = json.dumps({"predict_value": generated_text}, default=self.convert, ensure_ascii=False)
        return result

    def get_image_to_text(self, file, image, info=False):

        if not self.models.get("image_to_text"):
            self.models["image_to_text"] = {
                "feature_extractor": ViTFeatureExtractor.from_pretrained("nlpconnect/vit-gpt2-image-captioning"),
                "tokenizer": AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning"),
                "model_image_to_text": VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
            }

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.models["image_to_text"]["model_image_to_text"].to(device)

        max_length = 16
        num_beams = 4
        gen_kwargs = {"max_length": max_length, "num_beams": num_beams}

        pixel_values = self.models["image_to_text"]["feature_extractor"](images=[image],
                                                                         return_tensors="pt").pixel_values
        pixel_values = pixel_values.to(device)
        output_ids = self.models["image_to_text"]["model_image_to_text"].generate(pixel_values, **gen_kwargs)
        preds = self.models["image_to_text"]["tokenizer"].batch_decode(output_ids, skip_special_tokens=True)
        generated_text = [pred.strip() for pred in preds]

        result = json.dumps({"predict_value": generated_text}, default=self.convert, ensure_ascii=False)
        return result

    def getFaceLandmark(self, image, info=False, predictor=None):
        if not predictor:
            checkpoint_path = f'{self.utilClass.save_path}/HR18-WFLW.pth'
            config_path = f'{self.utilClass.save_path}/HR18-WFLW.yaml'

            if not os.path.exists(checkpoint_path):
                self.s3.download_file("aimakerdslab", 'asset/HR18-WFLW.pth', checkpoint_path)
            if not os.path.exists(config_path):
                self.s3.download_file("aimakerdslab", 'asset/HR18-WFLW.yaml', config_path)

            from src.training.utils_inference import get_lmks_by_img, get_model_by_name, get_preds, decode_preds, crop
            from src.training.utils_landmarks import show_landmarks, get_five_landmarks_from_net, alignment_orig, \
                set_circles_on_img

            predictor = get_model_by_name('WFLW', device='cuda')
        lmks = get_lmks_by_img(predictor, image)
        print("lmks")
        print(lmks)
        outputImage = set_circles_on_img(image, lmks, circle_size=3, color=(255, 0, 0), is_copy=True)

        if info:
            print("1")

            def convert(o):
                if isinstance(o, np.int64): return int(o)
                return o

            fieldRaw = json.dumps(lmks, default=convert)
            print(fieldRaw)
            return HTTP_200_OK, fieldRaw

        return outputImage

    def getObjectTracking(self, frame, frame_num, tracker, areas, trackers_result, areas_result,
                          infer, encoder, marketproject, isSkip=False):

        from src.training.deepsort.deep_sort import preprocessing, nn_matching
        from src.training.deepsort.deep_sort.detection import Detection
        from src.training.deepsort.deep_sort.tracker import Tracker
        from src.training.deepsort.tools import generate_detections as gdet
        import src.training.deepsort.core.utils as utils
        from src.training.deepsort.core.yolov4 import filter_boxes
        from src.training.deepsort.core.config import cfg

        # initialize color map
        cmap = plt.get_cmap('tab20b')
        colors = [cmap(i)[:3] for i in np.linspace(0, 1, 20)]
        # start_time = time.time()
        original_h, original_w, _ = frame.shape

        frame[0: 94, original_w - 258: original_w] = self.logo_image

        if not isSkip:
            frame_size = frame.shape[:2]
            image_data = cv2.resize(frame, (416, 416))
            image_data = image_data / 255.
            image_data = image_data[np.newaxis, ...].astype(np.float32)
            # run detections on tflite if flag is set

            batch_data = tf.constant(image_data)
            start_predict_time = time.time()
            pred_bbox = infer(batch_data)
            print(f"YOLO FPS: {1 / (time.time() - start_predict_time)}")
            for key, value in pred_bbox.items():
                boxes = value[:, :, 0:4]
                pred_conf = value[:, :, 4:]

            boxes, scores, classes, valid_detections = tf.image.combined_non_max_suppression(
                boxes=tf.reshape(boxes, (tf.shape(boxes)[0], -1, 1, 4)),
                scores=tf.reshape(
                    pred_conf, (tf.shape(pred_conf)[0], -1, tf.shape(pred_conf)[-1])),
                max_output_size_per_class=50,
                max_total_size=50,
                iou_threshold=0.45,
                score_threshold=0.5
            )

            # convert data to numpy arrays and slice out unused elements
            num_objects = valid_detections.numpy()[0]
            bboxes = boxes.numpy()[0]
            bboxes = bboxes[0:int(num_objects)]
            scores = scores.numpy()[0]
            scores = scores[0:int(num_objects)]
            classes = classes.numpy()[0]
            classes = classes[0:int(num_objects)]

            # format bounding boxes from normalized ymin, xmin, ymax, xmax ---> xmin, ymin, width, height

            bboxes = utils.format_boxes(bboxes, original_h, original_w)

            # store all predictions in one parameter for simplicity when calling functions
            pred_bbox = [bboxes, scores, classes, num_objects]

            # read in all class names from config
            class_names = utils.read_class_names(cfg.YOLO.CLASSES)

            # by default allow all classes in .names file
            allowed_classes = list(class_names.values())

            # custom allowed classes (uncomment line below to customize tracker for only people)
            allowed_classes = ['person']
            if marketproject and marketproject.service_type == 'offline_ad':
                allowed_classes = ['car']


            # loop through objects and use class index to get class name, allow only classes in allowed_classes list
            names = []
            deleted_indx = []
            for i in range(num_objects):
                class_indx = int(classes[i])
                class_name = class_names[class_indx]
                if class_name not in allowed_classes:
                    deleted_indx.append(i)
                else:
                    names.append(class_name)
            names = np.array(names)
            count = len(names)
            # delete detections that are not in allowed_classes
            bboxes = np.delete(bboxes, deleted_indx, axis=0)
            scores = np.delete(scores, deleted_indx, axis=0)

            # encode yolo detections and feed to tracker
            features = encoder(frame, bboxes)
            detections = [Detection(bbox, score, class_name, feature) for bbox, score, class_name, feature in
                          zip(bboxes, scores, names, features)]


            # run non-maxima supression
            boxs = np.array([d.tlwh for d in detections])
            scores = np.array([d.confidence for d in detections])
            classes = np.array([d.class_name for d in detections])
            indices = preprocessing.non_max_suppression(boxs, classes, 1.0, scores)
            detections = [detections[i] for i in indices]


            # Call the tracker
            tracker.predict()
            tracker.update(detections)

        # update tracks
        for track in tracker.tracks:
            # TODO: class 랑 bbox 로 계산 필요
            # is_confirmed = track.is_confirmed()
            # time_since_update = track.time_since_update
            if not track.is_confirmed() or track.time_since_update > 1:
                continue
            # if track.time_since_update > 1:
            #     continue

            bbox = track.to_tlbr()
            class_name = track.get_class()

            track_name = f"{class_name}_{track.track_id}"
            if not trackers_result.get(track_name):
                trackers_result[track_name] = {
                    "start_frame": frame_num,
                }



            # color = colors[0]
            # cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
            is_for_detect = False
            if not trackers_result[track_name].get("age"):
                is_for_detect = True
                if trackers_result[track_name].get("detect_fail_at"):
                    if frame_num - trackers_result[track_name]["detect_fail_at"] < 300:
                        is_for_detect = False

            if marketproject and marketproject.service_type == 'offline_ad':
                is_for_detect = False

            x1, y1, x2, y2 = bbox[0], bbox[1], bbox[2], bbox[3]
            cropped = frame[int(y1):int(y2), int(x1):int(x2)]
            cropped_face_bbox = None

            if is_for_detect:
                try:
                    # x1 = int(bbox[0] + (bbox[2] - bbox[0]) * 0.25)
                    # x2 = int(bbox[0] + (bbox[2] - bbox[0]) * 0.75)
                    # y1 = int(bbox[1])
                    # y2 = int(bbox[1] + (bbox[3] - bbox[1]) * 0.25)

                    start_predict_time = time.time()
                    if not self.app:
                        from insightface.app import FaceAnalysis
                        self.app = FaceAnalysis()
                        self.app.prepare(ctx_id=0, det_size=(640, 640))

                    result = self.app.get(cropped)
                    cropped_face_bbox = result[0].bbox
                    trackers_result[track_name]['age'] = result[0].age
                    trackers_result[track_name]['gender'] = result[0].sex
                    print("detected")
                except:
                    print(traceback.format_exc())
                    trackers_result[track_name]['detect_fail_at'] = frame_num
                    pass

            try:
                if cropped_face_bbox is not None:
                    x1 = int(cropped_face_bbox[0])
                    x2 = int(cropped_face_bbox[2])
                    y1 = int(cropped_face_bbox[1])
                    y2 = int(cropped_face_bbox[3])
                else:
                    x1 = int(bbox[0] + (bbox[2] - bbox[0]) / 8)
                    x2 = int(bbox[0] + (bbox[2] - bbox[0]) * 7 / 8)
                    y1 = int(bbox[1])
                    y2 = int(bbox[1] + (bbox[3] - bbox[1]) / 3)

                cropped_face = frame[y1:y2, x1:x2]  # 인식된 얼굴 이미지 crop
                cropped_face_processing = cv2.resize(cropped_face, dsize=(0, 0), fx=0.04, fy=0.04)  # 축소
                cropped_face_processing = cv2.resize(cropped_face_processing, cropped_face.shape[:2][::-1], interpolation=cv2.INTER_AREA)  # 확대
                frame[y1:y2, x1:x2] = cropped_face_processing  # 인식된 얼굴 영역 모자이크 처리
            except:
                print(traceback.format_exc())
                pass

            trackers_result[track_name]["end_frame"] = frame_num

            for area_name, area in areas.items():
                if 0 < bbox[0] - area[0] < area[2] and 0 < bbox[1] - area[1] < area[3]:
                    if not areas_result.get(area_name):
                        areas_result[area_name] = {}
                    if not areas_result[area_name].get(track_name):
                        areas_result[area_name][track_name] = {
                            "start_frame": frame_num,
                        }
                    if not areas_result[area_name][track_name].get("age") and trackers_result[track_name].get("age"):
                        areas_result[area_name][track_name]['age'] = trackers_result[track_name]['age']
                        areas_result[area_name][track_name]['gender'] = trackers_result[track_name]['gender']

                    areas_result[area_name][track_name]["end_frame"] = frame_num

            color = colors[int(track.track_id) % len(colors)]
            color = [i * 255 for i in color]

            if marketproject and marketproject.service_type in ['offline_shop', 'offline_ad'] and frame_num < 500:
                cv2.rectangle(frame, (int(bbox[0]), int(bbox[1])), (int(bbox[2]), int(bbox[3])), color, 2)
                cv2.rectangle(frame, (int(bbox[0]), int(bbox[1] - 30)),(int(bbox[0]) + (len(class_name) + len(str(track.track_id))) * 17, int(bbox[1])), color, -1)

                if marketproject and marketproject.service_type == 'offline_shop':
                    # draw bbox on screen
                    if trackers_result[track_name].get("age"):
                        cv2.putText(frame, f"{trackers_result[track_name]['gender']}-{trackers_result[track_name]['age']}",
                                    (int(bbox[0]), int(bbox[1] - 10)), 0, 0.75, (255, 255, 255), 2)
                    else:
                        cv2.putText(frame, f"Person", (int(bbox[0]), int(bbox[1] - 10)), 0, 0.75, (255, 255, 255), 2)
                if marketproject and marketproject.service_type == 'offline_ad':
                    cv2.putText(frame, f"Car", (int(bbox[0]), int(bbox[1] - 10)), 0, 0.75, (255, 255, 255), 2)

        # frame = self.getFaceDetect(frame) #
        if marketproject and marketproject.service_type in ['offline_shop', 'offline_ad'] and frame_num < 500:
            self.draw_text(frame, f"Object count : {len(trackers_result.keys())}", font_scale=1, pos=(50, original_h - 50))


        # calculate frames per second of running detections
        # fps = 1.0 / (time.time() - start_time)
        # print("FPS(Object tracking time per frame): %.2f" % fps)
        # result = np.asarray(frame)
        # result = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        return frame, tracker, trackers_result, areas_result

    def draw_text(self, img, text,
                  font=cv2.FONT_HERSHEY_SIMPLEX,
                  pos=(0, 0),
                  font_scale=3.0,
                  font_thickness=2,
                  text_color=(0, 0, 0),
                  text_color_bg=(255, 255, 255),
                  isTightBg=False
                  ):

        x, y = pos
        text_size, _ = cv2.getTextSize(text, font, 1, font_thickness)
        text_w, text_h = text_size
        text_w = int(text_w * font_scale)
        text_h = int(text_h * font_scale)
        if isTightBg:
            cv2.rectangle(img, (x, y), (x + text_w, y + text_h), text_color_bg, -1)
        else:
            cv2.rectangle(img, (x - 15, y - 15), (x + text_w + 15, y + text_h + 15), text_color_bg, -1)
        cv2.putText(img, text, (x, y + text_h + int(font_scale) - 1), font, font_scale, text_color, font_thickness)

        return text_size

    def get_detectron_output(self, image):
        cfg = get_cfg()
        cfg.merge_from_file(model_zoo.get_config_file("COCO-Keypoints/keypoint_rcnn_R_50_FPN_3x.yaml"))
        cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.7  # set threshold for this model
        cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url("COCO-Keypoints/keypoint_rcnn_R_50_FPN_3x.yaml")
        predictor = DefaultPredictor(cfg)

        outputs = predictor(image)
        outputs_cpu = outputs["instances"].to("cpu")
        boxes = outputs_cpu.pred_boxes.tensor.numpy()
        keypoints = outputs_cpu.pred_keypoints.numpy()

        return boxes, keypoints

    def get_angle(self, point_a, point_b, point_c, round_step=2):
        ba = point_a - point_b
        bc = point_c - point_b

        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = float(np.degrees(np.arccos(cosine_angle)))

        if round_step >= 0:
            angle = round(angle, round_step)

        return angle

    def process_keypoint(self, image, boxes, keypoints, KEYPOINT_THRESHOLD=0.05):
        angle_data_raw = {}
        human_order = []
        line_orders = [
            ([0, 1], (102, 0, 204)),  # 코 -> 왼쪽눈
            ([1, 3], (51, 153, 255)),  # 왼쪽눈 -> 귀
            ([0, 2], (51, 102, 255)),  # 코 -> 오른쪽눈
            ([2, 4], (102, 204, 255)),  # 오른쪽눈 -> 귀

            ([5, 6], (255, 128, 0)),  # 어깨
            ([5, 7], (128, 229, 255)),  # 왼팔 (어깨 -> 팔꿈치)
            ([7, 9], (102, 255, 224)),  # 왼팔 (팔꿈치 -> 손목)
            ([6, 8], (153, 255, 204)),  # 오른팔 (어깨 -> 팔꿈치)
            ([8, 10], (153, 255, 153)),  # 오른팔 (팔꿈치 -> 손목)

            ([11, 12], (255, 102, 0)),  # 골반
            ([12, 14], (255, 255, 77)),  # 왼팔 (엉덩이 -> 무릎)
            ([14, 16], (191, 255, 128)),  # 왼팔 (무릎 -> 발목)
            ([11, 13], (153, 255, 204)),  # 오른다리 (엉덩이 -> 무릎)
            ([13, 15], (255, 195, 77)),  # 오른다리 (무릎 -> 발목)

            ([0, 17], (255, 0, 0)),  # [0, (5, 6), (11, 12)]  # 중심선 (코 => 어깨 중앙)
            ([17, 18], (255, 0, 0)),  # [0, (5, 6), (11, 12)]  # 중심선 (어깨 중앙 => 엉덩이 중앙)
        ]

        image = Image.fromarray(image)
        drawer = ImageDraw.Draw(image)

        font_size = 15
        font = ImageFont.truetype(fm.findfont(fm.FontProperties()), font_size)
        text_color = (255, 255, 255)
        area_color = (0, 0, 0)

        # boxes = np.reshape(boxes, (-1, 2, 2)).astype(np.int)
        for index, (bbox, keypoint) in enumerate(zip(boxes, keypoints)):
            angle_data_raw[bbox[0]] = {
                'bbox': bbox,
                'angle': {},
            }
            human_order.append(bbox[0])
            # draw box
            bbox_point = [(bbox[0], bbox[1]), (bbox[2], bbox[3])]
            drawer.rectangle(bbox_point, outline=(255, 0, 0), width=2)

            # add body line
            keypoint = np.append(keypoint, [(keypoint[5] + keypoint[6]) / 2], axis=0)
            keypoint[-1][-1] = max(keypoint[5][-1], keypoint[6][-1])
            keypoint = np.append(keypoint, [(keypoint[11] + keypoint[12]) / 2], axis=0)
            keypoint[-1][-1] = max(keypoint[11][-1], keypoint[12][-1])

            # draw skeleton
            for order, color in line_orders:
                line = [tuple(keypoint[idx][:2]) for idx in order if keypoint[idx][2] > KEYPOINT_THRESHOLD]
                if len(line) == len(order):
                    drawer.line(line, fill=color, width=4)

            # angles
            angle_order = [
                ([0, 17, 5], 'HEAD'),  # 왼쪽어꺠와 머리
                ([5, 7, 9], 'L_ELBOW'),  # 왼쪽 팔꿈치 (L_ELBOW)
                ([6, 8, 10], 'R_ELBOW'),  # 오른쪽 팔꿈치 (R_ELBOW)
                ([11, 13, 15], 'L_KNEE'),  # 왼쪽 팔꿈치
                ([12, 14, 16], 'R_KNEE'),  # 오른쪽 팔꿈치
            ]

            angle_text = ''
            for index2, (order, name) in enumerate(angle_order):
                points = [keypoint[idx][:2] for idx in order if keypoint[idx][2] > KEYPOINT_THRESHOLD]

                if len(points) == 3:
                    angle = self.get_angle(*points)
                    text = f'{name}  {angle}°\n'
                    angle_text += text
                    angle_data_raw[bbox[0]]['angle'][str(name)] = angle

            if len(angle_text) > 0:
                angle_text = angle_text[:-1]

                # text points
                text_width, text_height = drawer.textsize(angle_text, font)
                text_point = (bbox[0], bbox[1] - text_height)
                text_area = [text_point, tuple(np.add(text_point, (text_width, text_height)))]

                # write text
                drawer.rectangle(text_area, fill=area_color)
                drawer.text(text_point, angle_text, font=font, fill=text_color)

        data = np.asarray(image)

        human_order.sort()
        result = {}
        result_csv = []
        for index, num in enumerate(human_order):
            result[index] = angle_data_raw[num]
            result_csv.append([
                angle_data_raw[num]['bbox'][0],
                angle_data_raw[num]['bbox'][1],
                angle_data_raw[num]['bbox'][2],
                angle_data_raw[num]['bbox'][3],
                angle_data_raw[num]['angle'].get('HEAD'),
                angle_data_raw[num]['angle'].get('L_ELBOW'),
                angle_data_raw[num]['angle'].get('R_ELBOW'),
                angle_data_raw[num]['angle'].get('L_KNEE'),
                angle_data_raw[num]['angle'].get('R_KNEE'),
            ])

        return data, result, result_csv

    def convert(self, o):
        if isinstance(o, np.int64): return int(o)
        return o
if __name__ == "__main__" :
    print("a")
