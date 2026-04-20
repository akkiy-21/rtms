// component/LoadingDialog.tsx
import React, { useEffect } from 'react';
import { Dialog, DialogContent, CircularProgress, Typography, Box } from '@mui/material';

interface LoadingDialogProps {
  open: boolean;
  message?: string;
}

const LoadingDialog: React.FC<LoadingDialogProps> = ({ open, message = 'Loading Configuration' }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      fullScreen
      PaperProps={{
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          boxShadow: 'none',
        },
      }}
    >
      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="90vh"
        >
          <CircularProgress size={60} thickness={4} style={{ color: 'white' }} />
          <Typography variant="h6" align="center" style={{ marginTop: '20px', color: 'white' }}>
            {message}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingDialog;
