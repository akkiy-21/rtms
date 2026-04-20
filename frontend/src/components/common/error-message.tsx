import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, ACTION_LABELS } from "@/localization/constants";

interface ErrorMessageProps {
  title?: string;
  message: string;
  retry?: () => void;
  retryLabel?: string;
}

/**
 * ErrorMessage コンポーネント
 * 
 * 統一されたエラー表示を提供します。
 * 翻訳定数を使用して一貫したエラーメッセージを表示します。
 * 
 * @param title - エラータイトル（デフォルト: STATUS_LABELS.ERROR）
 * @param message - エラーメッセージ
 * @param retry - 再試行ハンドラー（オプション）
 * @param retryLabel - 再試行ボタンのラベル（デフォルト: ACTION_LABELS.RETRY）
 * 
 * @example
 * ```tsx
 * <ErrorMessage
 *   title="データの読み込みに失敗しました"
 *   message="ネットワークエラーが発生しました"
 *   retry={() => refetch()}
 * />
 * ```
 * 
 * Requirements: 8.1, 8.2, 8.3
 */
export function ErrorMessage({
  title = STATUS_LABELS.ERROR,
  message,
  retry,
  retryLabel = ACTION_LABELS.RETRY,
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry} className="ml-4">
            {retryLabel}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
