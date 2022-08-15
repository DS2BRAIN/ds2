from models.helper import Helper
from src.util import Util

class ManageBaseClass:
    def __init__(self):
        self.db_class = Helper(init=True)
        self.util_class = Util()
        self.s3 = self.util_class.getBotoClient('s3')