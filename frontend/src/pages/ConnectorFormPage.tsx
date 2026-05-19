import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { useApiError } from '@/hooks/use-api-error';
import { useToast } from '@/hooks/use-toast';
import { getDevice, getAlarmGroups } from '../services/api';
import { getConnectors, createConnector, updateConnector } from '../services/connectorApi';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';
import { DeviceConnector, DeviceConnectorCreate, DeviceConnectorUpdate } from '../types/connector';
import { Device } from '../types/device';
import { AlarmGroup } from '../types/alarm';
import ConnectorForm from '../components/ConnectorForm';

const ConnectorFormPage: React.FC = () => {
  const { deviceId, connectorId } = useParams<{ deviceId: string; connectorId: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [connector, setConnector] = useState<DeviceConnector | null>(null);
  const [alarmGroups, setAlarmGroups] = useState<AlarmGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useApiError();
  const { toast } = useToast();

  const deviceIdInt = deviceId ? parseInt(deviceId) : 0;
  const connectorIdInt = connectorId ? parseInt(connectorId) : null;
  const isEdit = connectorIdInt !== null;
  const backPath = `/devices/${deviceId}/detail-settings/external-connectors`;

  useEffect(() => {
    const fetchData = async () => {
      if (!deviceIdInt) return;
      try {
        const fetches: Promise<unknown>[] = [
          getDevice(deviceIdInt),
          getAlarmGroups(deviceIdInt),
        ];
        if (isEdit) {
          fetches.push(getConnectors(deviceIdInt));
        }
        const results = await Promise.all(fetches);
        setDevice(results[0] as Device);
        setAlarmGroups(results[1] as AlarmGroup[]);
        if (isEdit && connectorIdInt !== null) {
          const connectors = results[2] as DeviceConnector[];
          const target = connectors.find((c) => c.id === connectorIdInt) ?? null;
          if (!target) {
            setError('コネクタが見つかりません');
          } else {
            setConnector(target);
          }
        }
      } catch (err) {
        setError(SETTINGS_LABELS.CONNECTOR_FETCH_FAILED);
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [deviceId, connectorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (data: DeviceConnectorCreate | DeviceConnectorUpdate) => {
    setIsSubmitting(true);
    try {
      if (isEdit && connectorIdInt !== null) {
        await updateConnector(deviceIdInt, connectorIdInt, data as DeviceConnectorUpdate);
        toast({ title: SETTINGS_LABELS.CONNECTOR_EDIT, description: '保存しました' });
      } else {
        await createConnector(deviceIdInt, data as DeviceConnectorCreate);
        toast({ title: SETTINGS_LABELS.CONNECTOR_ADD, description: '保存しました' });
      }
      navigate(backPath);
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(backPath);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error || (isEdit && !connector)) {
    return (
      <ErrorMessage
        message={error ?? 'コネクタが見つかりません'}
        retry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? SETTINGS_LABELS.CONNECTOR_EDIT : SETTINGS_LABELS.CONNECTOR_ADD}
        description={SETTINGS_LABELS.EXTERNAL_CONNECTORS_DESCRIPTION}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device?.name ?? '...', href: `/devices/${deviceId}/edit` },
          {
            label: NAVIGATION_LABELS.DETAILS + NAVIGATION_LABELS.SETTINGS,
            href: `/devices/${deviceId}/detail-settings`,
          },
          { label: NAVIGATION_LABELS.EXTERNAL_CONNECTORS, href: backPath },
          { label: isEdit ? SETTINGS_LABELS.CONNECTOR_EDIT : SETTINGS_LABELS.CONNECTOR_ADD },
        ]}
      />
      <Card>
        <CardContent className="pt-6">
          <ConnectorForm
            initialValues={connector ?? undefined}
            alarmGroups={alarmGroups}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectorFormPage;
