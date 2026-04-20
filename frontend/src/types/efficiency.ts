// src/types/efficiency.ts

export interface EfficiencyAddress {
  id: number;
  device_id: number;
  client_id: number;
  address_type: string;
  address: string;
  classification_id: number;
}

// EfficiencyAddressFormData は features/efficiency/efficiency-address-form-schema.ts で定義されています