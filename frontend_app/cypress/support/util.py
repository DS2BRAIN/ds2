import sys

class Util():
    def __init__(self, config=None):
        self.configOption = 'dev'

        if len(sys.argv) > 1 and 'prod' in sys.argv[1]:
            self.configOption = 'prod'
        if len(sys.argv) > 1 and 'enterprise' in sys.argv[1]:
            self.configOption = 'enterprise'
        if config:
            self.configOption = config

        self.planOption = ''
        if len(sys.argv) == 3:
            self.planOption = sys.argv[2]

        self.enterprise = True if self.configOption == "enterprise" else False

        self.bucket_name = 'astoredslab'
        self.backendURL = "https://dslabaa.clickai.ai"
        self.frontendURL = "https://stagingapp.clickai.ai"
        self.paypleURL = "https://testcpay.payple.kr"
        self.payplePayload = "{\n\"cst_id\": \"test\",\n\"custKey\": \"abcd1234567890\"\n,\"PCD_PAY_TYPE\": \"card\"}"
        self.paypleHeaders = {'referer': "https://clickai.ai"}

        if self.configOption in "prod":
            self.paypleURL = "https://cpay.payple.kr"
            self.payplePayload = "{\n\"cst_id\": \"dslab\",\n\"custKey\": \"d17b8a6c05cf8642c8efd6214626d81263ea0615cbbaac5b21317ba09207c77f\"\n}"
            self.bucket_name = aistore_configs['prod_bucket_name']
            self.backendURL = "https://api.clickai.ai"
            self.frontendURL = "https://app.clickai.ai"
            
        if self.configOption in "enterprise":
            self.backendURL = "http://0.0.0.0:13002"
            self.frontendURL = "http://0.0.0.0:13000"
