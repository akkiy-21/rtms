/**
 * ユーザーラベル翻訳定数のテスト
 * 
 * Requirements: 7.1
 */

import { USER_LABELS, UserRole, UserStatus } from '../user-labels';

describe('USER_LABELS', () => {
  describe('ROLES', () => {
    it('should have correct Japanese labels for user roles', () => {
      expect(USER_LABELS.ROLES.AD).toBe('管理者');
      expect(USER_LABELS.ROLES.CU).toBe('一般ユーザー');
    });

    it('should have all required role codes', () => {
      const roleKeys = Object.keys(USER_LABELS.ROLES);
      expect(roleKeys).toContain('AD');
      expect(roleKeys).toContain('CU');
      expect(roleKeys).toHaveLength(2);
    });
  });

  describe('ROLE_DESCRIPTIONS', () => {
    it('should have detailed role descriptions', () => {
      expect(USER_LABELS.ROLE_DESCRIPTIONS.AD).toBe('管理者ユーザー');
      expect(USER_LABELS.ROLE_DESCRIPTIONS.CU).toBe('一般ユーザー');
    });
  });

  describe('FIELDS', () => {
    it('should have Japanese field labels', () => {
      expect(USER_LABELS.FIELDS.ID).toBe('社員ID');
      expect(USER_LABELS.FIELDS.NAME).toBe('名前');
      expect(USER_LABELS.FIELDS.ROLE).toBe('ロール');
      expect(USER_LABELS.FIELDS.PASSWORD).toBe('パスワード');
    });
  });

  describe('PLACEHOLDERS', () => {
    it('should have Japanese placeholder text', () => {
      expect(USER_LABELS.PLACEHOLDERS.ID).toBe('社員IDを入力');
      expect(USER_LABELS.PLACEHOLDERS.NAME).toBe('名前を入力');
      expect(USER_LABELS.PLACEHOLDERS.ROLE).toBe('ロールを選択');
      expect(USER_LABELS.PLACEHOLDERS.SEARCH).toBe('ユーザー名で検索...');
    });
  });

  describe('VALIDATION', () => {
    it('should have Japanese validation messages', () => {
      expect(USER_LABELS.VALIDATION.ID_REQUIRED).toBe('社員IDは必須です');
      expect(USER_LABELS.VALIDATION.NAME_REQUIRED).toBe('名前は必須です');
      expect(USER_LABELS.VALIDATION.ROLE_REQUIRED).toBe('ロールを選択してください');
      expect(USER_LABELS.VALIDATION.PASSWORD_REQUIRED_FOR_ADMIN).toBe('ユーザー作成後に仮パスワードが発行されます');
    });
  });

  describe('TABLE', () => {
    it('should have Japanese table headers', () => {
      expect(USER_LABELS.TABLE.HEADERS.ID).toBe('ID');
      expect(USER_LABELS.TABLE.HEADERS.NAME).toBe('名前');
      expect(USER_LABELS.TABLE.HEADERS.ROLE).toBe('ロール');
      expect(USER_LABELS.TABLE.HEADERS.ACTIONS).toBe('アクション');
    });

    it('should have Japanese sort labels', () => {
      expect(USER_LABELS.TABLE.SORT_BY.NAME).toBe('名前でソート');
      expect(USER_LABELS.TABLE.SORT_BY.ROLE).toBe('ロールでソート');
    });
  });

  describe('MESSAGES', () => {
    it('should have Japanese success messages', () => {
      expect(USER_LABELS.MESSAGES.CREATE_SUCCESS).toBe('ユーザーを作成しました');
      expect(USER_LABELS.MESSAGES.UPDATE_SUCCESS).toBe('ユーザーを更新しました');
      expect(USER_LABELS.MESSAGES.DELETE_SUCCESS).toBe('ユーザーを削除しました');
    });

    it('should have Japanese confirmation messages', () => {
      expect(USER_LABELS.MESSAGES.DELETE_CONFIRM).toBe('このユーザーを削除してもよろしいですか？');
      expect(USER_LABELS.MESSAGES.PASSWORD_REQUIRED).toBe('作成後に仮パスワードが発行されます');
    });
  });

  describe('PAGES', () => {
    it('should have Japanese page titles', () => {
      expect(USER_LABELS.PAGES.LIST).toBe('ユーザー管理');
      expect(USER_LABELS.PAGES.CREATE).toBe('ユーザー作成');
      expect(USER_LABELS.PAGES.EDIT).toBe('ユーザー編集');
      expect(USER_LABELS.PAGES.DETAIL).toBe('ユーザー詳細');
    });
  });

  describe('Type definitions', () => {
    it('should have correct UserRole type', () => {
      const validRoles: UserRole[] = ['AD', 'CU'];
      validRoles.forEach(role => {
        expect(USER_LABELS.ROLES[role]).toBeDefined();
      });
    });

    it('should have correct UserStatus type', () => {
      const validStatuses: UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'LOCKED'];
      validStatuses.forEach(status => {
        expect(USER_LABELS.STATUS[status]).toBeDefined();
      });
    });
  });

  describe('Requirements validation', () => {
    it('should satisfy requirement 7.1 - user role Japanese labels', () => {
      // 要件7.1: ユーザーロールの日本語ラベルを定義
      const roles = USER_LABELS.ROLES;
      
      // すべてのロールが日本語で定義されている
      expect(roles.AD).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      expect(roles.CU).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      
      // 一貫した翻訳パターン
      expect(roles.AD).toBe('管理者');
      expect(roles.CU).toBe('一般ユーザー');
    });
  });
});