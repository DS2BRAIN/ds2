#-*- coding: utf-8 -*-

import datetime
import random
import shutil
import traceback
import zipfile
import ast
import os
import pandas as pd
from fastai.tabular.core import add_datepart
from models.helper import Helper
import time
from src.checkDataset import CheckDataset
from src.collecting.googleAnalytics.googleAnalytics import GoogleAnalytics
from .util import Util
import io
from src.collecting.connectorHandler import ConnectorHandler
from src.manageFile import ManageFile
import json
import subprocess
from PIL import Image as PImage
import numpy as np

class Processing():

    def __init__(self):

        self.dbClass = Helper()
        self.utilClass = Util()
        self.manageFileClass = ManageFile()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.checkDatasetClass = CheckDataset()

    def readFile(self, name, uploaded_file=False, isUsingDropNa=True):

        data = name

        df = None
        encoding_types = [None, 'cp949', 'euc-kr', 'unicode_escape', 'UTF-8']
        for encoding_type in encoding_types:
            try:
                if uploaded_file:
                    data = io.BytesIO(name)
                df = pd.read_csv(data, encoding=encoding_type, error_bad_lines=False, warn_bad_lines=False, na_filter= True)
            except:
                pass
            if df is not None:
                break

        if df is None:
            "FAIL TO READ CSV"
            print(traceback.format_exc())
            raise 1
        # 컬럼 데이터가 없을 경우
        if isUsingDropNa:
            df = df.dropna(how='all', axis=1)
            df = df.dropna(how='any', axis=0)

        columns = df.columns

        for column in columns:
            try:
                float(column)
                df['column__' + column] = df[column]
                df = df.drop(column, 1)
            except:
                pass

        df = self.removeNotUsedTable(df.replace(' ', '').dropna(how='all', axis=1))
        return df


    def readFileZip(self, filePath):
        file = filePath
        df = None
        encoding_types = [None, 'cp949', 'euc-kr', 'unicode_escape', 'UTF-8']
        for encoding_type in encoding_types:
            try:
                df = pd.read_csv(file, encoding=encoding_type, error_bad_lines=False, warn_bad_lines=False, na_filter= True)
            except:
                pass
            if df is not None:
                break
        if df is None:
            return 102

        df = df.replace(' ', '').dropna(how='all', axis=1)
        df = df.dropna(how='any', axis=0)
        columns = df.columns
        for column in columns:
            try:
                float(column)
                df['column__' + column] = df[column]
                df = df.drop(column, 1)
            except:
                pass

        df = self.removeNotUsedTable(df)

        return df

    def removeNotUsedTable(self, df):
        columns = list(df.columns)

        for i in range(0, len(columns)):

            # 아무 것도 없을 경우
            if columns[i] == 'Unnamed: ' + str(i):
                del df['Unnamed: ' + str(i)]

            # 공백일 경우
            if columns[i].strip() == '':
                del df[columns[i]]

        return df

    def unzipFile(self, filePath, folder=''):

        pathToZip = filePath
        pathToOut = os.path.splitext(filePath)[0]
        unzip = ['unzip', '-o', pathToZip, '-d', pathToOut]
        p = subprocess.call(unzip)
        return pathToOut

    def unzip(self, source_file, dest_path):
        with zipfile.ZipFile(source_file, 'r') as zf:
            zf.extractall(path=dest_path)
            zf.close()

    def getRealPath(self, filePath):
        getFolderPath = os.path.splitext(filePath)[0]
        files = os.listdir(getFolderPath)
        matchedCSVfile = None
        folderName = None
        for file in files:
            if '.csv' in file:
                matchedCSVfile = file
            if not '.' in file:
                folderName = file
        if not matchedCSVfile and folderName:
            files = os.listdir(getFolderPath + "/" + folderName)
            getFolderPath = getFolderPath + "/" + folderName
            for file in files:
                if '.csv' in file:
                    matchedCSVfile = file

        return getFolderPath

    def getCSVfile(self, filePath):
        getFolderPath = os.path.splitext(filePath)[0]
        files = os.listdir(getFolderPath)
        matchedCSVfile = None
        folderName = None
        for file in files:
            if '.csv' in file:
                matchedCSVfile = file
            if not '.' in file:
                folderName = file
        if not matchedCSVfile and folderName:
            files = os.listdir(getFolderPath + "/" + folderName)
            getFolderPath = getFolderPath + "/" + folderName
            for file in files:
                if '.csv' in file:
                    matchedCSVfile = file

        return getFolderPath + "/" + matchedCSVfile

    def downloadData(self, project):

        s3UserFolder = "user/" + str(project['user']) + "/"
        s3LocalPath = project['filePath'].split(s3UserFolder)[1]
        if not os.path.exists(f"opt/{str(project['id'])}/"):
            os.makedirs(f"{self.utilClass.save_path}/{str(project['id'])}/", exist_ok=True)
        localFilePath = f"{self.utilClass.save_path}/{str(project['id'])}/" + s3LocalPath
        if not os.path.isfile(localFilePath):
            unquoteS3LocalPath = self.utilClass.unquote_url(s3LocalPath)
            self.s3.download_file(self.utilClass.bucket_name, s3UserFolder + unquoteS3LocalPath, localFilePath)
        return localFilePath

    def downloadDataWithFilePath(self, project, filePath):

        s3UserFolder = "user/" + str(project['user']) + "/"
        if not os.path.exists(f"{self.utilClass.save_path}/{str(project['id'])}/"):
            os.makedirs(f"{self.utilClass.save_path}/{str(project['id'])}/", exist_ok=True)

        if self.utilClass.configOption != 'enterprise':
            s3LocalPath = filePath.split(s3UserFolder)[1]
            localFilePath = f"{self.utilClass.save_path}/{str(project['id'])}/" + s3LocalPath
            if not os.path.isfile(localFilePath):
                unquoteS3LocalPath = self.utilClass.unquote_url(s3LocalPath)
                self.s3.download_file(self.utilClass.bucket_name, s3UserFolder + unquoteS3LocalPath, localFilePath)
        else:
            localFilePath = filePath
            if not os.path.exists(filePath):
                self.s3.download_file(self.utilClass.bucket_name, filePath, localFilePath)

        return localFilePath

    def prepareData(self, project):
        print('project id : ' + str(project.get('id')))

        timeSeriesColumnInfo = project.get('timeSeriesColumnInfo', {}) if project.get('timeSeriesColumnInfo') else {}
        startTimeSeriesDatetime = project.get('startTimeSeriesDatetime', '')
        endTimeSeriesDatetime = project.get('endTimeSeriesDatetime', '')
        analyticsStandard = project.get('analyticsStandard', '')
        trainingColumnInfo = project.get('trainingColumnInfo') if project.get('trainingColumnInfo') else {}
        joinInfo = project.get('joinInfo')
        preprocessingInfo = project.get('preprocessingInfo') if project.get('preprocessingInfo') else {}
        preprocessingInfoValue = project.get('preprocessingInfoValue')
        valueForPredict = project.get('valueForPredict')
        valueForPredictColumnId = project.get('valueForPredictColumnId')
        valueForUserColumnId = project.get('valueForUserColumnId')
        valueForItemColumnId = project.get('valueForItemColumnId')
        trainingMethod = project.get('trainingMethod') if project.get('trainingMethod') else ''
        valueForPredictColumnInfo = {}

        dataconnectorsRaw = self.getDataconnectorsInfoByDataconnectorsList(project.get('dataconnectorsList', []))
        fileStructure = []
        columnsInfo = {}
        timeSeriesInfo = {}
        columnsInfoArray = []
        joinColumnNameArray = []
        dataFrames = {}
        num_cols_preprocessed = []
        str_cols_preprocessed = []
        num_cols = []
        str_cols = []
        dep_var = valueForPredict
        recommenderUserColumn = None
        recommenderItemColumn = None
        configFile = None
        print(dataconnectorsRaw)
        s3Url = None
        if dataconnectorsRaw:
            s3Url = dataconnectorsRaw[0].filePath
        mainData = None
        trainData = None
        dataRaw = None
        yClass = project.get('yClass')

        if trainingMethod not in ['image', 'object_detection', 'cycle_gan']:

            if project.get('labelproject'):
                labelproject_raw = self.dbClass.getLabelProjectsById(project.get('labelproject'))
                trainData, s3Url = self.checkDatasetClass.export_data(labelproject_raw)

                dataRaw = trainData
                # dataconnectorsRaw = self.getDataconnectorsInfoByDataconnectorsList(ast.literal_eval(labelproject_raw.dataconnectorsList))

            for dataconnector in dataconnectorsRaw:
                localFilePath = None

                isProcessed = False
                if dataconnector.filePath:
                    localFilePath = self.downloadDataWithFilePath(project, dataconnector.filePath)
                    dataRaw = self.readFile(localFilePath)
                else:
                    dataconnectortype = self.dbClass.getOneDataconnectortypeById(dataconnector.dataconnectortype)
                    isProcessed = True

                    if not os.path.exists(f"{self.utilClass.save_path}/{str(project['id'])}/"):
                        os.makedirs(f"{self.utilClass.save_path}/{str(project['id'])}/")
                    if dataconnectortype.dataconnectortypeName == 'Google Analytics':
                        localFilePath = f"{self.utilClass.save_path}/{str(project['id'])}/ga_{round(time.time() * 10000000)}.csv"
                        dataRaw = GoogleAnalytics(dataconnector.keyFileInfo).collect(dataconnector.apiKey,
                                                                             start_date=startTimeSeriesDatetime,
                                                                             end_date=endTimeSeriesDatetime
                                                                                     )
                    if dataconnectortype.authType == 'db':
                        localFilePath = f"{self.utilClass.save_path}/{str(project['id'])}/db_export_{round(time.time() * 10000000)}.csv"
                        connector = ConnectorHandler(method='JDBC', dictionary=dataconnector.keyFileInfo)
                        dataRaw = connector.collect()

                dataColumnsLast = self.dbClass.getDatacolumnsByDataconnectorId(dataconnector.id)
                dataColumnsUpdateDict = {}
                # 컬럼별 확인
                if dataRaw is not None:
                    for i, column in enumerate(list(dataRaw.columns)):
                        # print('컬럼명 : ', columns[i])
                        dataObject = self.utilClass.parseColumData(dataRaw[column], len(dataRaw[column]))
                        dataObject = {**dataObject,
                                      # "columnName": column,
                                      "index": str(i + 1),
                                      "dataconnector": dataconnector.id if dataconnector else None,
                                      }
                        dataColumnsUpdateDict[column] = dataObject

                    for dataColumn in dataColumnsLast:
                        try:
                            self.dbClass.updateDatacolumn(dataColumn.id, dataColumnsUpdateDict[dataColumn.columnName])
                        except:
                            # self.dbClass.updateDatacolumn(dataColumn.id, dataColumnsUpdateDict[dataColumn.columnName + "__" + dataconnector.originalFileName])
                            pass

                time.sleep(0.5)
                dataColumns = self.dbClass.getDatacolumnsByDataconnectorId(dataconnector.id)


                columnsInfo[dataconnector.id] = {} if not columnsInfo.get(dataconnector.id) else columnsInfo[
                    dataconnector.id]
                for dataColumn in dataColumns:
                    columnInfo = dataColumn.__dict__['__data__']
                    columnInfo['use'] = json.dumps(trainingColumnInfo.get(str(columnInfo['id'])))
                    fileStructure.append(dataColumn.__dict__['__data__'])
                    # TODO : 전처리, 조인 기능 여기에 넣어야됨
                    columnInfo['dataconnector'] = dataconnector.id
                    columnInfo['dataconnectorName'] = dataconnector.dataconnectorName
                    columnsInfo[columnInfo['id']] = columnInfo
                    columnInfo['originalColumnName'] = columnInfo['columnName']
                    if dataconnector.originalLabelproject:
                        columnInfo['columnName'] = columnInfo['columnName'] + "__" + dataconnector.dataconnectorName
                    else:
                        print("No originalLabelproject")

                    columnsInfoArray.append(columnInfo)

                    if columnInfo['id'] == valueForPredictColumnId:
                        valueForPredictColumnInfo = columnInfo
                        valueForPredictColumnInfo['dataconnector'] = dataconnector.id
                        valueForPredictColumnInfo['dataconnectorName'] = dataconnector.dataconnectorName
                        dep_var = columnInfo['columnName']

                    if columnInfo['id'] == valueForUserColumnId:
                        recommenderUserColumn = columnInfo['columnName']
                        print("recommenderUserColumn")
                        print(recommenderUserColumn)
                    if columnInfo['id'] == valueForItemColumnId:
                        recommenderItemColumn = columnInfo['columnName']
                        print("recommenderItemColumn")
                        print(recommenderItemColumn)
                    print("columnInfo['columnName']")
                    print(columnInfo['columnName'])
                    print(columnInfo['type'])
                    try:
                        if columnInfo['type'] and columnInfo['type'] in 'number':
                            timeSeriesInfo[columnInfo['columnName']] = 'sum'
                        elif preprocessingInfo.get(columnInfo['id']):
                            timeSeriesInfo[columnInfo['columnName']] = 'mean'
                        elif 'datetime' in columnInfo['type']:
                            timeSeriesInfo[columnInfo['columnName']] = lambda x: x.value_counts().index[0] if len(x.value_counts().index) else ''
                        else:
                            timeSeriesInfo[columnInfo['columnName']] = lambda x: x.value_counts().index[0] if len(x.value_counts().index) else ''
                    except:
                        timeSeriesInfo[columnInfo['columnName']] = None
                        pass

                dataFarmeColumnsName = []
                # if project.get("labelproject"):
                for dataFarmeColumn in dataRaw.columns:
                    dataFarmeColumnsName.append(dataFarmeColumn + "__" + dataconnector.dataconnectorName)
                dataRaw.columns = dataFarmeColumnsName

                df, num_col, str_col, _, configFile = self.preProcessing(project, localFilePath,
                                 columnsInfoArray=columnsInfoArray, isProcessed=isProcessed, df=dataRaw)

                dataFrames[dataconnector.id] = df
                num_cols_preprocessed = num_cols_preprocessed + num_col
                str_cols_preprocessed = str_cols_preprocessed + str_col
                print(df.head())

            if trainData is None:
                mainColumnId = valueForPredictColumnInfo['dataconnector']
                mainData = df

                if joinInfo:
                    mainData = dataFrames[mainColumnId]
                    for subColumnId, value in joinInfo.items():
                        subData = dataFrames[int(subColumnId)]
                        leftColumnId = None
                        for connectorId, isJoinColumn in value['mainConnector'].items():
                            if isJoinColumn:
                                leftColumnId = int(connectorId)
                        leftColumn = columnsInfo[leftColumnId]
                        leftColumnName = leftColumn['columnName']
                        rightColumnId = None
                        for connectorId, isJoinColumn in value['subConnector'].items():
                            if isJoinColumn:
                                rightColumnId = int(connectorId)
                        rightColumn = columnsInfo[rightColumnId]
                        rightColumnName = rightColumn['columnName']
                        mainData = pd.merge(mainData, subData, how='left', left_on=leftColumnName, right_on=rightColumnName) #TODO :
                        joinColumnNameArray.append(rightColumnName)

                if preprocessingInfo:
                    for columnId, preprocessingColumnInfo in preprocessingInfo.items():
                        # for preprocessingType, isForPreprocessing in preprocessingColumnInfo.items():
                        #     if not isForPreprocessing:
                        #         continue
                            columnInfo = columnsInfo[int(columnId)]
                            isObjectInfo = columnInfo.get('type', '') == 'object'
                            if preprocessingColumnInfo.get("fulfilling"):
                                infoValue = preprocessingInfoValue.get(columnId, {}).get('fulfilling', 0)
                                fulfillValue = 0
                                isVaild = True
                                if not infoValue:
                                    infoValue = ''
                                if '중간값' in infoValue and not isObjectInfo:
                                    fulfillValue = mainData[columnInfo['columnName']].median()
                                elif '평균값' in infoValue and not isObjectInfo:
                                    fulfillValue = mainData[columnInfo['columnName']].mean()
                                elif '중간값' in infoValue or '평균값' in infoValue:
                                    isVaild = False
                                if isVaild:
                                    mainData[columnInfo['columnName']] = mainData[columnInfo['columnName']].fillna(
                                        value=fulfillValue)

                            if preprocessingColumnInfo.get("cleaningRegression") and not isObjectInfo:
                                infoValue = preprocessingInfoValue.get(columnId, {}).get('cleaningRegression', 0)
                                infoValue = int(infoValue) if infoValue else 99.9
                                quantileValueMax = mainData[columnInfo['columnName']].quantile(q=infoValue * 0.01,
                                                                                                 interpolation='nearest')
                                quantileValueMin = mainData[columnInfo['columnName']].quantile(q=1 - infoValue * 0.01,
                                                                                                 interpolation='nearest')
                                mainData = mainData[mainData[columnInfo['columnName']] < quantileValueMax]
                                mainData = mainData[mainData[columnInfo['columnName']] > quantileValueMin]

                            if preprocessingColumnInfo.get("cleaningClassification") and isObjectInfo:
                                infoValue = preprocessingInfoValue.get(columnId, {}).get('cleaningClassification', 0)
                                infoValue = int(infoValue) if infoValue else 5
                                cleanedColumnInfo = (mainData[columnInfo['columnName']].value_counts() > infoValue)
                                mainData = mainData[mainData[columnInfo['columnName']].isin(cleanedColumnInfo[cleanedColumnInfo].index.values.tolist())]

                            if preprocessingColumnInfo.get("deidentifying") and isObjectInfo:
                                infoValue = preprocessingInfoValue.get(columnId, {}).get('deidentifying', 0)
                                infoValue = int(infoValue) if infoValue else 80
                                countInfo = mainData[columnInfo['columnName']].value_counts()
                                if mainData.shape[0] * 0.01 * infoValue < countInfo.shape[0]:
                                    mainData = mainData.drop(columnInfo['columnName'], axis=1)

                            if preprocessingColumnInfo.get("normalization") and not isObjectInfo:
                                mainData[columnInfo['columnName']] = (mainData[columnInfo['columnName']]-mainData[columnInfo['columnName']].mean())/mainData[columnInfo['columnName']].std()
                            if preprocessingColumnInfo.get("timeSeriesMean") and not isObjectInfo:
                                timeSeriesInfo[columnInfo['columnName']] = 'mean'

                timeStandardColumn = None
                for timeSeriesColumnId, boolValue in timeSeriesColumnInfo.items():
                    if boolValue:
                        try:
                            timeStandardColumn = columnsInfo[int(timeSeriesColumnId)].get('columnName', columnsInfo[int(timeSeriesColumnId)].get('originalColumnName'))
                        except:
                            pass
                if 'time_series' in trainingMethod and timeStandardColumn:
                    mainData[timeStandardColumn] = pd.to_datetime(mainData[timeStandardColumn])
                    if startTimeSeriesDatetime:
                        mainData = mainData.loc[mainData[timeStandardColumn] >= startTimeSeriesDatetime]
                    if endTimeSeriesDatetime:
                        mainData = mainData.loc[mainData[timeStandardColumn] <= endTimeSeriesDatetime]
                    timestamp = str(round(time.time() * 10000000))
                    mainData['timeStandardColumn' + timestamp] = pd.to_datetime(mainData[timeStandardColumn])
                    if analyticsStandard and timeSeriesInfo:
                        if 'month' in analyticsStandard:
                            mainData = mainData.groupby(pd.Grouper(key='timeStandardColumn' + timestamp, freq='M')).agg(timeSeriesInfo)
                        elif 'day' in analyticsStandard:
                            mainData = mainData.groupby(pd.Grouper(key='timeStandardColumn' + timestamp, freq='D')).agg(timeSeriesInfo)
                        elif 'hour' in analyticsStandard:
                            mainData = mainData.groupby(pd.Grouper(key='timeStandardColumn' + timestamp, freq='H')).agg(timeSeriesInfo)
                        elif 'min' in analyticsStandard:
                            mainData = mainData.groupby(pd.Grouper(key='timeStandardColumn' + timestamp, freq='T')).agg(timeSeriesInfo)
                        else:
                            resolution = pd.DatetimeIndex(mainData['timeStandardColumn' + timestamp]).resolution
                            if 'second' in resolution:
                                mainData = mainData.groupby(pd.Grouper(key='timeStandardColumn' + timestamp, freq='T')).agg(timeSeriesInfo)
                            else:
                                mainData = mainData.groupby(pd.Grouper(key='timeStandardColumn' + timestamp, freq='D')).agg(timeSeriesInfo)
                    else:
                        resolution = pd.DatetimeIndex(mainData['timeStandardColumn' + timestamp]).resolution
                        if 'second' in resolution:
                            mainData = mainData.groupby(pd.Grouper(key='timeStandardColumn' + timestamp, freq='T')).agg(
                                timeSeriesInfo)
                        else:
                            mainData = mainData.groupby(pd.Grouper(key='timeStandardColumn' + timestamp, freq='D')).agg(
                                timeSeriesInfo)
                    mainData = mainData[mainData[timeStandardColumn] != "[]"]
                    try:
                        mainData = mainData.drop('timeStandardColumn' + timestamp, axis=1)
                    except:
                        print(traceback.format_exc())
                        pass

                if 'text' in trainingMethod:
                    print("shuffle")
                    mainData = mainData.sample(frac=1).reset_index(drop=True)
                else:
                    mainData.replace(["NaN", 'NaT'], np.nan, inplace=True)
                    mainData.dropna(how="any", inplace=True)
                    mainData = mainData.reset_index(drop=True)
                mainData.dropna(how="all", inplace=True)

                # for joinColumnName in joinColumnNameArray:
                #     del mainData[joinColumnName]

                trainData = mainData

            mainDataColumns = trainData.columns

            # dataconnectorsRaw = self.getDataconnectorsInfoByDataconnectorsList(project['dataconnectorsList'])
            # dataconnector = dataconnectorsRaw[0]
            # trainData.columns = [f'{x}__{dataconnector.dataconnectorName}' for x in trainData.columns]

            for num_col_preprocessed in num_cols_preprocessed:
                # if num_col_preprocessed in mainDataColumns:
                    num_cols.append(num_col_preprocessed)
            for str_cols_preprocessed in str_cols_preprocessed:
                # if str_cols_preprocessed in mainDataColumns:
                    str_cols.append(str_cols_preprocessed)

            if not s3Url:

                mainDataFileName = f"processed_data_{project['id']}.csv"
                mainData.to_csv(f"{self.utilClass.save_path}/" + mainDataFileName, encoding='utf-8')

                self.s3.upload_file(f"{self.utilClass.save_path}/" + mainDataFileName, self.utilClass.bucket_name, f"user/{project['user']}/{mainDataFileName}")
                s3Url = f"https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{project['user']}/{mainDataFileName}"

                if self.utilClass.configOption == 'enterprise':
                    s3Url = f"{self.utilClass.save_path}/user/{project['user']}/{mainDataFileName}"

        elif trainingMethod in ['image']:

            if project.get('labelproject'):
                labelproject_raw = self.dbClass.getLabelProjectsById(project.get('labelproject'))
                trainData, s3Url = self.checkDatasetClass.export_data(labelproject_raw)

            else:
                if not project.get('yClass'):
                    if dataconnectorsRaw:
                        yClass = dataconnectorsRaw[0].yClass
                else:
                    yClass = project.get('yClass')
            dep_var = 'label'
            fileStructure = [{'columnName': 'image'}, {'columnName': 'label'}]

        elif trainingMethod in ['object_detection']:
            dep_var = 'label'
            fileStructure = [{'columnName': 'image'}, {'columnName': 'label'}]
            if not project.get('yClass'):
                if dataconnectorsRaw:
                    yClass = dataconnectorsRaw[0].yClass
            else:
                yClass = project.get('yClass')

            if project.get('labelproject'):
                cocoData = self.getLabelProjectImages(project.get('labelproject'),
                                                                              project.get('id'))
                configFile = f"{self.utilClass.save_path}/{project['id']}/coco.json"
                fileRoute = f"{self.utilClass.save_path}/{project['id']}/"

                os.makedirs(fileRoute, exist_ok=True)

                self.make_archive(f"{self.utilClass.save_path}/{project['id']}", f"{self.utilClass.save_path}/{project['id']}.zip")
                # zf = zipfile.ZipFile(f"{self.utilClass.save_path}/{project['id']}.zip", "w")
                # for dirname, subdirs, files in os.walk(f"{self.utilClass.save_path}/{project['id']}"):
                #     zf.write(dirname)
                #     for filename in files:
                #         print(dirname)
                #         # join_name = "." + dirname.split(f"{self.utilClass.save_path}/{project['id']}")[1]
                #         # if dirname == f"{self.utilClass.save_path}/{project['id']}":
                #         #     join_name = f"./"
                #         try:
                #             zf.write(os.path.join(dirname, filename), compress_type = zipfile.ZIP_DEFLATED)
                #         except:
                #             print(traceback.format_exc())
                #             pass
                # zf.close()
                #
                shutil.copyfile(f"{self.utilClass.save_path}/{project['id']}.zip", f"{fileRoute}{project['id']}.zip")

                self.s3.upload_file(f"{fileRoute}{project['id']}.zip", self.utilClass.bucket_name, f"user/{project['user']}/{project['id']}.zip")
                s3Url = f"https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{project['user']}/{project['id']}.zip"
                if self.utilClass.configOption == 'enterprise':
                    s3Url = f"{self.utilClass.save_path}/user/{project['user']}/{project['id']}.zip"
                if not project.get('yClass'):
                    yClass = str([x.name for x in self.dbClass.getLabelClassesByLabelProjectId(project.get('labelproject'))])

        elif trainingMethod in ['cycle_gan']:
            dataColumns = self.dbClass.getDatacolumnsByDataconnectorId(dataconnectorsRaw[0].id)
            for dataColumn in dataColumns:
                if dataColumn.isForGan:
                    fileStructure.append({**dataColumn.__dict__['__data__'], 'use': 'true'})
                if dataColumn.id == valueForPredictColumnId:
                    dep_var = dataColumn.columnName

        self.dbClass.updateProject(project['id'], {
            'valueForPredict': dep_var,
            'recommenderUserColumn': recommenderUserColumn,
            'recommenderItemColumn': recommenderItemColumn,
            'filePath': s3Url,
            'fileStructure': json.dumps(fileStructure, ensure_ascii=False, default=str),
            'yClass': yClass,
        })

        project = {**project, **{
            'valueForPredict': dep_var,
            'recommenderUserColumn': recommenderUserColumn,
            'recommenderItemColumn': recommenderItemColumn,
            'filePath': s3Url,
            'fileStructure': json.dumps(fileStructure, ensure_ascii=False, default=str),
        }}

        return s3Url, trainData, num_cols, str_cols, dep_var, configFile, project

    def downloadModel(self, model, GAN=False):
        s3Url = self.utilClass.unquote_url(model['filePath'])
        # print(os.getcwd())
        # print(s3Url)
        # print("/".join(s3Url.split("/")[3:]))
        localFilePath = f"{self.utilClass.save_path}/" + s3Url.split("/")[-1]
        if not os.path.isfile(localFilePath):
            if self.utilClass.configOption != 'enterprise':
                # wget.download(s3Url, out=self.utilClass.save_path)
                self.s3.download_file(self.utilClass.bucket_name, "/".join(s3Url.split("/")[3:]), localFilePath)
            else:
                if self.utilClass.save_path in s3Url:
                    self.s3.download_file(self.utilClass.bucket_name, s3Url, localFilePath)
                else:
                    self.s3.download_file(self.utilClass.bucket_name,
                                      f"{self.utilClass.save_path}/" + "/".join(s3Url.split("/")[3:]), localFilePath)

        if GAN:
            localFilePath_G_B = localFilePath.replace('G_A','G_B')
            if not os.path.isfile(localFilePath_G_B):
                self.s3.download_file(self.utilClass.bucket_name, "/".join(s3Url.split("/")[3:]), localFilePath_G_B)



        return localFilePath

    def preProcessing(self, project, localFilePath, columnsInfoArray=None, isProcessed=False, df=None, model=None):

        num_cols = []
        str_cols = []
        configFile = None
        hasDatetimeColumn = False
        sampleImageArray = []
        row_length_array = []
        word_count_array = []
        row_count = 0
        training_data_statistics = {
            "image_format": {
                # "jpg": 0,
            },
            "image_resolution": {
                # "1024x1024": 0,
            },
            "image_color_bit": {
                # "4bit": 0,
            },
            "sum_row_length": 0,
            "average_row_length": 0,
            "sum_word_count": 0,
            "average_word_count": 0,
            "row_count": 0,
        }

        project = self.dbClass.getOneProjectById(project['id'])
        if columnsInfoArray:
            project['fileStructure'] = json.dumps(columnsInfoArray, ensure_ascii=False, default=str)
        dataconnectors = self.getDataconnectorsInfoByDataconnectorsList(project.get('dataconnectorsList',[]))
        if dataconnectors:
            dataconnectorName = ".".join(dataconnectors[0].dataconnectorName.split('.')[:-1])
        if project['trainingMethod'] in ['image','object_detection','cycle_gan']:
            if '.zip' in localFilePath:
                if not os.path.exists(f"{self.utilClass.save_path}/{str(project['id'])}/"):
                    os.makedirs(f"{self.utilClass.save_path}/{str(project['id'])}/")

                if 'image' in project['trainingMethod']:
                    self.unzipFile(localFilePath)
                    test_rows = []
                    train_rows = []
                    for (dirpath, dirnames, filenames) in os.walk(
                            os.path.splitext(localFilePath)[0]
                    ):
                        if '__MACOSX' in dirpath:
                            continue

                        sampleImageNum = 0
                        folderName = ""
                        try:
                            folderName = dirpath.split(os.path.splitext(localFilePath)[0] + "/")[1]
                        except:
                            pass

                        random.shuffle(filenames)
                        test_data_count = int(len(filenames) * 0.2)
                        for filename in filenames:
                            if '.' in filename:
                                if filename.split('.')[-1].lower() in ['jpg', 'gif', 'jpeg', 'png']:

                                    if project['isVerify'] and not project['training_data_statistics']:
                                        file_path = f"{dirpath}/{filename}"
                                        training_data_statistics = self.calculate_statistics_by_image(file_path, training_data_statistics)

                                    if test_data_count > 0:
                                        test_data_count -= 1
                                        test_rows.append({
                                            'image': f"{folderName}/{filename}",
                                            'label': folderName
                                        })
                                    else:
                                        train_rows.append({
                                            'image': f"{folderName}/{filename}",
                                            'label': folderName
                                        })
                                    if sampleImageNum < 6 and not dataconnectors[0].sampleImageData:

                                        fullPath = f"{os.path.splitext(localFilePath)[0]}/{folderName}/{filename}"
                                        self.s3.upload_file(fullPath, self.utilClass.bucket_name,
                                                            f"user/{project['user']}/dataconnector/{dataconnectors[0].id}/sample_{filename}")
                                        s3Path = f"https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{project['user']}/dataconnector/{dataconnectors[0].id}/sample_{filename}"

                                        if self.utilClass.configOption == 'enterprise':
                                            s3Path = f"{self.utilClass.save_path}/user/{project['user']}/dataconnector/{dataconnectors[0].id}/sample_{filename}"

                                        sampleImageArray.append(s3Path)
                                        sampleImageNum += 1

                    test_df = pd.DataFrame(test_rows)
                    train_df = pd.DataFrame(train_rows)
                    df = pd.concat([train_df, test_df])

                    if sampleImageArray and not dataconnectors[0].sampleImageData:
                        dataconnectors[0].sampleImageData = sampleImageArray
                        dataconnectors[0].save()
                    pass

                elif 'object_detection' in project['trainingMethod']:
                    self.unzipFile(localFilePath)
                    if project.get('labelproject'):
                        if not os.path.exists(f"{self.utilClass.save_path}/{project['id']}/coco.json"):
                            try:
                                cocoData = self.getLabelProjectImages(project.get('labelproject'), project.get('id'))
                                fileRoute = f"{self.utilClass.save_path}/{project['id']}/"
                                os.makedirs(fileRoute, exist_ok=True)

                                self.make_archive(f"{self.utilClass.save_path}/{project['id']}",
                                                  f"{self.utilClass.save_path}/{project['id']}.zip")
                                shutil.copyfile(f"{self.utilClass.save_path}/{project['id']}.zip", f"{fileRoute}{project['id']}.zip")
                            except:
                                print(traceback.format_exc())
                                pass

                        configFile = f"{self.utilClass.save_path}/{project['id']}/coco.json"
                    else:
                        configFile = self.getJSONfile(localFilePath)

                    if project['isVerify'] and not project['training_data_statistics']:
                        with open(configFile, encoding='utf-8', errors='ignore') as json_file:
                            json_loaded = json.load(json_file)
                            for row in json_loaded.get('images', []):
                                file_path = f"{self.utilClass.save_path}/{project['id']}/{row['file_name']}"
                                # file_path = f"{self.utilClass.save_path}/{project['id']}/images/{row['file_name']}" #TEST
                                training_data_statistics = self.calculate_statistics_by_image(file_path, training_data_statistics)

                elif 'cycle_gan' in project['trainingMethod']:
                    self.unzipFile(localFilePath)

                    rows = []
                    for (dirpath, dirnames, filenames) in os.walk(
                            os.path.splitext(localFilePath)[0]
                                     ):

                        if '__MACOSX' in dirpath:
                            continue

                        folderName = ""
                        try:
                            folderName = dirpath.split(os.path.splitext(localFilePath)[0] + "/")[1]
                        except:
                            pass
                        for filename in filenames:
                            if '.' in filename:
                                if filename.split('.')[-1].lower() in ['jpg', 'gif', 'jpeg', 'png']:
                                    rows.append({
                                        'image': f"{folderName}/{filename}",
                                        'label': ''
                                    })



                    df = pd.DataFrame(rows)
                    pass

            else:
                # df 파일 열어서 상대경로해가지고 파일들 다운로드 받기
                if df is None:
                    df = self.readFile(localFilePath)

                s3UserFolder = "user/" + str(project['user']) + "/"
                s3LocalPath = project['filePath'].split(s3UserFolder)[1]
                s3LocalFolder = ''
                if '/' in s3LocalPath:
                    s3LocalFolder = '/'.join(s3LocalPath.split('/')[:-1]) + "/"
                    if not os.path.exists(f"{self.utilClass.save_path}/{str(project['id'])}/{s3LocalFolder}"):
                        os.makedirs(f"{self.utilClass.save_path}/{str(project['id'])}/{s3LocalFolder}")

                for index, row in df.iterrows():
                    print(dataconnectors[0].dataconnectorName)
                    localImageFilePath = f"{self.utilClass.save_path}/{str(project['id'])}/{s3LocalFolder}/{dataconnectorName}/{row['image__' + dataconnectors[0].dataconnectorName]}"

                    localImageFileFolder = '/'.join(localImageFilePath.split('/')[:-1])

                    if not os.path.exists(localImageFileFolder):
                        os.makedirs(localImageFileFolder)

                    if not os.path.exists(localImageFilePath):
                        route = f"{s3UserFolder}{s3LocalFolder}/{dataconnectorName}/{row['image__' + dataconnectors[0].dataconnectorName]}"
                        self.s3.download_file(self.utilClass.bucket_name,
                                              route, localImageFilePath)

                    if project['isVerify'] and not project['training_data_statistics']:
                        training_data_statistics = self.calculate_statistics_by_image(localImageFilePath, training_data_statistics)

        else:

            if df is None:
                df = self.readFile(localFilePath, isUsingDropNa=False)
            else:
                isProcessed = True
            # df = df.fillna('-1').sample(frac=1)
            # df.dropna(how="all", inplace=True)

            try:
                fileStructure = ast.literal_eval(project['fileStructure'])
            except:
                fileStructure = json.loads(project['fileStructure'])
                pass

            df.apply(pd.api.types.infer_dtype)
            dfColumns = df.columns

            for columnInfo in fileStructure:
                if isProcessed:
                    columnName = columnInfo.get("columnName")
                else:
                    columnName = columnInfo.get("originalColumnName") \
                        if columnInfo.get("columnName") != columnInfo.get("originalColumnName") and columnInfo.get("originalColumnName") \
                        else columnInfo.get("columnName")

                if not json.loads(columnInfo.get('use', 'True').lower()) and columnInfo.get('use', 'True').lower() != 'true':
                    continue
                if columnInfo.get('columnName', '') == project['valueForPredict']:
                    continue
                # if columnName not in dfColumns and columnName + "__" + dataconnectorName + ".csv" not in dfColumns:
                #     if not project.get("labelproject"):
                #         continue
                if 'number' in columnInfo.get('type'):
                    num_cols.append(columnName)
                elif 'datetime' in columnInfo.get('type'):
                    hasDatetimeColumn = True

                    prefix_date = None
                    if 'date' in columnName or 'Date' in columnName:
                        prefix_date = columnName
                    try:
                        df = add_datepart(df.copy(), columnName, prefix_date)
                    except:
                        print(traceback.format_exc())
                        pass

                    num_cols.append(f'{columnName}Year')
                    num_cols.append(f'{columnName}Month')
                    num_cols.append(f'{columnName}Week')
                    num_cols.append(f'{columnName}Day')
                    num_cols.append(f'{columnName}Dayofweek')
                    str_cols.append(f'{columnName}Is_month_end')
                    str_cols.append(f'{columnName}Is_month_start')
                    str_cols.append(f'{columnName}Is_quarter_end')
                    str_cols.append(f'{columnName}Is_quarter_start')
                    str_cols.append(f'{columnName}Is_year_end')
                    str_cols.append(f'{columnName}Is_year_start')
                    # num_cols.append(f'{columnName}weekday_cos')
                    # num_cols.append(f'{columnName}weekday_sin')
                    # num_cols.append(f'{columnName}day_month_cos')
                    # num_cols.append(f'{columnName}day_month_sin')
                    # num_cols.append(f'{columnName}month_year_cos')
                    # num_cols.append(f'{columnName}month_year_sin')
                    # num_cols.append(f'{columnName}day_year_cos')
                    # num_cols.append(f'{columnName}day_year_sin')

                else:
                    if not 'datetime' in columnInfo.get('type'):
                        str_cols.append(columnName)


            if project['isVerify'] and not project['training_data_statistics'] and project['trainingMethod'] == "text":
                for index, row in df.iterrows():
                    first_value = row[str_cols[0]] # 문자가 아닐 경우 에러가 나야 정상
                    row_length_array.append(len(first_value))
                    word_count_array.append(len(str(first_value).split(" ")))
                    row_count += 1
                training_data_statistics["sum_row_length"] = sum(row_length_array)
                training_data_statistics["average_row_length"] = sum(row_length_array) / len(row_length_array)
                training_data_statistics["sum_word_count"] = sum(word_count_array)
                training_data_statistics["average_word_count"] = sum(word_count_array) / len(word_count_array)
                training_data_statistics["row_count"] = row_count


        self.dbClass.updateProject(project['id'], {
            'training_data_statistics': training_data_statistics
        })
        dep_var = project['valueForPredict']

        # df.columns = df.columns.str.strip()

        try:
            df.dropna(subset=[dep_var], inplace=True)
            df.to_csv(localFilePath, encoding='utf-8')
        except:
            pass

        if 'text' in project['trainingMethod']:
            print("shuffle")
            df = df.sample(frac=1).reset_index(drop=True)
        # if 'time_series' not in project['trainingMethod'] and not hasDatetimeColumn:
        #     df = df.sample(frac=1).reset_index(drop=True)

        return df, num_cols, str_cols, dep_var, configFile

    def getTempFileAndSize(self, filename, df=None, file=None, isZip=False):

        newFileName = filename
        tempFile = os.getcwd() + f'/temp/{newFileName}'
        if isZip:
            # newTempFile = os.path.splitext(tempFile)[0] + "/" + newFileName
            # if not os.path.exists(os.path.splitext(tempFile)[0]):
            #     os.makedirs(os.path.splitext(tempFile)[0])
            #     shutil.copyfile(tempFile, newTempFile)
            with open(tempFile, 'wb') as open_file:
                open_file.write(file)
            self.unzipFile(tempFile)
        else:
            df.to_csv(tempFile)
        fileSize = os.path.getsize(tempFile)

        return tempFile, fileSize, newFileName

    def getJSONfile(self, filePath):
        getFolderPath = os.path.splitext(filePath)[0]
        files = os.listdir(getFolderPath)
        matchedJSONfile = None
        folderName = None
        for file in files:
            if '.json' in file:
                matchedJSONfile = file
            if not '.' in file:
                folderName = file
                if folderName != "__MACOSX":
                    files = os.listdir(getFolderPath + "/" + folderName)
                    for file in files:
                        if '.json' in file:
                            matchedJSONfile = file
                            getFolderPath = getFolderPath + "/" + folderName
                            return getFolderPath + "/" + matchedJSONfile
        if not matchedJSONfile and folderName:
            files = os.listdir(getFolderPath + "/" + folderName)
            getFolderPath = getFolderPath + "/" + folderName
            for file in files:
                if '.json' in file:
                    matchedJSONfile = file

        return getFolderPath + "/" + matchedJSONfile

    def readObjectDetectionJSONFile(self, filePath):
        try:
            with open(filePath, encoding='utf-8', errors='ignore') as json_file:
                data = json.load(json_file, encoding='utf-8')

                df = pd.DataFrame({})

                for annotation in data.get('annotations', []):
                    df = df.append({'image': annotation.get('image_id'), 'label': annotation.get('category_id')}, ignore_index=True)

                df = df.replace(' ', '').dropna(how='all', axis=1)

                return df
        except:
            filePath = os.path.splitext(filePath)[0] + filePath.split("._")[1]
            print("alternative filePath")
            print(filePath)
            with open(filePath, encoding='utf-8', errors='ignore') as json_file:
                data = json.load(json_file, encoding='utf-8')

                df = pd.DataFrame({})

                for annotation in data.get('annotations', []):
                    df = df.append({'image': annotation.get('image_id'), 'label': annotation.get('category_id')},
                                   ignore_index=True)

                df = df.replace(' ', '').dropna(how='all', axis=1)

                return df
            pass
    def getDataconnectorsInfoByDataconnectorsList(self, dataconnectorsList):
        if not dataconnectorsList:
            return []
        dataconnectorsRaw = []
        for dataconnectorId in dataconnectorsList:
            dataconnector = self.dbClass.getOneDataconnectorById(dataconnectorId)
            dataconnector.dataconnectortype = self.dbClass.getOneDataconnectortypeById(dataconnector.dataconnectortype)
            dataconnector.datacolumns = [x.__dict__['__data__'] for x in self.dbClass.getDatacolumnsByDataconnectorId(dataconnector.id)]
            dataconnectorsRaw.append(dataconnector)
        return dataconnectorsRaw


    def getLabelProjectImages(self, labelingProjectId, projectId, is_suffle=True):
        labelingProject = self.dbClass.getOneLabelProjectById(labelingProjectId)
        print('f"{self.utilClass.save_path}/{projectId}/"')
        print(f"{self.utilClass.save_path}/{projectId}/")
        if not os.path.exists(f"{self.utilClass.save_path}/{projectId}/"):
            print(f"mkdir {self.utilClass.save_path}/{projectId}/")
            os.mkdir(f"{self.utilClass.save_path}/{projectId}/")
        exportCoco = self.checkDatasetClass.exportCoCoData(labelingProject, projectId=projectId, has_median_data=False, is_suffle=is_suffle)
        if not os.path.exists(f"{self.utilClass.save_path}/{projectId}/coco.json"):
            with open(f"{self.utilClass.save_path}/{projectId}/coco.json", 'w+') as f:
                f.write(json.dumps(exportCoco.get('trainCocodata', {}), ensure_ascii=False)) if exportCoco.get(
                    'trainCocodata') else exportCoco
        if exportCoco.get('testCocodata'):
            if not os.path.exists(f"{self.utilClass.save_path}/{projectId}/cocovalid.json"):
                with open(f"{self.utilClass.save_path}/{projectId}/cocovalid.json", 'w+') as f:
                    f.write(json.dumps(exportCoco.get('testCocodata', {}), ensure_ascii=False))
        return exportCoco

    def calculate_statistics_by_image(self, file_path, statistics):

        image_by_pil = PImage.open(file_path)

        image_format = os.path.splitext(file_path)[1]
        image_color_bit = image_by_pil.mode
        image_resolution = f"{image_by_pil.size[0]}x{image_by_pil.size[1]}"

        if not statistics['image_format'].get(image_format):
            statistics['image_format'][image_format] = 0
        statistics['image_format'][image_format] += 1

        if not statistics['image_color_bit'].get(image_color_bit):
            statistics['image_color_bit'][image_color_bit] = 0
        statistics['image_color_bit'][image_color_bit] += 1

        if not statistics['image_resolution'].get(image_resolution):
            statistics['image_resolution'][image_resolution] = 0
        statistics['image_resolution'][image_resolution] += 1

        return statistics

    def make_archive(self, source, destination):
        base = os.path.basename(destination)
        name = base.split('.')[0]
        format = base.split('.')[1]
        archive_from = os.path.dirname(source)
        archive_to = os.path.basename(source.strip(os.sep))
        shutil.make_archive(name, format, archive_from, archive_to)
        shutil.move('%s.%s' % (name, format), destination)
