// alarm-group-columns.tsx
// AlarmGroupテーブルのカラム定義

import { ColumnDef } from '@tanstack/react-table';
import { AlarmGroup } from '@/types/alarm';
import { Client } from '@/types/client';
import { ActionButtons } from '@/components/common/action-buttons';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { ALARM_LABELS } from '@/localization/constants/alarm-labels';
import { TABLE_LABELS } from '@/localization/constants/table-labels';

interface AlarmGroupColumnsProps {
  deviceId: number;
  clients: Client[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onViewAddresses: (id: number) => void;
}

export const createAlarmGroupColumns = ({
  deviceId,
  clients,
  onDelete,
  onEdit,
  onViewAddresses,
}: AlarmGroupColumnsProps): ColumnDef<AlarmGroup>[] => {
  // クライアント名を取得するヘルパー関数
  const getClientName = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : '不明';
  };

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={ALARM_LABELS.TABLE.HEADERS.GROUP_NAME} />
      ),
    },
    {
      accessorKey: 'client_id',
      header: ALARM_LABELS.TABLE.HEADERS.CLIENT,
      cell: ({ row }) => {
        const clientId = row.getValue('client_id') as number;
        return <span>{getClientName(clientId)}</span>;
      },
    },
    {
      id: 'actions',
      header: TABLE_LABELS.ACTIONS,
      cell: ({ row }) => {
        const alarmGroup = row.original;
        return (
          <div className="flex items-center gap-2">
            <ActionButtons
              onEdit={() => onEdit(alarmGroup.id)}
              onDelete={() => onDelete(alarmGroup.id)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewAddresses(alarmGroup.id)}
            >
              <MapPin className="h-4 w-4 mr-1" />
              {ALARM_LABELS.ACTIONS.VIEW_ADDRESSES}
            </Button>
          </div>
        );
      },
    },
  ];
};
