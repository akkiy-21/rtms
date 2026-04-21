import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { ActionButtons } from "@/components/common/action-buttons";
import { DataTableColumnHeader } from "@/components/common/data-table-column-header";
import { USER_LABELS } from "@/localization/constants/user-labels";
import { TECHNICAL_TERMS } from "@/localization/constants/technical-terms";

/**
 * ユーザーテーブルのカラム定義を作成する関数
 * 
 * @param onEdit - 編集ボタンのクリックハンドラー
 * @param onDelete - 削除ボタンのクリックハンドラー
 * @returns ColumnDef配列
 */
export const createUserColumns = (
  onEdit: (userId: string) => void,
  onDelete: (userId: string) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={TECHNICAL_TERMS.ID} />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={USER_LABELS.TABLE.HEADERS.NAME} />
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "role",
    header: USER_LABELS.TABLE.HEADERS.ROLE,
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleColors: Record<string, "default" | "secondary" | "outline"> = {
        AD: "secondary",
        CU: "outline",
      };
      return (
        <Badge variant={roleColors[role] || "outline"}>
          {USER_LABELS.ROLES[role as keyof typeof USER_LABELS.ROLES] || role}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: USER_LABELS.TABLE.HEADERS.ACTIONS,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <ActionButtons
          onEdit={() => onEdit(user.id)}
          onDelete={() => onDelete(user.id)}
        />
      );
    },
  },
];
