# time_table.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth import require_admin_user
from app.database import get_db
from app.schemas import TimeTable, TimeTableRequest
from app.services import time_table_service
from datetime import datetime
from typing import List

router = APIRouter(
    prefix="/time_tables",
    tags=["time_tables"]
)

@router.post("/", response_model=List[TimeTable], dependencies=[Depends(require_admin_user)])
def create_time_table(request: TimeTableRequest, db: Session = Depends(get_db)):
    base_time = datetime.combine(datetime.today(), request.base_time)
    return time_table_service.create_time_table(db, base_time)

@router.get("/", response_model=List[TimeTable])
def read_time_tables(db: Session = Depends(get_db)):
    return time_table_service.get_time_tables(db)