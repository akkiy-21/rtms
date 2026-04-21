import os

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import models, schemas
from .. import env  # noqa: F401
from ..auth import create_temporary_password, hash_password, is_admin_role, normalize_user_role, password_is_hashed, verify_password
from ..crud import user_crud


def _to_internal_role(role: schemas.UserRole) -> models.UserRole:
    return models.UserRole.AD if role == schemas.UserRole.AD else models.UserRole.CU


def serialize_user(user: models.Users) -> schemas.User:
    return schemas.User(
        id=user.id,
        name=user.name,
        role=schemas.UserRole(normalize_user_role(user.role)),
        password_change_required=user.first_login_password_change_required,
    )


def get_user(db: Session, user_id: str):
    db_user = user_crud.get_user(db, user_id)
    if db_user is None:
        return None
    return serialize_user(db_user)

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return [serialize_user(user) for user in user_crud.get_users(db, skip, limit)]

def create_user(db: Session, user: schemas.UserCreate):
    temporary_password = create_temporary_password()
    try:
        db_user = user_crud.create_user(
            db,
            user_id=user.id,
            name=user.name,
            role=_to_internal_role(user.role),
            password=hash_password(temporary_password),
            first_login_password_change_required=True,
        )
    except IntegrityError as exc:
        db.rollback()
        raise ValueError("A user with the same ID already exists") from exc

    return schemas.UserCreateResult(
        user=serialize_user(db_user),
        temporary_password=temporary_password,
    )

def update_user(db: Session, user_id: str, user: schemas.UserUpdate):
    db_user = user_crud.get_user(db, user_id)
    if db_user is None:
        return None

    updates = user.model_dump(exclude_unset=True)
    next_role = updates.get("role")
    if next_role is not None and next_role == schemas.UserRole.CU and is_admin_role(db_user.role):
        if user_crud.count_admin_users(db) <= 1:
            raise ValueError("At least one administrator is required")
        updates["role"] = models.UserRole.CU
    elif next_role is not None:
        updates["role"] = _to_internal_role(next_role)

    updated_user = user_crud.update_user(db, user_id, schemas.UserUpdate(**updates))
    return None if updated_user is None else serialize_user(updated_user)

def delete_user(db: Session, user_id: str):
    db_user = user_crud.get_user(db, user_id)
    if db_user is None:
        return None
    if is_admin_role(db_user.role) and user_crud.count_admin_users(db) <= 1:
        raise ValueError("At least one administrator is required")
    deleted_user = user_crud.delete_user(db, user_id)
    return None if deleted_user is None else serialize_user(deleted_user)


def authenticate_user(db: Session, user_id: str, password: str) -> models.Users | None:
    db_user = user_crud.get_user(db, user_id)
    if db_user is None or not verify_password(password, db_user.password):
        return None

    if not password_is_hashed(db_user.password):
        db_user = user_crud.update_password(
            db,
            db_user,
            hash_password(password),
            first_login_password_change_required=True,
        )

    return db_user


def change_password(db: Session, db_user: models.Users, current_password: str, new_password: str) -> models.Users:
    if not verify_password(current_password, db_user.password):
        raise ValueError("Current password is incorrect")
    if current_password == new_password:
        raise ValueError("New password must be different from the current password")

    return user_crud.update_password(
        db,
        db_user,
        hash_password(new_password),
        first_login_password_change_required=False,
    )


def ensure_initial_admin_user(db: Session) -> tuple[schemas.User, str] | None:
    if user_crud.count_admin_users(db) > 0:
        return None

    initial_admin_id = os.getenv("RTMS_INITIAL_ADMIN_ID")
    initial_admin_name = os.getenv("RTMS_INITIAL_ADMIN_NAME", "初期管理者")
    initial_admin_password = os.getenv("RTMS_INITIAL_ADMIN_PASSWORD")

    if not initial_admin_id or not initial_admin_password:
        raise ValueError(
            "RTMS_INITIAL_ADMIN_ID and RTMS_INITIAL_ADMIN_PASSWORD must be set before initializing the database"
        )

    db_user = user_crud.create_user(
        db,
        user_id=initial_admin_id,
        name=initial_admin_name,
        role=models.UserRole.AD,
        password=hash_password(initial_admin_password),
        first_login_password_change_required=True,
    )
    return serialize_user(db_user), initial_admin_password