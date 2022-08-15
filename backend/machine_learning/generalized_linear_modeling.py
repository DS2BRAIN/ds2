import pandas as pd
from machine_learning import MachineLearning, _train_wrapper, SettingData
from sklearn.linear_model import SGDClassifier
from sklearn.linear_model import SGDRegressor
from sklearn.datasets import load_breast_cancer


class SGDClf(MachineLearning, SettingData):

    def __init__(self):
        super().__init__()

    @_train_wrapper
    def train(self, df: pd.DataFrame, target_column_name: str, train_params: dict):
        model = SGDClassifier(
            loss=train_params.get("loss", "hinge"),
            penalty=train_params.get("penalty", 'l2'),
            alpha=train_params.get("alpha", 0.0001),
            l1_ratio=train_params.get("l1_ratio", 0.15),
            fit_intercept=train_params.get("fit_intercept", True),
            max_iter=train_params.get("max_iter", 1000),
            tol=train_params.get("tol", 1e-3),
            shuffle=train_params.get("shuffle", True),
            verbose=train_params.get("verbose", 0),
            epsilon=train_params.get("epsilon", 0.1),
            n_jobs=train_params.get("n_jobs", None),
            random_state=train_params.get("random_state", None),
            learning_rate=train_params.get("learning_rate", "optimal"),
            eta0=train_params.get("eta0", 0.0),
            power_t=train_params.get("power_t", 0.5),
            early_stopping=train_params.get("early_stopping", False),
            validation_fraction=train_params.get("validation_fraction", 0.1),
            n_iter_no_change=train_params.get("n_iter_no_change", 5),
            # class_weight=train_params.get("class_weight", None),
            warm_start=train_params.get("warm_start", False),
            average=train_params.get("average", False)
        )

        return model


class SGDReg(MachineLearning, SettingData):

    def __init__(self):
        super().__init__()

    @_train_wrapper
    def train(self, df: pd.DataFrame, target_column_name: str, train_params: dict):
        model = SGDRegressor(
            loss=train_params.get("loss", "squared_loss"),
            penalty=train_params.get("penalty", 'l2'),
            alpha=train_params.get("alpha", 0.0001),
            l1_ratio=train_params.get("l1_ratio", 0.15),
            fit_intercept=train_params.get("fit_intercept", True),
            max_iter=train_params.get("max_iter", 1000),
            tol=train_params.get("tol", 1e-3),
            shuffle=train_params.get("shuffle", True),
            verbose=train_params.get("verbose", 0),
            epsilon=train_params.get("epsilon", 0.1),
            random_state=train_params.get("random_state", None),
            learning_rate=train_params.get("learning_rate", "invscaling"),
            eta0=train_params.get("eta0", 0.01),
            power_t=train_params.get("power_t", 0.5),
            early_stopping=train_params.get("early_stopping", False),
            validation_fraction=train_params.get("validation_fraction", 0.1),
            n_iter_no_change=train_params.get("n_iter_no_change", 5),
            warm_start=train_params.get("warm_start", False),
            average=train_params.get("average", False)
        )

        return model


if __name__ == '__main__':
    dataset = load_breast_cancer()
    x_features = dataset.data
    y_label = dataset.target

    cancer_df = pd.DataFrame(data=x_features, columns=dataset.feature_names)
    cancer_df['predict'] = y_label

    hyper_parameters = {}

    # model = SGDClf()
    model = SGDReg()
    model.train(cancer_df, 'predict', hyper_parameters)
    # model.create_importance(cancer_df, 'predict', 1)

    del cancer_df['predict']
    result = model.predict(cancer_df)
    print(result)
