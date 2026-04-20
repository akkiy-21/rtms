import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupForm, { GroupFormHandle } from '../components/GroupForm';
import { createGroup } from '../services/api';
import { GroupFormData } from '../components/features/groups/group-form-schema';
import { FormWrapper } from '../components/common/form-wrapper';
import { useApiError } from '../hooks/use-api-error';
import { useToast } from '../hooks/use-toast';
import { GROUP_LABELS } from '../localization/constants/group-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

const GroupCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<GroupFormHandle>(null);

  const handleSubmit = async (data: GroupFormData) => {
    setIsLoading(true);
    try {
      await createGroup(data);
      toast({
        title: '成功',
        description: GROUP_LABELS.MESSAGES.CREATE_SUCCESS,
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

  return (
    <FormWrapper
      title={GROUP_LABELS.PAGES.CREATE}
      description={`新しい${GROUP_LABELS.FIELDS.GROUP_NAME}を作成します`}
      onSubmit={handleFormSubmit}
      onCancel={handleCancel}
      submitLabel={ACTION_LABELS.CREATE}
      isLoading={isLoading}
    >
      <GroupForm ref={formRef} onSubmit={handleSubmit} />
    </FormWrapper>
  );
};

export default GroupCreatePage;