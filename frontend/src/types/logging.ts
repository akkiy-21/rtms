// src/types/logging.ts

export interface LoggingSetting {
  id: number;
  device_id: number;
  client_id: number;
  logging_name: string;
  description?: string;
  address_type: string;
  address: string;
  is_rising: boolean;
  logging_data: LoggingDataSetting[];
}

export interface LoggingDataSetting {
  id: number;
  logging_setting_id: number;
  data_name: string;
  address_type: string;
  address: string;
  address_count: number;
  data_type: string;
}

export interface LoggingSettingFormData {
  logging_name: string;
  description?: string;
  client_id: number;
  address_type: string;
  address: string;
  is_rising: boolean;
}

export interface LoggingDataSettingFormData {
  data_name: string;
  address_type: string;
  address: string;
  address_count: number;
  data_type: string;
}