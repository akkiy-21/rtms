"""add last_dispatched_at to device_connectors

Revision ID: 20260519_01
Revises: 20260518_03
Create Date: 2026-05-19 09:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260519_01"
down_revision: Union[str, None] = "20260518_03"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "device_connectors",
        sa.Column("last_dispatched_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("device_connectors", "last_dispatched_at")
