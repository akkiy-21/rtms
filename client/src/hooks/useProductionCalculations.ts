// src/hooks/useProductionCalculations.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { TimeTable, TimeTableData, DeviceConfig } from '../types';
import { getBaseTimeInMinutes, getBusinessDayRange, getNormalizedTimeTableWindow, getSortedTimeTables } from '../utils/timeTableUtils';

export type ProductionStats = {
  production: number;
  operationTime: number;
  performanceLossTime: number;
  stopLossTime: number;
  plannedStopTime: number;
};

export type OperationRateData = ProductionStats & {
  productionCount: number;
};

type ProductionCalculations = {
  hourlyProduction: number;
  hourlyEfficiency: number;
  dailyProduction: number;
  dailyEfficiency: number;
  hourlyAvgCycleTime: number;
  dailyAvgCycleTime: number;
  totalProduction: number;
  goodRate: number;
  hourlyNg: number;
  dailyNg: number;
  hourlyStats: ProductionStats;
  dailyStats: ProductionStats & { ngCount: number };
};

export const useProductionCalculations = (
  timeTables: TimeTable[],
  currentTimeTableId: number | null,
  timeTableData: { [key: number]: TimeTableData },
  deviceConfig: DeviceConfig | null,
  cumulativeTimes: { [key: string]: number }
): ProductionCalculations => {
  const [hourlyProduction, setHourlyProduction] = useState(0);
  const [hourlyEfficiency, setHourlyEfficiency] = useState(0);
  const [dailyProduction, setDailyProduction] = useState(0);
  const [dailyEfficiency, setDailyEfficiency] = useState(0);
  const [hourlyAvgCycleTime, setHourlyAvgCycleTime] = useState(0);
  const [dailyAvgCycleTime, setDailyAvgCycleTime] = useState(0);
  const [totalProduction, setTotalProduction] = useState(0);
  const [goodRate, setGoodRate] = useState(100);
  const [hourlyNg, setHourlyNg] = useState(0);
  const [dailyNg, setDailyNg] = useState(0);

  const [hourlyStats, setHourlyStats] = useState<ProductionStats>({
    production: 0,
    operationTime: 0,
    performanceLossTime: 0,
    stopLossTime: 0,
    plannedStopTime: 0
  });

  const [dailyStats, setDailyStats] = useState<ProductionStats & { ngCount: number }>({
    production: 0,
    operationTime: 0,
    performanceLossTime: 0,
    stopLossTime: 0,
    plannedStopTime: 0,
    ngCount: 0
  });

  const calculateOperationRate = useCallback((data: OperationRateData, standardCycleTime: number | null, totalRunTime: number) => {
    if (totalRunTime === 0 || !standardCycleTime) {
      return 0;
    }
    const rate = (data.productionCount * standardCycleTime) / totalRunTime * 100;
    return isNaN(rate) ? 0 : rate;
  }, []);

  const calculateAverageCycleTime = useCallback((totalTime: number, productionCount: number) => {
    if (productionCount === 0) {
      return 0;
    }
    const avgTime = totalTime / productionCount;
    return isNaN(avgTime) ? 0 : avgTime;
  }, []);

  const getDailyTimeRange = useCallback(() => {
    const now = new Date();
    const { startTime, endTime, baseTime } = getBusinessDayRange(timeTables, now);
    const baseHour = Math.floor(baseTime / 60);
    const baseMinute = baseTime % 60;
    
    console.log('Daily time range:', {
      start: startTime.toLocaleString(),
      end: endTime.toLocaleString(),
      currentTime: now.toLocaleString(),
      baseTime: `${baseHour}:${baseMinute}`
    });
    
    return { startTime, endTime };
  }, [timeTables]);

  const calculations = useMemo(() => {
    if (timeTables.length > 0 && currentTimeTableId !== null && timeTableData[currentTimeTableId] && deviceConfig) {
      const sortedTables = getSortedTimeTables(timeTables);
      const currentData = timeTableData[currentTimeTableId];

      // 時間当たりの計算
      const hourlyStats: ProductionStats = {
        production: currentData.productionCount,
        operationTime: currentData.operationTime,
        performanceLossTime: currentData.performanceLossTime,
        stopLossTime: currentData.stopLossTime,
        plannedStopTime: currentData.plannedStopTime
      };

      const hourlyTotalRunTime = hourlyStats.operationTime + hourlyStats.performanceLossTime + hourlyStats.stopLossTime;
      const hourlyEfficiency = calculateOperationRate(
        { ...hourlyStats, productionCount: hourlyStats.production },
        deviceConfig.standard_cycle_time,
        hourlyTotalRunTime
      );
      const hourlyAvgCycleTime = calculateAverageCycleTime(hourlyTotalRunTime, hourlyStats.production);
      const hourlyNgCount = currentData.ngCount || 0;

      // 日当たりの計算
      getDailyTimeRange();
      const dailyStats: ProductionStats & { ngCount: number } = {
        production: 0,
        operationTime: 0,
        performanceLossTime: 0,
        stopLossTime: 0,
        plannedStopTime: 0,
        ngCount: 0
      };

      const includedTableIds: number[] = [];
      const baseTime = getBaseTimeInMinutes(sortedTables);
      const normalizedDayStart = baseTime;
      const normalizedDayEnd = baseTime + (24 * 60);

      sortedTables.forEach(table => {
        const tableData = timeTableData[table.id];
        if (tableData) {
          const { startTime: normalizedStartTime } = getNormalizedTimeTableWindow(table, baseTime);
          const isOverlapping = normalizedStartTime >= normalizedDayStart && normalizedStartTime < normalizedDayEnd;
          
          if (isOverlapping) {
            includedTableIds.push(table.id);
            dailyStats.production += tableData.productionCount;
            dailyStats.operationTime += tableData.operationTime;
            dailyStats.performanceLossTime += tableData.performanceLossTime;
            dailyStats.stopLossTime += tableData.stopLossTime;
            dailyStats.plannedStopTime += tableData.plannedStopTime;
            dailyStats.ngCount += tableData.ngCount || 0;
          }
        }
      });

      console.log('Daily calculation includes tables:', {
        includedIds: includedTableIds,
        production: dailyStats.production,
        times: {
          operation: dailyStats.operationTime,
          performance: dailyStats.performanceLossTime,
          stop: dailyStats.stopLossTime,
          planned: dailyStats.plannedStopTime
        }
      });

      const totalDailyRunTime = dailyStats.operationTime + dailyStats.performanceLossTime + dailyStats.stopLossTime;
      const dailyEfficiency = calculateOperationRate(
        { ...dailyStats, productionCount: dailyStats.production },
        deviceConfig.standard_cycle_time,
        totalDailyRunTime
      );
      const dailyAvgCycleTime = calculateAverageCycleTime(totalDailyRunTime, dailyStats.production);

      // 良品率の計算
      const totalProduction = dailyStats.production + dailyStats.ngCount;
      const goodRate = totalProduction > 0 ? ((dailyStats.production - dailyStats.ngCount) / totalProduction) * 100 : 100;

      return {
        hourlyProduction: hourlyStats.production,
        hourlyEfficiency,
        dailyProduction: dailyStats.production,
        dailyEfficiency,
        hourlyAvgCycleTime,
        dailyAvgCycleTime,
        totalProduction,
        goodRate,
        hourlyNg: hourlyNgCount,
        dailyNg: dailyStats.ngCount,
        hourlyStats,
        dailyStats
      };
    }
    return null;
  }, [timeTables, currentTimeTableId, timeTableData, deviceConfig, calculateOperationRate, calculateAverageCycleTime, getDailyTimeRange]);

  useEffect(() => {
    if (calculations) {
      setHourlyProduction(calculations.hourlyProduction);
      setHourlyEfficiency(calculations.hourlyEfficiency);
      setDailyProduction(calculations.dailyProduction);
      setDailyEfficiency(calculations.dailyEfficiency);
      setHourlyAvgCycleTime(calculations.hourlyAvgCycleTime);
      setDailyAvgCycleTime(calculations.dailyAvgCycleTime);
      setTotalProduction(calculations.totalProduction);
      setGoodRate(calculations.goodRate);
      setHourlyNg(calculations.hourlyNg);
      setDailyNg(calculations.dailyNg);
      setHourlyStats(calculations.hourlyStats);
      setDailyStats(calculations.dailyStats);
    }
  }, [calculations]);

  return {
    hourlyProduction,
    hourlyEfficiency,
    dailyProduction,
    dailyEfficiency,
    hourlyAvgCycleTime,
    dailyAvgCycleTime,
    totalProduction,
    goodRate,
    hourlyNg,
    dailyNg,
    hourlyStats,
    dailyStats
  };
};