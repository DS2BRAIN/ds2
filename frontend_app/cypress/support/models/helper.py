import datetime
import traceback
import bcrypt
import peewee
import functools
import json
import peewee as pw
import sys
from util import Util
from src.training.aistore_config import aistore_configs
from models import *

utilClass = Util()

class Helper():

    def __init__(self, init=False):
        print("helper init")

    def __exit__(self, exc_type, exc_value, traceback):

        if not skyhub.is_closed():
            skyhub.close()

    def wrapper(func):
        @functools.wraps(func)
        def wrap(self, *args, **kwargs):
            with skyhub.connection_context():
                try:
                    return func(self, *args, **kwargs)
                except peewee.OperationalError as exc:
                    skyhub.connect(reuse_if_open=True)
                    return func(self, *args, **kwargs)
                    pass
        return wrap

    @wrapper
    def getModelsByProjectId(self, projectId):
        return modelsTable.select().where(modelsTable.project == projectId).execute()
    @wrapper
    def getAllProjectsByUserId(self, userId):
        return projectsTable.select().where(projectsTable.user == userId).execute()
    @wrapper
    def getAllLabelProjectsByUserId(self, userId):
        return labelprojectsTable.select().where(labelprojectsTable.user==userId)
    @wrapper
    def getAllFolderByUserId(self, userId):
        return foldersTable.select().where(foldersTable.user == userId).execute()
    @wrapper
    def deleteProjectsByUserId(self, userId):
        return projectsTable.delete().where(projectsTable.user == userId)
    @wrapper
    def deleteDataconnectorsByUserId(self, userId):
        return dataconnectorsTable.delete().where(dataconnectorsTable.user == userId)
    @wrapper
    def deleteLabelProjectByUserId(self, userId):
        return labelprojectsTable.delete().where(labelprojectsTable.user == userId)
    @wrapper
    def deleteSthreeFilesByUserId(self, userId):
        return sthreefilesTable.delete().where(sthreefilesTable.user == userId)
    @wrapper
    def deleteLabelsByUserId(self, userId):
        return labelsTable.delete().where(labelsTable.user == userId)
    @wrapper
    def deleteFoldersByUserId(self, userId):
        return foldersTable.delete().where(foldersTable.user == userId)
    @wrapper
    def deleteAsyncTaskByUserId(self, userId):
        return asynctasksTable.delete().where(asynctasksTable.user == userId)
    @wrapper
    def deleteModelsByprojectId(self, projectId):
        return modelsTable.delete().where(modelsTable.project == projectId)
    @wrapper
    def deleteSubFolderByFolderId(self, folderId):
        return foldersubsTable.delete().where(foldersubsTable.folderId == folderId)
    @wrapper
    def deleteClassesByLabelProjectId(self, labelprojectId):
        return labelclassesTable.delete().where(labelclassesTable.labelproject == labelprojectId)
    @wrapper
    def deleteAnalyticsGraphsByModelId(self, modelId):
        return analyticsgraphTable.delete().where(analyticsgraphTable.model == modelId)
    @wrapper
    def deleteModelChartsByModelId(self, modelId):
        return modelchartsTable.delete().where(modelchartsTable.model == modelId)



