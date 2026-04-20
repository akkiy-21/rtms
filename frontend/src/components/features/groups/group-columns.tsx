import { ColumnDef } from '@tanstack/react-table';
import { Group } from '@/types/group';
import { ActionButtons } from '@/components/common/action-buttons';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { GROUP_LABELS } from '@/localization/constants/group-labels';
import { TECHNICAL_TERMS } from '@/localization/constants/technical-terms';

/**
 * グループテーブルのカラム定義を作成する関数
 * 
 * @param onEdit - 編集ボタンのクリックハンドラー
 * @param onDelete - 削除ボタンのクリックハンドラー
 * @param onViewUsers - ユーザー表示ボタンのクリックハンドラー
 * @returns ColumnDef配列
 */
export const createGroupColumns = (
  onEdit: (id: number) => void,
  onDelete: (id: number) => void,
  onViewUsers: (id: number) => void
): ColumnDef<Group>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={GROUP_LABELS.TABLE.HEADERS.NAME} />
    ),
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    id: 'actions',
    header: GROUP_LABELS.TABLE.HEADERS.ACTIONS,
    cell: ({ row }) => {
      const group = row.original;

      return (
        <ActionButtons
          onEdit={() => onEdit(group.id)}
          onDelete={() => onDelete(group.id)}
          customActions={[
            {
              label: GROUP_LABELS.FIELDS.MEMBERS,
              onClick: () => onViewUsers(group.id),
              variant: 'outline',
            },
          ]}
        />
      );
    },
  },
];
