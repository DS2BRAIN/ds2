from typing import List
from fastapi import APIRouter, Form, Request, Depends
from fastapi.security import APIKeyHeader
from src.util import Util
from src.manageUser import ManageUser
from src.manageMonitoringAlert import ManageMonitoringAlert
from starlette.responses import Response
from pydantic import BaseModel
from models.helper import Helper
from src.errorResponseList import ErrorResponseList
from sse_starlette.sse import EventSourceResponse

dbClass = Helper(init=True)
router = APIRouter()
utilClass = Util()
manageUserClass = ManageUser()
manageMonitoringAlertClass = ManageMonitoringAlert()
errorResponseList = ErrorResponseList()
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=True)

@router.get("/monitoring-alerts/")
def readMonitoringAlerts(response: Response, token: str, sorting: str = 'created_at', tab: str = 'all',  count: int = 10,
                 page: int = 0, desc: bool = False, searching: str = '', isVerify: bool = False):
    response.status_code, result = manageMonitoringAlertClass.getMonitoringAlertsById(token, sorting, page, count, tab,
                                                                      desc, searching, isVerify)
    return result

@router.get("/monitoring-alerts/{monitoring_alert_id}/")
async def readMonitoringAlert(monitoring_alert_id: int, token: str, response: Response):
    response.status_code, result = manageMonitoringAlertClass.getMonitoringAlertById(token, monitoring_alert_id)
    return result

@router.get("/monitoring-alerts/{monitoring_alert_id}/status")
async def read_monitoring_alert_status(response: Response, token: str, monitoring_alert_id: str):
    response.status_code, result = manageMonitoringAlertClass.get_monitoring_alert_status_by_id(token, monitoring_alert_id)
    return result

@router.get("/monitoring-alertsasync/{monitoring_alert_id}/")
async def readMonitoringAlertasync(monitoring_alert_id: str, token: str, response: Response):
    response.status_code, result = manageMonitoringAlertClass.getMonitoringAlertAsyncById(token, monitoring_alert_id)
    return result

class MonitoringAlertInfo(BaseModel):
    monitoring_alert_name: str = None
    monitoring_alert_info: dict = None

@router.put("/monitoring-alerts/{monitoring_alert_id}/")
async def updateMonitoringAlert(monitoring_alert_id: str, token: str, monitoring_alertInfo: MonitoringAlertInfo, response: Response):
    response.status_code, result = manageMonitoringAlertClass.putMonitoringAlert(token, monitoring_alertInfo, monitoring_alert_id)

    return result

@router.delete("/monitoring-alerts/")
async def deleteMonitoringAlert(token: str, response: Response, monitoring_alert_id: List[str] = Form(...)):
    response.status_code, result = manageMonitoringAlertClass.deleteMonitoringAlerts(token, monitoring_alert_id)
    return result

@router.delete("/monitoring-alerts/{monitoring_alert_id}/")
async def deleteMonitoringAlert(token: str, response: Response, monitoring_alert_id):
    response.status_code, result = manageMonitoringAlertClass.deleteMonitoringAlert(token, monitoring_alert_id)
    return result

@router.get('/sse/monitoring-alert-status/{monitoring_alert_id}/')
async def sse_model_info(request: Request, monitoring_alert_id: int, token: str):
    return EventSourceResponse(manageMonitoringAlertClass.get_monitoring_alert_status(token, monitoring_alert_id, request))
