import os

import numpy as np
import torch
from PIL import Image
from torch.utils.data import DataLoader

from program.algorithms.rcf import models
from program.algorithms.rcf.data_loader import BSDS_RCFLoader


def adjust_lr(init_lr, now_it, total_it):
    power = 0.9
    lr = init_lr * (1 - float(now_it) / total_it) ** power
    return lr


def make_optim(model, lr):
    optim = torch.optim.SGD(params=model.parameters(), lr=lr, momentum=0.9, weight_decay=5e-4)
    return optim


def save_ckpt(model, name):
    print('saving checkpoint ... {}'.format(name), flush=True)
    if not os.path.isdir('ckpt'):
        os.mkdir('ckpt')
    torch.save(model.state_dict(), os.path.join('ckpt', '{}.pth'.format(name)))


def save_img(image, path):
    if len(image.shape) == 3:
        image = image.transpose(1, 2, 0).astype(np.uint8)
        image = image[:, :, [2, 1, 0]]
    else:
        image = (image * 255).astype(np.uint8)

    Image.fromarray(image).save(path)


def cross_entropy_loss_RCF(prediction, label):
    label = label.long()
    mask = label.float()
    num_positive = torch.sum((mask == 1).float()).float()
    num_negative = torch.sum((mask == 0).float()).float()

    mask[mask == 1] = 1.0 * num_negative / (num_positive + num_negative)
    mask[mask == 0] = 1.1 * num_positive / (num_positive + num_negative)
    mask[mask == 2] = 0

    # print('num pos', num_positive)
    # print('num neg', num_negative)
    # print(1.0 * num_negative / (num_positive + num_negative), 1.1 * num_positive / (num_positive + num_negative))

    cost = torch.nn.functional.binary_cross_entropy(
        prediction.float(), label.float(), weight=mask, reduce=False)
    return torch.sum(cost) / (num_negative + num_positive)


def train(args):
    device = torch.device('cuda:1')
    model = models.resnet101(pretrained=True).cuda(device)

    init_lr = 1e-2
    batch_size = 3

    train_dataset = BSDS_RCFLoader(split="train")
    # test_dataset = BSDS_RCFLoader(split="test")
    train_loader = DataLoader(train_dataset, batch_size=batch_size, num_workers=8, drop_last=True, shuffle=True)

    model.train()
    total_epoch = 30
    each_epoch_iter = len(train_loader)
    total_iter = total_epoch * each_epoch_iter

    print_cnt = 100
    ckpt_cnt = 10000
    cnt = 0

    for epoch in range(total_epoch):
        avg_loss = 0.
        for i, (image, label) in enumerate(train_loader):

            optim = make_optim(model, adjust_lr(init_lr, cnt, total_iter))
            image, label = image.cuda(device), label.cuda(device)
            outs = model(image, label.size()[2:])

            # total_loss = 0
            total_loss = cross_entropy_loss_RCF(outs[-1], label)
            # for each in outs:
            #     loss = cross_entropy_loss_RCF(each, label)
            #     total_loss += loss
            optim.zero_grad()
            total_loss.backward()
            optim.step()

            avg_loss += float(total_loss)
            if cnt % print_cnt == 0:
                print('[{}/{}] loss:{} avg_loss: {}'.format(cnt, total_iter, float(total_loss), avg_loss / print_cnt),
                      flush=True)
                avg_loss = 0

                # Save
                sample_path = './sample'
                os.makedirs(sample_path, exist_ok=True)

                for index in range(len(image)):
                    origin = image[index].squeeze().detach().cpu().numpy()
                    save_img(origin, os.path.join(sample_path, f'train_ep_{epoch}_origin.png'))

                    l = label[index].squeeze().detach().cpu().numpy()
                    # print(label[index].shape)
                    save_img(l, os.path.join(sample_path, f'train_ep_{epoch}_label.png'))

                for index in range(len(outs)):
                    result = outs[index].squeeze().detach().cpu().numpy()
                    save_img(result, os.path.join(sample_path, f'train_ep_{epoch}_result.png'))

                fuse = outs[-1].squeeze().detach().cpu().numpy()
                save_img(fuse, os.path.join(sample_path, f'train_ep_{epoch}_fuse.png'))

            if cnt % ckpt_cnt == 0:
                save_ckpt(model, 'only-final-lr-{}-iter-{}'.format(init_lr, cnt))

            cnt += 1
