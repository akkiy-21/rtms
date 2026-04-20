# user_service.py

from sqlalchemy.orm import Session
from ..crud import user_crud
from .. import schemas

def get_user(db: Session, user_id: str):
    return user_crud.get_user(db, user_id)

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return user_crud.get_users(db, skip, limit)

def create_user(db: Session, user: schemas.UserCreate):
    return user_crud.create_user(db, user)

def update_user(db: Session, user_id: str, user: schemas.UserUpdate):
    return user_crud.update_user(db, user_id, user)

def delete_user(db: Session, user_id: str):
    return user_crud.delete_user(db, user_id)