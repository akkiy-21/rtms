# app/api/endpoints/dashboard.py

from fastapi import APIRouter, Depends, HTTPException,Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from dateutil import parser  # datetime文字列のパースに使用

from ...auth import require_authenticated_user
from ...database import get_db
from ...schemas import (
    QualityControlMeasurement,
    QualityControlMeasurementCreate,
    QualityControlMeasurementResponse,
    QualityControlMeasurementAggregated, #11/27 追加
    EfficiencyMeasurement,
    EfficiencyMeasurementCreate,
    EfficiencyMeasurementResponse,
    AlarmMeasurement,
    AlarmMeasurementCreate,
    AlarmMeasurementResponse,
)
from ...services import dashboard_service

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

# クライアントからのリクエストを処理する関数を定義
# quality_control_measurements
@router.post("/{device_id}/qualitycontrolmeasurement", response_model=QualityControlMeasurement)
def create_quality_control_measurement(device_id: int, measurement: QualityControlMeasurementCreate, db: Session = Depends(get_db)):
    measurement.device_id = device_id
    return dashboard_service.create_quality_control_measurement(db, measurement)

# 集計されたデータを返すエンドポイントに更新
@router.get("/{device_id}/qualitycontrolmeasurement", response_model=List[QualityControlMeasurementAggregated], dependencies=[Depends(require_authenticated_user)])
def read_quality_control_measurements(
    device_id: int,
    start_datetime: str = Query(..., description="開始日時"),
    end_datetime: str = Query(..., description="終了日時"),
    db: Session = Depends(get_db)
):
    try:
        start_dt = parser.isoparse(start_datetime)
        end_dt = parser.isoparse(end_datetime)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid datetime format")

    measurements = dashboard_service.get_quality_control_measurements_aggregated(
        db, device_id, start_dt, end_dt
    )
    if measurements is None:
        raise HTTPException(status_code=404, detail="Quality Control Measurements not found")
    return measurements

@router.get("/{device_id}/qualitycontrolmeasurement/{measurement_id}", response_model=QualityControlMeasurement, dependencies=[Depends(require_authenticated_user)])
def read_quality_control_measurement(device_id: int, measurement_id: int, db: Session = Depends(get_db)):
    measurement = dashboard_service.get_quality_control_measurement(db, device_id=device_id, measurement_id=measurement_id)
    if measurement is None:
        raise HTTPException(status_code=404, detail="Quality Control Measurement not found")
    return measurement

@router.put("/{device_id}/qualitycontrolmeasurement/{measurement_id}", response_model=QualityControlMeasurement)
def update_quality_control_measurement(device_id: int, measurement_id: int, measurement: QualityControlMeasurementCreate, db: Session = Depends(get_db)):
    updated_measurement = dashboard_service.update_quality_control_measurement(db, device_id=device_id, measurement_id=measurement_id, measurement=measurement)
    if updated_measurement is None:
        raise HTTPException(status_code=404, detail="Quality Control Measurement not found")
    return updated_measurement

@router.delete("/{device_id}/qualitycontrolmeasurement/{measurement_id}", response_model=QualityControlMeasurementResponse)
def delete_quality_control_measurement(device_id: int, measurement_id: int, db: Session = Depends(get_db)):
    measurement = dashboard_service.delete_quality_control_measurement(db, device_id=device_id, measurement_id=measurement_id)
    if measurement is None:
        raise HTTPException(status_code=404, detail="Quality Control Measurement not found")
    return {
        "id": measurement.id,
        "device_id": measurement.device_id,
        "quality_name": measurement.quality_name,
        "quality_type": measurement.quality_type,
        "quality_count": measurement.quality_count,
        "event_time": measurement.event_time
    }

# efficiency_measurements
@router.post("/{device_id}/efficiencymeasurement", response_model=EfficiencyMeasurement)
def create_efficiency_measurement(device_id: int, measurement: EfficiencyMeasurementCreate, db: Session = Depends(get_db)):
    measurement.device_id = device_id
    return dashboard_service.create_efficiency_measurement(db, measurement)

@router.get("/{device_id}/efficiencymeasurement", response_model=List[EfficiencyMeasurement], dependencies=[Depends(require_authenticated_user)])
def read_efficiency_measurements(device_id: int, db: Session = Depends(get_db)):
    measurements = dashboard_service.get_efficiency_measurements(db, device_id)
    return measurements

@router.get("/{device_id}/efficiencymeasurement/{measurement_id}", response_model=EfficiencyMeasurement, dependencies=[Depends(require_authenticated_user)])
def read_efficiency_measurement(device_id: int, measurement_id: int, db: Session = Depends(get_db)):
    measurement = dashboard_service.get_efficiency_measurement(db, device_id=device_id, measurement_id=measurement_id)
    if measurement is None:
        raise HTTPException(status_code=404, detail="Efficiency Measurement not found")
    return measurement

@router.put("/{device_id}/efficiencymeasurement/{measurement_id}", response_model=EfficiencyMeasurement)
def update_efficiency_measurement(device_id: int, measurement_id: int, measurement: EfficiencyMeasurementCreate, db: Session = Depends(get_db)):
    updated_measurement = dashboard_service.update_efficiency_measurement(db, device_id=device_id, measurement_id=measurement_id, measurement=measurement)
    if updated_measurement is None:
        raise HTTPException(status_code=404, detail="Efficiency Measurement not found")
    return updated_measurement

@router.delete("/{device_id}/efficiencymeasurement/{measurement_id}", response_model=EfficiencyMeasurementResponse)
def delete_efficiency_measurement(device_id: int, measurement_id: int, db: Session = Depends(get_db)):
    measurement = dashboard_service.delete_efficiency_measurement(db, device_id=device_id, measurement_id=measurement_id)
    if measurement is None:
        raise HTTPException(status_code=404, detail="Efficiency Measurement not found")
    return {
        "id": measurement.id,
        "device_id": measurement.device_id,
        "classification_group": measurement.classification_group,
        "classification_status_name": measurement.classification_status_name,
        "event_time": measurement.event_time
    }

# alarm_measurements
@router.post("/{device_id}/alarmmeasurement", response_model=AlarmMeasurement)
def create_alarm_measurement(device_id: int, measurement: AlarmMeasurementCreate, db: Session = Depends(get_db)):
    measurement.device_id = device_id
    return dashboard_service.create_alarm_measurement(db, measurement)

@router.get("/{device_id}/alarmmeasurement", response_model=List[AlarmMeasurement], dependencies=[Depends(require_authenticated_user)])
def read_alarm_measurements(device_id: int, db: Session = Depends(get_db)):
    measurements = dashboard_service.get_alarm_measurements(db, device_id)
    return measurements

@router.get("/{device_id}/alarmmeasurement/{measurement_id}", response_model=AlarmMeasurement, dependencies=[Depends(require_authenticated_user)])
def read_alarm_measurement(device_id: int, measurement_id: int, db: Session = Depends(get_db)):
    measurement = dashboard_service.get_alarm_measurement(db, device_id=device_id, measurement_id=measurement_id)
    if measurement is None:
        raise HTTPException(status_code=404, detail="Alarm Measurement not found")
    return measurement

@router.put("/{device_id}/alarmmeasurement/{measurement_id}", response_model=AlarmMeasurement)
def update_alarm_measurement(device_id: int, measurement_id: int, measurement: AlarmMeasurementCreate, db: Session = Depends(get_db)):
    updated_measurement = dashboard_service.update_alarm_measurement(db, device_id=device_id, measurement_id=measurement_id, measurement=measurement)
    if updated_measurement is None:
        raise HTTPException(status_code=404, detail="Alarm Measurement not found")
    return updated_measurement

@router.delete("/{device_id}/alarmmeasurement/{measurement_id}", response_model=AlarmMeasurementResponse)
def delete_alarm_measurement(device_id: int, measurement_id: int, db: Session = Depends(get_db)):
    measurement = dashboard_service.delete_alarm_measurement(db, device_id=device_id, measurement_id=measurement_id)
    if measurement is None:
        raise HTTPException(status_code=404, detail="Alarm Measurement not found")
    return {
        "id": measurement.id,
        "device_id": measurement.device_id,
        "alarm_group": measurement.alarm_group,
        "alarm_no": measurement.alarm_no,
        "event_time": measurement.event_time
    }