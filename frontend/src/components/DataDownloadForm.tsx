// components/DataDownloadForm.tsx
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Device } from '../types/device';
import { DeviceCheckboxState } from '../types/data';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar } from '../components/ui/calendar';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';
import { TECHNICAL_TERMS } from '../localization/constants/technical-terms';

interface DataDownloadFormProps {
  devices: Device[];
  onDownload: (deviceIds: number[], startDate: Date, endDate: Date, encoding: string) => void;
}

const DataDownloadForm: React.FC<DataDownloadFormProps> = ({ devices, onDownload }) => {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [encoding, setEncoding] = useState('UTF-8');
  const [checkedDevices, setCheckedDevices] = useState<DeviceCheckboxState>({});

  const handleEncodingChange = (value: string) => {
    setEncoding(value);
  };

  const handleCheckboxChange = (deviceId: number) => {
    setCheckedDevices((prev: DeviceCheckboxState) => ({
      ...prev,
      [deviceId]: !prev[deviceId]
    }));
  };

  const handleDownload = () => {
    if (!selectedRange?.from || !selectedRange?.to) return;
    const selectedDevices = Object.entries(checkedDevices)
      .filter(([_, isChecked]) => isChecked)
      .map(([deviceId]) => parseInt(deviceId));

    if (selectedDevices.length === 0) return;
    onDownload(selectedDevices, selectedRange.from, selectedRange.to, encoding);
  };

  const handleSelectAll = () => {
    const allDeviceIds = devices.reduce((acc, device) => {
      acc[device.id] = true;
      return acc;
    }, {} as DeviceCheckboxState);
    setCheckedDevices(allDeviceIds);
  };

  const handleUnselectAll = () => {
    setCheckedDevices({});
  };

  const dateRangeLabel = () => {
    if (selectedRange?.from && selectedRange?.to) {
      return `${format(selectedRange.from, 'yyyy/MM/dd', { locale: ja })} 〜 ${format(selectedRange.to, 'yyyy/MM/dd', { locale: ja })}`;
    }
    if (selectedRange?.from) {
      return `${format(selectedRange.from, 'yyyy/MM/dd', { locale: ja })} 〜 終了日を選択`;
    }
    return SETTINGS_LABELS.SELECT_DATE_RANGE_PLACEHOLDER;
  };

  const isRangeComplete = !!(selectedRange?.from && selectedRange?.to);
  const hasSelectedDevices = Object.values(checkedDevices).some(v => v);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{SETTINGS_LABELS.DEVICE_DATA_DOWNLOAD}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 日付範囲選択 */}
        <div className="space-y-2">
          <Label>{SETTINGS_LABELS.SELECT_DATE_RANGE}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !isRangeComplete && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRangeLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={selectedRange}
                onSelect={setSelectedRange}
                initialFocus
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* エンコード形式選択 */}
        <div className="space-y-2">
          <Label>{SETTINGS_LABELS.ENCODING_FORMAT}</Label>
          <Select value={encoding} onValueChange={handleEncodingChange}>
            <SelectTrigger>
              <SelectValue placeholder={SETTINGS_LABELS.SELECT_ENCODING} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTF-8">{SETTINGS_LABELS.ENCODING_UTF8}</SelectItem>
              <SelectItem value="Shift-JIS">{SETTINGS_LABELS.ENCODING_SHIFT_JIS}</SelectItem>
              <SelectItem value="EUC-JP">{SETTINGS_LABELS.ENCODING_EUC_JP}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* デバイス選択ボタン */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSelectAll}>
            {SETTINGS_LABELS.SELECT_ALL}
          </Button>
          <Button variant="outline" onClick={handleUnselectAll}>
            {SETTINGS_LABELS.UNSELECT_ALL}
          </Button>
        </div>

        {/* デバイス一覧 */}
        <div className="space-y-2">
          <Label>{SETTINGS_LABELS.DEVICE_SELECTION}</Label>
          <div className="max-h-96 overflow-auto border rounded-md p-4 space-y-3">
            {devices.map(device => (
              <div key={device.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`device-${device.id}`}
                  checked={!!checkedDevices[device.id]}
                  onCheckedChange={() => handleCheckboxChange(device.id)}
                />
                <Label
                  htmlFor={`device-${device.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {device.name} ({TECHNICAL_TERMS.MAC_ADDRESS}: {device.mac_address})
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* ダウンロードボタン */}
        <Button
          onClick={handleDownload}
          disabled={!isRangeComplete || !hasSelectedDevices}
          className="w-full"
        >
          {SETTINGS_LABELS.CSV_DOWNLOAD}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataDownloadForm;