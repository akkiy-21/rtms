// pages/DataDownloadPage.tsx
import React, { useEffect, useState } from 'react';
import DataDownloadForm from '../components/DataDownloadForm';
import ResultDialog from '../components/ResultDialog';
import { getDevices, downloadDeviceData } from '../services/api';
import { Device } from '../types/device';
import { DownloadResult } from '../types/data';
import { format } from 'date-fns';
import axios from 'axios';
import { PageHeader } from '../components/layout/page-header';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

const DataDownloadPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [downloadResults, setDownloadResults] = useState<DownloadResult[]>([]);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    const fetchedDevices = await getDevices();
    setDevices(fetchedDevices);
  };

  const handleDownload = async (deviceIds: number[], date: Date, encoding: string) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const results: DownloadResult[] = [];

    for (const deviceId of deviceIds) {
      const device = devices.find(d => d.id === deviceId);
      if (!device) continue;

      try {
        const blob = await downloadDeviceData(deviceId, formattedDate, encoding);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${device.name}_${formattedDate}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        results.push({
          deviceId,
          deviceName: device.name,
          success: true,
          message: SETTINGS_LABELS.DOWNLOAD_COMPLETED
        });

        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        let errorMessage: string = SETTINGS_LABELS.DOWNLOAD_ERROR;
        
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          errorMessage = SETTINGS_LABELS.DATA_NOT_EXISTS;
        }

        results.push({
          deviceId,
          deviceName: device.name,
          success: false,
          message: errorMessage
        });
      }
    }

    setDownloadResults(results);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={NAVIGATION_LABELS.DATA_DOWNLOAD}
        description={SETTINGS_LABELS.DOWNLOAD_DEVICE_DATA_CSV}
      />
      <DataDownloadForm 
        devices={devices} 
        onDownload={handleDownload}
      />
      <ResultDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        results={downloadResults}
      />
    </div>
  );
};

export default DataDownloadPage;