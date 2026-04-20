// plc-columns.tsx
// PLCテーブルのカラム定義

import { ColumnDef } from '@tanstack/react-table';
import { PLCWithAddressRanges } from '@/types/plc';
import { ActionButtons } from '@/components/common/action-buttons';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { TECHNICAL_TERMS } from '@/localization/constants/technical-terms';
import { PLC_LABELS } from '@/localization/constants/plc-labels';

export const usePlcColumns = (): ColumnDef<PLCWithAddressRanges>[] => {
  const navigate = useNavigate();

  const handleEdit = (id: number) => {
    navigate(`/plcs/${id}/edit`);
  };

  return [
    {
      accessorKey: 'model',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={PLC_LABELS.MODEL} />
      ),
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue('model')}</div>;
      },
    },
    {
      accessorKey: 'manufacturer',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={PLC_LABELS.MANUFACTURER} />
      ),
      cell: ({ row }) => {
        const manufacturer = row.getValue('manufacturer') as string;
        return (
          <Badge variant="outline" className="font-normal">
            {manufacturer}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'protocol',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={PLC_LABELS.PROTOCOL} />
      ),
      cell: ({ row }) => {
        const protocol = row.getValue('protocol') as string;
        return (
          <Badge variant="secondary" className="font-normal">
            {protocol}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const plc = row.original;
        return (
          <ActionButtons
            onEdit={() => handleEdit(plc.id)}
            // onDeleteは親コンポーネントから渡される
          />
        );
      },
    },
  ];
};
