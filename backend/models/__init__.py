import datetime
import functools
import json
import ssl
import traceback
import os
import peewee as pw
import sys

import requests

from src.util import Util

import os
if os.path.exists('./src/creating/aistore_config.py'):
    from src.creating.aistore_config import aistore_configs
else:
    aistore_configs = {}
from playhouse.pool import PooledMySQLDatabase
from playhouse.signals import Model, post_save
from bson.objectid import ObjectId
from pymongo import MongoClient, UpdateOne

if os.path.exists('./astoredaemon/util_config.py'):
    from astoredaemon.util_config import util_configs
else:
    util_configs = {}

if os.path.exists('./astoredaemon/t_config.py'):
    from astoredaemon.t_config import internal_survey
    from astoredaemon.t_config import external_survey
    from astoredaemon.t_config import t_rating
    from astoredaemon.t_config import survey_key_t
    from astoredaemon.t_config import process_t
else:
    util_configs = {}


rd = None
try:

    import redis
    rd = redis.StrictRedis(host='localhost', port=6379, db=0)

except:
    pass

utilClass = Util()
mongodb_conn = None
mongodb_conn_dev = None
master_ip = None
if os.path.exists(f"{os.path.expanduser('~')}/ds2ai/master_ip.txt"):
    with open(f"{os.path.expanduser('~')}/ds2ai/master_ip.txt", "r") as r:
        master_ip = r.readlines()[0]
        print(f"master ip : {master_ip}")

def check_open_new_port():

    is_open = True
    try:
        import horovod
    except:
        is_open = False
    return is_open

if 'true' in os.environ.get('DS2_DEV_TEST', 'false'):
    result = check_open_new_port()
    skyhub = pw.MySQLDatabase(util_configs.get('staging_db_schema'),
                              host=util_configs.get('test_db_host'),
                              port=util_configs.get('test_db_port'),
                              user=util_configs.get('test_db_user'),
                              passwd=util_configs.get('test_db_passwd'))
    # skyhub = pw.MySQLDatabase('astore',
    #                           host="0.0.0.0",
    #                           port=13006,
    #                           user="root",
    #                           passwd="dslabglobal")
    mongodb = 'astoretest'
    quentdb = 'quent'
else:
    if utilClass.configOption in 'prod' or utilClass.configOption == 'prod_local':
        skyhub = pw.MySQLDatabase(aistore_configs['prod_db_schema'], host=aistore_configs['prod_db_host'],
                                  port=13006 if check_open_new_port() else 3306,
                                  user=aistore_configs['prod_db_user'], passwd=aistore_configs['prod_db_passwd'])
        mongodb = 'astore'
        quentdb = 'quent'
    elif utilClass.configOption in 'enterprise':
        public_ip_address = "0.0.0.0"
        user = "root"
        passwd = "dslabglobal"

        try:
            public_ip_address = requests.get('https://checkip.amazonaws.com', timeout=2).text.strip()
            print("public_ip_address")
            print(public_ip_address)
            if aistore_configs.get("public_ip_address") == public_ip_address:
                user = aistore_configs.get('prod_db_user')
                passwd = aistore_configs.get('prod_db_passwd')
        except:
            pass

        skyhub = pw.MySQLDatabase("astore", host=master_ip if master_ip else "0.0.0.0", port=13006 if check_open_new_port() else 3306,
                                  user=user, passwd=passwd)
        mongodb = 'astoretest'
        quentdb = 'quent'
    elif utilClass.configOption in 'prod_test':
        skyhub = pw.MySQLDatabase(aistore_configs['prod_db_test_schema'], host=aistore_configs['prod_db_host'],
                                  port=13006 if check_open_new_port() else 3306,
                                  user=aistore_configs['prod_db_user'], passwd=aistore_configs['prod_db_passwd'])
        mongodb = 'astore'
        quentdb = 'quent'
    elif utilClass.configOption == 'dev_test':
        skyhub = pw.MySQLDatabase(util_configs.get('test_db_schema'),
                                  host=util_configs.get('test_db_host'),
                                  port=util_configs.get('test_db_port'),
                                  user=util_configs.get('test_db_user'),
                                  passwd=util_configs.get('test_db_passwd'))
        mongodb = 'astoretest'
        quentdb = 'quent'
    else:
        skyhub = pw.MySQLDatabase(util_configs.get('staging_db_schema'),
                                  host=util_configs.get('test_db_host'),
                                  port=util_configs.get('test_db_port'),
                                  user=util_configs.get('test_db_user'),
                                  passwd=util_configs.get('test_db_passwd'))
        mongodb = 'astoretest'
        quentdb = 'quent'


# db_conn_dict = {mongodb: None, quentdb: None}
db_conn_dict = {mongodb: None}

def json_default(value):
    if isinstance(value, datetime.date):
        return value.strftime('%Y-%m-%d %H:%M:%S')
    else:
        return str(value)
    raise TypeError('not JSON serializable')

class LongTextField(pw.TextField):
    field_type = 'LONGTEXT'

class JSONField(pw.TextField):
    field_type = 'LONGTEXT'

    def __init__(self, null=False):
        super(JSONField, self).__init__(null=null)
        self.isContain = False

    def db_value(self, value):
        if self.isContain:
            output = super().db_value(value)
            self.isContain = False
            return output
        return json.dumps(value, ensure_ascii=False, default=json_default)

    def python_value(self, value):
        if value not in [None, '']:
            return json.loads(value)

    def contains(self, value):
        value = '%%%s%%' % value
        self.isContain = True
        return pw.Expression(self, pw.OP.ILIKE, value)

class MySQLModel(Model):
    """A base model that will use our MySQL database"""
    class Meta:
        database = skyhub

class adminTable(MySQLModel):
    class Meta:
        db_table = 'skyhub_administrator'

    id = pw.AutoField()
    username = pw.CharField(null=True)
    email = pw.CharField(null=True)
    password = pw.CharField(null=True)
    resetPasswordToken = pw.CharField(null=True)
    blocked = pw.BooleanField(null=True)
    key = pw.CharField(null=True)
    maxuser = pw.IntegerField(null=True)
    maxgpu = pw.IntegerField(null=True)
    plan = pw.CharField(null=True)
    mac = pw.CharField(null=True)
    register_flag = pw.BooleanField(null=True, default=0)
    startDate = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    endDate = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    is_trial_used = pw.BooleanField(null=True)

class enterpriseTable(MySQLModel):
    class Meta:
        db_table = 'enterprise'

    id = pw.AutoField()
    username = pw.CharField(null=True)
    email = pw.CharField(null=True)
    password = pw.CharField(null=True)
    resetPasswordToken = pw.CharField(null=True)
    blocked = pw.BooleanField(null=True)
    key = pw.CharField(null=True)
    maxuser = pw.IntegerField(null=True)
    maxgpu = pw.IntegerField(null=True)
    startDate = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    endDate = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    plan = pw.CharField(null=True)

class employeeTable(MySQLModel):
    class Meta:
        db_table = 'employeeInformation'

    id = pw.AutoField()
    name = pw.CharField(null=True)
    email = pw.CharField(null=True)
    token = pw.TextField(null=True)
    joinDate = pw.DateField()
    resignationDate = pw.DateField()
    useVacationCount = pw.IntegerField(null=True)
    totalVacationCount = pw.IntegerField(null=True)
    birthday = pw.DateField()
    role = pw.IntegerField(null=True)
    part = pw.IntegerField(null=True)
    isConfirm = pw.IntegerField(null=True)
    isExit = pw.IntegerField(null=True)
    has_participate_coffetime = pw.BooleanField(null=True)

class templatesTable(MySQLModel):
    class Meta:
        db_table = 'templates'

    id = pw.AutoField()
    templateName = pw.CharField(null=True)
    templateCategory = pw.CharField(null=True)
    s3url = pw.CharField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    projectcategory = pw.CharField(null=True)
    templateDescription = LongTextField(null=True)
    templateDescriptionEn = LongTextField(null=True)
    isTrainingMethod = pw.BooleanField(null=True)

class projectsTable(MySQLModel):
    class Meta:
        db_table = 'projects'

    id = pw.AutoField()
    projectName = pw.CharField(null=True)
    status = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    user = pw.IntegerField(null=True)
    valueForPredict = pw.CharField(null=True)
    option = pw.CharField(null=True)
    csvupload = pw.IntegerField(null=True)
    fileStructure = LongTextField(null=True)
    fileStructureGAN = LongTextField(null=True)
    filePath = pw.CharField(null=True)
    statusText = pw.CharField(null=True)
    originalFileName = pw.CharField(null=True)
    trainingMethod = pw.CharField(null=True)
    detectedTrainingMethod = pw.CharField(null=True)
    isTest = pw.BooleanField(null=True)
    isSample = pw.IntegerField(null=True)
    errorCountConflict = pw.IntegerField(null=True, default=0)
    errorCountMemory = pw.IntegerField(null=True, default=0)
    errorCountNotExpected = pw.IntegerField(null=True, default=0)
    successCount = pw.IntegerField(null=True, default=0)
    valueForNorm = pw.DoubleField(null=True)
    description = LongTextField(null=True)
    license = pw.CharField(null=True)
    sampleData = LongTextField(null=True)
    yClass = pw.TextField(null=True)
    datasetlicense = pw.IntegerField(null=True)
    hasTextData = pw.BooleanField(null=True)
    hasImageData = pw.BooleanField(null=True)
    isSentCompletedEmail = pw.BooleanField(null=True)
    projectcategory = pw.IntegerField(null=True)
    isParameterCompressed = pw.BooleanField(null=True)
    fileSize = pw.IntegerField(null=True)
    hasTimeSeriesData = pw.BooleanField(null=True)
    isFavorite = pw.BooleanField(null=True)
    dataset = pw.IntegerField(null=True)
    joinInfo = JSONField(null=True)
    trainingColumnInfo = JSONField(null=True)
    preprocessingInfo = JSONField(null=True)
    preprocessingInfoValue = JSONField(null=True)
    labelproject = pw.IntegerField(null=True)
    isSentFirstModelDoneEmail = pw.BooleanField(null=True)
    valueForPredictColumnId = pw.IntegerField(null=True)
    dataconnectorsList = JSONField(null=True)
    timeSeriesColumnInfo = JSONField(null=True)
    startTimeSeriesDatetime = pw.CharField(null=True)
    endTimeSeriesDatetime = pw.CharField(null=True)
    analyticsStandard = pw.CharField(null=True)
    prescriptionAnalyticsInfo = JSONField(null=True)
    isDeleted = pw.BooleanField(null=True)
    webhookURL = pw.CharField(null=True)
    webhookMethod = pw.CharField(null=True)
    webhookData = JSONField(null=True)
    sharedgroup = LongTextField(null=True)
    background = pw.CharField(null=True)
    resultJson = LongTextField(null=True)
    labelType = pw.CharField(null=True)
    isCustomAi = pw.BooleanField(null=True)
    hasBestModel = pw.BooleanField(null=True)
    valueForUserColumnId = pw.IntegerField(null=True)
    valueForItemColumnId = pw.IntegerField(null=True)
    recommenderUserColumn = pw.CharField(null=True)
    recommenderItemColumn = pw.CharField(null=True)
    priority_flag = pw.BooleanField(null=True, default=0)
    instanceType = pw.CharField(null=True)
    algorithmType = pw.CharField(null=True)
    isVerify = pw.BooleanField(null=True)
    training_data_statistics = JSONField(null=True)
    algorithm = pw.CharField(null=True, default='auto')
    require_gpus = JSONField(null=True)
    require_gpus_total = JSONField(null=True)

class flowTable(MySQLModel):
    class Meta:
        db_table = 'flow'

    id = pw.AutoField()
    flow_name = pw.CharField(null=True)
    flow_type = pw.CharField(null=True, default='model')
    flow_token = pw.TextField(null=True)
    status = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    user = pw.IntegerField(null=True)
    is_test = pw.BooleanField(null=True)
    is_sample = pw.BooleanField(null=True)
    is_deleted = pw.BooleanField(null=True)
    option = pw.CharField(null=True)
    role = pw.CharField(null=True)
    is_shared = pw.BooleanField(null=True)
    sharedgroup = LongTextField(null=True)
    flow_node_info = JSONField(null=True)

class monitoringAlertTable(MySQLModel):
    class Meta:
        db_table = 'monitoring_alert'

    id = pw.AutoField()
    flow_node_id = pw.IntegerField(null=True)
    monitoring_alert_name = pw.CharField(null=True)
    monitoring_alert_type = pw.CharField(null=True)
    status = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    user = pw.IntegerField(null=True)
    is_test = pw.BooleanField(null=True)
    is_sample = pw.IntegerField(null=True)
    is_deleted = pw.IntegerField(null=True)
    monitoring_alert_info = JSONField(null=True)

class flowNodeTable(MySQLModel):
    class Meta:
        db_table = 'flow_node'

    id = pw.AutoField()
    flow_id = pw.IntegerField(null=True)
    flow_node_name = pw.CharField(null=True)
    flow_node_type = pw.CharField(null=True)
    status = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    user = pw.IntegerField(null=True)
    is_test = pw.BooleanField(null=True)
    is_sample = pw.IntegerField(null=True)
    is_deleted = pw.IntegerField(null=True)
    option = pw.CharField(null=True)
    flow_node_info = JSONField(null=True)

class userPropertyTable(MySQLModel):
    class Meta:
        db_table = 'user_property'

    id = pw.AutoField()
    user_property_name = pw.CharField(null=True)
    user_property_type = pw.CharField(null=True)
    status = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    user = pw.IntegerField(null=True)
    is_test = pw.BooleanField(null=True)
    is_sample = pw.IntegerField(null=True)
    is_deleted = pw.IntegerField(null=True)
    option = pw.CharField(null=True)
    user_property_info = JSONField(null=True)

class projecthistoriesTable(MySQLModel):
    class Meta:
        db_table = 'projecthistories'

    id = pw.AutoField()
    projectName = pw.CharField(null=True)
    status = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    user = pw.IntegerField(null=True)
    valueForPredict = pw.CharField(null=True)
    option = pw.CharField(null=True)
    csvupload = pw.IntegerField(null=True)
    fileStructure = LongTextField(null=True)
    fileStructureGAN = LongTextField(null=True)
    filePath = pw.CharField(null=True)
    statusText = pw.CharField(null=True)
    originalFileName = pw.CharField(null=True)
    trainingMethod = pw.CharField(null=True)
    detectedTrainingMethod = pw.CharField(null=True)
    isTest = pw.BooleanField(null=True)
    isSample = pw.IntegerField(null=True)
    errorCountConflict = pw.IntegerField(null=True)
    errorCountMemory = pw.IntegerField(null=True)
    errorCountNotExpected = pw.IntegerField(null=True)
    successCount = pw.IntegerField(null=True)
    valueForNorm = pw.DoubleField(null=True)
    description = LongTextField(null=True)
    license = pw.CharField(null=True)
    sampleData = LongTextField(null=True)
    yClass = pw.TextField(null=True)
    datasetlicense = pw.IntegerField(null=True)
    hasTextData = pw.BooleanField(null=True)
    hasImageData = pw.BooleanField(null=True)
    isSentCompletedEmail = pw.BooleanField(null=True)
    projectcategory = pw.IntegerField(null=True)
    isParameterCompressed = pw.BooleanField(null=True)
    fileSize = pw.IntegerField(null=True)
    hasTimeSeriesData = pw.BooleanField(null=True)
    isFavorite = pw.BooleanField(null=True)
    labelproject = pw.IntegerField(null=True)
    isSentFirstModelDoneEmail = pw.BooleanField(null=True)
    valueForPredictColumnId = pw.IntegerField(null=True)
    dataconnectorsList = JSONField(null=True)
    timeSeriesColumnInfo = JSONField(null=True)
    startTimeSeriesDatetime = pw.CharField(null=True)
    endTimeSeriesDatetime = pw.CharField(null=True)
    analyticsStandard = pw.CharField(null=True)
    isDeleted = pw.BooleanField(null=True)
    webhookURL = pw.CharField(null=True)
    webhookMethod = pw.CharField(null=True)
    webhookData = JSONField(null=True)
    valueForUserColumnId = pw.IntegerField(null=True)
    valueForItemColumnId = pw.IntegerField(null=True)
    recommenderUserColumn = pw.CharField(null=True)
    recommenderItemColumn = pw.CharField(null=True)
    instanceType = pw.CharField(null=True)
    algorithmType = pw.CharField(null=True)
    isVerify = pw.BooleanField(null=True)
    training_data_statistics = JSONField(null=True)

class modelsTable(MySQLModel):
    class Meta:
        db_table = 'models'

    id = pw.AutoField()
    name = pw.CharField(null=True)
    description = pw.CharField(null=True)
    sampleSize = pw.IntegerField(null=True)
    validation = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    accuracy = pw.DoubleField(null=True)
    status = pw.IntegerField(null=True)
    statusText = pw.TextField(null=True)
    progress = pw.DoubleField(null=True)
    modeldetail = pw.IntegerField(null=True)
    sampledatum = pw.IntegerField(null=True)
    project = pw.IntegerField(null=True)
    epoch = pw.IntegerField(null=True)
    lossFunction = pw.CharField(null=True)
    usingBert = pw.IntegerField(null=True)
    learningRateFromFit = pw.DoubleField(null=True)
    layerDeep = pw.IntegerField(null=True)
    layerWidth = pw.IntegerField(null=True)
    dropOut = pw.DoubleField(null=True)
    filePath = pw.CharField(null=True)
    confusion_matrix = LongTextField(null=True)
    most_confused = LongTextField(null=True)
    top_k_accuracy = pw.DoubleField(null=True)
    dice = pw.DoubleField(null=True)
    error_rate = pw.DoubleField(null=True)
    yClass = pw.CharField(null=True)
    feature_importance = LongTextField(null=True)
    cm_statistics = LongTextField(null=True)
    records = LongTextField(null=True)
    visionModel = pw.CharField(null=True)
    objectDetectionModel = pw.CharField(null=True)
    confusionMatrix = LongTextField(null=True)
    mostConfused = LongTextField(null=True)
    topKAccuracy = pw.DoubleField(null=True)
    errorRate = pw.DoubleField(null=True)
    featureImportance = LongTextField(null=True)
    cmStatistics = LongTextField(null=True)
    rmse = pw.DoubleField(null=True)
    errorCountConflict = pw.IntegerField(null=True)
    errorCountMemory = pw.IntegerField(null=True)
    errorCountNotExpected = pw.IntegerField(null=True)
    isModelDownloaded = pw.BooleanField(null=True)
    mase = pw.DoubleField(null=True)
    mape = pw.DoubleField(null=True)
    r2score = pw.DoubleField(null=True)
    totalLoss = pw.DoubleField(null=True)
    ping_at = pw.DateTimeField(null=True)
    zombieCount = pw.IntegerField(null=True)
    timeSeriesTrainingRow = pw.IntegerField(null=True)
    isFavorite = pw.BooleanField(null=True)
    prescriptionAnalyticsInfo = JSONField(null=True)
    bestAccuracy = pw.DoubleField(null=True)
    bestAccuracyEpoch = pw.IntegerField(null=True)
    bestRmse = pw.DoubleField(null=True)
    bestRmseEpoch = pw.IntegerField(null=True)
    ap = pw.DoubleField(null=True)
    ap50 = pw.DoubleField(null=True)
    ap75 = pw.DoubleField(null=True)
    aps = pw.DoubleField(null=True)
    apm = pw.DoubleField(null=True)
    apl = pw.DoubleField(null=True)
    started_at = pw.DateTimeField(null=True)
    finished_at = pw.DateTimeField(null=True)
    duration = pw.IntegerField(null=True)
    token = pw.TextField(null=True)
    ap_info = JSONField(null=True)
    hyper_param_id = pw.CharField(null=True)

class marketProjectsTable(MySQLModel):
    class Meta:
        db_table = 'marketprojects'

    id = pw.AutoField()
    projectName = pw.CharField(null=True)
    status = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    user = pw.IntegerField(null=True)
    valueForPredict = pw.CharField(null=True)
    option = pw.CharField(null=True)
    csvupload = pw.IntegerField(null=True)
    fileStructure = LongTextField(null=True)
    fileStructureGAN = LongTextField(null=True)
    filePath = pw.CharField(null=True)
    statusText = pw.CharField(null=True)
    originalFileName = pw.CharField(null=True)
    trainingMethod = pw.CharField(null=True)
    detectedTrainingMethod = pw.CharField(null=True)
    isTest = pw.BooleanField(null=True)
    isSample = pw.IntegerField(null=True)
    errorCountConflict = pw.IntegerField(null=True, default=0)
    errorCountMemory = pw.IntegerField(null=True, default=0)
    errorCountNotExpected = pw.IntegerField(null=True, default=0)
    successCount = pw.IntegerField(null=True, default=0)
    valueForNorm = pw.DoubleField(null=True)
    description = LongTextField(null=True)
    license = pw.CharField(null=True)
    sampleData = LongTextField(null=True)
    yClass = pw.TextField(null=True)
    datasetlicense = pw.IntegerField(null=True)
    hasTextData = pw.BooleanField(null=True)
    hasImageData = pw.BooleanField(null=True)
    isSentCompletedEmail = pw.BooleanField(null=True)
    projectcategory = pw.IntegerField(null=True)
    isParameterCompressed = pw.BooleanField(null=True)
    fileSize = pw.IntegerField(null=True)
    hasTimeSeriesData = pw.BooleanField(null=True)
    isFavorite = pw.BooleanField(null=True)
    dataset = pw.IntegerField(null=True)
    joinInfo = JSONField(null=True)
    trainingColumnInfo = JSONField(null=True)
    preprocessingInfo = JSONField(null=True)
    preprocessingInfoValue = JSONField(null=True)
    labelproject = pw.IntegerField(null=True)
    isSentFirstModelDoneEmail = pw.BooleanField(null=True)
    valueForPredictColumnId = pw.IntegerField(null=True)
    dataconnectorsList = JSONField(null=True)
    timeSeriesColumnInfo = JSONField(null=True)
    startTimeSeriesDatetime = pw.CharField(null=True)
    endTimeSeriesDatetime = pw.CharField(null=True)
    analyticsStandard = pw.CharField(null=True)
    prescriptionAnalyticsInfo = JSONField(null=True)
    isDeleted = pw.BooleanField(null=True)
    webhookURL = pw.CharField(null=True)
    webhookMethod = pw.CharField(null=True)
    webhookData = JSONField(null=True)
    sharedgroup = LongTextField(null=True)
    background = pw.CharField(null=True)
    resultJson = LongTextField(null=True)
    labelType = pw.CharField(null=True)
    valueForUserColumnId = pw.IntegerField(null=True)
    valueForItemColumnId = pw.IntegerField(null=True)
    recommenderUserColumn = pw.CharField(null=True)
    recommenderItemColumn = pw.CharField(null=True)
    service_type = pw.CharField(null=True)
    dashboardPreviewImagePath = pw.CharField(null=True)
    marketmodel = pw.IntegerField(null=True)
    standardFilePath = pw.TextField(null=True)
    nextPaymentDate = pw.DateTimeField(null=True)
    planId = pw.IntegerField(null=True)
    predict_column_name = pw.CharField(null=True)
    stock_type = pw.CharField(null=True)
    start_time = pw.DateTimeField(null=True)
    end_time = pw.DateTimeField(null=True)
    timeMemory = pw.IntegerField(null=True)
    goal = pw.CharField(null=True)
    goal_buy_condition = pw.DoubleField(null=True)
    goal_sell_condition = pw.DoubleField(null=True)
    use_factors = JSONField(null=True)
    use_indices = JSONField(null=True)
    use_commodities = JSONField(null=True)
    use_currencies = JSONField(null=True)
    use_tickers = JSONField(null=True)
    condition_higher_than_percentage = JSONField(null=True)
    condition_lower_than_percentage = JSONField(null=True)
    condition_volume_higher_than_percentage = pw.DoubleField(null=True)
    condition_volume_lower_than_percentage = pw.DoubleField(null=True)
    condition_in_array = JSONField(null=True)
    custom_condition_py_file = pw.TextField(null=True)
    regressionModelProject = pw.IntegerField(null=True)
    classificationBuyModelProject = pw.IntegerField(null=True)
    classificationSellModelProject = pw.IntegerField(null=True)
    research = pw.IntegerField(null=True)
    thumbnail = pw.CharField(null=True)
    multiple_ai_model_options = JSONField(null=True)
    industry_groups = JSONField(null=True)
    is_blocked = pw.BooleanField(null=True)
    pricing_agreement = pw.BooleanField(null=True)
    realtime_backtest = pw.BooleanField(null=True)
    price = pw.DoubleField(null=True)
    next_price = pw.DoubleField(null=True)
    next_price_date = pw.DateTimeField(null=True)
    backtest_mock = pw.IntegerField(null=True)

class marketModelsTable(MySQLModel):
    class Meta:
        db_table = 'marketmodels'

    id = pw.AutoField()
    name_kr = pw.CharField(null=True)
    name_en = pw.CharField(null=True)
    description = pw.TextField(null=True)
    sampleSize = pw.IntegerField(null=True)
    validation = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    accuracy = pw.DoubleField(null=True)
    status = pw.IntegerField(null=True)
    statusText = pw.CharField(null=True)
    progress = pw.DoubleField(null=True)
    modeldetail = pw.IntegerField(null=True)
    sampledatum = pw.IntegerField(null=True)
    project = pw.IntegerField(null=True)
    epoch = pw.IntegerField(null=True)
    lossFunction = pw.CharField(null=True)
    usingBert = pw.IntegerField(null=True)
    learningRateFromFit = pw.DoubleField(null=True)
    layerDeep = pw.IntegerField(null=True)
    layerWidth = pw.IntegerField(null=True)
    dropOut = pw.DoubleField(null=True)
    filePath = pw.CharField(null=True)
    confusion_matrix = LongTextField(null=True)
    most_confused = LongTextField(null=True)
    top_k_accuracy = pw.DoubleField(null=True)
    dice = pw.DoubleField(null=True)
    error_rate = pw.DoubleField(null=True)
    yClass = pw.CharField(null=True)
    feature_importance = LongTextField(null=True)
    cm_statistics = LongTextField(null=True)
    records = LongTextField(null=True)
    visionModel = pw.CharField(null=True)
    objectDetectionModel = pw.CharField(null=True)
    confusionMatrix = LongTextField(null=True)
    mostConfused = LongTextField(null=True)
    topKAccuracy = pw.DoubleField(null=True)
    errorRate = pw.DoubleField(null=True)
    featureImportance = LongTextField(null=True)
    cmStatistics = LongTextField(null=True)
    rmse = pw.DoubleField(null=True)
    errorCountConflict = pw.IntegerField(null=True, default=0)
    errorCountMemory = pw.IntegerField(null=True, default=0)
    errorCountNotExpected = pw.IntegerField(null=True, default=0)
    isModelDownloaded = pw.BooleanField(null=True)
    mase = pw.DoubleField(null=True)
    mape = pw.DoubleField(null=True)
    r2score = pw.DoubleField(null=True)
    totalLoss = pw.DoubleField(null=True)
    ping_at = pw.DateTimeField(null=True)
    zombieCount = pw.IntegerField(null=True)
    timeSeriesTrainingRow = pw.IntegerField(null=True)
    isFavorite = pw.BooleanField(null=True)
    prescriptionAnalyticsInfo = JSONField(null=True)
    bestAccuracy = pw.DoubleField(null=True)
    bestAccuracyEpoch = pw.IntegerField(null=True)
    bestRmse = pw.DoubleField(null=True)
    bestRmseEpoch = pw.IntegerField(null=True)
    ap = pw.DoubleField(null=True)
    ap50 = pw.DoubleField(null=True)
    ap75 = pw.DoubleField(null=True)
    aps = pw.DoubleField(null=True)
    apm = pw.DoubleField(null=True)
    apl = pw.DoubleField(null=True)
    # isBestModel = pw.BooleanField(null=True)
    # labelprojectId = pw.IntegerField(null=True)
    isEngineAI = pw.BooleanField(null=True)
    isIndustryAI = pw.BooleanField(null=True)
    displayName = pw.CharField(null=True)
    externalAiName = pw.CharField(null=True)
    externalAiType = pw.CharField(null=True)
    imageUrl = pw.CharField(null=True)
    requirePredictUnit = pw.IntegerField(null=True)
    externalAiDescription = LongTextField(null=True)
    externalAiSummary = LongTextField(null=True)
    hasPredictAll = pw.BooleanField(null=True)
    category = pw.CharField(null=True)
    inputData_kr = LongTextField(null=True)
    outputData_kr = LongTextField(null=True)
    inputData_en = LongTextField(null=True)
    outputData_en = LongTextField(null=True)
    isQuickstart = pw.BooleanField(null=True)
    isCustomAi = pw.BooleanField(null=True)
    price = pw.DoubleField(null=True)
    url = pw.TextField(null=True)
    url_en = pw.TextField(null=True)
    model = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    thumbnail = pw.TextField(null=True)
    slug = pw.CharField(null=True)
    service_type = pw.CharField(null=True)
    priority_flag = pw.BooleanField(null=True)
    visible_flag = pw.BooleanField(null=True, default=1)

class marketRequests(MySQLModel):
    class Meta:
        db_table = 'marketRequests'

    id = pw.AutoField()
    userId = pw.IntegerField(null=True)
    marketmodel = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    created_ai_datetime = pw.DateTimeField(null=True)
    status = pw.IntegerField(null=True)
    phoneNumber = pw.TextField(null=True)
    s3key = pw.TextField(null=True)
    description = pw.TextField(null=True)
    marketproject = pw.IntegerField(null=True)
    isDeleted = pw.BooleanField(null=True, default=0)

class marketPlansTable(MySQLModel):
    class Meta:
        db_table = 'marketplans'

    id = pw.AutoField()
    hour = pw.IntegerField(null=True)
    price_per_month = pw.DoubleField(null=True)
    sale_price_per_month = pw.DoubleField(null=True)
    market_models = pw.IntegerField(null=True)

class opsProjectsTable(MySQLModel):
    class Meta:
        db_table = 'opsprojects'

    id = pw.AutoField()
    projectName = pw.CharField(null=True)
    status = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    user = pw.IntegerField(null=True)
    valueForPredict = pw.CharField(null=True)
    option = pw.CharField(null=True)
    csvupload = pw.IntegerField(null=True)
    fileStructure = LongTextField(null=True)
    fileStructureGAN = LongTextField(null=True)
    filePath = pw.CharField(null=True)
    statusText = pw.CharField(null=True)
    originalFileName = pw.CharField(null=True)
    trainingMethod = pw.CharField(null=True)
    detectedTrainingMethod = pw.CharField(null=True)
    isTest = pw.BooleanField(null=True)
    isSample = pw.IntegerField(null=True)
    errorCountConflict = pw.IntegerField(null=True, default=0)
    errorCountMemory = pw.IntegerField(null=True, default=0)
    errorCountNotExpected = pw.IntegerField(null=True, default=0)
    successCount = pw.IntegerField(null=True, default=0)
    valueForNorm = pw.DoubleField(null=True)
    description = LongTextField(null=True)
    license = pw.CharField(null=True)
    sampleData = LongTextField(null=True)
    yClass = pw.TextField(null=True)
    datasetlicense = pw.IntegerField(null=True)
    hasTextData = pw.BooleanField(null=True)
    hasImageData = pw.BooleanField(null=True)
    isSentCompletedEmail = pw.BooleanField(null=True)
    projectcategory = pw.IntegerField(null=True)
    isParameterCompressed = pw.BooleanField(null=True)
    fileSize = pw.IntegerField(null=True)
    hasTimeSeriesData = pw.BooleanField(null=True)
    isFavorite = pw.BooleanField(null=True)
    dataset = pw.IntegerField(null=True)
    joinInfo = JSONField(null=True)
    trainingColumnInfo = JSONField(null=True)
    preprocessingInfo = JSONField(null=True)
    preprocessingInfoValue = JSONField(null=True)
    labelproject = pw.IntegerField(null=True)
    isSentFirstModelDoneEmail = pw.BooleanField(null=True)
    valueForPredictColumnId = pw.IntegerField(null=True)
    dataconnectorsList = JSONField(null=True)
    timeSeriesColumnInfo = JSONField(null=True)
    startTimeSeriesDatetime = pw.CharField(null=True)
    endTimeSeriesDatetime = pw.CharField(null=True)
    analyticsStandard = pw.CharField(null=True)
    prescriptionAnalyticsInfo = JSONField(null=True)
    isDeleted = pw.BooleanField(null=True)
    webhookURL = pw.CharField(null=True)
    webhookMethod = pw.CharField(null=True)
    webhookData = JSONField(null=True)
    sharedgroup = LongTextField(null=True)
    background = pw.CharField(null=True)
    resultJson = LongTextField(null=True)
    labelType = pw.CharField(null=True)
    framework = pw.CharField(null=True)
    developProjectId = pw.IntegerField(null=True)
    project = pw.IntegerField(null=True)
    model = pw.IntegerField(null=True)
    dataconnector = pw.IntegerField(null=True)
    opsModel = pw.IntegerField(null=True)
    launchTemplate = pw.CharField(null=True)
    valueForUserColumnId = pw.IntegerField(null=True)
    valueForItemColumnId = pw.IntegerField(null=True)
    recommenderUserColumn = pw.CharField(null=True)
    recommenderItemColumn = pw.CharField(null=True)
    inferenceCount = pw.IntegerField(null=True, default=0)
    server_size_changed_at = pw.DateTimeField(null=True)
    algorithm = pw.CharField(null=True, default='auto')
class opsModelsTable(MySQLModel):
    class Meta:
        db_table = 'opsmodels'

    id = pw.AutoField()
    name = pw.CharField(null=True)
    description = pw.TextField(null=True)
    sampleSize = pw.IntegerField(null=True)
    validation = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    accuracy = pw.DoubleField(null=True)
    status = pw.IntegerField(null=True)
    statusText = pw.CharField(null=True)
    progress = pw.DoubleField(null=True)
    modeldetail = pw.IntegerField(null=True)
    sampledatum = pw.IntegerField(null=True)
    opsProject = pw.IntegerField(null=True)
    epoch = pw.IntegerField(null=True)
    lossFunction = pw.CharField(null=True)
    usingBert = pw.IntegerField(null=True)
    learningRateFromFit = pw.DoubleField(null=True)
    layerDeep = pw.IntegerField(null=True)
    layerWidth = pw.IntegerField(null=True)
    dropOut = pw.DoubleField(null=True)
    filePath = pw.CharField(null=True)
    confusion_matrix = LongTextField(null=True)
    most_confused = LongTextField(null=True)
    top_k_accuracy = pw.DoubleField(null=True)
    dice = pw.DoubleField(null=True)
    error_rate = pw.DoubleField(null=True)
    yClass = pw.CharField(null=True)
    feature_importance = LongTextField(null=True)
    cm_statistics = LongTextField(null=True)
    records = LongTextField(null=True)
    visionModel = pw.CharField(null=True)
    objectDetectionModel = pw.CharField(null=True)
    confusionMatrix = LongTextField(null=True)
    mostConfused = LongTextField(null=True)
    topKAccuracy = pw.DoubleField(null=True)
    errorRate = pw.DoubleField(null=True)
    featureImportance = LongTextField(null=True)
    cmStatistics = LongTextField(null=True)
    rmse = pw.DoubleField(null=True)
    errorCountConflict = pw.IntegerField(null=True)
    errorCountMemory = pw.IntegerField(null=True)
    errorCountNotExpected = pw.IntegerField(null=True)
    isModelDownloaded = pw.BooleanField(null=True)
    mase = pw.DoubleField(null=True)
    mape = pw.DoubleField(null=True)
    r2score = pw.DoubleField(null=True)
    totalLoss = pw.DoubleField(null=True)
    ping_at = pw.DateTimeField(null=True)
    zombieCount = pw.IntegerField(null=True)
    timeSeriesTrainingRow = pw.IntegerField(null=True)
    isFavorite = pw.BooleanField(null=True)
    prescriptionAnalyticsInfo = JSONField(null=True)
    bestAccuracy = pw.DoubleField(null=True)
    bestAccuracyEpoch = pw.IntegerField(null=True)
    bestRmse = pw.DoubleField(null=True)
    bestRmseEpoch = pw.IntegerField(null=True)
    ap = pw.DoubleField(null=True)
    ap50 = pw.DoubleField(null=True)
    ap75 = pw.DoubleField(null=True)
    aps = pw.DoubleField(null=True)
    apm = pw.DoubleField(null=True)
    apl = pw.DoubleField(null=True)
    # isBestModel = pw.BooleanField(null=True)
    # labelprojectId = pw.IntegerField(null=True)
    isEngineAI = pw.BooleanField(null=True)
    isIndustryAI = pw.BooleanField(null=True)
    displayName = pw.CharField(null=True)
    externalAiName = pw.CharField(null=True)
    externalAiType = pw.CharField(null=True)
    imageUrl = pw.CharField(null=True)
    requirePredictUnit = pw.IntegerField(null=True)
    externalAiDescription = LongTextField(null=True)
    externalAiSummary = LongTextField(null=True)
    hasPredictAll = pw.BooleanField(null=True)
    category = pw.CharField(null=True)
    inputData = LongTextField(null=True)
    outputData = LongTextField(null=True)
    isQuickstart = pw.BooleanField(null=True)
    isFullmanaged = pw.BooleanField(null=True)
    price = pw.IntegerField(null=True)
    url = pw.TextField(null=True)
    framework = pw.CharField(null=True)
    developModelId = pw.IntegerField(null=True)
    token = pw.IntegerField(null=True)

class modelchartsTable(MySQLModel):
    class Meta:
        db_table = 'modelcharts'

    id = pw.AutoField()
    epoch = pw.IntegerField(null=True)
    training_loss = pw.DoubleField(null=True)
    valid_loss = pw.DoubleField(null=True)
    precision = pw.DoubleField(null=True)
    recall = pw.DoubleField(null=True)
    f_beta = pw.DoubleField(null=True)
    auroc = pw.DoubleField(null=True)
    kappa_score = pw.DoubleField(null=True)
    matthews_correff = pw.DoubleField(null=True)
    accuracy = pw.DoubleField(null=True)
    model = pw.DoubleField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    rmse = pw.DoubleField(null=True)
    lossDA = pw.DoubleField(null=True)
    lossGA = pw.DoubleField(null=True)
    lossCycleA = pw.DoubleField(null=True)
    lossIdtA = pw.DoubleField(null=True)
    lossDB = pw.DoubleField(null=True)
    lossGB = pw.DoubleField(null=True)
    lossCycleB = pw.DoubleField(null=True)
    lossIdtB = pw.DoubleField(null=True)
    totalLoss = pw.DoubleField(null=True)

class opsServerGroupsTable(MySQLModel):
    class Meta:
        db_table = 'opsservergroups'

    id = pw.AutoField()
    serverType = pw.CharField(null=True)
    instanceId = pw.CharField(null=True)
    status = pw.IntegerField(null=True)
    opsProject = pw.IntegerField(null=True)
    publicIp = pw.CharField(null=True)
    region = pw.CharField(null=True)
    timezone = pw.CharField(null=True)
    terminated_at = pw.DateTimeField(null=True)
    last_paid_at = pw.DateTimeField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    availabilityZone = pw.CharField(null=True)
    lifecycleState = pw.CharField(null=True)
    healthStatus = pw.CharField(null=True)
    minServerSize = pw.IntegerField(null=True)
    maxServerSize = pw.IntegerField(null=True)
    startServerSize = pw.IntegerField(null=True)
    autoScalingGroupName = pw.CharField(null=True)
    targetGroupArn = pw.CharField(null=True)
    ruleArn = pw.CharField(null=True)
    ruleArnHttp = pw.CharField(null=True)
    launchTemplate = pw.CharField(null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)

class serverPricingTable(MySQLModel):
    class Meta:
        db_table = 'serverpricing'

    id = pw.AutoField()
    serverType = pw.CharField(null=True)
    region = pw.CharField(null=True)
    provider = pw.CharField(null=True)
    countryCode = pw.CharField(null=True)
    originPricePerHour = pw.DoubleField(null=True)
    pricePerHourSkyhubAi = pw.DoubleField(null=True)
    pricePerHourSelfModeling = pw.DoubleField(null=True)
    vCPU = pw.CharField(null=True)
    memory = pw.CharField(null=True)
    storage = pw.CharField(null=True)
    networkPerformance = pw.CharField(null=True)
    displayName = pw.CharField(null=True)
    localZone = pw.CharField(null=True)
    isLock = pw.BooleanField(null=True)

class groupsTable(MySQLModel):
    class Meta:
        db_table = 'groups'

    id = pw.AutoField()
    groupname = pw.CharField(null=True)
    groupType = pw.CharField(null=True)
    projectsid = pw.TextField(null=True)
    labelprojectsid = pw.TextField(null=True)
    teamId = pw.IntegerField(null=True)
    provider = pw.CharField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)

class developedAiModelsTable(MySQLModel):
    class Meta:
        db_table = 'developedaimodels'

    id = pw.AutoField()
    modelName = pw.CharField(null=True)
    modeltype = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    status = pw.IntegerField(null=True)
    modelpath = pw.TextField(null=True)
    apiKey = pw.CharField(null=True)
    additionalKey = pw.CharField(null=True)
    modelVersion = pw.CharField(null=True)
    isExampleModel = pw.BooleanField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)

class groupUsersTable(MySQLModel):
    class Meta:
        db_table = 'groupusers'

    id = pw.AutoField()
    groupId = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    useremail = pw.CharField(null=True)
    role = pw.CharField(null=True)
    acceptcode = pw.IntegerField(null=True)
    invitationcount = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)

class teamsTable(MySQLModel):
    class Meta:
        db_table = 'teams'

    id = pw.AutoField()
    name = pw.CharField(null=True)
    usageplan = pw.IntegerField(null=True)
    teamType = pw.CharField(null=True)
    isDeleted = pw.BooleanField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    nextPlan = pw.IntegerField(null=True)
    nextPaymentDate = pw.DateTimeField(null=True)
    billingCycle = pw.CharField(null=True)
    billingCurrency = pw.CharField(null=True)
    billingUserCount = pw.IntegerField(null=True, default=0)
    dateOfDeletion = pw.DateTimeField(null=True)
    additional_record_usage = pw.IntegerField(null=True)
    additional_meet_usage = pw.IntegerField(null=True)
    additional_advanced_stt_usage = pw.IntegerField(null=True)
    additional_record_plan_count = pw.IntegerField(null=True)
    additional_meet_plan_count = pw.IntegerField(null=True)
    additional_addvanced_stt_plan_count = pw.IntegerField(null=True)

class teamUsersTable(MySQLModel):
    class Meta:
        db_table = 'teamusers'

    id = pw.AutoField()
    teamId = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    acceptcode = pw.IntegerField(null=True)
    email = pw.CharField(null=True)
    role = pw.CharField(null=True)
    userType = pw.CharField(null=True)
    record_usage = pw.IntegerField(null=True)
    meet_usage = pw.IntegerField(null=True)
    advanced_stt_usage = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)

class favoriteModelsTable(MySQLModel):
    class Meta:
        db_table = 'models_users__users_models'

    id = pw.AutoField()
    user_id = pw.IntegerField(null=True)
    model_id = pw.IntegerField(null=True)
    projectId = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)

class teamUsersHistoriesTable(MySQLModel):
    class Meta:
        db_table = 'teamuserhistories'

    id = pw.AutoField()
    teamId = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    acceptcode = pw.IntegerField(null=True)
    role = pw.CharField(null=True)
    teamUserCount = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)


class systemInfoTable(MySQLModel):
    class Meta:
        db_table = 'systeminfo'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    minAppVersion = pw.IntegerField(null=True)


class notificationTable(MySQLModel):
    class Meta:
        db_table = 'notification'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    title = pw.CharField(null=True)
    body = pw.CharField(null=True)
    imgUrl = pw.CharField(null=True)
    title_ko = pw.CharField(null=True)
    body_ko = pw.CharField(null=True)

class usersTable(MySQLModel):
    class Meta:
        db_table = 'users-permissions_user'

    id = pw.AutoField()
    username = pw.CharField(null=True)
    email = pw.CharField(null=True)
    provider = pw.CharField(null=True)
    password = pw.CharField(null=True)
    resetPasswordToken = pw.CharField(null=True)
    confirmed = pw.IntegerField(default=1)
    blocked = pw.IntegerField(default=0)
    role = pw.IntegerField(null=True)
    socialID = pw.CharField(null=True)
    name = pw.CharField(null=True)
    resetPasswordRequestDatetime = pw.DateTimeField(null=True)
    resetPasswordVerifyLink = pw.CharField(null=True)
    resetPasswordVerifyTokenID = pw.CharField(null=True)
    emailVerifyRequestDatetime = pw.CharField(null=True)
    emailVerifyDatetime = pw.CharField(null=True)
    emailVerifyTokenID = pw.CharField(null=True)
    emailVerifyLink = pw.CharField(null=True)
    emailChangeValue = pw.CharField(null=True)
    emailChangeRequestDatetime = pw.CharField(null=True)
    emailChangeVerifyLink = pw.CharField(null=True)
    emailChangeVerifyTokenID = pw.CharField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    emailVerifiedYN = pw.CharField(null=True)
    phoneNumber = pw.CharField(null=True)
    sampledatum = pw.IntegerField(null=True)
    isAgreedWithPolicy = pw.IntegerField(null=True)
    isFirstplanDone = pw.BooleanField(null=True)
    usageplan = pw.IntegerField(null=True)
    cumulativeDiskUsage = pw.BigIntegerField(default=0, null=True)
    totalDiskUsage = pw.BigIntegerField(null=True, default=0)
    count = pw.IntegerField(null=True)
    dynos = pw.IntegerField(null=True)
    nextPaymentDate = pw.DateTimeField(null=True)
    cumulativeProjectCount = pw.IntegerField(default=0, null=True)
    cumulativePredictCount = pw.IntegerField(default=0, null=True)
    company = pw.CharField(null=True)
    nextDynos = pw.IntegerField(null=True)
    nextPlan = pw.IntegerField(null=True)
    isTest = pw.BooleanField(null=True)
    emailTokenCode = pw.CharField(null=True)
    promotion = pw.IntegerField(null=True)
    isDeleteRequested = pw.BooleanField(null=True)
    deleteReason = pw.CharField(null=True)
    promotionCode = pw.CharField(null=True)
    isRequestedRefunded = pw.BooleanField(null=True)
    billingKey = pw.CharField(null=True)
    token = pw.TextField(null=True)
    gender = pw.CharField(null=True)
    birth = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    appTokenCode = pw.CharField(null=True)
    appTokenCodeUpdatedAt = pw.DateTimeField(null=True)
    remainProjectCount = pw.IntegerField(default=0, null=True)
    remainPredictCount = pw.IntegerField(default=0, null=True)
    remainDiskUsage = pw.BigIntegerField(default=0, null=True)
    additionalApiRate = pw.IntegerField(default=0, null=True)
    additionalShareUser = pw.IntegerField(default=0, null=True)
    additionalProjectCount = pw.IntegerField(default=0, null=True)
    additionalPredictCount = pw.IntegerField(default=0, null=True)
    additionalDiskUsage = pw.IntegerField(default=0, null=True)
    additionalLabelCount = pw.IntegerField(default=0, null=True)
    cumulativeLabelCount = pw.IntegerField(default=0, null=True)
    cardInfo = pw.CharField(null=True)
    companyLogoUrl = pw.CharField(null=True)
    remainLabelCount = pw.IntegerField(default=0, null=True)
    utmSource = pw.CharField(null=True)
    utmMedium = pw.CharField(null=True)
    utmCampaign = pw.CharField(null=True)
    utmTerm = pw.CharField(null=True)
    utmContent = pw.CharField(null=True)
    remainVoucher = pw.DoubleField(null=True)
    isAiTrainer = pw.BooleanField(null=True)
    isBetaUser = pw.BooleanField(null=True)
    isAgreedMarketing = pw.BooleanField(null=True)
    isAgreedDataAcquisition = pw.BooleanField(null=True)
    invitingCode = pw.CharField(null=True)
    invitedCode = pw.CharField(null=True)
    lang = pw.CharField(null=True)
    fcmToken = pw.CharField(null=True)
    lastlyShareAgreeDatetime = pw.DateTimeField(null=True)
    deleteRequest_at = pw.DateTimeField(null=True)
    totalRecordTime = pw.IntegerField(null=True)
    cumulativeRecordTime = pw.IntegerField(default=0, null=True)
    socialToken = pw.TextField(null=True)
    trainingSecondCount = pw.IntegerField(default=0, null=True)
    manuallabelingCountCR = pw.IntegerField(default=0, null=True)
    manuallabelingCountOD = pw.IntegerField(default=0, null=True)
    manuallabelingCountKeypoint = pw.IntegerField(default=0, null=True)
    manuallabelingCountPedestrian = pw.IntegerField(default=0, null=True)
    manuallabelingCountSementic = pw.IntegerField(default=0, null=True)
    manualObjectCountOD = pw.IntegerField(default=0, null=True)
    manualObjectCountKeypoint = pw.IntegerField(default=0, null=True)
    manualObjectCountPedestrian = pw.IntegerField(default=0, null=True)
    manualObjectCountSementic = pw.IntegerField(default=0, null=True)
    autolabelingCountCR = pw.IntegerField(default=0, null=True)
    autolabelingCountOD = pw.IntegerField(default=0, null=True)
    autolabelingCountKeypoint = pw.IntegerField(default=0, null=True)
    autolabelingCountPedestrian = pw.IntegerField(default=0, null=True)
    autolabelingCountSementic = pw.IntegerField(default=0, null=True)
    autolabelingCountFace = pw.IntegerField(default=0, null=True)
    autolabelingCountDI = pw.IntegerField(default=0, null=True)
    autolabelingCountOCR = pw.IntegerField(default=0, null=True)
    autolabelingObjectCountOD = pw.IntegerField(default=0, null=True)
    autolabelingObjectCountKeypoint = pw.IntegerField(default=0, null=True)
    autolabelingObjectCountPedestrian = pw.IntegerField(default=0, null=True)
    autolabelingObjectCountFace = pw.IntegerField(default=0, null=True)
    autolabelingObjectCountDI = pw.IntegerField(default=0, null=True)
    autolabelingObjectCountOCR = pw.IntegerField(default=0, null=True)
    inferenceCountCR = pw.IntegerField(default=0, null=True)
    inferenceCountOD = pw.IntegerField(default=0, null=True)
    inferenceCountKeypoint = pw.IntegerField(default=0, null=True)
    inferenceCountPedestrian = pw.IntegerField(default=0, null=True)
    inferenceCountSementic = pw.IntegerField(default=0, null=True)
    inferenceCountFace = pw.IntegerField(default=0, null=True)
    inferenceCountDI = pw.IntegerField(default=0, null=True)
    inferenceCountOCR = pw.IntegerField(default=0, null=True)
    salesManager = pw.CharField(null=True)
    deposit = pw.DoubleField(default=0, null=True)
    usedPrice = pw.DoubleField(default=0, null=True)
    serverUsedPrice = pw.DoubleField(default=0, null=True)
    paymentDay = pw.IntegerField(default=5, null=True)
    stripeID = pw.CharField(null=True)
    intro1Checked = pw.BooleanField(default=0, null=True)
    intro2Checked = pw.BooleanField(default=0, null=True)
    intro3Checked = pw.BooleanField(default=0, null=True)
    intro4Checked = pw.BooleanField(default=0, null=True)
    magicCodeCount = pw.IntegerField(default=0, null=True)
    video_upload_available_usage = pw.IntegerField(default=600, null=True)
    video_upload_daily_usage = pw.IntegerField(default=0, null=True)
    first_offline_shop_expiration_date = pw.DateTimeField(null=True)
    first_offline_ad_expiration_date = pw.DateTimeField(null=True)
    first_dance_training_expiration_date = pw.DateTimeField(null=True)
    first_sport_training_expiration_date = pw.DateTimeField(null=True)
    first_sport_training_expiration_date = pw.DateTimeField(null=True)
    first_recovery_training_expiration_date = pw.DateTimeField(null=True)
    future_deposit_amount = pw.IntegerField(null=True)
    isUsingDiscoveryByManual = pw.BooleanField(null=True)
    usedDiscoveryTime = pw.IntegerField(null=True)
    usedSttSeconds = pw.IntegerField(null=True)
    accessToken = pw.CharField(null=True)
    oauthToken = pw.CharField(null=True)
    oauthTokenExpiresAt = pw.IntegerField(null=True)
    zoomAccessToken = pw.CharField(null=True)
    zoomRefreshToken = pw.CharField(null=True)
    zoomTokenExpiresAt = pw.IntegerField(null=True)
    zoomId = pw.CharField(null=True)
    personal_advanced_stt_usage = pw.IntegerField(null=True)
    personal_meet_usage = pw.IntegerField(null=True)
    personal_record_usage = pw.IntegerField(null=True)
    upbit_api_key = pw.CharField(null=True)
    upbit_secret = pw.CharField(null=True)
    binance_api_key = pw.CharField(null=True)
    binance_secret = pw.CharField(null=True)
    ko_webhook = pw.CharField(null=True)
    ko_secret = pw.CharField(null=True)
    tradier_access_token = pw.CharField(null=True)
    is_invalid_tradier_token = pw.BooleanField(null=True)
    is_admin = pw.BooleanField(null=True)
    tradier_name = pw.CharField(null=True)
    otp_key = pw.CharField(null=True)
    isAgreedBehaviorStatistics = pw.BooleanField(null=True)
    number_of_login_attempts = pw.IntegerField(null=0)
    credit = pw.FloatField(null=True)
    custom_model_credit = pw.IntegerField(default=0)
    last_posted_at = pw.DateTimeField(null=True)
    last_paid_posted_at = pw.DateTimeField(null=True)
    last_email_sent_at = pw.DateTimeField(null=True)
    notification_read_until = pw.IntegerField(default=0, null=True)
    is_business_account = pw.BooleanField(null=True)
    is_invited_business_account = pw.BooleanField(null=True)
    is_pro_plan_account = pw.BooleanField(null=True)
    is_artist_plan_account = pw.BooleanField(null=True)
    is_agreed_to_business_account = pw.BooleanField(null=True)
    uid = pw.CharField(null=True)
    latlng = pw.CharField(null=True)
    country = pw.CharField(null=True)
    free_credit = pw.FloatField(null=True)
    paid_credit = pw.FloatField(null=True)
    reward_free_credit_total = pw.FloatField(null=True)
    referral_registration_count = pw.IntegerField(default=0)
class userhistoriesTable(MySQLModel):
    class Meta:
        db_table = 'userhistories'

    id = pw.AutoField()
    email = pw.CharField(null=True)
    provider = pw.CharField(null=True)
    password = pw.CharField(null=True)
    resetPasswordToken = pw.CharField(null=True)
    confirmed = pw.IntegerField(null=True)
    blocked = pw.IntegerField(null=True)
    role = pw.IntegerField(null=True)
    socialID = pw.CharField(null=True)
    name = pw.CharField(null=True)
    resetPasswordRequestDatetime = pw.DateTimeField(null=True)
    resetPasswordVerifyLink = pw.CharField(null=True)
    resetPasswordVerifyTokenID = pw.CharField(null=True)
    emailVerifyRequestDatetime = pw.CharField(null=True)
    emailVerifyDatetime = pw.CharField(null=True)
    emailVerifyTokenID = pw.CharField(null=True)
    emailVerifyLink = pw.CharField(null=True)
    emailChangeValue = pw.CharField(null=True)
    emailChangeRequestDatetime = pw.CharField(null=True)
    emailChangeVerifyLink = pw.CharField(null=True)
    emailChangeVerifyTokenID = pw.CharField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    emailVerifiedYN = pw.CharField(null=True)
    phoneNumber = pw.CharField(null=True)
    sampledatum = pw.IntegerField(null=True)
    isAgreedWithPolicy = pw.IntegerField(null=True)
    isFirstplanDone = pw.BooleanField(null=True)
    usageplan = pw.IntegerField(null=True)
    cumulativeDiskUsage = pw.BigIntegerField(null=True, default=0)
    totalDiskUsage = pw.BigIntegerField(null=True, default=0)
    count = pw.IntegerField(null=True)
    dynos = pw.IntegerField(null=True)
    nextPaymentDate = pw.DateTimeField(null=True)
    cumulativeProjectCount = pw.IntegerField(null=True, default=0)
    cumulativePredictCount = pw.IntegerField(null=True, default=0)
    company = pw.CharField(null=True)
    nextDynos = pw.IntegerField(null=True)
    nextPlan = pw.IntegerField(null=True)
    isTest = pw.BooleanField(null=True)
    emailTokenCode = pw.CharField(null=True)
    promotion = pw.IntegerField(null=True)
    isDeleteRequested = pw.BooleanField(null=True)
    deleteReason = pw.CharField(null=True)
    promotionCode = pw.CharField(null=True)
    isRequestedRefunded = pw.BooleanField(null=True)
    billingKey = pw.CharField(null=True)
    token = pw.TextField(null=True)
    gender = pw.CharField(null=True)
    birth = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    appTokenCode = pw.CharField(null=True)
    appTokenCodeUpdatedAt = pw.DateTimeField(null=True)
    remainProjectCount = pw.IntegerField(default=0)
    remainPredictCount = pw.IntegerField(default=0)
    remainDiskUsage = pw.BigIntegerField(default=0)
    additionalApiRate = pw.IntegerField(default=0)
    additionalShareUser = pw.IntegerField(default=0)
    additionalProjectCount = pw.IntegerField(default=0)
    additionalPredictCount = pw.IntegerField(default=0)
    additionalDiskUsage = pw.IntegerField(default=0)
    additionalLabelCount = pw.IntegerField(default=0)
    cumulativeLabelCount = pw.IntegerField(default=0)
    cardInfo = pw.CharField(null=True)
    companyLogoUrl = pw.CharField(null=True)
    remainLabelCount = pw.IntegerField(default=0)
    utmSource = pw.CharField(null=True)
    utmMedium = pw.CharField(null=True)
    utmCampaign = pw.CharField(null=True)
    utmTerm = pw.CharField(null=True)
    utmContent = pw.CharField(null=True)
    remainVoucher = pw.DoubleField(null=True)
    isAiTrainer = pw.BooleanField(null=True)
    userid = pw.IntegerField(null=True)
    isBetaUser = pw.BooleanField(null=True)
    isAgreedMarketing = pw.BooleanField(null=True)
    invitingCode = pw.CharField(null=True)
    invitedCode = pw.CharField(null=True)
    lang = pw.CharField(null=True)
    fcmToken = pw.CharField(null=True)
    totalRecordTime = pw.IntegerField(null=True)
    cumulativeRecordTime = pw.IntegerField(default=0)

@post_save(sender=usersTable)
def on_save_handler(model_class, instance, created):
    data = {**instance.__dict__['__data__']}
    data["userid"] = data["id"]
    del data["id"]
    data["updated_at"] = datetime.datetime.utcnow()
    try:
        userhistoriesTable.create(**data)
    except:
        print(traceback.format_exc())
        pass

# class clientInnertripTable(MySQLModel):
#     class Meta:
#         db_table = 'client_innertrip'
#
#     workshop_id = pw.AutoField()
#     workshop_name = pw.CharField(null=True)
#     category = pw.CharField(null=True)
#     cat_detail = pw.CharField(null=True)
#     on_offline = pw.CharField(null=True)
#     min_num = pw.IntegerField(null=True)
#     max_num = pw.IntegerField(null=True)
#     leadtime = pw.DoubleField(null=True)
#     price = pw.IntegerField(null=True)
#     price_type = pw.CharField(null=True)

class instancesTable(MySQLModel):
    class Meta:
        db_table = 'instances'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    instanceName = pw.CharField(null=True)
    planType = pw.CharField(null=True)
    terminatedDate = pw.DateTimeField(null=True)
    isTest = pw.BooleanField(null=True)
    publicIp = pw.CharField(null=True)
    hasGpuError = pw.BooleanField(null=True)
    isDeleted = pw.BooleanField(null=True)

class serverBillingHistoriesTable(MySQLModel):
    class Meta:
        db_table = 'serverbillinghistories'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    userId = pw.CharField(null=True)
    price = pw.DoubleField(null=True, default=0)

class instanceHistoriesTable(MySQLModel):
    class Meta:
        db_table = 'instancehistories'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    instanceName = pw.CharField(null=True)
    planType = pw.CharField(null=True)
    terminatedDate = pw.DateTimeField(null=True)
    isTest = pw.BooleanField(null=True)
    publicIp = pw.CharField(null=True)
    hasGpuError = pw.BooleanField(null=True)
    configOption = pw.CharField(null=True)
    jupyterId = pw.IntegerField(null=True)
    userId = pw.IntegerField(null=True)
    planOption = pw.CharField(null=True)
    grouptype = pw.CharField(null=True)
    opsId = pw.IntegerField(null=True)
    template = pw.CharField(null=True)
    instanceType = pw.CharField(null=True)
    groupName = pw.CharField(null=True)
    templateVersion = pw.IntegerField(null=True)
    templateId = pw.CharField(null=True)
    region = pw.CharField(null=True)

class instancesUsersTable(MySQLModel):
    class Meta:
        db_table = 'instances_users__users_instances'

    id = pw.AutoField()
    instance_id = pw.IntegerField(null=True)
    user_id = pw.IntegerField(null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    project_id = pw.IntegerField(null=True)
    model_id = pw.IntegerField(null=True)
    ps_id = pw.IntegerField(null=True)
    isTest = pw.BooleanField(null=True)
    progress = pw.DoubleField(null=True)
    isDeleted = pw.BooleanField(null=True)

class usageplansTable(MySQLModel):
    class Meta:
        db_table = 'usageplans'

    id = pw.AutoField()
    planName = pw.CharField(null=True)
    price = pw.IntegerField(null=True, default=0)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    detail = pw.CharField(null=True)
    dynos = pw.IntegerField(null=True)
    usagehistory = pw.IntegerField(null=True)
    noOfPrediction = pw.IntegerField(null=True, default=0)
    storage = pw.IntegerField(null=True)
    projects = pw.IntegerField(null=True)
    apiAccess = pw.IntegerField(null=True)
    calSpeed = pw.CharField(null=True)
    noOfModeling = pw.CharField(null=True, default=0)
    technicalSupport = pw.CharField(null=True)
    abledMethod = pw.CharField(null=True)
    isApiAbled = pw.BooleanField(null=True)
    modelSpeed = pw.CharField(null=True)
    apiSpeedForOne = pw.IntegerField(null=True, default=0)
    apiSpeedForAll = pw.IntegerField(null=True, default=0)
    noOfDataset = pw.IntegerField(null=True, default=0)
    noOfConnector = pw.IntegerField(null=True, default=0)
    noOfLabelling = pw.IntegerField(null=True, default=0)
    noOfSharing = pw.IntegerField(null=True, default=0)


class promotionsTable(MySQLModel):
    class Meta:
        db_table = 'promotions'

    id = pw.AutoField()
    promotionCode = pw.CharField(null=True)
    discountPercent = pw.DoubleField(null=True)
    terminateDate = pw.DateTimeField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    planName = pw.CharField(null=True)


class usagehistoriesTable(MySQLModel):
    class Meta:
        db_table = 'usagehistories'

    id = pw.AutoField()
    dynos = pw.IntegerField(null=True)
    nextDynos = pw.IntegerField(null=True)
    nextPlan = pw.IntegerField(null=True)
    usageplan = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)


class contactsTable(MySQLModel):
    class Meta:
        db_table = 'contacts'

    id = pw.AutoField()
    name = pw.CharField(null=True)
    phone = pw.CharField(null=True)
    email = pw.CharField(null=True)
    message = pw.TextField(null=True)
    company = pw.CharField(null=True)
    contactType = pw.CharField(null=True)
    utmSource = pw.CharField(null=True)
    utmMedium = pw.CharField(null=True)
    utmCampaign = pw.CharField(null=True)
    utmTerm = pw.CharField(null=True)
    utmContent = pw.CharField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)


class datasetlicensesTable(MySQLModel):
    class Meta:
        db_table = 'datasetlicenses'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    licenseName = pw.CharField(null=True)
    licenseURL = pw.CharField(null=True)

class autolabelingProjectsTable(MySQLModel):
    class Meta:
        db_table = 'autolabelingprojects'

    id = pw.AutoField()
    generalLabelingType = pw.CharField(null=True)
    labelingClass = pw.TextField(null=True)
    status = pw.IntegerField(null=True)
    requestedAmount = pw.IntegerField(null=True)
    realAmount = pw.IntegerField(null=True)
    labelCount = pw.IntegerField(null=True)
    autolabelingAiType = pw.CharField(null=True)
    labelType = pw.CharField(null=True)
    customAiStage = pw.IntegerField(null=True)
    inferenceLabelingType = pw.CharField(null=True)
    preprocessingAiType = JSONField(null=True)
    projectId = pw.IntegerField(null=True)
    modelId = pw.IntegerField(null=True)
    labelprojectId = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)

class voucherUsersTable(MySQLModel):
    class Meta:
        db_table = 'voucherusers'

    id = pw.AutoField()
    company = pw.CharField(null=True)
    user = pw.IntegerField(null=True)
    voucher_type = pw.CharField(null=True)
    is_recharge = pw.BooleanField(null=True)
    charge_deposit = pw.DoubleField(null=True)
    used_deposit = pw.DoubleField(null=True)
    month_remain = pw.IntegerField(null=True)
    start_date = pw.DateField()
    end_date = pw.DateField()
    manager = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)

class customAiSampleResultsTable(MySQLModel):
    class Meta:
        db_table = 'customaisampleresults'

    id = pw.AutoField()
    sampleResult = LongTextField(null=True)
    projectId = pw.IntegerField(null=True)
    labelprojectId = pw.IntegerField(null=True)
    modelId = pw.IntegerField(null=True)
    hasSelected = pw.BooleanField(null=True, default=0)
    step = pw.IntegerField(null=True)

class foldersTable(MySQLModel):
    class Meta:
        db_table = 'folders'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    folderName = pw.CharField(null=True)
    objectList = LongTextField(null=True)
    user = pw.IntegerField(null=True)


class pgregistrationhistoriesTable(MySQLModel):
    class Meta:
        db_table = 'pgregistrationhistories'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    user = pw.IntegerField(null=True)
    teamId = pw.IntegerField(null=True)
    PCD_PAY_RST = pw.CharField(null=True)
    PCD_PAY_CODE = pw.CharField(null=True)
    PCD_PAY_MSG = pw.CharField(null=True)
    PCD_PAY_TYPE = pw.CharField(null=True)
    PCD_PAY_OID = pw.CharField(null=True)
    PCD_PAYER_NO = pw.CharField(null=True)
    PCD_PAYER_ID = pw.CharField(null=True)
    PCD_PAYER_HP = pw.CharField(null=True)
    PCD_PAYER_EMAIL = pw.CharField(null=True)
    PCD_PAY_YEAR = pw.CharField(null=True)
    PCD_PAY_MONTH = pw.CharField(null=True)
    PCD_PAY_GOODS = pw.CharField(null=True)
    PCD_PAY_TOTAL = pw.CharField(null=True)
    PCD_PAY_ISTAX = pw.CharField(null=True)
    PCD_PAY_TAXTOTAL = pw.CharField(null=True)
    PCD_PAY_TIME = pw.CharField(null=True)
    PCD_PAY_CARDNANE = pw.CharField(null=True)
    PCD_PAY_CARDNUM = pw.CharField(null=True)
    PCD_PAY_CARDTRADENUM = pw.CharField(null=True)
    PCD_PAY_CARDAUTHNO = pw.CharField(null=True)
    PCD_PAY_CARDRECEIPT = pw.CharField(null=True)
    PCD_REGULER_FLAG = pw.CharField(null=True)
    PCD_SIMPLE_FLAG = pw.CharField(null=True)
    PCD_USER_DEFINE1 = pw.CharField(null=True)
    PCD_USER_DEFINE2 = pw.CharField(null=True)
    remainDiskUsage = pw.BigIntegerField(null=True, default=0)
    remainProjectCount = pw.IntegerField(null=True, default=0)
    remainPredictCount = pw.IntegerField(null=True, default=0)
    isValidRemainCount = pw.BooleanField(null=True)
    remainLabelCount = pw.IntegerField(null=True, default=0)
    pg_provider = pw.CharField(null=True)

class pgpaymenthistoriesTable(MySQLModel):
    class Meta:
        db_table = 'pgpaymenthistories'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    paid_at_datetime = pw.DateTimeField(null=True)
    paid_at_datetime_ko = pw.DateTimeField(null=True)
    user = pw.IntegerField(null=True)
    price = pw.DoubleField(null=True)
    currency = pw.CharField(null=True)
    teamId = pw.IntegerField(null=True)
    teamName = pw.CharField(null=True)
    PCD_PAY_RST = pw.IntegerField(null=True)
    usageplan = pw.IntegerField(null=True)
    success = pw.BooleanField(null=True)
    pgregistrationhistory = pw.IntegerField(null=True)
    PCD_PAY_CODE = pw.CharField(null=True)
    PCD_PAY_MSG = pw.CharField(null=True)
    PCD_PAY_OID = pw.CharField(null=True)
    PCD_PAY_TYPE = pw.CharField(null=True)
    PCD_PAYER_NO = pw.CharField(null=True)
    PCD_PAYER_ID = pw.CharField(null=True)
    PCD_PAYER_NAME = pw.CharField(null=True)
    PCD_PAYER_HP = pw.CharField(null=True)
    PCD_PAYER_EMAIL = pw.CharField(null=True)
    PCD_PAY_YEAR = pw.CharField(null=True)
    PCD_PAY_MONTH = pw.CharField(null=True)
    PCD_PAY_GOODS = pw.CharField(null=True)
    PCD_PAY_TOTAL = pw.CharField(null=True)
    PCD_PAY_TAXTOTAL = pw.CharField(null=True)
    PCD_PAY_ISTAX = pw.CharField(null=True)
    PCD_PAY_TIME = pw.CharField(null=True)
    PCD_PAY_CARDNAME = pw.CharField(null=True)
    PCD_PAY_CARDNUM = pw.CharField(null=True)
    PCD_PAY_CARDTRADENUM = pw.CharField(null=True)
    PCD_PAY_CARDAUTHNO = pw.CharField(null=True)
    PCD_PAY_CARDRECEIPT = pw.CharField(null=True)
    PCD_REGULER_FLAG = pw.CharField(null=True)
    PCD_SIMPLE_FLAG = pw.CharField(null=True)
    PCD_USER_DEFINE1 = pw.CharField(null=True)
    PCD_USER_DEFINE2 = pw.CharField(null=True)
    remainDiskUsage = pw.BigIntegerField(null=True, default=0)
    remainProjectCount = pw.IntegerField(null=True, default=0)
    remainPredictCount = pw.IntegerField(null=True, default=0)
    isValidRemainCount = pw.BooleanField(null=True)
    remainLabelCount = pw.IntegerField(null=True, default=0)
    trainingSecondCount = pw.IntegerField(null=True, default=0)
    autolabelingCountCR = pw.IntegerField(null=True, default=0)
    autolabelingCountOD = pw.IntegerField(null=True, default=0)
    autolabelingObjectCountOD = pw.IntegerField(null=True, default=0)
    autolabelingCountKeypoint = pw.IntegerField(null=True, default=0)
    autolabelingCountSementic = pw.IntegerField(null=True, default=0)
    inferenceCountCR = pw.IntegerField(null=True, default=0)
    inferenceCountOD = pw.IntegerField(null=True, default=0)
    inferenceCountKeypoint = pw.IntegerField(null=True, default=0)
    inferenceCountSementic = pw.IntegerField(null=True, default=0)
    cumulativeDiskUsage = pw.BigIntegerField(null=True, default=0)
    manuallabelingCountCR = pw.IntegerField(null=True, default=0)
    manuallabelingCountOD = pw.IntegerField(null=True, default=0)

class usedamounthistoriesTable(MySQLModel):
    class Meta:
        db_table = 'usedAmountHistories'

    id = pw.AutoField()
    paidYear = pw.IntegerField(null=True)
    paidMonth = pw.IntegerField(null=True)
    paidFromDate = pw.DateTimeField(null=True)
    paidToDate = pw.DateTimeField(null=True)
    user = pw.IntegerField(null=True)
    usedTotalPrice = pw.DoubleField(null=True)
    usedPrice = pw.DoubleField(null=True)
    usedAWSPrice = pw.DoubleField(null=True)
    usedMarketPrice = pw.DoubleField(null=True)
    isPaid = pw.BooleanField(null=True, default=0)
    remainLabelCount = pw.IntegerField(null=True, default=0)
    trainingSecondCount = pw.IntegerField(null=True, default=0)
    manuallabelingCountCR = pw.IntegerField(null=True, default=0)
    manuallabelingCountOD = pw.IntegerField(null=True, default=0)
    manuallabelingCountKeypoint = pw.IntegerField(null=True, default=0)
    manuallabelingCountPedestrian = pw.IntegerField(null=True, default=0)
    manuallabelingCountSementic = pw.IntegerField(null=True, default=0)
    manuallabelingCountFace = pw.IntegerField(null=True, default=0)
    manualObjectCountOD = pw.IntegerField(null=True, default=0)
    manualObjectCountKeypoint = pw.IntegerField(null=True, default=0)
    manualObjectCountPedestrian = pw.IntegerField(null=True, default=0)
    manualObjectCountFace = pw.IntegerField(null=True, default=0)
    autolabelingCountCR = pw.IntegerField(null=True, default=0)
    autolabelingCountOD = pw.IntegerField(null=True, default=0)
    autolabelingCountKeypoint = pw.IntegerField(null=True, default=0)
    autolabelingCountPedestrian = pw.IntegerField(null=True, default=0)
    autolabelingCountSementic = pw.IntegerField(null=True, default=0)
    autolabelingCountFace = pw.IntegerField(null=True, default=0)
    autolabelingCountDI = pw.IntegerField(null=True, default=0)
    autolabelingCountOCR = pw.IntegerField(null=True, default=0)
    autolabelingObjectCountOD = pw.IntegerField(null=True, default=0)
    autolabelingObjectCountKeypoint = pw.IntegerField(null=True, default=0)
    autolabelingObjectCountPedestrian = pw.IntegerField(null=True, default=0)
    autolabelingObjectCountFace = pw.IntegerField(null=True, default=0)
    autolabelingObjectCountDI = pw.IntegerField(null=True, default=0)
    autolabelingObjectCountOCR = pw.IntegerField(null=True, default=0)
    inferenceCountCR = pw.IntegerField(null=True, default=0)
    inferenceCountOD = pw.IntegerField(null=True, default=0)
    inferenceCountKeypoint = pw.IntegerField(null=True, default=0)
    inferenceCountPedestrian = pw.IntegerField(null=True, default=0)
    inferenceCountSementic = pw.IntegerField(null=True, default=0)
    inferenceCountFace = pw.IntegerField(null=True, default=0)
    inferenceCountDI = pw.IntegerField(null=True, default=0)
    inferenceCountOCR = pw.IntegerField(null=True, default=0)
    cumulativeDiskUsage = pw.BigIntegerField(null=True, default=0)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    magicCodeCount = pw.IntegerField(null=True, default=0)


class potentialclientsTable(MySQLModel):
    class Meta:
        db_table = 'potentialclients'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    foundGroup = pw.CharField(null=True)
    found = pw.CharField(null=True)
    name = pw.CharField(null=True)
    description = pw.TextField(null=True)
    email = pw.CharField(null=True)
    website = pw.CharField(null=True)
    phone = pw.CharField(null=True)
    rawData = pw.TextField(null=True)
    isFirstEmailSent = pw.BooleanField(null=True)
    isTest = pw.BooleanField(null=True)
    isCompetitor = pw.BooleanField(null=True)
    isSentToDataVoucherClient = pw.BooleanField(null=True)
    isSentToGovProjectClient = pw.BooleanField(null=True)

class projectcategoriesTable(MySQLModel):
    class Meta:
        db_table = 'projectcategories'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    categoryName = pw.CharField(null=True)

# class tickerTable(MySQLModel):
#     class Meta:
#         db_table = 'ticker'
#
#     id = pw.AutoField()
#     ticker = pw.CharField(null=True)
#     name = pw.CharField(null=True)
#     exchange = pw.CharField(null=True)
#     categoryName = pw.CharField(null=True)
#     country = pw.CharField(null=True)
#     quantCategory = pw.CharField(null=True)

class asynctasksTable(MySQLModel):
    class Meta:
        db_table = 'daemontasks'

    id = pw.AutoField()
    taskName = pw.CharField(null=True)
    taskNameEn = pw.CharField(null=True)
    taskType = pw.CharField(null=True)
    status = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    model = pw.IntegerField(null=True)
    labelproject = pw.IntegerField(null=True)
    marketproject = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    inputFilePath = pw.CharField(null=True)
    outputFilePath = pw.CharField(null=True)
    isChecked = pw.BooleanField(null=True, default=0)
    statusText = LongTextField(null=True)
    project = pw.IntegerField(null=True)
    autolabelingCount = pw.IntegerField(null=True)
    autolabelingproject = pw.IntegerField(null=True)
    movieStartTime = pw.DateTimeField(null=True)
    isStandardMovie = pw.BooleanField(null=True)
    sync_cut_at = pw.DoubleField(null=True)
    duration = pw.IntegerField(null=True)
    file_creation_time = pw.DateTimeField(null=True)
    total_score = pw.DoubleField(null=True)
    distance_score = pw.DoubleField(null=True)
    angle_score = pw.DoubleField(null=True)
    backtest = pw.IntegerField(null=True)
    research = pw.IntegerField(null=True)
    provider = pw.CharField(null=True)
    require_gpus = JSONField(null=True)
    require_gpus_total = JSONField(null=True)
    working_on = pw.CharField(null=True)
    previous_status = pw.IntegerField(null=True)

class labelsTable(MySQLModel):
    class Meta:
        db_table = 'labels'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    file_path = pw.CharField(null=True)
    file_type = pw.CharField(null=True)
    file_name = pw.CharField(null=True)
    file_size = pw.IntegerField(null=True)
    last_updated_at = pw.DateTimeField(null=True)
    last_updated_by = pw.CharField(null=True)
    open_issue_count = pw.IntegerField(null=True)
    thumbnail = LongTextField(null=True)
    unique_label_type = pw.CharField(null=True)
    status = pw.CharField(null=True)
    workAssignee = pw.CharField(null=True)
    requeued = pw.CharField(null=True)
    labeltype = pw.CharField(null=True)
    color = pw.CharField(null=True)
    locked = pw.BooleanField(null=True)
    visible = pw.BooleanField(null=True)
    selected = pw.BooleanField(null=True)
    points = LongTextField(null=True)
    sthreefile = pw.IntegerField(null=True)
    labelclass = pw.IntegerField(null=True)
    labelproject = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    x = pw.DoubleField(null=True)
    y = pw.DoubleField(null=True)
    w = pw.DoubleField(null=True)
    h = pw.DoubleField(null=True)
    highlighted = pw.BooleanField(null=True)
    editingLabels = pw.BooleanField(null=True)
    isDeleted = pw.BooleanField(null=True)
    ismagictool = pw.BooleanField(null=True)

class labelprojectsTable(MySQLModel):
    class Meta:
        db_table = 'labelprojects'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    name = pw.CharField(null=True)
    description = LongTextField(null=True)
    workapp = pw.CharField(null=True)
    created_by = pw.CharField(null=True)
    last_updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    last_updated_by = pw.CharField(null=True)
    folder = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    isDeleted = pw.BooleanField(null=True)
    status = pw.IntegerField(null=True)
    sharedgroup = pw.CharField(null=True)
    shareaitrainer = pw.BooleanField(null=True)
    dataconnectorsList = LongTextField(null=True)
    visible = pw.BooleanField(null=True, default=1)
    market_project_flag = pw.BooleanField(null=True, default=0)
    has_review_process = pw.BooleanField(null=True, default=0)

class labelinfosTable(MySQLModel):
    class Meta:
        db_table = 'labelinfos'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    name = pw.CharField(null=True)
    shapes = pw.CharField(null=True)
    color = pw.CharField(null=True)
    labelproject = pw.IntegerField(null=True)
    labelobject = pw.IntegerField(null=True)

# class sthreefilesTable(MySQLModel):
#     class Meta:
#         db_table = 'sthreefiles'
#
#     id = pw.AutoField()
#     created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
#     updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
#     fileName = pw.CharField(null=True)
#     fileSize = pw.IntegerField(null=True)
#     fileType = pw.CharField(null=True)
#     last_updated_at = pw.DateTimeField(null=True)
#     last_updated_by = pw.CharField(null=True)
#     openIssueCount = pw.IntegerField(null=True)
#     thumbnail = LongTextField(null=True)
#     uniqueLabelType = pw.CharField(null=True)
#     status = pw.CharField(null=True)
#     workAssignee = pw.CharField(null=True)
#     requeued = pw.CharField(null=True)
#     labelproject = pw.IntegerField(null=True)
#     folder = pw.IntegerField(null=True)
#     user = pw.IntegerField(null=True)
#     s3key = pw.CharField(null=True)
#     width = pw.DoubleField(null=True)
#     height = pw.DoubleField(null=True)
#     originalFileName = pw.CharField(null=True)
#     isDeleted = pw.BooleanField(null=True)

class labelclassesTable(MySQLModel):
    class Meta:
        db_table = 'labelclasses'

    id = pw.AutoField()
    name = pw.CharField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    labelproject = pw.IntegerField(null=True)
    color = pw.CharField(null=True)
    isDeleted = pw.BooleanField(null=True)

class foldersubsTable(MySQLModel):
    class Meta:
        db_table = 'foldersubs'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    folderId = pw.IntegerField(null=True)
    subFolderId = pw.IntegerField(null=True)

class analyticsgraphTable(MySQLModel):
    class Meta:
        db_table = 'analyticsgraphs'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    graphName = pw.CharField(null=True)
    graphType = pw.CharField(null=True)
    filePath = pw.CharField(null=True)
    origin = pw.CharField(null=True)
    model = pw.IntegerField(null=True)
    project = pw.IntegerField(null=True)

class datasetsTable(MySQLModel):
    class Meta:
        db_table = 'datasets'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    datasetName = pw.CharField(null=True)
    user = pw.IntegerField(null=True)
    startProjectPeriod = pw.CharField(null=True)
    repeatAmpm = pw.CharField(null=True)
    repeatHour = pw.CharField(null=True)
    repeatDays = pw.CharField(null=True)
    trainingMethod = pw.CharField(null=True)
    startTimeseriesDatetime = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    endTimeseriesDatetime = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    analyticsStandard = pw.CharField(null=True)
    timeseriesColumnInfo = JSONField(null=True)
    lastGenerateProjectDatetime = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)

class dataconnectorsTable(MySQLModel):
    class Meta:
        db_table = 'dataconnectors'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    dataconnectorName = pw.CharField(null=True)
    dataconnectorInfo = JSONField(null=True)
    dataconnectortype = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    folder = pw.IntegerField(null=True)
    dataset = pw.IntegerField(null=True)
    dbHost = pw.CharField(null=True)
    dbId = pw.CharField(null=True)
    dbPassword = pw.CharField(null=True)
    dbSchema = pw.CharField(null=True)
    dbTable = pw.CharField(null=True)
    keyFileInfo = JSONField(null=True)
    apiKey = pw.CharField(null=True)
    fileStructure = LongTextField(null=True)
    fileStructureGAN = LongTextField(null=True)
    filePath = pw.TextField(null=True)
    originalFileName = pw.CharField(null=True)
    valueForNorm = pw.DoubleField(null=True)
    description = LongTextField(null=True)
    sampleData = LongTextField(null=True)
    yClass = pw.TextField(null=True)
    hasTextData = pw.BooleanField(null=True)
    hasImageData = pw.BooleanField(null=True)
    hasTimeSeriesData = pw.BooleanField(null=True)
    fileSize = pw.IntegerField(null=True)
    isDeleted = pw.BooleanField(null=True)
    sampleImageData = JSONField(null=True)
    isSample = pw.BooleanField(null=True)
    reference = pw.CharField(null=True)
    referenceUrl = pw.CharField(null=True)
    license = pw.CharField(null=True)
    licenseUrl = pw.CharField(null=True)
    sampleImageUrl = pw.CharField(null=True)
    originalLabelproject = pw.IntegerField(null=True)
    hasLabelData = pw.BooleanField(null=True)
    status = pw.IntegerField(null=True)
    trainingMethod = pw.CharField(null=True)
    progress = pw.DoubleField(null=True)
    isVisible = pw.BooleanField(default=True, null=True)
    project_id = JSONField(null=True)
    labelproject_id = JSONField(null=True)

class dataconnectortypesTable(MySQLModel):
    class Meta:
        db_table = 'dataconnectortypes'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    dataconnectortypeName = pw.CharField(null=True)
    dataconnectortypeInfo = JSONField(null=True)
    logoUrl = pw.CharField(null=True)
    authType = pw.CharField(null=True)
    defaultPort = pw.IntegerField(null=True)
    orderByCode = pw.IntegerField(null=True)

class datacolumnsTable(MySQLModel):
    class Meta:
        db_table = 'datacolumns'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')])
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')])
    columnName = pw.CharField(null=True)
    index = pw.IntegerField(null=True)
    miss = pw.IntegerField(null=True)
    length = pw.IntegerField(null=True)
    unique = pw.IntegerField(null=True)
    uniqueValues = JSONField(null=True)
    type = pw.CharField(null=True)
    min = pw.DoubleField(null=True)
    max = pw.DoubleField(null=True)
    std = pw.DoubleField(null=True)
    mean = pw.DoubleField(null=True)
    top = pw.DoubleField(null=True)
    freq = pw.DoubleField(null=True)
    isForGan = pw.BooleanField(null=True)
    dataconnector = pw.IntegerField(null=True)

class externalaisTable(MySQLModel):
    class Meta:
        db_table = 'externalais'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    displayName = pw.CharField(null=True)
    externalAiName = pw.CharField(null=True)
    externalAiType = pw.CharField(null=True)
    provider = pw.CharField(null=True)
    imageUrl = pw.CharField(null=True)
    requirePredictUnit = pw.IntegerField(null=True)
    externalAiDescription = LongTextField(null=True)
    externalAiSummary = LongTextField(null=True)
    externalAiName = pw.CharField(null=True)
    hasPredictAll = pw.BooleanField(null=True)

# class additionalunitinfoTable(MySQLModel):
#     class Meta:
#         db_table = 'additionalunitinfos'
#
#     id = pw.AutoField()
#     additionalUnitName = pw.CharField(null=True)
#     additionalUnitPrice = pw.IntegerField(null=True)
#     quantity = pw.IntegerField(null=True)

class notiontasksTable(MySQLModel):
    class Meta:
        db_table = 'notiontasks'

    id = pw.AutoField()
    title = pw.CharField(null=True)
    assign = pw.CharField(null=True)
    expectedWorkHour = pw.DoubleField(null=True)
    realWorkHour = pw.DoubleField(null=True)
    pid = pw.IntegerField(null=True)
    startDate = pw.DateTimeField(null=True)
    endDate = pw.DateTimeField(null=True)

class ds2AiNewsTable(MySQLModel):
    class Meta:
        db_table = 'ds2ainews'

    id = pw.AutoField()
    newsTitle = pw.CharField(null=True)
    newsDate = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    newsContent = pw.CharField(null=True)
    lang = pw.CharField(null=True)
    newsType = pw.CharField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')],
                                  null=True)

# class favoriteCallLogsTable(MySQLModel):
#     class Meta:
#         db_table = 'calllogs_users__users_favorite_calllogs'
#
#     id = pw.AutoField()
#     userId = pw.IntegerField(null=True)
#     callLogId = pw.IntegerField(null=True)
#     isFavorite = pw.BooleanField(null=True)
#
# class callLogShareView(MySQLModel):
#     class Meta:
#         db_table = 'callLogShareView'
#
#     callLogId = pw.IntegerField(null=True)
#     callLogUser = pw.IntegerField(null=True)
#     callLogTeam = pw.IntegerField(null=True)
#     callLogShareId = pw.IntegerField(null=True)
#     permission = pw.CharField(null=True)
#     shareUser = pw.IntegerField(null=True)
#     shareGroupId = pw.IntegerField(null=True)

# class callLogShareTable(MySQLModel):
#     class Meta:
#         db_table = 'calllogshare'
#
#     id = pw.AutoField()
#     callLogId = pw.IntegerField(null=True)
#     groupId = pw.IntegerField(null=True)
#     userId = pw.IntegerField(null=True)
#     permission = pw.CharField(null=True)
#     shareTarget = pw.CharField(null=True)
#     teamId = pw.IntegerField(null=True)

class groupUsersView(MySQLModel):
    class Meta:
        db_table = 'groupUsersView'

    groupId = pw.AutoField()
    groupname = pw.CharField(null=True)
    groupType = pw.CharField(null=True)
    teamId = pw.IntegerField(null=True)
    email = pw.CharField(null=True)
    user = pw.IntegerField(null=True)


# class calllogsTable(MySQLModel):
#     class Meta:
#         db_table = 'calllogs'
#
#     id = pw.AutoField()
#     phoneNumber = pw.CharField(null=True)
#     timestamp = pw.IntegerField(null=True)
#     name = pw.CharField(null=True)
#     type = pw.CharField(null=True)
#     duration = pw.IntegerField(null=True)
#     dateTime = pw.DateTimeField(null=True)
#     created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
#     updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
#     rawType = pw.IntegerField(null=True)
#     voiceFilePath = pw.CharField(null=True)
#     voiceFileS3Path = pw.CharField(null=True)
#     sttData = JSONField(null=True)
#     summaryText = LongTextField(null=True)
#     sttDataRaw = JSONField(null=True)
#     sttDataIBMRaw = JSONField(null=True)
#     sttDataIBMProcessed = JSONField(null=True)
#     user = pw.IntegerField(null=True)
#     callMemo = LongTextField(null=True)
#     sttDataEdited = JSONField(null=True)
#     teamId = pw.IntegerField(null=True)
#     parentsCallLog = pw.IntegerField(null=True)
#     isDeleted = pw.BooleanField(null=True)
#     groupId = pw.IntegerField(null=True)
#     sttDataD = JSONField(null=True)
#     isProcessingError = pw.BooleanField(null=True)
#     isPublic = pw.BooleanField(null=True)
#     isInitSetup = pw.BooleanField(null=True)
#     myPhoneNumber = pw.CharField(null=True)
#     contactName = pw.CharField(null=True)
#     token = pw.CharField(null=True)
#     meetingURL = pw.CharField(null=True)
#     isEndedCall = pw.BooleanField(null=True)
#     totalSttSeconds = pw.IntegerField(null=True)
#     isAutoJoinRoom = pw.BooleanField(null=True)
#     isShareAfterCall = pw.BooleanField(null=True)
#     meetingType = pw.CharField(null=True)
#     isUsingDiscovery = pw.BooleanField(null=True)
#     isStartedDiscovery = pw.BooleanField(null=True)
#     isFinishedDiscovery = pw.BooleanField(null=True)
#     isFailedDiscovery = pw.BooleanField(null=True)
#     recordType = pw.CharField(null=True)
    # tag = JSONField(null=True)


class storeItemsTable(MySQLModel):
    class Meta:
        db_table = 'storeitems'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    link = pw.TextField(null=True)
    linkTitle = pw.TextField(null=True)
    linkImageURL = pw.TextField(null=True)
    keywords = pw.TextField(null=True)
    clickedCount = pw.IntegerField(null=True)
    goodCount = pw.IntegerField(null=True)
    badCount = pw.IntegerField(null=True)
    category = pw.CharField(null=True)
    subcategory = pw.CharField(null=True)
    lang = pw.CharField(null=True)
    isAllowIframe = pw.BooleanField(null=True)


class inspectionRequestsTable(MySQLModel):
    class Meta:
        db_table = 'inspectionRequests'

    id = pw.AutoField()
    userId = pw.IntegerField(null=True)
    labelprojectId = pw.IntegerField(null=True)
    phoneNumber = pw.CharField(null=True)
    labelType = pw.CharField(null=True)
    description = LongTextField(null=True)
    status = pw.IntegerField(null=True)
    price = pw.IntegerField(null=True)
    labelCount = pw.IntegerField(null=True)


class labelTypesTable(MySQLModel):
    class Meta:
        db_table = 'labeltypes'

    id = pw.AutoField()
    name = pw.CharField(null=True)
    price = pw.IntegerField(null=True)

class jupyterProjectsTable(MySQLModel):
    class Meta:
        db_table = 'jupyterprojects'

    id = pw.AutoField()
    projectName = pw.CharField(null=True)
    status = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    user = pw.IntegerField(null=True)
    valueForPredict = pw.CharField(null=True)
    option = pw.CharField(null=True)
    csvupload = pw.IntegerField(null=True)
    fileStructure = LongTextField(null=True)
    fileStructureGAN = LongTextField(null=True)
    filePath = pw.CharField(null=True)
    statusText = pw.CharField(null=True)
    originalFileName = pw.CharField(null=True)
    trainingMethod = pw.CharField(null=True)
    detectedTrainingMethod = pw.CharField(null=True)
    isTest = pw.BooleanField(null=True)
    isSample = pw.IntegerField(null=True)
    errorCountConflict = pw.IntegerField(null=True, default=0)
    errorCountMemory = pw.IntegerField(null=True, default=0)
    errorCountNotExpected = pw.IntegerField(null=True, default=0)
    successCount = pw.IntegerField(null=True, default=0)
    valueForNorm = pw.DoubleField(null=True)
    description = pw.TextField(null=True)
    license = pw.CharField(null=True)
    sampleData = LongTextField(null=True)
    yClass = pw.TextField(null=True)
    datasetlicense = pw.IntegerField(null=True)
    hasTextData = pw.BooleanField(null=True)
    hasImageData = pw.BooleanField(null=True)
    isSentCompletedEmail = pw.BooleanField(null=True)
    projectcategory = pw.IntegerField(null=True)
    isParameterCompressed = pw.BooleanField(null=True)
    fileSize = pw.IntegerField(null=True)
    hasTimeSeriesData = pw.BooleanField(null=True)
    isFavorite = pw.BooleanField(null=True)
    dataset = pw.IntegerField(null=True)
    joinInfo = JSONField(null=True)
    trainingColumnInfo = JSONField(null=True)
    preprocessingInfo = JSONField(null=True)
    preprocessingInfoValue = JSONField(null=True)
    labelproject = pw.IntegerField(null=True)
    isSentFirstModelDoneEmail = pw.BooleanField(null=True)
    valueForPredictColumnId = pw.IntegerField(null=True)
    dataconnectorsList = JSONField(null=True)
    timeSeriesColumnInfo = JSONField(null=True)
    startTimeSeriesDatetime = pw.CharField(null=True)
    endTimeSeriesDatetime = pw.CharField(null=True)
    analyticsStandard = pw.CharField(null=True)
    prescriptionAnalyticsInfo = JSONField(null=True)
    isDeleted = pw.BooleanField(null=True)
    webhookURL = pw.CharField(null=True)
    webhookMethod = pw.CharField(null=True)
    webhookData = JSONField(null=True)
    sharedgroup = LongTextField(null=True)
    background = pw.CharField(null=True)
    resultJson = LongTextField(null=True)
    labelType = pw.CharField(null=True)
    framework = pw.CharField(null=True)
    developProjectId = pw.IntegerField(null=True)
    minServerSize = pw.IntegerField(null=True)
    maxServerSize = pw.IntegerField(null=True)
    startServerSize = pw.IntegerField(null=True)
    autoScalingGroupName = pw.CharField(null=True)
    targetGroupArn = pw.CharField(null=True)
    ruleArn = pw.CharField(null=True)
    server_size_changed_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)

class jupyterJobsTable(MySQLModel):
    class Meta:
        db_table = 'jupyterjobs'

    id = pw.AutoField()
    name = pw.CharField(null=True)
    description = pw.TextField(null=True)
    sampleSize = pw.IntegerField(null=True)
    validation = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    accuracy = pw.DoubleField(null=True)
    status = pw.IntegerField(null=True)
    statusText = pw.CharField(null=True)
    progress = pw.DoubleField(null=True)
    modeldetail = pw.IntegerField(null=True)
    sampledatum = pw.IntegerField(null=True)
    jupyterProject = pw.IntegerField(null=True)
    epoch = pw.IntegerField(null=True)
    lossFunction = pw.CharField(null=True)
    usingBert = pw.IntegerField(null=True)
    learningRateFromFit = pw.DoubleField(null=True)
    layerDeep = pw.IntegerField(null=True)
    layerWidth = pw.IntegerField(null=True)
    dropOut = pw.DoubleField(null=True)
    filePath = pw.CharField(null=True)
    confusion_matrix = LongTextField(null=True)
    most_confused = LongTextField(null=True)
    top_k_accuracy = pw.DoubleField(null=True)
    dice = pw.DoubleField(null=True)
    error_rate = pw.DoubleField(null=True)
    yClass = pw.CharField(null=True)
    feature_importance = LongTextField(null=True)
    cm_statistics = LongTextField(null=True)
    records = LongTextField(null=True)
    visionModel = pw.CharField(null=True)
    objectDetectionModel = pw.CharField(null=True)
    confusionMatrix = LongTextField(null=True)
    mostConfused = LongTextField(null=True)
    topKAccuracy = pw.DoubleField(null=True)
    errorRate = pw.DoubleField(null=True)
    featureImportance = LongTextField(null=True)
    cmStatistics = LongTextField(null=True)
    rmse = pw.DoubleField(null=True)
    errorCountConflict = pw.IntegerField(null=True)
    errorCountMemory = pw.IntegerField(null=True)
    errorCountNotExpected = pw.IntegerField(null=True)
    isModelDownloaded = pw.BooleanField(null=True)
    mase = pw.DoubleField(null=True)
    mape = pw.DoubleField(null=True)
    r2score = pw.DoubleField(null=True)
    totalLoss = pw.DoubleField(null=True)
    ping_at = pw.DateTimeField(null=True)
    zombieCount = pw.IntegerField(null=True)
    timeSeriesTrainingRow = pw.IntegerField(null=True)
    isFavorite = pw.BooleanField(null=True)
    prescriptionAnalyticsInfo = JSONField(null=True)
    bestAccuracy = pw.DoubleField(null=True)
    bestAccuracyEpoch = pw.IntegerField(null=True)
    bestRmse = pw.DoubleField(null=True)
    bestRmseEpoch = pw.IntegerField(null=True)
    ap = pw.DoubleField(null=True)
    ap50 = pw.DoubleField(null=True)
    ap75 = pw.DoubleField(null=True)
    aps = pw.DoubleField(null=True)
    apm = pw.DoubleField(null=True)
    apl = pw.DoubleField(null=True)
    # isBestModel = pw.BooleanField(null=True)
    # labelprojectId = pw.IntegerField(null=True)
    isEngineAI = pw.BooleanField(null=True)
    isIndustryAI = pw.BooleanField(null=True)
    displayName = pw.CharField(null=True)
    externalAiName = pw.CharField(null=True)
    externalAiType = pw.CharField(null=True)
    imageUrl = pw.CharField(null=True)
    requirePredictUnit = pw.IntegerField(null=True)
    externalAiDescription = LongTextField(null=True)
    externalAiSummary = LongTextField(null=True)
    hasPredictAll = pw.BooleanField(null=True)
    category = pw.CharField(null=True)
    inputData = LongTextField(null=True)
    outputData = LongTextField(null=True)
    isQuickstart = pw.BooleanField(null=True)
    isFullmanaged = pw.BooleanField(null=True)
    price = pw.IntegerField(null=True)
    url = pw.TextField(null=True)
    framework = pw.CharField(null=True)
    developModelId = pw.IntegerField(null=True)
    jupyterServer = pw.IntegerField(null=True)

class jupyterServersTable(MySQLModel):
    class Meta:
        db_table = 'jupyterservers'

    id = pw.AutoField()
    serverType = pw.CharField(null=True)
    instanceId = pw.CharField(null=True)
    status = pw.IntegerField(null=True)
    jupyterProject = pw.IntegerField(null=True)
    publicIp = pw.CharField(null=True)
    region = pw.CharField(null=True)
    timezone = pw.CharField(null=True)
    terminated_at = pw.DateTimeField(null=True)
    last_paid_at = pw.DateTimeField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    availabilityZone = pw.CharField(null=True)
    lifecycleState = pw.CharField(null=True)
    healthStatus = pw.CharField(null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    port = pw.IntegerField(null=True)
    gpu = pw.CharField(null=True)

class jupyterPricingTable(MySQLModel):
    class Meta:
        db_table = 'jupyterpricing'

    id = pw.AutoField()
    serverType = pw.CharField(null=True)
    pricePerHour = pw.IntegerField(null=True)

class pricingTable(MySQLModel):
    class Meta:
        db_table = 'pricing'

    id = pw.AutoField()
    depthFirst = pw.CharField(null=True)
    depthSecond = pw.IntegerField(null=True)
    name = pw.CharField(null=True)
    description = pw.CharField(null=True)
    price = pw.DoubleField(null=True)
    priceMin = pw.DoubleField(null=True)
    manuallabelingPerCount = pw.DoubleField(null=True)
    manuallabelingPerObject = pw.DoubleField(null=True)
    autolabelingPerCount = pw.DoubleField(null=True)
    autolabelingPerObject = pw.DoubleField(null=True)
    inferencePerCount = pw.DoubleField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    trainingPerHour = pw.DoubleField(null=True)

class marketUsagesTable(MySQLModel):
    class Meta:
        db_table = 'marketusages'

    id = pw.AutoField()
    user = pw.IntegerField(null=True)
    marketModelId = pw.IntegerField(null=True)
    marketReqId = pw.IntegerField(null=True)
    inferenceCount = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)

class movieStatisticsTable(MySQLModel):
    class Meta:
        db_table = 'moviestatistics'

    id = pw.AutoField()
    statisticType = pw.CharField(null=True)
    periodType = pw.CharField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    measurement_date = pw.DateTimeField(null=True)
    marketproject = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    statisticYear = pw.IntegerField(null=True)
    statisticMonth = pw.IntegerField(null=True)
    statisticDay = pw.IntegerField(null=True)
    statisticHour = pw.IntegerField(null=True)
    resultJson = JSONField(null=True)
    statisticAmount = pw.IntegerField(null=True)
    groupName = pw.CharField(null=True)
    avgObjectCount = pw.IntegerField(null=True)
    avgObjectDuration = pw.DoubleField(null=True)
    sumObjectDuration = pw.DoubleField(null=True)
    areaName = pw.CharField(null=True)
    genderGroup = pw.CharField(null=True)
    measurement_date = pw.DateTimeField(null=True)
    ageGroup = pw.CharField(null=True)

class WideFieldUserTable(MySQLModel):
  class Meta:
      db_table = 'widefield_user'

  id = pw.AutoField()
  user_name = pw.CharField(null=True)
  nick_name = pw.CharField(null=True)
  gender = pw.CharField(null=True)
  birthday = pw.DateField()

class ContentsTable(MySQLModel):
    class Meta:
        db_table = 'widefield_contents'

    id = pw.AutoField()
    content_name = pw.TextField(null=True)
    content_keyword = pw.TextField(null=True)

class CertifiedContentsTable(MySQLModel):
    class Meta:
        db_table = 'widefield_certified_content'

    id = pw.AutoField()
    content = pw.TextField(null=True)
    keyword = pw.TextField(null=True)
    user_id = pw.IntegerField(null=True)

class  ContentCategoryTable(MySQLModel):
    class Meta:
        db_table = 'widefield_content_category'

    id = pw.AutoField()
    content_id = pw.TextField(null=True)
    certified_content_id = pw.TextField(null=True)
    classification = pw.CharField(null=True)

class UserStatisticsTable(MySQLModel):
    class Meta:
        db_table = 'widefield_user_statistics'

    id = pw.AutoField()
    age_group = pw.IntegerField(null=True)
    gender = pw.CharField(null=True)
    keyword = pw.CharField(null=True)

class MultipleAiModelOptionTable(MySQLModel):
    class Meta:
        db_table = 'marketprojects_multiple_ai_model_option'

    id = pw.AutoField()
    marketproject = pw.IntegerField(null=True)
    key = pw.CharField(null=True)
    value = pw.CharField(null=True)
    classificationBuyModelProject = pw.IntegerField(null=True)
    classificationSellModelProject = pw.IntegerField(null=True)
    regressionModelProject = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')])
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')])
    classificationBuyModel = pw.IntegerField(null=True)
    classificationSellModel = pw.IntegerField(null=True)
    regressionModel = pw.IntegerField(null=True)
    use_tickers = JSONField(null=True)

class Ds2labsQuestsUsers(MySQLModel):
    class Meta:
        db_table = 'ds2labs_quests_users'

    id = pw.AutoField()
    user_id = pw.IntegerField(null=True)
    quest_id = pw.IntegerField(null=True)
    is_finished = pw.BooleanField(null=True)
    is_paid = pw.BooleanField(null=True)

class trainingServerTable(MySQLModel):
    class Meta:
        db_table = 'training_servers'

    id = pw.AutoField()
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    ip = pw.CharField(null=True)
    name = pw.CharField(null=True)
    gpu_info = JSONField(null=True)
    ssh_public_key = pw.TextField(null=True)
    is_main = pw.BooleanField(null=True)
    is_deleted = pw.BooleanField(null=True)
    access_token = pw.CharField(null=True)

class commandTable(MySQLModel):
    class Meta:
        db_table = 'command'

    id = pw.AutoField()
    command = pw.CharField(null=True)
    url = LongTextField(null=True)
    short_description = pw.TextField(null=True)
    description = pw.TextField(null=True)
    option = pw.TextField(null=True)
    method = pw.TextField(null=True)
    category = pw.CharField(null=True)
    categories = pw.TextField(null=True)
    rating = pw.FloatField(null=True)
    status = pw.CharField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    user = pw.IntegerField(null=True)
    thumbnail = pw.TextField(null=True)
    thumbnail_32 = pw.TextField(null=True)
    thumbnail_256 = pw.TextField(null=True)
    is_accept_iframe = pw.BooleanField(null=True)
    is_deleted = pw.BooleanField(null=True)
    command_token = pw.TextField(null=True)
    is_private = pw.BooleanField(null=True)
    is_shared = pw.BooleanField(null=True)
    sharedgroup = LongTextField(null=True)
    slug = pw.CharField(null=True)
    upvote = pw.IntegerField(null=True)
    watch = pw.IntegerField(null=True)
    reviewsCount = pw.IntegerField(null=True)
    inputType = pw.CharField(null=True)
    outputType = pw.CharField(null=True)
    outputExt = pw.CharField(null=True)
    trainingColumnInfo = pw.CharField(null=True)
    useFrontendOnly = pw.BooleanField(null=True)
    useInstantly = pw.BooleanField(null=True)
    rank = pw.IntegerField(null=True)
    real_use = pw.BooleanField(null=True)
class commandCollectionTable(MySQLModel):
    class Meta:
        db_table = 'command_collection'

    id = pw.AutoField()
    command = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    is_deleted = pw.BooleanField(null=True)
    is_shared = pw.BooleanField(null=True)
    sharedgroup = LongTextField(null=True)
    collection_group = pw.IntegerField(null=True)

class commandReviewTable(MySQLModel):
    class Meta:
        db_table = 'command_review'

    id = pw.AutoField()
    command = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    status = pw.TextField(null=True)
    rating = pw.IntegerField(null=True)
    review = LongTextField(null=True)
    is_checked_positive_ease_of_use = pw.BooleanField(null=True)
    is_checked_positive_great_customer_support = pw.BooleanField(null=True)
    is_checked_positive_strong_feature_set = pw.BooleanField(null=True)
    is_checked_positive_cost_effective = pw.BooleanField(null=True)
    is_checked_positive_strong_community = pw.BooleanField(null=True)
    is_checked_positive_positive_company_mission = pw.BooleanField(null=True)
    is_checked_positive_clear_benefits = pw.BooleanField(null=True)
    is_checked_negative_ease_of_use = pw.BooleanField(null=True)
    is_checked_negative_great_customer_support = pw.BooleanField(null=True)
    is_checked_negative_strong_feature_set = pw.BooleanField(null=True)
    is_checked_negative_cost_effective = pw.BooleanField(null=True)
    is_checked_negative_strong_community = pw.BooleanField(null=True)
    is_checked_negative_positive_company_mission = pw.BooleanField(null=True)
    is_checked_negative_clear_benefits = pw.BooleanField(null=True)

class postsTable(MySQLModel):
    class Meta:
        db_table = 'posts'

    id = pw.AutoField()
    title = pw.CharField(null=True)
    post_type = pw.CharField(null=True)
    item_type = pw.CharField(null=True)
    description = pw.TextField(null=True)
    url = pw.CharField(null=True)
    file_link = LongTextField(null=True)
    thumbnail_link = LongTextField(null=True)
    categories = JSONField(null=True)
    status = pw.CharField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    user = pw.IntegerField(null=True)
    thumbnail = pw.TextField(null=True)
    is_deleted = pw.BooleanField(null=True)
    is_private = pw.BooleanField(null=True)
    is_shared = pw.BooleanField(null=True)
    sharedgroup = LongTextField(null=True)
    upvote = pw.IntegerField(null=True)
    watch = pw.IntegerField(null=True)
    related_post = pw.IntegerField(null=True)
    related_command = pw.IntegerField(null=True)
    credit = pw.FloatField(null=True)
    tags = JSONField(null=True)
    contest = pw.IntegerField(null=True)
class postBookmarksTable(MySQLModel):
    class Meta:
        db_table = 'post_bookmark'

    id = pw.AutoField()
    post = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    is_deleted = pw.BooleanField(null=True)
    is_shared = pw.BooleanField(null=True)

class postCommentsTable(MySQLModel):
    class Meta:
        db_table = 'post_comment'

    id = pw.AutoField()
    post = pw.IntegerField(null=True)
    user = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    status = pw.TextField(null=True)
    rating = pw.IntegerField(null=True)
    comment = LongTextField(null=True)
    is_deleted = pw.BooleanField(null=True)

class userActivitiesTable(MySQLModel):
    class Meta:
        db_table = 'user_activities'

    id = pw.AutoField()
    user = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    activity = pw.TextField(null=True)
    item_type = pw.TextField(null=True)
    item_id = pw.IntegerField(null=True)
    target_type = pw.TextField(null=True)
    target_id = pw.IntegerField(null=True)
    target_user = pw.IntegerField(null=True)

class creditHistoriesTable(MySQLModel):
    class Meta:
        db_table = 'credit_histories'

    id = pw.AutoField()
    credit = pw.FloatField(null=True)
    user = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')], null=True)
    credit_type = pw.TextField(null=True)
    post = pw.IntegerField(null=True)
    artist = pw.IntegerField(null=True)
    is_free_credit = pw.BooleanField(null=True)

class reviewHistoriesTable(MySQLModel):
    class Meta:
        db_table = 'review_histories'

    id = pw.AutoField()
    item_id = pw.IntegerField(null=True)
    item_type = pw.TextField(null=True)
    reviewer = pw.IntegerField(null=True)
    result = pw.TextField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')],
                                  null=True)

class genKeywordHistoriesTable(MySQLModel):
    class Meta:
        db_table = 'image_keyword_histories'

    id = pw.AutoField()
    keyword = pw.TextField(null=True)
    prompt = LongTextField(null=True)
    keyword_source = pw.TextField(null=True)
    status = pw.TextField(null=True)
    count = pw.IntegerField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')],
                                  null=True)

class withdrawHistoriesTable(MySQLModel):
    class Meta:
        db_table = 'withdraw_histories'

    id = pw.AutoField()
    user = pw.IntegerField(null=True)
    credit = pw.FloatField(null=True)
    status = pw.TextField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')],
                                  null=True)

class contestsTable(MySQLModel):
    class Meta:
        db_table = 'contests'

    id = pw.AutoField()
    user = pw.IntegerField(null=True)
    title = pw.TextField(null=True)
    option = pw.TextField(null=True)
    status = pw.TextField(null=True)
    created_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP')], null=True)
    updated_at = pw.DateTimeField(constraints=[pw.SQL('DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')],
                                  null=True)
    end_at = pw.DateTimeField()
    upvote = pw.IntegerField(null=True)
    share = pw.IntegerField(null=True)
    watch = pw.IntegerField(null=True)
    thumbnail = pw.TextField(null=True)
    thumbnail_32 = pw.TextField(null=True)
    thumbnail_256 = pw.TextField(null=True)
    limit = pw.IntegerField(null=True)
    is_deleted = pw.IntegerField(null=True)
    item_type = pw.TextField(null=True)
    price = pw.FloatField(null=True)


class MongoDb():
    def __init__(self):
        self.DS2DATA_COLLECTION_NAME = 'ds2data'
        self.DS2DATA_LABELPROJECT_COLLECTION_NAME = 'ds2data-labelproject'
        self.DS2DATA_PROJECT_COLLECTION_NAME = 'ds2data-project'
        self.DS2AI_PROJECT_HYPER_PARAMS = 'ds2ai-project-hyper-params'
        self.LABELS_COLLECTION_NAME = 'labels'
        self.SERVER_LOG_COLLECTION_NAME = 'server-log'
        self.INSTANCE_LOG_COLLECTION_NAME = 'instance-log'
        self.CALLLOG_TEXT_COLLECTION_NAME = 'calllog-text'
        self.DAILY_KO_ALL_COLLECTION_NAME = 'hist_per_day-ko_all'
        self.DAILY_ETF_COLLECTION_NAME = 'hist_per_day-ko_etfs'
        self.DAILY_ETFS_COLLECTION_NAME = 'hist_per_day-etfs'
        self.DAILY_CRYPTOS_COLLECTION_NAME = 'hist_per_day-cryptos'
        self.DAILY_KO_COLLECTION_NAME = 'hist_per_day-ko'
        self.DAILY_EN_COLLECTION_NAME = 'hist_per_day-en'
        self.DAILY_EN_FINANCIAL_COLLECTION_NAME = 'hist_per_day-en_financial'
        self.DAILY_EN_GROUP1_COLLECTION_NAME = 'hist_per_day-en_group1_als'
        self.DAILY_EN_GROUP2_COLLECTION_NAME = 'hist_per_day-en_group2_3c'
        self.DAILY_EN_GROUP3_COLLECTION_NAME = 'hist_per_day-en_group3_etc'
        self.DAILY_RATE_COLLECTION_NAME = 'portfolio-daily_rate'
        self.MONTHLY_RATE_COLLECTION_NAME = 'portfolio-monthly_rate'
        self.STOCK_RATIO_COLLECTION_NAME = 'portfolio-stock_ratio'
        self.STOCK_VALUE_COLLECTION_NAME = 'portfolio-stock_value'
        self.ASSET_RATIO_COLLECTION_NAME = 'portfolio-asset_ratio'
        self.REBALANCING_COLLECTION_NAME = 'portfolio-rebalancing_history'
        self.INDEX_COLLECTION_NAME = 'index_per_day'

    def get_mongo_collection_dev(self, collection_name, db_name=mongodb, config_option=None):
        global mongodb_conn_dev
        print("mongodb_conn_dev")
        print(mongodb_conn_dev)
        if mongodb_conn_dev:
            return mongodb_conn_dev[collection_name]
        mongodb_conn_dev = MongoClient(
            "mongodb+srv://test1:test12345@dsdev.atd25.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")[db_name]
        return mongodb_conn_dev[collection_name]

    def get_mongo_collection(self, collection_name, db_name=mongodb, config_option=None):
        global db_conn_dict
        if db_conn_dict[db_name]:
            return db_conn_dict[db_name][collection_name]
        try:

            if 'true' in os.environ.get('DS2_DEV_TEST', 'false'):
                db_conn_dict[db_name] = MongoClient(
                    f"mongodb://{util_configs.get('staging_mongodb_user')}:{util_configs.get('staging_mongodb_passwd')}@{util_configs.get('staging_mongodb_host')}/{util_configs.get('staging_mongodb_schema')}?authSource=admin&retryWrites=true&w=majority")[
                    db_name]
            else:
                if utilClass.configOption in 'prod' or utilClass.configOption == 'prod_local' or config_option == "prod":
                    # db_conn_dict[db_name] = MongoClient(
                    #     f"mongodb+srv://{aistore_configs['prod_mongodb_user']}:{aistore_configs['prod_mongodb_passwd']}@{aistore_configs['prod_mongodb_host']}/{aistore_configs['prod_mongodb_schema']}?retryWrites=true&w=majority")[
                    #     db_name]
                    db_conn_dict[db_name] = MongoClient(host=aistore_configs['prod_mongodb_host'], port=13007, username=aistore_configs['prod_mongodb_user'], password=aistore_configs['prod_mongodb_passwd'])[db_name]

                elif utilClass.configOption == 'enterprise':
                    db_conn_dict[db_name] = \
                        MongoClient(host=master_ip if master_ip else "0.0.0.0", port=13007 if check_open_new_port() else 27017, username="root", password="dslabglobal")[db_name]
                else:
                    db_conn_dict[db_name] = MongoClient(
                        f"mongodb+srv://{util_configs.get('staging_mongodb_user')}:{util_configs.get('staging_mongodb_passwd')}@{util_configs.get('staging_mongodb_host')}/{util_configs.get('staging_mongodb_schema')}?retryWrites=true&w=majority")[
                        db_name]

        except Exception as e:
            print(e)
            print(traceback.format_exc())
        else:
            return db_conn_dict[db_name][collection_name]

    def get_mongo_client(self, db_name=mongodb, config_option=None):
        global db_conn_dict
        if db_conn_dict[db_name]:
            return db_conn_dict[db_name]
        if 'true' in os.environ.get('DS2_DEV_TEST', 'false'):
            db_conn_dict[db_name] = MongoClient(
                f"mongodb://{util_configs['staging_mongodb_user']}:{util_configs['staging_mongodb_passwd']}@{util_configs['staging_mongodb_host']}/myFirstDatabase?authSource=admin&retryWrites=true&w=majority")[
                db_name]
        else:
            if utilClass.configOption in 'prod' or utilClass.configOption == 'prod_local' or config_option == "prod":
                db_conn_dict[db_name] = MongoClient(
                    f"mongodb+srv://{aistore_configs['prod_mongodb_user']}:{aistore_configs['prod_mongodb_passwd']}@{aistore_configs['prod_mongodb_host']}/astore?retryWrites=true&w=majority")[db_name]
            else:
                db_conn_dict[db_name] = MongoClient(
                    f"mongodb+srv://{util_configs['staging_mongodb_user']}:{util_configs['staging_mongodb_passwd']}@{util_configs['staging_mongodb_host']}/myFirstDatabase?retryWrites=true&w=majority")[db_name]
                # conn_host = "localhost:27017/aistore"
                # conn_opt = "readPreference=primary&directConnection=true&ssl=false"
                # conn_uri = f"mongodb://{conn_host}?{conn_opt}"
                # db_conn_dict[db_name] = MongoClient(conn_uri)[db_name]
            if utilClass.configOption == 'enterprise' or config_option == "prod":
                db_conn_dict[db_name] = MongoClient(host=master_ip if master_ip else "0.0.0.0", port=13007 if check_open_new_port() else 27017, username="root", password="dslabglobal")[
                    db_name]
        return db_conn_dict[db_name]

    def change_id(self, data):
        if data and data.get('_id'):
            data['id'] = str(data['_id'])
            del data['_id']

        return data

    def update_document_by_id(self, collection_name, _id, data):
        if collection_name == self.DS2DATA_LABELPROJECT_COLLECTION_NAME and data.get('status'):
            status_sort_code = {'prepare': 0, 'none': 0, 'working': 5, 'ready': 10, 'review': 15, 'reject': 19,
                                'done': 20}
            data["status_sort_code"] = status_sort_code[data['status']]

        collection = self.get_mongo_collection(collection_name)
        data['updated_at'] = datetime.datetime.utcnow()
        return collection.update({'_id': ObjectId(_id)}, {'$set': data}, multi=False)

    def update_document_to_limit(self, collection_name, condition, data, limit):
        col = self.get_mongo_collection(collection_name)

        bulk_request = []
        for doc in list(col.find(condition).limit(limit)):
            bulk_request.append(UpdateOne({'_id': doc['_id']}, {'$set': data}))

        if bulk_request:
            return col.bulk_write(bulk_request)
        else:
            return []

    def get_group_documents(self, collection_name, condition, group_query, db_name=None):
        collection = self.get_mongo_collection(collection_name, db_name=db_name) if db_name else self.get_mongo_collection(collection_name)
        return list(collection.aggregate([{'$match': condition}, {'$group': group_query}]))

    def update_documents(self, collection_name, condition, data, db_name=None):
        collection = self.get_mongo_collection(collection_name,
                                               db_name=db_name) if db_name else self.get_mongo_collection(
            collection_name)

        return collection.update_many(condition, {'$set': data})

    def get_distinct_document(self, collection_name, field, condition):
        collection = self.get_mongo_collection(collection_name)
        return collection.distinct(field, condition)

    def get_one_document_by_id(self, collection_name, _id):
        collection = self.get_mongo_collection(collection_name)
        if type(_id) != str:
            _id = str(_id)

        result = self.change_id(collection.find_one({'_id': ObjectId(_id)}))

        return result

    def get_one_document_by_condition(self, collection_name, db_name=None, condition=None, sorting=None, direction=1):
        collection = self.get_mongo_collection(collection_name,
                                               db_name=db_name) if db_name else self.get_mongo_collection(
            collection_name)

        if sorting:
            try:
                result = self.change_id(collection.find(condition).sort(sorting, direction).limit(1)[0])
            except:
                result = None
        else:
            result = self.change_id(collection.find_one(condition))

        return result

    def get_documents(self, collection_name, condition=None, sorting=None, direction=1, limit=None, db_name=None):

        collection = self.get_mongo_collection(collection_name, db_name=db_name) if db_name else self.get_mongo_collection(collection_name)

        condition = condition if condition is not None else {}
        #todo : 여기서 _id를 id로 바꿔서  전달시 for문 돌려야함
        if sorting:
            # query = collection.find(condition).sort(sorting, direction).allow_disk_use(True)
            if limit:
                result = list(collection.aggregate(
                    [{"$sort": {sorting: direction}}, {"$match": condition}, {"$limit": limit}], allowDiskUse=True))
            else:
                result = list(collection.aggregate(
                    [{"$sort": {sorting: direction}}, {"$match": condition}], allowDiskUse=True))
        else:
            # query = collection.find(condition)
            if limit:
                result = list(collection.aggregate([{"$match": condition}, {"$limit": limit}]))
            else:
                result = list(collection.aggregate([{"$match": condition}]))

        # if limit:
        #     result = list(query.limit(limit))
        # else:
        #     result = list(query)

        for data in result:
            self.change_id(data)
        return result

    def get_documents_to_paginate(self, collection_name, condition={}, sorting=None, count=10, page=0, direction=1, db_name=None):
        collection = self.get_mongo_collection(collection_name, db_name=db_name) if db_name else self.get_mongo_collection(collection_name)

        if sorting:
            result = list(collection.aggregate(
                [{"$sort": {sorting: direction}}, {"$match": condition}, {"$skip": page * count}, {"$limit": count}],
                allowDiskUse=True))
        else:
            result = list(collection.aggregate([{"$match": condition}, {"$skip": page * count}, {"$limit": count}]))

        for data in result:
            self.change_id(data)
        return result

    def aggregate(self, collection_name, pipeline=(), sorting=None, count=-1, page=0, direction=1, db_name=None):
        collection = self.get_mongo_collection(collection_name, db_name=db_name) if db_name else self.get_mongo_collection(collection_name)
        if sorting:
            # pipeline.insert(0, {'$sort': {sorting: direction}})
            pipeline.append({'$sort': {sorting: direction}})

        skip_count = 0 if count == -1 else count * (page - 1)

        if skip_count > 0:
            pipeline.append({'$skip': skip_count})

        if count > 0:
            pipeline.append({'$limit': count})

        pipeline.append({'$addFields': {'id': {'$toString': '$_id'}}})
        pipeline.append({'$project': {'_id': 0}})

        result = list(collection.aggregate(pipeline))
        return result

    def delete_documents(self, collection_name, condition, db_name=None):
        collection = self.get_mongo_collection(collection_name, db_name=db_name) if db_name else self.get_mongo_collection(collection_name)
        return collection.delete_many(condition)

    def get_documents_count(self, collection_name, condition, db_name=None):
        collection = self.get_mongo_collection(collection_name, db_name=db_name) if db_name else self.get_mongo_collection(collection_name)
        return collection.count_documents(condition)

    def create_document(self, collection_name, data, db_name=None, ordered=True):
        collection = self.get_mongo_collection(collection_name, db_name=db_name) if db_name else self.get_mongo_collection(collection_name)
        if type(data) == list:
            collection.insert_many(data, ordered=ordered)
            for temp in data:
                temp = self.change_id(temp)
            return data
        else:
            collection.insert_one(data)
            return MongoDb().change_id(data)

    def create_view(self, view_name, collection_name, pipeline, db_name=None):
        client = self.get_mongo_client(db_name=db_name) if db_name else self.get_mongo_client()
        try:
            return client.create_collection(
                view_name,
                viewOn=collection_name,
                pipeline=pipeline
            )
        except:
            return None

    def create_collection(self, collection_name: str, data: list, db_name=None):
        client = self.get_mongo_client(db_name=db_name) if db_name else self.get_mongo_client()
        return client[collection_name].insert_many(data)

    def get_raw_data_from_document(self, collection_name, pipeline, db_name=None):
        collection = self.get_mongo_collection(collection_name, db_name=db_name) if db_name else self.get_mongo_collection(collection_name)
        return list(collection.aggregate(pipeline))

    def delete_collection(self, view_name, db_name=None):
        client = self.get_mongo_client(db_name=db_name) if db_name else self.get_mongo_client()
        return client[view_name].drop()

    def get_collection_list(self, db_name=None):
        client = self.get_mongo_client(db_name=db_name) if db_name else self.get_mongo_client()
        return client.list_collection_names()
    def get_t_documents(self, collection_name, dataconnector_id, conditions=None, lang_code=None, sort=None, limit=None, db_name=None):

        collection = self.get_mongo_collection(collection_name, db_name=db_name) if db_name else self.get_mongo_collection(collection_name)

        conditions = conditions if conditions is not None else []
        sort = sort if sort is not None else []

        results_raw = list(collection.aggregate(
            # [{"$sort":sort}, {"$match": {'rawData': {'lang_code': lang_code}, 'dataconnector': dataconnector_id}}, {"$limit": limit}], allowDiskUse=True))
            [{"$match": {'dataconnector': dataconnector_id}}], allowDiskUse=True))
        results = process_t(lang_code, conditions, sort, results_raw)
        results = sorted(results.items(), key=lambda item: item[1]['matched'], reverse=True)

        if not results:
            for result_raw in results_raw:
                results[result_raw['id']] = result_raw
        if limit:
            results = results[:limit]
        else:
            results = results[:10]
        return results

import peewee


class InitHelper():

    # def wrapper(func):
    #     @functools.wraps(func)
    #     def wrap(self, *args, **kwargs):
    #         with skyhub.connection_context():
    #             try:
    #                 return func(self, *args, **kwargs)
    #             except peewee.OperationalError as exc:
    #                 skyhub.connect(reuse_if_open=True)
    #                 return func(self, *args, **kwargs)
    #                 pass
    #     return wrap

    def wrapper(func):
        @functools.wraps(func)
        def wrap(self, *args, **kwargs):
            try:
                with skyhub.connection_context():
                    return func(self, *args, **kwargs)
            except peewee.OperationalError as exc:
                with skyhub.connection_context():
                    return func(self, *args, **kwargs)

        return wrap

    @wrapper
    def updateByData(self, data, tableName:MySQLModel, commonWhere, rowId = None):
        result = tableName.update(**data).where(commonWhere).execute()
        if rowId and usersTable == tableName:
            userInfo = usersTable.get(usersTable.id == rowId).__dict__['__data__']
            userInfo['user'] = userInfo['id']
            del userInfo['id']
            if not userInfo['birth']:
                userInfo['birth'] = datetime.datetime.now()
            userhistoriesTable.create(**userInfo)

        return result

if __name__ == '__main__':
    condition = {'labelproject':11674}
    mongoDb = MongoDb()
    data = {'status': 'prepare', 'reviewer': None, 'workAssignee': None, 'inspectionResult': None}
    mongoDb.update_documents(mongoDb.DS2DATA_LABELPROJECT_COLLECTION_NAME, condition=condition, data=data)
    # count = 1319
    # condition = {'labelproject':4209, 'status': 'review'}
    # data = {'labelData': None, 'status': 'prepare', 'status_sort_code':0}
    # MongoDb().update_document_to_limit(MongoDb().DS2DATA_LABELPROJECT_COLLECTION_NAME, condition, data, count)
    #
    # count = 10
    # condition = {'labelproject': 4211, 'status': "prepare", 'workAssignee': None}
    # for i in range(1,4):
    #     data = {'status': 'working', 'status_sort_code': 5, 'workAssignee': f'labeler{i}@healingsound.kr'}
    #     MongoDb().update_document_to_limit(MongoDb().DS2DATA_LABELPROJECT_COLLECTION_NAME, condition, data, count)
