// src/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getMacAddress: () => ipcRenderer.invoke('get-mac-address'),
  getAllMacAddresses: () => ipcRenderer.invoke('get-all-mac-addresses'),
  getRouteToServer: (serverIP: string) => ipcRenderer.invoke('get-route-to-server', serverIP),
  updateMqttManagerMac: (macAddress: string) => ipcRenderer.invoke('update-mqtt-manager-mac', macAddress),
  
  // Store関連
  storeGet: (key: string) => ipcRenderer.invoke('electron-store-get', key),
  storeSet: (key: string, value: any) => ipcRenderer.invoke('electron-store-set', key, JSON.stringify(value)),
  
  // Network関連
  getNetworkInterfaces: () => ipcRenderer.invoke('get-network-interfaces'),
  setIPAddress: (interfaceType: 'wired' | 'wireless', address: string, netmask: string) =>
     ipcRenderer.invoke('set-ip-address', interfaceType, address, netmask),
  checkServerHealth: (serverAddress: string, serverPort: string) =>
     ipcRenderer.invoke('check-server-health', serverAddress, serverPort),

  // ネットワーク設定関連（新規追加）
  getNetworkAdapters: () => ipcRenderer.invoke('get-network-adapters'),
  applyNetworkSettings: (settings: any) => ipcRenderer.invoke('apply-network-settings', settings),
  httpRequest: (config: {
    method: 'get' | 'post' | 'put' | 'delete';
    url: string;
    baseURL: string;
    data?: any;
    headers?: any;
    timeout?: number;
  }) => ipcRenderer.invoke('http-request', config),
  
  // Scan関連
  getScanTime: () => ipcRenderer.invoke('get-scan-time'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onUpdateScanTime: (callback: (scanTime: number) => void) => {
    const listener = (_: any, scanTime: number) => {
      callback(scanTime);
    };
    ipcRenderer.on('update-scan-time', listener);
    return () => {
      ipcRenderer.removeListener('update-scan-time', listener);
    };
  },
  
  // エラーとステータス関連
  onUpdateErrorStatus: (callback: (errorType: string | null) => void) => {
    const listener = (_: any, errorType: string | null) => {
      callback(errorType);
    };
    ipcRenderer.on('update-error-status', listener);
    return () => {
      ipcRenderer.removeListener('update-error-status', listener);
    };
  },
  onUpdateConfig: (callback: (config: any) => void) => {
    ipcRenderer.on('update-config', (_, config) => callback(config));
  },
  onUpdateData: (callback: (data: any) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('update-data', subscription);
    return () => {
      ipcRenderer.removeListener('update-data', subscription);
    };
  },
  
  // Script関連
  onScriptReady: (callback: (ready: boolean) => void) => {
    ipcRenderer.on('script-ready', (_, ready) => callback(ready));
  },
  onBridgeRestartStarted: (callback: () => void) => {
    ipcRenderer.on('bridge-restart-started', () => callback());
  },
  
  // WebSocket関連
  onWebSocketStatus: (callback: (status: boolean) => void) => {
    ipcRenderer.on('websocket-status', (_, status) => callback(status));
  },
  sendConfigWebSocket: (config: any) => ipcRenderer.invoke('send-config-websocket', config),
  
  // MQTT関連
  onMqttStatus: (callback: (status: string) => void) => {
    ipcRenderer.on('mqtt-status', (_, status) => callback(status));
  },
  onMqttMessage: (callback: (data: { topic: string, message: string }) => void) => {
    ipcRenderer.on('mqtt-message', (_, data) => callback(data));
  },
  reconnectMqtt: () => ipcRenderer.invoke('reconnect-mqtt'),
  mqttPublish: (topic: string, message: string, qos: 0 | 1 | 2) => 
    ipcRenderer.invoke('mqtt-publish', topic, message, qos),
  
  // ダッシュボード関連
  publishDashboardInfo: (info: any) => ipcRenderer.send('publish-dashboard-info', info),
  
  // イベントリスナー管理
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ['mqtt-update-notification', 'mqtt-message'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => callback(...args));
    }
  },
  removeListener: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ['mqtt-update-notification', 'mqtt-message'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  },
  
  // カーソル関連
  onShowCursor: (callback: () => void) => {
    ipcRenderer.on('show-cursor', () => callback());
  },
  onHideCursor: (callback: () => void) => {
    ipcRenderer.on('hide-cursor', () => callback());
  },
  resetCursorTimer: () => ipcRenderer.send('reset-cursor-timer'),

  // 一般的なInvoke
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  restartApp: () => ipcRenderer.invoke('restart-app'),
});

// スキャンタイム管理
let currentScanTime: number | null = null;

ipcRenderer.on('update-scan-time', (_, scanTime) => {
  currentScanTime = scanTime;
});

ipcRenderer.on('request-scan-time', () => {
  ipcRenderer.send('scan-time-response', currentScanTime);
});