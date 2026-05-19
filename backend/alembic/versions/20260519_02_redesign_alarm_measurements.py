"""redesign alarm_measurements: replace alarm_group string with alarm_group_id FK and add alarm_name snapshot

Revision ID: 20260519_02
Revises: 20260519_01
Create Date: 2026-05-19 10:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260519_02"
down_revision: Union[str, None] = "20260519_01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # alarm_measurement_comments は alarm_measurements.id を FK 参照しているため先にドロップ
    op.drop_table("alarm_measurement_comments")
    op.drop_table("alarm_measurements")

    op.create_table(
        "alarm_measurements",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("device_id", sa.Integer(), nullable=False),
        sa.Column("alarm_group_id", sa.Integer(), nullable=False),
        sa.Column("alarm_no", sa.Integer(), nullable=False),
        sa.Column("alarm_name", sa.String(length=255), nullable=True),
        sa.Column("alarm_state", sa.Boolean(), nullable=False),
        sa.Column("event_time", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["device_id"], ["devices.id"]),
        sa.ForeignKeyConstraint(["alarm_group_id"], ["alarm_groups.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_alarm_measurements_device_id_event_time",
        "alarm_measurements",
        ["device_id", "event_time"],
    )

    op.create_table(
        "alarm_measurement_comments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("alarm_measurement_id", sa.Integer(), nullable=False),
        sa.Column("alarm_comment", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["alarm_measurement_id"], ["alarm_measurements.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("alarm_measurement_comments")
    op.drop_table("alarm_measurements")

    op.create_table(
        "alarm_measurements",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("device_id", sa.Integer(), nullable=False),
        sa.Column("alarm_group", sa.String(length=100), nullable=False),
        sa.Column("alarm_no", sa.Integer(), nullable=False),
        sa.Column("alarm_state", sa.Boolean(), nullable=False),
        sa.Column("event_time", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["device_id"], ["devices.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_alarm_measurements_device_id_event_time",
        "alarm_measurements",
        ["device_id", "event_time"],
    )

    op.create_table(
        "alarm_measurement_comments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("alarm_measurement_id", sa.Integer(), nullable=False),
        sa.Column("alarm_comment", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["alarm_measurement_id"], ["alarm_measurements.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
