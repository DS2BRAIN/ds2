import ast
import json
import math
import pycm
import traceback
import torch
from models.helper import Helper
from .manage_machine_learning import ManageMachineLearning
from .util import Util
from sklearn.metrics import confusion_matrix as sklearn_confusion_materix
from sklearn.metrics import *
import numpy as np

class Analysing():

    def __init__(self):

        self.dbClass = Helper()
        self.utilClass = Util()
        self.machine_learning_class = ManageMachineLearning()

    def updateResult(self, model, modelFilePath, df, num_cols, str_cols, project, dep_var, learn=None, preds=None, y=None):

        test_df = df.iloc[round(len(df) * 0.8):len(df)].copy()
        y_raw = test_df[dep_var]
        y = y_raw.tolist()
        test_df = test_df.drop(dep_var, axis=1)

        code, result, df_result = self.machine_learning_class.custom_model_predict_all(model['id'], project,
                                                                                       test_df.copy())
        preds_raw = df_result[dep_var].tolist()
        preds = preds_raw
        if project['yClass']:
            preds = []
            y_class = ast.literal_eval(project['yClass'])
            for pred_raw in preds_raw:
                if isinstance(pred_raw, float) or isinstance(pred_raw, int):
                    preds.append(pred_raw)
                else:
                    preds.append(y_class.index(pred_raw))

        y = np.array(y)
        preds = np.array(preds)

        valueForNorm = project.get('valueForNorm', 1)

        try:
            yClass = json.loads(project.get('yClass'))
        except:
            yClass = None
            pass

        try:
            cm_result = None
            if yClass:
                cm = pycm.ConfusionMatrix(actual_vector=y, predict_vector=preds)
                cm_dict = cm.__dict__
                cm_result = {}
                cm_result['overall_stat'] = cm_dict.get('overall_stat')
                cm_result['class_stat'] = cm_dict.get('class_stat')
                if not cm_dict.get('class_stat'):
                    class_stat = {}
                    for topkey, topvalue in cm_result['class_stat'].items():
                        class_stat[topkey] = {}
                        for key, value in topvalue.items():
                            class_stat[topkey][yClass[int(key)]] = value
                    cm_result['class_stat'] = class_stat
        except:
            print("cm error")
            self.utilClass.sendSlackMessage(str(traceback.format_exc()), trainingError=True)
            cm_result = None
            pass


        feature_importance_array = None
        feature_importance = None
        feature_importanceStr = None

        confusion_matrix = None
        most_confused = None
        accuracy_value = 0
        error_rate_value = 0
        confusion_matrixStr = None
        most_confusedStr = None

        if 'classification' in project['trainingMethod']:

            try:
                accuracy_value = accuracy_score(y, preds).item()
            except:
                print(traceback.format_exc())
                accuracy_value = 0
                pass
            # try:
            #     dice_value = dice(preds, y).item()
            # except:
            #     print(traceback.format_exc())
            #     dice_value = 0
            #     pass
            try:
                error_rate_value = 1 - accuracy_value
            except:
                error_rate_value = 0
                pass

            try:
                confusion_matrix = sklearn_confusion_materix(preds, y).tolist()
            except:
                print(traceback.format_exc())
                pass
            try:
                confusion_matrixStr = json.dumps(confusion_matrix, ensure_ascii=False,
                           default=self.convertInt64) if confusion_matrix else None
            except:
                confusion_matrixStr = None
                print(traceback.format_exc())
                pass

            try:
                most_confusedStr = json.dumps(most_confused, ensure_ascii=False,
                                              default=self.convertInt64) if most_confused else None
            except:
                most_confusedStr = None
                print(traceback.format_exc())
                pass

        try:
            mase = mean_absolute_error(preds, y).item()
        except:
            print(traceback.format_exc())
            mase = 0
            pass

        try:
            mape = np.mean(np.abs((y - preds)/y))*100
        except:
            mape = 0
            print(traceback.format_exc())
            pass

        try:
            r2score = r2_score(preds, y).item()
        except:
            print(traceback.format_exc())
            r2score = 0
            pass
        try:
            yClassStr = json.dumps(yClass, ensure_ascii=False, default=self.convertInt64) if yClass else None
        except:
            yClassStr = None
            print(traceback.format_exc())
            pass
        try:
            cm_resultStr = json.dumps(cm_result, ensure_ascii=False, default=self.convertInt64) if cm_result else None
        except:
            cm_resultStr = None
            print(traceback.format_exc())
            pass

        print("updateModelDict")

        updateModelDict = {
                "status": 100,  # TODO : TEST 용
                "statusText": "100 : 모델 학습이 완료되었습니다.",
                # "filePath": modelFilePath,
                # "topKAccuracy": round(top_k_accuracy_value, 6) if not math.isnan(top_k_accuracy_value) else 0,
                "accuracy": round(accuracy_value, 6) if not math.isnan(accuracy_value) else 0,
                # "dice": round(dice_value, 6) if not math.isnan(dice_value) else 0,
                "errorRate": round(error_rate_value, 6) if not math.isnan(error_rate_value) else 0,
                "mase": round(mase, 6) if not math.isnan(mase) else 0,
                "mape": round(mape, 6) if not math.isnan(mape) else 0,
                "r2score": round(r2score, 6) if not math.isnan(r2score) else 0,
                "confusionMatrix": confusion_matrixStr,
                "mostConfused": most_confusedStr,
                "yClass": yClassStr,
                # "featureImportance": feature_importanceStr,
                "cmStatistics": cm_resultStr,
                # "records": recordsStr,
            }
        for key, value in updateModelDict.items():
            try:
                if np.inf == value:
                    continue
                self.dbClass.updateModel(model['id'], {key: value})
            except:
                print(traceback.format_exc())
                pass

        return feature_importance_array, yClass


    def convertInt64(self, o):
        if isinstance(o, np.int64): return int(o)
        raise TypeError


    def updateTextResult(self, learn, model, modelFilePath, df, num_cols, str_cols, project, workDir):

        records = df.iloc[round(len(df) * 0.8):len(df)].copy().reset_index(drop=True)

        actualAllRows = [str(x).strip().replace(' ','_') for x in records[project['valueForPredict']].tolist()]
        actualRows = []
        predictRows = []
        diffRows = {}

        for index, row in records.iterrows():

            try:

                textRow = ' '.join([str(row[x]) for x in str_cols]).replace('\n',' ')

                print('learn.predict(textRow)')
                print(learn.predict(textRow))

                predictRow = learn.predict(textRow)[0][0].split('__label__')[1]

                if not diffRows.get(actualAllRows[index]):
                    diffRows[actualAllRows[index]] = {
                        'same': 0,
                        'diff': {

                        }
                    }
                if predictRow == actualAllRows[index]:
                    diffRows[actualAllRows[index]]['same'] += 1
                else:
                    if not diffRows[actualAllRows[index]]['diff'].get(predictRow):
                        diffRows[actualAllRows[index]]['diff'][predictRow] = 0
                    diffRows[actualAllRows[index]]['diff'][predictRow] += 1


                actualRows.append(actualAllRows[index])
                predictRows.append(predictRow)
                try:
                    if project["option"] == "autolabeling" and index < 5:
                        sample_result = self.dbClass.create_custom_ai_sample_result(
                            {
                                "labelprojectId": project.get('labelproject'),
                                "projectId": project.get('id'),
                                "modelId": model.get('id'),
                                "sampleResult": {
                                    "input_value": textRow,
                                    "predict_result": predictRow,
                                    "actual_result": actualAllRows[index],
                                },
                            "step": index + 1
                            })
                except:
                    print(traceback.format_exc())
                    self.utilClass.sendSlackMessage("오토라벨링을 위한 Custom AI Best result 생성 실패", trainingError = True)
                    self.utilClass.sendSlackMessage(str(traceback.format_exc()), trainingError=True)
                    pass

            except:
                print("Predict Failed")
                print(traceback.format_exc())
                pass

        yClass = [x.split('__label__')[1] for x in learn.labels]

        print("diffRows")
        print(diffRows)

        try:
            cm_result = {}
            if yClass:
                cm = pycm.ConfusionMatrix(actual_vector=actualRows, predict_vector=predictRows)
                cm_dict = cm.__dict__
                cm_result = {}
                cm_result['overall_stat'] = cm_dict.get('overall_stat')
                cm_result['class_stat'] = cm_dict.get('class_stat')
                if not cm_dict.get('class_stat'):
                    class_stat = {}
                    for topkey, topvalue in cm_result['class_stat'].items():
                        class_stat[topkey] = {}
                        for key, value in topvalue.items():
                            class_stat[topkey][yClass[int(key)]] = value
                    cm_result['class_stat'] = class_stat
        except:
            print("cm error")
            self.utilClass.sendSlackMessage(str(traceback.format_exc()), trainingError=True)
            cm_result = {}
            pass

        try:
            records['__predict_value__' + project['valueForPredict']] = predictRows
            confusion_matrix = sklearn_confusion_materix(actualAllRows, predictRows).tolist()
            records = records.iloc[0:120].copy()
            records = records.to_dict('records')
        except:
            print("ValueError: Length of values does not match length of index")
            confusion_matrix = {}
            records = {}
            pass

        self.dbClass.updateModel(model['id'], {
            "status": 100,  # TODO : TEST 용
            "statusText": "100 : 모델 학습이 완료되었습니다.",
            "filePath": modelFilePath,
            "accuracy": cm_result.get('overall_stat',{}).get('Overall ACC'),
            "confusionMatrix": json.dumps(confusion_matrix, indent=1, ensure_ascii=False, default=self.convertInt64) if confusion_matrix else None,
            "yClass": json.dumps(yClass, indent=1, ensure_ascii=False, default=self.convertInt64) if yClass else None,
            "cmStatistics": json.dumps(cm_result, indent=1, ensure_ascii=False, default=self.convertInt64) if cm_result else None,
            "records": json.dumps(records, indent=1, ensure_ascii=False, default=self.convertInt64) if records else None
        })
