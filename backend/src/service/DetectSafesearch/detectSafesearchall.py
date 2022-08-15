import datetime

# from detectron2.data.catalog import Metadata
import subprocess

from fastai.vision import *
from models.helper import Helper
import traceback
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from src.util import Util
import os, io
import shutil
from google.cloud import vision
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="./src/training/graphite-ally-268401-d5996b9a2754.json"

utilClass = Util()

class DetectSafeSearchall:

        def __init__(self):
            self.dbClass = Helper(init=True)

        def detectSafeSearchall(self, file, filename, appToken):

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
                        if temp.split('.')[1].lower() in utilClass.imageExtensionName:
                            rows.append(temp)

            client = vision.ImageAnnotatorClient()

            resultList = []

            for row in rows:
                with open(f'{dirpath}/{row}', 'rb') as single_img:
                    img = single_img.read()
                image = vision.types.Image(content=img)

                response = client.safe_search_detection(image=image)
                safe = response.safe_search_annotation

                likelihood_name = ('알수 없음', '매우 약함', '약함', '보통',
                                   '강함', '매우 강함')

                result = {"ImageName": row, "유해성(성인)": likelihood_name[safe.adult],
                          "유해성(의료)": likelihood_name[safe.medical], "유해성(패러디)": likelihood_name[safe.spoof],
                          "유해성(폭력)": likelihood_name[safe.violence], "유해성(노출)": likelihood_name[safe.racy]}
                self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)
                if self.dbClass.isUserHavingExceedPredictCountByAppToken(user['appTokenCode'], 100):
                    return HTTP_503_SERVICE_UNAVAILABLE, {
                        "statusCode": 503,
                        "error": "Bad Request",
                        "message": "예측 기능 사용량 초과입니다.",
                        "message_en": "Prediction usage exceeded."
                    }
                resultList.append(result)

            if response.error.message:
                os.remove(tempFile)
                shutil.rmtree(os.path.splitext(tempFile)[0])
                return HTTP_503_SERVICE_UNAVAILABLE,response.error.message

            os.remove(tempFile)
            shutil.rmtree(os.path.splitext(tempFile)[0])
            return HTTP_200_OK, {"result":resultList}

        def unzipFile(self, filePath):

            pathToZip = filePath
            pathToOut = os.path.splitext(filePath)[0]
            unzip = ['unzip', '-o', pathToZip, '-d', pathToOut]
            p = subprocess.call(unzip)
