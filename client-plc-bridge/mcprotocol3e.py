# mcprotcol3e.py
from socket import *
import struct
import logging
from typing import Tuple, List, Union, Optional
from datetime import datetime
import asyncio
from asyncio import Lock, Queue
from collections import defaultdict

# ロガー設定（main.pyで一元管理）
logger = logging.getLogger('PLCBridge')

BUFSIZE = 8192

class MCProtocolError(Exception):
    """MCプロトコル関連エラーの基底クラス"""
    pass

class MCProtocolResponseError(MCProtocolError):
    """MCプロトコルレスポンスエラー"""
    ERROR_CODES = {
        0x0C03: "プロトコルコードエラー",
        0x0C04: "CPU監視タイマーエラー",
        0x0C0B: "コマンド処理エラー",
        0x0C10: "CPU異常エラー",
        0x0C20: "コマンドエラー",
        0x0C24: "リクエストデータ長エラー",
        0x0C28: "要求データエラー",
    }

    def __init__(self, end_code: int):
        self.end_code = end_code
        self.message = f"MC Protocol ERROR {hex(end_code)}: {self.ERROR_CODES.get(end_code, '不明なエラー')}"

    def __str__(self):
        return self.message

class MCProtocolDataError(MCProtocolError):
    """データ変換エラー"""
    pass

class MCProtocol3E:
    DEVICE_CODES = {
        'TS': 0xC1, 'TC': 0xC0, 'TN': 0xC2, 'SS': 0xC7, 'SC': 0xC6, 'SN': 0xC8,
        'CS': 0xC4, 'CC': 0xC3, 'CN': 0xC5, 'SB': 0xA1, 'SW': 0xB5, 'DX': 0xA2,
        'DY': 0xA3, 'SM': 0x91, 'SD': 0xA9, 'X': 0x9C, 'Y': 0x9D, 'M': 0x90,
        'L': 0x92, 'F': 0x93, 'V': 0x94, 'B': 0xA0, 'D': 0xA8, 'W': 0xB4, 'S': 0x98
    }

    def __init__(self, host: str, port: int, max_concurrent_requests: int = 30):
        """
        初期化
        
        Args:
            host: PLC IPアドレス
            port: ポート番号
            max_concurrent_requests: 最大同時リクエスト数
        """
        self.addr = (host, port)
        self._command_queues = defaultdict(Queue)
        self._command_lock = Lock()
        self._socket: Optional[socket] = None
        self._request_semaphore = asyncio.Semaphore(max_concurrent_requests)
        self._timeout = 3.0
        self._retry_count = 3
        self._retry_interval = 0.1
        
        self.connection_id = f"MC_{host}:{port}"
        logger.info(f"Initialized MCProtocol3E connection: {self.connection_id}")

    def offset(self, adr: str) -> Tuple[int, List[int]]:
        """アドレスのオフセット計算"""
        try:
            moffset = [0] * 3
            mtype = adr[:2]

            if mtype in ['SB', 'SW', 'DX', 'DY']:
                address = int(adr[2:], 16)
            elif mtype in self.DEVICE_CODES:
                address = int(adr[2:])
            else:
                mtype = adr[:1]
                base_addr = adr[1:].split('.')[0]
                address = int(base_addr, 16) if mtype in ['X', 'Y', 'B', 'W'] else int(base_addr)

            moffset = list((address).to_bytes(3, 'little'))
            deviceCode = self.DEVICE_CODES.get(mtype, 0)
            if deviceCode == 0:
                raise MCProtocolError(f"Invalid device type: {mtype}")

            return deviceCode, moffset
            
        except Exception as e:
            logger.error(f"Error calculating offset for address {adr}: {e}")
            raise MCProtocolError(f"Offset calculation failed: {e}")

    def mcpheader(self, cmd: bytearray) -> bytearray:
        """MCプロトコルヘッダーの作成"""
        try:
            if not isinstance(cmd, bytearray):
                raise MCProtocolError(f"Invalid command type: {type(cmd)}")

            ary = bytearray(11)
            requestdatalength = struct.pack("<H", len(cmd) + 2)

            ary[0:2] = b'\x50\x00'
            ary[2:7] = b'\x00\xFF\xFF\x03\x00'
            ary[7:9] = requestdatalength
            ary[9:11] = b'\x10\x00'

            return ary
            
        except Exception as e:
            logger.error(f"Error creating MC protocol header: {e}")
            raise MCProtocolError(f"Header creation failed: {e}")

    async def _ensure_connection(self):
        """ソケット接続の確保"""
        if self._socket is None:
            try:
                self._socket = socket(AF_INET, SOCK_DGRAM)
                self._socket.settimeout(self._timeout)
                # 受信バッファを256KBに設定
                self._socket.setsockopt(SOL_SOCKET, SO_RCVBUF, 262144)
                logger.info(f"Created new socket connection for {self.connection_id}")
            except Exception as e:
                logger.error(f"Error creating socket for {self.connection_id}: {e}")
                raise MCProtocolError(f"Socket creation failed: {e}")

    async def _send_and_receive(self, senddata: bytes) -> Optional[bytes]:
        """データ送受信の実行"""
        async with self._command_lock:
            try:
                if not isinstance(senddata, (bytes, bytearray)):
                    raise MCProtocolError(f"Invalid send data type: {type(senddata)}")

                await self._ensure_connection()
                
                for attempt in range(self._retry_count):
                    try:
                        # 送信データを1バイトごとに16進数表示してログ出力
                        logger.debug(f"Sending: " + ' '.join(f'{x:02X}' for x in senddata))
                        
                        await asyncio.get_event_loop().run_in_executor(
                            None, 
                            self._socket.sendto,
                            senddata,
                            self.addr
                        )

                        response = await asyncio.get_event_loop().run_in_executor(
                            None,
                            self._socket.recv,
                            BUFSIZE
                        )
                        
                        # 受信データを1バイトごとに16進数表示してログ出力
                        logger.debug(f"Received: " + ' '.join(f'{x:02X}' for x in response))

                        if len(response) >= 11:
                            end_code = response[9] << 8 | response[10]
                            if end_code == 0:
                                return response[11:]
                            else:
                                raise MCProtocolResponseError(end_code)
                        else:
                            logger.warning(f"Invalid response length: {len(response)}")
                            raise MCProtocolError("Invalid response length")

                    except (TimeoutError, OSError) as e:
                        logger.warning(f"Communication attempt {attempt + 1} failed: {e}")
                        if attempt < self._retry_count - 1:
                            await asyncio.sleep(self._retry_interval)
                        else:
                            raise MCProtocolError(f"Communication failed after {self._retry_count} attempts")

                raise MCProtocolError("All communication attempts failed")

            except Exception as e:
                logger.error(f"Error in send_and_receive for {self.connection_id}: {e}")
                self._cleanup()
                raise

    def _cleanup(self):
        """ソケットのクリーンアップ"""
        if self._socket:
            try:
                self._socket.close()
                logger.debug(f"Closed socket for {self.connection_id}")
            except Exception as e:
                logger.error(f"Error closing socket for {self.connection_id}: {e}")
            finally:
                self._socket = None

    async def read(self, memaddr: str, readsize: int, unitOfBit: bool = False) -> Optional[bytes]:
        """
        メモリ領域の読み出し
        
        Args:
            memaddr: メモリアドレス (例: "D100", "M0")
            readsize: 読み出しサイズ
            unitOfBit: ビット単位の読み出しフラグ
            
        Returns:
            Optional[bytes]: 読み出しデータ
        """
        async with self._request_semaphore:
            try:
                if not isinstance(memaddr, str):
                    raise MCProtocolError(f"Invalid memory address type: {type(memaddr)}")
                if not isinstance(readsize, int) or readsize <= 0:
                    raise MCProtocolError(f"Invalid read size: {readsize}")

                cmd = bytearray(10)
                cmd[0:4] = b'\x01\x04\x00\x00'
                if unitOfBit:
                    cmd[2] = 0x01

                deviceCode, memoffset = self.offset(memaddr)
                cmd[4:7] = memoffset
                cmd[7] = deviceCode
                cmd[8:10] = struct.pack("<H", readsize)

                senddata = self.mcpheader(cmd) + cmd
                
                logger.debug(f"Reading from {memaddr} with size {readsize}")
                result = await self._send_and_receive(senddata)
                logger.debug(f"Read result from {memaddr}: {result}")
                return result

            except Exception as e:
                logger.error(f"Error reading from {memaddr}: {e}")
                raise MCProtocolError(f"Read operation failed: {e}")

    async def write(self, memaddr: str, writedata: bytes, bitSize: int = 0) -> Optional[bytes]:
        """
        メモリ領域への書き込み
        
        Args:
            memaddr: メモリアドレス
            writedata: 書き込みデータ
            bitSize: ビットサイズ（ビット単位書き込み時）
            
        Returns:
            Optional[bytes]: 応答データ
        """
        async with self._request_semaphore:
            try:
                if not isinstance(memaddr, str):
                    raise MCProtocolError(f"Invalid memory address type: {type(memaddr)}")
                if not isinstance(writedata, bytes):
                    raise MCProtocolError(f"Invalid write data type: {type(writedata)}")

                if bitSize > 0:
                    unitOfBit = True
                    if bitSize <= (len(writedata) * 2):
                        elementCnt = bitSize
                        writedata = writedata[:(bitSize + 1) // 2]
                    else:
                        raise MCProtocolError("Invalid bit size")
                else:
                    unitOfBit = False
                    if len(writedata) % 2 == 0:
                        elementCnt = len(writedata) // 2
                    else:
                        raise MCProtocolError("Write data length must be even")

                cmd = bytearray(10 + len(writedata))
                cmd[0:4] = b'\x01\x14\x00\x00'
                if unitOfBit:
                    cmd[2] = 0x01

                deviceCode, memoffset = self.offset(memaddr)
                cmd[4:7] = memoffset
                cmd[7] = deviceCode
                cmd[8:10] = struct.pack("<H", elementCnt)
                cmd[10:] = writedata

                senddata = self.mcpheader(cmd) + cmd
                
                logger.debug(f"Writing to {memaddr}")
                result = await self._send_and_receive(senddata)
                logger.debug(f"Write result to {memaddr}: {result}")
                return result

            except Exception as e:
                logger.error(f"Error writing to {memaddr}: {e}")
                raise MCProtocolError(f"Write operation failed: {e}")

    async def RandomRead(self, worddevice: str, dworddevice: str) -> Optional[bytes]:
        """
        ランダム読み出し
        
        Args:
            worddevice: ワードデバイスアドレスのカンマ区切りリスト
            dworddevice: ダブルワードデバイスアドレスのカンマ区切りリスト
            
        Returns:
            Optional[bytes]: 読み出しデータ
        """
        async with self._request_semaphore:
            try:
                if not isinstance(worddevice, str) or not isinstance(dworddevice, str):
                    raise MCProtocolError("Invalid device address type")

                # ワードデバイスの処理
                wd = worddevice.replace(' ', '').split(',')
                wdary = []
                for d in wd:
                    code, offset = self.offset(d)
                    wdary.extend(offset)
                    wdary.append(code)

                # ダブルワードデバイスの処理
                dwd = dworddevice.replace(' ', '').split(',')
                dwdary = []
                for dw in dwd:
                    code, offset = self.offset(dw)
                    dwdary.extend(offset)
                    dwdary.append(code)

                cmd = bytearray(4 + 2 + len(wdary) + len(dwdary))
                cmd[0:4] = b'\x03\x04\x00\x00'
                cmd[4] = len(wd)
                cmd[5] = len(dwd)
                cmd[6:] = wdary + dwdary

                senddata = self.mcpheader(cmd) + cmd
                
                logger.debug(f"Random reading from {worddevice} and {dworddevice}")
                result = await self._send_and_receive(senddata)
                logger.debug(f"Random read result: {result}")
                return result

            except Exception as e:
                logger.error(f"Error in random read: {e}")
                raise MCProtocolError(f"Random read operation failed: {e}")

    async def MonitorSet(self, worddevice: str, dworddevice: str) -> Optional[bytes]:
        """
        モニターセット
        
        Args:
            worddevice: ワードデバイスアドレスのカンマ区切りリスト
            dworddevice: ダブルワードデバイスアドレスのカンマ区切りリスト
            
        Returns:
            Optional[bytes]: 応答データ
        """
        async with self._request_semaphore:
            try:
                if not isinstance(worddevice, str) or not isinstance(dworddevice, str):
                    raise MCProtocolError("Invalid device address type")

                # ワードデバイスの処理
                wd = worddevice.replace(' ', '').split(',')
                wdary = []
                for d in wd:
                    code, offset = self.offset(d)
                    wdary.extend(offset)
                    wdary.append(code)

                # ダブルワードデバイスの処理
                dwd = dworddevice.replace(' ', '').split(',')
                dwdary = []
                for dw in dwd:
                    code, offset = self.offset(dw)
                    dwdary.extend(offset)
                    dwdary.append(code)

                cmd = bytearray(4 + 2 + len(wdary) + len(dwdary))
                cmd[0:4] = b'\x01\x08\x00\x00'
                cmd[4] = len(wd)
                cmd[5] = len(dwd)
                cmd[6:] = wdary + dwdary

                senddata = self.mcpheader(cmd) + cmd
                
                logger.debug(f"Setting monitor for {worddevice} and {dworddevice}")
                result = await self._send_and_receive(senddata)
                logger.debug(f"Monitor set result: {result}")
                return result

            except Exception as e:
                logger.error(f"Error in monitor set: {e}")
                raise MCProtocolError(f"Monitor set operation failed: {e}")

    async def MonitorGet(self) -> Optional[bytes]:
        """
        モニターデータの取得
        
        Returns:
            Optional[bytes]: モニターデータ
        """
        async with self._request_semaphore:
            try:
                cmd = bytearray(b'\x02\x08\x00\x00')
                senddata = self.mcpheader(cmd) + cmd
                
                logger.debug("Getting monitor data")
                result = await self._send_and_receive(senddata)
                logger.debug(f"Monitor get result: {result}")
                return result

            except Exception as e:
                logger.error(f"Error in monitor get: {e}")
                raise MCProtocolError(f"Monitor get operation failed: {e}")

    @staticmethod
    def toBin(data: bytes) -> bool:
        """
        バイナリデータをブール値に変換
        
        Args:
            data: バイナリデータ
            
        Returns:
            bool: 変換後のブール値
            
        Raises:
            MCProtocolDataError: データ変換エラー時
        """
        try:
            if not isinstance(data, bytes):
                raise MCProtocolDataError(f"Expected bytes, got {type(data)}")
            
            if len(data) < 1:
                raise MCProtocolDataError("Data is empty")

            return bool(data[0] & 0x01)

        except Exception as e:
            logger.error(f"Error converting to binary: {e}")
            raise MCProtocolDataError(f"Binary conversion failed: {e}")

    @staticmethod
    def WordToBin(data: bytes) -> str:
        """
        ワードデータをバイナリ文字列に変換
        
        Args:
            data: ワードデータ
            
        Returns:
            str: バイナリ文字列
            
        Raises:
            MCProtocolDataError: データ変換エラー時
        """
        try:
            if not isinstance(data, bytes):
                raise MCProtocolDataError(f"Expected bytes, got {type(data)}")
            
            if len(data) < 1:
                raise MCProtocolDataError("Data is empty")

            size = len(data) * 8
            return format(int.from_bytes(data, 'little'), f'0{size}b')

        except Exception as e:
            logger.error(f"Error converting word to binary: {e}")
            raise MCProtocolDataError(f"Word to binary conversion failed: {e}")

    @staticmethod
    def validateData(data: bytes, size: int) -> None:
        """
        データの検証
        
        Args:
            data: 検証するデータ
            size: 要求されるデータサイズ
            
        Raises:
            MCProtocolDataError: データ検証エラー時
        """
        if not isinstance(data, bytes):
            raise MCProtocolDataError(f"Expected bytes, got {type(data)}")
        if len(data) < size:
            raise MCProtocolDataError(f"Data too short. Expected {size} bytes, got {len(data)}")

    @staticmethod
    def toInt16(data: bytes) -> List[int]:
        """
        データを16ビット整数のリストに変換
        
        Args:
            data: バイトデータ
            
        Returns:
            List[int]: 16ビット整数のリスト
            
        Raises:
            MCProtocolDataError: データ変換エラー時
        """
        try:
            MCProtocol3E.validateData(data, 2)
            return [struct.unpack('<h', data[i:i+2])[0] for i in range(0, len(data), 2)]
        except Exception as e:
            logger.error(f"Error converting to INT16: {e}")
            raise MCProtocolDataError(f"INT16 conversion failed: {e}")

    @staticmethod
    def toUInt16(data: bytes) -> List[int]:
        """
        データを符号なし16ビット整数のリストに変換
        
        Args:
            data: バイトデータ
            
        Returns:
            List[int]: 符号なし16ビット整数のリスト
            
        Raises:
            MCProtocolDataError: データ変換エラー時
        """
        try:
            MCProtocol3E.validateData(data, 2)
            return [struct.unpack('<H', data[i:i+2])[0] for i in range(0, len(data), 2)]
        except Exception as e:
            logger.error(f"Error converting to UINT16: {e}")
            raise MCProtocolDataError(f"UINT16 conversion failed: {e}")

    @staticmethod
    def toInt32(data: bytes) -> List[int]:
        """
        データを32ビット整数のリストに変換
        
        Args:
            data: バイトデータ
            
        Returns:
            List[int]: 32ビット整数のリスト
            
        Raises:
            MCProtocolDataError: データ変換エラー時
        """
        try:
            MCProtocol3E.validateData(data, 4)
            return [struct.unpack('<i', data[i:i+4])[0] for i in range(0, len(data), 4)]
        except Exception as e:
            logger.error(f"Error converting to INT32: {e}")
            raise MCProtocolDataError(f"INT32 conversion failed: {e}")

    @staticmethod
    def toUInt32(data: bytes) -> List[int]:
        """
        データを符号なし32ビット整数のリストに変換
        
        Args:
            data: バイトデータ
            
        Returns:
            List[int]: 符号なし32ビット整数のリスト
            
        Raises:
            MCProtocolDataError: データ変換エラー時
        """
        try:
            MCProtocol3E.validateData(data, 4)
            return [struct.unpack('<I', data[i:i+4])[0] for i in range(0, len(data), 4)]
        except Exception as e:
            logger.error(f"Error converting to UINT32: {e}")
            raise MCProtocolDataError(f"UINT32 conversion failed: {e}")

    @staticmethod
    def toFloat(data: bytes) -> List[float]:
        """
        データを単精度浮動小数点数のリストに変換
        
        Args:
            data: バイトデータ
            
        Returns:
            List[float]: 単精度浮動小数点数のリスト
            
        Raises:
            MCProtocolDataError: データ変換エラー時
        """
        try:
            MCProtocol3E.validateData(data, 4)
            return [struct.unpack('<f', data[i:i+4])[0] for i in range(0, len(data), 4)]
        except Exception as e:
            logger.error(f"Error converting to float: {e}")
            raise MCProtocolDataError(f"Float conversion failed: {e}")

    @staticmethod
    def toDouble(data: bytes) -> List[float]:
        """
        データを倍精度浮動小数点数のリストに変換
        
        Args:
            data: バイトデータ
            
        Returns:
            List[float]: 倍精度浮動小数点数のリスト
            
        Raises:
            MCProtocolDataError: データ変換エラー時
        """
        try:
            MCProtocol3E.validateData(data, 8)
            return [struct.unpack('<d', data[i:i+8])[0] for i in range(0, len(data), 8)]
        except Exception as e:
            logger.error(f"Error converting to double: {e}")
            raise MCProtocolDataError(f"Double conversion failed: {e}")

    @staticmethod
    def toString(data: bytes) -> str:
        """
        データを文字列に変換 (リトルエンディアン)
        
        Args:
            data: バイトデータ
            
        Returns:
            str: 変換後の文字列
            
        Raises:
            MCProtocolDataError: データ変換エラー時
        """
        try:
            if not isinstance(data, bytes):
                raise MCProtocolDataError(f"Expected bytes, got {type(data)}")

            if len(data) < 1:
                raise MCProtocolDataError("Data is empty")

            s = [0] * (len(data) + 1)
            for i in range(0, len(data), 2):
                s[i] = data[i+1]
                s[i+1] = data[i]
            
            idx = s.index(0)
            return bytes(s[:idx]).decode("utf-8")

        except Exception as e:
            logger.error(f"Error converting to string: {e}")
            raise MCProtocolDataError(f"String conversion failed: {e}")

    async def close(self):
        """
        接続のクローズとリソースの解放
        """
        try:
            self._cleanup()
            logger.info(f"Closed MCProtocol3E connection: {self.connection_id}")
        except Exception as e:
            logger.error(f"Error closing connection {self.connection_id}: {e}")
            raise MCProtocolError(f"Close operation failed: {e}")

# テスト用のメインコード
if __name__ == "__main__":
    # ロギング設定
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(f'mcprotocol3e_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
        ]
    )

    async def test_mcprotocol():
        try:
            # テスト用の接続
            mcp = MCProtocol3E('192.168.0.1', 5000)

            # ビットデバイスの読み書きテスト
            logger.info("Testing bit device read/write...")
            data = await mcp.read('B7000', 1)
            if data:
                value = mcp.toBin(data)
                logger.info(f"Read B7000: {value}")

            # ワードデバイスの読み書きテスト
            logger.info("Testing word device read/write...")
            data = await mcp.read('D100', 2)
            if data:
                values = mcp.toUInt16(data)
                logger.info(f"Read D100-D101: {values}")

            # 接続のクローズ
            await mcp.close()
            logger.info("Tests completed successfully")

        except Exception as e:
            logger.error(f"Test failed: {e}")
            raise

    # テストの実行
    try:
        asyncio.run(test_mcprotocol())
    except KeyboardInterrupt:
        logger.info("Test interrupted by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
    finally:
        logging.shutdown()