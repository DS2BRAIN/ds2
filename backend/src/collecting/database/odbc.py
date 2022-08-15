from src.collecting.connector import Connector
import pyodbc


class ODBC(Connector):
    def __init__(self):

        server = 'dslaba.clickai.ai'
        database = 'dbname'
        username = 'skyhub'
        password = 'Dd8qDhm2eP!'
        # cnxn = pyodbc.connect(
        #     'DRIVER={MySQL ODBC 3.51 Driver};SERVER=' + server + ';DATABASE=' + database + ';UID=' + username + ';PWD=' + password)

        # conn = pyodbc.connect(driver='{SQL Server}', host=f'localhost,1433', database='test', user='test', password='123qwe')
        conn = pyodbc.connect(driver='{MySQL ODBC 3.51 Driver}', host=f'localhost,1433', database='test', user='test',
                              password='123qwe')
        cursor = conn.cursor()

        cursor.execute("SELECT * from test;")
        rows = cursor.fetchall()

        for row in rows:
            print(row)


if __name__ == '__main__':
    ODBC()