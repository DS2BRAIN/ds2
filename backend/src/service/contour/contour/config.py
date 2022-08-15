
class ContourMethodType:
    U2NET = 0
    BDCN = 1
    COMBINED = 2

    @staticmethod
    def get_type_list():
        type_list = []
        for attribute in dir(ContourMethodType):
            attribute_value = getattr(ContourMethodType, attribute)
            if not callable(attribute_value) and not attribute.startswith("__"):
                type_list.append(attribute_value)

        return type_list
