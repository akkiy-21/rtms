"""add device connectors

Revision ID: 20260515_01
Revises: 20260422_01
Create Date: 2026-05-15 12:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260515_01"
down_revision: Union[str, None] = "20260422_01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "device_connectors",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("device_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("connector_type", sa.String(length=50), nullable=False, server_default="aggregated_data"),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("api_key_header", sa.String(length=100), nullable=False, server_default="X-Api-Key"),
        sa.Column("api_key_value", sa.String(length=255), nullable=False),
        sa.Column("send_interval_minutes", sa.Integer(), nullable=False, server_default="60"),
        sa.Column("initial_sync_days", sa.Integer(), nullable=False, server_default="7"),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("last_sent_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["device_id"], ["devices.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_device_connectors_device_id", "device_connectors", ["device_id"])


def downgrade() -> None:
    op.drop_index("ix_device_connectors_device_id", table_name="device_connectors")
    op.drop_table("device_connectors")
