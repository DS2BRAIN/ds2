import pandas as pd

from machine_learning import MachineLearning, _train_wrapper, SettingData
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.datasets import load_breast_cancer


class GradientBoostingClf(MachineLearning, SettingData):

    def __init__(self):
        super().__init__()

    @_train_wrapper
    def train(self, df: pd.DataFrame, target_column_name: str, train_params: dict):
        # loss_list = ['deviance', 'exponential']
        model = GradientBoostingClassifier(
            loss=train_params.get("loss", 'deviance'),
            learning_rate=train_params.get("learning_rate", 0.1),
            n_estimators=train_params.get("n_estimators", 100),
            subsample=train_params.get("subsample", 1.0),
            criterion=train_params.get("criterion", 'friedman_mse'),
            min_samples_split=train_params.get("min_samples_split", 2),
            min_samples_leaf=train_params.get("min_samples_leaf", 1),
            min_weight_fraction_leaf=train_params.get("min_weight_fraction_leaf", 0.),
            max_depth=train_params.get("max_depth", 3),
            min_impurity_decrease=train_params.get("min_impurity_decrease", 0.),
            random_state=train_params.get("random_state", None),
            max_features=train_params.get("max_features", None),
            verbose=train_params.get("verbose", 0),
            max_leaf_nodes=train_params.get("max_leaf_nodes", None),
            warm_start=train_params.get("warm_start", False),
            validation_fraction=train_params.get("validation_fraction", 0.1),
            n_iter_no_change=train_params.get("n_iter_no_change", None),
            tol=train_params.get("tol", 1e-4),
            ccp_alpha=train_params.get("ccp_alpha", 0.0)
        )

        return model


class GradientBoostingReg(MachineLearning, SettingData):

    def __init__(self):
        super().__init__()

    @_train_wrapper
    def train(self, df: pd.DataFrame, target_column_name: str, train_params: dict):
        # loss_list = ['ls', 'lad', 'huber', 'quantile']
        model = GradientBoostingRegressor(
            loss=train_params.get("loss", 'ls'),
            learning_rate=train_params.get("learning_rate", 0.1),
            n_estimators=train_params.get("n_estimators", 100),
            subsample=train_params.get("subsample", 1.0),
            criterion=train_params.get("criterion", 'friedman_mse'),
            min_samples_split=train_params.get("min_samples_split", 2),
            min_samples_leaf=train_params.get("min_samples_leaf", 1),
            min_weight_fraction_leaf=train_params.get("min_weight_fraction_leaf", 0.),
            max_depth=train_params.get("max_depth", 3),
            min_impurity_decrease=train_params.get("min_impurity_decrease", 0.),
            random_state=train_params.get("random_state", None),
            max_features=train_params.get("max_features", None),
            alpha=train_params.get("alpha", 0.9),
            verbose=train_params.get("verbose", 0),
            max_leaf_nodes=train_params.get("max_leaf_nodes", None),
            warm_start=train_params.get("warm_start", False),
            validation_fraction=train_params.get("validation_fraction", 0.1),
            n_iter_no_change=train_params.get("n_iter_no_change", None),
            tol=train_params.get("tol", 1e-4),
            ccp_alpha=train_params.get("ccp_alpha", 0.0)
        )

        return model


if __name__ == '__main__':
    dataset = load_breast_cancer()
    x_features = dataset.data
    y_label = dataset.target

    cancer_df = pd.DataFrame(data=x_features, columns=dataset.feature_names)
    cancer_df['predict'] = y_label

    hyper_parameters = {}

    # model = GradientBoostingClf()
    model = GradientBoostingReg()
    model.train(cancer_df, 'predict', hyper_parameters)
    # model.create_importance(cancer_df, 'predict', 1)

    del cancer_df['predict']
    result = model.predict(cancer_df)
    print(result)
