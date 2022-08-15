import json

import peewee as pw
import sys
from util import Util
from aistore_config import aistore_configs


utilClass = Util()

if utilClass.configOption in 'prod':
    skyhub = pw.MySQLDatabase(aistore_configs['prod_db_schema'], host=aistore_configs['prod_db_host'], port=3306,
                              user=aistore_configs['prod_db_user'], passwd=aistore_configs['prod_db_passwd'])
elif utilClass.configOption in 'enterprise':
    skyhub = pw.MySQLDatabase("skyhub", host="0.0.0.0", port=3306, user="skyhub", passwd="Dd8qDhm2eP!!")
else:
    skyhub = pw.MySQLDatabase("skyhub", host="dslabaa.clickai.ai", port=3306, user="skyhub", passwd="Dd8qDhm2eP!")

class JSONField(pw.TextField):
    def db_value(self, value):
        return json.dumps(value)

    def python_value(self, value):
        if value is not None:
            return json.loads(value)

class MySQLModel(pw.Model):
    """A base model that will use our MySQL database"""
    class Meta:
        database = skyhub

class adminTable(MySQLModel):
    class Meta:
        db_table = 'skyhub_administrator'

    id = pw.IntegerField()
    username = pw.CharField()
    email = pw.CharField()
    password = pw.CharField()
    resetPasswordToken = pw.CharField()
    blocked = pw.BooleanField()
    key = pw.CharField()
    maxuser = pw.IntegerField()
    maxgpu = pw.IntegerField()
    startDate = pw.DateTimeField()
    endDate = pw.DateTimeField()

class enterpriseTable(MySQLModel):
    class Meta:
        db_table = 'enterprise'

    id = pw.IntegerField()
    username = pw.CharField()
    email = pw.CharField()
    password = pw.CharField()
    resetPasswordToken = pw.CharField()
    blocked = pw.BooleanField()
    key = pw.CharField()
    maxuser = pw.IntegerField()
    maxgpu = pw.IntegerField()
    startDate = pw.DateTimeField()
    endDate = pw.DateTimeField()

class templatesTable(MySQLModel):
    class Meta:
        db_table = 'templates'

    id = pw.IntegerField()
    templateName = pw.CharField()
    templateCategory = pw.CharField()
    s3url = pw.CharField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    projectcategory = pw.CharField()
    templateDescription = pw.TextField()
    isTrainingMethod = pw.BooleanField()

class projectsTable(MySQLModel):
    class Meta:
        db_table = 'projects'

    id = pw.IntegerField()
    projectName = pw.CharField()
    status = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    user = pw.IntegerField()
    valueForPredict = pw.CharField()
    option = pw.CharField()
    csvupload = pw.IntegerField()
    fileStructure = pw.TextField()
    fileStructureGAN = pw.TextField()
    filePath = pw.CharField()
    statusText = pw.CharField()
    originalFileName = pw.CharField()
    trainingMethod = pw.CharField()
    detectedTrainingMethod = pw.CharField()
    isTest = pw.BooleanField()
    isSample = pw.IntegerField()
    errorCountConflict = pw.IntegerField()
    errorCountMemory = pw.IntegerField()
    errorCountNotExpected = pw.IntegerField()
    successCount = pw.IntegerField()
    valueForNorm = pw.FloatField()
    description = pw.TextField()
    license = pw.CharField()
    sampleData = pw.TextField()
    yClass = pw.TextField()
    datasetlicense = pw.IntegerField()
    hasTextData = pw.BooleanField()
    hasImageData = pw.BooleanField()
    isSentCompletedEmail = pw.BooleanField()
    projectcategory = pw.IntegerField()
    isParameterCompressed = pw.BooleanField()
    fileSize = pw.IntegerField()
    hasTimeSeriesData = pw.BooleanField()
    isFavorite = pw.BooleanField()
    dataset = pw.IntegerField()
    joinInfo = JSONField()
    trainingColumnInfo = JSONField()
    preprocessingInfo = JSONField()
    preprocessingInfoValue = JSONField()
    labelproject = pw.IntegerField()
    isSentFirstModelDoneEmail = pw.BooleanField()
    valueForPredictColumnId = pw.IntegerField()
    dataconnectorsList = JSONField()
    timeSeriesColumnInfo = JSONField()
    startTimeSeriesDatetime = pw.CharField()
    endTimeSeriesDatetime = pw.CharField()
    analyticsStandard = pw.CharField()
    prescriptionAnalyticsInfo = JSONField()
    isDeleted = pw.BooleanField()


class projecthistoriesTable(MySQLModel):
    class Meta:
        db_table = 'projecthistories'

    id = pw.IntegerField()
    projectName = pw.CharField()
    status = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    user = pw.IntegerField()
    valueForPredict = pw.CharField()
    option = pw.CharField()
    csvupload = pw.IntegerField()
    fileStructure = pw.TextField()
    fileStructureGAN = pw.TextField()
    filePath = pw.CharField()
    statusText = pw.CharField()
    originalFileName = pw.CharField()
    trainingMethod = pw.CharField()
    detectedTrainingMethod = pw.CharField()
    isTest = pw.BooleanField()
    isSample = pw.IntegerField()
    errorCountConflict = pw.IntegerField()
    errorCountMemory = pw.IntegerField()
    errorCountNotExpected = pw.IntegerField()
    successCount = pw.IntegerField()
    valueForNorm = pw.FloatField()
    description = pw.TextField()
    license = pw.CharField()
    sampleData = pw.TextField()
    yClass = pw.TextField()
    datasetlicense = pw.IntegerField()
    hasTextData = pw.BooleanField()
    hasImageData = pw.BooleanField()
    isSentCompletedEmail = pw.BooleanField()
    projectcategory = pw.IntegerField()
    isParameterCompressed = pw.BooleanField()
    fileSize = pw.IntegerField()
    hasTimeSeriesData = pw.BooleanField()
    isFavorite = pw.BooleanField()
    labelproject = pw.IntegerField()
    isSentFirstModelDoneEmail = pw.BooleanField()
    valueForPredictColumnId = pw.IntegerField()
    dataconnectorsList = JSONField()
    timeSeriesColumnInfo = JSONField()
    startTimeSeriesDatetime = pw.CharField()
    endTimeSeriesDatetime = pw.CharField()
    analyticsStandard = pw.CharField()
    isDeleted = pw.BooleanField()

class modelsTable(MySQLModel):
    class Meta:
        db_table = 'models'

    id = pw.IntegerField()
    name = pw.CharField()
    description = pw.CharField()
    sampleSize = pw.IntegerField()
    validation = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    accuracy = pw.DoubleField()
    status = pw.IntegerField()
    statusText = pw.CharField()
    progress = pw.DoubleField()
    modeldetail = pw.IntegerField()
    sampledatum = pw.IntegerField()
    project = pw.IntegerField()
    epoch = pw.IntegerField()
    lossFunction = pw.CharField()
    usingBert = pw.IntegerField()
    learningRateFromFit = pw.DoubleField()
    layerDeep = pw.IntegerField()
    layerWidth = pw.IntegerField()
    dropOut = pw.DoubleField()
    filePath = pw.CharField()
    confusion_matrix = pw.TextField()
    most_confused = pw.TextField()
    top_k_accuracy = pw.DoubleField()
    dice = pw.DoubleField()
    error_rate = pw.DoubleField()
    yClass = pw.CharField()
    feature_importance = pw.TextField()
    cm_statistics = pw.TextField()
    records = pw.TextField()
    visionModel = pw.CharField()
    objectDetectionModel = pw.CharField()
    confusionMatrix = pw.TextField()
    mostConfused = pw.TextField()
    topKAccuracy = pw.DoubleField()
    errorRate = pw.DoubleField()
    featureImportance = pw.TextField()
    cmStatistics = pw.TextField()
    rmse = pw.DoubleField()
    errorCountConflict = pw.IntegerField()
    errorCountMemory = pw.IntegerField()
    errorCountNotExpected = pw.IntegerField()
    isModelDownloaded = pw.BooleanField()
    mase = pw.DoubleField()
    mape = pw.DoubleField()
    r2score = pw.DoubleField()
    totalLoss = pw.DoubleField()
    ping_at = pw.DateTimeField()
    zombieCount = pw.IntegerField()
    timeSeriesTrainingRow = pw.IntegerField()
    isFavorite = pw.BooleanField()
    prescriptionAnalyticsInfo = JSONField()



class modelchartsTable(MySQLModel):
    class Meta:
        db_table = 'modelcharts'

    id = pw.IntegerField()
    epoch = pw.IntegerField()
    training_loss = pw.DoubleField()
    valid_loss = pw.DoubleField()
    precision = pw.DoubleField()
    recall = pw.DoubleField()
    f_beta = pw.DoubleField()
    auroc = pw.DoubleField()
    kappa_score = pw.DoubleField()
    matthews_correff = pw.DoubleField()
    accuracy = pw.DoubleField()
    model = pw.DoubleField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    rmse = pw.DoubleField()
    lossDA = pw.DoubleField()
    lossGA = pw.DoubleField()
    lossCycleA = pw.DoubleField()
    lossIdtA = pw.DoubleField()
    lossDB = pw.DoubleField()
    lossGB = pw.DoubleField()
    lossCycleB = pw.DoubleField()
    lossIdtB = pw.DoubleField()
    totalLoss = pw.DoubleField()

class userGroupsTable(MySQLModel):
    class Meta:
        db_table = 'usergroups'

    id = pw.IntegerField()
    groupName = pw.CharField()
    # usergroupchildren = pw.IntegerField()
    user = pw.IntegerField()

class userGroupChildrenTable(MySQLModel):
    class Meta:
        db_table = 'usergroupchildren'

    id = pw.IntegerField()
    groupChildName = pw.CharField()
    usergroup = pw.IntegerField()
    user = pw.IntegerField()
    isAceepted = pw.IntegerField()

class usersTable(MySQLModel):
    class Meta:
        db_table = 'users-permissions_user'

    id = pw.IntegerField()
    username = pw.CharField()
    email = pw.CharField()
    provider = pw.CharField()
    password = pw.CharField()
    resetPasswordToken = pw.CharField()
    confirmed = pw.IntegerField()
    blocked = pw.IntegerField()
    role = pw.IntegerField()
    socialID = pw.CharField()
    name = pw.CharField()
    resetPasswordRequestDatetime = pw.DateTimeField()
    resetPasswordVerifyLink = pw.CharField()
    resetPasswordVerifyTokenID = pw.CharField()
    emailVerifyRequestDatetime = pw.CharField()
    emailVerifyDatetime = pw.CharField()
    emailVerifyTokenID = pw.CharField()
    emailVerifyLink = pw.CharField()
    emailChangeValue = pw.CharField()
    emailChangeRequestDatetime = pw.CharField()
    emailChangeVerifyLink = pw.CharField()
    emailChangeVerifyTokenID = pw.CharField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    emailVerifiedYN = pw.CharField()
    phoneNumber = pw.CharField()
    sampledatum = pw.IntegerField()
    isAgreedWithPolicy = pw.IntegerField()
    isFirstplanDone = pw.BooleanField()
    usageplan = pw.IntegerField()
    cumulativeDiskUsage = pw.BigIntegerField()
    totalDiskUsage = pw.BigIntegerField()
    count = pw.IntegerField()
    dynos = pw.IntegerField()
    nextPaymentDate = pw.DateTimeField()
    cumulativeProjectCount = pw.IntegerField()
    cumulativePredictCount = pw.IntegerField()
    company = pw.CharField()
    nextDynos = pw.IntegerField()
    nextPlan = pw.IntegerField()
    isTest = pw.BooleanField()
    emailTokenCode = pw.CharField()
    promotion = pw.IntegerField()
    isDeleteRequested = pw.BooleanField()
    promotionCode = pw.CharField()
    isRequestedRefunded = pw.BooleanField()
    billingKey = pw.CharField()
    token = pw.TextField()
    gender = pw.CharField()
    birth = pw.DateTimeField()
    appTokenCode = pw.CharField()
    appTokenCodeUpdatedAt = pw.DateTimeField()
    remainProjectCount = pw.IntegerField()
    remainPredictCount = pw.IntegerField()
    remainDiskUsage = pw.BigIntegerField()
    additionalApiRate = pw.IntegerField()
    additionalShareUser = pw.IntegerField()
    additionalProjectCount = pw.IntegerField()
    additionalPredictCount = pw.IntegerField()
    additionalDiskUsage = pw.IntegerField()
    additionalLabelCount = pw.IntegerField()
    cumulativeLabelCount = pw.IntegerField()
    cardInfo = pw.CharField()
    companyLogoUrl = pw.CharField()
    remainLabelCount = pw.IntegerField()
    utmSource = pw.CharField()
    utmMedium = pw.CharField()
    utmCampaign = pw.CharField()
    utmTerm = pw.CharField()
    utmContent = pw.CharField()


class instancesTable(MySQLModel):
    class Meta:
        db_table = 'instances'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    instanceName = pw.CharField()
    planType = pw.CharField()
    terminatedDate = pw.DateTimeField()
    isTest = pw.BooleanField()
    publicIp = pw.CharField()
    hasGpuError = pw.BooleanField()

class externalAiTable(MySQLModel):
    class Meta:
        db_table = 'Externalai'
    id = pw.IntegerField()
    externalAiName = pw.CharField()
    displayName = pw.CharField()
    externalAiType = pw.CharField()
    ImageUrl = pw.CharField()
    RequirePredictUnit = pw.IntegerField()
    externalAiDescription = pw.TextField()
    hasPredictAll = pw.TextField()

class instancesUsersTable(MySQLModel):
    class Meta:
        db_table = 'instances_users__users_instances'

    id = pw.IntegerField()
    instance_id = pw.IntegerField()
    user_id = pw.IntegerField()
    updated_at = pw.DateTimeField()
    project_id = pw.IntegerField()
    model_id = pw.IntegerField()
    ps_id = pw.IntegerField()
    isTest = pw.BooleanField()

class usageplansTable(MySQLModel):
    class Meta:
        db_table = 'usageplans'

    id = pw.IntegerField()
    planName = pw.CharField()
    price = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    detail = pw.CharField()
    dynos = pw.IntegerField()
    usagehistory = pw.IntegerField()
    noOfPrediction = pw.IntegerField()
    storage = pw.IntegerField()
    projects = pw.IntegerField()
    apiAccess = pw.IntegerField()
    calSpeed = pw.CharField()
    noOfModeling = pw.CharField()
    technicalSupport = pw.CharField()
    abledMethod = pw.CharField()
    isApiAbled = pw.BooleanField()
    modelSpeed = pw.CharField()
    apiSpeedForOne = pw.IntegerField()
    apiSpeedForAll = pw.IntegerField()
    noOfDataset = pw.IntegerField()
    noOfConnector = pw.IntegerField()
    noOfLabelling = pw.IntegerField()
    noOfSharing = pw.IntegerField()


class promotionsTable(MySQLModel):
    class Meta:
        db_table = 'promotions'

    id = pw.IntegerField()
    promotionCode = pw.CharField()
    discountPercent = pw.FloatField()
    terminateDate = pw.DateTimeField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    planName = pw.CharField()


class usagehistoriesTable(MySQLModel):
    class Meta:
        db_table = 'usagehistories'

    id = pw.IntegerField()
    dynos = pw.IntegerField()
    nextDynos = pw.IntegerField()
    nextPlan = pw.IntegerField()
    usageplan = pw.IntegerField()
    user = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()


class contactsTable(MySQLModel):
    class Meta:
        db_table = 'contacts'

    id = pw.IntegerField()
    name = pw.CharField()
    phone = pw.CharField()
    email = pw.CharField()
    message = pw.TextField()
    company = pw.CharField()
    contactType = pw.CharField()
    utmSource = pw.CharField()
    utmMedium = pw.CharField()
    utmCampaign = pw.CharField()
    utmTerm = pw.CharField()
    utmContent = pw.CharField()


class datasetlicensesTable(MySQLModel):
    class Meta:
        db_table = 'datasetlicenses'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    licenseName = pw.CharField()
    licenseURL = pw.CharField()


class foldersTable(MySQLModel):
    class Meta:
        db_table = 'folders'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    folderName = pw.CharField()
    objectList = pw.TextField()
    user = pw.IntegerField()


class pgregistrationhistoriesTable(MySQLModel):
    class Meta:
        db_table = 'pgregistrationhistories'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    user = pw.IntegerField()
    PCD_PAY_RST = pw.CharField()
    PCD_PAY_CODE = pw.CharField()
    PCD_PAY_MSG = pw.CharField()
    PCD_PAY_TYPE = pw.CharField()
    PCD_PAY_OID = pw.CharField()
    PCD_PAYER_NO = pw.CharField()
    PCD_PAYER_ID = pw.CharField()
    PCD_PAYER_HP = pw.CharField()
    PCD_PAYER_EMAIL = pw.CharField()
    PCD_PAY_YEAR = pw.CharField()
    PCD_PAY_MONTH = pw.CharField()
    PCD_PAY_GOODS = pw.CharField()
    PCD_PAY_TOTAL = pw.CharField()
    PCD_PAY_ISTAX = pw.CharField()
    PCD_PAY_TAXTOTAL = pw.CharField()
    PCD_PAY_TIME = pw.CharField()
    PCD_PAY_CARDNANE = pw.CharField()
    PCD_PAY_CARDNUM = pw.CharField()
    PCD_PAY_CARDTRADENUM = pw.CharField()
    PCD_PAY_CARDAUTHNO = pw.CharField()
    PCD_PAY_CARDRECEIPT = pw.CharField()
    PCD_REGULER_FLAG = pw.CharField()
    PCD_SIMPLE_FLAG = pw.CharField()
    PCD_USER_DEFINE1 = pw.CharField()
    PCD_USER_DEFINE2 = pw.CharField()
    remainDiskUsage = pw.BigIntegerField()
    remainProjectCount = pw.IntegerField()
    remainPredictCount = pw.IntegerField()
    isValidRemainCount = pw.BooleanField()
    remainLabelCount = pw.IntegerField()

class pgpaymenthistoriesTable(MySQLModel):
    class Meta:
        db_table = 'pgpaymenthistories'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    paid_at_datetime = pw.DateTimeField()
    paid_at_datetime_ko = pw.DateTimeField()
    user = pw.IntegerField()
    price = pw.IntegerField()
    PCD_PAY_RST = pw.IntegerField()
    usageplan = pw.IntegerField()
    pgregistrationhistory = pw.IntegerField()
    PCD_PAY_CODE = pw.CharField()
    PCD_PAY_MSG = pw.CharField()
    PCD_PAY_OID = pw.CharField()
    PCD_PAY_TYPE = pw.CharField()
    PCD_PAYER_NO = pw.CharField()
    PCD_PAYER_ID = pw.CharField()
    PCD_PAYER_NAME = pw.CharField()
    PCD_PAYER_HP = pw.CharField()
    PCD_PAYER_EMAIL = pw.CharField()
    PCD_PAY_YEAR = pw.CharField()
    PCD_PAY_MONTH = pw.CharField()
    PCD_PAY_GOODS = pw.CharField()
    PCD_PAY_TOTAL = pw.CharField()
    PCD_PAY_TAXTOTAL = pw.CharField()
    PCD_PAY_ISTAX = pw.CharField()
    PCD_PAY_TIME = pw.CharField()
    PCD_PAY_CARDNAME = pw.CharField()
    PCD_PAY_CARDNUM = pw.CharField()
    PCD_PAY_CARDTRADENUM = pw.CharField()
    PCD_PAY_CARDAUTHNO = pw.CharField()
    PCD_PAY_CARDRECEIPT = pw.CharField()
    PCD_REGULER_FLAG = pw.CharField()
    PCD_SIMPLE_FLAG = pw.CharField()
    PCD_USER_DEFINE1 = pw.CharField()
    PCD_USER_DEFINE2 = pw.CharField()
    remainDiskUsage = pw.BigIntegerField()
    remainProjectCount = pw.IntegerField()
    remainPredictCount = pw.IntegerField()
    isValidRemainCount = pw.BooleanField()
    remainLabelCount = pw.IntegerField()

class potentialclientsTable(MySQLModel):
    class Meta:
        db_table = 'potentialclients'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    foundGroup = pw.CharField()
    found = pw.CharField()
    name = pw.CharField()
    description = pw.TextField()
    email = pw.CharField()
    website = pw.CharField()
    phone = pw.CharField()
    rawData = pw.TextField()
    isFirstEmailSent = pw.BooleanField()
    isTest = pw.BooleanField()

class projectcategoriesTable(MySQLModel):
    class Meta:
        db_table = 'projectcategories'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    categoryName = pw.CharField()

class asynctasksTable(MySQLModel):
    class Meta:
        db_table = 'asynctasks'

    id = pw.IntegerField()
    taskName = pw.CharField()
    taskType = pw.CharField()
    status = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    model = pw.IntegerField()
    labelproject = pw.IntegerField()
    user = pw.IntegerField()
    inputFilePath = pw.CharField()
    outputFilePath = pw.CharField()
    isChecked = pw.BooleanField()
    statusText = pw.TextField()
    project = pw.IntegerField()

class labelsTable(MySQLModel):
    class Meta:
        db_table = 'labels'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    file_path = pw.CharField()
    file_type = pw.CharField()
    file_name = pw.CharField()
    file_size = pw.IntegerField()
    last_updated_at = pw.DateTimeField()
    last_updated_by = pw.CharField()
    open_issue_count = pw.IntegerField()
    thumbnail = pw.TextField()
    unique_label_type = pw.CharField()
    status = pw.CharField()
    work_assignee = pw.CharField()
    requeued = pw.CharField()
    labeltype = pw.CharField()
    color = pw.CharField()
    locked = pw.BooleanField()
    visible = pw.BooleanField()
    selected = pw.BooleanField()
    points = pw.TextField()
    sthreefile = pw.IntegerField()
    labelclass = pw.IntegerField()
    labelproject = pw.IntegerField()
    user = pw.IntegerField()
    x = pw.FloatField()
    y = pw.FloatField()
    w = pw.FloatField()
    h = pw.FloatField()
    highlighted = pw.BooleanField()
    editingLabels = pw.BooleanField()
    isDeleted = pw.BooleanField()

class labelprojectsTable(MySQLModel):
    class Meta:
        db_table = 'labelprojects'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    name = pw.CharField()
    description = pw.TextField()
    workapp = pw.CharField()
    created_by = pw.CharField()
    last_updated_at = pw.DateTimeField()
    last_updated_by = pw.CharField()
    folder = pw.IntegerField()
    user = pw.IntegerField()
    isDeleted = pw.BooleanField()

class labelinfosTable(MySQLModel):
    class Meta:
        db_table = 'labelinfos'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    name = pw.CharField()
    shapes = pw.CharField()
    color = pw.CharField()
    labelproject = pw.IntegerField()
    labelobject = pw.IntegerField()

class sthreefilesTable(MySQLModel):
    class Meta:
        db_table = 'sthreefiles'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    fileName = pw.CharField()
    fileSize = pw.IntegerField()
    fileType = pw.CharField()
    last_updated_at = pw.DateTimeField()
    last_updated_by = pw.CharField()
    openIssueCount = pw.IntegerField()
    thumbnail = pw.TextField()
    uniqueLabelType = pw.CharField()
    status = pw.CharField()
    workAssignee = pw.CharField()
    requeued = pw.CharField()
    labelproject = pw.IntegerField()
    folder = pw.IntegerField()
    user = pw.IntegerField()
    s3key = pw.CharField()
    width = pw.FloatField()
    height = pw.FloatField()
    originalFileName = pw.CharField()
    isDeleted = pw.BooleanField()

class labelclassesTable(MySQLModel):
    class Meta:
        db_table = 'labelclasses'

    id = pw.IntegerField()
    name = pw.CharField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    labelproject = pw.IntegerField()
    color = pw.CharField()
    isDeleted = pw.BooleanField()

class foldersubsTable(MySQLModel):
    class Meta:
        db_table = 'foldersubs'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    folderId = pw.IntegerField()
    subFolderId = pw.IntegerField()

class analyticsgraphTable(MySQLModel):
    class Meta:
        db_table = 'analyticsgraphs'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    graphName = pw.CharField()
    graphType = pw.CharField()
    filePath = pw.CharField()
    origin = pw.CharField()
    model = pw.IntegerField()
    project = pw.IntegerField()

class datasetsTable(MySQLModel):
    class Meta:
        db_table = 'datasets'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    datasetName = pw.CharField()
    user = pw.IntegerField()
    startProjectPeriod = pw.CharField()
    repeatAmpm = pw.CharField()
    repeatHour = pw.CharField()
    repeatDays = pw.CharField()
    trainingMethod = pw.CharField()
    startTimeseriesDatetime = pw.CharField()
    endTimeseriesDatetime = pw.CharField()
    analyticsStandard = pw.CharField()
    timeseriesColumnInfo = JSONField()
    lastGenerateProjectDatetime = pw.DateTimeField()

class dataconnectorsTable(MySQLModel):
    class Meta:
        db_table = 'dataconnectors'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    dataconnectorName = pw.CharField()
    dataconnectorInfo = JSONField()
    dataconnectortype = pw.IntegerField()
    user = pw.IntegerField()
    folder = pw.IntegerField()
    dataset = pw.IntegerField()
    dbHost = pw.CharField()
    dbId = pw.CharField()
    dbPassword = pw.CharField()
    dbSchema = pw.CharField()
    dbTable = pw.CharField()
    keyFileInfo = JSONField()
    apiKey = pw.CharField()
    fileStructure = pw.TextField()
    fileStructureGAN = pw.TextField()
    filePath = pw.CharField()
    originalFileName = pw.CharField()
    valueForNorm = pw.FloatField()
    description = pw.TextField()
    sampleData = pw.TextField()
    yClass = pw.TextField()
    hasTextData = pw.BooleanField()
    hasImageData = pw.BooleanField()
    hasTimeSeriesData = pw.BooleanField()
    fileSize = pw.IntegerField()
    isDeleted = pw.BooleanField()
    sampleImageData = JSONField()

class dataconnectortypesTable(MySQLModel):
    class Meta:
        db_table = 'dataconnectortypes'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    dataconnectortypeName = pw.CharField()
    dataconnectortypeInfo = JSONField()
    logoUrl = pw.CharField()
    authType = pw.CharField()
    defaultPort = pw.IntegerField()

class datacolumnsTable(MySQLModel):
    class Meta:
        db_table = 'datacolumns'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    columnName = pw.CharField()
    index = pw.IntegerField()
    miss = pw.IntegerField()
    length = pw.IntegerField()
    unique = pw.IntegerField()
    uniqueValues = JSONField()
    type = pw.CharField()
    min = pw.FloatField()
    max = pw.FloatField()
    std = pw.FloatField()
    mean = pw.FloatField()
    top = pw.FloatField()
    freq = pw.FloatField()
    isForGan = pw.BooleanField()
    dataconnector = pw.IntegerField()

class externalaisTable(MySQLModel):
    class Meta:
        db_table = 'externalais'

    id = pw.IntegerField()
    created_at = pw.DateTimeField()
    updated_at = pw.DateTimeField()
    displayName = pw.CharField()
    externalAiName = pw.CharField()
    externalAiType = pw.CharField()
    imageUrl = pw.CharField()
    requirePredictUnit = pw.IntegerField()
    externalAiDescription = pw.TextField()
    externalAiSummary = pw.TextField()
    hasPredictAll = pw.BooleanField()

class additionalunitinfoTable(MySQLModel):
    class Meta:
        db_table = 'additionalunitinfos'

    id = pw.IntegerField()
    additionalUnitName = pw.CharField()
    additionalUnitPrice = pw.IntegerField()
    quantity = pw.IntegerField()