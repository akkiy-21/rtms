import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Systeminformation } from 'systeminformation';
import {
  getDeviceConfig,
  getTimeTables,
  DeviceNotFoundError,
  ServerConnectionError,
  getLatestActiveUsers,
  findBestAdapter,
} from '../services/api';
import type { ActiveUser, DeviceConfig, TimeTable } from '../types';

export type UseDeviceSetupParams = {
  loadSettings: () => Promise<void>;
  setTimeTables: Dispatch<SetStateAction<TimeTable[]>>;
  setCurrentTimeTableId: Dispatch<SetStateAction<number | null>>;
  getCurrentTimeTableId: (tables: TimeTable[]) => number;
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
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

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

      const bestMac = await findBestAdapter(addresses, serverAddress, serverPort);

      if (!bestMac) {
        console.error('❌ サーバーに接続可能なアダプターが見つかりませんでした');
        setConnectionError('connection');
        return;
      }

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

        // デバイスIDを設定
        if (config && config.id) {
          setDeviceId(config.id);
          console.log('Device ID set to:', config.id);

          // アクティブユーザーを取得
          try {
            const users = await getLatestActiveUsers(serverAddress, serverPort, config.id);
            setActiveUsers(users);
          } catch (error) {
            // 404エラーは通常の動作（データがない場合）なので、警告レベルで記録
            console.warn('アクティブユーザーデータが見つかりませんでした（デバイスIDにデータが存在しない可能性があります）');
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
          setConnectionError('device');
        } else {
          console.error('エラータイプ: Unknown error - MACアドレスをクリアします');
          setSelectedMac('');
          await window.electronAPI.storeSet('selectedMac', '');
          setConnectionError('connection');
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
    } finally {
      setIsLoading(false);
    }
  }, [
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
    const handleMqttStatus = (status: string) => {
      if (status === 'error' || status === 'disconnected') {
        setMqttError(true);
      } else {
        setMqttError(false);
      }
    };

    window.electronAPI.onMqttStatus(handleMqttStatus);

    return () => {
      window.electronAPI.onMqttStatus(() => {});
    };
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

    window.electronAPI.onBridgeRestartStarted(handleBridgeRestartStarted);

    return () => {
      window.electronAPI.onBridgeRestartStarted(() => {});
    };
  }, []);

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
    activeUsers,
    setActiveUsers,
    initializeApp,
  };
};
