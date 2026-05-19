export interface DeviceConnector {
  id: number;
  device_id: number;
  name: string;
  connector_type: string;
  url: string;
  api_key_header: string;
  api_key_value: string;
  send_interval_minutes: number;
  initial_sync_days: number;
  is_enabled: boolean;
  on_duplicate: string;
  alarm_group_id: number | null;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeviceConnectorCreate {
  name: string;
  connector_type: string;
  url: string;
  api_key_header: string;
  api_key_value: string;
  send_interval_minutes: number;
  initial_sync_days: number;
  is_enabled: boolean;
  on_duplicate: string;
  alarm_group_id?: number | null;
}

export interface DeviceConnectorUpdate {
  name?: string;
  connector_type?: string;
  url?: string;
  api_key_header?: string;
  api_key_value?: string;
  send_interval_minutes?: number;
  initial_sync_days?: number;
  is_enabled?: boolean;
  on_duplicate?: string;
  alarm_group_id?: number | null;
}

export interface ConnectorLog {
  id: number;
  connector_id: number;
  triggered_at: string;
  is_manual: boolean;
  status: 'success' | 'failed' | 'no_data';
  status_code: number | null;
  records_count: number | null;
  error_message: string | null;
}
