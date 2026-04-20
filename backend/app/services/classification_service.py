# classification_service.py

from sqlalchemy.orm import Session
from ..crud import classification_crud
from ..schemas import ClassificationCreate, Classification, ClassificationGroup

def get_classification(db: Session, classification_id: int):
    return classification_crud.get_classification(db, classification_id)

def get_classifications(db: Session, skip: int = 0, limit: int = 100):
    return classification_crud.get_classifications(db, skip=skip, limit=limit)

def create_classification(db: Session, classification: ClassificationCreate):
    return classification_crud.create_classification(db, classification)

def update_classification(db: Session, classification_id: int, classification: ClassificationCreate):
    return classification_crud.update_classification(db, classification_id, classification)

def delete_classification(db: Session, classification_id: int):
    return classification_crud.delete_classification(db, classification_id)

def get_classification_groups(db: Session, skip: int = 0, limit: int = 100):
    return classification_crud.get_classification_groups(db, skip=skip, limit=limit)