import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormWrapper } from '@/components/common/form-wrapper';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import LoggingDataSettingForm from '@/components/LoggingDataSettingForm';
import { getLoggingSettings, updateLoggingDataSetting, getClientsForDevice, getPLC } from '@/services/api';
import { LoggingDataSetting, LoggingDataSettingFormData } from '@/types/logging';
import { Client } from '@/types/client';
import { AddressRange } from '@/types/plc';
import { useApiError } from '@/hooks/use-api-error';
import { LOGGING_LABELS } from '@/localization/constants/logging-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';

const LoggingDataSettingEditPage: React.FC = () => {
  const { deviceId, loggingSettingId, dataSettingId } = useParams<{ 
    deviceId: string; 
    loggingSettingId: string; 
    dataSettingId: string; 
  }>();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [loggingDataSetting, setLoggingDataSetting] = useState<LoggingDataSetting | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [addressRanges, setAddressRanges] = useState<AddressRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [deviceId, loggingSettingId, dataSettingId]);

  const fetchData = async () => {
    if (!deviceId || !loggingSettingId || !dataSettingId) {
      setError('必要なパラメータが見つかりません');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const loggingSettings = await getLoggingSettings(parseInt(deviceId));
      const currentSetting = loggingSettings.find(setting => setting.id === parseInt(loggingSettingId));
      
      if (currentSetting) {
        const dataSetting = currentSetting.logging_data.find(data => data.id === parseInt(dataSettingId));
        setLoggingDataSetting(dataSetting || null);
        
        const clients = await getClientsForDevice(parseInt(deviceId));
        const client = clients.find(c => c.id === currentSetting.client_id);
        if (client && client.plc && client.plc.id) {
          setClient(client);
          const plc = await getPLC(client.plc.id);
          setAddressRanges(plc.address_ranges || []);
        } else {
          setError(LOGGING_LABELS.ERRORS.INVALID_CLIENT);
        }
      } else {
        setError(LOGGING_LABELS.ERRORS.LOGGING_SETTING_NOT_FOUND);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(LOGGING_LABELS.ERRORS.FETCH_DATA_SETTINGS_FAILED);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: LoggingDataSettingFormData) => {
    if (!deviceId || !loggingSettingId || !dataSettingId) return;

    try {
      setIsSubmitting(true);
      await updateLoggingDataSetting(
        parseInt(deviceId), 
        parseInt(loggingSettingId), 
        parseInt(dataSettingId), 
        data
      );
      navigate(`/devices/${deviceId}/detail-settings/logging-settings/${loggingSettingId}/data`);
    } catch (error) {
      console.error('Failed to update logging data setting:', error);
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/devices/${deviceId}/detail-settings/logging-settings/${loggingSettingId}/data`);
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

  if (!loggingDataSetting || !client) {
    return (
      <ErrorMessage 
        message={LOGGING_LABELS.ERRORS.DATA_SETTING_NOT_FOUND} 
        retry={() => fetchData()}
      />
    );
  }

  return (
    <FormWrapper
      title={LOGGING_LABELS.PAGES.EDIT_DATA_SETTING}
      description={`${LOGGING_LABELS.LOGGING_DATA_SETTING}の詳細を${ACTION_LABELS.EDIT}してください`}
      onSubmit={(e) => e.preventDefault()}
      onCancel={handleCancel}
      submitLabel={ACTION_LABELS.UPDATE}
      isLoading={isSubmitting}
    >
      <LoggingDataSettingForm
        initialData={loggingDataSetting}
        onSubmit={handleSubmit}
        client={client}
        addressRanges={addressRanges}
      />
    </FormWrapper>
  );
};

export default LoggingDataSettingEditPage;