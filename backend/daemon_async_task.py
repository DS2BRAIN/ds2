from script.daemon_async_task import DaemonAsyncTask
import traceback

import os

from models.helper import Helper
from src.util import Util
from distutils.dir_util import copy_tree
import shutil

dbClass = Helper(init=True)
utilClass = Util()
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
            # print(traceback.format_exc())
            pass

    if not os.path.exists('./asset/h.xml'):
        print("copy h.xml")
        try:
            if not os.path.exists(f"/opt/h.xml"):
                import urllib.request
                urllib.request.urlretrieve("https://aimakerdslab.s3.ap-northeast-2.amazonaws.com/asset/h.xml", "/opt/h.xml")
            shutil.copyfile(f"/opt/h.xml", f"{os.getcwd()}/asset/h.xml")
        except:
            # print(traceback.format_exc())
            pass

except:
    print(traceback.format_exc())
    pass

if __name__ == "__main__":

    DaemonAsyncTask(testMode=False).run()
