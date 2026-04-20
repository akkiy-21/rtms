// DevicesPage.tsx
// デバイス一覧ページ - shadcn/ui版

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { useApiError } from '@/hooks/use-api-error';
import { getDevices, deleteDevice } from '../services/api';
import { Device } from '../types/device';
import { createDeviceColumns } from '@/components/features/devices/device-columns';
import { Plus } from 'lucide-react';
import { DEVICE_LABELS } from '@/localization/constants/device-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<number | null>(null);
  const navigate = useNavigate();
  const { handleError } = useApiError();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDevices = await getDevices();
      setDevices(fetchedDevices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : MESSAGE_FORMATTER.ERROR_FETCH(DEVICE_LABELS.DEVICES);
      setError(errorMessage);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (id: number) => {
    navigate(`/devices/${id}/edit`);
  };

  const handleDeleteClick = (id: number) => {
    setDeviceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDetailSettingsClick = (id: number) => {
    navigate(`/devices/${id}/detail-settings`);
  };

  const handleDeleteConfirm = async () => {
    if (deviceToDelete === null) return;

    try {
      await deleteDevice(deviceToDelete);
      await fetchDevices();
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
    } catch (err) {
      handleError(err);
    }
  };

  const columns = createDeviceColumns(handleEditClick, handleDeleteClick, handleDetailSettingsClick);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={fetchDevices} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={DEVICE_LABELS.PAGES.LIST}
        description={`システムの${DEVICE_LABELS.DEVICES}を管理します`}
        actions={
          <Button onClick={() => navigate('/devices/create')}>
            <Plus className="mr-2 h-4 w-4" />
            {ACTION_LABELS.CREATE_NEW}{DEVICE_LABELS.DEVICE}
          </Button>
        }
      />
      
      <DataTable
        columns={columns}
        data={devices}
        searchKey="name"
        searchPlaceholder={DEVICE_LABELS.PLACEHOLDERS.SEARCH}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={DEVICE_LABELS.ACTIONS.DELETE_DEVICE}
        description={MESSAGE_FORMATTER.CONFIRM_DELETE(DEVICE_LABELS.DEVICE)}
      />
    </div>
  );
};

export default DevicesPage;