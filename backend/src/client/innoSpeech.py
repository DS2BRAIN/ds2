import pickle
import warnings
from typing import Dict, Iterable

import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error
from tqdm import tqdm

warnings.filterwarnings("ignore")

import Categorical_similarity_measures as csm


class InnoSpeech:
    def __init__(self, path=None, device='cpu', *args, **kwargs):
        self.company = None
        self.job_seeker = None
        self.recruit = None
        self.interview = None
        self.prob_result = None

        if path is not None:
            self.load(path)

    def forward(self, inputs):
        """ 모델 결과 반환 """
        # 유사도 추출
        # 결과 반환

        pass

    def fit(self, company_data, job_seeker_data, recruit_data, interview_data):
        """ 학습 """
        # Read file
        self.company = company_data
        self.job_seeker = job_seeker_data
        self.recruit = recruit_data
        self.interview = interview_data

        # Filter (in_progress)
        self.recruit = self.recruit[self.recruit['in_progress'] == 1]
        recruit_ids = [i for i in self.recruit.recruit_id]
        self.interview = self.interview[self.interview.recruit_id.isin(recruit_ids)]

        interviewd_seeker = np.unique(self.interview['job_seeker_id'])  # 면접경험 있는 구직자 id
        interviewd_recruit = np.unique(self.interview['recruit_id'])  # 면접경험 있는 채용정보 id

        rating_matrix = []
        n_interviewd_recruit = len(interviewd_recruit)
        for job_seeker_id in tqdm(interviewd_seeker):
            new_row = np.empty(n_interviewd_recruit)
            new_row[:] = np.nan
            ex_job_seeker = self.interview[self.interview['job_seeker_id'] == job_seeker_id]
            ex_recruit = ex_job_seeker['recruit_id']
            recruit_result = ex_job_seeker['result']

            for i, a in enumerate(ex_recruit):
                recruit_idx = np.where(interviewd_recruit == a)[0][0]
                new_row[recruit_idx] = recruit_result.iloc[i]

            rating_matrix.append(new_row)

        pseudo_ratings = pd.DataFrame(rating_matrix, index=interviewd_seeker, columns=interviewd_recruit)
        P, Q = self._matrix_factorization(pseudo_ratings.to_numpy(), K=4, steps=500, learning_rate=0.01)
        pred_matrix = np.dot(P, Q.T)
        self.prob_result = pd.DataFrame(data=pred_matrix, index=interviewd_seeker, columns=interviewd_recruit)

    def inference(self, inputs: Iterable[Dict], k=5):
        """ 예측 """
        """
            [
                {'seeker_id': 'sdfhjksdafhksa.', 'seeker_job': '영업,판매,운전,운송', 'age': '30대', 'location': '강서구', 'payment': '2400 ~ 3000만원', 'edu': '고등학교졸업', 'gender': '여성', 'career': '신입 ~ 1년 미만'},
                {'seeker_id': 'sd11fhjksdafhksa.', 'seeker_job': '영업,판매,운전,운송', 'age': '30대', 'location': '강서구', 'payment': '2400 ~ 3000만원', 'edu': '고등학교졸업', 'gender': '여성', 'career': '신입 ~ 1년 미만'},
                {'seeker_id': 'sdfhjks22dafhksa.', 'seeker_job': '영업,판매,운전,운송', 'age': '30대', 'location': '강서구', 'payment': '2400 ~ 3000만원', 'edu': '고등학교졸업', 'gender': '여성', 'career': '신입 ~ 1년 미만'},
                ...
            ]
        """

        outputs = []
        for data in inputs:
            seeker_id = data['seeker_id']
            if seeker_id in [b for a, b in enumerate(self.interview.job_seeker_id)]:
                recommend_score = self._choose_k(seeker_id, self.prob_result, k)
                job_seeker_history_df = self.interview[self.interview['job_seeker_id'] == seeker_id]
                for i in recommend_score.index:
                    if i in [recruit_id for recruit_id in job_seeker_history_df['recruit_id']]:
                        idx = job_seeker_history_df[job_seeker_history_df['recruit_id'] == i].index[0]
                        if job_seeker_history_df.loc[idx]['result'] == 1:
                            recommend_score.drop(i, inplace=True)
            else:
                similar_seeker_info = self._find_similar_user(data)
                similar_seekers = [i for i in similar_seeker_info.job_seeker_id]
                series = pd.Series()
                for similar_seeker_id in similar_seekers:
                    series = series.append(self._choose_k(similar_seeker_id, self.prob_result))

                recommend_score = series.sort_values(ascending=False)
                recommend_score = recommend_score[~recommend_score.index.duplicated(keep='last')][:k]

            top_recuit_id = pd.DataFrame({'recruit_id': [i for i in recommend_score.index],
                                          'score': [i for i in recommend_score]})
            recommend_recruit = pd.merge(self.recruit, top_recuit_id, how='right', on='recruit_id')

            result = pd.merge(self.company, recommend_recruit, on='company_id')
            result = result.sort_values(by='score', ascending=False)
            outputs.append(result.to_dict('records'))

        return outputs

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

    def _calculate_rmse(self, R, P, Q, non_zeros):
        full_pred_matrix = np.dot(P, Q.T)

        # 여기서 non_zeros는 아래 함수에서 확인할 수 있다.
        x_non_zero_ind = [non_zero[0] for non_zero in non_zeros]
        y_non_zero_ind = [non_zero[1] for non_zero in non_zeros]

        # 원 행렬 R에서 0이 아닌 값들만 추출한다.
        R_non_zeros = R[x_non_zero_ind, y_non_zero_ind]

        # 예측 행렬에서 원 행렬 R에서 0이 아닌 위치의 값들만 추출하여 저장한다.
        full_pred_matrix_non_zeros = full_pred_matrix[x_non_zero_ind, y_non_zero_ind]

        mse = mean_squared_error(R_non_zeros, full_pred_matrix_non_zeros)
        rmse = np.sqrt(mse)

        return rmse

    def _matrix_factorization(self, R, K, steps=200, learning_rate=0.01, r_lambda=0.01):
        num_users, num_items = R.shape

        np.random.seed(1)
        P = np.random.normal(scale=1.0 / K, size=(num_users, K))
        Q = np.random.normal(scale=1.0 / K, size=(num_items, K))

        # R>0인 행 위치, 열 위치, 값을 non_zeros 리스트에 저장한다.
        non_zeros = [(i, j, R[i, j]) for i in range(num_users) for j in range(num_items) if R[i, j] > 0]

        # SGD 기법으로 P, Q 매트릭스를 업데이트 함
        for step in range(steps):
            for i, j, r in non_zeros:
                # 잔차 구함
                eij = r - np.dot(P[i, :], Q[j, :].T)

                # Regulation을 반영한 SGD 업데이터 적용
                P[i, :] = P[i, :] + learning_rate * (eij * Q[j, :] - r_lambda * P[i, :])
                Q[j, :] = Q[j, :] + learning_rate * (eij * P[i, :] - r_lambda * Q[j, :])

        return P, Q

    def _choose_k(self, job_seeker_id, recruit_results, k=5):
        # job_seeker_history_df = self.interview[self.interview['job_seeker_id'] == job_seeker_id]
        all_results = recruit_results.loc[job_seeker_id]
        if isinstance(all_results, pd.DataFrame):
            all_results = all_results.iloc[0]
        all_results = all_results[all_results > 0]
        # for i in all_results.index:
        #     if i in [recruit_id for recruit_id in job_seeker_history_df['recruit_id']]:
        #         idx = job_seeker_history_df[job_seeker_history_df['recruit_id'] == i].index[0]
        #         if seeker_id == job_seeker_id and job_seeker_history_df.loc[idx]['result'] == 1:
        #             all_results.drop(i, inplace=True)

        return all_results.sort_values(ascending=False)[:k]

    def _find_similar_user(self, new_seeker):

        new_seeker_info = [i for i in new_seeker.values()][1:]
        interviewed_seeker_ids = self.interview['job_seeker_id'].unique()
        interviewed_seekers_info = self.job_seeker[self.job_seeker['job_seeker_id'].isin(interviewed_seeker_ids)].iloc[
                                   :, :]

        d = {}
        for row in tqdm(interviewed_seekers_info.iterrows(), total=interviewed_seekers_info.shape[0]):
            row = row[1]  ##from iterrows to a'row'
            key = row['job_seeker_id']
            interviewed_seekers_info_2 = row.drop('job_seeker_id')
            distance = csm.Eskin(data=[new_seeker_info, interviewed_seekers_info_2])
            d[key] = distance[0, 1]

        sorted_dict = sorted(d.items(), key=lambda x: x[1])
        most_similar_seeker = pd.DataFrame()
        for i in [i[0] for i in sorted_dict[:3]]:
            most_similar_seeker = most_similar_seeker.append(self.job_seeker[self.job_seeker['job_seeker_id'] == i])

        return most_similar_seeker


if __name__ == '__main__':
    pass
    p_company = pd.read_csv('../company_list.csv')
    p_job_seeker = pd.read_csv('../job_seeker_list.csv')
    p_recruit = pd.read_csv('../recruit_list.csv')
    p_interview = pd.read_csv('../interview_list.csv')

    model_path = './model.dsm'

    # 학습
    # model = InnoSpeech()
    # model.fit(p_company, p_job_seeker, p_recruit, p_interview)
    # model.save(model_path)

    # 예측
    data_list = [
        # seeker_job | age | location | payment | edu | gender | career
        {'seeker_id': '1093667708', 'seeker_job': '설치,정비,생산,전자,정보통신', 'age': '40대', 'location': '강남구',
         'payment': '2400 ~ 3000만원', 'edu': '대학교졸업(4년)', 'gender': '여성', 'career': '신입 ~ 1년 미만'},
    ]

    model = InnoSpeech(model_path)
    outputs = model.inference(data_list)

    for index, output in enumerate(outputs):
        print(f'Person_{index}')
        for recommend_job in output:
            print(recommend_job)