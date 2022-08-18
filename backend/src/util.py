import datetime
import os
import shutil
import subprocess
import traceback
import urllib
import jwt
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from email.header import Header
from email.utils import formataddr
import pwd
import numpy as np
import pandas as pd
import requests
import boto3
from uuid import getnode as get_mac
import torch.cuda

from src.errors import exceptions as ex

from dateutil.relativedelta import relativedelta

if os.path.exists('./src/training/aistore_config.py'):
    from src.training.aistore_config import aistore_configs
else:
    aistore_configs = {
        "slackChannelURL": None,
        "access_key": None,
        "secret_key": None,
        "eximbay_secret_key": None,
        "eximbay_mid": None,
    }

if os.path.exists('./astoredaemon/util_config.py'):
    from astoredaemon.util_config import util_configs
else:
    util_configs = {}

from uuid import getnode as get_mac
import argparse

from src.emailContent.getContentCompleteAutolabeling import getContentCompleteAutolabeling
from src.emailContent.getEngContentCompleteAutolabeling import getEngContentCompleteAutolabeling
from api_wrapper.metabase_wrapper import MetabaseAPI
import urllib.parse

import sys

class Unbuffered(object):
   def __init__(self, stream):
     self.stream = stream
   def write(self, data):
     self.stream.write(data)
     self.stream.flush()
   def writelines(self, datas):
     self.stream.writelines(datas)
     self.stream.flush()
   def __getattr__(self, attr):
     return getattr(self.stream, attr)

sys.stdout=Unbuffered(sys.stdout)

try:
    public_ip_address = requests.get('https://checkip.amazonaws.com', timeout=2).text.strip()
except:
    public_ip_address = "0.0.0.0"

class enterpriseBoto():

    def __init__(self, config=None):

        self.save_path = f"{os.path.expanduser('~')}/ds2ai"

        for i, argv in enumerate(sys.argv):
            if i == 0:
                continue

    def describe_instances(self):
        return {"Reservations": []}

    def upload_file(self, file_route, bucket_name, s3_route, Config=None):
        folderName = os.path.split(s3_route)[0]
        fileName = os.path.split(s3_route)[1]
        os.makedirs(f"{self.save_path}/{folderName}", exist_ok=True)
        save_path = f"{self.save_path}/{folderName}/{fileName}"
        try:
            shutil.copyfile(file_route, save_path)
        except:
            pass

    def download_file(self, bucket_name, s3_route, file_route, Config=None):
        print('download_file')
        s3_route = s3_route.replace(" ","%20")
        print(s3_route)

        print(self.save_path)
        file_route = urllib.parse.unquote(file_route)
        print('file_route')
        print(file_route)

        try:
            shutil.copyfile(f"{s3_route}", file_route)
        except:
            print(traceback.format_exc())
            pass

        try:
            shutil.copyfile(f"{self.save_path}/{s3_route}", file_route)
        except:
            print(traceback.format_exc())
            pass
        try:

            filePath = f"{os.getcwd()}/../aimaker-backend-deploy/data/{file_route.split('/')[-1]}"
            if not os.path.exists(filePath):
                shutil.copyfile(f"{os.getcwd()}/{file_route}", filePath)

            filePath = f"{os.getcwd()}/../aimaker-daemon-deploy/data/{file_route.split('/')[-1]}"
            if not os.path.exists(filePath):
                shutil.copyfile(f"{os.getcwd()}/{file_route}", filePath)

            if len(file_route.split('/')) > 0:
                file_route = file_route.split('/')[-1]

            filePath = f"{os.getcwd()}/../aimaker-daemon-deploy/models/{file_route}"
            if os.path.exists(filePath):
                shutil.copyfile(filePath, f"{self.save_path}/{file_route}")

        except:
            pass
        pass
    def put_object(self, Body=None, Bucket=None, Key=None):
        if Key:
            # fileName = Key.split('/')[-1]
            folder_name, file_name = os.path.split(f"{self.save_path}/{Key}")
            os.makedirs(folder_name, exist_ok=True)
            try:
                with open(f"{self.save_path}/{Key}", 'wb') as f:
                    f.write(Body.getbuffer())
            except:

                try:
                    with open(f"{self.save_path}/{Key}", 'wb') as f:
                        f.write(Body)
                except:
                    pass
                pass
        pass

enterprise_boto_object = enterpriseBoto()

class Util():

    def __init__(self, config=None):

        # local_device_protos = device_lib.list_local_devices()

        # self.available_gpu_list = [x.name for x in local_device_protos if x.device_type == 'GPU']

        self.available_gpu_name_list = [torch.cuda.get_device_name(n) for n in range(torch.cuda.device_count())]
        self.available_gpu_list = [f'/device:GPU:{n}' for n in range(torch.cuda.device_count())]
        self.slackHeader = {
            'Content-Type': "application/x-www-form-urlencoded",
            'Accept': "*/*",
            'Cache-Control': "no-cache",
            'Host': "hooks.slack.com",
            'Accept-Encoding': "gzip, deflate",
            'Content-Length': "121",
            'Connection': "keep-alive",
            'cache-control': "no-cache"
        }

        self.jupyterAMI = util_configs.get('jupyterAMI', {})


        self.imageExtensionName = ['jpg', 'jpeg', 'png', 'gif']
        self.videoExtensionName = ['mp4', 'mov']
        self.soundExtensionName = ['mp4','mp3','wav','flac']
        self.compressionExtensionName = ['zip']
        self.textExtensionName = ['csv']
        self.read_permission_name = ['read']
        self.edit_permission_name = ['edit']
        self.full_access_permission_name = ['full_access']
        self.objectDetectionModel = [3,5,6]
        self.clickAiProductName = 'ClickAi'
        self.server_version = "v2.2.4"
        self.enterprise_server_version = "v0.2.1"
        self.slackChannelURL = aistore_configs.get('slackChannelURL', '')
        self.access_key = aistore_configs.get('access_key', '')
        self.secret_key = aistore_configs.get('secret_key', '')
        self.privacy = util_configs.get('privacy', {})
        self.passwd_dict = util_configs.get('passwd_dict', {})
        self.dot_encode_key = util_configs.get('dot_encode_key', '')
        self.public_ip_address = public_ip_address

        self.ps_id = os.getpid()
        self.configOption = 'dev'

        if len(sys.argv) > 1 and 'prod' in sys.argv[1]:
            self.configOption = 'prod'
        if len(sys.argv) > 1 and 'local_backend_prod' == sys.argv[1]:
            self.configOption = 'prod_local'
        if len(sys.argv) > 1 and 'enterprise' in sys.argv[1]:
            self.configOption = 'enterprise'
        if len(sys.argv) > 1 and 'dev_local' == sys.argv[1]:
            self.configOption = 'dev_local'

        self.is_dev_test = False
        if 'true' in os.environ.get('DS2_DEV_TEST', 'false'):
            self.is_dev_test = True

        for argv in sys.argv:
            if 'auto' in argv:
                self.configOption = 'prod'
                break
            if '1000' in argv:
                self.configOption = 'prod'
                break
        for argv in sys.argv:
            if 'error' in argv:
                self.configOption = 'enterprise'
                break
            if 'enterprise' in argv:
                self.configOption = 'enterprise'
                break

        if 'enterprise' in os.environ.get('DS2_CONFIG_OPTION', 'dev_local'):
            self.configOption = 'enterprise'

        self.save_path = f"{os.path.expanduser('~')}/ds2ai"

        for i, argv in enumerate(sys.argv):
            if i == 0:
                continue
            # if '/' in argv:
            #     self.save_path = argv
            #     break

        if not os.path.exists(self.save_path):
            os.makedirs(self.save_path, exist_ok=True)

        if not os.path.exists(f'{self.save_path}/mask.pkl'):
            try:
                shutil.copyfile(f"/opt/mask.pkl", f'{self.save_path}/mask.pkl')
            except:
                pass

        if config:
            self.configOption = config

        self.planOption = ''
        if len(sys.argv) == 3:
            self.planOption = sys.argv[2]

        self.instanceId = self.getEC2InstanceIDOrReturnDSLAB()
        self.region_name = None
        self.opsId = None

        if os.path.exists("/home/ubuntu/aimaker-backend-deploy"):
            if os.path.exists("region.txt"):
                with open("region.txt", "r") as f:
                    self.region_name = f.read()
            else:
                self.region_name = "ap-northeast-2"
                try:
                    print("call")
                    r = requests.get("http://169.254.169.254/latest/dynamic/instance-identity/document", timeout=1)
                    response_json = r.json()
                    self.region_name = response_json.get('region')
                    with open("region.txt","w") as f:
                        f.write(self.region_name)
                except:
                    pass

            if 'i-' in self.instanceId:
                if os.path.exists("configOption.txt"):
                    with open("configOption.txt", "r") as f:
                        self.configOption = f.read()
                    if os.path.exists("planOption.txt"):
                        with open("planOption.txt", "r") as f:
                            self.planOption = f.read()
                    if os.path.exists("opsId.txt"):
                        with open("opsId.txt", "r") as f:
                            self.opsId = f.read()
                else:
                    ec2 = self.getBotoClient('ec2', region_name=self.region_name)
                    ec2instances = ec2.describe_instances(InstanceIds=[self.instanceId], )
                    for instanceRaw in ec2instances.get("Reservations", []):
                        instance = instanceRaw.get("Instances", [{}])[0]
                        tags = instance.get("Tags", [])
                        for tag in tags:
                            if tag.get("Key") == "configOption":
                                self.configOption = tag.get("Value")
                                with open("configOption.txt","w") as f:
                                    f.write(self.configOption)
                            if tag.get("Key") == "planOption":
                                self.planOption = tag.get("Value")
                                with open("planOption.txt","w") as f:
                                    f.write(self.planOption)
                            if tag.get("Key") == "opsId":
                                self.opsId = tag.get("Value")
                                with open("opsId.txt","w") as f:
                                    f.write(self.opsId)

        self.enterprise = True if self.configOption == "enterprise" else False

        self.backendURL = "https://dslabaa.ds2.ai"
        self.frontendURL = "https://refactoring.ds2.ai"
        self.bucket_name = util_configs.get('bucket_name', '')
        self.slackAppLogChannelURL = util_configs.get('slackAppLogChannelURL', '')
        self.slackDaemonChannelURL = util_configs.get('slackDaemonChannelURL', '')
        self.slackMonitoringChannelURL = util_configs.get('slackMonitoringChannelURL', '')
        self.slackTrainingErrorChannelURL = util_configs.get('slackTrainingErrorChannelURL', '')
        self.slackAppErrorChannelURL = util_configs.get('slackAppErrorChannelURL', '')
        self.slackDaemonErrorChannelURL = util_configs.get('slackDaemonErrorChannelURL', '')
        self.slackUnittestChannelURL = util_configs.get('slackUnittestChannelURL', '')
        self.slackCrawlingTestChannelURL = util_configs.get('slackCrawlingTestChannelURL', '')
        self.slackInquiryChannelURL = util_configs.get('slackInquiryChannelURL', '')
        self.slackPGPaymentSuccess = util_configs.get('slackPGPaymentSuccess', '')
        self.slackPGPaymentFail = util_configs.get('slackPGPaymentFail', '')
        self.slackPGRegistrationSuccess = util_configs.get('slackPGRegistrationSuccess', '')
        self.slackPGRegistrationFail = util_configs.get('slackPGRegistrationFail', '')
        self.slackPGRefundSuccess = util_configs.get('slackPGRefundSuccess', '')
        self.slackPGRefundFail = util_configs.get('slackPGRefundFail', '')
        self.slackPGRefundRequested = util_configs.get('slackPGRefundRequested', '')
        self.slackAlarmBotChannelURL = util_configs.get('slackAlarmBotChannelURL', '')
        self.slackConTactChannelURL = util_configs.get('slackConTactChannelURL', '')
        self.slackSalesChannelURL = util_configs.get('slackSalesChannelURL', '')
        self.slackAutoAppLogChannelURL = util_configs.get('slackAutoAppLogChannelURL', '')
        self.slackDataAnalyzePartChannelURL = util_configs.get('slackDataAnalyzePartChannelURL', '')
        self.slackBusinessPartChannelURL = util_configs.get('slackBusinessPartChannelURL', '')
        self.slackServerStatusURL = util_configs.get('slackServerStatusURL', '')
        self.slack_enterprise_url = util_configs.get('slackEnterpriseFeedbackURL', '')
        self.paypleURL = util_configs.get('paypleURL', '')
        self.stripe_api_key = util_configs.get('stripe_api_key', '')
        self.eximbay_basic_url = util_configs.get('eximbay_basic_url', '')
        self.eximbay_direct_url = util_configs.get('eximbay_direct_url', '')
        self.paypal_client_id = util_configs.get('paypal_client_id', '')
        self.paypal_client_secret = util_configs.get('paypal_client_secret', '')
        self.zoom_ouath_token = util_configs.get('zoom_ouath_token', '')
        self.zoom_client_id = util_configs.get('zoom_client_id', '')
        self.tradier_url = util_configs.get('tradier_url', '')
        self.tradier_client_id = util_configs.get('tradier_client_id', '')
        self.tradier_client_secret = util_configs.get('tradier_client_secret', '')
        self.tradier_access_token = util_configs.get('tradier_access_token', '')
        self.payplePayload = util_configs.get('payplePayload', '')
        self.app_link_en = "https://ds2.ai/redirect.html"
        self.eximbay_version = "230"
        self.paypleHeaders = {'referer': "https://console.ds2.ai"}
        self.eximbay_secret_key = aistore_configs.get('eximbay_secret_key')
        self.eximbay_mid = aistore_configs.get('eximbay_mid')
        self.enterprise_key = "enterprise_key_dev"
        self.metabase_port = "13009"
        self.metabase_url = f'http://0.0.0.0:{self.metabase_port}'
        self.metabase_database_name = util_configs.get('metabase_database_name', '')
        self.metabase_admin_email = util_configs.get('metabase_admin_email', '')
        self.metabase_admin_password = util_configs.get('metabase_admin_password', '')

        self.payplePayload = {
            "cst_id": "test",
            "custKey": "abcd1234567890"
        }
        if self.configOption in "prod":
            self.bucket_name = aistore_configs.get('prod_bucket_name')
        if (self.configOption in "prod" or self.configOption in "enterprise") and not self.is_dev_test:
            self.paypleURL = aistore_configs.get('paypleURL', '')
            self.payplePayload = aistore_configs.get('payple_payload')
            self.slackAppLogChannelURL = aistore_configs.get('slackAppLogChannelURL', '')
            self.slackDaemonChannelURL = aistore_configs.get('slackDaemonChannelURL', '')
            self.slackMonitoringChannelURL = aistore_configs.get('slackMonitoringChannelURL', '')
            self.slackTrainingErrorChannelURL = aistore_configs.get('slackTrainingErrorChannelURL', '')
            self.slackAppErrorChannelURL = aistore_configs.get('slackAppErrorChannelURL', '')
            self.slackDaemonErrorChannelURL = aistore_configs.get('slackDaemonErrorChannelURL', '')
            self.slackUnittestChannelURL = aistore_configs.get('slackUnittestChannelURL', '')
            self.slackCrawlingTestChannelURL = aistore_configs.get('slackCrawlingTestChannelURL', '')
            self.slackConTactChannelURL = aistore_configs.get('slackConTactChannelURL', '')
            self.slackSalesChannelURL = aistore_configs.get('slackSalesChannelURL', '')
            self.slackAutoAppLogChannelURL = aistore_configs.get('slackAutoAppLogChannelURL', '')
            self.slackDataAnalyzePartChannelURL = aistore_configs.get('slackDataAnalyzePartChannelURL', '')
            self.slackBusinessPartChannelURL = aistore_configs.get('slackBusinessPartChannelURL', '')
            self.slackServerStatusURL = aistore_configs.get('slackServerStatusURL', '')
            self.slack_enterprise_url = aistore_configs.get('slackEnterpriseFeedbackURL', '')
            self.zoom_ouath_token = aistore_configs.get('zoom_ouath_token', '')
            self.zoom_client_id = aistore_configs.get('zoom_client_id', '')
            self.eximbay_basic_url = aistore_configs.get('eximbay_basic_url', '')
            self.eximbay_direct_url = aistore_configs.get('eximbay_direct_url', '')
            self.tradier_url = aistore_configs.get('tradier_url', '')
            self.backendURL = "https://api.ds2.ai"
            self.frontendURL = "https://console.ds2.ai"
            self.stripe_api_key = aistore_configs.get('stripe_api_key', '')
            self.eximbay_secret_key = aistore_configs.get('eximbay_secret_key', '')
            self.eximbay_mid = aistore_configs.get('eximbay_mid', '')
            self.paypal_client_id = aistore_configs.get('paypal_client_id', '')
            self.paypal_client_secret = aistore_configs.get('paypal_client_secret', '')
            self.tradier_client_id = aistore_configs.get('tradier_client_id', '')
            self.tradier_client_secret = aistore_configs.get('tradier_client_secret', '')
            self.tradier_access_token = aistore_configs.get('tradier_access_token', '')
            self.metabase_admin_password = aistore_configs.get('metabase_admin_pw', '')
            self.enterprise_key = aistore_configs.get('enterprisekey12', '')
        if self.configOption in "enterprise":
            self.backendURL = f"http://{self.public_ip_address}:13002"
            self.frontendURL = f"http://{self.public_ip_address}:13000"

        if type(self.payplePayload) == dict:
            self.payplePayload["PCD_PAY_TYPE"] = "card"
            self.payplePayload["PCD_SIMPLE_FLAG"] = "Y"

        self.maxsize = 5 * 1024 * 1024 * 1024
        self.csvmaxsize = 50 * 1024 * 1024 * 1024
        self.Imgmaxsize = 50 * 1024 * 1024 * 1024
        self.video_max_size = 50 * 1024 * 1024 * 1024
        self.ce = self.getBotoClient('ce', region_name=None)
        self.usd_to_krw_rate = 1200

    def get_metabase_client(self):
        return MetabaseAPI(self.metabase_url, self.metabase_admin_email, self.metabase_admin_password)

    def getBotoClient(self, name, region_name="ap-northeast-2"):
        if self.configOption == "enterprise":
            return enterprise_boto_object
        if region_name:
            return boto3.client(name, aws_access_key_id=self.access_key,
                                aws_secret_access_key=self.secret_key, region_name=region_name)
        else:
            return boto3.client(name, aws_access_key_id=self.access_key,
                                aws_secret_access_key=self.secret_key)

    def check_deposit(self, user, amount):

        amount = float(amount)
        if user is not None and type(user) != dict:
            user = user.__dict__['__data__']
        if user is not None and amount > 0 and float(user['deposit']) < amount and user['cardInfo'] is None:
            self.sendSlackMessage(
                f"check_deposit() \ndeposit을 초과하였습니다. {user['email']} (ID: {user['id']})",
                appLog=True, userInfo=user)
            return True
        else:
            return False

    def sendEmailAfterFinishingProject(self, project, user):
        projectName = f"#{str(project['id'])} {project['projectName']}"
        languageCode = user['lang']
        if languageCode == 'en':
            link = f'{self.frontendURL}/admin/process/' + str(project['id'])
            Subject = f'All AI training has been completed.  {projectName}'
        else:
            link = f'{self.frontendURL}/admin/process/' + str(project['id'])
            Subject = f'모든 인공지능 학습이 완료되었습니다.  {projectName}'
        # link = f'{self.frontendURL}/admin/process/' + str(project['id'])
        To = user['email']
        Content = self.getContentForFinishingProject(projectName, link, languageCode)
        result = self.sendEmail(To, Subject, Content)
        return result


    def sendEmailAfterInviteGroup(self, group, user, adminUser, languageCode):
        groupName = f"#{str(group['id'])} {group['groupname']}"
        Subject = f'| You have been invited to {groupName} Group. |' if languageCode == 'en' else f'| {groupName} 그룹에 초대되었습니다. |'
        link = f'{self.frontendURL}/admin/setting/share'
        To = user['email']
        Content = self.getContentForInviteGroup(groupName, adminUser['email'], link, languageCode)
        result = self.sendEmail(To, Subject, Content)
        return result

    def getContentForInviteGroup(self, groupName, userName, link, languageCode):
        if languageCode == 'ko':
            return  f"""
            <html><body>
            <br>안녕하세요,
            <br>"{userName}"님께서 "#{groupName}" 그룹으로 초대하였습니다.
            <br>초대 수락 및 거절은 하단 링크를 통하여 하시거나 메인페이지에서 로그인 하신 뒤 세팅 > 공유하기 탭에서 가능합니다.
            <br>동일 그룹의 초대를 3번 이상 거절 할 경우, 해당 그룹에 참여할 수 없으므로 유의해주시길 바랍니다.
            <br>
            <br>감사합니다
            <br>
            <br><b>나의 그롭</b> 링크 : <a href="{link}">{link}</a>
            <br>
            <br>
            <br>DS2.ai 팀 드림
            <br>
            </body><html>
            """
        elif languageCode == 'en':
            return f"""
            <html><body>
            <br>Hello,
            <br>You have been invited to "#{groupName}" by "{userName}".
            <br>Follow the link or go to My page > Settings > Shared tab to accept or reject the invitation.
            <br>Please note that if you reject an invitation to join a group over 3 times, you may no longer be invited to that group. 
            <br>
            <br>See my groups : <a href="{link}">{link}</a>
            <br>
            <br>Thank you,
            <br>CLICK AI Team
            <br>
            </body><html>
            """

    def getContentForFinishingProject(self, project_name, link, languageCode):
        if languageCode == 'ko':
            return f"""
                <html><body>
                <br>안녕하세요,
                <br>
                <br>요청 주신 "{project_name}" 의 모든 인공지능 개발이 완료되었으니 아래 링크를 통해 확인 부탁드립니다.
                <br>
                <br><a href="{link}">{link}</a>
                <br>
                <br>감사합니다.
                <br>
                <br>DS2.ai 팀 드림
                <br>
                </body><html>
                    """
        else:
            return f"""
                <html><body>
                 <br>Hello,
                 <br>
                 <br>All AI development of "{project_name}" you requested has been completed, so please check it through the link below.
                 <br>
                 <br><a href="{link}">{link}</a>
                 <br>
                 <br>Thank you.
                 <br>
                 <br>From DS2.ai Team
                 <br>
                 </body><html>
                     """

    def sendRegistrationEmail(self, user, languageCode = 'ko'):

        provider = user.get('provider')
        link = self.backendURL + f"/email-confirm/?token={user['emailTokenCode']}&user={user['id']}&provider={provider}"
        To = user['email']
        Content = self.get_email_confirm_contents(link, languageCode, provider)

        Subject = f'[DS2.AI] 회원가입 인증 메일입니다.' if languageCode == 'ko' else '[DS2.AI] Please complete your account verification.'

        result = self.sendEmail(To, Subject, Content, provider=provider)

        return result

    def sendResetPasswordEmail(self, email, code, provider, languageCode = 'ko'):

        Subject = f'[DS2.AI] 비밀번호 초기화 메일입니다.' if languageCode == 'ko' else '[DS2.AI] Please complete your password reset.'
        front_url = self.frontendURL

        link = front_url + f"/resetpassword?code={code}"
        To = email
        Content = self.get_password_reset_contents(link, languageCode, provider)

        result = self.sendEmail(To, Subject, Content, provider)

        return result

    def sendEmail(self, To, Subject, Content, provider='DS2.ai'):

        if self.configOption in "enterprise":
            return

        FROM = formataddr((str(Header(provider, 'utf-8')), 'noreply@dslab.global'))
        msg = MIMEMultipart('alternative')
        msg['Subject'] = Subject
        msg['From'] = FROM
        msg['To'] = To
        gmail_user = aistore_configs.get('gmail_user', '')
        gmail_pwd = aistore_configs.get('gmail_pwd', '')
        part2 = MIMEText(Content, 'html')
        msg.attach(part2)
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(gmail_user, gmail_pwd)
        result = server.sendmail(FROM, To, msg.as_string())
        server.close()

        return result

    def get_email_confirm_contents(self, link, languageCode, social_type):
        if languageCode == 'ko':
            return f"""
            <html><body>
            <br>안녕하세요,
            <br>
            <br>아래 링크를 클릭하여 회원 가입 절차를 마무리해주시길 바랍니다.
            <br>
            <br><a href="{link}">{link}</a>
            <br>
            <br>감사합니다.
            <br>
            <br>{social_type} 팀 드림
            <br>
            </body><html>
                """
        elif languageCode == 'en':
            return f"""
            <html><body>
            <br>Hello,
            <br>
            <br>Please follow the link below to complete registration.
            <br>
            <br><a href="{link}">{link}</a>
            <br>
            <br>Thank you,
            <br>{social_type} Team
            <br>
            </body><html>
                """

    def get_password_reset_contents(self, link, languageCode, provider):
        if languageCode == 'ko':
            return f"""
            <html><body>
            <br>안녕하세요,
            <br>
            <br>아래 링크를 클릭하여 비밀번호 초기화 절차를 마무리해주시길 바랍니다.
            <br>
            <br><a href="{link}">{link}</a>
            <br>
            <br>감사합니다.
            <br>
            <br>{provider} 팀 드림
            <br>
            </body><html>
                """
        elif languageCode == 'en':
            return f"""
            <html><body>
            <br>Hello,
            <br>
            <br>Please follow the link below to complete password reset process.
            <br>
            <br><a href="{link}">{link}</a>
            <br>
            <br>Thank you,
            <br>{provider} Team
            <br>
            </body><html>
                """

    def getEC2InstanceIDOrReturnDSLAB(self):

        if self.configOption == 'enterprise':
            return 'dslab'
        else:
            if pwd.getpwuid(os.getuid()).pw_name in ['root', 'ubuntu']:
                try:
                    return requests.get("http://metadata/computeMetadata/v1/instance/id", headers={'Metadata-Flavor': 'Google'}).text
                except:
                    try:
                        return requests.get("http://169.254.169.254/latest/meta-data/instance-id", timeout=1).text
                    except:
                        pass
                    return pwd.getpwuid(os.getuid()).pw_name
                    pass
            else:
                return pwd.getpwuid(os.getuid()).pw_name

    def send_slack_on_enterprise(self, slack_dict: dict):
        if slack_dict.get('channel') == "feedback":
            channel_url = self.slack_enterprise_url

        payload = 'payload={"text": "' + slack_dict.get('message').replace('"', "'") + '"}'
        requests.post(channel_url, data=payload.encode('utf-8'), headers=self.slackHeader)

    def sendSlackMessage(self, message, monitoring=False, daemon=False, unittest=False
                         ,trainingError=False, daemonError=False, appError=False, inquiry=False, userInfo = None,
                         appLog=False, bot=False, contact=False, autoAppLog=False, sales=False,
                         crawling=False, data_part=False, server_status=False, business_part=False,
                         is_agreed_behavior_statistics=False
                         ):
        if self.configOption == "enterprise" and not is_agreed_behavior_statistics:
            return
        error = False
        try:
            if type(userInfo) != dict:
                userInfo = userInfo.__dict__['__data__']
        except:
            userInfo = {}
            pass

        if 'isBetaUser' in userInfo and userInfo['isBetaUser']:
            return 'Test'

        try:
            if trainingError or daemonError or appError:
                error = True
            if 'Traceback' in message and error:
                exceptiondata = message.splitlines()
                message = f"{exceptiondata[-1]} {exceptiondata[-2]}\n{exceptiondata[1]} {exceptiondata[2]}\n"

            if not appError:
                payload = 'payload={"text": "' + message.replace('"',"'") + '"}'
            else:
                payload = 'payload={"text": "' + message.replace('"', "'")+ f"| \n| user-id : {userInfo.get('id')} |\n| user-email : {userInfo.get('email')} |"+'" }'

            if bot:
                requests.post(self.slackAlarmBotChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if trainingError:
                requests.post(self.slackTrainingErrorChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if daemonError:
                requests.post(self.slackDaemonErrorChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if appError:
                requests.post(self.slackAppErrorChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if monitoring:
                requests.post(self.slackMonitoringChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if daemon:
                requests.post(self.slackDaemonChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if unittest:
                requests.post(self.slackUnittestChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if inquiry:
                requests.post(self.slackInquiryChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if appLog:
                requests.post(self.slackAppLogChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if autoAppLog:
                requests.post(self.slackAutoAppLogChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if contact:
                requests.post(self.slackConTactChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if sales:
                requests.post(self.slackSalesChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if data_part:
                requests.post(self.slackDataAnalyzePartChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if business_part:
                requests.post(self.slackBusinessPartChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if crawling:
                requests.post(self.slackCrawlingTestChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
            if server_status:
                requests.post(self.slackServerStatusURL, data=payload.encode('utf-8'), headers=self.slackHeader)

            if True not in [bot, trainingError, daemonError, appError, monitoring, daemon, unittest,
                            inquiry, appLog, autoAppLog, contact, sales, data_part, crawling, server_status]:
                requests.post(self.slackChannelURL, data=payload.encode('utf-8'), headers=self.slackHeader)  # 사내전체
        except:
            pass
    def sendSlackMessageV2(self, message, channelURL):
        payload = 'payload={"text": "' + message.replace('"',"'").replace('$', '') + '"}'
        try:
            return requests.post(channelURL, data=payload.encode('utf-8'), headers=self.slackHeader)
        except:
            pass

    def getStrUserId(self, userInfo):
        return str(userInfo.get('id')) if userInfo != None and userInfo.get('id') else None

    def unquote_url(self, url):
        """Decodes a URL that was encoded using quote_url.
        Returns a unicode instance.
        """
        return urllib.parse.unquote(url)

    def replace_right(self, source, target, replacement, replacements=None):
        return replacement.join(source.rsplit(target, replacements))

    def get_length(self, filename):
        result = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                                 "format=duration", "-of",
                                 "default=noprint_wrappers=1:nokey=1", filename],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        return float(result.stdout)

    def isValidKey(self, key):
        try:
            result = jwt.decode(key, self.enterprise_key, algorithms=["HS256"])
        except:
            print(traceback.format_exc())
            return False

        result['startDate'] = datetime.datetime.strptime(result['startDate'], '%Y-%m-%d').date()
        result['endDate'] = datetime.datetime.strptime(result['endDate'], '%Y-%m-%d').date()
        today = datetime.datetime.now().date()

        # if get_mac() != result['mac']:
        #     return False

        if today < result.get("startDate") or today > result.get("endDate"):
            return False

        return True

    def get_key_info(self, key):
        try:
            result = jwt.decode(key, self.enterprise_key, algorithms=["HS256"])
            return result
        except:
            print(traceback.format_exc())
            return None

    def parseColumData(self, datas, dataCnt):

        dataObject = {}
        hasTimeSeriesData = False
        if dataCnt != 0:
            dataObject["length"] = dataCnt-1
        else:
            dataObject["length"] = len(datas)
        dataObject["miss"] = datas.isnull().sum()
        unique = datas.unique()
        dataObject["unique"] = len(unique)

        des = datas.describe()

        dataObject["type"] = "object"

        try:
            pd.to_datetime(datas.replace(r'^\s*$', np.nan, regex=True).dropna())
            dataObject["type"] = "datetime"
        except:
            pass

        try:
            pd.to_numeric(datas)
            dataObject["mean"] = round(des["mean"], 6)
            dataObject["max"] = round(des["max"], 6)
            dataObject["min"] = round(des["min"], 6)
            dataObject["std"] = None if np.isnan(des["std"]) else round(des["std"], 6)
            dataObject["type"] = "number"
        except:
            dataObject["top"] = None if not des["top"] or str(des["top"] == 'nan') else str(des['top'])
            dataObject["freq"] = None if not des["freq"] or str(des["freq"] == 'nan') else str(des['freq'])

        # if dataObject["type"] == "object" and len(unique) < 250:
        if len(unique) < 1000:
            uniqueList = datas.unique().tolist()
            dataObject["uniqueValues"] = uniqueList

        return dataObject

    def set_aws_user_id(self, user_id):

        cost_category = self.ce.describe_cost_category_definition(
            CostCategoryArn='arn:aws:ce::691864559919:costcategory/1800ee46-22ab-4513-81ad-8ad33d96a193',
        )
        userIds = cost_category["CostCategory"]['Rules'][0]['Rule']['Tags']['Values']
        userIds.append(str(user_id))
        try:
            response = self.ce.update_cost_category_definition(
                CostCategoryArn='arn:aws:ce::691864559919:costcategory/1800ee46-22ab-4513-81ad-8ad33d96a193',
                RuleVersion='CostCategoryExpression.v1',
                Rules=[{'Value': 'defaultCostCategory',
                        'Rule': {'Tags': {'Key': 'userId', 'Values': userIds, 'MatchOptions': ['EQUALS']}}
                        }]
            )
            return response
        except:
            raise ex.FailAWSUserEx(user_id)

    def get_aws_user_id(self):

        start_date = (datetime.datetime.now().date().replace(day=1)).strftime('%Y-%m-%d')
        # start_date = '2021-01-01'
        end_date = (datetime.datetime.now().date() + relativedelta(days=1)).strftime('%Y-%m-%d')
        response = self.ce.get_tags(
            TimePeriod={
                'Start': start_date,
                'End': end_date
            },
            TagKey='userId',
        )
        return response['Tags']

    def check_aws_user_id(self, user_id):
        aws_id_list = self.get_aws_user_id()
        if user_id in aws_id_list:
            return True
        return False

    def last_day_of_month(self, any_day):
        next_month = any_day.replace(day=28) + datetime.timedelta(days=4)
        return next_month - datetime.timedelta(days=next_month.day)

    def sendEmailAfterFinishingTrainingFirstModel(self, project, user):
        projectName = f"#{str(project['id'])} - {project['projectName']}"
        languageCode = user['lang']
        To = user['email']

        if languageCode == 'en':
            link = f'{self.frontendURL}/admin/process/' + str(project['id'])
            Subject = f'The first artificial intelligence has been learned. {projectName}'
            Content = self.getContentForFinishingTrainingFirstModel(projectName, link, languageCode)
        else:
            link = f'{self.frontendURL}/admin/process/' + str(project['id'])
            Subject = f'첫 번째 인공지능이 학습되었습니다. {projectName}'
            Content = self.getContentForFinishingTrainingFirstModel(projectName, link, languageCode)

        result = self.sendEmail(To, Subject, Content)
        return result

    def sendEmailAfterFinishingAutolabelingProject(self, project, user):
        projectName = f"#{str(project['id'])} {project['projectName']}"
        languageCode = user.lang
        if languageCode == 'en':
            link = f'{self.frontendURL}/admin/process/' + str(project['id'])
            Subject = f'The auto-labeling task has been completed.  {projectName}'
            Content = getEngContentCompleteAutolabeling(projectName, link, languageCode)
        else:
            link = f'{self.frontendURL}/admin/process/' + str(project['id'])
            Subject = f'오토라벨링이 완료되었습니다.  {projectName}'
            Content = getContentCompleteAutolabeling(projectName, link, languageCode)
        # link = f'{self.frontendURL}/admin/process/' + str(project['id'])
        # link = link + '?page=admin/process/' + str(project['id'])
        To = user.email
        result = self.sendEmail(To, Subject, Content)
        return result

    def getContentForFinishingTrainingFirstModel(self, project_name, link, lang):
        if 'en' == lang:
            return f"""
<html><body>
<br>Hello,
<br>
<br>The first AI development of "{project_name}" you requested has been completed, so please check it through the link below.
<br>
<br><a href="{link}">{link}</a>
<br>
<br>Currently, dozens of other artificial intelligences to improve accuracy are also being created. We will send you an email once the development of all artificial intelligence is complete, so please check it.
<br>
<br>Thank you.
<br>
<br>- DS2.ai Team
<br>
</body><html>
"""
        else:
            return f"""
<html><body>
<br>안녕하세요,
<br>
<br>요청 주신 "{project_name}" 의 첫 번째 인공지능 개발이 완료 되었으니 아래 링크를 통해 확인 부탁드립니다.
<br>
<br><a href="{link}">{link}</a>
<br>
<br>현재 정확도 개선을 위한 다른 수십개의 다양한 인공지능도 함께 만들어지고 있습니다. 모든 인공지능이 개발 완료되면 다시 한 번 메일을 보내드릴테니 확인 부탁드립니다.
<br>
<br>감사합니다.
<br>
<br>DS2.ai 팀 드림
<br>
</body><html>
    """
