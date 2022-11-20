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


if os.path.exists("./src/creating/managePostBookmark.py"):
    from src.creating.managePostBookmark import ManagePostBookmark
    managePostBookmarkClass = ManagePostBookmark()
else:
    managePostBookmarkClass = None

errorResponseList = ErrorResponseList()
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)


class PostBookmarkData(BaseModel):
    post_id: int

@router.post("/post-bookmarks/")
def createPostBookmark(response: Response, bookmark_data: PostBookmarkData, token: str):
    response.status_code, result = managePostBookmarkClass.createPostBookmark(token, bookmark_data)

    return result

@router.get("/post-bookmarks/")
def readPostBookmarks(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = ''):
    response.status_code, result = managePostBookmarkClass.getPostBookmarksById(token, sorting, page, count, tab,
                                                                      desc, searching)
    return result

@router.get("/post-bookmarks/{bookmark_id}/")
async def readPostBookmark(bookmark_id: int, token: str, response: Response):
    response.status_code, result = managePostBookmarkClass.getPostBookmarkById(token, bookmark_id)
    return result

@router.put("/post-bookmarks/{bookmark_id}/")
async def updatePostBookmark(bookmark_id: str, token: str, bookmarkInfo: PostBookmarkData, response: Response):
    response.status_code, result = managePostBookmarkClass.putPostBookmark(token, bookmarkInfo, bookmark_id)

    return result

@router.delete("/post-bookmarks/")
async def deletePostBookmark(token: str, response: Response, post_ids: List[int] = Form(...)):
    response.status_code, result = managePostBookmarkClass.deletePostBookmarks(token, post_ids)
    return result

@router.delete("/post-bookmarks/{post_id}/")
async def deletePostBookmark(token: str, response: Response, post_id):
    response.status_code, result = managePostBookmarkClass.deletePostBookmark(token, post_id)
    return result
