"""add device_connector_logs

Revision ID: 20260518_02
Revises: 20260518_01
Create Date: 2026-05-18 11:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260518_02"
down_revision: Union[str, None] = "20260518_01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "device_connector_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("connector_id", sa.Integer(), nullable=False),
        sa.Column("triggered_at", sa.DateTime(), nullable=False),
        sa.Column("is_manual", sa.Boolean(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("status_code", sa.Integer(), nullable=True),
        sa.Column("records_count", sa.Integer(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["connector_id"],
            ["device_connectors.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_device_connector_logs_connector_id",
        "device_connector_logs",
        ["connector_id"],
    )
    op.create_index(
        "ix_device_connector_logs_triggered_at",
        "device_connector_logs",
        ["triggered_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_device_connector_logs_triggered_at", table_name="device_connector_logs")
    op.drop_index("ix_device_connector_logs_connector_id", table_name="device_connector_logs")
    op.drop_table("device_connector_logs")
