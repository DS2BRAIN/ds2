import os
from glob import glob

import torch
from skimage import transform
from torch.autograd import Variable
from torchvision import transforms

from .data_loader import RescaleT, ToTensorLab
from .model import U2NETP
import urllib
import urllib.request

class U2Net:
    model_path = f'/opt/u2netp.pth'
    if not os.path.exists(model_path):
        try:
            urllib.request.urlretrieve("https://aimakerdslab.s3.ap-northeast-2.amazonaws.com/asset/u2netp.pth", model_path)
        except:
            pass
    # model_path = f'{os.path.dirname(__file__)}/checkpoints/u2net.pth'

    def __init__(
            self,
            model_path: str = None,
            transform_size: int = 320,  # please keep the input size as 320x320 to guarantee the performance.
            device: str = 'cpu'):
        if model_path is not None:
            self.model_path = model_path

        assert os.path.exists(self.model_path), 'Model-file is not exist.'

        self.device = device
        self.model = U2NETP(3, 1)
        # self.model = U2NET(3, 1)
        if self.device == 'cpu':
            self.model.load_state_dict(torch.load(self.model_path, map_location=torch.device('cpu')))
        else:
            self.model.load_state_dict(torch.load(self.model_path))
            self.model.cuda()

        self.transform = transforms.Compose([RescaleT(transform_size), ToTensorLab(flag=0)])

    def normalize_predict(self, data):
        ma = torch.max(data)
        mi = torch.min(data)

        dn = (data - mi) / (ma - mi)

        return dn

    def inference(self, data):
        self.model.eval()

        # rescale = RescaleT(1, 2, 320)
        # to_tensor = ToTensorLab(flag=0)
        # img = to_tensor(rescale(data)).float()
        # img = io.imread(data)

        origin_height, origin_width = data.shape[:2]
        img = self.transform(data).float()
        img = torch.unsqueeze(img, dim=0)

        if self.device != 'cpu':
            img = img.cuda()

        img = Variable(img)
        d1, d2, d3, d4, d5, d6, d7 = self.model(img)

        # normalization
        pred = d1[:, 0, :, :]
        morm_predict = self.normalize_predict(pred)

        # output
        output = morm_predict.squeeze(dim=0).cpu().detach().numpy()
        output = transform.resize(output, (origin_height, origin_width), mode='constant')

        return output


if __name__ == '__main__':
    import matplotlib.pyplot as plt
    import cv2

    model = U2Net(device='cpu')

    data_dir = '../../../data/test/*'
    for filename in glob(data_dir):
        data = cv2.imread(filename)
        output = model.inference(data)
        plt.imshow(output)
        plt.show()
