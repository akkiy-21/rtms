// src/hooks/useProductionCalculations.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { TimeTable, TimeTableData, DeviceConfig } from '../types';

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

  const calculateOperationRate = useCallback((data: OperationRateData, standardCycleTime: number, totalRunTime: number) => {
    if (totalRunTime === 0 || standardCycleTime === 0) {
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
    const startTime = new Date(now);
    
    // タイムテーブルの最初のエントリ（通常はIDの最小値）の開始時間を取得
    let baseHour = 8;
    let baseMinute = 30;
    
    if (timeTables.length > 0) {
      // 最もIDの小さいタイムテーブルを基準とする
      const firstTable = [...timeTables].sort((a, b) => a.id - b.id)[0];
      const [startHour, startMinute] = firstTable.start_time.split(':').map(Number);
      baseHour = startHour;
      baseMinute = startMinute;
    }
    
    // 基準時間を設定
    startTime.setHours(baseHour, baseMinute, 0, 0);
    
    // 現在時刻が基準時間より前の場合は前日の基準時間を使用
    if (now.getHours() < baseHour || (now.getHours() === baseHour && now.getMinutes() < baseMinute)) {
      startTime.setDate(startTime.getDate() - 1);
    }
    
    const endTime = new Date(startTime);
    endTime.setDate(endTime.getDate() + 1);
    
    console.log('Daily time range:', {
      start: startTime.toLocaleString(),
      end: endTime.toLocaleString(),
      currentTime: now.toLocaleString(),
      baseTime: `${baseHour}:${baseMinute}`
    });
    
    return { startTime, endTime };
  }, [timeTables]);

  const calculations = useMemo(() => {
    if (timeTables.length > 0 && currentTimeTableId && timeTableData[currentTimeTableId] && deviceConfig) {
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
      const { startTime, endTime } = getDailyTimeRange();
      const dailyStats: ProductionStats & { ngCount: number } = {
        production: 0,
        operationTime: 0,
        performanceLossTime: 0,
        stopLossTime: 0,
        plannedStopTime: 0,
        ngCount: 0
      };

      const includedTableIds: number[] = [];

      timeTables.forEach(table => {
        const tableData = timeTableData[table.id];
        if (tableData) {
          // 開始時間の処理
          const tableStartTime = new Date(startTime);
          const [startHour, startMinute] = table.start_time.split(':').map(Number);
          tableStartTime.setHours(startHour, startMinute, 0, 0);
          
          // 終了時間の処理
          const tableEndTime = new Date(tableStartTime);
          const [endHour, endMinute] = table.end_time.split(':').map(Number);
          tableEndTime.setHours(endHour, endMinute, 0, 0);
          
          // 日付跨ぎの場合は調整
          if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
            tableEndTime.setDate(tableEndTime.getDate() + 1);
          }
          
          // 集計期間内のタイムテーブルか判定（より包括的な条件）
          const isOverlapping = (
            // タイムテーブルが集計期間内に開始
            (tableStartTime >= startTime && tableStartTime < endTime) ||
            // タイムテーブルが集計期間内に終了
            (tableEndTime > startTime && tableEndTime <= endTime) ||
            // タイムテーブルが集計期間を包含
            (tableStartTime <= startTime && tableEndTime >= endTime)
          );
          
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