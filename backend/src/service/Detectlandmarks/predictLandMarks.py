import datetime
import json

# from detectron2.data.catalog import Metadata
from starlette.responses import FileResponse, StreamingResponse, JSONResponse
from fastai.vision import *
from models.helper import Helper
from src.errorResponseList import NOT_FOUND_EXTERNALAI_KEY, NOT_EXISTENT_EXTERNALAI_KEY
from src.util import Util
import ast
import traceback
import time
from src.util import Util
from src.googleTranslate import GoogleTranslate
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
import os, io
from google.cloud import vision
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = './src/training/graphite-ally-268401-d5996b9a2754.json'

class PredictLandMarks:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.apiName = 'landmark'
        self.translate = GoogleTranslate()
        self.s3 = self.utilClass.getBotoClient('s3')

    def predictLandMarks(self, file, appToken):
        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']
        result = {}

        if self.dbClass.getOneUsageplanById(user['usageplan'])['planName'] == 'trial' or user['isBetaUser'] or user['remainVoucher']:
            filePath = "./src/training/graphite-ally-268401-d5996b9a2754.json"
        else:
            try:
                filename, secretPath = self.dbClass.getExternalaiKeyByUserIdAndModelName(user['id'], self.apiName,
                                                                               user['usageplan'], user['remainVoucher'])
                filePath = f'{os.getcwd()}/temp/{user["id"]}APIKEY/google{self.apiName}.json'
                if not os.path.isfile(filePath):
                    if not os.path.isdir(f'{os.getcwd()}/temp/{user["id"]}APIKEY'):
                        os.makedirs(os.path.join(f'{os.getcwd()}/temp/{user["id"]}APIKEY'))
                    self.s3.download_file(self.utilClass.bucket_name, secretPath, filePath)
            except:
                return NOT_FOUND_EXTERNALAI_KEY

        try:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = filePath
            landmarks = vision.ImageAnnotatorClient().landmark_detection(
                image=vision.types.Image(content=file)).landmark_annotations
        except:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = './src/training/graphite-ally-268401-d5996b9a2754.json'
            return NOT_EXISTENT_EXTERNALAI_KEY

        try:
            boundsArray = []
            for landmark in landmarks:
                bounds = ['({},{})'.format(vertex.x, vertex.y)
                          for vertex in landmark.bounding_poly.vertices]
                boundsArray.append({
                    #"text": self.translate.googletranslate(landmark.description,'ko'),
                    "text": landmark.description,
                    "bounds": json.dumps(bounds, default=str)
                })

            result["text"] = landmarks[0].description
            result["bounds"] = boundsArray

            self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)

            self.utilClass.sendSlackMessage(f"PredictLandMarks 예측을 수행하였습니다. {user['email']}(ID :{user['id']})", appLog=True, userInfo=user)

            return HTTP_200_OK, result

        except:
            print(traceback.format_exc())
            return HTTP_500_INTERNAL_SERVER_ERROR, {
                    "statusCode": 500,
                    "error": "Bad Request",
                    "message": "사진속에서 Landmark를 찾지 못하였습니다."
                }
            pass
