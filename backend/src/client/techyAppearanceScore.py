#!/usr/bin/env python
# coding: utf-8

# In[1]:


import os
from datetime import datetime
import calendar
import datetime
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings("ignore")

from surprise import Reader, Dataset
from sklearn.model_selection import train_test_split
from surprise.dataset import DatasetAutoFolds
from surprise import SVD



class TechyAppearanceScore():
    def __init__(self, look_rating_from_male: pd.DataFrame, look_rating_from_female: pd.DataFrame):
        look_rating_from_male['picture_rating'] = look_rating_from_male['picture_rating'].apply(lambda x: int(x))
        look_rating_from_female['picture_rating'] = look_rating_from_female['picture_rating'].apply(lambda x: int(x))
        self.look_rating_from_male = look_rating_from_male
        self.look_rating_from_female = look_rating_from_female
        pass

    def look_score(self, user_id):
        reader = Reader(rating_scale=(0, 5))
        if user_id in self.look_rating_from_male.user_id.unique():
            data = Dataset.load_from_df(self.look_rating_from_male, reader)
            partner_ids = self.look_rating_from_male.partner_id.unique()
            have_meet_partner_ids = self.look_rating_from_male[self.look_rating_from_male==user_id].partner_id.unique()

        elif user_id in self.look_rating_from_female.user_id.unique():
            data = Dataset.load_from_df(self.look_rating_from_female, reader)
            partner_ids = self.look_rating_from_female.partner_id.unique()
            have_meet_partner_ids = self.look_rating_from_female[self.look_rating_from_female==user_id].partner_id.unique()
        else:
            return ('평가 정보 없음')
    
        trainset = DatasetAutoFolds.build_full_trainset(data)
        algo = SVD(n_epochs= 70, lr_all=0.01, random_state=10)
        algo.fit(trainset)
        predictions = [algo.predict(user_id, partner_id) for partner_id in partner_ids]

        def sortkey_est(pred):
            return pred.est

        predictions.sort(key=sortkey_est, reverse=True)

        partner_id = [int(pred.iid) for pred in predictions]
        est_ratings = [pred.est for pred in predictions]

        recommend_partner = pd.DataFrame()
        recommend_partner['user_id'] = [user_id]*len(partner_id)
        recommend_partner['partner_id'] = partner_id
        recommend_partner['pred_rating'] = est_ratings
        idx = recommend_partner[recommend_partner['partner_id'].isin(have_meet_partner_ids)].index
        recommend_partner.reset_index(drop=True, inplace=True)

        return recommend_partner

    def recommend(self):
        predict_from_female = pd.DataFrame()

        for user_id in self.look_rating_from_female.user_id.unique():
            predict_from_female = predict_from_female.append(self.look_score(user_id))
            predict_from_female.reset_index(drop=True, inplace=True)

        recommend_male_to_female = pd.merge(predict_from_female, self.look_rating_from_female, on=['user_id', 'partner_id'],
                                            how='left')
        recommend_male_to_female.columns = ['female_id', 'male_id', 'pred_from_female', 'rating_from_female']

        predict_from_male = pd.DataFrame()

        for user_id in self.look_rating_from_male.user_id.unique():
            predict_from_male = predict_from_male.append(self.look_score(user_id))
            predict_from_male.reset_index(drop=True, inplace=True)

        recommend_female_to_male = pd.merge(predict_from_male, self.look_rating_from_male, on=['user_id', 'partner_id'],
                                            how='left')
        recommend_female_to_male.columns = ['male_id', 'female_id', 'pred_from_male', 'rating_from_male']

        total_table = pd.merge(recommend_female_to_male, recommend_male_to_female, on=['male_id', 'female_id'])
        total_table['total'] = round((total_table['pred_from_male'] + total_table['pred_from_female']) * 10, 2)
        total_table = total_table[
            ['male_id', 'female_id', 'total', 'pred_from_male', 'pred_from_female', 'rating_from_male',
             'rating_from_female']]
        result_df = total_table.sort_values(by=['male_id', 'total'], ascending=[True, False])

        return result_df
#
# look_rating_from_male = pd.read_csv('/Users/yong-eunjae/Desktop/1 테스트 데이터/고객데이터/테키/look_rating_from_male.csv', index_col=0)
# look_rating_from_female = pd.read_csv('/Users/yong-eunjae/Desktop/1 테스트 데이터/고객데이터/테키/look_rating_from_female.csv', index_col=0)

# look_rating_from_male['picture_rating'] = look_rating_from_male['picture_rating'].apply(lambda x : int(x))
# look_rating_from_female['picture_rating'] = look_rating_from_female['picture_rating'].apply(lambda x : int(x))

# total_table.to_csv('look_score_prediction.csv')
# recommend_class = TechyAppearanceScore(look_rating_from_male=look_rating_from_male, look_rating_from_female=look_rating_from_female)
# print(recommend_class.recommend())