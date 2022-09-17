import urllib

import joblib
import os
import pandas as pd
import shutil
import numpy as np
from fastai.data.transforms import Normalize
from fastai.tabular.core import cont_cat_split, Categorify, FillMissing

from models.helper import Helper
from src.util import Util
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split
from abc import *
from sklearn.ensemble import IsolationForest

def _train_wrapper(original_function):
    def wrapper_function(self, *args):
        # 모델 생성
        self.model = original_function(self, *args)

        # 모델 학습
        self.model.fit(self.x_train, self.y_train)

        return self.model
    return wrapper_function

class SettingData():
    def __init__(self):
        pass

    def set_train_data(self, df: pd.DataFrame, target_column_name: str, project_id: int, is_fastai: bool=False,
                       is_scikit_learn_model=False):
        dataconnector_file_name = {}  # 데이터 커넥터별 파일명을 저장하는 딕트
        db_class = Helper()

        project_dict = db_class.getOneProjectById(project_id)
        # 학습에 사용된 데이터의 모든 컬럼 아이디 저장
        column_ids = list(project_dict['trainingColumnInfo'].keys()) + [str(project_dict['valueForPredictColumnId'])]

        for column in db_class.get_datacolumns_by_column_id(column_ids):

            # 해당 컬럼의 데이터 커넥터의 파일명을 모른다면 조회 후 저장하는 과정
            if dataconnector_file_name.get(column['dataconnector'], False) is False:
                connector_raw = db_class.getOneDataconnectorById(column['dataconnector'])
                dataconnector_file_name[connector_raw.id] = connector_raw.originalFileName

            # "컬럼명__파일명" 을 저장
            column_name = f"{column['columnName']}__{dataconnector_file_name[column['dataconnector']]}"

            # 학습 컬럼 사용여부가 False 이면서 예측 컬럼 아닌 것
            if project_dict['trainingColumnInfo'].get(str(column['id']), False) is False and project_dict[
                'valueForPredictColumnId'] != column['id']:
                del df[column_name]
                continue
            if is_fastai:
                cat_names = list(df.select_dtypes(include='object').columns.values)
                for name in cat_names:
                    df[name] = df[name].astype('category')

                len_df = len(df)
                p = 0.9
                len_idx_tain = round(len_df * p)
                # len_idx_val = len_df - len_idx_tain

                self.procs_nn = [Categorify, FillMissing, Normalize]
                self.y_names = target_column_name
                self.cont_nn, self.cat_nn = cont_cat_split(df, dep_var=self.y_names)
                idx_arr = range(0, len_df)
                train_idx = np.random.choice(range(0, len_df), len_idx_tain, replace=False)
                val_idx = [i for i in idx_arr if i not in train_idx]
                val_idx = np.asarray(val_idx)
                self.splits = (list(train_idx), list(val_idx))
            else:
                # object 이면서 one hot 인코딩 진행 시
                # from tensorflow.keras.utils import to_categorical
                if column['type'] == 'object':
                    if df[column_name].dtype == object:
                        mapping = {}
                        for x in range(len(column['uniqueValues'])):
                            mapping[column['uniqueValues'][x]] = x

                        # integer representation
                        one_hot_data = list(df[column_name])
                        # for x in range(len(one_hot_data)):
                        #     one_hot_data[x] = mapping[one_hot_data[x]]
                        for i, x in enumerate(one_hot_data):
                            one_hot_data[i] = mapping[x]
                        df[column_name] = one_hot_data

        if is_fastai is False:
            y_label = df[target_column_name]
            df = df.drop(target_column_name, axis=1)
            self.x_train, self.x_test, self.y_train, self.y_test = train_test_split(df, y_label, test_size=0.2,
                                                                                    random_state=156)
        self.df = df
        self.column_names = df.columns.values.tolist()


class MachineLearning(metaclass=ABCMeta):

    def __init__(self):
        self.x_train = None
        self.y_train = None
        self.x_test = None
        self.y_test = None
        self.model = None
        self.util_class = Util()
        self.db_class = Helper()
        self.s3 = self.util_class.getBotoClient('s3')

    def load(self, s3_path: str):
        file_name = s3_path.split('/')[-1]
        file_path = f'{self.util_class.save_path}/{file_name}'
        self.s3.download_file(self.util_class.bucket_name, s3_path, file_path)
        self.model = joblib.load(open(file_path, 'rb'))

    def predict(self, predict_data: pd.DataFrame):
        pred_probs = self.model.predict(predict_data)

        return pred_probs

    def predict_for_deep_learning(self, predict_data: dict):
        pred_probs = self.model.predict(np.array(predict_data))

        return pred_probs

    def get_test_pred(self):
        predict = self.model.predict(self.x_test)
        result = np.array([x for x in predict]) if type(predict) == type(np.array([])) else pd.Series(predict)
        return result, self.y_test

    def create_importance(self):
        from sklearn.metrics import r2_score
        from sklearn.metrics import make_scorer
        scorer = None
        if type(self.model) == IsolationForest:
            scorer = make_scorer(r2_score)
        result = permutation_importance(self.model, self.x_train, self.y_train, n_repeats=10, random_state=0, scoring=scorer)
        model = {
            "cols": self.column_names,
            "imp": result.importances.tolist()
        }

        return str(model)

    def save(self, s3_path):
        print("save()")
        print("s3_path")
        print(s3_path)
        dir_path = ''
        for path_item in s3_path.split('/')[:-1]:
            dir_path += f'{path_item}/'

        local_dir = f'{self.util_class.save_path}/{dir_path}'
        os.makedirs(local_dir, exist_ok=True)

        local_file = f'{self.util_class.save_path}/{s3_path}'
        joblib.dump(self.model, open(local_file, "wb"), compress=3)
        self.s3.upload_file(local_file, self.util_class.bucket_name, f'{s3_path}')

        if self.util_class.configOption != "enterprise":
            if os.path.exists(local_dir):
                shutil.rmtree(local_dir)

        return s3_path
        # return urllib.parse.quote(
        #     f'https://{self.util_class.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3_path}').replace(
        #     'https%3A//', 'https://')

    @abstractmethod
    def train(self, df: pd.DataFrame, target_column_name: str, train_params: dict):
        pass

    def code_generation(self, project):
        pass
