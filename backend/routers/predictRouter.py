import json

from fastapi import APIRouter, UploadFile

from src.manage_machine_learning import ManageMachineLearning
from src.util import Util
from src.manageUser import ManageUser
from src.manageLabeling import ManageLabeling
from pydantic import BaseModel
from starlette.responses import Response
from starlette.status import HTTP_200_OK
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from src.errorResponseList import ErrorResponseList, NOT_FOUND_ERROR, EXTENSION_NAME_ERROR
from src.manageExternalAi import ManageExternalAi
from src.manageUpload import ManageUpload
from fastapi import File, Form

errorResponseList = ErrorResponseList()
router = APIRouter()
utilClass = Util()
manageLabelingClass = ManageLabeling()
manageUserClass = ManageUser()
manageUploadClass = ManageUpload()

manageExternalAiClass = ManageExternalAi()
import os
from src.managePredict import ManagePredict
predictClass = ManagePredict()
SevMain = None
if os.path.exists('./src/training/aistore_config.py'):
    from src.training.predictSevMain import SevMain

class PredictObject(BaseModel):
    modelid: str = None
    apptoken: str = None
    modeltoken: str = None
    inputLoadedModel: str = None
    parameter: dict

@router.post("/predict/{userId}/")
def getPredict(response: Response, predictObject: PredictObject, userId):
    if not predictObject.modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    response.status_code, result = ManageMachineLearning().predict(userId, predictObject)


    return result

@router.post("/predictimage/{userId}/")
def getPredictImage(response: Response, userId, file: UploadFile = File(...), filename: str = Form(...),
                    modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):
    if not modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    file = file.file.read()
    if filename.split('.')[-1].lower() not in utilClass.videoExtensionName + utilClass.imageExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:

        response.status_code, result = predictClass.runImage(modelid, file, filename, apptoken, userId, modeltoken=modeltoken)

    else:

        response.status_code, result = predictClass.runMovie(modelid, file, filename, apptoken, userId, modeltoken=modeltoken)


    return result

class PredictWithURLObject(BaseModel):
    modelid: str = None
    apptoken: str = None
    modeltoken: str = None
    url: str

@router.post("/predictimagebyurl/{userId}/")
def getPredictImageByUrl(response: Response, predictObject: PredictWithURLObject, userId):
    if not predictObject.modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    response.status_code, result = predictClass.getPredictImageByUrl(predictObject.modelid, predictObject.url, predictObject.apptoken, userId, modeltoken=predictObject.modeltoken)
    return result


@router.post("/predictimagexai/{userId}/")
def getPredictImagexai(response: Response, userId, file: UploadFile = File(...), filename: str = Form(...),
                    modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):
    if not modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    file = file.file.read()
    if filename.split('.')[-1].lower() not in utilClass.imageExtensionName + utilClass.videoExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:

        response.status_code, result = predictClass.runImage(modelid, file, filename, apptoken, userId, xai=True, modeltoken=modeltoken)

    else:

        response.status_code, result = predictClass.runMovie(modelid, file, filename, apptoken, userId, modeltoken=modeltoken)

    return result

@router.post("/predictimagebyurlinfo/{userId}/")
def getPredictImageByUrlInfo(response: Response, predictObject: PredictWithURLObject, userId):
    if not predictObject.modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    response.status_code, result = predictClass.getPredictImageByUrl(predictObject.modelid, predictObject.url, predictObject.apptoken, userId, info=True, modeltoken=predictObject.modeltoken)
    return result

@router.post("/predictimagebyurlxai/{userId}/")
def getPredictImageByUrl(response: Response, predictObject: PredictWithURLObject, userId):
    if not predictObject.modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    response.status_code, result = predictClass.getPredictImageByUrl(predictObject.modelid, predictObject.url, predictObject.apptoken, userId, xai=True, modeltoken=predictObject.modeltoken)
    return result

@router.post("/predictimageinfo/{userId}/")
def getPredictImageInfo(response: Response, userId, file: UploadFile = File(...), filename: str = Form(...),
                    modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):
    if not modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    file = file.file.read()
    if filename.split('.')[-1].lower() not in utilClass.videoExtensionName + utilClass.imageExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:

        response.status_code, result = predictClass.runImage(modelid, file, filename, apptoken, userId, info=True, modeltoken=modeltoken)

    else:

        response.status_code, result = predictClass.runMovie(modelid, file, filename, apptoken, userId, modeltoken=modeltoken)


    return result

@router.post("/predictall/{userId}/")
def getPredictAll(response: Response, userId, file: UploadFile = File(...), filename: str = Form(...),
                  modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):

    if filename.split('.')[-1].lower() not in ['csv']:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()

    response.status_code, result = ManageMachineLearning().predict_all(apptoken, userId, file, filename, modelid, modeltoken, return_type="file")

    return result

@router.post("/predictallasync/{userId}/")
def getPredictAllAsync(response: Response, userId, file: UploadFile = File(...), filename: str = Form(...),
                  modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):

    if filename.split('.')[-1].lower() not in ['csv']:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()
    response.status_code, result = predictClass.runAllAsync(modelid, file, filename, apptoken, userId, isForText=True, modeltoken=modeltoken)
    return result


@router.post("/labelingasync/{userId}/")
def getPredictAllAsync(response: Response, userId, file: UploadFile = File(...), filename: str = Form(...),
                  modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):

    file = file.file.read()
    if filename.split('.')[-1].lower() not in ['csv']:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    response.status_code, result = predictClass.runAllAsync(modelid, file, filename, apptoken, userId, isForText=True, isForLabeling=True, modeltoken=modeltoken)
    return result

@router.post("/predictmovieasync/{userId}/")
def getPredictMovieAsync(response: Response, userId, file: UploadFile = File(...), filename: str = Form(...),
                    modelid: str = Form(...), marketProjectId: str = Form(None), apptoken: str = Form(None),
                         modeltoken: str = Form(None), isStandardMovie: bool = Form(None), sync_cut_at: float = Form(None)):
    if not modelid:
        response.status_code, result = NOT_FOUND_ERROR
        return result

    if filename.split('.')[-1].lower() not in utilClass.videoExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    file = file.file.read()
    response.status_code, result = manageUploadClass.runMovieAsync(modelid, file, filename, apptoken,
              userId, modeltoken=modeltoken, marketProjectId=marketProjectId, isStandardMovie=isStandardMovie,
                                                              sync_cut_at=sync_cut_at)


    return result

@router.post("/predictallimage/{userId}/")
def getPredictAllImage(response: Response, userId, file: UploadFile = File(...), filename: str = Form(...),
                       modelid: str = Form(...), apptoken: str = Form(None), modeltoken: str = Form(None)):
    # if not modelid:
    #     return 204

    file = file.file.read()
    if filename.split('.')[-1].lower() not in utilClass.imageExtensionName + utilClass.compressionExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

    response.status_code, result = predictClass.runAll(modelid, file, filename, apptoken, userId, isForText=False, modeltoken=modeltoken)
    return result

class PredictWithURLObject(BaseModel):
    calllogid: str = None
    apptoken: str = None
    url: str

@router.post("/predict/developedAiModel/")
def predictDevelopedAiModel(response: Response, apptoken: str = Form(None), modeltoken: str = Form(None), modelId: str = Form(...), textdata: str = Form(None), file: UploadFile = File(None)):
    """
    `추천시스템 예제` : {"grade_id":11, "school_id":10837, "type":"HS","school_jibun_address1":"서울 강남구 대치동 952-1", "subject":"영어", "channel": "강남"}
    """
    if textdata:
        if type(textdata) != str:
            textdata = textdata.extra
        else:
            textdata = json.loads(textdata)
    try:
        file = file.file.read()
    except:
        pass
    if not file and not textdata or (file and textdata):
        response.status_code = HTTP_422_UNPROCESSABLE_ENTITY
        return {
            "statusCode": 422,
            "error": "Invaild data",
            "message": "예측하고자 하는 데이터를 다시 확인해주십시오."
        }
    response.status_code, result = manageExternalAiClass.predictByDevelopedModel(apptoken, modelId, file, textdata, modeltoken=modeltoken)
    return result

@router.post("/predict-sev/")
def predictSev(response: Response, et: str = Form(...), el: str = Form(None),
               fi: UploadFile = File(None), rf: UploadFile = File(None), hd: UploadFile = File(None),
               gcoa: UploadFile = File(None), hdi: UploadFile = File(None), mt: UploadFile = File(None),
               rao: UploadFile = File(None), raoo: UploadFile = File(None), rta: UploadFile = File(None)):

    response.status_code, result = SevMain().predict_sev(et, el, fi, rf, hd, gcoa, hdi, mt, rao, raoo, rta)

    return result