from starlette.responses import FileResponse, StreamingResponse, JSONResponse
from fastai.vision import *
from models.helper import Helper
from src.errorResponseList import NOT_FOUND_EXTERNALAI_KEY, NOT_EXISTENT_EXTERNALAI_KEY
from src.util import Util
import ast
import traceback
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
import json
from src.util import Util

import os
if os.path.exists('./src/training/aistore_config.py'):
    from aistore_config import aistore_configs
else:
    aistore_configs = {}
import requests
from src import googleTranslate

class DetectKeyPhrase:
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.translate = googleTranslate.GoogleTranslate()
        self.utilClass = Util()
        self.apiName = 'keyphrase'

    def detectKeyPhrase(self, text, appToken):
        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']
        try:
            keyValue, apiEndPoint = self.dbClass.getExternalaiKeyByUserIdAndModelName(user['id'], self.apiName,user['usageplan'], user['remainVoucher'])
        except:
            return NOT_FOUND_EXTERNALAI_KEY

        try:
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

            keyphrase_url = apiEndPoint + "/text/analytics/v2.1/keyphrases"

            documents = {"documents": [
                {"id": "1", "language": "en",
                 "text": text}
            ]}
            headers = {"Ocp-Apim-Subscription-Key": keyValue}
            try:
                response = requests.post(keyphrase_url, headers=headers, json=documents)
            except:
                return NOT_EXISTENT_EXTERNALAI_KEY
            keyPhrase = response.json()

            if 'error' in keyPhrase:
                return HTTP_500_INTERNAL_SERVER_ERROR, {'error': keyPhrase['error']['message']}

            languages = response.json()
            for index, temp in enumerate(languages['documents'][0]['keyPhrases']):
                if languageCode != 'en':
                    languages['documents'][0]['keyPhrases'][index] = self.translate.googletranslate(temp,languageCode)
            result = {"결과" : languages['documents'][0]['keyPhrases']}

            self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)

            self.utilClass.sendSlackMessage(f"PredictLandMarks 예측을 수행하였습니다. {user['email']}(ID :{user['id']})", appLog=True, userInfo=user)

            return HTTP_200_OK, result
        except:
            print(traceback.format_exc())
            return HTTP_500_INTERNAL_SERVER_ERROR, {
                "statusCode": 500,
                "error": "Bad Request",
                "message": "잘못된 접근입니다."
            }


