from typing import List

from pydantic import BaseModel
from fastapi import APIRouter, Form, File, UploadFile, BackgroundTasks, Query
from starlette.responses import Response
from starlette.status import HTTP_200_OK

from src.checkDataset import CheckDataset
from src.manageLabeling import ManageLabeling
from src.manageUser import ManageUser
from src.service.contour import predict_contour
from src.util import Util
from src.manageDataAnalyze import DataAnalyze

manageDataAnalyze = DataAnalyze()
router = APIRouter()
utilClass = Util()
manageLabelingClass = ManageLabeling()
manageUserClass = ManageUser()

@router.get("/labelprojects/")
async def getLabelProjects(response: Response, token: str, sorting: str = 'created_at', page: int = 10, start: int = 0,
                           desc: bool = False, searching: str = ''):
    """
        `Get LabelProject`

        :param item
        - **token**: str = user token
        - **sorting**: str = sorting by
        - **count**: int = pagination count
        - **start**: int = pagination start
        - **desc**: bool = order by true: DESC, false: ASC
        - **searching**: str = searching word
        - **isshared**: bool = true: isshared, false: unshared

        \f
    """
    response.status_code, result = manageLabelingClass.getLabelProjects(token, sorting, page, start, desc, searching)
    return result


@router.post("/labelprojects/")
async def create_label_project_with_file(response: Response,
                                   background_tasks: BackgroundTasks,
                                   token: str,
                                   name: str = Form(...),
                                   description: str = Form(None),
                                   workapp: str = Form(...),
                                   files: List[UploadFile] = File(...),
                                   frame_value: int = Form(None),
                                   has_de_identification: bool = Form(False)):
    """
        `Create LabelProject with Upload Files`

        :param item
        - **token**: str = user token
        - **name**: str = name to create
        - **description**: str = description to create
        - **workapp**: str = workapp
        - **created_by**: str = created user info
        - **last_updated_by**: str = last updated user info
        - **files**: List[File] = upload image files or zip File \n
        - **frame_value**: int = video frame per minute \n

        \f
    """
    label_project_info = {}
    label_project_info["name"] = name
    label_project_info["description"] = description
    label_project_info["workapp"] = workapp

    response.status_code, result = manageLabelingClass.create_label_project(token, background_tasks, label_project_info, files, frame_value, has_de_identification)
    return result


class LabelProject(BaseModel):
    name: str = None
    description: str = None
    workapp: str = None
    created_by: str = None
    last_updated_at: str = None
    last_updated_by: str = None
    has_review_process: bool = None


@router.put("/labelprojects/{labelProjectId}/")
def updateLabelProject(response: Response, token: str, labelProjectId: str, labelProject: LabelProject):
    """
        `Update LabelProject`

        :param item
        - **token**: str = user token

        :json item
        - **name**: str = name to update
        - **description**: str = description to update
        - **workapp**: str = workapp
        - **created_by**: str = created user info
        - **last_updated_at**: str = last updated time
        - **last_updated_by**: str = last updated user info
        - **folder**: int = folder id

        \f
    """
    response.status_code, result = manageLabelingClass.updateLabelProject(token, labelProjectId, labelProject)
    return result


@router.delete("/labelprojects/{labelProjectId}/")
def deleteLabelProject(response: Response, token: str, labelProjectId):
    """
        `Delete LabelProject`

        :param item
        - **token**: str = user token
        - **labelProjectIds**: List[int] = delete target label project id

        \f
    """
    response.status_code, result = manageLabelingClass.deleteLabelProject(token, labelProjectId)
    return result


@router.delete("/labelprojects/")
def deleteLabelProjects(response: Response, token: str, labelProjectIds: List[str] = Form(...)):
    """
        `Delete LabelProject`

        :param item
        - **token**: str = user token
        - **labelProjectIds**: List[int] = delete target label project id

        \f
    """
    response.status_code, result = manageLabelingClass.deleteLabelProjects(token, labelProjectIds)
    return result


@router.get("/labelprojects/{labelProjectId}/")
def getLabelProject(response: Response, token: str, labelProjectId: int):
    """
        `Get LabelProject`

        :param item
        - **token**: str = user token
        - **labelProjectId**: str = target label project id

        \f
    """
    response.status_code, result = manageLabelingClass.getLabelProject(token, labelProjectId)
    return result

@router.get("/label-app/{labelProjectId}/{sthreeFileId}/")
def get_label_app_info(response: Response, token: str, labelProjectId: int, sthreeFileId: str):

    response.status_code, result = manageLabelingClass.get_label_app_info(token, labelProjectId, sthreeFileId)
    return result

@router.get("/autolabeling/progress/{labelprojectId}/")
def autoLabelingProgress(response: Response, token: str, labelprojectId: int):
    """
        `Auto Labeling Progress`

        :param item
        - **token**: str = user token
        - **labelprojectId**: int = target label project id

        \f
    """
    response.status_code, result = manageLabelingClass.getAutoLabelingProgress(labelprojectId, token)
    return result

@router.get("/workage/")
def getWorkageAitraner(response: Response, token: str, labelprojectId: int = None):
    """
        `Get Workage Aitraner`

        :param item
        - **token**: str = user token
        - **labelprojectId**: str = target label project id

        \f
    """
    response.status_code, result = manageLabelingClass.getWorkageAitraner(token, labelprojectId)
    return result


class LabelObject(BaseModel):
    id: str = None
    status: str = None
    labeltype: str = None
    color: str = None
    locked: bool = None
    visible: bool = None
    selected: bool = None
    points: list = None
    pointCount: int = None
    sthreefile: str = None
    labelclass: int = None
    labelproject: int
    x: float = None
    y: float = None
    w: float = None
    h: float = None
    highlighted: bool = None
    editingLabels: bool = None
    ismagictool: bool = None
    voiceLabel: str = None
    structuredData: dict = None


@router.post("/labels/")
def createLabels(response: Response, token: str, labelObjects: List[LabelObject], info: bool=False):
    """
        `Create Label`

        :param item
        - **token**: str = user token

        :json item
        - **status**: str = status to create
        - **labeltype**: str = type to create For Example object_detection(box, polygon), image, voice ...
        - **color**: str = color to create
        - **locked**: bool = true: is locked, false: is unLock to create
        - **visible**: bool = true: is visible, false: is unvisible to create
        - **selected**: bool = true: is selected, false: is unselected to create
        - **points**: str = pos points to create ex)[[0, 0],[100, 50], [50, 100], [0, 90]]
        - **sthreefile**: int = sthreefile id to create
        - **labelclass**: int = labelclass id to create
        - **labelproject**: int = labelproject id to create
        - **x**: float = x pos to create
        - **y**: float = y pos to create
        - **w**: float = w pos to create
        - **h**: float = h pos to create
        - **highlighted**: bool = true: is highlighted, false: is unhighlighted to create
        - **editingLabels**: bool = true: is editinglabels, false: is uneditinglabels to create
        - **ismagictool**: bool = true: ismagictool, false: is not magictool to create
        - **voiceLabel**: str = label for voice_data.
        - **structuredData**: dict = label for csv_data.

        \f
    """
    response.status_code, result = manageLabelingClass.create_labels(token, labelObjects, info=info)
    return result

@router.get("/labels/")
def getLabels(response: Response, token: str):
    """
        `Get Label`

        :param item
        - **token**: str = user token

        \f
    """
    response.status_code, result = manageLabelingClass.getLabels(token)
    return result

@router.get("/labels-by-labelproject/{labelproject_id}/")
def getLabels(response: Response, token: str, labelproject_id):
    """
        `Get Label`

        :param item
        - **token**: str = user token

        \f
    """
    response.status_code, result = manageLabelingClass.get_labels_by_labelproject_id(token, labelproject_id)
    return result

@router.put("/labels/")
def updateLabels(response: Response, token: str, labelObjects: List[LabelObject]):

    response.status_code, result = manageLabelingClass.updateLabels(token, labelObjects)
    return result

@router.delete("/labels/")
def deleteLabels(response: Response, token: str, label_ids: List[str]):

    response.status_code, result = manageLabelingClass.deleteLabels(token, label_ids)
    return result

@router.get("/sthreefiles/{sthreefilesId}/")
def getSthreeFile(response: Response, token: str, sthreefilesId: str, labelprojectId: int, workapp: str):
    """
        `Get SthreeFile`

        :param item
        - **token**: str = user token
        - **sthreefilesId**: str = target sthreefile id

        \f
    """
    response.status_code, result = manageLabelingClass.getSthreeFile(token, sthreefilesId, labelprojectId, workapp)
    return result

# @router.get("/mongo-sthreefiles/{sthreefilesId}/")
# def getSthreeFile(response: Response, token: str, sthreefilesId: str):
#     """
#         `Get SthreeFile`
#
#         :param item
#         - **token**: str = user token
#         - **sthreefilesId**: str = target sthreefile id
#
#         \f
#     """
#     response.status_code, result = manageLabelingClass.getMongoSthreeFile(token, sthreefilesId)
#     return result


@router.get("/labels/{label_id}/")
def getLabel(response: Response, token: str, label_id: str):
    """
        `Get Label`

        :param item
        - **token**: str = user token
        - **label_id**: str = target label class id
        - **labelproject_id**: str = label's labelproject id

        \f
    """
    response.status_code, result = manageLabelingClass.getLabel(token, label_id)
    return result


@router.get("/prepare-labels-count-and-price")
def get_prepare_labels_count_and_price(response: Response, token: str, label_project_id: int):
    """
        `Get Labels by Label Project Id`

        :param item
        - **token**: str = user token
        - **label_project_id**: str = target label project id

        \f
    """
    response.status_code, result = manageLabelingClass.get_prepare_labels_count_and_price(token, label_project_id)
    return result


@router.post("/export-coco/{labelProjectId}/")
async def exportCoCo(response: Response, background_tasks: BackgroundTasks, token: str, labelProjectId: str, is_get_image: bool = False):
    """
        `Export Coco Data`

        :param item
        - **token**: str = user token
        - **labelProjectId**: str = target label project id
        - **is_get_image**: bool = true: contains image_data, false: only json files

        \f
    """
    response.status_code, result = CheckDataset().asyncExportCoCo(token, background_tasks, labelProjectId, is_get_image)
    return result

class UpdateVoiceLabelingObject(BaseModel):
    token: str
    voice_label_id: str
    transcript: str = None

@router.put("/voice-labeling/")
async def put_voice_labeling(response: Response, update_voice_labeling_object: UpdateVoiceLabelingObject):
    response.status_code, result = manageLabelingClass.update_voice_label_data(update_voice_labeling_object)
    return result

@router.get("/voice-labeling/")
async def voice_labeling(response: Response, token: str):
    response.status_code, result = manageLabelingClass.get_voice_label_data(token)
    return result

@router.get("/voice-labeling/{voice_label_id}/")
async def voice_labeling(response: Response, voice_label_id: str, token: str):
    response.status_code, result = manageLabelingClass.get_one_voice_label_data(token, voice_label_id)
    return result

@router.post("/export-data/{labelProjectId}/")
async def exportData(response: Response, background_tasks: BackgroundTasks, token: str, labelProjectId: str):
    """
        `Export Coco Data`

        :param item
        - **token**: str = user token
        - **labelProjectId**: str = target label project id
        - **is_get_image**: bool = true: contains image_data, false: only json files

        \f
    """
    response.status_code, result = CheckDataset().async_export_data(token, background_tasks, labelProjectId)
    return result

class ReqCreateCustomObject(BaseModel):
    labelproject_id: int
    custom_ai_type: str
    use_class_info: dict = {}
    valueForPredictColumnId: int = None
    trainingColumnInfo: dict = {}


@router.post("/customai/")
def createCustomAi(response: Response, background_tasks: BackgroundTasks, token: str, reqCreateCustomObject: ReqCreateCustomObject):
    """
        `Create Custom Ai`

        :param item
        - **token**: str = user token

        :json item
        - **custom_ai_type**: str = labeling type. Example, "polygon" or "box"
        - **use_class_info**: dict = labelClass to use for Autolabeling
        - **labelproject_id**: int = target label project id

        \f
    """
    response.status_code, result = manageLabelingClass.create_custom_ai_project(
        token,
        background_tasks,
        reqCreateCustomObject.labelproject_id,
        reqCreateCustomObject.custom_ai_type,
        reqCreateCustomObject.use_class_info,
        reqCreateCustomObject.valueForPredictColumnId,
        reqCreateCustomObject.trainingColumnInfo
    )
    return result


class ReqSelectBestModel(BaseModel):
    labelproject_id: int

@router.get("/list-sample/")
def get_sample_list(response: Response, token: str, labelproject_id: str, project_id: str):
    """
        `Get Custom AI Sample Model List`

        :param item
        - **token**: str = user token
        - **labelproject_id**: str = target label project id
        - **project_id**: str = target project id

        \f
    """
    response.status_code, result = manageLabelingClass.get_sample(token, labelproject_id, project_id)
    return result


class ReqSelectBestModel(BaseModel):
    labelproject_id: int
    project_id: int
    sample_info: dict


@router.put("/selected-sample-result/")
def select_best_custom_ai(response: Response, token: str, reqSelectBestModel: ReqSelectBestModel):
    """
        `Select Best Custom Ai`

        :param item
        - **token**: str = user token

        :json item
        - **labelproject_id**: int = label project id
        - **project_id**: int = project id
        - **sample_info**: dict = sample info

        \f
    """
    response.status_code, result = manageLabelingClass.update_best_custom_ai(token, reqSelectBestModel)

    return result


class LabelclassObject(BaseModel):
    name: str = None
    color: str = None
    labelproject: int = None


@router.post("/labelclasses/")
def createLabelclasses(response: Response, token: str, labelclassObject: LabelclassObject):
    """
        `Create LabelClasses`

        :param item
        - **token**: str = user token

        :json item
        - **name**: str = name to change
        - **color**: str = color to change
        - **labelProjectId**: int = target label project id

        \f
    """
    response.status_code, result = manageLabelingClass.createLabelclass(token, labelclassObject)
    return result


@router.get("/labelclasses/{labelclassesId}/")
def getLabelclass(response: Response, token: str, labelclassesId: str):
    """
        `Get LabelClasses`

        :param item
        - **token**: str = user token
        - **labelclassesId**: str = target label class id

        \f
    """
    response.status_code, result = manageLabelingClass.getLabelclass(token, labelclassesId)
    return result

@router.get("/labelclasses/")
def getLabelclasses(response: Response, token: str, labelproject_Id: int, page: int = 1, count: int = 10):
    """
        `Get LabelClasses`

        :param item
        - **token**: str = user token
        - **labelclassesId**: str = target label class id

        \f
    """
    response.status_code, result = manageLabelingClass.getLabelclasses(token, labelproject_Id, page, count)
    return result


class LabelclassUpdateInfo(BaseModel):
    name: str = None
    color: str = None
    labelclassId: int


@router.put("/labelclasses/")
def updateLabelclasses(response: Response, token: str, labelProjectId: int, labelclassObject: List[LabelclassUpdateInfo]):
    """
        `Update LabelClasses`

        :param item
        - **token**: str = user token
        - **labelProjectId**: int = target label project id

        :json item
        - **name**: str = name to change
        - **color**: str = color to change
        - **labelclassId**: int = target label class id

        \f
    """
    response.status_code, result = manageLabelingClass.updateLabelclasses(token, labelclassObject, labelProjectId)
    return result


@router.delete("/labelclasses/")
def deleteLabelclass(response: Response, token: str, labelclass_ids: List[int], labelproject_id: int):
    """
        `Delete LabelClasses`

        :param item
        - **token**: str = user token
        - **labelclass_ids**: List[int] = delete target label class ids

        \f
    """
    response.status_code, result = manageLabelingClass.deleteLabelclasses(token, labelclass_ids, labelproject_id)
    return result


class LabelclassInfo(BaseModel):
    name: str = None
    color: str = None

@router.put("/labelclasses/{labelclassId}/")
def updateLabelclass(response: Response, token: str, labelclassId, labelclassObject: LabelclassInfo):
    """
        `Update LabelClasses`

        :param item
        - **token**: str = user token

        :json item
        - **name**: str = name to change
        - **color**: str = color to change

        \f
    """
    response.status_code, result = manageLabelingClass.updateLabelclass(token, labelclassId, labelclassObject)
    return result


@router.delete("/labelclasses/{labelclassId}/")
def deleteLabelclass(response: Response, token: str, labelclassId):
    """
        `Delete LabelClasses`

        :param item
        - **token**: str = user token
        - **labelclass_ids**: List[int] = delete target label class ids

        \f
    """
    response.status_code, result = manageLabelingClass.deleteLabelclass(token, labelclassId)
    return result

class AutoLabelRequestModel(BaseModel):
    autolabeling_ai_type: str
    labelproject_id: int
    # preprocessing_ai_class: dict
    autolabeling_amount: int
    preprocessing_ai_type: dict = {}
    autolabeling_type: str = None
    model_id: int = None
    custom_ai_stage: int = 0
    general_ai_type: str = None
    inference_ai_type: str = None
    labeling_class: List[str] = None


@router.post("/autolabeling/")
def createAutoLabeling(response: Response, token: str, autoLabelObject: AutoLabelRequestModel):
    """
        `Create AutoLabeling`

        :param item
        - **token**: str = user token

        :json item
        - **autolabeling_ai_type**: int =  autolabelingAiType (For example, custom or general or inference)
        - **labelproject_id**: int = labelprojectId
        - **autolabeling_type**: str = autolabeling type (For example, box or polygon)
        - **custom_ai_stage**: int = CustomAi Count
        - **general_ai_type**: str = None or generalAiType (For example person or road or animal or fire)
        - **inference_ai_type**: str = None or inferenceAiType (For example person or road or animal or fire)
        - **preprocessing_ai_class**: dict = autolabeling preprocessingType. For example, {"faceblur": true}
        - **autolabeling_amount**: int = Number of images to autolabeling

        \f
    """
    response.status_code, result = manageLabelingClass.autolabeling(token, autoLabelObject)
    return result


class PostContourRequestModel(BaseModel):
    labelproject_id: int
    file_id: str
    x1: int
    y1: int
    x2: int
    y2: int
    threshold: float = None
    contour_type: int = None
    pre_threshold: float = None


@router.post("/predict/contour/")
def get_contour(
        response: Response,
        token: str,
        contour_request: PostContourRequestModel
):
    """
        `Get Contour`

        :param item
        - **token**: str = user token

        :json item
        - **labelproject_id**: str = labelproject id
        - **file_id**: str = file id
        - **x1**: int = pos x1
        - **y1**: int = pos y1
        - **x2**: int = pos x2
        - **y2**: int = pos y2
        - **threshold**: float = threshold, default is 0.35 and value range is (0.0 ~ 1.0)
        - **contour_type**: int = method type, default is 0, allow only next values (TYPE1 = 0, TYPE2 = 1, TYPE3 = 2)
        - **pre_threshold**: float = threshold of pre_model, supported only when contour_type is 2 (TYPE3),
                                     default is 0.7 and value range is (0.0 ~ 1.0)

        \f
    """

    workapp = "object_detection"
    response.status_code, sthree_file = manageLabelingClass.getSthreeFile(
        token,
        contour_request.file_id,
        contour_request.labelproject_id,
        workapp
    )

    if response.status_code != HTTP_200_OK:
        return sthree_file

    contour = predict_contour.PredictContour()
    response.status_code, result = contour.get_contour_by_s3_file(
        sthree_file_info=sthree_file,
        x1=contour_request.x1,
        y1=contour_request.y1,
        x2=contour_request.x2,
        y2=contour_request.y2,
        threshold=contour_request.threshold if contour_request.threshold else 0.35,
        contour_type=contour_request.contour_type if contour_request.contour_type else 0,
        pre_threshold=contour_request.pre_threshold if contour_request.pre_threshold else 0.7,
    )

    return result


class PutContourRequestModel(BaseModel):
    labelproject_id: int
    file_id: str
    x1: int
    y1: int
    x2: int
    y2: int
    contour_points: list
    positive_points: list = None
    negative_points: list = None
    threshold: float = None
    priority: str = None


@router.put("/predict/contour/")
def update_contour(response: Response, token: str, contour_request: PutContourRequestModel):
    """
        `Update contour with Positive & Negative point`

        :param item
        - **token**: str = user token

        :json item
        - **labelproject_id**: int = labelproject id
        - **file_id**: str = file id
        - **x1**: int = pos x1
        - **y1**: int = pos y1
        - **x2**: int = pos x2
        - **y2**: int = pos y2
        - **contour_points**: list, contour points
        - **positive_points**: list, image point = ()
        - **negative_points**: list = ()
        - **threshold**: float = threshold, default is 0.35 and value range is (0.0 ~ 1.0)
        - **priority**: str = priority among positives and negatives ('positive' and 'negative')

        \f
    """

    workapp = "object_detection"
    response.status_code, sthree_file = manageLabelingClass.getSthreeFile(
        token,
        contour_request.file_id,
        contour_request.labelproject_id,
        workapp
    )

    if response.status_code != HTTP_200_OK:
        return sthree_file

    contour = predict_contour.PredictContour()
    positive_point = contour_request.positive_points if contour_request.positive_points else ()
    negative_points = contour_request.negative_points if contour_request.negative_points else ()
    threshold = contour_request.threshold if contour_request.threshold else 0.35
    priority = contour_request.priority if contour_request.priority else 'negative'

    response.status_code, result = contour.update_contour_with_points(
        sthree_file_info=sthree_file,
        x1=contour_request.x1,
        y1=contour_request.y1,
        x2=contour_request.x2,
        y2=contour_request.y2,
        contour_points=contour_request.contour_points,
        positive_points=positive_point,
        negative_points=negative_points,
        threshold=threshold,
        priority=priority,
    )

    return result


class PostObjectLAreaRequestModel(BaseModel):
    labelproject_id: int
    file_id: str
    x1: int
    y1: int
    x2: int
    y2: int
    threshold: float = 0.4


@router.post("/predict/contour/object-area/")
def get_object_area(response: Response, token: str, object_request: PostObjectLAreaRequestModel):
    """
        `Get object area`

        :param item
        - **token**: str = user token

        :json item
        - **labelproject_id**: int = labelproject id
        - **file_id**: str = file id
        - **x1**: int = pos x1
        - **y1**: int = pos y1
        - **x2**: int = pos x2
        - **y2**: int = pos y2
        - **threshold**: float = threshold, default is 0.4 and value range is (0.0 ~ 1.0)

        \f
    """

    workapp = "object_detection"
    response.status_code, sthree_file = manageLabelingClass.getSthreeFile(
        token,
        object_request.file_id,
        object_request.labelproject_id,
        workapp
    )

    if response.status_code != HTTP_200_OK:
        return sthree_file

    contour = predict_contour.PredictContour()
    threshold = object_request.threshold if object_request.threshold else 0.4

    response.status_code, result = contour.get_object_area(
        sthree_file_info=sthree_file,
        x1=object_request.x1,
        y1=object_request.y1,
        x2=object_request.x2,
        y2=object_request.y2,
        threshold=threshold,
    )

    return result


@router.post("/export-voc/{label_project_id}/")
async def export_voc(response: Response, background_tasks: BackgroundTasks, token: str, label_project_id: str, is_get_image: bool = False):
    """
        `Export Voc Data`

        :param item
        - **label_project_id**: str = target label project id
        - **token**: str = user token
        - **is_get_image**: bool = true: contains image_data, false: only xml files

        \f
    """
    response.status_code, result = CheckDataset().async_export_voc(token, background_tasks, label_project_id, is_get_image)
    return result


class RequestInfo(BaseModel):
    labelprojectId: int
    phoneNumber: str
    description: str
    labelType: str
    labelCount: int
    price: int


@router.post("/request-inspection/")
def request_inspection(response: Response, token: str, request_info: RequestInfo):
    """
        `Request Inspection`

        :param item
        - **token**: str = user token

        :json item
        - **label_project_id**: dict = target label project id
        - **phoneNumber**: str = user phone number ex) 01012341234 (required)
        - **description**: str = description
        - **price**: int = total price
        - **labelCount**: int = label count

        \f
    """
    response.status_code, result = manageLabelingClass.request_inspection(token, request_info)
    return result

@router.get("/industry_ai/")
def get_industry_ais(response: Response, token: str):
    """
        `Get Industry AI`

        :param item
        - **token**: str = user token

        \f
    """
    response.status_code, result = manageLabelingClass.get_industry_ais(token)
    return result


# @router.post("/export-label-project/{label_project_id}/")
# async def export_label_project(response: Response, token: str, label_project_id: str):
#     asyncio.ensure_future(CheckDataset().async_export_label_project(token, label_project_id))
#     result = {}
#     response.status_code = 200
#     return result


@router.get("/label-types-prices/")
def get_label_types_prices(response: Response, token: str):
    """
        `Get Label Types Prices`

        :param item
        - **token**: str = user token

        \f
    """
    response.status_code, result = manageLabelingClass.label_types_prices(token)
    return result

@router.post("/datascientist/workassignee/")
def grant_workAssignee(response: Response, key: str = Form(...), passwd: str = Form(...), label_project_id: int = Form(...), target_file_status: str = Form("review"), grand_user: str = Form(...), is_grant: bool = Form(...), count: int = Form(None)):
    """
                ## 작업물 분배, 회수 하는 엔드포인트입니다. 분배는 상태가 review이면서 작업자가 없는 이미지만 해당됩니다.

                :param item
                - **key**: str = 본인의 인증 key를 넣어주세요 \n
                - **passwd**: str =  본인의 패스워드를 입력해주세요 \n
                - **label_project_id**: str = 작업물을 분배 또는 회수 할 라벨프로젝트를 입력해주세요 \n
                - **grand_user**: str = 작업물을 분배 또는 회수당할 작업자 이메일을 입력해주세요 \n
                - **is_grant**: bool = 위에서 입력한 작업자의 작업물을 True이면 분배(추가) False면 회수합니다. \n
                - **count**: int = 입력을 안해줄시 모든 review 이미지가 위에서 입력한 작업자에게 분배됩니다. 숫자를 넣어줄 시 숫자만큼 분배됩니다.
                - **target_file_status**: int = 배분또는 회수하려는 대상 이미지의 상태값을 적어주세요. (시작전 - prepare, 작업중 - working, 검수중 - review, 완료 - done)
                \f
        """
    response.status_code, result = manageDataAnalyze.grant_workAssignee(key, passwd, label_project_id, grand_user, is_grant, count, target_file_status)
    return result

@router.post("/datascientist/export-coco/")
def export_coco_for_datascientist(response: Response, key: str = Form(...), passwd: str = Form(...), label_project_id: int = Form(...), is_download_image: bool = Form(...)):
    """
                ## 클래스별 coco dataset 추출하는 엔드포인트입니다.

                :param item
                - **key**: str = 본인의 인증 key를 넣어주세요 \n
                - **passwd**: str =  본인의 패스워드를 입력해주세요 \n
                - **label_project_id**: str = coco 데이터를 추출 할 라벨프로젝트를 입력해주세요 \n
                - **is_download_image**: str = 이미지도 함께 다운을받을지를 정하는 파라미터입니다. True일시 이미지도 함께 False일시 coco파일만 저장됩니다. \n
                \f
        """
    response.status_code, result = manageDataAnalyze.export_coco_for_data_scientist(key, passwd, label_project_id, is_download_image)
    return result

@router.post("/datascientist/update-file-status/")
def update_file_status(response: Response, key: str = Form(...), passwd: str = Form(...), label_project_id: int = Form(...), pre_status: str = Query('prepare', enum=['prepare', 'working', 'reject', 'ready', 'review', 'done']), post_status: str =  Query('prepare', enum=['prepare', 'working', 'ready', 'reject', 'review', 'done']), only_no_label: bool = Form(False), is_delete_label: bool = Form(True), label_class_name: str = Form(None), count: int = Form(None)):
    """
                ## 파일의 상태를 변경하는 엔드포인트입니다. 조건 설정에 유의해주세요.

                :param item
                - **key**: str = 본인의 인증 key를 넣어주세요. \n
                - **passwd**: str =  본인의 패스워드를 입력해주세요. \n
                - **label_project_id**: int = 상태를 변경할 라벨프로젝트를 입력해주세요. \n
                - **pre_status**: str = 변경 전 상태를 입력해주세요. \n
                - **post_status**: str = 변경 후 상태를 입력해주세요. \n
                - **only_no_label**: bool = 라벨링 안된 파일의 상태만 변경하려는 경우 True로 입력해주세요. \n
                - **is_delete_label**: bool = 해당 파일의 라벨링 데이터도 함께 삭제하려는 경우 True로 입력해주세요. \n
                - **label_class_name**: str = 특정 라벨 클래스가 포함된 파일의 상태만 변경하려는 경우 라벨 클래스를 입력해주세요. 대소문자 구분이 없습니다. \n
                - **count**: int = 변경할 파일 수 입니다. 빈 값으로 보낼 시 전체 파일에 적용됩니다.
                \f
        """

    response.status_code, result = manageDataAnalyze.update_file_status(key, passwd, label_project_id, pre_status, post_status, only_no_label, is_delete_label, label_class_name, count)
    return result

@router.post("/datascientist/lookup-count/")
def get_count_by_label(response: Response, key: str = Form(...), passwd: str = Form(...), label_project_id: int = Form(...), label_class_name: str = Form(None)):
    """
            ## 라벨링 된 파일 수를 조회하는 엔드포인트입니다. 특정 라벨 이름을 입력해 조회할 수 있습니다.

            :param item
                - **key**: str = 본인의 인증 key를 입력합니다. \n
                - **passwd**: str =  본인의 패스워드를 입력합의니다. \n
                - **label_project_id**: int = 라벨프로젝트 번호를 입력합니다. \n
                - **label_class_name**: str = 라벨 클래스를 입력합니다. \n
                \f
            """

    response.status_code, result = manageDataAnalyze.get_count_by_label(key, passwd, label_project_id, label_class_name)
    return result

@router.post("/datascientist/calculate-amount/")
def get_amount(response: Response, key: str = Form(...), passwd: str = Form(...), label_project_id: int = Form(...), calculate_type: str = Query('all', enum=['all', 'image', 'label']),
               price_per_image: int = Form(0), price_per_label_create: int = Form(0), price_per_label_modify: int = Form(0), price_per_label_delete: int = Form(0)):
    """
            ## 라벨 작업자의 수당을 정산하는 엔드포인트입니다.

            :param item
                - **key**: str = 본인의 인증 key를 입력합니다. \n
                - **passwd**: str =  본인의 패스워드를 입력합니다. \n
                - **label_project_id**: int = 정산할 라벨프로젝트 번호를 입력합니다. \n
                - **calculate_type**: str = 정산하려는 라벨링 종류를 선택합니다. \n
                - **price_per_image**: int = 이미지 당 가격을 입력합니다. \n
                - **price_per_label_create**: int = 생성한 라벨 당 가격을 입력합니다. \n
                - **price_per_label_modify**: int = 수정한 라벨 당 가격을 입력합니다. \n
                - **price_per_label_delete**: int = 삭제한 라벨 당 가격을 입력합니다. \n
                \f
        """

    response.status_code, result = manageDataAnalyze.get_amount(key, passwd, label_project_id, calculate_type,
                                                                price_per_image, price_per_label_create, price_per_label_modify, price_per_label_delete)
    return result
