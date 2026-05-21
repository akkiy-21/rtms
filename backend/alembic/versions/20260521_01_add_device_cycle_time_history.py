"""add device_cycle_time_history table

Revision ID: 20260521_01
Revises: 20260519_03
Create Date: 2026-05-21
"""
from typing import Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column


revision: str = "20260521_01"
down_revision: Union[str, None] = "20260519_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "device_cycle_time_history",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "device_id",
            sa.Integer(),
            sa.ForeignKey("devices.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("standard_cycle_time", sa.Float(), nullable=False),
        sa.Column("applied_at", sa.DateTime(), nullable=False),
    )
    op.create_index(
        "ix_device_cycle_time_history_device_id_applied_at",
        "device_cycle_time_history",
        ["device_id", "applied_at"],
    )

    # 既存デバイスの standard_cycle_time が設定済みのものをシード
    # devices テーブルへの参照に bind を使用してデータ移行
    connection = op.get_bind()
    connection.execute(
        sa.text(
            """
            INSERT INTO device_cycle_time_history (device_id, standard_cycle_time, applied_at)
            SELECT id, standard_cycle_time, NOW()
            FROM devices
            WHERE standard_cycle_time IS NOT NULL
            """
        )
    )


def downgrade() -> None:
    op.drop_index(
        "ix_device_cycle_time_history_device_id_applied_at",
        table_name="device_cycle_time_history",
    )
    op.drop_table("device_cycle_time_history")
