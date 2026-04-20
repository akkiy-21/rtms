// AlarmAddressesPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAlarmAddresses, getAlarmGroups, getClientsForDevice, getPLC, updateAlarmAddresses, getDevice } from '../services/api';
import { AlarmAddress, AlarmGroup, AlarmAddressFormData } from '../types/alarm';
import { Client } from '../types/client';
import { AddressRange } from '../types/plc';
import { Device } from '../types/device';
import CSVImporter from '../components/CSVImporter';
import AlarmAddressList from '../components/AlarmAddressList';
import AddressOffsetForm from '../components/AddressOffsetForm';
import { PageHeader } from '../components/layout/page-header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { ALARM_LABELS } from '@/localization/constants/alarm-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { NAVIGATION_LABELS } from '@/localization/constants/navigation-labels';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const AlarmAddressesPage: React.FC = () => {
  const { deviceId, groupId } = useParams<{ deviceId: string; groupId: string }>();
  const [addresses, setAddresses] = useState<AlarmAddress[]>([]);
  const [alarmGroup, setAlarmGroup] = useState<AlarmGroup | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [addressRanges, setAddressRanges] = useState<AddressRange[]>([]);
  const [isOffsetEnabled, setIsOffsetEnabled] = useState(false);
  const [offsetAddress, setOffsetAddress] = useState('0');
  const [offsetAddressType, setOffsetAddressType] = useState('');
  const [openEnableDialog, setOpenEnableDialog] = useState(false);
  const [openDisableDialog, setOpenDisableDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isNewCSVFormat, setIsNewCSVFormat] = useState(false);

  useEffect(() => {
    fetchData();
  }, [deviceId, groupId]);

  const fetchData = async () => {
    if (deviceId && groupId) {
      const [fetchedAddresses, fetchedGroups, fetchedClients, fetchedDevice] = await Promise.all([
        getAlarmAddresses(parseInt(deviceId), parseInt(groupId)),
        getAlarmGroups(parseInt(deviceId)),
        getClientsForDevice(parseInt(deviceId)),
        getDevice(parseInt(deviceId))
      ]);
      
      // コメントが含まれていることを確認
      setAddresses(fetchedAddresses.map(addr => ({
        ...addr,
        comments: addr.comments || [] // コメントがない場合は空の配列を設定
      })));
      
      const group = fetchedGroups.find(g => g.id === parseInt(groupId));
      setAlarmGroup(group || null);
      setDevice(fetchedDevice);
      
      if (group) {
        const groupClient = fetchedClients.find(c => c.id === group.client_id);
        setClient(groupClient || null);
        
        if (groupClient) {
          const plc = await getPLC(groupClient.plc.id);
          setAddressRanges(plc.address_ranges);
          if (plc.address_ranges.length > 0) {
            setOffsetAddressType(plc.address_ranges[0].address_type);
          }
        }
      }
    }
  };

  const handleCSVImport = (importedAddresses: AlarmAddress[], commentCount?: number) => {
    // 新しいCSVフォーマットの判別
    const isNewFormat = importedAddresses.some(addr => addr.address.includes('.'));
    setIsNewCSVFormat(isNewFormat);
    setAddresses(importedAddresses);
  };



  const handleConfirmEnable = () => {
    setIsOffsetEnabled(true);
    setOpenEnableDialog(false);
  };

  const handleConfirmDisable = () => {
    setIsOffsetEnabled(false);
    setOffsetAddress('0');
    setAddresses([]); // Reset addresses
    setOpenDisableDialog(false);
  };

  const handleCancelDialog = () => {
    setOpenEnableDialog(false);
    setOpenDisableDialog(false);
  };

  const handleOffsetChange = (addressType: string, address: string) => {
    setOffsetAddressType(addressType);
    setOffsetAddress(address);
  };

  const applyOffset = (originalAddresses: AlarmAddress[]): AlarmAddress[] => {
    if (!isOffsetEnabled) return originalAddresses;

    const selectedRange = addressRanges.find(range => range.address_type === offsetAddressType);
    if (!selectedRange) return originalAddresses;

    const offsetValue = parseInt(offsetAddress, selectedRange.numerical_base === 'hex' ? 16 : 10);

    return originalAddresses.map((addr, index) => {
      const originalAddressValue = parseInt(addr.address, 10);

      let newAddressValue;
      if (isNewCSVFormat) {
        // 新しいCSVフォーマットの場合
        newAddressValue = originalAddressValue + offsetValue;
      } else {
        // 既存のCSVフォーマットの場合
        newAddressValue = Math.floor(index / 16) + offsetValue;
      }

      let newBit = index % 16;

      let newAddress: string;
      if (selectedRange.numerical_base === 'hex') {
        newAddress = newAddressValue.toString(16).toUpperCase().padStart(4, '0');
      } else {
        newAddress = newAddressValue.toString().padStart(4, '0');
      }

      return {
        ...addr,
        address_type: offsetAddressType,
        address: newAddress,
        address_bit: newBit,
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const formDataList: AlarmAddressFormData[] = displayAddresses.map(address => ({
        alarm_no: address.alarm_no,
        address_type: address.address_type,
        address: address.address,
        address_bit: address.address_bit,
        comments: address.comments
      }));
  
      await updateAlarmAddresses(parseInt(deviceId!), parseInt(groupId!), formDataList);
      await fetchData();
    } catch (error) {
      console.error('Error saving alarm addresses:', error);
      setSaveError(MESSAGE_FORMATTER.ERROR_SAVE());
    } finally {
      setIsSaving(false);
    }
  };

  const displayAddresses = applyOffset(addresses);

  return (
    <div className="space-y-6">
      <PageHeader
        title={ALARM_LABELS.ALARM_ADDRESSES}
        description={alarmGroup ? `${alarmGroup.name}の${ALARM_LABELS.ALARM_ADDRESSES}` : `${ALARM_LABELS.ALARM_ADDRESSES}を管理します`}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device?.name || `${BUSINESS_TERMS.DEVICE} ${deviceId}`, href: `/devices/${deviceId}/edit` },
          { label: '詳細設定', href: `/devices/${deviceId}/detail-settings` },
          { label: ALARM_LABELS.ALARM_GROUPS, href: `/devices/${deviceId}/detail-settings/alarm-groups` },
          { label: alarmGroup?.name || `${BUSINESS_TERMS.GROUP} ${groupId}` },
        ]}
      />

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* CSV Importer */}
          <div>
            <h3 className="text-lg font-semibold mb-4">CSV{ACTION_LABELS.IMPORT}</h3>
            <CSVImporter onImport={handleCSVImport} />
          </div>

          {/* Address Offset Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="offset-toggle"
              checked={isOffsetEnabled}
              onCheckedChange={(checked: boolean) => {
                if (checked) {
                  setOpenEnableDialog(true);
                } else {
                  setOpenDisableDialog(true);
                }
              }}
            />
            <Label htmlFor="offset-toggle">{ALARM_LABELS.FIELDS.OFFSET_ADDRESS}を有効にする</Label>
          </div>

          {/* Address Offset Form */}
          {isOffsetEnabled && client && (
            <AddressOffsetForm
              addressRanges={addressRanges.filter(range => range.data_type === 'word')}
              onOffsetChange={handleOffsetChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Alarm Address List */}
      <Card>
        <CardContent className="pt-6">
          <AlarmAddressList addresses={displayAddresses} />
        </CardContent>
      </Card>

      {/* Save Button and Error Message */}
      <div className="flex flex-col gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving ? MESSAGE_FORMATTER.SAVING() : `変更を${ACTION_LABELS.SAVE}`}
        </Button>
        
        {saveError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Enable Offset Dialog */}
      <Dialog open={openEnableDialog} onOpenChange={setOpenEnableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ALARM_LABELS.FIELDS.OFFSET_ADDRESS}を有効にする</DialogTitle>
            <DialogDescription>
              {ALARM_LABELS.FIELDS.OFFSET_ADDRESS}を有効にすると、表示されるアドレスが変更されます。後で無効にした場合、
              データはリセットされ、CSVファイルを再度インポートする必要があります。
              {ALARM_LABELS.FIELDS.OFFSET_ADDRESS}を有効にしてもよろしいですか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDialog}>
              {ACTION_LABELS.CANCEL}
            </Button>
            <Button onClick={handleConfirmEnable}>
              有効にする
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Offset Dialog */}
      <Dialog open={openDisableDialog} onOpenChange={setOpenDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ALARM_LABELS.FIELDS.OFFSET_ADDRESS}を無効にする</DialogTitle>
            <DialogDescription>
              {ALARM_LABELS.FIELDS.OFFSET_ADDRESS}を無効にすると、すべてのデータがリセットされます。
              元のアドレスを表示するには、CSVファイルを再度インポートする必要があります。
              {ALARM_LABELS.FIELDS.OFFSET_ADDRESS}を無効にしてもよろしいですか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDialog}>
              {ACTION_LABELS.CANCEL}
            </Button>
            <Button onClick={handleConfirmDisable}>
              無効にする
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlarmAddressesPage;
