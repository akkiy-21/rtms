/**
 * ユーザー関連翻訳定数
 * 
 * ユーザー管理機能で使用される翻訳定数を定義します。
 * ユーザーロール、フィールドラベル、ステータスなどの一貫した日本語表示を提供します。
 * 
 * Requirements: 7.1
 */

export const USER_LABELS = {
  // ユーザーロール（コード -> 日本語ラベル）
  ROLES: {
    AD: '管理者',
    CU: '一般ユーザー',
  },
  
  // ユーザーロール（フルネーム）
  ROLE_DESCRIPTIONS: {
    AD: '管理者ユーザー',
    CU: '一般ユーザー',
  },
  
  // フィールドラベル
  FIELDS: {
    ID: '社員ID',
    EMPLOYEE_ID: '社員ID',
    NAME: '名前',
    FULL_NAME: '氏名',
    ROLE: 'ロール',
    USER_ROLE: 'ユーザーロール',
    PASSWORD: 'パスワード',
    CONFIRM_PASSWORD: 'パスワード確認',
    EMAIL: 'メールアドレス',
    PHONE: '電話番号',
    DEPARTMENT: '部署',
    POSITION: '役職',
    STATUS: 'ステータス',
    CREATED_AT: '作成日時',
    UPDATED_AT: '更新日時',
    LAST_LOGIN: '最終ログイン',
  },
  
  // プレースホルダー
  PLACEHOLDERS: {
    ID: '社員IDを入力',
    NAME: '名前を入力',
    ROLE: 'ロールを選択',
    PASSWORD: 'パスワードを入力',
    CONFIRM_PASSWORD: 'パスワードを再入力',
    EMAIL: 'メールアドレスを入力',
    PHONE: '電話番号を入力',
    DEPARTMENT: '部署を入力',
    POSITION: '役職を入力',
    SEARCH: 'ユーザー名で検索...',
  },
  
  // ヘルプテキスト
  HELP_TEXT: {
    ID: '英数字10文字以内で入力してください',
    NAME: '100文字以内で入力してください',
    ROLE: 'ユーザーの権限レベルを選択してください',
    PASSWORD: '初回ログイン時に変更されます',
    PASSWORD_POLICY: '8文字以上の英数字を含むパスワードを設定してください',
    ROLE_PERMISSIONS: {
      AD: '管理機能へのアクセス権限を持ちます',
      CU: 'ダッシュボードとデータダウンロードのみ利用できます',
    },
  },
  
  // ユーザーステータス
  STATUS: {
    ACTIVE: 'アクティブ',
    INACTIVE: '非アクティブ',
    SUSPENDED: '停止中',
    PENDING: '承認待ち',
    LOCKED: 'ロック中',
  },
  
  // アクション関連
  ACTIONS: {
    CREATE_USER: 'ユーザー作成',
    EDIT_USER: 'ユーザー編集',
    DELETE_USER: 'ユーザー削除',
    VIEW_USER: 'ユーザー詳細',
    RESET_PASSWORD: 'パスワードリセット',
    CHANGE_ROLE: 'ロール変更',
    ACTIVATE_USER: 'ユーザー有効化',
    DEACTIVATE_USER: 'ユーザー無効化',
  },
  
  // メッセージ
  MESSAGES: {
    CREATE_SUCCESS: 'ユーザーを作成しました',
    UPDATE_SUCCESS: 'ユーザーを更新しました',
    DELETE_SUCCESS: 'ユーザーを削除しました',
    DELETE_CONFIRM: 'このユーザーを削除してもよろしいですか？',
    PASSWORD_REQUIRED: '作成後に仮パスワードが発行されます',
    ROLE_CHANGED: 'ユーザーロールを変更しました',
    STATUS_CHANGED: 'ユーザーステータスを変更しました',
  },
  
  // テーブル関連
  TABLE: {
    HEADERS: {
      ID: 'ID',
      NAME: '名前',
      ROLE: 'ロール',
      STATUS: 'ステータス',
      CREATED_AT: '作成日',
      LAST_LOGIN: '最終ログイン',
      ACTIONS: 'アクション',
    },
    SORT_BY: {
      ID: 'IDでソート',
      NAME: '名前でソート',
      ROLE: 'ロールでソート',
      STATUS: 'ステータスでソート',
      CREATED_AT: '作成日でソート',
      LAST_LOGIN: '最終ログインでソート',
    },
  },
  
  // ページタイトル
  PAGES: {
    LIST: 'ユーザー管理',
    CREATE: 'ユーザー作成',
    EDIT: 'ユーザー編集',
    DETAIL: 'ユーザー詳細',
  },
  
  // バリデーションメッセージ（ユーザー固有）
  VALIDATION: {
    ID_REQUIRED: '社員IDは必須です',
    ID_MAX_LENGTH: '社員IDは10文字以内で入力してください',
    ID_PATTERN: '社員IDは英数字のみで入力してください',
    NAME_REQUIRED: '名前は必須です',
    NAME_MAX_LENGTH: '名前は100文字以内で入力してください',
    ROLE_REQUIRED: 'ロールを選択してください',
    PASSWORD_REQUIRED_FOR_ADMIN: 'ユーザー作成後に仮パスワードが発行されます',
    EMAIL_INVALID: '正しいメールアドレスを入力してください',
    PHONE_INVALID: '正しい電話番号を入力してください',
  },
} as const;

// ユーザーロールの型定義
export type UserRole = keyof typeof USER_LABELS.ROLES;
export type UserRoleLabel = typeof USER_LABELS.ROLES[UserRole];

// ユーザーステータスの型定義
export type UserStatus = keyof typeof USER_LABELS.STATUS;
export type UserStatusLabel = typeof USER_LABELS.STATUS[UserStatus];

// ユーザーフィールドの型定義
export type UserField = keyof typeof USER_LABELS.FIELDS;
export type UserFieldLabel = typeof USER_LABELS.FIELDS[UserField];