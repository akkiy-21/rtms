import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Monitor, Network, TimerReset } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDevices } from '@/services/api';
import { Device } from '@/types/device';
import { NAVIGATION_LABELS } from '@/localization/constants/navigation-labels';
import { SETTINGS_LABELS } from '@/localization/constants/settings-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';


const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedDevices = await getDevices();
        setDevices(fetchedDevices);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : MESSAGE_FORMATTER.ERROR_FETCH(NAVIGATION_LABELS.DASHBOARD));
      } finally {
        setIsLoading(false);
      }
    };

    loadDevices();
  }, []);

  const summary = useMemo(() => {
    const connectedDevices = devices.filter((device) => Boolean(device.last_known_ip_address)).length;
    const configuredCycleTime = devices.filter((device) => device.standard_cycle_time !== null).length;

    return {
      totalDevices: devices.length,
      connectedDevices,
      configuredCycleTime,
    };
  }, [devices]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={NAVIGATION_LABELS.DASHBOARD}
        description="現場の対象設備を読み取り専用で確認できます"
        actions={
          <Button onClick={() => navigate('/data-download')}>
            <Download className="mr-2 h-4 w-4" />
            {SETTINGS_LABELS.CSV_DOWNLOAD}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">対象設備数</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{summary.totalDevices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">接続IP登録済み</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{summary.connectedDevices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">標準サイクル設定済み</CardTitle>
            <TimerReset className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{summary.configuredCycleTime}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>設備一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-muted-foreground">{MESSAGE_FORMATTER.LOADING()}</p>}
          {!isLoading && error && <p className="text-destructive">{error}</p>}
          {!isLoading && !error && devices.length === 0 && <p className="text-muted-foreground">設備がありません</p>}
          {!isLoading && !error && devices.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {devices.map((device) => (
                <div key={device.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-sm text-muted-foreground">MAC: {device.mac_address}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {device.last_known_ip_address ? '接続情報あり' : '接続情報なし'}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>IP: {device.last_known_ip_address ?? '未登録'}</p>
                    <p>標準サイクル: {device.standard_cycle_time ?? '未設定'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


export default DashboardPage;