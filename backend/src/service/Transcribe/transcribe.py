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
import urllib
import urllib.request
import json
import datetime
from src.util import Util

import os
if os.path.exists('./src/training/aistore_config.py'):
    from src.training.aistore_config import aistore_configs
else:
    aistore_configs = {}

class Transcribe:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()

    def transcribe(self, file, filename, appToken):

        user = self.dbClass.getUserByAppToken(appToken).__dict__['__data__']
