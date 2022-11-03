import ast
import asyncio
import json
import os
import shutil
import subprocess
import time
import datetime
import traceback
import numpy as np
from uuid import uuid4

import pandas as pd
from bson import json_util
from pydantic import BaseModel

from random import *

from playhouse.shortcuts import model_to_dict
from src.collecting.connectorHandler import ConnectorHandler
from src.util import Util
from src.checkDataset import CheckDataset
from src.managePayment import ManagePayment
from models.helper import Helper
from src.errors import exceptions as ex
from starlette.status import HTTP_200_OK, HTTP_204_NO_CONTENT
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from src.errorResponseList import ErrorResponseList, NOT_FOUND_USER_ERROR, GET_MODEL_ERROR, SEARCH_PROJECT_ERROR, \
    WRONG_ACCESS_ERROR, NOT_ALLOWED_TOKEN_ERROR, TOO_MANY_ERROR_PROJECT, \
    EXCEED_PROJECT_ERROR, ALREADY_DELETED_OBJECT
import urllib
from models import rd

errorResponseList = ErrorResponseList()

#TODO: 숫자 헤더면 바꿔줘야됨

class ProjectInfo(BaseModel):
    projectName: str = None
    description: str = None
    priority: bool = None
    valueForPredict: str = None
    option: str = None
    csvupload: int = None
    fileStructure: str = None
    filePath: str = None
    status: int = None
    statusText: str = None
    originalFileName: str = None
    trainingMethod: str = None
    fileSize: int = None
    joinInfo: dict = None
    preprocessingInfo: dict = None
    preprocessingInfoValue: dict = None
    trainingColumnInfo: dict = None
    timeSeriesColumnInfo: dict = None
    valueForPredictColumnId: int = None
    valueForItemColumnId: int = None
    valueForUserColumnId: int = None
    analyticsStandard: str = None
    startTimeSeriesDatetime: str = None
    endTimeSeriesDatetime: str = None
    webhookURL: str = None
    webhookMethod: str = None
    isStart: bool = None
    isParameterCompressed: bool = None
    background: str = None
    resultJson: str = None
    algorithm: str = None
    hyper_params: dict = None

class ManageProject:

    def __init__(self):
        self.dbClass = Helper(init=True)
        self.utilClass = Util()
        self.paymentClass = ManagePayment()
        self.s3 = self.utilClass.getBotoClient('s3')
        self.hyper_params_init = {
  "keras_ann": {
    "label": "ANN-Keras",
    "method": "clf/reg",
    "parameter": {
      "layer_width": {
        "inputType": "numb",
        "min": 1,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          10
        ]
      },
      "layer_deep": {
        "inputType": "numb",
        "min": 1,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          3
        ]
      },
      "epochs": {
        "inputType": "numb",
        "min": 1,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          10
        ]
      },
      "loss_function": {
        "inputType": "option",
        "value": "mean_squared_error",
        "options": [
          "mean_squared_error",
          "mean_absolute_error",
          "mean_absolute_percentage_error",
          "mean_squared_logarithmic_error",
          "squared_hinge",
          "hinge",
          "categorical_hinge",
          "logcosh",
          "categorical_crossentropy",
          "sparse_categorical_crossentropy",
          "binary_crossentropy",
          "kullback_leibler_divergence",
          "poisson",
          "Adamax"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "mean_squared_error"
        ]
      },
      "optimizer": {
        "inputType": "option",
        "value": "Adam",
        "options": [
          "Adam",
          "SGD",
          "RMSprop",
          "Adagrad",
          "Adadelta",
          "AdamX",
          "Nadam"
        ],
        "dataType": "dict",
        "dataTypeOptions": [
          "dict"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "subParameter": {
          "Adam": {
            "label": "Adam",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.001
                ]
              },
              "beta_1": {
                "inputType": "numb",
                "min": 0,
                "max": 1,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "between": True,
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9
                ]
              },
              "beta_2": {
                "inputType": "numb",
                "min": 0,
                "max": 1,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "between": True,
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9999
                ]
              },
              "epsilon": {
                "inputType": "numb",
                "value": "None",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float",
                  "None"
                ],
                "method": "clf/reg",
                "subValue": "None",
                "checked": False,
                "disabled": False
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              },
              "amsgrad": {
                "inputType": "option",
                "value": "false",
                "options": [
                  "false",
                  "true"
                ],
                "dataType": "bool",
                "dataTypeOptions": [
                  "bool"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  "false"
                ]
              }
            }
          },
          "SGD": {
            "label": "SGD",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.01
                ]
              },
              "momentum": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              }
            }
          },
          "SGD_nesterov_momentum": {
            "label": "SGD-Nesterov Momentum",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.01
                ]
              },
              "momentum": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              }
            }
          },
          "RMSprop": {
            "label": "RMSprop",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.001
                ]
              },
              "rho": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9
                ]
              },
              "epsilon": {
                "inputType": "numb",
                "value": "None",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float",
                  "None"
                ],
                "method": "clf/reg",
                "subValue": "None",
                "checked": False,
                "disabled": False
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              }
            }
          },
          "Adagrad": {
            "label": "Adagrad",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.01
                ]
              },
              "epsilon": {
                "inputType": "numb",
                "value": "None",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float",
                  "None"
                ],
                "method": "clf/reg",
                "subValue": "None",
                "checked": False,
                "disabled": False
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              }
            }
          },
          "Adadelta": {
            "label": "Adadelta",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  1
                ]
              },
              "epsilon": {
                "inputType": "numb",
                "value": "None",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float",
                  "None"
                ],
                "method": "clf/reg",
                "subValue": "None",
                "checked": False,
                "disabled": False
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              }
            }
          },
          "AdamX": {
            "label": "AdamX",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.002
                ]
              },
              "beta_1": {
                "inputType": "numb",
                "min": 0,
                "max": 1,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "between": True,
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9
                ]
              },
              "beta_2": {
                "inputType": "numb",
                "min": 0,
                "max": 1,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "between": True,
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9999
                ]
              },
              "epsilon": {
                "inputType": "numb",
                "value": "None",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float",
                  "None"
                ],
                "method": "clf/reg",
                "subValue": "None",
                "checked": False,
                "disabled": False
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              }
            }
          },
          "Nadam": {
            "label": "Nadam",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.002
                ]
              },
              "beta_1": {
                "inputType": "numb",
                "min": 0,
                "max": 1,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "between": True,
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9
                ]
              },
              "beta_2": {
                "inputType": "numb",
                "min": 0,
                "max": 1,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "between": True,
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9999
                ]
              },
              "epsilon": {
                "inputType": "numb",
                "value": "None",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float",
                  "None"
                ],
                "method": "clf/reg",
                "subValue": "None",
                "checked": False,
                "disabled": False
              },
              "schedule_decay": {
                "inputType": "numb",
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.004
                ]
              }
            }
          }
        }
      },
      "activation": {
        "inputType": "option",
        "value": "relu",
        "options": [
          "relu",
          "softmax",
          "selu",
          "elu",
          "softplus",
          "softsign",
          "tanh",
          "sigmoid",
          "hard_sigmoid",
          "exponential",
          "linear"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "relu"
        ]
      },
      "batch_size": {
        "inputType": "numb",
        "min": 1,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          32
        ]
      },
      "output_activation": {
        "inputType": "option",
        "value": "relu",
        "options": [
          "relu",
          "softmax",
          "selu",
          "elu",
          "softplus",
          "softsign",
          "tanh",
          "sigmoid",
          "hard_sigmoid",
          "exponential",
          "linear"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "relu"
        ]
      }
    }
  },
  "torch_ann": {
    "label": "ANN-Pytorch",
    "method": "clf/reg",
    "parameter": {
      "layer_width": {
        "inputType": "numb",
        "min": 1,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          10
        ]
      },
      "layer_deep": {
        "inputType": "numb",
        "min": 1,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          3
        ]
      },
      "epochs": {
        "inputType": "numb",
        "min": 1,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          10
        ]
      },
      "loss_function": {
        "inputType": "option",
        "value": "MSELoss",
        "options": [
          "MSELoss",
          "BCELoss",
          "L1Loss",
          "NLLLoss",
          "BCEWithLogitsLoss",
          "CosineEmbeddingLoss",
          "CrossEntropyLoss",
          "CTCLoss",
          "GaussianNLLLoss",
          "HingeEmbeddingLoss",
          "HuberLoss",
          "KLDivLoss",
          "MarginRankingLoss",
          "MultiLabelMarginLoss",
          "MultiLabelSoftMarginLoss",
          "NLLLoss2d",
          "PoissonNLLLoss",
          "SmoothL1Loss",
          "TripletMarginLoss",
          "TripletMarginWithDistanceLoss",
          "PairwiseDistance"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "MSELoss"
        ]
      },
      "optimizer": {
        "inputType": "option",
        "value": "Adam",
        "options": [
          "Adam",
          "SGD",
          "RMSprop",
          "Adagrad",
          "Adadelta",
          "AdamX",
          "Nadam"
        ],
        "dataType": "dict",
        "dataTypeOptions": [
          "dict"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "subParameter": {
          "Adam": {
            "label": "Adam",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.001
                ]
              },
              "beta_1": {
                "inputType": "numb",
                "min": 0,
                "max": 1,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "between": True,
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9
                ]
              },
              "beta_2": {
                "inputType": "numb",
                "min": 0,
                "max": 1,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "between": True,
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9999
                ]
              },
              "epsilon": {
                "inputType": "numb",
                "value": "None",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float",
                  "None"
                ],
                "method": "clf/reg",
                "subValue": "None",
                "checked": False,
                "disabled": False
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              },
              "amsgrad": {
                "inputType": "option",
                "value": "false",
                "options": [
                  "false",
                  "true"
                ],
                "dataType": "bool",
                "dataTypeOptions": [
                  "bool"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  "false"
                ]
              }
            }
          },
          "SGD": {
            "label": "SGD",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.01
                ]
              },
              "momentum": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              }
            }
          },
          "SGD_nesterov_momentum": {
            "label": "SGD-Nesterov Momentum",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.01
                ]
              },
              "momentum": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              }
            }
          },
          "RMSprop": {
            "label": "RMSprop",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.001
                ]
              },
              "rho": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9
                ]
              },
              "epsilon": {
                "inputType": "numb",
                "value": "None",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float",
                  "None"
                ],
                "method": "clf/reg",
                "subValue": "None",
                "checked": False,
                "disabled": False
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              }
            }
          },
          "Adagrad": {
            "label": "Adagrad",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.01
                ]
              },
              "epsilon": {
                "inputType": "numb",
                "value": "None",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float",
                  "None"
                ],
                "method": "clf/reg",
                "subValue": "None",
                "checked": False,
                "disabled": False
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              }
            }
          },
          "Adadelta": {
            "label": "Adadelta",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  1
                ]
              },
              "epsilon": {
                "inputType": "numb",
                "value": "None",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float",
                  "None"
                ],
                "method": "clf/reg",
                "subValue": "None",
                "checked": False,
                "disabled": False
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              }
            }
          },
          "AdamX": {
            "label": "AdamX",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.002
                ]
              },
              "beta_1": {
                "inputType": "numb",
                "min": 0,
                "max": 1,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "between": True,
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9
                ]
              },
              "beta_2": {
                "inputType": "numb",
                "min": 0,
                "max": 1,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "between": True,
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9999
                ]
              },
              "epsilon": {
                "inputType": "numb",
                "value": "None",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float",
                  "None"
                ],
                "method": "clf/reg",
                "subValue": "None",
                "checked": False,
                "disabled": False
              },
              "decay": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0
                ]
              }
            }
          },
          "Nadam": {
            "label": "Nadam",
            "method": "clf/reg",
            "parameter": {
              "clipvalue": {
                "inputType": "numb",
                "min": -0.5,
                "max": 0.5,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.5
                ]
              },
              "learning_rate": {
                "inputType": "numb",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.002
                ]
              },
              "beta_1": {
                "inputType": "numb",
                "min": 0,
                "max": 1,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "between": True,
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9
                ]
              },
              "beta_2": {
                "inputType": "numb",
                "min": 0,
                "max": 1,
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "between": True,
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.9999
                ]
              },
              "epsilon": {
                "inputType": "numb",
                "value": "None",
                "min": 0,
                "dataType": "float",
                "dataTypeOptions": [
                  "float",
                  "None"
                ],
                "method": "clf/reg",
                "subValue": "None",
                "checked": False,
                "disabled": False
              },
              "schedule_decay": {
                "inputType": "numb",
                "dataType": "float",
                "dataTypeOptions": [
                  "float"
                ],
                "method": "clf/reg",
                "checked": False,
                "disabled": False,
                "valueArr": [
                  0.004
                ]
              }
            }
          }
        }
      },
      "activation": {
        "inputType": "option",
        "value": "relu",
        "options": [
          "relu",
          "RReLU",
          "Hardtanh",
          "ReLU6",
          "sigmoid",
          "hard_sigmoid",
          "tanh",
          "SiLU",
          "Mish",
          "Hardswish",
          "elu",
          "CELU",
          "selu",
          "GELU",
          "Hardshrink",
          "LeakyReLU",
          "LogSigmoid",
          "Softplus",
          "Softshrink",
          "MultiheadAttention",
          "PReLU",
          "Tanhshrink",
          "Softmin",
          "Softmax",
          "Softmax2d",
          "LogSoftmax"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "relu"
        ]
      },
      "batch_size": {
        "inputType": "numb",
        "min": 1,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          32
        ]
      },
      "output_activation": {
        "inputType": "option",
        "value": "relu",
        "options": [
          "relu",
          "RReLU",
          "Hardtanh",
          "ReLU6",
          "sigmoid",
          "hard_sigmoid",
          "tanh",
          "SiLU",
          "Mish",
          "Hardswish",
          "elu",
          "CELU",
          "selu",
          "GELU",
          "Hardshrink",
          "LeakyReLU",
          "LogSigmoid",
          "Softplus",
          "Softshrink",
          "MultiheadAttention",
          "PReLU",
          "Tanhshrink",
          "Softmin",
          "Softmax",
          "Softmax2d",
          "LogSoftmax"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "relu"
        ]
      }
    }
  },
  "fastai_ann": {
    "label": "ANN-FastAI",
    "method": "clf/reg",
    "parameter": {
      "layer_width": {
        "inputType": "numb",
        "min": 1,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          200
        ]
      },
      "layer_deep": {
        "inputType": "numb",
        "min": 1,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          2
        ]
      },
      "ps": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "between": True,
        "dataType": "float",
        "dataTypeOptions": [
          "float",
          "None"
        ],
        "method": "clf/reg",
        "subValue": "None",
        "subDomainCondition": {
          "action": "count",
          "value": "layer_deep",
          "text": "The setting value of layer_deep and the number of parameter values must be the same.",
          "isMatched": True
        },
        "checked": False,
        "disabled": False
      },
      "embed_p": {
        "inputType": "numb",
        "min": 0,
        "max": 1,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "y_range": {
        "inputType": "numb",
        "value": "None",
        "dataType": "float",
        "dataTypeOptions": [
          "float",
          "range",
          "None"
        ],
        "method": "clf/reg",
        "subValue": "None",
        "subCondition": {
          "param": "y_block",
          "value": [
            "regression"
          ],
          "isMatched": True
        },
        "range": {
          "split": 0
        },
        "checked": False,
        "disabled": False
      },
      "opt_func": {
        "inputType": "option",
        "value": "Adam",
        "options": [
          "Adam",
          "sgd_step",
          "weight_decay",
          "l2_reg",
          "average_grad",
          "average_sqr_grad",
          "momentum_step",
          "SGD",
          "rms_prop_step",
          "RMSprop",
          "step_stat",
          "debias",
          "adam_step",
          "radam_step",
          "RAdam",
          "qhadam_step",
          "larc_layer_lr",
          "larc_step",
          "lamb_step",
          "Lookahead",
          "ranger",
          "detuplify_pg",
          "set_item_pg",
          "pytorch_hp_map",
          "OptimWrapper"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "Adam"
        ]
      },
      "loss_func": {
        "inputType": "option",
        "value": "CrossEntropyLossFlat",
        "options": [
          "CrossEntropyLossFlat",
          "FocalLossFlat",
          "BCEWithLogitsLossFlat",
          "MSELossFlat",
          "L1LossFlat",
          "BCELossFlat",
          "LabelSmoothingCrossEntropy",
          "LabelSmoothingCrossEntropyFlat",
          "DiceLoss"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "CrossEntropyLossFlat"
        ]
      },
      "loss_func_reduction": {
        "inputType": "option",
        "value": "mean",
        "options": [
          "mean",
          "null",
          "sum"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "mean"
        ]
      },
      "loss_func_gamma": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "subCondition": {
          "param": "loss_func",
          "value": [
            "FocalLossFlat"
          ],
          "isMatched": True
        },
        "checked": False,
        "disabled": False,
        "valueArr": [
          2
        ]
      },
      "loss_func_floatify": {
        "inputType": "option",
        "value": "true",
        "options": [
          "true",
          "false"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "subCondition": {
          "param": "loss_func",
          "value": [
            "BCEWithLogitsLossFlat",
            "BCELossFlat",
            "MSELossFlat",
            "L1LossFlat"
          ],
          "isMatched": True
        },
        "checked": False,
        "disabled": False,
        "valueArr": [
          "true"
        ]
      },
      "lr": {
        "inputType": "numb",
        "min": 0,
        "max": 1,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0.001
        ]
      },
      "train_bn": {
        "inputType": "option",
        "value": "true",
        "options": [
          "true",
          "false"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "true"
        ]
      },
      "moms": {
        "inputType": "numb",
        "value": "",
        "valueArr": [
          0.95,
          0.35,
          0.95
        ],
        "min": 0,
        "max": 1,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "subDomainCondition": {
          "action": "count",
          "value": 3,
          "text": "3 parameter values are required.",
          "isMatched": True
        },
        "subText": "The order of the values may affect the results.",
        "checked": False,
        "disabled": False
      },
      "use_bn": {
        "inputType": "option",
        "value": "true",
        "options": [
          "true",
          "false"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "true"
        ]
      },
      "bn_final": {
        "inputType": "option",
        "value": "false",
        "options": [
          "false",
          "true"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "false"
        ]
      },
      "bn_cont": {
        "inputType": "option",
        "value": "true",
        "options": [
          "true",
          "false"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "true"
        ]
      },
      "act_cls": {
        "inputType": "option",
        "value": "ReLU",
        "options": [
          "ReLU",
          "RReLU",
          "Hardtanh",
          "ReLU6",
          "SiLU",
          "Mish",
          "Hardswish",
          "CELU",
          "GELU",
          "Hardshrink",
          "LeakyReLU",
          "LogSigmoid",
          "Softplus",
          "Softshrink",
          "MultiheadAttention",
          "PReLU",
          "Tanhshrink",
          "Softmin",
          "Softmax",
          "Softmax2d",
          "LogSoftmax",
          "Sigmoid",
          "Hardsigmoid",
          "Tanh",
          "ELU",
          "SELU",
          "GLU",
          "exact"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "ReLU"
        ]
      },
      "epochs": {
        "inputType": "numb",
        "min": 1,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          50
        ]
      },
      "y_block": {
        "inputType": "option",
        "value": "category",
        "options": [
          "category",
          "regression",
          "multicategory"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "category"
        ]
      }
    }
  },
  "xgboost": {
    "label": "XGBoost",
    "method": "clf/reg",
    "parameter": {
      "booster": {
        "inputType": "option",
        "value": "gbtree",
        "options": [
          "gbtree",
          "gblinear"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "gbtree"
        ]
      },
      "colsample_bylevel": {
        "inputType": "numb",
        "min": 0,
        "max": 1,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          1
        ]
      },
      "max_depth": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          6
        ]
      },
      "gamma": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "learning_rate": {
        "inputType": "numb",
        "min": 0.1,
        "max": 1,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0.1
        ]
      },
      "max_delta_step": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "min_child_weight": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          1
        ]
      },
      "n_estimators": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          100
        ]
      },
      "random_state": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          2
        ]
      },
      "objective": {
        "inputType": "option",
        "value": {
          "clf": "binary:logistic",
          "reg": "reg:squarederror"
        },
        "options": {
          "clf": [
            "binary:logistic",
            "multi:softmax",
            "multi:softprob"
          ],
          "reg": [
            "reg:squarederror",
            "reg:linear"
          ]
        },
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": {
          "clf": [
            "binary:logistic"
          ],
          "reg": [
            "reg:squarederror"
          ]
        }
      },
      "subsample": {
        "inputType": "numb",
        "min": 0,
        "max": 1,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          1
        ]
      },
      "sampling_method": {
        "inputType": "option",
        "value": "uniform",
        "options": [
          "uniform",
          "gradient_based"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "subCondition": {
          "param": "tree_method",
          "value": [
            "gpu_hist"
          ],
          "isMatched": True
        },
        "checked": False,
        "disabled": False,
        "valueArr": [
          "uniform"
        ]
      },
      "max_leaves": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "subCondition": {
          "param": "tree_method",
          "value": [
            "exact"
          ],
          "isMatched": False
        },
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "max_bin": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "subCondition": {
          "param": "tree_method",
          "value": [
            "hist",
            "approx",
            "gpu_hist"
          ],
          "isMatched": True
        },
        "checked": False,
        "disabled": False,
        "valueArr": [
          256
        ]
      },
      "colsample_bytree": {
        "inputType": "numb",
        "min": 0,
        "max": 1,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          1
        ]
      },
      "colsample_bynode": {
        "inputType": "numb",
        "min": 0,
        "max": 1,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          1
        ]
      },
      "reg_lambda": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "defaultValCondition": {
          "param": "booster",
          "value": {
            "gbtree": 0,
            "another": 1
          }
        },
        "checked": False,
        "disabled": False,
        "valueArr": [
          1
        ]
      },
      "reg_alpha": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "scale_pos_weight": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          1
        ]
      },
      "eval_metric": {
        "inputType": "option",
        "value": "rmse",
        "options": [
          "rmse",
          "mae",
          "logloss",
          "error",
          "merror",
          "mlogloss",
          "auc",
          "map"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "rmse"
        ]
      },
      "feature_selector": {
        "inputType": "option",
        "value": "cyclic",
        "options": [
          "cyclic",
          "shuffle",
          "random",
          "greedy",
          "thrifty"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "subCondition": {
          "param": "booster",
          "value": [
            "gblinear"
          ],
          "isMatched": True
        },
        "checked": False,
        "disabled": False,
        "valueArr": [
          "cyclic"
        ]
      },
      "tree_method": {
        "inputType": "option",
        "value": "auto",
        "options": [
          "auto",
          "exact",
          "approx",
          "hist",
          "gpu_hist"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "auto"
        ]
      },
      "refresh_leaf": {
        "inputType": "option",
        "value": "true",
        "options": [
          "true",
          "false"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "true"
        ]
      },
      "process_type": {
        "inputType": "option",
        "value": "default",
        "options": [
          "default",
          "update"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "default"
        ]
      },
      "grow_policy": {
        "inputType": "option",
        "value": "depthwise",
        "options": [
          "depthwise",
          "lossguide"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "subCondition": {
          "param": "tree_method",
          "value": [
            "hist",
            "approx",
            "gpu_hist"
          ],
          "isMatched": True
        },
        "checked": False,
        "disabled": False,
        "valueArr": [
          "depthwise"
        ]
      },
      "single_precision_histogram": {
        "inputType": "option",
        "value": "true",
        "options": [
          "true",
          "false"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "subCondition": {
          "param": "tree_method",
          "value": [
            "hist",
            "approx",
            "gpu_hist"
          ],
          "isMatched": True
        },
        "checked": False,
        "disabled": False,
        "valueArr": [
          "true"
        ]
      },
      "top_k": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "subCondition": {
          "param": "feature_selector",
          "value": [
            "greedy",
            "thrifty"
          ],
          "isMatched": True
        },
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      }
    }
  },
  "random_forest": {
    "label": "RandomForest",
    "method": "clf/reg",
    "parameter": {
      "n_estimators": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          100
        ]
      },
      "criterion": {
        "inputType": "option",
        "value": {
          "clf": "gini",
          "reg": "mse"
        },
        "options": {
          "clf": [
            "gini",
            "entropy"
          ],
          "reg": [
            "mse",
            "mae"
          ]
        },
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": {
          "clf": [
            "gini"
          ],
          "reg": [
            "mse"
          ]
        }
      },
      "max_depth": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int",
          "None"
        ],
        "method": "clf/reg",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "min_samples_split": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          2
        ]
      },
      "min_samples_leaf": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          1
        ]
      },
      "min_weight_fraction_leaf": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "max_features": {
        "inputType": "option",
        "value": "auto",
        "options": [
          "auto",
          "sqrt",
          "log2"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "auto"
        ]
      },
      "max_leaf_nodes": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int",
          "None"
        ],
        "method": "clf/reg",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "min_impurity_decrease": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "bootstrap": {
        "inputType": "option",
        "value": "true",
        "options": [
          "true",
          "false"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "true"
        ]
      },
      "oob_score": {
        "inputType": "option",
        "value": "false",
        "options": [
          "false",
          "true"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "false"
        ]
      },
      "n_jobs": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int",
          "None"
        ],
        "method": "clf/reg",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "random_state": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int",
          "None"
        ],
        "method": "clf/reg",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "verbose": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "warm_start": {
        "inputType": "option",
        "value": "false",
        "options": [
          "false",
          "true"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "false"
        ]
      },
      "class_weight": {
        "inputType": "option",
        "value": "None",
        "options": [
          "balanced",
          "balanced_subsample"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str",
          "None"
        ],
        "method": "clf",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "ccp_alpha": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "max_samples": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float",
          "None"
        ],
        "method": "clf/reg",
        "subValue": "None",
        "checked": False,
        "disabled": False
      }
    }
  },
  "gaussian_nb": {
    "label": "GaussianNB",
    "method": "clf",
    "parameter": {
      "priors": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float",
          "None"
        ],
        "method": "clf",
        "subValue": "None",
        "subDomainCondition": {
          "action": "sum",
          "value": "1",
          "text": "Except for None, the sum of the values must be 1.",
          "isMatched": True
        },
        "checked": False,
        "disabled": False
      },
      "var_smoothing": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf",
        "checked": False,
        "disabled": False,
        "valueArr": [
          1e-9
        ]
      }
    }
  },
  "isolation_forest": {
    "label": "IsolationForest",
    "method": "clf",
    "parameter": {
      "n_estimators": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf",
        "checked": False,
        "disabled": False,
        "valueArr": [
          100
        ]
      },
      "max_samples": {
        "inputType": "numb",
        "value": "auto",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float",
          "str"
        ],
        "method": "clf",
        "subValue": "auto",
        "checked": False,
        "disabled": False
      },
      "contamination": {
        "inputType": "numb",
        "value": "auto",
        "min": 0,
        "max": 0.5,
        "dataType": "float",
        "dataTypeOptions": [
          "float",
          "str"
        ],
        "method": "clf",
        "subValue": "auto",
        "checked": False,
        "disabled": False
      },
      "max_features": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf",
        "checked": False,
        "disabled": False,
        "valueArr": [
          1
        ]
      },
      "bootstrap": {
        "inputType": "option",
        "value": "false",
        "options": [
          "false",
          "true"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "false"
        ]
      },
      "n_jobs": {
        "inputType": "numb",
        "value": "None",
        "min": -1,
        "dataType": "int",
        "dataTypeOptions": [
          "int",
          "None"
        ],
        "method": "clf",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "random_state": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int",
          "None"
        ],
        "method": "clf",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "verbose": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "warm_start": {
        "inputType": "option",
        "value": "false",
        "options": [
          "false",
          "true"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "false"
        ]
      }
    }
  },
  "gradient_boosting": {
    "label": "GradientBoosting",
    "method": "clf/reg",
    "parameter": {
      "loss": {
        "inputType": "option",
        "value": {
          "clf": "deviance",
          "reg": "ls"
        },
        "options": {
          "clf": [
            "deviance",
            "exponential"
          ],
          "reg": [
            "ls",
            "lad",
            "huber",
            "quantile"
          ]
        },
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": {
          "clf": [
            "deviance"
          ],
          "reg": [
            "ls"
          ]
        }
      },
      "learning_rate": {
        "inputType": "numb",
        "min": 0.1,
        "max": 1,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0.1
        ]
      },
      "n_estimators": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          100
        ]
      },
      "subsample": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          1
        ]
      },
      "criterion": {
        "inputType": "option",
        "value": {
          "clf": "friedman_mse",
          "reg": "friedman_mse"
        },
        "options": {
          "clf": [
            "friedman_mse",
            "squared_error",
            "rmse",
            "mae"
          ],
          "reg": [
            "friedman_mse",
            "rmse",
            "mae"
          ]
        },
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": {
          "clf": [
            "friedman_mse"
          ],
          "reg": [
            "friedman_mse"
          ]
        }
      },
      "min_samples_split": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          2
        ]
      },
      "min_samples_leaf": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          1
        ]
      },
      "min_weight_fraction_leaf": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "max_depth": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          3
        ]
      },
      "min_impurity_decrease": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "min_impurity_split": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float",
          "None"
        ],
        "method": "clf/reg",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "random_state": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int",
          "None"
        ],
        "method": "clf/reg",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "max_features": {
        "inputType": "option",
        "value": "None",
        "options": [
          "auto",
          "sqrt",
          "log2"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str",
          "None"
        ],
        "method": "clf/reg",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "alpha": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0.9
        ]
      },
      "verbose": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "max_leaf_nodes": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int",
          "None"
        ],
        "method": "clf/reg",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "warm_start": {
        "inputType": "option",
        "value": "false",
        "options": [
          "false",
          "true"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "false"
        ]
      },
      "validation_fraction": {
        "inputType": "numb",
        "min": 0,
        "max": 1,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0.1
        ]
      },
      "n_iter_no_change": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int",
          "None"
        ],
        "method": "clf/reg",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "tol": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0.0001
        ]
      },
      "ccp_alpha": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      }
    }
  },
  "sgd": {
    "label": "SGD",
    "method": "clf/reg",
    "parameter": {
      "loss": {
        "inputType": "option",
        "value": {
          "clf": "hinge",
          "reg": "squared_loss"
        },
        "options": {
          "clf": [
            "hinge",
            "log",
            "modified_huber",
            "squared_hinge",
            "perceptron"
          ],
          "reg": [
            "squared_loss",
            "huber",
            "epsilon_insensitive",
            "squared_epsilon_insensitive"
          ]
        },
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": {
          "clf": [
            "hinge"
          ],
          "reg": [
            "squared_loss"
          ]
        }
      },
      "penalty": {
        "inputType": "option",
        "value": "l2",
        "options": [
          "l2",
          "l1",
          "elasticnet"
        ],
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "l2"
        ]
      },
      "alpha": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0.0001
        ]
      },
      "l1_ratio": {
        "inputType": "numb",
        "min": 0,
        "max": 1,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0.15
        ]
      },
      "fit_intercept": {
        "inputType": "option",
        "value": "true",
        "options": [
          "true",
          "false"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "true"
        ]
      },
      "max_iter": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          1000
        ]
      },
      "tol": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0.001
        ]
      },
      "shuffle": {
        "inputType": "option",
        "value": "true",
        "options": [
          "true",
          "false"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "true"
        ]
      },
      "verbose": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0
        ]
      },
      "epsilon": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0.1
        ]
      },
      "n_jobs": {
        "inputType": "numb",
        "value": "None",
        "min": -1,
        "dataType": "int",
        "dataTypeOptions": [
          "int",
          "None"
        ],
        "method": "clf",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "random_state": {
        "inputType": "numb",
        "value": "None",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int",
          "None"
        ],
        "method": "clf/rseg",
        "subValue": "None",
        "checked": False,
        "disabled": False
      },
      "learning_rate": {
        "inputType": "option",
        "value": {
          "clf": "optimal",
          "reg": "invscaling"
        },
        "options": {
          "clf": [
            "optimal",
            "invscaling",
            "constant",
            "adaptive"
          ],
          "reg": [
            "invscaling",
            "optimal",
            "constant",
            "adaptive"
          ]
        },
        "dataType": "str",
        "dataTypeOptions": [
          "str"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": {
          "clf": [
            "optimal"
          ],
          "reg": [
            "invscaling"
          ]
        }
      },
      "eta0": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": {
          "clf": [
            0
          ],
          "reg": [
            0.01
          ]
        }
      },
      "power_t": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0.5
        ]
      },
      "early_stopping": {
        "inputType": "option",
        "value": "false",
        "options": [
          "false",
          "true"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "false"
        ]
      },
      "validation_fraction": {
        "inputType": "numb",
        "min": 0,
        "dataType": "float",
        "dataTypeOptions": [
          "float"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          0.1
        ]
      },
      "n_iter_no_change": {
        "inputType": "numb",
        "min": 0,
        "dataType": "int",
        "dataTypeOptions": [
          "int"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          5
        ]
      },
      "warm_start": {
        "inputType": "option",
        "value": "false",
        "options": [
          "false",
          "true"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "false"
        ]
      },
      "average": {
        "inputType": "option",
        "value": "false",
        "options": [
          "false",
          "true"
        ],
        "dataType": "bool",
        "dataTypeOptions": [
          "bool"
        ],
        "method": "clf/reg",
        "checked": False,
        "disabled": False,
        "valueArr": [
          "false"
        ]
      }
    }
  }
}



    def getProjectsById(self, token, sorting, page, count, tab, desc, searching, is_verify=False):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageProject.py \n함수 : getProjectsById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        sharedProjectsAsAdmin = []
        for temp in self.dbClass.getGroupsByUserIdAndRoles(user['id'], 'admin'):
            if temp.projectsid:
                sharedProjectsAsAdmin = list(set(sharedProjectsAsAdmin + ast.literal_eval(temp.projectsid)))
        sharedProjectsAsMember = []
        for temp in self.dbClass.getGroupsByUserIdAndRoles(user['id'], 'member'):
            if temp.projectsid:
                sharedProjectsAsMember = list(set(sharedProjectsAsMember + ast.literal_eval(temp.projectsid)))
        projects, totalLength = self.dbClass.getAllProjectByUserId(user['id'], sharedProjectsAsAdmin + sharedProjectsAsMember, sorting, tab, desc,
                                                                   searching, page, count, is_verify)

        result_projects = []
        for project in projects:
            project = model_to_dict(project)
            project['role'] = 'member' if project['id'] in sharedProjectsAsMember else 'admin'
            result_projects.append(project)

        priority = self.dbClass.getProjectsPriorityByUserId(user['id'])

        instanceInfo = [model_to_dict(x) for x in self.dbClass.getInstanceUsersByUserId(user['id'])]

        result = {'projects' : result_projects, 'totalLength' : totalLength, 'priority' : priority, 'instanceInfo':instanceInfo}

        return HTTP_200_OK, result

    def startTrain(self, token, startTrainInfo, projectId):

        project = self.dbClass.getOneProjectById(projectId)

        dataconector = project['dataconnectorsList'][0]
        valueForPredictColumnId = None

        trainingColumnInfo = startTrainInfo.trainingColumnInfo
        if not startTrainInfo.trainingColumnInfo:
            trainingColumnInfo = {}

        datacolumns = self.dbClass.getDatacolumnsByDataconnectorId(dataconector)
        for datacolumn in datacolumns:
            if datacolumn.columnName == startTrainInfo.valueForPredict:
                valueForPredictColumnId = datacolumn.id
                if not startTrainInfo.trainingColumnInfo:
                    trainingColumnInfo[datacolumn.id] = False
            else:
                if not startTrainInfo.trainingColumnInfo:
                    trainingColumnInfo[datacolumn.id] = True

        hyper_params = startTrainInfo.hyper_params
        if startTrainInfo.hyper_params and startTrainInfo.algorithm:
            for key, value in self.hyper_params_init[startTrainInfo.algorithm]["parameter"].items():
                if key not in startTrainInfo.hyper_params:
                    hyper_params[key] = value

        projectInfo = ProjectInfo(
            valueForPredictColumnId=valueForPredictColumnId,
            trainingColumnInfo=trainingColumnInfo,
            trainingMethod=startTrainInfo.trainingMethod,
            statusText="1: The training is started.",
            status=1,
            option=startTrainInfo.option,
            joinInfo=startTrainInfo.joinInfo,
            preprocessingInfo=startTrainInfo.preprocessingInfo,
            preprocessingInfoValue=startTrainInfo.preprocessingInfoValue,
            hyper_params=startTrainInfo.hyper_params,
            algorithm=startTrainInfo.algorithm,
        )
        return self.putProject(token, projectInfo, projectId)

    def getProjectCaegories(self):
        projectCategories = []
        for projectCategoryRaw in self.dbClass.getProjectCategories():

            projectCategory = projectCategoryRaw.__dict__['__data__']

            projects = []
            for projectRaw in self.dbClass.getProjectsByCategoryId(projectCategory["id"]):
                projects.append(projectRaw.__dict__['__data__'])

            projectCategory["projects"] = projects
            projectCategories.append(projectCategory)

        return HTTP_200_OK, projectCategories

    def getTemplatesByTemplates(self):

        templates = []
        for template in self.dbClass.getTemplatesByTemplates():
            try:
                template.projectcategory = self.dbClass.getProjectcategoryById(template.projectcategory) if template.projectcategory else None
            except:
                template.projectcategory = None
                pass
            templates.append(template.__dict__['__data__'])

        return HTTP_200_OK, templates

    def getTemplatesByTemplateCategoryName(self, templateCategoryName):

        templates = []
        for template in self.dbClass.getTemplatesByTemplateCategoryName(templateCategoryName):
            template.projectcategory = self.dbClass.getProjectcategoryById(template.projectcategory)
            templates.append(template.__dict__['__data__'])

        return HTTP_200_OK, templates

    def deleteProject(self, token, projectId):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        project = self.dbClass.getOneProjectById(projectId, raw=True)

        if project.user != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : deleteProject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        project.isDeleted = True
        project.status = 0
        project.save()
        if self.utilClass.configOption == 'enterprise':
            try:
                shutil.rmtree(f"{self.utilClass.save_path}/{project.id}")
            except:
                pass

        # TODO: 프로젝트의 모든 모델 컬렉션 삭제
        for model in self.dbClass.getModelsByProjectId(project.id):
            # collection_name = f"model_{model.id}_collection"
            view_name = f"model_{model.id}_table"
            try:
                # self.dbClass.delete_collection_by_name(collection_name)
                self.dbClass.delete_collection_by_name(view_name)
            except:
                self.utilClass.sendSlackMessage(
                    f"파일 : manageProject\n "
                    f"함수 : deleteProject\n"
                    f"{view_name} Collection 삭제 중 에러가 발생하였습니다.)",
                    appError=True, userInfo=user)

        self.utilClass.sendSlackMessage(
            f"프로젝트를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {project.projectName} (ID: {project.id})",
            appLog=True, userInfo=user)

        return HTTP_204_NO_CONTENT, {}

    def deleteProjects(self, token, projectIdList):

        failList = []
        successList = []

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : deleteProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        for projectId in projectIdList:
            try:
                project = self.dbClass.getOneProjectById(projectId, raw=True)

                if project.user != user['id']:
                    self.utilClass.sendSlackMessage(
                        f"파일 : manageUser\n 함수 : deleteProject \n허용되지 않은 토큰 값입니다. token = {token})",
                        appError=True, userInfo=user)
                    return NOT_ALLOWED_TOKEN_ERROR

                project.isDeleted = True
                project.status = 0
                project.save()
                if self.utilClass.configOption == 'enterprise':
                    try:
                        shutil.rmtree(f"{self.utilClass.save_path}/{project.id}")
                    except:
                        pass

                self.utilClass.sendSlackMessage(
                    f"프로젝트를 삭제하였습니다. {user['email']} (ID: {user['id']}) , {project.projectName} (ID: {project.id})",
                    appLog=True, userInfo=user)
                successList.append(projectId)
            except:
                failList.append(projectId)
                self.utilClass.sendSlackMessage(
                    f"프로젝트 삭제 중 실패하였습니다. {user['email']} (ID: {user['id']}) , {project.projectName} (ID: {project.id})",
                    appLog=True, userInfo=user)

        return HTTP_200_OK, {'successList': successList, 'failList': failList}

    def check_xgboost_hyper_parameter(self, column, value_list):
        for value in value_list:
            if column == 'booster' and value not in ['gbtree', 'gblinear']:
                raise ex.WrongHyperParameterEx(column)
            elif column == 'objective' and value not in ['binary:logistic', 'reg:linear', 'reg:squarederror']:
                raise ex.WrongHyperParameterEx(column)
            elif column == 'learning_rate' and not (type(value) in [float, int] and 0.1 <= value <= 1.0):
                raise ex.WrongHyperParameterEx(column)
            elif (column in ['gamma', 'min_child_weight', 'scale_pos_weight', 'reg_alpha', 'reg_lambda']) \
                    and not (type(value) in [float, int] and value >= 0):
                raise ex.WrongHyperParameterEx(column)
            elif (column in ['max_depth', 'max_delta_step', 'max_leaves', 'max_bin', 'n_estimators', 'random_state', 'top_k'])\
                    and not (type(value) == int and value >= 0):
                raise ex.WrongHyperParameterEx(column)
            elif (column == 'subsample') and not (type(value) in [float, int] and 0 <= value <= 1):
                raise ex.WrongHyperParameterEx(column)
            elif column == 'sampling_method' and value not in ['uniform', 'gradient_based']:
                raise ex.WrongHyperParameterEx(column)
            elif (column in ['colsample_bylevel', 'colsample_bytree', 'colsample_bynode']) \
                    and not (type(value) in [float, int] and 0 <= value <= 1):
                raise ex.WrongHyperParameterEx(column)
            elif column == 'tree_method' and value not in ['auto', 'exact', 'approx', 'hist', 'gpu_hist']:
                raise ex.WrongHyperParameterEx(column)
            elif column == 'eval_metric' and value not in ['rmse', 'mae', 'logloss', 'error', 'merror', 'mlogloss', 'auc', 'map']:
                raise ex.WrongHyperParameterEx(column)
            elif column == 'feature_selector' and value not in ['cyclic', 'shuffle', 'random', 'greedy', 'thrifty']:
                raise ex.WrongHyperParameterEx(column)
            elif column in ['refresh_leaf', 'single_precision_histogram'] and type(value) != bool:
                raise ex.WrongHyperParameterEx(column)
            elif column == 'process_type' and value not in ['default', 'update']:
                raise ex.WrongHyperParameterEx(column)
            elif column == 'grow_policy' and value not in ['depthwise', 'lossguide']:
                raise ex.WrongHyperParameterEx(column)

    def check_random_forest_hyper_parameter(self, column, value_list):
        for value in value_list:
            if column in ['n_estimators', 'verbose'] and not (type(value) == int and value >= 0):
                raise ex.WrongHyperParameterEx(column)
            elif column == 'criterion' and value not in ['gini', 'entropy', 'mae', 'mse']:
                raise ex.WrongHyperParameterEx(column)
            elif column in ['max_depth', 'max_leaf_nodes', 'n_jobs', 'random_state']:
                if value is None:
                    continue
                elif not (type(value) == int and value >= 0):
                    raise ex.WrongHyperParameterEx(column)
            elif column in ['min_samples_split', 'min_samples_leaf', 'min_weight_fraction_leaf', 'min_impurity_decrease', 'ccp_alpha'] \
                    and not (type(value) in [float, int] and value >= 0):
                raise ex.WrongHyperParameterEx(column)
            elif column == 'max_samples':
                if value is None:
                    continue
                elif not (type(value) in [float, int] and value >= 0):
                    raise ex.WrongHyperParameterEx(column)
            elif column == 'max_features' and value not in ['auto', 'sqrt', 'log2']:
                raise ex.WrongHyperParameterEx(column)
            elif column in ['bootstrap', 'oob_score', 'warm_start'] and type(value) != bool:
                raise ex.WrongHyperParameterEx(column)
            elif column == 'class_weight' and value not in ['balanced', 'balanced_subsample', None]:
                raise ex.WrongHyperParameterEx(column)

    def check_gaussian_nb_hyper_parameter(self, column, value_list):
        for value in value_list:
            if column == 'var_smoothing' and not (type(value) in [float, int] and value >= 0):
                raise ex.WrongHyperParameterEx(column)
            elif column == 'priors':
                if value is None:
                    continue
                elif sum(value) != 1:
                    raise ex.WrongHyperParameterEx(column)

    def check_isolation_forest_hyper_parameter(self, column, value_list):
        for value in value_list:
            if column in ['n_estimators', 'verbose'] and not (type(value) == int and value >= 0):
                raise ex.WrongHyperParameterEx(column)
            elif column == 'max_samples':
                if (type(value) == str and value == 'auto') or (type(value) in [float, int] and value >= 0):
                    continue
                else:
                    raise ex.WrongHyperParameterEx(column)
            elif column == 'contamination':
                if (type(value) == str and value == 'auto') or (type(value) in [float, int] and (0 <= value <= 0.5)):
                    continue
                else:
                    raise ex.WrongHyperParameterEx(column)
            elif column == 'max_feature' and not (type(value) in [float, int] and value >= 0):
                raise ex.WrongHyperParameterEx(column)
            elif column in ['bootstrap', 'warm_start'] and type(value) != bool:
                raise ex.WrongHyperParameterEx(column)
            elif column == 'n_jobs':
                if (value is None) or (type(value) == int and value >= -1):
                    continue
                else:
                    raise ex.WrongHyperParameterEx(column)
            elif column == 'random_state':
                if (value is None) or (type(value) == int and value >= 0):
                    continue
                else:
                    raise ex.WrongHyperParameterEx(column)

    def check_gradient_boosting_hyper_parameter(self, column, value_list):
        for value in value_list:
            if column == 'loss' and value not in ['deviance', 'exponential', 'ls', 'lad', 'huber', 'quantile']:
                raise ex.WrongHyperParameterEx(column)
            elif (column == 'learning_rate') and not (type(value) in [float, int] and 0.1 <= value <= 1.0):
                raise ex.WrongHyperParameterEx(column)
            elif (column == 'validation_fraction') and not (type(value) in [float, int] and 0 <= value <= 1):
                raise ex.WrongHyperParameterEx(column)
            elif (column in ['n_estimators', 'max_depth', 'verbose']) and (type(value) != int or value < 0):
                raise ex.WrongHyperParameterEx(column)
            elif (column in ['subsample', 'min_weight_fraction_leaf', 'min_impurity_decrease', 'alpha', 'tol', 'ccp_alpha']) and not (type(value) in [float, int] and value >= 0):
                raise ex.WrongHyperParameterEx(column)
            elif column == 'criterion' and value not in ['friedman_mse', 'squared_error', 'rmse', 'mae']:
                raise ex.WrongHyperParameterEx(column)
            elif (column in ['min_samples_split', 'min_samples_leaf']) and not (type(value) in [float, int] and value >= 0):
                raise ex.WrongHyperParameterEx(column)
            elif column == 'min_impurity_split':
                if (value is None) or (type(value) in [float, int] and value >= 0):
                    continue
                else:
                    raise ex.WrongHyperParameterEx(column)
            elif column in ['random_state', 'max_leaf_nodes', 'n_iter_no_change']:
                if (value is None) or (type(value) == int and value >= 0):
                    continue
                else:
                    raise ex.WrongHyperParameterEx(column)
            elif column == 'max_features':
                if (value is None) or (value in ['auto', 'sqrt', 'log2']):
                    continue
                else:
                    raise ex.WrongHyperParameterEx(column)
            elif column == 'warm_start' and type(value) != bool:
                raise ex.WrongHyperParameterEx(column)

    def check_sgd_hyper_parameter(self, column, value_list):
        for value in value_list:
            if column == 'loss' and value not in ['hinge', 'log', 'modified_huber', 'squared_hinge', 'perceptron', 'squared_loss', 'huber', 'epsilon_insensitive', 'squared_epsilon_insensitive']:
                raise ex.WrongHyperParameterEx(column)
            elif column == 'penalty' and value not in ['l1', 'l2', 'elasticnet']:
                raise ex.WrongHyperParameterEx(column)
            elif (column in ['alpha', 'tol', 'epsilon', 'eta0', 'power_t', 'validation_fraction']) and not (type(value) in [float, int] and value >= 0):
                raise ex.WrongHyperParameterEx(column)
            elif (column == 'l1_ratio') and not (type(value) in [float, int] and 0 <= value <= 1):
                raise ex.WrongHyperParameterEx(column)
            elif column in ['fit_intercept', 'shuffle', 'early_stopping', 'warm_start', 'average'] and type(value) != bool:
                raise ex.WrongHyperParameterEx(column)
            elif (column in ['max_iter', 'verbose', 'n_iter_no_change']) and not (type(value) == int and value >= 0):
                raise ex.WrongHyperParameterEx(column)
            elif column == 'n_jobs':
                if (value is None) or (type(value) == int and value >= -1):
                    continue
                else:
                    raise ex.WrongHyperParameterEx(column)
            elif column == 'random_state':
                if (value is None) or (type(value) == int and value >= 0):
                    continue
                else:
                    raise ex.WrongHyperParameterEx(column)
            elif column == 'learning_rate' and value not in ['constant', 'optimal', 'invscaling', 'adaptive']:
                raise ex.WrongHyperParameterEx(column)

    def putProject(self, token, project_info_raw, projectId):
        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser.py \n함수 : putProject \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        project_info = {**project_info_raw.__dict__}
        preprocessing_info = project_info.get('preprocessingInfoValue')
        if preprocessing_info:
            for key, value in preprocessing_info.items():
                if value.get('deidentifying') is not None:
                    value['deidentifying'] = int(value['deidentifying'])

                if value.get('cleaningClassification') is not None:
                    value['cleaningClassification'] = int(value['cleaningClassification'])

                if int(value.get('deidentifying', 0)) < 0 or int(value.get('cleaningClassification', 0)) < 0:
                    raise ex.InvalidPreprocessingMethodEx(user['id'], value.get('deidentifying'), value.get('cleaningClassification'))

        project = self.dbClass.getOneProjectById(projectId)

        if project.get('user', 0) != user['id']:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : putProject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        project_info = {k: v for k, v in project_info.items() if v is not None}
        models_of_project = self.dbClass.getModelsByProjectId(projectId, isSimplified=True)

        if project_info.get('status') == 0:
            self.valid_project_stop_condition(models_of_project)
            if project.get('option') == 'custom':
                self.dbClass.delete_train_params_by_project_id(project['id'])
        else:
            require_gpus = project_info.get("require_gpus")
            require_gpus_total = project_info.get("require_gpus_total")
            if require_gpus:
                require_gpus = [gpu_dict.get('idx') for gpu_dict in require_gpus]
            task_type = 'train'
            if project.get('isVerify'):
                task_type = 'verify'
            elif project.get('option') == "labeling":
                task_type = 'labeling'

            try:
                async_task = self.getAsnycTaskByProjectId(projectId)
                async_task.taskName = project.get('projectName')
                async_task.taskNameEn = project.get('projectName')
                async_task.taskType = task_type
                async_task.project = project.get("id")
                async_task.status = 0
                async_task.user = user['id']
                async_task.require_gpus = require_gpus
                async_task.require_gpus_total = require_gpus_total
                async_task.outputFilePath = ''
                async_task.isChecked = 0
                async_task.save()
            except:
                async_task = self.dbClass.createAsyncTask({
                  'taskName': project.get('projectName'),
                  'taskNameEn': project.get('projectName'),
                  'taskType': task_type,
                  'project': project.get("id"),
                  'status': 0,
                  'user': user['id'],
                  'require_gpus': require_gpus,
                  'require_gpus_total': require_gpus_total,
                  'outputFilePath': '',
                  'isChecked': 0
                })

            if rd:
                rd.publish("broadcast", json.dumps(model_to_dict(async_task), default=json_util.default, ensure_ascii=False))

            if project_info.get('instanceType') or project.get('instanceType'):
                try:
                    from astoredaemon.daemon_control_tower import DaemonControlTower
                    DaemonControlTower().createInstanceWithPlanOption('business', 1, projectId=projectId, userId=user['id'], instanceType=project_info.get('instanceType'))
                except:
                    print(traceback.format_exc())
                    pass

        self.utilClass.sendSlackMessage(
            f"프로젝트를 상태가 변경되었습니다. {user['email']} (ID: {user['id']}) , {project['projectName']} (ID: {projectId})\n" +
            json.dumps(project_info, indent=4, ensure_ascii=False, default=str),
            appLog=True, userInfo=user)

        column_index = 0
        column_info = {}
        row_index_info = {}

        hyper_params = project_info.pop('hyper_params', None)
        for key in hyper_params.keys():
            column_info[column_index] = key
            row_index_info[column_index] = 0
            column_index += 1

        algorithm = project_info.get('algorithm', 'auto')
        if 'xgboost_reg' == algorithm and 'binary:logistic' in hyper_params['objective']:
            raise ex.WrongObjectiveParameterDetailEx("정형화 회귀", "structured classification", 'binary:logistic')
        elif 'xgboost_clf' == algorithm and 'reg:linear' in hyper_params['objective']:
            raise ex.WrongObjectiveParameterDetailEx("정형화 분류", "structured linear", 'reg:linear')
        project_info['algorithm'] = algorithm

        dict_list = []
        for k, v in hyper_params.items():
            if 'xgboost' in algorithm:
                self.check_xgboost_hyper_parameter(k, v)
            elif 'random_forest' in algorithm:
                self.check_random_forest_hyper_parameter(k, v)
            elif 'gaussian_nb' in algorithm:
                self.check_gaussian_nb_hyper_parameter(k, v)
            elif 'isolation_forest' in algorithm:
                self.check_isolation_forest_hyper_parameter(k, v)
            elif 'gradient_boosting' in algorithm:
                self.check_gradient_boosting_hyper_parameter(k, v)
            elif 'sgd' in algorithm:
                self.check_sgd_hyper_parameter(k, v)
            dict_list.append((k, pd.Series(v)))
        df = pd.DataFrame(dict(dict_list))
        hyper_param_result = []

        if algorithm and hyper_params:
            while True:
                temp = {}
                try:
                    for column_index, column_name in column_info.items():
                        temp_value = df[column_name][row_index_info[column_index]]
                        if column_name in ['layer_width', 'layer_deep', 'epochs', 'batch_size'] and not np.isnan(temp_value):
                            temp_value = int(temp_value)
                        if type(temp_value) not in [list, str, dict] and temp_value is not None and np.isnan(temp_value):
                            raise KeyError
                        temp[column_name] = temp_value

                    for key, item in temp.items():
                        if type(item) in [list, dict, str, int, float, bool] or item is None:
                            temp[key] = item
                        else:
                            temp[key] = item.item()
                    temp.update({'project': int(projectId), 'user': user['id'], 'is_original': False})
                    hyper_param_result.append(temp)
                    row_index_info[column_index] += 1

                    if len(hyper_param_result) >= 300:
                        raise ex.TooManyExistFileEx

                except KeyError:
                    if column_index - 1 < 0:
                        break

                    row_index_info[column_index - 1] += 1
                    for reset_column_index in column_info.keys():
                        if column_index <= reset_column_index:
                            row_index_info[reset_column_index] = 0
            hyper_params.update({'project': int(projectId), 'user': user['id'], 'is_original' : True})
            hyper_param_result.append(hyper_params)
            self.dbClass.create_train_params(hyper_param_result)

        colab_params = project_info.pop("models", None)
        if colab_params:
            for idx, model in enumerate(colab_params):
                colab_model = {
                    "name": f"Colab Model {idx}",
                    "description": f"",
                    "status": 0,
                    "statusText": "0: 모델 생성 준비중입니다.",
                    "progress": 0,
                    "project": projectId,
                    "epoch": model.get('epoch'),
                    "learningRateFromFit": model.get('learningRate'),
                    "layerDeep": model.get('layerDeep'),
                    "layerWidth": model.get('layerWidth'),
                    "dropOut": model.get('dropOut'),
                    "token": uuid4(),
                    "isParameterCompressed": True,
                    "objectDetectionModel": 24,
                }
                if model.get('algorithmType') and project_info['trainingMethod'] == "object_detection":
                    from src.creating.spliting import Spliting
                    for index, model_name in enumerate(Spliting().Split['objectDetectionModel']):
                        if model.get('algorithmType') in model_name:
                            colab_model['objectDetectionModel'] = index
                            break
                self.dbClass.createModel(colab_model)
            # project_info['status'] = 11

        self.dbClass.updateProject(projectId, project_info)
        project_info = self.dbClass.getOneProjectById(projectId)
        project_info['models'] = models_of_project

        return HTTP_200_OK, project_info

    def valid_project_stop_condition(self, models_of_project):

        not_trained_model_count = 0
        for model in models_of_project:
            if getattr(model, 'status', 1) == 0:
                not_trained_model_count += 1
        if len(models_of_project) > 0 and not_trained_model_count == 0:
            raise ex.InvalidStopProjectConditionEx()

    def get_project_status_by_id(self, token, project_id):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject.py \n함수 : getProjectById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        project = self.dbClass.getOneProjectById(project_id)

        if project['user'] != user['id']:
            sharedProjects = []
            for temp in self.dbClass.getSharedProjectIdByUserId(user['id']):
                if temp.projectsid:
                    sharedProjects = list(set(sharedProjects + ast.literal_eval(temp.projectsid)))

            if int(project_id) not in sharedProjects:
                raise ex.NotAllowedTokenEx(user['email'])

        result = {
            "projectId": project_id,
            "status": project['status'],
            "hasBestModel": True if project['hasBestModel'] else False
        }

        return HTTP_200_OK, result

    def getProjectById(self, token, projectId):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(f"파일 : manageProject.py \n함수 : getProjectById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                            appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        project = self.dbClass.getOneProjectById(projectId)

        if project['isDeleted']:
            return ALREADY_DELETED_OBJECT

        if project['user'] != user['id'] and project['isSample'] in [False, None]:
            sharedProjects = []
            for temp in self.dbClass.getSharedProjectIdByUserId(user['id']):
                if temp.projectsid:
                    sharedProjects = list(set(sharedProjects + ast.literal_eval(temp.projectsid)))

            if int(projectId) not in sharedProjects:
                raise ex.NotAllowedTokenEx(user['email'])

        models = []
        modelAnalyticsgrphsDict = self.dbClass.getAnalyticsGraphsGroupByModelsCountByProjectId(projectId)

        modelList = [x.__dict__['__data__'] for x in self.dbClass.getModelsByProjectId(projectId, isSimplified=True)]
        for model in modelList:
            if model['cm_statistics'] is None:
                model['cm_statistics'] = model.pop('cmStatistics', None)
            else:
                model.pop('cmStatistics', None)

            if project['trainingMethod'] == 'object_detection' and model.get('objectDetectionModel', None) and int(model['objectDetectionModel']) not in self.utilClass.objectDetectionModel:
                pass
            models.append(model)

        for model in modelList:
            if model['id'] in modelAnalyticsgrphsDict and modelAnalyticsgrphsDict[model['id']] > 0:
                model['analyticsgrphs'] = True
            else:
                model['analyticsgrphs'] = False

        project['models'] = models
        project['license'] = self.dbClass.getDataLicenseById(project['datasetlicense']) if project.get('datasetlicense') else None
        project['analyticsgraphs'] = [x.__dict__['__data__'] for x in self.dbClass.getAnalyticsGraphsByProjectId(projectId)]
        project['hyper_params'] = self.dbClass.get_hyper_params_by_project_id(projectId)

        dataconnectorsList = []
        if project['dataconnectorsList']:
            for dataconnectorId in project['dataconnectorsList']:
                dataconnector = self.dbClass.getOneDataconnectorById(dataconnectorId)
                dataconnector.dataconnectortype = self.dbClass.getOneDataconnectortypeById(dataconnector.dataconnectortype)

                if project['status'] == 0:
                    project['algorithm'] = None
                    if dataconnector.dataconnectortype.authType == 'db' and dataconnector.keyFileInfo:
                        connector = ConnectorHandler(method='JDBC', dictionary=dataconnector.keyFileInfo)

                        isVerify, columnInfos, message = connector.verify()
                        if not isVerify:
                            self.utilClass.sendSlackMessage(
                                f"파일 : manageProject.py \n함수 : getProjectById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                                appError=True, userInfo=user)
                            return NOT_FOUND_USER_ERROR

                        try:
                            summaries, sampleData = connector.summary()
                            existDatacolumns = self.dbClass.getDatacolumnsByDataconnectorId(dataconnector.id)
                            for existDatacolumn in existDatacolumns:
                                existDatacolumn.delete_instance()

                            for i, column in enumerate(summaries):
                                dataObject = {**column,
                                              # "index": str(i + 1),
                                              "dataconnector": dataconnector.id if dataconnector else None,
                                              }

                                self.dbClass.createDatacolumn(dataObject)

                            dataconnector.sampleData = sampleData

                        except Exception as e:
                            return errorResponseList.verifyError(e.args)
                # 업데이트한 정보 저장
                dataconnector.save()
                dataconnector = dataconnector.__dict__['__data__']
                del dataconnector['dbPassword']
                dataconnector['datacolumns'] = [x.__dict__['__data__'] for x in
                                                self.dbClass.getDatacolumnsByDataconnectorId(dataconnector['id'])]
                dataconnector['sampleData'] = json.loads(dataconnector['sampleData'].replace("NaN", "None")) if dataconnector['sampleData'] else None
                dataconnector['yClass'] = json.loads(dataconnector['yClass']) if dataconnector['yClass'] is not None else dataconnector['yClass']
                if dataconnector['datacolumns']:
                    for column in dataconnector['datacolumns']:
                        column['data_count'] = column.pop('length', 0)
                        if not column["uniqueValues"]:
                            continue
                        for uniqueValues in column["uniqueValues"]:
                            if uniqueValues != uniqueValues:
                                column["uniqueValues"][column["uniqueValues"].index(uniqueValues)] = None
                dataconnectorsList.append(dataconnector)

                project['dataconnectorsList'] = dataconnectorsList

        project['isShared'] = False
        if project['sharedgroup']:
            for temp in ast.literal_eval(project['sharedgroup']):
                groupMember = self.dbClass.getMemberByUserIdAndGroupId(user['id'], temp)
                if groupMember:
                    if groupMember.role == 'member' and groupMember.acceptcode == 1:
                        project['isShared'] = True

        if project['fileStructure'] is not None:
            project['fileStructure'] = project['fileStructure'].replace("length", "data_count")


        try:
            extract_usd, extract_krw = self.get_extract_amount(project)
        except:
            extract_usd, extract_krw = None, None

        project['extractUsd'] = extract_usd
        project['extractKrw'] = extract_krw

        require_dict_list = project.pop('require_gpus')
        if require_dict_list:
            project['available_gpu_list'] = [require_dict.get('name') for require_dict in require_dict_list]
        else:
            available_gpu_list = []
            for idx in range(len(self.utilClass.available_gpu_list)):
                available_gpu_list.append({
                    'idx': self.utilClass.available_gpu_list[idx],
                    'name': self.utilClass.available_gpu_name_list[idx]
                })
            project['available_gpu_list'] = available_gpu_list

        project['available_gpu_list_total'] = {
          "localhost": project['available_gpu_list']
        }
        training_sub_servers = self.dbClass.getTrainingSubServers()
        if training_sub_servers:
            for training_sub_server in training_sub_servers:
                project['available_gpu_list_total'][training_sub_server.name] = training_sub_server.gpu_info

        project['hasCustomTrainingServer'] = True if self.dbClass.getAliveJupyterServersByUserId(user['id']).count() else False

        if project['isShared']:
            return HTTP_200_OK, project
        elif project.get('user', 0) == user['id']:
            return HTTP_200_OK, project
        elif project.get('isSample'):
            return HTTP_200_OK, project
        else:
            return SEARCH_PROJECT_ERROR

    def getProjectAsyncById(self, token, projectId):
        user = self.dbClass.getUser(token)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject.py \n함수 : getProjectAsyncById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            raise NOT_FOUND_USER_ERROR

        project = self.dbClass.getOneProjectAsyncById(projectId).__dict__['__data__']

        if project['user'] != user['id']:
            sharedProjects = []
            for temp in self.dbClass.getSharedProjectIdByUserId(user['id']):
                if temp.projectsid:
                    sharedProjects = list(set(sharedProjects + ast.literal_eval(temp.projectsid)))

            if int(projectId) not in sharedProjects:
                raise ex.NotAllowedTokenEx(user['email'])

        models = [x.__dict__['__data__'] for x in self.dbClass.getModelsByProjectId(projectId)]
        project['models'] = models
        project['analyticsgraphs'] = [x.__dict__['__data__'] for x in self.dbClass.getAnalyticsGraphsByProjectId(projectId)]

        return HTTP_200_OK, project

    def getModelById(self, token, modelId):

        user = self.dbClass.getUser(token)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject.py \n함수 : getModelById \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        model = self.dbClass.getOneModelById(modelId)
        models = []
        for modelchart in self.dbClass.getModelchartsByModelId(modelId):
            models.append(modelchart.__dict__['__data__'])
        model['modelcharts'] = models

        project = self.dbClass.getOneProjectById(model['project'])

        if project['option'] == 'colab':
            for keyName in ['visionModel','lossFunction', 'usingBert', 'objectDetectionModel','filePath']:
                del model[keyName]
        else:
            for keyName in ['epoch', 'learningRateFromFit', 'layerDeep', 'layerWidth', 'dropOut', 'visionModel',
                            'lossFunction', 'usingBert', 'objectDetectionModel', 'filePath']:
                del model[keyName]

        isShared = False
        for group in self.dbClass.getGroupsByUserIdAndRoles(user['id']):
            if model['project'] and group.projectsid and model['project'] in ast.literal_eval(group.projectsid):
                    isShared = True
                    break

        model['analyticsgraphs'] = [x.__dict__['__data__'] for x in self.dbClass.getAnalyticsGraphsByModelId(modelId)]

        model['valueForPredict'] = project['valueForPredict']
        model['trainingMethod'] = project['trainingMethod']
        model['hasTextData'] = project['hasTextData']
        model['hasImageData'] = project['hasImageData']
        model['hasTimeSeriesData'] = project['hasTimeSeriesData']

        if model.get('ap_info'):
            for key, value in model['ap_info'].items():
                if value is not None and np.isnan(value):
                    model['ap_info'][key] = None
        if model.get("hyper_param_id"):
          hyper_param = self.dbClass.get_train_param_by_id(model['hyper_param_id'])
          model['hyper_param'] = hyper_param

        if isShared:
            return HTTP_200_OK, model
        elif project['user'] == user['id']:
            return HTTP_200_OK, model
        elif project.get('isSample'):
            return HTTP_200_OK, model
        else:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject\n 함수: getModelById \ngetModelById이 존재하지 않음 = 모델 : {modelId} token: {token})",
                appError=True,userInfo=user)
            return GET_MODEL_ERROR


    def getModelByIdAndModelToken(self, modeltoken, modelId):

        user = self.dbClass.getUserByModelTokenAndModelId(modeltoken, modelId)
        if not user:
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "앱 토큰을 잘 못 입력하였습니다."
            }

        model = self.dbClass.getOneModelById(modelId)
        models = []
        for modelchart in self.dbClass.getModelchartsByModelId(modelId):
            models.append(modelchart.__dict__['__data__'])
        model['modelcharts'] = models
        for keyName in ['epoch', 'learningRateFromFit', 'layerDeep', 'layerWidth', 'dropOut', 'visionModel',
                        'lossFunction', 'usingBert', 'objectDetectionModel','filePath']:
            del model[keyName]

        model['analyticsgraphs'] = [x.__dict__['__data__'] for x in self.dbClass.getAnalyticsGraphsByModelId(modelId)]

        projectRaw = self.dbClass.getOneProjectById(model['project'])
        project = {
            'projectName': projectRaw['projectName'],
            'trainingMethod': projectRaw['trainingMethod'],
            'detectedTrainingMethod': projectRaw['detectedTrainingMethod'],
            'description': projectRaw['description'],
            'hasTextData': projectRaw['hasTextData'],
            'hasImageData': projectRaw['hasImageData'],
            'hasTimeSeriesData': projectRaw['hasTimeSeriesData'],
            'valueForPredict': projectRaw['valueForPredict'],
            'background': projectRaw['background'],
            'resultJson': projectRaw['resultJson'],
            'user': projectRaw['user'],
            'fileStructure': projectRaw['fileStructure'],
        }
        project['analyticsgraphs'] = [x.__dict__['__data__'] for x in self.dbClass.getAnalyticsGraphsByProjectId(model['project'])]
        model['project'] = project
        model['user'] = {
            'company': user.company,
            'companyLogoUrl': user.companyLogoUrl
        }

        if projectRaw['user'] == user.id:
            return HTTP_200_OK, model
        elif projectRaw.get('isSample'):
            return HTTP_200_OK, model
        else:
            return WRONG_ACCESS_ERROR

    def getOpsModelByOpsIdAndModelToken(self, modeltoken, opsId):

        opsProject = self.dbClass.getOneOpsProjectById(opsId, raw=True)
        user = self.dbClass.getUserByModelTokenAndModelId(modeltoken, opsProject.model)
        if not user:
            return HTTP_503_SERVICE_UNAVAILABLE, {
                "statusCode": 503,
                "error": "Bad Request",
                "message": "앱 토큰을 잘 못 입력하였습니다."
            }
        modelId = opsProject.model
        model = self.dbClass.getOneModelById(modelId)
        models = []
        for modelchart in self.dbClass.getModelchartsByModelId(modelId):
            models.append(modelchart.__dict__['__data__'])
        model['modelcharts'] = models
        for keyName in ['epoch', 'learningRateFromFit', 'layerDeep', 'layerWidth', 'dropOut', 'visionModel',
                        'lossFunction', 'usingBert', 'objectDetectionModel','filePath']:
            del model[keyName]

        model['analyticsgraphs'] = [x.__dict__['__data__'] for x in self.dbClass.getAnalyticsGraphsByModelId(modelId)]

        projectRaw = self.dbClass.getOneProjectById(model['project'])
        project = {
            'projectName': projectRaw['projectName'],
            'trainingMethod': projectRaw['trainingMethod'],
            'detectedTrainingMethod': projectRaw['detectedTrainingMethod'],
            'description': projectRaw['description'],
            'hasTextData': projectRaw['hasTextData'],
            'hasImageData': projectRaw['hasImageData'],
            'hasTimeSeriesData': projectRaw['hasTimeSeriesData'],
            'valueForPredict': projectRaw['valueForPredict'],
            'background': projectRaw['background'],
            'resultJson': projectRaw['resultJson'],
            'user': projectRaw['user'],
            'fileStructure': projectRaw['fileStructure'],
        }
        project['analyticsgraphs'] = [x.__dict__['__data__'] for x in self.dbClass.getAnalyticsGraphsByProjectId(model['project'])]
        model['project'] = project
        model['user'] = {
            'company': user.company,
            'companyLogoUrl': user.companyLogoUrl
        }

        if projectRaw['user'] == user.id:
            return HTTP_200_OK, model
        elif projectRaw.get('isSample'):
            return HTTP_200_OK, model
        else:
            return WRONG_ACCESS_ERROR

    def fillAutomaticdata(self, projectId, token):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject.py \n함수 : getModelByIdAndAppToken \n잘못된 앱 토큰으로 에러 | 입력한 앱 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        projectRaw = self.dbClass.getOneProjectById(projectId)
        datacolumnIds = [x.id for x in self.dbClass.getDatacolumnsByDataconnectorId(projectRaw['dataconnectorsList'][0])]
        for x in datacolumnIds:
            if str(x) in projectRaw['timeSeriesColumnInfo'] and projectRaw['timeSeriesColumnInfo'][str(x)]:
                timeSeriesColumnName = self.dbClass.getOneDatacolumnById(x).columnName
                dataconnectorRaw = self.dbClass.getOneDataconnectorById(self.dbClass.getOneDatacolumnById(x).dataconnector)
                timeSeriesColumnName += f".__{dataconnectorRaw.dataconnectorName}"
                break

        sampleData = ast.literal_eval(dataconnectorRaw.sampleData)
        firstDate = datetime.datetime.strptime(sampleData[0][timeSeriesColumnName],'%Y-%m-%d')
        finalDate = datetime.datetime.strptime(sampleData[-1][timeSeriesColumnName],'%Y-%m-%d')
        periodDate = finalDate - firstDate
        if periodDate.days > 1:
            randomDate = finalDate + datetime.timedelta(days=randint(1, periodDate.days))
        elif (periodDate.seconds / 3600) > 1:
            randomDate = finalDate + datetime.timedelta(hours=int(periodDate.seconds/3600))
        elif (periodDate.seconds / 60) > 1:
            randomDate = finalDate + datetime.timedelta(minutes=int(periodDate.seconds/60))
        else:
            randomDate = finalDate + datetime.timedelta(seconds=int(periodDate.seconds))
        result = {'columnName': timeSeriesColumnName, 'Value': randomDate}

        return HTTP_200_OK, result

    def download_data_by_connector_id(self, token, project_id, connector_id):

        user = self.dbClass.getUser(token, True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject.py \n함수 : downloadProjectDataByToken \n잘못된 앱 토큰으로 에러 | 입력한 앱 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        projectRaw = self.dbClass.getOneProjectById(project_id, True)

        if projectRaw.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : putProject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        dataConnectorInfo = self.dbClass.getOneDataconnectorById(connector_id)
        s3URL = dataConnectorInfo.filePath

        return HTTP_200_OK, {'dataPath' : s3URL}

    async def get_project_status(self, token, project_id, request):
        user = self.dbClass.get_user_or_none_object(token)
        project = self.dbClass.getOneProjectById(project_id)
        project_status = project.get('status', 0)

        if user.get('id') is None:
            raise ex.NotFoundUserEx()
        if project.get('id') is None:
            raise ex.NormalEx()
        if project.get('user') != user.get('id'):
            raise ex.NotAllowedTokenEx()

        yield {
            "event": "new_message",
            "id": "message_id",
            "retry": 30000,
            "data": json.dumps({"status": project_status})
        }

        while True:
            if await request.is_disconnected():
                break

            new_project_status = getattr(self.dbClass.get_project_status_by_id(project_id), 'status', 0)

            if project_status != new_project_status:
                project_status = new_project_status

                yield {
                    "event": "new_message",
                    "id": "message_id",
                    "retry": 30000,
                    "data": json.dumps({"status": project_status})
                }

            # if project_status == 100:
            #     break

            await asyncio.sleep(3)


    def downloadProjectDataByToken(self, token, projectId):

        user = self.dbClass.getUser(token, True)
        projectRaw = self.dbClass.getOneProjectById(projectId, True)

        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageProject.py \n함수 : downloadProjectDataByToken \n잘못된 앱 토큰으로 에러 | 입력한 앱 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if projectRaw.user != user.id:
            self.utilClass.sendSlackMessage(
                f"파일 : manageUser\n 함수 : putProject \n허용되지 않은 토큰 값입니다. token = {token})",
                appError=True, userInfo=user)
            return NOT_ALLOWED_TOKEN_ERROR

        s3URL = 'null'

        if projectRaw.filePath:
            s3URL = projectRaw.filePath
        else:
            if not projectRaw.dataconnectorsList:
                projectRaw.dataconnectorsList = []

            for dataConnectorId in projectRaw.dataconnectorsList:
                dataConnectorInfo = self.dbClass.getOneDataconnectorById(dataConnectorId)
                s3URL = dataConnectorInfo.filePath

        return HTTP_200_OK, {'dataPath' : s3URL}

    def createProjectWithModelFile(self, token, modelFile, fileName):
        user = self.dbClass.getUser(token, raw=True)
        if not user:
            self.utilClass.sendSlackMessage(
                f"파일 : manageFile.py \n함수 : createProjectFromDataconnectors \n잘못된 토큰으로 에러 | 입력한 토큰 : {token}",
                appError=True, userInfo=user)
            return NOT_FOUND_USER_ERROR

        if self.dbClass.isUserHavingExceedErrorProjectCount(user.__dict__['__data__']):
            self.utilClass.sendSlackMessage(f"유저 ID : {user.id} - 오류 프로젝트를 지나치게 많이 생성하고 있으니 조치바랍니다.", inquiry=True, userInfo=user)
            return TOO_MANY_ERROR_PROJECT

        if self.dbClass.isUserHavingExceedProjectCount(user.__dict__['__data__']):
            self.utilClass.sendSlackMessage(
                f"csv Parse - run() \n프로젝트 사용량 초과입니다 {user['email']} (ID: {user['id']})",
                appLog=True, userInfo=user)
            return EXCEED_PROJECT_ERROR

        projectName = f"Load model project {fileName}"

        self.s3.put_object(Body=modelFile, Bucket=self.utilClass.bucket_name, Key=f"user/{user.id}/{fileName}")
        s3Url = urllib.parse.quote(
            f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/user/{user.id}/{fileName}').replace(
            'https%3A//', 'https://')

        if self.utilClass.configOption == 'enterprise':
            s3Url = f"{self.utilClass.save_path}/user/{user.id}/{fileName}"

        timestamp = str(round(time.time() * 1000))
        with open(f"{self.utilClass.save_path}/{timestamp}{fileName}", "wb") as f:
            f.write(modelFile)
        modelPath = f"{self.utilClass.save_path}/{timestamp}{fileName}"
        if s3Url.endswith('.pth'):
            loadOption = 'load_torch'
            try:
                import torch
                torch.jit.load(modelPath)
            except:
                pass
        else:
            loadOption = 'load_tensorflow'
            try:
                import tensorflow as tf
                self.unzipFile(modelPath, f"{self.utilClass.save_path}/{fileName.split('.zip')[0]}")
                tf.saved_model.load(f"{self.utilClass.save_path}/{fileName.split('.zip')[0]}")
            except:
                print(traceback.format_exc())
                try:
                    print(f"{self.utilClass.save_path}/{fileName.split('.zip')[0]}/{fileName.split('.zip')[0].split('/')[-1]}")
                    tf.saved_model.load(f"{self.utilClass.save_path}/{fileName.split('.zip')[0]}/{fileName.split('.zip')[0].split('/')[-1]}")
                except:
                    print(traceback.format_exc())
                    raise ex.NotAllowedModelFileEx()
                    pass
                pass
        try:
            shutil.rmtree(modelPath)
        except:
            pass


        if self.utilClass.configOption == 'enterprise':
            try:
                shutil.copyfile(modelPath, s3Url)
            except:
                pass


        project = self.dbClass.createProject({
            "projectName": projectName,
            "status": 100,
            "statusText": "0: 예측 준비 중 입니다.",
            "option": loadOption,
            "user": user.id,
            "filePath": s3Url,
            "trainingMethod": "normal_regression"
        })
        model = self.dbClass.createModel({
            "name": f"Loaded Model",
            "description": f"Loaded Model",
            "status": 100,
            "statusText": "100: The model is successfully loaded.",
            "progress": 100,
            "project": project.id,
            "token": uuid4(),
            "filePath": s3Url,
            "isParameterCompressed": True,
        })

        result = {'id': project.id, 'projectName': project.projectName, 'created_at':datetime.datetime.now()
                  ,'updated_at':datetime.datetime.now(), 'status':100, 'trainingMethod': None, 'model': model.__dict__['__data__']}

        self.utilClass.sendSlackMessage(
            f"프로젝트를 생성하였습니다. {user.email} (ID: {user.id}) , {projectName} (ID: {result['id']})",
            appLog=True, userInfo=user)

        return HTTP_200_OK, result

    def download_project_data(self, project_id):
        project_raw = self.dbClass.getOneProjectById(project_id, True)
        if not os.path.isdir(f'{self.utilClass.save_path}/{project_id}'):
            os.mkdir(f'{self.utilClass.save_path}/{project_id}')

        if project_raw.filePath is None:
            documents = self.dbClass.get_project_ds2data_by_project_id(project_raw.id)
            has_csv_data = True if documents[0]['fileType'] == 'csv' else False

            if has_csv_data:
                csv_datas = []
                for document in documents:
                    csv_datas.append(document['rawData'])
                df = pd.DataFrame.from_records(csv_datas)
                df.to_csv(f'{self.utilClass.save_path}/{project_id}/{project_id}.csv')
                s3Folder = f"user/{project_raw.user}/{project_id}/{project_id}.csv"

                self.s3.upload_file(f'{self.utilClass.save_path}/{project_id}/{project_id}.csv', self.utilClass.bucket_name,
                                    f'{s3Folder}')

                s3key = urllib.parse.quote(
                    f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3Folder}').replace(
                    'https%3A//', 'https://')

                if self.utilClass.configOption == 'enterprise':
                    s3key = f"{self.utilClass.save_path}/{s3Folder}"

                self.dbClass.updateProject(project_raw.id, {'filePath': s3key})

            else:
                if documents:
                    self.download_image_data(documents, project_id, project_raw, train_method=documents[0]['fileType'])

        else:


            if self.utilClass.configOption == 'enterprise':
                s3key = project_raw.filePath
            else:
                s3key = urllib.parse.unquote(project_raw.filePath.split('amazonaws.com/')[1])

            file_name = project_raw.filePath.split('/')[-1]
            self.s3.download_file(self.utilClass.bucket_name, s3key,
                                  f'{self.utilClass.save_path}/{project_id}/{file_name}')

            if file_name.split('.')[-1] in 'zip':
                self.unzipFile(f'{self.utilClass.save_path}/{project_id}/{file_name}', f'{self.utilClass.save_path}/{project_id}/')

    def download_image_data(self, documents, project_id, project_raw, train_method=None):
        if train_method == 'image':
            for document in documents:
                s3key = document['s3key'] if self.utilClass.configOption == "enterprise" else \
                    urllib.parse.unquote(document['s3key'].split('amazonaws.com/')[1])

                class_name = document['labelData']
                if not os.path.isdir(f'{self.utilClass.save_path}/{project_id}/{class_name}'):
                    os.mkdir(f'{self.utilClass.save_path}/{project_id}/{class_name}')
                self.s3.download_file(self.utilClass.bucket_name, s3key,
                                      f'{self.utilClass.save_path}/{project_id}/{class_name}/{document["fileName"]}')

            self.zip_file(project_id, 'data')

            s3Folder = f"user/{project_raw.user}/{project_id}/{project_id}.zip"

            self.s3.upload_file(f'{self.utilClass.save_path}/{project_id}.zip', self.utilClass.bucket_name,
                                f'{s3Folder}')

            s3key = urllib.parse.quote(
                f'https://{self.utilClass.bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3Folder}').replace(
                'https%3A//', 'https://')

            if self.utilClass.configOption == 'enterprise':
                s3key = f"{self.utilClass.save_path}/{s3Folder}"

            project_raw.filePath = s3key
            project_raw.save()
        elif train_method == 'object_detection':
            labelproject_raw = self.dbClass.getOneLabelProjectById(project_raw.labelproject)
            coco_data = CheckDataset().exportCoCoData(labelproject_raw, projectId=project_raw.id, is_train_data=True)

            if not os.path.isdir(f'{self.utilClass.save_path}/{project_id}/images'):
                os.mkdir(f'{self.utilClass.save_path}/{project_id}/images')

            # for document in documents:
            #     s3key = urllib.parse.unquote(document['s3key'].split('amazonaws.com/')[1])
            #     self.s3.download_file(self.utilClass.bucket_name, s3key,
            #                           f'{self.utilClass.save_path}/{project_id}/images/{document["originalFileName"]}')
            #
            # dataconnector_id = ast.literal_eval(project_raw.dataconnectorsList)[0]
            # dataconnector_raw = self.dbClass.getOneDataconnectorById(dataconnector_id)
            # labelproject = dataconnector_raw.originalLabelproject

            self.zip_file(project_id, 'data')

            # project_raw.filePath = s3key
            # project_raw.save()

    def unzipFile(self, filePath, outputPath):

        pathToZip = filePath
        unzip = ['unzip', '-qq', '-o', pathToZip, '-d', outputPath]
        return subprocess.call(unzip)

    def zip_file(self, folder_name, data_path):

        commands = f'cd {data_path}; zip -r {folder_name}.zip {folder_name}/*'
        process = subprocess.Popen('/bin/bash', stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        out, err = process.communicate(commands.encode('utf-8'))

    def get_extract_amount(self, project):

        if project['hasTextData']:
            min_count = 10000
        else:
            min_count = 1000
        data_count = self.dbClass.get_project_ds2data_by_project_id(project['id'], count=True)
        pricing = self.dbClass.get_price_with_pricing_name("Algorithm", raw=True)
        total_price = pricing.priceMin
        if data_count > min_count:
            per_price = pricing.price
            add_price = per_price * (data_count - min_count)
            total_price += add_price
        total_price = round(total_price, 3)
        usd_price = total_price
        krw_price = total_price * self.utilClass.usd_to_krw_rate

        return usd_price, krw_price

if __name__ == '__main__':
    ManageProject().download_project_data(14677)
