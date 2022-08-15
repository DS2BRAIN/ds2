from starlette.responses import FileResponse, StreamingResponse, JSONResponse
from fastai.vision import *
from models.helper import Helper
from src.errorResponseList import NOT_FOUND_EXTERNALAI_KEY
from src.util import Util
import ast
import traceback
import time
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
import os, io
import requests
import urllib
import urllib.request
import json
import sys
import boto3
import datetime
from boto3 import client

import os
if os.path.exists('./backend/src/training/aistore_config.py'):
    from aistore_config import aistore_configs
else:
    aistore_configs = {}
from langdetect import detect

class Polly:
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.s3 = boto3.client('s3', aws_access_key_id=aistore_configs['aws_access_key_id'],
                               aws_secret_access_key=aistore_configs['aws_secret_access_key'],
                               region_name='ap-southeast-1')
        self.utilClass = Util()
        self.apiName = 'polly'

    def polly(self, text, appToken):
        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']
        try:
            keyValue, apiEndPoint = self.dbClass.getExternalaiKeyByUserIdAndModelName(user['id'], self.apiName,user['usageplan'], user['remainVoucher'])
        except:
            return NOT_FOUND_EXTERNALAI_KEY

        language_api_url = aistore_configs['azure_endpoint'] + "/text/analytics/v2.1/languages"
        documents = {"documents": [
            {"id": "1", "text": text},
        ]}

        headers = {"Ocp-Apim-Subscription-Key": aistore_configs['subscription_key']}
        response = requests.post(language_api_url, headers=headers, json=documents)
        languages = json.loads(response.text)
        languageCode = languages['documents'][0]['detectedLanguages'][0]['iso6391Name']

        languages = {
            "en": "Salli",
            "ko": "Seoyeon",
            "ja": "Mizuki"
        }

        if languageCode not in languages:
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "지원하지 않는 언어코드입니다."
            }

        Polly = client("polly", aws_access_key_id=apiEndPoint,
                        aws_secret_access_key=keyValue,
                                     region_name="ap-northeast-2")

        try:
            response = Polly.synthesize_speech(
                    Text=text,
                    OutputFormat="mp3", VoiceId=languages[languageCode])

            stream = response.get("AudioStream")

            temp = datetime.datetime.today().strftime("%Y%m%d%H%M%S")
            with open(f'{os.getcwd()}/temp/{user["id"]}{temp}.mp3', 'wb') as f:
                data = stream.read()
                f.write(data)

            self.s3.upload_file(f'{os.getcwd()}/temp/{user["id"]}{temp}.mp3', 'assetdslab',
                                f'user/{user["id"]}/{temp}.mp3')
            s3Url = urllib.parse.quote(f'https://assetdslab.s3.ap-southeast-1.amazonaws.com/user/{user["id"]}/{temp}.mp3').replace('https%3A//','https://')
            os.remove(f'{os.getcwd()}/temp/{user["id"]}{temp}.mp3')

            self.dbClass.updateUserCumulativePredictCountByAppToken(user["appTokenCode"], 100)

            self.utilClass.sendSlackMessage(f"Polly 예측을 수행하였습니다. {user['email']}(ID :{user['id']})", appLog=True, userInfo=user)

            return HTTP_201_CREATED, {
                    "s3Url" : s3Url
                }
        except:
            print(traceback.format_exc())
            return HTTP_500_INTERNAL_SERVER_ERROR, {
                "statusCode": 500,
                "error": "Bad Request",
                "message": "잘못된 접근입니다."
            }
            pass
