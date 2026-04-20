// ClientSettingsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDevice, getClientsForDevice, deleteClient } from '../services/api';
import { Device } from '../types/device';
import { Client } from '../types/client';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { createClientColumns } from '@/components/features/clients/client-columns';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { BUSINESS_TERMS } from '../localization/constants/business-terms';
import { TECHNICAL_TERMS } from '../localization/constants/technical-terms';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

const ClientSettingsPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [device, setDevice] = useState<Device | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (deviceId) {
      fetchDevice(parseInt(deviceId));
      fetchClients(parseInt(deviceId));
    }
  }, [deviceId]);

  const fetchDevice = async (id: number) => {
    try {
      const fetchedDevice = await getDevice(id);
      setDevice(fetchedDevice);
    } catch (error) {
      console.error('Failed to fetch device:', error);
      setError(`${BUSINESS_TERMS.DEVICE}${BUSINESS_TERMS.INFORMATION}の取得に失敗しました`);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async (id: number) => {
    try {
      const fetchedClients = await getClientsForDevice(id);
      setClients(fetchedClients);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setError('クライアントの取得に失敗しました');
    }
  };

  const handleEdit = (clientId: number) => {
    navigate(`/devices/${deviceId}/detail-settings/client-settings/${clientId}/edit`);
  };

  const handleDeleteClick = (clientId: number) => {
    setClientToDelete(clientId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (clientToDelete && deviceId) {
      try {
        await deleteClient(parseInt(deviceId), clientToDelete);
        toast({
          title: '成功',
          description: MESSAGE_FORMATTER.SUCCESS_DELETE('クライアント'),
        });
        fetchClients(parseInt(deviceId));
      } catch (error) {
        console.error('Error deleting client:', error);
        toast({
          variant: 'destructive',
          title: 'エラー',
          description: MESSAGE_FORMATTER.ERROR_DELETE('クライアント'),
        });
      } finally {
        setDeleteDialogOpen(false);
        setClientToDelete(null);
      }
    }
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
          if (deviceId) {
            fetchDevice(parseInt(deviceId));
            fetchClients(parseInt(deviceId));
          }
        }}
      />
    );
  }

  if (!device) {
    return <ErrorMessage message={MESSAGE_FORMATTER.ERROR_NOT_FOUND(BUSINESS_TERMS.DEVICE)} />;
  }

  const columns = createClientColumns({
    deviceId: parseInt(deviceId!),
    onEdit: handleEdit,
    onDelete: handleDeleteClick,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`クライアント${BUSINESS_TERMS.SETTINGS}`}
        description={`${TECHNICAL_TERMS.PLC}クライアントを管理します`}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device.name, href: `/devices/${deviceId}/edit` },
          { label: BUSINESS_TERMS.DETAILS + BUSINESS_TERMS.SETTINGS, href: `/devices/${deviceId}/detail-settings` },
          { label: NAVIGATION_LABELS.CLIENT_SETTINGS },
        ]}
        actions={
          <Button onClick={() => navigate(`/devices/${deviceId}/detail-settings/client-settings/create`)}>
            <Plus className="mr-2 h-4 w-4" />
            {ACTION_LABELS.ADD_NEW}クライアント
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={clients}
        searchKey="name"
        searchPlaceholder="クライアント名で検索..."
      />
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={`クライアント${ACTION_LABELS.DELETE}`}
        description={MESSAGE_FORMATTER.CONFIRM_DELETE('クライアント')}
      />
    </div>
  );
};

export default ClientSettingsPage;
