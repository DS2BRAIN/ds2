import json
import time

from bson import json_util

from script.daemon_async_task import DaemonAsyncTask
from script.daemon_sms import DaemonSMS
import traceback

import os

from models.helper import Helper
from src.util import Util
from multiprocessing import Process
from distutils.dir_util import copy_tree
import shutil
from models import skyhub
from playhouse.migrate import MySQLMigrator, migrate
from asset.import_init_data import ImportInitData
import inspect
import models
import peewee as pw

print("lib import")
dbClass = Helper(init=True)
utilClass = Util()

print("class")
def db_sync():
    print("db_sync start")
    migrator = MySQLMigrator(skyhub)
    print("migrator start")
    create_column_list = []
    alter_column_list = []
    create_table_list = []

    for name, obj in inspect.getmembers(models):
        print("inspect start")
        if inspect.isclass(obj) and type(obj) == pw.ModelBase:
            print("ModelBase start")
            table_name = obj._meta.table_name
            if table_name not in ('model', 'mysqlmodel'):
                try:
                    schema_columns = skyhub.get_columns(table_name)
                    model_column_dict = obj._meta.columns
                    for key, value in model_column_dict.items():
                        is_exist = False
                        # is_diff_type = False
                        for schema_column in schema_columns:
                            if schema_column.name == key:
                                is_exist = True
                                break
                                # if schema_column.data_type != value.field_type.lower():
                                #     is_diff_type = True
                            elif schema_column.name.lower() == key.lower():
                                print("transaction start")
                                with skyhub.transaction():
                                    migrate(
                                        migrator.rename_column(table_name, schema_column.name, key),
                                    )
                                is_exist = True
                                alter_column_list.append({'table': table_name,
                                                          'before': schema_column.name,
                                                          'after': key})
                                break
                        if not is_exist:
                            value.null = True
                            with skyhub.transaction():
                                migrate(
                                    migrator.add_column(table_name, key, value),
                                )
                            create_column_list.append({'table': table_name, 'column': key, 'type': value.field_type})
                            continue
                        schema_columns.remove(schema_column)
                        # if is_diff_type:
                        #     alter_column_list.append(
                        #         {'column': key, 'model': value.field_type.lower(), 'schema': schema_column.data_type})
                except pw.ProgrammingError as e:
                    create_table_list.append(obj)
                except Exception as e:
                    print(e)
    print("transaction start")

    with skyhub.transaction():
        skyhub.create_tables(create_table_list)

    print('-------- created table list ---------')
    for obj in create_table_list:
        print(obj._meta.table_name)
    print('-------- added column list ---------')
    for column in create_column_list:
        print(column)
    print('-------- renamed column list ---------')
    for column in alter_column_list:
        print(column)

    ImportInitData().start()

try:
    db_sync()
except:
    pass

try:
    print("download")
    if not os.path.exists('./src/training/deepsort/model_data/mars-small128.pb'):
        print("copy deepsort")
        try:
            copy_tree(f"/opt/deepsort/", f"{os.getcwd()}/src/training/deepsort/")
        except:
            print(traceback.format_exc())
            pass

    if not os.path.exists('./asset/object_detection_configs/COCO-InstanceSegmentation/mask_rcnn_X_101_32x8d_FPN_3x.yaml'):
        print("copy object_detection_configs")
        try:
            copy_tree(f"{os.getcwd()}/../astore-rcnn/object_detection_configs/", f"{os.getcwd()}/asset/object_detection_configs/")
        except:
            print(traceback.format_exc())
            pass

    if not os.path.exists('./asset/h.xml'):
        print("copy h.xml")
        try:
            if not os.path.exists(f"/opt/h.xml"):
                import urllib.request
                urllib.request.urlretrieve("https://aimakerdslab.s3.ap-northeast-2.amazonaws.com/asset/h.xml", "/opt/h.xml")
            shutil.copyfile(f"/opt/h.xml", f"{os.getcwd()}/asset/h.xml")
        except:
            print(traceback.format_exc())
            pass

except:
    print(traceback.format_exc())
    pass

if __name__ == "__main__":
    daemon_sms = DaemonSMS()
    print("ready")

    if os.environ.get('DS2_DAEMON_TASK_MODE'):
        DaemonAsyncTask(testMode=False).run()
    else:
        Process(target=daemon_sms.sub, args=("reader1",)).start()
    time.sleep(3)
    if models.rd:
        print("rd ready")
        models.rd.publish("broadcast", json.dumps({
            "id": 0,
            "taskName": f'start SMS server',
            "taskNameEn": f'start SMS server',
            "taskType": "init",
            "status": 100
        }), default=json_util.default, ensure_ascii=False)
