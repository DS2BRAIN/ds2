import ast
import time

import pandas as pd
import torch
import numpy as np
from fastai.learner import load_learner
from sklearn.naive_bayes import GaussianNB
from starlette.responses import FileResponse

from internal.base_class import ManageBaseClass
from src.errors import exceptions as ex
from starlette.status import HTTP_200_OK
# from tensorflow.keras.preprocessing.text import Tokenizer
from machine_learning.xg_boost import XGBoostClf, XGBoostReg
from machine_learning.random_forest import RandomForestClf, RandomForestReg
from machine_learning.gradient_boosting import GradientBoostingClf, GradientBoostingReg
from machine_learning.isolation_forest import IsolationForestClf
from machine_learning.generalized_linear_modeling import SGDClf, SGDReg
from machine_learning.nave_bayes import NaveBayesClf
from machine_learning.torch_ann import TorchAnn
from machine_learning.keras_ann import KerasAnn
from machine_learning.fastai_ann import FastAnn
import json
import os
if os.path.exists('./src/training/predict.py'):
    from src.training import predict
    predictClass = predict.Predict(isLoadModel=True)
else:
    predictClass = None

class ManageMachineLearning(ManageBaseClass):
    def __init__(self):
        super().__init__()

    def predict(self, user_id, predict_object):

        project_raw = self.db_class.getProjectByModelId(predict_object.modelid, has_object=False)
        model_raw = self.db_class.getOneModelById(predict_object.modelid)
        training_method = project_raw.get('option')

        project_dict = self.db_class.getOneProjectById(model_raw['project'])
        column_ids = list(project_dict['trainingColumnInfo'].keys())
        dataconnector_file_name = {}
        predict_value = []
        predict_column = self.db_class.getOneDatacolumnById(project_dict['valueForPredictColumnId'])

        if training_method is None:
            raise ex.NotAllowedTokenEx()
        elif training_method != 'custom':
            code, result = predictClass.run(predict_object.modelid, predict_object.parameter, predict_object.apptoken,
                                            user_id, inputLoadedModel=predict_object.inputLoadedModel,
                                            modeltoken=predict_object.modeltoken)
        else:
            model_class_info = {
                'xgboost_reg': XGBoostReg,
                'xgboost_clf': XGBoostClf,
                'random_forest_reg': RandomForestReg,
                'random_forest_clf': RandomForestClf,
                'gaussian_nb_clf': NaveBayesClf,
                'isolation_forest_clf': IsolationForestClf,
                'gradient_boosting_clf': GradientBoostingClf,
                'gradient_boosting_reg': GradientBoostingReg,
                'sgd_clf': SGDClf,
                'sgd_reg': SGDReg,
                'keras_ann': KerasAnn,
                'torch_ann': TorchAnn,
                'fastai_ann': FastAnn
            }
            algorithm = project_raw.get('algorithm')
            model_class = model_class_info.get(algorithm, None)
            if model_class is None:
                predict_coulmn_raw = self.db_class.getOneDatacolumnById(project_raw.get("valueForPredictColumnId"))
                if int(predict_coulmn_raw.unique) > 25 and "number" in predict_coulmn_raw.type:
                    algorithm += f'_reg'
                else:
                    algorithm += f'_clf'

                model_class = model_class_info.get(algorithm, None)
            print("algorithm")
            print(algorithm)

            for column in self.db_class.get_datacolumns_by_column_id(column_ids):
                if dataconnector_file_name.get(column['dataconnector'], False) is False:
                    connector_raw = self.db_class.getOneDataconnectorById(column['dataconnector'])
                    dataconnector_file_name[connector_raw.id] = connector_raw.originalFileName

                column_name = f"{column['columnName']}__{dataconnector_file_name[column['dataconnector']]}"

                if project_dict['trainingColumnInfo'].get(str(column['id']),
                                                          False) is False and predict_object.parameter.get(column_name):
                    raise ex.NotUsedColumnEx(column_name)

                if predict_object.parameter.get(column_name) is None:
                    continue

                if column['type'] == 'object':

                    mapping = {}
                    for x in range(len(column['uniqueValues'])):
                        mapping[column['uniqueValues'][x]] = x

                    predict_value.append(mapping.get(predict_object.parameter.get(column_name), 0))
                else:
                    predict_value.append(predict_object.parameter[column_name])

            file_path = f"{self.util_class.save_path}/{model_raw['filePath'].split('amazonaws.com/')[-1]}" \
                if 'amazonaws.com/' in model_raw['filePath'] else model_raw['filePath']

            if model_class is None:
                raise ex.NotAllowedAlgorithmEx(project_raw.get('algorithm'))
            elif model_class == KerasAnn:
                model_class = model_class()

                model_class.load(file_path)

                try:
                    answer = model_class.predict_for_deep_learning([predict_value])[0][0].item()
                    if predict_column.type == 'object':
                        answer = predict_column.uniqueValues[int(answer)]

                    result = {'result': answer}
                except:
                    raise ex.FailedPredictEx
            elif model_class == TorchAnn:
                hyper_param = self.db_class.get_train_param_by_id(model_raw['hyper_param_id'])
                model_class = model_class(len(predict_object.parameter.keys()), model_raw['layerWidth'])
                model_class.load(hyper_param)
                model_class.load_state_dict(torch.load(file_path))
                model_class.eval()
                answer = model_class(torch.FloatTensor(predict_value)).item()
                if predict_column.type == 'object':
                    answer = predict_column.uniqueValues[int(answer)]

                result = {'result': answer}
            elif model_class == FastAnn:
                model_class = FastAnn()
                model_class.model = load_learner(file_path)
                predict_value = pd.DataFrame([predict_object.parameter])
                try:
                    result = {'result': model_class.predict(predict_value, project_raw["id"])[0].item()}
                except:
                    raise ex.FailedPredictEx()
            else:
                model_class = model_class()
                model_class.load(file_path)

                try:
                    answer = model_class.predict(pd.DataFrame([predict_value])).item()
                    if predict_column.type == 'object':
                        answer = predict_column.uniqueValues[answer]

                    result = {'result': answer}
                except:
                    raise ex.FailedPredictEx()
            code = HTTP_200_OK

        return code, result

    def custom_model_predict_all(self, model_id, project_raw, df, return_type=None):

        model_raw = self.db_class.getOneModelById(model_id)
        value_for_predict = project_raw.get('valueForPredict', 'predict')
        model_class_info = {
            'xgboost_reg': XGBoostReg,
            'xgboost_clf': XGBoostClf,
            'random_forest_reg': RandomForestReg,
            'random_forest_clf': RandomForestClf,
            'gaussian_nb_clf': GaussianNB,
            'isolation_forest': IsolationForestClf,
            'gradient_boosting_clf': GradientBoostingClf,
            'gradient_boosting_reg': GradientBoostingReg,
            'sgd_clf': SGDClf,
            'sgd_reg': SGDReg,
            'keras_ann': KerasAnn,
            'torch_ann': TorchAnn,
            'fastai_ann': FastAnn
        }
        algorithm = project_raw.get('algorithm')
        model_class = model_class_info.get(algorithm, None)

        if model_class is None:
            predict_coulmn_raw = self.db_class.getOneDatacolumnById(project_raw.get("valueForPredictColumnId"))
            if int(predict_coulmn_raw.unique) > 25 and "number" in predict_coulmn_raw.type:
                algorithm += f'_reg'
            else:
                algorithm += f'_clf'

            model_class = model_class_info.get(algorithm, None)

        project_dict = self.db_class.getOneProjectById(model_raw['project'])
        column_ids = list(project_dict['trainingColumnInfo'].keys())
        dataconnector_file_name = {}
        predict_column = self.db_class.getOneDatacolumnById(project_dict['valueForPredictColumnId'])

        for column in self.db_class.get_datacolumns_by_column_id(column_ids):
            if dataconnector_file_name.get(column['dataconnector'], False) is False:
                connector_raw = self.db_class.getOneDataconnectorById(column['dataconnector'])
                dataconnector_file_name[connector_raw.id] = connector_raw.originalFileName

            column_name = f"{column['columnName']}__{dataconnector_file_name[column['dataconnector']]}"

            if project_dict['trainingColumnInfo'].get(str(column['id']),
                                                      False) is False and column_name in list(df.columns):
                raise ex.NotUsedColumnEx(column_name)

            if column_name not in list(df.columns):
                continue

            # if column['type'] == 'object':
            #     tokenizer = Tokenizer()
            #     tokenizer.fit_on_texts(column['uniqueValues'])
            #     token_list = tokenizer.texts_to_sequences(df[column_name])
            #     if model_class in [KerasAnn, TorchAnn]:
            #         encoded_list = [temp[0] for temp in token_list]
            #     else:
            #         encoded_list = [temp[0] - 1 for temp in token_list]
            #     df[column_name] = encoded_list

        print("self.util_class.save_path")
        print(self.util_class.save_path)
        print("model_raw['filePath']")
        print(model_raw['filePath'])

        if 'amazonaws.com/' in model_raw['filePath']:
            if self.util_class.save_path in model_raw['filePath']:
                file_path = f"{model_raw['filePath'].split('amazonaws.com/')[-1]}"
            else:
                file_path = f"{self.util_class.save_path}/{model_raw['filePath'].split('amazonaws.com/')[-1]}"
        else:
            file_path = model_raw['filePath']

        if model_class is None:
            raise ex.NotAllowedAlgorithmEx(project_raw.get('algorithm'))
        elif model_class == KerasAnn:
            model_class = model_class()
            model_class.load(file_path)

            try:
                if predict_column.type == 'object':
                    result = [predict_column.uniqueValues[int(temp[0]) - 1] for temp in
                              model_class.predict_for_deep_learning(torch.FloatTensor(df.values)).tolist()]
                else:
                    result = [temp[0] for temp in
                              model_class.predict_for_deep_learning(torch.FloatTensor(df.values)).tolist()]

                df[value_for_predict] = result

                result = {'result': result}
            except:
                raise ex.FailedPredictEx
        elif model_class == FastAnn:
            model_class = FastAnn()
            model_class.model = load_learner(file_path)
            try:
                result = model_class.predict(df, project_raw["id"])
            except:
                raise ex.FailedPredictEx()
            df[value_for_predict] = result
            result = {'result': result}
        elif model_class == TorchAnn:
            hyper_param = self.db_class.get_train_param_by_id(model_raw['hyper_param_id'])
            model_class = model_class(len(df.columns), model_raw['layerWidth'])
            model_class.load(hyper_param)
            model_class.load_state_dict(torch.load(file_path))
            model_class.eval()

            if predict_column.type == 'object':
                result = [predict_column.uniqueValues[int(temp[0]) - 1] for temp in
                          model_class(torch.FloatTensor(df.values)).data.tolist()]
            else:
                result = [temp[0] for temp in model_class(torch.FloatTensor(df.values)).data.tolist()]
            df[value_for_predict] = result

            result = {'result': result}
        else:
            model_class = model_class()
            model_class.load(file_path)

            try:
                result = model_class.predict(df)
                if np.ndarray == type(result):
                    result = result.tolist()

                if predict_column.type == 'object':
                    result = [predict_column.uniqueValues[temp] for temp in result]

                df[value_for_predict] = result
                result = {'result': result}
            except:
                raise ex.FailedPredictEx()
        code = HTTP_200_OK
        df['predict_for_meta'] = df[value_for_predict]
        if return_type == "file":

            predictedFilePath = f'temp/{model_id}_{project_raw["id"]}_{str(round(time.time() * 1000))}.csv'
            df.to_csv(predictedFilePath, sep=',', encoding='utf-8-sig')
            result = FileResponse(predictedFilePath)

        return code, result, df

    def predict_all(self, app_token, user_id, file, file_name, model_id, model_token, return_type=None):

        project_raw = self.db_class.getProjectByModelId(model_id, has_object=False)
        training_method = project_raw.get('option')

        if training_method is None:
            raise ex.NotAllowedTokenEx()
        elif training_method != 'custom':
            return predictClass.runAll(model_id, file, file_name, app_token, user_id, isForText=True,
                                                            modeltoken=model_token)
        else:
            from io import StringIO
            s = str(file, 'utf-8')
            data = StringIO(s)
            df = pd.read_csv(data)
            code, result, _ = self.custom_model_predict_all(model_id, project_raw, df, return_type=return_type)
            return code, result

    def get_df_with_predict(self, model_id):

        project_raw = self.db_class.getProjectByModelId(model_id, has_object=False)
        predict_value = project_raw.get('valueForPredict')
        split_value = predict_value.split('__')
        predict_column = split_value[0]
        original_file_name = split_value[1]
        model_raw = self.db_class.getOneModelById(model_id)
        training_method = project_raw.get('option')
        # 학습에 사용한 cols
        column_ids = []
        for k, v in project_raw['trainingColumnInfo'].items():
            if v:
                column_ids.append(k)
        # column_ids = list(project_raw['trainingColumnInfo'].keys())
        project_cols = [column['columnName'] for column in self.db_class.get_datacolumns_by_column_id(column_ids)]
        datas = self.db_class.get_ds2data_by_dataconnector(project_raw.get('dataconnectorsList'), with_label=True)
        # 원본 df
        df = pd.DataFrame(datas)
        # 예측에 사용할 df(수정)
        predict_df = df.copy()[project_cols]
        predict_df.columns = [f'{col}__{original_file_name}' for col in predict_df.columns]
        feature_importance = model_raw.get('featureImportance')
        if feature_importance:
            feature_importance = feature_importance.replace("'", '"')
            feature_dict = json.loads(feature_importance)
            importance_df = pd.DataFrame(feature_dict).sort_values("imp", ascending=False).iloc[:5]
            meta_cols = [col.split('__')[0] for col in list(importance_df["cols"])]
        else:
            meta_cols = list(predict_df.columns)
        # metabase에 표시할 cols
        cols = list(set(project_cols) & set(meta_cols))
        cols.append(predict_column)
        meta_df = df[cols].copy()
        if training_method is None:
            raise ex.NotAllowedTokenEx()
        elif training_method != 'custom':
            try:
                _, result_df = self.predictClass.runRows(modelId=model_id, df=predict_df)
                meta_df[f'{predict_column}(예측 결과)'] = result_df['__result__']
            except:
                raise ex.FailedPredictEx()
        else:
            model_class_info = {
                'xgboost_reg': XGBoostReg,
                'xgboost_clf': XGBoostClf,
                'random_forest_reg': RandomForestReg,
                'random_forest_clf': RandomForestClf,
                'gaussian_nb_clf': NaveBayesClf,
                'isolation_forest': IsolationForestClf,
                'gradient_boosting_clf': GradientBoostingClf,
                'gradient_boosting_reg': GradientBoostingReg,
                'sgd_clf': SGDClf,
                'sgd_reg': SGDReg,
                'keras_ann': KerasAnn,
                'torch_ann': TorchAnn,
                'fastai_ann': FastAnn
            }
            model_class = model_class_info.get(project_raw.get('algorithm'))

            if model_class is None:
                raise ex.NotAllowedAlgorithmEx(project_raw.get('algorithm'))
            else:
                try:
                    _, _, output_df = self.custom_model_predict_all(model_id, project_raw, predict_df)
                    meta_df[f'{predict_column}(예측 결과)'] = output_df['predict_for_meta']
                except:
                    raise ex.FailedPredictEx()
        return meta_df

if __name__ == '__main__':
    from sklearn.datasets import load_breast_cancer
    import pandas as pd

    dataset = load_breast_cancer()
    x_features = dataset.data
    y_label = '입학 확률'

    # cancer_df = pd.DataFrame(data=x_features, columns=dataset.feature_names)
    df = pd.read_csv(f'/Users/yong-eunjae/Downloads/ex1_graduate_school_admissions (1).csv')
    # cancer_df['predict'] = y_label
    df = df.to_dict('record')[0]
    print(f'정답 : {df[y_label]}')
    del df[y_label]

    class temp:
        modelid: int = 254797
        parameter: str = df


    print(ManageMachineLearning().predict(617, temp())) # 98903
