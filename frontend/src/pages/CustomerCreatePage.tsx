import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';
import { FormWrapper } from '../components/common/form-wrapper';
import { createCustomer } from '../services/api';
import { CustomerFormData } from '../components/features/customers/customer-form-schema';
import { useApiError } from '../hooks/use-api-error';
import { Button } from '../components/ui/button';
import { CUSTOMER_LABELS } from '../localization/constants/customer-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

const CustomerCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      setIsLoading(true);
      await createCustomer(data);
      navigate('/customers');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  return (
    <FormWrapper
      title={`${ACTION_LABELS.CREATE_NEW}${CUSTOMER_LABELS.CUSTOMER}`}
      description={`新しい${CUSTOMER_LABELS.CUSTOMER}を作成します`}
    >
      <CustomerForm onSubmit={handleSubmit}>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {ACTION_LABELS.CANCEL}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? MESSAGE_FORMATTER.CREATING() : ACTION_LABELS.CREATE}
          </Button>
        </div>
      </CustomerForm>
    </FormWrapper>
  );
};

export default CustomerCreatePage;