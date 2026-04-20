import { useEffect, useRef } from 'react';

export type DashboardSnapshot = {
  status: string | null;
  category: string | null;
  targetProduction: number;
  standardCycleTime: number;
  dailyProduction: number;
  dailyEfficiency: number;
  dailyAvgCycleTime: number;
  productionAchievementRate: number;
  hourlyProduction: number;
  hourlyEfficiency: number;
  hourlyNg: number;
  dailyNg: number;
  operators: string[];
};

/**
 * Publishes dashboard metrics to MQTT at the given interval, always using the latest snapshot.
 */
export const useDashboardPublisher = (
  snapshot: DashboardSnapshot,
  mqttPublishInterval: number
) => {
  const snapshotRef = useRef(snapshot);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mqttPublishInterval || mqttPublishInterval <= 0) return;

    const publishDashboardInfo = () => {
      const payload = {
        timestamp: new Date().toISOString(),
        ...snapshotRef.current,
      };
      window.electronAPI.mqttPublish('dashboard', JSON.stringify(payload), 1);
    };

    const intervalId = setInterval(
      publishDashboardInfo,
      mqttPublishInterval * 1000
    );

    return () => clearInterval(intervalId);
  }, [mqttPublishInterval]);
};
