#!/usr/bin/env python
# coding: utf-8

import os
import pickle
import pandas as pd
import numpy as np
from numpy import dot
from numpy.linalg import norm
from sklearn.preprocessing import MinMaxScaler


class Hbmp:
    def __init__(self, path=None):

        self.profiles = None
        self.msg = None
        self.club_user = None
        self.predicted_ratings = None

        if path is not None:
            self.load(path)

        pass

    def save(self, path):
        """ 모델 저장 """
        variables = {}
        for name, value in self.__dict__.items():
            variables[name] = value

        with open(path, 'wb') as file:
            pickle.dump(variables, file)

    def load(self, path):
        with open(path, 'rb') as file:
            variables = pickle.load(file)
            self.__dict__.update(variables)

    def fit(self, profiles, msg, club_user, predicted_ratings):
        # Read file
        self.profiles = profiles
        self.msg = msg
        self.club_user = club_user
        self.predicted_ratings = predicted_ratings

    def choose_k(self, user_id, ratings_results, msg, k=5):
        if self.profiles[self.profiles.user_id == user_id]['gender'].item() == 'female':
            users = 'female_user_id'
            items = 'male_user_id'
            ratings_results_a = ratings_results.T
            ratings_results_a.index = ratings_results_a.index.astype('int')
            all_ratings = ratings_results_a.loc[user_id]
        else:
            users = 'male_user_id'
            items = 'female_user_id'
            all_ratings = ratings_results.loc[user_id]

        if isinstance(all_ratings, pd.DataFrame):
            all_ratings = all_ratings.iloc[0]

        ex_partner = [i for i in msg[msg[users] == user_id][items]]
        for x in ex_partner:
            if str(x) in all_ratings.index:
                all_ratings.drop(index=str(x), inplace=True)
        return all_ratings.sort_values(ascending=False)[:k]


    ## 첫행: 내정보(채팅경험있는 유사회원정보), 아래 행: 추천 상대 정보##
    def recommend_partner(self, user_id, predicted_ratings):
        df = pd.DataFrame()
        df = df.append(self.profiles[self.profiles['user_id'] == user_id])
        for a in self.choose_k(user_id, predicted_ratings, self.msg).index:
            df = df.append(self.profiles[self.profiles['user_id'] == int(a)])
        return df


    ## 코사인 유사도 ##
    def cos_sim(self, A, B):
        return dot(A, B) / (norm(A) * norm(B))


    # 채팅 경험이 없는경우, 나와 유사한 채팅 경험 있는 유저 찾기
    def find_sim_user(self, new_user_id):
        new_user_profile = self.profiles[self.profiles.user_id == new_user_id]

        if self.profiles[self.profiles.user_id == new_user_id].gender.item() == 'male':
            users = 'male_user_id'
        elif self.profiles[self.profiles.user_id == new_user_id].gender.item() == 'female':
            users = 'female_user_id'

        temp = self.profiles.user_id.isin(self.msg[users].unique())
        chat_profiles = self.profiles[temp]
        chat_profiles = chat_profiles.drop(columns=['gender'])

        output = chat_profiles.iloc[:, 1:]
        scaler = MinMaxScaler()
        output = scaler.fit_transform(output) * 2

        output = pd.DataFrame(output, columns=chat_profiles.iloc[:, 1:].columns,
                              index=list(chat_profiles.iloc[:, 1:].index.values))
        output['user_id'] = chat_profiles['user_id']
        output = output[['user_id', 'yob', 'golf_score', 'golf_frequency', 'golf_oversea', 'golf_year']]

        new_user_profile = new_user_profile.drop(columns=['gender'])
        new_user = new_user_profile.iloc[:, 1:]

        new_user = scaler.transform(new_user) * 2

        new_user = pd.DataFrame(new_user, columns=new_user_profile.iloc[:, 1:].columns,
                                index=list(new_user_profile.iloc[:, 1:].index.values))
        new_user['user_id'] = new_user_profile['user_id']
        new_user = new_user[['user_id', 'yob', 'golf_score', 'golf_frequency', 'golf_oversea', 'golf_year']]

        chat_user = pd.merge(output, self.club_user, on='user_id', how='left')
        chat_user = chat_user.fillna(0)

        new_user = pd.merge(new_user, self.club_user, on='user_id', how='left')
        new_user = new_user.fillna(0)

        chat_user_array = chat_user.to_numpy()
        new_user_array = new_user.to_numpy()

        d = {}
        for i in chat_user_array:
            user_id = i[0]
            sim = self.cos_sim(new_user_array[0][1:], i[1:])
            d[user_id] = sim

        sorted_dict = sorted(d.items(), reverse=True, key=lambda x: x[1])

        self.profiles[self.profiles['user_id'] == sorted_dict[0][0]]

        sim_chat_user = self.profiles[self.profiles['user_id'] == sorted_dict[0][0]].user_id.item()
        return sim_chat_user


    ## 최종 함수##
    def final_chat_partner_recommend(self, member_id):
        if member_id in self.msg.male_user_id.unique() or member_id in self.msg.female_user_id.unique():
            result = self.recommend_partner(member_id, self.predicted_ratings)
        else:
            sim_chat_user = self.find_sim_user(member_id)
            result = self.recommend_partner(sim_chat_user, self.predicted_ratings)

        return [result.to_dict('records')]

if __name__ == '__main__':
    # profiles = pd.read_csv('/Users/yong-eunjae/Desktop/1 테스트 데이터/고객데이터/hbmp/hbmp_1/00_hbmp_profiles.csv',
    #                        index_col=0)
    # msg = pd.read_csv('/Users/yong-eunjae/Desktop/1 테스트 데이터/고객데이터/hbmp/hbmp_1/00_hbmp_messages.csv',
    #                   index_col=0)
    # club_user = pd.read_csv('/Users/yong-eunjae/Desktop/1 테스트 데이터/고객데이터/hbmp/hbmp_1/00_hbmp_clubs.csv',
    #                         index_col=0)
    # predicted_ratings = pd.read_csv(
    #     '/Users/yong-eunjae/Desktop/1 테스트 데이터/고객데이터/hbmp/hbmp_1/00_hbmp_pred_ratings.csv', index_col=0)
    #
    model_path = './model.dsm'
    # model = Hbmp()
    # model.fit(profiles, msg, club_user, predicted_ratings)
    # model.save(model_path)

    model = Hbmp(model_path)
    print(model.final_chat_partner_recommend(2))

    # print(Hbmp().final_chat_partner_recommend(2))
