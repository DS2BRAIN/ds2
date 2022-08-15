
from fastai.vision import *
from starlette.responses import FileResponse, StreamingResponse, JSONResponse
from fastai.vision import *
from models.helper import Helper
from src.errorResponseList import NOT_FOUND_EXTERNALAI_KEY, NOT_EXISTENT_EXTERNALAI_KEY
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

class FaceDetection:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.apiName = 'face'

    def faceDetect(self, file, appToken):

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
            face_image = vision.types.Image(content=file)
            response = client.face_detection(image=face_image)
        except:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = './src/training/graphite-ally-268401-d5996b9a2754.json'
            return NOT_EXISTENT_EXTERNALAI_KEY

        try:

            faces = response.face_annotations
            likelihood_name = ("예측 불가", "매우 낮음", "낮음", "보통",
                               "높", "매우 높음")

            for f in faces:
                result['화난 표정'] = likelihood_name[f.anger_likelihood]
                result['즐거운 표정'] = likelihood_name[f.joy_likelihood]
                result['놀라운 표'] = likelihood_name[f.surprise_likelihood]

                result['얼굴 인식 좌표'] = (['({},{})'.format(vertex.x, vertex.y)
                             for vertex in f.bounding_poly.vertices])

            self.dbClass.updateUserCumulativePredictCountByAppToken(appToken, 100)

            self.utilClass.sendSlackMessage(f"FaceDetection 예측을 수행하였습니다. {user['email']}(ID :{user['id']})", appLog=True, userInfo=user)

            return HTTP_200_OK, result

        except:
            print(traceback.format_exc())
            return HTTP_500_INTERNAL_SERVER_ERROR, {
                    "statusCode": 500,
                    "error": "Bad Request",
                    "message": "잘못된 접근입니다."
                }
            pass