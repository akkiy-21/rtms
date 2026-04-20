// device.ts

export interface Device {
  id: number;
  mac_address: string;
  name: string;
  last_known_ip_address: string | null;
  ssh_username: string | null;
  ssh_password: string | null;
  standard_cycle_time: number | null;
}

export interface DeviceFormData {
  mac_address: string;  // 追加
  name: string;
  ssh_username?: string;
  ssh_password?: string;
  standard_cycle_time?: number;
}