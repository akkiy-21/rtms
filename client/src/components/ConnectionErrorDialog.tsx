import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Typography } from '@mui/material';

const parseBackendDateTime = (value: string): Date => {
  const normalized = /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`;
  return new Date(normalized);
};

interface ConnectionErrorDialogProps {
  open: boolean;
  errorType: 'connection' | 'device' | 'config' | 'mqtt';
  serverIP?: string;
  serverPort?: string;
  macAddress?: string;
  pairingStatus?: 'pending' | 'confirmed' | 'draft' | 'registered' | null;
  pairingCode?: string | null;
  pairingCodeExpiresAt?: string | null;
  pairingRefreshIntervalSeconds?: number;
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
  pairingStatus,
  pairingCode,
  pairingCodeExpiresAt,
  pairingRefreshIntervalSeconds = 30,
  mqttBrokerIP,
  mqttBrokerPort,
  onOpenSettings,
}) => {
  const [currentTime, setCurrentTime] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!open || errorType !== 'device' || pairingStatus !== 'pending' || !pairingCodeExpiresAt) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 250);

    return () => {
      window.clearInterval(timer);
    };
  }, [errorType, open, pairingCodeExpiresAt, pairingStatus]);

  // ダイアログを閉じようとする動作を防ぐための関数
  const preventClose = (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>, reason: string) => {
    if (reason === 'backdropClick') {
      event.preventDefault();
    }
  };

  const refreshProgress = React.useMemo(() => {
    if (pairingStatus !== 'pending' || !pairingCodeExpiresAt) {
      return null;
    }

    const expiresAt = parseBackendDateTime(pairingCodeExpiresAt).getTime();
    const intervalMs = pairingRefreshIntervalSeconds * 1000;
    const remainingMs = Math.max(0, expiresAt - currentTime);
    const elapsedMs = Math.min(intervalMs, Math.max(0, intervalMs - remainingMs));

    return {
      progress: intervalMs > 0 ? (elapsedMs / intervalMs) * 100 : 0,
      remainingSeconds: Math.ceil(remainingMs / 1000),
    };
  }, [currentTime, pairingCodeExpiresAt, pairingRefreshIntervalSeconds, pairingStatus]);

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
            {pairingStatus === 'draft' ? (
              <>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  管理画面で仮登録済みです。残りの入力が完了すると自動で通常画面へ切り替わります。
                </Typography>
                <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, my: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    仮登録済み
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    管理画面で本登録が完了するまで待機してください。
                  </Typography>
                </Box>
              </>
            ) : pairingStatus === 'confirmed' ? (
              <>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  管理画面で端末確認済みです。登録完了までこの画面で待機してください。
                </Typography>
                <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, my: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    確認済み
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    4桁コードの表示と自動更新は一時停止しています。
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  サーバー管理者に以下の4桁コードを伝え、デバイス登録または既存設定の引き継ぎを依頼してください。
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    bgcolor: 'action.hover',
                    p: 1.5,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                    my: 2,
                  }}
                >
                  {pairingCode || '----'}
                </Typography>
                {refreshProgress && (
                  <Box sx={{ my: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      次回更新まで {refreshProgress.remainingSeconds} 秒
                    </Typography>
                    <LinearProgress variant="determinate" value={refreshProgress.progress} />
                    {pairingCodeExpiresAt && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        更新予定: {parseBackendDateTime(pairingCodeExpiresAt).toLocaleTimeString('ja-JP')}
                      </Typography>
                    )}
                  </Box>
                )}
              </>
            )}
            <Typography variant="body2" color="textSecondary">
              内部識別には MAC Address を使用しています: {macAddress}
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