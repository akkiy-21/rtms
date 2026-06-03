"""add cancelled_at to device_action_jobs

Revision ID: 20260603_01
Revises: 20260521_01
Create Date: 2026-06-03
"""
from typing import Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260603_01"
down_revision: Union[str, None] = "20260521_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "device_action_jobs",
        sa.Column("cancelled_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("device_action_jobs", "cancelled_at")
