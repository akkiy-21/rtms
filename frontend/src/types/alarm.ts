// src/types/alarm.ts
export interface AlarmGroup {
  id: number;
  name: string;
  client_id: number;
  device_id: number;
}

export interface AlarmAddress {
  alarm_no: number;
  address_type: string;
  address: string;
  address_bit: number;
  comments: AlarmComment[];
}

export interface AlarmComment {
  comment_id: number;
  comment: string;
}

export interface AlarmGroupFormData {
  name: string;
  client_id: number;
}

export interface AlarmAddressFormData {
  alarm_no: number;
  address_type: string;
  address: string;
  address_bit: number;
  comments: AlarmComment[];
}
