import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormWrapper } from '@/components/common/form-wrapper';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import LoggingDataSettingForm from '@/components/LoggingDataSettingForm';
import { LoggingDataSettingFormData, LoggingSetting } from '@/types/logging';
import { createLoggingDataSetting, getClientsForDevice, getPLC, getLoggingSettings } from '@/services/api';
import { Client } from '@/types/client';
import { AddressRange } from '@/types/plc';
import { useApiError } from '@/hooks/use-api-error';
import { LOGGING_LABELS } from '@/localization/constants/logging-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';

const LoggingDataSettingCreatePage: React.FC = () => {
  const { deviceId, loggingSettingId } = useParams<{ deviceId: string; loggingSettingId: string }>();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [client, setClient] = useState<Client | null>(null);
  const [addressRanges, setAddressRanges] = useState<AddressRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [deviceId, loggingSettingId]);

  const fetchData = async () => {
    if (!deviceId || !loggingSettingId) {
      setError('デバイスIDまたはロギング設定IDが見つかりません');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const clients = await getClientsForDevice(parseInt(deviceId));
      const loggingSettings = await getLoggingSettings(parseInt(deviceId));
      const currentSetting = loggingSettings.find((setting: LoggingSetting) => setting.id === parseInt(loggingSettingId));
      
      if (currentSetting) {
        const client = clients.find((c: Client) => c.id === currentSetting.client_id);
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
    if (!deviceId || !loggingSettingId) return;

    try {
      setIsSubmitting(true);
      await createLoggingDataSetting(parseInt(deviceId), parseInt(loggingSettingId), data);
      navigate(`/devices/${deviceId}/detail-settings/logging-settings/${loggingSettingId}/data`);
    } catch (error) {
      console.error('Failed to create logging data setting:', error);
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

  if (!client) {
    return (
      <ErrorMessage 
        message={LOGGING_LABELS.ERRORS.INVALID_CLIENT} 
        retry={() => fetchData()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{LOGGING_LABELS.PAGES.CREATE_DATA_SETTING}</h1>
        <p className="text-muted-foreground">{LOGGING_LABELS.LOGGING_DATA_SETTING}の詳細を入力してください</p>
      </div>
      <LoggingDataSettingForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        client={client}
        addressRanges={addressRanges}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default LoggingDataSettingCreatePage;