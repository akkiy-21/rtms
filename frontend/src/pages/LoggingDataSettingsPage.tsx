// src/pages/LoggingDataSettingsPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LoggingDataSetting, LoggingSetting } from '../types/logging';
import { getLoggingSettings, deleteLoggingDataSetting, getDevice } from '../services/api';
import { Device } from '../types/device';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { createLoggingDataSettingColumns } from '@/components/features/logging/logging-data-setting-columns';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { useApiError } from '@/hooks/use-api-error';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { LOGGING_LABELS } from '../localization/constants/logging-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

const LoggingDataSettingsPage: React.FC = () => {
  const { deviceId, loggingSettingId } = useParams<{ deviceId: string; loggingSettingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleError } = useApiError();
  
  const [loggingDataSettings, setLoggingDataSettings] = useState<LoggingDataSetting[]>([]);
  const [parentLoggingSetting, setParentLoggingSetting] = useState<LoggingSetting | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<LoggingDataSetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [deviceId, loggingSettingId]);

  const fetchData = async () => {
    if (deviceId && loggingSettingId) {
      try {
        setLoading(true);
        const [loggingSettings, fetchedDevice] = await Promise.all([
          getLoggingSettings(parseInt(deviceId)),
          getDevice(parseInt(deviceId))
        ]);
        const currentSetting = loggingSettings.find(setting => setting.id === parseInt(loggingSettingId));
        if (currentSetting) {
          setParentLoggingSetting(currentSetting);
          setLoggingDataSettings(currentSetting.logging_data || []);
        }
        setDevice(fetchedDevice);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (setting: LoggingDataSetting) => {
    navigate(`/devices/${deviceId}/detail-settings/logging-settings/${loggingSettingId}/edit/${setting.id}`);
  };

  const handleDeleteClick = (setting: LoggingDataSetting) => {
    setSettingToDelete(setting);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (settingToDelete && deviceId && loggingSettingId) {
      try {
        await deleteLoggingDataSetting(parseInt(deviceId), parseInt(loggingSettingId), settingToDelete.id);
        toast({
          title: "成功",
          description: MESSAGE_FORMATTER.SUCCESS_DELETE(LOGGING_LABELS.LOGGING_DATA_SETTING),
        });
        fetchData();
      } catch (error) {
        handleError(error);
      } finally {
        setDeleteDialogOpen(false);
        setSettingToDelete(null);
      }
    }
  };

  const columns = createLoggingDataSettingColumns({
    deviceId: parseInt(deviceId || '0'),
    loggingSettingId: parseInt(loggingSettingId || '0'),
    onEdit: handleEdit,
    onDelete: handleDeleteClick,
  });

  const breadcrumbs = [
    { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
    { label: device?.name || `Device ${deviceId}`, href: `/devices/${deviceId}/edit` },
    { label: `${NAVIGATION_LABELS.DETAILS}${NAVIGATION_LABELS.SETTINGS}`, href: `/devices/${deviceId}/detail-settings` },
    { label: NAVIGATION_LABELS.LOGGING_SETTINGS, href: `/devices/${deviceId}/detail-settings/logging-settings` },
    { label: parentLoggingSetting?.logging_name || LOGGING_LABELS.LOGGING_SETTING },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={NAVIGATION_LABELS.LOGGING_DATA_SETTINGS}
        description={LOGGING_LABELS.DESCRIPTIONS.DATA_SETTINGS_PAGE.replace('{loggingName}', parentLoggingSetting?.logging_name || '')}
        breadcrumbs={breadcrumbs}
        actions={
          <Button asChild>
            <Link to={`/devices/${deviceId}/detail-settings/logging-settings/${loggingSettingId}/create`}>
              <Plus className="mr-2 h-4 w-4" />
              {LOGGING_LABELS.ACTIONS.ADD_NEW_DATA_SETTING}
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={loggingDataSettings}
        searchKey="data_name"
        searchPlaceholder={LOGGING_LABELS.PLACEHOLDERS.SEARCH_BY_DATA_NAME}
        isLoading={loading}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={LOGGING_LABELS.ACTIONS.DELETE_DATA_SETTING}
        description={`「${settingToDelete?.data_name}」を削除してもよろしいですか？${LOGGING_LABELS.MESSAGES.DELETE_WARNING}。`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default LoggingDataSettingsPage;