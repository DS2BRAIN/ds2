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
import boto3
import urllib
import urllib.request
import json
from src.util import Util

import os
if os.path.exists('./aistore_config.py'):
    from aistore_config import aistore_configs
else:
    aistore_configs = {}
import requests
# pprint is used to format the JSON response
from pprint import pprint
import os
from src import googleTranslate
from langdetect import detect

class DetectSentiment:
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.translate = googleTranslate.GoogleTranslate()
        self.apiName = 'sentiment'

    def detectsentiment(self, text, appToken):
        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']

        try:
            keyValue, apiEndPoint = self.dbClass.getExternalaiKeyByUserIdAndModelName(user['id'], self.apiName,user['usageplan'],user['remainVoucher'])
        except:
            return NOT_FOUND_EXTERNALAI_KEY

        language_api_url = aistore_configs['azure_endpoint'] + "/text/analytics/v2.1/languages"
        documents = {"documents": [
            {"id": "1", "text": text},
        ]}

        headers = {"Ocp-Apim-Subscription-Key": aistore_configs['subscription_key']}
        try:
            response = requests.post(language_api_url, headers=headers, json=documents)
            languages = json.loads(response.text)
        except:
            return NOT_EXISTENT_EXTERNALAI_KEY

        languageCode = languages['documents'][0]['detectedLanguages'][0]['iso6391Name']

        sentiment_url = apiEndPoint + "/text/analytics/v2.1/sentiment"

        if languageCode != 'en':
            text = self.translate.googletranslate(text, 'en')

        documents = {"documents": [
            {"id": "1", "language": "en",
             "text": text},
        ]}

        headers = {"Ocp-Apim-Subscription-Key": keyValue}
        try:
            response = requests.post(sentiment_url, headers=headers, json=documents)
            result = {"점수": json.loads(response.text)["documents"][0]["score"]}
        except:
            return NOT_EXISTENT_EXTERNALAI_KEY

        self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)

        self.utilClass.sendSlackMessage(f"DetectSentiment 예측을 수행하였습니다. {user['email']}(ID :{user['id']})", appLog=True, userInfo=user)

        return HTTP_200_OK, result