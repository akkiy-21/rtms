from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...auth import require_admin_user
from ...database import get_db
from ...schemas import (
    ClientPairingCodeResponse,
    DeviceOut,
    DraftDeviceRegistrationByPairing,
    DeviceRegistrationByPairing,
    DeviceReassignmentByPairing,
    PairingCodeRequest,
    PairingLookupResponse,
)
from ...services import pairing_service


router = APIRouter(
    prefix="/pairings",
    tags=["pairings"],
)


@router.post("/request", response_model=ClientPairingCodeResponse)
def request_pairing_code(payload: PairingCodeRequest, db: Session = Depends(get_db)):
    try:
        return pairing_service.request_pairing_code(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/code/{pairing_code}", response_model=PairingLookupResponse, dependencies=[Depends(require_admin_user)])
def get_pairing_by_code(pairing_code: str, db: Session = Depends(get_db)):
    pairing = pairing_service.get_pairing_by_code(db, pairing_code)
    if pairing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pairing code not found or expired")
    return pairing


@router.post("/code/{pairing_code}/confirm", response_model=PairingLookupResponse, dependencies=[Depends(require_admin_user)])
def confirm_pairing_by_code(pairing_code: str, db: Session = Depends(get_db)):
    pairing = pairing_service.confirm_pairing_code(db, pairing_code)
    if pairing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pairing code not found or expired")
    return pairing


@router.post("/code/{pairing_code}/release", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin_user)])
def release_pairing_by_code(pairing_code: str, db: Session = Depends(get_db)):
    pairing_service.release_pairing_code(db, pairing_code)
    return None


@router.post("/register-device", response_model=DeviceOut, dependencies=[Depends(require_admin_user)])
def register_device_by_pairing(payload: DeviceRegistrationByPairing, db: Session = Depends(get_db)):
    try:
        device = pairing_service.register_device_by_pairing(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if device is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Device registration failed")
    return device


@router.post("/draft-device", response_model=DeviceOut, dependencies=[Depends(require_admin_user)])
def create_draft_device_by_pairing(payload: DraftDeviceRegistrationByPairing, db: Session = Depends(get_db)):
    try:
        device = pairing_service.create_draft_device_by_pairing(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if device is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Draft device registration failed")
    return device


@router.post("/reassign-device/{device_id}", response_model=DeviceOut, dependencies=[Depends(require_admin_user)])
def reassign_device_by_pairing(device_id: int, payload: DeviceReassignmentByPairing, db: Session = Depends(get_db)):
    try:
        device = pairing_service.reassign_device_by_pairing(db, device_id, payload)
    except ValueError as exc:
        message = str(exc)
        status_code = status.HTTP_404_NOT_FOUND if message == "Device not found" else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=message) from exc
    return device