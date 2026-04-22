"""add device action jobs and app releases

Revision ID: 20260422_01
Revises: 20260421_03
Create Date: 2026-04-22 12:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260422_01"
down_revision: Union[str, None] = "20260421_03"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "app_releases",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("app_name", sa.String(length=50), nullable=False, server_default="rtms-client"),
        sa.Column("version", sa.String(length=100), nullable=False),
        sa.Column("platform", sa.String(length=50), nullable=False, server_default="linux-arm64"),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("storage_path", sa.String(length=500), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="ready"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("uploaded_by", sa.String(length=10), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["uploaded_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("app_name", "version", "platform", name="uq_app_release_name_version_platform"),
    )

    op.create_table(
        "device_action_jobs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("action_type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="queued"),
        sa.Column("scope", sa.String(length=50), nullable=False, server_default="selection"),
        sa.Column("requested_by", sa.String(length=10), nullable=True),
        sa.Column("release_id", sa.Integer(), nullable=True),
        sa.Column("requested_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("finished_at", sa.DateTime(), nullable=True),
        sa.Column("total_items", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("queued_items", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("succeeded_items", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("failed_items", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("skipped_items", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["release_id"], ["app_releases.id"]),
        sa.ForeignKeyConstraint(["requested_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_device_action_jobs_status_requested_at", "device_action_jobs", ["status", "requested_at"], unique=False)

    op.create_table(
        "device_action_job_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("job_id", sa.Integer(), nullable=False),
        sa.Column("device_id", sa.Integer(), nullable=False),
        sa.Column("device_name", sa.String(length=100), nullable=True),
        sa.Column("mac_address", sa.String(length=17), nullable=True),
        sa.Column("last_known_ip_address", sa.String(length=45), nullable=True),
        sa.Column("ssh_username", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="queued"),
        sa.Column("result_message", sa.Text(), nullable=True),
        sa.Column("remote_artifact_path", sa.String(length=500), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("finished_at", sa.DateTime(), nullable=True),
        sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["device_id"], ["devices.id"]),
        sa.ForeignKeyConstraint(["job_id"], ["device_action_jobs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_device_action_job_items_job_status", "device_action_job_items", ["job_id", "status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_device_action_job_items_job_status", table_name="device_action_job_items")
    op.drop_table("device_action_job_items")
    op.drop_index("ix_device_action_jobs_status_requested_at", table_name="device_action_jobs")
    op.drop_table("device_action_jobs")
    op.drop_table("app_releases")