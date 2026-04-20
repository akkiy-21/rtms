# groups.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...database import get_db
from ...schemas import Group, GroupCreate, GroupUpdate, User
from ...services import group_service

router = APIRouter(
    prefix="/groups",
    tags=["groups"]
)

@router.post("", response_model=Group)
def create_group(group: GroupCreate, db: Session = Depends(get_db)):
    return group_service.create_group(db, group)

@router.get("", response_model=List[Group])
def read_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    groups = group_service.get_groups(db, skip=skip, limit=limit)
    return groups

@router.get("/{group_id}", response_model=Group)
def read_group(group_id: int, db: Session = Depends(get_db)):
    db_group = group_service.get_group(db, group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group

@router.put("/{group_id}", response_model=Group)
def update_group(group_id: int, group: GroupUpdate, db: Session = Depends(get_db)):
    db_group = group_service.update_group(db, group_id, group)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group

@router.delete("/{group_id}", response_model=Group)
def delete_group(group_id: int, db: Session = Depends(get_db)):
    db_group = group_service.delete_group(db, group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group

@router.post("/{group_id}/users/{user_id}", response_model=Group)
def add_user_to_group(group_id: int, user_id: str, db: Session = Depends(get_db)):
    db_group = group_service.add_user_to_group(db, group_id, user_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group or User not found")
    return db_group

@router.delete("/{group_id}/users/{user_id}", response_model=Group)
def remove_user_from_group(group_id: int, user_id: str, db: Session = Depends(get_db)):
    db_group = group_service.remove_user_from_group(db, group_id, user_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group or User not found")
    return db_group

@router.get("/{group_id}/users", response_model=List[User])
def get_users_in_group(group_id: int, db: Session = Depends(get_db)):
    users = group_service.get_users_in_group(db, group_id)
    if users is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return users