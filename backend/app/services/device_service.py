# device_service.py
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from typing import List, Optional
import traceback

from ..crud import device_crud, data_crud
from ..schemas import (
    DeviceOut, DeviceRegistration, DeviceUpdate, Client, ClientAssociation, 
    ClientCreate, EfficiencyAddress, EfficiencyAddressCreate, EfficiencyAddressUpdate, AlarmGroup, 
    AlarmGroupCreate, AlarmGroupUpdate, AlarmAddress, AlarmAddressCreate, AlarmAddressUpdate, 
    AlarmComment, LoggingSettingCreate, LoggingSettingUpdate, LoggingDataSettingCreate, LoggingDataSettingUpdate, 
    LoggingDataSetting, QualityControlSignal, QualityControlSignalCreate, QualityControlSignalUpdate, DeviceProductAssociation, 
    DeviceProductAssociationResponse, DeviceFullInfo, PrintTrigger, LoggingSetting, EfficiencyAddressFullInfo, 
    ClassificationFullInfo, ClassificationGroupFullInfo, ClientFullInfo, PLCFullInfo, QualityControlSignalFullInfo,
    LoggingDataSettingFullInfo, LoggingSettingFullInfo, AlarmGroupFullInfo, AlarmAddressFullInfo, AlarmGroupFullInfo
)

from ..models import Devices, EfficiencyAddresses
from app.mqtt_client import get_mqtt_client

# ファイルの先頭に以下の行を追加
mqtt_client = get_mqtt_client()
print("MQTT client in device_service.py:", mqtt_client)

def register_device(db: Session, registration: DeviceRegistration) -> Optional[DeviceOut]:
    try:
        device = device_crud.create_device(
            db,
            registration.mac_address,
            registration.name,
            registration.standard_cycle_time,
            registration.planned_production_quantity,
            registration.planned_production_time
        )
        print("MQTT client in register_device:", mqtt_client)
        print("MQTT client type:", type(mqtt_client))
        mqtt_client.add_device(device.id, device.mac_address)
        return DeviceOut.model_validate(device)
    except SQLAlchemyError as e:
        print(f"SQLAlchemy error in register_device: {e}")
        print(traceback.format_exc())
        if "ix_devices_mac_address" in str(e):
            raise HTTPException(status_code=400, detail="MAC address already exists")
        raise HTTPException(status_code=500, detail="An error occurred while registering the device")

def get_devices(db: Session) -> List[DeviceOut]:
    devices = device_crud.get_devices(db)
    return [DeviceOut.model_validate(device) for device in devices]

def get_device(db: Session, device_id: int):
    return db.query(Devices).options(joinedload(Devices.clients)).filter(Devices.id == device_id).first()

def update_device(db: Session, device_id: int, device_update: DeviceUpdate) -> Optional[DeviceOut]:
    try:
        old_device = device_crud.get_device(db, device_id)
        if old_device is None:
            return None
        
        # 古いMACアドレスを保存
        old_mac_address = old_device.mac_address
        
        updated_device_info = device_crud.update_device(db, device_id, device_update)
        if updated_device_info is None:
            return None
        
        # DeviceOutモデルのインスタンスを作成
        updated_device = DeviceOut(**updated_device_info)
        
        # 更新通知を送信
        mqtt_client.publish_update_notification(old_mac_address, "device_info")
        
        # MACアドレスが変更された場合、MQTT購読を更新
        if old_mac_address != updated_device_info['mac_address']:
            mqtt_client.update_device_mac(device_id, updated_device_info['mac_address'])
        
        return updated_device
    except SQLAlchemyError as e:
        print(f"SQLAlchemy error in update_device: {e}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(status_code=500, detail="An error occurred while updating the device")

def delete_device(db: Session, device_id: int) -> bool:
    result = device_crud.delete_device(db, device_id)
    if result:
        # デバイスが削除されたら、MQTTクライアントに通知
        mqtt_client.remove_device(device_id)
    return result

def get_device_by_mac(db: Session, mac_address: str):
    return db.query(Devices).filter(Devices.mac_address == mac_address).first()

def get_clients_for_device(db: Session, device_id: int) -> List[Client]:
    clients = device_crud.get_clients_for_device(db, device_id)
    return [Client.model_validate(client) for client in clients]

def associate_clients_with_device(db: Session, device_id: int, client_ids: List[int]) -> Optional[DeviceOut]:
    try:
        device = device_crud.associate_clients_with_device(db, device_id, client_ids)
        if device is None:
            return None
        return DeviceOut.model_validate(device)
    except SQLAlchemyError as e:
        print(f"SQLAlchemy error in associate_clients_with_device: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="An error occurred while associating clients with the device")
    
def associate_clients_with_device(db: Session, device_id: int, clients: List[ClientCreate]) -> Optional[DeviceOut]:
    try:
        device = device_crud.associate_clients_with_device(db, device_id, clients)
        if device is None:
            return None
        return DeviceOut.model_validate(device)
    except SQLAlchemyError as e:
        print(f"SQLAlchemy error in associate_clients_with_device: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="An error occurred while associating clients with the device")

def get_client_for_device(db: Session, device_id: int, client_id: int) -> Optional[Client]:
    return device_crud.get_client_for_device(db, device_id, client_id)

def update_client_for_device(db: Session, device_id: int, client_id: int, client_data: ClientCreate) -> Optional[Client]:
    return device_crud.update_client_for_device(db, device_id, client_id, client_data)

def delete_client_for_device(db: Session, device_id: int, client_id: int) -> bool:
    try:
        return device_crud.delete_client_for_device(db, device_id, client_id)
    except SQLAlchemyError as e:
        print(f"SQLAlchemy error in delete_client_for_device: {e}")
        print(traceback.format_exc())
        return False

def get_efficiency_addresses(db: Session, device_id: int) -> List[EfficiencyAddress]:
    return [EfficiencyAddress.from_orm(ea) for ea in device_crud.get_efficiency_addresses(db, device_id)]

def create_efficiency_address(db: Session, device_id: int, efficiency_address: EfficiencyAddressCreate) -> EfficiencyAddress:
    db_efficiency_address = EfficiencyAddresses(
        device_id=device_id,
        client_id=efficiency_address.client_id,
        address_type=efficiency_address.address_type,
        address=efficiency_address.address,
        classification_id=efficiency_address.classification_id
    )
    db.add(db_efficiency_address)
    db.commit()
    db.refresh(db_efficiency_address)
    return db_efficiency_address

def update_efficiency_address(db: Session, efficiency_address_id: int, efficiency_address: EfficiencyAddressUpdate) -> Optional[EfficiencyAddress]:
    updated = device_crud.update_efficiency_address(db, efficiency_address_id, efficiency_address)
    return EfficiencyAddress.from_orm(updated) if updated else None

def delete_efficiency_address(db: Session, efficiency_address_id: int) -> bool:
    return device_crud.delete_efficiency_address(db, efficiency_address_id)

# アラームグループ関連の関数
def get_alarm_groups(db: Session, device_id: int) -> List[AlarmGroup]:
    alarm_groups = device_crud.get_alarm_groups(db, device_id)
    return [AlarmGroup.model_validate(ag) for ag in alarm_groups]

def create_alarm_group(db: Session, device_id: int, alarm_group: AlarmGroupCreate) -> AlarmGroup:
    try:
        db_alarm_group = device_crud.create_alarm_group(db, device_id, alarm_group)
        return AlarmGroup.model_validate(db_alarm_group)
    except SQLAlchemyError as e:
        print(f"SQLAlchemy error in create_alarm_group: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="An error occurred while creating the alarm group")

def get_alarm_group(db: Session, device_id: int, alarm_group_id: int) -> Optional[AlarmGroup]:
    alarm_group = device_crud.get_alarm_group(db, device_id, alarm_group_id)
    return AlarmGroup.model_validate(alarm_group) if alarm_group else None

def update_alarm_group(db: Session, device_id: int, alarm_group_id: int, alarm_group: AlarmGroupUpdate) -> Optional[AlarmGroup]:
    try:
        updated_alarm_group = device_crud.update_alarm_group(db, device_id, alarm_group_id, alarm_group)
        return AlarmGroup.model_validate(updated_alarm_group) if updated_alarm_group else None
    except SQLAlchemyError as e:
        print(f"SQLAlchemy error in update_alarm_group: {e}")
        print(traceback.format_exc())
        return None

def delete_alarm_group(db: Session, device_id: int, alarm_group_id: int) -> bool:
    return device_crud.delete_alarm_group(db, device_id, alarm_group_id)

# アラームアドレス関連の関数
def get_alarm_addresses(db: Session, alarm_group_id: int) -> List[AlarmAddress]:
    alarm_addresses = device_crud.get_alarm_addresses(db, alarm_group_id)
    return [AlarmAddress(
        alarm_group_id=addr.alarm_group_id,
        alarm_no=addr.alarm_no,
        address_type=addr.address_type,
        address=addr.address,
        address_bit=addr.address_bit,
        comments=[AlarmComment(
            comment_id=comment.comment_id,
            comment=comment.comment,
            alarm_group_id=comment.alarm_group_id,
            alarm_no=comment.alarm_no
        ) for comment in addr.alarm_comments]
    ) for addr in alarm_addresses]

def create_alarm_address(db: Session, alarm_group_id: int, alarm_address: AlarmAddressCreate) -> AlarmAddress:
    try:
        db_alarm_address = device_crud.create_alarm_address(db, alarm_group_id, alarm_address)
        return AlarmAddress.model_validate(db_alarm_address)
    except SQLAlchemyError as e:
        print(f"SQLAlchemy error in create_alarm_address: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="An error occurred while creating the alarm address")

def get_alarm_address(db: Session, device_id: int, alarm_group_id: int, alarm_address_id: int) -> Optional[AlarmAddress]:
    alarm_address = device_crud.get_alarm_address(db, device_id, alarm_group_id, alarm_address_id)
    return AlarmAddress.model_validate(alarm_address) if alarm_address else None

def update_alarm_address(db: Session, alarm_group_id: int, alarm_no: int, alarm_address: AlarmAddressUpdate) -> Optional[AlarmAddress]:
    try:
        updated_alarm_address = device_crud.update_alarm_address(db, alarm_group_id, alarm_no, alarm_address)
        return AlarmAddress.model_validate(updated_alarm_address) if updated_alarm_address else None
    except SQLAlchemyError as e:
        print(f"SQLAlchemy error in update_alarm_address: {e}")
        print(traceback.format_exc())
        return None

def delete_alarm_address(db: Session, alarm_group_id: int, alarm_no: int) -> bool:
    return device_crud.delete_alarm_address(db, alarm_group_id, alarm_no)

# アラームコメント関連の関数
def get_alarm_comments(db: Session, alarm_address_id: int) -> List[AlarmComment]:
    alarm_comments = device_crud.get_alarm_comments(db, alarm_address_id)
    return [AlarmComment.model_validate(ac) for ac in alarm_comments]


def update_alarm_addresses(db: Session, device_id: int, alarm_group_id: int, alarm_addresses: List[AlarmAddressCreate]) -> List[AlarmAddress]:
    try:
        updated_addresses = device_crud.bulk_update_or_create_alarm_addresses(db, device_id, alarm_group_id, alarm_addresses)
        return updated_addresses
    except ValueError as e:
        raise e
    except Exception as e:
        print(f"Error updating alarm addresses: {e}")
        raise Exception("An error occurred while updating alarm addresses")

# Logging関連の関数
def get_logging_settings(db: Session, device_id: int):
    return device_crud.get_logging_settings(db, device_id)

def create_logging_setting(db: Session, device_id: int, logging_setting: LoggingSettingCreate):
    return device_crud.create_logging_setting(db, device_id, logging_setting)

def get_logging_setting(db: Session, logging_setting_id: int):
    return device_crud.get_logging_setting(db, logging_setting_id)

def update_logging_setting(db: Session, logging_setting_id: int, logging_setting: LoggingSettingUpdate):
    return device_crud.update_logging_setting(db, logging_setting_id, logging_setting)

def delete_logging_setting(db: Session, logging_setting_id: int):
    return device_crud.delete_logging_setting(db, logging_setting_id)

def create_logging_data_setting(db: Session, logging_setting_id: int, logging_data_setting: LoggingDataSettingCreate):
    return device_crud.create_logging_data_setting(db, logging_setting_id, logging_data_setting)

def get_logging_data_settings(db: Session, logging_setting_id: int):
    return device_crud.get_logging_data_settings(db, logging_setting_id)

def update_logging_data_setting(db: Session, logging_data_setting_id: int, logging_data_setting: LoggingDataSettingUpdate) -> Optional[LoggingDataSetting]:
    updated_setting = device_crud.update_logging_data_setting(db, logging_data_setting_id, logging_data_setting)
    if updated_setting:
        return LoggingDataSetting.model_validate(updated_setting)  # from_orm の代わりに model_validate を使用
    return None

def delete_logging_data_setting(db: Session, logging_data_setting_id: int):
    return device_crud.delete_logging_data_setting(db, logging_data_setting_id)

# QualityControlSignal関連の関数
def get_quality_control_signals(db: Session, device_id: int) -> List[QualityControlSignal]:
    return device_crud.get_quality_control_signals(db, device_id)

def create_quality_control_signal(db: Session, device_id: int, quality_control_signal: QualityControlSignalCreate) -> QualityControlSignal:
    return device_crud.create_quality_control_signal(db, device_id, quality_control_signal)

def get_quality_control_signal(db: Session, quality_control_signal_id: int) -> Optional[QualityControlSignal]:
    return db.query(QualityControlSignal).options(joinedload(QualityControlSignal.children)).filter(QualityControlSignal.id == quality_control_signal_id).first()

def update_quality_control_signal(db: Session, quality_control_signal_id: int, quality_control_signal: QualityControlSignalUpdate) -> Optional[QualityControlSignal]:
    return device_crud.update_quality_control_signal(db, quality_control_signal_id, quality_control_signal)

def delete_quality_control_signal(db: Session, quality_control_signal_id: int) -> bool:
    return device_crud.delete_quality_control_signal(db, quality_control_signal_id)

# DeviceProduction関連の関数
def get_device_products(db: Session, device_id: int) -> List[DeviceProductAssociationResponse]:
    associations = device_crud.get_device_products_with_details(db, device_id)
    return [
        DeviceProductAssociationResponse(
            id=assoc.DeviceProductAssociation.id,
            device_id=assoc.DeviceProductAssociation.device_id,
            product_id=assoc.Products.id,
            internal_product_number=assoc.Products.internal_product_number,
            customer_product_number=assoc.Products.customer_product_number,
            product_name=assoc.Products.product_name,
            customer_name=assoc.Customers.name
        )
        for assoc in associations
    ]

def add_product_to_device(db: Session, device_id: int, product_id: int) -> DeviceProductAssociation:
    return device_crud.add_product_to_device(db, device_id, product_id)

def remove_product_from_device(db: Session, device_id: int, product_id: int) -> bool:
    return device_crud.remove_product_from_device(db, device_id, product_id)



# DeviceFullInfo関連の関数
def get_device_full_info(db: Session, mac_address: str) -> Optional[DeviceFullInfo]:
    device = device_crud.get_device_full_info(db, mac_address)
    if device is None:
        return None

    def create_client_full_info(client):
        return ClientFullInfo(
            id=client.id,
            name=client.name,
            ip_address=client.ip_address,
            port_no=client.port_no,
            plc=PLCFullInfo(
                id=client.plc.id,
                model=client.plc.model,
                manufacturer=client.plc.manufacturer,
                protocol=client.plc.protocol
            )
        )

    def create_quality_control_signal_full_info(qcs, include_client=True):
        return QualityControlSignalFullInfo(
            id=qcs.id,
            client=create_client_full_info(qcs.client) if include_client and qcs.client else None,
            address_type=qcs.address_type,
            address=qcs.address,
            signal_type=qcs.signal_type,
            signal_shot_number=qcs.signal_shot_number,
            signal_name=qcs.signal_name,
            parent_id=qcs.parent_id,
            children=[create_quality_control_signal_full_info(child, include_client=False) for child in qcs.children]
        )

    # 親信号のみをリストに含める
    quality_control_signals = [
        create_quality_control_signal_full_info(qcs)
        for qcs in device.quality_control_signals
        if qcs.parent_id is None
    ]

    return DeviceFullInfo(
        id=device.id,
        mac_address=device.mac_address,
        name=device.name,
        standard_cycle_time=device.standard_cycle_time,
        planned_production_quantity=device.planned_production_quantity,
        planned_production_time=device.planned_production_time,
        alarm_groups=[
            AlarmGroupFullInfo(
                id=ag.id,
                name=ag.name,
                client=create_client_full_info(ag.client),
                addresses=[
                    AlarmAddressFullInfo(
                        alarm_group_id=aa.alarm_group_id,
                        alarm_no=aa.alarm_no,
                        address_type=aa.address_type,
                        address=aa.address,
                        address_bit=aa.address_bit,
                        comments=[ac.comment for ac in aa.alarm_comments]
                    ) for aa in ag.alarm_addresses
                ]
            ) for ag in device.alarm_groups
        ],
        quality_control_signals=quality_control_signals,
        efficiency_addresses=[
            EfficiencyAddressFullInfo(
                id=ea.id,
                client=create_client_full_info(ea.client),
                address_type=ea.address_type,
                address=ea.address,
                classification=ClassificationFullInfo(
                    id=ea.classification.id,
                    name=ea.classification.name,
                    group=ClassificationGroupFullInfo(
                        id=ea.classification.group.id,
                        name=ea.classification.group.name
                    )
                ) if ea.classification else None
            ) for ea in device.efficiency_addresses
        ],
        logging_settings=[
            LoggingSettingFullInfo(
                id=ls.id,
                client=create_client_full_info(ls.client),
                logging_name=ls.logging_name,
                address_type=ls.address_type,
                address=ls.address,
                is_rising=ls.is_rising,
                logging_type=ls.logging_type,
                logging_data=[
                    LoggingDataSettingFullInfo(
                        id=ld.id,
                        data_name=ld.data_name,
                        address_type=ld.address_type,
                        address=ld.address,
                        address_count=ld.address_count,
                        data_type=ld.data_type
                    ) for ld in ls.logging_data
                ]
            ) for ls in device.logging_settings
        ],
        print_triggers=[PrintTrigger.from_orm(pt) for pt in device.print_triggers]
    )

