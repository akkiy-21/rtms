# Signage Flow デプロイメントガイド

このドキュメントでは、Signage FlowをRaspberry Pi 5（AlmaLinux 10）にデプロイする手順を説明します。

## 目次

- [新規セットアップ（cloud-init使用）](#新規セットアップcloud-init使用)
- [既存設備へのSSH経由インストール](#既存設備へのssh経由インストール)
- [アプリケーションの切り替え](#アプリケーションの切り替え)
- [トラブルシューティング](#トラブルシューティング)

---

## 新規セットアップ（cloud-init使用）

### 前提条件

- Raspberry Pi 5
- AlmaLinux 10（ARM64）
- SDカード（CIDATAパーティション付き）

### 手順

#### 1. ビルド

```bash
# Linux ARM64版をビルド
npm run make -- --arch=arm64 --platform=linux

# 生成されたZIPファイルを確認
ls out/make/zip/linux/arm64/
# => signage-flow-linux-arm64-1.0.0.zip
```

#### 2. SDカードへの配置

SDカードのCIDATAパーティション（`/boot/zips`または`/dev/mmcblk0p1`の`zips`フォルダ）に以下を配置：

```
/boot/zips/
├── rtms-client*.zip                        # 既存のrtms-clientアプリ
├── signage-flow-linux-arm64-1.0.0.zip     # 新しいsignage-flowアプリ
└── initial_settings.json                   # rtms-client用設定（オプション）
```

#### 3. cloud-init設定

プロジェクトルートの`user-data`ファイルをSDカードのCIDATAパーティションにコピーします。

```bash
# user-dataをSDカードにコピー
cp user-data /path/to/sdcard/user-data
```

#### 4. 初回起動

SDカードをRaspberry Pi 5に挿入して起動します。cloud-initが以下を自動実行します：

- Wi-Fi接続設定
- 日本語環境のセットアップ
- GNOME Kioskのインストール
- rtms-clientとsignage-flowの両方をインストール
- ファイアウォールでポート3000を開放
- 自動起動設定

初回起動には10〜15分程度かかります。

#### 5. 動作確認

同一ネットワーク上のPCから以下のURLにアクセス：

```
http://172.17.1.36:3000/admin
```

---

## 既存設備へのSSH経由インストール

既にrtms-clientが稼働している設備にsignage-flowを追加インストールする手順です。

### 前提条件

- 対象機器のIPアドレス
- SSH接続可能（ユーザー: `mmi`）
- sudoコマンドが使用可能

### 方法1: ステップバイステップ

#### 1. ZIPファイルを転送

```bash
# ローカルPCから実行
scp out/make/zip/linux/arm64/signage-flow-linux-arm64-1.0.0.zip mmi@<対象機器のIPアドレス>:/tmp/
```

#### 2. SSH接続

```bash
ssh mmi@<対象機器のIPアドレス>
```

#### 3. GDMを停止

```bash
# 画面が一時的に消えます（SSHセッションは維持されます）
sudo systemctl stop gdm
```

#### 4. インストール

```bash
# インストールディレクトリを作成
sudo mkdir -p /opt/signage-flow

# ZIPファイルを展開
cd /opt/signage-flow
sudo unzip -o /tmp/signage-flow-linux-arm64-1.0.0.zip
# もしくは
sudo unzip -o /home/mmi/signage-flow-linux-arm64-1.0.0.zip

# 所有者と権限を設定
sudo chown -R mmi:mmi /opt/signage-flow
sudo chmod -R +x /opt/signage-flow

# シンボリックリンクを作成
sudo ln -sf /opt/signage-flow/signage-flow /usr/bin/signage-flow

# 設定ディレクトリを作成
mkdir -p /home/mmi/.config/signage-flow
```

#### 5. 設定ファイルを更新

```bash
# /etc/mmi-kiosk.confが存在する場合
if [ -f /etc/mmi-kiosk.conf ]; then
  # 既存の設定をコメントアウト
  sudo sed -i 's/^KIOSK_APP_BIN=/#KIOSK_APP_BIN=/' /etc/mmi-kiosk.conf
  # signage-flowの設定を追加
  echo "KIOSK_APP_BIN=/usr/bin/signage-flow" | sudo tee -a /etc/mmi-kiosk.conf
else
  # 設定ファイルが存在しない場合は作成
  echo "KIOSK_APP_BIN=/usr/bin/signage-flow" | sudo tee /etc/mmi-kiosk.conf
fi
```

#### 6. ファイアウォール設定

```bash
# ポート3000を開放
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

#### 7. 一時ファイルを削除

```bash
rm /tmp/signage-flow-linux-arm64-1.0.0.zip
# もしくは
rm /home/mmi/signage-flow-linux-arm64-1.0.0.zip
```

#### 8. GDMを再起動

```bash
sudo systemctl start gdm
```

### 方法2: ワンライナー（全自動）

ローカルPCから以下のコマンドを実行すると、ZIPファイルの転送からインストールまで一度に実行されます：

```bash
scp out/make/zip/linux/arm64/signage-flow-linux-arm64-1.0.0.zip mmi@<対象機器のIPアドレス>:/tmp/ && \
ssh mmi@<対象機器のIPアドレス> 'sudo systemctl stop gdm && \
  sudo mkdir -p /opt/signage-flow && \
  cd /opt/signage-flow && \
  sudo unzip -o /tmp/signage-flow-linux-arm64-1.0.0.zip && \
  sudo chown -R mmi:mmi /opt/signage-flow && \
  sudo chmod -R +x /opt/signage-flow && \
  sudo ln -sf /opt/signage-flow/signage-flow /usr/bin/signage-flow && \
  mkdir -p /home/mmi/.config/signage-flow && \
  if [ -f /etc/mmi-kiosk.conf ]; then \
    sudo sed -i "s/^KIOSK_APP_BIN=/#KIOSK_APP_BIN=/" /etc/mmi-kiosk.conf; \
    echo "KIOSK_APP_BIN=/usr/bin/signage-flow" | sudo tee -a /etc/mmi-kiosk.conf; \
  else \
    echo "KIOSK_APP_BIN=/usr/bin/signage-flow" | sudo tee /etc/mmi-kiosk.conf; \
  fi && \
  sudo firewall-cmd --permanent --add-port=3000/tcp && \
  sudo firewall-cmd --reload && \
  rm /tmp/signage-flow-linux-arm64-1.0.0.zip && \
  sudo systemctl start gdm'
```

### インストール確認

```bash
# SSH接続
ssh mmi@<対象機器のIPアドレス>

# インストール確認
ls -la /usr/bin/signage-flow
ls -la /opt/signage-flow/

# 設定確認
cat /etc/mmi-kiosk.conf | grep KIOSK_APP_BIN

# ログ確認
tail -f /home/mmi/.cache/kiosk-xorg.log
```

---

## アプリケーションの切り替え

### signage-flowからrtms-clientへ切り替え

```bash
# SSH接続
ssh mmi@<対象機器のIPアドレス>

# 設定ファイルを編集
sudo nano /etc/mmi-kiosk.conf

# 以下の行を変更:
# KIOSK_APP_BIN=/usr/bin/signage-flow
# ↓
# KIOSK_APP_BIN=/usr/bin/rtms-client

# GDMを再起動
sudo systemctl restart gdm
```

### rtms-clientからsignage-flowへ切り替え

```bash
# SSH接続
ssh mmi@<対象機器のIPアドレス>

# 設定ファイルを編集
sudo nano /etc/mmi-kiosk.conf

# 以下の行を変更:
# KIOSK_APP_BIN=/usr/bin/rtms-client
# ↓
# KIOSK_APP_BIN=/usr/bin/signage-flow

# GDMを再起動
sudo systemctl restart gdm
```

### コマンドラインで切り替え

```bash
# signage-flowに切り替え
ssh mmi@<対象機器のIPアドレス> 'sudo sed -i "s|^KIOSK_APP_BIN=.*|KIOSK_APP_BIN=/usr/bin/signage-flow|" /etc/mmi-kiosk.conf && sudo systemctl restart gdm'

# rtms-clientに切り替え
ssh mmi@<対象機器のIPアドレス> 'sudo sed -i "s|^KIOSK_APP_BIN=.*|KIOSK_APP_BIN=/usr/bin/rtms-client|" /etc/mmi-kiosk.conf && sudo systemctl restart gdm'
```

---

## トラブルシューティング

### アプリが起動しない

```bash
# ログを確認
tail -50 /home/mmi/.cache/kiosk-xorg.log

# cloud-initログを確認（初回起動時）
tail -50 /var/log/cloud-init-output.log

# アプリの存在確認
ls -la /usr/bin/signage-flow
ls -la /opt/signage-flow/

# シンボリックリンクを確認
readlink -f /usr/bin/signage-flow
```

### シンボリックリンクが間違っている

```bash
# 既存のシンボリックリンクを削除
sudo rm /usr/bin/signage-flow

# 正しいパスでシンボリックリンクを作成
sudo ln -sf /opt/signage-flow/signage-flow /usr/bin/signage-flow

# 確認
ls -la /usr/bin/signage-flow

# GDMを再起動
sudo systemctl restart gdm
```

### Web管理画面にアクセスできない

```bash
# ファイアウォール設定を確認
sudo firewall-cmd --list-ports

# ポート3000が開いていない場合
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# アプリが起動しているか確認
ps aux | grep signage-flow

# ネットワーク接続を確認
ip addr show
```

### PDFが表示されない

```bash
# ログでエラーを確認
tail -100 /home/mmi/.cache/kiosk-xorg.log | grep -i "pdf\|worker\|error"

# 以下のメッセージが表示されるはずです:
# [Main] PDF worker loaded successfully
# [PDFViewer] Using Electron PDF worker (Blob URL)
```

### 設定ファイルが読み込まれない

```bash
# 設定ファイルの内容を確認
cat /etc/mmi-kiosk.conf

# キオスクスクリプトを確認
cat /usr/local/bin/mmi-kiosk-run

# 設定ファイルの権限を確認
ls -la /etc/mmi-kiosk.conf

# 権限が正しくない場合
sudo chmod 644 /etc/mmi-kiosk.conf
```

### アプリの完全再インストール

```bash
# SSH接続
ssh mmi@<対象機器のIPアドレス>

# GDMを停止
sudo systemctl stop gdm

# 既存のインストールを削除
sudo rm -rf /opt/signage-flow
sudo rm /usr/bin/signage-flow

# 設定をクリア（オプション）
rm -rf /home/mmi/.config/signage-flow

# 再度インストール手順を実行
# （上記の「既存設備へのSSH経由インストール」を参照）
```

---

## インストール先とファイル構成

### ディレクトリ構造

```
/opt/signage-flow/              # アプリケーション本体
├── signage-flow                # 実行ファイル
├── resources/                  # リソースファイル
│   └── app.asar               # アプリケーションコード
├── locales/                    # ロケールファイル
├── libffmpeg.so               # FFmpegライブラリ
└── ...                        # その他のライブラリ

/usr/bin/signage-flow          # シンボリックリンク → /opt/signage-flow/signage-flow

/home/mmi/.config/signage-flow/ # 設定ディレクトリ
└── playlist.json              # プレイリスト設定

/etc/mmi-kiosk.conf            # キオスク設定ファイル

/home/mmi/.cache/kiosk-xorg.log # ログファイル
```

### 設定ファイル（/etc/mmi-kiosk.conf）

```bash
# 切り替え制御
SWITCH_TO_FA=true

# キオスクセッション種別
KIOSK_SESSION=xorg

# メモリ不足対策
ENABLE_SWAP=true
SWAP_MODE=zram
ZRAM_FRACTION=0.5
SWAP_FILE_SIZE=2048M

# dnf アップグレード
DO_DNF_UPGRADE=false

# キオスクアプリ切り替え設定
KIOSK_APP_BIN=/usr/bin/signage-flow
```

---

## 複数台への一括デプロイ

### IPアドレスリストを使用

```bash
# IPアドレスリストを作成
cat > targets.txt << EOF
172.17.1.36
172.17.1.37
172.17.1.38
EOF

# 一括デプロイ
while read ip; do
  echo "Deploying to $ip..."
  scp out/make/zip/linux/arm64/signage-flow-linux-arm64-1.0.0.zip mmi@$ip:/tmp/ && \
  ssh mmi@$ip 'sudo systemctl stop gdm && \
    sudo mkdir -p /opt/signage-flow && \
    cd /opt/signage-flow && \
    sudo unzip -o /tmp/signage-flow-linux-arm64-1.0.0.zip && \
    sudo chown -R mmi:mmi /opt/signage-flow && \
    sudo chmod -R +x /opt/signage-flow && \
    sudo ln -sf /opt/signage-flow/signage-flow /usr/bin/signage-flow && \
    mkdir -p /home/mmi/.config/signage-flow && \
    if [ -f /etc/mmi-kiosk.conf ]; then \
      sudo sed -i "s/^KIOSK_APP_BIN=/#KIOSK_APP_BIN=/" /etc/mmi-kiosk.conf; \
      echo "KIOSK_APP_BIN=/usr/bin/signage-flow" | sudo tee -a /etc/mmi-kiosk.conf; \
    else \
      echo "KIOSK_APP_BIN=/usr/bin/signage-flow" | sudo tee /etc/mmi-kiosk.conf; \
    fi && \
    sudo firewall-cmd --permanent --add-port=3000/tcp && \
    sudo firewall-cmd --reload && \
    rm /tmp/signage-flow-linux-arm64-1.0.0.zip && \
    sudo systemctl start gdm'
  echo "Deployment to $ip completed."
done < targets.txt
```

---

## 注意事項

1. **画面の一時停止**: `sudo systemctl stop gdm`を実行すると画面が消えますが、SSHセッションは維持されます。
2. **作業の慎重さ**: インストール中は画面が表示されないため、コマンドは慎重に実行してください。
3. **バックアップ**: 重要な設定がある場合は、事前にバックアップを取ってください。
4. **ネットワーク**: 同一ネットワーク上にいることを確認してください。
5. **権限**: sudoコマンドが使用可能であることを確認してください。

---

## サポート

問題が発生した場合は、以下の情報を収集してください：

```bash
# システム情報
uname -a
cat /etc/os-release

# インストール状況
ls -la /usr/bin/signage-flow
ls -la /opt/signage-flow/

# 設定ファイル
cat /etc/mmi-kiosk.conf

# ログ
tail -100 /home/mmi/.cache/kiosk-xorg.log
tail -100 /var/log/cloud-init-output.log

# プロセス
ps aux | grep -E "signage-flow|rtms-client|gdm"

# ネットワーク
ip addr show
sudo firewall-cmd --list-all
```
