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

def get_efficiency_measurements_bulk(db: Session, device_id: int, start_datetime: datetime, end_datetime: datetime):
    """指定期間の全稼働分類データを一括取得して (classification_group, classification_status_name, classification_status, event_time) のリストで返す"""
    rows = db.query(
        models.EfficiencyMeasurements.classification_group,
        models.EfficiencyMeasurements.classification_status_name,
        models.EfficiencyMeasurements.classification_status,
        models.EfficiencyMeasurements.event_time,
    ).filter(
        models.EfficiencyMeasurements.device_id == device_id,
        models.EfficiencyMeasurements.event_time >= start_datetime,
        models.EfficiencyMeasurements.event_time < end_datetime,
    ).order_by(
        models.EfficiencyMeasurements.classification_group,
        models.EfficiencyMeasurements.event_time,
    ).all()
    return [(r.classification_group, r.classification_status_name, r.classification_status, r.event_time) for r in rows]


def get_latest_alarm_states(db: Session, device_id: int) -> dict:
    """デバイスの各 (alarm_group_id, alarm_no) について最新レコードの alarm_state を返す。
    戻り値: {(alarm_group_id, alarm_no): alarm_state}
    """
    subq = db.query(
        models.AlarmMeasurements.alarm_group_id,
        models.AlarmMeasurements.alarm_no,
        func.max(models.AlarmMeasurements.event_time).label('max_time'),
    ).filter(
        models.AlarmMeasurements.device_id == device_id,
    ).group_by(
        models.AlarmMeasurements.alarm_group_id,
        models.AlarmMeasurements.alarm_no,
    ).subquery()

    rows = db.query(
        models.AlarmMeasurements.alarm_group_id,
        models.AlarmMeasurements.alarm_no,
        models.AlarmMeasurements.alarm_state,
    ).join(
        subq,
        and_(
            models.AlarmMeasurements.alarm_group_id == subq.c.alarm_group_id,
            models.AlarmMeasurements.alarm_no == subq.c.alarm_no,
            models.AlarmMeasurements.event_time == subq.c.max_time,
        ),
    ).filter(
        models.AlarmMeasurements.device_id == device_id,
    ).all()

    return {(r.alarm_group_id, r.alarm_no): r.alarm_state for r in rows}


def get_latest_efficiency_states(db: Session, device_id: int) -> dict:
    """デバイスの各 (classification_group, classification_status_name) について最新レコードの classification_status を返す。
    戻り値: {(classification_group, classification_status_name): classification_status}
    """
    subq = db.query(
        models.EfficiencyMeasurements.classification_group,
        models.EfficiencyMeasurements.classification_status_name,
        func.max(models.EfficiencyMeasurements.event_time).label('max_time'),
    ).filter(
        models.EfficiencyMeasurements.device_id == device_id,
    ).group_by(
        models.EfficiencyMeasurements.classification_group,
        models.EfficiencyMeasurements.classification_status_name,
    ).subquery()

    rows = db.query(
        models.EfficiencyMeasurements.classification_group,
        models.EfficiencyMeasurements.classification_status_name,
        models.EfficiencyMeasurements.classification_status,
    ).join(
        subq,
        and_(
            models.EfficiencyMeasurements.classification_group == subq.c.classification_group,
            models.EfficiencyMeasurements.classification_status_name == subq.c.classification_status_name,
            models.EfficiencyMeasurements.event_time == subq.c.max_time,
        ),
    ).filter(
        models.EfficiencyMeasurements.device_id == device_id,
    ).all()

    return {(r.classification_group, r.classification_status_name): r.classification_status for r in rows}


def get_alarm_measurements_bulk(
    db: Session,
    device_id: int,
    start_datetime: datetime,
    end_datetime: datetime,
    alarm_group_id: int = None,
):
    """指定期間のアラームデータを一括取得して
    (alarm_group_name, alarm_group_id, alarm_no, alarm_name, alarm_state, event_time) のリストで返す。
    alarm_group_id を指定すると該当グループのみに絞り込む。
    """
    query = db.query(
        models.AlarmGroups.name.label('alarm_group_name'),
        models.AlarmMeasurements.alarm_group_id,
        models.AlarmMeasurements.alarm_no,
        models.AlarmMeasurements.alarm_name,
        models.AlarmMeasurements.alarm_state,
        models.AlarmMeasurements.event_time,
    ).join(
        models.AlarmGroups,
        models.AlarmMeasurements.alarm_group_id == models.AlarmGroups.id,
    ).filter(
        models.AlarmMeasurements.device_id == device_id,
        models.AlarmMeasurements.event_time >= start_datetime,
        models.AlarmMeasurements.event_time < end_datetime,
    )
    if alarm_group_id is not None:
        query = query.filter(models.AlarmMeasurements.alarm_group_id == alarm_group_id)

    rows = query.order_by(
        models.AlarmMeasurements.alarm_group_id,
        models.AlarmMeasurements.alarm_no,
        models.AlarmMeasurements.event_time,
    ).all()
    return [
        (r.alarm_group_name, r.alarm_group_id, r.alarm_no, r.alarm_name, r.alarm_state, r.event_time)
        for r in rows
    ]
