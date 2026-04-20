import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoggingSettingForm from '../components/LoggingSettingForm';
import { FormWrapper } from '@/components/common/form-wrapper';
import { getLoggingSettings, updateLoggingSetting, getClientsForDevice, getDevice } from '../services/api';
import { LoggingSetting } from '../types/logging';
import { LoggingSettingFormData } from '../types/logging';
import { Client } from '../types/client';
import { Device } from '../types/device';
import { PageHeader } from '@/components/layout/page-header';
import { useApiError } from '@/hooks/use-api-error';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { LOGGING_LABELS } from '@/localization/constants/logging-labels';
import { NAVIGATION_LABELS } from '@/localization/constants/navigation-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';

const LoggingSettingEditPage: React.FC = () => {
  const { deviceId, settingId } = useParams<{ deviceId: string; settingId: string }>();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [loggingSetting, setLoggingSetting] = useState<LoggingSetting | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [deviceId, settingId]);

  const fetchData = async () => {
    if (!deviceId || !settingId) return;

    setIsLoading(true);
    setError('');
    try {
      const [fetchedSettings, fetchedClients, fetchedDevice] = await Promise.all([
        getLoggingSettings(parseInt(deviceId)),
        getClientsForDevice(parseInt(deviceId)),
        getDevice(parseInt(deviceId))
      ]);
      const targetSetting = fetchedSettings.find(setting => setting.id === parseInt(settingId));
      
      if (!targetSetting) {
        setError(LOGGING_LABELS.ERRORS.LOGGING_SETTING_NOT_FOUND);
        return;
      }
      
      setLoggingSetting(targetSetting);
      setClients(fetchedClients);
      setDevice(fetchedDevice);
    } catch (error) {
      setError(LOGGING_LABELS.ERRORS.FETCH_LOGGING_SETTINGS_FAILED);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: LoggingSettingFormData) => {
    if (!deviceId || !settingId) return;

    setIsSubmitting(true);
    try {
      await updateLoggingSetting(parseInt(deviceId), parseInt(settingId), data);
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

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        retry={() => fetchData()}
      />
    );
  }

  if (!loggingSetting) {
    return (
      <ErrorMessage 
        message={LOGGING_LABELS.ERRORS.LOGGING_SETTING_NOT_FOUND}
        retry={() => fetchData()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={LOGGING_LABELS.PAGES.EDIT_LOGGING_SETTING}
        description={`${LOGGING_LABELS.LOGGING_SETTING}「${loggingSetting.logging_name}」を${ACTION_LABELS.EDIT}します`}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device?.name || `${BUSINESS_TERMS.DEVICE} ${deviceId}`, href: `/devices/${deviceId}/edit` },
          { label: NAVIGATION_LABELS.DEVICE_DETAILS, href: `/devices/${deviceId}/detail-settings` },
          { label: NAVIGATION_LABELS.LOGGING_SETTINGS, href: `/devices/${deviceId}/detail-settings/logging-settings` },
          { label: ACTION_LABELS.EDIT },
        ]}
      />
      <FormWrapper
        title=""
        onCancel={handleCancel}
      >
        <LoggingSettingForm 
          initialData={loggingSetting}
          onSubmit={handleSubmit} 
          clients={clients}
          isLoading={isSubmitting}
        />
      </FormWrapper>
    </div>
  );
};

export default LoggingSettingEditPage;