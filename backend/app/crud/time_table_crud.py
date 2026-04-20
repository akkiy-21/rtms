# time_table_crud.py

from sqlalchemy.orm import Session
from app.models import TimeTable
from app.schemas import TimeTableCreate
from datetime import datetime, timedelta

def create_time_table(db: Session, base_time: datetime):
    # 既存のデータを削除
    db.query(TimeTable).delete()
    db.commit()

    time_tables = []
    for i in range(24):
        start_time = (base_time + timedelta(hours=i)).time()
        end_time = (base_time + timedelta(hours=i+1)).time()
        # idを1から24までの値に設定
        time_table = TimeTable(id=i+1, start_time=start_time, end_time=end_time)
        time_tables.append(time_table)

    # bulk_save_objectsの代わりにadd_allを使用
    db.add_all(time_tables)
    db.commit()

    return db.query(TimeTable).order_by(TimeTable.id).all()

def get_time_tables(db: Session):
    return db.query(TimeTable).order_by(TimeTable.id).all()