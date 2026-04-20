# main.py
import asyncio
import time
import json
import sys
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Set, Union
from mcprotocol3e import MCProtocol3E
from fins import Fins
from async_timeout import timeout as async_timeout
import numpy as np
import pandas as pd
from collections import defaultdict
import bitarray
import websockets
import json
import threading
import logging
from datetime import datetime
from logging.handlers import RotatingFileHandler

# =====================================================
# ログ設定 - この変数一つで有効無効を切り替え
# すべてのモジュール（main.py, mcprotocol3e.py, fins.py）のログを一元管理
# =====================================================
LOGGING_ENABLED = False  # False にすると完全にログを無効化

# ログレベル設定（LOGGING_ENABLEDがTrueの時のみ有効）
LOG_LEVEL = logging.DEBUG  # DEBUG, INFO, WARNING, ERROR, CRITICAL から選択
LOG_TO_FILE = True  # ファイルへのログ出力を有効にするか
LOG_TO_CONSOLE = True  # コンソールへのログ出力を有効にするか

# ファイルログ設定
LOG_FILE_NAME = 'plc_bridge.log'
LOG_MAX_BYTES = 10 * 1024 * 1024  # 10MB
LOG_BACKUP_COUNT = 5

# =====================================================
# ロガーの初期化
# =====================================================
logger = logging.getLogger('PLCBridge')

if LOGGING_ENABLED:
    # ログ有効時の設定
    logger.setLevel(LOG_LEVEL)
    
    # ログフォーマッター
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
    )
    
    # ファイルハンドラーの追加
    if LOG_TO_FILE:
        rotating_handler = RotatingFileHandler(
            LOG_FILE_NAME,
            maxBytes=LOG_MAX_BYTES,
            backupCount=LOG_BACKUP_COUNT,
            encoding='utf-8'
        )
        rotating_handler.setFormatter(formatter)
        logger.addHandler(rotating_handler)
    
    # コンソールハンドラーの追加
    if LOG_TO_CONSOLE:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
    
    logger.info("Logging is ENABLED")
    logger.info(f"Log Level: {logging.getLevelName(LOG_LEVEL)}")
    logger.info(f"Log to File: {LOG_TO_FILE}, Log to Console: {LOG_TO_CONSOLE}")
else:
    # ログ無効時の設定 - パフォーマンス最適化
    logger.disabled = True  # ログ処理を完全にスキップ
    logger.setLevel(logging.CRITICAL + 1)  # すべてのログレベルより高く設定

class ResourceTracker:
    """リソース使用状況の追跡とモニタリング"""
    def __init__(self):
        self.active_connections: Set[str] = set()
        self.active_tasks: Set[asyncio.Task] = set()
        self.last_gc_time = time.time()
        self.memory_usage_log = []

    def add_connection(self, connection_id: str):
        self.active_connections.add(connection_id)
        logger.debug(f"Connection added: {connection_id}. Total active connections: {len(self.active_connections)}")

    def remove_connection(self, connection_id: str):
        self.active_connections.discard(connection_id)
        logger.debug(f"Connection removed: {connection_id}. Total active connections: {len(self.active_connections)}")

    def add_task(self, task: asyncio.Task):
        self.active_tasks.add(task)
        logger.debug(f"Task added: {task.get_name()}. Total active tasks: {len(self.active_tasks)}")

    def remove_task(self, task: asyncio.Task):
        self.active_tasks.discard(task)
        logger.debug(f"Task removed: {task.get_name()}. Total active tasks: {len(self.active_tasks)}")

    def log_status(self):
        logger.info(f"Resource Status - Connections: {len(self.active_connections)}, Tasks: {len(self.active_tasks)}")

class PLCInterface(ABC):
    @abstractmethod
    async def read_data(self):
        pass

    @abstractmethod
    async def close(self):
        pass

class MCProtocolPLC(PLCInterface):
    ADDR_CLS = {
        'bit': ['X', 'Y', 'B', 'M'], 
        'word': ['D', 'W']
    }

    def __init__(self, plc: dict, bridge_name: str, bridge_data: dict):
        self.ip = plc['ip_address']
        self.port = plc['port_no']
        self.bridge_name = bridge_name
        self.bridge_data = bridge_data
        self.config = plc
        self.plc = MCProtocol3E(self.ip, self.port)
        self.connection_id = f"MC_{self.ip}:{self.port}"
        logger.info(f"Initialized MCProtocolPLC connection: {self.connection_id}")

    async def close(self):
        try:
            # MCProtocol3Eクラスにはclose()メソッドが明示的に定義されていないため、
            # 追加のクリーンアップが必要な場合はここで実装
            self.plc = None
            logger.info(f"Closed MCProtocolPLC connection: {self.connection_id}")
        except Exception as e:
            logger.error(f"Error closing MCProtocolPLC connection {self.connection_id}: {e}")
            raise

    async def read_logging_data(self):
        trigger_address = self.bridge_data['address']
        trigger_address_length = self.bridge_data.get('address_length', 1)
        trigger_name = self.bridge_data['name']
        
        try:
            logger.debug(f"Reading logging data from {trigger_address} with length {trigger_address_length}")
            read_data = await self.plc.read(trigger_address, trigger_address_length)  # asyncio.to_threadを削除
            
            if read_data is not None:
                if self.bridge_data['address_type'] in self.ADDR_CLS['bit']:
                    converted_data = self.plc.toBin(read_data)
                elif self.bridge_data['address_type'] in self.ADDR_CLS['word']:
                    converted_data = self.plc.toUInt16(read_data)

                logging_data = []
                for logging_datum in self.bridge_data.get('logging_data', []):
                    logging_address = logging_datum['address']
                    logging_address_length = logging_datum.get('address_length', 1)
                    logging_name = logging_datum['name']

                    logger.debug(f"Reading additional logging data from {logging_address}")
                    logging_read_data = await self.plc.read(  # asyncio.to_threadを削除
                        logging_address, 
                        logging_address_length
                    )

                    if logging_read_data is not None:
                        converted_value = await self._convert_data_type(
                            logging_read_data, 
                            logging_datum['data_type']
                        )
                        logging_data.append({
                            'name': logging_name,
                            'value': converted_value
                        })
                    else:
                        logger.warning(f"Failed to read logging data from {logging_address}")

                return {trigger_name: converted_data, 'logging_data': logging_data}

        except Exception as e:
            logger.error(f"Error reading logging data from {trigger_address}: {e}")
            raise

    async def _convert_data_type(self, data: bytes, data_type: str) -> Any:
        """データ型に応じた変換を行う"""
        try:
            if data_type == 'UNSIGNED SMALLINT':
                return self.plc.toUInt16(data)
            elif data_type == 'UNSIGNED INT':
                return self.plc.toUInt32(data)
            elif data_type == 'SMALLINT':
                return self.plc.toInt16(data)
            elif data_type == 'INT':
                return self.plc.toInt32(data)
            elif data_type == 'REAL':
                return self.plc.toFloat(data)
            elif data_type == 'DOUBLE':
                return self.plc.toDouble(data)
            elif data_type == 'ASCII':
                return self.plc.toString(data)
            else:
                logger.warning(f"Unknown data type: {data_type}")
                return None
        except Exception as e:
            logger.error(f"Error converting data type {data_type}: {e}")
            raise

    async def read_qc_data(self):
        results = {}
        main_data = self.bridge_data
        children_data = main_data.get('children', [])

        try:
            # メインデータの読み取り
            main_result = await self.read_single_data(main_data)
            if main_result:
                results.update(main_result)

            # 子データの読み取り
            for child in children_data:
                child_result = await self.read_single_data(child)
                if child_result:
                    results.update(child_result)

            return results

        except Exception as e:
            logger.error(f"Error reading QC data: {e}")
            raise

    async def read_efficiency_data(self):
        try:
            return await self.read_single_data(self.bridge_data)
        except Exception as e:
            logger.error(f"Error reading efficiency data: {e}")
            raise

    async def read_alarm_data(self):
        try:
            return await self.read_single_data(self.bridge_data)
        except Exception as e:
            logger.error(f"Error reading alarm data: {e}")
            raise

    async def read_single_data(self, bridge_data: dict):
        address = bridge_data['address']
        address_length = bridge_data.get('address_length', 1)
        data_name = bridge_data['name']
        
        try:
            logger.debug(f"Reading data from {address} with length {address_length}")
            read_data = await self.plc.read(address, address_length)  # asyncio.to_threadを削除
            
            if read_data is not None:
                if bridge_data['address_type'] in self.ADDR_CLS['bit']:
                    # ビットデータの読み取り
                    converted_data = self.plc.toBin(read_data)  # すでに非同期関数の結果を受け取っているので直接変換可能
                    logger.debug(f"Converted bit data from {address}: {converted_data}")
                elif bridge_data['address_type'] in self.ADDR_CLS['word']:
                    # ワードデータの読み取り
                    converted_data = self.plc.toUInt16(read_data)  # すでに非同期関数の結果を受け取っているので直接変換可能
                    logger.debug(f"Converted word data from {address}: {converted_data}")
                
                return {data_name: converted_data}
            else:
                logger.warning(f"No data read from {address}")
                return None

        except Exception as e:
            logger.error(f"Error reading single data from {address}: {e}")
            raise

    async def read_data(self):
        try:
            if self.bridge_name == 'quality_control':
                return await self.read_qc_data()
            elif self.bridge_name == 'logging':
                return await self.read_logging_data()
            elif self.bridge_name == 'efficiency':
                return await self.read_efficiency_data()
            elif self.bridge_name == 'alarm':
                return await self.read_alarm_data()
            else:
                logger.warning(f"Unknown bridge name: {self.bridge_name}")
                return None
        except Exception as e:
            logger.error(f"Error in read_data for {self.bridge_name}: {e}")
            raise

class FINSPLC(PLCInterface):
    ADDR_CLS = {
        'bit': ['W'],
        'word': ['D', 'CIO']
    }

    def __init__(self, plc: dict, bridge_name: str, bridge_data: dict, max_concurrent_requests: int = 20):
        self.ip = plc['ip_address']
        self.port = plc['port_no']
        self.bridge_name = bridge_name
        self.bridge_data = bridge_data
        self.config = plc

        dna = int(self.ip.split('/')[0].split('.')[-1]) # PLC側のノード番号
        
        self.plc = Fins(
            self.ip, 
            dna,    # PLC側のノード番号
            254,   # PC側のノード番号(本来であればIPアドレスの最後の数字)
            max_concurrent_requests=max_concurrent_requests
        )
        self.connection_id = f"FINS_{self.ip}:{self.port}"
        logger.info(f"Initialized FINSPLC connection: {self.connection_id}")

    async def close(self):
        try:
            await self.plc.stop()
            self.plc = None
            logger.info(f"Closed FINSPLC connection: {self.connection_id}")
        except Exception as e:
            logger.error(f"Error closing FINSPLC connection {self.connection_id}: {e}")
            raise

    async def read_logging_data(self):
        trigger_address = self.bridge_data['address']
        trigger_address_length = self.bridge_data.get('address_length', 1)
        trigger_name = self.bridge_data['name']
        
        try:
            logger.debug(f"Reading FINS logging data from {trigger_address}")
            read_data = await self.plc.read(trigger_address, trigger_address_length)
            
            if read_data is not None:
                if self.bridge_data['address_type'] in self.ADDR_CLS['bit']:
                    converted_data = self.plc.to_bin(read_data)
                elif self.bridge_data['address_type'] in self.ADDR_CLS['word']:
                    converted_data = self.plc.to_uint16(read_data)

                logging_data = []
                for logging_datum in self.bridge_data.get('logging_data', []):
                    logging_address = logging_datum['address']
                    logging_address_length = logging_datum.get('address_length', 1)
                    logging_name = logging_datum['name']

                    logger.debug(f"Reading FINS additional logging data from {logging_address}")
                    logging_read_data = await self.plc.read(logging_address, logging_address_length)

                    if logging_read_data is not None:
                        converted_value = await self._convert_data_type(
                            logging_read_data, 
                            logging_datum['data_type']
                        )
                        logging_data.append({
                            'name': logging_name,
                            'value': converted_value
                        })
                    else:
                        logger.warning(f"Failed to read FINS logging data from {logging_address}")

                return {trigger_name: converted_data, 'logging_data': logging_data}

        except Exception as e:
            logger.error(f"Error reading FINS logging data from {trigger_address}: {e}")
            raise

    async def _convert_data_type(self, data: bytes, data_type: str) -> Any:
        """FINSのデータ型に応じた変換を行う"""
        try:
            if data_type == 'UNSIGNED SMALLINT':
                return self.plc.to_uint16(data)
            elif data_type == 'UNSIGNED INT':
                return self.plc.to_uint32(data)
            elif data_type == 'SMALLINT':
                return self.plc.to_int16(data)
            elif data_type == 'INT':
                return self.plc.to_int32(data)
            elif data_type == 'REAL':
                return self.plc.to_float(data)
            elif data_type == 'DOUBLE':
                return self.plc.to_double(data)
            elif data_type == 'ASCII':
                return self.plc.to_string(data)
            else:
                logger.warning(f"Unknown FINS data type: {data_type}")
                return None
        except Exception as e:
            logger.error(f"Error converting FINS data type {data_type}: {e}")
            raise

    async def read_qc_data(self):
        results = {}
        main_data = self.bridge_data
        children_data = main_data.get('children', [])

        try:
            # メインデータの読み取り
            main_result = await self.read_single_data(main_data)
            if main_result:
                results.update(main_result)

            # 子データの読み取り
            for child in children_data:
                child_result = await self.read_single_data(child)
                if child_result:
                    results.update(child_result)

            return results

        except Exception as e:
            logger.error(f"Error reading FINS QC data: {e}")
            raise

    async def read_efficiency_data(self):
        try:
            return await self.read_single_data(self.bridge_data)
        except Exception as e:
            logger.error(f"Error reading FINS efficiency data: {e}")
            raise

    async def read_alarm_data(self):
        try:
            return await self.read_single_data(self.bridge_data)
        except Exception as e:
            logger.error(f"Error reading FINS alarm data: {e}")
            raise

    async def read_single_data(self, bridge_data: dict):
        address = bridge_data['address']
        address_length = bridge_data.get('address_length', 1)
        data_name = bridge_data['name']
        
        try:
            logger.debug(f"Reading FINS single data from {address} with length {address_length}")
            read_data = await self.plc.read(address, address_length)
            
            if read_data is not None:
                if bridge_data['address_type'] in self.ADDR_CLS['bit']:
                    converted_data = self.plc.to_bin(read_data)
                elif bridge_data['address_type'] in self.ADDR_CLS['word']:
                    converted_data = self.plc.to_uint16(read_data)
                
                return {data_name: converted_data}
            else:
                logger.warning(f"No FINS data read from {address}")
                return None

        except Exception as e:
            logger.error(f"Error reading FINS single data from {address}: {e}")
            raise

    async def read_data(self):
        try:
            if self.bridge_name == 'quality_control':
                return await self.read_qc_data()
            elif self.bridge_name == 'logging':
                return await self.read_logging_data()
            elif self.bridge_name == 'efficiency':
                return await self.read_efficiency_data()
            elif self.bridge_name == 'alarm':
                return await self.read_alarm_data()
            else:
                logger.warning(f"Unknown bridge name for FINS: {self.bridge_name}")
                return None
        except Exception as e:
            logger.error(f"Error in FINS read_data for {self.bridge_name}: {e}")
            raise

class PLCBridge:
    def __init__(self):
        self.execution_times = []
        self.bridge_config = {}
        self.plcs = []
        self.previous_data = defaultdict(lambda: defaultdict(int))
        self.previous_trigger_states = defaultdict(lambda: defaultdict(bool))
        
        self.config_websocket = None
        self.data_websocket = None
        self.scan_time_websocket = None
        self.host = "localhost"
        self.config_port = 8765
        self.data_port = 8766
        self.scan_time_port = 8767

        self.scan_time_thread = None
        self.stop_scan_time_thread = threading.Event()
        
        # リソース管理
        self.resource_tracker = ResourceTracker()
        self._websocket_tasks = set()
        self._cleanup_event = asyncio.Event()
        self._max_execution_times = 1000

        # PLC通信の同時実行制限
        self.max_concurrent_plc_requests = 1
        self.plc_semaphore = asyncio.Semaphore(self.max_concurrent_plc_requests)
        
        # 統計情報の追跡
        self.stats = {
            'total_reads': 0,
            'successful_reads': 0,
            'failed_reads': 0,
            'total_messages_sent': 0,
            'last_error_time': None,
            'error_count': 0
        }
        
        # パフォーマンスモニタリング
        self.performance_metrics = {
            'read_times': [],
            'process_times': [],
            'websocket_send_times': []
        }
        
        logger.info("PLCBridge initialized with resource tracking and performance monitoring")

    async def start_websocket_servers(self):
        try:
            websocket_kwargs = {
                'ping_interval': 20,
                'ping_timeout': 30,
                'close_timeout': 10,
                'max_size': 2**20,  # 1MB
                'max_queue': 32
            }
            
            self.config_server = await websockets.serve(
                self.handle_config_websocket,
                self.host,
                self.config_port,
                **websocket_kwargs
            )
            logger.info(f"Config WebSocket server started on ws://{self.host}:{self.config_port}")

            self.data_server = await websockets.serve(
                self.handle_data_websocket,
                self.host,
                self.data_port,
                **websocket_kwargs
            )
            logger.info(f"Data WebSocket server started on ws://{self.host}:{self.data_port}")

            self.scan_time_server = await websockets.serve(
                self.handle_scan_time_websocket,
                self.host,
                self.scan_time_port,
                **websocket_kwargs
            )
            logger.info(f"Scan Time WebSocket server started on ws://{self.host}:{self.scan_time_port}")

            # WebSocketサーバー起動完了を通知
            print(f"WebSocket servers started on ports {self.config_port}, {self.data_port}, {self.scan_time_port}", flush=True)
            sys.stdout.flush()
            logger.info("PLC-Bridge is ready")

        except Exception as e:
            logger.error(f"Failed to start WebSocket servers: {e}")
            raise

    async def handle_websocket_connection(self, websocket, path: str, handler):
        """WebSocket接続の共通ハンドラ"""
        connection_id = f"{path}_{id(websocket)}"
        task = asyncio.current_task()
        
        try:
            self.resource_tracker.add_connection(connection_id)
            self._websocket_tasks.add(task)
            
            logger.info(f"New WebSocket connection established: {connection_id}")
            await handler(websocket)
            
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"WebSocket connection closed normally: {connection_id}")
        except Exception as e:
            logger.error(f"WebSocket error on {connection_id}: {e}")
        finally:
            self.resource_tracker.remove_connection(connection_id)
            self._websocket_tasks.discard(task)
            logger.debug(f"WebSocket connection cleanup completed: {connection_id}")

    async def handle_config_websocket(self, websocket):
        async def config_handler(ws):
            async for message in ws:
                try:
                    start_time = time.time()
                    logger.debug(f"Received config message: {message[:100]}...")
                    
                    config = json.loads(message)
                    await self.update_config(config)
                    
                    response = {
                        "status": "success",
                        "message": "Configuration updated successfully",
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    await ws.send(json.dumps(response))
                    
                    process_time = time.time() - start_time
                    logger.debug(f"Config processing time: {process_time:.3f}s")
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON format in config: {e}")
                    await ws.send(json.dumps({
                        "status": "error",
                        "message": f"Invalid JSON format: {str(e)}",
                        "timestamp": datetime.now().isoformat()
                    }))
                except Exception as e:
                    logger.error(f"Config update error: {e}")
                    await ws.send(json.dumps({
                        "status": "error",
                        "message": f"Configuration update failed: {str(e)}",
                        "timestamp": datetime.now().isoformat()
                    }))

        await self.handle_websocket_connection(websocket, "/config", config_handler)

    async def handle_data_websocket(self, websocket):
        async def data_handler(ws):
            self.data_websocket = ws
            try:
                await ws.wait_closed()
            finally:
                if self.data_websocket == ws:
                    self.data_websocket = None

        await self.handle_websocket_connection(websocket, "/data", data_handler)

    async def handle_scan_time_websocket(self, websocket):
        async def scan_time_handler(ws):
            self.scan_time_websocket = ws
            try:
                await ws.wait_closed()
            finally:
                if self.scan_time_websocket == ws:
                    self.scan_time_websocket = None

        await self.handle_websocket_connection(websocket, "/scan_time", scan_time_handler)

    async def cast_data(self, message: dict):
        if self.data_websocket:
            try:
                start_time = time.time()
                json_message = json.dumps(message, ensure_ascii=False)
                await self.data_websocket.send(json_message)
                
                send_time = time.time() - start_time
                self.performance_metrics['websocket_send_times'].append(send_time)
                self.stats['total_messages_sent'] += 1
                
                logger.debug(f"Data sent successfully. Send time: {send_time:.3f}s")
                
            except websockets.exceptions.ConnectionClosed:
                logger.warning("Data WebSocket connection closed")
                self.data_websocket = None
            except Exception as e:
                logger.error(f"Error sending data: {e}")
                self.stats['error_count'] += 1
                self.stats['last_error_time'] = datetime.now().isoformat()

    async def cast_scan_time(self, scan_time: dict):
        if self.scan_time_websocket:
            try:
                start_time = time.time()
                await self.scan_time_websocket.send(json.dumps(scan_time))
                
                send_time = time.time() - start_time
                logger.debug(f"Scan time sent successfully. Send time: {send_time:.3f}s")
                
            except websockets.exceptions.ConnectionClosed:
                logger.warning("Scan Time WebSocket connection closed")
                self.scan_time_websocket = None
            except Exception as e:
                logger.error(f"Error sending scan time: {e}")

    def scan_time_thread_function(self):
        """スキャンタイム計測用スレッド関数"""
        logger.info("Scan time thread started")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            while not self.stop_scan_time_thread.is_set():
                if len(self.execution_times) > 0:
                    # 直近10回の実行時間の平均を計算
                    recent_times = self.execution_times[-10:]
                    average_execution_time = np.mean(recent_times)
                    
                    scan_time = {
                        'scan_time': f"{average_execution_time:.3f}",
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    loop.run_until_complete(self.cast_scan_time(scan_time))
                
                time.sleep(0.1)
        except Exception as e:
            logger.error(f"Error in scan time thread: {e}")
        finally:
            loop.close()
            logger.info("Scan time thread stopped")

    def manage_execution_times(self):
        # execution_times のトリミング
        if len(self.execution_times) > self._max_execution_times:
            self.execution_times = self.execution_times[-self._max_execution_times:]

        # performance_metrics の各リストも直接更新する
        for key, metric_list in self.performance_metrics.items():
            if len(metric_list) > self._max_execution_times:
                self.performance_metrics[key] = metric_list[-self._max_execution_times:]

    async def process_plc_data(self, plc: PLCInterface, data: dict, message: dict):
        """PLCデータの処理"""
        start_time = time.time()
        
        try:
            if plc.bridge_name == 'logging':
                await self.process_logging(plc.bridge_name, plc.bridge_data, data, message)
            elif plc.bridge_name == 'quality_control':
                await self.process_quality_control(plc.bridge_name, plc.bridge_data, data, message)
            elif plc.bridge_name == 'efficiency':
                await self.process_efficiency(plc.bridge_name, plc.bridge_data, data, message)
            elif plc.bridge_name == 'alarm':
                await self.process_alarm(plc.bridge_name, plc.bridge_data, data, message)
            
            process_time = time.time() - start_time
            self.performance_metrics['process_times'].append(process_time)
            logger.debug(f"PLC data processing time for {plc.bridge_name}: {process_time:.3f}s")
            
        except Exception as e:
            logger.error(f"Error processing PLC data for {plc.bridge_name}: {e}")
            self.stats['error_count'] += 1
            self.stats['last_error_time'] = datetime.now().isoformat()
            raise

    async def process_plc(self, plc: PLCInterface):
        """個別PLCの処理 - 同時実行制限付き"""
        async with self.plc_semaphore:  # セマフォによる制限
            start_time = time.time()
            self.stats['total_reads'] += 1
            
            try:
                async with async_timeout(10):  # 10秒のタイムアウト
                    data = await plc.read_data()
                    
                    if data is not None:
                        self.stats['successful_reads'] += 1
                        message = {
                            'timestamp': int(time.time() * 1000),
                            'name': plc.bridge_name,
                            'data': {}
                        }

                        if data:
                            await self.process_plc_data(plc, data, message)
                            if message['data']:
                                await self.cast_data(message)
                    else:
                        self.stats['failed_reads'] += 1
                        logger.warning(f"No data read from PLC {plc.bridge_name}")

                    read_time = time.time() - start_time
                    self.performance_metrics['read_times'].append(read_time)
                    logger.debug(f"PLC read time for {plc.bridge_name}: {read_time:.3f}s")

            except asyncio.TimeoutError:
                self.stats['failed_reads'] += 1
                logger.error(f"Timeout reading from PLC {plc.bridge_name}")
            except Exception as e:
                self.stats['failed_reads'] += 1
                logger.error(f"Error processing PLC {plc.bridge_name}: {e}")
                await asyncio.sleep(1)

    async def update_config(self, new_config: dict):
        """設定の更新"""
        logger.info("Starting configuration update")
        try:
            # 既存のPLC接続をクリーンアップ
            for plc in self.plcs:
                try:
                    await plc.close()
                except Exception as e:
                    logger.error(f"Error closing PLC connection: {e}")
            
            self.plcs.clear()
            self.bridge_config = self.parse_config(new_config)
            
            # 新しいPLC接続の初期化
            self.initialize_plcs()
            logger.info("Configuration update completed successfully")
            
        except Exception as e:
            logger.error(f"Error updating configuration: {e}")
            raise

    def parse_config(self, config: dict) -> dict:
        """設定のパース処理"""
        logger.info("Starting configuration parsing")
        bridge_config = {
            'efficiency_config': {'groups': []},
            'alarm_config': {'groups': []},
            'qc_config': {'groups': []},
            'logging_config': {'groups': []}
        }

        try:
            # Logging Settings
            for logging_config in config.get('logging_settings', []):
                logger.debug(f"Processing logging config: {logging_config.get('logging_name')}")
                addr_type = logging_config['address_type']
                addr = logging_config['address']
                bridge_addr = f"{addr_type}{addr}"
                bridge_addr_length = 1

                group_config = {
                    'name': 'logging',
                    'plc': {
                        'ip_address': logging_config['client']['ip_address'].split('/')[0],
                        'port_no': logging_config['client']['port_no'],
                        'protocol': logging_config['client']['plc']['protocol'].lower()
                    },
                    'bridge_data': {
                        'logging_type': logging_config['logging_type'],
                        'name': logging_config['logging_name'],
                        'address_type': addr_type,
                        'address': bridge_addr,
                        'address_length': bridge_addr_length,
                        'logging_data': []
                    }
                }

                for log_data in logging_config.get('logging_data', []):
                    log_data_config = {
                        'name': log_data['data_name'],
                        'address_type': log_data['address_type'],
                        'address': f"{log_data['address_type']}{log_data['address']}",
                        'address_length': log_data['address_count'],
                        'data_type': log_data['data_type']
                    }
                    group_config['bridge_data']['logging_data'].append(log_data_config)

                bridge_config['logging_config']['groups'].append(group_config)
                logger.debug(f"Added logging group config for {logging_config.get('logging_name')}")

            # Quality Control Signals
            for qc_config in config.get('quality_control_signals', []):
                logger.debug(f"Processing QC config: {qc_config.get('signal_name')}")
                addr_type = qc_config['address_type']
                addr = qc_config['address']
                bridge_addr = f"{addr_type}{addr}"
                bridge_addr_length = 1

                group_config = {
                    'name': 'quality_control',
                    'plc': {
                        'ip_address': qc_config['client']['ip_address'].split('/')[0],
                        'port_no': qc_config['client']['port_no'],
                        'protocol': qc_config['client']['plc']['protocol'].lower()
                    },
                    'bridge_data': {
                        'signal_type': qc_config['signal_type'],
                        'name': qc_config['signal_name'],
                        'signal_shot_no': qc_config['signal_shot_number'],
                        'address_type': addr_type,
                        'address': bridge_addr,
                        'address_length': bridge_addr_length,
                        'children': []
                    }
                }

                for qc_child in qc_config.get('children', []):
                    child_data = {
                        'name': qc_child['signal_name'],
                        'signal_shot_no': qc_child['signal_shot_number'],
                        'address_type': qc_child['address_type'],
                        'address': f"{qc_child['address_type']}{qc_child['address']}",
                        'address_length': 1
                    }
                    group_config['bridge_data']['children'].append(child_data)

                bridge_config['qc_config']['groups'].append(group_config)
                logger.debug(f"Added QC group config for {qc_config.get('signal_name')}")

            # Efficiency Addresses
            for efficiency_config in config.get('efficiency_addresses', []):
                logger.debug(f"Processing efficiency config: {efficiency_config.get('name', 'Unknown')}")
                try:
                    meta_df = pd.json_normalize(efficiency_config['classification'])
                    meta_df.columns = ['classification_id', 'classification_name', 'group_id', 'group_name']
                    
                    addr_type = efficiency_config['address_type']
                    addr = efficiency_config['address']
                    bridge_addr = f"{addr_type}{addr}"
                    bridge_addr_length = 1

                    group_config = {
                        'name': 'efficiency',
                        'plc': {
                            'ip_address': efficiency_config['client']['ip_address'].split('/')[0],
                            'port_no': efficiency_config['client']['port_no'],
                            'protocol': efficiency_config['client']['plc']['protocol'].lower()
                        },
                        'bridge_data': {
                            'class_name': efficiency_config['classification']['group']['name'],
                            'name': efficiency_config['classification']['name'],
                            'address_type': addr_type,
                            'address': bridge_addr,
                            'address_length': bridge_addr_length,
                            'meta_data': meta_df
                        }
                    }
                    bridge_config['efficiency_config']['groups'].append(group_config)
                    logger.debug(f"Added efficiency group config for {efficiency_config['classification'].get('name')}")
                    
                except Exception as e:
                    logger.error(f"Error processing efficiency config: {e}")
                    raise

            # Alarm Groups
            for alarm_config in config.get('alarm_groups', []):
                logger.debug(f"Processing alarm config: {alarm_config.get('name')}")
                try:
                    addr_df = pd.DataFrame(alarm_config['addresses'])
                    
                    if addr_df.empty:
                        logger.warning(f"No alarm addresses found for group {alarm_config['name']}")
                        continue

                    first_valid_row = addr_df.loc[addr_df['alarm_no'].isin([0, 1])].sort_values('alarm_no').iloc[0]
                    addr_type = first_valid_row['address_type']
                    addr = first_valid_row['address']

                    if pd.isna(addr_type) or addr_type == "":
                        if alarm_config['client']['plc']['protocol'].lower() == 'fins':
                            addr_type = "CIO"
                            logger.info(f"Using default address type 'CIO' for FINS protocol in alarm group {alarm_config['name']}")
                        else:
                            logger.warning(f"Invalid address type for alarm group {alarm_config['name']}")
                            continue

                    if pd.isna(addr):
                        logger.warning(f"Invalid address for alarm group {alarm_config['name']}")
                        continue

                    bridge_addr = f"{addr_type}{addr}"
                    bridge_addr_length = int((addr_df['alarm_no'].max() + 1) // 16)

                    group_config = {
                        'name': 'alarm',
                        'plc': {
                            'ip_address': alarm_config['client']['ip_address'].split('/')[0],
                            'port_no': alarm_config['client']['port_no'],
                            'protocol': alarm_config['client']['plc']['protocol'].lower()
                        },
                        'bridge_data': {
                            'name': alarm_config['name'],
                            'address_type': addr_type,
                            'address': bridge_addr,
                            'address_length': bridge_addr_length,
                            'meta_data': addr_df
                        }
                    }
                    bridge_config['alarm_config']['groups'].append(group_config)
                    logger.debug(f"Added alarm group config for {alarm_config['name']}")
                    
                except Exception as e:
                    logger.error(f"Error processing alarm config: {e}")
                    raise

            logger.info("Configuration parsing completed successfully")
            return bridge_config

        except Exception as e:
            logger.error(f"Error in parse_config: {e}")
            raise

    def create_group_config(self, config: dict, config_type: str) -> dict:
        """グループ設定の作成"""
        logger.debug(f"Creating group config for type: {config_type}")
        try:
            addr_type = config.get('address_type')
            addr = config.get('address')
            
            if addr_type is None or addr is None:
                logger.warning(f"Missing address_type or address for {config_type}")
                return None

            bridge_addr = f"{addr_type}{addr}"
            bridge_addr_length = config.get('address_length', 1)

            group_config = {
                'name': config_type,
                'plc': {
                    'ip_address': config['client']['ip_address'].split('/')[0],
                    'port_no': config['client']['port_no'],
                    'protocol': config['client']['plc']['protocol'].lower()
                },
                'bridge_data': {
                    'name': config.get('name', config.get('signal_name', '')),
                    'address_type': addr_type,
                    'address': bridge_addr,
                    'address_length': bridge_addr_length,
                }
            }

            if config_type == 'logging':
                group_config['bridge_data'].update({
                    'logging_type': config['logging_type'],
                    'logging_data': [
                        {
                            'name': log_data['data_name'],
                            'address_type': log_data['address_type'],
                            'address': f"{log_data['address_type']}{log_data['address']}",
                            'address_length': log_data['address_count'],
                            'data_type': log_data['data_type']
                        } for log_data in config.get('logging_data', [])
                    ]
                })
            elif config_type == 'quality_control':
                group_config['bridge_data'].update({
                    'signal_type': config['signal_type'],
                    'signal_shot_no': config['signal_shot_number'],
                    'children': [
                        {
                            'name': child['signal_name'],
                            'signal_shot_no': child['signal_shot_number'],
                            'address_type': child['address_type'],
                            'address': f"{child['address_type']}{child['address']}",
                            'address_length': 1
                        } for child in config.get('children', [])
                    ]
                })
            elif config_type == 'efficiency':
                group_config['bridge_data'].update({
                    'class_name': config['classification']['group']['name'],
                    'meta_data': pd.json_normalize(config['classification'])
                })
            elif config_type == 'alarm':
                addr_df = pd.DataFrame(config['addresses'])
                addr_df['address_type'] = addr_df['address_type'].fillna('').astype(str)
                
                if addr_df['address_type'].eq('').all():
                    if config['client']['plc']['protocol'].lower() == 'fins':
                        addr_df['address_type'] = 'CIO'
                    else:
                        logger.warning(f"No valid address type for alarm group {config.get('name', '')}")
                        return None
                
                group_config['bridge_data'].update({
                    'meta_data': addr_df,
                    'address_length': int((addr_df['alarm_no'].max() + 1) // 16)
                })

            logger.debug(f"Successfully created group config for {config_type}")
            return group_config

        except Exception as e:
            logger.error(f"Error creating group config for {config_type}: {e}")
            raise

    def initialize_plcs(self):
        """PLCの初期化"""
        logger.info("Initializing PLCs")
        try:
            for config_type in ['logging_config', 'qc_config', 'efficiency_config', 'alarm_config']:
                if config_type in self.bridge_config:
                    for group in self.bridge_config[config_type]['groups']:
                        if group is not None:
                            plc = self.create_plc(group)
                            if plc:
                                self.plcs.append(plc)
                                logger.debug(f"Created PLC for {config_type}: {group['plc']['ip_address']}")
            
            logger.info(f"Successfully initialized {len(self.plcs)} PLCs")
        
        except Exception as e:
            logger.error(f"Error initializing PLCs: {e}")
            raise

    def create_plc(self, group: dict) -> PLCInterface:
        """PLC接続の作成"""
        try:
            protocol = group['plc']['protocol']
            logger.debug(f"Creating PLC connection for protocol: {protocol}")
            
            if protocol == 'mc':
                return MCProtocolPLC(group['plc'], group['name'], group['bridge_data'])
            elif protocol == 'fins':
                return FINSPLC(
                    group['plc'], 
                    group['name'], 
                    group['bridge_data']
                    # max_concurrent_requestsはデフォルト値を使用
                )
            else:
                logger.error(f"Unsupported protocol: {protocol}")
                raise ValueError(f"Unsupported protocol: {protocol}")
                
        except Exception as e:
            logger.error(f"Error creating PLC: {e}")
            raise

    async def process_logging(self, bridge_name: str, bridge_data: dict, data: dict, message: dict):
        """ロギングデータの処理"""
        logger.debug(f"Processing logging data for {bridge_name}")
        try:
            trigger_name = bridge_data['name']
            trigger_value = data.get(trigger_name)

            if trigger_value is not None:
                previous_value = self.previous_data[bridge_name].get(trigger_name, False)
                trigger_detected = False

                if isinstance(trigger_value, (int, list)):
                    base_addr, bit_position = self.parse_bit_address(bridge_data['address'])
                    
                    if bit_position is not None:
                        try:
                            current_bit_state = self.get_bit_state(trigger_value, bit_position)
                            previous_bit_state = self.get_bit_state(previous_value, bit_position)
                            
                            if current_bit_state and not previous_bit_state:
                                trigger_detected = True
                                logger.debug(f"Trigger detected for {trigger_name} at bit position {bit_position}")
                        except Exception as e:
                            logger.error(f"Error processing trigger bit state: {e}")
                            raise
                    else:
                        current_value = trigger_value[0] if isinstance(trigger_value, list) else trigger_value
                        previous_value = previous_value[0] if isinstance(previous_value, list) else previous_value
                        if current_value != 0 and previous_value == 0:
                            trigger_detected = True
                            logger.debug(f"Trigger detected for {trigger_name} with value change")
                else:
                    if trigger_value and not previous_value:
                        trigger_detected = True
                        logger.debug(f"Boolean trigger detected for {trigger_name}")

                if trigger_detected:
                    message['data']['logging_type'] = bridge_data['logging_type']
                    message['data']['name'] = bridge_data['name']
                    message['data']['values'] = []

                    for log_data in bridge_data['logging_data']:
                        log_name = log_data['name']
                        log_value = data.get('logging_data', [])
                        
                        for item in log_value:
                            if item['name'] == log_name:
                                message['data']['values'].append({
                                    'name': log_name,
                                    'value': item['value']
                                })
                                logger.debug(f"Added logging value for {log_name}: {item['value']}")
                                break
                        else:
                            logger.warning(f"Logging data not found for {log_name}")

                self.previous_data[bridge_name][trigger_name] = trigger_value
            else:
                logger.warning(f"Trigger data not found for {trigger_name}")

        except Exception as e:
            logger.error(f"Error in process_logging: {e}")
            raise

    async def process_quality_control(self, bridge_name: str, bridge_data: dict, data: dict, message: dict):
        """品質管理データの処理 - 立ち上がり検出のみ"""
        logger.debug(f"Processing quality control data for {bridge_name}")
        try:
            data_name = bridge_name
            parent_data_name = bridge_data['name']
            parent_current_value = data.get(parent_data_name)
            parent_add_count = bridge_data['signal_shot_no']

            parent_triggered = False
            children_data = []

            if parent_current_value is not None:
                previous_value = self.previous_data[data_name].get(parent_data_name, False)

                # 親データの処理 - 立ち上がり検出のみ
                if isinstance(parent_current_value, (int, list)):
                    base_addr, bit_position = self.parse_bit_address(bridge_data['address'])
                    
                    if bit_position is not None:
                        current_bit_state = self.get_bit_state(parent_current_value, bit_position)
                        previous_bit_state = self.get_bit_state(previous_value, bit_position)
                        
                        # 立ち上がりのみ検出
                        if current_bit_state and not previous_bit_state:
                            parent_triggered = True
                            logger.debug(f"Parent rising edge detected for {parent_data_name}")
                    else:
                        current_value = parent_current_value[0] if isinstance(parent_current_value, list) else parent_current_value
                        previous_value = previous_value[0] if isinstance(previous_value, list) else previous_value
                        # 立ち上がりのみ検出
                        if current_value != 0 and previous_value == 0:
                            parent_triggered = True
                            logger.debug(f"Parent value rising edge detected for {parent_data_name}")
                else:
                    # ブール値の場合も立ち上がりのみ
                    if parent_current_value and not previous_value:
                        parent_triggered = True
                        logger.debug(f"Parent boolean rising edge detected for {parent_data_name}")

                self.previous_data[data_name][parent_data_name] = parent_current_value

                # 子データの処理 - 親の立ち上がり時のみ子の状態を確認
                if parent_triggered and bridge_data['children']:
                    for child_data in bridge_data['children']:
                        child_data_name = child_data['name']
                        child_current_value = data.get(child_data_name)
                        child_add_count = child_data['signal_shot_no']
                        
                        if child_current_value is not None:
                            child_previous_value = self.previous_data[data_name].get(child_data_name, False)

                            child_state = False
                            if isinstance(child_current_value, (int, list)):
                                base_addr, bit_position = self.parse_bit_address(child_data['address'])
                                
                                if bit_position is not None:
                                    child_state = self.get_bit_state(child_current_value, bit_position)
                                else:
                                    child_state = bool(child_current_value[0] if isinstance(child_current_value, list) else child_current_value)
                            else:
                                child_state = bool(child_current_value)

                            children_data.append({
                                'count': child_add_count if child_state else 0,
                                'name': child_data_name
                            })

                            self.previous_data[data_name][child_data_name] = child_current_value
                        else:
                            logger.warning(f"Child data not found for {child_data_name}")

                # 親の立ち上がりが検出された場合のみメッセージを送信
                if parent_triggered:
                    message['data'][bridge_data['signal_type']] = {
                        'count': parent_add_count,
                        'name': parent_data_name,
                        'children': children_data
                    }
                    logger.debug(f"Added QC data for {parent_data_name} with {len(children_data)} children")

            else:
                logger.warning(f"Parent data not found for {parent_data_name}")

        except Exception as e:
            logger.error(f"Error in process_quality_control: {e}")
            raise

    async def process_efficiency(self, bridge_name: str, bridge_data: dict, data: dict, message: dict):
        """効率データの処理"""
        logger.debug(f"Processing efficiency data for {bridge_name}")
        try:
            data_name = bridge_name
            raw_data_name = bridge_data['name']
            current_value = data.get(raw_data_name)

            if current_value is not None:
                previous_value = self.previous_data[data_name].get(raw_data_name, False)
                
                if isinstance(current_value, bool):
                    if current_value != previous_value:
                        message['data'][bridge_data['class_name']] = {
                            'state': current_value,
                            'name': raw_data_name
                        }
                        logger.debug(f"Efficiency boolean state changed for {raw_data_name}")
                elif isinstance(current_value, (int, list)):
                    base_addr, bit_position = self.parse_bit_address(bridge_data['address'])
                    
                    if bit_position is not None:
                        current_bit_state = self.get_bit_state(current_value, bit_position)
                        previous_bit_state = self.get_bit_state(previous_value, bit_position)
                        
                        if current_bit_state != previous_bit_state:
                            message['data'][bridge_data['class_name']] = {
                                'state': current_bit_state,
                                'name': raw_data_name,
                                'bit_position': bit_position,
                                'raw_value': current_value[0] if isinstance(current_value, list) else current_value
                            }
                            logger.debug(f"Efficiency bit state changed for {raw_data_name}")
                else:
                    logger.warning(f"Unexpected data type for {data_name}: {type(current_value)}")

                self.previous_data[data_name][raw_data_name] = current_value
            else:
                logger.warning(f"Efficiency data not found for {raw_data_name}")

        except Exception as e:
            logger.error(f"Error in process_efficiency: {e}")
            raise

    async def process_alarm(self, bridge_name: str, bridge_data: dict, data: dict, message: dict):
        """アラームデータの処理"""
        logger.debug(f"Processing alarm data for {bridge_name}")
        try:
            data_name = bridge_name
            raw_data_name = bridge_data['name']
            current_value = data.get(raw_data_name)

            if current_value is not None:
                previous_value = self.previous_data[data_name].get(raw_data_name, False)
                
                if isinstance(current_value, bool):
                    if current_value != previous_value:
                        message['data'][bridge_data['class_name']] = {
                            'state': current_value,
                            'name': raw_data_name
                        }
                        logger.debug(f"Alarm boolean state changed for {raw_data_name}")
                elif isinstance(current_value, (int, list)):
                    num_words = len(current_value) if isinstance(current_value, list) else 1
                    current_bits = self.word_to_bits(current_value, num_words)
                    previous_bits = self.word_to_bits(previous_value, num_words)
                    
                    changed_bits = self.compare_bits(
                        current_bits,
                        previous_bits,
                        bridge_name,
                        bridge_data.get('meta_data')
                    )
                    
                    if changed_bits:
                        message['data'][raw_data_name] = changed_bits
                        logger.debug(f"Alarm bits changed for {raw_data_name}: {len(changed_bits)} changes")
                else:
                    logger.warning(f"Unexpected data type for {data_name}: {type(current_value)}")

                self.previous_data[data_name][raw_data_name] = current_value
            else:
                logger.warning(f"Alarm data not found for {raw_data_name}")

        except Exception as e:
            logger.error(f"Error in process_alarm: {e}")
            raise

    def parse_bit_address(self, address: str) -> tuple:
        """ビットアドレスの解析"""
        logger.debug(f"Parsing bit address: {address}")
        try:
            if '.' in address:
                base_addr, bit_pos = address.split('.')
                return base_addr, int(bit_pos)
            return address, None
        except Exception as e:
            logger.error(f"Error parsing bit address {address}: {e}")
            raise

    def get_bit_state(self, word_value: Union[int, List[int]], bit_position: int) -> bool:
        """ビット状態の取得"""
        logger.debug(f"Getting bit state for position {bit_position}")
        try:
            if not 0 <= bit_position <= 15:
                raise ValueError(f"Bit position must be between 0 and 15, got {bit_position}")
            
            if word_value and isinstance(word_value, list):
                word_int = word_value[0]
                result = bool((word_int >> bit_position) & 1)
                logger.debug(f"Bit state at position {bit_position}: {result}")
                return result
            return False
        except Exception as e:
            logger.error(f"Error getting bit state: {e}")
            raise

    def word_to_bits(self, word_data: Union[int, List[int]], num_words: int = 5) -> bitarray.bitarray:
        """ワードからビット配列への変換"""
        logger.debug(f"Converting word to bits, num_words: {num_words}")
        try:
            if not isinstance(word_data, list):
                word_data = [word_data]
            
            word_data = word_data + [0] * (num_words - len(word_data))
            
            ba = bitarray.bitarray()
            for word in word_data[:num_words]:
                ba.extend(format(word, '016b')[::-1])
            return ba
        except Exception as e:
            logger.error(f"Error converting word to bits: {e}")
            raise

    def compare_bits(self, current_bits: bitarray.bitarray, previous_bits: bitarray.bitarray,
                    bridge_name: str, meta_data: Optional[pd.DataFrame] = None) -> Dict[int, dict]:
        """ビット状態の比較"""
        logger.debug(f"Comparing bits for {bridge_name}")
        try:
            changed_bits = {}
            diff = current_bits ^ previous_bits
            
            for i in range(len(diff)):
                if diff[i]:
                    state = bool(current_bits[i])
                    comments = self.generate_comments(i, bridge_name, meta_data)
                    changed_bits[i] = {'state': state, 'comment': comments}
                    logger.debug(f"Bit {i} changed to {state}")
            
            return changed_bits
        except Exception as e:
            logger.error(f"Error comparing bits: {e}")
            raise

    def generate_comments(self, bit_index: int, bridge_name: str,
                         meta_data: Optional[pd.DataFrame] = None) -> List[str]:
        """コメントの生成"""
        logger.debug(f"Generating comments for bit {bit_index}")
        try:
            comments = []
            if meta_data is not None:
                min_alarm_no = meta_data['alarm_no'].min()
                adjusted_bit_index = bit_index if min_alarm_no == 0 else bit_index + 1
                matching_rows = meta_data[meta_data['alarm_no'] == adjusted_bit_index]
                
                if not matching_rows.empty:
                    comments = matching_rows['comments'].values[0]
                else:
                    logger.debug(f"No matching comments found for bit {bit_index}")
                    comments = []

            return comments
        except Exception as e:
            logger.error(f"Error generating comments: {e}")
            raise

    async def run(self):
        """メインの実行ループ"""
        logger.info("Starting PLCBridge main loop")
        try:
            await self.start_websocket_servers()
            
            self.scan_time_thread = threading.Thread(
                target=self.scan_time_thread_function,
                daemon=True
            )
            self.scan_time_thread.start()
            
            while not self._cleanup_event.is_set():
                start_time = time.time()
                
                try:
                    # PLCタスクの実行
                    plc_tasks = [self.process_plc(plc) for plc in self.plcs]
                    if plc_tasks:
                        await asyncio.gather(*plc_tasks, return_exceptions=True)
                    
                    # 実行時間の記録と管理
                    execution_time = time.time() - start_time
                    self.execution_times.append(execution_time)
                    self.manage_execution_times()
                    
                    # リソース使用状況のログ出力（定期的に）
                    if len(self.execution_times) % 100 == 0:
                        self.resource_tracker.log_status()
                        logger.info(f"Average execution time: {np.mean(self.execution_times[-100:]):.3f}s")

                    # 適切な待機時間の計算と待機
                    sleep_time = max(0.001, 0.1 - execution_time)
                    await asyncio.sleep(sleep_time)
                    
                except asyncio.CancelledError:
                    logger.info("PLCBridge run loop cancelled")
                    break
                except Exception as e:
                    logger.error(f"Error in main loop iteration: {e}")
                    self.stats['error_count'] += 1
                    self.stats['last_error_time'] = datetime.now().isoformat()
                    await asyncio.sleep(1)  # エラー時は少し待機

        except asyncio.CancelledError:
            logger.info("PLCBridge main loop cancelled")
        except Exception as e:
            logger.error(f"Fatal error in PLCBridge run loop: {e}")
        finally:
            await self.cleanup()

    async def cleanup(self):
        """リソースのクリーンアップ処理"""
        logger.info("Starting cleanup process")
        
        try:
            # スキャンタイムスレッドの停止
            self.stop_scan_time_thread.set()
            if self.scan_time_thread and self.scan_time_thread.is_alive():
                logger.debug("Waiting for scan time thread to finish")
                self.scan_time_thread.join(timeout=5)
                if self.scan_time_thread.is_alive():
                    logger.warning("Scan time thread did not finish within timeout")
            
            # WebSocketサーバーの停止
            for server_name, server in [
                ("config", self.config_server),
                ("data", self.data_server),
                ("scan_time", self.scan_time_server)
            ]:
                if server:
                    logger.debug(f"Closing {server_name} WebSocket server")
                    server.close()
                    await server.wait_closed()
                    logger.debug(f"{server_name} WebSocket server closed")
            
            # アクティブなWebSocketタスクのキャンセル
            if self._websocket_tasks:
                logger.debug(f"Cancelling {len(self._websocket_tasks)} WebSocket tasks")
                for task in self._websocket_tasks:
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        pass
                    except Exception as e:
                        logger.error(f"Error cancelling WebSocket task: {e}")
            
            # PLCコネクションのクリーンアップ
            for plc in self.plcs:
                try:
                    logger.debug(f"Closing PLC connection: {plc.connection_id}")
                    await plc.close()
                    logger.debug(f"PLC connection closed: {plc.connection_id}")
                except Exception as e:
                    logger.error(f"Error closing PLC connection {plc.connection_id}: {e}")
            
            # データ構造のクリーンアップ
            self.plcs.clear()
            self.execution_times.clear()
            self.previous_data.clear()
            self.previous_trigger_states.clear()
            
            # 最終的な統計情報の出力
            logger.info("Final statistics:")
            logger.info(f"Total reads: {self.stats['total_reads']}")
            logger.info(f"Successful reads: {self.stats['successful_reads']}")
            logger.info(f"Failed reads: {self.stats['failed_reads']}")
            logger.info(f"Total messages sent: {self.stats['total_messages_sent']}")
            logger.info(f"Total errors: {self.stats['error_count']}")
            
            if self.stats['last_error_time']:
                logger.info(f"Last error time: {self.stats['last_error_time']}")
            
            logger.info("Cleanup completed successfully")
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
            raise

async def main():
    """メイン関数"""
    """
    # ロガーの設定
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(
                f'plc_bridge_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'
            )
        ]
    )
    
    logger.info("Starting PLC Bridge application")"""
    bridge = None
    
    try:
        bridge = PLCBridge()
        await bridge.run()
        
    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
    except Exception as e:
        logger.critical(f"Fatal error in main: {e}", exc_info=True)
        print(f"ERROR: {e}", flush=True)
        sys.stdout.flush()
    finally:
        if bridge:
            try:
                await bridge.cleanup()
            except Exception as e:
                logger.error(f"Error during final cleanup: {e}")
        
        logger.info("Application shutdown complete")

if __name__ == "__main__":
    # アプリケーション起動直後に出力
    print("PLC-Bridge starting...", flush=True)
    sys.stdout.flush()
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Application terminated by user")
    except Exception as e:
        logger.critical(f"Fatal error: {e}", exc_info=True)
    finally:
        # 最終的なクリーンアップ処理
        print("PLC-Bridge shutting down...", flush=True)
        sys.stdout.flush()
        logging.shutdown()