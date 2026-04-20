// src/pages/AlarmGroupEditPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AlarmGroupForm from '../components/AlarmGroupForm';
import { getAlarmGroups, updateAlarmGroup, getClientsForDevice } from '../services/api';
import { AlarmGroup } from '../types/alarm';
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

const AlarmGroupEditPage: React.FC = () => {
  const { deviceId, groupId } = useParams<{ deviceId: string; groupId: string }>();
  const navigate = useNavigate();
  const [alarmGroup, setAlarmGroup] = useState<AlarmGroup | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useApiError();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (deviceId && groupId) {
          const [fetchedGroups, fetchedClients] = await Promise.all([
            getAlarmGroups(parseInt(deviceId)),
            getClientsForDevice(parseInt(deviceId))
          ]);
          const targetGroup = fetchedGroups.find(group => group.id === parseInt(groupId));
          if (!targetGroup) {
            setError(MESSAGE_FORMATTER.ERROR_NOT_FOUND(ALARM_LABELS.ALARM_GROUP));
          } else {
            setAlarmGroup(targetGroup);
          }
          setClients(fetchedClients);
        }
      } catch (err) {
        setError(MESSAGE_FORMATTER.ERROR_FETCH(`${ALARM_LABELS.ALARM_GROUP}データ`));
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [deviceId, groupId]); // handleErrorを依存関係から除外

  const handleSubmit = async (data: AlarmGroupFormData) => {
    setIsSubmitting(true);
    try {
      if (deviceId && groupId) {
        await updateAlarmGroup(parseInt(deviceId), parseInt(groupId), data);
        toast({
          title: '成功',
          description: MESSAGE_FORMATTER.SUCCESS_UPDATE(ALARM_LABELS.ALARM_GROUP),
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

  if (error || !alarmGroup) {
    return (
      <ErrorMessage
        message={error || MESSAGE_FORMATTER.ERROR_NOT_FOUND(ALARM_LABELS.ALARM_GROUP)}
        retry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={ALARM_LABELS.ACTIONS.EDIT_GROUP}
        description={`${ALARM_LABELS.ALARM_GROUP}の情報を更新します`}
      />
      <Card>
        <CardContent className="pt-6">
          <AlarmGroupForm 
            initialData={alarmGroup} 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
            clients={clients}
            isLoading={isSubmitting}
            submitLabel={ACTION_LABELS.UPDATE}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AlarmGroupEditPage;