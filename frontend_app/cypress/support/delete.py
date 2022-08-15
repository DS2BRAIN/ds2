import requests
import json
from models.helper import Helper
import sys


class SettingUserInfo():
    def __init__(self):
        self.directBackEndURL = 'http://dslabaa.clickai.ai:1337/'
        self.backEndURL = 'https://api.clickai.ai/'
        self.dbClass = Helper(init = True)
        self.masterjwt = self.loginMaster('seungki.yeo@nectit.com', 'Eldptmfoqrmffhqjf1!!').get("jwt")
        self.masterHeader = {
            'Authorization': 'Bearer ' + self.masterjwt
        }

    def loginMaster(self, id, password):
        datas = {
            "identifier": id,
            "password": password
        }
        req = requests.post(self.directBackEndURL + 'admin/auth/local/', data=datas)
        return json.loads(req.text)


    def deleteDatas(self, user):
        projectId = []
        modelId = []

        self.dbClass.deleteDataconnectorsByUserId(user) # 테스트 계정의 데이터 커넥터 삭제
        self.dbClass.deleteSthreeFilesByUserId(user) # s3 데이터 삭제
        self.dbClass.deleteLabelsByUserId(user) # label 데이터 삭제
        self.dbClass.deleteAsyncTaskByUserId(user)

        [projectId.append(x) for x in self.dbClass.getAllProjectsByUserId(user)]
        [self.dbClass.deleteClassesByLabelProjectId(x) for x in self.dbClass.getAllLabelProjectsByUserId(user)]
        self.dbClass.deleteLabelProjectByUserId(user)
        [self.dbClass.deleteSubFolderByFolderId(x) for x in self.dbClass.getAllFolderByUserId(user)]
        self.dbClass.deleteFoldersByUserId(user)

        for id in projectId:
            [modelId.append(x) for x in self.dbClass.getModelsByProjectId(id)]
        for id in modelId:
            self.dbClass.deleteModelChartsByModelId(modelId)
            self.dbClass.deleteAnalyticsGraphsByModelId(modelId)
            
        [self.dbClass.deleteModelsByprojectId(x) for x in self.dbClass.getModelsByProjectId(id)]
        self.dbClass.deleteProjectsByUserId(user)

    def deleteUser(self, userId):
        req = requests.delete(self.directBackEndURL + 'users/' + str(userId), headers=self.masterHeader)
        return req.status_code

if __name__ == '__main__':
    userId = 161
    SettingUserInfo().deleteDatas(userId)
    SettingUserInfo().deleteUser(userId)