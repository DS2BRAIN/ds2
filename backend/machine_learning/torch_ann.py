import torch
import pandas as pd
from sklearn.model_selection import train_test_split
from machine_learning import SettingData
from torch.utils.data import TensorDataset


class TorchAnn(torch.nn.Module, SettingData):
    def __init__(self, input_size, layer_width):
        super(TorchAnn, self).__init__()

        try:
            import horovod.torch as hvd
            is_with_horovod = True
        except:
            is_with_horovod = False

        if is_with_horovod:
            print(is_with_horovod)
            # Initialize Horovod
            hvd.init()
            # Pin GPU to be used to process local rank (one GPU per process)
            if torch.cuda.is_available():
                torch.cuda.set_device(hvd.local_rank())
        else:

            device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
            torch.cuda.set_device(device)

        self.input_size = input_size
        self.hidden_size = layer_width
        self.x_train = None
        self.x_test = None
        self.y_train = None
        self.y_test = None

        self.activation_function = {
            'relu': torch.nn.ReLU,
            'rrelu': torch.nn.RReLU,
            'hardtanh': torch.nn.Hardtanh,
            'relu6': torch.nn.ReLU6,
            'sigmoid': torch.nn.Sigmoid,
            'hard_sigmoid': torch.nn.Hardsigmoid,
            'tanh': torch.nn.Tanh,
            'silu': torch.nn.SiLU,
            'mish': torch.nn.Mish,
            'hardwish': torch.nn.Hardswish,
            'elu': torch.nn.ELU,
            'celu': torch.nn.CELU,
            'selu': torch.nn.SELU,
            'gelu': torch.nn.GELU,
            'hardshrink': torch.nn.Hardshrink,
            'leakyrelu': torch.nn.LeakyReLU,
            'logsigmoid': torch.nn.LogSigmoid,
            'softplus': torch.nn.Softplus,
            'softshrink': torch.nn.Softshrink,
            'multiheadattention': torch.nn.MultiheadAttention,
            'prelu': torch.nn.PReLU,
            'tanhshrink': torch.nn.Tanhshrink,
            'softmin': torch.nn.Softmin,
            'softmax': torch.nn.Softmax,
            'softmax2d': torch.nn.Softmax2d,
            'logsoftmax': torch.nn.LogSoftmax
        }

        self.optimizer_function = {
            'adadelta': torch.optim.Adadelta,
            'adagrad': torch.optim.Adagrad,
            'adam': torch.optim.Adam,
            'adamx': torch.optim.Adamax,
            'adamw': torch.optim.AdamW,
            'asgd': torch.optim.ASGD,
            'lbfgs': torch.optim.LBFGS,
            'rmsprop': torch.optim.RMSprop,
            'rprop': torch.optim.Rprop,
            'sgd': torch.optim.SGD,
            'sparseadam': torch.optim.SparseAdam,
        }

        self.loss_function = {
            "bceloss": torch.nn.modules.loss.BCELoss,
            "l1loss": torch.nn.modules.loss.L1Loss,
            "nllloss": torch.nn.modules.loss.NLLLoss,
            "mseloss": torch.nn.modules.loss.MSELoss,
            "bcewithlogitsloss": torch.nn.modules.loss.BCEWithLogitsLoss,
            "cosineembeddingloss": torch.nn.modules.loss.CosineEmbeddingLoss,
            "crossentropyloss": torch.nn.modules.loss.CrossEntropyLoss,
            "ctcloss": torch.nn.modules.loss.CTCLoss,
            "gaussiannllloss": torch.nn.modules.loss.GaussianNLLLoss,
            "hingeembeddingloss": torch.nn.modules.loss.HingeEmbeddingLoss,
            "huberloss": torch.nn.modules.loss.HuberLoss,
            "kldivloss": torch.nn.modules.loss.KLDivLoss,
            "marginrankingloss": torch.nn.modules.loss.MarginRankingLoss,
            "multilabelmarginloss": torch.nn.modules.loss.MultiLabelMarginLoss,
            "multiLabelsoftmarginloss": torch.nn.modules.loss.MultiLabelSoftMarginLoss,
            "multimarginloss": torch.nn.modules.loss.MultiMarginLoss,
            "nllloss2d": torch.nn.modules.loss.NLLLoss2d,
            "poissonnllloss": torch.nn.modules.loss.PoissonNLLLoss,
            "smoothl1loss": torch.nn.modules.loss.SmoothL1Loss,
            "softmarginloss": torch.nn.modules.loss.SoftMarginLoss,
            "tripletmarginloss": torch.nn.modules.loss.TripletMarginLoss,
            "tripletmarginwithdistanceloss": torch.nn.modules.loss.TripletMarginWithDistanceLoss,
            "pairwisedistance": torch.nn.modules.loss.PairwiseDistance
        }

        if input_size and layer_width:
            self.linear_1 = torch.nn.Linear(self.input_size, self.hidden_size)
            self.linear_2 = torch.nn.Linear(self.hidden_size, 1)
        else:
            self.linear_1 = None
            self.linear_2 = None

    def load(self, hyper_param):
        self.activation = self.activation_function.get(hyper_param['activation'].lower(), torch.nn.ReLU)
        self.output_activation = self.activation_function.get(hyper_param['output_activation'].lower(), torch.nn.Sigmoid)
        self.layer_deep = hyper_param.get('layer_deep', 3)

    def fit(self, hyper_param: dict):


        self.x_train = torch.from_numpy(self.x_train.values).float()
        self.x_test = torch.from_numpy(self.x_test.values).float()
        self.y_train = torch.FloatTensor(self.y_train.values).float()
        self.y_test = torch.FloatTensor(self.y_test.values).float()
        self.layer_deep = hyper_param.get('layer_deep', 3)
        self.activation = self.activation_function.get(hyper_param['activation'].lower(), torch.nn.ReLU)
        self.output_activation = self.activation_function.get(hyper_param['output_activation'].lower(),
                                                              torch.nn.Sigmoid)
        epochs = hyper_param.get('epochs', 50)
        optimizer_function = self.optimizer_function.get(hyper_param['optimizer']['function_name'].lower(),
                                                         torch.optim.Adam)
        loss_function_name = self.loss_function.get(hyper_param['loss_function'].lower(),
                                                    torch.nn.modules.loss.L1Loss)
        loss_function = loss_function_name()
        optimizer = optimizer_function(self.parameters(), lr=hyper_param['optimizer'].get('learning_rate', 0.01))

        try:
            import horovod.torch as hvd
            is_with_horovod = True
        except:
            is_with_horovod = False

        if is_with_horovod:
            print("is_with_horovod")
            print(is_with_horovod)
            train_dataset = TensorDataset(self.x_train, self.y_train)
            # Partition dataset among workers using DistributedSampler
            train_sampler = torch.utils.data.distributed.DistributedSampler(train_dataset, num_replicas=hvd.size(),
                                                                            rank=hvd.rank())

            train_loader = torch.utils.data.DataLoader(train_dataset, sampler=train_sampler)

            # Add Horovod Distributed Optimizer
            optimizer = hvd.DistributedOptimizer(optimizer, named_parameters=self.named_parameters())
            # Broadcast parameters from rank 0 to all other processes.
            hvd.broadcast_parameters(self.state_dict(), root_rank=0)

            for epoch in range(epochs):
                for batch_idx, (data, target) in enumerate(train_loader):
                    self.train()

                    optimizer.zero_grad()

                    train_output = self.forward(data)

                    train_loss = loss_function(train_output.squeeze(), target)

                    if epoch % 100 == 0:
                        print('Train loss at {} is {}'.format(epoch, train_loss.item()))

                    train_loss.backward()
                    optimizer.step()
        else:
            for epoch in range(epochs):
                self.train()

                optimizer.zero_grad()

                train_output = self.forward(self.x_train)

                train_loss = loss_function(train_output.squeeze(), self.y_train)

                if epoch % 100 == 0:
                    print('Train loss at {} is {}'.format(epoch, train_loss.item()))

                train_loss.backward()
                optimizer.step()

        self.eval()
        test_loss = loss_function(torch.squeeze(self(self.x_test)), self.y_test)
        print('After Training, test loss is {}'.format(test_loss.item()))

    def forward(self, input_tensor):
        linear = torch.nn.Linear(self.input_size, self.hidden_size)(input_tensor)

        for i in range(self.layer_deep - 1):
            linear = self.activation()(linear)
            if i != self.layer_deep - 2:
                linear = torch.nn.Linear(self.hidden_size, self.hidden_size)(linear)

        linear = torch.nn.Linear(self.hidden_size, 1)(linear)
        output = self.output_activation()(linear)

        return output

if __name__ == '__main__':
    file_path = '/Users/yong-eunjae/Downloads/ex1_graduate_school_admissions (1).csv'
    file_path = '/Users/yong-eunjae/Downloads/14937.csv'

    df = pd.read_csv(file_path)
    hyper_param = {
            "epochs": 100,
            "loss_function": "BCELoss",
            "one_hot_encoding": True,
            "optimizer": {
                "function_name": "Adam",
                "learning_rate": 0.001,
                "beta_1": 0.9,
                "beta_2": 0.999,
                "epsilon": None,
                "decay": 0.0,
                "amsgrad": False
            },
            "output_activation": "sigmoid",
            "activation": "relu",
            "batch_size": 1,
            "is_deep_learning": True,
            "layer_width": 5,
            "layer_deep": 3
        }

    model = TorchAnn(len(df.columns) - 1, hyper_param['layer_width'])

    model.set_train_data(df, 'smoker__insurance.csv', 17550)

    model.fit(hyper_param)

    torch.save(model.state_dict(), './model.pt')

    new_model = TorchAnn(len(df.columns) - 1, hyper_param['layer_width'])
    new_model.load(hyper_param)

    new_model.load_state_dict(torch.load('./model.pt'))

    # new_model.eval()
    # print(f'예측값 : {new_model(torch.FloatTensor([0, 1])).item()}')`

    print(new_model(torch.FloatTensor([46, 1, 19.95, 2, 3, 9193.8385])).item())
