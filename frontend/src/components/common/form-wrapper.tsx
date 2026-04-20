import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ACTION_LABELS } from "@/localization/constants/action-labels";
import { MESSAGE_FORMATTER } from "@/localization/utils/message-formatter";

interface FormWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

/**
 * FormWrapper コンポーネント
 * 
 * すべてのフォームページで統一されたレイアウトを提供します。
 * 
 * @param title - フォームタイトル
 * @param description - フォームの説明（オプション）
 * @param children - フォームフィールド
 * @param onSubmit - フォーム送信ハンドラー
 * @param onCancel - キャンセルハンドラー（オプション）
 * @param submitLabel - 送信ボタンのラベル（デフォルト: "送信"）
 * @param cancelLabel - キャンセルボタンのラベル（デフォルト: "キャンセル"）
 * @param isLoading - ローディング状態
 * 
 * @example
 * ```tsx
 * <FormWrapper
 *   title="ユーザー作成"
 *   description="新しいユーザーを作成します"
 *   onSubmit={handleSubmit}
 *   onCancel={() => navigate(-1)}
 *   isLoading={isSubmitting}
 * >
 *   <FormField ... />
 * </FormWrapper>
 * ```
 */
export function FormWrapper({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitLabel = ACTION_LABELS.SUBMIT,
  cancelLabel = ACTION_LABELS.CANCEL,
  isLoading = false,
}: FormWrapperProps) {
  // onSubmitが提供されている場合はformタグでラップ、そうでない場合はdivでラップ
  const content = onSubmit ? (
    <form onSubmit={onSubmit} className="space-y-6">
      {children}
      <div className="flex gap-2 justify-end pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? MESSAGE_FORMATTER.SAVING() : submitLabel}
        </Button>
      </div>
    </form>
  ) : (
    <div className="space-y-6">
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="pt-6">
          {content}
        </CardContent>
      </Card>
    </div>
  );
}
