import datetime

# from detectron2.data.catalog import Metadata
import json
import subprocess

from starlette.responses import FileResponse, StreamingResponse, JSONResponse
from fastai.vision import *
from models.helper import Helper
from src.util import Util
import traceback
import time
from src.util import Util
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
import os, io
from google.cloud import vision
import shutil
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="./src/training/graphite-ally-268401-d5996b9a2754.json"

class PredictLandMarksAll:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()

    def predictLandMarksAll(self, file, filename, appToken):

        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']
        if not user:
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "허용되지 않은 토큰 값입니다."
            }

        if self.dbClass.isUserHavingExceedPredictCountByAppToken(user['appTokenCode'], 100):
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "예측 기능 사용량 초과입니다.",
                "message_en": "Prediction usage exceeded."
            }

        tempFile = f'temp/{filename}'
        with open(tempFile, 'wb') as open_file:
            open_file.write(file)
        self.unzipFile(tempFile)

        rows = []

        for (dirpath, dirnames, filenames) in os.walk(
                os.path.splitext(tempFile)[0]):
            for temp in filenames:
                if '.' in temp:
                    if temp.split('.')[1].lower() in self.utilClass.imageExtensionName:
                        rows.append(temp)

        predict = {}
        result = {}
        resultlist =[]

        for row in rows:
            with open(f'{dirpath}/{row}','rb') as single_img:
                content = single_img.read()
                landmarks = vision.ImageAnnotatorClient().landmark_detection(
                    image=vision.types.Image(content=content)).landmark_annotations
                try:
                    boundsArray = []
                    for landmark in landmarks:
                        bounds = ['({},{})'.format(vertex.x, vertex.y)
                                  for vertex in landmark.bounding_poly.vertices]
                        boundsArray.append({
                            "text": landmark.description,
                            "bounds": json.dumps(bounds, default=str)
                        })
                except:
                    print(traceback.format_exc())
                    return HTTP_500_INTERNAL_SERVER_ERROR, {
                        "statusCode": 500,
                        "error": "Bad Request",
                        "message": "잘못된 접근입니다."
                    }
                    pass

                try:
                    predict["text"] = landmarks[0].description
                    predict["bounds"] = boundsArray
                    resultlist.append({"images":row, "result":predict})
                    self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)
                    if self.dbClass.isUserHavingExceedPredictCountByAppToken(user['appTokenCode'], 100):
                        return HTTP_503_SERVICE_UNAVAILABLE, {
                            "statusCode": 503,
                            "error": "Bad Request",
                            "message": "예측 기능 사용량 초과입니다.",
                            "message_en": "Prediction usage exceeded."
                        }
                except:
                    pass
        result={"result":resultlist}


        os.remove(tempFile)
        shutil.rmtree(os.path.splitext(tempFile)[0])

        return HTTP_200_OK, result

    def unzipFile(self, filePath):

        pathToZip = filePath
        pathToOut = os.path.splitext(filePath)[0]
        unzip = ['unzip', '-o', pathToZip, '-d', pathToOut]
        p = subprocess.call(unzip)
