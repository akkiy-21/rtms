// src/services/mqttManager.ts
import * as mqtt from 'mqtt';
import { BrowserWindow } from 'electron';
import Store from 'electron-store';
import { WebSocketMessage } from '../types';

const store = new Store();

export class MqttManager {
  private client: mqtt.MqttClient | null = null;
  private reconnectAttempts = 0;
  private readonly RECONNECT_INTERVAL = 3000;
  private readonly CONNECT_TIMEOUT = 10000;
  private macAddress: string;
  private brokerUrl: string = '';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectTimeoutTimer: NodeJS.Timeout | null = null;

  constructor(private mainWindow: BrowserWindow | null) {
    this.macAddress = store.get('selectedMac', '') as string;
  }

  connect(brokerUrl: string): void {
    this.brokerUrl = brokerUrl;
    console.log('MQTTブローカーへの接続を開始します:', this.brokerUrl);
    
    // 既存の接続をクリーンアップ
    this.cleanup();

    // URLから余分な引用符を削除
    const cleanUrl = this.brokerUrl.replace(/"/g, '');

    try {
      this.client = mqtt.connect(cleanUrl, {
        reconnectPeriod: 0,
        connectTimeout: this.CONNECT_TIMEOUT,
        clean: true,
        keepalive: 30,
        protocolVersion: 4,
        rejectUnauthorized: false,
        protocol: 'mqtt',
        clientId: `mqtt_client_${this.macAddress}_${Date.now()}`
      });

      // 接続タイムアウトタイマーを設定
      this.setConnectTimeout();

      this.setupEventListeners();
    } catch (error) {
      console.error('MQTT接続の初期化エラー:', error);
      this.handleError(error as Error);
    }
  }

  private setConnectTimeout(): void {
    if (this.connectTimeoutTimer) {
      clearTimeout(this.connectTimeoutTimer);
    }

    this.connectTimeoutTimer = setTimeout(() => {
      if (this.client && !this.client.connected) {
        console.log('MQTT接続がタイムアウトしました');
        this.cleanup();
        this.attemptReconnect();
      }
    }, this.CONNECT_TIMEOUT);
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on('connect', () => {
      this.clearTimers();
      this.handleConnect();
    });

    this.client.on('error', (error: Error) => {
      console.error('MQTTエラー発生:', error);
      this.handleError(error);
    });

    this.client.on('close', () => {
      console.log('MQTT接続がクローズされました');
      this.handleClose();
    });

    this.client.on('offline', () => {
      console.log('MQTTクライアントがオフラインになりました');
      this.handleOffline();
    });

    this.client.on('reconnect', () => {
      console.log('MQTT再接続を試みています...');
    });

    this.client.on('message', (topic: string, message: Buffer) => {
      this.handleMessage(topic, message);
    });

    this.client.on('disconnect', () => {
      console.log('MQTTブローカーから切断されました');
      this.handleDisconnect();
    });

    this.client.on('end', () => {
      console.log('MQTT接続が終了しました');
      this.handleEnd();
    });
  }

  private clearTimers(): void {
    if (this.connectTimeoutTimer) {
      clearTimeout(this.connectTimeoutTimer);
      this.connectTimeoutTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private cleanup(): void {
    this.clearTimers();
    if (this.client) {
      try {
        this.client.removeAllListeners();
        this.client.end(true, {}, () => {
          console.log('MQTT接続を正常に終了しました');
        });
      } catch (error) {
        console.error('MQTT接続のクリーンアップ中にエラーが発生しました:', error);
      } finally {
        this.client = null;
      }
    }
  }

  private handleConnect(): void {
    console.log('MQTT接続が確立されました');
    this.reconnectAttempts = 0;
    this.mainWindow?.webContents.send('mqtt-status', 'connected');
    this.subscribeToTopics();
  }

  private handleDisconnect(): void {
    console.log('MQTTブローカーから切断されました');
    this.mainWindow?.webContents.send('mqtt-status', 'disconnected');
    this.attemptReconnect();
  }

  private handleEnd(): void {
    console.log('MQTT接続が終了しました');
    this.mainWindow?.webContents.send('mqtt-status', 'ended');
    this.cleanup();
  }

  private subscribeToTopics(): void {
    if (!this.client || !this.macAddress) {
      console.error('MQTT購読の準備ができていません');
      return;
    }

    const topics = [
      `${this.macAddress}/update`,
      `${this.macAddress}/command`,
      `${this.macAddress}/config`
    ];

    topics.forEach(topic => {
      this.client!.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`トピック${topic}の購読に失敗しました:`, err);
          this.mainWindow?.webContents.send('mqtt-status', 'subscription-error');
        } else {
          console.log(`トピック${topic}を購読しました`);
        }
      });
    });
  }

  private handleMessage(topic: string, message: Buffer): void {
    try {
      const data = JSON.parse(message.toString());
      if (topic.endsWith('/update')) {
        this.mainWindow?.webContents.send('mqtt-update-notification', data);
      } else if (topic.endsWith('/command')) {
        this.mainWindow?.webContents.send('mqtt-command', data);
      } else if (topic.endsWith('/config')) {
        this.mainWindow?.webContents.send('mqtt-config', data);
      }
    } catch (error) {
      console.error('MQTTメッセージの処理中にエラーが発生しました:', error);
    }
  }

  private handleError(error: Error): void {
    console.error('MQTTエラー:', error.message);
    this.mainWindow?.webContents.send('mqtt-status', 'error');
    
    if (error.message.includes('connack timeout')) {
      console.log('MQTT接続タイムアウト - 再接続を試みます');
      this.cleanup();
      this.attemptReconnect();
    } else if (error.message.includes('connection refused')) {
      console.log('MQTT接続が拒否されました - 設定を確認してください');
      this.mainWindow?.webContents.send('mqtt-status', 'connection-refused');
    }
  }

  private handleClose(): void {
    this.mainWindow?.webContents.send('mqtt-status', 'disconnected');
    this.attemptReconnect();
  }

  private handleOffline(): void {
    this.mainWindow?.webContents.send('mqtt-status', 'offline');
    this.attemptReconnect();
  }

  private attemptReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectAttempts++;
    const delay = this.RECONNECT_INTERVAL * Math.min(this.reconnectAttempts, 30);
    console.log(`MQTT再接続を試行します (試行回数: ${this.reconnectAttempts}) - ${delay}ms後`);

    this.reconnectTimer = setTimeout(() => {
      if (this.brokerUrl && (!this.client || !this.client.connected)) {
        this.connect(this.brokerUrl);
      }
    }, delay);
  }

  public publish(topic: string, message: string, qos: 0 | 1 | 2 = 1): void {
    if (!this.client) {
      console.error('MQTTクライアントが初期化されていません');
      return;
    }

    if (!this.client.connected) {
      console.error('MQTTクライアントが接続されていません');
      return;
    }

    try {
      const fullTopic = `${this.macAddress}/${topic}`;
      const cleanTopic = fullTopic.replace(/"/g, '');
      
      this.client.publish(cleanTopic, message, { qos, retain: false }, (error) => {
        if (error) {
          console.error('メッセージ公開エラー:', error);
          this.mainWindow?.webContents.send('mqtt-status', 'publish-error');
        }
      });
    } catch (error) {
      console.error('メッセージ公開中に予期せぬエラーが発生しました:', error);
    }
  }

  public publishBridgeData(data: WebSocketMessage): void {
    try {
      this.publish('bridge_data', JSON.stringify(data), 1);
    } catch (error) {
      console.error('ブリッジデータの公開中にエラーが発生しました:', error);
    }
  }

  public publishDashboardInfo(info: any): void {
    try {
      this.publish('dashboard', JSON.stringify(info), 1);
    } catch (error) {
      console.error('ダッシュボード情報の公開中にエラーが発生しました:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('mqtt-status', 'ended');
      }
    } catch (error) {
      console.error('MQTT切断処理中にエラーが発生:', error);
    } finally {
      this.cleanup();
    }
  }

  public updateMacAddress(newMacAddress: string): void {
    console.log('MACアドレスを更新します:', newMacAddress);
    
    if (this.macAddress !== newMacAddress) {
      if (this.client?.connected) {
        const oldTopics = [
          `${this.macAddress}/update`,
          `${this.macAddress}/command`,
          `${this.macAddress}/config`
        ];
        
        oldTopics.forEach(topic => {
          this.client!.unsubscribe(topic, (err) => {
            if (err) {
              console.error(`古いトピック${topic}からのunsubscribeに失敗しました:`, err);
            } else {
              console.log(`古いトピック${topic}からunsubscribeしました`);
            }
          });
        });
      }

      this.macAddress = newMacAddress;
      store.set('selectedMac', newMacAddress);

      if (this.client?.connected) {
        this.subscribeToTopics();
      }
      
      console.log('MACアドレスを更新しました:', this.macAddress);
    }
  }

  public resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }

  public getMacAddress(): string {
    return this.macAddress;
  }

  public isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  public getConnectionStatus(): string {
    if (!this.client) return 'not-initialized';
    if (this.client.connected) return 'connected';
    return 'disconnected';
  }
}

export const createMqttManager = (mainWindow: BrowserWindow): MqttManager => {
  return new MqttManager(mainWindow);
};