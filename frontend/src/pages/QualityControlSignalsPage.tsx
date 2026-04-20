import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { DataTable } from '@/components/common/data-table';
import { useToast } from '@/hooks/use-toast';
import { getQualityControlSignals, createQualityControlSignal, updateQualityControlSignal, deleteQualityControlSignal, getClientsForDevice, getPLC, getDevice } from '../services/api';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';
import { QualityControlSignal, SignalType, QualityControlSignalCreateData, QualityControlSignalUpdateData, QualityControlSignalUpdateDataWithStringParentId } from '../types/qualityControl';
import { Client } from '../types/client';
import { PLCWithAddressRanges } from '../types/plc';
import { Device } from '../types/device';
import QualityControlSignalForm from '../components/QualityControlSignalForm';
import { createQualityControlSignalColumns } from '../components/features/quality-control/quality-control-signal-columns';
import { flattenQualityControlSignals, buildSignalHierarchy } from '../utils/quality-control-helpers';

const QualityControlSignalsPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [qualityControlSignals, setQualityControlSignals] = useState<QualityControlSignal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [plcs, setPLCs] = useState<PLCWithAddressRanges[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSignal, setEditingSignal] = useState<QualityControlSignal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteSignalId, setDeleteSignalId] = useState<number | null>(null);
  const [parentSignalForNewChild, setParentSignalForNewChild] = useState<QualityControlSignal | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (deviceId) {
        try {
          const deviceIdInt = parseInt(deviceId);
          const [fetchedSignals, fetchedClients, fetchedDevice] = await Promise.all([
            getQualityControlSignals(deviceIdInt),
            getClientsForDevice(deviceIdInt),
            getDevice(deviceIdInt)
          ]);
          
          setQualityControlSignals(fetchedSignals);
          setClients(fetchedClients);
          setDevice(fetchedDevice);

          const plcIds = Array.from(new Set(fetchedClients.map(client => client.plc.id)));
          const plcPromises = plcIds.map(id => getPLC(id));
          const fetchedPLCs = await Promise.all(plcPromises);
          setPLCs(fetchedPLCs);
        } catch (err) {
          console.error('Failed to fetch data:', err);
          setError(SETTINGS_LABELS.DATA_LOAD_FAILED);
          toast({
            variant: "destructive",
            title: SETTINGS_LABELS.ERROR,
            description: SETTINGS_LABELS.DATA_LOAD_FAILED,
          });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [deviceId, toast]);

  const handleCreate = async (formData: QualityControlSignalCreateData) => {
    if (deviceId) {
      try {
        const deviceIdInt = parseInt(deviceId);
        await createQualityControlSignal(deviceIdInt, formData);
        
        // データを再取得して最新の状態を反映
        const fetchedSignals = await getQualityControlSignals(deviceIdInt);
        setQualityControlSignals(fetchedSignals);
        
        setEditingSignal(null);
        setParentSignalForNewChild(null);
        toast({
          title: SETTINGS_LABELS.SUCCESS,
          description: SETTINGS_LABELS.SIGNAL_CREATED,
        });
      } catch (error) {
        console.error('Failed to create quality control signal:', error);
        toast({
          variant: "destructive",
          title: SETTINGS_LABELS.ERROR,
          description: SETTINGS_LABELS.SIGNAL_CREATE_FAILED,
        });
      }
    }
  };
  
  const handleUpdate = async (formData: QualityControlSignalUpdateDataWithStringParentId) => {
    if (deviceId && editingSignal) {
      const deviceIdInt = parseInt(deviceId);
      const updatedData: QualityControlSignalUpdateData = {
        ...formData,
        parent_id: formData.parent_id === '' ? null : 
                   (typeof formData.parent_id === 'string' ? parseInt(formData.parent_id) : formData.parent_id)
      };
      try {
        await updateQualityControlSignal(deviceIdInt, editingSignal.id, updatedData);
        
        // データを再取得して最新の状態を反映
        const fetchedSignals = await getQualityControlSignals(deviceIdInt);
        setQualityControlSignals(fetchedSignals);
        
        setEditingSignal(null);
        toast({
          title: SETTINGS_LABELS.SUCCESS,
          description: SETTINGS_LABELS.SIGNAL_UPDATED,
        });
      } catch (error) {
        console.error('Failed to update quality control signal:', error);
        toast({
          variant: "destructive",
          title: SETTINGS_LABELS.ERROR,
          description: SETTINGS_LABELS.SIGNAL_UPDATE_FAILED,
        });
      }
    }
  };

  const handleDelete = async (signalId: number) => {
    if (deviceId) {
      try {
        const deviceIdInt = parseInt(deviceId);
        await deleteQualityControlSignal(deviceIdInt, signalId);
        
        // データを再取得して最新の状態を反映
        const fetchedSignals = await getQualityControlSignals(deviceIdInt);
        setQualityControlSignals(fetchedSignals);
        
        setDeleteSignalId(null);
        toast({
          title: SETTINGS_LABELS.SUCCESS,
          description: SETTINGS_LABELS.SIGNAL_DELETED,
        });
      } catch (error) {
        console.error('Failed to delete quality control signal:', error);
        toast({
          variant: "destructive",
          title: SETTINGS_LABELS.ERROR,
          description: SETTINGS_LABELS.SIGNAL_DELETE_FAILED,
        });
      }
    }
  };

  const handleEdit = (signal: QualityControlSignal) => {
    setEditingSignal(signal);
    setParentSignalForNewChild(null);
    setDialogOpen(true);
  };

  const handleAddChild = (parentSignal: QualityControlSignal) => {
    setParentSignalForNewChild(parentSignal);
    setEditingSignal({
      id: 0,
      device_id: parseInt(deviceId!),
      client_id: parentSignal.client_id, // 親と同じクライアントをデフォルトに
      address_type: '',
      address: '',
      signal_type: SignalType.Good,
      signal_shot_number: 0,
      signal_name: '',
      parent_id: parentSignal.id,
      children: []
    });
    setDialogOpen(true);
  };

  const handleOpenDialog = (signal: QualityControlSignal | null) => {
    setEditingSignal(signal || {
      id: 0,
      device_id: parseInt(deviceId!),
      client_id: 0,
      address_type: '',
      address: '',
      signal_type: SignalType.Good,
      signal_shot_number: 0,
      signal_name: '',
      parent_id: null,
      children: []
    });
    setParentSignalForNewChild(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSignal(null);
    setParentSignalForNewChild(null);
  };

  const handleSubmit = async (formData: QualityControlSignalCreateData | QualityControlSignalUpdateDataWithStringParentId) => {
    if (editingSignal?.id === 0) {
      await handleCreate(formData as QualityControlSignalCreateData);
    } else {
      await handleUpdate(formData as QualityControlSignalUpdateDataWithStringParentId);
    }
    handleCloseDialog();
  };

  // テーブル表示用にデータを平坦化
  const flattenedSignals = flattenQualityControlSignals(
    buildSignalHierarchy(qualityControlSignals)
  );

  // カラム定義を作成
  const columns = createQualityControlSignalColumns({
    deviceId: parseInt(deviceId || '0'),
    clients,
    onEdit: handleEdit,
    onDelete: setDeleteSignalId,
    onAddChild: handleAddChild,
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={NAVIGATION_LABELS.QUALITY_CONTROL_SIGNALS}
        description={SETTINGS_LABELS.MANAGE_QUALITY_SIGNALS}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device?.name || `Device ${deviceId}`, href: `/devices/${deviceId}/edit` },
          { label: NAVIGATION_LABELS.DETAILS + NAVIGATION_LABELS.SETTINGS, href: `/devices/${deviceId}/detail-settings` },
          { label: NAVIGATION_LABELS.QUALITY_CONTROL_SIGNALS },
        ]}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog(null)}>
                <Plus className="h-4 w-4 mr-2" />
                {SETTINGS_LABELS.ADD_NEW_SIGNAL}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSignal?.id === 0 ? SETTINGS_LABELS.ADD_NEW_SIGNAL : SETTINGS_LABELS.EDIT_SIGNAL}
                </DialogTitle>
                <DialogDescription>
                  {editingSignal?.id === 0 ? 
                    "新しい品質管理信号を追加します。" : 
                    "品質管理信号の設定を編集します。"
                  }
                </DialogDescription>
              </DialogHeader>
              {editingSignal && (
                <QualityControlSignalForm
                  qualityControlSignal={editingSignal}
                  onSubmit={handleSubmit}
                  clients={clients}
                  addressRanges={plcs.flatMap(plc => plc.address_ranges)}
                  parentSignals={qualityControlSignals.filter(s => s.id !== editingSignal.id)}
                />
              )}
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={flattenedSignals}
        searchKey="signal_name"
        searchPlaceholder="シグナル名で検索..."
      />

      <ConfirmationDialog
        open={deleteSignalId !== null}
        onOpenChange={(open) => !open && setDeleteSignalId(null)}
        title={SETTINGS_LABELS.DELETE_SIGNAL}
        description={SETTINGS_LABELS.SIGNAL_DELETE_CONFIRM}
        onConfirm={() => deleteSignalId && handleDelete(deleteSignalId)}
      />
    </div>
  );
};

export default QualityControlSignalsPage;