// types/data.ts
export interface DeviceCheckboxState {
    [key: number]: boolean;
  }
  
  export interface DownloadResult {
    deviceId: number;
    deviceName: string;
    success: boolean;
    message: string;
  }