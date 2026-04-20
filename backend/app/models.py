#models.py
# models.py
"""
データベースモデル定義
"""
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Float, Table, Time, Index, UniqueConstraint, Boolean, ForeignKeyConstraint, LargeBinary, JSON, Text
from sqlalchemy.orm import relationship, validates, backref
import enum
from datetime import datetime
import uuid

from app.database import Base

class UserRole(enum.Enum):
    SU = "SU"   # Super User
    AD = "AD"   # Admin User
    CU = "CU"   # Common User

class Manufacturer(enum.Enum):
    KEYENCE = "KEYENCE"
    OMRON = "OMRON"
    MITSUBISHI = "MITSUBISHI"

class ProtocolType(enum.Enum):
    McProtocol = "McProtocol"
    FINS = "FINS"

class SignalType(enum.Enum):
    Good = "Good"
    Ng = "Ng"
    Optional = "Optional"

user_group_association = Table('user_group', Base.metadata,
    Column('user_id', String(10), ForeignKey('users.id')),
    Column('group_id', Integer, ForeignKey('groups.id'))
)

class CodeType(enum.Enum):
    UserID = "UserID"   # ユーザーID
    ProductNumber = "ProductNumber"   # 製品品番

class CodeLengthRule(Base):
    __tablename__ = 'code_length_rules'
    id = Column(Integer, primary_key=True, autoincrement=True)
    min_length = Column(Integer, nullable=False)  # 最小文字数
    max_length = Column(Integer, nullable=False)  # 最大文字数
    code_type = Column(Enum(CodeType), nullable=False)  # コードの種類
    check_digit = Column(Boolean, nullable=False, default=False)  # チェックデジットの有無

class Users(Base):
    __tablename__ = 'users'
    id = Column(String(10), primary_key=True)
    name = Column(String(100))
    password = Column(String(50), nullable=True)
    role = Column(Enum(UserRole), nullable=False)
    groups = relationship("Groups", secondary=user_group_association, back_populates="users")
    user_measurements = relationship("UserMeasurements", back_populates="user")

    def __repr__(self):
        return "<User(name='%s', role='%s')>" % (self.name, self.role.name)
    
    @validates('password')
    def validate_password(self, key, password):
        if self.role in [UserRole.SU, UserRole.AD] and not password:
            raise ValueError(f"Password is required for role {self.role}")
        return password
    
    @validates('id')
    def validate_id(self, key, id):
        if not id.isalnum() or len(id) > 10:
            raise ValueError("Employee ID must be an alphanumeric string with a maximum of 10 characters")
        return id

class Groups(Base):
    __tablename__ = 'groups'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)
    users = relationship("Users", secondary=user_group_association, back_populates="groups")

    def __repr__(self):
        return "<Group(name='%s')>" % (self.name)
    
class UserMeasurements(Base):
    __tablename__ = 'user_measurements'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    user_id = Column(String(10), ForeignKey('users.id'), nullable=False)
    state = Column(Boolean, nullable=False)
    event_time = Column(DateTime(timezone=True), nullable=False)
    
    device = relationship("Devices", back_populates="user_measurements")
    user = relationship("Users", back_populates="user_measurements")

    def __repr__(self):
        return f"<UserMeasurement(id={self.id}, device_id={self.device_id}, user_id='{self.user_id}', state={self.state}, event_time='{self.event_time}')>"

class PLC(Base):
    __tablename__ = 'plcs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    manufacturer = Column(Enum(Manufacturer), nullable=False)
    model = Column(String(100))
    protocol = Column(String(50))

    address_ranges = relationship("AddressRange", back_populates="plc")
    clients = relationship("Clients", back_populates="plc")

    def __repr__(self):
        return f"<PLC(id={self.id}, manufacturer='{self.manufacturer}', model='{self.model}', protocol='{self.protocol}')>"

class AddressRange(Base):
    __tablename__ = 'address_ranges'
    id = Column(Integer, primary_key=True, autoincrement=True)
    plc_id = Column(Integer, ForeignKey('plcs.id'))
    address_type = Column(String(50))
    address_range = Column(String(100))
    numerical_base = Column(String(50))
    data_type = Column(String(50))

    plc = relationship("PLC", back_populates="address_ranges")

class Devices(Base):
    __tablename__ = 'devices'

    id = Column(Integer, primary_key=True, autoincrement=True)
    mac_address = Column(String(17), unique=True, index=True)
    name = Column(String(100))
    standard_cycle_time = Column(Float, nullable=True)
    planned_production_quantity = Column(Integer, nullable=True)
    planned_production_time = Column(Float, nullable=True)

    clients = relationship("Clients", back_populates="device", cascade="all, delete-orphan")
    alarm_groups = relationship("AlarmGroups", back_populates="device", cascade="all, delete-orphan")
    logging_settings = relationship("LoggingSettings", back_populates="device", cascade="all, delete-orphan")
    io_settings = relationship("DeviceClientIO", back_populates="device", cascade="all, delete-orphan")
    products = relationship("DeviceProductAssociation", back_populates="device", cascade="all, delete-orphan")
    quality_control_signals = relationship("QualityControlSignal", back_populates="device", cascade="all, delete-orphan")
    printer_settings = relationship("PrinterSettings", back_populates="device", cascade="all, delete-orphan")
    print_jobs = relationship("PrintJobs", back_populates="device", cascade="all, delete-orphan")
    print_triggers = relationship("PrintTriggers", back_populates="device", cascade="all, delete-orphan")
    print_logs = relationship("PrintLogs", back_populates="device", cascade="all, delete-orphan")
    efficiency_measurements = relationship("EfficiencyMeasurements", back_populates="device", cascade="all, delete-orphan")
    quality_control_measurements = relationship("QualityControlMeasurements", back_populates="device", cascade="all, delete-orphan")
    logging_data_measurements = relationship("LoggingDataMeasurements", back_populates="device", cascade="all, delete-orphan")
    alarm_measurements = relationship("AlarmMeasurements", back_populates="device", cascade="all, delete-orphan")
    efficiency_addresses = relationship("EfficiencyAddresses", back_populates="device", cascade="all, delete-orphan")
    user_measurements = relationship("UserMeasurements", back_populates="device")

    def __repr__(self):
        return f"<Device(id={self.id}, mac_address='{self.mac_address}', name='{self.name}')>"

class EfficiencyAddresses(Base):
    __tablename__ = 'efficiency_addresses'
    id = Column(Integer, primary_key=True)
    device_id = Column(Integer, ForeignKey('devices.id'))
    client_id = Column(Integer, ForeignKey('clients.id'))
    address_type = Column(String(50))
    address = Column(String(100))
    classification_id = Column(Integer, ForeignKey('classifications.id'))

    classification = relationship("Classification", back_populates="efficiency_addresses")
    device = relationship("Devices", back_populates="efficiency_addresses")
    client = relationship("Clients")

class ClassificationGroup(Base):
    __tablename__ = 'classification_groups'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)

    classifications = relationship("Classification", back_populates="group")

# Classificationクラスにefficiency_addressesリレーションシップを追加
class Classification(Base):
    __tablename__ = 'classifications'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)
    group_id = Column(Integer, ForeignKey('classification_groups.id'))

    group = relationship("ClassificationGroup", back_populates="classifications")
    efficiency_addresses = relationship("EfficiencyAddresses", back_populates="classification")

class Clients(Base):
    __tablename__ = 'clients'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    ip_address = Column(String(15), nullable=False)
    port_no = Column(Integer, nullable=False)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    plc_id = Column(Integer, ForeignKey('plcs.id'), nullable=False)

    device = relationship("Devices", back_populates="clients")
    plc = relationship("PLC", back_populates="clients")
    alarm_groups = relationship("AlarmGroups", back_populates="client")

    # 一意性制約を削除
    # __table_args__ = (
    #     UniqueConstraint('device_id', 'plc_id', name='uq_device_plc'),
    # )

    def __repr__(self):
        return f"<Client(id={self.id}, name='{self.name}', ip_address='{self.ip_address}', port_no={self.port_no})>"

class DeviceClientIO(Base):
    __tablename__ = 'device_client_io'
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'))
    client_id = Column(Integer, ForeignKey('clients.id'))
    io_type = Column(String(50))
    address = Column(String(100))
    address_type = Column(String(50))
    address_count = Column(Integer)
    description = Column(String(255))

    device = relationship("Devices", back_populates="io_settings")
    client = relationship("Clients")

class AlarmGroups(Base):
    __tablename__ = 'alarm_groups'
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'))
    client_id = Column(Integer, ForeignKey('clients.id'))
    name = Column(String(100))

    device = relationship("Devices", back_populates="alarm_groups")
    client = relationship("Clients", back_populates="alarm_groups")
    alarm_addresses = relationship("AlarmAddresses", back_populates="alarm_group", cascade="all, delete-orphan")

class AlarmAddresses(Base):
    __tablename__ = 'alarm_addresses'
    alarm_group_id = Column(Integer, ForeignKey('alarm_groups.id'), primary_key=True)
    alarm_no = Column(Integer, primary_key=True)
    address_type = Column(String(50))
    address = Column(String(100))
    address_bit = Column(Integer)

    alarm_group = relationship("AlarmGroups", back_populates="alarm_addresses")
    alarm_comments = relationship("AlarmComments", back_populates="alarm_address", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('alarm_group_id', 'alarm_no', name='uq_alarm_group_alarm_no'),
    )

class AlarmComments(Base):
    __tablename__ = 'alarm_comments'
    alarm_group_id = Column(Integer, primary_key=True)
    alarm_no = Column(Integer, primary_key=True)
    comment_id = Column(Integer, primary_key=True)
    comment = Column(String(255))

    alarm_address = relationship("AlarmAddresses", back_populates="alarm_comments")
    
    __table_args__ = (
        ForeignKeyConstraint(['alarm_group_id', 'alarm_no'], ['alarm_addresses.alarm_group_id', 'alarm_addresses.alarm_no']),
    )

class LoggingSettings(Base):
    __tablename__ = 'logging_settings'
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'))
    client_id = Column(Integer, ForeignKey('clients.id'))
    logging_name = Column(String(100))
    description = Column(Text, nullable=True)
    address_type = Column(String(50))
    address = Column(String(100))
    is_rising = Column(Boolean, nullable=False)

    device = relationship("Devices", back_populates="logging_settings")
    client = relationship("Clients")
    logging_data = relationship("LoggingDataSettings", back_populates="logging_setting")

class LoggingDataSettings(Base):
    __tablename__ = 'logging_data_settings'
    id = Column(Integer, primary_key=True, autoincrement=True)
    logging_setting_id = Column(Integer, ForeignKey('logging_settings.id'))
    data_name = Column(String(100))
    address_type = Column(String(50))
    address = Column(String(100))
    address_count = Column(Integer)
    data_type = Column(String(50))

    logging_setting = relationship("LoggingSettings", back_populates="logging_data")

class Customers(Base):
    __tablename__ = 'customers'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    
    products = relationship("Products", back_populates="customer")

class Products(Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True, autoincrement=True)
    internal_product_number = Column(String(50), unique=True, nullable=False)
    customer_product_number = Column(String(50), unique=True, nullable=False)
    product_name = Column(String(100), nullable=False)
    customer_id = Column(Integer, ForeignKey('customers.id'))

    customer = relationship("Customers", back_populates="products")

class DeviceProductAssociation(Base):
    __tablename__ = 'device_product_association'
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'))
    product_id = Column(Integer, ForeignKey('products.id'))

    device = relationship("Devices", back_populates="products")
    product = relationship("Products")

class QualityControlSignal(Base):
    __tablename__ = 'quality_control_signals'
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    address_type = Column(String(50), nullable=False)
    address = Column(String(100), nullable=False)
    signal_type = Column(Enum(SignalType), nullable=False)
    signal_shot_number = Column(Integer, nullable=False)
    signal_name = Column(String(100), nullable=False)
    parent_id = Column(Integer, ForeignKey('quality_control_signals.id'), nullable=True)

    device = relationship("Devices", back_populates="quality_control_signals")
    client = relationship("Clients")
    children = relationship("QualityControlSignal", backref=backref("parent", remote_side=[id]))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.children is None:
            self.children = []

class ReportTemplates(Base):
    __tablename__ = 'report_templates'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255))
    file_data = Column(LargeBinary, nullable=False)
    file_type = Column(String(50), nullable=False)
    additional_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class PrinterSettings(Base):
    __tablename__ = 'printer_settings'
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    printer_name = Column(String(100), nullable=False)
    ip_address = Column(String(15), nullable=False)
    port = Column(Integer, nullable=False)
    driver = Column(String(100))

    device = relationship("Devices", back_populates="printer_settings")

class PrintJobs(Base):
    __tablename__ = 'print_jobs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    template_id = Column(Integer, ForeignKey('report_templates.id'), nullable=False)
    printer_id = Column(Integer, ForeignKey('printer_settings.id'), nullable=False)
    status = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True))

    device = relationship("Devices", back_populates="print_jobs")
    template = relationship("ReportTemplates")
    printer = relationship("PrinterSettings")
    print_logs = relationship("PrintLogs", 
                              primaryjoin="PrintJobs.id == PrintLogs.print_job_id",
                              foreign_keys="[PrintLogs.print_job_id]",
                              backref="print_job")

class PrintTriggers(Base):
    __tablename__ = 'print_triggers'
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    template_id = Column(Integer, ForeignKey('report_templates.id'), nullable=False)
    printer_id = Column(Integer, ForeignKey('printer_settings.id'), nullable=False)
    address_type = Column(String(50), nullable=False)
    address = Column(String(100), nullable=False)
    trigger_condition = Column(String(50), nullable=False)

    device = relationship("Devices", back_populates="print_triggers")
    client = relationship("Clients")
    template = relationship("ReportTemplates")
    printer = relationship("PrinterSettings")

class PrintLogs(Base):
    __tablename__ = 'print_logs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    lot_number = Column(String(50), nullable=False, unique=True, index=True)
    print_job_id = Column(Integer, nullable=False)
    product_internal_number = Column(String(50), nullable=False)
    product_customer_number = Column(String(50), nullable=False)
    product_name = Column(String(100), nullable=False)
    user_id = Column(String(10), nullable=False)
    user_name = Column(String(100), nullable=False)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    device_name = Column(String(100), nullable=False)
    printer_id = Column(Integer, nullable=False)
    printer_name = Column(String(100), nullable=False)
    template_id = Column(Integer, nullable=False)
    template_name = Column(String(100), nullable=False)
    printed_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    additional_data = Column(JSON)

    device = relationship("Devices", back_populates="print_logs")

    @staticmethod
    def generate_lot_number():
        return f"LOT-{uuid.uuid4().hex[:10].upper()}"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.lot_number = self.generate_lot_number()

class EfficiencyMeasurements(Base):
    __tablename__ = 'efficiency_measurements'
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    classification_group = Column(String(100), nullable=False)
    classification_status_name = Column(String(100), nullable=False)
    classification_status = Column(Boolean, nullable=False)
    event_time = Column(DateTime(timezone=True), nullable=False)

    device = relationship("Devices", back_populates="efficiency_measurements")

    __table_args__ = (
        Index('idx_efficiency_measurements_device_id_event_time', 'device_id', 'event_time'),
    )

class QualityControlMeasurements(Base):
    __tablename__ = 'quality_control_measurements'
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    quality_name = Column(String(100), nullable=False)
    quality_type = Column(String(50), nullable=False) # 'Good' or 'Ng'
    quality_count = Column(Integer, nullable=False)
    parent_id = Column(Integer, ForeignKey('quality_control_measurements.id'), nullable=True)
    event_time = Column(DateTime(timezone=True), nullable=False)

    device = relationship("Devices", back_populates="quality_control_measurements")
    parent = relationship("QualityControlMeasurements", remote_side=[id], backref="children")

    __table_args__ = (
        Index('idx_quality_control_measurements_device_id_event_time', 'device_id', 'event_time'),
    )

class LoggingDataMeasurements(Base):
    __tablename__ = 'logging_data_measurements'
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    logging_name = Column(String(100), nullable=False)
    logging_type = Column(String(50), nullable=False)
    event_time = Column(DateTime(timezone=True), nullable=False)

    device = relationship("Devices", back_populates="logging_data_measurements")
    measurement_groups = relationship("LoggingDataMeasurementGroups", back_populates="measurement")

    __table_args__ = (
        Index('idx_logging_data_measurements_device_id_event_time', 'device_id', 'event_time'),
    )

class LoggingDataMeasurementGroups(Base):
    __tablename__ = 'logging_data_measurement_groups'
    id = Column(Integer, primary_key=True, autoincrement=True)
    measurement_id = Column(Integer, ForeignKey('logging_data_measurements.id'), nullable=False)
    data_name = Column(String(100), nullable=False)
    data_value = Column(Float, nullable=False)

    measurement = relationship("LoggingDataMeasurements", back_populates="measurement_groups")

class AlarmMeasurements(Base):
    __tablename__ = 'alarm_measurements'
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    alarm_group = Column(String(100), nullable=False)
    alarm_no = Column(Integer, nullable=False)
    alarm_state = Column(Boolean, nullable=False)
    event_time = Column(DateTime(timezone=True), nullable=False)

    device = relationship("Devices", back_populates="alarm_measurements")
    comments = relationship("AlarmMeasurementComments", back_populates="alarm_measurement")

    __table_args__ = (
        Index('idx_alarm_measurements_device_id_event_time', 'device_id', 'event_time'),
    )

class AlarmMeasurementComments(Base):
    __tablename__ = 'alarm_measurement_comments'
    id = Column(Integer, primary_key=True, autoincrement=True)
    alarm_measurement_id = Column(Integer, ForeignKey('alarm_measurements.id'), nullable=False)
    alarm_comment = Column(String(255), nullable=False)

    alarm_measurement = relationship("AlarmMeasurements", back_populates="comments")

class TimeTable(Base):
    __tablename__ = 'time_table'
    id = Column(Integer, primary_key=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    def __repr__(self):
        return "<TimeTable(id='%s', start_time='%s', end_time='%s')>" % (self.id, self.start_time, self.end_time)

    __table_args__ = (
        Index('idx_time_table_start_time', 'start_time'),
        Index('idx_time_table_end_time', 'end_time'),
    )



