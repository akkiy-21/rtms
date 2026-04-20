/**
 * ロギング関連翻訳定数
 * 
 * ロギング機能で使用される翻訳定数を定義します。
 * ロギング設定、データ設定、ロギングタイプなどの一貫した日本語表示を提供します。
 * 
 * Requirements: 1.2, 7.3
 */

export const LOGGING_LABELS = {
  // ロギング基本用語
  LOGGING: 'ロギング',
  LOGGING_SETTING: 'ロギング設定',
  LOGGING_SETTINGS: 'ロギング設定',
  LOGGING_DATA_SETTING: 'ロギングデータ設定',
  LOGGING_DATA_SETTINGS: 'ロギングデータ設定',
  DATA_SETTING: 'データ設定',
  DATA_SETTINGS: 'データ設定',
  
  // フィールドラベル
  FIELDS: {
    ID: 'ID',
    NO: 'No',
    LOGGING_NAME: 'ロギング名',
    DESCRIPTION: '説明',
    CLIENT: 'クライアント',
    CLIENT_ID: 'クライアントID',
    ADDRESS_TYPE: 'アドレスタイプ',
    ADDRESS: 'アドレス',
    IS_RISING: '立ち上がりエッジ',
    DATA_NAME: 'データ名',
    ADDRESS_COUNT: 'アドレス数',
    DATA_TYPE: 'データタイプ',
    ACTIONS: 'アクション',
  },
  
  // プレースホルダー
  PLACEHOLDERS: {
    LOGGING_NAME: 'ロギング名を入力してください',
    DESCRIPTION: '説明を入力してください（任意）',
    CLIENT: 'クライアントを選択してください',
    ADDRESS_TYPE: 'アドレスタイプを選択してください',
    ADDRESS: 'アドレスを入力してください',
    DATA_NAME: 'データ名を入力してください',
    DATA_TYPE: 'データタイプを選択してください',
    SEARCH_LOGGING_SETTINGS: 'ロギング設定を検索...',
    SEARCH_BY_LOGGING_NAME: 'ロギング名で検索...',
    SEARCH_BY_DATA_NAME: 'データ名で検索...',
  },
  // データタイプ
  DATA_TYPES: {
    UNSIGNED_SMALLINT: 'UNSIGNED SMALLINT',
    UNSIGNED_INT: 'UNSIGNED INT',
    SMALLINT: 'SMALLINT',
    INT: 'INT',
    REAL: 'REAL',
    DOUBLE: 'DOUBLE',
    ASCII: 'ASCII',
  },
  
  // ヘルプテキスト
  HELP_TEXT: {
    LOGGING_NAME: 'ロギング設定を識別しやすい名前を入力してください',
    DESCRIPTION: 'ロギング設定の詳細な説明を入力してください（任意）',
    CLIENT: 'ロギング対象のクライアントを選択してください',
    ADDRESS_TYPE: 'PLCのアドレスタイプを選択してください',
    ADDRESS: 'PLCのアドレスを入力してください',
    IS_RISING: '立ち上がりエッジでトリガーする場合はオンにしてください',
    DATA_NAME: 'データを識別しやすい名前を入力してください',
    ADDRESS_COUNT: 'データタイプがASCIIの場合のみ変更可能です',
    DATA_TYPE: 'データの型を選択してください',
    ADDRESS_RANGE: 'アドレスは{min}から{max}の間で入力してください',
  },
  
  // アクション関連
  ACTIONS: {
    CREATE_LOGGING_SETTING: 'ロギング設定作成',
    EDIT_LOGGING_SETTING: 'ロギング設定編集',
    DELETE_LOGGING_SETTING: 'ロギング設定削除',
    VIEW_DATA_SETTINGS: 'データ設定表示',
    CREATE_DATA_SETTING: 'データ設定作成',
    EDIT_DATA_SETTING: 'データ設定編集',
    DELETE_DATA_SETTING: 'データ設定削除',
    ADD_NEW_DATA_SETTING: '新しいデータ設定を追加',
    CREATE_NEW_LOGGING_SETTING: '新しいロギング設定を作成',
  },
  
  // メッセージ
  MESSAGES: {
    CREATE_SUCCESS: 'ロギング設定を作成しました',
    UPDATE_SUCCESS: 'ロギング設定を更新しました',
    DELETE_SUCCESS: 'ロギング設定を削除しました',
    DATA_CREATE_SUCCESS: 'データ設定を作成しました',
    DATA_UPDATE_SUCCESS: 'データ設定を更新しました',
    DATA_DELETE_SUCCESS: 'データ設定を削除しました',
    DELETE_CONFIRM: 'このロギング設定を削除してもよろしいですか？',
    DATA_DELETE_CONFIRM: 'このデータ設定を削除してもよろしいですか？',
    DELETE_WARNING: 'この操作は取り消せません',
    NO_LOGGING_SETTINGS_FOUND: 'ロギング設定が見つかりません',
    NO_DATA_SETTINGS_FOUND: 'データ設定が見つかりません',
    LOADING_LOGGING_SETTINGS: 'ロギング設定を読み込み中...',
    LOADING_DATA_SETTINGS: 'データ設定を読み込み中...',
    INVALID_ADDRESS_RANGE: '無効なアドレス範囲です',
    ADDRESS_VALIDATION_ERROR: 'アドレスは{min}から{max}の間で入力してください',
  },
  
  // テーブル関連
  TABLE: {
    HEADERS: {
      NO: 'No',
      LOGGING_NAME: 'ロギング名',
      DESCRIPTION: '説明',
      CLIENT: 'クライアント',
      ADDRESS_TYPE: 'アドレスタイプ',
      ADDRESS: 'アドレス',
      IS_RISING: '立ち上がりエッジ',
      DATA_NAME: 'データ名',
      ADDRESS_COUNT: 'アドレス数',
      DATA_TYPE: 'データタイプ',
      ACTIONS: 'アクション',
    },
    SORT_BY: {
      LOGGING_NAME: 'ロギング名でソート',
      DESCRIPTION: '説明でソート',
      CLIENT: 'クライアントでソート',
      ADDRESS_TYPE: 'アドレスタイプでソート',
      ADDRESS: 'アドレスでソート',
      DATA_NAME: 'データ名でソート',
      ADDRESS_COUNT: 'アドレス数でソート',
      DATA_TYPE: 'データタイプでソート',
    },
    EMPTY_STATE: {
      LOGGING_SETTINGS: {
        TITLE: 'ロギング設定がありません',
        DESCRIPTION: 'ロギング設定を作成して開始してください',
        ACTION: 'ロギング設定作成',
      },
      DATA_SETTINGS: {
        TITLE: 'データ設定がありません',
        DESCRIPTION: 'データ設定を作成して開始してください',
        ACTION: 'データ設定作成',
      },
    },
  },
  
  // ページタイトル
  PAGES: {
    LOGGING_SETTINGS: 'ロギング設定',
    LOGGING_SETTINGS_LIST: 'ロギング設定一覧',
    CREATE_LOGGING_SETTING: 'ロギング設定作成',
    EDIT_LOGGING_SETTING: 'ロギング設定編集',
    DATA_SETTINGS: 'データ設定',
    DATA_SETTINGS_LIST: 'データ設定一覧',
    CREATE_DATA_SETTING: 'データ設定作成',
    EDIT_DATA_SETTING: 'データ設定編集',
  },
  
  // ナビゲーション
  NAVIGATION: {
    LOGGING_SETTINGS: 'ロギング設定',
    DATA_SETTINGS: 'データ設定',
    LOGGING_MANAGEMENT: 'ロギング管理',
  },
  
  // フィルター関連
  FILTERS: {
    ALL_LOGGING_TYPES: 'すべてのロギングタイプ',
    GRAPH_ONLY: 'グラフのみ',
    COUNTER_ONLY: 'カウンターのみ',
    ALL_DATA_TYPES: 'すべてのデータタイプ',
    RISING_EDGE_ONLY: '立ち上がりエッジのみ',
    FALLING_EDGE_ONLY: '立ち下がりエッジのみ',
  },
  
  // バリデーションメッセージ（ロギング固有）
  VALIDATION: {
    LOGGING_NAME_REQUIRED: 'ロギング名は必須です',
    LOGGING_NAME_MAX_LENGTH: 'ロギング名は100文字以内で入力してください',
    CLIENT_REQUIRED: 'クライアントは必須です',
    ADDRESS_TYPE_REQUIRED: 'アドレスタイプは必須です',
    ADDRESS_REQUIRED: 'アドレスは必須です',
    ADDRESS_INVALID: 'アドレスの形式が正しくありません',
    ADDRESS_OUT_OF_RANGE: 'アドレスが範囲外です',
    LOGGING_TYPE_REQUIRED: 'ロギングタイプは必須です',
    DATA_NAME_REQUIRED: 'データ名は必須です',
    DATA_NAME_MAX_LENGTH: 'データ名は100文字以内で入力してください',
    DATA_TYPE_REQUIRED: 'データタイプは必須です',
    ADDRESS_COUNT_REQUIRED: 'アドレス数は必須です',
    ADDRESS_COUNT_POSITIVE: 'アドレス数は正の整数で入力してください',
    ADDRESS_COUNT_MIN: 'アドレス数は1以上で入力してください',
  },
  
  // エラーメッセージ
  ERRORS: {
    FETCH_LOGGING_SETTINGS_FAILED: 'ロギング設定の取得に失敗しました',
    CREATE_LOGGING_SETTING_FAILED: 'ロギング設定の作成に失敗しました',
    UPDATE_LOGGING_SETTING_FAILED: 'ロギング設定の更新に失敗しました',
    DELETE_LOGGING_SETTING_FAILED: 'ロギング設定の削除に失敗しました',
    FETCH_DATA_SETTINGS_FAILED: 'データ設定の取得に失敗しました',
    CREATE_DATA_SETTING_FAILED: 'データ設定の作成に失敗しました',
    UPDATE_DATA_SETTING_FAILED: 'データ設定の更新に失敗しました',
    DELETE_DATA_SETTING_FAILED: 'データ設定の削除に失敗しました',
    FETCH_CLIENTS_FAILED: 'クライアント情報の取得に失敗しました',
    FETCH_PLC_INFO_FAILED: 'PLC情報の取得に失敗しました',
    INVALID_CLIENT: '無効なクライアントです',
    INVALID_ADDRESS_TYPE: '無効なアドレスタイプです',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
    PERMISSION_DENIED: 'この操作を実行する権限がありません',
    LOGGING_SETTING_NOT_FOUND: 'ロギング設定が見つかりません',
    DATA_SETTING_NOT_FOUND: 'データ設定が見つかりません',
  },
  
  // 状態表示
  STATUS: {
    TRUE: 'True',
    FALSE: 'False',
    ENABLED: '有効',
    DISABLED: '無効',
    ACTIVE: 'アクティブ',
    INACTIVE: '非アクティブ',
  },
  
  // 単位
  UNITS: {
    COUNT: '個',
    BYTES: 'バイト',
    WORDS: 'ワード',
    BITS: 'ビット',
  },
  
  // 説明文
  DESCRIPTIONS: {
    LOGGING_SETTINGS_PAGE: 'このデバイスのロギング設定を管理します',
    DATA_SETTINGS_PAGE: 'ロギング: {loggingName} のデータ設定',
    RISING_EDGE_EXPLANATION: '立ち上がりエッジでトリガーする場合はオンにしてください',
    ADDRESS_COUNT_EXPLANATION: 'データタイプがASCIIの場合のみ変更可能です',
    LOGGING_TYPE_EXPLANATION: 'グラフ: 時系列データとして記録、カウンター: カウント値として記録',
  },
} as const;

// データタイプの型定義
export type LoggingDataType = keyof typeof LOGGING_LABELS.DATA_TYPES;
export type LoggingDataTypeLabel = typeof LOGGING_LABELS.DATA_TYPES[LoggingDataType];

// ロギングフィールドの型定義
export type LoggingField = keyof typeof LOGGING_LABELS.FIELDS;
export type LoggingFieldLabel = typeof LOGGING_LABELS.FIELDS[LoggingField];

// ロギングアクションの型定義
export type LoggingAction = keyof typeof LOGGING_LABELS.ACTIONS;
export type LoggingActionLabel = typeof LOGGING_LABELS.ACTIONS[LoggingAction];