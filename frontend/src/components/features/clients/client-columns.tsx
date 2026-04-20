// client-columns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { Client } from '@/types/client';
import { ActionButtons } from '@/components/common/action-buttons';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { Badge } from '@/components/ui/badge';

interface ClientColumnsProps {
  deviceId: number;
  onEdit: (clientId: number) => void;
  onDelete: (clientId: number) => void;
}

export const createClientColumns = ({
  deviceId,
  onEdit,
  onDelete,
}: ClientColumnsProps): ColumnDef<Client>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: 'ip_address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IP Address" />
    ),
  },
  {
    accessorKey: 'port_no',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Port" />
    ),
  },
  {
    id: 'plc',
    header: 'PLC',
    cell: ({ row }) => {
      const client = row.original;
      return (
        <Badge variant="outline">
          {client.plc.model} ({client.plc.manufacturer})
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const client = row.original;
      return (
        <ActionButtons
          onEdit={() => onEdit(client.id)}
          onDelete={() => onDelete(client.id)}
        />
      );
    },
  },
];
