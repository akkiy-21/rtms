// src/components/features/logging/logging-data-setting-columns.tsx

import { ColumnDef } from '@tanstack/react-table';
import { LoggingDataSetting } from '@/types/logging';
import { Badge } from '@/components/ui/badge';
import { ActionButtons } from '@/components/common/action-buttons';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { LOGGING_LABELS } from '@/localization/constants/logging-labels';

interface LoggingDataSettingColumnsProps {
  deviceId: number;
  loggingSettingId: number;
  onEdit: (setting: LoggingDataSetting) => void;
  onDelete: (setting: LoggingDataSetting) => void;
}

export const createLoggingDataSettingColumns = ({
  deviceId,
  loggingSettingId,
  onEdit,
  onDelete,
}: LoggingDataSettingColumnsProps): ColumnDef<LoggingDataSetting>[] => {
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={LOGGING_LABELS.TABLE.HEADERS.NO} />
      ),
      cell: ({ row }) => {
        return <div className="w-[50px]">{row.index + 1}</div>;
      },
    },
    {
      accessorKey: 'data_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={LOGGING_LABELS.TABLE.HEADERS.DATA_NAME} />
      ),
    },
    {
      accessorKey: 'address_type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={LOGGING_LABELS.TABLE.HEADERS.ADDRESS_TYPE} />
      ),
      cell: ({ row }) => {
        const addressType = row.getValue('address_type') as string;
        return <Badge variant="outline">{addressType}</Badge>;
      },
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={LOGGING_LABELS.TABLE.HEADERS.ADDRESS} />
      ),
    },
    {
      accessorKey: 'address_count',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={LOGGING_LABELS.TABLE.HEADERS.ADDRESS_COUNT} />
      ),
      cell: ({ row }) => {
        const count = row.getValue('address_count') as number;
        return <div className="text-center">{count}</div>;
      },
    },
    {
      accessorKey: 'data_type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={LOGGING_LABELS.TABLE.HEADERS.DATA_TYPE} />
      ),
      cell: ({ row }) => {
        const dataType = row.getValue('data_type') as string;
        // データタイプの翻訳を適用（技術用語なので英語のまま）
        return <Badge variant="secondary">{dataType}</Badge>;
      },
    },
    {
      id: 'actions',
      header: LOGGING_LABELS.TABLE.HEADERS.ACTIONS,
      cell: ({ row }) => {
        const setting = row.original;
        return (
          <ActionButtons
            onEdit={() => onEdit(setting)}
            onDelete={() => onDelete(setting)}
          />
        );
      },
    },
  ];
};