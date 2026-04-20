/**
 * 技術用語定数
 * 
 * 国際標準の技術用語は英語表記を維持します。
 * これにより技術者間のコミュニケーションを円滑にし、
 * 国際的な標準に準拠します。
 * 
 * Requirements: 1.1, 10.1, 10.2, 10.3, 10.4, 10.5
 */

export const TECHNICAL_TERMS = {
  // ネットワーク関連
  IP_ADDRESS: 'IP Address',
  MAC_ADDRESS: 'MAC Address',
  URL: 'URL',
  API: 'API',
  PORT: 'Port',
  
  // プロトコル
  HTTP: 'HTTP',
  HTTPS: 'HTTPS',
  MQTT: 'MQTT',
  TCP: 'TCP',
  UDP: 'UDP',
  
  // データ形式
  JSON: 'JSON',
  XML: 'XML',
  CSV: 'CSV',
  
  // 識別子
  ID: 'ID',
  UUID: 'UUID',
  
  // その他の技術用語
  SSL: 'SSL',
  TLS: 'TLS',
  FTP: 'FTP',
  SSH: 'SSH',
  DNS: 'DNS',
  DHCP: 'DHCP',
  VPN: 'VPN',
  LAN: 'LAN',
  WAN: 'WAN',
  
  // データベース関連
  SQL: 'SQL',
  DATABASE: 'Database',
  
  // ファイル形式
  PDF: 'PDF',
  XLSX: 'XLSX',
  
  // 時間関連
  UTC: 'UTC',
  GMT: 'GMT',
  
  // 単位
  KB: 'KB',
  MB: 'MB',
  GB: 'GB',
  TB: 'TB',
  
  // 産業機器
  PLC: 'PLC',
  IO: 'IO',
} as const;

export type TechnicalTerm = typeof TECHNICAL_TERMS[keyof typeof TECHNICAL_TERMS];