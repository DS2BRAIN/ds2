import cv2
import numpy as np


def calc_polygon_area(points):
    return 0.5 * np.abs(np.dot(points[:, 0], np.roll(points[:, 1], 1))
                        - np.dot(points[:, 1], np.roll(points[:, 0], 1)))


def draw_contour(img, contours):
    image = cv2.drawContours(img, contours, -1, (255, 255, 0), 2)
    plot(image)


def plot(img, title=None):
    import matplotlib.pyplot as plt
    plt.imshow(img)

    if title is not None:
        plt.title(title)

    plt.show()
