// components/ErrorDialog.tsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText } from '@mui/material';

interface ErrorDialogProps {
  open: boolean;
  errorType: string | null;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ open, errorType }) => {
  let errorMessage = '';

  switch (errorType) {
    case 'connection-error':
      errorMessage = 'WebSocket接続エラーが発生しました。接続を再試行しています。';
      break;
    case 'max-reconnect-attempts':
      errorMessage = '最大再接続試行回数に達しました。ネットワーク接続を確認してください。';
      break;
    case 'message-timeout':
      errorMessage = 'Scan Timeデータの受信がタイムアウトしました。接続を確認しています。';
      break;
    default:
      return null;
  }

  return (
    <Dialog open={open}>
      <DialogTitle>エラー</DialogTitle>
      <DialogContent>
        <DialogContentText>{errorMessage}</DialogContentText>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDialog;