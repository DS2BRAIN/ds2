# -*- coding: utf-8 -*-
import ast
import datetime
import json
import urllib
from uuid import uuid4

import gc
import math
import os
import shutil
import time
import traceback

import numpy as np
import peewee
import requests

# from astoredaemon.daemon_async_task import DaemonAsyncTask
import torch
from captum.attr import IntegratedGradients
from playhouse.shortcuts import model_to_dict

from models import skyhub
from src.processing import Processing
from src.analysing import Analysing
from src.util import Util
from models.helper import Helper
from machine_learning.xg_boost import XGBoostClf, XGBoostReg
from machine_learning.random_forest import RandomForestClf, RandomForestReg
from machine_learning.gradient_boosting import GradientBoostingClf, GradientBoostingReg
from machine_learning.isolation_forest import IsolationForestClf
from machine_learning.generalized_linear_modeling import SGDClf, SGDReg
from machine_learning.nave_bayes import NaveBayesClf
from machine_learning.keras_ann import KerasAnn
from machine_learning.torch_ann import TorchAnn
from machine_learning.fastai_ann import FastAnn
import sys
import random
from src.errors import exceptions as ex
import numpy as np

class EnterpriseFailed(Exception):
    def __init__(self, m):
        self.message = m
    def __str__(self):
        return self.message

class Daemon():

    class TestInstanceUser():
        instance_id = 0
        id = 0
        ps_id = 0
        model_id = 0
        project_id = 0
        isTest = 0
        progress = 0
        updated_at = None
        user_id = 0
        isDeleted = False
        def save(self):
            pass

    def __init__(self, testMode=False):

        self.trainingClass = None
        self.splitingClass = None
        self.autoMLanalysingClass = None

        if os.path.exists('./src/training/training.py'):
            from src.training.training import Training
            from src.creating.spliting import Spliting
            from src.training.analysing import Analysing as AutoMLAnalysing
            self.trainingClass = Training(testMode=testMode)
            self.splitingClass = Spliting()
            self.autoMLanalysingClass = AutoMLAnalysing()

        self.utilClass = Util()
        self.dbClass = Helper(init=True)
        self.processingClass = Processing()
        self.analysingClass = Analysing()
        # self.daemonAsyncTaskClass = DaemonAsyncTask(testMode=False)
        self.testMode = testMode
        self.generateModelStatus = 21
        self.HelpModelStatus = 31
        self.runCount = 0
        self.is_quant_training_server = False
        self.projectId = None
        self.instancesUser = None
        self.model_class_info = {
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
        for argv in sys.argv:
            if 'quant' in argv:
                self.is_quant_training_server = True

            if 'test' in argv:
                self.testMode = True
                self.generateModelStatus = 51
                self.HelpModelStatus = 61
                break

        if self.testMode:
            self.instanceName = 'TEST'
        else:
            self.instanceName = self.utilClass.getEC2InstanceIDOrReturnDSLAB()

            #
            # if self.dbClass.getInstanceUserCount() >= adminKey["maxgpu"]:
            #     print(f"Max Gpu license reached : {adminKey['maxgpu']}")
            #     raise EnterpriseFailed("Max Gpu license reached")

        #if self.instanceName not in ["TEST", "yeo", "jenkins", 'root']:
        #    self.utilClass.sendSlackMessage(f"{self.instanceName}: {self.utilClass.configOption} "
        #                                f"{self.utilClass.planOption} 데몬 서버 : 정상적으로 실행됩니다.", daemon=True)
        time.sleep(round(random.uniform(1,15), 3) + self.sum_digits(self.instanceName)/10)

    def sum_digits(self, digit):
        return sum(int(x) for x in digit if x.isdigit())

    def run(self, checkAvailablity=False, project_id=None):

        if self.utilClass.configOption == 'enterprise':
            self.utilClass.isValidKey(self.dbClass.getAdminKey())

        if os.path.exists("/home/ubuntu/aimaker-backend-deploy"):
            try:
                instanceId = requests.get("http://169.254.169.254/latest/meta-data/instance-id", timeout=1).text
                r = requests.get("http://169.254.169.254/latest/dynamic/instance-identity/document")
                response_json = r.json()
                region_name = response_json.get('region')
                isJupyterServer = False
                ec2 = self.utilClass.getBotoClient('ec2', region_name=region_name)
                allInstances = ec2.describe_instances()
                for instanceRaw in allInstances.get("Reservations", []):
                    instances = instanceRaw.get("Instances", [{}])
                    for instance in instances:
                        if instanceId == instance.get("InstanceId", None):
                            tags = instance.get("Tags", [])
                            for tag in tags:
                                if tag.get("Key") == "jupyterId":
                                    isJupyterServer = True
                                if tag.get("Key") == "projectId":
                                    self.projectId = tag.get("Value")

                if isJupyterServer:
                    return
            except:
                print("it is not cloud mode")
                pass

        try:

            print(sys.argv)

            target_project = None
            if project_id:
                target_project = project_id
            elif len(sys.argv) == 5:
                target_project = int(sys.argv[4])

            if target_project:
                project = self.dbClass.getOneProjectById(target_project)
                if project['status'] == 1 or project['status'] == 21 or project['status'] == 51:
                    if not self.generateModel(project):
                        raise Exception("모델 생성 실패")
                    else:
                        self.dbClass.updateProjectStatusById(project['id'], 1, "1: 학습이 시작되었습니다.")
                self.trainModels(project, self.instanceName)
            # else:
            #     self._run()
            #     time.sleep(15)
            #     if not checkAvailablity:
            #         self._run(checkAvailablity=True)
        except:
            print(traceback.format_exc())
            pass

    def _run(self, checkAvailablity=False):

        try:

            self.runCount += 1

            # if 'TEST' not in self.instanceName:
            #     self.hasGPUError()

            if checkAvailablity:
                if 'business' in self.utilClass.planOption:
                    self.generateModels(checkAvailablity=True)
                    self.helpModels(checkAvailablity=True)
            else:
                self.generateModels(checkAvailablity=False)
                self.helpModels(checkAvailablity=False)

            if self.testMode or self.utilClass.configOption == 'enterprise':
                self.generateModels(checkAvailablity=True)
                self.helpModels(checkAvailablity=True)

        except:
            print(traceback.format_exc())
            pass


    def generateModels(self, checkAvailablity=False):

        projects = self.dbClass.getProjectsByStatusAndPlan(self.generateModelStatus, self.utilClass.planOption, checkAvailablity=checkAvailablity)

        for project in projects:

            if self.hasGPUError():
                sys.exit()

            if 'quant_backtest' in project['projectName'] and not self.is_quant_training_server:
                continue

            if 'quant_backtest' not in project['projectName'] and self.is_quant_training_server:
                continue

            if project.get('option', '') == 'colab':
                continue

            if self.projectId and str(project['id']) != str(self.projectId):
                continue

            time.sleep(round(random.uniform(1, 15), 3))

            project = self.dbClass.getOneProjectById(project['id'])

            if self.isProjectForSkipping(project, 1) and self.isProjectForSkipping(project, self.generateModelStatus) and self.isProjectForSkipping(project, 61):
                # print(f"#{project['id']} - 이미 만들어진 프로젝트라 스킵합니다.")
                continue

            if not self.isAvailableProject(project) and not self.testMode and not checkAvailablity:
                self.utilClass.sendSlackMessage(f"{self.instanceName}: {self.utilClass.configOption}, checkAvailablity : {checkAvailablity} "
                                                f"{self.utilClass.planOption if len(sys.argv) > 2 else ''}"
                                                f"유저의 dyno가 모두 사용 중이라 해당 프로젝트를 스킵합니다.", daemon=True)
                # print(f"#{project['id']} - 유저의 dyno가 모두 사용 중이라 해당 프로젝트를 스킵합니다.")
                continue

            self.dbClass.updateUserCumulativeProjectCount(project['user'], 1)

            self.dbClass.updateProjectStatusById(project['id'], 10, "10 : 모델 생성 준비 중입니다.")
            # self.dbClass.removeAllModelsByProjectId(project['id'])

            # try:
            #     shutil.rmtree(f"./data/{project['id']}")
            # except:
            #     pass
            try:
                if project.get('filePath'):
                    localFilePath = self.processingClass.downloadData(project)
                    df, num_cols, str_cols, dep_var, configFile = self.processingClass.preProcessing(project, localFilePath, isProcessed=False)
                else:
                    localFilePath, df, num_cols, str_cols, dep_var, configFile, project = self.processingClass.prepareData(project)

            except:
                print(traceback.format_exc())
                self.utilClass.sendSlackMessage(f"전처리 에러 Project ID : {project['id']}", daemonError=True)
                self.utilClass.sendSlackMessage(str(traceback.format_exc()), daemonError=True)
                self.dbClass.updateProjectStatusById(project['id'], 9, "9 : 전처리 중 오류가 발생하였습니다. 오른쪽 하단의 컨설턴트에게 문의해주세요.")
                continue
                pass

            if df is not None and df.shape[0] == 0:
                self.dbClass.updateProjectStatusById(project['id'], 9, "9 : 전처리 조건에 의해 모든 행이 삭제되었습니다. 조건을 재확인해주세요.")
                continue

            self.createModels(project)
            self.trainModels(project, self.instanceName)
            self.finishProject(project)

        projects = self.dbClass.getProjectsByStatusAndPlan(1, self.utilClass.planOption, checkAvailablity=checkAvailablity)

        for project in projects:
            if self.hasGPUError():
                sys.exit()

            if project.get('option', '') == 'colab':
                continue

            time.sleep(round(random.uniform(1,15), 3))

            project = self.dbClass.getOneProjectById(project['id'])

            if self.isProjectForSkipping(project, 1) and self.isProjectForSkipping(project, 21):
                # print(f"#{project['id']} - 이미 만들어진 프로젝트라 스킵합니다.")
                continue

            if not self.isAvailableProject(project) and not self.testMode and not checkAvailablity:
                self.utilClass.sendSlackMessage(f"{self.instanceName}: {self.utilClass.configOption}, checkAvailablity : {checkAvailablity} "
                                                f"{self.utilClass.planOption if len(sys.argv) > 2 else ''}"
                                                f"유저의 dyno가 모두 사용 중이라 해당 프로젝트를 스킵합니다.", daemon=True)
                # print(f"#{project['id']} - 유저의 dyno가 모두 사용 중이라 해당 프로젝트를 스킵합니다.")
                continue

            self.dbClass.updateUserCumulativeProjectCount(project['user'], 1)
            self.dbClass.updateProjectStatusById(project['id'], 10, "10 : 모델 생성 후 학습 준비 중입니다.")

            # if project.get('filePath'):
            #     localFilePath = self.processingClass.downloadData(project)
            #     df, num_cols, str_cols, dep_var, configFile = self.processingClass.preProcessing(project, localFilePath, isProcessed=False)
            # else:
            #     localFilePath, df, num_cols, str_cols, dep_var, configFile, project = self.processingClass.prepareData(project)
            #
            # if df is not None and df.shape[0] == 0:
            #     self.dbClass.updateProjectStatusById(project['id'], 9, "9 : 전처리 조건에 의해 모든 행이 삭제되었습니다. 조건을 재확인해주세요.")
            #     continue
            #
            # if project.get('algorithm', 'auto') != 'auto':
            #     self.train_models(project, dep_var, df, num_cols, str_cols)

            self.createModels(project)
            self.trainModels(project, self.instanceName)
            # self.finishProject(project)

    def train_and_get_importance_with_custom_model(self, train_custom_params):
        custom_model_class = train_custom_params.get('custom_model_class')
        if custom_model_class == TorchAnn:
            importance_data = self.train_and_get_importance_by_torch(train_custom_params)
        elif custom_model_class == FastAnn:
            importance_data = self.train_and_get_importance_by_fast(train_custom_params)
        elif custom_model_class == KerasAnn:
            importance_data = self.train_and_get_importance_by_keras(train_custom_params)
        else:
            importance_data = self.train_and_get_importance_by_others(train_custom_params)

        return importance_data

    def get_custom_model_class(self, project):
        algorithm = project.get('algorithm')
        model_class = self.model_class_info.get(algorithm, None)
        if model_class is None:
            predict_coulmn_raw = self.dbClass.getOneDatacolumnById(project.get("valueForPredictColumnId"))
            if int(predict_coulmn_raw.unique) > 25 and "number" in predict_coulmn_raw.type:
                algorithm += f'_reg'
            else:
                algorithm += f'_clf'
            model_class = self.model_class_info.get(algorithm, None)
        return model_class

    def get_custom_model_df(self, df, project):
        value_for_norm = 1
        training_method = "normal_classification"
        try:
            file_structure = ast.literal_eval(project['fileStructure'])
        except:
            file_structure = json.loads(project['fileStructure'])
            pass
        for value in file_structure:
            dep_var = project['valueForPredict']
            if dep_var == value['columnName']:
                if not value['unique']:
                    value = self.utilClass.parseColumData(df[dep_var])
                try:
                    float(value['mean'])
                    value['type'] = "number"
                except:
                    pass
                if ((int(value['unique']) > 25 and
                    "number" in value['type'] and
                    'normal_' not in project['trainingMethod']) or
                    'normal_regression' in project['trainingMethod']):
                    training_method = 'normal_regression'
                    value_for_norm = float(value['mean']) if value['mean'] else float(value['max'])
                    df[dep_var].fillna(0, inplace=True)
                    df[dep_var] = df[dep_var].apply(lambda x: float(x) / value_for_norm)
                    self.dbClass.updateProject(project['id'], {
                        'valueForNorm': round(value_for_norm, 6)
                    })
                self.dbClass.updateProject(project['id'], {
                    'valueForNorm': round(value_for_norm, 6),
                    'trainingMethod': training_method
                })
        return df

    def train_and_get_importance_by_torch(self, train_params):
        df = train_params.get('df')
        project = train_params.get('project')
        model_file_path = train_params.get('model_file_path')
        hyper_param = train_params.get('hyper_param')
        dep_var = project["valueForPredict"]

        torch_model = TorchAnn(len(df.columns) - 1, hyper_param.get('layer_width', 0))
        torch_model.set_train_data(df, dep_var, project["id"])
        torch_model.fit(hyper_param)
        torch.save(torch_model.state_dict(), model_file_path)

        importance_data = None
        try:
            importance_data = self.create_importance_torch(torch_model)
        except:
            pass

        return importance_data

    def train_and_get_importance_by_fast(self, train_params):
        df = train_params.get('df')
        project = train_params.get('project')
        custom_model_class = train_params.get('custom_model_class')
        model_file_path = train_params.get('model_file_path')
        hyper_param = train_params.get('hyper_param')
        dep_var = project["valueForPredict"]

        custom_model_class = custom_model_class()
        custom_model_class.set_train_data(df, dep_var, project["id"], is_fastai=True)
        trained_model = custom_model_class.train(hyper_param)
        trained_model.export(model_file_path)

        importance_data = None
        try:
            importance_data = custom_model_class.create_importance()
        except:
            pass

        return importance_data

    def train_and_get_importance_by_keras(self, train_params):
        df = train_params.get('df')
        project = train_params.get('project')
        custom_model_class = train_params.get('custom_model_class')
        model_file_path = train_params.get('model_file_path')
        hyper_param = train_params.get('hyper_param')
        dep_var = project["valueForPredict"]

        custom_model_class = custom_model_class()
        custom_model_class.set_train_data(df, dep_var, project["id"])
        custom_model_class.train(df, dep_var, hyper_param, project["id"])
        try:
            custom_model_class.save(model_file_path.split(self.utilClass.save_path)[1])
        except:
            custom_model_class.save(model_file_path)    

        importance_data = None
        try:
            importance_data = custom_model_class.create_importance()
        except:
            pass

        return importance_data

    def train_and_get_importance_by_others(self, train_params):
        df = train_params.get('df')
        project = train_params.get('project')
        custom_model_class = train_params.get('custom_model_class')
        model_file_path = train_params.get('model_file_path')
        hyper_param = train_params.get('hyper_param')
        dep_var = project["valueForPredict"]

        custom_model_class = custom_model_class()
        custom_model_class.set_train_data(df, dep_var, project["id"], is_scikit_learn_model=True)
        custom_model_class.train(df, dep_var, hyper_param)
        custom_model_class.save(model_file_path)

        importance_data = None
        try:
            importance_data = custom_model_class.create_importance()
        except:
            pass

        return importance_data

    def create_importance_torch(self, torch_model):

        test_input_tensor = torch_model.x_test
        test_input_tensor.requires_grad_()
        ig = IntegratedGradients(torch_model)
        attr, delta = ig.attribute(test_input_tensor, target=1, return_convergence_delta=True)
        attr = attr.detach().numpy()
        columns = torch_model.column_names
        importance = np.mean(attr, axis=0)
        importance_dict = {
            'cols': [],
            'imp': []
        }
        for i in range(len(columns)):
            importance_dict['cols'].append(columns[i])
            importance_dict['imp'].append(importance[i])

        return importance_dict

    def generateModel(self, project):
        if self.hasGPUError():
            sys.exit()

        if project.get('option', '') == 'colab':
            return

        time.sleep(round(random.uniform(1, 15), 3))

        project = self.dbClass.getOneProjectById(project['id'])

        self.dbClass.updateUserCumulativeProjectCount(project['user'], 1)

        self.dbClass.updateProjectStatusById(project['id'], 10, "10 : 모델 생성 준비 중입니다.")
        # self.dbClass.removeAllModelsByProjectId(project['id'])

        try:
            shutil.rmtree(f"./data/{project['id']}")
        except:
            pass
        try:
            if project.get('filePath'):
                localFilePath = self.processingClass.downloadData(project)
                df, num_cols, str_cols, dep_var, configFile = self.processingClass.preProcessing(project, localFilePath,
                                                                                                 isProcessed=False)
            else:
                localFilePath, df, num_cols, str_cols, dep_var, configFile, project = self.processingClass.prepareData(
                    project)

        except:
            print(traceback.format_exc())
            self.utilClass.sendSlackMessage(f"전처리 에러 Project ID : {project['id']}", daemonError=True)
            self.utilClass.sendSlackMessage(str(traceback.format_exc()), daemonError=True)
            self.dbClass.updateProjectStatusById(project['id'], 9, "9 : 전처리 중 오류가 발생하였습니다. 오른쪽 하단의 컨설턴트에게 문의해주세요.")
            return False
            pass

        if df is not None and df.shape[0] == 0:
            self.dbClass.updateProjectStatusById(project['id'], 9, "9 : 전처리 조건에 의해 모든 행이 삭제되었습니다. 조건을 재확인해주세요.")
            return False

        self.createModels(project)
        return True


    def helpModels(self, checkAvailablity=False):

        projects = self.dbClass.getProjectsByStatusAndPlan(self.HelpModelStatus, self.utilClass.planOption, checkAvailablity=checkAvailablity)

        for project in projects:

            if self.hasGPUError():
                sys.exit()

            if project.get('option', '') == 'colab':
                continue

            if 'quant_backtest' in project['projectName'] and not self.is_quant_training_server:
                continue

            if 'quant_backtest' not in project['projectName'] and self.is_quant_training_server:
                continue

            if self.projectId and str(project['id']) != str(self.projectId):
                continue

            time.sleep(round(random.uniform(1,15), 3))

            project = self.dbClass.getOneProjectById(project['id'])

            if self.isProjectForSkipping(project, 11) and self.isProjectForSkipping(project, self.HelpModelStatus):
                # print(f"#{project['id']} - 이미 종료된 프로젝트라 스킵합니다.")
                continue

            if not self.isAvailableProject(project) and not self.testMode and not checkAvailablity:
                self.utilClass.sendSlackMessage(f"{self.instanceName}: {self.utilClass.configOption}, checkAvailablity : {checkAvailablity} "
                                                f"{self.utilClass.planOption if len(sys.argv) > 2 else ''}"
                                                f"유저의 dyno가 모두 사용 중이라 해당 프로젝트를 스킵합니다.", daemon=True)
                # print(f"#{project['id']} - 유저의 dyno가 모두 사용 중이라 해당 프로젝트를 스킵합니다.")
                continue

            self.trainModels(project, self.instanceName)
            # self.finishProject(project)

        projects = self.dbClass.getProjectsByStatusAndPlan(11, self.utilClass.planOption, checkAvailablity=checkAvailablity)

        for project in projects:

            if self.hasGPUError():
                sys.exit()

            if project.get('option', '') == 'colab':
                continue

            time.sleep(round(random.uniform(1,15), 3))

            project = self.dbClass.getOneProjectById(project['id'])

            if self.isProjectForSkipping(project, 11) and self.isProjectForSkipping(project, 31) and self.isProjectForSkipping(project, 61):
                # print(f"#{project['id']} - 이미 종료된 프로젝트라 스킵합니다.")
                continue

            if not self.isAvailableProject(project) and not self.testMode and not checkAvailablity:
                self.utilClass.sendSlackMessage(f"{self.instanceName}: {self.utilClass.configOption}, checkAvailablity : {checkAvailablity} "
                                                f"{self.utilClass.planOption if len(sys.argv) > 2 else ''}"
                                                f"유저의 dyno가 모두 사용 중이라 해당 프로젝트를 스킵합니다.", daemon=True)
                # print(f"#{project['id']} - 유저의 dyno가 모두 사용 중이라 해당 프로젝트를 스킵합니다.")
                continue

            self.trainModels(project, self.instanceName)
            # self.finishProject(project)

    def update_status_and_create_notify_with_project(self, project, project_status, project_status_text):

        project_id = project.get('id')
        self.dbClass.updateProjectStatusById(project_id, project_status, project_status_text)

    def finishProject(self, project_arg):
        project = self.dbClass.getOneProjectById(project_arg['id'])
        project_status = project['status']
        error_count_all = project['errorCountNotExpected']
        if error_count_all > 25:
            self.dbClass.removeNotStartedModels(project)
            if project['successCount'] > 0:
                project_status = 100
                project_status_text = "100 : 모든 학습이 완료되었습니다."
            else:
                project_status = 99
                project_status_text = "99 : 개발에 실패하였습니다."
            self.dbClass.updateProjectStatusById(project['id'], project_status, project_status_text)
            return None

        if project.get('status') not in [9, 99, 100]:
            projectId = project['id']
            try:
                notFinished = 0
                done = 0
                for modelRaw in self.dbClass.getModelsByProjectId(projectId):
                    if modelRaw.status != 100 and modelRaw.status != 99 and modelRaw.status != 9 and modelRaw.status != 1:
                        # if modelRaw.updated_at + datetime.timedelta(hours=8) > datetime.datetime.utcnow():
                        notFinished += 1
                    if modelRaw.status == 100:
                        done += 1
                print(f"{projectId} 남은 모델 개수 : {notFinished}")
                # 모델 1개인데 미완료일 경우
                if notFinished == 0:
                    print(f"{projectId} : 모든 학습이 완료되었습니다.")
                    project_status = 100
                    project_status_text = "100 : 모든 학습이 완료되었습니다."
                    if done:
                        self.utilClass.sendSlackMessage(f"모든 학습을 완료하였습니다. (Project ID : {projectId})", daemon=True)
                        if 'object' not in project['trainingMethod']:
                            if 'regression' not in project['trainingMethod']:
                                model = self.dbClass.getBestModelByProjectId(projectId, byAccuracy=True)
                            else:
                                model = self.dbClass.getBestModelByProjectId(projectId, byAccuracy=False)
                            self.dbClass.updateModel(model.id, {"isFavorite": True})
                            self.dbClass.updateProject(projectId, {"hasBestModel": True})
                        else:
                            models = [x for x in self.dbClass.getModelsByProjectId(projectId)]
                            if len(models) == 1:
                                model = models[0]
                                model.isFavorite = True
                                model.save()
                    else:
                        project_status = 99
                        project_status_text = "99 : 개발에 실패하였습니다."
                        self.utilClass.sendSlackMessage(f"모델 개발에 실패하였습니다. (Project ID : {projectId})", daemon=True,
                                                        server_status=True)

                    self.dbClass.updateProjectStatusById(project['id'], project_status, project_status_text)

                    if not project.get('isSentCompletedEmail'):
                        self.dbClass.updateProject(projectId, {"isSentCompletedEmail": True})
                        self.utilClass.sendEmailAfterFinishingProject(project, self.dbClass.getOneUserById(project['user']))

                    if self.utilClass.configOption == 'enterprise':
                        try:
                            shutil.rmtree(f"../aimaker-daemon-deploy-prod/data/{project['id']}")
                        except:
                            pass

            except peewee.OperationalError:
                skyhub.connect(reuse_if_open=True)
                pass

            except:
                print(traceback.format_exc())
                # self.dbClass.updateProjectStatusById(projectId, 99, "99 : 에러가 발생하였습니다.")
                self.utilClass.sendSlackMessage(f"유저 id: {project.get('user')}, 프로젝트 id: {project.get('id')}",
                                                daemonError=True)
                self.utilClass.sendSlackMessage(f"프로젝트 name: {project.get('projectName')}", daemonError=True)
                self.utilClass.sendSlackMessage(f"에러가 발생하였습니다. (Project ID : {projectId})"
                                                f" {str(traceback.format_exc())})", daemonError=True)
                pass

            return project_status

    def getProjects(self, status=0):

        projectsRaw = self.dbClass.getProjectsByStatus(status)
        projects = []

        for project in projectsRaw:
            # project = projectRaw.__dict__['__data__']

            projects.append(project)

        return projects

    def isAvailableProject(self, project):

        user = self.dbClass.getOneUserById(project['user'])
        user['usageplan'] = self.dbClass.getOneUsageplanByPlanName('basic')['id'] if not user['usageplan'] else user['usageplan']
        userUsagePlan = self.dbClass.getOneUsageplanById(user['usageplan'])

        currentUsedinstancesCountByUser = self.dbClass.getCountInstanceUserByUserId(user['id'])
        maxAvailableInstanceCountByUser = 1 if "basic" in userUsagePlan['planName'] else user['dynos']
        if not maxAvailableInstanceCountByUser:
            maxAvailableInstanceCountByUser = 1

        return maxAvailableInstanceCountByUser > currentUsedinstancesCountByUser

    def isProjectForSkipping(self, project, status):

        if project.get("status") != status:
            return True
        return False

    def hasGPUError(self):
        try:
            instance = self.dbClass.getInstanceDataByInstanceName(self.instanceName)
            if instance.get("hasGpuError"):
                print("hasGpuError")
                self.utilClass.sendSlackMessage(f"{self.instanceName}: {self.utilClass.configOption} "
                                                f"GPU error 가 있는 인스턴스 이므로 사용하지 않습니다.", daemon=True)
                return True
        except:
            pass

    def reboot_instance(self, server_type=""):
        if self.utilClass.instanceId:
            try:
                instanceUsers = self.dbClass.getInstanceUserByInstanceName(self.utilClass.instanceId)
                for instanceUser in instanceUsers:
                    instanceUser.isDeleted = True
                    instanceUser.save()
                self.dbClass.createInstanceLog({"server_type": server_type, "instanceId": self.utilClass.instanceId, "action": "reboot_daemon"})
                self.utilClass.sendSlackMessage(f"{self.utilClass.instanceId} : 해당 인스턴스를 재부팅합니다. ({server_type})",
                                      monitoring=True, server_status=True)
                ec2 = self.utilClass.getBotoClient('ec2', region_name=self.utilClass.region_name)
                ec2.reboot_instances(InstanceIds=[self.utilClass.instanceId])
            except:
                self.utilClass.sendSlackMessage(f"{self.utilClass.instanceId} : 재부팅 실패.", daemon=True, server_status=True)
                self.utilClass.sendSlackMessage(f"{self.utilClass.instanceId} : 재부팅 실패.", appError=True)
                self.utilClass.sendSlackMessage(f"{self.utilClass.instanceId} : {str(traceback.format_exc())}", appError=True)
                pass

    def trainModels(self, project, instanceId):

        if project.get('option', '') == 'colab':
            return

        if project.get('filePath'):
            localFilePath = self.processingClass.downloadData(project)
            df, num_cols, str_cols, dep_var, configFile = self.processingClass.preProcessing(project, localFilePath,
                                                                                             isProcessed=True)
        else:
            localFilePath, df, num_cols, str_cols, dep_var, configFile, project = self.processingClass.prepareData(
                project)

        self.dbClass.updateProjectStatusById(project['id'], 11, "11 : 모델 학습이 시작되었습니다.")

        model_dir_path = f'{self.utilClass.save_path}/model'
        if not os.path.exists(model_dir_path):
            os.makedirs(model_dir_path)
        custom_model_class = None
        if 'custom' == project['option']:
            custom_model_class = self.get_custom_model_class(project)
            if custom_model_class is None:
                raise ex.NotAllowedAlgorithmEx(project.get('algorithm'))
            elif custom_model_class not in [TorchAnn, KerasAnn, FastAnn]:
                custom_model_class = custom_model_class()
            df = self.get_custom_model_df(df, project)

        models = self.dbClass.getModelsNotStartedByProjectId(project["id"])
        for modelRaw in models:

            print("empty_cache()")
            try:
                gc.collect()
                torch.cuda.empty_cache()
            except:
                pass

            model = model_to_dict(modelRaw)
            if not self.instancesUser:
                self.instancesUser = self.dbClass.createInstanceUser(self.instanceName, project['user'],ps_id=self.utilClass.ps_id) \
                    if not self.testMode else self.TestInstanceUser()
            instancesUser = self.instancesUser
            status = 100

            project_raw = self.dbClass.getOneProjectById(project['id'], raw=True)
            project = model_to_dict(project_raw)

            if project['status'] == 100 or project['status'] == 0:
                break

            user = self.dbClass.getOneUserById(project['user'], raw=True)
            isForFree = False

            if self.utilClass.configOption != 'enterprise':
                if user.deposit - user.usedPrice <= 0:

                    project.status = 0
                    project.save()

                    self.dbClass.createAsyncTask({
                        'taskName': f'Payment Required',
                        'taskType': 'paymentRequired',
                        'status': 100,
                        'user': user.id,
                        'isChecked': 0
                    })

                    break

            try:
                startTime = datetime.datetime.now()
                print("startTime : " + str(startTime))
                self.dbClass.updateInstance(instancesUser.instance_id, {'updated_at': datetime.datetime.utcnow()})

                self.dbClass.updateInstanceUser(instancesUser.id,{
                    "updated_at": datetime.datetime.utcnow(),
                    "project_id": project['id'],
                    "model_id": model['id'],
                    "ps_id": self.utilClass.ps_id,
                })
                self.dbClass.updateModel(model['id'], {
                    "ping_at": datetime.datetime.utcnow(),
                    "started_at": datetime.datetime.utcnow(),
                })
                self.dbClass.updateInstance(instancesUser.instance_id, {
                    "updated_at": datetime.datetime.utcnow(),
                })
                time.sleep(round(random.uniform(1, 15), 3))

                if self.isModelForSkipping(model):
                    continue

                # if project.get("isParameterCompressed"):

                if 'custom' not in project['option']:

                    if 'speed' in project['option']:
                        split = self.splitingClass.SplitFast
                    elif 'autolabeling' in project['option']:
                        split = self.splitingClass.AutoLabeling
                    elif 'test' in project['option']:
                        split = self.splitingClass.SplitTest
                    elif 'labeling' in project['option']:
                        split = self.splitingClass.SplitLabeling
                    else:
                        split = self.splitingClass.Split

                    model["epoch"] = split["epoch"][int(model["epoch"])]if model["epoch"] else 10
                    model["objectDetectionModel"] = split["objectDetectionModel"][int(model["objectDetectionModel"])] if model["objectDetectionModel"] else ""
                    model["learningRateFromFit"] = split["learningRateFromFit"][int(model["learningRateFromFit"])] if model["learningRateFromFit"] else 0.1
                    model["layerDeep"] = split["layerDeep"][int(model["layerDeep"])] if model["layerDeep"] else 100
                    model["layerWidth"] = split["layerWidth"][int(model["layerWidth"])] if model["layerWidth"] else 100
                    model["dropOut"] = split["dropOut"][int(model["dropOut"])] if model["dropOut"] else 0.5
                    model["visionModel"] = split["visionModel"][int(model["visionModel"])] if model["visionModel"] else ""
                    model["lossFunction"] = split["lossFunction"][int(model["lossFunction"])] if model["lossFunction"] else "hs"
                    model["usingBert"] = True if model["usingBert"] else False
                    model["timeSeriesTrainingRow"] = split["timeSeriesTrainingRow"][int(model["timeSeriesTrainingRow"])] if model["timeSeriesTrainingRow"] else 30
                    if 'time_series' in project['trainingMethod']:
                        model["layerWidth"] = model["layerWidth"] * 10
                        # model["epoch"] = model["epoch"] * 10

                        # torch.cuda.empty_cache()
                # mem.gpu_mem_get_free_no_cache()
                project["valueForPredict"] = project["valueForPredict"] if project["valueForPredict"] is None else project["valueForPredict"].strip()

                self.updateStatusForTraining(project, model, instancesUser, instanceId)

                if 'custom' == project['option']:
                    status_text = None
                    importance_data = None
                    model_file_name = f'{project["algorithm"]}_{str(model["id"]).zfill(2)}.dsm'
                    model_file_path = f'{model_dir_path}/{model["id"]}/{model_file_name}'
                    hyper_param = self.dbClass.get_train_param_by_id(model['hyper_param_id'])
                    train_custom_params = {
                        'df': df,
                        'project': project,
                        'model': model,
                        'model_file_path': model_file_path,
                        'custom_model_class': custom_model_class,
                        'hyper_param': hyper_param
                    }
                    try:
                        importance_data = self.train_and_get_importance_with_custom_model(train_custom_params)
                    except:
                        status_text = str(traceback.format_exc())
                        status = 99
                        print(status_text)
                    finally:
                        data = {
                            'filePath': model_file_path,
                            'status': status,
                            'statusText': status_text,
                            'progress': status,
                            'featureImportance': importance_data,
                            'layerDeep': hyper_param.get('layer_deep'),
                            'layerWidth': hyper_param.get('layer_width')
                        }
                        self.dbClass.updateModel(model['id'], data)
                        if status == 100:
                            try:
                                self.analysingClass.updateResult(model, None, df, num_cols, str_cols, project, project["valueForPredict"])
                            except:
                                print(traceback.format_exc())
                                pass
                elif 'object_detection' in project['trainingMethod']:
                    if 'i-00000d13' in self.instanceName:
                        continue
                    autolabeling_project = self.dbClass.getAutoLabelingProjectByProjectId(project['id'])
                    if autolabeling_project and autolabeling_project.customAiStage == 1:
                        isForFree = True
                    model = self.trainingClass.trainingObjectDetection(project, model, df, localFilePath, configFile, instancesUser)
                elif 'cycle_gan' in project['trainingMethod']:

                    if 'i-00000d13' in self.instanceName:
                        continue

                    learn = self.trainingClass.trainingCycleGan(project, model, df, localFilePath, configFile, instancesUser)
                elif 'recommender' in project['trainingMethod']:
                    learn = self.trainingClass.trainingRecommender(project, model, df, localFilePath, str_cols, dep_var, instancesUser)
                elif 'text' in project['trainingMethod']:

                    print("/home/ubuntu/")

                    learn, workDir = self.trainingClass.trainingText(project, model, df, localFilePath, str_cols, dep_var, instancesUser)

                    learn.quantize(input=f"{workDir}{model['id']}/train.bin", epoch=10000, lr=0.4)

                    model_file_path = self.trainingClass.saveTextModel(project, model, learn, self.utilClass.bucket_name)

                    self.autoMLanalysingClass.updateTextResult(learn, model, model_file_path, df, num_cols, str_cols, project, workDir)

                else:

                    print("training normal")

                    learn, realTrainingMethod, modelName = self.training(project, model, df, num_cols, str_cols, dep_var, localFilePath, instancesUser)

                    model_file_path = self.trainingClass.saveModel(project, model, learn, self.utilClass.bucket_name, modelName=modelName)

                    self.dbClass.updateModel(model['id'], {
                        "status": 100,  # TODO : TEST 용
                        "statusText": "100 : 모델 학습이 완료되었습니다.",
                        "yClass": project.get('yClass'),
                        "filePath": model_file_path
                    })

                    if 'avg_diff_' in dep_var:
                        print("avg_diff_")
                    else:
                        try:
                            # todo : preds 실제 예측한 값, y는 실제 데이터
                            feature_importance_array, yClass = self.autoMLanalysingClass.updateResult(model, model_file_path, df, num_cols, str_cols, project, dep_var, learn=learn)
                        except:
                            print(traceback.format_exc())
                            feature_importance_array, yClass = None, None
                            pass

                        df_for_test = df.iloc[:math.ceil(len(df) * 0.8)].copy()

                        if feature_importance_array:

                            important_df = df_for_test[feature_importance_array].copy()
                            important_df[dep_var] = df_for_test[dep_var]

                            print("prescriptionAnalytics normal")

                            try:
                                print("project['trainingMethod']")
                                print(project['trainingMethod'])
                                if project['trainingMethod'] not in 'image' and 'time' not in project['trainingMethod']:
                                    prescriptionAnalyticsInfo = self.trainingClass.prescriptionAnalytics(project, model, learn,
                                                                                                          df, num_cols,
                                                                                                          str_cols, dep_var,
                                                                                                          feature_importance_array,
                                                                                                          yClass,
                                                                                                          realTrainingMethod)
                                    self.dbClass.updateModel(model['id'],
                                                             {"prescriptionAnalyticsInfo": prescriptionAnalyticsInfo})
                            except:
                                print("fail3")
                                print(traceback.format_exc())
                                pass

                    try:
                        shutil.rmtree(f"./temp/model_analytics_images_{model['id']}")
                    except:
                        pass
                    try:
                        del learn
                        gc.collect()
                        torch.cuda.empty_cache()
                    except:
                        pass

                    # learn.destroy()

                projectRaw = self.dbClass.getOneProjectById(project['id'], raw=True)
                new_success_cnt = projectRaw.successCount + 1 if projectRaw.successCount else 1
                self.dbClass.updateProject(projectRaw.id, {
                    'successCount': new_success_cnt
                })
                if not projectRaw.isSentFirstModelDoneEmail:
                    projectRaw.isSentFirstModelDoneEmail = True
                    projectRaw.save()
                    try:
                        self.utilClass.sendEmailAfterFinishingTrainingFirstModel(project, self.dbClass.getOneUserById(project['user']))
                    except:
                        print("Fail to send an email")
                        pass

                self.utilClass.sendSlackMessage(f"{instanceId} : 학습을 완료하였습니다. "
                                                f"(Project ID: {project['id']}, Model ID: {model['id']} )", daemon=True)
                self.finishProject(project)
                endTime = datetime.datetime.now()
                print("endTime : " + str(endTime))
                print("durationTime : " + str(endTime - startTime))
                durationTime = endTime - startTime
                self.dbClass.updateModel(model['id'], {
                    "finished_at": endTime,
                    "duration": durationTime.seconds,
                })

                if model['status'] != 99:
                    self.dbClass.updateModel(model['id'], {
                        "status": status,
                    })
                else:
                    self.dbClass.updateModel(model['id'], {
                        "status": 99,
                    })
                    
                user = self.dbClass.getOneUserById(project['user'], raw=True)
                user.trainingSecondCount = user.trainingSecondCount + durationTime.seconds
                if self.utilClass.configOption != "enterprise":
                    price = round(self.dbClass.get_price_with_pricing_name('OD', raw=True).trainingPerHour * durationTime.seconds / 60 / 60, 3)
                    if not isForFree:
                        user.usedPrice = user.usedPrice + price

                user.save()

            except OSError:
                print("OSError")
                print(traceback.format_exc())
                if 'Cannot allocate memory' in str(traceback.format_exc()):
                    instancesUser.isDeleted = True
                    instancesUser.save()
                    self.countError(model, 'errorCountMemory')
                    # self.dbClass.updateInstance(instancesUser.instance_id, {"hasGpuError": True})
                    # instancesUser.delete_instance()
                    sys.exit()
                else:
                    self.countUnexpectError(model, project=project, instanceId=instanceId, instancesUser=instancesUser)
                pass
            except RuntimeError:
                print("RuntimeError")
                print(traceback.format_exc())
                if 'CUDA out of memory' in str(traceback.format_exc()):
                    instancesUser.isDeleted = True
                    instancesUser.save()
                    # self.countError(model, 'errorCountMemory')
                    sys.exit()
                elif 'CUDA' in str(traceback.format_exc()):
                    # self.countError(model, 'errorCountMemory')
                    instancesUser.isDeleted = True
                    instancesUser.save()
                    sys.exit()
                if 'weight' in str(traceback.format_exc()):
                    instancesUser.isDeleted = True
                    instancesUser.save()
                    sys.exit()
                else:
                    self.countUnexpectError(model, project=project, instanceId=instanceId, instancesUser=instancesUser)
                pass
            except peewee.OperationalError:
                skyhub.connect(reuse_if_open=True)
                pass
            except KeyboardInterrupt:
                instancesUser.isDeleted = True
                instancesUser.save()
                sys.exit()
                pass
            except:
                instancesUser.isDeleted = True
                instancesUser.save()
                self.countUnexpectError(model, project=project, instanceId=instanceId, instancesUser=instancesUser)
                pass

            if self.utilClass.configOption != "enterprise":
                try:
                    shutil.rmtree(f"./models/{model['id']}/")
                except:
                    pass

            try:
                gc.collect()
                torch.cuda.empty_cache()
            except:
                pass

            project_status = self.finishProject(project)
            if project_status is None:
                break
            if project_status in [0, -1, 99]:
                instancesUser.isDeleted = True
                instancesUser.save()
                sys.exit()

        if self.instancesUser:
            self.instancesUser.isDeleted = True
            self.instancesUser.save()
            self.instancesUser = None

    def getImagePath(self, filePath):
        getFolderPath = os.path.splitext(filePath)[0]
        files = os.listdir(getFolderPath)
        folderName = ''
        matchedCSVfile = False
        for file in files:
            if '.csv' in file:
                matchedCSVfile = True
            if not '.' in file:
                folderName = file + "/"
        if matchedCSVfile:
            imagePath =  ".".join(filePath.split(".")[:-1])

        for file in os.listdir(f"{getFolderPath}/{folderName}"):
            if '.csv' in file:
                matchedCSVfile = True
                imagePath = ".".join(filePath.split(".")[:-1]) + f"/{folderName}"

        if matchedCSVfile:
            return imagePath
        else:
            return getFolderPath

    def isModelForSkipping(self, model):

        if model.get("status") != 0:
            return True

        projectId = model['project']
        if not projectId:
            model.delete_instance()
            print(f"no project anymore - delete model {str(model['id'])}")
            return True
        return False

    def updateStatusForTraining(self, project, model, instancesUser, instanceId):

        print(f"train project {str(project['id'])}")
        print(f"train model {str(model['id'])}")
        self.dbClass.updateModelStatusById(model['id'], 1, "1 : 모델 학습이 시작되었습니다.")
        # if project['status'] > 41:
        #     self.dbClass.updateProjectStatusById(project['id'], 61, "61 : 테스트 모델 학습이 시작되었습니다.")
        # elif project['status'] > 11:
        #     self.dbClass.updateProjectStatusById(project['id'], 31, "31 : 빠른 모델 학습이 시작되었습니다.")
        # else:
        #     self.dbClass.updateProjectStatusById(project['id'], 11, "11 : 모델 학습이 시작되었습니다.")

        self.utilClass.sendSlackMessage(f"{instanceId} : 학습을 시작하였습니다. "
                                        f"(Project ID: {project['id']}, Model ID: {model['id']} )", daemon=True)

    def training(self, project, model, df, num_cols, str_cols, dep_var, localFilePath, instancesUser):

        if not project['trainingMethod']:
            learn, realTrainingMethod, modelName = self.trainingClass.trainingNormal(model, df, num_cols, str_cols, dep_var, project, instancesUser)
        elif 'normal' in project['trainingMethod']:
            learn, realTrainingMethod, modelName = self.trainingClass.trainingNormal(model, df, num_cols, str_cols, dep_var, project, instancesUser)
        elif project['trainingMethod'] in 'image':
            learn, realTrainingMethod, modelName = self.trainingClass.trainingImage(model, df, localFilePath, project, instancesUser)
        else:
            learn, realTrainingMethod, modelName = self.trainingClass.trainingNormal(model, df, num_cols, str_cols, dep_var, project, instancesUser)

        if not learn:
            raise ("learn not exist.")

        return learn, realTrainingMethod, modelName

    def countError(self, model, param):
        print(f"Model ID : {str(model['id'])}")
        print(f"Project ID : {str(model['project'])}")
        print(f"ERROR TYPE : {param}")
        self.dbClass.updateModel(model['id'], {
            param: model[param] + 1 if model[param] else 1
        })
        self.dbClass.updateProject(model['project'], {
            param: self.dbClass.getOneProjectById(model['project'])[param] + 1 if self.dbClass.getOneProjectById(model['project'])[param] else 1
        })
        pass

    def countUnexpectError(self, model, project={}, instanceId=None, instancesUser=None):

        print(traceback.format_exc())
        self.countError(model, 'errorCountNotExpected')
        self.utilClass.sendSlackMessage(f"유저 id: {project.get('user')}, 프로젝트 id: {project.get('id')}, 모델 id: {model.get('id')}", trainingError=True)
        self.utilClass.sendSlackMessage(f"프로젝트 name: {project.get('projectName')}, 모델 name: {model.get('name')}", trainingError=True)
        self.utilClass.sendSlackMessage(f"instanceId: {str(instanceId)}, instancesUser ps_id: {str(instancesUser.ps_id)}", trainingError=True) if instancesUser else None
        self.utilClass.sendSlackMessage(str(traceback.format_exc()), trainingError=True)


    def get_ds2data_url(self, file_name, labelproject_id=None, project_id=None):
        if labelproject_id:
            result = self.dbClass.getOneLabelprojectFileByCondition({'$and': [{'fileName': file_name}, {'labelproject': labelproject_id}]})
        elif project_id:
            result = self.dbClass.getOneProjectFileByCondition({'$and': [{'fileName': file_name}, {'project': project_id}]})
        else:
            raise ex.NormalEx()

        if result.get('s3key'):
            return result['s3key']
        else:
            raise ex.NormalEx()

    def createModels(self, project, isTest=False):
        iterations = {}
        option = project['option']
        labelType = project.get("labelType")
        trainingMethod = project['trainingMethod']

        if 'speed' in option:
            split = self.splitingClass.getSplitFast()
            name = "Fast Training Model"
            description = "빠른 학습 모델"
        elif 'autolabeling' in option:
            split = self.splitingClass.getAutoLabeling()
            name = "Auto Labeling custom Model"
            description = "Auto Labeling custom Model"
        elif 'test' in option:
            split = self.splitingClass.getSplitTest()
            name = "Test Training Model"
            description = "테스트 모델"
        elif 'labeling' in option:
            split = self.splitingClass.getSplitLabeling()
            name = "Labeling Training Model"
            description = "라벨링 모델"
        elif 'custom' in option:
            model_name = project['algorithm']
            model_count = 1

            hyper_params = self.dbClass.get_train_params_by_project_id(project['id'])

            for hyper_param in hyper_params:
                del hyper_param['project']
                del hyper_param['user']
                hyper_param_id = hyper_param['id']
                data = {'project': project['id'], 'name': f'{model_name}_{str(model_count).zfill(3)}',
                        'status': 0, 'statusText': '0: 모델 생성 준비중입니다.', 'progress': 0, 'hyper_param_id': hyper_param_id}

                self.dbClass.createModel(data)
                model_count += 1

            return
        else:
            split = self.splitingClass.getSplit()
            name = "Training Model"
            description = "학습 모델"

        # if labelType:
        #     if labelType == "box":
        #         split['objectDetectionModel'] = self.boxModel
        #     if labelType == "polygon":
        #         split['objectDetectionModel'] = self.polygonModel

        if 'normal' in trainingMethod:
            iterations = {
                'epoch': split['epoch'],
                'learningRateFromFit': split['learningRateFromFit'],
                'layerDeep': split['layerDeep'],
                'layerWidth': split['layerWidth'],
                'dropOut': split['dropOut'],
            }
        if 'text' in trainingMethod:
            iterations = {
                'epoch': split['epoch'],
                'learningRateFromFit': split['learningRateFromFit'],
                'layerWidth': split['layerWidth'],
                'usingBert': split['usingBert'],
                'lossFunction': split['lossFunction'],
            }
        if 'object_detection' in trainingMethod:
            iterations = {
                'epoch' : split['epoch'],
                'objectDetectionModel': split['objectDetectionModel'],
                'learningRateFromFit': split['learningRateFromFit'],
                'visionModel': [""],
            }
        if 'image' in trainingMethod:
            iterations = {
                'epoch': split['epoch'],
                'learningRateFromFit': split['learningRateFromFit'],
                'visionModel': split['visionModel']
            }
        if 'cycle_gan' in trainingMethod:
            iterations = {
                'epoch': [100],
                'learningRateFromFit': self.splitingClass.getSplitFast()['learningRateFromFit'],
                'layerDeep': self.splitingClass.getSplitFast()['layerDeep'],
                'layerWidth': self.splitingClass.SplitFast()['layerWidth'],
                'dropOut': self.splitingClass.getSplitFast()['dropOut'],
                'visionModel': [""],
            }
        if 'time_series' in trainingMethod:
            iterations = {
                "epoch": [10],
                "learningRateFromFit": [0.1, 1, 10],
                "layerDeep": [100, 200],
                "layerWidth": [200],
                'dropOut': [0.8],
                'timeSeriesTrainingRow': split['timeSeriesTrainingRow'],
            }

        user = self.dbClass.get_user_by_id(project['user'])
        isTest = user['isTest']

        # if isTest:
            # iterationsForTest = {'epoch': [1,2]}
            # for key, value in iterations.items():
            #     if not 'epoch' in key:
            #         iterationsForTest[key] = [value[0]]
            # iterations = iterationsForTest
        i = 1
        randomNumArray = []
        print(f"start project : {project['id']}, {project['projectName']}")
        try:
            modelInfos = []
            for lossFunctionIndex, lossFunction in enumerate(iterations.get("lossFunction", [None])):
                for usingBertIndex, usingBert in enumerate(iterations.get("usingBert", [None])):
                    for epochIndex, epoch in enumerate(iterations.get("epoch", [None])):
                        for visionModelIndex, visionModel in enumerate(iterations.get("visionModel", [None])):
                            for learningRateFromFitIndex, learningRateFromFit in enumerate(iterations.get("learningRateFromFit", [None])):
                                for layerDeepIndex, layerDeep in enumerate(iterations.get("layerDeep", [None])):
                                    for layerWidthIndex, layerWidth in enumerate(iterations.get("layerWidth", [None])):
                                        for dropOutIndex, dropOut in enumerate(iterations.get("dropOut", [None])):
                                            for objectDetectionModelIndex, objectDetectionModel in enumerate(iterations.get("objectDetectionModel", [None])):
                                                for timeSeriesTrainingRowIndex, timeSeriesTrainingRow in enumerate(iterations.get("timeSeriesTrainingRow", [None])):
                                                    if 'recommender' in trainingMethod and i > 1:
                                                        break
                                                    randomNum = random.randint(0, 10000)
                                                    while True:
                                                        if randomNum in randomNumArray:
                                                            randomNum = random.randint(0, 10000)
                                                        else:
                                                            randomNumArray.append(randomNum)
                                                            break
                                                    modelInfo = {
                                                        "name": f"{name} {randomNum}",
                                                        "description": f"{description} {randomNum}",
                                                        "status": 0,
                                                        "statusText": "0: 모델 생성 준비중입니다.",
                                                        "progress": 0,
                                                        "project": project['id'],
                                                        "epoch": epochIndex,
                                                        "objectDetectionModel": objectDetectionModelIndex,
                                                        "timeSeriesTrainingRow": timeSeriesTrainingRowIndex,
                                                        "learningRateFromFit": learningRateFromFitIndex,
                                                        "layerDeep": layerDeepIndex,
                                                        "layerWidth": layerWidthIndex,
                                                        "dropOut": dropOutIndex,
                                                        "visionModel": visionModelIndex,
                                                        "lossFunction": lossFunctionIndex,
                                                        "usingBert": usingBertIndex,
                                                        "token": uuid4(),
                                                        "isParameterCompressed": True,
                                                    }
                                                    modelInfos.append(modelInfo)
                                                    i += 1
            if modelInfo and 'text' in trainingMethod:
                modelInfo['name'] = modelInfo['name'] + "_B"
                modelInfo['usingBert'] = 1
                modelInfo['epoch'] = 0
                modelInfo['lossFunction'] = 0
                modelInfo['token'] = uuid4()
                modelInfos.append(modelInfo)

            try:
                if os.path.exists("/root/ds2ai/test_mode.txt"):
                    with open("/root/ds2ai/test_mode.txt" , 'r') as r:
                        modelInfos = modelInfos[:int(r.readlines()[0])]
            except:
                pass

            for num, modelInfo in enumerate(modelInfos):
                if isTest and num > 10:
                    break
                print(modelInfo)
                self.dbClass.createModel(modelInfo) if not project.get("test") else None
        except:
            self.utilClass.sendSlackMessage(str(traceback.format_exc()), daemonError=True)
            skyhub.connect(reuse_if_open=True)
            pass

if __name__ == "__main__":
    Daemon(testMode=False).run()
