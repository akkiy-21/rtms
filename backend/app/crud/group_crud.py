# group_crud.py

from sqlalchemy.orm import Session
from .. import models, schemas

def get_group(db: Session, group_id: int):
    return db.query(models.Groups).filter(models.Groups.id == group_id).first()

def get_groups(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Groups).offset(skip).limit(limit).all()

def create_group(db: Session, group: schemas.GroupCreate):
    db_group = models.Groups(**group.dict())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def update_group(db: Session, group_id: int, group: schemas.GroupUpdate):
    db_group = get_group(db, group_id)
    if db_group:
        update_data = group.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_group, key, value)
        db.commit()
        db.refresh(db_group)
    return db_group

def delete_group(db: Session, group_id: int):
    db_group = get_group(db, group_id)
    if db_group:
        db.delete(db_group)
        db.commit()
    return db_group

def add_user_to_group(db: Session, group_id: int, user_id: str):
    db_group = get_group(db, group_id)
    db_user = db.query(models.Users).filter(models.Users.id == user_id).first()
    if db_group and db_user:
        db_group.users.append(db_user)
        db.commit()
        db.refresh(db_group)
    return db_group

def remove_user_from_group(db: Session, group_id: int, user_id: str):
    db_group = get_group(db, group_id)
    db_user = db.query(models.Users).filter(models.Users.id == user_id).first()
    if db_group and db_user:
        db_group.users.remove(db_user)
        db.commit()
        db.refresh(db_group)
    return db_group

def get_users_in_group(db: Session, group_id: int):
    db_group = get_group(db, group_id)
    if db_group:
        return db_group.users
    return None