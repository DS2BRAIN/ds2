import pandas
from xgboost import XGBClassifier, DMatrix
from xgboost import XGBRegressor
import pandas as pd
from machine_learning import MachineLearning, _train_wrapper, SettingData
from sklearn.datasets import load_breast_cancer
import urllib.request

class XGBoostClf(MachineLearning, SettingData):

    def __init__(self):
        super().__init__()

    @_train_wrapper
    def train(self, df: pd.DataFrame, target_column_name: str, train_params: dict):
        # booster = ['gbtree', 'gblinear']
        # tree_method = ['auto', 'exact', 'approx', 'hist', 'gpu_hist']
        # sampling_method = ['uniform', 'gradient_based']
        # objective = ['reg:linear', 'binary:logistic', 'multi:softmax', 'multi:softprob']
        # eval_metric = ['rmse', 'mae', 'logloss', 'error', 'merror', 'mlogloss', 'auc', 'map']
        # feature_selector = ['cyclic', 'shuffle', 'random', 'greedy', 'thrifty']

        booster = train_params.get("booster", 'gbtree')
        tree_method = train_params.get("tree_method", "auto")
        feature_selector = train_params.get("feature_selector",
                                            "cyclic") if booster == "gblinear" else train_params.get("feature_selector",
                                                                                                     None),

        model = XGBClassifier(
            verbosity=0,
            silent=True,
            booster=train_params.get("booster", 'gbtree'),
            objective=train_params.get("objective", 'binary:logistic'),
            learning_rate=train_params.get("learning_rate", 0.1),
            gamma=train_params.get("gamma", 0),
            max_depth=train_params.get("max_depth", 6),
            min_child_weight=train_params.get("min_child_weight", 1),
            max_delta_step=train_params.get("max_delta_step", 0),
            subsample=train_params.get("subsample", 1),
            sampling_method=train_params.get("sampling_method", "uniform") if tree_method == "gpu_hist" else "uniform",
            colsample_bylevel=train_params.get("colsample_bylevel", 1),
            colsample_bytree=train_params.get("colsample_bytree", 1),
            colsample_bynode=train_params.get("colsample_bynode", 1),
            reg_lambda=train_params.get("reg_lambda", 1) if booster == "gbtree" else train_params.get("reg_lambda", 0),
            reg_alpha=train_params.get("reg_alpha", 0),
            tree_method=tree_method,
            scale_pos_weight=train_params.get("scale_pos_weight", 1),
            max_leaves=train_params.get("max_leaves", 0),
            max_bin=train_params.get("max_bin", 256),
            n_estimators=train_params.get("n_estimators", 100),
            random_state=train_params.get("random_state", 2),
            eval_metric=train_params.get("eval_metric", 'rmse'),
            feature_selector=feature_selector,
            top_k=train_params.get("top_k", 0) if feature_selector in ['greedy', 'thrifty'] else train_params.get(
                "top_k", None),
            refresh_leaf=train_params.get("refresh_leaf", '1'),
            process_type=train_params.get("process_type", 'default'),
            grow_policy=train_params.get("grow_policy", 'depthwise') if tree_method in ['hist', 'approx', 'gpu_hist'] else train_params.get("grow_policy", None),
            single_precision_histogram=train_params.get("single_precision_histogram", 0) if tree_method in ['hist', 'approx', 'gpu_hist'] else train_params.get("single_precision_histogram", None)
        )

        return model


class XGBoostReg(MachineLearning, SettingData):

    def __init__(self):
        super().__init__()

    @_train_wrapper
    def train(self, df: pd.DataFrame, target_column_name: str, train_params: dict):
        # booster = ['gbtree', 'gblinear']
        # tree_method = ['auto', 'exact', 'approx', 'hist', 'gpu_hist']
        # sampling_method = ['uniform', 'gradient_based']
        # objective = ['reg:linear', 'binary:logistic', 'multi:softmax', 'multi:softprob']
        # eval_metric = ['rmse', 'mae', 'logloss', 'error', 'merror', 'mlogloss', 'auc', 'map']
        # feature_selector = ['cyclic', 'shuffle', 'random', 'greedy', 'thrifty']

        booster = train_params.get("booster", 'gbtree')
        tree_method = train_params.get("tree_method", "auto")
        feature_selector = train_params.get("feature_selector", "cyclic") if booster == "gblinear" else train_params.get("feature_selector", None),

        model = XGBRegressor(
            verbosity=0,
            silent=True,
            booster=train_params.get("booster", 'gbtree'),
            objective=train_params.get("objective", 'reg:squarederror'),
            learning_rate=train_params.get("learning_rate", 0.1),
            gamma=train_params.get("gamma", 0),
            max_depth=train_params.get("max_depth", 6),
            min_child_weight=train_params.get("min_child_weight", 1),
            max_delta_step=train_params.get("max_delta_step", 0),
            subsample=train_params.get("subsample", 1),
            sampling_method=train_params.get("sampling_method", "uniform") if tree_method == "gpu_hist" else "uniform",
            colsample_bylevel=train_params.get("colsample_bylevel", 1),
            colsample_bytree=train_params.get("colsample_bytree", 1),
            colsample_bynode=train_params.get("colsample_bynode", 1),
            reg_lambda=train_params.get("reg_lambda", 1) if booster == "gbtree" else train_params.get("reg_lambda", 0),
            reg_alpha=train_params.get("reg_alpha", 0),
            tree_method=tree_method,
            scale_pos_weight=train_params.get("scale_pos_weight", 1),
            max_leaves=train_params.get("max_leaves", 0),
            max_bin=train_params.get("max_bin", 256),
            n_estimators=train_params.get("n_estimators", 100),
            random_state=train_params.get("random_state", 2),
            eval_metric=train_params.get("eval_metric", 'rmse'),
            feature_selector=feature_selector,
            top_k=train_params.get("top_k", 0) if feature_selector in ['greedy', 'thrifty'] else train_params.get(
                "top_k", None),
            refresh_leaf=train_params.get("refresh_leaf", '1'),
            process_type=train_params.get("process_type", 'default'),
            grow_policy=train_params.get("grow_policy", 'depthwise') if tree_method in ['hist', 'approx',
                                                                                        'gpu_hist'] else train_params.get(
                "grow_policy", None),
            single_precision_histogram=train_params.get("single_precision_histogram", 0) if tree_method in ['hist',
                                                                                                            'approx',
                                                                                                            'gpu_hist'] else train_params.get(
                "single_precision_histogram", None)
        )
        return model


if __name__ == '__main__':
    df = pandas.read_csv('/Users/yong-eunjae/Downloads/original_labelproject_14912 (1).csv')

    hyper_parameters = {}

    model = XGBoostReg()
    # model = XGBoostReg()
    model.set_train_data(df, '입학 확률__ex1_graduate_school_admissions (1).csv', 17536)
    model.train(df, '입학 확률__ex1_graduate_school_admissions (1).csv', hyper_parameters)
    # model.create_importance(cancer_df, 'predict', 1)
    # predict_value = pd.DataFrame([predict_data])

    del df['입학 확률__ex1_graduate_school_admissions (1).csv']
    result = model.predict(df)
    print(result)
