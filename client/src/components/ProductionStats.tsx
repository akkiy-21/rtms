// components/ProductionStats.tsx
import React from 'react';
import { Grid, Typography, Paper, Box } from '@mui/material';
import { getOperationRateColor } from '../utils/colorUtils';

interface ProductionStatsProps {
  hourlyProduction: number;
  hourlyEfficiency: number;
  actualDailyProduction: number;
  actualDailyEfficiency: number;
}

const ProductionStats: React.FC<ProductionStatsProps> = ({
  hourlyProduction,
  hourlyEfficiency,
  actualDailyProduction,
  actualDailyEfficiency
}) => {
  const statsData = [
    { title: '時間当たり', production: hourlyProduction, operationRate: isNaN(hourlyEfficiency) ? 0 : hourlyEfficiency },
    { 
      title: '日当たり', 
      production: actualDailyProduction,
      operationRate: isNaN(actualDailyEfficiency) ? 0 : actualDailyEfficiency
    }
  ];

  return (
    <Grid container spacing={2} sx={{ height: '100%' }}>
      {statsData.map((data, index) => (
        <Grid key={index} item xs={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" align="center" sx={{ mb: 1 }}>
            {data.title}
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {[
              { subTitle: '生産数', value: data.production },
              { subTitle: '可動率', value: data.operationRate }
            ].map((item, subIndex) => (
              <Paper key={subIndex} elevation={3} sx={{ p: 2, height: 'calc(50% - 8px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Typography variant="subtitle1" sx={{ position: 'absolute', top: 8, left: 8 }}>{item.subTitle}</Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  alignItems: 'center', 
                  height: '100%', 
                  pr: 2 
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'baseline', 
                    justifyContent: 'flex-end', 
                    width: '100%',
                    height: '100%'
                  }}>
                    <Typography 
                      variant="h1" 
                      component="div" 
                      color={item.subTitle === '可動率' ? getOperationRateColor(item.value || 0) : 'inherit'}
                      sx={{ 
                        fontSize: {
                          xs: '5rem',
                          sm: '6rem',
                          md: '7rem',
                          lg: '8rem',
                          xl: '9rem'
                        },
                        lineHeight: 1,
                        textAlign: 'right',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '100%',
                      }}
                    >
                      {item.subTitle === '可動率' 
                        ? (isNaN(item.value) ? '0.0' : item.value.toFixed(1)) 
                        : (isNaN(item.value) ? '0' : item.value.toString())}
                    </Typography>
                    {item.subTitle === '可動率' && (
                      <Typography 
                        variant="h4" 
                        component="span" 
                        sx={{ 
                          ml: 1,
                          fontSize: {
                            xs: '1rem',
                            sm: '1.5rem',
                            md: '2rem',
                            lg: '2.5rem',
                            xl: '3rem'
                          }
                        }}
                      >
                        %
                      </Typography>
                    )}
                    {item.subTitle === '生産数' && (
                      <Box sx={{ width: {xs: '1rem', sm: '1.5rem', md: '2rem', lg: '2.5rem', xl: '3rem'} }} />
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductionStats;