// ProductsPage.tsx
// 製品一覧ページ - shadcn/ui版

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/api';
import { ProductWithCustomer } from '../types/product';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { useProductColumns } from '@/components/features/products/product-columns';
import { useApiError } from '@/hooks/use-api-error';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { Plus } from 'lucide-react';
import { PRODUCT_LABELS } from '@/localization/constants/product-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { handleError } = useApiError();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : MESSAGE_FORMATTER.ERROR_FETCH(PRODUCT_LABELS.PRODUCTS);
      setError(errorMessage);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;

    try {
      await deleteProduct(deleteId);
      await fetchProducts();
      setDeleteId(null);
    } catch (err) {
      handleError(err);
    }
  };

  const columns = useProductColumns(handleDeleteClick);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={fetchProducts} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={PRODUCT_LABELS.PAGES.LIST}
        description={PRODUCT_LABELS.NAVIGATION.PRODUCT_MANAGEMENT}
        actions={
          <Button onClick={() => navigate('/products/create')}>
            <Plus className="mr-2 h-4 w-4" />
            {ACTION_LABELS.CREATE_NEW}{PRODUCT_LABELS.PRODUCT}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={products}
        searchKey="product_name"
        searchPlaceholder={PRODUCT_LABELS.PLACEHOLDERS.SEARCH}
      />
      <ConfirmationDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title={PRODUCT_LABELS.ACTIONS.DELETE_PRODUCT}
        description={MESSAGE_FORMATTER.CONFIRM_DELETE(PRODUCT_LABELS.PRODUCT)}
      />
    </div>
  );
};

export default ProductsPage;