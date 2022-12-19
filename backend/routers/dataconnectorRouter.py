import ast
from typing import List

from fastapi import APIRouter, Form, File, UploadFile, BackgroundTasks, Request
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE, HTTP_422_UNPROCESSABLE_ENTITY
from sse_starlette.sse import EventSourceResponse

from routers.fileRouter import trainingByColabClass
from routers.labelRouter import manageLabelingClass, AutoLabelRequestModel
from routers.modelsRouter import manage_external_ai_class
from routers.opsRouter import manageOpsClass, OpsProjectObject
from routers.projectsRouter import manageProjectClass, ProjectInfo
from src import manageUpload
from src.manageExternalAi import ManageExternalAi
from src.util import Util
from starlette.responses import Response
from pydantic import BaseModel
from src.manageFile import ManageFile
from src.manageTask import ManageTask
from src.errorResponseList import ErrorResponseList, EXTENSION_NAME_ERROR, WRONG_COCODATA_ERROR, UPLOAD_FILE_ERROR
from src.manageLabeling import ManageLabeling

errorResponseList = ErrorResponseList()
router = APIRouter()
utilClass = Util()
manageFileClass = ManageFile()
manageTaskClass = ManageTask()
manageLabeling = ManageLabeling()
manage_api = ManageExternalAi()


@router.get("/dataconnectortypes/")
def readDataconnectortype(token: str, response: Response):
    response.status_code, result = manageFileClass.getDataconnectortypes(token)
    return result

@router.get("/dataconnectors/")
def read_data_connectors(token: str, response: Response, sorting: str = 'created_at',  count: int = 10, start: int = 0, desc : bool = False, searching : str = '', is_public : bool = False):
    response.status_code, result = manageFileClass.get_dataconnectors(token, sorting, count, start, desc, searching, is_public)
    return result

@router.get("/dataconnector/{dataconnector_id}/")
def read_dataconnector_detail(dataconnector_id: int, token: str, response: Response):
    response.status_code, result = manageFileClass.getDataconnector(token, dataconnector_id)
    return result

@router.get("/dataconnector/{dataconnector_id}/metabase/")
async def create_dataconnector_metabase(dataconnector_id: int, token: str, background_tasks: BackgroundTasks):
    status_code = manage_external_ai_class.create_metabase(background_tasks=background_tasks, token=token, source_type='dataconnector', source_id=dataconnector_id)
    return Response(status_code=status_code)

# @router.get("/dataconnector/{dataconnector_id}/sse/")
# async def sse_model_info(request: Request, token: str, dataconnector_id: int):
#     return EventSourceResponse(manageFileClass.get_dataconnector_sse(request, token, dataconnector_id))


@router.get("/sse/dataconnector/")
async def sse_dataconnectors(request: Request, token: str, sorting: str = 'created_at',  count: int = 10, start: int = 0, desc : bool = False, searching : str = '', is_public : bool = False):
    return EventSourceResponse(manageFileClass.get_dataconnector_list(token, sorting, desc, searching, start, count, is_public, request))

class DataconnectorInfo(BaseModel):
    dataconnectorName: str = None
    dataconnectorInfo: dict = None
    dataconnectortype: int = None
    dataconnectortypeName: str = None
    user: int = None
    sthreefile: int = None
    folder: int = None
    dataset: int = None
    apiKey: str = None
    dbHost: str = None
    dbId: str = None
    dbPassword: str = None
    dbSchema: str = None
    dbTable: str = None
    keyFileInfo: dict = None
    file: str = None

@router.post("/dataconnectors/")
def createDataconnector(dataconnectorInfo: DataconnectorInfo, token: str, response: Response):
    response.status_code, result = manageFileClass.createDataconnector(token, dataconnectorInfo)
    return result


@router.post("/dataconnectorswithauthfile/")
def createDataconnectorWithauthFile(response: Response, token: str, file: UploadFile = File(...),  filename: str = Form(...),
                                   dataconnectorName: str = Form(...),
                                   dataconnectortype: str = Form(...),
                                   dataconnectortypeName: str = Form(...),
                                   profileId: str = Form(None)):

    file = file.file.read()

    if filename.split('.')[-1].lower() not in ['json']:
        response.status_code, result = WRONG_COCODATA_ERROR
        return result

    if not file:
        response.status_code, result = UPLOAD_FILE_ERROR
        return result

    # response.code, result = manageTaskClass.getDataconnectorCntByUser(token)
    # if response.code != 200:
    #     return response.code, result

    fileInfo = ast.literal_eval(file.decode())

    dataconnectorInfo = DataconnectorInfo()
    dataconnectorInfo.dataconnectorName = dataconnectorName
    dataconnectorInfo.dataconnectortype = dataconnectortype
    dataconnectorInfo.dataconnectortypeName = dataconnectortypeName
    dataconnectorInfo.keyFileInfo = {
        'file': fileInfo,
        'profileId': profileId,
    }

    response.status_code, result = manageFileClass.createDataconnector(token, dataconnectorInfo)
    return result

@router.post("/dataconnectorswithfile/")
def createDataconnectorWithFile(response: Response, background_tasks: BackgroundTasks, token: str = Form(...), dataconnectorName: str = Form(...),
                                   dataconnectortype: str = Form(None), file: UploadFile = File(...),
                                   filename: str = Form(...), frame_value: int = Form(None), hasLabelData: bool = Form(False), predictColumnName:str = Form(None), has_de_identification: bool = Form(False)):

    file = file.file.read()
    if not file:
        response.status_code, result = UPLOAD_FILE_ERROR
        return result

    response.status_code, result = manageUpload.ManageUpload().uploadFile(background_tasks, token, file, filename, frame_value, hasLabelData, predictColumnName,
                                     dataconnectorName=dataconnectorName, dataconnectortype=dataconnectortype, has_de_identification=has_de_identification)
    return result

@router.post("/upload-public-data/")
def upload_pulbic_data(response: Response, background_tasks: BackgroundTasks, key: str = Form(...), passwd: str = Form(...),
                       file: UploadFile = File(...), filename: str = Form(...),
                       hasLabelData: bool = Form(False),
                       description: str = Form(None),
                       reference: str = Form(None), referenceUrl: str = Form(None),
                       dataLicense: str = Form(None), dataLicenseUrl: str = Form(None), sampleImageUrl: str = Form(None)):

    file = file.file.read()

    if not file:
        response.status_code, result = UPLOAD_FILE_ERROR
        return result

    response.status_code, result = manageUpload.ManageUpload().upload_pulbic_data(background_tasks, key, passwd, file, filename, hasLabelData,
                                                                                  description, reference, referenceUrl, dataLicense, dataLicenseUrl, sampleImageUrl)
    return result

class RouteObject(BaseModel):
    route: str
    dataconnectorName: str = None
    dataconnectortype: int = None

@router.post("/dataconnectorsfromroute/")
def createDataconnectorFromRoute(response: Response, routeObject: RouteObject, token: str):

    response.status_code, result = manageUpload.ManageUpload().runFromRoute(token, routeObject.route,
                                     dataconnectorName=routeObject.dataconnectorName,
                                    dataconnectortype=routeObject.dataconnectortype)

    return result

class FileObject(BaseModel):
    fileId: int
    dataconnectorName: str = None
    dataconnectortype: int = None

# @router.post("/dataconnectorsfrompath/")
# def createDataconnectorFromPath(response: Response, fileObject: FileObject, token: str):
#
#     response.status_code, result = manageUpload.ManageUpload().runFromPath(token, fileObject.fileId,
#                                      dataconnectorName=fileObject.dataconnectorName,
#                                    dataconnectortype=fileObject.dataconnectortype)
#
#     return result

class FoldersObject(BaseModel):
    labelFolders: list
    dataconnectorName: str = None
    dataconnectortype: int = None

# @router.post("/dataconnectorsfrompathforimage/")
# def createDataconnectorFromPathImage(response: Response, foldersObject: FoldersObject, token: str):
#
#     response.status_code, result = manageUpload.ManageUpload().runFromPathImage(token, foldersObject.labelFolders,
#                                      dataconnectorName=foldersObject.dataconnectorName,
#                                     dataconnectortype=foldersObject.dataconnectortype)
#
#     return result

class RouteObjectForImage(BaseModel):
    folder: str
    labelFolders: list
    dataconnectorName: str = None
    dataconnectortype: int = None

@router.post("/dataconnectorsfromrouteforimage/")
def createDataconnectorFromRouteForImage(response: Response, routeObject: RouteObjectForImage, token: str):

    response.status_code, result = manageUpload.ManageUpload().runFromRouteImage(token, routeObject.folder, routeObject.labelFolders,
                                     dataconnectorName=routeObject.dataconnectorName,
                                     dataconnectortype=routeObject.dataconnectortype)

    return result

@router.put("/dataconnectors/{dataconnectorId}/")
def updateDataconnector(dataconnectorInfo: DataconnectorInfo, dataconnectorId: str, token: str, response: Response):
    response.status_code, result = manageFileClass.putDataconnector(token, dataconnectorId, dataconnectorInfo)
    return result

@router.delete("/dataconnectors/")
def deleteDataconnectors(token: str, response: Response, dataconnectorId: List[str] = Form(...)):
    response.status_code, result = manageFileClass.deleteDataconnectors(token, dataconnectorId)
    return result

@router.delete("/dataconnectors/{dataconnectorId}/")
def deleteDataconnector(token: str, response: Response, dataconnectorId):
    response.status_code, result = manageFileClass.deleteDataconnector(token, dataconnectorId)
    return result


class DataconnectorsList(BaseModel):
    dataconnectors: list
    repeatAmpm: str = None
    repeatHour: str = None
    repeatDays: str = None
    trainingMethod: str = None
    startTimeseriesDatetime: str = None
    endTimeseriesDatetime: str = None
    analyticsStandard: str = None
    timeseriesColumnInfo: dict = None
    isVerify: bool = False

@router.post("/projectfromdataconnectors/")
def createProjectFromDataconnectors(response: Response, dataconnectorsList: DataconnectorsList, token: str):
    response.status_code, result = manageFileClass.createProjectFromDataconnectors(token, dataconnectorsList)

    return result

class CollectDataRequestObject(BaseModel):
    data: dict

@router.post("/collect-jsondata/{dataconnector_id}/")
def create_json_data_collector(response:Response, dataconnector_id: int, token: str, collect_data_request_object:CollectDataRequestObject):

    response.status_code, result = manageUpload.ManageUpload().collect_api(token, dataconnector_id, data=collect_data_request_object.data)

    return result

@router.post("/collect-filedata/{dataconnector_id}/")
def create_file_collector(response:Response, dataconnector_id: int, token: str, file: UploadFile = File(...)):

    response.status_code, result = manageUpload.ManageUpload().collect_api(token, dataconnector_id, file=file)

    return result

class CreateLabelprojectRequestObject(BaseModel):
    dataconnectors: List[int]
    workapp: str
    name: str
    description: str = None

@router.post("/labelproject-from-dataconnectors/")
def create_labelproject_from_dataconnectors(response:Response, background_tasks: BackgroundTasks, token: str, create_labelproject_request_object:CreateLabelprojectRequestObject):

    response.status_code, result = manageLabeling.create_labelproject_from_dataconnectors(token, create_labelproject_request_object, background_tasks)

    return result

class StartTrainInfo(BaseModel):
    dataconnector: int
    trainingMethod: str
    valueForPredict: str
    option: str
    trainingColumnInfo: dict = None
    joinInfo: dict = None
    preprocessingInfo: dict = None
    preprocessingInfoValue: dict = None
    frameValue: int = None
    isVerify: bool = False
    hyper_params: dict = None
    algorithm: str = None

@router.post("/train-from-data/")
def trainFromData(response: Response, token: str, startTrainInfo: StartTrainInfo):
    datalist = DataconnectorsList(dataconnectors=[startTrainInfo.dataconnector])
    response.status_code, result2 = manageFileClass.createProjectFromDataconnectors(token, datalist)
    response.status_code, result = manageProjectClass.startTrain(token, startTrainInfo, result2['id'])

    return result

@router.post("/deploy-model-file/")
async def deployModelFile(token: str, response: Response, filename: str = Form(...), file: UploadFile = File(...),
                          projectName= Form(...), serverType = Form(...), region = Form(...)):

    file = file.file.read()

    response.status_code, result = manageProjectClass.createProjectWithModelFile(token, file, filename)

    ops_project_object = OpsProjectObject(projectName=projectName, modelId=result['model']['id'],
                                          serverType=serverType, region=region,
                                          minServerSize=1, maxServerSize=1, startServerSize=1
                                          )

    response.status_code, result = manageOpsClass.createOpsProject(token, ops_project_object)

    return result


class DeployModelFile(BaseModel):
    dataconnector: int = None
    project: int = None
    trainingMethod: str
    valueForPredict: str
    option: str = None
    trainingColumnInfo: dict = None
    joinInfo: dict = None
    preprocessingInfo: dict = None
    preprocessingInfoValue: dict = None
    isVerify: bool = False
    hyper_params: dict = None
    algorithm: str = None

@router.post("/get-magic-code/")
def getMagicCode(token: str, response: Response, deployModelFile: DeployModelFile):

    if not deployModelFile.project:
        datalist = DataconnectorsList(dataconnectors=[deployModelFile.dataconnector])
        response.status_code, result2 = manageFileClass.createProjectFromDataconnectors(token, datalist)
        deployModelFile.project = result2['id']
    deployModelFile.option = 'colab'
    response.status_code, result3 = manageProjectClass.startTrain(token, deployModelFile, deployModelFile.project)
    response.status_code, result4 = trainingByColabClass.trainModelByColab(token, deployModelFile.project)

    return result4

class AutoLabelRequestModel(BaseModel):
    dataconnectors: List
    autolabeling_ai_type: str
    labelproject_id: int
    autolabeling_amount: int
    preprocessing_ai_type: dict = {}
    autolabeling_type: str = None
    model_id: int = None
    custom_ai_stage: int = 0
    general_ai_type: str = None
    workapp: str = None
    name: str = None
    description: str = None
    inference_ai_type: str = None
    labeling_class: List[str] = None
    labelproject_id: int = None

@router.post("/start-auto-labeling/")
def startAutoLabeling(response: Response, background_tasks: BackgroundTasks, token: str, autoLabelRequestModel: AutoLabelRequestModel):

    response.status_code, result2 = manageLabeling.create_labelproject_from_dataconnectors(token,
                                                                                  autoLabelRequestModel,
                                                                                  background_tasks)

    autoLabelRequestModel.labelproject_id = result2['id']

    response.status_code, result = manageLabelingClass.autolabeling(token, autoLabelRequestModel)

    return result
