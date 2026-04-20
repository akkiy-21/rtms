# app/crud/plc_crud.py

from sqlalchemy.orm import Session, joinedload
from ..models import PLC, AddressRange as AddressRangeModel
from ..schemas import PLCCreateWithAddressRanges, PLCUpdateWithAddressRanges, AddressRange

def get_plc(db: Session, plc_id: int):
    return db.query(PLC).options(joinedload(PLC.address_ranges)).filter(PLC.id == plc_id).first()

def get_plcs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(PLC).offset(skip).limit(limit).all()

def create_plc_with_address_ranges(db: Session, plc: PLCCreateWithAddressRanges):
    plc_data = plc.model_dump(exclude={'address_ranges'})
    db_plc = PLC(**plc_data)
    db.add(db_plc)
    db.flush()  # to get the plc id

    for address_range in plc.address_ranges:
        db_address_range = AddressRangeModel(**address_range.model_dump(), plc_id=db_plc.id)
        db.add(db_address_range)

    db.commit()
    db.refresh(db_plc)
    return db_plc

def update_plc_with_address_ranges(db: Session, plc_id: int, plc: PLCUpdateWithAddressRanges):
    db_plc = db.query(PLC).filter(PLC.id == plc_id).first()
    if db_plc:
        update_data = plc.model_dump(exclude_unset=True, exclude={'address_ranges'})
        for key, value in update_data.items():
            setattr(db_plc, key, value)

        if plc.address_ranges is not None:
            # Delete existing address ranges
            db.query(AddressRangeModel).filter(AddressRangeModel.plc_id == plc_id).delete()

            # Add new address ranges
            for address_range in plc.address_ranges:
                db_address_range = AddressRangeModel(**address_range.model_dump(), plc_id=plc_id)
                db.add(db_address_range)

        db.commit()
        db.refresh(db_plc)
    return db_plc

def delete_plc(db: Session, plc_id: int):
    db_plc = db.query(PLC).filter(PLC.id == plc_id).first()
    if db_plc:
        # Delete associated address ranges
        db.query(AddressRangeModel).filter(AddressRangeModel.plc_id == plc_id).delete()
        db.delete(db_plc)
        db.commit()
        return True
    return False