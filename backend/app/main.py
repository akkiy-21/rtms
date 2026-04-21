# main.py

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect

from app.api.endpoints import alarm_parse_rules, auth, devices, classifications, pairings, plcs, time_tables, customers, products, users, data, dashboard
from app.auth import require_admin_user, require_authenticated_user
from app.database import SessionLocal, engine
from app.services import user_service

# MQTT クライアントは別プロセス (mqtt_worker.py) で管理されるため、
# FastAPI からは初期化しない


def ensure_initial_admin_user_exists() -> None:
    if not inspect(engine).has_table("users"):
        return

    session = SessionLocal()
    try:
        user_service.ensure_initial_admin_user(session)
    finally:
        session.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_initial_admin_user_exists()
    yield

app = FastAPI(
    title="miyazaki-scada-api",
    description="",
    version="0.0.1",
    debug=True,
    lifespan=lifespan,
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
app.include_router(auth.router)
app.include_router(pairings.router)
app.include_router(alarm_parse_rules.router, dependencies=[Depends(require_admin_user)])
app.include_router(classifications.router, dependencies=[Depends(require_admin_user)])
app.include_router(plcs.router, dependencies=[Depends(require_admin_user)])
app.include_router(time_tables.router)
app.include_router(customers.router, dependencies=[Depends(require_admin_user)])
app.include_router(products.router, dependencies=[Depends(require_admin_user)])
app.include_router(users.router, dependencies=[Depends(require_admin_user)])
app.include_router(data.router, dependencies=[Depends(require_authenticated_user)])
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Matsuo Miyazaki RTMS API! Documentation is available at https://localhost:8000/docs"}
