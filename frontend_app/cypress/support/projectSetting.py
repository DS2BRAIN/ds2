import requests
import json
import time
import sys


class projectSetting():
    def putproject(self, token, projectNum):
        datas = {
            "id": projectNum,
            "option": "test",
            "status": 21,
        }
        try:
            req = requests.put('https://api.clickai.ai/' + f'projects/{projectNum}/?token={token}', data=json.dumps(datas))
            return req.status_code, req.text
        except:
            return 500, {'message':'error'}

if __name__ == '__main__':
    token = sys.argv[1]
    projectId = sys.argv[2]
    projectSetting().putproject(token, projectId)