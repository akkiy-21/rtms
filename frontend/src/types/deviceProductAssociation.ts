// src/types/deviceProductAssociation.ts

export interface DeviceProductAssociation {
    id: number;
    device_id: number;
    product_id: number;
    internal_product_number: string;
    customer_product_number: string;
    product_name: string;
    customer_name: string;
  }