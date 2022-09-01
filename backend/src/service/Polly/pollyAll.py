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
import sys

import os
if os.path.exists('./src/training/aistore_config.py'):
    from src.training.aistore_config import aistore_configs
else:
    aistore_configs = {}
import datetime
from langdetect import detect

class PollyAll:
    def __init__(self):
        self.dbClass = Helper(init=True)

    def pollyAll(self, file, filename, token):

        user = self.dbClass.getUserByAppToken(token).__dict__['__data__']
