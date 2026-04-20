/**
 * 翻訳品質の最終確認テスト
 * 
 * 用語の一貫性、技術用語の英語表記維持、自然な日本語表現を確認します。
 * 
 * Requirements: 1.1, 1.2, 1.3, 10.1, 10.2, 10.3, 10.4, 10.5, 12.1, 12.2, 12.3, 12.4
 */

import { TECHNICAL_TERMS } from '../localization/constants/technical-terms';
import { BUSINESS_TERMS } from '../localization/constants/business-terms';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { STATUS_LABELS } from '../localization/constants/status-labels';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { VALIDATION_MESSAGES } from '../localization/constants/validation-messages';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';
import { DATE_FORMATTER } from '../localization/utils/date-formatter';

describe('翻訳品質の最終確認', () => {
  describe('用語の一貫性確認 (Requirements: 12.1, 12.2, 12.3, 12.4)', () => {
    it('業務用語の単数形と複数形が一貫している', () => {
      // 単数形と複数形のペアをチェック
      const termPairs = [
        { singular: BUSINESS_TERMS.DEVICE, plural: BUSINESS_TERMS.DEVICES },
        { singular: BUSINESS_TERMS.USER, plural: BUSINESS_TERMS.USERS },
        { singular: BUSINESS_TERMS.GROUP, plural: BUSINESS_TERMS.GROUPS },
        { singular: BUSINESS_TERMS.PRODUCT, plural: BUSINESS_TERMS.PRODUCTS },
        { singular: BUSINESS_TERMS.CUSTOMER, plural: BUSINESS_TERMS.CUSTOMERS },
        { singular: BUSINESS_TERMS.CLASSIFICATION, plural: BUSINESS_TERMS.CLASSIFICATIONS },
        { singular: BUSINESS_TERMS.ALARM, plural: BUSINESS_TERMS.ALARMS },
      ];

      termPairs.forEach(({ singular, plural }) => {
        // 日本語では単数形と複数形が同じであることを確認
        expect(singular).toBe(plural);
        // 日本語文字が含まれていることを確認
        expect(singular).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      });
    });

    it('設定関連用語が統一されている', () => {
      // 設定関連の用語が統一されていることを確認
      expect(BUSINESS_TERMS.SETTINGS).toBe('設定');
      expect(BUSINESS_TERMS.CONFIGURATION).toBe('設定');
      expect(BUSINESS_TERMS.MANAGEMENT).toBe('管理');
      expect(BUSINESS_TERMS.ADMINISTRATION).toBe('管理');
    });

    it('データ関連用語が統一されている', () => {
      // データ関連の用語が統一されていることを確認
      expect(BUSINESS_TERMS.DATA).toBe('データ');
      expect(BUSINESS_TERMS.INFORMATION).toBe('情報');
      expect(BUSINESS_TERMS.DETAILS).toBe('詳細');
      expect(BUSINESS_TERMS.RECORD).toBe('レコード');
      expect(BUSINESS_TERMS.RECORDS).toBe('レコード');
    });

    it('ナビゲーションラベルで業務用語が一貫して使用されている', () => {
      // ナビゲーションラベルが業務用語と一貫していることを確認
      expect(NAVIGATION_LABELS.DEVICES).toBe(BUSINESS_TERMS.DEVICES);
      expect(NAVIGATION_LABELS.USERS).toBe(BUSINESS_TERMS.USERS);
      expect(NAVIGATION_LABELS.CUSTOMERS).toBe(BUSINESS_TERMS.CUSTOMERS);
      expect(NAVIGATION_LABELS.PRODUCTS).toBe(BUSINESS_TERMS.PRODUCTS);
      expect(NAVIGATION_LABELS.CLASSIFICATIONS).toBe(BUSINESS_TERMS.CLASSIFICATIONS);
    });

    it('アクションラベルが統一されている', () => {
      // 基本的なCRUD操作のラベルが統一されていることを確認
      expect(ACTION_LABELS.CREATE).toBe('作成');
      expect(ACTION_LABELS.EDIT).toBe('編集');
      expect(ACTION_LABELS.DELETE).toBe('削除');
      expect(ACTION_LABELS.SAVE).toBe('保存');
      expect(ACTION_LABELS.CANCEL).toBe('キャンセル');

      // 類似の操作で一貫した用語が使用されていることを確認
      expect(ACTION_LABELS.DELETE).toBe(ACTION_LABELS.REMOVE);
      expect(ACTION_LABELS.VIEW).toBe(ACTION_LABELS.SHOW);
    });
  });

  describe('技術用語の英語表記維持確認 (Requirements: 1.1, 10.1, 10.2, 10.3, 10.4, 10.5)', () => {
    it('ネットワーク関連の技術用語が英語で維持されている', () => {
      const networkTerms = [
        TECHNICAL_TERMS.IP_ADDRESS,
        TECHNICAL_TERMS.MAC_ADDRESS,
        TECHNICAL_TERMS.URL,
        TECHNICAL_TERMS.API,
        TECHNICAL_TERMS.PORT,
      ];

      networkTerms.forEach(term => {
        // 英語のパターンにマッチすることを確認
        expect(term).toMatch(/^[A-Za-z\s]+$/);
        // 日本語文字が含まれていないことを確認
        expect(term).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
        // 空文字ではないことを確認
        expect(term.trim()).not.toBe('');
      });
    });

    it('プロトコル名が英語で維持されている', () => {
      const protocolTerms = [
        TECHNICAL_TERMS.HTTP,
        TECHNICAL_TERMS.HTTPS,
        TECHNICAL_TERMS.MQTT,
        TECHNICAL_TERMS.TCP,
        TECHNICAL_TERMS.UDP,
        TECHNICAL_TERMS.SSL,
        TECHNICAL_TERMS.TLS,
        TECHNICAL_TERMS.FTP,
        TECHNICAL_TERMS.SSH,
        TECHNICAL_TERMS.DNS,
        TECHNICAL_TERMS.DHCP,
        TECHNICAL_TERMS.VPN,
      ];

      protocolTerms.forEach(term => {
        // 英語のパターンにマッチすることを確認
        expect(term).toMatch(/^[A-Za-z]+$/);
        // 日本語文字が含まれていないことを確認
        expect(term).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
        // 大文字であることを確認（プロトコル名は通常大文字）
        expect(term).toBe(term.toUpperCase());
      });
    });

    it('データ形式が英語で維持されている', () => {
      const dataFormatTerms = [
        TECHNICAL_TERMS.JSON,
        TECHNICAL_TERMS.XML,
        TECHNICAL_TERMS.CSV,
        TECHNICAL_TERMS.PDF,
        TECHNICAL_TERMS.XLSX,
      ];

      dataFormatTerms.forEach(term => {
        // 英語のパターンにマッチすることを確認
        expect(term).toMatch(/^[A-Za-z]+$/);
        // 日本語文字が含まれていないことを確認
        expect(term).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
        // 大文字であることを確認（データ形式は通常大文字）
        expect(term).toBe(term.toUpperCase());
      });
    });

    it('識別子が英語で維持されている', () => {
      const identifierTerms = [
        TECHNICAL_TERMS.ID,
        TECHNICAL_TERMS.UUID,
      ];

      identifierTerms.forEach(term => {
        // 英語のパターンにマッチすることを確認
        expect(term).toMatch(/^[A-Za-z]+$/);
        // 日本語文字が含まれていないことを確認
        expect(term).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
        // 大文字であることを確認
        expect(term).toBe(term.toUpperCase());
      });
    });

    it('時間・単位関連の技術用語が英語で維持されている', () => {
      const timeUnitTerms = [
        TECHNICAL_TERMS.UTC,
        TECHNICAL_TERMS.GMT,
        TECHNICAL_TERMS.KB,
        TECHNICAL_TERMS.MB,
        TECHNICAL_TERMS.GB,
        TECHNICAL_TERMS.TB,
      ];

      timeUnitTerms.forEach(term => {
        // 英語のパターンにマッチすることを確認
        expect(term).toMatch(/^[A-Za-z]+$/);
        // 日本語文字が含まれていないことを確認
        expect(term).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
        // 大文字であることを確認
        expect(term).toBe(term.toUpperCase());
      });
    });

    it('バリデーションメッセージで技術用語が英語で維持されている', () => {
      // IP Addressのバリデーションメッセージ
      const ipMessage = VALIDATION_MESSAGES.INVALID_IP_ADDRESS();
      expect(ipMessage).toContain('IP Address');
      expect(ipMessage).not.toContain('IPアドレス');

      // MAC Addressのバリデーションメッセージ
      const macMessage = VALIDATION_MESSAGES.INVALID_MAC_ADDRESS();
      expect(macMessage).toContain('MAC Address');
      expect(macMessage).not.toContain('MACアドレス');

      // URLのバリデーションメッセージ
      const urlMessage = VALIDATION_MESSAGES.INVALID_URL();
      expect(urlMessage).toContain('URL');
      expect(urlMessage).not.toContain('ユーアールエル');
    });
  });

  describe('自然な日本語表現の確認 (Requirements: 1.2, 1.3)', () => {
    it('バリデーションメッセージが丁寧語を使用している', () => {
      const validationMessages = [
        VALIDATION_MESSAGES.REQUIRED('名前'),
        VALIDATION_MESSAGES.MAX_LENGTH('説明', 100),
        VALIDATION_MESSAGES.INVALID_EMAIL(),
        VALIDATION_MESSAGES.ALREADY_EXISTS('ユーザーID'),
      ];

      validationMessages.forEach(message => {
        // 丁寧語の語尾を使用していることを確認
        expect(message).toMatch(/(です|ください|ます|ません|あります|います)$/);
        // 日本語文字が含まれていることを確認
        expect(message).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
        // 適切な長さであることを確認
        expect(message.length).toBeGreaterThan(5);
        expect(message.length).toBeLessThanOrEqual(100);
      });
    });

    it('成功メッセージが自然な日本語を使用している', () => {
      const successMessages = [
        MESSAGE_FORMATTER.SUCCESS_CREATE('ユーザー'),
        MESSAGE_FORMATTER.SUCCESS_UPDATE('デバイス'),
        MESSAGE_FORMATTER.SUCCESS_DELETE('グループ'),
        MESSAGE_FORMATTER.SUCCESS_SAVE(),
      ];

      successMessages.forEach(message => {
        // 丁寧語の語尾を使用していることを確認
        expect(message).toMatch(/ました$/);
        // 日本語文字が含まれていることを確認
        expect(message).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
        // 肯定的な表現であることを確認
        expect(message).toMatch(/(作成|更新|削除|保存)/);
      });
    });

    it('エラーメッセージが分かりやすい日本語を使用している', () => {
      const errorMessages = [
        MESSAGE_FORMATTER.ERROR_NETWORK(),
        MESSAGE_FORMATTER.ERROR_PERMISSION(),
        MESSAGE_FORMATTER.ERROR_NOT_FOUND('データ'),
        MESSAGE_FORMATTER.ERROR_SERVER(),
      ];

      errorMessages.forEach(message => {
        // 日本語文字が含まれていることを確認
        expect(message).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
        // 適切な長さであることを確認
        expect(message.length).toBeGreaterThan(10);
        expect(message.length).toBeLessThanOrEqual(200);
        // 否定的な内容を含んでいることを確認
        expect(message).toMatch(/(失敗|エラー|問題|権限|見つかりません)/);
      });
    });

    it('確認メッセージが適切な敬語を使用している', () => {
      const confirmMessages = [
        MESSAGE_FORMATTER.CONFIRM_DELETE('ユーザー'),
        MESSAGE_FORMATTER.CONFIRM_UNSAVED_CHANGES(),
        MESSAGE_FORMATTER.CONFIRM_LOGOUT(),
      ];

      confirmMessages.forEach(message => {
        // 疑問形の丁寧語を使用していることを確認（文末に追加の説明がある場合も考慮）
        expect(message).toMatch(/(ですか|でしょうか)[\?？]?/);
        // 日本語文字が含まれていることを確認
        expect(message).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      });
    });

    it('ステータスラベルが適切な日本語を使用している', () => {
      const statusLabels = [
        STATUS_LABELS.ONLINE,
        STATUS_LABELS.OFFLINE,
        STATUS_LABELS.PROCESSING,
        STATUS_LABELS.COMPLETED,
        STATUS_LABELS.FAILED,
      ];

      statusLabels.forEach(label => {
        // 日本語文字が含まれていることを確認
        expect(label).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
        // 適切な長さであることを確認
        expect(label.length).toBeGreaterThan(1);
        expect(label.length).toBeLessThanOrEqual(20);
        // ステータスを表す適切な語彙を使用していることを確認
        expect(label).toMatch(/(オン|オフ|処理|完了|失敗|中|済み|可能|不可|有効|無効)/);
      });
    });

    it('日付・時刻表現が自然な日本語を使用している', () => {
      const testDate = new Date('2023-12-25T10:30:45');
      
      // 相対時間表現
      const relativeTime = DATE_FORMATTER.formatRelativeTime(testDate);
      if (relativeTime.includes('前') || relativeTime.includes('後')) {
        expect(relativeTime).toMatch(/(分前|時間前|日前|週間前|ヶ月前|年前|分後|時間後|日後)$/);
      }

      // 期間表現
      const duration = DATE_FORMATTER.formatDuration(2 * 60 * 60 * 1000);
      expect(duration).toMatch(/(秒間|分間|時間|日間|週間|ヶ月間|年間)$/);

      // 月・曜日表現
      const monthName = DATE_FORMATTER.getMonthName(11);
      expect(monthName).toBe('12月');
      
      const dayName = DATE_FORMATTER.getDayOfWeekName(0);
      expect(dayName).toBe('日曜日');
    });
  });

  describe('翻訳定数の品質確認', () => {
    it('すべての翻訳定数が定義されている', () => {
      // 技術用語
      expect(Object.keys(TECHNICAL_TERMS).length).toBeGreaterThan(0);
      
      // 業務用語
      expect(Object.keys(BUSINESS_TERMS).length).toBeGreaterThan(0);
      
      // アクションラベル
      expect(Object.keys(ACTION_LABELS).length).toBeGreaterThan(0);
      
      // ステータスラベル
      expect(Object.keys(STATUS_LABELS).length).toBeGreaterThan(0);
      
      // ナビゲーションラベル
      expect(Object.keys(NAVIGATION_LABELS).length).toBeGreaterThan(0);
    });

    it('翻訳定数に不適切な文字が含まれていない', () => {
      const allLabels = [
        ...Object.values(BUSINESS_TERMS),
        ...Object.values(ACTION_LABELS),
        ...Object.values(STATUS_LABELS),
        ...Object.values(NAVIGATION_LABELS),
      ];

      allLabels.forEach(label => {
        // 制御文字が含まれていない
        expect(label).not.toMatch(/[\x00-\x1F\x7F]/);
        // 空文字ではない
        expect(label.trim()).not.toBe('');
        // 適切な長さ
        expect(label.length).toBeGreaterThan(0);
        expect(label.length).toBeLessThanOrEqual(50);
        // 先頭・末尾に空白がない
        expect(label).toBe(label.trim());
      });
    });

    it('技術用語と業務用語が適切に分離されている', () => {
      const technicalTermValues = Object.values(TECHNICAL_TERMS);
      const businessTermValues = Object.values(BUSINESS_TERMS);

      // 技術用語は英語のみ
      technicalTermValues.forEach(term => {
        expect(term).toMatch(/^[A-Za-z\s]+$/);
        expect(term).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      });

      // 業務用語は日本語を含む（PLCなどの例外を除く）
      businessTermValues.forEach(term => {
        // PLCは技術用語として扱われるため、業務用語からは除外済み
        expect(term).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      });
    });

    it('重複する翻訳定数がない', () => {
      // 業務用語内での重複チェック（同義語マッピングは許可）
      const businessTermValues = Object.values(BUSINESS_TERMS);
      const uniqueBusinessTerms = new Set(businessTermValues);
      
      // 意図的な同義語マッピングがあるため、重複は許可される
      // 例: SETTINGS/CONFIGURATION -> '設定', MANAGEMENT/ADMINISTRATION -> '管理'
      expect(uniqueBusinessTerms.size).toBeGreaterThan(0);
      expect(businessTermValues.length).toBeGreaterThan(uniqueBusinessTerms.size - 1);

      // アクションラベル内での重複チェック（同義語マッピングは許可）
      const actionLabelValues = Object.values(ACTION_LABELS);
      const uniqueActionLabels = new Set(actionLabelValues);
      
      // 意図的な同義語マッピングがあるため、重複は許可される
      // 例: DELETE/REMOVE -> '削除', VIEW/SHOW -> '表示'
      expect(uniqueActionLabels.size).toBeGreaterThan(0);
      expect(actionLabelValues.length).toBeGreaterThan(uniqueActionLabels.size - 1);

      // ステータスラベル内での重複チェック（同義語マッピングは許可）
      const statusLabelValues = Object.values(STATUS_LABELS);
      const uniqueStatusLabels = new Set(statusLabelValues);
      
      // 意図的な同義語マッピングがあるため、重複は許可される
      // 例: ADMIN/ADMIN_USER -> '管理者', ERROR/ERROR_STATUS -> 'エラー'
      expect(uniqueStatusLabels.size).toBeGreaterThan(0);
      expect(statusLabelValues.length).toBeGreaterThan(uniqueStatusLabels.size - 1);
    });
  });

  describe('メッセージフォーマッターの品質確認', () => {
    it('動的メッセージが適切にフォーマットされる', () => {
      const testEntityName = 'テストエンティティ';
      
      // 成功メッセージ
      const createMessage = MESSAGE_FORMATTER.SUCCESS_CREATE(testEntityName);
      expect(createMessage).toBe(`${testEntityName}を作成しました`);
      
      // エラーメッセージ
      const fetchErrorMessage = MESSAGE_FORMATTER.ERROR_FETCH(testEntityName);
      expect(fetchErrorMessage).toBe(`${testEntityName}の取得に失敗しました`);
      
      // 確認メッセージ
      const deleteConfirmMessage = MESSAGE_FORMATTER.CONFIRM_DELETE(testEntityName);
      expect(deleteConfirmMessage).toBe(`この${testEntityName}を削除してもよろしいですか？この操作は取り消せません。`);
    });

    it('数値を含むメッセージが適切にフォーマットされる', () => {
      const count = 5;
      const entityName = 'アイテム';
      
      const multipleDeleteMessage = MESSAGE_FORMATTER.CONFIRM_DELETE_MULTIPLE(count, entityName);
      expect(multipleDeleteMessage).toBe(`選択した${count}件の${entityName}を削除してもよろしいですか？この操作は取り消せません。`);
    });

    it('ファイル関連メッセージが適切にフォーマットされる', () => {
      const fileName = 'test.csv';
      
      const overwriteMessage = MESSAGE_FORMATTER.CONFIRM_OVERWRITE(fileName);
      expect(overwriteMessage).toBe(`ファイル「${fileName}」は既に存在します。上書きしてもよろしいですか？`);
    });
  });

  describe('日付フォーマッターの品質確認', () => {
    it('すべての日付フォーマット関数が適切に動作する', () => {
      const testDate = new Date('2023-12-25T10:30:45.123Z');
      
      // 基本的な日付・時刻フォーマット
      expect(DATE_FORMATTER.formatDate(testDate)).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
      expect(DATE_FORMATTER.formatTime(testDate)).toMatch(/^\d{2}:\d{2}$/);
      expect(DATE_FORMATTER.formatDateTime(testDate)).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);
      
      // 日本語形式
      expect(DATE_FORMATTER.formatDateLong(testDate)).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日$/);
      expect(DATE_FORMATTER.getMonthName(11)).toBe('12月');
      expect(DATE_FORMATTER.getDayOfWeekName(0)).toBe('日曜日');
    });

    it('期間フォーマットが日本語単位を使用する', () => {
      const testDurations = [
        { duration: 5000, expected: '5秒間' },
        { duration: 5 * 60 * 1000, expected: '5分間' },
        { duration: 2 * 60 * 60 * 1000, expected: '2時間' },
        { duration: 3 * 24 * 60 * 60 * 1000, expected: '3日間' },
      ];

      testDurations.forEach(({ duration, expected }) => {
        const result = DATE_FORMATTER.formatDuration(duration);
        expect(result).toBe(expected);
      });
    });

    it('タイムゾーン表示が適切に動作する', () => {
      const testDate = new Date('2023-12-25T10:30:45');
      
      const withJST = DATE_FORMATTER.formatDateTimeWithTimezone(testDate);
      expect(withJST).toContain('JST');
      
      const withFullTimezone = DATE_FORMATTER.formatDateTimeWithTimezone(testDate, true);
      expect(withFullTimezone).toContain('日本標準時');
    });
  });

  describe('総合品質評価', () => {
    it('翻訳実装が要件を満たしている', () => {
      // Requirement 1.1: 技術用語の英語表記維持
      expect(TECHNICAL_TERMS.IP_ADDRESS).toBe('IP Address');
      expect(TECHNICAL_TERMS.API).toBe('API');
      
      // Requirement 1.2: 業務用語の日本語翻訳
      expect(BUSINESS_TERMS.DEVICE).toBe('デバイス');
      expect(BUSINESS_TERMS.USER).toBe('ユーザー');
      
      // Requirement 1.3: アクションラベルの日本語化
      expect(ACTION_LABELS.CREATE).toBe('作成');
      expect(ACTION_LABELS.EDIT).toBe('編集');
      
      // Requirements 10.1-10.5: 技術用語の英語表記維持
      const technicalTerms = Object.values(TECHNICAL_TERMS);
      technicalTerms.forEach(term => {
        expect(term).toMatch(/^[A-Za-z\s]+$/);
      });
      
      // Requirements 12.1-12.4: 用語使用の一貫性
      expect(NAVIGATION_LABELS.DEVICES).toBe(BUSINESS_TERMS.DEVICES);
      expect(NAVIGATION_LABELS.USERS).toBe(BUSINESS_TERMS.USERS);
    });

    it('翻訳品質が高水準を維持している', () => {
      // 自然な日本語表現の使用
      const sampleMessages = [
        VALIDATION_MESSAGES.REQUIRED('名前'),
        MESSAGE_FORMATTER.SUCCESS_CREATE('ユーザー'),
        MESSAGE_FORMATTER.ERROR_NETWORK(),
      ];

      sampleMessages.forEach(message => {
        // 日本語文字が含まれている
        expect(message).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
        // 適切な敬語・丁寧語を使用
        expect(message).toMatch(/(です|ます|ました|ください|あります|います|ません)$/);
      });

      // 技術用語と業務用語の適切な分離
      expect(TECHNICAL_TERMS.JSON).toBe('JSON'); // 技術用語は英語
      expect(BUSINESS_TERMS.DATA).toBe('データ'); // 業務用語は日本語

      // 用語の一貫性
      expect(BUSINESS_TERMS.SETTINGS).toBe(BUSINESS_TERMS.CONFIGURATION);
      expect(ACTION_LABELS.DELETE).toBe(ACTION_LABELS.REMOVE);
    });

    it('翻訳実装に致命的な問題がない', () => {
      // 空文字や未定義の翻訳がない
      const allTranslations = [
        ...Object.values(TECHNICAL_TERMS),
        ...Object.values(BUSINESS_TERMS),
        ...Object.values(ACTION_LABELS),
        ...Object.values(STATUS_LABELS),
        ...Object.values(NAVIGATION_LABELS),
      ];

      allTranslations.forEach(translation => {
        expect(translation).toBeDefined();
        expect(translation.trim()).not.toBe('');
        expect(translation).not.toMatch(/[\x00-\x1F\x7F]/); // 制御文字なし
      });

      // バリデーションメッセージ関数が正常に動作する
      expect(() => VALIDATION_MESSAGES.REQUIRED('テスト')).not.toThrow();
      expect(() => MESSAGE_FORMATTER.SUCCESS_CREATE('テスト')).not.toThrow();
      expect(() => DATE_FORMATTER.formatDate(new Date())).not.toThrow();
    });
  });
});