"""fix on_duplicate values: ignore->skip, update->upsert, default->append

Revision ID: 20260518_03
Revises: 20260518_02
Create Date: 2026-05-18 11:30:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260518_03"
down_revision: Union[str, None] = "20260518_02"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 既存レコードの値を変換: ignore→skip, update→upsert
    op.execute("UPDATE device_connectors SET on_duplicate = 'skip' WHERE on_duplicate = 'ignore'")
    op.execute("UPDATE device_connectors SET on_duplicate = 'upsert' WHERE on_duplicate = 'update'")
    # カラムのデフォルト値を append に変更
    op.alter_column(
        "device_connectors",
        "on_duplicate",
        server_default="append",
    )


def downgrade() -> None:
    op.execute("UPDATE device_connectors SET on_duplicate = 'ignore' WHERE on_duplicate = 'skip'")
    op.execute("UPDATE device_connectors SET on_duplicate = 'update' WHERE on_duplicate = 'upsert'")
    op.alter_column(
        "device_connectors",
        "on_duplicate",
        server_default="ignore",
    )
