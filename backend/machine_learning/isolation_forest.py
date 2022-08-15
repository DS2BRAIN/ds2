import pandas as pd
from machine_learning import MachineLearning, _train_wrapper, SettingData
from sklearn.ensemble import IsolationForest
from sklearn.datasets import load_breast_cancer


class IsolationForestClf(MachineLearning, SettingData):

    def __init__(self):
        super().__init__()

    @_train_wrapper
    def train(self, df: pd.DataFrame, target_column_name: str, train_params: dict):
        model = IsolationForest(
            n_estimators=train_params.get("n_estimators", 100),
            max_samples=train_params.get("max_samples", "auto"),
            contamination=train_params.get("contamination", "auto"),
            max_features=train_params.get("max_features", 1.),
            bootstrap=train_params.get("bootstrap", False),
            n_jobs=train_params.get("n_jobs", None),
            random_state=train_params.get("random_state", None),
            verbose=train_params.get("verbose", 0),
            warm_start=train_params.get("warm_start", False)
        )

        return model


if __name__ == '__main__':
    dataset = load_breast_cancer()
    x_features = dataset.data
    y_label = dataset.target

    cancer_df = pd.DataFrame(data=x_features, columns=dataset.feature_names)
    cancer_df['predict'] = y_label

    hyper_parameters = {}

    model = IsolationForestClf()
    imp = model.create_importance()
    model.train(cancer_df, 'predict', hyper_parameters)
    # model.create_importance(cancer_df, 'predict', 1)

    del cancer_df['predict']
    result = model.predict(cancer_df)
    print(result)
    print(imp)
