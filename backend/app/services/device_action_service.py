from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from ..models import AppRelease, DeviceActionJob, DeviceActionJobItem, DeviceActionJobItemStatus, DeviceActionJobStatus, DeviceActionType, Devices
from ..schemas import DeviceActionJobRequest, DeviceDeployJobRequest


def _load_release_for_deploy(db: Session, release_id: int) -> AppRelease:
    release = db.query(AppRelease).filter(AppRelease.id == release_id).first()
    if release is None:
        raise HTTPException(status_code=404, detail="Release not found")
    return release


def _load_devices(db: Session, device_ids: list[int]) -> list[Devices]:
    devices = db.query(Devices).filter(Devices.id.in_(device_ids)).all()
    found_ids = {device.id for device in devices}
    missing = sorted(set(device_ids) - found_ids)
    if missing:
        raise HTTPException(status_code=400, detail=f"Devices not found: {missing}")
    device_order = {device_id: index for index, device_id in enumerate(device_ids)}
    devices.sort(key=lambda device: device_order[device.id])
    return devices


def _build_item(device: Devices) -> DeviceActionJobItem:
    status = DeviceActionJobItemStatus.QUEUED.value
    result_message = None
    if device.device_status != "active":
        status = DeviceActionJobItemStatus.SKIPPED.value
        result_message = "Device is not active"
    elif not device.last_known_ip_address:
        status = DeviceActionJobItemStatus.SKIPPED.value
        result_message = "Device last_known_ip_address is not set"
    elif not device.ssh_username or not device.ssh_password:
        status = DeviceActionJobItemStatus.SKIPPED.value
        result_message = "SSH credentials are not configured"

    return DeviceActionJobItem(
        device_id=device.id,
        device_name=device.name,
        mac_address=device.mac_address,
        last_known_ip_address=device.last_known_ip_address,
        ssh_username=device.ssh_username,
        status=status,
        result_message=result_message,
    )


def _finalize_counts(job: DeviceActionJob) -> None:
    job.total_items = len(job.items)
    job.queued_items = sum(1 for item in job.items if item.status in {DeviceActionJobItemStatus.QUEUED.value, DeviceActionJobItemStatus.RUNNING.value})
    job.succeeded_items = sum(1 for item in job.items if item.status == DeviceActionJobItemStatus.SUCCEEDED.value)
    job.failed_items = sum(1 for item in job.items if item.status == DeviceActionJobItemStatus.FAILED.value)
    job.skipped_items = sum(1 for item in job.items if item.status == DeviceActionJobItemStatus.SKIPPED.value)


def _enqueue_job(job_id: int) -> None:
    from ..tasks.device_action_tasks import process_device_action_job_task

    process_device_action_job_task.delay(job_id)


def create_device_action_job(db: Session, requested_by: str, payload: DeviceActionJobRequest) -> DeviceActionJob:
    devices = _load_devices(db, payload.device_ids)

    job = DeviceActionJob(
        action_type=payload.action_type.value,
        status=DeviceActionJobStatus.QUEUED.value,
        scope=payload.scope,
        requested_by=requested_by,
    )
    for device in devices:
        job.items.append(_build_item(device))

    _finalize_counts(job)
    if job.queued_items == 0:
        job.status = DeviceActionJobStatus.FAILED.value
        job.finished_at = datetime.utcnow()
        job.error_message = "No actionable devices were found"

    db.add(job)
    db.commit()
    db.refresh(job)

    if job.status == DeviceActionJobStatus.QUEUED.value:
        _enqueue_job(job.id)

    return get_device_action_job(db, job.id)


def create_deploy_job(db: Session, requested_by: str, payload: DeviceDeployJobRequest) -> DeviceActionJob:
    devices = _load_devices(db, payload.device_ids)
    release = _load_release_for_deploy(db, payload.release_id)

    job = DeviceActionJob(
        action_type=DeviceActionType.DEPLOY_RTMS_CLIENT.value,
        status=DeviceActionJobStatus.QUEUED.value,
        scope=payload.scope,
        requested_by=requested_by,
        release_id=release.id,
    )
    for device in devices:
        item = _build_item(device)
        item.metadata_json = {"release_id": release.id, "release_version": release.version}
        job.items.append(item)

    _finalize_counts(job)
    if job.queued_items == 0:
        job.status = DeviceActionJobStatus.FAILED.value
        job.finished_at = datetime.utcnow()
        job.error_message = "No actionable devices were found"

    db.add(job)
    db.commit()
    db.refresh(job)

    if job.status == DeviceActionJobStatus.QUEUED.value:
        _enqueue_job(job.id)

    return get_device_action_job(db, job.id)


def list_device_action_jobs(db: Session) -> list[DeviceActionJob]:
    return (
        db.query(DeviceActionJob)
        .options(joinedload(DeviceActionJob.items))
        .order_by(DeviceActionJob.requested_at.desc(), DeviceActionJob.id.desc())
        .all()
    )


def get_device_action_job(db: Session, job_id: int) -> DeviceActionJob | None:
    return (
        db.query(DeviceActionJob)
        .options(joinedload(DeviceActionJob.items))
        .filter(DeviceActionJob.id == job_id)
        .first()
    )