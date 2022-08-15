import datetime

# from detectron2.data.catalog import Metadata
from fastai.vision import *
from models.helper import Helper
import traceback
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from src.util import Util
import shutil
import os, io
from google.cloud import vision
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="./src/training/graphite-ally-268401-d5996b9a2754.json"
utilClass = Util()


class DetectWebAll:

    def __init__(self):
        self.dbClass = Helper(init=True)

    def detectWebAll(self, filename, file, appToken):


        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']
        if not user:
            print(traceback.format_exc())
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "허용되지 않은 토큰 값입니다."
            }

        if self.dbClass.isUserHavingExceedPredictCountByAppToken(user['appTokenCode']):
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "예측 기능 사용량 초과입니다.",
                "message_en": "Prediction usage exceeded."
            }

        client = vision.ImageAnnotatorClient()

        tempFile = f'temp/{filename}'
        with open(tempFile, 'wb') as open_file:
            open_file.write(file)
        self.unzipFile(tempFile)

        rows = []
        Web = []

        for (dirpath, dirnames, filenames) in os.walk(
                os.path.splitext(tempFile)[0]):
            for temp in filenames:
                if '.' in temp:
                    if temp.split('.')[1].lower() in utilClass.imageExtensionName:
                        rows.append(temp)

        for row in rows:
            with open(f'{dirpath}/{row}', 'rb') as single_img:
                content = single_img.read()

                image = vision.types.Image(content=content)
                response = client.web_detection(image=image)
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
                        score.append({"Score":entity.score,"Description":entity.description})

                if annotations.visually_similar_images:
                    for image in annotations.visually_similar_images:
                        finalImg.append(image.url)

                if response.error.message:
                    return HTTP_503_SERVICE_UNAVAILABLE,response.error.message
                result = {"이미지":row,"예상 값":gessList,"페이지 Url":detectPageUrl,"전체 일치 Url":detectfullImgUrl,"부분 일치 Url":detectpartitalImgUrl,"score":score,"예측 이미지":finalImg}
                print(result)
                Web.append(result)

                self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)
                if self.dbClass.isUserHavingExceedPredictCountByAppToken(user['appTokenCode'], 100):
                    return HTTP_503_SERVICE_UNAVAILABLE, {
                        "statusCode": 503,
                        "error": "Bad Request",
                        "message": "예측 기능 사용량 초과입니다.",
                        "message_en": "Prediction usage exceeded."
                    }
        webResult = {'WebResult' : Web}
        os.remove(tempFile)
        shutil.rmtree(os.path.splitext(tempFile)[0])
        return HTTP_200_OK, webResult

    def unzipFile(self, filePath):

        pathToZip = filePath
        pathToOut = os.path.splitext(filePath)[0]
        unzip = ['unzip', '-o', pathToZip, '-d', pathToOut]
        p = subprocess.call(unzip)
