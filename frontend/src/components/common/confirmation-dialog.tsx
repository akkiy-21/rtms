import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ACTION_LABELS } from "@/localization/constants/action-labels";
import { MESSAGE_FORMATTER } from "@/localization/utils/message-formatter";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

/**
 * ConfirmationDialog コンポーネント
 * 
 * 削除確認などの確認ダイアログを提供します。
 * 
 * @param open - ダイアログの開閉状態
 * @param onOpenChange - ダイアログの開閉状態を変更するハンドラー
 * @param title - ダイアログタイトル（デフォルト: ACTION_LABELS.CONFIRM）
 * @param description - ダイアログの説明
 * @param confirmLabel - 確認ボタンのラベル（デフォルト: ACTION_LABELS.CONFIRM）
 * @param cancelLabel - キャンセルボタンのラベル（デフォルト: ACTION_LABELS.CANCEL）
 * @param onConfirm - 確認ボタンのクリックハンドラー
 * @param onCancel - キャンセルボタンのクリックハンドラー（オプション）
 * @param variant - ダイアログのバリアント（デフォルト: "default"）
 * @param isLoading - ローディング状態
 * 
 * @example
 * ```tsx
 * <ConfirmationDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="削除の確認"
 *   description={MESSAGE_FORMATTER.CONFIRM_DELETE("ユーザー")}
 *   confirmLabel={ACTION_LABELS.DELETE}
 *   variant="destructive"
 *   onConfirm={handleDelete}
 * />
 * ```
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title = ACTION_LABELS.CONFIRM,
  description,
  confirmLabel = ACTION_LABELS.CONFIRM,
  cancelLabel = ACTION_LABELS.CANCEL,
  onConfirm,
  onCancel,
  variant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            {variant === "destructive" && (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            {description || "この操作を実行してもよろしいですか？"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? MESSAGE_FORMATTER.PROCESSING() : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
