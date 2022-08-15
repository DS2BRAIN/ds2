import datetime
import ast
import os
import pickle
import random
import pytz
import urllib

import time
import peewee as pw
from tqdm import tqdm
from models.helper import Helper
from src.errors import exceptions as ex
from playhouse.signals import Model, post_save
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from konlpy.tag import Komoran
from collections import Counter
from src.util import Util

class WideField():

    def __init__(self, path=None):
        self.dbClass = Helper(init=True)
        self.content_info = None
        self.content_category = None
        self.last_deploy_at = None
        self.deploy_version = None
        self.komoran = Komoran()
        self.utilClass = Util()
        self.s3 = self.utilClass.getBotoClient('s3')

        if path is not None:
            self.load(path)

    def save(self, path):
        """ 모델 저장 """
        variables = {}
        for name, value in self.__dict__.items():
            if name in ['komoran', 'utilClass', 's3']:
                continue
            variables[name] = value

        with open(path, 'wb') as file:
            pickle.dump(variables, file)

    def get_user_keyword(self, user_id, keyword_ratio):
        certified_keyword_data = self.dbClass.get_certified_contents_by_user_id(user_id)

        keyword_list = []
        keyword_dict = {}
        for keywords in certified_keyword_data:
            if type(keywords['keyword']) == str:
                keywords['keyword'] = ast.literal_eval(keywords['keyword'])

            for data in keywords['keyword']:
                if data in keyword_list:
                    keyword_dict[data] += 1
                else:
                    keyword_dict[data] = 1
                    keyword_list.append(data)

        sorted_keyword_list = [key for (key, value) in
                               sorted(keyword_dict.items(), key=(lambda item: item[1]), reverse=True)]
        total_len = len(sorted_keyword_list)
        certified_keyword_id_lst = [x['id'] for x in certified_keyword_data]
        print(f"사용한 키워드 : {sorted_keyword_list[0: int(total_len * keyword_ratio)]}")

        return sorted_keyword_list[0: int(total_len * keyword_ratio)], certified_keyword_id_lst

    def get_intersection_content_id_lst(self, certified_keyword_id_lst):
        classification = [x.classification for x in
                          self.dbClass.get_content_category_by_certified_lst(certified_keyword_id_lst)]
        content_id_lst = [int(x.content_id) for x in
                          self.dbClass.get_content_category_by_classifications(classification)]

        return content_id_lst

    def recommendation(self, user_id, keyword_ratio, content_count, similarity):
        user_info = self.dbClass.get_widefield_user(user_id)

        if user_info is None:
            raise ex.NotFoundUserEx()

        temp_index = -1
        gender = user_info.gender
        birth = user_info.birthday
        age = (datetime.datetime.today().year - birth.year + 1) // 10 * 10
        user_statistics = self.dbClass.get_user_statistics_by_user_info(age, gender)

        user_keyword_lst, certified_keyword_id_lst = self.get_user_keyword(user_id, keyword_ratio)

        # 코사인 유사도 활용
        cos_sims_dict = {}

        content_keyword_list = self.dbClass.get_contents() # 콘텐츠 정보

        for content_keyword in tqdm(content_keyword_list):
            if content_keyword['content_keyword'] in ["['']", "[]", None]:
                continue

            sentence = (content_keyword['content_keyword'], str(user_keyword_lst))

            tfidf_vectorizer = TfidfVectorizer()
            tfidf_matrix = tfidf_vectorizer.fit_transform(sentence)

            cos_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])

            if user_statistics.keyword in content_keyword['content_name']:
                cos_sim += 0.05

            if cos_sim > 0:
                cos_sims_dict[cos_sim[0][0]] = content_keyword
            else:
                cos_sims_dict[temp_index] = content_keyword
                temp_index -= 1

        cos_sims_lst = list(reversed(sorted(cos_sims_dict.keys())))  # 유사도 큰 순서대로 정렬
        result = []
        content_id_lst = None

        for accuracy in cos_sims_lst:
            if content_count > len(result):
                if accuracy > similarity:
                    result.append({
                        'content_id': cos_sims_dict[accuracy]['id'],
                        'content_name': cos_sims_dict[accuracy]['content_name'],
                        'similarity': float(round(accuracy, 3))
                    })
                else:
                    if content_id_lst is None:
                        content_id_lst = self.get_intersection_content_id_lst(certified_keyword_id_lst)
                    if cos_sims_dict[accuracy]['id'] in content_id_lst:
                        result.append({
                            'content_id': cos_sims_dict[accuracy]['id'],
                            'content_name': cos_sims_dict[accuracy]['content_name'],
                            'similarity': float(round(accuracy, 3))
                        })
            else:
                break

        return result

    def deploy(self, input_data, user_id): # search - 14248 {"text":"string", "content_count": "integer", "similarity": "float"}
        db_conn = pw.MySQLDatabase("honjokking_v2", host="database-2.cgyvkawbo22i.ap-northeast-2.rds.amazonaws.com",
                                           port=3306, user="data_voucher", passwd="KLczeHWtQGtn7J7p")

        version = input_data['version']
        kst = pytz.timezone('Asia/Seoul')
        kst_deply_at = self.last_deploy_at.astimezone(kst)
        kst_deply_at += datetime.timedelta(hours=9)
        kst_str_deply_at = kst_deply_at.strftime("%Y/%m/%d, %H:%M:%S %Z")
        if self.last_deploy_at is not None and self.last_deploy_at > datetime.datetime.utcnow() - datetime.timedelta(days=1):
            raise ex.FailWideFieldDeployeEx(kst_str_deply_at, self.deploy_version)

        class MySQLModel(Model):
            """A base model that will use our MySQL database"""

            class Meta:
                database = db_conn

        class BoardPost(MySQLModel):
            class Meta:
                db_table = 'board_post'

            id = pw.IntegerField()
            title = pw.TextField()
            content = pw.TextField()

        self.content_info = {}
        self.content_category = {}

        for data in tqdm(BoardPost.select().execute()):
            data_id = str(data.id)
            key_word_data = self.extract_keyword(data.title)
            key_word_data += self.extract_keyword(data.content)
            self.content_info[data_id] = data.title
            self.content_category[data_id] = str(key_word_data)
        self.last_deploy_at = datetime.datetime.utcnow()
        self.deploy_version = version

        timestamp = time.strftime('%y%m%d%H%M%S')
        model_path = f"{self.utilClass.save_path}/user/{user_id}/client_model/model-{timestamp}.dsm"
        os.makedirs(f'{self.utilClass.save_path}/user/{user_id}/client_model/', exist_ok=True)

        self.save(model_path)
        self.s3.upload_file(model_path, self.utilClass.bucket_name,
                            f"opt/user/{user_id}/client_model/model-{timestamp}.dsm")
        url = urllib.parse.quote(
        f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com{self.utilClass.save_path}/user/{user_id}/client_model/model-{timestamp}.dsm').replace(
        'https%3A//', 'https://')

        db_conn.close()

        return url, kst_str_deply_at, self.deploy_version

    def recommendation_to_user(self, content_count=1):
        content_id_list = list(self.content_info.keys())

        if len(content_id_list) < content_count:
            content_count =len(content_id_list)

        sample_list = random.sample(content_id_list, content_count)

        result = []
        for content_id in sample_list:
            result.append( {'id': int(content_id), 'content_name': self.content_info[content_id]})

        return [result]

    def search(self, text, content_count=10, similarity=0.05):
        temp_index = -1

        # 코사인 유사도 활용
        cos_sims_dict = {}
        result = []

        for content_id, content_keyword in tqdm(self.content_category.items()):
            if content_keyword in ["['']", "[]", None]:
                continue

            sentence = (content_keyword, text)

            tfidf_vectorizer = TfidfVectorizer()
            tfidf_matrix = tfidf_vectorizer.fit_transform(sentence)

            cos_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])

            if cos_sim > 0:
                cos_sims_dict[cos_sim[0][0]] = {'id': int(content_id), 'content_name': self.content_info[content_id]}
            else:
                cos_sims_dict[temp_index] = {'id': int(content_id), 'content_name': self.content_info[content_id]}
                temp_index -= 1

            if text in self.content_info[content_id]:
                result.append({'id': int(content_id), 'content_name': self.content_info[content_id]})

            if content_count <= len(result) and content_count != -1:
                break

        cos_sims_lst = list(reversed(sorted(cos_sims_dict.keys())))  # 유사도 큰 순서대로 정렬

        for accuracy in cos_sims_lst:
            if content_count > len(result) or content_count == -1:
                if accuracy > similarity:
                    result.append({
                        'content_id': cos_sims_dict[accuracy]['id'],
                        'content_name': cos_sims_dict[accuracy]['content_name'],
                    })
            else:
                break

        return result

    def extract_keyword(self, text):
        try:
            keywords = self.komoran.nouns(text)
        except:
            keywords = None
        keywords_sorted = []
        for key in Counter(keywords):
            if key == '.kr':
                continue
            keywords_sorted.append(key)
        return keywords_sorted

    def load(self, path):
        """ 모델 불러오기 """
        with open(path, 'rb') as file:
            variables = pickle.load(file)
            self.__dict__.update(variables)

if __name__ == '__main__':
    # WideField().deploy(617)
    import time

    class_name = WideField('model-211222104654.dsm')
    start_time = time.time()
    [class_name.search("간단한") for i in range(0, 10)]

    end_time = time.time()
    print(f'{end_time - start_time} | {(end_time - start_time)/10}')

    start_time = time.time()
    [class_name.recommendation_to_user(5) for i in range(0, 10)]
    end_time = time.time()
    print(f'{end_time - start_time} | {(end_time - start_time)/10}')


    # result = WideField('model.dsm').recommendation_to_user(content_count=10)

    # model = WideField('model.dsm')
    # print(len(model.content_info))
    # print(len(model.content_category))
    # print(model.last_deploy_at)

    # print(extract_keyword(data.content))
