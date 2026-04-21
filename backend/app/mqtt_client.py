import json
from paho.mqtt import client as mqtt_client
from app.database import SessionLocal
from datetime import datetime

class MQTTClient:
    def __init__(self):
        self.client = mqtt_client.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.topics = {}  # デバイスIDをキーとしたトピックの辞書
        self.mac_to_id = {}  # MACアドレスをキーとしたデバイスIDの辞書

    def connect(self, broker, port):
        self.client.connect(broker, port)

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
            for topic in self.topics.values():
                self.client.subscribe(topic, qos=1)
        else:
            print(f"Failed to connect, return code {rc}")

    def on_message(self, client, userdata, msg):
        print(f"Received message on topic {msg.topic}: {msg.payload.decode()}")
        try:
            payload = json.loads(msg.payload.decode())
            mac_address = msg.topic.split('/')[0]
            self.process_data(mac_address, payload)
        except json.JSONDecodeError:
            print(f"Invalid JSON payload: {msg.payload.decode()}")

    def process_data(self, mac_address, data):
        from app.services import device_service, data_service  # Import here to avoid circular import
        with SessionLocal() as db:
            device = device_service.get_device_by_mac(db, mac_address, device_status='active')
            if device:
                data_type = data.get('name')
                event_time = data.get('timestamp') / 1000
                print(datetime.fromtimestamp(event_time))
                if data_type == 'efficiency':
                    data_service.process_efficiency_data(db, device.id, data['data'], event_time)
                elif data_type == 'quality_control':
                    data_service.process_quality_control_data(db, device.id, data['data'], event_time)
                elif data_type == 'logging':
                    data_service.process_logging_data(db, device.id, data['data'], event_time)
                elif data_type == 'alarm':
                    data_service.process_alarm_data(db, device.id, data['data'], event_time)
                else:
                    print(f"Unknown data type: {data_type}")
            else:
                print(f"Device with MAC address {mac_address} not found")

    def add_device(self, device_id, mac_address):
        topic = f"{mac_address}/bridge_data"
        self.topics[device_id] = topic
        self.mac_to_id[mac_address] = device_id
        if self.client.is_connected():
            self.client.subscribe(topic, qos=1)
        print(f"Added device {device_id} with topic {topic}")

    def remove_device(self, device_id):
        if device_id in self.topics:
            topic = self.topics.pop(device_id)
            if self.client.is_connected():
                self.client.unsubscribe(topic)
            mac_address = next((mac for mac, did in self.mac_to_id.items() if did == device_id), None)
            if mac_address:
                del self.mac_to_id[mac_address]
            print(f"Removed device {device_id} with topic {topic}")

    def update_device_mac(self, device_id, new_mac_address):
        old_topic = self.topics.get(device_id)
        if old_topic:
            self.client.unsubscribe(old_topic)
            old_mac = old_topic.split('/')[0]
            del self.mac_to_id[old_mac]

        new_topic = f"{new_mac_address}/bridge_data"
        self.topics[device_id] = new_topic
        self.mac_to_id[new_mac_address] = device_id
        if self.client.is_connected():
            self.client.subscribe(new_topic, qos=1)
        print(f"Updated device {device_id} to new topic {new_topic}")

    def start(self):
        self.client.loop_start()

    # デバイス情報の更新をブロードキャストするメソッドを追加
    def publish_update_notification(self, mac_address: str, update_type: str):
        """
        設定更新の通知フラグを送信する
        
        Args:
            mac_address (str): デバイスのMACアドレス
            update_type (str): 更新された設定の種類（例: "device_info", "alarm_settings" など）
        """
        topic = f"{mac_address}/update"
        payload = json.dumps({
            "type": update_type,
            "timestamp": int(datetime.now().timestamp() * 1000)
        })
        
        result = self.client.publish(topic, payload, qos=1)
        if result.rc == mqtt_client.MQTT_ERR_SUCCESS:
            print(f"Update notification published successfully to {topic}")
        else:
            print(f"Failed to publish update notification to {topic}")

# グローバル変数としてインスタンスを作成
mqtt_client_instance = MQTTClient()

def get_mqtt_client():
    return mqtt_client_instance