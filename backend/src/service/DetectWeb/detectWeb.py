import datetime

# from detectron2.data.catalog import Metadata
from fastai.vision import *
from models.helper import Helper
import traceback
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE

from src.errorResponseList import NOT_FOUND_EXTERNALAI_KEY, NOT_EXISTENT_EXTERNALAI_KEY
from src.util import Util
import os, io
from google.cloud import vision
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="./src/training/graphite-ally-268401-d5996b9a2754.json"



class DetectWeb:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.apiName = 'web'


    def detectWeb(self, filename, file, appToken):

        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']

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
            response = client.web_detection(image=image)
        except:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = './src/training/graphite-ally-268401-d5996b9a2754.json'
            return NOT_EXISTENT_EXTERNALAI_KEY

        annotations = response.web_detection

        gessList = []
        detectPageUrl =[]
        detectpartitalImgUrl = []
        detectfullImgUrl = []
        score = []
        finalImg = []

        if annotations.best_guess_labels:
            for label in annotations.best_guess_labels:
                gessList.append(label.label)

        if annotations.pages_with_matching_images:
            for page in annotations.pages_with_matching_images:
                detectPageUrl.append(page.url)

                if page.full_matching_images:
                    for image in page.full_matching_images:
                        detectfullImgUrl.append(image.url)

                if page.partial_matching_images:
                    for image in page.partial_matching_images:
                        detectpartitalImgUrl.append(image.url)

        if annotations.web_entities:
            for entity in annotations.web_entities:
                score.append({"정확도":entity.score,"설명":entity.description})

        if annotations.visually_similar_images:
            for image in annotations.visually_similar_images:
                finalImg.append(image.url)

        if response.error.message:
            return HTTP_503_SERVICE_UNAVAILABLE,response.error.message
        result = {"예상 값":gessList,"페이지 Url":detectPageUrl,"전체 일치 Url":detectfullImgUrl,"부분 일치 Url":detectpartitalImgUrl,"score":score,"예측 이미지":finalImg}

        self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)

        self.utilClass.sendSlackMessage(f"DetectWeb 예측을 수행하였습니다. {user['email']}(ID :{user['id']})", appLog=True, userInfo=user)

        return HTTP_200_OK, result