import os

import numpy as np
import torch
from torch import Tensor
from torch.autograd import Variable
from torch.nn import functional as F

from . import model


class BDCN:
    model_path = f'{os.path.dirname(__file__)}/checkpoints/bdcn_pretrained_on_bsds500.pth'
    # model_path = f'{os.path.dirname(__file__)}/checkpoints/bdcn_pretrained_on_nyudv2_depth.pth'
    # model_path = f'{os.path.dirname(__file__)}/checkpoints/bdcn_pretrained_on_nyudv2_rgb.pth'
    mean_bgr = np.array([104.00699, 116.66877, 122.67892])

    def __init__(
            self,
            model_path: str = None,
            mean_bgr: np.ndarray = np.array([104.00699, 116.66877, 122.67892]),
            device: str = 'cpu'
    ) -> None:
        if model_path is not None:
            self.model_path = model_path
        assert os.path.exists(self.model_path), 'Model-file is not exist.'

        self.device = device
        self.mean_bgr = mean_bgr
        self.model = model.BDCN()
        if self.device == 'cpu':
            self.model.load_state_dict(torch.load(self.model_path, map_location=torch.device('cpu')))
        else:
            self.model.load_state_dict(torch.load(self.model_path))
            self.model.cuda()

    def inference(self, image):
        self.model.eval()
        # data_loader = torch.utils.data.DataLoader(data, batch_size=1, shuffle=False, num_workers=8)
        # for data in data_loader:
        image = self.transform(image)
        if self.device != 'cpu':
            image = image.cuda()

        image = Variable(image, volatile=True)
        out = self.model(image)
        fuse = F.sigmoid(out[-1]).cpu().data.numpy()[0, 0, :, :]
        # fuse[:, 0] = 0
        # fuse[:, -1] = 0
        # fuse[0, :] = 0
        # fuse[-1, :] = 0
        return fuse
    
    def transform(self, image):
        image = np.array(image, dtype=np.float32)
        self.rgb = False
        if self.rgb:
            image = image[:, :, ::-1]  # RGB->BGR
        image -= self.mean_bgr
        # data = []
        # if self.scale is not None:
        #     for scl in self.scale:
        #         image_scale = cv2.resize(image, None, fx=scl, fy=scl, interpolation=cv2.INTER_LINEAR)
        #         data.append(torch.from_numpy(image_scale.transpose((2, 0, 1))).float())
        #     return data

        image = image.transpose((2, 0, 1))
        image = torch.from_numpy(image.copy()).float()
        image = torch.unsqueeze(image, dim=0)
        return image


if __name__ == '__main__':
    import cv2

    filename = '/media/workspace/Projects/DSLabGlobal/contour/data/test/apple_2_1.jpg'
    image = cv2.imread(filename)
    model = BDCN()
    output = model.inference(image)

    import matplotlib.pyplot as plt

    plt.imshow(output)
    plt.show()

