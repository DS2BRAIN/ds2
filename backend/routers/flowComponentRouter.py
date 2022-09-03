from typing import List
from fastapi import APIRouter, Form, Request, Depends
from fastapi.security import APIKeyHeader
from src.util import Util
from src.manageUser import ManageUser
from src.manageFlowComponent import ManageFlowComponent
from starlette.responses import Response
from pydantic import BaseModel
from models.helper import Helper
from src.errorResponseList import ErrorResponseList
from sse_starlette.sse import EventSourceResponse

dbClass = Helper(init=True)
router = APIRouter()
utilClass = Util()
manageUserClass = ManageUser()
manageFlowComponentClass = ManageFlowComponent()
errorResponseList = ErrorResponseList()
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)

@router.get("/flow-components/")
def readFlowComponents(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = '', isVerify: bool = False):
    response.status_code, result = manageFlowComponentClass.getFlowComponentsById(token, sorting, page, count, tab,
                                                                      desc, searching, isVerify)
    return result

@router.get("/flow-components/{flow_component_id}/")
async def readFlowComponent(flow_component_id: int, token: str, response: Response):
    response.status_code, result = manageFlowComponentClass.getFlowComponentById(token, flow_component_id)
    return result

@router.get("/flow-components/{flow_component_id}/status")
async def read_flow_component_status(response: Response, token: str, flow_component_id: str):
    response.status_code, result = manageFlowComponentClass.get_flow_component_status_by_id(token, flow_component_id)
    return result

@router.get("/flow-componentsasync/{flow_component_id}/")
async def readFlowComponentasync(flow_component_id: str, token: str, response: Response):
    response.status_code, result = manageFlowComponentClass.getFlowComponentAsyncById(token, flow_component_id)
    return result

class FlowComponentInfo(BaseModel):
    flow_component_name: str = None
    flow_component_info: dict = None

@router.put("/flow-components/{flow_component_id}/")
async def updateFlowComponent(flow_component_id: str, token: str, flow_componentInfo: FlowComponentInfo, response: Response):
    response.status_code, result = manageFlowComponentClass.putFlowComponent(token, flow_componentInfo, flow_component_id)

    return result

@router.delete("/flow-components/")
async def deleteFlowComponent(token: str, response: Response, flow_component_id: List[str] = Form(...)):
    response.status_code, result = manageFlowComponentClass.deleteFlowComponents(token, flow_component_id)
    return result

@router.delete("/flow-components/{flow_component_id}/")
async def deleteFlowComponent(token: str, response: Response, flow_component_id):
    response.status_code, result = manageFlowComponentClass.deleteFlowComponent(token, flow_component_id)
    return result

@router.get('/sse/flow-component-status/{flow_component_id}/')
async def sse_model_info(request: Request, flow_component_id: int, token: str):
    return EventSourceResponse(manageFlowComponentClass.get_flow_component_status(token, flow_component_id, request))
