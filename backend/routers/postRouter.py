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

if os.path.exists("./src/creating/managePostReview.py"):
    from src.creating.managePost import ManagePost
    managePostClass = ManagePost()
else:
    managePostClass = None


class PostData(BaseModel):
    title: str = None
    url: str = None
    description: str = None
    categories: list = None
    tags: list = None
    related_post: str = None
    price: int = None
    file: bytes = None
    file_name: str = None

@router.post("/posts/")
def createPost(response: Response, token: str,
               file: UploadFile = File(None), title: str = Form(...),
               file_name: str = Form(None), url: str = Form(None),
               price: int = Form(None), tags: list = Form(None),
               description: int = Form(None), categories: list = Form(None),
               related_post: int = Form(None)
               ):
    post_data = PostData(
        title=title,
        url=url,
        description=description,
        categories=categories,
        tags=tags,
        related_post=related_post,
        price=price,
        file=file,
        file_name=file_name,
    )
    response.status_code, result = managePostClass.createPost(token, post_data)

    return result

@router.get("/all-posts/")
def readPosts(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = '', post_type = ''):
    response.status_code, result = managePostClass.getAllPosts(sorting, page, count, tab, desc, searching, post_type)
    return result

@router.get("/posts/")
def readPosts(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = '', post_type = ''):
    response.status_code, result = managePostClass.getPostsById(token, sorting, page, count, tab,
                                                                      desc, searching, post_type)
    return result

@router.get("/posts/{post_id}/")
async def readPost(post_id: int, token: str, response: Response):
    response.status_code, result = managePostClass.getPostById(token, post_id)
    return result

@router.put("/posts/{post_id}/")
async def updatePost(post_id: str, token: str, postInfo: PostData, response: Response):
    response.status_code, result = managePostClass.putPost(token, postInfo, post_id)

    return result

@router.delete("/posts/")
async def deletePost(token: str, response: Response, post_id: List[str] = Form(...)):
    response.status_code, result = managePostClass.deletePosts(token, post_id)
    return result

@router.delete("/posts/{post_id}/")
async def deletePost(token: str, response: Response, post_id):
    response.status_code, result = managePostClass.deletePost(token, post_id)
    return result

@router.post("/purchase/{post_id}/")
def purchase_license_by_eximbay(response: Response, post_id):

    response.status_code, result = managePostClass.buyPost(post_id)
    return result