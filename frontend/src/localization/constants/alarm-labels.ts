/**
 * アラーム関連翻訳定数
 * 
 * アラーム管理機能で使用される翻訳定数を定義します。
 * アラームグループ、アラームアドレス、コメントなどの一貫した日本語表示を提供します。
 * 
 * Requirements: 1.2
 */

export const ALARM_LABELS = {
  // アラーム基本用語
  ALARM: 'アラーム',
  ALARMS: 'アラーム',
  ALARM_GROUP: 'アラームグループ',
  ALARM_GROUPS: 'アラームグループ',
  ALARM_ADDRESS: 'アラームアドレス',
  ALARM_ADDRESSES: 'アラームアドレス',
  ALARM_COMMENT: 'アラームコメント',
  ALARM_COMMENTS: 'アラームコメント',
  
  // フィールドラベル
  FIELDS: {
    ID: 'ID',
    NAME: 'アラームグループ名',
    GROUP_NAME: 'アラームグループ名',
    CLIENT: 'クライアント',
    CLIENT_ID: 'クライアントID',
    DEVICE: 'デバイス',
    DEVICE_ID: 'デバイスID',
    ALARM_NO: 'アラーム番号',
    ALARM_NUMBER: 'アラーム番号',
    ADDRESS_TYPE: 'アドレスタイプ',
    ADDRESS: 'アドレス',
    OFFSET_ADDRESS: 'オフセットアドレス',
    ADDRESS_BIT: 'アドレスビット',
    BIT: 'ビット',
    COMMENT: 'コメント',
    COMMENT_1: 'コメント1',
    COMMENT_2: 'コメント2',
    COMMENT_3: 'コメント3',
    COMMENT_ID: 'コメントID',
    CREATED_AT: '作成日時',
    UPDATED_AT: '更新日時',
    STATUS: 'ステータス',
    PRIORITY: '優先度',
    SEVERITY: '重要度',
    DESCRIPTION: '説明',
    NOTES: '備考',
  },
  
  // プレースホルダー
  PLACEHOLDERS: {
    GROUP_NAME: 'アラームグループ名を入力',
    ALARM_GROUP_NAME: 'アラームグループ名を入力',
    CLIENT: 'クライアントを選択',
    SELECT_CLIENT: 'クライアントを選択',
    ALARM_NO: 'アラーム番号を入力',
    ADDRESS_TYPE: 'アドレスタイプを選択',
    SELECT_ADDRESS_TYPE: 'アドレスタイプを選択',
    ADDRESS: 'アドレスを入力',
    OFFSET_ADDRESS: 'オフセットアドレスを入力',
    ADDRESS_BIT: 'ビット番号を入力',
    COMMENT: 'コメントを入力',
    DESCRIPTION: '説明を入力',
    SEARCH_GROUPS: 'アラームグループを検索...',
    SEARCH_ADDRESSES: 'アラーム番号で検索...',
    SEARCH_BY_NUMBER: 'アラーム番号で検索...',
    SEARCH_BY_ADDRESS: 'アドレスで検索...',
  },
  
  // ヘルプテキスト
  HELP_TEXT: {
    GROUP_NAME: 'アラームグループを識別しやすい名前を入力してください（100文字以内）',
    CLIENT: 'このアラームグループに関連付けるクライアントを選択してください',
    ALARM_NO: 'アラーム番号を入力してください（1以上の整数）',
    ADDRESS_TYPE: 'PLCのアドレスタイプを選択してください',
    ADDRESS: 'PLCアドレスを入力してください（選択したアドレスタイプの範囲内）',
    OFFSET_ADDRESS: 'オフセットアドレスを入力してください',
    ADDRESS_BIT: 'ビット番号を入力してください（0-15の範囲）',
    COMMENT: 'アラームの詳細情報やメモを入力してください',
    ADDRESS_RANGE: '選択したアドレスタイプの有効範囲内で入力してください',
    REQUIRED_FIELD: 'このフィールドは必須です',
    OPTIONAL_FIELD: 'このフィールドは任意です',
  },
  
  // アラーム優先度
  PRIORITY: {
    LOW: '低',
    NORMAL: '通常',
    HIGH: '高',
    CRITICAL: '緊急',
    EMERGENCY: '非常事態',
  },
  
  // アラーム重要度
  SEVERITY: {
    INFO: '情報',
    WARNING: '警告',
    ERROR: 'エラー',
    CRITICAL: '重大',
    FATAL: '致命的',
  },
  
  // アラームステータス
  STATUS: {
    ACTIVE: 'アクティブ',
    INACTIVE: '非アクティブ',
    ACKNOWLEDGED: '確認済み',
    RESOLVED: '解決済み',
    PENDING: '保留中',
    DISABLED: '無効',
    ENABLED: '有効',
    TRIGGERED: '発生中',
    CLEARED: 'クリア済み',
  },
  
  // アクション関連
  ACTIONS: {
    CREATE_GROUP: 'アラームグループ作成',
    EDIT_GROUP: 'アラームグループ編集',
    DELETE_GROUP: 'アラームグループ削除',
    VIEW_GROUP: 'アラームグループ詳細',
    CREATE_ADDRESS: 'アラームアドレス作成',
    EDIT_ADDRESS: 'アラームアドレス編集',
    DELETE_ADDRESS: 'アラームアドレス削除',
    VIEW_ADDRESS: 'アラームアドレス詳細',
    VIEW_ADDRESSES: 'アドレス一覧',
    MANAGE_ADDRESSES: 'アドレス管理',
    ADD_COMMENT: 'コメント追加',
    EDIT_COMMENT: 'コメント編集',
    DELETE_COMMENT: 'コメント削除',
    ACKNOWLEDGE_ALARM: 'アラーム確認',
    CLEAR_ALARM: 'アラームクリア',
    DISABLE_ALARM: 'アラーム無効化',
    ENABLE_ALARM: 'アラーム有効化',
    TEST_ALARM: 'アラームテスト',
    EXPORT_CONFIG: '設定エクスポート',
    IMPORT_CONFIG: '設定インポート',
  },
  
  // メッセージ
  MESSAGES: {
    CREATE_GROUP_SUCCESS: 'アラームグループを作成しました',
    UPDATE_GROUP_SUCCESS: 'アラームグループを更新しました',
    DELETE_GROUP_SUCCESS: 'アラームグループを削除しました',
    DELETE_GROUP_CONFIRM: 'このアラームグループを削除してもよろしいですか？',
    DELETE_GROUP_WARNING: 'アラームグループを削除すると、関連するアラームアドレスも削除されます',
    CREATE_ADDRESS_SUCCESS: 'アラームアドレスを作成しました',
    UPDATE_ADDRESS_SUCCESS: 'アラームアドレスを更新しました',
    DELETE_ADDRESS_SUCCESS: 'アラームアドレスを削除しました',
    DELETE_ADDRESS_CONFIRM: 'このアラームアドレスを削除してもよろしいですか？',
    ACKNOWLEDGE_SUCCESS: 'アラームを確認しました',
    CLEAR_SUCCESS: 'アラームをクリアしました',
    TEST_SUCCESS: 'アラームテストが完了しました',
    TEST_FAILED: 'アラームテストに失敗しました',
    CONFIG_EXPORTED: 'アラーム設定をエクスポートしました',
    CONFIG_IMPORTED: 'アラーム設定をインポートしました',
    NO_GROUPS_FOUND: 'アラームグループが見つかりません',
    NO_ADDRESSES_FOUND: 'アラームアドレスが見つかりません',
    LOADING_GROUPS: 'アラームグループを読み込み中...',
    LOADING_ADDRESSES: 'アラームアドレスを読み込み中...',
    INVALID_ADDRESS_RANGE: 'アドレス範囲が無効です',
    ADDRESS_OUT_OF_RANGE: 'アドレスが範囲外です',
  },
  
  // テーブル関連
  TABLE: {
    HEADERS: {
      ID: 'ID',
      NAME: 'グループ名',
      GROUP_NAME: 'グループ名',
      CLIENT: 'クライアント',
      ALARM_NO: 'No',
      ALARM_NUMBER: 'アラーム番号',
      TYPE: 'タイプ',
      ADDRESS_TYPE: 'アドレスタイプ',
      ADDRESS: 'アドレス',
      BIT: 'ビット',
      ADDRESS_BIT: 'ビット',
      COMMENT_1: 'コメント1',
      COMMENT_2: 'コメント2',
      COMMENT_3: 'コメント3',
      STATUS: 'ステータス',
      PRIORITY: '優先度',
      SEVERITY: '重要度',
      CREATED_AT: '作成日',
      UPDATED_AT: '更新日',
      ACTIONS: 'アクション',
    },
    SORT_BY: {
      ID: 'IDでソート',
      NAME: 'グループ名でソート',
      CLIENT: 'クライアントでソート',
      ALARM_NO: 'アラーム番号でソート',
      ADDRESS_TYPE: 'アドレスタイプでソート',
      ADDRESS: 'アドレスでソート',
      STATUS: 'ステータスでソート',
      PRIORITY: '優先度でソート',
      SEVERITY: '重要度でソート',
      CREATED_AT: '作成日でソート',
      UPDATED_AT: '更新日でソート',
    },
    EMPTY_STATE: {
      GROUPS_TITLE: 'アラームグループがありません',
      GROUPS_DESCRIPTION: 'アラームグループを作成して開始してください',
      GROUPS_ACTION: 'アラームグループ作成',
      ADDRESSES_TITLE: 'アラームアドレスがありません',
      ADDRESSES_DESCRIPTION: 'アラームアドレスを追加して開始してください',
      ADDRESSES_ACTION: 'アラームアドレス追加',
    },
  },
  
  // ページタイトル
  PAGES: {
    GROUPS_LIST: 'アラームグループ管理',
    GROUP_CREATE: 'アラームグループ作成',
    GROUP_EDIT: 'アラームグループ編集',
    GROUP_DETAIL: 'アラームグループ詳細',
    ADDRESSES_LIST: 'アラームアドレス管理',
    ADDRESS_CREATE: 'アラームアドレス作成',
    ADDRESS_EDIT: 'アラームアドレス編集',
    ADDRESS_DETAIL: 'アラームアドレス詳細',
    ALARM_SETTINGS: 'アラーム設定',
    ALARM_MONITORING: 'アラーム監視',
    ALARM_HISTORY: 'アラーム履歴',
  },
  
  // ナビゲーション
  NAVIGATION: {
    ALARMS: 'アラーム',
    ALARM_GROUPS: 'アラームグループ',
    ALARM_ADDRESSES: 'アラームアドレス',
    ALARM_SETTINGS: 'アラーム設定',
    ALARM_MONITORING: 'アラーム監視',
    ALARM_HISTORY: 'アラーム履歴',
    ALARM_MANAGEMENT: 'アラーム管理',
  },
  
  // フィルター関連
  FILTERS: {
    ALL_GROUPS: 'すべてのグループ',
    ALL_CLIENTS: 'すべてのクライアント',
    ALL_STATUS: 'すべてのステータス',
    ACTIVE_ONLY: 'アクティブのみ',
    INACTIVE_ONLY: '非アクティブのみ',
    HIGH_PRIORITY: '高優先度のみ',
    CRITICAL_ONLY: '緊急のみ',
    ACKNOWLEDGED_ONLY: '確認済みのみ',
    UNACKNOWLEDGED_ONLY: '未確認のみ',
    RECENT_ALARMS: '最近のアラーム',
    TODAY_ALARMS: '今日のアラーム',
    THIS_WEEK_ALARMS: '今週のアラーム',
  },
  
  // バリデーションメッセージ（アラーム固有）
  VALIDATION: {
    GROUP_NAME_REQUIRED: 'アラームグループ名は必須です',
    GROUP_NAME_MAX_LENGTH: 'アラームグループ名は100文字以内で入力してください',
    GROUP_NAME_EXISTS: 'このアラームグループ名は既に使用されています',
    CLIENT_REQUIRED: 'クライアントを選択してください',
    CLIENT_INVALID: '有効なクライアントを選択してください',
    ALARM_NO_REQUIRED: 'アラーム番号は必須です',
    ALARM_NO_POSITIVE: 'アラーム番号は1以上の整数で入力してください',
    ALARM_NO_INTEGER: 'アラーム番号は整数で入力してください',
    ALARM_NO_EXISTS: 'このアラーム番号は既に使用されています',
    ADDRESS_TYPE_REQUIRED: 'アドレスタイプを選択してください',
    ADDRESS_REQUIRED: 'アドレスは必須です',
    ADDRESS_INVALID: 'アドレスの形式が正しくありません',
    ADDRESS_OUT_OF_RANGE: 'アドレスが有効範囲外です',
    ADDRESS_BIT_REQUIRED: 'アドレスビットは必須です',
    ADDRESS_BIT_RANGE: 'アドレスビットは0-15の範囲で入力してください',
    ADDRESS_BIT_INTEGER: 'アドレスビットは整数で入力してください',
    COMMENT_MAX_LENGTH: 'コメントは500文字以内で入力してください',
    OFFSET_ADDRESS_INVALID: 'オフセットアドレスの形式が正しくありません',
    OFFSET_ADDRESS_RANGE: 'オフセットアドレスが有効範囲外です',
  },
  
  // 設定関連
  SETTINGS: {
    GENERAL: '一般設定',
    NOTIFICATION: '通知設定',
    ESCALATION: 'エスカレーション設定',
    ACKNOWLEDGMENT: '確認設定',
    LOGGING: 'ログ設定',
    RETENTION: '保持設定',
    EXPORT: 'エクスポート設定',
    IMPORT: 'インポート設定',
    BACKUP: 'バックアップ設定',
    RECOVERY: '復旧設定',
  },
  
  // 統計・サマリー
  STATISTICS: {
    TOTAL_GROUPS: '総アラームグループ数',
    TOTAL_ADDRESSES: '総アラームアドレス数',
    ACTIVE_ALARMS: 'アクティブアラーム数',
    ACKNOWLEDGED_ALARMS: '確認済みアラーム数',
    UNACKNOWLEDGED_ALARMS: '未確認アラーム数',
    HIGH_PRIORITY_ALARMS: '高優先度アラーム数',
    CRITICAL_ALARMS: '緊急アラーム数',
    ALARM_RATE: 'アラーム発生率',
    ACKNOWLEDGMENT_RATE: 'アラーム確認率',
    RESOLUTION_TIME: '平均解決時間',
    RESPONSE_TIME: '平均応答時間',
  },
  
  // エラーメッセージ
  ERRORS: {
    FETCH_GROUPS_FAILED: 'アラームグループの取得に失敗しました',
    FETCH_ADDRESSES_FAILED: 'アラームアドレスの取得に失敗しました',
    CREATE_GROUP_FAILED: 'アラームグループの作成に失敗しました',
    UPDATE_GROUP_FAILED: 'アラームグループの更新に失敗しました',
    DELETE_GROUP_FAILED: 'アラームグループの削除に失敗しました',
    CREATE_ADDRESS_FAILED: 'アラームアドレスの作成に失敗しました',
    UPDATE_ADDRESS_FAILED: 'アラームアドレスの更新に失敗しました',
    DELETE_ADDRESS_FAILED: 'アラームアドレスの削除に失敗しました',
    ACKNOWLEDGE_FAILED: 'アラーム確認に失敗しました',
    CLEAR_FAILED: 'アラームクリアに失敗しました',
    TEST_FAILED: 'アラームテストに失敗しました',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
    PERMISSION_DENIED: 'この操作を実行する権限がありません',
    GROUP_NOT_FOUND: 'アラームグループが見つかりません',
    ADDRESS_NOT_FOUND: 'アラームアドレスが見つかりません',
    CLIENT_NOT_FOUND: 'クライアントが見つかりません',
    DEVICE_NOT_FOUND: 'デバイスが見つかりません',
    INVALID_CONFIGURATION: '無効な設定です',
    TIMEOUT_ERROR: 'タイムアウトが発生しました',
    UNKNOWN_ERROR: '予期しないエラーが発生しました',
  },
  
  // 単位・形式
  UNITS: {
    NUMBER: '番号',
    BIT: 'ビット',
    ADDRESS: 'アドレス',
    COUNT: '件',
    PERCENT: '%',
    SECONDS: '秒',
    MINUTES: '分',
    HOURS: '時間',
    DAYS: '日',
  },
  
  // 時間関連
  TIME: {
    JUST_NOW: 'たった今',
    MINUTES_AGO: '分前',
    HOURS_AGO: '時間前',
    DAYS_AGO: '日前',
    WEEKS_AGO: '週間前',
    MONTHS_AGO: 'ヶ月前',
    YEARS_AGO: '年前',
    NEVER: 'なし',
    UNKNOWN: '不明',
  },
} as const;

// アラーム優先度の型定義
export type AlarmPriority = keyof typeof ALARM_LABELS.PRIORITY;
export type AlarmPriorityLabel = typeof ALARM_LABELS.PRIORITY[AlarmPriority];

// アラーム重要度の型定義
export type AlarmSeverity = keyof typeof ALARM_LABELS.SEVERITY;
export type AlarmSeverityLabel = typeof ALARM_LABELS.SEVERITY[AlarmSeverity];

// アラームステータスの型定義
export type AlarmStatus = keyof typeof ALARM_LABELS.STATUS;
export type AlarmStatusLabel = typeof ALARM_LABELS.STATUS[AlarmStatus];

// アラームフィールドの型定義
export type AlarmField = keyof typeof ALARM_LABELS.FIELDS;
export type AlarmFieldLabel = typeof ALARM_LABELS.FIELDS[AlarmField];

// アラーム設定の型定義
export type AlarmSetting = keyof typeof ALARM_LABELS.SETTINGS;
export type AlarmSettingLabel = typeof ALARM_LABELS.SETTINGS[AlarmSetting];