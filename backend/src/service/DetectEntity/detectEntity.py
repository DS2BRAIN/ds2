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
import requests
# pprint is used to format the JSON response
from pprint import pprint
import os

class DetectEntity:
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.apiName = 'entity'

    def detectEntity(self, text, appToken):

        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']
        try:
            keyValue, apiEndPoint = self.dbClass.getExternalaiKeyByUserIdAndModelName(user['id'], self.apiName, user['usageplan'], user['remainVoucher'])
        except:
            return NOT_FOUND_EXTERNALAI_KEY

        entities_url = apiEndPoint + "/text/analytics/v2.1/entities"

        documents = {"documents": [
            {"id":  '1',
             "text": text}]}

        headers = {"Ocp-Apim-Subscription-Key": keyValue}
        try:
            response = requests.post(entities_url, headers=headers, json=documents)
        except:
            return NOT_EXISTENT_EXTERNALAI_KEY
        entities = response.json()

        if 'error' in entities:
            return HTTP_500_INTERNAL_SERVER_ERROR, {'error' : entities['error']['message']}

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

        if len(entity):
            self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)
        # print(entity['matches'][0][])

        self.utilClass.sendSlackMessage(f"DetectEntity 예측을 수행하였습니다. {user['email']}(ID :{user['id']})", appLog=True, userInfo=user)

        return HTTP_200_OK, entity