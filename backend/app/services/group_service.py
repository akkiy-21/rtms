# group_service.py

from sqlalchemy.orm import Session
from ..crud import group_crud
from .. import schemas

def get_group(db: Session, group_id: int):
    return group_crud.get_group(db, group_id)

def get_groups(db: Session, skip: int = 0, limit: int = 100):
    return group_crud.get_groups(db, skip, limit)

def create_group(db: Session, group: schemas.GroupCreate):
    return group_crud.create_group(db, group)
def update_group(db: Session, group_id: int, group: schemas.GroupUpdate):
    return group_crud.update_group(db, group_id, group)

def delete_group(db: Session, group_id: int):
    return group_crud.delete_group(db, group_id)

def add_user_to_group(db: Session, group_id: int, user_id: str):
    return group_crud.add_user_to_group(db, group_id, user_id)

def remove_user_from_group(db: Session, group_id: int, user_id: str):
    return group_crud.remove_user_from_group(db, group_id, user_id)

def get_users_in_group(db: Session, group_id: int):
    return group_crud.get_users_in_group(db, group_id)