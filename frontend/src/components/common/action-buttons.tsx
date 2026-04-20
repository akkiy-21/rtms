import * as React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACTION_LABELS } from "@/localization/constants/action-labels";

interface CustomAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: React.ReactNode;
}

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  customActions?: CustomAction[];
}

/**
 * ActionButtons コンポーネント
 * 
 * テーブル内のアクションボタンを統一します。
 * 
 * @param onEdit - 編集ボタンのクリックハンドラー（オプション）
 * @param onDelete - 削除ボタンのクリックハンドラー（オプション）
 * @param onView - 表示ボタンのクリックハンドラー（オプション）
 * @param customActions - カスタムアクションの配列（オプション）
 * 
 * @example
 * ```tsx
 * <ActionButtons
 *   onEdit={() => navigate(`/users/${user.id}/edit`)}
 *   onDelete={() => handleDelete(user.id)}
 * />
 * ```
 */
export function ActionButtons({
  onEdit,
  onDelete,
  onView,
  customActions,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {onView && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          aria-label={ACTION_LABELS.VIEW}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label={ACTION_LABELS.EDIT}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={ACTION_LABELS.DELETE}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
      {customActions?.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "ghost"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
          }}
          aria-label={action.label}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
