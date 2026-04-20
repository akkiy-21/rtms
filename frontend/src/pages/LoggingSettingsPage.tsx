// src/pages/LoggingSettingsPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { useApiError } from '@/hooks/use-api-error';
import { createLoggingSettingColumns } from '@/components/features/logging/logging-setting-columns';
import { getLoggingSettings, deleteLoggingSetting, getClientsForDevice, getDevice } from '../services/api';
import { LoggingSetting } from '../types/logging';
import { Client } from '../types/client';
import { Device } from '../types/device';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { LOGGING_LABELS } from '../localization/constants/logging-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';
import { Plus } from 'lucide-react';

const LoggingSettingsPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleError } = useApiError();
  const [loggingSettings, setLoggingSettings] = useState<LoggingSetting[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<LoggingSetting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [deviceId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchLoggingSettings(), fetchClients(), fetchDevice()]);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDevice = async () => {
    if (deviceId) {
      const fetchedDevice = await getDevice(parseInt(deviceId));
      setDevice(fetchedDevice);
    }
  };

  const fetchLoggingSettings = async () => {
    if (deviceId) {
      const fetchedSettings = await getLoggingSettings(parseInt(deviceId));
      setLoggingSettings(fetchedSettings);
    }
  };

  const fetchClients = async () => {
    if (deviceId) {
      const fetchedClients = await getClientsForDevice(parseInt(deviceId));
      setClients(fetchedClients);
    }
  };

  const handleEdit = (setting: LoggingSetting) => {
    navigate(`/devices/${deviceId}/detail-settings/logging-settings/${setting.id}/edit`);
  };

  const handleDelete = (setting: LoggingSetting) => {
    setSettingToDelete(setting);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (settingToDelete && deviceId) {
      try {
        await deleteLoggingSetting(parseInt(deviceId), settingToDelete.id);
        toast({
          title: "成功",
          description: MESSAGE_FORMATTER.SUCCESS_DELETE(LOGGING_LABELS.LOGGING_SETTING),
        });
        fetchLoggingSettings();
      } catch (error) {
        handleError(error);
      }
    }
    setDeleteDialogOpen(false);
    setSettingToDelete(null);
  };

  const handleViewData = (setting: LoggingSetting) => {
    navigate(`/devices/${deviceId}/detail-settings/logging-settings/${setting.id}/data`);
  };

  const handleCreate = () => {
    navigate(`/devices/${deviceId}/detail-settings/logging-settings/create`);
  };

  const columns = createLoggingSettingColumns({
    clients,
    deviceId: parseInt(deviceId || '0'),
    onEdit: handleEdit,
    onDelete: handleDelete,
    onViewData: handleViewData,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={NAVIGATION_LABELS.LOGGING_SETTINGS}
        description={LOGGING_LABELS.DESCRIPTIONS.LOGGING_SETTINGS_PAGE}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device?.name || `Device ${deviceId}`, href: `/devices/${deviceId}/edit` },
          { label: `${NAVIGATION_LABELS.DETAILS}${NAVIGATION_LABELS.SETTINGS}`, href: `/devices/${deviceId}/detail-settings` },
          { label: NAVIGATION_LABELS.LOGGING_SETTINGS },
        ]}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {LOGGING_LABELS.ACTIONS.CREATE_NEW_LOGGING_SETTING}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={loggingSettings}
        searchKey="logging_name"
        searchPlaceholder={LOGGING_LABELS.PLACEHOLDERS.SEARCH_LOGGING_SETTINGS}
        isLoading={isLoading}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={LOGGING_LABELS.ACTIONS.DELETE_LOGGING_SETTING}
        description={`「${settingToDelete?.logging_name}」を削除してもよろしいですか？${LOGGING_LABELS.MESSAGES.DELETE_WARNING}。`}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default LoggingSettingsPage;