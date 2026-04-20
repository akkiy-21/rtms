/**
 * 顧客関連翻訳定数
 * 
 * 顧客管理機能で使用される翻訳定数を定義します。
 * 顧客フィールド、メッセージ、アクションなどの一貫した日本語表示を提供します。
 * 
 * Requirements: 1.2
 */

export const CUSTOMER_LABELS = {
  // 顧客基本情報
  CUSTOMER: '顧客',
  CUSTOMERS: '顧客',
  CUSTOMER_NAME: '顧客名',
  CUSTOMER_ID: '顧客ID',
  
  // フィールドラベル
  FIELDS: {
    ID: 'ID',
    NAME: '顧客名',
    CUSTOMER_NAME: '顧客名',
    CREATED_AT: '作成日時',
    UPDATED_AT: '更新日時',
    DESCRIPTION: '説明',
    CONTACT_PERSON: '担当者',
    EMAIL: 'メールアドレス',
    PHONE: '電話番号',
    ADDRESS: '住所',
    POSTAL_CODE: '郵便番号',
    COUNTRY: '国',
    REGION: '地域',
    INDUSTRY: '業界',
    COMPANY_SIZE: '会社規模',
    WEBSITE: 'ウェブサイト',
    TAX_ID: '税務ID',
    REGISTRATION_NUMBER: '登録番号',
  },
  
  // プレースホルダー
  PLACEHOLDERS: {
    NAME: '顧客名を入力',
    CUSTOMER_NAME: '顧客名を入力',
    DESCRIPTION: '顧客の説明を入力',
    CONTACT_PERSON: '担当者名を入力',
    EMAIL: 'メールアドレスを入力',
    PHONE: '電話番号を入力',
    ADDRESS: '住所を入力',
    POSTAL_CODE: '郵便番号を入力',
    COUNTRY: '国を入力',
    REGION: '地域を入力',
    INDUSTRY: '業界を入力',
    COMPANY_SIZE: '会社規模を入力',
    WEBSITE: 'ウェブサイトURLを入力',
    TAX_ID: '税務IDを入力',
    REGISTRATION_NUMBER: '登録番号を入力',
    SEARCH: '顧客名で検索...',
    SEARCH_BY_NAME: '顧客名で検索...',
  },
  
  // ヘルプテキスト
  HELP_TEXT: {
    NAME: '顧客を識別しやすい名前を入力してください（100文字以内）',
    DESCRIPTION: '顧客に関する追加情報を入力してください（オプション）',
    CONTACT_PERSON: '主要な連絡先担当者の名前を入力してください',
    EMAIL: '顧客の主要なメールアドレスを入力してください',
    PHONE: '顧客の主要な電話番号を入力してください',
    ADDRESS: '顧客の所在地住所を入力してください',
    WEBSITE: '顧客の公式ウェブサイトURLを入力してください',
    REQUIRED_FIELD: 'このフィールドは必須です',
    OPTIONAL_FIELD: 'このフィールドは任意です',
    UNIQUE_FIELD: 'この値は一意である必要があります',
  },
  
  // 顧客ステータス（将来的な拡張用）
  STATUS: {
    ACTIVE: 'アクティブ',
    INACTIVE: '非アクティブ',
    PENDING: '承認待ち',
    SUSPENDED: '停止中',
    ARCHIVED: 'アーカイブ済み',
    PROSPECT: '見込み客',
    LEAD: 'リード',
    CUSTOMER: '顧客',
    VIP: 'VIP顧客',
    PARTNER: 'パートナー',
  },
  
  // 会社規模
  COMPANY_SIZE: {
    STARTUP: 'スタートアップ',
    SMALL: '小企業',
    MEDIUM: '中企業',
    LARGE: '大企業',
    ENTERPRISE: 'エンタープライズ',
    UNKNOWN: '不明',
  },
  
  // アクション関連
  ACTIONS: {
    CREATE_CUSTOMER: '顧客作成',
    EDIT_CUSTOMER: '顧客編集',
    DELETE_CUSTOMER: '顧客削除',
    VIEW_CUSTOMER: '顧客詳細',
    VIEW_PRODUCTS: '製品一覧',
    ADD_PRODUCT: '製品追加',
    EXPORT_CUSTOMERS: '顧客エクスポート',
    IMPORT_CUSTOMERS: '顧客インポート',
    MERGE_CUSTOMERS: '顧客統合',
    ARCHIVE_CUSTOMER: '顧客アーカイブ',
    RESTORE_CUSTOMER: '顧客復元',
    CONTACT_CUSTOMER: '顧客連絡',
    VIEW_HISTORY: '履歴表示',
    GENERATE_REPORT: 'レポート生成',
  },
  
  // メッセージ
  MESSAGES: {
    CREATE_SUCCESS: '顧客を作成しました',
    UPDATE_SUCCESS: '顧客を更新しました',
    DELETE_SUCCESS: '顧客を削除しました',
    DELETE_CONFIRM: 'この顧客を削除してもよろしいですか？',
    DELETE_WARNING: '顧客を削除すると、関連する製品やデータも削除されます',
    ARCHIVE_SUCCESS: '顧客をアーカイブしました',
    RESTORE_SUCCESS: '顧客を復元しました',
    EXPORT_SUCCESS: '顧客データをエクスポートしました',
    IMPORT_SUCCESS: '顧客データをインポートしました',
    MERGE_SUCCESS: '顧客を統合しました',
    NO_CUSTOMERS_FOUND: '顧客が見つかりません',
    LOADING_CUSTOMERS: '顧客情報を読み込み中...',
    CONTACT_SUCCESS: '顧客に連絡しました',
    REPORT_GENERATED: 'レポートを生成しました',
  },
  
  // テーブル関連
  TABLE: {
    HEADERS: {
      ID: 'ID',
      NAME: '顧客名',
      CONTACT_PERSON: '担当者',
      EMAIL: 'メールアドレス',
      PHONE: '電話番号',
      INDUSTRY: '業界',
      COMPANY_SIZE: '会社規模',
      STATUS: 'ステータス',
      CREATED_AT: '作成日',
      UPDATED_AT: '更新日',
      ACTIONS: 'アクション',
      PRODUCTS_COUNT: '製品数',
      LAST_ORDER: '最終注文',
    },
    SORT_BY: {
      ID: 'IDでソート',
      NAME: '顧客名でソート',
      CONTACT_PERSON: '担当者でソート',
      EMAIL: 'メールアドレスでソート',
      PHONE: '電話番号でソート',
      INDUSTRY: '業界でソート',
      COMPANY_SIZE: '会社規模でソート',
      STATUS: 'ステータスでソート',
      CREATED_AT: '作成日でソート',
      UPDATED_AT: '更新日でソート',
      PRODUCTS_COUNT: '製品数でソート',
      LAST_ORDER: '最終注文でソート',
    },
    EMPTY_STATE: {
      TITLE: '顧客がありません',
      DESCRIPTION: '顧客を作成して開始してください',
      ACTION: '顧客作成',
    },
  },
  
  // ページタイトル
  PAGES: {
    LIST: '顧客管理',
    CREATE: '顧客作成',
    EDIT: '顧客編集',
    DETAIL: '顧客詳細',
    PRODUCTS: '顧客製品',
    HISTORY: '顧客履歴',
    REPORTS: '顧客レポート',
  },
  
  // ナビゲーション
  NAVIGATION: {
    CUSTOMERS: '顧客',
    CUSTOMER_LIST: '顧客一覧',
    CUSTOMER_MANAGEMENT: '顧客管理',
    CUSTOMER_REPORTS: '顧客レポート',
  },
  
  // フィルター関連
  FILTERS: {
    ALL_STATUS: 'すべてのステータス',
    ACTIVE_ONLY: 'アクティブのみ',
    INACTIVE_ONLY: '非アクティブのみ',
    PENDING_ONLY: '承認待ちのみ',
    VIP_ONLY: 'VIP顧客のみ',
    WITH_PRODUCTS: '製品ありのみ',
    WITHOUT_PRODUCTS: '製品なしのみ',
    BY_INDUSTRY: '業界別',
    BY_COMPANY_SIZE: '会社規模別',
    BY_REGION: '地域別',
    RECENT_ORDERS: '最近の注文あり',
  },
  
  // バリデーションメッセージ（顧客固有）
  VALIDATION: {
    NAME_REQUIRED: '顧客名は必須です',
    NAME_MAX_LENGTH: '顧客名は100文字以内で入力してください',
    NAME_EXISTS: 'この顧客名は既に使用されています',
    EMAIL_INVALID: '正しいメールアドレスを入力してください',
    EMAIL_EXISTS: 'このメールアドレスは既に使用されています',
    PHONE_INVALID: '正しい電話番号を入力してください',
    WEBSITE_INVALID: '正しいウェブサイトURLを入力してください',
    POSTAL_CODE_INVALID: '正しい郵便番号を入力してください',
    TAX_ID_INVALID: '正しい税務IDを入力してください',
    REGISTRATION_NUMBER_INVALID: '正しい登録番号を入力してください',
    CONTACT_PERSON_MAX_LENGTH: '担当者名は100文字以内で入力してください',
    DESCRIPTION_MAX_LENGTH: '説明は500文字以内で入力してください',
    ADDRESS_MAX_LENGTH: '住所は200文字以内で入力してください',
  },
  
  // 統計・サマリー
  STATISTICS: {
    TOTAL_CUSTOMERS: '総顧客数',
    ACTIVE_CUSTOMERS: 'アクティブ顧客数',
    NEW_CUSTOMERS_THIS_MONTH: '今月の新規顧客',
    VIP_CUSTOMERS: 'VIP顧客数',
    CUSTOMERS_WITH_PRODUCTS: '製品保有顧客数',
    AVERAGE_PRODUCTS_PER_CUSTOMER: '顧客あたり平均製品数',
    TOP_CUSTOMERS_BY_PRODUCTS: '製品数上位顧客',
    CUSTOMERS_BY_INDUSTRY: '業界別顧客分布',
    CUSTOMERS_BY_REGION: '地域別顧客分布',
    CUSTOMER_GROWTH_RATE: '顧客増加率',
  },
  
  // レポート関連
  REPORTS: {
    CUSTOMER_LIST: '顧客一覧レポート',
    CUSTOMER_SUMMARY: '顧客サマリーレポート',
    CUSTOMER_PRODUCTS: '顧客製品レポート',
    CUSTOMER_ACTIVITY: '顧客活動レポート',
    CUSTOMER_GROWTH: '顧客成長レポート',
    INDUSTRY_ANALYSIS: '業界分析レポート',
    REGIONAL_ANALYSIS: '地域分析レポート',
    VIP_CUSTOMERS: 'VIP顧客レポート',
    INACTIVE_CUSTOMERS: '非アクティブ顧客レポート',
    CUSTOMER_RETENTION: '顧客維持レポート',
  },
  
  // エラーメッセージ
  ERRORS: {
    FETCH_FAILED: '顧客情報の取得に失敗しました',
    CREATE_FAILED: '顧客の作成に失敗しました',
    UPDATE_FAILED: '顧客の更新に失敗しました',
    DELETE_FAILED: '顧客の削除に失敗しました',
    ARCHIVE_FAILED: '顧客のアーカイブに失敗しました',
    RESTORE_FAILED: '顧客の復元に失敗しました',
    EXPORT_FAILED: '顧客データのエクスポートに失敗しました',
    IMPORT_FAILED: '顧客データのインポートに失敗しました',
    MERGE_FAILED: '顧客の統合に失敗しました',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
    PERMISSION_DENIED: 'この操作を実行する権限がありません',
    CUSTOMER_NOT_FOUND: '顧客が見つかりません',
    INVALID_DATA: '無効なデータです',
    DUPLICATE_CUSTOMER: '重複する顧客です',
    CUSTOMER_HAS_PRODUCTS: 'この顧客には製品が関連付けられているため削除できません',
  },
} as const;

// 顧客ステータスの型定義
export type CustomerStatus = keyof typeof CUSTOMER_LABELS.STATUS;
export type CustomerStatusLabel = typeof CUSTOMER_LABELS.STATUS[CustomerStatus];

// 会社規模の型定義
export type CustomerCompanySize = keyof typeof CUSTOMER_LABELS.COMPANY_SIZE;
export type CustomerCompanySizeLabel = typeof CUSTOMER_LABELS.COMPANY_SIZE[CustomerCompanySize];

// 顧客フィールドの型定義
export type CustomerField = keyof typeof CUSTOMER_LABELS.FIELDS;
export type CustomerFieldLabel = typeof CUSTOMER_LABELS.FIELDS[CustomerField];