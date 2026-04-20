// src/services/websocketManager.ts
import WebSocket from 'ws';
import { BrowserWindow } from 'electron';
import { WebSocketMessage } from '../types';
import { MqttManager } from './mqttManager';

export class WebSocketManager {
  private connections: { [key: string]: WebSocket | null } = {
    scanTime: null,
    config: null,
    data: null
  };
  private reconnectAttempts: { [key: string]: number } = {
    scanTime: 0,
    config: 0,
    data: 0
  };
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_INTERVAL = 5000;
  private readonly MESSAGE_TIMEOUT = 5000;
  private readonly MAX_SCAN_TIME = 1000;

  private isConfigConnected = false;

  constructor(private mainWindow: BrowserWindow | null, private mqttManager: MqttManager) {}

  connectAll() {
    this.connect('scanTime', 'ws://localhost:8767/scan_time');
    this.connect('config', 'ws://localhost:8765/config');
    this.connect('data', 'ws://localhost:8766/data');
    this.updateConnectionStatus();
  }

  private safeWindowSend(channel: string, data: any) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  private updateConnectionStatus() {
    const isAllConnected = Object.values(this.connections).every(
      (conn) => conn?.readyState === WebSocket.OPEN
    );
    this.safeWindowSend('websocket-status', isAllConnected);
  }

  private connect(type: string, url: string) {
    try {
      this.connections[type] = new WebSocket(url);

      this.connections[type]!.on('open', () => this.handleOpen(type));
      this.connections[type]!.on('message', (data) => this.handleMessage(type, data));
      this.connections[type]!.on('error', (error) => this.handleError(type, error));
      this.connections[type]!.on('close', () => this.handleClose(type));
    } catch (error) {
      console.error(`Error connecting to ${type} WebSocket:`, error);
      this.handleError(type, error as Error);
    }
  }

  isConnected(type: string): boolean {
    return this.connections[type]?.readyState === WebSocket.OPEN;
  }

  private handleOpen(type: string) {
    console.log(`${type} WebSocket connection established`);
    this.reconnectAttempts[type] = 0;
    this.safeWindowSend('update-error-status', null);
    this.updateConnectionStatus();
    if (type === 'config') {
      this.isConfigConnected = true;
    }
    
    // 3つのWebSocketすべてが接続されたらブリッジスクリプトが準備完了とみなす
    const allConnected = Object.values(this.connections).every(
      (conn) => conn?.readyState === WebSocket.OPEN
    );
    if (allConnected) {
      console.log('すべてのWebSocketが接続されました - ブリッジスクリプト準備完了');
      this.safeWindowSend('script-ready', true);
    }
  }

  private handleClose(type: string) {
    console.log(`${type} WebSocket connection closed`);
    this.attemptReconnect(type);
    this.updateConnectionStatus();
  }

  private handleMessage(type: string, data: WebSocket.Data) {
    try {
      const parsedData = JSON.parse(data.toString());
      switch (type) {
        case 'scanTime':
          this.handleScanTimeMessage(parsedData);
          break;
        case 'config':
          this.handleConfigMessage(parsedData);
          break;
        case 'data':
          this.handleDataMessage(parsedData);
          break;
      }
    } catch (error) {
      console.error(`Failed to parse ${type} message:`, error);
    }
  }

  private handleScanTimeMessage(data: any) {
    if (data.scan_time) {
      const scanTime = parseFloat(data.scan_time) * 1000;
      this.safeWindowSend('update-scan-time', scanTime);
      
      if (scanTime > this.MAX_SCAN_TIME) {
        this.safeWindowSend('update-error-status', 'high-scan-time');
      } else {
        this.safeWindowSend('update-error-status', null);
      }
    }
  }

  private handleConfigMessage(data: any) {
    console.log('Received config data:', data);
    this.safeWindowSend('update-config', data);
  }

  private handleDataMessage(data: WebSocketMessage) {
    console.log('Received data:', data);
    this.safeWindowSend('update-data', data);

    // MQTTで送信（MqttManagerに委譲）
    this.mqttManager.publishBridgeData(data);
  }

  private handleError(type: string, error: Error) {
    // 最初の数回のリトライではエラーを抑制（PLC-Bridgeの起動待ち）
    if (this.reconnectAttempts[type] >= 2) {
      console.error(`${type} WebSocket error:`, error);
      this.safeWindowSend('update-error-status', 'connection-error');
    }
  }

  private attemptReconnect(type: string) {
    if (this.reconnectAttempts[type] < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts[type]++;
      // 最初の2回のリトライではログを簡潔に（PLC-Bridgeの起動待ち）
      if (this.reconnectAttempts[type] <= 2) {
        console.log(`Waiting for bridge script... (${type} WebSocket retry ${this.reconnectAttempts[type]}/${this.MAX_RECONNECT_ATTEMPTS})`);
      } else {
        console.log(`Attempting to reconnect ${type} WebSocket (${this.reconnectAttempts[type]}/${this.MAX_RECONNECT_ATTEMPTS})...`);
      }
      setTimeout(() => this.connect(type, this.getUrlByType(type)), this.RECONNECT_INTERVAL);
    } else {
      console.error(`Maximum reconnection attempts reached for ${type}`);
      this.safeWindowSend('update-error-status', 'max-reconnect-attempts');
    }
  }

  private getUrlByType(type: string): string {
    switch (type) {
      case 'scanTime':
        return 'ws://localhost:8767/scan_time';
      case 'config':
        return 'ws://localhost:8765/config';
      case 'data':
        return 'ws://localhost:8766/data';
      default:
        throw new Error(`Unknown WebSocket type: ${type}`);
    }
  }

  sendConfigWebSocket(config: any): Promise<{ status: string; message: string }> {
    return new Promise((resolve, reject) => {
      if (this.isConfigConnected && this.connections.config && this.connections.config.readyState === WebSocket.OPEN) {
        const timeoutId = setTimeout(() => {
          reject(new Error('Config WebSocket send timeout'));
        }, 5000); // 5秒のタイムアウト
  
        const handleResponse = (data: WebSocket.Data) => {
          clearTimeout(timeoutId);
          this.connections.config!.removeListener('message', handleResponse);
          try {
            const response = JSON.parse(data.toString());
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse WebSocket response'));
          }
        };
  
        this.connections.config.send(JSON.stringify(config));
        this.connections.config.once('message', handleResponse);
      } else {
        reject(new Error('Config WebSocket is not connected or not ready'));
      }
    });
  }

  closeAllConnections() {
    Object.entries(this.connections).forEach(([type, connection]) => {
      if (connection) {
        console.log(`Closing ${type} WebSocket connection`);
        connection.close();
      }
    });
  }
}

export const createWebSocketManager = (mainWindow: BrowserWindow, mqttManager: MqttManager) => {
  return new WebSocketManager(mainWindow, mqttManager);
};