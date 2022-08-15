# import sys
# sys.argv.append('dev')
from models.helper import Helper
dbClass = Helper(init=True)
dbClass.deleteTestrows()