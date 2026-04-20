// device.ts

export interface Device {
  id: number;
  mac_address: string;
  name: string;
  standard_cycle_time: number | null;
  planned_production_quantity: number | null;
  planned_production_time: number | null;
}

export interface DeviceFormData {
  mac_address: string;  // 追加
  name: string;
  standard_cycle_time?: number;
  planned_production_quantity?: number;
  planned_production_time?: number;
}