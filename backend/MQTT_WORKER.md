# MQTT ワーカー設計ドキュメント

## 概要

MQTT ワーカーは FastAPI サーバーとは独立したプロセスとして動作し、MQTT メッセージを受信してデータベースに書き込みます。

## 問題の背景

### 以前の問題

FastAPI の `lifespan` イベントで MQTT クライアントを初期化していたため、以下の問題がありました：

```python
# run.py
uvicorn.run("run:app", host="0.0.0.0", port=8000, workers=4)
```

- FastAPI を4ワーカーで起動
- 各ワーカーが独立した MQTT クライアントを初期化
- 同じトピックを4回サブスクライブ
- **結果**: MQTT メッセージが4回処理され、データが重複

### 解決策

MQTT クライアントを **独立したプロセス** として分離：

```
┌─────────────────┐
│ MQTT Broker     │
│ (Mosquitto)     │
└────────┬────────┘
         │
         │ メッセージ受信（1回のみ）
         │
┌────────▼────────┐
│ MQTT Worker     │ ← 単一プロセス
│ (mqtt_worker.py)│
└────────┬────────┘
         │
         │ DB書き込み
         │
┌────────▼────────┐
│ PostgreSQL      │
└─────────────────┘

┌─────────────────┐
│ FastAPI Server  │ ← 複数ワーカー可能
│ (4 workers)     │    MQTT とは独立
└─────────────────┘
```

## アーキテクチャ

### ファイル構成

```
backend/app/
├── mqtt_worker.py       # MQTT ワーカー（独立プロセス）
├── mqtt_client.py       # MQTT クライアント実装
├── main.py              # FastAPI アプリケーション（MQTT 初期化なし）
├── services/
│   ├── device_service.py  # デバイス管理（MQTT 通知機能あり）
│   └── data_service.py    # データ処理
└── crud/
    └── data_crud.py       # データベース操作
```

### 処理フロー

1. **MQTT メッセージ受信**
   ```
   MQTT Broker → mqtt_worker.py → mqtt_client.on_message()
   ```

2. **データ処理**
   ```
   mqtt_client.process_data() → data_service.process_*_data() → data_crud.create_*()
   ```

3. **デバイス管理**
   ```
   FastAPI API → device_service → mqtt_client.publish_update_notification()
   ```

## 起動方法

### 開発環境

3つのターミナルで以下を実行：

```bash
# ターミナル1: MQTT ワーカー（必須）
npm run mqtt:worker

# ターミナル2: FastAPI サーバー
npm run backend:dev

# ターミナル3: フロントエンド
npm run frontend:start
```

### 本番環境

プロセスマネージャー（systemd、supervisord など）で管理：

```bash
# MQTT ワーカー
uv run python -m app.mqtt_worker

# FastAPI サーバー（複数ワーカー）
uv run python run.py
```

## 動作確認

### MQTT ワーカーのログ

正常起動時：
```
============================================================
MQTT Worker Starting...
============================================================
Connecting to MQTT broker at localhost:1883...
Loading devices from database...
Found 2 device(s)
  - Subscribed to device 1: AA:BB:CC:DD:EE:FF
  - Subscribed to device 2: 11:22:33:44:55:66

Starting MQTT client loop...
============================================================
Connected to MQTT Broker!
MQTT Worker is running. Press Ctrl+C to stop.
============================================================
```

メッセージ受信時：
```
Received message on topic AA:BB:CC:DD:EE:FF/bridge_data: {"name":"efficiency",...}
2025-12-01 11:45:23.123456
```

### FastAPI サーバーのログ

```
MQTT client in device_service.py: <app.mqtt_client.MQTTClient object at 0x...>
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started parent process [12345]
```

**重要**: FastAPI のログに "Initializing MQTT client..." が **表示されない** ことを確認してください。

## トラブルシューティング

### MQTT ワーカーが起動しない

1. Mosquitto が起動しているか確認
   ```bash
   docker-compose ps
   ```

2. ポート 1883 が使用可能か確認
   ```bash
   netstat -an | findstr 1883
   ```

### メッセージが処理されない

1. MQTT ワーカーが起動しているか確認
2. デバイスが正しくサブスクライブされているか確認
3. MQTT ブローカーのログを確認
   ```bash
   docker-compose logs -f mosquitto
   ```

### メッセージが重複して処理される

- MQTT ワーカーが複数起動していないか確認
- FastAPI の `main.py` に MQTT 初期化コードが残っていないか確認

## デバイス管理との連携

### デバイス追加時

```python
# device_service.py
def register_device(db: Session, registration: DeviceRegistration):
    device = device_crud.create_device(...)
    mqtt_client.add_device(device.id, device.mac_address)  # MQTT ワーカーに通知
    return device
```

### デバイス削除時

```python
def delete_device(db: Session, device_id: int):
    result = device_crud.delete_device(db, device_id)
    if result:
        mqtt_client.remove_device(device_id)  # MQTT ワーカーに通知
    return result
```

### 設定変更時

```python
def update_device(db: Session, device_id: int, device_update: DeviceUpdate):
    old_device = device_crud.get_device(db, device_id)
    updated_device = device_crud.update_device(db, device_id, device_update)
    
    # デバイスに設定変更を通知
    mqtt_client.publish_update_notification(old_device.mac_address, "device_info")
    
    return updated_device
```

## まとめ

### メリット

✅ FastAPI を複数ワーカーで起動しても MQTT メッセージは1回だけ処理される
✅ FastAPI と MQTT の責任が明確に分離
✅ それぞれ独立してスケール可能
✅ 既存のコードへの影響が最小限

### 注意点

⚠️ MQTT ワーカーを起動し忘れると MQTT メッセージが処理されない
⚠️ MQTT ワーカーは単一プロセスで動作（冗長化が必要な場合は別途対応）
