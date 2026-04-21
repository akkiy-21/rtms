"""add pairing requests

Revision ID: 20260421_02
Revises: 20260421_01_add_user_auth_state
Create Date: 2026-04-21 18:30:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260421_02"
down_revision: Union[str, None] = "20260421_01_add_user_auth_state"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "pairing_requests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("mac_address", sa.String(length=17), nullable=False),
        sa.Column("pairing_code", sa.String(length=4), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("mac_address"),
    )
    op.create_index(op.f("ix_pairing_requests_mac_address"), "pairing_requests", ["mac_address"], unique=False)
    op.create_index(op.f("ix_pairing_requests_pairing_code"), "pairing_requests", ["pairing_code"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_pairing_requests_pairing_code"), table_name="pairing_requests")
    op.drop_index(op.f("ix_pairing_requests_mac_address"), table_name="pairing_requests")
    op.drop_table("pairing_requests")
