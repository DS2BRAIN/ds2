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
from surprise.dataset import DatasetAutoFolds
from surprise import NMF


# profiles = pd.read_csv('profiles_01.csv', index_col=0)
# meeting = pd.read_csv('meeting_01.csv', index_col=0)

class TechyMeetingScore():
    def __init__(self, profiles, meeting):

        no_id_idx = meeting[(~meeting.male_id.isin(profiles.user_id.unique())) | (
            ~meeting.female_id.isin(profiles.user_id.unique()))].index
        meeting.drop(no_id_idx, axis=0, inplace=True)
        meeting.reset_index(drop=True, inplace=True)

        self.profiles = profiles
        self.meeting = meeting
        self.meet_male_ids = meeting.male_id.unique()
        self.meet_female_ids = meeting.female_id.unique()

    def meet_score(self, user_id):
        reader = Reader(rating_scale=(1, 5))
        if user_id in self.meet_male_ids:
            data = Dataset.load_from_df(self.meeting[['male_id', 'female_id', 'rating_by_male']], reader)
            partner_ids = self.meet_female_ids
            have_meet_partner_ids = self.meeting[self.meeting.male_id==user_id].female_id.unique()

        elif user_id in self.meet_female_ids:
            data = Dataset.load_from_df(self.meeting[['female_id', 'male_id', 'rating_by_female']], reader)
            partner_ids = self.meet_male_ids
            have_meet_partner_ids = self.meeting[self.meeting.female_id==user_id].male_id.unique()


        else:
            return ('만남 정보 없음')

        trainset = DatasetAutoFolds.build_full_trainset(data)
        algo = NMF(random_state=10)

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
        recommend_partner['rating'] = est_ratings
        idx = recommend_partner[recommend_partner['partner_id'].isin(have_meet_partner_ids)].index
        recommend_partner.reset_index(drop=True, inplace=True)

        return recommend_partner

    def recommend(self):
        meet_score_from_female = pd.DataFrame()

        for user_id in self.meet_female_ids:
            meet_score_from_female = meet_score_from_female.append(self.meet_score(user_id))
            meet_score_from_female.reset_index(drop=True, inplace=True)


        recommend_male_to_female = pd.merge(meet_score_from_female, self.meeting, left_on=['user_id', 'partner_id'], right_on=['female_id', 'male_id'], how='left')
        recommend_male_to_female = recommend_male_to_female[['user_id', 'partner_id', 'rating', 'rating_by_female']]
        recommend_male_to_female.rename(columns={'rating_by_female':'ex_meet'}, inplace = True)
        recommend_male_to_female.columns = ['female_id', 'male_id', 'pred_from_female', 'rating_from_female']


        meet_score_from_male = pd.DataFrame()

        for user_id in self.meet_male_ids:
            meet_score_from_male = meet_score_from_male.append(self.meet_score(user_id))
            meet_score_from_male.reset_index(drop=True, inplace=True)

        recommend_female_to_male = pd.merge(meet_score_from_male, self.meeting, left_on=['user_id', 'partner_id'], right_on=['male_id', 'female_id',], how='left')
        recommend_female_to_male = recommend_female_to_male[['user_id', 'partner_id', 'rating', 'rating_by_male']]
        recommend_female_to_male.rename(columns={'rating_by_male':'ex_meet'}, inplace = True)
        recommend_female_to_male.columns = ['male_id', 'female_id', 'pred_from_male', 'rating_from_male']

        total_table = pd.merge(recommend_female_to_male, recommend_male_to_female, on=['male_id', 'female_id'])
        total_table['total'] = round((total_table['pred_from_male'] + total_table['pred_from_female'])*10, 2)
        total_table = total_table[['male_id', 'female_id', 'total', 'pred_from_male', 'pred_from_female', 'rating_from_male', 'rating_from_female']]
        result_df = total_table.sort_values(by=['male_id', 'total'], ascending=[True, False])

        return result_df

if __name__ == '__main__':
    profiles = pd.read_csv('/Users/yong-eunjae/Desktop/1 테스트 데이터/고객데이터/테키/profiles_01.csv', index_col=0)
    meeting = pd.read_csv('/Users/yong-eunjae/Desktop/1 테스트 데이터/고객데이터/테키/meeting_01.csv', index_col=0)
    print(TechyMeetingScore(profiles, meeting).recommend())