/**
 * 分類関連翻訳定数のテスト
 * 
 * 分類翻訳定数の構造と内容を検証します。
 */

import { CLASSIFICATION_LABELS } from '../classification-labels';

describe('CLASSIFICATION_LABELS', () => {
  describe('基本構造', () => {
    it('必要なカテゴリがすべて定義されている', () => {
      const expectedCategories = [
        'CLASSIFICATION',
        'CLASSIFICATIONS',
        'CLASSIFICATION_GROUP',
        'CLASSIFICATION_GROUPS',
        'FIELDS',
        'PLACEHOLDERS',
        'HELP_TEXT',
        'STATUS',
        'TYPES',
        'ACTIONS',
        'MESSAGES',
        'TABLE',
        'GROUP_TABLE',
        'PAGES',
        'PAGE_DESCRIPTIONS',
        'NAVIGATION',
        'FILTERS',
        'VALIDATION',
        'STATISTICS',
        'IMPORT_EXPORT',
        'ERRORS',
        'CONFIRMATIONS',
      ];

      expectedCategories.forEach(category => {
        expect(CLASSIFICATION_LABELS).toHaveProperty(category);
      });
    });

    it('基本用語が正しく定義されている', () => {
      expect(CLASSIFICATION_LABELS.CLASSIFICATION).toBe('分類');
      expect(CLASSIFICATION_LABELS.CLASSIFICATIONS).toBe('分類');
      expect(CLASSIFICATION_LABELS.CLASSIFICATION_GROUP).toBe('分類グループ');
      expect(CLASSIFICATION_LABELS.CLASSIFICATION_GROUPS).toBe('分類グループ');
    });
  });

  describe('フィールドラベル', () => {
    it('必要なフィールドがすべて定義されている', () => {
      const expectedFields = [
        'ID',
        'CLASSIFICATION_ID',
        'NAME',
        'CLASSIFICATION_NAME',
        'GROUP',
        'GROUP_ID',
        'GROUP_NAME',
        'DESCRIPTION',
        'STATUS',
        'CREATED_AT',
        'UPDATED_AT',
        'CREATED_BY',
        'UPDATED_BY',
      ];

      expectedFields.forEach(field => {
        expect(CLASSIFICATION_LABELS.FIELDS).toHaveProperty(field);
        expect(typeof CLASSIFICATION_LABELS.FIELDS[field as keyof typeof CLASSIFICATION_LABELS.FIELDS]).toBe('string');
      });
    });

    it('フィールドラベルが適切な日本語である', () => {
      expect(CLASSIFICATION_LABELS.FIELDS.NAME).toBe('分類名');
      expect(CLASSIFICATION_LABELS.FIELDS.GROUP).toBe('グループ');
      expect(CLASSIFICATION_LABELS.FIELDS.DESCRIPTION).toBe('説明');
      expect(CLASSIFICATION_LABELS.FIELDS.STATUS).toBe('ステータス');
    });
  });

  describe('プレースホルダー', () => {
    it('必要なプレースホルダーが定義されている', () => {
      const expectedPlaceholders = [
        'NAME',
        'CLASSIFICATION_NAME',
        'GROUP',
        'GROUP_SELECT',
        'DESCRIPTION',
        'SEARCH',
        'SEARCH_BY_NAME',
        'SEARCH_BY_GROUP',
      ];

      expectedPlaceholders.forEach(placeholder => {
        expect(CLASSIFICATION_LABELS.PLACEHOLDERS).toHaveProperty(placeholder);
        expect(typeof CLASSIFICATION_LABELS.PLACEHOLDERS[placeholder as keyof typeof CLASSIFICATION_LABELS.PLACEHOLDERS]).toBe('string');
      });
    });

    it('プレースホルダーが適切な形式である', () => {
      expect(CLASSIFICATION_LABELS.PLACEHOLDERS.NAME).toBe('分類名を入力');
      expect(CLASSIFICATION_LABELS.PLACEHOLDERS.GROUP).toBe('分類グループを選択');
      expect(CLASSIFICATION_LABELS.PLACEHOLDERS.SEARCH).toBe('分類名で検索...');
    });
  });

  describe('ステータスラベル', () => {
    it('必要なステータスが定義されている', () => {
      const expectedStatuses = [
        'ACTIVE',
        'INACTIVE',
        'DRAFT',
        'ARCHIVED',
        'PENDING',
        'APPROVED',
        'REJECTED',
      ];

      expectedStatuses.forEach(status => {
        expect(CLASSIFICATION_LABELS.STATUS).toHaveProperty(status);
        expect(typeof CLASSIFICATION_LABELS.STATUS[status as keyof typeof CLASSIFICATION_LABELS.STATUS]).toBe('string');
      });
    });

    it('ステータスラベルが適切な日本語である', () => {
      expect(CLASSIFICATION_LABELS.STATUS.ACTIVE).toBe('アクティブ');
      expect(CLASSIFICATION_LABELS.STATUS.INACTIVE).toBe('非アクティブ');
      expect(CLASSIFICATION_LABELS.STATUS.DRAFT).toBe('下書き');
      expect(CLASSIFICATION_LABELS.STATUS.ARCHIVED).toBe('アーカイブ済み');
    });
  });

  describe('アクションラベル', () => {
    it('基本的なCRUD操作が定義されている', () => {
      expect(CLASSIFICATION_LABELS.ACTIONS.CREATE_CLASSIFICATION).toBe('分類作成');
      expect(CLASSIFICATION_LABELS.ACTIONS.EDIT_CLASSIFICATION).toBe('分類編集');
      expect(CLASSIFICATION_LABELS.ACTIONS.DELETE_CLASSIFICATION).toBe('分類削除');
      expect(CLASSIFICATION_LABELS.ACTIONS.VIEW_CLASSIFICATION).toBe('分類詳細');
    });

    it('グループ管理アクションが定義されている', () => {
      expect(CLASSIFICATION_LABELS.ACTIONS.MANAGE_GROUPS).toBe('グループ管理');
      expect(CLASSIFICATION_LABELS.ACTIONS.CREATE_GROUP).toBe('グループ作成');
      expect(CLASSIFICATION_LABELS.ACTIONS.EDIT_GROUP).toBe('グループ編集');
      expect(CLASSIFICATION_LABELS.ACTIONS.DELETE_GROUP).toBe('グループ削除');
    });
  });

  describe('メッセージ', () => {
    it('成功メッセージが定義されている', () => {
      expect(CLASSIFICATION_LABELS.MESSAGES.CREATE_SUCCESS).toBe('分類を作成しました');
      expect(CLASSIFICATION_LABELS.MESSAGES.UPDATE_SUCCESS).toBe('分類を更新しました');
      expect(CLASSIFICATION_LABELS.MESSAGES.DELETE_SUCCESS).toBe('分類を削除しました');
    });

    it('確認メッセージが定義されている', () => {
      expect(CLASSIFICATION_LABELS.MESSAGES.DELETE_CONFIRM).toBe('この分類を削除してもよろしいですか？');
      expect(CLASSIFICATION_LABELS.MESSAGES.DELETE_WARNING).toBe('分類を削除すると、関連するデータも削除される可能性があります');
    });

    it('ローディングメッセージが定義されている', () => {
      expect(CLASSIFICATION_LABELS.MESSAGES.LOADING_CLASSIFICATIONS).toBe('分類情報を読み込み中...');
      expect(CLASSIFICATION_LABELS.MESSAGES.CREATING).toBe('作成中...');
      expect(CLASSIFICATION_LABELS.MESSAGES.UPDATING).toBe('更新中...');
    });
  });

  describe('テーブル関連', () => {
    it('テーブルヘッダーが定義されている', () => {
      const expectedHeaders = [
        'ID',
        'NAME',
        'GROUP',
        'STATUS',
        'DESCRIPTION',
        'CREATED_AT',
        'ACTIONS',
      ];

      expectedHeaders.forEach(header => {
        expect(CLASSIFICATION_LABELS.TABLE.HEADERS).toHaveProperty(header);
      });
    });

    it('ソートラベルが定義されている', () => {
      expect(CLASSIFICATION_LABELS.TABLE.SORT_BY.NAME).toBe('分類名でソート');
      expect(CLASSIFICATION_LABELS.TABLE.SORT_BY.GROUP).toBe('グループでソート');
      expect(CLASSIFICATION_LABELS.TABLE.SORT_BY.STATUS).toBe('ステータスでソート');
    });

    it('空状態メッセージが定義されている', () => {
      expect(CLASSIFICATION_LABELS.TABLE.EMPTY_STATE.TITLE).toBe('分類がありません');
      expect(CLASSIFICATION_LABELS.TABLE.EMPTY_STATE.DESCRIPTION).toBe('分類を作成して開始してください');
      expect(CLASSIFICATION_LABELS.TABLE.EMPTY_STATE.ACTION).toBe('分類作成');
    });
  });

  describe('ページタイトル', () => {
    it('必要なページタイトルが定義されている', () => {
      const expectedPages = [
        'LIST',
        'CREATE',
        'EDIT',
        'DETAIL',
        'GROUPS',
        'GROUP_CREATE',
        'GROUP_EDIT',
        'GROUP_DETAIL',
      ];

      expectedPages.forEach(page => {
        expect(CLASSIFICATION_LABELS.PAGES).toHaveProperty(page);
        expect(typeof CLASSIFICATION_LABELS.PAGES[page as keyof typeof CLASSIFICATION_LABELS.PAGES]).toBe('string');
      });
    });

    it('ページタイトルが適切な日本語である', () => {
      expect(CLASSIFICATION_LABELS.PAGES.LIST).toBe('分類管理');
      expect(CLASSIFICATION_LABELS.PAGES.CREATE).toBe('分類作成');
      expect(CLASSIFICATION_LABELS.PAGES.EDIT).toBe('分類編集');
      expect(CLASSIFICATION_LABELS.PAGES.GROUPS).toBe('分類グループ管理');
    });
  });

  describe('バリデーションメッセージ', () => {
    it('必要なバリデーションメッセージが定義されている', () => {
      const expectedValidations = [
        'NAME_REQUIRED',
        'NAME_MAX_LENGTH',
        'NAME_ALREADY_EXISTS',
        'GROUP_REQUIRED',
        'GROUP_INVALID',
        'DESCRIPTION_MAX_LENGTH',
      ];

      expectedValidations.forEach(validation => {
        expect(CLASSIFICATION_LABELS.VALIDATION).toHaveProperty(validation);
        expect(typeof CLASSIFICATION_LABELS.VALIDATION[validation as keyof typeof CLASSIFICATION_LABELS.VALIDATION]).toBe('string');
      });
    });

    it('バリデーションメッセージが適切な日本語である', () => {
      expect(CLASSIFICATION_LABELS.VALIDATION.NAME_REQUIRED).toBe('分類名は必須です');
      expect(CLASSIFICATION_LABELS.VALIDATION.NAME_MAX_LENGTH).toBe('分類名は100文字以内で入力してください');
      expect(CLASSIFICATION_LABELS.VALIDATION.GROUP_REQUIRED).toBe('分類グループを選択してください');
    });
  });

  describe('エラーメッセージ', () => {
    it('必要なエラーメッセージが定義されている', () => {
      const expectedErrors = [
        'FETCH_FAILED',
        'CREATE_FAILED',
        'UPDATE_FAILED',
        'DELETE_FAILED',
        'NETWORK_ERROR',
        'PERMISSION_DENIED',
        'CLASSIFICATION_NOT_FOUND',
      ];

      expectedErrors.forEach(error => {
        expect(CLASSIFICATION_LABELS.ERRORS).toHaveProperty(error);
        expect(typeof CLASSIFICATION_LABELS.ERRORS[error as keyof typeof CLASSIFICATION_LABELS.ERRORS]).toBe('string');
      });
    });

    it('エラーメッセージが適切な日本語である', () => {
      expect(CLASSIFICATION_LABELS.ERRORS.FETCH_FAILED).toBe('分類情報の取得に失敗しました');
      expect(CLASSIFICATION_LABELS.ERRORS.CREATE_FAILED).toBe('分類の作成に失敗しました');
      expect(CLASSIFICATION_LABELS.ERRORS.NETWORK_ERROR).toBe('ネットワークエラーが発生しました');
    });
  });

  describe('型定義の検証', () => {
    it('型定義が正しくエクスポートされている', () => {
      // TypeScriptの型チェックが通ることを確認
      const status: keyof typeof CLASSIFICATION_LABELS.STATUS = 'ACTIVE';
      const field: keyof typeof CLASSIFICATION_LABELS.FIELDS = 'NAME';
      const action: keyof typeof CLASSIFICATION_LABELS.ACTIONS = 'CREATE_CLASSIFICATION';
      
      expect(CLASSIFICATION_LABELS.STATUS[status]).toBeDefined();
      expect(CLASSIFICATION_LABELS.FIELDS[field]).toBeDefined();
      expect(CLASSIFICATION_LABELS.ACTIONS[action]).toBeDefined();
    });
  });

  describe('一貫性の検証', () => {
    it('すべての文字列値が空でない', () => {
      const checkObject = (obj: any, path = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string') {
            expect(value.trim()).not.toBe('');
          } else if (typeof value === 'object' && value !== null) {
            checkObject(value, currentPath);
          }
        });
      };

      checkObject(CLASSIFICATION_LABELS);
    });

    it('日本語文字が含まれている（技術用語以外）', () => {
      // 基本用語は日本語である
      expect(CLASSIFICATION_LABELS.CLASSIFICATION).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      expect(CLASSIFICATION_LABELS.CLASSIFICATION_GROUP).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      
      // フィールドラベルの多くは日本語である（IDなどの技術用語を除く）
      expect(CLASSIFICATION_LABELS.FIELDS.NAME).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      expect(CLASSIFICATION_LABELS.FIELDS.DESCRIPTION).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
    });

    it('メッセージが適切な敬語形式である', () => {
      // 成功メッセージは「〜しました」形式
      expect(CLASSIFICATION_LABELS.MESSAGES.CREATE_SUCCESS).toMatch(/しました$/);
      expect(CLASSIFICATION_LABELS.MESSAGES.UPDATE_SUCCESS).toMatch(/しました$/);
      expect(CLASSIFICATION_LABELS.MESSAGES.DELETE_SUCCESS).toMatch(/しました$/);
      
      // バリデーションメッセージは「〜してください」形式
      expect(CLASSIFICATION_LABELS.VALIDATION.NAME_REQUIRED).toMatch(/です$/);
      expect(CLASSIFICATION_LABELS.VALIDATION.NAME_MAX_LENGTH).toMatch(/してください$/);
      expect(CLASSIFICATION_LABELS.VALIDATION.GROUP_REQUIRED).toMatch(/してください$/);
    });
  });
});