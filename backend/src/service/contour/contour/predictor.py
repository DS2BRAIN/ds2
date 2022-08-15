__all__ = ['Contour']

import os

import cv2
import numpy as np
from skimage.segmentation import slic
from skimage.segmentation import mark_boundaries
from skimage.morphology import flood_fill
from scipy.ndimage import distance_transform_edt

from .config import ContourMethodType
from .models.bdcn.bdcn import BDCN
from .models.rcf.rcf import RCF
from .models.u2net.u2net import U2Net
from .utils import calc_polygon_area, plot


# from contour.config import ContourMethodType
# from contour.models.bdcn.bdcn import BDCN
# from contour.models.rcf.rcf import RCF
# from contour.models.u2net.u2net import U2Net
# from contour.utils import calc_polygon_area, plot


class Contour:
    """
    Contour class


    """

    model_dict: dict = {
        'u2net': U2Net,
        'rcf': RCF,
        'bdcn': BDCN,
    }

    def __init__(
            self,
            model_name: str = 'u2net',
            model_path: str = None,
            pre_model_name: str = 'bdcn',
            pre_model_path: str = None,
            device: str = 'cpu'
    ) -> None:
        assert model_name in self.model_dict.keys(), f'Not found model name ({model_name})'
        assert pre_model_name is None or pre_model_name in self.model_dict.keys(), f'Not found preprocess model name ({pre_model_name})'

        # Load model (model and preprocess model)
        self.maxval = 1
        self.model_name = model_name
        self.model_path = model_path
        self.device = device
        self.model = self.model_dict[model_name](model_path=model_path, device=device)

        # pre-model
        self.pre_model_name = pre_model_name
        self.pre_model_path = pre_model_path
        self.pre_model = None
        if pre_model_name is not None:
            self.pre_model = self.model_dict[pre_model_name](model_path=pre_model_path, device=device)

    def get_contour_point(
            self,
            image: np.ndarray,
            x: int,
            y: int,
            width: int,
            height: int,
            thresh: float = 0.35,
            is_apply_pre_model: bool = False,
            pre_threshold: float = 0.7,
    ) -> np.ndarray:
        assert is_apply_pre_model is False or (is_apply_pre_model and self.pre_model is not None), \
            f'If is_apply_pre_model is True, pre_model must be not None.'

        # Check points
        image_height, image_width = image.shape[:2]
        x, y = np.median((0, x, image_width)).astype(int), np.median((0, y, image_height)).astype(int)
        width, height = min(width, image_width - x), min(height, image_height - y)
        if width <= 0 or height <= 0:
            return np.array([])

        # Crop image
        crop_image = image[y:y + height, x:x + width, :]
        crop_height, crop_width, _ = crop_image.shape

        # Inference the model (post-method)
        post_output = self.model.inference(crop_image)
        if is_apply_pre_model:
            # pre-method
            pre_output = self.pre_model.inference(crop_image)
            _, pre_binary = cv2.threshold(pre_output, pre_threshold, self.maxval, cv2.THRESH_BINARY)
            post_output -= pre_binary

        # Find contour points
        selected_contour = self.image2contour(post_output, thresh, self.maxval)
        if is_apply_pre_model:
            contour_mask = self.poly2mask(selected_contour, post_output.shape[1], post_output.shape[0])
            contour_mask = self.expand_labels(contour_mask, distance=5)
            selected_contour = self.image2contour(contour_mask, thresh, self.maxval)

        if selected_contour is None:
            return np.array([])

        # Rollback contour point to original image
        selected_contour[:, 0] += x
        selected_contour[:, 1] += y

        return selected_contour

    def image2contour(self, image, thresh, mode=cv2.RETR_EXTERNAL, method=cv2.CHAIN_APPROX_SIMPLE):
        # Create a binary threshold image
        _, binary = cv2.threshold(image, thresh, self.maxval, cv2.THRESH_BINARY)

        # Find contour points
        # contours, hierarchy = cv2.findContours(image.astype("int32"), cv2.RETR_FLOODFILL, cv2.CHAIN_APPROX_SIMPLE)
        # contours, hierarchy = cv2.findContours(image.astype("uint8"), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        contours, hierarchy = cv2.findContours(image=binary.astype("uint8"), mode=mode, method=method)

        # Select largest contour
        selected_contour = None
        selected_contour_area = 0
        for index, contour in enumerate(contours):
            contour = np.reshape(contour, (-1, 2))
            if len(contour) < 3:
                continue

            area = calc_polygon_area(contour)
            if selected_contour_area == 0 or selected_contour_area < area:
                selected_contour = contour
                selected_contour_area = area

        return selected_contour

    @classmethod
    def get_model_path(cls, model_name: str = 'u2net'):
        assert model_name in cls.model_dict.keys(), 'Not found model name'
        return cls.model_dict[model_name].model_path

    @staticmethod
    def get_contour_type(type_name: int = ContourMethodType.U2NET):
        type_info = {
            ContourMethodType.U2NET: {'model_name': 'u2net', 'pre_model_name': None, 'is_apply_pre_model': False},
            ContourMethodType.BDCN: {'model_name': 'bdcn', 'pre_model_name': None, 'is_apply_pre_model': False},
            ContourMethodType.COMBINED: {'model_name': 'u2net', 'pre_model_name': 'bdcn', 'is_apply_pre_model': True}
        }

        return type_info.get(type_name, type_info[ContourMethodType.U2NET])

    def mask2poly(self, mask):
        mask = mask.astype("uint8")
        polys, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        return polys

    def poly2mask(self, polygon, image_width, image_height):
        img = np.zeros((image_height, image_width), np.uint8)
        mask = cv2.fillPoly(img, [np.array(polygon)], (1, 1, 1))
        return mask

    def flood_fill(self, image, points, offset_point=(0, 0)):
        height, width = image.shape[:2]

        combined_filled_image = np.zeros((height, width), dtype=np.float32)
        for point in points:
            point = (point[1] - offset_point[1], point[0] - offset_point[0])  # (y, x)
            if (0 <= point[0] <= height and 0 <= point[1] <= width) and image[point] == 0:
                filled_image = flood_fill(image, point, 255, tolerance=0.6, selem=None, connectivity=None)
                filled_image[filled_image != 255] = 0
                combined_filled_image += filled_image

        # Apply blur and negative area
        kernel_size = (5, 5)
        kernel = np.ones(kernel_size, np.float32) * 255
        combined_filled_image = cv2.filter2D(combined_filled_image, -1, kernel)
        combined_filled_image[combined_filled_image >= 255] = 255
        return combined_filled_image

    def get_object_area(self, image: np.ndarray, model_name: str = 'bdcn', threshold: float = 0.4):
        assert model_name in self.model_dict.keys(), f'Not found model name ({model_name})'

        if self.pre_model_name == model_name:
            model = self.pre_model
        elif self.model_name == model_name:
            model = self.model
        else:
            model = self.model_dict[model_name]()

        # Get negative area
        output = model.inference(image)
        _, binary = cv2.threshold(output, threshold, self.maxval, cv2.THRESH_BINARY)
        return binary

    def superpixel(
            self,
            image: np.ndarray,
            num_segment: int = 100,
            sigma: int = 5
    ):
        image_height, image_weight = image.shape[:2]
        empty_image = np.zeros((image_height, image_weight))

        segments = slic(image, n_segments=num_segment, sigma=sigma)
        return mark_boundaries(empty_image, segments).astype(np.float32)

    def update_contour_with_superpixel(
            self,
            image: np.ndarray,
            x: int,
            y: int,
            width: int,
            height: int,
            contour_points: list,
            positive_points: list = (),
            negative_points: list = (),
            thresh: float = 0.35
    ):
        crop_image = image[y:y + height, x:x + width, :].copy()
        crop_height, crop_width, _ = crop_image.shape

        superpixel_image = cv2.cvtColor(self.superpixel(crop_image), cv2.COLOR_RGB2GRAY)
        filled_positive_image = self.flood_fill(superpixel_image, positive_points, offset_point=(x, y))
        filled_negative_image = self.flood_fill(superpixel_image, negative_points, offset_point=(x, y))
        plot(filled_negative_image)
        contour_mask = self.poly2mask(contour_points, image.shape[1], image.shape[0])
        contour_mask = contour_mask[y:y + height, x:x + width].copy()
        contour_mask[np.where(filled_negative_image == 255)] = 0
        contour_mask[np.where(filled_positive_image == 255)] = 1

        selected_contour = self.image2contour(contour_mask, thresh)
        if selected_contour is None:
            return np.array([])

        # Rollback contour point to original image point
        selected_contour[:, 0] += x
        selected_contour[:, 1] += y

        return selected_contour

    def update_contour_with_points(
            self,
            image: np.ndarray,
            x: int,
            y: int,
            width: int,
            height: int,
            contour_points: list,
            positive_points: list = (),
            negative_points: list = (),
            thresh: float = 0.35,
            priority: str = 'negative',
    ):
        crop_image = image[y:y + height, x:x + width, :].copy()
        crop_height, crop_width, _ = crop_image.shape

        # combined_filled_image_rgb = cv2.cvtColor(filled_image, cv2.COLOR_RGB2GRAY)
        # if len(contour_point) == 0:
        #     contour_mask = self.model.inference(crop_image)
        contour_mask = self.poly2mask(contour_points, image.shape[1], image.shape[0])
        contour_mask = contour_mask[y:y + height, x:x + width].copy()

        # Get negative area
        pre_output = self.get_object_area(crop_image, model_name='bdcn')
        filled_positive_image = self.flood_fill(pre_output, positive_points, offset_point=(x, y))
        filled_negative_image = self.flood_fill(pre_output, negative_points, offset_point=(x, y))

        if priority == 'negative':
            contour_mask[np.where(filled_positive_image == 255)] = 1
            contour_mask[np.where(filled_negative_image == 255)] = 0
        elif priority == 'positive':
            contour_mask[np.where(filled_negative_image == 255)] = 0
            contour_mask[np.where(filled_positive_image == 255)] = 1

        # _, pre_output_binary = cv2.threshold(pre_output, 0.8, 1, cv2.THRESH_BINARY)
        # combined_filled_image_rgb = cv2.cvtColor(combined_filled_image, cv2.COLOR_RGB2GRAY)
        # contour_mask = self.poly2mask(contour_point, image.shape[1], image.shape[0])
        # contour_mask = contour_mask[y:y + height, x:x + width].copy()
        # contour_mask[np.where(combined_filled_image_rgb == 255)] = 0

        selected_contour = self.image2contour(image=contour_mask, thresh=thresh)
        if selected_contour is None:
            return np.array([])

        # Rollback contour point to original image point
        selected_contour[:, 0] += x
        selected_contour[:, 1] += y

        return selected_contour

    def expand_labels(self, label_image, distance=1):
        distances, nearest_label_coords = distance_transform_edt(
            label_image == 0, return_indices=True
        )
        labels_out = np.zeros_like(label_image)
        dilate_mask = distances <= distance
        masked_nearest_label_coords = [
            dimension_indices[dilate_mask]
            for dimension_indices in nearest_label_coords
        ]
        nearest_labels = label_image[tuple(masked_nearest_label_coords)]
        labels_out[dilate_mask] = nearest_labels
        return labels_out


if __name__ == '__main__':
    model_name = 'u2net'
    contour = Contour(model_name)

    # p_image = cv2.imread(os.path.join('../data/test/apple_2_2.jpg'))
    # p_height, p_width = p_image.shape[:2]
    # output = contour.get_contour_point(p_image, 0, 0, p_width, p_height)
    # mask = contour.poly2mask(output, p_width, p_height)
    # plot(mask)
    p_x, p_y, p_width, p_height = (254, 32, 330, 343)
    p_negative_points = [[293, 282], [295, 123]]
    p_image = cv2.imread(os.path.join('../data/test/apple_2.jpg'))

    contour_points = contour.get_contour_point(p_image, p_x, p_y, p_width, p_height, is_apply_pre_model=True)
    contour_points = contour.update_contour_with_points(p_image, p_x, p_y, p_width, p_height, contour_points,
                                                        p_negative_points)

    p_image = cv2.drawContours(p_image, contour_points, -1, (0, 255, 0), 2)
    plot(p_image)
