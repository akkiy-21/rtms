# data_crud.py
from sqlalchemy import and_, func
from sqlalchemy.orm import Session
from .. import models
from datetime import datetime

def create_efficiency_measurement(db: Session, efficiency_data: dict):
    db_efficiency = models.EfficiencyMeasurements(**efficiency_data)
    db.add(db_efficiency)
    db.commit()
    db.refresh(db_efficiency)
    return db_efficiency

def create_quality_control_measurement(db: Session, quality_control_data: dict):
    db_quality_control = models.QualityControlMeasurements(**quality_control_data)
    db.add(db_quality_control)
    db.commit()
    db.refresh(db_quality_control)
    return db_quality_control

def create_logging_data_measurement(db: Session, logging_data: dict):
    db_logging = models.LoggingDataMeasurements(**logging_data)
    db.add(db_logging)
    db.commit()
    db.refresh(db_logging)
    return db_logging

def create_logging_data_measurement_group(db: Session, measurement_group: dict):
    db_measurement_group = models.LoggingDataMeasurementGroups(**measurement_group)
    db.add(db_measurement_group)
    db.commit()
    db.refresh(db_measurement_group)
    return db_measurement_group

def create_alarm_measurement(db: Session, alarm_data: dict):
    db_alarm = models.AlarmMeasurements(**alarm_data)
    db.add(db_alarm)
    db.commit()
    db.refresh(db_alarm)
    return db_alarm

def create_alarm_measurement_comment(db: Session, comment_data: dict):
    db_comment = models.AlarmMeasurementComments(**comment_data)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

# csv形式の集計データを取得
def get_quality_counts(db: Session, device_id: int, quality_type: str, start_datetime: datetime, end_datetime: datetime):
    return db.query(func.sum(models.QualityControlMeasurements.quality_count)).filter(
        models.QualityControlMeasurements.device_id == device_id,
        models.QualityControlMeasurements.quality_type == quality_type,
        models.QualityControlMeasurements.event_time >= start_datetime,
        models.QualityControlMeasurements.event_time < end_datetime
    ).scalar() or 0

def get_quality_counts_bulk(db: Session, device_id: int, start_datetime: datetime, end_datetime: datetime):
    """指定期間の全品質データを一括取得して (quality_type, event_time, quality_count) のリストで返す"""
    rows = db.query(
        models.QualityControlMeasurements.quality_type,
        models.QualityControlMeasurements.event_time,
        models.QualityControlMeasurements.quality_count,
    ).filter(
        models.QualityControlMeasurements.device_id == device_id,
        models.QualityControlMeasurements.event_time >= start_datetime,
        models.QualityControlMeasurements.event_time < end_datetime,
        models.QualityControlMeasurements.quality_type.in_(['Good', 'Ng']),
    ).all()
    return [(r.quality_type, r.event_time, r.quality_count) for r in rows]
