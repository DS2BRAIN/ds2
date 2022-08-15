import requests


class KakaoMoment:
    host = 'https://kapi.kakao.com'

    func = {
        'authorize': '/oauth/authorize',
        'me': '/v2/user/me',
        'adAccounts': '/v1/moment/adAccounts'
    }

    def __init__(self):
        pass
        url = self.host + self.func['adAccounts']
        # response = requests.request('GET', url,
        #                             params={
        #
        #                             },
        #                             headers={'Authorization': 'Bearer 9bdc1c5654bfd457f57cee57957158e6'},
        #                             )

        response = requests.request('GET', url,
                                    params={
                                        'adAccountId': '',
                                        'level': 0,
                                        'metricsGroup': 'BASIC',
                                    },
                                    headers={'Authorization': 'KakaoAT cabf5241f4a0eba7c1541e62ae5cbdf9'})
        print(response.text)

    def test(self):
        # client_id = {app_key} & redirect_uri = {redirect_uri} & response_type = cod
        url = self.host + self.func['authorize']
        response = requests.request('GET', url,
                                    params={
                                        'client_id': 'cabf5241f4a0eba7c1541e62ae5cbdf9',
                                        'redirect_uri': 'localhost',
                                        'response_type': 'code'
                                    })

        print(response.text)


if __name__ == '__main__':
    kakako = KakaoMoment()
    kakako.test()
