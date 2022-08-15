from pandas import DataFrame
from src.util import Util
import numpy as np


class Connector:
    def __init__(self, dictionary: dict):
        pass

    def verify(cls, *args, **kwargs):
        """
        Connector 연결 검증
        :return: (boolean, [dict], str): 연결여부, 컬럼정보, 에러 메시지
        """
        pass

    def summary(self, *args, **kwargs):
        """
        데이터 요약 정보
        :return: ([dict], DataFrame)
        """
        pass

    def parseSummary(self, datas: DataFrame, types: list = None):
        """
        데이터 요약 정보 추출
        :return: [dict]
        """
        if types:
            if len(datas.columns) != len(types):
                raise ValueError('데이터 컬럼과 타입의 크기가 다릅니다.')

        # index, length, miss, unique, type, min, max, std, mean, top, freq, use
        columnInfos = []
        for index, column in enumerate(datas.columns):
            data = datas[column]
            columnInfo = self.defaultSummary
            columnInfo.update(Util().parseColumData(data, 0))
            columnInfo['columnName'] = column
            columnInfo["index"] = str(index + 1)
            columnInfo["std"] = None if not columnInfo["std"] or np.isnan(columnInfo["std"]) else columnInfo["std"]
            columnInfo["top"] = None if not columnInfo["top"] or columnInfo["top"] == 'nan' else columnInfo["top"]
            columnInfo["miss"] = None if np.isnan(columnInfo["miss"]) else int(columnInfo["miss"])
            columnInfo["freq"] = None if not columnInfo["freq"] or np.isnan(columnInfo["freq"]) else int(columnInfo["freq"])

            if types:
                columnInfo['type'] = types[index]

            columnInfos.append(columnInfo)

        return columnInfos
        # return HTTP_200_OK, csvParse().getColumnData(datas) # 이걸 써더됨

    def collect(self, startDate=None, endDate=None, *args, **kwargs):
        """
        데이터 전체 정보

        :param startDate: str, ex) 2020-01-01
        :param endDate: str, ex) 2020-01-01

        :return: DataFrame

        """
        pass

    @property
    def defaultSummary(self):
        return {
            "columnName": '',
            "index": '',
            "length": None,
            "miss": None,
            "unique": None,
            "type": None,
            "min": None,
            "max": None,
            "std": None,
            "mean": None,
            "top": None,
            "freq": None,
        }


if __name__ == '__main__':
    import numpy as np
    import datetime
    from datetime import timedelta


    columns = ['나이', '직업', '혼인여부', '연봉', '연락방법']

    types = [int, str, bool, float, str, datetime]

    rowCount = 1000
    dataCount = rowCount * len(columns)
    data = np.arange(dataCount).reshape((-1, len(columns)))

    dateAt = [datetime.datetime.now() - timedelta(days=row) for row in range(rowCount)]
    columns.append('입사일')
    data = np.hstack((data, np.reshape(dateAt, (rowCount, -1))))
    data = DataFrame(data, columns=columns)
    print(data)
    data.ix[10, '나이'] = np.nan
    Connector().summary(data, types)