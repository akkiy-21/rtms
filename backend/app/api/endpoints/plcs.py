# app/api/endpoints/plcs.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...database import get_db
from ...schemas import PLC, PLCCreateWithAddressRanges, PLCUpdateWithAddressRanges, PLCWithAddressRanges
from ...services import plc_service

router = APIRouter(
    prefix="/plcs",
    tags=["plcs"]
)

@router.post("", response_model=PLCWithAddressRanges, status_code=201)
def create_plc(plc: PLCCreateWithAddressRanges, db: Session = Depends(get_db)):
    return plc_service.create_plc(db, plc)

@router.get("", response_model=List[PLC])
def read_plcs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    plcs = plc_service.get_plcs(db, skip=skip, limit=limit)
    return plcs

@router.get("/{plc_id}", response_model=PLCWithAddressRanges)
def read_plc(plc_id: int, db: Session = Depends(get_db)):
    db_plc = plc_service.get_plc(db, plc_id=plc_id)
    if db_plc is None:
        raise HTTPException(status_code=404, detail="PLC not found")
    return db_plc

@router.put("/{plc_id}", response_model=PLCWithAddressRanges)
def update_plc(plc_id: int, plc: PLCUpdateWithAddressRanges, db: Session = Depends(get_db)):
    db_plc = plc_service.update_plc(db, plc_id, plc)
    if db_plc is None:
        raise HTTPException(status_code=404, detail="PLC not found")
    return db_plc

@router.delete("/{plc_id}", status_code=204)
def delete_plc(plc_id: int, db: Session = Depends(get_db)):
    success = plc_service.delete_plc(db, plc_id)
    if not success:
        raise HTTPException(status_code=404, detail="PLC not found")
    return None