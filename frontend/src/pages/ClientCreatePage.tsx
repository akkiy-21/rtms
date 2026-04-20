// ClientCreatePage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientForm from '../components/ClientForm';
import { ClientFormData } from '@/components/features/clients/client-form-schema';
import { createClient, getDevice } from '../services/api';
import { Device } from '../types/device';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { NAVIGATION_LABELS } from '@/localization/constants/navigation-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const ClientCreatePage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [device, setDevice] = useState<Device | null>(null);

  React.useEffect(() => {
    const fetchDevice = async () => {
      if (deviceId) {
        try {
          const fetchedDevice = await getDevice(parseInt(deviceId));
          setDevice(fetchedDevice);
        } catch (error) {
          console.error('Failed to fetch device:', error);
        }
      }
    };
    fetchDevice();
  }, [deviceId]);

  const handleSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      await createClient(parseInt(deviceId!), data);
      toast({
        title: '成功',
        description: MESSAGE_FORMATTER.SUCCESS_CREATE('クライアント'),
      });
      navigate(`/devices/${deviceId}/detail-settings/client-settings`);
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: MESSAGE_FORMATTER.ERROR_CREATE('クライアント'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/devices/${deviceId}/detail-settings/client-settings`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${ACTION_LABELS.CREATE_NEW}クライアント`}
        description={`この${BUSINESS_TERMS.DEVICE}に新しいPLCクライアントを追加します`}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device?.name || `${BUSINESS_TERMS.DEVICE} ${deviceId}`, href: `/devices/${deviceId}/edit` },
          { label: NAVIGATION_LABELS.DEVICE_DETAILS, href: `/devices/${deviceId}/detail-settings` },
          { label: NAVIGATION_LABELS.CLIENT_SETTINGS, href: `/devices/${deviceId}/detail-settings/client-settings` },
          { label: ACTION_LABELS.CREATE },
        ]}
      />
      <ClientForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ClientCreatePage;