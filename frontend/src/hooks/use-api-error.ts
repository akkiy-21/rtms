import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { MESSAGE_FORMATTER } from "@/localization/utils/message-formatter";
import { ACTION_LABELS } from "@/localization/constants/action-labels";

/**
 * APIエラーハンドリングフック
 * 
 * APIエラーを統一された方法で処理し、トースト通知を表示します。
 * 翻訳定数を使用して一貫した日本語エラーメッセージを提供します。
 * 
 * @example
 * ```tsx
 * const { handleError } = useApiError();
 * 
 * try {
 *   await api.createUser(data);
 * } catch (error) {
 *   handleError(error);
 * }
 * ```
 */
export function useApiError() {
  const { toast } = useToast();

  /**
   * エラーの種類を判定してメッセージを生成
   * 
   * @param error - 処理するエラー
   * @returns 適切な日本語エラーメッセージ
   */
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // タイムアウトエラーの判定（ネットワークエラーより先に判定）
      if (errorMessage.includes('timeout')) {
        return MESSAGE_FORMATTER.ERROR_TIMEOUT();
      }
      
      // ネットワークエラーの判定
      if (errorMessage.includes('network') || 
          errorMessage.includes('fetch') || 
          errorMessage.includes('connection')) {
        return MESSAGE_FORMATTER.ERROR_NETWORK();
      }
      
      // 権限エラーの判定
      if (errorMessage.includes('unauthorized') || 
          errorMessage.includes('forbidden') || 
          errorMessage.includes('permission')) {
        return MESSAGE_FORMATTER.ERROR_PERMISSION();
      }
      
      // 404エラーの判定
      if (errorMessage.includes('not found') || 
          errorMessage.includes('404')) {
        return MESSAGE_FORMATTER.ERROR_NOT_FOUND('リソース');
      }
      
      // サーバーエラーの判定
      if (errorMessage.includes('server error') || 
          errorMessage.includes('internal server') || 
          errorMessage.includes('500')) {
        return MESSAGE_FORMATTER.ERROR_SERVER();
      }
      

      
      // ファイル関連エラーの判定
      if (errorMessage.includes('file format') || 
          errorMessage.includes('invalid format')) {
        return MESSAGE_FORMATTER.ERROR_FILE_FORMAT();
      }
      
      if (errorMessage.includes('file size') || 
          errorMessage.includes('too large')) {
        return MESSAGE_FORMATTER.ERROR_FILE_SIZE();
      }
      
      // 無効なデータエラーの判定
      if (errorMessage.includes('invalid') || 
          errorMessage.includes('validation')) {
        return MESSAGE_FORMATTER.ERROR_INVALID_DATA();
      }
      
      // その他のエラーメッセージをそのまま使用（既に日本語の場合）
      return error.message;
    }
    
    if (typeof error === "string") {
      return error;
    }
    
    if (error && typeof error === "object" && "message" in error) {
      return String(error.message);
    }
    
    // 不明なエラーの場合
    return MESSAGE_FORMATTER.ERROR_UNKNOWN();
  };

  /**
   * エラーを処理してトースト通知を表示
   * 
   * @param error - 処理するエラー（Error型または任意の型）
   * @param customTitle - カスタムエラータイトル（オプション）
   */
  const handleError = useCallback((error: unknown, customTitle?: string) => {
    const message = getErrorMessage(error);
    
    // トースト通知を表示
    toast({
      variant: "destructive",
      title: customTitle || "エラー",
      description: message,
    });
  }, [toast]);

  /**
   * 特定のAPIエラーを処理する便利メソッド
   */
  const handleApiError = {
    /**
     * データ取得エラーを処理
     * @param entityName - エンティティ名
     * @param error - エラー
     */
    fetch: (entityName: string, error: unknown) => {
      handleError(error, MESSAGE_FORMATTER.ERROR_FETCH(entityName));
    },
    
    /**
     * データ作成エラーを処理
     * @param entityName - エンティティ名
     * @param error - エラー
     */
    create: (entityName: string, error: unknown) => {
      handleError(error, MESSAGE_FORMATTER.ERROR_CREATE(entityName));
    },
    
    /**
     * データ更新エラーを処理
     * @param entityName - エンティティ名
     * @param error - エラー
     */
    update: (entityName: string, error: unknown) => {
      handleError(error, MESSAGE_FORMATTER.ERROR_UPDATE(entityName));
    },
    
    /**
     * データ削除エラーを処理
     * @param entityName - エンティティ名
     * @param error - エラー
     */
    delete: (entityName: string, error: unknown) => {
      handleError(error, MESSAGE_FORMATTER.ERROR_DELETE(entityName));
    },
    
    /**
     * ファイルアップロードエラーを処理
     * @param error - エラー
     */
    upload: (error: unknown) => {
      handleError(error, MESSAGE_FORMATTER.ERROR_UPLOAD());
    },
    
    /**
     * ファイルダウンロードエラーを処理
     * @param error - エラー
     */
    download: (error: unknown) => {
      handleError(error, MESSAGE_FORMATTER.ERROR_DOWNLOAD());
    },
    
    /**
     * インポートエラーを処理
     * @param entityName - エンティティ名
     * @param error - エラー
     */
    import: (entityName: string, error: unknown) => {
      handleError(error, MESSAGE_FORMATTER.ERROR_IMPORT(entityName));
    },
    
    /**
     * エクスポートエラーを処理
     * @param entityName - エンティティ名
     * @param error - エラー
     */
    export: (entityName: string, error: unknown) => {
      handleError(error, MESSAGE_FORMATTER.ERROR_EXPORT(entityName));
    },
  };

  return { 
    handleError,
    handleApiError,
  };
}
