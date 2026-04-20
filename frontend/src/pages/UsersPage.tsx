import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { createUserColumns } from '@/components/features/users/user-columns';
import { getUsers, deleteUser } from '../services/api';
import { User } from '../types/user';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';
import { TABLE_LABELS } from '@/localization/constants/table-labels';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.USER),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (userId: string) => {
    navigate(`/users/${userId}/edit`);
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await deleteUser(userToDelete);
      toast({
        title: "成功",
        description: MESSAGE_FORMATTER.SUCCESS_DELETE(BUSINESS_TERMS.USER),
      });
      await fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: MESSAGE_FORMATTER.ERROR_DELETE(BUSINESS_TERMS.USER),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = createUserColumns(handleEdit, handleDeleteClick);

  return (
    <div className="space-y-6">
      <PageHeader
        title={BUSINESS_TERMS.USERS}
        description={`システムの${BUSINESS_TERMS.USERS}を管理します`}
        actions={
          <Button onClick={() => navigate('/users/create')}>
            <Plus className="mr-2 h-4 w-4" />
            {ACTION_LABELS.CREATE_NEW}
          </Button>
        }
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{MESSAGE_FORMATTER.LOADING()}</div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          searchKey="name"
          searchPlaceholder={TABLE_LABELS.SEARCH_PLACEHOLDER(`${BUSINESS_TERMS.USER}名`)}
        />
      )}

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`${BUSINESS_TERMS.USER}の${ACTION_LABELS.DELETE}`}
        description={MESSAGE_FORMATTER.CONFIRM_DELETE(BUSINESS_TERMS.USER)}
        confirmLabel={ACTION_LABELS.DELETE}
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UsersPage;