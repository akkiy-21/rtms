import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';
import { FormWrapper } from '../components/common/form-wrapper';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { getUser, updateUser } from '../services/api';
import { User } from '../types/user';
import { UserFormData } from '../components/features/users/user-form-schema';
import { useApiError } from '../hooks/use-api-error';
import { Button } from '../components/ui/button';
import { USER_LABELS } from '../localization/constants/user-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';
import { BUSINESS_TERMS } from '../localization/constants/business-terms';

const UserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (id) {
        const fetchedUser = await getUser(id);
        setUser(fetchedUser);
      }
    } catch (err) {
      setError(MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.USER + '情報'));
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      if (id) {
        await updateUser(id, data);
        navigate('/users');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !user) {
    return (
      <ErrorMessage
        message={error || MESSAGE_FORMATTER.ERROR_NOT_FOUND(BUSINESS_TERMS.USER)}
        retry={fetchUser}
      />
    );
  }

  return (
    <FormWrapper
      title={USER_LABELS.PAGES.EDIT}
      description={`${BUSINESS_TERMS.USER}情報を編集します`}
    >
      <UserForm initialData={user} onSubmit={handleSubmit}>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {ACTION_LABELS.CANCEL}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? MESSAGE_FORMATTER.UPDATING() : ACTION_LABELS.UPDATE}
          </Button>
        </div>
      </UserForm>
    </FormWrapper>
  );
};

export default UserEditPage;