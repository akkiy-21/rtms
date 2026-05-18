"""add on_duplicate to device_connectors

Revision ID: 20260518_01
Revises: 20260515_01
Create Date: 2026-05-18 10:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260518_01"
down_revision: Union[str, None] = "20260515_01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "device_connectors",
        sa.Column(
            "on_duplicate",
            sa.String(length=20),
            nullable=False,
            server_default="ignore",
        ),
    )


def downgrade() -> None:
    op.drop_column("device_connectors", "on_duplicate")
