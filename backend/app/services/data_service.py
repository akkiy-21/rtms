# data_service.py
from datetime import datetime
from app.crud import data_crud, time_table_crud
from app import models
from sqlalchemy.orm import Session
from datetime import date, timedelta
import logging
import pytz

logger = logging.getLogger(__name__)

def process_efficiency_data(db: Session, device_id: int, data: dict, event_time: int):
    for group, status in data.items():
        efficiency_measurement = {
            "device_id": device_id,
            "classification_group": group,
            "classification_status_name": status['name'],
            "classification_status": status['state'],
            "event_time": datetime.fromtimestamp(event_time)
        }
        data_crud.create_efficiency_measurement(db, efficiency_measurement)

def process_quality_control_data(db: Session, device_id: int, data: dict, event_time: int):
    def process_quality_item(item, parent_id=None):
        quality_measurement = {
            "device_id": device_id,
            "quality_name": item['name'],
            "quality_type": list(data.keys())[0],  # Good, Ng, or Optional
            "quality_count": item['count'],
            "parent_id": parent_id,
            "event_time": datetime.fromtimestamp(event_time)
        }
        created_item = data_crud.create_quality_control_measurement(db, quality_measurement)
        
        for child in item.get('children', []):
            process_quality_item(child, created_item.id)

    for quality_type, quality_data in data.items():
        if quality_type != 'timestamp':
            process_quality_item(quality_data)

def process_logging_data(db: Session, device_id: int, data: dict, event_time: int):
    logging_measurement = {
        "device_id": device_id,
        "logging_name": data['name'],
        "logging_type": data['logging_type'],
        "event_time": datetime.fromtimestamp(event_time)
    }
    created_measurement = data_crud.create_logging_data_measurement(db, logging_measurement)

    for value in data['values']:
        measurement_group = {
            "measurement_id": created_measurement.id,
            "data_name": value['name'],
            "data_value": value['value'][0]
        }
        data_crud.create_logging_data_measurement_group(db, measurement_group)

def process_alarm_data(db: Session, device_id: int, data: dict, event_time: int):
    # alarm_group 名 → alarm_group_id のキャッシュを一括取得（N+1回避）
    group_names = list(data.keys())
    groups = db.query(models.AlarmGroups).filter(
        models.AlarmGroups.device_id == device_id,
        models.AlarmGroups.name.in_(group_names),
    ).all()
    group_id_map = {g.name: g.id for g in groups}

    for alarm_group, alarms in data.items():
        alarm_group_id = group_id_map.get(alarm_group)
        if alarm_group_id is None:
            logger.warning(f"alarm_group '{alarm_group}' not found for device_id={device_id}, skipping")
            continue

        for alarm_no, alarm_data in alarms.items():
            comments = alarm_data.get('comment', [])
            alarm_name = comments[0] if comments else None

            alarm_measurement = {
                "device_id": device_id,
                "alarm_group_id": alarm_group_id,
                "alarm_no": int(alarm_no),
                "alarm_name": alarm_name,
                "alarm_state": alarm_data['state'],
                "event_time": datetime.fromtimestamp(event_time)
            }
            created_alarm = data_crud.create_alarm_measurement(db, alarm_measurement)

            for comment in comments:
                alarm_comment = {
                    "alarm_measurement_id": created_alarm.id,
                    "alarm_comment": comment
                }
                data_crud.create_alarm_measurement_comment(db, alarm_comment)

def get_efficiency_state_intervals(db: Session, device_id: int, start_date: date, end_date: date):
    """稼働分類ログのON区間リストを返す。
    DBには状態変化時のみレコードが存在するため、各Trueレコードと次のFalseレコードをペアにして区間を構築する。
    送信時点でまだONの場合はended_atを現在時刻（仮締め）とする。
    返却: [[group, status_name, started_at_str, ended_at_str], ...]（JST文字列）
    """
    from collections import defaultdict

    tz = pytz.timezone('Asia/Tokyo')
    now_local = datetime.now(tz)

    range_start = tz.localize(datetime.combine(start_date, datetime.min.time()))
    range_end = tz.localize(datetime.combine(end_date + timedelta(days=1), datetime.min.time()))

    rows = data_crud.get_efficiency_measurements_bulk(db, device_id, range_start, range_end)

    groups: dict = defaultdict(list)
    for group, status_name, status, event_time in rows:
        groups[group].append((status_name, status, event_time))

    results = []
    for group, events in groups.items():
        pending_start = None
        pending_name = None
        for status_name, status, event_time in events:
            if event_time.tzinfo is None:
                event_time = tz.localize(event_time)
            else:
                event_time = event_time.astimezone(tz)
            if status and pending_start is None:
                pending_start = event_time
                pending_name = status_name
            elif not status and pending_start is not None:
                results.append([
                    group,
                    pending_name,
                    pending_start.strftime('%Y-%m-%d %H:%M:%S'),
                    event_time.strftime('%Y-%m-%d %H:%M:%S'),
                ])
                pending_start = None
                pending_name = None
        if pending_start is not None:
            results.append([
                group,
                pending_name,
                pending_start.strftime('%Y-%m-%d %H:%M:%S'),
                now_local.strftime('%Y-%m-%d %H:%M:%S'),
            ])

    # 各区間の隙間を「停止ロス時間 / 停止中」で補完する。
    # クエリ範囲の先頭・末尾はデバイス稼働状況が不明なため補完しない。
    if results:
        sorted_results = sorted(results, key=lambda x: x[2])
        filled: list = []
        for i, interval in enumerate(sorted_results):
            filled.append(interval)
            if i < len(sorted_results) - 1:
                next_interval = sorted_results[i + 1]
                if interval[3] < next_interval[2]:
                    filled.append(["停止ロス時間", "停止中", interval[3], next_interval[2]])
        results = filled

    return results

def get_aggregated_data(db: Session, device_id: int, start_date: date, end_date: date, interval_minutes: int = 60):
    # タイムゾーンの設定
    tz = pytz.timezone('Asia/Tokyo')

    # 集計範囲: start_date 00:00 〜 end_date 翌日 00:00
    range_start = tz.localize(datetime.combine(start_date, datetime.min.time()))
    range_end = tz.localize(datetime.combine(end_date + timedelta(days=1), datetime.min.time()))

    # 一括クエリ: 対象期間の全レコードを取得
    records = data_crud.get_quality_counts_bulk(db, device_id, range_start, range_end)

    results = []
    slot_start = range_start
    delta = timedelta(minutes=interval_minutes)

    while slot_start < range_end:
        slot_end = slot_start + delta

        good_qty = sum(
            count for qtype, etime, count in records
            if qtype == 'Good' and slot_start <= etime < slot_end
        )
        ng_qty = sum(
            count for qtype, etime, count in records
            if qtype == 'Ng' and slot_start <= etime < slot_end
        )

        results.append([
            slot_start.strftime('%Y-%m-%d %H:%M:%S'),
            slot_end.strftime('%Y-%m-%d %H:%M:%S'),
            int(good_qty),
            int(ng_qty)
        ])

        slot_start = slot_end

    return results