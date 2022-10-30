from typing import List
from fastapi import APIRouter, Form
from fastapi.security import APIKeyHeader
from src.util import Util
from src.manageUser import ManageUser
from starlette.responses import Response
from pydantic import BaseModel
from models.helper import Helper
from src.errorResponseList import ErrorResponseList
import os

dbClass = Helper(init=True)
router = APIRouter()
utilClass = Util()
manageUserClass = ManageUser()


if os.path.exists("./src/creating/manageCommandCollection.py"):
    from src.creating.manageCommandCollection import ManageCommandCollection
    manageCommandCollectionClass = ManageCommandCollection()
else:
    manageCommandCollectionClass = None

errorResponseList = ErrorResponseList()
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)


class CommandCollectionData(BaseModel):
    command_id: int

@router.post("/command-collections/")
def createCommandCollection(response: Response, collection_data: CommandCollectionData, token: str):
    response.status_code, result = manageCommandCollectionClass.createCommandCollection(token, collection_data)

    return result

@router.get("/command-collections/")
def readCommandCollections(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = ''):
    response.status_code, result = manageCommandCollectionClass.getCommandCollectionsById(token, sorting, page, count, tab,
                                                                      desc, searching)
    return result

@router.get("/command-collections/{collection_id}/")
async def readCommandCollection(collection_id: int, token: str, response: Response):
    response.status_code, result = manageCommandCollectionClass.getCommandCollectionById(token, collection_id)
    return result

@router.put("/command-collections/{collection_id}/")
async def updateCommandCollection(collection_id: str, token: str, collectionInfo: CommandCollectionData, response: Response):
    response.status_code, result = manageCommandCollectionClass.putCommandCollection(token, collectionInfo, collection_id)

    return result

@router.delete("/command-collections/")
async def deleteCommandCollection(token: str, response: Response, command_ids: List[int] = Form(...)):
    response.status_code, result = manageCommandCollectionClass.deleteCommandCollections(token, command_ids)
    return result

@router.delete("/command-collections/{command_id}/")
async def deleteCommandCollection(token: str, response: Response, command_id):
    response.status_code, result = manageCommandCollectionClass.deleteCommandCollection(token, command_id)
    return result
