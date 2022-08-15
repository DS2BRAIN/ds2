import os
import pickle
from datetime import datetime
import calendar
import datetime
import pandas as pd
import numpy as np
from numpy import dot
from numpy.linalg import norm
from haversine import haversine
from sklearn.preprocessing import MinMaxScaler
import warnings
warnings.filterwarnings("ignore")

from surprise import Reader, Dataset
from sklearn.model_selection import train_test_split
from surprise.dataset import DatasetAutoFolds
from surprise import SVD
from surprise import NMF
from surprise import KNNBasic
from surprise.model_selection import cross_validate
from sklearn.preprocessing import StandardScaler


class HbmpPremium:
    def __init__(self, path=None):
        self.profiles_original = None
        self.profiles = None
        self.fields_original = None
        self.rsvps_original = None

        if path is not None:
            self.load(path)

    def load(self, path):
        with open(path, 'rb') as file:
            variables = pickle.load(file)
            self.__dict__.update(variables)

    def first_fit(self, profiles_original, fields_original, rsvps_original):

        profiles = profiles_original.copy()
        # 필요 없는 컬럼 삭제
        profiles.drop(columns=['id', 'realname', 'carrier', 'phone',
                               'golf_region', 'marital_status', 'golf_membership', 'thumbnail_image', 'profile_image',
                               'bio',
                               'comment', 'feedback_average', 'reset_count', 'reset_visit', 'reset_sms'], inplace=True)
        profiles.reset_index(drop=True, inplace=True)

        # 생년월일 -> 출생년도만 가져오고 생년월일 컬럼 삭제
        # 출생년도로 나이 환산(추후 나이 필터링시 사용 가능)
        profiles['yob'] = profiles['dob'].map(
            lambda x: str(x).split('-')[0] if len(str(x).split('-')) > 2 and str(x).split('-')[0] != '0000' else np.nan)
        profiles['yob'] = pd.to_numeric(profiles['yob'], errors='coerce')
        now_year = datetime.datetime.now().year
        profiles['age'] = profiles['yob'].apply(lambda x: now_year - x + 1)
        profiles['age'] = profiles['age'].map(lambda x: x if x <= 90 and x >= 18 else np.nan)
        profiles.drop(columns=['dob'], inplace=True)

        # 성별 정리
        gender = {'male': ['male', 'M', '남성'],
                  'female': ['female', 'F', 'female\r\n'],
                  'unknown': ['\\N', 'U']}
        for a in profiles['gender']:
            for k, v in gender.items():
                if a in list(v):
                    a = k

        # 성별 없는 것은 null
        profiles.loc[(profiles.gender != 'male') & (profiles.gender != 'female'), 'gender'] = None

        profiles = profiles[
            ['user_id', 'yob', 'age', 'gender', 'latitude', 'longitude', 'geo_location', 'golf_score', 'golf_frequency',
             'golf_oversea', 'golf_year']]

        # 성별별 ID 저장
        male_id = list(profiles[profiles.gender == 'male'].user_id.unique())
        female_id = list(profiles[profiles.gender == 'female'].user_id.unique())

        # 프리미엄 게시글 데이터 가져오기
        # golf_type = 1, 2, 3
        fields = fields_original.copy()
        fields = fields[fields.poster_id.isin(male_id)]
        fields = fields[fields.partner_id.isin(female_id)]

        # 게시글 작성 정보중 추천시스템에 필요한 정보만 가져온 dataframe 'fields_summary'생성
        # 포함 컬럼 - id, poster_id, partner_id, golf_type
        fields_summary = fields[['id', 'poster_id', 'partner_id', 'golf_type']]

        # partner_id -> confirm_partner_id : 확정 회원이므로 정확한 의미를 나타낼 수 있도록 컬럼 이름 변경
        fields_summary.columns = ['id', 'poster_id', 'confirm_partner_id', 'golf_type']

        # 조인 구인 정보에 신청자 정보
        rsvps = rsvps_original.copy()

        # 신청 중 프리미엄 신청건 정보
        rsvps_summary = rsvps[rsvps.field_id.isin(fields.id.unique())]

        # 프리미엄 신청 중 여성 회원이 신청건 정보
        rsvps_summary = rsvps_summary[rsvps_summary.poster_id.isin(female_id)]

        # fields_summary 컬럼명과 merge 및 비교 확인 가능하도록 컬럼명 변경
        # field_id -> id(fields_summary의 id와 같은 의미)
        # poster_id -> apply_partner_id(게시글에 신청한 회원 아이디)
        rsvps_summary.columns = ['id', 'apply_partner_id']

        premium = pd.merge(fields_summary, rsvps_summary, how='left')
        premium = premium.sort_values(['id'])
        premium_matching_success = premium.dropna(subset=['apply_partner_id'])
        premium_matching_success.reset_index(drop=True, inplace=True)

        ##### rating 정보 생성 #####
        # 실제 매칭이 된 회원 - 3점, 신청 후 비매칭 회원 1점으로 점수 부여
        premium_matching_success['ratings_raw'] = [3 if c == a else 1 for c, a in
                                                   zip(premium_matching_success['confirm_partner_id'],
                                                       premium_matching_success['apply_partner_id'])]

        self.premium_matching_success = premium_matching_success

        self.rsvps = rsvps
        self.profiles = profiles
        self.fields = fields

    def save(self, path):

        variables = {}

        for name, value in self.__dict__.items():
            variables[name] = value

        with open(path, 'wb') as file:
            pickle.dump(variables, file)

    def premium_experience(self, member_id):
        if member_id not in self.premium_matching_success.poster_id.unique():

            premium_profiles = self.profiles[self.profiles.user_id.isin(self.fields.poster_id.unique())]
            premium_profiles = premium_profiles[['user_id', 'age', 'latitude', 'longitude', 'golf_score', 'golf_year']]

            preimium_diff = pd.DataFrame()
            preimium_diff['user_id'] = premium_profiles['user_id']
            for col in ['age', 'golf_score', 'golf_year']:
                preimium_diff[col] = abs(premium_profiles[col] - self.profiles[self.profiles.user_id == member_id][col].item())

            user_loc = self.profiles[self.profiles.user_id == member_id].latitude.item(), self.profiles[
                self.profiles.user_id == member_id].longitude.item()
            preimium_diff['dist'] = [haversine(user_loc, (x, y), unit='km') for x, y in
                                     zip(premium_profiles['latitude'], premium_profiles['longitude'])]
            preimium_diff = preimium_diff[['user_id', 'age', 'dist', 'golf_score', 'golf_year']]

            scaler = MinMaxScaler()
            output = scaler.fit_transform(preimium_diff.iloc[:, 1:])
            output = pd.DataFrame(output, columns=preimium_diff.columns[1:],
                                  index=list(preimium_diff.iloc[:, 1:].index.values))

            scaled_preimium_diff = pd.concat(
                [preimium_diff.iloc[:, 0], output.iloc[:, 0] * 10, output.iloc[:, 1] * 50, output.iloc[:, 2:]], axis=1)

            scaled_preimium_diff['diff'] = 0
            for col in scaled_preimium_diff.columns[1:]:
                scaled_preimium_diff['diff'] += scaled_preimium_diff[col] ** 2
            scaled_preimium_diff['diff'] = np.sqrt(scaled_preimium_diff['diff'])
            scaled_preimium_diff.sort_values(by=['diff'], inplace=True)
            scaled_preimium_diff.reset_index(drop=True, inplace=True)

            user_id = scaled_preimium_diff.loc[0].user_id

            return user_id

        else:
            user_id = member_id

            return user_id

    def fit(self, golf_type=1, n_epochs=50, lr_all=0.01, random_state=10):

        final_ratings = []
        for t, r in zip(self.premium_matching_success['golf_type'], self.premium_matching_success['ratings_raw']):
            if t == golf_type:
                r = r * 2
            final_ratings.append(r)
        self.premium_matching_success['ratings'] = final_ratings
        premium_rating = self.premium_matching_success[['poster_id', 'apply_partner_id', 'ratings']]

        premium_rating = premium_rating.groupby(['poster_id', 'apply_partner_id']).max().reset_index()

        reader = Reader(rating_scale=(0, premium_rating['ratings'].max()))
        data = Dataset.load_from_df(premium_rating, reader)
        trainset = DatasetAutoFolds.build_full_trainset(data)
        algo = SVD(n_epochs=50, lr_all=0.01, random_state=10)
        cross_validate(algo, data, measures=['RMSE', 'MAE'], cv=5, verbose=True)
        algo.fit(trainset)

        return algo

    def sortkey_est(self, pred):
        return pred.est

    def inference(self, member_id, algo, top_n=100):

        user_id = self.premium_experience(member_id)

        application_df = self.premium_matching_success[self.premium_matching_success.poster_id == user_id]
        matched_id = list(application_df.confirm_partner_id.unique())
        applied_id = list(application_df[~application_df.apply_partner_id.isin(matched_id)].apply_partner_id.unique())

        if user_id == member_id:
            unmatched_id = [i for i in self.premium_matching_success.apply_partner_id.unique() if i not in matched_id]
        else:
            unmatched_id = [i for i in self.premium_matching_success.apply_partner_id.unique()]

        predictions = [algo.predict(user_id, partner_id) for partner_id in unmatched_id]

        predictions.sort(key=self.sortkey_est, reverse=True)
        top_predictions = predictions[:top_n]

        top_partner_ids = [int(pred.iid) for pred in top_predictions]
        top_partner_ratings = [pred.est for pred in top_predictions]

        top_partner_preds = [{"user_id": id, "rating": float(round(rating, 3))} for id, rating in zip(top_partner_ids, top_partner_ratings)]

        return [top_partner_preds]