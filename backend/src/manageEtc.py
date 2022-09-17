import datetime

import io
import shutil
import traceback
from base64 import b64encode

import pyupbit
from io import BytesIO
import os
import json

import requests
from fastapi.responses import StreamingResponse
from playhouse.shortcuts import model_to_dict
from starlette.responses import RedirectResponse
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE

from models import marketProjectsTable
from src.client.hbmp import Hbmp
from src.client.innoSpeech import InnoSpeech
from src.client.innoSpeech2 import InnoSpeechSeeker
from src.client.innerTrip import InnerTrip
from src.client.wideField import WideField
from src.client.hbmpPremium import HbmpPremium
from src.client.techyPreference import recommend_techy_preference
from src.client.techyAppearanceScore import TechyAppearanceScore
from src.client.techyMeetingScore import TechyMeetingScore
from src.util import Util
from src.managePayment import ManagePayment
from src.manageDataAnalyze import DataAnalyze
from src.errors import exceptions as ex
from models.helper import Helper
from starlette.status import HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR, HTTP_301_MOVED_PERMANENTLY
from starlette.status import HTTP_201_CREATED
import pandas as pd
import urllib
import urllib.parse
import ast
import pdfkit
from more_itertools import locate
from src.errorResponseList import ErrorResponseList, NOT_ALLOWED_TOKEN_ERROR, NOT_FOUND_USER_ERROR
from uuid import getnode as get_mac

errorResponseList = ErrorResponseList()

#TODO: 숫자 헤더면 바꿔줘야됨

class MyPdfKit(pdfkit.PDFKit):
    def command(self, path=None):
        return ['xvfb-run'] + super().command(path)

class ManageEtc:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.paymentClass = ManagePayment()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.dataClass = DataAnalyze()
        # print("self.utilClass.configOption")
        # print(self.utilClass.configOption)
        # if self.utilClass.configOption != "enterprise":
        #     self.create_class()


    def create_report(self, token, project_id):
        user = self.dbClass.getUser(token)

        if not user:
            raise ex.NotFoundUserEx()

        user_name = user['email'] if user['company'] is None else f"{user['email']}({user['company']})"

        project = self.dbClass.getOneProjectById(project_id)

        if project['user'] != user['id']:
            raise ex.NotAllowedTokenEx()

        pdf_file_path = f'{self.utilClass.save_path}/{user["id"]}/report_{project_id}.pdf'

        if os.path.isfile(pdf_file_path) is False:
            training_method = project['trainingMethod']
            print_date_time = (datetime.datetime.utcnow() + datetime.timedelta(hours=9)).strftime('%Y-%m-%d %H:%M%:%S')
            image_training_method = ['object_detection', 'image', 'cycle_gan']

            # 학습 방법에 따라 이미지 관련 프로젝트는 유실값, 최대값, 표준값 등의 데이터가 없기 때문에 타입과 이미지 데이터 개수만 보여주고
            # 학습 방법이 정형데이터를 사용하는 경우 이외의 데이터들도 보여주도록 처리해줍니다.
            column_names = {
                'type': '타입', 'length': '개수'
            } if training_method in image_training_method else {
                'use': '학습데이터 사용 여부', 'test': '전처리 사용 여부', 'dataconnectorName': '데이터',
                'length': '개수', 'miss': '유실값', 'unique': '유일키', 'type': '타입', 'min': '최소값',
                'max': '최대값', 'std': '표준값', 'mean': '평균값', 'top': '최상위', 'freq': '빈번도'
            }

            table_data_info = {'column_name': [], 'index': []}

            label_project_id = project['labelproject']
            label_class_names = ["클래스명", "건수", "비율(%)"]
            label_table_data = []
            label_data_info = {}
            total_cnt = 0

            file_structure = project['fileStructure'].replace('true', 'True').replace('false', 'False').replace(
                'null', '"-"')

            # 해당 프로젝트가 라벨프로젝트를 거쳐서 만들어졌다면 라벨링에 대한정보도 보고서에 추가하기 위하여 조회 및 정제해주는 부분입니다.
            if label_project_id:
                label_project_raw = self.dbClass.getLabelProjectsById(label_project_id)
                label_classes = self.dbClass.getLabelClassesByLabelProjectId(label_project_id)

                completed_label_count_dict = {
                    label_count['id']: label_count['count'] for label_count in
                    self.dbClass.getCompletedLabelCountBylabelprojectId(label_project_raw.id, label_project_raw.workapp,
                                                                        False, "")
                }

                for label_class in label_classes:
                    label_count = completed_label_count_dict.get(str(label_class.id), 0)
                    label_data_info[label_class.name] = label_count
                    total_cnt += label_count

                label_data_info['전체'] = total_cnt
            else:
                label_classes = []

            # 라벨데이터가 보기 이쁘도록 클래스가 9개 이상이라면 보고서에서 라벨링의 열 개수를 3개,
            # 클래스가 5개 이상이라면 열 개수를 2개, 클래스가 4개 이하라면 열 개수를 1개로 고정하는 부분입니다.
            if len(label_classes) >= 8:
                label_cell_count = 3
                label_class_names *= label_cell_count
            elif len(label_classes) >= 5:
                label_cell_count = 2
                label_class_names *= label_cell_count
            else:
                label_cell_count = 1

            count = 1
            temp = []
            if total_cnt == 0:
                total_cnt = 1

            # 위에서 라벨 프로젝트가 있어서 label_data_info에 값이 들어간 경우만 아래 for문을 동작하게 됩니다.
            for class_name, label_count in label_data_info.items():
                # html로 라벨링 정보가 담긴 표를 만들어주는 부분을 추가하는 부분입니다.
                temp += [
                    f'<td style="text-align:center;padding: 6px 4px; border-left-width: 2px;">{class_name}</td>',
                    f'<td style="text-align:right;padding: 6px 4px;">{label_count}</td>',
                    f'<td style="text-align:center;padding: 6px 4px; border-right-width: 2px;">{round(label_count / total_cnt * 100, 2)}</td>'
                ]
                if label_cell_count == count:
                    label_table_data.append(temp)
                    temp = []
                    count = 1
                else:
                    count += 1

            # 해당 프로젝트의 학습에 사용된 기본적인 데이터 구조에 대한 부분을 정제하여 표로 만들어주는 부분입니다.
            file_structure = ast.literal_eval(file_structure)

            for column_data in file_structure:
                table_data_info['column_name'].append(column_data.get(
                    'columnName' if project['trainingMethod'] in image_training_method else 'originalColumnName'
                    , '-'))
                table_data_info['index'].append(column_data.get('index', '-'))

                for column_name in column_names:
                    if table_data_info.get(column_name) is None:
                        table_data_info[column_name] = []

                    table_data_info[column_name].append(column_data.get(column_name, '-'))

            models = [x.__dict__['__data__'] for x in self.dbClass.get_one_model_for_report(project_id)]
            best_model = models[0] if models else None

            # 프로젝트의 모델 중 정확도가 가장 좋은 모델 한개에 대한 정보를 최종적으로 유저에게 반환해줍니다.
            # 그러기 위해서 best_model을 선정 후 아래에서 통계정보 및 차트 정보등이 있는지 검사 후 조회하는 작업을 수행합니다.
            if best_model and best_model['cm_statistics']:
                cm_statistics = json.loads(best_model['cm_statistics'])

                model_chart = [x.__dict__['__data__'] for x in self.dbClass.getAnalyticsGraphsByModelId(best_model['id'])]
            elif best_model and best_model['cmStatistics']:
                cm_statistics = json.loads(best_model['cmStatistics'])

                model_chart = [x.__dict__['__data__'] for x in self.dbClass.getAnalyticsGraphsByModelId(best_model['id'])]
            else:
                cm_statistics = None
                model_statistics_data = []
                model_chart = []


            model_statistics_column = ['Overall_Statistics', 'value']
            model_statistics_right_data = []
            model_statistics_center_data = []

            # 모델에 대한 합습평가 지표가 있다면 해당 정보를 정제하여 html 표로 만들 수 있도록 저장해줍니다.
            if cm_statistics:
                for stat_name in cm_statistics['overall_stat'].keys():
                    value = None if cm_statistics['overall_stat'][stat_name] == 'None' else cm_statistics['overall_stat'][
                        stat_name]

                    if value is None:
                        continue

                    if stat_name in ['Overall ACC', 'Kappa', 'Overall RACC', 'ACC Macro', 'F1 Macro']:
                        model_statistics_right_data.append([
                            f'<td style="text-align:center;padding: 6px 4px;">{stat_name}</td>',
                            f'<td style="text-align:right;padding: 6px 4px;">{value}</td>'
                        ])
                    else:
                        model_statistics_center_data.append([
                            f'<td style="text-align:center;padding: 6px 4px;">{stat_name}</td>',
                            f'<td style="text-align:center;padding: 6px 4px;">{value}</td>'
                        ])
                model_statistics_data = model_statistics_center_data + model_statistics_right_data

            image_content = ""

            # 모델이 모델 차트(표 이미지)를 가지고 있었다면 해당 이미지들을 모두 html 이미지로 삽입시켜줍니다.
            for chart in model_chart:

                img_url = chart['filePath'].replace('https://astoredslab.s3.ap-northeast-2.amazonaws.com/', '')
                save_image_path = f'{self.utilClass.save_path}/models/{models[0]["id"]}/{chart["graphName"]}'
                os.makedirs(f'{self.utilClass.save_path}/models/{models[0]["id"]}', exist_ok=True)
                self.s3.download_file(self.utilClass.bucket_name, img_url, save_image_path)
                if chart["graphName"] == 'heatmap_0.png':
                    image_content += f'<img src="{chart["filePath"]}" alt="{chart["graphName"]}"> <br>'
                else:
                    image_content += f'<img src="{chart["filePath"]}" alt="{chart["graphName"]}" width=800> <br>'

            training_data_info_table = self.create_html_table(column_names, table_data_info)

            model_table = self.create_model_table(model_statistics_column, model_statistics_data)

            # 위에서 각각 html에 삽입하기 위하여 정제해놓은 변수들이 있는지 최종적으로 확인 후 있다면 각각 모델 성능 보고서, 분석 그래프,
            # 라벨링 데이터 정보 등의 표를 만들고 create_model_table이라는 변수를 활용하여 최종 html 파일을 생성해줍니다.
            if model_table:
                model_table = f"""
                <div class="model_area" style="border-bottom: 1px solid #bdbdbd;">
                        <b><p style="font-size:24px;text-align: center;">모델 성능 보고서</p></b>
                        {model_table}
                        <br><br><br><br>
                    </div>
                """

            if image_content:
                image_content = f"""
                    <div class="model_chart_area" style="border-bottom: 1px solid #bdbdbd;">
                        <b><p style="font-size:24px;text-align: center;">분석 그래프</p></b>
                            {image_content}    
                        <br>
                    </div>
                """

            if label_project_id:
                label_table = self.create_model_table(label_class_names, label_table_data, True)
                label_table = f"""
                <div class="model_chart_area" style="border-bottom: 1px solid #bdbdbd;">
                <b><p style="font-size:24px;text-align: center;">라벨링 데이터 정보</p></b>
                {label_table}
                <br><br><br><br>
                </div>
                """
            else:
                label_table = ""

            os.makedirs(f'{self.utilClass.save_path}/{user["id"]}', exist_ok=True)

            with open('src/emailContent/report.html', 'r') as f:
                content = f.read().replace("%%tabledata%%", training_data_info_table).replace("%%project_name%%", project[
                    'projectName']).replace("%%modeldata%%", model_table).replace("%%modelchart%%", image_content).replace(
                    "%%labeldata%%", label_table).replace('%%user_name%%', user_name).replace('%%training_method%%',
                                                                                              training_method).replace(
                    '%%print_date%%', print_date_time)

            # with open(f'{self.utilClass.save_path}/{user["id"]}/report_{project_id}.html', 'w') as f:
            #     f.write(content)

            # self.s3.upload_file(f'{self.utilClass.save_path}/{user["id"]}/report_{project_id}.html',
            #                     self.utilClass.bucket_name, f"user/{user['id']}/report_{project_id}.html")
            #
            # html_s3key = urllib.parse.quote(
            #     f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{user["id"]}/report_{project_id}.html').replace(
            #     'https%3A//', 'https://')
            #
            # try:
            #     self.convert_pdf(content, f'{self.utilClass.save_path}/{user["id"]}/report_{project_id}.pdf')
            # except:
            #     self.convert_pdf(html_s3key,
            #                      f'{self.utilClass.save_path}/{user["id"]}/report_{project_id}.pdf', True)
            #
            # self.s3.upload_file(f'{self.utilClass.save_path}/{user["id"]}/report_{project_id}.pdf',
            #                     self.utilClass.bucket_name, f"user/{user['id']}/report_{project_id}.pdf")
            #
            # s3key = urllib.parse.quote(
            #     f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{user["id"]}/report_{project_id}.pdf').replace(
            #     'https%3A//', 'https://')

            # 생성한 report.html 파일을 유저에게 반환하기 위해 pdf로 변경해줍니다.
            self.convert_pdf(content, pdf_file_path)

            # 해당 pdf파일 경로를 반환합니다.
        return HTTP_200_OK, {'result': pdf_file_path}

    def convert_pdf(self, input_html_path, output_pdf_path, is_url=False):
        type = 'url' if is_url else 'string'
        pdf_object = MyPdfKit(input_html_path, type)
        pdfkit.from_string(input_html_path, output_pdf_path)
        return pdf_object.to_pdf(output_pdf_path)

    def create_model_table(self, column_names, table_datas, is_label_table=False):
        column_string = ""
        data_sting = ""

        count = 1
        for column_name in column_names:
            if is_label_table and count == 1:
                column_string += f"<th class=\"tdTitle\" style=\"border-left-width: 2px;\">{column_name}</th>"
            elif is_label_table and count == 3:
                column_string += f"<th class=\"tdTitle\" style=\"border-right-width: 2px;\">{column_name}</th>"
                count = 0
            else:
                column_string += f"<th class=\"tdTitle\">{column_name}</th>"
            count += 1

        for row_data in table_datas:
            data_sting += f"<tr>"
            for cell_data in row_data:
                data_sting += cell_data
            data_sting += f"</tr>"

        result = f"""
                <table  border="2" bordercolor=black bgcolor="white" width="100%" style="border-collapse: collapse;">
                    <tr border="2" style="border-bottom: 2px solid black;">
                    {column_string}
                    </tr>
                    {data_sting}
                </table>
                """

        return result

    def create_html_table(self, column_names, data):
        column_string = ""
        data_sting = ""
        complete_list = []
        data_count = None
        result = None
        count = 1

        while list(column_names.keys()):
            column_string += f"<th class=\"tdTitle\" style=\"width: 9%;\">인덱스</th>"
            column_string += f"<th class=\"tdTitle\" style=\"width: 15%;\">컬럼명</th>"
            for key, value in column_names.items():
                complete_list.append(key)

                exist_list = list(locate(data[key], lambda x: x != '-'))

                if len(exist_list) == 0:
                    data.pop(key, None)
                    continue

                if data_count is None:
                    data_count = len(data[key])

                column_string += f"<th class=\"tdTitle\">{value}</th>"

                if count == 4:
                    count = 1
                    break
                count += 1
            if not data_count:
                data_count = 1
            for data_index in range(0, data_count):
                data_sting += f"<tr>"
                data_sting += f'<td style="text-align:center;padding: 6px 4px;">{data["index"][data_index]}</td>'
                data_sting += f'<td style="text-align:center;padding: 6px 4px;">{data["column_name"][data_index]}</td>'
                for key in complete_list:
                    if data.get(key) is None:
                        continue

                    text_align = 'center' if key in ['use', 'test', 'dataconnectorName', 'type'] or data[key][
                        data_index] == '-' else 'right'
                    data_sting += f'<td style="text-align:{text_align};padding: 6px 4px;">{data[key][data_index]}</td>'
                data_sting += f"</tr>"

            for key in complete_list:
                column_names.pop(key, None)

            complete_list = []

            if result is None:
                result = f"""
                        <table  border="2" bordercolor=black bgcolor="white" width="100%" style="border-collapse: collapse;">
                            <tr border="2" style="border-bottom: 2px solid black;">
                            {column_string}
                            </tr>
                            {data_sting}
                        </table>
                        """
            else:
                result += f"""
                        <br>
                        <table  border="2" bordercolor=black bgcolor="white" width="100%" style="border-collapse: collapse;">
                            <tr border="2" style="border-bottom: 2px solid black;">
                            {column_string}
                            </tr>
                            {data_sting}
                        </table>
                        """
            column_string = ""
            data_sting = ""

        return result

    def create_class(self):
        dev_flag = self.utilClass.configOption in ['dev', 'dev_local']
        market_project_list = [14281, 14233, 14226, 14221, 14262, 24128] if dev_flag else [13752, 13739, 13731, 13733, 13736, 14243]
        hbmp_model_id_lst = [14281] if dev_flag else [13736]
        inner_trip_model_id_lst = [14233] if dev_flag else [13728, 13739]
        wide_field_model_id_lst = [14262, 14254, 14253] if dev_flag else [13755, 13754, 13752]
        inno_speech_model_id_lst = [14226] if dev_flag else [13733]
        inno_speech_seeker_model_id_lst = [14221] if dev_flag else [13731]
        hbmp_premium_model_ist = [24128] if dev_flag else [14243]

        for market_project_id in market_project_list:
            model_project_raw = self.dbClass.getOneMarketProjectById(market_project_id)

            file_name = model_project_raw['filePath'].split('/')[-1]

            local_model_path = f'{self.utilClass.save_path}/user/{model_project_raw["user"]}/{model_project_raw["id"]}/{model_project_raw["service_type"]}/{file_name}'

            if os.path.isdir(f'{self.utilClass.save_path}/user/{model_project_raw["user"]}/{model_project_raw["id"]}/{model_project_raw["service_type"]}') and market_project_id in wide_field_model_id_lst:
                shutil.rmtree(f'{self.utilClass.save_path}/user/{model_project_raw["user"]}/{model_project_raw["id"]}/{model_project_raw["service_type"]}')

            if not os.path.isfile(local_model_path):
                os.makedirs(f'{self.utilClass.save_path}/user/{model_project_raw["user"]}/{model_project_raw["id"]}/{model_project_raw["service_type"]}', exist_ok=True)
                self.s3.download_file(self.utilClass.bucket_name, model_project_raw["filePath"].split('com/')[1],
                                      local_model_path)

            if market_project_id in hbmp_model_id_lst:
                self.hbmp_model = Hbmp(local_model_path)
                print(f'hbmp model load')
            elif market_project_id in inner_trip_model_id_lst:
                self.inner_trip_model = InnerTrip(local_model_path)
                print(f'inner_trip model load')
            elif market_project_id in wide_field_model_id_lst:
                self.wide_field_model = WideField(local_model_path)
                print(f'widefield model load')
            elif market_project_id in inno_speech_model_id_lst:
                self.inno_speech_model = InnoSpeech(local_model_path)
                print(f'inno speech model laod')
            elif market_project_id in inno_speech_seeker_model_id_lst:
                self.inno_speech_seeker_model = InnoSpeechSeeker(local_model_path)
                print(f'inno speech seeker model laod')
            elif market_project_id in hbmp_premium_model_ist:
                self.hbmp_premium_model = HbmpPremium(local_model_path)
                print(f'hbmp premium model laod')

    def addContact(self, contactInfo):
        self.utilClass.sendSlackMessage(f'''
    이름: {contactInfo.get('name', '')}\n
    이메일: {contactInfo.get('email', '')}\n
    내용: {contactInfo.get('message', '')}\n
    회사명: {contactInfo.get('company', '')}\n
    직책: {contactInfo.get('position', '')}\n
    전화번호: {contactInfo.get('phone', '')}\n
    utm_source: {contactInfo.get('utmSource', '')}\n
    utm_medium: {contactInfo.get('utmMedium', '')}\n
    utm_campaign: {contactInfo.get('utmCampaign', '')}\n
    utm_term: {contactInfo.get('utmTerm', '')}\n
    utm_content: {contactInfo.get('utmContent', '')}\n
    ''', sales=True)

        self.utilClass.sendSlackMessage(f'''
        이름: {contactInfo.get('name', '')}\n
        이메일: {contactInfo.get('email', '')}\n
        내용: {contactInfo.get('message', '')}\n
        회사명: {contactInfo.get('company', '')}\n
        직책: {contactInfo.get('position', '')}\n
        전화번호: {contactInfo.get('phone', '')}\n
        utm_source: {contactInfo.get('utmSource', '')}\n
        utm_medium: {contactInfo.get('utmMedium', '')}\n
        utm_campaign: {contactInfo.get('utmCampaign', '')}\n
        utm_term: {contactInfo.get('utmTerm', '')}\n
        utm_content: {contactInfo.get('utmContent', '')}\n
        utm_content: {contactInfo.get('utmContent', '')}\n
        ''', contact=True)

        return HTTP_201_CREATED, self.dbClass.createContact(contactInfo)

    def getNews(self, news_type, count = 10, page = 1):
        return HTTP_200_OK, [x for x in self.dbClass.getNews(news_type)]

    def get_coffetime_Attendees(self):
        return HTTP_200_OK, [x.name for x in self.dbClass.get_coffetime_Attendees()]

    def join_coffe_time(self, employee_name, is_join):
        self.dbClass.join_coffe_time_by_employee_name(employee_name, is_join)
        return HTTP_200_OK, [x.name for x in self.dbClass.get_coffetime_Attendees()]

    def get_current_price(self, ticker):
        try:
            return HTTP_200_OK, pyupbit.get_orderbook(ticker=ticker)["orderbook_units"][0]["ask_price"]
        except:
            return HTTP_500_INTERNAL_SERVER_ERROR, "Error"

    # def get_bithumb_current_price(self, ticker):
    #     try:
    #         return HTTP_200_OK, pybithumb.get_current_price(ticker)
    #     except:
    #         return HTTP_500_INTERNAL_SERVER_ERROR, "Error"

    # def get_bithumb_balance(self, access, secret, ticker):
    #     bithumb = pybithumb.Bithumb(access, secret)
    #
    #     won = 0
    #
    #     balance = bithumb.get_balance(ticker)
    #     print(ticker, "-", "보유수량", format(balance[0], 'f'), ", 평가금액",
    #           format(balance[0] * pybithumb.get_current_price(ticker), 'f'))
    #
    #     result = {"ticker": ticker, "보유 수량": balance[0], "평가 금액": balance[0] * pybithumb.get_current_price(ticker)}
    #
    #     return result

    def get_balance(self, access, secret, ticker):
        try:
            upbit = pyupbit.Upbit(access, secret)

            balances = upbit.get_balances()
            for b in balances:
                if b['currency'] == ticker:
                    if b['balance'] is not None:
                        return HTTP_200_OK, float(b['balance'])
                    else:
                        return HTTP_200_OK, 0
            return HTTP_200_OK, 0
        except:
            return HTTP_500_INTERNAL_SERVER_ERROR, "Error"

    def buy_coin(self, buy_coin_object):
        try:
            access = buy_coin_object.access
            secret = buy_coin_object.secret
            price = buy_coin_object.price
            ticker = buy_coin_object.ticker
            price_type = buy_coin_object.price_type
            volume = buy_coin_object.volume

            upbit = pyupbit.Upbit(access, secret)

            if price_type == 0:
                upbit.buy_market_order(ticker, price)
            elif price_type == 1:
                upbit.buy_limit_order(ticker, price, volume)
            return HTTP_200_OK, "Success"
        except:
            return HTTP_500_INTERNAL_SERVER_ERROR, "Fail"

    def sell_coin(self, sell_coin_object):
        try:
            access = sell_coin_object.access
            secret = sell_coin_object.secret
            price = sell_coin_object.price
            ticker = sell_coin_object.ticker
            price_type = sell_coin_object.price_type
            volume = sell_coin_object.volume

            upbit = pyupbit.Upbit(access, secret)

            if price_type == 0:
                upbit.sell_market_order(ticker, price)
            elif price_type == 1:
                upbit.sell_limit_order(ticker, price, volume)
            return HTTP_200_OK, "Success"
        except:
            return HTTP_500_INTERNAL_SERVER_ERROR, "Fail"

    # def buy_bithumb_coin(self, buy_coin_object):
    #     try:
    #         access = buy_coin_object.access
    #         secret = buy_coin_object.secret
    #         price = buy_coin_object.price
    #         ticker = buy_coin_object.ticker
    #         price_type = buy_coin_object.price_type
    #         volume = buy_coin_object.volume
    #
    #         bithumb = pybithumb.Bithumb(access, secret)
    #
    #         if price_type == 0:
    #             bithumb.buy_market_order(ticker, price)
    #         elif price_type == 1:
    #             bithumb.buy_limit_order(ticker, price, volume)
    #         return HTTP_200_OK, "Success"
    #     except:
    #         return HTTP_500_INTERNAL_SERVER_ERROR, "Fail"

    # def sell_bithumb_coin(self, sell_coin_object):
    #     try:
    #         access = sell_coin_object.access
    #         secret = sell_coin_object.secret
    #         price = sell_coin_object.price
    #         ticker = sell_coin_object.ticker
    #         price_type = sell_coin_object.price_type
    #         volume = sell_coin_object.volume
    #
    #         bithumb = pybithumb.Bithumb(access, secret)
    #
    #         if price_type == 0:
    #             bithumb.sell_market_order(ticker, price)
    #         elif price_type == 1:
    #             bithumb.sell_limit_order(ticker, price, volume)
    #         return HTTP_200_OK, "Success"
    #     except:
    #         return HTTP_500_INTERNAL_SERVER_ERROR, "Fail"

    # def tradier_token_init(self, code, state):
    #
    #     split_state = state.split('_')
    #     user_token = split_state[0]
    #     redirect_url = split_state[1]
    #     user = self.dbClass.getUser(user_token)
    #     result = 'fail'
    #
    #     if not user:
    #         self.utilClass.sendSlackMessage(
    #             f"파일 : manageEtc.py \n함수 : tradier_token_init \n잘못된 토큰으로 에러 | 입력한 토큰 : {user_token}",
    #             appError=True, userInfo=user)
    #     else:
    #         if code and user_token and redirect_url:
    #             # url = f'{self.utilClass.tradier_url}/oauth/accesstoken'
    #             url = f'https://api.tradier.com/v1/oauth/accesstoken'
    #             data = {
    #                 'grant_type': 'authorization_code',
    #                 'code': code
    #             }
    #             response = requests.post(url,
    #                                      headers=self.tradier_headers,
    #                                      data=data
    #                                      )
    #             trace = response.status_code
    #             if response.status_code == 200:
    #                 try:
    #                     json_response = response.json()
    #                     status = json_response.get('status')
    #                     if status == "approved":
    #                         access_token = json_response.get('access_token')
    #                         refresh_token = json_response.get('refresh_token')
    #                         self.dbClass.updateUser(user['id'], {
    #                             'tradier_access_token': access_token,
    #                             'tradier_refresh_token': refresh_token
    #                         })
    #                         result = 'success'
    #                 except:
    #                     trace = str(traceback.format_exc())
    #
    #             if result == 'fail':
    #                 self.utilClass.sendSlackMessage(
    #                     f"파일 : manageEtc.py \n"
    #                     f"함수 : tradier_token_init\n"
    #                     f"tradier api request 실패\n"
    #                     f"{trace}",
    #                     appError=True, userInfo=user)
    #
    #     return_url = redirect_url + f"?result={result}"
    #
    #     return HTTP_301_MOVED_PERMANENTLY, RedirectResponse(
    #         url=return_url, headers={}, status_code=301)

    def register_enterprise_key(self, key):
        key_result = self.utilClass.isValidKey(key)
        key_result['key'] = key
        self.dbClass.register_admin_key(key_result)
        return HTTP_200_OK, {
            "status_code": 200,
            "message": "key 등록이 완료되었습니다.",
            "message_en": "Key registration is complete."
        }

    def register_trial(self):

        result = self.dbClass.getAdminKey(all_info=True)
        if result and result.is_trial_used:
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "status_code": 503,
                "message": "이미 사용한 기능입니다.",
                "message_en": "Trial registration is already used.",
                "data": model_to_dict(result)
            }
        else:
            from src.creating.license import License
            trial_key_info = License().generate_license(valid_date=30, plan="enterprise")
            trial_key_info['is_trial_used'] = True
            self.dbClass.register_admin_key(trial_key_info)

            result = self.dbClass.getAdminKey(all_info=True)
            return HTTP_200_OK, {
                "status_code": 200,
                "message": "Trial 등록이 완료되었습니다.",
                "message_en": "Trial registration is complete.",
                "data": model_to_dict(result)
            }

    def key_status(self):
        result = self.dbClass.getAdminKey(all_info=True)
        if not result:
            return HTTP_200_OK, {"result": False}

        is_valid = self.utilClass.isValidKey(result.key)
        try:
            from src.creating.spliting import Spliting
            is_open_source = False
        except:
            is_open_source = True

        return HTTP_200_OK, {"result": True, "mac": get_mac(), "is_valid": is_valid, "is_open_source": is_open_source, "plan": result.plan if result else None}

    def upload_external_model(self, key, pass_wd, user_email, image_file, file, project_name, input_data,
                              training_method, description, company_name, name_en, name_kr):

        if file:
            file_name = file.filename
            file = file.file.read()
        else:
            file_name = None

        if image_file:
            image_file_name = image_file.filename
            image_file = image_file.file.read()
        else:
            image_file_name = None
        input_data = json.loads(input_data)
        user = self.dbClass.getUserByEmail(user_email, raw=True)
        if not user:
            raise ex.NotFoundUserEx(email=user_email)

        self.certify(key, pass_wd)

        if image_file:
            self.s3.put_object(Body=image_file, Bucket=self.utilClass.bucket_name, Key=f"opt/user/{user.id}/client_model/{image_file_name}")
            image_file_url = urllib.parse.quote(
                f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com{self.utilClass.save_path}/user/{user.id}/client_model/{image_file_name}').replace(
                'https%3A//', 'https://')

        data = {'visible_flag': 0, 'thumbnail': image_file_url, 'name_en': name_en, 'name_kr': name_kr}
        market_model = self.dbClass.createMarketModel(data)

        if file is not None:
            if len(file) < 3 * 1024 * 3:
                self.s3.put_object(Body=file, Bucket=self.utilClass.bucket_name,
                                   Key=f"opt/user/{user.id}/client_model/{file_name}")
            else:
                upload_file_path = f"{self.utilClass.save_path}/user/{user.id}/client_model/{file_name}"

                os.makedirs(f'{self.utilClass.save_path}/user/{user.id}/client_model/', exist_ok=True)

                with open(upload_file_path, 'wb') as f:
                    f.write(file)
                self.s3.upload_file(upload_file_path, self.utilClass.bucket_name, f"opt/user/{user.id}/client_model/{file_name}",)

            s3Url = urllib.parse.quote(
                f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com{self.utilClass.save_path}/user/{user.id}/client_model/{file_name}').replace(
                'https%3A//', 'https://')
            status = 100
            status_text = "100 : 학습이 완료되었습니다."
        else:
            status = 1
            status_text = "1 : 모델을 준비 중입니다."
            s3Url = None

        data = {
            "projectName": project_name,
            "status": status,
            "statusText": status_text,
            "filePath": s3Url,
            "fileStructure": input_data,
            "trainingMethod": training_method,
            "service_type": "client_model",
            "user": user.id,
            'option': company_name,
            'marketmodel': market_model.id,
            'nextPaymentDate': '2500-07-03 16:16:38'
        }

        result = self.dbClass.createMarketProject(data)

        market_request_data = {
            "userId": user.id,
            "status": status,
            "marketproject": result.id,
            "description": description,
            "marketmodel": market_model.id
        }
        self.dbClass.createMarketRequest(market_request_data)

        return HTTP_201_CREATED, result.__dict__['__data__']

    def certify(self, key, passwd):
        privacy = self.utilClass.privacy
        passwd_dict = self.utilClass.passwd_dict

        if not privacy.get(key):
            message = f"누군가가 Aceess key를 잘못입력하였습니다. |"
            self.utilClass.sendSlackMessage(message, data_part=True)
            raise ex.NotAllowedKeyEx(key)
        else:
            user_name = privacy.get(key)
            if passwd_dict[user_name] != passwd:
                message = f"{user_name}님이 비밀번호를 잘못입력하였습니다. |"
                self.utilClass.sendSlackMessage(message, data_part=True)
                raise ex.NotAllowedPasswdEx(key)
            return user_name

    def predict_external_model(self, market_project_id, predict_external_model):
        user = self.dbClass.getUserByAppToken(predict_external_model.app_token)
        if not user:
            raise ex.NotFoundUserEx(predict_external_model.app_token)

        model_project_raw = self.dbClass.getOneMarketProjectById(market_project_id)

        if model_project_raw['user'] != user.id and user.id != 617:
            raise ex.NotAllowedTokenEx(user.email)

        if model_project_raw["option"] == 'inno_speech':
            output = self.inno_speech_model.inference([predict_external_model.input_data], predict_external_model.k)
        elif model_project_raw['option'] == 'wide_field_search':
            input_data = predict_external_model.input_data
            text = input_data['text']
            content_count = input_data['content_count']
            similarity = input_data['similarity']

            output = [self.wide_field_model.search(text, content_count, similarity)]
        elif model_project_raw['option'] == 'wide_field_deploy':
            input_data = predict_external_model.input_data
            s3_url, kst_str_deply_at, version = self.wide_field_model.deploy(input_data, user.id)
            if s3_url:
                market_project_ids = [x.id for x in self.dbClass.get_wide_field_market_project(user.id)]
                condition = marketProjectsTable.id.in_(market_project_ids)
                self.dbClass.update_marketproject_by_condition(condition, {'filePath': s3_url})

                model_project_raw = self.dbClass.getOneMarketProjectById(market_project_id)

                file_name = model_project_raw['filePath'].split('/')[-1]

                os.makedirs(f'{self.utilClass.save_path}/user/{model_project_raw["user"]}/{model_project_raw["service_type"]}', exist_ok=True)
                local_model_path = f'{self.utilClass.save_path}/user/{model_project_raw["user"]}/{model_project_raw["service_type"]}/{file_name}'

                if not os.path.isfile(local_model_path):
                    if model_project_raw['option'] in ['wide_field_deploy', 'wide_field', 'wide_field_search']:
                        shutil.rmtree(f'{self.utilClass.save_path}/user/{model_project_raw["user"]}/{model_project_raw["service_type"]}')
                        os.makedirs(f'{self.utilClass.save_path}/user/{model_project_raw["user"]}/{model_project_raw["service_type"]}',
                                    exist_ok=True)
                    self.s3.download_file(self.utilClass.bucket_name, model_project_raw["filePath"].split('com/')[1],
                                          local_model_path)
                self.wide_field_model = WideField(local_model_path)

            return HTTP_200_OK, {"message": "디플로이가 성공적으로 완료되었습니다.", "status_code": 200,
                                 "last_updated_at": kst_str_deply_at, "version": version}

        elif model_project_raw['option'] == 'wide_field':
            input_data = predict_external_model.input_data

            content_count = input_data['content_count']

            output = [self.wide_field_model.recommendation_to_user(content_count)]
        elif model_project_raw['option'] == 'hbmp':
            input_data = predict_external_model.input_data
            output = self.hbmp_model.final_chat_partner_recommend(input_data['user_id'])
        elif model_project_raw['option'] == 'hbmp_premium':
            input_data = predict_external_model.input_data
            algo = self.hbmp_premium_model.fit(golf_type=1, n_epochs=50, lr_all=0.01, random_state=10)
            output = self.hbmp_premium_model.inference(input_data['user_id'], algo, input_data['count'])
        elif model_project_raw['option'] == 'inner_trip':
            input_data = predict_external_model.input_data
            output = self.inner_trip_model.recommend_survey(input_data, predict_external_model.k)
        elif model_project_raw["option"] == 'inno_speech2':
            input_data = predict_external_model.input_data
            k = predict_external_model.k
            output = self.inno_speech_seeker_model.find_similar_hr(input_data, k)

        return HTTP_201_CREATED, output[0]

    def predict_external_model_by_files(self, market_project_id, files, app_token):
        user = self.dbClass.getUserByAppToken(app_token)
        if not user:
            raise ex.NotFoundUserEx(app_token)

        model_project_raw = self.dbClass.getOneMarketProjectById(market_project_id)

        if model_project_raw['user'] != user.id:
            raise ex.NotAllowedTokenEx(user.email)

        if model_project_raw["option"] == 'techy_preference':
            profile = pd.read_csv(BytesIO(files[0].file.read()), index_col=0)
            condition = pd.read_csv(BytesIO(files[1].file.read()))
            output_df = recommend_techy_preference(profile, condition)
        elif model_project_raw["option"] == 'techy_appearance_score':
            look_rating_from_male = pd.read_csv(BytesIO(files[0].file.read()), index_col=0)
            look_rating_from_female = pd.read_csv(BytesIO(files[1].file.read()), index_col=0)
            output_df = TechyAppearanceScore(look_rating_from_male, look_rating_from_female).recommend()
        elif model_project_raw["option"] == 'techy_meeting_score':
            profiles = pd.read_csv(BytesIO(files[0].file.read()), index_col=0)
            meeting = pd.read_csv(BytesIO(files[1].file.read()), index_col=0)
            output_df = TechyMeetingScore(profiles, meeting).recommend()

        os.makedirs(f'{self.utilClass.save_path}/user/{user.id}/{model_project_raw["option"]}', exist_ok=True)
        output_file_path = f'{self.utilClass.save_path}/user/{user.id}/{model_project_raw["option"]}/output_file.csv'
        output_df.to_csv(output_file_path)

        result_file = open(output_file_path, mode="rb")
        result = result_file.read()
        result_file.close()

        if os.path.isfile(output_file_path):
            os.remove(output_file_path)

        return HTTP_201_CREATED, io.BytesIO(result)

    def main_page(self, token):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : getGroupDataByAdminId \n허용되지 않은 앱 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        usages = None

        if self.utilClass.configOption != 'enterprise':
            amount_dict, start_date, end_date = self.paymentClass.get_usage_amount_by_user(user)

            amount_dict['deposit'] = round(user.deposit, 3)
            usages = []
            for amount_name, amount_key in amount_dict.items():
                usage = {
                    'name': amount_name,
                    'value': amount_key
                }
                usages.append(usage)

        user = user.__dict__['__data__']

        user_id = user['id']
        adminGroup = [x.__dict__['__data__'] for x in self.dbClass.getGroupsByUserIdAndRoles(user_id, 'admin')]

        for group in adminGroup:
            group['member'] = [x.__dict__['__data__'] for x in self.dbClass.getMembersByGroupId(group['id'], True)]

        memberGroup = [x.__dict__['__data__'] for x in self.dbClass.getGroupsByUserIdAndRoles(user_id)]

        for group in memberGroup:
            group['member'] = [x.__dict__['__data__'] for x in self.dbClass.getMembersByGroupId(group['id'], False)]
            group['hostuserList'] = self.dbClass.getHostUsersByGroupId(group['id']).__dict__['__data__']
            group['acceptcode'] = self.dbClass.getMemberByUserIdAndGroupId(user_id, group['id']).__dict__['__data__'][
                'acceptcode']

        user["billings"] = []
        # if self.utilClass.configOption != 'enterprise':
        try:
            user["usageplan"] = self.dbClass.getOneUsageplanById(user["usageplan"])
            if user['promotionCode']:
                promotion = self.dbClass.getPromotionIdByPromotionCode(user)
                if promotion:
                    if promotion.planName:
                        if promotion.planName == user["usageplan"]["planName"]:
                            user["usageplan"]["price"] = user["usageplan"]["price"] * (
                                        1 - 0.01 * promotion.discountPercent)
                    else:
                        user["usageplan"]["price"] = user["usageplan"]["price"] * (1 - 0.01 * promotion.discountPercent)

        except:
            pass

        userUsage = self.dbClass.getUserUsageByUserId(user['id'])
        userUsage['ClickAi'] = user['cumulativePredictCount']
        user['usage'] = userUsage

        del user['cardInfo']
        del user['password']
        del user['resetPasswordVerifyTokenID']
        del user['resetPasswordVerifyLink']

        get_data_connector_types = [x.__dict__['__data__'] for x in self.dbClass.getDataconnectortypes()]

        project_categories = []
        for projectCategoryRaw in self.dbClass.getProjectCategories():

            project_category = projectCategoryRaw.__dict__['__data__']

            projects = []
            for projectRaw in self.dbClass.getProjectsByCategoryId(project_category["id"]):
                projects.append(projectRaw.__dict__['__data__'])

            project_category["projects"] = projects
            project_categories.append(project_category)

        pgPaymentInfo = self.dbClass.getLastPgRegistrationByUserId(user_id)
        if pgPaymentInfo is None:
            card_no = None
            created_at = None
            card_type = None
        else:
            card_no = pgPaymentInfo.get('PCD_PAY_CARDNUM')
            created_at = pgPaymentInfo.get('created_at')
            card_type = pgPaymentInfo.get('pg_provider')

        pgregistration = {
            "CardNo": card_no,
            "CreatedAt": created_at,
            "CardType": card_type
        }

        result = {
            'group': {'parentsGroup': adminGroup, 'childrenGroup': memberGroup},
            'me': user,
            'dataconnectortypes': get_data_connector_types,
            'projectcategories': project_categories,
            'pgregistration': pgregistration,
            'usages': usages
        }

        return HTTP_200_OK, result

    def add_voucher_user(self,
                         key,
                         passwd,
                         company,
                         voucher_email,
                         voucher_type,
                         is_recharge,
                         charge_deposit,
                         start_date,
                         end_date,
                         manager_email):

        try:
            start_date = datetime.datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            raise ex.NotValidDateErrorEx(f'{start_date}, {end_date}')

        user_name = self.dataClass.certify(key, passwd)

        message = f"{user_name}님이 바우처 고객 생성 작업을 요청하셨습니다.\n " \
                  f"company: {company}\n" \
                  f"voucher_email: {voucher_email}\n" \
                  f"voucher_type: {voucher_type}\n" \
                  f"is_recharge: {is_recharge}\n" \
                  f"charge_deposit: {charge_deposit}\n" \
                  f"start_date: {start_date}\n" \
                  f"end_date: {end_date}\n" \
                  f"manager_email: {manager_email}\n"

        self.utilClass.sendSlackMessage(message, business_part=True)

        voucher_user = self.dbClass.getUserByEmail(voucher_email, raw=True)
        if voucher_user is None:
            raise ex.NotValidVoucherEmailErrorEx(voucher_email)

        voucher_manager = self.dbClass.getUserByEmail(manager_email, raw=True)
        if voucher_manager is None:
            raise ex.NotValidManagerEmailErrorEx(manager_email)

        voucher_dict = {
            'company': company,
            'user': voucher_user.id,
            'voucher_type': voucher_type,
            'is_recharge': is_recharge,
            'charge_deposit': charge_deposit,
            'start_date': start_date,
            'end_date': end_date,
            'manager': voucher_manager.id
        }

        voucher = model_to_dict(self.dbClass.createVoucherUser(voucher_dict))
        voucher['voucher_email'] = voucher_email
        voucher['manager_email'] = manager_email

        today = datetime.datetime.today()
        limit_day = start_date - datetime.timedelta(days=1)

        if today < limit_day:
            user_data = {
                'nextPaymentDate': start_date
            }
            msg = f"바우처 고객 생성이 완료되었습니다. 바우처 시작일({start_date})에 크레딧 충전 예정입니다."
        else:
            before_deposit = voucher_user.deposit
            after_deposit = before_deposit + charge_deposit

            try:
                new_payment_date = voucher_user.nextPaymentDate.replace(day=start_date.day)
            except ValueError:
                new_payment_date = self.utilClass.last_day_of_month(voucher_user.nextPaymentDate.month)

            user_data = {
                'nextPaymentDate': new_payment_date,
                'deposit': after_deposit
            }
            msg = f"바우처 고객 생성이 완료되었습니다. 바우처 유저의 크레딧이 충전되었습니다. 기존 크레딧 : {before_deposit}, 충전 후 크레딧 : {after_deposit}"
        self.dbClass.updateUser(voucher_user.id, user_data)

        self.utilClass.sendSlackMessage(msg, business_part=True)

        result = {
            "message": msg,
            "voucherUser": voucher
        }

        return HTTP_200_OK, result

    def get_voucher_user(self, key, passwd, email, is_recharge, is_used, order_by):

        user_name = self.dataClass.certify(key, passwd)

        message = f"{user_name}님이 바우처 고객 조회 작업을 요청하셨습니다.\n"
        self.utilClass.sendSlackMessage(message, business_part=True)

        if email:
            user = self.dbClass.getUserByEmail(email, raw=True)
            if user is None:
                raise ex.NotValidVoucherEmailErrorEx(email)
            user_id = user.id
        else:
            user_id = None

        voucher_users = [model_to_dict(x) for x in self.dbClass.get_voucher_users_by_user_id(user_id, is_recharge=is_recharge, is_used=is_used, order_by=order_by)]

        for voucher in voucher_users:
            user = self.dbClass.get_user_by_id(voucher.get('user'))
            if user:
                voucher['user_email'] = user.get('email')
                voucher['next_payment_date'] = user.get('nextPaymentDate')
            manager = self.dbClass.get_user_by_id(voucher.get('manager'))
            if manager:
                voucher['manager_email'] = manager.get('email')
            del voucher['month_remain']

        result = {
            "message": "바우처 고객 조회가 완료되었습니다.",
            "voucherUsers": voucher_users
        }

        return HTTP_200_OK, result

    def delete_voucher_user(self, key, passwd, voucher_id):

        user_name = self.dataClass.certify(key, passwd)

        message = f"{user_name}님이 바우처 고객 삭제 작업을 요청하셨습니다.\n 바우처 고객 Id : {voucher_id}"
        self.utilClass.sendSlackMessage(message, business_part=True)

        voucher_user = self.dbClass.get_one_voucher_user_by_id(voucher_id)

        if voucher_user is None:
            raise ex.NotExistsVoucherErrorEx(voucher_id)

        voucher_user.delete_instance()

        result = {
            "message": "바우처 고객이 삭제되었습니다."
        }

        return HTTP_200_OK, result

    def create_voucher_sample_api(self, model_id, input_data, app_token):

        data = """import requests
import json
from pprint import pprint

url = 'https://api.ds2.ai/recommand/external/model/%s'
data = {"app_token": "%s", "input_data": %s}

response = requests.post(url, json.dumps(data))
print(f"응답 코드 : {response.status_code}")
pprint(response.json())""" % (model_id, input_data, app_token)

        os.makedirs('{self.utilClass.save_path}/voucher_model', exist_ok=True)

        with open(f'{self.utilClass.save_path}/voucher_model/{model_id}.py', mode="w") as result_file:
            result_file.write(data)

        with open(f'{self.utilClass.save_path}/voucher_model/{model_id}.py', mode="rb") as result_file:
            result = result_file.read()

        if os.path.isfile(f'{self.utilClass.save_path}/voucher_model/{model_id}.py'):
            os.remove(f'{self.utilClass.save_path}/voucher_model/{model_id}.py')

        return HTTP_201_CREATED, io.BytesIO(result)

    def update_voucher_user(self,
                            key,
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
                            manager_email
                            ):

        try:
            if start_date:
                start_date = datetime.datetime.strptime(start_date, '%Y-%m-%d')
            if end_date:
                end_date = datetime.datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            raise ex.NotValidDateErrorEx(f'{start_date}, {end_date}')

        user_name = self.dataClass.certify(key, passwd)

        voucher_user = self.dbClass.get_one_voucher_user_by_id(voucher_id)
        if voucher_user is None:
            raise ex.NotValidVoucherIdErrorEx(voucher_id)

        message = f"{user_name}님이 바우처 고객 업데이트 작업을 요청하셨습니다.\n" \
                  f"voucher_id : {voucher_id}\n" \
                  f"company: {company}\n" \
                  f"voucher_email: {voucher_email}\n" \
                  f"voucher_type: {voucher_type}\n" \
                  f"is_recharge: {is_recharge}\n" \
                  f"charge_deposit: {charge_deposit}\n" \
                  f"used_deposit: {used_deposit}\n" \
                  f"start_date: {start_date}\n" \
                  f"end_date: {end_date}\n" \
                  f"manager_email: {manager_email}\n"

        self.utilClass.sendSlackMessage(message, business_part=True)

        voucher_info = {
            'company': company,
            'voucher_email': voucher_email,
            'voucher_type': voucher_type,
            'is_recharge': is_recharge,
            'charge_deposit': charge_deposit,
            'used_deposit': used_deposit,
            'start_date': start_date,
            'end_date': end_date,
            'manager_email': manager_email
        }

        voucher_info = {k: v for k, v in voucher_info.items() if v is not None}

        if voucher_info.get('voucher_email'):
            user = self.dbClass.getUserByEmail(voucher_info.get('voucher_email'), True)
            if user is None:
                raise ex.NotValidVoucherEmailErrorEx(voucher_info.get('voucher_email'))
            voucher_info['user'] = user.id
            del voucher_info['voucher_email']

        if voucher_info.get('manager_email'):
            voucher_manager = self.dbClass.getUserByEmail(voucher_info.get('manager_email'), True)
            if voucher_manager is None:
                raise ex.NotValidManagerEmailErrorEx(voucher_info.get('manager_email'))
            voucher_info['manager'] = voucher_manager.id
            del voucher_info['manager_email']

        voucher = model_to_dict(self.dbClass.update_voucher_user(voucher_user.id, voucher_info))

        user = self.dbClass.get_user_by_id(voucher.get('user'), raw=True)
        voucher['user_email'] = user.email
        if start_date:
            try:
                new_payment_date = user.nextPaymentDate.replace(day=start_date.day)
            except ValueError:
                new_payment_date = self.utilClass.last_day_of_month(user.nextPaymentDate.month)

            user_data = {
                'nextPaymentDate': new_payment_date
            }
            user = self.dbClass.updateUser(user.id, user_data)

        manager = self.dbClass.get_user_by_id(voucher.get('manager'))
        voucher['manager_email'] = manager.get('email')

        result = {
            "message": "바우처 고객 업데이트가 완료되었습니다. 크레딧 수정 시 별도로 반영이 필요합니다.",
            "voucherUser": voucher
        }

        return HTTP_200_OK, result

    def send_slack_for_feedback(self, feedback_object):

        feedback_email = feedback_object.feedback_email
        feedback_type = feedback_object.feedback_type
        feedback_content = feedback_object.feedback_content

        message = f"--------------------------------------------\n" \
                  f"이메일 : {feedback_email}\n" \
                  f"유형 : {feedback_type}\n" \
                  f"내용 : {feedback_content}"

        slack_dict = {
            "channel": "feedback",
            "message": message
        }
        try:
            self.utilClass.send_slack_on_enterprise(slack_dict)
        except:
            raise ex.SendFeedbackFailedEx()

        result = {
            "message": message
        }

        return HTTP_200_OK, result

    def check_triton_healty(self, token):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : managePayment.py \n함수 : cancelUsage \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        res = requests.get('http://0.0.0.0:8000/v2/health/ready')

        return res.status_code, {}

if __name__ == '__main__':
    from pydantic import BaseModel
    import time
    class PredictExternalModel(BaseModel):
        app_token: str
        input_data: dict
        k: int = 5


    model = PredictExternalModel
    model.app_token = '655073b0bed6406a914cb6119c78046a'
    model.input_data = {'text': "간편한", 'content_count': 3, 'similarity': 0.5}

    class_name = ManageEtc()
    start = time.time()
    class_name.predict_external_model(14253, model)
    print(f"end : {time.time() - start}")
