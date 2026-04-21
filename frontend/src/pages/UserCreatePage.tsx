import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';
import { FormWrapper } from '../components/common/form-wrapper';
import { createUser } from '../services/api';
import { UserFormData } from '../components/features/users/user-form-schema';
import { useApiError } from '../hooks/use-api-error';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { USER_LABELS } from '../localization/constants/user-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';
import { BUSINESS_TERMS } from '../localization/constants/business-terms';

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [isLoading, setIsLoading] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);
      const result = await createUser(data);
      setCreatedUserId(result.user.id);
      setTemporaryPassword(result.temporary_password);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <FormWrapper
      title={USER_LABELS.PAGES.CREATE}
      description={`新しい${BUSINESS_TERMS.USER}を作成します`}
    >
      <UserForm onSubmit={handleSubmit}>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {ACTION_LABELS.CANCEL}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? MESSAGE_FORMATTER.CREATING() : ACTION_LABELS.CREATE}
          </Button>
        </div>
      </UserForm>
      <Dialog open={temporaryPassword !== null} onOpenChange={(open) => {
        if (!open) {
          setTemporaryPassword(null);
          navigate('/users');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>仮パスワードを発行しました</DialogTitle>
            <DialogDescription>
              ユーザー {createdUserId} は初回ログイン時にパスワード変更が必要です。
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-slate-50 p-4 font-mono text-lg tracking-wide">
            {temporaryPassword}
          </div>
          <DialogFooter>
            <Button onClick={() => navigate('/users')}>{ACTION_LABELS.CLOSE}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormWrapper>
  );
};

export default UserCreatePage;