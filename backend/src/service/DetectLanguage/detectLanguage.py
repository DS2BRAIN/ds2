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
if os.path.exists('./src/training/aistore_config.py'):
    from src.training.aistore_config import aistore_configs
else:
    aistore_configs = {}
import requests
# pprint is used to format the JSON response
from pprint import pprint
import os

class DetectLanguage:
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.apiName = 'language'

    def detectLanguage(self, text, appToken):
        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']
        try:
            keyValue, apiEndPoint = self.dbClass.getExternalaiKeyByUserIdAndModelName(user['id'], self.apiName,user['usageplan'], user['remainVoucher'])
        except:
            return NOT_FOUND_EXTERNALAI_KEY

        try:
            language_api_url = apiEndPoint + "/text/analytics/v2.1/languages"
            documents = {"documents": [
                {"id": "1", "text": text},
            ]}

            headers = {"Ocp-Apim-Subscription-Key": keyValue}
            response = requests.post(language_api_url, headers=headers, json=documents)
        except:
            return NOT_EXISTENT_EXTERNALAI_KEY

        languages = response.json()

        if 'error' in languages:
            return HTTP_500_INTERNAL_SERVER_ERROR, {'error': languages['error']['message']}

        self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)

        self.utilClass.sendSlackMessage(f"DetectLanguage 예측을 수행하였습니다. {user['email']}(ID :{user['id']})", appLog=True, userInfo=user)

        return HTTP_200_OK, languages

