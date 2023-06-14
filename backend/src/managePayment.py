import math
import traceback
import requests
import json

from playhouse.shortcuts import model_to_dict

from src.emailContent.getContentCancelUserPlan import getContentCancelUserPlan
from src.emailContent.getContentCancelUserPlan_en import getContentCancelUserPlanEn
from src.emailContent.getContentPaymentFail import getContentPaymentFail
from src.emailContent.getContentPaymentFail_en import getContentPaymentFailEn
from src.emailContent.getContentPaymentSuccess import getContentPaymentSuccess
from src.emailContent.getContentPaymentSuccess_en import getContentPaymentSuccessEn
from src.emailContent.getContentVoucherPayment import getContentVoucherPayment
from src.emailContent.getContentLicensePayment import getContentLicensePayment
from src.emailContent.getContentLicensePaymentEn import getContentLicensePaymentEn
from src.util import Util
from src.errors import exceptions as ex
from models.helper import Helper
import datetime
from starlette.status import HTTP_200_OK, HTTP_402_PAYMENT_REQUIRED
from starlette.status import HTTP_301_MOVED_PERMANENTLY
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from starlette.responses import RedirectResponse
import time
from dateutil.relativedelta import relativedelta
from src.errorResponseList import ErrorResponseList, PRICING_ERROR, WRONG_ACCESS_ERROR
from src.errorResponseList import NOT_FOUND_USER_ERROR
from src.errorResponseList import ALREADY_REFUND_ERROR
from src.errorResponseList import ALREADY_CANCELED_ERROR
from src.errorResponseList import NOT_FOUND_PGREGISTER_ERROR
import stripe
import hashlib
from src.eximpayment.goToPaymentFromExim import get_payment_redirection_html
from paypalcheckoutsdk.core import PayPalHttpClient
from paypalcheckoutsdk.core import SandboxEnvironment
from paypalcheckoutsdk.core import LiveEnvironment
from paypalcheckoutsdk.orders import OrdersGetRequest

errorResponseList = ErrorResponseList()

class ManagePayment:

    def __init__(self):

        self.isForTest = True

        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.ce = self.utilClass.getBotoClient('ce', region_name=None)
        self.ec2 = self.utilClass.getBotoClient('ec2')

        self.authURL = f"{self.utilClass.paypleURL}/php/auth.php"
        self.paymentURL = f"{self.utilClass.paypleURL}/php/RePayCardAct.php?ACT_=PAYM"
        self.cancelURL = f"{self.utilClass.paypleURL}/php/cPayUser/api/cPayUserAct.php?ACT_=PUSERDEL"
        self.authPayload = self.utilClass.payplePayload
        self.payple_headers = self.utilClass.paypleHeaders
        self.datetimeInfo = datetime.datetime.now()
        self.stripe = stripe
        self.stripe.api_key = self.utilClass.stripe_api_key
        self.exim_key = self.utilClass.eximbay_secret_key
        self.exim_key_ko = self.utilClass.eximbay_secret_key_ko
        self.exim_basic_url = self.utilClass.eximbay_basic_url
        self.exim_direct_url = self.utilClass.eximbay_direct_url
        self.exim_mid = self.utilClass.eximbay_mid
        self.exim_mid_ko = self.utilClass.eximbay_mid_ko
        self.back_url = self.utilClass.backendURL
        self.front_url = self.utilClass.frontendURL
        # self.back_url = 'http://10.177.195.167:2052'
        # self.front_url = 'http://10.177.198.129:3000'

        self.paypal_client_id = self.utilClass.paypal_client_id
        self.paypal_client_secret = self.utilClass.paypal_client_secret

    def measurementPrice(self, user, usagePlan, dyno):
        price = 0
        if usagePlan['planName'] == "business":
            price = usagePlan['price'] * dyno
        else:
            price = usagePlan['price']

        # if user.usageplan:
        #     if user.nextPaymentDate:
        #         price = round(price - user.usageplan['price'] * user.dynos * ((user.nextPaymentDate - datetime.datetime.now()).days) / 30)

        if user.promotionCode:
            promotion = self.dbClass.getPromotionIdByPromotionCode(user.__dict__['__data__'])
            if promotion:
                if promotion.planName:
                    if promotion.planName == usagePlan["planName"]:
                        price = price * (
                                1 - 0.01 * promotion.discountPercent)
                else:
                    price = price * (1 - 0.01 * promotion.discountPercent)

        return price

    def deleteFuturePlan(self, token):
        user = self.dbClass.getUser(token)
        if not user:
            raise ex.NotFoundUserEx(token)
        return HTTP_200_OK, self.dbClass.updateUser(user['id'], {
            'nextPlan': None,
            'nextDynos': None,
        })

    def deleteFutureDyno(self, token):
        user = self.dbClass.getUser(token)
        if not user:
            raise ex.NotFoundUserEx(token)
        return HTTP_200_OK, self.dbClass.updateUser(user['id'], {
            'nextDynos': None
        })

    def payAdditionalUnit(self, token, unitName, unitCnt):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : payAdditionalUnit \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if self.paymentClass.payAdditionalUnit(user, unitName, unitCnt):
            return HTTP_200_OK, True
        else:
            return WRONG_ACCESS_ERROR

    def payAdditionalUnit(self, user, unitName, unitCnt):

        lastRegistrationInfo = self.dbClass.getLastPgRegistrationByUserId(user.id)
        unit = self.dbClass.getOneAdditionalunitinfoByName(unitName)
        price = unit.additionalUnitPrice * unitCnt

        if price:
            paidInfo = {}

            try:

                authInfo = json.loads(
                    requests.request("POST", self.authURL, data=self.authPayload, headers=self.payple_headers).text)

                paymentInfo = {
                    "PCD_CST_ID": authInfo['cst_id'],
                    "PCD_CUST_KEY": authInfo['custKey'],
                    "PCD_AUTH_KEY": authInfo['AuthKey'],
                    "PCD_PAY_TYPE": "card",
                    "PCD_PAYER_ID": lastRegistrationInfo["PCD_PAYER_ID"],
                    "PCD_PAY_OID": f"clickai_additional_pay_{unitName}_{user.id}_{time.time()}",
                    "PCD_PAYER_NO": user.id,
                    "PCD_PAYER_EMAIL": user.email,
                    "PCD_PAY_GOODS": unitName,
                    "PCD_PAY_TOTAL": price,
                    "PCD_PAY_ISTAX": "Y",
                    "PCD_PAY_TAXTOTAL": price / 10,
                    "PCD_SIMPLE_FLAG": "Y",
                    "PCD_USER_DEFINE2": unitCnt,
                    # "PCD_PAY_YEAR": f"{self.datetimeInfo.year}",
                    # "PCD_PAY_MONTH": f"{self.datetimeInfo.month}",
                    # "PCD_REGULER_FLAG": "Y",
                }
                paymentResponseRaw = requests.request("POST", f"{authInfo['PCD_PAY_HOST']}{authInfo['PCD_PAY_URL']}", data=paymentInfo,
                                                      headers=self.payple_headers).text
                paymentResponse = json.loads(paymentResponseRaw)

                paidInfo = {
                    "user": user.id,
                    "price": price,
                    "PCD_PAY_RST": paymentResponse["PCD_PAY_RST"],
                    "PCD_PAY_CODE": paymentResponse["PCD_PAY_CODE"],
                    "PCD_PAY_MSG": paymentResponse["PCD_PAY_MSG"],
                    "PCD_PAY_OID": paymentResponse["PCD_PAY_OID"],
                    "PCD_PAY_TYPE": paymentResponse["PCD_PAY_TYPE"],
                    "PCD_PAYER_NO": paymentResponse["PCD_PAYER_NO"],
                    "PCD_PAYER_ID": paymentResponse["PCD_PAYER_ID"],
                    "PCD_PAYER_NAME": paymentResponse["PCD_PAYER_NAME"],
                    "PCD_PAYER_HP": paymentResponse["PCD_PAYER_HP"],
                    "PCD_PAYER_EMAIL": paymentResponse["PCD_PAYER_EMAIL"],
                    # "PCD_PAY_YEAR": paymentResponse["PCD_PAY_YEAR"],
                    # "PCD_PAY_MONTH": paymentResponse["PCD_PAY_MONTH"],
                    "PCD_PAY_GOODS": paymentResponse["PCD_PAY_GOODS"],
                    "PCD_PAY_TOTAL": paymentResponse["PCD_PAY_TOTAL"],
                    "PCD_PAY_TAXTOTAL": paymentResponse["PCD_PAY_TAXTOTAL"],
                    "PCD_PAY_ISTAX": paymentResponse["PCD_PAY_ISTAX"],
                    "PCD_PAY_TIME": paymentResponse["PCD_PAY_TIME"],
                    "PCD_PAY_CARDNAME": paymentResponse["PCD_PAY_CARDNAME"],
                    "PCD_PAY_CARDNUM": paymentResponse["PCD_PAY_CARDNUM"],
                    "PCD_PAY_CARDTRADENUM": paymentResponse["PCD_PAY_CARDTRADENUM"],
                    "PCD_PAY_CARDAUTHNO": paymentResponse["PCD_PAY_CARDAUTHNO"],
                    "PCD_PAY_CARDRECEIPT": paymentResponse["PCD_PAY_CARDRECEIPT"],
                    # "PCD_REGULER_FLAG": paymentResponse["PCD_REGULER_FLAG"],
                    "PCD_USER_DEFINE1": paymentResponse["PCD_USER_DEFINE1"],
                    "PCD_USER_DEFINE2": paymentResponse["PCD_USER_DEFINE2"],
                }

                paidResponse = self.dbClass.createPgPayment(paidInfo)

                if "success" in paymentResponse.get("PCD_PAY_RST", ""):
                    self.utilClass.sendSlackMessageV2(
                        f"결제 처리 성공 : USER ID : {user.id}, paymentId : {lastRegistrationInfo['id']}, price: {price}\n, {self.dumps(user.__dict__['__data__'])}",
                    self.utilClass.slackPGPaymentSuccess)

                    if 'project' in unitName:
                        user.additionalProjectCount = user.additionalProjectCount + (unit.quantity * unitCnt)
                    elif 'labeling' in unitName:
                        user.additionalLabelCount = user.additionalLabelCount + (unit.quantity * unitCnt)
                    elif 'predict' in unitName:
                        user.additionalPredictCount = user.additionalPredictCount + (unit.quantity * unitCnt)
                    elif 'storage' in unitName:
                        user.additionalDiskUsage = user.additionalDiskUsage + (unit.quantity * unitCnt)
                    self.dbClass.updateUser(user.id, {
                        'additionalProjectCount': user.additionalProjectCount,
                        'additionalLabelCount': user.additionalLabelCount,
                        'additionalPredictCount': user.additionalPredictCount,
                        'additionalDiskUsage': user.additionalDiskUsage,
                    })

                    return True

                else:
                    self.utilClass.sendSlackMessageV2(
                    f"결제 처리 실패 : USER ID : {user.id}, paymentId : {lastRegistrationInfo['id']}, price: {price}\n" + str(traceback.format_exc()),
                    self.utilClass.slackPGPaymentFail)
                    self.utilClass.sendSlackMessageV2(
                        f"paymentInfo: {self.dumps(paymentInfo)}\npaymentResponseRaw: {paymentResponseRaw}\npaymentResponse: {self.dumps(paymentResponse)}\npaidInfo: {self.dumps(paidInfo)}\n",
                    self.utilClass.slackPGPaymentFail)

                    return False

            except KeyError as e:
                print(traceback.format_exc())
                self.dbClass.createPgPayment(paidInfo)
                return False
                pass

    def dumps(self, obj):
        return json.dumps(obj,indent=4, ensure_ascii=False, default=str)

    # def sendEmailPaymentSuccess(self, user, nextPlan, price, paidInfo):
    #     Subject = f'[클릭AI] 결재가 완료되었습니다.'
    #     To = user.email
    #     Content = getContentPaymentSuccess(user.username, nextPlan, price, paidInfo['PCD_PAY_CARDNAME'])
    #     result = self.utilClass.sendEmail(To, Subject, Content)
    #     return result

    def actionForSuccessPayment(self, user, data, dateUploaded, isValidRemainCount):
        # 등록된 카드로 결제하는 경우

        if not user.isFirstplanDone:
            user.isFirstplanDone = True
            user.nextPaymentDate = datetime.datetime.utcnow().replace(day=int(user.paymentDay)) + relativedelta(months=1)
        else:

            currentDynos = user.dynos
            currentUsageplan = user.usageplan # ['id'] if type(user.usageplan) == dict else user.usageplan

            if isinstance(user.usageplan, int):
                currentUsageplan = self.dbClass.getOneUsageplanById(user.usageplan)
            if currentUsageplan["planName"] == "basic":
                currentDynos = 1

            if data:
                print('data.get("PCD_USER_DEFINE2")')
                print(user.__dict__['__data__'])
                print(data.get("PCD_USER_DEFINE2"))
                if data.get("PCD_USER_DEFINE2"):
                    user.dynos = data.get("PCD_USER_DEFINE2")
                else:
                    user.dynos = 1

            remainDiskUsage = currentUsageplan["storage"] * currentDynos - user.cumulativeDiskUsage
            remainProjectCount = currentUsageplan["projects"] * currentDynos - user.cumulativeProjectCount
            remainPredictCount = currentUsageplan["noOfPrediction"] * currentDynos - user.cumulativePredictCount
            remainLabelCount = currentUsageplan["noOfLabelling"] * currentDynos - user.cumulativeLabelCount

            if dateUploaded:
                dateUploaded.remainDiskUsage = remainDiskUsage
                dateUploaded.remainProjectCount = remainProjectCount
                dateUploaded.remainPredictCount = remainPredictCount
                dateUploaded.remainLabelCount = remainLabelCount
                dateUploaded.isValidRemainCount = isValidRemainCount
                dateUploaded.save()

            if isValidRemainCount:
                user.remainDiskUsage = user.remainDiskUsage + remainDiskUsage
                user.remainProjectCount = user.remainProjectCount + remainProjectCount
                user.remainPredictCount = user.remainPredictCount + remainPredictCount
                user.remainLabelCount = user.remainLabelCount + remainLabelCount
            user.totalDiskUsage = 0
            user.cumulativeDiskUsage = 0
            user.cumulativeProjectCount = 0
            user.cumulativePredictCount = 0
            user.cumulativeLabelCount = 0
            if user.nextPaymentDate:
                user.nextPaymentDate = user.nextPaymentDate + relativedelta(months=1)
            else:
                user.nextPaymentDate = datetime.datetime.now().replace(day=int(user.paymentDay)) + relativedelta(months=1)
        if type(user.usageplan) == dict:
            user.usageplan = user.nextPlan if user.nextPlan else user.usageplan['id']
        else:
            user.usageplan = user.nextPlan if user.nextPlan else user.usageplan
        user.nextPlan = None

        self.dbClass.updateUser(user.id, {
            'nextPlan': user.nextPlan,
            'nextPaymentDate': user.nextPaymentDate,
            'usageplan': user.usageplan,
            'totalDiskUsage': user.totalDiskUsage,
            'cumulativeDiskUsage': user.cumulativeDiskUsage,
            'cumulativeProjectCount': user.cumulativeProjectCount,
            'cumulativePredictCount': user.cumulativePredictCount,
            'cumulativeLabelCount': user.cumulativeLabelCount,
            'remainDiskUsage': user.remainDiskUsage,
            'remainProjectCount': user.remainProjectCount,
            'remainPredictCount': user.remainPredictCount,
            'remainLabelCount': user.remainLabelCount,
            'dynos': user.dynos,
            'isFirstplanDone': user.isFirstplanDone,
            'remainVoucher': user.remainVoucher,
        })

        user.save()

        opsProjects = self.dbClass.getOpsProjectsByUserId(user.id)
        for opsProject in opsProjects:
            opsServerGroups = self.dbClass.getOpsServerGroupsByOpsProjectId(opsProject.id)
            for opsServerGroup in opsServerGroups:
                if opsServerGroup.last_paid_at and not opsServerGroup.terminated_at:  # 아직 안 끝났고 낸적 있는 경우
                    opsServerGroup.last_paid_at = self.datetimeInfo
                elif opsServerGroup.last_paid_at and opsServerGroup.last_paid_at > opsServerGroup.terminated_at:  # 끝났고 낸적 있는 경우
                    opsServerGroup.last_paid_at = opsServerGroup.terminated_at
                elif not opsServerGroup.last_paid_at and not opsServerGroup.terminated_at:  # 아직 안 끝났고 낸적 없는 경우
                    opsServerGroup.last_paid_at = self.datetimeInfo
                elif not opsServerGroup.last_paid_at and opsServerGroup.last_paid_at > opsServerGroup.terminated_at:  # 끝났고 낸적 없는 경우
                    opsServerGroup.last_paid_at = opsServerGroup.terminated_at

                opsServerGroup.save()

        last_amount_info = self.dbClass.getLastAmountByUserId(user.id, raw=True)
        last_amount_info.isPaid = True
        last_amount_info.save()

    def eximbay_license_purchase_start(self, eximbay_data):

        user_email = eximbay_data.user_email
        amount = eximbay_data.amount
        return_url = eximbay_data.return_url

        if float(amount) <= 0:
            raise ex.NotValideAmountEx()

        email_splt = user_email.split('@')[0]
        exim_key = self.exim_key

        timestamp = time.strftime('%y%m%d%H%M%S')
        ref = f'{email_splt}_{timestamp}'

        param_dict = {
            'ver': '230',
            'txntype': 'PAYMENT',
            'charset': 'UTF-8',
            'mid': self.exim_mid,
            'ref': ref,
            'ostype': 'P',
            'item_1_product': 'ds2ai_license',
            'item_1_quantity': 1,
            'item_1_unitPrice': amount,
            'cur': 'USD',
            'amt': amount,
            'shop': 'DS2.ai',
            'buyer': email_splt,
            'email': user_email,
            'lang': 'EN',
            'paymethod': 'P000',
            'returnurl': return_url,
            'statusurl': f'{self.back_url}/webhook/eximbay/license/'
        }

        if eximbay_data.lang == "ko":
            param_dict['cur'] = "KRW"
            param_dict['amt'] = "1000"
            param_dict['lang'] = "KR"
            param_dict['issuercountry'] = "KR"
            param_dict['mid'] = self.exim_mid_ko
            exim_key = self.exim_key_ko

        param_dict_list = sorted(param_dict.items())
        params = ""
        for key, value in param_dict_list:
            params = f'{params}{key}={value}&'
        fgkey = f'{exim_key}?{params[:-1]}'
        fgkey_encypted = hashlib.sha256(fgkey.encode())
        param_dict['fgkey'] = fgkey_encypted.hexdigest()

        result = {
            'params': param_dict,
            'url': self.exim_basic_url
        }

        return HTTP_200_OK, result

    def send_ds2ai_license(self, user_email, lang, mac):

        from src.creating.license import License

        license_key = License().generate_license(email=user_email, mac=mac)

        if lang == 'ko':
            subject = f'[DS2.AI] 라이센스 결제가 완료되었습니다.'
            content = getContentLicensePayment(license_key)
        elif lang == 'en':
            subject = f'[DS2.AI] License payment has been completed.'
            content = getContentLicensePaymentEn(license_key)

        self.utilClass.sendEmail(user_email, subject, content)

    def payple_webhook(self, webhook_info):
        # TODO: 결제 내역 저장 -> 유저 정보 없이 구매하는 방식이라 현재는 불가
        if "ds2ai_license" in webhook_info.PCD_PAY_GOODS :
            user_email = webhook_info.PCD_PAYER_EMAIL
            if user_email is None:
                self.utilClass.sendSlackMessage(f"유저 이메일 정보가 없습니다.(Payple) | 주문번호 : {webhook_info.PCD_PAY_OID}", appLog=True)
                return

            return_url = webhook_info.PCD_PAY_OID.split("_")[0]
            pg_result = None
            try:
                self.send_ds2ai_license(user_email, lang="ko", mac=webhook_info.PCD_PAY_GOODS.split("ds2ai_license")[1])
                pg_result = "true"
            except Exception as e:
                pg_result = "false"
                self.utilClass.sendSlackMessage(f"DS2.ai 라이센스 메일 발송 중 에러 발생 (Payple) | 주문번호 : {webhook_info.PCD_PAY_OID} | 이메일 : {user_email}\n"
                                                f"traceback : {str(traceback.format_exc())}", appLog=True)
            return HTTP_301_MOVED_PERMANENTLY, RedirectResponse(url=return_url + "?pg=" + pg_result, status_code=301)

    def eximbay_license_webhook(self, webhook_data):
        # TODO: 결제 내역 저장 -> 유저 정보 없이 구매하는 방식이라 현재는 불가
        rescode = webhook_data.rescode
        trans_id = webhook_data.trans_id
        user_email = webhook_data.user_email

        if rescode != "0000":
            return

        if user_email is None:
            self.utilClass.sendSlackMessage(f"유저 이메일 정보가 없습니다.(Eximbay) | 주문번호 : {trans_id}",
                                            appLog=True)
            return

        try:
            self.send_ds2ai_license(user_email, lang="en")
        except Exception as e:
            self.utilClass.sendSlackMessage(
                f"DS2.ai 라이센스 메일 발송 중 에러 발생 (Payple) | 주문번호 : {trans_id} | 이메일 : {user_email}\n"
                f"traceback : {str(traceback.format_exc())}", appLog=True)

    def paypal_webhook(self, webhook_info):

        if webhook_info.event_type == "PAYMENT.CAPTURE.COMPLETED":
            try:

                if self.utilClass.configOption in "prod":
                    self.paypal_environment = LiveEnvironment(client_id=self.paypal_client_id,
                                                              client_secret=self.paypal_client_secret)
                else:
                    self.paypal_environment = SandboxEnvironment(client_id=self.paypal_client_id,
                                                                 client_secret=self.paypal_client_secret)
                self.paypal_client = PayPalHttpClient(self.paypal_environment)

                currency = 'usd'
                new_deposit = 0
                amount = webhook_info.resource['amount']['value']
                user_id = webhook_info.resource['custom_id']
                order_id = webhook_info.resource['supplementary_data']['related_ids']['order_id']

                order_request = OrdersGetRequest(order_id)
                order_response = self.paypal_client.execute(order_request)
                for item in order_response.result.purchase_units[0].items:
                    amount_with_tax = item['unit_amount']['value']
                    item_amount = float(amount_with_tax) * (10 / 11)
                    if item['name'] == 'first':
                        item_deposit = round(item_amount * int(item['quantity']), 2)
                    else:
                        item_deposit = round((item_amount * 1.05) * int(item['quantity']), 2)
                    new_deposit += item_deposit

                user = self.dbClass.get_user_by_id(user_id)
                user_deposit = user['deposit']
                paidInfo = {
                    "user": user_id,
                    "price": amount,
                    "currency": currency,
                    "PCD_PAY_TYPE": "prepaid",
                    "PCD_PAY_RST": 'success',
                    "PCD_PAY_CODE": order_id,
                    "PCD_PAY_MSG": '카드결제완료',
                    "PCD_PAY_OID": f"ds2_{user_id}_{self.datetimeInfo.date()}",
                    "PCD_PAYER_NO": user_id,
                    "PCD_PAYER_EMAIL": user['email'],
                    "PCD_PAY_YEAR": f"{self.datetimeInfo.year}",
                    "PCD_PAY_MONTH": f"{self.datetimeInfo.month}",
                    "PCD_PAY_GOODS": "DS2.ai 선불 충전",
                    "PCD_PAY_TOTAL": amount,
                    "PCD_PAY_TAXTOTAL": round(float(amount) / 10, 2),
                    "PCD_PAY_ISTAX": "Y",
                    "PCD_PAY_TIME": self.datetimeInfo,
                    "PCD_PAY_CARDNAME": 'Paypal',
                    "PCD_PAY_CARDNUM": '',
                    "paid_at_datetime": self.datetimeInfo,
                    "paid_at_datetime_ko": self.datetimeInfo + datetime.timedelta(hours=9)
                }
                paymentHistory = self.dbClass.createPgPayment(paidInfo)
                added_deposit = round(float(user_deposit) + new_deposit, 2)
                self.dbClass.updateUser(user_id, {'deposit': added_deposit})
                self.utilClass.sendSlackMessageV2(
                    f"Paypal 선불 충전 처리 성공 : USER ID : {user['id']}\n 결제 금액 : $ {amount}, 충전 CREDIT : {new_deposit}\n "
                    f"충전 전 CREDIT: {user_deposit}, 충전 후 CREDIT: {added_deposit}\n",
                    self.utilClass.slackPGPaymentSuccess)
            except:
                self.utilClass.sendSlackMessageV2(
                    f"선불 충전 처리 실패 : USER ID : {user['id']}, 주문 번호 : {order_id}",
                    self.utilClass.slackPGPaymentFail)
                raise ex.FailUserDepositEx(user_id)

        return HTTP_200_OK, {'result': 'success'}

    # def paypal_tran_complete(self, token, payment_info):
    #
    #     user = self.dbClass.getUser(token)
    #     if not user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : managePayment.py \n함수 : getPgRegistrationHistory \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
    #             appError=True, userInfo=user)
    #         raise ex.NotFoundUserEx(token)
    #
    #     order_id = payment_info.orderID
    #
    #     try:
    #         request = OrdersGetRequest(order_id)
    #         get_response = self.paypal_client.execute(request)
    #
    #         if get_response.status_code != 200:
    #             raise ex.FailPaypalGetEx(token)
    #
    #         currency = 'usd'
    #         amount = get_response.result.purchase_units[0].amount.value
    #
    #         paidInfo = {
    #             "user": user['id'],
    #             "price": amount,
    #             "currency": currency,
    #             "PCD_PAY_TYPE": "prepaid",
    #             "PCD_PAY_RST": 'success',
    #             "PCD_PAY_CODE": order_id,
    #             "PCD_PAY_MSG": '카드결제완료',
    #             "PCD_PAY_OID": f"ds2_{user['id']}_{self.datetimeInfo.date()}",
    #             "PCD_PAYER_NO": user['id'],
    #             "PCD_PAYER_ID": get_response.result.payer.payer_id,
    #             "PCD_PAYER_EMAIL": user['email'],
    #             "PCD_PAY_YEAR": f"{self.datetimeInfo.year}",
    #             "PCD_PAY_MONTH": f"{self.datetimeInfo.month}",
    #             "PCD_PAY_GOODS": "DS2.ai_사용량 선불 충전",
    #             "PCD_PAY_TOTAL": amount,
    #             "PCD_PAY_TAXTOTAL": round(float(amount) / 10, 2),
    #             "PCD_PAY_ISTAX": "Y",
    #             "PCD_PAY_TIME": self.datetimeInfo,
    #             "PCD_PAY_CARDNAME": 'Paypal',
    #             "PCD_PAY_CARDNUM": '',
    #             "paid_at_datetime": self.datetimeInfo,
    #             "paid_at_datetime_ko": self.datetimeInfo + datetime.timedelta(hours=9)
    #         }
    #         paymentHistory = self.dbClass.createPgPayment(paidInfo)
    #
    #         try:
    #             new_deposit = round(float(user['deposit']) + (float(amount) * 0.9), 2)
    #             self.dbClass.updateUser(user['id'], {'deposit': new_deposit})
    #         except:
    #             raise ex.FailUserDepositEx(token)
    #
    #     except IOError as ioe:
    #         print(ioe)
    #         if isinstance(ioe, HttpError):
    #             # Something went wrong server-side
    #             print(ioe.status_code)
    #         raise ex.FailPaypalCaptureEx(token)
    #
    #     return HTTP_200_OK, {'result': 'success'}

    def getPgRegistrationHistory(self, token):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : getPgRegistrationHistory \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        user_id = user['id']

        try:
            pgPaymentInfo = self.dbClass.getLastPgRegistrationByUserId(user_id)
            if pgPaymentInfo is None:
                card_no = None
                created_at = None
                card_type = None
            else:
                card_no = pgPaymentInfo.get('PCD_PAY_CARDNUM')
                created_at = pgPaymentInfo.get('created_at')
                card_type = pgPaymentInfo.get('pg_provider')
            result = {
                "CardNo": card_no,
                "CreatedAt": created_at,
                "CardType": card_type
            }
            return HTTP_200_OK, result
        except:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : getPgRegistrationHistory \n결제정보 불러오던 중 에러 | User Id : {user_id}",
                appError=True, userInfo=user)
            return NOT_FOUND_PGREGISTER_ERROR

    def eximbay_registration_start(self, token, lang):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : eximbay_registration_start \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        timestamp = time.strftime('%y%m%d%H%M%S')
        ref = f'{user["id"]}_{timestamp}'
        exim_key = self.exim_key
        param_dict = {
            'ver': '230',
            'txntype': 'PAYMENT',
            'charset': 'UTF-8',
            'mid': self.exim_mid,
            'ref': ref,
            'ostype': 'P',
            # 'displaytype': 'R',
            'cur': 'USD',
            'amt': '1',
            'shop': 'DS2.ai',
            'tokenBilling': 'Y',
            'buyer': user['email'].split('@')[0],
            'email': user['email'],
            'lang': 'EN',
            'paymethod': 'P000',
            # 'autoclose': 'Y',
            'returnurl': f'{self.back_url}/eximbay-registration-redirect/?token={token}',
            # 'returnurl': f'{self.back_url}/eximbay-registration-end/?token={token}',
            'statusurl': f'{self.back_url}/eximbay-registration-end/?token={token}'
        }

        if lang == "ko":
            param_dict['cur'] = "KRW"
            param_dict['amt'] = "1000"
            param_dict['lang'] = "KR"
            param_dict['issuercountry'] = "KR"
            param_dict['mid'] = self.exim_mid_ko
            exim_key = self.exim_key_ko

        param_dict_list = sorted(param_dict.items())
        params = ""
        for key, value in param_dict_list:
            params = f'{params}{key}={value}&'
        fgkey = f'{exim_key}?{params[:-1]}'
        fgkey_encypted = hashlib.sha256(fgkey.encode())
        param_dict['fgkey'] = fgkey_encypted.hexdigest()

        result = {
            'params': param_dict,
            'url': self.exim_basic_url
                 }
        return HTTP_200_OK, result

    def eximbay_registration_end(self, token, rescode, resmsg, token_id, cardno1, cardno4, ref, trans_id):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : eximbay_registration_end \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if rescode == "0000":
            info = {
                'mid': self.exim_mid if user['lang'] != "ko" else self.exim_mid_ko,
                'ref': ref,
                'trans_id': trans_id
                    }
            self.refund_eximbay(user.__dict__['__data__'], info)

            existCardInfo = self.dbClass.getLastPgRegistrationByUserId(user.id)
            if existCardInfo:
                self.remove_registration_card(existCardInfo, user)

            data = {}
            data['user'] = user.id
            data['PCD_PAY_RST'] = 'success'
            data['PCD_PAY_TYPE'] = 'card'
            data['PCD_PAYER_NO'] = user.id
            data['PCD_PAYER_ID'] = token_id
            data['PCD_PAY_CARDNUM'] = f"{cardno1}-****-****-{cardno4}"
            data['PCD_PAY_CODE'] = ref
            data['pg_provider'] = 'eximbay'
            self.dbClass.createPgRegistration(data)

            self.dbClass.updateUser(user.id, {
                'cardInfo': token_id,
            })
            try:
                if self.utilClass.configOption in "prod" and not self.utilClass.check_aws_user_id(user.id):
                    self.utilClass.set_aws_user_id(user.id)
            except Exception as e:
                self.utilClass.sendSlackMessageV2(
                    e.detail,
                    self.utilClass.slackPGRegistrationFail)
            self.utilClass.sendSlackMessageV2(
                f"카드 등록 성공 : USER ID : {user.id}\n{json.dumps(data, indent=4, ensure_ascii=False)}",
                self.utilClass.slackPGRegistrationSuccess)
        else:
            print(resmsg)
            self.utilClass.sendSlackMessageV2(
                f"카드 등록 실패 : USER ID : {user.id}\n{resmsg}",
                self.utilClass.slackPGRegistrationFail)

    def refund_eximbay(self, user, info):

        timestamp = time.strftime('%y%m%d%H%M%S')
        refund_id = f'{user["id"]}_{timestamp}'
        param_dict = {
            'ver': '230',
            'mid': info['mid'],
            'txntype': 'REFUND',
            'refundtype': 'F',
            'ref': info['ref'],
            'cur': 'USD',
            'amt': '1',
            'transid': info['trans_id'],
            'refundid': refund_id,
            'reason': 'registraion',
            'lang': 'EN',
        }
        exim_key = self.exim_key
        if user['lang'] == "ko":
            param_dict['cur'] = "KRW"
            param_dict['amt'] = "1000"
            param_dict['lang'] = "KR"
            param_dict['issuercountry'] = "KR"
            param_dict['mid'] = self.exim_mid_ko
            exim_key = self.exim_key_ko

        param_dict_list = sorted(param_dict.items())
        params = ""
        for key, value in param_dict_list:
            params = f'{params}{key}={value}&'

        fgkey = f'{exim_key}?{params[:-1]}'
        fgkey_encypted = hashlib.sha256(fgkey.encode())
        param_dict['fgkey'] = fgkey_encypted.hexdigest()

        req = requests.post(self.exim_direct_url, data=param_dict)
        if req.status_code != HTTP_200_OK:
            self.utilClass.sendSlackMessageV2(
                f"eximbay 카드 등록 중 환불 실패 : USER ID : {user['id']}\n{req.status_code}",
                self.utilClass.slackPGRegistrationFail)
        else:
            rescode = req.text.split('&')[18].split('=')[1]
            if rescode != "0000":
                self.utilClass.sendSlackMessageV2(
                    f"eximbay 카드 등록 중 환불 실패 : USER ID : {user['id']}\n{req.text}",
                    self.utilClass.slackPGRegistrationFail)

    def eximbay_billing(self, token, price):

        user = self.dbClass.getUser(token)
        lastRegistrationInfo = self.dbClass.getLastPgRegistrationByUserId(user['id'])

        if lastRegistrationInfo['pg_provider'] != 'eximbay' or price < 1:
            return HTTP_503_SERVICE_UNAVAILABLE, {'pg_provider': lastRegistrationInfo['pg_provider'],
                                                  'price': price}

        timestamp = time.strftime('%y%m%d%H%M%S')
        ref = f'{user["id"]}_{timestamp}'
        req_param_dict = {
            'ver': '230',
            'mid': self.exim_mid,
            'txntype': 'REBILL',
            'tokenID': user['cardInfo'],
            'ref': ref,
            'cur': 'USD',
            'amt': price,
            'shop': 'DS2.ai',
            'buyer': user['email'].split('@')[0],
            'charset': 'UTF-8',
            'ostype': 'P',
            'displaytype': 'P',
            'email': user['email'],
            'lang': 'EN',
            'paymethod': 'P000'
        }
        param_dict_list = sorted(req_param_dict.items())
        params = ""
        for key, value in param_dict_list:
            params = f'{params}{key}={value}&'
        fgkey = f'{self.exim_key}?{params[:-1]}'
        fgkey_encypted = hashlib.sha256(fgkey.encode())
        req_param_dict['fgkey'] = fgkey_encypted.hexdigest()
        try:
            paidInfo = {}
            req = requests.post(self.exim_direct_url, data=req_param_dict)
            if req.status_code != HTTP_200_OK:
                self.utilClass.sendSlackMessageV2(
                    f"eximbay 카드 결제 실패 : USER ID : {user['id']}\n{req.status_code}",
                    self.utilClass.slackPGRegistrationFail)
            else:
                param_dict = {}
                response_params = req.text.split('&')
                for param in response_params:
                    param_list = param.split('=')
                    if len(param_list) > 1:
                        param_dict[param_list[0]] = param_list[1]
                if param_dict.get('rescode') != "0000":
                    paidInfo['PCD_PAY_RST'] = 'error'
                    self.utilClass.sendSlackMessageV2(
                        f"eximbay 카드 결제 실패 : USER ID : {user['id']}\n{req.text}",
                        self.utilClass.slackPGRegistrationFail)
                    return HTTP_503_SERVICE_UNAVAILABLE, param_dict

            paidInfo = {
                "user": user['id'],
                "price": param_dict.get('amt'),
                "currency": "usd",
                "pgregistrationhistory": lastRegistrationInfo['id'],
                "PCD_PAY_TYPE": "card",
                "PCD_PAY_RST": 'success',
                "PCD_PAY_CODE": param_dict.get('ref'),
                "PCD_PAY_MSG": '카드결제완료',
                "PCD_PAY_OID": f"ds2_{user['id']}_{self.datetimeInfo.date()}",
                "PCD_PAYER_NO": user['id'],
                "PCD_PAYER_ID": lastRegistrationInfo["PCD_PAYER_ID"],
                "PCD_PAYER_EMAIL": user['email'],
                "PCD_PAY_YEAR": f"{self.datetimeInfo.year}",
                "PCD_PAY_MONTH": f"{self.datetimeInfo.month}",
                "PCD_PAY_GOODS": "DS2.ai_사용량결제",
                "PCD_PAY_TOTAL": price,
                "PCD_PAY_TAXTOTAL": round(price / 10, 2),
                "PCD_PAY_ISTAX": "Y",
                "PCD_PAY_TIME": param_dict.get('resdt'),
                "PCD_PAY_CARDNAME": param_dict.get('cardco'),
                "PCD_PAY_CARDNUM": lastRegistrationInfo["PCD_PAY_CARDNUM"],
            }
        except Exception as e:
            paidInfo['PCD_PAY_RST'] = 'error'
            paidInfo['PCD_PAY_MSG'] = e

        paidInfo['paid_at_datetime'] = self.datetimeInfo
        paidInfo['paid_at_datetime_ko'] = self.datetimeInfo + datetime.timedelta(hours=9)
        paymentHistory = self.dbClass.createPgPayment(paidInfo)

        return HTTP_200_OK, paymentHistory

    def eximbay_registration_redirect(self, token, rescode, resmsg):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : eximbay_registration_end \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if rescode == "0000":
            content = get_payment_redirection_html(self.front_url, 'success')
        else:
            content = get_payment_redirection_html(self.front_url, 'fail')
            self.utilClass.sendSlackMessageV2(
                f"eximbay_registration_redirect 카드 등록 실패 : USER ID : {user['id']}\n{resmsg}",
                self.utilClass.slackPGRegistrationFail)
        return content


    def session_start(self, token, url):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : getPgRegistrationHistory \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        user_id = user.id
        stripe_id = user.stripeID

        try:
            if stripe_id is None:
                customer = self.stripe.Customer.create(
                    email=user.email
                )
                stripe_id = customer.id
                user.stripeID = stripe_id
                user.save()

            checkout_session = self.stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="setup",
                customer=stripe_id,
                success_url=url + "?session_id={CHECKOUT_SESSION_ID}",
                cancel_url=url
            )
            result = {
                'checkout_session': checkout_session
            }
            return HTTP_200_OK, result
        except:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : getPgRegistrationHistory \n결제정보 불러오던 중 에러 | User Id : {user_id}",
                appError=True, userInfo=user)
            return NOT_FOUND_PGREGISTER_ERROR

    def session_end(self, token):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : session_end \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        stripe_id = user.stripeID
        if stripe_id is not None:
            try:
                payment_methods = self.stripe.PaymentMethod.list(
                    customer=stripe_id,
                    type="card",
                )
                methods_count = len(payment_methods.data)
                if methods_count > 1:
                    for i in range(1, methods_count):
                        stripe.PaymentMethod.detach(
                            payment_methods.data[i].id
                        )
                self.stripe.Customer.modify(
                    stripe_id,
                    invoice_settings={
                        'default_payment_method': payment_methods.data[0].id
                    }
                )
            except:
                self.utilClass.sendSlackMessage(
                    f"파일 : managePayment.py \n함수 : session_end \nStripe 결제정보 등록 중 에러 | User Id : {user.id}",
                    appError=True, userInfo=user)
                return NOT_FOUND_PGREGISTER_ERROR
            try:
                data={}
                data['user'] = user.id
                data['PCD_PAY_RST'] = 'success'
                data['PCD_PAY_TYPE'] = 'card'
                data['PCD_PAYER_NO'] = user.id
                data['PCD_PAYER_ID'] = payment_methods.data[0].id
                data['PCD_PAY_CARDNUM'] = f"****-****-****-{payment_methods.data[0].card.last4}"
                data['PCD_PAY_CODE'] = stripe_id

                self.dbClass.createPgRegistration(data)

                existCardInfo = user.cardInfo
                user.cardInfo = data['PCD_PAY_CODE']

                self.utilClass.sendSlackMessageV2(
                    f"카드 등록 성공 : USER ID : {user.id}\n{json.dumps(data, indent=4, ensure_ascii=False)}",
                    self.utilClass.slackPGRegistrationSuccess)

                if not user.isFirstplanDone:
                    user.isFirstplanDone = True
                    user.usageplan = self.dbClass.getOneUsageplanByPlanName("business")["id"]
                    user.dynos = 1
                    user.nextPaymentDate = datetime.datetime.utcnow().replace(day=int(user.paymentDay)) + relativedelta(
                        months=1)
                    user.nextPlan = self.dbClass.getOneUsageplanByPlanName("basic")["id"]
                    self.dbClass.updateUser(user.id, {
                        'isFirstplanDone': user.isFirstplanDone,
                        'usageplan': user.usageplan,
                        'dynos': user.dynos,
                        'nextPaymentDate': user.nextPaymentDate,
                        'nextPlan': user.nextPlan,
                        'cardInfo': user.cardInfo,
                    })

                self.dbClass.updateUser(user.id, {
                    'cardInfo': user.cardInfo
                })

                if user.cardInfo:
                    self.remove_registration_card(existCardInfo, user)

                return HTTP_200_OK, {'result': 'success'}
            except:
                self.utilClass.sendSlackMessageV2(
                    f"Stripe -> DB 카드 등록 실패 : USER ID : {user.id}\n{json.dumps(data, indent=4, ensure_ascii=False)}",
                    self.utilClass.slackPGRegistrationFail)
                return NOT_FOUND_PGREGISTER_ERROR
        else:
            return NOT_FOUND_USER_ERROR

    def payment_intent(self, token):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : getPgRegistrationHistory \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        stripe_id = user.stripeID
        payment_methods = self.stripe.PaymentMethod.list(
            customer=stripe_id,
            type="card",
        )
        result = stripe.PaymentIntent.create(
            amount=2000,
            currency="usd",
            payment_method_types=["card"],
            capture_method="automatic",
            confirm=True,
            payment_method=payment_methods.data[0].id,
            customer=stripe_id
        )
        return HTTP_200_OK, result

    def purchase_model(self, token, project_id, model_id, amount):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : getPgRegistrationHistory \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        new_deposit = user['deposit'] - amount
        if new_deposit < 0:
            return HTTP_402_PAYMENT_REQUIRED, {'result': 'fail'}

        self.dbClass.updateUserDeposit(user['id'], amount)

        self.utilClass.sendSlackMessageV2(
            f"Payple 모델 라이센스 결제 처리 성공\n "
            f"USER ID : {user['id']}, 결제 Credit : {amount} Credit\n"
            f"Project ID : {project_id}, Model ID : {model_id}",
            self.utilClass.slackPGPaymentSuccess)

        return HTTP_200_OK, {'result': 'success'}

    def get_pgpayment_history(self, token, provider):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : getPgPaymentHistory \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise ex.NotFoundUserEx(token)

        if provider == "DS2.ai":
            result = {}
            type_list = ['prePaymentHistory', 'postPaymentHistory', 'modelPlanPaymentHistory']
            for type_name in type_list:
                history_raws = self.dbClass.getPgpaymenthistoriesByUserId(user["id"], type_name)
                history_list = []
                for history in history_raws:
                    # tmp = {'PCD_PAY_TIME': history.created_at,
                    #        'PCD_PAY_TOTAL': history.PCD_PAY_TOTAL,
                    #        'PCD_PAY_CARDNAME': history.PCD_PAY_CARDNAME,
                    #        'PCD_PAY_CARDNUM': history.PCD_PAY_CARDNUM,
                    #        'PCD_PAY_CARDRECEIPT': history.PCD_PAY_CARDRECEIPT,}
                    history_list.append(history.__data__)
                result[type_name] = history_list

        return HTTP_200_OK, result

    def get_pgpayment_history_detail(self, token, year, month):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : regenerateAppToken \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        amount_history = self.dbClass.get_Amount_history_by_user_id(user['id'], year, month)
        payment_history = self.dbClass.get_postpaid_payment_history_by_user_id(user['id'], year, month)
        if amount_history:
            amount_history['usedFromDate'] = datetime.datetime.strftime(amount_history.get('paidFromDate'), '%Y-%m-%d')
            amount_history['usedToDate'] = datetime.datetime.strftime(amount_history.get('paidToDate') - relativedelta(days=1), '%Y-%m-%d')
            if amount_history['isPaid'] is not True:
                amount_history['paidDate'] = None
                amount_history['usedPrice'] = 0
                amount_history['usedDeposit'] = 0
            else:
                amount_history['paidDate'] = datetime.datetime.strftime(amount_history.get('updated_at'), '%Y-%m-%d')
                if payment_history is None:
                    amount_history['usedPrice'] = 0
                    amount_history['usedDeposit'] = amount_history['usedTotalPrice']
                else:
                    if payment_history.get('currency') == 'krw':
                        payment_price = round(payment_history.get('price') / self.utilClass.usd_to_krw_rate, 2)
                    else:
                        payment_price = payment_history.get('price')
                    amount_history['usedPrice'] = payment_price
                    amount_history['usedDeposit'] = round(amount_history['usedTotalPrice'] - payment_price, 3)

            upload_price = self.dbClass.get_price_with_pricing_name("DataUp", raw=True)
            magic_code_price = self.dbClass.get_price_with_pricing_name("Magic", raw=True)
            label_cr_price = self.dbClass.get_price_with_pricing_name("CR", raw=True)
            label_od_price = self.dbClass.get_price_with_pricing_name("OD", raw=True)
            label_key_price = self.dbClass.get_price_with_pricing_name("LabelKey", raw=True)
            label_ped_price = self.dbClass.get_price_with_pricing_name("LabelPed", raw=True)
            label_sem_price = self.dbClass.get_price_with_pricing_name("LabelSem", raw=True)
            label_face_price = self.dbClass.get_price_with_pricing_name("LabelFace", raw=True)
            label_di_price = self.dbClass.get_price_with_pricing_name("LabelDI", raw=True)
            label_ocr_price = self.dbClass.get_price_with_pricing_name("LabelOCR", raw=True)

            price_per_giga = upload_price.price
            disk_gb = math.ceil(amount_history['cumulativeDiskUsage'] / (1 * 1024 * 1024 * 1024))
            upload_amount = disk_gb * price_per_giga
            amount_history['diskUsage'] = upload_amount

            train_hour = math.ceil(amount_history['trainingSecondCount'] / 3600)
            price_per_train = label_cr_price.price
            training_amount = train_hour * price_per_train
            amount_history['trainingUsage'] = training_amount

            price_per_magic = magic_code_price.price
            magic_amount = amount_history['magicCodeCount'] * price_per_magic
            amount_history['magicCode'] = magic_amount

            amount_history['manuallabelingCR'] = amount_history['manuallabelingCountCR'] * label_cr_price.manuallabelingPerCount
            amount_history['manuallabelingOD'] = (amount_history['manuallabelingCountOD'] * label_od_price.manuallabelingPerCount) + \
                                                 (amount_history['manualObjectCountOD'] * label_od_price.manuallabelingPerObject)
            amount_history['autolabelingCR'] = amount_history['autolabelingCountCR'] * label_cr_price.autolabelingPerCount
            amount_history['autolabelingOD'] = (amount_history['autolabelingCountOD'] * label_od_price.autolabelingPerCount) + \
                                               (amount_history['autolabelingObjectCountOD'] * label_od_price.autolabelingPerObject)
            amount_history['autolabelingKeypoint'] = (amount_history['autolabelingCountKeypoint'] * label_key_price.autolabelingPerCount) + \
                                                     (amount_history['autolabelingObjectCountKeypoint'] * label_key_price.autolabelingPerObject)
            amount_history['autolabelingPedestrian'] = (amount_history['autolabelingCountPedestrian'] * label_ped_price.autolabelingPerCount) + \
                                                       (amount_history['autolabelingObjectCountPedestrian'] * label_ped_price.autolabelingPerObject)
            amount_history['autolabelingSementic'] = amount_history['autolabelingCountSementic']
            amount_history['autolabelingFace'] = (amount_history['autolabelingCountFace'] * label_face_price.autolabelingPerCount) + \
                                                 (amount_history['autolabelingObjectCountFace'] * label_face_price.autolabelingPerObject)
            amount_history['autolabelingDI'] = (amount_history['autolabelingCountDI'] * label_di_price.autolabelingPerCount) + \
                                               (amount_history['autolabelingObjectCountDI'] * label_di_price.autolabelingPerObject)
            amount_history['autolabelingOCR'] = (amount_history['autolabelingCountOCR'] * label_ocr_price.autolabelingPerCount) + \
                                                (amount_history['autolabelingObjectCountOCR'] * label_ocr_price.autolabelingPerObject)
            # 예측 계산
            amount_history['inferenceCR'] = amount_history['inferenceCountCR'] * label_cr_price.inferencePerCount
            amount_history['inferenceOD'] = amount_history['inferenceCountOD'] * label_od_price.inferencePerCount
            amount_history['inferenceKeypoint'] = amount_history['inferenceCountKeypoint'] * label_key_price.inferencePerCount
            amount_history['inferencePedestrian'] = amount_history['inferenceCountPedestrian'] * label_ped_price.inferencePerCount
            amount_history['inferenceSementic'] = amount_history['inferenceCountSementic'] * label_sem_price.inferencePerCount
            amount_history['inferenceFace'] = amount_history['inferenceCountFace'] * label_face_price.inferencePerCount
            amount_history['inferenceDI'] = amount_history['inferenceCountDI'] * label_di_price.inferencePerCount
            amount_history['inferenceOCR'] = amount_history['inferenceCountOCR'] * label_ocr_price.inferencePerCount

            del amount_history['id']
            del amount_history['manuallabelingCountKeypoint']
            del amount_history['manuallabelingCountPedestrian']
            del amount_history['manuallabelingCountSementic']
            del amount_history['manuallabelingCountFace']
            del amount_history['manualObjectCountKeypoint']
            del amount_history['manualObjectCountPedestrian']
            del amount_history['manualObjectCountFace']
            del amount_history['cumulativeDiskUsage']
            del amount_history['manuallabelingCountCR']
            del amount_history['manuallabelingCountOD']
            del amount_history['manualObjectCountOD']
            del amount_history['autolabelingCountCR']
            del amount_history['autolabelingCountOD']
            del amount_history['autolabelingObjectCountOD']
            del amount_history['autolabelingCountKeypoint']
            del amount_history['autolabelingObjectCountKeypoint']
            del amount_history['autolabelingCountPedestrian']
            del amount_history['autolabelingObjectCountPedestrian']
            del amount_history['autolabelingCountSementic']
            del amount_history['autolabelingCountFace']
            del amount_history['autolabelingObjectCountFace']
            del amount_history['autolabelingCountDI']
            del amount_history['autolabelingObjectCountDI']
            del amount_history['autolabelingCountOCR']
            del amount_history['autolabelingObjectCountOCR']
            del amount_history['inferenceCountCR']
            del amount_history['inferenceCountOD']
            del amount_history['inferenceCountKeypoint']
            del amount_history['inferenceCountPedestrian']
            del amount_history['inferenceCountSementic']
            del amount_history['inferenceCountFace']
            del amount_history['inferenceCountDI']
            del amount_history['inferenceCountOCR']
            del amount_history['trainingSecondCount']
            del amount_history['magicCodeCount']
            del amount_history['remainLabelCount']
            del amount_history['paidFromDate']
            del amount_history['paidToDate']
            del amount_history['created_at']
            del amount_history['updated_at']

        if amount_history is not None:
            for key, value in amount_history.items():
                if type(value) == float:
                    amount_history[key] = round(value, 2)

        return HTTP_200_OK, amount_history

    def addPgRegistration(self, pgRegistrationInfo, teamId=None):
        # 카드 등록하는 부분
        try:
            user = self.dbClass.getOneUserById(int(pgRegistrationInfo.PCD_PAYER_NO), raw=True)
        except:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : addPgRegistration \n잘못된 PCD_PAYER_NO | 입력한 카드 가입정보 : {pgRegistrationInfo}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
            pass

        data = pgRegistrationInfo.__dict__
        try:
            pgType = data['PCD_PAY_OID'].split("_")[0]
            url = data['PCD_PAY_OID'].split("_")[1]
            payment_type = data['PCD_PAY_OID'].split("_")[2]
        except:
            pgType = ""
            payment_type = ""
            url = pgRegistrationInfo.PCD_USER_DEFINE1
        if data['PCD_PAY_RST'] == 'close':
            return HTTP_301_MOVED_PERMANENTLY, RedirectResponse(
                url=url + "?paid=false", status_code=301)
        else:
            try:
                data['user'] = user.id
                data['teamId'] = teamId
                data['pg_provider'] = 'payple'
                if 'success' in pgRegistrationInfo.PCD_PAY_RST:
                    if "payment" in pgType:
                        today = datetime.datetime.utcnow()
                        todaydate = today.strftime('%Y%m%d')

                        authUrl = f"{self.utilClass.paypleURL}/php/auth.php"
                        payplePayload = json.loads(self.utilClass.payplePayload)
                        payplePayload.update({"PCD_PAYCHK_FLAG": "Y"})
                        authData = json.dumps(payplePayload)
                        authResultRaw = requests.request("POST", authUrl,
                                                                 data=authData,
                                                                 headers=self.utilClass.paypleHeaders)
                        authResult = json.loads(authResultRaw.text)
                        verifyUrl = f"{self.utilClass.paypleURL}/php/PayChkAct.php"
                        payload = {
                            "PCD_CST_ID": authResult["cst_id"],
                            "PCD_CUST_KEY": authResult["custKey"],
                            "PCD_AUTH_KEY": authResult["AuthKey"],
                            "PCD_PAYCHK_FLAG": "Y",
                            "PCD_PAY_TYPE": "card",
                            "PCD_PAY_OID": pgRegistrationInfo.PCD_PAY_OID,
                            "PCD_PAY_DATE": todaydate,
                            # "PCD_REGULER_FLAG": "Y",
                            "PCD_SIMPLE_FLAG": "Y",
                            # "PCD_PAY_YEAR": today.year,
                            # "PCD_PAY_MONTH": today.month,
                        }
                        result = json.loads(requests.request("POST", verifyUrl,
                                                             data=json.dumps(payload),
                                                             headers=self.utilClass.paypleHeaders).text)
                        if not "완료" in result["PCD_PAY_MSG"]:
                            self.utilClass.sendSlackMessageV2(
                                f"어뷰징이 의심되니 확인 필요 : USER ID : {user.id}\n{json.dumps(data,indent=4, ensure_ascii=False)}",
                                self.utilClass.slackPGPaymentFail)
                            return HTTP_301_MOVED_PERMANENTLY, RedirectResponse(
                                url=url + "?pg=false", headers={}, status_code=301)
                        else:
                            paidInfo = {
                                "user": user.id,
                                "price": pgRegistrationInfo.PCD_PAY_TOTAL,
                                "currency": 'krw',
                                "PCD_PAY_RST": pgRegistrationInfo.PCD_PAY_RST,
                                "PCD_PAY_CODE": pgRegistrationInfo.PCD_PAY_CODE,
                                "PCD_PAY_MSG": pgRegistrationInfo.PCD_PAY_MSG,
                                "PCD_PAY_OID": pgRegistrationInfo.PCD_PAY_OID,
                                "PCD_PAYER_NO": pgRegistrationInfo.PCD_PAYER_NO,
                                "PCD_PAYER_ID": pgRegistrationInfo.PCD_PAYER_ID,
                                "PCD_PAYER_NAME": pgRegistrationInfo.PCD_PAYER_NAME,
                                "PCD_PAYER_HP": pgRegistrationInfo.PCD_PAYER_HP,
                                "PCD_PAYER_EMAIL": pgRegistrationInfo.PCD_PAYER_EMAIL,
                                "PCD_PAY_TOTAL": pgRegistrationInfo.PCD_PAY_TOTAL,
                                "PCD_PAY_TAXTOTAL": pgRegistrationInfo.PCD_PAY_TAXTOTAL,
                                "PCD_PAY_ISTAX": pgRegistrationInfo.PCD_PAY_ISTAX,
                                "PCD_PAY_TIME": pgRegistrationInfo.PCD_PAY_TIME,
                                "PCD_PAY_CARDNAME": pgRegistrationInfo.PCD_PAY_CARDNAME,
                                "PCD_PAY_CARDNUM": pgRegistrationInfo.PCD_PAY_CARDNUM,
                                "PCD_PAY_CARDTRADENUM": pgRegistrationInfo.PCD_PAY_CARDTRADENUM,
                                "PCD_PAY_CARDAUTHNO": pgRegistrationInfo.PCD_PAY_CARDAUTHNO,
                                "PCD_PAY_CARDRECEIPT": pgRegistrationInfo.PCD_PAY_CARDRECEIPT,
                                "PCD_USER_DEFINE1": pgRegistrationInfo.PCD_USER_DEFINE1,
                                "PCD_USER_DEFINE2": pgRegistrationInfo.PCD_USER_DEFINE2
                            }

                            # self.actionForSuccessPayment(user, data, dateUploaded, True)
                            if payment_type == "credit":
                                paidInfo["PCD_PAY_TYPE"] = "prepaid"
                                paidInfo["PCD_PAY_GOODS"] = "DS2.ai 선불 충전"

                                new_deposit = 0
                                item_list = pgRegistrationInfo.PCD_USER_DEFINE1.split(',')
                                for item in item_list:
                                    colums = item.split('_')
                                    name = colums[0]
                                    count = colums[1]
                                    amount_with_tax = colums[2]
                                    item_amount = float(amount_with_tax) * (10 / 11)
                                    item_amount = item_amount / self.utilClass.usd_to_krw_rate
                                    if name == 'first':
                                        item_deposit = round(item_amount * int(count), 2)
                                    else:
                                        item_deposit = round((item_amount * 1.05) * int(count), 2)
                                    new_deposit += item_deposit

                                added_deposit = round(float(user.deposit) + new_deposit, 2)
                                self.dbClass.updateUser(user.id, {'deposit': added_deposit})
                                self.utilClass.sendSlackMessageV2(
                                    f"Payple 선불 충전 처리 성공, USER ID : {user.id}\n"
                                    f"결제 금액 : {pgRegistrationInfo.PCD_PAY_TOTAL}원, 충전 CREDIT : {new_deposit}\n "
                                    f"충전 전 CREDIT: {round(user.deposit, 2)}, 충전 후 CREDIT: {added_deposit}\n",
                                    self.utilClass.slackPGPaymentSuccess)
                            # elif payment_type == "model":
                            #     paidInfo["PCD_PAY_TYPE"] = "modelpaid"
                            #     paidInfo["PCD_PAY_GOODS"] = "DS2.ai 모델 라이센스 구매"
                            #     ids = pgRegistrationInfo.PCD_USER_DEFINE1.split('_')
                            #     project_id = ids[0]
                            #     model_id = ids[1]
                            #     self.utilClass.sendSlackMessageV2(
                            #         f"Payple 모델 라이센스 결제 처리 성공\n "
                            #         f"USER ID : {user.id}, 결제 금액 : {pgRegistrationInfo.PCD_PAY_TOTAL}원"
                            #         f"Project ID : {project_id}, Model ID : {model_id}",
                            #         self.utilClass.slackPGPaymentSuccess)
                            self.dbClass.createPgPayment(paidInfo)
                            return HTTP_301_MOVED_PERMANENTLY, RedirectResponse(
                                url=url + "?paid=true", headers={}, status_code=301)
                    else:
                        authUrl = f"{self.utilClass.paypleURL}/php/auth.php"
                        payplePayload = json.loads(self.utilClass.payplePayload)
                        payplePayload.update({"PCD_PAY_WORK": "PUSERINFO"})
                        authData = json.dumps(payplePayload)
                        authResult = json.loads(requests.request("POST", authUrl,
                                                                 data=authData,
                                                                 headers=self.utilClass.paypleHeaders).text)
                        verifyUrl = f"{self.utilClass.paypleURL}/php/cPayUser/api/cPayUserAct.php?ACT_=PUSERINFO"
                        payload = {
                            "PCD_CST_ID": authResult["cst_id"],
                            "PCD_CUST_KEY": authResult["custKey"],
                            "PCD_AUTH_KEY": authResult["AuthKey"],
                            "PCD_PAYCHK_FLAG": "Y",
                            "PCD_PAY_TYPE": "card",
                            "PCD_PAYER_ID": pgRegistrationInfo.PCD_PAYER_ID,
                        }
                        result = json.loads(requests.request("POST", verifyUrl,
                                                             data=json.dumps(payload),
                                                             headers=self.utilClass.paypleHeaders).text)

                        # self.resetPaymentInfoForTest(data) #TEST

                        if result["PCD_PAYER_ID"] != data["PCD_PAYER_ID"]:
                            if data.get('PCD_PAY_OID'):
                                oid = data.pop('PCD_PAY_OID')
                                pcd_pay_cardreceipt = data.pop('PCD_PAY_CARDRECEIPT')
                                self.utilClass.sendSlackMessageV2(
                                    f"어뷰징이 의심되니 확인 필요 : USER ID : {user.id}\n최종 결제 금액: {data['PCD_PAY_TOTAL']} 원\n{json.dumps(data,indent=4, ensure_ascii=False)}",
                                    self.utilClass.slackPGRegistrationFail)

                                data['PCD_PAY_OID'] = oid
                                data['PCD_PAY_CARDRECEIPT'] = pcd_pay_cardreceipt
                            else:
                                self.utilClass.sendSlackMessageV2(
                                    f"어뷰징이 의심되니 확인 필요 : USER ID : {user.id}\n최종 결제 금액: {data['PCD_PAY_TOTAL']} 원\n{json.dumps(data, indent=4, ensure_ascii=False)}",
                                    self.utilClass.slackPGRegistrationFail)
                            return HTTP_301_MOVED_PERMANENTLY, RedirectResponse(
                                url=url + "?pg=false", headers={}, status_code=301)
                        else:
                            user.cardInfo = pgRegistrationInfo.PCD_PAYER_ID
                            if "완료" in data["PCD_PAY_MSG"]:
                                self.utilClass.sendSlackMessageV2(
                                    f"카드 등록 성공 : USER ID : {user.id}\n{json.dumps(data,indent=4, ensure_ascii=False)}",
                                    self.utilClass.slackPGRegistrationSuccess)
                                if not user.isFirstplanDone:
                                    user.isFirstplanDone = True
                                    user.usageplan = self.dbClass.getOneUsageplanByPlanName("business")["id"]
                                    user.dynos = 1
                                    user.nextPaymentDate = datetime.datetime.utcnow().replace(
                                        day=int(user.paymentDay)) + relativedelta(months=1)
                                    user.nextPlan = self.dbClass.getOneUsageplanByPlanName("basic")["id"]
                                    self.dbClass.updateUser(user.id, {
                                        'isFirstplanDone': user.isFirstplanDone,
                                        'usageplan': user.usageplan,
                                        'dynos': user.dynos,
                                        'nextPaymentDate': user.nextPaymentDate,
                                        'nextPlan': user.nextPlan,
                                        'cardInfo': user.cardInfo,
                                    })
                            else:
                                self.utilClass.sendSlackMessageV2(
                                    f"기 등록 고객: USER ID : {user.id}\n{json.dumps(data,indent=4, ensure_ascii=False)}",
                                    self.utilClass.slackPGRegistrationSuccess)
                            # existCardInfo = self.dbClass.getLastPgRegistrationByUserId(user.id)
                            # if existCardInfo:
                            #     self.remove_registration_card(existCardInfo, user)
                            self.dbClass.createPgRegistration(data)
                            self.dbClass.updateUser(user.id, {
                                'cardInfo': user.cardInfo
                            })
                            try:
                                if self.utilClass.configOption in "prod" and not self.utilClass.check_aws_user_id(user.id):
                                    self.utilClass.set_aws_user_id(user.id)
                            except Exception as e:
                                self.utilClass.sendSlackMessageV2(
                                    e.detail,
                                    self.utilClass.slackPGRegistrationFail)
                            return HTTP_301_MOVED_PERMANENTLY, RedirectResponse(
                                url=url + "?pg=true", headers={}, status_code=301)

                else:
                    if "payment" in pgType:
                        self.utilClass.sendSlackMessageV2(
                            f"결제 실패 : USER ID : {user.id}\n{json.dumps(data,indent=4, ensure_ascii=False)}",
                            self.utilClass.slackPGRegistrationFail)

                        return HTTP_301_MOVED_PERMANENTLY, RedirectResponse(
                            url=url + "?paid=false", status_code=301)
                    else:
                        self.utilClass.sendSlackMessageV2(
                            f"카드 등록 실패 : USER ID : {user.id}\n{json.dumps(data,indent=4, ensure_ascii=False)}",
                            self.utilClass.slackPGRegistrationFail)

                        return HTTP_301_MOVED_PERMANENTLY, RedirectResponse(
                            url=url + "?pg=false", status_code=301)

            except Exception as e:
                print(traceback.format_exc())
                self.utilClass.sendSlackMessageV2(
                    f"카드 등록 실패 : USER ID : {user.id}\n{json.dumps(data,indent=4, ensure_ascii=False)}\n{e}",
                    self.utilClass.slackPGRegistrationFail)

                # self.resetPaymentInfoForTest(data)

                return HTTP_301_MOVED_PERMANENTLY, RedirectResponse(url=url + "?pg=false", status_code=301)
                pass

    def cancelUsage(self, token):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : cancelUsage \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        trialPlan = self.dbClass.getOneUsageplanByPlanName('trial')

        if user.get("nextPlan") == trialPlan['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment\n 함수: cancelUsage \n이용 취소를 신청한 고객이 또 신청하였습니다. user = {user})",
                appError=True,userInfo=user)
            return ALREADY_CANCELED_ERROR

        del user["token"]
        del user["password"]
        del user["resetPasswordToken"]
        del user["resetPasswordVerifyTokenID"]
        del user["appTokenCode"]
        self.utilClass.sendSlackMessage(f"이용 취소\n{json.dumps(user,indent=4, ensure_ascii=False, default=str)}", inquiry=True, userInfo=user)
        self.dbClass.updateUser(user['id'], {'nextDynos': None, 'nextPlan': trialPlan['id'], 'billingKey': None})
        return HTTP_200_OK, trialPlan['id']

    def remove_registration_card(self, exist_card_info, user):
        try:
            if exist_card_info['pg_provider'] == 'payple':
                self.payple_deactivate_exist_card(exist_card_info['PCD_PAYER_ID'], user.id)
            elif exist_card_info['pg_provider'] == 'eximbay':
                pass
            elif exist_card_info['pg_provider'] == 'stripe':
                stripe_id = user.stripeID
                payment_methods = self.stripe.PaymentMethod.list(
                    customer=stripe_id,
                    type="card",
                )
                methods_count = len(payment_methods.data)
                for i in range(methods_count):
                    stripe.PaymentMethod.detach(
                        payment_methods.data[i].id
                    )
        except:
            self.utilClass.sendSlackMessageV2(
                f"결제정보 제거 중 에러: USER ID : {user.id}\n결제모듈 : {exist_card_info['pg_provider']}",
                self.utilClass.slackPGRegistrationFail)

    def requestRefund(self, token):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : requestRefund \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR
        if user.get("isRequestedRefunded"):
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment\n 함수: requestRefund \n환불 요청한 고객이 또 환불 요청을하였습니다. user = {user})",
                appLog=True,userInfo=user)
            return ALREADY_REFUND_ERROR
        canceledPlan = self.dbClass.getOneUsageplanByPlanName('canceled')
        del user["token"]
        del user["password"]
        del user["resetPasswordToken"]
        del user["resetPasswordVerifyTokenID"]
        del user["appTokenCode"]
        self.utilClass.sendSlackMessage(f"환불 요구하였으므로 확인바람\n{json.dumps(user,indent=4, ensure_ascii=False, default=str)}", inquiry=True, userInfo=user)
        return HTTP_200_OK, self.dbClass.updateUser(user['id'], {
            'isRequestedRefunded': True,
            'nextDynos': None,
            'nextPlan': canceledPlan['id'],
            'billingKey': None,
        })

    def payple_deactivate_exist_card(self, payer_id, user_id):

        authInfo = json.loads(requests.request("POST", self.authURL, data=self.authPayload, headers=self.payple_headers).text)
        payload = {
            "PCD_CST_ID": authInfo['cst_id'],
            "PCD_CUST_KEY": authInfo['custKey'],
            "PCD_AUTH_KEY": authInfo['AuthKey'],
            "PCD_PAYER_ID": payer_id,
            "PCD_PAYER_NO": user_id
        }
        requests.request("POST", self.cancelURL, data=json.dumps(payload), headers=self.payple_headers)

    def get_usage_amount_by_user(self, user):

        if type(user) != dict:
            user = user.__dict__['__data__']
        connector_price = 0
        annotation_price = 0
        model_price = 0
        deploy_price = 0
        market_price = 0

        try:
            upload_price = self.dbClass.get_price_with_pricing_name("DataUp", raw=True)
            magic_code_price = self.dbClass.get_price_with_pricing_name("Magic", raw=True)
            label_cr_price = self.dbClass.get_price_with_pricing_name("CR", raw=True)
            label_od_price = self.dbClass.get_price_with_pricing_name("OD", raw=True)
            label_key_price = self.dbClass.get_price_with_pricing_name("LabelKey", raw=True)
            label_ped_price = self.dbClass.get_price_with_pricing_name("LabelPed", raw=True)
            label_sem_price = self.dbClass.get_price_with_pricing_name("LabelSem", raw=True)
            label_face_price = self.dbClass.get_price_with_pricing_name("LabelFace", raw=True)
            label_di_price = self.dbClass.get_price_with_pricing_name("LabelDI", raw=True)
            label_ocr_price = self.dbClass.get_price_with_pricing_name("LabelOCR", raw=True)

            disk_gb = math.ceil(user.get('cumulativeDiskUsage', 0) / (1 * 1024 * 1024 * 1024))
            price_per_giga = upload_price.price
            upload_amount = disk_gb * price_per_giga
            connector_price += upload_amount

            train_hour = math.ceil(user.get('trainingSecondCount', 0) / 3600)
            price_per_train = label_cr_price.price
            training_amount = train_hour * price_per_train
            model_price += training_amount

            price_per_magic = magic_code_price.price
            magic_amount = user.get('magicCodeCount', 0) * price_per_magic
            model_price += magic_amount

            market_usages = self.dbClass.get_market_usages(user.get('id'))
            for market_usage in market_usages:
                market_model_usage_count = market_usage.inferenceCount
                market_model_id = market_usage.marketModelId
                market_model_price = self.dbClass.getOneMarketModelById(market_model_id).price
                market_model_amount = market_model_usage_count * market_model_price
                market_price += market_model_amount
        except:
            raise ex.PricingErrorEx(user.get('email'))

        annotation_price += user.get('manuallabelingCountCR', 0) * label_cr_price.manuallabelingPerCount
        annotation_price += user.get('manuallabelingCountOD', 0) * label_od_price.manuallabelingPerCount
        # annotation_price += user.get('manuallabelingCountKeypoint', 0) * label_key_price.manuallabelingPerCount
        # annotation_price += user.get('manuallabelingCountPedestrian', 0) * label_ped_price.manuallabelingPerCount
        # annotation_price += user.get('manuallabelingCountSementic', 0) * label_sem_price.manuallabelingPerCount

        annotation_price += user.get('manualObjectCountOD', 0) * label_od_price.manuallabelingPerObject
        # annotation_price += user.get('manualObjectCountKeypoint', 0) * label_key_price.manuallabelingPerObject
        # annotation_price += user.get('manualObjectCountPedestrian', 0) * label_ped_price.manuallabelingPerObject
        # annotation_price += user.get('manualObjectCountSementic', 0) * label_sem_price.manuallabelingPerObject

        annotation_price += user.get('autolabelingCountCR', 0) * label_cr_price.autolabelingPerCount
        annotation_price += user.get('autolabelingCountOD', 0) * label_od_price.autolabelingPerCount
        annotation_price += user.get('autolabelingCountKeypoint', 0) * label_key_price.autolabelingPerCount
        annotation_price += user.get('autolabelingCountPedestrian', 0) * label_ped_price.autolabelingPerCount
        annotation_price += user.get('autolabelingCountSementic', 0) * label_sem_price.autolabelingPerCount
        annotation_price += user.get('autolabelingCountFace', 0) * label_face_price.autolabelingPerCount
        annotation_price += user.get('autolabelingCountDI', 0) * label_di_price.autolabelingPerCount
        annotation_price += user.get('autolabelingCountOCR', 0) * label_ocr_price.autolabelingPerCount

        annotation_price += user.get('autolabelingObjectCountOD', 0) * label_od_price.autolabelingPerObject
        annotation_price += user.get('autolabelingObjectCountKeypoint', 0) * label_key_price.autolabelingPerObject
        annotation_price += user.get('autolabelingObjectCountPedestrian', 0) * label_ped_price.autolabelingPerObject
        annotation_price += user.get('autolabelingObjectCountFace', 0) * label_face_price.autolabelingPerObject
        annotation_price += user.get('autolabelingObjectCountDI', 0) * label_di_price.autolabelingPerObject
        annotation_price += user.get('autolabelingObjectCountOCR', 0) * label_ocr_price.autolabelingPerObject

        model_price += user.get('inferenceCountCR', 0) * label_cr_price.inferencePerCount
        model_price += user.get('inferenceCountOD', 0) * label_od_price.inferencePerCount

        market_price += user.get('inferenceCountKeypoint', 0) * label_key_price.inferencePerCount
        market_price += user.get('inferenceCountPedestrian', 0) * label_ped_price.inferencePerCount
        market_price += user.get('inferenceCountSementic', 0) * label_sem_price.inferencePerCount
        market_price += user.get('inferenceCountFace', 0) * label_face_price.inferencePerCount
        market_price += user.get('inferenceCountDI', 0) * label_di_price.inferencePerCount
        market_price += user.get('inferenceCountOCR', 0) * label_ocr_price.inferencePerCount

        deploy_price = user.get('serverUsedPrice', 0)

        last_amount_info = self.dbClass.getLastAmountByUserId(user.get('id'), raw=True)
        current_day = datetime.datetime.now().date()
        end_date = current_day.strftime('%Y-%m-%d')
        if last_amount_info is not None:
            last_amount_end_date = last_amount_info.paidToDate
            start_date = last_amount_end_date.strftime('%Y-%m-%d')
        else:
            first_day_month_ago = user.get('nextPaymentDate').date() - relativedelta(months=1)
            start_date = first_day_month_ago.strftime('%Y-%m-%d')

        connector_price = round(connector_price, 3)
        model_price = round(model_price, 3)
        annotation_price = round(annotation_price, 3)
        deploy_price = round(deploy_price, 3)
        market_price = round(market_price, 3)

        total_price = connector_price + model_price + annotation_price + deploy_price + market_price
        total_price = round(total_price, 3)
        price_name_list = ['connector_price', 'annotation_price', 'model_price', 'deploy_price',
                           'market_price', 'total_price']
        price_list = [connector_price, annotation_price, model_price, deploy_price, market_price, total_price]
        result = {}
        for idx in range(len(price_list)):
            result[price_name_list[idx]] = price_list[idx]

        return result, start_date, end_date

    def get_payple_auth_info(self):
        try:
            auth_result = json.loads(
                requests.request("POST", self.authURL, data=self.authPayload, headers=self.payple_headers).text)
            if auth_result.get('result') and auth_result.get('result') == 'success':
                return auth_result
            else:
                raise Exception()
        except:
            self.utilClass.sendSlackMessageV2(
                f"Payple 인증 실패",
                self.utilClass.slackPGPaymentFail)
            return None

    # https://developer.payple.kr/integration/recurring-payment
    def pay_with_payle(self, user, card_info, pay_info):

        amount = float(pay_info.get('amount')) if pay_info.get('amount') else None
        total_amount = pay_info.get('total_amount', amount)
        item_name = pay_info.get('item_name')
        pay_type = pay_info.get('pay_type')
        paid_info = {}

        payple_auth_info = self.get_payple_auth_info()
        # 페이플 인증 실패 상태인 경우
        if payple_auth_info is None:
            paid_info['PCD_PAY_RST'] = 'error'
            return paid_info

        paymentInfo = {
            "PCD_CST_ID": payple_auth_info['cst_id'],
            "PCD_CUST_KEY": payple_auth_info['custKey'],
            "PCD_AUTH_KEY": payple_auth_info['AuthKey'],
            "PCD_PAY_TYPE": "card",
            "PCD_PAYER_ID": card_info.get("PCD_PAYER_ID"),
            # "PCD_PAY_OID": f"ds2_{user['id']}_{time.strftime('%y%m%d%H%M%S')}",
            "PCD_PAYER_NO": card_info.get("user"),
            "PCD_PAYER_EMAIL": user['email'],
            "PCD_PAY_GOODS": item_name,
            "PCD_PAY_TOTAL": amount,
            # "PCD_PAY_ISTAX": "Y",
            # "PCD_PAY_TAXTOTAL": round(amount / 10, 2),
            # "PCD_PAY_YEAR": f"{self.datetimeInfo.year}",
            # "PCD_PAY_MONTH": f"{self.datetimeInfo.month}",
            # "PCD_PAY_MONTH": "6",
            # "PCD_REGULER_FLAG": "N",
            "PCD_SIMPLE_FLAG": "Y"
        }
        paymentResponseRaw = requests.request("POST",
                                              f"{payple_auth_info['PCD_PAY_HOST']}{payple_auth_info['PCD_PAY_URL']}",
                                              data=json.dumps(paymentInfo),
                                              headers=self.payple_headers).text
        paymentResponse = json.loads(paymentResponseRaw)

        paid_info = {
            "user": user['id'],
            "usedTotalPrice": total_amount,
            "price": amount,
            "currency": 'krw',
            "pgregistrationhistory": card_info['id'],
            "PCD_PAY_RST": paymentResponse["PCD_PAY_RST"],
            "PCD_PAY_CODE": paymentResponse["PCD_PAY_CODE"],
            "PCD_PAY_MSG": paymentResponse["PCD_PAY_MSG"],
            "PCD_PAY_OID": paymentResponse["PCD_PAY_OID"],
            "PCD_PAY_TYPE": pay_type,
            "PCD_PAYER_NO": paymentResponse["PCD_PAYER_NO"],
            "PCD_PAYER_ID": paymentResponse["PCD_PAYER_ID"],
            "PCD_PAYER_NAME": paymentResponse["PCD_PAYER_NAME"],
            "PCD_PAYER_HP": paymentResponse["PCD_PAYER_HP"],
            "PCD_PAYER_EMAIL": paymentResponse["PCD_PAYER_EMAIL"],
            "PCD_PAY_YEAR": f"{self.datetimeInfo.year}",
            "PCD_PAY_MONTH": f"{self.datetimeInfo.month}",
            "PCD_PAY_GOODS": paymentResponse["PCD_PAY_GOODS"],
            "PCD_PAY_TOTAL": paymentResponse["PCD_PAY_TOTAL"],
            "PCD_PAY_TAXTOTAL": paymentResponse["PCD_PAY_TAXTOTAL"],
            "PCD_PAY_ISTAX": paymentResponse["PCD_PAY_ISTAX"],
            "PCD_PAY_TIME": paymentResponse["PCD_PAY_TIME"],
            "PCD_PAY_CARDNAME": paymentResponse["PCD_PAY_CARDNAME"],
            "PCD_PAY_CARDNUM": paymentResponse["PCD_PAY_CARDNUM"],
            "PCD_PAY_CARDTRADENUM": paymentResponse["PCD_PAY_CARDTRADENUM"],
            "PCD_PAY_CARDAUTHNO": paymentResponse["PCD_PAY_CARDAUTHNO"],
            "PCD_PAY_CARDRECEIPT": paymentResponse["PCD_PAY_CARDRECEIPT"],
            # "PCD_REGULER_FLAG": paymentResponse["PCD_REGULER_FLAG"],
            "PCD_USER_DEFINE1": paymentResponse["PCD_USER_DEFINE1"],
            "PCD_USER_DEFINE2": paymentResponse["PCD_USER_DEFINE2"]
        }
        return paid_info

    def pay_with_eximbay(self, user, card_info, pay_info):

        amount = pay_info.get('amount')
        total_amount = pay_info.get('total_amount', amount)
        item_name = pay_info.get('item_name')
        pay_type = pay_info.get('pay_type')

        paid_info = {}
        timestamp = time.strftime('%y%m%d%H%M%S')
        ref = f"{user['id']}_{timestamp}"
        param_dict = {
            'tokenID': user['cardInfo'],
            'ver': self.utilClass.eximbay_version,
            'txntype': 'REBILL',
            'charset': 'UTF-8',
            'mid': self.exim_mid,
            'ref': ref,
            'ostype': 'P',
            'displaytype': 'P',
            'cur': 'USD',
            'amt': amount,
            'shop': 'DS2.ai',
            'buyer': user['email'].split('@')[0],
            'email': user['email'],
            'lang': 'EN',
        }
        param_dict_list = sorted(param_dict.items())
        params = ""
        for key, value in param_dict_list:
            params = f'{params}{key}={value}&'
        fgkey = f'{self.exim_key}?{params[:-1]}'
        fgkey_encypted = hashlib.sha256(fgkey.encode())
        param_dict['fgkey'] = fgkey_encypted.hexdigest()
        try:
            req = requests.post(self.exim_direct_url, data=param_dict)
            if req.status_code != HTTP_200_OK:
                paid_info['PCD_PAY_RST'] = 'error'
                return paid_info
            param_dict = {}
            response_params = req.text.split('&')
            for param in response_params:
                param_list = param.split('=')
                if len(param_list) > 1:
                    param_dict[param_list[0]] = param_list[1]
            if param_dict.get('rescode') != "0000":
                paid_info['PCD_PAY_RST'] = 'error'
                return paid_info
            if param_dict.get('amt') != amount:
                self.utilClass.sendSlackMessageV2(
                    f"eximbay 카드 결제 금액이 다름 : USER ID : {user['id']}\n"
                    f"사용 금액 : {amount}\n"
                    f"결제 금액 : {param_dict.get('amt')}\n"
                    f"{req.text}",
                    self.utilClass.slackPGRegistrationFail)
            paid_info['user'] = user['id']
            paid_info['usedTotalPrice'] = total_amount
            paid_info['price'] = param_dict.get('amt')
            paid_info['currency'] = 'usd'
            paid_info['pgregistrationhistory'] = card_info.get('id')
            paid_info['PCD_PAY_TYPE'] = pay_type
            paid_info['PCD_PAY_RST'] = 'success'
            paid_info['PCD_PAY_CODE'] = param_dict.get('ref')
            paid_info['PCD_PAY_MSG'] = '카드결제완료'
            paid_info['PCD_PAY_OID'] = f"ds2_{user['id']}_{self.datetimeInfo.date()}"
            paid_info['PCD_PAYER_NO'] = user['id']
            paid_info['PCD_PAYER_ID'] = card_info.get("PCD_PAYER_ID")
            paid_info['PCD_PAYER_EMAIL'] = user['email']
            paid_info['PCD_PAY_YEAR'] = f"{self.datetimeInfo.year}"
            paid_info['PCD_PAY_MONTH'] = f"{self.datetimeInfo.month}"
            paid_info['PCD_PAY_GOODS'] = item_name
            paid_info['PCD_PAY_TOTAL'] = amount
            paid_info['PCD_PAY_TAXTOTAL'] = round(amount / 10, 2)
            paid_info['PCD_PAY_ISTAX'] = "Y"
            paid_info['PCD_PAY_TIME'] = param_dict.get('resdt')
            paid_info['PCD_PAY_CARDNAME'] = param_dict.get('cardco')
            paid_info['PCD_PAY_CARDNUM'] = card_info.get("PCD_PAY_CARDNUM")
        except Exception as e:
            paid_info['PCD_PAY_RST'] = 'error'
            paid_info['PCD_PAY_MSG'] = e
        return paid_info

    # def pay_with_stripe(self, user, amount, card_info):
    #
    #     payment_methods = self.stripe.PaymentMethod.list(
    #         customer=user.stripeID,
    #         type="card",
    #     )
    #     try:
    #         result = self.stripe.PaymentIntent.create(
    #             amount=int(amount * 100),
    #             currency="usd",
    #             payment_method_types=["card"],
    #             capture_method="automatic",
    #             confirm=True,
    #             payment_method=payment_methods.data[0].id,
    #             customer=user.stripeID,
    #             receipt_email=user.email
    #         )
    #         paid_info = {
    #             "user": user.id,
    #             "amount": amount,
    #             "currency": currency,
    #             "pgregistrationhistory": card_info['id'],
    #             "PCD_PAY_TYPE" : "card",
    #             "PCD_PAY_RST": 'success',
    #             "PCD_PAY_CODE" : result.id,
    #             "PCD_PAY_MSG": '카드결제완료',
    #             "PCD_PAY_OID" : f"ds2_{user.id}_{self.datetimeInfo.date()}",
    #             "PCD_PAYER_NO" : user.id,
    #             "PCD_PAYER_ID" : card_info["PCD_PAYER_ID"],
    #             "PCD_PAYER_EMAIL" : user.email,
    #             "PCD_PAY_YEAR" : f"{self.datetimeInfo.year}",
    #             "PCD_PAY_MONTH" : f"{self.datetimeInfo.month}",
    #             "PCD_PAY_GOODS" : "DS2AI_사용량결제",
    #             "PCD_PAY_TOTAL" : amount,
    #             "PCD_PAY_TAXTOTAL" : round(amount / 10, 2),
    #             "PCD_PAY_ISTAX" : "Y",
    #             "PCD_PAY_TIME": result.created,
    #             "PCD_PAY_CARDNAME": payment_methods.data[0].card.brand,
    #             "PCD_PAY_CARDNUM": card_info["PCD_PAY_CARDNUM"],
    #             "PCD_PAY_CARDRECEIPT": result.charges.data[0].receipt_url
    #        }
    #     except Exception as e:
    #         paid_info['PCD_PAY_RST'] = 'error'
    #         paid_info['PCD_PAY_MSG'] = e
    #     return paid_info

    # 결제 성공 시 : True
    # 결제 실패 시 : False
    def payment_by_card(self, user, pay_info):

        user = user.__dict__['__data__'] if type(user) != dict else user
        currency = pay_info['currency']
        pay_type = pay_info['pay_type']

        paid_info = {}
        card_info = self.dbClass.getLastPgRegistrationByUserId(user['id'])
        try:
            if card_info is None:
                raise Exception()
            card_provider = card_info.get('pg_provider')
            # 국내 결제 카드인 경우
            if card_provider == 'payple':
                if currency == 'usd':
                    pay_info['amount'] = pay_info['amount'] * self.utilClass.usd_to_krw_rate
                    pay_info['currency'] = 'krw'
                pay_info['amount'] = pay_info['amount'] - (pay_info['amount'] % 100)
                paid_info = self.pay_with_payle(user, card_info, pay_info)
            # 해외 결제 카드인 경우
            elif card_provider == 'eximbay':
                if currency == 'krw':
                    pay_info['amount'] = pay_info['amount'] / self.utilClass.usd_to_krw_rate
                    pay_info['currency'] = 'usd'
                pay_info['amount'] = round(pay_info['amount'], 2)
                paid_info = self.pay_with_eximbay(user, card_info, pay_info)
            else:
                raise Exception()
            # ds2ai 모델 플랜 결제
            if pay_type == 'modelplanpaid':
                paid_info['usageplan'] = pay_info.get('plan_id')
                paid_info['success'] = True

            # 결제 내역 생성
            paid_info['paid_at_datetime'] = self.datetimeInfo
            paid_info['paid_at_datetime_ko'] = self.datetimeInfo + datetime.timedelta(hours=9)
            self.dbClass.createPgPayment(paid_info)

            if "success" in paid_info.get('PCD_PAY_RST'):
                self.utilClass.sendSlackMessageV2(
                    f"{'[개발]' if self.utilClass.configOption == 'dev' else '[운영]'} 카드 결제 성공 |\n"
                    f"| 유저 : {user['email']}({user['id']}) |\n"
                    f"| 금액 : {pay_info['amount']} {pay_info['currency']} |\n"
                    f"| 종류 : {pay_type} |\n",
                    self.utilClass.slackPGPaymentSuccess)
                return True
            else:
                raise Exception()
        except Exception:
            error_str = f"{'[개발]' if self.utilClass.configOption == 'dev' else '[운영]'} 카드 결제 실패 | \n" \
                        f"| 유저 : {user['email']}({user['id']}) |\n" \
                        f"| 금액 : {pay_info['amount']} {pay_info['currency']} |\n" \
                        f"| 종류 : {pay_type} |\n" \
                        f"| card_info |\n" \
                        f" {card_info}\n" \
                        f"| paid_info |\n" \
                        f" {self.dumps(paid_info)}\n" \
                        f"| traceback |\n " \
                        f"{str(traceback.format_exc())}"
            self.utilClass.sendSlackMessageV2(
                error_str,
                self.utilClass.slackPGPaymentFail)
            return False

    def purchase_model_plan(self, token, plan_data):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            # self.utilClass.sendSlackMessage(
            #     f"파일 : managePayment.py \n함수 : requestRefund \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
            #     appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        plan_id = plan_data.planId
        amount = plan_data.amount
        currency = plan_data.currency

        info_dict = {
            'plan_id': plan_id,
            'amount': amount,
            'currency': currency,
            'item_name': f"DS2AI Model Plan{plan_id} 결제",
            'pay_type': 'modelplanpaid'
        }

        payment_result = self.payment_by_card(user, info_dict)
        result = 'success' if payment_result else 'fail'

        return HTTP_200_OK, {'result': result}

    def purchase_credit(self, token, credit_data):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : requestRefund \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        amount = float(credit_data.amount)
        currency = credit_data.currency
        front_url = credit_data.front_url
        items = credit_data.items
        total_credit = 0
        total_amount = 0
        for item in items:
            item_name = item['name']
            item_amount_with_tax = float(item['price'])
            item_quantity = int(item['quantity'])
            item_credit = item_amount_with_tax * (10 / 11)
            if currency == 'krw':
                item_credit = item_credit / self.utilClass.usd_to_krw_rate

            if item_name == 'first':
                item_credit = round(item_credit * item_quantity, 2)
            elif item_name == 'second':
                item_credit = round((item_credit * 1.05) * item_quantity, 2)
            total_credit += item_credit
            total_amount += (item_amount_with_tax * item_quantity)
        if total_amount != amount:
            raise ex.NotEqualAmountEx()
        total_credit = round(total_credit, 2)

        info_dict = {
            'amount': amount,
            'currency': currency,
            'item_name': "DS2AI Credit 충전",
            'pay_type': "prepaid"
        }
        payment_result = self.payment_by_card(user, info_dict)
        if payment_result:
            updated_result = self.dbClass.updateUserDeposit(user.id, total_credit, cal='increase')
            self.utilClass.sendSlackMessageV2(
                f"Payple 선불 충전 처리 성공 : USER ID : {user.id}\n 결제 금액 : {amount} {currency}, 충전 CREDIT : {total_credit}\n "
                f"충전 전 CREDIT: {user.deposit}, 충전 후 CREDIT: {user.deposit + total_credit}\n",
                self.utilClass.slackPGPaymentSuccess)
            paid_result = 'True'
        else:
            paid_result = 'False'

        return HTTP_301_MOVED_PERMANENTLY, RedirectResponse(
            url=front_url + f"?paid={paid_result}", status_code=301)
    def withdraw_credit(self, token, withdraw_data):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : requestRefund \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        self.dbClass.createwithdrawHistories({
            "user": user.id,
            "credit": withdraw_data.credit,
            "status": "Under Review"
        })

        self.utilClass.sendSlackMessage(
            f"credit 출금을 신청하였습니다. {user.email} (ID: {user.id}) , credit : {withdraw_data.credit}",
            appLog=True, contact=True, userInfo=user, is_agreed_behavior_statistics=True)

        return HTTP_200_OK, True
    def sendEmailPaymentSuccess(self, user, price, card_num):

        to_email = user.email
        name = user.username if user.username else user.email
        language_code = user.lang if user.lang else 'ko'

        if language_code == 'ko':
            subject = f'[DS2.AI] 결제가 완료되었습니다.'
            content = getContentPaymentSuccess(name, price, card_num)
        else:
            subject = f'[DS2.AI] Payment is complete.'
            content = getContentPaymentSuccessEn(name, price, card_num)

        result = self.utilClass.sendEmail(to_email, subject, content)

        return result

    def sendEmailPaymentFail(self, user, remain_date, price, card_num):

        To = user.email
        name = user.username if user.username else user.email
        language_code = user.lang if user.lang else 'ko'

        if language_code == 'ko':
            subject = f'[DS2.AI] 결제 오류 확인 바랍니다.'
            content = getContentPaymentFail(name, remain_date, price, card_num)
        else:
            subject = f'[DS2.AI] Please check the payment error.'
            content = getContentPaymentFailEn(name, remain_date, price, card_num)

        result = self.utilClass.sendEmail(To, subject, content)

        return result

    def sendEmailCancelUserPlan(self, user):

        To = user.email
        name = user.username if user.username else user.email
        language_code = user.lang if user.lang else 'ko'

        if language_code == 'ko':
            subject = f'[DS2.AI] 서비스 사용이 중지되었습니다.'
            content = getContentCancelUserPlan(name)
        else:
            subject = f'[DS2.AI] service has been discontinued.'
            content = getContentCancelUserPlanEn(name)

        result = self.utilClass.sendEmail(To, subject, content)

        return result

    def sendEmailVoucherPayment(self, manager, voucher_email, year, month, from_date, to_date, amount, payment_date,
                                voucher_user):

        Subject = f'[DS2.ai] 바우처 고객 결제 예정 안내'
        To = manager.email
        Content = getContentVoucherPayment(manager.name, voucher_user.company, year, month, from_date, to_date, amount,
                                           payment_date.date(),
                                           voucher_email, voucher_user.voucher_type,
                                           voucher_user.start_date, voucher_user.end_date, voucher_user.is_recharge,
                                           voucher_user.charge_deposit,
                                           voucher_user.charge_deposit - voucher_user.used_deposit)
        try:
            result = self.utilClass.sendEmail(To, Subject, Content)
        except:
            print("이메일 전송 실패")
            pass
        return result
