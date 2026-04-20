/**
 * エラーハンドリングの翻訳テスト
 * 
 * APIエラー、バリデーションエラー、ネットワークエラーの日本語表示を確認
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 8.1, 8.2, 8.3, 8.4, 8.5
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// フック
import { useApiError } from '../hooks/use-api-error';
import { renderHook } from '@testing-library/react';

// 翻訳定数
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';
import { VALIDATION_MESSAGES } from '../localization/constants/validation-messages';

// モック
const mockToast = jest.fn();
jest.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// APIモック
const mockApi = {
  getUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getDevices: jest.fn(),
  createDevice: jest.fn(),
  downloadData: jest.fn(),
};

jest.mock('../services/api', () => mockApi);

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('エラーハンドリングの翻訳テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('APIエラーの日本語表示 (Requirements: 8.1, 8.2, 8.3)', () => {
    describe('useApiError フック', () => {
      it('ネットワークエラーを日本語で表示する', () => {
        const { result } = renderHook(() => useApiError());
        const networkError = new Error('Network error');
        
        result.current.handleError(networkError);
        
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'エラー',
          description: MESSAGE_FORMATTER.ERROR_NETWORK(),
        });
        
        // メッセージが日本語であることを確認
        expect(MESSAGE_FORMATTER.ERROR_NETWORK()).toBe('接続に問題があります。しばらく待ってから再試行してください');
      });

      it('権限エラーを日本語で表示する', () => {
        const { result } = renderHook(() => useApiError());
        const permissionError = new Error('Unauthorized');
        
        result.current.handleError(permissionError);
        
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'エラー',
          description: MESSAGE_FORMATTER.ERROR_PERMISSION(),
        });
        
        // メッセージが日本語であることを確認
        expect(MESSAGE_FORMATTER.ERROR_PERMISSION()).toBe('この操作を実行する権限がありません');
      });

      it('404エラーを日本語で表示する', () => {
        const { result } = renderHook(() => useApiError());
        const notFoundError = new Error('Not found');
        
        result.current.handleError(notFoundError);
        
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'エラー',
          description: MESSAGE_FORMATTER.ERROR_NOT_FOUND('リソース'),
        });
        
        // メッセージが日本語であることを確認
        expect(MESSAGE_FORMATTER.ERROR_NOT_FOUND('リソース')).toBe('リソースが見つかりません');
      });

      it('サーバーエラーを日本語で表示する', () => {
        const { result } = renderHook(() => useApiError());
        const serverError = new Error('Internal server error');
        
        result.current.handleError(serverError);
        
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'エラー',
          description: MESSAGE_FORMATTER.ERROR_SERVER(),
        });
        
        // メッセージが日本語であることを確認
        expect(MESSAGE_FORMATTER.ERROR_SERVER()).toBe('サーバーでエラーが発生しました');
      });

      it('タイムアウトエラーを日本語で表示する', () => {
        const { result } = renderHook(() => useApiError());
        const timeoutError = new Error('Request timeout');
        
        result.current.handleError(timeoutError);
        
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'エラー',
          description: MESSAGE_FORMATTER.ERROR_TIMEOUT(),
        });
        
        // メッセージが日本語であることを確認
        expect(MESSAGE_FORMATTER.ERROR_TIMEOUT()).toBe('リクエストがタイムアウトしました');
      });

      it('不明なエラーを日本語で表示する', () => {
        const { result } = renderHook(() => useApiError());
        const unknownError = null;
        
        result.current.handleError(unknownError);
        
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'エラー',
          description: MESSAGE_FORMATTER.ERROR_UNKNOWN(),
        });
        
        // メッセージが日本語であることを確認
        expect(MESSAGE_FORMATTER.ERROR_UNKNOWN()).toBe('予期しないエラーが発生しました');
      });
    });

    describe('API操作別エラーメッセージ', () => {
      it('データ取得エラーを日本語で表示する', () => {
        const { result } = renderHook(() => useApiError());
        const fetchError = new Error('Failed to fetch');
        
        result.current.handleApiError.fetch('ユーザー', fetchError);
        
        // fetchエラーはネットワークエラーとして判定される
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: MESSAGE_FORMATTER.ERROR_FETCH('ユーザー'),
          description: MESSAGE_FORMATTER.ERROR_NETWORK(),
        });
        
        // タイトルが日本語であることを確認
        expect(MESSAGE_FORMATTER.ERROR_FETCH('ユーザー')).toBe('ユーザーの取得に失敗しました');
      });

      it('データ作成エラーを日本語で表示する', () => {
        const { result } = renderHook(() => useApiError());
        const createError = new Error('Creation failed');
        
        result.current.handleApiError.create('デバイス', createError);
        
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: MESSAGE_FORMATTER.ERROR_CREATE('デバイス'),
          description: 'Creation failed',
        });
        
        // タイトルが日本語であることを確認
        expect(MESSAGE_FORMATTER.ERROR_CREATE('デバイス')).toBe('デバイスの作成に失敗しました');
      });

      it('データ更新エラーを日本語で表示する', () => {
        const { result } = renderHook(() => useApiError());
        const updateError = new Error('Update failed');
        
        result.current.handleApiError.update('グループ', updateError);
        
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: MESSAGE_FORMATTER.ERROR_UPDATE('グループ'),
          description: 'Update failed',
        });
        
        // タイトルが日本語であることを確認
        expect(MESSAGE_FORMATTER.ERROR_UPDATE('グループ')).toBe('グループの更新に失敗しました');
      });

      it('データ削除エラーを日本語で表示する', () => {
        const { result } = renderHook(() => useApiError());
        const deleteError = new Error('Delete failed');
        
        result.current.handleApiError.delete('製品', deleteError);
        
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: MESSAGE_FORMATTER.ERROR_DELETE('製品'),
          description: 'Delete failed',
        });
        
        // タイトルが日本語であることを確認
        expect(MESSAGE_FORMATTER.ERROR_DELETE('製品')).toBe('製品の削除に失敗しました');
      });

      it('ファイルアップロードエラーを日本語で表示する', () => {
        const { result } = renderHook(() => useApiError());
        const uploadError = new Error('Upload failed');
        
        result.current.handleApiError.upload(uploadError);
        
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: MESSAGE_FORMATTER.ERROR_UPLOAD(),
          description: 'Upload failed',
        });
        
        // タイトルが日本語であることを確認
        expect(MESSAGE_FORMATTER.ERROR_UPLOAD()).toBe('ファイルのアップロードに失敗しました');
      });

      it('ファイルダウンロードエラーを日本語で表示する', () => {
        const { result } = renderHook(() => useApiError());
        const downloadError = new Error('Download failed');
        
        result.current.handleApiError.download(downloadError);
        
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: MESSAGE_FORMATTER.ERROR_DOWNLOAD(),
          description: 'Download failed',
        });
        
        // タイトルが日本語であることを確認
        expect(MESSAGE_FORMATTER.ERROR_DOWNLOAD()).toBe('ファイルのダウンロードに失敗しました');
      });
    });
  });

  describe('バリデーションエラーの日本語表示 (Requirements: 5.1, 5.2, 5.3, 5.4)', () => {
    describe('必須フィールドエラー (Requirement 5.1)', () => {
      it('必須フィールドエラーメッセージが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.REQUIRED('ユーザー名');
        expect(message).toBe('ユーザー名は必須です');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/です$/);
      });

      it('複数の必須フィールドで一貫した形式を使用する', () => {
        const fields = ['名前', 'メールアドレス', 'パスワード', 'デバイス名'];
        
        fields.forEach(field => {
          const message = VALIDATION_MESSAGES.REQUIRED(field);
          expect(message).toBe(`${field}は必須です`);
          expect(message).toMatch(/は必須です$/);
        });
      });
    });

    describe('文字数制限エラー (Requirement 5.2)', () => {
      it('最大文字数エラーメッセージが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.MAX_LENGTH('説明', 100);
        expect(message).toBe('説明は100文字以内で入力してください');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/ください$/);
      });

      it('最小文字数エラーメッセージが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.MIN_LENGTH('パスワード', 8);
        expect(message).toBe('パスワードは8文字以上で入力してください');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/ください$/);
      });

      it('数値範囲エラーメッセージが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.INVALID_RANGE(1, 100);
        expect(message).toBe('1から100の範囲で入力してください');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/ください$/);
      });
    });

    describe('フォーマットエラー (Requirement 5.3)', () => {
      it('メールアドレス形式エラーが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.INVALID_EMAIL();
        expect(message).toBe('正しいメールアドレスを入力してください');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/ください$/);
      });

      it('URL形式エラーが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.INVALID_URL();
        expect(message).toBe('正しいURLを入力してください');
        
        // 技術用語「URL」は英語で維持されることを確認
        expect(message).toContain('URL');
      });

      it('IP Address形式エラーが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.INVALID_IP_ADDRESS();
        expect(message).toBe('正しいIP Addressを入力してください');
        
        // 技術用語「IP Address」は英語で維持されることを確認
        expect(message).toContain('IP Address');
      });

      it('MAC Address形式エラーが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.INVALID_MAC_ADDRESS();
        expect(message).toBe('正しいMAC Addressを入力してください');
        
        // 技術用語「MAC Address」は英語で維持されることを確認
        expect(message).toContain('MAC Address');
      });

      it('数値形式エラーが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.INVALID_NUMBER();
        expect(message).toBe('正しい数値を入力してください');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/ください$/);
      });
    });

    describe('重複エラー (Requirement 5.4)', () => {
      it('重複エラーメッセージが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.ALREADY_EXISTS('ユーザーID');
        expect(message).toBe('このユーザーIDは既に使用されています');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/います$/);
      });

      it('一意制約エラーメッセージが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.UNIQUE_CONSTRAINT('デバイス名');
        expect(message).toBe('デバイス名は一意である必要があります');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/あります$/);
      });

      it('重複値エラーメッセージが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.DUPLICATE_VALUE('メールアドレス');
        expect(message).toBe('メールアドレスが重複しています');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/います$/);
      });
    });

    describe('関連性エラー (Requirement 5.4)', () => {
      it('無効な組み合わせエラーが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.INVALID_COMBINATION('開始日', '終了日');
        expect(message).toBe('開始日と終了日の組み合わせが無効です');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/です$/);
      });

      it('依存関係エラーが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.DEPENDENCY_ERROR('詳細設定', '基本設定');
        expect(message).toBe('詳細設定を設定するには基本設定が必要です');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/です$/);
      });

      it('競合エラーが日本語で表示される', () => {
        const message = VALIDATION_MESSAGES.CONFLICT_ERROR('自動モード', '手動モード');
        expect(message).toBe('自動モードと手動モードは同時に設定できません');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/ません$/);
      });
    });
  });

  describe('成功・警告メッセージの日本語表示 (Requirements: 8.4, 8.5)', () => {
    describe('成功メッセージ', () => {
      it('作成成功メッセージが日本語で表示される', () => {
        const message = MESSAGE_FORMATTER.SUCCESS_CREATE('ユーザー');
        expect(message).toBe('ユーザーを作成しました');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/ました$/);
      });

      it('更新成功メッセージが日本語で表示される', () => {
        const message = MESSAGE_FORMATTER.SUCCESS_UPDATE('デバイス');
        expect(message).toBe('デバイスを更新しました');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/ました$/);
      });

      it('削除成功メッセージが日本語で表示される', () => {
        const message = MESSAGE_FORMATTER.SUCCESS_DELETE('グループ');
        expect(message).toBe('グループを削除しました');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/ました$/);
      });

      it('保存成功メッセージが日本語で表示される', () => {
        const message = MESSAGE_FORMATTER.SUCCESS_SAVE();
        expect(message).toBe('正常に保存されました');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/ました$/);
      });
    });

    describe('警告メッセージ', () => {
      it('未保存変更警告が日本語で表示される', () => {
        const message = MESSAGE_FORMATTER.WARNING_UNSAVED_CHANGES();
        expect(message).toBe('保存されていない変更があります');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/あります$/);
      });

      it('大きなファイル警告が日本語で表示される', () => {
        const message = MESSAGE_FORMATTER.WARNING_LARGE_FILE();
        expect(message).toBe('ファイルサイズが大きいため、処理に時間がかかる場合があります');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/あります$/);
      });

      it('削除警告が日本語で表示される', () => {
        const message = MESSAGE_FORMATTER.WARNING_DELETE_REFERENCED('ユーザー');
        expect(message).toBe('このユーザーは他のデータから参照されています。削除すると関連データに影響する可能性があります');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/あります$/);
      });
    });

    describe('情報メッセージ', () => {
      it('データなし情報が日本語で表示される', () => {
        const message = MESSAGE_FORMATTER.INFO_NO_DATA('ユーザー');
        expect(message).toBe('ユーザーがありません');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/ません$/);
      });

      it('検索結果なし情報が日本語で表示される', () => {
        const message = MESSAGE_FORMATTER.INFO_EMPTY_SEARCH();
        expect(message).toBe('検索結果がありません');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/ません$/);
      });

      it('選択件数情報が日本語で表示される', () => {
        const message = MESSAGE_FORMATTER.INFO_ITEMS_SELECTED(5);
        expect(message).toBe('5件が選択されています');
        
        // 日本語の丁寧語形式であることを確認
        expect(message).toMatch(/います$/);
      });
    });
  });

  describe('メッセージ形式の一貫性テスト', () => {
    it('すべてのエラーメッセージが適切な日本語形式を使用する', () => {
      const errorMessages = [
        MESSAGE_FORMATTER.ERROR_FETCH('テスト'),
        MESSAGE_FORMATTER.ERROR_CREATE('テスト'),
        MESSAGE_FORMATTER.ERROR_UPDATE('テスト'),
        MESSAGE_FORMATTER.ERROR_DELETE('テスト'),
        MESSAGE_FORMATTER.ERROR_NETWORK(),
        MESSAGE_FORMATTER.ERROR_PERMISSION(),
        MESSAGE_FORMATTER.ERROR_UNKNOWN(),
      ];

      errorMessages.forEach(message => {
        // 日本語文字が含まれている
        expect(message).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
        // 適切な長さ
        expect(message.length).toBeGreaterThan(0);
        expect(message.length).toBeLessThanOrEqual(200);
        // 制御文字が含まれていない
        expect(message).not.toMatch(/[\x00-\x1F\x7F]/);
      });
    });

    it('すべてのバリデーションメッセージが丁寧語形式を使用する', () => {
      const validationMessages = [
        VALIDATION_MESSAGES.REQUIRED('テスト'),
        VALIDATION_MESSAGES.MAX_LENGTH('テスト', 10),
        VALIDATION_MESSAGES.INVALID_EMAIL(),
        VALIDATION_MESSAGES.ALREADY_EXISTS('テスト'),
      ];

      validationMessages.forEach(message => {
        // 丁寧語の「です」「ください」「ます」で終わる
        expect(message).toMatch(/(です|ください|ます)$/);
      });
    });

    it('すべての成功メッセージが適切な日本語形式を使用する', () => {
      const successMessages = [
        MESSAGE_FORMATTER.SUCCESS_CREATE('テスト'),
        MESSAGE_FORMATTER.SUCCESS_UPDATE('テスト'),
        MESSAGE_FORMATTER.SUCCESS_DELETE('テスト'),
        MESSAGE_FORMATTER.SUCCESS_SAVE(),
      ];

      successMessages.forEach(message => {
        // 丁寧語の「ました」で終わる
        expect(message).toMatch(/ました$/);
      });
    });

    it('技術用語が適切に英語で維持される', () => {
      const technicalMessages = [
        VALIDATION_MESSAGES.INVALID_IP_ADDRESS(),
        VALIDATION_MESSAGES.INVALID_MAC_ADDRESS(),
        VALIDATION_MESSAGES.INVALID_URL(),
      ];

      technicalMessages.forEach(message => {
        // 英語の技術用語が含まれている
        expect(message).toMatch(/[A-Za-z]/);
        // 日本語も含まれている（説明部分）
        expect(message).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      });
    });
  });

  describe('エラーハンドリングの統合テスト', () => {
    it('バリデーションメッセージが適切な日本語形式で生成される', () => {
      // 必須フィールドエラーのテスト
      const requiredMessage = VALIDATION_MESSAGES.REQUIRED('ユーザー名');
      expect(requiredMessage).toBe('ユーザー名は必須です');
      expect(requiredMessage).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      
      // 文字数制限エラーのテスト
      const maxLengthMessage = VALIDATION_MESSAGES.MAX_LENGTH('説明', 100);
      expect(maxLengthMessage).toBe('説明は100文字以内で入力してください');
      expect(maxLengthMessage).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
    });

    it('APIエラーメッセージが適切な日本語形式で生成される', () => {
      // ネットワークエラーのテスト
      const networkError = MESSAGE_FORMATTER.ERROR_NETWORK();
      expect(networkError).toBe('接続に問題があります。しばらく待ってから再試行してください');
      expect(networkError).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      
      // 権限エラーのテスト
      const permissionError = MESSAGE_FORMATTER.ERROR_PERMISSION();
      expect(permissionError).toBe('この操作を実行する権限がありません');
      expect(permissionError).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
    });
  });
});