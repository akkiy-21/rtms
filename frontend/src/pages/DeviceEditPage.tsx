// DeviceEditPage.tsx
// デバイス編集ページ - FormWrapperとshadcn/uiを使用

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DeviceForm from '../components/DeviceForm';
import { FormWrapper } from '../components/common/form-wrapper';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { getDevice, updateDevice } from '../services/api';
import { Device } from '../types/device';
import { DeviceFormData } from '../components/features/devices/device-form-schema';
import { useApiError } from '../hooks/use-api-error';
import { Button } from '../components/ui/button';
import { DEVICE_LABELS } from '../localization/constants/device-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';

const DeviceEditPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDevice();
  }, [deviceId]);

  const fetchDevice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (deviceId) {
        const fetchedDevice = await getDevice(parseInt(deviceId));
        setDevice(fetchedDevice);
      }
    } catch (err) {
      setError(DEVICE_LABELS.ERRORS.FETCH_FAILED);
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: DeviceFormData) => {
    try {
      setIsSubmitting(true);
      if (deviceId) {
        await updateDevice(parseInt(deviceId), data);
        navigate('/devices');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/devices');
  };

  const handleDetailSettings = () => {
    navigate(`/devices/${deviceId}/detail-settings`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !device) {
    return (
      <ErrorMessage
        message={error || DEVICE_LABELS.ERRORS.DEVICE_NOT_FOUND}
        retry={fetchDevice}
      />
    );
  }

  const initialFormData: Partial<DeviceFormData> = {
    mac_address: device.mac_address,
    name: device.name,
    ssh_username: device.ssh_username || '',
    ssh_password: device.ssh_password || '',
    standard_cycle_time: device.standard_cycle_time || undefined,
  };

  return (
    <FormWrapper
      title={DEVICE_LABELS.PAGES.EDIT}
      description={`${DEVICE_LABELS.DEVICE}情報を編集します`}
    >
      <DeviceForm initialData={initialFormData} onSubmit={handleSubmit}>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {ACTION_LABELS.CANCEL}
          </Button>
          <Button type="button" variant="secondary" onClick={handleDetailSettings}>
            {DEVICE_LABELS.ACTIONS.DETAIL_SETTINGS}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '更新中...' : ACTION_LABELS.UPDATE}
          </Button>
        </div>
      </DeviceForm>
    </FormWrapper>
  );
};

export default DeviceEditPage;
