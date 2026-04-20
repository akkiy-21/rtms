/**
 * デバイス翻訳定数のテスト
 * 
 * デバイス関連の翻訳定数が正しく定義されているかをテストします。
 */

import { DEVICE_LABELS } from '../device-labels';

describe('DEVICE_LABELS', () => {
  describe('基本構造', () => {
    it('必要なセクションが定義されている', () => {
      expect(DEVICE_LABELS.FIELDS).toBeDefined();
      expect(DEVICE_LABELS.PLACEHOLDERS).toBeDefined();
      expect(DEVICE_LABELS.STATUS).toBeDefined();
      expect(DEVICE_LABELS.ACTIONS).toBeDefined();
      expect(DEVICE_LABELS.MESSAGES).toBeDefined();
      expect(DEVICE_LABELS.TABLE).toBeDefined();
      expect(DEVICE_LABELS.PAGES).toBeDefined();
      expect(DEVICE_LABELS.VALIDATION).toBeDefined();
    });
  });

  describe('フィールドラベル', () => {
    it('主要なフィールドが日本語で定義されている', () => {
      expect(DEVICE_LABELS.FIELDS.NAME).toBe('デバイス名');
      expect(DEVICE_LABELS.FIELDS.MAC_ADDRESS).toBe('MAC Address');
      expect(DEVICE_LABELS.FIELDS.STANDARD_CYCLE_TIME).toBe('標準サイクルタイム');
      expect(DEVICE_LABELS.FIELDS.PLANNED_PRODUCTION_QUANTITY).toBe('計画生産数量');
      expect(DEVICE_LABELS.FIELDS.PLANNED_PRODUCTION_TIME).toBe('計画生産時間');
    });

    it('技術用語は英語表記を維持している', () => {
      expect(DEVICE_LABELS.FIELDS.MAC_ADDRESS).toBe('MAC Address');
      expect(DEVICE_LABELS.FIELDS.ID).toBe('ID');
    });
  });

  describe('ステータスラベル', () => {
    it('デバイスステータスが日本語で定義されている', () => {
      expect(DEVICE_LABELS.STATUS.ONLINE).toBe('オンライン');
      expect(DEVICE_LABELS.STATUS.OFFLINE).toBe('オフライン');
      expect(DEVICE_LABELS.STATUS.ERROR).toBe('エラー');
      expect(DEVICE_LABELS.STATUS.CONNECTING).toBe('接続中');
      expect(DEVICE_LABELS.STATUS.RUNNING).toBe('稼働中');
    });

    it('接続状態が日本語で定義されている', () => {
      expect(DEVICE_LABELS.CONNECTION_STATUS.CONNECTED).toBe('接続済み');
      expect(DEVICE_LABELS.CONNECTION_STATUS.DISCONNECTED).toBe('切断');
      expect(DEVICE_LABELS.CONNECTION_STATUS.CONNECTING).toBe('接続中');
      expect(DEVICE_LABELS.CONNECTION_STATUS.FAILED).toBe('接続失敗');
    });
  });

  describe('プレースホルダー', () => {
    it('適切な日本語プレースホルダーが定義されている', () => {
      expect(DEVICE_LABELS.PLACEHOLDERS.NAME).toBe('デバイス名を入力');
      expect(DEVICE_LABELS.PLACEHOLDERS.MAC_ADDRESS).toBe('XX:XX:XX:XX:XX:XX');
      expect(DEVICE_LABELS.PLACEHOLDERS.SEARCH).toBe('デバイス名で検索...');
    });
  });

  describe('アクションラベル', () => {
    it('アクションが日本語で定義されている', () => {
      expect(DEVICE_LABELS.ACTIONS.CREATE_DEVICE).toBe('デバイス作成');
      expect(DEVICE_LABELS.ACTIONS.EDIT_DEVICE).toBe('デバイス編集');
      expect(DEVICE_LABELS.ACTIONS.DELETE_DEVICE).toBe('デバイス削除');
      expect(DEVICE_LABELS.ACTIONS.DETAIL_SETTINGS).toBe('詳細設定');
    });
  });

  describe('メッセージ', () => {
    it('成功メッセージが日本語で定義されている', () => {
      expect(DEVICE_LABELS.MESSAGES.CREATE_SUCCESS).toBe('デバイスを作成しました');
      expect(DEVICE_LABELS.MESSAGES.UPDATE_SUCCESS).toBe('デバイスを更新しました');
      expect(DEVICE_LABELS.MESSAGES.DELETE_SUCCESS).toBe('デバイスを削除しました');
    });

    it('確認メッセージが日本語で定義されている', () => {
      expect(DEVICE_LABELS.MESSAGES.DELETE_CONFIRM).toBe('このデバイスを削除してもよろしいですか？');
    });
  });

  describe('テーブル関連', () => {
    it('テーブルヘッダーが適切に定義されている', () => {
      expect(DEVICE_LABELS.TABLE.HEADERS.NAME).toBe('デバイス名');
      expect(DEVICE_LABELS.TABLE.HEADERS.MAC_ADDRESS).toBe('MAC Address');
      expect(DEVICE_LABELS.TABLE.HEADERS.STATUS).toBe('ステータス');
      expect(DEVICE_LABELS.TABLE.HEADERS.ACTIONS).toBe('アクション');
    });

    it('ソートラベルが日本語で定義されている', () => {
      expect(DEVICE_LABELS.TABLE.SORT_BY.NAME).toBe('デバイス名でソート');
      expect(DEVICE_LABELS.TABLE.SORT_BY.STATUS).toBe('ステータスでソート');
    });
  });

  describe('ページタイトル', () => {
    it('ページタイトルが日本語で定義されている', () => {
      expect(DEVICE_LABELS.PAGES.LIST).toBe('デバイス管理');
      expect(DEVICE_LABELS.PAGES.CREATE).toBe('デバイス作成');
      expect(DEVICE_LABELS.PAGES.EDIT).toBe('デバイス編集');
      expect(DEVICE_LABELS.PAGES.DETAIL_SETTINGS).toBe('詳細設定');
    });
  });

  describe('バリデーションメッセージ', () => {
    it('バリデーションメッセージが日本語で定義されている', () => {
      expect(DEVICE_LABELS.VALIDATION.MAC_ADDRESS_REQUIRED).toBe('MAC Addressは必須です');
      expect(DEVICE_LABELS.VALIDATION.NAME_REQUIRED).toBe('デバイス名は必須です');
      expect(DEVICE_LABELS.VALIDATION.NAME_MAX_LENGTH).toBe('デバイス名は100文字以内で入力してください');
    });

    it('技術用語を含むバリデーションメッセージで英語表記を維持している', () => {
      expect(DEVICE_LABELS.VALIDATION.MAC_ADDRESS_REQUIRED).toContain('MAC Address');
      expect(DEVICE_LABELS.VALIDATION.MAC_ADDRESS_INVALID).toContain('MAC Address');
    });
  });

  describe('型安全性', () => {
    it('定数オブジェクトが適切に定義されている', () => {
      // TypeScriptの型チェックにより、コンパイル時にreadonlyが保証される
      expect(typeof DEVICE_LABELS).toBe('object');
      expect(DEVICE_LABELS).not.toBeNull();
    });
  });

  describe('一貫性チェック', () => {
    it('デバイス関連の用語が一貫している', () => {
      expect(DEVICE_LABELS.DEVICE).toBe('デバイス');
      expect(DEVICE_LABELS.DEVICES).toBe('デバイス');
      expect(DEVICE_LABELS.FIELDS.DEVICE_NAME).toBe('デバイス名');
    });

    it('アクションメッセージとページタイトルが一貫している', () => {
      expect(DEVICE_LABELS.ACTIONS.CREATE_DEVICE).toBe('デバイス作成');
      expect(DEVICE_LABELS.PAGES.CREATE).toBe('デバイス作成');
      
      expect(DEVICE_LABELS.ACTIONS.EDIT_DEVICE).toBe('デバイス編集');
      expect(DEVICE_LABELS.PAGES.EDIT).toBe('デバイス編集');
    });
  });

  describe('要件適合性', () => {
    it('Requirements 1.2: 業務用語が日本語化されている', () => {
      expect(DEVICE_LABELS.DEVICE).toBe('デバイス');
      expect(DEVICE_LABELS.FIELDS.NAME).toBe('デバイス名');
      expect(DEVICE_LABELS.FIELDS.STATUS).toBe('ステータス');
    });

    it('Requirements 7.2: デバイスステータスが日本語化されている', () => {
      expect(DEVICE_LABELS.STATUS.ONLINE).toBe('オンライン');
      expect(DEVICE_LABELS.STATUS.OFFLINE).toBe('オフライン');
      expect(DEVICE_LABELS.STATUS.ERROR).toBe('エラー');
      expect(DEVICE_LABELS.STATUS.RUNNING).toBe('稼働中');
      expect(DEVICE_LABELS.STATUS.STOPPED).toBe('停止中');
    });

    it('技術用語は英語表記を維持している', () => {
      expect(DEVICE_LABELS.FIELDS.MAC_ADDRESS).toBe('MAC Address');
      expect(DEVICE_LABELS.FIELDS.ID).toBe('ID');
    });
  });

  describe('エラーハンドリング', () => {
    it('エラーメッセージが適切に定義されている', () => {
      expect(DEVICE_LABELS.ERRORS.FETCH_FAILED).toBe('デバイス情報の取得に失敗しました');
      expect(DEVICE_LABELS.ERRORS.CREATE_FAILED).toBe('デバイスの作成に失敗しました');
      expect(DEVICE_LABELS.ERRORS.DEVICE_NOT_FOUND).toBe('デバイスが見つかりません');
    });
  });

  describe('ヘルプテキスト', () => {
    it('ヘルプテキストが分かりやすい日本語で定義されている', () => {
      expect(DEVICE_LABELS.HELP_TEXT.MAC_ADDRESS).toContain('一意識別子');
      expect(DEVICE_LABELS.HELP_TEXT.NAME).toContain('識別しやすい名前');
      expect(DEVICE_LABELS.HELP_TEXT.STANDARD_CYCLE_TIME).toContain('秒単位');
    });
  });
});