// device.ts

export interface Device {
  id: number;
  mac_address: string;
  name: string;
  device_status: 'draft' | 'active';
  last_known_ip_address: string | null;
  ssh_username: string | null;
  ssh_password: string | null;
  standard_cycle_time: number | null;
}

export interface DeviceFormData {
  mac_address: string;
  name: string;
  device_status?: 'draft' | 'active';
  ssh_username?: string;
  ssh_password?: string;
  standard_cycle_time?: number;
}

export interface PairingInfo {
  pairing_code: string;
  mac_address: string;
  expires_at: string;
  status: 'pending' | 'confirmed' | 'consumed' | 'registered';
}

export interface PairingDeviceRegistrationData {
  pairing_code: string;
  name: string;
  ssh_username?: string;
  ssh_password?: string;
  standard_cycle_time?: number;
}

export interface PairingDeviceReassignmentData {
  pairing_code: string;
}

export type DeviceActionType = 'reboot' | 'shutdown' | 'deploy_rtms_client';
export type DeviceActionJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'partial';
export type DeviceActionJobItemStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'skipped';

export interface AppRelease {
  id: number;
  app_name: 'rtms-client';
  version: string;
  platform: string;
  filename: string;
  storage_path: string;
  sha256: string;
  file_size: number;
  status: 'ready' | 'archived';
  uploaded_by: string | null;
  uploaded_at: string;
  notes: string | null;
}

export interface DeviceActionJobItem {
  id: number;
  job_id: number;
  device_id: number;
  device_name: string | null;
  mac_address: string | null;
  last_known_ip_address: string | null;
  ssh_username: string | null;
  status: DeviceActionJobItemStatus;
  result_message: string | null;
  remote_artifact_path: string | null;
  started_at: string | null;
  finished_at: string | null;
  attempt_count: number;
  metadata_json: Record<string, unknown> | null;
}

export interface DeviceActionJob {
  id: number;
  action_type: DeviceActionType;
  status: DeviceActionJobStatus;
  scope: string;
  requested_by: string | null;
  release_id: number | null;
  requested_at: string;
  started_at: string | null;
  finished_at: string | null;
  total_items: number;
  queued_items: number;
  succeeded_items: number;
  failed_items: number;
  skipped_items: number;
  error_message: string | null;
  items: DeviceActionJobItem[];
}

export interface DeviceActionJobRequest {
  action_type: DeviceActionType;
  device_ids: number[];
  scope?: string;
}

export interface DeviceDeployJobRequest {
  release_id: number;
  device_ids: number[];
  scope?: string;
}