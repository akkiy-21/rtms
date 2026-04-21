import base64
import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from . import models
from .crud import user_crud
from .database import get_db


TOKEN_ALGORITHM = "HS256"
TOKEN_TYPE = "bearer"
PASSWORD_HASH_PREFIX = "pbkdf2_sha256"
PASSWORD_HASH_ITERATIONS = int(os.getenv("RTMS_PASSWORD_HASH_ITERATIONS", "600000"))
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("RTMS_ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
JWT_SECRET = os.getenv("RTMS_JWT_SECRET", "rtms-dev-only-change-me")

http_bearer = HTTPBearer(auto_error=False)


def normalize_user_role(role: models.UserRole | str | None) -> str:
    if role in (models.UserRole.SU, "SU", models.UserRole.AD, "AD"):
        return "AD"
    return "CU"


def is_admin_role(role: models.UserRole | str | None) -> bool:
    return normalize_user_role(role) == "AD"


def _encode_base64url(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def _decode_base64url(encoded: str) -> bytes:
    padding = "=" * (-len(encoded) % 4)
    return base64.urlsafe_b64decode(encoded + padding)


def password_is_hashed(password: str | None) -> bool:
    return bool(password and password.startswith(f"{PASSWORD_HASH_PREFIX}$"))


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_HASH_ITERATIONS,
    )
    return f"{PASSWORD_HASH_PREFIX}${PASSWORD_HASH_ITERATIONS}${_encode_base64url(salt)}${_encode_base64url(digest)}"


def verify_password(plain_password: str, stored_password: str | None) -> bool:
    if not stored_password:
        return False

    if not password_is_hashed(stored_password):
        return hmac.compare_digest(plain_password, stored_password)

    _, iterations_str, salt_str, digest_str = stored_password.split("$", 3)
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        plain_password.encode("utf-8"),
        _decode_base64url(salt_str),
        int(iterations_str),
    )
    return hmac.compare_digest(_encode_base64url(derived), digest_str)


def create_temporary_password(length: int = 12) -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def create_access_token(user: models.Users) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user.id,
        "role": normalize_user_role(user.role),
        "pwd_change_required": user.first_login_password_change_required,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=TOKEN_ALGORITHM)


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
    db: Session = Depends(get_db),
) -> models.Users:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _credentials_exception()

    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[TOKEN_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise _credentials_exception()
    except jwt.InvalidTokenError as exc:
        raise _credentials_exception() from exc

    db_user = user_crud.get_user(db, user_id)
    if db_user is None:
        raise _credentials_exception()
    return db_user


def require_authenticated_user(current_user: models.Users = Depends(get_current_user)) -> models.Users:
    if current_user.first_login_password_change_required:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Password change required",
        )
    return current_user


def require_admin_user(current_user: models.Users = Depends(require_authenticated_user)) -> models.Users:
    if not is_admin_role(current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges are required",
        )
    return current_user