"""remove worker group and active user features

Revision ID: 20260420_03
Revises: 20260420_02
Create Date: 2026-04-20 00:00:02

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260420_03"
down_revision: Union[str, Sequence[str], None] = "20260420_02"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("DROP TABLE IF EXISTS user_measurements CASCADE")
    op.execute("DROP TABLE IF EXISTS user_group CASCADE")
    op.execute("DROP TABLE IF EXISTS groups CASCADE")

    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_name = 'code_length_rules'
            ) THEN
                DELETE FROM code_length_rules
                WHERE code_type::text = 'UserID';
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'code_length_rules'
                  AND column_name = 'code_type'
            )
            AND EXISTS (
                SELECT 1
                FROM pg_type
                WHERE typname = 'codetype'
            )
            AND EXISTS (
                SELECT 1
                FROM pg_enum e
                JOIN pg_type t ON t.oid = e.enumtypid
                WHERE t.typname = 'codetype'
                  AND e.enumlabel = 'UserID'
            ) THEN
                ALTER TABLE code_length_rules
                ALTER COLUMN code_type TYPE VARCHAR(50)
                USING code_type::text;

                DROP TYPE codetype;
                CREATE TYPE codetype AS ENUM ('ProductNumber');

                ALTER TABLE code_length_rules
                ALTER COLUMN code_type TYPE codetype
                USING code_type::codetype;
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM pg_type
                WHERE typname = 'codetype'
            )
            AND NOT EXISTS (
                SELECT 1
                FROM pg_enum e
                JOIN pg_type t ON t.oid = e.enumtypid
                WHERE t.typname = 'codetype'
                  AND e.enumlabel = 'UserID'
            ) THEN
                ALTER TABLE code_length_rules
                ALTER COLUMN code_type TYPE VARCHAR(50)
                USING code_type::text;

                DROP TYPE codetype;
                CREATE TYPE codetype AS ENUM ('UserID', 'ProductNumber');

                ALTER TABLE code_length_rules
                ALTER COLUMN code_type TYPE codetype
                USING code_type::codetype;
            END IF;
        END $$;
        """
    )

    op.create_table(
        "groups",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "user_group",
        sa.Column("user_id", sa.String(length=10), nullable=True),
        sa.Column("group_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["group_id"], ["groups.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )

    op.create_table(
        "user_measurements",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("device_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(length=10), nullable=False),
        sa.Column("state", sa.Boolean(), nullable=False),
        sa.Column("event_time", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["device_id"], ["devices.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.execute(
        """
        INSERT INTO code_length_rules (min_length, max_length, code_type, check_digit)
        SELECT 6, 6, 'UserID', true
        WHERE NOT EXISTS (
            SELECT 1 FROM code_length_rules WHERE code_type::text = 'UserID'
        )
        """
    )