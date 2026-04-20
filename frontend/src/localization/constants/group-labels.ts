/**
 * グループ関連翻訳定数
 * 
 * グループ管理機能で使用される翻訳定数を定義します。
 * グループタイプ、フィールドラベル、ステータスなどの一貫した日本語表示を提供します。
 * 
 * Requirements: 1.2
 */

export const GROUP_LABELS = {
  // グループタイプ
  TYPES: {
    DEPARTMENT: '部署',
    TEAM: 'チーム',
    PROJECT: 'プロジェクト',
    ROLE: 'ロール',
    CUSTOM: 'カスタム',
  },
  
  // フィールドラベル
  FIELDS: {
    ID: 'グループID',
    GROUP_ID: 'グループID',
    NAME: 'グループ名',
    GROUP_NAME: 'グループ名',
    DESCRIPTION: '説明',
    TYPE: 'グループタイプ',
    GROUP_TYPE: 'グループタイプ',
    PARENT_GROUP: '親グループ',
    CHILD_GROUPS: '子グループ',
    MEMBERS: 'メンバー',
    MEMBER_COUNT: 'メンバー数',
    PERMISSIONS: '権限',
    STATUS: 'ステータス',
    CREATED_AT: '作成日時',
    UPDATED_AT: '更新日時',
    CREATED_BY: '作成者',
    UPDATED_BY: '更新者',
  },
  
  // プレースホルダー
  PLACEHOLDERS: {
    ID: 'グループIDを入力',
    NAME: 'グループ名を入力',
    DESCRIPTION: 'グループの説明を入力',
    TYPE: 'グループタイプを選択',
    PARENT_GROUP: '親グループを選択',
    SEARCH: 'グループ名で検索...',
    SEARCH_MEMBERS: 'メンバーを検索...',
  },
  
  // ヘルプテキスト
  HELP_TEXT: {
    ID: '英数字20文字以内で入力してください',
    NAME: '100文字以内で入力してください',
    DESCRIPTION: 'グループの目的や役割を説明してください',
    TYPE: 'グループの種類を選択してください',
    PARENT_GROUP: '階層構造を作成する場合は親グループを選択してください',
    PERMISSIONS: 'このグループに付与する権限を設定してください',
    MEMBER_MANAGEMENT: 'グループメンバーの追加・削除を行えます',
  },
  
  // グループステータス
  STATUS: {
    ACTIVE: 'アクティブ',
    INACTIVE: '非アクティブ',
    SUSPENDED: '停止中',
    ARCHIVED: 'アーカイブ済み',
    PENDING: '承認待ち',
  },
  
  // アクション関連
  ACTIONS: {
    CREATE_GROUP: 'グループ作成',
    EDIT_GROUP: 'グループ編集',
    DELETE_GROUP: 'グループ削除',
    VIEW_GROUP: 'グループ詳細',
    MANAGE_MEMBERS: 'メンバー管理',
    ADD_MEMBER: 'メンバー追加',
    REMOVE_MEMBER: 'メンバー削除',
    SET_PERMISSIONS: '権限設定',
    ACTIVATE_GROUP: 'グループ有効化',
    DEACTIVATE_GROUP: 'グループ無効化',
    ARCHIVE_GROUP: 'グループアーカイブ',
    RESTORE_GROUP: 'グループ復元',
  },
  
  // メッセージ
  MESSAGES: {
    CREATE_SUCCESS: 'グループを作成しました',
    UPDATE_SUCCESS: 'グループを更新しました',
    DELETE_SUCCESS: 'グループを削除しました',
    DELETE_CONFIRM: 'このグループを削除してもよろしいですか？',
    DELETE_WARNING: 'グループを削除すると、メンバーの権限設定も削除されます',
    MEMBER_ADDED: 'メンバーを追加しました',
    MEMBER_REMOVED: 'メンバーを削除しました',
    PERMISSIONS_UPDATED: '権限を更新しました',
    STATUS_CHANGED: 'グループステータスを変更しました',
    ARCHIVE_CONFIRM: 'このグループをアーカイブしてもよろしいですか？',
    RESTORE_CONFIRM: 'このグループを復元してもよろしいですか？',
    NO_MEMBERS: 'このグループにはメンバーがいません',
    MEMBER_LIMIT_REACHED: 'メンバー数の上限に達しています',
  },
  
  // テーブル関連
  TABLE: {
    HEADERS: {
      ID: 'ID',
      NAME: 'グループ名',
      TYPE: 'タイプ',
      DESCRIPTION: '説明',
      MEMBER_COUNT: 'メンバー数',
      STATUS: 'ステータス',
      CREATED_AT: '作成日',
      CREATED_BY: '作成者',
      ACTIONS: 'アクション',
    },
    SORT_BY: {
      ID: 'IDでソート',
      NAME: 'グループ名でソート',
      TYPE: 'タイプでソート',
      MEMBER_COUNT: 'メンバー数でソート',
      STATUS: 'ステータスでソート',
      CREATED_AT: '作成日でソート',
      CREATED_BY: '作成者でソート',
    },
  },
  
  // メンバーテーブル関連
  MEMBER_TABLE: {
    HEADERS: {
      USER_ID: 'ユーザーID',
      USER_NAME: 'ユーザー名',
      ROLE: 'ロール',
      JOINED_AT: '参加日',
      STATUS: 'ステータス',
      ACTIONS: 'アクション',
    },
    SORT_BY: {
      USER_ID: 'ユーザーIDでソート',
      USER_NAME: 'ユーザー名でソート',
      ROLE: 'ロールでソート',
      JOINED_AT: '参加日でソート',
      STATUS: 'ステータスでソート',
    },
  },
  
  // ページタイトル
  PAGES: {
    LIST: 'グループ管理',
    CREATE: 'グループ作成',
    EDIT: 'グループ編集',
    DETAIL: 'グループ詳細',
    MEMBERS: 'グループメンバー',
    PERMISSIONS: 'グループ権限',
  },
  
  // ナビゲーション
  NAVIGATION: {
    GROUPS: 'グループ',
    GROUP_LIST: 'グループ一覧',
    GROUP_MANAGEMENT: 'グループ管理',
    MEMBER_MANAGEMENT: 'メンバー管理',
  },
  
  // フィルター関連
  FILTERS: {
    ALL_TYPES: 'すべてのタイプ',
    ALL_STATUS: 'すべてのステータス',
    ACTIVE_ONLY: 'アクティブのみ',
    INACTIVE_ONLY: '非アクティブのみ',
    WITH_MEMBERS: 'メンバーあり',
    WITHOUT_MEMBERS: 'メンバーなし',
  },
  
  // バリデーションメッセージ（グループ固有）
  VALIDATION: {
    ID_REQUIRED: 'グループIDは必須です',
    ID_MAX_LENGTH: 'グループIDは20文字以内で入力してください',
    ID_PATTERN: 'グループIDは英数字とハイフンのみで入力してください',
    ID_ALREADY_EXISTS: 'このグループIDは既に使用されています',
    NAME_REQUIRED: 'グループ名は必須です',
    NAME_MAX_LENGTH: 'グループ名は100文字以内で入力してください',
    NAME_ALREADY_EXISTS: 'このグループ名は既に使用されています',
    TYPE_REQUIRED: 'グループタイプを選択してください',
    DESCRIPTION_MAX_LENGTH: '説明は500文字以内で入力してください',
    PARENT_GROUP_INVALID: '無効な親グループが選択されています',
    CIRCULAR_REFERENCE: '循環参照が発生するため、この親グループは選択できません',
    MEMBER_REQUIRED: 'グループには最低1人のメンバーが必要です',
    MEMBER_ALREADY_EXISTS: 'このユーザーは既にグループのメンバーです',
    MEMBER_NOT_FOUND: '指定されたユーザーが見つかりません',
  },
  
  // 権限関連
  PERMISSIONS: {
    READ: '読み取り',
    WRITE: '書き込み',
    DELETE: '削除',
    ADMIN: '管理者',
    FULL_ACCESS: 'フルアクセス',
    LIMITED_ACCESS: '制限付きアクセス',
    NO_ACCESS: 'アクセス不可',
  },
  
  // 統計・サマリー
  STATISTICS: {
    TOTAL_GROUPS: '総グループ数',
    ACTIVE_GROUPS: 'アクティブグループ数',
    INACTIVE_GROUPS: '非アクティブグループ数',
    TOTAL_MEMBERS: '総メンバー数',
    AVERAGE_MEMBERS: '平均メンバー数',
    LARGEST_GROUP: '最大グループ',
    SMALLEST_GROUP: '最小グループ',
  },
} as const;

// グループタイプの型定義
export type GroupType = keyof typeof GROUP_LABELS.TYPES;
export type GroupTypeLabel = typeof GROUP_LABELS.TYPES[GroupType];

// グループステータスの型定義
export type GroupStatus = keyof typeof GROUP_LABELS.STATUS;
export type GroupStatusLabel = typeof GROUP_LABELS.STATUS[GroupStatus];

// グループフィールドの型定義
export type GroupField = keyof typeof GROUP_LABELS.FIELDS;
export type GroupFieldLabel = typeof GROUP_LABELS.FIELDS[GroupField];

// グループ権限の型定義
export type GroupPermission = keyof typeof GROUP_LABELS.PERMISSIONS;
export type GroupPermissionLabel = typeof GROUP_LABELS.PERMISSIONS[GroupPermission];