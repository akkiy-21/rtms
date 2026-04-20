import { renderHook } from '@testing-library/react';
import { useApiError } from '../use-api-error';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

// useToastをモック
const mockToast = jest.fn();
jest.mock('../use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('useApiError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleError', () => {
    it('Errorオブジェクトのメッセージを正しく処理する', () => {
      const { result } = renderHook(() => useApiError());
      const error = new Error('テストエラーメッセージ');
      
      result.current.handleError(error);
      
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'エラー',
        description: 'テストエラーメッセージ',
      });
    });

    it('ネットワークエラーを適切に処理する', () => {
      const { result } = renderHook(() => useApiError());
      const error = new Error('Network error occurred');
      
      result.current.handleError(error);
      
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'エラー',
        description: MESSAGE_FORMATTER.ERROR_NETWORK(),
      });
    });

    it('権限エラーを適切に処理する', () => {
      const { result } = renderHook(() => useApiError());
      const error = new Error('Unauthorized access');
      
      result.current.handleError(error);
      
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'エラー',
        description: MESSAGE_FORMATTER.ERROR_PERMISSION(),
      });
    });

    it('404エラーを適切に処理する', () => {
      const { result } = renderHook(() => useApiError());
      const error = new Error('Resource not found');
      
      result.current.handleError(error);
      
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'エラー',
        description: MESSAGE_FORMATTER.ERROR_NOT_FOUND('リソース'),
      });
    });

    it('文字列エラーを正しく処理する', () => {
      const { result } = renderHook(() => useApiError());
      const error = 'テスト文字列エラー';
      
      result.current.handleError(error);
      
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'エラー',
        description: 'テスト文字列エラー',
      });
    });

    it('不明なエラーを適切に処理する', () => {
      const { result } = renderHook(() => useApiError());
      const error = null;
      
      result.current.handleError(error);
      
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'エラー',
        description: MESSAGE_FORMATTER.ERROR_UNKNOWN(),
      });
    });

    it('カスタムタイトルを使用する', () => {
      const { result } = renderHook(() => useApiError());
      const error = new Error('テストエラー');
      const customTitle = 'カスタムエラータイトル';
      
      result.current.handleError(error, customTitle);
      
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: customTitle,
        description: 'テストエラー',
      });
    });
  });

  describe('handleApiError', () => {
    it('データ取得エラーを適切に処理する', () => {
      const { result } = renderHook(() => useApiError());
      const error = new Error('Data retrieval error');
      const entityName = 'ユーザー';
      
      result.current.handleApiError.fetch(entityName, error);
      
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: MESSAGE_FORMATTER.ERROR_FETCH(entityName),
        description: 'Data retrieval error',
      });
    });

    it('データ作成エラーを適切に処理する', () => {
      const { result } = renderHook(() => useApiError());
      const error = new Error('Create failed');
      const entityName = 'デバイス';
      
      result.current.handleApiError.create(entityName, error);
      
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: MESSAGE_FORMATTER.ERROR_CREATE(entityName),
        description: 'Create failed',
      });
    });

    it('ファイルアップロードエラーを適切に処理する', () => {
      const { result } = renderHook(() => useApiError());
      const error = new Error('Upload failed');
      
      result.current.handleApiError.upload(error);
      
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: MESSAGE_FORMATTER.ERROR_UPLOAD(),
        description: 'Upload failed',
      });
    });
  });
});