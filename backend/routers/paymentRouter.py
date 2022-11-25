import requests
import json

from fastapi import APIRouter, Form
from src.manageLabeling import ManageLabeling
from src.util import Util

from src import manageUser
from src.managePayment import ManagePayment
from pydantic import BaseModel
from starlette.responses import Response, HTMLResponse

router = APIRouter()
utilClass = Util()
manageLabelingClass = ManageLabeling()
managePayment = ManagePayment()

# usageplan 변경시 basic -> business 는 바로 변경, business -> basic 은 nextPaymentDate 불러와서 +1 시켜줘야됨
class PayAdditionalUnit(BaseModel):
    unitName: str = None
    unitCnt: int = None

@router.put("/pay-additional-unit/")
def pay_additional_unit(item: PayAdditionalUnit, token: str, response: Response):

    response.status_code, result = manageUser.ManagePayment().payAdditionalUnit(token, item.unitName, item.unitCnt)

    return result

@router.delete("/deletefutureplan/")
def deleteFuturePlan(token: str, response: Response):
    response.status_code, result = manageUser.ManagePayment().deleteFuturePlan(token)

    return result

@router.delete("/deletefuturedyno/")
def deleteFutureDyno(token: str, response: Response):

    response.status_code, result = manageUser.ManagePayment().deleteFutureDyno(token)

    return result

@router.post("/requestRefund/")
def requestRefund(token: str, response: Response):

    response.status_code, result = managePayment.requestRefund(token)

    return result

# class PaypalTransaction(BaseModel):
#     orderID: str = None
#
# @router.post("/paypal-transaction-complete/")
# def paypal_tran_complete(response: Response, token: str, paypalTransaction: PaypalTransaction):
#
#     response.status_code, result = managePayment.ManagePayment().paypal_tran_complete(token, paypalTransaction)
#
#     return result

class PaypleWebhookData(BaseModel):
    PCD_PAY_RST: str = None             #결제결과
    PCD_PAY_CODE: str = None            #결제결과 리턴 코드
    PCD_PAY_MSG: str = None             #결제결과 리턴 메시지
    PCD_PAY_TYPE: str = None            #결제수단 (card)
    PCD_CARD_VER: str = None            #카드 세부 결제방식
    PCD_PAY_WORK: str = None            #결제방식
    PCD_AUTH_KEY: str = None            #파트너 인증 토큰 값
    PCD_PAY_REQKEY: str = None          #(CERT방식) 최종 결제요청 승인키
    PCD_PAY_HOST: str = None            #파트너 인증 후 본 요청시 필요한 페이플 도메인 주소
    PCD_PAY_URL: str = None             #파트너 인증 후 본 요청시 필요한 페이플 도메인 주소
    PCD_PAY_COFURL: str = None          #(CERT방식) 최종 결제요청 URL
    PCD_PAYER_ID: str = None            #카드(계좌)등록 후 리턴받은 빌링키
    PCD_PAYER_NO: str = None            #회원번호
    PCD_PAYER_NAME: str = None          #결제고객의 이름
    PCD_PAYER_HP: str = None            #결제고객의 휴대전화번호
    PCD_PAYER_EMAIL: str = None         #결제고객의 이메일주소
    PCD_PAY_YEAR: str = None            #월 중복결제 년
    PCD_PAY_MONTH: str = None           #월 중복결제 월
    PCD_PAY_OID: str = None             #주문번호
    PCD_PAY_GOODS: str = None           #상품명
    PCD_PAY_AMOUNT: str = None          #결제 요청금액
    PCD_PAY_DISCOUNT: str = None        #페이플 이벤트 할인금액
    PCD_PAY_AMOUNT_REAL: str = None     #실 결제금액
    PCD_PAY_TOTAL: str = None           #결제금액의 총합계
    PCD_PAY_TAXTOTAL: str = None        #과세금액
    PCD_PAY_ISTAX: str = None           #과세여부
    PCD_PAY_CARDNAME: str = None        #카드사
    PCD_PAY_CARDNUM: str = None         #카드번호
    PCD_PAY_CARDQUOTA: str = None       #카드 할부 개월 수
    PCD_PAY_CARDTRADENUM: str = None    #카드승인 거래 키
    PCD_PAY_CARDAUTHNO: str = None      #카드거래 승인번호
    PCD_PAY_CARDRECEIPT: str = None     #신용카드 매출전표 URL
    PCD_PAY_TIME: str = None            #결제완료 시간
    PCD_REGULER_FLAG: str = None        #월 중복결제 방지 사용여부
    PCD_SIMPLE_FLAG: str = None         #페이플 간편결제 방식 선택여부
    PCD_RST_URL: str = None             #결제(요청)결과 RETURN URL / 결제창 호출방식

@router.post("/webhook/payple/")
def license_webhook_payple(webhookdata: PaypleWebhookData):

    managePayment.payple_webhook(webhookdata)

class EximbayWebhookData(BaseModel):
    rescode: str = None          # 결과 코드
    transid: str = None          # 주문 번호
    email: str = None            # 결제 금액

@router.post("/webhook/eximbay/license/")
def license_webhook_eximbay(webhookdata: EximbayWebhookData):

    managePayment.eximbay_license_webhook(webhookdata)

class EximbayLicenseData(BaseModel):
    user_email: str           # 사용자 이메일
    amount: str               # 결제 금액
    return_url: str           # 결제 후 redirect url

@router.post("/license/eximbay/")
def purchase_license_by_eximbay(response: Response, eximbay_data: EximbayLicenseData):

    response.status_code, result = managePayment.eximbay_license_purchase_start(eximbay_data)
    return result

class WebhookData(BaseModel):
    id: str = None
    create_time: str = None
    resource_type: str = None
    event_type: str = None
    summary: str = None
    resource: dict = None
    links: list = None
    event_version: str = None
    zts: str = None
    resource_version: str = None

@router.post("/paypal-webhook/")
def paypal_webhook(response: Response, webhookdata: WebhookData):

    response.status_code, result = managePayment.paypal_webhook(webhookdata)
    return result

class CreditData(BaseModel):
    amount: float = None
    currency: str = None
    front_url: str = None
    items: list = None

@router.post("/purchase-credit/")
def purchase_credit(response: Response, token: str, creditData: CreditData):

    response.status_code, result = managePayment.purchase_credit(token, creditData)

    return result


class WithdrawData(BaseModel):
    credit: float = None
@router.post("/withdraw-credit/")
def purchase_credit(response: Response, token: str, withdrawData: WithdrawData):

    response.status_code, result = managePayment.withdraw_credit(token, withdrawData)

    return result

class PlanData(BaseModel):
    amount: float = None
    currency: str = None
    planId: int = None

@router.post("/purchase-model-plan/")
def purchase_model_plan(response: Response, token: str, planData: PlanData):

    response.status_code, result = managePayment.purchase_model_plan(token, planData)

    return result

@router.post("/eximbay-billing-test/")
def eximbay_registration_billing(response: Response, token: str, price: int = Form(1)):

    response.status_code, result = managePayment.eximbay_billing(token, price)

    return result

@router.post("/eximbay-registration-start/")
def eximbay_registration_start(response: Response, token: str):

    response.status_code, result = managePayment.eximbay_registration_start(token)

    return result

@router.post("/eximbay-registration-redirect/")
def eximbay_registration_redirect(token: str,
                                 rescode: str = Form(...),
                                 resmsg: str = Form(...)):
    result = managePayment.eximbay_registration_redirect(token, rescode, resmsg)

    return HTMLResponse(content=result, status_code=200)

@router.post("/eximbay-registration-end/")
def eximbay_registration_end(token: str,
                             rescode: str = Form(None),
                             resmsg: str = Form(None),
                             tokenID: str = Form(None),
                             cardno1: str = Form(None),
                             cardno4: str = Form(None),
                             ref: str = Form(None),
                             transid: str = Form(None)):

    managePayment.eximbay_registration_end(token,
                                                           rescode,
                                                           resmsg,
                                                           tokenID,
                                                           cardno1,
                                                           cardno4,
                                                           ref,
                                                           transid)

@router.post("/session-start/")
def session_start(response: Response, token: str, url: str = Form(...)):

    response.status_code, result = managePayment.session_start(token, url)

    return result

@router.get("/session-end/")
def session_end(response: Response, token: str):

    response.status_code, result = managePayment.session_end(token)

    return result

@router.post("/purchase-model/")
def purchase_model(response: Response, token: str, projectID: int = Form(...), modelID: int = Form(...),
                  amount: float = Form(...)):

    response.status_code, result = managePayment.purchase_model(token, projectID, modelID, amount)

    return result

@router.get("/payment-intent/")
def payment_intent(response: Response, token: str):

    response.status_code, result = managePayment.payment_intent(token)

    return result

class PgRegistrationInfo(BaseModel):
    PCD_PAY_RST: str = None
    PCD_PAY_CODE: str = None
    PCD_PAY_MSG: str = None
    PCD_PAY_TYPE: str = None
    PCD_PAY_OID: str = None
    PCD_PAYER_NO: str = None
    PCD_PAYER_ID: str = None
    PCD_PAYER_EMAIL: str = None
    PCD_PAYER_NAME: str = None
    PCD_PAYER_HP: str = None
    PCD_PAY_YEAR: str = None
    PCD_PAY_MONTH: str = None
    PCD_PAY_GOODS: str = None
    PCD_PAY_TOTAL: str = None
    PCD_PAY_ISTAX: str = None
    PCD_PAY_TAXTOTAL: str = None
    PCD_PAY_TIME: str = None
    PCD_PAY_CARDNAME: str = None
    PCD_PAY_CARDNUM: str = None
    PCD_PAY_CARDTRADENUM: str = None
    PCD_PAY_CARDAUTHNO: str = None
    PCD_PAY_CARDRECEIPT: str = None
    PCD_REGULER_FLAG: str = None
    PCD_SIMPLE_FLAG: str = None
    PCD_USER_DEFINE1: str = None
    PCD_USER_DEFINE2: str = None
    teamId: int = None

@router.post("/pgregistration/")
def addPgRegistration(*,
                      PCD_PAY_RST: str = Form(None),
                      PCD_PAY_CODE: str = Form(None),
                      PCD_PAY_MSG: str = Form(None),
                      PCD_PAY_OID: str = Form(None),
                      PCD_PAYER_NO: str = Form(None),
                      PCD_PAYER_ID: str = Form(None),
                      PCD_PAYER_NAME: str = Form(None),
                      PCD_PAYER_HP: str = Form(None),
                      PCD_PAYER_EMAIL: str = Form(None),
                      PCD_PAY_TOTAL: str = Form(None),
                      PCD_PAY_TAXTOTAL: str = Form(None),
                      PCD_PAY_ISTAX: str = Form(None),
                      PCD_PAY_TIME: str = Form(None),
                      PCD_PAY_CARDNAME: str = Form(None),
                      PCD_PAY_CARDNUM: str = Form(None),
                      PCD_PAY_CARDTRADENUM: str = Form(None),
                      PCD_PAY_CARDAUTHNO: str = Form(None),
                      PCD_PAY_CARDRECEIPT: str = Form(None),
                      PCD_PAY_TYPE: str = Form(None),
                      PCD_PAY_YEAR: str = Form(None),
                      PCD_PAY_MONTH: str = Form(None),
                      PCD_PAY_GOODS: str = Form(None),
                      PCD_REGULER_FLAG: str = Form(None),
                      PCD_SIMPLE_FLAG: str = Form(None),
                      PCD_USER_DEFINE1: str = Form(None),
                      PCD_USER_DEFINE2: str = Form(None),
                      teamId: str = Form(None),
                      response: Response):
    pgRegistrationInfo = PgRegistrationInfo()
    pgRegistrationInfo.PCD_PAY_RST = PCD_PAY_RST
    pgRegistrationInfo.PCD_USER_DEFINE2 = PCD_USER_DEFINE2
    pgRegistrationInfo.PCD_USER_DEFINE1 = PCD_USER_DEFINE1
    pgRegistrationInfo.PCD_REGULER_FLAG = PCD_REGULER_FLAG
    pgRegistrationInfo.PCD_SIMPLE_FLAG = PCD_SIMPLE_FLAG
    pgRegistrationInfo.PCD_PAY_CARDRECEIPT = PCD_PAY_CARDRECEIPT
    pgRegistrationInfo.PCD_PAY_CARDAUTHNO = PCD_PAY_CARDAUTHNO
    pgRegistrationInfo.PCD_PAY_CARDTRADENUM = PCD_PAY_CARDTRADENUM
    pgRegistrationInfo.PCD_PAY_CARDNUM = PCD_PAY_CARDNUM
    pgRegistrationInfo.PCD_PAY_CARDNAME = PCD_PAY_CARDNAME
    pgRegistrationInfo.PCD_PAY_TIME = PCD_PAY_TIME
    pgRegistrationInfo.PCD_PAY_TAXTOTAL = PCD_PAY_TAXTOTAL
    pgRegistrationInfo.PCD_PAY_ISTAX = PCD_PAY_ISTAX
    pgRegistrationInfo.PCD_PAY_TOTAL = PCD_PAY_TOTAL
    pgRegistrationInfo.PCD_PAYER_NAME = PCD_PAYER_NAME
    pgRegistrationInfo.PCD_PAYER_HP = PCD_PAYER_HP
    pgRegistrationInfo.PCD_PAY_GOODS = PCD_PAY_GOODS
    pgRegistrationInfo.PCD_PAY_MONTH = PCD_PAY_MONTH
    pgRegistrationInfo.PCD_PAY_YEAR = PCD_PAY_YEAR
    pgRegistrationInfo.PCD_PAYER_EMAIL = PCD_PAYER_EMAIL
    pgRegistrationInfo.PCD_PAYER_ID = PCD_PAYER_ID
    pgRegistrationInfo.PCD_PAYER_NO = PCD_PAYER_NO
    pgRegistrationInfo.PCD_PAY_OID = PCD_PAY_OID
    pgRegistrationInfo.PCD_PAY_TYPE = PCD_PAY_TYPE
    pgRegistrationInfo.PCD_PAY_MSG = PCD_PAY_MSG
    pgRegistrationInfo.PCD_PAY_CODE = PCD_PAY_CODE


    response.status_code, result = managePayment.addPgRegistration(pgRegistrationInfo, teamId)

    return result


@router.post("/pgpayment/")
def addPgPayment(*,
                      PCD_PAY_RST: str = Form(None),
                      PCD_PAY_CODE: str = Form(None),
                      PCD_PAY_MSG: str = Form(None),
                      PCD_PAY_TYPE: str = Form(None),
                      PCD_PAY_OID: str = Form(None),
                      PCD_PAYER_NO: str = Form(None),
                      PCD_PAYER_ID: str = Form(None),
                      PCD_PAYER_EMAIL: str = Form(None),
                      PCD_PAY_YEAR: str = Form(None),
                      PCD_PAY_MONTH: str = Form(None),
                      PCD_PAY_GOODS: str = Form(None),
                      PCD_PAY_TOTAL: str = Form(None),
                      PCD_PAY_ISTAX: str = Form(None),
                      PCD_PAY_TAXTOTAL: str = Form(None),
                      PCD_PAY_TIME: str = Form(None),
                      PCD_PAY_CARDNAME: str = Form(None),
                      PCD_PAY_CARDNUM: str = Form(None),
                      PCD_PAY_CARDTRADENUM: str = Form(None),
                      PCD_PAY_CARDAUTHNO: str = Form(None),
                      PCD_PAY_CARDRECEIPT: str = Form(None),
                      PCD_REGULER_FLAG: str = Form(None),
                      PCD_USER_DEFINE1: str = Form(None),
                      PCD_USER_DEFINE2: str = Form(None),
                      response: Response):
    pgRegistrationInfo = PgRegistrationInfo()
    pgRegistrationInfo.PCD_PAY_RST = PCD_PAY_RST
    pgRegistrationInfo.PCD_USER_DEFINE2 = PCD_USER_DEFINE2
    pgRegistrationInfo.PCD_USER_DEFINE1 = PCD_USER_DEFINE1
    pgRegistrationInfo.PCD_REGULER_FLAG = PCD_REGULER_FLAG
    pgRegistrationInfo.PCD_PAY_CARDRECEIPT = PCD_PAY_CARDRECEIPT
    pgRegistrationInfo.PCD_PAY_CARDAUTHNO = PCD_PAY_CARDAUTHNO
    pgRegistrationInfo.PCD_PAY_CARDTRADENUM = PCD_PAY_CARDTRADENUM
    pgRegistrationInfo.PCD_PAY_CARDNUM = PCD_PAY_CARDNUM
    pgRegistrationInfo.PCD_PAY_CARDNAME = PCD_PAY_CARDNAME
    pgRegistrationInfo.PCD_PAY_TIME = PCD_PAY_TIME
    pgRegistrationInfo.PCD_PAY_TAXTOTAL = PCD_PAY_TAXTOTAL
    pgRegistrationInfo.PCD_PAY_ISTAX = PCD_PAY_ISTAX
    pgRegistrationInfo.PCD_PAY_TOTAL = PCD_PAY_TOTAL
    pgRegistrationInfo.PCD_PAY_GOODS = PCD_PAY_GOODS
    pgRegistrationInfo.PCD_PAY_MONTH = PCD_PAY_MONTH
    pgRegistrationInfo.PCD_PAY_YEAR = PCD_PAY_YEAR
    pgRegistrationInfo.PCD_PAYER_EMAIL = PCD_PAYER_EMAIL
    pgRegistrationInfo.PCD_PAYER_ID = PCD_PAYER_ID
    pgRegistrationInfo.PCD_PAYER_NO = PCD_PAYER_NO
    pgRegistrationInfo.PCD_PAY_OID = PCD_PAY_OID
    pgRegistrationInfo.PCD_PAY_TYPE = PCD_PAY_TYPE
    pgRegistrationInfo.PCD_PAY_MSG = PCD_PAY_MSG
    pgRegistrationInfo.PCD_PAY_CODE = PCD_PAY_CODE

    response.status_code, result = managePayment.addPgRegistration(pgRegistrationInfo)

    return result

@router.get("/pgregistration/")
def getPgRegistration(response: Response, token: str):
    response.status_code, result = managePayment.getPgRegistrationHistory(token)
    return result

@router.get("/pgpayment/")
def get_pgpayment(response: Response, token: str, provider: str = 'DS2.ai'):
    response.status_code, result = managePayment.get_pgpayment_history(token, provider)
    return result

@router.get("/pgpayment-detail/")
def get_pgpayment_detail(response: Response, token: str, year: int, month: int):
    response.status_code, result = managePayment.get_pgpayment_history_detail(token, year, month)
    return result

@router.get("/payple-auth-file/")
@router.post("/payple-auth-file/")
def paypleAuthFile(response: Response):
    response.status_code = 200

    url = f"{utilClass.paypleURL}/php/auth.php"
    payload = utilClass.payplePayload

    response = requests.request("POST", url, data=payload, headers=utilClass.paypleHeaders)

    result = json.loads(response.text)
    return result
