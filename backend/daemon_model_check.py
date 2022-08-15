from astoretest.daemonCheckModel import DaemonCheckModel
import traceback

import typing
import zipfile
import os

from distutils.dir_util import copy_tree
from models.helper import Helper
from src.util import Util
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

    if not os.path.exists('./asset/object_detection_configs/Misc/'):
        print("copy object_detection_configs")
        try:
            copy_tree(f"/opt/object_detection_configs/", f"{os.getcwd()}/asset/object_detection_configs/")
        except:
            print(traceback.format_exc())
            pass

except:
    print(traceback.format_exc())
    pass

if __name__ == "__main__":
    DaemonCheckModel().run()
