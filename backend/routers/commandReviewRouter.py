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

if os.path.exists("./src/creating/manageCommandReview.py"):
    from src.creating.manageCommandReview import ManageCommandReview
    manageCommandReviewClass = ManageCommandReview()
else:
    manageCommandReviewClass = None

errorResponseList = ErrorResponseList()
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)


class CommandReviewData(BaseModel):
    command_id: int = None
    rating: int
    review: str = None
    is_checked_positive_ease_of_use: bool = None
    is_checked_positive_great_customer_support: bool = None
    is_checked_positive_strong_feature_set: bool = None
    is_checked_positive_cost_effective: bool = None
    is_checked_positive_strong_community: bool = None
    is_checked_positive_positive_company_mission: bool = None
    is_checked_positive_clear_benefits: bool = None
    is_checked_negative_ease_of_use: bool = None
    is_checked_negative_great_customer_support: bool = None
    is_checked_negative_strong_feature_set: bool = None
    is_checked_negative_cost_effective: bool = None
    is_checked_negative_strong_community: bool = None
    is_checked_negative_positive_company_mission: bool = None
    is_checked_negative_clear_benefits: bool = None

@router.post("/command-reviews/")
def createCommandReview(response: Response, collection_data: CommandReviewData, token: str):
    response.status_code, result = manageCommandReviewClass.createCommandReview(token, collection_data)

    return result

@router.get("/command-reviews/")
def readCommandReviews(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = ''):
    response.status_code, result = manageCommandReviewClass.getCommandReviewsById(token, sorting, page, count, tab,
                                                                      desc, searching)
    return result

@router.get("/command-reviews/{collection_id}/")
async def readCommandReview(collection_id: int, token: str, response: Response):
    response.status_code, result = manageCommandReviewClass.getCommandReviewById(token, collection_id)
    return result

@router.put("/command-reviews/{collection_id}/")
async def updateCommandReview(collection_id: str, token: str, collectionInfo: CommandReviewData, response: Response):
    response.status_code, result = manageCommandReviewClass.putCommandReview(token, collectionInfo, collection_id)

    return result

@router.delete("/command-reviews/")
async def deleteCommandReview(token: str, response: Response, collection_id: List[str] = Form(...)):
    response.status_code, result = manageCommandReviewClass.deleteCommandReviews(token, collection_id)
    return result

@router.delete("/command-reviews/{collection_id}/")
async def deleteCommandReview(token: str, response: Response, collection_id):
    response.status_code, result = manageCommandReviewClass.deleteCommandReview(token, collection_id)
    return result
