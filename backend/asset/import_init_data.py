from asset.init_data import init_data_json
from models.helper import Helper


class ImportInitData():

    def __init__(self):

        self.dbClass = Helper(init=True)

    def start(self):
        data = init_data_json
        print("check init data")
        if not self.dbClass.getInstances():
            print("import instance data")
            for instance in data['instances']:
                try:
                    self.dbClass.createInstance(instance)
                except:
                    pass
        if not self.dbClass.getUsageplans():
            print("import usageplan data")
            for model in data['usageplans']:
                try:
                    self.dbClass.createUsageplan(model)
                except:
                    pass

        if not self.dbClass.getOneModelById(data['models'][0]['id']):
            print("import model data")
            for model in data['models']:
                try:
                    self.dbClass.createModel(model)
                except:
                    pass
        if not self.dbClass.getOneMarketModelById(data['marketmodels'][0]['id']):
            print("import market model data")
            for model in data['marketmodels']:
                try:
                    self.dbClass.createMarketModel(model)
                except:
                    pass

        if not self.dbClass.getOneMarketProjectById(data['marketprojects'][0]['id']):
            print("import market project data")
            for project in data['marketprojects']:
                try:
                    self.dbClass.createMarketProject(project)
                except:
                    pass

        if not self.dbClass.getAdminKey():
            print("import admin data")
            for admin in data['skyhub_administrator']:
                try:
                    self.dbClass.createAdmin(admin)
                except:
                    pass

        if not self.dbClass.getOneDataconnectortypeById(data['dataconnectortypes'][0]['id']):
            print("import dataconnectortype data")
            for dataconnector in data['dataconnectortypes']:
                try:
                    self.dbClass.createDataconnectortype(dataconnector)
                except:
                    pass

        if not self.dbClass.getOneDataconnectorById(data['dataconnectors'][0]['id']):
            print("import dataconnector data")
            for dataconnector in data['dataconnectors']:
                try:
                    self.dbClass.createDataconnector(dataconnector)
                except:
                    pass

        if not self.dbClass.getOneProjectById(data['projects'][0]['id']):
            print("import project data")
            for project in data['projects']:
                try:
                    self.dbClass.createProject(project)
                except:
                    pass


        if not self.dbClass.getTemplatesByTemplates():
            print("import template data")
            for template in data['templates']:
                try:
                    self.dbClass.create_template(template)
                except:
                    pass

        if not self.dbClass.getProjectCategories():
            print("import project category data")
            for projectcategory in data['projectcategories']:
                try:
                    self.dbClass.create_project_category(projectcategory)
                except:
                    pass

        if not self.dbClass.get_pricings():
            print("import pricing data")
            for pricing_object in data['pricing']:
                try:
                    self.dbClass.create_pricing(pricing_object)
                except:
                    pass
