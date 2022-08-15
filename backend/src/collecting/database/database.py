import os

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_200_OK

from src.collecting.connector import Connector

os.environ["NLS_LANG"] = ".AL32UTF8"


class Database(Connector):
    # 데이터베이스별 기본 정보
    database_type = {
        'mysql': {'port': 3306, 'driver': 'mysql+pymysql', 'info_table': 'INFORMATION_SCHEMA.columns'},  # pymysql
        'mssql': {'port': 1433, 'driver': 'mssql+pymssql', 'info_table': 'INFORMATION_SCHEMA.columns'},  # pymssql
        'oracle': {'port': 1521, 'driver': 'oracle+cx_oracle', 'info_table': 'USER_TAB_COLUMNS'},  # cx_Oracle
        # (별도로 Oracle Client 설치 필요) https://oracle.github.io/odpi/doc/installation.html
    }

    def __init__(self, host, user_id, password, database, port=None, db_type='mysql', charset='utf8'):
        super().__init__({})

        # 현재 구현된 데이터베이스 체크
        self.db_type = db_type.lower()
        if self.db_type not in self.database_type:
            raise ValueError(f"'{self.db_type}' is not support.")

        # 기본 변수 초기화
        self.db_info = self.database_type[db_type]
        self.port = self.db_info['port'] if port is None else port
        self.driver = self.db_info['driver']
        self.database = database

        # 데이터베이스 연결
        self.engine, self.session = self.connect(host, user_id, password, self.database,
                                                 self.port, self.driver, charset)

    @staticmethod
    def connect(host, user_id, password, database, port, driver, charset='utf8'):
        # 데이터베이스 연결
        engine = create_engine(
            # f'{driver}://{user_id}:{password}@{host}:{port}/{database}?charset={charset}',
            f'{driver}://{user_id}:{password}@{host}:{port}/{database}',
            # encoding=charset,
            echo=False,
            convert_unicode=True,
            # max_identifier_length=128
        )

        return engine, scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

    @classmethod
    def verify(cls, host, user_id, password, database, table_name, port=None, db_type='mysql'):
        try:
            # 데이터베이스 연결 테스트
            db = cls(host, user_id, password, database, port=port, db_type=db_type)

            # 테이블명 가져오기
            return db.get_column_names(table_name)
        except Exception as e:
            # 에러 메시지
            return HTTP_400_BAD_REQUEST, {
                "statusCode": 400,
                "error": "Bad Request",
                "message": e.args
            }

    def collect(self, table_name, column_names=None):
        if column_names is None:
            response_status, column_names = self.get_column_names(table_name)
            if response_status != 200:
                return response_status, column_names

        # list => str 변환
        column_names_str = table_name + '.' + f', {table_name}.'.join(column_names)

        try:
            # 테이블 데이터 가져오기
            result = self.engine.execute(f'SELECT {column_names_str} FROM {table_name}')

            # list[dictionary] 변환
            data = [dict(row) for row in result]
            return HTTP_200_OK, data
        except Exception as e:
            return HTTP_400_BAD_REQUEST, {
                "statusCode": 400,
                "error": "Bad Request",
                "message": e.args
            }

    def get_column_names(self, table_name):
        # 테이블 컬럼 정보 가져오기
        query = f"SELECT column_name FROM {self.db_info['info_table']} " \
                f"WHERE table_name='{table_name}' "

        if self.db_type == 'mysql':
            query += f"AND table_schema='{self.database}'"

        result = self.engine.execute(query)

        # list[string] 변환
        column_names = [row['column_name'] for row in result]

        if len(column_names) == 0:
            return HTTP_400_BAD_REQUEST, {
                "statusCode": 400,
                "error": "Bad Request",
                "message": f'해당 테이블({table_name})이 존재하지 않습니다.'
            }

        return HTTP_200_OK, column_names


if __name__ == '__main__':
    p_db_info_list = [
        # {
        #     "host": "dslaba.clickai.ai",
        #     "user_id": "skyhub",
        #     "password": "Dd8qDhm2eP!",
        #     "database": "skyhub",
        #     "table_name": "servers",
        #     "type": "mysql"
        # },
        # {
        #     "host": "database-1.c9xg2lfhexes.ap-northeast-2.rds.amazonaws.com",
        #     "user_id": "admin",
        #     "password": "eldptmfoq1!",
        #     "database": "admin",
        #     "table_name": "test",
        #     "type": "mssql"
        # },
        # {
        #     "host": "localhost",
        #     "user_id": "test",
        #     "password": "123qwe",
        #     "database": "test",
        #     "table_name": "test",
        #     "type": "mssql"
        # },
        {
            "host": "database-2.c9xg2lfhexes.ap-northeast-2.rds.amazonaws.com",
            "user_id": "admin",
            "password": "eldptmfoq1!",
            "database": "DATABASE",
            # 'db': 'ADMIN',
            "table_name": "TEST",
            "type": "oracle"
        },
    ]

    for index, db_info in enumerate(p_db_info_list):
        _, m_column_names = Database.verify(db_info['host'], db_info['user_id'], db_info['password'],
                                               db_info['database'], db_info['table_name'], db_type=db_info['type'])
        print(f'[{db_info["type"]}] SUCCESS', m_column_names)

        db = Database(db_info['host'], db_info['user_id'], db_info['password'], db_info['database'], db_type=db_info['type'])
        _, result = db.collect(db_info['table_name'], m_column_names)

        for r in result:
            print(r)
