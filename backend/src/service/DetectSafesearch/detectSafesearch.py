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

class DetectSafeSearch:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.apiName = 'safelink'

    def detectSafeSearch(self, file, filename, appToken):
        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']

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
            client = vision.ImageAnnotatorClient()
            image = vision.types.Image(content=file)
            response = client.safe_search_detection(image=image)
        except:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = './src/training/graphite-ally-268401-d5996b9a2754.json'
            return NOT_EXISTENT_EXTERNALAI_KEY

        safe = response.safe_search_annotation

        likelihood_name = ('알수 없음', '매우 약함', '약함', '보통',
                           '강함', '매우 강함')

        result = {"ImageName": filename, "유해성(성인)": likelihood_name[safe.adult],
                  "유해성(의료)": likelihood_name[safe.medical], "유해성(패러디)": likelihood_name[safe.spoof],
                  "유해성(폭력)": likelihood_name[safe.violence], "유해성(노출)": likelihood_name[safe.racy]}

        if response.error.message:
            return HTTP_503_SERVICE_UNAVAILABLE,response.error.message

        self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)

        self.utilClass.sendSlackMessage(f"DetectSentiment 예측을 수행하였습니다. {user['email']}(ID :{user['id']})", appLog=True, userInfo=user)

        return HTTP_200_OK, result