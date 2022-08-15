from starlette.responses import FileResponse, StreamingResponse, JSONResponse
from fastai.vision import *
from models.helper import Helper
from src.util import Util
import ast
import traceback
import requests
import time
from src.util import Util
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_201_CREATED
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
import os, io
import urllib
import urllib.request
import json
import boto3
import sys
from boto3 import client

import os
if os.path.exists('./src/training/aistore_config.py'):
    from aistore_config import aistore_configs
else:
    aistore_configs = {}
import datetime
from langdetect import detect

class PollyAll:
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.s3 = boto3.client('s3', aws_access_key_id=aistore_configs['aws_access_key_id'],
                          aws_secret_access_key=aistore_configs['aws_secret_access_key'], region_name='ap-southeast-1')

    def pollyAll(self, file, filename, token):

        user = self.dbClass.getUserByAppToken(token).__dict__['__data__']
        language_api_url = aistore_configs['azure_endpoint'] + "/text/analytics/v2.1/languages"
        documents = {"documents": [
            {"id": "1", "text": file.decode("utf-8")},
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
        Polly = client("polly", aws_access_key_id=aistore_configs['aws_access_key_id'],
                        aws_secret_access_key=aistore_configs['aws_secret_access_key'],
                                     region_name="ap-southeast-1")

        # cnt = 0
        # documents = {"documents": [
        # ]}
        # for item in file.decode("utf-8").splitlines():
        #     if not item:
        #         continue
        #     cnt += 1
        #     documents["documents"].append({'id': cnt, 'text': item})
        try:
            Text = str(file.decode("utf-8").splitlines())[2:-2].replace("', '"," ")
            response = Polly.synthesize_speech(
                    Text=Text,
                    OutputFormat="mp3", VoiceId=languages[languageCode])

            stream = response.get("AudioStream")

            temp = datetime.datetime.today().strftime("%Y%m%d%H%M%S")
            with open(f'{os.getcwd()}/temp/{user["id"]}{temp}.mp3', 'wb') as f:
                data = stream.read()
                f.write(data)

            self.s3.upload_file(f'{os.getcwd()}/temp/{user["id"]}{temp}.mp3', 'assetdslab', f'user/{user["id"]}/{temp}.mp3')
            s3Url = urllib.parse.quote(f'https://assetdslab.s3.ap-southeast-1.amazonaws.com/user/{user["id"]}/{temp}.mp3').replace('https%3A//','https://')
            os.remove(f'{os.getcwd()}/temp/{user["id"]}{temp}.mp3')

            self.dbClass.updateUserCumulativePredictCountByAppToken(user["appTokenCode"], 100)
            if self.dbClass.isUserHavingExceedPredictCountByAppToken(user['appTokenCode'], 100):
                return HTTP_503_SERVICE_UNAVAILABLE, {
                    "statusCode": 503,
                    "error": "Bad Request",
                    "message": "예측 기능 사용량 초과입니다.",
                    "message_en": "Prediction usage exceeded."
                }

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
        # else:
        #     Texts = file.decode("utf-8").splitlines()
        #     s3UrlList = []
        #     try:
        #         for Text in Texts:
        #             response = Polly.synthesize_speech(
        #                 Text=Text,
        #                 OutputFormat="mp3", VoiceId=languages[language])
        #
        #             stream = response.get("AudioStream")
        #
        #             temp = f'{datetime.datetime.today().strftime("%Y%m%d%H%M%S")}{random.randint(0,100)}'
        #             with open(f'{os.getcwd()}/temp/{user["id"]}{temp}.mp3', 'wb') as f:
        #                 data = stream.read()
        #                 f.write(data)
        #
        #             self.s3.upload_file(f'{os.getcwd()}/temp/{user["id"]}{temp}.mp3', 'assetdslab',
        #                                 f'user/{user["id"]}/{temp}.mp3')
        #             s3UrlList.append(f'https://assetdslab.s3.ap-northeast-1.amazonaws.com/user/{user["id"]}/{temp}.mp3')
        #             os.remove(f'{os.getcwd()}/temp/{user["id"]}{temp}.mp3')
        #
        #             self.dbClass.updateUserCumulativePredictCountByAppToken(user["appTokenCode"], 100)
        #             if self.dbClass.isUserHavingExceedPredictCountByAppToken(user['appTokenCode'], 100):
        #                 return HTTP_503_SERVICE_UNAVAILABLE, {
        #                     "statusCode": 503,
        #                     "error": "Bad Request",
        #                     "message": "예측 기능 사용량 초과입니다."
        #                 }
        #
        #         return HTTP_201_CREATED, {
        #             "s3Url": s3UrlList
        #         }
        #     except:
        #         print(traceback.format_exc())
        #         return HTTP_500_INTERNAL_SERVER_ERROR, {
        #             "statusCode": 500,
        #             "error": "Bad Request",
        #             "message": "잘못된 접근입니다."
        #         }
        #         pass

