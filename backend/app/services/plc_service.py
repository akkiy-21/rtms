# app/services/plc_service.py

from sqlalchemy.orm import Session
from ..crud import plc_crud
from ..schemas import PLC, PLCCreateWithAddressRanges, PLCUpdateWithAddressRanges, PLCWithAddressRanges

def get_plc(db: Session, plc_id: int) -> PLCWithAddressRanges:
    return plc_crud.get_plc(db, plc_id)

def get_plcs(db: Session, skip: int = 0, limit: int = 100) -> list[PLC]:
    return plc_crud.get_plcs(db, skip, limit)

def create_plc(db: Session, plc: PLCCreateWithAddressRanges) -> PLCWithAddressRanges:
    return plc_crud.create_plc_with_address_ranges(db, plc)

def update_plc(db: Session, plc_id: int, plc: PLCUpdateWithAddressRanges) -> PLCWithAddressRanges:
    return plc_crud.update_plc_with_address_ranges(db, plc_id, plc)

def delete_plc(db: Session, plc_id: int) -> bool:
    return plc_crud.delete_plc(db, plc_id)