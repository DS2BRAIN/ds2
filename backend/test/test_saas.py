# -*- coding: utf-8 -*-

import sys
import time

# sys.argv.append('workers')
sys.argv.append('dev')
a = sys.argv
from unittest import TestCase
import traceback
import requests
import json
from src.manageFile import ManageFile
from src.manageUser import ManageUser
from src.manageTask import ManageTask
from src.util import Util
from models import *
import pandas as pd
from models.helper import Helper

class TestCsvParse(TestCase):

    def setUp(self) -> None:
        super().setUp()

        self.utilClass = Util()
        self.ManageFileClass = ManageFile()
        self.manageUserClass = ManageUser()
        self.manageTaskClass = ManageTask()
        self.dbClass = Helper(init=True)
        skyhub.connect(reuse_if_open=True)
        print("테스트 시작되었습니다.")
        self.userArray = []
        self.projectArray = []

    @classmethod
    def tearDownClass(cls) -> None:
        print('tearDownClass entered')
        print('tearDownClass exited')

    def tearDown(self):
        super().tearDown()
        print("테스트 종료되었습니다.")
        # self.deleteTestRows()


    def test_case1(self):

        try:

            # self.setTestUserAndProject(userCount=2, projectCount=1, planOption='business', dyno=6)
            # self.setTestUserAndProject(userCount=6, projectCount=1, planOption='basic')

            print("테스트 환경 구축이 완료되었습니다.")

            for project in self.projectArray:
                self.checkProjectStausChanged(project)

        except KeyboardInterrupt:

            # self.deleteTestRows()

            pass


    # def test_case2(self):
    #
    #     try:
    #
    #         self.setTestUserAndProject(userCount=2, projectCount=2, planOption='business', dyno=4)
    #
    #     except KeyboardInterrupt:
    #
    #         self.deleteTestRows()
    #
    #         pass
    #
    #
    # def test_case3(self):
    #
    #     try:
    #
    #         self.setTestUserAndProject(userCount=2, projectCount=3, planOption='business', dyno=5)
    #
    #     except KeyboardInterrupt:
    #
    #         self.deleteTestRows()
    #
    #         pass
    #
    # def test_case8(self):
    #
    #     try:
    #
    #         self.setTestUserAndProject(userCount=1, projectCount=1, planOption='basic')
    #
    #     except KeyboardInterrupt:
    #
    #         self.deleteTestRows()
    #
    #         pass

    # def setTestUserAndProject(self, userCount=1, projectCount=1, planOption='business', dyno=2, method="normal"):
    #
    #     for user in range(0, userCount):
    #
    #         user = self.manageUserClass.setTestUser(planOption= planOption, dynos=dyno)
    #         userId = user['user']['id']
    #
    #         self.userArray.append(self.dbClass.getOneUserById(userId, raw=True))
    #
    #         for project in range(0, projectCount):
    #
    #             project = self.manageTaskClass.setTestProject(userId, method=method)
    #             self.projectArray.append(project)


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