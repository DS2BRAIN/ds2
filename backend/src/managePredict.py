# -*- coding: utf-8 -*-
import copy
import gc
import io
import platform
import sys
import numpy as np
import datetime
import urllib
import requests
from bson import json_util
from starlette.responses import StreamingResponse
from torch import Tensor
from models.helper import Helper
from models import rd
from src.emailContent import getContentCompletePredictMovie, getContentCompletePredictMovie_en
from src.errorResponseList import NO_SUPPORT_FOR_OPENSOURCE
import ast
import traceback
import time
from starlette.status import HTTP_200_OK, HTTP_402_PAYMENT_REQUIRED
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
import cv2
from PIL import Image as PILI, ExifTags
from torch.utils.data import DataLoader
from httplib2 import Http
import torch
import os
import json
from pytz import timezone
import random
from PIL import Image as PImage
import pandas as pd

from src.processing import Processing
from src.service.predictImage import PredictImage
from src.util import Util
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
from transformers import pipeline, set_seed
import soundfile
from espnet2.bin.tts_inference import Text2Speech
from huggingsound import SpeechRecognitionModel
from torch import autocast
from diffusers import StableDiffusionPipeline

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

class ManagePredict:

    class modelArgs():
        phase = 'train'
        epoch = 100
        dataset = 'my_data'
        model = 'contour.pth'
        result = 'my_data'

    def __init__(self, isLoadModel=False):

        pd.options.display.float_format = '{:.5f}'.format

        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.processingClass = Processing()
        self.splitingClass = None
        if os.path.exists("./src/creating/spliting"):
            from src.creating.spliting import Spliting
            self.splitingClass = Spliting()
        self.model = None
        self.modelPath = None
        self.project = None
        self.predictor = None
        self.opt = None
        self.learn = None
        self.quickModels = {}
        self.quickMarketModels = {}
        self.quickOpsModels = {}
        self.predict_class = None
        self.predict_image_class = PredictImage()

        if os.path.exists("./src/training/predict.py"):
            from src.training.predict import Predict
            self.predict_class = Predict()

        if self.utilClass.opsId:
            time.sleep(round(random.uniform(1, 5), 3))
            ops_project = self.dbClass.getOneOpsProjectById(self.utilClass.opsId, raw=True)
            self.model, self.modelPath, self.learn, self.predictor, self.opt = self.loadModel(ops_project.model, opsId=self.utilClass.opsId)
        else:
            if isLoadModel:
                self.setupMarketModels()

        self.appToken = None
        self.model = None
        self.fileName = None


    def setupMarketModels(self):
        if os.path.exists("/home/ubuntu/aimaker-backend-deploy-prod") and torch.cuda.is_available():
            for getQuickAiModel in self.dbClass.getQuickAiModels():
                print(f"load market quick model : {getQuickAiModel.name_kr}")
                try:
                    self.loadModel(getQuickAiModel.id, isMarket=True, opsId=None)
                except:
                    print(f"fail to load market quick model : {getQuickAiModel.name_kr}")
                    print(traceback.format_exc())
                    pass

    def run(self, modelId, parameter, appToken, userId, background_tasks=None, isMarket=False, opsId=None, inputLoadedModel=None, modeltoken=None):

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

        if self.utilClass.configOption != 'enterprise':
            if user.deposit - user.usedPrice <= 0:
                return HTTP_402_PAYMENT_REQUIRED, {'result': 'fail'}



        if opsId and not self.utilClass.opsId and self.utilClass.configOption != 'enterprise':
            url = self.getOpsURL(opsId)
            if url:
                print("send to inference server")
                return self.sendToOwnInferenceServer(url, 'inference', modelId, opsId, appToken, userId, parameter=parameter, inputLoadedModel=inputLoadedModel)

        print("inference by this server")
        try:
            model, modelPath, learn, predictor, opt = self.loadModel(modelId, isMarket=isMarket, opsId=opsId)

            try:
                if "text_to_speech" not in model['project']['trainingMethod'] \
                        and 'text_to_image' not in model['project']['trainingMethod']:
                    data = rd.get(
                        f"||{modelId}||{json.dumps(parameter)}||{userId}||{isMarket}||{inputLoadedModel}||{opsId}||{modeltoken}||")
                    if data:
                        return HTTP_200_OK, data
            except:
                print(traceback.format_exc())
                pass

            if "load_torch" in model['project']['option']:

                # model = torch.jit.load(f"{modelPath}")
                print(f"{modelPath}")

                if isMarket and self.quickMarketModels.get(modelId):
                    loadedModel = self.quickMarketModels[modelId]["learn"]
                elif opsId and self.quickOpsModels.get(modelId):
                    loadedModel = self.quickOpsModels[modelId]["learn"]
                elif self.quickModels.get(modelId):
                    loadedModel = self.quickModels[modelId]["learn"]
                else:
                    loadedModel = torch.jit.load(modelPath) if not self.learn else self.learn

                print("inputLoadedModel")
                print(inputLoadedModel)

                try:
                    inputLoadedModel = inputLoadedModel.strip('\n')
                except:
                    print("strip fail")
                    pass

                try:
                    inputLoadedModel = ast.literal_eval(inputLoadedModel)
                    inputLoadedModel = torch.from_numpy(np.array(inputLoadedModel))
                    inputLoadedModel = inputLoadedModel.float()
                except:
                    print("Not a list")
                    pass

                try:
                    inputLoadedModel = float(inputLoadedModel)
                except:
                    print("Not a float")
                    pass

                result = loadedModel(inputLoadedModel).tolist()
                print(result)
                user.inferenceCountOD = user.inferenceCountOD + 1
                user.save()


                if opsId:
                    print("background_tasks start time : " + str(datetime.datetime.now()))
                    if inputLoadedModel is not None:
                        background_tasks.add_task(self.setInferenceResult, opsId, {"inputData": inputLoadedModel}, user,
                                                  model, result)
                    print("background_tasks end time : " + str(datetime.datetime.now()))

                return HTTP_200_OK, json.dumps(result, default=str, ensure_ascii=False)

            elif "load_tensorflow" in model['project']['option']:
                import tensorflow as tf

                self.utilClass.unzipFile(modelPath)
                print(modelPath)
                try:
                    print(f"{modelPath.split('.zip')[0]}")
                    if isMarket and self.quickMarketModels.get(modelId):
                        loadedModel = self.quickMarketModels[modelId]["learn"]
                    elif opsId and self.quickOpsModels.get(modelId):
                        loadedModel = self.quickOpsModels[modelId]["learn"]
                    elif self.quickModels.get(modelId):
                        loadedModel = self.quickModels[modelId]["learn"]
                    else:
                        loadedModel = tf.saved_model.load(f"{modelPath.split('.zip')[0]}") if not self.learn else self.learn
                except:
                    try:
                        print(f"{modelPath.split('.zip')[0]}/{modelPath.split('.zip')[0].split('/')[-1]}")
                        loadedModel = tf.saved_model.load(f"{modelPath.split('.zip')[0]}/{modelPath.split('.zip')[0].split('/')[-1]}")
                    except:
                        print(traceback.format_exc())
                        pass
                    pass

                print("inputLoadedModel")
                print(inputLoadedModel)

                try:
                    inputLoadedModel = inputLoadedModel.strip('\n')
                except:
                    print("strip fail")
                    pass

                try:
                    inputLoadedModel = ast.literal_eval(inputLoadedModel)
                except:
                    print("Not a list")
                    pass

                try:
                    inputLoadedModel = float(inputLoadedModel)
                except:
                    print("Not a float")
                    pass

                result = loadedModel(inputLoadedModel).numpy()
                print(result)
                user.inferenceCountOD = user.inferenceCountOD + 1
                user.save()

                if opsId:
                    print("background_tasks start time : " + str(datetime.datetime.now()))
                    if inputLoadedModel is not None:
                        background_tasks.add_task(self.setInferenceResult, opsId, {"inputData": inputLoadedModel}, user,
                                                  model, result)
                    print("background_tasks end time : " + str(datetime.datetime.now()))

                try:
                    rd.set(f"||{modelId}||{json.dumps(parameter)}||{userId}||{isMarket}||{inputLoadedModel}||{opsId}||{modeltoken}||", json.dumps(result, default=str, ensure_ascii=False))
                except:
                    print(traceback.format_exc())
                    pass

                return HTTP_200_OK, json.dumps(result, default=str, ensure_ascii=False)


            a = pd.DataFrame([parameter])
            result = None

            if isMarket:
                result = self.predict_for_market(a, model, modelPath)
            else:
                result = self.predictRow(a, model, modelPath, modelId, parameter, appToken, userId)


            if opsId:
                print("background_tasks start time : " + str(datetime.datetime.now()))
                background_tasks.add_task(self.setInferenceResult, opsId, parameter, user, model, result)
                print("background_tasks end time : " + str(datetime.datetime.now()))

            if isMarket:
                market_usage = self.dbClass.get_market_usage(user.id, model['id'], raw=True)
                market_usage.inferenceCount += 1
                market_usage.save()
            if not isMarket:
                user.inferenceCountCR = user.inferenceCountCR + 1
                if self.utilClass.configOption != "enterprise":
                    user.usedPrice = user.usedPrice + self.dbClass.get_price_with_pricing_name('CR', raw=True).inferencePerCount
                user.save()

            self.utilClass.sendSlackMessage(f"일반 예측을 수행하였습니다. (유저 ID :{userId}), {json.dumps(result, indent=4, ensure_ascii=False, default=str)}", appLog=True)

            self.sendWebhook(model['project'], result)

            try:
                rd.set(f"||{modelId}||{json.dumps(parameter)}||{userId}||{isMarket}||{inputLoadedModel}||{opsId}||{modeltoken}||",
                       json.dumps(result, default=str, ensure_ascii=False))
            except:
                print(traceback.format_exc())
                pass

            try:
                gc.collect()
                torch.cuda.empty_cache()
            except:
                pass

            if "text_to_speech" in model['project']['trainingMethod'] \
                    or 'text_to_image' in model['project']['trainingMethod']:
                return HTTP_200_OK, result
            else:
                return HTTP_200_OK, json.dumps(result, indent=1, ensure_ascii=False, default=str)

        except OSError:
            print(traceback.format_exc())
            if 'Cannot allocate memory' in str(traceback.format_exc()):
                # self.reboot_instance(model=model, server_type="inference")
                sys.exit()
            pass
        except RuntimeError:
            if 'CUDA out of memory' in str(traceback.format_exc()):
                # self.reboot_instance(model=model, server_type="inference")
                sys.exit()
            elif 'CUDA' in str(traceback.format_exc()):
                # self.reboot_instance(model=model, server_type="inference")
                sys.exit()
            else:
                print(traceback.format_exc())
            pass
        except:
            print(traceback.format_exc())
            self.utilClass.sendSlackMessage(
                f"유저 id: {model['project'].get('user')}, 프로젝트 id: {model['project'].get('id')}, 모델 id: {model.get('id')}",
                appError=True)
            self.utilClass.sendSlackMessage(f"프로젝트 name: {model['project'].get('projectName')}, 모델 name: {model.get('name')}",
                                            appError=True)
            self.utilClass.sendSlackMessage(str(traceback.format_exc()), appError=True)
            pass

    def runImage(self, modelId, file, filename, appToken, userId, background_tasks=None, xai=False, info=False, returnImage=False, isMarket=False, opsId=None, modeltoken=None):
        print("runImage start time : " + str(datetime.datetime.now()))
        filename = self.utilClass.unquote_url(filename)

        if modeltoken:
            user = self.dbClass.getUserByModelTokenAndModelId(modeltoken, modelId)
            if not user:
                return HTTP_503_SERVICE_UNAVAILABLE, {
                    "statusCode": 503,
                    "error": "Bad Request",
                    "message": "앱 토큰을 잘 못 입력하였습니다."
                }
            appToken = user.appTokenCode

        user = self.dbClass.getUserByAppToken(appToken)

        if not appToken:
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "앱 토큰을 잘 못 입력하였습니다."
            }

        if self.utilClass.configOption != 'enterprise':
            if user.deposit - user.usedPrice <= 0:
                return HTTP_402_PAYMENT_REQUIRED, {'result': 'fail'}

        if opsId and not self.utilClass.opsId and self.utilClass.configOption != 'enterprise':
            url = self.getOpsURL(opsId)
            if url:
                return self.sendToOwnInferenceServer(url, 'inferenceimageinfo' if info else 'inferenceimage', modelId, opsId, appToken, userId, filename=filename, file=file)

        try:

            model = None
            model, modelPath, learn, predictor, opt = self.loadModel(modelId, isMarket=isMarket, opsId=opsId)
            trainingMethod = model['project']['trainingMethod']
            image = np.fromstring(file, dtype='uint8')
            im = cv2.imdecode(image, cv2.IMREAD_COLOR)

            if 'ocr' in trainingMethod:
                result = self.predict_image_class.getOCR(file, im, info)

                try:
                    gc.collect()
                    torch.cuda.empty_cache()
                except:
                    pass
                return HTTP_200_OK, result

            if 'image_to_text' in trainingMethod:
                result = self.predict_image_class.get_image_to_text(file, im, info)

                try:
                    gc.collect()
                    torch.cuda.empty_cache()
                except:
                    pass

                return HTTP_200_OK, result

            if not model:
                raise("No model file exist")

            if isMarket:
                market_usage = self.dbClass.get_market_usage(user.id, model['id'], raw=True)
                market_usage.inferenceCount += 1
                market_usage.save()
                project = self.dbClass.getOneMarketProjectById(model['project']['id'], raw=True)
            else:
                project = self.dbClass.getProjectByModelId(modelId) if not self.project else self.project

            if 'object_detection' in trainingMethod:

                split = [''] * 38 + ['keypoint', 'panoptic', 'polyline', 'mzaik', 'faceDetect', 'ocr', 'faceLandmark', 'densePose']

                if self.splitingClass:
                    split = self.splitingClass.SplitFast if 'speed' in project.option else self.splitingClass.Split

                try:
                    model["objectDetectionModel"] = split["objectDetectionModel"][int(model["objectDetectionModel"])] if model["objectDetectionModel"] else None
                except:
                    pass

                yClass = ast.literal_eval(model['project'].get('yClass')) if model['project'].get('yClass') else {}
                if not yClass:
                    print("yClass is not set")
                    print(yClass)
                    yClass = [x.name for x in self.dbClass.getLabelClassesByLabelProjectId(project.labelproject)]
                    self.dbClass.updateProject(project.id, {'yClass': str(yClass)})
                if self.predictor:
                    print("use market model")

                if model['objectDetectionModel'] == "keypoint":
                    outputImage, _ = self.predict_image_class.getKeypoint(im, info, predictor=self.predictor)
                    if info:
                        return HTTP_200_OK, outputImage
                elif model['objectDetectionModel'] == "panoptic":
                    outputImage = self.predict_image_class.getPanoptic(im, info, predictor=self.predictor)
                    if info:
                        return HTTP_200_OK, outputImage
                elif model['objectDetectionModel'] == "faceDetect":
                    outputImage = self.predict_image_class.getFaceDetect(im, info)
                    if info:
                        return HTTP_200_OK, outputImage
                elif model['objectDetectionModel'] == "faceLandmark":
                    outputImage = self.predict_image_class.getFaceLandmark(im, info, predictor=self.predictor)
                    if info:
                        return HTTP_200_OK, outputImage

            if self.predict_class:
                return self.predict_class.runImage(modelId, file, filename, appToken, userId,
                        xai=xai, background_tasks=background_tasks, info=info, returnImage=returnImage,
                       isMarket=isMarket, opsId=opsId, modeltoken=modeltoken)
            else:
                return NO_SUPPORT_FOR_OPENSOURCE

        except OSError:
            print(traceback.format_exc())
            if 'Cannot allocate memory' in str(traceback.format_exc()):
                # self.reboot_instance(model=model, server_type="inference")
                sys.exit()
            pass
        except RuntimeError:
            if 'CUDA out of memory' in str(traceback.format_exc()):
                # self.reboot_instance(model=model, server_type="inference")
                sys.exit()
            elif 'CUDA' in str(traceback.format_exc()):
                # self.reboot_instance(model=model, server_type="inference")
                sys.exit()
            pass
        except:
            print(traceback.format_exc())
            self.utilClass.sendSlackMessage(
                f"유저 id: {model['project'].get('user')}, 프로젝트 id: {model['project'].get('id')}, 모델 id: {model.get('id')}",
                appError=True)
            self.utilClass.sendSlackMessage(f"프로젝트 name: {model['project'].get('projectName')}, 모델 name: {model.get('name')}",
                                            appError=True)
            self.utilClass.sendSlackMessage(str(traceback.format_exc()), appError=True)
            pass

    def getPredictImageByUrl(self, modelId, url, appToken, userId, xai=False, info=False, isMarket=False, opsId=None, background_tasks=None, modeltoken=None):
        r = requests.get(url, allow_redirects=True)
        file = r.content
        return self.runImage(modelId, file, url.split("/")[-1], appToken, userId, xai=xai, info=info, background_tasks=background_tasks, modeltoken=modeltoken)

    def speect_to_text(self, modelId, file, filename, appToken, userId,
                 isStreaming=True, isMarket=False, opsId=None, background_tasks=None,
                 modeltoken=None, marketproject=None, movie_start_time=None, task=None, file_creation_time=None):

        filename = self.utilClass.unquote_url(filename)
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

        prediction_model = SpeechRecognitionModel("jonatasgrosman/wav2vec2-large-xlsr-53-english")

        if not os.path.exists(f"{self.utilClass.save_path}/{appToken}/"):
            os.makedirs(f"{self.utilClass.save_path}/{appToken}/", exist_ok=True)

        temp_file_path = f"{self.utilClass.save_path}/{appToken}/{time.strftime('%y%m%d%H%M%S')}_{filename}"

        with open(temp_file_path, "wb") as buffer:
            buffer.write(file)

        transcriptions = prediction_model.transcribe([temp_file_path])[0]['transcription']

        if os.path.isfile(temp_file_path):
            os.remove(temp_file_path)

        return HTTP_200_OK, {"predict_value": transcriptions}

    def runMovie(self, modelId, file, filename, appToken, userId,
                 isStreaming=True, isMarket=False, opsId=None, background_tasks=None,
                 modeltoken=None, marketproject=None, movie_start_time=None, task=None, file_creation_time=None):

        if self.predict_class:
            return self.predict_class.runMovie(modelId, file, filename, appToken, userId,
                 isStreaming=isStreaming, isMarket=isMarket, opsId=opsId, background_tasks=background_tasks,
                 modeltoken=modeltoken, marketproject=marketproject, movie_start_time=movie_start_time,
                                           task=task, file_creation_time=file_creation_time)
        else:
            return NO_SUPPORT_FOR_OPENSOURCE

    def runMovieInfo(self, modelId, file, filename, appToken, userId, isMarket=False, opsId=None, modeltoken=None):

        if self.predict_class:
            return self.predict_class.runMovieInfo(modelId, file, filename, appToken,
                                               userId, isMarket=isMarket, opsId=opsId, modeltoken=modeltoken)
        else:
            return NO_SUPPORT_FOR_OPENSOURCE

    def runMovieAsync(self, modelId, file, filename, appToken, userId, sync_cut_at=None,
                      isMarket=False, opsId=None, modeltoken=None, marketProjectId=None, isStandardMovie=False):

        if self.predict_class:
            return self.predict_class.runMovieAsync(modelId, file, filename, appToken, userId, sync_cut_at=sync_cut_at,
                                                isMarket=isMarket, opsId=opsId, modeltoken=modeltoken,
                                                marketProjectId=marketProjectId, isStandardMovie=isStandardMovie)

    def runAllAsync(self, modelId, file, filename, appToken, userId, isForText=True, isForLabeling=False, isMarket=False, opsId=None, modeltoken=None, marketProjectId=None):

        if self.predict_class:
            return self.predict_class.runAllAsync(modelId, file, filename, appToken, userId,
                                              isForText=isForText, isForLabeling=isForLabeling, isMarket=isMarket,
                                              opsId=opsId, modeltoken=modeltoken, marketProjectId=marketProjectId)
        else:
            return NO_SUPPORT_FOR_OPENSOURCE

    def runAll(self, modelId, file, filename, appToken, userId, isForText=True, isForLabeling=False, isMarket=False, opsId=None, modeltoken=None):

        if self.predict_class:
            return self.predict_class.runAll(modelId, file, filename, appToken, userId,
                                         isForText=isForText, isForLabeling=isForLabeling, isMarket=isMarket,
                                         opsId=opsId, modeltoken=modeltoken)
        else:
            return NO_SUPPORT_FOR_OPENSOURCE

    def runRows(self, modelId, df, isForText=True, isForLabeling=False, isMarket=False, opsId=None,
                modeltoken=None, is_sell=False, is_option=False):

        if self.predict_class:
            return self.predict_class.runRows(modelId, df, isForText=isForText,
                                          isForLabeling=isForLabeling, isMarket=isMarket, opsId=opsId,
                                          modeltoken=modeltoken, is_sell=is_sell, is_option=is_option)
        else:
            return NO_SUPPORT_FOR_OPENSOURCE

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

    def getModelPath(self, modelId, GAN=False, isMarket=False, opsId=None):

        model = self.getModelInfo(modelId, isMarket=isMarket, opsId=opsId)
        localFilePath = self.processingClass.downloadModel(model, GAN=GAN)
        return localFilePath
    def sendWebhook(self, project, data):
        try:
            if project.get('webhookURL'):
                response = Http().request(
                    uri=project.get('webhookURL'),
                    method=project.get('webhookMethod'),
                    headers={'Content-Type': 'application/json; charset=UTF-8'},
                    body=json.dumps(data, ensure_ascii=False, default=json_util.default),
                )
                self.utilClass.sendSlackMessage(
                    f"웹훅을 수행하였습니다. (Project ID: {project['id']}, response :{str(response)})",
                    appLog=True)
        except:
            self.utilClass.sendSlackMessage(
                f"웹훅 수행에 실패하였습니다. (Project ID: {project['id']}, error :{str(traceback.format_exc())})",
                appLog=True)
            pass

    def open_image(self, fname, size=224):
        img = PILI.open(fname).convert('RGB')
        img = img.resize((size, size))
        t = torch.Tensor(np.array(img))
        return t.permute(2, 0, 1).float() / 255.0

    def saveInferenceResultImage(self, opsId, image, user, file_name):
        opsProject = self.dbClass.getOneOpsProjectById(opsId)
        timestamp = time.strftime('%y%m%d%H%M%S')
        temp_folder = f"{os.getcwd()}/temp/{timestamp}"
        os.mkdir(temp_folder)
        connector_id = opsProject['dataconnector']
        user_id = user.id
        with open(f"{temp_folder}/{file_name}", "wb") as buffer:
            buffer.write(image)
        file_size = os.path.getsize(f'{temp_folder}/{file_name}')
        newfile_name = f"{os.path.splitext(file_name)[0]}{timestamp}.{file_name.split('.')[-1]}"
        width, height, im = self.getImageSize(f'{temp_folder}/{file_name}')
        s3Folder = f"user/{user_id}/{connector_id}/{os.path.splitext(file_name)[0]}"
        file_name = self.utilClass.unquote_url(file_name)
        self.s3.upload_file(f"{temp_folder}/{file_name}", self.utilClass.bucket_name,
                            f'{s3Folder}{timestamp}.{file_name.split(".")[-1]}')
        s3key = urllib.parse.quote(
            f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3Folder}{timestamp}.{file_name.split(".")[-1]}').replace('https%3A//', 'https://')

        if self.utilClass.configOption == 'enterprise':
            s3key = f'{self.utilClass.save_path}/{s3Folder}{timestamp}.{file_name.split(".")[-1]}'

        kst = timezone('Asia/Seoul')
        new_object_dict = {
            "fileName": newfile_name,
            "fileSize": file_size,
            "user": user_id,
            "width": width,
            "height": height,
            "s3key": s3key,
            "originalFileName": file_name,
            "created_at": kst.localize(datetime.datetime.now()),
            "updated_at": kst.localize(datetime.datetime.now()),
            "fileType": "object_detection",
            "dataconnector": connector_id
        }
        returnCreateFile = self.dbClass.createFile(new_object_dict)
        print("returnCreateFile")
        print(returnCreateFile)
        ds2data_id = new_object_dict['id']
        del new_object_dict['id']
        new_object_dict.update({
            "status": "review",
            "workAssignee": None,
            "status_sort_code": 0,
            "isDeleted": False,
            "reviewer": None,
            "ds2data": ds2data_id,
            "labelproject": opsProject['labelproject']
        })
        returnCreateLabelprojectFile = self.dbClass.createLabelprojectFile(new_object_dict)
        print("returnCreateLabelprojectFile")
        print(returnCreateLabelprojectFile)
        ds2data_labelproject_id = new_object_dict['id']
        return ds2data_id, ds2data_labelproject_id, width, height


    def getImageSize(self, filePath):
        for orientation in ExifTags.TAGS.keys():
            if ExifTags.TAGS[orientation] == 'Orientation':
                break


        im = PImage.open(filePath)
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

    def saveInferenceResultDict(self, opsId, parameter, user, fileType="csv"):

        opsProject = self.dbClass.getOneOpsProjectById(opsId)
        connector_id = opsProject['dataconnector']
        user_id = user.id
        kst = timezone('Asia/Seoul')
        print("kst.localize(datetime.datetime.now())")
        if isinstance(parameter.get("inputData", None), Tensor):
            parameter["inputData"] = parameter["inputData"].tolist()

        if not parameter.get("inputData"):
            parameter["inputData"] = parameter

        print(kst.localize(datetime.datetime.now()))
        new_object_dict = {
            "user": user_id,
            "created_at": kst.localize(datetime.datetime.now()),
            "updated_at": kst.localize(datetime.datetime.now()),
            "recordData": json.dumps(parameter, ensure_ascii=False, default=json_util.default),
            "rawData": {"inputData": parameter["inputData"]},
            "labelData": None,
            "fileType": fileType,
            "dataconnector": connector_id
        }
        self.dbClass.createFile(new_object_dict)
        ds2data_id = new_object_dict['id']
        del new_object_dict['id']
        new_object_dict.update({
            "status": "review",
            "workAssignee": None,
            "status_sort_code": 0,
            "isDeleted": False,
            "reviewer": None,
            "ds2data": ds2data_id,
            "recordData": json.dumps(parameter, ensure_ascii=False, default=json_util.default),
            "rawData": {"inputData": parameter["inputData"]},
            "labelproject": opsProject['labelproject']
        })
        ds2data_label = self.dbClass.createLabelprojectFile(new_object_dict)
        return ds2data_label['id']

    def saveInferenceResultLabel(self, opsId, ds2data_label_id, label_data, user):

        opsProject = self.dbClass.getOneOpsProjectById(opsId)
        kst = timezone('Asia/Seoul')

        ds2data = self.dbClass.getLabelSthreeFileById(ds2data_label_id)
        if ds2data and ds2data['fileType'] == 'object_detection':
            label_data = {
                'labelproject': opsProject['labelproject'],
                'status': 'review',
                'labeltype': label_data['labeltype'],
                'locked': False,
                'visible': None,
                'selected': None,
                "created_at": kst.localize(datetime.datetime.now()),
                "updated_at": kst.localize(datetime.datetime.now()),
                'points': label_data.get('points'),
                'sthreefile': ds2data_label_id,
                'labelclass': label_data['labelclass'],
                'x': label_data.get('x'),
                'w': label_data.get('w'),
                'y': label_data.get('y'),
                'h': label_data.get('h'),
                'highlighted': False,
                'editingLabels': False,
                'ismagictool': None,
                'workAssignee': user.id,
                'last_updated_by': 'ops',
                'user': user.id,
                'isDeleted': False
            }
            self.dbClass.createLabel(label_data)
        else:
            # csv 는 {'result': True} , {'result': False} 이런식으로 label_data 주시면 될 듯 합니다!
            # 이미지 분류 같은 경우는 그냥 분류 결과 cat, dog 이런식으로 그냥 class 명을 string으로 주시면 될 거 같습니다!
            try:
                label_data = label_data.tolist()
            except:
                pass
            if "normal" in ds2data['fileType']:
                label_data = {'result': label_data}
            update_data = {'labelData': label_data}
            self.dbClass.updateSthreeFileById(ds2data_label_id, update_data)

    def sendToOwnInferenceServer(self, dns, endpoint, modelId, opsId, appToken, userId, parameter=None, filename=None, file=None, inputLoadedModel=None):

        data = {'modelid': modelId, 'apptoken': appToken, 'userId': userId, 'inputLoadedModel': inputLoadedModel}
        if file:
            data['filename'] = filename
            r = requests.post(f"http://{dns}/{endpoint}/inferenceops{opsId}/", files={'file': file}, data=data, stream=True)
            return r.status_code, StreamingResponse(io.BytesIO(r.content))
        else:
            data['parameter'] = parameter
            r = requests.post(f"http://{dns}/{endpoint}/inferenceops{opsId}/", data=json.dumps(data, ensure_ascii=False))
            return r.status_code, r.json()

    def setInferenceResult(self, opsId, parameter, user, model, result):
        try:
            ds2data_id = self.saveInferenceResultDict(opsId, parameter, user, model['project']['trainingMethod'])
            if 'recommender' in model['project']['trainingMethod']:
                for recommendation in result:
                    self.saveInferenceResultLabel(opsId, ds2data_id, recommendation, user)
            else:
                self.saveInferenceResultLabel(opsId, ds2data_id, result, user)
        except:
            print(traceback.format_exc())
            pass
        opsProject = self.dbClass.getOneOpsProjectById(opsId, raw=True)
        opsProject.inferenceCount += 1
        opsProject.save()

    def loadModel(self, modelId, opsId=None, isMarket=False):

        if isMarket and self.quickMarketModels.get(modelId):
            data = self.quickMarketModels.get(modelId)
            return data['model'], data['modelPath'], data['learn'], data['predictor'], data['opt']

        elif opsId and self.quickOpsModels.get(modelId):
            data = self.quickOpsModels.get(modelId)
            return data['model'], data['modelPath'], data['learn'], data['predictor'], data['opt']

        elif self.quickModels.get(modelId):
            data = self.quickModels.get(modelId)
            return data['model'], data['modelPath'], data['learn'], data['predictor'], data['opt']

        if self.predict_class:
            return self.predict_class.loadModel(modelId, isMarket=isMarket, opsId=opsId)
        else:
            return None, None, None, None, None

    def predictRow(self, a, model, modelPath, modelId, parameter, appToken, userId, learn=None):

        if self.predict_class:
            if model['isModelDownloaded']:
                return self.predict_class.predict_by_triton(a, model, modelPath, modelId, parameter, appToken, userId,
                                                            learn=learn)
            else:
                return self.predict_class.predictRow(a, model, modelPath, learn=learn)
        else:
            return NO_SUPPORT_FOR_OPENSOURCE

    def predict_for_market(self, a, model, modelPath, learn=None):
        model_name = a["model_name (Optional)"][0]
        if 'text_summarization' in model['project']['trainingMethod']:

            if 'article' not in a.columns:
                return {"missing_value": 'article'}

            if 'summarization' not in a.columns:
                return {"missing_value": 'summarization'}

            if 'max_length' not in a.columns:
                return {"missing_value": 'max_length'}

            if 'min_length' not in a.columns:
                return {"missing_value": 'min_length'}

            if not self.quickMarketModels.get("summarizer"):
                self.quickMarketModels["summarizer"] = pipeline("summarization", model=model_name if model_name else "facebook/bart-large-cnn")
            result = self.quickMarketModels["summarizer"](a["article"][0], max_length=int(a["max_length"][0]),
                                                 min_length=int(a["min_length"][0]), do_sample=False)[0]["summary_text"]
            return {"summary_text__predict_value": result}

        if 'translation' in model['project']['trainingMethod']:

            if 'from' not in a.columns:
                return {"missing_value": 'from'}

            if 'to' not in a.columns:
                return {"missing_value": 'to'}

            if 'text' not in a.columns:
                return {"missing_value": 'text'}

            if not self.quickMarketModels.get("translation"):
                self.quickMarketModels["translation"] = {
                    "model": M2M100ForConditionalGeneration.from_pretrained(model_name if model_name else "facebook/m2m100_1.2B"),
                    "tokenizer": M2M100Tokenizer.from_pretrained(model_name if model_name else "facebook/m2m100_1.2B")
                }

            self.quickMarketModels["translation"]["tokenizer"].src_lang = a["from"][0]
            encoded_hi = self.quickMarketModels["translation"]["tokenizer"](a["text"][0], return_tensors="pt")
            generated_tokens = self.quickMarketModels["translation"]["model"].generate(**encoded_hi,
                       forced_bos_token_id=self.quickMarketModels["translation"]["tokenizer"].get_lang_id(a["to"][0]))
            result = self.quickMarketModels["translation"]["tokenizer"].batch_decode(generated_tokens,
                                                                                     skip_special_tokens=True)
            return {"translated_text__predict_value": result}

        if 'gpt' in model['project']['trainingMethod']:

            if 'max_length' not in a.columns:
                return {"missing_value": 'max_length'}

            if 'text' not in a.columns:
                return {"missing_value": 'text'}

            if not self.quickMarketModels.get("gpt"):
                self.quickMarketModels["gpt"] = pipeline('text-generation', model=model_name if model_name else 'gpt2')
            set_seed(42)
            generated_text = []
            results = self.quickMarketModels["gpt"](a["text"][0], max_length=a["max_length"][0], num_return_sequences=a["num_return_sequences"][0])
            for result in results:
                generated_text.append(result["generated_text"])
            return {"generated_text__predict_value": generated_text}

        if 'fill_mask' in model['project']['trainingMethod']:

            if 'text' not in a.columns:
                return {"missing_value": 'text'}

            if not self.quickMarketModels.get("fill_mask"):
                self.quickMarketModels["fill_mask"] = pipeline('fill-mask', model=model_name if model_name else 'bert-base-uncased')
            results = self.quickMarketModels["fill_mask"](a["text"][0])
            generated_text = []
            for result in results:
                generated_text.append(result["sequence"])
            return {"generated_text__predict_value": generated_text}

        if 'text_to_speech' in model['project']['trainingMethod']:

            if 'text' not in a.columns:
                return {"missing_value": 'text'}

            prediction_model = Text2Speech.from_pretrained(model_name if model_name else "espnet/kan-bayashi_ljspeech_vits")

            speech = prediction_model(a["text"][0])["wav"]

            memory_file = io.BytesIO()
            memory_file.name = "result.wav"
            soundfile.write(memory_file, speech.numpy(), prediction_model.fs, "PCM_16")
            memory_file.seek(0)

            return StreamingResponse(memory_file, media_type="audio/wav")

        if 'text_to_image' in model['project']['trainingMethod']:

            if 'text' not in a.columns:
                return {"missing_value": 'text'}
            token = True
            if self.predict_class:
                token = self.predict_class.token
            prediction_model = StableDiffusionPipeline.from_pretrained(model_name if model_name else "CompVis/stable-diffusion-v1-4", use_auth_token=token)
            prediction_model = prediction_model.to("cuda")

            result = None
            with autocast("cuda"):
                image = prediction_model(a["text"][0], guidance_scale=7.5)["sample"][0]
                with io.BytesIO() as output:
                    image.save(output, format="GIF")
                    # contents = output.getvalue()
                    output.name = "result.gif"
                    output.seek(0)
                    result = copy.deepcopy(output)

            return StreamingResponse(result, media_type="image/gif")

    def reboot_instance(self, model={}, server_type=""):
        if self.utilClass.instanceId:
            try:
                instanceUsers = self.dbClass.getInstanceUserByInstanceName(self.utilClass.instanceId)
                for instanceUser in instanceUsers:
                    instanceUser.isDeleted = True
                    instanceUser.save()
                self.dbClass.createInstanceLog({"execute_from": "backend", "server_type": server_type, "model": model.get("id"),
                                                "project": model.get("project"), "trainingMethod": model.get("trainingMethod"),
                                                "instanceId": self.utilClass.instanceId, "action": "reboot_backend"})
                self.utilClass.sendSlackMessage(f"{self.utilClass.instanceId} : 해당 인스턴스를 재부팅합니다. ({server_type})",
                                      monitoring=True, server_status=True)
                ec2 = self.utilClass.getBotoClient('ec2', region_name=self.utilClass.region_name)
                ec2.reboot_instances(InstanceIds=[self.utilClass.instanceId])
            except:
                self.utilClass.sendSlackMessage(f"{self.utilClass.instanceId} : 재부팅 실패.", daemon=True, server_status=True)
                self.utilClass.sendSlackMessage(f"{self.utilClass.instanceId} : 재부팅 실패.", appError=True)
                self.utilClass.sendSlackMessage(f"{self.utilClass.instanceId} : {str(traceback.format_exc())}", appError=True)
                pass

    def angle_between(self, p1, p2, p3):
        x1, y1 = p1
        x2, y2 = p2
        x3, y3 = p3
        v21 = (x1 - x2, y1 - y2)
        v23 = (x3 - x2, y3 - y2)
        dot = v21[0] * v23[0] + v21[1] * v23[1]
        det = v21[0] * v23[1] - v21[1] * v23[0]
        theta = np.rad2deg(np.arctan2(det, dot))
        print(theta)

    def calcPolygonArea(self, points):
        return 0.5 * np.abs(np.dot(points[:, 0], np.roll(points[:, 1], 1))
                            - np.dot(points[:, 1], np.roll(points[:, 0], 1)))

    def sendEmailPredictMovie(self, user, marketproject):

        try:
            Subject = f'[DS2.AI] 영상 분석이 완료되었습니다.'
            Content = getContentCompletePredictMovie.getContentCompletePredictMovie(user.username,
                                                                                    marketproject.projectName,
                                                                                    marketproject.id)
            if user.lang == 'en':
                Subject = f'[DS2.AI] Video analysis is complete.'
                Content = getContentCompletePredictMovie_en.getEngContentCompletePredictMovie(user.username,
                                                                                           marketproject.projectName,
                                                                                           marketproject.id)
            To = user.email
            result = self.utilClass.sendEmail(To, Subject, Content)
            return result
        except:
            print(traceback.format_exc())
            pass


if __name__ == "__main__" :
    pass
