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
}
