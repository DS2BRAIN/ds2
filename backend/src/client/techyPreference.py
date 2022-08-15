import os
from datetime import datetime
import calendar
import datetime
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings("ignore")

import ast
import time
from haversine import haversine

class TechyPreference:
    def __init__(self, user_id, data, profile, condition):
        self.user_id = user_id
        self.user = profile[profile.user_id==user_id].iloc[0]
        self.target = condition[condition.user_id==user_id].iloc[0]
        self.data = data

    def get_age_score(self):
        if np.isnan(self.target.age_min):
            ideal_age_min = self.user.yob + 30
        else:
            ideal_age_min = self.user.yob + self.target.age_min

        if np.isnan(self.target.age_max):
            ideal_age_max = self.user.yob - 30
        else:
            ideal_age_max = self.user.yob - self.target.age_max

        if ideal_age_max < self.partner.yob and ideal_age_min > self.partner.yob:
            age_score = 5
        else :
            diff = min(abs(ideal_age_max - self.partner.yob), abs(ideal_age_min  - self.partner.yob))
            age_score = 5 - min(4, abs(self.partner.yob - diff))

        return age_score


    def get_dist_score(self):
        x1 = self.user.lat_lng[0]
        y1 = self.user.lat_lng[1]
        x2 = self.partner.lat_lng[0]
        y2 = self.partner.lat_lng[1]
        partner_dist = haversine((x1, y1), (x2, y2), unit='km')

        if partner_dist <= 20:
            dist_score = 5
        elif partner_dist <= 45:
            dist_score = 4
        elif partner_dist <= 80:
            dist_score = 3
        elif partner_dist <= 120:
            dist_score = 2
        elif partner_dist <= 200:
            dist_score = 1
        else:
            dist_score = 0

        return dist_score


    def get_religion_score(self):
        religion_value = {0: self.target.religion0_detail,
                    1: self.target.religion1_detail,
                    2: self.target.religion2_detail,
                    3: self.target.religion3_detail,
                    4: self.target.religion4_detail}

        better_list = [k for k, v in religion_value.items() if v == 3]
        good_list = [k for k, v in religion_value.items() if v in [1, 2]]
        no_matter_list = [k for k, v in religion_value.items() if v == 0]
        bad_list = [k for k, v in religion_value.items() if v in [-1,-2]]
        worse_list = [k for k, v in religion_value.items() if v == -3]


        if self.partner.religion in better_list:
            religion_score = 5
        elif self.partner.religion in good_list:
            religion_score = 4
        elif self.partner.religion in no_matter_list :
            religion_score = 3
        elif self.partner.religion in bad_list:
            religion_score = 1
        elif self.partner.religion in worse_list :
            religion_score = 0
        else:
            religion_score = 3

        return religion_score


    def get_edu_score(self):
        ideal_edu = self.target.edu_detail
        if self.partner.education >= ideal_edu:
            edu_score = 5
        else:
            edu_score = max(0, 5-(ideal_edu - self.partner.education)*2)

        return edu_score

    def get_re_score(self):
        if self.partner.real_estate_to_number == 1:
            re_score = 5
        else:
            re_score = 1

        return re_score

    def get_parent_score(self):
        if self.partner.parent == 1:
            parent_score = 5
        else:
            parent_score = 1

        return parent_score

    def get_asset_score(self):

        if self.partner.movable_assets_to_number==1:
            asset_score = 5
        else:
            asset_score = 0

        return asset_score

    def get_income_score(self):

        ideal_income_min = self.target.income_detail

        if self.partner.income >= ideal_income_min:
            income_score = 5
        else:
            income_score = max(0, 5-round((ideal_income_min - self.partner.income)/500, 1))

        return income_score

    def get_job_score(self):
        job_value = {2: self.target.job_2,
                    3: self.target.job_3,
                    4: self.target.job_4,
                    5: self.target.job_5,
                    6: self.target.job_6,
                    7: self.target.job_7,
                    }
        prefer_list = [k for k, v in job_value.items() if v == 1]
        no_matter_list = [k for k, v in job_value.items() if v == 0]
        matter_list = [k for k, v in job_value.items() if v == -1]

        if self.partner.job_area in prefer_list:
            job_score = 5
        elif self.partner.job_area in no_matter_list:
            job_score = 3
        elif self.partner.job_area in matter_list :
            job_score = 0
        else:
            job_score = 3

        return job_score

    def get_height_score(self):
        ideal_height_min = self.target.height_min
        ideal_height_max = self.target.height_max

        if ideal_height_min < self.partner.height and ideal_height_max > self.partner.height:
            height_score = 5
        else:
            diff = min(abs(ideal_height_min - self.partner.height), abs(ideal_height_max - self.partner.height))
            height_score = 5 - min(5, diff)

        return height_score

    def get_weight_score(self):
        ideal_weight_min = self.target.weight_min
        ideal_weight_max = self.target.weight_max

        if ideal_weight_min < self.partner.weight and ideal_weight_max > self.partner.weight:
            weight_score = 5
        else :
            diff = min(abs(ideal_weight_min - self.partner.weight), abs(ideal_weight_max - self.partner.weight))
            weight_score = 5 - min(5, round(abs(diff/5), 0))

        return weight_score

    def get_drink_score(self):
        ideal_drink = self.target.drink_detail
        if self.partner.drinking_capacity <= ideal_drink:
            drink_score = 5
        else:
            drink_score = 5 - min(5, abs(self.partner.drinking_capacity-ideal_drink)*2)

        return drink_score

    def get_smoking_score(self):
        ideal_smoking = self.target.smoking_detail
        if self.partner.smoking <= ideal_smoking:
            smoking_score = 5
        else:
            smoking_score = 5 - min(5, abs(self.partner.smoking-ideal_smoking)*2)

        return smoking_score

    def get_tattoo_score(self):
        ideal_tattoo = self.target.tattoo_detail
        if self.partner.tattoo <= ideal_tattoo:
            tattoo_score = 5
        else:
            tattoo_score = 5 - min(5, abs(self.partner.tattoo-ideal_tattoo)*2)

        return tattoo_score

    def recommend_ranking(self):

        recommend_rank = pd.DataFrame()
        for idx in range(0, len(self.data)):

            self.partner = self.data.loc[idx]
            total_score = self.get_age_score()*self.target.age + self.get_dist_score()*self.target.dist + \
            self.get_religion_score()*self.target.religion + self.get_edu_score()*self.target.edu + self.get_re_score()*self.target.real_estate + \
            self.get_parent_score()*self.target.parent + self.get_asset_score()*self.target.asset + self.get_income_score()*self.target.income + \
            self.get_job_score()*self.target.job + self.get_height_score()*self.target.height + self.get_weight_score()*self.target.weight + \
            self.get_drink_score()*self.target.drink + self.get_smoking_score()*self.target.smoking  + self.get_tattoo_score()*self.target.tattoo

            recommend_rank.loc[idx, 'user_id'] = self.user_id
            recommend_rank.loc[idx, 'partner_id'] = self.partner.user_id
            recommend_rank.loc[idx, 'score'] = total_score
        recommend_rank['rank'] = recommend_rank['score'].rank(method='max', ascending=False)
        recommend_rank.sort_values(by=['score'], ascending=False, inplace=True)

        return recommend_rank

def scaling_data(profile, condition):
    # 여성 회원의 선호조건에 따른 남성 회원 순위 및 점수 scaling

    male_ranking = pd.DataFrame()
    data = profile[profile.gender==0].reset_index()
    for user_id in profile[profile.gender==1].user_id.unique():
        techy = TechyPreference(user_id, data, profile, condition)
        male_ranking = male_ranking.append(techy.recommend_ranking())

    male_ranking.reset_index(drop=True, inplace=True)
    male_ranking['s_score'] = round(100 - (100/male_ranking['rank'].max()) * (male_ranking['rank'] - 1), 1)

    # 남성 회원의 선호조건에 따른 여성 회원 순위 및 점수 scaling
    female_ranking = pd.DataFrame()
    data = profile[profile.gender==1].reset_index()
    for user_id in profile[profile.gender==0].user_id.unique():
        techy = TechyPreference(user_id, data, profile, condition)
        female_ranking = female_ranking.append(techy.recommend_ranking())

    female_ranking.reset_index(drop=True, inplace=True)
    female_ranking['s_score'] = round(100 - (100/female_ranking['rank'].max()) * (female_ranking['rank'] - 1), 1)

    # 남성이 매긴 여성의 점수와 여성이 매긴 남성의 점수를 join 후 평균 점수 계산
    final = pd.DataFrame()
    idx = 0
    for m in female_ranking.user_id.unique():
        total_list = []
        for f in male_ranking.user_id.unique():
            m_score = male_ranking[(male_ranking.user_id==f) & (male_ranking.partner_id==m)].s_score.item()
            f_score = female_ranking[(female_ranking.user_id==m) & (female_ranking.partner_id==f)].s_score.item()
            total = (m_score + f_score) / 2
            final.loc[idx, 'male_id'] = m
            final.loc[idx, 'female_id'] = f
            final.loc[idx, 'total'] = total
            idx += 1

    female_ranking2 = female_ranking[['user_id', 'partner_id', 's_score']]
    female_ranking2.columns = ['male_id', 'female_id', 'score_from_male']
    male_ranking2 = male_ranking[['user_id', 'partner_id', 's_score']]
    male_ranking2.columns = ['female_id', 'male_id', 'score_from_female']

    final = pd.merge(final, female_ranking2, on=['female_id', 'male_id'], how='left')
    result_df = pd.merge(final, male_ranking2, on=['female_id', 'male_id'], how='left')

    return result_df


def recommend_techy_preference(profile__df, condition_df):
    # 프로필 데이터 가져오기
    profile__df['lat_lng'] = profile__df['lat_lng'].apply(lambda x : ast.literal_eval(x))
    profile__df['yob'] = profile__df['birth'].apply(lambda x : x.split('-')[0])
    profile__df['yob'] = pd.to_numeric(profile__df['yob'], errors='coerce')
    profile__df = profile__df[['user_id', 'address_location', 'lat_lng', 'gender', 'religion', 'yob', 'education', 'income', 'real_estate_to_number',
        'movable_assets', 'movable_assets_to_number', 'job', 'job_area',
        'blood_type', 'family_relations', 'drinking_capacity', 'height',
        'weight', 'tattoo', 'smoking', 'sibling', 'parent' ]]

    condition_df.drop(columns=['name'], inplace = True)
    # null값일 경우 대체 값 입력
    condition_df.loc[condition_df.age_min.isnull(), 'age_min'] = 30
    condition_df.loc[condition_df.age_max.isnull(), 'age_max'] = 30
    condition_df.loc[condition_df.height_min.isnull(), 'height_min'] = condition_df.height_min.min()
    condition_df.loc[condition_df.height_max.isnull(), 'height_max'] = condition_df.height_max.max()
    condition_df.loc[condition_df.weight_min.isnull(), 'weight_min'] = condition_df.weight_min.min()
    condition_df.loc[condition_df.weight_max.isnull(), 'weight_max'] = condition_df.weight_max.max()

    return scaling_data(profile__df, condition_df)