import requests
import json
import time
import sys


class SettingUserInfo():
    def __init__(self):
        self.backEndURL = 'https://api.clickai.ai/'
        self.directBackEndURL = 'https://api.clickai.ai:1337/'
        self.masterjwt = self.loginMaster('seungki.yeo@nectit.com', 'Eldptmfoqrmffhqjf1!!').get("jwt")
        self.masterHeader = {
            'Authorization': 'Bearer ' + self.masterjwt
        }
    def deleteUserByEmail(self, email):
        try:
            userRaw = requests.get(self.directBackEndURL + f"users?email={email}")
            user = json.loads(userRaw.text)[0]
            req = requests.delete(self.directBackEndURL + f"users/{user['id']}", headers=self.masterHeader)
            return req.status_code, req.text
        except:
            pass
    def register(self, userid, userpassword):
        user = {
            'email' : userid,
            'password' : userpassword,
            "name": "string",
            "birth": '2020-01-01T00:00:00',
            "gender": "string",
            "company": "string",
            "promotionCode": "string",
            "confirmed": 1
        }
        try:
            req = requests.post(self.backEndURL + 'register/', data=json.dumps(user))
            return req.status_code, req.text
        except:
            print(traceback.format_exc())
            pass
        return None, None
    def loginMaster(self, id, password):
        datas = {
            "identifier": id,
            "password": password
        }
        req = requests.post(self.directBackEndURL + 'admin/auth/local/', data=datas)
        return json.loads(req.text)
    def login(self, id, password):
        datas = {
            "identifier": id,
            "password": password
        }
        req = requests.post(self.backEndURL + 'login/', data=json.dumps(datas))
        time.sleep(0.1)
        return req.status_code, json.loads(req.text)
    def setUserPlan(self, email, password, planId, isfirstPlan = True):
        # result = self.dbClass.updateUser(testId, {
        #     "emailTokenCode": "",
        #     "confirmed": True
        # })
        code, result = self.login(email,password)
        if code == 200:
            userId = result['user']['id']

        isFirstplanDone = 0
        if isfirstPlan:
            isFirstplanDone = 1

        userData = {
            'confirmed': 1,
            'isFirstplanDone': isFirstplanDone,
            'isAgreedWithPolicy': 1,
            'phoneNumber': '010-1234-1234',
            'isTest': 1,
            'isDeleteRequested': 0,
            'usageplan': planId,
            'dynos': 4,
        }

        result = requests.put(self.directBackEndURL + 'users/' + str(userId), headers=self.masterHeader, data=userData)
        time.sleep(0.1)

if __name__ == '__main__':
    config = sys.argv[1]
    if config == 'setIsComfirmed':
        SettingUserInfo().setUserPlan('fronttest@testfront.com', 'test12345!', 6, False)
    elif config == 'setUsagePlan':
       SettingUserInfo().setUserPlan('fronttest@testfront.com', 'test12345!', 6, True)