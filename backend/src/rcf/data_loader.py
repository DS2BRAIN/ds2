# borrowed from https://github.com/meteorshowers/RCF-pytorch
import torch
from torch.utils import data
import os
from os.path import join, abspath, splitext, split, isdir, isfile
from PIL import Image
import numpy as np
import cv2


def prepare_image_PIL(im):
    im = im[:, :, ::-1] - np.zeros_like(im)  # rgb to bgr
    # im -= np.array((104.00698793,116.66876762,122.67891434))
    im = np.transpose(im, (2, 0, 1))  # (H x W x C) to (C x H x W)
    return im


def prepare_image_cv2(im):
    # im -= np.array((104.00698793,116.66876762,122.67891434))
    im = cv2.resize(im, dsize=(1024, 1024), interpolation=cv2.INTER_LINEAR)
    im = np.transpose(im, (2, 0, 1))  # (H x W x C) to (C x H x W)
    return im


class BSDS_RCFLoader(data.Dataset):
    """
    Dataloader BSDS500
    """

    # def __init__(self, root='{self.utilClass.save_path}/HED-BSDS_PASCAL', split='train', transform=False):
    def __init__(self, dataset='my_data', split='train', transform=False):
        self.root = os.path.join('../../data', dataset)
        self.split = split
        self.transform = transform
        # self.bsds_root = join(root, 'HED-BSDS')
        self.bsds_root = self.root
        if self.split == 'train':
            self.filelist = join(self.root, 'bsds_pascal_train_pair.lst')
        elif self.split == 'test':
            self.filelist = join(self.root, 'test.lst')
        else:
            raise ValueError("Invalid split type!")
        with open(self.filelist, 'r') as f:
            self.filelist = f.readlines()

    def __len__(self):
        return len(self.filelist)

    def __getitem__(self, index):
        r = np.random.randint(0, 100000)
        if self.split == "train":
            img_file, lb_file = self.filelist[index].split()
            lb = np.array(Image.open(join(self.root, lb_file)), dtype=np.float32)

            # print('max before', np.max(lb))
            # Image.fromarray(lb.astype(np.uint8)).save('debug/{}-label.png'.format(r))
            if lb.ndim == 3:
                lb = np.squeeze(lb[:, :, 0])
            assert lb.ndim == 2
            lb = cv2.resize(lb, (256, 256), interpolation=cv2.INTER_LINEAR)
            # print('max after', np.max(lb))
            # Image.fromarray(lb.astype(np.uint8)).save('debug/{}-resized-label.png'.format(r))

            # print('debug resize label', 'haha', (lb >= 128).sum())

            lb = lb[np.newaxis, :, :]
            lb[lb == 0] = 0
            lb[np.logical_and(lb > 0, lb < 64)] = 2
            lb[lb >= 64] = 1
            # lb[lb >= 128] = 1

        else:
            img_file = self.filelist[index].rstrip()

        if self.split == "train":
            img = np.array(cv2.imread(join(self.root, img_file)), dtype=np.float32)
            # Image.fromarray(img.astype(np.uint8)).save('debug/{}-img.jpg'.format(r))
            img = prepare_image_cv2(img)
            return img, lb
        else:
            original_img = np.array(cv2.imread(join(self.bsds_root, img_file)), dtype=np.float32)
            img = prepare_image_cv2(original_img)
            original_img = original_img.transpose(2, 0, 1)
            return img, original_img, img_file


class RCFLoader(data.Dataset):
    """
    Dataloader
    """

    def __init__(self, dataset='my_data', split='train'):
        self.dataset_dir = os.path.join('../../data', dataset)
        self.split = split

        file_name = os.path.join(self.dataset_dir, f'{split}.lst')
        with open(file_name, 'r') as f:
            self.file_list = f.readlines()

    def __len__(self):
        return len(self.file_list)

    def __getitem__(self, index):
        r = np.random.randint(0, 100000)
        if self.split == "train":
            img_file, lb_file = self.file_list[index].split()
            lb = np.array(Image.open(join(self.dataset_dir, lb_file)), dtype=np.float32)

            if lb.ndim == 3:
                lb = np.squeeze(lb[:, :, 0])
            assert lb.ndim == 2
            lb = cv2.resize(lb, (256, 256), interpolation=cv2.INTER_LINEAR)
            lb = lb[np.newaxis, :, :]
            lb[lb == 0] = 0
            lb[np.logical_and(lb > 0, lb < 64)] = 2
            lb[lb >= 64] = 1
            # lb[lb >= 128] = 1

        else:
            img_file = self.file_list[index].rstrip()

        if self.split == "train":
            img = np.array(cv2.imread(join(self.dataset_dir, img_file)), dtype=np.float32)
            img = prepare_image_cv2(img)
            return img, lb
        else:
            original_img = np.array(cv2.imread(join(self.bsds_root, img_file)), dtype=np.float32)
            img = prepare_image_cv2(original_img)
            original_img = original_img.transpose(2, 0, 1)
            return img, original_img, img_file

    @staticmethod
    def img2data(image):
        image = np.array(image, dtype=np.float32)
        img = np.expand_dims(prepare_image_cv2(image), axis=0)
        original_img = np.expand_dims(image.transpose(2, 0, 1), axis=0)
        return torch.from_numpy(img), torch.from_numpy(original_img)
