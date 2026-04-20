# RTMS Client

Real-Time Manufacturing System (RTMS) のクライアントアプリケーション。Electron + Reactで構築された製造現場向けのリアルタイムモニタリングシステムです。

## 概要

このアプリケーションは、PLC（Programmable Logic Controller）からのデータを収集し、製造現場のリアルタイムな生産状況をモニタリングします。WebSocket通信でPLC-Bridgeと接続し、MQTTプロトコルでサーバーとデータを送受信します。

## 主な機能

- **リアルタイムデータ監視**: PLCからのスキャンタイムや生産データをリアルタイムで表示
- **デバイス管理**: 自動的にネットワークアダプターを検出し、最適な接続を確立
- **生産管理**:
  - 日次・月次の生産実績計算
  - 稼働率の算出
  - タイムテーブル管理
- **ユーザー管理**: アクティブユーザーの追跡
- **データ同期**: MQTTブローカー経由でサーバーとリアルタイム同期
- **設定管理**: デバイス設定、サーバー設定、MQTT設定の永続化

## 技術スタック

- **フレームワーク**: Electron v31.0.0
- **UI**: React v18.3.1 + TypeScript
- **ビルドツール**: Webpack 5 + electron-forge
- **状態管理**: React Hooks
- **通信**:
  - WebSocket (ws)
  - MQTT (mqtt.js)
  - Axios (HTTP通信)
- **スタイリング**: CSS Modules
- **データ永続化**: electron-store

## システムアーキテクチャ

```
┌─────────────────────────────────────────┐
│         RTMS Client (Electron)          │
│  ┌───────────────────────────────────┐  │
│  │   Renderer Process (React)        │  │
│  │  - UI Components                  │  │
│  │  - State Management               │  │
│  │  - Data Visualization             │  │
│  └───────────────────────────────────┘  │
│              ↕ IPC                      │
│  ┌───────────────────────────────────┐  │
│  │   Main Process (Node.js)          │  │
│  │  - WebSocket Manager              │  │
│  │  - MQTT Manager                   │  │
│  │  - PLC-Bridge Process Manager     │  │
│  │  - HTTP Proxy                     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         ↕ WebSocket            ↕ MQTT
┌──────────────────┐    ┌──────────────────┐
│   PLC-Bridge     │    │   MQTT Broker    │
│   (Python)       │    │   + HTTP Server  │
│  - Port 8765     │    │                  │
│  - Port 8766     │    │                  │
│  - Port 8767     │    │                  │
└──────────────────┘    └──────────────────┘
         ↕
    ┌────────┐
    │  PLC   │
    └────────┘
```

## プロジェクト構成

```
rtms-client/
├── src/
│   ├── main.ts                 # Electronメインプロセス
│   ├── preload.ts              # IPC通信用Preloadスクリプト
│   ├── renderer.tsx            # Reactエントリーポイント
│   ├── App.tsx                 # メインアプリケーションコンポーネント
│   ├── components/             # Reactコンポーネント
│   │   ├── ConnectionErrorDialog.tsx
│   │   ├── DashboardView.tsx
│   │   ├── ErrorDialog.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── SettingsView.tsx
│   ├── contexts/               # Reactコンテキスト
│   │   └── ScriptContext.tsx
│   ├── hooks/                  # カスタムフック
│   │   ├── useDeviceSetup.ts
│   │   ├── useProductionCalculations.ts
│   │   └── useWebSocket.ts
│   ├── services/               # サービスレイヤー
│   │   ├── api.ts              # HTTP API通信
│   │   ├── mqttManager.ts      # MQTT通信管理
│   │   └── websocketManager.ts # WebSocket通信管理
│   ├── types/                  # TypeScript型定義
│   │   └── index.ts
│   └── styles/                 # CSSスタイル
├── resources/                  # リソースファイル
│   ├── bridge_x64_win/         # PLC-Bridge (Windows x64)
│   ├── bridge_x64_linux/       # PLC-Bridge (Linux x64)
│   ├── bridge_aarch64_linux/   # PLC-Bridge (Linux ARM64)
│   └── bridge_aarch64_darwin/  # PLC-Bridge (macOS ARM64)
├── forge.config.ts             # Electron Forge設定
├── webpack.main.config.ts      # Webpackメインプロセス設定
├── webpack.renderer.config.ts  # Webpackレンダラープロセス設定
├── webpack.plugins.ts          # Webpackプラグイン
└── package.json
```

## 前提条件

- Node.js 18.x 以降
- npm 9.x 以降
- Python 3.8+ (PLC-Bridge開発用)
- MQTT Broker (例: Mosquitto)
- RTMS HTTPサーバー

## インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd rtms-client

# 依存関係をインストール
npm install
```

## 開発

### 開発モードで起動

```bash
npm start
```

このコマンドは：
1. Webpackでメインプロセスとレンダラープロセスをビルド
2. Electronアプリを起動
3. ホットリロードを有効化（レンダラープロセス）

### コンソールログの確認

- **メインプロセスログ**: ターミナルに表示
- **レンダラープロセスログ**: Electron DevTools（F12）

## ビルド

### 開発ビルド

```bash
npm run package
```

### 本番ビルド

```bash
npm run make
```

プラットフォーム別のビルド：
- Windows: `out/make/zip/win32/x64/rtms-client-win32-x64-<version>.zip`
- Linux (RPM): `out/make/rpm/x64/rtms-client-<version>.x86_64.rpm`

## 設定

アプリケーションの設定は`electron-store`を使用して永続化されます。

### 主な設定項目

```typescript
{
  serverIP: string,        // HTTPサーバーのIPアドレス
  serverPort: string,      // HTTPサーバーのポート
  mqttBrokerIP: string,    // MQTTブローカーのIPアドレス
  mqttBrokerPort: string,  // MQTTブローカーのポート
  selectedMac: string      // 選択されたMACアドレス
}
```

設定ファイルの場所：
- Windows: `%APPDATA%\rtms-client\config.json`
- macOS: `~/Library/Application Support/rtms-client/config.json`
- Linux: `~/.config/rtms-client/config.json`

## PLC-Bridge

PLC-Bridgeは、PLCとの通信を担当するPythonスクリプトです。

### 起動フロー

1. Electronアプリが起動
2. メインプロセスがPLC-Bridgeバイナリを実行
3. PLC-Bridgeが3つのWebSocketサーバーを起動
   - Port 8765: Config
   - Port 8766: Data
   - Port 8767: Scan Time
4. Electronが各WebSocketサーバーに接続

### 必要な出力

PLC-Bridgeは以下の出力を標準出力に書き込む必要があります：

```python
# 起動時
print("PLC-Bridge starting...", flush=True)

# WebSocketサーバー起動後
print(f"WebSocket servers started on ports {config_port}, {data_port}, {scan_time_port}", flush=True)

# エラー時
print(f"ERROR: {error_message}", flush=True)

# 終了時
print("PLC-Bridge shutting down...", flush=True)
```

## トラブルシューティング

### WebSocket接続エラー

**症状**: `ECONNREFUSED` エラーが表示される

**解決策**:
1. PLC-Bridgeが正常に起動しているか確認
2. ポート8765, 8766, 8767が使用可能か確認
3. ファイアウォール設定を確認

### サーバー接続エラー

**症状**: 「サーバー接続エラー」ダイアログが表示される

**解決策**:
1. HTTPサーバーが起動しているか確認
2. 設定画面でIPアドレスとポートが正しいか確認
3. ネットワーク接続を確認

### MQTT接続エラー

**症状**: ヘッダーにMQTTエラーアイコンが表示される

**解決策**:
1. MQTTブローカーが起動しているか確認
2. 設定画面でブローカーのIPアドレスとポートが正しいか確認
3. MQTTブローカーのログを確認

### CSPエラー

**症状**: コンソールに "Content Security Policy" エラーが表示される

**解決策**:
- これは開発モードでのみ表示される警告です
- 本番ビルドでは表示されません
- すべてのHTTP通信はメインプロセス経由で行われるため、セキュリティ上の問題はありません

## API通信

すべてのHTTP API通信は**メインプロセス経由**で実行されます（CSP制約のため）。

### 使用例

```typescript
// レンダラープロセスから
const result = await window.electronAPI.httpRequest({
  method: 'get',
  url: '/devices/full-info/MAC_ADDRESS',
  baseURL: 'http://192.168.1.100:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

if ('error' in result) {
  console.error('エラー:', result.error);
} else {
  console.log('成功:', result.data);
}
```

## デバッグ

### 有効なログ

```typescript
// メインプロセス (main.ts)
console.log('ブリッジスクリプト出力:', output);

// レンダラープロセス
console.log('📡 取得したサーバー設定:', serverAddress, serverPort);
console.log('✅ サーバー接続成功');
console.log('🔍 利用可能なアダプター:', adapters);
```

### デバッグモード

```bash
# Electron DevToolsを自動的に開く
npm start
```

## パフォーマンス最適化

- WebSocket接続はPLC-Bridge起動完了後に開始（不要なリトライを削減）
- HTTP通信はメインプロセスでキャッシュ可能
- React.memoを使用してコンポーネントの再レンダリングを最適化

## セキュリティ

- Content Security Policy (CSP)によりレンダラープロセスからの外部通信を制限
- すべてのHTTP通信はメインプロセス経由で実行
- IPCハンドラーで入力値を検証
- 本番ビルドではDevToolsを無効化

## ライセンス

プライベートリポジトリ

## 開発者

宮崎松尾製作所

## 変更履歴

### 2025-01-05
- CSP問題を解決（すべてのHTTP通信をメインプロセス経由に変更）
- PLC-Bridge起動検出を改善（出力ベースの検出に変更）
- WebSocket接続のタイミングを最適化
- 不要な`initializeApp()`の重複実行を修正

### Initial Release
- Electronアプリケーションの基本実装
- WebSocket通信の実装
- MQTT通信の実装
- ダッシュボードUIの実装
- 設定管理機能の実装
