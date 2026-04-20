import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUsersInGroup, removeUserFromGroup, getUsers, addUserToGroup, getGroup } from '../services/api';
import { User } from '../types/user';
import { Group } from '../types/group';
import { PageHeader } from '../components/layout/page-header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Trash2, UserPlus, ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { ConfirmationDialog } from '../components/common/confirmation-dialog';
import { GROUP_LABELS } from '../localization/constants/group-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';
import { BUSINESS_TERMS } from '../localization/constants/business-terms';
import { USER_LABELS } from '../localization/constants/user-labels';

const GroupUsersPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groupUsers, setGroupUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userToRemove, setUserToRemove] = useState<User | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (groupId) {
        const [groupData, users, allUsersData] = await Promise.all([
          getGroup(parseInt(groupId)),
          getUsersInGroup(parseInt(groupId)),
          getUsers(),
        ]);
        setGroup(groupData);
        setGroupUsers(users);
        setAllUsers(allUsersData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.DATA));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!groupId || !userToRemove) return;

    try {
      setIsRemoving(true);
      await removeUserFromGroup(parseInt(groupId), userToRemove.id);
      setGroupUsers(groupUsers.filter(u => u.id !== userToRemove.id));
      toast({
        title: '成功',
        description: `${userToRemove.name}を${BUSINESS_TERMS.GROUP}から${ACTION_LABELS.DELETE}しました`,
      });
      setUserToRemove(null);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: err instanceof Error ? err.message : MESSAGE_FORMATTER.ERROR_DELETE(BUSINESS_TERMS.USER),
      });
    } finally {
      setIsRemoving(false);
    }
  };
  
  const handleAddUser = async (user: User) => {
    if (!groupId) return;

    try {
      setIsAdding(user.id);
      await addUserToGroup(parseInt(groupId), user.id);
      setGroupUsers([...groupUsers, user]);
      toast({
        title: '成功',
        description: `${user.name}を${BUSINESS_TERMS.GROUP}に${ACTION_LABELS.ADD}しました`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: err instanceof Error ? err.message : MESSAGE_FORMATTER.ERROR_CREATE(BUSINESS_TERMS.USER),
      });
    } finally {
      setIsAdding(null);
    }
  };

  const availableUsers = allUsers.filter(user => !groupUsers.some(groupUser => groupUser.id === user.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} retry={fetchData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={GROUP_LABELS.PAGES.MEMBERS}
        description={`${BUSINESS_TERMS.GROUP}に所属する${BUSINESS_TERMS.USER}を管理します`}
        actions={
          <Button variant="outline" onClick={() => navigate('/groups')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {GROUP_LABELS.NAVIGATION.GROUP_LIST}に{ACTION_LABELS.BACK}
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* グループに所属しているユーザー */}
        <Card>
          <CardHeader>
            <CardTitle>{GROUP_LABELS.FIELDS.MEMBERS}</CardTitle>
            <CardDescription>
              この{BUSINESS_TERMS.GROUP}に所属している{BUSINESS_TERMS.USER} ({groupUsers.length}人)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {groupUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                この{BUSINESS_TERMS.GROUP}にはまだ{BUSINESS_TERMS.USER}が所属していません
              </p>
            ) : (
              <div className="space-y-2">
                {groupUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {user.id}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserToRemove(user)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 追加可能なユーザー */}
        <Card>
          <CardHeader>
            <CardTitle>{ACTION_LABELS.ADD}可能な{BUSINESS_TERMS.USER}</CardTitle>
            <CardDescription>
              {BUSINESS_TERMS.GROUP}に{ACTION_LABELS.ADD}できる{BUSINESS_TERMS.USER} ({availableUsers.length}人)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {ACTION_LABELS.ADD}可能な{BUSINESS_TERMS.USER}がいません
              </p>
            ) : (
              <div className="space-y-2">
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {user.id}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddUser(user)}
                      disabled={isAdding === user.id}
                    >
                      {isAdding === user.id ? (
                        MESSAGE_FORMATTER.CREATING()
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          {ACTION_LABELS.ADD}
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 削除確認ダイアログ */}
      <ConfirmationDialog
        open={!!userToRemove}
        onOpenChange={(open) => !open && setUserToRemove(null)}
        title={`${BUSINESS_TERMS.USER}を${ACTION_LABELS.DELETE}`}
        description={`${userToRemove?.name}をこの${BUSINESS_TERMS.GROUP}から${ACTION_LABELS.DELETE}してもよろしいですか？`}
        onConfirm={handleRemoveUser}
        confirmLabel={ACTION_LABELS.DELETE}
        variant="destructive"
        isLoading={isRemoving}
      />
    </div>
  );
};

export default GroupUsersPage;