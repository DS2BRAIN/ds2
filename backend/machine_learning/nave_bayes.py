import pandas as pd
from sklearn.inspection import permutation_importance

from machine_learning import MachineLearning, _train_wrapper, SettingData
from sklearn.naive_bayes import GaussianNB
from sklearn.datasets import load_breast_cancer


class NaveBayesClf(MachineLearning, SettingData):

    def __init__(self):
        super().__init__()

    @_train_wrapper
    def train(self, df: pd.DataFrame, target_column_name: str, train_params: dict):
        model = GaussianNB(
            priors=train_params.get("priors", None),
            var_smoothing=train_params.get("var_smoothing", 1e-9)
        )

        return model


if __name__ == '__main__':
    dataset = load_breast_cancer()
    x_features = dataset.data
    y_label = dataset.target

    cancer_df = pd.DataFrame(data=x_features, columns=dataset.feature_names)
    cancer_df['predict'] = y_label

    hyper_parameters = {}

    model = NaveBayesClf()
    model.train(cancer_df, 'predict', hyper_parameters)
    # model.create_importance(cancer_df, 'predict', 1)

    del cancer_df['predict']
    result = model.predict(cancer_df)
    print(result)
