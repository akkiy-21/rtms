# fins.py
from datetime import datetime
from typing import List, Union, Tuple, Optional, Dict
from socket import socket, AF_INET, SOCK_DGRAM, SOL_SOCKET, SO_RCVBUF
import struct
import re
import asyncio
from collections import defaultdict
import logging
from asyncio import Queue, Lock, Event
from contextlib import asynccontextmanager

# 定数定義
BUFSIZE = 8192

# ロガー設定（main.pyで一元管理）
logger = logging.getLogger('PLCBridge')

class GlobalSIDManager:
    """グローバルSID管理クラス"""
    _instance = None
    _lock = Lock()
    _sid_counter = 0
    _active_sids: Dict[int, datetime] = {}
    _cleanup_task = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GlobalSIDManager, cls).__new__(cls)
            cls._cleanup_task = asyncio.create_task(cls._instance._cleanup_loop())
        return cls._instance

    async def get_next_sid(self) -> int:
        """
        次の利用可能なSIDを取得
        
        Returns:
            int: 一意のSID (0-255)
        """
        async with self._lock:
            # 使用済みでないSIDを見つけるまで検索
            for _ in range(256):
                self._sid_counter = (self._sid_counter + 1) % 256
                
                # 0は避ける（特別な意味を持つ可能性があるため）
                if self._sid_counter == 0:
                    self._sid_counter = 1
                    
                # このSIDが使用中でないことを確認
                if self._sid_counter not in self._active_sids:
                    self._active_sids[self._sid_counter] = datetime.now()
                    logger.debug(f"Assigned new SID: {self._sid_counter}")
                    return self._sid_counter
                    
            logger.error("No available SIDs found")
            raise RuntimeError("No available SIDs")

    async def release_sid(self, sid: int):
        """
        使用済みSIDの解放
        
        Args:
            sid: 解放するSID
        """
        async with self._lock:
            if sid in self._active_sids:
                del self._active_sids[sid]
                logger.debug(f"Released SID: {sid}")

    async def _cleanup_loop(self):
        """
        古いSIDのクリーンアップループ
        30秒以上経過したSIDを自動的に解放
        """
        while True:
            try:
                await asyncio.sleep(30)
                current_time = datetime.now()
                
                async with self._lock:
                    expired_sids = [
                        sid for sid, timestamp in self._active_sids.items()
                        if (current_time - timestamp).total_seconds() > 30
                    ]
                    
                    for sid in expired_sids:
                        del self._active_sids[sid]
                        logger.info(f"Auto-cleaned expired SID: {sid}")
                        
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in SID cleanup loop: {e}")

    async def stop(self):
        """クリーンアップタスクの停止"""
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
            self._cleanup_task = None

class FinsError(Exception):
    """FINS関連エラーの基底クラス"""
    pass

class FinsResponseError(FinsError):
    """FINSレスポンスエラー"""
    ERROR_CODES = {
        "0101": "Local node not in network (自ノード ネットワーク未加入)",
        "0102": "Token timeout (トークン タイムアウト)",
        "0103": "Retries failed (再送オーバー)",
        "0104": "Too many send frames (送信許可フレーム数オーバー)",
        "0105": "Node address range error (ノードアドレス設定範囲エラー)",
        "0106": "Node address duplication (ノードアドレス二重設定エラー)",
    }

    def __init__(self, end_code: bytes):
        self.end_code = end_code.hex()
        self.message = f"FINS ERROR {self.end_code}: {self.ERROR_CODES.get(self.end_code, 'Unknown error')}"

    def __str__(self):
        return self.message

class ConnectionPool:
    """FINSプロトコル用コネクションプール"""
    def __init__(self):
        self._connections: Dict[str, socket] = {}
        self._lock = Lock()
        self._command_queues: Dict[str, Queue] = defaultdict(Queue)
        self._receive_tasks: Dict[str, asyncio.Task] = {}
        self._connection_status: Dict[str, bool] = {}
        logger.info("Connection pool initialized")

    async def get_connection(self, ip_address: str, port: int = 9600) -> Tuple[socket, str]:
        """接続の取得または新規作成"""
        connection_key = f"{ip_address}:{port}"
        
        async with self._lock:
            if connection_key not in self._connections:
                logger.debug(f"Creating new connection for {connection_key}")
                sock = socket(AF_INET, SOCK_DGRAM)
                sock.settimeout(5.0)

                # 受信バッファを256KBに設定
                sock.setsockopt(SOL_SOCKET, SO_RCVBUF, 262144)

                self._connections[connection_key] = sock
                self._connection_status[connection_key] = True
                
                # 受信ループタスクの作成
                self._receive_tasks[connection_key] = asyncio.create_task(
                    self._receive_loop(connection_key, sock)
                )
                logger.debug(f"Created new connection and receive task for {connection_key}")
            
            return self._connections[connection_key], connection_key

    async def _receive_loop(self, connection_key: str, sock: socket):
        """応答受信ループ"""
        logger.debug(f"Starting receive loop for {connection_key}")
        
        try:
            while self._connection_status.get(connection_key, False):
                try:
                    response = await asyncio.get_event_loop().run_in_executor(
                        None, sock.recv, BUFSIZE
                    )
                    # 1バイトごとにスペースを追加して16進数でログ出力
                    logger.debug(f"Recived: " + ' '.join(f'{x:02X}' for x in response))

                    
                    if len(response) >= 10:
                        sid = response[9]
                        queue_key = f"{connection_key}_{sid}"
                        
                        if queue_key in self._command_queues:
                            await self._command_queues[queue_key].put(response)
                            logger.debug(f"Received response for {queue_key}")
                            
                except asyncio.CancelledError:
                    logger.debug(f"Receive loop cancelled for {connection_key}")
                    break
                except Exception as e:
                    if self._connection_status.get(connection_key, False):
                        logger.error(f"Receive error on {connection_key}: {e}")
                    await asyncio.sleep(0.1)
                    
        finally:
            logger.debug(f"Receive loop stopped for {connection_key}")

    async def close_connection(self, connection_key: str):
        """個別の接続クローズ"""
        async with self._lock:
            if connection_key in self._connections:
                logger.debug(f"Closing connection {connection_key}")
                
                # ステータスを更新して受信ループを停止
                self._connection_status[connection_key] = False
                
                # 受信タスクのキャンセルと待機
                if connection_key in self._receive_tasks:
                    task = self._receive_tasks[connection_key]
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        pass
                    del self._receive_tasks[connection_key]
                
                # ソケットのクローズ
                sock = self._connections[connection_key]
                try:
                    sock.close()
                except Exception as e:
                    logger.error(f"Error closing socket for {connection_key}: {e}")
                
                del self._connections[connection_key]
                
                # 関連するキューのクリーンアップ
                keys_to_remove = [
                    k for k in self._command_queues.keys() 
                    if k.startswith(f"{connection_key}_")
                ]
                for key in keys_to_remove:
                    del self._command_queues[key]
                
                logger.info(f"Connection {connection_key} closed")

    async def close_all(self):
        """全接続のクローズ"""
        logger.info("Closing all connections")
        async with self._lock:
            connection_keys = list(self._connections.keys())
            for connection_key in connection_keys:
                await self.close_connection(connection_key)
        
        self._connections.clear()
        self._receive_tasks.clear()
        self._command_queues.clear()
        self._connection_status.clear()
        logger.info("All connections closed")



class MemoryAddress:
    """メモリアドレス管理クラス"""
    MEMORY_AREAS = {
        'D': 0x82,    # Data Memory
        'E': 0xA0,    # Extended Memory
        'CIO': 0xB0,  # CIO Area
        'W': 0xB1,    # Work Area
        'H': 0xB2     # Holding Area
    }

    def __init__(self, address: str):
        match = re.match(r'([A-Za-z]+)(\d+)(?:\.(\d+))?', address)
        if not match:
            raise ValueError(f"Invalid address format: {address}")

        self.area_name = match.group(1)
        self.word_addr = int(match.group(2))
        self.bit_addr = int(match.group(3)) if match.group(3) else 0

        if self.area_name not in self.MEMORY_AREAS:
            raise ValueError(f"Invalid memory area: {self.area_name}")

    def get_area_code(self) -> int:
        """メモリエリアコードの取得"""
        if self.area_name == 'E':
            bank = self.word_addr // 10000
            return self.MEMORY_AREAS['E'] + bank
        return self.MEMORY_AREAS[self.area_name]

    def get_address_bytes(self, offset: int = 0) -> List[int]:
        """アドレスバイトの取得"""
        word_addr = self.word_addr + offset
        if self.area_name == 'E':
            word_addr %= 10000
        
        return list(word_addr.to_bytes(2, 'big')) + [self.bit_addr]

class CommandBuilder:
    """FINSコマンドビルダー"""
    def __init__(self, node_info: Tuple[int, int]):
        self.dna_node = node_info[0]
        self.sa1_node = node_info[1]
    
    def create_header(self, sid: int) -> bytes:
        """FINSヘッダーの作成"""
        return bytes([
            0x80, 0x00, 0x02,
            0x00, self.dna_node, 0x00,
            0x00, self.sa1_node, 0x00,
            sid
        ])

    def create_read_command(self, memory_addr: MemoryAddress, read_size: int, sid: int) -> bytes:
        """読み出しコマンドの作成"""
        header = self.create_header(sid)
        area_code = memory_addr.get_area_code()
        addr_bytes = memory_addr.get_address_bytes()
        
        return header + bytes([
            0x01, 0x01,
            area_code,
            *addr_bytes,
            *read_size.to_bytes(2, 'big')
        ])

    def create_write_command(self, memory_addr: MemoryAddress, data: bytes, sid: int) -> bytes:
        """書き込みコマンドの作成"""
        header = self.create_header(sid)
        area_code = memory_addr.get_area_code()
        addr_bytes = memory_addr.get_address_bytes()
        
        return header + bytes([
            0x01, 0x02,
            area_code,
            *addr_bytes,
            *len(data).to_bytes(2, 'big')
        ]) + data

    @staticmethod
    def create_test_command(node_info: Tuple[int, int], sid: int) -> bytes:
        """テストコマンドの作成"""
        return bytes([
            0x80, 0x00, 0x02,
            node_info[0],
            node_info[1],
            sid,
            0x01, 0x01, 0xB0, 0x00, 0x00, 0x00, 0x00, 0x01
        ])

class Fins:
    """FINSプロトコル通信クラス"""
    _connection_pool = ConnectionPool()

    def __init__(self, host: str, dna_fins_adr: int = 1, sa1_fins_adr: int = 254, max_concurrent_requests: int = 1):
        """
        初期化
        
        Args:
            host: PLC IPアドレス
            dna_fins_adr: 宛先FINSアドレス
            sa1_fins_adr: 送信元FINSアドレス
        """
        self.ip_address = host.split('/')[0]
        self.port = 9600
        
        # FINSノード設定
        self.dna_fins = dna_fins_adr
        self.sa1_fins = sa1_fins_adr
        
        # SID管理をグローバルマネージャーに置き換え
        self._sid_manager = GlobalSIDManager()
        
        # 通信管理
        self._command_builder = CommandBuilder(
            (self.dna_fins, self.sa1_fins)
        )
        
        # 状態管理
        self._running = False
        self._connecting = False
        self._connection_event = Event()
        
        # タイムアウト設定
        self._connection_timeout = 5.0
        self._command_timeout = 1.5
        self._retry_count = 3
        self._retry_interval = 0.005

        # 同時実行制限用のセマフォ
        self._request_semaphore = asyncio.Semaphore(max_concurrent_requests)
        self._max_concurrent_requests = max_concurrent_requests
        
        logger.info(f"FINS initialized for {self.ip_address}")

    async def _get_next_sid(self) -> int:
        """グローバルマネージャーから次のSIDを取得"""
        return await self._sid_manager.get_next_sid()

    async def ensure_connection(self):
        """接続確立を保証"""
        if self._connecting:
            await self._connection_event.wait()
            if not self._running:
                raise FinsError("Connection failed")
            return
        
        if self._running:
            return

        try:
            self._connecting = True
            self._connection_event.clear()
            
            for attempt in range(self._retry_count):
                try:
                    sock, connection_key = await self._connection_pool.get_connection(
                        self.ip_address, self.port
                    )
                    
                    # 接続テスト
                    if await self._test_connection(sock, connection_key):
                        self._running = True
                        logger.info(f"Connected to FINS device at {self.ip_address}")
                        return
                    
                except Exception as e:
                    logger.warning(f"Connection attempt {attempt + 1} failed: {e}")
                    if attempt < self._retry_count - 1:
                        await asyncio.sleep(self._retry_interval)
                    else:
                        raise FinsError(f"Failed to connect after {self._retry_count} attempts")
            
        finally:
            self._connecting = False
            self._connection_event.set()

    async def _test_connection(self, sock: socket, connection_key: str) -> bool:
        """接続テスト実行"""
        try:
            sid = await self._get_next_sid()
            command = self._command_builder.create_test_command(
                (self.dest_fins, self.src_fins, "0"),
                sid
            )
            
            queue_key = f"{connection_key}_{sid}"
            
            await asyncio.get_event_loop().run_in_executor(
                None, sock.sendto, command, (self.ip_address, self.port)
            )
            
            try:
                response = await asyncio.wait_for(
                    self._connection_pool._command_queues[queue_key].get(),
                    timeout=self._connection_timeout
                )
                
                return (
                    len(response) >= 14 and
                    response[12] == 0 and
                    response[13] == 0
                )
                
            except asyncio.TimeoutError:
                logger.warning("Connection test timeout")
                return False
                
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False
        finally:
            await self._sid_manager.release_sid(sid)

    async def _send_command(
        self,
        command: bytes,
        timeout: Optional[float] = None
    ) -> bytes:
        """
        コマンド送信と応答待機
        
        Args:
            command: 送信コマンド
            timeout: タイムアウト時間（省略時はデフォルト値を使用）
        
        Returns:
            bytes: 応答データ
        
        Raises:
            FinsError: 通信エラー発生時
        """
        if timeout is None:
            timeout = self._command_timeout

        async with self._request_semaphore:  # セマフォによる同時実行制限
            if not self._running:
                await self.ensure_connection()

            sock, connection_key = await self._connection_pool.get_connection(
                self.ip_address, self.port
            )
            
            sid = command[9]
            queue_key = f"{connection_key}_{sid}"

            try:
                for attempt in range(self._retry_count):
                    try:
                        # コマンド送信
                        await asyncio.get_event_loop().run_in_executor(
                            None, sock.sendto, command, (self.ip_address, self.port)
                        )
                        logger.debug(f"Command sent with SID {sid}")
                        # commandを1バイト毎16進数表示し、バイト毎にスペースを挟んでログ出力
                        logger.debug(f"send: " + ' '.join(f'{x:02X}' for x in command))
                        
                        # 応答待機
                        response = await asyncio.wait_for(
                            self._connection_pool._command_queues[queue_key].get(),
                            timeout=timeout
                        )
                        
                        if len(response) >= 14:
                            if response[12] == 0 and response[13] == 0:
                                logger.debug(f"Received successful response for SID {sid}")
                                return response
                            else:
                                logger.error(f"Received error response: {response[12:14].hex()}")
                                raise FinsResponseError(response[12:14])
                        else:
                            logger.warning(f"Received invalid response length: {len(response)}")
                            raise FinsError("Invalid response length")
                            
                    except asyncio.TimeoutError:
                        logger.warning(f"Command timeout, attempt {attempt + 1}")
                        if attempt < self._retry_count - 1:
                            await asyncio.sleep(self._retry_interval)
                            continue
                        raise FinsError("Command timeout after retries")
                        
                    except Exception as e:
                        logger.error(f"Command error: {e}")
                        if attempt < self._retry_count - 1:
                            await asyncio.sleep(self._retry_interval)
                            continue
                        raise
                        
                raise FinsError("Command failed after all retries")
                
            finally:
                # SIDの解放
                await self._sid_manager.release_sid(sid)
                # キューのクリーンアップ
                if queue_key in self._connection_pool._command_queues:
                    while not self._connection_pool._command_queues[queue_key].empty():
                        try:
                            await self._connection_pool._command_queues[queue_key].get_nowait()
                        except asyncio.QueueEmpty:
                            break



    async def read(self, memaddr: str, readsize: int) -> bytes:
        """
        メモリ領域の読み出し
        
        Args:
            memaddr: メモリアドレス (例: "D100", "CIO0.1")
            readsize: 読み出しサイズ (ワード単位)
        
        Returns:
            bytes: 読み出しデータ
        """
        try:
            data = bytearray()
            memory_addr = MemoryAddress(memaddr)
            max_size = 990  # 1回の読み出し最大サイズ

            for offset in range(0, readsize, max_size):
                size = min(max_size, readsize - offset)
                if size <= 0:
                    break

                sid = await self._get_next_sid()
                command = self._command_builder.create_read_command(
                    memory_addr,
                    size,
                    sid
                )

                try:
                    response = await self._send_command(command)
                    if response and len(response) >= 14:
                        data.extend(response[14:])
                        logger.debug(f"Read {len(response[14:])} bytes from {memaddr}")
                    else:
                        logger.warning(f"Invalid response length for {memaddr}")
                        raise FinsError("Invalid response length")

                except Exception as e:
                    logger.error(f"Error reading data chunk from {memaddr}: {e}")
                    raise FinsError(f"Read chunk operation failed: {e}")

            return bytes(data)

        except Exception as e:
            logger.error(f"Read error for address {memaddr}: {e}")
            self._running = False
            raise FinsError(f"Read operation failed: {e}")

    async def write(self, memaddr: str, writedata: bytes) -> None:
        """
        メモリ領域への書き込み
        
        Args:
            memaddr: メモリアドレス (例: "D100", "CIO0.1")
            writedata: 書き込みデータ
        """
        if len(writedata) % 2 != 0:
            raise ValueError("Write data length must be even")

        try:
            memory_addr = MemoryAddress(memaddr)
            max_size = 990  # 1回の書き込み最大サイズ
            
            for offset in range(0, len(writedata), max_size * 2):
                size = min(max_size * 2, len(writedata) - offset)
                if size <= 0:
                    break

                sid = await self._get_next_sid()
                command = self._command_builder.create_write_command(
                    memory_addr,
                    writedata[offset:offset + size],
                    sid
                )

                await self._send_command(command)
                logger.debug(f"Wrote {size} bytes to {memaddr}")

        except Exception as e:
            logger.error(f"Write error for address {memaddr}: {e}")
            self._running = False
            raise FinsError(f"Write operation failed: {e}")

    async def stop(self):
        """通信の終了とリソースのクリーンアップ"""
        self._running = False
        await self._sid_manager.stop()
        await self._connection_pool.close_all()
        logger.info(f"FINS connection closed for {self.ip_address}")

    # データ型変換メソッド
    @staticmethod
    def to_bin(data: bytes) -> bool:
        """バイナリデータをブール値に変換"""
        try:
            int_value = int.from_bytes(data, 'big')
            return bool(int_value & 1)
        except Exception as e:
            logger.error(f"Binary conversion error: {e}")
            raise ValueError(f"Failed to convert data to binary: {e}")

    @staticmethod
    def word_to_bin(data: bytes) -> str:
        """ワードデータをバイナリ文字列に変換"""
        try:
            size = len(data) * 8
            return format(int.from_bytes(data, 'big'), f'0{size}b')
        except Exception as e:
            logger.error(f"Word to binary conversion error: {e}")
            raise ValueError(f"Failed to convert word to binary: {e}")

    @staticmethod
    def to_int16(data: bytes) -> List[int]:
        """データを16ビット整数のリストに変換"""
        try:
            return [struct.unpack('>h', data[i:i+2])[0] for i in range(0, len(data), 2)]
        except Exception as e:
            logger.error(f"INT16 conversion error: {e}")
            raise ValueError(f"Failed to convert data to INT16: {e}")

    @staticmethod
    def to_uint16(data: bytes) -> List[int]:
        """データを符号なし16ビット整数のリストに変換"""
        try:
            return [struct.unpack('>H', data[i:i+2])[0] for i in range(0, len(data), 2)]
        except Exception as e:
            logger.error(f"UINT16 conversion error: {e}")
            raise ValueError(f"Failed to convert data to UINT16: {e}")

    @staticmethod
    def to_int32(data: bytes) -> List[int]:
        """データを32ビット整数のリストに変換"""
        try:
            return [struct.unpack('>i', data[i+2:i+4] + data[i:i+2])[0] 
                   for i in range(0, len(data), 4)]
        except Exception as e:
            logger.error(f"INT32 conversion error: {e}")
            raise ValueError(f"Failed to convert data to INT32: {e}")

    @staticmethod
    def to_uint32(data: bytes) -> List[int]:
        """データを符号なし32ビット整数のリストに変換"""
        try:
            return [struct.unpack('>I', data[i+2:i+4] + data[i:i+2])[0] 
                   for i in range(0, len(data), 4)]
        except Exception as e:
            logger.error(f"UINT32 conversion error: {e}")
            raise ValueError(f"Failed to convert data to UINT32: {e}")

    @staticmethod
    def to_float(data: bytes) -> List[float]:
        """データを単精度浮動小数点数のリストに変換"""
        try:
            return [struct.unpack('>f', data[i+2:i+4] + data[i:i+2])[0] 
                   for i in range(0, len(data), 4)]
        except Exception as e:
            logger.error(f"Float conversion error: {e}")
            raise ValueError(f"Failed to convert data to float: {e}")

    @staticmethod
    def to_double(data: bytes) -> List[float]:
        """データを倍精度浮動小数点数のリストに変換"""
        try:
            return [struct.unpack('>d', 
                    data[i+6:i+8] + data[i+4:i+6] + 
                    data[i+2:i+4] + data[i:i+2])[0] 
                    for i in range(0, len(data), 8)]
        except Exception as e:
            logger.error(f"Double conversion error: {e}")
            raise ValueError(f"Failed to convert data to double: {e}")

    @staticmethod
    def to_string(data: bytes) -> str:
        """データをUTF-8文字列に変換"""
        try:
            return data.decode("utf-8").rstrip('\x00')
        except Exception as e:
            logger.error(f"String conversion error: {e}")
            raise ValueError(f"Failed to convert data to string: {e}")

async def test_fins_communication(host: str):
    """FINSプロトコル通信のテスト"""
    fins = None
    try:
        logger.info(f"Starting FINS communication test with {host}")
        fins = Fins(host)
        
        # 接続テスト
        await fins.ensure_connection()
        logger.info("Connection established successfully")

        # メモリ読み出しテスト
        test_addresses = [
            ('CIO4700.0', 1),
            ('W0', 2),
            ('D100', 10)
        ]

        for addr, size in test_addresses:
            try:
                logger.info(f"Testing read from {addr} with size {size}")
                data = await fins.read(addr, size)
                logger.info(f"Successfully read {len(data)} bytes from {addr}")
                
                # データ変換テスト
                logger.info(f"Binary value: {fins.to_bin(data)}")
                logger.info(f"Word binary: {fins.word_to_bin(data)}")
                
                if len(data) >= 2:
                    logger.info(f"UINT16: {fins.to_uint16(data[:2])}")
                if len(data) >= 4:
                    logger.info(f"UINT32: {fins.to_uint32(data[:4])}")
                    logger.info(f"Float: {fins.to_float(data[:4])}")
                if len(data) >= 8:
                    logger.info(f"Double: {fins.to_double(data[:8])}")
                
            except Exception as e:
                logger.error(f"Error testing address {addr}: {e}")

    except Exception as e:
        logger.error(f"Test failed: {e}")
    finally:
        if fins:
            await fins.stop()
        logger.info("Test completed")

if __name__ == "__main__":
    # ロギング設定
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(f'fins_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
        ]
    )

    try:
        asyncio.run(test_fins_communication('192.168.0.1'))
    except KeyboardInterrupt:
        logger.info("Test interrupted by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
    finally:
        logging.shutdown()