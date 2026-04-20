/**
 * バリデーションメッセージの使用例テスト
 * 
 * 実際のフォームバリデーションでの使用パターンをテストします。
 */

import { 
  VALIDATION_MESSAGES, 
  getValidationMessage, 
  COMMON_VALIDATION_PRESETS 
} from '../validation-messages';

describe('Validation Messages Usage Examples', () => {
  describe('フォームバリデーションでの使用例', () => {
    it('should work with user form validation', () => {
      // ユーザーフォームのバリデーション例
      const userFormErrors = {
        name: VALIDATION_MESSAGES.REQUIRED('名前'),
        email: VALIDATION_MESSAGES.INVALID_EMAIL(),
        password: VALIDATION_MESSAGES.MIN_LENGTH('パスワード', 8),
        confirmPassword: VALIDATION_MESSAGES.CUSTOM_ERROR('パスワードが一致しません'),
      };

      expect(userFormErrors.name).toBe('名前は必須です');
      expect(userFormErrors.email).toBe('正しいメールアドレスを入力してください');
      expect(userFormErrors.password).toBe('パスワードは8文字以上で入力してください');
      expect(userFormErrors.confirmPassword).toBe('パスワードが一致しません');
    });

    it('should work with device form validation', () => {
      // デバイスフォームのバリデーション例
      const deviceFormErrors = {
        deviceName: COMMON_VALIDATION_PRESETS.DEVICE_NAME_REQUIRED(),
        ipAddress: COMMON_VALIDATION_PRESETS.IP_ADDRESS_INVALID(),
        port: COMMON_VALIDATION_PRESETS.PORT_INVALID_RANGE(),
        description: VALIDATION_MESSAGES.MAX_LENGTH('説明', 200),
      };

      expect(deviceFormErrors.deviceName).toBe('デバイス名は必須です');
      expect(deviceFormErrors.ipAddress).toBe('正しいIP Addressを入力してください');
      expect(deviceFormErrors.port).toBe('1から65535の範囲で入力してください');
      expect(deviceFormErrors.description).toBe('説明は200文字以内で入力してください');
    });
  });

  describe('動的バリデーションメッセージ生成', () => {
    it('should generate messages dynamically using getValidationMessage', () => {
      // 動的にメッセージを生成
      const fieldName = 'ユーザーID';
      const maxLength = 20;

      const requiredMessage = getValidationMessage('REQUIRED', fieldName);
      const lengthMessage = getValidationMessage('MAX_LENGTH', fieldName, maxLength);
      const duplicateMessage = getValidationMessage('ALREADY_EXISTS', fieldName);

      expect(requiredMessage).toBe('ユーザーIDは必須です');
      expect(lengthMessage).toBe('ユーザーIDは20文字以内で入力してください');
      expect(duplicateMessage).toBe('このユーザーIDは既に使用されています');
    });

    it('should handle different field types', () => {
      // 異なるフィールドタイプでのテスト
      const fields = [
        { name: 'メールアドレス', type: 'email' },
        { name: 'パスワード', type: 'password' },
        { name: 'デバイス名', type: 'text' },
        { name: 'ポート番号', type: 'number' },
      ];

      fields.forEach(field => {
        const message = VALIDATION_MESSAGES.REQUIRED(field.name);
        expect(message).toBe(`${field.name}は必須です`);
        expect(message).toMatch(/は必須です$/);
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle network errors gracefully', () => {
      const networkError = VALIDATION_MESSAGES.NETWORK_ERROR();
      const serverError = VALIDATION_MESSAGES.SERVER_ERROR();
      const unknownError = VALIDATION_MESSAGES.UNKNOWN_ERROR();

      expect(networkError).toBe('ネットワークエラーが発生しました');
      expect(serverError).toBe('サーバーエラーが発生しました');
      expect(unknownError).toBe('予期しないエラーが発生しました');
    });

    it('should handle permission errors', () => {
      const permissionDenied = VALIDATION_MESSAGES.PERMISSION_DENIED();
      const accessDenied = VALIDATION_MESSAGES.ACCESS_DENIED();

      expect(permissionDenied).toBe('この操作を実行する権限がありません');
      expect(accessDenied).toBe('アクセスが拒否されました');
    });
  });

  describe('ファイル関連バリデーション', () => {
    it('should handle file validation messages', () => {
      const fileRequired = VALIDATION_MESSAGES.FILE_REQUIRED();
      const invalidFileType = VALIDATION_MESSAGES.INVALID_FILE_TYPE('PDF, JPEG, PNG');
      const fileTooLarge = VALIDATION_MESSAGES.FILE_SIZE_TOO_LARGE('10MB');

      expect(fileRequired).toBe('ファイルを選択してください');
      expect(invalidFileType).toBe('許可されているファイル形式はPDF, JPEG, PNGです');
      expect(fileTooLarge).toBe('ファイルサイズは10MB以下にしてください');
    });
  });

  describe('日付・時刻バリデーション', () => {
    it('should handle date validation messages', () => {
      const invalidDate = VALIDATION_MESSAGES.INVALID_DATE();
      const invalidTime = VALIDATION_MESSAGES.INVALID_TIME();
      const dateRange = VALIDATION_MESSAGES.INVALID_DATE_RANGE('開始日', '終了日');
      const futureDate = VALIDATION_MESSAGES.FUTURE_DATE_REQUIRED('予約日');

      expect(invalidDate).toBe('正しい日付を入力してください');
      expect(invalidTime).toBe('正しい時刻を入力してください');
      expect(dateRange).toBe('終了日は開始日より後の日付を入力してください');
      expect(futureDate).toBe('予約日は未来の日付を入力してください');
    });
  });

  describe('選択関連バリデーション', () => {
    it('should handle selection validation messages', () => {
      const selectionRequired = VALIDATION_MESSAGES.SELECTION_REQUIRED('カテゴリ');
      const minSelections = VALIDATION_MESSAGES.MIN_SELECTIONS('オプション', 2);
      const maxSelections = VALIDATION_MESSAGES.MAX_SELECTIONS('タグ', 5);

      expect(selectionRequired).toBe('カテゴリを選択してください');
      expect(minSelections).toBe('オプションを2個以上選択してください');
      expect(maxSelections).toBe('タグは5個まで選択できます');
    });
  });
});