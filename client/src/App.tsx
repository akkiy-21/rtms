// App.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ThemeProvider, CssBaseline, Box, Grid, Divider } from '@mui/material';
import { theme } from './utils/theme';
import Header from './components/Header';
import Footer from './components/Footer';
import EquipmentStatus from './components/EquipmentStatus';
import ProductionInfo from './components/ProductionInfo';
import ProductionStats from './components/ProductionStats';
import SettingsDialog from './components/SettingsDialog';
import LoadingDialog from './components/LoadingDialog';
import ConnectionErrorDialog from './components/ConnectionErrorDialog';
import { useSettings } from './hooks/useSettings';
import { 
  getDeviceConfig, 
  DeviceNotFoundError, 
  ServerConnectionError, 
  getDeviceInfo
} from './services/api';
import { 
  TimeTable, 
  TimeTableData, 
  EfficiencyData, 
  SignalState, 
  OperationStatus, 
  TimeMeasurement 
} from './types';
import ErrorDialog from './components/ErrorDialog';
import MqttStatusDialog from './components/MqttStatusDialog';
import { useProductionCalculations } from './hooks/useProductionCalculations';
import { useDevice } from './contexts/DeviceContext';
import { ScriptProvider, useScript } from './contexts/ScriptContext';
import { useWebSocket } from './hooks/useWebSocket';
import { useCursorVisibility } from './hooks/useCursorVisibility';
import { useDeviceSetup } from './hooks/useDeviceSetup';
import { useDashboardPublisher } from './hooks/useDashboardPublisher';

const AppContent: React.FC = () => {
  useCursorVisibility();
  const { deviceId, setDeviceId } = useDevice();
  const { isScriptReady, setScriptReady } = useScript();
  const { 
    openSettings, 
    handleOpenSettings, 
    handleCloseSettings, 
    serverIP, 
    setServerIP,
    serverPort, 
    setServerPort,
    mqttBrokerIP,
    setMqttBrokerIP,
    mqttBrokerPort,
    setMqttBrokerPort,
    mqttPublishInterval,
    setMqttPublishInterval,
    handleSaveSettings,
    loadSettings
  } = useSettings();
  const [scanTime, setScanTime] = useState<number | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [timeTables, setTimeTables] = useState<TimeTable[]>([]);
  const [currentTimeTableId, setCurrentTimeTableId] = useState<number | null>(null);
  const [timeTableData, setTimeTableData] = useState<{ [key: number]: TimeTableData }>({});
  const [lastDataResetDate, setLastDataResetDate] = useState<string | null>(null);
  const { isConfigConnected } = useWebSocket();

  useEffect(() => {
    console.log('🔌 isConfigConnected状態変更:', isConfigConnected);
  }, [isConfigConnected]);

  const [mqttStatusDialogOpen, setMqttStatusDialogOpen] = useState(false);

  const [cumulativeTimes, setCumulativeTimes] = useState({
    操業時間: 0,
    性能ロス時間: 0,
    停止ロス時間: 0,
    計画停止時間: 0
  });

  const [signalStates, setSignalStates] = useState<{ [key: string]: SignalState }>({});

  const lastUpdateTime = useRef<number>(Date.now());
  const currentStatus = useRef<string | null>(null);

  const [operationStatus, setOperationStatus] = useState<OperationStatus>({ status: "停止中", category: "停止ロス時間" });
  const lastStatusChangeTime = useRef<number>(Date.now());
  const [timeMeasurement, setTimeMeasurement] = useState<TimeMeasurement>({
    '操業時間': 0,
    '性能ロス時間': 0,
    '停止ロス時間': 0,
    '計画停止時間': 0
  });

  const [displayData, setDisplayData] = useState<{
    dailyProduction: number;
    dailyEfficiency: number;
  }>({ dailyProduction: 0, dailyEfficiency: 0 });

  useEffect(() => {
    const handleScriptReady = (ready: boolean) => {
      console.log('🔔 script-ready イベント受信:', ready);
      setScriptReady(ready);
    };

    window.electronAPI.onScriptReady(handleScriptReady);

    return () => {
      window.electronAPI.removeListener('script-ready', handleScriptReady);
    };
  }, [setScriptReady]);

  useEffect(() => {
    console.log('📡 isScriptReady状態変更:', isScriptReady);
    if (isScriptReady) {
      // スクリプトの準備が整ったら WebSocket 接続を開始
      console.log('WebSocket接続を開始します（※既に接続されているはずです）');
      // window.electronAPI.connectWebSockets(); // 既にmain.tsで接続されているのでコメントアウト
    }
  }, [isScriptReady]);

  const getCurrentTimeTableId = useCallback((tables: TimeTable[]): number => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const [startHour, startMinute] = table.start_time.split(':').map(Number);
      const [endHour, endMinute] = table.end_time.split(':').map(Number);

      const startTime = startHour * 60 + startMinute;
      let endTime = endHour * 60 + endMinute;

      if (endTime <= startTime) {
        endTime += 24 * 60;
      }

      if (currentTime >= startTime && currentTime < endTime) {
        return table.id;
      }

      if (i === tables.length - 1 && currentTime < startTime) {
        return table.id;
      }
    }

    return tables[0].id;
  }, []);

  const {
    isLoading,
    loadingMessage,
    deviceConfig,
    setDeviceConfig,
    connectionError,
    setConnectionError,
    selectedMac,
    setSelectedMac,
    macAddresses,
    mqttError,
    initializeApp,
  } = useDeviceSetup({
    loadSettings,
    setTimeTables,
    setCurrentTimeTableId,
    getCurrentTimeTableId,
    setDeviceId,
    isConfigConnected,
    isScriptReady,
  });

  useEffect(() => {
    console.log('🔍 エラー状態チェック:', { connectionError, mqttError, isLoading });
    console.log('📊 ConnectionErrorDialog状態:', { 
      open: connectionError !== null || mqttError, 
      errorType: mqttError ? 'mqtt' : (connectionError || 'connection'),
      connectionError,
      mqttError 
    });
  }, [connectionError, mqttError, isLoading]);

  const {
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
  } = useProductionCalculations(
    timeTables,
    currentTimeTableId,
    timeTableData,
    deviceConfig,
    cumulativeTimes
  );

  const dashboardSnapshot = useMemo(() => ({
    status: operationStatus.status,
    category: operationStatus.category,
    standardCycleTime: deviceConfig?.standard_cycle_time || 0,
    dailyProduction: dailyProduction,
    dailyEfficiency: parseFloat(dailyEfficiency.toFixed(3)),
    dailyAvgCycleTime: parseFloat(dailyAvgCycleTime.toFixed(3)),
    hourlyProduction: hourlyProduction,
    hourlyEfficiency: parseFloat(hourlyEfficiency.toFixed(3)),
    hourlyNg: hourlyNg,
    dailyNg: dailyNg,
  }), [
    dailyAvgCycleTime,
    dailyEfficiency,
    dailyNg,
    dailyProduction,
    deviceConfig,
    hourlyEfficiency,
    hourlyNg,
    hourlyProduction,
    operationStatus
  ]);

  useDashboardPublisher(dashboardSnapshot, mqttPublishInterval);

  useEffect(() => {
    console.log('現在のデバイスID:', deviceId);
  }, [deviceId]);

  const handleSaveSettingsAndReinitialize = async () => {
    await handleSaveSettings();
    // MACアドレスは自動選択されるため、手動での設定は不要
    // アプリを再初期化して最適なアダプターを自動選択
    initializeApp();
  };

  const handleRetry = () => {
    initializeApp();
    if (mqttError) {
      window.electronAPI.reconnectMqtt();
    }
  };

  useEffect(() => {
    const updateScanTime = (newScanTime: number) => {
      setScanTime(newScanTime);
    };
  
    return window.electronAPI.onUpdateScanTime(updateScanTime);
  }, []);

  useEffect(() => {
    const handleErrorStatus = (newErrorType: string | null) => {
      setErrorType(newErrorType);
    };

    return window.electronAPI.onUpdateErrorStatus(handleErrorStatus);
  }, []);

  const handleDataUpdate = useCallback((data: any) => {
    if (data.name === 'quality_control' && data.data) {
      setTimeTableData(prevData => {
        const currentTable = prevData[currentTimeTableId || 0] || {
          productionCount: 0,
          ngCount: 0,
          operationTime: 0,
          performanceLossTime: 0,
          stopLossTime: 0,
          plannedStopTime: 0,
          lastUpdateTime: Date.now()
        };
  
        if (data.data.Good) {
          return {
            ...prevData,
            [currentTimeTableId || 0]: {
              ...currentTable,
              productionCount: currentTable.productionCount + data.data.Good.count
            }
          };
        } else if (data.data.Ng) {
          return {
            ...prevData,
            [currentTimeTableId || 0]: {
              ...currentTable,
              ngCount: currentTable.ngCount + data.data.Ng.count
            }
          };
        }
  
        return prevData;
      });
    } else if (data.name === 'efficiency' && data.data) {
      const currentTime = Date.now();
      
      setSignalStates(prevStates => {
        const newSignalStates = { ...prevStates };
        for (const [category, value] of Object.entries(data.data as EfficiencyData)) {
          newSignalStates[category] = {
            state: value.state,
            name: value.name,
            lastUpdated: currentTime
          };
        }
  
        let newStatus: OperationStatus = { status: "停止中", category: "停止ロス時間" };
        let latestTrueSignal: SignalState | null = null;
  
        for (const [category, signal] of Object.entries(newSignalStates)) {
          if (signal.state) {
            if (!latestTrueSignal || signal.lastUpdated > latestTrueSignal.lastUpdated) {
              latestTrueSignal = signal;
              newStatus = { status: signal.name, category };
            }
          }
        }
  
        const elapsedTime = (currentTime - lastUpdateTime.current) / 1000;
  
        // 最小更新間隔を削除し、常に更新を行うようにする
        setTimeTableData(prevData => {
          const currentTable = prevData[currentTimeTableId || 0] || {
            productionCount: 0,
            ngCount: 0,
            operationTime: 0,
            performanceLossTime: 0,
            stopLossTime: 0,
            plannedStopTime: 0,
            lastUpdateTime: lastUpdateTime.current
          };
  
          const updatedTable = { ...currentTable };
          
          // 現在のステータスに対して経過時間を加算
          switch (currentStatus.current) {
            case '操業時間':
              updatedTable.operationTime += elapsedTime;
              break;
            case '性能ロス時間':
              updatedTable.performanceLossTime += elapsedTime;
              break;
            case '停止ロス時間':
              updatedTable.stopLossTime += elapsedTime;
              break;
            case '計画停止時間':
              updatedTable.plannedStopTime += elapsedTime;
              break;
          }
  
          updatedTable.lastUpdateTime = currentTime;
  
          console.log('Time update:', {
            currentStatus: currentStatus.current,
            newStatus: newStatus.category,
            elapsedTime,
            updatedTimes: {
              operationTime: updatedTable.operationTime,
              performanceLossTime: updatedTable.performanceLossTime,
              stopLossTime: updatedTable.stopLossTime,
              plannedStopTime: updatedTable.plannedStopTime
            }
          });
  
          return { ...prevData, [currentTimeTableId || 0]: updatedTable };
        });
  
        setOperationStatus(newStatus);
        lastUpdateTime.current = currentTime;
        
        // ステータスが変更された場合のみ lastStatusChangeTime を更新
        if (currentStatus.current !== newStatus.category) {
          lastStatusChangeTime.current = currentTime;
          currentStatus.current = newStatus.category;
          console.log('Status changed:', {
            from: currentStatus.current,
            to: newStatus.category,
            at: new Date(currentTime).toISOString()
          });
        }
  
        console.log('Status update:', {
          newSignalStates,
          newStatus,
          currentTime: new Date(currentTime).toISOString(),
          elapsedTime
        });
  
        return newSignalStates;
      });
    }
  }, [currentTimeTableId]);

  /*
  useEffect(() => {
    console.log('時間当たりの統計:');
    console.log('生産数:', hourlyStats.production);
    console.log('操業時間:', hourlyStats.operationTime);
    console.log('性能ロス時間:', hourlyStats.performanceLossTime);
    console.log('停止ロス時間:', hourlyStats.stopLossTime);
    console.log('計画停止時間:', hourlyStats.plannedStopTime);
  
    console.log('日当たりの統計:');
    console.log('生産数:', dailyStats.production);
    console.log('操業時間:', dailyStats.operationTime);
    console.log('性能ロス時間:', dailyStats.performanceLossTime);
    console.log('停止ロス時間:', dailyStats.stopLossTime);
    console.log('計画停止時間:', dailyStats.plannedStopTime);
  }, [hourlyStats, dailyStats]);
  */
  
  useEffect(() => {
    const cleanup = window.electronAPI.onUpdateData(handleDataUpdate);
    return cleanup;
  }, [handleDataUpdate]);

  useEffect(() => {
    const updateCumulativeTimes = () => {
      const now = Date.now();
      const timeDiff = (now - lastUpdateTime.current) / 1000;

      setCumulativeTimes(prevTimes => {
        const newTimes = { ...prevTimes };
        if (currentStatus.current) {
          newTimes[currentStatus.current as keyof typeof newTimes] += timeDiff;
        } else {
          newTimes['停止ロス時間'] += timeDiff;
        }
        return newTimes;
      });

      setTimeTableData(prevData => {
        const currentTable = prevData[currentTimeTableId || 0] || {
          productionCount: 0,
          ngCount: 0,
          operationTime: 0,
          performanceLossTime: 0,
          stopLossTime: 0,
          plannedStopTime: 0,
          lastUpdateTime: now
        };
        const updatedTable = { ...currentTable };
        if (currentStatus.current) {
          switch (currentStatus.current) {
            case '操業時間':
              updatedTable.operationTime += timeDiff;
              break;
            case '性能ロス時間':
              updatedTable.performanceLossTime += timeDiff;
              break;
            case '停止ロス時間':
              updatedTable.stopLossTime += timeDiff;
              break;
            case '計画停止時間':
              updatedTable.plannedStopTime += timeDiff;
              break;
            default:
              updatedTable.stopLossTime += timeDiff;
          }
        } else {
          updatedTable.stopLossTime += timeDiff;
        }
        updatedTable.lastUpdateTime = now;
        return { ...prevData, [currentTimeTableId || 0]: updatedTable };
      });

      lastUpdateTime.current = now;
    };

    const intervalId = setInterval(updateCumulativeTimes, 500); // 0.5秒ごとに累積時間を更新

    return () => clearInterval(intervalId);
  }, [currentTimeTableId, setCumulativeTimes, setTimeTableData]);

  const resetData = useCallback(() => {
    setTimeTableData({});
    setCumulativeTimes({
      操業時間: 0,
      性能ロス時間: 0,
      停止ロス時間: 0,
      計画停止時間: 0
    });
    setLastDataResetDate(new Date().toDateString());
    console.log('前日のデータを削除しました');
  }, []);

  // 基準となるタイムテーブルとその時間を取得する関数
  const getBaseTimeTableInfo = useCallback(() => {
    let baseTableId = 1;
    let baseHour = 8;
    let baseMinute = 30;
    
    if (timeTables.length > 0) {
      const firstTable = [...timeTables].sort((a, b) => a.id - b.id)[0];
      baseTableId = firstTable.id;
      const [startHour, startMinute] = firstTable.start_time.split(':').map(Number);
      baseHour = startHour;
      baseMinute = startMinute;
    }
    
    return { baseTableId, baseHour, baseMinute };
  }, [timeTables]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (timeTables.length > 0) {
        const newTimeTableId = getCurrentTimeTableId(timeTables);
        const now = new Date();
        const currentDateString = now.toDateString();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        if (newTimeTableId !== currentTimeTableId) {
          console.log('Time table switched:', { 
            oldId: currentTimeTableId, 
            newId: newTimeTableId,
            currentTime: now.toLocaleString(),
            currentDate: currentDateString,
            lastResetDate: lastDataResetDate
          });
          
          setCurrentTimeTableId(newTimeTableId);

          setTimeTableData(prevData => {
            // 既存のデータがなければ初期化
            if (!prevData[newTimeTableId]) {
              console.log(`Initializing new time table data for ID: ${newTimeTableId}`);
              return {
                ...prevData,
                [newTimeTableId]: {
                  productionCount: 0,
                  ngCount: 0,
                  operationTime: 0,
                  performanceLossTime: 0,
                  stopLossTime: 0,
                  plannedStopTime: 0,
                  lastUpdateTime: now.getTime()
                }
              };
            }
            return prevData;
          });

          // 日付変更時のリセット判定を改善
          // 最もIDの小さいタイムテーブルを基準とし、そのタイムテーブルの時間帯で日付が変わった場合にリセット
          const { baseTableId, baseHour, baseMinute } = getBaseTimeTableInfo();
          
          const isFirstShiftOfDay = newTimeTableId === baseTableId; // 最初のシフト
          const dateChanged = currentDateString !== lastDataResetDate;
          const isNearStartTime = (currentHour === baseHour && currentMinute >= baseMinute) || 
                                  (currentHour === (baseHour + 1) && currentMinute < baseMinute);

          if (isFirstShiftOfDay && dateChanged && isNearStartTime) {
            console.log('Resetting data due to new day:', {
              newTimeTableId,
              baseTableId,
              baseTime: `${baseHour}:${baseMinute}`,
              currentDate: currentDateString,
              lastResetDate: lastDataResetDate,
              currentTime: now.toLocaleString()
            });
            resetData();
            setLastDataResetDate(currentDateString);
          }
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeTables, currentTimeTableId, getCurrentTimeTableId, lastDataResetDate, resetData, getBaseTimeTableInfo]);
  
useEffect(() => {
  // MQTT更新通知のハンドラー
  const handleMqttUpdate = async (data: { type: string, timestamp: number }) => {
    if (!deviceId || !serverIP || !serverPort) return;

    try {
      if (data.type === 'device_info') {
        const updatedDeviceInfo = await getDeviceInfo(serverIP, serverPort, deviceId);
        setDeviceConfig(prevConfig => ({
          ...prevConfig,
          mac_address: updatedDeviceInfo.mac_address,
          name: updatedDeviceInfo.name,
          ssh_username: updatedDeviceInfo.ssh_username,
          standard_cycle_time: updatedDeviceInfo.standard_cycle_time,
        }));
        
        console.log('Device configuration updated:', {
          mac_address: updatedDeviceInfo.mac_address,
          name: updatedDeviceInfo.name,
          ssh_username: updatedDeviceInfo.ssh_username,
          standard_cycle_time: updatedDeviceInfo.standard_cycle_time,
        });
      } else if (data.type === 'plc_config') {
        const updatedConfig = await getDeviceConfig(serverIP, serverPort, selectedMac);
        setDeviceConfig(updatedConfig);
        
        if (isConfigConnected) {
          try {
            const response = await window.electronAPI.sendConfigWebSocket(updatedConfig);
            if (response.status === 'success') {
              console.log('PLC configuration successfully updated:', response.message);
            } else {
              console.error('Failed to update PLC configuration:', response.message);
              setConnectionError('config');
            }
          } catch (wsError) {
            console.error('WebSocket communication error:', wsError);
            setConnectionError('connection');
          }
        } else {
          console.log('Waiting for WebSocket connection...');
        }
      }
    } catch (error) {
      console.error('Failed to fetch updated device information:', error);
      if (error instanceof DeviceNotFoundError) {
        setConnectionError('device');
      } else if (error instanceof ServerConnectionError) {
        setConnectionError('connection');
      } else {
        setConnectionError('connection');
      }
    }
  };

  window.electronAPI.on('mqtt-update-notification', handleMqttUpdate);

  return () => {
    window.electronAPI.removeListener('mqtt-update-notification', handleMqttUpdate);
  };
}, [deviceId, serverIP, serverPort, selectedMac, isConfigConnected]);

  useEffect(() => {
    setDisplayData({
      dailyProduction: dailyProduction,
      dailyEfficiency: dailyEfficiency
    });
  }, [dailyProduction, dailyEfficiency, lastDataResetDate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
        <Header
          onOpenSettings={handleOpenSettings}
          deviceConfig={deviceConfig}
          selectedMac={selectedMac}
          scanTime={scanTime}
          mqttError={mqttError}
          onMqttStatusClick={() => setMqttStatusDialogOpen(true)}
          highScanTimeError={errorType === 'high-scan-time'}
        />
        <Box sx={{ flexGrow: 1, p: 1, pb: 1.5, display: 'flex', flexDirection: 'column' }}>
          <EquipmentStatus deviceConfig={deviceConfig} operationStatus={operationStatus} />
          <Divider sx={{ mb: 1 }} />
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid item xs={3} sx={{ height: '100%' }}>
              <ProductionInfo 
                deviceConfig={deviceConfig}
                hourlyProduction={hourlyProduction}
                hourlyEfficiency={hourlyEfficiency}
                dailyProduction={displayData.dailyProduction}
                dailyEfficiency={displayData.dailyEfficiency}
                hourlyAvgCycleTime={hourlyAvgCycleTime}
                dailyAvgCycleTime={dailyAvgCycleTime}
              />
            </Grid>
            <Grid item xs={9} sx={{ height: '100%' }}>
              <ProductionStats 
                deviceConfig={deviceConfig}
                timeTables={timeTables}
                currentTimeTableId={currentTimeTableId}
                timeTableData={timeTableData}
                hourlyProduction={hourlyProduction}
                hourlyEfficiency={hourlyEfficiency}
                displayData={displayData}
                actualDailyProduction={dailyProduction}
                actualDailyEfficiency={dailyEfficiency}
              />
            </Grid>
          </Grid>
        </Box>
        <Footer />
      </Box>
      <SettingsDialog
        open={openSettings}
        onClose={handleCloseSettings}
        onSave={handleSaveSettingsAndReinitialize}
        serverIP={serverIP}
        serverPort={serverPort}
        mqttBrokerIP={mqttBrokerIP}
        mqttBrokerPort={mqttBrokerPort}
        mqttPublishInterval={mqttPublishInterval}
        setServerIP={setServerIP}
        setServerPort={setServerPort}
        setMqttBrokerIP={setMqttBrokerIP}
        setMqttBrokerPort={setMqttBrokerPort}
        setMqttPublishInterval={setMqttPublishInterval}
        currentMac={selectedMac}
      />
      <LoadingDialog open={isLoading} message={loadingMessage} />
      <ConnectionErrorDialog
        open={connectionError !== null}
        errorType={connectionError || 'connection'}
        serverIP={serverIP}
        serverPort={serverPort}
        macAddress={selectedMac}
        mqttBrokerIP={mqttBrokerIP}
        mqttBrokerPort={mqttBrokerPort}
        onOpenSettings={handleOpenSettings}
        onRetry={handleRetry}
      />
      <MqttStatusDialog
        open={mqttStatusDialogOpen}
        onClose={() => setMqttStatusDialogOpen(false)}
        isConnected={!mqttError}
        mqttBrokerIP={mqttBrokerIP}
        mqttBrokerPort={mqttBrokerPort}
        onRetry={() => {
          setMqttStatusDialogOpen(false);
          window.electronAPI.reconnectMqtt();
        }}
        onOpenSettings={() => {
          setMqttStatusDialogOpen(false);
          handleOpenSettings();
        }}
      />
      <ErrorDialog open={errorType !== null && errorType !== 'high-scan-time'} errorType={errorType}/>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
            