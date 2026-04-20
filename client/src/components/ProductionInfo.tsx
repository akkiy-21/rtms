// components/ProductionInfo.tsx
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { DeviceConfig, ActiveUser  } from '../types';

interface ProductionInfoProps {
  deviceConfig: DeviceConfig | null;
  hourlyProduction: number;
  hourlyEfficiency: number;
  dailyProduction: number;
  dailyEfficiency: number;
  hourlyAvgCycleTime: number;
  dailyAvgCycleTime: number;
  productionAchievementRate: number;
  activeUsers: ActiveUser[];
}

const ProductionInfo: React.FC<ProductionInfoProps> = ({ 
  deviceConfig, 
  hourlyProduction,
  hourlyEfficiency,
  dailyProduction,
  dailyEfficiency,
  hourlyAvgCycleTime,
  dailyAvgCycleTime,
  productionAchievementRate,
  activeUsers
}) => {
  // 作業者名（実際のデータソースから取得するように変更してください）
  //const workers = ['稲森 將太', '木上 堅大郎'];

  return (
    <Box sx={{ height: 'calc(100% - 55px)', mt: 5, display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">生産指示数</Typography>
          <Typography variant="h5" sx={{ pl: 2 }}>{deviceConfig?.planned_production_quantity || 'N/A'}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">生産達成率</Typography>
          <Typography variant="h5" sx={{ pl: 2 }}>
            {productionAchievementRate.toFixed(1)}
            <Typography component="span" variant="body1" sx={{ ml: 0.5 }}>%</Typography>
          </Typography>
        </Box>
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
        <Box>
          <Typography variant="subtitle2">作業者名</Typography>
          <Box sx={{ pl: 2 }}>
            {activeUsers.map((user) => (
              <Typography key={user.user_id} variant="h6">{user.user_name}</Typography>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductionInfo;
