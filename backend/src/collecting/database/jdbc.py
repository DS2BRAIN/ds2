import os

import jaydebeapi as jp
import pandas as pd
import pandas.io.sql as pd_sql
import pymysql

from src.collecting.connector import Connector
from src.util import Util


class JDBC(Connector):
    # 데이터베이스별 기본 정보
    driverDir = os.path.join(os.path.dirname(__file__), 'jars')

    database_type = {
        'mysql': {
            'port': 3306,
            'infoTable': 'INFORMATION_SCHEMA.columns',
            'columnName': ['column_name', 'column_type'],
            'limit': 'LIMIT ',
            'driver': {
                'class': 'com.mysql.jdbc.Driver',
                'type': 'jdbc:mysql://',
                'jar': 'mysql-connector-java-5.1.49.jar',
                'databaseParam': '/',
            }
        },
        'mssql': {
            'port': 1433,
            'infoTable': 'INFORMATION_SCHEMA.columns',
            'columnName': ['column_name', 'data_type'],
            'limit': 'TOP ',
            'driver': {
                'class': 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
                'type': 'jdbc:sqlserver://',
                'jar': 'mssql-jdbc-8.2.2.jre11.jar',
                'databaseParam': ';DatabaseName=',
            }
        },
        'oracle': {
            'port': 1521,
            'infoTable': 'USER_TAB_COLUMNS',
            'columnName': ['column_name', 'data_type'],
            'limit': 'WHERE ROWNUM <= ',
            'driver': {
                'class': 'oracle.jdbc.OracleDriver',
                'type': 'jdbc:oracle:thin:@',
                'jar': 'ojdbc8.jar',
                'databaseParam': '/',
            }
        },
        'postgresql': {
            'port': 5432,
            'infoTable': 'INFORMATION_SCHEMA.columns',
            'columnName': ['column_name', 'data_type'],
            'limit': 'LIMIT ',
            'driver': {
                'class': 'org.postgresql.Driver',
                'type': 'jdbc:postgresql://',
                'jar': 'postgresql-42.2.14.jar',
                'databaseParam': '/',
            }
        }
    }

    def __init__(self, connectionInfo: dict):
        super().__init__(connectionInfo)

        self.utilClass = Util()
        self.s3 = self.utilClass.getBotoClient('s3')

        #
        self.host = connectionInfo.get('host')
        self.userId = connectionInfo.get('userId')
        self.password = connectionInfo.get('password')
        self.port = connectionInfo.get('port', None)
        self.charset = 'utf8'

        # 현재 구현된 데이터베이스 체크
        self.tableName = connectionInfo.get('tableName')
        self.dbType = connectionInfo.get('dbType', 'mysql').lower()
        if self.dbType not in self.database_type:
            raise ValueError(f"'{self.dbType}' 는 지원하지 않습니다.")

        # 기본 변수 초기화
        self.dbInfo = self.database_type[self.dbType]
        self.port = self.dbInfo['port'] if self.port is None else self.port
        self.driver = self.dbInfo['driver']
        self.databaseName = connectionInfo.get('database')

        # # JAVA_HOME이 설정되어 있지 않을 경우
        # if ("JAVA_HOME" not in os.environ):
        #     os.environ["JAVA_HOME"] = r"D:\Program Files\Java\jdk-11.0.7"

        # 모든 JDBC 파일 다운로드
        self.JDBC_Driver = [os.path.join(self.driverDir, database['driver']['jar']) for database in self.database_type.values()]
        for database in self.database_type.values():
            jarFileName = database['driver']['jar']
            jarFile = os.path.join(self.driverDir, jarFileName)
            if not os.path.exists(jarFile):
                os.makedirs(self.driverDir, exist_ok=True)
                jarServerFile = f'asset/{jarFileName}'
                self.s3.download_file(self.utilClass.bucket_name, jarServerFile, jarFile)

        # TODO:: 지금은 모든 Jar파일을 한번에 추가시켜야함. 추후에 한개씩만 할 수 있도록 수정
        # self.JDBC_Driver = os.path.join(self.driverDir, self.dbInfo['driver']['jar'])
        # if not os.path.exists(self.JDBC_Driver):
        #     os.makedirs(self.driverDir, exist_ok=True)
        #
        #     jarFileName = self.dbInfo['driver']['jar']
        #     jarFilePath = os.path.join(self.driverDir, jarFileName)
        #     jarServerFile = f"asset/{jarFileName}"
        #     self.s3.download_file(self.utilClass.bucket_name, jarServerFile, jarFilePath)

        # # 데이터베이스 연결
        self.conn = None
        self.cursor = None
        self.columnNames = None
        # self.conn, self.cur = self.connect(self.host, self.userId, self.password, self.databaseName, self.port, self.driver, self.charset)

    def connect(self):
        driverClass = self.driver['class']
        type = self.driver['type']
        databaseName = self.driver.get('databaseParam', '/') + self.databaseName

        # if self.dbType == 'mysql':
        #     databaseName += '?useSSL=false'

        # 데이터베이스 연결
        # jdbc:driverType:host:port/database
        # zeroDateTimeBehavior = convertToNull
        url = f"{type}{self.host}:{self.port}{databaseName}"
        args = {
            'user': self.userId,
            'password': self.password,
            'userSSL': 'false',
            'zeroDateTimeBehavior': 'convertToNull',
            'connectTimeout': str(1000 * 15),
            # 'socketTimeout': str(1000 * 10)
        }

        self.conn = jp.connect(driverClass, url, args, jars=self.JDBC_Driver)
        self.cursor = self.conn.cursor()

    def verify(self):
        try:
            # 데이터베이스 연결 테스트
            self.connect()

            # 테이블명 가져오기
            self.columnNames, self.columnTypes = self.getColumnInfo(self.tableName)
            columnInfo = [{'columnName': row[0], 'type': row[1]} for row in zip(self.columnNames, self.columnTypes)]
            return True, columnInfo, ''
        except Exception as e:
            # 에러 메시지
            return False, [], e.args

    def summary(self, startDate=None, endDate=None):
        data = self.getData(startDate, endDate, rowCount=120)
        _, self.columnTypes = self.getColumnInfo(self.tableName)
        return self.parseSummary(data, types=self.columnTypes), data

    def collect(self, startDate=None, endDate=None):
        return self.getData(startDate, endDate)

    def getData(self, startDate=None, endDate=None, rowCount=None):
        if self.conn is None:
            self.connect()

        if self.columnNames is None:
            self.columnNames, self.columnTypes = self.getColumnInfo(self.tableName)

        tableName = f'{self.tableName}'
        if self.dbType == 'mysql':
            tableName = f'`{self.tableName}`'

        # list => str 변환
        columnNamesStr = f'{tableName}.' + f', {tableName}.'.join(self.columnNames)

        # 테이블 데이터 가져오기
        sql = f"SELECT {columnNamesStr} FROM {tableName} "
        # result = pd_sql.read_sql(sql, self.conn, index_col=None)

        if rowCount:
            if self.dbType == 'mssql':
                selectIndex = 6
                sql = f"{sql[:selectIndex]} {self.dbInfo['limit']} {rowCount} {sql[selectIndex:]} "
            else:
                sql += f" {self.dbInfo['limit']} {rowCount}"

        self.cursor.execute(sql)
        rows = []
        while True:
            try:
                row = self.cursor.fetchone()
                if row is None:
                    break

                rows.append(row)
            except Exception as e:
                print(e)
                raise ValueError(f'테이블({self.tableName})에 이상 데이터가 존재합니다. 확인 후에 다시 시도해 주세요.')

        result = pd.DataFrame(rows, columns=self.columnNames)
        result = result.where(result.notnull(), '')

        # for colName, type in zip(self.columnNames, self.columnTypes):
        #     if type == 'number':
        #         result[colName] = pd.to_numeric(result[colName])
        #     elif type == 'datetime':
        #         result[colName] = pd.to_datetime(result[colName])

        return result

    def getColumnInfo(self, tableName):
        # 테이블 컬럼 정보 가져오기
        query = f"SELECT {', '.join(self.dbInfo['columnName'])} FROM {self.dbInfo['infoTable']} " \
                f"WHERE table_name='{tableName}' "

        if self.dbType == 'mysql':
            query += f"AND table_schema='{self.databaseName}'"

        self.cursor.execute(query)
        result = self.cursor.fetchall()

        # list[string] 변환
        columnNames = []
        columnTypes = []
        for row in result:
            columnNames.append(row[0].lower())
            columnTypes.append(self.convertType(row[1]))
        # columnInfo = [{'columnName': row[0].lower(), 'type': row[1].lower()} for row in result]

        if len(result) == 0:
            raise ValueError(f'해당 테이블({tableName}) 또는 태이블 내 데이터가 존재하지 않습니다.')

        return columnNames, columnTypes

    def convertType(self, columnType):
        # objectList = ['char', 'time', 'date']
        # numberList = ['int', 'long', 'float', 'double']
        # return 'object' if 'char' in columnType or 'timestamp' in columnType or 'date' in columnType else 'number'

        if 'char' in columnType or 'text' in columnType:
            return 'object'
        elif 'int' in columnType or 'long' in columnType or 'float' in columnType or 'double' in columnType:
            return 'number'
        elif 'time' in columnType or 'date' in columnType:
            return 'datetime'
        else:
            return 'object'


if __name__ == '__main__':
    p_connectionInfoList = [
        {
            "host": "dslaba.clickai.ai",
            "userId": "skyhub",
            "password": "Dd8qDhm2eP!",
            "database": "skyhub",
            "tableName": "models",
            "dbType": "mysql",
            'port': 3306
        },

        # MSSQL
        # {
        #     "host": "localhost",
        #     "userId": "test",
        #     "password": "123qwe",
        #     "database": "test",
        #     "tableName": "test",
        #     "dbType": "mssql"
        # },

        # # Oracle
        # {
        #     "host": "database-2.c9xg2lfhexes.ap-northeast-2.rds.amazonaws.com",
        #     "userId": "admin",
        #     "password": "eldptmfoq1!",
        #     "database": "DATABASE",
        #     # 'db': 'ADMIN',
        #     "tableName": "TEST",
        #     "dbType": "oracle"
        # },
        # {
        #     "host": "localhost",
        #     "userId": "admin",
        #     "password": "eldptmfoq1!",
        #     "database": "test",
        #     # 'db': 'ADMIN',
        #     "tableName": "test",
        #     "dbType": "mongo"
        # },
        # {
        #     "host": "localhost",
        #     "userId": "postgres",
        #     "password": "test",
        #     "database": "postgres",
        #     "tableName": "testtable",
        #     "dbType": "postgresql"
        # },
    ]

    for index, connectionInfo in enumerate(p_connectionInfoList):
        # _, m_column_names = JDBC.verify(db_info['host'], db_info['userId'], db_info['password'],
        #                                 db_info['database'], db_info['tableName'], db_type=db_info['type'])
        # print(f'[{db_info["type"]}] SUCCESS', m_column_names)

        jdbc = JDBC(connectionInfo)
        isVerify, columnInfo, msg = jdbc.verify()
        print(f"\nDB: {connectionInfo['dbType']}", isVerify, msg)
        if isVerify:
            [print(column) for column in columnInfo]

            summary, data = jdbc.summary()
            [print(s) for s in summary]

            result = jdbc.collect()
            print(result)

