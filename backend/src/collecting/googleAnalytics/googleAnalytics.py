import ast
from datetime import datetime, timedelta

import pandas as pd

# from apiclient.discovery import build
from oauth2client.service_account import ServiceAccountCredentials

from src.collecting.connector import Connector

SCOPES = ['https://www.googleapis.com/auth/analytics.readonly']


class GoogleAnalytics(Connector):
    def __init__(self, dictionary):
        super().__init__(dictionary)

        self.isVerify = False
        self.service = None
        self.keyFileInfo = dictionary.get('file', {})
        self.profileId = dictionary.get('profileId', None)

    @staticmethod
    def get_service(keyFileInfo):
        # googleAnalytics 서비스 가져오기 (v3)
        credentials = ServiceAccountCredentials._from_parsed_json_keyfile(keyFileInfo, SCOPES)
        # return build('analytics', 'v3', credentials=credentials, cache_discovery=False)

    def get_profiles(self):
        accounts = self.service.management().accounts().list().execute()
        profile_infos = []
        for account_item in accounts.get('items', []):
            account_id = account_item.get('id')

            properties = self.service.management().webproperties().list(accountId=account_id).execute()
            for property in properties.get('items', []):
                property_id = property.get('id')
                profiles = self.service.management().profiles().list(
                    accountId=account_id,
                    webPropertyId=property_id
                ).execute()

                username = profiles.get('username')
                for profile in profiles.get('items', []):
                    profileId = profile.get('id')
                    permissions = profile.get('permissions', {})
                    name = profile.get('name')
                    kind = profile.get('kind')

                    info = {'id': profileId,
                            'kind': kind,
                            'username': username,
                            'permissions': permissions,
                            'name': name}

                    profile_infos.append(info)

        return profile_infos

    def verify(self):
        # 기본 결과 변수 초기화
        columnInfo = []

        try:
            if self.profileId is None or len(self.profileId) == 0:
                raise ValueError('profileId가 없습니다.')

            # 연결 테스트
            self.service = self.get_service(self.keyFileInfo)
            self.getData(startDate=self.default_end_date, endDate=self.default_end_date)

            # 컬럼 정보
            # columns = self.default_dimensions.split(', ') + self.default_metric.split(', ') + ['ga:datetime']
            # types = self.default_dimensions_type + self.default_metric_type + ['datetime']
            columns = self.default_metric.split(', ') + ['ga:datetime']
            types = self.default_metric_type + ['datetime']
            columnInfo = [{'columnName': column, 'type': type} for (column, type) in zip(columns, types)]

        except Exception as e:
            self.isVerify = False
            return self.isVerify, columnInfo, str(e.args)

        self.isVerify = True
        return self.isVerify, columnInfo, ''

    def summary(self, startDate=None, endDate=None, metrics=None, dimensions=None):
        data = self.getData(startDate, endDate, metrics, dimensions)
        return self.parseSummary(data), data

    def collect(self, startDate=None, endDate=None, metrics=None, dimensions=None):
        data = self.getData(startDate, endDate, metrics, dimensions)
        return data

    def getData(self, startDate=None, endDate=None, metrics=None, dimensions=None):
        # 서비스 가져오기
        if not self.isVerify:
            self.service = self.get_service(self.keyFileInfo)

        # 기본 변수 초기화
        endDate = self.default_end_date if endDate is None else endDate
        startDate = (datetime.strptime(endDate, '%Y-%m-%d') - timedelta(days=7)).strftime('%Y-%m-%d') if startDate is None else startDate
        metrics = self.default_metric if metrics is None else metrics
        dimensions = self.default_dimensions if dimensions is None else dimensions

        # 결과 가져오기
        data = self.service.data().ga().get(
            ids=f'ga:{self.profileId}',
            start_date=startDate,
            end_date=endDate,
            metrics=metrics,
            dimensions=dimensions).execute()

        columnHeaders = data['columnHeaders']
        result = pd.DataFrame(data['rows'])
        for index, columnHeader in enumerate(columnHeaders):
            dataType = 'object' if columnHeader['dataType'] == 'STRING' else 'number'
            columnName = columnHeader['name']

            if dataType == 'number':
                result[index] = pd.to_numeric(result[index])
            # else:
            #     data[index] = pd.to_datetime(data[index])  # date는 되는데 hour은 01, 02 이런식으로 생겨서 안됨

            result.rename(columns={index: columnName}, inplace=True)

        # result['ga:Datetime'] = result['ga:date'] + ' ' + result['ga:hour'] + ':00:00'
        dataTimeRaw = result['ga:date'] + ':' + result['ga:hour'] + ''
        result['ga:Datetime'] = pd.to_datetime(dataTimeRaw, format='%Y%m%d:%H').apply(lambda x: x.strftime('%Y-%m-%d %H:%M:%S'))
        # result['ga:Datetime'] = result['ga:Datetime'].apply(lambda x: x.strftime('%Y-%m-%d %H:%M:%S'))

        result.drop(columns=self.default_dimensions.split(', '), inplace=True)
        result.sort_values(by='ga:Datetime', ascending=False, inplace=True)

        return result

    @property
    def default_metric(self):
        return 'ga:impressions, ga:adClicks, ga:costPerConversion, ga:sessions, ' \
               'ga:newUsers, ga:bounceRate, ga:RPC, ga:ROAS, ga:CPM, ga:CPC'

    @property
    def default_metric_type(self):
        return ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']

    @property
    def default_type(self):
        return 'ga:impressions, ga:adClicks, ga:costPerConversion, ga:sessions, ' \
               'ga:newUsers, ga:bounceRate, ga:RPC, ga:ROAS, ga:CPM, ga:CPC'

    @property
    def default_end_date(self):
        return datetime.now().strftime('%Y-%m-%d')

    @property
    def default_dimensions(self):
        return 'ga:date, ga:hour'

    @property
    def default_dimensions_type(self):
        return ['datetime', 'string']


if __name__ == '__main__':
    MAIN_KEY_FILE = 'dslab-key.json'
    MAIN_VIEW_ID = '214190875'

    with open(MAIN_KEY_FILE, 'rb') as file:
        key_file = file.read()

    keyFileInfo = {
        'file': ast.literal_eval(key_file.decode('UTF-8')),
        'profileId': MAIN_VIEW_ID
    }
    # key_file_dict['profileId'] = MAIN_VIEW_ID
    ga = GoogleAnalytics(keyFileInfo)

    # Verify
    isVerify, columnInfo, msg = ga.verify()
    print(isVerify)
    print(columnInfo)
    print(msg)

    # # Summary
    # summary, data = ga.summary()
    # print(summary)
    # print(data)

    # Collect
    data = ga.collect()
    print(data)