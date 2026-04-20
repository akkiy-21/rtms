// plc.ts

export interface PLC {
    id: number;
    model: string;
    manufacturer: 'KEYENCE' | 'OMRON' | 'MITSUBISHI';
    protocol: string;
  }
  
  export interface PLCFormData {
    model: string;
    manufacturer: 'KEYENCE' | 'OMRON' | 'MITSUBISHI';
    protocol: string;
  }
  
  export interface AddressRange {
    id: number;
    plc_id: number;
    address_type: string;
    address_range: string;
    numerical_base: 'decimal' | 'hex';
    data_type: 'bit' | 'word';
  }
  
  export interface AddressRangeFormData {
    address_type: string;
    address_range: string;
    numerical_base: 'decimal' | 'hex';
    data_type: 'bit' | 'word';
  }
  
  export interface PLCWithAddressRanges extends PLC {
    address_ranges: AddressRange[];
  }
  
  export interface PLCFormDataWithAddressRanges extends PLCFormData {
    address_ranges: AddressRangeFormData[];
  }
