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

if os.path.exists("./src/creating/managePostComment.py"):
    from src.creating.managePostComment import ManagePostComment
    managePostCommentClass = ManagePostComment()
else:
    managePostCommentClass = None

errorResponseList = ErrorResponseList()
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)


class PostCommentData(BaseModel):
    post_id: int = None
    rating: int = None
    comment: str = None

@router.post("/post-comments/")
def createPostComment(response: Response, comment_data: PostCommentData, token: str):
    response.status_code, result = managePostCommentClass.createPostComment(token, comment_data)

    return result

@router.get("/post-comments/")
def readPostComments(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = ''):
    response.status_code, result = managePostCommentClass.getPostCommentsById(token, sorting, page, count, tab,
                                                                      desc, searching)
    return result

@router.get("/post-comments/{comment_id}/")
async def readPostComment(comment_id: int, token: str, response: Response):
    response.status_code, result = managePostCommentClass.getPostCommentById(token, comment_id)
    return result

@router.put("/post-comments/{comment_id}/")
async def updatePostComment(comment_id: str, token: str, commentInfo: PostCommentData, response: Response):
    response.status_code, result = managePostCommentClass.putPostComment(token, commentInfo, comment_id)

    return result

@router.delete("/post-comments/")
async def deletePostComment(token: str, response: Response, comment_id: List[str] = Form(...)):
    response.status_code, result = managePostCommentClass.deletePostComments(token, comment_id)
    return result

@router.delete("/post-comments/{comment_id}/")
async def deletePostComment(token: str, response: Response, comment_id):
    response.status_code, result = managePostCommentClass.deletePostComment(token, comment_id)
    return result

@router.get("/comments/posts/{post_id}/")
async def readPostComment(post_id: int, token: str, response: Response):
    response.status_code, result = managePostCommentClass.getPostCommentsByPostId(token, post_id)
    return result
