import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const appVersion = await window.electronAPI.getAppVersion();
        setVersion(appVersion);
      } catch (error) {
        console.error('Failed to fetch app version:', error);
        setVersion('unknown');
      }
    };

    fetchVersion();
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        py: 0.5,
        px: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.7rem',
          color: 'text.secondary',
          opacity: 0.7,
        }}
      >
        RTMS Client v{version}
      </Typography>
    </Box>
  );
};

export default Footer;
