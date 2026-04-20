// src/pages/AlarmGroupCreatePage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AlarmGroupForm from '../components/AlarmGroupForm';
import { createAlarmGroup, getClientsForDevice } from '../services/api';
import { AlarmGroupFormData } from '../components/features/alarms/alarm-group-form-schema';
import { Client } from '../types/client';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { useApiError } from '@/hooks/use-api-error';
import { useToast } from '@/hooks/use-toast';
import { ALARM_LABELS } from '@/localization/constants/alarm-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const AlarmGroupCreatePage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useApiError();
  const { toast } = useToast();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        if (deviceId) {
          const fetchedClients = await getClientsForDevice(parseInt(deviceId));
          setClients(fetchedClients);
        }
      } catch (err) {
        setError(MESSAGE_FORMATTER.ERROR_FETCH('クライアント'));
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, [deviceId]); // handleErrorを依存関係から除外

  const handleSubmit = async (data: AlarmGroupFormData) => {
    setIsSubmitting(true);
    try {
      if (deviceId) {
        await createAlarmGroup(parseInt(deviceId), data);
        toast({
          title: '成功',
          description: MESSAGE_FORMATTER.SUCCESS_CREATE(ALARM_LABELS.ALARM_GROUP),
        });
        navigate(`/devices/${deviceId}/detail-settings/alarm-groups`);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/devices/${deviceId}/detail-settings/alarm-groups`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        retry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={ALARM_LABELS.ACTIONS.CREATE_GROUP}
        description={`デバイスに新しい${ALARM_LABELS.ALARM_GROUP}を追加します`}
      />
      <Card>
        <CardContent className="pt-6">
          <AlarmGroupForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
            clients={clients}
            isLoading={isSubmitting}
            submitLabel={ACTION_LABELS.CREATE}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AlarmGroupCreatePage;