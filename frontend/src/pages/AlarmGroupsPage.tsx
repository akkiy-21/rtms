// AlarmGroupsPage.tsx
// Alarm Groupsの一覧ページ（shadcn/ui版）

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { useApiError } from '@/hooks/use-api-error';
import { useToast } from '@/hooks/use-toast';
import { createAlarmGroupColumns } from '@/components/features/alarms/alarm-group-columns';
import { getAlarmGroups, deleteAlarmGroup, getClientsForDevice, getDevice } from '@/services/api';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { ALARM_LABELS } from '../localization/constants/alarm-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';
import { AlarmGroup } from '@/types/alarm';
import { Client } from '@/types/client';
import { Device } from '@/types/device';
import { Plus } from 'lucide-react';

const AlarmGroupsPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const { toast } = useToast();

  const [alarmGroups, setAlarmGroups] = useState<AlarmGroup[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [deviceId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (deviceId) {
        const [fetchedGroups, fetchedClients, fetchedDevice] = await Promise.all([
          getAlarmGroups(parseInt(deviceId)),
          getClientsForDevice(parseInt(deviceId)),
          getDevice(parseInt(deviceId)),
        ]);
        setAlarmGroups(fetchedGroups);
        setClients(fetchedClients);
        setDevice(fetchedDevice);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : MESSAGE_FORMATTER.ERROR_FETCH(ALARM_LABELS.ALARM_GROUPS);
      setError(errorMessage);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (groupId: number) => {
    setSelectedGroupId(groupId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deviceId && selectedGroupId !== null) {
      try {
        await deleteAlarmGroup(parseInt(deviceId), selectedGroupId);
        toast({
          title: '成功',
          description: MESSAGE_FORMATTER.SUCCESS_DELETE(ALARM_LABELS.ALARM_GROUP),
        });
        fetchData();
      } catch (err) {
        handleError(err);
      } finally {
        setDeleteDialogOpen(false);
        setSelectedGroupId(null);
      }
    }
  };

  const handleEdit = (groupId: number) => {
    navigate(`/devices/${deviceId}/detail-settings/alarm-groups/${groupId}/edit`);
  };

  const handleViewAddresses = (groupId: number) => {
    navigate(`/devices/${deviceId}/detail-settings/alarm-groups/${groupId}/addresses`);
  };

  const columns = createAlarmGroupColumns({
    deviceId: parseInt(deviceId || '0'),
    clients,
    onDelete: handleDeleteClick,
    onEdit: handleEdit,
    onViewAddresses: handleViewAddresses,
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={fetchData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={NAVIGATION_LABELS.ALARM_GROUPS}
        description={`${ALARM_LABELS.ALARM_GROUPS}を管理します`}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device?.name || `${NAVIGATION_LABELS.DEVICES} ${deviceId}`, href: `/devices/${deviceId}/edit` },
          { label: `${NAVIGATION_LABELS.DETAILS}${NAVIGATION_LABELS.SETTINGS}`, href: `/devices/${deviceId}/detail-settings` },
          { label: NAVIGATION_LABELS.ALARM_GROUPS },
        ]}
        actions={
          <Button onClick={() => navigate(`/devices/${deviceId}/detail-settings/alarm-groups/create`)}>
            <Plus className="h-4 w-4 mr-2" />
            {ACTION_LABELS.CREATE_NEW}{ALARM_LABELS.ALARM_GROUP}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={alarmGroups}
        searchKey="name"
        searchPlaceholder={ALARM_LABELS.PLACEHOLDERS.SEARCH_GROUPS}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={ALARM_LABELS.ACTIONS.DELETE_GROUP}
        description={MESSAGE_FORMATTER.CONFIRM_DELETE(ALARM_LABELS.ALARM_GROUP)}
      />
    </div>
  );
};

export default AlarmGroupsPage;