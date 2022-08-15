from fastapi import APIRouter, UploadFile
from src.util import Util
from src.manageUser import ManageUser
from src.manageLabeling import ManageLabeling
from src.manageExternalAi import ManageExternalAi
from starlette.responses import Response
from fastapi import File, Form
from src.service.ocr import predictOCR
from src.service.Transcribe import transcribe
from src.service.FaceDetection import faceDetection
from src.service.Polly import polly, pollyAll
from src.service.DetectKeyPhrase import detectKeyPhrase
from src.service.Detectlandmarks import predictLandMarks
from src.service.DetectWeb import detectWeb
from src.service.DetectSafesearch import detectSafesearch
from src.service.DetectEntity import detectEntity, detectEntityAll
from src.service.DetectLanguage import detectLanguage, detectLanguageAll
from src.service.DetectSentiment import detectSentiment, detectSentimentAll
from src.service.ImageProperty import imageProperty
from src.service.LabelDetection import labelDetection
from src.service.LogoDetection import logoDetection
from src.errorResponseList import ErrorResponseList, EXTENSION_NAME_ERROR

router = APIRouter()
utilClass = Util()
manageLabelingClass = ManageLabeling()
manageUserClass = ManageUser()
manageExternalAiClass = ManageExternalAi()
errorResponseList = ErrorResponseList()
@router.post("/predict/transcribe/")
async def predictTranscribe(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken: str = Form(...)):
    file = file.file.read()
    if filename.split('.')[-1].lower() in utilClass.soundExtensionName:
        response.status_code, result = transcribe.Transcribe().transcribe(file, filename, apptoken)
        return result
    else:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

@router.post("/predict/landmark/")
def predictLandmark(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken: str = Form(...) ):

    file = file.file.read()
    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:
        response.status_code, result = predictLandMarks.PredictLandMarks().predictLandMarks(file, apptoken)
        return result
    else:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

@router.post("/predict/ocr/")
def predictOcr(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken: str = Form(...) ):
    file = file.file.read()

    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:
        response.status_code, result = predictOCR.PredictOCR().predictOCR(file, apptoken)
        return result
    else:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

@router.post("/predict/polly/")
def predictPolly(response: Response, text: str = Form(...), apptoken: str = Form(...)):
    response.status_code, result = polly.Polly().polly(text, apptoken)
    return result

@router.post("/predictall/polly/")
async def predictPollyAll(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken: str = Form(...)):
    file = file.file.read()
    response.status_code, result = pollyAll.PollyAll().pollyAll(file, filename, apptoken)
    return result

@router.post("/predict/web/")
def predictdetectWeb(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken: str = Form(...)):
    file = file.file.read()
    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:
        response.status_code, result = detectWeb.DetectWeb().detectWeb(filename,file,apptoken)
        return result
    else:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result


# @router.post("/web/predictall")
# def predictWebAll(response: Response, file: bytes = File(...), filename: str = Form(...), apptoken: str = Form(...)):
#     if not filename.split('.')[-1] in ['zip']:
#         response.code = HTTP_422_UNPROCESSABLE_ENTITY
#         return response.code, {
#             "statusCode": 422,
#             "error": "Invaild File type",
#             "message": "허용되지 않는 파일 확장자입니다."
#         }
#     response.code, result = detectWebAll.DetectWebAll().detectWebAll(filename, file, apptoken)
#     return response.code, result

@router.post("/predict/face/")
def predictFace(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken: str = Form(...)):
    file = file.file.read()
    if not filename.split('.')[-1].lower() in utilClass.imageExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result
    response.status_code, result = faceDetection.FaceDetection().faceDetect(file, apptoken)
    return result

@router.post('/predict/safelink/')
def detectingSafeLink(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken: str = Form(...)):
    file = file.file.read()
    if filename.split('.')[-1].lower() in utilClass.imageExtensionName:
        response.status_code, result = detectSafesearch.DetectSafeSearch().detectSafeSearch(file,filename,apptoken)
        return result
    else:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result

# @router.post('/safelink/predictall')
# def detectingSafeLinkAll(response: Response, file: bytes = File(...), filename: str = Form(...), apptoken: str = Form(...)):
#     if filename.split('.')[-1] in ['zip']:
#         response.status_code, result = detectSafesearchall.DetectSafeSearchall().detectSafeSearchall(file, filename, apptoken)
#         return response.status_code, result
#     else:
#         return response.status_code,{
#             "statusCode" : 422,
#             "error" : "Invaild file type",
#             "message" : "허용되지 않는 파일 확장자입니다."
#         }


@router.post('/predict/language/')
def detectLanguages(response: Response, text : str = Form(...), apptoken : str = Form(...)):
    response.status_code, result = detectLanguage.DetectLanguage().detectLanguage(text, apptoken)
    return result

@router.post('/predictall/language/')
async def detectLanguagesAll(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken : str = Form(...)):
    file = file.file.read()
    response.status_code, result = detectLanguageAll.DetectLanguageAll().detectLanguageAll(file, filename, apptoken)
    return result

@router.post('/predict/sentiment/')
def predictSentiment(response: Response, text : str = Form(...), apptoken : str = Form(...)):
    response.status_code, result = detectSentiment.DetectSentiment().detectsentiment(text, apptoken)
    return result

@router.post('/predictall/sentiment/')
async def predictSentimentsAll(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken: str = Form(...)):
    file = file.file.read()
    response.status_code, result = detectSentimentAll.DetectSentimentAll().detectsentimentAll(file, filename, apptoken)
    return result

@router.post("/predict/imageproperty/")
def predictImageProperty(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken: str = Form(...)):
    file = file.file.read()
    if not filename.split('.')[-1].lower() in utilClass.imageExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result
    response.status_code, result = imageProperty.ImageProperty().imageProperty(file, apptoken)
    return result

@router.post("/predict/label/")
def predictLabel(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken: str = Form(...)):
    file = file.file.read()
    if not filename.split('.')[-1].lower() in utilClass.imageExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result
    response.status_code, result = labelDetection.LabelDetection().labelDetect(file, apptoken)
    return result

@router.post("/predict/logo/")
def predictLogo(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken: str = Form(...)):
    file = file.file.read()
    if not filename.split('.')[-1].lower() in utilClass.imageExtensionName:
        response.status_code, result = EXTENSION_NAME_ERROR
        return result
    response.status_code, result = logoDetection.LogoDetection().logoDetect(file, apptoken)
    return result


@router.post("/predict/entity/")
def predictEntity(response: Response, text : str = Form(...), apptoken : str = Form(...)):
    response.status_code, result = detectEntity.DetectEntity().detectEntity(text, apptoken)
    return result

@router.post("/predictall/entity/")
async def predictEntityall(response: Response, file: UploadFile = File(...), filename: str = Form(...), apptoken: str = Form(...)):
    file = file.file.read()
    response.status_code, result = detectEntityAll.DetectEntityAll().detectEntityAll(file, filename, apptoken)
    return result

@router.post("/predict/keyphrase/")
def predcitKeyPharse(response: Response, text : str = Form(...), apptoken : str = Form(...)):
    response.status_code, result = detectKeyPhrase.DetectKeyPhrase().detectKeyPhrase(text, apptoken)
    return result

@router.post("/uploadModel/")
def uploadModel(response: Response, apptoken: str = Form(...), modelName: str = Form(...),
                file: bytes = File(...), version: str = Form(...), isExampleModel: bool = Form(...),
                model_summary: str = Form(...), model_description: str = Form(...),
                display_name: str = Form(...)):

    response.status_code, result = manageExternalAiClass.uploadModel(apptoken, modelName, file, version, isExampleModel,  model_summary, model_description, display_name)

    return result

# @router.post("/keypharse/predictall") # 에러 해결 필요
# def KeyPharse(response: Response, file: bytes = File(...), filename: str = Form(...), integrated: bool =Form(...), apptoken: str = Form(...), languageCode: str = Form("ko")):
#     response.code, result = detectKeyPhraseAll.DetectKeyPhraseAll().detectKeyPhraseAll(file, filename, integrated,languageCode, apptoken)
#     return response.code, result


# @router.post("/landmark/predictall")
# def predictlandmark(response: Response, file: bytes = File(...), filename: str = Form(...), apptoken: str = Form(...)):
#     if filename.split('.')[-1] in ['zip']:
#         response.status_code, result = predictLandMarksAll.PredictLandMarksAll().predictLandMarksAll(file, filename, apptoken)
#         return result
#     else:
#         response.status_code = HTTP_422_UNPROCESSABLE_ENTITY
#         return {
#             "statusCode": 422,
#             "error": "Invaild File type",
#             "message": "허용되지 않는 파일 확장자입니다."
#         }