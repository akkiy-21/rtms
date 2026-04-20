import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Chip, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import SpeedIcon from '@mui/icons-material/Speed';
import logo from '../../assets/images/logo.png';
import { DeviceConfig } from '../types';

interface HeaderProps {
  onOpenSettings: () => void;
  deviceConfig: DeviceConfig | null;
  selectedMac: string;
  scanTime: number | null;
  mqttError?: boolean;
  onMqttStatusClick?: () => void;
  highScanTimeError?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  deviceConfig,
  selectedMac,
  scanTime,
  mqttError = false,
  onMqttStatusClick,
  highScanTimeError = false,
}) => {
  const [macAddress, setMacAddress] = useState('Connecting...');
  //console.log('Scan time in Header:', scanTime);

  useEffect(() => {
    // selectedMacがある場合のみ表示、ない場合は"Not connected"
    if (selectedMac) {
      setMacAddress(selectedMac);
    } else {
      setMacAddress('Not connected');
    }
  }, [selectedMac]);

  const formatScanTime = (time: number | null): string => {
    //console.log('Formatting scan time:', time);
    if (time === null) return 'N/A';
    return `${time} ms`;
  };

  return (
    <AppBar position="static" color="default" sx={{ flexShrink: 0 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <img src={logo} alt="logo" style={{ height: '40px' }} />
        <Box sx={{ flexGrow: 1 }} />
        {highScanTimeError && (
          <IconButton
            color="warning"
            sx={{ mr: 1 }}
            title="Scan Timeが1000msを超えています"
          >
            <SpeedIcon />
          </IconButton>
        )}
        {mqttError && (
          <IconButton
            color="warning"
            onClick={onMqttStatusClick}
            sx={{ mr: 1 }}
            title="MQTT接続エラー - クリックして詳細を表示"
          >
            <WarningIcon />
          </IconButton>
        )}
        <Chip
          label={`MAC: ${macAddress}`}
          color="primary"
          variant="outlined"
          sx={{ mr: 2 }}
        />
        <Chip
          label={`Scan Time: ${formatScanTime(scanTime)}`}
          color="primary"
          variant="outlined"
          sx={{ mr: 2 }}
        />
        <IconButton color="inherit" onClick={onOpenSettings}>
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;