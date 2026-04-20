# time_table_service.py

from sqlalchemy.orm import Session
from app.crud import time_table_crud
from datetime import datetime

def create_time_table(db: Session, base_time: datetime):
    return time_table_crud.create_time_table(db, base_time)

def get_time_tables(db: Session):
    return time_table_crud.get_time_tables(db)