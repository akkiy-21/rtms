/**
 * バリデーションメッセージテンプレート
 * 
 * フォームバリデーションエラーメッセージの日本語テンプレートです。
 * 統一されたエラーメッセージにより、ユーザーが問題を理解し適切に修正できます。
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

export const VALIDATION_MESSAGES = {
  // 必須フィールドエラー (Requirement 5.1)
  REQUIRED: (fieldName: string) => `${fieldName}は必須です`,
  
  // 文字数制限エラー (Requirement 5.2)
  MAX_LENGTH: (fieldName: string, maxLength: number) => 
    `${fieldName}は${maxLength}文字以内で入力してください`,
  MIN_LENGTH: (fieldName: string, minLength: number) => 
    `${fieldName}は${minLength}文字以上で入力してください`,
  EXACT_LENGTH: (fieldName: string, length: number) => 
    `${fieldName}は${length}文字で入力してください`,
  
  // フォーマットエラー (Requirement 5.3)
  INVALID_FORMAT: (formatName: string) => 
    `正しい${formatName}を入力してください`,
  INVALID_EMAIL: () => '正しいメールアドレスを入力してください',
  INVALID_URL: () => '正しいURLを入力してください',
  INVALID_IP_ADDRESS: () => '正しいIP Addressを入力してください',
  INVALID_MAC_ADDRESS: () => '正しいMAC Addressを入力してください',
  INVALID_PHONE_NUMBER: () => '正しい電話番号を入力してください',
  INVALID_DATE: () => '正しい日付を入力してください',
  INVALID_TIME: () => '正しい時刻を入力してください',
  INVALID_NUMBER: () => '正しい数値を入力してください',
  INVALID_INTEGER: () => '正しい整数を入力してください',
  INVALID_DECIMAL: () => '正しい小数を入力してください',
  
  // 重複エラー (Requirement 5.4)
  ALREADY_EXISTS: (fieldName: string) => 
    `この${fieldName}は既に使用されています`,
  DUPLICATE_VALUE: (fieldName: string) => 
    `${fieldName}が重複しています`,
  UNIQUE_CONSTRAINT: (fieldName: string) => 
    `${fieldName}は一意である必要があります`,
  
  // 範囲エラー (Requirement 5.2, 5.3)
  INVALID_RANGE: (min: number, max: number) => 
    `${min}から${max}の範囲で入力してください`,
  MIN_VALUE: (fieldName: string, minValue: number) => 
    `${fieldName}は${minValue}以上で入力してください`,
  MAX_VALUE: (fieldName: string, maxValue: number) => 
    `${fieldName}は${maxValue}以下で入力してください`,
  
  // 関連性エラー (Requirement 5.4)
  INVALID_COMBINATION: (field1: string, field2: string) => 
    `${field1}と${field2}の組み合わせが無効です`,
  DEPENDENCY_ERROR: (dependentField: string, requiredField: string) => 
    `${dependentField}を設定するには${requiredField}が必要です`,
  CONFLICT_ERROR: (field1: string, field2: string) => 
    `${field1}と${field2}は同時に設定できません`,
  
  // 日付・時刻関連エラー
  INVALID_DATE_RANGE: (startField: string, endField: string) => 
    `${endField}は${startField}より後の日付を入力してください`,
  FUTURE_DATE_REQUIRED: (fieldName: string) => 
    `${fieldName}は未来の日付を入力してください`,
  PAST_DATE_REQUIRED: (fieldName: string) => 
    `${fieldName}は過去の日付を入力してください`,
  
  // ファイル関連エラー
  INVALID_FILE_TYPE: (allowedTypes: string) => 
    `許可されているファイル形式は${allowedTypes}です`,
  FILE_SIZE_TOO_LARGE: (maxSize: string) => 
    `ファイルサイズは${maxSize}以下にしてください`,
  FILE_REQUIRED: () => 'ファイルを選択してください',
  
  // パスワード関連エラー
  PASSWORD_TOO_WEAK: () => 'パスワードが弱すぎます。英数字と記号を組み合わせてください',
  PASSWORD_MISMATCH: () => 'パスワードが一致しません',
  CURRENT_PASSWORD_INCORRECT: () => '現在のパスワードが正しくありません',
  
  // 選択関連エラー
  SELECTION_REQUIRED: (fieldName: string) => 
    `${fieldName}を選択してください`,
  INVALID_SELECTION: (fieldName: string) => 
    `無効な${fieldName}が選択されています`,
  MIN_SELECTIONS: (fieldName: string, minCount: number) => 
    `${fieldName}を${minCount}個以上選択してください`,
  MAX_SELECTIONS: (fieldName: string, maxCount: number) => 
    `${fieldName}は${maxCount}個まで選択できます`,
  
  // ネットワーク・接続関連エラー
  CONNECTION_TIMEOUT: () => '接続がタイムアウトしました。再試行してください',
  NETWORK_ERROR: () => 'ネットワークエラーが発生しました',
  SERVER_ERROR: () => 'サーバーエラーが発生しました',
  
  // 権限関連エラー
  PERMISSION_DENIED: () => 'この操作を実行する権限がありません',
  ACCESS_DENIED: () => 'アクセスが拒否されました',
  
  // 一般的なエラー
  INVALID_INPUT: () => '入力内容が無効です',
  PROCESSING_ERROR: () => '処理中にエラーが発生しました',
  UNKNOWN_ERROR: () => '予期しないエラーが発生しました',
  
  // カスタムバリデーション用のヘルパー
  CUSTOM_ERROR: (message: string) => message,
} as const;

/**
 * バリデーションメッセージの型定義
 */
export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;

/**
 * バリデーションメッセージ生成関数の型定義
 */
export type ValidationMessageFunction = typeof VALIDATION_MESSAGES[ValidationMessageKey];

/**
 * 安全なバリデーションメッセージ生成関数
 * 
 * エラーハンドリングを含む安全なメッセージ生成を行います。
 * 
 * @param messageKey - メッセージキー
 * @param args - メッセージ生成に必要な引数
 * @returns 生成されたバリデーションメッセージ
 */
export const getValidationMessage = (
  messageKey: ValidationMessageKey,
  ...args: (string | number)[]
): string => {
  try {
    const messageGenerator = VALIDATION_MESSAGES[messageKey];
    if (typeof messageGenerator === 'function') {
      return (messageGenerator as (...params: (string | number)[]) => string)(...args);
    }
    return messageGenerator || '入力エラーが発生しました';
  } catch (error) {
    console.error('Validation message generation error:', error);
    return '入力内容を確認してください';
  }
};

/**
 * よく使用されるバリデーションメッセージのプリセット
 */
export const COMMON_VALIDATION_PRESETS = {
  // ユーザー関連
  USER_ID_REQUIRED: () => VALIDATION_MESSAGES.REQUIRED('ユーザーID'),
  USER_NAME_REQUIRED: () => VALIDATION_MESSAGES.REQUIRED('ユーザー名'),
  EMAIL_REQUIRED: () => VALIDATION_MESSAGES.REQUIRED('メールアドレス'),
  EMAIL_INVALID: () => VALIDATION_MESSAGES.INVALID_EMAIL(),
  PASSWORD_REQUIRED: () => VALIDATION_MESSAGES.REQUIRED('パスワード'),
  
  // デバイス関連
  DEVICE_NAME_REQUIRED: () => VALIDATION_MESSAGES.REQUIRED('デバイス名'),
  DEVICE_ID_REQUIRED: () => VALIDATION_MESSAGES.REQUIRED('デバイスID'),
  IP_ADDRESS_REQUIRED: () => VALIDATION_MESSAGES.REQUIRED('IP Address'),
  IP_ADDRESS_INVALID: () => VALIDATION_MESSAGES.INVALID_IP_ADDRESS(),
  
  // 一般的な名前・ID
  NAME_REQUIRED: () => VALIDATION_MESSAGES.REQUIRED('名前'),
  ID_REQUIRED: () => VALIDATION_MESSAGES.REQUIRED('ID'),
  DESCRIPTION_TOO_LONG: () => VALIDATION_MESSAGES.MAX_LENGTH('説明', 500),
  
  // 数値関連
  PORT_INVALID_RANGE: () => VALIDATION_MESSAGES.INVALID_RANGE(1, 65535),
  POSITIVE_NUMBER_REQUIRED: () => VALIDATION_MESSAGES.MIN_VALUE('値', 1),
} as const;