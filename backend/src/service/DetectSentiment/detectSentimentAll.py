from starlette.responses import FileResponse, StreamingResponse, JSONResponse
from fastai.vision import *
from models.helper import Helper
from src.util import Util
import ast
import traceback
import time
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
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
from langdetect import detect
from src import googleTranslate

class DetectSentimentAll:
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.translate = googleTranslate.GoogleTranslate()

    def detectsentimentAll(self, file, filename, appToken):

        if filename.split('.')[-1] not in ['csv', 'txt']:
            return HTTP_422_UNPROCESSABLE_ENTITY, {
                "statusCode": 422,
                "error": "Invaild File type",
                "message": "허용되지 않는 파일 확장자입니다."
            }
        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']

        language_api_url = aistore_configs['azure_endpoint'] + "/text/analytics/v2.1/languages"
        documents = {"documents": [
            {"id": "1", "text": file.decode("utf-8")},
        ]}

        headers = {"Ocp-Apim-Subscription-Key": aistore_configs['subscription_key']}
        response = requests.post(language_api_url, headers=headers, json=documents)
        languages = json.loads(response.text)
        languageCode = languages['documents'][0]['detectedLanguages'][0]['iso6391Name']

        subscription_key = aistore_configs['subscription_key']
        endpoint = aistore_configs['azure_endpoint']

        sentiment_url = endpoint + "/text/analytics/v2.1/sentiment"

        documents = {"documents": [
        ]}
        text = file.decode("utf-8")
        if languageCode != 'en':
            text = self.translate.googletranslate(text, 'en')
        if self.dbClass.isUserHavingExceedPredictCountByAppToken(user['appTokenCode'], 100):
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "예측 기능 사용량 초과입니다.",
                "message_en": "Prediction usage exceeded."
            }
        documents["documents"].append({'id': 1, "language": 'en', 'text': text})

        headers = {"Ocp-Apim-Subscription-Key": subscription_key}
        response = requests.post(sentiment_url, headers=headers, json=documents)
        result = {"점수":json.loads(response.text)["documents"][0]["score"]}
        self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)

        return HTTP_200_OK, result