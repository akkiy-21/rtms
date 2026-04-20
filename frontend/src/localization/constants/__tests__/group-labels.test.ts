/**
 * グループ関連翻訳定数のテスト
 * 
 * グループ翻訳定数が正しく定義され、適切な日本語翻訳を提供することを確認します。
 */

import { GROUP_LABELS, GroupType, GroupStatus, GroupField } from '../group-labels';

describe('GROUP_LABELS', () => {
  describe('TYPES', () => {
    it('should provide Japanese labels for group types', () => {
      expect(GROUP_LABELS.TYPES.DEPARTMENT).toBe('部署');
      expect(GROUP_LABELS.TYPES.TEAM).toBe('チーム');
      expect(GROUP_LABELS.TYPES.PROJECT).toBe('プロジェクト');
      expect(GROUP_LABELS.TYPES.ROLE).toBe('ロール');
      expect(GROUP_LABELS.TYPES.CUSTOM).toBe('カスタム');
    });

    it('should have all required group types', () => {
      const expectedTypes = ['DEPARTMENT', 'TEAM', 'PROJECT', 'ROLE', 'CUSTOM'];
      const actualTypes = Object.keys(GROUP_LABELS.TYPES);
      expect(actualTypes).toEqual(expect.arrayContaining(expectedTypes));
    });
  });

  describe('FIELDS', () => {
    it('should provide Japanese labels for group fields', () => {
      expect(GROUP_LABELS.FIELDS.ID).toBe('グループID');
      expect(GROUP_LABELS.FIELDS.NAME).toBe('グループ名');
      expect(GROUP_LABELS.FIELDS.DESCRIPTION).toBe('説明');
      expect(GROUP_LABELS.FIELDS.TYPE).toBe('グループタイプ');
      expect(GROUP_LABELS.FIELDS.MEMBERS).toBe('メンバー');
      expect(GROUP_LABELS.FIELDS.STATUS).toBe('ステータス');
    });

    it('should include all essential group fields', () => {
      const requiredFields = ['ID', 'NAME', 'DESCRIPTION', 'TYPE', 'MEMBERS', 'STATUS'];
      const actualFields = Object.keys(GROUP_LABELS.FIELDS);
      expect(actualFields).toEqual(expect.arrayContaining(requiredFields));
    });
  });

  describe('STATUS', () => {
    it('should provide Japanese labels for group status', () => {
      expect(GROUP_LABELS.STATUS.ACTIVE).toBe('アクティブ');
      expect(GROUP_LABELS.STATUS.INACTIVE).toBe('非アクティブ');
      expect(GROUP_LABELS.STATUS.SUSPENDED).toBe('停止中');
      expect(GROUP_LABELS.STATUS.ARCHIVED).toBe('アーカイブ済み');
      expect(GROUP_LABELS.STATUS.PENDING).toBe('承認待ち');
    });
  });

  describe('ACTIONS', () => {
    it('should provide Japanese labels for group actions', () => {
      expect(GROUP_LABELS.ACTIONS.CREATE_GROUP).toBe('グループ作成');
      expect(GROUP_LABELS.ACTIONS.EDIT_GROUP).toBe('グループ編集');
      expect(GROUP_LABELS.ACTIONS.DELETE_GROUP).toBe('グループ削除');
      expect(GROUP_LABELS.ACTIONS.MANAGE_MEMBERS).toBe('メンバー管理');
      expect(GROUP_LABELS.ACTIONS.ADD_MEMBER).toBe('メンバー追加');
      expect(GROUP_LABELS.ACTIONS.REMOVE_MEMBER).toBe('メンバー削除');
    });
  });

  describe('MESSAGES', () => {
    it('should provide Japanese success messages', () => {
      expect(GROUP_LABELS.MESSAGES.CREATE_SUCCESS).toBe('グループを作成しました');
      expect(GROUP_LABELS.MESSAGES.UPDATE_SUCCESS).toBe('グループを更新しました');
      expect(GROUP_LABELS.MESSAGES.DELETE_SUCCESS).toBe('グループを削除しました');
    });

    it('should provide Japanese confirmation messages', () => {
      expect(GROUP_LABELS.MESSAGES.DELETE_CONFIRM).toBe('このグループを削除してもよろしいですか？');
      expect(GROUP_LABELS.MESSAGES.DELETE_WARNING).toBe('グループを削除すると、メンバーの権限設定も削除されます');
    });
  });

  describe('TABLE', () => {
    it('should provide Japanese table headers', () => {
      expect(GROUP_LABELS.TABLE.HEADERS.ID).toBe('ID');
      expect(GROUP_LABELS.TABLE.HEADERS.NAME).toBe('グループ名');
      expect(GROUP_LABELS.TABLE.HEADERS.TYPE).toBe('タイプ');
      expect(GROUP_LABELS.TABLE.HEADERS.MEMBER_COUNT).toBe('メンバー数');
      expect(GROUP_LABELS.TABLE.HEADERS.STATUS).toBe('ステータス');
      expect(GROUP_LABELS.TABLE.HEADERS.ACTIONS).toBe('アクション');
    });

    it('should provide Japanese sort labels', () => {
      expect(GROUP_LABELS.TABLE.SORT_BY.NAME).toBe('グループ名でソート');
      expect(GROUP_LABELS.TABLE.SORT_BY.TYPE).toBe('タイプでソート');
      expect(GROUP_LABELS.TABLE.SORT_BY.STATUS).toBe('ステータスでソート');
    });
  });

  describe('PAGES', () => {
    it('should provide Japanese page titles', () => {
      expect(GROUP_LABELS.PAGES.LIST).toBe('グループ管理');
      expect(GROUP_LABELS.PAGES.CREATE).toBe('グループ作成');
      expect(GROUP_LABELS.PAGES.EDIT).toBe('グループ編集');
      expect(GROUP_LABELS.PAGES.DETAIL).toBe('グループ詳細');
      expect(GROUP_LABELS.PAGES.MEMBERS).toBe('グループメンバー');
    });
  });

  describe('VALIDATION', () => {
    it('should provide Japanese validation messages', () => {
      expect(GROUP_LABELS.VALIDATION.ID_REQUIRED).toBe('グループIDは必須です');
      expect(GROUP_LABELS.VALIDATION.NAME_REQUIRED).toBe('グループ名は必須です');
      expect(GROUP_LABELS.VALIDATION.TYPE_REQUIRED).toBe('グループタイプを選択してください');
      expect(GROUP_LABELS.VALIDATION.ID_ALREADY_EXISTS).toBe('このグループIDは既に使用されています');
      expect(GROUP_LABELS.VALIDATION.NAME_ALREADY_EXISTS).toBe('このグループ名は既に使用されています');
    });

    it('should provide specific validation messages for group constraints', () => {
      expect(GROUP_LABELS.VALIDATION.CIRCULAR_REFERENCE).toBe('循環参照が発生するため、この親グループは選択できません');
      expect(GROUP_LABELS.VALIDATION.MEMBER_ALREADY_EXISTS).toBe('このユーザーは既にグループのメンバーです');
      expect(GROUP_LABELS.VALIDATION.MEMBER_NOT_FOUND).toBe('指定されたユーザーが見つかりません');
    });
  });

  describe('Type definitions', () => {
    it('should export correct type definitions', () => {
      // TypeScriptの型チェックが正しく動作することを確認
      const groupType: GroupType = 'DEPARTMENT';
      const groupStatus: GroupStatus = 'ACTIVE';
      const groupField: GroupField = 'NAME';

      expect(typeof groupType).toBe('string');
      expect(typeof groupStatus).toBe('string');
      expect(typeof groupField).toBe('string');
    });
  });

  describe('Consistency checks', () => {
    it('should use consistent Japanese terminology', () => {
      // グループという用語が一貫して使用されていることを確認
      const groupTerms = [
        GROUP_LABELS.FIELDS.GROUP_ID,
        GROUP_LABELS.FIELDS.GROUP_NAME,
        GROUP_LABELS.FIELDS.GROUP_TYPE,
        GROUP_LABELS.ACTIONS.CREATE_GROUP,
        GROUP_LABELS.ACTIONS.EDIT_GROUP,
        GROUP_LABELS.ACTIONS.DELETE_GROUP,
      ];

      groupTerms.forEach(term => {
        expect(term).toContain('グループ');
      });
    });

    it('should use polite Japanese forms in messages', () => {
      // 丁寧語が使用されていることを確認
      const politeMessages = [
        GROUP_LABELS.MESSAGES.CREATE_SUCCESS,
        GROUP_LABELS.MESSAGES.UPDATE_SUCCESS,
        GROUP_LABELS.MESSAGES.DELETE_SUCCESS,
        GROUP_LABELS.MESSAGES.MEMBER_ADDED,
        GROUP_LABELS.MESSAGES.MEMBER_REMOVED,
      ];

      politeMessages.forEach(message => {
        expect(message).toMatch(/(ました|です)$/);
      });
    });

    it('should use appropriate question forms in confirmations', () => {
      // 確認メッセージが適切な疑問形を使用していることを確認
      const confirmationMessages = [
        GROUP_LABELS.MESSAGES.DELETE_CONFIRM,
        GROUP_LABELS.MESSAGES.ARCHIVE_CONFIRM,
        GROUP_LABELS.MESSAGES.RESTORE_CONFIRM,
      ];

      confirmationMessages.forEach(message => {
        expect(message).toMatch(/ですか？$/);
      });
    });
  });
});