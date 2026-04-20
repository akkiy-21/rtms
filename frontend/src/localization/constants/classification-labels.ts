/**
 * 分類関連翻訳定数
 * 
 * 分類管理機能で使用される翻訳定数を定義します。
 * 分類フィールド、グループ、ステータス、メッセージなどの一貫した日本語表示を提供します。
 * 
 * Requirements: 1.2, 7.4
 */

export const CLASSIFICATION_LABELS = {
  // 基本用語
  CLASSIFICATION: '分類',
  CLASSIFICATIONS: '分類',
  CLASSIFICATION_GROUP: '分類グループ',
  CLASSIFICATION_GROUPS: '分類グループ',
  
  // フィールドラベル
  FIELDS: {
    ID: 'ID',
    CLASSIFICATION_ID: '分類ID',
    NAME: '分類名',
    CLASSIFICATION_NAME: '分類名',
    GROUP: 'グループ',
    GROUP_ID: 'グループID',
    GROUP_NAME: 'グループ名',
    DESCRIPTION: '説明',
    STATUS: 'ステータス',
    CREATED_AT: '作成日時',
    UPDATED_AT: '更新日時',
    CREATED_BY: '作成者',
    UPDATED_BY: '更新者',
  },
  
  // プレースホルダー
  PLACEHOLDERS: {
    NAME: '分類名を入力',
    CLASSIFICATION_NAME: '分類名を入力',
    GROUP: '分類グループを選択',
    GROUP_SELECT: '分類グループを選択',
    DESCRIPTION: '分類の説明を入力',
    SEARCH: '分類名で検索...',
    SEARCH_BY_NAME: '分類名で検索...',
    SEARCH_BY_GROUP: 'グループで検索...',
  },
  
  // ヘルプテキスト
  HELP_TEXT: {
    NAME: '分類を識別しやすい名前を入力してください（100文字以内）',
    GROUP: '分類が属するグループを選択してください',
    DESCRIPTION: '分類の目的や用途を説明してください（500文字以内）',
    REQUIRED_FIELD: 'このフィールドは必須です',
    OPTIONAL_FIELD: 'このフィールドは任意です',
    UNIQUE_FIELD: 'この値は一意である必要があります',
  },
  
  // 分類ステータス
  STATUS: {
    ACTIVE: 'アクティブ',
    INACTIVE: '非アクティブ',
    DRAFT: '下書き',
    ARCHIVED: 'アーカイブ済み',
    PENDING: '承認待ち',
    APPROVED: '承認済み',
    REJECTED: '却下',
  },
  
  // 分類タイプ（将来的な拡張用）
  TYPES: {
    PRODUCT: '製品分類',
    CUSTOMER: '顧客分類',
    DEVICE: 'デバイス分類',
    QUALITY: '品質分類',
    PROCESS: 'プロセス分類',
    MATERIAL: '材料分類',
    CUSTOM: 'カスタム分類',
  },
  
  // アクション関連
  ACTIONS: {
    CREATE_CLASSIFICATION: '分類作成',
    EDIT_CLASSIFICATION: '分類編集',
    DELETE_CLASSIFICATION: '分類削除',
    VIEW_CLASSIFICATION: '分類詳細',
    DUPLICATE_CLASSIFICATION: '分類複製',
    ARCHIVE_CLASSIFICATION: '分類アーカイブ',
    RESTORE_CLASSIFICATION: '分類復元',
    APPROVE_CLASSIFICATION: '分類承認',
    REJECT_CLASSIFICATION: '分類却下',
    EXPORT_CLASSIFICATIONS: '分類エクスポート',
    IMPORT_CLASSIFICATIONS: '分類インポート',
    MANAGE_GROUPS: 'グループ管理',
    CREATE_GROUP: 'グループ作成',
    EDIT_GROUP: 'グループ編集',
    DELETE_GROUP: 'グループ削除',
  },
  
  // メッセージ
  MESSAGES: {
    CREATE_SUCCESS: '分類を作成しました',
    UPDATE_SUCCESS: '分類を更新しました',
    DELETE_SUCCESS: '分類を削除しました',
    DELETE_CONFIRM: 'この分類を削除してもよろしいですか？',
    DELETE_WARNING: '分類を削除すると、関連するデータも削除される可能性があります',
    DUPLICATE_SUCCESS: '分類を複製しました',
    ARCHIVE_SUCCESS: '分類をアーカイブしました',
    RESTORE_SUCCESS: '分類を復元しました',
    APPROVE_SUCCESS: '分類を承認しました',
    REJECT_SUCCESS: '分類を却下しました',
    EXPORT_SUCCESS: '分類をエクスポートしました',
    IMPORT_SUCCESS: '分類をインポートしました',
    GROUP_CREATE_SUCCESS: '分類グループを作成しました',
    GROUP_UPDATE_SUCCESS: '分類グループを更新しました',
    GROUP_DELETE_SUCCESS: '分類グループを削除しました',
    GROUP_DELETE_CONFIRM: 'この分類グループを削除してもよろしいですか？',
    GROUP_DELETE_WARNING: 'グループを削除すると、所属する分類も削除されます',
    NO_CLASSIFICATIONS_FOUND: '分類が見つかりません',
    NO_GROUPS_FOUND: '分類グループが見つかりません',
    LOADING_CLASSIFICATIONS: '分類情報を読み込み中...',
    LOADING_GROUPS: '分類グループを読み込み中...',
    CREATING: '作成中...',
    UPDATING: '更新中...',
    DELETING: '削除中...',
    SAVING: '保存中...',
  },
  
  // テーブル関連
  TABLE: {
    HEADERS: {
      ID: 'ID',
      NAME: '分類名',
      GROUP: 'グループ',
      STATUS: 'ステータス',
      DESCRIPTION: '説明',
      CREATED_AT: '作成日',
      CREATED_BY: '作成者',
      UPDATED_AT: '更新日',
      UPDATED_BY: '更新者',
      ACTIONS: 'アクション',
    },
    SORT_BY: {
      ID: 'IDでソート',
      NAME: '分類名でソート',
      GROUP: 'グループでソート',
      STATUS: 'ステータスでソート',
      CREATED_AT: '作成日でソート',
      CREATED_BY: '作成者でソート',
      UPDATED_AT: '更新日でソート',
      UPDATED_BY: '更新者でソート',
    },
    EMPTY_STATE: {
      TITLE: '分類がありません',
      DESCRIPTION: '分類を作成して開始してください',
      ACTION: '分類作成',
    },
  },
  
  // グループテーブル関連
  GROUP_TABLE: {
    HEADERS: {
      ID: 'ID',
      NAME: 'グループ名',
      DESCRIPTION: '説明',
      CLASSIFICATION_COUNT: '分類数',
      STATUS: 'ステータス',
      CREATED_AT: '作成日',
      ACTIONS: 'アクション',
    },
    SORT_BY: {
      ID: 'IDでソート',
      NAME: 'グループ名でソート',
      CLASSIFICATION_COUNT: '分類数でソート',
      STATUS: 'ステータスでソート',
      CREATED_AT: '作成日でソート',
    },
    EMPTY_STATE: {
      TITLE: '分類グループがありません',
      DESCRIPTION: '分類グループを作成して開始してください',
      ACTION: 'グループ作成',
    },
  },
  
  // ページタイトル
  PAGES: {
    LIST: '分類管理',
    CREATE: '分類作成',
    EDIT: '分類編集',
    DETAIL: '分類詳細',
    GROUPS: '分類グループ管理',
    GROUP_CREATE: '分類グループ作成',
    GROUP_EDIT: '分類グループ編集',
    GROUP_DETAIL: '分類グループ詳細',
    IMPORT: '分類インポート',
    EXPORT: '分類エクスポート',
  },
  
  // ページ説明
  PAGE_DESCRIPTIONS: {
    LIST: '分類を管理します',
    CREATE: '新しい分類を作成します',
    EDIT: '分類情報を編集します',
    DETAIL: '分類の詳細情報を表示します',
    GROUPS: '分類グループを管理します',
    GROUP_CREATE: '新しい分類グループを作成します',
    GROUP_EDIT: '分類グループ情報を編集します',
    GROUP_DETAIL: '分類グループの詳細情報を表示します',
    IMPORT: 'CSVファイルから分類をインポートします',
    EXPORT: '分類をCSVファイルにエクスポートします',
  },
  
  // ナビゲーション
  NAVIGATION: {
    CLASSIFICATIONS: '分類',
    CLASSIFICATION_LIST: '分類一覧',
    CLASSIFICATION_MANAGEMENT: '分類管理',
    CLASSIFICATION_GROUPS: '分類グループ',
    GROUP_MANAGEMENT: 'グループ管理',
  },
  
  // フィルター関連
  FILTERS: {
    ALL_GROUPS: 'すべてのグループ',
    ALL_STATUS: 'すべてのステータス',
    ACTIVE_ONLY: 'アクティブのみ',
    INACTIVE_ONLY: '非アクティブのみ',
    DRAFT_ONLY: '下書きのみ',
    APPROVED_ONLY: '承認済みのみ',
    PENDING_ONLY: '承認待ちのみ',
    RECENT: '最近作成',
    ALPHABETICAL: 'アルファベット順',
    BY_GROUP: 'グループ別',
  },
  
  // バリデーションメッセージ（分類固有）
  VALIDATION: {
    NAME_REQUIRED: '分類名は必須です',
    NAME_MAX_LENGTH: '分類名は100文字以内で入力してください',
    NAME_MIN_LENGTH: '分類名は1文字以上で入力してください',
    NAME_ALREADY_EXISTS: 'この分類名は既に使用されています',
    GROUP_REQUIRED: '分類グループを選択してください',
    GROUP_INVALID: '無効な分類グループが選択されています',
    DESCRIPTION_MAX_LENGTH: '説明は500文字以内で入力してください',
    STATUS_REQUIRED: 'ステータスを選択してください',
    GROUP_NAME_REQUIRED: 'グループ名は必須です',
    GROUP_NAME_MAX_LENGTH: 'グループ名は100文字以内で入力してください',
    GROUP_NAME_ALREADY_EXISTS: 'このグループ名は既に使用されています',
    GROUP_HAS_CLASSIFICATIONS: 'このグループには分類が含まれているため削除できません',
  },
  
  // 統計・サマリー
  STATISTICS: {
    TOTAL_CLASSIFICATIONS: '総分類数',
    ACTIVE_CLASSIFICATIONS: 'アクティブ分類数',
    INACTIVE_CLASSIFICATIONS: '非アクティブ分類数',
    DRAFT_CLASSIFICATIONS: '下書き分類数',
    TOTAL_GROUPS: '総グループ数',
    CLASSIFICATIONS_PER_GROUP: 'グループあたりの平均分類数',
    MOST_USED_GROUP: '最も使用されているグループ',
    LEAST_USED_GROUP: '最も使用されていないグループ',
    RECENT_CLASSIFICATIONS: '最近作成された分類',
    PENDING_APPROVALS: '承認待ち分類数',
  },
  
  // インポート・エクスポート関連
  IMPORT_EXPORT: {
    IMPORT_FILE: 'ファイルをインポート',
    EXPORT_FILE: 'ファイルをエクスポート',
    SELECT_FILE: 'ファイルを選択',
    UPLOAD_FILE: 'ファイルをアップロード',
    DOWNLOAD_TEMPLATE: 'テンプレートをダウンロード',
    IMPORT_SUCCESS: 'インポートが完了しました',
    EXPORT_SUCCESS: 'エクスポートが完了しました',
    IMPORT_ERROR: 'インポートに失敗しました',
    EXPORT_ERROR: 'エクスポートに失敗しました',
    INVALID_FILE_FORMAT: 'ファイル形式が無効です',
    FILE_TOO_LARGE: 'ファイルサイズが大きすぎます',
    PROCESSING_FILE: 'ファイルを処理中...',
    VALIDATING_DATA: 'データを検証中...',
    IMPORTING_DATA: 'データをインポート中...',
    EXPORTING_DATA: 'データをエクスポート中...',
  },
  
  // エラーメッセージ
  ERRORS: {
    FETCH_FAILED: '分類情報の取得に失敗しました',
    CREATE_FAILED: '分類の作成に失敗しました',
    UPDATE_FAILED: '分類の更新に失敗しました',
    DELETE_FAILED: '分類の削除に失敗しました',
    GROUP_FETCH_FAILED: '分類グループの取得に失敗しました',
    GROUP_CREATE_FAILED: '分類グループの作成に失敗しました',
    GROUP_UPDATE_FAILED: '分類グループの更新に失敗しました',
    GROUP_DELETE_FAILED: '分類グループの削除に失敗しました',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
    PERMISSION_DENIED: 'この操作を実行する権限がありません',
    CLASSIFICATION_NOT_FOUND: '分類が見つかりません',
    GROUP_NOT_FOUND: '分類グループが見つかりません',
    INVALID_DATA: '無効なデータです',
    TIMEOUT_ERROR: 'タイムアウトが発生しました',
    UNKNOWN_ERROR: '予期しないエラーが発生しました',
  },
  
  // 確認メッセージ
  CONFIRMATIONS: {
    DELETE_CLASSIFICATION: 'この分類を削除してもよろしいですか？この操作は取り消せません。',
    DELETE_GROUP: 'この分類グループを削除してもよろしいですか？所属する分類も削除されます。',
    ARCHIVE_CLASSIFICATION: 'この分類をアーカイブしてもよろしいですか？',
    RESTORE_CLASSIFICATION: 'この分類を復元してもよろしいですか？',
    APPROVE_CLASSIFICATION: 'この分類を承認してもよろしいですか？',
    REJECT_CLASSIFICATION: 'この分類を却下してもよろしいですか？',
    UNSAVED_CHANGES: '保存されていない変更があります。このページを離れてもよろしいですか？',
    IMPORT_OVERWRITE: '既存のデータが上書きされる可能性があります。続行してもよろしいですか？',
  },
} as const;

// 分類ステータスの型定義
export type ClassificationStatus = keyof typeof CLASSIFICATION_LABELS.STATUS;
export type ClassificationStatusLabel = typeof CLASSIFICATION_LABELS.STATUS[ClassificationStatus];

// 分類タイプの型定義
export type ClassificationType = keyof typeof CLASSIFICATION_LABELS.TYPES;
export type ClassificationTypeLabel = typeof CLASSIFICATION_LABELS.TYPES[ClassificationType];

// 分類フィールドの型定義
export type ClassificationField = keyof typeof CLASSIFICATION_LABELS.FIELDS;
export type ClassificationFieldLabel = typeof CLASSIFICATION_LABELS.FIELDS[ClassificationField];

// 分類アクションの型定義
export type ClassificationAction = keyof typeof CLASSIFICATION_LABELS.ACTIONS;
export type ClassificationActionLabel = typeof CLASSIFICATION_LABELS.ACTIONS[ClassificationAction];