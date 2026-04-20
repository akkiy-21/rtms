/**
 * 業務用語翻訳マッピング
 * 
 * システム固有の業務用語を適切な日本語に翻訳します。
 * 一貫した用語使用により、ユーザーの理解を促進します。
 * 
 * Requirements: 1.2, 12.1
 */

export const BUSINESS_TERMS = {
  // エンティティ（単数形）
  DEVICE: 'デバイス',
  USER: 'ユーザー',
  GROUP: 'グループ',
  PRODUCT: '製品',
  CUSTOMER: '顧客',
  CLASSIFICATION: '分類',
  ALARM: 'アラーム',
  
  // エンティティ（複数形）
  DEVICES: 'デバイス',
  USERS: 'ユーザー',
  GROUPS: 'グループ',
  PRODUCTS: '製品',
  CUSTOMERS: '顧客',
  CLASSIFICATIONS: '分類',
  ALARMS: 'アラーム',
  
  // 設定関連
  SETTINGS: '設定',
  CONFIGURATION: '設定',
  MANAGEMENT: '管理',
  ADMINISTRATION: '管理',
  
  // データ関連
  DATA: 'データ',
  INFORMATION: '情報',
  DETAILS: '詳細',
  RECORD: 'レコード',
  RECORDS: 'レコード',
  
  // システム関連
  SYSTEM: 'システム',
  APPLICATION: 'アプリケーション',
  SERVICE: 'サービス',
  FUNCTION: '機能',
  FEATURE: '機能',
  
  // 操作関連
  OPERATION: '操作',
  PROCESS: 'プロセス',
  TASK: 'タスク',
  JOB: 'ジョブ',
  
  // 状態関連
  STATUS: 'ステータス',
  STATE: '状態',
  CONDITION: '状態',
  
  // 時間関連
  TIME: '時刻',
  DATE: '日付',
  DATETIME: '日時',
  TIMESTAMP: 'タイムスタンプ',
  SCHEDULE: 'スケジュール',
  
  // ログ関連
  LOG: 'ログ',
  LOGS: 'ログ',
  LOGGING: 'ロギング',
  
  // 効率性関連
  EFFICIENCY: '効率性',
  PERFORMANCE: 'パフォーマンス',
  
  // 品質管理関連
  QUALITY: '品質',
  CONTROL: '制御',
  SIGNAL: 'シグナル',
  SIGNALS: 'シグナル',
  
  // アドレス関連
  ADDRESS: 'アドレス',
  ADDRESSES: 'アドレス',
  OFFSET: 'オフセット',
  
  // テーブル関連
  TABLE: 'テーブル',
  TIMETABLE: 'タイムテーブル',
  
  // ダウンロード関連
  DOWNLOAD: 'ダウンロード',
  UPLOAD: 'アップロード',
  
  // IO関連
  INPUT: '入力',
  OUTPUT: '出力',
} as const;

export type BusinessTerm = typeof BUSINESS_TERMS[keyof typeof BUSINESS_TERMS];