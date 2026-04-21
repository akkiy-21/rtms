"""add user auth state

Revision ID: 20260421_01_add_user_auth_state
Revises: 20260420_06
Create Date: 2026-04-21 13:00:00
"""

from __future__ import annotations

import base64
import hashlib
import secrets

from alembic import op
import sqlalchemy as sa


revision = "20260421_01_add_user_auth_state"
down_revision = "20260420_06"
branch_labels = None
depends_on = None

PASSWORD_HASH_PREFIX = "pbkdf2_sha256"
PASSWORD_HASH_ITERATIONS = 600000


def _encode_base64url(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_HASH_ITERATIONS,
    )
    return f"{PASSWORD_HASH_PREFIX}${PASSWORD_HASH_ITERATIONS}${_encode_base64url(salt)}${_encode_base64url(digest)}"


def upgrade() -> None:
    op.alter_column(
        "users",
        "password",
        existing_type=sa.String(length=50),
        type_=sa.String(length=255),
        existing_nullable=True,
    )

    op.add_column(
        "users",
        sa.Column(
            "first_login_password_change_required",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )

    bind = op.get_bind()
    users = sa.table(
        "users",
        sa.column("id", sa.String(length=10)),
        sa.column("password", sa.String(length=255)),
        sa.column("first_login_password_change_required", sa.Boolean()),
    )

    rows = bind.execute(sa.select(users.c.id, users.c.password)).all()
    for row in rows:
        if not row.password:
            continue
        if str(row.password).startswith(f"{PASSWORD_HASH_PREFIX}$"):
            continue
        bind.execute(
            users.update()
            .where(users.c.id == row.id)
            .values(
                password=hash_password(row.password),
                first_login_password_change_required=True,
            )
        )

    op.alter_column("users", "first_login_password_change_required", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "first_login_password_change_required")
    op.alter_column(
        "users",
        "password",
        existing_type=sa.String(length=255),
        type_=sa.String(length=50),
        existing_nullable=True,
    )