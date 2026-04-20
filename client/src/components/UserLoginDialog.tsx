import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';

interface UserLoginDialogProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  isLogin: boolean;
}

const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
};

const UserLoginDialog: React.FC<UserLoginDialogProps> = ({ open, onClose, userName, isLogin }) => {
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  const dialogWidth = width * 0.3;
  const dialogHeight = height * 0.3;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        style: {
          width: dialogWidth,
          height: dialogHeight,
          maxWidth: 'none',
          maxHeight: 'none',
        },
      }}
    >
      <DialogTitle>{isLogin ? 'Login' : 'Logout'}</DialogTitle>
      <DialogContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Typography variant="h4" align="center">
          {userName}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default UserLoginDialog;