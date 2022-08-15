#!/usr/bin/env python
# coding: utf-8

# In[16]:
import pickle
from datetime import datetime
from tqdm import tqdm
from matplotlib import font_manager
from matplotlib import rc
import Categorical_similarity_measures as csm
import warnings
import requests
import json
from models import usersTable
import time
import os
import pandas as pd
import numpy as np

# warnings.filterwarnings("ignore")
# f_path = "/Library/Fonts/Arial Unicode.ttf"
# font_manager.FontProperties(fname=f_path).get_name()
# rc('font', family="Arial Unicode MS")

# workshop = pd.read_csv('./product_info.csv', index_col=0)
# reservation = pd.read_csv('./reservation_info.csv', index_col=0)
# company = pd.read_csv('./company_info.csv', index_col=0)

"""
설문조사 기반 추천
"""

class InnerTrip():
    def __init__(self, path=None):
        self.data = None

        if path is not None:
            self.load(path)


    def fit(self, data):
        """ 학습 """
        self.workshop = data

    def save(self, path):
        """ 모델 저장 """
        variables = {}
        for name, value in self.__dict__.items():
            variables[name] = value

        with open(path, 'wb') as file:
            pickle.dump(variables, file)

    def load(self, path):
        """ 모델 불러오기 """
        with open(path, 'rb') as file:
            variables = pickle.load(file)
            self.__dict__.update(variables)

    def recommend_survey(self, new_value, n=5):
        age = new_value['main_age']
        industry = new_value['industry_type']
        com = new_value['company_type']
        position = new_value['position']
        department = new_value['department']
        gender = new_value['gender_ratio']
        active = new_value['active']
        purpose = new_value['purpose']
        on_off = new_value['on/offline']
        num_people = new_value['num_people']
        max_price = new_value['max_price']

        url = "https://api.ds2.ai/predict/3038/"
        headers = {
            'content-type': "application/json",
            'cache-control': "no-cache",
        }
        category = [
            ("00_survey", 255028), ("01_edu", 255556), ("02_culture", 255182), ("03_team", 255316), ("04_health", 255870)
        ]
        df = pd.DataFrame()

        apptoken = usersTable.get_or_none(usersTable.id == 3038).appTokenCode

        for i in category[:1]:
            payload = {
                "modelid": i[1], "apptoken": apptoken,
                "parameter": {
                    "main_age__{}.csv".format(i[0]): age,
                    "company_type__{}.csv".format(i[0]): com,
                    "industry_type__{}.csv".format(i[0]): industry,
                    "position__{}.csv".format(i[0]): position,
                    "department__{}.csv".format(i[0]): department,
                    "on/offline__{}.csv".format(i[0]): on_off,
                    "active__{}.csv".format(i[0]): active,
                    "gender_ratio__{}.csv".format(i[0]): gender,
                    "purpose__{}.csv".format(i[0]): purpose
                }
            }

            response = requests.post(url, data=json.dumps(payload), headers=headers)
            res_string = response.json()
            res = json.loads(res_string)['예측값정보']
            res_final = sorted(res, key=lambda res: (res['value']), reverse=True)
            df = df.append(res_final)

            df_1 = pd.DataFrame()
            for i in category[1:]:
                payload = {
                    "modelid": i[1],
                    "apptoken": apptoken,
                    "parameter": {
                        "main_age__{}.csv".format(i[0]): age,
                        "company_type__{}.csv".format(i[0]): com,
                        "industry_type__{}.csv".format(i[0]): industry,
                        "position__{}.csv".format(i[0]): position,
                        "department__{}.csv".format(i[0]): department,
                        "on/offline__{}.csv".format(i[0]): on_off,
                        "active__{}.csv".format(i[0]): active,
                        "gender_ratio__{}.csv".format(i[0]): gender,
                        "purpose__{}.csv".format(i[0]): purpose
                    }
                }

                response = requests.post(url, data=json.dumps(payload), headers=headers)
                res_string = response.json()
                res = json.loads(res_string)['예측값정보']
                res_final = sorted(res, key=lambda res: (res['value']), reverse=True)
                df_1 = df_1.append(res_final)

        cat_name = {
            '교육': ['자기개발', '소통', '인문학교육', '동기부여', '직무/공통교육', '심리교육'],
            '문화': ['요리/베이킹', 'DIY', '무대공연', '식음료'],
            '팀빌딩': ['순환/통증관리', '퍼스널컬러/이미지메이킹', '다이어트/피부관리', '요가/필라테스/명상'],
            '액티비티': ['협력게임/교육', '이색 액티비티', '체육대회']
        }

        big_category = []
        for name in df_1.name:
            for big, small in cat_name.items():
                if name in small:
                    big_category.append(big)

        df_1['cat1'] = big_category

        score = pd.merge(df_1, df, left_on='cat1', right_on='name')
        score['score'] = score['value_y'] * (score['value_x'] / 200)
        score = score.sort_values(by='score', ascending=False)
        score = score[['name_y', 'value_y', 'name_x', 'value_x', 'score']]
        score.columns = ['category', 'cat_score', 'detail_category', 'd_cat_score', 'predict_score']

        high_detail_category = []
        for i in score.detail_category:
            if i not in high_detail_category and len(high_detail_category) < n + 3:
                high_detail_category.append(i)
            else:
                break

        recommend = pd.DataFrame()
        for cat in high_detail_category:
            recommend = recommend.append(self.workshop[self.workshop.cat_detail == cat])

        if on_off == 1:
            recommend = recommend[recommend['on/offline'] == '오프라인']
        else:
            recommend = recommend[recommend['on/offline'] == '온라인']
        recommend = recommend[recommend['min_num'] <= num_people][recommend['max_num'] >= num_people]

        recommend['total_price'] = np.nan
        recommend.loc[recommend.price_type == 'once', ['total_price']] = recommend['price']
        recommend.loc[recommend.price_type == 'person', ['total_price']] = recommend['price'] * num_people
        recommend = recommend[recommend.total_price <= num_people * max_price]
        recommend.drop(['total_price'], axis=1, inplace=True)
        result = [recommend[:n].to_dict('records')]

        return result

"""
실제 추천이 진행되도록 함수 호출
"""
if __name__ == '__main__':
    new_value = {
        'company_type': 1,  # 사기업
        'industry_type': 3,  # 백화점/유통/도소매/물류
        'position': 3,  # 과장급
        'department': 3,  # 마케팅/광고/홍보
        'main_age': 3,  # 30대
        'gender_ratio': 3,  # 남:녀 = 7:3
        'active': 1,  # 동적
        'purpose': 2,  # 소통
        'on/offline': 1,  # 오프라인
        'num_people': 31,  # 참여인원
        'max_price': 30000 # 인원당 최대비용
    }
    # print(InnerTrip().recommend_survey(new_value))

    # df = pd.read_csv('/Users/yong-eunjae/Desktop/1 테스트 데이터/기업데이터/workshop_list.csv')
    # temp = InnerTrip()
    # temp.fit(df)
    # temp.save('/Users/yong-eunjae/Desktop/1 테스트 데이터/기업데이터/inner_trip_model.dsm')

    temp = InnerTrip('/Users/yong-eunjae/Desktop/1 테스트 데이터/기업데이터/inner_trip_model.dsm')
    print(temp.recommend_survey(new_value))
