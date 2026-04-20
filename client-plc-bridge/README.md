# RTMS Client PLC Bridge

PLC（三菱電機のMCプロトコル及びオムロンのFINSプロトコル）とWebSocketサーバーを介してデータをブリッジするPythonアプリケーション。

## 概要

このアプリケーションは、製造現場のPLCから以下のデータを収集し、WebSocket経由でリアルタイムに配信します：

- **品質管理シグナル (Quality Control)** - 製造工程の品質データ
- **ロギングデータ (Logging)** - PLCの各種測定値とイベント
- **稼働効率データ (Efficiency)** - 設備の稼働状態と効率情報
- **アラーム情報 (Alarm)** - 設備の警報とエラー通知

### 対応プロトコル

- **MC Protocol 3E** - 三菱電機製PLC用
- **FINS** - オムロン製PLC用

## 主な機能

- ✅ 複数PLCの同時接続・データ収集
- ✅ WebSocket経由のリアルタイムデータ配信
- ✅ 設定の動的更新（再起動不要）
- ✅ スキャンタイムモニタリング
- ✅ ビット単位のトリガー検出
- ✅ 立ち上がりエッジ検出による確実なイベント捕捉
- ✅ リソース管理とパフォーマンス最適化
- ✅ 詳細なログ機能（有効/無効切り替え可能）

## システム要件

- Python 3.12以上
- Linux または Windows OS
- ネットワーク接続（PLC通信用）

### 依存ライブラリ

```text
async-timeout>=5.0.1
bitarray>=3.1.1
nuitka>=2.6.8
numpy>=2.2.4
pandas>=2.2.3
websockets>=15.0.1
```

## インストール

### 1. リポジトリのクローン

```bash
git clone https://github.com/akkiy-21/rtms-client-plc-bridge.git
cd rtms-client-plc-bridge
```

### 2. 仮想環境の作成と有効化

```bash
# 仮想環境の作成
python3 -m venv .venv

# Linux/Mac
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (Command Prompt)
.venv\Scripts\activate.bat
```

### 3. 依存関係のインストール

```bash
pip install -e .
```

## 使用方法

### 開発環境での実行

```bash
# 仮想環境を有効化
source .venv/bin/activate

# アプリケーションの起動
python main.py
```

### WebSocketエンドポイント

アプリケーション起動後、以下のエンドポイントが利用可能になります：

- **設定受信**: `ws://localhost:8765`
- **データ配信**: `ws://localhost:8766`
- **スキャンタイム**: `ws://localhost:8767`

### 設定の送信

設定はJSON形式でWebSocket（ポート8765）に送信します。設定には以下の項目が含まれます：

- `logging_settings` - ロギング設定
- `quality_control_signals` - 品質管理シグナル設定
- `efficiency_addresses` - 稼働効率アドレス設定
- `alarm_groups` - アラームグループ設定

詳細な設定例については、プロジェクトのドキュメントを参照してください。

## 本番環境へのデプロイ

### ログ設定の最適化

本番環境にデプロイする前に、`main.py`の先頭にあるログ設定を確認してください：

```python
# =====================================================
# ログ設定 - この変数一つで有効無効を切り替え
# すべてのモジュール（main.py, mcprotocol3e.py, fins.py）のログを一元管理
# =====================================================
LOGGING_ENABLED = False  # 本番環境では False を推奨
```

**本番環境用設定:**
- `LOGGING_ENABLED = False` - パフォーマンス最大化のため無効化を推奨

**開発環境用設定:**
- `LOGGING_ENABLED = True` - デバッグ時は有効化
- `LOG_LEVEL = logging.DEBUG` - 詳細なログ出力

### Nuitkaコンパイル

本番環境での高速化とスタンドアロン実行のため、Nuitkaでコンパイルすることを推奨します。

#### 必要なツールのインストール

**1. C/C++コンパイラのインストール（必須）:**

Nuitkaはコンパイル時にC/C++コンパイラを使用します。

**Debian/Ubuntu系:**
```bash
sudo apt-get update
sudo apt-get install build-essential python3-dev -y
```

**AlmaLinux/RHEL/CentOS系:**
```bash
# 開発ツール一式をインストール
sudo dnf groupinstall "Development Tools" -y

# または、個別に必要なパッケージをインストール
sudo dnf install gcc gcc-c++ make python3-devel -y

# インストール確認
gcc --version
g++ --version
```

**2. Nuitkaのインストール:**
```bash
pip install nuitka
```

**3. patchelfのインストール（Linux環境で必須）:**

**Debian/Ubuntu系:**
```bash
sudo apt-get install patchelf -y
```

**AlmaLinux/RHEL/CentOS系:**
```bash
# EPELリポジトリを有効化
sudo dnf install epel-release -y
sudo dnf clean all
sudo dnf makecache

# patchelfをインストール
sudo dnf install patchelf -y

# インストール確認
patchelf --version
```

**EPELで見つからない場合（ソースからビルド）:**
```bash
# ビルドツールをインストール（まだの場合）
sudo dnf groupinstall "Development Tools" -y

# patchelfのソースをダウンロードしてビルド
cd /tmp
wget https://github.com/NixOS/patchelf/releases/download/0.18.0/patchelf-0.18.0.tar.gz
tar -xzf patchelf-0.18.0.tar.gz
cd patchelf-0.18.0
./configure --prefix=/usr/local
make
sudo make install

# インストール確認
patchelf --version

# クリーンアップ
cd ~
rm -rf /tmp/patchelf-0.18.0*
```

**バイナリを直接ダウンロードする場合:**
```bash
# アーキテクチャを確認
uname -m  # aarch64 または x86_64

# aarch64の場合
cd /tmp
wget https://github.com/NixOS/patchelf/releases/download/0.18.0/patchelf-0.18.0-aarch64.tar.gz
tar -xzf patchelf-0.18.0-aarch64.tar.gz
sudo cp bin/patchelf /usr/local/bin/
sudo chmod +x /usr/local/bin/patchelf

# x86_64の場合
# wget https://github.com/NixOS/patchelf/releases/download/0.18.0/patchelf-0.18.0-x86_64.tar.gz
# tar -xzf patchelf-0.18.0-x86_64.tar.gz
# sudo cp bin/patchelf /usr/local/bin/
# sudo chmod +x /usr/local/bin/patchelf

# インストール確認
patchelf --version

# クリーンアップ
rm -rf /tmp/patchelf-0.18.0*
```

**4. ccacheのインストール（任意、コンパイル高速化）:**

コンパイル時間を短縮したい場合にインストールします。

```bash
# ccacheをインストール
sudo dnf install ccache -y  # AlmaLinux/RHEL/CentOS
# または
sudo apt-get install ccache -y  # Debian/Ubuntu

# 環境変数を設定（一時的）
export NUITKA_CCACHE_BINARY=/usr/bin/ccache

# または、.bashrcに追加して永続化
echo 'export NUITKA_CCACHE_BINARY=/usr/bin/ccache' >> ~/.bashrc
source ~/.bashrc

# インストール確認
ccache --version
```

#### コンパイル手順

**前提条件:**
- 仮想環境が有効化されていること
- C/C++コンパイラがインストールされていること
- patchelf（Linux）がインストールされていること

1. 仮想環境が有効化されていることを確認します（プロンプトに `(.venv)` が表示されているか確認）。

2. Pythonスクリプトがあるディレクトリにいることを確認します：
   ```bash
   pwd  # 現在のディレクトリを確認
   ls   # main.py があることを確認
   ```

3. 以下のコマンドでコンパイルを実行します：

**Linux環境の場合:**
```bash
# 仮想環境を有効化
source .venv/bin/activate

# コンパイル実行
nuitka --follow-imports --standalone \
       --plugin-enable=anti-bloat \
       --plugin-enable=multiprocessing \
       --plugin-enable=implicit-imports \
       --include-package=websockets \
       --static-libpython=no \
       main.py
```

**Windows環境の場合:**
```powershell
# 仮想環境が有効化されていることを確認
.venv\Scripts\Activate.ps1

# コンパイル実行
nuitka --follow-imports --standalone --plugin-enable=anti-bloat --plugin-enable=multiprocessing --plugin-enable=implicit-imports --include-package=websockets main.py
```

**オプション説明:**
- `--follow-imports` - すべてのインポートモジュールを含める
- `--standalone` - 独立した実行可能ファイルを作成
- `--plugin-enable=anti-bloat` - ファイルサイズを最適化
- `--plugin-enable=multiprocessing` - マルチプロセッシングをサポート
- `--plugin-enable=implicit-imports` - 暗黙的なインポートを検出
- `--include-package=websockets` - websocketsパッケージを明示的に含める
- `--static-libpython=no` - Linux環境で動的libpythonを使用

#### コンパイル後の実行

```bash
# Linux
./main.dist/main

# Windows
.\main.dist\main.exe
```

#### 本番環境向け最適化コンパイル

```bash
# ログを無効化してからコンパイル（main.py で LOGGING_ENABLED = False）
nuitka --follow-imports --standalone \
       --plugin-enable=anti-bloat \
       --plugin-enable=multiprocessing \
       --plugin-enable=implicit-imports \
       --include-package=websockets \
       --static-libpython=no \
       --lto=yes \
       --assume-yes-for-downloads \
       main.py
```

### 配布とデプロイ

コンパイル後、`main.dist` ディレクトリ全体を配布先に転送します：

```bash
# ディレクトリを圧縮
tar -czf plc-bridge.tar.gz main.dist/

# 配布先で解凍
tar -xzf plc-bridge.tar.gz

# 実行権限を付与（Linux）
chmod +x main.dist/main

# 実行
./main.dist/main
```

## トラブルシューティング

### 一般的な問題

### 一般的な問題

1. **Cコンパイラが見つからないエラー**
   ```
   Error, no compiler found. You need to install a C compiler.
   ```
   → C/C++コンパイラをインストールしてください：
   ```bash
   # AlmaLinux/RHEL/CentOS
   sudo dnf groupinstall "Development Tools" -y
   sudo dnf install python3-devel -y
   
   # Debian/Ubuntu
   sudo apt-get install build-essential python3-dev -y
   
   # インストール確認
   gcc --version
   ```

2. **patchelfが見つからないエラー（Linux）**
   ```
   FATAL: Error, standalone mode on Linux requires 'patchelf' to be installed.
   ```
   → 上記の「必要なツールのインストール」セクションの手順3を参照してください。
   - AlmaLinux/RHEL系の場合は、まずEPELリポジトリを有効化してください。

3. **不足しているモジュールのエラー**
   - Nuitkaコマンドに `--include-module=module_name` オプションを追加してください。
   - 例: `--include-module=asyncio --include-module=pandas`

4. **仮想環境が有効化されていない**
   ```bash
   # 仮想環境を有効化
   source .venv/bin/activate
   
   # Pythonのパスを確認（仮想環境のものか確認）
   which python
   ```

5. **コンパイル時のメモリ不足**
   - より多くのRAMを割り当てるか、`--lto=no` オプションを追加してください。

6. **実行時の「Permission denied」エラー（Linux）**
   ```bash
   chmod +x main.dist/main
   ```

7. **WebSocket接続エラー**
   → ファイアウォール設定でポート8765, 8766, 8767が開放されているか確認してください。

2. **不足しているモジュールのエラー**
   → Nuitkaコマンドに `--include-module=module_name` オプションを追加してください。

3. **仮想環境が有効化されていない**
   ```bash
   # 仮想環境を有効化
   source .venv/bin/activate
   
   # Pythonのパスを確認（仮想環境のものか確認）
   which python
   ```

4. **コンパイル時のメモリ不足**
   → より多くのRAMを割り当てるか、`--lto=no` オプションを追加してください。

5. **実行時の「Permission denied」エラー（Linux）**
   ```bash
   chmod +x main.dist/main
   ```

6. **WebSocket接続エラー**
   → ファイアウォール設定でポート8765, 8766, 8767が開放されているか確認してください。

### デバッグ方法

1. **ログを有効にして実行:**
   ```python
   # main.py の先頭で設定
   LOGGING_ENABLED = True
   LOG_LEVEL = logging.DEBUG
   ```

2. **コンパイル前の動作確認:**
   ```bash
   python main.py
   ```

3. **詳細なコンパイルログを出力:**
   ```bash
   nuitka --show-progress --show-modules --verbose \
          --follow-imports --standalone \
          --plugin-enable=anti-bloat \
          --plugin-enable=multiprocessing \
          --plugin-enable=implicit-imports \
          --include-package=websockets \
          --static-libpython=no \
          main.py
   ```

## プロジェクト構成

```
rtms-client-plc-bridge/
├── main.py                 # メインアプリケーション
├── mcprotocol3e.py        # MCプロトコル3E実装
├── fins.py                # FINSプロトコル実装
├── pyproject.toml         # プロジェクト設定
├── README.md              # このファイル
└── .venv/                 # 仮想環境（インストール後）
```

## ライセンス

このプロジェクトのライセンスについては、リポジトリのLICENSEファイルを参照してください。

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容について議論してください。

## サポート

問題が発生した場合は、GitHubのIssuesセクションで報告してください。

---

**注意事項:**
- 本番環境での使用前に、必ず十分なテストを実施してください
- ネットワークセキュリティ設定を適切に行ってください
- 定期的なバックアップとモニタリングを推奨します
