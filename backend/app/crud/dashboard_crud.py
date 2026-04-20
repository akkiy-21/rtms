# # app/api/crud/dashboard_crud.py

from sqlalchemy.orm import Session
from sqlalchemy import func, case, DateTime
from datetime import datetime

from .. import models, schemas

# QualityControlMeasurement関連のCRUD関数

def get_quality_control_measurement(db: Session, device_id: int, measurement_id: int):
    return db.query(models.QualityControlMeasurements).filter(
        models.QualityControlMeasurements.id == measurement_id,
        models.QualityControlMeasurements.device_id == device_id
    ).first()

def get_quality_control_measurements(db: Session, device_id: int):
    return db.query(models.QualityControlMeasurements).filter(
        models.QualityControlMeasurements.device_id == device_id
    ).all()

def get_quality_control_measurements_aggregated(db: Session, device_id: int, start_datetime: datetime, end_datetime: datetime):
    from ..models import QualityControlMeasurements

    # 30分間隔の時間帯を計算
    interval_seconds = 1800  # 30分を秒に換算
    start_epoch = func.extract('epoch', func.cast(start_datetime, DateTime))
    event_epoch = func.extract('epoch', QualityControlMeasurements.event_time)

    time_interval = (
        func.floor((event_epoch - start_epoch) / interval_seconds) * interval_seconds + start_epoch
    ).label('interval_start_epoch')

    query = (
        db.query(
            func.to_timestamp(time_interval).label('interval_start'),
            func.sum(
                case(
                    (QualityControlMeasurements.quality_type == 'Good', QualityControlMeasurements.quality_count),
                    else_=0
                )
            ).label('good_count'),
            func.sum(
                case(
                    (QualityControlMeasurements.quality_type == 'Ng', QualityControlMeasurements.quality_count),
                    else_=0
                )
            ).label('bad_count')
        )
        .filter(
            QualityControlMeasurements.device_id == device_id,
            QualityControlMeasurements.event_time >= start_datetime,
            QualityControlMeasurements.event_time <= end_datetime
        )
        .group_by('interval_start')
        .order_by('interval_start')
    )

    results = query.all()

    aggregated_data = []
    for interval_start, good_count, bad_count in results:
        aggregated_data.append({
            'interval_start': interval_start,
            'good_count': good_count,
            'bad_count': bad_count
        })

    return aggregated_data

def create_quality_control_measurement(db: Session, measurement: schemas.QualityControlMeasurementCreate):
    db_measurement = models.QualityControlMeasurements(**measurement.dict())
    db.add(db_measurement)
    db.commit()
    db.refresh(db_measurement)
    return db_measurement

def update_quality_control_measurement(db: Session, device_id: int, measurement_id: int, measurement: schemas.QualityControlMeasurementCreate):
    db_measurement = get_quality_control_measurement(db, device_id, measurement_id)
    if db_measurement:
        update_data = measurement.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_measurement, key, value)
        db.commit()
        db.refresh(db_measurement)
    return db_measurement

def delete_quality_control_measurement(db: Session, device_id: int, measurement_id: int):
    db_measurement = get_quality_control_measurement(db, device_id, measurement_id)
    if db_measurement:
        db.delete(db_measurement)
        db.commit()
    return db_measurement

# efficiency_measurements
def get_efficiency_measurement(db: Session, device_id: int, measurement_id: int):
    return db.query(models.EfficiencyMeasurements).filter(
        models.EfficiencyMeasurements.device_id == device_id,
        models.EfficiencyMeasurements.id == measurement_id
    ).first()

def get_efficiency_measurements(db: Session, device_id: int):
    return db.query(models.EfficiencyMeasurements).filter(
        models.EfficiencyMeasurements.device_id == device_id
    ).all()

def create_efficiency_measurement(db: Session, measurement: schemas.EfficiencyMeasurementCreate):
    db_measurement = models.EfficiencyMeasurements(**measurement.dict())
    db.add(db_measurement)
    db.commit()
    db.refresh(db_measurement)
    return db_measurement

def update_efficiency_measurement(db: Session, device_id: int, measurement_id: int, measurement: schemas.EfficiencyMeasurementCreate):
    db_measurement = get_efficiency_measurement(db, device_id, measurement_id)
    if db_measurement:
        update_data = measurement.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_measurement, key, value)
        db.commit()
        db.refresh(db_measurement)
    return db_measurement

def delete_efficiency_measurement(db: Session, device_id: int, measurement_id: int):
    db_measurement = get_efficiency_measurement(db, device_id, measurement_id)
    if db_measurement:
        db.delete(db_measurement)
        db.commit()
    return db_measurement

# alarm_measurements
def get_alarm_measurement(db: Session, device_id: int, measurement_id: int):
    return db.query(models.AlarmMeasurements).filter(
        models.AlarmMeasurements.device_id == device_id,
        models.AlarmMeasurements.id == measurement_id
    ).first()

def get_alarm_measurements(db: Session, device_id: int):
    return db.query(models.AlarmMeasurements).filter(
        models.AlarmMeasurements.device_id == device_id
    ).all()

def create_alarm_measurement(db: Session, measurement: schemas.AlarmMeasurementCreate):
    db_measurement = models.AlarmMeasurements(**measurement.dict())
    db.add(db_measurement)
    db.commit()
    db.refresh(db_measurement)
    return db_measurement

def update_alarm_measurement(db: Session, device_id: int, measurement_id: int, measurement: schemas.AlarmMeasurementCreate):
    db_measurement = get_alarm_measurement(db, device_id, measurement_id)
    if db_measurement:
        update_data = measurement.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_measurement, key, value)
        db.commit()
        db.refresh(db_measurement)
    return db_measurement

def delete_alarm_measurement(db: Session, device_id: int, measurement_id: int):
    db_measurement = get_alarm_measurement(db, device_id, measurement_id)
    if db_measurement:
        db.delete(db_measurement)
        db.commit()
    return db_measurement