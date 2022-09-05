from typing import List
from fastapi import APIRouter, Form, Request, Depends
from fastapi.security import APIKeyHeader
from src.util import Util
from src.manageUser import ManageUser
from src.manageFlowNode import ManageFlowNode
from starlette.responses import Response
from pydantic import BaseModel
from models.helper import Helper
from src.errorResponseList import ErrorResponseList
from sse_starlette.sse import EventSourceResponse

dbClass = Helper(init=True)
router = APIRouter()
utilClass = Util()
manageUserClass = ManageUser()
manageFlowNodeClass = ManageFlowNode()
errorResponseList = ErrorResponseList()
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)

class FlowNodeData(BaseModel):
    flow_node_name: str = None
    flow_node_info: dict = None
    flow_id: int

@router.post("/flow-nodes/")
def createFlow(response: Response, flow_node_data: FlowNodeData, token: str):
    response.status_code, result = manageFlowNodeClass.createFlowNode(token, flow_node_data)

    return result

@router.get("/flow-nodes/")
def readFlowNodes(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = '', isVerify: bool = False):
    response.status_code, result = manageFlowNodeClass.getFlowNodesById(token, sorting, page, count, tab,
                                                                      desc, searching, isVerify)
    return result

@router.get("/flow-nodes/{flow_node_id}/")
async def readFlowNode(flow_node_id: int, token: str, response: Response):
    response.status_code, result = manageFlowNodeClass.getFlowNodeById(token, flow_node_id)
    return result

@router.get("/flow-nodes/{flow_node_id}/status")
async def read_flow_node_status(response: Response, token: str, flow_node_id: str):
    response.status_code, result = manageFlowNodeClass.get_flow_node_status_by_id(token, flow_node_id)
    return result

@router.get("/flow-nodes-async/{flow_node_id}/")
async def readFlowNodeasync(flow_node_id: str, token: str, response: Response):
    response.status_code, result = manageFlowNodeClass.getFlowNodeAsyncById(token, flow_node_id)
    return result

@router.put("/flow-nodes/{flow_node_id}/")
async def updateFlowNode(flow_node_id: str, token: str, flow_nodeInfo: FlowNodeData, response: Response):
    response.status_code, result = manageFlowNodeClass.putFlowNode(token, flow_nodeInfo, flow_node_id)

    return result

@router.delete("/flow-nodes/")
async def deleteFlowNode(token: str, response: Response, flow_node_id: List[str] = Form(...)):
    response.status_code, result = manageFlowNodeClass.deleteFlowNodes(token, flow_node_id)
    return result

@router.delete("/flow-nodes/{flow_node_id}/")
async def deleteFlowNode(token: str, response: Response, flow_node_id):
    response.status_code, result = manageFlowNodeClass.deleteFlowNode(token, flow_node_id)
    return result

@router.get('/sse/flow-node-status/{flow_node_id}/')
async def sse_model_info(request: Request, flow_node_id: int, token: str):
    return EventSourceResponse(manageFlowNodeClass.get_flow_node_status(token, flow_node_id, request))
