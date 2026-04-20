# classification_crud.py

from sqlalchemy.orm import Session, joinedload
from .. import models, schemas

def get_classification(db: Session, classification_id: int):
    return db.query(models.Classification).filter(models.Classification.id == classification_id).first()

def get_classifications(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Classification).offset(skip).limit(limit).all()

def create_classification(db: Session, classification: schemas.ClassificationCreate):
    db_classification = models.Classification(**classification.dict())
    db.add(db_classification)
    db.commit()
    db.refresh(db_classification)
    return db_classification

def update_classification(db: Session, classification_id: int, classification: schemas.ClassificationCreate):
    db_classification = get_classification(db, classification_id)
    if db_classification:
        update_data = classification.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_classification, key, value)
        db.commit()
        db.refresh(db_classification)
    return db_classification

def delete_classification(db: Session, classification_id: int):
    db_classification = db.query(models.Classification).options(joinedload(models.Classification.group)).filter(models.Classification.id == classification_id).first()
    if db_classification:
        db.delete(db_classification)
        db.commit()
    return db_classification

def get_classification_groups(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ClassificationGroup).offset(skip).limit(limit).all()

    