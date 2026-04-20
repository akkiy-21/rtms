// src/components/EquipmentStatus.tsx
import React from 'react';
import { Grid, Typography } from '@mui/material';
import { getStatusColor } from '../utils/colorUtils';
import { DeviceConfig } from '../types';

interface OperationStatus {
  status: string;
  category: string;
}

interface EquipmentStatusProps {
  deviceConfig: DeviceConfig | null;
  operationStatus: OperationStatus;
}

const EquipmentStatus: React.FC<EquipmentStatusProps> = ({ deviceConfig, operationStatus }) => {
  return (
    <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
      <Grid item xs={3}>
        <Typography variant="h6">{deviceConfig?.name || 'Loading...'}</Typography>
      </Grid>
      <Grid item xs={9}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontSize: {
              xs: '2rem',
              sm: '2.5rem',
              md: '3rem',
              lg: '3.5rem',
              xl: '4rem'
            },
            letterSpacing: '1.0em',
            color: getStatusColor(operationStatus.category),
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {operationStatus.status}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default EquipmentStatus;
