import ast
import json

from src.collecting.amazonS3.amazonS3 import AmazonS3
from src.collecting.database.jdbc import JDBC
from src.collecting.facebookMarketing.facebookMarketing import FacebookMarketing
from src.collecting.googleAdWords.googleAdWords import GoogleAdWords
from src.collecting.googleAnalytics.googleAnalytics import GoogleAnalytics


# MySQL
# Google Ads
# Google Analytics
# CSV
# Oracle
# 네이버 광고
# 카카오 광고
# MSSQL
# Firebase
# Snowflake
# Salesforce
# AWS S3
# JDBC
# Hadoop hdfs
# Elastic search
# ZIP


class ConnectorHandler:
    # TODO:: 데이터베이스에서 params들고 올 수 있도록 수정..?
    methodDict = {
        'Google Analytics': {'connector': GoogleAnalytics, 'params': ["file", "profileId"]},
        'Facebook Marketing': {'connector': FacebookMarketing, 'params': ["accessToken", "adAccountId"]},
        'Google Ads': {'connector': GoogleAdWords,
                       'params': ["developerToken", "clientCustomerId", "clientId", "clientSecret", "refreshToken"]},
        'AWS S3': {'connector': AmazonS3, 'params': ['url']},
        'JDBC': {'connector': JDBC, 'params': ["host", "userId", "password", "database", "tableName", "port", "dbType"]}
    }

    def __init__(self, method, dictionary=None):
        if dictionary is None:
            dictionary = dict()

        self.method = method
        self.dictionary = dictionary
        self.connectorInfo = self.methodDict.get(method, 'csv')
        self.params = self.connectorInfo['params']
        self.connector = self.connectorInfo['connector'](self.dictionary)

        # if self.paramType == 'dictionary':
        #     self.connector = self.connector(self.dictionary)
        # elif self.paramType == 'key':
        #     self.connector = self.connector(apiKey)
        # else:
        #     self.connector = self.connector(apiKey, self.dictionary)

    def verify(self):
        isVerify, columnInfo, message = self.connector.verify()
        return isVerify, columnInfo, str(message)

    def summary(self, startDate=None, endDate=None):
        summaries, data = self.connector.summary(startDate=startDate, endDate=endDate)
        sampleData = json.dumps(data.sample(frac=1)[:120].to_dict('records'))
        return summaries, sampleData

    def collect(self, connectorCount=1, startDate=None, endDate=None):
        maxSize = 2 * 1024 * 1024 * 1024 / connectorCount
        data = self.connector.collect(startDate, endDate)

        dataSize = data.memory_usage(index=False, deep=True).sum()
        if dataSize > maxSize:
            sizePerRow = dataSize / len(data)
            removeRowCount = (dataSize - maxSize) // sizePerRow + ((dataSize - maxSize) % sizePerRow > 0)
            data = data[data.index < removeRowCount]

        return data


def testConnector(method, dictionary):
    print('START', method)
    connector = ConnectorHandler(method=method, dictionary=dictionary)

    # Verify
    isVerify, columnInfo, message = connector.verify()
    print(isVerify, message)
    [print(info) for info in columnInfo]

    if isVerify:
        # Summary
        summaries, data = connector.summary()
        [print(summary) for summary in summaries]
        print(data)

        # Collect
        # print(connector.collect(startDate='2020-06-01', endDate='2020-06-03'))
        print(connector.collect())

    print('\n')


def testGoogleAnalytics():
    # Google Analytics
    MAIN_KEY_FILE = 'googleAnalytics/dslab-key.json'
    PROFILE_ID = '214190875'

    with open(MAIN_KEY_FILE, 'rb') as file:
        key_file = file.read()

    key_file_dict = {
        'file': ast.literal_eval(key_file.decode('UTF-8')),
        'profileId': PROFILE_ID
    }

    testConnector(method='Google Analytics', dictionary=key_file_dict)


def testFacebookMarketing():
    # FacebookMarketing
    dictionary = {
        'accessToken': 'EAAELsl68ZCO4BANgObFivaCw03Ru8Bng2Cr8am7ZBKPsUjiktKoEo03mxjzIjIZA4LGSHKlabu3ZBXHumD47VI8I6l7VBooCuoY3adRl2WmShYZBz3I6O2iVLY34pFeXAmFGuZCufjkTGAZBStBfjcThcB1VKRny6c5VfOuIaxj8B84xJbRyXwq7GTjXoxorUYZD',
        # 'adAccountId': '1465833480268206',
        'adAccountId': '530696487844816',
    }

    testConnector(method='Facebook Marketing', dictionary=dictionary)


def testGoogleAds():
    # google Ads
    adwords_info = {
        "developerToken": "uiEac-DOrwlVN2cWf2_LsQ",
        "clientCustomerId": "843-616-6313",
        "clientId": "173895437785-4ee7dhe83tfi2hpquff0jtfaku196nk8.apps.googleusercontent.com",
        "clientSecret": "79NF8XoN4BOocKzUk8afRfvG",
        "refreshToken": "1//0e1ce-1iXREZXCgYIARAAGA4SNwF-L9IrTj6FypyahRIDZsmHbGId7tAYThbKVWx0ct446i4sgNuy6CGMea-Wd5Us8aEN7HeSdps"
    }

    testConnector(method='Google Ads', dictionary=adwords_info)


def testAmazonS3():
    dictionary = {
        "url": "http://astoredslab.s3.ap-northeast-2.amazonaws.com/user/157/직원 퇴사여부.csv"
    }

    testConnector(method='AWS S3', dictionary=dictionary)


def testJDBC():
    connectionInfoList = [
        # Mysql
        # {
        #     "host": "52.78.239.64",
        #     "userId": "shem",
        #     "password": "shem1234!",
        #     "database": "shem",
        #     "tableName": "usersTable",
        #     "dbType": "MySQL"
        # },
        {
            "host": "dslaba.clickai.ai",
            "userId": "skyhub",
            "password": "Dd8qDhm2eP!",
            "database": "skyhub",
            "tableName": "users-permissions_user",
            "dbType": "mysql"
        },

        # MSSQL
        # {
        #     "host": "localhost",
        #     "userId": "test",
        #     "password": "123qwe",
        #     "database": "test",
        #     "tableName": "test",
        #     "dbType": "mssql"
        # },

        # ORACLE
        {
            "host": "database-2.c9xg2lfhexes.ap-northeast-2.rds.amazonaws.com",
            "userId": "admin",
            "password": "eldptmfoq1!",
            "database": "DATABASE",
            "tableName": "TEST",
            "dbType": "oracle"
        },

        # PostgreSQL
        # {
        #     "host": "localhost",
        #     "userId": "postgres",
        #     "password": "test",
        #     "database": "postgres",
        #     "tableName": "testtable",
        #     "dbType": "postgresql"
        # },
    ]

    for connectionInfo in connectionInfoList:
        print(connectionInfo['dbType'])
        testConnector(method='JDBC', dictionary=connectionInfo)


if __name__ == '__main__':
    pass
    testGoogleAnalytics()
    testFacebookMarketing()
    # testGoogleAds()
    # testAmazonS3()
    testJDBC()