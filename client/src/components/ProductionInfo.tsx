// components/ProductionInfo.tsx
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { DeviceConfig } from '../types';

interface ProductionInfoProps {
  deviceConfig: DeviceConfig | null;
  hourlyProduction: number;
  hourlyEfficiency: number;
  dailyProduction: number;
  dailyEfficiency: number;
  hourlyAvgCycleTime: number;
  dailyAvgCycleTime: number;
}

const ProductionInfo: React.FC<ProductionInfoProps> = ({ 
  deviceConfig, 
  hourlyProduction,
  hourlyEfficiency,
  dailyProduction,
  dailyEfficiency,
  hourlyAvgCycleTime,
  dailyAvgCycleTime,
}) => {
  return (
    <Box sx={{ height: 'calc(100% - 55px)', mt: 5, display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">基準タクトタイム</Typography>
          <Typography variant="h5" sx={{ pl: 2 }}>
            {deviceConfig?.standard_cycle_time || 'N/A'}
            <Typography component="span" variant="body1" sx={{ ml: 0.5 }}>sec</Typography>
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">平均サイクルタイム</Typography>
          <Typography variant="h5" sx={{ pl: 2 }}>
            {hourlyAvgCycleTime.toFixed(1)}
            <Typography component="span" variant="body1" sx={{ ml: 0.5 }}>sec / hr</Typography>
          </Typography>
          <Typography variant="h5" sx={{ pl: 2 }}>
            {dailyAvgCycleTime.toFixed(1)}
            <Typography component="span" variant="body1" sx={{ ml: 0.5 }}>sec / day</Typography>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductionInfo;
