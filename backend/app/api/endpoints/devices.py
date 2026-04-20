from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Union

from ...database import get_db
from ...schemas import DeviceRegistration, DeviceOut, DeviceUpdate, Client, ClientAssociation, ClientCreate, EfficiencyAddress, EfficiencyAddressCreate, EfficiencyAddressUpdate, AlarmGroup, AlarmGroupCreate, AlarmGroupUpdate, AlarmAddress, AlarmAddressCreate, AlarmComment, AlarmCommentCreate, LoggingSetting, LoggingSettingCreate, LoggingSettingUpdate, LoggingDataSetting, LoggingDataSettingCreate, LoggingDataSettingUpdate, QualityControlSignal, QualityControlSignalCreate, QualityControlSignalUpdate, DeviceProductAssociationResponse, DeviceProductAssociation, DeviceFullInfo, TimeTable, UserMeasurement, DeviceInfo
from ...services import device_service

router = APIRouter(
    prefix="/devices",
    tags=["devices"]
)

@router.post("", response_model=DeviceOut, status_code=201)
async def register_device(registration: DeviceRegistration, db: Session = Depends(get_db)):
    device = device_service.register_device(db, registration)
    if device is None:
        raise HTTPException(status_code=400, detail="Device registration failed")
    return device

@router.get("", response_model=List[DeviceOut])
async def get_devices(db: Session = Depends(get_db)):
    return device_service.get_devices(db)

@router.get("/{device_id}", response_model=DeviceOut)
async def get_device(device_id: int, db: Session = Depends(get_db)):
    device = device_service.get_device(db, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.put("/{device_id}", response_model=DeviceOut)
async def update_device(device_id: int, device_update: DeviceUpdate, db: Session = Depends(get_db)):
    updated_device = device_service.update_device(db, device_id, device_update)
    if updated_device is None:
        raise HTTPException(status_code=404, detail="Device not found or could not be updated")
    return updated_device

@router.delete("/{device_id}", status_code=204)
async def delete_device(device_id: int, db: Session = Depends(get_db)):
    success = device_service.delete_device(db, device_id)
    if not success:
        raise HTTPException(status_code=404, detail="Device not found")
    return None

@router.get("/{device_id}/device-info", response_model=DeviceInfo)
async def get_device_info(device_id: int, db: Session = Depends(get_db)):
    device = device_service.get_device(db, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return DeviceInfo(
        id=device.id,
        mac_address=device.mac_address,
        name=device.name,
        standard_cycle_time=device.standard_cycle_time,
        planned_production_quantity=device.planned_production_quantity,
        planned_production_time=device.planned_production_time
    )

@router.get("/full-info/{mac_address}", response_model=DeviceFullInfo)
async def get_device_full_info(mac_address: str, db: Session = Depends(get_db)):
    device_info = device_service.get_device_full_info(db, mac_address)
    if device_info is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return device_info

# クライアント関連のエンドポイント
client_router = APIRouter(prefix="/{device_id}/clients", tags=["device_clients"])

@client_router.get("", response_model=List[Client])
async def get_clients_for_device(device_id: int, db: Session = Depends(get_db)):
    device = device_service.get_device(db, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return device_service.get_clients_for_device(db, device_id)

@client_router.post("", response_model=DeviceOut)
async def associate_clients_with_device(
    device_id: int,
    client_data: Union[ClientCreate, ClientAssociation],
    db: Session = Depends(get_db)
):
    if isinstance(client_data, ClientCreate):
        clients = [client_data]
    else:
        clients = client_data.clients

    updated_device = device_service.associate_clients_with_device(db, device_id, clients)
    if updated_device is None:
        raise HTTPException(status_code=404, detail="Device not found or clients could not be associated")
    return updated_device

@client_router.get("/{client_id}", response_model=Client)
async def get_client_for_device(device_id: int, client_id: int, db: Session = Depends(get_db)):
    client = device_service.get_client_for_device(db, device_id, client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found for this device")
    return client

@client_router.put("/{client_id}", response_model=Client)
async def update_client_for_device(
    device_id: int,
    client_id: int,
    client_data: ClientCreate,
    db: Session = Depends(get_db)
):
    updated_client = device_service.update_client_for_device(db, device_id, client_id, client_data)
    if updated_client is None:
        raise HTTPException(status_code=404, detail="Client not found or could not be updated")
    return updated_client

@client_router.delete("/{client_id}", status_code=204)
async def delete_client_for_device(
    device_id: int,
    client_id: int,
    db: Session = Depends(get_db)
):
    success = device_service.delete_client_for_device(db, device_id, client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Client not found or could not be deleted")
    return None

# 効率アドレス関連のエンドポイント
efficiency_router = APIRouter(prefix="/{device_id}/efficiency-addresses", tags=["device_efficiency_addresses"])

@efficiency_router.get("", response_model=List[EfficiencyAddress])
def get_efficiency_addresses(device_id: int, db: Session = Depends(get_db)):
    return device_service.get_efficiency_addresses(db, device_id)

@efficiency_router.post("", response_model=EfficiencyAddress)
def create_efficiency_address(
    device_id: int,
    efficiency_address: EfficiencyAddressCreate,
    db: Session = Depends(get_db)
):
    return device_service.create_efficiency_address(db, device_id, efficiency_address)

@efficiency_router.put("/{efficiency_address_id}", response_model=EfficiencyAddress)
def update_efficiency_address(device_id: int, efficiency_address_id: int, efficiency_address: EfficiencyAddressUpdate, db: Session = Depends(get_db)):
    updated = device_service.update_efficiency_address(db, efficiency_address_id, efficiency_address)
    if not updated:
        raise HTTPException(status_code=404, detail="Efficiency address not found")
    return updated

@efficiency_router.delete("/{efficiency_address_id}", status_code=204)
def delete_efficiency_address(device_id: int, efficiency_address_id: int, db: Session = Depends(get_db)):
    if not device_service.delete_efficiency_address(db, efficiency_address_id):
        raise HTTPException(status_code=404, detail="Efficiency address not found")
    return {"message": "Efficiency address deleted successfully"}

# アラームグループ関連のエンドポイント
alarm_group_router = APIRouter(prefix="/{device_id}/alarm-groups", tags=["device_alarm_groups"])

@alarm_group_router.get("", response_model=List[AlarmGroup])
async def get_alarm_groups(device_id: int, db: Session = Depends(get_db)):
    device = device_service.get_device(db, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return device_service.get_alarm_groups(db, device_id)

@alarm_group_router.post("", response_model=AlarmGroup)
async def create_alarm_group(device_id: int, alarm_group: AlarmGroupCreate, db: Session = Depends(get_db)):
    device = device_service.get_device(db, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return device_service.create_alarm_group(db, device_id, alarm_group)

@alarm_group_router.get("/{alarm_group_id}", response_model=AlarmGroup)
async def get_alarm_group(device_id: int, alarm_group_id: int, db: Session = Depends(get_db)):
    alarm_group = device_service.get_alarm_group(db, device_id, alarm_group_id)
    if alarm_group is None:
        raise HTTPException(status_code=404, detail="Alarm group not found for this device")
    return alarm_group

@alarm_group_router.put("/{alarm_group_id}", response_model=AlarmGroup)
async def update_alarm_group(device_id: int, alarm_group_id: int, alarm_group: AlarmGroupUpdate, db: Session = Depends(get_db)):
    updated_alarm_group = device_service.update_alarm_group(db, device_id, alarm_group_id, alarm_group)
    if updated_alarm_group is None:
        raise HTTPException(status_code=404, detail="Alarm group not found or could not be updated")
    return updated_alarm_group

@alarm_group_router.delete("/{alarm_group_id}", status_code=204)
async def delete_alarm_group(device_id: int, alarm_group_id: int, db: Session = Depends(get_db)):
    success = device_service.delete_alarm_group(db, device_id, alarm_group_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alarm group not found or could not be deleted")
    return None

# アラームアドレス関連のエンドポイント
alarm_address_router = APIRouter(prefix="/{device_id}/alarm-groups/{alarm_group_id}/addresses", tags=["device_alarm_addresses"])

@alarm_address_router.get("", response_model=List[AlarmAddress])
async def get_alarm_addresses(device_id: int, alarm_group_id: int, db: Session = Depends(get_db)):
    alarm_group = device_service.get_alarm_group(db, device_id, alarm_group_id)
    if alarm_group is None:
        raise HTTPException(status_code=404, detail="Alarm group not found for this device")
    return device_service.get_alarm_addresses(db, alarm_group_id)

@alarm_address_router.post("", response_model=AlarmAddress)
async def create_alarm_address(device_id: int, alarm_group_id: int, alarm_address: AlarmAddressCreate, db: Session = Depends(get_db)):
    alarm_group = device_service.get_alarm_group(db, device_id, alarm_group_id)
    if alarm_group is None:
        raise HTTPException(status_code=404, detail="Alarm group not found for this device")
    return device_service.create_alarm_address(db, alarm_group_id, alarm_address)

# アラームアドレスの更新と削除のエンドポイントも同様に実装

# アラームコメント関連のエンドポイント
alarm_comment_router = APIRouter(prefix="/{device_id}/alarm-groups/{alarm_group_id}/addresses/{alarm_address_id}/comments", tags=["device_alarm_comments"])

@alarm_comment_router.get("", response_model=List[AlarmComment])
async def get_alarm_comments(device_id: int, alarm_group_id: int, alarm_address_id: int, db: Session = Depends(get_db)):
    alarm_address = device_service.get_alarm_address(db, device_id, alarm_group_id, alarm_address_id)
    if alarm_address is None:
        raise HTTPException(status_code=404, detail="Alarm address not found for this device and alarm group")
    return device_service.get_alarm_comments(db, alarm_address_id)

@alarm_comment_router.post("", response_model=AlarmComment)
async def create_alarm_comment(device_id: int, alarm_group_id: int, alarm_address_id: int, alarm_comment: AlarmCommentCreate, db: Session = Depends(get_db)):
    alarm_address = device_service.get_alarm_address(db, device_id, alarm_group_id, alarm_address_id)
    if alarm_address is None:
        raise HTTPException(status_code=404, detail="Alarm address not found for this device and alarm group")
    return device_service.create_alarm_comment(db, alarm_address_id, alarm_comment)

@router.put("/{device_id}/alarm-groups/{alarm_group_id}/addresses/bulk", response_model=List[AlarmAddress])
async def update_alarm_addresses(
    device_id: int,
    alarm_group_id: int,
    alarm_addresses: List[AlarmAddressCreate],
    db: Session = Depends(get_db)
):
    try:
        updated_addresses = device_service.update_alarm_addresses(db, device_id, alarm_group_id, alarm_addresses)
        return updated_addresses
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while updating alarm addresses")
        
# Logging関連のエンドポイント
@router.get("/{device_id}/logging-settings", response_model=List[LoggingSetting])
def get_logging_settings(device_id: int, db: Session = Depends(get_db)):
    return device_service.get_logging_settings(db, device_id)

@router.post("/{device_id}/logging-settings", response_model=LoggingSetting)
def create_logging_setting(device_id: int, logging_setting: LoggingSettingCreate, db: Session = Depends(get_db)):
    return device_service.create_logging_setting(db, device_id, logging_setting)

@router.get("/{device_id}/logging-settings/{logging_setting_id}", response_model=LoggingSetting)
def get_logging_setting(device_id: int, logging_setting_id: int, db: Session = Depends(get_db)):
    logging_setting = device_service.get_logging_setting(db, logging_setting_id)
    if logging_setting is None:
        raise HTTPException(status_code=404, detail="Logging setting not found")
    return logging_setting

@router.put("/{device_id}/logging-settings/{logging_setting_id}", response_model=LoggingSetting)
def update_logging_setting(device_id: int, logging_setting_id: int, logging_setting: LoggingSettingUpdate, db: Session = Depends(get_db)):
    updated_logging_setting = device_service.update_logging_setting(db, logging_setting_id, logging_setting)
    if updated_logging_setting is None:
        raise HTTPException(status_code=404, detail="Logging setting not found")
    return updated_logging_setting

@router.delete("/{device_id}/logging-settings/{logging_setting_id}", status_code=204)
def delete_logging_setting(device_id: int, logging_setting_id: int, db: Session = Depends(get_db)):
    if not device_service.delete_logging_setting(db, logging_setting_id):
        raise HTTPException(status_code=404, detail="Logging setting not found")
    return None

@router.post("/{device_id}/logging-settings/{logging_setting_id}/data", response_model=LoggingDataSetting)
def create_logging_data_setting(device_id: int, logging_setting_id: int, logging_data_setting: LoggingDataSettingCreate, db: Session = Depends(get_db)):
    return device_service.create_logging_data_setting(db, logging_setting_id, logging_data_setting)

@router.get("/{device_id}/logging-settings/{logging_setting_id}/data", response_model=List[LoggingDataSetting])
def get_logging_data_settings(device_id: int, logging_setting_id: int, db: Session = Depends(get_db)):
    return device_service.get_logging_data_settings(db, logging_setting_id)

@router.put("/{device_id}/logging-settings/{logging_setting_id}/data/{logging_data_setting_id}", response_model=LoggingDataSetting)
def update_logging_data_setting(
    device_id: int,
    logging_setting_id: int,
    logging_data_setting_id: int,
    logging_data_setting: LoggingDataSettingUpdate,
    db: Session = Depends(get_db)
):
    updated_setting = device_service.update_logging_data_setting(db, logging_data_setting_id, logging_data_setting)
    if updated_setting is None:
        raise HTTPException(status_code=404, detail="Logging data setting not found")
    return updated_setting

@router.delete("/{device_id}/logging-settings/{logging_setting_id}/data/{logging_data_setting_id}", status_code=204)
def delete_logging_data_setting(device_id: int, logging_setting_id: int, logging_data_setting_id: int, db: Session = Depends(get_db)):
    if not device_service.delete_logging_data_setting(db, logging_data_setting_id):
        raise HTTPException(status_code=404, detail="Logging data setting not found")
    return None

# QualityControlSignal関連のエンドポイント
@router.get("/{device_id}/quality-control-signals", response_model=List[QualityControlSignal])
def get_quality_control_signals(device_id: int, db: Session = Depends(get_db)):
    signals = device_service.get_quality_control_signals(db, device_id)
    return [QualityControlSignal.from_orm(signal) for signal in signals]

@router.post("/{device_id}/quality-control-signals", response_model=QualityControlSignal)
def create_quality_control_signal(device_id: int, quality_control_signal: QualityControlSignalCreate, db: Session = Depends(get_db)):
    return device_service.create_quality_control_signal(db, device_id, quality_control_signal)

@router.get("/{device_id}/quality-control-signals/{quality_control_signal_id}", response_model=QualityControlSignal)
def get_quality_control_signal(device_id: int, quality_control_signal_id: int, db: Session = Depends(get_db)):
    quality_control_signal = device_service.get_quality_control_signal(db, quality_control_signal_id)
    if quality_control_signal is None:
        raise HTTPException(status_code=404, detail="Quality control signal not found")
    return quality_control_signal

@router.put("/{device_id}/quality-control-signals/{quality_control_signal_id}", response_model=QualityControlSignal)
def update_quality_control_signal(device_id: int, quality_control_signal_id: int, quality_control_signal: QualityControlSignalUpdate, db: Session = Depends(get_db)):
    try:
        print(f"Received update data: {quality_control_signal.dict()}")  # デバッグ用ログ
        updated_quality_control_signal = device_service.update_quality_control_signal(db, quality_control_signal_id, quality_control_signal)
        if updated_quality_control_signal is None:
            raise HTTPException(status_code=404, detail="Quality control signal not found")
        return updated_quality_control_signal
    except Exception as e:
        print(f"Error updating quality control signal: {str(e)}")  # エラーログ
        raise

@router.delete("/{device_id}/quality-control-signals/{quality_control_signal_id}", status_code=204)
def delete_quality_control_signal(device_id: int, quality_control_signal_id: int, db: Session = Depends(get_db)):
    if not device_service.delete_quality_control_signal(db, quality_control_signal_id):
        raise HTTPException(status_code=404, detail="Quality control signal not found")
    return None

# DeviceProduction関連のエンドポイント
@router.get("/{device_id}/products", response_model=List[DeviceProductAssociationResponse])
def get_products_for_device(device_id: int, db: Session = Depends(get_db)):
    return device_service.get_device_products(db, device_id)

@router.post("/{device_id}/products/{product_id}", response_model=DeviceProductAssociation)
def add_product_to_device(device_id: int, product_id: int, db: Session = Depends(get_db)):
    return device_service.add_product_to_device(db, device_id, product_id)

@router.delete("/{device_id}/products/{product_id}", status_code=204)
def remove_product_from_device(device_id: int, product_id: int, db: Session = Depends(get_db)):
    success = device_service.remove_product_from_device(db, device_id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found for this device")
    return None


# メインのルーターにサブルーターを追加
router.include_router(client_router)
router.include_router(efficiency_router)
router.include_router(alarm_group_router)
router.include_router(alarm_address_router)
router.include_router(alarm_comment_router)
