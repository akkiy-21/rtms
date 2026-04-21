from datetime import datetime, timedelta, timezone
import secrets

from sqlalchemy.orm import Session

from .. import models, schemas
from . import device_service


PAIRING_CODE_REFRESH_INTERVAL_SECONDS = 30
CONFIRMED_PAIRING_HOLD_SECONDS = 600
CONFIRMED_PAIRING_POLL_INTERVAL_SECONDS = 1
PAIRING_STATE_POLL_INTERVAL_SECONDS = 1


def _utcnow() -> datetime:
    return datetime.utcnow()


def _as_utc_timestamp(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc)
    return value.replace(tzinfo=timezone.utc)


def _normalize_mac_address(mac_address: str) -> str:
    return mac_address.strip().lower()


def _get_pairing_by_mac(db: Session, mac_address: str) -> models.PairingRequests | None:
    return db.query(models.PairingRequests).filter(models.PairingRequests.mac_address == mac_address).first()


def _get_open_pairing_by_code(
    db: Session,
    pairing_code: str,
    *,
    statuses: tuple[schemas.PairingRequestStatus, ...] = (
        schemas.PairingRequestStatus.PENDING,
        schemas.PairingRequestStatus.CONFIRMED,
    ),
) -> models.PairingRequests | None:
    now = _utcnow()
    return db.query(models.PairingRequests).filter(
        models.PairingRequests.pairing_code == pairing_code,
        models.PairingRequests.status.in_([status.value for status in statuses]),
        models.PairingRequests.expires_at.is_not(None),
        models.PairingRequests.expires_at > now,
    ).first()


def _generate_pairing_code(db: Session, current_pairing_id: int | None = None) -> str:
    now = _utcnow()
    for _ in range(100):
        code = f"{secrets.randbelow(10000):04d}"
        query = db.query(models.PairingRequests).filter(
            models.PairingRequests.pairing_code == code,
            models.PairingRequests.status == schemas.PairingRequestStatus.PENDING.value,
            models.PairingRequests.expires_at.is_not(None),
            models.PairingRequests.expires_at > now,
        )
        if current_pairing_id is not None:
            query = query.filter(models.PairingRequests.id != current_pairing_id)
        if query.first() is None:
            return code
    raise ValueError("Failed to generate a unique pairing code")


def request_pairing_code(db: Session, payload: schemas.PairingCodeRequest) -> schemas.ClientPairingCodeResponse:
    normalized_mac = _normalize_mac_address(payload.mac_address)

    existing_device = device_service.get_device_by_mac(db, normalized_mac)
    if existing_device is not None:
        if existing_device.device_status == models.DeviceStatus.DRAFT.value:
            return schemas.ClientPairingCodeResponse(
                status=schemas.ClientPairingStatus.DRAFT,
                refresh_interval_seconds=PAIRING_CODE_REFRESH_INTERVAL_SECONDS,
                poll_interval_seconds=PAIRING_STATE_POLL_INTERVAL_SECONDS,
            )

        pairing = _get_pairing_by_mac(db, normalized_mac)
        if pairing is not None:
            pairing.status = schemas.PairingRequestStatus.REGISTERED.value
            pairing.pairing_code = None
            pairing.expires_at = None
            pairing.updated_at = _utcnow()
            db.commit()
        return schemas.ClientPairingCodeResponse(
            status=schemas.ClientPairingStatus.REGISTERED,
            refresh_interval_seconds=PAIRING_CODE_REFRESH_INTERVAL_SECONDS,
            poll_interval_seconds=PAIRING_STATE_POLL_INTERVAL_SECONDS,
        )

    pairing = _get_pairing_by_mac(db, normalized_mac)
    now = _utcnow()

    if (
        pairing is not None
        and pairing.status == schemas.PairingRequestStatus.CONFIRMED.value
        and pairing.expires_at is not None
        and pairing.expires_at > now
    ):
        return schemas.ClientPairingCodeResponse(
            status=schemas.ClientPairingStatus.CONFIRMED,
            expires_at=_as_utc_timestamp(pairing.expires_at),
            refresh_interval_seconds=CONFIRMED_PAIRING_POLL_INTERVAL_SECONDS,
            poll_interval_seconds=CONFIRMED_PAIRING_POLL_INTERVAL_SECONDS,
        )

    if (
        pairing is not None
        and pairing.status == schemas.PairingRequestStatus.PENDING.value
        and pairing.expires_at is not None
        and pairing.expires_at > now
        and pairing.pairing_code is not None
    ):
        return schemas.ClientPairingCodeResponse(
            status=schemas.ClientPairingStatus.PENDING,
            pairing_code=pairing.pairing_code,
            expires_at=_as_utc_timestamp(pairing.expires_at),
            refresh_interval_seconds=PAIRING_CODE_REFRESH_INTERVAL_SECONDS,
            poll_interval_seconds=PAIRING_STATE_POLL_INTERVAL_SECONDS,
        )

    expires_at = now + timedelta(seconds=PAIRING_CODE_REFRESH_INTERVAL_SECONDS)
    pairing_code = _generate_pairing_code(db, pairing.id if pairing is not None else None)

    if pairing is None:
        pairing = models.PairingRequests(
            mac_address=normalized_mac,
            pairing_code=pairing_code,
            status=schemas.PairingRequestStatus.PENDING.value,
            expires_at=expires_at,
        )
        db.add(pairing)
    else:
        pairing.pairing_code = pairing_code
        pairing.status = schemas.PairingRequestStatus.PENDING.value
        pairing.expires_at = expires_at
        pairing.updated_at = now

    db.commit()
    db.refresh(pairing)

    return schemas.ClientPairingCodeResponse(
        status=schemas.ClientPairingStatus.PENDING,
        pairing_code=pairing.pairing_code,
        expires_at=_as_utc_timestamp(pairing.expires_at),
        refresh_interval_seconds=PAIRING_CODE_REFRESH_INTERVAL_SECONDS,
        poll_interval_seconds=PAIRING_STATE_POLL_INTERVAL_SECONDS,
    )


def get_pairing_by_code(db: Session, pairing_code: str) -> schemas.PairingLookupResponse | None:
    pairing = _get_open_pairing_by_code(db, pairing_code)
    if pairing is None:
        return None

    return schemas.PairingLookupResponse(
        pairing_code=pairing.pairing_code or pairing_code,
        mac_address=pairing.mac_address,
        expires_at=_as_utc_timestamp(pairing.expires_at),
        status=schemas.PairingRequestStatus(pairing.status),
    )


def confirm_pairing_code(db: Session, pairing_code: str) -> schemas.PairingLookupResponse | None:
    pairing = _get_open_pairing_by_code(db, pairing_code)
    if pairing is None:
        return None

    now = _utcnow()
    pairing.status = schemas.PairingRequestStatus.CONFIRMED.value
    pairing.expires_at = now + timedelta(seconds=CONFIRMED_PAIRING_HOLD_SECONDS)
    pairing.updated_at = now
    db.commit()
    db.refresh(pairing)

    return schemas.PairingLookupResponse(
        pairing_code=pairing.pairing_code or pairing_code,
        mac_address=pairing.mac_address,
        expires_at=_as_utc_timestamp(pairing.expires_at),
        status=schemas.PairingRequestStatus(pairing.status),
    )


def release_pairing_code(db: Session, pairing_code: str) -> None:
    pairing = _get_open_pairing_by_code(
        db,
        pairing_code,
        statuses=(schemas.PairingRequestStatus.CONFIRMED,),
    )
    if pairing is None:
        return

    now = _utcnow()
    pairing.status = schemas.PairingRequestStatus.PENDING.value
    pairing.expires_at = now
    pairing.updated_at = now
    db.commit()


def _consume_pairing(db: Session, pairing: models.PairingRequests) -> None:
    pairing.status = schemas.PairingRequestStatus.CONSUMED.value
    pairing.pairing_code = None
    pairing.expires_at = None
    pairing.updated_at = _utcnow()
    db.commit()


def register_device_by_pairing(db: Session, payload: schemas.DeviceRegistrationByPairing):
    pairing = _get_open_pairing_by_code(db, payload.pairing_code)
    if pairing is None:
        raise ValueError("Pairing code is invalid or expired")
    if device_service.get_device_by_mac(db, pairing.mac_address, device_status=models.DeviceStatus.ACTIVE.value) is not None:
        raise ValueError("This device is already registered")

    existing_draft = device_service.get_device_by_mac(db, pairing.mac_address, device_status=models.DeviceStatus.DRAFT.value)
    if existing_draft is not None:
        device = device_service.update_device(
            db,
            existing_draft.id,
            schemas.DeviceUpdate(
                name=payload.name,
                device_status=models.DeviceStatus.ACTIVE.value,
                ssh_username=payload.ssh_username,
                ssh_password=payload.ssh_password,
                standard_cycle_time=payload.standard_cycle_time,
            ),
        )
        _consume_pairing(db, pairing)
        return device

    device = device_service.register_device(
        db,
        schemas.DeviceRegistration(
            mac_address=pairing.mac_address,
            name=payload.name,
            device_status=models.DeviceStatus.ACTIVE.value,
            ssh_username=payload.ssh_username,
            ssh_password=payload.ssh_password,
            standard_cycle_time=payload.standard_cycle_time,
        ),
    )
    _consume_pairing(db, pairing)
    return device


def reassign_device_by_pairing(db: Session, device_id: int, payload: schemas.DeviceReassignmentByPairing):
    pairing = _get_open_pairing_by_code(db, payload.pairing_code)
    if pairing is None:
        raise ValueError("Pairing code is invalid or expired")

    existing_device = device_service.get_device_by_mac(db, pairing.mac_address)
    if existing_device is not None and existing_device.id != device_id:
        raise ValueError("This device is already assigned to another device")

    updated_device = device_service.update_device(
        db,
        device_id,
        schemas.DeviceUpdate(mac_address=pairing.mac_address),
    )
    if updated_device is None:
        raise ValueError("Device not found")

    _consume_pairing(db, pairing)
    return updated_device


def _build_draft_device_name(mac_address: str) -> str:
    suffix = mac_address.replace(':', '').upper()[-6:]
    return f"仮登録 {suffix}"


def create_draft_device_by_pairing(db: Session, payload: schemas.DraftDeviceRegistrationByPairing):
    pairing = _get_open_pairing_by_code(db, payload.pairing_code)
    if pairing is None:
        raise ValueError("Pairing code is invalid or expired")

    existing_active = device_service.get_device_by_mac(db, pairing.mac_address, device_status=models.DeviceStatus.ACTIVE.value)
    if existing_active is not None:
        raise ValueError("This device is already registered")

    existing_draft = device_service.get_device_by_mac(db, pairing.mac_address, device_status=models.DeviceStatus.DRAFT.value)
    if existing_draft is not None:
        _consume_pairing(db, pairing)
        return existing_draft

    device = device_service.register_device(
        db,
        schemas.DeviceRegistration(
            mac_address=pairing.mac_address,
            name=_build_draft_device_name(pairing.mac_address),
            device_status=models.DeviceStatus.DRAFT.value,
        ),
    )
    _consume_pairing(db, pairing)
    return device