
from starlette.responses import FileResponse, StreamingResponse, JSONResponse
from fastai.vision import *
from models.helper import Helper
from src.errorResponseList import NOT_EXISTENT_EXTERNALAI_KEY, NOT_FOUND_EXTERNALAI_KEY
from src.util import Util
import ast
import traceback
import time
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
import os, io
from google.cloud import vision
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="./src/training/graphite-ally-268401-d5996b9a2754.json"

class LabelDetection:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.apiName = 'label'
        self.s3 = self.utilClass.getBotoClient('s3')

    def labelDetect(self, file, appToken):

        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']

        result = {}

        client = vision.ImageAnnotatorClient()

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
            image = vision.types.Image(content=file)
            labels = client.label_detection(image=image).label_annotations
        except:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = './src/training/graphite-ally-268401-d5996b9a2754.json'
            return NOT_EXISTENT_EXTERNALAI_KEY

        try:

            #result['labelValues'] = labels

            for i in range(len(labels)):
                result["mid {}".format(i)] = labels[i].mid
                result["예상 라벨 {}".format(i)] = labels[i].description
                result["정확도 {}".format(i)] = labels[i].score
                result["topicality {}".format(i)] = labels[i].topicality

            self.dbClass.updateUserCumulativePredictCountByAppToken(appToken, 100)

            self.utilClass.sendSlackMessage(f"LabelDetection 예측을 수행하였습니다. {user['email']}(ID :{user['id']})", appLog=True, userInfo=user)

            return HTTP_200_OK, result

        except:
            print(traceback.format_exc())
            return HTTP_500_INTERNAL_SERVER_ERROR, {
                    "statusCode": 500,
                    "error": "Bad Request",
                    "message": "잘못된 접근입니다."
                }
            pass