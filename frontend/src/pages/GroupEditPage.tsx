import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GroupForm, { GroupFormHandle } from '../components/GroupForm';
import { getGroup, updateGroup } from '../services/api';
import { Group } from '../types/group';
import { GroupFormData } from '../components/features/groups/group-form-schema';
import { FormWrapper } from '../components/common/form-wrapper';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { useApiError } from '../hooks/use-api-error';
import { useToast } from '../hooks/use-toast';
import { GROUP_LABELS } from '../localization/constants/group-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';
import { BUSINESS_TERMS } from '../localization/constants/business-terms';

const GroupEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const formRef = useRef<GroupFormHandle>(null);

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    if (!id) return;
    
    setIsFetching(true);
    setFetchError(null);
    try {
      const fetchedGroup = await getGroup(parseInt(id, 10));
      setGroup(fetchedGroup);
    } catch (error) {
      const message = error instanceof Error ? error.message : MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.GROUP);
      setFetchError(message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (data: GroupFormData) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      await updateGroup(parseInt(id, 10), data);
      toast({
        title: '成功',
        description: GROUP_LABELS.MESSAGES.UPDATE_SUCCESS,
      });
      navigate('/groups');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/groups');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current) {
      await formRef.current.submit();
    }
  };

  if (isFetching) {
    return <LoadingSpinner />;
  }

  if (fetchError) {
    return <ErrorMessage message={fetchError} retry={fetchGroup} />;
  }

  if (!group) {
    return <ErrorMessage message={MESSAGE_FORMATTER.ERROR_NOT_FOUND(BUSINESS_TERMS.GROUP)} />;
  }

  return (
    <FormWrapper
      title={GROUP_LABELS.PAGES.EDIT}
      description={`${GROUP_LABELS.FIELDS.GROUP_NAME}情報を編集します`}
      onSubmit={handleFormSubmit}
      onCancel={handleCancel}
      submitLabel={ACTION_LABELS.UPDATE}
      isLoading={isLoading}
    >
      <GroupForm ref={formRef} initialData={group} onSubmit={handleSubmit} />
    </FormWrapper>
  );
};

export default GroupEditPage;