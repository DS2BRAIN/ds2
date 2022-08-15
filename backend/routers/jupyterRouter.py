import json
from typing import List

from fastapi import APIRouter, UploadFile

from src.manageJupyter import ManageJupyter
from src.util import Util
from src.manageUser import ManageUser
from src.manageLabeling import ManageLabeling
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

manageExternalAiClass = ManageExternalAi()
manageJupyterClass = ManageJupyter()

@router.get("/jupyter-servers-status/")
def getJupyterServersStatus(response: Response, jupyterProjectId: str, token: str):
    # if not modelid:

    response.status_code, result = manageJupyterClass.getJupyterServersStatusByJupyterProjectId(token, jupyterProjectId)
    return result


@router.get("/jupyter-server-statistic/")
def getJupyterServerStatistic(response: Response, instanceId: str, token: str):
    # if not modelid:

    response.status_code, result = manageJupyterClass.getJupyterServerStatistic(token, instanceId)
    return result

class JupyterProjectObject(BaseModel):
    projectName: str = None
    region: str = None
    serverType: str = None
    port: int = None
    gpu: str = None

@router.post("/jupyterprojects/")
def postJupyterprojects(response: Response, jupyter_project_object: JupyterProjectObject, token: str):
    # if not modelid:

    response.status_code, result = manageJupyterClass.createJupyterProject(token, jupyter_project_object)
    return result

@router.get("/used-jupyter-port/")
def get_used_port(response: Response, token: str):

    response.status_code, result = manageJupyterClass.get_used_jupyter_port(token)
    return result

@router.get("/jupyterprojects/")
def readProjects(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10, start: int = 0, desc: bool = False, searching: str = '', isshared: bool = False):
    response.status_code, result = manageJupyterClass.getJupyterProjectsById(token, sorting, start, count, tab, desc, searching, isshared)
    return result


@router.get("/jupyterprojects/{jupyterProjectId}/")
def getJupyterproject(response: Response, jupyterProjectId: int, token: str):
    # if not modelid:

    response.status_code, result = manageJupyterClass.getJupyterProject(token, jupyterProjectId)
    return result

@router.put("/jupyterprojects/{jupyterProjectId}/")
def putJupyterproject(response: Response, jupyterProjectId, token: str, jupyter_project_object: JupyterProjectObject):
    # if not modelid:

    response.status_code, result = manageJupyterClass.putJupyterProject(token, jupyterProjectId, jupyter_project_object)
    return result


@router.delete("/jupyterprojects/")
def deleteProjects(token: str, response: Response, projectId: List[str] = Form(...)):
    response.status_code, result = manageJupyterClass.deleteJupyterProjects(token, projectId)
    return result

@router.delete("/jupyterprojects/{jupyterProjectId}/")
def deleteJupyterproject(response: Response, jupyterProjectId, token: str):
    # if not modelid:

    response.status_code, result = manageJupyterClass.deleteJupyterProject(token, jupyterProjectId)
    return result

class JupyterServerObject(BaseModel):
    serverType: str = None
    jupyterProjectId: int = None
    region: str = None
    timezone: str = None
    port: int = None

@router.post("/jupyterservers/")
def addJupyterServer(response: Response, jupyter_server_object: JupyterServerObject, token: str):
    # if not modelid:

    response.status_code, result = manageJupyterClass.createJupyterServer(token, jupyter_server_object)
    return result

@router.delete("/jupyterservers/{instanceId}/")
def shutdownJupyterServer(response: Response, instanceId, token: str):

    response.status_code, result = manageJupyterClass.removeJupyterServer(token,instanceId)
    return result

@router.post("/jupyterservers/{instanceId}/stop/")
def stopJupyterServer(response: Response, instanceId, token: str):

    response.status_code, result = manageJupyterClass.stopJupyterServer(token,instanceId)
    return result

@router.post("/jupyterservers/{instanceId}/resume/")
def resumeJupyterServer(response: Response, instanceId, token: str):

    response.status_code, result = manageJupyterClass.resumeJupyterServer(token,instanceId)
    return result

@router.post("/add-jupyter-job/")
def addJupyterJob(response: Response,token: str = Form(...), jupyter_server_id: str = Form(...), filename: str = Form(...), file:bytes = File(...)):
    """
    `anomalyDetection` : 15
    `faceRecognition` : 16
    `recommendationSystem (강남엄마)` : 17
    `recommendationSystem (예제용 - 영화추천)` : 18
    """
    response.status_code, result = manageJupyterClass.addJupyterJob(token, file, filename, jupyter_server_id)

    return result
