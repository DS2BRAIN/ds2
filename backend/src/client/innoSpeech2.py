from tqdm import tqdm
import Categorical_similarity_measures as csm
import os
import pandas as pd
import numpy as np
import pickle
import warnings

warnings.filterwarnings("ignore")

class InnoSpeechSeeker:
    def __init__(self, path=None):
        self.recruit = None
        self.job_seeker = None
        self.interview = None
        self.age = {
            '20대': 2,
            '30대': 3,
            '40대': 4,
            '50대': 5,
            '60대 이상': 6,
            '무관': 99}
        self.pay = {
            '2400만원 이하': 1,
            '2400 ~ 3000만원': 2,
            '3000 ~ 3500만원': 3,
            '3500 ~ 4000만원': 4,
            '협의': 99,
            '회사 내규를 따름': 99,
            '면접 후 결정': 99, }

        self.edu = {
            '고등학교졸업': 1,
            '대학교졸업(2,3년)': 2,
            '대학교졸업(4년)': 3,
            '대학원석사졸업': 4,
            '대학원박사졸업': 5,
            '무관': 99}

        self.career = {
            '신입 ~ 1년 미만': 1,
            '1년 ~ 5년': 2,
            '5년 ~ 10년': 3,
            '10년 이상': 4,
            '10년 ~ 15년': 4,
            '15년 ~ 20년': 4,
            '20년 이상': 4,
            '무관': 99}

        if path is not None:
            self.load(path)

    def fit(self, job_seeker, recruit, interview):

        recruit['pay_level'] = recruit.com_payment.apply(lambda x: self.pay[x])
        recruit['edu_level'] = recruit.com_edu.apply(lambda x: self.edu[x])
        recruit['career_level'] = recruit.com_career.apply(lambda x: self.career[x])
        recruit['age_level'] = recruit.com_age.apply(lambda x: self.age[x])

        job_seeker['pay_level'] = job_seeker.payment.apply(lambda x: self.pay[x])
        job_seeker['edu_level'] = job_seeker.edu.apply(lambda x: self.edu[x])
        job_seeker['career_level'] = job_seeker.career.apply(lambda x: self.career[x])
        job_seeker['age_level'] = job_seeker.age.apply(lambda x: self.age[x])

        self.recruit = recruit
        self.job_seeker = job_seeker
        self.interview = interview

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


    def find_similar_hr(self, new_recruit, n=5):

        new_job = new_recruit['job']
        new_age = self.age[new_recruit['age']]
        new_loc = new_recruit['location']
        new_pay = self.pay[new_recruit['payment']]
        new_edu = self.edu[new_recruit['edu']]
        new_gen = new_recruit['gender']
        new_car = self.career[new_recruit['career']]

        # 유사 채용 정보 찾기
        sim_recruit_info = self.recruit.copy()

        # 연령대
        if new_age != '무관':
            sim_recruit_info = sim_recruit_info[sim_recruit_info.age_level.isin([new_age-1, new_age, '무관'])]

        # 성별
        if new_gen != '무관':
            sim_recruit_info = sim_recruit_info[sim_recruit_info.com_gender.isin([new_gen, '무관'])]

        # 지역
        sim_recruit_info = sim_recruit_info[sim_recruit_info.com_location == new_loc]

        # 희망연봉
        if new_pay != '협의':
            sim_recruit_info = sim_recruit_info[sim_recruit_info.pay_level >= new_pay]

        # 학력
        if new_edu != '무관':
            sim_recruit_info = sim_recruit_info[sim_recruit_info.edu_level >= new_edu]

        # 경력
        if new_car != '무관':
            sim_recruit_info = sim_recruit_info[sim_recruit_info.career_level >= new_car]

        # 직무
        if new_job in sim_recruit_info.com_job.unique():
            sim_recruit_info = sim_recruit_info[sim_recruit_info.com_job == new_job]

        pass_applicant = pd.DataFrame()
        for idx in sim_recruit_info.index:
            pass_applicant = self.interview[self.interview.recruit_id.isin(sim_recruit_info.recruit_id.unique())][self.interview.result==1]
        if len(pass_applicant) == 0:
            return [{'result': '유사 채용 정보 없음'}]

        pass_applicants = list(pass_applicant.job_seeker_id.unique())

        seeker_interview = pd.merge(self.job_seeker, self.interview, on='job_seeker_id')
        sim_seekers = seeker_interview[seeker_interview['location']==new_loc]
        if new_gen != '무관':
            sim_seekers = sim_seekers[seeker_interview['gender'].isin([new_gen, '무관'])]
        sim_seekers.reset_index(drop = False, inplace=True)

        for pass_applicant in  pass_applicants:
            job_seeker_info = seeker_interview.drop_duplicates()
            job_seeker_info = job_seeker_info[['job_seeker_id', 'seeker_job', 'location',
                                               'gender', 'pay_level', 'edu_level', 'career_level',
                                               'age_level',  'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7',
                                               'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15', 'Q16', 'Q17',
                                               'Q18', 'Q19', 'Q20', 'Q21', 'Q22', 'result']]
            pass_applicant_info = job_seeker_info[job_seeker_info.job_seeker_id==pass_applicant][job_seeker_info.result==1]
            pass_applicant_info = pass_applicant_info.values.tolist()[0][1:-1]

            d = {}
            for row in tqdm(sim_seekers.iterrows(), total=sim_seekers.shape[0]):
                row = row[1] ##from iterrows to a'row'
                key = row['index']
                job_seeker_pool = row.drop(['index', 'job_seeker_id', 'recruit_id', 'age', 'location', 'payment', 'edu', 'career', 'result'])
                distance = csm.Eskin(data=[pass_applicant_info, job_seeker_pool])
                d[key] = distance[0, 1]

            sorted_dict = sorted(d.items(), key=lambda x: x[1])

            most_similar_seeker = pd.DataFrame(columns=sim_seekers.columns)
            k = 0
            while len(most_similar_seeker) < n:
                i = sorted_dict[k][0]
                if sim_seekers[sim_seekers['index']==i].job_seeker_id.item() not in most_similar_seeker.job_seeker_id.unique():
                    most_similar_seeker = most_similar_seeker.append(sim_seekers[sim_seekers['index']==i])
                k+=1

            most_similar_seeker = most_similar_seeker[['job_seeker_id', 'seeker_job', 'age', 'location', 'payment', 'edu', 'gender', 'career']]

        return [most_similar_seeker.to_dict('records')]


if __name__ == '__main__':

    job_seeker = pd.read_csv('./total_job_seeker.csv', index_col=0)
    recruit = pd.read_csv('./total_recruit.csv', index_col=0)
    interview = pd.read_csv('./total_interview.csv', index_col=0)

    model_path = './model.dsm'
    model = InnoSpeechSeeker()
    model.fit(job_seeker, recruit, interview)
    model.save(model_path)



    new_recruits = [{
                    'job': '설치, 장비, 생산직',
                    'age': '20대',
                    'location': '세종',
                    'payment': '2400 ~ 3000만원',
                    'edu': '무관',
                    'gender': '남성',
                    'career': '신입 ~ 1년 미만'},
                    {'job': '설치, 장비, 생산직',
                    'age': '40대',
                    'location': '부산',
                    'payment': '3000 ~ 3500만원',
                    'edu': '고등학교졸업',
                    'gender': '남성',
                    'career': '10년 이상'}]

    model = InnoSpeechSeeker(model_path)
    print(model.find_similar_hr(new_recruits[0], n=5))