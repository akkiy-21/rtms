// CustomersPage.tsx
// 顧客一覧ページ - shadcn/ui版

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers, deleteCustomer } from '../services/api';
import { Customer } from '../types/customer';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { useCustomerColumns } from '@/components/features/customers/customer-columns';
import { useApiError } from '@/hooks/use-api-error';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { Plus } from 'lucide-react';
import { CUSTOMER_LABELS } from '@/localization/constants/customer-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { handleError } = useApiError();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCustomers = await getCustomers();
      setCustomers(fetchedCustomers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : MESSAGE_FORMATTER.ERROR_FETCH(CUSTOMER_LABELS.CUSTOMERS);
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
      await deleteCustomer(deleteId);
      await fetchCustomers();
      setDeleteId(null);
    } catch (err) {
      handleError(err);
    }
  };

  const columns = useCustomerColumns(handleDeleteClick);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={fetchCustomers} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={CUSTOMER_LABELS.PAGES.LIST}
        description={CUSTOMER_LABELS.NAVIGATION.CUSTOMER_MANAGEMENT}
        actions={
          <Button onClick={() => navigate('/customers/create')}>
            <Plus className="mr-2 h-4 w-4" />
            {ACTION_LABELS.CREATE_NEW}{CUSTOMER_LABELS.CUSTOMER}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder={CUSTOMER_LABELS.PLACEHOLDERS.SEARCH}
      />
      <ConfirmationDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title={CUSTOMER_LABELS.ACTIONS.DELETE_CUSTOMER}
        description={MESSAGE_FORMATTER.CONFIRM_DELETE(CUSTOMER_LABELS.CUSTOMER)}
      />
    </div>
  );
};

export default CustomersPage;