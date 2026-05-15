# crud/device_connectors.py
from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models import DeviceConnector
from app.schemas import DeviceConnectorCreate, DeviceConnectorUpdate


def get_connectors_by_device(db: Session, device_id: int) -> List[DeviceConnector]:
    return (
        db.query(DeviceConnector)
        .filter(DeviceConnector.device_id == device_id)
        .order_by(DeviceConnector.created_at)
        .all()
    )


def get_connector(db: Session, connector_id: int) -> Optional[DeviceConnector]:
    return db.query(DeviceConnector).filter(DeviceConnector.id == connector_id).first()


def get_all_enabled_connectors(db: Session) -> List[DeviceConnector]:
    return db.query(DeviceConnector).filter(DeviceConnector.is_enabled == True).all()


def create_connector(db: Session, device_id: int, data: DeviceConnectorCreate) -> DeviceConnector:
    now = datetime.utcnow()
    connector = DeviceConnector(
        device_id=device_id,
        name=data.name,
        connector_type=data.connector_type,
        url=data.url,
        api_key_header=data.api_key_header,
        api_key_value=data.api_key_value,
        send_interval_minutes=data.send_interval_minutes,
        initial_sync_days=data.initial_sync_days,
        is_enabled=data.is_enabled,
        created_at=now,
        updated_at=now,
    )
    db.add(connector)
    db.commit()
    db.refresh(connector)
    return connector


def update_connector(db: Session, connector_id: int, data: DeviceConnectorUpdate) -> Optional[DeviceConnector]:
    connector = get_connector(db, connector_id)
    if connector is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(connector, field, value)
    connector.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(connector)
    return connector


def delete_connector(db: Session, connector_id: int) -> bool:
    connector = get_connector(db, connector_id)
    if connector is None:
        return False
    db.delete(connector)
    db.commit()
    return True


def update_last_sent_at(db: Session, connector_id: int, sent_at: datetime) -> None:
    connector = get_connector(db, connector_id)
    if connector is not None:
        connector.last_sent_at = sent_at
        connector.updated_at = datetime.utcnow()
        db.commit()
