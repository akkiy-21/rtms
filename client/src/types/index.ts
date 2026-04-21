// types/index.ts
export interface DeviceConfig {
    id: number;
    mac_address: string;
    name: string;
    last_known_ip_address?: string | null;
    ssh_username?: string | null;
  standard_cycle_time: number | null;
    alarm_groups: any[]; // 必要に応じて詳細な型を定義
    efficiency_addresses: any[]; // 必要に応じて詳細な型を定義
    logging_settings: any[]; // 必要に応じて詳細な型を定義
    print_triggers: any[]; // 必要に応じて詳細な型を定義
    quality_control_signals: any[]; // 必要に応じて詳細な型を定義
}

export interface TimeTable {
  id: number;
  start_time: string;
  end_time: string;
  base_time?: string;
  work_time?: string;
  break_time?: string;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

export interface ProductionData {
    currentProduction: number;
    totalProduction: number;
    operationTime: number;
}

export interface TimeTableData {
  productionCount: number;
  ngCount: number;
  operationTime: number;
  performanceLossTime: number;
  stopLossTime: number;
  plannedStopTime: number;
  lastUpdateTime: number;
}
  
export interface EfficiencyData {
    [key: string]: {
      state: boolean;
      name: string;
    };
}

export interface WebSocketMessage {
name: string;
data: EfficiencyData;
}

export interface SignalState {
    state: boolean;
    name: string;
    lastUpdated: number;
  }
  
export interface OperationStatus {
    status: string;
    category: string;
}

 export interface TimeMeasurement {
    '操業時間': number;
    '性能ロス時間': number;
    '停止ロス時間': number;
    '計画停止時間': number;
}

export type ProductionStats = {
    production: number;
    operationTime: number;
    performanceLossTime: number;
    stopLossTime: number;
    plannedStopTime: number;
  };
  
  export type OperationRateData = ProductionStats & {
    productionCount: number;
  };

export interface DeviceInfo {
  id: number;
  mac_address: string;
  name: string;
  last_known_ip_address?: string | null;
  ssh_username?: string | null;
  standard_cycle_time: number | null;
}

export interface SelectedAdapter {
  macAddress: string;
  ipAddress: string | null;
}

export interface PairingCodeResponse {
  status: 'pending' | 'confirmed' | 'draft' | 'registered';
  pairing_code?: string | null;
  expires_at?: string | null;
  refresh_interval_seconds: number;
  poll_interval_seconds: number;
}

// ネットワーク設定関連の型定義
export interface NetworkAdapter {
  name: string;           // インターフェース名（例: "Wi-Fi", "Ethernet", "wlan0", "eth0"）
  type: 'wireless' | 'wired';
  mac: string;            // MACアドレス
  isUp: boolean;          // インターフェースがアクティブかどうか
  state?: string;         // 接続状態（connected, disconnected, unavailable等）
  currentIP?: string;     // 現在のIPアドレス
  subnetMask?: string;    // サブネットマスク
  gateway?: string;       // デフォルトゲートウェイ
  prefixLength?: number;  // CIDR表記のプレフィックス長
  isDHCP?: boolean;       // DHCP使用中かどうか
  ssid?: string;          // 無線の場合、接続中のSSID
}

export interface NetworkSettings {
  adapterName: string;    // 設定対象のアダプタ名
  useDHCP: boolean;       // DHCP使用フラグ
  ipAddress?: string;     // 手動設定時のIPアドレス
  subnetMask?: string;    // サブネットマスク
  gateway?: string;       // デフォルトゲートウェイ
  // 無線の場合
  ssid?: string;          // SSID（手動入力）
  wifiPassword?: string;  // WiFiパスワード
}