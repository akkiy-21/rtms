from __future__ import annotations

import hashlib
from io import BytesIO
from pathlib import Path
from zipfile import BadZipFile, ZipFile

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..models import AppRelease, AppReleaseStatus, ManagedAppName


EXPECTED_RELEASE_BINARY = {
    ManagedAppName.RTMS_CLIENT.value: "rtms-client-linux-arm64/rtms-client",
}


def _artifact_root() -> Path:
    return Path(__file__).resolve().parents[2] / "storage" / "app_releases"


def _validate_zip_contents(file_bytes: bytes, app_name: ManagedAppName) -> None:
    try:
        with ZipFile(BytesIO(file_bytes)) as archive:
            names = archive.namelist()
    except BadZipFile as exc:
        raise HTTPException(status_code=400, detail="Artifact must be a valid ZIP file") from exc

    expected_entry = EXPECTED_RELEASE_BINARY[app_name.value]
    if expected_entry not in names:
        raise HTTPException(
            status_code=400,
            detail=f"Artifact does not contain required binary: {expected_entry}",
        )


async def create_app_release(
    db: Session,
    uploaded_by: str,
    version: str,
    artifact: UploadFile,
    notes: str | None = None,
) -> AppRelease:
    filename = Path(artifact.filename or "").name
    if not filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Artifact must be a .zip file")

    existing = (
        db.query(AppRelease)
        .filter(
            AppRelease.app_name == ManagedAppName.RTMS_CLIENT.value,
            AppRelease.version == version,
            AppRelease.platform == "linux-arm64",
        )
        .first()
    )
    if existing is not None:
        raise HTTPException(status_code=409, detail="Release version already exists")

    file_bytes = await artifact.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Artifact file is empty")

    _validate_zip_contents(file_bytes, ManagedAppName.RTMS_CLIENT)
    sha256 = hashlib.sha256(file_bytes).hexdigest()

    storage_dir = _artifact_root() / ManagedAppName.RTMS_CLIENT.value / version
    storage_dir.mkdir(parents=True, exist_ok=True)
    storage_path = storage_dir / filename
    storage_path.write_bytes(file_bytes)

    release = AppRelease(
        app_name=ManagedAppName.RTMS_CLIENT.value,
        version=version,
        platform="linux-arm64",
        filename=filename,
        storage_path=str(storage_path),
        sha256=sha256,
        file_size=len(file_bytes),
        status=AppReleaseStatus.READY.value,
        notes=notes,
        uploaded_by=uploaded_by,
    )
    db.add(release)
    db.commit()
    db.refresh(release)
    return release


def list_app_releases(db: Session) -> list[AppRelease]:
    return db.query(AppRelease).order_by(AppRelease.uploaded_at.desc(), AppRelease.id.desc()).all()


def get_app_release(db: Session, release_id: int) -> AppRelease | None:
    return db.query(AppRelease).filter(AppRelease.id == release_id).first()


def delete_app_release(db: Session, release_id: int) -> None:
    from ..models import DeviceActionJob

    release = db.query(AppRelease).filter(AppRelease.id == release_id).first()
    if release is None:
        raise HTTPException(status_code=404, detail="Release not found")

    ref_count = (
        db.query(DeviceActionJob)
        .filter(DeviceActionJob.release_id == release_id)
        .count()
    )
    if ref_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"このリリースは {ref_count} 件のジョブで使用中のため削除できません",
        )

    storage_path = Path(release.storage_path)
    if storage_path.exists():
        storage_path.unlink(missing_ok=True)
        try:
            if storage_path.parent.exists() and not any(storage_path.parent.iterdir()):
                storage_path.parent.rmdir()
        except OSError:
            pass

    db.delete(release)
    db.commit()