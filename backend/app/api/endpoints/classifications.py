# classifications.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...database import get_db
from ...schemas import Classification, ClassificationCreate, ClassificationGroup, ClassificationResponse
from ...services import classification_service

router = APIRouter(
    prefix="/classifications",
    tags=["classifications"]
)

@router.post("", response_model=Classification)
def create_classification(classification: ClassificationCreate, db: Session = Depends(get_db)):
    return classification_service.create_classification(db, classification)

@router.get("", response_model=List[Classification])
def read_classifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    classifications = classification_service.get_classifications(db, skip=skip, limit=limit)
    return classifications

@router.get("/classification-groups", response_model=List[ClassificationGroup])
def read_classification_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    groups = classification_service.get_classification_groups(db, skip=skip, limit=limit)
    return groups

@router.get("/{classification_id}", response_model=Classification)
def read_classification(classification_id: int, db: Session = Depends(get_db)):
    db_classification = classification_service.get_classification(db, classification_id)
    if db_classification is None:
        raise HTTPException(status_code=404, detail="Classification not found")
    return db_classification

@router.put("/{classification_id}", response_model=Classification)
def update_classification(classification_id: int, classification: ClassificationCreate, db: Session = Depends(get_db)):
    db_classification = classification_service.update_classification(db, classification_id, classification)
    if db_classification is None:
        raise HTTPException(status_code=404, detail="Classification not found")
    return db_classification

@router.delete("/{classification_id}", response_model=ClassificationResponse)
def delete_classification(classification_id: int, db: Session = Depends(get_db)):
    db_classification = classification_service.delete_classification(db, classification_id)
    if db_classification is None:
        raise HTTPException(status_code=404, detail="Classification not found")
    return {
        "id": db_classification.id,
        "name": db_classification.name,
        "group_id": db_classification.group.id,
        "group_name": db_classification.group.name
    }