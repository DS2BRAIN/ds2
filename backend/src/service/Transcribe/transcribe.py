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
import boto3
import urllib
import urllib.request
import json
import datetime
from src.util import Util

import os
if os.path.exists('./aistore_config.py'):
    from aistore_config import aistore_configs
else:
    aistore_configs = {}

class Transcribe:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()

    def transcribe(self, file, filename, appToken):

        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']
        try:
            keyValue, apiEndPoint = self.dbClass.getExternalaiKeyByUserIdAndModelName(user['id'], 'transcribe',
                                                                                  user['usageplan'], user['remainVoucher'])
        except:
            return NOT_FOUND_EXTERNALAI_KEY

        with open(f'{os.getcwd()}/temp/{filename}','wb') as f:
            f.write(file)

        s3 = boto3.client('s3', aws_access_key_id=aistore_configs['aws_access_key_id'], aws_secret_access_key=aistore_configs['aws_secret_access_key'], region_name='ap-southeast-1')
        s3.upload_file(f'temp/{filename}', 'assetdslab' , f'user/{user["id"]}/{filename}')
        os.remove(f'{os.getcwd()}/temp/{filename}')
        job_uri = f'https://assetdslab.s3.ap-northeast-1.amazonaws.com/user/{user["id"]}/{filename}'

        Transcribe = boto3.client('transcribe', aws_access_key_id=apiEndPoint, aws_secret_access_key=keyValue, region_name='ap-southeast-1')

        try:
            try:
                job_name = appToken + datetime.datetime.today().strftime("%Y%m%d%H%M%S")
                print(job_name)
                Transcribe.start_transcription_job(TranscriptionJobName=job_name, Media={'MediaFileUri': job_uri}, MediaFormat=filename.split('.')[-1], LanguageCode='ko-KR') #ko-KR   en-US
            except:
                print(traceback.format_exc())
                try:
                    Transcribe.delete_transcription_job(TranscriptionJobName=job_name)
                except:
                    pass
                return HTTP_503_SERVICE_UNAVAILABLE, {}
                pass

            while True:
                status = Transcribe.get_transcription_job(TranscriptionJobName=job_name)
                print(status['TranscriptionJob']['TranscriptionJobStatus'])
                if status['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
                    break
                time.sleep(1)
            if status['TranscriptionJob']['TranscriptionJobStatus'] == 'COMPLETED':
                response = urllib.request.urlopen(status['TranscriptionJob']['Transcript']['TranscriptFileUri'])
                data = json.loads(response.read())
                text = data['results']['transcripts'][0]['transcript']
                Transcribe.delete_transcription_job(TranscriptionJobName=job_name)

            self.dbClass.updateUserCumulativePredictCountByAppToken(user['appTokenCode'], 100)
            if self.dbClass.isUserHavingExceedPredictCountByAppToken(user['appTokenCode'], 100):
                return HTTP_503_SERVICE_UNAVAILABLE, {
                    "statusCode": 503,
                    "error": "Bad Request",
                    "message": "예측 기능 사용량 초과입니다.",
                    "message_en": "Prediction usage exceeded."
                }
            self.utilClass.sendSlackMessage(f"Transcribe 예측을 수행하였습니다. {user['email']}(ID :{user['id']})", appLog=True, userInfo=user)

            return HTTP_200_OK, {"transcrible-text":text}
        except:
            Transcribe.delete_transcription_job(TranscriptionJobName=job_name)
            print(traceback.format_exc())
            return HTTP_500_INTERNAL_SERVER_ERROR, {
                "statusCode": 500,
                "error": "Bad Request",
                "message": "잘못된 접근입니다."
            }
            pass
