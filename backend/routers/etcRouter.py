from typing import Optional, List

from fastapi import APIRouter, UploadFile, File, Query
from pytz import timezone
from fastapi import Request
from sse_starlette.sse import EventSourceResponse
from starlette.background import BackgroundTasks

from models.helper import Helper
from src.errorResponseList import NO_SUPPORT_FOR_OPENSOURCE
from src.manageTask import ManageTask
from src.util import Util
from src.manageUser import ManageUser
from src.manageEtc import ManageEtc
from src.manageLabeling import ManageLabeling
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from starlette.responses import Response
from fastapi import Form, Header

import datetime
from src.manageSolution import ManageSolution

router = APIRouter()
utilClass = Util()
manageEtcClass = ManageEtc()
manageLabelingClass = ManageLabeling()
manageUserClass = ManageUser()
manageSolution = ManageSolution()
manageTaskClass = ManageTask()
dbClass = Helper(init=True)

# @router.get("/schema-test/")
# def get_schema_test(response: Response):
#     response.status_code, result = manageEtcClass.get_schema_test()
#
#     return result

# @router.get("/tradier-token/")
# def get_tradier_token(response: Response, code, state):
#
#     response.status_code, result = manageEtcClass.tradier_token_init(code, state)
#     return result

@router.get("/key-status/")
def get_key_status(response: Response):
    response.status_code, result = manageEtcClass.key_status()

    return result

@router.get("/news/")
def getNews(type: str, response: Response, count : int = 10, page : int = 1):
    response.status_code, result = manageEtcClass.getNews(type, count, page)
    return result

class RegisterKeyObject(BaseModel):
    key: str

@router.post("/register-key/")
def register_key(response:Response, register_key_object:RegisterKeyObject):
    response.status_code, result = manageEtcClass.register_enterprise_key(register_key_object.key)
    return result

@router.post("/register-trial/")
def register_key(response:Response):
    response.status_code, result = manageEtcClass.register_trial()
    return result

class OrderCoinObject(BaseModel):
    access: str
    secret: str
    price: int
    ticker: str
    price_type: int
    volume: int = 0
    exchange_type: str = "upbit"

@router.post("/buy-coin/")
def buy_bithumb_coin(response: Response, order_coin_object: OrderCoinObject):
    """
        ## 매수 엔드포인트
        ```python
        # Parameters (JSON - BODY)
        ----------
        access: str # upbit access key
        secret: str # upbit secret key
        price: int # 주문할 가격 ( 시장가 매수 시 =>코인을 price 만큼 매수, 지정가 매수 시 price * volume 만큼 매수)
        ticker: str # 코인 종목 Ex. 업비트 : "KRW-BTC" 빗썸 : "BTC"
        price_type: int # 1은 지정가 매수, 0은 시장가 매수
        volume: int # 시장가 매수시는 사용 X
        -------
        ```
    """

    if order_coin_object.exchange_type == 'upbit':
        response.status_code, result = manageEtcClass.buy_coin(order_coin_object)
    # elif order_coin_object.exchange_type == 'bithumb':
    #     response.status_code, result = manageEtcClass.buy_bithumb_coin(order_coin_object)
    return result

@router.post("/sell-coin/")
def sell_upbit_coin(response: Response, order_coin_object: OrderCoinObject):
    """
            ## 매도 엔드포인트
            ```python
            # Parameters (JSON - BODY)
            ----------
            access: str # upbit access key
            secret: str # upbit secret key
            price: int # 주문할 가격 ( 시장가 매도 시 =>코인을 price 만큼 매도, 지정가 매도 시 price * volume 만큼 매도)
            ticker: str # 코인 종목 Ex. 업비트 : "KRW-BTC" 빗썸 : "BTC"
            price_type: int # 1은 지정가 매도, 0은 시장가 매도
            volume: int # 시장가 매도시는 사용 X
            -------
            ```
        """

    if order_coin_object.exchange_type == 'upbit':
        response.status_code, result = manageEtcClass.sell_coin(order_coin_object)
    # elif order_coin_object.exchange_type == 'bithumb':
    #     response.status_code, result = manageEtcClass.sell_bithumb_coin(order_coin_object)
    return result

@router.post("/get-balance/")
def get_upbit_balance(response: Response, access: str, secret: str, ticker:str, exchange_type:str='upbit'):
    """
            ## 잔고 확인 엔드포인트
            ```python
            # Query
            ----------
            access: str # upbit access key
            secret: str # upbit secret key
            ticker: str # 잔고를 확인 할 코인 종목 Ex.업비트 : "KRW-BTC, 빗썸 : BTC
            -------
            ```
        """
    if exchange_type == 'upbit':
        response.status_code, result = manageEtcClass.get_balance(access, secret, ticker)
    # elif exchange_type == 'bithumb':
    #     response.status_code, result = manageEtcClass.get_bithumb_balance(access, secret, ticker)

    return result

@router.post("/get-current-price/")
def get_upbit_current_price(response: Response, ticker:str, exchange_type:str='upbit'):
    """
            ## 코인 현재 가격 조회 엔드포인트
            ```python
            # Qeury
            ----------
            ticker: str # 코인 종목 Ex. "KRW-BTC"
            -------
            ```
        """

    if exchange_type == 'upbit':
        response.status_code, result = manageEtcClass.get_current_price(ticker)
    # elif exchange_type == 'bithumb':
    #     response.status_code, result = manageEtcClass.get_bithumb_current_price(ticker)
    return result
@router.post("/contact/")
def add_contact(response: Response,
               name: str = Form(...), email: str = Form(...), message: str = Form(...),
               company: str = Form(None), position: str = Form(None), phone: str = Form(None),
               utmSource: str = Form(None), utmMedium: str = Form(None), utmCampaign: str = Form(None),
               utmTerm: str = Form(None), utmContent: str = Form(None), ):

    KST = timezone('Asia/Seoul')
    now = datetime.datetime.utcnow()

    contactInfo = {
        'name': name,
        'email': email,
        'message': message,
        'company': company,
        'position': position,
        'phone': phone,
        'utmSource': utmSource,
        'utmMedium': utmMedium,
        'utmCampaign': utmCampaign,
        'utmTerm': utmTerm,
        'utmContent': utmContent,
        'created_at': KST.localize(now),
        'updated_at': KST.localize(now)
    }

    response.status_code, result = manageEtcClass.addContact(contactInfo)

    return result

class ContactObject(BaseModel):
    name: str
    email: str
    message: str = None
    company: str = None
    position: str = None
    phone: str = None
    utmSource: str = None
    utmMedium: str = None
    utmCampaign: str = None
    utmTerm: str = None
    utmContent: str = None


@router.get("/main-page/")
def get_main_page_info(response: Response, token: str):
    response.status_code, result = manageEtcClass.main_page(token)

    return result

@router.post("/contactv2/")
def add_contact_v2(response: Response, contactObject: ContactObject):

    KST = timezone('Asia/Seoul')
    now = datetime.datetime.utcnow()
    contactInfo = contactObject.__dict__
    contactInfo['created_at'] = KST.localize(now)
    contactInfo['updated_at'] = KST.localize(now)

    response.status_code, result = manageEtcClass.addContact(contactInfo)

    return result

@router.get("/asynctask/")
def getAsyncTask(response: Response, token: str, provider: str = 'DS2.ai'):
    response.status_code, result = manageTaskClass.getAsyncTasks(token, provider)
    return result

@router.get("/sse/asynctask/")
async def getAsyncTask(request: Request, token: str, provider: str = 'DS2.ai', status: int = None):
    return EventSourceResponse(manageTaskClass.get_async_tasks(token, provider, request, status))

@router.get("/asynctaskall/")
def getAsyncTaskAll(response: Response, token: str, provider: str = 'DS2.ai', start: int = 1, count: int = 10, taskType: str = None, label_project_id = None, market_project_id=None):
    response.status_code, result = manageTaskClass.getAsyncAllTasks(token, provider, start, count, taskType, label_project_id, market_project_id=market_project_id)
    return result

@router.get("/asynctasks/{asnyctaskId}/")
def getAsyncTaskById(asnyctaskId: int, token: str, response: Response):
    response.status_code, result = manageTaskClass.getAsyncTask(token, asnyctaskId)
    return result


class AsyncTaskModel(BaseModel):
    status: int = None
    working_on: str = None
    previous_status: int = None
@router.put("/asynctask/{asnyctaskId}/")
def updateAsyncTask(asnyctaskId: int, token: str, response: Response, asyncTaskModel: AsyncTaskModel):
    response.status_code, result = manageTaskClass.putAsyncTasks(token, asnyctaskId, asyncTaskModel)
    return result

@router.delete("/asynctasks/{asnyctaskId}/")
def getAsyncTaskById(asnyctaskId: int, token: str, response: Response):
    response.status_code, result = manageTaskClass.deleteAsyncTask(token, asnyctaskId)
    return result

@router.post("/coffetime/Attendees/")
def getAsyncTaskById(response: Response):
    response.status_code, result = manageEtcClass.get_coffetime_Attendees()
    return result


@router.post("/create_report/")
def post_create_report(response:Response, token: str, project_id: int):
    response.status_code, result = manageEtcClass.create_report(token, project_id)

    return result


@router.post("/upload/external/model/")
async def upload_external_model(response: Response, key: str = Form(...), pass_wd: str = Form(...),
                                description: str = Form(...), user_email: str = Form(...),
                                project_name: str = Form(...), input_data: str = Form(...),
                                company_name: str = Form(...), training_method: str = Form(...),
                                file: UploadFile = File(None), image_file: UploadFile = File(None),
                                name_en: str = Form(...), name_kr: str = Form(...)):

    response.status_code, result = manageEtcClass.upload_external_model(key, pass_wd, user_email, image_file, file, project_name,
                                                                        input_data, training_method, description, company_name, name_en, name_kr)
    return result

class PredictExternalModel(BaseModel):
    app_token: str
    input_data: dict
    k: int = 5

@router.post("/recommand/external/model/{market_project_id}")
async def predict_by_external_model(response: Response, market_project_id: int, predictExternalModel: PredictExternalModel):
    response.status_code, result = manageEtcClass.predict_external_model(market_project_id, predictExternalModel)
    return result

@router.post("/recommand/external/file/model/{market_project_id}")
async def predict_by_external_model(response: Response, market_project_id: int, app_token: str, file_list: List[UploadFile] = File(...)):
    response.status_code, output_file = manageEtcClass.predict_external_model_by_files(market_project_id, file_list, app_token)

    return StreamingResponse(output_file, media_type="text/csv")

@router.post("/coffetime/join/")
def getAsyncTaskById(response: Response, command: Optional[str]= Header(None)):
    print(command)
    # response.status_code, result = manageEtcClass.join_coffe_time(employee_name)
    return command

@router.get("/aws-usages/")
def get_aws_usages(response: Response, userId: int = 832, startDate:str = '2021-05-01', endDate:str = '2021-06-01'):

    deploy_price = 0
    metrics = ['AmortizedCost', 'UsageQuantity', 'UnblendedCost']
    client = utilClass.getBotoClient('ce', region_name=None)
    try:
        aws_response = client.get_cost_and_usage(
            TimePeriod={
                'Start': startDate,
                'End': endDate
            },
            Metrics=metrics,
            Granularity='MONTHLY',
            Filter={
                'CostCategories': {
                    'Key': 'userIdCostCategory',
                    'Values': [
                        str(userId)
                    ],
                }
            }
        )
        response_data = aws_response['ResultsByTime']
        for month_idx in range(len(response_data)):
            response_month = response_data[month_idx]['Total']
            for metric in metrics:
                deploy_price += float(response_month[metric]['Amount'])
        result = deploy_price
    except Exception as e:
        result = e

    response.status_code = 200

    return result

@router.post("/voucher/", tags=['business'])
def add_voucher_user(response: Response,
                     key: str = Form(...),
                     passwd: str = Form(...),
                     company: str = Form(...),
                     voucher_email: str = Form(...),
                     voucher_type: str = Form(...),
                     is_recharge: bool = Form(True),
                     charge_deposit: float = Form(...),
                     start_date: str = Form(...),
                     end_date: str = Form(...),
                     manager_email: str = Form(...)
                     ):

    """
            ## 바우처 고객 추가하는 엔드포인트입니다.

            :param item
            - **key**: str = 인증 key \n
            - **passwd**: str =  인증 패스워드 \n
            - **company**: str = 바우처 고객명 \n
            - **voucher_email**: str = 바우처 고객의 솔루션 계정 이메일 \n
            - **voucher_type**: str = 바우처 계약명(Ex. 2021년 비대면 바우처) \n
            - **is_recharge**: bool = 매월 크레딧 갱신 여부 \n
            - **charge_deposit**: float = 크레딧 충전 금액\n
            - **start_date**: str = 이용 시작일(Ex. 2020-01-01) \n
            - **end_date**: str = 이용 종료일(Ex. 2020-12-31) \n
            - **manager_email**: str = 담당 매니저의 솔루션 계정 이메일 \n

            \f
    """

    response.status_code, result = manageEtcClass.add_voucher_user(key,
                                                                   passwd,
                                                                   company,
                                                                   voucher_email,
                                                                   voucher_type,
                                                                   is_recharge,
                                                                   charge_deposit,
                                                                   start_date,
                                                                   end_date,
                                                                   manager_email)

    return result

@router.post("/voucher/retrieve/", tags=['business'])
def get_voucher_user(response: Response,
                     key: str = Form(...),
                     passwd: str = Form(...),
                     voucher_email: str = Form(None),
                     is_recharge: bool = Form(None),
                     is_used: bool = Form(None),
                     order_by: str = Query('id', enum=['id', 'voucher_type', 'start_date', 'end_date'])):
    """
            ## 바우처 고객 리스트를 조회하는 엔드포인트입니다.

            :param item
            - **key**: str = 인증 key \n
            - **passwd**: str =  인증 패스워드 \n
            - **voucher_email**: str = 특정 바우처만 조회할 경우, 해당 고객의 솔루션 계정 이메일 \n
            - **is_recharge**: bool = True: 매월 충전되는 바우처 고객만 조회, False: 충전되지 않는 바우처 고객만 조회, None: 전체 조회 \n
            - **is_used**: bool = True: 현재 이용 중인 바우처 고객만 조회, False: 이용 종료된 바우처 고객만 조회, None: 전체 조회 \n
            - **order_by**: str =  정렬 기준 \n

            \f
    """
    response.status_code, result = manageEtcClass.get_voucher_user(key, passwd, voucher_email, is_recharge, is_used, order_by)

    return result

@router.delete("/voucher/", tags=['business'])
def delete_voucher_user(response: Response, key: str = Form(...), passwd: str = Form(...), voucher_id: str = Form(...)):
    """
            ## 바우처 고객 정보를 삭제하는 엔드포인트입니다.

            :param item
            - **key**: str = 인증 key \n
            - **passwd**: str =  인증 패스워드 \n
            - **voucher_id**: int = 바우처 고객의 ID(바우처 조회에서 ID 확인 가능) \n

            \f
    """
    response.status_code, result = manageEtcClass.delete_voucher_user(key, passwd, voucher_id)

    return result

class ApiSampleClass(BaseModel):
    model_id: str
    input_data: dict
    app_token: str

@router.post("/voucher/api-code/", tags=['business'])
def create_voucher_api_code(response: Response, api_sample_class: ApiSampleClass):
    response.status_code, result = manageEtcClass.create_voucher_sample_api(api_sample_class.model_id,
                                                                         api_sample_class.input_data,
                                                                         api_sample_class.app_token)

    return StreamingResponse(result, media_type="text/py")

@router.put("/voucher/", tags=['business'])
def update_voucher_user(response: Response,
                        key: str = Form(...),
                        passwd: str = Form(...),
                        voucher_id: int = Form(...),
                        company: str = Form(None),
                        voucher_email: str = Form(None),
                        voucher_type: str = Form(None),
                        is_recharge: bool = Form(None),
                        charge_deposit: float = Form(None),
                        used_deposit: float = Form(None),
                        start_date: str = Form(None),
                        end_date: str = Form(None),
                        manager_email: str = Form(None)
                        ):
    """
            ## 바우처 고객 정보를 수정하는 엔드포인트입니다.

            :param item
            - **key**: str = 인증 key \n
            - **passwd**: str =  인증 패스워드 \n
            - **voucher_id**: int =  수정할 바우처 ID(바우처 조회에서 ID 확인 가능) \n
            - **company**: str = 바우처 고객명 \n
            - **voucher_email**: str = 바우처 고객의 솔루션 계정 이메일 \n
            - **voucher_type**: str = 바우처 계약명(Ex. 2021년 비대면 바우처) \n
            - **is_recharge**: bool = 매월 크레딧 갱신 여부 \n
            - **charge_deposit**: float = 크레딧 충전 금액\n
            - **used_deposit**: float = 크레딧 사용 금액\n
            - **start_date**: str = 이용 시작일(Ex. 2020-01-01) \n
            - **end_date**: str = 이용 종료일(Ex. 2020-12-31) \n
            - **manager_email**: str = 담당 매니저의 솔루션 계정 이메일 \n

            \f
    """

    response.status_code, result = manageEtcClass.update_voucher_user(key,
                                                                      passwd,
                                                                      voucher_id,
                                                                      company,
                                                                      voucher_email,
                                                                      voucher_type,
                                                                      is_recharge,
                                                                      charge_deposit,
                                                                      used_deposit,
                                                                      start_date,
                                                                      end_date,
                                                                      manager_email)

    return result

class FeedbackObject(BaseModel):
    feedback_email: str
    feedback_type: str
    feedback_content: str

@router.post("/feedback/")
async def post_feedback(response: Response, feedback_object: FeedbackObject):
    response.status_code, result = manageEtcClass.send_slack_for_feedback(feedback_object)
    return result


class TrainingServerObject(BaseModel):
    ip: str
    access_token: str

@router.post("/training-servers/")
async def post_training_servers(token: str, response: Response, training_server_object: TrainingServerObject):
    try:
        from src.creating.manageTeam import ManageTeam
    except:
        return NO_SUPPORT_FOR_OPENSOURCE
    response.status_code, result = ManageTeam().create_training_server(token, training_server_object)
    return result

class ConnectingTrainingServerObject(BaseModel):
    ip: str
    access_token: str
    public_key: str

@router.post("/connect-training-servers/")
async def post_connect_training_servers(response: Response,
                                        connect_training_server_object: ConnectingTrainingServerObject,
                                        background_tasks: BackgroundTasks):
    try:
        from src.creating.manageTeam import ManageTeam
    except:
        return NO_SUPPORT_FOR_OPENSOURCE
    response.status_code, result = ManageTeam().connect_training_server(connect_training_server_object, background_tasks)
    return result

@router.delete("/training-servers/{training_server_name}/")
async def delete_training_servers(training_server_name: str, token: str, response: Response):
    try:
        from src.creating.manageTeam import ManageTeam
    except:
        return NO_SUPPORT_FOR_OPENSOURCE
    response.status_code, result = ManageTeam().delete_training_server(token, training_server_name)
    return result

@router.delete("/connect-training-servers/{main_server_ip}/")
async def delete_training_servers(main_server_ip: str, access_token:str, response: Response, background_tasks: BackgroundTasks):
    try:
        from src.creating.manageTeam import ManageTeam
    except:
        return NO_SUPPORT_FOR_OPENSOURCE
    response.status_code, result = ManageTeam().delete_connected_training_server(access_token, main_server_ip, background_tasks)
    return result


@router.get("/triton-healty-check/")
async def check_triton_healty(response: Response, token: str):
    response.status_code, result = manageEtcClass.check_triton_healty(token)
    return result