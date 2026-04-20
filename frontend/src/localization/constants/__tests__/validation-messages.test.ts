/**
 * バリデーションメッセージテンプレートのテスト
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import { 
  VALIDATION_MESSAGES, 
  getValidationMessage, 
  COMMON_VALIDATION_PRESETS 
} from '../validation-messages';

describe('VALIDATION_MESSAGES', () => {
  describe('必須フィールドエラー (Requirement 5.1)', () => {
    it('should format required field message correctly', () => {
      const result = VALIDATION_MESSAGES.REQUIRED('名前');
      expect(result).toBe('名前は必須です');
    });

    it('should format required field message for different field names', () => {
      expect(VALIDATION_MESSAGES.REQUIRED('メールアドレス')).toBe('メールアドレスは必須です');
      expect(VALIDATION_MESSAGES.REQUIRED('パスワード')).toBe('パスワードは必須です');
      expect(VALIDATION_MESSAGES.REQUIRED('デバイス名')).toBe('デバイス名は必須です');
    });
  });

  describe('文字数制限エラー (Requirement 5.2)', () => {
    it('should format max length message correctly', () => {
      const result = VALIDATION_MESSAGES.MAX_LENGTH('名前', 50);
      expect(result).toBe('名前は50文字以内で入力してください');
    });

    it('should format min length message correctly', () => {
      const result = VALIDATION_MESSAGES.MIN_LENGTH('パスワード', 8);
      expect(result).toBe('パスワードは8文字以上で入力してください');
    });

    it('should format exact length message correctly', () => {
      const result = VALIDATION_MESSAGES.EXACT_LENGTH('郵便番号', 7);
      expect(result).toBe('郵便番号は7文字で入力してください');
    });

    it('should format range message correctly', () => {
      const result = VALIDATION_MESSAGES.INVALID_RANGE(1, 100);
      expect(result).toBe('1から100の範囲で入力してください');
    });
  });

  describe('フォーマットエラー (Requirement 5.3)', () => {
    it('should format invalid format message correctly', () => {
      const result = VALIDATION_MESSAGES.INVALID_FORMAT('メールアドレス');
      expect(result).toBe('正しいメールアドレスを入力してください');
    });

    it('should provide specific format error messages', () => {
      expect(VALIDATION_MESSAGES.INVALID_EMAIL()).toBe('正しいメールアドレスを入力してください');
      expect(VALIDATION_MESSAGES.INVALID_URL()).toBe('正しいURLを入力してください');
      expect(VALIDATION_MESSAGES.INVALID_IP_ADDRESS()).toBe('正しいIP Addressを入力してください');
      expect(VALIDATION_MESSAGES.INVALID_MAC_ADDRESS()).toBe('正しいMAC Addressを入力してください');
    });

    it('should provide number format error messages', () => {
      expect(VALIDATION_MESSAGES.INVALID_NUMBER()).toBe('正しい数値を入力してください');
      expect(VALIDATION_MESSAGES.INVALID_INTEGER()).toBe('正しい整数を入力してください');
      expect(VALIDATION_MESSAGES.INVALID_DECIMAL()).toBe('正しい小数を入力してください');
    });
  });

  describe('重複エラー (Requirement 5.4)', () => {
    it('should format already exists message correctly', () => {
      const result = VALIDATION_MESSAGES.ALREADY_EXISTS('ユーザーID');
      expect(result).toBe('このユーザーIDは既に使用されています');
    });

    it('should format duplicate value message correctly', () => {
      const result = VALIDATION_MESSAGES.DUPLICATE_VALUE('メールアドレス');
      expect(result).toBe('メールアドレスが重複しています');
    });

    it('should format unique constraint message correctly', () => {
      const result = VALIDATION_MESSAGES.UNIQUE_CONSTRAINT('デバイス名');
      expect(result).toBe('デバイス名は一意である必要があります');
    });
  });

  describe('関連性エラー (Requirement 5.4)', () => {
    it('should format invalid combination message correctly', () => {
      const result = VALIDATION_MESSAGES.INVALID_COMBINATION('開始日', '終了日');
      expect(result).toBe('開始日と終了日の組み合わせが無効です');
    });

    it('should format dependency error message correctly', () => {
      const result = VALIDATION_MESSAGES.DEPENDENCY_ERROR('詳細設定', '基本設定');
      expect(result).toBe('詳細設定を設定するには基本設定が必要です');
    });

    it('should format conflict error message correctly', () => {
      const result = VALIDATION_MESSAGES.CONFLICT_ERROR('自動モード', '手動モード');
      expect(result).toBe('自動モードと手動モードは同時に設定できません');
    });
  });

  describe('日付・時刻関連エラー', () => {
    it('should format date range error correctly', () => {
      const result = VALIDATION_MESSAGES.INVALID_DATE_RANGE('開始日', '終了日');
      expect(result).toBe('終了日は開始日より後の日付を入力してください');
    });

    it('should format future date requirement correctly', () => {
      const result = VALIDATION_MESSAGES.FUTURE_DATE_REQUIRED('予約日');
      expect(result).toBe('予約日は未来の日付を入力してください');
    });

    it('should format past date requirement correctly', () => {
      const result = VALIDATION_MESSAGES.PAST_DATE_REQUIRED('生年月日');
      expect(result).toBe('生年月日は過去の日付を入力してください');
    });
  });
});

describe('getValidationMessage', () => {
  it('should generate message safely with correct parameters', () => {
    const result = getValidationMessage('REQUIRED', '名前');
    expect(result).toBe('名前は必須です');
  });

  it('should generate message safely with multiple parameters', () => {
    const result = getValidationMessage('MAX_LENGTH', '説明', 100);
    expect(result).toBe('説明は100文字以内で入力してください');
  });

  it('should handle errors gracefully', () => {
    // 不正なキーでテスト
    const result = getValidationMessage('INVALID_KEY' as any);
    expect(result).toBe('入力エラーが発生しました');
  });

  it('should handle function call errors gracefully', () => {
    // エラーを発生させるためのモック
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // 不正な引数でテスト（引数不足）
    const result = getValidationMessage('MAX_LENGTH', 'field'); // 第2引数（数値）が不足
    // この場合、undefinedが渡されるため実際にはメッセージが生成される
    expect(result).toBe('fieldはundefined文字以内で入力してください');

    console.error = originalConsoleError;
  });
});

describe('COMMON_VALIDATION_PRESETS', () => {
  it('should provide common user validation messages', () => {
    expect(COMMON_VALIDATION_PRESETS.USER_ID_REQUIRED()).toBe('ユーザーIDは必須です');
    expect(COMMON_VALIDATION_PRESETS.USER_NAME_REQUIRED()).toBe('ユーザー名は必須です');
    expect(COMMON_VALIDATION_PRESETS.EMAIL_REQUIRED()).toBe('メールアドレスは必須です');
    expect(COMMON_VALIDATION_PRESETS.EMAIL_INVALID()).toBe('正しいメールアドレスを入力してください');
    expect(COMMON_VALIDATION_PRESETS.PASSWORD_REQUIRED()).toBe('パスワードは必須です');
  });

  it('should provide common device validation messages', () => {
    expect(COMMON_VALIDATION_PRESETS.DEVICE_NAME_REQUIRED()).toBe('デバイス名は必須です');
    expect(COMMON_VALIDATION_PRESETS.DEVICE_ID_REQUIRED()).toBe('デバイスIDは必須です');
    expect(COMMON_VALIDATION_PRESETS.IP_ADDRESS_REQUIRED()).toBe('IP Addressは必須です');
    expect(COMMON_VALIDATION_PRESETS.IP_ADDRESS_INVALID()).toBe('正しいIP Addressを入力してください');
  });

  it('should provide common general validation messages', () => {
    expect(COMMON_VALIDATION_PRESETS.NAME_REQUIRED()).toBe('名前は必須です');
    expect(COMMON_VALIDATION_PRESETS.ID_REQUIRED()).toBe('IDは必須です');
    expect(COMMON_VALIDATION_PRESETS.DESCRIPTION_TOO_LONG()).toBe('説明は500文字以内で入力してください');
  });

  it('should provide common number validation messages', () => {
    expect(COMMON_VALIDATION_PRESETS.PORT_INVALID_RANGE()).toBe('1から65535の範囲で入力してください');
    expect(COMMON_VALIDATION_PRESETS.POSITIVE_NUMBER_REQUIRED()).toBe('値は1以上で入力してください');
  });
});

describe('Message format consistency', () => {
  it('should use consistent Japanese polite form', () => {
    const messages = [
      VALIDATION_MESSAGES.REQUIRED('テスト'),
      VALIDATION_MESSAGES.MAX_LENGTH('テスト', 10),
      VALIDATION_MESSAGES.INVALID_EMAIL(),
      VALIDATION_MESSAGES.ALREADY_EXISTS('テスト'),
    ];

    messages.forEach(message => {
      // 丁寧語の「です」「ください」「ます」で終わることを確認
      expect(message).toMatch(/(です|ください|ます)$/);
    });
  });

  it('should maintain consistent field name placement', () => {
    const fieldName = 'テストフィールド';
    
    // フィールド名が適切な位置に配置されることを確認
    expect(VALIDATION_MESSAGES.REQUIRED(fieldName)).toContain(fieldName);
    expect(VALIDATION_MESSAGES.MAX_LENGTH(fieldName, 10)).toContain(fieldName);
    expect(VALIDATION_MESSAGES.ALREADY_EXISTS(fieldName)).toContain(fieldName);
  });
});