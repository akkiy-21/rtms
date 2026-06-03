from __future__ import annotations

import logging
from datetime import datetime

from celery.signals import worker_ready
from sqlalchemy.orm import joinedload

from ..celery_app import celery_app
from ..database import SessionLocal
from ..models import DeviceActionJob, DeviceActionJobItem, DeviceActionJobItemStatus, DeviceActionJobStatus, DeviceActionType
from ..services import ssh_service

logger = logging.getLogger(__name__)


@worker_ready.connect
def _recover_stuck_jobs(sender, **kwargs):
    """ワーカー起動時に「running」状態でスタックしているジョブを復旧する。

    ワーカーが強制終了した場合、実行中だったジョブのアイテムが
    running 状態のまま残る。これを failed にリセットしてジョブを
    再キューに投入することで自動復旧する。
    """
    db = SessionLocal()
    try:
        # running 状態のジョブアイテムを failed にリセット
        stuck_items = (
            db.query(DeviceActionJobItem)
            .filter(DeviceActionJobItem.status == DeviceActionJobItemStatus.RUNNING.value)
            .all()
        )
        if not stuck_items:
            return

        affected_job_ids: set[int] = set()
        for item in stuck_items:
            item.status = DeviceActionJobItemStatus.FAILED.value
            item.result_message = "ワーカーが再起動したため処理が中断されました"
            item.finished_at = datetime.utcnow()
            affected_job_ids.add(item.job_id)
        db.commit()

        # 影響を受けたジョブのステータスを更新
        for job_id in affected_job_ids:
            job = (
                db.query(DeviceActionJob)
                .options(joinedload(DeviceActionJob.items))
                .filter(DeviceActionJob.id == job_id)
                .first()
            )
            if job is None:
                continue
            # queued なアイテムが残っていれば再ディスパッチ
            has_queued = any(
                item.status == DeviceActionJobItemStatus.QUEUED.value for item in job.items
            )
            if has_queued:
                job.status = DeviceActionJobStatus.QUEUED.value
                job.started_at = None
                db.commit()
                process_device_action_job_task.apply_async(
                    args=[job_id], queue="device_actions"
                )
                logger.warning("Recovered and re-queued job %s after worker restart.", job_id)
            else:
                _update_job_status(job)
                job.finished_at = datetime.utcnow()
                db.commit()
                logger.warning("Marked stuck job %s as finished after worker restart.", job_id)
    except Exception:
        logger.exception("Error during stuck job recovery on worker startup.")
    finally:
        db.close()


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
        # cancel_requested の場合はそのまま維持（次のループで残アイテムを SKIPPED にする）
        if job.status != DeviceActionJobStatus.CANCEL_REQUESTED.value:
            job.status = DeviceActionJobStatus.RUNNING.value
        return

    # 全アイテム処理完了
    if job.status == DeviceActionJobStatus.CANCEL_REQUESTED.value:
        job.status = DeviceActionJobStatus.CANCELLED.value
    elif failed == 0 and skipped == 0:
        job.status = DeviceActionJobStatus.SUCCEEDED.value
    elif failed > 0 and succeeded == 0:
        job.status = DeviceActionJobStatus.FAILED.value
    else:
        job.status = DeviceActionJobStatus.PARTIAL.value


@celery_app.task(
    name="app.tasks.process_device_action_job",
    acks_late=True,
    reject_on_worker_lost=True,
    queue="device_actions",
)
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

            # キャンセル要求が来ている場合は残りの未処理アイテムをスキップ
            db.refresh(job)
            if job.status == DeviceActionJobStatus.CANCEL_REQUESTED.value:
                item.status = DeviceActionJobItemStatus.SKIPPED.value
                item.result_message = "ジョブがキャンセルされました"
                item.finished_at = datetime.utcnow()
                db.commit()
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