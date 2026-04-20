"""replace planned production fields with ssh settings

Revision ID: 20260420_02
Revises: 20260420_01
Create Date: 2026-04-20 00:00:01

"""

from typing import Sequence, Union

from alembic import op


revision: str = "20260420_02"
down_revision: Union[str, Sequence[str], None] = "20260420_01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE devices
        ADD COLUMN IF NOT EXISTS ssh_username VARCHAR(100),
        ADD COLUMN IF NOT EXISTS ssh_password VARCHAR(255)
        """
    )

    op.execute(
        """
        ALTER TABLE devices
        DROP COLUMN IF EXISTS ssh_remote_path,
        DROP COLUMN IF EXISTS planned_production_quantity,
        DROP COLUMN IF EXISTS planned_production_time
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE devices
        ADD COLUMN IF NOT EXISTS planned_production_quantity INTEGER,
        ADD COLUMN IF NOT EXISTS planned_production_time DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS ssh_remote_path VARCHAR(255)
        """
    )

    op.execute(
        """
        ALTER TABLE devices
        DROP COLUMN IF EXISTS ssh_username,
        DROP COLUMN IF EXISTS ssh_password
        """
    )