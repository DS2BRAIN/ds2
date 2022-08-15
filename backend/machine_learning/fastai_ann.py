from torch.nn import *
from fastai.tabular.all import *
import pandas as pd

from models.helper import Helper
from machine_learning import SettingData

from fastai.learner import Learner
from collections import OrderedDict
import numpy as np
import pandas as pd

class FastAnn(SettingData):
    def __init__(self):

        self.db_class = Helper()
        self.y_block = {
            'category': CategoryBlock,
            'multicategory': MultiCategoryBlock,
            'regression': RegressionBlock
        }
        self.activation_function = {
            'ReLU': ReLU,
            'RReLU': RReLU,
            'Hardtanh': Hardtanh,
            'ReLU6': ReLU6,
            'Sigmoid': Sigmoid,
            'Hardsigmoid': Hardsigmoid,
            'Tanh': Tanh,
            'SiLU': SiLU,
            'Mish': Mish,
            'Hardswish': Hardswish,
            'ELU': ELU,
            'CELU': CELU,
            'SELU': SELU,
            'GELU': GELU,
            'Hardshrink': Hardshrink,
            'LeakyReLU': LeakyReLU,
            'LogSigmoid': LogSigmoid,
            'Softplus': Softplus,
            'Softshrink': Softshrink,
            # 'MultiheadAttention': MultiheadAttention,
            'PReLU': PReLU,
            'Tanhshrink': Tanhshrink,
            'Softmin': Softmin,
            'Softmax': Softmax,
            'Softmax2d': Softmax2d,
            'LogSoftmax': LogSoftmax
        }

        self.optimizer_function = {
            'Optimizer': Optimizer,
            'sgd_step': sgd_step,
            'weight_decay': weight_decay,
            'l2_reg': l2_reg,
            'average_grad': average_grad,
            'average_sqr_grad': average_sqr_grad,
            'momentum_step': momentum_step,
            'SGD': SGD,
            'rms_prop_step': rms_prop_step,
            'RMSProp': RMSProp,
            'step_stat': step_stat,
            'debias': debias,
            'adam_step': adam_step,
            'Adam': Adam,
            'radam_step': radam_step,
            'RAdam': RAdam,
            'qhadam_step': qhadam_step,
            'QHAdam': QHAdam,
            'larc_layer_lr': larc_layer_lr,
            'larc_step': larc_step,
            'Larc': Larc,
            'lamb_step': lamb_step,
            'Lamb': Lamb,
            'Lookahead': Lookahead,
            'ranger': ranger,
            'detuplify_pg': detuplify_pg,
            'set_item_pg': set_item_pg,
            'pytorch_hp_map': pytorch_hp_map,
            'OptimWrapper': OptimWrapper
        }

        self.loss_function = {
            "CrossEntropyLossFlat": CrossEntropyLossFlat,
            "FocalLossFlat": FocalLossFlat,
            "BCEWithLogitsLossFlat": BCEWithLogitsLossFlat,
            "BCELossFlat": BCELossFlat,
            "MSELossFlat": MSELossFlat,
            "L1LossFlat": L1LossFlat,
            "LabelSmoothingCrossEntropy": LabelSmoothingCrossEntropy,
            "LabelSmoothingCrossEntropyFlat": LabelSmoothingCrossEntropyFlat
        }

        self.metrics = {
            'AccumMetric': AccumMetric,
            'skm_to_fastai': skm_to_fastai,
            'optim_metric': optim_metric,
            'accuracy': accuracy,
            'error_rate': error_rate,
            'top_k_accuracy': top_k_accuracy,
            'APScoreBinary': APScoreBinary,
            'BalancedAccuracy': BalancedAccuracy,
            'BrierScore': BrierScore,
            'CohenKappa': CohenKappa,
            'F1Score': F1Score,
            'FBeta': FBeta,
            'HammingLoss': HammingLoss,
            'Jaccard': Jaccard,
            'Precision': Precision,
            'Recall':  Recall,
            'RocAuc': RocAuc,
            'RocAucBinary': RocAucBinary,
            'MatthewsCorrCoef': MatthewsCorrCoef,
            'accuracy_multi': accuracy_multi,
            'APScoreMulti': APScoreMulti,
            'BrierScoreMulti': BrierScoreMulti,
            'F1ScoreMulti': F1ScoreMulti,
            'FBetaMulti': FBetaMulti,
            'HammingLossMulti': HammingLossMulti,
            'JaccardMulti': JaccardMulti,
            'MatthewsCorrCoefMulti': MatthewsCorrCoefMulti,
            'PrecisionMulti': PrecisionMulti,
            'RecallMulti': RecallMulti,
            'RocAucMulti': RocAucMulti,
            'mse': mse,
            'rmse': rmse,
            'mae': mae,
            'msle': msle,
            'exp_rmspe': exp_rmspe,
            'ExplainedVariance': ExplainedVariance,
            'R2Score': R2Score,
            'PearsonCorrCoef': PearsonCorrCoef,
            'SpearmanCorrCoef': SpearmanCorrCoef,
            'foreground_acc': foreground_acc,
            'Dice': Dice,
            'DiceMulti': DiceMulti,
            'JaccardCoeff': JaccardCoeff,
            'CorpusBLEUMetric': CorpusBLEUMetric,
            'Perplexity': Perplexity,
            'perplexity': perplexity,
            'LossMetric': LossMetric,
            'LossMetrics': LossMetrics
        }

    def train(self, hyper_param: dict):

        # output
        hyper_block = hyper_param.get('y_block', 'category')
        y_block = self.y_block.get(hyper_block)()
        to_nn = TabularPandas(self.df, self.procs_nn, self.cat_nn, self.cont_nn, splits=self.splits, y_names=self.y_names, y_block=y_block)
        dls = to_nn.dataloaders()

        act_cls = self.activation_function.get(hyper_param.get('activation', 'ReLU'))()
        opt_func = self.optimizer_function.get(hyper_param.get('optimizer', 'Adam'))

        loss_func_floatify = hyper_param.get('loss_func_floatify', True)
        loss_func_gamma = hyper_param.get('loss_func_gamma', 0)
        lsos_func_reduction = hyper_param.get('reduction', 'mean')
        loss_function = self.loss_function.get(hyper_param.get('loss_func', 'CrossEntropyLossFlat'))
        if loss_function == FocalLossFlat:
            loss_function = FocalLossFlat(axis=1, floatify=loss_func_floatify, gamma=loss_func_gamma, reduction=lsos_func_reduction)
        elif loss_function in [BCEWithLogitsLossFlat, BCELossFlat, MSELossFlat, L1LossFlat]:
            loss_function = loss_function(axis=1, floatify=loss_func_floatify, reduction=lsos_func_reduction)
        else:
            loss_function = loss_function(axis=1, reduction=lsos_func_reduction)

        # metric_list = [self.metrics.get(metric) for metric in hyper_param.get('metrics', ['accuracy'])]
        layers = [int(hyper_param.get('layer_width', 200)) for i in range(int(hyper_param.get('layer_deep', 2)))]
        metric = [rmse] if hyper_block == 'regression' else [accuracy]
        config = {
            'ps': hyper_param.get('ps', None),
            'embed_p': hyper_param.get('embed_p', 0.0),
            'use_bn': hyper_param.get('use_bn', True),
            'bn_final': hyper_param.get('bn_final', False),
            'bn_cont': hyper_param.get('bn_cont', True),
            'act_cls': act_cls,
        }
        learn = tabular_learner(
            dls=dls,
            layers=layers,
            y_range=hyper_param.get('y_range', None),
            opt_func=opt_func,
            loss_func=loss_function,
            lr=hyper_param.get('lr', 0.001),
            splitter=trainable_params,
            metrics=metric,
            train_bn=hyper_param.get('train_bn', True),
            moms=tuple(hyper_param.get('moms', [0.95, 0.35, 0.95])),
            config=config,
        )
        learn.fit_one_cycle(int(hyper_param.get('epochs', 50)))
        self.model = learn

        return self.model

    def predict(self, df: pd.DataFrame, project_id: int):

        project_dict = self.db_class.getOneProjectById(project_id)
        column_id = str(project_dict['valueForPredictColumnId'])
        data_column = self.db_class.get_datacolumn_by_column_id(column_id)
        if data_column is None:
            return None

        dl = self.model.dls.test_dl(df)
        probs, _ = self.model.get_preds(dl=dl)
        if len(probs.numpy()[0]) == 1:
            result = probs.numpy().flatten()
        else:
            uniq_list = data_column.uniqueValues
            clas = [p.argmax() for p in probs.numpy()]
            result = [uniq_list[item] for item in clas]

        return result

    def create_importance(self):
        return FastPermutationImportance(self.model, self.df).get_importance()

class FastPermutationImportance:

  "Calculate and plot the permutation importance"
  def __init__(self, learn: Learner, df=None, bs=None):
    "Initialize with a test dataframe, a learner, and a metric"
    self.learn = learn
    self.df = df
    bs = bs if bs is not None else learn.dls.bs
    if self.df is not None:
      self.dl = learn.dls.test_dl(self.df, bs=bs)
    else:
      self.dl = learn.dls[1]
    self.x_names = learn.dls.x_names.filter(lambda x: '_na' not in x)
    self.na = learn.dls.x_names.filter(lambda x: '_na' in x)
    self.y = learn.dls.y_names
    self.results = self.calc_feat_importance()
    # self.plot_importance(self.ord_dic_to_df(self.results))

  def get_importance(self):
    importance_dict = {
      "cols": [],
      "imp": []
    }
    for key, value in self.importance.items():
        importance_dict["cols"].append(key)
        importance_dict["imp"].append(value)

    return importance_dict

  def measure_col(self, name:str):
    "Measures change after column shuffle"
    col = [name]
    if f'{name}_na' in self.na: col.append(name)
    orig = self.dl.items[col].values
    perm = np.random.permutation(len(orig))
    self.dl.items[col] = self.dl.items[col].values[perm]
    metric = self.learn.validate(dl=self.dl)[1]
    self.dl.items[col] = orig
    return metric

  def calc_feat_importance(self):
    "Calculates permutation importance by shuffling a column on a percentage scale"
    base_error = self.learn.validate(dl=self.dl)[1]
    self.importance = {}
    # pbar = progress_bar(self.x_names)
    print('Calculating Permutation Importance')
    for col in self.x_names:
      self.importance[col] = self.measure_col(col)
    for key, value in self.importance.items():
      try:
        self.importance[key] = (base_error-value)/base_error
      except ZeroDivisionError:
        self.importance[key] = 0
    return OrderedDict(sorted(self.importance.items(), key=lambda kv: kv[1], reverse=True))

  def ord_dic_to_df(self, dict: OrderedDict):
    return pd.DataFrame([[k, v] for k, v in dict.items()], columns=['feature', 'importance'])

  def plot_importance(self, df: pd.DataFrame, limit=20, asc=False, **kwargs):
    "Plot importance with an optional limit to how many variables shown"
    df_copy = df.copy()
    df_copy['feature'] = df_copy['feature'].str.slice(0,25)
    df_copy = df_copy.sort_values(by='importance', ascending=asc)[:limit].sort_values(by='importance', ascending=not(asc))
    ax = df_copy.plot.barh(x='feature', y='importance', sort_columns=True, **kwargs)
    for p in ax.patches:
      ax.annotate(f'{p.get_width():.4f}', ((p.get_width() * 1.005), p.get_y() * 1.005))

if __name__ == '__main__':
    import pandas as pd
    db_class = Helper()
    project_id = 17579
    file_path = '../script_dir/files/original_labelproject_14956.csv'
    df = pd.read_csv(file_path)
    project_dict = db_class.getOneProjectById(project_id)
    target_column_name = str(project_dict['valueForPredict'])

    hyper_param = {
        # "y_block": "category",
        "y_block": "regression",
        "activation": "ReLU",
        "optimizer": "Adam",
        "loss_func_floatify": True,
        "loss_func_gamma": 2,
        "loss_func_reduction": 'mean',
        # "loss_func": "CrossEntropyLossFlat",
        "loss_func": "MSELossFlat",
        "ps": None,
        "embed_p": 0.0,
        "use_bn": True,
        "bn_final": False,
        "bn_cont": True,
        "layer_width": 200,
        "layer_deep": 2,
        "y_range": None,
        "lr": 0.001,
        # "metrics": ['accuracy'],
        "train_bn": True,
        "moms": [0.95, 0.35, 0.95],
        "epochs": 5
        }

    module = FastAnn()
    module.set_train_data(df=df, target_column_name=target_column_name, project_id=project_id, is_fastai=True)
    trained_model = module.train(hyper_param)

    trained_model.export('../script_dir/files/save_files/saved_fastai.pkl')
    module.model = load_learner('../script_dir/files/save_files/saved_fastai.pkl')
    test_df = df.copy()[:10]
    # test_dict = {
    #     "age__insurance.csv__14937.csv": 35,
    #     "sex__insurance.csv__14937.csv": "female",
    #     "bmi__insurance.csv__14937.csv": 28.025,
    #     "children__insurance.csv__14937.csv": 0,
    #     "region__insurance.csv__14937.csv": "northwest",
    #     "charges__insurance.csv__14937.csv": 20234.85475
    # }
    # test_df = pd.DataFrame.from_dict([test_dict])
    print(test_df[target_column_name].to_list())
    del test_df[module.y_names]
    y_list = module.predict(test_df, project_id)
    print(y_list)

    res = FastPermutationImportance(module.model, module.df)

    featureImportance = res.get_importance()
    print(featureImportance)