# data_crud.py
from sqlalchemy import and_, func
from sqlalchemy.orm import Session
from .. import models, schemas
from datetime import datetime
import pytz

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

# アクティブなユーザーの最新のデータを取得
def get_latest_active_users(db: Session, device_id: int):
    subquery = db.query(
        models.UserMeasurements.user_id,
        func.max(models.UserMeasurements.event_time).label('max_time')
    ).filter(
        models.UserMeasurements.device_id == device_id
    ).group_by(models.UserMeasurements.user_id).subquery()

    return db.query(models.UserMeasurements).join(
        subquery,
        and_(
            models.UserMeasurements.user_id == subquery.c.user_id,
            models.UserMeasurements.event_time == subquery.c.max_time
        )
    ).filter(
        models.UserMeasurements.device_id == device_id,
        models.UserMeasurements.state == True
    ).all()

# ユーザーの最新の計測データを取得
def get_latest_user_measurement(db: Session, device_id: int, user_id: str):
    return db.query(models.UserMeasurements).filter(
        models.UserMeasurements.device_id == device_id,
        models.UserMeasurements.user_id == user_id
    ).order_by(models.UserMeasurements.event_time.desc()).first()

def get_latest_active_users_with_names(db: Session, device_id: int):
    subquery = db.query(
        models.UserMeasurements.user_id,
        func.max(models.UserMeasurements.event_time).label('max_time')
    ).filter(
        models.UserMeasurements.device_id == device_id
    ).group_by(models.UserMeasurements.user_id).subquery()

    return db.query(
        models.UserMeasurements,
        models.Users.name.label('user_name')
    ).join(
        subquery,
        and_(
            models.UserMeasurements.user_id == subquery.c.user_id,
            models.UserMeasurements.event_time == subquery.c.max_time
        )
    ).join(
        models.Users,
        models.UserMeasurements.user_id == models.Users.id
    ).filter(
        models.UserMeasurements.device_id == device_id,
        models.UserMeasurements.state == True
    ).all()

# ユーザーの計測データを作成
def create_user_measurement(db: Session, user_measurement: schemas.UserMeasurementCreate):
    db_user_measurement = models.UserMeasurements(
        device_id=user_measurement.device_id,
        user_id=user_measurement.user_id,
        state=user_measurement.state,
        event_time=user_measurement.event_time
    )
    db.add(db_user_measurement)
    db.commit()
    db.refresh(db_user_measurement)
    return db_user_measurement

# csv形式の集計データを取得
def get_quality_counts(db: Session, device_id: int, quality_type: str, start_datetime: datetime, end_datetime: datetime):
    return db.query(func.sum(models.QualityControlMeasurements.quality_count)).filter(
        models.QualityControlMeasurements.device_id == device_id,
        models.QualityControlMeasurements.quality_type == quality_type,
        models.QualityControlMeasurements.event_time >= start_datetime,
        models.QualityControlMeasurements.event_time < end_datetime
    ).scalar() or 0

def get_active_user_count(db: Session, device_id: int, start_datetime: datetime, end_datetime: datetime):
    return db.query(models.UserMeasurements.user_id).filter(
        models.UserMeasurements.device_id == device_id,
        models.UserMeasurements.state == True,
        models.UserMeasurements.event_time >= start_datetime,
        models.UserMeasurements.event_time < end_datetime
    ).distinct().count()

# data_crud.py

def get_active_users_with_names(db: Session, device_id: int, start_datetime: datetime, end_datetime: datetime):
    return db.query(
        models.UserMeasurements.user_id,
        models.Users.name
    ).join(
        models.Users,
        models.UserMeasurements.user_id == models.Users.id
    ).filter(
        models.UserMeasurements.device_id == device_id,
        models.UserMeasurements.state == True,
        models.UserMeasurements.event_time >= start_datetime,
        models.UserMeasurements.event_time < end_datetime
    ).distinct().all()
