import traceback

import peewee

from models import *
import functools
class HelperUser():

    def __init__(self, init=False):
        ""
        self.InitHelper = InitHelper()

    def __exit__(self, exc_type, exc_value, traceback):

        if not skyhub.is_closed():
            skyhub.close()

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
    def getOneUsageplanByPlanName(self, planName):
        return usageplansTable.get_or_none(usageplansTable.planName == planName).__dict__['__data__']

    @wrapper
    def getUsageplans(self):
        return usageplansTable.select().execute()

    @wrapper
    def createUser(self, data):
        return usersTable.create(**(data))

    @wrapper
    def getGroupsByUserIdAndRoles(self, userId, roles = 'member'):
        return groupsTable.select(groupsTable.id, groupsTable.groupname, groupsTable.projectsid).join(
            groupUsersTable, on=(groupsTable.id == groupUsersTable.groupId)
                                      ).where((groupUsersTable.user == userId) & (groupUsersTable.role == roles))

    @wrapper
    def get_coffetime_Attendees(self):
        return employeeTable.select().where((employeeTable.isExit==False) & (employeeTable.has_participate_coffetime)).execute()

    @wrapper
    def join_coffe_time_by_employee_name(self, employee_name, is_join):
        return employeeTable.update({'has_participate_coffetime': is_join}).where(employeeTable.name == employee_name).execute()

    @wrapper
    def getMembersByGroupId(self, groupId, isAdmin = False):
        if not isAdmin:
            commonWhere = (groupUsersTable.groupId == groupId) & (groupUsersTable.acceptcode == 1)
        else:
            commonWhere = groupUsersTable.groupId == groupId
        return groupUsersTable.select(groupUsersTable.id, groupUsersTable.user, groupUsersTable.acceptcode, groupUsersTable.useremail,
                                      groupUsersTable.role, usersTable.name).join(usersTable, join_type='LEFT OUTER',
                                                                 on=(usersTable.id == groupUsersTable.user)).where(
            commonWhere).order_by(groupUsersTable.id.desc(), groupUsersTable.role).execute()

    @wrapper
    def createGroup(self, data):
        return groupsTable.create(**(data))

    @wrapper
    def createGroupUser(self, data):
        return groupUsersTable.create(**(data))

    @wrapper
    def getMemberByUserIdAndGroupId(self, userId, groupId):
        return groupUsersTable.get_or_none((groupUsersTable.groupId == groupId) & (groupUsersTable.user == userId))

    @wrapper
    def updateGroupNameByGroupId(self, groupId, datas):
        return groupsTable.update(**{'groupname':datas}).where(groupsTable.id == groupId).execute()

    @wrapper
    def updateGroupUserByGroupIdAndUserId(self, groupId, userId, datas):
        return groupUsersTable.update(**datas).where((groupUsersTable.user == userId) & (groupUsersTable.groupId == groupId)).execute()

    @wrapper
    def updateMemberByUserIdAndGroupId(self, userId, groupId, datas):
        return groupUsersTable.update(**datas).where((groupUsersTable.user == userId) & (groupUsersTable.groupId == groupId))

    @wrapper
    def checkSignedGroup(self, userId, groupId):
        return groupUsersTable.select().where((groupUsersTable.groupId == groupId) & (groupUsersTable.user == userId) & (groupUsersTable.acceptcode == 1)).count()

    @wrapper
    def getOneGroupUsersByUserIdAndGroupId(self, user, groupId):
        try:
            return groupUsersTable.get((groupUsersTable.groupId == groupId) & (groupUsersTable.user == user))
        except:
            return None

    @wrapper
    def getOneGroupById(self, groupId, raw=False):
        # return groupsTable.get_or_none(groupsTable.id == groupId).__dict__['__data__'] if not raw else groupsTable.get(groupsTable.id == groupId)
        result = groupsTable.get_or_none(groupsTable.id == groupId)
        if result is not None and raw is False:
            result = result.__dict__['__data__']

        return result


    @wrapper
    def getHostUsersByGroupId(self, groupId):
        return groupUsersTable.get((groupUsersTable.groupId == groupId) & (groupUsersTable.role == 'admin'))

    @wrapper
    def getAdminCountByGroupId(self, groupId):
        return groupUsersTable.select().where((groupUsersTable.groupId == groupId) & (groupUsersTable.role == 'admin')).count()

    @wrapper
    def getGroupMembersCountByGroupId(self, groupId):
        return groupUsersTable.select().where(groupUsersTable.groupId == groupId).count()

    @wrapper
    def getGroupUsersByGroupId(self, groupId, dict_flag=False):
        fields = groupUsersTable.user, groupUsersTable.useremail
        query = groupUsersTable.select(*fields).where((groupUsersTable.acceptcode == 1) & (groupUsersTable.groupId == groupId))
        return query.dicts() if dict_flag else query.execute()

    @wrapper
    def getGroupIdsByuserId(self, userId):
        return groupsTable.select().join(groupUsersTable, on=groupUsersTable.groupId == groupsTable.id).where(groupUsersTable.user == userId).execute()

    @wrapper
    def get_team_group_by_user_id_and_team_id(self, user_id, team_id):
        return groupsTable.select().join(groupUsersTable,
                on=groupUsersTable.groupId == groupsTable.id).where(
                (groupUsersTable.user == user_id) & (groupsTable.teamId == team_id)).execute()

    @wrapper
    def getshareProjectsByGroupId(self, groupId):
        return groupsTable.select(groupsTable.groupname, groupsTable.projectsid).where(groupsTable.id == groupId)

    @wrapper
    def getSharedProjectIdByUserId(self, userId):
        return groupsTable.select(groupsTable.projectsid).join(groupUsersTable,
                on=(groupsTable.id == groupUsersTable.groupId)).where(
                (groupUsersTable.user == userId) & (groupUsersTable.acceptcode == 1))

    @wrapper
    def getSharedLabelprojectIdByUserId(self, userId):
        return groupsTable.select(groupsTable.id, groupsTable.labelprojectsid).join(groupUsersTable, on=(
                groupsTable.id == groupUsersTable.groupId)).where(
            (groupUsersTable.user == userId) & (groupUsersTable.acceptcode == 1)).execute()

    @wrapper
    def getDeveloperModelsByUserId(self, userId):
        return developedAiModelsTable.select().where((developedAiModelsTable.user == userId) | (developedAiModelsTable.isExampleModel))

    @wrapper
    def deleteTestUserByEmail(self, email):
        return usersTable.delete().where((usersTable.email == email) & (usersTable.isTest)).execute()

    @wrapper
    def deleteTestUserByUserId(self, userId):
        return usersTable.delete().where((usersTable.id == userId) & (usersTable.isTest)).execute()

    @wrapper
    def getTestUserByUserEmailList(self, emailList):
        return usersTable.select().where((usersTable.email.in_(emailList)) & (usersTable.isTest)).execute()

    @wrapper
    def getTestUser(self, isFrontTest):
        commonWhere = ((usersTable.email.contains('@test.com')) | (
            usersTable.email.contains('@fronttest.com'))) if isFrontTest else (usersTable.email.contains('@test.com'))

        return usersTable.select(usersTable.id).where(commonWhere).execute()

    @wrapper
    def setExternalKeyForTest(self, testUser):
        azureKey, azureEndpoint = aistore_configs['subscription_key'], aistore_configs['azure_endpoint']
        awsKey, awsId = aistore_configs['aws_secret_access_key'], aistore_configs['aws_access_key_id']
        key, id = 'test', 'test'
        for x in externalaisTable.select().execute():
            if x.provider == 'azure':
                key, id = azureKey, azureEndpoint
            elif x.provider == 'amazon':
                key, id = awsKey, awsId

            data = {'modelName': x.externalAiName,
            'modeltype': x.id,
            'user': testUser,
            'status': 100,
            'modelpath': x.externalAiName,
            'apiKey': key,
            'additionalKey': id}
            developedAiModelsTable.create(**data)
