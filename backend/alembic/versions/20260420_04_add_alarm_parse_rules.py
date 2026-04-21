"""add alarm parse rule management

Revision ID: 20260420_04
Revises: 20260420_03
Create Date: 2026-04-20 00:00:03

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260420_04"
down_revision: Union[str, Sequence[str], None] = "20260420_03"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "alarm_parse_rules",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("skip_header_rows", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("offset_mode", sa.String(length=50), nullable=False, server_default="row_index_word"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "alarm_parse_rule_patterns",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("rule_id", sa.Integer(), nullable=False),
        sa.Column("pattern_name", sa.String(length=100), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("regex_pattern", sa.Text(), nullable=False),
        sa.Column("address_type_value", sa.String(length=50), nullable=True),
        sa.Column("address_type_group", sa.Integer(), nullable=True),
        sa.Column("alarm_no_mode", sa.String(length=50), nullable=False, server_default="line_index"),
        sa.Column("alarm_no_group", sa.Integer(), nullable=True),
        sa.Column("alarm_no_offset", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("address_group", sa.Integer(), nullable=True),
        sa.Column("bit_group", sa.Integer(), nullable=True),
        sa.Column("combined_address_bit_group", sa.Integer(), nullable=True),
        sa.Column("combined_address_bit_separator", sa.String(length=10), nullable=False, server_default="."),
        sa.Column("comment_mode", sa.String(length=50), nullable=False, server_default="none"),
        sa.Column("comment_group", sa.Integer(), nullable=True),
        sa.Column("comment_columns_start", sa.Integer(), nullable=True),
        sa.Column("address_pad_length", sa.Integer(), nullable=False, server_default="4"),
        sa.ForeignKeyConstraint(["rule_id"], ["alarm_parse_rules.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.add_column("alarm_groups", sa.Column("selected_parse_rule_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_alarm_groups_selected_parse_rule_id",
        "alarm_groups",
        "alarm_parse_rules",
        ["selected_parse_rule_id"],
        ["id"],
        ondelete="SET NULL",
    )

    rules_table = sa.table(
        "alarm_parse_rules",
        sa.column("id", sa.Integer()),
        sa.column("name", sa.String()),
        sa.column("description", sa.Text()),
        sa.column("is_active", sa.Boolean()),
        sa.column("skip_header_rows", sa.Integer()),
        sa.column("offset_mode", sa.String()),
    )
    patterns_table = sa.table(
        "alarm_parse_rule_patterns",
        sa.column("id", sa.Integer()),
        sa.column("rule_id", sa.Integer()),
        sa.column("pattern_name", sa.String()),
        sa.column("sort_order", sa.Integer()),
        sa.column("regex_pattern", sa.Text()),
        sa.column("address_type_value", sa.String()),
        sa.column("address_type_group", sa.Integer()),
        sa.column("alarm_no_mode", sa.String()),
        sa.column("alarm_no_group", sa.Integer()),
        sa.column("alarm_no_offset", sa.Integer()),
        sa.column("address_group", sa.Integer()),
        sa.column("bit_group", sa.Integer()),
        sa.column("combined_address_bit_group", sa.Integer()),
        sa.column("combined_address_bit_separator", sa.String()),
        sa.column("comment_mode", sa.String()),
        sa.column("comment_group", sa.Integer()),
        sa.column("comment_columns_start", sa.Integer()),
        sa.column("address_pad_length", sa.Integer()),
    )

    op.bulk_insert(
        rules_table,
        [
            {
                "id": 1,
                "name": "旧CSV形式",
                "description": "[n]Dxxxx:bit 形式を行番号ベースで解釈します。",
                "is_active": True,
                "skip_header_rows": 1,
                "offset_mode": "row_index_word",
            },
            {
                "id": 2,
                "name": "Dアンダースコア形式",
                "description": "Dxxxx_bit:value 形式を行番号ベースで解釈します。",
                "is_active": True,
                "skip_header_rows": 1,
                "offset_mode": "row_index_word",
            },
            {
                "id": 3,
                "name": "GP-Pro EX",
                "description": "GP-Pro EX の Alarm Data CSV から Bit Log セクションを解釈します。",
                "is_active": True,
                "skip_header_rows": 1,
                "offset_mode": "preserve_address",
            },
        ],
    )

    op.bulk_insert(
        patterns_table,
        [
            {
                "id": 1,
                "rule_id": 1,
                "pattern_name": "legacy_d_format",
                "sort_order": 1,
                "regex_pattern": r"\[(\d+)\]D(\d+)\s*:(\d+)",
                "address_type_value": "D",
                "address_type_group": None,
                "alarm_no_mode": "line_index",
                "alarm_no_group": None,
                "alarm_no_offset": 0,
                "address_group": 2,
                "bit_group": 3,
                "combined_address_bit_group": None,
                "combined_address_bit_separator": ".",
                "comment_mode": "csv_columns",
                "comment_group": None,
                "comment_columns_start": 1,
                "address_pad_length": 4,
            },
            {
                "id": 2,
                "rule_id": 2,
                "pattern_name": "d_underscore_format",
                "sort_order": 1,
                "regex_pattern": r"D(\d+)_(\d+)\s*:(\d+)",
                "address_type_value": "D",
                "address_type_group": None,
                "alarm_no_mode": "line_index",
                "alarm_no_group": None,
                "alarm_no_offset": 0,
                "address_group": 1,
                "bit_group": 2,
                "combined_address_bit_group": None,
                "combined_address_bit_separator": ".",
                "comment_mode": "csv_columns",
                "comment_group": None,
                "comment_columns_start": 1,
                "address_pad_length": 4,
            },
            {
                "id": 3,
                "rule_id": 3,
                "pattern_name": "plc_export_format",
                "sort_order": 1,
                "regex_pattern": r"^(\d+),\[PLC\d+\](\d+\.\d{2}),\d,(.*?)(?=\s*,|$)",
                "address_type_value": "",
                "address_type_group": None,
                "alarm_no_mode": "regex_group",
                "alarm_no_group": 1,
                "alarm_no_offset": 0,
                "address_group": None,
                "bit_group": None,
                "combined_address_bit_group": 2,
                "combined_address_bit_separator": ".",
                "comment_mode": "regex_group",
                "comment_group": 3,
                "comment_columns_start": None,
                "address_pad_length": 4,
            },
        ],
    )

    op.execute("SELECT setval(pg_get_serial_sequence('alarm_parse_rules', 'id'), COALESCE((SELECT MAX(id) FROM alarm_parse_rules), 1), true)")
    op.execute("SELECT setval(pg_get_serial_sequence('alarm_parse_rule_patterns', 'id'), COALESCE((SELECT MAX(id) FROM alarm_parse_rule_patterns), 1), true)")


def downgrade() -> None:
    op.drop_constraint("fk_alarm_groups_selected_parse_rule_id", "alarm_groups", type_="foreignkey")
    op.drop_column("alarm_groups", "selected_parse_rule_id")
    op.drop_table("alarm_parse_rule_patterns")
    op.drop_table("alarm_parse_rules")