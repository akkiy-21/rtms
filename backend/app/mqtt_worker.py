# mqtt_worker.py
"""
MQTT メッセージを受信してデータベースに直接書き込む独立プロセス

このワーカーは FastAPI とは独立して動作し、
複数の FastAPI ワーカーが起動していても MQTT メッセージは1回だけ処理されます。
"""
import signal
import sys
import time
from app.mqtt_client import get_mqtt_client
from app.database import SessionLocal
from app.services import device_service

# グローバル変数
mqtt_client = None
running = True


def signal_handler(sig, frame):
    """シグナルハンドラー: Ctrl+C や SIGTERM で安全に終了"""
    global running
    print('\nMQTT worker shutting down...')
    running = False
    if mqtt_client:
        mqtt_client.client.loop_stop()
        mqtt_client.client.disconnect()
    print('MQTT worker stopped')
    sys.exit(0)


def main():
    """MQTT ワーカーのメイン処理"""
    global mqtt_client
    
    # シグナルハンドラーの登録
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("=" * 60)
    print("MQTT Worker Starting...")
    print("=" * 60)
    
    # MQTT クライアントの初期化
    mqtt_client = get_mqtt_client()
    
    try:
        # MQTT ブローカーに接続
        print("Connecting to MQTT broker at localhost:1883...")
        mqtt_client.connect("localhost", 1883)
        
        # データベースから全デバイスを取得してサブスクライブ
        print("Loading devices from database...")
        db = SessionLocal()
        try:
            devices = device_service.get_devices(db)
            print(f"Found {len(devices)} device(s)")
            
            for device in devices:
                mqtt_client.add_device(device.id, device.mac_address)
                print(f"  - Subscribed to device {device.id}: {device.mac_address}")
        finally:
            db.close()
        
        # MQTT クライアントを開始
        print("\nStarting MQTT client loop...")
        mqtt_client.start()
        
        print("=" * 60)
        print("MQTT Worker is running. Press Ctrl+C to stop.")
        print("=" * 60)
        
        # メインループ（ブロッキング）
        while running:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received")
        signal_handler(signal.SIGINT, None)
    except Exception as e:
        print(f"\nError in MQTT worker: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
