// DeviceCreatePage.tsx
// デバイス作成ページ - FormWrapperとshadcn/uiを使用

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeviceForm from '../components/DeviceForm';
import { FormWrapper } from '../components/common/form-wrapper';
import { createDevice } from '../services/api';
import { DeviceFormData } from '../components/features/devices/device-form-schema';
import { useApiError } from '../hooks/use-api-error';
import { Button } from '../components/ui/button';
import { DEVICE_LABELS } from '../localization/constants/device-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';

const DeviceCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: DeviceFormData) => {
    try {
      setIsLoading(true);
      await createDevice(data);
      navigate('/devices');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/devices');
  };

  return (
    <FormWrapper
      title={`新規${DEVICE_LABELS.DEVICE}作成`}
      description={`新しい${DEVICE_LABELS.DEVICE}を作成します`}
    >
      <DeviceForm onSubmit={handleSubmit}>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {ACTION_LABELS.CANCEL}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '作成中...' : ACTION_LABELS.CREATE}
          </Button>
        </div>
      </DeviceForm>
    </FormWrapper>
  );
};

export default DeviceCreatePage;