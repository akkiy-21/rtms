import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDevice } from '../services/api';
import { Device } from '../types/device';
import { PageHeader } from '../components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { useApiError } from '../hooks/use-api-error';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';

const IOSettingsPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useApiError();

  useEffect(() => {
    if (deviceId) {
      fetchDevice(parseInt(deviceId));
    }
  }, [deviceId]);

  const fetchDevice = async (deviceId: number) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDevice = await getDevice(deviceId);
      setDevice(fetchedDevice);
    } catch (err) {
      const errorMessage = SETTINGS_LABELS.DEVICE_INFO_FETCH_FAILED;
      setError(errorMessage);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (deviceId) {
      fetchDevice(parseInt(deviceId));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={handleRetry} />;
  }

  if (!device) {
    return <ErrorMessage message={SETTINGS_LABELS.DEVICE_NOT_FOUND} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={SETTINGS_LABELS.IO_SETTINGS}
        description={SETTINGS_LABELS.DEVICE_IO_SETTINGS}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device.name, href: `/devices/${device.id}/edit` },
          { label: NAVIGATION_LABELS.DETAILS + NAVIGATION_LABELS.SETTINGS, href: `/devices/${device.id}/detail-settings` },
          { label: NAVIGATION_LABELS.IO_SETTINGS },
        ]}
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{SETTINGS_LABELS.DEVICE_INFORMATION}</CardTitle>
            <CardDescription>
              {SETTINGS_LABELS.CURRENT_DEVICE_INFO}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{SETTINGS_LABELS.DEVICE_NAME}</p>
                <p className="text-sm">{device.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{SETTINGS_LABELS.DEVICE_ID}</p>
                <p className="text-sm">{device.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{SETTINGS_LABELS.MAC_ADDRESS}</p>
                <p className="text-sm">{device.mac_address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{SETTINGS_LABELS.STANDARD_CYCLE_TIME}</p>
                <p className="text-sm">
                  {device.standard_cycle_time ? `${device.standard_cycle_time}${SETTINGS_LABELS.SECONDS}` : SETTINGS_LABELS.NOT_SET}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{SETTINGS_LABELS.SSH_LATEST_IP}</p>
                <p className="text-sm">{device.last_known_ip_address || SETTINGS_LABELS.NOT_SET}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{SETTINGS_LABELS.SSH_USERNAME}</p>
                <p className="text-sm">{device.ssh_username || SETTINGS_LABELS.NOT_SET}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{SETTINGS_LABELS.IO_SETTINGS}</CardTitle>
            <CardDescription>
              {SETTINGS_LABELS.INPUT_OUTPUT_CONFIGURATION}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {SETTINGS_LABELS.IO_SETTINGS_UNDER_DEVELOPMENT}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {SETTINGS_LABELS.IO_SETTINGS_FUTURE_VERSION}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IOSettingsPage;