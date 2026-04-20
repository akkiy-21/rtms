// types/client.ts


export interface Client {
  id: number;
  name: string;
  ip_address: string;
  port_no: number;
  plc: {
    id: number;
    model: string;
    manufacturer: string;
    protocol: string;
  };
}

export interface ClientFormData {
  name: string;
  ip_address: string;
  port_no: number;
  plc_id: number;
}