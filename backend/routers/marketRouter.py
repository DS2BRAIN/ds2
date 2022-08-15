import json

from fastapi import APIRouter, UploadFile, Query

from src.manageSolution import ManageSolution
from src.util import Util
from fastapi.responses import StreamingResponse
from src.manageUser import ManageUser
from src.manageUpload import ManageUpload
from src.manageLabeling import ManageLabeling
from pydantic import BaseModel
from starlette.responses import Response
from starlette.status import HTTP_200_OK
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from src.errorResponseList import ErrorResponseList, NOT_FOUND_ERROR, EXTENSION_NAME_ERROR
from src.manageExternalAi import ManageExternalAi
from fastapi import File, Form
from typing import List

errorResponseList = ErrorResponseList()
router = APIRouter()
utilClass = Util()
manageLabelingClass = ManageLabeling()
manageSolution = ManageSolution()
manageUserClass = ManageUser()
manageUploadClass = ManageUpload()

manageExternalAiClass = ManageExternalAi()
import os
if os.path.exists('./src/training/predict.py'):
    from src.training import predict
    predictClass = predict.Predict()
else:
    predictClass = None


class PredictObject(BaseModel):
    modelid: str = None
    apptoken: str = None
    userId: str = None
    inputLoadedModel: str = None
    parameter: dict


@router.post("/market/predict/")
def getPredict(response: Response, predictObject: PredictObject):
    if not predictObject.modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    response.status_code, result = predictClass.run(predictObject.modelid, predictObject.parameter,
                                                    predictObject.apptoken, predictObject.userId,
                                                    inputLoadedModel=predictObject.inputLoadedModel, isMarket=True)

    return result


class MarketProjectObject(BaseModel):
    projectName: str
    projectDescription: str = None
    modelId: str
    timeLimit: int = None
    planId: int = None


@router.post("/market/predictimage/")
def getPredictImage(response: Response, userId: str = Form(...), file: UploadFile = File(...),
                    filename: str = Form(...),
                    modelid: str = Form(...), apptoken: str = Form(...)):
    if not modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    if filename.split('.')[-1].lower() not in utilClass.videoExtensionName + utilClass.imageExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()
    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:

        response.status_code, result = predictClass.runImage(modelid, file, filename, apptoken, userId, isMarket=True)

    else:

        response.status_code, result = predictClass.runMovie(modelid, file, filename, apptoken, userId, isMarket=True)

    return result


class PredictWithURLObject(BaseModel):
    modelid: str = None
    apptoken: str = None
    userId: str = None
    url: str


@router.post("/market/predictimagebyurl/")
def getPredictImageByUrl(response: Response, predictObject: PredictWithURLObject):
    if not predictObject.modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    response.status_code, result = predictClass.getPredictImageByUrl(predictObject.modelid, predictObject.url,
                                                                     predictObject.apptoken, predictObject.userId,
                                                                     isMarket=True)
    return result


@router.post("/market/predictimagexai/")
def getPredictImagexai(response: Response, userId: str = Form(...), file: UploadFile = File(...),
                       filename: str = Form(...),
                       modelid: str = Form(...), apptoken: str = Form(...)):
    if not modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    if filename.split('.')[-1].lower() not in utilClass.imageExtensionName + utilClass.videoExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()

    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:

        response.status_code, result = predictClass.runImage(modelid, file, filename, apptoken, userId, xai=True,
                                                             isMarket=True)

    else:

        response.status_code, result = predictClass.runMovie(modelid, file, filename, apptoken, userId, isMarket=True)

    return result


@router.post("/market/predictimagebyurlinfo/")
def getPredictImageByUrlInfo(response: Response, predictObject: PredictWithURLObject):
    if not predictObject.modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    response.status_code, result = predictClass.getPredictImageByUrl(predictObject.modelid, predictObject.url,
                                                                     predictObject.apptoken, predictObject.userId,
                                                                     info=True, isMarket=True)
    return result


@router.post("/market/predictimagebyurlxai/")
def getPredictImageByUrl(response: Response, predictObject: PredictWithURLObject):
    if not predictObject.modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    response.status_code, result = predictClass.getPredictImageByUrl(predictObject.modelid, predictObject.url,
                                                                     predictObject.apptoken, predictObject.userId,
                                                                     xai=True, isMarket=True)
    return result


@router.post("/market/predictimageinfo/")
def getPredictImageInfo(response: Response, userId: str = Form(...), file: UploadFile = File(...),
                        filename: str = Form(...),
                        modelid: str = Form(...), apptoken: str = Form(...)):
    if not modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    if filename.split('.')[-1].lower() not in utilClass.videoExtensionName + utilClass.imageExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()

    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:

        response.status_code, result = predictClass.runImage(modelid, file, filename, apptoken, userId, info=True,
                                                             isMarket=True)

    else:

        response.status_code, result = predictClass.runMovie(modelid, file, filename, apptoken, userId, isMarket=True)

    return result


@router.post("/market/predictall/")
def getPredictAll(response: Response, userId: str = Form(...), file: UploadFile = File(...), filename: str = Form(...),
                  modelid: str = Form(...), apptoken: str = Form(...)):
    if filename.split('.')[-1].lower() not in ['csv']:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()

    response.status_code, result = predictClass.runAll(modelid, file, filename, apptoken, userId, isForText=True,
                                                       isMarket=True)
    return result


@router.post("/market/predictallasync/")
def getPredictAllAsync(response: Response, userId: str = Form(...), file: UploadFile = File(...),
                       filename: str = Form(...),
                       modelid: str = Form(...), apptoken: str = Form(...)):
    if filename.split('.')[-1].lower() not in ['csv']:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()

    response.status_code, result = predictClass.runAllAsync(modelid, file, filename, apptoken, userId, isForText=True,
                                                            isMarket=True)
    return result


@router.post("/market/labelingasync/")
def getPredictAllAsync(response: Response, userId: str = Form(...), file: UploadFile = File(...),
                       filename: str = Form(...),
                       modelid: str = Form(...), marketProjectId: str = Form(None), apptoken: str = Form(...)):
    if filename.split('.')[-1].lower() not in ['csv']:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()

    response.status_code, result = predictClass.runAllAsync(modelid, file, filename, apptoken, userId, isForText=True,
                                                            isForLabeling=True, isMarket=True,
                                                            marketProjectId=marketProjectId)
    return result


@router.post("/market/predictmovieasync/")
def getPredictMovieAsync(response: Response, userId: str = Form(...), file: UploadFile = File(...),
                         filename: str = Form(...),
                         modelid: str = Form(...), marketProjectId: str = Form(None), apptoken: str = Form(...),
                         isStandardMovie: bool = Form(None), sync_cut_at: float = Form(0),
                         creation_time: str = Form(None)):
    file = file.file.read()
    if not modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    if filename.split('.')[-1].lower() not in utilClass.videoExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    response.status_code, result = manageUploadClass.runMovieAsync(modelid, file, filename, apptoken, userId,
                                                                   isMarket=True, marketProjectId=marketProjectId,
                                                                   isStandardMovie=isStandardMovie,
                                                                   sync_cut_at=sync_cut_at, creation_time=creation_time)

    return result


@router.post("/market/predictallimage/")
def getPredictAllImage(response: Response, userId: str = Form(...), file: UploadFile = File(...),
                       filename: str = Form(...),
                       modelid: str = Form(...), apptoken: str = Form(...)):
    # if not modelid:
    #     return 204
    file = file.file.read()

    if filename.split('.')[-1].lower() not in utilClass.imageExtensionName + utilClass.compressionExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    response.status_code, result = predictClass.runAll(modelid, file, filename, apptoken, userId, isForText=False,
                                                       isMarket=True)
    return result


class PredictWithURLObject(BaseModel):
    calllogid: str = None
    apptoken: str = None
    url: str


@router.post("/market/predict/developedAiModel/")
def predictDevelopedAiModel(response: Response, apptoken: str = Form(...), modelId: str = Form(...),
                            textdata: str = Form(None), file: bytes = File(None)):
    """
    `추천시스템 예제` : {"grade_id":11, "school_id":10837, "type":"HS","school_jibun_address1":"서울 강남구 대치동 952-1", "subject":"영어", "channel": "강남"}
    """
    if textdata:
        if type(textdata) != str:
            textdata = textdata.extra
        else:
            textdata = json.loads(textdata)
    try:
        file = file.extra
    except:
        pass
    if not file and not textdata or (file and textdata):
        response.status_code = HTTP_422_UNPROCESSABLE_ENTITY
        return {
            "statusCode": 422,
            "error": "Invaild data",
            "message": "예측하고자 하는 데이터를 다시 확인해주십시오."
        }
    response.status_code, result = manageExternalAiClass.predictByDevelopedModel(apptoken, modelId, file, textdata)
    return result


@router.get("/marketprojects/{projectId}/")
async def readProject(projectId: str, token: str, response: Response):
    response.status_code, result = manageSolution.getMarketProjectById(token, projectId)
    return result


@router.get("/marketmodels/{modelId}/")
async def readModel(modelId: str, token: str, response: Response):
    response.status_code, result = manageSolution.getMarketModelById(token, modelId)
    return result


@router.delete("/marketprojects/")
def deleteLabelProjects(response: Response, token: str, marketProjectIds: List[str] = Form(...)):
    """
        `Delete LabelProject`

        :param item
        - **token**: str = user token
        - **labelProjectIds**: List[int] = delete target label project id

        \f
    """
    response.status_code, result = manageSolution.deleteMarketProjects(token, marketProjectIds)
    return result


@router.get("/marketmodels/slug/{slug_name}/")
async def readModel(slug_name: str, token: str, response: Response):
    response.status_code, result = manageSolution.getMarketModelBySlugName(token, slug_name)
    return result


@router.get("/market-categories/")
def get_market_categories(response: Response, token: str):
    """
        `Get Market Categories`

        :param item
        - **token**: str = user token

        \f
    """
    response.status_code, result = manageSolution.market_categories(token)
    return result


@router.get("/market-models/")
def get_market_models(response: Response, token: str, start: int = 1, count: int = 10, select_category: str = '전체',
                      is_quick_model: bool=False):
    """
        `Get Market Models`

        :param item
        - **token**: str = user token
        - **start**: int = pagination start
        - **count**: int = pagination count
        - **select_category**: str = select category

        \f
    """
    response.status_code, result = manageSolution.market_models(token, start, count, select_category, is_quick_model)
    return result


@router.post("/request-market-model/")
def request_market_model(response: Response, token: str, file: UploadFile = File(None),
                         market_model_id: int = Form(...),
                         phone_number: str = Form(...), description: str = Form(None)):
    """
        `Request Market Model`

        :param item
        - **token**: str = user token
        - **file**: Optional[bytes] = upload data file for training data
        - **market_model_id**: str = target market model`s id
        - **phone_number**: str = user phone number ex) 01012341234
        - **description**: str = description

        \f
    """
    response.status_code, result = manageSolution.request_market_model(token, file, market_model_id, phone_number,
                                                                       description)
    return result


@router.get("/market-purchase-list/")
def get_market_purchase_list(response: Response, token: str, start: int = 1, count: int = 10, searching: str = '',
                             sorting: str = 'created_at', desc: bool = True):
    """
        `Request Market Model`

        :param item
        - **token**: str = user token
        - **count**: int = pagination count
        - **start**: int = pagination start
        - **searching**: str = searching word

        \f
    """
    response.status_code, result = manageSolution.get_market_purchase_list(token, start, count, searching, sorting,
                                                                           desc)
    return result


@router.get("/market-plans/")
def get_market_plans(response: Response, token: str, market_model_id: int):
    response.status_code, result = manageSolution.get_market_plans(token, market_model_id)
    return result


@router.post("/marketprojects/")
def postMarketprojects(response: Response, market_project_object: MarketProjectObject, token: str):
    response.status_code, result = manageSolution.createMarketProject(token, market_project_object)
    return result


class UpdateMarketProjectObject(BaseModel):
    projectName: str = None
    description: str = None


@router.put("/marketprojects/{projectId}/")
def update_market_project(projectId: str, token: str, response: Response,
                          market_project_object: UpdateMarketProjectObject):
    response.status_code, result = manageSolution.update_market_project(token, projectId, market_project_object)
    return result


@router.get("/moviestatistics/{market_project_id}/")
def moviestatistics(response: Response, token: str, market_project_id: int, period_type: str, start_date: str = None,
                    end_date: str = None):
    response.status_code, result = manageSolution.get_moviestatistics(token, market_project_id, period_type, start_date,
                                                                      end_date)
    return result
