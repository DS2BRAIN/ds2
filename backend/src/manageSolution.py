import ast
import datetime
import json
import os
import random
import shutil
import urllib
import time
from base64 import b64encode

import bcrypt
import numpy
import pyotp
import qrcode

import pandas as pd
from io import BytesIO

import requests
from dateutil.relativedelta import relativedelta
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from pytz import timezone
from playhouse.shortcuts import model_to_dict

from models import marketProjectsTable, usersTable
from models.helper import Helper
from src.collecting.connectorHandler import ConnectorHandler
from src.errorResponseList import NOT_FOUND_USER_ERROR, NOT_FOUND_AI_ERROR, NOT_ALLOWED_TOKEN_ERROR, \
    TOO_MANY_ERROR_PROJECT, EXCEED_PROJECT_ERROR, PAYMENT_ERROR, PAYMENT_FAIL_ERROR
from src.managePayment import ManagePayment

from src.util import Util
from src.errors import exceptions as ex
from src.manageFile import ManageFile, errorResponseList

from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT
import peewee


class ManageSolution:
    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.manage_file = ManageFile()
        self.payment_file = ManagePayment()
        pd.options.display.float_format = '{:.5f}'.format

        user_and_pass = bytes(f"{self.utilClass.tradier_client_id}:{self.utilClass.tradier_client_secret}", 'utf-8')
        userAndPass = b64encode(user_and_pass).decode("ascii")
        self.tradier_headers = {
            'Authorization': f'Basic {userAndPass}',
            'Accept': 'application/json'
        }
        self.tradier_prod_url = f'https://api.tradier.com/v1'
        # self.tradier_url = self.utilClass.tradier_url
        self.tradier_url = self.tradier_prod_url

    def market_categories(self, token):
        user = self.dbClass.getUser(token)
        if not user:
            raise ex.NotFoundUserEx(token)
        result = ["공통", "금융", "보험", "제조", "물류", "마케팅", "경영", "농축산업", "에너지", "법", "공공", "기타"]

        return HTTP_200_OK, result

    def market_models(self, token, start, count, select_category, is_quick_model=False):
        user = self.dbClass.getUser(token)
        if not user:
            raise ex.NotFoundUserEx(token)

        market_models, total_length = self.dbClass.get_market_models(start, count, select_category, is_quick_model)
        result = {
            'total_length': total_length,
            'market_models': [{
                "id": market_model.id,
                "category": market_model.category,
                "name_kr": market_model.name_kr,
                "name_en": market_model.name_en,
                "inputData_kr": market_model.inputData_kr,
                "inputData_en": market_model.inputData_en,
                "outputData_kr": market_model.outputData_kr,
                "outputData_en": market_model.outputData_en,
                "price": market_model.price,
                "project": market_model.project,
                "url": market_model.url,
                "url_en": market_model.url_en,
                "model": market_model.model,
                "type": "CustomAi" if market_model.isCustomAi else "Quickstart",
                "thumbnail": market_model.thumbnail,
                "service_type": market_model.service_type
            } for market_model in market_models]
        }

        return HTTP_200_OK, result

    def request_market_model(self, token, file, market_model_id, phone_number, description):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            raise ex.NotFoundUserEx(token)

        market_model = self.dbClass.get_custom_ai_by_id(market_model_id)
        if market_model is None:
            raise ex.NotAllowedModelFileEx(user_id=user.id)

        s3key = None
        if file:
            time_stamp = time.time()
            file_name = os.path.splitext(file.filename)[0] + str(time_stamp) + "." + file.filename.split('.')[-1]
            file_location = f'{os.getcwd()}/temp/{file_name}'

            with open(file_location, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            file_route = f'user/{user.id}/CustomAI/Request/{file_name}'
            self.s3.upload_file(f"{file_location}", self.utilClass.bucket_name, file_route)

            s3key = urllib.parse.quote(
                f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{file_route}'
            ).replace('https%3A//', 'https://')

            if self.utilClass.configOption == 'enterprise':
                s3key = f"{self.utilClass.save_path}/{file_route}"

            os.remove(file_location)

        market_model_info = {
            "marketmodel": market_model_id,
            "phoneNumber": phone_number,
            "description": description,
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
            "userId": user.id,
            "status": 0,
            "s3key": s3key
        }

        result = model_to_dict(self.dbClass.create_market_requests(market_model_info))
        self.utilClass.sendSlackMessage(
            f"[Custom AI] '{market_model.name_kr}' 모델 신청이 도착했습니다. \n{user.email} (ID: {user.id}), \nMarket Model ID: {market_model_info['marketmodel']} \nRequest ID: {result['id']}",
            sales=True, userInfo=user)

        return HTTP_201_CREATED, result

    def get_market_plans(self, token, market_model_id):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            raise ex.NotFoundUserEx(token)

        market_request = self.dbClass.get_one_market_requests_by_model_id(user.id, market_model_id)
        has_discount = False

        if market_request is None:
            has_discount = True
        else:
            if market_request.created_at + datetime.timedelta(days=90) > datetime.datetime.utcnow():
                has_discount = True

        result = {str(x.hour): {"id": x.id, "price_per_month": x.price_per_month, "sale_price_per_month":x.sale_price_per_month} for x in self.dbClass.get_market_plans_by_model_id(market_model_id)}
        result["has_discount"] = has_discount

        return HTTP_200_OK, result

    def get_market_purchase_list(self, token, start, count, searching, sorting, desc):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            raise ex.NotFoundUserEx(token)

        market_requests, total_length = self.dbClass.get_market_requests_by_user_id(user.id, start, count, searching, sorting, desc)
        market_list = []
        for market_request in market_requests:
            market_model = {}
            market_model['id'] = market_request.id
            market_model['userId'] = market_request.userId
            market_model['marketmodel'] = market_request.marketmodel
            market_model['marketproject'] = market_request.marketproject
            market_model['nextPaymentDate'] = market_request.marketmodelstable.marketprojectstable.nextPaymentDate
            market_model['created_at'] = market_request.created_at
            market_model['updated_at'] = market_request.updated_at
            market_model['status'] = market_request.status
            market_model['created_ai_datetime'] = market_request.created_ai_datetime
            market_model['phoneNumber'] = market_request.phoneNumber
            market_model['s3key'] = market_request.s3key
            market_model['name_kr'] = market_request.marketmodelstable.name_kr
            market_model['name_en'] = market_request.marketmodelstable.name_en
            market_model['thumbnail'] = market_request.marketmodelstable.thumbnail
            market_model['projectName'] = market_request.marketmodelstable.marketprojectstable.projectName
            market_model['service_type'] = market_request.marketmodelstable.marketprojectstable.service_type
            market_model['file_structure'] = market_request.marketmodelstable.marketprojectstable.fileStructure
            market_model['file_structure'] = json.loads(market_model['file_structure'].replace("'", '"')) if market_model['file_structure'] else None

            market_list.append(market_model)

        result = {
            "total_length": total_length,
            "market_list": market_list
        }

        return HTTP_200_OK, result

    def update_market_project(self, token, project_id, project_info):

        user = self.dbClass.getUser(token)
        if not user:
            raise ex.NotFoundUserEx(token)

        project = self.dbClass.getOneMarketProjectById(project_id)

        if project.get('user') != user.get('id'):
            self.utilClass.sendSlackMessage(
                f"파일 : manageLabeling\n 함수 : updateMarketProject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        project_info = {**project_info.__dict__}
        project_info = {k: v for k, v in project_info.items() if v is not None}

        self.utilClass.sendSlackMessage(
            f"마켓 프로젝트 정보가 변경되었습니다. {user.get('email')} (ID: {user.get('id')}) , {json.dumps(project_info, indent=4, ensure_ascii=False, default=str)}",
            appLog=True, userInfo=user)

        self.dbClass.update_marketproject_by_id(project_id, project_info)

        return HTTP_200_OK, project_info

    def getMarketProjectById(self, token, projectId):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject.py \n함수 : getProjectById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        project = self.dbClass.getOneMarketProjectById(projectId)

        payment_project_list = ['dance_training', 'sport_training', 'recovery_training', 'offline_shop', 'offline_ad']
        if project.get('service_type') in payment_project_list:
            payment_date = project.get('nextPaymentDate')
            if payment_date is not None and payment_date <= datetime.datetime.now():
                return PAYMENT_FAIL_ERROR
        dataconnectorsList = []
        if project['valueForPredict'] != 'label' and project['dataconnectorsList']:
            for dataconnectorId in project['dataconnectorsList']:
                dataconnector = self.dbClass.getOneDataconnectorById(dataconnectorId)
                dataconnector.dataconnectortype = self.dbClass.getOneDataconnectortypeById(
                    dataconnector.dataconnectortype)

                if project['status'] == 0:  # 프로젝트 시작 전
                    # Column 정보 업데이트 필요
                    if dataconnector.dataconnectortype.authType == 'db' and dataconnector.keyFileInfo:
                        connector = ConnectorHandler(method='JDBC', dictionary=dataconnector.keyFileInfo)

                        # Verify
                        isVerify, columnInfos, message = connector.verify()
                        if not isVerify:
                            self.utilClass.sendSlackMessage(
                                f"파일 : manageProject.py \n함수 : getProjectById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                appError=True, userInfo=user)
                            return NOT_FOUND_USER_ERROR

                        try:
                            summaries, sampleData = connector.summary()
                            existDatacolumns = self.dbClass.getDatacolumnsByDataconnectorId(dataconnector.id)
                            for existDatacolumn in existDatacolumns:
                                existDatacolumn.delete_instance()

                            for i, column in enumerate(summaries):
                                dataObject = {**column,
                                              # "index": str(i + 1),
                                              "dataconnector": dataconnector.id if dataconnector else None,
                                              }

                                self.dbClass.createDatacolumn(dataObject)

                            dataconnector.sampleData = sampleData

                        except Exception as e:
                            return errorResponseList.verifyError(e.args)
                # 업데이트한 정보 저장
                dataconnector.save()
                dataconnector = dataconnector.__dict__['__data__']
                del dataconnector['dbPassword']
                dataconnector['datacolumns'] = [x.__dict__['__data__'] for x in
                                                self.dbClass.getDatacolumnsByDataconnectorId(dataconnector['id'])]
                dataconnector['sampleData'] = dataconnector['sampleData'].replace("NaN", "None")
                if dataconnector['datacolumns']:
                    for column in dataconnector['datacolumns']:
                        if not column["uniqueValues"]:
                            continue
                        for uniqueValues in column["uniqueValues"]:
                            if uniqueValues != uniqueValues:
                                column["uniqueValues"][column["uniqueValues"].index(uniqueValues)] = None
                dataconnectorsList.append(dataconnector)

                project['dataconnectorsList'] = dataconnectorsList


        return HTTP_200_OK, project

    def getMarketModelBySlugName(self, token, slug_name):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject.py \n함수 : getModelById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        modelRaw = self.dbClass.getOneMarketModelBySlugName(slug_name)

        if not modelRaw:
            return NOT_FOUND_AI_ERROR

        model = modelRaw.__dict__['__data__']

        project = self.dbClass.getOneMarketProjectById(model['project'])
        model['valueForPredict'] = project['valueForPredict']
        model['trainingMethod'] = project['trainingMethod']
        model['hasTextData'] = project['hasTextData']
        model['hasImageData'] = project['hasImageData']
        model['hasTimeSeriesData'] = project['hasTimeSeriesData']

        return HTTP_200_OK, model

    def getMarketModelById(self, token, modelId):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject.py \n함수 : getModelById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        model = self.dbClass.getOneMarketModelById(modelId).__dict__['__data__']

        project = self.dbClass.getOneMarketProjectById(model['project'])
        model['valueForPredict'] = project['valueForPredict']
        model['trainingMethod'] = project['trainingMethod']
        model['hasTextData'] = project['hasTextData']
        model['hasImageData'] = project['hasImageData']
        model['hasTimeSeriesData'] = project['hasTimeSeriesData']

        return HTTP_200_OK, model

    def deleteMarketProjects(self, token, marketProjectIdList):

        successList = []
        failList = []


        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageSolution\n 함수 : deleteMarketProjects \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        for id in marketProjectIdList:
            try:
                marketProject = self.dbClass.getMarketProjectsById(id)

                if marketProject.user != user.id:
                    self.utilClass.sendSlackMessage(
                        f"파일 : managemarketing\n 함수 : deletemarketProjects \n허용되지 않은 토큰 값입니다. token = {token})",
                        appError=True, userInfo=user)
                    return NOT_ALLOWED_TOKEN_ERROR

                self.dbClass.updateLabelProjectIsdeletedByLabelprojectId(marketProject.labelproject)
                self.dbClass.delete_market_request_by_market_project_id(marketProject.id, marketProject.user)

                if marketProject:
                    self.dbClass.updateMarketProjectIsdeletedByMarketprojectId(id)
                self.utilClass.sendSlackMessage(
                    f"라벨링 프로젝트가 삭제되었습니다. {user.email} (ID: {user.id}) , (Market project ID: {marketProject.id})",
                    appLog=True, userInfo=user)
                successList.append(id)
            except:
                failList.append(id)
                pass

        return HTTP_200_OK, {'successList':successList, 'failList':failList}

    def get_random_hex_color(self):
        random_number = random.randint(0, 16777215)
        hex_number = format(random_number, 'x')
        hex_number = '#' + hex_number
        return hex_number

    def createMarketProject(self, token, market_project_object):

        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createProjectFromDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if self.dbClass.isUserHavingExceedErrorProjectCount(user.__dict__['__data__']):
            self.utilClass.sendSlackMessage(f"유저 ID : {user.id} - 오류 프로젝트를 지나치게 많이 생성하고 있으니 조치바랍니다.", inquiry=True, userInfo=user)
            return TOO_MANY_ERROR_PROJECT

        if self.dbClass.isUserHavingExceedProjectCount(user.__dict__['__data__']):
            self.utilClass.sendSlackMessage(
                f"csv Parse - run() \n프로젝트 사용량 초과입니다 {user['email']} (ID: {user['id']})",
                appLog=True, userInfo=user)
            return EXCEED_PROJECT_ERROR

        now_datetime = datetime.datetime.utcnow()
        model_raw = self.dbClass.getOneMarketModelById(market_project_object.modelId)

        market_project_count = self.dbClass.get_market_projects_count_by_user_id(user.id, model_raw.service_type)

        if market_project_count >= 10:
            raise ex.TooManyMarketProjectEx(user.id, model_raw.service_type)

        market_5_list = ["sport_training", "recovery_training", "dance_training", "offline_shop", "offline_ad"]
        image_path = None
        next_payment_date = None
        training_method = None

        if model_raw.service_type in market_5_list:
            if model_raw.service_type == "offline_shop":
                image_path = f"{self.utilClass.save_path}/asset/p1.png" if self.utilClass.configOption == 'enterprise'\
                    else "https://aimakerdslab.s3.ap-northeast-2.amazonaws.com/asset/p1.png"
            elif model_raw.service_type == "offline_ad":
                image_path = f"{self.utilClass.save_path}/asset/car_billboard.jpg" if self.utilClass.configOption == 'enterprise' \
                    else "https://aimakerdslab.s3.ap-northeast-2.amazonaws.com/asset/car_billboard.jpg"
            else:
                training_method = "object_detection"

            if (model_raw.service_type == 'dance_training' and user.first_dance_training_expiration_date is not None) or \
                    (model_raw.service_type == 'sport_training' and user.first_sport_training_expiration_date is not None) or \
                    (model_raw.service_type == 'recovery_training' and user.first_recovery_training_expiration_date is not None) or \
                    (model_raw.service_type == "offline_shop" and user.first_offline_shop_expiration_date is not None) or \
                    (model_raw.service_type == "offline_ad" and user.first_offline_ad_expiration_date is not None):

                plan_id = market_project_object.planId
                plan = self.dbClass.get_market_plans_by_id(plan_id)
                plan_price = plan.price_per_month
                if (plan.sale_price_per_month is not None) and (
                        (model_raw.service_type == 'dance_training' and user.first_dance_training_expiration_date > now_datetime) or \
                        (model_raw.service_type == 'sport_training' and user.first_sport_training_expiration_date > now_datetime) or \
                        (model_raw.service_type == 'recovery_training' and user.first_recovery_training_expiration_date > now_datetime) or \
                        (model_raw.service_type == 'offline_shop' and user.first_offline_shop_expiration_date > now_datetime) or \
                        (model_raw.service_type == 'offline_ad' and user.first_offline_ad_expiration_date > now_datetime)
                ):
                    plan_price = plan.sale_price_per_month

                card_info = self.dbClass.getLastPgRegistrationByUserId(user.id)
                if card_info.get('pg_provider') == 'payple':
                    plan_price *= self.utilClass.usd_to_krw_rate
                payment_result = self.dbClass.get_last_model_plan_payment(user.id, plan_id, plan_price, raw=True)
                if payment_result:
                    payment_result.success = True
                    payment_result.save()
                else:
                    return PAYMENT_ERROR
                next_payment_date = now_datetime + relativedelta(months=1)
            else:
                if model_raw.service_type == 'dance_training':
                    column_name = 'first_dance_training_expiration_date'
                elif model_raw.service_type == 'sport_training':
                    column_name = 'first_sport_training_expiration_date'
                elif model_raw.service_type == 'recovery_training':
                    column_name = 'first_recovery_training_expiration_date'
                elif model_raw.service_type == "offline_shop":
                    column_name = 'first_offline_shop_expiration_date'
                elif model_raw.service_type == "offline_ad":
                    column_name = 'first_offline_ad_expiration_date'
                self.dbClass.updateUser(user.id, {column_name: now_datetime + relativedelta(months=3)})
                next_payment_date = now_datetime + relativedelta(days=14)

        market_project = self.dbClass.createMarketProject({
            'projectName': market_project_object.projectName,
            'description': market_project_object.projectDescription,
            'projectcategory': market_project_object.timeLimit,
            'service_type': model_raw.service_type,
            'marketmodel': model_raw.id,
            'updated_at': now_datetime,
            'user': user.id,
            'status': 100,
            'nextPaymentDate': next_payment_date,
            'planId': market_project_object.planId,
            'dashboardPreviewImagePath': image_path,
            'trainingMethod': training_method
        })

        self.dbClass.createMarketRequest({
            'marketmodel': model_raw.id,
            'marketproject': market_project.id,
            'updated_at': now_datetime,
            'userId': user.id,
            'status': 100,
        })

        # if not market_project.labelproject:
        market_dataconnector = self.dbClass.createDataconnector({
            "dataconnectorName": f"Dataconnector for Market Project {market_project.id}",
            "user": user.id,
        })
        # folder_id = self.add_folder(user['id'], f"Label project for Ops {market_project.id}")
        if model_raw.service_type in ["offline_shop", "offline_ad"]:
            market_label_project = self.dbClass.createLabelProject({
                "user": user.id,
                "market_project_flag": True,
                "status": 100,
                "dataconnectorsList": [market_dataconnector.id],
                "workapp": market_project.trainingMethod,
                "last_updated_at": now_datetime,
                "name": f"Label project for Market {market_project.id}",
            })

            label_classes_raw = market_project.yClass
            try:
                label_classes_raw = ast.literal_eval(label_classes_raw)
            except:
                pass

            if label_classes_raw:
                for label_class_raw in label_classes_raw:
                    color = self.get_random_hex_color()
                    data = {'name': label_class_raw, 'color': color, 'labelproject': market_label_project.id}
                    self.dbClass.createLabelclass(data)

            if model_raw.service_type == "offline_shop":
                color = self.get_random_hex_color()
                data = {'name': 'RetailArea', 'color': color, 'labelproject': market_label_project.id}
                self.dbClass.createLabelclass(data)

                color = self.get_random_hex_color()
                data = {'name': 'Checkout', 'color': color, 'labelproject': market_label_project.id}
                self.dbClass.createLabelclass(data)

            update_data = {
                'labelproject': market_label_project.id,
                'dataconnector': market_dataconnector.id
            }
            market_project = self.dbClass.update_market_project(market_project.id, update_data)

        result = market_project.__dict__['__data__']

        self.utilClass.sendSlackMessage(
            f"OPS 프로젝트를 생성하였습니다. {user.email} (ID: {user.id}) ,(MARKET PROJECT ID: {market_project.id})",
            appLog=True, userInfo=user, server_status=True)

        return HTTP_200_OK, result

    def get_moviestatistics(self, token, market_project_id, period_type, start_date, end_date):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createProjectFromDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if start_date:
            start_date = datetime.datetime.strptime(start_date, '%Y-%m-%d')
        if end_date:
            end_date = datetime.datetime.strptime(end_date + " 23:59:59", '%Y-%m-%d %H:%M:%S')

        period_type = 'hour' if period_type == 'day' else period_type

        return HTTP_200_OK, [model_to_dict(x) for x in self.dbClass.get_moviestatistics(market_project_id, period_type, start_date, end_date)]

    # def post_create_quant_survey(self, user, survey_obj):
    #     if 0 < survey_obj.questionScore < 36:
    #         propensity_type = 1
    #     elif 35 < survey_obj.questionScore < 66:
    #         propensity_type = 2
    #     elif 65 < survey_obj.questionScore < 101:
    #         propensity_type = 3
    #
    #     survey_dict = {
    #         'user': user['id'],
    #         # 'question1': survey_obj.question1,
    #         # 'question2': survey_obj.question2,
    #         # 'question3': survey_obj.question3,
    #         # 'question4': survey_obj.question4,
    #         # 'question5': survey_obj.question5,
    #         # 'question6': survey_obj.question6,
    #         'propensity_type': propensity_type
    #     }
    #
    #     created_survey = self.dbClass.create_quant_survey(survey_dict)
    #
    #     result = {
    #         'user': created_survey.user,
    #         'propensityType': created_survey.propensity_type
    #     }
    #
    #     return result
