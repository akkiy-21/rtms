// src/components/features/efficiency/efficiency-address-columns.tsx

import { ColumnDef } from '@tanstack/react-table';
import { EfficiencyAddress } from '@/types/efficiency';
import { Client } from '@/types/client';
import { Classification } from '@/types/classification';
import { ActionButtons } from '@/components/common/action-buttons';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { SETTINGS_LABELS } from '@/localization/constants/settings-labels';
import { CLASSIFICATION_LABELS } from '@/localization/constants/classification-labels';
import { TABLE_LABELS } from '@/localization/constants/table-labels';

interface EfficiencyAddressColumnsProps {
  clients: Client[];
  classifications: Classification[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const createEfficiencyAddressColumns = ({
  clients,
  classifications,
  onEdit,
  onDelete,
}: EfficiencyAddressColumnsProps): ColumnDef<EfficiencyAddress>[] => [
  {
    accessorKey: 'client_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="クライアント" />
    ),
    cell: ({ row }) => {
      const clientId = row.getValue('client_id') as number;
      const client = clients.find(c => c.id === clientId);
      return client ? client.name : SETTINGS_LABELS.UNKNOWN;
    },
  },
  {
    accessorKey: 'address_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="アドレスタイプ" />
    ),
    cell: ({ row }) => {
      const addressType = row.getValue('address_type') as string;
      return <Badge variant="outline">{addressType}</Badge>;
    },
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="アドレス" />
    ),
  },
  {
    accessorKey: 'classification_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={CLASSIFICATION_LABELS.CLASSIFICATION} />
    ),
    cell: ({ row }) => {
      const classificationId = row.getValue('classification_id') as number;
      const classification = classifications.find(c => c.id === classificationId);
      return classification ? classification.name : SETTINGS_LABELS.UNKNOWN;
    },
  },
  {
    id: 'actions',
    header: TABLE_LABELS.ACTIONS,
    cell: ({ row }) => {
      const efficiencyAddress = row.original;
      return (
        <ActionButtons
          onEdit={() => onEdit(efficiencyAddress.id)}
          onDelete={() => onDelete(efficiencyAddress.id)}
        />
      );
    },
  },
];