// product-columns.tsx
// Productテーブルのカラム定義

import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { ProductWithCustomer } from '@/types/product';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { ActionButtons } from '@/components/common/action-buttons';
import { Badge } from '@/components/ui/badge';
import { PRODUCT_LABELS } from '@/localization/constants/product-labels';

export const useProductColumns = (
  onDelete: (id: number) => void
): ColumnDef<ProductWithCustomer>[] => {
  const navigate = useNavigate();

  return [
    {
      accessorKey: 'internal_product_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={PRODUCT_LABELS.TABLE.HEADERS.INTERNAL_PRODUCT_NUMBER} />
      ),
    },
    {
      accessorKey: 'customer_product_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={PRODUCT_LABELS.TABLE.HEADERS.CUSTOMER_PRODUCT_NUMBER} />
      ),
    },
    {
      accessorKey: 'product_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={PRODUCT_LABELS.TABLE.HEADERS.PRODUCT_NAME} />
      ),
    },
    {
      accessorKey: 'customer.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={PRODUCT_LABELS.TABLE.HEADERS.CUSTOMER_NAME} />
      ),
      cell: ({ row }) => {
        const customerName = row.original.customer.name;
        return <Badge variant="outline">{customerName}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <ActionButtons
            onEdit={() => navigate(`/products/${product.id}/edit`)}
            onDelete={() => onDelete(product.id)}
          />
        );
      },
    },
  ];
};
