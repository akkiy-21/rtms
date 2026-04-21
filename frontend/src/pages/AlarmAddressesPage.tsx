import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getAlarmAddresses,
  getAlarmGroups,
  getAlarmParseRules,
  getClientsForDevice,
  getDevice,
  getPLC,
  previewAlarmAddresses,
  updateAlarmAddresses,
  updateAlarmGroupParseRule,
} from '../services/api';
import {
  AlarmAddress,
  AlarmAddressFormData,
  AlarmGroup,
  AlarmParseRule,
  AlarmParseRuleOffsetMode,
} from '../types/alarm';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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
  const [parseRules, setParseRules] = useState<AlarmParseRule[]>([]);
  const [selectedParseRuleId, setSelectedParseRuleId] = useState<number | null>(null);
  const [offsetMode, setOffsetMode] = useState<AlarmParseRuleOffsetMode>('row_index_word');
  const [addressRanges, setAddressRanges] = useState<AddressRange[]>([]);
  const [isOffsetEnabled, setIsOffsetEnabled] = useState(false);
  const [offsetAddress, setOffsetAddress] = useState('0');
  const [offsetAddressType, setOffsetAddressType] = useState('');
  const [openEnableDialog, setOpenEnableDialog] = useState(false);
  const [openDisableDialog, setOpenDisableDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [deviceId, groupId]);

  const fetchData = async () => {
    if (!deviceId || !groupId) {
      return;
    }

    const numericDeviceId = parseInt(deviceId, 10);
    const numericGroupId = parseInt(groupId, 10);
    const [fetchedAddresses, fetchedGroups, fetchedClients, fetchedDevice, fetchedParseRules] = await Promise.all([
      getAlarmAddresses(numericDeviceId, numericGroupId),
      getAlarmGroups(numericDeviceId),
      getClientsForDevice(numericDeviceId),
      getDevice(numericDeviceId),
      getAlarmParseRules(),
    ]);

    setAddresses(
      fetchedAddresses.map((address) => ({
        ...address,
        comments: address.comments || [],
      })),
    );
    setParseRules(fetchedParseRules);

    const group = fetchedGroups.find((item) => item.id === numericGroupId) || null;
    setAlarmGroup(group);
    setSelectedParseRuleId(group?.selected_parse_rule_id ?? null);
    setDevice(fetchedDevice);

    const selectedRule = fetchedParseRules.find((rule) => rule.id === group?.selected_parse_rule_id);
    setOffsetMode(selectedRule?.offset_mode ?? 'row_index_word');

    if (group) {
      const groupClient = fetchedClients.find((item) => item.id === group.client_id) || null;
      setClient(groupClient);

      if (groupClient) {
        const plc = await getPLC(groupClient.plc.id);
        setAddressRanges(plc.address_ranges);
        if (plc.address_ranges.length > 0) {
          setOffsetAddressType(plc.address_ranges[0].address_type);
        }
      }
    }
  };

  const handleParseRuleChange = async (value: string) => {
    if (!deviceId || !groupId) {
      return;
    }

    const ruleId = parseInt(value, 10);
    const selectedRule = parseRules.find((rule) => rule.id === ruleId);

    setParseError(null);
    setParseWarnings([]);
    setAddresses([]);
    setSelectedParseRuleId(ruleId);
    setOffsetMode(selectedRule?.offset_mode ?? 'row_index_word');

    try {
      const updatedGroup = await updateAlarmGroupParseRule(parseInt(deviceId, 10), parseInt(groupId, 10), {
        selected_parse_rule_id: ruleId,
      });
      setAlarmGroup(updatedGroup);
    } catch (error) {
      console.error('Error updating alarm parse rule selection:', error);
      setParseError('パースルールの選択保存に失敗しました');
    }
  };

  const handleCSVImport = async (csvContent: string) => {
    if (!deviceId || !groupId || selectedParseRuleId === null) {
      setParseError('CSVを取り込む前にパースルールを選択してください');
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setParseWarnings([]);

    try {
      const preview = await previewAlarmAddresses(parseInt(deviceId, 10), parseInt(groupId, 10), {
        csv_content: csvContent,
        parse_rule_id: selectedParseRuleId,
      });
      setAddresses(
        preview.addresses.map((address) => ({
          ...address,
          comments: address.comments || [],
        })),
      );
      setParseWarnings(preview.warnings || []);
      setOffsetMode(preview.offset_mode);
    } catch (error) {
      console.error('Error previewing alarm addresses:', error);
      setParseError('CSVのプレビューに失敗しました');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmEnable = () => {
    setIsOffsetEnabled(true);
    setOpenEnableDialog(false);
  };

  const handleConfirmDisable = () => {
    setIsOffsetEnabled(false);
    setOffsetAddress('0');
    setAddresses([]);
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
    if (!isOffsetEnabled) {
      return originalAddresses;
    }

    const selectedRange = addressRanges.find((range) => range.address_type === offsetAddressType);
    if (!selectedRange) {
      return originalAddresses;
    }

    const base = selectedRange.numerical_base === 'hex' ? 16 : 10;
    const offsetValue = parseInt(offsetAddress, base);
    if (Number.isNaN(offsetValue)) {
      return originalAddresses;
    }

    return originalAddresses.map((address, index) => {
      const originalAddressValue = parseInt(address.address, base);
      const nextAddressValue = offsetMode === 'preserve_address'
        ? (Number.isNaN(originalAddressValue) ? offsetValue : originalAddressValue + offsetValue)
        : Math.floor(index / 16) + offsetValue;
      const nextBit = offsetMode === 'preserve_address' ? address.address_bit : index % 16;
      const nextAddress = selectedRange.numerical_base === 'hex'
        ? nextAddressValue.toString(16).toUpperCase().padStart(4, '0')
        : nextAddressValue.toString().padStart(4, '0');

      return {
        ...address,
        address_type: offsetAddressType,
        address: nextAddress,
        address_bit: nextBit,
      };
    });
  };

  const handleSave = async () => {
    if (!deviceId || !groupId) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const formDataList: AlarmAddressFormData[] = displayAddresses.map((address) => ({
        alarm_no: address.alarm_no,
        address_type: address.address_type,
        address: address.address,
        address_bit: address.address_bit,
        comments: address.comments,
      }));

      await updateAlarmAddresses(parseInt(deviceId, 10), parseInt(groupId, 10), formDataList);
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
          <div className="space-y-2">
            <Label htmlFor="alarm-parse-rule">パースルール</Label>
            <Select value={selectedParseRuleId?.toString() ?? ''} onValueChange={handleParseRuleChange}>
              <SelectTrigger id="alarm-parse-rule" className="w-full md:w-[360px]">
                <SelectValue placeholder="パースルールを選択してください" />
              </SelectTrigger>
              <SelectContent>
                {parseRules.filter((rule) => rule.is_active).map((rule) => (
                  <SelectItem key={rule.id} value={rule.id.toString()}>
                    {rule.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedParseRuleId === null && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>CSVを取り込む前にパースルールを選択してください。</AlertDescription>
            </Alert>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4">CSV{ACTION_LABELS.IMPORT}</h3>
            <CSVImporter onImport={handleCSVImport} />
          </div>

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

          {isOffsetEnabled && client && (
            <AddressOffsetForm
              addressRanges={addressRanges.filter((range) => range.data_type === 'word')}
              onOffsetChange={handleOffsetChange}
            />
          )}

          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          {parseWarnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{parseWarnings.join(' / ')}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <AlarmAddressList addresses={displayAddresses} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving || isParsing || displayAddresses.length === 0}
          className="w-full sm:w-auto"
        >
          {isSaving ? MESSAGE_FORMATTER.SAVING() : isParsing ? 'プレビュー中...' : `変更を${ACTION_LABELS.SAVE}`}
        </Button>

        {saveError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}
      </div>

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
