# main.py

import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect

from app.api.endpoints import alarm_parse_rules, auth, devices, classifications, pairings, plcs, time_tables, customers, products, users, data, dashboard
from app.auth import require_admin_user, require_authenticated_user
from app.database import SessionLocal, engine
from app.services import user_service

# MQTT の購読処理は別プロセス (mqtt_worker.py) で管理する。
# FastAPI 側は更新通知 publish のみを行い、常駐クライアントは持たない。


def get_debug_enabled() -> bool:
    return os.getenv("RTMS_DEBUG", "false").lower() in {"1", "true", "yes", "on"}


def get_cors_origins() -> list[str]:
    raw_origins = os.getenv("RTMS_CORS_ORIGINS", "*").strip()
    if not raw_origins:
        return ["*"]
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


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
    debug=get_debug_enabled(),
    lifespan=lifespan,
)

# CORSを許可するためのミドルウェア設定
# ルーターを含める前に追加します
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
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
