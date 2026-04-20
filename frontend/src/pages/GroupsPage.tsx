import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { createGroupColumns } from '@/components/features/groups/group-columns';
import { getGroups, deleteGroup } from '@/services/api';
import { Group } from '@/types/group';
import { useApiError } from '@/hooks/use-api-error';
import { useToast } from '@/hooks/use-toast';
import { GROUP_LABELS } from '@/localization/constants/group-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<number | null>(null);
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedGroups = await getGroups();
      setGroups(fetchedGroups);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : MESSAGE_FORMATTER.ERROR_FETCH(GROUP_LABELS.NAVIGATION.GROUPS);
      setError(errorMessage);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (id: number) => {
    navigate(`/groups/${id}/edit`);
  };

  const handleDeleteClick = (id: number) => {
    setGroupToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleViewUsersClick = (id: number) => {
    navigate(`/groups/${id}/users`);
  };

  const handleDeleteConfirm = async () => {
    if (groupToDelete === null) return;

    try {
      await deleteGroup(groupToDelete);
      toast({
        title: '成功',
        description: GROUP_LABELS.MESSAGES.DELETE_SUCCESS,
      });
      fetchGroups();
    } catch (err) {
      handleError(err);
    } finally {
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  const columns = createGroupColumns(handleEditClick, handleDeleteClick, handleViewUsersClick);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={fetchGroups} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={GROUP_LABELS.NAVIGATION.GROUPS}
        description={`システム${GROUP_LABELS.NAVIGATION.GROUPS}を管理します`}
        actions={
          <Button onClick={() => navigate('/groups/create')}>
            {ACTION_LABELS.CREATE_NEW}{GROUP_LABELS.NAVIGATION.GROUPS}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={groups}
        searchKey="name"
        searchPlaceholder={GROUP_LABELS.PLACEHOLDERS.SEARCH}
      />
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={GROUP_LABELS.ACTIONS.DELETE_GROUP}
        description={GROUP_LABELS.MESSAGES.DELETE_CONFIRM}
      />
    </div>
  );
};

export default GroupsPage;