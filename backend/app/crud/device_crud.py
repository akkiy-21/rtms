# device_crud.py
from sqlalchemy import and_
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any

from ..models import (
    Devices, Clients, EfficiencyAddresses, AlarmGroups, AlarmAddresses, 
    AlarmComments, LoggingSettings, LoggingDataSettings, QualityControlSignal, 
    DeviceProductAssociation, Products, Customers, Classification, QualityControlMeasurements,
    UserMeasurements
)
from ..schemas import (
    DeviceUpdate, ClientCreate, EfficiencyAddressCreate, EfficiencyAddressUpdate, AlarmGroupCreate, 
    AlarmGroupUpdate, AlarmAddressCreate, AlarmAddressUpdate, AlarmCommentCreate, LoggingSettingCreate, 
    LoggingSettingUpdate, LoggingDataSettingCreate, LoggingDataSettingUpdate, QualityControlSignalCreate, QualityControlSignalUpdate
)


def create_device(db: Session, mac_address: str, name: str, standard_cycle_time: Optional[float] = None,
                  planned_production_quantity: Optional[int] = None, planned_production_time: Optional[float] = None) -> Devices:
    db_device = Devices(
        mac_address=mac_address,
        name=name,
        standard_cycle_time=standard_cycle_time,
        planned_production_quantity=planned_production_quantity,
        planned_production_time=planned_production_time
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def get_devices(db: Session) -> List[Devices]:
    return db.query(Devices).all()

def get_device(db: Session, device_id: int) -> Optional[Devices]:
    return db.query(Devices).filter(Devices.id == device_id).first()

def update_device(db: Session, device_id: int, device_update: DeviceUpdate) -> Optional[Dict[str, Any]]:
    db_device = db.query(Devices).filter(Devices.id == device_id).first()
    if db_device is None:
        return None
    
    update_data = device_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_device, key, value)

    try:
        db.commit()
        db.refresh(db_device)
    except SQLAlchemyError as e:
        print(f"Error updating device: {e}")
        db.rollback()
        raise  # エラーを上位の関数に伝播させる

    return {
        'id': db_device.id,
        'mac_address': db_device.mac_address,
        'name': db_device.name,
        'standard_cycle_time': db_device.standard_cycle_time,
        'planned_production_quantity': db_device.planned_production_quantity,
        'planned_production_time': db_device.planned_production_time
    }

def delete_device(db: Session, device_id: int) -> bool:
    try:
        # 関連データを先に削除
        db.query(UserMeasurements).filter(UserMeasurements.device_id == device_id).delete()
        db.query(QualityControlMeasurements).filter(QualityControlMeasurements.device_id == device_id).delete()
        
        db_device = db.query(Devices).filter(Devices.id == device_id).first()
        if db_device is None:
            return False
        
        db.delete(db_device)
        db.commit()
        return True
    except SQLAlchemyError as e:
        print(f"Error deleting device: {e}")
        db.rollback()
        raise


def get_clients_for_device(db: Session, device_id: int) -> List[Clients]:
    return db.query(Clients).filter(Clients.device_id == device_id).options(joinedload(Clients.plc)).all()

def associate_clients_with_device(db: Session, device_id: int, clients: List[ClientCreate]) -> Optional[Devices]:
    device = db.query(Devices).filter(Devices.id == device_id).first()
    if device is None:
        return None
    
    for client_data in clients:
        client = Clients(**client_data.model_dump())
        device.clients.append(client)
    
    try:
        db.commit()
        db.refresh(device)
    except SQLAlchemyError as e:
        print(f"Error associating clients with device: {e}")
        db.rollback()
        return None

    return device

def get_client_for_device(db: Session, device_id: int, client_id: int) -> Optional[Clients]:
    return db.query(Clients).filter(Clients.device_id == device_id, Clients.id == client_id).first()

def update_client_for_device(db: Session, device_id: int, client_id: int, client_data: ClientCreate) -> Optional[Clients]:
    client = get_client_for_device(db, device_id, client_id)
    if client is None:
        return None
    
    for key, value in client_data.dict().items():
        setattr(client, key, value)
    
    try:
        db.commit()
        db.refresh(client)
    except SQLAlchemyError as e:
        print(f"Error updating client: {e}")
        db.rollback()
        return None

    return client

def delete_client_for_device(db: Session, device_id: int, client_id: int) -> bool:
    client = db.query(Clients).filter(Clients.id == client_id, Clients.device_id == device_id).first()
    if client is None:
        return False
    
    try:
        db.delete(client)
        db.commit()
        return True
    except SQLAlchemyError as e:
        print(f"Error deleting client: {e}")
        db.rollback()
        return False

def get_efficiency_addresses(db: Session, device_id: int) -> List[EfficiencyAddresses]:
    return db.query(EfficiencyAddresses).filter(EfficiencyAddresses.device_id == device_id).all()

def create_efficiency_address(db: Session, device_id: int, client_id: int, efficiency_address: EfficiencyAddressCreate) -> EfficiencyAddresses:
    db_efficiency_address = EfficiencyAddresses(**efficiency_address.dict(), device_id=device_id, client_id=client_id)
    db.add(db_efficiency_address)
    db.commit()
    db.refresh(db_efficiency_address)
    return db_efficiency_address

def update_efficiency_address(db: Session, efficiency_address_id: int, efficiency_address: EfficiencyAddressUpdate) -> Optional[EfficiencyAddresses]:
    db_efficiency_address = db.query(EfficiencyAddresses).filter(EfficiencyAddresses.id == efficiency_address_id).first()
    if db_efficiency_address:
        update_data = efficiency_address.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_efficiency_address, key, value)
        db.commit()
        db.refresh(db_efficiency_address)
    return db_efficiency_address

def delete_efficiency_address(db: Session, efficiency_address_id: int) -> bool:
    db_efficiency_address = db.query(EfficiencyAddresses).filter(EfficiencyAddresses.id == efficiency_address_id).first()
    if db_efficiency_address:
        db.delete(db_efficiency_address)
        db.commit()
        return True
    return False

# アラームグループ関連の CRUD 操作
def get_alarm_groups(db: Session, device_id: int) -> List[AlarmGroups]:
    return db.query(AlarmGroups).filter(AlarmGroups.device_id == device_id).all()

def create_alarm_group(db: Session, device_id: int, alarm_group: AlarmGroupCreate) -> AlarmGroups:
    db_alarm_group = AlarmGroups(**alarm_group.dict(), device_id=device_id)
    db.add(db_alarm_group)
    db.commit()
    db.refresh(db_alarm_group)
    return db_alarm_group

def get_alarm_group(db: Session, device_id: int, alarm_group_id: int) -> Optional[AlarmGroups]:
    return db.query(AlarmGroups).filter(AlarmGroups.id == alarm_group_id, AlarmGroups.device_id == device_id).first()

def update_alarm_group(db: Session, device_id: int, alarm_group_id: int, alarm_group: AlarmGroupUpdate) -> Optional[AlarmGroups]:
    db_alarm_group = get_alarm_group(db, device_id, alarm_group_id)
    if db_alarm_group:
        update_data = alarm_group.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_alarm_group, key, value)
        db.commit()
        db.refresh(db_alarm_group)
    return db_alarm_group

def delete_alarm_group(db: Session, device_id: int, alarm_group_id: int) -> bool:
    db_alarm_group = get_alarm_group(db, device_id, alarm_group_id)
    if db_alarm_group:
        try:
            # カスケード削除により関連するAlarmAddressesとAlarmCommentsも自動的に削除される
            db.delete(db_alarm_group)
            db.commit()
            return True
        except SQLAlchemyError as e:
            print(f"Error deleting alarm group: {e}")
            db.rollback()
            return False
    return False

# アラームアドレス関連の CRUD 操作
def get_alarm_addresses(db: Session, alarm_group_id: int) -> List[AlarmAddresses]:
    return db.query(AlarmAddresses).filter(AlarmAddresses.alarm_group_id == alarm_group_id).options(
        joinedload(AlarmAddresses.alarm_comments)
    ).all()

def create_alarm_address(db: Session, alarm_group_id: int, alarm_address: AlarmAddressCreate) -> AlarmAddresses:
    db_alarm_address = AlarmAddresses(
        alarm_group_id=alarm_group_id,
        alarm_no=alarm_address.alarm_no,  # この値が0でも問題ないことを確認
        address_type=alarm_address.address_type,
        address=alarm_address.address,
        address_bit=alarm_address.address_bit
    )
    db.add(db_alarm_address)
    db.flush()  # This is needed to get the id of the newly created alarm address

    db_comments = []
    for comment in alarm_address.comments:
        db_comment = AlarmComments(
            alarm_group_id=alarm_group_id,
            alarm_no=alarm_address.alarm_no,
            comment_id=comment.comment_id,  # 修正されたカラム
            comment=comment.comment
        )
        db.add(db_comment)
        db_comments.append(db_comment)

    db_alarm_address.alarm_comments = db_comments
    return db_alarm_address

def get_alarm_address(db: Session, device_id: int, alarm_group_id: int, alarm_address_id: int) -> Optional[AlarmAddresses]:
    return db.query(AlarmAddresses).join(AlarmGroups).filter(
        AlarmAddresses.id == alarm_address_id,
        AlarmAddresses.alarm_group_id == alarm_group_id,
        AlarmGroups.device_id == device_id
    ).first()

def update_alarm_address(db: Session, alarm_group_id: int, alarm_no: int, alarm_address: AlarmAddressUpdate) -> Optional[AlarmAddresses]:
    db_alarm_address = db.query(AlarmAddresses).filter(
        and_(AlarmAddresses.alarm_group_id == alarm_group_id, AlarmAddresses.alarm_no == alarm_no)
    ).first()
    if db_alarm_address:
        for key, value in alarm_address.dict(exclude_unset=True).items():
            setattr(db_alarm_address, key, value)
        
        # コメントの更新
        db.query(AlarmComments).filter(
            and_(AlarmComments.alarm_group_id == alarm_group_id, AlarmComments.alarm_no == alarm_no)
        ).delete()
        
        for comment in alarm_address.comments:
            db_comment = AlarmComments(
                alarm_group_id=alarm_group_id,
                alarm_no=alarm_no,
                comment_id=comment.comment_id,  # 修正されたカラム
                comment=comment.comment
            )
            db.add(db_comment)
        
        db.commit()
        db.refresh(db_alarm_address)
    return db_alarm_address

def delete_alarm_address(db: Session, alarm_group_id: int, alarm_no: int) -> bool:
    db_alarm_address = db.query(AlarmAddresses).filter(
        and_(AlarmAddresses.alarm_group_id == alarm_group_id, AlarmAddresses.alarm_no == alarm_no)
    ).first()
    if db_alarm_address:
        db.delete(db_alarm_address)
        db.commit()
        return True
    return False

# アラームコメント関連の CRUD 操作
def get_alarm_comments(db: Session, alarm_address_id: int) -> List[AlarmComments]:
    return db.query(AlarmComments).filter(AlarmComments.alarm_address_id == alarm_address_id).all()

def update_alarm_comments(db: Session, alarm_group_id: int, alarm_no: int, comments: List[AlarmCommentCreate]):
    # Delete existing comments
    db.query(AlarmComments).filter(
        AlarmComments.alarm_group_id == alarm_group_id,
        AlarmComments.alarm_no == alarm_no
    ).delete()
    
    # Add new comments
    for comment in comments:
        db_comment = AlarmComments(
            alarm_group_id=alarm_group_id,
            alarm_no=alarm_no,
            comment_id=comment.comment_id,  # 修正されたカラム
            comment=comment.comment
        )
        db.add(db_comment)

def create_alarm_comments(db: Session, alarm_address_id: int, comments: List[str]):
    for i, comment in enumerate(comments):
        new_comment = AlarmComments(
            alarm_address_id=alarm_address_id,
            comment_id=i,  # 修正されたカラム
            comment=comment
        )
        db.add(new_comment)

def bulk_update_or_create_alarm_addresses(db: Session, device_id: int, alarm_group_id: int, alarm_addresses: List[AlarmAddressCreate]) -> List[AlarmAddresses]:
    alarm_group = db.query(AlarmGroups).filter(AlarmGroups.id == alarm_group_id, AlarmGroups.device_id == device_id).first()
    if not alarm_group:
        raise ValueError("Alarm group not found for this device")

    existing_addresses = db.query(AlarmAddresses).filter(AlarmAddresses.alarm_group_id == alarm_group_id).all()
    existing_address_dict = {addr.alarm_no: addr for addr in existing_addresses}

    updated_addresses = []

    for addr in alarm_addresses:
        if addr.alarm_no in existing_address_dict:
            # Update existing address
            existing_addr = existing_address_dict[addr.alarm_no]
            for field, value in addr.dict(exclude={'comments'}).items():
                setattr(existing_addr, field, value)
            update_alarm_comments(db, alarm_group_id, addr.alarm_no, addr.comments)
            updated_addresses.append(existing_addr)
        else:
            # Create new address
            new_addr = create_alarm_address(db, alarm_group_id, addr)
            updated_addresses.append(new_addr)

    # Delete addresses that are not in the new set
    new_address_set = set(addr.alarm_no for addr in alarm_addresses)
    for key, addr in existing_address_dict.items():
        if key not in new_address_set:
            db.delete(addr)

    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise ValueError(f"Integrity error occurred: {str(e)}")

    # Refresh the addresses to ensure all relationships are loaded
    for addr in updated_addresses:
        db.refresh(addr)

    return updated_addresses

# Logging関連の CRUD 操作
def get_logging_settings(db: Session, device_id: int):
    return db.query(LoggingSettings).filter(LoggingSettings.device_id == device_id).all()

def create_logging_setting(db: Session, device_id: int, logging_setting: LoggingSettingCreate):
    db_logging_setting = LoggingSettings(**logging_setting.dict(), device_id=device_id)
    db.add(db_logging_setting)
    db.commit()
    db.refresh(db_logging_setting)
    return db_logging_setting

def get_logging_setting(db: Session, logging_setting_id: int):
    return db.query(LoggingSettings).filter(LoggingSettings.id == logging_setting_id).first()

def update_logging_setting(db: Session, logging_setting_id: int, logging_setting: LoggingSettingUpdate):
    db_logging_setting = get_logging_setting(db, logging_setting_id)
    if db_logging_setting:
        update_data = logging_setting.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_logging_setting, key, value)
        db.commit()
        db.refresh(db_logging_setting)
    return db_logging_setting

def delete_logging_setting(db: Session, logging_setting_id: int):
    db_logging_setting = get_logging_setting(db, logging_setting_id)
    if db_logging_setting:
        db.delete(db_logging_setting)
        db.commit()
        return True
    return False

def create_logging_data_setting(db: Session, logging_setting_id: int, logging_data_setting: LoggingDataSettingCreate):
    db_logging_data_setting = LoggingDataSettings(**logging_data_setting.dict(), logging_setting_id=logging_setting_id)
    db.add(db_logging_data_setting)
    db.commit()
    db.refresh(db_logging_data_setting)
    return db_logging_data_setting

def get_logging_data_settings(db: Session, logging_setting_id: int):
    return db.query(LoggingDataSettings).filter(LoggingDataSettings.logging_setting_id == logging_setting_id).all()

def update_logging_data_setting(db: Session, logging_data_setting_id: int, logging_data_setting: LoggingDataSettingUpdate) -> Optional[LoggingDataSettings]:
    db_logging_data_setting = db.query(LoggingDataSettings).filter(LoggingDataSettings.id == logging_data_setting_id).first()
    if db_logging_data_setting:
        update_data = logging_data_setting.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_logging_data_setting, key, value)
        db.commit()
        db.refresh(db_logging_data_setting)
    return db_logging_data_setting

def delete_logging_data_setting(db: Session, logging_data_setting_id: int):
    db_logging_data_setting = db.query(LoggingDataSettings).filter(LoggingDataSettings.id == logging_data_setting_id).first()
    if db_logging_data_setting:
        db.delete(db_logging_data_setting)
        db.commit()
        return True
    return False

# QualityControlSignal関連の CRUD 操作
def get_quality_control_signals(db: Session, device_id: int):
    signals = db.query(QualityControlSignal).filter(QualityControlSignal.device_id == device_id).options(joinedload(QualityControlSignal.children)).all()
    for signal in signals:
        if signal.children is None:
            signal.children = []
    
    return signals

def create_quality_control_signal(db: Session, device_id: int, quality_control_signal: QualityControlSignalCreate) -> QualityControlSignal:
    db_quality_control_signal = QualityControlSignal(**quality_control_signal.dict(), device_id=device_id)
    db.add(db_quality_control_signal)
    db.commit()
    db.refresh(db_quality_control_signal)
    return db_quality_control_signal

def update_quality_control_signal(db: Session, quality_control_signal_id: int, quality_control_signal: QualityControlSignalUpdate) -> QualityControlSignal:
    db_quality_control_signal = db.query(QualityControlSignal).filter(QualityControlSignal.id == quality_control_signal_id).first()
    if db_quality_control_signal:
        update_data = quality_control_signal.dict(exclude_unset=True)
        for key, value in update_data.items():
            if key == 'parent_id' and value == '':
                setattr(db_quality_control_signal, key, None)
            else:
                setattr(db_quality_control_signal, key, value)
        db.commit()
        db.refresh(db_quality_control_signal)
    return db_quality_control_signal

def get_quality_control_signal(db: Session, quality_control_signal_id: int):
    return db.query(QualityControlSignal).filter(QualityControlSignal.id == quality_control_signal_id).first()

def delete_quality_control_signal(db: Session, quality_control_signal_id: int):
    db_quality_control_signal = get_quality_control_signal(db, quality_control_signal_id)
    if db_quality_control_signal:
        db.delete(db_quality_control_signal)
        db.commit()
        return True
    return False

# DeviceProduction関連の CRUD 操作
def get_device_products(db: Session, device_id: int):
    return db.query(DeviceProductAssociation).filter(DeviceProductAssociation.device_id == device_id).all()

def add_product_to_device(db: Session, device_id: int, product_id: int):
    association = DeviceProductAssociation(device_id=device_id, product_id=product_id)
    db.add(association)
    db.commit()
    db.refresh(association)
    return association

def remove_product_from_device(db: Session, device_id: int, product_id: int):
    association = db.query(DeviceProductAssociation).filter(
        DeviceProductAssociation.device_id == device_id,
        DeviceProductAssociation.product_id == product_id
    ).first()
    if association:
        db.delete(association)
        db.commit()
        return True
    return False

def get_device_products_with_details(db: Session, device_id: int):
    return db.query(DeviceProductAssociation, Products, Customers).join(
        Products, DeviceProductAssociation.product_id == Products.id
    ).join(
        Customers, Products.customer_id == Customers.id
    ).filter(
        DeviceProductAssociation.device_id == device_id
    ).all()

def get_device_full_info(db: Session, mac_address: str) -> Optional[Devices]:
    return db.query(Devices).filter(Devices.mac_address == mac_address).options(
        joinedload(Devices.clients).joinedload(Clients.plc),
        joinedload(Devices.alarm_groups).joinedload(AlarmGroups.alarm_addresses).joinedload(AlarmAddresses.alarm_comments),
        joinedload(Devices.quality_control_signals),
        joinedload(Devices.efficiency_addresses).joinedload(EfficiencyAddresses.classification).joinedload(Classification.group),
        joinedload(Devices.logging_settings).joinedload(LoggingSettings.logging_data),
        joinedload(Devices.print_triggers)
    ).first()

# UserMeasurement関連の CRUD 操作
def get_latest_user_measurement(db: Session, device_id: int):
    return db.query(UserMeasurements).filter(
        UserMeasurements.device_id == device_id
    ).order_by(UserMeasurements.event_time.desc()).first()