import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Play, Pencil, Trash2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getDevice } from '../services/api';
import {
  getConnectors,
  createConnector,
  updateConnector,
  deleteConnector,
  triggerConnector,
  getConnectorLogs,
} from '../services/connectorApi';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';
import { ConnectorLog, DeviceConnector, DeviceConnectorCreate, DeviceConnectorUpdate } from '../types/connector';
import { Device } from '../types/device';
import ConnectorForm from '../components/ConnectorForm';

const ExternalConnectorsPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [connectors, setConnectors] = useState<DeviceConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConnector, setEditingConnector] = useState<DeviceConnector | null>(null);
  const [deleteConnectorId, setDeleteConnectorId] = useState<number | null>(null);
  const [triggeringId, setTriggeringId] = useState<number | null>(null);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [logsConnector, setLogsConnector] = useState<DeviceConnector | null>(null);
  const [logs, setLogs] = useState<ConnectorLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const { toast } = useToast();

  const deviceIdInt = deviceId ? parseInt(deviceId) : 0;

  useEffect(() => {
    fetchAll();
  }, [deviceId]);

  const fetchAll = async () => {
    if (!deviceIdInt) return;
    try {
      setLoading(true);
      setError(null);
      const [fetchedDevice, fetchedConnectors] = await Promise.all([
        getDevice(deviceIdInt),
        getConnectors(deviceIdInt),
      ]);
      setDevice(fetchedDevice);
      setConnectors(fetchedConnectors);
    } catch {
      setError(SETTINGS_LABELS.CONNECTOR_FETCH_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingConnector(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (connector: DeviceConnector) => {
    setEditingConnector(connector);
    setDialogOpen(true);
  };

  const handleSave = async (data: DeviceConnectorCreate | DeviceConnectorUpdate) => {
    try {
      if (editingConnector) {
        await updateConnector(deviceIdInt, editingConnector.id, data as DeviceConnectorUpdate);
      } else {
        await createConnector(deviceIdInt, data as DeviceConnectorCreate);
      }
      setDialogOpen(false);
      await fetchAll();
      toast({ title: editingConnector ? SETTINGS_LABELS.CONNECTOR_EDIT : SETTINGS_LABELS.CONNECTOR_ADD, description: '保存しました' });
    } catch {
      toast({ title: SETTINGS_LABELS.CONNECTOR_SAVE_FAILED, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (deleteConnectorId === null) return;
    try {
      await deleteConnector(deviceIdInt, deleteConnectorId);
      setDeleteConnectorId(null);
      await fetchAll();
      toast({ title: SETTINGS_LABELS.CONNECTOR_DELETE, description: '削除しました' });
    } catch {
      toast({ title: SETTINGS_LABELS.CONNECTOR_DELETE_FAILED, variant: 'destructive' });
    }
  };

  const handleTrigger = async (connector: DeviceConnector) => {
    setTriggeringId(connector.id);
    try {
      await triggerConnector(deviceIdInt, connector.id);
      toast({ title: SETTINGS_LABELS.CONNECTOR_TRIGGER, description: SETTINGS_LABELS.CONNECTOR_TRIGGER_QUEUED });
      // タスクは非同期実行のため、完了後に last_sent_at が更新される想定で遅延再取得
      setTimeout(() => fetchAll(), 4000);
    } catch {
      toast({ title: SETTINGS_LABELS.CONNECTOR_TRIGGER_FAILED, variant: 'destructive' });
    } finally {
      setTriggeringId(null);
    }
  };

  const handleOpenLogs = async (connector: DeviceConnector) => {
    setLogsConnector(connector);
    setLogsDialogOpen(true);
    setLogsLoading(true);
    try {
      const data = await getConnectorLogs(deviceIdInt, connector.id);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const formatLastSentAt = (value: string | null) => {
    if (!value) return SETTINGS_LABELS.CONNECTOR_NOT_SENT_YET;
    return new Date(value).toLocaleString('ja-JP');
  };

  const getConnectorTypeLabel = (type: string) => {
    return SETTINGS_LABELS.CONNECTOR_TYPES[type] ?? type;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} retry={fetchAll} />;
  if (!device) return <ErrorMessage message={SETTINGS_LABELS.DEVICE_NOT_FOUND} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={NAVIGATION_LABELS.EXTERNAL_CONNECTORS}
        description={SETTINGS_LABELS.EXTERNAL_CONNECTORS_DESCRIPTION}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device.name, href: `/devices/${device.id}/edit` },
          {
            label: NAVIGATION_LABELS.DETAILS + NAVIGATION_LABELS.SETTINGS,
            href: `/devices/${device.id}/detail-settings`,
          },
          { label: NAVIGATION_LABELS.EXTERNAL_CONNECTORS },
        ]}
      />

      <div className="flex justify-end">
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {SETTINGS_LABELS.CONNECTOR_ADD}
        </Button>
      </div>

      {connectors.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          コネクタがまだ登録されていません
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">{SETTINGS_LABELS.CONNECTOR_NAME}</th>
                <th className="px-4 py-3 text-left font-medium">{SETTINGS_LABELS.CONNECTOR_TYPE}</th>
                <th className="px-4 py-3 text-left font-medium">{SETTINGS_LABELS.CONNECTOR_SEND_INTERVAL}</th>
                <th className="px-4 py-3 text-left font-medium">{SETTINGS_LABELS.CONNECTOR_IS_ENABLED}</th>
                <th className="px-4 py-3 text-left font-medium">{SETTINGS_LABELS.CONNECTOR_LAST_SENT_AT}</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {connectors.map((connector) => (
                <tr key={connector.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{connector.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {getConnectorTypeLabel(connector.connector_type)}
                  </td>
                  <td className="px-4 py-3">{connector.send_interval_minutes}分</td>
                  <td className="px-4 py-3">
                    <Badge variant={connector.is_enabled ? 'default' : 'secondary'}>
                      {connector.is_enabled ? '有効' : '無効'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatLastSentAt(connector.last_sent_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenLogs(connector)}
                        title="送信履歴"
                      >
                        <History className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTrigger(connector)}
                        disabled={triggeringId === connector.id}
                        title={SETTINGS_LABELS.CONNECTOR_TRIGGER}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEdit(connector)}
                        title={SETTINGS_LABELS.CONNECTOR_EDIT}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConnectorId(connector.id)}
                        title={SETTINGS_LABELS.CONNECTOR_DELETE}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 履歴ダイアログ */}
      <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>送信履歴：{logsConnector?.name}</DialogTitle>
            <DialogDescription>最新50件の送信結果（自動・手動問わず）</DialogDescription>
          </DialogHeader>
          {logsLoading ? (
            <div className="py-8 flex justify-center"><LoadingSpinner /></div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">履歴がありません</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">日時</th>
                  <th className="px-3 py-2 text-left font-medium">種別</th>
                  <th className="px-3 py-2 text-left font-medium">結果</th>
                  <th className="px-3 py-2 text-left font-medium">件数</th>
                  <th className="px-3 py-2 text-left font-medium">詳細</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      {new Date(log.triggered_at + 'Z').toLocaleString('ja-JP')}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline">{log.is_manual ? '手動' : '自動'}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={
                          log.status === 'success' ? 'default'
                          : log.status === 'no_data' ? 'secondary'
                          : 'destructive'
                        }
                      >
                        {log.status === 'success' ? '成功'
                          : log.status === 'no_data' ? 'データなし'
                          : '失敗'}
                      </Badge>
                      {log.status_code && (
                        <span className="ml-1 text-xs text-muted-foreground">({log.status_code})</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {log.records_count != null ? `${log.records_count}件` : '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.error_message ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DialogContent>
      </Dialog>

      {/* 追加/編集ダイアログ */}}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConnector ? SETTINGS_LABELS.CONNECTOR_EDIT : SETTINGS_LABELS.CONNECTOR_ADD}
            </DialogTitle>
            <DialogDescription>{SETTINGS_LABELS.EXTERNAL_CONNECTORS_DESCRIPTION}</DialogDescription>
          </DialogHeader>
          <ConnectorForm
            initialValues={editingConnector ?? undefined}
            onSubmit={handleSave}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <ConfirmationDialog
        open={deleteConnectorId !== null}
        onOpenChange={(open) => { if (!open) setDeleteConnectorId(null); }}
        title={SETTINGS_LABELS.CONNECTOR_DELETE}
        description={SETTINGS_LABELS.CONNECTOR_DELETE_CONFIRM}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ExternalConnectorsPage;
