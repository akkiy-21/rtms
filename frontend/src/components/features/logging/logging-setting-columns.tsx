// src/components/features/logging/logging-setting-columns.tsx

import { ColumnDef } from '@tanstack/react-table';
import { LoggingSetting } from '@/types/logging';
import { Client } from '@/types/client';
import { Badge } from '@/components/ui/badge';
import { ActionButtons } from '@/components/common/action-buttons';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { LOGGING_LABELS } from '@/localization/constants/logging-labels';

interface LoggingSettingColumnsProps {
  clients: Client[];
  deviceId: number;
  onEdit: (setting: LoggingSetting) => void;
  onDelete: (setting: LoggingSetting) => void;
  onViewData: (setting: LoggingSetting) => void;
}

export const createLoggingSettingColumns = ({
  clients,
  deviceId,
  onEdit,
  onDelete,
  onViewData,
}: LoggingSettingColumnsProps): ColumnDef<LoggingSetting>[] => {
  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : '不明';
  };

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
      accessorKey: 'logging_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={LOGGING_LABELS.TABLE.HEADERS.LOGGING_NAME} />
      ),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={LOGGING_LABELS.TABLE.HEADERS.DESCRIPTION} />
      ),
      cell: ({ row }) => {
        const description = row.getValue('description') as string;
        return <div className="max-w-[200px] truncate">{description || '-'}</div>;
      },
    },
    {
      accessorKey: 'client_id',
      header: LOGGING_LABELS.TABLE.HEADERS.CLIENT,
      cell: ({ row }) => {
        const clientId = row.getValue('client_id') as number;
        return <div>{getClientName(clientId)}</div>;
      },
    },
    {
      accessorKey: 'address_type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={LOGGING_LABELS.TABLE.HEADERS.ADDRESS_TYPE} />
      ),
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={LOGGING_LABELS.TABLE.HEADERS.ADDRESS} />
      ),
    },
    {
      accessorKey: 'is_rising',
      header: LOGGING_LABELS.TABLE.HEADERS.IS_RISING,
      cell: ({ row }) => {
        const isRising = row.getValue('is_rising') as boolean;
        return (
          <Badge variant={isRising ? 'default' : 'secondary'}>
            {isRising ? LOGGING_LABELS.STATUS.TRUE : LOGGING_LABELS.STATUS.FALSE}
          </Badge>
        );
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
            customActions={[
              {
                label: LOGGING_LABELS.ACTIONS.VIEW_DATA_SETTINGS,
                onClick: () => onViewData(setting),
                variant: 'outline',
              },
            ]}
          />
        );
      },
    },
  ];
};