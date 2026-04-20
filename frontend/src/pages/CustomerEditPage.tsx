import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';
import { FormWrapper } from '../components/common/form-wrapper';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { getCustomer, updateCustomer } from '../services/api';
import { Customer } from '../types/customer';
import { CustomerFormData } from '../components/features/customers/customer-form-schema';
import { useApiError } from '../hooks/use-api-error';
import { Button } from '../components/ui/button';
import { CUSTOMER_LABELS } from '../localization/constants/customer-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

const CustomerEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (id) {
        const fetchedCustomer = await getCustomer(parseInt(id, 10));
        setCustomer(fetchedCustomer);
      }
    } catch (err) {
      setError(MESSAGE_FORMATTER.ERROR_FETCH(`${CUSTOMER_LABELS.CUSTOMER}情報`));
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);
      if (id) {
        await updateCustomer(parseInt(id, 10), data);
        navigate('/customers');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <ErrorMessage
        message={error || MESSAGE_FORMATTER.ERROR_NOT_FOUND(CUSTOMER_LABELS.CUSTOMER)}
        retry={fetchCustomer}
      />
    );
  }

  return (
    <FormWrapper
      title={`${CUSTOMER_LABELS.CUSTOMER}${ACTION_LABELS.EDIT}`}
      description={`${CUSTOMER_LABELS.CUSTOMER}情報を編集します`}
    >
      <CustomerForm initialData={customer} onSubmit={handleSubmit}>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {ACTION_LABELS.CANCEL}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? MESSAGE_FORMATTER.UPDATING() : ACTION_LABELS.UPDATE}
          </Button>
        </div>
      </CustomerForm>
    </FormWrapper>
  );
};

export default CustomerEditPage;