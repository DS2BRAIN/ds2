import base64
import hashlib
import hmac
import json
import time

import requests

from src.collecting.connector import Connector


class NaverSearchAd(Connector):
    BASE_URL = 'https://api.naver.com'

    def __init__(self, api_key, secret_key, customer_id):
        super().__init__()

        self.api_key = api_key
        self.secret_key = secret_key
        self.customer_id = customer_id

    @classmethod
    def verify(cls, *args, **kwargs):
        pass

    def collect(self, target_id):
        campaign_id = 'cmp-a001-01-000000002987588'
        group_id = 'grp-a001-01-000000015623690'
        uri = '/stats'
        method = 'GET'

        response = requests.get(self.BASE_URL + uri,
                                params={
                                    'id': campaign_id,
                                    'fields': self.default_fields(),
                                    'timeRange': '{"since":"2020-03-01","until":"2020-03-05"}',
                                    # 'timeIncrement': "1",
                                    'breakdown': '["hh24"]',
                                },
                                headers=self.get_header(method, uri, self.api_key, self.secret_key, self.customer_id))

        return response, response.json()

    def default_fields(self):
        return json.dumps([
            "impCnt", "clkCnt", "salesAmt", "ctr", "cpc", "avgRnk", "ccnt", "pcNxAvgRnk", "mblNxAvgRnk", "crto",
            "convAmt", "ror", "cpConv", "viewCnt"
            # "recentAvgRnk", "recentAvgCpc",
        ])

    def collect_list(self, target_id):
        campaign_id = 'cmp-a001-01-000000002987588'
        group_id = 'grp-a001-01-000000015623690'
        uri = '/stat-reports'
        method = 'GET'

        response = requests.get(self.BASE_URL + uri,
                                headers=self.get_header(method, uri, self.api_key, self.secret_key, self.customer_id))

        return response, response.json()

    def get_header(self, method, uri, api_key, secret_key, customer_id):
        timestamp = str(round(time.time() * 1000))
        signature = self.generate(timestamp, method, uri, secret_key)
        return {'Content-Type': 'application/json; charset=UTF-8', 'X-Timestamp': timestamp, 'X-API-KEY': api_key,
                'X-Customer': str(customer_id), 'X-Signature': signature}

    def generate(self, timestamp, method, uri, secret_key):
        message = "{}.{}.{}".format(timestamp, method, uri)
        hash = hmac.new(bytes(secret_key, "utf-8"), bytes(message, "utf-8"), hashlib.sha256)

        hash.hexdigest()
        return base64.b64encode(hash.digest())


if __name__ == '__main__':
    API_KEY = '010000000070227b78df9e3485a83d1ad6979fdcbd5e56679960b5da8411071f0db4246a1e'
    SECRET_KEY = 'AQAAAABwInt43540hag9GtaXn9y9oW1Cx9ftJ0PJnKC7CsYhtg=='
    CUSTOMER_ID = '1939616'

    naver = NaverSearchAd(API_KEY, SECRET_KEY, CUSTOMER_ID)
    response, result = naver.collect(1)

    for key in result:
        value = result[key]
        if isinstance(value, list):
            for v in value:
                print(v)
        else:
            print(value)
