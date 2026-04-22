// DevicesPage.tsx
// デバイス一覧ページ - shadcn/ui版

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApiError } from '@/hooks/use-api-error';
import { useToast } from '@/hooks/use-toast';
import { createDeviceActionJob, createDeviceDeployJob, deleteDevice, getDeviceActionJob, getDevices, getTimeTables, listAppReleases } from '../services/api';
import { AppRelease, Device, DeviceActionJob } from '../types/device';
import { createDeviceColumns } from '@/components/features/devices/device-columns';
import { Package, Plus, RotateCcw } from 'lucide-react';
import { DEVICE_LABELS } from '@/localization/constants/device-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<number | null>(null);
  const [timeTableWarningOpen, setTimeTableWarningOpen] = useState(false);
  const [hasTimeTables, setHasTimeTables] = useState(true);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [appReleases, setAppReleases] = useState<AppRelease[]>([]);
  const [rebootDialogOpen, setRebootDialogOpen] = useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [pendingDevices, setPendingDevices] = useState<Device[]>([]);
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>('');
  const [activeJob, setActiveJob] = useState<DeviceActionJob | null>(null);
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const { toast } = useToast();

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedDevices, fetchedTimeTables, fetchedReleases] = await Promise.all([
        getDevices(),
        getTimeTables(),
        listAppReleases(),
      ]);
      setDevices(fetchedDevices);
      setAppReleases(fetchedReleases);
      const nextHasTimeTables = fetchedTimeTables.length > 0;
      setHasTimeTables(nextHasTimeTables);
      setTimeTableWarningOpen(!nextHasTimeTables);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : MESSAGE_FORMATTER.ERROR_FETCH(DEVICE_LABELS.DEVICES);
      setError(errorMessage);
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    fetchDevices();

    const handleWindowFocus = () => {
      fetchDevices();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDevices();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [fetchDevices]);

  useEffect(() => {
    if (!activeJob || !['queued', 'running'].includes(activeJob.status)) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const refreshedJob = await getDeviceActionJob(activeJob.id);
        setActiveJob(refreshedJob);
      } catch (err) {
        console.error('Failed to refresh device action job:', err);
      }
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [activeJob]);

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

  const openRebootDialog = (targetDevices: Device[]) => {
    setPendingDevices(targetDevices);
    setRebootDialogOpen(true);
  };

  const openDeployDialog = (targetDevices: Device[]) => {
    setPendingDevices(targetDevices);
    setSelectedReleaseId((current) => current || String(appReleases[0]?.id ?? ''));
    setDeployDialogOpen(true);
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

  const handleRebootConfirm = async () => {
    if (pendingDevices.length === 0) {
      return;
    }

    try {
      const job = await createDeviceActionJob({
        action_type: 'reboot',
        device_ids: pendingDevices.map((device) => device.id),
        scope: 'selection',
      });
      setActiveJob(job);
      setSelectedDevices([]);
      toast({
        title: '再起動ジョブを登録しました',
        description: `${pendingDevices.length} 台を対象に処理を開始しました`,
      });
      setRebootDialogOpen(false);
      setPendingDevices([]);
    } catch (err) {
      handleError(err);
    }
  };

  const handleDeployConfirm = async () => {
    if (pendingDevices.length === 0 || !selectedReleaseId) {
      return;
    }

    try {
      const job = await createDeviceDeployJob({
        release_id: Number(selectedReleaseId),
        device_ids: pendingDevices.map((device) => device.id),
        scope: 'selection',
      });
      setActiveJob(job);
      setSelectedDevices([]);
      toast({
        title: '更新ジョブを登録しました',
        description: `${pendingDevices.length} 台へ rtms-client の更新を開始しました`,
      });
      setDeployDialogOpen(false);
      setPendingDevices([]);
    } catch (err) {
      handleError(err);
    }
  };

  const selectionColumn: ColumnDef<Device> = {
    id: 'select',
    header: ({ table }) => {
      const filteredRows = table.getFilteredRowModel().rows;
      const allSelected = filteredRows.length > 0 && filteredRows.every((row) => row.getIsSelected());
      const someSelected = filteredRows.some((row) => row.getIsSelected());

      return (
        <Checkbox
          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
          onCheckedChange={(checked) => {
            filteredRows.forEach((row) => row.toggleSelected(Boolean(checked)));
          }}
          aria-label="表示中のデバイスをすべて選択"
        />
      );
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
        onClick={(event) => event.stopPropagation()}
        aria-label={`${row.original.name} を選択`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const columns = [
    selectionColumn,
    ...createDeviceColumns(
      handleEditClick,
      handleDeleteClick,
      handleDetailSettingsClick,
      (device) => openRebootDialog([device]),
      (device) => openDeployDialog([device]),
    ),
  ];

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
          <>
            <Button variant="outline" onClick={() => navigate('/app-releases')}>
              <Package className="mr-2 h-4 w-4" />
              アプリ配信
            </Button>
            <Button disabled={!hasTimeTables} onClick={() => navigate('/devices/create')}>
              <Plus className="mr-2 h-4 w-4" />
              {ACTION_LABELS.CREATE_NEW}{DEVICE_LABELS.DEVICE}
            </Button>
          </>
        }
      />

      {activeJob && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">実行中ジョブ</CardTitle>
            <CardDescription>
              ジョブ #{activeJob.id} / {activeJob.action_type} / 状態: {activeJob.status}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            <div className="rounded border p-3 text-sm">対象: {activeJob.total_items}</div>
            <div className="rounded border p-3 text-sm">待機中: {activeJob.queued_items}</div>
            <div className="rounded border p-3 text-sm">成功: {activeJob.succeeded_items}</div>
            <div className="rounded border p-3 text-sm">失敗: {activeJob.failed_items}</div>
            <div className="rounded border p-3 text-sm">スキップ: {activeJob.skipped_items}</div>
          </CardContent>
        </Card>
      )}
      
      <DataTable
        columns={columns}
        data={devices}
        searchKey="name"
        searchPlaceholder={DEVICE_LABELS.PLACEHOLDERS.SEARCH}
        enableRowSelection
        getRowId={(row) => String(row.id)}
        onSelectedRowsChange={setSelectedDevices}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">選択中: {selectedDevices.length} 台</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedDevices.length === 0}
              onClick={() => openRebootDialog(selectedDevices)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              再起動
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={selectedDevices.length === 0 || appReleases.length === 0}
              onClick={() => openDeployDialog(selectedDevices)}
            >
              <Package className="mr-2 h-4 w-4" />
              rtms-client 更新
            </Button>
          </div>
        }
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={DEVICE_LABELS.ACTIONS.DELETE_DEVICE}
        description={MESSAGE_FORMATTER.CONFIRM_DELETE(DEVICE_LABELS.DEVICE)}
      />

      <ConfirmationDialog
        open={rebootDialogOpen}
        onOpenChange={setRebootDialogOpen}
        onConfirm={handleRebootConfirm}
        title="デバイスを再起動"
        description={`${pendingDevices.length} 台のデバイスを再起動します。実行しますか？`}
        confirmLabel="再起動する"
      />

      <Dialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>rtms-client を更新</DialogTitle>
            <DialogDescription>
              {pendingDevices.length} 台に対して、選択したリリースを即時配信して更新します。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">対象デバイス: {pendingDevices.map((device) => device.name).join(', ')}</div>
            <Select value={selectedReleaseId} onValueChange={setSelectedReleaseId}>
              <SelectTrigger>
                <SelectValue placeholder="配信するリリースを選択" />
              </SelectTrigger>
              <SelectContent>
                {appReleases.map((release) => (
                  <SelectItem key={release.id} value={String(release.id)}>
                    {release.version} / {release.filename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeployDialogOpen(false)}>
              {ACTION_LABELS.CANCEL}
            </Button>
            <Button type="button" disabled={!selectedReleaseId} onClick={handleDeployConfirm}>
              更新を開始
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={timeTableWarningOpen} onOpenChange={setTimeTableWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タイムテーブルが未設定です</DialogTitle>
            <DialogDescription>
              デバイスを登録して client を正常に動作させるには、先にタイムテーブルを1件以上作成する必要があります。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTimeTableWarningOpen(false)}>
              閉じる
            </Button>
            <Button type="button" onClick={() => navigate('/time-table')}>
              タイムテーブル設定へ移動
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DevicesPage;