# -*- coding: utf-8 -*-
import shutil
import sys
import traceback

import typing
import os

from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from distutils.dir_util import copy_tree

from models.helper import Helper
from src.util import Util
import json
dbClass = Helper(init=True)


utilClass = Util()

try:
    print("download")
    if not os.path.exists('./src/training/deepsort/model_data/mars-small128.pb'):
        print("copy deepsort")
        try:
            copy_tree(f"/opt/deepsort/", f"{os.getcwd()}/src/training/deepsort/")
        except:
            # print(traceback.format_exc())
            pass

    if not os.path.exists('./asset/object_detection_configs/COCO-InstanceSegmentation/mask_rcnn_X_101_32x8d_FPN_3x.yaml'):
        print("copy object_detection_configs")
        try:
            copy_tree(f"{os.getcwd()}/../astore-rcnn/object_detection_configs/", f"{os.getcwd()}/asset/object_detection_configs/")
        except:
            # print(traceback.format_exc())
            pass

    if not os.path.exists('./asset/h.xml'):
        print("copy h.xml")
        try:
            if not os.path.exists(f"/opt/h.xml"):
                import urllib.request
                urllib.request.urlretrieve("https://aimakerdslab.s3.ap-northeast-2.amazonaws.com/asset/h.xml", "/opt/h.xml")
            shutil.copyfile(f"/opt/h.xml", f"{os.getcwd()}/asset/h.xml")
        except:
            # print(traceback.format_exc())
            pass

except:
    print(traceback.format_exc())
    pass

from fastapi import FastAPI, Form, HTTPException, Depends
from src import manageUser, manageTask
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from models import skyhub
from middelwares.token_validator import access_control
from starlette.responses import Response, JSONResponse
from starlette.status import HTTP_200_OK
from routers import apiRouter, dataconnectorRouter, etcRouter, fileRouter, modelsRouter, marketRouter, projectsRouter, \
    flowRouter, flowNodeRouter, monitoringAlertRouter, predictRouter, labelRouter, userRouter, paymentRouter, \
    jupyterRouter, opsRouter, commandRouter, commandCollectionRouter, commandReviewRouter, postRouter, \
    postBookmarkRouter, postCommentRouter, contestRouter
from fastapi import Depends
from fastapi.security import APIKeyHeader
from src.errorResponseList import NOT_ALLOWED_TOKEN_ERROR, EXCEED_PREDICT_ERROR
import requests
import orjson

if os.path.exists('./src/creating/routers/'):
    from src.creating.routers import detection3dRouter, msRouter, maRouter, mosRouter, \
        mcRouter, meRouter, mgRouter, mmRouter, moRouter, muRouter, mvRouter


class ORJSONResponse(JSONResponse):
    media_type = "application/json"

    def render(self, content: typing.Any) -> bytes:
        return orjson.dumps(content)

# if utilClass.enterprise:
#     adminKey = dbClass.getAdminKey()
#     if not utilClass.isValidKey(adminKey):
#         print("License valid failed")
#         raise("License valid failed")
#
#     if datetime.datetime.now() < adminKey["startDate"] or datetime.datetime.now() > adminKey["endDate"]:
#         print("License date ended")
#         raise ("License date ended")

API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)
app = FastAPI(openapi_url="/api/v1/openapi.json", docs_url="/skyhubdocs", redoc_url="/skyhubredoc", default_response_class=ORJSONResponse)

class UnicornException(Exception):
    def __init__(self, code, error):
        self.code = code
        self.error = error

async def check_appTokenCode(apptoken: str = Form(...)):
    try:
        user = dbClass.getUserByAppToken(apptoken).__dict__['__data__']
    except:
        status_code, content = NOT_ALLOWED_TOKEN_ERROR
        raise UnicornException(status_code, content)

    if dbClass.isUserHavingExceedPredictCountByAppToken(user['appTokenCode'], 100):
        status_code, content = EXCEED_PREDICT_ERROR
        raise UnicornException(status_code, content)

async def receive_token(token: str = Depends(API_KEY_HEADER)):
    pass

@app.exception_handler(UnicornException)
async def unicorn_exception_handler(response: Response, exception: UnicornException):
    return JSONResponse(
        status_code=exception.code,
        content=exception.error
    )

app.include_router(apiRouter.router, tags=["Api Router"], dependencies=[Depends(check_appTokenCode)])
app.include_router(dataconnectorRouter.router, tags=["Dataconnector Router"])
app.include_router(etcRouter.router, tags=["Etc Router"])
app.include_router(modelsRouter.router, tags=["Models Router"])
app.include_router(projectsRouter.router, tags=["Projects Router"])
app.include_router(userRouter.router, tags=["User Router"])
app.include_router(labelRouter.router, tags=["Label Router"])
app.include_router(fileRouter.router, tags=["File Router"])
app.include_router(predictRouter.router, tags=["Predict Router"])
app.include_router(marketRouter.router, tags=["Market Router"])
app.include_router(paymentRouter.router, tags=["Payment Router"])
app.include_router(jupyterRouter.router, tags=["Jupyter Router"])
app.include_router(opsRouter.router, tags=["Ops Router"])
app.include_router(flowRouter.router, tags=["Flow Router"])
app.include_router(flowNodeRouter.router, tags=["Flow Node Router"])
app.include_router(monitoringAlertRouter.router, tags=["Monitoring Alert Router"])
app.include_router(commandRouter.router, tags=["Command Router"])
app.include_router(commandCollectionRouter.router, tags=["Command Collection Router"])
app.include_router(commandReviewRouter.router, tags=["Command Review Router"])
app.include_router(postRouter.router, tags=["Post Router"])
app.include_router(postBookmarkRouter.router, tags=["Post Bookmark Router"])
app.include_router(postCommentRouter.router, tags=["Post Comment Router"])
app.include_router(contestRouter.router, tags=["Contest Router"])

if os.path.exists('./src/creating/routers/'):
    app.include_router(detection3dRouter.router, tags=["3d detection Router"])
    app.include_router(msRouter.router, tags=["ms detection Router"])
    app.include_router(maRouter.router, tags=["ma detection Router"])
    app.include_router(mosRouter.router, tags=["mos detection Router"])
    app.include_router(mmRouter.router, tags=["mm detection Router"])
    app.include_router(meRouter.router, tags=["me detection Router"])
    app.include_router(mvRouter.router, tags=["mv detection Router"])
    app.include_router(muRouter.router, tags=["mu detection Router"])
    app.include_router(mgRouter.router, tags=["mg detection Router"])
    app.include_router(moRouter.router, tags=["mo detection Router"])
    app.include_router(mcRouter.router, tags=["mc detection Router"])

# if utilClass.configOption not in ['dev_local', 'enterprise']:
    # app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(middleware_class=BaseHTTPMiddleware, dispatch=access_control)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#TODO : 토큰처리 해야됨

# @app.middleware("http")
# async def add_process_time_header(request: Request, call_next):
#
#     #before
#
#     if not skyhub.is_closed():
#         skyhub.close()
#     # skyhub.connect()
#
#     #execute
#     response = await call_next(request)
#
#     #after
#     if not skyhub.is_closed():
#         skyhub.close()
#
#     #return
#     return response


@app.on_event("startup")
def startup_event():
    print("startup")
    # try:
    #     if os.path.exists("/home/ubuntu/aimaker-backend-deploy"):
    #         instanceId = requests.get("http://169.254.169.254/latest/meta-data/instance-id", timeout=1).text
    #         r = requests.get("http://169.254.169.254/latest/dynamic/instance-identity/document")
    #         response_json = r.json()
    #         region_name = response_json.get('region')
    #         opsId = None
    #         grouptype = ""
    #         ec2 = utilClass.getBotoClient('ec2', region_name=region_name)
    #         allInstances = ec2.describe_instances()
    #         for instanceRaw in allInstances.get("Reservations", []):
    #             instances = instanceRaw.get("Instances", [{}])
    #             for instance in instances:
    #                 if instanceId == instance.get("InstanceId", None):
    #                     notifyData = {"execute_from": "backend", "instanceId": instance['InstanceId'],
    #                                   "action": "create_backend_main", "region": region_name}
    #                     tags = instance.get("Tags", [])
    #                     for tag in tags:
    #                         if tag.get("Key") == "opsId":
    #                             opsId = tag.get("Value")
    #                             model = dbClass.getOneLastestOpsModelByOpsProjectId(opsId)
    #                             s3Url = model.filePath
    #                             print("opsId Matched")
    #                             print(os.getcwd())
    #                             print(s3Url)
    #                             print("/".join(s3Url.split("/")[3:]))
    #                             localFilePath = f"{utilClass.save_path}/" + s3Url.split("/")[-1]
    #                             if not os.path.isfile(localFilePath):
    #                                 utilClass.getBotoClient('s3').download_file(utilClass.bucket_name, "/".join(s3Url.split("/")[3:]), localFilePath)
    #                             notifyData["ops_project"] = opsId
    #
    #                         if tag.get("Key") == "grouptype":
    #                             grouptype = tag.get("Value")
    #
    #                     dbClass.createInstanceLog(notifyData)
    #                     # utilClass.sendSlackMessage(
    #                     #     f"{region_name} {instanceId} : 백엔드 서버를 시작합니다. {opsId}",
    #                     #     server_status=True)
    #
    #         print("grouptype")
    #         print(grouptype)
    #         if opsId is None and "cpu" not in grouptype and "gpu" not in grouptype:
    #             sys.exit()
    #
    #         # if not opsId:
    #         #     for getQuickAiModel in dbClass.getQuickAiModels():
    #         #         if getQuickAiModel.status == 100:
    #         #             localFilePath = f"{self.utilClass.save_path}/" + getQuickAiModel.filePath.split("/")[-1]
    #         #             if not os.path.isfile(localFilePath):
    #         #                 s3 = utilClass.getBotoClient('s3')
    #         #                 s3.download_file(utilClass.bucket_name, "/".join(getQuickAiModel.filePath.split("/")[3:]),
    #         #                                  localFilePath)
    # except:
    #     pass

@app.on_event("shutdown")
def shutdown_event():

    if not skyhub.is_closed():
        skyhub.close()

@app.get("/")
def getRoot(response: Response):
    response.status_code = HTTP_200_OK
    return

@app.get("/check/version/")
def checkVersion(response: Response):


    result = {"version": utilClass.server_version, "enterprise-version": utilClass.enterprise_server_version}

    response.status_code = HTTP_200_OK
    return result

if __name__ == '__main__':
    import uvicorn

    if utilClass.configOption == 'enterprise':
        uvicorn.run("main:app", host='0.0.0.0', port=13002, workers=4)
    elif utilClass.configOption == 'prod_local':
        uvicorn.run("main:app", host='0.0.0.0', port=2050, workers=4)
    elif utilClass.configOption == 'dev_local':
        uvicorn.run("main:app", host='0.0.0.0', port=2052, workers=4)

