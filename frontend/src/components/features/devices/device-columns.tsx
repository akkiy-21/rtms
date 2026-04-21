// device-columns.tsx
// デバイス一覧テーブルのカラム定義

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Device } from '@/types/device';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { ActionButtons } from '@/components/common/action-buttons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Settings } from 'lucide-react';
import { DEVICE_LABELS } from '@/localization/constants/device-labels';
import { TECHNICAL_TERMS } from '@/localization/constants/technical-terms';

const PasswordCell: React.FC<{ password: string | null }> = ({ password }) => {
  const [visible, setVisible] = React.useState(false);

  if (!password) {
    return <span>-</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span>{visible ? password : '••••••••'}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? DEVICE_LABELS.ACTIONS.HIDE_PASSWORD : DEVICE_LABELS.ACTIONS.SHOW_PASSWORD}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
};

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
      accessorKey: 'device_status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={DEVICE_LABELS.TABLE.HEADERS.STATUS} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('device_status') as Device['device_status'];
        return <Badge variant={value === 'draft' ? 'outline' : 'secondary'}>{value === 'draft' ? DEVICE_LABELS.STATUS.DRAFT : DEVICE_LABELS.STATUS.ACTIVE}</Badge>;
      },
    },
    {
      accessorKey: 'last_known_ip_address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={DEVICE_LABELS.TABLE.HEADERS.LAST_KNOWN_IP_ADDRESS} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('last_known_ip_address') as string | null;
        return value || '-';
      },
    },
    {
      accessorKey: 'ssh_username',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={DEVICE_LABELS.TABLE.HEADERS.SSH_USERNAME} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('ssh_username') as string | null;
        return value || '-';
      },
    },
    {
      accessorKey: 'ssh_password',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={DEVICE_LABELS.TABLE.HEADERS.SSH_PASSWORD} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('ssh_password') as string | null;
        return <PasswordCell password={value} />;
      },
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
      id: 'actions',
      cell: ({ row }) => {
        const device = row.original;
        
        return (
          <ActionButtons
            onEdit={() => onEdit(device.id)}
            onDelete={() => onDelete(device.id)}
            customActions={device.device_status === 'active' ? [
              {
                label: DEVICE_LABELS.ACTIONS.DETAIL_SETTINGS,
                onClick: () => onDetailSettings(device.id),
                variant: 'ghost',
                icon: <Settings className="h-4 w-4" />,
              },
            ] : []}
          />
        );
      },
    },
  ];
};
