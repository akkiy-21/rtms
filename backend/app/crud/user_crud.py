from sqlalchemy.orm import Session

from .. import models, schemas

def get_user(db: Session, user_id: str):
    return db.query(models.Users).filter(models.Users.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Users).offset(skip).limit(limit).all()

def count_admin_users(db: Session):
    return db.query(models.Users).filter(models.Users.role.in_([models.UserRole.SU, models.UserRole.AD])).count()

def create_user(
    db: Session,
    *,
    user_id: str,
    name: str,
    role: models.UserRole,
    password: str,
    first_login_password_change_required: bool,
):
    db_user = models.Users(
        id=user_id,
        name=name,
        role=role,
        password=password,
        first_login_password_change_required=first_login_password_change_required,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: str, user: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        for key, value in user.model_dump(exclude_unset=True).items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def update_password(
    db: Session,
    db_user: models.Users,
    password: str,
    *,
    first_login_password_change_required: bool,
):
    db_user.password = password
    db_user.first_login_password_change_required = first_login_password_change_required
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: str):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user