import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClassificationForm from '../components/ClassificationForm';
import { FormWrapper } from '../components/common/form-wrapper';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { getClassification, updateClassification, getClassificationGroups } from '../services/api';
import { Classification, ClassificationGroup } from '../types/classification';
import { ClassificationFormData } from '../components/features/classifications/classification-form-schema';
import { useApiError } from '../hooks/use-api-error';
import { Button } from '../components/ui/button';
import { CLASSIFICATION_LABELS } from '../localization/constants/classification-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';

const ClassificationEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [classification, setClassification] = useState<Classification | null>(null);
  const [groups, setGroups] = useState<ClassificationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (id) {
        const [fetchedClassification, fetchedGroups] = await Promise.all([
          getClassification(parseInt(id)),
          getClassificationGroups(),
        ]);
        setClassification(fetchedClassification);
        setGroups(fetchedGroups);
      }
    } catch (err) {
      setError(CLASSIFICATION_LABELS.ERRORS.FETCH_FAILED);
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ClassificationFormData) => {
    try {
      setIsSubmitting(true);
      if (id) {
        await updateClassification(parseInt(id), data);
        navigate('/classifications');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/classifications');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !classification) {
    return (
      <ErrorMessage
        message={error || CLASSIFICATION_LABELS.ERRORS.CLASSIFICATION_NOT_FOUND}
        retry={fetchData}
      />
    );
  }

  return (
    <FormWrapper
      title={CLASSIFICATION_LABELS.PAGES.EDIT}
      description={CLASSIFICATION_LABELS.PAGE_DESCRIPTIONS.EDIT}
    >
      <ClassificationForm 
        initialData={{
          name: classification.name,
          group_id: classification.group.id,
        }}
        groups={groups} 
        onSubmit={handleSubmit}
      >
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {ACTION_LABELS.CANCEL}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? CLASSIFICATION_LABELS.MESSAGES.UPDATING : ACTION_LABELS.UPDATE}
          </Button>
        </div>
      </ClassificationForm>
    </FormWrapper>
  );
};

export default ClassificationEditPage;