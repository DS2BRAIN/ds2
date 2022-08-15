from starlette.responses import FileResponse, StreamingResponse, JSONResponse
from fastai.vision import *
from models.helper import Helper
from src.util import Util
import ast
import traceback
import time
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
import os, io
import boto3
import urllib
import urllib.request
import json
from src.util import Util

import os
if os.path.exists('./src/training/aistore_config.py'):
    from aistore_config import aistore_configs
else:
    aistore_configs = {}
import requests
# pprint is used to format the JSON response
from pprint import pprint
import os
from src import googleTranslate
from langdetect import detect

class DetectKeyPhraseAll:
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.translate = googleTranslate.GoogleTranslate()

    def detectKeyPhraseAll(self, file, filename, appToken):
        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']
        if not user:
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "허용되지 않은 토큰 값입니다."
            }

        if self.dbClass.isUserHavingExceedPredictCountByAppToken(user['appTokenCode'],100):
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "예측 기능 사용량 초과입니다.",
                "message_en": "Prediction usage exceeded."
            }


        if filename.split('.')[-1] not in ['csv','txt']:
            return HTTP_422_UNPROCESSABLE_ENTITY, {
                "statusCode": 422,
                "error": "Bad Request",
                "message": "지원 하지 않는 확장자입니다."
            }

        result = []


        try:
            text = str(file.decode("utf-8"))
            language_api_url = aistore_configs['azure_endpoint'] + "/text/analytics/v2.1/languages"
            documents = {"documents": [
                {"id": "1", "text": text},
            ]}

            headers = {"Ocp-Apim-Subscription-Key": aistore_configs['subscription_key']}
            response = requests.post(language_api_url, headers=headers, json=documents)
            languages = json.loads(response.text)
            languageCode = languages['documents'][0]['detectedLanguages'][0]['iso6391Name']
            if languageCode != 'en':
                text = self.translate.googletranslate(text,'en')

            keyphrase_url = aistore_configs['azure_endpoint'] + "/text/analytics/v2.1/keyphrases"

            documents = {"documents": [
                {"id": "1", "language": "en",
                 "text": text}
            ]}
            headers = {"Ocp-Apim-Subscription-Key": aistore_configs['subscription_key']}
            response = requests.post(keyphrase_url, headers=headers, json=documents)
            languages = response.json()
            for index, temp in enumerate(languages['documents'][0]['keyPhrases']):
                if languageCode != 'en':
                    languages['documents'][0]['keyPhrases'][index] = self.translate.googletranslate(temp,languageCode)

            self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)
            if self.dbClass.isUserHavingExceedPredictCountByAppToken(user['appTokenCode'], 100):
                return HTTP_503_SERVICE_UNAVAILABLE, {
                    "statusCode": 503,
                    "error": "Bad Request",
                    "message": "예측 기능 사용량 초과입니다.",
                    "message_en": "Prediction usage exceeded."
                }
            return HTTP_200_OK, languages
        except:
            return HTTP_500_INTERNAL_SERVER_ERROR, {
                "statusCode": 500,
                "error": "Bad Request",
                "message": "잘못된 접근입니다."
            }
