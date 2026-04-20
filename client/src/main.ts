// src/main.ts
import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import electronSquirrelStartup from 'electron-squirrel-startup';
import type { Systeminformation } from 'systeminformation';
import path from 'path';
import Store from 'electron-store';
import si from 'systeminformation';
import { exec, spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import axios from 'axios';
import { createMqttManager, MqttManager } from './services/mqttManager';
import { createWebSocketManager, WebSocketManager } from './services/websocketManager';

// Webpack用のグローバル変数の型定義
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const store = new Store();

// 初期設定ファイルを読み込んでelectron-storeに適用する関数
const loadInitialSettings = (): void => {
  const userConfigDir = app.getPath('userData');
  const initialSettingsPath = path.join(userConfigDir, 'initial_settings.json');

  console.log(`初期設定ファイルをチェック中: ${initialSettingsPath}`);

  if (fs.existsSync(initialSettingsPath)) {
    try {
      console.log('初期設定ファイルが見つかりました。読み込みを開始します...');
      const fileContent = fs.readFileSync(initialSettingsPath, 'utf-8');
      const settings = JSON.parse(fileContent);

      // 設定をelectron-storeに書き込む
      Object.keys(settings).forEach((key) => {
        store.set(key, settings[key]);
        console.log(`設定を適用しました: ${key} = ${settings[key]}`);
      });

      console.log('初期設定の適用が完了しました。ファイルを削除します...');

      // 設定ファイルを削除
      fs.unlinkSync(initialSettingsPath);
      console.log('初期設定ファイルを削除しました。次回起動時には適用されません。');
    } catch (error) {
      console.error('初期設定ファイルの読み込み中にエラーが発生しました:', error);
      console.error('エラーをスキップして通常起動を続行します。');

      // エラーが発生した場合、ファイルを削除して次回の起動でも問題が起きないようにする
      try {
        if (fs.existsSync(initialSettingsPath)) {
          fs.unlinkSync(initialSettingsPath);
          console.log('エラーが発生したため、初期設定ファイルを削除しました。');
        }
      } catch (unlinkError) {
        console.error('初期設定ファイルの削除に失敗しました:', unlinkError);
      }
    }
  } else {
    console.log('初期設定ファイルが見つかりません。通常起動します。');
  }
};

// 初期設定を読み込む（electron-store初期化直後に実行）
loadInitialSettings();

let mainWindow: BrowserWindow | null = null;
let webSocketManager: WebSocketManager | null = null;
let mqttManager: MqttManager | null = null;
const lastMessageTime = Date.now();
let bridgeProcess: ChildProcess | null = null;
let bridgeRestartAttempts = 0;
const MAX_BRIDGE_RESTARTS = 5;

const MESSAGE_TIMEOUT = 5000; // 5秒
const CURSOR_HIDE_TIMEOUT = 5000; // 5秒 (カーソル非表示までの時間)

// ブリッジスクリプトを再起動するグローバル関数
const restartBridgeScript = () => {
  console.log('ブリッジスクリプトの再起動を開始します...');

  // レンダラープロセスに再起動開始を通知（エラーダイアログを閉じ、ローディングを表示）
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log('ブリッジ再起動開始イベントを送信します');
    mainWindow.webContents.send('bridge-restart-started');

    // スクリプト準備状態をリセット（レンダラープロセスの初期化シーケンスをリセット）
    console.log('script-ready状態をリセットします');
    mainWindow.webContents.send('script-ready', false);
  }

  // WebSocket接続をクローズ
  if (webSocketManager) {
    console.log('WebSocket接続をクローズします');
    webSocketManager.closeAllConnections();
  }

  // 既存のプロセスがあれば終了
  if (bridgeProcess && !bridgeProcess.killed) {
    console.log('既存のブリッジプロセスを終了します');
    bridgeProcess.kill('SIGTERM');
  }

  // 少し待ってから新しいプロセスを起動
  setTimeout(() => {
    console.log('新しいブリッジプロセスを起動します');
    bridgeRestartAttempts = 0; // リセット

    // OSとアーキテクチャに応じて適切なスクリプトパスを決定
    let bridgeFolder: string;
    let scriptName: string;

    if (process.platform === 'win32') {
      bridgeFolder = 'bridge_x64_win';
      scriptName = 'main.exe';
    } else if (process.platform === 'linux') {
      if (process.arch === 'arm64') {
        bridgeFolder = 'bridge_aarch64_linux';
      } else {
        bridgeFolder = 'bridge_x64_linux';
      }
      scriptName = 'main.bin';
    } else if (process.platform === 'darwin') {
      bridgeFolder = 'bridge_aarch64_darwin';
      scriptName = 'main.bin';
    } else {
      console.error(`サポートされていないプラットフォーム: ${process.platform}`);
      return;
    }

    const scriptPath = app.isPackaged
      ? path.join(process.resourcesPath, bridgeFolder, scriptName)
      : path.join(app.getAppPath(), 'resources', bridgeFolder, scriptName);

    console.log(`ブリッジスクリプトを実行: ${scriptPath}`);

    if (fs.existsSync(scriptPath)) {
      bridgeProcess = spawn(scriptPath);

      let webSocketConnectionStarted = false;

      const fallbackTimeout = setTimeout(() => {
        if (!webSocketConnectionStarted) {
          console.warn('⚠️ PLC-Bridgeからの起動完了メッセージを受信できませんでした。接続を試みます...');
          webSocketConnectionStarted = true;
          if (webSocketManager) {
            webSocketManager.connectAll();
          }
        }
      }, 10000);

      bridgeProcess.stdout.on('data', (data) => {
        const output = data.toString('utf8');
        console.log(`ブリッジスクリプト出力: ${output}`);

        if (!webSocketConnectionStarted && output.includes('WebSocket servers started')) {
          console.log('✅ PLC-BridgeのWebSocketサーバーが起動しました。接続を開始します...');
          webSocketConnectionStarted = true;
          clearTimeout(fallbackTimeout);

          setTimeout(() => {
            if (webSocketManager) {
              webSocketManager.connectAll();
            }
          }, 500);
        }
      });

      bridgeProcess.stderr.on('data', (data) => {
        const output = data.toString('utf8');
        console.error(`ブリッジスクリプトエラー: ${output}`);
      });

      bridgeProcess.on('error', (error) => {
        console.error(`ブリッジスクリプトの起動に失敗しました: ${error}`);
        bridgeProcess = null;
      });

      bridgeProcess.on('close', (code, signal) => {
        console.log(`ブリッジスクリプトが終了しました (終了コード: ${code}, シグナル: ${signal})`);
        bridgeProcess = null;
      });
    } else {
      console.error(`ブリッジスクリプトが見つかりません: ${scriptPath}`);
    }
  }, 2000); // 2秒待ってから再起動
};

// Windows環境でのみelectron-squirrel-startupを読み込む
const handleSquirrelEvent = () => {
  if (process.platform === 'win32') {
    try {
      return electronSquirrelStartup;
    } catch (e) {
      console.log('electron-squirrel-startup is not required on this platform');
      return false;
    }
  }
  return false;
};

const createWindow = () => {
  // ブラウザウィンドウを作成
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // メニューバーを完全に削除
  Menu.setApplicationMenu(null);

  // アプリのindex.htmlを読み込む
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // DevToolsを開く（開発時のみ）
  //mainWindow.webContents.openDevTools();

  // カーソル非表示機能の追加
  let cursorTimeout: NodeJS.Timeout | null = null;

  const resetCursorTimer = () => {
    if (cursorTimeout) {
      clearTimeout(cursorTimeout);
    }
    mainWindow?.webContents.send('show-cursor');
    cursorTimeout = setTimeout(() => {
      mainWindow?.webContents.send('hide-cursor');
    }, CURSOR_HIDE_TIMEOUT);
  };

  // ウィンドウの準備が完了してから初期化処理を実行
  mainWindow.webContents.on('did-finish-load', () => {
    // フルスクリーンモードに設定
    //if (mainWindow) {
    //  mainWindow.setFullScreen(true);
    //}

    resetCursorTimer();

    // レンダラーが完全に読み込まれてから、ブリッジとWebSocketを初期化

    // MQTT Managerを初期化
    mqttManager = createMqttManager(mainWindow!);

    // WebSocket Managerを初期化 (MQTT Managerを渡す)
    webSocketManager = createWebSocketManager(mainWindow!, mqttManager);

    // PLC-Bridgeスクリプトを起動（内部でWebSocket接続も開始される）
    runBridgeScript();

    // ダッシュボードのパブリッシュを開始
    startDashboardPublish();
  });

  // OSに応じたスクリプトを実行する関数
  const runBridgeScript = () => {
    // OSとアーキテクチャに応じて適切なスクリプトパスを決定
    let bridgeFolder: string;
    let scriptName: string;

    if (process.platform === 'win32') {
      bridgeFolder = 'bridge_x64_win';
      scriptName = 'main.exe';
    } else if (process.platform === 'linux') {
      // アーキテクチャを確認
      if (process.arch === 'arm64') {
        bridgeFolder = 'bridge_aarch64_linux';
      } else {
        bridgeFolder = 'bridge_x64_linux'; // x64 Linux用（存在する場合）
      }
      scriptName = 'main.bin';
    } else if (process.platform === 'darwin') {
      bridgeFolder = 'bridge_aarch64_darwin'; // macOS用（存在する場合）
      scriptName = 'main.bin';
    } else {
      console.error(`サポートされていないプラットフォーム: ${process.platform}`);
      mainWindow?.webContents.send('script-ready', false);
      return;
    }

    const scriptPath = app.isPackaged
      ? path.join(process.resourcesPath, bridgeFolder, scriptName)
      : path.join(app.getAppPath(), 'resources', bridgeFolder, scriptName);

    console.log(`ブリッジスクリプトを実行しようとしています: ${scriptPath} (Platform: ${process.platform}, Arch: ${process.arch})`);

    if (fs.existsSync(scriptPath)) {
      bridgeProcess = spawn(scriptPath);

      console.log('ブリッジスクリプトプロセスを起動しました。WebSocketサーバーの起動を待機中...');

      // WebSocket接続を開始したかどうかのフラグ
      let webSocketConnectionStarted = false;

      // タイムアウト: 10秒以内にWebSocketサーバーが起動しなければ強制的に接続を試みる
      const fallbackTimeout = setTimeout(() => {
        if (!webSocketConnectionStarted) {
          console.warn('⚠️ PLC-Bridgeからの起動完了メッセージを受信できませんでした。接続を試みます...');
          webSocketConnectionStarted = true;
          if (webSocketManager) {
            webSocketManager.connectAll();
          }
        }
      }, 10000); // 10秒

      bridgeProcess.stdout.on('data', (data) => {
        const output = data.toString('utf8');
        console.log(`ブリッジスクリプト出力: ${output}`);

        // "WebSocket servers started" メッセージを検出したらWebSocket接続を開始
        if (!webSocketConnectionStarted && output.includes('WebSocket servers started')) {
          console.log('✅ PLC-BridgeのWebSocketサーバーが起動しました。接続を開始します...');
          webSocketConnectionStarted = true;
          clearTimeout(fallbackTimeout); // タイムアウトをキャンセル

          // 少し待ってから接続（サーバーが完全に準備されるまで）
          setTimeout(() => {
            if (webSocketManager) {
              webSocketManager.connectAll();
            }
          }, 500); // 0.5秒待機
        }
      });

      bridgeProcess.stderr.on('data', (data) => {
        const output = data.toString('utf8');
        console.error(`ブリッジスクリプトエラー: ${output}`);
      });

      bridgeProcess.on('error', (error) => {
        console.error(`ブリッジスクリプトの起動に失敗しました: ${error}`);
        mainWindow?.webContents.send('script-ready', false);
        bridgeProcess = null;
      });

      bridgeProcess.on('close', (code, signal) => {
        console.log(`ブリッジスクリプトが終了しました (終了コード: ${code}, シグナル: ${signal})`);
        bridgeProcess = null;

        // SIGTERM, SIGINT, またはnull(正常終了)の場合は正常終了
        if (code === 0 || code === null || signal === 'SIGTERM' || signal === 'SIGINT') {
          console.log('ブリッジスクリプトが正常に終了しました');
          bridgeRestartAttempts = 0; // 正常に終了したらリセット
        } else {
          // 異常終了の場合のみ再起動を試みる
          mainWindow?.webContents.send('script-ready', false);
          if (bridgeRestartAttempts < MAX_BRIDGE_RESTARTS) {
            bridgeRestartAttempts++;
            console.log(`ブリッジスクリプトが異常終了したため再起動を試みます (試行回数: ${bridgeRestartAttempts})`);
            setTimeout(runBridgeScript, 3000); // 3秒後に再起動
          } else {
            console.error('ブリッジスクリプトの再起動試行回数の上限に達しました');
          }
        }
      });
    } else {
      console.error(`ブリッジスクリプトが見つかりません: ${scriptPath}`);
      mainWindow?.webContents.send('script-ready', false);
    }
  };
};

// ダッシュボード情報をパブリッシュする関数
const publishDashboardInfo = () => {
  if (mainWindow) {
    mainWindow.webContents.send('request-dashboard-info');
  }
};

// ダッシュボード情報のパブリッシュを開始する関数
const startDashboardPublish = () => {
  setInterval(publishDashboardInfo, 10000); // 10秒ごとに実行
};

// すべてのMACアドレスを取得する新しい関数
async function getAllMacAddresses(): Promise<Systeminformation.NetworkInterfacesData[]> {
  try {
    const networkInterfaces = await si.networkInterfaces();
    return Array.isArray(networkInterfaces)
      ? networkInterfaces
      : Object.values(networkInterfaces);
  } catch (error) {
    console.error('MACアドレスの取得エラー:', error);
    return [];
  }
}

// サーバーIPへの到達に使用されるネットワークインターフェースのMACアドレスを取得する関数
async function getRouteToServer(serverIP: string): Promise<string | null> {
  try {
    if (process.platform === 'win32') {
      // Windows: PowerShellでルートを取得し、対応するMACアドレスを直接取得
      return new Promise((resolve) => {
        // Find-NetRouteでインターフェースインデックスを取得し、Get-NetAdapterでMACアドレスを取得
        const psCommand = `powershell -Command "try { $route = Find-NetRoute -RemoteIPAddress '${serverIP}' -ErrorAction Stop; $adapter = Get-NetAdapter -InterfaceIndex $route.InterfaceIndex -ErrorAction Stop; Write-Output $adapter.MacAddress } catch { Write-Output 'ERROR' }"`;

        exec(psCommand, (error: any, stdout: string) => {
          if (error) {
            console.error('Windows PowerShellルート取得エラー:', error);
            resolve(null);
            return;
          }

          // 最初の行のみを取得（複数行の出力に対応）
          const lines = stdout.trim().split('\n');
          let macAddress = lines[0].trim();

          if (macAddress && macAddress !== 'ERROR' && macAddress !== '') {
            // WindowsのMACアドレス形式（AA-BB-CC-DD-EE-FF）をLinux形式（aa:bb:cc:dd:ee:ff）に変換
            macAddress = macAddress.replace(/-/g, ':').toLowerCase();
            console.log(`サーバー ${serverIP} への到達に使用されるMACアドレス: ${macAddress}`);
            resolve(macAddress);
          } else {
            console.warn('WindowsルートテーブルからMACアドレスを特定できませんでした');
            resolve(null);
          }
        });
      });
    } else if (process.platform === 'linux') {
      // Linux: ip addrコマンドでサーバーへのルートに使用されるインターフェースのMACアドレスを取得
      return new Promise((resolve) => {
        // まずip route getでインターフェース名を取得
        exec(`ip route get ${serverIP}`, (error: any, stdout: string) => {
          if (error) {
            console.error('Linuxルート取得エラー:', error);
            resolve(null);
            return;
          }

          // 出力例: "192.168.1.100 via 192.168.1.1 dev wlan0 src 192.168.1.50 uid 1000"
          const match = stdout.match(/dev\s+(\S+)/);
          if (match && match[1]) {
            const interfaceName = match[1];
            console.log(`サーバー ${serverIP} への到達に使用されるインターフェース: ${interfaceName}`);

            // ip addr showでインターフェースのMACアドレスを取得（より標準的な方法）
            exec(`ip addr show ${interfaceName}`, (macError: any, macStdout: string) => {
              if (macError) {
                console.error(`MACアドレス取得エラー (${interfaceName}):`, macError);
                resolve(null);
                return;
              }

              // 出力例から "link/ether aa:bb:cc:dd:ee:ff" を抽出
              const macMatch = macStdout.match(/link\/ether\s+([0-9a-f:]+)/i);
              if (macMatch && macMatch[1]) {
                const macAddress = macMatch[1].toLowerCase();
                console.log(`${interfaceName} のMACアドレス: ${macAddress}`);
                resolve(macAddress);
              } else {
                console.warn(`${interfaceName} のMACアドレスを抽出できませんでした`);
                resolve(null);
              }
            });
          } else {
            console.warn('Linuxルートから"dev"を特定できませんでした');
            resolve(null);
          }
        });
      });
    } else if (process.platform === 'darwin') {
      // macOS: route getでインターフェース名を取得し、ifconfigでMACアドレスを取得
      return new Promise((resolve) => {
        exec(`route -n get ${serverIP}`, (error: any, stdout: string) => {
          if (error) {
            console.error('macOSルート取得エラー:', error);
            resolve(null);
            return;
          }

          // 出力例から "interface: en0" を抽出
          const match = stdout.match(/interface:\s+(\S+)/);
          if (match && match[1]) {
            const interfaceName = match[1];
            console.log(`サーバー ${serverIP} への到達に使用されるインターフェース: ${interfaceName}`);

            // ifconfigでMACアドレスを取得
            exec(`ifconfig ${interfaceName} | grep ether`, (macError: any, macStdout: string) => {
              if (macError) {
                console.error(`MACアドレス取得エラー (${interfaceName}):`, macError);
                resolve(null);
                return;
              }

              // 出力例: "	ether aa:bb:cc:dd:ee:ff"
              const macMatch = macStdout.match(/ether\s+([0-9a-f:]+)/i);
              if (macMatch && macMatch[1]) {
                const macAddress = macMatch[1].toLowerCase();
                console.log(`${interfaceName} のMACアドレス: ${macAddress}`);
                resolve(macAddress);
              } else {
                console.warn(`${interfaceName} のMACアドレスを抽出できませんでした`);
                resolve(null);
              }
            });
          } else {
            console.warn('macOSルートから"interface"を特定できませんでした');
            resolve(null);
          }
        });
      });
    } else {
      console.error(`サポートされていないプラットフォーム: ${process.platform}`);
      return null;
    }
  } catch (error) {
    console.error('ルート取得エラー:', error);
    return null;
  }
}

// CIDR表記からサブネットマスクに変換するヘルパー関数
function cidrToSubnetMask(prefixLength: number): string {
  const mask = [];
  for (let i = 0; i < 4; i++) {
    const n = Math.min(prefixLength, 8);
    mask.push(256 - Math.pow(2, 8 - n));
    prefixLength -= n;
  }
  return mask.join('.');
}

// サブネットマスクからCIDR表記に変換するヘルパー関数
function subnetMaskToCidr(subnetMask: string): number {
  const octets = subnetMask.split('.').map(Number);
  let cidr = 0;
  for (const octet of octets) {
    const binary = octet.toString(2);
    cidr += binary.split('1').length - 1;
  }
  return cidr;
}

// ネットワークアダプタ一覧を取得する関数
async function getNetworkAdapters(): Promise<any[]> {
  if (process.platform === 'linux') {
    // Linux: nmcli を使用してネットワークデバイス一覧を取得（すべてのアダプタ）
    return new Promise((resolve) => {
      exec('sudo nmcli device status', (error: any, stdout: string) => {
        if (error) {
          console.error('Linux nmcli device status エラー:', error);
          resolve([]);
          return;
        }

        const lines = stdout.trim().split('\n').slice(1); // ヘッダー行をスキップ
        const adapters = lines.map(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3) {
            const name = parts[0];
            const deviceType = parts[1];
            const state = parts[2];

            // loopbackは除外
            if (name === 'lo') {
              return null;
            }

            // タイプを判定
            const type = deviceType === 'wifi' ? 'wireless' : 'wired';

            // すべてのアダプタを含める（接続状態に関わらず）
            return {
              name,
              type,
              isUp: state === 'connected',
              state: state  // 状態を保持（connected, disconnected, unavailable等）
            };
          }
          return null;
        }).filter(Boolean);

        // 各アダプタの詳細情報（MAC、IP、サブネット、ゲートウェイ、DHCP、SSID）を取得
        Promise.all(adapters.map(async (adapter: any) => {
          return new Promise((res) => {
            exec(`sudo nmcli -t -f GENERAL.HWADDR,IP4.ADDRESS,IP4.GATEWAY device show ${adapter.name}`, (err: any, out: string) => {
              if (!err) {
                const lines = out.split('\n');
                const macLine = lines.find((l: string) => l.startsWith('GENERAL.HWADDR:'));
                const ipLine = lines.find((l: string) => l.startsWith('IP4.ADDRESS'));
                const gwLine = lines.find((l: string) => l.startsWith('IP4.GATEWAY:'));

                if (macLine) {
                  adapter.mac = macLine.split(':').slice(1).join(':').trim().toLowerCase();
                }
                if (ipLine) {
                  const ipWithCidr = ipLine.split(':')[1].trim();
                  const [ip, cidr] = ipWithCidr.split('/');
                  adapter.currentIP = ip;
                  if (cidr) {
                    adapter.prefixLength = parseInt(cidr);
                    adapter.subnetMask = cidrToSubnetMask(parseInt(cidr));
                  }
                }
                if (gwLine) {
                  adapter.gateway = gwLine.split(':')[1].trim();
                }
              }

              // DHCP判定とSSID取得（無線の場合）
              // まず接続名を取得
              exec(`sudo nmcli -t -f GENERAL.CONNECTION device show ${adapter.name} | grep '^GENERAL.CONNECTION:'`, (connNameErr: any, connNameOut: string) => {
                if (!connNameErr && connNameOut) {
                  const connectionName = connNameOut.split(':')[1].trim();

                  // 接続名を引用符で囲んで安全に使用
                  exec(`sudo nmcli -t -f ipv4.method,802-11-wireless.ssid connection show id "${connectionName}"`, (connErr: any, connOut: string) => {
                    if (!connErr && connOut) {
                      const connLines = connOut.split('\n');
                      const methodLine = connLines.find((l: string) => l.startsWith('ipv4.method:'));
                      const ssidLine = connLines.find((l: string) => l.startsWith('802-11-wireless.ssid:'));

                      if (methodLine) {
                        const method = methodLine.split(':')[1].trim();
                        adapter.isDHCP = method === 'auto';
                      }

                      if (ssidLine && adapter.type === 'wireless') {
                        adapter.ssid = ssidLine.split(':')[1].trim();
                      }
                    }
                    res(adapter);
                  });
                } else {
                  // 接続名の取得に失敗した場合もresolve
                  res(adapter);
                }
              });
            });
          });
        })).then(resolve);
      });
    });
  } else if (process.platform === 'win32') {
    // Windows: PowerShell Get-NetAdapter を使用（すべてのアダプタ）
    return new Promise((resolve) => {
      // UTF-8エンコーディングを明示的に指定し、すべてのアダプタを取得
      const psCommand = `powershell -NoProfile -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-NetAdapter | Select-Object Name, InterfaceDescription, MacAddress, Status | ConvertTo-Json"`;

      exec(psCommand, { encoding: 'utf8' }, (error: any, stdout: string) => {
        if (error) {
          console.error('Windows Get-NetAdapter エラー:', error);
          resolve([]);
          return;
        }

        try {
          let adaptersData = JSON.parse(stdout);
          if (!Array.isArray(adaptersData)) {
            adaptersData = [adaptersData];
          }

          const adapters = adaptersData.map((adapter: any) => {
            const isWireless = adapter.InterfaceDescription &&
                             (adapter.InterfaceDescription.toLowerCase().includes('wireless') ||
                              adapter.InterfaceDescription.toLowerCase().includes('wi-fi') ||
                              adapter.InterfaceDescription.toLowerCase().includes('wifi'));

            return {
              name: adapter.Name,
              type: isWireless ? 'wireless' : 'wired',
              mac: adapter.MacAddress ? adapter.MacAddress.replace(/-/g, ':').toLowerCase() : '',
              isUp: adapter.Status === 'Up',
              state: adapter.Status  // 状態を保持（Up, Down, Disabled等）
            };
          });

          // 各アダプタのIPアドレス、サブネットマスク、ゲートウェイ、DHCP、SSIDを取得
          Promise.all(adapters.map(async (adapter: any) => {
            return new Promise((res) => {
              const ipConfigCommand = `powershell -NoProfile -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $ip = Get-NetIPAddress -InterfaceAlias '${adapter.name}' -AddressFamily IPv4 -ErrorAction SilentlyContinue; $gw = Get-NetRoute -InterfaceAlias '${adapter.name}' -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue; $dhcp = Get-NetIPInterface -InterfaceAlias '${adapter.name}' -AddressFamily IPv4 -ErrorAction SilentlyContinue; $result = @{}; if ($ip) { $result.ip = $ip.IPAddress; $result.prefix = $ip.PrefixLength }; if ($gw) { $result.gateway = $gw.NextHop }; if ($dhcp) { $result.dhcp = $dhcp.Dhcp }; $result | ConvertTo-Json"`;

              exec(ipConfigCommand, { encoding: 'utf8' }, (err: any, out: string) => {
                if (!err && out.trim()) {
                  try {
                    const ipConfig = JSON.parse(out);
                    if (ipConfig.ip) {
                      adapter.currentIP = ipConfig.ip;
                    }
                    if (ipConfig.prefix) {
                      // CIDR表記からサブネットマスクに変換
                      adapter.prefixLength = ipConfig.prefix;
                      adapter.subnetMask = cidrToSubnetMask(ipConfig.prefix);
                    }
                    if (ipConfig.gateway && ipConfig.gateway !== '0.0.0.0') {
                      adapter.gateway = ipConfig.gateway;
                    }
                    if (ipConfig.dhcp !== undefined) {
                      // Windows: 1 = Enabled (DHCP有効), 2 = Disabled (固定IP)
                      adapter.isDHCP = ipConfig.dhcp === 1 || ipConfig.dhcp === 'Enabled';
                    }
                  } catch (parseErr) {
                    console.error('IP設定のパースエラー:', parseErr);
                  }
                }

                // 無線の場合、SSID取得
                if (adapter.type === 'wireless') {
                  const ssidCommand = `powershell -NoProfile -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; (netsh wlan show interfaces) -match 'SSID' -notmatch 'BSSID' | ForEach-Object { ($_ -split ':')[1].Trim() }"`;

                  exec(ssidCommand, { encoding: 'utf8' }, (ssidErr: any, ssidOut: string) => {
                    if (!ssidErr && ssidOut.trim()) {
                      adapter.ssid = ssidOut.trim().split('\n')[0].trim();
                    }
                    res(adapter);
                  });
                } else {
                  res(adapter);
                }
              });
            });
          })).then(resolve);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          resolve([]);
        }
      });
    });
  } else {
    console.error(`サポートされていないプラットフォーム: ${process.platform}`);
    return [];
  }
}

// ネットワーク設定を適用する関数
async function applyNetworkSettings(settings: any): Promise<{ success: boolean; message: string }> {
  console.log('ネットワーク設定を適用中:', settings);

  if (process.platform === 'linux') {
    // Linux: nmcli を使用
    return new Promise((resolve) => {
      if (settings.type === 'wireless' && settings.ssid) {
        // WiFi接続の場合
        let command = `sudo nmcli device wifi connect "${settings.ssid}"`;
        if (settings.wifiPassword) {
          command += ` password "${settings.wifiPassword}"`;
        }

        // WiFi接続後にIP設定を適用
        exec(command, (error: any, stdout: string) => {
          if (error) {
            console.error('Linux WiFi接続エラー:', error);
            resolve({ success: false, message: `WiFi接続に失敗しました: ${error.message}` });
            return;
          }

          console.log('WiFi接続成功:', stdout);

          // WiFi接続成功後、IP設定を適用
          if (!settings.useDHCP) {
            applyLinuxIPSettings(settings).then(resolve);
          } else {
            exec(`sudo nmcli connection modify "${settings.ssid}" ipv4.method auto`, (err: any) => {
              if (err) {
                resolve({ success: false, message: `DHCP設定に失敗しました: ${err.message}` });
              } else {
                exec(`sudo nmcli connection up "${settings.ssid}"`, (upErr: any) => {
                  if (upErr) {
                    resolve({ success: false, message: `接続の再確立に失敗しました: ${upErr.message}` });
                  } else {
                    resolve({ success: true, message: 'WiFi接続とDHCP設定が完了しました' });
                  }
                });
              }
            });
          }
        });
      } else {
        // 有線接続の場合、またはSSIDなしの場合
        applyLinuxIPSettings(settings).then(resolve);
      }
    });
  } else if (process.platform === 'win32') {
    // Windows: netsh を使用
    return new Promise((resolve) => {
      if (settings.type === 'wireless' && settings.ssid) {
        // WiFi接続
        const command = `netsh wlan connect name="${settings.ssid}"`;

        exec(command, (error: any, stdout: string) => {
          if (error) {
            console.error('Windows WiFi接続エラー:', error);
            resolve({ success: false, message: `WiFi接続に失敗しました: ${error.message}` });
            return;
          }

          console.log('WiFi接続成功:', stdout);

          // IP設定を適用
          setTimeout(() => {
            applyWindowsIPSettings(settings).then(resolve);
          }, 2000); // WiFi接続完了を待つ
        });
      } else {
        // 有線接続の場合
        applyWindowsIPSettings(settings).then(resolve);
      }
    });
  } else {
    return { success: false, message: `サポートされていないプラットフォーム: ${process.platform}` };
  }
}

// Linux IP設定適用のヘルパー関数
async function applyLinuxIPSettings(settings: any): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    // まず、デバイスの実際の接続名を取得
    exec(`sudo nmcli -t -f GENERAL.CONNECTION device show ${settings.adapterName} | grep '^GENERAL.CONNECTION:'`, (connNameErr: any, connNameOut: string) => {
      if (connNameErr || !connNameOut) {
        resolve({ success: false, message: `接続名の取得に失敗しました: ${connNameErr?.message || '接続が見つかりません'}` });
        return;
      }

      const connectionName = connNameOut.split(':')[1].trim();
      console.log(`取得した接続名: ${connectionName}`);

      if (settings.useDHCP) {
        // DHCP設定
        exec(`sudo nmcli connection modify "${connectionName}" ipv4.method auto`, (error: any) => {
          if (error) {
            resolve({ success: false, message: `DHCP設定に失敗しました: ${error.message}` });
          } else {
            exec(`sudo nmcli connection up "${connectionName}"`, (upError: any) => {
              if (upError) {
                resolve({ success: false, message: `接続の再確立に失敗しました: ${upError.message}` });
              } else {
                resolve({ success: true, message: 'DHCP設定が完了しました' });
              }
            });
          }
        });
      } else {
        // 手動IP設定
        // サブネットマスクをCIDRに変換
        const cidr = subnetMaskToCidr(settings.subnetMask);
        const ipWithMask = `${settings.ipAddress}/${cidr}`;
        let command = `sudo nmcli connection modify "${connectionName}" ipv4.method manual ipv4.addresses "${ipWithMask}"`;

        if (settings.gateway) {
          command += ` ipv4.gateway "${settings.gateway}"`;
        }

        console.log(`実行するコマンド: ${command}`);

        exec(command, (error: any) => {
          if (error) {
            console.error('Linux IP設定エラー:', error);
            resolve({ success: false, message: `IP設定に失敗しました: ${error.message}` });
          } else {
            exec(`sudo nmcli connection up "${connectionName}"`, (upError: any) => {
              if (upError) {
                resolve({ success: false, message: `接続の再確立に失敗しました: ${upError.message}` });
              } else {
                resolve({ success: true, message: 'IP設定が完了しました' });
              }
            });
          }
        });
      }
    });
  });
}

// Windows IP設定適用のヘルパー関数
async function applyWindowsIPSettings(settings: any): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    if (settings.useDHCP) {
      // DHCP設定
      exec(`netsh interface ip set address "${settings.adapterName}" dhcp`, (error: any) => {
        if (error) {
          resolve({ success: false, message: `DHCP設定に失敗しました: ${error.message}` });
        } else {
          resolve({ success: true, message: 'DHCP設定が完了しました' });
        }
      });
    } else {
      // 手動IP設定
      let command = `netsh interface ip set address "${settings.adapterName}" static ${settings.ipAddress} ${settings.subnetMask}`;

      if (settings.gateway) {
        command += ` ${settings.gateway}`;
      }

      exec(command, (error: any) => {
        if (error) {
          console.error('Windows IP設定エラー:', error);
          resolve({ success: false, message: `IP設定に失敗しました: ${error.message}` });
        } else {
          resolve({ success: true, message: 'IP設定が完了しました' });
        }
      });
    }
  });
}

// IPC handlers for network configuration
ipcMain.handle('get-network-adapters', async (): Promise<any[]> => {
  return await getNetworkAdapters();
});

ipcMain.handle('apply-network-settings', async (_, settings: any): Promise<{ success: boolean; message: string }> => {
  const result = await applyNetworkSettings(settings);

  // 設定が成功した場合、ブリッジスクリプトを再起動
  if (result.success) {
    console.log('ネットワーク設定が成功しました。ブリッジスクリプトを再起動します...');
    setTimeout(() => {
      restartBridgeScript();
    }, 2000); // 2秒待ってから再起動（ネットワーク設定が完全に適用されるのを待つ）
  }

  return result;
});

// ブリッジスクリプト再起動用のIPCハンドラ
ipcMain.handle('restart-bridge-script', async () => {
  restartBridgeScript();
  return { success: true };
});

// 既存のMACアドレス取得ハンドラを更新
ipcMain.handle('get-mac-address', async (): Promise<string> => {
  try {
    const networkInterfaces = await si.networkInterfaces();
    const interfaces: Systeminformation.NetworkInterfacesData[] = Array.isArray(networkInterfaces)
      ? networkInterfaces
      : Object.values(networkInterfaces);
    const mainInterface = interfaces.find(iface => (iface as any).default);
    return mainInterface?.mac || 'MACアドレスが見つかりません';
  } catch (error) {
    console.error('MACアドレスの取得エラー:', error);
    return 'MACアドレスの取得エラー';
  }
});

// すべてのMACアドレスを取得する新しいハンドラ
ipcMain.handle('get-all-mac-addresses', getAllMacAddresses);

// サーバーへのルートを取得する新しいハンドラ
ipcMain.handle('get-route-to-server', async (_, serverIP: string): Promise<string | null> => {
  return await getRouteToServer(serverIP);
});

//
ipcMain.on('reset-cursor-timer', () => {
  if (mainWindow) {
    mainWindow.webContents.send('show-cursor');
    setTimeout(() => {
      mainWindow?.webContents.send('hide-cursor');
    }, CURSOR_HIDE_TIMEOUT);
  }
});

// ElectronStore用のIPCハンドラを追加
ipcMain.handle('electron-store-get', async (_, key: string): Promise<any> => {
  const value = store.get(key);
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }
  return value;
});

ipcMain.handle('electron-store-set', async (_, key: string, value: any): Promise<void> => {
  if (value === undefined || value === null) {
    store.delete(key);
  } else if (typeof value === 'object') {
    store.set(key, JSON.stringify(value));
  } else {
    store.set(key, value);
  }
});

// Scan Time取得用のIPCハンドラ
ipcMain.handle('get-scan-time', () => {
  return new Promise((resolve) => {
    mainWindow?.webContents.send('request-scan-time');
    ipcMain.once('scan-time-response', (_, scanTime) => {
      resolve(scanTime);
    });
  });
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// エラーステータス取得用の新しいIPCハンドラ
ipcMain.handle('get-error-status', () => {
  if (!webSocketManager || !webSocketManager.isConnected('scanTime')) {
    return 'connection-error';
  }
  if (Date.now() - lastMessageTime > MESSAGE_TIMEOUT) {
    return 'message-timeout';
  }
  return null;
});

ipcMain.handle('send-config-websocket', async (_, config: any) => {
  if (webSocketManager) {
    return await webSocketManager.sendConfigWebSocket(config);
  } else {
    throw new Error('WebSocket managerが初期化されていません');
  }
});

ipcMain.handle('check-server-health', async (_, serverAddress: string, serverPort: string): Promise<boolean> => {
  const apiClient = axios.create({
    baseURL: `http://${serverAddress}:${serverPort}`,
    timeout: 5000,
  });

  try {
    const response = await apiClient.get('/');
    console.log(`✅ サーバーヘルスチェック成功: ${serverAddress}:${serverPort}`, response.status);
    return true;
  } catch (error: any) {
    console.log(`❌ サーバーヘルスチェック失敗: ${serverAddress}:${serverPort}`, {
      code: error.code,
      message: error.message,
    });
    return false;
  }
});

// 汎用HTTP APIプロキシ
// レンダラープロセスからのHTTPリクエストをメインプロセス経由で実行
ipcMain.handle('http-request', async (_, config: {
  method: 'get' | 'post' | 'put' | 'delete';
  url: string;
  baseURL: string;
  data?: any;
  headers?: any;
  timeout?: number;
}): Promise<{ data: any; status: number; statusText: string } | { error: any }> => {
  const apiClient = axios.create({
    baseURL: config.baseURL,
    headers: config.headers || { 'Content-Type': 'application/json' },
    timeout: config.timeout || 10000,
  });

  try {
    const response = await apiClient.request({
      method: config.method,
      url: config.url,
      data: config.data,
    });

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error: any) {
    console.error(`❌ HTTP Request Error [${config.method.toUpperCase()} ${config.url}]:`, error.message);
    return {
      error: {
        code: error.code,
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : null,
      },
    };
  }
});

ipcMain.handle('update-mqtt-manager-mac', async (_, macAddress: string) => {
  if (mqttManager) {
    mqttManager.updateMacAddress(macAddress);
  } else {
    console.error('MQTT managerが初期化されていません');
  }
});

// MqttManagerの初期化を関数化
const initializeMqttManager = () => {
  if (mainWindow && mqttManager) {
    const mqttBrokerIP = store.get('mqttBrokerIP') as string;
    const mqttBrokerPort = store.get('mqttBrokerPort') as string;
    const macAddress = store.get('selectedMac') as string;
    if (mqttBrokerIP && mqttBrokerPort && macAddress) {
      const brokerUrl = `mqtt://${mqttBrokerIP}:${mqttBrokerPort}`;
      console.log(`MQTT接続を初期化しています: ${brokerUrl}`);
      mqttManager.connect(brokerUrl);
      mqttManager.updateMacAddress(macAddress);
    } else {
      console.error('MQTT設定が不完全です');
    }
  } else {
    console.error('メインウィンドウまたはMQTT managerが初期化されていません');
  }
};

// MQTT再接続のためのIPC handler
ipcMain.handle('reconnect-mqtt', () => {
  if (mqttManager) {
    mqttManager.disconnect();
    mqttManager.resetReconnectAttempts(); // リトライ回数をリセット
    const mqttBrokerIP = store.get('mqttBrokerIP') as string;
    const mqttBrokerPort = store.get('mqttBrokerPort') as string;
    if (mqttBrokerIP && mqttBrokerPort) {
      // 余分な引用符を削除
      const cleanIP = mqttBrokerIP.replace(/"/g, '');
      const cleanPort = mqttBrokerPort.replace(/"/g, '');
      const brokerUrl = `mqtt://${cleanIP}:${cleanPort}`;
      console.log(`MQTTに再接続しています: ${brokerUrl}`);
      mqttManager.connect(brokerUrl);
      return { success: true };
    } else {
      console.error('MQTTブローカー設定が見つかりません');
      return { success: false, error: 'MQTTブローカー設定が見つかりません' };
    }
  } else {
    console.error('MQTT managerが初期化されていません');
    return { success: false, error: 'MQTT managerが初期化されていません' };
  }
});

// MQTT publish用のIPC handler
ipcMain.handle('mqtt-publish', (_, topic: string, message: string, qos: 0 | 1 | 2) => {
  if (mqttManager) {
    mqttManager.publish(topic, message, qos);
    return { success: true };
  } else {
    return { success: false, error: 'MQTT managerが初期化されていません' };
  }
});

// ダッシュボード情報をパブリッシュするためのIPC handler
ipcMain.on('publish-dashboard-info', (_, dashboardInfo) => {
  if (mqttManager) {
    mqttManager.publishDashboardInfo(dashboardInfo);
  }
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (handleSquirrelEvent()) {
  app.quit();
}

// Electronの初期化が完了し、ブラウザウィンドウの作成準備ができたときに
// このメソッドが呼ばれます。一部のAPIはこのイベントの後でのみ使用できます。
app.on('ready', () => {
  createWindow();
});

// 修正: すべてのウィンドウが閉じられたときの処理
app.on('window-all-closed', () => {
  mainWindow = null;
  // ブリッジプロセスが実行中なら終了させる
  if (bridgeProcess) {
    bridgeProcess.kill();
    bridgeProcess = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// リソースのクリーンアップを行う非同期関数
async function cleanupResources(): Promise<void> {
  console.log('クリーンアップ処理を開始します...');

  // 子プロセス（bridgeProcess）のクリーンアップ処理
  if (bridgeProcess) {
    console.log('Bridge process の終了処理を開始します...');
    try {
      // プロセスが既に終了している可能性を考慮
      if (!bridgeProcess.killed) {
        // 優雅に終了を促すために SIGTERM を送信
        bridgeProcess.kill('SIGTERM');

        await new Promise<void>((resolve) => {
          let settled = false;
          const timeout = setTimeout(() => {
            if (!settled && bridgeProcess && !bridgeProcess.killed) {
              console.log('Bridge process がタイムアウトしたため、強制終了します');
              bridgeProcess.kill('SIGKILL');
            }
            settled = true;
            bridgeProcess = null;
            resolve();
          }, 5000);

          bridgeProcess?.once('exit', () => {
            if (!settled) {
              clearTimeout(timeout);
              settled = true;
              bridgeProcess = null;
              resolve();
            }
          });
        });
      } else {
        console.log('Bridge process は既に終了しています');
        bridgeProcess = null;
      }
    } catch (error) {
      console.error('Bridge process の終了処理でエラーが発生:', error);
      bridgeProcess = null;
    }
  }

  // WebSocket の接続をクローズ
  if (webSocketManager) {
    try {
      console.log('WebSocketManager のコネクションをクローズします');
      webSocketManager.closeAllConnections();
      webSocketManager = null;
    } catch (error) {
      console.error('WebSocketManager のクローズでエラーが発生:', error);
    }
  }

  // MQTT の接続を切断
  if (mqttManager) {
    try {
      console.log('MQTTManager の接続を切断します');
      await mqttManager.disconnect();
      mqttManager = null;
    } catch (error) {
      console.error('MQTTManager の切断でエラーが発生:', error);
    }
  }

  console.log('クリーンアップ処理が完了しました');
}

// IPCハンドラ "quit-app" でクリーンアップ後にアプリ終了
ipcMain.handle('quit-app', async () => {
  console.log('quit-app リクエストを受信しました');
  await cleanupResources();
  app.quit();
});

// アプリ終了前のイベントでのクリーンアップ（通常の終了操作の場合はこちらでも）
let isCleaningUp = false;
app.on('before-quit', async (event) => {
  if (!isCleaningUp) {
    isCleaningUp = true;
    event.preventDefault();
    console.log('before-quit イベントを受信しました');
    await cleanupResources();
    app.exit(0);
  }
});

app.on('activate', () => {
  // macOSでは、ドックアイコンがクリックされ、他のウィンドウが開いていない時に
  // アプリケーションでウィンドウを再作成するのが一般的です。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// このファイルでは、アプリケーションに固有の追加のメインプロセスコードを
// 含めることができます。別のファイルに入れてここでrequireすることもできます。

process.on('SIGINT', async () => {
  console.log('SIGINT を受信しました。クリーンアップを実行します。');
  isCleaningUp = true;
  await cleanupResources();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM を受信しました。クリーンアップを実行します。');
  isCleaningUp = true;
  await cleanupResources();
  process.exit(0);
});
