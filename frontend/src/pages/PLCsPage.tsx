// PLCsPage.tsx
// PLCの一覧ページ - shadcn/uiに移行済み

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePlcColumns } from '@/components/features/plcs/plc-columns';
import { getPLCs, deletePLC } from '@/services/api';
import { PLCWithAddressRanges } from '@/types/plc';
import { useApiError } from '@/hooks/use-api-error';
import { Plus, AlertTriangle } from 'lucide-react';
import { PLC_LABELS } from '@/localization/constants/plc-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';

const PLCsPage: React.FC = () => {
  const [plcs, setPlcs] = useState<PLCWithAddressRanges[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openWarning, setOpenWarning] = useState(false);
  const navigate = useNavigate();
  const { handleError } = useApiError();

  const fetchPLCs = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPLCs = await getPLCs();
      setPlcs(fetchedPLCs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PLCの取得に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPLCs();
    
    // 警告ダイアログの表示チェック
    const warningShown = sessionStorage.getItem('plcWarningShown');
    if (!warningShown) {
      setOpenWarning(true);
    }
  }, []); // 初回マウント時のみ実行

  const handleDelete = async (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      await deletePLC(deleteId);
      await fetchPLCs();
      setDeleteId(null);
    } catch (err) {
      handleError(err);
    }
  };

  const handleCloseWarning = () => {
    setOpenWarning(false);
    sessionStorage.setItem('plcWarningShown', 'true');
  };

  // カラム定義を取得し、削除ハンドラーを追加
  const baseColumns = usePlcColumns();
  const columns = baseColumns.map((col) => {
    if (col.id === 'actions') {
      return {
        ...col,
        cell: ({ row }: any) => {
          const plc = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/plcs/${plc.id}/edit`)}
              >
                {ACTION_LABELS.EDIT}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(plc.id)}
                className="text-destructive hover:text-destructive"
              >
                {ACTION_LABELS.DELETE}
              </Button>
            </div>
          );
        },
      };
    }
    return col;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={PLC_LABELS.PLCS} description={PLC_LABELS.PLC_MANAGEMENT} />
        <ErrorMessage message={error} retry={fetchPLCs} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={PLC_LABELS.PLCS}
        description={PLC_LABELS.MANAGE_PLC_CONFIGURATIONS}
        actions={
          <Button onClick={() => navigate('/plcs/create')}>
            <Plus className="mr-2 h-4 w-4" />
            {PLC_LABELS.CREATE_NEW_PLC}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={plcs}
        searchKey="model"
        searchPlaceholder={PLC_LABELS.SEARCH_BY_MODEL}
      />

      <ConfirmationDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        title={PLC_LABELS.DELETE_PLC}
        description={PLC_LABELS.DELETE_PLC_CONFIRMATION}
      />

      {/* 警告ダイアログ */}
      <Dialog open={openWarning} onOpenChange={setOpenWarning}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {PLC_LABELS.PLC_WARNING_TITLE}
            </DialogTitle>
            <DialogDescription className="pt-4">
              {PLC_LABELS.PLC_WARNING_MESSAGE}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseWarning} autoFocus>
              {PLC_LABELS.I_UNDERSTAND}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PLCsPage;