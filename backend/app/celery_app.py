import os

from celery import Celery


def _get_redis_url() -> str:
    return os.getenv("RTMS_CELERY_BROKER_URL", os.getenv("RTMS_REDIS_URL", "redis://localhost:6379/0"))


celery_app = Celery(
    "rtms",
    broker=_get_redis_url(),
    backend=os.getenv("RTMS_CELERY_RESULT_BACKEND", _get_redis_url()),
    include=["app.tasks.device_action_tasks", "app.tasks.connector_tasks"],
)

celery_app.conf.update(
    task_track_started=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Tokyo",
    # デバイス操作ジョブはコネクタタスクとは独立したキューで処理する。
    # connector タスクのタイムアウト詰まりが device_action をブロックしないようにする。
    task_routes={
        "app.tasks.process_device_action_job": {"queue": "device_actions"},
        "app.tasks.connector_tasks.send_connector_data": {"queue": "celery"},
        "app.tasks.connector_tasks.check_and_dispatch_connectors": {"queue": "celery"},
    },
    beat_schedule={
        "check-and-dispatch-connectors": {
            "task": "app.tasks.connector_tasks.check_and_dispatch_connectors",
            "schedule": 60.0,  # 毎分実行
        },
    },
)