class noneObject:
    def __init__(self):
        self.__dict__ = {'__data__': None}

    def get(self, key, default=None):
        return None
