import re
from io import StringIO
from urllib.parse import quote
from urllib.request import urlopen
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_200_OK

import pandas as pd

from src.collecting.connector import Connector


class AmazonS3(Connector):
    def __init__(self, dictionary):
        self.url = dictionary.get('url', '')

    def verify(self):
        try:
            file = self.readFileByUrl(self.url)
            summary = self.parseSummary(file)

            columnInfo = [{'columnName': column['columnName'], 'type': column['type']} for column in summary]
            return True, columnInfo, ''
        except Exception as e:
            return False, [], e.args

    def collect(self, maxSize=None, *args, **kwargs):
        return self.readFileByUrl(self.url)

    def readFileByUrl(self, url):
        try:
            if self.checkUrl(url):
                url = self.convertAvalilableUrl(url)
                bytes = urlopen(url)
                data = self.bytes2str(bytes)

                return pd.read_csv(data)
        except Exception as e:
            return {
                "statusCode": 400,
                "error": "Bad Request",
                "message": e.args
            }

    def checkUrl(self, url):
        # regex = re.compile("^https?://.*[.]s3[.].*([.]csv)$")
        checkList = [
            {'regex': '^(https?://)', 'message': 'Http 또는 Https가 아닙니다.'},
            {'regex': 's3', 'message': 's3형식의 URL이 아닙니다'},
            {'regex': '([.]csv)$', 'message': 'csv 파일이 아닙니다.'},
        ]

        for check in checkList:
            regex = check['regex']
            if not re.compile(regex).search(url):
                raise ValueError(check['message'])

        return True

    def convertAvalilableUrl(self, url):
        """ 한글 및 공백이 가능하도록 변환 """
        protocolIndex = url.find('//') + 2
        if protocolIndex < 2:
            raise ValueError(f'잘못된 URL 입니다. ({url})')

        protocol = url[:protocolIndex]
        path = url[protocolIndex:]
        return protocol + quote(path)

    def bytes2str(self, byte):
        return StringIO(byte.read().decode('utf-8'))


if __name__ == '__main__':
    # url = 'https://astoredslab.s3.ap-northeast-2.amazonaws.com/user/157/carInsurance_train.csv'
    url = 'http://astoredslab.s3.ap-northeast-2.amazonaws.com/user/157/직원 퇴사여부.csv'
    dictionary = {
        'url': url
    }

    isVerify, result, msg = AmazonS3(dictionary).verify()
    print(result)
