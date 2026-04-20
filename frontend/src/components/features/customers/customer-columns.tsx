// customer-columns.tsx
// Customerテーブルのカラム定義

import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Customer } from '@/types/customer';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { ActionButtons } from '@/components/common/action-buttons';
import { CUSTOMER_LABELS } from '@/localization/constants/customer-labels';

export const useCustomerColumns = (
  onDelete: (id: number) => void
): ColumnDef<Customer>[] => {
  const navigate = useNavigate();

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={CUSTOMER_LABELS.TABLE.HEADERS.NAME} />
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <ActionButtons
            onEdit={() => navigate(`/customers/${customer.id}/edit`)}
            onDelete={() => onDelete(customer.id)}
          />
        );
      },
    },
  ];
};
