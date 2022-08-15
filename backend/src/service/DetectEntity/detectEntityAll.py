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
from src.errorResponseList import ErrorResponseList, EXTENSION_NAME_ERROR

import os
if os.path.exists('./src/training/aistore_config.py'):
    from src.training.aistore_config import aistore_configs
else:
    aistore_configs = {}
import requests
# pprint is used to format the JSON response
from pprint import pprint
import os
errorResponseList = ErrorResponseList()

class DetectEntityAll:
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()

    def detectEntityAll(self, file, filename, appToken):
        if filename.split('.')[-1] not in ['csv','txt']:
            return EXTENSION_NAME_ERROR

        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']

        entities_url = aistore_configs['azure_endpoint'] + "/text/analytics/v2.1/entities"

        entity = {}
        documents = {"documents":[]}
        cnt = 0
        entityList = []
        for item in file.decode("utf-8").splitlines():
            cnt += 1
            documents['documents'].append({"id": cnt,"text": item})
            headers = {"Ocp-Apim-Subscription-Key": aistore_configs['subscription_key']}

        response = requests.post(entities_url, headers=headers, json=documents)
        entities = response.json()

        entity = {}
        for k, v in entities.items():
            # print(k)
            if k == 'documents':
                for i in range(len(v[0]['entities'])):
                    try:
                        # print(v[0]['entities'][i])
                        entities = v[0]['entities'][i]
                    except:
                        pass
                    entity[v[0]['entities'][i]['name']] = entities

        self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)

        return HTTP_200_OK, entity
