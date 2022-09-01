import json
from typing import List

from fastapi import APIRouter, UploadFile
from starlette.background import BackgroundTasks

from src.manageOps import ManageOps
from src.util import Util
from src.manageUser import ManageUser
from src.manageLabeling import ManageLabeling
from src.manageUpload import ManageUpload
from pydantic import BaseModel
from starlette.responses import Response
from starlette.status import HTTP_200_OK
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from src.errorResponseList import ErrorResponseList, NOT_FOUND_ERROR, EXTENSION_NAME_ERROR
from src.manageExternalAi import ManageExternalAi
from fastapi import File, Form

errorResponseList = ErrorResponseList()
router = APIRouter()
utilClass = Util()
manageLabelingClass = ManageLabeling()
manageUserClass = ManageUser()
manageUploadClass = ManageUpload()

manageExternalAiClass = ManageExternalAi()
manageOpsClass = ManageOps()
import os
from src.managePredict import ManagePredict
predictClass = ManagePredict()


class PredictObject(BaseModel):
    modelid: str = None
    apptoken: str = None
    modeltoken: str = None
    userId: str = None
    inputLoadedModel: str = None
    parameter: dict

@router.get("/inference/inferenceops{opsId}/")
def getRoot(response: Response, opsId):
    response.status_code = HTTP_200_OK
    return

@router.post("/inference/inferenceops{opsId}/")
def getPredict(response: Response, background_tasks: BackgroundTasks, opsId, predictObject: PredictObject):
    if not predictObject.modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    response.status_code, result = predictClass.run(predictObject.modelid, predictObject.parameter, predictObject.apptoken, predictObject.userId, inputLoadedModel=predictObject.inputLoadedModel, opsId=opsId, background_tasks=background_tasks, modeltoken=predictObject.modeltoken)


    return result

@router.post("/inferenceimage/inferenceops{opsId}/")
def getPredictImage(response: Response, background_tasks: BackgroundTasks, opsId, userId: str = Form(...), file: UploadFile = File(...), filename: str = Form(...),
                    modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):
    if not modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    file = file.file.read()

    if filename.split('.')[-1].lower() not in utilClass.videoExtensionName + utilClass.imageExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:

        response.status_code, result = predictClass.runImage(modelid, file, filename, apptoken, userId, opsId=opsId, background_tasks=background_tasks, modeltoken=modeltoken)

    else:

        response.status_code, result = predictClass.runMovie(modelid, file, filename, apptoken, userId, opsId=opsId, background_tasks=background_tasks, modeltoken=modeltoken)


    return result

class PredictWithURLObject(BaseModel):
    modelid: str = None
    apptoken: str = None
    modeltoken: str = None
    userId: str = None
    url: str

@router.post("/inferenceimagebyurl/inferenceops{opsId}/")
def getPredictImageByUrl(response: Response, background_tasks: BackgroundTasks, opsId, predictObject: PredictWithURLObject):
    if not predictObject.modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    response.status_code, result = predictClass.getPredictImageByUrl(predictObject.modelid, predictObject.url, predictObject.apptoken, predictObject.userId, opsId=opsId, background_tasks=background_tasks, modeltoken=predictObject.modeltoken)
    return result



@router.post("/inferenceimagexai/inferenceops{opsId}/")
def getPredictImagexai(response: Response, background_tasks: BackgroundTasks, opsId, userId: str = Form(...), file: UploadFile = File(...), filename: str = Form(...),
                    modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):
    if not modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    if filename.split('.')[-1].lower() not in utilClass.imageExtensionName + utilClass.videoExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()
    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:

        response.status_code, result = predictClass.runImage(modelid, file, filename, apptoken, userId, xai=True, opsId=opsId, background_tasks=background_tasks, modeltoken=modeltoken)

    else:

        response.status_code, result = predictClass.runMovie(modelid, file, filename, apptoken, userId, opsId=opsId, background_tasks=background_tasks, modeltoken=modeltoken)

    return result

@router.post("/inferenceimagebyurlinfo/inferenceops{opsId}/")
def getPredictImageByUrlInfo(response: Response, background_tasks: BackgroundTasks, opsId, predictObject: PredictWithURLObject):
    if not predictObject.modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    response.status_code, result = predictClass.getPredictImageByUrl(predictObject.modelid, predictObject.url, predictObject.apptoken, predictObject.userId, info=True, opsId=opsId, background_tasks=background_tasks, modeltoken=predictObject.modeltoken)
    return result

@router.post("/inferenceimagebyurlxai/inferenceops{opsId}/")
def getPredictImageByUrl(response: Response, background_tasks: BackgroundTasks, opsId, predictObject: PredictWithURLObject):
    if not predictObject.modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    response.status_code, result = predictClass.getPredictImageByUrl(predictObject.modelid, predictObject.url, predictObject.apptoken, predictObject.userId, xai=True, opsId=opsId, background_tasks=background_tasks, modeltoken=predictObject.modeltoken)
    return result

@router.post("/inferenceimageinfo/inferenceops{opsId}/")
def getPredictImageInfo(response: Response, background_tasks: BackgroundTasks, opsId, userId: str = Form(...), file: UploadFile = File(...), filename: str = Form(...),
                    modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):
    if not modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    if filename.split('.')[-1].lower() not in utilClass.videoExtensionName + utilClass.imageExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()
    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:

        response.status_code, result = predictClass.runImage(modelid, file, filename, apptoken, userId, info=True, opsId=opsId, background_tasks=background_tasks, modeltoken=modeltoken)

    else:

        response.status_code, result = predictClass.runMovie(modelid, file, filename, apptoken, userId, opsId=opsId, background_tasks=background_tasks, modeltoken=modeltoken)


    return result

@router.post("/inferenceall/inferenceops{opsId}/")
def getPredictAll(response: Response, opsId, userId: str = Form(...), file: UploadFile = File(...), filename: str = Form(...),
                  modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):

    if filename.split('.')[-1].lower() not in ['csv']:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()
    response.status_code, result = predictClass.runAll(modelid, file, filename, apptoken, userId, isForText=True, opsId=opsId, modeltoken=modeltoken)
    return result

@router.post("/inferenceallasync/inferenceops{opsId}/")
def getPredictAllAsync(response: Response, opsId, userId: str = Form(...), file: UploadFile = File(...), filename: str = Form(...),
                  modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):

    if filename.split('.')[-1].lower() not in ['csv']:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()
    response.status_code, result = predictClass.runAllAsync(modelid, file, filename, apptoken, userId, isForText=True, opsId=opsId, modeltoken=modeltoken)
    return result


@router.post("/labelingasync/inferenceops{opsId}/")
def getPredictAllAsync(response: Response, opsId, userId: str = Form(...), file: UploadFile = File(...), filename: str = Form(...),
                  modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):

    if filename.split('.')[-1].lower() not in ['csv']:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()
    response.status_code, result = predictClass.runAllAsync(modelid, file, filename, apptoken, userId, isForText=True, isForLabeling=True, opsId=opsId, modeltoken=modeltoken)
    return result

@router.post("/inferencemovieasync/inferenceops{opsId}/")
def getPredictMovieAsync(response: Response, opsId, userId: str = Form(...), file: UploadFile = File(...), filename: str = Form(...),
                    modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None),
                    marketProjectId: str = Form(None), isStandardMovie: bool = Form(None), sync_cut_at: float = Form(None)):
    if not modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    if filename.split('.')[-1].lower() not in utilClass.videoExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()
    response.status_code, result = manageUploadClass.runMovieAsync(modelid, file, filename, apptoken, userId,
                  opsId=opsId, modeltoken=modeltoken, marketProjectId=marketProjectId, isStandardMovie=isStandardMovie,
                                                              sync_cut_at=sync_cut_at)


    return result

@router.post("/inferenceallimage/inferenceops{opsId}/")
def getPredictAllImage(response: Response, opsId, userId: str = Form(...), file: UploadFile = File(...), filename: str = Form(...),
                       modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):
    # if not modelid:
    #     return 204

    file = file.file.read()
    if filename.split('.')[-1].lower() not in utilClass.imageExtensionName + utilClass.compressionExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    response.status_code, result = predictClass.runAll(modelid, file, filename, apptoken, userId, isForText=False, opsId=opsId, modeltoken=modeltoken)
    return result

class PredictWithURLObject(BaseModel):
    calllogid: str = None
    apptoken: str = None
    url: str

@router.post("/inference/developedAiModel/inferenceops{opsId}/")
def predictDevelopedAiModel(response: Response, opsId, apptoken: str = Form(None), modeltoken: str = Form(None), modelId: str = Form(...), textdata: str = Form(None), file : bytes = File(None)):
    """
    `추천시스템 예제` : {"grade_id":11, "school_id":10837, "type":"HS","school_jibun_address1":"서울 강남구 대치동 952-1", "subject":"영어", "channel": "강남"}
    """
    if textdata:
        if type(textdata) != str:
            textdata = textdata.extra
        else:
            textdata = json.loads(textdata)
    try:
        file = file.extra
    except:
        pass
    if not file and not textdata or (file and textdata):
        response.status_code = HTTP_422_UNPROCESSABLE_ENTITY
        return {
            "statusCode": 422,
            "error": "Invaild data",
            "message": "예측하고자 하는 데이터를 다시 확인해주십시오."
        }
    response.status_code, result = manageExternalAiClass.predictByDevelopedModel(apptoken, modelId, file, textdata, modeltoken=modeltoken)
    return result


@router.get("/ops-servers-status/")
def getOpsServerGroupsStatus(response: Response, opsProjectId: str, token: str):
    # if not modelid:

    response.status_code, result = manageOpsClass.getOpsServerGroupsStatusByOpsProjectId(token, opsProjectId)
    return result


@router.get("/ops-server-group-statistic/")
def getOpsServerGroupStatistic(response: Response, opsServerGroupId: str, instanceId: str, token: str):
    # if not modelid:

    response.status_code, result = manageOpsClass.getOpsServerGroupStatistic(token, opsServerGroupId, instanceId)
    return result

class OpsProjectObject(BaseModel):
    projectName: str = None
    modelId: str = None
    serverType: str = None
    region: str = None
    minServerSize: int = None
    maxServerSize: int = None
    startServerSize: int = None

@router.post("/opsprojects/")
def postOpsprojects(response: Response, ops_project_object: OpsProjectObject, token: str):
    # if not modelid:

    response.status_code, result = manageOpsClass.createOpsProject(token, ops_project_object)
    return result

@router.get("/opsprojects/")
def readProjects(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10, start: int = 0, desc: bool = False, searching: str = '', isshared: bool = False):
    response.status_code, result = manageOpsClass.getOpsProjectsById(token, sorting, start, count, tab, desc, searching, isshared)
    return result



@router.get("/opsprojects/{opsProjectId}/")
def getOpsproject(response: Response, opsProjectId, token: str):
    # if not modelid:

    response.status_code, result = manageOpsClass.getOpsProject(token, opsProjectId)
    return result

@router.get("/opsmodels/{opsModelId}/")
def getOpsmodel(response: Response, opsModelId, token: str):
    # if not modelid:

    response.status_code, result = manageOpsClass.getOpsModelById(token, opsModelId)
    return result

@router.put("/opsprojects/{opsProjectId}/")
def putOpsproject(response: Response, opsProjectId, token: str, ops_project_object: OpsProjectObject):
    # if not modelid:

    response.status_code, result = manageOpsClass.putOpsProject(token, opsProjectId, ops_project_object)
    return result

@router.delete("/opsprojects/")
async def deleteProjects(token: str, response: Response, projectId: List[str] = Form(...)):
    response.status_code, result = manageOpsClass.deleteOpsProjects(token, projectId)
    return result

@router.delete("/opsprojects/{opsProjectId}/")
def deleteOpsproject(response: Response, opsProjectId, token: str):
    # if not modelid:

    response.status_code, result = manageOpsClass.deleteOpsProject(token, opsProjectId)
    return result

class OpsServerGroupObject(BaseModel):
    serverType: str = None
    opsProjectId: int = None
    region: str = None
    timezone: str = None
    minServerSize: int = None
    maxServerSize: int = None
    startServerSize: int = None

@router.post("/opsservergroups/")
def addOpsServerGroup(response: Response, ops_server_object: OpsServerGroupObject, token: str):
    # if not modelid:

    response.status_code, result = manageOpsClass.createOpsServerGroup(token, ops_server_object)
    return result

@router.put("/opsservergroups/{opsServerGroupId}/")
def putOpsproject(response: Response, opsServerGroupId, token: str, ops_server_object: OpsServerGroupObject):
    # if not modelid:

    response.status_code, result = manageOpsClass.editOpsServerGroup(token, opsServerGroupId, ops_server_object)
    return result

@router.delete("/opsservergroups/{opsServerGroupId}/")
def shutdownOpsServerGroup(response: Response, opsServerGroupId: str, token: str):
    # if not modelid:

    response.status_code, result = manageOpsClass.removeOpsServerGroup(token,opsServerGroupId)
    return result


@router.get('/server-pricing/')
def get_server_pricing(response: Response, token: str):
    response.status_code, result = manageOpsClass.get_server_pricing(token)
    return result


class SellApiObject(BaseModel):
    api_type: str
    model_id: int
    api_price: int
    model_price: int
    chipset_price: int
    currency: str


@router.post("/sell-api/")
def sell_api(response: Response, token: str, sell_api_object: SellApiObject):
    response.status_code, result = manageOpsClass.sell_api(token, sell_api_object)
    return result
