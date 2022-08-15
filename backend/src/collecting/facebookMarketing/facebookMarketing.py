import ast
from datetime import datetime, timedelta
import pandas as pd

from starlette.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.adsinsights import AdsInsights
from facebook_business.api import FacebookAdsApi

from src.collecting.connector import Connector


class FacebookMarketing(Connector):
    """ 최소 시간별로 가능 """

    def __init__(self, dictionary: dict):
        super().__init__(dictionary)

        # 기본 정보 초기화
        self.isVerify = False
        self.accessToken = dictionary.get('accessToken', '')
        self.adAccountId = dictionary.get('adAccountId', None)
        self.api = FacebookAdsApi.init(access_token=self.accessToken)
        self.account = AdAccount(f'act_{self.adAccountId}', api=self.api)

        # 테스트용 코드
        # print(self.account_id)
        # print(self.account.get_promote_pages())  # 연결된 페이지 확인

    def setAccount(self):
        # account_id가 없는 경우 가져오기
        try:
            if self.adAccountId is None:
                self.accountId = AdAccount(api=self.api).get_my_account().get('account_id', None)

            # account 객체 생성
            self.account = AdAccount(f'act_{self.adAccountId}', api=self.api)

        except Exception as e:
            raise ValueError(f"AccessToken({self.accessToken}) 이 일치하지 않습니다.")

    @property
    def initParamNames(self):
        return ['access_token', 'adAccountId']

    def verify(self):
        try:
            # if len(self.adAccountId) == 0:
            #     raise ValueError(f'adAccountId({self.adAccountId}) 가 일치하지 않습니다.')

            # 연결 테스트
            self.account.get_campaigns()

            columnNames, types = self.columnsInfo
            columnInfo = [{'columnName': column, 'type': type} for (column, type) in zip(columnNames, types) if column not in self.breakdowns]
            self.isVerify = True
            return self.isVerify, columnInfo, 'SUCCESS'

        except Exception as e:
            self.isVerify = False
            return self.isVerify, [], "accessToken 또는 adAccountId가 일치하지 않습니다."

    def summary(self, startDate=None, endDate=None, fields=None, breakdowns=None):
        insights = self.getData(startDate, endDate, fields, breakdowns)
        _, types = self.columnsInfo

        return self.parseSummary(insights, types=types), insights

    def collect(self, startDate=None, endDate=None, fields=None, breakdowns=None):
        insights = self.getData(startDate, endDate, fields, breakdowns)

        # 결과 변환 list(dictionary)
        # result = [dict(insight) for insight in insights]
        # result = insights.to_dict('records')
        return insights

    def getData(self, startDate=None, endDate=None, fields=None, breakdowns=None):
        if self.account is None:
            self.setAccount()

        # 기본 변수 초기화
        endDate = self.endDate if endDate is None else endDate
        startDate = (datetime.strptime(endDate, '%Y-%m-%d') - timedelta(days=7)).strftime('%Y-%m-%d') if startDate is None else startDate
        fields = self.fields if fields is None else fields
        breakdowns = self.breakdowns if breakdowns is None else breakdowns

        params = {
            'level': 'ad',
            'filtering': [],
            'breakdowns': breakdowns,
            'time_increment': '1',
            'time_range': {'since': startDate, 'until': endDate},
            'sort': ['date_start']
        }

        # 결과 가져오기
        insights = self.account.get_insights(fields=fields, params=params)
        insights = self.checkColumn(insights)

        return insights

    def checkColumn(self, insights):
        columnNames, types = self.columnsInfo
        columnNamesSet = set(columnNames)

        result = []
        for insight in insights:
            actions = insight.pop('actions', [])
            for action in actions:
                actionName = action['action_type']
                if actionName in self.actions:
                    insight.update({actionName: int(action['value'])})

            nonColumns = columnNamesSet - set(insight.keys())
            for nonColumn in nonColumns:
                insight.update({nonColumn: 0})

            hour = ''
            if insight.get('hourly_stats_aggregated_by_audience_time_zone'):
                hour = ' ' + insight.pop('hourly_stats_aggregated_by_audience_time_zone').split(' - ')[0]

            insight.update({'datetime': f"{insight['date_start']}{hour}"})
            insight.pop('date_start')
            insight.pop('date_stop')

            result.append(insight)

        # 타입 변환
        # columnNames.remove('hourly_stats_aggregated_by_audience_time_zone')
        result = pd.DataFrame(result, columns=columnNames)
        if insights:
            for columnName, type in zip(columnNames, types):
                if type == 'number':
                    result[columnName] = pd.to_numeric(result[columnName])

        result.sort_values(by='datetime', ascending=False, inplace=True)
        return result

    @property
    def columnsInfo(self):
        # actions 필드 제외
        fields = self.fields
        if 'actions' in fields:
            fields.pop(fields.index('actions'))

        # 현재 Breakdowns의 있는 값은 변형될 것이라 추가안함
        columnNames = fields + self.actions + self.datetime
        types = self.fieldType + self.actionTypes + self.datetimeType

        return columnNames, types

    @property
    def endDate(self):
        return datetime.now().strftime('%Y-%m-%d')

    @property
    def fields(self):
        return [
            'ad_id',
            'campaign_id',
            'clicks',
            'cpc',
            'impressions',
            'cpm',
            'ctr',
            'reach',
            'frequency',
            'actions',
        ]

    @property
    def fieldType(self):
        """ action에 대한 필드 타입은 제외하고 필드 순서대로 적어야함 """
        return [
            'object',
            'object',
            'number',
            'number',
            'number',
            'number',
            'number',
            'number',
            'number',
        ]

    @property
    def actions(self):
        return ['post_reaction', 'post', 'comment', 'link_click', 'onsite_conversion.post_save', 'post_engagement']

    @property
    def actionTypes(self):
        return ['number'] * len(self.actions)

    @property
    def datetime(self):
        # return ['date_start', 'date_stop']
        return ['datetime']

    @property
    def datetimeType(self):
        # return ['datetime', 'datetime']
        return ['datetime']

    @property
    def breakdowns(self):
        return ['hourly_stats_aggregated_by_audience_time_zone']

    @property
    def breakdownType(self):
        return ['object']


if __name__ == '__main__':
    m_access_token = 'EAAELsl68ZCO4BANgObFivaCw03Ru8Bng2Cr8am7ZBKPsUjiktKoEo03mxjzIjIZA4LGSHKlabu3ZBXHumD47VI8I6l7VBooCuoY3adRl2WmShYZBz3I6O2iVLY34pFeXAmFGuZCufjkTGAZBStBfjcThcB1VKRny6c5VfOuIaxj8B84xJbRyXwq7GTjXoxorUYZD'
    dictionary = {
        'accessToken': 'EAAELsl68ZCO4BANgObFivaCw03Ru8Bng2Cr8am7ZBKPsUjiktKoEo03mxjzIjIZA4LGSHKlabu3ZBXHumD47VI8I6l7VBooCuoY3adRl2WmShYZBz3I6O2iVLY34pFeXAmFGuZCufjkTGAZBStBfjcThcB1VKRny6c5VfOuIaxj8B84xJbRyXwq7GTjXoxorUYZD',
        # 'adAccountId': '1465833480268206',
         'adAccountId': '530696487844816',
         # 'adAccountId': '632201704310048',
        # 'adAccountId': '1',
    }


    facebook = FacebookMarketing(dictionary)

    # Verify
    isVerify, columnInfo, message = facebook.verify()
    print(isVerify, message)
    [print(info) for info in columnInfo]

    # Summary
    # summary, result = facebook.summary()
    # for s in summary:
    #     print(s)
    # print(result)

    # # Collect
    result = facebook.collect()
    print(result)
    # result.to_csv('ddd.csv')
