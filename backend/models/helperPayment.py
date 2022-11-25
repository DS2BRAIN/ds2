import traceback

import peewee

from models import *
import functools

class HelperPayment():

    def __init__(self, init=False):
        ""
        # if init:
        #     skyhub.connect(reuse_if_open=True)

    def __exit__(self, exc_type, exc_value, traceback):

        if not skyhub.is_closed():
            skyhub.close()

    # def wrapper(func):
    #     @functools.wraps(func)
    #     def wrap(self, *args, **kwargs):
    #         with skyhub.connection_context():
    #             try:
    #                 return func(self, *args, **kwargs)
    #             except peewee.OperationalError as exc:
    #                 skyhub.connect(reuse_if_open=True)
    #                 return func(self, *args, **kwargs)
    #                 pass
    #     return wrap

    def wrapper(func):
        @functools.wraps(func)
        def wrap(self, *args, **kwargs):
            try:
                with skyhub.connection_context():
                    return func(self, *args, **kwargs)
            except peewee.OperationalError as exc:
                with skyhub.connection_context():
                    return func(self, *args, **kwargs)
        return wrap

    @wrapper
    def updatePgPayment(self, rowId, data):
        return pgpaymenthistoriesTable.update(**(data)).where(pgpaymenthistoriesTable.id == rowId).execute()

    @wrapper
    def getPgpaymenthistoriesValidRemainCount(self):
        return pgpaymenthistoriesTable.select().where(pgpaymenthistoriesTable.isValidRemainCount == True).execute()

    @wrapper
    def getPgregistrationhistoriesByUserId(self, userId):
        return pgregistrationhistoriesTable.select().where(pgregistrationhistoriesTable.user == userId).execute()

    @wrapper
    def getPgregistrationhistoriesValidRemainCount(self):
        return pgregistrationhistoriesTable.select().where(
            pgregistrationhistoriesTable.isValidRemainCount == True).execute()

    @wrapper
    def getPgpaymenthistoriesByUserId(self, userId, paid_type='all'):

        commonWhere = (pgpaymenthistoriesTable.user == userId)

        if paid_type == 'prePaymentHistory':
            commonWhere = commonWhere & (pgpaymenthistoriesTable.PCD_PAY_TYPE == 'prepaid')
        elif paid_type == 'postPaymentHistory':
            commonWhere = commonWhere & (pgpaymenthistoriesTable.PCD_PAY_TYPE == 'postpaid')
        elif paid_type == 'modelPlanPaymentHistory':
            commonWhere = commonWhere & (pgpaymenthistoriesTable.PCD_PAY_TYPE == 'modelplanpaid')

        return pgpaymenthistoriesTable.select().where(commonWhere).execute()

    @wrapper
    def createPgRegistration(self, data):
        return pgregistrationhistoriesTable.create(**(data))

    @wrapper
    def getPgRegistrationByUserAndTeamId(self, user, teamId):
        commonWhere = (pgregistrationhistoriesTable.user == user) & (pgregistrationhistoriesTable.teamId == teamId)
        return pgregistrationhistoriesTable.select().where(commonWhere).get()

    @wrapper
    def getPgRegistrationById(self, id, raw=False):
        commonWhere = (pgregistrationhistoriesTable.id == id)
        if raw:
            return pgregistrationhistoriesTable.get_or_none(commonWhere)
        else:
            return pgregistrationhistoriesTable.get_or_none(commonWhere).__dict__['__data__']

    @wrapper
    def createVoucherUser(self, data):
        return voucherUsersTable.create(**(data))

    @wrapper
    def createPgPayment(self, data):
        return pgpaymenthistoriesTable.create(**(data))

    @wrapper
    def createAmount(self, data):
        return usedamounthistoriesTable.create(**(data))

    @wrapper
    def getLastAmountByUserId(self, user_id, raw=False):
        return usedamounthistoriesTable.select().where(usedamounthistoriesTable.user == user_id).order_by(
            usedamounthistoriesTable.paidYear.desc(), usedamounthistoriesTable.paidMonth.desc()).first().__dict__['__data__'] \
            if not raw else usedamounthistoriesTable.select().where(usedamounthistoriesTable.user == user_id).order_by(
            usedamounthistoriesTable.paidYear.desc(), usedamounthistoriesTable.paidMonth.desc()).first()

    @wrapper
    def getLastPgPaymentByUserId(self, userId, raw=False):
        try:
            return pgpaymenthistoriesTable.select().where(
                (pgpaymenthistoriesTable.user == userId) & (pgpaymenthistoriesTable.PCD_PAY_RST == "success")).order_by(
                pgpaymenthistoriesTable.id.desc()).get().__dict__['__data__'] \
                if not raw else pgpaymenthistoriesTable.select().where(
                (pgpaymenthistoriesTable.user == userId) & (pgpaymenthistoriesTable.PCD_PAY_RST == "success")).order_by(
                pgpaymenthistoriesTable.id.desc()).get()
        except:
            print(traceback.format_exc())
            return None
            pass

    @wrapper
    def getLastPgPaymenthistoriesByUserId(self, userId, raw=False):
        try:
            return pgregistrationhistoriesTable.select().where(
                (pgregistrationhistoriesTable.user == userId) & (
                            pgregistrationhistoriesTable.PCD_PAY_RST == "success")).order_by(
                pgregistrationhistoriesTable.id.desc()).get().__dict__['__data__'] \
                if not raw else pgregistrationhistoriesTable.select().where(
                (pgregistrationhistoriesTable.user == userId) & (
                            pgregistrationhistoriesTable.PCD_PAY_RST == "success")).order_by(
                pgregistrationhistoriesTable.id.desc()).get()
        except:
            print(traceback.format_exc())
            return None
            pass

    @wrapper
    def get_last_model_plan_payment(self, user_id, plan_id, plan_price, raw=False):
        try:
            result = pgpaymenthistoriesTable.get_or_none(
                (pgpaymenthistoriesTable.user == user_id) & (
                            pgpaymenthistoriesTable.PCD_PAY_RST == "success") &
                (pgpaymenthistoriesTable.PCD_PAY_TYPE == 'modelplanpaid') &
                (pgpaymenthistoriesTable.price == plan_price) &
                (pgpaymenthistoriesTable.usageplan == plan_id) &
                (pgpaymenthistoriesTable.success == None))
            return result.__dict__['__data__'] if not raw else result
        except:
            print(traceback.format_exc())
            return None
            pass


    @wrapper
    def get_upload_usage(self, user_id, today):
        result = asynctasksTable.select(peewee.fn.sum(asynctasksTable.duration).alias('total')).where(
            (asynctasksTable.user == user_id) & (
                peewee.fn.DATE_FORMAT(asynctasksTable.created_at, '%Y-%m-%d') == today) & (
                asynctasksTable.marketproject != None) & ((asynctasksTable.isStandardMovie == False) | (asynctasksTable.isStandardMovie == None))).get()
        return int(result.total) if result.total else 0

    @wrapper
    def get_moviestatistics(self, market_project_id, period_type, start_date, end_date):
        date_condition = (movieStatisticsTable.measurement_date >= start_date) & (
                    movieStatisticsTable.measurement_date <= end_date)

        condition = ((movieStatisticsTable.periodType == period_type) & (
                    movieStatisticsTable.marketproject == market_project_id) & date_condition)

        return movieStatisticsTable.select().where(condition).execute()

    @wrapper
    def delete_market_request_by_market_project_id(self, market_project_id, user_id):
        common_query = (marketRequests.marketproject == market_project_id) & (marketRequests.userId == user_id)
        return marketRequests.update({'isDeleted': True}).where(common_query).execute()

    @wrapper
    def get_credit_histories_by_user_id(self, user_id):
        return creditHistoriesTable.select().where(creditHistoriesTable.userId == user_id).execute()

    @wrapper
    def get_charge_histories_by_user_id(self, user_id):
        return creditHistoriesTable.select().where((creditHistoriesTable.credit_type == "charge") & (creditHistoriesTable.user == user_id)).execute()

    @wrapper
    def get_credit_histories_by_post_id_and_user_id(self, post_id, user_id):
        return creditHistoriesTable.select().where((creditHistoriesTable.post == post_id) & (creditHistoriesTable.userId == user_id)).execute()

    @wrapper
    def get_buy_histories_by_post_id_and_user_id(self, post_id, user_id):
        return creditHistoriesTable.select().where((creditHistoriesTable.post == post_id) & (creditHistoriesTable.credit_type == 'buy_post') & (creditHistoriesTable.user == user_id)).execute()
