from typing import List
from fastapi import APIRouter, Form, Request, Depends
from fastapi.security import APIKeyHeader
from src.util import Util
from src.manageUser import ManageUser
from src.manageProject import ManageProject
from src.manageExternalAi import ManageExternalAi
from src.manageTask import ManageTask
from starlette.responses import Response
from pydantic import BaseModel
from models.helper import Helper
from src.errorResponseList import ErrorResponseList
from sse_starlette.sse import EventSourceResponse

dbClass = Helper(init=True)
router = APIRouter()
utilClass = Util()
manageUserClass = ManageUser()
manageProjectClass = ManageProject()
manageExternalAiClass = ManageExternalAi()
manageTask = ManageTask()
errorResponseList = ErrorResponseList()
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)

@router.post("/projects/data/{project_id}/{connector_id}/")
def download_project_data(response:Response, token: str, project_id: str, connector_id: str):
    response.status_code, result = manageProjectClass.download_data_by_connector_id(token, project_id, connector_id)
    return result

@router.get("/projects/")
def readProjects(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = '', isVerify: bool = False):
    response.status_code, result = manageProjectClass.getProjectsById(token, sorting, page, count, tab,
                                                                      desc, searching, isVerify)
    return result

@router.get("/projects/{projectId}/")
async def readProject(projectId: int, token: str, response: Response):
    response.status_code, result = manageProjectClass.getProjectById(token, projectId)
    return result

@router.get("/projects/{project_id}/status")
async def read_project_status(response: Response, token: str, project_id: str):
    response.status_code, result = manageProjectClass.get_project_status_by_id(token, project_id)
    return result

@router.get("/projectsasync/{projectId}/")
async def readProjectasync(projectId: str, token: str, response: Response):
    response.status_code, result = manageProjectClass.getProjectAsyncById(token, projectId)
    return result


class ProjectInfo(BaseModel):
    projectName: str = None
    description: str = None
    valueForPredict: str = None
    option: str = None
    csvupload: int = None
    fileStructure: str = None
    filePath: str = None
    status: int = None
    statusText: str = None
    originalFileName: str = None
    trainingMethod: str = None
    fileSize: int = None
    joinInfo: dict = None
    preprocessingInfo: dict = None
    preprocessingInfoValue: dict = None
    trainingColumnInfo: dict = None
    timeSeriesColumnInfo: dict = None
    valueForPredictColumnId: str = None
    valueForItemColumnId: int = None
    valueForUserColumnId: int = None
    analyticsStandard: str = None
    startTimeSeriesDatetime: str = None
    endTimeSeriesDatetime: str = None
    webhookURL: str = None
    webhookMethod: str = None
    isParameterCompressed: bool = None
    background: str = None
    resultJson: str = None
    priority_flag: bool = None
    instanceType: str = None
    algorithmType: str = None
    hyper_params: dict = {}
    algorithm: str = None
    models: list = None
    require_gpus: list = None
    require_gpus_total: dict = None

@router.put("/projects/{projectId}/")
async def updateProject(projectId: str, token: str, projectInfo: ProjectInfo, response: Response):
    response.status_code, result = manageProjectClass.putProject(token, projectInfo, projectId)

    return result

class StartTrainInfo(BaseModel):
    trainingMethod: str
    valueForPredict: str
    option: str
    trainingColumnInfo: dict = None
    joinInfo: dict = None
    preprocessingInfo: dict = None
    preprocessingInfoValue: dict = None
    hyper_params: dict = None
    algorithm: str = None

@router.post("/train/{projectId}/")
def getMagicCode(projectId: str, token: str, response: Response, startTrainInfo: StartTrainInfo):
    response.status_code, result = manageProjectClass.startTrain(token, startTrainInfo, projectId)
    return result

@router.delete("/projects/")
async def deleteProject(token: str, response: Response, projectId: List[str] = Form(...)):
    response.status_code, result = manageProjectClass.deleteProjects(token, projectId)
    return result

@router.delete("/projects/{projectId}/")
async def deleteProject(token: str, response: Response, projectId):
    response.status_code, result = manageProjectClass.deleteProject(token, projectId)
    return result

@router.get("/projectcategories/")
async def getProjectcategories(response: Response):
    response.status_code, result = manageProjectClass.getProjectCaegories()
    return result

@router.get("/templates/")
def getTemplates(response: Response):
    response.status_code, result = manageProjectClass.getTemplatesByTemplates()
    return result

@router.get("/templates/{templateCateogryName}/")
def getTemplate(templateCateogryName: str, response: Response):
    response.status_code, result = manageProjectClass.getTemplatesByTemplateCategoryName(templateCateogryName)
    return result

@router.get("/engineais/")
def getExternalais(token: str, response: Response):
    response.status_code, result = manageExternalAiClass.getEngineAis(token)
    return result

@router.get("/externalais/")
def getExternalais(token: str, response: Response):
    response.status_code, result = manageExternalAiClass.getExternalAis(token)
    return result

class ProjectFromLabellingObject(BaseModel):
    trainColumnInfo: dict = {}

# @router.post("/projectfromlabeling/{labelprojectId}/")
# def createProjectFromLabeling(response: Response, labelprojectId : int, token: str, createProjectObject: ProjectFromLabellingObject):
#
#     userId = dbClass.getId(token)
#
#     if not userId:
#         response.status_code, result = NOT_ALLOWED_TOKEN_ERROR
#         return result
#
#     response.status_code, result = manageUpload.ManageUpload().projectFromLabeling(token, labelprojectId, trainColumnInfo=createProjectObject.trainColumnInfo)
#
#     return result

@router.post("/predict/fillAutomaticData/{projectId}/")
def fillAutomaticData(response: Response, projectId: str, token: str):
    response.status_code, result = manageProjectClass.fillAutomaticdata(projectId, token)

    return result

@router.get('/sse/project-status/{project_id}/')
async def sse_model_info(request: Request, project_id: int, token: str):
    return EventSourceResponse(manageProjectClass.get_project_status(token, project_id, request))
