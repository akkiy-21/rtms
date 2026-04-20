// Classification テーブルのカラム定義
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Classification } from '@/types/classification';
import { ActionButtons } from '@/components/common/action-buttons';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { TECHNICAL_TERMS } from '@/localization/constants/technical-terms';
import { CLASSIFICATION_LABELS } from '@/localization/constants/classification-labels';
import { TABLE_LABELS } from '@/localization/constants/table-labels';

export const useClassificationColumns = (
  onDelete: (id: number) => void
): ColumnDef<Classification>[] => {
  const navigate = useNavigate();

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={CLASSIFICATION_LABELS.TABLE.HEADERS.NAME} />
      ),
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue('name')}</div>;
      },
    },
    {
      accessorKey: 'group',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={CLASSIFICATION_LABELS.TABLE.HEADERS.GROUP} />
      ),
      cell: ({ row }) => {
        const group = row.original.group;
        return (
          <Badge variant="outline" className="font-normal">
            {group.name}
          </Badge>
        );
      },
      // グループ名でソートできるようにする
      sortingFn: (rowA, rowB) => {
        const groupA = rowA.original.group.name;
        const groupB = rowB.original.group.name;
        return groupA.localeCompare(groupB);
      },
    },
    {
      id: 'actions',
      header: TABLE_LABELS.ACTIONS,
      cell: ({ row }) => {
        const classification = row.original;
        return (
          <ActionButtons
            onEdit={() => navigate(`/classifications/${classification.id}/edit`)}
            onDelete={() => onDelete(classification.id)}
          />
        );
      },
    },
  ];
};
