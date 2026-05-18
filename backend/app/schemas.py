# schemas.py
from pydantic import BaseModel, ConfigDict, field_validator, Field, IPvAnyAddress
from typing import Optional, List, Annotated, Union
from enum import Enum
from datetime import time, datetime

# devices

class TempIDResponse(BaseModel):
    temp_id: str

    @field_validator('temp_id')
    def validate_temp_id(cls, v):
        if not v.isdigit() or len(v) != 5:
            raise ValueError('temp_id must be a 5-digit number')
        return v

class DeviceRegistration(BaseModel):
    mac_address: str
    name: str
    device_status: str = 'active'
    ssh_username: Optional[str] = Field(None, description="SSH login username")
    ssh_password: Optional[str] = Field(None, description="SSH login password")
    standard_cycle_time: Optional[float] = Field(None, description="Standard cycle time in seconds")

class DeviceUpdate(BaseModel):
    mac_address: Optional[str] = None
    name: Optional[str] = None
    device_status: Optional[str] = None
    ssh_username: Optional[str] = None
    ssh_password: Optional[str] = None
    standard_cycle_time: Optional[float] = None


class ManagedAppName(str, Enum):
    RTMS_CLIENT = "rtms-client"


class AppReleaseStatus(str, Enum):
    READY = "ready"
    ARCHIVED = "archived"


class DeviceActionType(str, Enum):
    REBOOT = "reboot"
    SHUTDOWN = "shutdown"
    DEPLOY_RTMS_CLIENT = "deploy_rtms_client"


class DeviceActionJobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    PARTIAL = "partial"


class DeviceActionJobItemStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    SKIPPED = "skipped"


class DeviceActionJobSummary(BaseModel):
    total_items: int = 0
    queued_items: int = 0
    succeeded_items: int = 0
    failed_items: int = 0
    skipped_items: int = 0


class AppReleaseBase(BaseModel):
    app_name: ManagedAppName = ManagedAppName.RTMS_CLIENT
    version: str
    platform: str = "linux-arm64"
    filename: str
    sha256: str
    file_size: int
    notes: Optional[str] = None


class AppReleaseCreate(AppReleaseBase):
    storage_path: str


class AppReleaseOut(AppReleaseBase):
    id: int
    status: AppReleaseStatus
    storage_path: str
    uploaded_by: Optional[str] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DeviceActionJobRequest(BaseModel):
    action_type: DeviceActionType
    device_ids: List[int] = Field(min_length=1)
    scope: str = "selection"


class DeviceDeployJobRequest(BaseModel):
    device_ids: List[int] = Field(min_length=1)
    release_id: int
    scope: str = "selection"


class DeviceActionJobItemOut(BaseModel):
    id: int
    job_id: int
    device_id: int
    device_name: Optional[str] = None
    mac_address: Optional[str] = None
    last_known_ip_address: Optional[str] = None
    ssh_username: Optional[str] = None
    status: DeviceActionJobItemStatus
    result_message: Optional[str] = None
    remote_artifact_path: Optional[str] = None
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    attempt_count: int
    metadata_json: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)


class DeviceActionJobOut(BaseModel):
    id: int
    action_type: DeviceActionType
    status: DeviceActionJobStatus
    scope: str
    requested_by: Optional[str] = None
    release_id: Optional[int] = None
    requested_at: datetime
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    total_items: int
    queued_items: int
    succeeded_items: int
    failed_items: int
    skipped_items: int
    error_message: Optional[str] = None
    items: List[DeviceActionJobItemOut] = []

    model_config = ConfigDict(from_attributes=True)

class DeviceRuntimeNetworkUpdate(BaseModel):
    last_known_ip_address: IPvAnyAddress

class DeviceRuntimeNetworkInfo(BaseModel):
    device_id: int
    last_known_ip_address: str

    model_config = ConfigDict(from_attributes=True)


class PairingRequestStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CONSUMED = "consumed"
    REGISTERED = "registered"


class ClientPairingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    DRAFT = "draft"
    REGISTERED = "registered"


class PairingCodeRequest(BaseModel):
    mac_address: str

    @field_validator('mac_address')
    def validate_mac_address(cls, v):
        normalized = v.strip().lower()
        if not normalized:
            raise ValueError('mac_address is required')
        if not __import__('re').match(r'^([0-9a-f]{2}[:-]){5}([0-9a-f]{2})$', normalized):
            raise ValueError('Invalid MAC address format')
        return normalized


class ClientPairingCodeResponse(BaseModel):
    status: ClientPairingStatus
    pairing_code: Optional[str] = None
    expires_at: Optional[datetime] = None
    refresh_interval_seconds: int
    poll_interval_seconds: int


class PairingLookupResponse(BaseModel):
    pairing_code: str
    mac_address: str
    expires_at: datetime
    status: PairingRequestStatus


class DeviceRegistrationByPairing(BaseModel):
    pairing_code: Annotated[str, Field(min_length=4, max_length=4, pattern=r'^\d{4}$')]
    name: str
    ssh_username: Optional[str] = Field(None, description="SSH login username")
    ssh_password: Optional[str] = Field(None, description="SSH login password")
    standard_cycle_time: Optional[float] = Field(None, description="Standard cycle time in seconds")


class DraftDeviceRegistrationByPairing(BaseModel):
    pairing_code: Annotated[str, Field(min_length=4, max_length=4, pattern=r'^\d{4}$')]


class DeviceReassignmentByPairing(BaseModel):
    pairing_code: Annotated[str, Field(min_length=4, max_length=4, pattern=r'^\d{4}$')]

# classifications
class ClassificationGroupBase(BaseModel):
    name: str

class ClassificationGroupCreate(ClassificationGroupBase):
    pass

class ClassificationGroup(ClassificationGroupBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ClassificationBase(BaseModel):
    name: str
    group_id: int

class ClassificationCreate(ClassificationBase):
    pass

class Classification(ClassificationBase):
    id: int
    group: ClassificationGroup

    model_config = ConfigDict(from_attributes=True)

class ClassificationResponse(BaseModel):
    id: int
    name: str
    group_id: int
    group_name: str

    class Config:
        model_config = ConfigDict(from_attributes=True)

# plcs
class Manufacturer(str, Enum):
    KEYENCE = "KEYENCE"
    OMRON = "OMRON"
    MITSUBISHI = "MITSUBISHI"

class PLCBase(BaseModel):
    model: str
    manufacturer: Manufacturer
    protocol: str

class PLCCreate(PLCBase):
    pass

class PLCUpdate(BaseModel):
    model: Optional[str] = None
    manufacturer: Optional[Manufacturer] = None
    protocol: Optional[str] = None

class PLC(PLCBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class AddressRangeBase(BaseModel):
    address_type: str
    address_range: str
    numerical_base: str
    data_type: str

class AddressRangeCreate(AddressRangeBase):
    pass

class AddressRange(AddressRangeBase):
    id: int
    plc_id: int

    model_config = ConfigDict(from_attributes=True)

class PLCWithAddressRanges(PLC):
    address_ranges: List[AddressRange] = []

class PLCCreateWithAddressRanges(PLCCreate):
    address_ranges: List[AddressRangeCreate] = []

class PLCUpdateWithAddressRanges(PLCUpdate):
    address_ranges: Optional[List[AddressRangeCreate]] = None

# time_tables
class TimeTableBase(BaseModel):
    start_time: time
    end_time: time

class TimeTableCreate(TimeTableBase):
    pass

class TimeTable(TimeTableBase):
    id: int

    class Config:
        model_config = ConfigDict(from_attributes=True)

class TimeTableRequest(BaseModel):
    base_time: time

# customers
class CustomerBase(BaseModel):
    name: str

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None

class Customer(CustomerBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# products
class ProductBase(BaseModel):
    internal_product_number: str
    customer_product_number: str
    product_name: str
    customer_id: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    internal_product_number: Optional[str] = None
    customer_product_number: Optional[str] = None
    product_name: Optional[str] = None
    customer_id: Optional[int] = None

class Product(ProductBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ProductWithCustomer(ProductBase):
    id: int
    customer: CustomerBase

    class Config:
        from_attributes = True

# users
class UserRole(str, Enum):
    AD = "AD"   # Admin User
    CU = "CU"   # Common User

class UserBase(BaseModel):
    name: str
    role: UserRole

class UserCreate(BaseModel):
    id: Annotated[str, Field(min_length=1, max_length=10, pattern=r'^[a-zA-Z0-9]+$')]
    name: str
    role: UserRole

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None

class User(BaseModel):
    id: str
    name: str
    role: UserRole
    password_change_required: bool = False

    model_config = ConfigDict(from_attributes=True)


class UserCreateResult(BaseModel):
    user: User
    temporary_password: str


class LoginRequest(BaseModel):
    user_id: Annotated[str, Field(min_length=1, max_length=10, pattern=r'^[a-zA-Z0-9]+$')]
    password: Annotated[str, Field(min_length=1, max_length=128)]


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User


class ChangePasswordRequest(BaseModel):
    current_password: Annotated[str, Field(min_length=1, max_length=128)]
    new_password: Annotated[str, Field(min_length=8, max_length=128)]

User.model_rebuild()

# clients
class ClientBase(BaseModel):
    id: int
    name: str
    ip_address: str
    port_no: int

class Client(ClientBase):
    plc: Optional[PLC] = None
    
    class Config:
        from_attributes = True

class DeviceOut(BaseModel):
    id: int
    mac_address: str
    name: str
    device_status: str = 'active'
    last_known_ip_address: str | None = None
    ssh_username: str | None = None
    ssh_password: str | None = None
    standard_cycle_time: float | None
    clients: List[Client] = []
    alarm_groups: List['AlarmGroup'] = []

    class Config:
        from_attributes = True


Device = DeviceOut

class ClientCreate(BaseModel):
    name: str
    ip_address: IPvAnyAddress
    port_no: int
    plc_id: int

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    ip_address: Optional[IPvAnyAddress] = None
    port_no: Optional[int] = None
    plc_id: Optional[int] = None

class ClientAssociation(BaseModel):
    clients: List[ClientCreate]

# efficiency addresses
class EfficiencyAddressBase(BaseModel):
    address_type: str
    address: str
    classification_id: int

class EfficiencyAddressCreate(EfficiencyAddressBase):
    client_id: int

class EfficiencyAddress(EfficiencyAddressBase):
    id: int
    device_id: int
    client_id: int

    class Config:
        from_attributes = True

class EfficiencyAddressUpdate(BaseModel):
    address_type: Optional[str] = None
    address: Optional[str] = None
    classification_id: Optional[int] = None

class AlarmParseRuleOffsetMode(str, Enum):
    ROW_INDEX_WORD = "row_index_word"
    PRESERVE_ADDRESS = "preserve_address"

class AlarmParseAlarmNoMode(str, Enum):
    LINE_INDEX = "line_index"
    REGEX_GROUP = "regex_group"

class AlarmParseCommentMode(str, Enum):
    NONE = "none"
    CSV_COLUMNS = "csv_columns"
    REGEX_GROUP = "regex_group"

class AlarmParseRulePatternBase(BaseModel):
    pattern_name: str
    sort_order: int = 0
    regex_pattern: str
    address_type_value: Optional[str] = None
    address_type_group: Optional[int] = None
    alarm_no_mode: AlarmParseAlarmNoMode = AlarmParseAlarmNoMode.LINE_INDEX
    alarm_no_group: Optional[int] = None
    alarm_no_offset: int = 0
    address_group: Optional[int] = None
    bit_group: Optional[int] = None
    combined_address_bit_group: Optional[int] = None
    combined_address_bit_separator: str = "."
    comment_mode: AlarmParseCommentMode = AlarmParseCommentMode.NONE
    comment_group: Optional[int] = None
    comment_columns_start: Optional[int] = None
    address_pad_length: int = Field(4, ge=1)

class AlarmParseRulePatternCreate(AlarmParseRulePatternBase):
    pass

class AlarmParseRulePattern(AlarmParseRulePatternBase):
    id: int
    rule_id: int

    model_config = ConfigDict(from_attributes=True)

class AlarmParseRuleBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    skip_header_rows: int = Field(1, ge=0)
    offset_mode: AlarmParseRuleOffsetMode = AlarmParseRuleOffsetMode.ROW_INDEX_WORD

class AlarmParseRuleCreate(AlarmParseRuleBase):
    patterns: List[AlarmParseRulePatternCreate]

class AlarmParseRuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    skip_header_rows: Optional[int] = Field(None, ge=0)
    offset_mode: Optional[AlarmParseRuleOffsetMode] = None
    patterns: Optional[List[AlarmParseRulePatternCreate]] = None

class AlarmParseRule(AlarmParseRuleBase):
    id: int
    patterns: List[AlarmParseRulePattern] = []

    model_config = ConfigDict(from_attributes=True)

class AlarmGroupParseRuleSelectionUpdate(BaseModel):
    selected_parse_rule_id: Optional[int] = None

# アラームグループ関連のスキーマ
class AlarmGroupBase(BaseModel):
    name: str
    client_id: int

class AlarmGroupCreate(AlarmGroupBase):
    pass

class AlarmGroupUpdate(BaseModel):
    name: Optional[str] = None
    client_id: Optional[int] = None

class AlarmGroup(AlarmGroupBase):
    id: int
    device_id: int
    selected_parse_rule_id: Optional[int] = None

    class Config:
        from_attributes = True

# アラームアドレス関連のスキーマ
class AlarmAddressBase(BaseModel):
    alarm_no: int = Field(..., ge=0)
    address_type: str
    address: str
    address_bit: int

class AlarmAddressCreate(AlarmAddressBase):
    comments: List['AlarmCommentCreate'] = []

class AlarmAddressUpdate(BaseModel):
    address_type: Optional[str] = None
    address: Optional[str] = None
    address_bit: Optional[int] = None
    comments: Optional[List['AlarmCommentCreate']] = None

class AlarmAddress(AlarmAddressBase):
    alarm_group_id: int
    comments: List['AlarmComment'] = []

    class Config:
        from_attributes = True

class AlarmAddressPreview(AlarmAddressBase):
    comments: List['AlarmCommentCreate'] = []

class AlarmAddressParsePreviewRequest(BaseModel):
    csv_content: str
    parse_rule_id: Optional[int] = None

class AlarmAddressParsePreview(BaseModel):
    parse_rule_id: int
    rule_name: str
    offset_mode: AlarmParseRuleOffsetMode
    addresses: List[AlarmAddressPreview]
    warnings: List[str] = []
    processed_line_count: int
    matched_line_count: int
    unmatched_line_count: int

# アラームコメント関連のスキーマ
class AlarmCommentBase(BaseModel):
    comment_id: int
    comment: str

class AlarmCommentCreate(AlarmCommentBase):
    pass

class AlarmCommentUpdate(AlarmCommentBase):
    pass

class AlarmComment(AlarmCommentBase):
    alarm_group_id: int
    alarm_no: int

    class Config:
        from_attributes = True

# アラームグループとアラームアドレスの関係を表すスキーマ
class AlarmGroupWithAddresses(AlarmGroup):
    addresses: List[AlarmAddress] = []

# アラームアドレスとアラームコメントの関係を表すスキーマ
class AlarmAddressWithComments(AlarmAddress):
    comments: List[AlarmComment] = []

# デバイスの完全な情報を表すスキーマ
class DeviceFullInfo(DeviceOut):
    alarm_groups: List[AlarmGroupWithAddresses] = []

# 循環参照を解決するために、更新
AlarmAddressCreate.update_forward_refs()
AlarmAddressUpdate.update_forward_refs()
AlarmAddress.update_forward_refs()
AlarmAddressPreview.update_forward_refs()

# Logging関連のスキーマ
class LoggingDataSettingBase(BaseModel):
    data_name: str
    address_type: str
    address: str
    address_count: int
    data_type: str

class LoggingDataSettingCreate(LoggingDataSettingBase):
    pass

class LoggingDataSettingUpdate(BaseModel):
    data_name: Optional[str] = None
    address_type: Optional[str] = None
    address: Optional[str] = None
    address_count: Optional[int] = None
    data_type: Optional[str] = None

class LoggingDataSetting(LoggingDataSettingBase):
    id: int
    logging_setting_id: int

    class Config:
        from_attributes = True

class LoggingSettingBase(BaseModel):
    logging_name: str
    description: Optional[str] = None
    client_id: int
    address_type: str
    address: str
    is_rising: bool

class LoggingSettingCreate(LoggingSettingBase):
    pass

class LoggingSettingUpdate(BaseModel):
    logging_name: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[int] = None
    address_type: Optional[str] = None
    address: Optional[str] = None
    is_rising: Optional[bool] = None

class LoggingSetting(LoggingSettingBase):
    id: int
    device_id: int
    logging_data: List[LoggingDataSetting] = []

    class Config:
        from_attributes = True
        
# QualityControlSignal関連のスキーマ
class SignalType(str, Enum):
    Good = "Good"
    Ng = "Ng"
    Optional = "Optional"

class QualityControlSignalBase(BaseModel):
    address_type: str
    address: str
    signal_type: SignalType
    signal_shot_number: int
    client_id: int
    signal_name: str

class QualityControlSignalCreate(QualityControlSignalBase):
    parent_id: Optional[int] = Field(default=None, description="ID of the parent signal")

class QualityControlSignalUpdate(BaseModel):
    address_type: Optional[str] = None
    address: Optional[str] = None
    signal_type: Optional[SignalType] = None
    signal_shot_number: Optional[int] = None
    client_id: Optional[int] = None
    signal_name: Optional[str] = None
    parent_id: Optional[Union[int, None]] = Field(default=None, description="ID of the parent signal")

    class Config:
        extra = "allow"

class QualityControlSignalInDB(QualityControlSignalBase):
    id: int
    device_id: int
    parent_id: Optional[int] = Field(default=None, description="ID of the parent signal")

class QualityControlSignal(QualityControlSignalInDB):
    children: List['QualityControlSignal'] = Field(default_factory=list, description="List of child signals")

    class Config:
        from_attributes = True
        populate_by_name = True

# DeviceProduct関連のスキーマ
class DeviceProductAssociationBase(BaseModel):
    device_id: int
    product_id: int

class DeviceProductAssociationCreate(DeviceProductAssociationBase):
    pass

class DeviceProductAssociation(DeviceProductAssociationBase):
    id: int

    class Config:
        from_attributes = True

class DeviceProductAssociationResponse(BaseModel):
    id: int
    device_id: int
    product_id: int
    internal_product_number: str
    customer_product_number: str
    product_name: str
    customer_name: str

    class Config:
        from_attributes = True


# Print関連のスキーマ
class PrintTrigger(BaseModel):
    id: int
    device_id: int
    client_id: int
    template_id: int
    printer_id: int
    address_type: str
    address: str
    trigger_condition: str

    class Config:
        from_attributes = True



# Full-info用のスキーマ
class PLCFullInfo(BaseModel):
    id: int
    model: str
    manufacturer: str
    protocol: str

class ClientFullInfo(BaseModel):
    id: int
    name: str
    ip_address: str
    port_no: int
    plc: PLCFullInfo

class ClassificationGroupFullInfo(BaseModel):
    id: int
    name: str

class ClassificationFullInfo(BaseModel):
    id: int
    name: str
    group: ClassificationGroupFullInfo

class EfficiencyAddressFullInfo(BaseModel):
    id: int
    client: ClientFullInfo
    address_type: str
    address: str
    classification: ClassificationFullInfo

    class Config:
        from_attributes = True

class QualityControlSignalFullInfo(BaseModel):
    id: int
    client: Optional[ClientFullInfo] = None
    address_type: str
    address: str
    signal_type: str
    signal_shot_number: int
    signal_name: str
    parent_id: Optional[int] = None
    children: List['QualityControlSignalFullInfo'] = []

    class Config:
        from_attributes = True

class LoggingDataSettingFullInfo(BaseModel):
    id: int
    data_name: str
    address_type: str
    address: str
    address_count: int
    data_type: str

    class Config:
        from_attributes = True

class LoggingSettingFullInfo(BaseModel):
    id: int
    client: ClientFullInfo
    logging_name: str
    description: Optional[str] = None
    address_type: str
    address: str
    is_rising: bool
    logging_data: List[LoggingDataSettingFullInfo]

    class Config:
        from_attributes = True

class AlarmAddressFullInfo(BaseModel):
    alarm_group_id: int
    alarm_no: int
    address_type: str
    address: str
    address_bit: int
    comments: List[str]

    class Config:
        from_attributes = True

class AlarmGroupFullInfo(BaseModel):
    id: int
    name: str
    client: ClientFullInfo
    addresses: List[AlarmAddressFullInfo]

    class Config:
        from_attributes = True

class DeviceFullInfo(BaseModel):
    id: int
    mac_address: str
    name: str
    last_known_ip_address: Optional[str] = None
    ssh_username: Optional[str] = None
    standard_cycle_time: Optional[float]
    alarm_groups: List[AlarmGroupFullInfo]
    quality_control_signals: List[QualityControlSignalFullInfo]
    efficiency_addresses: List[EfficiencyAddressFullInfo]
    logging_settings: List[LoggingSettingFullInfo]
    print_triggers: List[PrintTrigger]

    class Config:
        from_attributes = True

class DeviceInfo(BaseModel):
    id: int
    mac_address: str
    name: str
    last_known_ip_address: Optional[str] = None
    ssh_username: Optional[str] = None
    standard_cycle_time: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

# QualityControlMeasurement関連のスキーマ
class QualityControlMeasurementBase(BaseModel):
    device_id: int
    quality_name: str
    quality_type: str
    quality_count: int
    event_time: datetime

class QualityControlMeasurementCreate(QualityControlMeasurementBase):
    pass

class QualityControlMeasurement(QualityControlMeasurementBase):
    id: int

    class Config:
        from_attributes = True

class QualityControlMeasurementResponse(QualityControlMeasurementBase):
    id: int

    class Config:
        from_attributes = True

# 新しく追加: 集計結果を表すスキーマ
class QualityControlMeasurementAggregated(BaseModel):
    interval_start: datetime
    good_count: int
    bad_count: int

    class Config:
        from_attributes = True


class EfficiencyMeasurementBase(BaseModel):
    device_id: int
    classification_group: str
    classification_status_name: str
    classification_status: bool
    event_time: datetime

class EfficiencyMeasurementCreate(EfficiencyMeasurementBase):
    pass

class EfficiencyMeasurement(EfficiencyMeasurementBase):
    id: int

    class Config:
        from_attributes = True

class EfficiencyMeasurementResponse(BaseModel):
    id: int
    device_id: int
    classification_group: str
    classification_status_name: str
    event_time: datetime

    class Config:
        from_attributes = True

class AlarmMeasurementBase(BaseModel):
    device_id: int
    alarm_group: str
    alarm_no: int
    alarm_state: bool
    event_time: datetime

class AlarmMeasurementCreate(AlarmMeasurementBase):
    pass

class AlarmMeasurement(AlarmMeasurementBase):
    id: int

    class Config:
        from_attributes = True

class AlarmMeasurementResponse(BaseModel):
    id: int
    device_id: int
    alarm_group: str
    alarm_no: int
    event_time: datetime

    class Config:
        from_attributes = True


# 循環参照を解決するために、更新
QualityControlSignal.model_rebuild()


# DeviceConnector (外部連携設定)

class DeviceConnectorBase(BaseModel):
    name: str = Field(..., max_length=100)
    connector_type: str = Field(default='aggregated_data', max_length=50)
    url: str = Field(..., max_length=500)
    api_key_header: str = Field(default='X-Api-Key', max_length=100)
    api_key_value: str = Field(..., max_length=255)
    send_interval_minutes: int = Field(default=60, ge=30)
    initial_sync_days: int = Field(default=7, ge=1)
    is_enabled: bool = True
    on_duplicate: str = Field(default='ignore', max_length=20)


class DeviceConnectorCreate(DeviceConnectorBase):
    pass


class DeviceConnectorUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    connector_type: Optional[str] = Field(None, max_length=50)
    url: Optional[str] = Field(None, max_length=500)
    api_key_header: Optional[str] = Field(None, max_length=100)
    api_key_value: Optional[str] = Field(None, max_length=255)
    send_interval_minutes: Optional[int] = Field(None, ge=30)
    initial_sync_days: Optional[int] = Field(None, ge=1)
    is_enabled: Optional[bool] = None
    on_duplicate: Optional[str] = Field(None, max_length=20)


class DeviceConnectorResponse(DeviceConnectorBase):
    id: int
    device_id: int
    last_sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)