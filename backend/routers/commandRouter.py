from typing import List
from fastapi import APIRouter, Form, Request, Depends
from fastapi.security import APIKeyHeader
from src.util import Util
from src.manageUser import ManageUser
from src.manageCommand import ManageCommand
from starlette.responses import Response
from pydantic import BaseModel
from models.helper import Helper
from src.errorResponseList import ErrorResponseList
from sse_starlette.sse import EventSourceResponse

dbClass = Helper(init=True)
router = APIRouter()
utilClass = Util()
manageUserClass = ManageUser()
manageCommandClass = ManageCommand()
errorResponseList = ErrorResponseList()
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)


class CommandData(BaseModel):
    command: str = None
    url: str = None
    short_description: str = None
    description: str = None
    category: str = None
    is_private: bool = None

@router.post("/commands/")
def createCommand(response: Response, command_data: CommandData, token: str):
    response.status_code, result = manageCommandClass.createCommand(token, command_data)

    return result

@router.get("/commands/")
def readCommands(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = '', isVerify: bool = False):
    response.status_code, result = manageCommandClass.getCommandsById(token, sorting, page, count, tab,
                                                                      desc, searching, isVerify)
    return result

@router.get("/commands/{command_id}/")
async def readCommand(command_id: int, token: str, response: Response):
    response.status_code, result = manageCommandClass.getCommandById(token, command_id)
    return result

@router.get("/commands/{command_id}/status")
async def read_command_status(response: Response, token: str, command_id: str):
    response.status_code, result = manageCommandClass.get_command_status_by_id(token, command_id)
    return result

@router.get("/commands-async/{command_id}/")
async def readCommandasync(command_id: str, token: str, response: Response):
    response.status_code, result = manageCommandClass.getCommandAsyncById(token, command_id)
    return result

@router.put("/commands/{command_id}/")
async def updateCommand(command_id: str, token: str, commandInfo: CommandData, response: Response):
    response.status_code, result = manageCommandClass.putCommand(token, commandInfo, command_id)

    return result

@router.delete("/commands/")
async def deleteCommand(token: str, response: Response, command_id: List[str] = Form(...)):
    response.status_code, result = manageCommandClass.deleteCommands(token, command_id)
    return result

@router.delete("/commands/{command_id}/")
async def deleteCommand(token: str, response: Response, command_id):
    response.status_code, result = manageCommandClass.deleteCommand(token, command_id)
    return result

@router.get('/sse/command-status/{command_id}/')
async def sse_command_info(request: Request, command_id: int, token: str):
    return EventSourceResponse(manageCommandClass.get_command_status(token, command_id, request))

@router.get("/commands/instant-use/{command_id}/")
async def getInstantUsecommand(command_id: int, command_token: str, response: Response):
    response.status_code, result = manageCommandClass.get_command_by_token_and_id(command_token, command_id)
    return result

@router.post("/run-command/{command_id}/")
async def runCommand(command_id: int, command_token: str, response: Response):
    response.status_code, result = manageCommandClass.run_command(command_token, command_id)
    return result
