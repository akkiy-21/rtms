import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Chip } from '@mui/material';
import { Warning as WarningIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

interface MqttStatusDialogProps {
  open: boolean;
  onClose: () => void;
  isConnected: boolean;
  mqttBrokerIP?: string;
  mqttBrokerPort?: string;
  onRetry: () => void;
  onOpenSettings: () => void;
}

const MqttStatusDialog: React.FC<MqttStatusDialogProps> = ({
  open,
  onClose,
  isConnected,
  mqttBrokerIP,
  mqttBrokerPort,
  onRetry,
  onOpenSettings,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {isConnected ? (
            <>
              <CheckCircleIcon color="success" />
              <Typography variant="h6">MQTT接続状態</Typography>
            </>
          ) : (
            <>
              <WarningIcon color="warning" />
              <Typography variant="h6">MQTT接続エラー</Typography>
            </>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              接続状態
            </Typography>
            <Chip
              label={isConnected ? '接続済み' : '切断中'}
              color={isConnected ? 'success' : 'warning'}
              size="small"
            />
          </Box>
          
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              ブローカー設定
            </Typography>
            <Typography variant="body1">
              {mqttBrokerIP}:{mqttBrokerPort}
            </Typography>
          </Box>

          {!isConnected && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                説明
              </Typography>
              <Typography variant="body2">
                MQTTブローカーへの接続に失敗しています。
                ネットワークの状態を確認するか、設定を見直してください。
                このアプリは自動的に再接続を試行し続けます。
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {!isConnected && (
          <>
            <Button onClick={onOpenSettings} color="primary">
              設定を開く
            </Button>
            <Button onClick={onRetry} color="primary" variant="outlined">
              再接続
            </Button>
          </>
        )}
        <Button onClick={onClose} color="primary" variant="contained">
          {isConnected ? '閉じる' : 'OK'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MqttStatusDialog;
