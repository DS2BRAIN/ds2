import pandas as pd
from machine_learning import MachineLearning, _train_wrapper, SettingData
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import RandomForestRegressor
from sklearn.datasets import load_breast_cancer


class RandomForestClf(MachineLearning, SettingData):

    def __init__(self):
        super().__init__()

    @_train_wrapper
    def train(self, df: pd.DataFrame, target_column_name: str, train_params: dict):
        model = RandomForestClassifier(
            n_estimators=train_params.get("n_estimators", 100),
            criterion=train_params.get("criterion", "gini"),
            max_depth=train_params.get("max_depth", None),
            min_samples_split=train_params.get("min_samples_split", 2),
            min_samples_leaf=train_params.get("min_samples_leaf", 1),
            min_weight_fraction_leaf=train_params.get("min_weight_fraction_leaf", 0.),
            max_features=train_params.get("max_features", "auto"),
            max_leaf_nodes=train_params.get("max_leaf_nodes", None),
            min_impurity_decrease=train_params.get("min_impurity_decrease", 0.),
            bootstrap=train_params.get("bootstrap", True),
            oob_score=train_params.get("oob_score", False),
            n_jobs=train_params.get("n_jobs", None),
            random_state=train_params.get("random_state", None),
            verbose=train_params.get("verbose", 0),
            warm_start=train_params.get("warm_start", False),
            class_weight=train_params.get("class_weight", None),
            ccp_alpha=train_params.get("ccp_alpha", 0.0),
            max_samples=train_params.get("max_samples", None)
        )

        return model


class RandomForestReg(MachineLearning, SettingData):

    def __init__(self):
        super().__init__()

    @_train_wrapper
    def train(self, df: pd.DataFrame, target_column_name: str, train_params: dict):
        model = RandomForestRegressor(
            n_estimators=train_params.get("n_estimators", 100),
            criterion=train_params.get("criterion", "mse"),
            max_depth=train_params.get("max_depth", None),
            min_samples_split=train_params.get("min_samples_split", 2),
            min_samples_leaf=train_params.get("min_samples_leaf", 1),
            min_weight_fraction_leaf=train_params.get("min_weight_fraction_leaf", 0.),
            max_features=train_params.get("max_features", "auto"),
            max_leaf_nodes=train_params.get("max_leaf_nodes", None),
            min_impurity_decrease=train_params.get("min_impurity_decrease", 0.),
            bootstrap=train_params.get("bootstrap", True),
            oob_score=train_params.get("oob_score", False),
            n_jobs=train_params.get("n_jobs", None),
            random_state=train_params.get("random_state", None),
            verbose=train_params.get("verbose", 0),
            warm_start=train_params.get("warm_start", False),
            ccp_alpha=train_params.get("ccp_alpha", 0.0),
            max_samples=train_params.get("max_samples", None)
        )

        return model


if __name__ == '__main__':
    dataset = load_breast_cancer()
    x_features = dataset.data
    y_label = dataset.target

    cancer_df = pd.DataFrame(data=x_features, columns=dataset.feature_names)
    cancer_df['predict'] = y_label

    hyper_parameters = {
        'class_weight': 'balanced_subsample'
    }

    model = RandomForestClf()
    # model = RandomForestReg()
    model.train(cancer_df, 'predict', hyper_parameters)
    # model.create_importance(cancer_df, 'predict', 1)

    del cancer_df['predict']
    result = model.predict(cancer_df)
    print(result)
