// services/api.ts
import axios, { AxiosError } from 'axios';
import { DeviceConfig, TimeTable, DeviceInfo, PairingCodeResponse, SelectedAdapter } from '../types';

export class DeviceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeviceNotFoundError';
  }
}

export class ServerConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerConnectionError';
  }
}

// Check server connection health
// Note: CSP制約により、レンダラープロセスから直接axiosを使用できないため、
// メインプロセス経由でサーバー接続チェックを行います
export const checkServerHealth = async (
  serverAddress: string,
  serverPort: string
): Promise<boolean> => {
  try {
    // メインプロセス経由でサーバーヘルスチェックを実行
    const isHealthy = await window.electronAPI.checkServerHealth(serverAddress, serverPort);
    return isHealthy;
  } catch (error: any) {
    console.error(`サーバーヘルスチェックエラー:`, error);
    return false;
  }
};

// Find best network adapter that can connect to server
export const findBestAdapter = async (
  adapters: any[],
  serverAddress: string,
  serverPort: string
): Promise<SelectedAdapter | null> => {
  if (!adapters || adapters.length === 0) {
    console.error('❌ ネットワークアダプターが見つかりません');
    return null;
  }

  // Filter out invalid adapters (loopback, no MAC address, etc.)
  const validAdapters = adapters.filter(adapter =>
    adapter.mac &&
    adapter.mac !== '00:00:00:00:00:00' &&
    !adapter.internal &&
    adapter.operstate === 'up'
  );

  if (validAdapters.length === 0) {
    console.error('❌ 有効なネットワークアダプターが見つかりません');
    return null;
  }

  console.log('🔍 利用可能なアダプター:', validAdapters.map(a => ({
    mac: a.mac,
    iface: a.iface,
    ifaceName: a.ifaceName,
    type: a.type,
    operstate: a.operstate
  })));

  // サーバー接続チェック
  console.log(`⏱️ サーバー接続チェック: http://${serverAddress}:${serverPort}`);
  const startTime = Date.now();
  const isHealthy = await checkServerHealth(serverAddress, serverPort);
  const elapsed = Date.now() - startTime;

  if (!isHealthy) {
    console.error(`❌ サーバーに接続できません: http://${serverAddress}:${serverPort} (${elapsed}ms)`);
    return null;
  }

  console.log(`✅ サーバー接続成功 (${elapsed}ms)`);

  // OSのルーティングテーブルから実際に使用されているネットワークインターフェースのMACアドレスを取得
  try {
    const routeMacAddress = await window.electronAPI.getRouteToServer(serverAddress);

    if (routeMacAddress) {
      console.log(`🛣️ ルーティングテーブルから取得したMACアドレス: ${routeMacAddress}`);

      // MACアドレスで直接マッチング（ロケールやインターフェース名の表示形式に依存しない）
      const matchedAdapter = validAdapters.find(adapter =>
        adapter.mac.toLowerCase() === routeMacAddress.toLowerCase()
      );

      if (matchedAdapter) {
        console.log(`🎯 ルーティングテーブルから選択されたアダプター: ${matchedAdapter.iface} (${matchedAdapter.mac})`);
        return {
          macAddress: matchedAdapter.mac,
          ipAddress: matchedAdapter.ip4 || null,
        };
      } else {
        console.warn(`⚠️ ルーティングテーブルから取得したMACアドレス ${routeMacAddress} に一致するアダプターが見つかりませんでした`);
        console.log('🔍 利用可能なMACアドレス:', validAdapters.map(a => a.mac));
      }
    } else {
      console.warn('⚠️ ルーティングテーブルからMACアドレスを取得できませんでした');
    }
  } catch (error) {
    console.error('❌ ルーティング情報の取得エラー:', error);
  }

  // フォールバック: ルーティングテーブルから取得できなかった場合は、有線優先で選択
  console.log('⚠️ フォールバック: 有線優先で選択します');
  const sortedAdapters = [...validAdapters].sort((a, b) => {
    const aIsWired = a.type === 'wired' || a.iface?.startsWith('eth') || a.iface?.startsWith('en');
    const bIsWired = b.type === 'wired' || b.iface?.startsWith('eth') || b.iface?.startsWith('en');

    if (aIsWired && !bIsWired) return -1;
    if (!aIsWired && bIsWired) return 1;
    return 0;
  });

  const bestAdapter = sortedAdapters[0];
  console.log(`🎯 フォールバックで選択されたアダプター: ${bestAdapter.iface} (${bestAdapter.mac})`);
  return {
    macAddress: bestAdapter.mac,
    ipAddress: bestAdapter.ip4 || null,
  };
};

export const updateDeviceRuntimeNetwork = async (
  serverAddress: string,
  serverPort: string,
  deviceId: number,
  lastKnownIpAddress: string
): Promise<void> => {
  const result = await window.electronAPI.httpRequest({
    method: 'put',
    url: `/devices/${deviceId}/runtime-network`,
    baseURL: `http://${serverAddress}:${serverPort}`,
    data: {
      last_known_ip_address: lastKnownIpAddress,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  if ('error' in result) {
    const error = result.error;
    throw new ServerConnectionError(`Failed to update runtime network: ${error.message}`);
  }
};

// get device config
export const getDeviceConfig = async (
  serverAddress: string,
  serverPort: string,
  macAddress: string
): Promise<DeviceConfig> => {
  console.log(`🌐 HTTPサーバーに接続を試みています: http://${serverAddress}:${serverPort}`);

  const result = await window.electronAPI.httpRequest({
    method: 'get',
    url: `/devices/full-info/${macAddress}`,
    baseURL: `http://${serverAddress}:${serverPort}`,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  if ('error' in result) {
    console.error('❌ getDeviceConfig エラー:', result.error);
    const error = result.error;

    if (error.code === 'ECONNREFUSED') {
      console.error('接続拒否されました');
      throw new ServerConnectionError(`サーバーに接続できません: 接続が拒否されました`);
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      console.error('接続タイムアウト');
      throw new ServerConnectionError(`サーバーに接続できません: タイムアウト`);
    } else if (error.response?.status === 404) {
      throw new DeviceNotFoundError(`Device with MAC address ${macAddress} not found`);
    } else if (error.response?.status === 422) {
      throw new DeviceNotFoundError(`Invalid MAC address: ${macAddress}`);
    } else {
      throw new ServerConnectionError(`Failed to connect to server: ${error.message}`);
    }
  }

  console.log('✅ デバイス設定取得成功:', result.data);
  return result.data;
};

// get time tables
export const getTimeTables = async (
  serverAddress: string,
  serverPort: string
): Promise<TimeTable[]> => {
  const result = await window.electronAPI.httpRequest({
    method: 'get',
    url: '/time_tables/',
    baseURL: `http://${serverAddress}:${serverPort}`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if ('error' in result) {
    const error = result.error;
    if (error.response?.status === 404) {
      throw new Error('Time tables not found');
    } else {
      throw new ServerConnectionError(`Failed to connect to server: ${error.message}`);
    }
  }

  return result.data;
};

export const requestPairingCode = async (
  serverAddress: string,
  serverPort: string,
  macAddress: string
): Promise<PairingCodeResponse> => {
  const result = await window.electronAPI.httpRequest({
    method: 'post',
    url: '/pairings/request',
    baseURL: `http://${serverAddress}:${serverPort}`,
    data: {
      mac_address: macAddress,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  if ('error' in result) {
    const error = result.error;
    throw new ServerConnectionError(`Failed to request pairing code: ${error.message}`);
  }

  return result.data;
};

// get device info
export const getDeviceInfo = async (
  serverAddress: string,
  serverPort: string,
  deviceId: number
): Promise<DeviceInfo> => {
  const result = await window.electronAPI.httpRequest({
    method: 'get',
    url: `/devices/${deviceId}/device-info`,
    baseURL: `http://${serverAddress}:${serverPort}`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if ('error' in result) {
    const error = result.error;
    if (error.response?.status === 404) {
      throw new DeviceNotFoundError(`Device with ID ${deviceId} not found`);
    } else {
      throw new ServerConnectionError(`Failed to connect to server: ${error.message}`);
    }
  }

  return result.data;
};