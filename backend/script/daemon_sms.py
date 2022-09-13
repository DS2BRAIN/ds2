import os
import random
import shlex
import shutil
import subprocess
import time
import traceback

import peewee
import redis
import json
from multiprocessing import Process
from tensorflow.python.client import device_lib

from models.helper import Helper
from src.util import Util
from models import skyhub


class DaemonSMS():

    def __init__(self):

        self.redis_conn = redis.Redis(charset="utf-8", decode_responses=True)

        self.gpu_wait_list = {
            "/device:GPU:all": [],
            # "/device:GPU:0" : [],
            # "/device:GPU:1" : [],
        }

        self.task_start_num = 0
        self.dbClass = Helper(init=True)
        self.utilClass = Util()

        for gpu_name in self.get_available_gpus():
            self.gpu_wait_list[gpu_name] = []

        os.makedirs(self.utilClass.save_path, exist_ok=True)

    def get_available_gpus(self):
        local_device_protos = device_lib.list_local_devices()
        return [x.name for x in local_device_protos if x.device_type == 'GPU']



    def sub(self, name: str):
        pubsub = self.redis_conn.pubsub()
        pubsub.subscribe("broadcast")
        for message in pubsub.listen():
            if message.get("type") == "message":

                data = json.loads(message.get("data"))
                data["task_start_num"] = self.task_start_num
                self.task_start_num += 1
                reqiure_gpus = data.get("reqiure_gpus", ["/device:GPU:all"]) # reqiure_gpus = [/device:GPU:0,/device:GPU:1,/device:GPU:2,/device:GPU:3]
                print("%s : %s" % (name, data))
                print(f"got {data.get('status')} task")
                if data.get("status") == 0 or data.get("status") == 21 or data.get("status") == 51:

                    is_started = self.is_gpu_available(reqiure_gpus)
                    data["is_started"] = is_started

                    is_working_on_this_server = True

                    if data["require_gpus_total"]:
                        is_working_on_this_server = False
                        for key, value in data["require_gpus_total"].items():
                            if key == "localhost":
                                is_working_on_this_server = True

                    if is_working_on_this_server:

                        for reqiure_gpu in reqiure_gpus:
                            if self.gpu_wait_list.get(reqiure_gpu):
                                self.gpu_wait_list[reqiure_gpu].append(data)
                            else:
                                self.gpu_wait_list[reqiure_gpu] = [data]

                    if data["is_started"] or data.get('jupyterProject'):
                        self.start_daemon(data, reqiure_gpus)

                elif data.get("status") == 100:
                    self.remove_from_wait_list(data, reqiure_gpus)
                    tasks = self.start_available_tasks()

                else:
                    self.remove_from_wait_list(data, reqiure_gpus)
                    tasks = self.start_available_tasks()



    def is_gpu_available(self, reqiure_gpus):

        is_available = True

        if reqiure_gpus:
            for reqiure_gpu in reqiure_gpus:
                if type(self.gpu_wait_list.get(reqiure_gpu)) == None \
                        or len(self.gpu_wait_list.get(reqiure_gpu)) != 0:
                    is_available = False
        else:
            is_available_more_than_one = False
            for key, value in self.gpu_wait_list.items():
                if key == "/device:GPU:all":
                    continue
                if len(value) == 0:
                    is_available_more_than_one = True
            is_available = is_available_more_than_one

        return is_available

    def start_daemon(self, data, reqiure_gpus):
        try:
            gpu = ','
            for reqiure_gpu in reqiure_gpus:
                if "/device:GPU:" in reqiure_gpu:
                    gpu += reqiure_gpu.split("/device:GPU:")[1] + ","

            gpu = gpu[1:]

            if "all" in gpu:
                gpu = None

            execute_path = os.getcwd() + "/"
            if os.path.exists("/root/ds2ai/aimaker-sms-deploy/"):
                execute_path = "/root/ds2ai/aimaker-sms-deploy/"

            python_path = "/root/miniconda3/envs/p3.9/bin/python"
            jupyter_path = "/root/miniconda3/envs/p3.9/bin/jupyter"

            my_env = os.environ.copy()

            if gpu:
                my_env["CUDA_VISIBLE_DEVICES"] = gpu
            else:
                my_env["CUDA_VISIBLE_DEVICES"] = "0"


            if os.path.exists("/var/lib/jenkins/anaconda3/envs/p3.9/bin/python"):
                python_path = "/var/lib/jenkins/anaconda3/envs/p3.9/bin/python"
                jupyter_path = "/home/dslab/.local/bin/jupyter"
                execute_path = "/var/lib/jenkins/projects/aistore-daemon/"
                my_env["DS2_DEV_TEST"] = "true"

            if "jupyterProject" in data:
                cmd = f"{jupyter_path} notebook --ip=0.0.0.0 --allow-root --notebook-dir=/opt --port {data.get('port')} --allow-root --NotebookApp.token='{data.get('appTokenCode')}'"
                jupyter_server = self.dbClass.getJupyterServerById(data['id'])
                jupyter_server.status = 100
                jupyter_server.save()

            else:
                my_env["DS2_DAEMON_TASK_MODE"] = "true"
                my_env["DS2_TASK_ID"] = str(data['id'])
                my_env["DS2_CONFIG_OPTION"] = "enterprise"

                cmd = f"{python_path} {execute_path}daemon_sms.py prod business enterprise {data['id']}"

                if data['require_gpus_total']: #Temp
                    try:
                        import horovod
                        training_server_total = 0
                        training_server_info = ""
                        print(data['require_gpus_total'])
                        if data['require_gpus_total']:
                            try:
                                for key, gpu_info in data['require_gpus_total'].items():
                                    training_server_total += 1
                                    training_server_info += f'"{key}":{len(gpu_info)}'
                            except:
                                training_server_total = 1
                                training_server_info = f"localhost:{len(data['require_gpus_total'])}"
                        if not training_server_total:
                            training_server_total = 1
                            training_server_info = f"localhost:{len(data['require_gpus_total'])}"

                        cmd = f'''/usr/lib/openmpi/bin/mpirun --allow-run-as-root -v -np {training_server_total} -H {training_server_info} -bind-to none -map-by slot --prefix /usr/lib/openmpi --mca pml ob1 --mca btl ^openib --mca btl_tcp_if_exclude "127.0.0.1/8,tun0,lo,docker0" --mca plm_rsh_args "-F /root/.ssh/config" -x NCCL_SOCKET_IFNAME=^lo,docker0 -x DS2_TASK_ID={data['id']} -x DS2_CONFIG_OPTION=enterprise -x DS2_DAEMON_TASK_MODE=true -x NCCL_DEBUG=INFO -x LD_LIBRARY_PATH -x PATH {python_path} {execute_path}daemon_sms.py prod business enterprise {data['id']}'''
                    except:
                        pass

            print(cmd)
            print(f"{self.utilClass.save_path}/{data.get('taskType', '')}_{data['id']}.out")
            print(f"{self.utilClass.save_path}/{data.get('taskType', '')}_{data['id']}.err")
            with open(f"{self.utilClass.save_path}/{data.get('taskType', '')}_{data['id']}.out", "wb") as out, open(f"{self.utilClass.save_path}/{data.get('taskType', '')}_{data['id']}.err", "wb") as err:
                subprocess.Popen(shlex.split(cmd), shell=False, cwd=execute_path, stdout=out, stderr=err, env=my_env)
            time.sleep(round(random.uniform(1, 15), 3))
        except:
            print(traceback.format_exc())
            pass

    def remove_from_wait_list(self, data, reqiure_gpus):

        if not reqiure_gpus:
            reqiure_gpus = ["/device:GPU:all"]

        for reqiure_gpu in reqiure_gpus:
            remove_task_num_list = []
            for gpu_wait_list_num, gpu_wait_task in enumerate(self.gpu_wait_list.get(reqiure_gpu, [])):
                if data['id'] == gpu_wait_task['id']:
                    remove_task_num_list.append(gpu_wait_list_num)
            for remove_task_num in remove_task_num_list:
                del self.gpu_wait_list[reqiure_gpu][remove_task_num]

    def start_available_tasks(self):
        # if not reqiure_gpus:
        #     reqiure_gpus = ["/device:GPU:all"]

        available_gpu_list = []
        for key, gpu_wait_tasks in self.gpu_wait_list.items():
            is_available_gpu = True
            for gpu_wait_task in gpu_wait_tasks:
                if gpu_wait_task.get("is_started") is True:
                    is_available_gpu = False
            if is_available_gpu:
                available_gpu_list.append(key)

            if key == "/device:GPU:all" and is_available_gpu is False:
                available_gpu_list = []
                break

        available_tasks = []
        for available_gpu in available_gpu_list:
            available_tasks += self.gpu_wait_list[available_gpu]

        available_tasks = sorted(available_tasks, key=lambda d: d['task_start_num'])

        for available_task in available_tasks:

            reqiure_gpus = available_task.get("reqiure_gpus", ["all"])

            is_available_task = True
            for reqiure_gpu in reqiure_gpus:
                if reqiure_gpu not in available_gpu_list:
                    is_available_task = False

            if reqiure_gpus == ["all"]:
                is_available_task = True
                available_gpu_list = []

            if is_available_task:
                for reqiure_gpu in reqiure_gpus:
                    try:
                        available_gpu_list.remove(reqiure_gpu)
                    except:
                        pass

                self.start_daemon(available_task, reqiure_gpus)

            if not available_gpu_list:
                break


if __name__ == "__main__":
    daemon_sms = DaemonSMS()
    Process(target=daemon_sms.sub, args=("reader1",)).start()
