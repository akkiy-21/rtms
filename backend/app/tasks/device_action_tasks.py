from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import joinedload

from ..celery_app import celery_app
from ..database import SessionLocal
from ..models import DeviceActionJob, DeviceActionJobItemStatus, DeviceActionJobStatus, DeviceActionType
from ..services import ssh_service


def _update_job_status(job: DeviceActionJob) -> None:
    queued = sum(1 for item in job.items if item.status in {DeviceActionJobItemStatus.QUEUED.value, DeviceActionJobItemStatus.RUNNING.value})
    succeeded = sum(1 for item in job.items if item.status == DeviceActionJobItemStatus.SUCCEEDED.value)
    failed = sum(1 for item in job.items if item.status == DeviceActionJobItemStatus.FAILED.value)
    skipped = sum(1 for item in job.items if item.status == DeviceActionJobItemStatus.SKIPPED.value)

    job.total_items = len(job.items)
    job.queued_items = queued
    job.succeeded_items = succeeded
    job.failed_items = failed
    job.skipped_items = skipped

    if queued > 0:
        job.status = DeviceActionJobStatus.RUNNING.value
        return

    if failed == 0 and skipped == 0:
        job.status = DeviceActionJobStatus.SUCCEEDED.value
    elif failed > 0 and succeeded == 0:
        job.status = DeviceActionJobStatus.FAILED.value
    else:
        job.status = DeviceActionJobStatus.PARTIAL.value


@celery_app.task(name="app.tasks.process_device_action_job")
def process_device_action_job_task(job_id: int) -> None:
    db = SessionLocal()
    try:
        job = (
            db.query(DeviceActionJob)
            .options(joinedload(DeviceActionJob.items), joinedload(DeviceActionJob.release))
            .filter(DeviceActionJob.id == job_id)
            .first()
        )
        if job is None or job.status != DeviceActionJobStatus.QUEUED.value:
            return

        job.status = DeviceActionJobStatus.RUNNING.value
        job.started_at = datetime.utcnow()
        db.commit()

        for item in job.items:
            if item.status != DeviceActionJobItemStatus.QUEUED.value:
                continue

            item.status = DeviceActionJobItemStatus.RUNNING.value
            item.started_at = datetime.utcnow()
            item.attempt_count += 1
            db.commit()

            try:
                if job.action_type == DeviceActionType.REBOOT.value:
                    result = ssh_service.reboot_device(item.last_known_ip_address, item.ssh_username, item.device.ssh_password)
                elif job.action_type == DeviceActionType.SHUTDOWN.value:
                    result = ssh_service.shutdown_device(item.last_known_ip_address, item.ssh_username, item.device.ssh_password)
                elif job.action_type == DeviceActionType.DEPLOY_RTMS_CLIENT.value:
                    if job.release is None:
                        raise RuntimeError("Release is not attached to deploy job")
                    result = ssh_service.deploy_rtms_client(
                        item.last_known_ip_address,
                        item.ssh_username,
                        item.device.ssh_password,
                        job.release.storage_path,
                        job.release.filename,
                    )
                    item.remote_artifact_path = result.get("remote_artifact_path")
                    item.metadata_json = {
                        **(item.metadata_json or {}),
                        "release_id": job.release.id,
                        "release_version": job.release.version,
                        "previous_target": result.get("previous_target"),
                    }
                else:
                    raise RuntimeError(f"Unsupported device action: {job.action_type}")

                item.status = DeviceActionJobItemStatus.SUCCEEDED.value
                item.result_message = result.get("message")
            except Exception as exc:
                item.status = DeviceActionJobItemStatus.FAILED.value
                item.result_message = str(exc)
            finally:
                item.finished_at = datetime.utcnow()
                _update_job_status(job)
                db.commit()

        job.finished_at = datetime.utcnow()
        _update_job_status(job)
        db.commit()
    finally:
        db.close()