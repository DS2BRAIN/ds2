import argparse
import sys
import threading

import cv2
import numpy as np
from PyQt5.QtCore import Qt, QPoint
from PyQt5.QtGui import QPainter, QPen, QPixmap
from PyQt5.QtWidgets import QApplication, QPushButton, QFileDialog, QGridLayout, QLabel, QWidget, \
    QVBoxLayout, QSlider

# from contour.models.rcf.main import Contour
from contour import Contour
from functools import partial

from contour.utils import calc_polygon_area, plot, draw_contour


class MyApp(QWidget):
    MAGIC_WAND = 0
    POSITIVE_POINT = 1
    NEGATIVE_POINT = 2

    def __init__(self, args):
        super().__init__()

        # self.image_path = args.image_path
        # self.origin_image = cv2.imread(self.image_path, cv2.IMREAD_COLOR)
        # self.result_image = self.origin_image.copy()
        self.set_image(args.image_path)
        self.type = self.MAGIC_WAND

        # Algorithm
        self.algorithm = Contour(model_name=args.model_name, pre_model_name=args.pre_method)

        # Box points
        self.x = 0
        self.y = 0
        self.width = 0
        self.height = 0
        self.last_point = QPoint()
        self.current_point = QPainter()

        # Contour points
        self.contours = []
        self.positive_points = []
        self.negative_points = []
        self.superpixel_lines = []

        # User Interactive values
        self.threshold = 0.35
        self.threshold_temp = self.threshold
        self.is_pressing_slider = False
        self.is_drawing = False

        self.init_ui()

    def init_ui(self):
        background_layout = QGridLayout()
        background_layout.setColumnStretch(0, 7)
        background_layout.setColumnStretch(1, 3)
        self.setLayout(background_layout)

        # Left Image
        self.image_layout = QLabel()
        self.image = QPixmap(self.image_path)
        self.image_layout.setPixmap(self.image)
        self.image_layout.mousePressEvent = self.mouse_press
        self.image_layout.mouseMoveEvent = self.mouse_move
        self.image_layout.mouseReleaseEvent = self.mouse_release
        self.image_layout.setPixmap(self.image)

        # Right box
        right_box = QVBoxLayout()
        right_box.setAlignment(Qt.AlignTop)

        btn_load_image = QPushButton('Load image')
        btn_magic_wand = QPushButton('Magic-Wand')
        btn_positive_point = QPushButton('Positive Point')
        btn_negative_point = QPushButton('Negative Point')
        btn_load_image.clicked.connect(partial(self.show_dialog))
        btn_magic_wand.clicked.connect(partial(self.change_type, self.MAGIC_WAND))
        btn_positive_point.clicked.connect(partial(self.change_type, self.POSITIVE_POINT))
        btn_negative_point.clicked.connect(partial(self.change_type, self.NEGATIVE_POINT))

        # Slider
        slider_threshold = QSlider(Qt.Horizontal)
        slider_threshold.setRange(0, 100)
        slider_threshold.setValue(self.threshold * 100)
        slider_threshold.setSingleStep(1)
        slider_threshold.setPageStep(1)
        slider_threshold.valueChanged.connect(partial(self.set_threshold_value, 'threshold'))
        slider_threshold.sliderPressed.connect(partial(self.pressed_slider, 'threshold'))
        slider_threshold.sliderReleased.connect(partial(self.released_slider, 'threshold'))

        right_box.addWidget(btn_load_image)
        right_box.addWidget(btn_magic_wand)
        right_box.addWidget(btn_positive_point)
        right_box.addWidget(btn_negative_point)
        right_box.addWidget(slider_threshold)

        background_layout.addWidget(self.image_layout, 0, 0)
        background_layout.addLayout(right_box, 0, 1)

        self.setWindowTitle('QGridLayout')
        self.setGeometry(300, 300, 300, 200)
        self.show()

    def show_dialog(self):
        file_info = QFileDialog.getOpenFileName(self, 'Open file', './', '*.png, *.jpt')
        self.image_name = file_info[0]
        self.set_image(self.image_name)

    def set_image(self, image_path):
        self.image_path = image_path
        self.origin_image = cv2.imread(image_path, cv2.IMREAD_COLOR)
        self.result_image = self.origin_image.copy()

        self.image = QPixmap(self.image_path)
        # self.resize(self.image.width(), self.image.height())

        # self.update()

    def change_type(self, type):
        self.type = type
        if type == self.NEGATIVE_POINT:
            self.superpixel()
            self.draw_contour()

    def mouse_press(self, event):
        if event.button() == Qt.LeftButton:
            point = event.pos()
            if self.type == self.MAGIC_WAND:
                self.is_drawing = True
                self.last_point = point
                self.positive_points = []
                self.negative_points = []
            elif self.type == self.POSITIVE_POINT:
                self.run_positive_point(point)
            elif self.type == self.NEGATIVE_POINT:
                self.run_negative_point(point)

    def mouse_move(self, event):
        if event.buttons() == Qt.LeftButton and self.is_drawing:
            self.current_point = event.pos()
            self.calc_rect_point()
            self.draw_rect()

    def mouse_release(self, event):
        if self.is_drawing:
            self.is_drawing = False

            th = threading.Thread(target=self.run_algorithm, args=())
            th.start()

    def pressed_slider(self, slider_type):
        if slider_type == 'threshold':
            self.threshold_temp = self.threshold

    def released_slider(self, slider_type):
        if slider_type == 'threshold' and self.threshold_temp != self.threshold:
            if self.contours:
                self.contours.pop()
            self.run_algorithm()

    def set_threshold_value(self, slider_type, value):
        if slider_type == 'threshold':
            self.threshold = value / 100

    def calc_rect_point(self):
        self.x = self.last_point.x() if self.last_point.x() < self.current_point.x() else self.current_point.x()
        self.y = self.last_point.y() if self.last_point.y() < self.current_point.y() else self.current_point.y()
        self.width = abs(self.last_point.x() - self.current_point.x())
        self.height = abs(self.last_point.y() - self.current_point.y())

    def draw_rect(self):
        self.image = QPixmap(self.image_path)
        painter = QPainter(self.image)
        painter.setPen(QPen(Qt.red, 3, Qt.SolidLine))
        painter.drawRect(self.x, self.y, self.width, self.height)
        self.image_layout.setPixmap(self.image)
        self.update()

    def draw_contour(self):
        image = cv2.cvtColor(self.origin_image.copy(), cv2.COLOR_RGB2RGBA)
        # image = self.origin_image.copy()

        if len(self.superpixel_lines) > 0:
            new_line_mask = self.superpixel_lines.copy() == 1
            crop_image = image[self.y:self.y + self.height, self.x:self.x + self.width, :]
            crop_image[:, :, 3][new_line_mask] = 100

        for point in self.positive_points:
            image = cv2.drawMarker(image, tuple(point), (0, 0, 255, 255), markerType=cv2.MARKER_TRIANGLE_UP)

        for point in self.negative_points:
            image = cv2.drawMarker(image, tuple(point), (255, 0, 0, 255), markerType=cv2.MARKER_TRIANGLE_DOWN)

        image = cv2.drawContours(image, self.contours, -1, (0, 255, 0, 255), 2)
        cv2.imwrite('result.png', image)
        self.image_path = 'result.png'
        self.image = QPixmap(self.image_path)
        self.image_layout.setPixmap(self.image)

    def superpixel(self):
        crop_image = self.origin_image[self.y:self.y + self.height, self.x:self.x + self.width, :].copy()
        crop_height, crop_width, _ = crop_image.shape

        # self.superpixel_lines = self.algorithm.superpixel(crop_image)
        self.superpixel_lines = self.algorithm.get_object_area(crop_image)
        self.draw_contour()

    def run_algorithm(self):
        """
        1. U2net            : u2net's Threshold
        2. BDCN             : bdcn's Threshold
        3. (U2net - BDCN)   :

        Positive & Negative point
        1. (Image - BDCN) => U2net : Negative points

        """

        # Get contour point (최종 윤곽선 좌표 가져옴)
        contour = self.algorithm.get_contour_point(
            image=self.origin_image,
            x=self.x,
            y=self.y,
            width=self.width,
            height=self.height,
            thresh=self.threshold,
            is_apply_pre_model=False
        )

        if len(contour) > 0:
            # 이미지에 윤곽선 그리기
            self.contours.append(contour[0])
            self.draw_contour()

    def run_positive_point(self, point):
        self.positive_points.append([point.x(), point.y()])
        self.apply_negative_points()

    def run_negative_point(self, point):
        from skimage.segmentation import flood, flood_fill
        self.negative_points.append([point.x(), point.y()])
        self.apply_negative_points()

    def apply_negative_points(self):
        contour = self.algorithm.update_contour_with_points(image=self.origin_image, x=self.x, y=self.y,
                                                            width=self.width, height=self.height,
                                                            contour_point=self.contours[-1],
                                                            positive_points=self.positive_points,
                                                            negative_points=self.negative_points)

        # contour = self.algorithm.update_contour_with_superpixel(
        #     image=self.origin_image,
        #     x=self.x,
        #     y=self.y,
        #     width=self.width,
        #     height=self.height,
        #     contour_point=self.contours[-1],
        #     positive_points=self.positive_points,
        #     negative_points=self.negative_points
        # )

        #
        if len(contour) > 0:
            self.contours.pop()
            self.contours.append(contour[0])
            self.draw_contour()


parser = argparse.ArgumentParser(description='')
parser.add_argument('--image-path', type=str, default='../data/test/apple_2.jpg', help='Image Path')

# pre-method
parser.add_argument('--pre-method', type=str, default='bdcn')
# parser.add_argument('--pre-method', type=str, default='u2net')

# post-method
# parser.add_argument('--model-name', type=str, default='rcf')
parser.add_argument('--model-name', type=str, default='u2net')
# parser.add_argument('--model-name', type=str, default='bdcn')

args = parser.parse_args()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    ex = MyApp(args)
    app.exec()
    # sys.exit(app.exec())
