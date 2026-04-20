// component/SettingsDialog.tsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NetworkConfigTab from './NetworkConfigTab';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  serverIP: string;
  serverPort: string;
  mqttBrokerIP: string;
  mqttBrokerPort: string;
  mqttPublishInterval: number;
  setServerIP: (value: string) => void;
  setServerPort: (value: string) => void;
  setMqttBrokerIP: (value: string) => void;
  setMqttBrokerPort: (value: string) => void;
  setMqttPublishInterval: (value: number) => void;
  currentMac: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onClose,
  onSave,
  serverIP,
  serverPort,
  mqttBrokerIP,
  mqttBrokerPort,
  mqttPublishInterval,
  setServerIP,
  setServerPort,
  setMqttBrokerIP,
  setMqttBrokerPort,
  setMqttPublishInterval,
  currentMac,
}) => {
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // onSave時にアプリを再初期化するため、ダイアログを開いたときにMACアドレスを更新する必要はない
  }, [open, currentMac]);

  const handleSave = () => {
    onSave();
    onClose();
  };

  const handleExitApp = () => {
    // Electron側のquit-app IPCを呼び出してアプリケーションを終了
    window.electronAPI.invoke('quit-app');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNetworkSettingsApplied = () => {
    // ネットワーク設定適用後、アプリを再初期化
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        設定
        <Tooltip title="アプリ終了">
          <IconButton
            onClick={handleExitApp}
            color="secondary"
            style={{ position: 'absolute', right: 8, top: 8 }}
            aria-label="exit app"
          >
            <ExitToAppIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="設定タブ">
        <Tab label="サーバー設定" id="settings-tab-0" aria-controls="settings-tabpanel-0" />
        <Tab label="ネットワーク設定" id="settings-tab-1" aria-controls="settings-tabpanel-1" />
      </Tabs>
      <DialogContent>
        <TabPanel value={tabValue} index={0}>
          <TextField
            margin="dense"
            id="currentMac"
            label="使用中のMACアドレス"
            type="text"
            fullWidth
            variant="standard"
            value={currentMac}
            InputProps={{
              readOnly: true,
            }}
            helperText="MACアドレスはサーバー接続可能なアダプターから自動選択されます"
          />
          <TextField
            margin="dense"
            id="serverIP"
            label="APIサーバーIPアドレス"
            type="text"
            fullWidth
            variant="standard"
            value={serverIP}
            onChange={(e) => setServerIP(e.target.value)}
          />
          <TextField
            margin="dense"
            id="serverPort"
            label="APIサーバーポート"
            type="text"
            fullWidth
            variant="standard"
            value={serverPort}
            onChange={(e) => setServerPort(e.target.value)}
          />
          <TextField
            margin="dense"
            id="mqttBrokerIP"
            label="MQTTブローカーIPアドレス"
            type="text"
            fullWidth
            variant="standard"
            value={mqttBrokerIP}
            onChange={(e) => setMqttBrokerIP(e.target.value)}
          />
          <TextField
            margin="dense"
            id="mqttBrokerPort"
            label="MQTTブローカーポート"
            type="text"
            fullWidth
            variant="standard"
            value={mqttBrokerPort}
            onChange={(e) => setMqttBrokerPort(e.target.value)}
          />
          <TextField
            margin="dense"
            id="mqttPublishInterval"
            label="MQTT送信周期 (秒)"
            type="number"
            fullWidth
            variant="standard"
            value={mqttPublishInterval}
            onChange={(e) => setMqttPublishInterval(Number(e.target.value))}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <NetworkConfigTab onApplySettings={handleNetworkSettingsApplied} />
        </TabPanel>
      </DialogContent>
      <DialogActions>
        {tabValue === 0 && (
          <>
            <Button onClick={onClose}>キャンセル</Button>
            <Button onClick={handleSave}>保存</Button>
          </>
        )}
        {tabValue === 1 && (
          <Button onClick={onClose}>閉じる</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;