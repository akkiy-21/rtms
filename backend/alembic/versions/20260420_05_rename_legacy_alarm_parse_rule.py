"""rename legacy alarm parse rule

Revision ID: 20260420_05
Revises: 20260420_04
Create Date: 2026-04-20 00:00:04

"""

from typing import Sequence, Union

from alembic import op


revision: str = "20260420_05"
down_revision: Union[str, Sequence[str], None] = "20260420_04"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE alarm_parse_rules
        SET name = 'Keyence VTシリーズ',
            description = 'Keyence VTシリーズの [n]Dxxxx:bit 形式を行番号ベースで解釈します。'
        WHERE name = '旧CSV形式'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE alarm_parse_rules
        SET name = '旧CSV形式',
            description = '[n]Dxxxx:bit 形式を行番号ベースで解釈します。'
        WHERE name = 'Keyence VTシリーズ'
        """
    )