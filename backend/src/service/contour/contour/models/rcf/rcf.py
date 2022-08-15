import argparse
import os

import cv2
import torch
import numpy as np
from PIL import Image

from . import models
from .data_loader import RCFLoader


class RCF:
    model_path = f'{os.path.dirname(__file__)}/checkpoints/only-final-lr-0.01-iter-490000.pth'

    def __init__(self, model_path=None, device='cpu'):
        if model_path is not None:
            self.model_path = model_path

        assert os.path.exists(self.model_path), 'Model-file is not exist.'

        self.device = device
        self.model = models.resnet101(pretrained=False)
        if self.device != 'cpu':
            self.model = self.model.cuda(self.device)

        self.model.eval()

        # resume..
        checkpoint = torch.load(self.model_path, map_location=self.device)
        self.model.load_state_dict(checkpoint)

    def forward(self, x):
        image, original_img = RCFLoader.img2data(x)

        h, w = original_img.size()[2:]
        if self.device != 'cpu':
            image = image.cuda(self.device)

        #
        outs = self.model(image, (h, w))
        return outs, original_img

    def inference(self, x, result_idx=-1):
        result_idx = -1
        outputs, original_img = self.forward(x)
        fuse = outputs[result_idx].squeeze().detach().cpu().numpy()
        fuse[:, 0] = 0
        fuse[:, -1] = 0
        fuse[0, :] = 0
        fuse[-1, :] = 0

        return fuse
        # outputs.append(original_img)

        # if len(file_name) > 0:
        #     file_idx = 0
        #     for output in outputs:
        #         output = output.squeeze().detach().cpu().numpy()
        #         if len(output.shape) == 3:
        #             output = output.transpose(1, 2, 0).astype(np.uint8)
        #             output = output[:, :, [2, 1, 0]]
        #             # Image.fromarray(result).save(os.path.join(self.all_folder, '{}-img.jpg'.format(file_name)))
        #         else:
        #             output = (output * 255).astype(np.uint8)
        #             # Image.fromarray(result).save(os.path.join(self.all_folder, '{}-{}.png'.format(file_name, file_idx)))
        #
        #         output = Image.fromarray(output)
        #         file_idx += 1
        #
        # return fuse


def main(args):
    rcf = RCF(args)
    image = np.array(cv2.imread(os.path.join('../../../data/test/image_2_1.jpg')), dtype=np.float32)
    output = rcf.inference(image)

    import matplotlib.pyplot as plt
    plt.imshow(output)
    plt.show()

    # test(args)
    # if args.phase == 'train':
    #     train(args)
    # else:
    #     test()


if __name__ == '__main__':
    main(None)
