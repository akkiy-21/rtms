# サーバーアップデート手順

## 前提

| 項目 | 値 |
|---|---|
| サーバー | `172.18.1.15` |
| ユーザー | `mmi` |
| プロジェクトパス（サーバー） | `/home/mmi/rtms-server/` |
| プロジェクトパス（ローカル） | `C:\Users\h-nakashima\Desktop\rtms\` |

---

## パターン①: コードのみ変更（DBマイグレーションなし）

### 1. 変更ファイルをtar化してサーバーへ転送

```powershell
cd C:\Users\h-nakashima\Desktop\rtms

# ファイルパスは実際の変更内容に合わせて変更
tar -czf /tmp/update.tar.gz `
  backend/app/tasks/connector_tasks.py `
  backend/app/models.py

scp /tmp/update.tar.gz mmi@172.18.1.15:/tmp/
```

### 2. サーバー上でビルド・再起動

```bash
# SSH接続後
cd /home/mmi/rtms-server

# 展開
tar -xzf /tmp/update.tar.gz

# ★ 展開確認（変更ファイルのキーフィールドが存在するか grep で確認）
# 例: grep -c 'alarm_group_id' backend/app/models.py

# ビルド（backend/celery/mqtt 全4サービス）
# ※ backend コードを変更した場合は必ず4サービス全てをビルドすること
#   celery-worker/celery-beat/mqtt-worker は同じイメージを使用しており、
#   backend のみ再ビルドしても古いコードのまま動き続ける
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod \
  build backend celery-worker celery-beat mqtt-worker

# 再起動
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod \
  up -d backend celery-worker celery-beat mqtt-worker
```

---

## パターン②: DBマイグレーションあり

### 1. 変更ファイルをtar化してサーバーへ転送

```powershell
cd C:\Users\h-nakashima\Desktop\rtms

# alembic/versions の新規ファイルも含める
tar -czf /tmp/update.tar.gz `
  backend/alembic/versions/YYYYMMDD_NN_xxxx.py `
  backend/app/models.py `
  backend/app/schemas.py `
  backend/app/crud/device_connectors.py `
  backend/app/tasks/connector_tasks.py

scp /tmp/update.tar.gz mmi@172.18.1.15:/tmp/
```

### 2. サーバー上で展開・マイグレーション・再起動

```bash
# SSH接続後
cd /home/mmi/rtms-server

# 展開
tar -xzf /tmp/update.tar.gz

# ★ 展開確認（マイグレーションファイルが存在するか確認）
# ls backend/alembic/versions/ | grep YYYYMMDD

# ① backend イメージを先にビルド（alembic migrate 用イメージとして使う）
# ※ マイグレーションファイルは Docker イメージに COPY されるため、
#   ビルド前に tar 展開が完了していること
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod \
  build backend

# ② マイグレーション実行
# ※ exec ではなく docker run --rm を使うことで確実に最新イメージが使われる
# ※ uv run が必要（alembic は PATH に含まれないため）
docker run --rm \
  --env-file deploy/.env.prod \
  --network rtms-server_default \
  rtms-server-backend \
  uv run alembic upgrade head

# ★ マイグレーション確認
docker run --rm \
  --env-file deploy/.env.prod \
  --network rtms-server_default \
  rtms-server-backend \
  uv run alembic current
# → 最新リビジョン (head) と表示されればOK

# ③ 残りのイメージをビルド・全サービス再起動
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod \
  build celery-worker celery-beat mqtt-worker

RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod \
  up -d backend celery-worker celery-beat mqtt-worker
```

---

## ログ確認

```bash
cd /home/mmi/rtms-server

# backend（API）
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod logs -f backend

# celery-worker（外部連携タスク等の非同期処理）
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod logs -f celery-worker

# celery-beat（定期タスクスケジューラ）
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod logs -f celery-beat

# mqtt-worker（MQTT常駐処理）
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod logs -f mqtt-worker
```

---

## 注意点

| 問題 | 対処 |
|---|---|
| `backend-migrate` サービスが古いキャッシュイメージを使う | `docker run --rm ... rtms-server-backend uv run alembic upgrade head` で直接実行する |
| `exec backend uv run alembic upgrade head` が古いリビジョンのまま | マイグレーションファイルは Docker イメージに COPY されるため、ビルド前に tar 展開が必要 |
| `build backend` だけでは `celery-worker`/`celery-beat`/`mqtt-worker` が更新されない | 4サービスを明示的に指定して `build` する |
| `up -d` で Running のままコンテナが再作成されない | `--force-recreate` を追加する |
| tar 展開後にファイルが正しく反映されているか不明 | `grep -c 'キーワード' ファイルパス` で件数を確認する |
| PowerShell から複数ステップの SSH 操作は煩雑 | `/tmp/` にシェルスクリプトを転送して `bash /tmp/script.sh` で実行する |
