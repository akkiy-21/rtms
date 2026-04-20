# # app/api/services/dashboard_service.py

from sqlalchemy.orm import Session
from datetime import datetime

from ..crud import dashboard_crud
from ..schemas import QualityControlMeasurementCreate, EfficiencyMeasurementCreate, AlarmMeasurementCreate

# QualityControlMeasurement関連のサービス関数

def get_quality_control_measurement(db: Session, device_id: int, measurement_id: int):
    return dashboard_crud.get_quality_control_measurement(db, device_id, measurement_id)

def get_quality_control_measurements(db: Session, device_id: int):
    return dashboard_crud.get_quality_control_measurements(db, device_id)

def get_quality_control_measurements_aggregated(db: Session, device_id: int, start_datetime: datetime, end_datetime: datetime):
    return dashboard_crud.get_quality_control_measurements_aggregated(db, device_id, start_datetime, end_datetime)

def create_quality_control_measurement(db: Session, measurement: QualityControlMeasurementCreate):
    return dashboard_crud.create_quality_control_measurement(db, measurement)

def update_quality_control_measurement(db: Session, device_id: int, measurement_id: int, measurement: QualityControlMeasurementCreate):
    return dashboard_crud.update_quality_control_measurement(db, device_id, measurement_id, measurement)

def delete_quality_control_measurement(db: Session, device_id: int, measurement_id: int):
    return dashboard_crud.delete_quality_control_measurement(db, device_id, measurement_id)


# efficiency_measurements
def get_efficiency_measurement(db: Session, device_id: int, measurement_id: int):
    return dashboard_crud.get_efficiency_measurement(db, device_id, measurement_id)

def get_efficiency_measurements(db: Session, device_id: int):
    return dashboard_crud.get_efficiency_measurements(db, device_id)

def create_efficiency_measurement(db: Session, measurement: EfficiencyMeasurementCreate):
    return dashboard_crud.create_efficiency_measurement(db, measurement)

def update_efficiency_measurement(db: Session, device_id: int, measurement_id: int, measurement: EfficiencyMeasurementCreate):
    return dashboard_crud.update_efficiency_measurement(db, device_id, measurement_id, measurement)

def delete_efficiency_measurement(db: Session, device_id: int, measurement_id: int):
    return dashboard_crud.delete_efficiency_measurement(db, device_id, measurement_id)


# alarm_measurements
def get_alarm_measurement(db: Session, device_id: int, measurement_id: int):
    return dashboard_crud.get_alarm_measurement(db, device_id, measurement_id)

def get_alarm_measurements(db: Session, device_id: int):
    return dashboard_crud.get_alarm_measurements(db, device_id)

def create_alarm_measurement(db: Session, measurement: AlarmMeasurementCreate):
    return dashboard_crud.create_alarm_measurement(db, measurement)

def update_alarm_measurement(db: Session, device_id: int, measurement_id: int, measurement: AlarmMeasurementCreate):
    return dashboard_crud.update_alarm_measurement(db, device_id, measurement_id, measurement)

def delete_alarm_measurement(db: Session, device_id: int, measurement_id: int):
    return dashboard_crud.delete_alarm_measurement(db, device_id, measurement_id)
