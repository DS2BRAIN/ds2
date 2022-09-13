import numpy as np
import pandas as pd
import tensorflow as tf
import re
import string
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM
from tensorflow.keras import optimizers, losses, activations
from machine_learning import MachineLearning, SettingData
from models.helper import Helper


class KerasAnn(MachineLearning, SettingData):

    def __init__(self):
        super().__init__()


        self.optimizer_function_info = {
            'adam': optimizers.Adam,
            'sgd': optimizers.SGD,
            'rmsprop': optimizers.RMSprop,
            'adagrad': optimizers.Adagrad,
            'adadelta': optimizers.Adadelta,
            'adamax': optimizers.Adamax,
            'nadam': optimizers.Nadam
        }

        self.loss_function_info = {
            'mean_squared_error': losses.mean_squared_error,
            'mean_absolute_error': losses.mean_absolute_error,
            'mean_absolute_percentage_error': losses.mean_absolute_percentage_error,
            'mean_squared_logarithmic_error': losses.mean_squared_logarithmic_error,
            'squared_hinge': losses.squared_hinge,
            'hinge': losses.hinge,
            'categorical_hinge': losses.categorical_hinge,
            'logcosh': losses.logcosh,
            'categorical_crossentropy': losses.categorical_crossentropy,
            'sparse_categorical_crossentropy': losses.sparse_categorical_crossentropy,
            'binary_crossentropy': losses.binary_crossentropy,
            'kullback_leibler_divergence': losses.kullback_leibler_divergence,
            'poisson': losses.poisson
        }

        self.activation_info = {
            "softmax": activations.softmax,
            "elu": activations.elu,
            "selu": activations.selu,
            "softplus": activations.softplus,
            "softsign": activations.softsign,
            "relu": activations.relu,
            "tanh": activations.tanh,
            "sigmoid": activations.sigmoid,
            "hard_sigmoid": activations.hard_sigmoid,
            "exponential": activations.exponential,
            "linear": activations.linear
        }

    def custom_standardization(self, input_data):
        lowercase = tf.strings.lower(input_data)
        stripped_html = tf.strings.regex_replace(lowercase, '<br />', ' ')
        return tf.strings.regex_replace(stripped_html,
                                        '[%s]' % re.escape(string.punctuation), '')

    def train(self, df: pd.DataFrame, target_column_name: str, train_params: dict, project_id: int):
        # with tf.device("/cpu:0"):

        try:
            import horovod.tensorflow.keras as hvd
            is_with_horovod = True
        except:
            is_with_horovod = False

        if is_with_horovod:
            hvd.init()
            gpus = tf.config.experimental.list_physical_devices('GPU')
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            if gpus:
                tf.config.experimental.set_visible_devices(gpus[hvd.local_rank()], 'GPU')

            layer_width = train_params.pop('layer_width', 10)
            layer_deep = train_params.pop('layer_deep', 3) - 1
            optimizer_function = self.optimizer_function_info[train_params['optimizer'].pop('function_name').lower()](0.001 * hvd.size())
            loss_function = self.loss_function_info[train_params['loss_function']]
            output_activation = self.activation_info[train_params['output_activation']]

            model = Sequential()
            model.add(Dense(layer_width, input_shape=(len(df.columns) - 1, ), activation=self.activation_info[train_params.get('activation')]))
            for i in range(0, layer_deep):
                model.add(Dense(layer_width))
            model.add(Dense(1, activation=output_activation))

            self.x_train = np.array(self.x_train)
            self.y_train = np.array(self.y_train)
            self.x_test = np.array(self.x_test)
            self.y_test = np.array(self.y_test)

            opt = hvd.DistributedOptimizer(optimizer_function)
            model.compile(loss=loss_function, optimizer=opt, metrics=['accuracy', 'mse'])
            callbacks = [hvd.callbacks.BroadcastGlobalVariablesCallback(0)]
            # if hvd.rank() == 0:
            #     callbacks.append(keras.callbacks.ModelCheckpoint('./checkpoint-{epoch}.h5'))

            model.fit(self.x_train, self.y_train, epochs=int(train_params.get("epochs", 100)),
                      steps_per_epoch=500 // hvd.size(), verbose=1 if hvd.rank() == 0 else 0, callbacks=callbacks,
                      batch_size=int(train_params.get("batch_size", 20)), validation_data=(self.x_test, self.y_test))
            self.model = model
        else:
            # with tf.device("/cpu:0"):
            layer_width = train_params.pop('layer_width', 10)
            layer_deep = train_params.pop('layer_deep', 3) - 1
            optimizer_function = self.optimizer_function_info[train_params['optimizer'].pop('function_name').lower()](
                **train_params['optimizer'])
            loss_function = self.loss_function_info[train_params['loss_function']]
            output_activation = self.activation_info[train_params['output_activation']]

            model = Sequential()
            model.add(Dense(layer_width, input_shape=(len(df.columns) - 1,),
                            activation=self.activation_info[train_params.get('activation')]))
            for i in range(0, layer_deep):
                model.add(Dense(layer_width))
            model.add(Dense(1, activation=output_activation))

            self.x_train = np.array(self.x_train)
            self.y_train = np.array(self.y_train)
            self.x_test = np.array(self.x_test)
            self.y_test = np.array(self.y_test)

            model.compile(loss=loss_function, optimizer=optimizer_function, metrics=['accuracy', 'mse'])
            model.fit(self.x_train, self.y_train, epochs=int(train_params.get("epochs", 100)),
                      batch_size=int(train_params.get("batch_size", 20)), validation_data=(self.x_test, self.y_test))
            self.model = model

            return self.model

        return self.model

    def create_importance(self):

        results = []

        oof_preds = self.model.predict(self.x_test, verbose=0).squeeze()
        baseline_mae = np.mean(np.abs(oof_preds - self.y_test))
        # results.append({"cols": "BASELINE", "imp": baseline_mae})
        result = {"cols": ["BASELINE"], "imp": [baseline_mae]}
        for k in range(len(self.column_names)):
            save_col = self.x_test[:, k].copy()
            np.random.shuffle(self.x_test[:, k])

            oof_preds = self.model.predict(self.x_test, verbose=0).squeeze()
            mae = np.mean(np.abs(oof_preds - self.y_test))
            result["cols"].append(self.column_names[k])
            result["imp"].append(mae)
            # results.append({"cols": self.column_names[k], "imp": mae})
            self.x_test[:, k] = save_col

        # df = pd.DataFrame(result)
        # df = pd.DataFrame(results)
        # df = df.sort_values("imp")

        # return df.to_dict()
        return result

if __name__ == '__main__':
    import pandas as pd
    from src.manage_machine_learning import ManageMachineLearning
    from routers.predictRouter import PredictObject

    predict_class = ManageMachineLearning()
    db_class = Helper()
    project_id = 17573
    file_path = '/Users/yong-eunjae/Downloads/분류모델_학습.csv'
    df = pd.read_csv(file_path)
    project_dict = db_class.getOneProjectById(project_id)
    target_column_name = str(project_dict['valueForPredict'])

    hyper_params = {
        "epochs": 3,
        "one_hot_encoding": True,
        "loss_function": "mean_squared_error",
            "optimizer": {
            "function_name": "Adam",
            "learning_rate": 0.001,
            "beta_1": 0.9,
            "beta_2": 0.999,
            "epsilon": None,
            "decay": 0.0,
            "amsgrad": False
        },
        "activation": "relu",
        "output_activation": "sigmoid",
        "batch_size": 1,
        "is_deep_learning": True,
        "layer_width": 5,
        "layer_deep": 3
    }

    model_class = KerasAnn()
    model_class.set_train_data(df, target_column_name, project_id)
    model = model_class.train(df, target_column_name, hyper_params, project_id)
    # predict_data = {
    #     "GRE 점수": 337,
    #     "TOEFL 점수": 118,
    #     "대학 랭킹": 4,
    #     "목적 진술": 4.5,
    #     "추천서": 4.5,
    #     "학부생GPA": 9.65,
    #     "연구 경험": 1}
    # predict_data = [337, 118, 4, 4.5, 4.5, 9.65, 1]

    imp = model_class.create_importance()
    print(imp)
    # test_df = df.copy()[:10]
    # print(test_df[target_column_name].to_list())
    # del test_df[model.y_names]
    # result = model.predict(np.array([predict_data]))[0]
    #
    # print(result)
