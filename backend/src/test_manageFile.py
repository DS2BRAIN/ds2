import traceback
from unittest import TestCase
from src.manageFile import ManageFile
from src.manageUser import ManageUser
from models.helper import Helper
from models import *
import pandas as pd

class TestManageFile(TestCase):

    def setUp(self) -> None:
        super().setUp()
        self.utilClass = Util()
        self.ManageFileClass = ManageFile()
        skyhub.connect(reuse_if_open=True)
        self.manageUserClass = ManageUser()
        self.dbClass = Helper(init=True)
        # userInfo = self.manageUserClass.setTestUser()
        # self.token, self.user = userInfo['jwt'], userInfo['user']
        # try:
        #     print(self.user['id'])
        # except:
        #     self.dbClass.deleteOneRow(self.dbClass.getOneUserById(self.user['id'], raw=True))
        #     self.manageUserClass.setTestUser()
        #     self.token, self.user = userInfo['jwt'], userInfo['user']
        #     pass




    def tearDown(self) -> None:
        super().tearDown()
        try:
            self.ManageFileClass.addObject(self.token, "file,content".encode(), 'file.csv', 'testfolder')
        except:
            print(traceback.format_exc())

            pass
        self.dbClass.deleteOneRow(self.dbClass.getOneUserById(self.user['id'], raw=True))


    def test_listObject(self):

        self.ManageFileClass.addObject(self.token, "file,content".encode(), 'file.csv', 'testfolder')
        response_code, result = self.ManageFileClass.listObject(self.token, folder="testfolder")
        self.assertIn('testfolder/file.csv', result[0]['Key'])

    def test_addObject(self):
        response_code, result = self.ManageFileClass.addObject(self.token, "file,content".encode(), 'file.csv', 'testfolder')
        data = pd.read_csv(result)
        self.assertEqual(data.columns.values[1], 'content')

    def test_addFolder(self):
        response_code, result = self.ManageFileClass.addFolder(self.token, 'testfolder2')


    def test_renameObject(self):
        self.ManageFileClass.addObject(self.token, "file,content".encode(), 'file.csv', 'testfolder')
        self.ManageFileClass.renameObject(self.token, oldName="testfolder/file.csv", newName="testfolder/file2.csv")
        response_code, result = self.ManageFileClass.listObject(self.token, folder="testfolder")
        self.assertIn('testfolder/file2.csv', result[0]['Key'])

    def test_deleteObject(self):
        self.ManageFileClass.addObject(self.token, "file,content".encode(), 'file.csv', 'testfolder')
