# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import devices, classifications, plcs, time_tables, customers, products, users, groups, scan, data, dashboard

# MQTT クライアントは別プロセス (mqtt_worker.py) で管理されるため、
# FastAPI からは初期化しない

app = FastAPI(
    title="miyazaki-scada-api",
    description="",
    version="0.0.1",
    debug=True
)

# CORSを許可するためのミドルウェア設定
# ルーターを含める前に追加します
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 必要に応じて特定のオリジンに制限できます
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIルータをアプリケーションに追加
app.include_router(devices.router)
app.include_router(classifications.router)
app.include_router(plcs.router)
app.include_router(time_tables.router)
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(users.router)
app.include_router(groups.router)
app.include_router(scan.router)
app.include_router(data.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Matsuo Miyazaki RTMS API! Documentation is available at https://localhost:8000/docs"}
