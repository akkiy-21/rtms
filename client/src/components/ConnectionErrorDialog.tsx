import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface ConnectionErrorDialogProps {
  open: boolean;
  errorType: 'connection' | 'device' | 'config' | 'mqtt';
  serverIP?: string;
  serverPort?: string;
  macAddress?: string;
  mqttBrokerIP?: string;
  mqttBrokerPort?: string;
  onOpenSettings: () => void;
  onRetry: () => void;
}

const ConnectionErrorDialog: React.FC<ConnectionErrorDialogProps> = ({
  open,
  errorType,
  serverIP,
  serverPort,
  macAddress,
  mqttBrokerIP,
  mqttBrokerPort,
  onOpenSettings,
}) => {
  // ダイアログを閉じようとする動作を防ぐための関数
  const preventClose = (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>, reason: string) => {
    if (reason === 'backdropClick') {
      event.preventDefault();
    }
  };

  const getDialogTitle = () => {
    switch (errorType) {
      case 'connection':
        return 'サーバー接続エラー';
      case 'device':
        return 'デバイス登録エラー';
      case 'config':
        return '設定エラー';
      case 'mqtt':
        return 'MQTTブローカー接続エラー';
      default:
        return '接続エラー';
    }
  };

  const getDialogContent = () => {
    switch (errorType) {
      case 'mqtt':
        return (
          <>
            <Typography>MQTTブローカーへの接続を試みています。</Typography>
            <Typography>ブローカーのIPアドレスとポートを確認してください。</Typography>
            <Typography>現在の設定:</Typography>
            <Typography>IP: {mqttBrokerIP}</Typography>
            <Typography>Port: {mqttBrokerPort}</Typography>
          </>
        );
      case 'connection':
        return (
          <>
            <Typography gutterBottom>
              サーバーに接続できませんでした。
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              以下の点を確認してください：
            </Typography>
            <Typography variant="body2" component="div" sx={{ pl: 2 }}>
              • サーバーのIPアドレスとポートが正しいか<br />
              • ネットワークケーブルが接続されているか<br />
              • サーバーが起動しているか
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              現在の設定:
            </Typography>
            <Typography variant="body2" sx={{ pl: 2 }}>
              IP: {serverIP}<br />
              Port: {serverPort}
            </Typography>
          </>
        );
      case 'device':
        return (
          <>
            <Typography gutterBottom>
              このデバイスはサーバーに登録されていません。
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              サーバー管理者に以下のMACアドレスを伝え、デバイス登録を依頼してください。
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                bgcolor: 'action.hover', 
                p: 1.5, 
                borderRadius: 1,
                fontFamily: 'monospace',
                my: 2 
              }}
            >
              {macAddress}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              このMACアドレスは、サーバーに接続可能なネットワークアダプターから自動選択されています。
            </Typography>
          </>
        );
      case 'config':
        return (
          <>
            <Typography>設定の更新中にエラーが発生しました。</Typography>
            <Typography>設定を確認し、再試行してください。</Typography>
          </>
        );
      default:
        return <Typography>接続エラーが発生しました。</Typography>;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={preventClose}
      disableEscapeKeyDown
    >
      <DialogTitle>
        {getDialogTitle()}
      </DialogTitle>
      <DialogContent>
        {getDialogContent()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onOpenSettings} color="primary">
          設定を開く
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConnectionErrorDialog;