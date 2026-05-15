# app/api/endpoints/device_connectors.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...auth import require_admin_user
from ...crud import device_connectors as connector_crud
from ...database import get_db
from ...schemas import DeviceConnectorCreate, DeviceConnectorResponse, DeviceConnectorUpdate
from ...tasks.connector_tasks import send_connector_data

router = APIRouter(
    prefix="/devices",
    tags=["device-connectors"],
)


def _get_connector_or_404(db: Session, device_id: int, connector_id: int):
    connector = connector_crud.get_connector(db, connector_id)
    if connector is None or connector.device_id != device_id:
        raise HTTPException(status_code=404, detail="Connector not found.")
    return connector


@router.get(
    "/{device_id}/connectors",
    response_model=List[DeviceConnectorResponse],
    dependencies=[Depends(require_admin_user)],
)
def list_connectors(device_id: int, db: Session = Depends(get_db)):
    return connector_crud.get_connectors_by_device(db, device_id)


@router.post(
    "/{device_id}/connectors",
    response_model=DeviceConnectorResponse,
    status_code=201,
    dependencies=[Depends(require_admin_user)],
)
def create_connector(device_id: int, body: DeviceConnectorCreate, db: Session = Depends(get_db)):
    return connector_crud.create_connector(db, device_id, body)


@router.get(
    "/{device_id}/connectors/{connector_id}",
    response_model=DeviceConnectorResponse,
    dependencies=[Depends(require_admin_user)],
)
def get_connector(device_id: int, connector_id: int, db: Session = Depends(get_db)):
    return _get_connector_or_404(db, device_id, connector_id)


@router.put(
    "/{device_id}/connectors/{connector_id}",
    response_model=DeviceConnectorResponse,
    dependencies=[Depends(require_admin_user)],
)
def update_connector(
    device_id: int, connector_id: int, body: DeviceConnectorUpdate, db: Session = Depends(get_db)
):
    _get_connector_or_404(db, device_id, connector_id)
    updated = connector_crud.update_connector(db, connector_id, body)
    return updated


@router.delete(
    "/{device_id}/connectors/{connector_id}",
    status_code=204,
    dependencies=[Depends(require_admin_user)],
)
def delete_connector(device_id: int, connector_id: int, db: Session = Depends(get_db)):
    _get_connector_or_404(db, device_id, connector_id)
    connector_crud.delete_connector(db, connector_id)


@router.post(
    "/{device_id}/connectors/{connector_id}/trigger",
    status_code=202,
    dependencies=[Depends(require_admin_user)],
)
def trigger_connector(device_id: int, connector_id: int, db: Session = Depends(get_db)):
    """コネクタを手動実行（接続テスト兼用）。直近 initial_sync_days 日分を送信する。"""
    _get_connector_or_404(db, device_id, connector_id)
    send_connector_data.delay(connector_id, manual=True)
    return {"detail": "Connector task queued."}
