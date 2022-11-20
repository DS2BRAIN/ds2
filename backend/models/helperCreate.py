import datetime
import traceback
import bcrypt
import peewee

from models import *
import functools
class HelperCreate():

    def __init__(self, init=False):
        ""
        # if init:
        #     skyhub.connect(reuse_if_open=True)

    def __exit__(self, exc_type, exc_value, traceback):

        if not skyhub.is_closed():
            skyhub.close()

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
    def createFolder(self, data):
        return foldersTable.create(**(data))

    @wrapper
    def createAnalyticsgraph(self, data):
        return analyticsgraphTable.create(**(data))

    @wrapper
    def createFolderSub(self, data):
        return foldersubsTable.create(**(data))

    @wrapper
    def createEnterpriseUser(self, data):
        return enterpriseTable.create(**(data))

    @wrapper
    def createProject(self, data):
        data['isParameterCompressed'] = True
        projecthistoriesTable.create(**(data))
        return projectsTable.create(**(data))

    @wrapper
    def createUsagehistory(self, data):
        return usagehistoriesTable.create(**(data))

    @wrapper
    def createUsageplan(self, data):
        return usageplansTable.create(**(data))

    @wrapper
    def createContact(self, data):
        return contactsTable.create(**(data))

    @wrapper
    def deleteContactById(self, id):
        return contactsTable.delete().where(contactsTable.id == id).execute()

    @wrapper
    def get_all_ops_project_by_user_id(self, user_id):
        return opsProjectsTable.select().where(opsProjectsTable.user == user_id).execute()

    @wrapper
    def createAsyncTask(self, data):
        return asynctasksTable.create(**(data))

    @wrapper
    def update_async_task_complete_by_id(self, id):
        return asynctasksTable.update({'status': 100}).where(asynctasksTable.id == id).execute()

    @wrapper
    def delete_async_task_by_id(self, id):
        return asynctasksTable.delete().where(asynctasksTable.id == id).execute()

    @wrapper
    def check_export_coco(self, user_id, async_type):
        valid_date = datetime.datetime.utcnow() - datetime.timedelta(days=1)
        count = asynctasksTable.select().where(
            (asynctasksTable.user == user_id) & (asynctasksTable.taskType == async_type) & (asynctasksTable.created_at >= valid_date.date())).count()
        return count > 15

    @wrapper
    def createOpsProject(self, data):
        return opsProjectsTable.create(**(data))

    @wrapper
    def createOpsModel(self, data):
        return opsModelsTable.create(**(data))

    @wrapper
    def createOpsServerGroup(self, data):
        return opsServerGroupsTable.create(**(data))

    @wrapper
    def createJupyterProject(self, data):
        return jupyterProjectsTable.create(**(data))

    @wrapper
    def createJupyterJob(self, data):
        return jupyterJobsTable.create(**(data))

    @wrapper
    def createJupyterServer(self, data):
        return jupyterServersTable.create(**(data))

    @wrapper
    def createAdmin(self, data):
        return adminTable.create(**(data))

    @wrapper
    def createMarketProject(self, data):
        return marketProjectsTable.create(**(data))

    @wrapper
    def createMarketRequest(self, data):
        return marketRequests.create(**(data))

    @wrapper
    def createMovieStatistic(self, data):
        return movieStatisticsTable.create(**(data))

    @wrapper
    def create_multiple_ai_model_option(self, data):
        return MultipleAiModelOptionTable.create(**(data))

    @wrapper
    def create_ds2labs_quest(self, data):
        return Ds2labsQuestsUsers.create(**(data))

    @wrapper
    def create_template(self, data):
        return templatesTable.create(**(data))

    @wrapper
    def create_project_category(self, data):
        return projectcategoriesTable.create(**(data))

    @wrapper
    def create_pricing(self, data):
        return pricingTable.create(**(data))

    @wrapper
    def createFlow(self, data):
        return flowTable.create(**(data))

    @wrapper
    def createFlowNode(self, data):
        return flowNodeTable.create(**(data))

    @wrapper
    def createMonitoringAlert(self, data):
        return monitoringAlertTable.create(**(data))

    @wrapper
    def createUserProperty(self, data):
        return userPropertyTable.create(**(data))
    @wrapper
    def createTrainingServer(self, data):
        return trainingServerTable.create(**(data))

    @wrapper
    def createCommand(self, data):
        return commandTable.create(**(data))
    @wrapper
    def createCommandCollection(self, data):
        return commandCollectionTable.create(**(data))
    @wrapper
    def createCommandReview(self, data):
        return commandReviewTable.create(**(data))
    @wrapper
    def createPost(self, data):
        return postsTable.create(**(data))
    @wrapper
    def createPostBookmark(self, data):
        return postBookmarksTable.create(**(data))
    @wrapper
    def createPostComment(self, data):
        return postCommentsTable.create(**(data))