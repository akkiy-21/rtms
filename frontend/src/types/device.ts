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