// device-columns.tsx
// デバイス一覧テーブルのカラム定義

import { ColumnDef } from '@tanstack/react-table';
import { Device } from '@/types/device';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { ActionButtons } from '@/components/common/action-buttons';
import { Settings } from 'lucide-react';
import { DEVICE_LABELS } from '@/localization/constants/device-labels';
import { TECHNICAL_TERMS } from '@/localization/constants/technical-terms';

export const createDeviceColumns = (
  onEdit: (id: number) => void,
  onDelete: (id: number) => void,
  onDetailSettings: (id: number) => void
): ColumnDef<Device>[] => {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={DEVICE_LABELS.TABLE.HEADERS.NAME} />
      ),
    },
    {
      accessorKey: 'mac_address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={TECHNICAL_TERMS.MAC_ADDRESS} />
      ),
    },
    {
      accessorKey: 'standard_cycle_time',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={DEVICE_LABELS.TABLE.HEADERS.STANDARD_CYCLE_TIME} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('standard_cycle_time') as number | null;
        return value !== null ? value : '-';
      },
    },
    {
      accessorKey: 'planned_production_quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={DEVICE_LABELS.TABLE.HEADERS.PLANNED_PRODUCTION_QUANTITY} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('planned_production_quantity') as number | null;
        return value !== null ? value : '-';
      },
    },
    {
      accessorKey: 'planned_production_time',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={DEVICE_LABELS.TABLE.HEADERS.PLANNED_PRODUCTION_TIME} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('planned_production_time') as number | null;
        return value !== null ? value : '-';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const device = row.original;
        
        return (
          <ActionButtons
            onEdit={() => onEdit(device.id)}
            onDelete={() => onDelete(device.id)}
            customActions={[
              {
                label: DEVICE_LABELS.ACTIONS.DETAIL_SETTINGS,
                onClick: () => onDetailSettings(device.id),
                variant: 'ghost',
                icon: <Settings className="h-4 w-4" />,
              },
            ]}
          />
        );
      },
    },
  ];
};
