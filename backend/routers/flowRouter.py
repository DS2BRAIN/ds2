from typing import List
from fastapi import APIRouter, Form, Request, Depends
from fastapi.security import APIKeyHeader
from src.util import Util
from src.manageUser import ManageUser
from src.manageFlow import ManageFlow
from starlette.responses import Response
from pydantic import BaseModel
from models.helper import Helper
from src.errorResponseList import ErrorResponseList
from sse_starlette.sse import EventSourceResponse

dbClass = Helper(init=True)
router = APIRouter()
utilClass = Util()
manageUserClass = ManageUser()
manageFlowClass = ManageFlow()
errorResponseList = ErrorResponseList()
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)


class FlowData(BaseModel):
    flow_name: str = None
    flow_node_info: dict = None

@router.post("/flows/")
def createFlow(response: Response, flow_data: FlowData, token: str):
    response.status_code, result = manageFlowClass.createFlow(token, flow_data)

    return result

@router.get("/flows/")
def readFlows(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = '', isVerify: bool = False):
    response.status_code, result = manageFlowClass.getFlowsById(token, sorting, page, count, tab,
                                                                      desc, searching, isVerify)
    return result

@router.get("/flows/{flow_id}/")
async def readFlow(flow_id: int, token: str, response: Response):
    response.status_code, result = manageFlowClass.getFlowById(token, flow_id)
    return result

@router.get("/flows/{flow_id}/status")
async def read_flow_status(response: Response, token: str, flow_id: str):
    response.status_code, result = manageFlowClass.get_flow_status_by_id(token, flow_id)
    return result

@router.get("/flows-async/{flow_id}/")
async def readFlowasync(flow_id: str, token: str, response: Response):
    response.status_code, result = manageFlowClass.getFlowAsyncById(token, flow_id)
    return result

@router.put("/flows/{flow_id}/")
async def updateFlow(flow_id: str, token: str, flowInfo: FlowData, response: Response):
    response.status_code, result = manageFlowClass.putFlow(token, flowInfo, flow_id)

    return result

@router.delete("/flows/")
async def deleteFlow(token: str, response: Response, flow_id: List[str] = Form(...)):
    response.status_code, result = manageFlowClass.deleteFlows(token, flow_id)
    return result

@router.delete("/flows/{flow_id}/")
async def deleteFlow(token: str, response: Response, flow_id):
    response.status_code, result = manageFlowClass.deleteFlow(token, flow_id)
    return result

@router.get('/sse/flow-status/{flow_id}/')
async def sse_model_info(request: Request, flow_id: int, token: str):
    return EventSourceResponse(manageFlowClass.get_flow_status(token, flow_id, request))
