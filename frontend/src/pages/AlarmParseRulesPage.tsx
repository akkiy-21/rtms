import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AlarmParseRule } from '@/types/alarm';
import { deleteAlarmParseRule, getAlarmParseRules } from '@/services/api';
import { DataTable } from '@/components/common/data-table';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { ActionButtons } from '@/components/common/action-buttons';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { ErrorMessage } from '@/components/common/error-message';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApiError } from '@/hooks/use-api-error';
import { useToast } from '@/hooks/use-toast';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { NAVIGATION_LABELS } from '@/localization/constants/navigation-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const AlarmParseRulesPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const { toast } = useToast();
  const [rules, setRules] = useState<AlarmParseRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<number | null>(null);

  const fetchRules = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRules = await getAlarmParseRules();
      setRules(fetchedRules);
    } catch (err) {
      setError('アラームパースルールの取得に失敗しました');
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleDelete = async () => {
    if (deleteRuleId === null) {
      return;
    }

    try {
      await deleteAlarmParseRule(deleteRuleId);
      toast({
        title: '成功',
        description: MESSAGE_FORMATTER.SUCCESS_DELETE('アラームパースルール'),
      });
      await fetchRules();
    } catch (err) {
      handleError(err);
    } finally {
      setDeleteRuleId(null);
    }
  };

  const columns: ColumnDef<AlarmParseRule>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ルール名" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'offset_mode',
      header: ({ column }) => <DataTableColumnHeader column={column} title="オフセット" />,
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.offset_mode === 'preserve_address' ? '元アドレスベース' : '行番号ベース'}
        </Badge>
      ),
    },
    {
      id: 'patternCount',
      header: 'パターン数',
      cell: ({ row }) => <span>{row.original.patterns.length}</span>,
    },
    {
      accessorKey: 'is_active',
      header: ({ column }) => <DataTableColumnHeader column={column} title="状態" />,
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'secondary' : 'outline'}>
          {row.original.is_active ? '有効' : '無効'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionButtons
          onEdit={() => navigate(`/alarm-parse-rules/${row.original.id}/edit`)}
          onDelete={() => setDeleteRuleId(row.original.id)}
        />
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={fetchRules} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={NAVIGATION_LABELS.ALARM_PARSE_RULES}
        description="アラームCSVのパースルールを管理します"
        breadcrumbs={[
          { label: NAVIGATION_LABELS.ALARM_PARSE_RULES },
        ]}
        actions={
          <Button onClick={() => navigate('/alarm-parse-rules/create')}>
            <Plus className="h-4 w-4 mr-2" />
            {ACTION_LABELS.CREATE_NEW}ルール
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={rules}
        searchKey="name"
        searchPlaceholder="ルール名で検索"
      />

      <ConfirmationDialog
        open={deleteRuleId !== null}
        onOpenChange={(open) => !open && setDeleteRuleId(null)}
        onConfirm={handleDelete}
        title="アラームパースルールを削除"
        description={MESSAGE_FORMATTER.CONFIRM_DELETE('アラームパースルール')}
      />
    </div>
  );
};

export default AlarmParseRulesPage;