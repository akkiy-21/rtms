// ClientEditPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientForm from '../components/ClientForm';
import { ClientFormData } from '@/components/features/clients/client-form-schema';
import { Client } from '../types/client';
import { getClient, updateClient, getDevice } from '../services/api';
import { Device } from '../types/device';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { useToast } from '@/hooks/use-toast';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { NAVIGATION_LABELS } from '@/localization/constants/navigation-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const ClientEditPage: React.FC = () => {
  const { deviceId, clientId } = useParams<{ deviceId: string; clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [clientId, deviceId]);

  const fetchClient = async () => {
    if (clientId && deviceId) {
      try {
        const [fetchedClient, fetchedDevice] = await Promise.all([
          getClient(parseInt(deviceId), parseInt(clientId)),
          getDevice(parseInt(deviceId))
        ]);
        setClient(fetchedClient);
        setDevice(fetchedDevice);
      } catch (error) {
        console.error('Failed to fetch client:', error);
        setError(MESSAGE_FORMATTER.ERROR_FETCH('クライアント情報'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      await updateClient(parseInt(deviceId!), parseInt(clientId!), data);
      toast({
        title: '成功',
        description: MESSAGE_FORMATTER.SUCCESS_UPDATE('クライアント'),
      });
      navigate(`/devices/${deviceId}/detail-settings/client-settings`);
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: MESSAGE_FORMATTER.ERROR_UPDATE('クライアント'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/devices/${deviceId}/detail-settings/client-settings`);
  };

  const removeCIDRNotation = (ipAddress: string): string => {
    return ipAddress.split('/')[0];
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        retry={() => {
          setError(null);
          setLoading(true);
          fetchClient();
        }}
      />
    );
  }

  if (!client) {
    return <ErrorMessage message={MESSAGE_FORMATTER.ERROR_NOT_FOUND('クライアント')} />;
  }

  const initialFormData: ClientFormData = {
    name: client.name,
    ip_address: removeCIDRNotation(client.ip_address),
    port_no: client.port_no,
    plc_id: client.plc.id,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`クライアント${ACTION_LABELS.EDIT}`}
        description="クライアント情報を更新します"
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device?.name || `${BUSINESS_TERMS.DEVICE} ${deviceId}`, href: `/devices/${deviceId}/edit` },
          { label: NAVIGATION_LABELS.DEVICE_DETAILS, href: `/devices/${deviceId}/detail-settings` },
          { label: NAVIGATION_LABELS.CLIENT_SETTINGS, href: `/devices/${deviceId}/detail-settings/client-settings` },
          { label: ACTION_LABELS.EDIT },
        ]}
      />
      <ClientForm
        initialData={initialFormData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ClientEditPage;