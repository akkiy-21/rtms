// electron.d.ts
import { ElectronAPI } from '@electron-toolkit/preload'
import { Systeminformation } from 'systeminformation';
import { NetworkAdapter, NetworkSettings } from './types';

declare global {
  interface Window {
    electron: ElectronAPI
    electronAPI: {
      getMacAddress: () => Promise<string>;
      getAllMacAddresses: () => Promise<Systeminformation.NetworkInterfacesData[]>;
      getRouteToServer: (serverIP: string) => Promise<string | null>;
      updateMqttManagerMac: (macAddress: string) => Promise<void>;
      storeGet: (key: string) => Promise<any>;
      storeSet: (key: string, value: any) => Promise<void>;
      getNetworkInterfaces: () => Promise<any>;
      setIPAddress: (interfaceType: 'wired' | 'wireless', address: string, netmask: string) => Promise<void>;
      checkServerHealth: (serverAddress: string, serverPort: string) => Promise<boolean>;
      // ネットワーク設定関連（新規追加）
      getNetworkAdapters: () => Promise<NetworkAdapter[]>;
      applyNetworkSettings: (settings: NetworkSettings) => Promise<{ success: boolean; message: string }>;
      httpRequest: (config: {
        method: 'get' | 'post' | 'put' | 'delete';
        url: string;
        baseURL: string;
        data?: any;
        headers?: any;
        timeout?: number;
      }) => Promise<{ data: any; status: number; statusText: string } | { error: any }>;
      getScanTime: () => Promise<number | null>;
      getAppVersion: () => Promise<string>;
      onUpdateScanTime: (callback: (scanTime: number) => void) => void;
      onUpdateErrorStatus: (callback: (errorType: string | null) => void) => void;
      sendConfigWebSocket: (config: any) => Promise<{ status: string; message: string }>;
      onUpdateData: (callback: (data: any) => void) => () => void;
      onMqttStatus: (callback: (status: string) => void) => void;
      onMqttMessage: (callback: (data: { topic: string, message: string }) => void) => void;
      reconnectMqtt: () => Promise<void>;
      mqttPublish: (topic: string, message: string, qos: 0 | 1 | 2) => Promise<{ success: boolean; error?: string }>;
      publishDashboardInfo: (info: any) => void;
      on: (channel: string, callback: (...args: any[]) => void) => void;
      removeListener: (channel: string, callback: (...args: any[]) => void) => void;
      connectWebSockets: () => void;
      onScriptReady: (callback: (ready: boolean) => void) => void;
      onBridgeRestartStarted: (callback: () => void) => void;
      onWebSocketStatus: (callback: (status: boolean) => void) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      restartApp: () => Promise<any>;
    }
  }
}

export {};