from __future__ import annotations

import logging
from datetime import date, datetime, timedelta
from typing import List, Optional

import httpx
import pytz

from ..celery_app import celery_app
from ..database import SessionLocal

logger = logging.getLogger(__name__)

TZ = pytz.timezone("Asia/Tokyo")


def _build_request_body(connector_type: str, records: list) -> dict:
    """connector_type に応じたリクエストボディを生成する。
    将来の型追加時はここに新しい elif ブランチを追加するだけでよい。
    """
    if connector_type == "aggregated_data":
        return {
            "records": [
                {
                    "started_at": row[0],
                    "ended_at": row[1],
                    "good_qty": row[2],
                    "ng_qty": row[3],
                }
                for row in records
            ],
            "on_duplicate": "append",
        }
    raise ValueError(f"Unknown connector_type: {connector_type}")


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_connector_data(self, connector_id: int, manual: bool = False):
    """コネクタ設定に従い外部APIへデータを送信する。

    manual=True の場合は直近 initial_sync_days 日分を送信（接続テスト兼用）。
    manual=False の場合は直前の send_interval_minutes 分間を送信（定期自動送信）。
    """
    from ..crud import device_connectors as connector_crud
    from ..services import data_service

    db = SessionLocal()
    try:
        connector = connector_crud.get_connector(db, connector_id)
        if connector is None:
            logger.warning("send_connector_data: connector %s not found, skipping.", connector_id)
            return

        now_utc = datetime.utcnow()
        now_local = datetime.now(TZ)

        if manual:
            # 手動実行: 直近 initial_sync_days 日分
            start_date = (now_local - timedelta(days=connector.initial_sync_days)).date()
            end_date = now_local.date()
        else:
            # 定期自動送信: 直前の send_interval_minutes 分間
            start_dt = now_local - timedelta(minutes=connector.send_interval_minutes)
            start_date = start_dt.date()
            end_date = now_local.date()

        records = data_service.get_aggregated_data(
            db,
            device_id=connector.device_id,
            start_date=start_date,
            end_date=end_date,
            interval_minutes=connector.send_interval_minutes,
        )

        if not records:
            logger.info(
                "send_connector_data: no records for connector %s (%s ~ %s), skipping POST.",
                connector_id,
                start_date,
                end_date,
            )
            connector_crud.update_last_sent_at(db, connector_id, now_utc)
            return

        body = _build_request_body(connector.connector_type, records)

        with httpx.Client(timeout=30) as client:
            response = client.post(
                connector.url,
                json=body,
                headers={
                    connector.api_key_header: connector.api_key_value,
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()

        connector_crud.update_last_sent_at(db, connector_id, now_utc)
        logger.info(
            "send_connector_data: connector %s sent %d records (status %s).",
            connector_id,
            len(records),
            response.status_code,
        )

    except httpx.HTTPStatusError as exc:
        logger.error(
            "send_connector_data: HTTP error for connector %s: %s %s",
            connector_id,
            exc.response.status_code,
            exc.response.text[:200],
        )
        raise self.retry(exc=exc)
    except httpx.RequestError as exc:
        logger.error("send_connector_data: request error for connector %s: %s", connector_id, exc)
        raise self.retry(exc=exc)
    except Exception as exc:
        logger.exception("send_connector_data: unexpected error for connector %s", connector_id)
        raise
    finally:
        db.close()


@celery_app.task
def check_and_dispatch_connectors():
    """有効な全コネクタを確認し、送信タスクをキューに投入する。
    Celery Beat から毎分呼び出される。各コネクタの send_interval_minutes は
    Beat スケジュール側ではなくタスク内のウィンドウ計算で制御する。
    """
    from ..crud import device_connectors as connector_crud

    db = SessionLocal()
    try:
        connectors = connector_crud.get_all_enabled_connectors(db)
        now_utc = datetime.utcnow()

        for connector in connectors:
            if connector.last_sent_at is None:
                # 未送信: 即座にキュー投入
                send_connector_data.delay(connector.id, manual=False)
                continue

            elapsed = (now_utc - connector.last_sent_at).total_seconds() / 60
            if elapsed >= connector.send_interval_minutes:
                send_connector_data.delay(connector.id, manual=False)

    finally:
        db.close()
