"""add last known ip address

Revision ID: 20260420_01
Revises: 
Create Date: 2026-04-20 00:00:00

"""

from typing import Sequence, Union

from alembic import op


revision: str = "20260420_01"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE devices
        ADD COLUMN IF NOT EXISTS last_known_ip_address VARCHAR(45)
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE devices
        DROP COLUMN IF EXISTS last_known_ip_address
        """
    )