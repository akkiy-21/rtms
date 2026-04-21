"""add device status

Revision ID: 20260421_03
Revises: 20260421_02
Create Date: 2026-04-21 22:30:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260421_03"
down_revision: Union[str, None] = "20260421_02"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "devices",
        sa.Column("device_status", sa.String(length=20), nullable=False, server_default="active"),
    )
    op.execute("UPDATE devices SET device_status = 'active' WHERE device_status IS NULL")
    op.alter_column("devices", "device_status", server_default=None)


def downgrade() -> None:
    op.drop_column("devices", "device_status")