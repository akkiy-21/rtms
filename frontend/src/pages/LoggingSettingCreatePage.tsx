import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoggingSettingForm from '../components/LoggingSettingForm';
import { FormWrapper } from '@/components/common/form-wrapper';
import { createLoggingSetting, getClientsForDevice, getDevice } from '../services/api';
import { LoggingSettingFormData } from '../types/logging';
import { Client } from '../types/client';
import { Device } from '../types/device';
import { PageHeader } from '@/components/layout/page-header';
import { useApiError } from '@/hooks/use-api-error';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { LOGGING_LABELS } from '@/localization/constants/logging-labels';
import { NAVIGATION_LABELS } from '@/localization/constants/navigation-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';

const LoggingSettingCreatePage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [clients, setClients] = useState<Client[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [deviceId]);

  const fetchData = async () => {
    if (!deviceId) return;
    
    setIsLoading(true);
    try {
      const [fetchedClients, fetchedDevice] = await Promise.all([
        getClientsForDevice(parseInt(deviceId)),
        getDevice(parseInt(deviceId))
      ]);
      setClients(fetchedClients);
      setDevice(fetchedDevice);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: LoggingSettingFormData) => {
    if (!deviceId) return;

    setIsSubmitting(true);
    try {
      await createLoggingSetting(parseInt(deviceId), data);
      navigate(`/devices/${deviceId}/detail-settings/logging-settings`);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/devices/${deviceId}/detail-settings/logging-settings`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={LOGGING_LABELS.PAGES.CREATE_LOGGING_SETTING}
        description={`${BUSINESS_TERMS.DEVICE}の${LOGGING_LABELS.PAGES.CREATE_LOGGING_SETTING}を行います`}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device?.name || `${BUSINESS_TERMS.DEVICE} ${deviceId}`, href: `/devices/${deviceId}/edit` },
          { label: NAVIGATION_LABELS.DEVICE_DETAILS, href: `/devices/${deviceId}/detail-settings` },
          { label: NAVIGATION_LABELS.LOGGING_SETTINGS, href: `/devices/${deviceId}/detail-settings/logging-settings` },
          { label: ACTION_LABELS.CREATE },
        ]}
      />
      <FormWrapper
        title=""
        onCancel={handleCancel}
      >
        <LoggingSettingForm 
          onSubmit={handleSubmit} 
          clients={clients}
          isLoading={isSubmitting}
        />
      </FormWrapper>
    </div>
  );
};

export default LoggingSettingCreatePage;