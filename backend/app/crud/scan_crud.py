# scan_crud.py
from sqlalchemy.orm import Session
from .. import models

def get_code_length_rule(db: Session, code_type: models.CodeType):
    return db.query(models.CodeLengthRule).filter(models.CodeLengthRule.code_type == code_type).first()