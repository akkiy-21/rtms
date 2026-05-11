# RTMS Server Deployment

この手順は 172.18.1.11 のような AlmaLinux サーバーに、RTMS のサーバー側を Docker Compose で本番配置するためのものです。

## 構成

- frontend: Nginx で React build を配信
- backend: FastAPI
- mqtt-worker: MQTT 常駐処理
- celery-worker: デバイス操作ジョブ
- postgres / redis / mosquitto: ミドルウェア

管理画面は frontend 経由で 80/tcp から利用しますが、現場の Electron client は backend の 8000/tcp に直接接続します。

frontend は /api を backend へリバースプロキシするため、サーバーの IP が変わってもフロントエンドの再設定を最小化できます。

## 1. 本番環境ファイルの準備

deploy/.env.prod.example を deploy/.env.prod にコピーして、少なくとも以下を変更してください。

- POSTGRES_PASSWORD
- DATABASE_URL
- RTMS_JWT_SECRET
- RTMS_INITIAL_ADMIN_PASSWORD

## 2. 初回起動

```bash
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod up -d postgres redis mosquitto
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod run --rm --profile tools backend-init
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod up -d backend mqtt-worker celery-worker frontend
```

## 3. 既存 DB に対する更新

```bash
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod up -d postgres redis mosquitto
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod run --rm --profile tools backend-migrate
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod up -d backend mqtt-worker celery-worker frontend
```

## 4. 確認

- 管理画面: http://<server-ip>/
- API docs: http://<server-ip>/docs
- Client API: http://<server-ip>:8000/
- MQTT TCP: <server-ip>:1883
- MQTT WebSocket: <server-ip>:9001

firewalld を使っている場合は 8000/tcp も許可してください。

```bash
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

## 5. 更新

```bash
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod build
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod up -d
```

## 6. ログ確認

```bash
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod logs -f backend
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod logs -f mqtt-worker
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod logs -f celery-worker
RTMS_ENV_FILE=deploy/.env.prod docker compose -f docker-compose.prod.yml --env-file deploy/.env.prod logs -f frontend
```