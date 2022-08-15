from datetime import datetime
import time
from fastapi import APIRouter, Form, File, Body, UploadFile, BackgroundTasks
from typing import List
from src import manageFile

from src.util import Util
from starlette.responses import Response
from pydantic import BaseModel
from src.manageFile import ManageFile
from src.manageTask import ManageTask
from src.errorResponseList import ErrorResponseList
import asyncio

router = APIRouter()
utilClass = Util()
manageFileClass = ManageFile()
manageTaskClass = ManageTask()
errorResponseList = ErrorResponseList()

import os
if os.path.exists('./src/training/trainingByColab.py'):
    from src.training.trainingByColab import TrainingByColab
    trainingByColabClass = TrainingByColab()
else:
    trainingByColabClass = None

@router.post("/upload-image-to-s3/")
async def add_object(response: Response, files: List[UploadFile] = File(...), key:str = Form(...), password:str = Form(...)):
    response.status_code, result = manageFile.ManageFile().upload_image_file_to_s3(key, password, files)

    return result

@router.post("/add-object/", response_description="성공 결과 예시")
async def add_object(response: Response, background_tasks: BackgroundTasks, token: str = Form(...), labelprojectId: str = Form(...)
              , files: List[UploadFile] = File(...), frame_value: int = Form(60), has_de_identification: bool = Form(False)):
    """
        ## Upload an image file or zip file(label data)

        :param item
        - **token**: str = user Token \n
        - **labelprojectId**: str = labelprojectId \n
        - **files**: List[File] = upload image files or zip File \n
        - **frame_value** (optional) : int = video frame per minute \n

        \f
    """
    response.status_code, result = manageFile.ManageFile().add_object(token, background_tasks, files, labelprojectId, frame_value, has_de_identification)

    return result

@router.get("/listobjects/")
def listObjects(token: str, response: Response, labelprojectId: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10, page: int = 1, desc : bool = False, searching: str = '', workAssignee: str = None, is_label_app:bool=False):
    """
            ## Upload an image file or zip file

            :param item
            - **token**: str = user Token \n
            - **labelprojectId**: str =  labelprojectId \n
            - **sorting**: str = sort by \n
            - **tab**: str = object status \n
            - **count**: int = object count\n
            - **start**: int = object count start number \n
            - **desc**: bool = object sort descending True/False \n
            - **searching**: str = object name for search \n
            - **workAssignee**: str = labeling asignee \n

            \f
    """
    response.status_code, result = manageFileClass.listObject(token, labelprojectId, sorting, page, count, tab, desc, searching, workAssignee, is_label_app)

    return result

class AddFolder(BaseModel):
    folderName: str
    folder: str = None

@router.post("/addfolder/")
def addFolder(token: str, item: AddFolder, response: Response):
    """
            ## Add folder

            :param item
            - **token**: str = user Token \n

            :json item
            - **folderName**: str = folder name \n
            - **folder**: str = folder \n

            \f
    """
    response.status_code, result = manageFileClass.addFolder(token, item.folderName, item.folder)

    return result

@router.get("/folders/{folderId}/")
def getFolder(folderId:int, token: str, response: Response):
    """
            ## Get folder

            :param item
            - **folderId**: int = folder Id \n
            - **token**: str = user Token \n

            \f
    """
    response.status_code, result = manageFileClass.getFolderByFolderId(token, folderId)

    return result


class PutFolderObject(BaseModel):
    newName: str

@router.put("/folders/{folderId}/")
def putFolder(folderId:int, token: str, putFolderObject: PutFolderObject, response: Response):
    """
            ## Update folder

            :param item
            - **folderId**: int = folder Id \n
            - **token**: str = user Token \n

            :json item
            - **newName**: str = new folder name \n

            \f
    """
    response.status_code, result = manageFileClass.putFolderByFolderId(token, folderId, putFolderObject.newName)

    return result

# @router.delete("/folders/{folderId}/")
# def deleteFolder(folderId:int, token: str, response: Response):
#
#     response.status_code, result = manageFileClass.deleteFolderByFolderId(token, folderId)
#
#     return result

class PutSthreefileInfo(BaseModel):
    fileName: str = None
    fileSize: int = None
    fileType: str = None
    openIssueCount: int = None
    thumbnail: str = None
    uniqueLabelType: str = None
    status: str = None
    workAssignee: str = None
    requeued: bool = None
    labelproject: int = None
    folder: int = None
    inspectionResult: int = None
    reviewer: str = None

@router.put("/sthreefiles/{sthreefilesId}/")
def updateSthreeFile(sthreefilesId: str, token: str, response: Response, putSthreefileInfo: PutSthreefileInfo, app_status: str = None):
    """
            ## Update S3 file

            :param item
            - **sthreefilesId**: int = file Id \n
            - **token**: str = user Token \n

            :json item
            - **fileName**: str = file name \n
            - **fileSize**: int = file size \n
            - **fileType**: str = file type \n
            - **openIssueCount**: int = open Count \n
            - **thumbnail**: str = thumbnail \n
            - **uniqueLabelType**: str = unique label type \n
            - **status**: str =  status \n
            - **workAssignee**: str = Assignee \n
            - **requeued**: bool = is requeued \n
            - **labelproject**: int = label project id \n
            - **folder**: int = folder id \n

            \f
    """
    response.status_code, result = manageFileClass.updateSthreeFile(token, sthreefilesId, putSthreefileInfo, app_status)

    return result

@router.get("/static/{file_path:path}")
def getTemplateFile(file_path: str, response: Response):

    response.status_code, result = manageFileClass.get_static_local_file(file_path)
    return result

@router.get("/asset/{file_path:path}")
def getAssetFile(file_path: str, response: Response):

    response.status_code, result = manageFileClass.get_static_local_file(file_path, has_asset_file=True)
    return result

@router.delete("/sthreefiles/")
def deleteSthreeFile(token: str, response: Response, sthreefilesId: List[str] = Form(...)):
    """
            ## Delete S3 file

            :param item
            - **token**: str = user Token \n
            - **sthreefilesId**: List[str] = file Ids \n

            \f
    """
    response.status_code, result = manageFileClass.deleteSthreeFile(token, sthreefilesId)
    return result

# @router.get("/datasets/{datasetId}/")
# def read_dataset(datasetId: str, token: str, response: Response):
#     response.status_code, result = manageFileClass.getDataset(token, datasetId)
#     return result
#
# class DatasetInfo(BaseModel):
#     datasetName: str = None
#
# @router.post("/datasets/")
# def create_dataset(datasetInfo: DatasetInfo, token: str, response: Response):
#     response.status_code, result = manageFileClass.createDataset(token, datasetInfo)
#     return result
#
# @router.put("/datasets/{datasetId}/")
# def read_dataset(datasetInfo: DatasetInfo, datasetId: str, token: str, response: Response):
#     response.status_code, result = manageFileClass.putDataset(token, datasetId, datasetInfo)
#     return result
#
# @router.delete("/datasets/{datasetId}/")
# def delete_dataset(datasetId: str, token: str, response: Response):
#     response.status_code, result = manageFileClass.deleteDataset(token, datasetId)
#     return result

class DataconnectorsList(BaseModel):
    dataconnectors: list
    repeatAmpm: str = None
    repeatHour: str = None
    repeatDays: str = None
    trainingMethod: str = None
    startTimeseriesDatetime: str = None
    endTimeseriesDatetime: str = None
    analyticsStandard: str = None
    timeseriesColumnInfo: dict = None

@router.get("/templatefile/{projectId}/")
def getTemplateFile(projectId:int, response: Response, token: str, osName:str='window'):
    """
            ## Get Template file

            :param item
            - **projectId**: int = project id \n
            - **token**: str = user Token \n
            - **osName**: str = OS name \n

            \f
    """
    response.status_code, result = manageFileClass.getPredictAllTemplate(token, projectId, osName)
    return result

@router.get("/user/{userId}/{folderName}/{fileName}/")
def getEnterpriseFile(userId:str, folderName:str, fileName:str, response: Response):
    """
            ## Get Enterprise file

            :param item
            - **userId**: str = user Id \n
            - **folderName**: str = folder name \n
            - **fileName**: str = file name \n

            \f
    """
    filePath = f"user/{userId}/{folderName}/{fileName}"
    response.status_code, result = manageFileClass.getEnterpriseImageFile(filePath)
    print('반환성공')
    return result

@router.get("/sampleimages/{modelId}/")
def sampleimages(modelId:int, response: Response, token: str):
    """
            ## Get sample images

            :param item
            - **modelId**: int = model Id \n
            - **token**: str = user Token \n

            \f
    """
    response.status_code, result = manageFileClass.getSampleImages(token, modelId)

    return result


class ColabCodeInfo(BaseModel):
    epoch: int = None
    learningRate: float = None
    layerDeep: int = None
    layerWidth: int = None
    dropOut: float = None

@router.post("/trainmodelfromcolab/{projectId}/")
def trainmodelfromcolab(response: Response,
              token: str,
              projectId: int,
              colabCodeInfo: ColabCodeInfo,
              ):
    """
            ## train model from colab

            :param item
            - **token**: str = user Token \n
            - **projectId**: int = project Id \n

            :json item
            - **epoch**: int = epoch \n
            - **learningRate**: float = learning rate \n
            - **layerDeep**: int = layer count \n
            - **layerWidth**: int = layer node count \n
            - **dropOut**: float = dropout rate \n

            \f
    """
    response.status_code, result = trainingByColabClass.trainModelByColab(token, projectId,
                                  epoch=colabCodeInfo.epoch, learningRate=colabCodeInfo.learningRate, layerDeep=colabCodeInfo.layerDeep,
                                  layerWidth=colabCodeInfo.layerWidth, dropOut=colabCodeInfo.dropOut)
    time.sleep(0.5)

    return result

@router.post("/setupcolabmodel/{projectId}/")
def setupcolabmodel(response: Response,
              token: str,
              projectId: int,
              ):
    """
            ## setup model from colab

            :param item
            - **token**: str = user Token \n
            - **projectId**: int = project Id \n

            \f
    """
    response.status_code, result = trainingByColabClass.setupcolabmodel(token, projectId)
    time.sleep(0.5)

    return result

@router.post("/predictmodelfromcolab/")
def predictModelFromColab(response: Response,
              apptoken: str = Form(...),
              project: int = Form(...),
              bbox: dict = Form(None),
              uploadedModel: UploadFile = File(...)):
    """
            ## predict model from colab

            :param item
            - **apptoken**: str = app Token \n
            - **project**: int = project Id \n
            - **uploadedModel**: bytes = model \n

            \f
    """
    uploadedModel = uploadedModel.file.read()
    response.status_code, result = trainingByColabClass.updateModelFromColab(apptoken, project, uploadedModel, bbox=bbox)
    time.sleep(0.5)

    return result
