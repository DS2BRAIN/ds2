# -*- coding: utf-8 -*-
import datetime
import time
import traceback

from bson import json_util
from playhouse.shortcuts import model_to_dict
from starlette.status import HTTP_200_OK
import os
from src.manage_machine_learning import ManageMachineLearning
from src.util import Util
from models.helper import Helper, rd
from script.daemon import Daemon
import sys
import random
import platform

from fastai.text.all import *
from fastai.vision.all import *
from fastai.tabular.all import *
from fastai.basics import *

# if platform.system() != "Darwin":
#     from fastai.tabular import *
#     from fastai.basics import *

class DaemonAsyncTask():

    def __init__(self, testMode=False):

        self.utilClass = Util()
        self.dbClass = Helper(init=True)
        self.s3 = self.utilClass.getBotoClient('s3')
        self.testMode = False
        self.predictClass = None
        self.processingLabelingClass = None
        from src.managePredict import ManagePredict
        self.predictClass = ManagePredict()
        self.analysingClass = None

        if os.path.exists('./src/training/predict.py'):
            from src.training.processingLabeling import ProcessingLabeling
            from src.training.processing import Processing
            from src.training.analysing import Analysing
            self.processingLabelingClass = ProcessingLabeling()
            self.processingClass = Processing()
            self.analysingClass = Analysing()

        self.daemonClass = Daemon()
        self.machine_learning_class = ManageMachineLearning()


        for argv in sys.argv:
            if 'test' in argv:
                self.testMode = True

        try:
            if os.path.exists("/home/ubuntu/aimaker-backend-deploy"):
                instanceId = requests.get("http://169.254.169.254/latest/meta-data/instance-id", timeout=1).text
                r = requests.get("http://169.254.169.254/latest/dynamic/instance-identity/document")
                response_json = r.json()
                region_name = response_json.get('region')
                opsId = None
                grouptype = ""
                ec2 = self.utilClass.getBotoClient('ec2', region_name=region_name)
                allInstances = ec2.describe_instances()
                for instanceRaw in allInstances.get("Reservations", []):
                    instances = instanceRaw.get("Instances", [{}])
                    for instance in instances:
                        if instanceId == instance.get("InstanceId", None):
                            notifyData = {"execute_from": "backend", "instanceId": instance['InstanceId'],
                                          "action": "create_backend_main", "region": region_name}
                            tags = instance.get("Tags", [])
                            for tag in tags:
                                if tag.get("Key") == "opsId":
                                    opsId = tag.get("Value")
                                    model = self.dbClass.getOneLastestOpsModelByOpsProjectId(opsId)
                                    s3Url = model.filePath
                                    print("opsId Matched")
                                    print(os.getcwd())
                                    print(s3Url)
                                    print("/".join(s3Url.split("/")[3:]))
                                    localFilePath = f"{self.utilClass.save_path}/" + s3Url.split("/")[-1]
                                    if not os.path.isfile(localFilePath):
                                        self.utilClass.getBotoClient('s3').download_file(self.utilClass.bucket_name,
                                                                                    "/".join(s3Url.split("/")[3:]),
                                                                                    localFilePath)
                                    notifyData["ops_project"] = opsId

                                if tag.get("Key") == "grouptype":
                                    grouptype = tag.get("Value")

                            self.dbClass.createInstanceLog(notifyData)
                            # utilClass.sendSlackMessage(
                            #     f"{region_name} {instanceId} : 백엔드 서버를 시작합니다. {opsId}",
                            #     server_status=True)

                if opsId:
                    sys.exit()
                if "asynctask" not in grouptype:
                    sys.exit()
        except:
            pass


    def run(self):


        # if self.utilClass.configOption == 'enterprise':
        #     self.utilClass.isValidKey(self.dbClass.getAdminKey())

        # for task in self.dbClass.getAsnycTasksTemp():
        #     print("runsttTemp")
        #     print(task.id)
        #     time.sleep(round(random.uniform(1, 6), 3))
        #     task = self.dbClass.getAsnycTasksById(task.id)
        #     self.predictSpeechClass.runsttTemp(task)


        isRunningStt = False
        for index, argv in enumerate(sys.argv):
            if 'stt' in argv:
                isRunningStt = True
                from src.creating.spliting import Spliting
                self.splitingClass = Spliting()
                self.splitingClass.runstt()
                break

            if "runtalknoteinsight" in argv:
                from src.creating.spliting import Spliting
                self.splitingClass = Spliting()
                self.splitingClass.runTalknoteInsight()
                return

        # if not torch.cuda.is_available():
        #     return
        print("os.environ.get('DS2_TASK_ID')")
        print(os.environ.get('DS2_TASK_ID'))

        if os.environ.get('DS2_TASK_ID'):
            task = self.dbClass.getAsnycTasksById(int(os.environ.get('DS2_TASK_ID')))
            self._run(task, is_selected=True)
        elif len(sys.argv) == 5:
            task = self.dbClass.getAsnycTasksById(int(sys.argv[4]))
            self._run(task, is_selected=True)
        else:
            for task in self.dbClass.getAsnycTasks():
                self._run(task)

        try:
            if os.path.exists("/home/ubuntu/aimaker-backend-deploy"):
                instanceId = requests.get("http://169.254.169.254/latest/meta-data/instance-id", timeout=1).text
                r = requests.get("http://169.254.169.254/latest/dynamic/instance-identity/document")
                response_json = r.json()
                region_name = response_json.get('region')
                ec2 = self.utilClass.getBotoClient('ec2', region_name=region_name)
                allInstances = ec2.describe_instances()
                for instanceRaw in allInstances.get("Reservations", []):
                    instances = instanceRaw.get("Instances", [{}])
                    for instance in instances:
                        if instanceId == instance.get("InstanceId", None):
                            tags = instance.get("Tags", [])
                            for tag in tags:
                                if tag.get("Key") == "opsId":
                                    # exit for ops server
                                    sys.exit()
        except:
            pass

        # if self.utilClass.configOption == "enterprise":
        #     time.sleep(60)
        #     self.run()

    def _run(self, task, is_selected=False):

        # isRunningStt = False
        # for argv in sys.argv:
        #     if 'stt' in argv:
        #         isRunningStt = True
        #         break

        if "runstt" in task.taskType:
            return
        elif 'exportCoco' in task.taskType:
            return
        print("not stt")
        startTime = datetime.now()
        time.sleep(round(random.uniform(1, 6), 3))

        task = self.dbClass.getAsnycTasksById(task.id)
        task_before_status = task.status

        if self.testMode:
            if task.status == 100 and not is_selected:
                return
        else:
            if task.status == 100:
                return

        task.status = 1
        task.save()
        print(f'task ID : {task.id}')
        autolabelingproject = None

        try:
            code, response, localFilePath, localFile = HTTP_200_OK, None, None, None

            if task.inputFilePath:
                s3Url = self.utilClass.unquote_url(task.inputFilePath)
                localFilePath = f"{self.utilClass.save_path}/" + s3Url.split("/")[-1]
                if not os.path.isfile(localFilePath):
                    origin_file_path = "/".join(s3Url.split("/")[3:])
                    if self.utilClass.configOption == "enterprise":
                        origin_file_path = s3Url
                    self.s3.download_file(self.utilClass.bucket_name, origin_file_path, localFilePath)
                with open(localFilePath, 'rb') as r:
                    localFile = r.read()
            user = self.dbClass.getOneUserById(task.user, raw=True)

            if "train" in task.taskType or 'customAi' in task.taskType or 'verify' in task.taskType:
                self.daemonClass.run(project_id=task.project)
                task.status = 100
                code = 200
            if "runAll" in task.taskType:
                code, response = self.machine_learning_class.predict_all(user.appTokenCode, user.id, localFile, localFilePath, task.model, None, return_type="file")
                task.status = 100
                print(code)
                print(response)
                file_path_base = f"user/{task.user}/{response.path.split('temp/')[-1]}"
                self.s3.upload_file(response.path, self.utilClass.bucket_name, file_path_base)
                if self.utilClass.configOption == "enterprise":
                    task.outputFilePath = f"/{file_path_base}"
                else:
                    task.outputFilePath = f"https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{file_path_base}"
                    os.remove(response.path)

            elif "runMovie" in task.taskType:
                print('runMovie started')
                isMarket = False
                if task.marketproject:
                    isMarket = True

                code, response = self.predictClass.runMovie(task.model, localFile, localFilePath, user.appTokenCode, user.id
                        , isStreaming=False, marketproject=task.marketproject, movie_start_time=task.movieStartTime,
                        isMarket = isMarket, task=task, file_creation_time=task.file_creation_time)
                task.status = 100
                print('response')
                print(response)

                # self.s3.upload_file(response, self.utilClass.bucket_name,f"user/{task.user}/{response.split('temp/')[-1]}")
                # task.outputFilePath = f"https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{task.user}/{response.split('temp/')[-1]}"
                task.outputFilePath = f"user/{task.user}/{response.split('temp/')[-1]}"
                os.remove(response)
                pass
            elif "runAnalyzing" in task.taskType:

                project = self.dbClass.getOneProjectById(task.project)
                modelRaw = self.dbClass.getOneModelById(task.model, raw=True)
                model = modelRaw.__dict__['__data__']

                print(f"modelID : {modelRaw.id}")

                modelPath = self.downloadModel(task.inputFilePath)

                if project.get('filePath'):
                    localFilePath = self.processingClass.downloadData(project)
                    df, num_cols, str_cols, dep_var, configFile = self.processingClass.preProcessing(project,
                                                                                                     localFilePath,
                                                                                                     isProcessed=True)
                    # copyfile(localFilePath, f"/tmp/{localFilePath.split('/')[-1]}")
                else:
                    localFilePath, df, num_cols, str_cols, dep_var, configFile, project = self.processingClass.prepareData(
                        project)

                procs = [FillMissing, Categorify, Normalize]

                splits = RandomSplitter()(range_of(df))

                data = TabularDataLoaders.from_df(df, path=f"{os.getcwd()}/models/{model['id']}/", cat_names=str_cols,
                                                  cont_names=num_cols, procs=procs, bs=64
                                                  , y_names=dep_var, y_block=RegressionBlock if 'regression' in project['trainingMethod'] else CategoryBlock, splits=splits,
                                                  valid_idx=list(range(round(len(df) * 0.8), len(df))))

                if project.get("isParameterCompressed"):
                    learn = tabular_learner(data, layers=[modelRaw.layerDeep, modelRaw.layerWidth], metrics=accuracy)
                else:
                    learn = tabular_learner(data, layers=[100, 200], metrics=accuracy)

                learn = load_learner(modelPath)

                modelFilePath = self.processingClass.saveModel(project, model, learn, self.utilClass.bucket_name)

                print(f"updateModelFromColab loaded : None")

                feature_importance_array, yClass = self.analysingClass.updateResult(model, modelFilePath, df,
                                                                                    num_cols,
                                                                                    str_cols, project, dep_var, learn=learn)

                print(f"updateModelFromColab updateResult : None")
                realTrainingMethod = project['trainingMethod']
                try:
                    if project['trainingMethod'] not in 'image':
                        prescriptionAnalyticsInfo = self.analysingClass.prescriptionAnalytics(project, model, learn,
                                                                                              df,
                                                                                              num_cols, str_cols,
                                                                                              dep_var,
                                                                                              feature_importance_array,
                                                                                              yClass,
                                                                                              realTrainingMethod)
                        self.dbClass.updateModel(modelRaw.id, {
                            "prescriptionAnalyticsInfo": prescriptionAnalyticsInfo
                        })
                except:
                    print("fail3")
                    print(traceback.format_exc())
                    pass

                print(f"updateModelFromColab prescriptionAnalytics finished : None")
                df = df.iloc[:math.ceil(round(len(df) * 0.8))].copy()

                try:
                    important_df = df[feature_importance_array].copy()
                    important_df[dep_var] = df[dep_var]
                    dl = learn.dls.test_dl(df.copy(), with_labels=True, bs=64,
                                           num_workers=1, shuffle=False, drop_last=False)
                    a = learn.get_preds(dl=dl)
                    a1 = a[1]
                    important_df["__predict_value__" + dep_var] = a1.tolist()
                    print(important_df.head())
                    # AutoVisClass = AutoVisualizing(model=model)
                    # dft = AutoVisClass.AutoViz("", "", dep_var, important_df, header=0, verbose=2)
                    shutil.rmtree(f"./temp/model_analytics_images_{model['id']}")
                except:
                    print("fail4")
                    print(traceback.format_exc())
                    pass

                print(f"updateModelFromColab autoviz finished : None")

                # learn.purge()
                self.dbClass.updateModel(modelRaw.id, {
                    "filePath": modelFilePath,
                    "status": 100,
                })

                self.dbClass.updateUserCumulativeProjectCount(project['user'], 1)
                self.dbClass.updateProjectStatusById(project['id'], 100, "100 : 프로젝트 개발이 완료되었습니다.")
                task.status = 100
            elif "autoLabeling" in task.taskType:

                autolabelingproject = self.dbClass.getAutoLabelingProjectById(task.autolabelingproject) if task.autolabelingproject else None

                if autolabelingproject:
                    if "custom" == autolabelingproject.autolabelingAiType:
                        project = self.dbClass.getOneProjectById(autolabelingproject.projectId)
                        model = self.dbClass.getOneModelById(autolabelingproject.modelId)
                        self.processingLabelingClass.startAutoLabeling(user, task, project=project, model=model, autolabelingproject=autolabelingproject)

                    elif "general" == autolabelingproject.autolabelingAiType or "information" == autolabelingproject.autolabelingAiType:

                        self.processingLabelingClass.startAutoLabeling(user, task, autolabelingproject=autolabelingproject)

                    if task.status == 1:
                        task.status = 100

                else:
                    project = self.dbClass.getOneProjectById(task.project)

                    if "object_detection" in project.get("trainingMethod", ""):
                        if task.model:
                            model = self.dbClass.getOneModelById(task.model)
                            self.processingLabelingClass.startAutoLabeling(user, task, project=project, model=model)
                        else:
                            if project['status'] == 100:
                                model = self.dbClass.getBestAccuracyModelByProjectId(task.project)
                                self.processingLabelingClass.startAutoLabeling(user, task, project=project, model=model)
                                task.status = 100
                    else:
                        code, response =  self.predictClass.runAll(task.model, localFile, localFilePath,
                                                                  user.appTokenCode, user.id, isForText=True,
                                                                  isForLabeling=True)
                        task.status = 100
                        self.s3.upload_file(response.path, self.utilClass.bucket_name,
                                            f"user/{task.user}/{response.path.split('temp/')[-1]}")
                        task.outputFilePath = f"https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{task.user}/{response.path.split('temp/')[-1]}"
                        os.remove(response.path)

                if code != HTTP_200_OK:
                    self.dbClass.updateAutoLabelingFileByLabelprojectIdAndLimit(autolabelingproject.labelprojectId)



            elif "runLabeling" in task.taskType:
                code, response = self.predictClass.runAll(task.model, localFile, localFilePath,
                                                          user.appTokenCode, user.id, isForText=True,
                                                          isForLabeling=True)
                task.status = 100
                self.s3.upload_file(response.path, self.utilClass.bucket_name,
                                    f"user/{task.user}/{response.path.split('temp/')[-1]}")
                task.outputFilePath = f"https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{task.user}/{response.path.split('temp/')[-1]}"
                if self.utilClass.configOption != "enterprise":
                    os.remove(response.path)
                pass

            if code != HTTP_200_OK:
                task.status = 99
                if response:
                    task.statusText = response.get("message")
            try:
                os.remove(localFilePath)
            except:
                pass
            task.isChecked = 0
            task.save()

            if rd:
                print("json_util.default")
                task_info = task.__dict__['__data__']
                del task_info['created_at']
                del task_info['updated_at']
                print(task.__dict__['__data__'])
                rd.publish("broadcast", json.dumps(task.__dict__['__data__']), default=json_util.default, ensure_ascii=False)

        except:
            print(traceback.format_exc())
            self.utilClass.sendSlackMessage(f"에러가 발생하였습니다. 유저 id: {task.user}, 비동기작업 id: {task.id}"
                                            f" {str(traceback.format_exc())})", daemonError=True)
            task.status = 99
            task.isChecked = 0
            if "autoLabeling" in task.taskType and autolabelingproject:
                self.dbClass.rollback_auto_labeling_file_by_label_project_id(autolabelingproject.labelprojectId)
                autolabelingproject.status = 99
                autolabelingproject.save()
            pass
        if task.status != 100:
            task.status = 99
        if task.taskType in ("train", "customAi", "verify"):
            task.status = task_before_status

        endTime = datetime.now()
        print("durationTime : " + str(endTime - startTime))
        durationTime = endTime - startTime
        task.duration = durationTime.seconds
        task.save()

    def sum_digits(self, digit):
        return sum(int(x) for x in digit if x.isdigit())


    def downloadModel(self, model, GAN=False):
        if isinstance(model, str):
            s3Url = self.utilClass.unquote_url(model)
        else:
            s3Url = self.utilClass.unquote_url(model['filePath'])
        print(os.getcwd())
        print(s3Url)
        print("/".join(s3Url.split("/")[3:]))
        localFilePath = f"{self.utilClass.save_path}/" + s3Url.split("/")[-1]
        if not os.path.isfile(localFilePath):
            if self.utilClass.configOption != 'enterprise':
                # wget.download(s3Url, out=self.utilClass.save_path)
                self.s3.download_file(self.utilClass.bucket_name, "/".join(s3Url.split("/")[3:]), localFilePath)
            else:
                self.s3.download_file(self.utilClass.bucket_name, s3Url, localFilePath)

        if GAN:
            localFilePath_G_B = localFilePath.replace('G_A','G_B')
            if not os.path.isfile(localFilePath_G_B):
                self.s3.download_file(self.utilClass.bucket_name, "/".join(s3Url.split("/")[3:]), localFilePath_G_B)



        return localFilePath

if __name__ == "__main__" :
    daemonAsyncTask = DaemonAsyncTask()
    daemonAsyncTask.run()
# while True:
#     daemonAsyncTask.run()
    # time.sleep(15)
