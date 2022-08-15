import argparse
import os

import cv2
import torch
import numpy as np
from PIL import Image

from src.util import Util
from src.rcf import models
from src.rcf.data_loader import RCFLoader
# from program.algorithms.rcf.train import train
# from program.algorithms.rcf.test import test

class RCF:
    def __init__(self, args):

        # Init Variable
        self.args = args
        self.current_dir = os.path.dirname(__file__)

        # Init Folder Path
        result_dir = os.path.join(self.current_dir, 'results', args.result)
        self.all_folder = os.path.join(result_dir, 'all')
        self.png_folder = os.path.join(result_dir, 'png')

        os.makedirs(result_dir, exist_ok=True)
        os.makedirs(self.all_folder, exist_ok=True)
        os.makedirs(self.png_folder, exist_ok=True)

        self.is_gpu = torch.cuda.is_available()
        self.device = torch.device('cuda') if self.is_gpu else torch.device('cpu')

        # self.device = torch.device('cpu')
        self.model = models.resnet101(pretrained=False)
        if self.is_gpu:
            self.model = self.model.cuda(self.device)

        self.model.eval()

        # resume..
        modelPath = os.path.join(self.current_dir, 'ckpt', args.model)
        if not os.path.exists(modelPath):
            self.utilClass = Util()
            self.s3 = self.utilClass.getBotoClient('s3')
            serverModelFilePath = f'asset/{args.model}'
            self.s3.download_file(self.utilClass.bucket_name, serverModelFilePath, modelPath)

        checkpoint = torch.load(modelPath, map_location=self.device)
        self.model.load_state_dict(checkpoint)



    def forward(self, x):
        image, original_img = RCFLoader.img2data(x)

        h, w = original_img.size()[2:]
        if self.is_gpu:
            image = image.cuda(self.device)

        #
        outs = self.model(image, (h, w))
        return outs, original_img

    def predict(self, x, file_name='', result_idx=-1):
        outs, original_img = self.forward(x)
        fuse = outs[result_idx].squeeze().detach().cpu().numpy()
        fuse = (fuse * 255).astype(np.uint8)

        outs.append(original_img)

        if len(file_name) > 0:
            file_idx = 0
            for result in outs:
                result = result.squeeze().detach().cpu().numpy()
                if len(result.shape) == 3:
                    result = result.transpose(1, 2, 0).astype(np.uint8)
                    result = result[:, :, [2, 1, 0]]
                    Image.fromarray(result).save(os.path.join(self.all_folder, '{}-img.jpg'.format(file_name)))
                else:
                    result = (result * 255).astype(np.uint8)
                    Image.fromarray(result).save(os.path.join(self.all_folder, '{}-{}.png'.format(file_name, file_idx)))

                file_idx += 1

            # fuse = (fuse * 255).astype(np.uint8)
            # Image.fromarray(fuse).save(os.path.join(self.png_folder, '{}.png'.format(file_name)))
        # io.savemat(os.path.join(mat_folder, '{}.mat'.format(name)), {'result': fuse})

        return fuse


def main(args):
    rcf = RCF(args)
    image = np.array(cv2.imread(os.path.join('../../data', args.dataset, 'test', 'image_1.jpg')), dtype=np.float32)
    rcf.predict(image, 'test')

    # test(args)
    # if args.phase == 'train':
    #     train(args)
    # else:
    #     test()


if __name__ == '__main__':
    class modelArgs():
        phase = 'train'
        epoch = 100
        dataset = 'my_data'
        model = 'contour.pth'  # https://aimakerdslab.s3.ap-northeast-2.amazonaws.com/asset/contour.pth
        result = 'my_data'

    RCF(modelArgs())
