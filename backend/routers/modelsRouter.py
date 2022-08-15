from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, WebSocket, status, Cookie, Query, Depends, Request
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from starlette.background import BackgroundTasks

from src.util import Util
from src.manageUser import ManageUser
from src.manageProject import ManageProject
from src.manageModel import ManageModel
from src.manageExternalAi import ManageExternalAi
from src.manageTask import ManageTask
from starlette.responses import Response
from models.helper import Helper
from sse_starlette.sse import EventSourceResponse
import time

dbClass = Helper(init=True)
router = APIRouter()
utilClass = Util()
manageUserClass = ManageUser()
manageModelClass = ManageModel()
manageProjectClass = ManageProject()
manage_external_ai_class = ManageExternalAi()
manageTask = ManageTask()
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)

class FavoriteModelInfo(BaseModel):
    isFavorite: bool

@router.put("/models/favorite/{modelId}/")
async def updateFavoriteModel(modelId: str, token: str, favoriteModelInfo: FavoriteModelInfo, response: Response):
    response.status_code, result = manageModelClass.updateFavoriteModel(token, modelId, favoriteModelInfo.isFavorite)
    return result

# @router.post("/externalais/addkey/")
# def registerExternalAisKey(response: Response, token: str, modelName: str = Form(...), key: str = Form(...), isShareProvider : bool = Form(...), additionalKey : str = Form(None), accessfile : bytes = File(None)):
#     response.status_code, result = manageUserClass.registerExternalAisKey(token, modelName, key, isShareProvider, additionalKey, accessfile)
#     return result

@router.get("/models/favorite/")
async def getFavoriteModel(token: str, response: Response):
    response.status_code, result = manageModelClass.getFavoriteModels(token)
    return result

@router.get("/models/{modelId}/")
async def readModel(modelId: str, token: str, response: Response):
    response.status_code, result = manageProjectClass.getModelById(token, modelId)
    return result

@router.get("/models/{model_id}/metabase/")
async def create_metabase(background_tasks: BackgroundTasks, token: str, model_id: int):
    status_code = manage_external_ai_class.create_metabase(background_tasks=background_tasks, token=token, source_type='model', source_id=model_id)
    return Response(status_code=status_code)

@router.get("/models/instant-use/{modelId}/")
async def getInstantUseModel(modelId: int, modeltoken: str, response: Response):
    response.status_code, result = manageProjectClass.getModelByIdAndModelToken(modeltoken, modelId)
    return result

@router.get("/models/skyhub-app/{opsId}/")
async def getInstantUseOps(opsId: str, modeltoken: str, response: Response):
    response.status_code, result = manageProjectClass.getOpsModelByOpsIdAndModelToken(modeltoken, opsId)
    return result

@router.post("/projectswithmodelfile/")
async def postProjectWithModelFile(token: str, response: Response, filename: str = Form(...), file: UploadFile = File(...)):
    file = file.file.read()
    response.status_code, result = manageProjectClass.createProjectWithModelFile(token, file, filename)
    return result

async def get_cookie_or_token(
    websocket: WebSocket,
    session: Optional[str] = Cookie(None),
    token: Optional[str] = Query(None)
):
    if session is None and token is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    return session or token

@router.get('/sse/model-info/{project_id}/')
async def sse_model_info(request: Request, project_id: int, token: str):
    return EventSourceResponse(manageModelClass.get_model_info(project_id, request, token))