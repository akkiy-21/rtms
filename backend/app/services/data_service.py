# data_service.py
from datetime import datetime
from app.crud import data_crud, time_table_crud
from sqlalchemy.orm import Session
from datetime import date, timedelta
import pytz

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
    for alarm_group, alarms in data.items():
        for alarm_no, alarm_data in alarms.items():
            alarm_measurement = {
                "device_id": device_id,
                "alarm_group": alarm_group,
                "alarm_no": int(alarm_no),
                "alarm_state": alarm_data['state'],
                "event_time": datetime.fromtimestamp(event_time)
            }
            created_alarm = data_crud.create_alarm_measurement(db, alarm_measurement)

            for comment in alarm_data.get('comment', []):
                alarm_comment = {
                    "alarm_measurement_id": created_alarm.id,
                    "alarm_comment": comment
                }
                data_crud.create_alarm_measurement_comment(db, alarm_comment)

def get_aggregated_data(db: Session, device_id: int, start_date: date, end_date: date):
    # タイムゾーンの設定
    tz = pytz.timezone('Asia/Tokyo')

    # タイムテーブルを取得
    time_tables = time_table_crud.get_time_tables(db)
    if not time_tables:
        return []

    # 検索範囲全体をカバーする範囲を計算（1クエリで全データ取得）
    # start_date 当日00:00から end_date の翌々日00:00まで（日付またぎシフトを確実にカバー）
    range_start = tz.localize(datetime.combine(start_date, datetime.min.time()))
    range_end = tz.localize(datetime.combine(end_date + timedelta(days=2), datetime.min.time()))

    # 一括クエリ: 対象期間の全レコードを取得
    rows = data_crud.get_quality_counts_bulk(db, device_id, range_start, range_end)

    # {(quality_type, event_time): sum} のマップに変換
    # event_time は aware datetime のまま保持
    records: list[tuple[str, datetime, int]] = rows  # (quality_type, event_time, quality_count)

    results = []

    current_date = start_date
    while current_date <= end_date:
        for shift in time_tables:
            # シフトの開始・終了時間を current_date に適用
            start_datetime = tz.localize(datetime.combine(current_date, shift.start_time))
            end_datetime = tz.localize(datetime.combine(current_date, shift.end_time))

            # シフトが日付をまたぐ場合の調整
            if end_datetime <= start_datetime:
                end_datetime += timedelta(days=1)

            # メモリ上で集計
            good_qty = sum(
                count for qtype, etime, count in records
                if qtype == 'Good' and start_datetime <= etime < end_datetime
            )
            ng_qty = sum(
                count for qtype, etime, count in records
                if qtype == 'Ng' and start_datetime <= etime < end_datetime
            )

            shift_time_str = f"{shift.start_time.strftime('%H:%M')}-{shift.end_time.strftime('%H:%M')}"

            results.append([
                current_date.strftime('%Y-%m-%d'),
                shift_time_str,
                int(good_qty),
                int(ng_qty)
            ])

        current_date += timedelta(days=1)

    return results