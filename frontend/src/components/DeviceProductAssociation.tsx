// src/components/DeviceProductAssociation.tsx

import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './common/data-table';
import { DataTableColumnHeader } from './common/data-table-column-header';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import { Trash2, Plus } from 'lucide-react';
import { DeviceProductAssociation as DeviceProductAssociationType } from '../types/deviceProductAssociation';

interface DeviceProductAssociationProps {
  products: DeviceProductAssociationType[];
  availableProducts: DeviceProductAssociationType[];
  onRemoveProduct: (productId: number) => void;
  onAddProducts: (productIds: number[]) => void;
}

const DeviceProductAssociation: React.FC<DeviceProductAssociationProps> = ({ 
  products, 
  availableProducts,
  onRemoveProduct, 
  onAddProducts,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  // 利用可能な製品から既に登録されている製品を除外
  const filteredAvailableProducts = useMemo(() => {
    const registeredProductIds = new Set(products.map(p => p.product_id));
    return availableProducts.filter(p => !registeredProductIds.has(p.product_id));
  }, [products, availableProducts]);

  const handleClickOpen = () => {
    setOpen(true);
    setSelectedProducts([]);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProducts([]);
  };

  const handleAdd = () => {
    onAddProducts(selectedProducts);
    setOpen(false);
    setSelectedProducts([]);
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    setSelectedProducts(prev => 
      checked
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredAvailableProducts.map(p => p.product_id));
    } else {
      setSelectedProducts([]);
    }
  };

  // 登録済み製品のカラム定義
  const columns: ColumnDef<DeviceProductAssociationType>[] = [
    {
      accessorKey: 'internal_product_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Internal Product Number" />
      ),
    },
    {
      accessorKey: 'customer_product_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer Product Number" />
      ),
    },
    {
      accessorKey: 'product_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Name" />
      ),
    },
    {
      accessorKey: 'customer_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer Name" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('customer_name')}</Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveProduct(product.product_id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        );
      },
    },
  ];

  // 利用可能な製品のカラム定義
  const availableColumns: ColumnDef<DeviceProductAssociationType>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            filteredAvailableProducts.length > 0 &&
            selectedProducts.length === filteredAvailableProducts.length
          }
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedProducts.includes(row.original.product_id)}
          onCheckedChange={(checked) => handleSelectProduct(row.original.product_id, !!checked)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'internal_product_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Internal Product Number" />
      ),
    },
    {
      accessorKey: 'customer_product_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer Product Number" />
      ),
    },
    {
      accessorKey: 'product_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Name" />
      ),
    },
    {
      accessorKey: 'customer_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer Name" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('customer_name')}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Associated Products</h3>
                <p className="text-sm text-muted-foreground">
                  Products currently associated with this device
                </p>
              </div>
              <Button onClick={handleClickOpen}>
                <Plus className="mr-2 h-4 w-4" />
                Add Products
              </Button>
            </div>
            <DataTable
              columns={columns}
              data={products}
              searchKey="product_name"
              searchPlaceholder="Search products..."
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Products</DialogTitle>
            <DialogDescription>
              Select products to associate with this device. You can select multiple products.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <DataTable
              columns={availableColumns}
              data={filteredAvailableProducts}
              searchKey="product_name"
              searchPlaceholder="Search available products..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={selectedProducts.length === 0}>
              Add Selected ({selectedProducts.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeviceProductAssociation;
