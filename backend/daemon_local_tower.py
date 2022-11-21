from astoredaemon.daemon_local_tower import DaemonLocalTower
import sys
import traceback

import os

from models.helper import Helper
from src.util import Util
dbClass = Helper(init=True)
utilClass = Util()
from distutils.dir_util import copy_tree

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
    if len(sys.argv) > 2:
        daemonLocalTower = DaemonLocalTower(configOption=sys.argv[1], planOption=sys.argv[2])
    elif len(sys.argv) > 1:
        daemonLocalTower = DaemonLocalTower(configOption=sys.argv[1])
    else:
        daemonLocalTower = DaemonLocalTower()

    daemonLocalTower.create_xml()
