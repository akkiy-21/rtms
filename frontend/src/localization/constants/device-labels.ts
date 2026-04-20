/**
 * デバイス関連翻訳定数
 * 
 * デバイス管理機能で使用される翻訳定数を定義します。
 * デバイスフィールド、ステータス、メッセージなどの一貫した日本語表示を提供します。
 * 
 * Requirements: 1.2, 7.2
 */

export const DEVICE_LABELS = {
  // デバイス基本情報
  DEVICE: 'デバイス',
  DEVICES: 'デバイス',
  DEVICE_NAME: 'デバイス名',
  DEVICE_ID: 'デバイスID',
  
  // フィールドラベル
  FIELDS: {
    ID: 'ID',
    MAC_ADDRESS: 'MAC Address',
    NAME: 'デバイス名',
    DEVICE_NAME: 'デバイス名',
    STANDARD_CYCLE_TIME: '標準サイクルタイム',
    PLANNED_PRODUCTION_QUANTITY: '計画生産数量',
    PLANNED_PRODUCTION_TIME: '計画生産時間',
    STATUS: 'ステータス',
    CONNECTION_STATUS: '接続状態',
    LAST_SEEN: '最終確認',
    CREATED_AT: '作成日時',
    UPDATED_AT: '更新日時',
    DESCRIPTION: '説明',
    LOCATION: '設置場所',
    MODEL: 'モデル',
    MANUFACTURER: 'メーカー',
    SERIAL_NUMBER: 'シリアル番号',
    FIRMWARE_VERSION: 'ファームウェアバージョン',
  },
  
  // プレースホルダー
  PLACEHOLDERS: {
    MAC_ADDRESS: 'XX:XX:XX:XX:XX:XX',
    NAME: 'デバイス名を入力',
    DEVICE_NAME: 'デバイス名を入力',
    STANDARD_CYCLE_TIME: '標準サイクルタイムを入力',
    PLANNED_PRODUCTION_QUANTITY: '計画生産数量を入力',
    PLANNED_PRODUCTION_TIME: '計画生産時間を入力',
    DESCRIPTION: 'デバイスの説明を入力',
    LOCATION: '設置場所を入力',
    MODEL: 'モデル名を入力',
    MANUFACTURER: 'メーカー名を入力',
    SERIAL_NUMBER: 'シリアル番号を入力',
    SEARCH: 'デバイス名で検索...',
    SEARCH_BY_NAME: 'デバイス名で検索...',
    SEARCH_BY_MAC: 'MAC Addressで検索...',
  },
  
  // ヘルプテキスト
  HELP_TEXT: {
    MAC_ADDRESS: 'デバイスの一意識別子として使用されます（例：AA:BB:CC:DD:EE:FF）',
    NAME: 'デバイスを識別しやすい名前を入力してください（100文字以内）',
    STANDARD_CYCLE_TIME: '1サイクルあたりの標準時間を秒単位で入力してください（オプション）',
    PLANNED_PRODUCTION_QUANTITY: '計画された生産数量を入力してください（オプション）',
    PLANNED_PRODUCTION_TIME: '計画された生産時間を時間単位で入力してください（オプション）',
    OPTIONAL_FIELD: 'このフィールドは任意です',
    REQUIRED_FIELD: 'このフィールドは必須です',
    UNIQUE_FIELD: 'この値は一意である必要があります',
  },
  
  // デバイスステータス（将来的な拡張用）
  STATUS: {
    ONLINE: 'オンライン',
    OFFLINE: 'オフライン',
    ERROR: 'エラー',
    CONNECTING: '接続中',
    DISCONNECTED: '切断',
    MAINTENANCE: 'メンテナンス中',
    IDLE: 'アイドル',
    RUNNING: '稼働中',
    STOPPED: '停止中',
    WARNING: '警告',
    UNKNOWN: '不明',
  },
  
  // 接続状態
  CONNECTION_STATUS: {
    CONNECTED: '接続済み',
    DISCONNECTED: '切断',
    CONNECTING: '接続中',
    FAILED: '接続失敗',
    TIMEOUT: 'タイムアウト',
    LOST: '接続切断',
  },
  
  // アクション関連
  ACTIONS: {
    CREATE_DEVICE: 'デバイス作成',
    EDIT_DEVICE: 'デバイス編集',
    DELETE_DEVICE: 'デバイス削除',
    VIEW_DEVICE: 'デバイス詳細',
    DETAIL_SETTINGS: '詳細設定',
    DEVICE_SETTINGS: 'デバイス設定',
    CONNECT_DEVICE: 'デバイス接続',
    DISCONNECT_DEVICE: 'デバイス切断',
    RESTART_DEVICE: 'デバイス再起動',
    RESET_DEVICE: 'デバイスリセット',
    SYNC_DEVICE: 'デバイス同期',
    TEST_CONNECTION: '接続テスト',
    REFRESH_STATUS: 'ステータス更新',
    EXPORT_CONFIG: '設定エクスポート',
    IMPORT_CONFIG: '設定インポート',
  },
  
  // メッセージ
  MESSAGES: {
    CREATE_SUCCESS: 'デバイスを作成しました',
    UPDATE_SUCCESS: 'デバイスを更新しました',
    DELETE_SUCCESS: 'デバイスを削除しました',
    DELETE_CONFIRM: 'このデバイスを削除してもよろしいですか？',
    DELETE_WARNING: 'デバイスを削除すると、関連する設定やデータも削除されます',
    CONNECTION_SUCCESS: 'デバイスに接続しました',
    CONNECTION_FAILED: 'デバイスへの接続に失敗しました',
    DISCONNECTION_SUCCESS: 'デバイスから切断しました',
    STATUS_UPDATED: 'デバイスステータスを更新しました',
    CONFIG_EXPORTED: 'デバイス設定をエクスポートしました',
    CONFIG_IMPORTED: 'デバイス設定をインポートしました',
    SYNC_SUCCESS: 'デバイス同期が完了しました',
    SYNC_FAILED: 'デバイス同期に失敗しました',
    TEST_CONNECTION_SUCCESS: '接続テストが成功しました',
    TEST_CONNECTION_FAILED: '接続テストに失敗しました',
    NO_DEVICES_FOUND: 'デバイスが見つかりません',
    LOADING_DEVICES: 'デバイス情報を読み込み中...',
  },
  
  // テーブル関連
  TABLE: {
    HEADERS: {
      ID: 'ID',
      NAME: 'デバイス名',
      MAC_ADDRESS: 'MAC Address',
      STANDARD_CYCLE_TIME: '標準サイクルタイム',
      PLANNED_PRODUCTION_QUANTITY: '計画生産数量',
      PLANNED_PRODUCTION_TIME: '計画生産時間',
      STATUS: 'ステータス',
      CONNECTION_STATUS: '接続状態',
      LAST_SEEN: '最終確認',
      CREATED_AT: '作成日',
      ACTIONS: 'アクション',
    },
    SORT_BY: {
      ID: 'IDでソート',
      NAME: 'デバイス名でソート',
      MAC_ADDRESS: 'MAC Addressでソート',
      STANDARD_CYCLE_TIME: '標準サイクルタイムでソート',
      PLANNED_PRODUCTION_QUANTITY: '計画生産数量でソート',
      PLANNED_PRODUCTION_TIME: '計画生産時間でソート',
      STATUS: 'ステータスでソート',
      CONNECTION_STATUS: '接続状態でソート',
      LAST_SEEN: '最終確認でソート',
      CREATED_AT: '作成日でソート',
    },
    EMPTY_STATE: {
      TITLE: 'デバイスがありません',
      DESCRIPTION: 'デバイスを作成して開始してください',
      ACTION: 'デバイス作成',
    },
  },
  
  // ページタイトル
  PAGES: {
    LIST: 'デバイス管理',
    CREATE: 'デバイス作成',
    EDIT: 'デバイス編集',
    DETAIL: 'デバイス詳細',
    SETTINGS: 'デバイス設定',
    DETAIL_SETTINGS: '詳細設定',
    PRODUCT_SETTINGS: '製品設定',
    CLIENT_SETTINGS: 'クライアント設定',
  },
  
  // ナビゲーション
  NAVIGATION: {
    DEVICES: 'デバイス',
    DEVICE_LIST: 'デバイス一覧',
    DEVICE_MANAGEMENT: 'デバイス管理',
    DEVICE_SETTINGS: 'デバイス設定',
  },
  
  // フィルター関連
  FILTERS: {
    ALL_STATUS: 'すべてのステータス',
    ONLINE_ONLY: 'オンラインのみ',
    OFFLINE_ONLY: 'オフラインのみ',
    ERROR_ONLY: 'エラーのみ',
    CONNECTED_ONLY: '接続済みのみ',
    DISCONNECTED_ONLY: '切断のみ',
    WITH_PRODUCTION_DATA: '生産データあり',
    WITHOUT_PRODUCTION_DATA: '生産データなし',
  },
  
  // バリデーションメッセージ（デバイス固有）
  VALIDATION: {
    MAC_ADDRESS_REQUIRED: 'MAC Addressは必須です',
    MAC_ADDRESS_INVALID: 'MAC Addressの形式が正しくありません（例：XX:XX:XX:XX:XX:XX）',
    MAC_ADDRESS_EXISTS: 'このMAC Addressは既に使用されています',
    NAME_REQUIRED: 'デバイス名は必須です',
    NAME_MAX_LENGTH: 'デバイス名は100文字以内で入力してください',
    NAME_EXISTS: 'このデバイス名は既に使用されています',
    STANDARD_CYCLE_TIME_POSITIVE: '標準サイクルタイムは正の数値で入力してください',
    PLANNED_PRODUCTION_QUANTITY_POSITIVE: '計画生産数量は正の整数で入力してください',
    PLANNED_PRODUCTION_QUANTITY_INTEGER: '計画生産数量は整数で入力してください',
    PLANNED_PRODUCTION_TIME_POSITIVE: '計画生産時間は正の数値で入力してください',
    SERIAL_NUMBER_UNIQUE: 'このシリアル番号は既に使用されています',
    LOCATION_MAX_LENGTH: '設置場所は200文字以内で入力してください',
    DESCRIPTION_MAX_LENGTH: '説明は500文字以内で入力してください',
  },
  
  // 単位
  UNITS: {
    SECONDS: '秒',
    MINUTES: '分',
    HOURS: '時間',
    PIECES: '個',
    UNITS: '台',
    CYCLES: 'サイクル',
    PERCENT: '%',
    BYTES: 'バイト',
    KILOBYTES: 'KB',
    MEGABYTES: 'MB',
  },
  
  // 統計・サマリー
  STATISTICS: {
    TOTAL_DEVICES: '総デバイス数',
    ONLINE_DEVICES: 'オンラインデバイス数',
    OFFLINE_DEVICES: 'オフラインデバイス数',
    ERROR_DEVICES: 'エラーデバイス数',
    AVERAGE_CYCLE_TIME: '平均サイクルタイム',
    TOTAL_PRODUCTION_QUANTITY: '総計画生産数量',
    TOTAL_PRODUCTION_TIME: '総計画生産時間',
    DEVICE_UTILIZATION: 'デバイス稼働率',
    CONNECTION_RATE: '接続率',
  },
  
  // 設定関連
  SETTINGS: {
    GENERAL: '一般設定',
    CONNECTION: '接続設定',
    PRODUCTION: '生産設定',
    MONITORING: '監視設定',
    ALERTS: 'アラート設定',
    MAINTENANCE: 'メンテナンス設定',
    BACKUP: 'バックアップ設定',
    SECURITY: 'セキュリティ設定',
  },
  
  // エラーメッセージ
  ERRORS: {
    FETCH_FAILED: 'デバイス情報の取得に失敗しました',
    CREATE_FAILED: 'デバイスの作成に失敗しました',
    UPDATE_FAILED: 'デバイスの更新に失敗しました',
    DELETE_FAILED: 'デバイスの削除に失敗しました',
    CONNECTION_FAILED: 'デバイスへの接続に失敗しました',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
    PERMISSION_DENIED: 'この操作を実行する権限がありません',
    DEVICE_NOT_FOUND: 'デバイスが見つかりません',
    INVALID_CONFIGURATION: '無効な設定です',
    TIMEOUT_ERROR: 'タイムアウトが発生しました',
  },
} as const;

// デバイスステータスの型定義
export type DeviceStatus = keyof typeof DEVICE_LABELS.STATUS;
export type DeviceStatusLabel = typeof DEVICE_LABELS.STATUS[DeviceStatus];

// 接続状態の型定義
export type DeviceConnectionStatus = keyof typeof DEVICE_LABELS.CONNECTION_STATUS;
export type DeviceConnectionStatusLabel = typeof DEVICE_LABELS.CONNECTION_STATUS[DeviceConnectionStatus];

// デバイスフィールドの型定義
export type DeviceField = keyof typeof DEVICE_LABELS.FIELDS;
export type DeviceFieldLabel = typeof DEVICE_LABELS.FIELDS[DeviceField];

// デバイス設定の型定義
export type DeviceSetting = keyof typeof DEVICE_LABELS.SETTINGS;
export type DeviceSettingLabel = typeof DEVICE_LABELS.SETTINGS[DeviceSetting];