from typing import List
from fastapi import APIRouter, Form, Request, UploadFile, File
from fastapi.security import APIKeyHeader
from src.util import Util
from src.manageUser import ManageUser
from starlette.responses import Response
from pydantic import BaseModel
from models.helper import Helper
from src.errorResponseList import ErrorResponseList
from sse_starlette.sse import EventSourceResponse
import os

dbClass = Helper(init=True)
router = APIRouter()
utilClass = Util()
manageUserClass = ManageUser()
errorResponseList = ErrorResponseList()
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)

if os.path.exists("./src/creating/manageContest.py"):
    from src.creating.manageContest import ManageContest
    manageContestClass = ManageContest()
else:
    manageContestClass = None

@router.get("/all-contests/")
def readContests(response: Response, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = '', contest_type = '', item_type = ''):
    response.status_code, result = manageContestClass.getAllContests(sorting, page, count, tab, desc, searching, contest_type, item_type)
    return result

@router.get("/contests/{contest_id}/")
async def readContest(contest_id: int, response: Response, token: str = None):
    response.status_code, result = manageContestClass.getContestById(token, contest_id)
    return result

@router.post("/watch/contests/{contest_id}/")
async def updateCommand(contest_id: str, response: Response):
    response.status_code, result = manageContestClass.watchContest(contest_id)

    return result