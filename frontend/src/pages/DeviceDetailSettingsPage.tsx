import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDevice } from '../services/api';
import { Device } from '../types/device';
import { PageHeader } from '../components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { BUSINESS_TERMS } from '../localization/constants/business-terms';
import { DEVICE_LABELS } from '../localization/constants/device-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { 
  Settings, 
  Bell, 
  FileText, 
  TrendingUp, 
  Plug, 
  Package, 
  CheckCircle 
} from 'lucide-react';

const DeviceDetailSettingsPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deviceId) {
      fetchDevice(parseInt(deviceId));
    }
  }, [deviceId]);

  const fetchDevice = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDevice = await getDevice(id);
      setDevice(fetchedDevice);
    } catch (error) {
      console.error('Failed to fetch device:', error);
      setError(DEVICE_LABELS.ERRORS.FETCH_FAILED);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        retry={() => deviceId && fetchDevice(parseInt(deviceId))} 
      />
    );
  }

  if (!device) {
    return <ErrorMessage message={DEVICE_LABELS.ERRORS.DEVICE_NOT_FOUND} />;
  }

  // 設定カテゴリの定義
  const settingsCategories = [
    {
      title: NAVIGATION_LABELS.CLIENT_SETTINGS,
      description: 'クライアント接続とデータ送信の設定',
      icon: Settings,
      path: `/devices/${deviceId}/detail-settings/client-settings`,
      color: 'text-blue-500',
    },
    {
      title: `${BUSINESS_TERMS.ALARM}設定`,
      description: `${BUSINESS_TERMS.ALARM}グループと${BUSINESS_TERMS.ALARM}アドレスの管理`,
      icon: Bell,
      path: `/devices/${deviceId}/detail-settings/alarm-groups`,
      color: 'text-red-500',
    },
    {
      title: NAVIGATION_LABELS.LOGGING_SETTINGS,
      description: `データ${BUSINESS_TERMS.LOGGING}の設定と管理`,
      icon: FileText,
      path: `/devices/${deviceId}/detail-settings/logging-settings`,
      color: 'text-green-500',
    },
    {
      title: NAVIGATION_LABELS.EFFICIENCY_SETTINGS,
      description: '効率計算のための設定',
      icon: TrendingUp,
      path: `/devices/${deviceId}/detail-settings/efficiency-settings`,
      color: 'text-purple-500',
    },
    {
      title: NAVIGATION_LABELS.IO_SETTINGS,
      description: '入出力信号の設定',
      icon: Plug,
      path: `/devices/${deviceId}/detail-settings/io-settings`,
      color: 'text-orange-500',
    },
    {
      title: `${BUSINESS_TERMS.PRODUCT}設定`,
      description: `${BUSINESS_TERMS.DEVICE}と${BUSINESS_TERMS.PRODUCT}の関連付け`,
      icon: Package,
      path: `/devices/${deviceId}/detail-settings/product-settings`,
      color: 'text-indigo-500',
    },
    {
      title: NAVIGATION_LABELS.QUALITY_CONTROL_SIGNALS,
      description: `${BUSINESS_TERMS.QUALITY}${BUSINESS_TERMS.CONTROL}${BUSINESS_TERMS.SIGNALS}の設定`,
      icon: CheckCircle,
      path: `/devices/${deviceId}/detail-settings/quality-control-signals`,
      color: 'text-teal-500',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={DEVICE_LABELS.PAGES.DETAIL_SETTINGS}
        description={`${BUSINESS_TERMS.DEVICE}の各種設定を管理します`}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device.name, href: `/devices/${deviceId}/edit` },
          { label: DEVICE_LABELS.PAGES.DETAIL_SETTINGS },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card 
              key={category.path} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(category.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${category.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {category.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(category.path);
                  }}
                >
                  {BUSINESS_TERMS.SETTINGS}を{ACTION_LABELS.OPEN}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DeviceDetailSettingsPage;