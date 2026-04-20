import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClassifications, deleteClassification } from '../services/api';
import { Classification } from '../types/classification';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useClassificationColumns } from '@/components/features/classifications/classification-columns';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { CLASSIFICATION_LABELS } from '@/localization/constants/classification-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';

const ClassificationsPage: React.FC = () => {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchClassifications();
  }, []);

  const fetchClassifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedClassifications = await getClassifications();
      setClassifications(fetchedClassifications);
    } catch (err) {
      setError(CLASSIFICATION_LABELS.ERRORS.FETCH_FAILED);
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: CLASSIFICATION_LABELS.ERRORS.FETCH_FAILED,
      });
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
      await deleteClassification(deleteId);
      toast({
        title: '成功',
        description: CLASSIFICATION_LABELS.MESSAGES.DELETE_SUCCESS,
      });
      fetchClassifications();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: CLASSIFICATION_LABELS.ERRORS.DELETE_FAILED,
      });
    } finally {
      setDeleteId(null);
    }
  };

  const columns = useClassificationColumns(handleDeleteClick);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={fetchClassifications} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={CLASSIFICATION_LABELS.PAGES.LIST}
        description={CLASSIFICATION_LABELS.PAGE_DESCRIPTIONS.LIST}
        actions={
          <Button onClick={() => navigate('/classifications/create')}>
            <Plus className="mr-2 h-4 w-4" />
            {ACTION_LABELS.CREATE_NEW}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={classifications}
        searchKey="name"
        searchPlaceholder={CLASSIFICATION_LABELS.PLACEHOLDERS.SEARCH}
      />
      <ConfirmationDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title={`${CLASSIFICATION_LABELS.CLASSIFICATION}を${ACTION_LABELS.DELETE}`}
        description={CLASSIFICATION_LABELS.CONFIRMATIONS.DELETE_CLASSIFICATION}
      />
    </div>
  );
};

export default ClassificationsPage;