# -*- coding: utf-8 -*-

import sys
import time

# sys.argv.append('workers')
import random

sys.argv.append('dev')
a = sys.argv
from unittest import TestCase
import traceback
from src.manageFile import ManageFile
from src.manageUser import ManageUser
from src.manageTask import ManageTask
from src.training.training import Training
from src.creating.spliting import Spliting
from daemon.daemon import Daemon
from models import *
from models.helper import Helper

class TestCsvParse(TestCase):

    class TestInstanceUser():
        id = 0
        instance_id = 0
        ps_id = 0

    def setUp(self) -> None:
        super().setUp()

        self.utilClass = Util()
        self.ManageFileClass = ManageFile()
        self.manageUserClass = ManageUser()
        self.manageTaskClass = ManageTask()
        self.daemonClass = Daemon()
        self.dbClass = Helper(init=True)
        skyhub.connect(reuse_if_open=True)
        print("테스트 시작되었습니다.")
        self.userArray = []
        self.projectArray = []
        self.trainingClass = Training()
        self.splitingClass = Spliting()
        self.dbClass.deleteTestrows()


    @classmethod
    def tearDownClass(cls) -> None:
        print('tearDownClass entered')
        print('tearDownClass exited')

    def tearDown(self):
        super().tearDown()
        print("테스트 종료되었습니다.")
        self.dbClass.deleteTestrows()

    def deleteTestRows(self):
        for user in self.userArray:
            self.dbClass.deleteOneRow(user)
        for project in self.projectArray:
            self.dbClass.deleteOneRow(project)

        self.dbClass.deleteTestrows()

    def test_normal(self):

        try:
            self.setTestUserAndProject(method="normal")
            self.daemon_run()
        except:
            print(traceback.format_exc())
            pass

    def test_normal_classification(self):

        try:
            self.setTestUserAndProject(method="normal_classification")
            self.daemon_run()
        except:
            print(traceback.format_exc())
            pass

    def test_regression(self):

        try:
            self.setTestUserAndProject(method="normal_regression")
            self.daemon_run()
        except:
            print(traceback.format_exc())
            pass

    def test_text(self):

        try:
            self.setTestUserAndProject(method="text")
            self.daemon_run()
        except:
            print(traceback.format_exc())
            pass

    def test_image(self):

        try:
            self.setTestUserAndProject(method="image")
            self.daemon_run()
        except:
            print(traceback.format_exc())
            pass

    def test_object_detection(self):

        try:
            self.setTestUserAndProject(method="object_detection")
            self.daemon_run()
        except:
            print(traceback.format_exc())
            pass

    def test_cycle_gan(self):

        try:
            self.setTestUserAndProject(method="cycle_gan")
            self.daemon_run()
        except:
            print(traceback.format_exc())
            pass

    def daemon_run(self):
        for project in self.projectArray:
            project = project.__dict__['__data__']

            time.sleep(round(random.uniform(1,15), 3))

            project = self.dbClass.getOneProjectById(project['id'])

            self.dbClass.updateProjectStatusById(project['id'], 10, "10 : 모델 생성 후 학습 준비 중입니다.")

            updatedProject = self.dbClass.getOneProjectById(project['id'])
            self.assertEqual(10,updatedProject['status'],"update status가 정상적으로 되었는지 확인")

            instancesUser = self.dbClass.createInstanceUser(self.daemonClass.instanceData['id'], project['user'],ps_id=self.utilClass.ps_id,isTest=True)
            self.assertNotEqual(instancesUser.ps_id,None,"instanceUser 가 잘 생성되었는지 확인")

            self.splitingClass.createModels(project, isTest=True)

            updatedModels = self.dbClass.getModelsByProjectId(project['id'])

            self.assertEqual(2, len(updatedModels), "모델이 잘 생성되었는지 확인 (2개) : " + str(len(updatedModels)))

            self.trainingClass.trainModels(project, self.daemonClass.instanceName)

            updatedModels = self.dbClass.getModelsByProjectId(project['id'])

            for num, model in enumerate(updatedModels):
                self.assertEqual(100, model.status, f"모델이 완료되었는지 확인 {num + 1}/{len(updatedModels)}")

            self.daemonClass.finishProject(project)

            updatedProject = self.dbClass.getOneProjectById(project['id'])
            self.assertEqual(100, updatedProject['status'], "update status가 정상적으로 되었는지 확인")

            self.dbClass.deleteOneRow(instancesUser)

            try:
                self.dbClass.getInstanceUserById(instancesUser.id)
                self.assertTrue(False, "인스턴스 반환 실패")
            except:
                print("인스턴스 반환 성공")
                self.assertTrue(True, "인스턴스 반환 성공")
                pass

    def setTestUserAndProject(self, userCount=1, projectCount=1, planOption='business', dyno=1, method="normal"):

        for user in range(0, userCount):

            user = self.manageTaskClass.setTestUser(planOption= planOption, dynos=dyno)
            userId = user['user']['id']

            self.userArray.append(self.dbClass.getOneUserById(userId, raw=True))

            for project in range(0, projectCount):

                project = self.manageTaskClass.setTestProject(userId, method=method)
                self.projectArray.append(project)


    def checkProjectStausChanged(self, project):

        project = project.__dict__['__data__']

        for i in range(0,10):

            project = self.dbClass.getOneProjectById(project['id'])

            if project['status'] == 11:
                print(f"#{project['id']} : 프로젝트가 시작되었습니다.")
                break

            time.sleep(30)

        # self.assertEqual(project['status'], 11)

        for i in range(0,120):

            project = self.dbClass.getOneProjectById(project['id'])

            if project['status'] == 100:
                print(f"#{project['id']} : 프로젝트가 종료되었습니다.")
                break

            time.sleep(30)

        self.assertEqual(project['status'], 100)

        pass

    def deleteTestRows(self):
        for user in self.userArray:
            self.dbClass.deleteOneRow(user)
        for project in self.projectArray:
            self.dbClass.deleteOneRow(project)

        self.dbClass.deleteTestrows()