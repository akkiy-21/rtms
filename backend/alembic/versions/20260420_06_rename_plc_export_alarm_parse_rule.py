"""rename plc export alarm parse rule

Revision ID: 20260420_06
Revises: 20260420_05
Create Date: 2026-04-20 00:00:05

"""

from typing import Sequence, Union

from alembic import op


revision: str = "20260420_06"
down_revision: Union[str, Sequence[str], None] = "20260420_05"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE alarm_parse_rules
        SET name = 'GP-Pro EX',
            description = 'GP-Pro EX の Alarm Data CSV から Bit Log セクションを解釈します。'
        WHERE name = 'PLC拡張形式'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE alarm_parse_rules
        SET name = 'PLC拡張形式',
            description = 'PLCエクスポート形式の alarm_no,address.bit,comment を解釈します。'
        WHERE name = 'GP-Pro EX'
        """
    )