"""add alarm_group_id to device_connectors

Revision ID: 20260519_03
Revises: 20260519_02
Create Date: 2026-05-19
"""
from typing import Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260519_03"
down_revision: Union[str, None] = "20260519_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "device_connectors",
        sa.Column(
            "alarm_group_id",
            sa.Integer(),
            sa.ForeignKey("alarm_groups.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_device_connectors_alarm_group_id",
        "device_connectors",
        ["alarm_group_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_device_connectors_alarm_group_id", table_name="device_connectors")
    op.drop_column("device_connectors", "alarm_group_id")
