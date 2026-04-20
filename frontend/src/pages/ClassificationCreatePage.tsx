import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassificationForm from '../components/ClassificationForm';
import { FormWrapper } from '../components/common/form-wrapper';
import { createClassification, getClassificationGroups } from '../services/api';
import { ClassificationFormData } from '../components/features/classifications/classification-form-schema';
import { ClassificationGroup } from '../types/classification';
import { useApiError } from '../hooks/use-api-error';
import { Button } from '../components/ui/button';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { CLASSIFICATION_LABELS } from '../localization/constants/classification-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';

const ClassificationCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<ClassificationGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setIsLoadingGroups(true);
      setError(null);
      const fetchedGroups = await getClassificationGroups();
      setGroups(fetchedGroups);
    } catch (error) {
      setError(CLASSIFICATION_LABELS.ERRORS.GROUP_FETCH_FAILED);
      handleError(error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleSubmit = async (data: ClassificationFormData) => {
    try {
      setIsLoading(true);
      await createClassification(data);
      navigate('/classifications');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/classifications');
  };

  if (isLoadingGroups) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        retry={fetchGroups}
      />
    );
  }

  return (
    <FormWrapper
      title={CLASSIFICATION_LABELS.PAGES.CREATE}
      description={CLASSIFICATION_LABELS.PAGE_DESCRIPTIONS.CREATE}
    >
      <ClassificationForm groups={groups} onSubmit={handleSubmit}>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {ACTION_LABELS.CANCEL}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? CLASSIFICATION_LABELS.MESSAGES.CREATING : ACTION_LABELS.CREATE}
          </Button>
        </div>
      </ClassificationForm>
    </FormWrapper>
  );
};

export default ClassificationCreatePage;