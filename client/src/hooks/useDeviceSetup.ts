import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Systeminformation } from 'systeminformation';
import {
  getDeviceConfig,
  getTimeTables,
  DeviceNotFoundError,
  ServerConnectionError,
  findBestAdapter,
  requestPairingCode,
  updateDeviceRuntimeNetwork,
} from '../services/api';
import type { DeviceConfig, PairingCodeResponse, TimeTable } from '../types';

type PairingDisplayStatus = PairingCodeResponse['status'] | null;

export type UseDeviceSetupParams = {
  loadSettings: () => Promise<void>;
  setTimeTables: Dispatch<SetStateAction<TimeTable[]>>;
  setCurrentTimeTableId: Dispatch<SetStateAction<number | null>>;
  getCurrentTimeTableId: (tables: TimeTable[]) => number | null;
  setDeviceId: (id: number | null) => void;
  isConfigConnected: boolean;
  isScriptReady: boolean;
};

export const useDeviceSetup = ({
  loadSettings,
  setTimeTables,
  setCurrentTimeTableId,
  getCurrentTimeTableId,
  setDeviceId,
  isConfigConnected,
  isScriptReady,
}: UseDeviceSetupParams) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('ブリッジスクリプトを起動中...');
  const [deviceConfig, setDeviceConfig] = useState<DeviceConfig | null>(null);
  const [connectionError, setConnectionError] = useState<'connection' | 'device' | 'config' | null>(null);
  const [selectedMac, setSelectedMac] = useState('');
  const [macAddresses, setMacAddresses] = useState<Systeminformation.NetworkInterfacesData[]>([]);
  const [mqttError, setMqttError] = useState(false);
  const [pairingStatus, setPairingStatus] = useState<PairingDisplayStatus>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingCodeExpiresAt, setPairingCodeExpiresAt] = useState<string | null>(null);
  const [pairingRefreshIntervalSeconds, setPairingRefreshIntervalSeconds] = useState(30);
  const [pairingPollIntervalSeconds, setPairingPollIntervalSeconds] = useState(1);
  const [pendingRegisteredInitialization, setPendingRegisteredInitialization] = useState(false);

  const clearPairingState = useCallback(() => {
    setPairingStatus(null);
    setPairingCode(null);
    setPairingCodeExpiresAt(null);
  }, []);

  const refreshPairingCode = useCallback(async () => {
    if (!selectedMac) {
      clearPairingState();
      return;
    }

    const serverAddress = await window.electronAPI.storeGet('serverIP');
    const serverPort = await window.electronAPI.storeGet('serverPort');
    if (!serverAddress || !serverPort) {
      clearPairingState();
      return;
    }

    const response = await requestPairingCode(serverAddress, serverPort, selectedMac);
    setPairingRefreshIntervalSeconds(response.refresh_interval_seconds || 30);
    setPairingPollIntervalSeconds(response.poll_interval_seconds || 1);

    if (response.status === 'registered') {
      clearPairingState();
      setConnectionError(null);
      setPendingRegisteredInitialization(true);
      return;
    }

    setPairingStatus(response.status);
    setPairingCode(response.status === 'pending' ? response.pairing_code ?? null : null);
    setPairingCodeExpiresAt(response.status === 'pending' ? response.expires_at ?? null : null);
  }, [clearPairingState, selectedMac]);

  const initializeApp = useCallback(async () => {
    setIsLoading(true);
    setLoadingMessage('ブリッジスクリプトを起動中...');
    
    try {
      // 1. 設定読み込みとMACアドレス取得
      await loadSettings();
      
      // サーバー設定を先に取得
      const serverAddress = await window.electronAPI.storeGet('serverIP');
      const serverPort = await window.electronAPI.storeGet('serverPort');

      console.log(`📡 取得したサーバー設定: IP=${serverAddress}, Port=${serverPort}`);

      if (!serverAddress || !serverPort) {
        console.error('❌ サーバー設定が不完全です');
        throw new ServerConnectionError('サーバーアドレスまたはポートが設定されていません');
      }

      // この関数はisScriptReady && isConfigConnectedの両方がtrueの時のみ呼び出される
      console.log('✅ Bridge script and WebSocket are ready! Starting initialization...');

      setLoadingMessage('ネットワークアダプターを検出中...');
      const addresses = await window.electronAPI.getAllMacAddresses();
      setMacAddresses(addresses);

      if (!addresses || addresses.length === 0) {
        throw new Error('利用可能なMACアドレスが見つかりません');
      }

      // 4. 最適なアダプターを自動選択（サーバー接続チェック）
      setLoadingMessage('最適なネットワークアダプターを選択中...');
      console.log('🔍 サーバーに接続可能なアダプターを検索中:', `http://${serverAddress}:${serverPort}`);

      const bestAdapter = await findBestAdapter(addresses, serverAddress, serverPort);

      if (!bestAdapter) {
        console.error('❌ サーバーに接続可能なアダプターが見つかりませんでした');
        setConnectionError('connection');
        return;
      }

      const bestMac = bestAdapter.macAddress;

      console.log('✅ 自動選択されたMACアドレス:', bestMac);
      setSelectedMac(bestMac);
      await window.electronAPI.storeSet('selectedMac', bestMac);

      // 5. HTTPサーバーへの接続（デバイス設定取得）
      setLoadingMessage('サーバーに接続中...');

      try {
        const config = await getDeviceConfig(serverAddress, serverPort, bestMac);
        console.log('✅ HTTPサーバー接続成功 - デバイス設定を取得しました:', config);
        setDeviceConfig(config);
        await window.electronAPI.storeSet('deviceConfig', config);
        setConnectionError(null);
        clearPairingState();

        // デバイスIDを設定
        if (config && config.id) {
          setDeviceId(config.id);
          console.log('Device ID set to:', config.id);

          if (bestAdapter.ipAddress) {
            try {
              await updateDeviceRuntimeNetwork(serverAddress, serverPort, config.id, bestAdapter.ipAddress);
              console.log('✅ デバイスIPをバックエンドへ同期しました:', bestAdapter.ipAddress);
            } catch (runtimeNetworkError) {
              console.warn('⚠️ デバイスIPの同期に失敗しました。起動処理は継続します。', runtimeNetworkError);
            }
          } else {
            console.warn('⚠️ 選択されたアダプターのIPv4アドレスを取得できなかったため、デバイスIP同期をスキップします');
          }
        }

        const tables = await getTimeTables(serverAddress, serverPort);
        setTimeTables(tables);
        setCurrentTimeTableId(getCurrentTimeTableId(tables));

        // 5. WebSocket経由で設定を送信
        setLoadingMessage('設定を送信中...');
        try {
          const response = await window.electronAPI.sendConfigWebSocket(config);
          if (response.status === 'success') {
            console.log('設定が正常に更新されました:', response.message);
          } else {
            console.error('設定の更新に失敗しました:', response.message);
            setConnectionError('config');
            return; // 設定送信エラー時はMQTT接続をスキップ
          }
        } catch (wsError) {
          console.error('WebSocket通信エラー:', wsError);
          setConnectionError('connection');
          return; // WebSocket通信エラー時はMQTT接続をスキップ
        }

        // 6. MQTT接続
        setLoadingMessage('MQTTブローカーに接続中...');
        const mqttBrokerAddress = await window.electronAPI.storeGet('mqttBrokerIP');
        const mqttBrokerPort = await window.electronAPI.storeGet('mqttBrokerPort');
        if (mqttBrokerAddress && mqttBrokerPort) {
          // MACアドレスを設定してからMQTT接続
          await window.electronAPI.updateMqttManagerMac(bestMac);
          await window.electronAPI.reconnectMqtt();
        }

        setLoadingMessage('初期化完了');
      } catch (error) {
        console.error('❌ HTTPサーバー接続エラーが発生しました:', error);

        // DeviceNotFoundError（デバイス未登録）の場合は、MACアドレスは正しく選択されているので保持する
        // ServerConnectionError（サーバー接続失敗）の場合のみMACアドレスをクリアする
        if (error instanceof ServerConnectionError) {
          console.error('エラータイプ: ServerConnectionError - MACアドレスをクリアします');
          setSelectedMac('');
          await window.electronAPI.storeSet('selectedMac', '');
          setConnectionError('connection');
        } else if (error instanceof DeviceNotFoundError) {
          console.error('エラータイプ: DeviceNotFoundError - MACアドレスは保持します');
          // MACアドレスはクリアせず、bestMacを保持
          clearPairingState();
          setConnectionError('device');
        } else {
          console.error('エラータイプ: Unknown error - MACアドレスをクリアします');
          setSelectedMac('');
          await window.electronAPI.storeSet('selectedMac', '');
          setConnectionError('connection');
          clearPairingState();
          console.error('Unknown error:', error);
        }
        console.log('ConnectionErrorダイアログを表示します。エラータイプ:', connectionError);
        return; // HTTPサーバー接続エラー時はMQTT接続をスキップ
      }
    } catch (error) {
      console.error('アプリケーションの初期化エラー:', error);

      // 接続エラー時は保存されたMACアドレスをクリア
      setSelectedMac('');
      await window.electronAPI.storeSet('selectedMac', '');

      setConnectionError('connection');
      clearPairingState();
    } finally {
      setIsLoading(false);
    }
  }, [
    clearPairingState,
    getCurrentTimeTableId,
    isConfigConnected,
    isScriptReady,
    loadSettings,
    setCurrentTimeTableId,
    setDeviceId,
    setTimeTables,
  ]);

  useEffect(() => {
    // WebSocketとブリッジスクリプトの両方が準備できたときのみ実行
    if (isScriptReady && isConfigConnected) {
      initializeApp();
    }
  }, [initializeApp, isScriptReady, isConfigConnected]);

  useEffect(() => {
    if (!pendingRegisteredInitialization || !isScriptReady || !isConfigConnected) {
      return;
    }

    setPendingRegisteredInitialization(false);
    void initializeApp();
  }, [initializeApp, isConfigConnected, isScriptReady, pendingRegisteredInitialization]);

  useEffect(() => {
    const handleMqttStatus = (status: string) => {
      if (status === 'error' || status === 'disconnected') {
        setMqttError(true);
      } else {
        setMqttError(false);
      }
    };

    return window.electronAPI.onMqttStatus(handleMqttStatus);
  }, []);

  // ブリッジ再起動開始イベントをリッスン
  useEffect(() => {
    const handleBridgeRestartStarted = () => {
      console.log('🔄 ブリッジ再起動開始 - エラー状態をクリアし、ローディング表示を開始します');
      // エラー状態をクリア
      setConnectionError(null);
      setMqttError(false);
      // ローディング表示を開始
      setIsLoading(true);
      setLoadingMessage('ブリッジスクリプトを再起動中...');
    };

    return window.electronAPI.onBridgeRestartStarted(handleBridgeRestartStarted);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const scheduleRefresh = async () => {
      if (cancelled || connectionError !== 'device' || !selectedMac) {
        return;
      }

      try {
        await refreshPairingCode();
      } catch (error) {
        console.warn('ペアリングコードの更新に失敗しました', error);
      }

      if (!cancelled) {
        timer = setTimeout(scheduleRefresh, pairingPollIntervalSeconds * 1000);
      }
    };

    if (connectionError === 'device' && selectedMac) {
      scheduleRefresh();
    } else {
      clearPairingState();
    }

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [clearPairingState, connectionError, pairingPollIntervalSeconds, refreshPairingCode, selectedMac]);

  return {
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
    pairingStatus,
    pairingCode,
    pairingCodeExpiresAt,
    pairingRefreshIntervalSeconds,
    pairingPollIntervalSeconds,
    initializeApp,
  };
};
