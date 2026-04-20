/**
 * メッセージフォーマット関数
 * 
 * アプリケーション全体で使用される各種メッセージの日本語フォーマットを提供します。
 * 成功メッセージ、エラーメッセージ、確認メッセージ、ローディングメッセージを統一された形式で生成します。
 */

export const MESSAGE_FORMATTER = {
  // 成功メッセージ
  SUCCESS_CREATE: (entityName: string) => `${entityName}を作成しました`,
  SUCCESS_UPDATE: (entityName: string) => `${entityName}を更新しました`,
  SUCCESS_DELETE: (entityName: string) => `${entityName}を削除しました`,
  SUCCESS_SAVE: () => '正常に保存されました',
  SUCCESS_IMPORT: (entityName: string) => `${entityName}をインポートしました`,
  SUCCESS_EXPORT: (entityName: string) => `${entityName}をエクスポートしました`,
  SUCCESS_UPLOAD: () => 'ファイルをアップロードしました',
  SUCCESS_DOWNLOAD: () => 'ダウンロードが完了しました',
  
  // エラーメッセージ
  ERROR_FETCH: (entityName: string) => `${entityName}の取得に失敗しました`,
  ERROR_CREATE: (entityName: string) => `${entityName}の作成に失敗しました`,
  ERROR_UPDATE: (entityName: string) => `${entityName}の更新に失敗しました`,
  ERROR_DELETE: (entityName: string) => `${entityName}の削除に失敗しました`,
  ERROR_SAVE: () => '保存に失敗しました',
  ERROR_IMPORT: (entityName: string) => `${entityName}のインポートに失敗しました`,
  ERROR_EXPORT: (entityName: string) => `${entityName}のエクスポートに失敗しました`,
  ERROR_UPLOAD: () => 'ファイルのアップロードに失敗しました',
  ERROR_DOWNLOAD: () => 'ファイルのダウンロードに失敗しました',
  ERROR_NETWORK: () => '接続に問題があります。しばらく待ってから再試行してください',
  ERROR_PERMISSION: () => 'この操作を実行する権限がありません',
  ERROR_NOT_FOUND: (entityName: string) => `${entityName}が見つかりません`,
  ERROR_INVALID_DATA: () => '無効なデータです',
  ERROR_FILE_FORMAT: () => 'ファイル形式が正しくありません',
  ERROR_FILE_SIZE: () => 'ファイルサイズが大きすぎます',
  ERROR_TIMEOUT: () => 'リクエストがタイムアウトしました',
  ERROR_SERVER: () => 'サーバーでエラーが発生しました',
  ERROR_UNKNOWN: () => '予期しないエラーが発生しました',
  
  // 確認メッセージ
  CONFIRM_DELETE: (entityName: string) => 
    `この${entityName}を削除してもよろしいですか？この操作は取り消せません。`,
  CONFIRM_DELETE_MULTIPLE: (count: number, entityName: string) => 
    `選択した${count}件の${entityName}を削除してもよろしいですか？この操作は取り消せません。`,
  CONFIRM_UNSAVED_CHANGES: () => 
    '保存されていない変更があります。このページを離れてもよろしいですか？',
  CONFIRM_OVERWRITE: (fileName: string) => 
    `ファイル「${fileName}」は既に存在します。上書きしてもよろしいですか？`,
  CONFIRM_RESET: () => 
    'フォームの内容をリセットしてもよろしいですか？入力した内容は失われます。',
  CONFIRM_LOGOUT: () => 
    'ログアウトしてもよろしいですか？',
  CONFIRM_CANCEL: () => 
    '編集をキャンセルしてもよろしいですか？変更内容は保存されません。',
  
  // ローディングメッセージ
  LOADING: () => '読み込み中...',
  LOADING_DATA: (entityName: string) => `${entityName}を読み込み中...`,
  PROCESSING: () => '処理中...',
  SAVING: () => '保存中...',
  DELETING: () => '削除中...',
  CREATING: () => '作成中...',
  UPDATING: () => '更新中...',
  UPLOADING: () => 'アップロード中...',
  DOWNLOADING: () => 'ダウンロード中...',
  IMPORTING: () => 'インポート中...',
  EXPORTING: () => 'エクスポート中...',
  CONNECTING: () => '接続中...',
  AUTHENTICATING: () => '認証中...',
  
  // 情報メッセージ
  INFO_NO_DATA: (entityName: string) => `${entityName}がありません`,
  INFO_EMPTY_SEARCH: () => '検索結果がありません',
  INFO_SELECT_ITEM: (entityName: string) => `${entityName}を選択してください`,
  INFO_REQUIRED_FIELDS: () => '必須項目を入力してください',
  INFO_CHANGES_SAVED: () => '変更が保存されました',
  INFO_NO_CHANGES: () => '変更はありません',
  INFO_FILE_SELECTED: (fileName: string) => `ファイル「${fileName}」が選択されました`,
  INFO_ITEMS_SELECTED: (count: number) => `${count}件が選択されています`,
  
  // 警告メッセージ
  WARNING_UNSAVED_CHANGES: () => '保存されていない変更があります',
  WARNING_LARGE_FILE: () => 'ファイルサイズが大きいため、処理に時間がかかる場合があります',
  WARNING_SLOW_CONNECTION: () => '接続が不安定です',
  WARNING_OUTDATED_DATA: () => 'データが古い可能性があります。最新の情報を取得してください',
  WARNING_MAINTENANCE: () => 'システムメンテナンス中です',
  WARNING_DELETE_REFERENCED: (entityName: string) => `この${entityName}は他のデータから参照されています。削除すると関連データに影響する可能性があります`,
} as const;

/**
 * メッセージフォーマット関数の型定義
 */
export type MessageFormatterKey = keyof typeof MESSAGE_FORMATTER;

/**
 * 安全なメッセージフォーマット関数
 * エラーが発生した場合のフォールバック処理を含みます
 * 
 * @param formatter - メッセージフォーマット関数
 * @param params - フォーマット関数のパラメータ
 * @returns フォーマットされたメッセージ
 */
export const formatMessage = (
  formatter: (...args: any[]) => string,
  ...params: any[]
): string => {
  try {
    return formatter(...params);
  } catch (error) {
    console.error('メッセージフォーマットエラー:', error);
    return 'メッセージの生成に失敗しました';
  }
};

/**
 * エンティティ名を含むメッセージの生成
 * 
 * @param messageType - メッセージタイプ
 * @param entityName - エンティティ名
 * @returns フォーマットされたメッセージ
 */
export const createEntityMessage = (
  messageType: 'success_create' | 'success_update' | 'success_delete' | 'error_fetch' | 'error_create' | 'error_update' | 'error_delete' | 'confirm_delete' | 'loading_data' | 'info_no_data',
  entityName: string
): string => {
  const formatters = {
    success_create: MESSAGE_FORMATTER.SUCCESS_CREATE,
    success_update: MESSAGE_FORMATTER.SUCCESS_UPDATE,
    success_delete: MESSAGE_FORMATTER.SUCCESS_DELETE,
    error_fetch: MESSAGE_FORMATTER.ERROR_FETCH,
    error_create: MESSAGE_FORMATTER.ERROR_CREATE,
    error_update: MESSAGE_FORMATTER.ERROR_UPDATE,
    error_delete: MESSAGE_FORMATTER.ERROR_DELETE,
    confirm_delete: MESSAGE_FORMATTER.CONFIRM_DELETE,
    loading_data: MESSAGE_FORMATTER.LOADING_DATA,
    info_no_data: MESSAGE_FORMATTER.INFO_NO_DATA,
  };
  
  return formatMessage(formatters[messageType], entityName);
};

/**
 * 複数削除確認メッセージの生成
 * 
 * @param count - 削除対象の件数
 * @param entityName - エンティティ名
 * @returns フォーマットされた確認メッセージ
 */
export const createMultipleDeleteMessage = (count: number, entityName: string): string => {
  return formatMessage(MESSAGE_FORMATTER.CONFIRM_DELETE_MULTIPLE, count, entityName);
};

/**
 * ファイル関連メッセージの生成
 * 
 * @param messageType - メッセージタイプ
 * @param fileName - ファイル名
 * @returns フォーマットされたメッセージ
 */
export const createFileMessage = (
  messageType: 'confirm_overwrite' | 'info_file_selected',
  fileName: string
): string => {
  const formatters = {
    confirm_overwrite: MESSAGE_FORMATTER.CONFIRM_OVERWRITE,
    info_file_selected: MESSAGE_FORMATTER.INFO_FILE_SELECTED,
  };
  
  return formatMessage(formatters[messageType], fileName);
};

/**
 * 選択件数メッセージの生成
 * 
 * @param count - 選択件数
 * @returns フォーマットされたメッセージ
 */
export const createSelectionMessage = (count: number): string => {
  return formatMessage(MESSAGE_FORMATTER.INFO_ITEMS_SELECTED, count);
};